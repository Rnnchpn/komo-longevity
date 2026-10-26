-- KŌMØ commercial account ownership: attach a VERIFIED Supabase Auth email
-- only to contacts originating from authenticated Acuity reservations.
-- No clinical patient link is created by this function.
alter table public.komo_commercial_contacts
  add column if not exists pulse_user_id uuid references auth.users(id) on delete set null,
  add column if not exists booking_verified_at timestamptz,
  add column if not exists account_linked_at timestamptz;
alter table public.komo_commercial_contacts alter column created_by drop not null;
create index if not exists komo_commercial_contacts_pulse_user on public.komo_commercial_contacts(pulse_user_id,appointment_at);
drop policy if exists "commercial_contacts_select_scoped" on public.komo_commercial_contacts;
create policy "commercial_contacts_select_scoped" on public.komo_commercial_contacts for select to authenticated using (
  private.user_is_global_admin()
  or created_by = (select auth.uid())
  or assigned_user_id = (select auth.uid())
  or (pulse_user_id = (select auth.uid()) and booking_source='acuity')
);
-- Only verified, Acuity-origin bookings are claimable. A shared family email
-- with multiple distinct names is deliberately blocked for manual review.
create or replace function public.claim_my_komo_booking()
returns jsonb language plpgsql security definer set search_path=''
as $$
declare
  v_user uuid := auth.uid();
  v_email text;
  v_count integer;
  v_names integer;
begin
  if v_user is null then raise exception 'authentication_required'; end if;
  select lower(btrim(email)) into v_email
    from auth.users where id=v_user and email_confirmed_at is not null and is_anonymous=false;
  if v_email is null then raise exception 'verified_email_required'; end if;

  select count(*),count(distinct(lower(btrim(first_name))||'|'||lower(btrim(last_name))))
    into v_count,v_names
  from public.komo_commercial_contacts
  where lower(btrim(email))=v_email and booking_source='acuity'
    and acuity_appointment_id is not null and booking_verified_at is not null
    and journey_status<>'annule';
  if v_names>1 then
    return jsonb_build_object('status','manual_review','bookings',0);
  end if;
  if v_count=0 then return jsonb_build_object('status','pending_booking','bookings',0); end if;

  -- Disallow taking a record already claimed by another authenticated user.
  if exists (
    select 1 from public.komo_commercial_contacts
    where lower(btrim(email))=v_email and booking_source='acuity'
      and booking_verified_at is not null and journey_status<>'annule'
      and pulse_user_id is not null and pulse_user_id<>v_user
  ) then
    return jsonb_build_object('status','manual_review','bookings',0);
  end if;

  update public.komo_commercial_contacts
    set pulse_user_id=v_user,
        account_linked_at=coalesce(account_linked_at,now()),
        updated_at=now()
    where lower(btrim(email))=v_email and booking_source='acuity'
      and booking_verified_at is not null
      and journey_status<>'annule'
      and (pulse_user_id is null or pulse_user_id=v_user);
  get diagnostics v_count=row_count;
  return jsonb_build_object('status','linked','bookings',v_count);
end;$$;
revoke all on function public.claim_my_komo_booking() from public,anon;
grant execute on function public.claim_my_komo_booking() to authenticated;
comment on function public.claim_my_komo_booking() is 'Links confirmed Acuity commercial reservations to an email-verified authenticated person; never grants clinical access';

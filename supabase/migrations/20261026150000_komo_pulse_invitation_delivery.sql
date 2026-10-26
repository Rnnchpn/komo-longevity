-- KŌMØ branded transactional invitations (commercial booking data only).
-- Release of any clinical module remains independent.
alter table public.komo_commercial_contacts
  add column if not exists pulse_invitation_sent_at timestamptz,
  add column if not exists pulse_invitation_lease_at timestamptz,
  add column if not exists pulse_invitation_message_id text;
comment on column public.komo_commercial_contacts.pulse_invitation_sent_at
  is 'Timestamp of KŌMØ Pulse commercial welcome email accepted by transactional provider';
comment on column public.komo_commercial_contacts.pulse_invitation_lease_at
  is 'Short-lived claim preventing duplicate concurrent welcome sends';
create or replace function public.reserve_komo_pulse_invitation(p_booking_id bigint)
returns boolean language plpgsql security definer set search_path=''
as $$
declare reserved uuid;
begin
  if p_booking_id is null or p_booking_id <= 0 then return false; end if;
  update public.komo_commercial_contacts
  set pulse_invitation_lease_at = now(),updated_at=now()
  where acuity_appointment_id=p_booking_id
    and booking_source='acuity'
    and booking_verified_at is not null
    and journey_status='confirme'
    and email is not null
    and pulse_invitation_sent_at is null
    and (pulse_invitation_lease_at is null
      or pulse_invitation_lease_at < now()-interval '15 minutes')
  returning id into reserved;
  return reserved is not null;
end; $$;

create or replace function public.complete_komo_pulse_invitation(
  p_booking_id bigint,
  p_message_id text default null,
  p_sent boolean default false
)
returns boolean language plpgsql security definer set search_path=''
as $$
declare updated_id uuid;
begin
  if p_booking_id is null or p_booking_id<=0 then return false; end if;
  update public.komo_commercial_contacts
  set pulse_invitation_sent_at=case when p_sent then coalesce(pulse_invitation_sent_at,now()) else pulse_invitation_sent_at end,
      pulse_invitation_message_id=case when p_sent then left(p_message_id,150) else pulse_invitation_message_id end,
      pulse_invitation_lease_at=null,
      updated_at=now()
  where acuity_appointment_id=p_booking_id
    and booking_source='acuity'
    and pulse_invitation_lease_at is not null
    and (p_sent=false or (p_message_id is not null and length(p_message_id)>0))
  returning id into updated_id;
  return updated_id is not null;
end; $$;
revoke all on function public.reserve_komo_pulse_invitation(bigint) from public,anon,authenticated;
revoke all on function public.complete_komo_pulse_invitation(bigint,text,boolean) from public,anon,authenticated;
grant execute on function public.reserve_komo_pulse_invitation(bigint) to service_role;
grant execute on function public.complete_komo_pulse_invitation(bigint,text,boolean) to service_role;

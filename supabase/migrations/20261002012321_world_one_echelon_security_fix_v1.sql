-- KŌMØ World security follow-up: experience requests and event visibility enforcement.
create table if not exists public.world_experience_requests (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.world_experiences(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','accepted','declined','completed','cancelled')),
  note text,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(experience_id,user_id)
);
create index if not exists world_experience_requests_user_idx on public.world_experience_requests(user_id,status);
alter table public.world_experience_requests enable row level security;
grant select,insert,update on public.world_experience_requests to authenticated;

drop policy if exists world_event_attendance_self_insert on public.world_event_attendance;
create policy world_event_attendance_self_insert on public.world_event_attendance for insert to authenticated
with check (
  (select auth.uid())=user_id
  and public.komo_world_has_entitlement('event.member.rsvp')
  and exists(select 1 from public.world_events e where e.id=event_id)
);

create policy world_experience_requests_self_select on public.world_experience_requests for select to authenticated
using((select auth.uid())=user_id);
create policy world_experience_requests_self_insert on public.world_experience_requests for insert to authenticated
with check(
  (select auth.uid())=user_id
  and public.komo_world_has_entitlement('experience.book')
  and exists(select 1 from public.world_experiences e where e.id=experience_id)
);
create policy world_experience_requests_self_update on public.world_experience_requests for update to authenticated
using((select auth.uid())=user_id)
with check((select auth.uid())=user_id and status in ('requested','cancelled'));

create or replace function private.komo_grant_one_after_released_assessment()
returns trigger language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_user uuid;
begin
 if new.status<>'released' then return new; end if;
 select patient_user_id into v_user from public.patients where id=new.patient_id;
 if v_user is null then return new; end if;
 insert into public.world_memberships(user_id,tier,status,founding,source,source_assessment_id)
 values(v_user,'one','active',true,'assessment',new.id) on conflict(user_id) do nothing;
 return new;
end $$;
revoke all on function private.komo_grant_one_after_released_assessment() from public,anon,authenticated;

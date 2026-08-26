-- KŌMØ shared booking architecture v1
-- Applied to production on 2026-08-26. This file tracks the production schema.

create table if not exists public.organization_booking_services (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  service_type text not null check (service_type in ('motion','clinical')),
  enabled boolean not null default true,
  duration_minutes integer not null default 30 check (duration_minutes = 30),
  booking_horizon_days integer not null default 60 check (booking_horizon_days between 1 and 365),
  min_notice_hours integer not null default 12 check (min_notice_hours between 0 and 336),
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  primary key (organization_id,service_type)
);
create table if not exists public.organization_booking_hours (
  id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),start_time time not null,end_time time not null,enabled boolean not null default true,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(end_time>start_time),unique(organization_id,weekday,start_time,end_time)
);
create table if not exists public.organization_booking_blackouts (
  id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id) on delete cascade,
  starts_at timestamptz not null,ends_at timestamptz not null,reason text,created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),check(ends_at>starts_at)
);
alter table public.organization_appointments add column if not exists booking_source text not null default 'professional';
alter table public.organization_appointments add column if not exists booked_by_user_id uuid references auth.users(id) on delete set null;
alter table public.patient_service_requests add column if not exists scheduled_at timestamptz;
create unique index if not exists organization_appointments_provider_slot_active_uq on public.organization_appointments(assigned_user_id,scheduled_start) where assigned_user_id is not null and status in ('scheduled','confirmed','arrived','in_progress');
create unique index if not exists organization_appointments_patient_slot_active_uq on public.organization_appointments(patient_id,scheduled_start) where status in ('scheduled','confirmed','arrived','in_progress');
create index if not exists organization_appointments_org_start_idx on public.organization_appointments(organization_id,scheduled_start);

create or replace function public.komo_booking_centers() returns table(id uuid,name text,timezone text,motion_enabled boolean,clinical_enabled boolean)
language sql security definer set search_path=public,private as $$
select o.id,o.name,o.timezone,
 exists(select 1 from public.organization_booking_services s where s.organization_id=o.id and s.service_type='motion' and s.enabled),
 exists(select 1 from public.organization_booking_services s where s.organization_id=o.id and s.service_type='clinical' and s.enabled)
from public.organizations o where o.status='active' and exists(select 1 from public.organization_booking_services s where s.organization_id=o.id and s.enabled) order by o.name;
$$;
revoke all on function public.komo_booking_centers() from public;grant execute on function public.komo_booking_centers() to authenticated;

create or replace function public.komo_booking_slots(p_organization_id uuid,p_service text,p_start_date date,p_days integer default 7)
returns table(slot_start timestamptz,slot_end timestamptz,available_capacity integer)
language sql security definer set search_path=public,private,auth as $$
with org as (
 select o.id,o.timezone,s.duration_minutes,s.booking_horizon_days,s.min_notice_hours from public.organizations o join public.organization_booking_services s on s.organization_id=o.id and s.service_type=p_service and s.enabled where o.id=p_organization_id and o.status='active' and p_service in ('motion','clinical')
),eligible as (
 select m.user_id from public.organization_members m,org where m.organization_id=org.id and m.status='active' and ((p_service='motion' and m.role in ('owner','clinical_admin','physician','operator','coordinator') and m.access_scope in ('motion','clinical')) or (p_service='clinical' and m.role in ('owner','clinical_admin','physician') and m.access_scope='clinical'))
),local_days as (select gs::date d from generate_series(p_start_date,p_start_date+greatest(0,least(p_days,31)-1),interval '1 day') gs),
raw_slots as (
 select ((ld.d+h.start_time) at time zone org.timezone)+x.i*interval '30 minutes' ss,((ld.d+h.start_time) at time zone org.timezone)+(x.i+1)*interval '30 minutes' se
 from org join local_days ld on true join public.organization_booking_hours h on h.organization_id=org.id and h.weekday=extract(isodow from ld.d)::int and h.enabled cross join lateral generate_series(0,greatest(0,(extract(epoch from(h.end_time-h.start_time))/1800)::int-1)) x(i)
 where ld.d<=(current_date+org.booking_horizon_days)
),filtered as (
 select r.ss,r.se from raw_slots r,org where r.ss>=now()+org.min_notice_hours*interval '1 hour' and not exists(select 1 from public.organization_booking_blackouts b where b.organization_id=org.id and tstzrange(b.starts_at,b.ends_at,'[)')&&tstzrange(r.ss,r.se,'[)'))
),caps as (
 select f.ss,f.se,(select count(*) from eligible e where not exists(select 1 from public.organization_appointments a where a.organization_id=p_organization_id and a.assigned_user_id=e.user_id and a.status in ('scheduled','confirmed','arrived','in_progress') and tstzrange(a.scheduled_start,a.scheduled_end,'[)')&&tstzrange(f.ss,f.se,'[)')))::int cap from filtered f
)
select ss,se,cap from caps where cap>0 order by ss;
$$;
revoke all on function public.komo_booking_slots(uuid,text,date,integer) from public;grant execute on function public.komo_booking_slots(uuid,text,date,integer) to authenticated;

-- book_komo_appointment and cancel_my_komo_appointment are transactional SECURITY DEFINER RPCs in production.
-- They create/find the center patient record, choose an eligible free professional, insert a 30-minute appointment,
-- synchronize patient_service_requests and therefore the patient_care_assignments bridge, and prevent double booking.

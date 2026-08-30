-- KŌMØ Pulse RC1 functional stabilization
-- 1) Never expose zero-capacity booking slots and honor the configured service duration.
-- 2) Keep patient service requests synchronized when a patient cancels.
-- 3) Use the registered Clinical protocol version when opening a Clinical episode.

create or replace function public.komo_booking_slots(
  p_organization_id uuid,
  p_service text,
  p_start_date date,
  p_days integer default 7
)
returns table(slot_start timestamptz, slot_end timestamptz, available_capacity integer)
language sql
security definer
set search_path to 'public','private','auth'
as $function$
with org as (
  select o.id,o.timezone,s.duration_minutes,s.booking_horizon_days,s.min_notice_hours
  from public.organizations o
  join public.organization_booking_services s
    on s.organization_id=o.id and s.service_type=p_service and s.enabled
  where o.id=p_organization_id
    and o.status='active'
    and o.booking_published
    and p_service in ('motion','clinical')
), eligible as (
  select m.user_id
  from public.organization_members m,org
  where m.organization_id=org.id
    and m.status='active'
    and (
      (p_service='motion' and m.role in ('owner','clinical_admin','physician','operator','coordinator') and m.access_scope in ('motion','clinical'))
      or
      (p_service='clinical' and m.role in ('owner','clinical_admin','physician') and m.access_scope='clinical')
    )
), local_days as (
  select gs::date d
  from generate_series(
    p_start_date,
    p_start_date+greatest(0,least(p_days,31)-1),
    interval '1 day'
  ) gs
), raw_slots as (
  select
    ((ld.d+h.start_time) at time zone org.timezone)+x.i*interval '30 minutes' as ss,
    ((ld.d+h.start_time) at time zone org.timezone)+x.i*interval '30 minutes' + org.duration_minutes*interval '1 minute' as se
  from org
  join local_days ld on true
  join public.organization_booking_hours h
    on h.organization_id=org.id
   and h.weekday=extract(isodow from ld.d)::int
   and h.enabled
  cross join lateral generate_series(
    0,
    floor((extract(epoch from (h.end_time-h.start_time)) - org.duration_minutes*60)/1800)::int
  ) x(i)
  where ld.d <= current_date+org.booking_horizon_days
    and extract(epoch from (h.end_time-h.start_time)) >= org.duration_minutes*60
), filtered as (
  select r.ss,r.se
  from raw_slots r,org
  where r.ss>=now()+org.min_notice_hours*interval '1 hour'
    and not exists(
      select 1
      from public.organization_booking_blackouts b
      where b.organization_id=org.id
        and tstzrange(b.starts_at,b.ends_at,'[)') && tstzrange(r.ss,r.se,'[)')
    )
), caps as (
  select f.ss,f.se,
    (
      select count(*)
      from eligible e
      where not exists(
        select 1
        from public.organization_appointments a
        where a.organization_id=p_organization_id
          and a.assigned_user_id=e.user_id
          and a.status in ('scheduled','confirmed','arrived','in_progress')
          and tstzrange(a.scheduled_start,a.scheduled_end,'[)') && tstzrange(f.ss,f.se,'[)')
      )
    )::int cap
  from filtered f
)
select ss,se,cap
from caps
where cap>0
order by ss;
$function$;

create or replace function public.cancel_my_komo_appointment(p_appointment_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid:=auth.uid();
  a public.organization_appointments%rowtype;
begin
  if uid is null then raise exception 'unauthorized'; end if;

  select a0.* into a
  from public.organization_appointments a0
  join public.patients p on p.id=a0.patient_id
  where a0.id=p_appointment_id
    and p.patient_user_id=uid;

  if a.id is null then raise exception 'not_found'; end if;
  if a.scheduled_start <= now() then raise exception 'cannot_cancel_past'; end if;

  update public.organization_appointments
  set status='cancelled',updated_at=now()
  where id=a.id;

  update public.patient_service_requests
  set status='cancelled',updated_at=now()
  where patient_id=a.patient_id
    and service=a.appointment_type
    and scheduled_at=a.scheduled_start
    and status in ('submitted','assigned','accepted','scheduled');

  return true;
end;
$function$;

create or replace function public.ensure_clinical_appointment_episode(p_appointment_id uuid)
returns uuid
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid:=auth.uid();
  a public.organization_appointments%rowtype;
  pid public.patients%rowtype;
  aid uuid;
  patient_owner boolean:=false;
  staff_allowed boolean:=false;
  clinician uuid;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  select * into a from public.organization_appointments where id=p_appointment_id and appointment_type='clinical';
  if a.id is null then raise exception 'clinical_appointment_not_found'; end if;
  if a.status not in ('scheduled','confirmed','arrived','in_progress','completed') then raise exception 'clinical_appointment_not_active'; end if;
  select * into pid from public.patients where id=a.patient_id;
  patient_owner := pid.patient_user_id=uid;
  staff_allowed := private.user_is_global_admin() or private.user_has_org_role(a.organization_id,array['owner','clinical_admin','physician','coordinator']::text[]);
  if not patient_owner and not staff_allowed then raise exception 'forbidden'; end if;
  if patient_owner and not staff_allowed and a.status not in ('confirmed','arrived','in_progress','completed') then raise exception 'appointment_not_validated'; end if;

  clinician:=a.assigned_user_id;
  select id into aid
  from public.assessments
  where patient_id=a.patient_id
    and product_mode='clinical'
    and scheduled_at=a.scheduled_start
    and status<>'cancelled'
  order by created_at desc
  limit 1;

  if aid is null then
    insert into public.assessments(patient_id,product_mode,assessment_type,status,protocol_version,scheduled_at,clinician_id,created_by)
    values(a.patient_id,'clinical','baseline','scheduled','clinical-v0.4',a.scheduled_start,clinician,uid)
    returning id into aid;
  end if;

  insert into public.questionnaire_sessions(assessment_id,instrument_code,instrument_version,status,score_status,completeness,created_by)
  values(aid,'KOMO_CLINICAL_PREP','1.0','not_started','not_scored',0,uid)
  on conflict(assessment_id,instrument_code,instrument_version) do nothing;
  return aid;
end;
$function$;

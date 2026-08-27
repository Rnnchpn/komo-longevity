create or replace function public.book_komo_appointment(p_organization_id uuid, p_service text, p_slot_start timestamptz)
returns uuid
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid:=auth.uid();
  prof uuid;
  pid uuid;
  appt uuid;
  prof_role text;
  prof_scope text;
  org_status text;
  pr public.profiles%rowtype;
  em text;
  duration_min int;
  slot_ok boolean;
  req_id uuid;
  aid uuid;
  patient_sex text;
  assignment_role text;
begin
  if uid is null then raise exception 'unauthorized'; end if;
  if p_service not in ('motion','clinical') then raise exception 'invalid_service'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text||'|'||p_slot_start::text||'|'||p_service,0));

  select exists(
    select 1 from public.komo_booking_slots(
      p_organization_id,p_service,
      (p_slot_start at time zone coalesce((select timezone from public.organizations where id=p_organization_id),'Europe/Paris'))::date,2
    ) s where s.slot_start=p_slot_start
  ),bs.duration_minutes,o.clinical_data_status
  into slot_ok,duration_min,org_status
  from public.organization_booking_services bs
  join public.organizations o on o.id=bs.organization_id
  where bs.organization_id=p_organization_id
    and bs.service_type=p_service
    and bs.enabled
    and o.status='active'
    and o.booking_published;

  if not coalesce(slot_ok,false) then raise exception 'slot_unavailable'; end if;
  if org_status not in ('test_only','production_enabled') then raise exception 'center_data_status_unavailable'; end if;

  select * into pr from public.profiles where id=uid;
  if pr.first_name is null or pr.last_name is null or pr.birth_date is null then raise exception 'profile_incomplete'; end if;
  patient_sex:=case when pr.sex_at_birth='female' then 'female' when pr.sex_at_birth='male' then 'male' else 'not_stated' end;
  select email into em from auth.users where id=uid;

  select m.user_id,m.role,m.access_scope into prof,prof_role,prof_scope
  from public.organization_members m
  where m.organization_id=p_organization_id and m.status='active'
    and (
      (p_service='motion' and m.role in ('owner','clinical_admin','physician','operator','coordinator') and m.access_scope in ('motion','clinical'))
      or (p_service='clinical' and m.role in ('owner','clinical_admin','physician') and m.access_scope='clinical')
    )
    and not exists(
      select 1 from public.organization_appointments a
      where a.assigned_user_id=m.user_id
        and a.status in ('scheduled','confirmed','arrived','in_progress')
        and tstzrange(a.scheduled_start,a.scheduled_end,'[)') && tstzrange(p_slot_start,p_slot_start+duration_min*interval '1 minute','[)')
    )
  order by case
    when p_service='motion' and m.role='operator' then 1
    when p_service='motion' and m.role='physician' then 2
    when m.role='owner' then 3
    when m.role='clinical_admin' then 4
    when m.role='physician' then 5
    when m.role='operator' then 6
    else 7 end,m.user_id
  limit 1;
  if prof is null then raise exception 'slot_unavailable'; end if;

  select id into pid from public.patients
  where organization_id=p_organization_id and patient_user_id=uid
  order by created_at limit 1;

  if pid is null then
    insert into public.patients(
      organization_id,patient_user_id,external_reference,first_name,last_name,preferred_name,birth_date,sex_at_birth,email,phone,locale,status,created_by,
      data_classification,synthetic_attested_at,synthetic_attested_by
    ) values(
      p_organization_id,uid,'PULSE-'||substr(uid::text,1,8)||'-'||substr(gen_random_uuid()::text,1,6),pr.first_name,pr.last_name,nullif(pr.display_name,''),pr.birth_date,
      patient_sex,em,pr.phone,pr.locale,'active',uid,
      case when org_status='test_only' then 'synthetic' else 'health_data' end,
      case when org_status='test_only' then now() else null end,
      case when org_status='test_only' then uid else null end
    ) returning id into pid;
  end if;

  assignment_role:=case prof_role
    when 'physician' then 'clinical_practitioner'
    when 'operator' then 'motion_operator'
    when 'coordinator' then 'coordinator'
    else 'primary' end;

  insert into public.patient_care_assignments(
    organization_id,patient_id,professional_user_id,assignment_role,access_scope,status,source,assigned_by,assigned_at
  ) values(
    p_organization_id,pid,prof,assignment_role,
    case when prof_scope='clinical' then 'clinical' else 'motion' end,
    'active','appointment',uid,now()
  ) on conflict (patient_id,professional_user_id) where status='active' do nothing;

  select id,assessment_id into req_id,aid
  from public.patient_service_requests
  where user_id=uid and service=p_service and status in ('submitted','assigned','accepted','scheduled')
  order by submitted_at desc limit 1;

  if p_service='motion' and aid is null then
    insert into public.assessments(
      patient_id,product_mode,assessment_type,status,protocol_version,scheduled_at,operator_id,created_by
    ) values(
      pid,'motion','baseline','scheduled','motion-v0.4',p_slot_start,prof,uid
    ) returning id into aid;

    insert into public.questionnaire_sessions(
      assessment_id,instrument_code,instrument_version,status,score_status,created_by
    ) values(aid,'KOMO_BASELINE_CORE','0.1','not_started','not_scored',uid);

    insert into public.audit_events(
      organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail
    ) values(
      p_organization_id,pid,aid,uid,'assessment_created','assessment',aid::text,
      jsonb_build_object('product_mode','motion','assessment_type','baseline','protocol_version','motion-v0.4','source','patient_booking','scheduled_at',p_slot_start,'assigned_professional_user_id',prof)
    );
  end if;

  insert into public.organization_appointments(
    organization_id,patient_id,assigned_user_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,service_code,payment_status,intake_status,created_by,booking_source,booked_by_user_id
  ) values(
    p_organization_id,pid,prof,p_service,p_slot_start,p_slot_start+duration_min*interval '1 minute','confirmed','in_person',
    case when p_service='motion' then 'KOMO_MOTION' else 'KOMO_CLINICAL' end,'unpaid','not_sent',uid,'patient',uid
  ) returning id into appt;

  if req_id is null then
    insert into public.patient_service_requests(
      user_id,service,status,assigned_organization_id,assigned_professional_user_id,patient_id,assessment_id,submitted_at,assigned_at,accepted_at,scheduled_at
    ) values(
      uid,p_service,'scheduled',p_organization_id,prof,pid,aid,now(),now(),now(),p_slot_start
    ) returning id into req_id;
  else
    update public.patient_service_requests
    set status='scheduled',assigned_organization_id=p_organization_id,assigned_professional_user_id=prof,patient_id=pid,assessment_id=coalesce(aid,assessment_id),
        assigned_at=coalesce(assigned_at,now()),accepted_at=coalesce(accepted_at,now()),scheduled_at=p_slot_start,updated_at=now()
    where id=req_id;
  end if;

  insert into public.audit_events(
    organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail
  ) values(
    p_organization_id,pid,aid,uid,'appointment_booked','organization_appointment',appt::text,
    jsonb_build_object('service',p_service,'scheduled_start',p_slot_start,'assigned_professional_user_id',prof,'request_id',req_id,'source','patient')
  );

  return appt;
exception when unique_violation then
  raise exception 'slot_unavailable';
end;
$function$;

insert into public.organization_booking_services(organization_id,service_type,enabled,duration_minutes,booking_horizon_days,min_notice_hours)
select o.id,'motion',true,30,60,12
from public.organizations o
where o.name='Myodev' and o.status='active'
  and exists(select 1 from public.organization_members m where m.organization_id=o.id and m.status='active' and m.access_scope in ('motion','clinical'))
  and not exists(select 1 from public.organization_booking_services s where s.organization_id=o.id and s.service_type='motion');

insert into public.organization_booking_hours(organization_id,weekday,start_time,end_time,enabled)
select o.id,d.weekday,'09:00'::time,'18:00'::time,true
from public.organizations o
cross join (values (1),(2),(3),(4),(5)) as d(weekday)
where o.name='Myodev' and o.status='active'
  and exists(select 1 from public.organization_booking_services s where s.organization_id=o.id and s.service_type='motion' and s.enabled)
  and not exists(select 1 from public.organization_booking_hours h where h.organization_id=o.id and h.weekday=d.weekday);

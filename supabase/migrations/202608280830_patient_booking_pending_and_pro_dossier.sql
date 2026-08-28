-- Canonical KŌMØ booking workflow for field testing:
-- patient request -> scheduled/pending -> professional approval -> confirmed.

create or replace function public.book_komo_appointment(p_organization_id uuid, p_service text, p_slot_start timestamptz)
returns uuid
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid:=auth.uid(); prof uuid; pid uuid; appt uuid; prof_role text; prof_scope text;
  org_status text; pr public.profiles%rowtype; em text; duration_min int; slot_ok boolean;
  req_id uuid; aid uuid; patient_sex text; assignment_role text;
begin
  if uid is null then raise exception 'unauthorized'; end if;
  if p_service not in ('motion','clinical') then raise exception 'invalid_service'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text||'|'||p_slot_start::text||'|'||p_service,0));
  select exists(select 1 from public.komo_booking_slots(p_organization_id,p_service,(p_slot_start at time zone coalesce((select timezone from public.organizations where id=p_organization_id),'Europe/Paris'))::date,2) s where s.slot_start=p_slot_start),bs.duration_minutes,o.clinical_data_status
  into slot_ok,duration_min,org_status
  from public.organization_booking_services bs join public.organizations o on o.id=bs.organization_id
  where bs.organization_id=p_organization_id and bs.service_type=p_service and bs.enabled and o.status='active' and o.booking_published;
  if not coalesce(slot_ok,false) then raise exception 'slot_unavailable'; end if;
  if org_status not in ('test_only','production_enabled') then raise exception 'center_data_status_unavailable'; end if;
  select * into pr from public.profiles where id=uid;
  if pr.first_name is null or pr.last_name is null or pr.birth_date is null then raise exception 'profile_incomplete'; end if;
  patient_sex:=case when pr.sex_at_birth='female' then 'female' when pr.sex_at_birth='male' then 'male' else 'not_stated' end;
  select email into em from auth.users where id=uid;
  select m.user_id,m.role,m.access_scope into prof,prof_role,prof_scope from public.organization_members m
  where m.organization_id=p_organization_id and m.status='active'
    and ((p_service='motion' and m.role in ('owner','clinical_admin','physician','operator','coordinator') and m.access_scope in ('motion','clinical')) or (p_service='clinical' and m.role in ('owner','clinical_admin','physician') and m.access_scope='clinical'))
    and not exists(select 1 from public.organization_appointments a where a.assigned_user_id=m.user_id and a.status in ('scheduled','confirmed','arrived','in_progress') and tstzrange(a.scheduled_start,a.scheduled_end,'[)') && tstzrange(p_slot_start,p_slot_start+duration_min*interval '1 minute','[)'))
  order by case when p_service='motion' and m.role='operator' then 1 when p_service='motion' and m.role='physician' then 2 when m.role='owner' then 3 when m.role='clinical_admin' then 4 when m.role='physician' then 5 when m.role='operator' then 6 else 7 end,m.user_id limit 1;
  if prof is null then raise exception 'slot_unavailable'; end if;
  select id into pid from public.patients where organization_id=p_organization_id and patient_user_id=uid order by created_at limit 1;
  if pid is null then
    insert into public.patients(organization_id,patient_user_id,external_reference,first_name,last_name,preferred_name,birth_date,sex_at_birth,email,phone,locale,status,created_by,data_classification,synthetic_attested_at,synthetic_attested_by)
    values(p_organization_id,uid,'PULSE-'||substr(uid::text,1,8)||'-'||substr(gen_random_uuid()::text,1,6),pr.first_name,pr.last_name,nullif(pr.display_name,''),pr.birth_date,patient_sex,em,pr.phone,pr.locale,'active',uid,case when org_status='test_only' then 'synthetic' else 'health_data' end,case when org_status='test_only' then now() else null end,case when org_status='test_only' then uid else null end) returning id into pid;
  end if;
  assignment_role:=case prof_role when 'physician' then 'clinical_practitioner' when 'operator' then 'motion_operator' when 'coordinator' then 'coordinator' else 'primary' end;
  insert into public.patient_care_assignments(organization_id,patient_id,professional_user_id,assignment_role,access_scope,status,source,assigned_by,assigned_at)
  values(p_organization_id,pid,prof,assignment_role,case when prof_scope='clinical' then 'clinical' else 'motion' end,'active','appointment',uid,now())
  on conflict (patient_id,professional_user_id) where status='active' do nothing;
  select id,assessment_id into req_id,aid from public.patient_service_requests
  where user_id=uid and service=p_service and status in ('submitted','assigned','accepted') and (assigned_organization_id is null or assigned_organization_id=p_organization_id)
  order by submitted_at desc limit 1;
  if p_service='motion' and (aid is null or not exists(select 1 from public.assessments ax where ax.id=aid and ax.patient_id=pid)) then
    insert into public.assessments(patient_id,product_mode,assessment_type,status,protocol_version,scheduled_at,operator_id,created_by)
    values(pid,'motion','baseline','scheduled','motion-v0.5',p_slot_start,prof,uid) returning id into aid;
    insert into public.questionnaire_sessions(assessment_id,instrument_code,instrument_version,status,score_status,created_by)
    select aid,r.code,r.version,'not_started','not_scored',uid from public.instrument_registry r
    where r.code in ('KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY') and r.can_render=true
    on conflict (assessment_id,instrument_code,instrument_version) do nothing;
    perform private.bridge_start_to_motion_assessment(aid);
  end if;
  insert into public.organization_appointments(organization_id,patient_id,assigned_user_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,service_code,payment_status,intake_status,created_by,booking_source,booked_by_user_id)
  values(p_organization_id,pid,prof,p_service,p_slot_start,p_slot_start+duration_min*interval '1 minute','scheduled','in_person',case when p_service='motion' then 'KOMO_MOTION' else 'KOMO_CLINICAL' end,'unpaid','not_sent',uid,'patient',uid) returning id into appt;
  if req_id is null then
    insert into public.patient_service_requests(user_id,service,status,assigned_organization_id,assigned_professional_user_id,patient_id,assessment_id,submitted_at,assigned_at,scheduled_at)
    values(uid,p_service,'assigned',p_organization_id,prof,pid,aid,now(),now(),p_slot_start) returning id into req_id;
  else
    update public.patient_service_requests set status='assigned',assigned_organization_id=p_organization_id,assigned_professional_user_id=prof,patient_id=pid,assessment_id=aid,assigned_at=coalesce(assigned_at,now()),accepted_at=null,scheduled_at=p_slot_start,updated_at=now() where id=req_id;
  end if;
  insert into public.audit_events(organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail)
  values(p_organization_id,pid,aid,uid,'appointment_requested','organization_appointment',appt::text,jsonb_build_object('service',p_service,'scheduled_start',p_slot_start,'assigned_professional_user_id',prof,'request_id',req_id,'source','patient','status','scheduled'));
  return appt;
exception when unique_violation then raise exception 'slot_unavailable';
end;
$function$;

create or replace function public.komo_professional_patient_dossier(p_patient_id uuid)
returns jsonb language plpgsql security definer set search_path to 'public','private','auth'
as $function$
declare
  uid uuid:=auth.uid(); p public.patients%rowtype; free_row public.pulse_assessments%rowtype; motion_row public.assessments%rowtype; score_row public.scores%rowtype;
  sva_value numeric; org_name text; q_sessions jsonb:='[]'::jsonb; appts jsonb:='[]'::jsonb; imports jsonb:='[]'::jsonb;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  select * into p from public.patients where id=p_patient_id;
  if p.id is null then raise exception 'patient_not_found'; end if;
  if not (private.user_is_global_admin() or private.user_has_org_role(p.organization_id,array['owner','clinical_admin','physician','operator','coordinator']::text[])) then raise exception 'patient_access_denied'; end if;
  select name into org_name from public.organizations where id=p.organization_id;
  if p.patient_user_id is not null then select * into free_row from public.pulse_assessments where user_id=p.patient_user_id and protocol_version='mobility-check-v1' order by updated_at desc limit 1; end if;
  select * into motion_row from public.assessments where patient_id=p.id and product_mode='motion' and status<>'cancelled' order by created_at desc limit 1;
  if motion_row.id is not null then
    select * into score_row from public.scores where assessment_id=motion_row.id order by calculated_at desc limit 1;
    select numeric_value into sva_value from public.measurements where assessment_id=motion_row.id and indicator_code='M-POS-02' and qc_status='valid' order by recorded_at desc limit 1;
    select coalesce(jsonb_agg(jsonb_build_object('instrument_code',instrument_code,'status',status,'score',score,'score_status',score_status,'completeness',completeness,'completed_at',completed_at) order by created_at),'[]'::jsonb) into q_sessions from public.questionnaire_sessions where assessment_id=motion_row.id;
    select coalesce(jsonb_agg(jsonb_build_object('id',id,'source_file_name',source_file_name,'source_product',source_product,'source_version',source_version,'status',status,'approved_at',approved_at,'recorded_at',recorded_at,'created_at',created_at) order by created_at desc),'[]'::jsonb) into imports from public.myodev_imports where assessment_id=motion_row.id;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'appointment_type',appointment_type,'scheduled_start',scheduled_start,'scheduled_end',scheduled_end,'status',status,'organization_id',organization_id) order by scheduled_start desc),'[]'::jsonb) into appts from public.organization_appointments where patient_id=p.id and status<>'cancelled';
  return jsonb_build_object('patient',jsonb_build_object('id',p.id,'patient_user_id',p.patient_user_id,'first_name',p.first_name,'last_name',p.last_name,'preferred_name',p.preferred_name,'birth_date',p.birth_date,'email',p.email,'external_reference',p.external_reference,'organization_id',p.organization_id,'organization_name',org_name),'start',case when free_row.id is null then null else jsonb_build_object('id',free_row.id,'status',free_row.status,'responses',free_row.responses,'result_summary',free_row.result_summary,'completed_at',free_row.completed_at,'updated_at',free_row.updated_at) end,'motion',case when motion_row.id is null then null else jsonb_build_object('id',motion_row.id,'status',motion_row.status,'protocol_version',motion_row.protocol_version,'scheduled_at',motion_row.scheduled_at,'completeness',motion_row.completeness,'created_at',motion_row.created_at) end,'score',case when score_row.id is null then null else jsonb_build_object('id',score_row.id,'motion_score',score_row.motion_score,'domain_scores',score_row.domain_scores,'confidence',score_row.confidence,'release_status',score_row.release_status,'calculated_at',score_row.calculated_at) end,'sva_mm',sva_value,'questionnaires',q_sessions,'appointments',appts,'myocare_imports',imports);
end;
$function$;

create or replace function public.save_komo_motion_sva(p_assessment_id uuid,p_sva_mm numeric)
returns jsonb language plpgsql security definer set search_path to 'public','private','auth'
as $function$
declare uid uuid:=auth.uid(); a public.assessments%rowtype; p public.patients%rowtype; mid uuid;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if p_sva_mm is null or p_sva_mm < -300 or p_sva_mm > 500 then raise exception 'invalid_sva_value'; end if;
  select * into a from public.assessments where id=p_assessment_id and product_mode='motion'; if a.id is null then raise exception 'motion_assessment_not_found'; end if;
  select * into p from public.patients where id=a.patient_id;
  if not (private.user_is_global_admin() or private.user_has_org_role(p.organization_id,array['owner','clinical_admin','physician','operator','coordinator']::text[])) then raise exception 'assessment_access_denied'; end if;
  if a.status in ('validated','released','archived') then raise exception 'assessment_locked'; end if;
  insert into public.measurements(assessment_id,indicator_code,product_status,raw_value,numeric_value,unit,source,protocol_version,qc_status,recorded_at,recorded_by,source_reference)
  values(a.id,'M-POS-02','M1',to_jsonb(p_sva_mm),p_sva_mm,'mm','operator',coalesce(a.protocol_version,'motion-v0.5'),'valid',now(),uid,'pro-patient-dossier/manual-entry') returning id into mid;
  insert into public.audit_events(organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail)
  values(p.organization_id,p.id,a.id,uid,'motion.sva_saved','measurement',mid::text,jsonb_build_object('sva_mm',p_sva_mm,'source','pro_patient_dossier'));
  return jsonb_build_object('measurement_id',mid,'assessment_id',a.id,'sva_mm',p_sva_mm);
end;
$function$;

grant execute on function public.komo_professional_patient_dossier(uuid) to authenticated;
grant execute on function public.save_komo_motion_sva(uuid,numeric) to authenticated;

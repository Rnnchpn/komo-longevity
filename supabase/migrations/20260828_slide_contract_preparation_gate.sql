create or replace function public.ensure_motion_appointment_episode(p_appointment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid:=auth.uid();
  appt public.organization_appointments%rowtype;
  aid uuid;
  patient_owner boolean:=false;
  staff_allowed boolean:=false;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  select * into appt from public.organization_appointments where id=p_appointment_id;
  if appt.id is null then raise exception 'appointment_not_found'; end if;
  if appt.appointment_type<>'motion' then raise exception 'motion_appointment_required'; end if;
  if appt.status not in ('scheduled','confirmed','arrived','in_progress','completed') then raise exception 'appointment_not_active'; end if;

  select exists(select 1 from public.patients p where p.id=appt.patient_id and p.patient_user_id=uid) into patient_owner;
  staff_allowed := private.user_is_global_admin() or private.user_has_org_role(appt.organization_id,array['owner','clinical_admin','physician','operator','coordinator']::text[]);
  if not patient_owner and not staff_allowed then raise exception 'appointment_access_required'; end if;
  if patient_owner and not staff_allowed and appt.status not in ('confirmed','arrived','in_progress','completed') then raise exception 'appointment_not_validated'; end if;

  aid:=private.ensure_motion_episode_for_appointment(p_appointment_id);
  return jsonb_build_object('appointmentId',p_appointment_id,'assessmentId',aid,'status',appt.status);
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
  select id into aid from public.assessments where patient_id=a.patient_id and product_mode='clinical' and scheduled_at=a.scheduled_start and status<>'cancelled' order by created_at desc limit 1;
  if aid is null then
    insert into public.assessments(patient_id,product_mode,assessment_type,status,protocol_version,scheduled_at,clinician_id,created_by)
    values(a.patient_id,'clinical','baseline','scheduled','clinical-v0.1',a.scheduled_start,clinician,uid)
    returning id into aid;
  end if;
  insert into public.questionnaire_sessions(assessment_id,instrument_code,instrument_version,status,score_status,completeness,created_by)
  values(aid,'KOMO_CLINICAL_PREP','1.0','not_started','not_scored',0,uid)
  on conflict(assessment_id,instrument_code,instrument_version) do nothing;
  return aid;
end;
$function$;

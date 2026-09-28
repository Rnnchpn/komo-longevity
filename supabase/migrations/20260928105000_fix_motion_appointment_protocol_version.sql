-- Fix Motion appointment episode creation: use the protocol version that
-- actually exists in protocol_versions. Verified E2E on 2026-09-28.
create or replace function private.ensure_motion_episode_for_appointment(p_appointment_id uuid)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  appt public.organization_appointments%rowtype;
  aid uuid;
  creator uuid;
  mem_role text;
  mem_scope text;
  assignment_role text;
begin
  select * into appt from public.organization_appointments where id=p_appointment_id;
  if appt.id is null then return null; end if;
  if appt.appointment_type <> 'motion' or appt.status in ('cancelled','no_show') then return null; end if;

  select a.id into aid
  from public.assessments a
  where a.patient_id=appt.patient_id and a.product_mode='motion' and a.scheduled_at=appt.scheduled_start and a.status<>'cancelled'
  order by a.created_at desc limit 1;

  creator:=coalesce(appt.booked_by_user_id,appt.created_by,appt.assigned_user_id);
  if creator is null then select patient_user_id into creator from public.patients where id=appt.patient_id; end if;

  if aid is null then
    insert into public.assessments(patient_id,product_mode,assessment_type,status,protocol_version,scheduled_at,operator_id,created_by)
    values(appt.patient_id,'motion','baseline','scheduled','motion-v0.5',appt.scheduled_start,appt.assigned_user_id,creator)
    returning id into aid;
    insert into public.audit_events(organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail)
    values(appt.organization_id,appt.patient_id,aid,creator,'assessment_created','assessment',aid::text,jsonb_build_object('source','appointment_reconciliation','appointment_id',appt.id,'protocol_version','motion-v0.5'));
  end if;

  insert into public.questionnaire_sessions(assessment_id,instrument_code,instrument_version,status,score_status,created_by)
  select aid,r.code,r.version,'not_started','not_scored',creator
  from public.instrument_registry r
  where r.code in ('KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY') and r.can_render=true
  on conflict (assessment_id,instrument_code,instrument_version) do nothing;

  perform private.bridge_start_to_motion_assessment(aid);

  update public.patient_service_requests
  set assessment_id=aid,
      assigned_organization_id=appt.organization_id,
      assigned_professional_user_id=coalesce(assigned_professional_user_id,appt.assigned_user_id),
      patient_id=appt.patient_id,
      scheduled_at=appt.scheduled_start,
      updated_at=now()
  where patient_id=appt.patient_id and service='motion' and status in ('submitted','assigned','accepted','scheduled')
    and assigned_organization_id=appt.organization_id
    and scheduled_at=appt.scheduled_start;

  if appt.assigned_user_id is not null then
    select role,access_scope into mem_role,mem_scope
    from public.organization_members
    where organization_id=appt.organization_id and user_id=appt.assigned_user_id and status='active'
    limit 1;
    if mem_role is not null then
      assignment_role:=case mem_role when 'physician' then 'clinical_practitioner' when 'operator' then 'motion_operator' when 'coordinator' then 'coordinator' else 'primary' end;
      insert into public.patient_care_assignments(organization_id,patient_id,professional_user_id,assignment_role,access_scope,status,source,assigned_by,assigned_at)
      values(appt.organization_id,appt.patient_id,appt.assigned_user_id,assignment_role,case when mem_scope='clinical' then 'clinical' else 'motion' end,'active','appointment',creator,now())
      on conflict (patient_id,professional_user_id) where status='active' do nothing;
    end if;
  end if;

  perform private.sync_motion_intake_status(aid);
  update public.organization_appointments
  set intake_due_at=coalesce(intake_due_at,appt.scheduled_start-interval '2 hours'),updated_at=now()
  where id=appt.id;
  return aid;
end;
$function$;

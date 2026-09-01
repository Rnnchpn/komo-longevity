create or replace function public.komo_motion_display_assessment(p_patient_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $$
declare
  uid uuid := auth.uid();
  target_patient public.patients%rowtype;
  scope_patient_ids uuid[] := '{}';
  chosen_assessment public.assessments%rowtype;
  chosen_score public.scores%rowtype;
  chosen_assessment_id uuid;
  chosen_score_id uuid;
  source_value text := 'current';
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if p_patient_id is null then
    select coalesce(array_agg(p.id),'{}'::uuid[]) into scope_patient_ids
    from public.patients p where p.patient_user_id=uid;
  else
    select * into target_patient from public.patients where id=p_patient_id;
    if target_patient.id is null then raise exception 'patient_not_found'; end if;
    if not (
      target_patient.patient_user_id=uid
      or private.user_is_global_admin()
      or private.user_has_org_role(target_patient.organization_id,array['owner','clinical_admin','physician','operator','coordinator']::text[])
      or exists(select 1 from public.organization_appointments oa where oa.patient_id=target_patient.id and oa.assigned_user_id=uid and oa.status<>'cancelled')
      or exists(select 1 from public.patient_care_assignments ca where ca.patient_id=target_patient.id and ca.professional_user_id=uid and ca.status='active')
    ) then raise exception 'patient_access_denied'; end if;
    scope_patient_ids := array[target_patient.id];
  end if;
  if cardinality(scope_patient_ids)=0 then return null; end if;

  select a.id,s.id into chosen_assessment_id,chosen_score_id
  from public.scores s join public.assessments a on a.id=s.assessment_id
  where a.patient_id=any(scope_patient_ids) and a.product_mode='motion'
    and s.profile_code='motion_integrated' and s.release_status='released' and s.motion_score is not null
  order by coalesce(s.released_at,s.calculated_at) desc limit 1;

  if chosen_assessment_id is not null then source_value := 'released';
  else
    select a.id,s.id into chosen_assessment_id,chosen_score_id
    from public.scores s join public.assessments a on a.id=s.assessment_id
    where a.patient_id=any(scope_patient_ids) and a.product_mode='motion'
      and s.profile_code='motion_integrated' and s.release_status<>'superseded' and s.motion_score is not null
    order by s.calculated_at desc limit 1;
    if chosen_assessment_id is not null then source_value := 'scored'; end if;
  end if;

  if chosen_assessment_id is null then
    select a.id into chosen_assessment_id from public.assessments a
    where a.patient_id=any(scope_patient_ids) and a.product_mode='motion' and a.status<>'cancelled'
    order by a.created_at desc limit 1;
    chosen_score_id := null;
    source_value := 'current';
  end if;
  if chosen_assessment_id is null then return null; end if;

  select * into chosen_assessment from public.assessments where id=chosen_assessment_id;
  if chosen_score_id is not null then select * into chosen_score from public.scores where id=chosen_score_id; end if;

  return jsonb_build_object(
    'patientId',chosen_assessment.patient_id,'assessmentId',chosen_assessment.id,
    'assessmentStatus',chosen_assessment.status,'scoreId',chosen_score.id,'score',chosen_score.motion_score,
    'scoreStatus',chosen_score.status,'releaseStatus',chosen_score.release_status,
    'algorithmVersion',chosen_score.algorithm_version,'source',source_value
  );
end;
$$;
revoke all on function public.komo_motion_display_assessment(uuid) from public;
revoke all on function public.komo_motion_display_assessment(uuid) from anon;
grant execute on function public.komo_motion_display_assessment(uuid) to authenticated;

create or replace function public.komo_result_assessment_detail(p_assessment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $$
declare
  uid uuid := auth.uid();
  a public.assessments%rowtype;
  p public.patients%rowtype;
  s public.scores%rowtype;
  q_sessions jsonb := '[]'::jsonb;
  measurements_json jsonb := '[]'::jsonb;
  metrics_json jsonb := '[]'::jsonb;
  imports_json jsonb := '[]'::jsonb;
  can_access boolean := false;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  select * into a from public.assessments where id=p_assessment_id;
  if a.id is null then raise exception 'assessment_not_found'; end if;
  select * into p from public.patients where id=a.patient_id;
  can_access := (p.patient_user_id=uid)
    or private.user_is_global_admin()
    or private.user_has_org_role(p.organization_id,array['owner','clinical_admin','physician','operator','coordinator']::text[])
    or exists(select 1 from public.organization_appointments oa where oa.patient_id=p.id and oa.assigned_user_id=uid and oa.status<>'cancelled')
    or exists(select 1 from public.patient_care_assignments ca where ca.patient_id=p.id and ca.professional_user_id=uid and ca.status='active');
  if not can_access then raise exception 'assessment_access_denied'; end if;

  select * into s from public.scores
  where assessment_id=a.id and profile_code='motion_integrated' and release_status<>'superseded'
  order by calculated_at desc limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',qs.id,'instrument_code',qs.instrument_code,'instrument_version',qs.instrument_version,
    'status',qs.status,'score',qs.score,'score_status',qs.score_status,'completeness',qs.completeness,
    'started_at',qs.started_at,'completed_at',qs.completed_at,'responses',coalesce((
      select jsonb_agg(jsonb_build_object(
        'item_code',qr.item_code,'response_code',qr.response_code,'raw_value',qr.raw_value,
        'normalized_value',qr.normalized_value,'source',qr.source,'clinician_verified',qr.clinician_verified,
        'completed_at',qr.completed_at
      ) order by qr.item_code) from public.questionnaire_responses qr where qr.questionnaire_session_id=qs.id
    ),'[]'::jsonb)
  ) order by qs.created_at),'[]'::jsonb) into q_sessions
  from public.questionnaire_sessions qs where qs.assessment_id=a.id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',m.id,'indicator_code',m.indicator_code,'product_status',m.product_status,'raw_value',m.raw_value,
    'numeric_value',m.numeric_value,'text_value',m.text_value,'unit',m.unit,'source',m.source,
    'task_code',m.task_code,'muscle_code',m.muscle_code,'side',m.side,'protocol_version',m.protocol_version,
    'qc_status',m.qc_status,'qc_reason',m.qc_reason,'recorded_at',m.recorded_at,'source_reference',m.source_reference
  ) order by m.recorded_at,m.indicator_code),'[]'::jsonb) into measurements_json
  from public.measurements m where m.assessment_id=a.id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',mm.id,'myodev_import_id',mm.myodev_import_id,'task_code',mm.task_code,'trial_index',mm.trial_index,
    'muscle_code',mm.muscle_code,'side',mm.side,'phase_window',mm.phase_window,'metric_code',mm.metric_code,
    'value',mm.value,'unit',mm.unit,'directionality',mm.directionality,'qc_status',mm.qc_status,
    'qc_reason',mm.qc_reason,'protocol_version',mm.protocol_version,'calibration_id',mm.calibration_id,'created_at',mm.created_at
  ) order by mm.metric_code,mm.muscle_code,mm.side,mm.trial_index),'[]'::jsonb) into metrics_json
  from public.myodev_metrics mm where mm.assessment_id=a.id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',i.id,'external_session_id',i.external_session_id,'source_file_name',i.source_file_name,
    'source_product',i.source_product,'source_version',i.source_version,'contract_version',i.contract_version,
    'source_format',i.source_format,'import_hash',i.import_hash,'payload_manifest',i.payload_manifest,
    'device_set_id',i.device_set_id,'status',i.status,'warnings',i.warnings,'approved_at',i.approved_at,
    'recorded_at',i.recorded_at,'created_at',i.created_at
  ) order by i.created_at desc),'[]'::jsonb) into imports_json
  from public.myodev_imports i where i.assessment_id=a.id;

  return jsonb_build_object(
    'motion',jsonb_build_object(
      'id',a.id,'status',a.status,'protocol_version',a.protocol_version,'scheduled_at',a.scheduled_at,
      'completeness',a.completeness,'context_class',a.context_class,'measurement_context',a.measurement_context,
      'started_at',a.started_at,'completed_at',a.completed_at,'validated_at',a.validated_at,
      'released_at',a.released_at,'created_at',a.created_at
    ),
    'score',case when s.id is null then null else jsonb_build_object(
      'id',s.id,'profile_code',s.profile_code,'algorithm_version',s.algorithm_version,'reference_version',s.reference_version,
      'motion_score',s.motion_score,'domain_scores',s.domain_scores,'muscle_signature',s.muscle_signature,
      'input_manifest',s.input_manifest,'confidence',s.confidence,'confidence_label',s.confidence_label,
      'completeness',s.completeness,'context_class',s.context_class,'status',s.status,'release_status',s.release_status,
      'calculated_at',s.calculated_at,'reviewed_at',s.reviewed_at,'released_at',s.released_at
    ) end,
    'questionnaires',coalesce(q_sessions,'[]'::jsonb),'measurements',coalesce(measurements_json,'[]'::jsonb),
    'myodev_metrics',coalesce(metrics_json,'[]'::jsonb),'myocare_imports',coalesce(imports_json,'[]'::jsonb)
  );
end;
$$;
revoke all on function public.komo_result_assessment_detail(uuid) from public;
revoke all on function public.komo_result_assessment_detail(uuid) from anon;
grant execute on function public.komo_result_assessment_detail(uuid) to authenticated;

create or replace function public.validate_motion_consultation(p_appointment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  uid uuid:=(select auth.uid());
  appt public.organization_appointments%rowtype;
  aid uuid;
  sid uuid;
  rel text;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  select * into appt from public.organization_appointments where id=p_appointment_id;
  if appt.id is null then raise exception 'appointment_not_found'; end if;
  if appt.appointment_type<>'motion' then raise exception 'motion_appointment_required'; end if;
  if not (private.user_is_global_admin() or private.user_has_org_role(appt.organization_id,array['owner','clinical_admin','physician']::text[])) then
    raise exception 'clinical_review_role_required';
  end if;
  aid:=private.ensure_motion_episode_for_appointment(p_appointment_id);
  select id,release_status into sid,rel from public.scores
  where assessment_id=aid and profile_code='motion_integrated'
    and status in ('valid','provisional') and release_status<>'superseded'
  order by calculated_at desc limit 1;
  if sid is null then raise exception 'valid_motion_score_required'; end if;
  if rel='draft' then perform public.review_pulse_motion_score(sid,'review');
  elsif rel not in ('clinician_reviewed','released') then raise exception 'invalid_release_transition'; end if;
  update public.organization_appointments
    set status='completed',intake_status='reviewed',intake_reviewed_at=coalesce(intake_reviewed_at,now()),updated_at=now()
    where id=p_appointment_id;
  update public.patient_service_requests set status='completed',updated_at=now()
    where patient_id=appt.patient_id and service='motion' and assigned_organization_id=appt.organization_id
      and (assessment_id=aid or scheduled_at=appt.scheduled_start) and status not in ('declined','cancelled');
  insert into public.audit_events(organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail)
  values(appt.organization_id,appt.patient_id,aid,uid,'motion_consultation_validated','organization_appointment',p_appointment_id::text,
    jsonb_build_object('score_id',sid,'release_status_after_validation','clinician_reviewed'));
  return jsonb_build_object('appointmentId',p_appointment_id,'assessmentId',aid,'scoreId',sid,
    'consultationStatus','completed','releaseStatus',case when rel='released' then 'released' else 'clinician_reviewed' end);
end;
$$;

do $$
declare
  ddl text;
  old_expr text := 'v_hash := encode(digest(v_manifest::text,''sha256''),''hex'');';
  new_expr text := 'v_hash := encode(digest((v_manifest - ''calculated_at'')::text,''sha256''),''hex'');';
begin
  select pg_get_functiondef('public.calculate_motion_v05(uuid)'::regprocedure) into ddl;
  if position(old_expr in ddl)=0 and position(new_expr in ddl)=0 then raise exception 'calculate_motion_v05_hash_expression_not_found'; end if;
  if position(old_expr in ddl)>0 then ddl := replace(ddl,old_expr,new_expr); execute ddl; end if;
end;
$$;

create or replace function public.komo_professional_patient_dossier(p_patient_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid:=auth.uid();
  p public.patients%rowtype;
  free_row public.pulse_assessments%rowtype;
  motion_row public.assessments%rowtype;
  score_row public.scores%rowtype;
  org_name text;
  q_sessions jsonb:='[]'::jsonb;
  appts jsonb:='[]'::jsonb;
  imports jsonb:='[]'::jsonb;
  measurements_json jsonb:='[]'::jsonb;
  metrics_json jsonb:='[]'::jsonb;
  can_access boolean:=false;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  select * into p from public.patients where id=p_patient_id;
  if p.id is null then raise exception 'patient_not_found'; end if;
  can_access := private.user_is_global_admin()
    or private.user_has_org_role(p.organization_id,array['owner','clinical_admin','physician','operator','coordinator']::text[])
    or exists(select 1 from public.organization_appointments oa where oa.patient_id=p.id and oa.assigned_user_id=uid and oa.status<>'cancelled')
    or exists(select 1 from public.patient_care_assignments ca where ca.patient_id=p.id and ca.professional_user_id=uid and ca.status='active');
  if not can_access then raise exception 'patient_access_denied'; end if;
  select name into org_name from public.organizations where id=p.organization_id;
  if p.patient_user_id is not null then
    select * into free_row from public.pulse_assessments where user_id=p.patient_user_id and protocol_version='mobility-check-v1' order by updated_at desc limit 1;
  end if;
  select * into motion_row from public.assessments where patient_id=p.id and product_mode='motion' and status<>'cancelled' order by created_at desc limit 1;
  if motion_row.id is not null then
    select * into score_row from public.scores where assessment_id=motion_row.id order by calculated_at desc limit 1;
    select coalesce(jsonb_agg(jsonb_build_object(
      'id',qs.id,'instrument_code',qs.instrument_code,'instrument_version',qs.instrument_version,'status',qs.status,
      'score',qs.score,'score_status',qs.score_status,'completeness',qs.completeness,'started_at',qs.started_at,'completed_at',qs.completed_at,
      'responses',coalesce((select jsonb_agg(jsonb_build_object('item_code',qr.item_code,'response_code',qr.response_code,'raw_value',qr.raw_value,'normalized_value',qr.normalized_value,'source',qr.source,'clinician_verified',qr.clinician_verified,'completed_at',qr.completed_at) order by qr.item_code) from public.questionnaire_responses qr where qr.questionnaire_session_id=qs.id),'[]'::jsonb)
    ) order by qs.created_at),'[]'::jsonb) into q_sessions from public.questionnaire_sessions qs where qs.assessment_id=motion_row.id;
    select coalesce(jsonb_agg(jsonb_build_object(
      'id',m.id,'indicator_code',m.indicator_code,'product_status',m.product_status,'raw_value',m.raw_value,'numeric_value',m.numeric_value,'text_value',m.text_value,'unit',m.unit,'source',m.source,'task_code',m.task_code,'muscle_code',m.muscle_code,'side',m.side,'protocol_version',m.protocol_version,'qc_status',m.qc_status,'qc_reason',m.qc_reason,'recorded_at',m.recorded_at,'source_reference',m.source_reference
    ) order by m.recorded_at,m.indicator_code),'[]'::jsonb) into measurements_json from public.measurements m where m.assessment_id=motion_row.id;
    select coalesce(jsonb_agg(jsonb_build_object(
      'id',mm.id,'myodev_import_id',mm.myodev_import_id,'task_code',mm.task_code,'trial_index',mm.trial_index,'muscle_code',mm.muscle_code,'side',mm.side,'phase_window',mm.phase_window,'metric_code',mm.metric_code,'value',mm.value,'unit',mm.unit,'directionality',mm.directionality,'qc_status',mm.qc_status,'qc_reason',mm.qc_reason,'protocol_version',mm.protocol_version,'calibration_id',mm.calibration_id,'created_at',mm.created_at
    ) order by mm.metric_code,mm.muscle_code,mm.side,mm.trial_index),'[]'::jsonb) into metrics_json from public.myodev_metrics mm where mm.assessment_id=motion_row.id;
    select coalesce(jsonb_agg(jsonb_build_object(
      'id',i.id,'external_session_id',i.external_session_id,'source_file_name',i.source_file_name,'source_product',i.source_product,'source_version',i.source_version,'contract_version',i.contract_version,'source_format',i.source_format,'import_hash',i.import_hash,'payload_manifest',i.payload_manifest,'device_set_id',i.device_set_id,'status',i.status,'warnings',i.warnings,'approved_at',i.approved_at,'recorded_at',i.recorded_at,'created_at',i.created_at
    ) order by i.created_at desc),'[]'::jsonb) into imports from public.myodev_imports i where i.assessment_id=motion_row.id;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'appointment_type',appointment_type,'scheduled_start',scheduled_start,'scheduled_end',scheduled_end,'status',status,'organization_id',organization_id) order by scheduled_start desc),'[]'::jsonb) into appts from public.organization_appointments where patient_id=p.id and status<>'cancelled';
  return jsonb_build_object(
    'patient',jsonb_build_object('id',p.id,'patient_user_id',p.patient_user_id,'first_name',p.first_name,'last_name',p.last_name,'preferred_name',p.preferred_name,'birth_date',p.birth_date,'sex_at_birth',p.sex_at_birth,'email',p.email,'external_reference',p.external_reference,'organization_id',p.organization_id,'organization_name',org_name,'status',p.status,'data_classification',p.data_classification),
    'start',case when free_row.id is null then null else jsonb_build_object('id',free_row.id,'status',free_row.status,'responses',free_row.responses,'result_summary',free_row.result_summary,'completed_at',free_row.completed_at,'updated_at',free_row.updated_at) end,
    'motion',case when motion_row.id is null then null else jsonb_build_object('id',motion_row.id,'status',motion_row.status,'protocol_version',motion_row.protocol_version,'scheduled_at',motion_row.scheduled_at,'completeness',motion_row.completeness,'context_class',motion_row.context_class,'measurement_context',motion_row.measurement_context,'started_at',motion_row.started_at,'completed_at',motion_row.completed_at,'validated_at',motion_row.validated_at,'released_at',motion_row.released_at,'created_at',motion_row.created_at) end,
    'score',case when score_row.id is null then null else jsonb_build_object('id',score_row.id,'profile_code',score_row.profile_code,'algorithm_version',score_row.algorithm_version,'reference_version',score_row.reference_version,'motion_score',score_row.motion_score,'domain_scores',score_row.domain_scores,'muscle_signature',score_row.muscle_signature,'input_manifest',score_row.input_manifest,'confidence',score_row.confidence,'confidence_label',score_row.confidence_label,'completeness',score_row.completeness,'context_class',score_row.context_class,'status',score_row.status,'release_status',score_row.release_status,'calculated_at',score_row.calculated_at,'reviewed_at',score_row.reviewed_at,'released_at',score_row.released_at) end,
    'questionnaires',coalesce(q_sessions,'[]'::jsonb),'measurements',coalesce(measurements_json,'[]'::jsonb),'myodev_metrics',coalesce(metrics_json,'[]'::jsonb),'appointments',coalesce(appts,'[]'::jsonb),'myocare_imports',coalesce(imports,'[]'::jsonb),
    'availability',jsonb_build_object('patient_account',p.patient_user_id is not null,'start',free_row.id is not null,'motion',motion_row.id is not null,'score',score_row.id is not null,'questionnaire_detail',motion_row.id is not null,'clinical_measurements',motion_row.id is not null,'myodev_detail',motion_row.id is not null)
  );
end;
$function$;
grant execute on function public.komo_professional_patient_dossier(uuid) to authenticated;

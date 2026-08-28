create or replace function public.komo_professional_patient_dossier(p_patient_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $$
declare
  uid uuid:=auth.uid();
  p public.patients%rowtype;
  free_row public.pulse_assessments%rowtype;
  motion_row public.assessments%rowtype;
  score_row public.scores%rowtype;
  sva_value numeric;
  org_name text;
  q_sessions jsonb:='[]'::jsonb;
  appts jsonb:='[]'::jsonb;
  imports jsonb:='[]'::jsonb;
  can_access boolean:=false;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  select * into p from public.patients where id=p_patient_id;
  if p.id is null then raise exception 'patient_not_found'; end if;

  can_access := private.user_is_global_admin()
    or private.user_has_org_role(p.organization_id,array['owner','clinical_admin','physician','operator','coordinator']::text[])
    or exists(
      select 1 from public.organization_appointments oa
      where oa.patient_id=p.id and oa.assigned_user_id=uid and oa.status<>'cancelled'
    );

  if not can_access then raise exception 'patient_access_denied'; end if;

  select name into org_name from public.organizations where id=p.organization_id;

  if p.patient_user_id is not null then
    select * into free_row
    from public.pulse_assessments
    where user_id=p.patient_user_id and protocol_version='mobility-check-v1'
    order by updated_at desc limit 1;
  end if;

  select * into motion_row
  from public.assessments
  where patient_id=p.id and product_mode='motion' and status<>'cancelled'
  order by created_at desc limit 1;

  if motion_row.id is not null then
    select * into score_row from public.scores where assessment_id=motion_row.id order by calculated_at desc limit 1;
    select numeric_value into sva_value from public.measurements where assessment_id=motion_row.id and indicator_code='M-POS-02' and qc_status='valid' order by recorded_at desc limit 1;
    select coalesce(jsonb_agg(jsonb_build_object('instrument_code',instrument_code,'status',status,'score',score,'score_status',score_status,'completeness',completeness,'completed_at',completed_at) order by created_at),'[]'::jsonb)
      into q_sessions from public.questionnaire_sessions where assessment_id=motion_row.id;
    select coalesce(jsonb_agg(jsonb_build_object('id',id,'source_file_name',source_file_name,'source_product',source_product,'source_version',source_version,'status',status,'approved_at',approved_at,'recorded_at',recorded_at,'created_at',created_at) order by created_at desc),'[]'::jsonb)
      into imports from public.myodev_imports where assessment_id=motion_row.id;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('id',id,'appointment_type',appointment_type,'scheduled_start',scheduled_start,'scheduled_end',scheduled_end,'status',status,'organization_id',organization_id) order by scheduled_start desc),'[]'::jsonb)
    into appts from public.organization_appointments where patient_id=p.id and status<>'cancelled';

  return jsonb_build_object(
    'patient',jsonb_build_object('id',p.id,'patient_user_id',p.patient_user_id,'first_name',p.first_name,'last_name',p.last_name,'preferred_name',p.preferred_name,'birth_date',p.birth_date,'email',p.email,'external_reference',p.external_reference,'organization_id',p.organization_id,'organization_name',org_name,'status',p.status,'data_classification',p.data_classification),
    'start',case when free_row.id is null then null else jsonb_build_object('id',free_row.id,'status',free_row.status,'responses',free_row.responses,'result_summary',free_row.result_summary,'completed_at',free_row.completed_at,'updated_at',free_row.updated_at) end,
    'motion',case when motion_row.id is null then null else jsonb_build_object('id',motion_row.id,'status',motion_row.status,'protocol_version',motion_row.protocol_version,'scheduled_at',motion_row.scheduled_at,'completeness',motion_row.completeness,'created_at',motion_row.created_at) end,
    'score',case when score_row.id is null then null else jsonb_build_object('id',score_row.id,'motion_score',score_row.motion_score,'domain_scores',score_row.domain_scores,'confidence',score_row.confidence,'release_status',score_row.release_status,'calculated_at',score_row.calculated_at) end,
    'sva_mm',sva_value,
    'questionnaires',coalesce(q_sessions,'[]'::jsonb),
    'appointments',coalesce(appts,'[]'::jsonb),
    'myocare_imports',coalesce(imports,'[]'::jsonb),
    'availability',jsonb_build_object(
      'patient_account',p.patient_user_id is not null,
      'start',free_row.id is not null,
      'motion',motion_row.id is not null,
      'score',score_row.id is not null
    )
  );
end;
$$;

grant execute on function public.komo_professional_patient_dossier(uuid) to authenticated;

-- KŌMØ Pulse · attach an accepted MyoCare acquisition to another authorized Motion episode
-- Requires the exact same non-null patient_user_id and manage rights on source + target.

create or replace function public.list_compatible_myocare_imports(p_target_assessment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid := auth.uid();
  target_assessment public.assessments%rowtype;
  target_patient public.patients%rowtype;
  result jsonb;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if not private.user_can_manage_assessment(p_target_assessment_id) then raise exception 'assessment_access_denied'; end if;
  select * into target_assessment from public.assessments where id=p_target_assessment_id;
  if target_assessment.id is null or target_assessment.product_mode <> 'motion' then raise exception 'motion_assessment_required'; end if;
  select * into target_patient from public.patients where id=target_assessment.patient_id;
  if target_patient.patient_user_id is null then return '[]'::jsonb; end if;
  if exists(select 1 from public.myodev_imports where assessment_id=p_target_assessment_id and status='accepted') then return '[]'::jsonb; end if;

  select coalesce(jsonb_agg(x.obj order by x.created_at desc),'[]'::jsonb) into result
  from (
    select mi.created_at,
      jsonb_build_object('sourceImportId',mi.id,'sourceAssessmentId',sa.id,'sourceOrganization',o.name,
        'sourceFileName',mi.source_file_name,'contractVersion',mi.contract_version,'recordedAt',mi.recorded_at,
        'createdAt',mi.created_at,'metricCount',count(mm.id)) as obj
    from public.myodev_imports mi
    join public.assessments sa on sa.id=mi.assessment_id
    join public.patients sp on sp.id=sa.patient_id
    join public.organizations o on o.id=sp.organization_id
    left join public.myodev_metrics mm on mm.myodev_import_id=mi.id
    where mi.assessment_id<>p_target_assessment_id and mi.status='accepted'
      and mi.contract_version='myodev-contract-v0.2'
      and sp.patient_user_id=target_patient.patient_user_id
      and private.user_can_manage_assessment(sa.id)
    group by mi.id,sa.id,o.name
    having count(mm.id)>0
  ) x;
  return result;
end;
$function$;

grant execute on function public.list_compatible_myocare_imports(uuid) to authenticated;

create or replace function public.attach_compatible_myocare_import(p_target_assessment_id uuid,p_source_import_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid := auth.uid();
  target_assessment public.assessments%rowtype;
  source_assessment public.assessments%rowtype;
  target_patient public.patients%rowtype;
  source_patient public.patients%rowtype;
  source_import public.myodev_imports%rowtype;
  metric_count integer := 0;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if not private.user_can_manage_assessment(p_target_assessment_id) then raise exception 'target_assessment_access_denied'; end if;
  select * into target_assessment from public.assessments where id=p_target_assessment_id;
  if target_assessment.id is null or target_assessment.product_mode<>'motion' then raise exception 'motion_assessment_required'; end if;
  if target_assessment.status in ('validated','released','archived','cancelled') then raise exception 'target_assessment_locked'; end if;
  select * into target_patient from public.patients where id=target_assessment.patient_id;

  select * into source_import from public.myodev_imports where id=p_source_import_id;
  if source_import.id is null or source_import.status<>'accepted' then raise exception 'accepted_source_import_required'; end if;
  if source_import.contract_version<>'myodev-contract-v0.2' then raise exception 'compatible_contract_required'; end if;
  if source_import.assessment_id=p_target_assessment_id then raise exception 'import_already_attached'; end if;
  select * into source_assessment from public.assessments where id=source_import.assessment_id;
  if source_assessment.id is null then raise exception 'source_assessment_not_found'; end if;
  if not private.user_can_manage_assessment(source_assessment.id) then raise exception 'source_assessment_access_denied'; end if;
  select * into source_patient from public.patients where id=source_assessment.patient_id;

  if target_patient.patient_user_id is null or source_patient.patient_user_id is null or target_patient.patient_user_id<>source_patient.patient_user_id then raise exception 'patient_identity_mismatch'; end if;
  if exists(select 1 from public.myodev_imports where assessment_id=p_target_assessment_id and status='accepted') then raise exception 'target_already_has_myocare_import'; end if;
  select count(*) into metric_count from public.myodev_metrics where myodev_import_id=source_import.id;
  if metric_count=0 then raise exception 'source_import_has_no_metrics'; end if;

  update public.myodev_imports set assessment_id=p_target_assessment_id,
    payload_manifest=coalesce(payload_manifest,'{}'::jsonb) || jsonb_build_object('attached_from_assessment_id',source_assessment.id,'attached_to_assessment_id',target_assessment.id,'attached_at',now(),'attached_by',uid)
    where id=source_import.id;
  update public.myodev_metrics set assessment_id=p_target_assessment_id where myodev_import_id=source_import.id;
  update public.scores set release_status='superseded' where assessment_id=source_assessment.id and release_status in ('draft','clinician_reviewed');

  insert into public.audit_events(organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail,input_hash)
  values(source_patient.organization_id,source_patient.id,source_assessment.id,uid,'myodev_import_attached_out','myodev_import',source_import.id::text,
    jsonb_build_object('target_assessment_id',target_assessment.id,'target_organization_id',target_patient.organization_id,'metric_count',metric_count,'same_patient_user_id',true),source_import.import_hash);
  insert into public.audit_events(organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail,input_hash)
  values(target_patient.organization_id,target_patient.id,target_assessment.id,uid,'myodev_import_attached_in','myodev_import',source_import.id::text,
    jsonb_build_object('source_assessment_id',source_assessment.id,'source_organization_id',source_patient.organization_id,'metric_count',metric_count,'contract_version',source_import.contract_version,'same_patient_user_id',true),source_import.import_hash);

  return jsonb_build_object('importId',source_import.id,'targetAssessmentId',target_assessment.id,'sourceAssessmentId',source_assessment.id,'metricCount',metric_count,'contractVersion',source_import.contract_version);
end;
$function$;

grant execute on function public.attach_compatible_myocare_import(uuid,uuid) to authenticated;

-- KŌMØ Pulse — align official report persistence with the frozen Motion Report v2 payload.
-- Backward compatible with historical komo-report-payload-v1 snapshots.

create or replace function public.save_komo_report(
  p_patient_id uuid,
  p_assessment_id uuid,
  p_score_id uuid,
  p_payload jsonb,
  p_action text default 'draft'::text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'private', 'auth'
as $function$
declare
  uid uuid := auth.uid();
  p public.patients%rowtype;
  a public.assessments%rowtype;
  s public.scores%rowtype;
  r public.komo_reports%rowtype;
  version_value integer;
  status_value text;
  payload_value jsonb;
  payload_schema text;
  can_finalize boolean := false;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if p_action not in ('draft','validate','release') then raise exception 'invalid_report_action'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'report_payload_required'; end if;

  payload_schema := coalesce(p_payload->>'schemaVersion','');
  if payload_schema not in ('komo-report-payload-v1','komo-motion-report-payload-v2') then
    raise exception 'report_schema_version_invalid';
  end if;

  select * into p from public.patients where id=p_patient_id;
  if p.id is null then raise exception 'patient_not_found'; end if;
  can_finalize := private.user_is_global_admin()
    or private.user_has_org_role(p.organization_id,array['owner','clinical_admin','physician']::text[])
    or exists(select 1 from public.patient_care_assignments ca where ca.patient_id=p.id and ca.professional_user_id=uid and ca.status='active');
  if not can_finalize then raise exception 'report_access_denied'; end if;

  select * into a from public.assessments where id=p_assessment_id and patient_id=p_patient_id;
  if a.id is null then raise exception 'assessment_patient_mismatch'; end if;
  select * into s from public.scores where id=p_score_id and assessment_id=p_assessment_id;
  if s.id is null then raise exception 'score_assessment_mismatch'; end if;

  if nullif(p_payload#>>'{identity,patientId}','') is not null and (p_payload#>>'{identity,patientId}')::uuid <> p_patient_id then raise exception 'payload_patient_mismatch'; end if;
  if nullif(p_payload#>>'{identity,assessmentId}','') is not null and (p_payload#>>'{identity,assessmentId}')::uuid <> p_assessment_id then raise exception 'payload_assessment_mismatch'; end if;
  if nullif(p_payload#>>'{identity,scoreId}','') is not null and (p_payload#>>'{identity,scoreId}')::uuid <> p_score_id then raise exception 'payload_score_mismatch'; end if;
  if p_payload#>>'{summary,score}' is null then raise exception 'payload_score_missing'; end if;

  if p_action='validate' and coalesce(s.release_status,'draft') not in ('clinician_reviewed','released') then raise exception 'score_must_be_reviewed_first'; end if;
  if p_action='release' and coalesce(s.release_status,'draft') <> 'released' then raise exception 'score_must_be_released_first'; end if;

  select * into r
  from public.komo_reports kr
  where kr.assessment_id=p_assessment_id and kr.status<>'released'
  order by kr.version desc
  limit 1;

  if r.id is null then
    select coalesce(max(version),0)+1 into version_value from public.komo_reports where assessment_id=p_assessment_id;
    status_value := case p_action when 'release' then 'released' when 'validate' then 'validated' else 'draft' end;
    payload_value := jsonb_set(jsonb_set(p_payload,'{report,version}',to_jsonb(version_value),true),'{report,status}',to_jsonb(status_value),true);
    insert into public.komo_reports(
      patient_id,assessment_id,score_id,version,schema_version,status,payload,payload_hash,created_by,
      validated_by,validated_at,released_by,released_at,email_status
    ) values (
      p_patient_id,p_assessment_id,p_score_id,version_value,payload_schema,status_value,payload_value,md5(payload_value::text),uid,
      case when p_action in ('validate','release') then uid end,
      case when p_action in ('validate','release') then now() end,
      case when p_action='release' then uid end,
      case when p_action='release' then now() end,
      case when p_action='release' then 'pending' else 'not_sent' end
    ) returning * into r;
  else
    version_value := r.version;
    status_value := case p_action when 'release' then 'released' when 'validate' then 'validated' else r.status end;
    payload_value := jsonb_set(jsonb_set(p_payload,'{report,version}',to_jsonb(version_value),true),'{report,status}',to_jsonb(status_value),true);
    update public.komo_reports set
      score_id=p_score_id,
      schema_version=payload_schema,
      status=status_value,
      payload=payload_value,
      payload_hash=md5(payload_value::text),
      updated_at=now(),
      validated_by=case when p_action in ('validate','release') then uid else validated_by end,
      validated_at=case when p_action in ('validate','release') then coalesce(validated_at,now()) else validated_at end,
      released_by=case when p_action='release' then uid else released_by end,
      released_at=case when p_action='release' then now() else released_at end,
      email_status=case when p_action='release' then 'pending' else email_status end,
      email_error=case when p_action='release' then null else email_error end
    where id=r.id
    returning * into r;
  end if;

  return jsonb_build_object(
    'id',r.id,'patientId',r.patient_id,'assessmentId',r.assessment_id,'scoreId',r.score_id,
    'version',r.version,'schemaVersion',r.schema_version,'status',r.status,'payloadHash',r.payload_hash,
    'validatedAt',r.validated_at,'releasedAt',r.released_at,'emailStatus',r.email_status
  );
end;
$function$;

comment on function public.save_komo_report(uuid,uuid,uuid,jsonb,text)
is 'Persists KŌMØ reports; accepts legacy v1 and frozen Motion Report v2 payload schemas while preserving existing authorization and release gates.';

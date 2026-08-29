-- KŌMØ Pulse · official Mobility Report payload + versioned delivery workflow.
-- One immutable released payload is the source of truth for patient UI, PDF and email notification.

create table if not exists public.komo_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  score_id uuid references public.scores(id) on delete set null,
  version integer not null,
  schema_version text not null default 'komo-report-payload-v1',
  status text not null default 'draft' check (status in ('draft','validated','released')),
  payload jsonb not null,
  payload_hash text not null,
  created_by uuid not null,
  validated_by uuid,
  released_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  validated_at timestamptz,
  released_at timestamptz,
  email_status text not null default 'not_sent' check (email_status in ('not_sent','pending','sent','delivered','bounced','failed')),
  email_provider_id text,
  email_sent_at timestamptz,
  email_error text,
  patient_opened_at timestamptz,
  unique (assessment_id, version)
);

create index if not exists komo_reports_patient_released_idx on public.komo_reports(patient_id, released_at desc) where status='released';
create index if not exists komo_reports_assessment_idx on public.komo_reports(assessment_id, version desc);
alter table public.komo_reports enable row level security;
revoke all on table public.komo_reports from anon, authenticated;

create or replace function public.save_komo_report(
  p_patient_id uuid,
  p_assessment_id uuid,
  p_score_id uuid,
  p_payload jsonb,
  p_action text default 'draft'
)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
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
  can_finalize boolean := false;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if p_action not in ('draft','validate','release') then raise exception 'invalid_report_action'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'report_payload_required'; end if;
  if coalesce(p_payload->>'schemaVersion','') <> 'komo-report-payload-v1' then raise exception 'report_schema_version_invalid'; end if;

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
      p_patient_id,p_assessment_id,p_score_id,version_value,'komo-report-payload-v1',status_value,payload_value,md5(payload_value::text),uid,
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

grant execute on function public.save_komo_report(uuid,uuid,uuid,jsonb,text) to authenticated;

create or replace function public.komo_report_snapshot(p_patient_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid := auth.uid();
  p public.patients%rowtype;
  r public.komo_reports%rowtype;
  mode_value text := 'patient';
  can_access boolean := false;
begin
  if uid is null then raise exception 'authentication_required'; end if;

  if p_patient_id is null then
    select kr.* into r
    from public.komo_reports kr
    join public.patients px on px.id=kr.patient_id
    where px.patient_user_id=uid and kr.status='released'
    order by kr.released_at desc nulls last, kr.created_at desc
    limit 1;
    if r.id is null then return null; end if;
    select * into p from public.patients where id=r.patient_id;
    update public.komo_reports set patient_opened_at=coalesce(patient_opened_at,now()) where id=r.id;
    select * into r from public.komo_reports where id=r.id;
  else
    mode_value := 'professional';
    select * into p from public.patients where id=p_patient_id;
    if p.id is null then raise exception 'patient_not_found'; end if;
    can_access := private.user_is_global_admin()
      or private.user_has_org_role(p.organization_id,array['owner','clinical_admin','physician','operator','coordinator']::text[])
      or exists(select 1 from public.organization_appointments oa where oa.patient_id=p.id and oa.assigned_user_id=uid and oa.status<>'cancelled')
      or exists(select 1 from public.patient_care_assignments ca where ca.patient_id=p.id and ca.professional_user_id=uid and ca.status='active');
    if not can_access then raise exception 'report_access_denied'; end if;
    select * into r from public.komo_reports where patient_id=p_patient_id order by version desc, created_at desc limit 1;
    if r.id is null then return null; end if;
  end if;

  return jsonb_build_object(
    'mode',mode_value,'id',r.id,'patientId',r.patient_id,'assessmentId',r.assessment_id,'scoreId',r.score_id,
    'version',r.version,'schemaVersion',r.schema_version,'status',r.status,'payloadHash',r.payload_hash,'payload',r.payload,
    'createdAt',r.created_at,'updatedAt',r.updated_at,'validatedAt',r.validated_at,'releasedAt',r.released_at,
    'emailStatus',r.email_status,'emailProviderId',r.email_provider_id,'emailSentAt',r.email_sent_at,'patientOpenedAt',r.patient_opened_at,
    'patient',jsonb_build_object('id',p.id,'firstName',p.first_name,'lastName',p.last_name,'preferredName',p.preferred_name,'email',p.email,'patientUserId',p.patient_user_id)
  );
end;
$function$;

grant execute on function public.komo_report_snapshot(uuid) to authenticated;

create or replace function public.komo_mark_report_delivery(
  p_report_id uuid,
  p_status text,
  p_provider_id text default null,
  p_error text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid := auth.uid();
  r public.komo_reports%rowtype;
  p public.patients%rowtype;
  can_access boolean := false;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if p_status not in ('pending','sent','delivered','bounced','failed') then raise exception 'invalid_delivery_status'; end if;
  select * into r from public.komo_reports where id=p_report_id;
  if r.id is null then raise exception 'report_not_found'; end if;
  select * into p from public.patients where id=r.patient_id;
  can_access := private.user_is_global_admin()
    or private.user_has_org_role(p.organization_id,array['owner','clinical_admin','physician']::text[])
    or exists(select 1 from public.patient_care_assignments ca where ca.patient_id=p.id and ca.professional_user_id=uid and ca.status='active');
  if not can_access then raise exception 'report_access_denied'; end if;
  update public.komo_reports set
    email_status=p_status,
    email_provider_id=coalesce(p_provider_id,email_provider_id),
    email_sent_at=case when p_status in ('sent','delivered') then coalesce(email_sent_at,now()) else email_sent_at end,
    email_error=case when p_status='failed' then left(coalesce(p_error,'delivery_failed'),500) else null end,
    updated_at=now()
  where id=p_report_id
  returning * into r;
  return jsonb_build_object('id',r.id,'emailStatus',r.email_status,'emailProviderId',r.email_provider_id,'emailSentAt',r.email_sent_at);
end;
$function$;

grant execute on function public.komo_mark_report_delivery(uuid,text,text,text) to authenticated;

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
    select * into r
    from public.komo_reports
    where patient_id=p_patient_id
    order by coalesce(released_at,updated_at,created_at) desc, created_at desc
    limit 1;
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

revoke execute on function public.komo_report_snapshot(uuid) from public, anon;
grant execute on function public.komo_report_snapshot(uuid) to authenticated;

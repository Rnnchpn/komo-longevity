create or replace function public.komo_my_motion_consultations()
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := (select auth.uid());
  result jsonb;
begin
  if uid is null then raise exception 'authentication_required'; end if;

  select coalesce(jsonb_agg(item order by (item->>'scheduled_start')::timestamptz desc),'[]'::jsonb)
  into result
  from (
    select jsonb_build_object(
      'appointment_id',oa.id,
      'patient_id',p.id,
      'organization_id',oa.organization_id,
      'organization_name',coalesce(o.name,'Centre KŌMØ'),
      'timezone',coalesce(o.timezone,'Europe/Paris'),
      'scheduled_start',oa.scheduled_start,
      'scheduled_end',oa.scheduled_end,
      'appointment_status',oa.status,
      'assessment_id',a.id,
      'assessment_status',a.status,
      'pre_bilan_percent',coalesce(q.progress,0),
      'completed_sections',coalesce(q.completed_sections,0),
      'total_sections',6,
      'pre_bilan_complete',coalesce(q.completed_sections,0)=6
    ) as item
    from public.organization_appointments oa
    join public.patients p on p.id=oa.patient_id
    left join public.organizations o on o.id=oa.organization_id
    left join lateral (
      select aa.id,aa.status,aa.scheduled_at
      from public.assessments aa
      where aa.patient_id=p.id
        and aa.product_mode='motion'
        and aa.status<>'cancelled'
        and aa.scheduled_at is not null
        and abs(extract(epoch from (aa.scheduled_at-oa.scheduled_start))) <= 43200
      order by abs(extract(epoch from (aa.scheduled_at-oa.scheduled_start))) asc, aa.created_at desc
      limit 1
    ) a on true
    left join lateral (
      with codes(code) as (
        values ('KOMO_BASELINE_CORE'),('KOMO_MOBILITY_25'),('KOMO_SLEEP_RECOVERY'),('KOMO_WELLBEING'),('KOMO_LIFESTYLE'),('KOMO_HEALTH_HISTORY')
      ), sections as (
        select c.code,coalesce(qs.completeness,0)::numeric completeness,
               (qs.status='completed' or coalesce(qs.completeness,0)>=100) complete
        from codes c
        left join public.questionnaire_sessions qs on qs.assessment_id=a.id and qs.instrument_code=c.code
      )
      select round(sum(least(100,greatest(0,completeness)))/600*100)::int progress,
             count(*) filter (where complete)::int completed_sections
      from sections
    ) q on a.id is not null
    where p.patient_user_id=uid
      and oa.appointment_type='motion'
      and oa.status not in ('cancelled','no_show')
  ) x;
  return result;
end;
$function$;

create or replace function public.komo_my_motion_consultation_detail(p_assessment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid:=auth.uid();
  p public.patients%rowtype;
  a public.assessments%rowtype;
  ap public.organization_appointments%rowtype;
  q jsonb:='[]'::jsonb;
  sc jsonb:=null;
  im jsonb:='[]'::jsonb;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  select * into a from public.assessments where id=p_assessment_id and product_mode='motion' and status<>'cancelled';
  if a.id is null then raise exception 'assessment_not_found'; end if;
  select * into p from public.patients where id=a.patient_id and patient_user_id=uid;
  if p.id is null then raise exception 'assessment_access_denied'; end if;

  select * into ap
  from public.organization_appointments oa
  where oa.patient_id=p.id and oa.appointment_type='motion' and oa.status not in ('cancelled','no_show')
  order by case when a.scheduled_at is not null then abs(extract(epoch from (oa.scheduled_start-a.scheduled_at))) else abs(extract(epoch from (oa.scheduled_start-now()))) end asc
  limit 1;

  with codes(code,ord) as (values
    ('KOMO_BASELINE_CORE',1),('KOMO_MOBILITY_25',2),('KOMO_SLEEP_RECOVERY',3),('KOMO_WELLBEING',4),('KOMO_LIFESTYLE',5),('KOMO_HEALTH_HISTORY',6)
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'instrument_code',c.code,'status',coalesce(qs.status,'not_started'),'completeness',coalesce(qs.completeness,0),
    'score',qs.score,'score_status',qs.score_status,'started_at',qs.started_at,'completed_at',qs.completed_at
  ) order by c.ord),'[]'::jsonb)
  into q
  from codes c left join public.questionnaire_sessions qs on qs.assessment_id=a.id and qs.instrument_code=c.code;

  select to_jsonb(x) into sc from (
    select id,motion_score,domain_scores,status,release_status,confidence,confidence_label,completeness,calculated_at,released_at
    from public.scores where assessment_id=a.id order by calculated_at desc limit 1
  ) x;

  select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'status',i.status,'source_file_name',i.source_file_name,'recorded_at',i.recorded_at,'created_at',i.created_at) order by i.created_at desc),'[]'::jsonb)
  into im from public.myodev_imports i where i.assessment_id=a.id;

  return jsonb_build_object(
    'patient',jsonb_build_object('id',p.id,'first_name',p.first_name,'last_name',p.last_name,'preferred_name',p.preferred_name,'email',p.email),
    'appointment',case when ap.id is null then null else jsonb_build_object('id',ap.id,'scheduled_start',ap.scheduled_start,'scheduled_end',ap.scheduled_end,'status',ap.status,'organization_id',ap.organization_id) end,
    'motion',jsonb_build_object('id',a.id,'status',a.status,'protocol_version',a.protocol_version,'scheduled_at',a.scheduled_at,'started_at',a.started_at,'completed_at',a.completed_at),
    'questionnaires',q,'score',sc,'myocare_imports',im
  );
end;
$function$;

create or replace function public.komo_professional_motion_consultation(p_patient_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid:=auth.uid();
  p public.patients%rowtype;
  ap public.organization_appointments%rowtype;
  a public.assessments%rowtype;
  can_access boolean:=false;
  q jsonb:='[]'::jsonb;
  sc jsonb:=null;
  im jsonb:='[]'::jsonb;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  select * into p from public.patients where id=p_patient_id;
  if p.id is null then raise exception 'patient_not_found'; end if;
  can_access := private.user_is_global_admin()
    or private.user_has_org_role(p.organization_id,array['owner','clinical_admin','physician','operator','coordinator']::text[])
    or exists(select 1 from public.organization_appointments oa where oa.patient_id=p.id and oa.assigned_user_id=uid and oa.status<>'cancelled')
    or exists(select 1 from public.patient_care_assignments ca where ca.patient_id=p.id and ca.professional_user_id=uid and ca.status='active');
  if not can_access then raise exception 'patient_access_denied'; end if;

  select * into ap from public.organization_appointments oa
  where oa.patient_id=p.id and oa.appointment_type='motion' and oa.status not in ('cancelled','no_show')
  order by case oa.status when 'in_progress' then 0 when 'arrived' then 1 when 'confirmed' then 2 when 'scheduled' then 3 when 'completed' then 4 else 8 end,
           abs(extract(epoch from (oa.scheduled_start-now()))) asc
  limit 1;

  if ap.id is not null then
    select * into a from public.assessments aa
    where aa.patient_id=p.id and aa.product_mode='motion' and aa.status<>'cancelled' and aa.scheduled_at is not null
      and abs(extract(epoch from (aa.scheduled_at-ap.scheduled_start))) <= 43200
    order by abs(extract(epoch from (aa.scheduled_at-ap.scheduled_start))) asc, aa.created_at desc limit 1;
  end if;
  if a.id is null then
    select * into a from public.assessments aa where aa.patient_id=p.id and aa.product_mode='motion' and aa.status<>'cancelled' order by aa.created_at desc limit 1;
  end if;

  if a.id is not null then
    with codes(code,ord) as (values
      ('KOMO_BASELINE_CORE',1),('KOMO_MOBILITY_25',2),('KOMO_SLEEP_RECOVERY',3),('KOMO_WELLBEING',4),('KOMO_LIFESTYLE',5),('KOMO_HEALTH_HISTORY',6)
    )
    select coalesce(jsonb_agg(jsonb_build_object(
      'instrument_code',c.code,'status',coalesce(qs.status,'not_started'),'completeness',coalesce(qs.completeness,0),
      'score',qs.score,'score_status',qs.score_status,'started_at',qs.started_at,'completed_at',qs.completed_at
    ) order by c.ord),'[]'::jsonb)
    into q from codes c left join public.questionnaire_sessions qs on qs.assessment_id=a.id and qs.instrument_code=c.code;

    select to_jsonb(x) into sc from (
      select id,motion_score,domain_scores,status,release_status,confidence,confidence_label,completeness,calculated_at,released_at
      from public.scores where assessment_id=a.id order by calculated_at desc limit 1
    ) x;

    select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'status',i.status,'source_file_name',i.source_file_name,'recorded_at',i.recorded_at,'created_at',i.created_at) order by i.created_at desc),'[]'::jsonb)
    into im from public.myodev_imports i where i.assessment_id=a.id;
  end if;

  return jsonb_build_object(
    'patient',jsonb_build_object('id',p.id,'organization_id',p.organization_id,'first_name',p.first_name,'last_name',p.last_name,'preferred_name',p.preferred_name,'email',p.email,'external_reference',p.external_reference),
    'appointment',case when ap.id is null then null else jsonb_build_object('id',ap.id,'scheduled_start',ap.scheduled_start,'scheduled_end',ap.scheduled_end,'status',ap.status,'organization_id',ap.organization_id) end,
    'motion',case when a.id is null then null else jsonb_build_object('id',a.id,'status',a.status,'protocol_version',a.protocol_version,'scheduled_at',a.scheduled_at,'started_at',a.started_at,'completed_at',a.completed_at) end,
    'questionnaires',q,'score',sc,'myocare_imports',im
  );
end;
$function$;

grant execute on function public.komo_my_motion_consultation_detail(uuid) to authenticated;
grant execute on function public.komo_professional_motion_consultation(uuid) to authenticated;

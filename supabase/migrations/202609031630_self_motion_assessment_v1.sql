create or replace function public.komo_start_self_motion_assessment(p_organization_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid := auth.uid();
  account_role text;
  org public.organizations%rowtype;
  pr public.profiles%rowtype;
  pid uuid;
  aid uuid;
  em text;
  created_assessment boolean := false;
  code text;
  v text;
  total_sections integer := 0;
  completed_sections integer := 0;
begin
  if uid is null then raise exception 'unauthorized'; end if;

  select ar.role::text into account_role
  from public.account_roles ar
  where ar.user_id=uid;

  if coalesce(account_role,'member') <> 'admin'
     and not exists(
       select 1 from public.organization_members m
       where m.organization_id=p_organization_id
         and m.user_id=uid
         and m.status='active'
     ) then
    raise exception 'organization_access_required';
  end if;

  select * into org
  from public.organizations o
  where o.id=p_organization_id and o.status='active';
  if org.id is null then raise exception 'organization_unavailable'; end if;
  if org.clinical_data_status not in ('test_only','production_enabled') then
    raise exception 'center_data_status_unavailable';
  end if;

  select * into pr from public.profiles where id=uid;
  if pr.first_name is null or pr.last_name is null or pr.birth_date is null then
    raise exception 'profile_incomplete';
  end if;
  select email into em from auth.users where id=uid;

  select p.id into pid
  from public.patients p
  where p.organization_id=p_organization_id
    and p.patient_user_id=uid
    and p.status='active'
  order by p.updated_at desc, p.created_at desc
  limit 1;

  if pid is null then
    insert into public.patients(
      organization_id,patient_user_id,external_reference,
      first_name,last_name,preferred_name,birth_date,sex_at_birth,
      email,phone,locale,status,created_by,data_classification,
      synthetic_attested_at,synthetic_attested_by
    ) values(
      p_organization_id,uid,
      'PULSE-'||substr(uid::text,1,8)||'-'||substr(gen_random_uuid()::text,1,6),
      pr.first_name,pr.last_name,nullif(pr.display_name,''),pr.birth_date,
      case when pr.sex_at_birth='female' then 'female' when pr.sex_at_birth='male' then 'male' else 'not_stated' end,
      em,pr.phone,pr.locale,'active',uid,
      case when org.clinical_data_status='test_only' then 'synthetic' else 'health_data' end,
      case when org.clinical_data_status='test_only' then now() else null end,
      case when org.clinical_data_status='test_only' then uid else null end
    ) returning id into pid;
  end if;

  select a.id into aid
  from public.assessments a
  where a.patient_id=pid
    and a.product_mode='motion'
    and a.status in ('draft','scheduled','collecting','review')
  order by a.created_at desc
  limit 1;

  if aid is null then
    insert into public.assessments(
      patient_id,product_mode,assessment_type,status,protocol_version,
      started_at,created_by
    ) values(
      pid,'motion','baseline','collecting','motion-v0.5',now(),uid
    ) returning id into aid;
    created_assessment := true;
  end if;

  foreach code in array array[
    'KOMO_BASELINE_CORE',
    'KOMO_MOBILITY_25',
    'KOMO_SLEEP_RECOVERY',
    'KOMO_WELLBEING',
    'KOMO_LIFESTYLE',
    'KOMO_HEALTH_HISTORY'
  ] loop
    select ir.version into v
    from public.instrument_registry ir
    where ir.code=code and ir.can_render=true
    order by ir.updated_at desc
    limit 1;

    if v is not null and not exists(
      select 1 from public.questionnaire_sessions qs
      where qs.assessment_id=aid and qs.instrument_code=code
    ) then
      insert into public.questionnaire_sessions(
        assessment_id,instrument_code,instrument_version,status,score_status,completeness,created_by
      ) values(aid,code,v,'not_started','not_scored',0,uid);
    end if;
  end loop;

  select count(*), count(*) filter(where qs.status='completed' or qs.completeness>=100)
  into total_sections,completed_sections
  from public.questionnaire_sessions qs
  where qs.assessment_id=aid
    and qs.instrument_code in (
      'KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY',
      'KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'
    );

  return jsonb_build_object(
    'patient_id',pid,
    'assessment_id',aid,
    'created',created_assessment,
    'completed_sections',completed_sections,
    'total_sections',total_sections
  );
end;
$function$;

revoke all on function public.komo_start_self_motion_assessment(uuid) from public;
grant execute on function public.komo_start_self_motion_assessment(uuid) to authenticated;

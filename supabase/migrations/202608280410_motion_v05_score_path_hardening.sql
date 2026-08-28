create or replace function private.validate_komo_mobility_response()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_instrument text;
  v_value numeric;
begin
  select qs.instrument_code into v_instrument
  from public.questionnaire_sessions qs
  where qs.id=new.questionnaire_session_id;

  if v_instrument='KOMO_MOBILITY_25' then
    if new.raw_value is null or jsonb_typeof(new.raw_value)<>'number' then
      raise exception 'invalid_komo_mobility_response_type';
    end if;
    v_value := (new.raw_value #>> '{}')::numeric;
    if v_value < 0 or v_value > 4 or trunc(v_value) <> v_value then
      raise exception 'invalid_komo_mobility_response_range';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists questionnaire_responses_validate_komo_mobility on public.questionnaire_responses;
create trigger questionnaire_responses_validate_komo_mobility
before insert or update of raw_value,questionnaire_session_id,item_code
on public.questionnaire_responses
for each row execute function private.validate_komo_mobility_response();

create or replace function public.create_pulse_assessment(
  target_patient_id uuid,
  target_product_mode text default 'motion'::text,
  target_assessment_type text default 'baseline'::text,
  target_scheduled_at timestamptz default null,
  target_device_kit_id uuid default null
)
returns uuid
language plpgsql
set search_path to ''
as $$
declare
  actor_id uuid := (select auth.uid());
  selected_protocol text;
  new_assessment_id uuid;
  target_organization_id uuid;
  target_data_classification text;
  parent_motion_id uuid;
begin
  if actor_id is null then raise exception 'authentication_required'; end if;

  select p.organization_id,p.data_classification
  into target_organization_id,target_data_classification
  from public.patients p where p.id=target_patient_id;

  if target_organization_id is null or not private.user_can_manage_patient(target_patient_id) then
    raise exception 'patient_assignment_required';
  end if;
  if target_product_mode='clinical' and not private.user_can_clinically_manage_patient(target_patient_id) then
    raise exception 'clinical_scope_required';
  end if;

  selected_protocol:=case target_product_mode
    when 'motion' then 'motion-v0.5'
    when 'clinical' then 'clinical-v0.4'
    else null end;
  if selected_protocol is null then raise exception 'unsupported_product_mode'; end if;

  if target_device_kit_id is not null and not exists(
    select 1 from public.device_kits k
    where k.id=target_device_kit_id and k.organization_id=target_organization_id and k.status='active'
  ) then raise exception 'active_device_kit_required'; end if;
  if target_product_mode='clinical' and target_device_kit_id is not null then raise exception 'clinical_does_not_use_device_kit'; end if;
  if target_product_mode='motion' and target_data_classification='health_data' and target_device_kit_id is null then
    raise exception 'device_kit_required_for_health_data';
  end if;

  if target_product_mode='clinical' then
    select a.id into parent_motion_id
    from public.assessments a
    where a.patient_id=target_patient_id and a.product_mode='motion'
      and a.status in ('validated','released')
      and exists(
        select 1 from public.scores s
        where s.assessment_id=a.id and s.release_status in ('clinician_reviewed','released')
      )
    order by a.created_at desc limit 1;
    if parent_motion_id is null then raise exception 'reviewed_motion_required_before_clinical'; end if;
  end if;

  insert into public.assessments(
    patient_id,parent_assessment_id,device_kit_id,product_mode,assessment_type,status,
    protocol_version,scheduled_at,created_by
  ) values (
    target_patient_id,parent_motion_id,target_device_kit_id,target_product_mode,target_assessment_type,
    case when target_product_mode='motion' then 'baseline' else 'draft' end,
    selected_protocol,target_scheduled_at,actor_id
  ) returning id into new_assessment_id;

  if target_product_mode='motion' then
    insert into public.questionnaire_sessions(
      assessment_id,instrument_code,instrument_version,status,score_status,created_by
    )
    select new_assessment_id,r.code,r.version,'not_started','not_scored',actor_id
    from public.instrument_registry r
    where r.code in (
      'KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY',
      'KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'
    ) and r.can_render=true
    on conflict (assessment_id,instrument_code,instrument_version) do nothing;
    perform private.bridge_start_to_motion_assessment(new_assessment_id);
  end if;

  insert into public.audit_events(
    organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail
  ) values (
    target_organization_id,target_patient_id,new_assessment_id,actor_id,'assessment_created','assessment',new_assessment_id::text,
    jsonb_build_object(
      'product_mode',target_product_mode,
      'assessment_type',target_assessment_type,
      'protocol_version',selected_protocol,
      'parent_motion_assessment_id',parent_motion_id,
      'device_kit_id',target_device_kit_id
    )
  );

  return new_assessment_id;
end;
$$;

insert into public.questionnaire_sessions(
  assessment_id,instrument_code,instrument_version,status,score_status,created_by
)
select a.id,r.code,r.version,'not_started','not_scored',a.created_by
from public.assessments a
cross join public.instrument_registry r
where a.product_mode='motion'
  and a.protocol_version='motion-v0.5'
  and a.status not in ('released','archived','cancelled')
  and r.code in (
    'KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY',
    'KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'
  )
  and r.can_render=true
on conflict (assessment_id,instrument_code,instrument_version) do nothing;

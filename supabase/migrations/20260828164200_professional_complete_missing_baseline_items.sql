create or replace function public.complete_professional_baseline_missing_items(
  p_assessment_id uuid,
  p_entries jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid := auth.uid();
  a public.assessments%rowtype;
  p public.patients%rowtype;
  reg public.instrument_registry%rowtype;
  sid uuid;
  e jsonb;
  code_value text;
  cfg jsonb;
  raw jsonb;
  response_code_value text;
  required_count int;
  answered_count int;
  has_safety_flag boolean := false;
  has_acute_modifier boolean := false;
  saved_codes text[] := '{}';
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries)=0 or jsonb_array_length(p_entries)>15 then raise exception 'invalid_baseline_entries'; end if;
  if not private.user_can_manage_assessment(p_assessment_id) then raise exception 'assessment_access_denied'; end if;
  select * into a from public.assessments where id=p_assessment_id;
  if a.id is null or a.product_mode <> 'motion' then raise exception 'motion_assessment_required'; end if;
  if a.status in ('validated','released','archived','cancelled') then raise exception 'assessment_locked'; end if;
  select * into p from public.patients where id=a.patient_id;
  select * into reg from public.instrument_registry where code='KOMO_BASELINE_CORE' and can_render;
  if reg.code is null then raise exception 'baseline_instrument_unavailable'; end if;
  select id into sid from public.questionnaire_sessions where assessment_id=p_assessment_id and instrument_code=reg.code and instrument_version=reg.version order by updated_at desc limit 1;
  if sid is null then
    insert into public.questionnaire_sessions(assessment_id,instrument_code,instrument_version,status,score_status,completeness,started_at,created_by)
    values(p_assessment_id,reg.code,reg.version,'in_progress','not_scored',0,now(),uid) returning id into sid;
  end if;
  for e in select value from jsonb_array_elements(p_entries) loop
    code_value := nullif(trim(e->>'itemCode'),'');
    if code_value is null or not (reg.configuration->'items' ? code_value) then raise exception 'unknown_baseline_item:%',coalesce(code_value,'null'); end if;
    cfg := reg.configuration->'items'->code_value;
    if not coalesce((cfg->>'required')::boolean,false) then raise exception 'baseline_item_not_required:%',code_value; end if;
    if exists(select 1 from public.questionnaire_responses where questionnaire_session_id=sid and item_code=code_value) then continue; end if;
    if not (e ? 'rawValue') then raise exception 'missing_raw_value:%',code_value; end if;
    raw := e->'rawValue';
    response_code_value := nullif(e->>'responseCode','');
    if cfg->>'type'='yes_no' then
      if jsonb_typeof(raw) <> 'boolean' then raise exception 'boolean_required:%',code_value; end if;
      response_code_value := case when raw='true'::jsonb then 'yes' else 'no' end;
    elsif cfg->>'type'='number' then
      if jsonb_typeof(raw) <> 'number' then raise exception 'number_required:%',code_value; end if;
      if cfg ? 'min' and (raw::text)::numeric < (cfg->>'min')::numeric then raise exception 'value_below_min:%',code_value; end if;
      if cfg ? 'max' and (raw::text)::numeric > (cfg->>'max')::numeric then raise exception 'value_above_max:%',code_value; end if;
    elsif cfg->>'type'='choice' then
      if jsonb_typeof(raw) <> 'string' then raise exception 'choice_required:%',code_value; end if;
      if not exists(select 1 from jsonb_array_elements(cfg->'options') o where o->>'value'=trim(both '"' from raw::text)) then raise exception 'invalid_choice:%',code_value; end if;
      response_code_value := coalesce(response_code_value,trim(both '"' from raw::text));
    end if;
    insert into public.questionnaire_responses(questionnaire_session_id,item_code,response_code,raw_value,source,clinician_verified,verified_by,verified_at,completed_at)
    values(sid,code_value,response_code_value,raw,'clinician',true,uid,now(),now());
    saved_codes := array_append(saved_codes,code_value);
  end loop;
  select count(*) into required_count from jsonb_each(reg.configuration->'items') item where coalesce((item.value->>'required')::boolean,false);
  select count(*) into answered_count from public.questionnaire_responses qr where qr.questionnaire_session_id=sid and reg.configuration->'items' ? qr.item_code and coalesce(((reg.configuration->'items'->qr.item_code)->>'required')::boolean,false);
  select exists(select 1 from public.questionnaire_responses qr where qr.questionnaire_session_id=sid and qr.item_code in ('S01','S02','S03','S04','S05') and qr.raw_value='true'::jsonb) into has_safety_flag;
  select exists(select 1 from public.questionnaire_responses qr where qr.questionnaire_session_id=sid and ((qr.item_code='B08' and (qr.raw_value='true'::jsonb or coalesce((case when jsonb_typeof(qr.raw_value)='object' then qr.raw_value->>'present' else null end)::boolean,false))) or (qr.item_code='B09' and qr.raw_value='true'::jsonb) or (qr.item_code='B10' and trim(both '"' from qr.raw_value::text)='yes'))) into has_acute_modifier;
  update public.questionnaire_sessions set status=case when answered_count>=required_count then 'completed' else 'in_progress' end, completeness=case when required_count=0 then 100 else least(100,round(answered_count::numeric/required_count*100,2)) end, completed_at=case when answered_count>=required_count then now() else null end, updated_at=now() where id=sid;
  update public.assessments set context_class=case when has_safety_flag then 'D' when has_acute_modifier then 'C' else 'A' end, status=case when has_safety_flag then 'review' when status in ('baseline','scheduled') then 'collecting' else status end, started_at=coalesce(started_at,now()), updated_at=now() where id=p_assessment_id;
  insert into public.audit_events(organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail)
  values(p.organization_id,p.id,p_assessment_id,uid,'motion.baseline_missing_items_completed','questionnaire_session',sid::text,jsonb_build_object('source','clinician_missing_items_completion','saved_codes',to_jsonb(saved_codes),'answered_required',answered_count,'required_total',required_count,'context_class',case when has_safety_flag then 'D' when has_acute_modifier then 'C' else 'A' end));
  return jsonb_build_object('session_id',sid,'saved_codes',to_jsonb(saved_codes),'answered_required',answered_count,'required_total',required_count,'complete',answered_count>=required_count,'context_class',case when has_safety_flag then 'D' when has_acute_modifier then 'C' else 'A' end,'safety_review_required',has_safety_flag);
end;
$function$;

grant execute on function public.complete_professional_baseline_missing_items(uuid,jsonb) to authenticated;

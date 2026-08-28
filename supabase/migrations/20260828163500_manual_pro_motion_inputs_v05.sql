-- KŌMØ Pulse · professional manual questionnaire summaries for Motion v0.5
-- Manual summaries are clinician-traced and do not overwrite itemized patient responses.

create or replace function public.save_professional_manual_questionnaire_summary(
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
  e jsonb;
  code_value text;
  score_value numeric;
  complete_value boolean;
  reg public.instrument_registry%rowtype;
  sid uuid;
  response_count int;
  saved_codes text[] := '{}';
  protected_codes text[] := '{}';
  score_status_value text;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries) > 6 then raise exception 'invalid_manual_questionnaire_entries'; end if;
  if not private.user_can_manage_assessment(p_assessment_id) then raise exception 'assessment_access_denied'; end if;

  select * into a from public.assessments where id=p_assessment_id;
  if a.id is null or a.product_mode <> 'motion' then raise exception 'motion_assessment_required'; end if;
  if a.status in ('validated','released','archived','cancelled') then raise exception 'assessment_locked'; end if;
  select * into p from public.patients where id=a.patient_id;

  for e in select value from jsonb_array_elements(p_entries)
  loop
    code_value := nullif(trim(e->>'code'),'');
    complete_value := coalesce((e->>'complete')::boolean,false);
    if not complete_value then continue; end if;
    if code_value not in ('KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY') then raise exception 'manual_questionnaire_not_allowed:%',coalesce(code_value,'null'); end if;

    score_value := case when e ? 'score' and nullif(e->>'score','') is not null then (e->>'score')::numeric else null end;
    if score_value is not null and (score_value < 0 or score_value > 100) then raise exception 'manual_score_out_of_range:%',code_value; end if;
    if code_value='KOMO_MOBILITY_25' and score_value is null then raise exception 'mobility_score_required'; end if;

    select * into reg from public.instrument_registry where code=code_value and can_render;
    if reg.code is null then raise exception 'instrument_not_authorized:%',code_value; end if;

    select qs.id into sid from public.questionnaire_sessions qs where qs.assessment_id=p_assessment_id and qs.instrument_code=reg.code and qs.instrument_version=reg.version;
    if sid is not null then
      select count(*) into response_count from public.questionnaire_responses where questionnaire_session_id=sid;
      if response_count > 0 then protected_codes := array_append(protected_codes,code_value); sid := null; continue; end if;
    end if;

    score_status_value := case when score_value is null then 'not_scored' else 'provisional' end;
    insert into public.questionnaire_sessions(assessment_id,instrument_code,instrument_version,status,score,score_status,completeness,started_at,completed_at,created_by,updated_at)
    values(p_assessment_id,reg.code,reg.version,'completed',score_value,score_status_value,100,now(),now(),uid,now())
    on conflict (assessment_id,instrument_code,instrument_version)
    do update set status='completed',score=excluded.score,score_status=excluded.score_status,completeness=100,started_at=coalesce(public.questionnaire_sessions.started_at,now()),completed_at=now(),updated_at=now()
    returning id into sid;
    saved_codes := array_append(saved_codes,code_value);
    sid := null;
  end loop;

  update public.assessments set status=case when status in ('baseline','scheduled') then 'collecting' else status end,started_at=coalesce(started_at,now()),updated_at=now() where id=p_assessment_id;

  insert into public.audit_events(organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail)
  values(p.organization_id,p.id,p_assessment_id,uid,'motion.manual_questionnaire_summary_saved','assessment',p_assessment_id::text,jsonb_build_object('source','professional_manual_summary','saved_codes',to_jsonb(saved_codes),'protected_existing_itemized_codes',to_jsonb(protected_codes),'entries',p_entries));

  return jsonb_build_object('assessment_id',p_assessment_id,'saved_codes',to_jsonb(saved_codes),'protected_existing_itemized_codes',to_jsonb(protected_codes));
end;
$function$;

grant execute on function public.save_professional_manual_questionnaire_summary(uuid,jsonb) to authenticated;

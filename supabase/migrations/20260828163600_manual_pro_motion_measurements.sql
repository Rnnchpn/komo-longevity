-- KŌMØ Pulse · professional manual Motion measurements
-- Allows clinician-traced manual entry for SVA and the canonical functional tests.

create or replace function public.save_professional_manual_motion_measurements(
  p_assessment_id uuid,
  p_measurements jsonb
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
  numeric_value_value numeric;
  text_value_value text;
  unit_value text;
  def public.indicator_definitions%rowtype;
  existing_id uuid;
  saved_codes text[] := '{}';
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if jsonb_typeof(p_measurements) <> 'array' or jsonb_array_length(p_measurements) > 8 then raise exception 'invalid_manual_measurement_batch'; end if;
  if not private.user_can_manage_assessment(p_assessment_id) then raise exception 'assessment_access_denied'; end if;

  select * into a from public.assessments where id=p_assessment_id;
  if a.id is null or a.product_mode <> 'motion' then raise exception 'motion_assessment_required'; end if;
  if a.status in ('validated','released','archived','cancelled') then raise exception 'assessment_locked'; end if;
  select * into p from public.patients where id=a.patient_id;

  for e in select value from jsonb_array_elements(p_measurements)
  loop
    code_value := nullif(trim(e->>'indicatorCode'),'');
    if code_value not in ('M-POS-02','M-FUN-01','M-FUN-02','M-FUN-03','M-FUN-04','M-FUN-05','M-FUN-06','M-FUN-07') then raise exception 'manual_measurement_not_allowed:%',coalesce(code_value,'null'); end if;

    select * into def from public.indicator_definitions where code=code_value and status='active';
    if def.code is null then raise exception 'unknown_indicator:%',code_value; end if;

    unit_value := coalesce(nullif(trim(e->>'unit'),''),def.canonical_unit);
    if not (def.allowed_units @> to_jsonb(array[unit_value])) then raise exception 'invalid_indicator_unit:%',code_value; end if;

    numeric_value_value := case when e ? 'numericValue' and jsonb_typeof(e->'numericValue')='number' then (e->>'numericValue')::numeric else null end;
    text_value_value := nullif(trim(e->>'textValue'),'');
    if def.value_kind='numeric' and numeric_value_value is null then raise exception 'numeric_value_required:%',code_value; end if;
    if def.value_kind='categorical' and text_value_value is null then raise exception 'text_value_required:%',code_value; end if;

    if code_value='M-POS-02' and (numeric_value_value < -300 or numeric_value_value > 500) then raise exception 'invalid_sva_value'; end if;
    if code_value='M-FUN-01' and (numeric_value_value < 0 or numeric_value_value > 100) then raise exception 'invalid_glfs_value'; end if;
    if code_value='M-FUN-03' and (numeric_value_value < 0 or numeric_value_value > 3) then raise exception 'invalid_two_step_value'; end if;
    if code_value='M-FUN-04' and (numeric_value_value < 0 or numeric_value_value > 100) then raise exception 'invalid_chair_stand_value'; end if;
    if code_value='M-FUN-05' and (numeric_value_value < 0 or numeric_value_value > 5) then raise exception 'invalid_gait_speed_value'; end if;
    if code_value in ('M-FUN-06','M-FUN-07') and (numeric_value_value < 0 or numeric_value_value > 300) then raise exception 'invalid_balance_value'; end if;

    select id into existing_id from public.measurements where assessment_id=p_assessment_id and indicator_code=code_value and source='clinician' order by created_at desc limit 1;
    if existing_id is null then
      insert into public.measurements(assessment_id,indicator_code,product_status,raw_value,numeric_value,text_value,unit,source,protocol_version,qc_status,qc_reason,recorded_at,recorded_by,source_reference)
      values(p_assessment_id,code_value,def.product_status,case when numeric_value_value is not null then to_jsonb(numeric_value_value) else to_jsonb(text_value_value) end,numeric_value_value,text_value_value,unit_value,'clinician',a.protocol_version,'valid','professional_manual_entry',now(),uid,'pro-patient-dossier/manual-entry');
    else
      update public.measurements set raw_value=case when numeric_value_value is not null then to_jsonb(numeric_value_value) else to_jsonb(text_value_value) end,numeric_value=numeric_value_value,text_value=text_value_value,unit=unit_value,qc_status='valid',qc_reason='professional_manual_entry',recorded_at=now(),recorded_by=uid,source_reference='pro-patient-dossier/manual-entry' where id=existing_id;
    end if;
    saved_codes := array_append(saved_codes,code_value);
    existing_id := null;
  end loop;

  update public.assessments set status=case when status in ('baseline','scheduled') then 'collecting' else status end,started_at=coalesce(started_at,now()),updated_at=now() where id=p_assessment_id;
  insert into public.audit_events(organization_id,patient_id,assessment_id,actor_user_id,event_type,entity_type,entity_id,event_detail)
  values(p.organization_id,p.id,p_assessment_id,uid,'motion.manual_measurements_saved','assessment',p_assessment_id::text,jsonb_build_object('source','professional_manual_entry','saved_codes',to_jsonb(saved_codes),'measurements',p_measurements));
  return jsonb_build_object('assessment_id',p_assessment_id,'saved_codes',to_jsonb(saved_codes));
end;
$function$;

grant execute on function public.save_professional_manual_motion_measurements(uuid,jsonb) to authenticated;

-- KŌMØ Motion Presentiel V2 — patient visibility and explicit release candidate.
-- DO NOT APPLY AUTOMATICALLY. Restricted to synthetic test dossiers.
-- Requires docs/motion-presentiel-v2-server-CANDIDATE.sql first.
-- Review RPC authorization, correct patient isolation, and clinical protocol QC.
begin;
create or replace function public.motion_presentiel_v2_patient_view()
returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_session public.pulse_operator_sessions%rowtype;
  v_count integer := 0;
  v_released boolean := false;
  v_metrics jsonb := '{}'::jsonb;
  v_gait jsonb;
  v_chair jsonb;
  v_best numeric;
  v_chair_seconds numeric;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select s.* into v_session
  from public.pulse_operator_sessions s
  inner join public.patients p on p.id=s.patient_id
  where p.patient_user_id=v_uid
    and p.status='active'
    and p.data_classification='synthetic'
    and s.protocol_version='komo-motion-presentiel-v2.0'
  order by s.created_at desc limit 1;

  if not found then
    return jsonb_build_object('has_session',false,'released',false,'completed_steps',0);
  end if;

  select count(*) into v_count
  from public.pulse_operator_steps st
  where st.operator_session_id=v_session.id and st.status='complete';

  v_released:=v_session.readiness->>'patient_released'='true';

  if v_released then
    -- Read explicitly whitelisted metrics only. Never return notes, underlying
    -- questionnaires, timestamps, audit trail or draft/raw operator payload.
    select st.payload->'values' into v_gait
    from public.pulse_operator_steps st
    where st.operator_session_id=v_session.id and st.step_code='gait'
      and st.status='complete';

    select st.payload->'values' into v_chair
    from public.pulse_operator_steps st
    where st.operator_session_id=v_session.id and st.step_code='chair'
      and st.status='complete';

    if v_gait->>'status'='valid'
      and jsonb_typeof(v_gait->'gait1')='number'
      and jsonb_typeof(v_gait->'gait2')='number'
      and (v_gait->>'gait1')::numeric>0
      and (v_gait->>'gait2')::numeric>0 then
       v_best:=least((v_gait->>'gait1')::numeric,(v_gait->>'gait2')::numeric);
       v_metrics:=jsonb_set(v_metrics,'{"Vitesse de marche"}',to_jsonb(to_char(round(4/v_best,2),'FM9990D00') || ' m/s'));
    end if;

    if v_chair->>'status'='valid'
      and jsonb_typeof(v_chair->'chair')='number'
      and (v_chair->>'chair')::numeric>0 then
       v_chair_seconds:=(v_chair->>'chair')::numeric;
       v_metrics:=jsonb_set(v_metrics,'{"5× assis-debout"}',to_jsonb(to_char(v_chair_seconds,'FM9990D00') || ' s'));
    end if;
  end if;

  return jsonb_build_object(
    'has_session',true,
    'status',v_session.status,
    'current_step_code',v_session.current_step_code,
    'completed_steps',v_count,
    'released',v_released,
    'metrics',case when v_released then v_metrics else null end
  );
end;
$$;

create or replace function public.motion_presentiel_v2_release(p_session_id uuid)
returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_patient uuid;
  v_assessment uuid;
  v_ready boolean := false;
  v_total integer;
  v_completed integer;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.account_roles
    where user_id=v_uid and role::text in ('professional','admin')) then
    raise exception 'Professional access required';
  end if;

  select s.patient_id,s.assessment_id into v_patient,v_assessment
  from public.pulse_operator_sessions s
  join public.patients p on p.id=s.patient_id
  where s.id=p_session_id
    and s.protocol_version='komo-motion-presentiel-v2.0'
    and s.status in ('running','paused','completed')
    and p.data_classification='synthetic';

  if v_patient is null then raise exception 'Synthetic test session required'; end if;
  if not private.pulse_operator_can_access_patient_v1(v_patient) then
    raise exception 'Patient access denied';
  end if;

  select count(*),count(*) filter (where status='complete')
    into v_total,v_completed from public.pulse_operator_steps
    where operator_session_id=p_session_id;

  if v_total<>8 or v_completed<>8 then
    raise exception 'Complete and review all eight steps before releasing';
  end if;

  select (payload->'values'->>'ready'='true'
    and payload->'values'->>'info'='true') into v_ready
  from public.pulse_operator_steps
  where operator_session_id=p_session_id and step_code='preflight';

  if not coalesce(v_ready,false) then
    raise exception 'Safety and information checks must be completed';
  end if;

  update public.pulse_operator_sessions
    set readiness=jsonb_set(coalesce(readiness,'{}'::jsonb),
          '{patient_released}','true'::jsonb,true),
        status='completed',completed_at=coalesce(completed_at,now()),
        current_step_code='summary',updated_at=now()
    where id=p_session_id;

  insert into public.pulse_operator_events
    (operator_session_id,patient_id,assessment_id,actor_user_id,event_type,payload)
  values (p_session_id,v_patient,v_assessment,v_uid,'onsite_v2_patient_released',
          '{"scope":"synthetic","report":"descriptive_only"}'::jsonb);

  return jsonb_build_object('released',true,'session_id',p_session_id);
end;
$$;

revoke all on function public.motion_presentiel_v2_patient_view() from public,anon,authenticated;
revoke all on function public.motion_presentiel_v2_release(uuid) from public,anon,authenticated;
grant execute on function public.motion_presentiel_v2_patient_view() to authenticated;
grant execute on function public.motion_presentiel_v2_release(uuid) to authenticated;
commit;

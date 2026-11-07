-- KŌMØ Motion Présentiel V2 — migration candidate, NOT deployed.
-- Preview restricted to synthetic records; keep existing Pulse operator RPCs unchanged.
-- Apply only after review, with transaction and regression/RLS tests.
begin;

create or replace function public.motion_presentiel_v2_open(p_patient_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_patient public.patients%rowtype;
  v_assessment uuid;
  v_session uuid;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.account_roles where user_id=v_uid and role::text in ('professional','admin')) then
    raise exception 'Professional access required';
  end if;
  if not private.pulse_operator_can_access_patient_v1(p_patient_id) then
    raise exception 'Patient access denied';
  end if;
  select * into v_patient from public.patients
    where id=p_patient_id and data_classification='synthetic' and status='active';
  if not found then raise exception 'Synthetic test patient required'; end if;

  select id into v_assessment from public.assessments
    where patient_id=p_patient_id order by created_at desc limit 1;
  if v_assessment is null then raise exception 'Existing assessment required'; end if;

  select id into v_session from public.pulse_operator_sessions
    where patient_id=p_patient_id and protocol_version='komo-motion-presentiel-v2.0'
      and status in ('draft','running','paused')
    order by created_at desc limit 1;

  if v_session is null then
    insert into public.pulse_operator_sessions
      (organization_id,patient_id,assessment_id,operator_user_id,protocol_version,
       status,current_step_code,started_at,readiness)
    values (v_patient.organization_id,p_patient_id,v_assessment,v_uid,
      'komo-motion-presentiel-v2.0','running','preflight',now(),
      '{"nonmedical":true,"synthetic_only":true}'::jsonb)
    returning id into v_session;
  end if;

  insert into public.pulse_operator_steps
    (operator_session_id,step_code,sequence_order,planned_min_start,planned_min_end,
     title,source_system,required,status,qc_status,payload)
  select v_session, s.step_code,s.sequence_order,s.t0,s.t1,s.title,'Pulse Manual',
    true,'pending','not_applicable',
    '{"version":"komo-motion-presentiel-v2.0","values":{}}'::jsonb
  from (values
    ('preflight',1,0,8,'Préparation'),
    ('balance',2,8,18,'Équilibre SPPB'),
    ('gait',3,18,28,'Marche 4 m'),
    ('chair',4,28,38,'5× Assis-debout'),
    ('tug',5,38,44,'Timed Up & Go'),
    ('unipodal',6,44,50,'Équilibre unipodal'),
    ('mobility',7,50,55,'Mobilité et posture'),
    ('summary',8,55,60,'Restitution')
  ) as s(step_code,sequence_order,t0,t1,title)
  where not exists
    (select 1 from public.pulse_operator_steps p
      where p.operator_session_id=v_session and p.step_code=s.step_code);

  insert into public.pulse_operator_events
    (operator_session_id,patient_id,assessment_id,actor_user_id,event_type,payload)
    values (v_session,p_patient_id,v_assessment,v_uid,'onsite_v2_open',
      jsonb_build_object('protocol_version','komo-motion-presentiel-v2.0',
                         'synthetic_only',true));

  return jsonb_build_object('session_id',v_session,'assessment_id',v_assessment,
                           'protocol_version','komo-motion-presentiel-v2.0');
end;
$$;

create or replace function public.motion_presentiel_v2_save(
  p_session_id uuid, p_step_code text, p_values jsonb
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_patient uuid;
  v_assessment uuid;
  v_status text;
  v_key text;
  v_item jsonb;
  v_number numeric;
  v_max numeric;
  v_min numeric;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.account_roles where user_id=v_uid
      and role::text in ('professional','admin')) then raise exception 'Professional access required'; end if;
  select s.patient_id,s.assessment_id into v_patient,v_assessment
    from public.pulse_operator_sessions s join public.patients p on p.id=s.patient_id
    where s.id=p_session_id and s.protocol_version='komo-motion-presentiel-v2.0'
      and s.status in ('draft','running','paused')
      and p.data_classification='synthetic';
  if v_patient is null then raise exception 'Synthetic operator session not found'; end if;
  if not private.pulse_operator_can_access_patient_v1(v_patient) then
    raise exception 'Patient access denied'; end if;
  if p_step_code not in ('preflight','balance','gait','chair','tug','unipodal','mobility','summary') then
    raise exception 'Unknown protocol step'; end if;
  if p_values is null or jsonb_typeof(p_values)<>'object' or pg_catalog.octet_length(p_values::text)>8192 then
    raise exception 'Invalid step payload'; end if;

  -- Reject fields not in the protocol, avoiding arbitrary data uploads.
  for v_key in select jsonb_object_keys(p_values) loop
    if not (
      (p_step_code='preflight' and v_key in ('ready','info','shoe')) or
      (p_step_code='balance' and v_key in ('feet','semi','tandem','status')) or
      (p_step_code='gait' and v_key in ('gait1','gait2','status')) or
      (p_step_code='chair' and v_key in ('chair','status')) or
      (p_step_code='tug' and v_key in ('tug','status')) or
      (p_step_code='unipodal' and v_key in ('right','left','status')) or
      (p_step_code='mobility' and v_key in ('finger','posture','status')) or
      (p_step_code='summary' and v_key='comments')
    ) then raise exception 'Unexpected payload field'; end if;
    v_item:=p_values->v_key;
    if v_key='status' then
      if jsonb_typeof(v_item)<>'string'
        or v_item#>>'{}' not in ('','valid','unable','unsafe','refused','adapted') then
        raise exception 'Invalid test status'; end if;
    elsif v_key in ('ready','info') then
      if jsonb_typeof(v_item)<>'boolean' then raise exception 'Invalid safety status'; end if;
    elsif v_key in ('shoe','posture','comments') then
      if jsonb_typeof(v_item)<>'string'
        or pg_catalog.char_length(v_item#>>'{}')>
          (case when v_key='shoe' then 160 else 1000 end) then
        raise exception 'Invalid text field'; end if;
    else
      if jsonb_typeof(v_item)<>'null' then
        if jsonb_typeof(v_item)<>'number' then raise exception 'Invalid numeric field'; end if;
        v_number:=(v_item#>>'{}')::numeric;
        v_max:=case when v_key in ('feet','semi','tandem') then 10
                    when v_key in ('right','left') then 30
                    when v_key='tug' then 180
                    when v_key='finger' then 120
                    else 120 end;
        v_min:=case when v_key='finger' then -120 else 0 end;
        if v_number<v_min or v_number>v_max then raise exception 'Measurement outside bounds'; end if;
      end if;
    end if;
  end loop;

  v_status:=case when p_step_code='preflight'
      then case when p_values->>'ready'='true' and p_values->>'info'='true' then 'complete' else 'running' end
    when p_step_code='summary'
      then case when pg_catalog.char_length(pg_catalog.btrim(coalesce(p_values->>'comments','')))>0
         then 'complete' else 'running' end
    when p_values->>'status' in ('valid','unable','unsafe','refused','adapted')
      then 'complete' else 'running' end;

  update public.pulse_operator_steps
    set payload=jsonb_build_object('version','komo-motion-presentiel-v2.0',
                                   'values',p_values,'updated_at',now()),
        status=v_status,qc_status='not_applicable',
        updated_by=v_uid,updated_at=now(),
        completed_at=case when v_status='complete' then now() else null end
    where operator_session_id=p_session_id and step_code=p_step_code;
  if not found then raise exception 'Operator step not found'; end if;

  update public.pulse_operator_sessions
    set current_step_code=p_step_code,status='running',updated_at=now()
    where id=p_session_id;

  insert into public.pulse_operator_events
    (operator_session_id,patient_id,assessment_id,actor_user_id,event_type,step_code,payload)
    values (p_session_id,v_patient,v_assessment,v_uid,'onsite_v2_step_saved',p_step_code,
      jsonb_build_object('keys', (select jsonb_agg(k)
          from jsonb_object_keys(p_values) as k), 'status',v_status));

  return jsonb_build_object('session_id',p_session_id,'step_code',p_step_code,'status',v_status);
end;
$$;

revoke all on function public.motion_presentiel_v2_open(uuid) from public,anon,authenticated;
revoke all on function public.motion_presentiel_v2_save(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.motion_presentiel_v2_open(uuid) to authenticated;
grant execute on function public.motion_presentiel_v2_save(uuid,text,jsonb) to authenticated;
commit;

-- KŌMØ Motion Simulation V3. Strictly synthetic, independently sandboxed.
-- 200 EUR / 60 minutes are presentation metadata; there is NO payment.
-- Anonymous role links are capability tokens, intended ONLY for fake data.
create schema if not exists private;

create table if not exists private.motion_sim_v3 (
  id uuid primary key default gen_random_uuid(),
  operator_token uuid not null unique default gen_random_uuid(),
  patient_token uuid not null unique default gen_random_uuid(),
  origin text not null check(origin in ('operator','patient')),
  stage text not null default 'before' check(stage in ('before','during','after')),
  step_code text not null default 'preflight',
  patient_ready boolean not null default false,
  questionnaire jsonb not null default '{}'::jsonb,
  measurements jsonb not null default '{}'::jsonb,
  released boolean not null default false,
  released_report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '12 hours')
);
alter table private.motion_sim_v3 enable row level security;
revoke all on private.motion_sim_v3 from public, anon, authenticated;

create or replace function public.motion_sim_v3_create(p_origin text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v private.motion_sim_v3%rowtype;
begin
  if p_origin not in ('operator','patient') then raise exception 'Invalid role'; end if;
  delete from private.motion_sim_v3 where expires_at < now();
  -- Simple database-wide flood guard. This is NOT a substitute for edge rate limiting.
  if (select count(*) from private.motion_sim_v3
       where created_at>now()-interval '1 minute') > 20 then
    raise exception 'Simulation creation temporarily limited'; end if;
  insert into private.motion_sim_v3(origin) values(p_origin) returning * into v;
  return jsonb_build_object(
    'id',v.id,'operator_token',v.operator_token,'patient_token',v.patient_token,
    'expires_at',v.expires_at,'price_eur',200,'duration_min',60,
    'synthetic_only',true);
end;
$$;

create or replace function public.motion_sim_v3_get(p_token uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v private.motion_sim_v3%rowtype;
        v_role text;
        v_n integer;
begin
  select * into v from private.motion_sim_v3
   where (operator_token=p_token or patient_token=p_token)
     and expires_at>now();
  if not found then raise exception 'Simulation expired or unknown'; end if;
  v_role:=case when p_token=v.operator_token then 'operator' else 'patient' end;
  select count(*) into v_n from jsonb_object_keys(v.measurements) as k
    where k not in ('summary');
  return jsonb_build_object(
    'id',v.id,'role',v_role,'origin',v.origin,'stage',v.stage,
    'step_code',v.step_code,'patient_ready',v.patient_ready,
    'questionnaire',v.questionnaire,
    'progress',v_n,'price_eur',200,'duration_min',60,
    'expires_at',v.expires_at,'updated_at',v.updated_at,
    'released',v.released,
    'measurements',case when v_role='operator' then v.measurements else null end,
    'report',case when v.released then v.released_report else null end,
    'synthetic_only',true
  );
end;
$$;

create or replace function public.motion_sim_v3_action(
  p_token uuid, p_action text, p_payload jsonb default '{}'::jsonb
)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v private.motion_sim_v3%rowtype;
        v_role text;
        v_step text;
        v_vals jsonb;
        v_key text;
        v_value jsonb;
        v_min numeric;
        v_max numeric;
        v_n numeric;
        v_test text;
begin
  select * into v from private.motion_sim_v3
   where (operator_token=p_token or patient_token=p_token)
      and expires_at>now() for update;
  if not found then raise exception 'Simulation expired or unknown'; end if;
  v_role:=case when p_token=v.operator_token then 'operator' else 'patient' end;
  if p_payload is null or jsonb_typeof(p_payload)<>'object'
       or pg_catalog.octet_length(p_payload::text)>2600 then
    raise exception 'Invalid demo payload';
  end if;
  if v_role='patient' and p_action='ready' then
    update private.motion_sim_v3
       set patient_ready=true,updated_at=now() where id=v.id;
  elsif v_role='patient' and p_action='questionnaire' then
    if p_payload <> (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
        from jsonb_each(p_payload) where key in ('goal','activity','sleep','fatigue')) then
      raise exception 'Unexpected questionnaire field'; end if;
    if not coalesce(p_payload->>'goal','') in ('','marche','equilibre','force','mobilite','general')
      or not coalesce(p_payload->>'activity','') in ('','faible','moderee','elevee')
      then raise exception 'Invalid questionnaire response'; end if;
    foreach v_key in array array['sleep','fatigue'] loop
      if p_payload ? v_key then
        v_value:=p_payload->v_key;
        if jsonb_typeof(v_value)<>'number' or (v_value#>>'{}')::numeric < 0
          or (v_value#>>'{}')::numeric >10 then raise exception 'Invalid questionnaire scale'; end if;
      end if;
    end loop;
    update private.motion_sim_v3
      set questionnaire=p_payload,patient_ready=true,updated_at=now() where id=v.id;
  elsif v_role='operator' and p_action='start' then
    if v.released then raise exception 'Released simulation is locked'; end if;
    update private.motion_sim_v3
      set stage='during',step_code='preflight',updated_at=now() where id=v.id;
  elsif v_role='operator' and p_action='navigate' then
    if v.released then raise exception 'Released simulation is locked'; end if;
    v_step:=p_payload->>'step';
    if v_step not in ('preflight','balance','gait','chair','tug','unipodal','mobility','summary')
      then raise exception 'Unknown step'; end if;
    update private.motion_sim_v3
      set stage='during',step_code=v_step,updated_at=now() where id=v.id;
  elsif v_role='operator' and p_action='measure' then
    if v.released then raise exception 'Released simulation is locked'; end if;
    v_step:=p_payload->>'step';
    v_vals:=p_payload->'values';
    if v_step not in ('preflight','balance','gait','chair','tug','unipodal','mobility','summary')
      or jsonb_typeof(v_vals)<>'object'
      or pg_catalog.octet_length(v_vals::text)>800 then raise exception 'Invalid test'; end if;

    for v_key,v_value in select key,value from jsonb_each(v_vals) loop
      if not (
         (v_step='preflight' and v_key in ('safe','informed')) or
         (v_step='balance' and v_key in ('feet','semi','tandem','status')) or
         (v_step='gait' and v_key in ('gait1','gait2','status')) or
         (v_step='chair' and v_key in ('chair','status')) or
         (v_step='tug' and v_key in ('tug','status')) or
         (v_step='unipodal' and v_key in ('right','left','status')) or
         (v_step='mobility' and v_key in ('finger','observation','status')) or
         (v_step='summary' and v_key in ('priorities'))
      ) then raise exception 'Unexpected test field'; end if;

      if v_key in ('safe','informed') then
        if jsonb_typeof(v_value)<>'boolean' then raise exception 'Invalid safety check'; end if;
      elsif v_key='status' then
        if jsonb_typeof(v_value)<>'string' or (v_value#>>'{}') not in
          ('valid','unable','unsafe','refused','adapted') then
          raise exception 'Invalid test status'; end if;
      elsif v_key in ('observation','priorities') then
        if jsonb_typeof(v_value)<>'string'
           or pg_catalog.char_length(v_value#>>'{}')>350 then
          raise exception 'Invalid note length'; end if;
      else
        if jsonb_typeof(v_value)<>'number' then raise exception 'Expected numeric value'; end if;
        v_n:=(v_value#>>'{}')::numeric;
        v_min:=case when v_key='finger' then -120 else 0 end;
        v_max:=case when v_key in ('feet','semi','tandem') then 10
                when v_key in ('right','left') then 30
                when v_key='tug' then 180 else 120 end;
        if v_n<v_min or v_n>v_max then raise exception 'Out-of-bounds measurement'; end if;
      end if;
    end loop;
    update private.motion_sim_v3
      set measurements=jsonb_set(measurements,array[v_step],v_vals,true),
          stage='during',step_code=v_step,updated_at=now() where id=v.id;
  elsif v_role='operator' and p_action='release' then
    if v.released then raise exception 'Already released'; end if;
    if v.measurements->'preflight'->>'safe' <> 'true'
      or v.measurements->'preflight'->>'informed'<>'true'
      then raise exception 'Safety and informed participation must be confirmed'; end if;
    foreach v_test in array array['balance','gait','chair'] loop
      if coalesce(v.measurements->v_test->>'status','') not in
         ('valid','unable','unsafe','refused','adapted') then
        raise exception 'SPPB domains must be recorded or marked not performed'; end if;
    end loop;
    -- Require complete numeric values when a test was declared valid.
    if (v.measurements->'balance'->>'status'='valid' and
         (jsonb_typeof(v.measurements->'balance'->'feet')<>'number' or
          jsonb_typeof(v.measurements->'balance'->'semi')<>'number' or
          jsonb_typeof(v.measurements->'balance'->'tandem')<>'number')) or
       (v.measurements->'gait'->>'status'='valid' and
         (jsonb_typeof(v.measurements->'gait'->'gait1')<>'number' or
          jsonb_typeof(v.measurements->'gait'->'gait2')<>'number' or
          (v.measurements->'gait'->>'gait1')::numeric=0 or
          (v.measurements->'gait'->>'gait2')::numeric=0)) or
       (v.measurements->'chair'->>'status'='valid' and
         (jsonb_typeof(v.measurements->'chair'->'chair')<>'number' or
          (v.measurements->'chair'->>'chair')::numeric=0))
      then raise exception 'Incomplete valid test measurements'; end if;

    update private.motion_sim_v3
      set released=true,stage='after',step_code='summary',
          released_report=jsonb_build_object(
            'measurements',v.measurements - 'preflight' - 'summary',
            'priorities',coalesce(v.measurements->'summary'->>'priorities',''),
            'released_at',now(), 'protocol','motion-sim-v3',
            'price_eur',200,'duration_min',60),
          updated_at=now()
    where id=v.id;
  else
    raise exception 'Action not permitted for this role';
  end if;
  return public.motion_sim_v3_get(p_token);
end;
$$;

revoke all on function public.motion_sim_v3_create(text) from public,anon,authenticated;
revoke all on function public.motion_sim_v3_get(uuid) from public,anon,authenticated;
revoke all on function public.motion_sim_v3_action(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.motion_sim_v3_create(text) to anon,authenticated;
grant execute on function public.motion_sim_v3_get(uuid) to anon,authenticated;
grant execute on function public.motion_sim_v3_action(uuid,text,jsonb) to anon,authenticated;

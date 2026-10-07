
-- KŌMØ Pulse Operator Console V1
-- Additive POC schema. Requires 20261007170000_pulse_poc_v1_architecture.sql first.

create table if not exists public.pulse_operator_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  operator_user_id uuid not null references auth.users(id),
  protocol_version text not null default 'komo-motion-baseline-v1.0',
  status text not null default 'draft'
    check (status in ('draft','running','paused','review','completed','cancelled')),
  current_step_code text,
  readiness jsonb not null default '{}'::jsonb,
  operator_notes text,
  paused_reason text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulse_operator_steps (
  id uuid primary key default gen_random_uuid(),
  operator_session_id uuid not null references public.pulse_operator_sessions(id) on delete cascade,
  step_code text not null,
  sequence_order integer not null,
  planned_min_start integer not null,
  planned_min_end integer not null,
  title text not null,
  device_family text,
  source_system text not null default 'Pulse',
  required boolean not null default true,
  status text not null default 'pending'
    check (status in ('pending','ready','running','complete','review','rejected','skipped')),
  qc_status text not null default 'pending'
    check (qc_status in ('pending','pass','review','fail','not_applicable')),
  source_external_id text,
  measurement_set_id uuid references public.pulse_measurement_sets(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(operator_session_id, step_code)
);

create table if not exists public.pulse_operator_events (
  id uuid primary key default gen_random_uuid(),
  operator_session_id uuid not null references public.pulse_operator_sessions(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id),
  event_type text not null,
  step_code text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pulse_operator_sessions_patient_idx
  on public.pulse_operator_sessions(patient_id, created_at desc);
create index if not exists pulse_operator_sessions_org_idx
  on public.pulse_operator_sessions(organization_id, status, created_at desc);
create index if not exists pulse_operator_steps_session_idx
  on public.pulse_operator_steps(operator_session_id, sequence_order);
create index if not exists pulse_operator_events_session_idx
  on public.pulse_operator_events(operator_session_id, created_at desc);
create unique index if not exists pulse_checkpoints_baseline_type_uidx
  on public.pulse_checkpoints(patient_id, baseline_assessment_id, checkpoint_type)
  where baseline_assessment_id is not null;

alter table public.pulse_operator_sessions enable row level security;
alter table public.pulse_operator_steps enable row level security;
alter table public.pulse_operator_events enable row level security;

revoke all on public.pulse_operator_sessions, public.pulse_operator_steps, public.pulse_operator_events from anon;
revoke delete on public.pulse_operator_sessions, public.pulse_operator_steps, public.pulse_operator_events from authenticated;
grant select, insert, update on public.pulse_operator_sessions, public.pulse_operator_steps to authenticated;
grant select, insert on public.pulse_operator_events to authenticated;

create or replace function public.pulse_operator_can_access_patient_v1(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.patients p
      join public.organization_members om
        on om.organization_id = p.organization_id
       and om.user_id = (select auth.uid())
       and om.status = 'active'
       and om.access_scope in ('motion','clinical')
      where p.id = p_patient_id
        and p.status = 'active'
    )
    or exists (
      select 1
      from public.account_roles ar
      where ar.user_id = (select auth.uid())
        and ar.role::text = 'admin'
    );
$$;

revoke all on function public.pulse_operator_can_access_patient_v1(uuid) from public;
grant execute on function public.pulse_operator_can_access_patient_v1(uuid) to authenticated;

drop policy if exists pulse_operator_sessions_read on public.pulse_operator_sessions;
create policy pulse_operator_sessions_read
on public.pulse_operator_sessions
for select to authenticated
using (public.pulse_operator_can_access_patient_v1(patient_id));

drop policy if exists pulse_operator_sessions_insert on public.pulse_operator_sessions;
create policy pulse_operator_sessions_insert
on public.pulse_operator_sessions
for insert to authenticated
with check (
  public.pulse_operator_can_access_patient_v1(patient_id)
  and operator_user_id = (select auth.uid())
);

drop policy if exists pulse_operator_sessions_update on public.pulse_operator_sessions;
create policy pulse_operator_sessions_update
on public.pulse_operator_sessions
for update to authenticated
using (public.pulse_operator_can_access_patient_v1(patient_id))
with check (public.pulse_operator_can_access_patient_v1(patient_id));

drop policy if exists pulse_operator_steps_read on public.pulse_operator_steps;
create policy pulse_operator_steps_read
on public.pulse_operator_steps
for select to authenticated
using (
  exists (
    select 1 from public.pulse_operator_sessions s
    where s.id = operator_session_id
      and public.pulse_operator_can_access_patient_v1(s.patient_id)
  )
);

drop policy if exists pulse_operator_steps_insert on public.pulse_operator_steps;
create policy pulse_operator_steps_insert
on public.pulse_operator_steps
for insert to authenticated
with check (
  exists (
    select 1 from public.pulse_operator_sessions s
    where s.id = operator_session_id
      and public.pulse_operator_can_access_patient_v1(s.patient_id)
  )
);

drop policy if exists pulse_operator_steps_update on public.pulse_operator_steps;
create policy pulse_operator_steps_update
on public.pulse_operator_steps
for update to authenticated
using (
  exists (
    select 1 from public.pulse_operator_sessions s
    where s.id = operator_session_id
      and public.pulse_operator_can_access_patient_v1(s.patient_id)
  )
)
with check (
  exists (
    select 1 from public.pulse_operator_sessions s
    where s.id = operator_session_id
      and public.pulse_operator_can_access_patient_v1(s.patient_id)
  )
);

drop policy if exists pulse_operator_events_read on public.pulse_operator_events;
create policy pulse_operator_events_read
on public.pulse_operator_events
for select to authenticated
using (public.pulse_operator_can_access_patient_v1(patient_id));

drop policy if exists pulse_operator_events_insert on public.pulse_operator_events;
create policy pulse_operator_events_insert
on public.pulse_operator_events
for insert to authenticated
with check (
  public.pulse_operator_can_access_patient_v1(patient_id)
  and actor_user_id = (select auth.uid())
);

create or replace function public.start_pulse_operator_session_v1(
  p_patient_id uuid,
  p_assessment_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_org uuid;
  v_assessment uuid;
  v_session uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;
  if not public.pulse_operator_can_access_patient_v1(p_patient_id) then
    raise exception 'Operator access denied';
  end if;

  select organization_id into v_org
  from public.patients
  where id = p_patient_id and status = 'active';

  if v_org is null then
    raise exception 'Patient not found or inactive';
  end if;

  if p_assessment_id is not null then
    select id into v_assessment
    from public.assessments
    where id = p_assessment_id
      and patient_id = p_patient_id
      and product_mode = 'motion';
    if v_assessment is null then
      raise exception 'Assessment does not belong to this patient';
    end if;
  else
    select id into v_assessment
    from public.assessments
    where patient_id = p_patient_id
      and product_mode = 'motion'
      and status in ('draft','scheduled','collecting','review')
    order by created_at desc
    limit 1;
  end if;

  if v_assessment is null then
    insert into public.assessments (
      patient_id, product_mode, assessment_type, status, protocol_version,
      context_class, completeness, started_at, operator_id, created_by
    ) values (
      p_patient_id, 'motion', 'baseline', 'collecting', 'komo-motion-baseline-v1.0',
      'standard', 0, now(), v_uid, v_uid
    )
    returning id into v_assessment;
  else
    update public.assessments
    set status = case when status in ('draft','scheduled') then 'collecting' else status end,
        started_at = coalesce(started_at, now()),
        operator_id = coalesce(operator_id, v_uid),
        updated_at = now()
    where id = v_assessment;
  end if;

  select id into v_session
  from public.pulse_operator_sessions
  where patient_id = p_patient_id
    and assessment_id = v_assessment
    and status in ('draft','running','paused','review')
  order by created_at desc
  limit 1;

  if v_session is null then
    insert into public.pulse_operator_sessions (
      organization_id, patient_id, assessment_id, operator_user_id,
      protocol_version, status, current_step_code, started_at
    ) values (
      v_org, p_patient_id, v_assessment, v_uid,
      'komo-motion-baseline-v1.0', 'running', 'preflight', now()
    )
    returning id into v_session;

    insert into public.pulse_operator_steps
      (operator_session_id, step_code, sequence_order, planned_min_start, planned_min_end, title, device_family, source_system, required, status, qc_status)
    values
      (v_session,'preflight',10,0,5,'Safety & standardisation',null,'Operator',true,'ready','not_applicable'),
      (v_session,'readiness',20,5,10,'SELF + Biology readiness',null,'Pulse',true,'pending','not_applicable'),
      (v_session,'smartspeed_10m',30,10,15,'10 m gait speed','SmartSpeed','VALD',true,'pending','pending'),
      (v_session,'forcedecks_quiet_stand',40,15,20,'Quiet Stand','ForceDecks','VALD',true,'pending','pending'),
      (v_session,'humantrak_mobility',50,20,30,'Mobility battery V1','HumanTrak','VALD',true,'pending','pending'),
      (v_session,'dynamo_grip',60,30,38,'Bilateral grip strength','DynaMo','VALD',true,'pending','pending'),
      (v_session,'forcedecks_sts',70,38,45,'Sit-to-Stand','ForceDecks','VALD',true,'pending','pending'),
      (v_session,'qc_release',80,45,55,'QC + Clinical Gates',null,'Pulse',true,'pending','not_applicable');

    insert into public.pulse_operator_events (
      operator_session_id, patient_id, assessment_id, actor_user_id, event_type, payload
    ) values (
      v_session, p_patient_id, v_assessment, v_uid, 'session_started',
      jsonb_build_object('protocol_version','komo-motion-baseline-v1.0')
    );
  else
    update public.pulse_operator_sessions
    set status = case when status in ('draft','paused') then 'running' else status end,
        started_at = coalesce(started_at, now()),
        updated_at = now()
    where id = v_session;
  end if;

  return jsonb_build_object(
    'session_id', v_session,
    'assessment_id', v_assessment,
    'patient_id', p_patient_id,
    'status', 'running'
  );
end;
$$;

revoke all on function public.start_pulse_operator_session_v1(uuid,uuid) from public;
grant execute on function public.start_pulse_operator_session_v1(uuid,uuid) to authenticated;

create or replace function public.pulse_operator_step_v1(
  p_session_id uuid,
  p_step_code text,
  p_action text,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_patient uuid;
  v_assessment uuid;
  v_status text;
  v_qc text;
  v_next text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select patient_id, assessment_id
    into v_patient, v_assessment
  from public.pulse_operator_sessions
  where id = p_session_id;

  if v_patient is null then raise exception 'Operator session not found'; end if;
  if not public.pulse_operator_can_access_patient_v1(v_patient) then
    raise exception 'Operator access denied';
  end if;

  if p_action = 'start' then
    update public.pulse_operator_steps
      set status='running',
          started_at=coalesce(started_at,now()),
          updated_by=v_uid,
          updated_at=now()
    where operator_session_id=p_session_id and step_code=p_step_code
    returning status,qc_status into v_status,v_qc;

  elsif p_action = 'complete' then
    v_qc := coalesce(nullif(p_payload->>'qc_status',''),'pass');
    update public.pulse_operator_steps
      set status=case when v_qc='review' then 'review' else 'complete' end,
          qc_status=case
            when source_system='VALD' then v_qc
            else 'not_applicable'
          end,
          payload=payload || coalesce(p_payload,'{}'::jsonb),
          completed_at=now(),
          updated_by=v_uid,
          updated_at=now()
    where operator_session_id=p_session_id and step_code=p_step_code
    returning status,qc_status into v_status,v_qc;

  elsif p_action = 'flag' then
    update public.pulse_operator_steps
      set status='review',
          qc_status=case when source_system='VALD' then 'review' else qc_status end,
          payload=payload || coalesce(p_payload,'{}'::jsonb),
          completed_at=coalesce(completed_at,now()),
          updated_by=v_uid,
          updated_at=now()
    where operator_session_id=p_session_id and step_code=p_step_code
    returning status,qc_status into v_status,v_qc;

  elsif p_action = 'reset' then
    update public.pulse_operator_steps
      set status='pending',
          qc_status=case when source_system='VALD' then 'pending' else 'not_applicable' end,
          started_at=null,
          completed_at=null,
          updated_by=v_uid,
          updated_at=now()
    where operator_session_id=p_session_id and step_code=p_step_code
    returning status,qc_status into v_status,v_qc;
  else
    raise exception 'Unsupported action';
  end if;

  if v_status is null then raise exception 'Operator step not found'; end if;

  select step_code into v_next
  from public.pulse_operator_steps
  where operator_session_id=p_session_id
    and status not in ('complete','review','skipped')
  order by sequence_order
  limit 1;

  update public.pulse_operator_sessions
    set status='running',
        current_step_code=coalesce(v_next,p_step_code),
        updated_at=now()
  where id=p_session_id;

  insert into public.pulse_operator_events (
    operator_session_id, patient_id, assessment_id, actor_user_id,
    event_type, step_code, payload
  ) values (
    p_session_id, v_patient, v_assessment, v_uid,
    'step_'||p_action, p_step_code, coalesce(p_payload,'{}'::jsonb)
  );

  return jsonb_build_object(
    'session_id',p_session_id,
    'step_code',p_step_code,
    'status',v_status,
    'qc_status',v_qc,
    'next_step_code',v_next
  );
end;
$$;

revoke all on function public.pulse_operator_step_v1(uuid,text,text,jsonb) from public;
grant execute on function public.pulse_operator_step_v1(uuid,text,text,jsonb) to authenticated;

create or replace function public.finalize_pulse_operator_session_v1(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_patient uuid;
  v_assessment uuid;
  v_incomplete integer;
  v_review_steps integer;
  v_gate_count integer;
  v_result text;
  v_completed_at timestamptz := now();
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select patient_id,assessment_id
    into v_patient,v_assessment
  from public.pulse_operator_sessions
  where id=p_session_id;

  if v_patient is null then raise exception 'Operator session not found'; end if;
  if not public.pulse_operator_can_access_patient_v1(v_patient) then
    raise exception 'Operator access denied';
  end if;

  select count(*) into v_incomplete
  from public.pulse_operator_steps
  where operator_session_id=p_session_id
    and required=true
    and status not in ('complete','review','skipped');

  if v_incomplete > 0 then
    raise exception 'Required operator steps remain incomplete';
  end if;

  select count(*) into v_review_steps
  from public.pulse_operator_steps
  where operator_session_id=p_session_id
    and (status='review' or qc_status in ('review','fail'));

  select count(*) into v_gate_count
  from public.pulse_clinical_gates
  where patient_id=v_patient
    and status in ('open','review_required','referred')
    and severity in ('review','urgent');

  if v_review_steps > 0 or v_gate_count > 0 then
    v_result := 'review';
    update public.pulse_operator_sessions
      set status='review',completed_at=v_completed_at,current_step_code='qc_release',updated_at=now()
    where id=p_session_id;

    update public.assessments
      set status='review',completed_at=coalesce(completed_at,v_completed_at),updated_at=now()
    where id=v_assessment;
  else
    v_result := 'completed';
    update public.pulse_operator_sessions
      set status='completed',completed_at=v_completed_at,current_step_code='qc_release',updated_at=now()
    where id=p_session_id;

    update public.assessments
      set status='review',
          completeness=100,
          completed_at=coalesce(completed_at,v_completed_at),
          updated_at=now()
    where id=v_assessment;

    insert into public.pulse_checkpoints
      (patient_id,baseline_assessment_id,checkpoint_type,target_domain,scheduled_at,status,recorded_by)
    values
      (v_patient,v_assessment,'s2',null,v_completed_at + interval '14 days','planned',v_uid),
      (v_patient,v_assessment,'s6',null,v_completed_at + interval '42 days','planned',v_uid),
      (v_patient,v_assessment,'s12',null,v_completed_at + interval '84 days','planned',v_uid),
      (v_patient,v_assessment,'m6',null,v_completed_at + interval '6 months','planned',v_uid),
      (v_patient,v_assessment,'m12',null,v_completed_at + interval '12 months','planned',v_uid)
    on conflict (patient_id,baseline_assessment_id,checkpoint_type)
      where baseline_assessment_id is not null
    do nothing;
  end if;

  insert into public.pulse_operator_events (
    operator_session_id,patient_id,assessment_id,actor_user_id,event_type,payload
  ) values (
    p_session_id,v_patient,v_assessment,v_uid,'session_finalized',
    jsonb_build_object(
      'result_status',v_result,
      'review_steps',v_review_steps,
      'clinical_gates',v_gate_count
    )
  );

  return jsonb_build_object(
    'session_id',p_session_id,
    'assessment_id',v_assessment,
    'status',v_result,
    'review_steps',v_review_steps,
    'clinical_gates',v_gate_count,
    'checkpoints_created',case when v_result='completed' then true else false end
  );
end;
$$;

revoke all on function public.finalize_pulse_operator_session_v1(uuid) from public;
grant execute on function public.finalize_pulse_operator_session_v1(uuid) to authenticated;

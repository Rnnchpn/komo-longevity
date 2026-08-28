create or replace function private.require_center_confirmation_for_patient_booking()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if new.booking_source='patient' and new.status='confirmed' then
    new.status:='scheduled';
    new.intake_status:='not_sent';
  end if;
  return new;
end;
$$;

drop trigger if exists organization_appointments_patient_confirmation on public.organization_appointments;
create trigger organization_appointments_patient_confirmation
before insert on public.organization_appointments
for each row execute function private.require_center_confirmation_for_patient_booking();

create or replace function public.approve_komo_appointment(p_appointment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $$
declare
  uid uuid:=auth.uid();
  a public.organization_appointments%rowtype;
  result jsonb;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  select * into a from public.organization_appointments where id=p_appointment_id for update;
  if a.id is null then raise exception 'appointment_not_found'; end if;
  if a.status<>'scheduled' then raise exception 'appointment_not_pending'; end if;
  if not (
    a.assigned_user_id=uid
    or private.user_has_org_role(a.organization_id,array['owner','clinical_admin','physician','operator','coordinator']::text[])
    or private.user_is_global_admin()
  ) then raise exception 'appointment_access_denied'; end if;

  result:=public.update_pulse_appointment(a.id,'confirmed','invited');

  update public.patient_service_requests r
  set status='scheduled',accepted_at=coalesce(r.accepted_at,now()),updated_at=now()
  where r.patient_id=a.patient_id
    and r.service=a.appointment_type
    and r.scheduled_at=a.scheduled_start
    and r.status<>'cancelled';

  insert into public.audit_events(organization_id,patient_id,actor_user_id,event_type,entity_type,entity_id,event_detail)
  values(a.organization_id,a.patient_id,uid,'appointment.approved','appointment',a.id::text,jsonb_build_object('service',a.appointment_type,'scheduled_start',a.scheduled_start));
  return result;
end;
$$;

grant execute on function public.approve_komo_appointment(uuid) to authenticated;

create or replace function public.komo_score_benchmark(
  p_score numeric default null,
  p_algorithm_version text default 'motion-functional-index-v0.5-poc'
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  uid uuid:=auth.uid();
  n integer;
  mean_score numeric;
  median_score numeric;
  p25 numeric;
  p75 numeric;
  mean_mobility numeric;
  mean_symmetry numeric;
  pct numeric;
begin
  if uid is null then raise exception 'authentication_required'; end if;

  select count(*),avg(s.motion_score),percentile_cont(0.5) within group(order by s.motion_score),
         percentile_cont(0.25) within group(order by s.motion_score),percentile_cont(0.75) within group(order by s.motion_score),
         avg(case when jsonb_typeof(s.domain_scores->'mobility')='number' then (s.domain_scores->>'mobility')::numeric end),
         avg(case when jsonb_typeof(s.domain_scores->'myocare_symmetry')='number' then (s.domain_scores->>'myocare_symmetry')::numeric end)
  into n,mean_score,median_score,p25,p75,mean_mobility,mean_symmetry
  from public.scores s
  where s.release_status='released'
    and s.motion_score is not null
    and s.algorithm_version=p_algorithm_version;

  if n<5 then
    return jsonb_build_object('available',false,'n',n,'minimum',5,'algorithm_version',p_algorithm_version);
  end if;

  if p_score is not null then
    select 100.0*count(*) filter(where s.motion_score<=p_score)/nullif(count(*),0)
    into pct
    from public.scores s
    where s.release_status='released' and s.motion_score is not null and s.algorithm_version=p_algorithm_version;
  end if;

  return jsonb_build_object(
    'available',true,'n',n,'algorithm_version',p_algorithm_version,
    'mean',round(mean_score,1),'median',round(median_score,1),'p25',round(p25,1),'p75',round(p75,1),
    'mean_mobility',case when mean_mobility is null then null else round(mean_mobility,1) end,
    'mean_symmetry',case when mean_symmetry is null then null else round(mean_symmetry,1) end,
    'percentile',case when pct is null then null else round(pct,0) end
  );
end;
$$;

grant execute on function public.komo_score_benchmark(numeric,text) to authenticated;

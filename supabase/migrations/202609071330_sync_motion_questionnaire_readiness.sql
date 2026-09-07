create or replace function private.sync_motion_questionnaire_readiness()
returns trigger
language plpgsql
security definer
set search_path = public, private, auth
as $$
declare
  v_assessment_id uuid := coalesce(new.assessment_id, old.assessment_id);
  v_assessment public.assessments%rowtype;
  v_done integer := 0;
  v_started integer := 0;
begin
  select * into v_assessment
  from public.assessments
  where id = v_assessment_id;

  if v_assessment.id is null
     or v_assessment.product_mode <> 'motion'
     or v_assessment.scheduled_at is null then
    return null;
  end if;

  select
    count(*) filter (where qs.status = 'completed' and coalesce(qs.completeness,0) >= 100),
    count(*)
  into v_done, v_started
  from public.questionnaire_sessions qs
  where qs.assessment_id = v_assessment.id
    and qs.instrument_code = any(array[
      'KOMO_BASELINE_CORE',
      'KOMO_MOBILITY_25',
      'KOMO_SLEEP_RECOVERY',
      'KOMO_WELLBEING',
      'KOMO_LIFESTYLE',
      'KOMO_HEALTH_HISTORY'
    ]::text[]);

  update public.organization_appointments oa
  set
    intake_status = case
      when oa.intake_status = 'reviewed' then 'reviewed'
      when v_done >= 6 then 'submitted'
      when v_started > 0 then 'in_progress'
      else coalesce(oa.intake_status, 'invited')
    end,
    intake_submitted_at = case
      when v_done >= 6 then coalesce(oa.intake_submitted_at, now())
      when oa.intake_status = 'reviewed' then oa.intake_submitted_at
      else null
    end,
    updated_at = now()
  where oa.patient_id = v_assessment.patient_id
    and oa.appointment_type = 'motion'
    and oa.scheduled_start = v_assessment.scheduled_at
    and oa.status not in ('cancelled','no_show');

  return null;
end;
$$;

drop trigger if exists trg_sync_motion_questionnaire_readiness on public.questionnaire_sessions;
create trigger trg_sync_motion_questionnaire_readiness
after insert or update of status, completeness or delete
on public.questionnaire_sessions
for each row execute function private.sync_motion_questionnaire_readiness();

with readiness as (
  select
    a.id as assessment_id,
    a.patient_id,
    a.scheduled_at,
    count(qs.id) filter (
      where qs.instrument_code = any(array[
        'KOMO_BASELINE_CORE',
        'KOMO_MOBILITY_25',
        'KOMO_SLEEP_RECOVERY',
        'KOMO_WELLBEING',
        'KOMO_LIFESTYLE',
        'KOMO_HEALTH_HISTORY'
      ]::text[])
    ) as started_count,
    count(qs.id) filter (
      where qs.instrument_code = any(array[
        'KOMO_BASELINE_CORE',
        'KOMO_MOBILITY_25',
        'KOMO_SLEEP_RECOVERY',
        'KOMO_WELLBEING',
        'KOMO_LIFESTYLE',
        'KOMO_HEALTH_HISTORY'
      ]::text[])
      and qs.status = 'completed'
      and coalesce(qs.completeness,0) >= 100
    ) as done_count
  from public.assessments a
  left join public.questionnaire_sessions qs on qs.assessment_id = a.id
  where a.product_mode = 'motion'
    and a.status <> 'cancelled'
    and a.scheduled_at is not null
  group by a.id, a.patient_id, a.scheduled_at
)
update public.organization_appointments oa
set
  intake_status = case
    when oa.intake_status = 'reviewed' then 'reviewed'
    when r.done_count >= 6 then 'submitted'
    when r.started_count > 0 then 'in_progress'
    else coalesce(oa.intake_status, 'invited')
  end,
  intake_submitted_at = case
    when r.done_count >= 6 then coalesce(oa.intake_submitted_at, now())
    when oa.intake_status = 'reviewed' then oa.intake_submitted_at
    else null
  end,
  updated_at = now()
from readiness r
where oa.patient_id = r.patient_id
  and oa.appointment_type = 'motion'
  and oa.scheduled_start = r.scheduled_at
  and oa.status not in ('cancelled','no_show');

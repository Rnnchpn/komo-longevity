create or replace function public.komo_key_report_snapshot(p_patient_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid;
  v_consent_status text;
  v_latest date;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select p.patient_user_id
    into v_user_id
  from public.patients p
  where p.id = p_patient_id;

  if v_user_id is null then
    return jsonb_build_object(
      'available', false,
      'reason', 'patient_not_linked',
      'method_version', 'key-report-v1'
    );
  end if;

  if auth.uid() <> v_user_id and not private.user_can_access_patient(p_patient_id) then
    raise exception 'Not authorized';
  end if;

  select wc.status
    into v_consent_status
  from public.wearable_consents wc
  where wc.user_id = v_user_id
    and wc.purpose = 'connected_followup'
  order by coalesce(wc.consented_at, wc.created_at) desc
  limit 1;

  if coalesce(v_consent_status, '') <> 'active' then
    return jsonb_build_object(
      'available', false,
      'reason', 'consent_not_active',
      'method_version', 'key-report-v1'
    );
  end if;

  select max(m.metric_date)
    into v_latest
  from public.wearable_daily_metrics m
  where m.user_id = v_user_id;

  if v_latest is null then
    return jsonb_build_object(
      'available', false,
      'reason', 'no_data',
      'method_version', 'key-report-v1'
    );
  end if;

  with ranked as (
    select
      m.*,
      row_number() over (
        partition by m.metric_date
        order by
          ((m.steps is not null)::int +
           (m.distance_m is not null)::int +
           (m.active_minutes is not null)::int +
           (m.resting_hr is not null)::int +
           (m.hrv_ms is not null)::int +
           (m.spo2_avg is not null)::int +
           (m.sleep_minutes is not null)::int +
           (m.wear_minutes is not null)::int) desc,
          m.updated_at desc nulls last,
          m.created_at desc nulls last
      ) as rn
    from public.wearable_daily_metrics m
    where m.user_id = v_user_id
      and m.metric_date between (v_latest - 29) and v_latest
  ),
  daily as (
    select * from ranked where rn = 1
  ),
  current7 as (
    select
      count(*)::int as days_observed,
      round(count(*)::numeric / 7 * 100, 0) as coverage_pct,
      round(avg(steps), 0) as steps_avg,
      round(avg(distance_m), 0) as distance_m_avg,
      round(avg(active_minutes), 0) as active_minutes_avg,
      round(avg(sleep_minutes), 0) as sleep_minutes_avg,
      round(avg(resting_hr), 1) as resting_hr_avg,
      round(avg(avg_hr), 1) as avg_hr_avg,
      round(avg(hrv_ms), 1) as hrv_ms_avg,
      round(avg(spo2_avg), 1) as spo2_avg,
      round(avg(wear_minutes), 0) as wear_minutes_avg
    from daily
    where metric_date between (v_latest - 6) and v_latest
  ),
  previous7 as (
    select
      count(*)::int as days_observed,
      round(count(*)::numeric / 7 * 100, 0) as coverage_pct,
      round(avg(steps), 0) as steps_avg,
      round(avg(distance_m), 0) as distance_m_avg,
      round(avg(active_minutes), 0) as active_minutes_avg,
      round(avg(sleep_minutes), 0) as sleep_minutes_avg,
      round(avg(resting_hr), 1) as resting_hr_avg,
      round(avg(avg_hr), 1) as avg_hr_avg,
      round(avg(hrv_ms), 1) as hrv_ms_avg,
      round(avg(spo2_avg), 1) as spo2_avg,
      round(avg(wear_minutes), 0) as wear_minutes_avg
    from daily
    where metric_date between (v_latest - 13) and (v_latest - 7)
  ),
  current30 as (
    select
      count(*)::int as days_observed,
      round(count(*)::numeric / 30 * 100, 0) as coverage_pct,
      round(avg(steps), 0) as steps_avg,
      round(avg(distance_m), 0) as distance_m_avg,
      round(avg(active_minutes), 0) as active_minutes_avg,
      round(avg(sleep_minutes), 0) as sleep_minutes_avg,
      round(avg(resting_hr), 1) as resting_hr_avg,
      round(avg(hrv_ms), 1) as hrv_ms_avg,
      round(avg(spo2_avg), 1) as spo2_avg,
      round(avg(wear_minutes), 0) as wear_minutes_avg
    from daily
  ),
  daily14 as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'date', metric_date,
          'steps', steps,
          'distance_m', distance_m,
          'active_minutes', active_minutes,
          'sleep_minutes', sleep_minutes,
          'resting_hr', resting_hr,
          'avg_hr', avg_hr,
          'hrv_ms', hrv_ms,
          'spo2_avg', spo2_avg,
          'wear_minutes', wear_minutes,
          'day_wear_mode', day_wear_mode,
          'source', source,
          'source_quality', source_quality
        ) order by metric_date
      ), '[]'::jsonb
    ) as rows
    from daily
    where metric_date between (v_latest - 13) and v_latest
  ),
  sources as (
    select
      coalesce((select jsonb_agg(x.source order by x.source) from (select distinct source from daily where source is not null) x), '[]'::jsonb) as source_list,
      coalesce((select jsonb_agg(x.source_quality order by x.source_quality) from (select distinct source_quality from daily where source_quality is not null) x), '[]'::jsonb) as quality_list
  )
  select jsonb_build_object(
    'available', true,
    'reason', null,
    'method_version', 'key-report-v1',
    'latest_date', v_latest,
    'period', jsonb_build_object(
      'current_start', v_latest - 6,
      'current_end', v_latest,
      'previous_start', v_latest - 13,
      'previous_end', v_latest - 7
    ),
    'comparison_reliable', (c.days_observed >= 4 and p.days_observed >= 4),
    'current7', jsonb_build_object(
      'days_observed', c.days_observed,
      'coverage_pct', c.coverage_pct,
      'steps_avg', c.steps_avg,
      'distance_m_avg', c.distance_m_avg,
      'active_minutes_avg', c.active_minutes_avg,
      'sleep_minutes_avg', c.sleep_minutes_avg,
      'resting_hr_avg', c.resting_hr_avg,
      'avg_hr_avg', c.avg_hr_avg,
      'hrv_ms_avg', c.hrv_ms_avg,
      'spo2_avg', c.spo2_avg,
      'wear_minutes_avg', c.wear_minutes_avg
    ),
    'previous7', jsonb_build_object(
      'days_observed', p.days_observed,
      'coverage_pct', p.coverage_pct,
      'steps_avg', p.steps_avg,
      'distance_m_avg', p.distance_m_avg,
      'active_minutes_avg', p.active_minutes_avg,
      'sleep_minutes_avg', p.sleep_minutes_avg,
      'resting_hr_avg', p.resting_hr_avg,
      'avg_hr_avg', p.avg_hr_avg,
      'hrv_ms_avg', p.hrv_ms_avg,
      'spo2_avg', p.spo2_avg,
      'wear_minutes_avg', p.wear_minutes_avg
    ),
    'current30', jsonb_build_object(
      'days_observed', m.days_observed,
      'coverage_pct', m.coverage_pct,
      'steps_avg', m.steps_avg,
      'distance_m_avg', m.distance_m_avg,
      'active_minutes_avg', m.active_minutes_avg,
      'sleep_minutes_avg', m.sleep_minutes_avg,
      'resting_hr_avg', m.resting_hr_avg,
      'hrv_ms_avg', m.hrv_ms_avg,
      'spo2_avg', m.spo2_avg,
      'wear_minutes_avg', m.wear_minutes_avg
    ),
    'changes', jsonb_build_object(
      'steps_pct', case when p.steps_avg is not null and p.steps_avg <> 0 and c.steps_avg is not null then round((c.steps_avg - p.steps_avg) / p.steps_avg * 100, 1) end,
      'distance_pct', case when p.distance_m_avg is not null and p.distance_m_avg <> 0 and c.distance_m_avg is not null then round((c.distance_m_avg - p.distance_m_avg) / p.distance_m_avg * 100, 1) end,
      'active_minutes_pct', case when p.active_minutes_avg is not null and p.active_minutes_avg <> 0 and c.active_minutes_avg is not null then round((c.active_minutes_avg - p.active_minutes_avg) / p.active_minutes_avg * 100, 1) end,
      'sleep_minutes_delta', case when p.sleep_minutes_avg is not null and c.sleep_minutes_avg is not null then round(c.sleep_minutes_avg - p.sleep_minutes_avg, 0) end,
      'resting_hr_delta_bpm', case when p.resting_hr_avg is not null and c.resting_hr_avg is not null then round(c.resting_hr_avg - p.resting_hr_avg, 1) end,
      'hrv_pct', case when p.hrv_ms_avg is not null and p.hrv_ms_avg <> 0 and c.hrv_ms_avg is not null then round((c.hrv_ms_avg - p.hrv_ms_avg) / p.hrv_ms_avg * 100, 1) end,
      'spo2_delta_points', case when p.spo2_avg is not null and c.spo2_avg is not null then round(c.spo2_avg - p.spo2_avg, 1) end,
      'coverage_delta_points', round(c.coverage_pct - p.coverage_pct, 0)
    ),
    'daily14', d.rows,
    'sources', s.source_list,
    'source_quality', s.quality_list,
    'method', jsonb_build_object(
      'average_basis', 'observed_days_only',
      'window_anchor', 'latest_available_metric_date',
      'clinical_score_effect', 'none',
      'interpretation', 'descriptive_longitudinal'
    )
  ) into v_result
  from current7 c
  cross join previous7 p
  cross join current30 m
  cross join daily14 d
  cross join sources s;

  return v_result;
end;
$$;

revoke all on function public.komo_key_report_snapshot(uuid) from public;
grant execute on function public.komo_key_report_snapshot(uuid) to authenticated;

comment on function public.komo_key_report_snapshot(uuid) is
'Consent-gated longitudinal KŌMØ KEY snapshot for patient/self PDF reporting. Returns normalized weekly and 30-day aggregates only; never recalculates Motion or Clinical scores.';

-- KŌMØ Pulse — Motion Today estimated preview v1
-- Keeps canonical Motion Today rules unchanged. A preview is returned only when
-- provisional wearable-derived inputs exist in wearable_daily_metrics.raw_payload.

create or replace function public.komo_motion_today_v1()
returns jsonb
language plpgsql
set search_path to ''
as $function$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_connected boolean := false;
  v_metric_date date;
  v_steps integer;
  v_sleep integer;
  v_rhr numeric;
  v_steps_usual numeric;
  v_sleep_usual numeric;
  v_rhr_usual numeric;
  v_steps_days integer := 0;
  v_sleep_days integer := 0;
  v_rhr_days integer := 0;
  v_steps_score numeric;
  v_sleep_score numeric;
  v_rhr_score numeric;
  v_score integer;
  v_status text := 'incomplete';
  v_message text := 'Sync your wearable';

  v_est_sleep numeric;
  v_est_rhr numeric;
  v_est_sleep_usual numeric;
  v_est_rhr_usual numeric;
  v_est_sleep_days integer := 0;
  v_est_rhr_days integer := 0;
  v_est_steps_score numeric;
  v_est_sleep_score numeric;
  v_est_rhr_score numeric;
  v_est_score integer;
  v_est_status text;
  v_est_message text;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select exists(
    select 1
    from public.wearable_consents c
    where c.user_id = v_user
      and c.purpose = 'connected_followup'
      and c.status = 'active'
  ) into v_connected;

  if not v_connected then
    return jsonb_build_object(
      'connected', false,
      'ready', false,
      'status', 'disconnected',
      'message', 'Connect your wearable',
      'score', null,
      'preview', jsonb_build_object('available', false)
    );
  end if;

  select max(w.metric_date)
    into v_metric_date
  from public.wearable_daily_metrics w
  where w.user_id = v_user
    and w.metric_date <= v_today
    and w.source_quality = 'consumer_wearable'
    and lower(coalesce(w.source, '')) not like 'manual%'
    and (w.steps is not null or w.sleep_minutes is not null or w.resting_hr is not null);

  if v_metric_date is null then
    return jsonb_build_object(
      'connected', true,
      'ready', false,
      'status', 'incomplete',
      'message', 'Sync your wearable',
      'score', null,
      'preview', jsonb_build_object('available', false)
    );
  end if;

  select w.steps
    into v_steps
  from public.wearable_daily_metrics w
  where w.user_id = v_user
    and w.metric_date = v_metric_date
    and w.steps is not null
    and w.source_quality = 'consumer_wearable'
    and lower(coalesce(w.source, '')) not like 'manual%'
  order by w.updated_at desc
  limit 1;

  select w.sleep_minutes
    into v_sleep
  from public.wearable_daily_metrics w
  where w.user_id = v_user
    and w.metric_date = v_metric_date
    and w.sleep_minutes is not null
    and w.source_quality = 'consumer_wearable'
    and lower(coalesce(w.source, '')) not like 'manual%'
  order by w.updated_at desc
  limit 1;

  select w.resting_hr
    into v_rhr
  from public.wearable_daily_metrics w
  where w.user_id = v_user
    and w.metric_date = v_metric_date
    and w.resting_hr is not null
    and w.source_quality = 'consumer_wearable'
    and lower(coalesce(w.source, '')) not like 'manual%'
  order by w.updated_at desc
  limit 1;

  with daily as (
    select distinct on (w.metric_date) w.metric_date, w.steps
    from public.wearable_daily_metrics w
    where w.user_id = v_user
      and w.metric_date between (v_metric_date - 28) and (v_metric_date - 1)
      and w.steps is not null
      and w.source_quality = 'consumer_wearable'
      and lower(coalesce(w.source, '')) not like 'manual%'
    order by w.metric_date, w.updated_at desc
  )
  select percentile_cont(0.5) within group (order by steps)::numeric, count(*)::integer
    into v_steps_usual, v_steps_days
  from daily;

  with daily as (
    select distinct on (w.metric_date) w.metric_date, w.sleep_minutes
    from public.wearable_daily_metrics w
    where w.user_id = v_user
      and w.metric_date between (v_metric_date - 28) and (v_metric_date - 1)
      and w.sleep_minutes is not null
      and w.source_quality = 'consumer_wearable'
      and lower(coalesce(w.source, '')) not like 'manual%'
    order by w.metric_date, w.updated_at desc
  )
  select percentile_cont(0.5) within group (order by sleep_minutes)::numeric, count(*)::integer
    into v_sleep_usual, v_sleep_days
  from daily;

  with daily as (
    select distinct on (w.metric_date) w.metric_date, w.resting_hr
    from public.wearable_daily_metrics w
    where w.user_id = v_user
      and w.metric_date between (v_metric_date - 28) and (v_metric_date - 1)
      and w.resting_hr is not null
      and w.source_quality = 'consumer_wearable'
      and lower(coalesce(w.source, '')) not like 'manual%'
    order by w.metric_date, w.updated_at desc
  )
  select percentile_cont(0.5) within group (order by resting_hr)::numeric, count(*)::integer
    into v_rhr_usual, v_rhr_days
  from daily;

  if v_steps is not null and v_steps_usual is not null and v_steps_usual > 0 and v_steps_days >= 14 then
    v_steps_score := greatest(40::numeric, least(100::numeric,
      80 + (0.5 * (100 * ((v_steps::numeric / v_steps_usual) - 1)))
    ));
  end if;

  if v_sleep is not null and v_sleep_usual is not null and v_sleep_days >= 14 then
    v_sleep_score := greatest(40::numeric, least(100::numeric,
      80 + (0.15 * (v_sleep::numeric - v_sleep_usual))
    ));
  end if;

  if v_rhr is not null and v_rhr_usual is not null and v_rhr_days >= 14 then
    v_rhr_score := greatest(40::numeric, least(100::numeric,
      80 + (1.5 * (v_rhr_usual - v_rhr))
    ));
  end if;

  if v_steps_score is not null and v_sleep_score is not null and v_rhr_score is not null then
    v_score := round((0.40 * v_steps_score) + (0.35 * v_sleep_score) + (0.25 * v_rhr_score))::integer;
    if v_score >= 80 then
      v_status := 'strong';
      v_message := 'You’re moving well';
    elsif v_score >= 65 then
      v_status := 'steady';
      v_message := 'Stay steady today';
    else
      v_status := 'focus';
      v_message := 'Take it easier today';
    end if;
  elsif v_steps is not null or v_sleep is not null or v_rhr is not null then
    v_status := 'baseline';
    v_message := 'Building your baseline';
  end if;

  select
    nullif(w.raw_payload #>> '{motion_today_estimate,in_bed_minutes}', '')::numeric,
    nullif(w.raw_payload #>> '{motion_today_estimate,nocturnal_hr_median}', '')::numeric
  into v_est_sleep, v_est_rhr
  from public.wearable_daily_metrics w
  where w.user_id = v_user
    and w.metric_date = v_metric_date
    and w.source_quality = 'consumer_wearable'
    and lower(coalesce(w.source, '')) not like 'manual%'
    and w.raw_payload ? 'motion_today_estimate'
  order by w.updated_at desc
  limit 1;

  with daily as (
    select distinct on (w.metric_date)
      w.metric_date,
      nullif(w.raw_payload #>> '{motion_today_estimate,in_bed_minutes}', '')::numeric as value
    from public.wearable_daily_metrics w
    where w.user_id = v_user
      and w.metric_date between (v_metric_date - 28) and (v_metric_date - 1)
      and w.source_quality = 'consumer_wearable'
      and lower(coalesce(w.source, '')) not like 'manual%'
      and w.raw_payload ? 'motion_today_estimate'
      and nullif(w.raw_payload #>> '{motion_today_estimate,in_bed_minutes}', '') is not null
    order by w.metric_date, w.updated_at desc
  )
  select percentile_cont(0.5) within group (order by value)::numeric, count(*)::integer
  into v_est_sleep_usual, v_est_sleep_days
  from daily;

  with daily as (
    select distinct on (w.metric_date)
      w.metric_date,
      nullif(w.raw_payload #>> '{motion_today_estimate,nocturnal_hr_median}', '')::numeric as value
    from public.wearable_daily_metrics w
    where w.user_id = v_user
      and w.metric_date between (v_metric_date - 28) and (v_metric_date - 1)
      and w.source_quality = 'consumer_wearable'
      and lower(coalesce(w.source, '')) not like 'manual%'
      and w.raw_payload ? 'motion_today_estimate'
      and nullif(w.raw_payload #>> '{motion_today_estimate,nocturnal_hr_median}', '') is not null
    order by w.metric_date, w.updated_at desc
  )
  select percentile_cont(0.5) within group (order by value)::numeric, count(*)::integer
  into v_est_rhr_usual, v_est_rhr_days
  from daily;

  if v_score is null and v_steps is not null and v_steps_usual is not null and v_steps_usual > 0 and v_steps_days >= 1 then
    v_est_steps_score := greatest(40::numeric, least(100::numeric,
      80 + (0.5 * (100 * ((v_steps::numeric / v_steps_usual) - 1)))
    ));
  end if;

  if v_score is null and v_est_sleep is not null and v_est_sleep_usual is not null and v_est_sleep_days >= 1 then
    v_est_sleep_score := greatest(40::numeric, least(100::numeric,
      80 + (0.15 * (v_est_sleep - v_est_sleep_usual))
    ));
  end if;

  if v_score is null and v_est_rhr is not null and v_est_rhr_usual is not null and v_est_rhr_days >= 1 then
    v_est_rhr_score := greatest(40::numeric, least(100::numeric,
      80 + (1.5 * (v_est_rhr_usual - v_est_rhr))
    ));
  end if;

  if v_est_steps_score is not null and v_est_sleep_score is not null and v_est_rhr_score is not null then
    v_est_score := round((0.40 * v_est_steps_score) + (0.35 * v_est_sleep_score) + (0.25 * v_est_rhr_score))::integer;
    if v_est_score >= 80 then
      v_est_status := 'strong';
      v_est_message := 'You’re moving well';
    elsif v_est_score >= 65 then
      v_est_status := 'steady';
      v_est_message := 'Stay steady today';
    else
      v_est_status := 'focus';
      v_est_message := 'Take it easier today';
    end if;
  end if;

  return jsonb_build_object(
    'connected', true,
    'ready', v_score is not null,
    'date', v_metric_date,
    'score', v_score,
    'status', v_status,
    'message', v_message,
    'steps', jsonb_build_object(
      'value', v_steps,
      'usual', case when v_steps_usual is null then null else round(v_steps_usual)::integer end,
      'delta_pct', case when v_steps is null or v_steps_usual is null or v_steps_usual = 0 then null else round(100 * ((v_steps::numeric / v_steps_usual) - 1))::integer end,
      'baseline_days', v_steps_days,
      'score', case when v_steps_score is null then null else round(v_steps_score, 2) end
    ),
    'sleep', jsonb_build_object(
      'value_minutes', v_sleep,
      'usual_minutes', case when v_sleep_usual is null then null else round(v_sleep_usual)::integer end,
      'delta_minutes', case when v_sleep is null or v_sleep_usual is null then null else round(v_sleep::numeric - v_sleep_usual)::integer end,
      'baseline_days', v_sleep_days,
      'score', case when v_sleep_score is null then null else round(v_sleep_score, 2) end
    ),
    'resting_hr', jsonb_build_object(
      'value', case when v_rhr is null then null else round(v_rhr, 1) end,
      'usual', case when v_rhr_usual is null then null else round(v_rhr_usual, 1) end,
      'delta', case when v_rhr is null or v_rhr_usual is null then null else round(v_rhr - v_rhr_usual, 1) end,
      'baseline_days', v_rhr_days,
      'score', case when v_rhr_score is null then null else round(v_rhr_score, 2) end
    ),
    'preview', jsonb_build_object(
      'available', v_est_score is not null,
      'estimated', true,
      'score', v_est_score,
      'status', v_est_status,
      'message', v_est_message,
      'steps', jsonb_build_object(
        'value', v_steps,
        'usual', case when v_steps_usual is null then null else round(v_steps_usual)::integer end,
        'delta_pct', case when v_steps is null or v_steps_usual is null or v_steps_usual = 0 then null else round(100 * ((v_steps::numeric / v_steps_usual) - 1))::integer end,
        'baseline_days', v_steps_days,
        'score', case when v_est_steps_score is null then null else round(v_est_steps_score, 2) end
      ),
      'sleep', jsonb_build_object(
        'value_minutes', case when v_est_sleep is null then null else round(v_est_sleep)::integer end,
        'usual_minutes', case when v_est_sleep_usual is null then null else round(v_est_sleep_usual)::integer end,
        'delta_minutes', case when v_est_sleep is null or v_est_sleep_usual is null then null else round(v_est_sleep - v_est_sleep_usual)::integer end,
        'baseline_days', v_est_sleep_days,
        'score', case when v_est_sleep_score is null then null else round(v_est_sleep_score, 2) end
      ),
      'resting_hr', jsonb_build_object(
        'value', case when v_est_rhr is null then null else round(v_est_rhr, 1) end,
        'usual', case when v_est_rhr_usual is null then null else round(v_est_rhr_usual, 1) end,
        'delta', case when v_est_rhr is null or v_est_rhr_usual is null then null else round(v_est_rhr - v_est_rhr_usual, 1) end,
        'baseline_days', v_est_rhr_days,
        'score', case when v_est_rhr_score is null then null else round(v_est_rhr_score, 2) end
      )
    ),
    'weights', jsonb_build_object('steps', 0.40, 'sleep', 0.35, 'resting_hr', 0.25),
    'baseline_window_days', 28,
    'minimum_baseline_days', 14,
    'algorithm_version', 'motion-today-v1.1'
  );
end;
$function$;

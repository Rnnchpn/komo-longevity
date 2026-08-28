-- Align the engagement API with KŌMØ Wallet v1 and backfill idempotent verified-XP rewards.

create or replace function public.komo_engagement_summary()
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_steps integer := 0;
  v_step_xp integer := 0;
  v_xp integer := 0;
  v_today_xp integer := 0;
  v_points integer := 0;
  v_verified_xp integer := 0;
  v_level integer := 1;
  v_level_pct integer := 0;
  v_next integer := 500;
  v_streak integer := 0;
  v_cursor date;
  v_challenges jsonb := '[]'::jsonb;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='42501'; end if;
  perform private.komo_sync_engagement_milestones(v_user);
  perform private.komo_sync_points(v_user);

  select coalesce(value,0) into v_steps
  from public.komo_activity_entries
  where user_id=v_user and activity_date=v_today and activity_type='steps';

  v_step_xp := public.komo_steps_xp(v_steps);
  select coalesce(sum(xp_amount),0)::integer into v_xp from public.komo_xp_ledger where user_id=v_user;
  select coalesce(sum(xp_amount),0)::integer into v_today_xp from public.komo_xp_ledger where user_id=v_user and occurred_on=v_today;
  select coalesce(sum(xp_amount),0)::integer into v_verified_xp from public.komo_xp_ledger where user_id=v_user and point_eligible=true;
  select coalesce(sum(points_delta),0)::integer into v_points from public.komo_points_ledger where user_id=v_user;

  v_level := floor(v_xp/500.0)::integer + 1;
  v_level_pct := ((v_xp % 500) * 100 / 500)::integer;
  v_next := 500 - (v_xp % 500);

  v_cursor := v_today;
  if not exists(
    select 1 from public.komo_xp_ledger
    where user_id=v_user and occurred_on=v_cursor and event_type in ('steps','challenge') and xp_amount>0
  ) then
    v_cursor := v_today - 1;
  end if;

  while exists(
    select 1 from public.komo_xp_ledger
    where user_id=v_user and occurred_on=v_cursor and event_type in ('steps','challenge') and xp_amount>0
  ) loop
    v_streak := v_streak + 1;
    v_cursor := v_cursor - 1;
    exit when v_streak >= 365;
  end loop;

  with daily as (
    select c.* from public.komo_challenges c
    where c.active=true
    order by md5(c.slug || v_today::text)
    limit 3
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'slug',d.slug,'title',d.title,'description',d.description,'category',d.category,
    'target_value',d.target_value,'unit',d.unit,'xp_reward',d.xp_reward,'safety_copy',d.safety_copy,
    'completed',exists(
      select 1 from public.komo_challenge_completions cc
      where cc.user_id=v_user and cc.challenge_id=d.id and cc.completed_on=v_today
    )
  ) order by d.sort_order),'[]'::jsonb)
  into v_challenges from daily d;

  return jsonb_build_object(
    'date',v_today,
    'steps',v_steps,
    'step_xp',v_step_xp,
    'xp_total',v_xp,
    'xp_today',v_today_xp,
    'verified_xp',v_verified_xp,
    'level',v_level,
    'level_pct',v_level_pct,
    'xp_to_next_level',v_next,
    'streak_days',v_streak,
    'points',v_points,
    'points_rule',jsonb_build_object(
      'verified_xp_threshold',500,
      'points_awarded',250,
      'kp_per_euro',100,
      'minimum_redemption_kp',500,
      'redeemable',true
    ),
    'challenges',v_challenges
  );
end;
$$;

-- Existing users receive the wallet rewards their verified progression already earned.
do $$
declare r record;
begin
  for r in select distinct user_id from public.komo_xp_ledger loop
    perform private.komo_sync_points(r.user_id);
  end loop;
end $$;

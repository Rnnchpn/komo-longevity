-- KŌMØ progression v1.1
-- Nonlinear levels + repeatable spendable-value XP only from validated Motion/Clinical care.

update public.komo_xp_ledger
set point_eligible=false, updated_at=now()
where event_key in ('milestone:profile','milestone:photo','milestone:start','milestone:appointment','milestone:motion','milestone:clinical')
  and point_eligible=true;

create or replace function private.komo_sync_engagement_milestones(p_user uuid)
returns void
language plpgsql
security definer
set search_path to 'public','private','auth'
as $$
declare
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_profile_complete boolean := false;
  v_has_photo boolean := false;
  v_start boolean := false;
  v_appointment boolean := false;
  r record;
begin
  select
    (first_name is not null and last_name is not null and birth_date is not null and sex_at_birth is not null),
    (avatar_path is not null and length(trim(avatar_path)) > 0)
  into v_profile_complete,v_has_photo
  from public.profiles where id=p_user;

  select exists(
    select 1 from public.pulse_assessments pa
    where pa.user_id=p_user and pa.protocol_version='mobility-check-v1'
      and pa.responses #>> '{baseline,completed_at}' is not null
      and pa.responses #>> '{chair_stand,completed_at}' is not null
      and pa.responses #>> '{two_step,completed_at}' is not null
  ) into v_start;

  select exists(
    select 1 from public.organization_appointments oa
    join public.patients p on p.id=oa.patient_id
    where p.patient_user_id=p_user and oa.status not in ('cancelled','no_show')
  ) into v_appointment;

  if v_profile_complete then
    insert into public.komo_xp_ledger(user_id,event_key,event_type,xp_amount,point_eligible,occurred_on,metadata)
    values(p_user,'milestone:profile','milestone',100,false,v_today,'{"label":"Profil complété","wallet_eligible":false}'::jsonb)
    on conflict(user_id,event_key) do update set point_eligible=false,metadata=excluded.metadata,updated_at=now();
  end if;
  if v_has_photo then
    insert into public.komo_xp_ledger(user_id,event_key,event_type,xp_amount,point_eligible,occurred_on,metadata)
    values(p_user,'milestone:photo','milestone',50,false,v_today,'{"label":"Photo de profil","wallet_eligible":false}'::jsonb)
    on conflict(user_id,event_key) do update set point_eligible=false,metadata=excluded.metadata,updated_at=now();
  end if;
  if v_start then
    insert into public.komo_xp_ledger(user_id,event_key,event_type,xp_amount,point_eligible,occurred_on,metadata)
    values(p_user,'milestone:start','milestone',150,false,v_today,'{"label":"KŌMØ Start","wallet_eligible":false}'::jsonb)
    on conflict(user_id,event_key) do update set point_eligible=false,metadata=excluded.metadata,updated_at=now();
  end if;
  if v_appointment then
    insert into public.komo_xp_ledger(user_id,event_key,event_type,xp_amount,point_eligible,occurred_on,metadata)
    values(p_user,'milestone:appointment','milestone',50,false,v_today,'{"label":"Premier rendez-vous","wallet_eligible":false}'::jsonb)
    on conflict(user_id,event_key) do update set point_eligible=false,metadata=excluded.metadata,updated_at=now();
  end if;

  for r in
    select distinct a.id,a.product_mode,
      (coalesce(a.released_at,a.validated_at,a.completed_at,a.updated_at,a.created_at) at time zone 'Europe/Paris')::date as occurred_on
    from public.assessments a
    join public.patients p on p.id=a.patient_id
    where p.patient_user_id=p_user
      and (
        (a.product_mode='motion'
          and exists(select 1 from public.scores s where s.assessment_id=a.id and s.motion_score is not null)
          and (a.status in ('validated','released','completed') or a.validated_at is not null or a.released_at is not null))
        or
        (a.product_mode='clinical'
          and (a.status in ('validated','released','completed') or a.validated_at is not null or a.released_at is not null))
      )
  loop
    insert into public.komo_xp_ledger(user_id,event_key,event_type,xp_amount,point_eligible,occurred_on,metadata)
    values(
      p_user,
      'care:'||r.product_mode||':'||r.id::text,
      'verified_care',
      case when r.product_mode='clinical' then 750 else 500 end,
      true,
      coalesce(r.occurred_on,v_today),
      jsonb_build_object(
        'label',case when r.product_mode='clinical' then 'KŌMØ Clinical validé' else 'KŌMØ Motion validé' end,
        'product_mode',r.product_mode,
        'assessment_id',r.id,
        'wallet_eligible',true,
        'policy','wallet-v1'
      )
    )
    on conflict(user_id,event_key) do nothing;
  end loop;
end;
$$;

create or replace function public.komo_engagement_summary()
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_steps integer := 0; v_step_xp integer := 0; v_xp integer := 0; v_today_xp integer := 0;
  v_points integer := 0; v_verified_xp integer := 0; v_level integer := 1; v_level_pct integer := 0;
  v_prev_threshold integer := 0; v_next_threshold integer := 500; v_next integer := 500;
  v_streak integer := 0; v_cursor date; v_challenges jsonb := '[]'::jsonb;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='42501'; end if;
  perform private.komo_sync_engagement_milestones(v_user);
  perform private.komo_sync_points(v_user);

  select coalesce(value,0) into v_steps from public.komo_activity_entries where user_id=v_user and activity_date=v_today and activity_type='steps';
  v_step_xp := public.komo_steps_xp(v_steps);
  select coalesce(sum(xp_amount),0)::integer into v_xp from public.komo_xp_ledger where user_id=v_user;
  select coalesce(sum(xp_amount),0)::integer into v_today_xp from public.komo_xp_ledger where user_id=v_user and occurred_on=v_today;
  select coalesce(sum(xp_amount),0)::integer into v_verified_xp from public.komo_xp_ledger where user_id=v_user and point_eligible=true;
  select coalesce(sum(points_delta),0)::integer into v_points from public.komo_points_ledger where user_id=v_user;

  if v_xp < 500 then v_level:=1; v_prev_threshold:=0; v_next_threshold:=500;
  elsif v_xp < 1500 then v_level:=2; v_prev_threshold:=500; v_next_threshold:=1500;
  elsif v_xp < 3000 then v_level:=3; v_prev_threshold:=1500; v_next_threshold:=3000;
  elsif v_xp < 5000 then v_level:=4; v_prev_threshold:=3000; v_next_threshold:=5000;
  elsif v_xp < 7500 then v_level:=5; v_prev_threshold:=5000; v_next_threshold:=7500;
  elsif v_xp < 10500 then v_level:=6; v_prev_threshold:=7500; v_next_threshold:=10500;
  elsif v_xp < 14000 then v_level:=7; v_prev_threshold:=10500; v_next_threshold:=14000;
  elsif v_xp < 18000 then v_level:=8; v_prev_threshold:=14000; v_next_threshold:=18000;
  elsif v_xp < 22500 then v_level:=9; v_prev_threshold:=18000; v_next_threshold:=22500;
  elsif v_xp < 27500 then v_level:=10; v_prev_threshold:=22500; v_next_threshold:=27500;
  elsif v_xp < 33000 then v_level:=11; v_prev_threshold:=27500; v_next_threshold:=33000;
  else
    v_level:=12 + floor((v_xp-33000)/6000.0)::integer;
    v_prev_threshold:=33000 + (v_level-12)*6000;
    v_next_threshold:=v_prev_threshold+6000;
  end if;
  v_next:=greatest(0,v_next_threshold-v_xp);
  v_level_pct:=least(100,greatest(0,round(((v_xp-v_prev_threshold)::numeric/nullif(v_next_threshold-v_prev_threshold,0))*100)::integer));

  v_cursor:=v_today;
  if not exists(select 1 from public.komo_xp_ledger where user_id=v_user and occurred_on=v_cursor and event_type in ('steps','challenge') and xp_amount>0) then v_cursor:=v_today-1; end if;
  while exists(select 1 from public.komo_xp_ledger where user_id=v_user and occurred_on=v_cursor and event_type in ('steps','challenge') and xp_amount>0) loop
    v_streak:=v_streak+1; v_cursor:=v_cursor-1; exit when v_streak>=365;
  end loop;

  with daily as (select c.* from public.komo_challenges c where c.active=true order by md5(c.slug||v_today::text) limit 3)
  select coalesce(jsonb_agg(jsonb_build_object(
    'slug',d.slug,'title',d.title,'description',d.description,'category',d.category,
    'target_value',d.target_value,'unit',d.unit,'xp_reward',d.xp_reward,'safety_copy',d.safety_copy,
    'completed',exists(select 1 from public.komo_challenge_completions cc where cc.user_id=v_user and cc.challenge_id=d.id and cc.completed_on=v_today)
  ) order by d.sort_order),'[]'::jsonb) into v_challenges from daily d;

  return jsonb_build_object(
    'date',v_today,'steps',v_steps,'step_xp',v_step_xp,'xp_total',v_xp,'xp_today',v_today_xp,
    'verified_xp',v_verified_xp,'level',v_level,'level_pct',v_level_pct,'xp_to_next_level',v_next,
    'level_floor_xp',v_prev_threshold,'level_ceiling_xp',v_next_threshold,
    'streak_days',v_streak,'points',v_points,
    'points_rule',jsonb_build_object(
      'verified_xp_threshold',500,'points_awarded',250,'kp_per_euro',100,'minimum_redemption_kp',500,'redeemable',true,
      'eligible_events',jsonb_build_array('motion_validated','clinical_validated')
    ),
    'challenges',v_challenges
  );
end;
$$;

do $$ declare r record; begin
  for r in select distinct user_id from public.komo_xp_ledger loop
    perform private.komo_sync_engagement_milestones(r.user_id);
    perform private.komo_sync_points(r.user_id);
  end loop;
end $$;

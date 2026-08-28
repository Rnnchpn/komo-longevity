-- KŌMØ Loyalty Wallet v1
-- XP = non-spendable progression. KŌMØ Points = spendable Life loyalty balance.

update public.komo_xp_ledger
set point_eligible=false, updated_at=now()
where event_type in ('steps','challenge') and point_eligible=true;

create table if not exists public.komo_point_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
  points_amount integer not null check (points_amount >= 500 and points_amount % 100 = 0),
  value_cents integer not null check (value_cents > 0),
  status text not null default 'reserved' check (status in ('reserved','redeemed','cancelled','expired')),
  channel text not null default 'life' check (channel='life'),
  checkout_session_id text unique,
  expires_at timestamptz not null default (now() + interval '45 minutes'),
  redeemed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists komo_point_redemptions_user_status_idx
  on public.komo_point_redemptions(user_id,status,expires_at desc);

alter table public.komo_point_redemptions enable row level security;
drop policy if exists "Users read own KŌMØ point redemptions" on public.komo_point_redemptions;
create policy "Users read own KŌMØ point redemptions"
  on public.komo_point_redemptions for select to authenticated
  using (auth.uid()=user_id);
grant select on public.komo_point_redemptions to authenticated;

create or replace function private.komo_sync_points(p_user uuid)
returns void language plpgsql security definer
set search_path to 'public','private','auth'
as $$
declare v_xp integer:=0; v_milestones integer:=0; i integer;
begin
  select coalesce(sum(xp_amount),0)::integer into v_xp
  from public.komo_xp_ledger where user_id=p_user and point_eligible=true;
  v_milestones:=floor(v_xp/500.0)::integer;
  if v_milestones>0 then
    for i in 1..v_milestones loop
      insert into public.komo_points_ledger(user_id,event_key,points_delta,reason,metadata)
      values(p_user,'verified-xp-milestone:'||i,250,'Progression KŌMØ vérifiée',jsonb_build_object('verified_xp_threshold',i*500,'policy','wallet-v1'))
      on conflict(user_id,event_key) do nothing;
    end loop;
  end if;
end;$$;

create or replace function public.komo_log_steps(p_steps integer,p_date date default null::date)
returns jsonb language plpgsql security definer
set search_path to 'public','private','auth'
as $$
declare v_user uuid:=auth.uid(); v_today date:=(now() at time zone 'Europe/Paris')::date; v_date date:=coalesce(p_date,v_today); v_xp integer;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='42501'; end if;
  if p_steps is null or p_steps<0 or p_steps>100000 then raise exception 'invalid_steps'; end if;
  if v_date<v_today-1 or v_date>v_today then raise exception 'invalid_activity_date'; end if;
  v_xp:=public.komo_steps_xp(p_steps);
  insert into public.komo_activity_entries(user_id,activity_date,activity_type,value,source)
  values(v_user,v_date,'steps',p_steps,'manual')
  on conflict(user_id,activity_date,activity_type) do update set value=excluded.value,source='manual',updated_at=now();
  insert into public.komo_xp_ledger(user_id,event_key,event_type,xp_amount,point_eligible,occurred_on,metadata)
  values(v_user,'steps:'||v_date::text,'steps',v_xp,false,v_date,jsonb_build_object('steps',p_steps,'source','manual','wallet_eligible',false))
  on conflict(user_id,event_key) do update set xp_amount=excluded.xp_amount,point_eligible=false,metadata=excluded.metadata,updated_at=now();
  perform private.komo_sync_engagement_milestones(v_user); perform private.komo_sync_points(v_user);
  return public.komo_engagement_summary();
end;$$;

create or replace function public.komo_complete_daily_challenge(p_slug text)
returns jsonb language plpgsql security definer
set search_path to 'public','private','auth'
as $$
declare v_user uuid:=auth.uid(); v_today date:=(now() at time zone 'Europe/Paris')::date; v_challenge public.komo_challenges%rowtype;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='42501'; end if;
  select c.* into v_challenge from public.komo_challenges c
  where c.slug=p_slug and c.active=true and c.slug in (
    select x.slug from (select slug from public.komo_challenges where active=true order by md5(slug||v_today::text) limit 3) x
  );
  if v_challenge.id is null then raise exception 'challenge_not_available_today'; end if;
  insert into public.komo_challenge_completions(user_id,challenge_id,completed_on,source,xp_awarded)
  values(v_user,v_challenge.id,v_today,'manual',v_challenge.xp_reward)
  on conflict(user_id,challenge_id,completed_on) do nothing;
  insert into public.komo_xp_ledger(user_id,event_key,event_type,xp_amount,point_eligible,occurred_on,metadata)
  values(v_user,'challenge:'||v_challenge.slug||':'||v_today::text,'challenge',v_challenge.xp_reward,false,v_today,jsonb_build_object('challenge',v_challenge.slug,'title',v_challenge.title,'wallet_eligible',false))
  on conflict(user_id,event_key) do update set point_eligible=false,updated_at=now();
  perform private.komo_sync_engagement_milestones(v_user); perform private.komo_sync_points(v_user);
  return public.komo_engagement_summary();
end;$$;

create or replace function public.komo_wallet_summary()
returns jsonb language plpgsql security definer
set search_path to 'public','private','auth'
as $$
declare
  v_user uuid:=auth.uid(); v_balance integer:=0; v_reserved integer:=0; v_available integer:=0;
  v_earned integer:=0; v_spent integer:=0; v_verified_xp integer:=0; v_progress integer:=0; v_to_next integer:=500;
  v_recent jsonb:='[]'::jsonb;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='42501'; end if;
  perform private.komo_sync_engagement_milestones(v_user); perform private.komo_sync_points(v_user);
  select coalesce(sum(points_delta),0)::integer,
         coalesce(sum(case when points_delta>0 then points_delta else 0 end),0)::integer,
         coalesce(abs(sum(case when points_delta<0 then points_delta else 0 end)),0)::integer
  into v_balance,v_earned,v_spent from public.komo_points_ledger where user_id=v_user;
  select coalesce(sum(points_amount),0)::integer into v_reserved
  from public.komo_point_redemptions where user_id=v_user and status='reserved' and expires_at>now();
  v_available:=greatest(0,v_balance-v_reserved);
  select coalesce(sum(xp_amount),0)::integer into v_verified_xp from public.komo_xp_ledger where user_id=v_user and point_eligible=true;
  v_progress:=v_verified_xp%500; v_to_next:=case when v_progress=0 and v_verified_xp>0 then 500 else 500-v_progress end;
  select coalesce(jsonb_agg(jsonb_build_object('event_key',x.event_key,'delta',x.points_delta,'reason',x.reason,'created_at',x.created_at,'metadata',x.metadata) order by x.created_at desc),'[]'::jsonb)
  into v_recent from (select * from public.komo_points_ledger where user_id=v_user order by created_at desc limit 8) x;
  return jsonb_build_object(
    'balance_kp',v_balance,'reserved_kp',v_reserved,'available_kp',v_available,'value_cents',v_available,
    'lifetime_earned_kp',v_earned,'lifetime_spent_kp',v_spent,'verified_xp',v_verified_xp,
    'verified_xp_progress',v_progress,'verified_xp_to_next_reward',v_to_next,
    'policy',jsonb_build_object('kp_per_euro',100,'minimum_redemption_kp',500,'redemption_step_kp',100,'verified_xp_threshold',500,'kp_awarded_per_threshold',250,'redeemable',true,'store_url','https://life.komolongevity.com/'),
    'recent_transactions',v_recent
  );
end;$$;

create or replace function public.komo_create_life_redemption(p_points integer)
returns jsonb language plpgsql security definer
set search_path to 'public','private','auth'
as $$
declare v_user uuid:=auth.uid(); v_wallet jsonb; v_available integer; v_row public.komo_point_redemptions%rowtype;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='42501'; end if;
  if p_points is null or p_points<500 or p_points%100<>0 then raise exception 'invalid_points_amount'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,71));
  v_wallet:=public.komo_wallet_summary(); v_available:=coalesce((v_wallet->>'available_kp')::integer,0);
  if p_points>v_available then raise exception 'insufficient_points'; end if;
  insert into public.komo_point_redemptions(user_id,points_amount,value_cents,status,channel)
  values(v_user,p_points,p_points,'reserved','life') returning * into v_row;
  return jsonb_build_object('id',v_row.id,'code',v_row.code,'points',v_row.points_amount,'value_cents',v_row.value_cents,'status',v_row.status,'expires_at',v_row.expires_at);
end;$$;

create or replace function public.komo_attach_life_checkout(p_redemption_id uuid,p_checkout_session_id text)
returns jsonb language plpgsql security definer
set search_path to 'public','private','auth'
as $$
declare v_user uuid:=auth.uid(); v_row public.komo_point_redemptions%rowtype;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='42501'; end if;
  if nullif(trim(p_checkout_session_id),'') is null then raise exception 'invalid_checkout_session'; end if;
  update public.komo_point_redemptions set checkout_session_id=p_checkout_session_id,updated_at=now()
  where id=p_redemption_id and user_id=v_user and status='reserved' and expires_at>now() and checkout_session_id is null returning * into v_row;
  if v_row.id is null then raise exception 'redemption_not_attachable'; end if;
  return jsonb_build_object('id',v_row.id,'status',v_row.status,'checkout_session_id',v_row.checkout_session_id);
end;$$;

create or replace function public.komo_finalize_life_redemption(p_redemption_id uuid,p_checkout_session_id text)
returns jsonb language plpgsql security definer
set search_path to 'public','private','auth'
as $$
declare v_user uuid:=auth.uid(); v_row public.komo_point_redemptions%rowtype;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,72));
  select * into v_row from public.komo_point_redemptions where id=p_redemption_id and user_id=v_user for update;
  if v_row.id is null then raise exception 'redemption_not_found'; end if;
  if v_row.status='redeemed' then return jsonb_build_object('id',v_row.id,'status','redeemed','points',v_row.points_amount); end if;
  if v_row.status<>'reserved' then raise exception 'redemption_not_reserved'; end if;
  if v_row.checkout_session_id is null or v_row.checkout_session_id<>p_checkout_session_id then raise exception 'checkout_session_mismatch'; end if;
  insert into public.komo_points_ledger(user_id,event_key,points_delta,reason,metadata)
  values(v_user,'life-redemption:'||v_row.id::text,-v_row.points_amount,'Utilisation sur KŌMØ Life',jsonb_build_object('redemption_id',v_row.id,'checkout_session_id',p_checkout_session_id,'policy','wallet-v1'))
  on conflict(user_id,event_key) do nothing;
  update public.komo_point_redemptions set status='redeemed',redeemed_at=now(),updated_at=now() where id=v_row.id;
  return jsonb_build_object('id',v_row.id,'status','redeemed','points',v_row.points_amount,'value_cents',v_row.value_cents);
end;$$;

create or replace function public.komo_cancel_life_redemption(p_redemption_id uuid)
returns jsonb language plpgsql security definer
set search_path to 'public','private','auth'
as $$
declare v_user uuid:=auth.uid(); v_row public.komo_point_redemptions%rowtype;
begin
  if v_user is null then raise exception 'not_authenticated' using errcode='42501'; end if;
  update public.komo_point_redemptions set status='cancelled',cancelled_at=now(),updated_at=now()
  where id=p_redemption_id and user_id=v_user and status='reserved' returning * into v_row;
  if v_row.id is null then raise exception 'redemption_not_cancellable'; end if;
  return jsonb_build_object('id',v_row.id,'status','cancelled');
end;$$;

grant execute on function public.komo_wallet_summary() to authenticated;
grant execute on function public.komo_create_life_redemption(integer) to authenticated;
grant execute on function public.komo_attach_life_checkout(uuid,text) to authenticated;
grant execute on function public.komo_finalize_life_redemption(uuid,text) to authenticated;
grant execute on function public.komo_cancel_life_redemption(uuid) to authenticated;

create table if not exists public.wearable_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null default 'connected_followup',
  consent_version text not null default '2026-08-29-v1',
  status text not null default 'active' check (status in ('active','withdrawn')),
  data_categories text[] not null default array['movement','sleep','heart_rate','spo2']::text[],
  accepted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists wearable_consents_one_active_idx
  on public.wearable_consents(user_id,purpose)
  where status='active';

alter table public.wearable_consents enable row level security;

create policy wearable_consents_select_self on public.wearable_consents
  for select to authenticated using ((select auth.uid()) = user_id);
create policy wearable_consents_insert_self on public.wearable_consents
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy wearable_consents_update_self on public.wearable_consents
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy wearable_consents_delete_self on public.wearable_consents
  for delete to authenticated using ((select auth.uid()) = user_id);

alter table public.wearable_daily_metrics
  add column if not exists day_wear_mode text,
  add column if not exists night_worn boolean;

do $$ begin
  alter table public.wearable_daily_metrics add constraint wearable_daily_wear_mode_check
    check (day_wear_mode is null or day_wear_mode in ('pocket','belt','keychain','mixed','unknown'));
exception when duplicate_object then null; end $$;

revoke all on table public.wearable_devices from anon;
revoke all on table public.wearable_daily_metrics from anon;
revoke all on table public.wearable_measurements from anon;
revoke all on table public.wearable_consents from anon;

revoke truncate, references, trigger on table public.wearable_devices from authenticated;
revoke truncate, references, trigger on table public.wearable_daily_metrics from authenticated;
revoke truncate, references, trigger on table public.wearable_measurements from authenticated;
revoke truncate, references, trigger on table public.wearable_consents from authenticated;

grant select, insert, update, delete on table public.wearable_devices to authenticated;
grant select, insert, update, delete on table public.wearable_daily_metrics to authenticated;
grant select, insert, update, delete on table public.wearable_measurements to authenticated;
grant select, insert, update, delete on table public.wearable_consents to authenticated;

comment on table public.wearable_consents is 'Explicit connected-followup consent audit trail for KŌMØ wearable data.';
comment on column public.wearable_daily_metrics.day_wear_mode is 'Daytime wear mode: pocket, belt, keychain, mixed, unknown.';
comment on column public.wearable_daily_metrics.night_worn is 'Whether the device was worn against the body during the associated night.';
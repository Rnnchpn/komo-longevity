-- Applied to Supabase project uqlolefsiktbznnymriy on 2026-10-29.
-- Additive schema only: legacy patients, assessments and reports unchanged.
create table if not exists public.motion_online_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 appointment_id text not null unique check (appointment_id ~ '^[1-9][0-9]{0,11}$'),
 status text not null default 'draft' check (status in ('draft','completed')),
 snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(snapshot)='object' and octet_length(snapshot::text)<=24000),
 questionnaire_version text not null default 'KOMO_MOTION_SELF_REPORT_V1',
 protocol_version text not null default 'KOMO_MOTION_ONLINE_V9',
 consent_version text not null check(length(consent_version) between 8 and 80),
 consent_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists motion_online_sessions_user_updated_idx
 on public.motion_online_sessions(user_id,updated_at desc);
alter table public.motion_online_sessions enable row level security;
revoke all on public.motion_online_sessions from public,anon,authenticated;
grant select on public.motion_online_sessions to authenticated;
drop policy if exists motion_online_sessions_select_owner on public.motion_online_sessions;
create policy motion_online_sessions_select_owner on public.motion_online_sessions
 for select to authenticated using (user_id=(select auth.uid()));
comment on table public.motion_online_sessions is
 'Paid Motion Online nonmedical self-report sessions. Edge Function is exclusive writer; no image/video/audio.';

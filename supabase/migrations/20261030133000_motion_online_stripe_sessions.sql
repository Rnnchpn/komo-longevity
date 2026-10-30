-- Isolated Stripe-backed Motion Online dossiers. No direct browser or public table access.
-- Existing Acuity-backed motion_online_sessions is left unchanged.
create table if not exists public.motion_online_stripe_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 checkout_session_id text not null unique
   constraint motion_online_stripe_checkout_format check
    (checkout_session_id ~ '^cs_(test|live)_[A-Za-z0-9]{8,200}$'),
 status text not null default 'draft'
   constraint motion_online_stripe_status_check check (status in ('draft','completed')),
 snapshot jsonb not null default '{}'::jsonb
   constraint motion_online_stripe_snapshot_check check
    (jsonb_typeof(snapshot)='object' and octet_length(snapshot::text)<=24000),
 questionnaire_version text not null default 'KOMO_MOTION_SELF_REPORT_V1',
 protocol_version text not null default 'KOMO_MOTION_ONLINE_V9',
 consent_version text not null constraint motion_online_stripe_consent_version_check
    check (length(consent_version) between 8 and 80),
 consent_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists motion_online_stripe_by_user on public.motion_online_stripe_sessions(user_id,updated_at desc);
alter table public.motion_online_stripe_sessions enable row level security;
revoke all on table public.motion_online_stripe_sessions from public,anon,authenticated;
grant all on table public.motion_online_stripe_sessions to service_role;
-- No RLS policy is intentionally defined: only the server-only service role may reach
-- this table, and only after JWT + signed Stripe payment validation.

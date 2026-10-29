-- Private audit trail for KŌMØ non-medical Motion Online restitution reads.
-- Only a server-side verified admin (through motion-online-operator) may read
-- patient snapshots. The existing patient-only RLS is NOT relaxed.
create table if not exists public.motion_online_operator_audit (
 id bigint generated always as identity primary key,
 operator_id uuid not null references auth.users(id) on delete cascade,
 appointment_id text not null check (appointment_id ~ '^[1-9][0-9]{0,11}$'),
 action text not null check (action in ('status','load')),
 accessed_at timestamptz not null default now()
);
create index if not exists motion_online_operator_audit_operator_time_idx
 on public.motion_online_operator_audit(operator_id,accessed_at desc);
alter table public.motion_online_operator_audit enable row level security;
revoke all on public.motion_online_operator_audit from anon, authenticated, public;
-- No access policies: service_role only. Even an admin cannot query directly in browser.
comment on table public.motion_online_operator_audit is 'Server-side access events for verified KŌMŌ admins reviewing non-medical online consultations.';

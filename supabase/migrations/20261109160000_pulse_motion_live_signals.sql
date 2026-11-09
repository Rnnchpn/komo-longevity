-- KŌMØ Pulse Motion test-only camera pairing (WebRTC signaling; no video storage).
-- All reads/writes go through the authenticated motion-live-test Edge Function.
create table if not exists public.pulse_motion_live_signals (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.pulse_motion_live_sessions(id) on delete cascade,
  sender text not null check (sender in ('guest','operator')),
  connection_id uuid not null,
  kind text not null check (kind in ('watch','offer','answer','stop')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint pulse_motion_live_signal_size check (octet_length(payload::text) <= 40000)
);
create index if not exists pulse_motion_live_signals_session_cursor_idx on public.pulse_motion_live_signals(session_id,id);
alter table public.pulse_motion_live_signals enable row level security;
revoke all on table public.pulse_motion_live_signals from public, anon, authenticated;
revoke all on sequence public.pulse_motion_live_signals_id_seq from public, anon, authenticated;
grant select, insert, delete on table public.pulse_motion_live_signals to service_role;
grant usage, select on sequence public.pulse_motion_live_signals_id_seq to service_role;
comment on table public.pulse_motion_live_signals is 'Transient signaling for test-only camera streaming; SDP only, no raw audio/video or patient measurements. Edge Function only.';

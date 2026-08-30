create table if not exists public.account_access_controls (
  user_id uuid primary key,
  status text not null default 'closing' check (status in ('closing','closed','closure_failed')),
  privacy_request_id uuid null references public.account_privacy_requests(id) on delete set null,
  closure_mode text not null default 'auth_soft_delete',
  resolution_note text null,
  last_error text null,
  closed_by uuid null,
  closed_at timestamptz null,
  updated_at timestamptz not null default now()
);

alter table public.account_access_controls enable row level security;

revoke all on public.account_access_controls from anon;
revoke insert, update, delete on public.account_access_controls from authenticated;
grant select on public.account_access_controls to authenticated;

create policy account_access_controls_select_own
on public.account_access_controls
for select
to authenticated
using (auth.uid() = user_id);

create index if not exists account_access_controls_privacy_request_idx
on public.account_access_controls(privacy_request_id);

comment on table public.account_access_controls is
'Current Pulse account access state. Absence of a row means active. closing/closed block the patient surface; writes are server-side only.';

create table if not exists public.account_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  request_type text not null check (request_type in ('data_export','account_closure')),
  status text not null default 'submitted' check (status in ('submitted','in_review','completed','declined','cancelled')),
  request_note text,
  resolution_note text,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  handled_by uuid
);

create unique index if not exists account_privacy_requests_one_open_per_type_uidx
  on public.account_privacy_requests(user_id, request_type)
  where status in ('submitted','in_review');
create index if not exists account_privacy_requests_user_requested_idx
  on public.account_privacy_requests(user_id, requested_at desc);
create index if not exists account_privacy_requests_status_idx
  on public.account_privacy_requests(status, requested_at asc);

alter table public.account_privacy_requests enable row level security;

drop policy if exists "privacy_requests_select_own" on public.account_privacy_requests;
create policy "privacy_requests_select_own"
  on public.account_privacy_requests for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "privacy_requests_admin_select" on public.account_privacy_requests;
create policy "privacy_requests_admin_select"
  on public.account_privacy_requests for select to authenticated
  using (exists (
    select 1 from public.account_roles ar
    where ar.user_id = auth.uid() and ar.role = 'admin'
  ));

grant select on public.account_privacy_requests to authenticated;

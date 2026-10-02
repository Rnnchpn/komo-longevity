-- Reserved V1 architecture for consented guest passes and introductions.
create table if not exists public.world_guest_passes (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  guest_user_id uuid references auth.users(id) on delete set null,
  guest_email text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  scope text[] not null default '{}',
  event_id uuid references public.world_events(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','active','revoked','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(end_at>start_at),
  check(guest_user_id is not null or nullif(trim(guest_email),'') is not null)
);
create index if not exists world_guest_passes_member_idx on public.world_guest_passes(member_id,start_at,end_at);
create index if not exists world_guest_passes_guest_idx on public.world_guest_passes(guest_user_id,start_at,end_at) where guest_user_id is not null;
alter table public.world_guest_passes enable row level security;
create policy world_guest_passes_explicit_no_client_access on public.world_guest_passes
as restrictive for all to anon,authenticated using(false) with check(false);

create table if not exists public.world_introductions (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','accepted','declined','cancelled','introduced')),
  context text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  introduced_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  check(requester_id<>recipient_id)
);
create index if not exists world_introductions_requester_idx on public.world_introductions(requester_id,status);
create index if not exists world_introductions_recipient_idx on public.world_introductions(recipient_id,status);
alter table public.world_introductions enable row level security;
create policy world_introductions_explicit_no_client_access on public.world_introductions
as restrictive for all to anon,authenticated using(false) with check(false);

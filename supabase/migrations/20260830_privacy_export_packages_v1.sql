create table if not exists public.account_privacy_exports (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.account_privacy_requests(id) on delete cascade,
  user_id uuid not null,
  schema_version text not null default 'komo-privacy-export-v1',
  status text not null default 'building' check (status in ('building','ready','failed')),
  object_path text null,
  content_sha256 text null,
  size_bytes bigint null check (size_bytes is null or size_bytes >= 0),
  manifest jsonb not null default '{}'::jsonb check (jsonb_typeof(manifest)='object'),
  generated_at timestamptz null,
  last_downloaded_at timestamptz null,
  download_count integer not null default 0 check (download_count >= 0),
  last_error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.account_privacy_exports enable row level security;
revoke all on public.account_privacy_exports from anon;
revoke insert, update, delete on public.account_privacy_exports from authenticated;
grant select on public.account_privacy_exports to authenticated;

create policy account_privacy_exports_select_own
on public.account_privacy_exports
for select
to authenticated
using (auth.uid() = user_id);

create index if not exists account_privacy_exports_user_idx
on public.account_privacy_exports(user_id, created_at desc);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('privacy-exports','privacy-exports',false,52428800,array['application/json']::text[])
on conflict (id) do update
set public=false,
    file_size_limit=excluded.file_size_limit,
    allowed_mime_types=excluded.allowed_mime_types;

comment on table public.account_privacy_exports is
'Server-generated patient data export packages. Objects live in the private privacy-exports bucket and are accessed only through short-lived signed URLs.';

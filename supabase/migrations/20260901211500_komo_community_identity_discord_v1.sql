create table if not exists public.komo_community_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_key text not null check (role_key in ('founder','team','ambassador','coach','member')),
  display_title text not null check (char_length(display_title) between 2 and 60),
  icon text not null default '',
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.komo_community_roles enable row level security;

drop policy if exists "community role own read" on public.komo_community_roles;
create policy "community role own read"
on public.komo_community_roles
for select
to authenticated
using (user_id = auth.uid());

revoke insert, update, delete on public.komo_community_roles from anon, authenticated;
grant select on public.komo_community_roles to authenticated;

create or replace function public.komo_my_community_identity_v1()
returns jsonb
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(
    (
      select jsonb_build_object(
        'role_key', role_key,
        'display_title', display_title,
        'icon', icon,
        'sort_order', sort_order
      )
      from public.komo_community_roles
      where user_id = auth.uid()
        and is_active = true
      limit 1
    ),
    '{}'::jsonb
  );
$$;

revoke all on function public.komo_my_community_identity_v1() from public;
grant execute on function public.komo_my_community_identity_v1() to authenticated;

create table if not exists public.komo_community_settings (
  id text primary key default 'primary' check (id = 'primary'),
  discord_enabled boolean not null default false,
  discord_guild_id text,
  discord_invite_url text,
  updated_at timestamptz not null default now()
);

insert into public.komo_community_settings(id)
values ('primary')
on conflict (id) do nothing;

alter table public.komo_community_settings enable row level security;

drop policy if exists "community settings authenticated read" on public.komo_community_settings;
create policy "community settings authenticated read"
on public.komo_community_settings
for select
to authenticated
using (true);

revoke insert, update, delete on public.komo_community_settings from anon, authenticated;
grant select on public.komo_community_settings to authenticated;

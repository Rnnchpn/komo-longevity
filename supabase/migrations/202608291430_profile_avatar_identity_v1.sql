-- KŌMØ profile identity v1
-- Cosmetic/social identity is stored separately from clinical data.

alter table public.profiles
  add column if not exists avatar_config jsonb not null default '{}'::jsonb;

comment on column public.profiles.avatar_config is
  'User-controlled KŌMØ visual identity. Stores avatar mode and cosmetic options only; never clinical data.';

update public.profiles
set avatar_config = jsonb_build_object(
  'mode', case when avatar_path is not null then 'photo' else 'avatar' end,
  'skin', 'sand',
  'hair', 'short',
  'hair_color', 'dark',
  'outfit', 'tee',
  'accessory', 'none'
)
where avatar_config = '{}'::jsonb;

-- KŌMØ — Réservation publique en ligne v1 (23/11/2026)
-- Rendez-vous pris sur komolongevity.com, séparés des dossiers patients PULSE :
-- identité de contact + créneau uniquement, aucune donnée de santé.
-- Accès public uniquement via la fonction serveur booking-public (service_role).

create extension if not exists pg_net with schema extensions;
create schema if not exists private;

-- 1. Centres ouverts à la réservation publique
create table if not exists public.booking_centers (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  public_slug text not null unique check (public_slug ~ '^[a-z0-9-]{2,40}$'),
  public_name text not null check (char_length(public_name) between 2 and 80),
  public_place text check (public_place is null or char_length(public_place) <= 80),
  address_text text check (address_text is null or char_length(address_text) <= 200),
  access_note text check (access_note is null or char_length(access_note) <= 400),
  page_path text not null default '/fr/rendez-vous-hiro/' check (page_path ~ '^/[a-z0-9/-]*$'),
  is_open boolean not null default false,
  team_email text not null default 'contact@komolongevity.com' check (team_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  min_notice_hours integer not null default 24 check (min_notice_hours between 0 and 336),
  horizon_days integer not null default 60 check (horizon_days between 1 and 180),
  slot_step_minutes integer not null default 30 check (slot_step_minutes in (15, 30, 60)),
  updated_at timestamptz not null default now()
);

-- 2. Prestations réservables
create table if not exists public.booking_offers (
  organization_id uuid not null references public.booking_centers(organization_id) on delete cascade,
  code text not null check (code ~ '^[a-z0-9_]{2,30}$'),
  label text not null check (char_length(label) between 2 and 80),
  description text check (description is null or char_length(description) <= 300),
  duration_minutes integer not null check (duration_minutes between 15 and 240),
  price_cents integer check (price_cents is null or price_cents >= 0),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  enabled boolean not null default true,
  sort_order integer not null default 0,
  primary key (organization_id, code)
);

-- 3. Rendez-vous pris en ligne
create table if not exists public.public_bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.booking_centers(organization_id) on delete restrict,
  offer_code text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed', 'no_show')),
  first_name text not null check (char_length(first_name) between 1 and 60),
  last_name text not null check (char_length(last_name) between 1 and 60),
  email text not null check (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or char_length(phone) <= 35),
  source text check (source is null or char_length(source) <= 40),
  consent_at timestamptz not null,
  manage_token_hash text not null unique check (manage_token_hash ~ '^[0-9a-f]{64}$'),
  ip_hash text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  email_patient_status text not null default 'pending' check (email_patient_status in ('pending', 'sent', 'failed', 'not_configured')),
  email_team_status text not null default 'pending' check (email_team_status in ('pending', 'sent', 'failed', 'not_configured')),
  reminder_sent_at timestamptz,
  followup_sent_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by text check (cancelled_by is null or cancelled_by in ('patient', 'team')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  foreign key (organization_id, offer_code) references public.booking_offers(organization_id, code)
);

create unique index if not exists public_bookings_slot_confirmed_uq
  on public.public_bookings (organization_id, starts_at) where status = 'confirmed';
create index if not exists public_bookings_org_start_idx on public.public_bookings (organization_id, starts_at);
create index if not exists public_bookings_email_idx on public.public_bookings (lower(email));
create index if not exists public_bookings_ip_idx on public.public_bookings (ip_hash, created_at);

-- 4. Secret de la tâche planifiée (rappels J-1, relance du contrôle)
create table if not exists private.booking_runtime (
  key text primary key,
  value text not null,
  created_at timestamptz not null default now()
);
revoke all on private.booking_runtime from public, anon, authenticated;
insert into private.booking_runtime (key, value)
values ('cron_key', encode(extensions.gen_random_bytes(24), 'hex'))
on conflict (key) do nothing;

-- 5. Sécurité : aucune lecture publique ; lecture par l'équipe du centre connectée
alter table public.booking_centers enable row level security;
alter table public.booking_offers enable row level security;
alter table public.public_bookings enable row level security;
revoke all on public.booking_centers, public.booking_offers, public.public_bookings from anon;
revoke insert, update, delete on public.booking_centers, public.booking_offers, public.public_bookings from authenticated;
grant select on public.booking_centers, public.booking_offers, public.public_bookings to authenticated;

drop policy if exists booking_centers_team_read on public.booking_centers;
create policy booking_centers_team_read on public.booking_centers for select to authenticated
  using (exists (select 1 from public.organization_members m
                 where m.organization_id = booking_centers.organization_id and m.user_id = auth.uid() and m.status = 'active'));
drop policy if exists booking_offers_team_read on public.booking_offers;
create policy booking_offers_team_read on public.booking_offers for select to authenticated
  using (exists (select 1 from public.organization_members m
                 where m.organization_id = booking_offers.organization_id and m.user_id = auth.uid() and m.status = 'active'));
drop policy if exists public_bookings_team_read on public.public_bookings;
create policy public_bookings_team_read on public.public_bookings for select to authenticated
  using (exists (select 1 from public.organization_members m
                 where m.organization_id = public_bookings.organization_id and m.user_id = auth.uid() and m.status = 'active'
                   and m.role in ('owner', 'clinical_admin', 'physician', 'operator', 'coordinator')));

-- 6. Fonctions (appelées uniquement par booking-public avec la clé service)
create or replace function public.booking_public_slots(p_slug text, p_offer text, p_from date, p_days integer default 14)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = public, extensions
as $fn$
with c as (
  select bc.organization_id, o.timezone, bc.min_notice_hours, bc.horizon_days, bc.slot_step_minutes, bo.duration_minutes,
         (now() at time zone o.timezone)::date as today
  from public.booking_centers bc
  join public.organizations o on o.id = bc.organization_id and o.status = 'active'
  join public.booking_offers bo on bo.organization_id = bc.organization_id and bo.code = p_offer and bo.enabled
  where bc.public_slug = p_slug and bc.is_open
), days as (
  select g::date as d, c.*
  from c, generate_series(
    greatest(coalesce(p_from, c.today), c.today),
    least(greatest(coalesce(p_from, c.today), c.today) + greatest(1, least(coalesce(p_days, 14), 62)) - 1, c.today + c.horizon_days),
    interval '1 day') g
), raw as (
  select days.organization_id, days.min_notice_hours, days.duration_minutes,
         ((days.d + h.start_time) at time zone days.timezone) + make_interval(mins => x.i * days.slot_step_minutes) as s,
         ((days.d + h.end_time) at time zone days.timezone) as window_end
  from days
  join public.organization_booking_hours h
    on h.organization_id = days.organization_id and h.enabled and h.weekday = extract(isodow from days.d)::int
  cross join lateral generate_series(
    0, floor(((extract(epoch from (h.end_time - h.start_time)) / 60) - days.duration_minutes) / days.slot_step_minutes)::int) x(i)
  where extract(epoch from (h.end_time - h.start_time)) / 60 >= days.duration_minutes
)
select r.s, r.s + make_interval(mins => r.duration_minutes)
from raw r
where r.s >= now() + make_interval(hours => r.min_notice_hours)
  and r.s + make_interval(mins => r.duration_minutes) <= r.window_end
  and not exists (select 1 from public.organization_booking_blackouts b
                  where b.organization_id = r.organization_id
                    and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(r.s, r.s + make_interval(mins => r.duration_minutes), '[)'))
  and not exists (select 1 from public.public_bookings pb
                  where pb.organization_id = r.organization_id and pb.status = 'confirmed'
                    and tstzrange(pb.starts_at, pb.ends_at, '[)') && tstzrange(r.s, r.s + make_interval(mins => r.duration_minutes), '[)'))
  and not exists (select 1 from public.organization_appointments a
                  where a.organization_id = r.organization_id
                    and a.status in ('scheduled', 'confirmed', 'arrived', 'in_progress')
                    and tstzrange(a.scheduled_start, a.scheduled_end, '[)') && tstzrange(r.s, r.s + make_interval(mins => r.duration_minutes), '[)'))
order by 1;
$fn$;

create or replace function public.booking_public_config(p_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $fn$
select case when bc.organization_id is null then null else jsonb_build_object(
  'slug', bc.public_slug, 'name', bc.public_name, 'place', bc.public_place,
  'address', bc.address_text, 'access_note', bc.access_note, 'page_path', bc.page_path,
  'is_open', bc.is_open, 'timezone', o.timezone,
  'min_notice_hours', bc.min_notice_hours, 'horizon_days', bc.horizon_days,
  'offers', coalesce((select jsonb_agg(jsonb_build_object(
      'code', bo.code, 'label', bo.label, 'description', bo.description,
      'duration_minutes', bo.duration_minutes, 'price_cents', bo.price_cents, 'currency', bo.currency)
      order by bo.sort_order, bo.code)
    from public.booking_offers bo where bo.organization_id = bc.organization_id and bo.enabled), '[]'::jsonb)
) end
from public.booking_centers bc
join public.organizations o on o.id = bc.organization_id and o.status = 'active'
where bc.public_slug = p_slug;
$fn$;

create or replace function public.booking_public_view(p_id uuid)
returns jsonb
language sql stable security definer set search_path = public
as $fn$
select jsonb_build_object(
  'id', pb.id, 'status', pb.status, 'offer_code', pb.offer_code, 'offer_label', bo.label,
  'duration_minutes', bo.duration_minutes, 'price_cents', bo.price_cents, 'currency', bo.currency,
  'starts_at', pb.starts_at, 'ends_at', pb.ends_at, 'timezone', o.timezone,
  'center_slug', bc.public_slug, 'center_name', bc.public_name, 'center_place', bc.public_place,
  'address', bc.address_text, 'access_note', bc.access_note, 'page_path', bc.page_path, 'team_email', bc.team_email,
  'first_name', pb.first_name, 'last_name', pb.last_name, 'email', pb.email, 'phone', pb.phone, 'source', pb.source,
  'created_at', pb.created_at, 'cancelled_at', pb.cancelled_at,
  'email_patient_status', pb.email_patient_status, 'email_team_status', pb.email_team_status)
from public.public_bookings pb
join public.booking_centers bc on bc.organization_id = pb.organization_id
join public.organizations o on o.id = pb.organization_id
join public.booking_offers bo on bo.organization_id = pb.organization_id and bo.code = pb.offer_code
where pb.id = p_id;
$fn$;

create or replace function public.booking_public_create(
  p_slug text, p_offer text, p_start timestamptz,
  p_first text, p_last text, p_email text, p_phone text, p_source text,
  p_token_hash text, p_ip_hash text)
returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $fn$
declare
  v_center record;
  v_offer record;
  v_id uuid;
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_first text := btrim(coalesce(p_first, ''));
  v_last text := btrim(coalesce(p_last, ''));
  v_phone text := nullif(btrim(coalesce(p_phone, '')), '');
  v_source text := nullif(left(regexp_replace(coalesce(p_source, ''), '[^a-zA-Z0-9_.-]', '', 'g'), 40), '');
begin
  select bc.*, o.timezone into v_center
  from public.booking_centers bc join public.organizations o on o.id = bc.organization_id and o.status = 'active'
  where bc.public_slug = p_slug;
  if not found then return jsonb_build_object('ok', false, 'error', 'center_not_found'); end if;
  if not v_center.is_open then return jsonb_build_object('ok', false, 'error', 'booking_closed'); end if;

  select * into v_offer from public.booking_offers
  where organization_id = v_center.organization_id and code = p_offer and enabled;
  if not found then return jsonb_build_object('ok', false, 'error', 'offer_not_found'); end if;

  if char_length(v_first) not between 1 and 60 or char_length(v_last) not between 1 and 60
     or char_length(v_email) > 160 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     or (v_phone is not null and char_length(v_phone) > 35)
     or coalesce(p_token_hash, '') !~ '^[0-9a-f]{64}$' or p_start is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_input');
  end if;

  if p_ip_hash is not null and (select count(*) from public.public_bookings
      where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= 5 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;
  if (select count(*) from public.public_bookings
      where lower(email) = v_email and status = 'confirmed' and starts_at > now()) >= 2 then
    return jsonb_build_object('ok', false, 'error', 'too_many_upcoming');
  end if;

  -- Un seul créneau attribué à la fois par centre
  perform pg_advisory_xact_lock(hashtextextended('komo-booking:' || v_center.organization_id::text, 0));

  if not exists (select 1 from public.booking_public_slots(p_slug, p_offer, (p_start at time zone v_center.timezone)::date, 1) s
                 where s.starts_at = p_start) then
    return jsonb_build_object('ok', false, 'error', 'slot_unavailable');
  end if;

  insert into public.public_bookings (organization_id, offer_code, starts_at, ends_at, first_name, last_name, email, phone,
                                      source, consent_at, manage_token_hash, ip_hash)
  values (v_center.organization_id, v_offer.code, p_start, p_start + make_interval(mins => v_offer.duration_minutes),
          v_first, v_last, v_email, v_phone, v_source, now(), p_token_hash, p_ip_hash)
  returning id into v_id;

  return jsonb_build_object('ok', true, 'booking', public.booking_public_view(v_id));
exception when unique_violation then
  return jsonb_build_object('ok', false, 'error', 'slot_unavailable');
end;
$fn$;

create or replace function public.booking_public_get(p_token_hash text)
returns jsonb
language sql stable security definer set search_path = public
as $fn$
select case when pb.id is null then jsonb_build_object('ok', false, 'error', 'not_found')
  else jsonb_build_object('ok', true, 'booking', public.booking_public_view(pb.id)) end
from (select 1) one
left join public.public_bookings pb on pb.manage_token_hash = p_token_hash;
$fn$;

create or replace function public.booking_public_cancel(p_token_hash text)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $fn$
declare v record;
begin
  select * into v from public.public_bookings where manage_token_hash = p_token_hash for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if v.status <> 'confirmed' then return jsonb_build_object('ok', false, 'error', 'not_cancellable', 'booking', public.booking_public_view(v.id)); end if;
  if v.starts_at <= now() then return jsonb_build_object('ok', false, 'error', 'already_started', 'booking', public.booking_public_view(v.id)); end if;
  update public.public_bookings set status = 'cancelled', cancelled_at = now(), cancelled_by = 'patient', updated_at = now()
  where id = v.id;
  return jsonb_build_object('ok', true, 'late', v.starts_at < now() + interval '24 hours',
                            'booking', public.booking_public_view(v.id));
end;
$fn$;

create or replace function public.booking_public_mark(p_id uuid, p_field text, p_value text)
returns void
language plpgsql volatile security definer set search_path = public
as $fn$
begin
  if p_field = 'patient' then
    update public.public_bookings set email_patient_status = p_value, updated_at = now() where id = p_id;
  elsif p_field = 'team' then
    update public.public_bookings set email_team_status = p_value, updated_at = now() where id = p_id;
  elsif p_field = 'reminder' then
    update public.public_bookings set reminder_sent_at = now(), updated_at = now() where id = p_id;
  elsif p_field = 'followup' then
    update public.public_bookings set followup_sent_at = now(), updated_at = now() where id = p_id;
  else
    raise exception 'unknown field %', p_field;
  end if;
end;
$fn$;

-- Rappels J-1 (entre 20 h et 28 h avant) et invitation au contrôle (à partir de J+28 après un premier bilan)
create or replace function public.booking_public_due()
returns jsonb
language sql stable security definer set search_path = public
as $fn$
select jsonb_build_object(
  'reminders', coalesce((select jsonb_agg(public.booking_public_view(pb.id))
    from public.public_bookings pb
    where pb.status = 'confirmed' and pb.reminder_sent_at is null
      and pb.starts_at between now() + interval '20 hours' and now() + interval '28 hours'
      and pb.created_at < pb.starts_at - interval '30 hours'), '[]'::jsonb),
  'followups', coalesce((select jsonb_agg(public.booking_public_view(pb.id))
    from public.public_bookings pb
    join public.booking_centers bc on bc.organization_id = pb.organization_id and bc.is_open
    where pb.offer_code = 'initial' and pb.status in ('confirmed', 'completed') and pb.followup_sent_at is null
      and pb.starts_at between now() - interval '60 days' and now() - interval '28 days'
      and not exists (select 1 from public.public_bookings nx
                      where lower(nx.email) = lower(pb.email) and nx.organization_id = pb.organization_id
                        and nx.status = 'confirmed' and nx.starts_at > pb.starts_at)), '[]'::jsonb));
$fn$;

create or replace function public.booking_cron_key_ok(p_key text)
returns boolean
language sql stable security definer set search_path = public, private
as $fn$
select exists (select 1 from private.booking_runtime where key = 'cron_key' and value = p_key and char_length(p_key) >= 32);
$fn$;

do $grants$
declare f text;
begin
  foreach f in array array[
    'public.booking_public_slots(text,text,date,integer)', 'public.booking_public_config(text)',
    'public.booking_public_view(uuid)',
    'public.booking_public_create(text,text,timestamptz,text,text,text,text,text,text,text)',
    'public.booking_public_get(text)', 'public.booking_public_cancel(text)',
    'public.booking_public_mark(uuid,text,text)', 'public.booking_public_due()', 'public.booking_cron_key_ok(text)']
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end
$grants$;

-- 7. Clinique HIRO : réservation préparée, FERMÉE au public tant que créneaux et tarifs ne sont pas validés
insert into public.booking_centers (organization_id, public_slug, public_name, public_place, page_path, is_open,
                                    team_email, min_notice_hours, horizon_days, slot_step_minutes)
values ('c93a10db-29ca-4477-921c-31b282083089', 'hiro', 'Clinique HIRO', 'Beausoleil · Monaco', '/fr/rendez-vous-hiro/', false,
        'contact@komolongevity.com', 24, 60, 30)
on conflict (organization_id) do nothing;

insert into public.booking_offers (organization_id, code, label, description, duration_minutes, price_cents, sort_order)
values
 ('c93a10db-29ca-4477-921c-31b282083089', 'initial', 'Premier bilan KŌMØ Motion',
  'Analyse complète : force, équilibre, puissance, marche et posture. Restitution et programme de 6 semaines.', 60, null, 1),
 ('c93a10db-29ca-4477-921c-31b282083089', 'followup', 'Contrôle KŌMØ Motion',
  'À 6 ou 12 semaines : mêmes mesures, mêmes appareils, trajectoire comparée à votre premier bilan.', 45, null, 2)
on conflict (organization_id, code) do nothing;

-- Mardi 9 h–13 h et 14 h–18 h (heure de Paris), à confirmer
insert into public.organization_booking_hours (organization_id, weekday, start_time, end_time, enabled)
values ('c93a10db-29ca-4477-921c-31b282083089', 2, '09:00', '13:00', true),
       ('c93a10db-29ca-4477-921c-31b282083089', 2, '14:00', '18:00', true)
on conflict (organization_id, weekday, start_time, end_time) do nothing;

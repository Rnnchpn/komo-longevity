-- KŌMØ commercial CRM: minimal contact details only.
-- No health questionnaires, medical measurements, outcomes, DOB, sex, reports or clinical records.
-- The existing patients / clinical_data_status gates remain untouched.
create table if not exists public.komo_commercial_contacts (
  id uuid primary key default gen_random_uuid(),
  center_code text not null check (center_code in ('paris_centre','cannes')),
  first_name text not null check (char_length(btrim(first_name)) between 1 and 100),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 120),
  email text check (email is null or (char_length(email)<=254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  phone text check (phone is null or char_length(phone)<=40),
  journey_status text not null default 'nouveau'
    check (journey_status in ('nouveau','a_confirmer','confirme','accueilli','termine','annule')),
  service_code text check (service_code is null or service_code in ('initial','suivi','advanced')),
  appointment_at timestamptz,
  booking_source text not null default 'manual' check (booking_source in ('manual','acuity')),
  acuity_appointment_id bigint unique,
  assigned_user_id uuid references auth.users(id) on delete set null,
  created_by uuid not null default (select auth.uid()) references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((booking_source = 'acuity') or (acuity_appointment_id is null))
);
comment on table public.komo_commercial_contacts is 'Minimal commercial scheduling contacts only. No medical/health information. Never populate from clinical records without separate approved processing.';
create index if not exists komo_commercial_contacts_by_center on public.komo_commercial_contacts (center_code, journey_status, appointment_at);
create index if not exists komo_commercial_contacts_by_email on public.komo_commercial_contacts (lower(email));
create index if not exists komo_commercial_contacts_by_owner on public.komo_commercial_contacts (created_by, assigned_user_id);
alter table public.komo_commercial_contacts enable row level security;
revoke all on public.komo_commercial_contacts from anon;
grant select,insert,update on public.komo_commercial_contacts to authenticated;
drop policy if exists "commercial_contacts_select_scoped" on public.komo_commercial_contacts;
create policy "commercial_contacts_select_scoped" on public.komo_commercial_contacts
for select to authenticated using (
  private.user_is_global_admin()
  or created_by = (select auth.uid())
  or assigned_user_id = (select auth.uid())
);
drop policy if exists "commercial_contacts_insert_admin" on public.komo_commercial_contacts;
create policy "commercial_contacts_insert_admin" on public.komo_commercial_contacts
for insert to authenticated with check (
  private.user_is_global_admin()
  and created_by = (select auth.uid())
);
drop policy if exists "commercial_contacts_update_admin" on public.komo_commercial_contacts;
create policy "commercial_contacts_update_admin" on public.komo_commercial_contacts
for update to authenticated
using (private.user_is_global_admin())
with check (private.user_is_global_admin());
-- Omit DELETE policy: records cannot be silently removed via client.

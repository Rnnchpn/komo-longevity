alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists sex_at_birth text;
alter table public.profiles add column if not exists locale text not null default 'fr-FR';

do $$ begin
  alter table public.profiles add constraint profiles_sex_at_birth_check check (sex_at_birth is null or sex_at_birth in ('female','male','not_specified'));
exception when duplicate_object then null; end $$;

create table if not exists public.patient_service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  service text not null default 'motion' check (service in ('motion','clinical')),
  status text not null default 'submitted' check (status in ('submitted','assigned','accepted','scheduled','completed','declined','cancelled')),
  preferred_city text,
  message text,
  assigned_organization_id uuid references public.organizations(id) on delete set null,
  assigned_professional_user_id uuid,
  patient_id uuid references public.patients(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  submitted_at timestamptz not null default now(),
  assigned_at timestamptz,
  accepted_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists patient_service_requests_user_idx on public.patient_service_requests(user_id,submitted_at desc);
create index if not exists patient_service_requests_org_status_idx on public.patient_service_requests(assigned_organization_id,status,submitted_at desc);
create index if not exists patient_service_requests_professional_idx on public.patient_service_requests(assigned_professional_user_id,status,submitted_at desc);
alter table public.patient_service_requests enable row level security;

do $$ begin create policy patient_service_requests_select_self on public.patient_service_requests for select to authenticated using (auth.uid()=user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy patient_service_requests_insert_self on public.patient_service_requests for insert to authenticated with check (auth.uid()=user_id and status='submitted' and assigned_organization_id is null and assigned_professional_user_id is null and patient_id is null and assessment_id is null); exception when duplicate_object then null; end $$;
do $$ begin create policy patient_service_requests_select_staff on public.patient_service_requests for select to authenticated using (private.pulse_is_admin() or (assigned_organization_id is not null and private.user_has_org_role(assigned_organization_id,array['owner','clinical_admin','physician','operator','coordinator','viewer']::text[]))); exception when duplicate_object then null; end $$;
revoke all on public.patient_service_requests from anon;
grant select,insert on public.patient_service_requests to authenticated;

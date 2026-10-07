-- KŌMØ Pulse POC V1 — Biology, Clinical Gates and longitudinal checkpoints
-- Prepared 2026-10-07. This migration is intentionally additive: existing Pulse auth,
-- patient, assessment, questionnaire, report and trajectory tables remain canonical.

create table if not exists public.pulse_biological_panels (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete set null,
  laboratory_name text,
  laboratory_reference text,
  panel_code text not null default 'komo_biological_baseline_v1',
  protocol_version text not null default 'biological-baseline-v1',
  fasting_status text not null default 'unknown' check (fasting_status in ('yes','no','unknown')),
  acute_illness boolean not null default false,
  strenuous_exercise_24h boolean not null default false,
  collected_at timestamptz,
  received_at timestamptz,
  reviewed_at timestamptz,
  released_at timestamptz,
  status text not null default 'ordered' check (status in ('ordered','collected','received','reviewed','released','cancelled')),
  source_document_id uuid references public.pulse_documents(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulse_biomarkers (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid not null references public.pulse_biological_panels(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  biomarker_code text not null,
  display_name text not null,
  value_numeric numeric,
  value_text text,
  unit text,
  reference_low numeric,
  reference_high numeric,
  reference_text text,
  flag text check (flag is null or flag in ('low','high','critical_low','critical_high','abnormal','expected')),
  interpretation_status text not null default 'pending' check (interpretation_status in ('pending','reviewed','released')),
  source_method text,
  measured_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(panel_id, biomarker_code)
);

create table if not exists public.pulse_clinical_gates (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete set null,
  panel_id uuid references public.pulse_biological_panels(id) on delete set null,
  gate_code text not null,
  domain text not null check (domain in ('motion','biology','questionnaire','cardiovascular','other')),
  severity text not null check (severity in ('info','review','urgent')),
  source text not null,
  source_reference text,
  status text not null default 'open' check (status in ('open','review_required','reviewed','cleared','referred')),
  patient_visible boolean not null default false,
  clinician_message text,
  patient_message text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulse_checkpoints (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  baseline_assessment_id uuid references public.assessments(id) on delete set null,
  checkpoint_type text not null check (checkpoint_type in ('s2','s6','s12','m6','m12','custom')),
  target_domain text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  status text not null default 'planned' check (status in ('planned','due','completed','cancelled')),
  payload jsonb not null default '{}'::jsonb,
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pulse_bio_panels_patient_idx on public.pulse_biological_panels(patient_id, collected_at desc);
create index if not exists pulse_biomarkers_patient_idx on public.pulse_biomarkers(patient_id, measured_at desc);
create index if not exists pulse_clinical_gates_patient_idx on public.pulse_clinical_gates(patient_id, status);
create index if not exists pulse_checkpoints_patient_idx on public.pulse_checkpoints(patient_id, scheduled_at);

alter table public.pulse_biological_panels enable row level security;
alter table public.pulse_biomarkers enable row level security;
alter table public.pulse_clinical_gates enable row level security;
alter table public.pulse_checkpoints enable row level security;

revoke all on public.pulse_biological_panels, public.pulse_biomarkers, public.pulse_clinical_gates, public.pulse_checkpoints from anon;
grant select on public.pulse_biological_panels, public.pulse_biomarkers, public.pulse_clinical_gates, public.pulse_checkpoints to authenticated;
grant insert, update on public.pulse_checkpoints to authenticated;
grant insert, update, delete on public.pulse_biological_panels, public.pulse_biomarkers, public.pulse_clinical_gates to authenticated;

create policy pulse_bio_patient_read on public.pulse_biological_panels
for select to authenticated
using (
  (status='released' and exists(select 1 from public.patients p where p.id=patient_id and p.patient_user_id=(select auth.uid())))
  or exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
);

create policy pulse_bio_care_write on public.pulse_biological_panels
for all to authenticated
using (
  exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
)
with check (
  exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
);

create policy pulse_biomarkers_patient_read on public.pulse_biomarkers
for select to authenticated
using (
  exists(
    select 1 from public.pulse_biological_panels bp
    join public.patients p on p.id=bp.patient_id
    where bp.id=panel_id and bp.status='released' and p.patient_user_id=(select auth.uid())
  )
  or exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
);

create policy pulse_biomarkers_care_write on public.pulse_biomarkers
for all to authenticated
using (
  exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
)
with check (
  exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
);

create policy pulse_gates_patient_read on public.pulse_clinical_gates
for select to authenticated
using (
  (patient_visible and exists(select 1 from public.patients p where p.id=patient_id and p.patient_user_id=(select auth.uid())))
  or exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
);

create policy pulse_gates_care_write on public.pulse_clinical_gates
for all to authenticated
using (
  exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
)
with check (
  exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
);

create policy pulse_checkpoints_read on public.pulse_checkpoints
for select to authenticated
using (
  exists(select 1 from public.patients p where p.id=patient_id and p.patient_user_id=(select auth.uid()))
  or exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
);

create policy pulse_checkpoints_patient_insert on public.pulse_checkpoints
for insert to authenticated
with check (
  exists(select 1 from public.patients p where p.id=patient_id and p.patient_user_id=(select auth.uid()))
  or exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
);

create policy pulse_checkpoints_update on public.pulse_checkpoints
for update to authenticated
using (
  exists(select 1 from public.patients p where p.id=patient_id and p.patient_user_id=(select auth.uid()))
  or exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
)
with check (
  exists(select 1 from public.patients p where p.id=patient_id and p.patient_user_id=(select auth.uid()))
  or exists(select 1 from public.patient_care_assignments a where a.patient_id=patient_id and a.professional_user_id=(select auth.uid()) and a.status='active')
  or exists(select 1 from public.account_roles r where r.user_id=(select auth.uid()) and r.role='admin')
);

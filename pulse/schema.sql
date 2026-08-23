-- KŌMØ Pulse V0 domain schema
-- Synthetic-data development only. Security policies are intentionally not complete.

create extension if not exists pgcrypto;

create table organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code char(2) not null,
  created_at timestamptz not null default now()
);

create table people (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations(id),
  external_reference text,
  birth_year int check (birth_year between 1900 and 2200),
  sex_at_birth text check (sex_at_birth in ('female','male','other','unknown')),
  created_at timestamptz not null default now()
);

create table protocol_versions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  version text not null,
  mode text not null check (mode in ('motion','clinical','shared')),
  status text not null check (status in ('draft','active','retired')),
  effective_from timestamptz,
  unique(code, version)
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id),
  organisation_id uuid not null references organisations(id),
  mode text not null check (mode in ('motion','clinical')),
  status text not null check (status in (
    'draft','baseline_pending','ready_for_session','in_progress',
    'quality_review','result_ready','published','archived'
  )),
  protocol_version_id uuid not null references protocol_versions(id),
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_by_user_id uuid not null,
  created_at timestamptz not null default now()
);

create table case_sessions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  case_id uuid,
  operator_user_id uuid not null,
  started_at timestamptz,
  completed_at timestamptz,
  notes text
);

create table measurement_sources (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  provider_name text not null,
  provider_system text,
  provider_version text,
  unique(kind, provider_name, provider_system, provider_version)
);

create table measurement_definitions (
  id uuid primary key default gen_random_uuid(),
  canonical_key text not null unique,
  display_name text not null,
  domain text not null check (domain in (
    'mobility','performance','balance','muscle_control','posture','context'
  )),
  canonical_unit text,
  value_type text not null check (value_type in ('number','boolean','text','category')),
  laterality text not null check (laterality in ('none','left_right','optional')),
  active_from timestamptz not null default now(),
  retired_at timestamptz
);

create table import_batches (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  case_session_id uuid not null references case_sessions(id) on delete cascade,
  source_id uuid not null references measurement_sources(id),
  source_filename text,
  source_checksum text,
  source_algorithm_version text,
  imported_at timestamptz not null default now(),
  imported_by_user_id uuid not null,
  status text not null check (status in ('received','validated','partial','rejected')),
  validation_messages jsonb not null default '[]'::jsonb
);

create table source_mappings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references measurement_sources(id),
  source_field text not null,
  source_unit text,
  definition_id uuid not null references measurement_definitions(id),
  transform_rule text,
  mapping_version text not null,
  unique(source_id, source_field, mapping_version)
);

create table provenance (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references measurement_sources(id),
  import_batch_id uuid references import_batches(id),
  acquisition_protocol text,
  algorithm_version text,
  device_reference text,
  created_at timestamptz not null default now()
);

create table measurements (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  case_session_id uuid references case_sessions(id) on delete cascade,
  definition_id uuid not null references measurement_definitions(id),
  source_id uuid not null references measurement_sources(id),
  numeric_value numeric,
  text_value text,
  unit text,
  side text check (side in ('left','right','bilateral','none')),
  measured_at timestamptz not null,
  quality_status text not null check (quality_status in ('valid','review','invalid','missing')),
  quality_reason text,
  provenance_id uuid not null references provenance(id),
  check (numeric_value is not null or text_value is not null)
);

create index measurements_assessment_idx on measurements(assessment_id);
create index measurements_definition_idx on measurements(definition_id);
create index measurements_source_idx on measurements(source_id);

create table motion_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  scoring_version text not null,
  overall_score numeric check (overall_score between 0 and 100),
  overall_label text,
  confidence text not null check (confidence in ('high','medium','low')),
  generated_at timestamptz not null default now(),
  unique(assessment_id, scoring_version)
);

create table motion_domain_results (
  id uuid primary key default gen_random_uuid(),
  motion_result_id uuid not null references motion_results(id) on delete cascade,
  domain text not null check (domain in ('mobility','performance','balance','muscle_control')),
  score numeric check (score between 0 and 100),
  status text not null check (status in ('available','descriptive_only','insufficient_data')),
  confidence text not null check (confidence in ('high','medium','low')),
  contributing_measurement_ids jsonb not null default '[]'::jsonb,
  unique(motion_result_id, domain)
);

create table muscle_signatures (
  id uuid primary key default gen_random_uuid(),
  motion_result_id uuid not null unique references motion_results(id) on delete cascade,
  activation text,
  coordination text,
  symmetry text,
  endurance text,
  source text not null default 'myodev_myocare'
);

create table priorities (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  rank int not null check (rank between 1 and 3),
  title text not null,
  rationale text not null,
  domain text,
  validated_by_physician_user_id uuid,
  unique(assessment_id, rank)
);

create table clinical_interpretations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references assessments(id) on delete cascade,
  physician_user_id uuid not null,
  summary text not null,
  conclusion text,
  plan text,
  signed_at timestamptz
);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  organisation_id uuid references organisations(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index audit_events_entity_idx on audit_events(entity_type, entity_id);
create index audit_events_actor_idx on audit_events(actor_user_id, created_at desc);

-- RLS, identity tables, organisation membership, consent, document storage,
-- clinical-signature controls and production audit guarantees must be completed
-- before this schema can be used with real health data.
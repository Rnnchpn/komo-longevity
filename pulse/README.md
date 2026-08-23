# KŌMØ Pulse — SaaS Foundation V0

This directory is intentionally isolated from the current static website build.

No real patient or health data should be used at this stage. V0 is built with synthetic data only.

## Product role

Pulse is the operating layer of KŌMØ.

It does not replace Myodev/Myocare. Myocare remains the specialised muscular-data engine. Pulse receives validated outputs and combines them with the rest of the KŌMØ assessment.

Target flow:

`Patient → Pulse Baseline → KŌMØ Case Session → Myocare → functional measurements → Motion Profile → Clinical interpretation when applicable → longitudinal trajectory`

## Interfaces

### Pulse Personal
- Overview
- Before my assessment
- Results
- Priorities
- Trajectory
- Assessments
- Documents
- Library
- Profile

### Pulse Professional
- Patients
- New assessment
- Assessment workflow
- Myocare import
- Quality control
- Result review
- Clinical interpretation when authorised
- Report
- Follow-up

### Pulse Admin
- Organisations
- Users and roles
- Case licences
- Protocol versions
- Measurement definitions
- Source mappings
- Subscriptions
- Network status
- Audit and support

## Roles

- `patient`
- `motion_operator`
- `physician`
- `organisation_admin`
- `komo_admin`
- future `research`

Motion users never receive medical diagnosis or medical-conclusion permissions.

Clinical permissions add physician-owned medical context and interpretation. They do not modify the underlying Motion measurements.

## Technical direction

Recommended production direction:

- TypeScript
- modern React application framework
- PostgreSQL
- strict role-based access control
- organisation tenancy
- typed API contracts
- object storage for source documents where needed
- audit log
- schema migrations
- automated tests
- explicit source/provenance tracking

For the first prototype, infrastructure choices remain replaceable. The domain model should not.

## Myocare integration

### Phase 1 — file connector

Myocare exports CSV/XLSX.

Pulse:
1. creates an import batch;
2. validates required columns and units;
3. maps source fields to canonical KŌMØ measurement definitions;
4. records algorithm/source version;
5. attaches quality flags;
6. links the import to the correct Case Session;
7. stores provenance;
8. exposes only validated values to the result engine.

### Phase 2 — API connector

The connector changes, the internal data model does not.

The internal source identifier should be vendor-neutral, for example:

`measurement_source = myodev_myocare`

## Core domain

`Organisation → Professional → Patient → Assessment → CaseSession → MeasurementSource → Measurement → Result → Priority → FollowUp`

Supporting entities:

- MeasurementDefinition
- SourceMapping
- MyocareImport / ImportBatch
- SourceAlgorithmVersion
- QualityFlag
- Provenance
- ProtocolVersion
- Report
- AuditEvent

## Result model

The patient-facing result should not begin with raw data.

Preferred hierarchy:

1. current Motion result / profile;
2. domains;
3. Muscle Signature;
4. measurement confidence / completeness;
5. three priorities;
6. comparison with previous assessment;
7. raw detail on demand.

Prototype scoring rules must be versioned. A result must always record the exact scoring version used to generate it.

## V0 scope

Build first with synthetic patients:

1. app shell;
2. role-aware navigation;
3. patient dashboard;
4. assessment creation;
5. Case Session workflow;
6. synthetic Myocare import;
7. result screen;
8. longitudinal comparison;
9. professional dashboard.

Do not build billing, real clinical documents or real health-data ingestion before the security/compliance architecture is reviewed.

## Security boundary before real data

Before using real identifiable health data, require a senior engineering/security review covering at minimum:

- authentication and MFA strategy;
- RBAC and tenancy isolation;
- encryption and secrets management;
- auditability;
- logging without health-data leakage;
- backup and recovery;
- data deletion/correction workflows;
- hosting and applicable French/EU health-data requirements;
- DPIA / processing roles where applicable;
- penetration testing;
- Myodev/Myocare data-processing responsibilities;
- vendor exit and data portability.

## First build milestone

A synthetic patient should be able to:

1. open Pulse;
2. see an upcoming assessment;
3. complete a mock Baseline;
4. have a professional create a Case Session;
5. receive a synthetic Myocare import;
6. see a Motion Profile;
7. receive three priorities;
8. compare T0 with a synthetic M3 follow-up.

That single end-to-end journey is the first meaningful Pulse prototype.
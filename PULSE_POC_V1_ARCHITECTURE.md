# KŌMØ Pulse — POC V1 Architecture

## Product reset
Pulse keeps its existing authentication, user accounts, Supabase project, professional/admin surfaces and document infrastructure. The patient product is re-owned by a new final runtime with four primary surfaces:

- Home
- Baseline
- Results
- Trajectory

The former patient-facing concept of a free mobility catalogue is retired from the new path.

## Scientific separation
Pulse V1 preserves four layers without averaging incompatible data:

1. Patient-reported outcomes
2. Biological context
3. Objective Motion measurements from VALD
4. Clinical Gates

Only objective Motion domains enter Motion Score V1. Biology and Clinical Gates remain independent.

## Motion Score V1
- Locomotion 25%
- Strength 25%
- Function 20%
- Balance 15%
- Mobility 15%

Motion Age is disabled during the POC.

## Baseline flow
Pre-visit questionnaires → external laboratory → KŌMØ Operator Motion assessment → VALD Hub → Pulse → trajectory.

## Longitudinal flow
D0 full baseline → S2 digital adherence check → S6 target-domain check → S12 full reassessment → M6 maintenance → M12 annual baseline.

## Data model
Existing canonical tables are retained:
- assessments
- questionnaire_sessions / questionnaire_responses
- pulse_measurement_sets
- pulse_score_runs
- pulse_programs
- reports
- trajectory_events

The POC migration adds:
- pulse_biological_panels
- pulse_biomarkers
- pulse_clinical_gates
- pulse_checkpoints

## Security
New clinical data tables use RLS, explicit grants and patient/care-team/admin scoping. Patient-facing biological data are readable only after release. Clinical Gates are only patient-visible when explicitly marked so.

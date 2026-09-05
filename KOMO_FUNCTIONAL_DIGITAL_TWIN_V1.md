# KŌMØ Functional Digital Twin · Architecture V1

## Product definition

The KŌMØ Functional Digital Twin is a longitudinal representation of locomotor function. It is not a decorative avatar and it is not an anatomical simulation. It is a time-indexed model that links measured signals, derived functional domains, interventions and outcomes.

**Core loop**

Measure → normalize → interpret → visualize → act → reassess → update Twin.

## Data domains

1. **Myodev** — EMG / muscular activation, symmetry, recruitment, session metadata.
2. **Functional tests** — Stand-Up, Two-Step, GLFS-25 and other validated or locally governed tests.
3. **Gait** — speed, cadence, step/stride parameters, symmetry and gait-derived markers available from the acquisition pipeline.
4. **Strength** — quadriceps, hamstrings, gastrocnemius and other measured force outputs where available.
5. **Posture** — sagittal/trunk/postural measurements with source and acquisition method retained.
6. **Wearables** — device-derived daily signals such as steps and resting heart rate.
7. **Sleep** — duration and later additional validated/accepted sleep metrics according to device provenance.
8. **Activity** — daily movement volume, adherence and longitudinal activity patterns.
9. **Rehab** — prescribed/guided session completion, exercise quality metrics when technically and clinically validated, and progression.
10. **Motion Score** — the KŌMØ summary layer derived from the validated scoring pipeline; it never replaces the underlying measurements.

## Three visual layers

### Layer A · Identity
The visible avatar is user-customisable: appearance, clothing, hair, morphology, accessories and social identity.

### Layer B · Functional Twin
Objective overlays are not manually editable. They are generated only from measured or derived data. Examples:
- left/right muscular asymmetry;
- lower-limb strength deficits;
- gait symmetry;
- balance or mobility domain state;
- posture trend;
- rehabilitation adherence.

The UI must always allow the user or professional to distinguish **measured**, **derived**, **self-reported**, and **demo/unavailable** values.

### Layer C · Time
The Twin is never a single state. Every visual state is a dated snapshot. The primary interaction is a longitudinal timeline:

Baseline → intermediate assessments → today → future target.

A comparison mode can display two snapshots side-by-side or as an overlay.

## Canonical snapshot model

```json
{
  "twin_snapshot_id": "uuid",
  "subject_id": "uuid",
  "captured_at": "2026-09-02T16:17:00+02:00",
  "context": "clinical_assessment | daily_wearable | rehab_session",
  "sources": {
    "myodev": {"status":"available","session_id":"...","quality":0.96},
    "functional_tests": {"status":"available","quality":0.93},
    "gait": {"status":"available","quality":0.91},
    "strength": {"status":"available","quality":0.95},
    "posture": {"status":"available","quality":0.88},
    "wearables": {"status":"available","provider":"xiaomi","quality":0.82},
    "sleep": {"status":"available","provider":"xiaomi","quality":0.78},
    "activity": {"status":"available","quality":0.84},
    "rehab": {"status":"available","quality":0.90}
  },
  "domains": {
    "muscle": 82,
    "mobility": 76,
    "balance": 91,
    "posture": 88,
    "endurance": 79
  },
  "motion_score": 84,
  "motion_age": 39,
  "provenance_version": "twin-v1"
}
```

## Provenance requirements

Every displayed metric should retain:
- source system;
- acquisition timestamp;
- raw/derived status;
- unit;
- laterality when relevant;
- operator/device when clinically useful;
- processing/scoring version;
- data quality / completeness state;
- consent and access scope.

No AI layer should be allowed to silently alter a measured value.

## Astra-ready agent boundary

The future KŌMØ spatial agent should consume the Twin through an explicit read/action interface rather than direct database access.

Potential actions:
- `explain_snapshot(snapshot_id)`
- `compare_snapshots(a, b)`
- `focus_domain(domain)`
- `show_provenance(metric_id)`
- `open_rehab_plan(plan_id)`
- `navigate_room(room_id)`
- `request_professional_review(subject_id)`

A model may explain, navigate, compare and orchestrate. Clinical thresholds, scoring and measured data remain deterministic services with versioned rules.

## V0.3 visual goal

The first Twin-centric prototype must communicate five ideas within ten seconds:

1. **This is my body in KŌMØ World.**
2. **Ten real data streams feed it.**
3. **The data attach to functional regions/domains, not decorative charts.**
4. **I can move through time and compare myself longitudinally.**
5. **Rehab closes the loop and generates the next measurable state.**

## Next engineering sequence

1. V0.3 Twin-centric 3D presentation with demo data and longitudinal timeline.
2. Define Supabase tables for snapshots, metric provenance, source sessions and derived domains.
3. Map the definitive Myodev export to the canonical snapshot model.
4. Connect real Motion Score / domain scores from Pulse.
5. Add wearable daily snapshots separately from clinical assessment snapshots.
6. Add professional permissions and clinical/private room boundaries.
7. Add the agent interface only after deterministic data services and provenance are stable.

# KŌMØ Functional Digital Twin · Agent-ready Architecture V0.4

## Objective

Build the deepest useful layer possible before a future spatial agent such as Astra is available in the product runtime.

The core principle is simple:

> AI can read, explain, navigate and propose actions around the Twin. It cannot silently rewrite measured health data or deterministic scores.

KŌMØ World is the spatial interface. Pulse remains the account/data product. The Functional Digital Twin becomes the time-indexed state model connecting measurement, interpretation, action and reassessment.

## 1. Canonical layers

### A. Measurement layer — immutable provenance

Every observation keeps:

- `measurement_id`
- `subject_id`
- `source` — Myodev, gait, strength, posture, wearable, sleep, activity, rehab, functional test
- `captured_at`
- `value`
- `unit`
- `laterality` when relevant
- `measurement_kind` — measured / self_reported / derived
- `device_or_method`
- `quality`
- `raw_reference`
- `processing_version`

Once accepted into the clinical/data ledger, an observation is append-only. Corrections create a new event; they do not silently overwrite history.

### B. Deterministic Twin layer

A dated Twin Snapshot is generated from accepted measurements by versioned KŌMØ logic.

It contains:

- source availability and quality;
- functional domains;
- Motion Score;
- Motion Age when enabled;
- body-region overlays;
- longitudinal change flags;
- provenance version.

The AI does not calculate these values free-form.

### C. Spatial representation layer

The same snapshot can be rendered as:

- 2D Pulse dashboard;
- 3D Functional Twin;
- timeline comparison;
- body-region focus;
- Motion Lab visualisation;
- Rehab room context.

### D. Agent layer

The future KŌMØ AI/Astra adapter receives a **read-only context packet** and returns structured actions.

Allowed examples:

- read a snapshot;
- compare two snapshots;
- focus a source;
- focus a body region;
- move the camera;
- open Motion Lab;
- preview a Rehab room;
- explain provenance;
- summarize longitudinal change.

Write/clinical actions require explicit policy and, where appropriate, human approval.

## 2. Event-sourced Twin

The Twin should be built from events rather than one mutable JSON blob.

Example events:

```json
{"type":"measurement.accepted","at":"2026-09-02T16:17:00+02:00","source":"myodev","measurement_id":"m_001"}
{"type":"snapshot.generated","at":"2026-09-02T16:18:00+02:00","snapshot_id":"twin_003","provenance_version":"twin-v1"}
{"type":"rehab.session.completed","at":"2026-09-04T08:20:00+02:00","session_id":"rehab_019"}
{"type":"world.source.focused","at":"2026-09-04T18:00:00+02:00","source":"strength","actor":"user"}
{"type":"agent.action.proposed","at":"2026-09-04T18:00:01+02:00","action":"world.focus_region","region":"left_thigh"}
```

This creates an auditable history and makes future agent behavior observable.

## 3. Snapshot contract

```json
{
  "snapshot_id": "twin_003",
  "subject_id": "subject_demo",
  "captured_at": "2026-09-02T16:17:00+02:00",
  "label": "Today",
  "sources": {
    "myodev": {"status":"available","quality":0.96},
    "functional_tests": {"status":"available","quality":0.93},
    "gait": {"status":"available","quality":0.91},
    "strength": {"status":"available","quality":0.95},
    "posture": {"status":"available","quality":0.88},
    "wearables": {"status":"available","quality":0.82},
    "sleep": {"status":"available","quality":0.78},
    "activity": {"status":"available","quality":0.84},
    "rehab": {"status":"available","quality":0.90},
    "motion_score": {"status":"derived","quality":0.95}
  },
  "domains": {
    "muscle":82,
    "mobility":76,
    "balance":91,
    "posture":88,
    "endurance":79
  },
  "motion_score":84,
  "motion_age":39,
  "overlays": {
    "left_thigh":{"status":"attention","intensity":0.32,"reason":"quadriceps_asymmetry"},
    "trunk":{"status":"stable","intensity":0.08,"reason":"posture"}
  },
  "provenance_version":"twin-v1"
}
```

## 4. Agent context packet

The agent should not receive the entire patient database by default.

A context packet is scoped to the current user intent and room:

```json
{
  "room":"functional_twin",
  "snapshot":"twin_003",
  "comparison_snapshot":"twin_001",
  "allowed_capabilities":[
    "twin.read_snapshot",
    "twin.compare_snapshots",
    "world.focus_source",
    "world.focus_region",
    "world.open_room",
    "rehab.preview_session"
  ],
  "forbidden_capabilities":[
    "measurement.modify",
    "motion_score.override",
    "clinical_prescription.autonomous_write"
  ],
  "data_minimisation":"only fields required for current intent"
}
```

## 5. Structured spatial action protocol

The model returns actions, not arbitrary DOM manipulation.

```json
{
  "intent":"explain_change",
  "spoken_summary":"Your largest improvement is in lower-limb function, while left quadriceps asymmetry remains the main modifiable limitation.",
  "actions":[
    {"type":"timeline.compare","from":"twin_001","to":"twin_003"},
    {"type":"world.focus_source","source":"strength"},
    {"type":"world.focus_region","region":"left_thigh"},
    {"type":"world.camera","preset":"twin_lower_limb"},
    {"type":"world.open_room","room":"rehab","mode":"preview"}
  ]
}
```

The client validates each action against permissions before execution.

## 6. Clinical and safety boundary

### Read-only / low-risk agent actions

- navigate;
- explain available data;
- compare dated values;
- point to provenance;
- show a previously authorised plan;
- open a room or educational module.

### Human approval / governed actions

- create or modify a clinical programme;
- alter a prescribed Rehab plan;
- publish an alert to a clinician;
- change a medical interpretation;
- write data back to the clinical record.

### Never delegated to free-form generation

- editing raw measurements;
- overriding Motion Score;
- inventing unavailable measurements;
- removing provenance;
- representing demo data as measured data.

## 7. Data adapters

Every source gets an adapter producing canonical observations.

```text
Myodev export      -> myodev-adapter
Functional tests   -> functional-tests-adapter
Gait export        -> gait-adapter
Strength           -> strength-adapter
Posture            -> posture-adapter
Wearables          -> wearable-adapter
Sleep              -> sleep-adapter
Activity           -> activity-adapter
Rehab              -> rehab-adapter
                     ↓
              canonical observations
                     ↓
              deterministic snapshot
                     ↓
         Pulse + Functional Digital Twin
```

This allows Xiaomi, Apple Health, Garmin or other providers to change without changing the Twin contract.

## 8. V0.4 implementation target

The browser prototype now needs to prove the architecture before real health data is connected:

1. deterministic demo snapshots;
2. a timeline switching between snapshots;
3. source provenance and quality;
4. body-region overlays;
5. an event log;
6. an agent action protocol;
7. a deterministic local "agent simulator" that exercises the same protocol future Astra will use;
8. a much more distant third-person camera so the full avatar, Twin and data architecture remain readable at once.

## 9. Next production steps

1. Replace demo snapshot values with a canonical parser of the definitive Myodev export.
2. Store measurements/snapshots/events in Supabase with row-level security.
3. Add Pulse-authenticated subject identity.
4. Add wearable adapters.
5. Add server-side KŌMŌ Points ledger.
6. Add Realtime presence for World.
7. Add the model adapter only after the deterministic action protocol is stable.

## Product rule

**The Twin is the truth layer. The AI is the interface to the truth layer.**

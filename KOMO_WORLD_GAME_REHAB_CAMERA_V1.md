# KŌMØ WORLD — GAME + REHAB + MOTION CAMERA V1

Status: product architecture for the `prototype/komo-world-v0` branch.

## Product thesis

KŌMØ World should create three connected reasons to return:

1. **Understand** — the Functional Digital Twin explains current locomotor state and change over time.
2. **Act** — Rehab translates selected deficits into safe, progressive movement sessions.
3. **Play** — Arena turns movement into daily challenges, clubs, streaks, XP and KŌMØ Points.

The same movement may exist in both Arena and Rehab, but the purpose is different. Arena scores engagement/performance in the challenge. Rehab follows a deterministic programme selected from the Functional Twin and never exposes health deficits publicly.

## Core loop

Real-world measurement → Twin snapshot → deterministic recommendation → World room → guided movement → camera / wearable / sensor event → reward + rehab event → reassessment → updated Twin.

## Truth hierarchy

- Myodev / formal functional tests / gait / strength / posture = formal assessment layer.
- Wearables / steps / sleep / activity = daily context layer.
- Motion Camera = movement observation layer: repetitions, approximate joint angles, tempo, gross symmetry/stability and completion.
- AI = explanation/orchestration layer. AI cannot rewrite measured values.

Camera-derived metrics are estimates and must not be represented as equivalent to instrumented clinical measures.

## Motion Camera engine

Initial browser implementation: MediaPipe Pose Landmarker, one person, live video, client-side processing.

Output per frame:
- 33 pose landmarks where available;
- landmark visibility/confidence;
- joint angles;
- normalized body geometry;
- state-machine events (standing/down/up etc.);
- repetition count;
- tempo;
- approximate range of motion;
- form flags that are supportable from the chosen camera angle.

No raw video needs to leave the device for V1. The default is local processing. Only derived exercise events should be eligible for storage after explicit user action/consent.

## Exercise library V1

### Game-first challenges

**Squat 10**
- Camera: front 30–45° or side.
- Observable: hip/knee angle cycle, rep count, tempo, left/right gross symmetry where view permits.
- Success: 10 accepted repetitions.

**Push-up 10**
- Camera: side.
- Observable: elbow flexion/extension cycle, shoulder–hip–ankle line, rep count, tempo.
- Success: 10 accepted repetitions.

**Balance Hold 30 s**
- Camera: front.
- Observable: whole-body landmark displacement, support-foot continuity, gross trunk sway.
- Success: complete target duration inside tolerance.

**Sit-to-Stand 10**
- Camera: side or 30–45°.
- Observable: hip/knee extension cycle, rep count, tempo.
- Success: 10 accepted repetitions.

**Daily Steps**
- Source: wearable / phone / connected platform, not camera.
- Game loop: daily target, streak and club contribution.

### Rehab-first movements

The first deterministic catalogue should cover locomotor domains rather than diagnoses:

**Knee extensor / functional lower-limb strength**
- Sit-to-stand
- Supported squat-to-chair
- Step-up
- Progression: more reps → slower eccentric control → greater step height / resistance only when authorised.

**Posterior-chain / hip extension**
- Bridge
- Hip hinge pattern
- Supported split-stance hinge

**Calf / plantar-flexor capacity**
- Supported bilateral heel raise
- Supported unilateral heel raise

**Balance**
- Feet together → semi-tandem → tandem → single-leg stance
- Controlled multidirectional reach
- Step-and-hold

**Gait / mobility**
- Walking bouts
- Pace changes
- Direction-change drills
- Step-up / stair practice where appropriate

**Upper-body general challenge**
- Wall push-up → incline push-up → floor push-up
- Used as general engagement unless a clinician-authored programme explicitly includes it.

## Deterministic recommendation engine

Recommendations are driven by structured inputs, not free-form AI prescription.

Example rule priorities:

1. Safety / contraindication gates.
2. Functional prerequisites.
3. Dominant deficit domain.
4. Laterality if a validated source supplies it.
5. Current level and previous completion quality.
6. Progression only after completion criteria are met.

Example mapping:

- low functional lower-limb strength → sit-to-stand / supported squat / step-up progression;
- balance deficit → supported static balance before dynamic reach / single-leg variants;
- low gait capacity → strength + balance prerequisites, then progressive walking / pace-change work;
- residual unilateral quadriceps asymmetry → clinician-authored unilateral progression when available; otherwise generic bilateral functional work plus professional review;
- no meaningful deficit / healthy user → Arena and general physical-activity challenges rather than “rehab”.

## Safety contract

Before a rehab session the product must be able to record a minimal readiness gate (pain/red flags/new injury/dizziness/medical restriction). A positive safety flag must stop automated progression and route to professional review.

The exercise engine may suggest regressions (chair support, smaller range, lower target) but should not invent treatment for an undiagnosed problem.

## Camera scoring contract

Camera challenge scores can include:
- completion;
- repetitions accepted;
- stability;
- tempo consistency;
- range-of-motion band;
- movement-quality flags.

Public leaderboards must never rank:
- Motion Score;
- Motion Age;
- pain;
- medical diagnosis;
- clinical deficit;
- raw health measurements.

## KŌMØ Points / XP

Award for:
- completing a Daily Challenge;
- first camera challenge of the day;
- rehab programme adherence;
- reassessment milestones;
- education / Library completion;
- event participation;
- partner-world experiences.

No cash-out and no pay-to-win health advantage.

## World rooms

### Twin Lab
Read body state, timeline, sources and priorities.

### Rehab Gym
Private room. Coach Agent receives only authorised Twin summary + current programme. It guides the deterministic exercise plan and uses Motion Camera as an observation tool.

### Arena
Public/social room. Daily/weekly/season challenges, Clubs, podiums and leaderboards based on game metrics only.

### Library
Scientific content, programmes and explainers. Future Librarian Agent.

### Amphitheatre
Live / recorded events, Locotech, masterclasses.

### Riviera / partner world
Locked frontier. Unlock nodes only when a real partner/location/offer is operational.

## Agent contract (Astra-ready)

The future agent should call tools such as:
- `get_twin_summary(subject_id)`
- `get_rehab_program(program_id)`
- `get_exercise(exercise_id)`
- `start_camera_session(exercise_id)`
- `record_exercise_event(session_id, derived_metrics)`
- `explain_metric(metric_id)`
- `request_professional_review(subject_id, reason)`

The agent may choose how to explain/navigate, but not silently alter measurements or bypass safety/progression rules.

## V0.9 implementation target

1. Add Motion Camera Lab overlay to World.
2. Camera permission + privacy-first local processing.
3. Pose skeleton overlay.
4. Four initial tasks: Squat 10, Push-up 10, Sit-to-Stand 10, Balance 30 s.
5. Local result card: reps, time, estimated ROM/stability, completion.
6. Link from Arena and Rehab.
7. Persist only derived demo results locally for now.
8. Prepare data contract for later Supabase / Pulse events.

## Evidence direction

Broad programme logic should follow multicomponent strength, balance and functional exercise principles. Formal patient-specific prescriptions and progression thresholds must remain clinician-governed when KŌMØ is used as a medical/rehab product.

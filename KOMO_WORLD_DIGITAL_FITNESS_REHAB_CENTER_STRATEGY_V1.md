# KŌMØ WORLD — DIGITAL FITNESS & REHAB CENTER STRATEGY V1

## Product thesis
KŌMØ World evolves from a 3D companion into a digital movement center personalized by the Functional Digital Twin.

The center has five linked layers:
1. TWIN — truth layer: what is measured, where the deficits are, how the patient changes over time.
2. REHAB — guided corrective layer: exercises selected from explicit rules, restrictions and validated plans.
3. FITNESS — training layer: strength, balance, mobility, endurance and movement capacity sessions available on demand.
4. ARENA — engagement layer: replayable game challenges, records, XP, points, streaks, clubs and events.
5. MOTION CAMERA — observation layer: local-first pose estimation for reps, range proxies, tempo, stability and execution feedback.

Core loop:
Measure → Understand → Train / Rehab → Observe → Reward → Reassess → Update Twin.

Clinical rule: training and camera events may enrich history, adherence and progression but never silently modify the clinical Motion Score or measured Twin values. Clinical state changes only from authorized measurement sources.

## User modes

### 1. Free Fitness
Goal: daily engagement and general movement.
- Squats
- Push-ups
- Sit-to-Stand
- Balance hold
- Lunges
- Step-ups
- Calf raises
- March in place
- Shoulder mobility
- Trunk mobility
- Reaction / coordination drills
- Walking / steps quests

Each exercise can support:
- fixed target (e.g. 10 reps)
- maximum reps in 30 / 60 / 120 seconds
- technique challenge
- streak challenge
- personal best
- Club challenge

### 2. Twin-Guided Fitness
Goal: make the daily program relevant to the patient's measured profile.
Inputs may include:
- Motion Score and domain scores
- quadriceps symmetry
- gait speed
- strength index
- balance domain
- posture domain
- activity / steps
- rehab adherence
- latest assessment date

Outputs:
- today priority
- recommended training category
- primary exercise
- support exercise
- optional game challenge
- weekly target
- progression review flag

### 3. Rehab
Goal: execute a clinician-approved or protocol-based program with structured follow-up.
A Rehab prescription contains:
- indication / target domain
- exercise IDs
- starting level
- dose (sets, reps, hold duration, days/week)
- restrictions / contraindications
- allowed progressions
- review date
- professional owner

The AI/Twin can explain, demonstrate and coach. It cannot autonomously overwrite a clinical prescription.

### 4. Reassessment
Goal: close the loop.
After a defined period or enough completed sessions, the patient is prompted to repeat relevant measures.
Examples:
- Sit-to-Stand reassessment
- balance reassessment
- gait reassessment
- Myodev reassessment
- full KŌMØ assessment

Only reassessment data can update the corresponding measured clinical layer.

## Movement ontology
Every exercise is mapped to a movement target rather than only a muscle name.

Target domains:
- lower-limb strength
- extensor power
- knee control
- hip control
- ankle / calf function
- static balance
- dynamic balance
- gait base
- trunk control
- posture
- upper-body strength
- shoulder mobility
- coordination
- endurance

Each exercise record should contain:
- id
- title FR/EN
- category: game | fitness | rehab | assessment
- domains[]
- equipment
- camera placement
- camera-required landmarks
- state machine / scoring rule
- fixed targets[]
- max modes[]
- regressions[]
- progressions[]
- contraindication flags[]
- coaching cues[]
- public leaderboard allowed? boolean
- clinical interpretation allowed? boolean

## First recommendation matrix

### Quadriceps asymmetry / lower-limb weakness
Potential training path:
1. Sit-to-Stand
2. Supported squat
3. Bodyweight squat
4. Tempo squat
5. Split squat / lunge
6. Step-up
7. Higher-power progression only after appropriate review

Game options:
- Squat 10
- Max squats 60 s
- Sit-to-Stand speed challenge
- Step target challenge

Camera metrics:
- reps
- knee-angle proxy
- tempo
- trunk displacement proxy
- side-to-side visibility / symmetry proxy when reliable

### Balance priority
Potential path:
1. bilateral quiet stance
2. narrow stance
3. semi-tandem
4. tandem
5. single-leg support when appropriate
6. dynamic weight shift
7. stepping / reach tasks

Game options:
- Balance Hold
- Stability streak
- Target shift
- reaction step challenge

Camera metrics:
- hold time
- normalized trunk sway proxy
- loss-of-pose / step events

### Gait / locomotor base priority
Potential path:
- marching in place
- sit-to-stand
- step-ups
- cadence challenge
- short walking test
- step-volume quests

Camera / wearable metrics:
- cadence proxy
- step count
- session duration
- gait test results when measured in an assessment context

### General fitness
Potential path:
- squat
- push-up or regression
- calf raise
- lunge
- balance
- march in place
- mobility circuit

Arena keeps this fun and replayable.

## Safety tiers

### Green — free game / fitness
Healthy movement challenges without clinical claims.
Examples: fixed-rep squats, general push-ups, step quests.

### Amber — Twin-guided
Uses private functional state to suggest an appropriate difficulty band. Publicly expose only the selected challenge, never why the user received it.

### Red — clinician-gated Rehab
For programs with diagnosis, postoperative status, significant pain, instability, neurological deficits, or explicit restrictions. Requires professional ownership and rules.

The system must surface stop criteria such as new severe pain, dizziness, acute neurological symptoms, or clinician restrictions where relevant.

## Scoring architecture

Three separate currencies / scores:

### Motion Score
Clinical / functional status derived from authorized assessment data.
Never purchasable. Never leaderboarded publicly.

### Arena Points
Game performance and participation.
Examples:
- completion points
- validated reps
- stability / accuracy bonus
- daily challenge bonus
- personal record bonus

### World XP
Engagement and progression through the KŌMØ ecosystem.
Examples:
- completed Rehab session
- training consistency
- education
- events
- reassessment

Do not convert Arena Points or XP into Motion Score.

## Patient experience — ideal daily flow

1. Spawn / Today
- current Motion state (private)
- 1 recommended action
- 1 Arena challenge
- steps / activity quest

2. Choose
- Train
- Rehab
- Arena
- Explore

3. Motion Camera setup
- position phone
- camera permission
- framing test
- light test
- full-body detection
- countdown

4. Session
- rep count
- simple cue
- technique proxy
- timer
- progress toward goal

5. Result
- reps / time
- estimated quality
- points earned
- personal record
- streak
- next suggested action

6. Twin history
- session appears as training / Rehab event
- no clinical score mutation

## Digital rooms

### KŌMØ Fitness Floor
Open training room.
Stations: squat, push-up, mobility, step, balance, cardio / march.
Users can enter anytime and choose a workout.

### KŌMØ Rehab Lab
Private / guided space.
Stations are generated from the active program.
Coach explains today's prescription and dose.

### Motion Camera Studio
Dedicated capture zone with framing wizard and optional phone/tablet stand mode.

### Arena
Daily challenge, free play, personal records, Clubs, seasonal events.

### Twin Lab
Results and longitudinal state.

### Reassessment Room
Repeat functional tests and schedule / request formal reassessment.

## Innovation roadmap

### Phase A — now
- compact Arena
- challenge catalog
- fixed and max-rep modes
- Motion Camera framing
- local events / history
- deterministic Twin-guided program

### Phase B — next
- personal records per exercise
- Bronze / Silver / Gold achievement bands
- dynamic daily quests
- audio rep confirmation
- real-time coaching cues
- exercise demo animation
- lunges, step-ups, calf raises, march-in-place
- separate Fitness Floor and Rehab Lab rooms

### Phase C — patient-specific center
- program builder driven by Twin domains
- restriction engine
- progression / regression rules
- professional review queue
- reassessment triggers
- patient-specific weekly plan
- adherence and load history

### Phase D — connected center
- Supabase identity and persistent sessions
- multi-device synchronization
- professional dashboard
- Friends / Clubs
- server-authoritative leaderboards
- partner / hotel / clinic challenges
- wearable steps and training feeds

### Phase E — advanced movement intelligence
- richer pose-estimation models
- movement-quality classifiers validated against reference datasets
- multi-angle capture where needed
- optional Myodev integration during selected Rehab / reassessment sessions
- agent coach with governed tool access
- longitudinal training-response modeling

## Metrics that matter
Product:
- weekly active users
- sessions / user / week
- Arena replay rate
- Rehab adherence
- camera session completion rate
- day-7 / day-30 retention

Functional:
- reassessment completion
- change in measured domains
- progression to higher exercise level after review
- reduction in asymmetry where relevant
- gait / strength / balance change where formally measured

Commercial:
- patients per KŌMØ Case site
- active professionals
- programs prescribed
- World engagement after assessment
- reassessment conversion
- partner-site engagement

## Product positioning
KŌMØ should not present itself as a generic fitness app or as a video-game overlay on healthcare.

Position:
**A personalized digital movement center powered by your Functional Digital Twin.**

Promise:
**Measure what your body can do. Train what matters. See what changes.**

The defensible loop is not the exercise library alone. It is the link between real measurement, patient-specific selection, camera-observed execution, longitudinal history and reassessment.

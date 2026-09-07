# KŌMØ WORLD · Product & Revenue Architecture V0

**Working positioning:** *Your digital twin for a longer life.*

KŌMØ World is not designed as a generic metaverse. It is the spatial layer of the KŌMØ ecosystem: a place where a user can understand a functional digital twin, explore longitudinal measurements, perform guided movement programmes, earn KŌMØ Points and connect to the real KŌMØ Network.

## 1. Product thesis

KŌMØ already has the ingredients of a closed loop:

**Measure in the real world → understand in Pulse/World → act through a plan → repeat → update the functional twin.**

World makes this loop visible and habit-forming. The long-term product advantage is not the 3D environment itself; it is the combination of longitudinal locomotor data, a functional twin, prescribed/guided movement, KŌMØ Points and a physical network of places and professionals.

## 2. V0 scope

The first prototype intentionally contains only five spatial states:

1. **Atrium** — home, Motion Score, Level, KŌMØ Points.
2. **My Twin** — functional digital twin and longitudinal comparison.
3. **Motion Lab** — movement domains and assessment results.
4. **Rehab** — guided exercise loop and points reward.
5. **KŌMØ Network** — bridge to real centres, hotels, clubs and experiences.

The V0 uses demonstration data only. It is a product/design prototype, not a clinical device.

## 3. KŌMØ Points architecture

KŌMØ Points should function as loyalty/engagement points, **not currency and not crypto**.

### Earn

Points can be earned for behaviours that increase engagement with an agreed plan:

- completing a KŌMØ assessment;
- completing a prescribed or recommended session;
- adherence streaks;
- educational modules;
- participation in group mobility sessions;
- selected partner experiences;
- longitudinal reassessment.

Points should reward **participation and adherence**, not reward having a better health state. A person with impairment should not be economically disadvantaged because their Motion Score is lower.

### Use

Points may unlock:

- avatar items and visual customisation;
- additional non-clinical spaces/challenges;
- KŌMØ group sessions;
- partner hospitality/fitness benefits;
- invitations to KŌMØ / Locotech events;
- selected non-medical services or discounts;
- premium educational content.

### Guardrails

- no cash-out;
- no transfer between users in V1;
- no speculative value;
- no reward for sharing health data with advertisers;
- no sale of personal health data;
- clear expiry/terms if points later obtain material commercial value.

## 4. Revenue model — priority order

The strongest early business model is **B2B recurring software**, not consumer virtual goods.

### A. KŌMØ World Node · B2B

For a clinic, longevity centre, hotel, fitness club or performance centre.

Includes:

- a real-world venue represented inside KŌMØ Network;
- partner profile and booking/contact layer;
- KŌMØ Points redemption options;
- client/member onboarding into World;
- partner analytics that do not expose identifiable health data;
- campaigns/challenges for the venue.

**Initial pricing hypothesis:**

- Setup / spatial onboarding: **€1,500–€3,000 per site**
- World Node licence: **€390–€790/month/site**

For strategic flagship hospitality locations, a bespoke branded environment can be priced materially higher.

### B. KŌMØ Clinical + World Rehab · B2B

For authorised clinical environments using Pulse and later regulated rehabilitation functionality.

Includes:

- Functional Twin;
- longitudinal Motion Lab;
- professional dashboard;
- prescribed/guided programmes;
- patient World access;
- adherence and completion tracking;
- future camera / sensor exercise measurement.

**Initial pricing hypothesis:**

- **€790–€1,490/month/site** depending on active-patient volume and functionality.
- Optional onboarding/integration fee.

Where medical fee-sharing or referral commissions are restricted, KŌMØ should monetise through fixed software/platform fees rather than a percentage of regulated medical acts.

### C. KŌMØ World+ · Consumer membership

World should remain accessible without payment so the network can grow.

**Free**

- Atrium;
- basic avatar;
- basic Points wallet;
- latest Motion snapshot;
- public/community spaces;
- Network discovery.

**World+ hypothesis: €14.90–€19.90/month or €149–€199/year**

- longitudinal Functional Twin;
- deeper comparisons;
- expanded Motion Lab;
- premium non-clinical programmes;
- advanced challenges;
- additional KŌMØ environments;
- member benefits and Points multipliers where appropriate.

Clinical or prescribed rehabilitation functions should not be artificially paywalled in a way that conflicts with clinical governance; they can instead be bundled with the clinical service or funded by the professional/organisation.

### D. KŌMØ Network commerce

World can become a discovery/booking layer for real experiences.

Potential revenue:

- fixed partner listing/subscription;
- fixed booking/platform fee where appropriate;
- percentage commission on clearly non-medical hospitality, fitness or retail experiences where lawful;
- sponsored challenges that are compatible with KŌMØ's health positioning.

Do **not** build the model around selling patient leads or taking opaque percentages from regulated medical acts.

### E. Premium spatial environments

KŌMØ can create paid or sponsored destinations:

- hotel / resort environments;
- sport-specific rooms;
- Locotech auditorium;
- brand-supported education spaces;
- corporate mobility challenges;
- event environments.

Pricing can range from a few thousand euros for a templated space to significantly more for a bespoke enterprise build.

### F. Enterprise / white-label

Large hospital groups, insurers, corporate wellbeing operators or hospitality groups may license a controlled version of World.

Possible structure:

- implementation fee;
- annual enterprise licence;
- per-site fee;
- optional integration and support.

The KŌMØ identity, measurement methodology and core data model should remain proprietary even when a client-facing skin is customised.

## 5. Business flywheel

**KŌMØ Case / assessment**
→ creates high-quality locomotor data
→ updates **Pulse + Functional Twin**
→ creates a reason to enter **World**
→ Rehab/challenges create repeated engagement
→ engagement creates **KŌMØ Points**
→ Points and Network connect the user to partner locations
→ partner locations generate new assessments and memberships
→ each new assessment improves longitudinal value.

World therefore increases the lifetime value of both the **patient/member** and the **KŌMØ Case installed base**.

## 6. The key commercial bundle

A future KŌMØ Case sale should not be understood as hardware only.

A stronger product is:

**KŌMØ Case + Pulse + World Node + Functional Twin + Network access.**

This allows KŌMØ to combine one-off hardware revenue with recurring software revenue.

Example commercial structure to test:

- Case / equipment: existing commercial price;
- implementation & training: one-off fee;
- Pulse + World licence: **€490–€990/month/site** depending on scope;
- clinical/rehab layer: higher tier when activated;
- Network/partner layer: included or separately priced by sector.

## 7. What should remain free

The product must have enough free utility to create network effects:

- entering World;
- basic avatar;
- basic Points;
- Network discovery;
- selected group/community spaces;
- latest personal Motion state where the user already owns that data.

The monetised layer is **continuity, depth, professional functionality, premium programmes and network services**, not simply access to the 3D environment.

## 8. Regulatory/product boundary

The V0 should remain a visualisation and engagement prototype.

When World begins to:

- prescribe rehabilitation;
- adapt therapy based on measured performance;
- quantify movement for clinical decision-making;
- provide clinically actionable alerts;

then medical-device qualification, clinical evidence, data governance, cybersecurity and professional responsibility must be addressed explicitly in product design.

The architecture should therefore separate:

1. **Entertainment/community layer**
2. **Wellness/engagement layer**
3. **Clinical/regulated layer**

from the start.

## 9. Technical target architecture

### Now

- Web first
- Three.js / WebGL prototype
- Pulse authentication/data adapter later
- responsive desktop/mobile controls

### Next

- Supabase-backed user state
- KŌMØ Points ledger
- room/content entitlements
- real Motion Score feed
- Myodev result adapter
- Network database

### Rehabilitation phase

- camera pose estimation;
- repetition detection;
- ROM / movement quality metrics;
- optional Myodev sensor input;
- professional programme builder;
- clinically governed feedback.

### Immersive phase

- WebXR / Meta Quest;
- Apple Vision Pro;
- optional Unreal/Unity client if the visual/interaction requirements justify a native engine.

## 10. Astra / advanced agent layer

The architecture should not depend on one model name. KŌMØ AI should sit behind an abstract agent interface so a more capable spatial/computer-use model can be adopted when available.

Future agent functions:

- guide the user through rooms;
- explain the Functional Twin;
- compare longitudinal assessments;
- launch appropriate sessions;
- coordinate with Pulse/Network actions;
- assist professionals in navigating data;
- operate spatial UI safely within permissions.

## 11. V0 success criteria

The first prototype is successful if a partner or investor can understand in less than two minutes:

1. **I have a functional digital twin.**
2. **My measurements live in a spatial Motion Lab.**
3. **I can train/rehabilitate inside dedicated rooms.**
4. **Useful behaviour earns KŌMŌ Points.**
5. **The virtual world connects me to real KŌMŌ locations.**
6. **KŌMŌ monetises through recurring software + network services, not by selling health data.**

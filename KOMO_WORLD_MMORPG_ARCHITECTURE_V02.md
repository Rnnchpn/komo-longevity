# KŌMØ WORLD · MMORPG Architecture V0.2

## Product direction

KŌMØ World should evolve into a persistent social world built around movement, functional health, rehabilitation, performance and the real KŌMØ Network.

The MMORPG layer is not the clinical truth layer. The system deliberately separates:

1. **Avatar identity** — fully customisable appearance, clothing, social identity and cosmetics.
2. **Functional Digital Twin** — objective overlays derived from KŌMØ measurements and longitudinal data.
3. **World progression** — Level, KŌMØ Points, achievements, rooms and social participation.
4. **Clinical spaces** — private, permissioned, professionally governed instances.

## Core MMORPG loop

Enter World
→ meet other members
→ explore rooms
→ complete movement / education / community activities
→ earn KŌMØ Points and progression
→ unlock cosmetic and experience rewards
→ connect to real KŌMØ nodes
→ reassess in the real world
→ update the Functional Twin.

## Avatar system

### Cosmetic layer

The avatar should ultimately support:

- display name;
- body height/build presets;
- skin tone;
- facial presets;
- hair style and colour;
- clothing;
- shoes;
- accessories;
- KŌMØ collections;
- partner/event cosmetics;
- animation/emote sets.

Cosmetic settings must never modify measured functional values.

### Functional Twin layer

The Functional Twin can share the avatar's identity/appearance while adding non-editable overlays such as:

- muscle symmetry;
- activation profiles;
- mobility;
- balance;
- posture;
- gait;
- Motion Score;
- Motion Age;
- longitudinal change.

The user may choose how overlays are visualised but cannot edit the underlying measured values.

## World structure

### Public shared spaces

- The Atrium
- Club / Community
- Network destinations
- Auditorium / Locotech events
- Education spaces
- selected group movement rooms

### Private or instanced spaces

- My Twin
- personal Motion Lab
- prescribed Rehab room
- clinician consultation space
- professional review room

Health information should not appear by default in public/shared spaces.

## Multiplayer backend target

### Identity

Pulse / Supabase Auth becomes the canonical account identity.

### Presence

Use Supabase Realtime Presence initially for:

- online/offline state;
- current public room;
- avatar transform snapshots;
- lightweight emotes/status;
- party/group membership.

Do not broadcast clinical or health data through presence channels.

### Movement synchronisation

Client sends compact transform snapshots at a bounded rate.
Remote clients interpolate between snapshots.

Payload example conceptually:

- user public id;
- world instance id;
- x/y/z;
- rotation;
- animation state;
- cosmetic avatar revision.

No Motion Score, diagnosis, exercise prescription or medical result belongs in this payload.

### Sharding / instances

KŌMØ World should not be one unlimited global room.

Use world instances such as:

- `atrium-eu-001`
- `atrium-eu-002`
- `locotech-2026-main`
- `rehab-private-{session}`
- `clinic-private-{appointment}`

Public spaces can be capacity-limited and sharded. Clinical spaces require explicit authorisation and private membership.

## Social systems

Potential MMORPG features:

- friends;
- parties;
- KŌMØ Clubs / guild-like communities;
- group mobility sessions;
- scheduled events;
- destination challenges;
- emotes;
- achievements;
- leaderboards limited to safe engagement variables.

Avoid public rankings based on disability, Motion Score, biological age or disease burden.

## KŌMØ Points

KŌMØ Points remain loyalty/engagement points, not crypto or cash-equivalent currency.

### Earn examples

- complete eligible session;
- attend group mobility event;
- reassessment;
- education module;
- adherence streak;
- partner experience;
- community contribution where appropriate.

### Spend / unlock examples

- cosmetic clothing;
- avatar accessories;
- premium environments;
- non-medical challenges;
- event access;
- partner benefits;
- KŌMØ collections.

The Points ledger should become server-authoritative before real commercial value is attached.

## Economy / monetisation additions enabled by MMORPG

### 1. World+ membership

Subscription for expanded persistent-world features, advanced personal visualisations and premium non-clinical spaces.

### 2. Cosmetics

Optional paid cosmetic collections can become incremental revenue without pay-to-win mechanics.

Examples:

- KŌMØ Life clothing;
- Riviera capsule;
- Locotech attendee items;
- partner hotel destination items.

Avoid selling health advantages or superior clinical access through cosmetic currency mechanics.

### 3. World Nodes

Hotels, clinics, performance centres and fitness clubs can license a persistent destination inside KŌMØ World.

Revenue model:

- setup fee;
- monthly site licence;
- optional bespoke spatial design;
- non-medical commerce/booking integrations where lawful.

### 4. Sponsored events / destinations

Carefully selected brands can sponsor architecture, events or challenges when compatible with KŌMØ's positioning and without access to identifiable health data.

### 5. Professional / clinical licences

Clinics can license private Rehab and professional review environments as part of Pulse Clinical / World Rehab.

## Moderation and safety

A multiplayer health-adjacent world needs moderation from the start:

- block/report/mute;
- public display-name policy;
- anti-harassment controls;
- rate limits;
- private clinical-room access control;
- no public exposure of patient health status;
- audit logs for professional actions;
- age/access policy before opening community features broadly.

## Technical phases

### V0.2 — current prototype

- third-person player movement;
- customisable avatar;
- cosmetic persistence in browser;
- Functional Twin appearance sync;
- simulated other users;
- Rehab → KŌMØ Points loop.

### V0.3 — real multiplayer

- Pulse/Supabase login;
- public avatar profile table;
- Realtime Presence;
- remote transform interpolation;
- live player count;
- actual online avatars;
- private/public instance model.

### V0.4 — social world

- friends;
- parties;
- Club spaces;
- chat/emotes;
- group sessions;
- moderation tools.

### V0.5 — economy

- server-authoritative Points ledger;
- cosmetics inventory;
- entitlements;
- World+ subscription;
- partner rewards.

### V1 — functional world

- real Pulse data adapter;
- longitudinal Functional Twin;
- Movement / Motion Lab data visualisation;
- real KŌMØ Network nodes.

### Rehab phase

- camera pose estimation;
- exercise recognition;
- repetition detection;
- ROM / movement quality;
- optional Myodev integration;
- professional programme builder;
- clinically governed feedback.

## Design principle

KŌMØ World should feel closer to a premium persistent architectural world than to a cartoon game.

The user should experience:

**MMORPG freedom + KŌMØ scientific identity + real-world utility.**

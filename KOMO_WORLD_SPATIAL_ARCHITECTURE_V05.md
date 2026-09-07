# KŌMØ World · Spatial Architecture V0.5

## Product principle

KŌMØ World is not a collection of screens placed in 3D. It is a persistent spatial operating environment built around the KŌMØ Functional Digital Twin.

The world is organised into five primary destinations. Each space has a clear user purpose, a data contract, a monetisation role and an agent role.

## Central hub — The Atrium / Functional Twin

The Atrium is the arrival point and always reconnects the user to the Functional Digital Twin.

Core functions:
- Motion Score / Motion Age / current functional state;
- longitudinal timeline;
- current priorities;
- KŌMØ Points / Level;
- doors to the major destinations;
- KŌMØ personal agent.

The Twin remains the truth layer. World is the spatial interface around it.

---

# 1. KŌMØ GYM / REHAB CENTER

## Purpose

A virtual training and rehabilitation environment where the user performs guided exercise based on measured functional deficits and authorised programme context.

## Spaces

- Lower Limb
- Quadriceps
- Hamstrings
- Calf
- Balance
- Mobility
- Gait
- Spine
- Upper Limb
- Performance
- Recovery / breathing

## Coach Agent

The virtual coach receives only the context required for the session:

- current Twin snapshot;
- relevant deficits;
- current authorised programme;
- progression stage;
- previous session results;
- contraindications / restrictions when explicitly supplied through governed clinical data;
- adherence history.

The coach can:
- explain the exercise;
- demonstrate it;
- adapt presentation/difficulty within an authorised progression envelope;
- count repetitions;
- encourage adherence;
- focus the avatar/Twin on the relevant region;
- record session completion;
- award KŌMØ Points according to deterministic rules.

The coach cannot autonomously create or modify a medical prescription unless a governed future clinical workflow explicitly permits this with human approval.

## Future sensor loop

Camera / pose estimation
→ movement detection
→ ROM / repetitions / compensations
→ optional Myodev EMG
→ session event
→ Rehab adapter
→ new Twin observation
→ reassessment / updated Twin.

---

# 2. KŌMØ RIVIERA / NETWORK DISTRICT

## Purpose

Extend the virtual experience into the real KŌMØ network.

The Riviera becomes the first geographic district of World.

Initial destinations can include:
- Cannes
- Antibes
- Nice
- Monaco
- Saint-Tropez / Pampelonne

Later:
- Ibiza
- Capri
- Dubai
- Jávea
- Paris
- other KŌMØ destinations.

## World Nodes

Each real partner location can have a spatial KŌMØ Node:

- clinic;
- hotel;
- longevity centre;
- fitness club;
- Pilates / yoga studio;
- performance centre;
- event venue.

Node functions:
- enter a virtual representation of the place;
- discover available KŌMØ experiences;
- book a Motion Assessment or eligible non-medical service;
- see events / sessions;
- redeem eligible KŌMØ Points benefits;
- continue a challenge in the physical venue;
- update the Twin after a real-world assessment.

## Riviera Agent

A concierge agent can:
- explain destinations;
- guide the user through the district;
- surface authorised/available experiences;
- open booking flows;
- recommend locations based on declared user intent and network availability;
- never expose medical information to a partner node without the correct permission scope.

---

# 3. KŌMØ LIBRARY

## Purpose

A real spatial library, not a list of PDFs.

The user walks through collections and shelves.

## Collections

- Movement Science
- Muscle
- Gait
- Spine
- Ageing
- Strength
- Balance
- Sleep & Recovery
- Nutrition / lifestyle where appropriate
- Research methodology
- KŌMØ Science
- Myodev technology
- Locotech proceedings
- Patient education
- Professional education

## Interaction

A book/article/object can be taken from a shelf and opened as:
- readable text;
- visual explainer;
- 3D anatomy;
- audio summary;
- guided lesson;
- citation/source view.

## Librarian Agent

The librarian agent can:
- find reliable content;
- explain concepts at patient or professional level;
- cite source provenance;
- create a personalised reading path;
- connect educational material to the currently selected Twin domain without presenting educational content as an individual diagnosis.

---

# 4. KŌMØ STORE

## Purpose

The commercial layer of World.

## Categories

### Digital
- avatar clothing;
- KŌMØ Life collections;
- cosmetic accessories;
- environments / room customisation;
- event collectibles;
- club identity items.

### Physical
- KŌMØ Life apparel;
- selected training / mobility accessories;
- partner products only when consistent with KŌMØ positioning and regulatory rules.

### Services / access
- World+ membership;
- eligible KŌMØ experiences;
- event access;
- non-medical partner experiences;
- professional or enterprise packages where relevant.

## Economy

- fiat payment remains separate from KŌMØ Points;
- KŌMØ Points are loyalty/engagement units, not money or crypto;
- no pay-to-win health mechanics;
- Motion Score can never be purchased or artificially increased.

## Store Agent

A retail/concierge agent can explain products and eligibility but cannot use sensitive health data for commercial targeting unless a future lawful/consented design explicitly allows a tightly scoped use.

---

# 5. KŌMØ AMPHITHEATRE

## Purpose

A persistent education, community and events space.

## Uses

- KŌMØ Talks;
- Locotech conferences;
- live expert sessions;
- research presentations;
- startup demos;
- rehabilitation education sessions;
- community events;
- partner keynotes;
- recorded replays.

## Modes

### Public auditorium
Large events, talks, replays.

### Professional auditorium
Clinician / partner education and workshops.

### Small rooms
Masterclasses, clubs, Q&A sessions.

## Stage Agent

The amphitheatre agent can:
- introduce speakers;
- guide users to sessions;
- answer questions from authorised event content;
- surface references and replays;
- coordinate virtual attendance and KŌMØ Points rewards for eligible participation.

---

# Spatial master plan

```text
                         KŌMØ RIVIERA / NETWORK
                                  │
                                  │
        LIBRARY ─────── FUNCTIONAL TWIN ATRIUM ─────── STORE
                                  │
                                  │
                         KŌMØ GYM / REHAB
                                  │
                                  │
                           AMPHITHEATRE
```

This diagram is logical, not a final map. The final world can be expanded into districts while preserving these relationships.

---

# Agent hierarchy

## Personal KŌMØ Agent

Persistent user-facing companion. It understands the user's authorised Twin context and routes the user through World.

## Specialist agents

- Rehab Coach Agent
- Riviera Concierge Agent
- Librarian Agent
- Store Agent
- Amphitheatre / Event Agent
- Motion Lab Agent

Each specialist receives the minimum context required for its role.

## Future orchestration layer

A future Astra-class model can act as the high-level spatial/orchestration intelligence while the deterministic Twin Core, policy engine and source adapters remain authoritative.

---

# Monetisation map

## Gym / Rehab
- World+ subscription;
- B2B clinical / professional licence;
- programme modules;
- enterprise deployment.

## Riviera / Network
- partner Node setup;
- monthly Node licence;
- eligible booking / marketplace revenue for non-medical services;
- hospitality packages.

## Library
- premium education membership;
- professional learning packages;
- sponsored scientific/industry spaces only with strict editorial separation.

## Store
- physical KŌMØ products;
- digital cosmetics;
- memberships;
- event access;
- partner experiences.

## Amphitheatre
- KŌMØ / Locotech events;
- premium replays;
- professional education;
- branded enterprise events;
- sponsorship with explicit separation from scientific content.

---

# Build order

1. Functional Twin Atrium — already underway.
2. KŌMØ Gym / Rehab — next major functional room.
3. Riviera / Network district — first real-world commercial extension.
4. Library — first persistent knowledge space.
5. Amphitheatre — events and community.
6. Store — economy and inventory once identity/points/account systems are stable.

The world should expand only after each area has a real function and data contract.

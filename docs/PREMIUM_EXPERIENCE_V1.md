# KŌMØ — Premium Experience System V1

## Principle

KŌMØ should not feel like a health-tech website. It should feel like a premium physical experience translated to the screen.

The product promise is simple:

**One Case. One Assessment. One Platform. A Lifetime in Motion.**

Motion must never be decorative. Every animation should do one of four jobs:

1. reveal hierarchy;
2. explain a measurement;
3. reinforce continuity between Case and Pulse;
4. create a sense of calm precision.

No floating gradients, AI effects, glowing dashboards, excessive parallax or generic startup motion.

---

## Desktop — editorial and cinematic

Desktop should feel spacious, architectural and almost exhibition-like.

### Hero
- Case image occupies 45–55% of the viewport.
- Headline appears in two beats: `Votre bilan de mobilité.` then `Dans une valise.`
- Very slow image reveal: opacity + 10–14 px vertical motion over 700–900 ms.
- Product caption appears after the headline, not simultaneously.
- Scroll cue is discreet and disappears once scrolling starts.

### Section transitions
Use large spatial transitions instead of card animations.

Recommended rhythm:
- section enters at 6–10% viewport visibility;
- title rises 12 px while fading;
- body follows 80–120 ms later;
- data or evidence appears last.

### Case sequence
Create a premium product reveal:
- closed Case;
- subtle zoom into equipment;
- 6 sensor labels appear one by one;
- transition to simplified body silhouette showing measurement zones;
- transition to Pulse result screen.

This sequence should explain the product without requiring a paragraph.

### Method
Each domain should have one visual behavior:
- Mobility: path / step progression;
- Performance: time / stride / repetition;
- Balance: center point stabilising;
- Muscle Control: bilateral activation traces;
- Posture: vertical reference line;
- Pulse Baseline: questions progressively collapsing into context.

### Score reveal
Do not animate a number from 0 to 78 like a fitness app.

Preferred sequence:
1. score container appears;
2. domain bars / values resolve;
3. overall score appears last;
4. priorities appear after a short pause.

This communicates that the score is derived from measurements rather than being the starting point.

---

## Mobile — native, tactile and sequential

Mobile is not a compressed desktop site.

The user should feel they are entering the future Pulse experience.

### Mobile homepage
Use a vertically staged journey:

1. Hero + Case image
2. `Commencer dans Pulse`
3. swipeable 4-domain strip
4. `Comment se passe mon bilan ?`
5. Motion / Clinical choice
6. Network

Avoid desktop-style four-column grids stacked vertically.

### Navigation
Bottom navigation is appropriate for Pulse, not the marketing site.

Marketing site mobile:
- compact top bar;
- one main CTA;
- sheet-style navigation.

Pulse mobile:
- Overview
- Results
- Trajectory
- Assessments
- Profile

### Touch interactions
- 44 px minimum targets;
- cards can expand into full-screen sheets;
- horizontal swipe only when it represents chronology or comparable domains;
- no hover-dependent information.

### Motion
Mobile transitions should be shorter than desktop:
- 220–350 ms micro-interactions;
- 400–550 ms page transitions;
- spring-like movement only for direct manipulation, never for medical results.

---

## Premium motion tokens

### Duration
- instant: 120 ms
- micro: 220 ms
- standard: 420 ms
- reveal: 720 ms
- cinematic: 1100 ms maximum

### Easing
Primary: cubic-bezier(.22, 1, .36, 1)

Avoid elastic or playful easing for clinical information.

### Distance
- micro: 4 px
- standard: 8–14 px
- cinematic: max 24 px

Large movement makes the interface feel theatrical instead of precise.

---

## Visual material to produce

Priority assets:
1. Case closed — clean studio / natural environment;
2. Case open — six sensors + tablets + tripod;
3. sensor placement on lower limbs;
4. gait sequence;
5. single-leg balance;
6. chair stand;
7. posture reference;
8. Pulse result screen;
9. 12-month trajectory screen.

The same asset library should power website, social, pitch decks and practitioner material.

---

## Performance rules

Premium cannot mean slow.

- prefer CSS transforms and opacity;
- use IntersectionObserver for reveals;
- use video only where it materially improves comprehension;
- preload only the hero visual;
- lazy-load non-critical media;
- always respect `prefers-reduced-motion`;
- target excellent mobile Core Web Vitals.

---

## Experience test

Every page must pass three questions:

1. Can the visitor understand the page in 10 seconds?
2. Does the motion make the product clearer?
3. Would the page still feel premium if all animations were disabled?

If question 3 is no, the design is relying on effects instead of design.
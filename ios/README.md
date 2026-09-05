# Pulse iOS — native foundation

This directory starts the native iOS client for KŌMØ Pulse.

## Product rule

Pulse iOS is **not** a WebView wrapper around `pulse.komolongevity.com`.

The iOS app must reuse the existing KOMO Pulse Supabase project as the source of truth for identity, permissions, assessments, scores, reports and wearable data. The web application remains a first-class client of the same backend.

## UX doctrine

The mobile interface is intentionally simpler than the web product. The permanent bottom navigation is frozen to exactly four destinations:

1. **Home** — Motion Today, the dominant daily score and the few metrics needed to understand it.
2. **Résultats** — longitudinal results, Motion Score, Motion Age and assessment detail.
3. **Plan** — the user's current movement plan and actionable priorities.
4. **KŌMØ World** — Arena, Daily Challenge, clubs, rankings, streaks, XP/level and K-points.

`MyKomo` is **not** a fifth tab. It is reached from the profile/avatar entry point in the top bar and contains account, privacy, connections and membership settings.

The interface should follow a score-first, data-dense, low-friction interaction model inspired by best-in-class wearable apps without visually cloning another product. Avoid secondary navigation, dashboard clutter and duplicated metrics.

## Initial native architecture

- SwiftUI application shell
- Supabase Swift SDK for Auth + PostgREST/RPC
- HealthKit read-only ingestion for the first release
- Existing Supabase RLS remains the authorization boundary
- Existing server-side score functions remain authoritative; the iPhone never becomes the source of truth for Motion Score
- Native notifications/widgets can be added after the core read/sync path is validated

## Existing backend surfaces to reuse

The current KOMO Pulse Supabase schema already exposes the principal entities needed by the app, including:

- `profiles`
- `pulse_assessments`
- `pulse_programs`
- `pulse_clinical_sessions`
- `pulse_measurement_sets`
- `pulse_score_runs`
- `assessments`, `measurements`, `scores`
- `wearable_devices`
- `wearable_measurements`
- `wearable_daily_metrics`
- `wearable_consents`

Existing RPCs include `komo_motion_today_v1`, `komo_result_snapshot`, `komo_report_snapshot`, `komo_walk_summary` and other product flows. Prefer these server contracts over duplicating business logic in Swift.

KŌMØ World should also reuse the existing engagement backend (`komo_challenges`, challenge completions, clubs, leaderboards, game scores, XP ledger and points ledger) rather than introducing a second identity or game database.

## HealthKit MVP

Start read-only. Candidate inputs already represented by the Pulse wearable schema:

- steps
- resting heart rate
- HRV (SDNN)
- sleep duration / sleep stages
- SpO2 when available
- walking/running distance
- activity minutes when derivable

HealthKit authorization must be requested per data type and only when useful. Do not request write access in the first release.

## Security / privacy

1. Never ship a Supabase `service_role`/secret key in the app.
2. Use only the project's publishable client key and let RLS enforce row access.
3. Keep client configuration in build settings / `.xcconfig`, not committed Swift source.
4. Health data is sensitive. HealthKit-derived data must not be repurposed for advertising or marketing.
5. The first HealthKit pipeline should require explicit in-app wearable consent before uploading derived daily metrics.
6. Clinical and patient data must continue to respect the backend's existing role and care-assignment boundaries.

## Native target included

- Product name: `Pulse`
- Bundle identifier: `com.komolongevity.pulse`
- UI: SwiftUI
- Minimum target: iOS 17+
- Package dependency: Supabase Swift `2.41.1` (pinned in `Pulse.xcodeproj`)
- Capabilities: HealthKit (read only initially)

`Pulse.xcodeproj` is now the single native target. It contains the HealthKit entitlement,
the Info.plist purpose text, the Supabase Swift package dependency, Debug/Release build
settings and a shared `Pulse` scheme. No web route or web deployment is owned by this target.

Required purpose string for the first HealthKit build:

- `NSHealthShareUsageDescription`: `KŌMØ Pulse reads selected activity, sleep and cardiovascular metrics to calculate and follow your daily movement profile.`

Do not add `NSHealthUpdateUsageDescription` until Pulse intentionally writes to Apple Health.

## Configuration

Create a local `Secrets.xcconfig` from `Config/Secrets.xcconfig.example`. It is included by both
Debug and Release settings and maps the values into Info.plist at build time.

Never commit production secret keys.

Only the Supabase publishable/anon client key belongs in this file. Never add a
`service_role` key to the iOS application.

### Supabase Auth redirect

Before testing sign-in, add this exact redirect URL in the Supabase project's Auth redirect URL
allow-list:

`com.komolongevity.pulse://auth/callback`

Pulse uses the existing account by email magic link with PKCE and does not create a separate iOS
identity. The app deliberately requests `shouldCreateUser: false`; a user must already have a
Pulse account or complete the approved web onboarding path first.

### First iPhone build

1. Open `ios/Pulse.xcodeproj` in Xcode 15.3+.
2. Copy `ios/Config/Secrets.xcconfig.example` to `ios/Config/Secrets.xcconfig` and supply the
   project URL and publishable key.
3. Select the `Pulse` scheme and a signed physical iPhone. HealthKit cannot be validated from a
   simulator with real user data.
4. In Signing & Capabilities, select the Apple Developer team that owns
   `com.komolongevity.pulse`. HealthKit is already declared in `Pulse.entitlements`.
5. Build and run. Sign in with an existing Pulse account, open the emailed magic link on that same
   iPhone, then connect Apple Santé from Home.

The first sync reads the preceding 29 metric days (not raw Health records), upserts normalized
daily totals through the existing wearable tables and refreshes `komo_motion_today_v1`. This gives
the backend enough history to build the existing 14-day minimum baseline when the selected Apple
Santé categories are available. Subsequent refreshes are idempotent for the same iPhone/day/source.

The GitHub workflow `Pulse iOS Build` builds the target for an iPhone Simulator on every push to
`feat/pulse-ios-foundation`; it validates compilation and package resolution without production
credentials or code signing.

## First implementation sequence

1. ✅ Create the Xcode app target and add the Supabase Swift package.
2. ✅ Wire `PulseConfiguration` and `PulseSupabase`.
3. ✅ Reuse the existing Pulse authentication session model through secure magic links.
4. ✅ Render native Home from `komo_motion_today_v1`.
5. ✅ Add read-only HealthKit permission and a 29-day normalized local read.
6. ✅ Persist normalized HealthKit daily totals through the existing RLS-protected wearable contract,
   after explicit in-app consent.
7. Build native Résultats and Plan on the existing Pulse server contracts.
8. Connect KŌMØ World to the existing challenge/club/leaderboard/XP/K-points backend.
9. Add APNs/notifications, widgets and background refresh after the core sync is validated on a
   signed iPhone.

## Current status

The iPhone foundation now has a concrete first-build path: Supabase session → Apple Santé consent
and read → wearable daily sync → server-owned Motion Today. Results, Plan and World remain native
shells only; no production web deployment is changed by this directory.

# Pulse iOS — native foundation

This directory contains the native iOS client for KŌMØ Pulse.

## Product rule

Pulse iOS is **not** a WebView wrapper around `pulse.komolongevity.com`.

The iOS app reuses the existing KOMO Pulse Supabase project as the source of truth for identity, permissions, assessments, scores, reports and wearable data. The web application remains a first-class client of the same backend.

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
5. The first HealthKit pipeline requires explicit in-app wearable consent before uploading derived daily metrics.
6. Clinical and patient data must continue to respect the backend's existing role and care-assignment boundaries.

## Native target included

- Product name: `Pulse`
- Bundle identifier: `com.komolongevity.pulse`
- UI: SwiftUI
- Minimum target: iOS 17+
- Package dependency: Supabase Swift `2.41.1` (pinned in `Pulse.xcodeproj`)
- Capabilities: HealthKit (read only initially)
- Current marketing version: `0.1.0`
- Current build number: `1`

`Pulse.xcodeproj` is the single native target. It contains the HealthKit entitlement, the Info.plist purpose text, the Supabase Swift package dependency, Debug/Release build settings and a shared `Pulse` scheme. No web route or web deployment is owned by this target.

Required purpose string for the first HealthKit build:

- `NSHealthShareUsageDescription`: `KŌMØ Pulse reads selected activity, sleep and cardiovascular metrics to calculate and follow your daily movement profile.`

Do not add `NSHealthUpdateUsageDescription` until Pulse intentionally writes to Apple Health.

## Configuration

KŌMØ Pulse production is now the default client environment in `Config/Base.xcconfig` so a clean checkout can build against the real backend. Only the public/publishable Supabase client key is present; no server secret belongs in the app.

`Secrets.xcconfig` remains an optional local override for another environment and stays gitignored.

### Supabase Auth redirect

Before testing sign-in, add this exact redirect URL in the Supabase project's Auth redirect URL allow-list:

`com.komolongevity.pulse://auth/callback`

Pulse uses the existing account by email magic link and does not create a separate iOS identity. The app deliberately requests `shouldCreateUser: false`; a user must already have a Pulse account or complete the approved web onboarding path first.

## Fastest path to see the app on a real iPhone

1. Open `ios/Pulse.xcodeproj` in a current Xcode version.
2. Sign in to Xcode with the Apple Developer account that will own KŌMØ Pulse.
3. Select the `Pulse` target → **Signing & Capabilities** → choose the correct Apple Developer team.
4. Keep **Automatically manage signing** enabled.
5. Confirm the bundle ID is exactly `com.komolongevity.pulse`.
6. Confirm the HealthKit capability is enabled for that App ID/profile. The entitlement is already in the project.
7. Connect a physical iPhone, select it as the run destination, and press Run.
8. Sign in with an existing Pulse account, open the Magic Link on that same iPhone, and return to Pulse.
9. From Home, connect Apple Santé and validate the first 29-day normalized read/sync.

A physical device is the meaningful HealthKit checkpoint. Simulator builds are useful for UI and compilation, but they do not validate the real personal HealthKit data path.

## Fastest path to TestFlight

Use TestFlight as the first real distribution target before the public App Store.

1. Join/confirm the Apple Developer Program account that will publish KŌMØ Pulse.
2. Register or let Xcode create the App ID `com.komolongevity.pulse`, with HealthKit enabled.
3. Create the KŌMØ Pulse app record in App Store Connect using that exact bundle ID.
4. Add the required App Store metadata progressively: app name, primary language, category, privacy policy URL and App Privacy declarations.
5. In Xcode, select **Any iOS Device (arm64)** / generic iOS device and choose **Product → Archive**.
6. In Organizer, validate the archive.
7. Choose **Distribute App → TestFlight & App Store** (or **TestFlight Internal Only** for the first team-only build).
8. Upload the archive to App Store Connect.
9. Once Apple finishes processing it, add internal testers in TestFlight.
10. Install the public **TestFlight** app from the App Store on the iPhone, accept the invitation, then install KŌMØ Pulse from TestFlight.

For the first internal TestFlight build, a public App Store release is not required. The PR remains in draft until the physical-device Auth + HealthKit + Motion Today path is validated.

## CI / archive checkpoint

The GitHub workflow `Pulse iOS Build` runs on every iOS change in `feat/pulse-ios-foundation` and now validates both development and distribution readiness without possessing Apple signing credentials:

- resolves Supabase Swift 2.41.1;
- validates the resolved production Supabase URL and native auth callback;
- builds Debug for an iPhone Simulator;
- creates an unsigned **Release `.xcarchive`** for a generic iPhone;
- verifies the archived app bundle identifier, display name and HealthKit usage description;
- uploads the build diagnostics and unsigned archive as short-lived CI artifacts.

The unsigned archive is intentionally not an installable/TestFlight build. Apple signing and App Store Connect upload remain tied to the Apple Developer account.

## First implementation sequence

1. ✅ Create the Xcode app target and add the Supabase Swift package.
2. ✅ Wire `PulseConfiguration` and `PulseSupabase`.
3. ✅ Reuse the existing Pulse authentication session model through secure Magic Links.
4. ✅ Render native Home from `komo_motion_today_v1`.
5. ✅ Add read-only HealthKit permission and a 29-day normalized local read.
6. ✅ Persist normalized HealthKit daily totals through the existing RLS-protected wearable contract after explicit in-app consent.
7. ✅ Validate Debug build + Release archive structure in CI.
8. ⏳ Validate signed physical-iPhone launch, Magic Link return and HealthKit sync.
9. ⏳ Upload first internal build to TestFlight.
10. Build native Résultats and Plan on the existing Pulse server contracts.
11. Connect KŌMØ World to the existing challenge/club/leaderboard/XP/K-points backend.
12. Add APNs/notifications, widgets and background refresh after the core sync is validated on a signed iPhone.

## Current status

The iPhone foundation now has a concrete distribution path: Supabase session → Apple Santé consent/read → wearable daily sync → server-owned Motion Today → Release archive → Apple signing → TestFlight.

Results, Plan and World remain native shells only. No production web deployment is changed by this directory.

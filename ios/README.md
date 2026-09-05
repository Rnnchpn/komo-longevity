# Pulse iOS — native foundation

This directory starts the native iOS client for KŌMØ Pulse.

## Product rule

Pulse iOS is **not** a WebView wrapper around `pulse.komolongevity.com`.

The iOS app must reuse the existing KOMO Pulse Supabase project as the source of truth for identity, permissions, assessments, scores, reports and wearable data. The web application remains a first-class client of the same backend.

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

## Suggested Xcode target

- Product name: `Pulse`
- Bundle identifier: `com.komolongevity.pulse`
- UI: SwiftUI
- Minimum target: iOS 17+
- Package dependency: `https://github.com/supabase/supabase-swift`
- Capabilities: HealthKit (read only initially)

Required purpose string for the first HealthKit build:

- `NSHealthShareUsageDescription`: `KŌMØ Pulse reads selected activity, sleep and cardiovascular metrics to calculate and follow your daily movement profile.`

Do not add `NSHealthUpdateUsageDescription` until Pulse intentionally writes to Apple Health.

## Configuration

Create a local `Secrets.xcconfig` from `Config/Secrets.xcconfig.example` and map the values into the app target's Info.plist/build settings.

Never commit production secret keys.

## First implementation sequence

1. Create the Xcode app target and add the Supabase Swift package.
2. Wire `PulseConfiguration` and `PulseSupabase`.
3. Reuse the existing Pulse authentication session model.
4. Render the native Home from `komo_motion_today_v1`.
5. Add HealthKit permission + local daily read.
6. Map the normalized HealthKit snapshot to `wearable_daily_metrics` through a controlled backend contract.
7. Add native Results, Plan and MyKomo tabs.
8. Add APNs/notifications, widgets and background refresh after core sync is validated.

## Current status

Foundation branch only. No production web deployment is changed by this directory.

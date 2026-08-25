# KŌMØ Pulse — Production infrastructure contract

Status: migration foundation for the standalone Pulse application.

## Principle

The standalone frontend must never create a second identity or data silo. The existing KŌMØ Pulse Supabase project remains the system of record. Vercel serves the interface. Supabase owns identity, data and transactional notification logic. Resend is the branded email delivery provider.

## Canonical services

- Pulse production origin: `https://pulse.komolongevity.com`
- Supabase project ref: `uqlolefsiktbznnymriy`
- Public website: `https://komolongevity.com`
- Frontend source: `Rnnchpn/komo-longevity`, branch/PR workflow
- Frontend hosting: Vercel
- Authentication + database: existing Supabase project
- Application notification backend: Supabase Edge Function `pulse-notify`
- Branded email delivery: Resend

## Identity continuity

Do not recreate users during migration.

The standalone frontend uses the existing `auth.users` identities and the existing `profiles` / `account_roles` records. The runtime compatibility layer recognizes the standard project-scoped Supabase persisted-session key and selects persistent storage when a pre-migration session is present on the final Pulse origin.

`Rester connecté` controls browser persistence for new sign-ins:

- checked → persistent browser storage;
- unchecked → session-only browser storage;
- passwords are never stored by Pulse.

## Supabase remains the system of record

Do not replace or duplicate the current schema. Existing RLS, RPCs, version registries, audit controls and clinical-data gates remain authoritative.

Core continuity includes identities, roles, profiles, programs, assessments, measurements, Myodev/MyoCare provenance, scores, clinical context, priorities, reports, trajectory, organizations, professional access, invitations, appointments, consents and audit events.

## Authentication email

Account confirmation, password recovery and other Supabase Auth emails are delivered through Supabase Auth. In production, Supabase Auth must use Resend custom SMTP instead of the default Supabase test mailer.

Required production URLs in Supabase Auth configuration:

- Site URL: `https://pulse.komolongevity.com`
- Allowed redirect: `https://pulse.komolongevity.com/`
- Allowed recovery redirect: `https://pulse.komolongevity.com/reset/`

Preview URLs may be temporarily allow-listed during QA, then removed.

### Resend SMTP values

Configure inside Supabase Auth without committing secrets:

- SMTP host: `smtp.resend.com`
- SMTP port: `465`
- SMTP username: `resend`
- SMTP password: a Resend API key / SMTP credential
- Sender: a verified KŌMØ sender on the configured Resend domain

## Application transactional email

Application notifications are owned by the authenticated Supabase Edge Function `pulse-notify`, not by the browser and not by Vercel. The function is deployed with JWT verification enabled and re-resolves the current Supabase user before sending.

Approved first templates preserve the established Pulse product plan:

1. `Welcome to KŌMØ`
2. `Confirm your account` — handled by Supabase Auth SMTP
3. `Your KŌMØ assessment is ready`
4. `Prepare for your upcoming KŌMØ assessment`
5. `You have been invited to KŌMØ Clinical`

Emails must not contain scores, medical conclusions, biological results, imaging results or other health data. They direct the user back to the secure Pulse environment.

### Supabase Edge Function secrets

Required in Supabase Function Secrets:

- `RESEND_API_KEY` — secret
- `PULSE_EMAIL_FROM` — verified sender

Recommended:

- `PULSE_EMAIL_REPLY_TO`
- `PULSE_APP_ORIGIN=https://pulse.komolongevity.com/`

Supabase automatically provides its own URL and anon key to Edge Functions. No Resend secret may appear in browser JavaScript or Git history.

The authenticated `pulse-notify` function accepts `{ "action": "health" }` to report readiness booleans without returning secret values.

## Recovery flow

The login screen routes password recovery to a dedicated Pulse recovery screen. The recovery link must return to `/reset/` on the production Pulse origin. The new password is applied to the existing Supabase identity with `auth.updateUser`; no new user is created.

## Release gate before domain cut-over

Do not point `pulse.komolongevity.com` to the standalone build until all are true:

- existing account can sign in;
- an existing persistent session survives the cut-over when still valid;
- unchecked `Rester connecté` ends browser persistence after the browser session;
- checked `Rester connecté` survives restart;
- account confirmation email succeeds through branded Resend SMTP;
- password recovery email succeeds and `/reset/` changes the existing password;
- authenticated `pulse-notify` health reports Resend ready;
- one authenticated test notification is delivered by `pulse-notify`;
- member role cannot access professional data;
- approved professional/admin role can enter Clinical;
- RLS and health-data gates remain active;
- preview remains noindex until production cut-over.

## Next product phase

Once this release gate is green, interface work proceeds page by page without changing the identity/data/email foundation:

1. Connexion
2. Accueil
3. Résultats
4. Parcours
5. Documents
6. Explorer
7. My KŌMØ / Profil
8. Clinical / Professional

Every page must read and write through the canonical Supabase model rather than local mock data.

# ELYSIUM Advertising & Broker Operations — V1

## Paid placements

1. **Yacht listing**: broker submits a yacht for sale or charter. It is not displayed until the broker and the listing are approved, and payment is confirmed with a future `paid_until`.
2. **Map Spotlight**: a clearly labelled *SPONSORISÉ* discovery bubble tied to a **destination-level advertising slot**, never a precise AIS position.
3. **Yachting Feature**: promoted broker listing in the member Yachting collection.
4. **Home Feature**: a discreet paid partner placement inside the authenticated ELYSIUM member entrance.

All placements are marked as sponsored and display the sponsor company. Targeting is destination-based (Monaco, Cannes, Saint-Tropez, entire Riviera); **no GPS or medical targeting**.

## Broker submission & moderation
- Sign in via existing Supabase account or email OTP (redirect returns to ELYSIUM Club).
- Create broker profile; ELYSIUM verifies identity and business.
- Upload listing text and permitted HTTPS image link; check ownership/mandate.
- Owner reviews via Broker Studio administration or Supabase.
- Paid listings and campaigns require owner confirmation that funds were **actually received** before activation.
- All other authenticated users are blocked from changing approval or payment fields by RLS and column grants.

## Commercial scope
- **The advertising inventory is technically present; commercial pricing is not approved.** Show "sur devis" rather than invent rates.
- Invoicing and payment confirmation are currently **manual**, not a functional online checkout.
- Before activating Stripe/online payments: agree listing rates, durations, VAT/invoicing entity, refund/cancellation policy, and legal review.
- Listings are made available to entitled ELYSIUM members, not a global public marketplace.
- Expired listings/campaigns automatically disappear via time-window conditions in RLS and the API.

## Editorial & safety
- Distinguish GPS (device consent only), AIS (timestamped), harbour sightings (coarse), and **sponsored destination markers** (advertising).
- Do not label a listed yacht as currently berthed solely because a broker advertises it in a destination.
- Approve authorised images only; enforce copyright, marketing permissions and rights to distribute yacht information.
- Medical service enquiries and member commercial targeting remain separate.
- Enforce advertising transparency and applicable consumer/platform rules before broader commercial rollout.

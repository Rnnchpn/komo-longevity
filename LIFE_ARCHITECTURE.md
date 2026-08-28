# KŌMØ Life — V1 architecture

## Role in the ecosystem

KŌMØ Life is the physical and cultural commerce layer of KŌMØ.

```text
KŌMØ
├── Pulse          measure / understand / follow
├── Library        learn
├── Clinical       professional pathway
├── Pro / Case     professional operations and measurement
└── Life           wear / use / select / belong
```

Public origin: `https://life.komolongevity.com/`
Alias: `https://shop.komolongevity.com/` → permanent redirect to Life.

Life must not be framed as a merchandise page. Collection 001 is the first commercial expression of a store designed to expand into KŌMØ Originals, KŌMØ Selected and KŌMØ Editions.

## V1 user experience

1. Editorial hero — Collection 001 / Longevity in Motion.
2. Brand manifesto — why Life exists.
3. Founding story — premium editorial positioning.
4. Collection 001 — filterable catalogue and quick view.
5. Persistent bag — local cart state, server-side checkout bridge.
6. KŌMØ Points — membership/access layer, not a second currency.
7. KŌMØ Selected — future curated marketplace architecture.
8. Journal — cultural/editorial layer.
9. Ecosystem bridge — KŌMØ main site, Pulse and Library.

## Commerce architecture

The browser never sends authoritative prices to the payment server.

```text
Life storefront
  ↓ sku / size / quantity only
/api/life-checkout
  ↓ server-side SKU allowlist
Stripe Price IDs held in environment variables
  ↓
Stripe Checkout
```

Required production environment variables:

- `STRIPE_SECRET_KEY`
- `LIFE_STRIPE_PRICE_VARSITY`
- `LIFE_STRIPE_PRICE_QZIP`
- `LIFE_STRIPE_PRICE_KNIT`
- `LIFE_STRIPE_PRICE_TEE`
- `LIFE_STRIPE_PRICE_HOODIE`
- `LIFE_STRIPE_PRICE_CAP`
- `LIFE_STRIPE_PRICE_TOTE`
- `LIFE_STRIPE_PRICE_SWEATSHIRT`

The checkout endpoint validates SKU, size and quantity on the server and only then asks Stripe to create a hosted checkout session.

## KŌMØ Points

V1 exposes the points experience and account bridge but intentionally does not assign cash value to points.

Final production rules still to decide:

- earn triggers;
- redemption rules, if any;
- early-access thresholds;
- member-only products;
- expiry policy;
- accounting treatment;
- fraud / reversal handling;
- data model in the shared KŌMØ identity layer.

Recommendation: points unlock access first; discounts remain secondary.

## Content architecture after Collection 001

### KŌMØ Originals
Products designed and owned by KŌMØ.

### KŌMØ Selected
A highly edited selection of third-party products. Every listing requires a visible editorial rationale: `Why KŌMØ selected it`.

Suggested categories:

- Move
- Recover
- Sleep
- Travel
- Read
- Live

### KŌMØ Editions
Limited collaborations with selected brands, places or creators.

## Design principles

- deep forest, bone, navy and warm paper;
- serif editorial typography + restrained sans-serif utility text;
- large spatial rhythm;
- no medical-software visual language;
- no generic AI gradients;
- no discount-led storefront hierarchy;
- mobile experience designed independently rather than collapsed desktop;
- reduced-motion support and keyboard-accessible overlays.

## Asset status

The V1 branch contains controlled vector product art so the storefront can render without broken media. The supplied campaign photography should replace the editorial placeholders once the final campaign image exports are committed to the repository in web-optimised formats.

Recommended production exports:

- hero: 2400×1600 WebP/AVIF;
- editorial library image: 1800×1800 WebP/AVIF;
- founding group image: 1800×1500 WebP/AVIF;
- product imagery: 1600×2000, front/back/detail, consistent background;
- social share: 1200×630.

## Deployment

The existing Vercel middleware routes `life.komolongevity.com` to the built `/life-v1/` bundle. The build pipeline copies `life-app/` into `site/life-v1/` and runs a dedicated Life QA script.

DNS still required before public launch:

- `life` → the same Vercel project as `komolongevity.com`;
- `shop` → the same Vercel project so middleware can permanently redirect it to Life.

## Launch gates

Do not call the store publicly open until all of the following are complete:

1. final product names and retail prices approved;
2. stock / size inventory confirmed;
3. product photography committed;
4. Stripe account and Price IDs connected;
5. VAT, shipping, returns and consumer terms approved;
6. privacy / analytics consent verified;
7. order confirmation and support workflow tested;
8. KŌMØ Points legal/accounting rules approved;
9. mobile purchase flow tested on iOS and Android;
10. production domain and social preview verified.

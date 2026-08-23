import { spawnSync } from 'node:child_process';

const scripts = [
  'scripts/build.mjs',
  'scripts/after-build.mjs',
  'scripts/mobile-nav-fix.mjs',
  'scripts/remove-masterclass-visual.mjs',
  'scripts/masterclass-review-optin.mjs',
  'scripts/seo-intent-articles.mjs',
  'scripts/media-seo.mjs',
  'scripts/library-intent-ui.mjs',
  'scripts/library-hero-fix.mjs',
  'scripts/seo-final-cluster.mjs',
  'scripts/library-i18n-v2.mjs',
  'scripts/seo-authority-cluster-v1.mjs',
  'scripts/media-webp.mjs',
  'scripts/homepage-v1.mjs',
  'scripts/homepage-case.mjs',
  'scripts/product-architecture-v2.mjs',
  'scripts/product-nav-sync-v2.mjs',
  'scripts/landing-mobile-v3.mjs',
  'scripts/network-v1.mjs',
  'scripts/network-mobile-fix.mjs',
  'scripts/network-nav-sync.mjs',
  'scripts/professional-case-v3.mjs',
  'scripts/professional-case-polish.mjs',
  'scripts/professional-case-fr-polish.mjs',
  'scripts/homepage-clarity-v4.mjs',
  'scripts/homepage-clarity-v4-polish.mjs',
  'scripts/homepage-seo-v6.mjs',
  'scripts/professional-pulse-v2.mjs',
  'scripts/pulse-professional-clarity-v1.mjs',
  'scripts/homepage-case-qa.mjs',
  'scripts/seo-growth-v1.mjs',
  'scripts/seo-subpages-v1.mjs',
  'scripts/fr-product-copy-polish-v2.mjs',
  'scripts/seo-growth-localize.mjs',
  'scripts/media-product-bridge-v1.mjs',
  'scripts/myocare-static-integration-v1.mjs',
  'scripts/static-architecture-polish-v1.mjs',
  'scripts/patient-vitrine-v1.mjs',
  'scripts/legal-hardening.mjs',
  'scripts/check-legal-links.mjs',
  'scripts/check-v2.mjs',
  'scripts/check-v2-legal-link.mjs',
  'scripts/check-seo-qa.mjs',
  'scripts/seo-sitemap-v2.mjs',
  'scripts/patient-vitrine-polish-v1.mjs',
  'scripts/homepage-minimal-patient-v1.mjs',
  'scripts/homepage-patient-final-v2.mjs',
  'scripts/homepage-care-modes-v1.mjs',
  'scripts/seo-growth-qa.mjs',
  'scripts/production-qa.mjs'
];

for (const script of scripts) {
  console.log(`[build-all] ${script}`);
  const run = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (run.status !== 0) process.exit(run.status ?? 1);
}

console.log('[build-all] production build complete.');
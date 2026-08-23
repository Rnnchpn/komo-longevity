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
  'scripts/media-webp.mjs',
  'scripts/homepage-v1.mjs',
  'scripts/homepage-case.mjs',
  'scripts/product-architecture-v2.mjs',
  'scripts/product-nav-sync-v2.mjs',
  'scripts/homepage-case-qa.mjs',
  'scripts/legal-hardening.mjs',
  'scripts/check-legal-links.mjs',
  'scripts/check-v2.mjs',
  'scripts/check-v2-legal-link.mjs',
  'scripts/check-seo-qa.mjs',
  'scripts/production-qa.mjs'
];

for (const script of scripts) {
  console.log(`[build-all] ${script}`);
  const run = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (run.status !== 0) process.exit(run.status ?? 1);
}

console.log('[build-all] production build complete.');
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
  'scripts/media-webp.mjs',
  'scripts/legal-hardening.mjs',
  'scripts/check-legal-links.mjs',
  'scripts/production-qa.mjs'
];

for (const script of scripts) {
  console.log(`[build-all] ${script}`);
  const run = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (run.status !== 0) process.exit(run.status ?? 1);
}

console.log('[build-all] production build complete.');

import { spawnSync } from 'node:child_process';

// KŌMØ World prototype branch only.
// This deliberately avoids the historical Pulse mutation/audit chain so the
// spatial prototype can be reviewed without changing or depending on the
// current production release pipeline.
const scripts = [
  'scripts/build.mjs',
  'scripts/komo-world-v0.mjs'
];

for (const script of scripts) {
  console.log(`[world-preview] ${script}`);
  const run = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (run.status !== 0) process.exit(run.status ?? 1);
}

console.log('[world-preview] KŌMØ World V0 build complete.');

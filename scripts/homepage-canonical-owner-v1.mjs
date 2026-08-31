import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');

const legacySteps = new Set([
  'homepage-v1.mjs',
  'homepage-case.mjs',
  'homepage-clarity-v4.mjs',
  'homepage-clarity-v4-polish.mjs',
  'homepage-seo-v6.mjs',
  'homepage-case-qa.mjs',
  'homepage-minimal-patient-v1.mjs',
  'homepage-patient-final-v2.mjs',
  'homepage-care-modes-v1.mjs',
  'homepage-hero-message-v1.mjs',
  'homepage-product-stepup-v1.mjs',
  'homepage-hero-image-v2.mjs',
  'homepage-whoop-product-v2.mjs',
  'homepage-whoop-stepup-v2.mjs',
  'homepage-whoop-polish-v3.mjs',
  'homepage-wow-v4.mjs',
  'homepage-brand-visual-v5.mjs'
]);

const pages = [
  join(site, 'index.html'),
  join(site, 'fr', 'index.html'),
  join(site, 'es', 'index.html')
];

const requiredMarkers = [
  'class="kwo-hero"',
  'id="case"',
  'id="measure"',
  'id="score"',
  'id="pulse"',
  'class="kw-pro-wow"',
  'class="kw-proof',
  'class="kw-final"'
];

function runLegacy(step) {
  if (!legacySteps.has(step)) {
    console.error(`[home-owner] REFUSED · unknown Home step ${step}`);
    process.exit(1);
  }
  const target = join(root, 'scripts', step);
  console.log(`[home-owner] legacy phase · ${step}`);
  const run = spawnSync(process.execPath, [target], { stdio: 'inherit' });
  if (run.status !== 0) process.exit(run.status ?? 1);
}

async function assertPipelineOwnership() {
  const buildAll = await readFile(join(root, 'scripts', 'build-all.mjs'), 'utf8');
  const directHomeEntries = [...buildAll.matchAll(/['"](scripts\/homepage-[^'"]+\.mjs)['"]/g)]
    .map((match) => match[1])
    .filter((path) => path !== 'scripts/homepage-canonical-owner-v1.mjs');
  if (directHomeEntries.length) {
    console.error(`[home-owner] FAIL · direct Home writers in build-all: ${directHomeEntries.join(', ')}`);
    process.exit(1);
  }
  const finalizeCount = (buildAll.match(/['"]home:finalize['"]/g) || []).length;
  if (finalizeCount !== 1) {
    console.error(`[home-owner] FAIL · expected exactly one home:finalize, found ${finalizeCount}`);
    process.exit(1);
  }
}

async function finalize() {
  await assertPipelineOwnership();

  for (const file of pages) {
    const html = await readFile(file, 'utf8');
    const missing = requiredMarkers.filter((marker) => !html.includes(marker));
    if (missing.length) {
      console.error(`[home-owner] FAIL · ${file} missing ${missing.join(', ')}`);
      process.exit(1);
    }

    const viewportCount = (html.match(/<meta\s+name=["']viewport["']/gi) || []).length;
    if (viewportCount !== 1) {
      console.error(`[home-owner] FAIL · ${file} has ${viewportCount} viewport metas`);
      process.exit(1);
    }

    const styleIds = [...html.matchAll(/<style\s+id=["']([^"']+)["']/gi)].map((match) => match[1]);
    const duplicateStyleIds = styleIds.filter((id, index) => styleIds.indexOf(id) !== index);
    if (duplicateStyleIds.length) {
      console.error(`[home-owner] FAIL · ${file} duplicate style ids: ${[...new Set(duplicateStyleIds)].join(', ')}`);
      process.exit(1);
    }

    const hasPhoneBreakpoint = html.includes('@media(max-width:620px)') || html.includes('@media (max-width: 620px)');
    const hasTabletBreakpoint = /@media[^\{]*(?:980|1024|1100|1180|1200|1280|1366)px/i.test(html);
    if (!hasPhoneBreakpoint || !hasTabletBreakpoint) {
      console.error(`[home-owner] FAIL · ${file} responsive contract incomplete`);
      process.exit(1);
    }

    console.log(`[home-owner] PASS · ${file} · ${html.length} bytes · ${styleIds.length} named style blocks`);
    console.log(`[home-owner] styles · ${styleIds.join(' | ')}`);
  }
}

const [command, value] = process.argv.slice(2);
if (command === 'legacy' && value) runLegacy(value);
else if (command === 'finalize') await finalize();
else {
  console.error('[home-owner] usage: homepage-canonical-owner-v1.mjs legacy <script> | finalize');
  process.exit(1);
}

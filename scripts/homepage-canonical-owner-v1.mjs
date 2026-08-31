import { readFile, writeFile } from 'node:fs/promises';
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

const deadStyleIds = [
  'homepage-seo-v6-style',
  'kmx-myocare-style',
  'homepage-minimal-patient-v1-style',
  'homepage-care-modes-v1-style',
  'method-science-v2-style',
  'homepage-product-stepup-v1-style'
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

async function finalize() {
  for (const file of pages) {
    let html = await readFile(file, 'utf8');

    for (const id of deadStyleIds) {
      const pattern = new RegExp(`<style\\s+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/style>`, 'gi');
      html = html.replace(pattern, '');
    }

    html = html.replace('<main class="kpf">', '<main class="komo-public-home">');
    if (!html.includes('id="homepage-canonical-root-style"')) {
      html = html.replace('</head>', '<style id="homepage-canonical-root-style">.komo-public-home{background:#f5f1e9;color:#151716}</style></head>');
    }

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

    if (!html.includes('@media(max-width:620px)') && !html.includes('@media (max-width: 620px)')) {
      console.error(`[home-owner] FAIL · ${file} has no canonical mobile breakpoint`);
      process.exit(1);
    }

    await writeFile(file, html, 'utf8');
    console.log(`[home-owner] finalized · ${file}`);
  }
}

const [command, value] = process.argv.slice(2);
if (command === 'legacy' && value) runLegacy(value);
else if (command === 'finalize') await finalize();
else {
  console.error('[home-owner] usage: homepage-canonical-owner-v1.mjs legacy <script> | finalize');
  process.exit(1);
}

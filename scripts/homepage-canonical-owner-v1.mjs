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

const provenDeadStyleIds = [
  'homepage-seo-v6-style',
  'kmx-myocare-style',
  'homepage-minimal-patient-v1-style',
  'homepage-care-modes-v1-style',
  'method-science-v2-style',
  'homepage-product-stepup-v1-style'
];

const absorbedStyleIds = [
  'homepage-patient-final-v2-style',
  'pulse-platform-bridge-style',
  'pulse-beta-release-v1-style',
  'komo-key-navigation-smooth'
];

const canonicalRootCss = `.kpf{background:#f5f1e9!important;color:#161b2a!important}`;

const canonicalDisclaimerCss = `.kb-disclaimer{padding:26px 0;border-top:1px solid rgba(255,255,255,.12)!important;background:#0b0c0b!important;color:#fff!important}.kb-disclaimer__inner{width:min(calc(100% - 40px),1160px);margin:auto;display:grid;grid-template-columns:.35fr 1fr;gap:24px}.kb-disclaimer strong{color:#ded0b9!important;font-size:9px;letter-spacing:.12em;text-transform:uppercase}.kb-disclaimer p{margin:0;color:rgba(255,255,255,.48)!important;font-size:11px;line-height:1.6}@media(max-width:760px){.kb-disclaimer__inner{width:min(calc(100% - 28px),1160px);grid-template-columns:1fr;gap:9px}}`;

const canonicalKeyHomeCss = `*{box-sizing:border-box}html{scroll-behavior:smooth;-webkit-tap-highlight-color:transparent}body{margin:0;background:#070808;color:#f4f1e9;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.home-key{margin:0;background:#0a0b0b;color:#fff;padding:70px 0}.home-key-inner{width:min(calc(100% - 48px),1360px);margin:auto;display:grid;grid-template-columns:1fr auto;gap:40px;align-items:end}.home-key p{margin:0 0 8px;color:#b8aa94;font-size:8px;font-weight:850;letter-spacing:.17em;text-transform:uppercase}.home-key h2{margin:0;max-width:800px;font-size:clamp(38px,5vw,68px);line-height:.94;letter-spacing:-.055em}.home-key h2 em{color:#91aa9f;font-style:normal}.home-key a{display:inline-flex;align-items:center;min-height:50px;padding:0 20px;border-radius:10px;background:#ded0b9;color:#090a0a!important;text-decoration:none;font-size:9px;font-weight:850;letter-spacing:.06em;text-transform:uppercase;transition:transform .18s ease,filter .18s ease}.home-key a:hover{transform:translateY(-1px);filter:brightness(1.03)}.home-key a:active{transform:none}@media(max-width:900px){.home-key-inner{grid-template-columns:1fr}}@media(max-width:600px){.home-key-inner{width:min(calc(100% - 28px),1360px)}}`;

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

function auditStyleUsage(html) {
  const markup = html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const markupClasses = new Set(
    [...markup.matchAll(/class=["']([^"']*)["']/gi)]
      .flatMap((match) => match[1].split(/\s+/).filter(Boolean))
  );
  const markupIds = new Set([...markup.matchAll(/id=["']([^"']+)["']/gi)].map((match) => match[1]));
  const layers = [];
  for (const match of html.matchAll(/<style\s+id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/style>/gi)) {
    const [, id, css] = match;
    const selectorClasses = new Set([...css.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
    const selectorIds = new Set([...css.matchAll(/#([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
    const matchedClasses = [...selectorClasses].filter((name) => markupClasses.has(name));
    const matchedIds = [...selectorIds].filter((name) => markupIds.has(name));
    layers.push({
      id,
      classTotal: selectorClasses.size,
      classUsed: matchedClasses.length,
      classes: matchedClasses,
      idTotal: selectorIds.size,
      idUsed: matchedIds.length,
      ids: matchedIds
    });
  }
  return layers;
}

function removeStyle(html, id) {
  const before = html;
  const next = html.replace(new RegExp(`<style\\s+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/style>`, 'gi'), '');
  if (before === next) {
    console.error(`[home-owner] FAIL · expected style ${id} was not present`);
    process.exit(1);
  }
  return next;
}

function appendCssToStyle(html, id, css) {
  const pattern = new RegExp(`(<style\\s+id=["']${id}["'][^>]*>)([\\s\\S]*?)(<\\/style>)`, 'i');
  if (!pattern.test(html)) {
    console.error(`[home-owner] FAIL · target style ${id} missing`);
    process.exit(1);
  }
  return html.replace(pattern, `$1$2${css}$3`);
}

function replaceStyleContent(html, id, css) {
  const pattern = new RegExp(`(<style\\s+id=["']${id}["'][^>]*>)[\\s\\S]*?(<\\/style>)`, 'i');
  if (!pattern.test(html)) {
    console.error(`[home-owner] FAIL · target style ${id} missing`);
    process.exit(1);
  }
  return html.replace(pattern, `$1${css}$2`);
}

function assertSafeAbsorption(layers) {
  const expected = new Map([
    ['homepage-patient-final-v2-style', ['kpf']],
    ['pulse-platform-bridge-style', ['kpf']],
    ['pulse-beta-release-v1-style', ['kb-disclaimer', 'kb-disclaimer__inner']],
    ['komo-key-navigation-smooth', ['home-key']]
  ]);
  for (const [id, expectedClasses] of expected) {
    const layer = layers.find((entry) => entry.id === id);
    if (!layer || layer.idUsed !== 0) {
      console.error(`[home-owner] FAIL · ${id} ownership changed; refusing absorption`);
      process.exit(1);
    }
    const actual = [...layer.classes].sort().join('|');
    const wanted = [...expectedClasses].sort().join('|');
    if (actual !== wanted) {
      console.error(`[home-owner] FAIL · ${id} now owns [${actual}] instead of [${wanted}]`);
      process.exit(1);
    }
  }
}

function consolidateStyles(html) {
  let next = html;
  next = appendCssToStyle(next, 'homepage-whoop-product-v2-style', canonicalRootCss);
  next = appendCssToStyle(next, 'homepage-whoop-polish-v3-style', canonicalDisclaimerCss);
  next = replaceStyleContent(next, 'komo-key-home-style', canonicalKeyHomeCss);
  for (const id of [...provenDeadStyleIds, ...absorbedStyleIds]) next = removeStyle(next, id);
  return next;
}

async function finalize() {
  await assertPipelineOwnership();

  for (const file of pages) {
    let html = await readFile(file, 'utf8');
    const beforeLayers = auditStyleUsage(html);

    if (file.endsWith('/fr/index.html')) {
      for (const id of provenDeadStyleIds) {
        const layer = beforeLayers.find((entry) => entry.id === id);
        if (!layer || layer.classUsed !== 0 || layer.idUsed !== 0) {
          console.error(`[home-owner] FAIL · ${id} is no longer safely dead; refusing removal`);
          process.exit(1);
        }
      }
      assertSafeAbsorption(beforeLayers);
    }

    html = consolidateStyles(html);

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
    if (styleIds.length > 7) {
      console.error(`[home-owner] FAIL · ${file} has ${styleIds.length} named style layers; budget is 7`);
      process.exit(1);
    }

    for (const retired of [...provenDeadStyleIds, ...absorbedStyleIds]) {
      if (styleIds.includes(retired)) {
        console.error(`[home-owner] FAIL · retired style ${retired} survived finalization`);
        process.exit(1);
      }
    }

    const hasPhoneBreakpoint = html.includes('@media(max-width:620px)') || html.includes('@media (max-width: 620px)');
    const hasTabletBreakpoint = /@media[^\{]*(?:980|1024|1100|1180|1200|1280|1366)px/i.test(html);
    if (!hasPhoneBreakpoint || !hasTabletBreakpoint) {
      console.error(`[home-owner] FAIL · ${file} responsive contract incomplete`);
      process.exit(1);
    }

    await writeFile(file, html, 'utf8');
    console.log(`[home-owner] PASS · ${file} · ${html.length} bytes · ${styleIds.length} named style blocks`);
    if (file.endsWith('/fr/index.html')) {
      for (const layer of auditStyleUsage(html)) {
        const owned = layer.classes.length ? ` · used ${layer.classes.join(',')}` : '';
        console.log(`[home-owner] css-usage · ${layer.id} · classes ${layer.classUsed}/${layer.classTotal} · ids ${layer.idUsed}/${layer.idTotal}${owned}`);
      }
    }
  }
}

const [command, value] = process.argv.slice(2);
if (command === 'legacy' && value) runLegacy(value);
else if (command === 'finalize') await finalize();
else {
  console.error('[home-owner] usage: homepage-canonical-owner-v1.mjs legacy <script> | finalize');
  process.exit(1);
}

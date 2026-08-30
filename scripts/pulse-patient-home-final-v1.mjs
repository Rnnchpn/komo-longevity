import { access, copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'pulse-app', 'home-clarity-v1.js');
const stabilitySource = join(root, 'pulse-app', 'patient-home-stability-v1.js');
const targetDir = join(root, 'site', 'pulse-v12');
const target = join(targetDir, 'patient-home-final-v1.js');
const stabilityTarget = join(targetDir, 'patient-home-stability-v1.js');
const indexPath = join(targetDir, 'index.html');
const VERSION = '20260830-patient-home-final-v1-2';
const STABILITY_VERSION = '20260830-patient-home-stability-v1-1';
const HOME_DEPENDENCY_VERSION = '20260830-home-runtime-stability-v1';
const STABILITY_TAG = `<script defer src="./patient-home-stability-v1.js?v=${STABILITY_VERSION}"></script>`;
const TAG = `<script defer src="./patient-home-final-v1.js?v=${VERSION}"></script>`;

await access(source);
await access(stabilitySource);
await access(indexPath);
await Promise.all([
  copyFile(source, target),
  copyFile(stabilitySource, stabilityTarget)
]);

let html = await readFile(indexPath, 'utf8');

// Clean-room Home ownership. These files are historical Home renderers/decorators only.
// Keeping them loaded causes delayed timers, body-wide MutationObservers, mobile retries
// and topbar animations to continue after the definitive Home has rendered.
const legacyHomeScripts = [
  'my-komo-home-v1.js',
  'patient-home-command-v1.js',
  'patient-home-visual-v2.js',
  'patient-home-micro-motion-v1.js',
  'pulse-home-hero-polish-v2.js',
  'my-komo-dashboard-v2.js',
  'my-komo-key-home-v1.js',
  'my-komo-score-motion-v1.js',
  'home-key-position-v1.js'
];

for (const legacy of legacyHomeScripts) {
  const escaped = legacy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`\\s*<script[^>]+src="\\.\\/${escaped}(?:\\?[^\"]*)?"[^>]*><\\/script>`, 'g'), '');
}

// These modules remain useful outside Home, but their route guards were tightened in
// the Home stability release. Their historical URLs are immutable for one year, so a
// new query token is mandatory or returning devices can keep executing the old code.
const stabilizedDependencies = [
  'patient-canonical-results.js',
  'locomotor-age-ui-v01.js',
  'my-komo-wallet-home-v2.js'
];
for (const asset of stabilizedDependencies) {
  const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`(\\.\\/${escaped})\\?v=[^\"]+`, 'g'), `$1?v=${HOME_DEPENDENCY_VERSION}`);
}

html = html.replace(/\s*<script(?:\s+defer)?\s+src="\.\/patient-home-stability-v1\.js(?:\?[^\"]*)?"><\/script>/g, '');
html = html.replace(/\s*<script(?:\s+defer)?\s+src="\.\/patient-home-final-v1\.js(?:\?[^\"]*)?"><\/script>/g, '');
html = html.replace('</body>', `  ${STABILITY_TAG}\n  ${TAG}\n</body>`);
await writeFile(indexPath, html, 'utf8');

const [checkHtml, checkJs, checkStability] = await Promise.all([
  readFile(indexPath, 'utf8'),
  readFile(target, 'utf8'),
  readFile(stabilityTarget, 'utf8')
]);

if (!checkHtml.includes(TAG)) throw new Error('[pulse-patient-home-final] final Home runtime not injected');
if (!checkHtml.includes(STABILITY_TAG)) throw new Error('[pulse-patient-home-final] stability runtime not injected');
for (const legacy of legacyHomeScripts) {
  if (checkHtml.includes(legacy)) throw new Error(`[pulse-patient-home-final] legacy Home runtime still present: ${legacy}`);
}
for (const asset of stabilizedDependencies) {
  const expected = `./${asset}?v=${HOME_DEPENDENCY_VERSION}`;
  if (!checkHtml.includes(expected)) throw new Error(`[pulse-patient-home-final] stabilized dependency not cache-busted: ${asset}`);
}
if (!checkJs.includes("patient-home-final-v1.0.0")) throw new Error('[pulse-patient-home-final] unexpected Home runtime source');
if (!checkJs.includes('MOTION AGE') || !checkJs.includes('MOTION SCORE')) throw new Error('[pulse-patient-home-final] core hierarchy missing');
if (!checkJs.toLocaleLowerCase('fr').includes('aucune valeur n’est inventée')) throw new Error('[pulse-patient-home-final] missing-data safeguard missing');
if (!checkStability.includes("VERSION = '1.1.0'")) throw new Error('[pulse-patient-home-final] stability runtime invalid');
if (!checkStability.includes('data-adaptive-shell="phone"')) throw new Error('[pulse-patient-home-final] phone canvas override missing');

const scripts = [...checkHtml.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);
const lastScript = scripts.at(-1) || '';
const penultimateScript = scripts.at(-2) || '';
if (!lastScript.startsWith('./patient-home-final-v1.js')) {
  throw new Error(`[pulse-patient-home-final] Home runtime must load last, got ${lastScript || 'none'}`);
}
if (!penultimateScript.startsWith('./patient-home-stability-v1.js')) {
  throw new Error(`[pulse-patient-home-final] stability runtime must load immediately before final Home, got ${penultimateScript || 'none'}`);
}

console.log(`[pulse-patient-home-final] PASS · clean-room Home · ${legacyHomeScripts.length} legacy runtimes removed · 3 stabilized dependencies cache-busted · desktop + phone canvas isolated · Motion Age → Motion Score → dimensions → priority → trajectory → assessment/report`);
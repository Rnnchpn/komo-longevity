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
const VERSION = '20260830-patient-home-final-v1-1';
const STABILITY_VERSION = '20260830-patient-home-stability-v1';
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

// Remove the two historical Home owners. They both re-render after route/data events
// and one also watches #viewRoot, which can re-insert the old dashboard after the
// definitive Home has already rendered. Other route-specific modules remain intact.
for (const legacy of ['my-komo-home-v1.js', 'patient-home-command-v1.js']) {
  const escaped = legacy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`\\s*<script[^>]+src="\\.\\/${escaped}(?:\\?[^\"]*)?"[^>]*><\\/script>`, 'g'), '');
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
if (checkHtml.includes('my-komo-home-v1.js')) throw new Error('[pulse-patient-home-final] legacy My KŌMØ Home owner still present');
if (checkHtml.includes('patient-home-command-v1.js')) throw new Error('[pulse-patient-home-final] legacy command Home owner still present');
if (!checkJs.includes("patient-home-final-v1.0.0")) throw new Error('[pulse-patient-home-final] unexpected Home runtime source');
if (!checkJs.includes('MOTION AGE') || !checkJs.includes('MOTION SCORE')) throw new Error('[pulse-patient-home-final] core hierarchy missing');
if (!checkJs.toLocaleLowerCase('fr').includes('aucune valeur n’est inventée')) throw new Error('[pulse-patient-home-final] missing-data safeguard missing');
if (!checkStability.includes('KomoPatientHomeStability')) throw new Error('[pulse-patient-home-final] stability runtime invalid');

const scripts = [...checkHtml.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);
const lastScript = scripts.at(-1) || '';
const penultimateScript = scripts.at(-2) || '';
if (!lastScript.startsWith('./patient-home-final-v1.js')) {
  throw new Error(`[pulse-patient-home-final] Home runtime must load last, got ${lastScript || 'none'}`);
}
if (!penultimateScript.startsWith('./patient-home-stability-v1.js')) {
  throw new Error(`[pulse-patient-home-final] stability runtime must load immediately before final Home, got ${penultimateScript || 'none'}`);
}

console.log('[pulse-patient-home-final] PASS · single Home owner · legacy renderers removed · Motion Age → Motion Score → dimensions → priority → trajectory → assessment/report');

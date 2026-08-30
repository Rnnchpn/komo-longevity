import { access, copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'pulse-app', 'home-clarity-v1.js');
const targetDir = join(root, 'site', 'pulse-v12');
const target = join(targetDir, 'patient-home-final-v1.js');
const indexPath = join(targetDir, 'index.html');
const VERSION = '20260830-patient-home-final-v1';
const TAG = `<script defer src="./patient-home-final-v1.js?v=${VERSION}"></script>`;

await access(source);
await access(indexPath);
await copyFile(source, target);

let html = await readFile(indexPath, 'utf8');

// Final ownership is installed after every legacy Pulse polish/build stage.
// Keep the historical home modules available for other routes, but ensure this
// renderer is the last Home owner loaded in production.
html = html.replace(/\s*<script(?:\s+defer)?\s+src="\.\/patient-home-final-v1\.js(?:\?[^\"]*)?"><\/script>/g, '');
html = html.replace('</body>', `  ${TAG}\n</body>`);
await writeFile(indexPath, html, 'utf8');

const [checkHtml, checkJs] = await Promise.all([
  readFile(indexPath, 'utf8'),
  readFile(target, 'utf8')
]);

if (!checkHtml.includes(TAG)) throw new Error('[pulse-patient-home-final] final Home runtime not injected');
if (!checkJs.includes("patient-home-final-v1.0.0")) throw new Error('[pulse-patient-home-final] unexpected Home runtime source');
if (!checkJs.includes('MOTION AGE') || !checkJs.includes('MOTION SCORE')) throw new Error('[pulse-patient-home-final] core hierarchy missing');
if (!checkJs.includes('Aucune valeur n’est inventée')) throw new Error('[pulse-patient-home-final] missing-data safeguard missing');

const lastScript = [...checkHtml.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)].at(-1)?.[1] || '';
if (!lastScript.startsWith('./patient-home-final-v1.js')) {
  throw new Error(`[pulse-patient-home-final] Home runtime must load last, got ${lastScript || 'none'}`);
}

console.log('[pulse-patient-home-final] PASS · Motion Age → Motion Score → dimensions → priority → trajectory → assessment/report');

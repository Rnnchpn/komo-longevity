import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'pulse-app');
const target = join(root, 'site', 'pulse-v12');

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

const indexPath=join(target,'index.html');
let html=await readFile(indexPath,'utf8');
html=html.replace(/\s*<script type="module" src="\.\/first-test-entry-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace('</body>','  <script type="module" src="./first-test-entry-v1.js?v=20260828-first-test-1"></script>\n</body>');
await writeFile(indexPath,html,'utf8');

console.log('[pulse-v12] standalone app copied to /pulse-v12/ with first-test onboarding');

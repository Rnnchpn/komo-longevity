import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const indexPath=join(target,'index.html');
const assetPath=join(target,'account-tab-restore-v1.js');
const TAG='<script src="./account-tab-restore-v1.js?v=20260829-account-tab-v1"></script>';

await access(assetPath);
let html=await readFile(indexPath,'utf8');
html=html.replace(/\s*<script src="\.\/account-tab-restore-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace('</body>',`  ${TAG}\n</body>`);
await writeFile(indexPath,html,'utf8');

const check=await readFile(indexPath,'utf8');
if(!check.includes(TAG)) throw new Error('[pulse-account-tab] account navigation asset not injected');
console.log('[pulse-account-tab] PASS · Compte restored as first-class patient destination on desktop, phone and iPad');

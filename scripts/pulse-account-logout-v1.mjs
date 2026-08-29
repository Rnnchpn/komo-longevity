import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const path=join(root,'site','pulse-v12','index.html');
let html=await readFile(path,'utf8');
html=html.replace(/\s*<script src="\.\/account-logout-visible-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace('</body>','  <script src="./account-logout-visible-v1.js?v=20260829-account-logout-v1"></script>\n</body>');
if(!html.includes('account-logout-visible-v1.js'))throw new Error('[pulse-account-logout] injection failed');
await writeFile(path,html,'utf8');
console.log('[pulse-account-logout] PASS · visible Se déconnecter button restored in Compte & paramètres');

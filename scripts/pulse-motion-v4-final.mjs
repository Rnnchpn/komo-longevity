import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const indexPath=join(root,'site','pulse-v12','index.html');
const RELEASE='20260901-motion-v4-final';
let html=await readFile(indexPath,'utf8');

html=html
  .replace(/\s*<script type="module" src="\.\/motion-hub-v3\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script type="module" src="\.\/motion-hub-v4\.js(?:\?[^\"]*)?"><\/script>/g,'');

html=html.replace('</body>',`  <script type="module" src="./motion-hub-v4.js?v=${RELEASE}"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

const v3=(html.match(/motion-hub-v3\.js/g)||[]).length;
const v4=(html.match(/motion-hub-v4\.js/g)||[]).length;
if(v3!==0)throw new Error(`Motion V3 runtime still present (${v3})`);
if(v4!==1)throw new Error(`Expected one Motion V4 runtime owner, found ${v4}`);
if(!html.includes('motion-route-guard-v4.js'))throw new Error('Motion route guard v4 missing');

console.log('[pulse-motion-v4-final] canonical Motion interpretation hub active · legacy Motion hub removed from runtime');
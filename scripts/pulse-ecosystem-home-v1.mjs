import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd(),file=join(root,'site/pulse-v12/index.html');
let html=await readFile(file,'utf8');
html=html.replace(/\s*<script type="module" src="\.\/pulse-ecosystem-home-v1\.js[^"]*"><\/script>/g,'');
html=html.replace('</body>','  <script type="module" src="./pulse-ecosystem-home-v1.js?v=20261002-os-v1"></script>\n</body>');
await writeFile(file,html,'utf8');
console.log('[pulse-ecosystem-home-v1] connected patient health home injected');

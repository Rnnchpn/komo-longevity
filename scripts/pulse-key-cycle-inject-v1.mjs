import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const file=join(process.cwd(),'site','pulse-v12','index.html');
let html=await readFile(file,'utf8');
html=html.replace(/\s*<script type="module" src="\.\/wearable-cycle-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace('</body>','  <script type="module" src="./wearable-cycle-v1.js?v=20260829-day-night-v1"></script>\n</body>');
await writeFile(file,html,'utf8');
console.log('[pulse-key-cycle-inject-v1] loaded KŌMØ KEY day/night/trajectory layer');
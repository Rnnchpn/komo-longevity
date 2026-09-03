import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const file=join(process.cwd(),'site','pulse-v12','index.html');
let html=await readFile(file,'utf8');
html=html.replace(/\s*<script type="module" src="\.\/wearable-cycle-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/wearable-poc-mode-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script src="\.\/key-results-grid-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace('</body>','  <script type="module" src="./wearable-cycle-v1.js?v=20260829-day-night-v1"></script>\n  <script type="module" src="./wearable-poc-mode-v1.js?v=20260829-poc-mode-v1"></script>\n  <script src="./key-results-grid-v1.js?v=20260829-results-v1"></script>\n</body>');
await writeFile(file,html,'utf8');
console.log('[pulse-key-cycle-inject-v1] loaded KŌMØ KEY day/night/trajectory, wear-mode and results grid layers');
await import('./pulse-motion-result-domains-v1.mjs');
for(const root of ['pulse-app',join('site','pulse-v12')]){
  const payloadPath=join(root,'report-payload-v1.js');
  let payload=await readFile(payloadPath,'utf8');
  payload=payload.replace("(payload?.function?.tests||[]).filter(x=>x.available).length<7","(payload?.function?.tests||[]).filter(x=>x.available).length<3");
  if(payload.includes("(payload?.function?.tests||[]).filter(x=>x.available).length<7"))throw new Error('[pulse-key-cycle-inject-v1] stale seven-test validator remains');
  await writeFile(payloadPath,payload,'utf8');
}
console.log('[pulse-key-cycle-inject-v1] three-test functional validation aligned');

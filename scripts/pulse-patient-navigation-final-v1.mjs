import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulseDir=join(root,'site','pulse-v12');
const indexPath=join(pulseDir,'index.html');
let html=await readFile(indexPath,'utf8');
const release=(html.match(/<meta name="komo-pulse-release" content="([^"]+)"/)||[])[1]||'20260828-canonical-4p8';

html=html
  .replace(/\s*<script src="\.\/pulse-bottom-nav-v5\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script src="\.\/pulse-bottom-nav-v6\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script src="\.\/patient-palette-balance-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');

html=html.replace('</body>',`  <script src="./patient-palette-balance-v1.js?v=${release}"></script>\n  <script src="./pulse-bottom-nav-v6.js?v=${release}"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

// Enforce canonical route ownership after every other Pulse post-build has finished.
await import('./pulse-route-ownership-fix-v2.mjs');

const finalHtml=await readFile(indexPath,'utf8');
const finalApp=await readFile(join(pulseDir,'app.js'),'utf8');
const finalBooking=await readFile(join(pulseDir,'booking-layer-v1.js'),'utf8');
const checks=[
  ['dock v6 shipped',finalHtml.includes('pulse-bottom-nav-v6.js')],
  ['dock v5 removed',!finalHtml.includes('pulse-bottom-nav-v5.js')],
  ['neutral patient palette shipped',finalHtml.includes('patient-palette-balance-v1.js')],
  ['Motion route accepted by app core',finalApp.includes("'motion','mykomo','trajectory'")],
  ['modern routes delegated to dedicated owners',finalApp.includes("source:'app-external-owner'")],
  ['Agenda follows visible patient mode',finalBooking.includes("#modeSwitch [data-mode=\"member\"]")]
];
for(const [label,ok] of checks) console.log(`[pulse-nav-final] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-nav-final] Motion · Trajectoire · Agenda ownership locked · ${release}`);

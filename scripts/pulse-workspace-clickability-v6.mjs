import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const file=join(root,'site','pulse-v12','patient-navigation-core-v1.js');
const code=await readFile(file,'utf8');

const checks=[
  ['global viewRoot pointer lock is absent', !code.includes('html.kp-route-changing #viewRoot{pointer-events:none}')],
  ['work routes have a dedicated navigation branch', code.includes('if(!patientRoute(next)){')],
  ['work navigation sets work mode directly', code.includes("document.documentElement.dataset.kpNavMode='work'")],
  ['work navigation clears stale route lock', code.includes("document.documentElement.classList.remove('kp-route-changing')")],
  ['setMode clears stale route lock for Admin and Clinical', code.includes("if(m==='work')document.documentElement.classList.remove('kp-route-changing')")],
  ['patient navigation still uses canonical patient mode', code.includes("document.documentElement.dataset.kpNavMode='patient'")]
];

let failed=false;
for(const [label,ok] of checks){
  console.log(`[pulse-workspace-click-v6] ${ok?'OK':'FAIL'} · ${label}`);
  if(!ok)failed=true;
}
if(failed)throw new Error('Pulse workspace clickability contract failed');
console.log(`[pulse-workspace-click-v6] PASS · ${checks.length}/${checks.length} work-surface clickability assertions`);

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const path=join(root,'site','pulse-v12','myocare-import.js');
const js=await readFile(path,'utf8');

const checks=[
  ["current Myodev contract",js.includes("const CONTRACT='myodev-contract-v0.3';")],
  ["current Motion protocol",js.includes("const PROTOCOL='motion-clinical-v0.6';")],
  ["definitive workbook sheet",js.includes('04_MYODEV_IMPORT')],
  ["multi-session provenance",js.includes('sourceSessionCount')&&js.includes('sourceSessionIds')],
  ["sensor-only score policy",js.includes("scorePolicy:'sensor_only_v0.6'")&&js.includes('questionnaireContribution:0')],
  ["v0.6 score RPC",js.includes("rpc('calculate_motion_v06'")],
  ["legacy protocol removed",!js.includes("motion-v0.5.1")&&!js.includes("const PROTOCOL='motion-v0.5';")]
];
const failed=checks.filter(([,ok])=>!ok).map(([label])=>label);
if(failed.length)throw new Error(`[pulse-myocare-contract-alignment-v1] failed: ${failed.join(', ')}`);

console.log(`[pulse-myocare-contract-alignment-v1] PASS · ${checks.length} checks · Myodev v0.3 → Motion sensor v0.6`);
await import('./pulse-club-connections-qa-v1.mjs');

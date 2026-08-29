import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const file=join(process.cwd(),'site','pulse-v12','index.html');
let html=await readFile(file,'utf8');
const legacy=['wearable-followup-v2.js','wearable-cycle-v1.js','wearable-poc-mode-v1.js','key-results-grid-v1.js'];
for(const name of legacy){
  const escaped=name.replaceAll('.','\\.');
  html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${escaped}(?:\\?[^\\"]*)?"><\\/script>`,'g'),'');
}
await writeFile(file,html,'utf8');
const final=await readFile(file,'utf8');
for(const name of legacy)if(final.includes(name))throw new Error(`[pulse-key-cycle] legacy runtime still loaded: ${name}`);
console.log('[pulse-key-cycle] legacy wearable presentation runtimes retired · dedicated KŌMØ KEY hub owns patient follow-up');

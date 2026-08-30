import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const path=join(root,'site','pulse-v12','myocare-import.js');
let js=await readFile(path,'utf8');

const old="const PROTOCOL='motion-v0.5.1';";
const next="const PROTOCOL='motion-v0.5';";

if(js.includes(old)) js=js.replace(old,next);
if(!js.includes(next)) throw new Error('[pulse-myocare-contract-alignment-v1] canonical Motion protocol constant not found');
if(js.includes(old)) throw new Error('[pulse-myocare-contract-alignment-v1] stale motion-v0.5.1 provenance remains');

await writeFile(path,js,'utf8');
console.log('[pulse-myocare-contract-alignment-v1] PASS · MyoCare metrics are stamped motion-v0.5, matching the assessment protocol registry');

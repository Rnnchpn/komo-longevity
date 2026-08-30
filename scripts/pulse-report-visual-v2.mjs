import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const RELEASE='20260830-report-visual-v2';

async function patch(name,replacements){
  const path=join(target,name);
  let html=await readFile(path,'utf8');
  for(const [re,value] of replacements) html=html.replace(re,value);
  await writeFile(path,html,'utf8');
}

await patch('index.html',[
  [/report-bootstrap-v1\.js\?v=[^\"]+/g,`report-bootstrap-v1.js?v=${RELEASE}`]
]);

await patch('dossier.html',[
  [/dossier-pdf-export-v2\.js\?v=[^\"]+/g,`dossier-pdf-export-v2.js?v=${RELEASE}`]
]);

console.log(`[pulse-report-visual-v2] editorial Mobility Report pinned · ${RELEASE}`);

// Final RC1 functional guard and smoke checks. This must stay last in the Pulse build.
await import('./pulse-functional-rc1.mjs');
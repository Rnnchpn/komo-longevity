import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const RELEASE='20260830-report-single-owner-v4';

async function patch(name,replacements){
  const path=join(target,name);
  let html=await readFile(path,'utf8');
  for(const [re,value] of replacements) html=html.replace(re,value);
  await writeFile(path,html,'utf8');
}

const legacyPatientPdf=[
  [/\s*<script[^>]+src="\.\/canonical-report-export-v2\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/\s*<script[^>]+src="\.\/canonical-report-export\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/\s*<script[^>]+src="\.\/score-report-pdf-v1\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'']
];

const legacyDossierPdf=[
  [/\s*<script[^>]+src="\.\/canonical-report-export-v2\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/\s*<script[^>]+src="\.\/canonical-report-export\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/\s*<script[^>]+src="\.\/dossier-export-bridge\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/\s*<script[^>]+src="\.\/dossier-pdf-export\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/\s*<script[^>]+src="\.\/score-report-pdf-v1\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'']
];

await patch('index.html',[
  ...legacyPatientPdf,
  [/report-bootstrap-v1\.js\?v=[^\"]+/g,`report-bootstrap-v1.js?v=${RELEASE}`]
]);

await patch('dossier.html',[
  ...legacyDossierPdf,
  [/dossier-pdf-export-v2\.js\?v=[^\"]+/g,`dossier-pdf-export-v2.js?v=${RELEASE}`]
]);

const index=await readFile(join(target,'index.html'),'utf8');
const dossier=await readFile(join(target,'dossier.html'),'utf8');

for(const name of ['canonical-report-export-v2.js','canonical-report-export.js','score-report-pdf-v1.js']){
  if(index.includes(name)) throw new Error(`[pulse-report] legacy patient PDF owner still present: ${name}`);
}
for(const name of ['canonical-report-export-v2.js','canonical-report-export.js','dossier-export-bridge.js','dossier-pdf-export.js','score-report-pdf-v1.js']){
  if(dossier.includes(name)) throw new Error(`[pulse-report] legacy dossier PDF owner still present: ${name}`);
}
if(!index.includes(`report-bootstrap-v1.js?v=${RELEASE}`)) throw new Error('[pulse-report] patient report bootstrap missing');
if(!dossier.includes(`dossier-pdf-export-v2.js?v=${RELEASE}`)) throw new Error('[pulse-report] professional report owner missing');

console.log(`[pulse-report-visual-v2] PASS · single PDF owner enforced · ${RELEASE}`);

// Run Home ownership hardening after every report and late Pulse visual stage.
await import('./pulse-home-owner-v3.mjs');

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const RELEASE='20260830-report-export-hardfix-v6';

async function patch(name,replacements){
  const path=join(target,name);
  let text=await readFile(path,'utf8');
  for(const [re,value] of replacements) text=text.replace(re,value);
  await writeFile(path,text,'utf8');
}

// Patient surface: always load the current Mobility Report renderer.
await patch('index.html',[
  [/report-bootstrap-v1\.js\?v=[^\"]+/g,`report-bootstrap-v1.js?v=${RELEASE}`]
]);
await patch('report-bootstrap-v1.js',[
  [/mobility-report-pdf-v1\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v2.js?v=${RELEASE}`]
]);

// Professional dossier: remove every legacy owner of #pdfBtn.
await patch('dossier.html',[
  [/\s*<script[^>]+src="\.\/(?:canonical-report-export-v2|canonical-report-export|dossier-export-bridge)\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/dossier-page\.js\?v=[^\"]+/g,`dossier-page.js?v=${RELEASE}`],
  [/dossier-pdf-export-v2\.js\?v=[^\"]+/g,`dossier-pdf-export-v2.js?v=${RELEASE}`]
]);

// Remove the historical browser-print fallback from the generated dossier runtime.
await patch('dossier-page.js',[
  [/\s*document\.querySelector\('#pdfBtn'\)\?\.addEventListener\('click',\(\)=>window\.print\(\)\);?/g,"\n  // PDF export is exclusively owned by dossier-pdf-export-v2 / report-delivery."
  ]
]);

// Keep versioning, clinical release and email workflow, but force the current renderer.
await patch('report-delivery-v1.js',[
  [/mobility-report-pdf-v1\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v2.js?v=${RELEASE}`]
]);
await patch('dossier-pdf-export-v2.js',[
  [/report-delivery-v1\.js(?:\?v=[^'\"]+)?/g,`report-delivery-v1.js?v=${RELEASE}`]
]);

// Build-time regression guard: production must have one PDF owner and the v2 renderer.
const dossier=await readFile(join(target,'dossier.html'),'utf8');
const dossierPage=await readFile(join(target,'dossier-page.js'),'utf8');
const delivery=await readFile(join(target,'report-delivery-v1.js'),'utf8');
const renderer=await readFile(join(target,'mobility-report-pdf-v2.js'),'utf8');
if(/dossier-export-bridge|canonical-report-export(?:-v2)?/.test(dossier)){
  throw new Error('[pulse-report-visual-v2] legacy PDF interceptor still present in dossier.html');
}
if(/#pdfBtn[\s\S]{0,180}window\.print|window\.print\(\)/.test(dossierPage)){
  throw new Error('[pulse-report-visual-v2] legacy window.print PDF fallback still present');
}
if(!delivery.includes(`mobility-report-pdf-v2.js?v=${RELEASE}`)){
  throw new Error('[pulse-report-visual-v2] delivery workflow is not wired to Mobility Report v2');
}
if(!renderer.includes('Votre identité')||!renderer.includes('KOMO_Mobility_Report_')){
  throw new Error('[pulse-report-visual-v2] Mobility Report v2 renderer integrity check failed');
}

console.log(`[pulse-report-visual-v2] PASS · one PDF owner · v2 renderer · no print fallback · ${RELEASE}`);

// Align generated MyoCare provenance with the registered Motion protocol before final QA.
await import('./pulse-myocare-contract-alignment-v1.mjs');

// Final RC1 functional guard and smoke checks. This must stay last in the Pulse build.
await import('./pulse-functional-rc1.mjs');
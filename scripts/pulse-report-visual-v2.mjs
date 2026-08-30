import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const RELEASE='20260830-report-export-hardfix-v8';

async function patch(name,replacements){
  const path=join(target,name);
  let text=await readFile(path,'utf8');
  for(const [re,value] of replacements) text=text.replace(re,value);
  await writeFile(path,text,'utf8');
}

// Patient side: all PDF entry points now resolve to the same Mobility Report v2.
await patch('index.html',[
  [/canonical-report-export-v2\.js\?v=[^\"]+/g,`canonical-report-export-v3.js?v=${RELEASE}`],
  [/report-bootstrap-v1\.js\?v=[^\"]+/g,`report-bootstrap-v1.js?v=${RELEASE}`]
]);
await patch('report-bootstrap-v1.js',[
  [/report-patient-ui-v1\.js(?:\?v=[^'\"]+)?/g,`report-patient-ui-v1.js?v=${RELEASE}`],
  [/mobility-report-pdf-v1\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v2.js?v=${RELEASE}`]
]);
await patch('report-patient-ui-v1.js',[
  [/mobility-report-pdf-v1\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v2.js?v=${RELEASE}`]
]);
await patch('canonical-report-export-v3.js',[
  [/mobility-report-pdf-v2\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v2.js?v=${RELEASE}`]
]);

// Professional dossier: one owner only. Remove every historical interceptor.
await patch('dossier.html',[
  [/\s*<script[^>]+src="\.\/(?:canonical-report-export-v2|canonical-report-export|dossier-export-bridge)\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/dossier-page\.js\?v=[^\"]+/g,`dossier-page.js?v=${RELEASE}`],
  [/dossier-pdf-export-v2\.js\?v=[^\"]+/g,`dossier-pdf-export-v2.js?v=${RELEASE}`]
]);

// Remove the old browser-print fallback without swallowing the following handlers.
await patch('dossier-page.js',[
  [/\s*document\.querySelector\('#pdfBtn'\)\?\.addEventListener\('click',\(\)=>window\.print\(\)\);?/g,"\n  // PDF export is exclusively owned by KŌMØ Report Delivery v2.\n  "
  ]
]);

// Force the dossier entrypoint and delivery runtime to Mobility Report v2.
await patch('dossier-pdf-export-v2.js',[
  [/report-delivery-v[12]\.js(?:\?v=[^'\"]+)?/g,`report-delivery-v2.js?v=${RELEASE}`]
]);
await patch('report-delivery-v2.js',[
  [/mobility-report-pdf-v2\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v2.js?v=${RELEASE}`]
]);

// Build-time regression guards. Old report engines cannot return silently.
const index=await readFile(join(target,'index.html'),'utf8');
const patientUi=await readFile(join(target,'report-patient-ui-v1.js'),'utf8');
const canonical=await readFile(join(target,'canonical-report-export-v3.js'),'utf8');
const dossier=await readFile(join(target,'dossier.html'),'utf8');
const dossierPage=await readFile(join(target,'dossier-page.js'),'utf8');
const entry=await readFile(join(target,'dossier-pdf-export-v2.js'),'utf8');
const delivery=await readFile(join(target,'report-delivery-v2.js'),'utf8');
const renderer=await readFile(join(target,'mobility-report-pdf-v2.js'),'utf8');
if(index.includes('canonical-report-export-v2.js'))throw new Error('[pulse-report-visual-v2] patient legacy canonical PDF exporter still loaded');
if(!index.includes(`canonical-report-export-v3.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] patient v3 PDF exporter not loaded');
if(!patientUi.includes(`mobility-report-pdf-v2.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] official patient report card still uses old renderer');
if(!canonical.includes(`mobility-report-pdf-v2.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] canonical patient export still uses old renderer');
if(/dossier-export-bridge|canonical-report-export(?:-v2)?/.test(dossier))throw new Error('[pulse-report-visual-v2] legacy PDF interceptor still present in dossier.html');
if(/#pdfBtn[\s\S]{0,180}window\.print|window\.print\(\)/.test(dossierPage))throw new Error('[pulse-report-visual-v2] legacy window.print PDF fallback still present');
if(!dossierPage.includes("document.querySelector('#reviewBtn')"))throw new Error('[pulse-report-visual-v2] dossier action handlers were damaged while removing print fallback');
if(!entry.includes(`report-delivery-v2.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] dossier entrypoint is not wired to Report Delivery v2');
if(!delivery.includes(`mobility-report-pdf-v2.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] Report Delivery v2 is not wired to Mobility Report v2');
if(!renderer.includes('Votre identité')||!renderer.includes('KOMO_Mobility_Report_'))throw new Error('[pulse-report-visual-v2] Mobility Report v2 renderer integrity check failed');

console.log(`[pulse-report-visual-v2] PASS · every patient + professional PDF route → Mobility Report v2 · ${RELEASE}`);

// Align generated MyoCare provenance with the registered Motion protocol before final QA.
await import('./pulse-myocare-contract-alignment-v1.mjs');

// Final RC1 functional guard and smoke checks. This must stay last in the Pulse build.
await import('./pulse-functional-rc1.mjs');
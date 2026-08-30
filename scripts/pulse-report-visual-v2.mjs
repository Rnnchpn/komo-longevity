import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const RELEASE='20260830-report-luxury-full-v9';
const RENDERER='mobility-report-pdf-v3.js';

async function patch(name,replacements){
  const path=join(target,name);
  let text=await readFile(path,'utf8');
  for(const [re,value] of replacements) text=text.replace(re,value);
  await writeFile(path,text,'utf8');
}

// Patient side: every export surface points to the same complete 10-page renderer.
await patch('index.html',[
  [/canonical-report-export-v2\.js\?v=[^\"]+/g,`canonical-report-export-v3.js?v=${RELEASE}`],
  [/canonical-report-export-v3\.js\?v=[^\"]+/g,`canonical-report-export-v3.js?v=${RELEASE}`],
  [/report-bootstrap-v1\.js\?v=[^\"]+/g,`report-bootstrap-v1.js?v=${RELEASE}`]
]);
await patch('report-bootstrap-v1.js',[
  [/report-patient-ui-v1\.js(?:\?v=[^'\"]+)?/g,`report-patient-ui-v1.js?v=${RELEASE}`],
  [/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`${RENDERER}?v=${RELEASE}`]
]);
await patch('report-patient-ui-v1.js',[
  [/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`${RENDERER}?v=${RELEASE}`]
]);
await patch('canonical-report-export-v3.js',[
  [/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`${RENDERER}?v=${RELEASE}`]
]);

// Professional dossier: remove every historical PDF interceptor.
await patch('dossier.html',[
  [/\s*<script[^>]+src="\.\/(?:canonical-report-export-v2|canonical-report-export|dossier-export-bridge)\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/dossier-page\.js\?v=[^\"]+/g,`dossier-page.js?v=${RELEASE}`],
  [/dossier-pdf-export-v2\.js\?v=[^\"]+/g,`dossier-pdf-export-v2.js?v=${RELEASE}`]
]);

// Remove browser print fallback while preserving the other dossier actions.
await patch('dossier-page.js',[
  [/\s*document\.querySelector\('#pdfBtn'\)\?\.addEventListener\('click',\(\)=>window\.print\(\)\);?/g,"\n  // PDF export is exclusively owned by KŌMØ Report Delivery v2.\n  "]
]);

// Dossier delivery/versioning/email workflow also uses the complete renderer.
await patch('dossier-pdf-export-v2.js',[
  [/report-delivery-v[12]\.js(?:\?v=[^'\"]+)?/g,`report-delivery-v2.js?v=${RELEASE}`]
]);
await patch('report-delivery-v2.js',[
  [/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`${RENDERER}?v=${RELEASE}`]
]);

// Regression guards: no route may silently fall back to the historical report.
const index=await readFile(join(target,'index.html'),'utf8');
const patientUi=await readFile(join(target,'report-patient-ui-v1.js'),'utf8');
const canonical=await readFile(join(target,'canonical-report-export-v3.js'),'utf8');
const dossier=await readFile(join(target,'dossier.html'),'utf8');
const dossierPage=await readFile(join(target,'dossier-page.js'),'utf8');
const entry=await readFile(join(target,'dossier-pdf-export-v2.js'),'utf8');
const delivery=await readFile(join(target,'report-delivery-v2.js'),'utf8');
const renderer=await readFile(join(target,RENDERER),'utf8');

if(index.includes('canonical-report-export-v2.js'))throw new Error('[pulse-report-visual-v2] legacy patient PDF exporter still loaded');
if(!index.includes(`canonical-report-export-v3.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] current patient exporter is not cache-busted');
if(!patientUi.includes(`${RENDERER}?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] official patient report card does not use full luxury renderer');
if(!canonical.includes(`${RENDERER}?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] canonical patient export does not use full luxury renderer');
if(/dossier-export-bridge|canonical-report-export(?:-v2)?/.test(dossier))throw new Error('[pulse-report-visual-v2] legacy PDF interceptor still present in dossier.html');
if(/window\.print\(\)/.test(dossierPage))throw new Error('[pulse-report-visual-v2] browser print fallback still present');
if(!dossierPage.includes("document.querySelector('#reviewBtn')"))throw new Error('[pulse-report-visual-v2] dossier action handlers were damaged');
if(!entry.includes(`report-delivery-v2.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] dossier entrypoint is not wired to Report Delivery v2');
if(!delivery.includes(`${RENDERER}?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] Report Delivery does not use full luxury renderer');
if(/createBaseReportPdf|mobility-report-pdf-v1\.js|mobility-report-pdf-v2\.js/.test(renderer))throw new Error('[pulse-report-visual-v2] full renderer still inherits from historical PDF');
for(const marker of ['Votre mobilité,','Votre identité locomotrice','Six dimensions, une lecture simple','Les chiffres qui comptent le plus','Votre signature musculaire','Votre mouvement, en situation','Votre capacité fonctionnelle','Trois leviers. Pas davantage','Votre trajectoire commence maintenant','Mesurer. Agir. Re-mesurer.']){
  if(!renderer.includes(marker))throw new Error(`[pulse-report-visual-v2] missing luxury page marker: ${marker}`);
}
if(!renderer.includes('KOMO_Mobility_Report_LUXURY_'))throw new Error('[pulse-report-visual-v2] luxury filename marker missing');

console.log(`[pulse-report-visual-v2] PASS · TRUE 10-page Luxury Report · patient + professional routes unified · ${RELEASE}`);

await import('./pulse-myocare-contract-alignment-v1.mjs');
await import('./pulse-functional-rc1.mjs');
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const RELEASE='20260903-motion-report-sensor-v5';

async function patch(name,replacements){
  const path=join(target,name);
  let text=await readFile(path,'utf8');
  for(const [re,value] of replacements)text=text.replace(re,value);
  await writeFile(path,text,'utf8');
}

// Patient side: every report entry point resolves to the same sensor-only Motion Report.
await patch('index.html',[
  [/canonical-report-export-v[23]\.js\?v=[^\"]+/g,`canonical-report-export-v3.js?v=${RELEASE}`],
  [/report-bootstrap-v1\.js\?v=[^\"]+/g,`report-bootstrap-v1.js?v=${RELEASE}`]
]);
await patch('report-bootstrap-v1.js',[
  [/report-patient-ui-v1\.js(?:\?v=[^'\"]+)?/g,`report-patient-ui-v1.js?v=${RELEASE}`],
  [/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v3.js?v=${RELEASE}`]
]);
await patch('report-patient-ui-v1.js',[[/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v3.js?v=${RELEASE}`]]);
await patch('canonical-report-export-v3.js',[[/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v3.js?v=${RELEASE}`]]);

// Professional dossier: one PDF owner only.
await patch('dossier.html',[
  [/\s*<script[^>]+src="\.\/(?:canonical-report-export-v2|canonical-report-export|dossier-export-bridge)\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/dossier-page\.js\?v=[^\"]+/g,`dossier-page.js?v=${RELEASE}`],
  [/dossier-pdf-export-v2\.js\?v=[^\"]+/g,`dossier-pdf-export-v2.js?v=${RELEASE}`]
]);
await patch('dossier-page.js',[[/\s*document\.querySelector\('#pdfBtn'\)\?\.addEventListener\('click',\(\)=>window\.print\(\)\);?/g,"\n  // PDF export is exclusively owned by KŌMØ Motion Report Delivery.\n  "]]);
await patch('dossier-pdf-export-v2.js',[[/report-delivery-v[12]\.js(?:\?v=[^'\"]+)?/g,`report-delivery-v2.js?v=${RELEASE}`]]);
await patch('report-delivery-v2.js',[[/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v3.js?v=${RELEASE}`]]);

// Build-time regression guards. Do not mutate the canonical renderer here.
const index=await readFile(join(target,'index.html'),'utf8');
const patientUi=await readFile(join(target,'report-patient-ui-v1.js'),'utf8');
const canonical=await readFile(join(target,'canonical-report-export-v3.js'),'utf8');
const payload=await readFile(join(target,'report-payload-v1.js'),'utf8');
const dossier=await readFile(join(target,'dossier.html'),'utf8');
const dossierPage=await readFile(join(target,'dossier-page.js'),'utf8');
const entry=await readFile(join(target,'dossier-pdf-export-v2.js'),'utf8');
const delivery=await readFile(join(target,'report-delivery-v2.js'),'utf8');
const renderer=await readFile(join(target,'mobility-report-pdf-v3.js'),'utf8');

const checks=[
  ['patient legacy canonical exporter retired',!index.includes('canonical-report-export-v2.js')],
  ['patient v3 exporter loaded',index.includes(`canonical-report-export-v3.js?v=${RELEASE}`)],
  ['patient card uses one Motion renderer',patientUi.includes(`mobility-report-pdf-v3.js?v=${RELEASE}`)],
  ['canonical export uses one Motion renderer',canonical.includes(`mobility-report-pdf-v3.js?v=${RELEASE}`)],
  ['new report schema required',payload.includes("SCHEMA_VERSION='komo-motion-report-payload-v2'")&&payload.includes("ALG='motion-sensor-index-v0.6.0'")],
  ['payload is sensor-only',payload.includes("scorePolicy:'sensor_only'")&&payload.includes('questionnaireContribution:0')],
  ['payload has no legacy manual metric extraction',!payload.includes("measurement(d,'M-FUN-03')")&&!payload.includes("measurement(d,'M-FUN-04')")&&!payload.includes("measurement(d,'M-POS-02')")],
  ['renderer is Motion Report v5',renderer.includes("VERSION='5.0.0-sensor'")&&renderer.includes("VISUAL_SYSTEM='komo-motion-report-2026'")],
  ['renderer is six-page sensor report',renderer.includes('PAGES=6')&&renderer.includes('// 3 — LSI')&&renderer.includes('// 4 — Activation')&&renderer.includes('// 5 — Gait and descriptive sensor data')],
  ['renderer explains score inputs',renderer.includes('LSI musculaires valides')&&renderer.includes('Questionnaires : 0 % du Motion Score')],
  ['renderer has no legacy manual test cards',!renderer.includes('Stand-Up Test')&&!renderer.includes('Two-Step Test')&&!renderer.includes('ESTIMATION FONCTIONNELLE')],
  ['renderer keeps resilient PDF engine',renderer.includes('cdn.jsdelivr.net/npm/jspdf@2.5.2')&&renderer.includes('cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2')&&renderer.includes('blob.size<12000')],
  ['dossier legacy interceptors retired',!/dossier-export-bridge|canonical-report-export(?:-v2)?/.test(dossier)],
  ['window.print fallback retired',!/\#pdfBtn[\s\S]{0,180}window\.print|window\.print\(\)/.test(dossierPage)],
  ['dossier actions preserved',dossierPage.includes("document.querySelector('#reviewBtn')")],
  ['dossier entry uses Report Delivery v2',entry.includes(`report-delivery-v2.js?v=${RELEASE}`)],
  ['professional delivery uses same Motion renderer',delivery.includes(`mobility-report-pdf-v3.js?v=${RELEASE}`)]
];
const failed=checks.filter(([,ok])=>!ok).map(([label])=>label);for(const[label,ok]of checks)console.log(`[pulse-report-visual-v2] ${ok?'OK':'FAIL'} · ${label}`);if(failed.length)throw new Error(`[pulse-report-visual-v2] failed: ${failed.join(', ')}`);

console.log(`[pulse-report-visual-v2] PASS · sensor-only six-page Motion Report · patient + professional routes unified · ${RELEASE}`);

await import('./pulse-myocare-contract-alignment-v1.mjs');
await import('./pulse-functional-rc1.mjs');
await import('./pulse-global-interaction-contract-v1.mjs');

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const RELEASE='20260903-motion-report-complete-v7';

async function patch(name,replacements){
  const path=join(target,name);
  let text=await readFile(path,'utf8');
  for(const [re,value] of replacements)text=text.replace(re,value);
  await writeFile(path,text,'utf8');
}

// Patient side: every report entry point resolves to the same complete Motion Report renderer.
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
  ['Motion report schema + sensor algorithm required',payload.includes("SCHEMA_VERSION='komo-motion-report-payload-v2'")&&payload.includes("ALG='motion-sensor-index-v0.6.0'")],
  ['payload remains sensor-only',payload.includes("scorePolicy:'sensor_only'")&&payload.includes('questionnaireContribution:0')&&payload.includes('functionalContribution:0')&&payload.includes('gaitContribution:0')&&payload.includes('postureContribution:0')],
  ['payload exposes functional context M-FUN-01 to M-FUN-07',payload.includes("['M-FUN-01','GLFS-25'")&&payload.includes("['M-FUN-07','Appui unipodal droit'")&&payload.includes('functional_context_incomplete')],
  ['payload exposes full gait family',payload.includes('scalarCountExpected:15')&&payload.includes("['step_count','Nombre de pas'")&&payload.includes("['step_length_m','Longueur de pas'")&&payload.includes('globalAsymmetry')&&payload.includes('variability')],
  ['payload exposes muscle QC and calibration',payload.includes('activationMean')&&payload.includes('coactivationMean')&&payload.includes('fatigabilityMean')&&payload.includes('suspectCount')&&payload.includes('calibrationCount')],
  ['payload carries full context and appendices',payload.includes('questionnaireResponses')&&payload.includes('sensorMetrics:rawSensor')&&payload.includes('measurements:rawMeasurements')&&payload.includes('completedQuestionnaireCount')],
  ['renderer is complete Motion Report v7',renderer.includes("VERSION='7.0.0-complete'")&&renderer.includes("VISUAL_SYSTEM='komo-motion-report-complete-2026'")],
  ['renderer includes requested core sections',renderer.includes('// 3 — Fonction')&&renderer.includes('// 4 — Marche')&&renderer.includes('// 5 — Posture')&&renderer.includes('// 6 — Muscle')&&renderer.includes('// 7 — Questionnaires')&&renderer.includes('// 8 — Agir')],
  ['renderer includes full technical appendices',renderer.includes('Données Myodev · détail complet')&&renderer.includes('Mesures cliniques · source')&&renderer.includes('Réponses questionnaires')&&renderer.includes('Provenance & validation')],
  ['renderer renders source + QC for functional tests',renderer.includes("['TEST','RÉSULTAT','SOURCE','QC','DATE']")&&renderer.includes('Non recueilli')],
  ['renderer renders muscle QC',renderer.includes('Activation moyenne')&&renderer.includes('Coactivation CCI')&&renderer.includes('Fatigabilité')&&renderer.includes('QC suspect')&&renderer.includes('QC invalide')&&renderer.includes('Calibration')],
  ['renderer explains score separation',renderer.includes('Le Motion Score v0.6 utilise uniquement les LSI musculaires valides')&&renderer.includes('leur contribution numérique au score est 0')],
  ['renderer keeps resilient PDF engine',renderer.includes('cdn.jsdelivr.net/npm/jspdf@2.5.2')&&renderer.includes('cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2')&&renderer.includes('blob.size<16000')],
  ['renderer uses dynamic total page count',renderer.includes('doc.getNumberOfPages()')&&renderer.includes('KŌMØ · ${p}/${total}')],
  ['dossier legacy interceptors retired',!/dossier-export-bridge|canonical-report-export(?:-v2)?/.test(dossier)],
  ['window.print fallback retired',!/\#pdfBtn[\s\S]{0,180}window\.print|window\.print\(\)/.test(dossierPage)],
  ['dossier actions preserved',dossierPage.includes("document.querySelector('#reviewBtn')")],
  ['dossier entry uses Report Delivery v2',entry.includes(`report-delivery-v2.js?v=${RELEASE}`)],
  ['professional delivery uses same Motion renderer',delivery.includes(`mobility-report-pdf-v3.js?v=${RELEASE}`)]
];
const failed=checks.filter(([,ok])=>!ok).map(([label])=>label);
for(const[label,ok]of checks)console.log(`[pulse-report-visual-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(failed.length)throw new Error(`[pulse-report-visual-v2] failed: ${failed.join(', ')}`);

console.log(`[pulse-report-visual-v2] PASS · complete Motion Report v7 · functional + gait + posture + muscle + questionnaires + full technical traceability · ${RELEASE}`);

await import('./pulse-myocare-contract-alignment-v1.mjs');
await import('./pulse-functional-rc1.mjs');
await import('./pulse-global-interaction-contract-v1.mjs');

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'pulse-app');
const built=join(root,'site','pulse-v12');

const canonicalSource=await readFile(join(source,'canonical-result-runtime.js'),'utf8');
const canonicalChecks=[
  ['canonical selector RPC',canonicalSource.includes("komo_motion_display_assessment")],
  ['exact episode hydration RPC',canonicalSource.includes("komo_result_assessment_detail")],
  ['published result wins for patient',canonicalSource.includes("motion.published?.assessmentId||motion.calculated?.assessmentId")],
  ['canonical runtime version 1.4',canonicalSource.includes("version:'1.4.0'")],
  ['sensor v0.6 invalidates canonical cache',canonicalSource.includes("komo:motion-v06-calculated")]
];
for(const [label,ok] of canonicalChecks){console.log(`[pulse-motion-result-v9] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Canonical Motion result contract failed');

await writeFile(join(built,'canonical-result-runtime.js'),canonicalSource,'utf8');

// Normalize the Admin validation selector to the current sensor score. This is
// a compatibility mutation only; it must never restore legacy v0.5 labels.
for(const dir of [source,built]){
  const path=join(dir,'admin-motion-validation-v1.js');
  let js=await readFile(path,'utf8');
  js=js.replace(".eq('algorithm_version','motion-functional-index-v0.5-poc')",".eq('algorithm_version','motion-sensor-index-v0.6.0')");
  js=js.replaceAll('Motion v0.5.1.1','Motion sensor v0.6');
  js=js.replaceAll('Motion v0.5.1','Motion sensor v0.6');
  js=js.replaceAll('Motion v0.5','Motion sensor v0.6');
  await writeFile(path,js,'utf8');
  const checks=[
    ['Admin no longer filters obsolete functional algorithm',!js.includes('motion-functional-index-v0.5-poc')],
    ['Admin selects sensor v0.6 score',js.includes("motion-sensor-index-v0.6.0")],
    ['Admin labels sensor v0.6',js.includes('Motion sensor v0.6')],
    ['Admin has no legacy Motion v0.5 label',!js.includes('Motion v0.5')]
  ];
  for(const [label,ok] of checks){console.log(`[pulse-motion-result-v9] ${ok?'OK':'FAIL'} · ${label} · ${dir.endsWith('pulse-app')?'source':'build'}`);if(!ok)process.exitCode=1}
}

const exporter=await readFile(join(built,'canonical-report-export-v3.js'),'utf8');
const pdf=await readFile(join(built,'mobility-report-pdf-v3.js'),'utf8');
const reportChecks=[
  ['PDF export uses canonical result',exporter.includes('loadCanonicalResult({force:true})')],
  ['PDF payload validated before generation',exporter.includes('validateReportPayload(payload)')],
  ['PDF download owner present',exporter.includes('downloadMobilityReport')],
  ['PDF engine has jsDelivr source',pdf.includes('cdn.jsdelivr.net/npm/jspdf@2.5.2')],
  ['PDF engine has CDNJS fallback',pdf.includes('cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2')],
  ['PDF blob minimum size guard retained',/blob\.size<\d{4,}/.test(pdf)]
];
for(const [label,ok] of reportChecks){console.log(`[pulse-motion-result-v9] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Motion sensor score/report integrity guard failed');

console.log('[pulse-motion-result-v9] PASS · canonical Motion selection, sensor v0.6 scoring and PDF generation contracts aligned');

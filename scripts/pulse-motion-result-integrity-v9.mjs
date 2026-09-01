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
  ['canonical runtime version 1.3',canonicalSource.includes("version:'1.3.0'")]
];
for(const [label,ok] of canonicalChecks){console.log(`[pulse-motion-result-v9] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Canonical Motion result contract failed');

// Keep the generated runtime byte-for-byte aligned with its source owner.
await writeFile(join(built,'canonical-result-runtime.js'),canonicalSource,'utf8');

for(const dir of [source,built]){
  const path=join(dir,'admin-motion-validation-v1.js');
  let js=await readFile(path,'utf8');
  js=js.replace(".eq('algorithm_version','motion-functional-index-v0.5-poc')",".eq('profile_code','motion_integrated')");
  js=js.replaceAll('Motion v0.5','Motion v0.5.1');
  js=js.replaceAll('épisode Motion v0.5','épisode Motion v0.5.1');
  await writeFile(path,js,'utf8');
  const checks=[
    ['Admin no longer filters obsolete v0.5 algorithm',!js.includes("motion-functional-index-v0.5-poc")],
    ['Admin uses stable Motion profile contract',js.includes(".eq('profile_code','motion_integrated')")],
    ['Admin labels current Motion v0.5.1',js.includes('Motion v0.5.1')]
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
  ['PDF blob minimum size guard retained',pdf.includes('blob.size<12000')]
];
for(const [label,ok] of reportChecks){console.log(`[pulse-motion-result-v9] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Motion score/report integrity guard failed');

console.log('[pulse-motion-result-v9] PASS · canonical Motion selection, v0.5.1 validation and PDF generation contracts aligned');

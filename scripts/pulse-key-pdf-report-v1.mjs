import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const release='20260829-key-pdf-report-v1';
const deliveryPath=join(pulse,'report-delivery-v1.js');
for(const file of ['key-report-snapshot-v1.js','mobility-report-key-v1.js']) await copyFile(join(root,'pulse-app',file),join(pulse,file));
let delivery=await readFile(deliveryPath,'utf8');
const oldPdfImport="import { mobilityReportBlob, downloadMobilityReport } from './mobility-report-pdf-v1.js';";
const newPdfImport="import { mobilityReportBlob, downloadMobilityReport } from './mobility-report-key-v1.js';";
if(delivery.includes(oldPdfImport))delivery=delivery.replace(oldPdfImport,newPdfImport);
if(!delivery.includes("from './key-report-snapshot-v1.js'"))delivery=delivery.replace("import { loadReportSnapshot, saveReport, notifyReport, clearReportSnapshot } from './report-runtime-v1.js';",`import { loadReportSnapshot, saveReport, notifyReport, clearReportSnapshot } from './report-runtime-v1.js';\nimport { loadKeyReportSnapshot } from './key-report-snapshot-v1.js';`);
const oldLive="async function livePayload(force=true){const id=patientId();if(!id)throw new Error('Patient non sélectionné.');const result=await loadCanonicalResult({patientId:id,force});const payload=buildReportPayload(result,{practitionerName:await practitioner(),centerName:result.dossier?.patient?.organization_name||'KŌMØ'});return{result,payload}}";
const newLive="async function livePayload(force=true){const id=patientId();if(!id)throw new Error('Patient non sélectionné.');const [result,practitionerName,key]=await Promise.all([loadCanonicalResult({patientId:id,force}),practitioner(),loadKeyReportSnapshot(id,{force})]);const payload=buildReportPayload(result,{practitionerName,centerName:result.dossier?.patient?.organization_name||'KŌMØ'});payload.key=key;return{result,payload}}";
if(delivery.includes(oldLive))delivery=delivery.replace(oldLive,newLive);
const oldMatch="function reportMatches(report,result){return !!(report?.status==='released'&&report?.payload&&report.assessmentId===result?.identity?.assessmentId&&report.scoreId===result?.identity?.scoreId)}";
const newMatch="function reportMatches(report,result){return !!(report?.status==='released'&&report?.payload?.key?.report_format==='mobility-report-key-v1'&&report.assessmentId===result?.identity?.assessmentId&&report.scoreId===result?.identity?.scoreId)}";
if(delivery.includes(oldMatch))delivery=delivery.replace(oldMatch,newMatch);
await writeFile(deliveryPath,delivery,'utf8');
const snap=await readFile(join(pulse,'key-report-snapshot-v1.js'),'utf8');
const pdf=await readFile(join(pulse,'mobility-report-key-v1.js'),'utf8');
const final=await readFile(deliveryPath,'utf8');
const checks=[
 ['official report uses KEY-aware PDF wrapper',final.includes("from './mobility-report-key-v1.js'")],
 ['official payload snapshots KEY before archive',final.includes('loadKeyReportSnapshot(id,{force})')&&final.includes('payload.key=key')],
 ['legacy official report is versioned once for KEY format',final.includes("report_format==='mobility-report-key-v1'")],
 ['snapshot uses consent-gated RPC',snap.includes("rpc('komo_key_report_snapshot'")],
 ['snapshot never exposes raw wearable payload',!snap.includes('raw_payload')&&!pdf.includes('raw_payload')],
 ['PDF contains weekly averages',pdf.includes('SEMAINE ANALYSÉE')&&pdf.includes('PAS / JOUR')&&pdf.includes('SOMMEIL / NUIT')],
 ['PDF compares week over week only when reliable',pdf.includes('comparison_reliable')&&pdf.includes('vs 7 j préc.')],
 ['PDF includes 14-day trend and 30-day context',pdf.includes('14 DERNIERS JOURS')&&pdf.includes('REPÈRE 30 J')],
 ['KEY remains outside Motion and Clinical score calculation',pdf.includes('sans recalculer leurs scores')&&snap.includes("clinical_score_effect:'none'")]
];
for(const [label,ok] of checks)console.log(`[pulse-key-pdf-report-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-key-pdf-report-v1] PASS · official report + KEY weekly longitudinal page · ${release}`);

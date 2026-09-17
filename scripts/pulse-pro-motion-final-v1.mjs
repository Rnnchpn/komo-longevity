import { readFile, writeFile } from 'node:fs/promises';

const root='site/pulse-v12/';
const reportPath=root+'canonical-report-export-v3.js';
const clinicalPath=root+'clinical-motion-v1.js';

let report=await readFile(reportPath,'utf8');
const reportOld=`function fallbackPractitioner(result){return String(result?.dossier?.clinical?.practitioner_name||result?.dossier?.practitioner?.display_name||'Professionnel KŌMØ')}
async function officialSnapshot(){try{const s=await loadReportSnapshot({force:true});return s?.status==='released'&&s?.payload?.schemaVersion===SCHEMA_VERSION?s:null}catch{return null}}
async function currentPayload(){const result=await loadCanonicalResult({force:true});const payload=buildReportPayload(result,{practitionerName:fallbackPractitioner(result),centerName:result?.dossier?.patient?.organization_name||'KŌMØ'});const check=validateReportPayload(payload);if(!check.ok)throw new Error(\`Rapport Motion incomplet : \${check.errors.join(', ')}\`);return payload}
export async function exportCanonicalMobilityReport({button=null}={}){if(busy)return;busy=true;const old=button?.textContent;try{if(button){button.disabled=true;button.textContent='Préparation du Motion Report…'}const snapshot=await officialSnapshot();if(snapshot){await downloadMobilityReport(snapshot.payload,{draft:false});toast(\`Motion Report officiel v\${snapshot.version} téléchargé.\`);return}const payload=await currentPayload();await downloadMobilityReport(payload,{draft:true});toast('Motion Report actualisé téléchargé en aperçu.')}catch(e){console.error('[canonical-report-export-v3]',e);toast(\`Export impossible : \${e?.message||e}\`);throw e}finally{busy=false;if(button){button.disabled=false;button.textContent=old||'Télécharger le Motion Report'}}}`;

const reportNew=`function fallbackPractitioner(result){return String(result?.dossier?.clinical?.practitioner_name||result?.dossier?.practitioner?.display_name||'Professionnel KŌMØ')}
function professionalPatientId(button){
  if(!button?.closest?.('[data-clinical-motion-v1]'))return null;
  const id=String(localStorage.getItem('komo_clinical_patient')||'').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)?id:null;
}
async function officialSnapshot(patientId=null){try{const s=await loadReportSnapshot({patientId,force:true});return s?.status==='released'&&s?.payload?.schemaVersion===SCHEMA_VERSION?s:null}catch{return null}}
async function currentPayload(patientId=null){const result=await loadCanonicalResult({patientId,force:true});const payload=buildReportPayload(result,{practitionerName:fallbackPractitioner(result),centerName:result?.dossier?.patient?.organization_name||'KŌMØ'});const check=validateReportPayload(payload);if(!check.ok)throw new Error(\`Rapport Motion incomplet : \${check.errors.join(', ')}\`);return payload}
export async function exportCanonicalMobilityReport({button=null,patientId=null}={}){if(busy)return;busy=true;const old=button?.textContent,targetPatientId=patientId||professionalPatientId(button);try{if(button){button.disabled=true;button.textContent='Préparation du Motion Report…'}const snapshot=await officialSnapshot(targetPatientId);if(snapshot){await downloadMobilityReport(snapshot.payload,{draft:false});toast(\`Motion Report officiel v\${snapshot.version} téléchargé.\`);return}const payload=await currentPayload(targetPatientId);await downloadMobilityReport(payload,{draft:true});toast(targetPatientId?'Motion Report du patient sélectionné téléchargé.':'Motion Report actualisé téléchargé en aperçu.')}catch(e){console.error('[canonical-report-export-v3]',e);toast(\`Export impossible : \${e?.message||e}\`);throw e}finally{busy=false;if(button){button.disabled=false;button.textContent=old||'Télécharger le Motion Report'}}}`;

if(!report.includes(reportOld))throw new Error('[pulse-pro-motion-final] report exporter anchor missing');
report=report.replace(reportOld,reportNew);
await writeFile(reportPath,report,'utf8');

let clinical=await readFile(clinicalPath,'utf8');
const clinicalOld=`<p>Le score synthétise uniquement la symétrie neuromusculaire issue des données Myodev validées.</p></div></article>`;
const clinicalNew=`<p>Le score synthétise uniquement la symétrie neuromusculaire issue des données Myodev validées.</p>\${s.motion_score!=null?'<div class="clm-actions"><button class="clm-btn primary" type="button" data-komo-export-report>Exporter le Motion Report PDF</button></div>':''}</div></article>`;
if(!clinical.includes(clinicalOld))throw new Error('[pulse-pro-motion-final] clinical score anchor missing');
clinical=clinical.replace(clinicalOld,clinicalNew);
await writeFile(clinicalPath,clinical,'utf8');

const finalReport=await readFile(reportPath,'utf8');
const finalClinical=await readFile(clinicalPath,'utf8');
const checks=[
  ['professional patient routing',finalReport.includes('professionalPatientId(button)')&&finalReport.includes('loadCanonicalResult({patientId,force:true})')],
  ['professional snapshot routing',finalReport.includes('loadReportSnapshot({patientId,force:true})')],
  ['professional PDF CTA',finalClinical.includes('Exporter le Motion Report PDF')&&finalClinical.includes('data-komo-export-report')]
];
for(const [label,ok] of checks)console.log(`[pulse-pro-motion-final] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-pro-motion-final] PASS · selected patient → Motion score → patient-scoped PDF export');

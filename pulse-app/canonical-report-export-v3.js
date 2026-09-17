import { loadCanonicalResult } from './canonical-result-runtime.js';
import { buildReportPayload, validateReportPayload, SCHEMA_VERSION } from './report-payload-v1.js';
import { downloadMobilityReport } from './mobility-report-pdf-v3.js?v=20260903-motion-report-final-v6';
import { loadReportSnapshot } from './report-runtime-v1.js';

const VERSION='4.1.0-final';
let busy=false;
function toast(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,5000)}
function fallbackPractitioner(result){return String(result?.dossier?.clinical?.practitioner_name||result?.dossier?.practitioner?.display_name||'Professionnel KŌMØ')}
async function officialSnapshot(){try{const s=await loadReportSnapshot({force:true});return s?.status==='released'&&s?.payload?.schemaVersion===SCHEMA_VERSION?s:null}catch{return null}}
async function currentPayload(){const result=await loadCanonicalResult({force:true});const payload=buildReportPayload(result,{practitionerName:fallbackPractitioner(result),centerName:result?.dossier?.patient?.organization_name||'KŌMØ'});const check=validateReportPayload(payload);if(!check.ok)throw new Error(`Rapport Motion incomplet : ${check.errors.join(', ')}`);return payload}
export async function exportCanonicalMobilityReport({button=null}={}){if(busy)return;busy=true;const old=button?.textContent;try{if(button){button.disabled=true;button.textContent='Préparation du Motion Report…'}const snapshot=await officialSnapshot();if(snapshot){await downloadMobilityReport(snapshot.payload,{draft:false});toast(`Motion Report officiel v${snapshot.version} téléchargé.`);return}const payload=await currentPayload();await downloadMobilityReport(payload,{draft:true});toast('Motion Report actualisé téléchargé en aperçu.')}catch(e){console.error('[canonical-report-export-v3]',e);toast(`Export impossible : ${e?.message||e}`);throw e}finally{busy=false;if(button){button.disabled=false;button.textContent=old||'Télécharger le Motion Report'}}}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-komo-export-report]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();exportCanonicalMobilityReport({button:b}).catch(()=>{})},true);
window.KomoCanonicalReport={version:VERSION,owner:'motion-report-final-v6',schema:SCHEMA_VERSION,export:exportCanonicalMobilityReport};

import { loadCanonicalResult } from './canonical-result-runtime.js';
import { buildReportPayload, validateReportPayload } from './report-payload-v1.js';
import { downloadMobilityReport } from './mobility-report-pdf-v2.js?v=20260830-report-export-hardfix-v8';
import { loadReportSnapshot } from './report-runtime-v1.js';

const VERSION='3.0.0';
let busy=false;
function toast(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,5000)}
function fallbackPractitioner(result){return String(result?.dossier?.clinical?.practitioner_name||result?.dossier?.practitioner?.display_name||'Professionnel KŌMØ')}
async function officialSnapshot(){try{const s=await loadReportSnapshot({force:true});return s?.status==='released'&&s?.payload?s:null}catch{return null}}
async function currentPayload(){const result=await loadCanonicalResult({force:true});const payload=buildReportPayload(result,{practitionerName:fallbackPractitioner(result),centerName:result?.dossier?.patient?.organization_name||'KŌMØ'});const check=validateReportPayload(payload);if(!check.ok)throw new Error(`Rapport incomplet : ${check.errors.join(', ')}`);return payload}

export async function exportCanonicalMobilityReport({button=null}={}){
  if(busy)return;busy=true;const old=button?.textContent;
  try{
    if(button){button.disabled=true;button.textContent='Préparation du Mobility Report…'}
    const snapshot=await officialSnapshot();
    if(snapshot){await downloadMobilityReport(snapshot.payload,{draft:false});toast(`Mobility Report officiel v${snapshot.version} téléchargé.`);return}
    const payload=await currentPayload();
    await downloadMobilityReport(payload,{draft:true});
    toast('Mobility Report actualisé téléchargé en aperçu.');
  }catch(e){console.error('[canonical-report-export-v3]',e);toast(`Export impossible : ${e?.message||e}`);throw e}
  finally{busy=false;if(button){button.disabled=false;button.textContent=old||'Télécharger le PDF'}}
}

document.addEventListener('click',e=>{const b=e.target.closest?.('[data-komo-export-report]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();exportCanonicalMobilityReport({button:b}).catch(()=>{})},true);
window.KomoCanonicalReport={version:VERSION,owner:'mobility-report-v2',export:exportCanonicalMobilityReport};
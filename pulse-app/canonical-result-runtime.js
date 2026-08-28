import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { interpretDossier } from './normative-engine-v1.js';
import { computeLocomotorAge } from './locomotor-age-v01.js';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
let client=null,latestResult=null;
const cache=new Map();

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(client||(client=createClient(SUPABASE_URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function keyFor(patientId){return patientId?`patient:${patientId}`:'self'}
async function resolveOwnPatientId(){
  const snap=await sb().rpc('komo_result_snapshot',{p_patient_id:null});
  if(snap.error)throw snap.error;
  const motion=snap.data?.motion||{};
  const assessmentId=motion.calculated?.assessmentId||motion.published?.assessmentId||motion.currentAssessmentId||null;
  if(assessmentId){
    const q=await sb().from('assessments').select('patient_id').eq('id',assessmentId).maybeSingle();
    if(q.error)throw q.error;
    if(q.data?.patient_id)return{patientId:q.data.patient_id,snapshot:snap.data};
  }
  const sess=await sb().auth.getSession();
  const uid=sess.data.session?.user?.id;
  if(!uid)throw new Error('Session Pulse expirée.');
  const p=await sb().from('patients').select('id').eq('patient_user_id',uid).order('updated_at',{ascending:false}).limit(1).maybeSingle();
  if(p.error)throw p.error;
  if(!p.data?.id)throw new Error('Aucun dossier patient lié à ce compte.');
  return{patientId:p.data.id,snapshot:snap.data};
}

export async function loadCanonicalResult({patientId=null,force=false}={}){
  const cacheKey=keyFor(patientId);
  if(!force&&cache.has(cacheKey))return cache.get(cacheKey);
  const promise=(async()=>{
    let resolvedPatientId=patientId,snapshot=null;
    if(!resolvedPatientId){const r=await resolveOwnPatientId();resolvedPatientId=r.patientId;snapshot=r.snapshot}
    else{const s=await sb().rpc('komo_result_snapshot',{p_patient_id:resolvedPatientId});if(!s.error)snapshot=s.data}
    const q=await sb().rpc('komo_professional_patient_dossier',{p_patient_id:resolvedPatientId});
    if(q.error)throw q.error;
    if(!q.data)throw new Error('Dossier résultat vide.');
    const dossier=q.data;
    const interpretation=interpretDossier(dossier);
    const locomotorAge=computeLocomotorAge(dossier,interpretation);
    const score=dossier.score||null;
    const identity={patientId:resolvedPatientId,assessmentId:dossier.motion?.id||null,scoreId:score?.id||null,algorithmVersion:score?.algorithm_version||null,engineVersion:interpretation.engineVersion,referenceVersion:interpretation.referenceVersion,locomotorAgeVersion:locomotorAge.version};
    const result={patientId:resolvedPatientId,snapshot,dossier,score,interpretation,locomotorAge,identity};
    latestResult=result;
    if(window.KomoCanonicalResultRuntime)window.KomoCanonicalResultRuntime.latest=result;
    window.dispatchEvent(new CustomEvent('komo:canonical-result-ready',{detail:{identity,carePlan:interpretation.carePlan,summary:interpretation.summary,consistencyIssues:interpretation.consistencyIssues,locomotorAge}}));
    return result;
  })();
  cache.set(cacheKey,promise);
  try{return await promise}catch(e){cache.delete(cacheKey);throw e}
}

export function clearCanonicalResult(patientId=null){if(patientId)cache.delete(keyFor(patientId));else cache.clear();if(!patientId){latestResult=null;if(window.KomoCanonicalResultRuntime)window.KomoCanonicalResultRuntime.latest=null}}
export function getCanonicalClient(){return sb()}
export function getLatestCanonicalResult(){return latestResult}

function invalidate(){clearCanonicalResult();window.dispatchEvent(new CustomEvent('komo:canonical-result-invalidated'))}
window.addEventListener('komo:motion-v05-release',invalidate);
window.addEventListener('komo:manual-motion-saved',invalidate);
window.addEventListener('komo:myocare-imported',invalidate);
window.KomoCanonicalResultRuntime={version:'1.2.0',load:loadCanonicalResult,clear:clearCanonicalResult,latest:null,getLatest:getLatestCanonicalResult};

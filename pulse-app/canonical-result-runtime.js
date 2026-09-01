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
async function patientIdForAssessment(assessmentId){
  if(!assessmentId)return null;
  const q=await sb().from('assessments').select('patient_id').eq('id',assessmentId).maybeSingle();
  if(q.error)throw q.error;
  return q.data?.patient_id||null;
}
async function resolveOwnTarget(){
  const snap=await sb().rpc('komo_result_snapshot',{p_patient_id:null});
  if(snap.error)throw snap.error;
  const motion=snap.data?.motion||{};

  // Patient-facing Motion keeps the last official result visible while a new
  // episode is being prepared. If there is no official publication yet, use
  // the latest scored episode so Pulse can show its validation state.
  let assessmentId=motion.published?.assessmentId||motion.calculated?.assessmentId||null;
  if(!assessmentId){
    const display=await sb().rpc('komo_motion_display_assessment',{p_patient_id:null});
    if(display.error)throw display.error;
    assessmentId=display.data?.assessmentId||null;
  }
  assessmentId=assessmentId||motion.currentAssessmentId||null;
  const linkedPatientId=await patientIdForAssessment(assessmentId);
  if(linkedPatientId)return{patientId:linkedPatientId,assessmentId,snapshot:snap.data};

  const sess=await sb().auth.getSession();
  const uid=sess.data.session?.user?.id;
  if(!uid)throw new Error('Session Pulse expirée.');
  const p=await sb().from('patients').select('id').eq('patient_user_id',uid).order('updated_at',{ascending:false}).limit(1).maybeSingle();
  if(p.error)throw p.error;
  if(!p.data?.id)throw new Error('Aucun dossier patient lié à ce compte.');
  return{patientId:p.data.id,assessmentId:null,snapshot:snap.data};
}
async function exactEpisode(dossier,assessmentId){
  if(!assessmentId||dossier?.motion?.id===assessmentId)return dossier;
  const d=await sb().rpc('komo_result_assessment_detail',{p_assessment_id:assessmentId});
  if(d.error)throw d.error;
  if(!d.data)return dossier;
  return{
    ...dossier,
    motion:d.data.motion??dossier.motion,
    score:d.data.score??null,
    questionnaires:d.data.questionnaires??[],
    measurements:d.data.measurements??[],
    myodev_metrics:d.data.myodev_metrics??[],
    myocare_imports:d.data.myocare_imports??[],
    availability:{...(dossier.availability||{}),motion:!!d.data.motion,score:!!d.data.score,questionnaire_detail:!!d.data.motion,clinical_measurements:!!d.data.motion,myodev_detail:!!d.data.motion}
  };
}

export async function loadCanonicalResult({patientId=null,force=false}={}){
  const cacheKey=keyFor(patientId);
  if(!force&&cache.has(cacheKey))return cache.get(cacheKey);
  const promise=(async()=>{
    let resolvedPatientId=patientId,snapshot=null,targetAssessmentId=null;
    if(!resolvedPatientId){const r=await resolveOwnTarget();resolvedPatientId=r.patientId;targetAssessmentId=r.assessmentId;snapshot=r.snapshot}
    else{const s=await sb().rpc('komo_result_snapshot',{p_patient_id:resolvedPatientId});if(!s.error)snapshot=s.data}
    const q=await sb().rpc('komo_professional_patient_dossier',{p_patient_id:resolvedPatientId});
    if(q.error)throw q.error;
    if(!q.data)throw new Error('Dossier résultat vide.');
    const dossier=await exactEpisode(q.data,targetAssessmentId);
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
window.KomoCanonicalResultRuntime={version:'1.3.0',load:loadCanonicalResult,clear:clearCanonicalResult,latest:null,getLatest:getLatestCanonicalResult};

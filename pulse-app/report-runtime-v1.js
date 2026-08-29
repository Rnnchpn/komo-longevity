import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
let client=null;const cache=new Map();
function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
export function reportClient(){return window.KomoRuntime?.client||(client||(client=createClient(SUPABASE_URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function cacheKey(patientId){return patientId?`pro:${patientId}`:'self'}
export async function loadReportSnapshot({patientId=null,force=false}={}){const k=cacheKey(patientId);if(!force&&cache.has(k))return cache.get(k);const p=(async()=>{const q=await reportClient().rpc('komo_report_snapshot',{p_patient_id:patientId||null});if(q.error)throw q.error;return q.data||null})();cache.set(k,p);try{return await p}catch(e){cache.delete(k);throw e}}
export function clearReportSnapshot(patientId=null){if(patientId)cache.delete(cacheKey(patientId));else cache.clear();window.dispatchEvent(new CustomEvent('komo:report-snapshot-invalidated',{detail:{patientId}}))}
export async function saveReport({patientId,assessmentId,scoreId,payload,action='draft'}={}){const q=await reportClient().rpc('save_komo_report',{p_patient_id:patientId,p_assessment_id:assessmentId,p_score_id:scoreId,p_payload:payload,p_action:action});if(q.error)throw q.error;clearReportSnapshot(patientId);return q.data}
export async function notifyReport({patientId,reportId,eventReference}={}){const q=await reportClient().functions.invoke('pulse-notify',{body:{kind:'mobility_report_ready',patientId,reportId,eventReference:eventReference||`report-${reportId}`}});if(q.error)throw q.error;if(q.data?.ok===false)throw new Error(q.data?.error||'notification_failed');clearReportSnapshot(patientId);return q.data}
if(typeof window!=='undefined')window.KomoReportRuntime={version:'1.0.0',load:loadReportSnapshot,clear:clearReportSnapshot,save:saveReport,notify:notifyReport,client:reportClient};
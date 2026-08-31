import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const VERSION='1.0.0';
const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER_KEY='komo_pulse_remember';
let fallbackClient=null;

function storage(){return localStorage.getItem(REMEMBER_KEY)==='1'?localStorage:sessionStorage}
function client(){
  const runtime=window.KomoRuntime?.client||window.KomoRuntime?.getContext?.()?.client;
  if(runtime)return runtime;
  if(!fallbackClient)fallbackClient=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  return fallbackClient;
}
function cleanHistory(history){
  if(!Array.isArray(history))return[];
  return history.slice(-6).map(x=>({role:x?.role==='assistant'?'assistant':'user',content:String(x?.content||'').trim().slice(0,1200)})).filter(x=>x.content);
}
async function invoke(body){
  const sb=client();
  const {data:{session}}=await sb.auth.getSession();
  if(!session?.user)throw new Error('session_required');
  const {data,error}=await sb.functions.invoke('komo-operator-v1',{body});
  if(error){
    let code=error?.message||'komo_api_failed';
    try{const payload=await error.context?.json?.();if(payload?.error)code=payload.error}catch{}
    throw new Error(code);
  }
  if(data?.error)throw new Error(data.error);
  return data;
}
async function ask(message,{patientId=null,history=[]}={}){
  const value=String(message||'').trim();
  if(!value)throw new Error('message_required');
  return invoke({action:'chat',message:value.slice(0,2500),patient_id:patientId||undefined,history:cleanHistory(history)});
}
async function overview({patientId=null}={}){return invoke({action:'overview',patient_id:patientId||undefined})}
async function patientStatus(patientId=null){return invoke({action:'patient_status',patient_id:patientId||undefined})}
async function draftReminder(patientId){if(!patientId)throw new Error('patient_id_required');return invoke({action:'draft_reminder',patient_id:patientId})}

window.KomoAI=Object.freeze({version:VERSION,ask,overview,patientStatus,draftReminder});
window.dispatchEvent(new CustomEvent('komo:ai-ready',{detail:{version:VERSION}}));

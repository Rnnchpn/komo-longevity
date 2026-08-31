const VERSION='1.1.0';

function client(){
  const runtime=window.KomoRuntime?.client||window.KomoRuntime?.getContext?.()?.client;
  if(runtime)return runtime;
  throw new Error('runtime_client_unavailable');
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

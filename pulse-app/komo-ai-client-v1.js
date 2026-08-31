const VERSION='1.3.0';

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
function fmtDate(v){if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return'';return new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}).format(d)}
function routeAction(label,route){return{label,action:'open_route',route,patient_id:''}}
function safeFallback(data){
  const summary=data?.summary||data?.record?.summary||null;
  const priorities=Array.isArray(data?.priorities)?data.priorities:[];
  const counts=data?.counts||{};
  const role=data?.role||data?.mode||'member';
  const pro=['admin','professional'].includes(role)||['admin','professional'].includes(data?.mode);
  let headline='Mode Pulse vérifié.';
  let answer='Je n’ai pas pu générer une réponse conversationnelle complète. Je peux néanmoins vous montrer uniquement les informations vérifiées actuellement disponibles dans Pulse.';
  let actions=[];
  const used=[];
  if(summary){
    const parts=[];
    if(Number.isFinite(Number(summary.preparation_percent))){parts.push(`Préparation Motion : ${Math.round(Number(summary.preparation_percent))} %.`);used.push('préparation Motion')}
    if(summary.score_release_status&&['released','published'].includes(String(summary.score_release_status).toLowerCase())&&Number.isFinite(Number(summary.motion_score))){parts.push(`Motion Score publié : ${Math.round(Number(summary.motion_score))}/100.`);used.push('Motion Score publié')}
    else if(summary.motion_status&&summary.motion_status!=='not_started'){parts.push('Bilan Motion en cours de traitement ou de validation.');used.push('statut Motion')}
    const ap=summary.next_appointment?.scheduled_start||summary.next_appointment?.scheduled_at;const when=fmtDate(ap);if(when){parts.push(`Prochain rendez-vous : ${when}.`);used.push('rendez-vous')}
    const key=summary.key||{};if(key.connected){const days=Number(key.days_7);parts.push(Number.isFinite(days)?`KEY : ${days}/7 jours reçus.`:'KEY connecté.');used.push('KEY')}
    if(priorities[0]?.title){parts.push(`Priorité vérifiée : ${priorities[0].title}${priorities[0].detail?` — ${priorities[0].detail}`:''}.`);used.push('priorités Pulse')}
    if(parts.length)answer=`Réponse conversationnelle indisponible pour le moment. ${parts.join(' ')}`;
    actions=[routeAction('Voir mes résultats','results'),routeAction('Voir ma trajectoire','trajectory'),routeAction('Voir mon rendez-vous','documents')];
  }else if(pro){
    const parts=[];
    if(Number.isFinite(Number(counts.patients)))parts.push(`${Math.round(Number(counts.patients))} dossier(s) dans le périmètre.`);
    if(Number.isFinite(Number(counts.incomplete))&&Number(counts.incomplete)>0)parts.push(`${Math.round(Number(counts.incomplete))} préparation(s) incomplète(s).`);
    if(Number.isFinite(Number(counts.motion_review))&&Number(counts.motion_review)>0)parts.push(`${Math.round(Number(counts.motion_review))} bilan(s) Motion à revoir.`);
    if(priorities[0]?.title)parts.push(`Priorité vérifiée : ${priorities[0].title}${priorities[0].detail?` — ${priorities[0].detail}`:''}.`);
    if(parts.length)answer=`Réponse conversationnelle indisponible pour le moment. ${parts.join(' ')}`;
    actions=[routeAction('Ouvrir les dossiers','clinical'),routeAction('Voir l’agenda','agenda'),routeAction('Ouvrir Admin','admin')];used.push('priorités opérationnelles');
  }else if(priorities[0]?.title){
    answer=`Réponse conversationnelle indisponible pour le moment. Priorité vérifiée : ${priorities[0].title}${priorities[0].detail?` — ${priorities[0].detail}`:''}.`;
    actions=[routeAction('Voir mes résultats','results'),routeAction('Ouvrir KEY','key'),routeAction('Voir mon rendez-vous','documents')];used.push('priorités Pulse');
  }
  return{role,mode:data?.mode||role,generated_at:new Date().toISOString(),fallback:true,reply:{headline,answer,suggested_actions:actions.slice(0,3),needs_professional_review:false,urgent:false,data_used:used}};
}
async function overview({patientId=null}={}){return invoke({action:'overview',patient_id:patientId||undefined})}
async function patientStatus(patientId=null){return invoke({action:'patient_status',patient_id:patientId||undefined})}
async function ask(message,{patientId=null,history=[]}={}){
  const value=String(message||'').trim();
  if(!value)throw new Error('message_required');
  try{return await invoke({action:'chat',message:value.slice(0,2500),patient_id:patientId||undefined,history:cleanHistory(history)})}
  catch(chatError){
    console.warn('[KomoAI] chat unavailable, using verified Pulse mode',chatError?.message||chatError);
    try{return safeFallback(await overview({patientId}))}
    catch(overviewError){console.error('[KomoAI] fallback unavailable',overviewError);throw chatError}
  }
}
async function draftReminder(patientId){if(!patientId)throw new Error('patient_id_required');return invoke({action:'draft_reminder',patient_id:patientId})}

window.KomoAI=Object.freeze({version:VERSION,ask,overview,patientStatus,draftReminder});
window.dispatchEvent(new CustomEvent('komo:ai-ready',{detail:{version:VERSION}}));

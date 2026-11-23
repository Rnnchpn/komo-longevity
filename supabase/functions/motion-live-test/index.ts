import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { SPEC } from "./protocol.ts";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")||"";
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const db=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false}});
// Centre de démonstration / répétition (données fictives uniquement).
const DEFAULT_ORG_ID="cea48f94-24ae-4ddb-ac28-ac289bb1e9ca"; // KŌMØ Cannes, test_only
// Multi-centres (20/11/2026) : un centre "production_enabled" (ex. KŌMØ Beausoleil — Clinique HIRO)
// accepte des dossiers réels pseudonymisés (patients.data_classification="health_data").
// Un centre "test_only" n'accepte que des patients fictifs. Tout autre statut est refusé.
const MEMBER_ROLES=["owner","clinical_admin","physician","operator","coordinator"];
type Center={id:string;clinical_data_status:"test_only"|"production_enabled"};
// KŌMØ Motion — protocole standardisé (source unique : pulse-v14-src/motion-protocol.mjs,
// copie générée dans ./protocol.ts par scripts/motion-protocol-sync.mjs ; ne jamais dupliquer ici).
const STEPS:string[]=SPEC.steps.map((x:any)=>x.id);
// Compléments (posture sur photo, 23/11/2026) : hors des 14 étapes, enregistrés par la transcription seulement.
const COMPLEMENTS:string[]=(SPEC.complements||[]).map((x:any)=>x.id);
const STEP_SPEC:Record<string,any>=Object.fromEntries([...SPEC.steps,...(SPEC.complements||[])].map((x:any)=>[x.id,x]));
const SKIP_REASONS:string[]=SPEC.skip_reasons;
const PROTOCOL_STAMP={id:SPEC.protocol.id,version:SPEC.protocol.version,code:SPEC.protocol.code,
 mode:SPEC.protocol.mode,device_set:SPEC.protocol.device_set,test_order:STEPS};
type FieldSpec={key:string;min:number;max:number;decimals:number;optional?:boolean};
const INSTRUMENTED:Record<string,{fields:FieldSpec[];choices:{key:string;options:string[]}[];pair?:[string,string]}>=
 Object.fromEntries([...SPEC.steps,...(SPEC.complements||[])].filter((x:any)=>x.kind==="fields").map((x:any)=>[x.id,{fields:x.fields,choices:x.choices||[],pair:x.pair}]));
const roundTo=(x:number,d:number)=>Math.round(x*10**d)/10**d;
function validateInstrumented(step:string,raw:any){
 const spec=INSTRUMENTED[step];if(!spec||!raw||typeof raw!=="object"||Array.isArray(raw))return null;
 const fields:Record<string,number|string>={};
 for(const f of spec.fields){
  const v=raw[f.key];
  if(v===undefined||v===null){if(f.optional)continue;return null;}
  if(typeof v!=="number"||!Number.isFinite(v)||v<f.min||v>f.max||Math.abs(roundTo(v,f.decimals)-v)>1e-9)return null;
  fields[f.key]=v;
 }
 for(const c of spec.choices){
  if(typeof raw[c.key]!=="string"||!c.options.includes(raw[c.key]))return null;
  fields[c.key]=raw[c.key];
 }
 const derived:Record<string,number|string>={};
 if(step==="gait_4m"){
  // Protocole v2.3 (SPPB) : départ arrêté, le passage le plus rapide fait foi.
  const a=fields.gait_4m_s_1 as number,b=fields.gait_4m_s_2 as number,best=Math.min(a,b);
  derived.gait_best_s=roundTo(best,2);derived.gait_mean_s=roundTo((a+b)/2,2);derived.gait_speed_ms=roundTo(4/best,2);
 }
 if(spec.pair){
  const l=fields[spec.pair[0]] as number,r=fields[spec.pair[1]] as number;
  if(l>0&&r>0){derived.lsi_pct=roundTo(100*Math.min(l,r)/Math.max(l,r),1);
   derived.weaker_side=l<r?"left":r<l?"right":"balanced";}
 }
 return {fields,derived};
}
// Étapes à valeur unique (chrono + compteur, équilibre, Two-Step) : bornes du protocole.
const LIMITS:Record<string,{max:number;integer:boolean;unit:string}>=Object.fromEntries(
 SPEC.steps.filter((x:any)=>["count","balance"].includes(x.kind)).map((x:any)=>[x.id,{max:x.max,integer:x.integer,unit:x.unit}]));
const TWO_STEP_MAX:number=STEP_SPEC.two_step?.max??650;
const POSTURE_OPTIONS:string[]=STEP_SPEC.posture?.options||[];
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com","https://www.komolongevity.com"]);
const allowedOrigin=(o:string)=>ORIGINS.has(o)||/^https:\/\/komo-longevity-[a-z0-9-]+-rnnchpns-projects\.vercel\.app$/.test(o);
function headers(req:Request){
  const origin=req.headers.get("origin")||"";
  return {"Access-Control-Allow-Origin":allowedOrigin(origin)?origin:"https://pulse.komolongevity.com",
    "Access-Control-Allow-Headers":"authorization,apikey,x-client-info,content-type",
    "Access-Control-Allow-Methods":"POST,OPTIONS",
    "Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",
    "X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","Vary":"Origin"};
}
const response=(req:Request,data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:headers(req)});
const s=(v:unknown,n=100)=>typeof v==="string"?v.trim().slice(0,n):"";
const uuid=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const tokenRe=/^[A-Za-z0-9_-]{43}$/;
const now=()=>new Date().toISOString();
const randomToken=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const hash=async(v:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)))).map(x=>x.toString(16).padStart(2,"0")).join("");
async function centerInfo(id:string):Promise<Center|null>{
 if(!uuid(id))return null;
 const {data,error}=await db.from("organizations").select("id,status,clinical_data_status").eq("id",id).maybeSingle();
 if(error||!data||data.status!=="active"||!["test_only","production_enabled"].includes(data.clinical_data_status))return null;
 return {id:data.id,clinical_data_status:data.clinical_data_status};
}
// Identity only: account role admin/professional. Centre membership is checked per request.
async function operator(req:Request){
 const jwt=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(!jwt||jwt===req.headers.get("apikey"))return null;
 const {data,error}=await db.auth.getUser(jwt);
 const user=data?.user;if(error||!user)return null;
 const {data:role}=await db.from("account_roles").select("role").eq("user_id",user.id).maybeSingle();
 if(!["admin","professional"].includes(role?.role||""))return null;
 return {id:user.id,role:role.role};
}
async function isMember(userId:string,orgId:string){
 const {data:member}=await db.from("organization_members").select("role,status")
  .eq("user_id",userId).eq("organization_id",orgId).eq("status","active").maybeSingle();
 return !!member&&MEMBER_ROLES.includes(member.role);
}
async function eligibleCenters(userId:string){
 const {data:rows}=await db.from("organization_members").select("organization_id,role,status")
  .eq("user_id",userId).eq("status","active");
 const ids=(rows||[]).filter((x:any)=>MEMBER_ROLES.includes(x.role)).map((x:any)=>x.organization_id);
 const out:string[]=[];
 for(const id of ids){if(await centerInfo(id))out.push(id);}
 return out;
}
function publicRow(x:any){
 return {id:x.id,display_code:x.display_code,status:x.status,stage_code:x.stage_code,
  step_index:x.step_index,progress:x.progress||{},patient_id:x.patient_id,
  operator_session_id:x.operator_session_id,operator_user_id:x.operator_user_id,patient_last_seen_at:x.patient_last_seen_at,
  created_at:x.created_at,updated_at:x.updated_at};
}
// Questionnaire : 22 questions + 5 questions facultatives « Santé et longévité » (22/11/2026).
// Même liste que pulse-v14-src/motion-engine/intake-model.mjs (contrôlée par le build).
const ANSWER_CHOICES:Record<string,string[]>={
 ageBand:["under40","40-49","50-59","60-69","70-79","80plus","undisclosed"],
 goal:["independence","walk","strength","confidence","general"],
 falls12:["0","1","2plus"],activityMinutes:["lt60","60to149","150plus"],sittingHours:["lt6","6to8","gt8"],
 smoking:["never","former","current"],medications:["0to2","3to4","5plus"]
};
const RATING_KEYS=new Set(["walk10","stairs","chair","carry","bend","obstacle","turn","stand",
 "pain","fatigue","fear","avoid","sleep","stress","recovered","qol",
 "walkingDays","strengthDays","outdoors","breaks"]);
const MAX_ANSWERS=Object.keys(ANSWER_CHOICES).length+RATING_KEYS.size;
function cleanAnswers(answers:any):{cleaned?:Record<string,string>;error?:string}{
 if(!answers||typeof answers!=="object"||Array.isArray(answers))return {error:"invalid_questionnaire"};
 const entries=Object.entries(answers);
 if(entries.length>MAX_ANSWERS)return {error:"questionnaire_too_large"};
 const cleaned:Record<string,string>={};
 for(const [key,value] of entries){
  if(typeof value!=="string"||value.length>30)return {error:"invalid_answer"};
  if(ANSWER_CHOICES[key]){if(!ANSWER_CHOICES[key].includes(value))return {error:"invalid_answer"};}
  else if(RATING_KEYS.has(key)){if(!["0","1","2","3","4"].includes(value))return {error:"invalid_answer"};}
  else return {error:"unknown_question"};
  cleaned[key]=value;
 }
 return {cleaned};
}
// Lien patient (QR remis en consultation) : le patient remplit le questionnaire sur son téléphone puis
// retrouve ses résultats. Jeton aléatoire de 256 bits, seule son empreinte est stockée, 30 jours, sans compte.
const PATIENT_LINK_DAYS=30;
async function patientLinkLookup(req:Request,b:any){
 const token=s(b.patient_token,80);
 if(!tokenRe.test(token))return {error:response(req,{error:"invalid_patient_link"},401)};
 const tokenHash=await hash(token);
 const {data,error}=await db.from("pulse_motion_live_sessions").select("*")
  .contains("progress",{patient_link:{token_hash:tokenHash}}).limit(2);
 if(error)return {error:response(req,{error:"temporarily_unavailable"},503)};
 const rows=data||[];
 if(rows.length!==1)return {error:response(req,{error:"patient_link_not_found"},404)};
 const room=rows[0],link=room.progress?.patient_link;
 if(!link||link.token_hash!==tokenHash||!(new Date(link.expires_at).getTime()>Date.now()))
  return {error:response(req,{error:"patient_link_expired"},410)};
 if(!["active","completed"].includes(room.status))return {error:response(req,{error:"patient_link_closed"},410)};
 return {room,tokenHash};
}
function patientView(room:any,patient:any){
 const p=room.progress||{},results=p.results&&typeof p.results==="object"?p.results:{};
 // Code du dossier : research_subject_code (dossiers nominatifs, 23/11/2026) ou ancien format (nom = code).
 const rsc=typeof patient?.research_subject_code==="string"?patient.research_subject_code:"";
 const legacy=typeof patient?.last_name==="string"&&/^[A-Z]{2,6}-\d{6}-\d{2}$/.test(patient.last_name);
 const code=/^[A-Z]{2,6}-\d{6}-\d{2}$/.test(rsc)?rsc:legacy?patient.last_name:null;
 const name=legacy?null:[patient?.first_name,patient?.last_name].filter((x:any)=>typeof x==="string"&&x.trim()).join(" ").slice(0,120)||null;
 // Envoi au patient (23/11/2026) : les résultats n'apparaissent sur « Mon bilan » qu'après validation du praticien.
 const released=room.status==="completed"&&typeof p.patient_release?.released_at==="string";
 return {status:room.status,stage_code:room.stage_code,steps:STEPS,completed_at:room.completed_at||null,code,
  first_name:legacy?null:(typeof patient?.first_name==="string"?patient.first_name.slice(0,60):null),name,
  patient:{birth_date:patient?.birth_date||null,sex_at_birth:patient?.sex_at_birth||null,
   real:patient?.data_classification==="health_data"},
  questionnaire:{answers:p.questionnaire?.answers||{},updated_at:p.questionnaire?.updated_at||null,
   simulated:p.questionnaire?.simulated===true},
  tests_done:STEPS.filter(id=>["done","skipped"].includes(results[id]?.status)).length,
  results:released?results:null,released,released_at:released?p.patient_release.released_at:null,
  link_expires_at:p.patient_link?.expires_at||null};
}
async function guestLookup(req:Request,b:any){
 const token=s(b.guest_token,80);
 if(!tokenRe.test(token))return {error:response(req,{error:"invalid_guest_token"},401)};
 const {data,error}=await db.from("pulse_motion_live_sessions").select("*").eq("guest_token_hash",await hash(token)).maybeSingle();
 if(error)return {error:response(req,{error:"temporarily_unavailable"},503)};
 if(!data)return {error:response(req,{error:"session_not_found"},404)};
 if(new Date(data.expires_at).getTime()<=Date.now())return {error:response(req,{error:"session_expired"},410)};
 if(data.status==="closed")return {error:response(req,{error:"session_closed"},410)};
 return {session:data};
}

// The signaling table has RLS enabled, with no anon/authenticated grants.
// All SDP messages are short-lived and only accessible via the authorized Edge Function.
// Video frames are transported end-to-end by WebRTC; they never traverse this API.
async function pullSignals(req:Request,sessionId:string,other:"operator"|"guest",since:unknown){
 const cursor=Number(since??0);
 if(!Number.isSafeInteger(cursor)||cursor<0)return response(req,{error:"invalid_cursor"},422);
 const {data,error}=await db.from("pulse_motion_live_signals")
  .select("id,kind,sender,connection_id,payload,created_at")
  .eq("session_id",sessionId).eq("sender",other).gt("id",cursor)
  .order("id",{ascending:true}).limit(24);
 if(error)return response(req,{error:"signals_unavailable"},503);
 return response(req,{ok:true,signals:data||[]});
}
async function pushSignal(req:Request,sessionId:string,sender:"guest"|"operator",b:any){
 const kind=s(b.kind,12),connectionId=s(b.connection_id,50);
 if(!uuid(connectionId))return response(req,{error:"invalid_connection"},422);
 const allowed=sender==="guest"?["offer","stop"]:["watch","answer","stop"];
 if(!allowed.includes(kind))return response(req,{error:"invalid_signal"},422);
 let payload:any={};
 if(kind==="offer"||kind==="answer"){
  const sdp=b.payload?.sdp;
  if(typeof sdp!=="string"||sdp.length<20||sdp.length>30000||!sdp.startsWith("v=0"))
    return response(req,{error:"invalid_sdp"},422);
  payload={type:kind,sdp};
 }
 // Opening a new watch supersedes prior negotiations and minimizes retention.
 if(kind==="watch"){
  await db.from("pulse_motion_live_signals").delete().eq("session_id",sessionId);
  await db.from("pulse_motion_live_signals").delete().lt("created_at",new Date(Date.now()-3*3600000).toISOString());
 }
 const {data,error}=await db.from("pulse_motion_live_signals")
  .insert({session_id:sessionId,sender,connection_id:connectionId,kind,payload})
  .select("id").single();
 if(error||!data)return response(req,{error:"signal_delivery_failed"},503);
 return response(req,{ok:true,id:data.id});
}

Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:headers(req)});
 if(req.method!=="POST")return response(req,{error:"method_not_allowed"},405);
 const origin=req.headers.get("origin")||"";
 if(origin&&!allowedOrigin(origin))return response(req,{error:"origin_forbidden"},403);
 const cl=Number(req.headers.get("content-length")||0);
 if(cl>48000)return response(req,{error:"payload_too_large"},413);
 let b:any={};try{
  const raw=await req.text();
  if(raw.length>48000)return response(req,{error:"payload_too_large"},413);
  b=JSON.parse(raw);
 }catch{return response(req,{error:"invalid_json"},400)}
 const action=s(b.action,35);
 const requestedOrg=s(b.organization_id,50);
 if(requestedOrg&&!uuid(requestedOrg))return response(req,{error:"invalid_organization"},422);
 // Per-request centre. Never a module-level mutable: requests run concurrently.
 let ORG_ID=DEFAULT_ORG_ID;
 let center=null as Center|null;
 const useCenter=async(id:string)=>{center=await centerInfo(id);if(center)ORG_ID=center.id;return center;};
 // Patient allowed in this centre: fictitious everywhere, real (pseudonymised) only in production centres.
 const patientAllowed=(p:any)=>!!p&&p.status==="active"&&(p.data_classification==="synthetic"||
  (p.data_classification==="health_data"&&center?.clinical_data_status==="production_enabled"));

 // Appointment-free, account-free CHECK-IN for a clinician-issued one-time invitation.
 // Restricted to synthetic identity aliases in this non-clinical test environment.
 // The invitation token is random (256-bit), its database copy is SHA-256 hashed.
 // Patient phone/tablet NEVER requests a camera or controls the clinical tests.
 if(action==="patient_checkin_status"||action==="patient_checkin_submit"){
  const found=await guestLookup(req,b);if(found.error)return found.error;
  const room=found.session,progress=room.progress||{},record=progress.patient_checkin;
  if((await useCenter(room.organization_id))?.clinical_data_status!=="test_only")
   return response(req,{error:"test_environment_only"},423);
  if(!record||progress.camera_owner==="operator"||!room.operator_user_id)
   return response(req,{error:"invalid_invitation"},404);
  const state=s(record.state,16);
  if(action==="patient_checkin_status"){
   if(!room.patient_last_seen_at||Date.now()-new Date(room.patient_last_seen_at).getTime()>12000)
    await db.from("pulse_motion_live_sessions").update({patient_last_seen_at:now()}).eq("id",room.id);
   return response(req,{ok:true,state,code:room.display_code,
    alias:state==="invited"?"":s(record.alias,32),expires_at:room.expires_at});
  }
  if(state!=="invited"||room.status!=="waiting")return response(req,{error:"already_submitted"},409);
  const alias=s(b.alias,32),ageBand=s(b.age_band,16),goal=s(b.goal,20);
  // No free-text identities may be entered while the centre is test-only.
  // Only server-approved fictitious aliases can be stored.
  if(!["Camille","Alex","Morgan","Sacha","Noa"].includes(alias)||
    !["under40","40-49","50-59","60-69","70-79","80plus"].includes(ageBand)||
    !["independence","walk","strength","confidence","general"].includes(goal)||
    b.synthetic_attested!==true)
   return response(req,{error:"invalid_demo_details"},422);
  const next={...progress,patient_checkin:{state:"ready",alias,age_band:ageBand,
    goal,synthetic:true,submitted_at:now()}};
  const {data,error}=await db.from("pulse_motion_live_sessions")
   .update({status:"ready",progress:next,patient_last_seen_at:now(),updated_at:now()})
   .eq("id",room.id).eq("status","waiting").eq("updated_at",room.updated_at)
   .select("id,display_code").maybeSingle();
  return error||!data?response(req,{error:"already_submitted"},409):
   response(req,{ok:true,state:"ready",code:data.display_code});
 }

 if(action==="guest_start"){
  if((await useCenter(DEFAULT_ORG_ID))?.clinical_data_status!=="test_only")
   return response(req,{error:"test_environment_only"},423);
  const {count,error:countError}=await db.from("pulse_motion_live_sessions").select("id",{head:true,count:"exact"})
   .eq("organization_id",ORG_ID).gte("created_at",new Date(Date.now()-5*60000).toISOString());
  if(countError)return response(req,{error:"temporarily_unavailable"},503);
  if((count||0)>=40)return response(req,{error:"session_limit_reached"},429);
  const guestToken=randomToken();
  const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,"0");
  const {data,error}=await db.from("pulse_motion_live_sessions").insert({
   organization_id:ORG_ID,guest_token_hash:await hash(guestToken),display_code:code,
   status:"waiting",stage_code:STEPS[0],step_index:0,progress:{step_status:"pending",results:{}},
   patient_last_seen_at:now()
  }).select("id,display_code,status,expires_at").single();
  if(error)return response(req,{error:"session_creation_failed"},503);
  return response(req,{ok:true,...data,guest_token:guestToken,steps:STEPS});
 }

 // Guest-only video signaling. Session credentials are hashed and never leave this API.
 // The operator must first pair this guest with a synthetic D0 patient.
 if(action==="guest_signal_pull"||action==="guest_signal_push"){
  const found=await guestLookup(req,b);if(found.error)return found.error;
  const room=found.session;
  if(!await useCenter(room.organization_id))return response(req,{error:"center_unavailable"},423);
  if(room.status!=="active"||!room.operator_user_id)return response(req,{error:"operator_not_connected"},409);
  if(action==="guest_signal_pull")return pullSignals(req,room.id,"operator",b.since);
  return pushSignal(req,room.id,"guest",b);
 }

 if(action==="guest_status"||action==="guest_event"){
  const result=await guestLookup(req,b);if(result.error)return result.error;
  const x=result.session;
  if(!await useCenter(x.organization_id))return response(req,{error:"center_unavailable"},423);
  if(action==="guest_status"){
   if(!x.patient_last_seen_at||Date.now()-new Date(x.patient_last_seen_at).getTime()>12000){
    await db.from("pulse_motion_live_sessions").update({patient_last_seen_at:now()}).eq("id",x.id);
   }
   return response(req,{ok:true,session:{id:x.id,display_code:x.display_code,status:x.status,
    stage_code:x.stage_code,step_index:x.step_index,progress:x.progress||{},
    operator_connected:!!x.operator_user_id,expires_at:x.expires_at},steps:STEPS});
  }
  const event=s(b.event,20),stage=s(b.stage_code,40);
  if(event==="ready"){
   if(!["waiting","ready"].includes(x.status))return response(req,{error:"invalid_state"},409);
   const {error}=await db.from("pulse_motion_live_sessions").update({
    status:"ready",patient_last_seen_at:now(),updated_at:now()
   }).eq("id",x.id).eq("status",x.status);
   return error?response(req,{error:"update_failed"},503):response(req,{ok:true,status:"ready"});
  }
  // Once paired, all test timing and validation is controlled exclusively by Operator.
  return response(req,{error:"operator_controls_tests"},403);
 }

 // Téléphone du patient (lien du QR) : statut, questionnaire, résultats. Aucune authentification de compte.
 if(action==="patient_link_status"||action==="patient_questionnaire_save"){
  const found=await patientLinkLookup(req,b);
  if(found.error)return found.error;
  const room=found.room;
  if(!await useCenter(room.organization_id))return response(req,{error:"center_unavailable"},423);
  const {data:patient}=await db.from("patients").select("id,first_name,last_name,research_subject_code,birth_date,sex_at_birth,data_classification,status")
   .eq("id",room.patient_id).eq("organization_id",ORG_ID).maybeSingle();
  if(!patientAllowed(patient))return response(req,{error:"patient_unavailable"},403);
  if(action==="patient_link_status")return response(req,{ok:true,...patientView(room,patient)});
  const checked=cleanAnswers(b.answers);
  if(checked.error)return response(req,{error:checked.error},422);
  const cleaned=checked.cleaned as Record<string,string>;
  for(let attempt=0;attempt<6;attempt++){
   const {data:latest,error:readError}=await db.from("pulse_motion_live_sessions").select("*")
    .eq("id",room.id).maybeSingle();
   if(readError||!latest)return response(req,{error:"questionnaire_reload_failed"},503);
   const prior=latest.progress&&typeof latest.progress==="object"&&!Array.isArray(latest.progress)?latest.progress:{};
   if(prior.patient_link?.token_hash!==found.tokenHash||!["active","completed"].includes(latest.status))
    return response(req,{error:"patient_link_expired"},410);
   const priorAnswers=prior.questionnaire?.answers||{};
   if(Object.keys(priorAnswers).some(key=>!Object.prototype.hasOwnProperty.call(cleaned,key)))
    return response(req,{error:"questionnaire_stale_snapshot",...patientView(latest,patient)},409);
   const nextProgress={...prior,questionnaire:{...prior.questionnaire,version:"KOMO_MOTION_SELF_REPORT_V1",
    answers:cleaned,updated_at:now(),entered_by:"patient",simulated:prior.questionnaire?.simulated===true}};
   const {data:saved,error:saveError}=await db.from("pulse_motion_live_sessions")
    .update({progress:nextProgress,updated_at:now()}).eq("id",room.id)
    .eq("updated_at",latest.updated_at).select("*").maybeSingle();
   if(saveError)return response(req,{error:"questionnaire_storage_failed"},503);
   if(saved)return response(req,{ok:true,answered_count:Object.keys(cleaned).length,...patientView(saved,patient)});
  }
  return response(req,{error:"questionnaire_conflict_retry"},409);
 }
 const actor=await operator(req);
 if(!actor)return response(req,{error:"operator_access_required"},403);
 // Centre resolution: explicit organization_id (console), else the room's centre (iPhone
 // camera actions carry only session_id), else every eligible centre for camera start.
 let scope:string[]=[];
 if(requestedOrg)scope=[requestedOrg];
 else{
  const sid=s(b.session_id,50);
  if(uuid(sid)){
   const {data:r}=await db.from("pulse_motion_live_sessions").select("organization_id").eq("id",sid).maybeSingle();
   if(r?.organization_id)scope=[r.organization_id];
  }
 }
 if(!scope.length&&action==="operator_camera_start")scope=await eligibleCenters(actor.id);
 if(!scope.length)scope=[DEFAULT_ORG_ID];
 if(scope.length===1){
  if(!await useCenter(scope[0]))return response(req,{error:"center_unavailable"},423);
  if(!await isMember(actor.id,ORG_ID))return response(req,{error:"operator_access_required"},403);
 }
 // Operator creates the short-lived check-in invitation on the workstation,
 // not an anonymously enumerable public patient register.
 if((action==="operator_checkin_invite"||action==="operator_checkin_claim")&&center?.clinical_data_status!=="test_only")
  return response(req,{error:"checkin_test_only"},409);
 if(action==="operator_checkin_invite"){
  const {count,error:countError}=await db.from("pulse_motion_live_sessions")
   .select("id",{head:true,count:"exact"}).eq("organization_id",ORG_ID)
   .eq("operator_user_id",actor.id).eq("status","waiting")
   .gte("expires_at",now());
  if(countError)return response(req,{error:"temporarily_unavailable"},503);
  if((count||0)>=8)return response(req,{error:"too_many_pending_invites"},429);
  const token=randomToken(),code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,"0");
  const {data,error}=await db.from("pulse_motion_live_sessions").insert({
   organization_id:ORG_ID,guest_token_hash:await hash(token),
   display_code:code,operator_user_id:actor.id,status:"waiting",
   stage_code:"checkin",step_index:0,
   progress:{kind:"patient_checkin",patient_checkin:{state:"invited",synthetic:true}},
   expires_at:new Date(Date.now()+90*60000).toISOString()
  }).select("id,display_code,expires_at").single();
  return error||!data?response(req,{error:"invite_creation_failed"},503):
   response(req,{ok:true,id:data.id,code:data.display_code,expires_at:data.expires_at,
    url:"https://pulse.komolongevity.com/commencer/?invitation="+encodeURIComponent(token)});
 }
 if(action==="operator_checkin_claim"){
  const id=s(b.session_id,50),patientId=s(b.patient_id,50),operatorSessionId=s(b.operator_session_id,50);
  if(!uuid(id)||!uuid(patientId)||!uuid(operatorSessionId))
   return response(req,{error:"invalid_identifiers"},422);
  const [{data:room},{data:patient},{data:op}]=await Promise.all([
   db.from("pulse_motion_live_sessions").select("*").eq("id",id).eq("organization_id",ORG_ID).maybeSingle(),
   db.from("patients").select("id,data_classification,status,organization_id").eq("id",patientId).eq("organization_id",ORG_ID).maybeSingle(),
   db.from("pulse_operator_sessions").select("id,patient_id,operator_user_id,status,organization_id").eq("id",operatorSessionId).eq("organization_id",ORG_ID).maybeSingle()
  ]);
  if(!room||room.operator_user_id!==actor.id||room.progress?.kind!=="patient_checkin"||
     room.progress?.patient_checkin?.state!=="ready"||room.status!=="ready"||
     new Date(room.expires_at).getTime()<=Date.now())
   return response(req,{error:"checkin_not_ready"},409);
  if(!patientAllowed(patient)||
     !op||op.patient_id!==patientId||op.operator_user_id!==actor.id||
     !["running","draft","paused"].includes(op.status))
   return response(req,{error:"synthetic_patient_required"},403);
  const progress={...room.progress,patient_checkin:{...room.progress.patient_checkin,
    state:"accepted",accepted_at:now()}};
  const {data,error}=await db.from("pulse_motion_live_sessions").update({
   patient_id:patientId,operator_session_id:operatorSessionId,
   progress,updated_at:now()
  }).eq("id",id).eq("status","ready").is("patient_id",null)
   .eq("updated_at",room.updated_at).select("id").maybeSingle();
  return error||!data?response(req,{error:"claim_conflict"},409):
   response(req,{ok:true,id,patient_id:patientId});
 }
 // ONE desktop-created physical consultation. This room is already bound to an
 // Operator-owned synthetic patient + authorised operator session BEFORE the iPhone
 // starts. No QR code and no additional video room: the iPhone joins this room.
 if(action==="operator_consultation_prepare"){
  const patientId=s(b.patient_id,50),opId=s(b.operator_session_id,50);
  if(!uuid(patientId)||!uuid(opId))return response(req,{error:"invalid_identifiers"},422);
  const [{data:patient},{data:op},{data:pending,error:pendingError}]=await Promise.all([
   db.from("patients").select("id,organization_id,status,data_classification")
    .eq("id",patientId).eq("organization_id",ORG_ID).maybeSingle(),
   db.from("pulse_operator_sessions").select("id,organization_id,patient_id,operator_user_id,status")
    .eq("id",opId).eq("organization_id",ORG_ID).maybeSingle(),
   db.from("pulse_motion_live_sessions").select("id,status,patient_id,operator_session_id,progress,display_code,expires_at")
    .eq("organization_id",ORG_ID).eq("operator_user_id",actor.id)
    .in("status",["waiting","ready","active"]).gte("expires_at",now())
    .contains("progress",{camera_owner:"operator"})
    .order("created_at",{ascending:false}).limit(10)
  ]);
  if(!patientAllowed(patient))
   return response(req,{error:"synthetic_patient_required"},403);
  if(!op||op.patient_id!==patientId||op.operator_user_id!==actor.id||
   !["draft","running","paused"].includes(op.status))
   return response(req,{error:"operator_session_mismatch"},403);
  if(pendingError)return response(req,{error:"temporarily_unavailable"},503);
  // Idempotency: reopening the same prepared consultation is safe.
  const rooms=pending||[];
  if(rooms.length){
   const same=rooms.find(x=>x.progress?.kind==="physical_consultation"&&
    x.patient_id===patientId&&x.operator_session_id===opId);
   if(same&&rooms.length===1)return response(req,{ok:true,reused:true,
    session_id:same.id,display_code:same.display_code,status:same.status});
   return response(req,{error:"consultation_already_pending"},409);
  }
  // Optional pre-consultation preparation preserves the participant's two
  // synthetic questionnaire answers in the SAME physical consultation.
  const checkinId=s(b.checkin_id,50);
  let initialQuestionnaire:Record<string,unknown>={};
  if(checkinId){
   if(!uuid(checkinId))return response(req,{error:"invalid_checkin"},422);
   const {data:checkin}=await db.from("pulse_motion_live_sessions")
    .select("id,patient_id,operator_user_id,progress").eq("id",checkinId)
    .eq("organization_id",ORG_ID).maybeSingle();
   const intake=checkin?.progress?.patient_checkin;
   if(!checkin||checkin.patient_id!==patientId||checkin.operator_user_id!==actor.id||
    checkin.progress?.kind!=="patient_checkin"||intake?.state!=="accepted"||
    intake.synthetic!==true)
    return response(req,{error:"invalid_checkin"},403);
   initialQuestionnaire={questionnaire:{version:"KOMO_MOTION_SELF_REPORT_V1",
    answers:{ageBand:intake.age_band,goal:intake.goal},simulated:true,
    entered_by:"patient_demo_checkin",updated_at:now()}};
  }
  const token=randomToken();
  const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,"0");
  const {data:created,error}=await db.from("pulse_motion_live_sessions").insert({
   organization_id:ORG_ID,operator_user_id:actor.id,patient_id:patientId,operator_session_id:opId,
   guest_token_hash:await hash(token),display_code:code,
   // v2.4 (22/11/2026) : consultation sans caméra. La salle est active dès sa création ; l'iPhone
   // peut encore s'y relier plus tard (operator_camera_start), mais les tests ne l'attendent plus.
   status:"active",stage_code:STEPS[0],step_index:0,
   progress:{kind:"physical_consultation",camera_owner:"operator",camera_state:"not_used",
    step_status:"pending",results:{},safety_confirmed:false,protocol:{...PROTOCOL_STAMP,stamped_at:now()},...initialQuestionnaire},
   expires_at:new Date(Date.now()+4*3600000).toISOString()
  }).select("id,status,display_code").single();
  if(error||!created)return response(req,{error:"consultation_creation_failed"},503);
  return response(req,{ok:true,session_id:created.id,display_code:created.display_code,status:created.status});
 }
 // Explicit fresh-start action for the current Operator's test-only unfinished
 // consultations. Completed reports remain untouched. No other owner's rooms
 // or real patient data can be affected.
 if(action==="operator_reset_demo_sessions"){
  const {data:rooms,error:listError}=await db.from("pulse_motion_live_sessions")
   .select("id,patient_id,operator_session_id,status")
   .eq("organization_id",ORG_ID).eq("operator_user_id",actor.id)
   .in("status",["waiting","ready","active","closed"]).limit(100);
  if(listError)return response(req,{error:"reset_unavailable"},503);
  if(center?.clinical_data_status==="production_enabled"){
   // Real dossiers are never deleted: unfinished rooms are closed, completed reports untouched.
   const open=(rooms||[]).filter((x:any)=>x.status!=="closed").map((x:any)=>x.id);
   if(open.length){
    const {error:closeError}=await db.from("pulse_motion_live_sessions")
     .update({status:"closed",completed_at:now(),updated_at:now()})
     .eq("organization_id",ORG_ID).eq("operator_user_id",actor.id).in("id",open)
     .in("status",["waiting","ready","active"]);
    if(closeError)return response(req,{error:"reset_close_failed"},503);
    for(const id of open)await db.from("pulse_motion_live_signals").delete().eq("session_id",id);
   }
   const opIds=[...new Set((rooms||[]).map((x:any)=>x.operator_session_id).filter(Boolean))];
   if(opIds.length)await db.from("pulse_operator_sessions").update({status:"cancelled",updated_at:now()})
    .eq("organization_id",ORG_ID).eq("operator_user_id",actor.id)
    .in("id",opIds).in("status",["draft","running","paused"]);
   return response(req,{ok:true,removed:0,closed:open.length,completed_preserved:true});
  }
  const patientIds=[...new Set((rooms||[]).map(x=>x.patient_id).filter(Boolean))];
  if(patientIds.length){
   const {data:patients,error:patientError}=await db.from("patients")
    .select("id,data_classification").in("id",patientIds);
   if(patientError||!patients||patients.length!==patientIds.length||
    patients.some(p=>p.data_classification!=="synthetic"))
    return response(req,{error:"synthetic_patient_required"},403);
  }
  const ids=(rooms||[]).map(x=>x.id);
  if(ids.length){
   const {error:deleteError}=await db.from("pulse_motion_live_sessions").delete()
    .eq("organization_id",ORG_ID).eq("operator_user_id",actor.id)
    .in("id",ids);
   if(deleteError)return response(req,{error:"reset_delete_failed"},503);
  }
  const opIds=[...new Set((rooms||[]).map(x=>x.operator_session_id).filter(Boolean))];
  if(opIds.length)await db.from("pulse_operator_sessions").update({status:"cancelled",updated_at:now()})
   .eq("organization_id",ORG_ID).eq("operator_user_id",actor.id)
   .in("id",opIds).in("status",["draft","running","paused"]);
  return response(req,{ok:true,removed:ids.length,completed_preserved:true});
 }
 // Physical consultation: the clinician's OWN iPhone acts as a dedicated camera.
 // A valid Operator JWT is required even to create the room. Only fictional patients
 // can subsequently be linked in this test-only environment.
 if(action==="operator_camera_start"){
  // Join the one room prepared by this Operator from their computer.
  // Never create standalone iPhone rooms: that caused accumulating sessions.
  if(!scope.length)return response(req,{error:"consultation_not_prepared"},409);
  const {data:rows,error:readError}=await db.from("pulse_motion_live_sessions")
   .select("*").in("organization_id",scope).eq("operator_user_id",actor.id)
   .in("status",["waiting","active"]).gte("expires_at",now())
   .contains("progress",{kind:"physical_consultation"})
   .order("created_at",{ascending:false}).limit(3);
  if(readError)return response(req,{error:"temporarily_unavailable"},503);
  if(!rows?.length)return response(req,{error:"consultation_not_prepared"},409);
  if(rows.length!==1)return response(req,{error:"multiple_pending_consultations"},409);
  const room=rows[0];
  if(!await useCenter(room.organization_id)||!await isMember(actor.id,ORG_ID))
   return response(req,{error:"operator_access_required"},403);
  if(!room.patient_id||!room.operator_session_id)return response(req,{error:"consultation_unbound"},409);
  if(room.status==="active"&&room.progress?.camera_state==="online"&&
   room.patient_last_seen_at&&Date.now()-new Date(room.patient_last_seen_at).getTime()<18000)
   return response(req,{error:"camera_already_connected"},409);
  const guestToken=randomToken();
  const progress={...room.progress,camera_owner:"operator",camera_state:"online",
   camera_started_at:now()};
  const {data,error}=await db.from("pulse_motion_live_sessions")
   .update({guest_token_hash:await hash(guestToken),status:"active",
    progress,patient_last_seen_at:now(),updated_at:now()})
   .eq("id",room.id).eq("operator_user_id",actor.id)
   .eq("updated_at",room.updated_at).select("*").maybeSingle();
  if(error||!data)return response(req,{error:"camera_pairing_retry"},409);
  await db.from("pulse_motion_live_signals").delete().eq("session_id",room.id);
  return response(req,{ok:true,...publicRow(data),expires_at:data.expires_at,
   guest_token:guestToken,steps:STEPS,paired_automatically:true});
 }
 if(action==="operator_camera_stop"){
  const id=s(b.session_id,50);
  if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data:room}=await db.from("pulse_motion_live_sessions").select("*")
   .eq("id",id).eq("organization_id",ORG_ID)
   .eq("operator_user_id",actor.id).maybeSingle();
  if(!room)return response(req,{error:"session_not_found"},404);
  if(room.status==="completed")return response(req,{ok:true,already_completed:true});
  if(!["ready","active"].includes(room.status))return response(req,{error:"room_unavailable"},409);
  const isPrepared=room.progress?.kind==="physical_consultation";
  const nextProgress=isPrepared?{...room.progress,camera_state:"offline",
   camera_stopped_at:now()}:room.progress;
  const {data,error}=await db.from("pulse_motion_live_sessions").update({
   ...(isPrepared?{
    // Stop only the video, never discard tests/questionnaire when iPhone closes.
    guest_token_hash:await hash(randomToken()),progress:nextProgress
   }:{status:"closed",completed_at:now()}),
   updated_at:now()
  }).eq("id",id).eq("organization_id",ORG_ID).eq("operator_user_id",actor.id)
   .in("status",["ready","active"]).select("id").maybeSingle();
  if(error||!data)return response(req,{error:"camera_close_failed"},409);
  await db.from("pulse_motion_live_signals").delete().eq("session_id",id);
  return response(req,{ok:true,consultation_preserved:isPrepared});
 }
 if(action==="operator_signal_pull"||action==="operator_signal_push"){
  const id=s(b.session_id,50);
  if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data:room,error}=await db.from("pulse_motion_live_sessions")
   .select("id,status,expires_at,operator_user_id,organization_id,patient_id")
   .eq("id",id).eq("organization_id",ORG_ID).maybeSingle();
  if(error||!room)return response(req,{error:"session_not_found"},404);
  if(room.operator_user_id!==actor.id)return response(req,{error:"operator_owner_required"},403);
  if(room.status!=="active"||new Date(room.expires_at).getTime()<=Date.now()||!room.patient_id)
    return response(req,{error:"room_unavailable"},409);
  if(action==="operator_signal_pull")return pullSignals(req,room.id,"guest",b.since);
  return pushSignal(req,room.id,"operator",b);
 }

 // The existing KŌMØ Motion Online questionnaire can be filled at the operator's
 // workstation before, during or after the six tests (synthetic data only).
 // Save only whitelisted answers. No video, landmarks, images or audio are stored.
// QR du patient : crée (ou renouvelle) le lien personnel de la consultation ; l'ancien lien cesse de fonctionner.
 if(action==="operator_patient_link"){
  const id=s(b.session_id,50);
  if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data:room,error:roomError}=await db.from("pulse_motion_live_sessions").select("*")
   .eq("id",id).eq("organization_id",ORG_ID).maybeSingle();
  if(roomError||!room)return response(req,{error:"session_not_found"},404);
  if(room.operator_user_id!==actor.id||!room.patient_id)return response(req,{error:"operator_owner_required"},403);
  if(!["active","completed"].includes(room.status))return response(req,{error:"room_unavailable"},409);
  const {data:patient}=await db.from("patients").select("data_classification,status")
   .eq("id",room.patient_id).eq("organization_id",ORG_ID).maybeSingle();
  if(!patientAllowed(patient))return response(req,{error:"synthetic_patient_required"},403);
  const token=randomToken(),expiresAt=new Date(Date.now()+PATIENT_LINK_DAYS*864e5).toISOString();
  const old=room.progress&&typeof room.progress==="object"&&!Array.isArray(room.progress)?room.progress:{};
  const {data,error}=await db.from("pulse_motion_live_sessions").update({
    progress:{...old,patient_link:{token_hash:await hash(token),created_at:now(),expires_at:expiresAt}},updated_at:now()
   }).eq("id",id).eq("updated_at",room.updated_at).select("*").maybeSingle();
  if(error||!data)return response(req,{error:"stale_state_retry"},409);
  return response(req,{ok:true,token,url:"https://pulse.komolongevity.com/mon-bilan/#t="+token,
   expires_at:expiresAt,session:publicRow(data)});
 }
 if(action==="operator_patient_release"){
  // Validation du praticien : rend les résultats visibles sur la page « Mon bilan » du patient (release:false les masque).
  const id=s(b.session_id,50),release=b.release!==false;
  if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data:room,error:roomError}=await db.from("pulse_motion_live_sessions").select("*")
   .eq("id",id).eq("organization_id",ORG_ID).maybeSingle();
  if(roomError||!room)return response(req,{error:"session_not_found"},404);
  if(room.operator_user_id!==actor.id||!room.patient_id)return response(req,{error:"operator_owner_required"},403);
  if(release&&room.status!=="completed")return response(req,{error:"consultation_not_completed"},409);
  if(!["active","completed"].includes(room.status))return response(req,{error:"room_unavailable"},409);
  const {data:patient}=await db.from("patients").select("data_classification,status")
   .eq("id",room.patient_id).eq("organization_id",ORG_ID).maybeSingle();
  if(!patientAllowed(patient))return response(req,{error:"synthetic_patient_required"},403);
  const old=room.progress&&typeof room.progress==="object"&&!Array.isArray(room.progress)?{...room.progress}:{};
  if(release)old.patient_release={released_at:now(),by:"practitioner"};else delete old.patient_release;
  const {data,error}=await db.from("pulse_motion_live_sessions").update({progress:old,updated_at:now()})
   .eq("id",id).eq("updated_at",room.updated_at).select("*").maybeSingle();
  if(error||!data)return response(req,{error:"stale_state_retry"},409);
  return response(req,{ok:true,released:release,session:publicRow(data)});
 }
 if(action==="operator_questionnaire_save"){
  const id=s(b.session_id,50);
  if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data:room,error:roomError}=await db.from("pulse_motion_live_sessions").select("*")
   .eq("id",id).eq("organization_id",ORG_ID).maybeSingle();
  if(roomError||!room)return response(req,{error:"session_not_found"},404);
  if(room.operator_user_id!==actor.id||!room.patient_id)return response(req,{error:"operator_owner_required"},403);
  // The video room may expire, but a completed synthetic report remains editable
  // by its owning Operator for 30 days (no ability to reopen the camera).
  const completedAt=new Date(room.completed_at||room.updated_at).getTime();
  // Intake can start before the operator's iPhone camera is connected.
  if(!["waiting","ready","active","completed"].includes(room.status)||
   room.status!=="completed"&&new Date(room.expires_at).getTime()<=Date.now()||
   room.status==="completed"&&(!Number.isFinite(completedAt)||completedAt<Date.now()-30*86400000))
   return response(req,{error:"room_unavailable"},409);
  const {data:patient}=await db.from("patients").select("data_classification,status")
   .eq("id",room.patient_id).eq("organization_id",ORG_ID).maybeSingle();
  if(!patientAllowed(patient))
   return response(req,{error:"synthetic_patient_required"},403);
  const checked=cleanAnswers(b.answers);
  if(checked.error)return response(req,{error:checked.error},422);
  const cleaned=checked.cleaned as Record<string,string>;
  // Optimistic-retry: the test clock / stage can update the SAME progress JSONB.
  // Reload progress before every attempt and keep tests, signals and check-in fields.
  // Never report success before Postgres confirms all submitted answers were saved.
  for(let attempt=0;attempt<6;attempt++){
   const {data:latest,error:readError}=await db.from("pulse_motion_live_sessions")
    .select("*").eq("id",id).eq("organization_id",ORG_ID)
    .eq("operator_user_id",actor.id).maybeSingle();
   if(readError||!latest)return response(req,{error:"questionnaire_reload_failed"},503);
   if(!["waiting","ready","active","completed"].includes(latest.status)||
     latest.status!=="completed"&&new Date(latest.expires_at).getTime()<=Date.now())
    return response(req,{error:"room_unavailable"},409);
   const prior=latest.progress&&typeof latest.progress==="object"&&!Array.isArray(latest.progress)?
    latest.progress:{};
   // An older browser snapshot must never delete already saved answers.
   const priorAnswers=prior.questionnaire?.answers||{};
   if(Object.keys(priorAnswers).some(key=>!Object.prototype.hasOwnProperty.call(cleaned,key)))
    return response(req,{error:"questionnaire_stale_snapshot"},409);
   const previouslySimulated=prior.questionnaire?.simulated===true||prior.intake_source==="patient_demo_checkin";
   const nextProgress={...prior,questionnaire:{
    ...prior.questionnaire,version:"KOMO_MOTION_SELF_REPORT_V1",
    answers:cleaned,updated_at:now(),entered_by:"operator",
    simulated:previouslySimulated,
    ...(previouslySimulated?{simulation_note:"Réponses du scénario de démonstration"}:{})
   }};
   const {data:saved,error:saveError}=await db.from("pulse_motion_live_sessions")
    .update({progress:nextProgress,updated_at:now()})
    .eq("id",id).eq("organization_id",ORG_ID).eq("operator_user_id",actor.id)
    .eq("updated_at",latest.updated_at).select("*").maybeSingle();
   if(saveError)return response(req,{error:"questionnaire_storage_failed"},503);
   if(saved)return response(req,{ok:true,answered_count:Object.keys(cleaned).length,
    questionnaire_saved_at:saved.progress?.questionnaire?.updated_at||null,
    session:publicRow(saved)});
  }
  return response(req,{error:"questionnaire_conflict_retry"},409);
 }
 if(action==="operator_results_bulk"){
  // Transcription de la feuille de mesures (22/11/2026) : les résultats notés sur papier pendant la consultation
  // sont enregistrés en une fois, après relecture par le praticien. Mêmes bornes et mêmes calculs que la saisie
  // test par test ; si une seule valeur est invalide, rien n'est enregistré. Les tests laissés vides restent à faire,
  // les résultats déjà enregistrés et non renvoyés sont conservés. Possible jusqu'à 7 jours après la création de la
  // consultation (la salle « en direct » expire après 4 h, la feuille peut être transcrite plus tard).
  const id=s(b.session_id,50);
  if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data:room,error:roomError}=await db.from("pulse_motion_live_sessions").select("*")
    .eq("id",id).eq("organization_id",ORG_ID).maybeSingle();
  if(roomError||!room)return response(req,{error:"session_not_found"},404);
  if(room.operator_user_id!==actor.id||!room.patient_id)return response(req,{error:"operator_owner_required"},403);
  if(!["active","completed"].includes(room.status)||!(Date.now()-new Date(room.created_at).getTime()<=7*86400000))
   return response(req,{error:"room_unavailable"},409);
  const {data:patient}=await db.from("patients").select("data_classification,status")
    .eq("id",room.patient_id).eq("organization_id",ORG_ID).maybeSingle();
  if(!patientAllowed(patient))return response(req,{error:"synthetic_patient_required"},403);
  const old=room.progress&&typeof room.progress==="object"&&!Array.isArray(room.progress)?room.progress:{};
  if(!old.safety_confirmed&&b.safety_confirmed!==true)return response(req,{error:"safety_check_required"},422);
  const by=b.transcribed_by===undefined?"practitioner":s(b.transcribed_by,20);
  if(!["practitioner","assistant"].includes(by))return response(req,{error:"invalid_bulk_entry",detail:"transcribed_by"},422);
  const entries=b.entries;
  if(!entries||typeof entries!=="object"||Array.isArray(entries))return response(req,{error:"invalid_bulk_entry"},422);
  const ids=Object.keys(entries);
  const known=(x:string)=>STEPS.includes(x)||COMPLEMENTS.includes(x);
  if(!ids.length||ids.length>STEPS.length+COMPLEMENTS.length||ids.some(x=>!known(x)))
   return response(req,{error:"invalid_bulk_entry",step:ids.find(x=>!known(x))||null},422);
  const bad=(step:string,detail:string)=>response(req,{error:"invalid_bulk_entry",step,detail},422);
  const results=old.results&&typeof old.results==="object"&&!Array.isArray(old.results)?{...old.results}:{};
  const stamp={protocol:PROTOCOL_STAMP.code,protocol_version:PROTOCOL_STAMP.version};
  const at=now();
  for(const step of ids){
   const e=entries[step];
   if(!e||typeof e!=="object"||Array.isArray(e))return bad(step,"invalid_entry");
   // Note absente = note déjà enregistrée conservée (une correction ne l'efface pas).
   const note=e.note===undefined?(typeof results[step]?.note==="string"?results[step].note:""):s(e.note,300);
   if(e.skip_reason!==undefined){
    const reason=s(e.skip_reason,30);
    if(!SKIP_REASONS.includes(reason))return bad(step,"skip_reason_required");
    results[step]={status:"skipped",reason,note,entry_mode:"paper_transcription",...stamp,recorded_at:at};
   }else if(INSTRUMENTED[step]){
    const checked=validateInstrumented(step,e.fields);
    if(!checked)return bad(step,"invalid_fields");
    const vf=STEP_SPEC[step]?.value_field,main=vf?checked.fields[vf]:undefined;
    const photo=COMPLEMENTS.includes(step);
    results[step]={status:"done",fields:checked.fields,derived:checked.derived,
      ...(STEP_SPEC[step]?.method?{method:STEP_SPEC[step].method}:{}),
      ...(typeof main==="number"?{value:main,unit:"seconds"}:{}),
      source:photo?"photo_measurement":"operator_manual_entry",entry_mode:photo?"photo_measurement":"paper_transcription",
      ...(photo?{photo_retained:false}:{}),...stamp,note,recorded_at:at};
   }else if(LIMITS[step]){
    const def=LIMITS[step],value=e.value;
    if(typeof value!=="number"||!Number.isFinite(value)||value<0||value>def.max||
      (def.integer&&!Number.isInteger(value))||(!def.integer&&Math.round(value*10)!==value*10))
     return bad(step,"invalid_value");
    results[step]={status:"done",value,unit:def.unit,note,source:"operator_manual_observation",
      duration_seconds:STEP_SPEC[step]?.duration||0,entry_mode:"paper_transcription",...stamp,recorded_at:at};
   }else return bad(step,"unsupported_step");
  }
  const pending=STEPS.find(x=>!results[x]);
  const progress={...old,results,safety_confirmed:true,step_status:"pending",test_started_at:null,
    protocol:old.protocol||{...PROTOCOL_STAMP,stamped_at:at},
    paper_transcription:{at,by,steps:[...new Set([...(old.paper_transcription?.steps||[]),...ids])]}};
  const {data,error}=await db.from("pulse_motion_live_sessions").update({
    status:pending?"active":"completed",stage_code:pending||"finished",
    step_index:pending?STEPS.indexOf(pending):STEPS.length,completed_at:pending?null:at,progress,updated_at:at
  }).eq("id",id).eq("updated_at",room.updated_at).select("*").maybeSingle();
  return error||!data?response(req,{error:"stale_state_retry"},409):
   response(req,{ok:true,saved:ids.length,remaining:STEPS.filter(x=>!results[x]).length,session:publicRow(data)});
 }
 if(action==="operator_tests_init"||action==="operator_test_update"||action==="operator_test_goto"){
  const id=s(b.session_id,50);
  if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data:room,error:roomError}=await db.from("pulse_motion_live_sessions").select("*")
    .eq("id",id).eq("organization_id",ORG_ID).maybeSingle();
  if(roomError||!room)return response(req,{error:"session_not_found"},404);
  if(room.operator_user_id!==actor.id||!room.patient_id)return response(req,{error:"operator_owner_required"},403);
  // Une consultation terminée peut être rouverte pour corriger un test, tant que la salle n'a pas expiré.
  const reopening=action==="operator_test_goto"&&room.status==="completed";
  if((room.status!=="active"&&!reopening)||new Date(room.expires_at).getTime()<=Date.now())
   return response(req,{error:"room_unavailable"},409);
  const {data:patient}=await db.from("patients").select("data_classification,status")
    .eq("id",room.patient_id).eq("organization_id",ORG_ID).maybeSingle();
  if(!patientAllowed(patient))
   return response(req,{error:"synthetic_patient_required"},403);
  const old=room.progress&&typeof room.progress==="object"&&!Array.isArray(room.progress)?room.progress:{};
  if(action==="operator_tests_init"){
   if(STEPS.includes(room.stage_code)&&old.protocol)return response(req,{ok:true,session:publicRow(room)});
   if(STEPS.includes(room.stage_code)){
    // Session préparée avant la standardisation : on y appose le protocole sans toucher aux résultats.
    const {data,error}=await db.from("pulse_motion_live_sessions").update({
      progress:{...old,protocol:{...PROTOCOL_STAMP,stamped_at:now()}},updated_at:now()
    }).eq("id",id).eq("updated_at",room.updated_at).select("*").maybeSingle();
    return error||!data?response(req,{ok:true,session:publicRow(room)}):response(req,{ok:true,session:publicRow(data)});
   }
   const progress={...old,step_status:"pending",results:old.results||{},safety_confirmed:!!old.safety_confirmed,
    protocol:old.protocol||{...PROTOCOL_STAMP,stamped_at:now()}};
   const {data,error}=await db.from("pulse_motion_live_sessions").update({
     stage_code:STEPS[0],step_index:0,progress,updated_at:now()
   }).eq("id",id).eq("status","active").eq("step_index",room.step_index).select("*").maybeSingle();
   return error||!data?response(req,{error:"initialization_conflict"},409):response(req,{ok:true,session:publicRow(data)});
  }
  const step=s(b.step_code,35),event=s(b.event,15);
  if(action==="operator_test_goto"){
   // Navigation libre : revenir corriger un test ou en reporter un. Les résultats déjà saisis restent
   // en place jusqu'à leur remplacement ; un chronomètre en cours est simplement abandonné.
   const done=old.results&&typeof old.results==="object"?old.results:{};
   if(step==="finished"){
    // Correction annulée : la consultation redevient terminée si les 13 tests ont un résultat.
    if(!STEPS.every(id=>done[id]))return response(req,{error:"tests_incomplete"},409);
    const {data,error}=await db.from("pulse_motion_live_sessions").update({
      status:"completed",stage_code:"finished",step_index:STEPS.length,completed_at:now(),
      progress:{...old,step_status:"pending",test_started_at:null},updated_at:now()
    }).eq("id",id).eq("updated_at",room.updated_at).select("*").maybeSingle();
    return error||!data?response(req,{error:"stale_state_retry"},409):response(req,{ok:true,session:publicRow(data)});
   }
   if(!STEPS.includes(step))return response(req,{error:"wrong_test_step"},409);
   if(room.stage_code===step&&room.status==="active")return response(req,{ok:true,session:publicRow(room)});
   const {data,error}=await db.from("pulse_motion_live_sessions").update({
     status:"active",stage_code:step,step_index:STEPS.indexOf(step),completed_at:null,
     progress:{...old,step_status:"pending",test_started_at:null},updated_at:now()
   }).eq("id",id).eq("updated_at",room.updated_at).select("*").maybeSingle();
   return error||!data?response(req,{error:"stale_state_retry"},409):response(req,{ok:true,session:publicRow(data)});
  }
  if(!STEPS.includes(step)||room.stage_code!==step)
   return response(req,{error:"wrong_test_step"},409);
  if(!["start","restart","save","skip"].includes(event))return response(req,{error:"invalid_action"},422);
  // Sécurité confirmée une fois par consultation, quel que soit le premier test réalisé.
  if(!old.safety_confirmed&&b.safety_confirmed!==true)
   return response(req,{error:"safety_check_required"},422);
  const safety=!!old.safety_confirmed||b.safety_confirmed===true;
  // Explicit duration follows the CURRENT client protocol. Previous 20 s
  // implementations remain labeled 20 s when no duration was supplied.
  const starting=["start","restart"].includes(event);
  const protocolDuration:number=STEP_SPEC[step]?.duration||0;
  // The duration can change only when starting a new test, never at result save.
  if(starting&&b.duration_seconds!==undefined&&b.duration_seconds!==protocolDuration)
   return response(req,{error:"invalid_test_duration"},422);
  const results=old.results&&typeof old.results==="object"&&!Array.isArray(old.results)?{...old.results}:{};
  const note=s(b.note,300);
  const skipReason=s(b.skip_reason,30);
  if(event==="skip"&&!SKIP_REASONS.includes(skipReason))return response(req,{error:"skip_reason_required"},422);
  const stamp={protocol:PROTOCOL_STAMP.code,protocol_version:PROTOCOL_STAMP.version};
  let next=room.step_index,status="active",stage=step,finished:null|string=null;
  let progress:any={...old,results,safety_confirmed:safety,step_status:["start","restart"].includes(event)?"running":"pending",
   test_started_at:["start","restart"].includes(event)?now():null,
   test_duration_seconds:["start","restart"].includes(event)?protocolDuration:old.test_duration_seconds??protocolDuration};
  if(event==="start"||event==="restart"){
   if(event==="start"&&old.step_status==="running")return response(req,{ok:true,session:publicRow(room)});
   if(event==="restart"&&old.step_status!=="running")return response(req,{error:"test_not_started"},409);
  }else{
   if(event==="save"){
    if(old.step_status!=="running")return response(req,{error:"test_not_started"},409);
    if(INSTRUMENTED[step]){
     const checked=validateInstrumented(step,b.fields);
     if(!checked||b.measurement_source!=="operator_manual_entry")
      return response(req,{error:"invalid_instrumented_entry"},422);
     // Valeur principale (ex. durée tenue sur un pied) recopiée en value : passeport, trajectoire et plan la lisent.
     const vf=STEP_SPEC[step]?.value_field,main=vf?checked.fields[vf]:undefined;
     results[step]={status:"done",fields:checked.fields,derived:checked.derived,
       ...(STEP_SPEC[step]?.method?{method:STEP_SPEC[step].method}:{}),
       ...(typeof main==="number"?{value:main,unit:"seconds"}:{}),
       source:"operator_manual_entry",...stamp,note,recorded_at:now()};
    }else if(step==="two_step"){
     const attempts=b.attempts_cm;
     if(!Array.isArray(attempts)||attempts.length!==2||
       attempts.some((x:unknown)=>typeof x!=="number"||!Number.isFinite(x)||x<1||x>TWO_STEP_MAX||
         Math.round(x*10)!==x*10))
       return response(req,{error:"invalid_two_step_attempts"},422);
     const best=Math.max(...attempts);
     const height=b.height_cm;
     if(height!==undefined&&(typeof height!=="number"||!Number.isFinite(height)||
       height<100||height>230||Math.round(height*10)!==height*10))
       return response(req,{error:"invalid_height_cm"},422);
     if(b.value!==best||b.measurement_source!=="operator_manual_observation")
       return response(req,{error:"two_step_requires_manual_best_attempt"},422);
     results[step]={status:"done",value:best,unit:"cm",source:"operator_manual_observation",
       attempts_cm:attempts,height_cm:height??null,
       two_step_index:height?Math.round(best/height*1000)/1000:null,
       note,method:"TWO_STEP_TWO_TRIALS_OPERATOR_V1",...stamp,recorded_at:now()};
    }else if(step==="posture"){
     const observation=s(b.observation,30);
     if(!POSTURE_OPTIONS.includes(observation))
      return response(req,{error:"invalid_posture_observation"},422);
     results[step]={status:"done",observation,note,source:"operator_visual_observation",...stamp,recorded_at:now()};
    }else{
     const def=LIMITS[step],value=b.value;
     if(!def||typeof value!=="number"||!Number.isFinite(value)||value<0||value>def.max||
       (def.integer&&!Number.isInteger(value))||(!def.integer&&Math.round(value*10)!==value*10))
      return response(req,{error:"invalid_manual_measurement"},422);
     const measurementSource=s(b.measurement_source,60)||"operator_manual_observation";
     if(!["operator_manual_observation","operator_confirmed_video_estimate"].includes(measurementSource))
      return response(req,{error:"invalid_measurement_source"},422);
     const balanceMeta=(step==="unipodal_left"||step==="unipodal_right")?
       {
        method:"SOLEO_EYES_OPEN_30S_OPERATOR_SUPERVISED_V1",
        camera_quality:measurementSource==="operator_confirmed_video_estimate"&&
         Number.isInteger(b.measurement_quality)&&b.measurement_quality>=0&&b.measurement_quality<=100?
          b.measurement_quality:null,
        stop_reason:measurementSource==="operator_confirmed_video_estimate"&&
         ["foot_contact","limit","camera_lost","ambiguous_contact","operator_end"].includes(b.stop_reason)?
         b.stop_reason:null,
        ceiling_30s:value===30
       }:{};
     results[step]={status:"done",value,unit:def.unit,note,source:measurementSource,
      duration_seconds:old.test_duration_seconds??protocolDuration,
      ...balanceMeta,...stamp,recorded_at:now()};
    }
   }else results[step]={status:"skipped",reason:skipReason,note,...stamp,recorded_at:now()};
   // Suivant = premier test sans résultat après celui-ci, puis depuis le début (ordre libre).
   const from=STEPS.indexOf(step);
   const pending=[...STEPS.slice(from+1),...STEPS.slice(0,from)].find(id=>!results[id]);
   if(!pending){status="completed";stage="finished";next=STEPS.length;finished=now();}
   else{stage=pending;next=STEPS.indexOf(pending);}
  }
  const {data,error}=await db.from("pulse_motion_live_sessions").update({
   status,stage_code:stage,step_index:next,progress,updated_at:now(),
   ...(finished?{completed_at:finished}:{})
  }).eq("id",id).eq("status","active").eq("stage_code",step).eq("step_index",room.step_index)
    .eq("updated_at",room.updated_at).select("*").maybeSingle();
  return error||!data?response(req,{error:"stale_state_retry"},409):response(req,{ok:true,session:publicRow(data)});
 }
 if(action==="operator_list"){
  // Historical completed *synthetic* consultations remain available for 30 days.
  // Camera signaling stays ephemeral. Never revive WebRTC sessions or guest tokens.
  await db.from("pulse_motion_live_signals").delete().lt("created_at",new Date(Date.now()-3*3600000).toISOString());
  const old24=new Date(Date.now()-24*3600000).toISOString();
  const old30=new Date(Date.now()-30*86400000).toISOString();
  const production=center?.clinical_data_status==="production_enabled";
  // Purge ONLY fictitious rehearsal rooms of THIS test centre. Real dossiers are never purged here.
  if(!production)await Promise.all([
   db.from("pulse_motion_live_sessions").delete().eq("organization_id",ORG_ID).lt("expires_at",old24).neq("status","completed"),
   db.from("pulse_motion_live_sessions").delete().eq("organization_id",ORG_ID).lt("completed_at",old30).eq("status","completed")
  ]);
  const fields="id,display_code,status,stage_code,step_index,progress,patient_id,operator_session_id,operator_user_id,patient_last_seen_at,created_at,updated_at";
  const [current,history]=await Promise.all([
   db.from("pulse_motion_live_sessions").select(fields).eq("organization_id",ORG_ID)
    .eq("operator_user_id",actor.id).gte("expires_at",now())
    .order("created_at",{ascending:false}).limit(60),
   db.from("pulse_motion_live_sessions").select(fields).eq("organization_id",ORG_ID)
    .eq("operator_user_id",actor.id).eq("status","completed").gte("completed_at",production?"2000-01-01T00:00:00Z":old30)
    .order("created_at",{ascending:false}).limit(60)
  ]);
  if(current.error||history.error)return response(req,{error:"list_failed"},503);
  const unique=new Map<string,Record<string,unknown>>();
  for(const item of [...(current.data||[]),...(history.data||[])])unique.set(item.id,item);
  const sessions=[...unique.values()].sort((a,b)=>
   new Date(String(b.created_at)).getTime()-new Date(String(a.created_at)).getTime()).slice(0,60);
  return response(req,{ok:true,sessions:sessions.map(publicRow),steps:STEPS,
   center:{id:ORG_ID,clinical_data_status:center?.clinical_data_status}});
 }
 // Trajectory J0 → S6 → S12: every completed consultation of ONE patient in this centre.
 if(action==="operator_patient_history"){
  const patientId=s(b.patient_id,50);
  if(!uuid(patientId))return response(req,{error:"invalid_identifiers"},422);
  const {data:patient}=await db.from("patients").select("id,data_classification,status")
   .eq("id",patientId).eq("organization_id",ORG_ID).maybeSingle();
  if(!patientAllowed(patient))return response(req,{error:"synthetic_patient_required"},403);
  const {data,error}=await db.from("pulse_motion_live_sessions")
   .select("id,display_code,status,stage_code,step_index,progress,patient_id,operator_session_id,operator_user_id,patient_last_seen_at,created_at,updated_at,completed_at")
   .eq("organization_id",ORG_ID).eq("patient_id",patientId).eq("status","completed")
   .order("completed_at",{ascending:true}).limit(24);
  if(error)return response(req,{error:"history_unavailable"},503);
  return response(req,{ok:true,sessions:(data||[]).map((x:any)=>({...publicRow(x),completed_at:x.completed_at}))});
 }
 if(action==="operator_attach"){
  const id=s(b.session_id,50),patientId=s(b.patient_id,50),opId=s(b.operator_session_id,50);
  if(!uuid(id)||!uuid(patientId)||!uuid(opId))return response(req,{error:"invalid_identifiers"},422);
  const [{data:patient},{data:op},{data:room}]=await Promise.all([
   db.from("patients").select("id,organization_id,status,data_classification").eq("id",patientId).maybeSingle(),
   db.from("pulse_operator_sessions").select("id,patient_id,operator_user_id,organization_id,status").eq("id",opId).maybeSingle(),
   db.from("pulse_motion_live_sessions").select("id,status,patient_id,expires_at,operator_user_id,progress").eq("id",id).eq("organization_id",ORG_ID).maybeSingle()
  ]);
  if(!patient||patient.organization_id!==ORG_ID||!patientAllowed(patient))return response(req,{error:"synthetic_patient_required"},403);
  if(!op||op.patient_id!==patientId||op.organization_id!==ORG_ID||(!["running","draft","paused"].includes(op.status)))return response(req,{error:"operator_session_mismatch"},409);
  if(actor.role!=="admin"&&op.operator_user_id!==actor.id)return response(req,{error:"operator_owner_required"},403);
  if(!room||room.patient_id||!["waiting","ready"].includes(room.status)||new Date(room.expires_at).getTime()<Date.now())return response(req,{error:"room_unavailable"},409);
  // A camera created from an Operator's iPhone may be paired ONLY by that same owner.
  if(room.operator_user_id&&room.operator_user_id!==actor.id)return response(req,{error:"camera_owner_required"},403);
  const checkinId=s(b.checkin_id,50);
  let initialProgress:Record<string,unknown>|null=null;
  if(checkinId){
   if(!uuid(checkinId))return response(req,{error:"invalid_checkin"},422);
   const {data:checkin}=await db.from("pulse_motion_live_sessions").select("id,progress,patient_id,operator_user_id")
    .eq("id",checkinId).eq("organization_id",ORG_ID).maybeSingle();
   if(!checkin||checkin.patient_id!==patientId||checkin.operator_user_id!==actor.id||
     checkin.progress?.patient_checkin?.state!=="accepted"||checkin.progress?.kind!=="patient_checkin")
    return response(req,{error:"checkin_mismatch"},403);
   initialProgress={...(room.progress||{}),
    intake_source:"patient_demo_checkin",checkin_id:checkin.id,
    questionnaire:{version:"KOMO_MOTION_SELF_REPORT_V1",simulated:true,
      entered_by:"patient_demo_checkin",answers:{
       ageBand:checkin.progress.patient_checkin.age_band,
       goal:checkin.progress.patient_checkin.goal
      },updated_at:now()}};
  }
  const {data,error}=await db.from("pulse_motion_live_sessions").update({
   patient_id:patientId,operator_session_id:opId,operator_user_id:actor.id,status:"active",
   ...(initialProgress?{progress:initialProgress}:{}),
   operator_last_seen_at:now(),updated_at:now()
  }).eq("id",id).is("patient_id",null).in("status",["waiting","ready"]).select("id").maybeSingle();
  return error||!data?response(req,{error:"attach_conflict"},409):response(req,{ok:true,id});
 }
 if(action==="operator_close"){
  const id=s(b.session_id,50);if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data,error}=await db.from("pulse_motion_live_sessions").update({status:"closed",completed_at:now(),updated_at:now()})
   .eq("id",id).eq("organization_id",ORG_ID).eq("operator_user_id",actor.id).select("id").maybeSingle();
  if(error||!data)return response(req,{error:"close_failed"},409);
  await db.from("pulse_motion_live_signals").delete().eq("session_id",id);
  return response(req,{ok:true});
 }
 return response(req,{error:"unknown_action"},400);
});

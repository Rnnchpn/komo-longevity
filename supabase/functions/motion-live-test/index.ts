import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")||"";
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const db=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false}});
const ORG_ID="cea48f94-24ae-4ddb-ac28-ac289bb1e9ca"; // KŌMØ Cannes, test_only
// Align the supervised remote consultation with the six existing Motion Online tests.
const STEPS=["sts","heels","unipodal_left","unipodal_right","arms","posture"];
const LIMITS:Record<string,{max:number;integer:boolean;unit:string}>={
 sts:{max:100,integer:true,unit:"repetitions"},
 heels:{max:100,integer:true,unit:"repetitions"},
 unipodal_left:{max:30,integer:false,unit:"seconds"},
 unipodal_right:{max:30,integer:false,unit:"seconds"},
 arms:{max:100,integer:true,unit:"movements"}
};
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
async function testCenter(){
 const {data,error}=await db.from("organizations").select("id,status,clinical_data_status").eq("id",ORG_ID).maybeSingle();
 return !error&&data?.status==="active"&&data?.clinical_data_status==="test_only";
}
async function operator(req:Request){
 const jwt=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(!jwt||jwt===req.headers.get("apikey"))return null;
 const {data,error}=await db.auth.getUser(jwt);
 const user=data?.user;if(error||!user)return null;
 const [{data:role},{data:member}]=await Promise.all([
  db.from("account_roles").select("role").eq("user_id",user.id).maybeSingle(),
  db.from("organization_members").select("role,status").eq("user_id",user.id).eq("organization_id",ORG_ID).eq("status","active").maybeSingle()
 ]);
 if(!["admin","professional"].includes(role?.role||""))return null;
 if(!member||!["owner","clinical_admin","physician","operator","coordinator"].includes(member.role))return null;
 return {id:user.id,role:role.role};
}
function publicRow(x:any){
 return {id:x.id,display_code:x.display_code,status:x.status,stage_code:x.stage_code,
  step_index:x.step_index,progress:x.progress||{},patient_id:x.patient_id,
  operator_session_id:x.operator_session_id,operator_user_id:x.operator_user_id,patient_last_seen_at:x.patient_last_seen_at,
  created_at:x.created_at,updated_at:x.updated_at};
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
 if(!await testCenter())return response(req,{error:"test_environment_only"},423);

 // Appointment-free, account-free CHECK-IN for a clinician-issued one-time invitation.
 // Restricted to synthetic identity aliases in this non-clinical test environment.
 // The invitation token is random (256-bit), its database copy is SHA-256 hashed.
 // Patient phone/tablet NEVER requests a camera or controls the clinical tests.
 if(action==="patient_checkin_status"||action==="patient_checkin_submit"){
  const found=await guestLookup(req,b);if(found.error)return found.error;
  const room=found.session,progress=room.progress||{},record=progress.patient_checkin;
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
  if(room.status!=="active"||!room.operator_user_id)return response(req,{error:"operator_not_connected"},409);
  if(action==="guest_signal_pull")return pullSignals(req,room.id,"operator",b.since);
  return pushSignal(req,room.id,"guest",b);
 }

 if(action==="guest_status"||action==="guest_event"){
  const result=await guestLookup(req,b);if(result.error)return result.error;
  const x=result.session;
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

 const actor=await operator(req);
 if(!actor)return response(req,{error:"operator_access_required"},403);
 // Operator creates the short-lived check-in invitation on the workstation,
 // not an anonymously enumerable public patient register.
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
  if(!patient||patient.status!=="active"||patient.data_classification!=="synthetic"||
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
 // Physical consultation: the clinician's OWN iPhone acts as a dedicated camera.
 // A valid Operator JWT is required even to create the room. Only fictional patients
 // can subsequently be linked in this test-only environment.
 if(action==="operator_camera_start"){
  const {count,error:countError}=await db.from("pulse_motion_live_sessions").select("id",{head:true,count:"exact"})
   .eq("organization_id",ORG_ID).eq("operator_user_id",actor.id).in("status",["ready","active"])
   .contains("progress",{camera_owner:"operator"}).gte("expires_at",now());
  if(countError)return response(req,{error:"temporarily_unavailable"},503);
  if((count||0)>=6)return response(req,{error:"too_many_active_cameras"},429);
  const guestToken=randomToken();
  const displayCode=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,"0");
  const {data,error}=await db.from("pulse_motion_live_sessions").insert({
   organization_id:ORG_ID,guest_token_hash:await hash(guestToken),display_code:displayCode,
   operator_user_id:actor.id,status:"ready",stage_code:STEPS[0],step_index:0,
   progress:{step_status:"pending",results:{},camera_owner:"operator"},
   patient_last_seen_at:now()
  }).select("id,display_code,status,expires_at,stage_code,step_index,progress").single();
  if(error)return response(req,{error:"camera_creation_failed"},503);
  return response(req,{ok:true,...data,guest_token:guestToken,steps:STEPS});
 }
 if(action==="operator_camera_stop"){
  const id=s(b.session_id,50);
  if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data,error}=await db.from("pulse_motion_live_sessions").update({
   status:"closed",completed_at:now(),updated_at:now()
  }).eq("id",id).eq("organization_id",ORG_ID).eq("operator_user_id",actor.id)
   .in("status",["ready","active"]).select("id").maybeSingle();
  if(error||!data)return response(req,{error:"camera_close_failed"},409);
  await db.from("pulse_motion_live_signals").delete().eq("session_id",id);
  return response(req,{ok:true});
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
  if(!["active","completed"].includes(room.status)||
   room.status==="active"&&new Date(room.expires_at).getTime()<=Date.now()||
   room.status==="completed"&&(!Number.isFinite(completedAt)||completedAt<Date.now()-30*86400000))
   return response(req,{error:"room_unavailable"},409);
  const {data:patient}=await db.from("patients").select("data_classification,status")
   .eq("id",room.patient_id).eq("organization_id",ORG_ID).maybeSingle();
  if(!patient||patient.status!=="active"||patient.data_classification!=="synthetic")
   return response(req,{error:"synthetic_patient_required"},403);
  const answers=b.answers;
  if(!answers||typeof answers!=="object"||Array.isArray(answers))
   return response(req,{error:"invalid_questionnaire"},422);
  // 22 original self-report items from online/session/intake-model.mjs.
  const profile:Record<string,string[]>={
   ageBand:["under40","40-49","50-59","60-69","70-79","80plus","undisclosed"],
   goal:["independence","walk","strength","confidence","general"]
  };
  const rating=new Set(["walk10","stairs","chair","carry","bend","obstacle","turn","stand",
   "pain","fatigue","fear","avoid","sleep","stress","recovered","qol",
   "walkingDays","strengthDays","outdoors","breaks"]);
  const entries=Object.entries(answers);
  if(entries.length>22)return response(req,{error:"questionnaire_too_large"},422);
  const cleaned:Record<string,string>={};
  for(const [key,value] of entries){
   if(typeof value!=="string"||value.length>30)return response(req,{error:"invalid_answer"},422);
   if(profile[key]){
    if(!profile[key].includes(value))return response(req,{error:"invalid_answer"},422);
   }else if(rating.has(key)){
    if(!["0","1","2","3","4"].includes(value))return response(req,{error:"invalid_answer"},422);
   }else return response(req,{error:"unknown_question"},422);
   cleaned[key]=value;
  }
  // Optimistic-retry: the test clock / stage can update the SAME progress JSONB.
  // Reload progress before every attempt and keep tests, signals and check-in fields.
  // Never report success before Postgres confirms all submitted answers were saved.
  for(let attempt=0;attempt<6;attempt++){
   const {data:latest,error:readError}=await db.from("pulse_motion_live_sessions")
    .select("*").eq("id",id).eq("organization_id",ORG_ID)
    .eq("operator_user_id",actor.id).maybeSingle();
   if(readError||!latest)return response(req,{error:"questionnaire_reload_failed"},503);
   if(latest.status!=="active"&&latest.status!=="completed")
    return response(req,{error:"room_unavailable"},409);
   const prior=latest.progress&&typeof latest.progress==="object"&&!Array.isArray(latest.progress)?
    latest.progress:{};
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
 if(action==="operator_tests_init"||action==="operator_test_update"){
  const id=s(b.session_id,50);
  if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data:room,error:roomError}=await db.from("pulse_motion_live_sessions").select("*")
    .eq("id",id).eq("organization_id",ORG_ID).maybeSingle();
  if(roomError||!room)return response(req,{error:"session_not_found"},404);
  if(room.operator_user_id!==actor.id||!room.patient_id)return response(req,{error:"operator_owner_required"},403);
  if(room.status!=="active"||new Date(room.expires_at).getTime()<=Date.now())
   return response(req,{error:"room_unavailable"},409);
  const {data:patient}=await db.from("patients").select("data_classification,status")
    .eq("id",room.patient_id).eq("organization_id",ORG_ID).maybeSingle();
  if(!patient||patient.status!=="active"||patient.data_classification!=="synthetic")
   return response(req,{error:"synthetic_patient_required"},403);
  const old=room.progress&&typeof room.progress==="object"&&!Array.isArray(room.progress)?room.progress:{};
  if(action==="operator_tests_init"){
   if(STEPS.includes(room.stage_code))return response(req,{ok:true,session:publicRow(room)});
   const progress={...old,step_status:"pending",results:old.results||{},safety_confirmed:!!old.safety_confirmed};
   const {data,error}=await db.from("pulse_motion_live_sessions").update({
     stage_code:STEPS[0],step_index:0,progress,updated_at:now()
   }).eq("id",id).eq("status","active").eq("step_index",room.step_index).select("*").maybeSingle();
   return error||!data?response(req,{error:"initialization_conflict"},409):response(req,{ok:true,session:publicRow(data)});
  }
  const step=s(b.step_code,35),event=s(b.event,15);
  if(!STEPS.includes(step)||room.stage_code!==step||room.step_index!==STEPS.indexOf(step))
   return response(req,{error:"wrong_test_step"},409);
  if(!["start","restart","save","skip"].includes(event))return response(req,{error:"invalid_action"},422);
  if(room.step_index===0&&!old.safety_confirmed&&b.safety_confirmed!==true)
   return response(req,{error:"safety_check_required"},422);
  const safety=!!old.safety_confirmed||b.safety_confirmed===true;
  // Explicit duration follows the CURRENT client protocol. Previous 20 s
  // implementations remain labeled 20 s when no duration was supplied.
  const protocolDuration=step==="posture"?0:
   (step==="heels"||step==="arms")?(b.duration_seconds===30?30:20):30;
  if(b.duration_seconds!==undefined&&b.duration_seconds!==protocolDuration)
   return response(req,{error:"invalid_test_duration"},422);
  const results=old.results&&typeof old.results==="object"&&!Array.isArray(old.results)?{...old.results}:{};
  const note=s(b.note,300);
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
    if(step==="posture"){
     const observation=s(b.observation,30);
     if(!["neutral","apparent_offset","not_interpretable"].includes(observation))
      return response(req,{error:"invalid_posture_observation"},422);
     results[step]={status:"done",observation,note,source:"operator_visual_observation",recorded_at:now()};
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
        protocol:"SOLEO_EYES_OPEN_30S_OPERATOR_SUPERVISED_V1",
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
      ...balanceMeta,recorded_at:now()};
    }
   }else results[step]={status:"skipped",note,recorded_at:now()};
   next=room.step_index+1;
   if(next>=STEPS.length){status="completed";stage="finished";finished=now();}
   else stage=STEPS[next];
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
  await Promise.all([
   db.from("pulse_motion_live_sessions").delete().lt("expires_at",old24).neq("status","completed"),
   db.from("pulse_motion_live_sessions").delete().lt("completed_at",old30).eq("status","completed")
  ]);
  const fields="id,display_code,status,stage_code,step_index,progress,patient_id,operator_session_id,operator_user_id,patient_last_seen_at,created_at,updated_at";
  const [current,history]=await Promise.all([
   db.from("pulse_motion_live_sessions").select(fields).eq("organization_id",ORG_ID)
    .eq("operator_user_id",actor.id).gte("expires_at",now())
    .order("created_at",{ascending:false}).limit(60),
   db.from("pulse_motion_live_sessions").select(fields).eq("organization_id",ORG_ID)
    .eq("operator_user_id",actor.id).eq("status","completed").gte("completed_at",old30)
    .order("created_at",{ascending:false}).limit(60)
  ]);
  if(current.error||history.error)return response(req,{error:"list_failed"},503);
  const unique=new Map<string,Record<string,unknown>>();
  for(const item of [...(current.data||[]),...(history.data||[])])unique.set(item.id,item);
  const sessions=[...unique.values()].sort((a,b)=>
   new Date(String(b.created_at)).getTime()-new Date(String(a.created_at)).getTime()).slice(0,60);
  return response(req,{ok:true,sessions:sessions.map(publicRow),steps:STEPS});
 }
 if(action==="operator_attach"){
  const id=s(b.session_id,50),patientId=s(b.patient_id,50),opId=s(b.operator_session_id,50);
  if(!uuid(id)||!uuid(patientId)||!uuid(opId))return response(req,{error:"invalid_identifiers"},422);
  const [{data:patient},{data:op},{data:room}]=await Promise.all([
   db.from("patients").select("id,organization_id,status,data_classification").eq("id",patientId).maybeSingle(),
   db.from("pulse_operator_sessions").select("id,patient_id,operator_user_id,organization_id,status").eq("id",opId).maybeSingle(),
   db.from("pulse_motion_live_sessions").select("id,status,patient_id,expires_at,operator_user_id,progress").eq("id",id).eq("organization_id",ORG_ID).maybeSingle()
  ]);
  if(!patient||patient.organization_id!==ORG_ID||patient.status!=="active"||patient.data_classification!=="synthetic")return response(req,{error:"synthetic_patient_required"},403);
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

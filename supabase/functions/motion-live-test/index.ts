import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")||"";
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const db=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false}});
const ORG_ID="cea48f94-24ae-4ddb-ac28-ac289bb1e9ca"; // KŌMØ Cannes, test_only
const STEPS=["preflight","readiness","smartspeed_10m","forcedecks_quiet_stand","humantrak_mobility","dynamo_grip","forcedecks_sts","qc_release"];
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

 if(action==="guest_start"){
  const {count,error:countError}=await db.from("pulse_motion_live_sessions").select("id",{head:true,count:"exact"})
   .eq("organization_id",ORG_ID).gte("created_at",new Date(Date.now()-5*60000).toISOString());
  if(countError)return response(req,{error:"temporarily_unavailable"},503);
  if((count||0)>=40)return response(req,{error:"session_limit_reached"},429);
  const guestToken=randomToken();
  const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,"0");
  const {data,error}=await db.from("pulse_motion_live_sessions").insert({
   organization_id:ORG_ID,guest_token_hash:await hash(guestToken),display_code:code,
   status:"waiting",stage_code:"preflight",step_index:0,progress:{step_status:"pending"},
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
   return response(req,{ok:true,session:{display_code:x.display_code,status:x.status,
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
  if(x.status!=="active")return response(req,{error:"operator_not_connected"},409);
  if(!["start","complete"].includes(event)||stage!==STEPS[x.step_index])return response(req,{error:"invalid_step"},422);
  let progress=x.progress||{},next=x.step_index,nextStage=stage,status="active",completedAt:null|string=null;
  if(event==="complete"){
   next=Math.min(STEPS.length,next+1);nextStage=STEPS[next]||"finished";
   progress={...progress,step_status:"pending",completed_steps:[...new Set([...(Array.isArray(progress.completed_steps)?progress.completed_steps:[]),stage])]};
   if(next===STEPS.length){status="completed";completedAt=now();}
  }else progress={...progress,step_status:"running"};
  const {data,error}=await db.from("pulse_motion_live_sessions").update({
   status,stage_code:nextStage,step_index:next,progress,patient_last_seen_at:now(),
   updated_at:now(),...(completedAt?{completed_at:completedAt}:{})
  }).eq("id",x.id).eq("status","active").eq("step_index",x.step_index).select("id").maybeSingle();
  if(error||!data)return response(req,{error:"stale_state_retry"},409);
  return response(req,{ok:true,status,stage_code:nextStage,step_index:next});
 }

 const actor=await operator(req);
 if(!actor)return response(req,{error:"operator_access_required"},403);
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
 if(action==="operator_list"){
  // Housekeep old SDP/candidates; no raw video is ever stored.
  await db.from("pulse_motion_live_signals").delete().lt("created_at",new Date(Date.now()-3*3600000).toISOString());
  await db.from("pulse_motion_live_sessions").delete().lt("expires_at",new Date(Date.now()-24*3600000).toISOString());
  const {data,error}=await db.from("pulse_motion_live_sessions").select("id,display_code,status,stage_code,step_index,progress,patient_id,operator_session_id,operator_user_id,patient_last_seen_at,created_at,updated_at")
   .eq("organization_id",ORG_ID).gte("expires_at",now()).order("created_at",{ascending:false}).limit(60);
  return error?response(req,{error:"list_failed"},503):response(req,{ok:true,sessions:(data||[]).map(publicRow),steps:STEPS});
 }
 if(action==="operator_attach"){
  const id=s(b.session_id,50),patientId=s(b.patient_id,50),opId=s(b.operator_session_id,50);
  if(!uuid(id)||!uuid(patientId)||!uuid(opId))return response(req,{error:"invalid_identifiers"},422);
  const [{data:patient},{data:op},{data:room}]=await Promise.all([
   db.from("patients").select("id,organization_id,status,data_classification").eq("id",patientId).maybeSingle(),
   db.from("pulse_operator_sessions").select("id,patient_id,operator_user_id,organization_id,status").eq("id",opId).maybeSingle(),
   db.from("pulse_motion_live_sessions").select("id,status,patient_id,expires_at").eq("id",id).eq("organization_id",ORG_ID).maybeSingle()
  ]);
  if(!patient||patient.organization_id!==ORG_ID||patient.status!=="active"||patient.data_classification!=="synthetic")return response(req,{error:"synthetic_patient_required"},403);
  if(!op||op.patient_id!==patientId||op.organization_id!==ORG_ID||(!["running","draft","paused"].includes(op.status)))return response(req,{error:"operator_session_mismatch"},409);
  if(actor.role!=="admin"&&op.operator_user_id!==actor.id)return response(req,{error:"operator_owner_required"},403);
  if(!room||room.patient_id||!["waiting","ready"].includes(room.status)||new Date(room.expires_at).getTime()<Date.now())return response(req,{error:"room_unavailable"},409);
  const {data,error}=await db.from("pulse_motion_live_sessions").update({
   patient_id:patientId,operator_session_id:opId,operator_user_id:actor.id,status:"active",
   operator_last_seen_at:now(),updated_at:now()
  }).eq("id",id).is("patient_id",null).in("status",["waiting","ready"]).select("id").maybeSingle();
  return error||!data?response(req,{error:"attach_conflict"},409):response(req,{ok:true,id});
 }
 if(action==="operator_close"){
  const id=s(b.session_id,50);if(!uuid(id))return response(req,{error:"invalid_session"},422);
  const {data,error}=await db.from("pulse_motion_live_sessions").update({status:"closed",completed_at:now(),updated_at:now()})
   .eq("id",id).eq("organization_id",ORG_ID).select("id").maybeSingle();
  if(error||!data)return response(req,{error:"close_failed"},409);
  await db.from("pulse_motion_live_signals").delete().eq("session_id",id);
  return response(req,{ok:true});
 }
 return response(req,{error:"unknown_action"},400);
});

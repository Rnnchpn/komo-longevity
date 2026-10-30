// Supabase Edge Function: Stripe-paid KŌMØ Motion Online session persistence.
// All writes occur exclusively here with a verified Supabase user and
// rechecked current Stripe payment. No photos, video, audio, or Pose landmarks.
const ORIGIN='https://pulse.komolongevity.com';
const ONLINE_VERIFY=ORIGIN+'/api/pulse-online-stripe-verify';
const CONSENT='KOMO_MOTION_ONLINE_CONSENT_V1';
const TABLE='motion_online_stripe_sessions';
const TEST_IDS=new Set(['sts','heels','unipodal_left','unipodal_right','arms','posture']);
const ANSWER_IDS=new Set([
 'ageBand','goal','walk10','stairs','chair','carry','bend','obstacle','turn','stand',
 'pain','fatigue','fear','avoid','sleep','stress','recovered','qol',
 'walkingDays','strengthDays','outdoors','breaks','fall12','nearFall','painNow','activeTime','safety'
]);
const CHECKS=new Set(['chair','space','support','device']);
const STATES=new Set(['pending','done','review','skipped']);
const EXERCISES=new Set(['walk','chair','balance','mobility','recover']);
const PROGRAM_VERSION='KOMO_PULSE_DAILY_V1';
const DATE=/^\d{4}-\d{2}-\d{2}$/;
function sanitizeProgram(program){
 if(program===undefined||program===null)return null;
 if(!plain(program)||program.version!==PROGRAM_VERSION||!DATE.test(program.startedAt||'')||
  !plain(program.entries)||Object.keys(program.entries).length>28)return undefined;
 const entries={};
 for(const [day,raw] of Object.entries(program.entries)){
  if(!DATE.test(day)||!plain(raw)||!Array.isArray(raw.completed)||raw.completed.length>5||
    raw.completed.some(v=>!EXERCISES.has(v)))return undefined;
  const diff=(Date.parse(day+'T12:00:00Z')-Date.parse(program.startedAt+'T12:00:00Z'))/86400000;
  if(!Number.isInteger(diff)||diff<0||diff>=28)return undefined;
  const effort=raw.effort===null||raw.effort===undefined?null:raw.effort;
  if(effort!==null&&!inInt(effort,0,10))return undefined;
  if(raw.note!==undefined&&!safeText(raw.note,160))return undefined;
  entries[day]={completed:[...new Set(raw.completed)],effort,note:raw.note||''};
 }
 return {version:PROGRAM_VERSION,startedAt:program.startedAt,entries};
}
const VALID_AGE=new Set(['under40','40-49','50-59','60-69','70-79','80plus','undisclosed']);
const VALID_GOALS=new Set(['independence','walk','strength','confidence','general']);
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const safeText=(x,max=80)=>typeof x==='string'&&x.length<=max&&/^[^\u0000-\u001f]*$/.test(x);
const anyNumber=x=>typeof x==='number'&&Number.isFinite(x);
const inInt=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
function allowedOrigin(req){
 const origin=req.headers.get('origin')||'';
 return !origin||origin===ORIGIN||/^https:\/\/komo-longevity-[a-z0-9-]+\.vercel\.app$/.test(origin)?origin:null;
}
function corsHeaders(origin){
 return {'Access-Control-Allow-Origin':origin||ORIGIN,'Vary':'Origin',
  'Access-Control-Allow-Methods':'POST,OPTIONS',
  'Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type',
  'Cache-Control':'private, no-store','Content-Type':'application/json; charset=utf-8',
  'X-Content-Type-Options':'nosniff'};
}
const reply=(payload,status,origin)=>new Response(JSON.stringify(payload),{status,headers:corsHeaders(origin)});
function cleanSnapshot(s){
 if(!plain(s)||!inInt(s.page,0,4)||!inInt(s.questionStep,0,5)||!inInt(s.task,0,5))return null;
 const answers={};
 if(!plain(s.answers))return null;
 for(const [key,value] of Object.entries(s.answers)){
  if(!ANSWER_IDS.has(key)||!safeText(value,48))return null;
  if(key==='ageBand'&&!VALID_AGE.has(value))return null;
  if(key==='goal'&&!VALID_GOALS.has(value))return null;
  if(key==='safety'&&!['yes','no'].includes(value))return null;
  if(!['ageBand','goal','safety'].includes(key)&&!['0','1','2','3','4'].includes(value))return null;
  answers[key]=value;
 }
 if(!Array.isArray(s.checks)||s.checks.some(x=>!CHECKS.has(x)))return null;
 if(!plain(s.results))return null;
 const results={};
 for(const [id,r] of Object.entries(s.results)){
  if(!TEST_IDS.has(id)||!plain(r)||!STATES.has(r.status))return null;
  if(r.value!==null&&r.value!==undefined&&(!anyNumber(r.value)||r.value<0||r.value>500))return null;
  if(r.quality!==null&&r.quality!==undefined&&(!anyNumber(r.quality)||r.quality<0||r.quality>100))return null;
  if(r.source!==undefined&&!safeText(r.source,80))return null;
  const item={status:r.status,value:r.value??null,quality:r.quality??null,source:r.source??'webcam'};
  if(id==='posture'&&plain(r.posture)&&r.posture.valid===true){
   if(!anyNumber(r.posture.surfaceIndexPct)||Math.abs(r.posture.surfaceIndexPct)>500)return null;
   const k=r.posture.kneeFlexionDeg,a=r.posture.ankleDeviationDeg;
   if(k!==null&&k!==undefined&&(!anyNumber(k)||k<0||k>70))return null;
   if(a!==null&&a!==undefined&&(!anyNumber(a)||a<0||a>65))return null;
   item.posture={valid:true,surfaceIndexPct:r.posture.surfaceIndexPct,manualCapture:r.posture.manualCapture===true,
    kneeFlexionDeg:k??null,ankleDeviationDeg:a??null,
    compensation:['possible','not_observed'].includes(r.posture.compensation)?r.posture.compensation:'unavailable'};
  }
  if(id==='sts'&&plain(r.normative)){
   const n=r.normative;
   item.normative={exactAge:inInt(n.exactAge,60,94)?n.exactAge:null,
    cohort:['men','women'].includes(n.cohort)?n.cohort:'',
    protocolConfirmed:n.protocolConfirmed===true};
  }
  results[id]=item;
 }
 const program=sanitizeProgram(s.program);
 if(program===undefined)return null;
 return {page:s.page,questionStep:s.questionStep,task:s.task,returnToSummary:s.returnToSummary===true,
  answers,checks:[...new Set(s.checks)],results,program};
}
function verifyConfig(){
 const url=Deno.env.get('SUPABASE_URL');
 const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!secret)return null;
 return {url,secret};
}
async function authUser(jwt,config){
 const res=await fetch(config.url+'/auth/v1/user',{
  headers:{apikey:config.secret,authorization:'Bearer '+jwt},
  signal:AbortSignal.timeout(7000),cache:'no-store'});
 if(!res.ok)return null;
 const user=await res.json();
 return user.id&&user.email_confirmed_at&&!user.is_anonymous?user:null;
}
async function verifyPayment(jwt,id){
 const res=await fetch(ONLINE_VERIFY,{method:'POST',headers:{
  authorization:'Bearer '+jwt,'content-type':'application/json'},
  body:JSON.stringify({sessionId:id}),signal:AbortSignal.timeout(11000),cache:'no-store'});
 if(!res.ok)return false;
 const result=await res.json();
 return result.eligible===true&&result.canStart===true&&result.paid===true;
}
function adminHeaders(config,additional={}){
 return {apikey:config.secret,authorization:'Bearer '+config.secret,'content-type':'application/json',
  accept:'application/json',...additional};
}
async function queryRow(config,id){
 const uri=config.url+'/rest/v1/'+TABLE+'?checkout_session_id=eq.'+encodeURIComponent(id)+
  '&select=id,user_id,checkout_session_id,snapshot,status,consent_version,updated_at&limit=1';
 const resp=await fetch(uri,{headers:adminHeaders(config),cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!resp.ok)throw Error('database_read_failed');
 const rows=await resp.json();
 return rows[0]??null;
}
async function persistRow(config,userId,id,snapshot){
 const existing=await queryRow(config,id);
 if(existing&&existing.user_id!==userId)return {error:'checkout_owner_conflict'};
 if(existing){
  const uri=config.url+'/rest/v1/'+TABLE+'?checkout_session_id=eq.'+encodeURIComponent(id)+
   '&user_id=eq.'+encodeURIComponent(userId);
  const resp=await fetch(uri,{method:'PATCH',
   headers:adminHeaders(config,{Prefer:'return=representation'}),
   body:JSON.stringify({snapshot,status:snapshot.page===4?'completed':'draft',
    updated_at:new Date().toISOString()}),signal:AbortSignal.timeout(8000)});
  if(!resp.ok)throw Error('database_update_failed');
  const rows=await resp.json();
  return rows.length?{data:rows[0]}:{error:'checkout_owner_conflict'};
 }
 const resp=await fetch(config.url+'/rest/v1/'+TABLE,{
  method:'POST',headers:adminHeaders(config,{Prefer:'return=representation'}),
  body:JSON.stringify({user_id:userId,checkout_session_id:id,snapshot,
   consent_version:CONSENT,status:snapshot.page===4?'completed':'draft'}),
  signal:AbortSignal.timeout(8000)});
 if(resp.status===409)return {error:'concurrent_creation_retry'};
 if(!resp.ok)throw Error('database_insert_failed');
 const rows=await resp.json();
 return rows.length?{data:rows[0]}:{error:'database_write_failed'};
}
Deno.serve(async req=>{
 const origin=allowedOrigin(req);
 if(origin===null)return reply({error:'origin_not_allowed'},403,ORIGIN);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders(origin)});
 if(req.method!=='POST')return reply({error:'method_not_allowed'},405,origin);
 const rawAuth=req.headers.get('authorization')||'';
 const token=rawAuth.match(/^Bearer ([\w.-]+)$/)?.[1];
 if(!token)return reply({error:'authentication_required'},401,origin);
 const config=verifyConfig();
 if(!config)return reply({error:'storage_not_configured'},503,origin);
 try{
  const payload=await req.text();
  if(new TextEncoder().encode(payload).length>27000)return reply({error:'payload_too_large'},413,origin);
  const input=JSON.parse(payload);
  const id=String(input?.checkoutSessionId??'').trim();
  if(!/^cs_(?:test|live)_[A-Za-z0-9]{8,200}$/.test(id))return reply({error:'invalid_checkout_session'},400,origin);
  if(!['load','save'].includes(input?.mode))return reply({error:'invalid_mode'},400,origin);
  const user=await authUser(token,config);
  if(!user)return reply({error:'authentication_required'},401,origin);
  const paid=await verifyPayment(token,id);
  if(!paid)return reply({error:'stripe_payment_or_launch_not_authorized'},403,origin);
  if(input.mode==='load'){
   const row=await queryRow(config,id);
   if(row&&row.user_id!==user.id)return reply({error:'checkout_owner_conflict'},403,origin);
   return reply({ok:true,found:Boolean(row),snapshot:row?.snapshot??null,
    status:row?.status??null,updatedAt:row?.updated_at??null},200,origin);
  }
  if(input.consentVersion!==CONSENT||input.consentAccepted!==true)
   return reply({error:'consent_required'},422,origin);
  const snapshot=cleanSnapshot(input.snapshot);
  if(!snapshot)return reply({error:'invalid_snapshot'},422,origin);
  const saved=await persistRow(config,user.id,id,snapshot);
  if(saved.error)return reply({error:saved.error},409,origin);
  return reply({ok:true,status:saved.data.status,updatedAt:saved.data.updated_at},200,origin);
 }catch{
  return reply({error:'storage_temporarily_unavailable'},503,origin);
 }
});

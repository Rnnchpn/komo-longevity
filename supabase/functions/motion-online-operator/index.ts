// KŌMØ Motion Online admin briefing — read-only and audited.
// Never changes motion_online_sessions owner-only RLS. No browser service key.
// Only verified account_roles.role === 'admin' can read an existing consented session.
const ORIGIN='https://pulse.komolongevity.com';
const PATTERN=/^[1-9][0-9]{0,11}$/;
function origin(req){
 const value=req.headers.get('origin')||'';
 return !value||value===ORIGIN||/^https:\/\/komo-longevity-[a-z0-9-]+\.vercel\.app$/.test(value)?value:null;
}
function response(data,status,allowed){
 return new Response(JSON.stringify(data),{status,headers:{
  'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store',
  'X-Content-Type-Options':'nosniff','Vary':'Origin',
  'Access-Control-Allow-Origin':allowed||ORIGIN,
  'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info',
  'Access-Control-Allow-Methods':'OPTIONS,POST'}});
}
function config(){
 const url=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 return url&&secret?{url,secret}:null;
}
function headers(cfg){return {apikey:cfg.secret,authorization:'Bearer '+cfg.secret,accept:'application/json','content-type':'application/json'};}
async function adminIdentity(cfg,jwt){
 const auth=await fetch(cfg.url+'/auth/v1/user',{headers:{apikey:cfg.secret,authorization:'Bearer '+jwt},cache:'no-store',signal:AbortSignal.timeout(7000)});
 if(!auth.ok)return null;
 const user=await auth.json();
 if(!user.id||!user.email_confirmed_at||user.is_anonymous===true)return null;
 const roles=await fetch(cfg.url+'/rest/v1/account_roles?user_id=eq.'+encodeURIComponent(user.id)+'&select=role&limit=1',{
  headers:headers(cfg),cache:'no-store',signal:AbortSignal.timeout(7000)});
 if(!roles.ok)return null;
 const roleRows=await roles.json();
 return Array.isArray(roleRows)&&roleRows.some(x=>x.role==='admin')?user.id:null;
}
async function audit(cfg,userId,ids,action){
 // Fail closed; no private data can be emitted unless the read was logged.
 const body=ids.map(id=>({operator_id:userId,appointment_id:id,action}));
 const res=await fetch(cfg.url+'/rest/v1/motion_online_operator_audit',{
  method:'POST',headers:{...headers(cfg),Prefer:'return=minimal'},body:JSON.stringify(body),
  cache:'no-store',signal:AbortSignal.timeout(7000)});
 if(!res.ok)throw Error('audit_unavailable');
}
function safeRow(row,detail){
 if(!row||!PATTERN.test(row.appointment_id))return null;
 const s=row.snapshot||{};
 const count=Object.values(s.results||{}).filter(x=>x&&['done','review'].includes(x.status)).length;
 const base={appointmentId:row.appointment_id,status:row.status||'draft',
  updatedAt:row.updated_at||null,testsDone:Math.min(6,count),questionnaireComplete:Boolean(s.page>=2)};
 if(detail)return {...base,answers:s.answers||{},results:s.results||{},page:s.page??null,
  consentVersion:row.consent_version||null};
 return base;
}
Deno.serve(async req=>{
 const allowed=origin(req);
 if(allowed===null)return response({error:'origin_not_allowed'},403,ORIGIN);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{
  'Access-Control-Allow-Origin':allowed||ORIGIN,'Access-Control-Allow-Methods':'POST,OPTIONS',
  'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Cache-Control':'no-store'}});
 if(req.method!=='POST')return response({error:'method_not_allowed'},405,allowed);
 const jwt=(req.headers.get('authorization')||'').match(/^Bearer ([\w.-]+)$/)?.[1];
 if(!jwt)return response({error:'authentication_required'},401,allowed);
 const cfg=config();
 if(!cfg)return response({error:'operator_not_configured'},503,allowed);
 try{
  const raw=await req.text();
  if(raw.length>2000)return response({error:'payload_too_large'},413,allowed);
  const input=JSON.parse(raw);
  const action=input?.mode;
  if(!['status','load'].includes(action))return response({error:'invalid_mode'},400,allowed);
  const ids=action==='load'?[String(input.appointmentId||'')]:input.appointmentIds;
  if(!Array.isArray(ids)||ids.length<1||ids.length>100||ids.some(x=>typeof x!=='string'||!PATTERN.test(x)))
   return response({error:'invalid_appointment_ids'},400,allowed);
  const unique=[...new Set(ids)];
  const operatorId=await adminIdentity(cfg,jwt);
  if(!operatorId)return response({error:'operator_access_denied'},403,allowed);
  const query=action==='load'?'appointment_id=eq.'+encodeURIComponent(unique[0]):
   'appointment_id=in.('+unique.join(',')+')';
  const fields='appointment_id,status,snapshot,consent_version,updated_at';
  const url=cfg.url+'/rest/v1/motion_online_sessions?'+query+'&select='+fields+'&limit=100';
  const read=await fetch(url,{headers:headers(cfg),cache:'no-store',signal:AbortSignal.timeout(7000)});
  if(!read.ok)throw Error('private_read_unavailable');
  const rows=await read.json();
  if(!Array.isArray(rows))throw Error('invalid_dossier_data');
  const eligible=rows.filter(row=>row?.consent_version==='KOMO_MOTION_ONLINE_CONSENT_V1');
  if(eligible.length)await audit(cfg,operatorId,eligible.map(x=>x.appointment_id),action);
  if(action==='load')return response({ok:true,found:Boolean(eligible[0]),
   dossier:eligible.length?safeRow(eligible[0],true):null},200,allowed);
  return response({ok:true,dossiers:eligible.map(row=>safeRow(row,false)).filter(Boolean)},200,allowed);
 }catch{
  return response({error:'operator_temporarily_unavailable'},503,allowed);
 }
});

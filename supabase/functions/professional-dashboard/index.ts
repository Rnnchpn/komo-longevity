import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U=Deno.env.get('SUPABASE_URL')??'';
const A=Deno.env.get('SUPABASE_ANON_KEY')??'';
const S=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'';
const ORIGINS=new Set(['https://pulse.komolongevity.com','https://komolongevity.com']);
function cors(req:Request){const o=req.headers.get('origin')??'';return{'Access-Control-Allow-Origin':ORIGINS.has(o)?o:'https://pulse.komolongevity.com','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'}}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors(req),'Content-Type':'application/json; charset=utf-8'}})}
function prep(responses:any){const keys=['baseline','chair_stand','two_step'];const done=keys.filter(k=>responses?.[k]?.completed_at).length;return{completed:done,total:keys.length,percent:Math.round(done/keys.length*100),baseline:!!responses?.baseline?.completed_at,chair_stand:!!responses?.chair_stand?.completed_at,two_step:!!responses?.two_step?.completed_at,first_score:responses?.baseline?.questionnaire?.mobility_score_0_100??null}}
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors(req)});
  if(req.method!=='POST')return json(req,{error:'method_not_allowed'},405);
  const token=(req.headers.get('Authorization')??'').replace(/^Bearer\s+/i,'');
  if(!token)return json(req,{error:'unauthorized'},401);
  const uc=createClient(U,A,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const svc=createClient(U,S,{auth:{persistSession:false}});
  const ur=await uc.auth.getUser(token),user=ur.data?.user;
  if(ur.error||!user)return json(req,{error:'unauthorized'},401);
  const rr=await svc.from('account_roles').select('role').eq('user_id',user.id).maybeSingle();
  const role=rr.data?.role??'member';
  if(!['professional','admin'].includes(role))return json(req,{error:'professional_required'},403);
  const membershipsRes=role==='admin'?{data:[],error:null}:await svc.from('organization_members').select('organization_id,role,access_scope,status,organizations(id,name)').eq('user_id',user.id).eq('status','active');
  const memberships:any[]=membershipsRes.data??[];
  const managedCenterIds=memberships.filter(m=>['owner','clinical_admin'].includes(m.role)).map(m=>m.organization_id);
  const visibility=role==='admin'?'global':managedCenterIds.length?'center':'assigned';
  const pRes=await uc.from('patients').select('id,organization_id,patient_user_id,first_name,last_name,preferred_name,email,external_reference,birth_date,status,organizations(id,name)').order('updated_at',{ascending:false}).limit(1000);
  if(pRes.error)return json(req,{error:'patients_failed',detail:pRes.error.message},500);
  const patients=pRes.data??[];const pids=patients.map((p:any)=>p.id);const uids=patients.map((p:any)=>p.patient_user_id).filter(Boolean);
  const [apRes,assRes,reqRes,prepRes]=await Promise.all([
    pids.length?uc.from('organization_appointments').select('id,patient_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,assigned_user_id').in('patient_id',pids).order('scheduled_start',{ascending:true}):Promise.resolve({data:[],error:null}),
    pids.length?uc.from('assessments').select('id,patient_id,product_mode,status,protocol_version,created_at').in('patient_id',pids).order('created_at',{ascending:false}):Promise.resolve({data:[],error:null}),
    uids.length?svc.from('patient_service_requests').select('id,user_id,service,status,submitted_at,assigned_at,accepted_at,scheduled_at,patient_id,assessment_id').in('user_id',uids).order('submitted_at',{ascending:false}):Promise.resolve({data:[],error:null}),
    uids.length?svc.from('pulse_assessments').select('id,user_id,status,responses,updated_at,completed_at').in('user_id',uids).eq('protocol_version','mobility-check-v1').order('updated_at',{ascending:false}):Promise.resolve({data:[],error:null})
  ] as any);
  const assessments:any[]=assRes.data??[];const assessmentIds=assessments.map(x=>x.id);const scoresRes=assessmentIds.length?await uc.from('scores').select('assessment_id,motion_score,status,release_status,calculated_at').in('assessment_id',assessmentIds).order('calculated_at',{ascending:false}):{data:[],error:null};
  const scores:any[]=scoresRes.data??[],appointments:any[]=apRes.data??[],requests:any[]=reqRes.data??[],preps:any[]=prepRes.data??[],now=Date.now();
  const rows=patients.map((p:any)=>{const pa=preps.find(x=>x.user_id===p.patient_user_id)||null;const request=requests.find(x=>x.user_id===p.patient_user_id&&['motion','clinical'].includes(x.service))||null;const motion=assessments.find(x=>x.patient_id===p.id&&x.product_mode==='motion')||null;const score=motion?scores.find(x=>x.assessment_id===motion.id)||null:null;const next=appointments.find(x=>x.patient_id===p.id&&new Date(x.scheduled_start).getTime()>=now&&!['cancelled','completed','no_show'].includes(x.status))||null;return{patient:p,preparation:prep(pa?.responses||{}),preparation_status:pa?.status||'not_started',preparation_updated_at:pa?.updated_at||null,request,motion,score,next_appointment:next}});
  return json(req,{rows,count:rows.length,visibility,memberships,managed_center_ids:managedCenterIds});
});
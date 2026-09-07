import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U=Deno.env.get('SUPABASE_URL')??'';
const A=Deno.env.get('SUPABASE_ANON_KEY')??'';
const S=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'';
const ORIGINS=new Set(['https://pulse.komolongevity.com','https://komolongevity.com']);
const BASE_CODES=['KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'];
function cors(req:Request){const o=req.headers.get('origin')??'';return{'Access-Control-Allow-Origin':ORIGINS.has(o)?o:'https://pulse.komolongevity.com','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'}}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors(req),'Content-Type':'application/json; charset=utf-8'}})}
function num(v:any){const n=Number(v);return Number.isFinite(n)?n:null}
function qLevel(score:number|null){if(score===null)return null;const d=100-score;if(d<7)return 0;if(d<16)return 1;if(d<24)return 2;return 3}
function tLevel(ratio:number|null){if(ratio===null)return null;if(ratio>=1.3)return 0;if(ratio>=1.1)return 1;if(ratio>=0.9)return 2;return 3}
function prep(responses:any){const keys=['baseline','chair_stand','two_step'];const done=keys.filter(k=>responses?.[k]?.completed_at).length;const q=num(responses?.baseline?.questionnaire?.mobility_score_0_100),chair=num(responses?.chair_stand?.repetitions),two=num(responses?.two_step?.ratio);const levels=[qLevel(q),tLevel(two)].filter((x):x is number=>Number.isFinite(x)),freeLevel=levels.length?Math.max(...levels):null;return{completed:done,total:keys.length,percent:Math.round(done/keys.length*100),baseline:!!responses?.baseline?.completed_at,chair_stand:!!responses?.chair_stand?.completed_at,two_step:!!responses?.two_step?.completed_at,first_score:q,chair_repetitions:chair,two_step_ratio:two,free_level:done===keys.length?freeLevel:null,free_label:done===keys.length&&freeLevel!==null?['Mobilité préservée','Mobilité à surveiller','Diminution fonctionnelle probable','Diminution fonctionnelle marquée'][freeLevel]:null}}
function questionnaireReadiness(all:any[],assessmentId:string|null){const rows=assessmentId?all.filter(x=>x.assessment_id===assessmentId&&BASE_CODES.includes(x.instrument_code)):[];const byCode=new Map(rows.map(x=>[x.instrument_code,x]));const sections=BASE_CODES.map(code=>{const x:any=byCode.get(code)||null;const completeness=Math.max(0,Math.min(100,Number(x?.completeness||0)));const complete=x?.status==='completed'||completeness>=100;return{instrument_code:code,status:x?.status||'not_started',completeness,score:x?.score??null,score_status:x?.score_status??null,completed_at:x?.completed_at??null,complete}});const completed=sections.filter(x=>x.complete).length;return{completed,total:BASE_CODES.length,percent:Math.round(completed/BASE_CODES.length*100),complete:completed===BASE_CODES.length,sections}}
function appointmentPriority(a:any){return({in_progress:0,arrived:1,confirmed:2,scheduled:3,completed:4})[a?.status]??8}
function relevantAppointment(rows:any[],patientId:string){const list=rows.filter(x=>x.patient_id===patientId&&x.appointment_type==='motion'&&!['cancelled','no_show'].includes(x.status));return list.sort((a,b)=>{const pa=appointmentPriority(a),pb=appointmentPriority(b);if(pa!==pb)return pa-pb;const da=Math.abs(new Date(a.scheduled_start).getTime()-Date.now()),db=Math.abs(new Date(b.scheduled_start).getTime()-Date.now());return da-db})[0]||null}
function relevantMotion(rows:any[],patientId:string,appt:any,request:any){const list=rows.filter(x=>x.patient_id===patientId&&x.product_mode==='motion'&&x.status!=='cancelled');if(request?.assessment_id){const direct=list.find(x=>x.id===request.assessment_id);if(direct)return direct}if(appt){const at=new Date(appt.scheduled_start).getTime();const match=list.filter(x=>x.scheduled_at&&Math.abs(new Date(x.scheduled_at).getTime()-at)<=12*3600000).sort((a,b)=>Math.abs(new Date(a.scheduled_at).getTime()-at)-Math.abs(new Date(b.scheduled_at).getTime()-at))[0];if(match)return match}return list.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0]||null}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors(req)});
  if(req.method!=='POST')return json(req,{error:'method_not_allowed'},405);
  const token=(req.headers.get('Authorization')??'').replace(/^Bearer\s+/i,'');if(!token)return json(req,{error:'unauthorized'},401);
  const uc=createClient(U,A,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}}),svc=createClient(U,S,{auth:{persistSession:false}});
  const ur=await uc.auth.getUser(token),user=ur.data?.user;if(ur.error||!user)return json(req,{error:'unauthorized'},401);
  const rr=await svc.from('account_roles').select('role').eq('user_id',user.id).maybeSingle();const role=rr.data?.role??'member';if(!['professional','admin'].includes(role))return json(req,{error:'professional_required'},403);
  const membershipsRes=role==='admin'?{data:[],error:null}:await svc.from('organization_members').select('organization_id,role,access_scope,status,organizations(id,name)').eq('user_id',user.id).eq('status','active');
  const memberships:any[]=membershipsRes.data??[],managedCenterIds=memberships.filter(m=>['owner','clinical_admin'].includes(m.role)).map(m=>m.organization_id),visibility=role==='admin'?'global':managedCenterIds.length?'center':'assigned';
  const pRes=await uc.from('patients').select('id,organization_id,patient_user_id,first_name,last_name,preferred_name,email,external_reference,birth_date,status,organizations(id,name)').order('updated_at',{ascending:false}).limit(1000);if(pRes.error)return json(req,{error:'patients_failed',detail:pRes.error.message},500);
  const patients=pRes.data??[],pids=patients.map((p:any)=>p.id),uids=patients.map((p:any)=>p.patient_user_id).filter(Boolean);
  const [apRes,assRes,reqRes,prepRes]=await Promise.all([
    pids.length?uc.from('organization_appointments').select('id,organization_id,patient_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,assigned_user_id,intake_status,intake_submitted_at').in('patient_id',pids).order('scheduled_start',{ascending:false}):Promise.resolve({data:[],error:null}),
    pids.length?uc.from('assessments').select('id,patient_id,product_mode,status,protocol_version,scheduled_at,created_at,started_at,completed_at').in('patient_id',pids).order('created_at',{ascending:false}):Promise.resolve({data:[],error:null}),
    uids.length?svc.from('patient_service_requests').select('id,user_id,service,status,submitted_at,assigned_at,accepted_at,scheduled_at,patient_id,assessment_id').in('user_id',uids).order('submitted_at',{ascending:false}):Promise.resolve({data:[],error:null}),
    uids.length?svc.from('pulse_assessments').select('id,user_id,status,responses,updated_at,completed_at').in('user_id',uids).eq('protocol_version','mobility-check-v1').order('updated_at',{ascending:false}):Promise.resolve({data:[],error:null})
  ] as any);
  const assessments:any[]=assRes.data??[],assessmentIds=assessments.map(x=>x.id);
  const [scoresRes,qsRes]=await Promise.all([
    assessmentIds.length?uc.from('scores').select('assessment_id,motion_score,status,release_status,calculated_at').in('assessment_id',assessmentIds).order('calculated_at',{ascending:false}):Promise.resolve({data:[],error:null}),
    assessmentIds.length?svc.from('questionnaire_sessions').select('assessment_id,instrument_code,status,completeness,score,score_status,completed_at,updated_at').in('assessment_id',assessmentIds).in('instrument_code',BASE_CODES):Promise.resolve({data:[],error:null})
  ] as any);
  const scores:any[]=scoresRes.data??[],questionnaires:any[]=qsRes.data??[],appointments:any[]=apRes.data??[],requests:any[]=reqRes.data??[],preps:any[]=prepRes.data??[];
  const rows=patients.map((p:any)=>{const pa=preps.find(x=>x.user_id===p.patient_user_id)||null;const request=requests.find(x=>x.user_id===p.patient_user_id&&x.service==='motion')||null;const appt=relevantAppointment(appointments,p.id);const motion=relevantMotion(assessments,p.id,appt,request);const score=motion?scores.find(x=>x.assessment_id===motion.id)||null:null;const pre_bilan=questionnaireReadiness(questionnaires,motion?.id||null);return{patient:p,preparation:prep(pa?.responses||{}),preparation_status:pa?.status||'not_started',preparation_updated_at:pa?.updated_at||null,request,motion,score,next_appointment:appt,pre_bilan}});
  return json(req,{rows,count:rows.length,visibility,memberships,managed_center_ids:managedCenterIds});
});
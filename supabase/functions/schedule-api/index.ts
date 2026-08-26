import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U=Deno.env.get('SUPABASE_URL')??'';
const A=Deno.env.get('SUPABASE_ANON_KEY')??'';
const S=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'';
const ORIGINS=new Set(['https://pulse.komolongevity.com','https://komolongevity.com']);
function cors(req:Request){const o=req.headers.get('origin')??'';return{'Access-Control-Allow-Origin':ORIGINS.has(o)?o:'https://pulse.komolongevity.com','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'}}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors(req),'Content-Type':'application/json; charset=utf-8'}})}

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
  const isAdmin=role==='admin';
  let body:any={};try{body=await req.json()}catch{return json(req,{error:'invalid_json'},400)}
  const action=String(body.action??'centers');

  const memberships=async()=>{
    const q=await svc.from('organization_members').select('organization_id,role,access_scope,status,organizations(id,name,slug,timezone,status,clinical_data_status)').eq('user_id',user.id).eq('status','active');
    if(q.error)throw q.error;return q.data??[];
  };
  const allowedOrg=async(orgId:string)=>{
    if(isAdmin)return true;
    if(role!=='professional')return false;
    const ms=await memberships();return ms.some((m:any)=>m.organization_id===orgId);
  };

  if(action==='centers'){
    const [orgs,services]=await Promise.all([
      svc.from('organizations').select('id,name,slug,timezone,clinical_data_status,status').eq('status','active').order('name'),
      svc.from('organization_booking_services').select('organization_id,service_type,enabled,duration_minutes,booking_horizon_days,min_notice_hours').eq('enabled',true)
    ]);
    if(orgs.error||services.error)return json(req,{error:'centers_failed',detail:orgs.error?.message||services.error?.message},500);
    const rows=(orgs.data??[]).map((o:any)=>({...o,services:(services.data??[]).filter((s:any)=>s.organization_id===o.id).map((s:any)=>({type:s.service_type,duration_minutes:s.duration_minutes,booking_horizon_days:s.booking_horizon_days,min_notice_hours:s.min_notice_hours}))})).filter((o:any)=>o.services.length);
    return json(req,{centers:rows});
  }

  if(action==='availability'){
    const orgId=String(body.organization_id??''),service=String(body.service??''),startDate=String(body.start_date??'');
    if(!orgId||!['motion','clinical'].includes(service)||!/\d{4}-\d{2}-\d{2}/.test(startDate))return json(req,{error:'invalid_parameters'},400);
    const q=await uc.rpc('komo_booking_slots',{p_organization_id:orgId,p_service:service,p_start_date:startDate,p_days:Math.max(1,Math.min(14,Number(body.days||7)))});
    if(q.error)return json(req,{error:'availability_failed',detail:q.error.message},409);
    return json(req,{slots:q.data??[]});
  }

  if(action==='book'){
    const orgId=String(body.organization_id??''),service=String(body.service??''),slot=String(body.slot_start??'');
    if(!orgId||!['motion','clinical'].includes(service)||!slot)return json(req,{error:'invalid_parameters'},400);
    const q=await uc.rpc('book_komo_appointment',{p_organization_id:orgId,p_service:service,p_slot_start:slot});
    if(q.error){const msg=q.error.message||'';return json(req,{error:msg.includes('profile_incomplete')?'profile_incomplete':msg.includes('slot_unavailable')?'slot_unavailable':'booking_failed',detail:msg},409)}
    return json(req,{ok:true,appointment_id:q.data});
  }

  if(action==='my_appointments'){
    const ps=await svc.from('patients').select('id,organization_id').eq('patient_user_id',user.id);
    if(ps.error)return json(req,{error:'patients_failed',detail:ps.error.message},500);
    const ids=(ps.data??[]).map((p:any)=>p.id);if(!ids.length)return json(req,{appointments:[]});
    const q=await svc.from('organization_appointments').select('id,organization_id,patient_id,assigned_user_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,service_code,booking_source,organizations(id,name,timezone)').in('patient_id',ids).order('scheduled_start',{ascending:true});
    if(q.error)return json(req,{error:'appointments_failed',detail:q.error.message},500);
    return json(req,{appointments:q.data??[]});
  }

  if(action==='cancel'){
    const id=String(body.appointment_id??'');if(!id)return json(req,{error:'appointment_id_required'},400);
    const q=await uc.rpc('cancel_my_komo_appointment',{p_appointment_id:id});
    if(q.error)return json(req,{error:'cancel_failed',detail:q.error.message},409);
    return json(req,{ok:true});
  }

  if(action==='pro_centers'){
    if(!['professional','admin'].includes(role))return json(req,{error:'professional_required'},403);
    if(isAdmin){const q=await svc.from('organizations').select('id,name,slug,timezone,clinical_data_status,status').eq('status','active').order('name');return json(req,{centers:q.data??[]})}
    const ms=await memberships();return json(req,{centers:ms.map((m:any)=>({...m.organizations,membership_role:m.role,access_scope:m.access_scope})).filter((x:any)=>x?.id)});
  }

  if(action==='pro_week'){
    if(!['professional','admin'].includes(role))return json(req,{error:'professional_required'},403);
    const orgId=String(body.organization_id??''),weekStart=String(body.week_start??'');
    if(!orgId||!/\d{4}-\d{2}-\d{2}/.test(weekStart))return json(req,{error:'invalid_parameters'},400);
    if(!(await allowedOrg(orgId)))return json(req,{error:'organization_access_required'},403);
    const ms=isAdmin?[]:await memberships(),m=ms.find((x:any)=>x.organization_id===orgId),manager=isAdmin||['owner','clinical_admin'].includes(m?.role);
    const start=new Date(`${weekStart}T00:00:00Z`),end=new Date(start.getTime()+7*864e5);
    let q=svc.from('organization_appointments').select('id,organization_id,patient_id,assigned_user_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,service_code,booking_source,patients(id,first_name,last_name,preferred_name,email,external_reference)').eq('organization_id',orgId).gte('scheduled_start',start.toISOString()).lt('scheduled_start',end.toISOString()).order('scheduled_start');
    const res=await q;if(res.error)return json(req,{error:'planning_failed',detail:res.error.message},500);
    let rows=res.data??[];
    if(!manager){
      const assignments=await svc.from('patient_care_assignments').select('patient_id').eq('organization_id',orgId).eq('professional_user_id',user.id).eq('status','active');
      const allowed=new Set((assignments.data??[]).map((x:any)=>x.patient_id));
      rows=rows.filter((a:any)=>a.assigned_user_id===user.id||allowed.has(a.patient_id));
    }
    return json(req,{appointments:rows,manager});
  }

  return json(req,{error:'unknown_action'},400);
});
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U=Deno.env.get("SUPABASE_URL")??"";
const A=Deno.env.get("SUPABASE_ANON_KEY")??"";
const S=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com"]);
const MANAGER=new Set(["owner","clinical_admin"]);
const STAFF=new Set(["owner","clinical_admin","physician","operator","coordinator"]);
function cors(req:Request){const o=req.headers.get("origin")??"";return{"Access-Control-Allow-Origin":ORIGINS.has(o)?o:"https://pulse.komolongevity.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function json(req:Request,b:unknown,s=200){return new Response(JSON.stringify(b),{status:s,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8"}})}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"method_not_allowed"},405);
  const auth=req.headers.get("Authorization")??"";
  const token=auth.replace(/^Bearer\s+/i,"");
  if(!token)return json(req,{error:"unauthorized"},401);
  const uc=createClient(U,A,{global:{headers:{Authorization:auth}},auth:{persistSession:false}});
  const svc=createClient(U,S,{auth:{persistSession:false}});
  const ur=await uc.auth.getUser(token),actor=ur.data?.user;
  if(ur.error||!actor)return json(req,{error:"unauthorized"},401);
  const ar=await svc.from("account_roles").select("role").eq("user_id",actor.id).maybeSingle();
  const accountRole=ar.data?.role??"member",isAdmin=accountRole==="admin";
  if(!["professional","admin"].includes(accountRole))return json(req,{error:"professional_required"},403);
  let body:any={};try{body=await req.json()}catch{return json(req,{error:"invalid_json"},400)}
  const action=String(body.action??"overview");

  if(action!=="overview"){
    const r=await fetch(`${U}/functions/v1/center-command-v2`,{method:"POST",headers:{Authorization:auth,apikey:A,"Content-Type":"application/json"},body:JSON.stringify(body)});
    const text=await r.text();
    return new Response(text,{status:r.status,headers:{...cors(req),"Content-Type":r.headers.get("content-type")||"application/json; charset=utf-8"}});
  }

  const own=await svc.from("organization_members").select("organization_id,role,status,access_scope").eq("user_id",actor.id).eq("status","active");
  if(own.error)return json(req,{error:"membership_lookup_failed",detail:own.error.message},500);
  const memberships=(own.data??[]).filter((m:any)=>STAFF.has(m.role));
  let ids:string[]=[];
  if(isAdmin){const q=await svc.from("organizations").select("id").order("name");if(q.error)return json(req,{error:"center_lookup_failed",detail:q.error.message},500);ids=(q.data??[]).map((x:any)=>x.id)}
  else ids=[...new Set(memberships.map((m:any)=>m.organization_id))];
  if(!ids.length)return json(req,{centers:[],services:[],hours:[],members:[],appointments:[],patients:[],requests:[],account_role:accountRole,can_manage_ids:[]});

  const mmap=new Map(memberships.map((m:any)=>[m.organization_id,m]));
  const canManageIds=isAdmin?ids:memberships.filter((m:any)=>MANAGER.has(m.role)).map((m:any)=>m.organization_id);
  const [oq,sq,hq,mq,aq,pq,rq]=await Promise.all([
    svc.from("organizations").select("id,name,slug,city,address_line,postal_code,country_code,timezone,status,clinical_data_status,booking_published,contact_email,contact_phone,website_url,public_description,latitude,longitude,created_at,updated_at").in("id",ids).order("name"),
    svc.from("organization_booking_services").select("organization_id,service_type,enabled,duration_minutes,booking_horizon_days,min_notice_hours").in("organization_id",ids),
    svc.from("organization_booking_hours").select("id,organization_id,weekday,start_time,end_time,enabled").in("organization_id",ids).order("weekday"),
    svc.from("organization_members").select("id,organization_id,user_id,role,status,access_scope,joined_at,created_at").in("organization_id",ids).neq("status","revoked"),
    svc.from("organization_appointments").select("id,organization_id,patient_id,assigned_user_id,appointment_type,scheduled_start,scheduled_end,status,intake_status,booking_source,created_at").in("organization_id",ids).gte("scheduled_start",new Date(Date.now()-14*86400000).toISOString()).order("scheduled_start"),
    svc.from("patients").select("id,organization_id,patient_user_id,external_reference,first_name,last_name,preferred_name,birth_date,email,status").in("organization_id",ids).order("created_at",{ascending:false}).limit(700),
    svc.from("patient_service_requests").select("id,user_id,service,status,assigned_organization_id,assigned_professional_user_id,patient_id,assessment_id,submitted_at,assigned_at,accepted_at,completed_at,scheduled_at,preferred_city,message").in("assigned_organization_id",ids).order("submitted_at",{ascending:false}).limit(500)
  ]);
  const err=oq.error||sq.error||hq.error||mq.error||aq.error||pq.error||rq.error;if(err)return json(req,{error:"overview_failed",detail:err.message},500);

  const allowedAppointment=(a:any)=>{if(isAdmin)return true;const m=mmap.get(a.organization_id);if(!m)return false;if(MANAGER.has(m.role))return true;if(m.access_scope==="clinical")return true;return a.appointment_type==="motion"};
  const allowedRequest=(r:any)=>{if(isAdmin)return true;const m=mmap.get(r.assigned_organization_id);if(!m)return false;if(MANAGER.has(m.role))return true;if(m.access_scope==="clinical")return true;return r.service==="motion"};
  const appointments=(aq.data??[]).filter(allowedAppointment);
  const requests0=(rq.data??[]).filter(allowedRequest);
  const allowedPatientIds=new Set<string>();
  for(const a of appointments)if(a.patient_id)allowedPatientIds.add(a.patient_id);
  for(const r of requests0)if(r.patient_id)allowedPatientIds.add(r.patient_id);
  const patients=(pq.data??[]).filter((p:any)=>isAdmin||canManageIds.includes(p.organization_id)||allowedPatientIds.has(p.id));

  const members:any[]=[];
  for(const m of mq.data??[]){const [u,p]=await Promise.all([svc.auth.admin.getUserById(m.user_id),svc.from("profiles").select("display_name,first_name,last_name,city,country,phone").eq("id",m.user_id).maybeSingle()]);members.push({...m,email:u.data?.user?.email??null,profile:p.data??null})}
  const userIds=[...new Set(requests0.map((r:any)=>r.user_id).filter(Boolean))];
  const profiles=userIds.length?(await svc.from("profiles").select("id,display_name,first_name,last_name,phone,city").in("id",userIds)).data??[]:[];
  const pmap=new Map(profiles.map((p:any)=>[p.id,p]));
  const requests=requests0.map((r:any)=>({...r,profile:pmap.get(r.user_id)??null}));
  const centers=(oq.data??[]).map((c:any)=>{const m=mmap.get(c.id);return{...c,can_manage:isAdmin||MANAGER.has(m?.role),membership_role:m?.role??(isAdmin?"admin":null),membership_scope:m?.access_scope??(isAdmin?"clinical":null)}});
  return json(req,{centers,services:sq.data??[],hours:hq.data??[],members,appointments,patients,requests,account_role:accountRole,can_manage_ids:canManageIds});
});
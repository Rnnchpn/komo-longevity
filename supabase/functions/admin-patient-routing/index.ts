import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U=Deno.env.get("SUPABASE_URL")??"";
const A=Deno.env.get("SUPABASE_ANON_KEY")??"";
const S=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const R=Deno.env.get("RESEND_API_KEY")??"";
const FROM=Deno.env.get("PULSE_EMAIL_FROM")??"KŌMØ Pulse <noreply@auth.komolongevity.com>";
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com"]);

function cors(req:Request){const o=req.headers.get("origin")??"";return{"Access-Control-Allow-Origin":ORIGINS.has(o)?o:"https://pulse.komolongevity.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function json(req:Request,b:unknown,status=200){return new Response(JSON.stringify(b),{status,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8"}})}
function clean(v:unknown,n=128){return String(v??"").trim().slice(0,n)}
function safe(v:unknown){return String(v??"").replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]||c))}
async function mail(to:string|null|undefined,subject:string,html:string){if(!R||!to)return false;const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${R}`,"Content-Type":"application/json"},body:JSON.stringify({from:FROM,to:[to],subject,html,reply_to:"contact@komolongevity.com"})});return r.ok}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"method_not_allowed"},405);
  const token=(req.headers.get("Authorization")??"").replace(/^Bearer\s+/i,"");
  if(!token)return json(req,{error:"unauthorized"},401);

  const userClient=createClient(U,A,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const service=createClient(U,S,{auth:{persistSession:false}});
  const ur=await userClient.auth.getUser(token),actor=ur.data?.user;
  if(ur.error||!actor)return json(req,{error:"unauthorized"},401);
  const rr=await service.from("account_roles").select("role").eq("user_id",actor.id).maybeSingle();
  if(rr.data?.role!=="admin")return json(req,{error:"admin_required"},403);

  let body:any={};try{body=await req.json()}catch{return json(req,{error:"invalid_json"},400)}
  if(String(body.action??"route")!=="route")return json(req,{error:"unknown_action"},400);

  let userId=clean(body.user_id,64);
  const patientId=clean(body.patient_id,64);
  const organizationId=clean(body.organization_id,64);
  const professionalId=clean(body.professional_user_id,64)||null;
  if(!organizationId)return json(req,{error:"organization_required"},400);

  if(!userId&&patientId){
    const pr=await service.from("patients").select("patient_user_id").eq("id",patientId).maybeSingle();
    if(pr.error)return json(req,{error:"patient_lookup_failed",detail:pr.error.message},500);
    userId=String(pr.data?.patient_user_id??"");
    if(!userId)return json(req,{error:"synthetic_patient_has_no_account"},409);
  }
  if(!userId)return json(req,{error:"user_required"},400);

  const [targetUser,org,profile]=await Promise.all([
    service.auth.admin.getUserById(userId),
    service.from("organizations").select("id,name,status,booking_published").eq("id",organizationId).maybeSingle(),
    service.from("profiles").select("first_name,last_name,city").eq("id",userId).maybeSingle()
  ]);
  if(targetUser.error||!targetUser.data?.user)return json(req,{error:"patient_account_not_found"},404);
  if(org.error)return json(req,{error:"organization_lookup_failed",detail:org.error.message},500);
  if(!org.data||org.data.status!=="active")return json(req,{error:"active_organization_required"},409);

  if(professionalId){
    const mr=await service.from("organization_members").select("user_id,status,access_scope,role").eq("organization_id",organizationId).eq("user_id",professionalId).eq("status","active").maybeSingle();
    if(mr.error)return json(req,{error:"professional_lookup_failed",detail:mr.error.message},500);
    if(!mr.data||!["motion","clinical"].includes(mr.data.access_scope))return json(req,{error:"eligible_professional_required"},409);
  }

  const open=await service.from("patient_service_requests").select("*").eq("user_id",userId).eq("service","motion").in("status",["submitted","assigned","accepted","scheduled"]).order("submitted_at",{ascending:false}).limit(1).maybeSingle();
  if(open.error)return json(req,{error:"request_lookup_failed",detail:open.error.message},500);
  if(open.data&&["accepted","scheduled"].includes(open.data.status)&&open.data.assigned_organization_id!==organizationId){
    return json(req,{error:"request_already_progressed",status:open.data.status,organization_id:open.data.assigned_organization_id},409);
  }

  const now=new Date().toISOString();let request:any;
  if(open.data){
    const q=await service.from("patient_service_requests").update({status:open.data.status==="scheduled"?"scheduled":open.data.status==="accepted"?"accepted":"assigned",assigned_organization_id:organizationId,assigned_professional_user_id:professionalId,assigned_at:open.data.assigned_at??now,updated_at:now}).eq("id",open.data.id).select("*").single();
    if(q.error)return json(req,{error:"route_update_failed",detail:q.error.message},500);request=q.data;
  }else{
    const q=await service.from("patient_service_requests").insert({user_id:userId,service:"motion",status:"assigned",preferred_city:profile.data?.city??null,assigned_organization_id:organizationId,assigned_professional_user_id:professionalId,submitted_at:now,assigned_at:now}).select("*").single();
    if(q.error)return json(req,{error:"route_create_failed",detail:q.error.message},500);request=q.data;
  }

  await service.from("audit_events").insert({organization_id:organizationId,actor_user_id:actor.id,event_type:"patient_routed_by_admin",entity_type:"patient_service_request",entity_id:request.id,event_detail:{patient_user_id:userId,professional_user_id:professionalId}});
  const patientName=[profile.data?.first_name,profile.data?.last_name].filter(Boolean).join(" ")||targetUser.data.user.email||"Patient";
  await Promise.allSettled([
    mail(targetUser.data.user.email,"Votre parcours KŌMØ Motion a été orienté",`<p>Bonjour ${safe(profile.data?.first_name||"")},</p><p>Votre parcours KŌMØ Motion a été orienté vers <strong>${safe(org.data.name)}</strong>.</p><p>Vous pouvez retrouver l’avancement et vos rendez-vous dans KŌMØ Pulse.</p>`),
    professionalId?service.auth.admin.getUserById(professionalId).then(x=>mail(x.data?.user?.email,"Nouveau patient orienté · KŌMØ Motion",`<p><strong>${safe(patientName)}</strong> vient d’être orienté vers votre centre dans KŌMØ Pulse.</p>`)):Promise.resolve(false)
  ]);
  return json(req,{ok:true,request,organization:org.data});
});

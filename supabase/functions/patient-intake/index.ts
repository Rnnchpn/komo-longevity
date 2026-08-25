import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")??"";
const ANON_KEY=Deno.env.get("SUPABASE_ANON_KEY")??"";
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const RESEND_KEY=Deno.env.get("RESEND_API_KEY")??"";
const FROM=Deno.env.get("PULSE_EMAIL_FROM")??"KŌMØ Pulse <noreply@auth.komolongevity.com>";
const ADMIN_EMAIL=Deno.env.get("PROFESSIONAL_ADMIN_EMAIL")??"contact@komolongevity.com";
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com"]);

function cors(req:Request){const o=req.headers.get("origin")??"";return{"Access-Control-Allow-Origin":ORIGINS.has(o)?o:"https://pulse.komolongevity.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8"}})}
function safe(v:unknown){return String(v??"").replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]||c))}
async function mail(to:string|undefined|null,subject:string,html:string){if(!RESEND_KEY||!to)return false;const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${RESEND_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:FROM,to:[to],subject,html,reply_to:"contact@komolongevity.com"})});return r.ok}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"method_not_allowed"},405);
  if(!SUPABASE_URL||!ANON_KEY||!SERVICE_KEY)return json(req,{error:"server_configuration_missing"},500);
  const token=(req.headers.get("Authorization")??"").replace(/^Bearer\s+/i,"");
  if(!token)return json(req,{error:"unauthorized"},401);
  const userClient=createClient(SUPABASE_URL,ANON_KEY,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const service=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false}});
  const ur=await userClient.auth.getUser(token),actor=ur.data?.user;
  if(ur.error||!actor)return json(req,{error:"unauthorized"},401);
  const roleRes=await service.from("account_roles").select("role").eq("user_id",actor.id).maybeSingle();
  const accountRole=roleRes.data?.role??"member";
  const isAdmin=accountRole==="admin";
  let body:any={};try{body=await req.json()}catch{return json(req,{error:"invalid_json"},400)}
  const action=String(body.action??"status");

  const getProfile=async(userId:string)=>{
    const p=await service.from("profiles").select("id,display_name,first_name,last_name,phone,birth_date,sex_at_birth,city,country,locale,newsletter_opt_in").eq("id",userId).maybeSingle();
    if(p.error)throw new Error(p.error.message);
    return p.data;
  };
  const getAuthEmail=async(userId:string)=>{const a=await service.auth.admin.getUserById(userId);return a.data?.user?.email??null};
  const memberships=async()=>{const m=await service.from("organization_members").select("organization_id,role,status,access_scope,organizations(id,name,clinical_data_status)").eq("user_id",actor.id).eq("status","active");if(m.error)throw new Error(m.error.message);return m.data??[]};
  const enrich=async(rows:any[])=>Promise.all(rows.map(async r=>{const [profile,email]=await Promise.all([getProfile(r.user_id),getAuthEmail(r.user_id)]);return{...r,profile,email}}));

  if(action==="status"){
    const r=await service.from("patient_service_requests").select("*").eq("user_id",actor.id).order("submitted_at",{ascending:false}).limit(20);
    if(r.error)return json(req,{error:"status_failed",detail:r.error.message},500);
    return json(req,{requests:r.data??[]});
  }

  if(action==="submit"){
    const serviceType=String(body.service??"motion");
    if(serviceType!=="motion")return json(req,{error:"unsupported_service"},400);
    const p=await getProfile(actor.id);
    const missing=[!p?.first_name&&"first_name",!p?.last_name&&"last_name",!p?.birth_date&&"birth_date",!p?.sex_at_birth&&"sex_at_birth"].filter(Boolean);
    if(missing.length)return json(req,{error:"profile_incomplete",missing},409);
    const open=await service.from("patient_service_requests").select("id,status").eq("user_id",actor.id).eq("service",serviceType).in("status",["submitted","assigned","accepted","scheduled"]).limit(1);
    if(open.error)return json(req,{error:"duplicate_check_failed",detail:open.error.message},500);
    if(open.data?.length)return json(req,{error:"request_already_open",request:open.data[0]},409);
    const preferredCity=String(body.preferred_city??p?.city??"").trim().slice(0,120)||null;
    const message=String(body.message??"").trim().slice(0,1200)||null;
    const ins=await service.from("patient_service_requests").insert({user_id:actor.id,service:"motion",status:"submitted",preferred_city:preferredCity,message}).select("*").single();
    if(ins.error)return json(req,{error:"submit_failed",detail:ins.error.message},500);
    await Promise.allSettled([
      mail(ADMIN_EMAIL,"Nouvelle demande patient · KŌMØ Motion",`<p><strong>${safe(p?.first_name)} ${safe(p?.last_name)}</strong> souhaite réaliser un KŌMØ Motion.</p><p>Ville souhaitée : ${safe(preferredCity||"Non précisée")}<br>E-mail : ${safe(actor.email||"—")}</p><p>À traiter dans Pulse → Pro → Demandes.</p>`),
      mail(actor.email,"Votre demande KŌMØ Motion a bien été reçue","<p>Votre demande KŌMØ Motion a bien été reçue.</p><p>Vous pouvez suivre son statut directement dans KŌMØ Pulse. L’équipe KŌMØ vous indiquera la prochaine étape.</p>")
    ]);
    return json(req,{ok:true,request:ins.data});
  }

  if(action==="list_admin"){
    if(!isAdmin)return json(req,{error:"admin_required"},403);
    const [rq,orgs,members]=await Promise.all([
      service.from("patient_service_requests").select("*").order("submitted_at",{ascending:false}).limit(200),
      service.from("organizations").select("id,name,clinical_data_status,status").eq("status","active").order("name"),
      service.from("organization_members").select("organization_id,user_id,role,status,access_scope").eq("status","active")
    ]);
    if(rq.error)return json(req,{error:"list_failed",detail:rq.error.message},500);
    const professionalMembers=[] as any[];
    for(const m of members.data??[]){if(!["motion","clinical"].includes(m.access_scope))continue;const email=await getAuthEmail(m.user_id);professionalMembers.push({...m,email})}
    return json(req,{requests:await enrich(rq.data??[]),organizations:orgs.data??[],professionals:professionalMembers});
  }

  if(action==="list_pro"){
    if(!["professional","admin"].includes(accountRole))return json(req,{error:"professional_required"},403);
    const ms=await memberships();
    const orgIds=ms.filter((m:any)=>["motion","clinical"].includes(m.access_scope)||isAdmin).map((m:any)=>m.organization_id);
    if(!orgIds.length)return json(req,{requests:[],organizations:[]});
    const r=await service.from("patient_service_requests").select("*").in("assigned_organization_id",orgIds).order("submitted_at",{ascending:false}).limit(200);
    if(r.error)return json(req,{error:"list_failed",detail:r.error.message},500);
    return json(req,{requests:await enrich(r.data??[]),organizations:ms});
  }

  const requestId=String(body.request_id??"");
  if(!requestId)return json(req,{error:"request_id_required"},400);
  const lookup=await service.from("patient_service_requests").select("*").eq("id",requestId).maybeSingle(),request=lookup.data;
  if(lookup.error)return json(req,{error:"request_lookup_failed",detail:lookup.error.message},500);
  if(!request)return json(req,{error:"request_not_found"},404);

  if(action==="assign"){
    if(!isAdmin)return json(req,{error:"admin_required"},403);
    if(!["submitted","assigned"].includes(request.status))return json(req,{error:"invalid_status_transition",status:request.status},409);
    const organizationId=String(body.organization_id??"");
    const professionalUserId=String(body.professional_user_id??"")||null;
    if(!organizationId)return json(req,{error:"organization_required"},400);
    const org=await service.from("organizations").select("id,name,status,clinical_data_status").eq("id",organizationId).maybeSingle();
    if(!org.data||org.data.status!=="active")return json(req,{error:"active_organization_required"},409);
    if(professionalUserId){const mr=await service.from("organization_members").select("role,status,access_scope").eq("organization_id",organizationId).eq("user_id",professionalUserId).eq("status","active").maybeSingle();if(!mr.data||!["motion","clinical"].includes(mr.data.access_scope))return json(req,{error:"eligible_professional_required"},409)}
    const now=new Date().toISOString();
    const up=await service.from("patient_service_requests").update({status:"assigned",assigned_organization_id:organizationId,assigned_professional_user_id:professionalUserId,assigned_at:now}).eq("id",requestId).select("*").single();
    if(up.error)return json(req,{error:"assign_failed",detail:up.error.message},500);
    const patientEmail=await getAuthEmail(request.user_id),profEmail=professionalUserId?await getAuthEmail(professionalUserId):null;
    await Promise.allSettled([
      mail(patientEmail,"Votre demande KŌMØ Motion avance",`<p>Votre demande KŌMØ Motion a été attribuée à <strong>${safe(org.data.name)}</strong>.</p><p>Vous retrouverez la suite dans KŌMØ Pulse.</p>`),
      mail(profEmail,"Nouvelle demande patient · KŌMØ Motion",`<p>Une nouvelle demande KŌMØ Motion vous a été assignée.</p><p>Connectez-vous à Pulse → Pro → Demandes pour l’accepter et préparer le bilan.</p>`)
    ]);
    return json(req,{ok:true,request:up.data});
  }

  if(action==="accept"){
    if(!["professional","admin"].includes(accountRole))return json(req,{error:"professional_required"},403);
    if(!["assigned","accepted"].includes(request.status))return json(req,{error:"invalid_status_transition",status:request.status},409);
    const ms=await memberships();
    const membership=ms.find((m:any)=>m.organization_id===request.assigned_organization_id&&(["motion","clinical"].includes(m.access_scope)||isAdmin));
    if(!membership)return json(req,{error:"organization_access_required"},403);
    if(request.assigned_professional_user_id&&request.assigned_professional_user_id!==actor.id&&!isAdmin)return json(req,{error:"request_assigned_to_other_professional"},403);
    if(request.patient_id&&request.assessment_id)return json(req,{ok:true,patient_id:request.patient_id,assessment_id:request.assessment_id,idempotent:true});
    const p=await getProfile(request.user_id),email=await getAuthEmail(request.user_id);
    const missing=[!p?.first_name&&"first_name",!p?.last_name&&"last_name",!p?.birth_date&&"birth_date",!p?.sex_at_birth&&"sex_at_birth"].filter(Boolean);
    if(missing.length)return json(req,{error:"patient_profile_incomplete",missing},409);
    let patient:any=null;
    const existing=await userClient.from("patients").select("*").eq("organization_id",request.assigned_organization_id).eq("patient_user_id",request.user_id).maybeSingle();
    if(existing.error)return json(req,{error:"patient_lookup_failed",detail:existing.error.message},500);
    patient=existing.data;
    if(!patient){
      const classification=(membership.organizations as any)?.clinical_data_status==="test_only"?"synthetic":"health_data";
      const external=`PULSE-${request.user_id.slice(0,8)}-${String(request.assigned_organization_id).slice(0,6)}`;
      const ins=await userClient.from("patients").insert({organization_id:request.assigned_organization_id,patient_user_id:request.user_id,external_reference:external,first_name:p.first_name,last_name:p.last_name,preferred_name:p.display_name||null,birth_date:p.birth_date,sex_at_birth:p.sex_at_birth,email,phone:p.phone||null,locale:p.locale||"fr-FR",status:"active",created_by:actor.id,data_classification:classification,synthetic_attested_at:classification==="synthetic"?new Date().toISOString():null,synthetic_attested_by:classification==="synthetic"?actor.id:null}).select("*").single();
      if(ins.error)return json(req,{error:"patient_create_failed",detail:ins.error.message},500);
      patient=ins.data;
    }
    let assessmentId=request.assessment_id;
    if(!assessmentId){
      const ar=await userClient.rpc("create_pulse_assessment",{target_patient_id:patient.id,target_product_mode:"motion",target_assessment_type:"baseline",target_scheduled_at:null,target_device_kit_id:null});
      if(ar.error)return json(req,{error:"assessment_create_failed",detail:ar.error.message,patient_id:patient.id},500);
      assessmentId=ar.data;
    }
    const now=new Date().toISOString();
    const up=await service.from("patient_service_requests").update({status:"accepted",assigned_professional_user_id:request.assigned_professional_user_id||actor.id,patient_id:patient.id,assessment_id:assessmentId,accepted_at:now}).eq("id",requestId);
    if(up.error)return json(req,{error:"request_update_failed",detail:up.error.message,patient_id:patient.id,assessment_id:assessmentId},500);
    await mail(email,"Votre bilan KŌMØ Motion est préparé","<p>Votre demande a été acceptée et votre bilan KŌMØ Motion est maintenant préparé dans Pulse.</p><p>Votre professionnel pourra poursuivre les mesures avec vous.</p>");
    return json(req,{ok:true,patient_id:patient.id,assessment_id:assessmentId});
  }

  if(action==="decline"){
    const allowed=isAdmin||(["professional"].includes(accountRole)&&request.assigned_professional_user_id===actor.id);
    if(!allowed)return json(req,{error:"forbidden"},403);
    const up=await service.from("patient_service_requests").update({status:"declined"}).eq("id",requestId);
    if(up.error)return json(req,{error:"decline_failed",detail:up.error.message},500);
    await mail(await getAuthEmail(request.user_id),"Mise à jour de votre demande KŌMØ Motion","<p>Votre demande KŌMØ Motion ne peut pas être poursuivie dans ce contexte. L’équipe KŌMØ peut vous orienter vers une autre option.</p>");
    return json(req,{ok:true,status:"declined"});
  }

  return json(req,{error:"unknown_action"},400);
});

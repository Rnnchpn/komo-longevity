import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U=Deno.env.get("SUPABASE_URL")??"";
const A=Deno.env.get("SUPABASE_ANON_KEY")??"";
const S=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com"]);
const ELIGIBLE_ROLES=new Set(["owner","clinical_admin","physician","operator","coordinator"]);
const SEX_VALUES=new Set(["female","male","intersex","unknown","not_stated"]);
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cors(req:Request){const origin=req.headers.get("origin")??"";return{"Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://pulse.komolongevity.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8"}})}

async function findAuthUserByEmail(svc:any,email:string){
  const target=email.toLowerCase();
  for(let page=1;page<=10;page++){
    const result=await svc.auth.admin.listUsers({page,perPage:200});
    if(result.error)throw result.error;
    const users=result.data?.users??[];
    const found=users.find((u:any)=>String(u.email??"").toLowerCase()===target);
    if(found)return found;
    if(users.length<200)break;
  }
  return null;
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"method_not_allowed"},405);
  const token=(req.headers.get("Authorization")??"").replace(/^Bearer\s+/i,"");
  if(!token)return json(req,{error:"unauthorized"},401);

  const uc=createClient(U,A,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const svc=createClient(U,S,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const userResult=await uc.auth.getUser(token),actor=userResult.data?.user;
  if(userResult.error||!actor)return json(req,{error:"unauthorized"},401);

  let body:any={};
  try{body=await req.json()}catch{return json(req,{error:"invalid_json"},400)}
  if(String(body.action??"create")!=="create")return json(req,{error:"unknown_action"},400);

  const organizationId=String(body.organization_id??"").trim();
  const firstName=String(body.first_name??"").trim().slice(0,100);
  const lastName=String(body.last_name??"").trim().slice(0,100);
  const birthDate=String(body.birth_date??"").trim();
  const sexAtBirth=String(body.sex_at_birth??"not_stated").trim();
  const patientEmail=String(body.email??"").trim().toLowerCase().slice(0,320);
  const phone=String(body.phone??"").trim().slice(0,80);
  const createAccount=body.create_account===true;

  if(!organizationId||!firstName||!lastName||!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)||!SEX_VALUES.has(sexAtBirth))return json(req,{error:"invalid_patient_fields"},400);
  if(patientEmail&&!EMAIL_RE.test(patientEmail))return json(req,{error:"invalid_email"},400);
  if(createAccount&&!patientEmail)return json(req,{error:"email_required_for_account"},400);

  const [roleResult,membershipResult,orgResult]=await Promise.all([
    svc.from("account_roles").select("role").eq("user_id",actor.id).maybeSingle(),
    svc.from("organization_members").select("role,status,access_scope").eq("organization_id",organizationId).eq("user_id",actor.id).eq("status","active").maybeSingle(),
    svc.from("organizations").select("id,name,status,clinical_data_status").eq("id",organizationId).maybeSingle()
  ]);
  if(roleResult.error)return json(req,{error:"role_check_failed",detail:roleResult.error.message},500);
  if(membershipResult.error)return json(req,{error:"membership_check_failed",detail:membershipResult.error.message},500);
  if(orgResult.error)return json(req,{error:"organization_check_failed",detail:orgResult.error.message},500);

  const accountRole=roleResult.data?.role??"member";
  const isAdmin=accountRole==="admin";
  const membership=membershipResult.data;
  const org=orgResult.data;
  if(!["professional","admin"].includes(accountRole))return json(req,{error:"professional_required"},403);
  if(!org||org.status!=="active")return json(req,{error:"active_organization_required"},409);
  if(!["test_only","production_enabled"].includes(org.clinical_data_status))return json(req,{error:"center_data_status_unavailable"},409);
  if(!isAdmin&&(!membership||!ELIGIBLE_ROLES.has(membership.role)))return json(req,{error:"patient_create_scope_required"},403);

  let accountUser:any=null;
  let invited=false;
  let newlyCreatedAuth=false;

  if(createAccount){
    try{
      accountUser=await findAuthUserByEmail(svc,patientEmail);
      if(!accountUser){
        const invitation=await svc.auth.admin.inviteUserByEmail(patientEmail,{
          data:{first_name:firstName,last_name:lastName,birth_date:birthDate,phone:phone||null,display_name:`${firstName} ${lastName}`.trim(),locale:"fr-FR"},
          redirectTo:"https://pulse.komolongevity.com/#profile"
        });
        if(invitation.error)return json(req,{error:"patient_invite_failed",detail:invitation.error.message},409);
        accountUser=invitation.data?.user??null;
        invited=Boolean(accountUser?.id);
        newlyCreatedAuth=invited;
      }else if(!accountUser.email_confirmed_at){
        const resend=await svc.auth.admin.inviteUserByEmail(patientEmail,{
          data:{first_name:firstName,last_name:lastName,birth_date:birthDate,phone:phone||null,display_name:`${firstName} ${lastName}`.trim(),locale:"fr-FR"},
          redirectTo:"https://pulse.komolongevity.com/#profile"
        });
        if(!resend.error)invited=true;
      }
    }catch(error:any){
      return json(req,{error:"patient_account_lookup_failed",detail:error?.message??String(error)},500);
    }
  }

  const accountUserId=accountUser?.id??null;
  if(accountUserId){
    const existing=await svc.from("patients").select("*").eq("organization_id",organizationId).eq("patient_user_id",accountUserId).neq("status","archived").order("created_at",{ascending:true}).limit(1).maybeSingle();
    if(existing.error)return json(req,{error:"existing_patient_lookup_failed",detail:existing.error.message},500);
    if(existing.data){
      return json(req,{ok:true,patient:existing.data,organization:{id:org.id,name:org.name},account:{linked:true,invited,email:patientEmail,existing:true}});
    }
  }

  const externalReference=`POC-${Date.now()}-${crypto.randomUUID().slice(0,8)}`;
  const now=new Date().toISOString();
  const classification=org.clinical_data_status==="test_only"?"synthetic":"health_data";
  const patientInsert=await svc.from("patients").insert({
    organization_id:organizationId,
    patient_user_id:accountUserId,
    external_reference:externalReference,
    first_name:firstName,
    last_name:lastName,
    birth_date:birthDate,
    sex_at_birth:sexAtBirth,
    email:patientEmail||null,
    phone:phone||null,
    locale:"fr-FR",
    status:"active",
    created_by:actor.id,
    data_classification:classification,
    synthetic_attested_at:classification==="synthetic"?now:null,
    synthetic_attested_by:classification==="synthetic"?actor.id:null
  }).select("*").single();

  if(patientInsert.error){
    return json(req,{error:"patient_create_failed",detail:patientInsert.error.message},500);
  }

  const patient=patientInsert.data;
  if(membership&&ELIGIBLE_ROLES.has(membership.role)){
    const assignmentRole=membership.role==="physician"?"clinical_practitioner":membership.role==="operator"?"motion_operator":membership.role==="coordinator"?"coordinator":"primary";
    const assignment=await svc.from("patient_care_assignments").insert({
      organization_id:organizationId,
      patient_id:patient.id,
      professional_user_id:actor.id,
      assignment_role:assignmentRole,
      access_scope:membership.access_scope==="clinical"?"clinical":"motion",
      status:"active",
      source:"patient_created",
      assigned_by:actor.id,
      assigned_at:now
    });
    if(assignment.error){
      await svc.from("patients").delete().eq("id",patient.id);
      return json(req,{error:"patient_assignment_failed",detail:assignment.error.message},500);
    }
  }

  return json(req,{ok:true,patient,organization:{id:org.id,name:org.name},account:{linked:Boolean(accountUserId),invited,email:patientEmail||null,existing:Boolean(accountUserId&&!newlyCreatedAuth)}});
});

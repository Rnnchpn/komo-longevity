import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
const U=Deno.env.get("SUPABASE_URL")??"",A=Deno.env.get("SUPABASE_ANON_KEY")??"",S=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com"]);
function cors(req:Request){const o=req.headers.get("origin")??"";return{"Access-Control-Allow-Origin":ORIGINS.has(o)?o:"https://pulse.komolongevity.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function out(req:Request,b:unknown,s=200){return new Response(JSON.stringify(b),{status:s,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}})}
function str(v:any,max=200){const x=String(v??"").trim();return x?x.slice(0,max):null}
Deno.serve(async(req:Request)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});if(req.method!=="POST")return out(req,{error:"method_not_allowed"},405);
 const token=(req.headers.get("Authorization")??"").replace(/^Bearer\s+/i,"");if(!token)return out(req,{error:"unauthorized"},401);
 const uc=createClient(U,A,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}}),svc=createClient(U,S,{auth:{persistSession:false}});
 const ur=await uc.auth.getUser(token),actor=ur.data?.user;if(ur.error||!actor)return out(req,{error:"unauthorized"},401);
 const rr=await svc.from("account_roles").select("role").eq("user_id",actor.id).maybeSingle();if(rr.data?.role!=="admin")return out(req,{error:"admin_required"},403);
 let body:any={};try{body=await req.json()}catch{return out(req,{error:"invalid_json"},400)}const action=String(body.action??"list_records");
 if(action==="list_records"){
  const pr=await svc.from("patients").select("id,organization_id,patient_user_id,external_reference,first_name,last_name,preferred_name,birth_date,sex_at_birth,email,status,data_classification,created_at,updated_at,organizations(id,name,city,clinical_data_status)").order("updated_at",{ascending:false}).limit(2000);if(pr.error)return out(req,{error:"patients_failed",detail:pr.error.message},500);
  const rows=pr.data??[],ids=rows.map((p:any)=>p.id),uids=[...new Set(rows.map((p:any)=>p.patient_user_id).filter(Boolean))];let profiles:any[]=[],users:any[]=[];
  if(uids.length){const p=await svc.from("profiles").select("id,display_name,first_name,last_name,phone,birth_date,sex_at_birth,city,country,address_line1,postal_code,locale").in("id",uids);if(p.error)return out(req,{error:"profiles_failed",detail:p.error.message},500);profiles=p.data??[];const au=await svc.auth.admin.listUsers({page:1,perPage:1000});if(!au.error)users=(au.data?.users??[]).filter((u:any)=>uids.includes(u.id));}
  const [ar,ap,rq]=ids.length?await Promise.all([svc.from("assessments").select("id,patient_id,status,protocol_version").in("patient_id",ids),svc.from("organization_appointments").select("id,patient_id,status,scheduled_start").in("patient_id",ids),svc.from("patient_service_requests").select("id,patient_id,status").in("patient_id",ids)]):[{data:[]},{data:[]},{data:[]}];
  const pm=new Map(profiles.map((x:any)=>[x.id,x])),um=new Map(users.map((x:any)=>[x.id,x]));const count=(arr:any[],pid:string)=>arr.filter(x=>x.patient_id===pid).length;
  return out(req,{records:rows.map((p:any)=>({...p,profile:p.patient_user_id?pm.get(p.patient_user_id)??null:null,account:p.patient_user_id?(()=>{const u=um.get(p.patient_user_id);return u?{email:u.email,created_at:u.created_at,last_sign_in_at:u.last_sign_in_at,email_confirmed_at:u.email_confirmed_at}:null})():null,assessment_count:count(ar.data??[],p.id),appointment_count:count(ap.data??[],p.id),request_count:count(rq.data??[],p.id)}))});
 }
 const pid=String(body.patient_id??"");if(!pid)return out(req,{error:"patient_id_required"},400);const one=await svc.from("patients").select("*").eq("id",pid).maybeSingle();if(one.error)return out(req,{error:"patient_failed",detail:one.error.message},500);if(!one.data)return out(req,{error:"patient_not_found"},404);const patient:any=one.data;
 if(action==="detail"){
  const [as,ap,rq,th]=await Promise.all([svc.from("assessments").select("id,protocol_version,status,started_at,completed_at,created_at").eq("patient_id",pid).order("created_at",{ascending:false}),svc.from("organization_appointments").select("id,appointment_type,status,scheduled_start,scheduled_end,assigned_user_id,organization_id").eq("patient_id",pid).order("scheduled_start",{ascending:false}),svc.from("patient_service_requests").select("id,service,status,submitted_at,scheduled_at,assigned_organization_id,assigned_professional_user_id,assessment_id").eq("patient_id",pid).order("submitted_at",{ascending:false}),svc.from("message_threads").select("id,last_message_at,status").eq("patient_id",pid)]);
  let profile=null;if(patient.patient_user_id){const p=await svc.from("profiles").select("*").eq("id",patient.patient_user_id).maybeSingle();profile=p.data??null;}return out(req,{patient,profile,assessments:as.data??[],appointments:ap.data??[],requests:rq.data??[],threads:th.data??[]});
 }
 if(action==="update"){
  const patch:any={};for(const k of ["first_name","last_name","preferred_name","email","external_reference"]){if(k in body)patch[k]=str(body[k],k==="external_reference"?120:200)}if("birth_date" in body)patch.birth_date=body.birth_date||null;if("sex_at_birth" in body)patch.sex_at_birth=body.sex_at_birth||"not_stated";
  if(Object.keys(patch).length){const q=await svc.from("patients").update(patch).eq("id",pid).select("*").single();if(q.error)return out(req,{error:"patient_update_failed",detail:q.error.message},400);}
  if(patient.patient_user_id){const pp:any={};for(const k of ["first_name","last_name","phone","city","country","address_line1","postal_code"]){if(k in body)pp[k]=str(body[k],200)}if("birth_date" in body)pp.birth_date=body.birth_date||null;if("sex_at_birth" in body)pp.sex_at_birth=body.sex_at_birth||"not_stated";if(Object.keys(pp).length){const q=await svc.from("profiles").update(pp).eq("id",patient.patient_user_id);if(q.error)return out(req,{error:"profile_update_failed",detail:q.error.message},400)}}return out(req,{ok:true});
 }
 if(action==="archive"||action==="restore"){const status=action==="archive"?"archived":"active";const q=await svc.from("patients").update({status}).eq("id",pid).select("id,status").single();if(q.error)return out(req,{error:"status_update_failed",detail:q.error.message},400);return out(req,{ok:true,patient:q.data});}
 if(action==="purge"){
  if(patient.data_classification!=="synthetic")return out(req,{error:"synthetic_only",detail:"La suppression définitive est désactivée pour les dossiers de données de santé."},409);const q=await uc.rpc("admin_purge_synthetic_patient",{p_patient_id:pid});if(q.error)return out(req,{error:"purge_failed",detail:q.error.message},400);return out(req,{ok:true,result:q.data});
 }
 return out(req,{error:"unknown_action"},400);
});
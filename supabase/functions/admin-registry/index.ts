import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U=Deno.env.get("SUPABASE_URL")??"";
const A=Deno.env.get("SUPABASE_ANON_KEY")??"";
const S=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com"]);

function cors(req:Request){const origin=req.headers.get("origin")??"";return{"Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://pulse.komolongevity.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8"}})}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"method_not_allowed"},405);
  const token=(req.headers.get("Authorization")??"").replace(/^Bearer\s+/i,"");
  if(!token)return json(req,{error:"unauthorized"},401);

  const userClient=createClient(U,A,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const service=createClient(U,S,{auth:{persistSession:false}});
  const userResult=await userClient.auth.getUser(token);
  const actor=userResult.data?.user;
  if(userResult.error||!actor)return json(req,{error:"unauthorized"},401);

  const roleResult=await service.from("account_roles").select("role").eq("user_id",actor.id).maybeSingle();
  if(roleResult.data?.role!=="admin")return json(req,{error:"admin_required"},403);

  let body:any={};
  try{body=await req.json()}catch{return json(req,{error:"invalid_json"},400)}
  if(String(body.action??"list")!=="list")return json(req,{error:"unknown_action"},400);

  const [rolesResult,applicationsResult,usersResult]=await Promise.all([
    service.from("account_roles").select("user_id,role").eq("role","member").limit(1000),
    service.from("professional_applications").select("user_id,status").limit(1000),
    service.auth.admin.listUsers({page:1,perPage:1000})
  ]);
  if(rolesResult.error)return json(req,{error:"roles_failed",detail:rolesResult.error.message},500);
  if(applicationsResult.error)return json(req,{error:"applications_failed",detail:applicationsResult.error.message},500);
  if(usersResult.error)return json(req,{error:"users_failed",detail:usersResult.error.message},500);

  const memberIds=(rolesResult.data??[]).map((x:any)=>String(x.user_id));
  if(!memberIds.length)return json(req,{patients:[],counts:{patients:0,member_accounts:0,with_professional_application:0}});

  const [profilesResult,recordsResult,requestsResult]=await Promise.all([
    service.from("profiles").select("id,display_name,first_name,last_name,phone,birth_date,sex_at_birth,city,country,locale,newsletter_opt_in").in("id",memberIds),
    service.from("patients").select("id,patient_user_id,organization_id,status,created_at,external_reference").in("patient_user_id",memberIds).order("created_at",{ascending:false}).limit(2000),
    service.from("patient_service_requests").select("id,user_id,status,service,submitted_at").in("user_id",memberIds).order("submitted_at",{ascending:false}).limit(2000)
  ]);
  if(profilesResult.error)return json(req,{error:"profiles_failed",detail:profilesResult.error.message},500);
  if(recordsResult.error)return json(req,{error:"patient_records_failed",detail:recordsResult.error.message},500);
  if(requestsResult.error)return json(req,{error:"patient_requests_failed",detail:requestsResult.error.message},500);

  const profileMap=new Map((profilesResult.data??[]).map((p:any)=>[String(p.id),p]));
  const appMap=new Map<string,any[]>();
  for(const a of applicationsResult.data??[]){const id=String((a as any).user_id);const arr=appMap.get(id)??[];arr.push(a);appMap.set(id,arr)}
  const recordMap=new Map<string,any[]>();
  for(const r of recordsResult.data??[]){const id=String((r as any).patient_user_id);const arr=recordMap.get(id)??[];arr.push(r);recordMap.set(id,arr)}
  const requestMap=new Map<string,any[]>();
  for(const r of requestsResult.data??[]){const id=String((r as any).user_id);const arr=requestMap.get(id)??[];arr.push(r);requestMap.set(id,arr)}

  const members=new Set(memberIds);
  const patients=(usersResult.data?.users??[])
    .filter((u:any)=>members.has(String(u.id)))
    .map((u:any)=>{
      const applications=appMap.get(String(u.id))??[];
      const records=recordMap.get(String(u.id))??[];
      const requests=requestMap.get(String(u.id))??[];
      return{
        user_id:u.id,
        email:u.email??null,
        created_at:u.created_at??null,
        last_sign_in_at:u.last_sign_in_at??null,
        email_confirmed_at:u.email_confirmed_at??null,
        profile:profileMap.get(String(u.id))??null,
        patient_records:records,
        patient_record_count:records.length,
        service_requests:requests,
        service_request_count:requests.length,
        has_professional_application:applications.length>0,
        professional_application_statuses:applications.map((a:any)=>a.status)
      }
    })
    .sort((a:any,b:any)=>String(b.created_at??"").localeCompare(String(a.created_at??"")));

  const patientOnly=patients.filter((p:any)=>!p.has_professional_application);
  return json(req,{patients:patientOnly,counts:{patients:patientOnly.length,member_accounts:patients.length,with_professional_application:patients.length-patientOnly.length}});
});

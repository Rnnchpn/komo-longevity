import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
const U=Deno.env.get("SUPABASE_URL")??"",A=Deno.env.get("SUPABASE_ANON_KEY")??"",S=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com"]);
function cors(r:Request){const o=r.headers.get("origin")??"";return{"Access-Control-Allow-Origin":ORIGINS.has(o)?o:"https://pulse.komolongevity.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function json(r:Request,b:unknown,s=200){return new Response(JSON.stringify(b),{status:s,headers:{...cors(r),"Content-Type":"application/json; charset=utf-8"}})}
Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"method_not_allowed"},405);
  const token=(req.headers.get("Authorization")??"").replace(/^Bearer\s+/i,"");
  if(!token)return json(req,{error:"unauthorized"},401);
  const uc=createClient(U,A,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}}),svc=createClient(U,S,{auth:{persistSession:false}});
  const ur=await uc.auth.getUser(token),actor=ur.data?.user;
  if(ur.error||!actor)return json(req,{error:"unauthorized"},401);
  const own=await svc.from("organization_members").select("organization_id,role,status,access_scope,organizations(id,name,clinical_data_status)").eq("user_id",actor.id).eq("status","active");
  if(own.error)return json(req,{error:"membership_lookup_failed",detail:own.error.message},500);
  const managed=(own.data??[]).filter((m:any)=>["owner","clinical_admin"].includes(m.role));
  if(!managed.length)return json(req,{managed_centers:[],professionals:[]});
  const ids=managed.map((m:any)=>m.organization_id);
  const members=await svc.from("organization_members").select("organization_id,user_id,role,status,access_scope").in("organization_id",ids).eq("status","active");
  if(members.error)return json(req,{error:"team_lookup_failed",detail:members.error.message},500);
  const professionals:any[]=[];
  for(const m of members.data??[]){
    if(!["motion","clinical"].includes(m.access_scope))continue;
    const [u,p]=await Promise.all([svc.auth.admin.getUserById(m.user_id),svc.from("profiles").select("display_name,first_name,last_name").eq("id",m.user_id).maybeSingle()]);
    const pr=p.data||{} as any,name=(pr.display_name||`${pr.first_name||""} ${pr.last_name||""}`.trim()||u.data?.user?.email||"Professionnel");
    professionals.push({...m,name,email:u.data?.user?.email??null});
  }
  return json(req,{managed_centers:managed,professionals});
});

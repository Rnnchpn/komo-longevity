import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U=Deno.env.get("SUPABASE_URL")??"";
const A=Deno.env.get("SUPABASE_ANON_KEY")??"";
const S=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const R=Deno.env.get("RESEND_API_KEY")??"";
const FROM=Deno.env.get("PULSE_EMAIL_FROM")??"KŌMØ Pulse <noreply@auth.komolongevity.com>";
const ADMIN=Deno.env.get("PRIVACY_ADMIN_EMAIL")??"contact@komolongevity.com";
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com"]);

function cors(req:Request){const origin=req.headers.get("origin")??"";return{"Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://pulse.komolongevity.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8"}})}
function safe(v:unknown){return String(v??"").replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]||c))}
async function mail(to:string|null|undefined,subject:string,html:string){if(!R||!to)return false;const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${R}`,"Content-Type":"application/json"},body:JSON.stringify({from:FROM,to:[to],subject,html,reply_to:"contact@komolongevity.com"})});return response.ok}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"method_not_allowed"},405);
  const token=(req.headers.get("Authorization")??"").replace(/^Bearer\s+/i,"");
  if(!token)return json(req,{error:"unauthorized"},401);
  const uc=createClient(U,A,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const svc=createClient(U,S,{auth:{persistSession:false}});
  const ur=await uc.auth.getUser(token),user=ur.data?.user;
  if(ur.error||!user)return json(req,{error:"unauthorized"},401);
  let body:any={};try{body=await req.json()}catch{return json(req,{error:"invalid_json"},400)}
  const action=String(body.action??"status");

  if(action==="status"){
    const [requests,consents]=await Promise.all([
      svc.from("account_privacy_requests").select("id,request_type,status,request_note,resolution_note,requested_at,updated_at,resolved_at").eq("user_id",user.id).order("requested_at",{ascending:false}).limit(20),
      svc.from("wearable_consents").select("id,purpose,status,data_categories,accepted_at,withdrawn_at,updated_at").eq("user_id",user.id).eq("purpose","connected_followup").order("accepted_at",{ascending:false}).limit(1)
    ]);
    if(requests.error)return json(req,{error:"privacy_requests_failed",detail:requests.error.message},500);
    if(consents.error)return json(req,{error:"wearable_consent_failed",detail:consents.error.message},500);
    return json(req,{requests:requests.data??[],wearable_consent:consents.data?.[0]??null});
  }

  if(action==="submit"){
    const requestType=String(body.request_type??"");
    if(!["data_export","account_closure"].includes(requestType))return json(req,{error:"invalid_request_type"},400);
    const note=String(body.request_note??"").trim().slice(0,1500)||null;
    const open=await svc.from("account_privacy_requests").select("id,request_type,status,requested_at").eq("user_id",user.id).eq("request_type",requestType).in("status",["submitted","in_review"]).order("requested_at",{ascending:false}).limit(1).maybeSingle();
    if(open.error)return json(req,{error:"request_lookup_failed",detail:open.error.message},500);
    if(open.data)return json(req,{ok:true,idempotent:true,request:open.data});
    const ins=await svc.from("account_privacy_requests").insert({user_id:user.id,request_type:requestType,status:"submitted",request_note:note}).select("id,request_type,status,requested_at").single();
    if(ins.error){
      if(String(ins.error.code)==="23505"){
        const retry=await svc.from("account_privacy_requests").select("id,request_type,status,requested_at").eq("user_id",user.id).eq("request_type",requestType).in("status",["submitted","in_review"]).order("requested_at",{ascending:false}).limit(1).maybeSingle();
        if(retry.data)return json(req,{ok:true,idempotent:true,request:retry.data});
      }
      return json(req,{error:"request_create_failed",detail:ins.error.message},409);
    }
    const label=requestType==="data_export"?"copie des données":"fermeture du compte";
    await Promise.allSettled([
      mail(user.email,`Votre demande KŌMØ Pulse a été enregistrée`,`<p>Votre demande de <strong>${label}</strong> a bien été enregistrée.</p><p>Elle est désormais tracée dans votre espace Compte. L’équipe KŌMØ vous informera de son traitement.</p>`),
      mail(ADMIN,"Nouvelle demande confidentialité · KŌMØ Pulse",`<p>Une nouvelle demande de <strong>${safe(label)}</strong> a été déposée dans Pulse.</p><p>Référence : <strong>${safe(ins.data.id)}</strong></p><p>Aucune donnée de santé n’est incluse dans cet e-mail.</p>`)
    ]);
    return json(req,{ok:true,idempotent:false,request:ins.data});
  }

  if(action==="cancel"){
    const id=String(body.request_id??"");if(!id)return json(req,{error:"request_id_required"},400);
    const now=new Date().toISOString();
    const up=await svc.from("account_privacy_requests").update({status:"cancelled",updated_at:now,resolved_at:now}).eq("id",id).eq("user_id",user.id).eq("status","submitted").select("id,request_type,status,updated_at,resolved_at").maybeSingle();
    if(up.error)return json(req,{error:"cancel_failed",detail:up.error.message},500);
    if(!up.data)return json(req,{error:"request_not_cancellable"},409);
    return json(req,{ok:true,request:up.data});
  }

  if(action==="withdraw_wearables"){
    const now=new Date().toISOString();
    const up=await svc.from("wearable_consents").update({status:"withdrawn",withdrawn_at:now,updated_at:now}).eq("user_id",user.id).eq("purpose","connected_followup").eq("status","active").select("id,status,withdrawn_at");
    if(up.error)return json(req,{error:"wearable_withdraw_failed",detail:up.error.message},500);
    return json(req,{ok:true,withdrawn:(up.data??[]).length,consents:up.data??[]});
  }

  return json(req,{error:"unknown_action"},400);
});

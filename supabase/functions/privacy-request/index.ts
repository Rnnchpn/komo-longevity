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

  const role=async()=>{const r=await svc.from("account_roles").select("role").eq("user_id",user.id).maybeSingle();return r.data?.role??"member"};
  const requireAdmin=async()=>await role()==="admin";

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

  if(action==="list_admin"){
    if(!await requireAdmin())return json(req,{error:"admin_required"},403);
    const q=await svc.from("account_privacy_requests").select("id,user_id,request_type,status,request_note,resolution_note,requested_at,updated_at,resolved_at,handled_by").order("requested_at",{ascending:false}).limit(250);
    if(q.error)return json(req,{error:"privacy_admin_list_failed",detail:q.error.message},500);
    const rows=await Promise.all((q.data??[]).map(async(x:any)=>{
      const [p,a,access]=await Promise.all([
        svc.from("profiles").select("display_name,first_name,last_name").eq("id",x.user_id).maybeSingle(),
        svc.auth.admin.getUserById(x.user_id),
        svc.from("account_access_controls").select("status,closure_mode,closed_at,updated_at").eq("user_id",x.user_id).maybeSingle()
      ]);
      const profile=p.data??{};
      const display=[profile.first_name,profile.last_name].filter(Boolean).join(" ")||profile.display_name||a.data?.user?.email||"Compte Pulse";
      return{...x,display_name:display,email:a.data?.user?.email??null,access_control:access.data??null};
    }));
    const counts=rows.reduce((m:any,x:any)=>{m[x.status]=(m[x.status]??0)+1;return m},{});
    return json(req,{requests:rows,counts});
  }

  if(action==="admin_update"){
    if(!await requireAdmin())return json(req,{error:"admin_required"},403);
    const id=String(body.request_id??"");
    const next=String(body.status??"");
    const note=String(body.resolution_note??"").trim().slice(0,1500)||null;
    if(!id)return json(req,{error:"request_id_required"},400);
    if(!["in_review","completed","declined"].includes(next))return json(req,{error:"invalid_admin_status"},400);
    const lookup=await svc.from("account_privacy_requests").select("id,user_id,request_type,status").eq("id",id).maybeSingle();
    if(lookup.error)return json(req,{error:"request_lookup_failed",detail:lookup.error.message},500);
    const current=lookup.data;
    if(!current)return json(req,{error:"request_not_found"},404);
    if(current.request_type==="account_closure"&&next==="completed")return json(req,{error:"closure_requires_execution_action",detail:"Utilisez l’action serveur de fermeture du compte."},409);
    const allowed=current.status==="submitted"?["in_review","completed","declined"]:current.status==="in_review"?["completed","declined"]:[];
    if(!allowed.includes(next))return json(req,{error:"invalid_status_transition",status:current.status},409);
    if(["completed","declined"].includes(next)&&!note)return json(req,{error:"resolution_note_required"},400);
    if(next==="completed"&&body.execution_confirmed!==true)return json(req,{error:"execution_confirmation_required"},400);
    const now=new Date().toISOString();
    const terminal=["completed","declined"].includes(next);
    const up=await svc.from("account_privacy_requests").update({status:next,resolution_note:note,handled_by:user.id,updated_at:now,resolved_at:terminal?now:null}).eq("id",id).eq("status",current.status).select("id,user_id,request_type,status,resolution_note,updated_at,resolved_at,handled_by").maybeSingle();
    if(up.error)return json(req,{error:"privacy_admin_update_failed",detail:up.error.message},500);
    if(!up.data)return json(req,{error:"privacy_request_changed",detail:"La demande a été modifiée. Rechargez la file."},409);
    const target=await svc.auth.admin.getUserById(current.user_id);
    const label=current.request_type==="data_export"?"copie de vos données":"fermeture de votre compte";
    const message=next==="in_review"?`<p>Votre demande concernant la <strong>${label}</strong> est maintenant prise en charge par l’équipe KŌMØ.</p>`:next==="completed"?`<p>Le traitement de votre demande concernant la <strong>${label}</strong> est indiqué comme terminé dans KŌMØ Pulse.</p>`:`<p>Le traitement de votre demande concernant la <strong>${label}</strong> est clôturé. Consultez votre espace Pulse ou contactez KŌMØ si vous avez besoin d’un complément.</p>`;
    await mail(target.data?.user?.email,"Mise à jour de votre demande · KŌMØ Pulse",message);
    return json(req,{ok:true,request:up.data});
  }

  if(action==="admin_execute_closure"){
    if(!await requireAdmin())return json(req,{error:"admin_required"},403);
    const id=String(body.request_id??"");
    const note=String(body.resolution_note??"").trim().slice(0,1500)||null;
    const confirmation=String(body.closure_confirmation??"");
    if(!id)return json(req,{error:"request_id_required"},400);
    if(!note)return json(req,{error:"resolution_note_required"},400);
    if(confirmation!=="FERMER")return json(req,{error:"closure_confirmation_required",detail:"La confirmation FERMER est requise."},400);

    const lookup=await svc.from("account_privacy_requests").select("id,user_id,request_type,status").eq("id",id).maybeSingle();
    if(lookup.error)return json(req,{error:"request_lookup_failed",detail:lookup.error.message},500);
    const current=lookup.data;
    if(!current)return json(req,{error:"request_not_found"},404);
    if(current.request_type!=="account_closure")return json(req,{error:"not_account_closure"},409);

    const existing=await svc.from("account_access_controls").select("user_id,status,privacy_request_id,closed_at").eq("user_id",current.user_id).maybeSingle();
    if(existing.error)return json(req,{error:"access_control_lookup_failed",detail:existing.error.message},500);
    if(existing.data?.status==="closed"&&existing.data?.privacy_request_id===id){
      if(current.status!=="completed")await svc.from("account_privacy_requests").update({status:"completed",resolution_note:note,handled_by:user.id,updated_at:new Date().toISOString(),resolved_at:new Date().toISOString()}).eq("id",id);
      return json(req,{ok:true,idempotent:true,status:"closed"});
    }
    if(current.status!=="in_review")return json(req,{error:"closure_requires_review",detail:"La demande doit être en cours de traitement avant exécution."},409);

    const target=await svc.auth.admin.getUserById(current.user_id);
    const targetEmail=target.data?.user?.email??null;
    if(target.error&&!existing.data)return json(req,{error:"auth_user_lookup_failed",detail:target.error.message},409);

    const now=new Date().toISOString();
    const pre=await svc.from("account_access_controls").upsert({user_id:current.user_id,status:"closing",privacy_request_id:id,closure_mode:"auth_soft_delete",resolution_note:note,last_error:null,closed_by:user.id,closed_at:null,updated_at:now},{onConflict:"user_id"});
    if(pre.error)return json(req,{error:"access_control_prepare_failed",detail:pre.error.message},500);

    const consent=await svc.from("wearable_consents").update({status:"withdrawn",withdrawn_at:now,updated_at:now}).eq("user_id",current.user_id).eq("purpose","connected_followup").eq("status","active");
    if(consent.error){
      await svc.from("account_access_controls").update({status:"closure_failed",last_error:consent.error.message,updated_at:new Date().toISOString()}).eq("user_id",current.user_id);
      return json(req,{error:"wearable_withdraw_failed",detail:consent.error.message},500);
    }

    if(!target.error){
      const deleted=await svc.auth.admin.deleteUser(current.user_id,true);
      if(deleted.error){
        await svc.from("account_access_controls").update({status:"closure_failed",last_error:deleted.error.message,updated_at:new Date().toISOString()}).eq("user_id",current.user_id);
        return json(req,{error:"auth_soft_delete_failed",detail:deleted.error.message},500);
      }
    }else if(existing.data?.status!=="closing"&&existing.data?.status!=="closure_failed"){
      await svc.from("account_access_controls").update({status:"closure_failed",last_error:target.error.message,updated_at:new Date().toISOString()}).eq("user_id",current.user_id);
      return json(req,{error:"auth_user_missing_unverified",detail:target.error.message},409);
    }

    const closedAt=new Date().toISOString();
    const access=await svc.from("account_access_controls").update({status:"closed",resolution_note:note,last_error:null,closed_by:user.id,closed_at:closedAt,updated_at:closedAt}).eq("user_id",current.user_id).eq("privacy_request_id",id);
    if(access.error)return json(req,{error:"access_control_finalize_failed",detail:access.error.message},500);

    const done=await svc.from("account_privacy_requests").update({status:"completed",resolution_note:note,handled_by:user.id,updated_at:closedAt,resolved_at:closedAt}).eq("id",id).eq("status","in_review").select("id,status,resolved_at").maybeSingle();
    if(done.error)return json(req,{error:"closure_request_finalize_failed",detail:done.error.message},500);
    if(!done.data)return json(req,{error:"privacy_request_changed",detail:"La demande a changé pendant l’exécution."},409);

    await Promise.allSettled([
      mail(targetEmail,"Votre compte KŌMØ Pulse est fermé","<p>Votre accès KŌMØ Pulse a été fermé à la suite de votre demande.</p><p>Cette fermeture désactive votre compte d’accès. Les données devant être conservées pour des obligations légales, de traçabilité ou de soins peuvent rester archivées selon le cadre applicable.</p>"),
      mail(ADMIN,"Compte Pulse fermé · KŌMØ",`<p>La fermeture d’un compte Pulse a été exécutée.</p><p>Référence de demande : <strong>${safe(id)}</strong></p><p>Aucune donnée de santé n’est incluse dans cet e-mail.</p>`)
    ]);
    return json(req,{ok:true,idempotent:false,status:"closed",closed_at:closedAt});
  }

  return json(req,{error:"unknown_action"},400);
});

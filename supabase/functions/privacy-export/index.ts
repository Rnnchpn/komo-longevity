import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U=Deno.env.get("SUPABASE_URL")??"";
const A=Deno.env.get("SUPABASE_ANON_KEY")??"";
const S=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const R=Deno.env.get("RESEND_API_KEY")??"";
const FROM=Deno.env.get("PULSE_EMAIL_FROM")??"KŌMØ Pulse <noreply@auth.komolongevity.com>";
const BUCKET="privacy-exports";
const SCHEMA="komo-privacy-export-v1";
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com"]);
const PAGE=1000;
const MAX_ROWS=50000;

function cors(req:Request){const o=req.headers.get("origin")??"";return{"Access-Control-Allow-Origin":ORIGINS.has(o)?o:"https://pulse.komolongevity.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8"}})}
async function mail(to:string|null|undefined,subject:string,html:string){if(!R||!to)return false;const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${R}`,"Content-Type":"application/json"},body:JSON.stringify({from:FROM,to:[to],subject,html,reply_to:"contact@komolongevity.com"})});return r.ok}
function hex(buffer:ArrayBuffer){return [...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function ids(rows:any[]){return rows.map(x=>x.id).filter(Boolean)}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"method_not_allowed"},405);
  const token=(req.headers.get("Authorization")??"").replace(/^Bearer\s+/i,"");
  if(!token)return json(req,{error:"unauthorized"},401);

  const uc=createClient(U,A,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const svc=createClient(U,S,{auth:{persistSession:false}});
  const ur=await uc.auth.getUser(token),caller=ur.data?.user;
  if(ur.error||!caller)return json(req,{error:"unauthorized"},401);
  let body:any={};try{body=await req.json()}catch{return json(req,{error:"invalid_json"},400)}
  const action=String(body.action??"status");
  const role=async()=>{const r=await svc.from("account_roles").select("role").eq("user_id",caller.id).maybeSingle();return r.data?.role??"member"};

  async function collect(table:string,columns:string,filter:(q:any)=>any,max=MAX_ROWS){
    const out:any[]=[];
    for(let from=0;;from+=PAGE){
      let q=svc.from(table).select(columns).range(from,from+PAGE-1);
      q=filter(q);
      const r=await q;
      if(r.error)throw new Error(`${table}: ${r.error.message}`);
      const chunk=r.data??[];out.push(...chunk);
      if(chunk.length<PAGE)break;
      if(out.length>=max)throw new Error(`${table}: export exceeds ${max} rows`);
    }
    return out;
  }

  async function exportStatus(userId:string,requestId?:string){
    let q=svc.from("account_privacy_exports").select("id,request_id,schema_version,status,size_bytes,content_sha256,manifest,generated_at,last_downloaded_at,download_count,updated_at").eq("user_id",userId).order("created_at",{ascending:false}).limit(1);
    if(requestId)q=q.eq("request_id",requestId);
    const r=await q.maybeSingle();
    if(r.error)throw new Error(r.error.message);
    return r.data??null;
  }

  if(action==="status"){
    const requestId=String(body.request_id??"")||undefined;
    try{return json(req,{export:await exportStatus(caller.id,requestId)})}catch(e){return json(req,{error:"export_status_failed",detail:String((e as Error).message)},500)}
  }

  if(action==="download"){
    const requestId=String(body.request_id??"");
    let q=svc.from("account_privacy_exports").select("id,request_id,user_id,schema_version,status,object_path,size_bytes,content_sha256,generated_at,download_count").eq("user_id",caller.id).eq("status","ready").order("generated_at",{ascending:false}).limit(1);
    if(requestId)q=q.eq("request_id",requestId);
    const found=await q.maybeSingle();
    if(found.error)return json(req,{error:"export_lookup_failed",detail:found.error.message},500);
    if(!found.data?.object_path)return json(req,{error:"export_not_ready"},404);
    const signed=await svc.storage.from(BUCKET).createSignedUrl(found.data.object_path,600,{download:`KOMO-Pulse-data-${found.data.request_id}.json`});
    if(signed.error)return json(req,{error:"signed_url_failed",detail:signed.error.message},500);
    const now=new Date().toISOString();
    await svc.from("account_privacy_exports").update({last_downloaded_at:now,download_count:Number(found.data.download_count||0)+1,updated_at:now}).eq("id",found.data.id).eq("user_id",caller.id);
    return json(req,{ok:true,url:signed.data.signedUrl,expires_in_seconds:600,file_name:`KOMO-Pulse-data-${found.data.request_id}.json`,schema_version:found.data.schema_version,size_bytes:found.data.size_bytes,content_sha256:found.data.content_sha256,generated_at:found.data.generated_at});
  }

  if(action!=="generate")return json(req,{error:"unknown_action"},400);
  if(await role()!=="admin")return json(req,{error:"admin_required"},403);
  const requestId=String(body.request_id??"");
  if(!requestId)return json(req,{error:"request_id_required"},400);

  const request=await svc.from("account_privacy_requests").select("id,user_id,request_type,status,requested_at").eq("id",requestId).maybeSingle();
  if(request.error)return json(req,{error:"request_lookup_failed",detail:request.error.message},500);
  if(!request.data)return json(req,{error:"request_not_found"},404);
  if(request.data.request_type!=="data_export")return json(req,{error:"not_data_export"},409);
  if(request.data.status==="completed"){
    const existing=await exportStatus(request.data.user_id,requestId);
    if(existing?.status==="ready")return json(req,{ok:true,idempotent:true,export:existing});
  }
  if(request.data.status!=="in_review")return json(req,{error:"export_requires_review",detail:"La demande doit être en cours de traitement avant génération."},409);

  const userId=request.data.user_id;
  const objectPath=`${userId}/${requestId}/${SCHEMA}.json`;
  const now=new Date().toISOString();
  const prep=await svc.from("account_privacy_exports").upsert({request_id:requestId,user_id:userId,schema_version:SCHEMA,status:"building",object_path:objectPath,last_error:null,updated_at:now},{onConflict:"request_id"}).select("id").single();
  if(prep.error)return json(req,{error:"export_prepare_failed",detail:prep.error.message},500);

  try{
    const auth=await svc.auth.admin.getUserById(userId);
    if(auth.error)throw new Error(`auth: ${auth.error.message}`);
    const profile=await svc.from("profiles").select("display_name,first_name,last_name,phone,birth_date,sex_at_birth,address_line1,postal_code,city,country,locale,bio,interests,newsletter_opt_in,avatar_config,created_at,updated_at").eq("id",userId).maybeSingle();
    if(profile.error)throw new Error(`profiles: ${profile.error.message}`);

    const [privacyRequests,wearableConsents,wearableDevices,wearableDaily,wearableMeasurements,pulseAssessments,pulsePrograms,pulseScoreRuns,pulseClinicalSessions,pulseDocuments,serviceRequests,socialProfiles,activityEntries,challengeCompletions,gameScores,pointRedemptions,pointsLedger,xpLedger,bookmarks,patientRows]=await Promise.all([
      collect("account_privacy_requests","id,request_type,status,request_note,requested_at,updated_at,resolved_at",q=>q.eq("user_id",userId)),
      collect("wearable_consents","id,purpose,consent_version,status,data_categories,accepted_at,withdrawn_at,created_at,updated_at",q=>q.eq("user_id",userId)),
      collect("wearable_devices","id,provider,model,display_name,external_device_id,serial_number,source_adapter,status,paired_at,last_sync_at,battery_percent,firmware_version,created_at,updated_at",q=>q.eq("user_id",userId)),
      collect("wearable_daily_metrics","id,device_id,metric_date,steps,distance_m,active_minutes,sedentary_minutes,resting_hr,avg_hr,hrv_ms,spo2_avg,sleep_minutes,deep_sleep_minutes,rem_sleep_minutes,wear_minutes,source,source_quality,day_wear_mode,night_worn,created_at,updated_at",q=>q.eq("user_id",userId)),
      collect("wearable_measurements","id,device_id,measured_at,metric_type,value_numeric,value_text,unit,quality,source,created_at",q=>q.eq("user_id",userId)),
      collect("pulse_assessments","id,protocol_version,status,current_step,responses,result_summary,started_at,completed_at,updated_at,consent_version,consent_at",q=>q.eq("user_id",userId)),
      collect("pulse_programs","id,edition,status,purchased_at,activated_at,created_at,updated_at",q=>q.eq("user_id",userId)),
      collect("pulse_score_runs","id,program_id,algorithm_version,reference_population_version,overall_score,motion_age,subscores,confidence,completeness,missing_components,status,computed_at,reviewed_at,released_at,created_at",q=>q.eq("user_id",userId)),
      collect("pulse_clinical_sessions","id,program_id,scheduled_at,started_at,completed_at,status,site_name,notes_status,created_at,updated_at",q=>q.eq("user_id",userId)),
      collect("pulse_documents","id,program_id,document_type,file_name,mime_type,status,issued_at,uploaded_at",q=>q.eq("user_id",userId)),
      collect("patient_service_requests","id,service,status,preferred_city,message,submitted_at,assigned_at,accepted_at,completed_at,scheduled_at,updated_at",q=>q.eq("user_id",userId)),
      collect("komo_social_profiles","handle,display_name,bio,interests,avatar_config,is_public,created_at,updated_at",q=>q.eq("user_id",userId)),
      collect("komo_activity_entries","activity_date,activity_type,value,source,created_at,updated_at",q=>q.eq("user_id",userId)),
      collect("komo_challenge_completions","challenge_id,completed_on,source,xp_awarded,created_at",q=>q.eq("user_id",userId)),
      collect("komo_game_scores","game_key,score,metric,played_at",q=>q.eq("user_id",userId)),
      collect("komo_point_redemptions","code,points_amount,value_cents,status,channel,expires_at,redeemed_at,cancelled_at,created_at,updated_at",q=>q.eq("user_id",userId)),
      collect("komo_points_ledger","event_key,points_delta,reason,created_at",q=>q.eq("user_id",userId)),
      collect("komo_xp_ledger","event_key,event_type,xp_amount,point_eligible,occurred_on,created_at,updated_at",q=>q.eq("user_id",userId)),
      collect("library_bookmarks","article_slug,created_at",q=>q.eq("user_id",userId)),
      collect("patients","id,organization_id,first_name,last_name,preferred_name,birth_date,sex_at_birth,email,phone,locale,status,created_at,updated_at,data_classification",q=>q.eq("patient_user_id",userId))
    ]);

    const patientIds=ids(patientRows);
    const assessments=patientIds.length?await collect("assessments","id,patient_id,product_mode,assessment_type,status,protocol_version,context_class,measurement_context,completeness,scheduled_at,started_at,completed_at,validated_at,released_at,created_at,updated_at",q=>q.in("patient_id",patientIds)):[];
    const assessmentIds=ids(assessments);
    const [measurements,myodevMetrics,scores,priorities,questionnaireSessions,clinicalContext,komoReports,reports,assessmentDocuments,trajectoryEvents,consents,appointments,payments,threads]=await Promise.all([
      assessmentIds.length?collect("measurements","id,assessment_id,indicator_code,product_status,raw_value,numeric_value,text_value,unit,source,task_code,muscle_code,side,protocol_version,qc_status,qc_reason,recorded_at,created_at",q=>q.in("assessment_id",assessmentIds)):[],
      assessmentIds.length?collect("myodev_metrics","id,assessment_id,task_code,trial_index,muscle_code,side,phase_window,metric_code,value,unit,directionality,qc_status,qc_reason,protocol_version,created_at",q=>q.in("assessment_id",assessmentIds)):[],
      assessmentIds.length?collect("scores","id,assessment_id,profile_code,algorithm_version,reference_version,motion_score,domain_scores,muscle_signature,confidence,confidence_label,completeness,context_class,status,release_status,calculated_at,reviewed_at,released_at,created_at",q=>q.in("assessment_id",assessmentIds).eq("release_status","released")):[],
      assessmentIds.length?collect("priorities","id,assessment_id,rank,category,patient_wording,validation_status,validated_at,created_at,updated_at",q=>q.in("assessment_id",assessmentIds).eq("validation_status","validated")):[],
      assessmentIds.length?collect("questionnaire_sessions","id,assessment_id,instrument_code,instrument_version,status,score,score_status,completeness,started_at,completed_at,created_at,updated_at",q=>q.in("assessment_id",assessmentIds)):[],
      assessmentIds.length?collect("clinical_context","id,assessment_id,history,examination,biology,imaging,medication_context,medical_conclusion,status,signed_at,created_at,updated_at",q=>q.in("assessment_id",assessmentIds).eq("status","signed")):[],
      patientIds.length?collect("komo_reports","id,patient_id,assessment_id,score_id,version,schema_version,status,payload,created_at,updated_at,validated_at,released_at,patient_opened_at",q=>q.in("patient_id",patientIds).eq("status","released")):[],
      assessmentIds.length?collect("reports","id,assessment_id,version,report_type,status,content_manifest,signed_at,released_at,created_at",q=>q.in("assessment_id",assessmentIds).eq("status","released")):[],
      assessmentIds.length?collect("assessment_documents","id,assessment_id,document_type,file_name,media_type,source_date,verification_status,created_at",q=>q.in("assessment_id",assessmentIds)):[],
      patientIds.length?collect("trajectory_events","id,patient_id,assessment_id,event_type,event_date,payload,source,created_at",q=>q.in("patient_id",patientIds)):[],
      patientIds.length?collect("consents","id,patient_id,consent_type,document_version,status,granted_at,withdrawn_at,created_at",q=>q.in("patient_id",patientIds)):[],
      patientIds.length?collect("organization_appointments","id,patient_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,service_code,amount_cents,currency,payment_status,intake_status,intake_due_at,intake_submitted_at,intake_reviewed_at,created_at,updated_at,booking_source",q=>q.in("patient_id",patientIds)):[],
      patientIds.length?collect("payment_orders","id,appointment_id,patient_id,purpose,amount_cents,currency,status,created_at,updated_at",q=>q.in("patient_id",patientIds)):[],
      patientIds.length?collect("message_threads","id,patient_id,subject,status,created_at,updated_at,last_message_at",q=>q.in("patient_id",patientIds)):[]
    ]);

    const questionnaireIds=ids(questionnaireSessions),threadIds=ids(threads);
    const [questionnaireResponses,messageRows]=await Promise.all([
      questionnaireIds.length?collect("questionnaire_responses","id,questionnaire_session_id,item_code,response_code,raw_value,normalized_value,source,clinician_verified,verified_at,completed_at,created_at,updated_at",q=>q.in("questionnaire_session_id",questionnaireIds)):[],
      threadIds.length?collect("messages","id,thread_id,sender_user_id,body,created_at",q=>q.in("thread_id",threadIds)):[]
    ]);
    const messages=messageRows.map((m:any)=>({id:m.id,thread_id:m.thread_id,direction:m.sender_user_id===userId?"sent_by_me":"received",body:m.body,created_at:m.created_at}));

    const authUser=auth.data.user;
    const data:any={
      export:{schema_version:SCHEMA,generated_at:now,request_id:requestId,scope:"KŌMØ Pulse structured personal data copy"},
      manifest:{
        included:["account and profile","privacy requests and consents","Pulse assessments and released scores","KŌMØ Clinical signed/released patient data","normalized KŌMØ KEY connected data","appointments and payment summaries","messages","Library and KŌMØ activity"],
        excluded_from_self_service:["internal audit logs","staff review notes and staff identifiers","draft or unreleased clinical work product","payment-provider external references","raw provider payloads","binary document file contents"],
        note:"Binary documents are listed by metadata but are not embedded in this structured JSON package. Contact KŌMØ if a separate copy of source files is required."
      },
      account:{auth:{id:authUser?.id,email:authUser?.email,phone:authUser?.phone,created_at:authUser?.created_at,updated_at:authUser?.updated_at,last_sign_in_at:authUser?.last_sign_in_at,email_confirmed_at:authUser?.email_confirmed_at},profile:profile.data??null},
      privacy:{requests:privacyRequests,wearable_consents:wearableConsents},
      pulse:{assessments:pulseAssessments,programs:pulsePrograms,score_runs:pulseScoreRuns,clinical_sessions:pulseClinicalSessions,documents:pulseDocuments,service_requests:serviceRequests},
      connected_data:{devices:wearableDevices,daily_metrics:wearableDaily,measurements:wearableMeasurements},
      clinical:{patients:patientRows,assessments,measurements,myodev_metrics:myodevMetrics,scores,priorities,questionnaire_sessions:questionnaireSessions,questionnaire_responses:questionnaireResponses,signed_context:clinicalContext,released_reports:komoReports,released_report_metadata:reports,document_metadata:assessmentDocuments,trajectory_events:trajectoryEvents,consents,appointments,payments,message_threads:threads,messages},
      ecosystem:{social_profiles:socialProfiles,activity_entries:activityEntries,challenge_completions:challengeCompletions,game_scores:gameScores,point_redemptions:pointRedemptions,points_ledger:pointsLedger,xp_ledger:xpLedger,library_bookmarks:bookmarks}
    };

    const categoryCounts:any={
      privacy_requests:privacyRequests.length,wearable_daily_metrics:wearableDaily.length,wearable_measurements:wearableMeasurements.length,pulse_assessments:pulseAssessments.length,pulse_score_runs:pulseScoreRuns.length,patient_records:patientRows.length,assessments:assessments.length,measurements:measurements.length,myodev_metrics:myodevMetrics.length,released_scores:scores.length,validated_priorities:priorities.length,questionnaire_responses:questionnaireResponses.length,released_reports:komoReports.length,messages:messages.length,appointments:appointments.length,payments:payments.length
    };
    data.manifest.counts=categoryCounts;
    const bytes=new TextEncoder().encode(JSON.stringify(data));
    const digest=hex(await crypto.subtle.digest("SHA-256",bytes));
    const upload=await svc.storage.from(BUCKET).upload(objectPath,bytes,{contentType:"application/json; charset=utf-8",upsert:true,cacheControl:"no-store"});
    if(upload.error)throw new Error(`storage: ${upload.error.message}`);
    const readyAt=new Date().toISOString();
    const manifest={counts:categoryCounts,excluded:data.manifest.excluded_from_self_service,note:data.manifest.note};
    const ready=await svc.from("account_privacy_exports").update({status:"ready",object_path:objectPath,content_sha256:digest,size_bytes:bytes.byteLength,manifest,generated_at:readyAt,last_error:null,updated_at:readyAt}).eq("request_id",requestId).eq("user_id",userId).select("id,request_id,schema_version,status,size_bytes,content_sha256,manifest,generated_at,download_count").single();
    if(ready.error)throw new Error(`registry: ${ready.error.message}`);
    const done=await svc.from("account_privacy_requests").update({status:"completed",resolution_note:"Copie structurée générée et mise à disposition dans KŌMØ Pulse.",handled_by:caller.id,updated_at:readyAt,resolved_at:readyAt}).eq("id",requestId).eq("status","in_review").select("id,status,resolved_at").maybeSingle();
    if(done.error)throw new Error(`request: ${done.error.message}`);
    if(!done.data)throw new Error("privacy request changed during export generation");
    await mail(authUser?.email,"Votre copie de données KŌMØ Pulse est prête","<p>Votre copie structurée de données KŌMØ Pulse est prête.</p><p>Connectez-vous à votre espace <strong>Compte</strong> pour générer un lien de téléchargement temporaire. Aucun fichier de santé n’est joint à cet e-mail.</p>");
    return json(req,{ok:true,idempotent:false,export:ready.data});
  }catch(e){
    const detail=String((e as Error).message||e).slice(0,1200);
    await svc.from("account_privacy_exports").update({status:"failed",last_error:detail,updated_at:new Date().toISOString()}).eq("request_id",requestId);
    return json(req,{error:"export_generation_failed",detail},500);
  }
});

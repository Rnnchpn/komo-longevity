import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const U=Deno.env.get("SUPABASE_URL")??"";
const A=Deno.env.get("SUPABASE_ANON_KEY")??"";
const S=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const ORIGINS=new Set(["https://pulse.komolongevity.com","https://komolongevity.com"]);
const MANAGER_ROLES=new Set(["owner","clinical_admin"]);
const MEMBER_ROLES=new Set(["owner","clinical_admin","physician","operator","coordinator","viewer"]);
const SCOPES=new Set(["motion","clinical"]);
const ACTIVE_APPT=new Set(["scheduled","confirmed","arrived","in_progress"]);

function cors(req:Request){const o=req.headers.get("origin")??"";return{"Access-Control-Allow-Origin":ORIGINS.has(o)?o:"https://pulse.komolongevity.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}
function json(req:Request,b:unknown,s=200){return new Response(JSON.stringify(b),{status:s,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8"}})}
function clean(v:unknown,n=240){return String(v??"").trim().slice(0,n)}
function slugify(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,72)||"komo-center"}
function num(v:unknown){const x=Number(v);return Number.isFinite(x)?x:null}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"method_not_allowed"},405);
  const token=(req.headers.get("Authorization")??"").replace(/^Bearer\s+/i,"");
  if(!token)return json(req,{error:"unauthorized"},401);
  const uc=createClient(U,A,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const svc=createClient(U,S,{auth:{persistSession:false}});
  const ur=await uc.auth.getUser(token),actor=ur.data?.user;
  if(ur.error||!actor)return json(req,{error:"unauthorized"},401);
  const ar=await svc.from("account_roles").select("role").eq("user_id",actor.id).maybeSingle();
  const accountRole=ar.data?.role??"member",isAdmin=accountRole==="admin";
  if(!["professional","admin"].includes(accountRole))return json(req,{error:"professional_required"},403);
  let body:any={};try{body=await req.json()}catch{return json(req,{error:"invalid_json"},400)}
  const action=String(body.action??"overview");

  const ownMemberships=async()=>{const q=await svc.from("organization_members").select("organization_id,role,status,access_scope").eq("user_id",actor.id).eq("status","active");if(q.error)throw new Error(q.error.message);return q.data??[]};
  const canManage=async(oid:string)=>isAdmin||(await ownMemberships()).some((m:any)=>m.organization_id===oid&&MANAGER_ROLES.has(m.role));
  const audit=async(oid:string,type:string,entityType:string,entityId:string,detail:any={})=>{await svc.from("audit_events").insert({organization_id:oid,actor_user_id:actor.id,event_type:type,entity_type:entityType,entity_id:entityId,event_detail:detail})};
  const enrichMembers=async(rows:any[])=>{const out:any[]=[];for(const m of rows){const [u,p]=await Promise.all([svc.auth.admin.getUserById(m.user_id),svc.from("profiles").select("display_name,first_name,last_name,city,country,phone").eq("id",m.user_id).maybeSingle()]);out.push({...m,email:u.data?.user?.email??null,profile:p.data??null})}return out};
  const managedIds=async()=>{if(isAdmin){const q=await svc.from("organizations").select("id").order("name");if(q.error)throw new Error(q.error.message);return(q.data??[]).map((x:any)=>x.id)}return(await ownMemberships()).filter((m:any)=>MANAGER_ROLES.has(m.role)).map((m:any)=>m.organization_id)};

  if(action==="overview"){
    const ids=await managedIds();
    if(!ids.length)return json(req,{centers:[],services:[],hours:[],members:[],appointments:[],patients:[],requests:[],account_role:accountRole});
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
    const members=await enrichMembers(mq.data??[]);
    const userIds=[...new Set((rq.data??[]).map((r:any)=>r.user_id).filter(Boolean))];
    const profiles=userIds.length?(await svc.from("profiles").select("id,display_name,first_name,last_name,phone,city").in("id",userIds)).data??[]:[];
    const pmap=new Map(profiles.map((p:any)=>[p.id,p]));
    const requests=(rq.data??[]).map((r:any)=>({...r,profile:pmap.get(r.user_id)??null}));
    return json(req,{centers:oq.data??[],services:sq.data??[],hours:hq.data??[],members,appointments:aq.data??[],patients:pq.data??[],requests,account_role:accountRole});
  }

  if(action==="create_center"){
    const name=clean(body.name,180),city=clean(body.city,120),country=clean(body.country_code,2).toUpperCase()||"FR";
    if(name.length<2||!/^[A-Z]{2}$/.test(country))return json(req,{error:"invalid_center_fields"},400);
    const slug=`${slugify(name)}-${crypto.randomUUID().slice(0,8)}`;
    const lat=num(body.latitude),lng=num(body.longitude);
    const ins=await svc.from("organizations").insert({name,slug,city:city||null,address_line:clean(body.address_line,240)||null,postal_code:clean(body.postal_code,24)||null,country_code:country,timezone:clean(body.timezone,80)||"Europe/Paris",status:"active",clinical_data_status:"test_only",booking_published:false,contact_email:clean(body.contact_email,240)||actor.email||null,contact_phone:clean(body.contact_phone,80)||null,website_url:clean(body.website_url,300)||null,public_description:clean(body.public_description,600)||null,latitude:lat,longitude:lng,created_by:actor.id}).select("*").single();
    if(ins.error)return json(req,{error:"center_create_failed",detail:ins.error.message},500);
    const center=ins.data;
    const mem=await svc.from("organization_members").insert({organization_id:center.id,user_id:actor.id,role:"owner",status:"active",access_scope:body.access_scope==="clinical"||isAdmin?"clinical":"motion",invited_by:isAdmin?actor.id:null,joined_at:new Date().toISOString()});
    if(mem.error){await svc.from("organizations").delete().eq("id",center.id);return json(req,{error:"center_owner_failed",detail:mem.error.message},500)}
    await svc.from("organization_booking_services").insert([{organization_id:center.id,service_type:"motion",enabled:true,duration_minutes:30,booking_horizon_days:60,min_notice_hours:12},{organization_id:center.id,service_type:"clinical",enabled:isAdmin||body.access_scope==="clinical",duration_minutes:30,booking_horizon_days:60,min_notice_hours:12}]);
    await svc.from("organization_booking_hours").insert([1,2,3,4,5].map(weekday=>({organization_id:center.id,weekday,start_time:"09:00",end_time:"18:00",enabled:true})));
    await audit(center.id,"center.created","organization",center.id,{source:"center-command-v2"});
    return json(req,{ok:true,center});
  }

  const oid=clean(body.organization_id,64);if(!oid)return json(req,{error:"organization_required"},400);
  if(!(await canManage(oid)))return json(req,{error:"center_manager_required"},403);

  if(action==="save_center"){
    const patch:any={updated_at:new Date().toISOString()};
    for(const [k,max] of [["name",180],["city",120],["address_line",240],["postal_code",24],["contact_email",240],["contact_phone",80],["website_url",300],["public_description",600],["timezone",80]] as const){if(body[k]!==undefined)patch[k]=clean(body[k],max)||null}
    if(body.country_code!==undefined){const cc=clean(body.country_code,2).toUpperCase();if(!/^[A-Z]{2}$/.test(cc))return json(req,{error:"invalid_country"},400);patch.country_code=cc}
    if(body.latitude!==undefined){const x=num(body.latitude);if(x!==null&&(x<-90||x>90))return json(req,{error:"invalid_latitude"},400);patch.latitude=x}
    if(body.longitude!==undefined){const x=num(body.longitude);if(x!==null&&(x<-180||x>180))return json(req,{error:"invalid_longitude"},400);patch.longitude=x}
    if(isAdmin&&body.status!==undefined&&["active","suspended","archived"].includes(String(body.status)))patch.status=String(body.status);
    const services=Array.isArray(body.services)?body.services:[];
    for(const s of services){if(!["motion","clinical"].includes(s.service_type))continue;await svc.from("organization_booking_services").upsert({organization_id:oid,service_type:s.service_type,enabled:s.enabled===true,duration_minutes:30,booking_horizon_days:Math.max(1,Math.min(365,Number(s.booking_horizon_days)||60)),min_notice_hours:Math.max(0,Math.min(336,Number(s.min_notice_hours)||12)),updated_at:new Date().toISOString()},{onConflict:"organization_id,service_type"})}
    if(Array.isArray(body.hours)){
      const rows=body.hours.filter((h:any)=>Number(h.weekday)>=1&&Number(h.weekday)<=7&&/^\d{2}:\d{2}/.test(String(h.start_time||""))&&/^\d{2}:\d{2}/.test(String(h.end_time||""))).map((h:any)=>({organization_id:oid,weekday:Number(h.weekday),start_time:String(h.start_time).slice(0,5),end_time:String(h.end_time).slice(0,5),enabled:h.enabled!==false}));
      await svc.from("organization_booking_hours").delete().eq("organization_id",oid);
      if(rows.length){const hq=await svc.from("organization_booking_hours").insert(rows);if(hq.error)return json(req,{error:"hours_save_failed",detail:hq.error.message},500)}
    }
    if(body.booking_published!==undefined){
      const publish=body.booking_published===true;
      if(publish){const [ss,hh,mm]=await Promise.all([svc.from("organization_booking_services").select("service_type").eq("organization_id",oid).eq("enabled",true).limit(1),svc.from("organization_booking_hours").select("id").eq("organization_id",oid).eq("enabled",true).limit(1),svc.from("organization_members").select("id").eq("organization_id",oid).eq("status","active").in("access_scope",["motion","clinical"]).limit(1)]);if(!ss.data?.length||!hh.data?.length||!mm.data?.length)return json(req,{error:"center_not_bookable",detail:"Active service, opening hours and eligible team member are required before publication."},409)}
      patch.booking_published=publish;
    }
    const q=await svc.from("organizations").update(patch).eq("id",oid).select("*").single();if(q.error)return json(req,{error:"center_save_failed",detail:q.error.message},500);
    await audit(oid,"center.updated","organization",oid,{fields:Object.keys(patch),services:services.map((x:any)=>x.service_type),hours:Array.isArray(body.hours)?body.hours.length:undefined});
    return json(req,{ok:true,center:q.data});
  }

  if(action==="add_member"){
    const email=clean(body.email,240).toLowerCase(),role=clean(body.role,40)||"operator",scope=clean(body.access_scope,20)||"motion";
    if(!email||!MEMBER_ROLES.has(role)||!SCOPES.has(scope))return json(req,{error:"invalid_member_fields"},400);
    let found:any=null,page=1;while(page<=10&&!found){const lu=await svc.auth.admin.listUsers({page,perPage:100});if(lu.error)return json(req,{error:"user_lookup_failed",detail:lu.error.message},500);found=(lu.data.users||[]).find((u:any)=>String(u.email||"").toLowerCase()===email);if((lu.data.users||[]).length<100)break;page++}
    if(!found)return json(req,{error:"professional_not_found",detail:"Le professionnel doit d’abord posséder un compte Pulse."},404);
    const rr=await svc.from("account_roles").select("role").eq("user_id",found.id).maybeSingle();if(!["professional","admin"].includes(rr.data?.role))return json(req,{error:"professional_account_required"},409);
    const q=await svc.from("organization_members").upsert({organization_id:oid,user_id:found.id,role,status:"active",access_scope:scope,invited_by:actor.id,joined_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"organization_id,user_id"}).select("*").single();if(q.error)return json(req,{error:"member_add_failed",detail:q.error.message},500);
    await audit(oid,"center.member_added","organization_member",q.data.id,{user_id:found.id,role,access_scope:scope});return json(req,{ok:true,member:q.data});
  }

  if(action==="update_member"){
    const uid=clean(body.user_id,64),role=clean(body.role,40),scope=clean(body.access_scope,20),status=clean(body.status,20)||"active";
    if(!uid||!MEMBER_ROLES.has(role)||!SCOPES.has(scope)||!["active","suspended"].includes(status))return json(req,{error:"invalid_member_fields"},400);
    const current=await svc.from("organization_members").select("id,role").eq("organization_id",oid).eq("user_id",uid).maybeSingle();if(!current.data)return json(req,{error:"member_not_found"},404);
    if(current.data.role==="owner"&&role!=="owner"){const owners=await svc.from("organization_members").select("id").eq("organization_id",oid).eq("role","owner").eq("status","active");if((owners.data??[]).length<=1)return json(req,{error:"last_owner_required"},409)}
    const q=await svc.from("organization_members").update({role,access_scope:scope,status,updated_at:new Date().toISOString()}).eq("id",current.data.id).select("*").single();if(q.error)return json(req,{error:"member_update_failed",detail:q.error.message},500);await audit(oid,"center.member_updated","organization_member",q.data.id,{user_id:uid,role,access_scope:scope,status});return json(req,{ok:true,member:q.data});
  }

  if(action==="remove_member"){
    const uid=clean(body.user_id,64);const current=await svc.from("organization_members").select("id,role").eq("organization_id",oid).eq("user_id",uid).maybeSingle();if(!current.data)return json(req,{error:"member_not_found"},404);
    if(current.data.role==="owner"){const owners=await svc.from("organization_members").select("id").eq("organization_id",oid).eq("role","owner").eq("status","active");if((owners.data??[]).length<=1)return json(req,{error:"last_owner_required"},409)}
    const q=await svc.from("organization_members").update({status:"revoked",updated_at:new Date().toISOString()}).eq("id",current.data.id);if(q.error)return json(req,{error:"member_remove_failed",detail:q.error.message},500);await audit(oid,"center.member_removed","organization_member",current.data.id,{user_id:uid});return json(req,{ok:true});
  }

  if(action==="assign_appointment"){
    const appt=clean(body.appointment_id,64),uid=clean(body.user_id,64);if(!appt||!uid)return json(req,{error:"appointment_and_user_required"},400);
    const ar=await svc.from("organization_appointments").select("id,organization_id,patient_id,appointment_type,status,scheduled_start,scheduled_end").eq("id",appt).eq("organization_id",oid).maybeSingle();if(!ar.data)return json(req,{error:"appointment_not_found"},404);
    const mr=await svc.from("organization_members").select("role,access_scope,status").eq("organization_id",oid).eq("user_id",uid).maybeSingle();if(!mr.data||mr.data.status!=="active")return json(req,{error:"professional_not_in_center"},409);
    const eligible=ar.data.appointment_type==="clinical"?mr.data.access_scope==="clinical"&&["owner","clinical_admin","physician"].includes(mr.data.role):["motion","clinical"].includes(mr.data.access_scope)&&["owner","clinical_admin","physician","operator","coordinator"].includes(mr.data.role);if(!eligible)return json(req,{error:"professional_not_eligible"},409);
    const clash=await svc.from("organization_appointments").select("id").eq("assigned_user_id",uid).in("status",[...ACTIVE_APPT]).lt("scheduled_start",ar.data.scheduled_end).gt("scheduled_end",ar.data.scheduled_start).neq("id",appt).limit(1);if(clash.data?.length)return json(req,{error:"professional_not_available"},409);
    const q=await svc.from("organization_appointments").update({assigned_user_id:uid,updated_at:new Date().toISOString()}).eq("id",appt).select("*").single();if(q.error)return json(req,{error:"appointment_assign_failed",detail:q.error.message},500);
    await svc.from("patient_service_requests").update({assigned_professional_user_id:uid,updated_at:new Date().toISOString()}).eq("patient_id",ar.data.patient_id).eq("service",ar.data.appointment_type).eq("scheduled_at",ar.data.scheduled_start);
    await audit(oid,"appointment.reassigned","appointment",appt,{professional_user_id:uid});return json(req,{ok:true,appointment:q.data});
  }

  return json(req,{error:"unknown_action"},400);
});
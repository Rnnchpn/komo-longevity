// Acuity is the scheduling source of truth for KŌMØ Online video debriefs.
// Admin-only API, independent from the patient-facing paid eligibility endpoint.
// No credentials or Acuity intake forms are ever returned to the browser.
import {extractVideoUrl,safeAcuityDate} from './_acuity-video.js';
const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const TYPE=99940918;
const ORIGIN='https://pulse.komolongevity.com';
const validOrigin=x=>!x||x===ORIGIN||/^https:\/\/komo-longevity-[a-z0-9-]+\.vercel\.app$/.test(x);
const RE_ID=/^[1-9][0-9]{0,11}$/;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
function dateOnly(d){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
const error=(res,code,status)=>res.status(status).json({error:code});
async function verifyAdmin(jwt){
 const userResult=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:KEY,authorization:'Bearer '+jwt},cache:'no-store',signal:AbortSignal.timeout(7500)});
 if(!userResult.ok)return false;
 const user=await userResult.json();
 if(!user.id||!user.email_confirmed_at||user.is_anonymous===true)return false;
 // account_roles RLS permits only the authenticated user's own role.
 const roleResult=await fetch(SUPABASE_URL+'/rest/v1/account_roles?user_id=eq.'+encodeURIComponent(user.id)+'&select=role&limit=1',{
  headers:{apikey:KEY,authorization:'Bearer '+jwt,accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(7500)});
 if(!roleResult.ok)return false;
 const roles=await roleResult.json();
 return Array.isArray(roles)&&roles.some(x=>x.role==='admin');
}
function normalize(appt){
 if(!appt||Number(appt.appointmentTypeID)!==TYPE||appt.canceled===true||appt.canceledAt||appt.noShow===true)return null;
 const id=String(appt.id??'');
 if(!RE_ID.test(id))return null;
 const when=safeAcuityDate(appt.datetime);
 const minutes=Number(appt.duration);
 return {id,appointmentAt:when,duration:Number.isInteger(minutes)&&minutes>0&&minutes<=180?minutes:null,
  firstName:String(appt.firstName||'').slice(0,90),lastName:String(appt.lastName||'').slice(0,90),
  email:String(appt.email||'').slice(0,254),
  meetingJoinUrl:extractVideoUrl(appt.location),
  meetingConfigured:Boolean(extractVideoUrl(appt.location)),calendarId:Number(appt.calendarID)||null};
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
 if(req.method!=='GET')return error(res,'method_not_allowed',405);
 if(!validOrigin(req.headers.origin))return error(res,'origin_not_allowed',403);
 const jwt=String(req.headers.authorization||'').match(/^Bearer ([\w.-]+)$/)?.[1];
 if(!jwt)return error(res,'authentication_required',401);
 const userId=process.env.ACUITY_USER_ID,key=process.env.ACUITY_API_KEY;
 if(!userId||!key)return error(res,'schedule_not_configured',503);
 try{
  if(!await verifyAdmin(jwt))return error(res,'operator_access_denied',403);
  const action=req.query?.action==='detail'?'detail':'list';
  const headers={authorization:'Basic '+Buffer.from(userId+':'+key).toString('base64'),accept:'application/json'};
  const opts={headers,cache:'no-store',signal:AbortSignal.timeout(9000)};
  if(action==='detail'){
   const id=String(req.query?.appointmentId??'').trim();
   if(!RE_ID.test(id))return error(res,'invalid_appointment_id',400);
   const response=await fetch('https://acuityscheduling.com/api/v1/appointments/'+id+'?excludeForms=true',opts);
   if(response.status===404)return error(res,'appointment_not_found',404);
   if(!response.ok)throw Error('acuity_detail_'+response.status);
   const appt=normalize(await response.json());
   if(!appt)return error(res,'appointment_not_eligible',404);
   return res.status(200).json({ok:true,appointment:appt});
  }
  const today=dateOnly(new Date()), max=new Date();
  max.setUTCDate(max.getUTCDate()+14);
  const minDate=String(req.query?.minDate||today),maxDate=String(req.query?.maxDate||dateOnly(max));
  if(!DATE.test(minDate)||!DATE.test(maxDate)||!Number.isFinite(Date.parse(minDate))||!Number.isFinite(Date.parse(maxDate)))return error(res,'invalid_date_range',400);
  const windowDays=(Date.parse(maxDate)-Date.parse(minDate))/86400000;
  if(windowDays<0||windowDays>31)return error(res,'date_range_too_large',400);
  const query=new URLSearchParams({appointmentTypeID:String(TYPE),minDate,maxDate,max:'100',direction:'ASC',excludeForms:'true'});
  const response=await fetch('https://acuityscheduling.com/api/v1/appointments?'+query,opts);
  if(!response.ok)throw Error('acuity_list_'+response.status);
  const data=await response.json();
  if(!Array.isArray(data))throw Error('invalid_acuity_response');
  const appts=data.map(normalize).filter(Boolean).sort((a,b)=>Date.parse(a.appointmentAt||'')-Date.parse(b.appointmentAt||''));
  return res.status(200).json({ok:true,appointments:appts,truncated:data.length===100,range:{minDate,maxDate}});
 }catch(error){
  console.error('[pulse-online-operator-schedule]',String(error?.message||'unavailable').replace(/[\r\n]/g,' ').slice(0,180));
  return error(res,'schedule_temporarily_unavailable',503);
 }
}

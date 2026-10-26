// Signed Acuity booking events -> commercial booking records only.
// This endpoint is intentionally inert until Supabase service credential and a
// pinned PARIS calendar ID have been configured on the server.
// It NEVER creates clinical patients or transfers intake/questionnaire data.
import { createHmac, timingSafeEqual } from 'node:crypto';
import {sendPulseInvitation} from '../lib/komo-pulse-invitation.mjs';

export const config={api:{bodyParser:false}};
const ROOT='https://uqlolefsiktbznnymriy.supabase.co';

async function rawBody(req){
  let size=0;const chunks=[];
  for await(const chunk of req){size+=chunk.length;if(size>8192)throw new Error('too_large');chunks.push(chunk)}
  return Buffer.concat(chunks);
}
function safeReply(res,status,reason){
  res.setHeader('Cache-Control','no-store');
  return res.status(status).json({ok:status>=200&&status<300,status:reason});
}
function matchesSignature(raw,provided,secret){
  if(!provided||!secret)return false;
  const digest=createHmac('sha256',secret).update(raw).digest();
  let got;try{got=Buffer.from(String(provided),'base64')}catch{return false}
  return digest.length===got.length&&timingSafeEqual(digest,got);
}
function centerFor(cal){
  const n=Number(cal);
  const paris=Number(process.env.ACUITY_PARIS_CALENDAR_ID||0);
  const cannes=Number(process.env.ACUITY_CANNES_CALENDAR_ID||0);
  if(!Number.isSafeInteger(n)||n<=0)return null;
  if(Number.isSafeInteger(paris)&&paris>0&&n===paris)return 'paris_centre';
  if(Number.isSafeInteger(cannes)&&cannes>0&&n===cannes)return 'cannes';
  return null;
}
function clean(value,max){return String(value??'').trim().slice(0,max)}
async function acuityAppointment(appointmentId,userId,apiKey){
  const response=await fetch('https://acuityscheduling.com/api/v1/appointments/'+appointmentId,{
    headers:{Authorization:'Basic '+Buffer.from(userId+':'+apiKey).toString('base64'),Accept:'application/json'},
    signal:AbortSignal.timeout(9500),cache:'no-store'
  });
  if(!response.ok)return null;
  return response.json();
}
async function dbRequest(path,secret,method,body){
  return fetch(ROOT+path,{
    method,
    headers:{
      apikey:secret,Authorization:'Bearer '+secret,
      'Content-Type':'application/json',
      Prefer:path.includes('/rpc/')?'return=representation':'resolution=merge-duplicates,return=minimal'
    },
    body:body?JSON.stringify(body):undefined,
    signal:AbortSignal.timeout(10000),
    cache:'no-store'
  });
}
export default async function handler(req,res){
  if(req.method!=='POST')return safeReply(res,405,'method_not_allowed');
  // Never log request bodies, appointment IDs, email addresses, or credentials.
  const userId=clean(process.env.ACUITY_USER_ID,25);
  const apiKey=String(process.env.ACUITY_API_KEY||'');
  const dbSecret=String(process.env.SUPABASE_SERVICE_ROLE_KEY||'');
  if(!/^\d+$/.test(userId)||!apiKey||!dbSecret||!process.env.ACUITY_PARIS_CALENDAR_ID)
    return safeReply(res,503,'configuration_pending');

  let raw;
  try{raw=await rawBody(req)}catch{return safeReply(res,413,'request_too_large')}
  if(!matchesSignature(raw,req.headers['x-acuity-signature'],apiKey))
    return safeReply(res,401,'invalid_signature');

  const form=new URLSearchParams(raw.toString('utf8'));
  const action=clean(form.get('action'),35);
  const bookingId=Number(form.get('id'));
  if(!Number.isSafeInteger(bookingId)||bookingId<=0)return safeReply(res,400,'invalid_event');
  if(!['scheduled','rescheduled','canceled','changed'].includes(action))
    return safeReply(res,202,'ignored_event');

  try{
    const a=await acuityAppointment(bookingId,userId,apiKey);
    if(!a)return safeReply(res,503,'acuity_unavailable');
    // Trust the re-fetched Acuity appointment, not the webhook's calendarID.
    const center=centerFor(a.calendarID);
    if(!center)return safeReply(res,202,'calendar_not_enabled');
    const email=clean(a.email,254).toLowerCase();
    const first=clean(a.firstName,100);
    const last=clean(a.lastName,120);
    if(!email||!first||!last||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return safeReply(res,202,'booking_contact_incomplete');
    const when=new Date(a.datetime);
    if(Number.isNaN(when.getTime()))return safeReply(res,202,'appointment_date_invalid');
    const type=clean(a.type,150).toLowerCase();
    const service=type.includes('advanced')?'advanced':type.includes('suivi')||type.includes('follow')?'suivi':type.includes('initial')?'initial':null;
    const canceled=a.canceled===true||action==='canceled';
    // Never silently migrate an existing booking into a different email owner.
    const present=await dbRequest('/rest/v1/komo_commercial_contacts?select=email,pulse_invitation_sent_at&acuity_appointment_id=eq.'+bookingId+'&limit=1',dbSecret,'GET');
    if(!present.ok)return safeReply(res,503,'database_unavailable');
    const matches=await present.json();
    const oldContact=Array.isArray(matches)?matches[0]:null;
    if(oldContact?.email&&String(oldContact.email).toLowerCase()!==email)
      return safeReply(res,202,'contact_change_requires_review');
    const row={
      center_code:center,first_name:first,last_name:last,email,
      phone:clean(a.phone,40)||null,journey_status:canceled?'annule':'confirme',
      service_code:service,appointment_at:when.toISOString(),
      booking_source:'acuity',acuity_appointment_id:bookingId,
      booking_verified_at:new Date().toISOString()
    };
    // Note: created_by is nullable for server-origin Acuity bookings,
    // while browser-inserted rows require an admin creator under RLS.
    const write=await dbRequest('/rest/v1/komo_commercial_contacts?on_conflict=acuity_appointment_id',dbSecret,'POST',row);
    if(!write.ok){console.error('[acuity-webhook] database write failed:',write.status);return safeReply(res,503,'database_unavailable')}
    if(canceled)return safeReply(res,200,'booking_canceled');
    if(!process.env.RESEND_API_KEY)
      return safeReply(res,503,'email_sender_not_configured');

    // Atomic 15-minute lease makes concurrent webhook retries send at most once.
    const claim=await dbRequest('/rest/v1/rpc/reserve_komo_pulse_invitation',dbSecret,'POST',{p_booking_id:bookingId});
    if(!claim.ok)return safeReply(res,503,'invitation_queue_unavailable');
    const reserved=await claim.json().catch(()=>false);
    if(reserved!==true)return safeReply(res,200,'booking_already_invited_or_pending');

    let sent;
    try{
      sent=await sendPulseInvitation({email,firstName:first,bookingId,apiKey:process.env.RESEND_API_KEY});
    }catch(err){
      sent={ok:false,code:'email_provider_unavailable'};
    }
    if(!sent.ok){
      // Release the lease only if delivery was explicitly rejected.
      // On a transport timeout, leave the lease for a safe retry.
      if(sent.code!=='email_provider_unavailable'){
        await dbRequest('/rest/v1/rpc/complete_komo_pulse_invitation',dbSecret,'POST',
          {p_booking_id:bookingId,p_message_id:null,p_sent:false}).catch(()=>{});
      }
      return safeReply(res,503,sent.code||'invitation_not_sent');
    }
    const done=await dbRequest('/rest/v1/rpc/complete_komo_pulse_invitation',dbSecret,'POST',
      {p_booking_id:bookingId,p_message_id:sent.id,p_sent:true});
    if(!done.ok||await done.json().catch(()=>false)!==true)
      return safeReply(res,503,'invitation_state_unconfirmed');
    return safeReply(res,200,'booking_recorded_invitation_sent');
  }catch(error){
    console.error('[acuity-webhook] upstream exception:',error?.name||'unknown');
    return safeReply(res,503,'temporarily_unavailable');
  }
}

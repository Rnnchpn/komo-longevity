// Acuity paid-appointment eligibility check.
// Neither Acuity credentials nor patient data are ever returned to the browser.
// Fail closed on missing configuration, missing transactions or mismatched emails.
const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_PUBLISHABLE='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const ONLINE_TYPE=99940918;
const TOTAL_EUR=49;
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store, private, max-age=0');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 const origin=req.headers.origin;
 if(origin && origin!=='https://pulse.komolongevity.com' && !/^https:\/\/komo-longevity-[a-z0-9-]+\.vercel\.app$/.test(origin))return res.status(403).json({error:'origin_not_allowed'});
 const token=String(req.headers.authorization||'').match(/^Bearer ([\w.-]+)$/)?.[1];
 if(!token)return res.status(401).json({error:'authentication_required'});
 const appointmentId=String(req.body?.appointmentId??'').trim();
 if(!/^[1-9][0-9]{0,11}$/.test(appointmentId))return res.status(400).json({error:'invalid_booking_id'});
 const acuityId=process.env.ACUITY_USER_ID;
 const acuityKey=process.env.ACUITY_API_KEY;
 if(!acuityId||!acuityKey)return res.status(503).json({error:'booking_verification_not_configured'});
 try{
  // Never trust an email supplied by a caller; only use the verified Auth identity.
  const auth=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_PUBLISHABLE,authorization:'Bearer '+token},cache:'no-store',signal:AbortSignal.timeout(7000)});
  if(!auth.ok)return res.status(401).json({error:'session_expired'});
  const user=await auth.json();
  const email=String(user.email||'').trim().toLowerCase();
  if(!email||!user.email_confirmed_at||user.is_anonymous===true)return res.status(403).json({error:'email_not_verified'});
  const authorization='Basic '+Buffer.from(acuityId+':'+acuityKey).toString('base64');
  const opts={headers:{authorization,accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(7500)};
  const details=await fetch('https://acuityscheduling.com/api/v1/appointments/'+appointmentId,opts);
  if(details.status===404)return res.status(404).json({error:'booking_not_found'});
  if(!details.ok)throw Error('acuity_lookup_failed_'+details.status);
  const appt=await details.json();
  const appointmentEmail=String(appt.email||'').trim().toLowerCase();
  const matchingEmail=appointmentEmail&&appointmentEmail===email;
  const matchingType=Number(appt.appointmentTypeID)===ONLINE_TYPE;
  const active=appt.canceled!==true&&!appt.canceledAt&&!appt.noShow;
  if(!matchingEmail||!matchingType||!active)return res.status(403).json({error:'booking_not_eligible'});
  const paymentResponse=await fetch('https://acuityscheduling.com/api/v1/appointments/'+appointmentId+'/payments',opts);
  if(!paymentResponse.ok)throw Error('payment_lookup_failed_'+paymentResponse.status);
  const transactions=await paymentResponse.json();
  if(!Array.isArray(transactions))throw Error('unexpected_payments_format');
  // Allow actual processor transactions only, never 'marked paid' or unverified coupons.
  const total=transactions.filter(x=>x.transactionID&&['stripe','paypal','paypal_pro','braintree','authorizenet'].includes(String(x.processor||'').toLowerCase())).reduce((sum,x)=>sum+Number(x.amount||0),0);
  // To avoid mismatched currencies or partially paid bookings, also require the €49 offering.
  const price=Number(appt.price??appt.cost??NaN);
  const amountDue=appt.amountDue===undefined||appt.amountDue===null?null:Number(appt.amountDue);
  const validBalance=amountDue===null||(Number.isFinite(amountDue)&&amountDue<=0);
  const notMarkedUnpaid=appt.paid!==false&&appt.paid!=='no'&&appt.paid!=='unpaid';
  const paid=Number.isFinite(total)&&total>=TOTAL_EUR&&Number.isFinite(price)&&Math.abs(price-TOTAL_EUR)<0.01&&validBalance&&notMarkedUnpaid;
  if(!paid)return res.status(403).json({error:'payment_not_confirmed'});
  // Return the booked slot only after verifying account, appointment and payment.
  // An offset-free datetime is ambiguous across timezones: don't guess it.
  const rawStart=String(appt.datetime??'').trim();
  const appointmentAt=rawStart.length<=65&&/(?:Z|[+-][0-9]{2}:?[0-9]{2})$/i.test(rawStart)&&Number.isFinite(Date.parse(rawStart))?rawStart:null;
  const rawMinutes=Number(appt.duration);
  const appointmentMinutes=Number.isInteger(rawMinutes)&&rawMinutes>0&&rawMinutes<=180?rawMinutes:null;
  return res.status(200).json({eligible:true,appointmentType:'online',paid:true,
   canStart:process.env.PULSE_ONLINE_PAID_SESSION_ENABLED==='true',appointmentAt,appointmentMinutes});
 }catch(error){
  console.error('[pulse-online-verify] upstream verification unavailable',String(error?.message||error).replace(/[\r\n]/g,' '));
  return res.status(503).json({error:'booking_verification_unavailable'});
 }
}

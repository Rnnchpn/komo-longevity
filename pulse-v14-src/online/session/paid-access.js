// Paid patient entry: every access must be verified by the server against
// authenticated identity, the Acuity appointment and its current payment state.
// Appointment ID is a reference, not a credential or a patient health record.
export const BOOKING_STORAGE_KEY='komo_online_verified_booking_ref_v1';
export const bookingPattern=/^[1-9][0-9]{0,11}$/;
export function normalizeAppointmentId(raw){
 const id=String(raw??'').trim();
 return bookingPattern.test(id)?id:null;
}
export function getAppointmentFromBrowser(search,storage){
 const fromUrl=normalizeAppointmentId(new URLSearchParams(search||'').get('appointment'));
 if(fromUrl)return fromUrl;
 try{return normalizeAppointmentId(storage?.getItem(BOOKING_STORAGE_KEY))}catch{return null}
}
export function clearBooking(storage){
 try{storage?.removeItem(BOOKING_STORAGE_KEY)}catch{}
}
export function keepBooking(storage,id){
 const normalized=normalizeAppointmentId(id);if(!normalized)return false;
 try{storage?.setItem(BOOKING_STORAGE_KEY,normalized);return true}catch{return false}
}
export async function verifyPaidSession({accessToken,appointmentId,fetcher=fetch}){
 const id=normalizeAppointmentId(appointmentId);
 if(!id)return {ok:false,error:'invalid_booking_id'};
 if(typeof accessToken!=='string'||!accessToken)return {ok:false,error:'authentication_required'};
 try{
  const response=await fetcher('/api/pulse-online-verify',{
   method:'POST',
   headers:{'content-type':'application/json',authorization:'Bearer '+accessToken},
   credentials:'omit',cache:'no-store',body:JSON.stringify({appointmentId:id})
  });
  const data=await response.json();
  if(!response.ok||data.eligible!==true)return {ok:false,error:data.error||'booking_verification_failed',http:response.status};
  if(data.canStart!==true)return {ok:false,error:'paid_session_not_enabled',eligible:true};
  return {ok:true,appointmentId:id};
 }catch{return {ok:false,error:'booking_verification_unavailable'}}
}
export function scopedProgressStorage(storage,userId,appointmentId){
 // Backwards compatibility with the original administrator demo session.
 // Never allow the same tab to load another patient's questionnaire.
 const scope='paid_session_'+String(userId)+'_'+String(appointmentId)+'_';
 return {
  getItem(key){try{return storage?.getItem(scope+key)??null}catch{return null}},
  setItem(key,value){try{storage?.setItem(scope+key,value)}catch{}},
  removeItem(key){try{storage?.removeItem(scope+key)}catch{}}
 };
}


// Stripe Checkout purchase reference is NOT authorization. Every session load
// verifies the signed-in Supabase user, product/amount, and current Stripe charge.
export const STRIPE_CHECKOUT_STORAGE_KEY='komo_online_stripe_checkout_v1';
export const stripeCheckoutPattern=/^cs_(?:test|live)_[A-Za-z0-9]{8,200}$/;
export function getStripeCheckoutFromBrowser(search,storage){
 const fromUrl=new URLSearchParams(search||'').get('session_id')||'';
 if(stripeCheckoutPattern.test(fromUrl))return fromUrl;
 try{const prior=storage?.getItem(STRIPE_CHECKOUT_STORAGE_KEY);return stripeCheckoutPattern.test(prior||'')?prior:null}catch{return null}
}
export function keepStripeCheckout(storage,id){
 if(!stripeCheckoutPattern.test(String(id||'')))return false;
 try{storage?.setItem(STRIPE_CHECKOUT_STORAGE_KEY,String(id));return true}catch{return false}
}
export function clearStripeCheckout(storage){try{storage?.removeItem(STRIPE_CHECKOUT_STORAGE_KEY)}catch{}}
export async function verifyStripePaidSession({accessToken,sessionId,fetcher=fetch}){
 if(!stripeCheckoutPattern.test(sessionId||''))return {ok:false,error:'invalid_checkout_session'};
 if(!accessToken)return {ok:false,error:'authentication_required'};
 try{
  const response=await fetcher('/api/pulse-online-stripe-verify',{method:'POST',
   headers:{'content-type':'application/json',authorization:'Bearer '+accessToken},
   credentials:'omit',cache:'no-store',body:JSON.stringify({sessionId})});
  const data=await response.json();
  if(!response.ok||data.eligible!==true||data.paid!==true)return {ok:false,error:data.error||'stripe_payment_not_eligible'};
  if(data.canStart!==true)return {ok:false,error:'paid_session_not_enabled',eligible:true};
  return {ok:true,sessionId,provider:'stripe'};
 }catch{return {ok:false,error:'stripe_verification_unavailable'}}
}

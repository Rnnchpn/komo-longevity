// KŌMØ Motion Online: verify an actual Stripe Checkout payment for a signed-in Pulse user.
// A Stripe redirect or a checkout_session ID alone is NEVER authorization.
// No access if Stripe keys/configuration are absent, purchase is unpaid or refunded,
// account email differs, the product/price differs, or launch gate is disabled.
const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_PUBLISHABLE='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const PRODUCT='prod_VXIVKh9mfUhwEH';
const AMOUNT=3900;
const CURRENCY='eur';
const SESSION=/^cs_(?:test|live)_[A-Za-z0-9]{8,200}$/;
const PRODUCTION_ORIGIN='https://pulse.komolongevity.com';
const ALLOWED_ORIGINS=new Set([PRODUCTION_ORIGIN]);
const safeError=async(response)=>{try{return (await response.json())?.error?.type||String(response.status)}catch{return String(response.status)}};
export async function stripeSessionPaidForUser({sessionId,email,secret,expectedLive,fetcher=fetch}){
 if(!SESSION.test(sessionId)||!email||!secret||typeof expectedLive!=='boolean')return false;
 const headers={authorization:'Bearer '+secret,accept:'application/json'};
 const endpoint='https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(sessionId);
 const sessionUrl=new URL(endpoint);
 sessionUrl.searchParams.append('expand[]','payment_intent.latest_charge');
 const response=await fetcher(sessionUrl.toString(),{headers,signal:AbortSignal.timeout(8000),cache:'no-store'});
 if(!response.ok)throw Error('stripe_session_unavailable_'+await safeError(response));
 const checkout=await response.json();
 const actualEmail=String(checkout.customer_details?.email||checkout.customer_email||'').trim().toLowerCase();
 const intent=checkout.payment_intent;
 const charge=intent&&typeof intent==='object'?intent.latest_charge:null;
 if(checkout.id!==sessionId||checkout.object!=='checkout.session'||checkout.mode!=='payment'||
    checkout.status!=='complete'||checkout.payment_status!=='paid'||checkout.livemode!==expectedLive||
    checkout.currency?.toLowerCase()!==CURRENCY||checkout.amount_total!==AMOUNT||
    checkout.amount_subtotal>AMOUNT||actualEmail!==email||!charge||typeof charge!=='object'||
    intent.status!=='succeeded'||intent.currency?.toLowerCase()!==CURRENCY||
    intent.amount_received!==AMOUNT||charge.paid!==true||charge.status!=='succeeded'||
    charge.refunded===true||Number(charge.amount_refunded||0)>0||charge.disputed===true)return false;
 const items=await fetcher(endpoint+'/line_items?limit=20&expand%5B%5D=data.price.product',{
  headers,signal:AbortSignal.timeout(8000),cache:'no-store'});
 if(!items.ok)throw Error('stripe_line_items_unavailable_'+await safeError(items));
 const data=await items.json();
 if(data.has_more!==false||!Array.isArray(data.data)||data.data.length!==1)return false;
 const item=data.data[0],price=item.price;
 const productId=typeof price?.product==='string'?price.product:price?.product?.id;
 return productId===PRODUCT&&item.quantity===1&&item.amount_total===AMOUNT&&
        price?.currency?.toLowerCase()===CURRENCY&&price?.type==='one_time';
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 const origin=req.headers.origin||'';
 if(origin&&!ALLOWED_ORIGINS.has(origin)&&!/^https:\/\/komo-longevity-[a-z0-9-]+\.vercel\.app$/.test(origin))
  return res.status(403).json({error:'origin_not_allowed'});
 const jwt=String(req.headers.authorization||'').match(/^Bearer ([\w.-]+)$/)?.[1];
 if(!jwt)return res.status(401).json({error:'authentication_required'});
 const sessionId=String(req.body?.sessionId||'').trim();
 if(!SESSION.test(sessionId))return res.status(400).json({error:'invalid_checkout_session'});
 const secret=process.env.STRIPE_SECRET_KEY;
 const mode=process.env.STRIPE_EXPECTED_LIVEMODE;
 if(!secret||!['true','false'].includes(mode))return res.status(503).json({error:'stripe_verification_not_configured'});
 try{
  const auth=await fetch(SUPABASE_URL+'/auth/v1/user',{
   headers:{apikey:SUPABASE_PUBLISHABLE,authorization:'Bearer '+jwt},
   cache:'no-store',signal:AbortSignal.timeout(7000)});
  if(!auth.ok)return res.status(401).json({error:'session_expired'});
  const user=await auth.json();
  const email=String(user.email||'').trim().toLowerCase();
  if(!email||!user.email_confirmed_at||user.is_anonymous===true)return res.status(403).json({error:'email_not_verified'});
  const paid=await stripeSessionPaidForUser({sessionId,email,secret,expectedLive:mode==='true'});
  if(!paid)return res.status(403).json({error:'stripe_payment_not_eligible'});
  const canStart=process.env.PULSE_ONLINE_STRIPE_ENABLED==='true';
  return res.status(200).json({eligible:true,paid:true,canStart,provider:'stripe'});
 }catch(error){
  console.error('[stripe-verify] temporarily unavailable',String(error?.message||error).replace(/[\r\n]/g,' '));
  return res.status(503).json({error:'stripe_verification_unavailable'});
 }
}

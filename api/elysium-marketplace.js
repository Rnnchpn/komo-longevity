import {createClient} from '@supabase/supabase-js';
const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const validCities=['monaco','cannes','saint-tropez','all'];
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('Vary','Authorization');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({ok:false,error:'method_not_allowed'})}
 const auth=String(req.headers.authorization||'');const jwt=auth.startsWith('Bearer ')?auth.slice(7):'';
 if(!jwt||jwt.length>6000)return res.status(401).json({ok:false,error:'sign_in_required'});
 try{
  const client=createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},
   global:{headers:{Authorization:'Bearer '+jwt}}});
  const {data:{user},error}=await client.auth.getUser(jwt);
  if(error||!user||user.is_anonymous)return res.status(401).json({ok:false,error:'sign_in_required'});
  const owner=user.email?.trim().toLowerCase()==='renanchapon@gmail.com'&&Boolean(user.email_confirmed_at);
  if(!owner){
   const {data:member,error:e}=await client.from('elysium_memberships').select('status,current_period_end').eq('user_id',user.id).maybeSingle();
   if(e||!member||!['active','trialing'].includes(member.status)||(member.current_period_end&&Date.parse(member.current_period_end)<=Date.now()))
    return res.status(403).json({ok:false,error:'membership_required'});
  }
  const now=new Date().toISOString();
  const city=validCities.includes(String(req.query?.city||''))?String(req.query.city):'all';
  let l=client.from('elysium_yacht_listings').select('id,title,yacht_name,listing_type,location_city,length_m,price_eur,price_label,description,image_url,external_url,promoted_until')
    .eq('status','approved').eq('billing_status','paid').gt('paid_until',now).order('created_at',{ascending:false}).limit(80);
  if(city!=='all')l=l.eq('location_city',city);
  let a=client.from('elysium_ad_campaigns').select('id,listing_id,placement,location_city,headline,creative_url,starts_at,ends_at')
    .eq('status','active').eq('payment_status','paid').lte('starts_at',now).gt('ends_at',now).order('ends_at',{ascending:true}).limit(30);
  if(city!=='all')a=a.in('location_city',[city,'all']);
  const [lr,ar]=await Promise.all([l,a]);
  if(lr.error||ar.error)return res.status(503).json({ok:false,error:'catalogue_unavailable'});
  const listings=(lr.data||[]).map(x=>({...x,advertisement:true,label:'ANNONCE BROKER'}));
  const ads=(ar.data||[]).map(x=>({...x,advertisement:true,label:'SPONSORISÉ'}));
  return res.status(200).json({ok:true,listings,ads,updatedAt:now,note:'Paid verified promotions only. Advertiser location indicates a selected destination, not vessel AIS position.'});
 }catch(e){
  console.error('[elysium-marketplace]',String(e).slice(0,150));
  return res.status(503).json({ok:false,error:'service_unavailable'});
 }
}

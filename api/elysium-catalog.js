import { createClient } from '@supabase/supabase-js';
import { WORLDS, WORLD_BY_SLUG } from '../src/elysium/store-data.mjs';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY="sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n";
const PUBLIC_META=w=>({slug:w.slug,no:w.no,name:w.name,icon:w.icon,eyebrow:w.eyebrow,image:w.image,subtitleEn:w.subtitleEn,subtitleFr:w.subtitleFr,copyEn:w.copyEn,copyFr:w.copyFr,productCount:w.products.length});
const json=(res,status,body)=>res.status(status).json(body);
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Vary','Authorization');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return json(res,405,{ok:false,error:'method_not_allowed'});}
 const authorization=req.headers.authorization||'';
 const jwt=authorization.startsWith('Bearer ')?authorization.slice(7):'';
 if(!jwt||jwt.length>6000)return json(res,401,{ok:false,error:'sign_in_required'});
 const client=createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:'Bearer '+jwt}}});
 try{
  const {data:{user},error:identityError}=await client.auth.getUser(jwt);
  if(identityError||!user||user.is_anonymous)return json(res,401,{ok:false,error:'sign_in_required'});
  // Owner access is granted only after Supabase Auth verifies the actual mailbox
  // and reports that the email is confirmed. No client-supplied role/metadata is trusted.
  const isOwner=user.email?.trim().toLowerCase()==='renanchapon@gmail.com' && Boolean(user.email_confirmed_at);
  if(isOwner){
   const requested=String(req.query?.world||'overview');
   const ent={tier:'maison',status:'active'};
   if(requested==='overview')return json(res,200,{ok:true,membership:ent,worlds:WORLDS.map(PUBLIC_META)});
   const world=WORLD_BY_SLUG[requested];
   if(!world)return json(res,404,{ok:false,error:'world_not_found'});
   return json(res,200,{ok:true,membership:ent,world:{...PUBLIC_META(world),products:world.products}});
  }
  const {data:membership,error:dbError}=await client.from('elysium_memberships')
   .select('status,tier,current_period_end,approved_at').eq('user_id',user.id).maybeSingle();
  if(dbError){console.error('[elysium-catalog] entitlement lookup failed',dbError.code);return json(res,503,{ok:false,error:'entitlement_unavailable'});}
  const valid=membership&&['active','trialing'].includes(membership.status) && (!membership.current_period_end||Date.parse(membership.current_period_end)>Date.now());
  if(!valid)return json(res,403,{ok:false,error:'membership_required',status:membership?.status||'none'});
  const requested=String(req.query?.world||'overview');
  const ent={tier:membership.tier,status:membership.status};
  if(requested==='overview')return json(res,200,{ok:true,membership:ent,worlds:WORLDS.map(PUBLIC_META)});
  const world=WORLD_BY_SLUG[requested];
  if(!world)return json(res,404,{ok:false,error:'world_not_found'});
  return json(res,200,{ok:true,membership:ent,world:{...PUBLIC_META(world),products:world.products}});
 }catch(err){console.error('[elysium-catalog] request error',String(err).slice(0,150));return json(res,503,{ok:false,error:'service_unavailable'});}
}

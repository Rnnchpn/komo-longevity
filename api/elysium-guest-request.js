import {createClient} from '@supabase/supabase-js';
const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const db=createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const roles=new Set(['guest','captain','broker','assistant']);
const cities=new Set(['cannes','monaco','saint-tropez','other']);
const services=new Set(['motion','beauty','wellness','dining','experiences','concierge']);
const hits=new Map();
function clean(value,max=120){return typeof value==='string'?value.trim().slice(0,max+1):''}
function emailOK(x){return /^[^\s@]{1,85}@[^\s@]{2,90}\.[^\s@]{2,30}$/.test(x)}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private,no-store,max-age=0');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'method_not_allowed'})}
 const origin=String(req.headers.origin||'');
 const host=String(req.headers.host||'');
 if(origin){try{if(new URL(origin).host!==host)return res.status(403).json({ok:false,error:'origin_not_allowed'})}
 catch{return res.status(403).json({ok:false,error:'origin_not_allowed'})}}
 if(Number(req.headers['content-length']||0)>6500)return res.status(413).json({ok:false,error:'too_large'});
 const ip=String(req.headers['x-forwarded-for']||req.headers['x-real-ip']||'guest').split(',')[0].trim().slice(0,80);
 const now=Date.now(),state=hits.get(ip)||{count:0,until:now+600000};
 if(now>state.until){state.count=0;state.until=now+600000}
 state.count++;hits.set(ip,state);
 if(hits.size>2000)hits.clear();
 if(state.count>6)return res.status(429).json({ok:false,error:'too_many_requests'});
 const p=req.body&&typeof req.body==='object'&&!Array.isArray(req.body)?req.body:{};
 // A silent honeypot: a bot must not create a real lead.
 if(p.website)return res.status(202).json({ok:true});
 const role=clean(p.role,24),city=clean(p.city,32),service=clean(p.service,32);
 const name=clean(p.name,90),email=clean(p.email,180);
 const yacht=clean(p.yacht,100),note=clean(p.note,350),referral=clean(p.referral,48);
 const date=clean(p.date,15);
 if(!roles.has(role)||!cities.has(city)||!services.has(service)||name.length<2||name.length>90||!emailOK(email)||
 yacht.length>100||note.length>350||referral.length>48||p.consent!==true)
  return res.status(400).json({ok:false,error:'invalid_fields'});
 let serviceDate=null;
 if(date){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return res.status(400).json({ok:false,error:'invalid_date'});
  const d=new Date(date+'T12:00:00Z');
  if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date||
    d.getTime()<Date.now()-86400000||d.getTime()>Date.now()+366*86400000)
   return res.status(400).json({ok:false,error:'invalid_date'});
  serviceDate=date;
 }
 try{
  const {error}=await db.from('elysium_guest_requests').insert({
   role,city,service,guest_name:name,contact_email:email,
   yacht_name:yacht||null,requested_date:serviceDate,logistics_note:note||null,
   referral_code:referral||null
  });
  if(error){console.error('[elysium_guest_request] database insert failed',error.code);throw Error('db')}
  return res.status(202).json({ok:true,message:'recorded'});
 }catch{return res.status(503).json({ok:false,error:'temporarily_unavailable'})}
}

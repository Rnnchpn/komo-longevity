import {createClient} from '@supabase/supabase-js';
import intelligenceHandler from './intelligence-live.js';

const AUTH_URL='https://uqlolefsiktbznnymriy.supabase.co';
const AUTH_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const PORTS={
 'Port Hercule':[43.7369,7.4254],
 'Port de Fontvieille':[43.7284,7.4168],
 'Cannes Vieux Port':[43.5501,7.0156],
 'Port Canto':[43.5427,7.0352],
 'Port Canto (Cannes)':[43.5427,7.0352],
 'Port de Saint-Tropez':[43.2713,6.6385],
 'Golfe-Juan Anchorage':[43.5639,7.0734],
 'Port Vauban':[43.5824,7.1274],
 'Port de Nice':[43.6963,7.2867],
 'Villefranche-sur-Mer Anchorage':[43.6998,7.3156]
};
const json=(res,status,obj)=>res.status(status).json(obj);
function cityOf(y){
 const v=((y.city||'')+' '+(y.port||'')).toLowerCase();
 if(v.includes('saint-tropez'))return 'saint-tropez';
 if(v.includes('cannes')||v.includes('canto')||v.includes('golfe-juan')||v.includes('vauban')||v.includes('antibes'))return 'cannes';
 if(v.includes('monaco')||v.includes('hercule')||v.includes('fontvieille')||v.includes('nice')||v.includes('villefranche'))return 'monaco';
 return null;
}
async function allow(jwt){
 const client=createClient(AUTH_URL,AUTH_KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:'Bearer '+jwt}}});
 const {data:{user},error}=await client.auth.getUser(jwt);
 if(error||!user||user.is_anonymous)return false;
 if(user.email?.trim().toLowerCase()==='renanchapon@gmail.com'&&user.email_confirmed_at)return true;
 const {data:membership,error:dbErr}=await client.from('elysium_memberships')
 .select('status,current_period_end').eq('user_id',user.id).maybeSingle();
 if(dbErr)throw Error('entitlement_unavailable');
 return Boolean(membership&&['active','trialing'].includes(membership.status)&&
 (!membership.current_period_end||Date.parse(membership.current_period_end)>Date.now()));
}
function sanitize(y){
 const city=cityOf(y);
 if(!city||!['ais','harbour'].includes(y.precision))return null;
 const port=String(y.port||'').slice(0,80);
 const lat=Number(y.lat),lng=Number(y.lng);
 const exact=y.precision==='ais'&&Number.isFinite(lat)&&Number.isFinite(lng)
   &&lat>42.8&&lat<44.1&&lng>5.8&&lng<8.5;
 const home=PORTS[port];
 if(!exact&&!home)return null;
 const date=String(y.aisTimestamp||'');
 const time=Date.parse(date);
 const recent=Number.isFinite(time)&&time<=Date.now()+120000&&Date.now()-time<=30*60*1000;
 return {
  id:String(y.id||'').slice(0,120),name:String(y.name||'Yacht').slice(0,80),
  length:Number(y.length)||null,port,city,
  lat:exact?lat:home[0],lng:exact?lng:home[1],
  precision:exact?'ais':'harbour',aisRecent:exact&&recent,
  reportedAt:exact&&Number.isFinite(time)?new Date(time).toISOString():null
 };
}
async function sourceSnapshot(){
 let responseBody=null,status=200;
 const fake={
  setHeader(){return this},status(s){status=s;return this},
  json(body){responseBody=body;return this}
 };
 await intelligenceHandler({method:'GET'},fake);
 if(status!==200||!responseBody)throw Error('feed_unavailable');
 return responseBody;
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Vary','Authorization');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return json(res,405,{ok:false,error:'method_not_allowed'});}
 const auth=String(req.headers.authorization||'');
 const jwt=auth.startsWith('Bearer ')?auth.slice(7):'';
 if(!jwt||jwt.length>6000)return json(res,401,{ok:false,error:'sign_in_required'});
 try{
  if(!await allow(jwt))return json(res,403,{ok:false,error:'membership_required'});
 }catch{ return json(res,503,{ok:false,error:'entitlement_unavailable'}); }
 try{
  const feed=await sourceSnapshot();
  // Historical static fallbacks are deliberately NEVER exposed as live yachts.
  const valid=Boolean(feed.meta?.live);
  const yachts=valid?(feed.yachts||[]).map(sanitize).filter(Boolean).slice(0,250):[];
  return json(res,200,{ok:true,source:valid?'harbour_and_optional_ais':'no_verified_feed',
   updatedAt:valid?feed.updatedAt:null,
   yachts,preciseCount:yachts.filter(y=>y.precision==='ais'&&y.aisRecent).length,
   explanation:'AIS marker = reported position; harbour marker = port-level presence, NOT yacht berth or exact live position.',
   access:'active_members_only'
  });
 }catch(err){
  console.warn('[elysium-onboard] feed unavailable',String(err).slice(0,120));
  return json(res,200,{ok:true,source:'no_verified_feed',updatedAt:null,yachts:[],preciseCount:0,access:'active_members_only'});
 }
}

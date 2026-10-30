import { createClient } from '@supabase/supabase-js';

/* ELYSIUM Riviera / vetted member-only AIS feed.
   No fallback snapshots, port-page scrapes or invented vessel positions.
   One regional LiveData request per refresh; concurrent requests coalesce. */
const AUTH_URL='https://uqlolefsiktbznnymriy.supabase.co';
const AUTH_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const CITIES={
 monaco:{name:'Monaco',lat:43.7353,lng:7.4235,radiusKm:26},
 cannes:{name:'Cannes',lat:43.549,lng:7.025,radiusKm:27},
 'saint-tropez':{name:'Saint-Tropez',lat:43.2708,lng:6.639,radiusKm:32}
};
const PORTS=[
 {name:'Port Hercule',city:'monaco',lat:43.7369,lng:7.4254},
 {name:'Fontvieille',city:'monaco',lat:43.7284,lng:7.4168},
 {name:'Vieux Port',city:'cannes',lat:43.5501,lng:7.0156},
 {name:'Port Canto',city:'cannes',lat:43.5427,lng:7.0352},
 {name:'Golfe-Juan',city:'cannes',lat:43.5639,lng:7.0734},
 {name:'Port de Saint-Tropez',city:'saint-tropez',lat:43.2713,lng:6.6385}
];
const MAX_AGE_MS=15*60_000;
const CACHE_MS=40_000;
const FETCH_TIMEOUT_MS=4800;
let cached=null,cacheExpires=0,inFlight=null;
const reply=(res,status,body)=>res.status(status).json(body);
function distanceKm(a,b,c,d){
 const rad=Math.PI/180,p=(c-a)*rad,l=(d-b)*rad;
 const h=Math.sin(p/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(l/2)**2;
 return 12742*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
function bearing(a,b,c,d){
 const r=Math.PI/180,dl=(d-b)*r;
 const y=Math.sin(dl)*Math.cos(c*r);
 const x=Math.cos(a*r)*Math.sin(c*r)-Math.sin(a*r)*Math.cos(c*r)*Math.cos(dl);
 return (Math.atan2(y,x)*180/Math.PI+360)%360;
}
function courseGap(a,b){return Math.abs((a-b+540)%360-180)}
function parseAisTime(v){
 if(typeof v==='number')return Number.isFinite(v)?(v<1e12?v*1000:v):NaN;
 if(typeof v!=='string')return NaN;
 const iso=v.trim().replace(/\s+UTC$/i,'Z').replace(' ','T');
 return Date.parse(iso);
}
function closestCity(lat,lng){
 const all=Object.entries(CITIES).map(([id,c])=>({id,...c,dist:distanceKm(lat,lng,c.lat,c.lng)})).sort((a,b)=>a.dist-b.dist);
 return all[0]&&all[0].dist<=all[0].radiusKm?all[0]:null;
}
function classify({navStatus,speed,course,lat,lng,port}){
 // AIS navigation status: 0 under way, 1 at anchor, 5 moored.
 // A high velocity or explicit underway state overrides stale/misconfigured mooring flags.
 if(navStatus===1 && speed<1.5)return 'at_anchor';
 if(navStatus===5 && speed<1.2 && port && port.distanceKm<=1)return 'in_port';
 if(speed>=1.5 && port){
  const headingToPort=bearing(lat,lng,port.lat,port.lng);
  if(port.distanceKm<=10 && Number.isFinite(course) && course<=360 &&
     courseGap(course,headingToPort)<=65)return 'approaching';
 }
 if(speed>=1.2)return 'underway';
 return 'unclassified';
}
function normalise(row,index,now){
 const ais=row?.AIS||{},master=row?.MASTERDATA||{};
 const lat=Number(ais.LATITUDE),lng=Number(ais.LONGITUDE);
 if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
 const city=closestCity(lat,lng);if(!city)return null;
 const type=Number(ais.TYPE||master.TYPE);
 const lengthParts=Number(ais.A)+Number(ais.B);
 const length=Number.isFinite(lengthParts)&&lengthParts>0?lengthParts:Number(master.LENGTH||master.LENGTH_M||row.LENGTH||0);
 // Yacht-focused vessel types: 36 sailing / 37 pleasure; other ship categories excluded.
 if(type!==36&&type!==37)return null;
 if(Number.isFinite(length)&&length>0&&length<20)return null;
 const name=String(ais.NAME||master.NAME||'').trim().slice(0,80);
 if(!name)return null;
 const ms=parseAisTime(ais.TIMESTAMP);
 const ageMs=now-ms;
 if(!Number.isFinite(ms)||ageMs< -120000||ageMs>MAX_AGE_MS)return null;
 const near=PORTS.filter(p=>p.city===city.id).map(p=>({...p,distanceKm:distanceKm(lat,lng,p.lat,p.lng)})).sort((a,b)=>a.distanceKm-b.distanceKm)[0];
 const speedValue=Number(ais.SPEED);
 const speed=Number.isFinite(speedValue)&&speedValue>=0&&speedValue<=75?speedValue:0;
 const courseValue=Number(ais.COURSE);
 const course=Number.isFinite(courseValue)&&courseValue>=0&&courseValue<=360?courseValue:null;
 const navStatus=Number(ais.NAVSTAT);
 const status=classify({navStatus,speed,course,lat,lng,port:near});
 const isBerth=status==='in_port' && near && near.distanceKm<=1;
 const destination=String(ais.DESTINATION||'').slice(0,75);
 const posLabel=isBerth?near.name:(status==='approaching'&&near?near.name:city.name+' · Riviera');
 const mmsi=String(ais.MMSI||'').replace(/\D/g,'').slice(0,12);
 return {
  id:mmsi||('ais-'+city.id+'-'+index),name,city:city.id,port:posLabel,
  length:Number.isFinite(length)&&length>=20?Math.round(length*10)/10:null,
  lat,lng,precision:'ais',aisRecent:true,reportedAt:new Date(ms).toISOString(),
  status,speedKnots:Math.round(speed*10)/10,courseDegrees:course,
  navigationCode:Number.isFinite(navStatus)?navStatus:null,destination,
  source:'VesselFinder LiveData',ageSeconds:Math.round(ageMs/1000)
 };
}
async function authorized(jwt){
 const client=createClient(AUTH_URL,AUTH_KEY,{auth:{persistSession:false,autoRefreshToken:false},
 global:{headers:{Authorization:'Bearer '+jwt}}});
 const {data:{user},error}=await client.auth.getUser(jwt);
 if(error||!user||user.is_anonymous)return {ok:false,code:401};
 if(user.email?.trim().toLowerCase()==='renanchapon@gmail.com'&&user.email_confirmed_at)return {ok:true};
 const {data:member,error:dbError}=await client.from('elysium_memberships')
 .select('status,current_period_end').eq('user_id',user.id).maybeSingle();
 if(dbError)throw Error('membership_check_unavailable');
 const ok=Boolean(member&&['active','trialing'].includes(member.status)&&
 (!member.current_period_end||Date.parse(member.current_period_end)>Date.now()));
 return {ok,code:403};
}
async function regionalAIS(){
 const key=process.env.VESSELFINDER_API_KEY||process.env.VESSELFINDER_USERKEY;
 if(!key)return {source:'ais_not_configured',yachts:[],updatedAt:null,provider:'VesselFinder LiveData',reason:'subscription_key_required'};
 const now=Date.now();
 if(cached && cacheExpires>now)return {...cached,cacheAgeSeconds:Math.round((now-cached.receivedAt)/1000)};
 if(inFlight)return inFlight;
 inFlight=(async()=>{
  // LiveData requires a paid, preconfigured geographic subscription; keep the key on the server.
  const request='https://api.vesselfinder.com/livedata?'+new URLSearchParams({
   userkey:key,format:'json',interval:'15'
  });
  const response=await fetch(request,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(FETCH_TIMEOUT_MS)});
  if(!response.ok)throw Error('AIS provider HTTP '+response.status);
  const rows=await response.json();
  if(!Array.isArray(rows))throw Error('AIS provider returned a non-array response');
  const stamp=Date.now();
  const vessels=rows.map((row,i)=>normalise(row,i,stamp)).filter(Boolean).slice(0,400);
  const result={source:'live_ais',provider:'VesselFinder LiveData',
   updatedAt:new Date(stamp).toISOString(),receivedAt:stamp,cacheAgeSeconds:0,
   yachts:vessels,preciseCount:vessels.length,maxAgeSeconds:MAX_AGE_MS/1000,
   refreshSeconds:40,classification:'AIS derived: speed, course, navigation status and port proximity'};
  cached=result;cacheExpires=stamp+CACHE_MS;
  return result;
 })().finally(()=>{inFlight=null});
 return inFlight;
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('Vary','Authorization');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return reply(res,405,{ok:false,error:'method_not_allowed'})}
 const bearer=String(req.headers.authorization||'');
 const jwt=bearer.startsWith('Bearer ')?bearer.slice(7):'';
 if(!jwt||jwt.length>6000)return reply(res,401,{ok:false,error:'sign_in_required'});
 try{
  const grant=await authorized(jwt);
  if(!grant.ok)return reply(res,grant.code,{ok:false,error:grant.code===401?'sign_in_required':'membership_required'});
 }catch{return reply(res,503,{ok:false,error:'membership_check_unavailable'})}
 try{
  const result=await regionalAIS();
  return reply(res,200,{ok:true,...result});
 }catch(error){
  // No stale / static data is silently relabelled as live.
  console.warn('[elysium-ais] source unavailable',String(error).replace(/[?&]userkey=[^&]*/g,'[key]'));
  return reply(res,200,{ok:true,source:'ais_unavailable',provider:'VesselFinder LiveData',
   yachts:[],preciseCount:0,updatedAt:null,refreshSeconds:40,reason:'provider_temporarily_unavailable'});
 }
}

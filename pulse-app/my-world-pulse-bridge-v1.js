/* KŌMØ Pulse — My World → World identity bridge v1
   Sends game identity only through the URL fragment. No health, wearable,
   appointment, Motion Score or clinical data is transferred to World. */
(()=>{
'use strict';
const VERSION='1.0.0';
const WORLD_URL='https://komo-longevity-orepe8fq6-rnnchpns-projects.vercel.app/world/v134/?_vercel_share=XiEy6QPhLPVwlvlGvloNICC4NOQj90gA';
let entering=false;
const safe=async query=>{try{const r=await query;return r?.error?null:r?.data??null}catch{return null}};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const clean=(v,max=48)=>String(v??'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,max);
function firstFromView(){
  const h=document.querySelector('[data-my-world-v1] .kmw-copy h2');
  const text=String(h?.textContent||'').replace(/\s+/g,' ').trim();
  const named=text.match(/^(.+?)['’]s\s+World/i)?.[1];
  return clean(named||'KŌMŌ',32)||'KŌMŌ';
}
function encodeBase64Url(value){
  const bytes=new TextEncoder().encode(JSON.stringify(value));
  let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function identity(){
  const c=window.KomoRuntime?.client;
  const fallback={v:1,first:firstFromView(),level:1,kp:0,clubs:0,avatar:null};
  if(!c)return fallback;
  const session=(await c.auth.getSession())?.data?.session;
  const uid=session?.user?.id;if(!uid)return fallback;
  const [profile,engagement,wallet,memberships]=await Promise.all([
    safe(c.from('profiles').select('first_name,display_name,avatar_config').eq('id',uid).maybeSingle()),
    safe(c.rpc('komo_engagement_summary')),
    safe(c.rpc('komo_wallet_summary')),
    safe(c.from('komo_club_members').select('club_id').eq('user_id',uid))
  ]);
  const first=clean(profile?.first_name||String(profile?.display_name||'').split(/\s+/)[0]||firstFromView(),32)||'KŌMŌ';
  const avatar=(profile?.avatar_config&&typeof profile.avatar_config==='object'&&!Array.isArray(profile.avatar_config))?profile.avatar_config:null;
  return {
    v:1,
    first,
    level:Math.round(clamp(engagement?.level||1,1,999)),
    kp:Math.round(clamp(wallet?.available_kp??engagement?.points??0,0,99999999)),
    clubs:Math.round(clamp(Array.isArray(memberships)?memberships.length:0,0,99)),
    avatar
  };
}
function setBusy(on){
  document.querySelectorAll('[data-kmw-enter]').forEach(btn=>{
    btn.disabled=on;btn.setAttribute('aria-busy',on?'true':'false');
    if(on&&!btn.dataset.kmwOriginal){btn.dataset.kmwOriginal=btn.innerHTML;btn.innerHTML=btn.classList.contains('kmw-enter')?'OPENING WORLD…':'<div><small>01 · IMMERSIVE</small><strong>Opening World…</strong><p>Synchronisation de votre identité KŌMŌ.</p></div><b>→</b>'}
    if(!on&&btn.dataset.kmwOriginal){btn.innerHTML=btn.dataset.kmwOriginal;delete btn.dataset.kmwOriginal}
  });
}
async function enter(){
  if(entering)return;entering=true;setBusy(true);
  try{
    const payload=await identity();
    const href=`${WORLD_URL}#pulse=${encodeBase64Url(payload)}`;
    location.assign(href);
  }catch(err){
    console.warn('[my-world-pulse-bridge]',err);
    location.assign(WORLD_URL);
  }finally{setTimeout(()=>{entering=false;setBusy(false)},1800)}
}
document.addEventListener('click',e=>{
  const target=e.target.closest?.('[data-kmw-enter]');if(!target)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();enter();
},true);
function installApi(){
  if(window.KomoMyWorld)window.KomoMyWorld.enter=enter;
  window.KomoMyWorldPulseBridge={version:VERSION,enter,identity};
}
installApi();
window.addEventListener('komo:my-world-rendered',installApi);
window.addEventListener('komo:session-ready',installApi);
})();

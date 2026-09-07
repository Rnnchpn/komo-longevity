/* KŌMØ World V0.13.4 — Pulse identity bridge v1
   Game identity only. Never imports Motion Score, wearable, appointment or clinical data. */
(()=>{
'use strict';
const VERSION='1.0.0';
const KEY='komo_world_identity_v1';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const clean=(v,max=48)=>String(v??'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,max);
function decodeBase64Url(value=''){
  try{
    const normalized=value.replace(/-/g,'+').replace(/_/g,'/');
    const padded=normalized+'='.repeat((4-normalized.length%4)%4);
    const binary=atob(padded);
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }catch{return null}
}
function sanitize(raw){
  if(!raw||typeof raw!=='object')return null;
  const avatar=(raw.avatar&&typeof raw.avatar==='object'&&!Array.isArray(raw.avatar))?raw.avatar:null;
  return {
    v:1,
    first:clean(raw.first,32)||'KŌMŌ',
    level:Math.round(clamp(raw.level,1,999)),
    kp:Math.round(clamp(raw.kp,0,99999999)),
    clubs:Math.round(clamp(raw.clubs,0,99)),
    avatar
  };
}
function readIdentity(){
  const params=new URLSearchParams(location.hash.replace(/^#/,''));
  const incoming=sanitize(decodeBase64Url(params.get('pulse')||''));
  if(incoming){
    try{sessionStorage.setItem(KEY,JSON.stringify(incoming))}catch{}
    history.replaceState(null,'',location.pathname+location.search);
    return incoming;
  }
  try{return sanitize(JSON.parse(sessionStorage.getItem(KEY)||'null'))}catch{return null}
}
const identity=readIdentity();
window.KomoWorldIdentity={version:VERSION,identity,source:identity?'pulse':'anonymous'};
if(!identity)return;

function style(){
  if(document.querySelector('#kwPulseBridgeStyle'))return;
  const s=document.createElement('style');s.id='kwPulseBridgeStyle';s.textContent=`
  #kw-pulse-identity{position:fixed;z-index:82;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));display:flex;align-items:center;gap:8px;padding:8px 9px 8px 11px;border:1px solid rgba(239,230,213,.16);border-radius:999px;background:rgba(19,29,24,.76);box-shadow:0 12px 32px rgba(0,0,0,.22);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);color:#f1eadc;font-family:system-ui,sans-serif;pointer-events:auto}
  #kw-pulse-identity .kwpi-copy{display:flex;align-items:baseline;gap:7px;white-space:nowrap}#kw-pulse-identity strong{font-size:9px;letter-spacing:.08em}#kw-pulse-identity span{font-size:7px;color:rgba(241,234,220,.58);letter-spacing:.05em}#kw-pulse-identity button{width:30px;height:30px;border:1px solid rgba(239,230,213,.15);border-radius:999px;background:rgba(255,255,255,.055);color:#eee6d7;font:800 8px/1 system-ui,sans-serif;cursor:pointer}
  #kw-pulse-welcome{position:fixed;z-index:81;left:50%;top:max(72px,calc(env(safe-area-inset-top) + 72px));transform:translateX(-50%);padding:8px 12px;border:1px solid rgba(215,197,154,.18);border-radius:999px;background:rgba(15,24,19,.78);backdrop-filter:blur(14px);color:#e9e2d5;font:700 8px/1 system-ui,sans-serif;letter-spacing:.12em;opacity:0;animation:kwPulseWelcome 4.2s ease forwards;pointer-events:none}@keyframes kwPulseWelcome{0%{opacity:0;transform:translate(-50%,-8px)}12%,62%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-4px)}}
  @media(max-width:800px){#kw-pulse-identity{top:auto;right:8px;bottom:max(112px,calc(env(safe-area-inset-bottom) + 112px));padding:7px 8px}#kw-pulse-identity .kwpi-copy{gap:5px}#kw-pulse-identity strong{font-size:8px}#kw-pulse-identity span{font-size:6px}#kw-pulse-identity button{width:28px;height:28px}#kw-pulse-welcome{top:max(64px,calc(env(safe-area-inset-top) + 64px));font-size:7px}}
  @media(prefers-reduced-motion:reduce){#kw-pulse-welcome{animation:none;opacity:1}}
  `;document.head.appendChild(s)
}
function render(){
  style();
  document.body.dataset.pulseIdentity='1';
  let chip=document.querySelector('#kw-pulse-identity');
  if(!chip){chip=document.createElement('div');chip.id='kw-pulse-identity';document.body.appendChild(chip)}
  chip.innerHTML=`<div class="kwpi-copy"><strong>${identity.first.toUpperCase()}</strong><span>LVL ${identity.level}</span><span>${identity.kp.toLocaleString('fr-FR')} KP</span>${identity.clubs?`<span>${identity.clubs} CLUB${identity.clubs>1?'S':''}</span>`:''}</div><button type="button" aria-label="Retour à Pulse" title="Retour à Pulse">P</button>`;
  chip.querySelector('button')?.addEventListener('click',()=>{if(history.length>1)history.back();else location.href='https://pulse.komolongevity.com/#mykomo'});
  const welcome=document.createElement('div');welcome.id='kw-pulse-welcome';welcome.textContent=`WELCOME BACK · ${identity.first.toUpperCase()}`;document.body.appendChild(welcome);setTimeout(()=>welcome.remove(),4600);
  window.dispatchEvent(new CustomEvent('komo:world-identity-ready',{detail:{version:VERSION,first:identity.first,level:identity.level,kp:identity.kp,clubs:identity.clubs}}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();

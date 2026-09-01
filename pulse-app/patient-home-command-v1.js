import './komo-ai-client-v1.js';
import './komo-assistant-shell-v2.js';
import './patient-mobile-v1.js';

const VERSION='6.2.0';
let timer=0;
let rendering=false;
let lastSignature='';

const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const fmtInt=v=>v===null||v===undefined?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Math.round(Number(v)));
const minus='−';
const clampScore=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));

function formatSleep(minutes){
  const value=num(minutes);
  if(value===null)return'—';
  const total=Math.max(0,Math.round(value));
  const h=Math.floor(total/60);
  const m=total%60;
  return `${h}h ${String(m).padStart(2,'0')}`;
}
function signed(value,suffix=''){
  const n=num(value);
  if(n===null)return'—';
  const rounded=Math.round(Math.abs(n));
  if(n>0)return`+${rounded}${suffix}`;
  if(n<0)return`${minus}${rounded}${suffix}`;
  return`0${suffix}`;
}
function arrow(value){
  const n=num(value);
  if(n===null||n===0)return'→';
  return n>0?'↑':'↓';
}
function tone(value,inverse=false){
  const n=num(value);
  if(n===null||n===0)return'neutral';
  const favorable=inverse?n<0:n>0;
  return favorable?'positive':'negative';
}
function baselineReady(metric,estimated=false){
  const days=num(metric?.baseline_days);
  if(days===null)return false;
  return estimated?days>=1:days>=14;
}

async function motionToday(){
  const sb=window.KomoRuntime?.client;
  if(!sb)return null;
  try{
    const {data,error}=await sb.rpc('komo_motion_today_v1');
    if(error)throw error;
    return data||null;
  }catch(e){
    console.warn('[home-motion-today]',e);
    return null;
  }
}

async function homeIdentity(){
  const sb=window.KomoRuntime?.client;
  if(!sb)return{};
  try{
    const runtime=window.KomoRuntime?.getContext?.();
    const session=runtime?.session||(await sb.auth.getSession()).data?.session;
    if(!session?.user)return{};
    const [profileResult,engagementResult]=await Promise.all([
      sb.from('profiles').select('avatar_config,first_name,last_name,display_name').eq('id',session.user.id).maybeSingle(),
      sb.rpc('komo_engagement_summary')
    ]);
    if(profileResult.error)console.warn('[home-profile]',profileResult.error);
    if(engagementResult.error)console.warn('[home-experience]',engagementResult.error);
    return{user:session.user,profile:profileResult.data||{},engagement:engagementResult.data||{}};
  }catch(e){
    console.warn('[home-identity]',e);
    return{};
  }
}

function initials(identity){
  const p=identity?.profile||{};
  const u=identity?.user||{};
  const name=`${p.first_name||''} ${p.last_name||''}`.trim()||p.display_name||u.email?.split('@')[0]||'K';
  const parts=name.trim().split(/\s+/).filter(Boolean);
  return(parts.length>1?`${parts[0][0]}${parts[parts.length-1][0]}`:parts[0]?.slice(0,2)||'K').toUpperCase();
}
function firstName(identity){
  const p=identity?.profile||{};
  return String(p.first_name||p.display_name||'My KŌMØ').trim().split(/\s+/)[0]||'My KŌMØ';
}
function avatarMarkup(identity){
  const p=identity?.profile||{};
  const cfg=window.KomoAvatar?.normalize?.(p.avatar_config||{})||{};
  if(cfg.mode==='avatar'&&window.KomoAvatar?.render){
    return window.KomoAvatar.render(cfg,{label:'Profil KŌMØ'})||`<span>${esc(initials(identity))}</span>`;
  }
  return `<span>${esc(initials(identity))}</span>`;
}
function hudMarkup(identity,loading=false){
  const xp=loading?null:num(identity?.engagement?.xp_total);
  const level=loading?null:num(identity?.engagement?.level);
  const profileName=loading?'Profile':firstName(identity);
  return `<nav class="kh6-hud" aria-label="Profile and experience">
    <a class="kh6-profile" href="#mykomo" data-route="mykomo" aria-label="Open My KŌMØ profile">
      <span class="kh6-avatar" aria-hidden="true">${loading?'<span>K</span>':avatarMarkup(identity)}</span>
      <span class="kh6-profile-copy"><small>PROFILE</small><strong>${esc(profileName)}</strong></span>
    </a>
    <a class="kh6-xp" href="#mykomo" data-route="mykomo" aria-label="Open experience and progression">
      <span class="kh6-xp-copy"><small>EXPERIENCE</small><strong>${xp===null?'—':esc(fmtInt(xp))} <em>XP</em></strong></span>
      <span class="kh6-level">LV. ${level===null?'—':esc(fmtInt(level))}</span>
    </a>
  </nav>`;
}

function metricCard(type,data,loading=false,estimated=false,index=0){
  const metric=data||{};
  const ready=!loading&&baselineReady(metric,estimated);
  let value='—',usual='Usual —',delta='—',direction='→',deltaTone='neutral';

  if(type==='steps'){
    const current=num(metric.value);
    if(current!==null)value=fmtInt(current);
    if(ready&&num(metric.usual)!==null)usual=`Usual ${fmtInt(metric.usual)}`;
    if(ready&&num(metric.delta_pct)!==null){
      delta=signed(metric.delta_pct,'%');
      direction=arrow(metric.delta_pct);
      deltaTone=tone(metric.delta_pct);
    }
  }

  if(type==='sleep'){
    const current=num(metric.value_minutes);
    if(current!==null)value=formatSleep(current);
    if(ready&&num(metric.usual_minutes)!==null)usual=`Usual ${formatSleep(metric.usual_minutes)}`;
    if(ready&&num(metric.delta_minutes)!==null){
      delta=signed(metric.delta_minutes,' min');
      direction=arrow(metric.delta_minutes);
      deltaTone=tone(metric.delta_minutes);
    }
  }

  if(type==='resting_hr'){
    const current=num(metric.value);
    if(current!==null)value=`${fmtInt(current)} bpm`;
    if(ready&&num(metric.usual)!==null)usual=`Usual ${fmtInt(metric.usual)} bpm`;
    if(ready&&num(metric.delta)!==null){
      delta=signed(metric.delta,' bpm');
      direction=arrow(metric.delta);
      deltaTone=tone(metric.delta,true);
    }
  }

  const labels={steps:'Steps',sleep:'Sleep',resting_hr:'Resting HR'};
  return `<article class="kh6-metric" data-metric="${esc(type)}" style="--kh6-stagger:${index}">
    <div class="kh6-value"><strong>${esc(value)}</strong><span class="is-${esc(deltaTone)}" aria-hidden="true">${esc(direction)}</span></div>
    <h3>${esc(labels[type])}</h3>
    <p>${esc(usual)}</p>
    <div class="kh6-delta is-${esc(deltaTone)}"><span>${esc(delta)}</span>${ready&&delta!=='—'?'<i aria-hidden="true"></i>':''}</div>
  </article>`;
}

function homeMarkup(data,identity={},loading=false){
  const canonicalReady=!loading&&Boolean(data?.ready)&&num(data?.score)!==null;
  const preview=!loading&&!canonicalReady&&Boolean(data?.preview?.available)&&num(data?.preview?.score)!==null?data.preview:null;
  const active=preview||data||{};
  const estimated=Boolean(preview);
  const ready=!loading&&(canonicalReady||estimated)&&num(active?.score)!==null;
  const score=ready?String(Math.round(Number(active.score))):'—';
  const scoreProgress=ready?clampScore(active.score):0;
  const scoreOffset=100-scoreProgress;
  const state=loading?'loading':String(active?.status||data?.status||'incomplete');
  const message=loading?'Syncing your data':String(active?.message||data?.message||'Sync your wearable');
  const badge=estimated?'<span class="kh6-estimate">Estimation</span>':'';
  return `<section class="kh6${loading?' is-loading':''}${estimated?' is-estimated':''}" data-khome-v6 data-motion-state="${esc(state)}" data-estimated="${estimated?'true':'false'}" aria-busy="${loading?'true':'false'}">
    ${hudMarkup(identity,loading)}
    <div class="kh6-core" aria-label="Motion Today">
      <div class="kh6-orbit" style="--kh6-progress:${scoreProgress};--kh6-offset:${scoreOffset}" aria-label="${ready?`${esc(score)} out of 100`:'Score unavailable'}">
        <svg class="kh6-ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle class="kh6-ring-track" cx="100" cy="100" r="84" pathLength="100"></circle>
          <circle class="kh6-ring-progress" cx="100" cy="100" r="84" pathLength="100"></circle>
        </svg>
        <strong class="kh6-score">${esc(score)}</strong>
      </div>
      <div class="kh6-kicker"><span class="kh6-label">MOTION TODAY</span>${badge}</div>
      <p class="kh6-message">${esc(message)}</p>
    </div>
    <section class="kh6-metrics" aria-label="Daily movement signals">
      ${metricCard('steps',active?.steps,loading,estimated,0)}
      ${metricCard('sleep',active?.sleep,loading,estimated,1)}
      ${metricCard('resting_hr',active?.resting_hr,loading,estimated,2)}
    </section>
  </section>`;
}

function mount(host,markup){
  const wrap=document.createElement('div');
  wrap.innerHTML=markup;
  const node=wrap.firstElementChild;
  host.replaceChildren(node);
  host.dataset.khomeOwner='patient-home-command-v1@6';
  document.body.classList.add('khome-final-v1');
  return node;
}

function tuneChrome(){
  const home=route()==='home';
  document.body.classList.toggle('khome-final-v1',home);
  if(!home)return;
  const eyebrow=document.querySelector('#pageEyebrow');
  const title=document.querySelector('#pageTitle');
  if(eyebrow)eyebrow.textContent='';
  if(title)title.textContent='';
}

async function render(force=false){
  if(rendering||route()!=='home')return;
  const host=document.querySelector('[data-my-komo-home]');
  if(!host)return;
  rendering=true;
  try{
    tuneChrome();
    if(!host.querySelector('[data-khome-v6]'))mount(host,homeMarkup(null,{},true));
    const [data,identity]=await Promise.all([motionToday(),homeIdentity()]);
    if(route()!=='home'||!host.isConnected)return;
    const markup=homeMarkup(data,identity,false);
    if(!force&&markup===lastSignature&&host.querySelector('[data-khome-v6]:not(.is-loading)'))return;
    mount(host,markup);
    lastSignature=markup;
    window.KomoAssistantV2?.refresh?.();
    window.dispatchEvent(new CustomEvent('komo:home-command-rendered',{detail:{version:VERSION,algorithm:data?.algorithm_version||null,estimated:Boolean(data?.preview?.available&&!data?.ready),xp:num(identity?.engagement?.xp_total),level:num(identity?.engagement?.level)}}));
  }catch(e){
    console.error('[patient-home-v6]',e);
    if(host?.isConnected)mount(host,homeMarkup({status:'incomplete',message:'Sync your wearable'},{},false));
  }finally{rendering=false}
}

function schedule(force=false,ms=0){clearTimeout(timer);timer=setTimeout(()=>render(force),ms)}
['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:wearable-data-updated','komo:profile-identity-updated'].forEach(name=>window.addEventListener(name,()=>{
  tuneChrome();
  schedule(['komo:data-ready','komo:wearable-data-updated','komo:profile-identity-updated'].includes(name),20);
}));
function boot(){tuneChrome();schedule(true,0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(true,0)};

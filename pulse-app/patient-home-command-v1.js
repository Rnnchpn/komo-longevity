import './komo-ai-client-v1.js';
import './komo-assistant-shell-v2.js';
import './patient-mobile-v1.js';

const VERSION='6.0.0';
let timer=0;
let rendering=false;
let lastSignature='';

const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const fmtInt=v=>v===null||v===undefined?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Math.round(Number(v)));
const minus='−';

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
function baselineReady(metric){return num(metric?.baseline_days)!==null&&Number(metric.baseline_days)>=14}

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

function metricCard(type,data,loading=false){
  const metric=data||{};
  const ready=!loading&&baselineReady(metric);
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
  return `<article class="kh6-metric" data-metric="${esc(type)}">
    <div class="kh6-value"><strong>${esc(value)}</strong><span aria-hidden="true">${esc(direction)}</span></div>
    <h3>${esc(labels[type])}</h3>
    <p>${esc(usual)}</p>
    <div class="kh6-delta is-${esc(deltaTone)}"><span>${esc(delta)}</span>${ready&&delta!=='—'?'<i aria-hidden="true"></i>':''}</div>
  </article>`;
}

function homeMarkup(data,loading=false){
  const ready=!loading&&Boolean(data?.ready)&&num(data?.score)!==null;
  const score=ready?String(Math.round(Number(data.score))):'—';
  const state=loading?'loading':String(data?.status||'incomplete');
  const message=loading?'Syncing your data':String(data?.message||'Sync your wearable');
  return `<section class="kh6${loading?' is-loading':''}" data-khome-v6 data-motion-state="${esc(state)}" aria-busy="${loading?'true':'false'}">
    <div class="kh6-core" aria-label="Motion Today">
      <strong class="kh6-score">${esc(score)}</strong>
      <span class="kh6-label">MOTION TODAY</span>
      <p class="kh6-message">${esc(message)}</p>
    </div>
    <section class="kh6-metrics" aria-label="Daily movement signals">
      ${metricCard('steps',data?.steps,loading)}
      ${metricCard('sleep',data?.sleep,loading)}
      ${metricCard('resting_hr',data?.resting_hr,loading)}
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
  if(eyebrow)eyebrow.textContent='HOME';
  if(title)title.textContent='';
}

async function render(force=false){
  if(rendering||route()!=='home')return;
  const host=document.querySelector('[data-my-komo-home]');
  if(!host)return;
  rendering=true;
  try{
    tuneChrome();
    if(!host.querySelector('[data-khome-v6]'))mount(host,homeMarkup(null,true));
    const data=await motionToday();
    if(route()!=='home'||!host.isConnected)return;
    const markup=homeMarkup(data,false);
    if(!force&&markup===lastSignature&&host.querySelector('[data-khome-v6]:not(.is-loading)'))return;
    mount(host,markup);
    lastSignature=markup;
    window.KomoAssistantV2?.refresh?.();
    window.dispatchEvent(new CustomEvent('komo:home-command-rendered',{detail:{version:VERSION,algorithm:data?.algorithm_version||null}}));
  }catch(e){
    console.error('[patient-home-v6]',e);
    if(host?.isConnected)mount(host,homeMarkup({status:'incomplete',message:'Sync your wearable'},false));
  }finally{rendering=false}
}

function schedule(force=false,ms=0){clearTimeout(timer);timer=setTimeout(()=>render(force),ms)}
['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:wearable-data-updated'].forEach(name=>window.addEventListener(name,()=>{
  tuneChrome();
  schedule(['komo:data-ready','komo:wearable-data-updated'].includes(name),20);
}));
function boot(){tuneChrome();schedule(true,0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(true,0)};

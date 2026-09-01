import './komo-ai-client-v1.js';
import './komo-assistant-shell-v2.js';
import './patient-mobile-v1.js';

const VERSION='6.0.0';
const RELEASED=new Set(['released','published']);
const DAILY_DAYS=45;
let timer=0;
let rendering=false;
let lastSignature='';

const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const client=()=>window.KomoRuntime?.client||null;
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const fmtInt=v=>v===null||v===undefined?'—':new Intl.NumberFormat('en-US').format(Math.round(Number(v)));
const released=status=>RELEASED.has(String(status||'').toLowerCase());
const dayKey=value=>{const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))return'';const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return`${y}-${m}-${day}`};
const todayKey=()=>dayKey(new Date());

function go(target){window.KomoPatientNavigation?.go?.(target)}
function context(){return window.KomoRuntime?.getContext?.()||{}}
function identity(){
  const c=context(),p=c.profile||{},u=c.session?.user||{};
  const meta=u.user_metadata||{};
  const first=String(p.preferred_name||p.first_name||meta.given_name||meta.first_name||'').trim().split(/\s+/)[0];
  const full=String(p.display_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||meta.full_name||u.email?.split('@')[0]||'My KŌMØ').trim();
  const initials=full.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'K';
  const avatar=String(p.avatar_url||p.photo_url||meta.avatar_url||meta.picture||'').trim();
  return{first,full,initials,avatar};
}
function avatarMarkup(i){return i.avatar?`<img src="${esc(i.avatar)}" alt="" loading="eager" decoding="async">`:`<span>${esc(i.initials)}</span>`}

async function pulseOverview(){
  try{return await window.KomoAI?.overview?.()||null}catch(e){console.warn('[home-v6 overview]',e);return null}
}
async function legacyMotionHistory(){
  const sb=client();if(!sb)return[];
  try{
    const session=context().session||(await sb.auth.getSession()).data?.session;
    if(!session?.user?.id)return[];
    const {data,error}=await sb.from('pulse_score_runs').select('overall_score,motion_age,status,computed_at,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(6);
    if(error)throw error;
    return Array.isArray(data)?data:[];
  }catch(e){console.warn('[home-v6 history]',e);return[]}
}
async function engagementSummary(){
  const sb=client();if(!sb)return null;
  try{const {data,error}=await sb.rpc('komo_engagement_summary');if(error)throw error;return data||null}catch(e){console.warn('[home-v6 engagement]',e);return null}
}
async function wearableDaily(){
  const sb=client();if(!sb)return{connected:false,rows:[]};
  try{
    const session=context().session||(await sb.auth.getSession()).data?.session;
    if(!session?.user?.id)return{connected:false,rows:[]};
    const from=new Date();from.setDate(from.getDate()-DAILY_DAYS);
    const [metrics,consent]=await Promise.all([
      sb.from('wearable_daily_metrics').select('metric_date,steps,sleep_minutes,resting_hr,night_worn,day_wear_mode').eq('user_id',session.user.id).gte('metric_date',dayKey(from)).order('metric_date',{ascending:true}),
      sb.from('wearable_consents').select('status,accepted_at,withdrawn_at').eq('user_id',session.user.id).eq('purpose','connected_followup').order('accepted_at',{ascending:false}).limit(1).maybeSingle()
    ]);
    if(metrics.error)throw metrics.error;
    if(consent.error)throw consent.error;
    return{connected:consent.data?.status==='active',rows:Array.isArray(metrics.data)?metrics.data:[]};
  }catch(e){console.warn('[home-v6 wearable]',e);return{connected:false,rows:[]}}
}

function currentRecord(overview){return Array.isArray(overview?.records)?overview.records[0]||null:overview?.record||null}
function motionState(overview,history=[]){
  const record=currentRecord(overview);
  const canonical=record?.score||null;
  const status=canonical?.release_status||canonical?.status||'';
  const canonicalScore=released(status)?num(canonical?.motion_score):null;
  const visibleHistory=history.filter(row=>released(row?.status)).map(row=>({score:num(row?.overall_score),date:row?.computed_at||row?.created_at||null})).filter(row=>row.score!==null);
  let score=canonicalScore;
  if(score===null&&visibleHistory[0])score=visibleHistory[0].score;
  const date=canonical?.calculated_at||visibleHistory[0]?.date||record?.motion?.updated_at||record?.motion?.created_at||null;
  const pending=Boolean(record?.motion)&&score===null;
  return{score,date,pending,hasMotion:Boolean(record?.motion)};
}

function validRows(rows,key){return rows.filter(r=>r?.metric_date&&num(r[key])!==null).sort((a,b)=>String(a.metric_date).localeCompare(String(b.metric_date)))}
function latestMetric(rows,key,{excludeToday=false}={}){
  const today=todayKey();
  const list=validRows(rows,key).filter(r=>!excludeToday||r.metric_date<today);
  return list.at(-1)||null;
}
function baselineFor(rows,key,selected,{median=false}={}){
  if(!selected)return null;
  const before=validRows(rows,key).filter(r=>r.metric_date<selected.metric_date).slice(-28).map(r=>num(r[key])).filter(v=>v!==null);
  if(before.length<3)return null;
  if(median){const s=[...before].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2}
  return before.reduce((a,b)=>a+b,0)/before.length;
}
function interpolate(value,points){
  const x=num(value);if(x===null)return null;
  if(x<=points[0][0])return points[0][1];
  for(let i=1;i<points.length;i++)if(x<=points[i][0]){const[a,sa]=points[i-1],[b,sb]=points[i],t=(x-a)/(b-a||1);return sa+(sb-sa)*t}
  return points.at(-1)[1];
}
function stepsScore(v){return interpolate(v,[[0,10],[1500,20],[2000,30],[3000,45],[4000,60],[5000,75],[6000,85],[7000,95],[9000,100],[12000,100]])}
function sleepScore(v){return interpolate(v,[[0,0],[300,30],[360,70],[390,85],[420,100],[540,100],[600,80],[660,55],[720,40]])}
function rhrScore(v,baseline){
  const x=num(v);if(x===null)return null;
  if(x<40)return70;
  if(baseline!==null){const d=x-baseline;if(d<=3)return100;if(d<=6)return85;if(d<=10)return65;return40}
  if(x<=60)return100;if(x<=70)return90;if(x<=80)return75;if(x<=90)return55;return35;
}
function dailyState(wearable){
  const rows=wearable?.rows||[];
  const stepRow=latestMetric(rows,'steps',{excludeToday:true});
  const sleepRow=latestMetric(rows,'sleep_minutes');
  const rhrRow=latestMetric(rows,'resting_hr');
  const steps=num(stepRow?.steps),sleep=num(sleepRow?.sleep_minutes),rhr=num(rhrRow?.resting_hr);
  const stepsBase=baselineFor(rows,'steps',stepRow),sleepBase=baselineFor(rows,'sleep_minutes',sleepRow),rhrBase=baselineFor(rows,'resting_hr',rhrRow,{median:true});
  const s1=stepsScore(steps),s2=sleepScore(sleep),s3=rhrScore(rhr,rhrBase);
  const readiness=[s1,s2,s3].every(v=>v!==null)?Math.round(.20*s1+.45*s2+.35*s3):null;
  return{connected:Boolean(wearable?.connected),steps,sleep,rhr,stepsBase,sleepBase,rhrBase,readiness};
}
function motionToday(motion,daily){
  if(motion.score===null||daily.readiness===null)return null;
  return Math.round(clamp(.60*motion.score+.40*daily.readiness));
}
function toneState(score,motion,daily){
  if(motion.score===null)return{tone:'setup',copy:motion.pending?'Your Motion baseline is waiting to be released.':'Create your Motion baseline',detail:'Your daily locomotor status starts after the initial Motion assessment.',route:'motion',action:motion.pending?'View results':'Start Motion'};
  if(!daily.connected||daily.readiness===null)return{tone:'setup',copy:'Connect your daily signals',detail:'Sleep, resting heart rate and daily movement are needed for Motion Today.',route:'key',action:'Open My Health'};
  if(motion.score<60)return{tone:'bad',copy:'Your plan is active',detail:'Your daily signals are updated, but your locomotor baseline still needs work.',route:'trajectory',action:'Open Plan'};
  if(motion.score<75)return{tone:'warn',copy:'Ready to progress',detail:'Your daily signals are available. Keep working on your locomotor baseline.',route:'trajectory',action:'Open Plan'};
  if(score>=75)return{tone:'good',copy:'You’re moving well',detail:'Everything is on track. Keep moving.',route:'trajectory',action:''};
  if(score>=60)return{tone:'warn',copy:'A little below your usual',detail:'One or more daily signals are below your usual range.',route:'trajectory',action:'Open Plan'};
  return{tone:'bad',copy:'Your usual pattern has changed',detail:'Your daily signals are meaningfully different from your usual range.',route:'trajectory',action:'Open Plan'};
}
function arrow(value,baseline,inverse=false){
  if(value===null||baseline===null)return'→';
  const diff=value-baseline;
  if(Math.abs(diff)<0.5)return'→';
  if(inverse)return diff<0?'↓':'↑';
  return diff>0?'↑':'↓';
}
function signalTone(kind,value,baseline){
  if(value===null)return'neutral';
  if(kind==='sleep')return value>=420&&value<=540?'good':(value>=360&&value<600?'warn':'bad');
  if(baseline===null)return'neutral';
  const d=value-baseline;
  if(kind==='steps'){const pct=baseline>0?d/baseline*100:0;return pct>=-5?'good':pct>=-20?'warn':'bad'}
  if(kind==='rhr'){if(value<40)return'warn';return d<=3?'good':d<=7?'warn':'bad'}
  return'neutral';
}
function duration(minutes){if(minutes===null)return'—';const h=Math.floor(minutes/60),m=Math.round(minutes%60);return`${h}h ${String(m).padStart(2,'0')}`}
function durationDelta(value,baseline){if(value===null||baseline===null)return'Baseline building';const d=Math.round(value-baseline);if(Math.abs(d)<5)return'≈ usual';const sign=d>0?'+':'−';return`${sign}${Math.floor(Math.abs(d)/60)?`${Math.floor(Math.abs(d)/60)}h `:''}${String(Math.abs(d)%60).padStart(2,'0')} min`}
function stepDelta(value,baseline){if(value===null||baseline===null||baseline<=0)return'Baseline building';const p=Math.round((value-baseline)/baseline*100);return`${p>0?'+':''}${p}%`}
function rhrDelta(value,baseline){if(value===null||baseline===null)return'Baseline building';const d=Math.round(value-baseline);return`${d>0?'+':d<0?'−':''}${Math.abs(d)} bpm`}
function metricMarkup({kind,label,rawValue,displayValue,unit,baseline,baselineText,delta,inverse=false}){
  const tone=signalTone(kind,rawValue,baseline),arr=arrow(rawValue,baseline,inverse);
  return `<button class="kh6-metric signal-${tone}" type="button" data-kh6-route="key" aria-label="Open ${esc(label.toLowerCase())} details">
    <span class="kh6-metric-label">${esc(label)}</span>
    <span class="kh6-metric-main"><strong>${esc(displayValue===null?'—':displayValue)}</strong>${unit?`<small>${esc(unit)}</small>`:''}<i aria-hidden="true">${arr}</i></span>
    <span class="kh6-usual">Usual ${esc(baselineText)}</span>
    <b>${esc(delta)}</b>
  </button>`;
}
function metricsMarkup(d){
  return metricMarkup({kind:'steps',label:'STEPS',rawValue:d.steps,displayValue:d.steps===null?null:fmtInt(d.steps),unit:'',baseline:d.stepsBase,baselineText:d.stepsBase===null?'—':fmtInt(d.stepsBase),delta:stepDelta(d.steps,d.stepsBase)})+
    metricMarkup({kind:'sleep',label:'SLEEP',rawValue:d.sleep,displayValue:d.sleep===null?null:duration(d.sleep),unit:'',baseline:d.sleepBase,baselineText:d.sleepBase===null?'—':duration(d.sleepBase),delta:durationDelta(d.sleep,d.sleepBase)})+
    metricMarkup({kind:'rhr',label:'RESTING HR',rawValue:d.rhr,displayValue:d.rhr===null?null:String(Math.round(d.rhr)),unit:d.rhr===null?'':'bpm',baseline:d.rhrBase,baselineText:d.rhrBase===null?'—':`${Math.round(d.rhrBase)} bpm`,delta:rhrDelta(d.rhr,d.rhrBase),inverse:true});
}
function homeMarkup(wearable,overview,history,engagement,loading=false){
  const who=identity(),motion=motionState(overview,history),daily=loading?{connected:false,steps:null,sleep:null,rhr:null,stepsBase:null,sleepBase:null,rhrBase:null,readiness:null}:dailyState(wearable);
  const today=loading?null:motionToday(motion,daily),state=toneState(today,motion,daily);
  const level=Math.max(1,Math.round(num(engagement?.level)||1)),points=Math.max(0,Math.round(num(engagement?.points)||0));
  const scoreText=today===null?'—':String(today);
  const baselineText=motion.score===null?'Motion baseline —':`Motion baseline ${Math.round(motion.score)}`;
  return `<section class="kh6 tone-${state.tone}${loading?' is-loading':''}" data-khome-v6 aria-busy="${loading?'true':'false'}">
    <header class="kh6-top">
      <button class="kh6-profile" type="button" data-kh6-route="mykomo" aria-label="Open My KŌMØ">
        <span class="kh6-avatar">${avatarMarkup(who)}</span>
        <span class="kh6-profile-copy"><strong>${esc(who.first||'My KŌMØ')}</strong><small>My KŌMØ</small></span>
      </button>
      <button class="kh6-progress" type="button" data-kh6-route="mykomo" aria-label="Open KŌMØ level and points">
        <span><small>LVL</small><strong>${level}</strong></span><i></i><span><strong>${fmtInt(points)}</strong><small>K</small></span>
      </button>
    </header>

    <main class="kh6-hero" aria-label="Motion Today">
      <strong class="kh6-score" data-kh6-score="${today===null?'':today}">${esc(scoreText)}</strong>
      <span class="kh6-title">MOTION TODAY</span>
      <p>${esc(state.copy)}</p>
    </main>

    <section class="kh6-metrics" aria-label="Daily health signals">
      ${metricsMarkup(daily)}
    </section>

    <footer class="kh6-status">
      <span><small>${esc(baselineText)}</small><strong>${esc(state.detail)}</strong></span>
      ${state.action?`<button type="button" data-kh6-route="${esc(state.route)}">${esc(state.action)} <b aria-hidden="true">→</b></button>`:'<i class="kh6-status-dot" aria-hidden="true"></i>'}
    </footer>
  </section>`;
}
function bind(root){root.querySelectorAll('[data-kh6-route]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();go(el.dataset.kh6Route)}))}
function animateScore(root){
  const node=root.querySelector('[data-kh6-score]'),target=num(node?.dataset?.kh6Score);
  if(!node||target===null||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const start=performance.now(),duration=440;
  const tick=now=>{const t=Math.min(1,(now-start)/duration),e=1-Math.pow(1-t,3);node.textContent=String(Math.round(target*e));if(t<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
}
function mount(host,markup,animate=false){
  const wrap=document.createElement('div');wrap.innerHTML=markup;const node=wrap.firstElementChild;
  host.replaceChildren(node);host.dataset.khomeOwner='patient-home-command-v1@6';bind(node);if(animate)animateScore(node);document.body.classList.add('khome-final-v1');return node;
}
function tuneChrome(){const home=route()==='home';document.body.classList.toggle('khome-final-v1',home);if(!home)return;const eyebrow=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');if(eyebrow)eyebrow.textContent='KŌMØ PULSE';if(title)title.textContent=''}
async function render(force=false){
  if(rendering||route()!=='home')return;
  const host=document.querySelector('[data-my-komo-home]');if(!host)return;
  rendering=true;
  try{
    tuneChrome();
    if(!host.querySelector('[data-khome-v6]'))mount(host,homeMarkup(null,null,[],null,true));
    const [wearable,overview,history,engagement]=await Promise.all([wearableDaily(),pulseOverview(),legacyMotionHistory(),engagementSummary()]);
    if(route()!=='home'||!host.isConnected)return;
    const markup=homeMarkup(wearable,overview,history,engagement,false);
    if(!force&&markup===lastSignature&&host.querySelector('[data-khome-v6]:not(.is-loading)'))return;
    mount(host,markup,true);lastSignature=markup;
    window.KomoAssistantV2?.refresh?.();
    window.dispatchEvent(new CustomEvent('komo:home-command-rendered',{detail:{version:VERSION}}));
  }catch(e){console.error('[patient-home-v6]',e)}finally{rendering=false}
}
function schedule(force=false,ms=0){clearTimeout(timer);timer=setTimeout(()=>render(force),ms)}
['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:wearable-data-updated'].forEach(name=>window.addEventListener(name,()=>{tuneChrome();schedule(['komo:data-ready','komo:wearable-data-updated'].includes(name),20)}));
function boot(){tuneChrome();schedule(true,0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(true,0)};

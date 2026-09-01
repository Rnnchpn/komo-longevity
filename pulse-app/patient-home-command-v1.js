import './komo-ai-client-v1.js';
import './komo-assistant-shell-v2.js';
import './patient-mobile-v1.js';

const VERSION='5.1.0';
const RELEASED=new Set(['released','published']);
const DAILY_DAYS=45;
const SIGNAL_COLORS={good:'#315b41',warn:'#9a6a2d',bad:'#9b4a3b',neutral:'#7c857f'};
let timer=0;
let rendering=false;
let lastSignature='';

const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const client=()=>window.KomoRuntime?.client||null;
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const fmt=v=>v===null||v===undefined?'—':new Intl.NumberFormat('en-US').format(Math.round(Number(v)));
const released=status=>RELEASED.has(String(status||'').toLowerCase());
const dayKey=value=>{const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))return'';const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return`${y}-${m}-${day}`};
const todayKey=()=>dayKey(new Date());

function go(target){window.KomoPatientNavigation?.go?.(target)}
function context(){return window.KomoRuntime?.getContext?.()||{}}
function identity(){
  const c=context(),p=c.profile||{},u=c.session?.user||{},meta=u.user_metadata||{};
  const first=String(p.preferred_name||p.first_name||meta.given_name||meta.first_name||'').trim().split(/\s+/)[0];
  const full=String(p.display_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||meta.full_name||u.email?.split('@')[0]||'My KŌMØ').trim();
  const initials=full.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'K';
  const avatar=String(p.avatar_url||p.photo_url||meta.avatar_url||meta.picture||'').trim();
  return{first,full,initials,avatar};
}
function avatarMarkup(i){return i.avatar?`<img src="${esc(i.avatar)}" alt="" loading="eager" decoding="async" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`:`<span>${esc(i.initials)}</span>`}
function shortDate(value){
  if(!value)return'';
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return'';
  return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'}).format(d).replace('.','');
}
function dayDistance(value){
  if(!value)return null;
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return null;
  return Math.max(0,Math.floor((Date.now()-d.getTime())/86400000));
}
function freshness(value){
  const days=dayDistance(value);
  if(days===null)return'Dernière mesure disponible';
  if(days===0)return'Mesuré aujourd’hui';
  if(days===1)return'Mesuré hier';
  if(days<14)return`Mesuré il y a ${days} jours`;
  const date=shortDate(value);
  return date?`Dernière mesure · ${date}`:'Dernière mesure disponible';
}

async function pulseOverview(){
  try{return await window.KomoAI?.overview?.()||null}catch(e){console.warn('[home-v5.1 overview]',e);return null}
}
async function walkSummary(){
  const sb=client();if(!sb)return null;
  try{const {data,error}=await sb.rpc('komo_walk_summary');if(error)throw error;return data||null}catch(e){console.warn('[home-v5.1 walk]',e);return null}
}
async function engagementSummary(){
  const sb=client();if(!sb)return null;
  try{const {data,error}=await sb.rpc('komo_engagement_summary');if(error)throw error;return data||null}catch(e){console.warn('[home-v5.1 engagement]',e);return null}
}
async function legacyMotionHistory(){
  const sb=client();if(!sb)return[];
  try{
    const session=context().session||(await sb.auth.getSession()).data?.session;
    if(!session?.user?.id)return[];
    const {data,error}=await sb.from('pulse_score_runs').select('overall_score,motion_age,status,computed_at,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(6);
    if(error)throw error;
    return Array.isArray(data)?data:[];
  }catch(e){console.warn('[home-v5.1 history]',e);return[]}
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
  }catch(e){console.warn('[home-v5.1 wearable]',e);return{connected:false,rows:[]}}
}

function currentRecord(overview){return Array.isArray(overview?.records)?overview.records[0]||null:overview?.record||null}
function motionState(overview,history=[]){
  const record=currentRecord(overview);
  const canonical=record?.score||null;
  const status=canonical?.release_status||canonical?.status||'';
  const canonicalScore=released(status)?num(canonical?.motion_score):null;
  const currentLegacy=history.find(row=>{
    const score=num(row?.overall_score);
    if(score===null)return false;
    return released(row?.status)||(canonicalScore!==null&&Math.abs(score-canonicalScore)<0.01);
  })||null;
  const visibleHistory=history.filter(row=>released(row?.status)).map(row=>({score:num(row?.overall_score),age:num(row?.motion_age),date:row?.computed_at||row?.created_at||null})).filter(row=>row.score!==null);
  let score=canonicalScore;
  if(score===null&&visibleHistory[0])score=visibleHistory[0].score;
  const age=num(canonical?.motion_age)??(currentLegacy?num(currentLegacy.motion_age):null)??visibleHistory[0]?.age??null;
  const date=canonical?.calculated_at||currentLegacy?.computed_at||currentLegacy?.created_at||visibleHistory[0]?.date||record?.motion?.updated_at||record?.motion?.created_at||null;
  let delta=null;
  if(score!==null&&visibleHistory.length>=2&&Math.abs(visibleHistory[0].score-score)<0.01)delta=Math.round((visibleHistory[0].score-visibleHistory[1].score)*10)/10;
  const pending=Boolean(record?.motion)&&score===null;
  return{score,age,date,delta,pending,hasMotion:Boolean(record?.motion),record};
}
function currentAppointment(overview){
  const record=currentRecord(overview);
  const records=Array.isArray(overview?.records)?overview.records:[];
  const fromRecords=records.map(x=>x?.next_appointment).find(Boolean);
  const ap=fromRecords||record?.next_appointment||overview?.summary?.next_appointment||null;
  if(!ap)return{exists:false,hours:null};
  const raw=ap.scheduled_start||ap.scheduled_at||ap.start_at||ap.start;
  let hours=null;
  if(raw){const d=new Date(raw);if(!Number.isNaN(d.getTime()))hours=(d.getTime()-Date.now())/36e5}
  return{exists:true,hours};
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
function todayState(score,motion,daily){
  if(motion.score===null)return{tone:'neutral',copy:motion.pending?'Motion baseline pending':'Build your Motion baseline',detail:motion.pending?'Votre première référence Motion attend sa restitution.':'Une évaluation Motion initiale est nécessaire avant de calculer votre état locomoteur quotidien.'};
  if(!daily.connected||daily.readiness===null)return{tone:'neutral',copy:'Connect your daily signals',detail:'Sleep, resting heart rate and daily movement are needed for Motion Today.'};
  if(motion.score<60)return{tone:'bad',copy:'Your plan is active',detail:'Vos signaux quotidiens sont actualisés, mais votre capacité locomotrice mesurée reste la priorité.'};
  if(motion.score<75)return{tone:'warn',copy:'Ready to progress',detail:'Vos signaux quotidiens sont disponibles. Continuez à travailler votre capacité locomotrice.'};
  if(score>=75)return{tone:'good',copy:'You’re moving well',detail:'Everything is on track. Keep moving.'};
  if(score>=60)return{tone:'warn',copy:'A little below your usual',detail:'Un ou plusieurs signaux quotidiens s’écartent de votre rythme habituel.'};
  return{tone:'bad',copy:'Your usual pattern has changed',detail:'Plusieurs signaux quotidiens sont significativement différents de votre référence habituelle.'};
}
function priorityState(motion,daily,today,state,appointment){
  if(appointment.exists&&appointment.hours!==null&&appointment.hours>=0&&appointment.hours<=72)return{eyebrow:'KOMO · PRIORITÉ',title:'Préparez votre prochaine mesure.',copy:'Votre rendez-vous approche. Gardez vos informations Pulse à jour pour faciliter la lecture de votre trajectoire.',label:'Voir mon rendez-vous',route:'agenda'};
  if(motion.score===null)return{eyebrow:'KOMO · PRIORITÉ',title:motion.pending?'Votre repère Motion arrive.':'Créez votre point de départ.',copy:state.detail,label:motion.pending?'Voir mes résultats':'Découvrir Motion',route:motion.pending?'results':'motion'};
  if(!daily.connected||daily.readiness===null)return{eyebrow:'KOMO · PRIORITÉ',title:'Reliez votre quotidien à Motion.',copy:'Connectez une source pour calculer automatiquement Sleep, Resting HR et Steps par rapport à votre propre référence.',label:'Ouvrir My Health',route:'key'};
  if(motion.score<60)return{eyebrow:'KOMO · PLAN ACTIF',title:'Agissez sur vos priorités locomotrices.',copy:'Votre état du jour est pris en compte, mais votre capacité locomotrice mesurée reste sous la zone cible.',label:'Voir mon plan',route:'trajectory'};
  if(motion.score<75)return{eyebrow:'KOMO · PLAN ACTIF',title:'Continuez à progresser.',copy:'Votre quotidien peut être bon aujourd’hui sans effacer les axes identifiés lors de votre bilan Motion.',label:'Voir mon plan',route:'trajectory'};
  if(today!==null&&today>=75)return{eyebrow:'KOMO · AUJOURD’HUI',title:'Tout est dans votre rythme.',copy:'Aucune action particulière aujourd’hui. Continuez simplement à bouger.',label:'',route:''};
  if(today!==null&&today>=60)return{eyebrow:'KOMO · AUJOURD’HUI',title:'Gardez du mouvement, allégez l’intensité.',copy:'Votre état quotidien est un peu sous votre référence. Le plan peut être adapté sans interrompre le mouvement.',label:'Voir mon plan',route:'trajectory'};
  return{eyebrow:'KOMO · AUJOURD’HUI',title:'Adaptez la journée.',copy:'Vos signaux sont plus éloignés de votre référence habituelle. Privilégiez une charge légère et surveillez la tendance.',label:'Voir mon plan',route:'trajectory'};
}
function arrow(value,baseline){
  if(value===null||baseline===null)return'→';
  const diff=value-baseline;
  if(Math.abs(diff)<0.5)return'→';
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
function durationDelta(value,baseline){if(value===null||baseline===null)return'Baseline building';const d=Math.round(value-baseline);if(Math.abs(d)<5)return'≈ usual';const sign=d>0?'+':'−',abs=Math.abs(d),h=Math.floor(abs/60),m=abs%60;return h?`${sign}${h}h ${String(m).padStart(2,'0')}`:`${sign}${m} min`}
function stepDelta(value,baseline){if(value===null||baseline===null||baseline<=0)return'Baseline building';const p=Math.round((value-baseline)/baseline*100);return`${p>0?'+':''}${p}%`}
function rhrDelta(value,baseline){if(value===null||baseline===null)return'Baseline building';const d=Math.round(value-baseline);return`${d>0?'+':d<0?'−':''}${Math.abs(d)} bpm`}
function dailySignal(kind,label,value,baseline){
  const tone=signalTone(kind,value,baseline),color=SIGNAL_COLORS[tone],arr=arrow(value,baseline);
  if(kind==='steps')return{label,value:value===null?'—':fmt(value),copy:`Usual ${baseline===null?'—':fmt(baseline)}`,meta:stepDelta(value,baseline),arrow:arr,color,route:'key'};
  if(kind==='sleep')return{label,value:value===null?'—':duration(value),copy:`Usual ${baseline===null?'—':duration(baseline)}`,meta:durationDelta(value,baseline),arrow:arr,color,route:'key'};
  return{label,value:value===null?'—':`${Math.round(value)} bpm`,copy:`Usual ${baseline===null?'—':`${Math.round(baseline)} bpm`}`,meta:rhrDelta(value,baseline),arrow:arr,color,route:'key'};
}
function signalCard(signal){
  return `<button class="kh5-signal" type="button" data-kh5-route="${esc(signal.route)}"><span>${esc(signal.label)}</span><strong>${esc(signal.value)}</strong><small>${esc(signal.copy)}</small><em style="color:${esc(signal.color)}">${esc(signal.meta)}</em><b aria-hidden="true" style="color:${esc(signal.color)}">${esc(signal.arrow)}</b></button>`;
}
function communityLine(walk){
  if(!walk?.connected)return'';
  const club=walk?.walk_club||walk?.club||{};
  const rank=num(club?.rank??club?.week_rank??club?.weekly_rank??club?.position);
  const points=num(walk?.k_points_week);
  if(rank===null&&points===null)return'';
  const parts=[];
  if(rank!==null)parts.push(`Walk Club #${fmt(rank)}`);
  if(points!==null)parts.push(`+${fmt(points)} K Points cette semaine`);
  return `<button class="kh5-community" type="button" data-kh5-route="club"><span>${esc(parts.join(' · '))}</span><b aria-hidden="true">→</b></button>`;
}

function homeMarkup(wearable,overview,history,walk,engagement,loading=false){
  const who=identity();
  const motion=motionState(overview,history);
  const daily=loading?{connected:false,steps:null,sleep:null,rhr:null,stepsBase:null,sleepBase:null,rhrBase:null,readiness:null}:dailyState(wearable);
  const today=loading?null:motionToday(motion,daily);
  const state=todayState(today,motion,daily);
  const priority=priorityState(motion,daily,today,state,currentAppointment(overview));
  const meter=today===null?0:clamp(Math.round(today));
  const scoreText=today===null?'—':String(Math.round(today));
  const capacityText=motion.score===null?'—':String(Math.round(motion.score));
  const level=num(engagement?.level),points=num(engagement?.points);
  const levelText=level===null?'—':String(Math.max(1,Math.round(level)));
  const pointsText=points===null?'—':fmt(Math.max(0,Math.round(points)));
  const stepSignal=dailySignal('steps','STEPS',daily.steps,daily.stepsBase);
  const sleepSignal=dailySignal('sleep','SLEEP',daily.sleep,daily.sleepBase);
  const rhrSignal=dailySignal('rhr','RESTING HR',daily.rhr,daily.rhrBase);
  const statusText=motion.score===null?'Motion baseline required':`${freshness(motion.date)} · Motion Capacity ${capacityText}`;
  return `<section class="kh5${loading?' is-loading':''}" data-khome-v5 aria-busy="${loading?'true':'false'}">
    <header class="kh5-head kh5-enter" style="--kh5-delay:0ms">
      <div style="display:flex;align-items:center;gap:14px;min-width:0">
        <button type="button" data-kh5-route="mykomo" aria-label="Ouvrir My KŌMØ" style="width:38px;height:38px;flex:0 0 38px;padding:0;border:1px solid rgba(23,35,27,.11);border-radius:50%;overflow:hidden;background:#f8f6f1;color:#315b41;font-size:11px;font-weight:700;cursor:pointer">${avatarMarkup(who)}</button>
        <div><span class="kh5-kicker">AUJOURD’HUI</span><h2>Bonjour${who.first?` ${esc(who.first)}`:''}.</h2><p>Voici ce qui compte pour votre mobilité maintenant.</p></div>
      </div>
      <button class="kh5-wordmark" type="button" data-kh5-route="mykomo" aria-label="Ouvrir mon niveau et mes K Points" style="border:0;background:transparent;cursor:pointer"><strong>LVL ${esc(levelText)}</strong><small>${esc(pointsText)} K</small></button>
    </header>

    <section class="kh5-hero kh5-enter" style="--kh5-delay:55ms" aria-label="Motion Today">
      <div class="kh5-motion">
        <span class="kh5-label">MOTION TODAY</span>
        <div class="kh5-scoreline">
          <div class="kh5-score"><strong data-kh5-score="${today===null?'':Math.round(today)}">${esc(scoreText)}</strong><small>MOTION<br>TODAY</small></div>
          <div class="kh5-age"><span>MOTION CAPACITY</span><strong>${esc(capacityText)}</strong></div>
        </div>
        <div class="kh5-meter" aria-hidden="true"><i style="--kh5-meter:${meter}%"></i></div>
        <p class="kh5-interpretation"><strong style="display:block;color:#26382c;font-weight:650;margin-bottom:3px">${esc(state.copy)}</strong>${esc(state.detail)}</p>
        <button class="kh5-detail-link" type="button" data-kh5-route="results"><span>${esc(statusText)}</span><b>Voir mes résultats →</b></button>
      </div>
      <aside class="kh5-komo">
        <span>${esc(priority.eyebrow)}</span>
        <h3>${esc(priority.title)}</h3>
        <p>${esc(priority.copy)}</p>
        ${priority.label?`<button type="button" data-kh5-route="${esc(priority.route)}">${esc(priority.label)} <b aria-hidden="true">→</b></button>`:''}
      </aside>
    </section>

    <section class="kh5-signals kh5-enter" style="--kh5-delay:110ms" aria-label="Daily health signals">
      ${signalCard(stepSignal)}
      ${signalCard(sleepSignal)}
      ${signalCard(rhrSignal)}
    </section>

    <footer class="kh5-foot kh5-enter" style="--kh5-delay:165ms">
      <p><strong>Measure → Understand → Act.</strong><span>Motion mesure. Pulse organise. Komo agit seulement quand c’est utile.</span></p>
      ${communityLine(walk)}
    </footer>
  </section>`;
}
function bind(root){
  root.querySelectorAll('[data-kh5-route]').forEach(button=>button.addEventListener('click',()=>go(button.dataset.kh5Route)));
}
function animateScore(root){
  const node=root.querySelector('[data-kh5-score]');
  const target=num(node?.dataset?.kh5Score);
  if(!node||target===null)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){node.textContent=String(Math.round(target));return}
  const start=performance.now(),duration=620;
  const tick=now=>{
    const t=Math.min(1,(now-start)/duration);
    const eased=1-Math.pow(1-t,3);
    node.textContent=String(Math.round(target*eased));
    if(t<1)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function mount(host,markup,animate=false){
  const wrap=document.createElement('div');wrap.innerHTML=markup;
  const node=wrap.firstElementChild;
  host.replaceChildren(node);
  host.dataset.khomeOwner='patient-home-command-v1@5.1';
  bind(node);
  if(animate)animateScore(node);
  document.body.classList.add('khome-final-v1');
  return node;
}
function tuneChrome(){
  const home=route()==='home';
  document.body.classList.toggle('khome-final-v1',home);
  if(!home)return;
  const eyebrow=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');
  if(eyebrow)eyebrow.textContent='KŌMØ PULSE';
  if(title)title.textContent='';
}
async function render(force=false){
  if(rendering||route()!=='home')return;
  const host=document.querySelector('[data-my-komo-home]');
  if(!host)return;
  rendering=true;
  try{
    tuneChrome();
    if(!host.querySelector('[data-khome-v5]'))mount(host,homeMarkup(null,null,[],null,null,true));
    const [wearable,overview,history,walk,engagement]=await Promise.all([wearableDaily(),pulseOverview(),legacyMotionHistory(),walkSummary(),engagementSummary()]);
    if(route()!=='home'||!host.isConnected)return;
    const markup=homeMarkup(wearable,overview,history,walk,engagement,false);
    if(!force&&markup===lastSignature&&host.querySelector('[data-khome-v5]:not(.is-loading)'))return;
    mount(host,markup,true);
    lastSignature=markup;
    window.KomoAssistantV2?.refresh?.();
    window.dispatchEvent(new CustomEvent('komo:home-command-rendered',{detail:{version:VERSION}}));
  }catch(e){console.error('[patient-home-v5.1]',e)}finally{rendering=false}
}
function schedule(force=false,ms=0){clearTimeout(timer);timer=setTimeout(()=>render(force),ms)}
['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:wearable-data-updated'].forEach(name=>window.addEventListener(name,()=>{tuneChrome();schedule(['komo:data-ready','komo:wearable-data-updated'].includes(name),20)}));
function boot(){tuneChrome();schedule(true,0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(true,0)};
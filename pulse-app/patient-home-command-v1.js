import './komo-ai-client-v1.js';
import './komo-assistant-shell-v2.js';
import './patient-mobile-v1.js';

const VERSION='5.0.0';
const RELEASED=new Set(['released','published']);
let timer=0;
let rendering=false;
let lastSignature='';

const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const fmt=v=>v===null||v===undefined?'—':new Intl.NumberFormat('fr-FR').format(Math.round(Number(v)));
const pick=(obj,keys=[])=>{for(const key of keys){const value=obj?.[key];if(value!==undefined&&value!==null&&value!=='')return value}return null};
const released=status=>RELEASED.has(String(status||'').toLowerCase());

function go(target){window.KomoPatientNavigation?.go?.(target)}
function firstName(){
  const c=window.KomoRuntime?.getContext?.()||{};
  const p=c.profile||{};
  const direct=p.preferred_name||p.first_name||'';
  if(direct)return String(direct).trim().split(/\s+/)[0];
  const account=document.querySelector('#accountName')?.textContent?.trim()||'';
  return account&&account!=='Compte KŌMØ'?account.split(/\s+/)[0]:'';
}
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
  try{return await window.KomoAI?.overview?.()||null}catch(e){console.warn('[home-v5 overview]',e);return null}
}
async function walkSummary(){
  const sb=window.KomoRuntime?.client;if(!sb)return null;
  try{const {data,error}=await sb.rpc('komo_walk_summary');if(error)throw error;return data||null}catch(e){console.warn('[home-v5 walk]',e);return null}
}
async function legacyMotionHistory(){
  const sb=window.KomoRuntime?.client;if(!sb)return[];
  try{
    const {data:{session}}=await sb.auth.getSession();
    if(!session?.user?.id)return[];
    const {data,error}=await sb.from('pulse_score_runs').select('overall_score,motion_age,status,computed_at,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(6);
    if(error)throw error;
    return Array.isArray(data)?data:[];
  }catch(e){console.warn('[home-v5 history]',e);return[]}
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
  const visibleHistory=history.filter(row=>released(row?.status)).map(row=>({
    score:num(row?.overall_score),
    age:num(row?.motion_age),
    date:row?.computed_at||row?.created_at||null
  })).filter(row=>row.score!==null);
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
  if(!ap)return{exists:false,date:'Aucun rendez-vous prévu',time:'',title:'Votre prochaine mesure apparaîtra ici.',location:'',route:'agenda',hours:null};
  const raw=ap.scheduled_start||ap.scheduled_at||ap.start_at||ap.start;
  let date='Prochaine consultation',time='',hours=null;
  if(raw){
    const d=new Date(raw);
    if(!Number.isNaN(d.getTime())){
      date=new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short'}).format(d).replace('.','');
      time=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(d);
      hours=(d.getTime()-Date.now())/36e5;
    }
  }
  const title=ap.appointment_type||ap.title||ap.type||'Consultation KŌMØ';
  const location=ap.center_name||ap.location_name||ap.center?.name||ap.location||ap.address||'';
  return{exists:true,date,time,title,location,route:'agenda',hours};
}
function coverageValue(walk){
  let value=num(pick(walk,['coverage_7d','coverage_pct','coverage','data_coverage','key_coverage']));
  if(value!==null&&value<=1)value*=100;
  return value===null?null:Math.max(0,Math.min(100,Math.round(value)));
}
function dailyDelta(walk){
  const steps=num(walk?.steps_today);
  const average=num(pick(walk,['steps_avg_7d','average_steps_7d','baseline_steps_7d','avg_steps_7d']));
  if(steps===null||average===null||average<=0)return null;
  return Math.round(((steps-average)/average)*100);
}
function keySignal(walk,loading=false){
  if(loading)return{value:'Synchronisation',copy:'Votre rythme quotidien arrive…',meta:'KEY',route:'key'};
  if(!walk?.connected)return{value:'Activer KEY',copy:'Reliez votre quotidien à votre trajectoire.',meta:'Continuité quotidienne',route:'key'};
  const steps=num(walk.steps_today);
  const active=num(walk.active_minutes_today??walk.active_minutes);
  const coverage=coverageValue(walk);
  const delta=dailyDelta(walk);
  if(delta!==null&&delta>=15)return{value:`+${Math.abs(delta)}% aujourd’hui`,copy:'Au-dessus de votre rythme récent.',meta:steps===null?'KEY':`${fmt(steps)} pas`,route:'key'};
  if(delta!==null&&delta<=-15)return{value:`${Math.abs(delta)}% sous votre rythme`,copy:'Une journée plus calme pour le moment.',meta:steps===null?'KEY':`${fmt(steps)} pas`,route:'key'};
  if(steps!==null)return{value:`${fmt(steps)} pas`,copy:delta===null?'Votre activité du jour.':'Dans votre rythme récent.',meta:active===null?(coverage===null?'KEY':`${coverage}% de couverture`):`${fmt(active)} min actives`,route:'key'};
  if(coverage!==null)return{value:`${coverage}% couvert`,copy:'KEY construit votre référence quotidienne.',meta:'7 derniers jours',route:'key'};
  return{value:'KEY connecté',copy:'Votre quotidien complète la mesure Motion.',meta:'Continuité active',route:'key'};
}
function motionInterpretation(motion){
  if(motion.score===null){
    if(motion.pending)return'Votre mesure Motion existe et attend sa restitution. Pulse affichera ici votre repère dès qu’il sera publié.';
    return'Votre première mesure Motion créera la référence à partir de laquelle votre trajectoire pourra être suivie.';
  }
  if(motion.delta===null)return'Votre dernier repère locomoteur est disponible. Sa valeur devient surtout utile lorsqu’elle est suivie dans le temps.';
  if(motion.delta>0)return`Votre Motion Score a progressé de ${String(motion.delta).replace('.',',')} point${motion.delta>1?'s':''} depuis la mesure précédente.`;
  if(motion.delta<0)return`Votre Motion Score a varié de ${String(motion.delta).replace('.',',')} point${Math.abs(motion.delta)>1?'s':''} depuis la mesure précédente. La trajectoire compte davantage qu’une mesure isolée.`;
  return'Votre Motion Score est stable par rapport à la mesure précédente. La continuité permettra de confirmer cette tendance.';
}
function priorityState(walk,motion,appointment){
  if(appointment.exists&&appointment.hours!==null&&appointment.hours>=0&&appointment.hours<=72)return{eyebrow:'KOMO · PRIORITÉ',title:'Préparez votre prochaine mesure.',copy:'Votre rendez-vous approche. Gardez vos informations Pulse à jour pour faciliter la lecture de votre trajectoire.',label:'Voir mon rendez-vous',route:'agenda'};
  if(!motion.hasMotion&&!motion.pending&&motion.score===null)return{eyebrow:'KOMO · PRIORITÉ',title:'Créez votre point de départ.',copy:'Une première mesure Motion transforme votre mobilité actuelle en repère que Pulse pourra suivre dans le temps.',label:'Découvrir Motion',route:'motion'};
  if(!walk?.connected)return{eyebrow:'KOMO · PRIORITÉ',title:'Reliez votre quotidien à vos mesures.',copy:'Activez KEY pour replacer vos journées entre deux évaluations Motion et rendre la continuité plus lisible.',label:'Activer KEY',route:'key'};
  const delta=dailyDelta(walk);
  if(delta!==null&&delta<=-15)return{eyebrow:'KOMO · AUJOURD’HUI',title:'Remettez un peu de mouvement dans la journée.',copy:'Votre activité est sous votre rythme récent pour le moment. Une marche active suffit à recréer de la continuité.',label:'Voir ma journée',route:'key'};
  if(delta!==null&&delta>=15)return{eyebrow:'KOMO · AUJOURD’HUI',title:'Conservez ce rythme.',copy:'Votre activité est au-dessus de votre moyenne récente. L’objectif est la régularité, pas la surenchère.',label:'Voir KEY',route:'key'};
  return{eyebrow:'KOMO · PRIORITÉ',title:'Protégez la continuité.',copy:'Vos données du jour sont cohérentes avec votre rythme récent. Continuez à mesurer, comprendre et agir sans multiplier les objectifs.',label:'Voir ma trajectoire',route:'trajectory'};
}
function trajectorySignal(motion){
  if(motion.score===null)return{value:'À construire',copy:'Votre trajectoire commencera avec une mesure publiée.',meta:'Trajectoire',route:'trajectory'};
  if(motion.delta===null)return{value:'1 repère actif',copy:'Une nouvelle mesure rendra l’évolution comparable.',meta:freshness(motion.date),route:'trajectory'};
  const sign=motion.delta>0?'+':'';
  return{value:`${sign}${String(motion.delta).replace('.',',')} pt`,copy:motion.delta===0?'Stable depuis la mesure précédente.':'Depuis la mesure précédente.',meta:freshness(motion.date),route:'trajectory'};
}
function appointmentSignal(appointment){
  if(!appointment.exists)return{value:'Prochaine étape',copy:'Planifiez votre prochaine mesure quand elle devient utile.',meta:'Agenda KŌMØ',route:'agenda'};
  const when=appointment.time?`${appointment.date} · ${appointment.time}`:appointment.date;
  return{value:when,copy:appointment.title,meta:appointment.location||'Agenda KŌMØ',route:'agenda'};
}
function communityLine(walk){
  if(!walk?.connected)return'';
  const club=walk?.walk_club||walk?.club||{};
  const rank=num(pick(club,['rank','week_rank','weekly_rank','position']));
  const points=num(walk?.k_points_week);
  if(rank===null&&points===null)return'';
  const parts=[];
  if(rank!==null)parts.push(`Walk Club #${fmt(rank)}`);
  if(points!==null)parts.push(`+${fmt(points)} K Points cette semaine`);
  return `<button class="kh5-community" type="button" data-kh5-route="club"><span>${esc(parts.join(' · '))}</span><b aria-hidden="true">→</b></button>`;
}
function signalCard(label,signal,extraClass=''){
  return `<button class="kh5-signal ${extraClass}" type="button" data-kh5-route="${esc(signal.route)}"><span>${esc(label)}</span><strong>${esc(signal.value)}</strong><small>${esc(signal.copy)}</small><em>${esc(signal.meta)}</em><b aria-hidden="true">→</b></button>`;
}
function homeMarkup(walk,overview,history,loading=false){
  const name=firstName();
  const motion=motionState(overview,history);
  const appointment=currentAppointment(overview);
  const priority=priorityState(walk,motion,appointment);
  const key=keySignal(walk,loading);
  const trajectory=trajectorySignal(motion);
  const next=appointmentSignal(appointment);
  const score=loading?null:motion.score;
  const age=loading?null:motion.age;
  const scoreText=score===null?'—':String(Math.round(score));
  const ageText=age===null?'—':`${Math.round(age)} ans`;
  const statusText=loading?'Synchronisation…':freshness(motion.date);
  const interpretation=loading?'Pulse rassemble vos dernières données utiles…':motionInterpretation(motion);
  const meter=score===null?0:Math.max(0,Math.min(100,Math.round(score)));
  return `<section class="kh5${loading?' is-loading':''}" data-khome-v5 aria-busy="${loading?'true':'false'}">
    <header class="kh5-head kh5-enter" style="--kh5-delay:0ms">
      <div><span class="kh5-kicker">AUJOURD’HUI</span><h2>Bonjour${name?` ${esc(name)}`:''}.</h2><p>Voici ce qui compte pour votre mobilité maintenant.</p></div>
      <div class="kh5-wordmark" aria-label="KŌMØ Pulse"><strong>KŌMØ</strong><small>PULSE</small></div>
    </header>

    <section class="kh5-hero kh5-enter" style="--kh5-delay:55ms" aria-label="Votre mouvement aujourd’hui">
      <div class="kh5-motion">
        <span class="kh5-label">VOTRE MOUVEMENT AUJOURD’HUI</span>
        <div class="kh5-scoreline">
          <div class="kh5-score"><strong data-kh5-score="${score===null?'':Math.round(score)}">${esc(scoreText)}</strong><small>/100<br>MOTION SCORE</small></div>
          <div class="kh5-age"><span>MOTION AGE</span><strong>${esc(ageText)}</strong></div>
        </div>
        <div class="kh5-meter" aria-hidden="true"><i style="--kh5-meter:${meter}%"></i></div>
        <p class="kh5-interpretation">${esc(interpretation)}</p>
        <button class="kh5-detail-link" type="button" data-kh5-route="results"><span>${esc(statusText)}</span><b>Voir mes résultats →</b></button>
      </div>
      <aside class="kh5-komo">
        <span>${esc(priority.eyebrow)}</span>
        <h3>${esc(priority.title)}</h3>
        <p>${esc(priority.copy)}</p>
        <button type="button" data-kh5-route="${esc(priority.route)}">${esc(priority.label)} <b aria-hidden="true">→</b></button>
      </aside>
    </section>

    <section class="kh5-signals kh5-enter" style="--kh5-delay:110ms" aria-label="À surveiller">
      ${signalCard('KEY · QUOTIDIEN',key,'kh5-signal-key')}
      ${signalCard('TRAJECTOIRE',trajectory,'kh5-signal-trajectory')}
      ${signalCard('PROCHAINE ÉTAPE',next,'kh5-signal-next')}
    </section>

    <footer class="kh5-foot kh5-enter" style="--kh5-delay:165ms">
      <p><strong>Measure → Understand → Act.</strong><span>Pulse organise votre trajectoire. KŌMØ l’interprète quand cela est nécessaire.</span></p>
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
  host.dataset.khomeOwner='patient-home-command-v1@5';
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
    if(!host.querySelector('[data-khome-v5]'))mount(host,homeMarkup(null,null,[],true));
    const [walk,overview,history]=await Promise.all([walkSummary(),pulseOverview(),legacyMotionHistory()]);
    if(route()!=='home'||!host.isConnected)return;
    const markup=homeMarkup(walk,overview,history,false);
    if(!force&&markup===lastSignature&&host.querySelector('[data-khome-v5]:not(.is-loading)'))return;
    mount(host,markup,true);
    lastSignature=markup;
    window.KomoAssistantV2?.refresh?.();
    window.dispatchEvent(new CustomEvent('komo:home-command-rendered',{detail:{version:VERSION}}));
  }catch(e){console.error('[patient-home-v5]',e)}finally{rendering=false}
}
function schedule(force=false,ms=0){clearTimeout(timer);timer=setTimeout(()=>render(force),ms)}
['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:wearable-data-updated'].forEach(name=>window.addEventListener(name,()=>{tuneChrome();schedule(['komo:data-ready','komo:wearable-data-updated'].includes(name),20)}));
function boot(){tuneChrome();schedule(true,0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(true,0)};
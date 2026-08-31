import './komo-ai-client-v1.js';
import './komo-assistant-shell-v2.js';
import './patient-mobile-v1.js';

const VERSION='4.0.0';
const WALK_CLUB_LABEL='KŌMØ WALK CLUB';
let timer=0;
let rendering=false;
let lastSignature='';

const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const fmt=v=>v===null||v===undefined?'—':new Intl.NumberFormat('fr-FR').format(Math.round(Number(v)));
const pick=(obj,keys=[])=>{for(const key of keys){const value=obj?.[key];if(value!==undefined&&value!==null&&value!=='')return value}return null};

function go(target){window.KomoPatientNavigation?.go?.(target)}
function firstName(){
  const c=window.KomoRuntime?.getContext?.()||{};
  const p=c.profile||{};
  const direct=p.preferred_name||p.first_name||'';
  if(direct)return String(direct).trim().split(/\s+/)[0];
  const account=document.querySelector('#accountName')?.textContent?.trim()||'';
  return account&&account!=='Compte KŌMØ'?account.split(/\s+/)[0]:'';
}
async function pulseOverview(){
  try{return await window.KomoAI?.overview?.()||null}catch(e){console.warn('[home-v4 overview]',e);return null}
}
async function walkSummary(){
  const sb=window.KomoRuntime?.client;if(!sb)return null;
  try{const {data,error}=await sb.rpc('komo_walk_summary');if(error)throw error;return data||null}catch(e){console.warn('[home-v4 walk]',e);return null}
}
function currentAppointment(overview){
  const records=Array.isArray(overview?.records)?overview.records:[];
  const fromRecords=records.map(x=>x?.next_appointment).find(Boolean);
  const fromList=Array.isArray(overview?.appointments)?overview.appointments.find(Boolean):null;
  const ap=fromRecords||overview?.record?.next_appointment||overview?.summary?.next_appointment||fromList||null;
  if(!ap)return{exists:false,date:'Aucun rendez-vous',time:'',title:'Rien de planifié pour le moment',location:'',route:'documents'};
  const raw=ap.scheduled_start||ap.scheduled_at||ap.start_at||ap.start;
  let date='Prochaine consultation',time='';
  if(raw){
    const d=new Date(raw);
    if(!Number.isNaN(d.getTime())){
      date=new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short'}).format(d);
      time=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(d);
    }
  }
  const title=ap.appointment_type||ap.title||ap.type||'Consultation KŌMØ';
  const location=ap.center_name||ap.location_name||ap.center?.name||ap.location||ap.address||'';
  return{exists:true,date,time,title,location,route:'documents'};
}
function coverageValue(walk){
  let value=num(pick(walk,['coverage_7d','coverage_pct','coverage','data_coverage','key_coverage']));
  if(value!==null&&value<=1)value*=100;
  return value===null?null:Math.max(0,Math.min(100,Math.round(value)));
}
function keyInsight(walk,loading=false){
  if(loading)return{title:'KEY se synchronise',copy:'Lecture de votre rythme quotidien…',meta:'',route:'key'};
  if(!walk?.connected)return{title:'Activez KEY',copy:'Reliez votre activité quotidienne à votre parcours KŌMØ.',meta:'Continuité non active',route:'key'};
  const steps=num(walk.steps_today);
  const average=num(pick(walk,['steps_avg_7d','average_steps_7d','baseline_steps_7d','avg_steps_7d']));
  const coverage=coverageValue(walk);
  const active=num(walk.active_minutes_today??walk.active_minutes);
  const sleep=num(pick(walk,['sleep_hours','sleep_hours_last','sleep_duration_hours']));
  if(average!==null&&steps!==null&&average>0){
    const delta=Math.round(((steps-average)/average)*100);
    const abs=Math.abs(delta);
    if(delta>=15)return{title:'Vous bougez plus que d’habitude',copy:`+${abs}% par rapport à votre moyenne des 7 derniers jours.`,meta:coverage!==null?`${coverage}% de couverture KEY`:'Tendance du jour',route:'key'};
    if(delta<=-15)return{title:'Journée plus calme que votre rythme',copy:`${abs}% sous votre moyenne récente pour le moment.`,meta:coverage!==null?`${coverage}% de couverture KEY`:'Tendance du jour',route:'key'};
    return{title:'Votre activité est dans votre rythme',copy:'Votre journée reste proche de votre moyenne récente.',meta:coverage!==null?`${coverage}% de couverture KEY`:'Tendance du jour',route:'key'};
  }
  if(coverage!==null&&coverage<50)return{title:'KEY apprend encore votre rythme',copy:'Continuez à porter votre dispositif pour rendre les tendances plus fiables.',meta:`${coverage}% de couverture sur la période`,route:'key'};
  if(active!==null)return{title:`${fmt(active)} min actives aujourd’hui`,copy:'KEY replace votre activité du jour dans votre continuité.',meta:coverage!==null?`${coverage}% de couverture KEY`:'Donnée quotidienne vérifiée',route:'key'};
  if(sleep!==null)return{title:`${sleep.toFixed(1).replace('.',',')} h de sommeil`,copy:'Votre récupération complète progressivement votre lecture quotidienne.',meta:coverage!==null?`${coverage}% de couverture KEY`:'Dernière nuit disponible',route:'key'};
  return{title:'Votre quotidien devient lisible',copy:'KEY construit votre continuité à partir des données disponibles.',meta:coverage!==null?`${coverage}% de couverture KEY`:'Données en cours de consolidation',route:'key'};
}
function clubState(walk,loading=false){
  const club=walk?.walk_club||walk?.club||{};
  if(loading)return{rank:'…',label:WALK_CLUB_LABEL,copy:'Classement en cours de synchronisation',points:'',joined:false,route:'club'};
  const joined=Boolean(club.joined??club.is_member??club.member??club.rank);
  const rank=num(pick(club,['rank','week_rank','weekly_rank','position']));
  const members=num(pick(club,['total_members','member_count','members']));
  const weekSteps=num(pick(club,['weekly_steps','steps_week','week_steps']))??num(pick(walk,['steps_week','weekly_steps','steps_7d']));
  const gap=num(pick(club,['gap_to_next_steps','steps_to_next','gap_to_next','next_rank_gap']));
  const points=num(walk?.k_points_week);
  if(!walk?.connected)return{rank:'—',label:WALK_CLUB_LABEL,copy:'Connectez KEY pour participer au classement.',points:'',joined:false,route:'club'};
  if(!joined)return{rank:'Rejoindre',label:WALK_CLUB_LABEL,copy:'Votre activité peut alimenter le classement hebdomadaire.',points:points===null?'':`+${fmt(points)} K Points cette semaine`,joined:false,route:'club'};
  let copy=weekSteps!==null?`${fmt(weekSteps)} pas cette semaine`:'Classement hebdomadaire actif';
  if(gap!==null&&rank!==null&&rank>1)copy=`${fmt(gap)} pas de la place #${rank-1}`;
  if(members!==null&&rank!==null)copy+=` · ${fmt(members)} membres`;
  return{rank:rank===null?'—':`#${rank}`,label:WALK_CLUB_LABEL,copy,points:points===null?'':`+${fmt(points)} K Points cette semaine`,joined:true,route:'club'};
}
function homeMarkup(walk,overview,loading=false){
  const name=firstName();
  const steps=!loading&&walk?.connected?num(walk.steps_today):null;
  const activeMinutes=!loading&&walk?.connected?num(walk.active_minutes_today??walk.active_minutes):null;
  const goal=Math.max(1,num(walk?.daily_goal)||8000);
  const pct=steps===null?0:Math.max(0,Math.min(100,Math.round((steps/goal)*100)));
  const kp=!loading&&walk?.connected?num(walk.k_points_today):null;
  const key=keyInsight(walk,loading);
  const club=clubState(walk,loading);
  const appt=currentAppointment(overview);
  const movementCopy=loading?'Synchronisation de votre journée…':walk?.connected?`${pct}% de votre repère du jour`:'Connectez KEY pour afficher votre activité quotidienne.';
  const movementMeta=activeMinutes===null?'pas aujourd’hui':`pas · ${fmt(activeMinutes)} min actives`;
  const pointBadge=kp===null?'':`<span class="kh3-points-badge">+${fmt(kp)} K aujourd’hui</span>`;
  const appointmentWhen=appt.time?`${appt.date} · ${appt.time}`:appt.date;
  return `<section class="kh3${loading?' is-loading':''}" data-khome-datawall data-khome-v3 aria-busy="${loading?'true':'false'}">
    <div class="kh3-brand-rail" aria-hidden="true"><strong>KŌMØ</strong><small>PULSE</small></div>
    <header class="kh3-head"><div class="kh3-brand"><span class="kh3-brand-dot" aria-hidden="true"></span><strong>KŌMØ PULSE</strong><small>LONGEVITY IN MOTION</small></div><span>AUJOURD’HUI</span><h2>Bonjour${name?` ${esc(name)}`:''}.</h2><p>Votre mouvement, votre rythme, votre communauté.</p></header>

    <section class="kh3-movement" aria-label="Votre journée en mouvement">
      <div class="kh3-movement-top"><div><span>VOTRE JOURNÉE EN MOUVEMENT</span><h3>${steps===null?'—':fmt(steps)}</h3><small>${esc(movementMeta)}</small></div><div class="kh3-movement-side">${pointBadge}<button type="button" data-kh3-route="key">Voir KEY <b>→</b></button></div></div>
      <div class="kh3-progress"><i style="width:${pct}%"></i></div>
      <p>${esc(movementCopy)}</p>
    </section>

    <section class="kh3-strip" aria-label="Votre quotidien et votre club">
      <button class="kh3-score-card" type="button" data-kh3-route="${key.route}"><span>KEY · VOTRE QUOTIDIEN</span><strong>${esc(key.title)}</strong><small>${esc(key.copy)}</small><em>${esc(key.meta)}</em></button>
      <button class="kh3-points-card" type="button" data-kh3-route="${club.route}"><span>${esc(club.label)}</span><strong>${esc(club.rank)}</strong><small>${esc(club.copy)}</small>${club.points?`<em>${esc(club.points)}</em>`:''}</button>
    </section>

    <section class="kh3-next"><div><span>PROCHAINE CONSULTATION</span><h3>${esc(appointmentWhen)}</h3><p>${esc(appt.title)}${appt.location?` · ${esc(appt.location)}`:''}</p></div><button type="button" data-kh3-route="${appt.route}">${appt.exists?'Préparer':'Rendez-vous'} <b>→</b></button></section>
  </section>`;
}
function bind(root){
  root.querySelectorAll('[data-kh3-route]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.kh3Route)));
}
function mount(host,markup){
  const wrap=document.createElement('div');wrap.innerHTML=markup;
  const node=wrap.firstElementChild;
  host.replaceChildren(node);
  host.dataset.khomeOwner='v4';
  bind(node);
  document.body.classList.add('khome-final-v1','kpulse-home-mode');
  return node;
}
function tuneChrome(){
  const home=route()==='home';
  document.body.classList.toggle('khome-final-v1',home);
  document.body.classList.toggle('kpulse-home-mode',home);
  if(!home)return;
  const ey=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');
  if(ey)ey.textContent='KŌMØ PULSE';
  if(title)title.textContent='';
}
async function render(force=false){
  if(rendering||route()!=='home')return;
  const host=document.querySelector('[data-my-komo-home]');
  if(!host)return;
  rendering=true;
  try{
    tuneChrome();
    if(!host.querySelector('[data-khome-v3]'))mount(host,homeMarkup(null,null,true));
    const [walk,overview]=await Promise.all([walkSummary(),pulseOverview()]);
    const markup=homeMarkup(walk,overview,false);
    if(!force&&markup===lastSignature&&host.querySelector('[data-khome-v3]:not(.is-loading)'))return;
    mount(host,markup);lastSignature=markup;
    window.KomoAssistantV2?.refresh?.();
    window.dispatchEvent(new CustomEvent('komo:home-command-rendered'));
  }catch(e){console.error('[patient-home-v4]',e)}finally{rendering=false}
}
function schedule(force=false,ms=50){clearTimeout(timer);timer=setTimeout(()=>render(force),ms)}
['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:wearable-data-updated','komo:session-ready'].forEach(name=>window.addEventListener(name,()=>{tuneChrome();schedule(['komo:data-ready','komo:wearable-data-updated'].includes(name),30)}));
function boot(){
  tuneChrome();
  schedule(true,0);
  [80,260,800,1800].forEach(ms=>setTimeout(()=>render(true),ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(true,10)};

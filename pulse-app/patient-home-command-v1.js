import './komo-ai-client-v1.js';
import './komo-assistant-shell-v2.js';
import './patient-mobile-v1.js';
import { loadCanonicalResult } from './canonical-result-runtime.js';

const VERSION='3.3.0';
const WALK_CLUB_LABEL='WALK CLUB';
let timer=0;
let rendering=false;
let lastSignature='';

const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const fmt=v=>v===null||v===undefined?'—':new Intl.NumberFormat('fr-FR').format(Math.round(Number(v)));
const released=r=>['released','published'].includes(String(r?.score?.release_status||'').toLowerCase());

function go(target){window.KomoPatientNavigation?.go?.(target)}
function firstName(){
  const c=window.KomoRuntime?.getContext?.()||{};
  const p=c.profile||{};
  const direct=p.preferred_name||p.first_name||'';
  if(direct)return String(direct).trim().split(/\s+/)[0];
  const account=document.querySelector('#accountName')?.textContent?.trim()||'';
  return account&&account!=='Compte KŌMØ'?account.split(/\s+/)[0]:'';
}
function currentAppointment(){
  const box=document.querySelector('.mykomo-next');
  const title=box?.querySelector('strong')?.textContent?.trim()||'';
  const meta=box?.querySelector('small')?.textContent?.trim()||'';
  return title?{exists:true,title,meta}:{exists:false,title:'Aucun rendez-vous planifié',meta:''};
}
async function walkSummary(){
  const sb=window.KomoRuntime?.client;if(!sb)return null;
  try{const {data,error}=await sb.rpc('komo_walk_summary');if(error)throw error;return data||null}catch(e){console.warn('[home-v3 walk]',e);return null}
}
function motionState(result,loading=false){
  if(loading)return{value:'…',label:'Motion Score',copy:'Synchronisation',route:'results'};
  if(released(result)&&num(result?.score?.motion_score)!==null)return{value:Math.round(Number(result.score.motion_score)),label:'Motion Score',copy:'Référence actuelle',route:'results'};
  const has=num(result?.score?.motion_score)!==null;
  return{value:has?'…':'—',label:'Motion Score',copy:has?'En validation':'À établir',route:'results'};
}
function nextAction(result,walk,appt,loading=false){
  if(loading)return{title:'Préparation de votre espace',copy:'Pulse synchronise les informations utiles.',label:'Voir mon bilan',route:'results'};
  if(!released(result))return{title:'Finaliser votre référence Motion',copy:'Votre résultat apparaîtra ici après validation pour restitution.',label:'Voir mon bilan',route:'results'};
  if(!walk?.connected)return{title:'Activer votre continuité KEY',copy:'Reliez votre bilan à votre activité quotidienne.',label:'Ouvrir KEY',route:'key'};
  if(appt.exists)return{title:'Préparer votre prochaine étape',copy:appt.meta||appt.title,label:'Voir mon rendez-vous',route:'documents'};
  return{title:'Continuer votre progression',copy:'Komo peut vous aider à choisir la prochaine action utile.',label:'Demander à Komo',route:'komo'};
}
function homeMarkup(result,walk,loading=false){
  const name=firstName();
  const motion=motionState(result,loading);
  const steps=!loading&&walk?.connected?num(walk.steps_today):null;
  const activeMinutes=!loading&&walk?.connected?num(walk.active_minutes_today??walk.active_minutes):null;
  const goal=Math.max(1,num(walk?.daily_goal)||8000);
  const pct=steps===null?0:Math.max(0,Math.min(100,Math.round((steps/goal)*100)));
  const kp=!loading&&walk?.connected?num(walk.k_points_today):null;
  const kpWeek=!loading&&walk?.connected?num(walk.k_points_week):null;
  const club=walk?.walk_club||{};
  const rank=!loading&&club.joined&&club.rank?`#${club.rank}`:'';
  const clubCopy=rank?`${rank} ${WALK_CLUB_LABEL}`:club.joined?WALK_CLUB_LABEL:'cette semaine';
  const action=nextAction(result,walk,currentAppointment(),loading);
  const movementCopy=loading?'Synchronisation de votre journée…':walk?.connected?`${pct}% de votre repère du jour · données vérifiées`:'Connectez KEY pour afficher votre activité quotidienne.';
  const movementMeta=activeMinutes===null?'pas aujourd’hui':`pas · ${fmt(activeMinutes)} min actives`;
  const pointsCopy=kpWeek===null?clubCopy:`${fmt(kpWeek)} cette semaine · ${clubCopy}`;
  return `<section class="kh3${loading?' is-loading':''}" data-khome-datawall data-khome-v3 aria-busy="${loading?'true':'false'}">
    <div class="kh3-brand" aria-label="KŌMØ Pulse"><span class="kh3-brand-dot" aria-hidden="true"></span><strong>KŌMØ PULSE</strong><small>LONGEVITY IN MOTION</small></div>
    <header class="kh3-head"><span>VOTRE ESPACE LONGÉVITÉ</span><h2>Bonjour${name?` ${esc(name)}`:''}.</h2><p>Voici ce qui compte aujourd’hui.</p></header>

    <section class="kh3-movement" aria-label="Votre journée en mouvement">
      <div class="kh3-movement-top"><div><span>VOTRE JOURNÉE EN MOUVEMENT</span><h3>${steps===null?'—':fmt(steps)}</h3><small>${esc(movementMeta)}</small></div><button type="button" data-kh3-route="key">Voir KEY <b>→</b></button></div>
      <div class="kh3-progress"><i style="width:${pct}%"></i></div>
      <p>${esc(movementCopy)}</p>
    </section>

    <section class="kh3-strip" aria-label="Vos deux repères essentiels">
      <button class="kh3-score-card" type="button" data-kh3-route="${motion.route}"><span>${esc(motion.label)}</span><strong>${esc(motion.value)}</strong><small>${esc(motion.copy)}</small></button>
      <button class="kh3-points-card" type="button" data-kh3-route="mykomo"><span>K POINTS</span><strong>${kp===null?'—':`+${fmt(kp)}`}</strong><small>${esc(pointsCopy)}</small></button>
    </section>

    <section class="kh3-next"><div><span>VOTRE PROCHAINE ÉTAPE</span><h3>${esc(action.title)}</h3><p>${esc(action.copy)}</p></div><button type="button" data-kh3-action="${esc(action.route)}">${esc(action.label)} <b>→</b></button></section>
  </section>`;
}
function bind(root){
  root.querySelectorAll('[data-kh3-route]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.kh3Route)));
  root.querySelector('[data-kh3-action]')?.addEventListener('click',()=>{const a=root.querySelector('[data-kh3-action]').dataset.kh3Action;if(a==='komo')window.KomoAssistantV2?.open?.();else go(a)});
}
function mount(host,markup){
  const wrap=document.createElement('div');wrap.innerHTML=markup;
  const node=wrap.firstElementChild;
  host.replaceChildren(node);
  host.dataset.khomeOwner='v3';
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
    const [result,walk]=await Promise.all([loadCanonicalResult({force}),walkSummary()]);
    const markup=homeMarkup(result,walk,false);
    const signature=markup;
    if(!force&&signature===lastSignature&&host.querySelector('[data-khome-v3]:not(.is-loading)'))return;
    mount(host,markup);lastSignature=signature;
    window.KomoAssistantV2?.refresh?.();
    window.dispatchEvent(new CustomEvent('komo:home-command-rendered'));
  }catch(e){console.error('[patient-home-v3]',e)}finally{rendering=false}
}
function schedule(force=false,ms=50){clearTimeout(timer);timer=setTimeout(()=>render(force),ms)}
['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:canonical-result-ready','komo:wearable-data-updated','komo:session-ready'].forEach(name=>window.addEventListener(name,()=>{tuneChrome();schedule(['komo:data-ready','komo:wearable-data-updated'].includes(name),30)}));
function boot(){
  tuneChrome();
  schedule(true,0);
  [70,220,650,1400,2800].forEach(ms=>setTimeout(()=>render(true),ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(true,10)};

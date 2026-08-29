import { loadCanonicalResult } from './canonical-result-runtime.js';

/* KŌMØ Pulse — canonical phone runtime v1
   Phone home owns only the information that matters most: scores + connected follow-up. */
const PHONE='(max-width: 767px)';
const VERSION='1.0.0';
let cache=null,cacheAt=0,loading=false,retry=0,menuOpen=false,lastRoute='';

const phone=()=>window.matchMedia(PHONE).matches;
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const app=()=>document.querySelector('#appShell');
const auth=()=>document.querySelector('#authScreen');
const root=()=>document.querySelector('#viewRoot');
const main=()=>document.querySelector('.main-shell');
const client=()=>window.KomoRuntime?.client||null;
const role=()=>window.KomoRuntime?.role||window.KomoRuntime?.getContext?.()?.role||'member';
const visible=()=>phone()&&!!app()&&!app().hidden&&(!auth()||auth().hidden);
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const dayKey=d=>{const x=new Date(d),y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),dd=String(x.getDate()).padStart(2,'0');return `${y}-${m}-${dd}`};
const fmtInt=v=>v==null?'—':Math.round(v).toLocaleString('fr-FR');
const fmt1=v=>v==null?'—':Number(v).toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1});
const mean=(rows,key)=>{const vals=rows.map(x=>num(x[key])).filter(x=>x!==null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null};
const median=(rows,key)=>{const vals=rows.map(x=>num(x[key])).filter(x=>x!==null).sort((a,b)=>a-b);if(!vals.length)return null;const i=Math.floor(vals.length/2);return vals.length%2?vals[i]:(vals[i-1]+vals[i])/2};

function resetTop(){
  try{window.KomoPatientNavigation?.resetScroll?.()}catch{}
  try{window.scrollTo(0,0)}catch{}
  try{main()?.scrollTo({top:0,left:0,behavior:'auto'})}catch{if(main())main().scrollTop=0}
}

function currentSession(){return window.KomoRuntime?.getContext?.()?.session||null}

async function load(force=false){
  if(!visible()||route()!=='home')return null;
  if(!force&&cache&&Date.now()-cacheAt<15000)return cache;
  if(loading)return cache;
  const c=client();
  if(!c)return null;
  loading=true;
  try{
    const session=currentSession()||(await c.auth.getSession()).data?.session;
    if(!session?.user)return null;
    const from=new Date();from.setDate(from.getDate()-14);
    const [canonical,wear,consent]=await Promise.all([
      loadCanonicalResult({force}).catch(()=>null),
      c.from('wearable_daily_metrics').select('metric_date,steps,active_minutes,sleep_minutes,resting_hr,spo2_avg').eq('user_id',session.user.id).gte('metric_date',dayKey(from)).order('metric_date',{ascending:true}),
      c.from('wearable_consents').select('status,accepted_at,withdrawn_at').eq('user_id',session.user.id).eq('purpose','connected_followup').order('accepted_at',{ascending:false}).limit(1)
    ]);
    cache={canonical,rows:wear.error?[]:(wear.data||[]),consent:consent.error?null:(consent.data||[])[0]||null};
    cacheAt=Date.now();
    return cache;
  }catch(e){
    console.error('[mobile-canonical]',e);
    return cache;
  }finally{loading=false}
}

function scoreData(data){
  const result=data?.canonical||{};
  const score=num(result?.score?.motion_score);
  const d=result?.score?.domain_scores||{};
  const age=result?.locomotorAge?.status==='available'?num(result.locomotorAge.age):null;
  const ageDelta=result?.locomotorAge?.status==='available'?num(result.locomotorAge.deltaYears):null;
  const mobility=num(d.mobility);
  const symmetry=num(d.myocare_symmetry??d.symmetry);
  return{score,age,ageDelta,mobility,symmetry};
}

function wearableData(data){
  const rows=data?.rows||[];
  const today=rows.find(x=>x.metric_date===dayKey(new Date()))||rows.at(-1)||{};
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-6);cutoff.setHours(0,0,0,0);
  const week=rows.filter(x=>new Date(`${x.metric_date}T12:00:00`)>=cutoff);
  const active=data?.consent?.status==='active';
  return{
    active,
    has:rows.length>0,
    steps:num(today.steps),
    sleep:mean(week,'sleep_minutes'),
    rhr:median(week,'resting_hr'),
    spo2:median(week,'spo2_avg')
  };
}

function scoreCard(s){
  const pct=clamp(s.score||0);
  const ageLabel=s.age===null?'À calculer':`${Math.round(s.age)} ans`;
  const ageNote=s.age===null?'Disponible après un Motion Score exploitable.':s.ageDelta===null?'Âge locomoteur KŌMØ':`${s.ageDelta>0?'+':''}${Math.round(s.ageDelta)} ans vs âge réel`;
  return `<article class="kcm-score-card" data-kcm-score>
    <div class="kcm-score-top"><small>MES SCORES</small><span class="kcm-state ${s.score===null?'off':''}">${s.score===null?'À mesurer':'Disponible'}</span></div>
    <div class="kcm-score-main">
      <div class="kcm-score-ring" style="--kcm-score:${pct}"><div class="kcm-score-core"><strong>${s.score===null?'—':Math.round(s.score)}${s.score===null?'':'<small>/100</small>'}</strong><span>Motion Score</span></div></div>
      <div class="kcm-age"><small>KŌMØ AGE</small><strong>${ageLabel}</strong><span>${ageNote}</span></div>
    </div>
    <div class="kcm-mini-scores">
      <div class="kcm-mini"><small>Mobilité</small><strong>${s.mobility===null?'—':Math.round(s.mobility)+'/100'}</strong><span>Repère fonctionnel</span></div>
      <div class="kcm-mini"><small>Symétrie</small><strong>${s.symmetry===null?'—':Math.round(s.symmetry)+'/100'}</strong><span>Données Motion / MyoCare</span></div>
    </div>
    <button class="kcm-primary" type="button" data-kcm-route="${s.score===null?'motion':'trajectory'}">${s.score===null?'Démarrer KŌMØ Motion':'Voir tous mes scores →'}</button>
  </article>`;
}

function watchCard(w){
  const sleep=w.sleep===null?'—':`${fmt1(w.sleep/60)} h`;
  const rhr=w.rhr===null?'—':`${fmtInt(w.rhr)} bpm`;
  const steps=w.steps===null?'—':fmtInt(w.steps);
  return `<article class="kcm-watch-card" data-kcm-watch>
    <div class="kcm-watch-head"><div><small>SUIVI CONNECTÉ · KŌMØ KEY</small><h2>Votre montre, dans Pulse.</h2></div><span class="kcm-state ${w.active?'':'off'}">${w.active?'Actif':'À connecter'}</span></div>
    <div class="kcm-watch-grid">
      <div class="kcm-watch-stat"><small>Pas</small><strong>${steps}</strong><span>aujourd’hui</span></div>
      <div class="kcm-watch-stat"><small>Sommeil</small><strong>${sleep}</strong><span>moy. 7 j</span></div>
      <div class="kcm-watch-stat"><small>FC repos</small><strong>${rhr}</strong><span>méd. 7 j</span></div>
    </div>
    <p class="kcm-watch-copy">${w.has?'Les données reçues sont suivies dans le temps et restent séparées du calcul du Motion Score.':'Connectez votre suivi pour retrouver mouvement, sommeil et récupération entre deux bilans.'}</p>
    <button class="kcm-watch-button" type="button" data-kcm-route="key">${w.active?'Ouvrir mon suivi connecté →':'Configurer KŌMØ KEY →'}</button>
  </article>`;
}

function loadingHome(){return `<section class="kcm-home" data-kcm-home><div class="kcm-home-intro"><small>KŌMØ PULSE · MOBILE</small><h1>Votre mobilité, en un regard.</h1></div><article class="kcm-score-card"><div class="kcm-score-top"><small>MES SCORES</small><span class="kcm-state off">Chargement</span></div><div style="height:210px;display:grid;place-items:center;color:#7d867f;font-size:10px">Synchronisation de vos données…</div></article></section>`}

function renderHome(data){
  if(!visible()||route()!=='home')return;
  const r=root();if(!r)return;
  const s=scoreData(data),w=wearableData(data);
  r.innerHTML=`<section class="kcm-home" data-kcm-home><div class="kcm-home-intro"><small>KŌMØ PULSE · MOBILE</small><h1>Votre mobilité, en un regard.</h1></div>${scoreCard(s)}${watchCard(w)}</section>`;
}

async function home(force=false){
  if(!visible()||route()!=='home')return;
  const r=root();if(!r)return;
  if(!r.querySelector('[data-kcm-home]'))r.innerHTML=loadingHome();
  const data=await load(force);
  if(data)renderHome(data);
  else if(retry<8){retry++;setTimeout(()=>home(force),300)}
}

function brand(){
  const top=document.querySelector('.topbar');if(!top||top.querySelector('#kcmBrand'))return;
  const b=document.createElement('div');b.id='kcmBrand';b.className='kcm-brand';b.innerHTML='<strong>KŌMØ PULSE</strong><span>Longevity in motion.</span>';
  const m=document.createElement('button');m.id='kcmMenuButton';m.className='kcm-menu-button';m.type='button';m.setAttribute('aria-label','Ouvrir la navigation');m.setAttribute('aria-expanded','false');m.innerHTML='<i aria-hidden="true"></i><span>Menu</span>';
  m.addEventListener('click',()=>setMenu(!menuOpen));
  top.append(b,m);
}

function routeButton(target,label,icon){const active=route()===window.KomoPatientNavigation?.canonical?.(target)||route()===target;return `<button type="button" class="${active?'active':''}" data-kcm-route="${target}"><i>${icon}</i><span>${label}</span></button>`}

function menuHtml(){
  const r=role();
  let secondary='<button type="button" data-kcm-route="documents">Rendez-vous</button>';
  if(['professional','admin'].includes(r))secondary+='<button type="button" data-kcm-work="clinical">Espace professionnel</button>';
  if(r==='admin')secondary+='<button type="button" class="kcm-admin" data-kcm-work="admin">Administration KŌMØ</button>';
  secondary+='<button type="button" class="kcm-logout" data-kcm-logout>Se déconnecter</button>';
  return `<div class="kcm-menu-head"><strong>KŌMØ PULSE</strong><span>Navigation mobile</span></div><button class="kcm-menu-close" type="button" data-kcm-close aria-label="Fermer">×</button><nav class="kcm-menu-nav" aria-label="Navigation principale mobile">${routeButton('home','Accueil','⌂')}${routeButton('trajectory','Mes scores','◉')}${routeButton('key','Suivi montre · KEY','⌁')}${routeButton('mykomo','My KŌMØ · XP','✦')}${routeButton('profile','Compte','○')}</nav><div class="kcm-menu-secondary">${secondary}</div>`;
}

function ensureMenu(){
  const shell=app();if(!shell)return;
  let bg=document.querySelector('#kcmMenuBackdrop'),menu=document.querySelector('#kcmMenu');
  if(!bg){bg=document.createElement('button');bg.id='kcmMenuBackdrop';bg.className='kcm-menu-backdrop';bg.type='button';bg.setAttribute('aria-label','Fermer la navigation');bg.addEventListener('click',()=>setMenu(false));shell.appendChild(bg)}
  if(!menu){menu=document.createElement('aside');menu.id='kcmMenu';menu.className='kcm-menu';menu.setAttribute('aria-label','Menu KŌMØ Pulse');shell.appendChild(menu)}
  menu.innerHTML=menuHtml();
}

function setMenu(open){
  menuOpen=!!open;
  ensureMenu();
  document.querySelector('#kcmMenu')?.classList.toggle('open',menuOpen);
  document.querySelector('#kcmMenuBackdrop')?.classList.toggle('open',menuOpen);
  document.querySelector('#kcmMenuButton')?.setAttribute('aria-expanded',String(menuOpen));
  document.documentElement.classList.toggle('kcm-menu-open',menuOpen);
}

function go(target){
  setMenu(false);resetTop();
  if(['home','trajectory','key','mykomo','profile','documents','motion'].includes(target)){
    window.KomoPatientNavigation?.go?.(target)|| (location.hash=target);
  }else location.hash=target;
}

function work(target){setMenu(false);resetTop();location.hash=target;if(target==='clinical')setTimeout(()=>window.KomoProArchitecture?.open?.('dashboard'),80);if(target==='admin')setTimeout(()=>window.dispatchEvent(new CustomEvent('komo:admin-open')),80)}

function bind(){
  document.addEventListener('click',e=>{
    const r=e.target.closest?.('[data-kcm-route]');if(r){e.preventDefault();go(r.dataset.kcmRoute);return}
    const w=e.target.closest?.('[data-kcm-work]');if(w){e.preventDefault();work(w.dataset.kcmWork);return}
    if(e.target.closest?.('[data-kcm-close]')){e.preventDefault();setMenu(false);return}
    if(e.target.closest?.('[data-kcm-logout]')){e.preventDefault();setMenu(false);document.querySelector('#logoutButton')?.click()}
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen)setMenu(false)});
}

function sync(){
  if(!phone()){
    document.documentElement.classList.remove('kcm-phone','kcm-menu-open');
    document.querySelector('#kcmBrand')?.remove();document.querySelector('#kcmMenuButton')?.remove();document.querySelector('#kcmMenu')?.remove();document.querySelector('#kcmMenuBackdrop')?.remove();return;
  }
  if(visible()){
    document.documentElement.classList.add('kcm-phone');brand();ensureMenu();
    const r=route();
    if(r!==lastRoute){lastRoute=r;setMenu(false);resetTop()}
    if(r==='home')home(false);
  }else{
    document.documentElement.classList.remove('kcm-phone','kcm-menu-open');setMenu(false);
  }
}

bind();
['hashchange','pageshow','popstate','komo:session-ready','komo:data-ready','komo:route-ready','komo:canonical-result-ready','komo:wearable-data-updated'].forEach(name=>window.addEventListener(name,()=>{if(name==='komo:wearable-data-updated'||name==='komo:canonical-result-ready')cache=null;setTimeout(sync,20)},{passive:true}));
window.addEventListener('resize',sync,{passive:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,100));
if(document.readyState!=='loading')setTimeout(sync,30);
setTimeout(sync,700);
window.KomoMobileCanonical={version:VERSION,refresh:()=>{cache=null;return home(true)},openMenu:()=>setMenu(true)};

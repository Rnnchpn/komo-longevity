import { loadCanonicalResult } from './canonical-result-runtime.js';

/* KŌMØ Pulse — canonical phone runtime v2
   One mobile owner. Home hierarchy: account -> KEY -> experience. */
const PHONE='(max-width: 767px)';
const VERSION='2.0.0';
const HOME_TTL=20000;
const LINK_TTL=30000;
let homeCache=null,homeCacheAt=0,linkCache=null,linkCacheAt=0;
let homeLoading=false,linkLoading=false,retry=0,menuOpen=false,lastRoute='';

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
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function resetTop(){
  try{window.KomoPatientNavigation?.resetScroll?.()}catch{}
  try{window.scrollTo(0,0)}catch{}
  try{main()?.scrollTo({top:0,left:0,behavior:'auto'})}catch{if(main())main().scrollTop=0}
}

function currentSession(){return window.KomoRuntime?.getContext?.()?.session||null}
async function session(){const c=client();return currentSession()||(c?(await c.auth.getSession()).data?.session:null)}
function normalizeRpc(data){return Array.isArray(data)?(data[0]||null):(data||null)}

async function loadHome(force=false){
  if(!visible()||route()!=='home')return null;
  if(!force&&homeCache&&Date.now()-homeCacheAt<HOME_TTL)return homeCache;
  if(homeLoading)return homeCache;
  const c=client();if(!c)return null;
  homeLoading=true;
  try{
    const s=await session();if(!s?.user)return null;
    const from=new Date();from.setDate(from.getDate()-14);
    const [canonical,wear,consent,engagement,profile]=await Promise.all([
      loadCanonicalResult({force}).catch(()=>null),
      c.from('wearable_daily_metrics').select('metric_date,steps,active_minutes,sleep_minutes,resting_hr,spo2_avg').eq('user_id',s.user.id).gte('metric_date',dayKey(from)).order('metric_date',{ascending:true}),
      c.from('wearable_consents').select('status,accepted_at,withdrawn_at').eq('user_id',s.user.id).eq('purpose','connected_followup').order('accepted_at',{ascending:false}).limit(1),
      c.rpc('komo_engagement_summary'),
      c.from('profiles').select('*').eq('id',s.user.id).maybeSingle()
    ]);
    homeCache={
      session:s,
      canonical,
      rows:wear.error?[]:(wear.data||[]),
      consent:consent.error?null:(consent.data||[])[0]||null,
      engagement:engagement.error?null:normalizeRpc(engagement.data),
      profile:profile.error?null:(profile.data||null)
    };
    homeCacheAt=Date.now();
    return homeCache;
  }catch(e){console.error('[mobile-canonical:home]',e);return homeCache}
  finally{homeLoading=false}
}

async function loadLink(force=false){
  if(!visible()||route()!=='link')return null;
  if(!force&&linkCache&&Date.now()-linkCacheAt<LINK_TTL)return linkCache;
  if(linkLoading)return linkCache;
  const c=client();if(!c)return null;
  linkLoading=true;
  try{
    const s=await session();if(!s?.user)return null;
    const [devices,consent]=await Promise.all([
      c.from('wearable_devices').select('id,provider,model,display_name,status,paired_at,last_sync_at,battery_percent').eq('user_id',s.user.id).order('created_at',{ascending:false}),
      c.from('wearable_consents').select('status,accepted_at,withdrawn_at').eq('user_id',s.user.id).eq('purpose','connected_followup').order('accepted_at',{ascending:false}).limit(1)
    ]);
    linkCache={devices:devices.error?[]:(devices.data||[]),consent:consent.error?null:(consent.data||[])[0]||null};
    linkCacheAt=Date.now();return linkCache;
  }catch(e){console.error('[mobile-canonical:link]',e);return linkCache}
  finally{linkLoading=false}
}

function scoreData(data){
  const result=data?.canonical||{};
  const score=num(result?.score?.motion_score);
  const d=result?.score?.domain_scores||{};
  const age=result?.locomotorAge?.status==='available'?num(result.locomotorAge.age):null;
  return{score,age,mobility:num(d.mobility),symmetry:num(d.myocare_symmetry??d.symmetry)};
}

function wearableData(data){
  const rows=data?.rows||[];
  const today=rows.find(x=>x.metric_date===dayKey(new Date()))||rows.at(-1)||{};
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-6);cutoff.setHours(0,0,0,0);
  const week=rows.filter(x=>new Date(`${x.metric_date}T12:00:00`)>=cutoff);
  return{
    active:data?.consent?.status==='active',has:rows.length>0,
    steps:num(today.steps),activeMinutes:num(today.active_minutes),
    sleep:mean(week,'sleep_minutes'),rhr:median(week,'resting_hr'),spo2:median(week,'spo2_avg')
  };
}

function accountName(data){
  const p=data?.profile||{},u=data?.session?.user||{};
  return p.display_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||u.user_metadata?.display_name||u.email?.split('@')[0]||'Mon espace KŌMØ';
}

function accountCard(data,s,w){
  const motion=s.score===null?'À mesurer':`${Math.round(s.score)}/100`;
  const clinical=s.age===null?'Mes résultats':`${Math.round(s.age)} ans`;
  const key=w.active?'Connecté':'À relier';
  return `<section class="kcm-account" data-kcm-account>
    <div class="kcm-account-copy"><small>MON ESPACE</small><h1>${esc(accountName(data))}</h1><p>Vos trois univers KŌMØ, réunis dans Pulse.</p></div>
    <div class="kcm-account-links">
      <button type="button" data-kcm-route="motion"><span><b>M</b><i>KŌMØ MOTION</i></span><strong>${motion}</strong><em>→</em></button>
      <button type="button" data-kcm-route="results"><span><b>C</b><i>KŌMØ CLINICAL</i></span><strong>${clinical}</strong><em>→</em></button>
      <button type="button" data-kcm-route="key"><span><b>K</b><i>KŌMØ KEY</i></span><strong>${key}</strong><em>→</em></button>
    </div>
  </section>`;
}

function keyCard(w){
  const metrics=[
    ['Pas',fmtInt(w.steps),'aujourd’hui'],
    ['Sommeil',w.sleep===null?'—':`${fmt1(w.sleep/60)} h`,'moy. 7 jours'],
    ['FC repos',w.rhr===null?'—':`${fmtInt(w.rhr)} bpm`,'méd. 7 jours'],
    ['Activité',w.activeMinutes===null?'—':`${fmtInt(w.activeMinutes)} min`,'aujourd’hui']
  ];
  return `<section class="kcm-key" data-kcm-key>
    <div class="kcm-section-head"><div><small>KŌMØ KEY</small><h2>Vos signaux du quotidien.</h2></div><span class="kcm-state ${w.active?'':'off'}">${w.active?'Connecté':'À connecter'}</span></div>
    <div class="kcm-key-grid">${metrics.map(([a,b,c])=>`<div><small>${a}</small><strong>${b}</strong><span>${c}</span></div>`).join('')}</div>
    <button class="kcm-soft-action" type="button" data-kcm-route="key">Voir tout KŌMØ KEY →</button>
  </section>`;
}

function xpCard(e){
  const level=Math.max(1,Math.round(num(e?.level)||1));
  const total=Math.max(0,Math.round(num(e?.xp_total)||0));
  const today=Math.max(0,Math.round(num(e?.xp_today)||0));
  const pct=clamp(num(e?.level_pct)||0);
  const left=Math.max(0,Math.round(num(e?.xp_to_next_level)||Math.max(0,level*500-total)));
  const points=Math.max(0,Math.round(num(e?.points)||0));
  return `<section class="kcm-xp" data-kcm-xp>
    <div class="kcm-section-head"><div><small>EXPÉRIENCE</small><h2>Votre progression KŌMØ.</h2></div><span class="kcm-level">Niv. ${level}</span></div>
    <div class="kcm-xp-main"><strong>${total.toLocaleString('fr-FR')} XP</strong><span>${pct}% vers le niveau ${level+1}</span></div>
    <div class="kcm-xp-bar"><i style="width:${pct}%"></i></div>
    <div class="kcm-xp-foot"><span><b>+${today}</b> XP aujourd’hui</span><span><b>${points}</b> KP</span><span><b>${left}</b> XP restants</span></div>
    <button class="kcm-soft-action" type="button" data-kcm-route="mykomo">Ouvrir My KŌMØ →</button>
  </section>`;
}

function loadingHome(){return `<section class="kcm-home" data-kcm-home><div class="kcm-skeleton"><i></i><i></i><i></i></div></section>`}
function renderHome(data){if(!visible()||route()!=='home')return;const r=root();if(!r)return;const s=scoreData(data),w=wearableData(data);r.innerHTML=`<section class="kcm-home" data-kcm-home>${accountCard(data,s,w)}${keyCard(w)}${xpCard(data?.engagement)}</section>`}
async function home(force=false){if(!visible()||route()!=='home')return;const r=root();if(!r)return;if(!r.querySelector('[data-kcm-home]'))r.innerHTML=loadingHome();const data=await loadHome(force);if(data)renderHome(data);else if(retry<7){retry++;setTimeout(()=>home(force),280)}}

const PROVIDERS=[
  {key:'apple',name:'Apple Health & Watch',copy:'Activité, fréquence cardiaque, sommeil et récupération via l’écosystème Apple.'},
  {key:'garmin',name:'Garmin Connect',copy:'Activité, entraînement, sommeil et métriques physiologiques Garmin.'},
  {key:'whoop',name:'WHOOP',copy:'Récupération, sommeil, strain et signaux quotidiens.'},
  {key:'oura',name:'Oura',copy:'Sommeil, readiness, activité et tendances de récupération.'},
  {key:'strava',name:'Strava',copy:'Activités sportives, durée, distance et historique d’entraînement.'},
  {key:'google',name:'Health Connect',copy:'Passerelle Android pour les données santé et activité compatibles.'},
  {key:'fitbit',name:'Fitbit',copy:'Pas, activité, sommeil et fréquence cardiaque selon les appareils compatibles.'}
];
function providerMatch(provider,key){const p=String(provider||'').toLowerCase();if(key==='apple')return /apple|healthkit|watch/.test(p);if(key==='google')return /google|health connect|android/.test(p);return p.includes(key)}
function linkHtml(data){
  const devices=data?.devices||[],active=devices.filter(d=>d.status==='active');
  return `<section class="kcm-link" data-kcm-link>
    <div class="kcm-route-intro"><small>KŌMØ LINK</small><h1>Reliez votre quotidien.</h1><p>Les marques restent regroupées ici. La page d’accueil ne montre que vos données utiles.</p></div>
    <section class="kcm-connected"><div class="kcm-section-head"><div><small>KŌMØ CONNECTED</small><h2>Sources connectées</h2></div><span class="kcm-state ${active.length?'':'off'}">${active.length?`${active.length} active${active.length>1?'s':''}`:'Aucune'}</span></div>${active.length?`<div class="kcm-connected-list">${active.slice(0,4).map(d=>`<div><i></i><span><strong>${esc(d.display_name||d.model||d.provider||'Appareil')}</strong><small>${esc(d.provider||'Connected')}</small></span><em>Connecté</em></div>`).join('')}</div>`:'<p class="kcm-empty">Aucune source externe n’est encore reliée à votre compte.</p>'}</section>
    <section class="kcm-provider-card"><div class="kcm-section-head"><div><small>CONNEXIONS</small><h2>Choisir une source</h2></div></div><div class="kcm-provider-list">${PROVIDERS.map(p=>{const d=active.find(x=>providerMatch(x.provider,p.key));return `<article class="${d?'connected':''}"><div class="kcm-provider-mark">${p.name.slice(0,1)}</div><div><strong>${p.name}</strong><p>${p.copy}</p></div><span>${d?'Connecté':'Bientôt'}</span></article>`}).join('')}</div><p class="kcm-link-note">Les connexions API/OAuth seront activées progressivement. Une source déjà enregistrée dans Pulse apparaît automatiquement comme connectée.</p></section>
  </section>`;
}
function loadingLink(){return `<section class="kcm-link" data-kcm-link><div class="kcm-route-intro"><small>KŌMØ LINK</small><h1>Reliez votre quotidien.</h1></div><div class="kcm-skeleton"><i></i><i></i></div></section>`}
async function link(force=false){if(!visible()||route()!=='link')return;const r=root();if(!r)return;if(!r.querySelector('[data-kcm-link]'))r.innerHTML=loadingLink();const data=await loadLink(force);if(data&&visible()&&route()==='link')r.innerHTML=linkHtml(data)}

function brand(){
  const top=document.querySelector('.topbar');if(!top||top.querySelector('#kcmBrand'))return;
  const b=document.createElement('div');b.id='kcmBrand';b.className='kcm-brand';b.innerHTML='<strong>KŌMØ PULSE</strong><span>Longevity in motion.</span>';
  const m=document.createElement('button');m.id='kcmMenuButton';m.className='kcm-menu-button';m.type='button';m.setAttribute('aria-label','Ouvrir la navigation');m.setAttribute('aria-expanded','false');m.innerHTML='<i aria-hidden="true"></i><span>Menu</span>';
  m.addEventListener('click',()=>setMenu(!menuOpen));top.append(b,m);
}

function routeButton(target,label,icon){const active=route()===window.KomoPatientNavigation?.canonical?.(target)||route()===target;return `<button type="button" class="${active?'active':''}" data-kcm-route="${target}"><i>${icon}</i><span>${label}</span><em>→</em></button>`}
function menuHtml(){
  const r=role();
  let secondary='';
  if(['professional','admin'].includes(r))secondary+='<button type="button" data-kcm-work="clinical">Espace professionnel</button>';
  if(r==='admin')secondary+='<button type="button" class="kcm-admin" data-kcm-work="admin">Administration KŌMØ</button>';
  secondary+='<button type="button" class="kcm-logout" data-kcm-logout>Se déconnecter</button>';
  return `<div class="kcm-menu-head"><strong>KŌMØ PULSE</strong><span>Votre espace</span></div><button class="kcm-menu-close" type="button" data-kcm-close aria-label="Fermer">×</button><nav class="kcm-menu-nav" aria-label="Navigation principale mobile">${routeButton('home','Accueil','⌂')}${routeButton('mykomo','My KŌMØ','✦')}${routeButton('key','KŌMØ Key','K')}${routeButton('link','KŌMØ Link','↗')}${routeButton('documents','Rendez-vous & agenda','◷')}${routeButton('profile','Compte','○')}</nav><div class="kcm-menu-secondary">${secondary}</div>`;
}
function ensureMenu(){const shell=app();if(!shell)return;let bg=document.querySelector('#kcmMenuBackdrop'),menu=document.querySelector('#kcmMenu');if(!bg){bg=document.createElement('button');bg.id='kcmMenuBackdrop';bg.className='kcm-menu-backdrop';bg.type='button';bg.setAttribute('aria-label','Fermer la navigation');bg.addEventListener('click',()=>setMenu(false));shell.appendChild(bg)}if(!menu){menu=document.createElement('aside');menu.id='kcmMenu';menu.className='kcm-menu';menu.setAttribute('aria-label','Menu KŌMØ Pulse');shell.appendChild(menu)}menu.innerHTML=menuHtml()}
function setMenu(open){menuOpen=!!open;ensureMenu();document.querySelector('#kcmMenu')?.classList.toggle('open',menuOpen);document.querySelector('#kcmMenuBackdrop')?.classList.toggle('open',menuOpen);document.querySelector('#kcmMenuButton')?.setAttribute('aria-expanded',String(menuOpen));document.documentElement.classList.toggle('kcm-menu-open',menuOpen)}
function go(target){setMenu(false);resetTop();if(['home','results','trajectory','key','link','mykomo','profile','documents','motion'].includes(target)){window.KomoPatientNavigation?.go?.(target)||(location.hash=target)}else location.hash=target}
function work(target){setMenu(false);resetTop();location.hash=target;if(target==='clinical')setTimeout(()=>window.KomoProArchitecture?.open?.('dashboard'),80);if(target==='admin')setTimeout(()=>window.dispatchEvent(new CustomEvent('komo:admin-open')),80)}

function bind(){
  document.addEventListener('click',e=>{const r=e.target.closest?.('[data-kcm-route]');if(r){e.preventDefault();go(r.dataset.kcmRoute);return}const w=e.target.closest?.('[data-kcm-work]');if(w){e.preventDefault();work(w.dataset.kcmWork);return}if(e.target.closest?.('[data-kcm-close]')){e.preventDefault();setMenu(false);return}if(e.target.closest?.('[data-kcm-logout]')){e.preventDefault();setMenu(false);document.querySelector('#logoutButton')?.click()}},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen)setMenu(false)});
}

function sync(){
  if(!phone()){document.documentElement.classList.remove('kcm-phone','kcm-menu-open');document.querySelector('#kcmBrand')?.remove();document.querySelector('#kcmMenuButton')?.remove();document.querySelector('#kcmMenu')?.remove();document.querySelector('#kcmMenuBackdrop')?.remove();return}
  if(visible()){
    document.documentElement.classList.add('kcm-phone');brand();ensureMenu();
    const r=route();if(r!==lastRoute){lastRoute=r;setMenu(false);resetTop()}
    if(r==='home')home(false);else if(r==='link')link(false);
  }else{document.documentElement.classList.remove('kcm-phone','kcm-menu-open');setMenu(false)}
}

bind();
['hashchange','pageshow','popstate','komo:session-ready','komo:data-ready','komo:route-ready','komo:canonical-result-ready','komo:wearable-data-updated'].forEach(name=>window.addEventListener(name,()=>{if(name==='komo:wearable-data-updated'||name==='komo:canonical-result-ready'){homeCache=null;linkCache=null}setTimeout(sync,20)},{passive:true}));
window.addEventListener('resize',sync,{passive:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,100));
if(document.readyState!=='loading')setTimeout(sync,30);setTimeout(sync,650);
window.KomoMobileCanonical={version:VERSION,refresh:()=>{homeCache=null;linkCache=null;return route()==='link'?link(true):home(true)},openMenu:()=>setMenu(true)};

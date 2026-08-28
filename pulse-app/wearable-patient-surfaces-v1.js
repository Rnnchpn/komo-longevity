import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER_KEY='komo_pulse_remember';
const VERSION='1.0.0';
let client=null,cache=null,cacheAt=0,timer=null,busy=false;

const route=()=>location.hash.replace(/^#/,'')||'home';
const storage=()=>localStorage.getItem(REMEMBER_KEY)==='1'?localStorage:sessionStorage;
const sb=()=>window.KomoRuntime?.client||(client||(client=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})));
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const avg=(rows,key)=>{const vals=rows.map(r=>n(r[key])).filter(v=>v!==null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null};
const fmtInt=v=>v==null?'—':Math.round(v).toLocaleString('fr-FR');
const fmtDec=(v,d=1)=>v==null?'—':Number(v).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
const dayKey=d=>{const x=new Date(d),y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),dd=String(x.getDate()).padStart(2,'0');return `${y}-${m}-${dd}`};
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function ensureStyle(){
  if(document.querySelector('#kwearablePatientSurfacesStyle'))return;
  const s=document.createElement('style');s.id='kwearablePatientSurfacesStyle';s.textContent=`
  .kw-home{position:relative;z-index:1;margin-top:14px;display:grid;grid-template-columns:minmax(220px,.75fr) minmax(0,1.55fr);gap:9px}
  .kw-home-device{border:1px solid rgba(35,48,39,.07);border-radius:18px;padding:15px;background:linear-gradient(145deg,#26372d,#3e5145);color:#fff;display:grid;grid-template-columns:auto 1fr;gap:13px;align-items:center;cursor:pointer;text-align:left;min-height:112px}
  .kw-home-mark{width:54px;height:54px;border-radius:18px;background:rgba(255,255,255,.1);display:grid;place-items:center;font:700 10px/1 Manrope,sans-serif;letter-spacing:.12em}
  .kw-home-device small,.kw-home-metric small{display:block;font-size:6px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.55}.kw-home-device strong{display:block;margin-top:5px;font:600 18px/1.05 Manrope,sans-serif;letter-spacing:-.04em}.kw-home-device span.meta{display:block;margin-top:5px;font-size:7px;opacity:.65}.kw-home-status{display:inline-flex!important;width:max-content;margin-top:8px!important;padding:4px 7px;border-radius:999px;background:rgba(255,255,255,.1);font-size:5.5px!important;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:1!important}
  .kw-home-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.kw-home-metric{border:1px solid rgba(35,48,39,.06);border-radius:16px;padding:14px;background:#fff;display:flex;flex-direction:column;justify-content:center;min-height:112px}.kw-home-metric strong{display:block;margin-top:9px;font:600 21px/1 Manrope,sans-serif;letter-spacing:-.045em;color:#2b3a30}.kw-home-metric span{display:block;margin-top:5px;color:#7d8780;font-size:6.5px;line-height:1.35}
  .kw-home-foot{position:relative;z-index:1;margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#7b837d;font-size:6.5px}.kw-home-foot button,.kw-score-link{border:0;background:transparent;padding:0;color:#476252;font:800 7px DM Sans,sans-serif;cursor:pointer}
  .kw-score{margin:18px 0;padding:26px;border:1px solid rgba(35,48,39,.08);border-radius:28px;background:linear-gradient(145deg,#f7f4ed,#eef2eb);box-shadow:0 12px 34px rgba(35,48,39,.035)}
  .kw-score-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.kw-score-head .eyebrow{margin:0;color:#758178;font-size:7px;font-weight:800;letter-spacing:.15em}.kw-score-head h2{margin:6px 0 0;font:600 26px/1.05 Manrope,sans-serif;letter-spacing:-.045em;color:#26372d}.kw-score-head p{max-width:440px;margin:7px 0 0;color:#78827b;font-size:9px;line-height:1.55}.kw-score-badge{padding:7px 10px;border-radius:999px;background:#fff;color:#637168;font-size:6px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;white-space:nowrap;border:1px solid rgba(35,48,39,.06)}
  .kw-score-grid{display:grid;grid-template-columns:1.25fr repeat(4,minmax(0,1fr));gap:8px;margin-top:18px}.kw-score-device,.kw-score-metric{min-height:112px;border:1px solid rgba(35,48,39,.065);border-radius:18px;padding:15px;background:rgba(255,255,255,.8)}.kw-score-device{background:#26372d;color:#fff}.kw-score-device small,.kw-score-metric small{display:block;font-size:6px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;opacity:.58}.kw-score-device strong{display:block;margin-top:9px;font:600 18px/1.05 Manrope,sans-serif;letter-spacing:-.035em}.kw-score-device span{display:block;margin-top:6px;font-size:7px;line-height:1.45;opacity:.64}.kw-score-metric strong{display:block;margin-top:12px;font:600 23px/1 Manrope,sans-serif;letter-spacing:-.05em;color:#2a392f}.kw-score-metric span{display:block;margin-top:6px;color:#7b857d;font-size:6.5px;line-height:1.4}
  .kw-score-foot{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:13px;padding-top:12px;border-top:1px solid rgba(35,48,39,.07);color:#78827a;font-size:7px;line-height:1.45}
  @media(max-width:950px){.kw-home{grid-template-columns:1fr}.kw-score-grid{grid-template-columns:repeat(2,1fr)}.kw-score-device{grid-column:1/-1}}
  @media(max-width:700px){.kw-home-metrics{grid-template-columns:1fr 1fr}.kw-score{padding:20px;border-radius:23px}.kw-score-head{align-items:flex-start;flex-direction:column}.kw-score-grid{grid-template-columns:1fr 1fr}.kw-score-device{grid-column:1/-1}.kw-score-foot{align-items:flex-start;flex-direction:column}}
  `;document.head.appendChild(s);
}

function recent(rows,days){const min=new Date();min.setDate(min.getDate()-(days-1));min.setHours(0,0,0,0);return rows.filter(r=>new Date(`${r.metric_date}T12:00:00`)>=min)}
function summarize(data){
  const rows7=recent(data.daily,7),rows30=recent(data.daily,30),device=data.device;
  const days=new Set(rows30.map(x=>x.metric_date)).size;
  return {device,steps:avg(rows7,'steps'),active:avg(rows7,'active_minutes'),sleep:avg(rows7,'sleep_minutes'),rhr:avg(rows7,'resting_hr'),coverage:Math.round(days/30*100),days,lastDate:data.daily.at(-1)?.metric_date||null};
}
async function load(force=false){
  if(!force&&cache&&Date.now()-cacheAt<20000)return cache;
  const c=sb(),ctx=window.KomoRuntime?.getContext?.(),session=ctx?.session||(await c.auth.getSession()).data?.session;
  if(!session?.user)return null;
  const from=new Date();from.setDate(from.getDate()-30);
  const [devicesRes,dailyRes]=await Promise.all([
    c.from('wearable_devices').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false}),
    c.from('wearable_daily_metrics').select('*').eq('user_id',session.user.id).gte('metric_date',dayKey(from)).order('metric_date',{ascending:true})
  ]);
  if(devicesRes.error)throw devicesRes.error;if(dailyRes.error)throw dailyRes.error;
  const devices=devicesRes.data||[],device=devices.find(x=>x.status==='active')||devices[0]||null;
  cache={device,daily:dailyRes.data||[]};cacheAt=Date.now();return cache;
}

function statusText(s){if(!s.device)return 'Prêt à connecter';if(!s.lastDate)return 'Appareil enregistré';const d=new Date(`${s.lastDate}T12:00:00`),delta=(Date.now()-d.getTime())/86400000;return delta<2?'Synchronisé':'Synchronisation à reprendre'}
function metric(label,value,unit,caption){return `<div class="kw-home-metric"><small>${label}</small><strong>${value}${unit?` <small style="display:inline;font-size:8px;letter-spacing:0;text-transform:none">${unit}</small>`:''}</strong><span>${caption}</span></div>`}
function scoreMetric(label,value,unit,caption){return `<article class="kw-score-metric"><small>${label}</small><strong>${value}${unit?` <small style="display:inline;font-size:8px;letter-spacing:0;text-transform:none">${unit}</small>`:''}</strong><span>${caption}</span></article>`}

function homeHtml(s){
  const has=!!s.device;
  return `<div class="kw-home" data-kw-home><button class="kw-home-device" type="button" data-kw-open><span class="kw-home-mark">KEY</span><span><small>KŌMØ CONNECTED</small><strong>KŌMØ KEY</strong><span class="meta">${has?'Votre objet de suivi longitudinal':'Le lien discret entre votre quotidien et Pulse'}</span><span class="kw-home-status">● ${statusText(s)}</span></span></button><div class="kw-home-metrics">${metric('Pas · 7 j',fmtInt(s.steps),'','moyenne quotidienne')}${metric('Actif · 7 j',fmtInt(s.active),'min','moyenne quotidienne')}${metric('Sommeil · 7 j',s.sleep==null?'—':fmtDec(s.sleep/60,1),'h','moyenne nocturne')}${metric('FC repos',fmtInt(s.rhr),'bpm','moyenne 7 jours')}</div></div><div class="kw-home-foot"><span>${has?`${s.coverage}% de couverture sur 30 jours · données de suivi non diagnostiques`:'Aucune donnée connectée enregistrée pour le moment.'}</span><button type="button" data-kw-open>${has?'Voir le suivi →':'Configurer KŌMØ KEY →'}</button></div>`;
}
function scoreHtml(s){
  const has=!!s.device;
  return `<section class="kw-score" data-kms-daily-motion><div class="kw-score-head"><div><p class="eyebrow">DAILY MOTION · KŌMØ KEY</p><h2>Votre quotidien complète le bilan.</h2><p>Ces données décrivent votre mouvement, votre activité et votre récupération entre deux évaluations. Elles contextualisent le KŌMØ Score sans modifier son calcul clinique.</p></div><span class="kw-score-badge">Hors calcul du Motion Score</span></div><div class="kw-score-grid"><article class="kw-score-device"><small>KŌMØ CONNECTED</small><strong>KŌMØ KEY</strong><span>${has?`${statusText(s)} · ${s.coverage}% de couverture sur 30 jours`:'Prêt à être connecté à votre espace Pulse.'}</span></article>${scoreMetric('Pas / jour',fmtInt(s.steps),'','moyenne 7 jours')}${scoreMetric('Temps actif',fmtInt(s.active),'min','moyenne 7 jours')}${scoreMetric('Sommeil',s.sleep==null?'—':fmtDec(s.sleep/60,1),'h','moyenne 7 jours')}${scoreMetric('FC repos',fmtInt(s.rhr),'bpm','moyenne 7 jours')}</div><div class="kw-score-foot"><span>${has?`${s.days}/30 jours reçus · dernière donnée ${s.lastDate?new Date(s.lastDate+'T12:00:00').toLocaleDateString('fr-FR'):'—'}`:'Le suivi commencera après la première synchronisation.'}</span><button class="kw-score-link" type="button" data-kw-open>Ouvrir le suivi →</button></div></section>`;
}

function patchHome(s){
  const host=document.querySelector('.kdw-connected');if(!host)return false;
  const head=host.querySelector('.kdw-connected-head');if(head)head.innerHTML='<div><div class="kdw-eyebrow">KŌMØ KEY</div><h3>Votre quotidien, relié à Pulse.</h3><p>Un seul objet KŌMØ pour le suivi longitudinal — sans afficher une collection de marques tierces.</p></div>';
  const grid=host.querySelector('.kdw-connected-grid');if(grid)grid.outerHTML=homeHtml(s);else if(!host.querySelector('[data-kw-home]'))host.insertAdjacentHTML('beforeend',homeHtml(s));
  bind(host);return true;
}
function patchScore(s){
  const page=document.querySelector('.kms-page');if(!page||page.querySelector('[data-kms-daily-motion]'))return !!page;
  const rings=page.querySelector('.kms-rings');if(rings)rings.insertAdjacentHTML('afterend',scoreHtml(s));else page.insertAdjacentHTML('beforeend',scoreHtml(s));bind(page);return true;
}
function bind(root){root.querySelectorAll('[data-kw-open]').forEach(b=>{if(b.dataset.kwBound)return;b.dataset.kwBound='1';b.addEventListener('click',()=>location.hash='followup')})}

async function mount(force=false){
  const r=route();if(!['home','path'].includes(r)||busy)return;busy=true;
  try{ensureStyle();const data=await load(force);if(!data)return;const s=summarize(data);if(r==='home')patchHome(s);if(r==='path')patchScore(s)}catch(e){console.error('[wearable-patient-surfaces]',e)}finally{busy=false}
}
function schedule(force=false){clearTimeout(timer);timer=setTimeout(()=>mount(force),120)}
window.addEventListener('hashchange',()=>schedule(false));
window.addEventListener('komo:route-ready',()=>schedule(false));
window.addEventListener('komo:session-ready',()=>schedule(true));
window.addEventListener('komo:motion-v05-release',()=>schedule(false));
document.querySelector('#refreshButton')?.addEventListener('click',()=>{cache=null;setTimeout(()=>schedule(true),180)});
const root=document.querySelector('#viewRoot');if(root)new MutationObserver(()=>{const r=route();if(r==='home'&&!document.querySelector('[data-kw-home]'))schedule(false);if(r==='path'&&document.querySelector('.kms-page')&&!document.querySelector('[data-kms-daily-motion]'))schedule(false)}).observe(root,{childList:true,subtree:true});
setTimeout(()=>schedule(false),1100);
window.KomoWearablePatientSurfaces={version:VERSION,refresh:()=>{cache=null;return mount(true)}};

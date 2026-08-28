import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER_KEY='komo_pulse_remember';
let client=null,loading=false,renderTimer=null;
const state={session:null,devices:[],daily:[],error:null};

function storage(){return localStorage.getItem(REMEMBER_KEY)==='1'?localStorage:sessionStorage}
function sb(){if(!client)client=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
function avg(rows,key){const vals=rows.map(x=>num(x[key])).filter(v=>v!==null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null}
function fmtInt(v){return v==null?'—':Math.round(v).toLocaleString('fr-FR')}
function fmtDec(v,d=0){return v==null?'—':Number(v).toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:d})}
function pct(v){if(v==null)return '—';const sign=v>0?'+':'';return `${sign}${Math.round(v)}%`}
function localDayKey(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function diffPct(a,b){if(a==null||b==null||b===0)return null;return ((a-b)/b)*100}
function activeDevice(){return state.devices.find(x=>x.status==='active')||state.devices[0]||null}
function daysBack(n){const d=new Date();d.setDate(d.getDate()-n);return localDayKey(d)}
function navIcon(){return '<svg class="kwf-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 17c2.2-5 4.3-8 7-8 2.7 0 3.9 3 6.1 3 1.1 0 2-.6 2.9-1.8"/><circle cx="5" cy="17" r="1.7"/><circle cx="11" cy="9" r="1.7"/><circle cx="17" cy="12" r="1.7"/></svg>'}

function ensureNav(){
  const desktop=document.querySelector('#desktopNav');
  if(desktop&&!desktop.querySelector('[data-route="followup"]')){
    const b=document.createElement('button');b.type='button';b.className='nav-item kwf-nav-extra';b.dataset.route='followup';b.setAttribute('aria-label','Suivi');b.innerHTML=`${navIcon()}<span>Suivi</span>`;
    const path=desktop.querySelector('[data-route="path"]');path?.insertAdjacentElement('afterend',b)||desktop.appendChild(b);
  }
  const mobile=document.querySelector('#mobileNav');
  if(mobile&&!mobile.querySelector('[data-route="followup"]')){
    const b=document.createElement('button');b.type='button';b.className='nav-item kwf-nav-extra';b.dataset.route='followup';b.setAttribute('aria-label','Suivi');b.innerHTML=`${navIcon()}<span>Suivi</span>`;mobile.appendChild(b);
  }
  markActive();
}
function markActive(){if(location.hash!=='#followup')return;document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.route==='followup'))}

async function load(){
  if(loading)return;loading=true;state.error=null;
  try{
    const {data:{session}}=await sb().auth.getSession();state.session=session;if(!session?.user)throw new Error('Session Pulse introuvable.');
    const [devicesRes,dailyRes]=await Promise.all([
      sb().from('wearable_devices').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false}),
      sb().from('wearable_daily_metrics').select('*').eq('user_id',session.user.id).gte('metric_date',daysBack(90)).order('metric_date',{ascending:true})
    ]);
    if(devicesRes.error)throw devicesRes.error;if(dailyRes.error)throw dailyRes.error;
    state.devices=devicesRes.data||[];state.daily=dailyRes.data||[];
  }catch(e){state.error=e.message||'Impossible de charger le suivi.'}finally{loading=false}
}

function recentRows(days,offset=0){
  const end=new Date();end.setDate(end.getDate()-offset);end.setHours(23,59,59,999);
  const start=new Date(end);start.setDate(start.getDate()-(days-1));start.setHours(0,0,0,0);
  return state.daily.filter(x=>{const d=new Date(`${x.metric_date}T12:00:00`);return d>=start&&d<=end});
}
function metric(label,value,unit,delta){const cls=delta==null?'':delta>=0?'up':'down';return `<article class="kwf-metric"><span>${esc(label)}</span><strong>${esc(value)}${unit?` <small>${esc(unit)}</small>`:''}</strong><small class="${cls}">${delta==null?'7 derniers jours':`${pct(delta)} vs 7 j précédents`}</small></article>`}
function chart(){
  const rows=recentRows(14);if(!rows.length)return '<div class="kwf-note">Les premières courbes apparaîtront dès que des données auront été importées.</div>';
  const map=new Map(rows.map(x=>[x.metric_date,num(x.steps)||0])),days=[];
  for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=localDayKey(d);days.push({date:k,value:map.get(k)||0})}
  const max=Math.max(1,...days.map(x=>x.value));
  return `<div class="kwf-chart">${days.map(x=>`<i class="kwf-bar" style="height:${Math.max(3,(x.value/max)*100)}%" data-label="${new Date(x.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})} · ${fmtInt(x.value)} pas"></i>`).join('')}</div>`;
}
function empty(){return `<section class="kwf-card kwf-empty"><div class="kwf-empty-inner"><div class="kwf-empty-icon">KEY</div><p class="kwf-kicker">KŌMØ · CONNECTED FOLLOW-UP</p><h2>Votre suivi quotidien commence ici.</h2><p>Enregistrez le Xiaomi de développement puis importez les premières données. Cette couche est indépendante du Motion Score et sert uniquement à suivre votre trajectoire dans le temps.</p><div class="kwf-actions" style="justify-content:center"><button class="kwf-btn" id="kwfRegister">Enregistrer le Xiaomi test</button><button class="kwf-btn secondary" id="kwfTemplate">Télécharger le modèle CSV</button></div></div></section>`}
function devicePanel(device){
  if(!device)return '';
  return `<section class="kwf-card kwf-hero-side"><div class="kwf-device-dot">KEY</div><p class="kwf-kicker">APPAREIL ACTIF</p><h3>${esc(device.display_name||device.model||'Appareil connecté')}</h3><p>${esc(device.provider==='xiaomi'?'Xiaomi · prototype de développement':'Source connectée')}<br>Dernière synchro : ${device.last_sync_at?new Date(device.last_sync_at).toLocaleString('fr-FR'):'pas encore synchronisé'}</p><div class="kwf-actions"><button class="kwf-btn" id="kwfImport">Importer CSV</button><button class="kwf-btn secondary" id="kwfTemplate">Modèle CSV</button></div><div class="kwf-import-panel"><strong style="font-size:10px;color:#344138">Format accepté</strong><p style="margin-top:7px">date, steps, distance_m, active_minutes, sedentary_minutes, resting_hr, avg_hr, hrv_ms, spo2_avg, sleep_minutes, wear_minutes</p><input id="kwfFile" type="file" accept=".csv,text/csv"></div><div class="kwf-status" id="kwfStatus"></div></section>`;
}
function mainView(){
  const device=activeDevice();if(!device)return empty();
  const last7=recentRows(7),prev7=recentRows(7,7),last30=recentRows(30);
  const steps=avg(last7,'steps'),stepsPrev=avg(prev7,'steps');
  const active=avg(last7,'active_minutes'),activePrev=avg(prev7,'active_minutes');
  const sleep=avg(last7,'sleep_minutes'),sleepPrev=avg(prev7,'sleep_minutes');
  const rhr=avg(last7,'resting_hr'),rhrPrev=avg(prev7,'resting_hr');
  const daysReceived=new Set(last30.map(x=>x.metric_date)).size,coverage=Math.round((daysReceived/30)*100);
  const rhrTrend=rhr==null||rhrPrev==null?null:-diffPct(rhr,rhrPrev);
  return `<div class="kwf"><section class="kwf-hero"><article class="kwf-card kwf-hero-main"><div><p class="kwf-kicker">KŌMØ · DAILY FOLLOW-UP</p><h2>Votre trajectoire,<br>entre deux bilans.</h2><p>Activité, récupération et sommeil sont suivis dans le temps pour objectiver les habitudes quotidiennes. Ces données connectées n'entrent jamais dans le calcul du Motion Score.</p></div><div class="kwf-badges"><span class="kwf-badge">● ${coverage}% de couverture · 30 j</span><span class="kwf-badge">Source · ${esc(device.model||device.provider)}</span><span class="kwf-badge">Consumer wearable</span></div></article>${devicePanel(device)}</section><section class="kwf-grid">${metric('Pas / jour',fmtInt(steps),'',diffPct(steps,stepsPrev))}${metric('Temps actif',fmtInt(active),'min',diffPct(active,activePrev))}${metric('Sommeil',sleep==null?'—':fmtDec(sleep/60,1),'h',diffPct(sleep,sleepPrev))}${metric('FC repos',fmtDec(rhr,0),'bpm',rhrTrend)}</section><section class="kwf-layout"><article class="kwf-card"><div class="kwf-section-head"><div><p class="kwf-kicker">MOUVEMENT</p><h3>14 derniers jours</h3></div><p>Moyenne 7 j · ${fmtInt(steps)} pas</p></div>${chart()}</article><aside class="kwf-card"><div class="kwf-section-head"><div><p class="kwf-kicker">QUALITÉ DES DONNÉES</p><h3>Suivi connecté</h3></div></div><div class="kwf-list"><div class="kwf-row"><span>Couverture 30 jours</span><strong>${coverage}%</strong></div><div class="kwf-row"><span>Jours reçus</span><strong>${daysReceived}/30</strong></div><div class="kwf-row"><span>Dernière donnée</span><strong>${state.daily.at(-1)?.metric_date?new Date(state.daily.at(-1).metric_date+'T12:00:00').toLocaleDateString('fr-FR'):'—'}</strong></div><div class="kwf-row"><span>Utilisé pour le Motion Score</span><strong>Non</strong></div></div><div class="kwf-note" style="margin-top:18px">Pulse conserve la source de chaque mesure. Les données de wearable restent distinctes des acquisitions instrumentées et des résultats cliniques.</div></aside></section></div>`;
}

async function render(){
  if(location.hash!=='#followup')return;
  ensureNav();const root=document.querySelector('#viewRoot');if(!root)return;
  const eyebrow=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');if(eyebrow)eyebrow.textContent='KŌMØ · SUIVI';if(title)title.textContent='Votre quotidien, dans le temps.';
  root.innerHTML='<div class="kwf-loading">Chargement du suivi…</div>';await load();if(location.hash!=='#followup')return;
  root.innerHTML=state.error?`<div class="kwf-card kwf-note">${esc(state.error)}</div>`:mainView();bind();markActive();
}
function schedule(){clearTimeout(renderTimer);renderTimer=setTimeout(render,130)}

async function registerXiaomi(){
  const button=document.querySelector('#kwfRegister');if(button)button.disabled=true;
  try{
    const {data:{session}}=await sb().auth.getSession();if(!session?.user)throw new Error('Connectez-vous à Pulse.');
    const existing=state.devices.find(x=>x.provider==='xiaomi'&&x.model==='Smart Band 9 Active'&&x.status==='active');
    if(existing){await render();return}
    const {error}=await sb().from('wearable_devices').insert({user_id:session.user.id,provider:'xiaomi',model:'Smart Band 9 Active',display_name:'Xiaomi test · prototype KŌMØ',source_adapter:'mi_fitness_import',paired_at:new Date().toISOString(),metadata:{purpose:'KOMO wearable prototype V0'}});if(error)throw error;await render();
  }catch(e){window.alert(e.message||'Enregistrement impossible.')}finally{if(button)button.disabled=false}
}
function downloadTemplate(){
  const text='date,steps,distance_m,active_minutes,sedentary_minutes,resting_hr,avg_hr,hrv_ms,spo2_avg,sleep_minutes,wear_minutes\n2026-08-29,7200,5300,62,410,58,74,42,97,438,1180\n';
  const blob=new Blob([text],{type:'text/csv;charset=utf-8'}),href=window.URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download='komo-followup-template.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>window.URL.revokeObjectURL(href),500);
}
function splitCsvLine(line,sep){const out=[];let quoted=false,current='';for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){quoted=!quoted;continue}if(c===sep&&!quoted){out.push(current.trim());current='';continue}current+=c}out.push(current.trim());return out}
function parseCsv(text){
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());if(lines.length<2)throw new Error('CSV vide.');
  const sep=(lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?';':',';
  const headers=splitCsvLine(lines[0],sep).map(x=>x.trim().toLowerCase());
  const allowed=['date','steps','distance_m','active_minutes','sedentary_minutes','resting_hr','avg_hr','hrv_ms','spo2_avg','sleep_minutes','deep_sleep_minutes','rem_sleep_minutes','wear_minutes'];
  if(!headers.includes('date'))throw new Error('La colonne date est obligatoire.');
  return lines.slice(1).map(line=>{const values=splitCsvLine(line,sep),row={};headers.forEach((h,i)=>{if(!allowed.includes(h))return;const raw=values[i]??'';row[h]=h==='date'?raw.trim():(raw.trim()===''?null:Number(raw.trim().replace(',','.')))});return row}).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.date));
}
async function importCsv(file){
  const status=document.querySelector('#kwfStatus');
  try{
    if(status)status.textContent='Import en cours…';const rows=parseCsv(await file.text()),device=activeDevice();if(!device)throw new Error('Aucun appareil actif.');
    const userId=state.session?.user?.id;if(!userId)throw new Error('Session absente.');
    const payload=rows.map(r=>({user_id:userId,device_id:device.id,metric_date:r.date,steps:r.steps,distance_m:r.distance_m,active_minutes:r.active_minutes,sedentary_minutes:r.sedentary_minutes,resting_hr:r.resting_hr,avg_hr:r.avg_hr,hrv_ms:r.hrv_ms,spo2_avg:r.spo2_avg,sleep_minutes:r.sleep_minutes,deep_sleep_minutes:r.deep_sleep_minutes,rem_sleep_minutes:r.rem_sleep_minutes,wear_minutes:r.wear_minutes,source:'manual_import',source_quality:'consumer_wearable'}));
    if(!payload.length)throw new Error('Aucune ligne exploitable.');
    const {error}=await sb().from('wearable_daily_metrics').upsert(payload,{onConflict:'user_id,device_id,metric_date,source'});if(error)throw error;
    await sb().from('wearable_devices').update({last_sync_at:new Date().toISOString()}).eq('id',device.id);if(status)status.textContent=`${payload.length} jour(s) importé(s).`;await render();
  }catch(e){if(status)status.textContent=e.message||'Import impossible.'}
}
function bind(){
  document.querySelector('#kwfRegister')?.addEventListener('click',registerXiaomi);
  document.querySelectorAll('#kwfTemplate').forEach(b=>b.addEventListener('click',downloadTemplate));
  const importButton=document.querySelector('#kwfImport'),file=document.querySelector('#kwfFile');importButton?.addEventListener('click',()=>file?.click());file?.addEventListener('change',()=>{if(file.files?.[0])importCsv(file.files[0])});
}

window.addEventListener('hashchange',schedule);
document.addEventListener('DOMContentLoaded',()=>{setTimeout(ensureNav,800);if(location.hash==='#followup')schedule()});
const observer=new MutationObserver(()=>{ensureNav();if(location.hash==='#followup'&&!document.querySelector('.kwf')&&!loading)schedule()});observer.observe(document.body,{subtree:true,childList:true});
setTimeout(ensureNav,1400);
window.KomoWearableFollowup={version:'2.0.0',refresh:render};
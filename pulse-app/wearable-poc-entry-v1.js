import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER_KEY='komo_pulse_remember';
const VERSION='1.0.0';
let client=null,timer=null,busy=false;

const storage=()=>localStorage.getItem(REMEMBER_KEY)==='1'?localStorage:sessionStorage;
const sb=()=>window.KomoRuntime?.client||(client||(client=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})));
const route=()=>location.hash.replace(/^#/,'')||'home';
const dayKey=(d=new Date())=>{const x=new Date(d),y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),dd=String(x.getDate()).padStart(2,'0');return `${y}-${m}-${dd}`};
const value=id=>{const raw=document.querySelector(`#${id}`)?.value?.trim();if(!raw)return null;const n=Number(raw.replace(',','.'));return Number.isFinite(n)?n:null};

function ensureStyle(){
  if(document.querySelector('#kwpocStyle'))return;
  const s=document.createElement('style');s.id='kwpocStyle';s.textContent=`
    .kwpoc-open{white-space:nowrap}
    .kwpoc{margin:10px 0 0;padding:22px;border:1px solid rgba(35,48,39,.08);border-radius:24px;background:linear-gradient(145deg,#fff,#f5f2ea);box-shadow:0 12px 34px rgba(35,48,39,.035)}
    .kwpoc[hidden]{display:none!important}.kwpoc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.kwpoc-head p{margin:0;color:#78827b;font-size:8px;line-height:1.55}.kwpoc-head h3{margin:5px 0 6px;font:600 20px/1.05 Manrope,'DM Sans',sans-serif;letter-spacing:-.04em;color:#26372d}.kwpoc-kicker{font-size:6px!important;font-weight:800!important;letter-spacing:.14em;text-transform:uppercase;color:#6f7e74!important}.kwpoc-close{border:0;background:#ece9e1;width:31px;height:31px;border-radius:12px;color:#4d5f53;cursor:pointer}
    .kwpoc-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:18px}.kwpoc-field{display:grid;gap:6px}.kwpoc-field label{font-size:6.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#748078}.kwpoc-field input{width:100%;box-sizing:border-box;border:1px solid rgba(35,48,39,.09);border-radius:13px;background:#fff;padding:11px 12px;font:600 13px/1 Manrope,'DM Sans',sans-serif;color:#26372d;outline:none}.kwpoc-field input:focus{border-color:#6f8774;box-shadow:0 0 0 3px rgba(111,135,116,.09)}
    .kwpoc-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px;padding-top:14px;border-top:1px solid rgba(35,48,39,.07)}.kwpoc-note{max-width:620px;color:#7a847d;font-size:7px;line-height:1.5}.kwpoc-actions{display:flex;gap:8px}.kwpoc-btn{border:0;border-radius:13px;padding:11px 15px;background:#26372d;color:#fff;font:800 7px/1 'DM Sans',sans-serif;letter-spacing:.05em;cursor:pointer}.kwpoc-btn.secondary{background:#e8e6df;color:#526258}.kwpoc-btn:disabled{opacity:.45;cursor:default}.kwpoc-status{margin-top:10px;min-height:16px;color:#51675a;font-size:7px;font-weight:700}
    @media(max-width:920px){.kwpoc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.kwpoc{padding:18px}.kwpoc-grid{grid-template-columns:1fr 1fr}.kwpoc-foot{align-items:flex-start;flex-direction:column}.kwpoc-actions{width:100%}.kwpoc-btn{flex:1}}@media(max-width:420px){.kwpoc-grid{grid-template-columns:1fr}}
  `;document.head.appendChild(s);
}

function panelHtml(){return `<section class="kwpoc" id="kwpocPanel" hidden>
  <div class="kwpoc-head"><div><p class="kwpoc-kicker">KŌMØ KEY · MODE POC</p><h3>Ajouter les données du jour.</h3><p>Pour le premier test, recopiez simplement les valeurs visibles dans Mi Fitness. Laissez vide ce que le Xiaomi ne fournit pas. Les données sont enregistrées dans le suivi longitudinal et restent hors calcul du Motion Score.</p></div><button class="kwpoc-close" id="kwpocClose" type="button">×</button></div>
  <div class="kwpoc-grid">
    <div class="kwpoc-field"><label>Date</label><input id="kwpocDate" type="date" value="${dayKey()}"></div>
    <div class="kwpoc-field"><label>Pas</label><input id="kwpocSteps" type="number" min="0" placeholder="7842"></div>
    <div class="kwpoc-field"><label>Distance · km</label><input id="kwpocDistance" type="number" min="0" step="0.01" placeholder="5.4"></div>
    <div class="kwpoc-field"><label>Temps actif · min</label><input id="kwpocActive" type="number" min="0" placeholder="68"></div>
    <div class="kwpoc-field"><label>Sédentaire · min</label><input id="kwpocSedentary" type="number" min="0" placeholder="410"></div>
    <div class="kwpoc-field"><label>FC repos · bpm</label><input id="kwpocRhr" type="number" min="0" placeholder="58"></div>
    <div class="kwpoc-field"><label>FC moyenne · bpm</label><input id="kwpocAvgHr" type="number" min="0" placeholder="74"></div>
    <div class="kwpoc-field"><label>SpO₂ moyenne · %</label><input id="kwpocSpo2" type="number" min="0" max="100" step="0.1" placeholder="97"></div>
    <div class="kwpoc-field"><label>Sommeil · heures</label><input id="kwpocSleep" type="number" min="0" step="0.1" placeholder="7.3"></div>
    <div class="kwpoc-field"><label>Sommeil profond · min</label><input id="kwpocDeep" type="number" min="0" placeholder="82"></div>
    <div class="kwpoc-field"><label>REM · min</label><input id="kwpocRem" type="number" min="0" placeholder="96"></div>
    <div class="kwpoc-field"><label>Temps porté · h</label><input id="kwpocWear" type="number" min="0" max="24" step="0.1" placeholder="13.5"></div>
  </div>
  <div class="kwpoc-foot"><div class="kwpoc-note">Demain soir, les données de journée suffisent déjà : pas, distance et temps actif. Les données sommeil seront ajoutées après la première nuit avec le module au poignet.</div><div class="kwpoc-actions"><button class="kwpoc-btn secondary" id="kwpocLoad" type="button">Recharger le jour</button><button class="kwpoc-btn" id="kwpocSave" type="button">Enregistrer dans Pulse</button></div></div>
  <div class="kwpoc-status" id="kwpocStatus"></div>
</section>`}

function ensurePanel(){
  if(route()!=='followup')return;
  ensureStyle();
  const hero=document.querySelector('.kwf-hero');if(!hero)return;
  const deviceSide=hero.querySelector('.kwf-hero-side');if(!deviceSide)return;
  if(!deviceSide.querySelector('#kwpocOpen')){
    const actions=deviceSide.querySelector('.kwf-actions');
    const b=document.createElement('button');b.type='button';b.id='kwpocOpen';b.className='kwf-btn secondary kwpoc-open';b.textContent='Saisie rapide POC';actions?.appendChild(b);
  }
  if(!document.querySelector('#kwpocPanel'))hero.insertAdjacentHTML('afterend',panelHtml());
  bind();
}

async function context(){
  const c=sb(),session=(window.KomoRuntime?.getContext?.()?.session)||(await c.auth.getSession()).data?.session;if(!session?.user)throw new Error('Session Pulse introuvable.');
  const {data,error}=await c.from('wearable_devices').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false});if(error)throw error;
  const devices=data||[],device=devices.find(x=>x.status==='active')||devices[0];if(!device)throw new Error('Enregistrez d’abord le Xiaomi test.');return {c,session,device};
}

function put(id,v){const el=document.querySelector(`#${id}`);if(el)el.value=v??''}
async function loadDay(){
  const status=document.querySelector('#kwpocStatus');try{if(status)status.textContent='Lecture…';const {c,session,device}=await context(),date=document.querySelector('#kwpocDate')?.value||dayKey();const {data,error}=await c.from('wearable_daily_metrics').select('*').eq('user_id',session.user.id).eq('device_id',device.id).eq('metric_date',date).order('created_at',{ascending:false}).limit(1).maybeSingle();if(error)throw error;if(!data){if(status)status.textContent='Aucune donnée enregistrée pour cette date.';return}
    put('kwpocSteps',data.steps);put('kwpocDistance',data.distance_m==null?'':Number(data.distance_m)/1000);put('kwpocActive',data.active_minutes);put('kwpocSedentary',data.sedentary_minutes);put('kwpocRhr',data.resting_hr);put('kwpocAvgHr',data.avg_hr);put('kwpocSpo2',data.spo2_avg);put('kwpocSleep',data.sleep_minutes==null?'':(Number(data.sleep_minutes)/60).toFixed(1));put('kwpocDeep',data.deep_sleep_minutes);put('kwpocRem',data.rem_sleep_minutes);put('kwpocWear',data.wear_minutes==null?'':(Number(data.wear_minutes)/60).toFixed(1));if(status)status.textContent='Valeurs chargées.';
  }catch(e){if(status)status.textContent=e.message||'Lecture impossible.'}
}

async function save(){
  if(busy)return;busy=true;const button=document.querySelector('#kwpocSave'),status=document.querySelector('#kwpocStatus');if(button)button.disabled=true;
  try{
    if(status)status.textContent='Enregistrement…';const {c,session,device}=await context(),date=document.querySelector('#kwpocDate')?.value||dayKey();
    const sleep=value('kwpocSleep'),wear=value('kwpocWear'),distance=value('kwpocDistance');
    const payload={user_id:session.user.id,device_id:device.id,metric_date:date,steps:value('kwpocSteps'),distance_m:distance==null?null:Math.round(distance*1000),active_minutes:value('kwpocActive'),sedentary_minutes:value('kwpocSedentary'),resting_hr:value('kwpocRhr'),avg_hr:value('kwpocAvgHr'),spo2_avg:value('kwpocSpo2'),sleep_minutes:sleep==null?null:Math.round(sleep*60),deep_sleep_minutes:value('kwpocDeep'),rem_sleep_minutes:value('kwpocRem'),wear_minutes:wear==null?null:Math.round(wear*60),source:'manual_poc',source_quality:'consumer_wearable'};
    const meaningful=['steps','distance_m','active_minutes','resting_hr','avg_hr','spo2_avg','sleep_minutes'].some(k=>payload[k]!=null);if(!meaningful)throw new Error('Ajoutez au moins une donnée utile.');
    const {error}=await c.from('wearable_daily_metrics').upsert(payload,{onConflict:'user_id,device_id,metric_date,source'});if(error)throw error;await c.from('wearable_devices').update({last_sync_at:new Date().toISOString()}).eq('id',device.id);
    if(status)status.textContent='✓ Données enregistrées. Accueil, Suivi et KŌMØ Score peuvent maintenant les afficher.';
    window.KomoWearableFollowup?.refresh?.();window.KomoWearablePatientSurfaces?.refresh?.();window.dispatchEvent(new CustomEvent('komo:wearable-data-updated',{detail:{date,deviceId:device.id}}));
  }catch(e){if(status)status.textContent=e.message||'Enregistrement impossible.'}finally{busy=false;if(button)button.disabled=false}
}

function bind(){
  const open=document.querySelector('#kwpocOpen');if(open&&!open.dataset.bound){open.dataset.bound='1';open.addEventListener('click',()=>{const p=document.querySelector('#kwpocPanel');if(p){p.hidden=false;p.scrollIntoView({behavior:'smooth',block:'start'})}})}
  const close=document.querySelector('#kwpocClose');if(close&&!close.dataset.bound){close.dataset.bound='1';close.addEventListener('click',()=>{document.querySelector('#kwpocPanel').hidden=true})}
  const saveBtn=document.querySelector('#kwpocSave');if(saveBtn&&!saveBtn.dataset.bound){saveBtn.dataset.bound='1';saveBtn.addEventListener('click',save)}
  const loadBtn=document.querySelector('#kwpocLoad');if(loadBtn&&!loadBtn.dataset.bound){loadBtn.dataset.bound='1';loadBtn.addEventListener('click',loadDay)}
}
function schedule(){clearTimeout(timer);timer=setTimeout(ensurePanel,100)}
window.addEventListener('hashchange',schedule);window.addEventListener('komo:route-ready',schedule);window.addEventListener('komo:wearable-data-updated',()=>setTimeout(schedule,180));
const root=document.querySelector('#viewRoot');if(root)new MutationObserver(()=>{if(route()==='followup'&&!document.querySelector('#kwpocOpen'))schedule()}).observe(root,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,900));setTimeout(schedule,1300);
window.KomoWearablePocEntry={version:VERSION,refresh:ensurePanel};

import { loadCanonicalResult } from './canonical-result-runtime.js';

const VERSION='1.1.0';
let timer=0;
let rendering=false;
let lastSignature='';

const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const txt=el=>el?.textContent?.replace(/\s+/g,' ')?.trim()||'';
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const dayKey=v=>{const d=new Date(v);const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return`${d.getFullYear()}-${m}-${day}`};
const dayDate=v=>new Date(`${v}T12:00:00`);
const addDays=(v,d)=>{const x=new Date(v);x.setDate(x.getDate()+d);return x};
const fmtNumber=(v,d=0)=>v===null||v===undefined?'—':Number(v).toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:d});
const fmtSleep=min=>min===null?'—':`${Math.floor(min/60)} h ${String(Math.round(min%60)).padStart(2,'0')}`;
const firstName=()=>{const full=txt(document.querySelector('[data-my-komo-home] .mykomo-identity h2'));return full&&full!=='My KŌMØ'?full.split(/\s+/)[0]:''};

function go(target){
  if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go(target);
  else location.hash=target;
}
function currentAppointment(){
  const box=document.querySelector('.mykomo-next');
  const title=txt(box?.querySelector('strong'))||'Aucun rendez-vous planifié';
  const meta=txt(box?.querySelector('small'))||'Vous pourrez planifier votre prochaine étape depuis Pulse.';
  return{title,meta,exists:title!=='Aucun rendez-vous planifié'};
}
function motionStatus(result){
  const s=String(result?.score?.release_status||result?.score?.status||'').toLowerCase();
  if(['released','published'].includes(s))return{label:'PUBLIÉ',tone:'ok'};
  if(['clinician_reviewed','validated','reviewed'].includes(s))return{label:'VALIDÉ',tone:'ok'};
  if(result?.score?.motion_score!==null&&result?.score?.motion_score!==undefined)return{label:'EN REVUE',tone:'review'};
  return{label:'À FAIRE',tone:'pending'};
}
function scoreValue(result){const v=n(result?.score?.motion_score);return v===null?null:Math.round(v)}
function metricCount(row){return['steps','distance_m','active_minutes','sleep_minutes','resting_hr','avg_hr','hrv_ms','spo2_avg','wear_minutes'].reduce((a,k)=>a+(n(row?.[k])!==null?1:0),0)}
function dedupe(rows){
  const map=new Map();
  for(const row of rows||[]){
    const key=row.metric_date;if(!key)continue;
    const prev=map.get(key);
    if(!prev||metricCount(row)>metricCount(prev)||String(row.updated_at||'')>String(prev.updated_at||''))map.set(key,row);
  }
  return[...map.values()].sort((a,b)=>String(b.metric_date).localeCompare(String(a.metric_date)));
}
function avg(rows,key){const vals=rows.map(r=>n(r[key])).filter(v=>v!==null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null}
function pctDelta(cur,prev){if(cur===null||prev===null||prev===0)return null;return((cur-prev)/Math.abs(prev))*100}
function windowRows(rows,anchor,startOffset,endOffset){
  const start=dayKey(addDays(anchor,startOffset)),end=dayKey(addDays(anchor,endOffset));
  return rows.filter(r=>r.metric_date>=start&&r.metric_date<=end);
}
function buildWearable(rows,active){
  const clean=dedupe(rows);
  if(!clean.length)return{active,has:false,currentDays:0,coverage:0,currentAvg:{},changes:{},latest:null};
  const latest=clean[0],anchor=dayDate(latest.metric_date);
  const current=windowRows(clean,anchor,-6,0),previous=windowRows(clean,anchor,-13,-7);
  const currentDays=new Set(current.map(r=>r.metric_date)).size;
  const currentAvg={steps:avg(current,'steps'),active:avg(current,'active_minutes'),sleep:avg(current,'sleep_minutes'),rhr:avg(current,'resting_hr')};
  const previousAvg={steps:avg(previous,'steps'),active:avg(previous,'active_minutes'),sleep:avg(previous,'sleep_minutes'),rhr:avg(previous,'resting_hr')};
  return{active,has:true,currentDays,coverage:Math.round(currentDays/7*100),currentAvg,latest,changes:{steps:pctDelta(currentAvg.steps,previousAvg.steps),active:pctDelta(currentAvg.active,previousAvg.active),sleep:pctDelta(currentAvg.sleep,previousAvg.sleep),rhr:pctDelta(currentAvg.rhr,previousAvg.rhr)}};
}
async function loadWearable(){
  const sb=window.KomoRuntime?.client;
  if(!sb)return buildWearable([],false);
  try{
    const session=window.KomoRuntime?.getContext?.()?.session||(await sb.auth.getSession()).data?.session;
    if(!session?.user)return buildWearable([],false);
    const from=new Date();from.setDate(from.getDate()-35);
    const [consentRes,dataRes]=await Promise.all([
      sb.from('wearable_consents').select('status').eq('user_id',session.user.id).eq('purpose','connected_followup').order('consented_at',{ascending:false}).limit(1).maybeSingle(),
      sb.from('wearable_daily_metrics').select('metric_date,steps,active_minutes,sleep_minutes,resting_hr,source,updated_at').eq('user_id',session.user.id).gte('metric_date',dayKey(from)).order('metric_date',{ascending:false}).order('updated_at',{ascending:false}).limit(120)
    ]);
    const active=!consentRes.error&&consentRes.data?.status==='active';
    return buildWearable(dataRes.error?[]:(dataRes.data||[]),active);
  }catch(e){console.warn('[home-v1 wearable]',e);return buildWearable([],false)}
}
function statusChip(label,tone='neutral'){return`<span class="khv-status ${tone}"><i></i>${esc(label)}</span>`}
function trendSentence(result,wearable){
  const motion=scoreValue(result);
  const motionDelta=n(result?.score?.delta_from_previous??result?.score?.motion_delta);
  if(motion!==null&&motionDelta!==null){
    if(Math.abs(motionDelta)<1)return'Votre Motion Score est stable par rapport à la référence précédente.';
    return`Votre Motion Score est ${motionDelta>0?'en hausse':'en baisse'} de ${Math.abs(Math.round(motionDelta))} point${Math.abs(Math.round(motionDelta))>1?'s':''}.`;
  }
  if(wearable?.currentDays>=4&&n(wearable?.changes?.steps)!==null){
    const d=Math.round(Number(wearable.changes.steps));
    if(Math.abs(d)<3)return'Votre niveau d’activité observé est globalement stable cette semaine.';
    return`Votre activité observée est ${d>0?'plus élevée':'plus basse'} d’environ ${Math.abs(d)} % que la semaine précédente.`;
  }
  return'Une évolution apparaîtra dès que deux références comparables seront disponibles.';
}
function nextAction(result,appt,wearable){
  const motion=scoreValue(result),status=motionStatus(result);
  if(motion===null)return{title:'Compléter votre première référence Motion',copy:'C’est elle qui permettra d’établir votre état locomoteur de départ.',button:'Continuer mon bilan',route:'motion'};
  if(status.label==='EN REVUE')return{title:'Votre bilan est en cours de validation',copy:'Le résultat final apparaîtra ici dès qu’il sera validé pour restitution.',button:'Voir l’état du bilan',route:'results'};
  if(wearable.active&&!wearable.has)return{title:'Commencer votre continuité KEY',copy:'Quelques jours de données permettront de replacer votre bilan dans votre quotidien.',button:'Ouvrir KEY',route:'key'};
  if(appt.exists)return{title:'Préparer votre prochaine étape',copy:'Votre dernier résultat est disponible et votre prochain rendez-vous est déjà planifié.',button:'Voir mon rendez-vous',route:'agenda'};
  return{title:'Lire votre dernier bilan',copy:'Retrouvez votre Motion Score, son interprétation validée et les priorités qui en découlent.',button:'Voir mon bilan',route:'results'};
}
function openKomo(){
  const launcher=document.querySelector('#komoOperatorLauncher');
  if(launcher&&!launcher.hidden)launcher.click();
  else window.dispatchEvent(new CustomEvent('komo:operator-open'));
}
function html(result,wearable){
  const motion=scoreValue(result),mStatus=motionStatus(result),appt=currentAppointment();
  const action=nextAction(result,appt,wearable);
  const greeting=firstName()?`Bonjour ${esc(firstName())}.`:'Bonjour.';
  const today=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  const keyValue=wearable.active?(wearable.has?`${wearable.currentDays}/7`:'Prêt'):'Non activé';
  const keyTone=wearable.active&&wearable.has?'ok':wearable.active?'review':'pending';
  const keyCopy=wearable.active&&wearable.has?`${wearable.coverage}% de la semaine observée. Ces données replacent votre bilan dans votre vie réelle.`:wearable.active?'Les premières données apparaîtront ici après synchronisation.':'KEY ajoute vos données du quotidien uniquement si vous choisissez de l’activer.';
  const motionCopy=motion===null?'Votre bilan Motion n’est pas encore disponible. Il donnera une référence globale de votre capacité locomotrice.':'Votre Motion Score résume votre capacité locomotrice globale sur une échelle de 0 à 100.';
  const nextTitle=appt.exists?appt.title:'Aucun rendez-vous planifié';
  const nextCopy=appt.exists?appt.meta:'Votre prochaine consultation ou réévaluation apparaîtra ici dès qu’elle sera planifiée.';
  const changes=trendSentence(result,wearable);
  const latest=wearable.latest||{};
  const daily=wearable.has?`<div class="khv-daily"><span><small>Activité moyenne</small><strong>${wearable.currentAvg.steps==null?'—':fmtNumber(wearable.currentAvg.steps)} <em>pas/j</em></strong></span><span><small>Temps actif</small><strong>${wearable.currentAvg.active==null?'—':fmtNumber(wearable.currentAvg.active)} <em>min/j</em></strong></span><span><small>Sommeil</small><strong>${wearable.currentAvg.sleep==null?'—':fmtSleep(wearable.currentAvg.sleep)}</strong></span><span><small>FC repos</small><strong>${wearable.currentAvg.rhr==null?'—':fmtNumber(wearable.currentAvg.rhr)} <em>bpm</em></strong></span></div>`:'';
  return`<section class="khv" data-khome-datawall>
    <header class="khv-head"><div><span>KŌMØ PULSE · AUJOURD’HUI</span><h2>${greeting}</h2><p>${today.charAt(0).toUpperCase()+today.slice(1)} · en venant ici, vous devez comprendre votre situation en moins d’une minute.</p></div><button class="khv-komo" type="button" data-khv-komo><span aria-hidden="true">ōø</span><strong>Demander à Komo</strong></button></header>

    <section class="khv-promise" aria-label="Ce que Pulse vous donne"><div><b>01</b><span><strong>Votre état</strong><small>Où en est votre mobilité aujourd’hui.</small></span></div><div><b>02</b><span><strong>Votre évolution</strong><small>Ce qui change entre deux références comparables.</small></span></div><div><b>03</b><span><strong>Votre prochaine étape</strong><small>Ce qui mérite réellement votre attention maintenant.</small></span></div></section>

    <article class="khv-action"><div class="khv-action-copy"><span>À FAIRE MAINTENANT</span><h3>${esc(action.title)}</h3><p>${esc(action.copy)}</p><button type="button" data-khv-route="${esc(action.route)}">${esc(action.button)} <b>→</b></button></div><div class="khv-action-mark" aria-hidden="true"><span>ō</span><span>ø</span></div></article>

    <div class="khv-grid">
      <article class="khv-card khv-motion"><header><div><span>MOTION</span><h3>Votre état locomoteur</h3></div>${statusChip(mStatus.label,mStatus.tone)}</header><div class="khv-value"><strong>${motion??'—'}</strong>${motion!==null?'<small>/100</small>':''}</div><p>${esc(motionCopy)}</p><button type="button" data-khv-route="results">Comprendre mon résultat →</button></article>

      <article class="khv-card"><header><div><span>ÉVOLUTION</span><h3>Ce qui a changé</h3></div></header><div class="khv-change"><i>↗</i><strong>${esc(changes)}</strong></div><p>Pulse compare uniquement des données réellement observées. Aucun jour manquant n’est inventé.</p><button type="button" data-khv-route="trajectory">Voir ma trajectoire →</button></article>

      <article class="khv-card"><header><div><span>KEY</span><h3>Votre quotidien</h3></div>${statusChip(keyValue,keyTone)}</header><div class="khv-key-value"><strong>${esc(keyValue)}</strong><small>${wearable.has?'jours observés':'statut'}</small></div><p>${esc(keyCopy)}</p><button type="button" data-khv-route="key">Voir KEY →</button></article>

      <article class="khv-card"><header><div><span>PROCHAINE ÉTAPE</span><h3>Votre rendez-vous</h3></div></header><div class="khv-next"><strong>${esc(nextTitle)}</strong><small>${esc(nextCopy)}</small></div><p>Pulse doit toujours vous laisser savoir ce qui vient ensuite, sans vous obliger à chercher dans les menus.</p><button type="button" data-khv-route="agenda">Voir mon agenda →</button></article>
    </div>

    ${daily}

    <footer class="khv-footer"><div><strong>Vous n’avez rien à mémoriser.</strong><span>Revenez dans Pulse quand vous voulez savoir où vous en êtes, ce qui a changé ou ce que vous devez faire ensuite.</span></div><button type="button" data-khv-komo><span aria-hidden="true">ōø</span> Demander à Komo</button></footer>
  </section>`;
}
function bind(host){
  host.querySelectorAll('[data-khv-route]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.khvRoute||'home')));
  host.querySelectorAll('[data-khv-komo]').forEach(b=>b.addEventListener('click',openKomo));
}
function tuneChrome(){
  if(route()!=='home')return;
  document.body.classList.add('khome-v3','khome-final-v1');
  const ey=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');
  if(ey)ey.textContent='KŌMØ PULSE';
  if(title)title.textContent='Aujourd’hui';
}
async function render(force=false){
  if(rendering)return;
  if(route()!=='home'){document.body.classList.remove('khome-final-v1');return}
  const home=document.querySelector('[data-my-komo-home]');
  if(!home)return;
  rendering=true;
  try{
    tuneChrome();
    const [result,wearable]=await Promise.all([loadCanonicalResult({force}),loadWearable()]);
    const markup=html(result,wearable);
    const signature=`home-v1:${markup}`;
    if(signature===lastSignature&&home.querySelector('[data-khome-datawall]'))return;
    home.querySelector('[data-khome-datawall]')?.remove();
    const wrap=document.createElement('div');wrap.innerHTML=markup;const wall=wrap.firstElementChild;
    home.appendChild(wall);bind(wall);lastSignature=signature;
  }catch(e){console.error('[patient-home-command-v1]',e)}finally{rendering=false}
}
function schedule(force=false,ms=120){clearTimeout(timer);timer=setTimeout(()=>render(force),ms)}
['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:canonical-result-ready','komo:wearable-data-updated','komo:session-ready'].forEach(name=>window.addEventListener(name,()=>schedule(name==='komo:data-ready'||name==='komo:wearable-data-updated')));
window.addEventListener('resize',()=>schedule(false,180));
document.addEventListener('DOMContentLoaded',()=>{schedule(true,650);setTimeout(()=>render(true),1450)});
setTimeout(()=>render(true),2100);
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(true,40)};
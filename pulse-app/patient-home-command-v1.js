import { loadCanonicalResult } from './canonical-result-runtime.js';

const VERSION='1.0.0';
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
const fmtShortDate=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(d).replace('.','')};
const fmtDateTime=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(d).replace('.','')};
const firstName=()=>{const full=txt(document.querySelector('[data-my-komo-home] .mykomo-identity h2'));return full&&full!=='My KŌMØ'?full.split(/\s+/)[0]:''};
const readRing=index=>{const el=[...document.querySelectorAll('[data-my-komo-home] .mykomo-ring-item')][index]?.querySelector('.mykomo-ring strong');const raw=txt(el);const m=raw.match(/-?\d+(?:[.,]\d+)?/);return m?n(m[0].replace(',','.')):null};

function go(target){
  if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go(target);
  else location.hash=target;
}
function toast(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600)}
function currentExperience(){
  const levelRaw=txt(document.querySelector('.mykomo-xp-head strong'))||'Niveau 1';
  const level=n(levelRaw.match(/\d+/)?.[0])||1;
  const foot=[...document.querySelectorAll('.mykomo-xp-foot span')].map(txt);
  const total=n((foot[0]||'').replace(/[^0-9.-]/g,''))||0;
  const next=n((foot[1]||'').replace(/[^0-9.-]/g,''))||500;
  const pct=clamp(n(document.querySelector('.mykomo-xp-track')?.style?.getPropertyValue('--xp')?.replace('%',''))||0);
  return{level,total,next,pct};
}
function currentAppointment(){
  const box=document.querySelector('.mykomo-next');
  const title=txt(box?.querySelector('strong'))||'Aucun rendez-vous planifié';
  const meta=txt(box?.querySelector('small'))||'Planifiez votre prochaine étape depuis Pulse.';
  return{title,meta,exists:title!=='Aucun rendez-vous planifié'};
}
function motionStatus(result){
  const s=String(result?.score?.release_status||result?.score?.status||'').toLowerCase();
  if(['released','published'].includes(s))return{label:'PUBLIÉ',tone:'ok'};
  if(['clinician_reviewed','validated','reviewed'].includes(s))return{label:'VALIDÉ',tone:'ok'};
  if(result?.score?.motion_score!==null&&result?.score?.motion_score!==undefined)return{label:'CALCULÉ',tone:'calc'};
  return{label:'À COMPLÉTER',tone:'pending'};
}
function ageState(result){
  const age=result?.locomotorAge||{};
  if(age.status!=='available'||!Number.isFinite(Number(age.age)))return{available:false,value:'—',detail:age.reason||'Données fonctionnelles à compléter.',delta:null,chronological:null};
  const delta=n(age.deltaYears),chronological=n(age.chronologicalAge);
  let detail='Repère locomoteur disponible.';
  if(delta!==null&&delta<0)detail=`${Math.abs(Math.round(delta))} an${Math.abs(Math.round(delta))>1?'s':''} sous votre âge chronologique.`;
  else if(delta!==null&&delta>0)detail=`${Math.round(delta)} an${Math.round(delta)>1?'s':''} au-dessus de votre âge chronologique.`;
  else if(delta===0)detail='Aligné avec votre âge chronologique.';
  return{available:true,value:Math.round(Number(age.age)),detail,delta,chronological};
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
function absoluteDelta(cur,prev){if(cur===null||prev===null)return null;return cur-prev}
function windowRows(rows,anchor,startOffset,endOffset){
  const start=dayKey(addDays(anchor,startOffset)),end=dayKey(addDays(anchor,endOffset));
  return rows.filter(r=>r.metric_date>=start&&r.metric_date<=end);
}
function buildWearable(rows,active){
  const clean=dedupe(rows);
  if(!clean.length)return{active,has:false,rows:[],current:[],previous:[],latest:null,coverage:0,reliable:false};
  const latest=clean[0],anchor=dayDate(latest.metric_date);
  const current=windowRows(clean,anchor,-6,0),previous=windowRows(clean,anchor,-13,-7);
  const currentDays=new Set(current.map(r=>r.metric_date)).size,previousDays=new Set(previous.map(r=>r.metric_date)).size;
  const currentAvg={steps:avg(current,'steps'),active:avg(current,'active_minutes'),sleep:avg(current,'sleep_minutes'),rhr:avg(current,'resting_hr'),wear:avg(current,'wear_minutes')};
  const previousAvg={steps:avg(previous,'steps'),active:avg(previous,'active_minutes'),sleep:avg(previous,'sleep_minutes'),rhr:avg(previous,'resting_hr'),wear:avg(previous,'wear_minutes')};
  return{
    active,has:true,rows:clean,current,previous,latest,
    coverage:Math.round(currentDays/7*100),currentDays,previousDays,reliable:currentDays>=4&&previousDays>=4,
    currentAvg,previousAvg,
    changes:{steps:pctDelta(currentAvg.steps,previousAvg.steps),active:absoluteDelta(currentAvg.active,previousAvg.active),sleep:absoluteDelta(currentAvg.sleep,previousAvg.sleep),rhr:absoluteDelta(currentAvg.rhr,previousAvg.rhr)}
  };
}
async function loadWearable(){
  const sb=window.KomoRuntime?.client;
  if(!sb)return buildWearable([],false);
  try{
    const session=window.KomoRuntime?.getContext?.()?.session||(await sb.auth.getSession()).data?.session;
    if(!session?.user)return buildWearable([],false);
    const from=new Date();from.setDate(from.getDate()-35);
    const [consentRes,dataRes]=await Promise.all([
      sb.from('wearable_consents').select('status,consented_at,withdrawn_at').eq('user_id',session.user.id).eq('purpose','connected_followup').order('consented_at',{ascending:false}).limit(1).maybeSingle(),
      sb.from('wearable_daily_metrics').select('metric_date,steps,distance_m,active_minutes,sleep_minutes,resting_hr,avg_hr,hrv_ms,spo2_avg,wear_minutes,source,updated_at').eq('user_id',session.user.id).gte('metric_date',dayKey(from)).order('metric_date',{ascending:false}).order('updated_at',{ascending:false}).limit(120)
    ]);
    const active=!consentRes.error&&consentRes.data?.status==='active';
    return buildWearable(dataRes.error?[]:(dataRes.data||[]),active);
  }catch(e){console.warn('[home-command wearable]',e);return buildWearable([],false)}
}
function trend(value,{unit='%',invert=false,decimals=0}={}){
  if(value===null||value===undefined||!Number.isFinite(Number(value)))return'<span class="khc-trend neutral">Baseline</span>';
  const v=Number(value),good=invert?v<=0:v>=0,arrow=v>0?'↑':v<0?'↓':'→';
  const formatted=Math.abs(v).toLocaleString('fr-FR',{maximumFractionDigits:decimals,minimumFractionDigits:decimals});
  return`<span class="khc-trend ${good?'good':'watch'}">${arrow} ${formatted}${unit}</span>`;
}
function spark(rows){
  const r=[...rows].slice().sort((a,b)=>String(a.metric_date).localeCompare(String(b.metric_date))).slice(-7);
  const vals=r.map(x=>n(x.steps)||0),max=Math.max(...vals,1);
  if(!r.length)return'<div class="khc-spark empty"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';
  return`<div class="khc-spark" aria-label="Pas sur les sept derniers jours">${r.map((x,i)=>`<i style="--h:${Math.max(10,Math.round(vals[i]/max*100))}%" title="${fmtNumber(vals[i])} pas"></i>`).join('')}</div>`;
}
function statusChip(label,tone='neutral'){return`<span class="khc-status ${tone}"><i></i>${esc(label)}</span>`}

function mobileHtml(result){
  const motion=scoreValue(result),age=ageState(result),exp=currentExperience(),appt=currentAppointment(),start=readRing(0),clinical=readRing(2);
  const stepRaw=txt(document.querySelector('.mykomo-step-number strong'));const steps=n(stepRaw.replace(/[^0-9.-]/g,''))||0;const stepPct=clamp(Math.round(steps/10000*100));
  const ageValue=age.available?`${age.value} <small>ans</small>`:'—';
  return`<section class="kdw" data-khome-datawall><div class="kdw-grid">
    <article class="kdw-card kdw-score"><div><div class="kdw-eyebrow">KŌMØ MOTION</div><h3>Motion Score</h3></div><div class="kdw-ring-wrap"><button class="kdw-ring" style="--v:${motion??0}" data-kdw-results type="button"><span class="kdw-ring-core"><strong>${motion??'—'}${motion!==null?'<small>/100</small>':''}</strong><span>${motionStatus(result).label}</span></span></button></div><div class="kdw-score-foot"><div class="kdw-mini"><small>Start</small><strong>${start===null?'—':Math.round(start)+'/100'}</strong></div><div class="kdw-mini"><small>Clinical</small><strong>${clinical===null?'—':Math.round(clinical)+'/100'}</strong></div></div></article>
    <article class="kdw-card kdw-age"><i class="kdw-age-orbit"></i><span class="kdw-age-tag">Repère exploratoire</span><div><div class="kdw-eyebrow">KŌMØ AGE</div><h3>Âge locomoteur</h3></div><div class="kdw-age-main"><strong>${ageValue}</strong><span>${age.available?age.detail:'À établir'}</span></div><div class="kdw-age-foot">${esc(age.detail)}</div></article>
    <article class="kdw-card kdw-next"><div class="kdw-eyebrow">PROCHAINE ÉTAPE</div><strong class="big">${esc(appt.title)}</strong><p>${esc(appt.meta)}</p><button data-kdw-book type="button">Voir le planning →</button></article>
    <article class="kdw-card kdw-today"><div class="kdw-eyebrow">AUJOURD’HUI</div><div class="kdw-today-value"><strong>${steps.toLocaleString('fr-FR')}</strong><span>pas enregistrés</span></div><div class="kdw-today-bar" style="--p:${stepPct}%"><i></i></div><div class="kdw-today-meta"><span>${stepPct}% objectif</span></div></article>
    <article class="kdw-card kdw-exp"><div class="kdw-eyebrow">MY KŌMØ</div><div class="kdw-exp-dial" style="--p:${exp.pct}"><span class="kdw-exp-core"><strong>${exp.level}</strong><span>Niveau</span></span></div><div class="kdw-exp-foot"><span>${exp.total} XP</span><span>${Math.round(exp.pct)}%</span></div><button class="kdw-link" data-kdw-experience type="button">Voir My KŌMØ →</button></article>
  </div></section>`;
}

function nextAction(result,appt){
  const motion=scoreValue(result),status=motionStatus(result);
  if(motion===null)return{eyebrow:'À FAIRE MAINTENANT',title:'Établir votre première référence Motion.',copy:'Préparez votre bilan puis réalisez les mesures nécessaires pour calculer votre Motion Score.',button:'Démarrer Motion',route:'motion',meta:appt.exists?appt.meta:'Aucun rendez-vous planifié'};
  if(status.label==='PUBLIÉ'||status.label==='VALIDÉ')return{eyebrow:'À FAIRE MAINTENANT',title:'Votre Mobility Report est disponible.',copy:'Retrouvez votre Motion Score, vos domaines, vos priorités et la lecture longitudinale disponible.',button:'Voir mon rapport',route:'results',meta:appt.exists?`Prochain rendez-vous · ${appt.meta}`:'Rapport prêt à consulter'};
  return{eyebrow:'À FAIRE MAINTENANT',title:'Votre résultat est en cours de finalisation.',copy:'Votre Motion Score est calculé. La diffusion finale dépend du statut de revue de votre bilan.',button:'Voir mes résultats',route:'results',meta:appt.exists?`Prochain rendez-vous · ${appt.meta}`:'Suivi en cours'};
}
function clinicalState(){
  const value=readRing(2);
  if(value!==null&&value>0)return{label:'VALIDÉ',tone:'ok',title:`${Math.round(value)}/100`,copy:'Une lecture Clinical est disponible dans votre parcours.'};
  return{label:'EN ATTENTE',tone:'pending',title:'Validation clinique',copy:'Motion reste consultable pendant la validation du cadre Clinical.'};
}
function coreMetric(label,value,unit,sub,extra=''){return`<div class="khc-key-metric ${extra}"><small>${label}</small><strong>${value}</strong>${unit?`<span>${unit}</span>`:''}<p>${sub}</p></div>`}
function weekMetric(label,value,sub,trendHtml){return`<article class="khc-week-metric"><header><small>${label}</small>${trendHtml}</header><strong>${value}</strong><p>${sub}</p></article>`}

function desktopHtml(result,wearable){
  const motion=scoreValue(result),mStatus=motionStatus(result),age=ageState(result),appt=currentAppointment(),exp=currentExperience(),action=nextAction(result,appt),clinical=clinicalState();
  const today=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  const latest=wearable.latest||{},has=wearable.has;
  const steps=n(latest.steps),active=n(latest.active_minutes),sleep=n(latest.sleep_minutes),rhr=n(latest.resting_hr),wear=n(latest.wear_minutes);
  const keyLabel=wearable.active?(has?'LIVE':'PRÊT'):'À ACTIVER';
  const keyTone=wearable.active&&has?'live':wearable.active?'calc':'pending';
  const ageTitle=age.available?`${age.value}<small>ans</small>`:'—';
  const ageSub=age.available&&age.chronological!==null?`Âge chronologique · ${Math.round(age.chronological)} ans`:'Repère à établir';
  const source=has?String(latest.source||'wearable').replaceAll('_',' '):'Aucune source synchronisée';
  const weekStart=has?fmtShortDate(addDays(dayDate(latest.metric_date),-6)):'—',weekEnd=has?fmtShortDate(dayDate(latest.metric_date)):'—';
  const cur=wearable.currentAvg||{},chg=wearable.changes||{};
  const reportReady=motion!==null;
  const motionDelta=result?.score?.delta_from_previous??result?.score?.motion_delta??null;
  const greeting=firstName()?`Bonjour ${esc(firstName())}.`:'Votre journée.';
  const trajectoryItems=Array.isArray(result?.trajectory)?result.trajectory:[];
  const previous=trajectoryItems.map(x=>n(x.motion_score??x.score)).filter(v=>v!==null).slice(-2,-1)[0]??null;
  const trajectoryDelta=previous!==null&&motion!==null?motion-previous:null;
  return`<section class="kdw kdw-final" data-khome-datawall>
    <header class="khc-overview-head"><div><span>KŌMØ PULSE · OVERVIEW</span><h2>${greeting}</h2><p>${today.charAt(0).toUpperCase()+today.slice(1)} · une vue rapide de ce qui compte aujourd’hui.</p></div><div class="khc-sync">${statusChip(keyLabel,keyTone)}<div><small>DERNIÈRE SYNCHRO KEY</small><strong>${has?fmtDateTime(latest.updated_at||`${latest.metric_date}T12:00:00`):'Données en attente'}</strong></div></div></header>

    <div class="kdw-grid khc-grid">
      <article class="kdw-card kdw-score khc-card khc-motion"><header><div><span class="khc-label">MOTION · ${mStatus.label}</span><h3>Motion Score</h3></div>${statusChip(mStatus.label,mStatus.tone)}</header><div class="khc-motion-main"><strong>${motion??'—'}</strong>${motion!==null?'<small>/100</small>':''}</div><div class="khc-card-foot"><span>Capacité locomotrice globale</span>${motionDelta!==null?trend(Number(motionDelta),{unit:' pts'}):'<span class="khc-trend neutral">Référence actuelle</span>'}</div><button type="button" data-kdw-results>Voir Motion <b>→</b></button></article>

      <article class="kdw-card kdw-age khc-card khc-age"><header><div><span class="khc-label">KŌMØ AGE</span><h3>Âge locomoteur</h3></div><span class="khc-age-badge">REPÈRE EXPLORATOIRE</span></header><div class="khc-age-main"><strong>${ageTitle}</strong><span>${esc(ageSub)}</span></div><p>${esc(age.detail)}</p><button type="button" data-kdw-results>Comprendre <b>→</b></button></article>

      <article class="kdw-card kdw-key-summary khc-card khc-key"><header><div><span class="khc-label">KŌMØ KEY · ${keyLabel}</span><h3>Votre quotidien, en continu.</h3></div>${statusChip(keyLabel,keyTone)}</header><div class="khc-key-grid">
        ${coreMetric('PAS',steps===null?'—':fmtNumber(steps),'','Aujourd’hui','focus')}
        ${coreMetric('ACTIF',active===null?'—':fmtNumber(active),'min','Temps actif')}
        ${coreMetric('SOMMEIL',sleep===null?'—':fmtSleep(sleep),'','Dernière nuit')}
        ${coreMetric('FC REPOS',rhr===null?'—':fmtNumber(rhr),'bpm','Dernière valeur')}
      </div><footer><div><small>${has?`Source · ${esc(source)}`:'Connectez ou importez une source compatible'}</small><span>${wear!==null?`${Math.round(wear/60)} h de port observé`:wearable.active?'Premières données attendues':'Consentement requis'}</span></div><button type="button" data-kdw-key>Ouvrir KEY <b>→</b></button></footer></article>

      <article class="kdw-card khc-card khc-week"><header><div><span class="khc-label">KEY · VOTRE SEMAINE</span><h3>${has?`${weekStart} — ${weekEnd}`:'Baseline en construction'}</h3></div><div class="khc-coverage"><strong>${wearable.currentDays||0}<small>/7 jours</small></strong><span>${wearable.coverage||0}% couverture</span></div></header><div class="khc-week-grid">
        ${weekMetric('ACTIVITÉ',cur.steps===null||cur.steps===undefined?'—':fmtNumber(cur.steps),'pas / jour',wearable.reliable?trend(chg.steps,{unit:'%'}):'<span class="khc-trend neutral">Baseline</span>')}
        ${weekMetric('TEMPS ACTIF',cur.active===null||cur.active===undefined?'—':`${fmtNumber(cur.active)} min`,'moyenne / jour',wearable.reliable?trend(chg.active,{unit:' min'}):'<span class="khc-trend neutral">Baseline</span>')}
        ${weekMetric('SOMMEIL',cur.sleep===null||cur.sleep===undefined?'—':fmtSleep(cur.sleep),'moyenne / nuit',wearable.reliable?trend(chg.sleep,{unit:' min'}):'<span class="khc-trend neutral">Baseline</span>')}
        ${weekMetric('FC REPOS',cur.rhr===null||cur.rhr===undefined?'—':`${fmtNumber(cur.rhr)} bpm`,'moyenne observée',wearable.reliable?trend(chg.rhr,{unit:' bpm',invert:true}):'<span class="khc-trend neutral">Baseline</span>')}
      </div><div class="khc-week-chart"><div><small>CONTINUITÉ · 7 JOURS</small><strong>${wearable.reliable?'Comparaison avec les 7 jours précédents':'Encore quelques jours pour comparer'}</strong></div>${spark(wearable.current||[])}</div><p class="khc-method">Moyennes calculées sur les jours observés. Aucun jour manquant n’est extrapolé.</p></article>

      <article class="kdw-card khc-card khc-next"><span class="khc-label">${action.eyebrow}</span><h3>${esc(action.title)}</h3><p>${esc(action.copy)}</p><div class="khc-next-meta"><i></i><span>${esc(action.meta)}</span></div><button class="khc-primary" type="button" data-kdw-next-route="${esc(action.route)}">${esc(action.button)} <b>→</b></button><div class="khc-next-links"><button type="button" data-kdw-tests>Tests</button><button type="button" data-kdw-book>Rendez-vous</button></div></article>

      <article class="kdw-card khc-card khc-clinical"><header><div><span class="khc-label">CLINICAL</span><h3>Validation clinique</h3></div>${statusChip(clinical.label,clinical.tone)}</header><strong>${esc(clinical.title)}</strong><p>${esc(clinical.copy)}</p><div class="khc-clinical-line"><span>Données mesurées</span><b>→</b><span>Calcul KŌMØ</span><b>→</b><span>Validation Clinical</span></div><button type="button" data-kdw-results>Voir mes résultats <b>→</b></button></article>

      <article class="kdw-card khc-card khc-report"><header><div><span class="khc-label">REPORT</span><h3>Mobility Report</h3></div>${statusChip(reportReady?'DISPONIBLE':'À VENIR',reportReady?'ok':'pending')}</header><div class="khc-report-body"><div><small>MOTION</small><strong>${motion===null?'—':`${motion}/100`}</strong></div><div><small>KEY</small><strong>${has?`${wearable.currentDays||0} j`:'—'}</strong></div><div><small>STATUT</small><strong>${esc(mStatus.label)}</strong></div></div><p>${reportReady?'Votre restitution réunit vos résultats disponibles et la continuité KEY lorsqu’elle est autorisée.':'Le rapport sera disponible après votre première mesure Motion.'}</p><button type="button" data-kdw-results>${reportReady?'Ouvrir le rapport':'Voir le parcours'} <b>→</b></button></article>

      <article class="kdw-card khc-card khc-trajectory"><header><div><span class="khc-label">TRAJECTOIRE</span><h3>Votre mobilité dans le temps.</h3></div><button type="button" data-kdw-trajectory>Voir toute la trajectoire <b>→</b></button></header><div class="khc-trajectory-line"><div class="past"><i></i><small>RÉFÉRENCE</small><strong>${previous!==null?Math.round(previous):'—'}</strong><span>${previous!==null?'Mesure précédente':'Première référence'}</span></div><span class="line"></span><div class="current"><i></i><small>AUJOURD’HUI</small><strong>${motion??'—'}</strong><span>${trajectoryDelta!==null?`${trajectoryDelta>=0?'+':''}${Math.round(trajectoryDelta)} pts`:motion!==null?'Référence actuelle':'À mesurer'}</span></div><span class="line future"></span><div class="future"><i></i><small>PROCHAINE MESURE</small><strong>→</strong><span>Comparer sans repartir de zéro</span></div></div></article>

      <nav class="kdw-card khc-card khc-quick" aria-label="Accès rapides"><button type="button" data-kdw-results><span>01</span><strong>Résultats</strong><b>→</b></button><button type="button" data-kdw-key><span>02</span><strong>KEY</strong><b>→</b></button><button type="button" data-kdw-trajectory><span>03</span><strong>Trajectoire</strong><b>→</b></button><button type="button" data-kdw-book><span>04</span><strong>Rendez-vous</strong><b>→</b></button><button type="button" data-kdw-tests><span>05</span><strong>Tests</strong><b>→</b></button></nav>

      <article class="kdw-card khc-card khc-life"><div><span class="khc-label">KŌMØ LIFE</span><h3>Progression secondaire, jamais avant vos repères.</h3><p>Niveau ${exp.level} · ${exp.total} XP · ${exp.next} XP avant le niveau suivant.</p></div><div class="khc-life-progress"><span style="--p:${exp.pct}%"><i></i></span><strong>${Math.round(exp.pct)}%</strong></div><button type="button" data-kdw-myk>My KŌMØ <b>→</b></button></article>
    </div>
  </section>`;
}

function bind(host){
  host.querySelectorAll('[data-kdw-results]').forEach(b=>b.addEventListener('click',()=>go('results')));
  host.querySelectorAll('[data-kdw-key]').forEach(b=>b.addEventListener('click',()=>go('key')));
  host.querySelectorAll('[data-kdw-trajectory]').forEach(b=>b.addEventListener('click',()=>go('trajectory')));
  host.querySelectorAll('[data-kdw-book]').forEach(b=>b.addEventListener('click',()=>go('documents')));
  host.querySelectorAll('[data-kdw-tests]').forEach(b=>b.addEventListener('click',()=>go('tests')));
  host.querySelectorAll('[data-kdw-myk],[data-kdw-experience]').forEach(b=>b.addEventListener('click',()=>go('mykomo')));
  host.querySelectorAll('[data-kdw-next-route]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.kdwNextRoute||'results')));
}
function tuneChrome(){
  if(route()!=='home')return;
  document.body.classList.add('khome-v3','khome-final-v1');
  const ey=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');
  if(ey)ey.textContent='KŌMØ PULSE · OVERVIEW';
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
    const result=await loadCanonicalResult({force});
    const isDesktop=matchMedia('(min-width:768px)').matches;
    const wearable=isDesktop?await loadWearable():null;
    const html=isDesktop?desktopHtml(result,wearable):mobileHtml(result);
    const signature=`${isDesktop?'desktop':'mobile'}:${html}`;
    if(signature===lastSignature&&home.querySelector('[data-khome-datawall]'))return;
    home.querySelector('[data-khome-datawall]')?.remove();
    const wrap=document.createElement('div');wrap.innerHTML=html;const wall=wrap.firstElementChild;
    home.appendChild(wall);bind(wall);lastSignature=signature;
    if(!isDesktop)window.KomoHomeKeyPosition?.refresh?.();
  }catch(e){console.error('[patient-home-command-v1]',e)}finally{rendering=false}
}
function schedule(force=false,ms=120){clearTimeout(timer);timer=setTimeout(()=>render(force),ms)}
['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:canonical-result-ready','komo:wearable-data-updated','komo:session-ready'].forEach(name=>window.addEventListener(name,()=>schedule(name==='komo:data-ready'||name==='komo:wearable-data-updated')));
window.addEventListener('resize',()=>schedule(false,180));
document.addEventListener('DOMContentLoaded',()=>{schedule(true,850);setTimeout(()=>render(true),1700)});
setTimeout(()=>render(true),2300);
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(true,40)};

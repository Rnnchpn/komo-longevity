import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER_KEY='komo_pulse_remember';
const TARGETS=new Set(['path','plan','documents']);
let cache={userId:null,patient:null,assessments:[],scores:[],oldScores:[],priorities:[],trajectory:[],appointments:[]};
let rendering=false,scheduled=null;

function storage(){return localStorage.getItem(REMEMBER_KEY)==='1'?localStorage:sessionStorage}
function client(){return createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}
function route(){return location.hash.replace(/^#/,'')||'home'}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function date(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(d)}
function datetime(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(d)}
function apptLabel(v){return({motion:'KŌMØ Motion',clinical:'KŌMØ Clinical',follow_up:'Suivi KŌMØ',discovery:'Découverte KŌMØ'})[v]||'Rendez-vous KŌMØ'}
function status(v){return({scheduled:'Planifié',confirmed:'Confirmé',arrived:'Arrivé',in_progress:'En cours',completed:'Terminé',cancelled:'Annulé',no_show:'Absent',released:'Disponible',validated:'Validé'})[v]||String(v||'À venir').replaceAll('_',' ')}
function locationLabel(v){return({in_person:'Sur place',video:'Visioconférence',phone:'Téléphone'})[v]||'Sur place'}

async function load(force=false){
  const sb=client();const {data:{session}}=await sb.auth.getSession();if(!session?.user)return false;
  if(!force&&cache.userId===session.user.id)return true;
  cache={userId:session.user.id,patient:null,assessments:[],scores:[],oldScores:[],priorities:[],trajectory:[],appointments:[]};
  const old=await sb.from('pulse_score_runs').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(12);cache.oldScores=(old.data||[]).filter(s=>!s.status||['released','clinician_reviewed'].includes(s.status));
  const p=await sb.from('patients').select('*').eq('patient_user_id',session.user.id).order('created_at',{ascending:false}).limit(1).maybeSingle();if(!p.data)return true;cache.patient=p.data;
  const a=await sb.from('assessments').select('*').eq('patient_id',p.data.id).order('created_at',{ascending:false}).limit(16);cache.assessments=a.data||[];const ids=cache.assessments.map(x=>x.id).filter(Boolean);
  const [scores,traj,appts]=await Promise.all([
    ids.length?sb.from('scores').select('*').in('assessment_id',ids).order('calculated_at',{ascending:false}):Promise.resolve({data:[]}),
    sb.from('trajectory_events').select('*').eq('patient_id',p.data.id).order('event_date',{ascending:false}).limit(20),
    sb.from('organization_appointments').select('*').eq('patient_id',p.data.id).order('scheduled_start',{ascending:true}).limit(50)
  ]);
  cache.scores=(scores.data||[]).filter(s=>s.release_status==='released');cache.trajectory=traj.data||[];cache.appointments=appts.data||[];
  const latest=cache.assessments[0];if(latest?.id){const pr=await sb.from('priorities').select('*').eq('assessment_id',latest.id).order('rank',{ascending:true});cache.priorities=(pr.data||[]).filter(x=>x.validation_status==='validated')}
  return true;
}

function scoreObjects(){
  const modern=cache.scores.map(s=>({value:n(s.motion_score),age:null,domains:s.domain_scores||{},date:s.calculated_at||s.created_at,label:'Motion Score'})).filter(x=>x.value!==null);
  const legacy=cache.oldScores.map(s=>({value:n(s.overall_score),age:n(s.motion_age),domains:s.subscores||{},date:s.released_at||s.computed_at||s.created_at,label:'Locomotor Score'})).filter(x=>x.value!==null);
  return [...modern,...legacy].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
}
function domains(raw){const labels={mobility:'Mobilité',performance:'Performance',balance:'Équilibre',muscle_control:'Contrôle musculaire',quality:'Qualité',muscle:'Muscle',posture:'Posture',recovery:'Récupération',reserve:'Réserve'};return Object.entries(raw||{}).map(([k,v])=>[labels[k]||k.replaceAll('_',' '),n(typeof v==='object'&&v!==null?(v.score??v.value):v)]).filter(([,v])=>v!==null).slice(0,8)}
function delta(current,previous,suffix=''){if(current===null||previous===null)return'<span class="pv4-delta neutral">Première référence</span>';const d=Math.round((current-previous)*10)/10;return `<span class="pv4-delta ${d===0?'neutral':''}">${d>0?'+':''}${d}${suffix} depuis la précédente</span>`}
function setHead(eyebrow,title){document.querySelector('#pageEyebrow').textContent=eyebrow;document.querySelector('#pageTitle').textContent=title}

function renderMyKomo(){
  const list=scoreObjects(),cur=list[0]||null,prev=list[1]||null,ds=domains(cur?.domains),events=cache.trajectory.slice(0,6);
  const scoreBlock=cur?`<div class="pv4-score-row"><div><div class="pv4-score">${Math.round(cur.value)}<small>/100</small></div>${delta(cur.value,prev?.value??null)}</div></div><p class="pv4-caption">Votre repère global actuel. Ce nombre prend surtout son sens dans son évolution au fil des évaluations KŌMØ.</p>`:`<div class="pv4-empty">Votre premier score validé apparaîtra ici après votre évaluation.</div>`;
  const age=cur?.age??list.find(x=>x.age!==null)?.age??null;
  return `<div class="patient-v4">
    <section class="pv4-intro"><div><p class="eyebrow">MY KŌMØ</p><h2>Votre mobilité.<br>Dans le temps.</h2></div><p>Vos scores, vos changements et les repères utiles entre deux consultations. My KŌMØ devient votre mémoire longitudinale.</p></section>
    <section class="pv4-hero"><article class="pv4-primary"><div><p class="eyebrow">REPÈRE ACTUEL</p>${scoreBlock}</div></article><aside class="pv4-secondary"><div class="pv4-age"><p class="eyebrow">ÂGE LOCOMOTEUR</p>${age!==null?`<strong>${Math.round(age)}<small> ans</small></strong><p>Affiché lorsqu’il est disponible. Il s’agit d’un repère KŌMØ longitudinal, pas d’un diagnostic ni d’un âge biologique.</p>`:'<div class="pv4-empty">Disponible après calcul et validation lorsqu’il fait partie de votre évaluation.</div>'}</div><div><div class="pv4-statline"><span>Dernière évaluation</span><strong>${date(cur?.date)}</strong></div><div class="pv4-statline"><span>Évaluations suivies</span><strong>${list.length}</strong></div></div></aside></section>
    <section class="pv4-grid"><article class="pv4-section"><div class="pv4-section-head"><div><h3>Vos domaines</h3><p>Les composantes publiées de votre dernière évaluation.</p></div></div>${ds.length?`<div class="pv4-domain-list">${ds.map(([label,value])=>`<div class="pv4-domain"><span>${esc(label)}</span><div class="pv4-domain-track"><i style="width:${Math.max(0,Math.min(100,value))}%"></i></div><strong>${Math.round(value)}</strong></div>`).join('')}</div>`:'<div class="pv4-empty">Les sous-scores apparaîtront ici lorsqu’ils auront été publiés.</div>'}</article>
    <article class="pv4-section"><div class="pv4-section-head"><div><h3>Historique</h3><p>Comparer vos références successives.</p></div></div>${list.length?`<div class="pv4-history">${list.slice(0,6).map((s,i)=>`<div class="pv4-history-row"><span class="pv4-history-date">${date(s.date)}</span><div class="pv4-history-copy"><strong>${i===0?'Référence actuelle':'Évaluation précédente'}</strong><span>${esc(s.label)}</span></div><div class="pv4-history-value">${Math.round(s.value)}<small>/100</small></div></div>`).join('')}</div>`:'<div class="pv4-empty">Votre historique commencera avec votre première évaluation validée.</div>'}</article></section>
    ${events.length?`<article class="pv4-section"><div class="pv4-section-head"><div><h3>Votre trajectoire</h3><p>Les événements enregistrés au fil du suivi.</p></div></div><div class="pv4-history">${events.map(e=>`<div class="pv4-history-row"><span class="pv4-history-date">${date(e.event_date)}</span><div class="pv4-history-copy"><strong>${esc(String(e.event_type||'Suivi').replaceAll('_',' '))}</strong><span>${esc(e.payload?.patient_wording||e.payload?.label||'Événement de suivi KŌMØ')}</span></div><span></span></div>`).join('')}</div></article>`:''}
  </div>`;
}

function nextAppointment(){const now=Date.now();return cache.appointments.find(a=>a.scheduled_start&&new Date(a.scheduled_start).getTime()>=now&&!['cancelled','completed','no_show'].includes(a.status))||null}
function renderPlan(){
  const next=nextAppointment(),p=cache.priorities;
  return `<div class="patient-v4"><section class="pv4-plan-hero"><div><p class="eyebrow">MON PLAN</p><h2>Ce qui compte<br>maintenant.</h2></div><p>Votre plan traduit l’évaluation en priorités compréhensibles entre deux consultations. Pulse n’affiche ici que les éléments validés pour vous.</p></section>
    <section><div class="pv4-section-head" style="margin:6px 2px 12px"><div><h3>Vos priorités actuelles</h3><p>Jusqu’à votre prochaine réévaluation.</p></div></div>${p.length?`<div class="pv4-priorities">${p.slice(0,3).map((x,i)=>`<article class="pv4-priority"><div class="pv4-priority-top"><span class="pv4-priority-num">0${x.rank||i+1}</span><span class="pv4-priority-status">Validé</span></div><div><h3>${esc(x.patient_wording||x.category||'Priorité KŌMØ')}</h3><p>${esc(x.category||'Axe de progression')}</p></div></article>`).join('')}</div>`:'<div class="pv4-empty">Votre plan personnalisé apparaîtra après validation de vos priorités par votre professionnel.</div>'}</section>
    <section class="pv4-plan-bottom"><article class="pv4-next"><p class="eyebrow">ENTRE DEUX CONSULTATIONS</p><div class="pv4-next-date">Suivre. Mesurer. Ajuster.</div><p>Vos prochains tests et vos nouvelles évaluations alimentent My KŌMØ sans remplacer l’interprétation professionnelle.</p><button class="pv4-link-button" type="button" data-route="results">Voir mes tests →</button></article><article class="pv4-next"><p class="eyebrow">PROCHAINE RÉÉVALUATION</p><div class="pv4-next-date">${next?datetime(next.scheduled_start):'À programmer'}</div><p>${next?`${apptLabel(next.appointment_type)} · ${status(next.status)}`:'Votre prochain rendez-vous apparaîtra ici lorsqu’il sera planifié.'}</p><button class="pv4-link-button" type="button" data-route="documents">Voir mon agenda →</button></article></section></div>`;
}

function renderAgenda(){
  const now=Date.now(),up=cache.appointments.filter(a=>a.scheduled_start&&new Date(a.scheduled_start).getTime()>=now&&!['cancelled','completed','no_show'].includes(a.status)),past=cache.appointments.filter(a=>!a.scheduled_start||new Date(a.scheduled_start).getTime()<now||['completed','no_show'].includes(a.status)).slice().reverse(),next=up[0]||null;
  let day='—',month='Aucun rendez-vous';if(next){const d=new Date(next.scheduled_start);day=new Intl.DateTimeFormat('fr-FR',{day:'2-digit'}).format(d);month=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(d)}
  const rows=items=>items.map(a=>`<div class="pv4-agenda-row"><strong>${datetime(a.scheduled_start)}</strong><div><strong>${apptLabel(a.appointment_type)}</strong><span>${locationLabel(a.location_mode)}${a.site_name?` · ${esc(a.site_name)}`:''}</span></div><span class="status-pill">${status(a.status)}</span></div>`).join('');
  return `<div class="patient-v4"><section class="pv4-intro"><div><p class="eyebrow">RENDEZ-VOUS</p><h2>Votre agenda KŌMØ.</h2></div><p>Préparez votre prochaine évaluation et gardez l’historique de vos consultations au même endroit.</p></section>
    <section class="pv4-agenda-hero"><article class="pv4-appointment-main"><div><p class="eyebrow">PROCHAIN RENDEZ-VOUS</p><h2>${next?apptLabel(next.appointment_type):'Aucun rendez-vous programmé.'}</h2></div><div class="pv4-appointment-date"><strong class="pv4-appointment-day">${day}</strong><span class="pv4-appointment-month">${esc(month)}</span></div></article><aside class="pv4-appointment-side"><div><p class="eyebrow">PRÉPARATION</p><h3>${next?status(next.intake_status||next.status):'Votre prochaine étape'}</h3><p>${next?`${datetime(next.scheduled_start)} · ${locationLabel(next.location_mode)}${next.site_name?` · ${esc(next.site_name)}`:''}`:'Les tests à réaliser avant une consultation seront accessibles depuis Mes tests.'}</p></div><button class="pv4-link-button" type="button" data-route="results">Préparer mes tests →</button></aside></section>
    <article class="pv4-section"><div class="pv4-section-head"><div><h3>À venir</h3><p>Vos consultations et évaluations planifiées.</p></div></div>${up.length?`<div class="pv4-agenda-list">${rows(up)}</div>`:'<div class="pv4-empty">Aucun rendez-vous à venir pour le moment.</div>'}</article>
    <article class="pv4-section"><div class="pv4-section-head"><div><h3>Historique</h3><p>Vos rendez-vous précédents.</p></div></div>${past.length?`<div class="pv4-agenda-list">${rows(past.slice(0,10))}</div>`:'<div class="pv4-empty">Votre historique apparaîtra ici après votre première consultation.</div>'}</article></div>`;
}

async function render(force=false){if(rendering||!TARGETS.has(route()))return;const shell=document.querySelector('#appShell'),root=document.querySelector('#viewRoot');if(!shell||shell.hidden||!root)return;rendering=true;try{await load(force);const r=route();if(r==='path'){setHead('MY KŌMØ','Votre mobilité, dans le temps.');root.innerHTML=renderMyKomo()}else if(r==='plan'){setHead('MON PLAN','Votre plan personnalisé.');root.innerHTML=renderPlan()}else if(r==='documents'){setHead('RENDEZ-VOUS','Votre agenda KŌMØ.');root.innerHTML=renderAgenda()}root.firstElementChild?.setAttribute('data-patient-v4',r)}catch(e){console.error('[patient-v4]',e)}finally{rendering=false}}
function schedule(force=false){clearTimeout(scheduled);scheduled=setTimeout(()=>render(force),force?80:35)}
window.addEventListener('hashchange',()=>schedule(false));document.addEventListener('click',e=>{if(e.target.closest('#refreshButton'))schedule(true)});
const obs=new MutationObserver(()=>{if(!TARGETS.has(route()))return;const root=document.querySelector('#viewRoot');if(root&&!root.querySelector('[data-patient-v4]'))schedule(false)});obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>schedule(false),700));setTimeout(()=>schedule(false),1000);

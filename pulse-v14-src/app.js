import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const sb=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

const PATIENT_NAV=[['home','Aujourd’hui'],['baseline','Mon bilan'],['results','Résultats'],['plan','Mon plan'],['appointments','Rendez-vous']];
const PRO_NAV=[['operator','Operator'],['patients','Patients'],['appointments','Rendez-vous']];
const OP_STEPS=[
 ['preflight','00–05','Sécurité & standardisation','Operator'],
 ['readiness','05–10','Préparation du bilan','Pulse'],
 ['smartspeed_10m','10–15','Vitesse de marche 10 m','SmartSpeed'],
 ['forcedecks_quiet_stand','15–20','Équilibre statique','ForceDecks'],
 ['humantrak_mobility','20–30','Mobilité','HumanTrak'],
 ['dynamo_grip','30–38','Force de préhension','DynaMo'],
 ['forcedecks_sts','38–45','Sit-to-Stand','ForceDecks'],
 ['qc_release','45–55','Contrôle qualité','Pulse']
];

const S={user:null,role:'member',profile:null,mode:'patient',org:null,membership:null,patient:null,patients:[],assessment:null,questionnaires:[],scores:[],measurements:[],programs:[],trajectory:[],appointments:[],bio:[],gates:[],checkpoints:[],opSession:null,opSteps:[],schema:{bio:false,operator:false},route:'home',loading:false};

const $=s=>document.querySelector(s);
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fmt=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d)};
const fmtShort=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(d)};
const safe=async q=>{try{const r=await q;return r.error?{data:null,error:r.error}:{data:r.data,error:null}}catch(error){return{data:null,error}}};
const toast=m=>{const e=$('#toast');if(!e)return;e.textContent=m;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,3300)};
const hasPro=()=>['professional','admin'].includes(S.role);
const patientName=()=>S.patient?([S.patient.preferred_name||S.patient.first_name,S.patient.last_name].filter(Boolean).join(' ')||S.profile?.display_name||''):(S.profile?.display_name||'');
const firstName=()=>patientName().split(' ')[0]||'Bonjour';
const route=()=>location.hash.replace(/^#/,'')||((hasPro()&&S.mode==='pro')?'operator':'home');
const score=()=>S.scores[0]||null;
const subs=()=>score()?.subscores||{};
const qdone=()=>S.questionnaires.filter(x=>x.status==='completed'||Number(x.completeness||0)>=100).length;
const bioReady=()=>S.bio.some(x=>['reviewed','released'].includes(x.status));
const motionReady=()=>S.measurements.length>0;
const releasedScore=()=>Number.isFinite(Number(score()?.overall_score));
const visibleGates=()=>S.gates.filter(g=>['open','review_required','referred'].includes(g.status));
const domainVal=(...keys)=>{for(const k of keys){const v=Number(subs()[k]);if(Number.isFinite(v))return v}return null};
const futureAppointments=()=>S.appointments.filter(a=>new Date(a.scheduled_start||0).getTime()>=Date.now()).sort((a,b)=>new Date(a.scheduled_start)-new Date(b.scheduled_start));
const friendlyAppointmentType=v=>({motion:'Bilan de mouvement',clinical:'Consultation médicale',follow_up:'Suivi',baseline:'Bilan KŌMØ'}[v]||'Rendez-vous KŌMØ');
const friendlyMode=v=>({onsite:'Sur place',clinic:'En centre',home:'À domicile',yacht:'À bord',villa:'En villa',teleconsultation:'À distance',remote:'À distance'}[v]||'Avec votre équipe KŌMØ');
const statusLabel=v=>({scheduled:'Confirmé',confirmed:'Confirmé',pending:'En attente',completed:'Terminé',cancelled:'Annulé',review:'En revue',collecting:'En cours',draft:'À démarrer',running:'En cours',ready:'Prêt'}[v]||'En cours');

function patientProgress(){
  const steps=[
    {id:'questions',label:'Questions',done:qdone()>=1,detail:qdone()?qdone()+' questionnaire(s) terminé(s)':'Quelques minutes pour comprendre votre quotidien'},
    {id:'biology',label:'Prise de sang',done:bioReady(),detail:bioReady()?'Résultats reçus':'À organiser avec l’équipe'},
    {id:'motion',label:'Mesures',done:motionReady(),detail:motionReady()?'Mesures enregistrées':'Votre séance de mouvement'},
    {id:'results',label:'Résultats',done:releasedScore(),detail:releasedScore()?'Disponibles':'Après validation de votre bilan'}
  ];
  const firstPending=steps.find(x=>!x.done)?.id||'results';
  const completed=steps.filter(x=>x.done).length;
  return {steps,firstPending,completed,percent:Math.round(completed/steps.length*100)};
}
function nextAction(){
  const p=patientProgress();
  if(!S.assessment)return {title:'Découvrir votre bilan KŌMØ',text:'Votre équipe préparera votre baseline. Vous pouvez déjà voir comment le parcours se déroule.',label:'Voir mon bilan',route:'baseline'};
  if(p.firstPending==='questions')return {title:'Compléter votre pré-bilan',text:'Quelques questions nous permettent de personnaliser la suite sans ajouter de tests inutiles.',label:'Continuer mon bilan',route:'baseline'};
  if(p.firstPending==='biology')return {title:'Organiser votre prise de sang',text:'Cette étape apporte le contexte biologique utile à l’interprétation globale.',label:'Voir cette étape',route:'baseline'};
  if(p.firstPending==='motion')return {title:'Réaliser vos mesures de mouvement',text:'Une séance guidée mesure votre force, votre équilibre, votre mobilité et votre locomotion.',label:'Voir mon rendez-vous',route:'appointments'};
  if(p.firstPending==='results')return {title:'Vos résultats sont en validation',text:'Votre équipe vérifie la qualité des mesures avant leur publication dans Pulse.',label:'Comprendre mes résultats',route:'results'};
  return {title:'Votre bilan est prêt',text:'Découvrez vos points forts, votre priorité et le plan proposé pour les prochaines semaines.',label:'Voir mes résultats',route:'results'};
}
function band(v){if(!Number.isFinite(v))return{label:'En attente',class:'neutral'};if(v>=80)return{label:'Solide',class:'good'};if(v>=65)return{label:'Bon niveau',class:'good'};if(v>=50)return{label:'À renforcer',class:'mid'};return{label:'Priorité',class:'warn'}}
function domains(){return[
  ['Locomotion','Votre efficacité à vous déplacer',domainVal('locomotion','gait')],
  ['Force','Votre capacité à produire de la force',domainVal('strength')],
  ['Fonction','Votre capacité à vous relever et produire de la puissance',domainVal('function','power_function','power')],
  ['Équilibre','Votre stabilité',domainVal('balance')],
  ['Mobilité','Votre amplitude et qualité de mouvement',domainVal('mobility','movement_quality')]
]}

async function authView(message=''){
  $('#app').innerHTML=`<main class="login-page"><section class="login-story"><div class="brand light">KŌMØ<small>PULSE</small></div><div><span class="overline light">VOTRE SANTÉ EN MOUVEMENT</span><h1>Comprendre votre corps.<br><em>Simplement.</em></h1><p>Votre bilan, vos résultats et votre plan KŌMØ réunis au même endroit — sans jargon, étape par étape.</p></div><div class="login-foot">Données de santé privées · Accès sécurisé</div></section><section class="login-panel"><form id="login" class="login-card"><span class="overline">KŌMØ PULSE</span><h2>Bienvenue</h2><p>Connectez-vous pour reprendre votre parcours là où vous l’avez laissé.</p><label><span>E-mail</span><input name="email" type="email" autocomplete="email" required></label><label><span>Mot de passe</span><input name="password" type="password" autocomplete="current-password" required minlength="6"></label><button class="button primary wide">Se connecter</button><button class="text-button" type="button" id="reset">Mot de passe oublié ?</button>${message?`<div class="form-error">${esc(message)}</div>`:''}</form></section></main>`;
  $('#login').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const r=await sb.auth.signInWithPassword({email:String(f.get('email')),password:String(f.get('password'))});if(r.error)return authView('Impossible de vous connecter. Vérifiez votre e-mail et votre mot de passe.');await boot()};
  $('#reset').onclick=async()=>{const email=prompt('Votre adresse e-mail');if(!email)return;const r=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin});toast(r.error?'Impossible d’envoyer l’e-mail.':'E-mail de réinitialisation envoyé.')};
}
async function loadIdentity(){
  const u=await sb.auth.getUser();S.user=u.data.user||null;if(!S.user)return false;
  S.profile=(await safe(sb.from('profiles').select('*').eq('id',S.user.id).maybeSingle())).data||{};
  const role=(await safe(sb.from('account_roles').select('role').eq('user_id',S.user.id).maybeSingle())).data;S.role=role?.role||'member';
  S.patient=(await safe(sb.from('patients').select('*').eq('patient_user_id',S.user.id).maybeSingle())).data||null;
  if(hasPro()){
    const mr=(await safe(sb.from('organization_members').select('*,organizations(*)').eq('user_id',S.user.id).eq('status','active'))).data||[];
    S.membership=mr[0]||null;S.org=S.membership?.organizations||null;
    const saved=localStorage.getItem('komo_v14_mode');S.mode=saved==='patient'&&S.patient?'patient':'pro';
  }else S.mode='patient';
  return true;
}
async function loadPatientContext(patient){
  if(!patient){Object.assign(S,{assessment:null,questionnaires:[],scores:[],measurements:[],programs:[],trajectory:[],appointments:[],bio:[],gates:[],checkpoints:[]});return}
  S.patient=patient;
  const ar=await safe(sb.from('assessments').select('*').eq('patient_id',patient.id).eq('product_mode','motion').eq('protocol_version','motion-v1.0').order('created_at',{ascending:false}).limit(1));S.assessment=ar.data?.[0]||null;
  S.questionnaires=S.assessment?((await safe(sb.from('questionnaire_sessions').select('*').eq('assessment_id',S.assessment.id).order('created_at',{ascending:false}))).data||[]):[];
  const uid=patient.patient_user_id;
  S.scores=uid?((await safe(sb.from('pulse_score_runs').select('*').eq('user_id',uid).eq('status','released').eq('algorithm_version','motion-score-v1.0').order('released_at',{ascending:false}).limit(5))).data||[]):[];
  S.measurements=uid?((await safe(sb.from('pulse_measurement_sets').select('*').eq('user_id',uid).eq('protocol_version','motion-v1.0').order('captured_at',{ascending:false}).limit(20))).data||[]):[];
  S.programs=uid?((await safe(sb.from('pulse_programs').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(5))).data||[]):[];
  S.trajectory=(await safe(sb.from('trajectory_events').select('*').eq('patient_id',patient.id).order('event_date',{ascending:false}).limit(20))).data||[];
  S.appointments=(await safe(sb.from('organization_appointments').select('*').eq('patient_id',patient.id).order('scheduled_start',{ascending:false}).limit(30))).data||[];
  const br=await safe(sb.from('pulse_biological_panels').select('*').eq('patient_id',patient.id).order('created_at',{ascending:false}).limit(5));S.schema.bio=!br.error;S.bio=br.data||[];
  const gr=await safe(sb.from('pulse_clinical_gates').select('*').eq('patient_id',patient.id).order('created_at',{ascending:false}).limit(20));S.gates=gr.data||[];
  const cr=await safe(sb.from('pulse_checkpoints').select('*').eq('patient_id',patient.id).order('scheduled_at',{ascending:true}).limit(20));S.checkpoints=cr.data||[];
}
async function loadPro(){
  if(!S.org)return;
  S.patients=(await safe(sb.from('patients').select('*').eq('organization_id',S.org.id).eq('status','active').order('last_name',{ascending:true}))).data||[];
  const saved=localStorage.getItem('komo_v14_patient');const p=S.patients.find(x=>x.id===saved)||S.patients[0]||null;if(p)localStorage.setItem('komo_v14_patient',p.id);
  await loadPatientContext(p);
  const os=await safe(sb.from('pulse_operator_sessions').select('*').eq('patient_id',p?.id||'00000000-0000-0000-0000-000000000000').in('status',['draft','running','paused','review']).order('created_at',{ascending:false}).limit(1));
  S.schema.operator=!os.error;S.opSession=os.data?.[0]||null;S.opSteps=S.opSession?((await safe(sb.from('pulse_operator_steps').select('*').eq('operator_session_id',S.opSession.id).order('sequence_order',{ascending:true}))).data||[]):[];
}
async function loadAll(){if(S.mode==='pro'&&hasPro())await loadPro();else await loadPatientContext(S.patient)}

function navItems(){return S.mode==='pro'?PRO_NAV:PATIENT_NAV}
function shell(){
  const nav=navItems().map(([id,label],i)=>`<button data-route="${id}" class="nav-item ${S.route===id?'active':''}"><span class="nav-dot">${i+1}</span><span>${label}</span></button>`).join('');
  const mode=hasPro()?`<div class="mode-switch"><button data-mode="patient" class="${S.mode==='patient'?'active':''}" ${!S.patient?'disabled':''}>Patient</button><button data-mode="pro" class="${S.mode==='pro'?'active':''}">Équipe</button></div>`:'';
  $('#app').innerHTML=`<div class="app-shell"><aside class="sidebar"><div><div class="brand">KŌMØ<small>PULSE</small></div><p class="sidebar-caption">Votre santé en mouvement</p></div><nav>${nav}</nav><div class="sidebar-bottom">${mode}<button class="text-button logout" id="logout">Se déconnecter</button></div></aside><main class="page"><header class="page-head"><div><span class="overline" id="pageOverline"></span><h1 id="pageTitle"></h1></div><div class="user-chip"><span>${esc((firstName()||S.user?.email||'K').slice(0,1).toUpperCase())}</span><div><strong>${esc(firstName())}</strong><small>${S.mode==='pro'?'Équipe KŌMØ':'Espace patient'}</small></div></div></header><div id="view"></div></main></div>`;
  document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.route});
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=async()=>{if(b.disabled)return;S.mode=b.dataset.mode;localStorage.setItem('komo_v14_mode',S.mode);location.hash=S.mode==='pro'?'operator':'home';await refresh()});
  $('#logout').onclick=async()=>{await sb.auth.signOut();location.hash='';authView()};
}
function heading(title,over='KŌMØ PULSE'){ $('#pageTitle').textContent=title;$('#pageOverline').textContent=over }
function progressStrip(){
  const p=patientProgress();
  return `<div class="progress-card"><div class="progress-top"><div><span class="overline">VOTRE BILAN</span><strong>${p.completed}/4 étapes terminées</strong></div><span class="progress-value">${p.percent}%</span></div><div class="progress-line"><i style="width:${p.percent}%"></i></div><div class="progress-steps">${p.steps.map((s,i)=>`<button class="progress-step ${s.done?'done':s.id===p.firstPending?'current':''}" onclick="location.hash='${s.id==='results'?'results':s.id==='motion'?'appointments':'baseline'}'"><b>${s.done?'✓':i+1}</b><span>${s.label}<small>${s.detail}</small></span></button>`).join('')}</div></div>`;
}
function patientHome(){
  heading('Bonjour '+esc(firstName()),'AUJOURD’HUI');
  const action=nextAction(),next=futureAppointments()[0],sc=Number(score()?.overall_score),b=band(sc);
  $('#view').innerHTML=`<section class="welcome-card"><div><span class="overline light">VOTRE PROCHAINE ÉTAPE</span><h2>${esc(action.title)}</h2><p>${esc(action.text)}</p><button class="button light" onclick="location.hash='${action.route}'">${esc(action.label)} →</button></div>${releasedScore()?`<div class="score-orb"><small>Motion Score</small><strong>${Math.round(sc)}</strong><span>${b.label}</span></div>`:`<div class="welcome-mark">K</div>`}</section>${progressStrip()}<section class="two-col"><article class="soft-card"><span class="overline">PROCHAIN RENDEZ-VOUS</span>${next?`<h3>${friendlyAppointmentType(next.appointment_type)}</h3><p class="big-date">${fmt(next.scheduled_start)}</p><p>${friendlyMode(next.location_mode)} · ${statusLabel(next.status)}</p><button class="button secondary" onclick="location.hash='appointments'">Voir les détails</button>`:`<h3>Aucun rendez-vous à venir</h3><p>Votre prochain rendez-vous apparaîtra ici dès qu’il sera programmé par l’équipe KŌMØ.</p><button class="button secondary" onclick="location.hash='appointments'">Mes rendez-vous</button>`}</article><article class="soft-card"><span class="overline">À RETENIR</span><h3>${releasedScore()?'Votre bilan est disponible':'Pulse vous guide étape par étape'}</h3><p>${releasedScore()?'Vos résultats sont présentés simplement : vos points forts, votre priorité et votre plan de progression.':'Vous n’avez rien à interpréter seul. Chaque étape se débloque au bon moment et les données sensibles sont revues avant publication.'}</p>${visibleGates().length?`<div class="human-alert">Un élément de votre bilan est actuellement relu par l’équipe. Cela ne signifie pas nécessairement qu’il existe un problème.</div>`:''}</article></section>`;
}
function baseline(){
  heading('Mon bilan','VOTRE BASELINE KŌMØ');
  const p=patientProgress();
  const cards=[
   ['01','Quelques questions','Santé, sommeil, énergie et mobilité','Elles nous donnent votre contexte avant les mesures.','questions'],
   ['02','Prise de sang','Votre contexte biologique','Les résultats sont intégrés après réception et revue.','biology'],
   ['03','Mesures de mouvement','Force, équilibre, mobilité et marche','Une séance guidée, non invasive, réalisée par l’équipe KŌMØ.','motion'],
   ['04','Vos résultats','Une synthèse claire et personnelle','Votre score et votre plan apparaissent après validation.','results']
  ];
  $('#view').innerHTML=`<section class="intro"><h2>Un bilan complet, en quatre étapes simples.</h2><p>Vous n’avez pas besoin de comprendre les appareils ni les algorithmes. Pulse vous indique seulement ce qui est fait, ce qu’il reste à faire et pourquoi.</p></section><section class="journey">${cards.map(([n,title,sub,text,id],i)=>{const st=p.steps[i];return`<article class="journey-card ${st.done?'done':id===p.firstPending?'current':''}"><div class="journey-num">${st.done?'✓':n}</div><div><span class="status-label">${st.done?'Terminé':id===p.firstPending?'Prochaine étape':'À venir'}</span><h3>${title}</h3><strong>${sub}</strong><p>${text}</p>${id==='motion'&&!st.done?`<button class="button secondary" onclick="location.hash='appointments'">Voir mes rendez-vous</button>`:''}${id==='results'&&st.done?`<button class="button primary" onclick="location.hash='results'">Voir mes résultats</button>`:''}</div></article>`}).join('')}</section><article class="info-note"><strong>Ce que nous ne faisons pas</strong><p>Nous ne transformons pas chaque donnée en une note arbitraire. Les informations médicales ou biologiques qui nécessitent une revue restent séparées de votre Motion Score.</p></article>`;
}
function results(){
  heading('Mes résultats','COMPRENDRE VOTRE MOUVEMENT');
  if(!releasedScore()){
    $('#view').innerHTML=`<section class="locked-state"><div class="lock-symbol">K</div><span class="overline">RÉSULTATS EN PRÉPARATION</span><h2>Vos résultats ne sont pas encore publiés.</h2><p>Ils apparaîtront ici dès que votre bilan sera complet et vérifié par l’équipe KŌMØ.</p><button class="button primary" onclick="location.hash='home'">Revenir à aujourd’hui</button></section>${progressStrip()}`;return;
  }
  const total=Number(score().overall_score),b=band(total),ds=domains(),valid=ds.filter(([, ,v])=>Number.isFinite(v)).sort((a,b)=>a[2]-b[2]),priority=valid[0],asset=valid.at(-1);
  $('#view').innerHTML=`<section class="result-hero"><div><span class="overline light">MOTION SCORE</span><div class="result-score"><strong>${Math.round(total)}</strong><span>/100</span></div><div class="score-band ${b.class}">${b.label}</div><p>Une vue synthétique de vos capacités de mouvement à ce moment précis. L’objectif est surtout de suivre votre évolution dans le temps.</p></div><div class="result-summary"><article><span>Votre point fort</span><strong>${esc(asset?.[0]||'—')}</strong></article><article><span>Votre priorité</span><strong>${esc(priority?.[0]||'—')}</strong></article></div></section><section class="domain-grid">${ds.map(([name,desc,v])=>{const bb=band(v);return`<article class="domain-card"><div class="domain-head"><div><h3>${name}</h3><p>${desc}</p></div><strong>${Number.isFinite(v)?Math.round(v):'—'}</strong></div><div class="meter"><i style="width:${Number.isFinite(v)?Math.max(0,Math.min(100,v)):0}%"></i></div><span class="mini-band ${bb.class}">${bb.label}</span></article>`}).join('')}</section><article class="info-note"><strong>Comment lire ces résultats ?</strong><p>Le score sert à suivre votre profil et votre progression. Il ne remplace pas une consultation médicale et ne résume pas à lui seul votre état de santé.</p><details><summary>Voir comment le score est organisé</summary><p>Il combine locomotion, force, fonction, équilibre et mobilité. Les informations médicales nécessitant une revue sont traitées séparément.</p></details></article>`;
}
function plan(){
  heading('Mon plan','VOTRE TRAJECTOIRE');
  if(!releasedScore()){
    $('#view').innerHTML=`<section class="locked-state"><div class="lock-symbol">12</div><span class="overline">VOTRE PLAN PERSONNALISÉ</span><h2>Votre plan sera construit après votre bilan.</h2><p>Il reposera sur 1 à 2 priorités maximum, avec des étapes simples et des points de contrôle.</p><button class="button primary" onclick="location.hash='baseline'">Voir mon bilan</button></section>`;return;
  }
  const valid=domains().filter(([, ,v])=>Number.isFinite(v)).sort((a,b)=>a[2]-b[2]),primary=valid[0],secondary=valid[1],asset=valid.at(-1);
  $('#view').innerHTML=`<section class="plan-head"><div><span class="overline light">12 SEMAINES</span><h2>Une priorité claire.<br>Une progression mesurable.</h2><p>Votre plan est volontairement simple : travailler ce qui compte le plus, sans perdre vos points forts.</p></div></section><section class="three-col"><article class="priority-card primary-priority"><span>Priorité principale</span><h3>${esc(primary?.[0]||'À définir')}</h3><p>${esc(primary?.[1]||'')}</p></article><article class="priority-card"><span>Priorité secondaire</span><h3>${esc(secondary?.[0]||'—')}</h3><p>${esc(secondary?.[1]||'')}</p></article><article class="priority-card"><span>À préserver</span><h3>${esc(asset?.[0]||'—')}</h3><p>Conserver ce point fort pendant le travail des priorités.</p></article></section><section class="phase-list"><article><b>01</b><div><span>Semaines 1–4</span><h3>Installer les bases</h3><p>Technique, régularité et tolérance à l’effort.</p></div></article><article><b>02</b><div><span>Semaines 5–8</span><h3>Renforcer</h3><p>Progression ciblée sur votre priorité principale.</p></div></article><article><b>03</b><div><span>Semaines 9–12</span><h3>Transférer</h3><p>Transformer les gains en fonction et mouvement réel.</p></div></article></section><section class="checkpoint-card"><div><span class="overline">PROCHAINS CONTRÔLES</span><h3>Mesurer pour ajuster, pas pour juger.</h3></div><div class="checkpoint-row">${S.checkpoints.length?S.checkpoints.slice(0,5).map(c=>`<div><strong>${String(c.checkpoint_type||'').toUpperCase()}</strong><span>${fmtShort(c.scheduled_at)}</span></div>`).join(''):`<div><strong>S2</strong><span>Suivi court</span></div><div><strong>S6</strong><span>Contrôle ciblé</span></div><div><strong>S12</strong><span>Réévaluation</span></div>`}</div></section>`;
}
function appointments(){
  heading('Mes rendez-vous',S.mode==='pro'?'AGENDA':'VOTRE SUIVI');
  const rows=[...S.appointments].sort((a,b)=>new Date(a.scheduled_start||0)-new Date(b.scheduled_start||0));
  $('#view').innerHTML=`<section class="intro"><h2>${S.mode==='pro'?'Agenda patient':'Retrouvez toutes vos prochaines étapes.'}</h2><p>${S.mode==='pro'?'Les rendez-vous du patient sélectionné.':'Les rendez-vous confirmés par votre équipe apparaissent ici avec leur date et leur format.'}</p></section><section class="appointment-list">${rows.length?rows.map(a=>`<article class="appointment-card ${new Date(a.scheduled_start||0)>=new Date()?'upcoming':'past'}"><div class="date-box"><strong>${fmtShort(a.scheduled_start)}</strong><span>${new Date(a.scheduled_start||0).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span></div><div><span class="status-label">${statusLabel(a.status)}</span><h3>${friendlyAppointmentType(a.appointment_type)}</h3><p>${friendlyMode(a.location_mode)}</p></div></article>`).join(''):`<article class="empty-state"><h3>Aucun rendez-vous programmé</h3><p>Dès qu’un rendez-vous est confirmé, il apparaîtra automatiquement ici.</p><a class="button secondary" href="mailto:contact@komolongevity.com">Contacter l’équipe KŌMØ</a></article>`}</section>`;
}
function patients(){
  heading('Patients','KŌMØ OPERATOR TEAM');
  $('#view').innerHTML=`<section class="intro"><h2>${esc(S.org?.name||'Centre KŌMØ')}</h2><p>Sélectionnez un patient pour ouvrir sa session de mesure.</p></section><section class="patient-list">${S.patients.map(p=>`<button data-patient="${p.id}"><span class="patient-avatar">${esc((p.first_name||p.last_name||'P').slice(0,1))}</span><span><strong>${esc([p.first_name,p.last_name].filter(Boolean).join(' '))}</strong><small>${esc(p.external_reference||'Patient KŌMØ')}</small></span><b>→</b></button>`).join('')}</section>`;
  document.querySelectorAll('[data-patient]').forEach(r=>r.onclick=async()=>{localStorage.setItem('komo_v14_patient',r.dataset.patient);await loadPro();location.hash='operator';render()});
}
function operator(){
  heading('Session D0','KŌMØ OPERATOR TEAM');
  const by=new Map(S.opSteps.map(x=>[x.step_code,x]));
  $('#view').innerHTML=`<section class="operator-head"><div><span class="overline light">PATIENT</span><h2>${esc(patientName()||'Patient')}</h2><p>Session guidée · environ 55 minutes · acquisition standardisée.</p></div><div class="operator-head-actions"><button class="button light" id="startOp">${S.opSession?'Reprendre D0':'Démarrer D0'}</button><button class="button outline-light" onclick="location.hash='patients'">Changer</button></div></section><section class="operator-grid"><div>${OP_STEPS.map(([code,time,title,device])=>{const st=by.get(code),status=st?.status||'pending';return`<article class="op-step ${status}"><div class="op-time">${time}</div><div><span>${device}</span><h3>${title}</h3></div><div class="op-actions"><b>${statusLabel(status)}</b>${S.opSession&&['pending','ready'].includes(status)?`<button data-step="${code}" data-action="start">Démarrer</button>`:''}${S.opSession&&status==='running'?`<button data-step="${code}" data-action="complete">Valider</button><button data-step="${code}" data-action="flag">À revoir</button>`:''}${S.opSession&&['complete','review'].includes(status)?`<button data-step="${code}" data-action="reset">Réouvrir</button>`:''}</div></article>`}).join('')}<button class="button primary wide" id="finalizeOp" ${!S.opSession?'disabled':''}>Finaliser D0</button></div><aside class="operator-aside"><span class="overline">ÉTAT DU DOSSIER</span><div class="simple-row"><span>Questionnaires</span><strong>${qdone()}</strong></div><div class="simple-row"><span>Biologie</span><strong>${bioReady()?'Prête':'En attente'}</strong></div><div class="simple-row"><span>Mesures</span><strong>${motionReady()?'Reçues':'En cours'}</strong></div><div class="simple-row"><span>Revue</span><strong>${visibleGates().length}</strong></div></aside></section>`;
  $('#startOp')?.addEventListener('click',startOperator);$('#finalizeOp')?.addEventListener('click',finalizeOperator);document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>operatorStep(b.dataset.step,b.dataset.action));
}
async function startOperator(){const r=await sb.rpc('start_pulse_operator_session_v1',{p_patient_id:S.patient.id,p_assessment_id:S.assessment?.id||null});if(r.error)return toast(r.error.message);await loadPro();operator();toast('Session D0 démarrée.')}
async function operatorStep(code,action){const payload={qc_status:action==='complete'?'pass':action==='flag'?'review':'pending'};const r=await sb.rpc('pulse_operator_step_v1',{p_session_id:S.opSession.id,p_step_code:code,p_action:action,p_payload:payload});if(r.error)return toast(r.error.message);await loadPro();operator()}
async function finalizeOperator(){if(!S.opSession)return toast('Aucune session active.');const r=await sb.rpc('finalize_pulse_operator_session_v1',{p_session_id:S.opSession.id});if(r.error)return toast(r.error.message);toast(r.data?.status==='completed'?'D0 finalisé.':'D0 transmis en revue.');await loadPro();operator()}

function render(){
  S.route=route();const allowed=navItems().map(x=>x[0]);if(!allowed.includes(S.route)){location.hash=allowed[0];return}
  shell();
  if(S.mode==='pro'){if(S.route==='operator')operator();else if(S.route==='patients')patients();else appointments()}
  else{if(S.route==='home')patientHome();else if(S.route==='baseline')baseline();else if(S.route==='results')results();else if(S.route==='plan')plan();else appointments()}
}
async function refresh(){if(S.loading)return;S.loading=true;try{await loadIdentity();await loadAll();render()}finally{S.loading=false}}
async function boot(){const session=(await sb.auth.getSession()).data.session;if(!session)return authView();await loadIdentity();if(!S.patient&&!hasPro()){$('#app').innerHTML=`<main class="orphan"><div class="brand">KŌMØ<small>PULSE</small></div><h1>Votre dossier patient n’est pas encore relié.</h1><p>Votre compte existe bien. L’équipe KŌMØ doit simplement terminer l’association avec votre dossier avant l’affichage de vos données.</p><a class="button primary" href="mailto:contact@komolongevity.com">Contacter l’équipe</a><button class="text-button" id="logoutOrphan">Se déconnecter</button></main>`;$('#logoutOrphan').onclick=async()=>{await sb.auth.signOut();authView()};return}await loadAll();render()}
window.addEventListener('hashchange',()=>{if(S.user){S.route=route();render()}});
sb.auth.onAuthStateChange((_e,s)=>{if(!s)authView()});
boot().catch(()=>authView('Une erreur est survenue. Réessayez dans quelques instants.'));

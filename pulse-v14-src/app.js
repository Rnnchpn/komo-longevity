import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const sb=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

const BOOKING_URL='https://app.acuityscheduling.com/schedule.php?owner=40696577';
const JOURNEY_URL='https://komolongevity.com/parcours/';
const CENTERS=[
  {id:'consultation-paris',name:'Consultation Paris — Centré',city:'Paris',detail:'Chez Centré · Bilan KŌMØ Motion',availability:'Réservation en ligne',description:'Vos consultations KŌMØ Motion à Paris, chez Centré. Choisissez une séance Initial, Suivi ou Advanced dans le planning dédié.',bookingUrl:BOOKING_URL,cta:'Choisir mon créneau'},
  {id:'consultation-cannes',name:'Consultation Cannes',city:'Cannes',detail:'KŌMØ Longevity · Cannes',availability:'Sur demande',description:'Votre bilan Motion sur la Côte d’Azur. Le planning Cannes sera ouvert dès validation de ses créneaux et de son lieu.',bookingUrl:null,cta:'Demander un rendez-vous'}
];
const CANNES_REQUEST_URL='mailto:contact@komolongevity.com?subject=Consultation%20KOMO%20Motion%20-%20Cannes';
const PATIENT_NAV=[['home','Accueil'],['results','Résultats'],['connected','Connected'],['appointments','Rendez-vous'],['mykomo','My KŌMØ']];
const PRO_NAV=[['operator','Bilan Motion'],['patients','Patients'],['appointments','Agenda']];
const ADMIN_NAV=[['admin','Tableau de bord'],['patients','Patients'],['appointments','Agenda']];
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

const S={user:null,role:'member',profile:null,mode:'patient',org:null,membership:null,patient:null,selfPatient:null,previewMode:false,previewPatientId:null,patients:[],orgAppointments:[],assessment:null,questionnaires:[],scores:[],measurements:[],programs:[],trajectory:[],appointments:[],bio:[],gates:[],checkpoints:[],opSession:null,opSteps:[],schema:{bio:false,operator:false},route:'home',loading:false};

const $=s=>document.querySelector(s);
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fmt=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d)};
const fmtShort=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(d)};
const safe=async q=>{try{const r=await q;return r.error?{data:null,error:r.error}:{data:r.data,error:null}}catch(error){return{data:null,error}}};
const toast=m=>{const e=$('#toast');if(!e)return;e.textContent=m;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,3300)};
const hasPro=()=>['professional','admin'].includes(S.role);
const patientName=()=>S.patient?([S.patient.preferred_name||S.patient.first_name,S.patient.last_name].filter(Boolean).join(' ')||S.profile?.display_name||''):(S.profile?.display_name||'');
const firstName=()=>patientName().split(' ')[0]||'Vous';
const route=()=>location.hash.replace(/^#/,'')||(S.mode==='admin'?'admin':(hasPro()&&S.mode==='pro')?'operator':'home');
const score=()=>S.scores[0]||null;
const subs=()=>score()?.subscores||{};
const qdone=()=>S.questionnaires.filter(x=>PREP_CODES.includes(x.instrument_code)&&(x.status==='completed'||Number(x.completeness||0)>=100)).length;
const bioReady=()=>S.bio.some(x=>['reviewed','released'].includes(x.status));
const motionReady=()=>S.measurements.length>0;
const releasedScore=()=>score()?.overall_score!==null&&score()?.overall_score!==undefined&&Number.isFinite(Number(score()?.overall_score));
const visibleGates=()=>S.gates.filter(g=>['open','review_required','referred'].includes(g.status));
const domainVal=(...keys)=>{for(const k of keys){const v=Number(subs()[k]);if(Number.isFinite(v))return v}return null};
const futureAppointments=()=>S.appointments.filter(a=>!['cancelled','canceled'].includes(a.status)&&new Date(a.scheduled_start||0).getTime()>=Date.now()).sort((a,b)=>new Date(a.scheduled_start)-new Date(b.scheduled_start));
const friendlyAppointmentType=v=>({motion:'Bilan de mouvement',clinical:'Consultation médicale',follow_up:'Suivi',baseline:'Bilan KŌMØ'}[v]||'Rendez-vous KŌMØ');
const friendlyMode=v=>({onsite:'Sur place',clinic:'En centre',home:'À domicile',yacht:'À bord',villa:'En villa',teleconsultation:'À distance',remote:'À distance'}[v]||'Avec votre équipe KŌMØ');
const statusLabel=v=>({scheduled:'Confirmé',confirmed:'Confirmé',pending:'En attente',completed:'Terminé',cancelled:'Annulé',review:'En revue',collecting:'En cours',draft:'À démarrer',running:'En cours',ready:'Prêt'}[v]||'En cours');

function patientProgress(){
  const steps=[
    {id:'questions',label:'Pré-bilan',done:qdone()>=6,detail:qdone()+' / 6 questionnaires terminés'},
    {id:'motion',label:'Motion',done:motionReady(),detail:motionReady()?'Mesures enregistrées':'Bilan de mouvement à réaliser'},
    {id:'results',label:'Résultats',done:releasedScore(),detail:releasedScore()?'Résultats publiés':'Disponibles après validation'}
  ];
  const firstPending=steps.find(x=>!x.done)?.id||'results';
  return {steps,firstPending,completed:steps.filter(x=>x.done).length,percent:Math.round(steps.filter(x=>x.done).length/steps.length*100)};
}
function nextAction(){
  if(!S.assessment)return {title:'Votre espace KŌMØ est prêt',text:'Votre équipe reliera votre premier bilan à votre compte. Vos rendez-vous sont déjà accessibles.',label:'Mes rendez-vous',route:'appointments'};
  if(qdone()<6)return {title:'Préparez votre bilan Motion',text:'Quelques questions sur votre mobilité, vos habitudes et votre récupération, à compléter avant votre rendez-vous.',label:'Remplir mes questionnaires',route:'questionnaires'};
  if(!motionReady())return {title:'Votre prochain bilan Motion',text:'Retrouvez votre rendez-vous et les étapes préparatoires de votre évaluation.',label:'Voir mon bilan',route:'baseline'};
  if(!releasedScore())return {title:'Vos résultats sont en préparation',text:'Votre équipe contrôle les mesures avant leur publication dans Pulse.',label:'Suivre mon bilan',route:'baseline'};
  return {title:'Votre trajectoire commence ici',text:'Retrouvez vos résultats publiés, votre plan et vos prochaines étapes.',label:'Voir mes résultats',route:'results'};
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
  $('#app').innerHTML=`<main class="login-page"><section class="login-story"><div class="brand light">KŌMØ<small>PULSE</small></div><div><span class="overline light">VOTRE SANTÉ EN MOUVEMENT</span><h1>Comprendre votre corps.<br><em>Simplement.</em></h1><p>Votre bilan, vos résultats et votre plan KŌMØ réunis au même endroit — sans jargon, étape par étape.</p></div><div class="login-foot">Données privées · Votre espace personnel</div></section><section class="login-panel"><form id="login" class="login-card"><span class="overline">KŌMØ PULSE</span><h2>Bienvenue sur KŌMØ Pulse</h2><p>Connectez-vous pour retrouver vos rendez-vous, votre bilan et votre trajectoire.</p><label><span>E-mail</span><input name="email" type="email" autocomplete="email" required></label><label><span>Mot de passe</span><input name="password" type="password" autocomplete="current-password" required minlength="6"></label><button class="button primary wide">Se connecter</button><button class="text-button" type="button" id="reset">Mot de passe oublié ?</button>${message?`<div class="form-error">${esc(message)}</div>`:''}</form></section></main>`;
  $('#login').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const r=await sb.auth.signInWithPassword({email:String(f.get('email')),password:String(f.get('password'))});if(r.error)return authView('Impossible de vous connecter. Vérifiez votre e-mail et votre mot de passe.');await boot()};
  $('#reset').onclick=async()=>{const email=prompt('Votre adresse e-mail');if(!email)return;const r=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin});toast(r.error?'Impossible d’envoyer l’e-mail.':'E-mail de réinitialisation envoyé.')};
}
async function loadIdentity(){
  const u=await sb.auth.getUser();S.user=u.data.user||null;if(!S.user)return false;
  S.profile=(await safe(sb.from('profiles').select('*').eq('id',S.user.id).maybeSingle())).data||{};
  const role=(await safe(sb.from('account_roles').select('role').eq('user_id',S.user.id).maybeSingle())).data;S.role=role?.role||'member';
  S.selfPatient=(await safe(sb.from('patients').select('*').eq('patient_user_id',S.user.id).maybeSingle())).data||null;
  S.patient=S.selfPatient;
  if(hasPro()){
    const mr=(await safe(sb.from('organization_members').select('*,organizations(*)').eq('user_id',S.user.id).eq('status','active'))).data||[];
    S.membership=mr[0]||null;S.org=S.membership?.organizations||null;
    const saved=localStorage.getItem('komo_v14_mode');S.mode=S.previewMode&&S.role==='admin'?'patient':saved==='patient'&&S.selfPatient?'patient':saved==='admin'&&S.role==='admin'?'admin':'pro';
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
  if(!S.org){S.patients=[];S.orgAppointments=[];return;}
  S.patients=(await safe(sb.from('patients').select('*').eq('organization_id',S.org.id).eq('status','active').order('last_name',{ascending:true}))).data||[];
  S.orgAppointments=(await safe(sb.from('organization_appointments').select('id,patient_id,appointment_type,scheduled_start,scheduled_end,status,location_mode').eq('organization_id',S.org.id).order('scheduled_start',{ascending:false}).limit(100))).data||[];
  const saved=localStorage.getItem('komo_v14_patient');const p=S.patients.find(x=>x.id===saved)||S.patients[0]||null;if(p)localStorage.setItem('komo_v14_patient',p.id);
  await loadPatientContext(p);
  const os=await safe(sb.from('pulse_operator_sessions').select('*').eq('patient_id',p?.id||'00000000-0000-0000-0000-000000000000').in('status',['draft','running','paused','review']).order('created_at',{ascending:false}).limit(1));
  S.schema.operator=!os.error;S.opSession=os.data?.[0]||null;S.opSteps=S.opSession?((await safe(sb.from('pulse_operator_steps').select('*').eq('operator_session_id',S.opSession.id).order('sequence_order',{ascending:true}))).data||[]):[];
}
async function loadAll(){if(S.previewMode&&S.role==='admin'){await loadPro();const authorized=S.patients.find(p=>p.id===S.previewPatientId);if(!authorized){S.previewMode=false;S.previewPatientId=null;S.mode='admin';return}await loadPatientContext(authorized)}else if((S.mode==='pro'||S.mode==='admin')&&hasPro())await loadPro();else await loadPatientContext(S.selfPatient)}

async function openPatientPreview(id){
  if(S.role!=='admin'){toast('Aperçu réservé à l’administrateur.');return}
  // Authorization remains entirely in the Supabase RLS; never accept arbitrary IDs.
  const allowed=S.patients.find(p=>p.id===id);
  if(!allowed){toast('Ce dossier n’est pas accessible à votre compte.');return}
  S.previewMode=true;S.previewPatientId=allowed.id;S.mode='patient';Q.active=null;
  await loadPatientContext(allowed);
  location.hash='home';render();
}
async function closePatientPreview(){
  S.previewMode=false;S.previewPatientId=null;Q.active=null;S.mode='admin';
  localStorage.setItem('komo_v14_mode','admin');
  await loadPro();location.hash='admin';render();
}
function navIcon(route){
 const paths={
  home:'<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/>',
  results:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 15v3M12 10v8M17 7v11"/>',
  connected:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7 13 3-3 3 4 4-5"/><path d="M7 17h10"/>',
  appointments:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M8 15h3"/>',
  mykomo:'<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
  admin:'<path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/>',
  patients:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M18 10a3 3 0 1 0-2-5.2M17 14a5 5 0 0 1 4 5"/>',
  operator:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h8M8 17h5"/>',
  baseline:'<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  questionnaires:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  plan:'<path d="M4 19V5M4 19h16M7 15l4-5 3 2 5-6"/>'
 };
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[route]||paths.home)+'</svg>';
}
function navItems(){return S.mode==='admin'&&S.role==='admin'?ADMIN_NAV:S.mode==='pro'?PRO_NAV:PATIENT_NAV}
function shell(){
  const nav=navItems().map(([id,label],i)=>`<button data-route="${id}" class="nav-item ${(S.route===id||(id==='appointments'&&CENTERS.some(c=>c.id===S.route)))?'active':''}"><span class="nav-glyph" aria-hidden="true">${navIcon(id)}</span><span>${label}</span></button>`).join('');
  const mode=hasPro()?`<div class="mode-switch"><button data-mode="patient" class="${S.mode==='patient'&&!S.previewMode?'active':''}" ${!S.selfPatient?'disabled':''}>Mon compte</button>${S.role==='admin'?`<button data-mode="preview" class="${S.previewMode?'active':''}" ${!S.patients.length?'disabled':''}>Aperçu patient</button>`:''}<button data-mode="pro" class="${S.mode==='pro'?'active':''}">Pro</button>${S.role==='admin'?`<button data-mode="admin" class="${S.mode==='admin'?'active':''}">Admin</button>`:''}</div>`:'';
  $('#app').innerHTML=`<div class="app-shell"><aside class="sidebar"><div><div class="brand">KŌMØ<small>PULSE</small></div><p class="sidebar-caption">Votre santé en mouvement</p></div><nav>${nav}</nav><div class="sidebar-bottom">${mode}<button class="text-button logout" id="logout">Se déconnecter</button></div></aside><main class="page"><header class="page-head"><div><span class="overline" id="pageOverline"></span><h1 id="pageTitle"></h1></div><div class="ph-head-actions"><button type="button" class="text-button ph-menu-button" id="userMenuToggle" aria-label="Options du compte">Compte</button><div class="user-chip"><span>${esc((firstName()||S.user?.email||'K').slice(0,1).toUpperCase())}</span><div><strong>${esc(firstName())}</strong><small>${S.mode==='admin'?'Administration KŌMØ':S.mode==='pro'?'Équipe KŌMØ':'Espace patient'}</small></div></div></div></header><div id="ph-account-menu" hidden>${mode}<button id="mobileLogout" class="button secondary">Se déconnecter</button></div><div id="view">${S.previewMode?'<div class="ph-preview-banner" role="status"><div><strong>Aperçu patient · Lecture seule</strong><span>Vous voyez ce que contient ce dossier autorisé. Vous restez connecté en tant qu’administrateur.</span></div><button class="button secondary" id="previewExit">Retour Admin</button></div>':''}</div></main></div>`;
  document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.route});
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=async()=>{if(b.disabled)return;if(b.dataset.mode==='preview'){const p=S.patients.find(x=>x.id===S.previewPatientId)||S.patients[0];if(p)await openPatientPreview(p.id);return}S.previewMode=false;S.previewPatientId=null;S.mode=b.dataset.mode;localStorage.setItem('komo_v14_mode',S.mode);location.hash=S.mode==='pro'?'operator':S.mode==='admin'?'admin':'home';await refresh()});
  $('#logout').onclick=async()=>{await sb.auth.signOut();location.hash='';authView()};
  $('#userMenuToggle').onclick=()=>{$('#ph-account-menu').hidden=!$('#ph-account-menu').hidden};
  $('#mobileLogout').onclick=async()=>{await sb.auth.signOut();location.hash='';authView()};
  $('#previewExit')?.addEventListener('click',closePatientPreview);
}
function heading(title,over='KŌMØ PULSE'){ $('#pageTitle').textContent=title;$('#pageOverline').textContent=over }
function progressStrip(){
  const p=patientProgress();
  return `<div class="progress-card"><div class="progress-top"><div><span class="overline">VOTRE BILAN</span><strong>${p.completed}/${p.steps.length} étapes terminées</strong></div><span class="progress-value">${p.percent}%</span></div><div class="progress-line"><i style="width:${p.percent}%"></i></div><div class="progress-steps">${p.steps.map((s,i)=>`<button class="progress-step ${s.done?'done':s.id===p.firstPending?'current':''}" onclick="location.hash='${s.id==='results'?'results':s.id==='motion'?'appointments':'baseline'}'"><b>${s.done?'✓':i+1}</b><span>${s.label}<small>${s.detail}</small></span></button>`).join('')}</div></div>`;
}
function patientHome(){
  heading('Bienvenue sur KŌMØ Pulse','VOTRE ESPACE PERSONNEL');
  const ap=futureAppointments()[0],action=nextAction();
  const n=qdone(),pct=Math.round(100*Math.min(6,n)/6),sc=releasedScore()?Math.round(Number(score().overall_score)):null;
  const last=S.trajectory?.[0],nextCheck=S.checkpoints?.find(x=>new Date(x.scheduled_at||0).getTime()>=Date.now()&&x.status!=='cancelled');
  $('#view').innerHTML=`
   <section class="ph-hero">
     <div class="ph-photo"><span class="ph-eyebrow">KŌMØ · LONGEVITY IN MOTION</span><h2>Votre santé.<br>Votre mouvement.<br><em>Votre trajectoire.</em></h2><p>Bonjour ${esc(firstName())}. Suivez votre bilan, vos résultats et ce qui compte aujourd’hui.</p></div>
     <article class="ph-next"><span class="overline">VOTRE PROCHAIN RENDEZ-VOUS</span>${ap?`<h3>${esc(friendlyAppointmentType(ap.appointment_type))}</h3><strong class="ph-date">${fmt(ap.scheduled_start)}</strong><p>${new Date(ap.scheduled_start).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · ${esc(friendlyMode(ap.location_mode))}</p><span class="status-label">${esc(statusLabel(ap.status))}</span>`:`<h3>Planifiez votre bilan Motion</h3><p>Choisissez votre créneau, puis votre équipe vous guidera pour préparer la séance dans Pulse.</p>`}<button class="button primary" data-go="appointments">Choisir ma consultation →</button><span class="ph-next-note">Deux destinations : Paris — Centré ou Cannes.</span></article>
   </section>
   <section class="ph-centers-shortcut" aria-label="Nos deux lieux de consultation"><span>CONSULTATIONS KŌMØ</span><button type="button" data-go="consultation-paris">Paris · Centré <b>↗</b></button><button type="button" data-go="consultation-cannes">Cannes <b>↗</b></button></section>
   <section class="ph-intro"><div><span class="overline">AUJOURD’HUI</span><h2>Voici où vous en êtes.</h2><p>Un regard simple sur votre progression, sans données inventées.</p></div><button class="button secondary" data-go="questionnaires">Préparer mon bilan</button></section>
   <section class="ph-card-grid">
     <article class="ph-card"><span class="overline">01 · MOTION</span><h3>Mon Motion Score</h3><div class="ph-metric">${sc===null?'—':sc}<small>${sc===null?'En attente de validation':'/ 100 · publié'}</small></div><p>Vos mesures de mouvement et leur évolution dans le temps.</p><button class="text-button" data-go="results">Voir mes résultats →</button></article>
     <article class="ph-card"><span class="overline">02 · TRAJECTOIRE</span><h3>Ma progression</h3><div class="ph-metric small">${nextCheck?'Prochaine étape':last?'Suivi disponible':'À construire'}</div><p>${nextCheck?`Prochain contrôle : ${fmt(nextCheck.scheduled_at)}`:last?`Dernier événement : ${fmt(last.event_date)}`:'Votre suivi commencera après votre premier bilan.'}</p><button class="text-button" data-go="plan">Ma trajectoire →</button></article>
     <article class="ph-card"><span class="overline">03 · CONNECTED</span><h3>Mes données</h3><div class="ph-metric small">${S.measurements.length?'Motion connecté':'À connecter'}</div><p>Accédez à vos mesures réellement disponibles. Aucun chiffre simulé.</p><button class="text-button" data-go="connected">Voir mes données →</button></article>
     <article class="ph-card"><span class="overline">04 · MY KŌMØ</span><h3>Mon espace</h3><div class="ph-metric small">${n}/6 modules</div><p>${pct}% du pré-bilan renseigné. Votre profil, vos questionnaires et votre plan au même endroit.</p><button class="text-button" data-go="mykomo">Ouvrir My KŌMØ →</button></article>
   </section>
   <section class="ph-bottom"><article class="ph-today"><span class="overline">VOTRE PROCHAINE ACTION</span><h3>${esc(action.title)}</h3><p>${esc(action.text)}</p><button class="button primary" data-go="${action.route}">${esc(action.label)} →</button></article><article class="ph-world"><span class="overline">KŌMØ WORLD</span><h3>Le mouvement, au-delà du bilan.</h3><p>Retrouvez l’univers KŌMØ et découvrez les expériences autour de la longévité locomotrice.</p><a href="${JOURNEY_URL}" target="_blank" rel="noopener noreferrer">Comprendre le parcours KŌMØ →</a></article></section>
  `;
  document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>location.hash=b.dataset.go));
}
function baseline(){
  heading('Mon bilan Motion','UN PARCOURS SIMPLE');
  const n=qdone(),last=S.assessment;
  $('#view').innerHTML=`<section class="intro"><h2>Comprendre votre mouvement. Préparer la suite.</h2><p>Trois étapes, un seul dossier. Vous n’avez pas à interpréter les données seul : l’équipe KŌMØ vérifie ce qui peut être publié.</p></section>
    <section class="ph-three">
      <article class="ph-card"><span class="overline">01 · AVANT LA CONSULTATION</span><h3>Mes questionnaires</h3><div class="ph-metric small">${n} / 6</div><p>Mobilité, situation, sommeil, bien-être, mode de vie et contexte personnel.</p><button class="button primary" data-go="questionnaires">${last?'Commencer / continuer':'Voir mon pré-bilan'} →</button></article>
      <article class="ph-card"><span class="overline">02 · LORS DU RENDEZ-VOUS</span><h3>Mon bilan Motion</h3><div class="ph-metric small">${motionReady()?'Mesures reçues':'À réaliser'}</div><p>Force, fonction, équilibre, locomotion selon les mesures réellement effectuées.</p><button class="button secondary" data-go="appointments">Mes rendez-vous →</button></article>
      <article class="ph-card"><span class="overline">03 · APRÈS LE BILAN</span><h3>Mes résultats</h3><div class="ph-metric small">${releasedScore()?'Publiés':'En attente'}</div><p>Vos résultats vérifiés et votre trajectoire, disponibles lorsqu’ils sont prêts.</p><button class="button secondary" data-go="results">Consulter →</button></article>
    </section>
    <article class="info-note"><strong>Votre confidentialité</strong><p>Chaque questionnaire est associé à votre dossier personnel et soumis aux droits d’accès de Pulse. Les signaux nécessitant une revue sont traités séparément du Motion Score.</p></article>`;
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.hash=b.dataset.go);
}
function connected(){
  heading('Connected','VOS DONNÉES RELIÉES');
  const m=S.measurements;
  $('#view').innerHTML=`<section class="intro"><h2>Vos mesures, au même endroit.</h2><p>Nous affichons uniquement les données réellement présentes dans votre dossier. Les appareils et applications qui ne sont pas connectés ne sont jamais présentés comme actifs.</p></section>
  <section class="ph-three">
   <article class="ph-card"><span class="overline">KŌMØ MOTION</span><h3>Mesures fonctionnelles</h3><div class="ph-metric small">${m.length?m.length+' relevé(s)':'En attente'}</div><p>Mesures rattachées à votre bilan.</p><button class="button secondary" data-go="results">Mes résultats</button></article>
   <article class="ph-card"><span class="overline">VALD</span><h3>Force & équilibre</h3><div class="ph-metric small">${m.length?'Vérifier les résultats':'Non relié'}</div><p>Les données VALD ne sont affichées qu’après import et vérification.</p></article>
   <article class="ph-card"><span class="overline">AUTRES SOURCES</span><h3>Mes objets connectés</h3><div class="ph-metric small">Non connecté</div><p>La connexion de nouvelles sources n’est pas encore active dans cet espace.</p></article>
  </section>`;document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.hash=b.dataset.go);
}
function mykomo(){
  heading('My KŌMØ','MON ESPACE');
  const p=S.patient||{},display=esc(patientName()||S.profile?.display_name||'Mon espace');
  $('#view').innerHTML=`<section class="intro"><h2>Bonjour ${esc(firstName())}.</h2><p>Vos informations personnelles, votre bilan et vos prochains rendez-vous.</p></section>
    <section class="ph-three">
     <article class="ph-card"><span class="overline">MON PROFIL</span><h3>${display}</h3><p>${esc(S.previewMode?(p.email||'Dossier autorisé'):(S.user?.email||''))}<br>${p.birth_date?'Date de naissance enregistrée':'Profil à compléter auprès de votre équipe'}</p></article>
     <article class="ph-card"><span class="overline">MON BILAN</span><h3>Préparer ma consultation</h3><p>${qdone()} questionnaires complétés · bilan ${S.assessment?'relié':'à préparer'}.</p><button class="button primary" data-go="baseline">Mon bilan →</button></article>
     <article class="ph-card"><span class="overline">MA TRAJECTOIRE</span><h3>Mon plan</h3><p>Votre suivi après le bilan et les rendez-vous à venir.</p><button class="button secondary" data-go="plan">Mon plan →</button></article>
    </section><section class="ph-account-footer"><a href="https://komolongevity.com/fr/confidentialite/" target="_blank" rel="noopener">Confidentialité</a><button class="button secondary" id="myLogout">Se déconnecter</button></section>`;
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.hash=b.dataset.go);
  $('#myLogout').onclick=async()=>{await sb.auth.signOut();location.hash='';authView()};
}

const PREP_CODES=['KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'];
const Q={registry:[],active:null,answers:{},busy:false};
const qDisplay=code=>Q.registry.find(x=>x.code===code)?.configuration?.display_label||Q.registry.find(x=>x.code===code)?.label||code;
const qSession=code=>S.questionnaires.find(x=>x.instrument_code===code);
const qOptions=(cfg,it)=>it.options||(
 it.type==='scale'?cfg.response_scale:
 it.type==='frequency'?cfg.frequency_options:
 it.type==='difficulty'?cfg.difficulty_options:
 it.type==='impact'?cfg.impact_options:
 it.type==='tri_state'?cfg.default_options:[])||[];
function qShowItem(code,item,a){
  if(code==='KOMO_BASELINE_CORE'&&item==='B04_INJURY')return !!a.B04_COUNT&&a.B04_COUNT!=='none';
  if(code==='KOMO_BASELINE_CORE'&&['B08_DATE','B08_DETAIL'].includes(item))return a.B08===true;
  if(code==='KOMO_SLEEP_RECOVERY'&&item==='SR10_REASON')return a.SR10===false;
  return true;
}
function qControl(key,it,cfg,old){
  const type=it.type||'text',opts=type==='yes_no'?[{value:'yes',label:'Oui'},{value:'no',label:'Non'}]:qOptions(cfg,it);
  if(type==='multi_choice')return `<div class="ph-q-options">${opts.map(o=>`<label><input type="checkbox" name="${esc(key)}" value="${esc(o.value)}" ${Array.isArray(old)&&old.map(String).includes(String(o.value))?'checked':''}><span>${esc(o.label)}</span></label>`).join('')}</div>`;
  if(opts.length)return `<div class="ph-q-options">${opts.map(o=>{const match=type==='yes_no'?(old===(o.value==='yes')):String(old??'')===String(o.value);return `<label><input type="radio" name="${esc(key)}" value="${esc(o.value)}" ${match?'checked':''}><span>${esc(o.label)}</span></label>`}).join('')}</div>`;
  if(type==='number')return `<input type="number" name="${esc(key)}" min="${it.min??''}" max="${it.max??''}" step="${it.step??'any'}" value="${old??''}" placeholder="Votre réponse"> ${esc(it.suffix||'')}`;
  if(type==='date')return `<input type="date" name="${esc(key)}" value="${esc(old||'')}">`;
  if(type==='text')return `<textarea name="${esc(key)}" rows="2" placeholder="Votre réponse">${esc(old||'')}</textarea>`;
  return `<input name="${esc(key)}" value="${esc(old??'')}" placeholder="Votre réponse">`;
}
function qRaw(form,item,it){
  if(it.type==='multi_choice')return [...form.querySelectorAll(`[name="${item}"]:checked`)].map(x=>x.value);
  if(['yes_no','choice','scale','frequency','difficulty','impact','tri_state'].includes(it.type)){
    const x=form.querySelector(`[name="${item}"]:checked`);
    if(!x)return undefined;
    if(it.type==='yes_no')return x.value==='yes';
    if(['scale','frequency','difficulty','impact'].includes(it.type)&&x.value.trim()!==''&&!Number.isNaN(Number(x.value)))return Number(x.value);
    return x.value;
  }
  const f=form.elements.namedItem(item);
  if(!f||!f.value)return undefined;
  return it.type==='number'?Number(f.value):f.value;
}
async function questionnaires(){
  heading('Mes questionnaires','PRÉPARER MON BILAN MOTION');
  if(!S.assessment){
    $('#view').innerHTML=`<section class="locked-state"><div class="lock-symbol">01</div><h2>Votre pré-bilan sera bientôt disponible.</h2><p>Votre équipe doit d’abord associer votre rendez-vous à un bilan Motion dans Pulse. Aucun questionnaire n’est perdu.</p><button class="button primary" onclick="location.hash='appointments'">Voir mes rendez-vous</button></section>`;
    return;
  }
  $('#view').innerHTML='<section class="ph-card"><h3>Chargement de vos questionnaires…</h3></section>';
  if(!Q.registry.length){
    const r=await safe(sb.from('instrument_registry').select('code,label,version,configuration').in('code',PREP_CODES).eq('can_render',true));
    if(r.error){$('#view').innerHTML='<section class="info-note"><strong>Questionnaires momentanément indisponibles.</strong><p>Veuillez réessayer depuis Mon bilan.</p></section>';return}
    Q.registry=r.data||[];
  }
  if(route()!=='questionnaires')return;
  if(!Q.active){
    $('#view').innerHTML=`<section class="intro"><h2>Quelques questions pour mieux vous connaître.</h2><p>Vous pouvez répondre en plusieurs fois. Vos réponses sont associées à votre dossier et restent modifiables avant votre bilan.</p></section><section class="ph-questions-grid">${PREP_CODES.filter(x=>Q.registry.some(y=>y.code===x)).map((code,i)=>{const ses=qSession(code),done=ses?.status==='completed'||Number(ses?.completeness||0)>=100;return `<button type="button" class="ph-q-tile" data-q-open="${esc(code)}"><span class="overline">${String(i+1).padStart(2,'0')} · ${done?'TERMINÉ':'À RENSEIGNER'}</span><h3>${esc(qDisplay(code))}</h3><p>${esc(Q.registry.find(x=>x.code===code)?.configuration?.intro||'')}</p><span>${done?'✓ Relire mes réponses':ses?`Reprendre · ${Math.round(Number(ses.completeness||0))}%`:'Commencer'} →</span></button>`}).join('')}</section><article class="info-note"><strong>Pourquoi ces questions ?</strong><p>Ces informations donnent du contexte à votre bilan. Elles ne constituent ni diagnostic ni score clinique automatisé.</p></article>`;
    document.querySelectorAll('[data-q-open]').forEach(b=>b.onclick=()=>{Q.active=b.dataset.qOpen;questionnaires()});
    return;
  }
  const code=Q.active,reg=Q.registry.find(x=>x.code===code);
  if(!reg){Q.active=null;return questionnaires()}
  const sess=qSession(code);
  Q.answers={};
  if(sess){
    const a=await safe(sb.from('questionnaire_responses').select('item_code,raw_value').eq('questionnaire_session_id',sess.id));
    if(a.error)return toast('Impossible de charger vos réponses.');
    (a.data||[]).forEach(x=>Q.answers[x.item_code]=x.raw_value);
  }
  if(route()!=='questionnaires')return;
  const cfg=reg.configuration||{},order=cfg.item_order||Object.keys(cfg.items||{});
  const safetyAlert=code==='KOMO_BASELINE_CORE'&&['S01','S02','S03','S04','S05'].some(k=>Q.answers[k]===true);
  $('#view').innerHTML=`<div class="ph-q-toolbar"><button class="text-button" id="qBack">← Tous les questionnaires</button><span>${Math.round(Number(sess?.completeness||0))}% complété</span></div>
  <section class="ph-q-sheet"><span class="overline">VOTRE PRÉ-BILAN</span><h2>${esc(cfg.display_label||reg.label)}</h2><p>${esc(cfg.intro||'')}</p>${safetyAlert?'<div class="human-alert">Une réponse de sécurité nécessite un avis professionnel avant tout test physique. En cas de symptôme aigu ou inquiétant, contactez les services médicaux appropriés.</div>':''}
  <form id="qLiveForm" class="ph-q-form">${order.map(item=>{const it=cfg.items?.[item]||{};return `<div class="ph-q-field" data-q-item="${esc(item)}" ${qShowItem(code,item,Q.answers)?'':'hidden'}><label class="ph-q-label">${esc(it.prompt||item)} ${it.required!==false?'<span aria-label="Obligatoire">*</span>':''}</label>${qControl(item,it,cfg,Q.answers[item])}</div>`}).join('')}
    ${S.previewMode?'<div class="ph-preview-form-note">Aperçu administrateur · Réponses en lecture seule. Aucune modification possible.</div>':'<div class="ph-q-actions"><button type="button" class="button secondary" id="qSaveDraft">Enregistrer et reprendre plus tard</button><button class="button primary" type="submit" id="qFinish">Enregistrer et terminer →</button></div>'}
    <div class="ph-q-feedback" id="qFeedback" role="status"></div></form></section>`;
  $('#qBack').onclick=()=>{Q.active=null;questionnaires()};
  const form=$('#qLiveForm');
  if(S.previewMode){form.querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=true);return}
  function current(){
    const answers={...Q.answers};
    for(const item of order){const v=qRaw(form,item,cfg.items?.[item]||{});if(v!==undefined)answers[item]=v}
    return answers;
  }
  function refreshQVisibility(){const a=current();for(const item of order){const el=form.querySelector(`[data-q-item="${item}"]`);if(el)el.hidden=!qShowItem(code,item,a)}}
  form.addEventListener('change',refreshQVisibility);
  form.onsubmit=e=>{e.preventDefault();saveQuestionnaire(code,form,true)};
  $('#qSaveDraft').onclick=()=>saveQuestionnaire(code,form,false);
}
async function saveQuestionnaire(code,form,complete){
  if(S.previewMode){toast('Aperçu en lecture seule : enregistrement bloqué.');return}
  if(Q.busy)return;
  Q.busy=true;const feedback=$('#qFeedback');const buttons=form.querySelectorAll('button');buttons.forEach(x=>x.disabled=true);
  const reg=Q.registry.find(x=>x.code===code),cfg=reg.configuration||{},order=cfg.item_order||Object.keys(cfg.items||{}),now=new Date().toISOString();
  try{
    const answers={...Q.answers};for(const item of order){const raw=qRaw(form,item,cfg.items?.[item]||{});if(raw!==undefined)answers[item]=raw}
    const visible=order.filter(k=>qShowItem(code,k,answers));
    const required=visible.filter(k=>cfg.items[k]?.required!==false);
    const filled=k=>answers[k]!==undefined&&answers[k]!==null&&answers[k]!==''&&(!Array.isArray(answers[k])||answers[k].length>0);
    const missing=required.filter(k=>!filled(k));
    const completeness=required.length?Math.round(100*(required.length-missing.length)/required.length):100;
    let session=qSession(code);
    if(!session){
      const r=await sb.from('questionnaire_sessions').insert({assessment_id:S.assessment.id,instrument_code:code,instrument_version:reg.version,status:'in_progress',score_status:'not_scored',completeness:0,started_at:now,created_by:S.user.id}).select().single();
      if(r.error)throw r.error;session=r.data;
    }
    const rows=visible.filter(filled).map(k=>({questionnaire_session_id:session.id,item_code:k,response_code:typeof answers[k]==='string'?answers[k]:null,raw_value:answers[k],normalized_value:answers[k],source:'patient',clinician_verified:false,triggered_by:'PULSE_V15_PATIENT',completed_at:now,updated_at:now}));
    if(rows.length){
      const r=await sb.from('questionnaire_responses').upsert(rows,{onConflict:'questionnaire_session_id,item_code'});
      if(r.error)throw r.error;
    }
    const done=missing.length===0;
    const patch={completeness,status:done?'completed':'in_progress',score_status:'not_scored',completed_at:done?now:null,updated_at:now};
    const u=await sb.from('questionnaire_sessions').update(patch).eq('id',session.id);
    if(u.error)throw u.error;
    S.questionnaires=(await safe(sb.from('questionnaire_sessions').select('*').eq('assessment_id',S.assessment.id))).data||[];
    Q.answers=answers;
    if(complete&&missing.length){feedback.textContent=`${missing.length} réponse(s) obligatoire(s) restent à compléter. Vos réponses ont bien été sauvegardées.`;feedback.className='ph-q-feedback ph-q-warn'}
    else{feedback.textContent='Vos réponses ont été enregistrées.';feedback.className='ph-q-feedback ph-q-success'}
    if((!complete)||done){Q.active=null;questionnaires();toast('Réponses enregistrées dans votre dossier.')}
  }catch(err){
    console.error('[pulse questionnaire]',err);feedback.textContent='Enregistrement impossible. Vos réponses n’ont pas été confirmées : réessayez.';feedback.className='ph-q-feedback ph-q-warn';
  }finally{buttons.forEach(x=>x.disabled=false);Q.busy=false}
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

function consultationCards(){
 return '<section class="ph-center-choices" aria-label="Les deux lieux de consultation KŌMØ">'+CENTERS.map((c,i)=>`<article class="ph-center-choice ph-center-${i===0?'paris':'cannes'}"><div class="ph-center-number">0${i+1} / 02</div><div class="ph-center-art" aria-hidden="true"><span>KŌMØ</span></div><div class="ph-center-body"><span class="overline">${esc(c.city.toUpperCase())} · KŌMØ MOTION</span><h3>${esc(c.name)}</h3><p>${esc(c.detail)}</p><span class="ph-center-status">${esc(c.availability)}</span><button type="button" class="button ${i===0?'primary':'secondary'}" data-center="${c.id}">Découvrir cette consultation <span aria-hidden="true">→</span></button></div></article>`).join('')+'</section>';
}
function centerDetail(id){
 const c=CENTERS.find(x=>x.id===id);if(!c){location.hash='appointments';return}
 heading(c.name,'CONSULTATIONS · KŌMØ MOTION');
 const paris=c.id==='consultation-paris';
 $('#view').innerHTML=`<section class="ph-center-detail"><button class="text-button" id="backCenters">← Les deux consultations</button><div class="ph-center-detail-grid"><div class="ph-center-detail-photo ${paris?'is-paris':'is-cannes'}"><span>KŌMØ / ${esc(c.city.toUpperCase())}</span><h2>${paris?'Votre mouvement.<br>Au cœur de Paris.':'Votre mouvement.<br>Sur la Riviera.'}</h2></div><div class="ph-center-detail-copy"><span class="overline">${paris?'01':'02'} · CONSULTATION KŌMØ</span><h2>${esc(c.name)}</h2><p>${esc(c.description)}</p><div class="ph-center-detail-facts"><div><strong>Lieu</strong><span>${esc(c.detail)}</span></div><div><strong>Disponibilité</strong><span>${esc(c.availability)}</span></div><div><strong>Votre espace</strong><span>Vos questionnaires et résultats dans Pulse</span></div></div>${paris?`<a class="button primary" href="${BOOKING_URL}" target="_blank" rel="noopener noreferrer">Voir les créneaux sur Acuity →</a><p class="ph-center-footnote">Le planning Acuity est celui de Centré Paris × KŌMØ. La réservation ne se synchronise pas encore automatiquement avec Pulse.</p>`:`<a class="button primary" href="${CANNES_REQUEST_URL}">Demander une consultation à Cannes →</a><p class="ph-center-footnote">Le calendrier Acuity Cannes n'est pas encore configuré. Votre demande est adressée à l'équipe KŌMØ, sans réservation automatique.</p>`}</div></div></section>`;
 $('#backCenters').onclick=()=>location.hash='appointments';
}
function appointments(){
 heading(S.mode==='patient'?'Mes consultations':'Agenda des consultations','PARIS — CENTRÉ / CANNES');
 const staff=S.mode==='pro'||S.mode==='admin';
 const rows=[...(staff?S.orgAppointments:S.appointments)].filter(a=>a.status!=='cancelled').sort((a,b)=>new Date(a.scheduled_start||0)-new Date(b.scheduled_start||0));
 const names=new Map(S.patients.map(p=>[p.id,[p.first_name,p.last_name].filter(Boolean).join(' ')]));
 $('#view').innerHTML=`<section class="ph-centers-heading"><span class="overline">KŌMØ LONGEVITY · CONSULTATIONS</span><h2>Deux villes.<br><em>Un même parcours Motion.</em></h2><p>Choisissez votre lieu de consultation. Paris chez Centré ou Cannes avec KŌMØ. Aucune autre destination n'est proposée à la réservation.</p></section>${consultationCards()}<section class="ph-appointments-existing"><div class="ph-appointments-title"><span class="overline">${staff?'AGENDA D’ÉQUIPE':'MES RENDEZ-VOUS ENREGISTRÉS'}</span><h3>${staff?'Les rendez-vous de votre organisation':'Mes prochains rendez-vous'}</h3></div><div class="appointment-list">${rows.length?rows.map(a=>`<article class="appointment-card ${new Date(a.scheduled_start||0)>=new Date()?'upcoming':'past'}"><div class="date-box"><strong>${fmtShort(a.scheduled_start)}</strong><span>${new Date(a.scheduled_start||0).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span></div><div><span class="status-label">${esc(statusLabel(a.status))}</span><h3>${esc(friendlyAppointmentType(a.appointment_type))}</h3><p>${esc(friendlyMode(a.location_mode))}${staff?` · ${esc(names.get(a.patient_id)||'Dossier patient')}`:''}</p></div></article>`).join(''):`<article class="empty-state"><h3>${staff?'Aucun rendez-vous enregistré':'Pas encore de rendez-vous dans Pulse'}</h3><p>${staff?'Les dossiers autorisés apparaîtront ici.':'Vous pouvez réserver votre consultation à Paris ou demander un créneau à Cannes ci-dessus. Une réservation externe n’apparaît pas encore automatiquement dans Pulse.'}</p></article>`}</div></section>`;
 document.querySelectorAll('[data-center]').forEach(b=>b.onclick=()=>location.hash=b.dataset.center);
}

function admin(){
  heading('Administration KŌMØ','ESPACE ADMINISTRATEUR');
  const upcoming=S.orgAppointments.filter(a=>new Date(a.scheduled_start||0)>=new Date()&&a.status!=='cancelled').length;
  $('#view').innerHTML=`<section class="intro"><h2>${esc(S.org?.name||'Organisation non associée')}</h2><p>Vue administrative limitée aux dossiers et rendez-vous auxquels votre compte est autorisé. Les droits sont vérifiés par la base de données.</p></section>
    <section class="ph-three">
      <article class="ph-card"><span class="overline">DOSSIERS AUTORISÉS</span><h3>Patients</h3><div class="ph-metric">${S.patients.length}</div><p>Patients actifs accessibles à votre organisation.</p><button class="button primary" data-go="patients">Ouvrir les dossiers →</button><button type="button" class="button secondary" id="adminPreviewLaunch" ${!S.patients.length?'disabled':''}>Voir l’espace patient →</button></article>
      <article class="ph-card"><span class="overline">RENDEZ-VOUS</span><h3>À venir</h3><div class="ph-metric">${upcoming}</div><p>Rendez-vous liés à votre organisation.</p><button class="button secondary" data-go="appointments">Consulter l’agenda →</button></article>
      <article class="ph-card"><span class="overline">PRÉPARATION</span><h3>Contrôle des accès</h3><div class="ph-metric small">${S.org?'Organisation active':'À configurer'}</div><p>Les fonctions d’ajout d’utilisateurs et de modification des rôles restent désactivées tant qu’elles ne sont pas vérifiées.</p></article>
    </section>`;
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.hash=b.dataset.go);
  $('#adminPreviewLaunch')?.addEventListener('click',()=>{if(S.patients[0])openPatientPreview(S.patients[0].id)});
}
function patients(){
  heading('Patients','DOSSIERS AUTORISÉS');
  $('#view').innerHTML=`<section class="intro"><h2>${esc(S.org?.name||'Centre KŌMØ')}</h2><p>Choisissez un dossier pour réaliser le bilan ou, en tant qu’administrateur, voir le même accueil que le patient. L’aperçu est toujours en lecture seule.</p></section><section class="patient-list">${S.patients.length?S.patients.map(p=>`<article class="ph-patient-record"><span class="patient-avatar">${esc((p.first_name||p.last_name||'P').slice(0,1))}</span><div class="ph-patient-details"><strong>${esc([p.first_name,p.last_name].filter(Boolean).join(' '))}</strong><small>${esc(p.external_reference||'Patient KŌMØ')}</small></div><div class="ph-patient-actions"><button class="button secondary" data-patient="${p.id}">Ouvrir le bilan</button>${S.role==='admin'?`<button class="button primary" data-preview-patient="${p.id}">Aperçu patient</button>`:''}</div></article>`).join(''):'<article class="empty-state"><h3>Aucun dossier autorisé</h3><p>Un patient doit être associé à votre organisation et accessible selon les droits Supabase.</p></article>'}</section>`;
  document.querySelectorAll('[data-patient]').forEach(r=>r.onclick=async()=>{localStorage.setItem('komo_v14_patient',r.dataset.patient);S.previewMode=false;S.previewPatientId=null;S.mode='pro';localStorage.setItem('komo_v14_mode','pro');await loadPro();location.hash='operator';render()});
  document.querySelectorAll('[data-preview-patient]').forEach(r=>r.onclick=()=>openPatientPreview(r.dataset.previewPatient));
}
function operator(){
  heading('Session D0','KŌMØ OPERATOR TEAM');
  const by=new Map(S.opSteps.map(x=>[x.step_code,x]));
  $('#view').innerHTML=`<section class="operator-head"><div><span class="overline light">PATIENT</span><h2>${esc(patientName()||'Patient')}</h2><p>Session guidée · environ 55 minutes · acquisition standardisée.</p></div><div class="operator-head-actions"><button class="button light" id="startOp" ${!S.patient?'disabled':''}>${S.opSession?'Reprendre D0':'Démarrer D0'}</button><button class="button outline-light" onclick="location.hash='patients'">Changer</button></div></section><section class="operator-grid"><div>${OP_STEPS.map(([code,time,title,device])=>{const st=by.get(code),status=st?.status||'pending';return`<article class="op-step ${status}"><div class="op-time">${time}</div><div><span>${device}</span><h3>${title}</h3></div><div class="op-actions"><b>${statusLabel(status)}</b>${S.opSession&&['pending','ready'].includes(status)?`<button data-step="${code}" data-action="start">Démarrer</button>`:''}${S.opSession&&status==='running'?`<button data-step="${code}" data-action="complete">Valider</button><button data-step="${code}" data-action="flag">À revoir</button>`:''}${S.opSession&&['complete','review'].includes(status)?`<button data-step="${code}" data-action="reset">Réouvrir</button>`:''}</div></article>`}).join('')}<button class="button primary wide" id="finalizeOp" ${!S.opSession?'disabled':''}>Finaliser D0</button></div><aside class="operator-aside"><span class="overline">ÉTAT DU DOSSIER</span><div class="simple-row"><span>Questionnaires</span><strong>${qdone()}</strong></div><div class="simple-row"><span>Biologie</span><strong>${bioReady()?'Prête':'En attente'}</strong></div><div class="simple-row"><span>Mesures</span><strong>${motionReady()?'Reçues':'En cours'}</strong></div><div class="simple-row"><span>Revue</span><strong>${visibleGates().length}</strong></div></aside></section>`;
  $('#startOp')?.addEventListener('click',startOperator);$('#finalizeOp')?.addEventListener('click',finalizeOperator);document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>operatorStep(b.dataset.step,b.dataset.action));
}
async function startOperator(){const r=await sb.rpc('start_pulse_operator_session_v1',{p_patient_id:S.patient.id,p_assessment_id:S.assessment?.id||null});if(r.error)return toast(r.error.message);await loadPro();operator();toast('Session D0 démarrée.')}
async function operatorStep(code,action){const payload={qc_status:action==='complete'?'pass':action==='flag'?'review':'pending'};const r=await sb.rpc('pulse_operator_step_v1',{p_session_id:S.opSession.id,p_step_code:code,p_action:action,p_payload:payload});if(r.error)return toast(r.error.message);await loadPro();operator()}
async function finalizeOperator(){if(!S.opSession)return toast('Aucune session active.');const r=await sb.rpc('finalize_pulse_operator_session_v1',{p_session_id:S.opSession.id});if(r.error)return toast(r.error.message);toast(r.data?.status==='completed'?'D0 finalisé.':'D0 transmis en revue.');await loadPro();operator()}

function render(){
  S.route=route();const allowed=navItems().map(x=>x[0]);if(!allowed.includes(S.route)&&!CENTERS.some(x=>x.id===S.route)&&!(S.mode==='patient'&&['baseline','questionnaires','plan'].includes(S.route))){location.hash=allowed[0];return}
  shell();
  if(CENTERS.some(x=>x.id===S.route)){centerDetail(S.route)}
  else if(S.mode==='admin'&&S.role==='admin'){if(S.route==='admin')admin();else if(S.route==='patients')patients();else appointments()}
  else if(S.mode==='pro'){if(S.route==='operator')operator();else if(S.route==='patients')patients();else appointments()}
  else{if(S.route==='home')patientHome();else if(S.route==='baseline')baseline();else if(S.route==='questionnaires')questionnaires();else if(S.route==='results')results();else if(S.route==='connected')connected();else if(S.route==='mykomo')mykomo();else if(S.route==='plan')plan();else appointments()}
  if(S.previewMode){const v=$('#view');v.insertAdjacentHTML('afterbegin',`<div class="ph-preview-banner" role="status"><div><strong>Aperçu patient · Lecture seule</strong><span>Compte administrateur · ${esc(patientName())}. Aucun changement dans son dossier.</span></div><button class="button secondary" id="previewExit">Retour Admin</button></div>`);$('#previewExit').onclick=closePatientPreview}
}
async function refresh(){if(S.loading)return;S.loading=true;try{if(!await loadIdentity())return authView();await loadAll();render()}catch(e){console.error('[pulse:refresh]',e);toast('Actualisation indisponible. Réessayez.')}finally{S.loading=false}}
async function boot(){const session=(await sb.auth.getSession()).data.session;if(!session)return authView();await loadIdentity();if(!S.patient&&!hasPro()){$('#app').innerHTML=`<main class="orphan"><div class="brand">KŌMØ<small>PULSE</small></div><h1>Votre dossier patient n’est pas encore relié.</h1><p>Votre compte existe bien. L’équipe KŌMØ doit simplement terminer l’association avec votre dossier avant l’affichage de vos données.</p><a class="button primary" href="mailto:contact@komolongevity.com">Contacter l’équipe</a><button class="text-button" id="logoutOrphan">Se déconnecter</button></main>`;$('#logoutOrphan').onclick=async()=>{await sb.auth.signOut();authView()};return}await loadAll();render()}
window.addEventListener('hashchange',()=>{if(S.user){S.route=route();render()}});
sb.auth.onAuthStateChange((_e,s)=>{if(!s)authView()});
boot().catch(()=>authView('Une erreur est survenue. Réessayez dans quelques instants.'));

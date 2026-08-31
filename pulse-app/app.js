import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL = 'https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER_KEY = 'komo_pulse_remember';

const PUBLIC_LINKS = Object.freeze({
  method: 'https://komolongevity.com/fr/methode/',
  assessment: 'https://komolongevity.com/fr/bilan/',
  case: 'https://komolongevity.com/fr/case/',
  motion: 'https://komolongevity.com/fr/partners/motion/',
  clinical: 'https://komolongevity.com/fr/partners/clinical/',
  network: 'https://komolongevity.com/fr/network/',
  library: 'https://komolongevity.com/media',
  professionals: 'https://komolongevity.com/fr/partners/',
  science: 'https://komolongevity.com/fr/science/',
  contact: 'https://komolongevity.com/fr/contact/'
});

const state = {
  client: null, session: null, user: null, profile: null, role: 'member', mode: 'member',
  score: null, assessment: null, patient: null, priorities: [], documents: [], trajectory: [],
  professional: { patients: [], appointments: [], assessments: [] }, loading: false
};

const icons = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3.5 10.5 12 3l8.5 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
  results: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M12 12l4-3"/><path d="M7.5 16.5a6.4 6.4 0 0 1 9 0"/></svg>',
  path: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 19c3.5 0 4-4 7-4s3.4-6 7-6"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="9" r="2"/><circle cx="12" cy="15" r="2"/></svg>',
  docs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 3.5h8l4 4V21H6z"/><path d="M14 3.5V8h4"/><path d="M9 12h6M9 16h6"/></svg>',
  explore: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/></svg>',
  clinical: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8.5"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.6-4 2.7-6 6.5-6s5.9 2 6.5 6"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  case: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M8 7V5.5c0-.8.7-1.5 1.5-1.5h5c.8 0 1.5.7 1.5 1.5V7M3.5 12h17"/></svg>',
  science: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 3.5h6M10 3.5v5l-5 8.5A2.3 2.3 0 0 0 7 20.5h10a2.3 2.3 0 0 0 2-3.5L14 8.5v-5"/><path d="M7.5 15h9"/></svg>',
  network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="8" cy="8" r="2.5"/><circle cx="17" cy="7" r="2"/><circle cx="17" cy="17" r="2.5"/><path d="M10 9.5l5.2-1.7M9.5 10l5.8 5.2"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23z"/></svg>',
  method: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>'
};

const routes = [
  { id: 'home', label: 'Accueil', icon: icons.home },
  { id: 'results', label: 'Résultats', icon: icons.results },
  { id: 'path', label: 'Parcours', icon: icons.path },
  { id: 'documents', label: 'Documents', icon: icons.docs },
  { id: 'explore', label: 'Explorer', icon: icons.explore }
];

const explorerLinks = [
  ['Méthode KŌMØ', 'Comprendre la logique du bilan et la façon dont les différentes couches s’articulent.', PUBLIC_LINKS.method, icons.method],
  ['Votre bilan', 'Découvrir le déroulement d’une évaluation KŌMØ, du point de départ à la lecture des résultats.', PUBLIC_LINKS.assessment, icons.results],
  ['KŌMØ Case', 'Le dispositif portable qui standardise l’acquisition dans les lieux partenaires.', PUBLIC_LINKS.case, icons.case],
  ['Motion', 'La couche de mesure fonctionnelle et instrumentée du mouvement.', PUBLIC_LINKS.motion, icons.path],
  ['Clinical', 'L’évaluation clinique supervisée, l’interprétation et la continuité du parcours.', PUBLIC_LINKS.clinical, icons.clinical],
  ['Network', 'Le réseau KŌMØ de lieux et de professionnels.', PUBLIC_LINKS.network, icons.network],
  ['Library', 'Articles, références et contenus pour mieux comprendre la longévité locomotrice.', PUBLIC_LINKS.library, icons.book],
  ['Professionnels', 'Déployer KŌMØ dans un cabinet, une clinique, un centre ou un lieu partenaire.', PUBLIC_LINKS.professionals, icons.case],
  ['Science', 'Les fondements scientifiques, protocoles et niveaux de preuve qui encadrent KŌMØ.', PUBLIC_LINKS.science, icons.science],
  ['Contact', 'Parler à l’équipe KŌMØ ou préparer un projet de déploiement.', PUBLIC_LINKS.contact, icons.arrow]
];

const els = {
  authScreen: document.querySelector('#authScreen'), appShell: document.querySelector('#appShell'), loginForm: document.querySelector('#loginForm'),
  emailInput: document.querySelector('#emailInput'), passwordInput: document.querySelector('#passwordInput'), rememberInput: document.querySelector('#rememberInput'),
  loginButton: document.querySelector('#loginButton'), authFeedback: document.querySelector('#authFeedback'), signupButton: document.querySelector('#signupButton'),
  forgotPasswordButton: document.querySelector('#forgotPasswordButton'), togglePassword: document.querySelector('#togglePassword'), desktopNav: document.querySelector('#desktopNav'),
  mobileNav: document.querySelector('#mobileNav'), viewRoot: document.querySelector('#viewRoot'), pageEyebrow: document.querySelector('#pageEyebrow'), pageTitle: document.querySelector('#pageTitle'),
  modeSwitch: document.querySelector('#modeSwitch'), accountButton: document.querySelector('#accountButton'), accountPopover: document.querySelector('#accountPopover'),
  accountName: document.querySelector('#accountName'), accountEmail: document.querySelector('#accountEmail'), avatarInitials: document.querySelector('#avatarInitials'),
  logoutButton: document.querySelector('#logoutButton'), refreshButton: document.querySelector('#refreshButton'), toast: document.querySelector('#toast')
};

function makeClient(storage) {
  return createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { storage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}
function selectedStorage() { return localStorage.getItem(REMEMBER_KEY) === '1' ? localStorage : sessionStorage; }
function syncClient() { state.client = makeClient(selectedStorage()); return state.client; }
function initials(name = '', email = '') { const parts=name.trim().split(/\s+/).filter(Boolean); if(parts.length>=2)return `${parts[0][0]}${parts[1][0]}`.toUpperCase(); if(parts.length===1)return parts[0].slice(0,2).toUpperCase(); return (email[0]||'K').toUpperCase(); }
function safeText(value,fallback='—'){return value===null||value===undefined||value===''?fallback:String(value)}
function fmtDate(value){if(!value)return'—';const d=new Date(value);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(d)}
function fmtDateTime(value){if(!value)return'—';const d=new Date(value);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(d)}
function numberOrNull(value){const n=Number(value);return Number.isFinite(n)?n:null}
function setLoading(flag){state.loading=flag;els.refreshButton.disabled=flag;els.refreshButton.style.opacity=flag?'.45':'1'}
let toastTimer; function toast(message){clearTimeout(toastTimer);els.toast.textContent=message;els.toast.hidden=false;toastTimer=setTimeout(()=>{els.toast.hidden=true},3200)}
function setAuthFeedback(message='',isSuccess=false){els.authFeedback.textContent=message;els.authFeedback.style.color=isSuccess?'#59675d':'#8b4b45'}

async function initialize(){els.rememberInput.checked=localStorage.getItem(REMEMBER_KEY)==='1';syncClient();bindEvents();const {data:{session}}=await state.client.auth.getSession();if(session)await enterApp(session);else showAuth()}
function bindEvents(){
  els.loginForm.addEventListener('submit',login);els.signupButton.addEventListener('click',signup);els.forgotPasswordButton.addEventListener('click',resetPassword);
  els.togglePassword.addEventListener('click',()=>{const hidden=els.passwordInput.type==='password';els.passwordInput.type=hidden?'text':'password';els.togglePassword.textContent=hidden?'Masquer':'Voir'});
  els.accountButton.addEventListener('click',event=>{event.stopPropagation();els.accountPopover.hidden=!els.accountPopover.hidden});
  document.addEventListener('click',event=>{if(!els.accountPopover.contains(event.target)&&event.target!==els.accountButton)els.accountPopover.hidden=true});
  els.logoutButton.addEventListener('click',logout);els.refreshButton.addEventListener('click',async()=>{await loadAppData();renderRoute(currentRoute());toast('Données actualisées.')});
  els.modeSwitch.addEventListener('click',event=>{const button=event.target.closest('button[data-mode]');if(!button)return;state.mode=button.dataset.mode;[...els.modeSwitch.querySelectorAll('button')].forEach(btn=>btn.classList.toggle('active',btn===button));if(state.mode==='clinical')location.hash='clinical';else if(currentRoute()==='clinical')location.hash='home';renderNavigation();renderRoute(currentRoute())});
  window.addEventListener('hashchange',()=>renderRoute(currentRoute()));document.body.addEventListener('click',event=>{const routeLink=event.target.closest('[data-route]');if(!routeLink)return;const route=routeLink.dataset.route;if(route)location.hash=route})
}

async function login(event){
  event.preventDefault();setAuthFeedback('');const email=els.emailInput.value.trim();const password=els.passwordInput.value;if(!email||!password){setAuthFeedback('Renseignez votre adresse e-mail et votre mot de passe.');return}
  els.loginButton.disabled=true;els.loginButton.querySelector('span:first-child').textContent='Connexion…';const remember=els.rememberInput.checked;if(remember)localStorage.setItem(REMEMBER_KEY,'1');else localStorage.removeItem(REMEMBER_KEY);syncClient();
  const {data,error}=await state.client.auth.signInWithPassword({email,password});els.loginButton.disabled=false;els.loginButton.querySelector('span:first-child').textContent='Se connecter';if(error){setAuthFeedback(error.message==='Invalid login credentials'?'Adresse e-mail ou mot de passe incorrect.':error.message);return}await enterApp(data.session)
}
async function signup(){const email=els.emailInput.value.trim();const password=els.passwordInput.value;if(!email||password.length<6){setAuthFeedback('Pour créer votre espace, renseignez un e-mail et un mot de passe d’au moins 6 caractères.');return}const remember=els.rememberInput.checked;if(remember)localStorage.setItem(REMEMBER_KEY,'1');else localStorage.removeItem(REMEMBER_KEY);syncClient();const {data,error}=await state.client.auth.signUp({email,password,options:{emailRedirectTo:window.location.href.split('#')[0]}});if(error){setAuthFeedback(error.message);return}if(data.session)await enterApp(data.session);else setAuthFeedback('Compte créé. Consultez votre e-mail pour confirmer votre inscription.',true)}
async function resetPassword(){const email=els.emailInput.value.trim();if(!email){setAuthFeedback('Renseignez d’abord votre adresse e-mail.');els.emailInput.focus();return}const {error}=await state.client.auth.resetPasswordForEmail(email,{redirectTo:window.location.href.split('#')[0]});if(error)setAuthFeedback(error.message);else setAuthFeedback('Un lien de réinitialisation vient de vous être envoyé.',true)}
async function logout(){await state.client.auth.signOut();if(localStorage.getItem(REMEMBER_KEY)!=='1')sessionStorage.clear();state.session=null;state.user=null;els.accountPopover.hidden=true;showAuth()}
function showAuth(){els.authScreen.hidden=false;els.appShell.hidden=true}
async function enterApp(session){state.session=session;state.user=session?.user||null;els.authScreen.hidden=true;els.appShell.hidden=false;await loadAppData();renderAccount();renderNavigation();if(!location.hash)location.hash='home';renderRoute(currentRoute())}

async function loadAppData(){
  if(!state.user)return;setLoading(true);const userId=state.user.id;
  const [profileRes,roleRes]=await Promise.all([state.client.from('profiles').select('*').eq('id',userId).maybeSingle(),state.client.from('account_roles').select('role').eq('user_id',userId).maybeSingle()]);
  state.profile=profileRes.data||{display_name:state.user.user_metadata?.display_name||'',city:null,country:null};state.role=roleRes.data?.role||'member';state.mode=state.role==='professional'||state.role==='admin'?state.mode:'member';await Promise.all([loadMemberData(),loadProfessionalData()]);setLoading(false)
}
async function loadMemberData(){
  const userId=state.user.id;state.score=null;state.assessment=null;state.patient=null;state.priorities=[];state.documents=[];state.trajectory=[];
  const oldScore=await state.client.from('pulse_score_runs').select('*').eq('user_id',userId).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(oldScore.data){state.score={motion_score:numberOrNull(oldScore.data.overall_score),motion_age:numberOrNull(oldScore.data.motion_age),domain_scores:oldScore.data.subscores||{},confidence_label:oldScore.data.confidence||'—',completeness:numberOrNull(oldScore.data.completeness),calculated_at:oldScore.data.computed_at||oldScore.data.created_at,release_status:oldScore.data.status}}
  const patientRes=await state.client.from('patients').select('*').eq('patient_user_id',userId).order('created_at',{ascending:false}).limit(1).maybeSingle();if(!patientRes.data)return;state.patient=patientRes.data;
  const assessmentRes=await state.client.from('assessments').select('*').eq('patient_id',state.patient.id).order('created_at',{ascending:false}).limit(1).maybeSingle();if(!assessmentRes.data)return;state.assessment=assessmentRes.data;
  const [scoreRes,prioritiesRes,docsRes,trajectoryRes]=await Promise.all([
    state.client.from('scores').select('*').eq('assessment_id',state.assessment.id).order('calculated_at',{ascending:false}).limit(1).maybeSingle(),
    state.client.from('priorities').select('*').eq('assessment_id',state.assessment.id).order('rank',{ascending:true}),
    state.client.from('assessment_documents').select('*').eq('assessment_id',state.assessment.id).order('created_at',{ascending:false}),
    state.client.from('trajectory_events').select('*').eq('patient_id',state.patient.id).order('event_date',{ascending:false}).limit(8)
  ]);if(scoreRes.data)state.score=scoreRes.data;state.priorities=prioritiesRes.data||[];state.documents=docsRes.data||[];state.trajectory=trajectoryRes.data||[]
}
async function loadProfessionalData(){
  if(!['professional','admin'].includes(state.role)){state.professional={patients:[],appointments:[],assessments:[]};return}
  const [patients,appointments,assessments]=await Promise.all([
    state.client.from('patients').select('id,first_name,last_name,preferred_name,birth_date,status,organization_id,created_at').order('created_at',{ascending:false}).limit(50),
    state.client.from('organization_appointments').select('*').order('scheduled_start',{ascending:true}).limit(30),
    state.client.from('assessments').select('id,patient_id,product_mode,assessment_type,status,completeness,scheduled_at,created_at').order('created_at',{ascending:false}).limit(50)
  ]);state.professional={patients:patients.data||[],appointments:appointments.data||[],assessments:assessments.data||[]}
}

function renderAccount(){const name=state.profile?.display_name||state.user?.user_metadata?.display_name||'Compte KŌMØ';const email=state.user?.email||'';els.accountName.textContent=name;els.accountEmail.textContent=email;els.avatarInitials.textContent=initials(name,email);els.modeSwitch.hidden=!['professional','admin'].includes(state.role)}
function currentRoute(){const route=location.hash.replace(/^#/,'')||'home';if(route==='clinical'&&!['professional','admin'].includes(state.role))return'home';return['home','results','path','documents','explore','clinical','profile'].includes(route)?route:'home'}
function renderNavigation(){
  const active=currentRoute();const allRoutes=[...routes];if(state.mode==='clinical'&&['professional','admin'].includes(state.role))allRoutes.unshift({id:'clinical',label:'Clinical',icon:icons.clinical});
  const itemHtml=allRoutes.map(route=>`<button type="button" class="nav-item ${active===route.id?'active':''}" data-route="${route.id}" aria-label="${route.label}">${route.icon}<span>${route.label}</span></button>`).join('');els.desktopNav.innerHTML=itemHtml;
  const mobileRoutes=state.mode==='clinical'&&['professional','admin'].includes(state.role)?allRoutes.filter(r=>['clinical','home','results','explore'].includes(r.id)):allRoutes.filter(r=>['home','results','path','explore'].includes(r.id));els.mobileNav.innerHTML=mobileRoutes.map(route=>`<button type="button" class="nav-item ${active===route.id?'active':''}" data-route="${route.id}" aria-label="${route.label}">${route.icon}<span>${route.label}</span></button>`).join('')
}
function renderRoute(route){
  renderNavigation();
  const pages={home:['KŌMØ PULSE','',renderHome],results:['VOS REPÈRES','Comprendre vos résultats.',renderResults],path:['VOTRE TRAJECTOIRE','La prochaine étape, simplement.',renderPath],documents:['VOTRE DOSSIER','Documents & comptes rendus.',renderDocuments],explore:['L’ÉCOSYSTÈME KŌMØ','Explorer KŌMØ.',renderExplore],clinical:['KŌMØ CLINICAL','Piloter les évaluations.',renderClinical],profile:['VOTRE COMPTE','Profil & accès.',renderProfile]};
  const [eyebrow,title,renderer]=pages[route]||pages.home;
  els.pageEyebrow.textContent=eyebrow;
  els.pageTitle.textContent=title;
  els.viewRoot.innerHTML=renderer();
  if(route==='home'){
    window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:'home',source:'app-home-host'}}));
    window.KomoPatientHomeCommand?.refresh?.();
  }
}

function renderHome(){return '<div data-my-komo-home data-home-owner="patient-home-command-v1"></div>'}
function renderResults(){
  const score=numberOrNull(state.score?.motion_score??state.score?.overall_score);const motionAge=numberOrNull(state.score?.motion_age);const domains=normalizeDomains(state.score?.domain_scores??state.score?.subscores??{});const completeness=numberOrNull(state.score?.completeness);
  if(score===null)return `<article class="card"><div class="empty-state"><strong>Aucun résultat disponible pour le moment.</strong><br>Lorsque votre première évaluation aura été validée, Pulse affichera ici le Motion Score, les sous-domaines, la qualité des données et les éléments utiles à votre trajectoire.</div><div style="margin-top:18px"><a class="primary-button" href="${PUBLIC_LINKS.assessment}" target="_blank" rel="noopener noreferrer">Découvrir le bilan KŌMØ ↗</a></div></article>`;
  return `<div class="result-layout"><article class="card score-panel"><p class="eyebrow">MOTION SCORE</p><div class="score-display"><div class="score-big">${Math.round(score)}<small>/100</small></div><p class="score-caption">Le score est un repère synthétique. Son interprétation doit tenir compte de la complétude, de la qualité des données, du contexte et de l’évolution dans le temps.</p></div><div class="domain-list">${domains.length?domains.map(([label,value])=>domainRow(label,value)).join(''):'<div class="empty-state">Les sous-domaines ne sont pas encore disponibles pour cette évaluation.</div>'}</div></article><article class="card score-panel"><p class="eyebrow">TRAJECTOIRE</p><div class="score-display"><div class="score-big">${motionAge!==null?Math.round(motionAge):'—'}<small>${motionAge!==null?'ans':'âge locomoteur'}</small></div><p class="score-caption">Un repère de lecture longitudinale lorsqu’il est disponible et validé. Il ne constitue pas un âge biologique ni un diagnostic.</p></div><div class="summary-list" style="margin-top:34px"><div class="summary-row"><span>Complétude</span><strong>${completeness!==null?`${Math.round(completeness)}%`:'—'}</strong></div><div class="summary-row"><span>Confiance</span><strong>${confidenceLabel(state.score?.confidence_label??state.score?.confidence)}</strong></div><div class="summary-row"><span>Calcul</span><strong>${fmtDate(state.score?.calculated_at||state.score?.computed_at)}</strong></div><div class="summary-row"><span>Statut</span><strong>${releaseLabel(state.score?.release_status||state.score?.status)}</strong></div></div></article></div><section class="section-block two-col"><article class="card"><h3>Priorités actuelles</h3>${renderPriorities()}</article><article class="card"><h3>À retenir</h3><div class="empty-state">Pulse distingue les données mesurées, les calculs KŌMØ et l’interprétation clinique. Les résultats n’ont vocation à guider une décision de santé que lorsqu’ils ont été relus dans le cadre approprié.</div></article></section>`
}
function renderPath(){const assessment=state.assessment;const hasAssessment=Boolean(assessment);const resultReady=Boolean(state.score);return `<div class="path-grid">${pathCard('01','Point de départ','Votre profil et vos objectifs donnent le contexte nécessaire à la suite du parcours.',state.profile?'Disponible':'À compléter')}${pathCard('02','Évaluation','Tests fonctionnels, mesure du mouvement et données complémentaires selon le mode de bilan.',hasAssessment?statusLabel(assessment.status):'À planifier')}${pathCard('03','Lecture & suivi','Résultats validés, priorités et évolution au fil des évaluations successives.',resultReady?'En cours':'Après validation')}</div><section class="section-block two-col"><article class="card"><h3>Historique</h3>${renderTimeline(8)}</article><article class="card"><h3>Prochaine étape</h3><div class="empty-state">${nextStepDescription()}</div><div style="margin-top:16px"><a class="secondary-button" href="${PUBLIC_LINKS.method}" target="_blank" rel="noopener noreferrer">Comprendre la méthode ↗</a></div></article></section>`}
function renderDocuments(){const docs=state.documents;return `<article class="card"><h3>Documents liés à votre parcours</h3>${docs.length?`<div class="doc-list">${docs.map(doc=>`<div class="doc-row"><div class="doc-icon">${docTypeShort(doc.document_type)}</div><div><strong>${escapeHtml(doc.file_name||doc.document_type)}</strong><span>${docTypeLabel(doc.document_type)} · ${fmtDate(doc.source_date||doc.created_at)}</span></div><div class="doc-status">${verificationLabel(doc.verification_status)}</div></div>`).join('')}</div>`:`<div class="empty-state">Aucun document n’est encore associé à votre parcours. Les comptes rendus et documents cliniques seront visibles ici lorsqu’ils auront été mis à disposition.</div>`}</article>`}
function renderExplore(){return `<div class="explorer-grid">${explorerLinks.map(([title,body,url,icon])=>`<a class="explorer-card" href="${url}" target="_blank" rel="noopener noreferrer"><div class="explorer-top"><span class="explorer-icon">${icon}</span><span class="explorer-arrow">↗</span></div><div><h3>${title}</h3><p>${body}</p></div><div class="explorer-domain">komolongevity.com</div></a>`).join('')}</div>`}
function renderClinical(){
  if(!['professional','admin'].includes(state.role))return renderHome();const {patients,appointments,assessments}=state.professional;const now=new Date();const upcoming=appointments.filter(a=>new Date(a.scheduled_start)>=now&&!['cancelled','completed','no_show'].includes(a.status));const inReview=assessments.filter(a=>a.status==='review');const collecting=assessments.filter(a=>['collecting','scheduled','baseline'].includes(a.status));const patientById=Object.fromEntries(patients.map(p=>[p.id,p]));
  return `<section class="clinical-banner"><div><p class="eyebrow">KŌMØ CLINICAL</p><h2>Le mouvement devient<br>un parcours clinique.</h2><p>Patients, évaluations, qualité des données et validation restent séparés de l’expérience membre tout en partageant la même trajectoire.</p></div><a class="ghost-button" href="${PUBLIC_LINKS.clinical}" target="_blank" rel="noopener noreferrer" style="color:white;border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.08)">Référentiel Clinical ↗</a></section><div class="clinical-stats">${clinicalStat(patients.length,'Patients visibles')}${clinicalStat(upcoming.length,'Rendez-vous à venir')}${clinicalStat(inReview.length,'À relire')}</div><section class="section-block two-col"><article class="card"><h3>Prochaines évaluations</h3>${upcoming.length?`<div class="doc-list">${upcoming.slice(0,6).map(a=>{const p=patientById[a.patient_id];return `<div class="doc-row"><div class="doc-icon">${appointmentShort(a.appointment_type)}</div><div><strong>${escapeHtml(patientName(p)||'Patient')}</strong><span>${appointmentLabel(a.appointment_type)} · ${fmtDateTime(a.scheduled_start)}</span></div><div class="doc-status">${statusLabel(a.status)}</div></div>`}).join('')}</div>`:'<div class="empty-state">Aucun rendez-vous à venir dans votre périmètre.</div>'}</article><article class="card"><h3>Flux d’évaluation</h3><div class="summary-list"><div class="summary-row"><span>En acquisition</span><strong>${collecting.length}</strong></div><div class="summary-row"><span>En revue</span><strong>${inReview.length}</strong></div><div class="summary-row"><span>Validées</span><strong>${assessments.filter(a=>a.status==='validated').length}</strong></div><div class="summary-row"><span>Diffusées</span><strong>${assessments.filter(a=>a.status==='released').length}</strong></div></div></article></section><section class="section-block"><article class="card"><h3>Patients</h3>${patients.length?renderPatientTable(patients,assessments):'<div class="empty-state">Aucun patient n’est encore visible dans votre organisation.</div>'}</article></section>`
}
function renderProfile(){const name=state.profile?.display_name||'Compte KŌMØ';return `<div class="profile-grid"><article class="card profile-identity"><div class="profile-avatar">${initials(name,state.user?.email)}</div><h2>${escapeHtml(name)}</h2><p>${escapeHtml(state.user?.email||'')}</p><div style="margin-top:22px"><span class="status-pill">${roleLabel(state.role)}</span></div></article><article class="card"><h3>Informations du profil</h3><div class="profile-field"><span>Nom affiché</span><strong>${escapeHtml(name)}</strong></div><div class="profile-field"><span>Ville</span><strong>${escapeHtml(safeText(state.profile?.city))}</strong></div><div class="profile-field"><span>Pays</span><strong>${escapeHtml(safeText(state.profile?.country))}</strong></div><div class="profile-field"><span>Newsletter</span><strong>${state.profile?.newsletter_opt_in?'Oui':'Non'}</strong></div><div class="profile-field"><span>Type d’accès</span><strong>${roleLabel(state.role)}</strong></div><div style="margin-top:22px"><a class="secondary-button" href="${PUBLIC_LINKS.contact}" target="_blank" rel="noopener noreferrer">Modifier avec l’équipe KŌMØ ↗</a></div></article></div>`}

function metricCard(label,value,unit,note){return `<article class="metric-card"><span class="metric-label">${label}</span><div class="metric-value">${escapeHtml(String(value))}${unit?` <small>${unit}</small>`:''}</div><span class="metric-note"><i class="metric-dot"></i>${note}</span></article>`}
function clinicalStat(value,label){return `<article class="clinical-card"><strong>${value}</strong><span>${label}</span></article>`}
function pathCard(number,title,body,status){return `<article class="card path-card"><span class="path-number">${number}</span><h3>${title}</h3><p>${body}</p><span class="path-status"><i></i>${status}</span></article>`}
function domainRow(label,value){const n=Math.max(0,Math.min(100,numberOrNull(value)??0));return `<div class="domain-row"><span>${escapeHtml(label)}</span><div class="domain-track"><i style="width:${n}%"></i></div><strong>${Math.round(n)}</strong></div>`}
function renderPriorities(){if(!state.priorities.length)return '<div class="empty-state">Vos priorités apparaîtront ici après une évaluation interprétée et, lorsque cela est requis, validée par le professionnel responsable.</div>';return `<div class="priority-list">${state.priorities.slice(0,3).map((p,i)=>`<div class="priority-item"><span class="priority-index">${p.rank||i+1}</span><div class="priority-copy"><strong>${escapeHtml(p.patient_wording||p.category||'Priorité')}</strong><span>${escapeHtml(p.category||'Trajectoire')}</span></div><span class="priority-arrow">→</span></div>`).join('')}</div>`}
function renderTimeline(limit=6){if(!state.trajectory.length){const synthetic=[];if(state.assessment)synthetic.push({title:statusLabel(state.assessment.status),date:state.assessment.completed_at||state.assessment.created_at});if(state.score)synthetic.push({title:'Résultats calculés',date:state.score.calculated_at||state.score.computed_at||state.score.created_at});if(!synthetic.length)return '<div class="empty-state">Votre trajectoire commencera avec votre première étape KŌMØ.</div>';return `<div class="timeline">${synthetic.map(x=>`<div class="timeline-item"><strong>${x.title}</strong><span>${fmtDate(x.date)}</span></div>`).join('')}</div>`}return `<div class="timeline">${state.trajectory.slice(0,limit).map(event=>`<div class="timeline-item"><strong>${trajectoryLabel(event.event_type)}</strong><span>${fmtDate(event.event_date)}</span></div>`).join('')}</div>`}
function renderPatientTable(patients,assessments){const latestByPatient={};assessments.forEach(a=>{if(!latestByPatient[a.patient_id])latestByPatient[a.patient_id]=a});return `<div style="overflow:auto"><table class="patient-table"><thead><tr><th>Patient</th><th>Dernière évaluation</th><th>Mode</th><th>Statut</th><th>Complétude</th></tr></thead><tbody>${patients.map(p=>{const a=latestByPatient[p.id];return `<tr><td class="patient-name">${escapeHtml(patientName(p))}</td><td>${fmtDate(a?.created_at)}</td><td>${escapeHtml(a?.product_mode||'—')}</td><td><span class="status-pill">${statusLabel(a?.status||p.status)}</span></td><td>${a?.completeness!==undefined?`${Math.round(Number(a.completeness))}%`:'—'}</td></tr>`}).join('')}</tbody></table></div>`}
function normalizeDomains(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw))return[];const labels={mobility:'Mobilité',performance:'Performance',balance:'Équilibre',muscle_control:'Contrôle musculaire',quality:'Qualité',muscle:'Muscle',posture:'Posture',recovery:'Récupération',reserve:'Réserve'};return Object.entries(raw).map(([key,value])=>{const numeric=typeof value==='object'&&value!==null?(value.score??value.value):value;return[labels[key]||key.replaceAll('_',' '),numberOrNull(numeric)]}).filter(([,value])=>value!==null).slice(0,8)}
function nextStepLabel(){if(!state.assessment)return'Préparer le bilan';if(['draft','baseline','scheduled'].includes(state.assessment.status))return'Compléter l’évaluation';if(['collecting','review'].includes(state.assessment.status))return'Validation en cours';if(state.score&&!['released'].includes(state.score.release_status||state.score.status))return'Lecture des résultats';if(state.score)return'Suivre la trajectoire';return'Poursuivre le parcours'}
function nextStepDescription(){if(!state.assessment)return'Votre première étape est de préparer une évaluation KŌMØ. Le site public explique le déroulement ; Pulse conserve ensuite le fil de votre parcours.';if(['draft','baseline','scheduled'].includes(state.assessment.status))return'Votre évaluation est ouverte ou planifiée. Complétez les éléments demandés avant la mesure instrumentée.';if(['collecting','review'].includes(state.assessment.status))return'Les données sont en cours d’acquisition ou de revue. Les résultats ne seront affichés comme définitifs qu’après les contrôles prévus par le protocole.';if(!state.score)return'Votre évaluation existe, mais aucun résultat n’est encore disponible dans Pulse.';return'Votre résultat est disponible. L’enjeu devient maintenant la trajectoire : priorités, suivi et comparaison avec les prochaines évaluations.'}
function statusLabel(status=''){const map={not_started:'À commencer',draft:'Brouillon',baseline:'Point de départ',scheduled:'Planifié',collecting:'En acquisition',review:'En revue',validated:'Validé',released:'Disponible',archived:'Archivé',cancelled:'Annulé',completed:'Terminé',active:'Actif',inactive:'Inactif',confirmed:'Confirmé',arrived:'Arrivé',in_progress:'En cours',no_show:'Absent',computed:'Calculé',clinician_reviewed:'Relu',superseded:'Remplacé'};return map[status]||(status?status.replaceAll('_',' '):'À commencer')}
function releaseLabel(status=''){const map={draft:'Brouillon',clinician_reviewed:'Relu',released:'Disponible',superseded:'Remplacé',computed:'Calculé'};return map[status]||statusLabel(status)}
function confidenceLabel(value){if(value===null||value===undefined||value==='—')return'À établir';if(typeof value==='number')return value>=.8?'Élevée':value>=.55?'Modérée':'Limitée';const map={high:'Élevée',moderate:'Modérée',limited:'Limitée',low:'Limitée',unavailable:'Indisponible'};return map[String(value)]||String(value)}
function roleLabel(role){return({member:'Membre',professional:'Professionnel',admin:'Administrateur'})[role]||'Membre'}
function trajectoryLabel(type){return({assessment:'Évaluation KŌMØ',follow_up:'Suivi',adherence:'Étape du programme',clinical_event:'Événement clinique',context_change:'Contexte actualisé'})[type]||'Étape du parcours'}
function docTypeLabel(type){return({laboratory:'Biologie',imaging:'Imagerie',myocare_export:'Export Myocare',consent:'Consentement',clinical_report:'Compte rendu clinique',other:'Document'})[type]||'Document'}
function docTypeShort(type){return({laboratory:'LAB',imaging:'IMG',myocare_export:'MYO',consent:'OK',clinical_report:'CR',other:'DOC'})[type]||'DOC'}
function verificationLabel(status){return({pending:'À vérifier',verified:'Vérifié',rejected:'Écarté',archived:'Archivé'})[status]||'Disponible'}
function appointmentLabel(type){return({motion:'Motion',clinical:'Clinical',follow_up:'Suivi',discovery:'Découverte'})[type]||'Évaluation'}
function appointmentShort(type){return({motion:'MO',clinical:'CL',follow_up:'SU',discovery:'KO'})[type]||'KO'}
function patientName(p){if(!p)return'';return p.preferred_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||'Patient'}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}

initialize().catch(error=>{console.error(error);setAuthFeedback('Impossible d’initialiser Pulse pour le moment. Réessayez dans quelques instants.')});

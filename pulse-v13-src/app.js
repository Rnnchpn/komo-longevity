import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const sb=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

const PATIENT_NAV=[['home','Accueil'],['baseline','Baseline'],['results','Résultats'],['trajectory','Trajectoire'],['appointments','Consultations']];
const PRO_NAV=[['operator','Operator'],['patients','Patients'],['appointments','Consultations']];
const OP_STEPS=[
 ['preflight','00–05','Safety & standardisation','Operator'],
 ['readiness','05–10','SELF + Biology readiness','Pulse'],
 ['smartspeed_10m','10–15','10 m gait speed','SmartSpeed'],
 ['forcedecks_quiet_stand','15–20','Quiet Stand','ForceDecks'],
 ['humantrak_mobility','20–30','Mobility battery V1','HumanTrak'],
 ['dynamo_grip','30–38','Bilateral grip strength','DynaMo'],
 ['forcedecks_sts','38–45','Sit-to-Stand','ForceDecks'],
 ['qc_release','45–55','QC + Clinical Gates','Pulse']
];

const S={user:null,role:'member',profile:null,mode:'patient',org:null,membership:null,patient:null,patients:[],assessment:null,questionnaires:[],scores:[],measurements:[],programs:[],trajectory:[],appointments:[],bio:[],gates:[],checkpoints:[],opSession:null,opSteps:[],schema:{bio:false,operator:false},route:'home',loading:false};

const $=s=>document.querySelector(s);
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fmt=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(d)};
const toast=m=>{const e=$('#toast');e.textContent=m;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,3200)};
const safe=async q=>{try{const r=await q;return r.error?{data:null,error:r.error}:{data:r.data,error:null}}catch(error){return{data:null,error}}};
const hasPro=()=>['professional','admin'].includes(S.role);
const pname=p=>p?([p.preferred_name||p.first_name,p.last_name].filter(Boolean).join(' ')||p.email||'Patient'):'—';
const route=()=>location.hash.replace(/^#/,'')||((hasPro()&&S.mode==='pro')?'operator':'home');
const score=()=>S.scores[0]||null;
const subs=()=>score()?.subscores||{};
const qdone=()=>S.questionnaires.filter(x=>x.status==='completed'||Number(x.completeness||0)>=100).length;
const domainVal=(...keys)=>{for(const k of keys){const v=Number(subs()[k]);if(Number.isFinite(v))return v}return null};
const gateOpen=()=>S.gates.filter(g=>['open','review_required','referred'].includes(g.status));

async function authView(message=''){
  $('#app').innerHTML=`<section class="auth"><div class="auth-hero"><div class="brand">KŌMØ<small>PULSE · V13</small></div><div><p class="eyebrow">LONGEVITY IN MOTION</p><h1>Measure.<br><em>Interpret.</em><br>Act.</h1><p>Questionnaires, biologie, mesures VALD et trajectoire réunis dans une seule architecture clinique longitudinale.</p></div><div class="auth-note">Pulse ne remplace pas l'interprétation d'un professionnel de santé.</div></div><div class="auth-panel"><div class="auth-card"><p class="eyebrow">KŌMØ PULSE</p><h2>Bienvenue</h2><p>Connectez-vous à votre espace.</p><form id="login" class="form"><label class="field"><span>E-mail</span><input name="email" type="email" required></label><label class="field"><span>Mot de passe</span><input name="password" type="password" required minlength="6"></label><button class="btn primary">Se connecter</button></form><div class="actions"><button class="linkbtn" id="signup">Créer un compte</button><button class="linkbtn" id="reset">Mot de passe oublié ?</button></div><div style="margin-top:14px;color:#8b443c;font-size:10px">${esc(message)}</div></div></div></section>`;
  $('#login').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),email=String(f.get('email')),password=String(f.get('password'));const r=await sb.auth.signInWithPassword({email,password});if(r.error)return authView(r.error.message);await boot()};
  $('#signup').onclick=async()=>{const email=prompt('Adresse e-mail');if(!email)return;const password=prompt('Créez un mot de passe (8 caractères minimum)');if(!password||password.length<8)return toast('Mot de passe trop court.');const r=await sb.auth.signUp({email,password});if(r.error)return toast(r.error.message);toast('Compte créé. Vérifiez votre e-mail si une confirmation est requise.')};
  $('#reset').onclick=async()=>{const email=prompt('Adresse e-mail');if(!email)return;const r=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin});toast(r.error?r.error.message:'E-mail de réinitialisation envoyé.')};
}
async function loadIdentity(){
 const u=await sb.auth.getUser();S.user=u.data.user||null;if(!S.user)return false;
 S.profile=(await safe(sb.from('profiles').select('*').eq('id',S.user.id).maybeSingle())).data||{};
 const role=(await safe(sb.from('account_roles').select('role').eq('user_id',S.user.id).maybeSingle())).data;S.role=role?.role||'member';
 S.patient=(await safe(sb.from('patients').select('*').eq('patient_user_id',S.user.id).maybeSingle())).data||null;
 if(hasPro()){
   const mr=(await safe(sb.from('organization_members').select('*,organizations(*)').eq('user_id',S.user.id).eq('status','active'))).data||[];
   S.membership=mr[0]||null;S.org=S.membership?.organizations||null;
   const saved=localStorage.getItem('komo_v13_mode');S.mode=saved==='patient'&&S.patient?'patient':'pro';
 }else S.mode='patient';
 return true;
}
async function loadPatientContext(patient){
 if(!patient){S.assessment=null;S.questionnaires=[];S.scores=[];S.measurements=[];S.programs=[];S.trajectory=[];S.appointments=[];S.bio=[];S.gates=[];S.checkpoints=[];return}
 S.patient=patient;
 const a=(await safe(sb.from('assessments').select('*').eq('patient_id',patient.id).eq('product_mode','motion').eq('protocol_version','motion-v1.0').order('created_at',{ascending:false}).limit(1))).data||[];S.assessment=a[0]||null;
 S.questionnaires=S.assessment?((await safe(sb.from('questionnaire_sessions').select('*').eq('assessment_id',S.assessment.id).order('created_at',{ascending:false}))).data||[]):[];
 const uid=patient.patient_user_id;
 S.scores=uid?((await safe(sb.from('pulse_score_runs').select('*').eq('user_id',uid).eq('status','released').eq('algorithm_version','motion-score-v1.0').order('released_at',{ascending:false}).limit(5))).data||[]):[];
 S.measurements=uid?((await safe(sb.from('pulse_measurement_sets').select('*').eq('user_id',uid).eq('protocol_version','motion-v1.0').order('captured_at',{ascending:false}).limit(20))).data||[]):[];
 S.programs=uid?((await safe(sb.from('pulse_programs').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(5))).data||[]):[];
 S.trajectory=(await safe(sb.from('trajectory_events').select('*').eq('patient_id',patient.id).order('event_date',{ascending:false}).limit(20))).data||[];
 S.appointments=(await safe(sb.from('organization_appointments').select('*').eq('patient_id',patient.id).order('scheduled_start',{ascending:false}).limit(20))).data||[];
 const br=await safe(sb.from('pulse_biological_panels').select('*').eq('patient_id',patient.id).order('created_at',{ascending:false}).limit(5));S.schema.bio=!br.error;S.bio=br.data||[];
 const gr=await safe(sb.from('pulse_clinical_gates').select('*').eq('patient_id',patient.id).order('created_at',{ascending:false}).limit(20));S.gates=gr.data||[];
 const cr=await safe(sb.from('pulse_checkpoints').select('*').eq('patient_id',patient.id).order('scheduled_at',{ascending:true}).limit(20));S.checkpoints=cr.data||[];
}
async function loadPro(){
 if(!S.org)return;
 S.patients=(await safe(sb.from('patients').select('*').eq('organization_id',S.org.id).eq('status','active').order('last_name',{ascending:true}))).data||[];
 const saved=localStorage.getItem('komo_v13_patient');const p=S.patients.find(x=>x.id===saved)||S.patients[0]||null;if(p)localStorage.setItem('komo_v13_patient',p.id);
 await loadPatientContext(p);
 const os=await safe(sb.from('pulse_operator_sessions').select('*').eq('patient_id',p?.id||'00000000-0000-0000-0000-000000000000').in('status',['draft','running','paused','review']).order('created_at',{ascending:false}).limit(1));
 S.schema.operator=!os.error;S.opSession=os.data?.[0]||null;S.opSteps=S.opSession?((await safe(sb.from('pulse_operator_steps').select('*').eq('operator_session_id',S.opSession.id).order('sequence_order',{ascending:true}))).data||[]):[];
}
async function loadAll(){
 if(S.mode==='pro'&&hasPro())await loadPro();else await loadPatientContext(S.patient);
}
function navItems(){return S.mode==='pro'?PRO_NAV:PATIENT_NAV}
function shell(){
 const nav=navItems().map(([id,label])=>`<button data-route="${id}" class="${S.route===id?'active':''}">${label}</button>`).join('');
 const mode=hasPro()&&S.patient?`<div class="mode"><button data-mode="patient" class="${S.mode==='patient'?'active':''}">Patient</button><button data-mode="pro" class="${S.mode==='pro'?'active':''}">Operator</button></div>`:'';
 $('#app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand">KŌMØ<small>PULSE · V13</small></div><nav class="nav">${nav}</nav><div class="sidebar-foot">${mode}<button class="btn ghost" id="logout">Déconnexion</button></div></aside><main class="main"><header class="top"><div><p class="eyebrow">${S.mode==='pro'?'KŌMØ OPERATOR TEAM':'KŌMØ PULSE'}</p><h1 id="pageTitle"></h1></div><div class="top-actions"><button class="btn" id="refresh">Actualiser</button><button class="avatar">${esc((S.profile?.display_name||S.user.email||'K').slice(0,1).toUpperCase())}</button></div></header><div id="view"></div></main></div>`;
 document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.route});
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=async()=>{S.mode=b.dataset.mode;localStorage.setItem('komo_v13_mode',S.mode);location.hash=S.mode==='pro'?'operator':'home';await refresh()});
 $('#logout').onclick=async()=>{await sb.auth.signOut();location.hash='';authView()};
 $('#refresh').onclick=refresh;
}
function setTitle(t){$('#pageTitle').textContent=t}
function patientHome(){
 setTitle('Votre trajectoire');
 const sc=score(),g=gateOpen();const total=Number(sc?.overall_score);
 $('#view').innerHTML=`<section class="hero"><p class="eyebrow">KŌMØ MOTION BASELINE</p><h2>Measure. Interpret. Act.</h2><p>Votre parcours est désormais organisé autour de trois sources séparées : SELF, BIOLOGY et MOTION. Les Clinical Gates restent indépendants du score.</p></section><section class="grid"><article class="card c7"><span class="pill ${sc?'':'neutral'}">${sc?'Baseline disponible':'Baseline en préparation'}</span><div class="kpi">${Number.isFinite(total)?Math.round(total):'—'}<small>${Number.isFinite(total)?' /100':''}</small></div><h3>Motion Score V1</h3><p>Motion Age est désactivé pendant le POC.</p><div class="actions"><button class="btn green" onclick="location.hash='results'">Résultats</button><button class="btn" onclick="location.hash='trajectory'">Trajectoire</button></div></article><article class="card c5"><h3>État de la baseline</h3><div class="rows"><div class="row"><span>SELF</span><strong>${qdone()}/5 questionnaires</strong></div><div class="row"><span>BIOLOGY</span><strong>${S.bio.length?'Disponible':'À organiser'}</strong></div><div class="row"><span>MOTION</span><strong>${S.measurements.length?'Données reçues':'En attente VALD'}</strong></div><div class="row"><span>CLINICAL GATES</span><strong>${g.length?g.length+' à revoir':'Aucun actif'}</strong></div></div></article><article class="card c12"><h3>Calendrier longitudinal</h3><div class="timeline"><article><small>D0</small><strong>Baseline complète</strong></article><article><small>S2</small><strong>Digital Check</strong></article><article><small>S6</small><strong>Target Check</strong></article><article><small>S12</small><strong>Full Reassessment</strong></article><article><small>M12</small><strong>Annual Baseline</strong></article></div></article></section>`;
}
function baseline(){
 setTitle('Baseline');
 $('#view').innerHTML=`<section class="grid"><article class="card c4"><p class="eyebrow">01 · SELF</p><h3>Questionnaires</h3><p>Contexte patient validé, sans pondération cachée dans le Motion Score.</p><div class="rows"><div class="row"><span>PROMIS Global</span><strong>prévu</strong></div><div class="row"><span>PROMIS Physical Function</span><strong>prévu</strong></div><div class="row"><span>WHO-5</span><strong>prévu</strong></div><div class="row"><span>PROMIS Sleep 4a</span><strong>prévu</strong></div><div class="row"><span>GLFS-25</span><strong>POC</strong></div></div></article><article class="card c4"><p class="eyebrow">02 · BIOLOGY</p><h3>Prise de sang externe</h3><p>Biologie contextualisée, jamais transformée en score arbitraire.</p><div class="rows"><div class="row"><span>Glucose / HbA1c</span><strong>Core</strong></div><div class="row"><span>Lipides / ApoB / Lp(a)</span><strong>Core</strong></div><div class="row"><span>hs-CRP / NFS</span><strong>Core</strong></div><div class="row"><span>Créatinine / eGFR / foie</span><strong>Core</strong></div></div></article><article class="card c4"><p class="eyebrow">03 · MOTION</p><h3>VALD Motion Case</h3><p>Acquisition objective par l’Operator Team.</p><div class="rows"><div class="row"><span>SmartSpeed</span><strong>Locomotion</strong></div><div class="row"><span>ForceDecks</span><strong>Balance + Function</strong></div><div class="row"><span>HumanTrak</span><strong>Mobility</strong></div><div class="row"><span>DynaMo</span><strong>Strength</strong></div></div></article><article class="card c12"><div class="notice ${gateOpen().length?'warn':''}"><strong>Clinical Gates :</strong> ${gateOpen().length?gateOpen().length+' signal(aux) nécessitent une revue.':'aucun signal actif visible.'}</div></article></section>`;
}
function results(){
 setTitle('Résultats');
 const sc=score(),v=Number(sc?.overall_score);const domains=[['Locomotion',domainVal('locomotion','gait')],['Force',domainVal('strength')],['Fonction',domainVal('function','power_function','power')],['Équilibre',domainVal('balance')],['Mobilité',domainVal('mobility','movement_quality')]];
 $('#view').innerHTML=`<section class="grid"><article class="card c6"><p class="eyebrow">MOTION SCORE V1</p><div class="kpi">${Number.isFinite(v)?Math.round(v):'—'}<small>${Number.isFinite(v)?' /100':''}</small></div><p>Locomotion 25 % · Force 25 % · Fonction 20 % · Équilibre 15 % · Mobilité 15 %.</p><div style="margin-top:14px">${domains.map(([l,x])=>`<div class="domain"><b>${l}</b><span class="bar"><i style="width:${Number.isFinite(x)?Math.max(0,Math.min(100,x)):0}%"></i></span><strong>${Number.isFinite(x)?Math.round(x):'—'}</strong></div>`).join('')}</div></article><article class="card c6"><h3>Données sources</h3><p>Pulse n’efface jamais la métrologie VALD derrière le score.</p><div class="rows">${S.measurements.length?S.measurements.slice(0,8).map(m=>`<div class="row"><span>${esc(m.source)}</span><strong>${esc(m.quality_status)}</strong></div>`).join(''):'<div class="empty">Aucune mesure VALD structurée disponible.</div>'}</div></article><article class="card c12"><div class="notice ${gateOpen().length?'warn':''}">Clinical Gates et biologie restent indépendants du Motion Score.</div></article></section>`;
}
function trajectory(){
 setTitle('Trajectoire');
 const d=[['Locomotion',domainVal('locomotion','gait')],['Force',domainVal('strength')],['Fonction',domainVal('function','power')],['Équilibre',domainVal('balance')],['Mobilité',domainVal('mobility')]].filter(([,v])=>Number.isFinite(v)).sort((a,b)=>a[1]-b[1]);
 $('#view').innerHTML=`<section class="grid"><article class="card c4"><p class="eyebrow">PRIMARY TARGET</p><h3>${esc(d[0]?.[0]||'À définir')}</h3><p>Le domaine le plus faible devient la priorité principale.</p></article><article class="card c4"><p class="eyebrow">SECONDARY TARGET</p><h3>${esc(d[1]?.[0]||'—')}</h3><p>Une seule priorité secondaire.</p></article><article class="card c4"><p class="eyebrow">ASSET TO MAINTAIN</p><h3>${esc(d.at(-1)?.[0]||'—')}</h3><p>Préserver les capacités déjà fortes.</p></article><article class="card c7"><h3>Programme 12 semaines</h3><div class="steps"><div class="step"><i>1</i><div><strong>S1–4 · Foundation</strong><span>Technique, tolérance, capacité et amplitude nécessaire.</span></div></div><div class="step"><i>2</i><div><strong>S5–8 · Strength</strong><span>Surcharge progressive autour du Primary Target.</span></div></div><div class="step"><i>3</i><div><strong>S9–12 · Transfer</strong><span>Force → puissance → fonction → locomotion.</span></div></div></div></article><article class="card c5"><h3>Recontrôles</h3><div class="rows"><div class="row"><span>S2</span><strong>Adhérence / tolérance</strong></div><div class="row"><span>S6</span><strong>Target Check</strong></div><div class="row"><span>S12</span><strong>Full reassessment</strong></div><div class="row"><span>M6</span><strong>Maintenance</strong></div><div class="row"><span>M12</span><strong>Annual Baseline</strong></div></div></article></section>`;
}
function appointments(){
 setTitle('Consultations');
 const rows=S.mode==='pro'&&S.org?S.appointments:S.appointments;
 $('#view').innerHTML=`<article class="card"><h3>Consultations</h3><div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Type</th><th>Statut</th><th>Mode</th></tr></thead><tbody>${rows.length?rows.map(a=>`<tr><td>${fmt(a.scheduled_start)}</td><td>${esc(a.appointment_type)}</td><td>${esc(a.status)}</td><td>${esc(a.location_mode)}</td></tr>`).join(''):'<tr><td colspan="4">Aucune consultation.</td></tr>'}</tbody></table></div></article>`;
}
function patients(){
 setTitle('Patients');
 $('#view').innerHTML=`<article class="card"><h3>${esc(S.org?.name||'Centre KŌMØ')}</h3><p>Sélectionnez un patient pour ouvrir son contexte Operator.</p><div class="table-wrap" style="margin-top:14px"><table class="table"><thead><tr><th>Patient</th><th>Référence</th><th>Naissance</th><th>Statut</th></tr></thead><tbody>${S.patients.map(p=>`<tr data-patient="${p.id}"><td><strong>${esc(pname(p))}</strong></td><td>${esc(p.external_reference)}</td><td>${fmt(p.birth_date)}</td><td>${esc(p.status)}</td></tr>`).join('')}</tbody></table></div></article>`;
 document.querySelectorAll('[data-patient]').forEach(r=>r.onclick=async()=>{localStorage.setItem('komo_v13_patient',r.dataset.patient);await loadPro();location.hash='operator';render()});
}
function operator(){
 setTitle('D0 · Operator Console');
 const by=new Map(S.opSteps.map(x=>[x.step_code,x]));const schema=S.schema.operator;
 $('#view').innerHTML=`<section class="grid"><article class="card c12"><div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start"><div><p class="eyebrow">KŌMØ OPERATOR TEAM</p><h3>${esc(pname(S.patient))}</h3><p>Session D0 standardisée · environ 55 minutes · VALD reste la source métrologique.</p></div><span class="pill ${schema?'':'warn'}">${schema?'Backend Operator actif':'Preview · migration non appliquée'}</span></div><div class="actions"><button class="btn green" id="startOp" ${!schema?'disabled':''}>${S.opSession?'Reprendre D0':'Démarrer D0'}</button><button class="btn" onclick="location.hash='patients'">Changer de patient</button></div></article><article class="card c8"><h3>Séquence D0</h3>${OP_STEPS.map(([code,time,title,device])=>{const s=by.get(code);const status=s?.status||'pending';return`<div class="operator-step ${status==='running'?'running':status==='complete'?'done':''}"><div class="time">${time}</div><div><h4>${esc(title)}</h4><p>Source : ${esc(device)}</p></div><div class="operator-actions"><span class="pill ${status==='complete'?'':'neutral'}">${esc(status)}</span>${schema&&S.opSession?(status==='running'?'<button class="mini primary" data-step="'+code+'" data-action="complete">Valider</button>':status==='pending'?'<button class="mini" data-step="'+code+'" data-action="start">Démarrer</button>':'') : ''}</div></div>`}).join('')}</article><aside class="card c4"><h3>Readiness</h3><div class="rows"><div class="row"><span>SELF</span><strong>${qdone()}/5</strong></div><div class="row"><span>BIOLOGY</span><strong>${S.bio.length?'disponible':'à organiser'}</strong></div><div class="row"><span>Clinical Gates</span><strong>${gateOpen().length}</strong></div><div class="row"><span>VALD</span><strong>source Motion</strong></div></div><div class="notice ${gateOpen().length?'warn':''}" style="margin-top:14px">Un Clinical Gate ne doit jamais être converti en simple pénalité de score.</div></aside></section>`;
 $('#startOp')?.addEventListener('click',startOperator);
 document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>operatorStep(b.dataset.step,b.dataset.action));
}
async function startOperator(){
 if(!S.schema.operator)return;const r=await sb.rpc('start_pulse_operator_session_v1',{p_patient_id:S.patient.id,p_assessment_id:S.assessment?.id||null});if(r.error)return toast(r.error.message);await loadPro();operator();toast('Session D0 démarrée.');
}
async function operatorStep(code,action){
 const payload={qc_status:action==='complete'?'pass':'pending'};const r=await sb.rpc('pulse_operator_step_v1',{p_session_id:S.opSession.id,p_step_code:code,p_action:action,p_payload:payload});if(r.error)return toast(r.error.message);await loadPro();operator();
}
function render(){
 S.route=route();
 const allowed=navItems().map(x=>x[0]);if(!allowed.includes(S.route)){location.hash=allowed[0];return}
 shell();
 if(S.mode==='pro'){if(S.route==='operator')operator();else if(S.route==='patients')patients();else appointments()}
 else{if(S.route==='home')patientHome();else if(S.route==='baseline')baseline();else if(S.route==='results')results();else if(S.route==='trajectory')trajectory();else appointments()}
}
async function refresh(){
 if(S.loading)return;S.loading=true;try{await loadIdentity();await loadAll();render()}finally{S.loading=false}
}
async function boot(){
 const session=(await sb.auth.getSession()).data.session;if(!session)return authView();
 await loadIdentity();await loadAll();render();
}
window.addEventListener('hashchange',()=>{if(S.user){S.route=route();render()}});
sb.auth.onAuthStateChange((_e,s)=>{if(!s)authView()});
boot().catch(e=>authView(e.message||'Erreur de chargement.'));

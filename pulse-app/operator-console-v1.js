
const VERSION='2026.10.07-operator-v1';
const PATIENT_KEY='komo_clinical_patient';
const ASSESSMENT_KEY='komo_clinical_assessment';

const PROTOCOL=[
 {code:'preflight',order:10,start:0,end:5,title:'Safety & standardisation',device:null,source:'Operator',detail:'Identité, consentement, état aigu, douleur inhabituelle, chaussures et environnement standardisés.',required:true},
 {code:'readiness',order:20,start:5,end:10,title:'SELF + Biology readiness',device:null,source:'Pulse',detail:'Vérifier questionnaires, prélèvement biologique et Clinical Gates avant l’acquisition.',required:true},
 {code:'smartspeed_10m',order:30,start:10,end:15,title:'10 m gait speed',device:'SmartSpeed',source:'VALD',detail:'Vitesse habituelle sur 10 m, deux essais valides dans les mêmes conditions.',required:true},
 {code:'forcedecks_quiet_stand',order:40,start:15,end:20,title:'Quiet Stand',device:'ForceDecks',source:'VALD',detail:'Équilibre bipodal standardisé ; acquisition de la stratégie posturale et des variables COP.',required:true},
 {code:'humantrak_mobility',order:50,start:20,end:30,title:'Mobility battery V1',device:'HumanTrak',source:'VALD',detail:'Batterie KŌMØ Mobility V1 configurée dans VALD Hub ; calibration et placement caméra constants.',required:true},
 {code:'dynamo_grip',order:60,start:30,end:38,title:'Bilateral grip strength',device:'DynaMo',source:'VALD',detail:'Trois essais par côté, récupération standardisée ; conserver le meilleur essai valide et l’asymétrie.',required:true},
 {code:'forcedecks_sts',order:70,start:38,end:45,title:'Sit-to-Stand',device:'ForceDecks',source:'VALD',detail:'Protocole Sit-to-Stand V1 configuré dans VALD ; qualité d’exécution et répétitions documentées.',required:true},
 {code:'qc_release',order:80,start:45,end:55,title:'QC + Clinical Gates',device:null,source:'Pulse',detail:'Contrôle final : acquisition complète, provenance VALD, QC, Clinical Gates et passage en revue.',required:true}
];

const QUESTIONNAIRES=[
 {label:'PROMIS Global Health-10',aliases:['PROMIS_GLOBAL_10','PROMIS-GH-10','PROMIS_GLOBAL_HEALTH_10']},
 {label:'PROMIS Physical Function',aliases:['PROMIS_PHYSICAL_FUNCTION','PROMIS_PF','PROMIS_PHYSICAL_FUNCTION_4A']},
 {label:'WHO-5',aliases:['WHO5','WHO_5','WHO-5']},
 {label:'PROMIS Sleep Disturbance 4a',aliases:['PROMIS_SLEEP_4A','PROMIS_SLEEP_DISTURBANCE_4A']},
 {label:'GLFS-25',aliases:['GLFS25','GLFS_25','KOMO_MOBILITY_25']}
];

const S={
 client:null,user:null,role:'member',membership:null,org:null,patients:[],patient:null,assessment:null,
 questionnaires:[],bioPanels:[],gates:[],session:null,steps:[],schemaReady:false,loading:false,loadedFor:'',toast:''
};

const sb=()=>window.KomoRuntime?.client||null;
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const num=v=>Number.isFinite(Number(v))?Number(v):null;
const now=()=>new Date().toISOString();
const route=()=>location.hash.replace(/^#/,'')||'home';
const age=b=>{if(!b)return null;const d=new Date(String(b)+'T00:00:00'),t=new Date();let a=t.getFullYear()-d.getFullYear();if(t<new Date(t.getFullYear(),d.getMonth(),d.getDate()))a--;return a};
const fmt=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d).replace('.','')};
const pname=p=>p?([p.preferred_name||p.first_name,p.last_name].filter(Boolean).join(' ')||p.email||'Patient KŌMØ'):'Aucun patient';
const safe=async promise=>{try{const r=await promise;return {data:r?.data??null,error:r?.error??null}}catch(error){return{data:null,error}}};

function toast(message){
 S.toast=message;
 let el=document.querySelector('#kopToast');
 if(!el){el=document.createElement('div');el.id='kopToast';el.className='kop-toast';document.body.appendChild(el)}
 el.textContent=message;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true},3400);
}
function isPro(){return ['professional','admin'].includes(S.role)&&route()==='clinical'}
function questionnaireState(){
 const completed=new Set((S.questionnaires||[]).filter(x=>x.status==='completed'||Number(x.completeness||0)>=100).map(x=>String(x.instrument_code||'').toUpperCase()));
 const rows=QUESTIONNAIRES.map(q=>({label:q.label,done:q.aliases.some(a=>completed.has(a.toUpperCase()))}));
 return {rows,done:rows.filter(x=>x.done).length,total:rows.length,ready:rows.every(x=>x.done)};
}
function biologyState(){
 const p=S.bioPanels?.[0];
 if(!p)return{ready:false,label:'Absent',tone:'warn',detail:'Aucun panel biologique POC disponible'};
 if(['reviewed','released'].includes(p.status))return{ready:true,label:p.status==='released'?'Libéré':'Relu',tone:'good',detail:'Biologie disponible pour la baseline'};
 if(['received','collected'].includes(p.status))return{ready:false,label:'En cours',tone:'warn',detail:'Résultats en attente de revue'};
 return{ready:false,label:'Planifié',tone:'warn',detail:'Prélèvement à compléter'};
}
function gatesState(){
 const open=(S.gates||[]).filter(g=>['open','review_required','referred'].includes(g.status));
 const urgent=open.filter(g=>g.severity==='urgent');
 return {open,urgent,count:open.length,tone:urgent.length?'bad':open.length?'warn':'good',label:urgent.length?'Signal urgent':open.length?'Revue requise':'Aucun gate bloquant'};
}
function stepRows(){
 const byCode=new Map((S.steps||[]).map(x=>[x.step_code,x]));
 return PROTOCOL.map(p=>{
   const db=byCode.get(p.code)||{};
   return {...p,...db,step_code:p.code,sequence_order:p.order,planned_min_start:p.start,planned_min_end:p.end,status:db.status||'pending',qc_status:db.qc_status||'pending',payload:db.payload||{}};
 });
}
function progress(){
 const rows=stepRows().filter(x=>x.required);
 const done=rows.filter(x=>['complete','review','skipped'].includes(x.status)).length;
 return {done,total:rows.length,pct:rows.length?Math.round(done/rows.length*100):0};
}
function activeStep(){
 const rows=stepRows();
 return rows.find(x=>x.status==='running')||rows.find(x=>!['complete','review','skipped'].includes(x.status))||rows.at(-1);
}
function stepClass(s){return['running','complete','review','rejected'].includes(s)?s:''}
function stepStatus(s,qc){
 if(s==='complete')return'<span class="kop-pill good">Validé</span>';
 if(s==='running')return'<span class="kop-pill good">En cours</span>';
 if(s==='review'||qc==='review')return'<span class="kop-pill warn">À revoir</span>';
 if(s==='rejected'||qc==='fail')return'<span class="kop-pill bad">Rejeté</span>';
 if(s==='skipped')return'<span class="kop-pill warn">Non réalisé</span>';
 return'<span class="kop-pill">À faire</span>';
}
function stepActions(step){
 if(!S.session)return'<button class="kop-mini" disabled>Session requise</button>';
 if(step.status==='pending'||step.status==='ready')return '<button class="kop-mini primary" data-kop-step="'+esc(step.step_code)+'" data-kop-action="start">Démarrer</button>';
 if(step.status==='running'){
   let disabled='';
   if(step.step_code==='readiness'&&!(questionnaireState().ready&&biologyState().ready))disabled=' disabled';
   return '<button class="kop-mini primary" data-kop-step="'+esc(step.step_code)+'" data-kop-action="complete"'+disabled+'>Valider</button><button class="kop-mini warn" data-kop-step="'+esc(step.step_code)+'" data-kop-action="flag">À revoir</button>';
 }
 if(['complete','review','skipped'].includes(step.status))return '<button class="kop-mini" data-kop-step="'+esc(step.step_code)+'" data-kop-action="reset">Réouvrir</button>';
 return '';
}
function preflightChecks(step){
 if(step.step_code!=='preflight')return'';
 const p=step.payload||{},checks=[
  ['identity_confirmed','Identité confirmée','Nom, date de naissance et dossier concordants'],
  ['consent_confirmed','Consentement confirmé','Consentement au bilan et au traitement des données'],
  ['acute_screen_clear','État aigu négatif','Pas de syndrome aigu rendant le test inapproprié'],
  ['pain_screen_clear','Douleur inhabituelle négative','Pas de douleur nouvelle ou non expliquée nécessitant revue'],
  ['footwear_standardised','Chaussures standardisées','Conditions reproductibles pour D0 et S12'],
  ['environment_standardised','Environnement standardisé','Surface, espace, matériel et ordre des tests conformes']
 ];
 return '<div class="kop-checks">'+checks.map(([k,l,d])=>'<label class="kop-check"><input type="checkbox" data-kop-check="'+k+'" '+(p[k]?'checked':'')+'><span><strong>'+esc(l)+'</strong><small>'+esc(d)+'</small></span></label>').join('')+'</div>';
}
function timeline(){
 return stepRows().map(step=>'<article class="kop-step '+stepClass(step.status)+'" data-kop-step-card="'+esc(step.step_code)+'">'+
   '<div class="kop-time"><strong>'+String(step.planned_min_start).padStart(2,'0')+'–'+String(step.planned_min_end).padStart(2,'0')+'</strong><span>minutes</span></div>'+
   '<div class="kop-step-main"><h4>'+esc(step.title||step.step_code)+'</h4><p>'+esc(step.detail||'')+'</p>'+
   '<div class="kop-meta">'+(step.device?'<span class="kop-tag device">'+esc(step.device)+'</span>':'<span class="kop-tag">Operator</span>')+
   '<span class="kop-tag source">Source '+esc(step.source||'Pulse')+'</span>'+
   (step.device?'<span class="kop-tag qc">QC '+esc(step.qc_status||'pending')+'</span>':'')+'</div>'+
   preflightChecks(step)+'</div>'+
   '<div class="kop-step-actions">'+stepStatus(step.status,step.qc_status)+stepActions(step)+'</div></article>').join('');
}
function readinessCard(){
 const q=questionnaireState(),b=biologyState(),g=gatesState();
 return '<article class="kop-card"><div class="kop-card-head"><div><span class="kop-eyebrow">READINESS</span><h3>Avant acquisition</h3><p>Les trois couches restent séparées.</p></div></div>'+
   '<div class="kop-readiness">'+
   '<div class="kop-ready-row"><div><strong>SELF</strong><span>'+q.done+'/'+q.total+' questionnaires POC</span></div><i class="kop-dot '+(q.ready?'good':'warn')+'"></i></div>'+
   '<div class="kop-ready-row"><div><strong>BIOLOGY</strong><span>'+esc(b.detail)+'</span></div><i class="kop-dot '+b.tone+'"></i></div>'+
   '<div class="kop-ready-row"><div><strong>MOTION</strong><span>VALD acquisition structurée</span></div><i class="kop-dot good"></i></div>'+
   '<div class="kop-ready-row"><div><strong>CLINICAL GATES</strong><span>'+esc(g.label)+'</span></div><i class="kop-dot '+g.tone+'"></i></div>'+
   '</div></article>';
}
function questionnaireCard(){
 const q=questionnaireState();
 return '<article class="kop-card"><div class="kop-card-head"><div><span class="kop-eyebrow">SELF</span><h3>Questionnaires</h3><p>Contexte clinique ; aucune pondération cachée dans Motion Score.</p></div><span class="kop-pill '+(q.ready?'good':'warn')+'">'+q.done+'/'+q.total+'</span></div>'+
  '<div class="kop-q-list">'+q.rows.map(x=>'<div class="kop-q"><span>'+esc(x.label)+'</span><b>'+ (x.done?'✓ Complété':'À compléter') +'</b></div>').join('')+'</div></article>';
}
function protocolCard(){
 return '<article class="kop-card"><div class="kop-card-head"><div><span class="kop-eyebrow">STANDARDISATION</span><h3>Règles D0 → S12</h3><p>La comparabilité longitudinale est prioritaire.</p></div></div><div class="kop-protocol">'+
  '<div class="kop-proto-row"><strong>Ordre fixe</strong><span>Ne pas réordonner les tests sauf motif clinique documenté.</span></div>'+
  '<div class="kop-proto-row"><strong>Source métrologique</strong><span>VALD reste la source des valeurs. Pulse stocke le statut, la provenance, le QC et l’interprétation.</span></div>'+
  '<div class="kop-proto-row"><strong>Fatigue</strong><span>Documenter effort inhabituel, douleur, sommeil ou séance sportive pouvant modifier la performance.</span></div>'+
  '<div class="kop-proto-row"><strong>Retest</strong><span>Reproduire chaussures, surface, instructions, ordre, appareil et version de protocole autant que possible.</span></div>'+
  '</div></article>';
}
function gatesCard(){
 const g=gatesState();
 const list=g.open.slice(0,5).map(x=>'<div class="kop-gate '+(x.severity==='urgent'?'bad':'warn')+'"><strong>'+esc(x.gate_code||x.domain||'Clinical Gate')+'</strong><span>'+esc(x.clinician_message||x.patient_message||x.source||'Revue professionnelle requise')+'</span></div>').join('');
 return '<article class="kop-card"><div class="kop-card-head"><div><span class="kop-eyebrow">CLINICAL GATES</span><h3>Décision indépendante</h3><p>Un signal clinique n’est jamais transformé en perte de points.</p></div><span class="kop-pill '+g.tone+'">'+g.count+'</span></div>'+
   (list||'<div class="kop-gate"><strong>Aucun signal actif</strong><span>La couche Clinical Gates est actuellement claire.</span></div>')+'</article>';
}
function patientOptions(){
 return S.patients.map(p=>'<option value="'+esc(p.id)+'" '+(p.id===S.patient?.id?'selected':'')+'>'+esc(pname(p))+'</option>').join('');
}
function header(){
 const pr=progress(),a=S.assessment,session=S.session;
 return '<header class="kop-head"><div><span class="kop-eyebrow">KŌMØ OPERATOR · MOTION BASELINE V1</span><h2>D0 · Operator Console</h2><p>Une session guidée, reproductible et traçable. L’Operator exécute le protocole ; VALD mesure ; Pulse orchestre la qualité, les Clinical Gates et la continuité.</p></div><div class="kop-head-side">'+
  '<span class="kop-pill">'+esc(S.org?.name||'Centre KŌMØ')+'</span>'+
  '<span class="kop-pill '+(session?'good':'')+'">'+(session?esc(session.status||'session'):'Aucune session')+'</span>'+
  '<span class="kop-pill">Protocol v1.0</span></div></header>'+
  (!S.schemaReady?'<div class="kop-schema"><strong>Preview technique.</strong> Le schéma Operator n’est pas encore appliqué à Supabase production : l’interface est active, mais les actions persistantes restent désactivées jusqu’à migration contrôlée.</div>':'')+
  '<section class="kop-toolbar"><label class="kop-field"><span>Patient</span><select id="kopPatient">'+patientOptions()+'</select></label>'+
  '<button class="kop-button primary" id="kopStart" '+(!S.schemaReady||!S.patient?'disabled':'')+'>'+(session?'Reprendre la session':'Démarrer D0')+'</button>'+
  '<button class="kop-button" id="kopReload">Actualiser</button></section>'+
  '<section class="kop-statusbar">'+
   '<div class="kop-stat"><span>Patient actif</span><strong>'+esc(pname(S.patient))+'</strong><small>'+(S.patient?(age(S.patient.birth_date)??'—')+' ans · '+esc(S.patient.external_reference||'sans référence'):'—')+'</small></div>'+
   '<div class="kop-stat"><span>Baseline</span><strong>'+esc(a?.status||'À créer')+'</strong><small>'+esc(a?.protocol_version||'komo-motion-baseline-v1.0')+'</small></div>'+
   '<div class="kop-stat"><span>Progression</span><strong>'+pr.pct+' %</strong><small>'+pr.done+'/'+pr.total+' étapes</small></div>'+
   '<div class="kop-stat"><span>Étape active</span><strong>'+esc(activeStep()?.title||'—')+'</strong><small>'+String(activeStep()?.planned_min_start??0)+'–'+String(activeStep()?.planned_min_end??0)+' min</small></div>'+
   '<div class="kop-stat"><span>Session</span><strong>'+(session?esc(session.status):'Non démarrée')+'</strong><small>'+(session?.started_at?esc(fmt(session.started_at)):'—')+'</small></div>'+
  '</section>';
}
function footer(){
 const pr=progress(),g=gatesState();
 const canFinalize=S.schemaReady&&S.session&&pr.done===pr.total;
 const text=g.count?'Finalisation possible en mode revue : les Clinical Gates resteront bloquants jusqu’à validation.':'Tous les éléments seront transmis à la couche d’analyse après finalisation.';
 return '<footer class="kop-footer"><div><strong>Fin de session D0</strong><span>'+esc(text)+'</span></div><button id="kopFinalize" class="kop-button primary" '+(canFinalize?'':'disabled')+'>Finaliser et envoyer en analyse →</button></footer>';
}
function markup(){
 return '<div class="kop" data-operator-console-v1><div data-clinical-motion-v1 hidden aria-hidden="true"></div>'+header()+
 '<div class="kop-main"><section class="kop-card"><div class="kop-card-head"><div><span class="kop-eyebrow">D0 · ~55 MIN</span><h3>Séquence opérateur</h3><p>Une seule séquence, sans ressaisie manuelle des valeurs VALD.</p></div><span class="kop-pill good">Operator Team</span></div><div class="kop-timeline">'+timeline()+'</div></section>'+
 '<aside class="kop-side">'+readinessCard()+questionnaireCard()+gatesCard()+protocolCard()+'</aside></div>'+footer()+'</div>';
}

async function loadPatientData(){
 S.assessment=null;S.questionnaires=[];S.bioPanels=[];S.gates=[];S.session=null;S.steps=[];S.schemaReady=false;
 if(!S.patient)return;
 const c=sb(),pid=S.patient.id;
 const ar=await safe(c.from('assessments').select('*').eq('patient_id',pid).eq('product_mode','motion').order('created_at',{ascending:false}).limit(1));
 S.assessment=ar.data?.[0]||null;
 if(S.assessment)localStorage.setItem(ASSESSMENT_KEY,S.assessment.id);
 if(S.assessment){
  const qr=await safe(c.from('questionnaire_sessions').select('*').eq('assessment_id',S.assessment.id).order('created_at',{ascending:false}));
  S.questionnaires=qr.data||[];
 }
 const br=await safe(c.from('pulse_biological_panels').select('*').eq('patient_id',pid).order('created_at',{ascending:false}).limit(5));
 S.bioPanels=br.data||[];
 const gr=await safe(c.from('pulse_clinical_gates').select('*').eq('patient_id',pid).order('created_at',{ascending:false}).limit(30));
 S.gates=gr.data||[];
 const sr=await safe(c.from('pulse_operator_sessions').select('*').eq('patient_id',pid).in('status',['draft','running','paused','review']).order('created_at',{ascending:false}).limit(1));
 if(!sr.error){
  S.schemaReady=true;S.session=sr.data?.[0]||null;
  if(S.session){
   const st=await safe(c.from('pulse_operator_steps').select('*').eq('operator_session_id',S.session.id).order('sequence_order',{ascending:true}));
   S.steps=st.data||[];
  }
 }else{
  const code=String(sr.error?.code||'');
  S.schemaReady=!['42P01','PGRST205'].includes(code)&&!/does not exist|schema cache/i.test(String(sr.error?.message||''));
 }
}
async function load(){
 if(S.loading)return;S.loading=true;
 try{
  const c=sb();if(!c)return;
  const auth=await c.auth.getUser();S.user=auth?.data?.user||null;if(!S.user)return;
  const rr=await safe(c.from('account_roles').select('role').eq('user_id',S.user.id).maybeSingle());S.role=rr.data?.role||'member';if(!['professional','admin'].includes(S.role))return;
  const mr=await safe(c.from('organization_members').select('organization_id,role,status,access_scope,organizations(*)').eq('user_id',S.user.id).eq('status','active'));
  const memberships=mr.data||[];S.membership=memberships.find(x=>['motion','clinical'].includes(x.access_scope))||memberships[0]||null;S.org=S.membership?.organizations||null;
  if(!S.org)return;
  const pr=await safe(c.from('patients').select('*').eq('organization_id',S.org.id).eq('status','active').order('last_name',{ascending:true}));
  S.patients=pr.data||[];
  const saved=localStorage.getItem(PATIENT_KEY);S.patient=S.patients.find(x=>x.id===saved)||S.patients[0]||null;
  if(S.patient)localStorage.setItem(PATIENT_KEY,S.patient.id);
  await loadPatientData();
 }finally{S.loading=false}
}
function bind(){
 document.querySelector('#kopPatient')?.addEventListener('change',async e=>{
  localStorage.setItem(PATIENT_KEY,e.target.value);S.patient=S.patients.find(x=>x.id===e.target.value)||null;localStorage.removeItem(ASSESSMENT_KEY);
  await loadPatientData();render();
  window.dispatchEvent(new CustomEvent('komo:clinical-patient-changed',{detail:{patientId:S.patient?.id||null}}));
 });
 document.querySelector('#kopStart')?.addEventListener('click',startSession);
 document.querySelector('#kopReload')?.addEventListener('click',async()=>{await load();render();toast('Données Operator actualisées.')});
 document.querySelector('#kopFinalize')?.addEventListener('click',finalize);
 document.querySelectorAll('[data-kop-step][data-kop-action]').forEach(b=>b.addEventListener('click',()=>stepAction(b.dataset.kopStep,b.dataset.kopAction)));
}
function collectPayload(stepCode){
 if(stepCode!=='preflight')return {};
 const out={};document.querySelectorAll('[data-kop-check]').forEach(x=>out[x.dataset.kopCheck]=Boolean(x.checked));
 return out;
}
function preflightComplete(payload){return ['identity_confirmed','consent_confirmed','acute_screen_clear','pain_screen_clear','footwear_standardised','environment_standardised'].every(k=>payload[k]===true)}
async function startSession(){
 if(!S.schemaReady)return toast('Migration Operator non appliquée : action désactivée en preview.');
 if(S.session)return toast('Session D0 déjà active.');
 if(!S.patient)return toast('Sélectionnez un patient.');
 const c=sb();const r=await safe(c.rpc('start_pulse_operator_session_v1',{p_patient_id:S.patient.id,p_assessment_id:S.assessment?.id||null}));
 if(r.error)return toast('Démarrage impossible : '+(r.error.message||'erreur'));
 await loadPatientData();render();toast('Session D0 démarrée.');
}
async function stepAction(stepCode,action){
 if(!S.session)return toast('Démarrez d’abord la session D0.');
 const payload=collectPayload(stepCode);
 if(action==='complete'&&stepCode==='preflight'&&!preflightComplete(payload))return toast('Complétez tous les contrôles de sécurité avant validation.');
 if(action==='complete'&&stepCode==='readiness'&&!(questionnaireState().ready&&biologyState().ready))return toast('SELF et Biology doivent être prêts pour valider cette étape.');
 if(action==='complete')payload.qc_status='pass';
 if(action==='flag')payload.qc_status='review';
 const c=sb();const r=await safe(c.rpc('pulse_operator_step_v1',{p_session_id:S.session.id,p_step_code:stepCode,p_action:action,p_payload:payload}));
 if(r.error)return toast('Action impossible : '+(r.error.message||'erreur'));
 await loadPatientData();render();
 toast(action==='start'?'Étape démarrée.':action==='flag'?'Étape signalée pour revue.':action==='reset'?'Étape réouverte.':'Étape validée.');
}
async function finalize(){
 if(!S.session)return;
 const c=sb();const r=await safe(c.rpc('finalize_pulse_operator_session_v1',{p_session_id:S.session.id}));
 if(r.error)return toast('Finalisation impossible : '+(r.error.message||'erreur'));
 await loadPatientData();render();
 const status=r.data?.status||r.data?.result_status||'review';
 toast(status==='completed'?'D0 finalisé. Checkpoints longitudinaux créés.':'D0 transmis en revue clinique.');
}
function labelOperatorNav(){
 document.querySelectorAll('[data-pro-nav="motion"]').forEach(b=>{const s=b.querySelector('span');if(s&&s.textContent!=='Operator')s.textContent='Operator';b.setAttribute('aria-label','Operator')});
 document.querySelectorAll('[data-pro-nav="myocare"]').forEach(b=>b.setAttribute('aria-hidden','true'));
}
function render(){
 if(!isPro())return;
 labelOperatorNav();
 const host=document.querySelector('#kcpMotionHost');if(!host||host.hidden)return;
 document.querySelector('#pageEyebrow')&&(document.querySelector('#pageEyebrow').textContent='KŌMØ OPERATOR');
 document.querySelector('#pageTitle')&&(document.querySelector('#pageTitle').textContent='D0 · Motion Baseline');
 host.innerHTML=markup();host.dataset.operatorOwner=VERSION;bind();
}
async function open(){
 if(!isPro())return;
 labelOperatorNav();
 const host=document.querySelector('#kcpMotionHost');if(!host)return;
 host.hidden=false;
 if(!S.user||S.loadedFor!==S.user?.id){await load();S.loadedFor=S.user?.id||''}
 else await loadPatientData();
 render();
}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-pro-nav="motion"],[data-kcp-tab="motion"]');
 if(b)setTimeout(()=>open().catch(console.error),80);
},true);
window.addEventListener('hashchange',()=>{if(route()==='clinical')setTimeout(()=>open().catch(console.error),600)});
window.addEventListener('komo:clinical-patient-changed',()=>{if(route()==='clinical')setTimeout(()=>open().catch(console.error),160)});
let scheduled=false;
const obs=new MutationObserver(()=>{
 if(scheduled||route()!=='clinical')return;
 const host=document.querySelector('#kcpMotionHost');
 if(!host||host.hidden)return;
 scheduled=true;requestAnimationFrame(async()=>{scheduled=false;const current=document.querySelector('#kcpMotionHost');if(current&&!current.hidden&&!current.querySelector('[data-operator-console-v1]'))await open().catch(console.error)});
});
obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{if(route()==='clinical')open().catch(console.error)},1500));
setTimeout(()=>{if(route()==='clinical')open().catch(console.error)},1900);
window.KomoOperatorConsole={version:VERSION,open,reload:async()=>{await load();render()}};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const SCORE_ALG='motion-sensor-index-v0.6.0';
const st={client:null,session:null,role:'member',org:null,patients:[],patient:null,assessments:[],assessment:null,questionnaires:[],imports:[],metrics:[],scores:[],msg:''};
let rendering=false,timer=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return st.client||(st.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}))}
function route(){return location.hash.replace(/^#/,'')||'home'}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function date(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(d)}
function name(p){return p?`${p.preferred_name||p.first_name||''} ${p.last_name||''}`.trim():'Aucun patient'}
function isPro(){return ['admin','professional'].includes(st.role)}
function key(k){return`komo_clinical_${k}`}
function setMsg(x){st.msg=x;const e=document.querySelector('#clmMessage');if(e)e.textContent=x}
function activeScore(){return st.scores.find(x=>x.algorithm_version===SCORE_ALG&&x.release_status!=='superseded')||null}
function isOwnDemo(){return st.patient?.patient_user_id===st.session?.user?.id&&st.patient?.research_subject_code==='KOMO_DEMO_LIVE'&&st.patient?.data_classification==='synthetic'}
function completedQuestionnaires(){return st.questionnaires.filter(x=>x.status==='completed'&&Number(x.completeness||0)>=100).length}
function glfsContext(){return st.questionnaires.find(x=>x.instrument_code==='KOMO_MOBILITY_25')||null}

async function load(){
  const c=sb(),{data:{session}}=await c.auth.getSession();if(!session?.user)return false;st.session=session;
  const rr=await c.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();st.role=rr.data?.role||'member';if(!isPro())return false;
  const mr=await c.from('organization_members').select('organization_id,role,status,organizations(id,name,slug,clinical_data_status,status)').eq('user_id',session.user.id).eq('status','active');
  const ms=mr.data||[],m=ms.find(x=>x.organizations?.slug==='komo-poc')||ms[0];st.org=m?.organizations||null;if(!st.org)return true;
  const pr=await c.from('patients').select('*').eq('organization_id',st.org.id).order('created_at',{ascending:false});st.patients=pr.data||[];
  st.patient=st.patients.find(x=>x.id===localStorage.getItem(key('patient')))||st.patients.find(x=>x.patient_user_id===session.user.id&&x.research_subject_code==='KOMO_DEMO_LIVE')||st.patients[0]||null;
  if(st.patient)localStorage.setItem(key('patient'),st.patient.id);
  await loadPatient();return true;
}

async function loadPatient(){
  st.assessments=[];st.assessment=null;st.questionnaires=[];st.imports=[];st.metrics=[];st.scores=[];if(!st.patient)return;
  const c=sb();
  const ar=await c.from('assessments').select('*').eq('patient_id',st.patient.id).eq('product_mode','motion').order('created_at',{ascending:false});st.assessments=ar.data||[];
  st.assessment=st.assessments.find(x=>x.id===localStorage.getItem(key('assessment')))||st.assessments[0]||null;if(!st.assessment)return;
  localStorage.setItem(key('assessment'),st.assessment.id);const id=st.assessment.id;
  const [qs,im,mm,sc]=await Promise.all([
    c.from('questionnaire_sessions').select('id,instrument_code,status,completeness,score,score_status,updated_at').eq('assessment_id',id),
    c.from('myodev_imports').select('*').eq('assessment_id',id).order('created_at',{ascending:false}),
    c.from('myodev_metrics').select('*').eq('assessment_id',id).order('created_at',{ascending:false}).limit(2000),
    c.from('scores').select('*').eq('assessment_id',id).order('calculated_at',{ascending:false})
  ]);
  st.questionnaires=qs.data||[];st.imports=im.data||[];st.metrics=mm.data||[];st.scores=sc.data||[];
}

function opts(items,sel,fn){return items.map(x=>`<option value="${x.id}" ${x.id===sel?'selected':''}>${esc(fn(x))}</option>`).join('')}
function flow(p,a,imp,s){
  const q=completedQuestionnaires();
  return`<div class="clm-flow">${[
    ['01','Patient',p?'sélectionné':'à sélectionner'],
    ['02','Pré-bilan',a?`${q}/6 complété${q>1?'s':''}`:'en attente'],
    ['03','Myodev',imp?imp.status:'à importer'],
    ['04','Motion Score',s?.motion_score!=null?`${Math.round(Number(s.motion_score))}/100`:'en attente'],
    ['05','Publication',s?.release_status==='released'?'publié':'à valider']
  ].map(x=>`<div class="clm-flow-step"><i>${x[0]}</i><div><strong>${x[1]}</strong><span>${esc(x[2])}</span></div></div>`).join('')}</div>`;
}

function patientBlock(p,a){
  return`<section class="clm-grid"><article class="clm-card"><div class="clm-card-head"><div><h3>Dossier</h3><p>Choisissez le dossier à présenter ou votre démonstration live.</p></div><span class="clm-chip">${st.patients.length} dossiers démo</span></div><label class="clm-field"><span>Patient</span><select id="clmPatient">${opts(st.patients,p?.id,name)}</select></label>${p?`<div class="clm-person"><strong>${esc(name(p))}</strong><span>${date(p.birth_date)} · ${esc(p.data_classification)}</span><span>${isOwnDemo()?'Démo live réinitialisable':'Dossier de démonstration canonique'}</span></div>`:''}${isOwnDemo()?`<div class="clm-actions"><button class="clm-btn soft" type="button" data-action="reset-demo">Réinitialiser ma démo</button></div>`:''}</article><article class="clm-card"><div class="clm-card-head"><div><h3>Consultation Motion</h3><p>Une consultation, un assessment, un import capteur et un score versionné.</p></div>${a?`<span class="clm-chip">${esc(a.status)}</span>`:''}</div>${a?`<label class="clm-field"><span>Évaluation</span><select id="clmAssessment">${opts(st.assessments,a.id,x=>`${date(x.created_at)} · ${x.status}`)}</select></label><div class="clm-person"><strong>${esc(a.protocol_version||'Motion')}</strong><span>${date(a.scheduled_at||a.started_at||a.created_at)}</span><span>Contexte ${esc(a.context_class||'A')}</span></div><div class="clm-actions">${['scheduled','created'].includes(a.status)?'<button class="clm-btn primary" type="button" data-action="start-consultation">Démarrer la consultation</button>':''}<button class="clm-btn" type="button" data-action="open-preassessment">Ouvrir le pré-bilan</button></div>`:'<div class="clm-empty">Aucun épisode Motion disponible pour ce dossier.</div>'}</article></section>`;
}

function preassessmentBlock(){
  const q=completedQuestionnaires(),glfs=glfsContext(),total=st.questionnaires.length||6;
  const labels={KOMO_BASELINE_CORE:'Contexte',KOMO_MOBILITY_25:'GLFS‑25 / mobilité déclarée',KOMO_SLEEP_RECOVERY:'Sommeil & récupération',KOMO_WELLBEING:'Bien-être',KOMO_LIFESTYLE:'Mode de vie',KOMO_HEALTH_HISTORY:'Antécédents'};
  const rows=st.questionnaires.length?st.questionnaires.map(x=>`<div class="clm-domain"><span>${esc(labels[x.instrument_code]||x.instrument_code)}</span><div class="clm-domain-track"><i style="width:${Math.max(0,Math.min(100,Number(x.completeness||0)))}%"></i></div><strong>${Number(x.completeness||0).toFixed(0)}%</strong></div>`).join(''):'<div class="clm-empty">Le pré-bilan sera créé avec la consultation Motion.</div>';
  return`<article class="clm-card"><div class="clm-card-head"><div><h3>Pré-bilan & questionnaires</h3><p>Le GLFS‑25 reste ici comme contexte patient. Aucun questionnaire n’entre dans le Motion Score.</p></div><span class="clm-chip">${q}/${total} complété${q>1?'s':''}</span></div><div class="clm-domain-list">${rows}</div>${glfs?.status==='completed'?`<div class="clm-note"><strong>GLFS‑25 enregistré.</strong> Il est disponible pour l’interprétation du contexte, avec contribution numérique de 0 % au Motion Score.</div>`:''}<div class="clm-actions"><button class="clm-btn" type="button" data-action="open-preassessment">Remplir / relire le pré-bilan</button></div></article>`;
}

function importBlock(imp){
  const valid=st.metrics.filter(x=>x.qc_status==='valid').length,sus=st.metrics.filter(x=>x.qc_status==='suspect').length,invalid=st.metrics.filter(x=>x.qc_status==='invalid').length;
  return`<article class="clm-card"><div class="clm-card-head"><div><h3>Import Myodev</h3><p>Le gros export multi-session peut être déposé ici ; Pulse normalise les lignes avant insertion.</p></div><span class="clm-chip">${imp?esc(imp.status):'À importer'}</span></div><div id="clmImporter"><div class="clm-drop"><strong>Déposer l’export Myodev / MyoCare</strong><span>.xlsx · .xls · .csv · .json</span><input id="clmFile" type="file" accept=".xlsx,.xls,.csv,.json"><div class="clm-file">En attente d’un fichier</div></div></div><div class="clm-qc-grid"><div class="clm-qc"><span>Imports</span><strong>${st.imports.length}</strong></div><div class="clm-qc"><span>Métriques</span><strong>${st.metrics.length}</strong></div><div class="clm-qc"><span>QC valid</span><strong>${valid}</strong></div><div class="clm-qc"><span>À revoir</span><strong>${sus+invalid}</strong></div></div></article>`;
}

function scoreBlock(s){
  if(!s)return`<article class="clm-card"><div class="clm-card-head"><div><h3>Motion Score</h3><p>Le score apparaîtra après un import Myodev accepté et le calcul capteur.</p></div><span class="clm-chip">En attente</span></div><div class="clm-empty">Importez les données capteurs puis utilisez « Calculer le Motion Score » dans le bloc de contrôle.</div></article>`;
  const d=s.domain_scores||{},sym=d.neuromuscular_symmetry,conf=Math.round(Number(s.confidence||0)*100),comp=Math.round(Number(s.completeness||0));
  return`<section class="clm-score-shell"><article class="clm-score-card"><div><p class="eyebrow">MOTION SCORE</p><div class="score">${s.motion_score==null?'—':Math.round(Number(s.motion_score))}<small>/100</small></div></div><div><span class="clm-chip">${esc(s.status||'—')}</span><h3>Mesure capteur.</h3><p>Le score synthétise uniquement la symétrie neuromusculaire issue des données Myodev validées.</p></div></article><article class="clm-card"><div class="clm-card-head"><div><h3>Lecture du score</h3><p>Peu de chiffres, tous traçables.</p></div><span class="clm-chip">${esc(s.release_status||'draft')}</span></div><div class="clm-qc-grid"><div class="clm-qc"><span>Symétrie</span><strong>${sym==null?'—':Number(sym).toFixed(1)+' %'}</strong></div><div class="clm-qc"><span>Confiance</span><strong>${conf} %</strong></div><div class="clm-qc"><span>Complétude</span><strong>${comp} %</strong></div><div class="clm-qc"><span>Algorithme</span><strong>Sensor v0.6</strong></div></div><div class="clm-note">Questionnaires = contexte uniquement. Tests manuels historiques = retirés. Activation, marche et autres métriques capteurs = résultats descriptifs, sans pondération cachée.</div></article></section>`;
}

function render(){
  const root=document.querySelector('#viewRoot');if(!root)return;
  document.querySelector('#pageEyebrow').textContent='KŌMØ CLINICAL · PRO';document.querySelector('#pageTitle').textContent='Motion';
  if(!st.org){root.innerHTML='<div class="clm" data-clinical-motion-v1><div class="clm-empty">Aucune organisation professionnelle active.</div></div>';return}
  const p=st.patient,a=st.assessment,s=activeScore(),imp=st.imports[0]||null;
  root.innerHTML=`<div class="clm" data-clinical-motion-v1><section class="clm-hero"><div><span class="clm-test-badge">DÉMO · ${esc(st.org.clinical_data_status||'test_only')}</span><p class="eyebrow" style="margin-top:18px">KŌMØ MOTION</p><h2>Du bilan<br>au résultat.</h2><p>Pré-bilan patient, acquisition Myodev, contrôle qualité, Motion Score et publication — dans un seul parcours.</p></div><div class="clm-status"><div class="clm-status-row"><span>Centre</span><strong>${esc(st.org.name)}</strong></div><div class="clm-status-row"><span>Mode</span><strong>Données synthétiques</strong></div><div class="clm-status-row"><span>Score</span><strong>100 % capteurs Myodev</strong></div><div class="clm-status-row"><span>Questionnaires</span><strong>Contexte · 0 % du score</strong></div></div></section>${flow(p,a,imp,s)}${patientBlock(p,a)}${a?preassessmentBlock():''}${a?importBlock(imp):''}${a?scoreBlock(s):''}<div id="clmMessage" class="clm-toast">${esc(st.msg)}</div></div>`;
  bind();window.dispatchEvent(new CustomEvent('komo:clinical-motion-render',{detail:{assessmentId:a?.id||null,userId:st.session?.user?.id||null}}));
}

function bind(){
  document.querySelector('#clmPatient')?.addEventListener('change',async e=>{localStorage.setItem(key('patient'),e.target.value);localStorage.removeItem(key('assessment'));st.patient=st.patients.find(x=>x.id===e.target.value)||null;await loadPatient();render()});
  document.querySelector('#clmAssessment')?.addEventListener('change',async e=>{localStorage.setItem(key('assessment'),e.target.value);await loadPatient();render()});
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',action));
}
async function action(e){const a=e.currentTarget.dataset.action;if(a==='start-consultation')await startConsultation();if(a==='open-preassessment')location.hash='documents';if(a==='reset-demo')await resetDemo()}
async function startConsultation(){if(!st.assessment)return;const now=new Date().toISOString();const r=await sb().from('assessments').update({status:'collecting',started_at:st.assessment.started_at||now,updated_at:now}).eq('id',st.assessment.id);if(r.error)return setMsg(r.error.message);await loadPatient();render();setMsg('Consultation Motion démarrée. Le pré-bilan reste modifiable pendant la démonstration.')}
async function resetDemo(){if(!isOwnDemo())return;const ok=confirm('Réinitialiser votre démonstration Motion ? Le dossier live sera recréé vide. Emma et Marc ne seront pas modifiés.');if(!ok)return;setMsg('Réinitialisation de la démo…');const r=await sb().rpc('reset_my_demo_v1');if(r.error)return setMsg(`Reset impossible : ${r.error.message}`);localStorage.setItem(key('patient'),r.data.patientId);localStorage.setItem(key('assessment'),r.data.assessmentId);await load();render();setMsg('Démo réinitialisée. Vous pouvez démarrer une nouvelle consultation.')}

async function refresh(){if(route()!=='clinical'||rendering)return;const shell=document.querySelector('#appShell');if(!shell||shell.hidden)return;rendering=true;try{await load();if(isPro())render()}catch(e){console.error('[clinical-motion]',e)}finally{rendering=false}}
function schedule(){clearTimeout(timer);timer=setTimeout(refresh,50)}
window.addEventListener('hashchange',schedule);window.addEventListener('komo:myocare-imported',async()=>{await loadPatient();render();setMsg('Import Myodev accepté et rattaché à cette consultation.')});window.addEventListener('komo:motion-v06-calculated',async()=>{await loadPatient();render()});window.addEventListener('komo:canonical-result-invalidated',async()=>{if(route()==='clinical'){await loadPatient();render()}});
const obs=new MutationObserver(()=>{if(route()==='clinical'&&!document.querySelector('[data-clinical-motion-v1]'))schedule()});obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,900));setTimeout(schedule,1200);

window.KomoClinicalMotion={version:'2.0.0',scoreAlgorithm:SCORE_ALG,policy:'sensor_only'};

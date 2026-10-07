const VERSION='2026.10.07-poc-v1';
const OWNED=new Set(['home','motion','results','trajectory']);
const EXPECTED_INSTRUMENTS=['PROMIS_GLOBAL_10','PROMIS_PHYSICAL_FUNCTION','WHO5','PROMIS_SLEEP_4A','GLFS25'];
const DOMAIN_LABELS={locomotion:'Locomotion',strength:'Force',function:'Fonction',balance:'Équilibre',mobility:'Mobilité',power:'Fonction'};
const client=()=>window.KomoRuntime?.client||null;
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const n=v=>Number.isFinite(Number(v))?Number(v):null;
const pct=v=>Math.max(0,Math.min(100,n(v)??0));
const fmtDate=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(d)};
const safe=async fn=>{try{const r=await fn();if(r?.error)return null;return r?.data??null}catch{return null}};
const state={loaded:false,user:null,role:null,profile:null,patient:null,assessments:[],scoreRuns:[],questionnaires:[],bioPanels:[],gates:[],checkpoints:[],measurements:[],programs:[]};

function scoreSubscores(run){
 const s=run?.subscores||{};
 const pick=(...keys)=>{for(const k of keys){if(n(s[k])!==null)return n(s[k])}return null};
 return {
   locomotion:pick('locomotion','locomotion_score','gait','gait_score'),
   strength:pick('strength','strength_score'),
   function:pick('function','function_score','power','power_function','power_function_score'),
   balance:pick('balance','balance_score'),
   mobility:pick('mobility','mobility_score','movement_quality')
 };
}
function latestScore(){return state.scoreRuns[0]||null}
function overall(){return n(latestScore()?.overall_score)}
function assessmentDate(){
 const a=state.assessments.find(x=>x.released_at||x.completed_at)||state.assessments[0];
 return a?.released_at||a?.completed_at||a?.created_at||latestScore()?.released_at||latestScore()?.computed_at||latestScore()?.created_at||null;
}
function questionnaireProgress(){
 const completed=new Set(state.questionnaires.filter(x=>x.status==='completed').map(x=>String(x.instrument_code||'').toUpperCase()));
 const done=EXPECTED_INSTRUMENTS.filter(x=>completed.has(x)).length;
 return {done,total:EXPECTED_INSTRUMENTS.length,pct:Math.round(done/EXPECTED_INSTRUMENTS.length*100)};
}
function bioStatus(){
 const p=state.bioPanels[0];
 if(!p)return{label:'À organiser',tone:'neutral',detail:'Prélèvement externe avant la baseline'};
 if(p.status==='released')return{label:'Disponible',tone:'',detail:'Biologie relue et disponible dans Pulse'};
 if(p.status==='reviewed')return{label:'Relue',tone:'',detail:'Validation terminée'};
 return{label:'En cours',tone:'neutral',detail:'Résultats reçus ou en cours de revue'};
}
function gateStatus(){
 const open=state.gates.filter(g=>['open','review_required','referred'].includes(g.status));
 if(open.length)return{count:open.length,label:'Revue médicale requise',tone:'warn'};
 return{count:0,label:'Aucun signal bloquant visible',tone:''};
}
function motionReady(){return state.measurements.some(m=>/vald|forcedecks|dynamo|humantrak|smartspeed/i.test(String(m.source||'')))||overall()!==null}
function baselineStatus(){
 const q=questionnaireProgress(),b=bioStatus(),m=motionReady();
 if(overall()!==null)return{label:'Baseline disponible',tone:'',step:'Résultats et trajectoire actifs'};
 if(q.done===q.total&&state.bioPanels.length&&m)return{label:'Analyse en cours',tone:'neutral',step:'Contrôle qualité et calcul'};
 return{label:'Baseline à compléter',tone:'neutral',step:'Préparer les trois sources'};
}
async function load(){
 const c=client(); if(!c)return;
 const auth=await c.auth.getUser().catch(()=>null); state.user=auth?.data?.user||null; if(!state.user)return;
 const uid=state.user.id;
 state.profile=(await safe(()=>c.from('profiles').select('*').eq('id',uid).maybeSingle()))||null;
 state.role=(await safe(()=>c.from('account_roles').select('*').eq('user_id',uid).maybeSingle()))||null;
 state.patient=(await safe(()=>c.from('patients').select('*').eq('patient_user_id',uid).maybeSingle()))||null;
 state.scoreRuns=(await safe(()=>c.from('pulse_score_runs').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(5)))||[];
 state.measurements=(await safe(()=>c.from('pulse_measurement_sets').select('*').eq('user_id',uid).order('captured_at',{ascending:false}).limit(20)))||[];
 state.programs=(await safe(()=>c.from('pulse_programs').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(5)))||[];
 if(state.patient){
   const pid=state.patient.id;
   state.assessments=(await safe(()=>c.from('assessments').select('*').eq('patient_id',pid).order('created_at',{ascending:false}).limit(20)))||[];
   const ids=state.assessments.map(x=>x.id);
   state.questionnaires=ids.length?((await safe(()=>c.from('questionnaire_sessions').select('*').in('assessment_id',ids).order('created_at',{ascending:false})))||[]):[];
   state.bioPanels=(await safe(()=>c.from('pulse_biological_panels').select('*').eq('patient_id',pid).order('collected_at',{ascending:false}).limit(5)))||[];
   state.gates=(await safe(()=>c.from('pulse_clinical_gates').select('*').eq('patient_id',pid).order('created_at',{ascending:false}).limit(30)))||[];
   state.checkpoints=(await safe(()=>c.from('pulse_checkpoints').select('*').eq('patient_id',pid).order('scheduled_at',{ascending:true}).limit(20)))||[];
 }
 state.loaded=true;
}
function patientName(){const p=state.profile||{};return p.first_name||p.display_name||state.user?.user_metadata?.full_name?.split(' ')[0]||'vous'}
function status(label,tone=''){return '<span class="kp1-status '+esc(tone)+'">'+esc(label)+'</span>'}
function domainRows(){
 const s=scoreSubscores(latestScore());
 return Object.entries(s).map(([k,v])=>`<div class="kp1-domain"><b>${esc(DOMAIN_LABELS[k]||k)}</b><span class="kp1-bar"><i style="width:${pct(v)}%"></i></span><strong>${v===null?'—':Math.round(v)}</strong></div>`).join('');
}
function primaryTrajectory(){
 const s=scoreSubscores(latestScore());
 const available=Object.entries(s).filter(([,v])=>n(v)!==null).sort((a,b)=>a[1]-b[1]);
 if(!available.length)return{primary:'À définir après la baseline',secondary:'—',asset:'—'};
 return{primary:DOMAIN_LABELS[available[0][0]],secondary:DOMAIN_LABELS[available[1]?.[0]]||'—',asset:DOMAIN_LABELS[available.at(-1)[0]]};
}
function nav(){
 if(!document.querySelector('.kp1-nav')){
  document.body.insertAdjacentHTML('beforeend',`<nav class="kp1-nav" aria-label="Navigation Pulse POC V1">
   <a href="#home" data-kp1-route="home">Accueil</a><a href="#motion" data-kp1-route="motion">Baseline</a><a href="#results" data-kp1-route="results">Résultats</a><a href="#trajectory" data-kp1-route="trajectory">Trajectoire</a><a href="#documents" data-kp1-route="documents">Consultations</a>
  </nav>`);
 }
 document.querySelectorAll('[data-kp1-route]').forEach(a=>a.classList.toggle('active',a.dataset.kp1Route===route()));
}
function shell(inner){return `<section class="kp1-shell"><div class="kp1-top"><div><div class="kp1-brand"><b>KŌMØ</b><span>PULSE · POC V1</span></div></div><div>${status('Motion Age désactivé','neutral')}</div></div>${inner}</section>`}
function home(){
 const bs=baselineStatus(),q=questionnaireProgress(),b=bioStatus(),g=gateStatus(),score=overall();
 return shell(`<p class="kp1-eyebrow">KŌMØ MOTION BASELINE</p><h1 class="kp1-title">Bonjour ${esc(patientName())}.<br><em>Mesurer. Interpréter. Agir. Recontrôler.</em></h1><p class="kp1-lead">Pulse rassemble désormais trois sources séparées : ce que vous rapportez, ce que VALD mesure et ce que la biologie objective. Elles ne sont pas additionnées artificiellement.</p>
 <div class="kp1-grid" style="margin-top:28px">
  <article class="kp1-card kp1-span-7"><div>${status(bs.label,bs.tone)}</div><div class="kp1-kpi">${score===null?'—':Math.round(score)}<small>${score===null?'':' / 100'}</small></div><h3>Votre référence Motion</h3><p>${esc(bs.step)}. Le score reste une synthèse fonctionnelle ; les valeurs sources restent accessibles.</p><div class="kp1-actions"><a class="kp1-cta" href="#motion">Voir la baseline →</a><a class="kp1-cta kp1-ghost" href="#results">Voir les résultats</a></div></article>
  <article class="kp1-card kp1-span-5"><p class="kp1-eyebrow">PRÉPARATION</p><div class="kp1-step"><i>${q.done===q.total?'✓':'1'}</i><div><strong>Questionnaires</strong><small>${q.done}/${q.total} instruments principaux complétés.</small></div></div><div class="kp1-step"><i>${state.bioPanels.length?'✓':'2'}</i><div><strong>Biologie externe</strong><small>${esc(b.detail)}</small></div></div><div class="kp1-step"><i>${motionReady()?'✓':'3'}</i><div><strong>Motion Case · VALD</strong><small>SmartSpeed, ForceDecks, HumanTrak et DynaMo.</small></div></div></article>
  <article class="kp1-card kp1-span-12"><div class="kp1-phase"><article><small>D0</small><strong>Baseline complète</strong></article><article><small>S6</small><strong>Target Check</strong></article><article><small>S12</small><strong>Full reassessment</strong></article></div><div class="kp1-callout ${g.tone==='warn'?'warn':''}"><strong>${esc(g.label)}</strong><span>${g.count?'La trajectoire automatique est suspendue tant que le signal n’est pas revu.':'Les Clinical Gates restent indépendants du Motion Score.'}</span></div></article>
 </div>`);
}
function baseline(){
 const q=questionnaireProgress(),b=bioStatus(),g=gateStatus();
 const instruments=[['PROMIS Global Health-10','Santé globale'],['PROMIS Physical Function','Fonction perçue'],['WHO-5','Bien-être'],['PROMIS Sleep Disturbance 4a','Sommeil'],['GLFS-25','Variable POC']].map((x,i)=>`<div class="kp1-row"><span>${esc(x[0])}</span><b>${i<q.done?'Complété':'À compléter'}</b></div>`).join('');
 return shell(`<p class="kp1-eyebrow">BASELINE · V1.0</p><h1 class="kp1-title">Trois sources.<br><em>Une trajectoire claire.</em></h1><p class="kp1-lead">La consultation standardise les conditions avant de comparer dans le temps. Le laboratoire reste externe ; VALD reste la source métrologique Motion ; Pulse assemble sans masquer les données sources.</p>
 <div class="kp1-grid" style="margin-top:28px">
  <article class="kp1-card kp1-span-4"><h3>01 · SELF</h3><p>Questionnaires validés, 8–12 minutes avant la consultation.</p><div class="kp1-list">${instruments}</div></article>
  <article class="kp1-card kp1-span-4"><h3>02 · BIOLOGY</h3><p>Prélèvement externe standardisé.</p><div class="kp1-list"><div class="kp1-row"><span>Glycémie / HbA1c</span><b>Core</b></div><div class="kp1-row"><span>Lipides / ApoB / Lp(a)</span><b>Core</b></div><div class="kp1-row"><span>hs-CRP / NFS</span><b>Core</b></div><div class="kp1-row"><span>Créatinine / eGFR / foie</span><b>Core</b></div></div><div class="kp1-callout"><strong>${esc(b.label)}</strong><span>${esc(b.detail)}</span></div></article>
  <article class="kp1-card kp1-span-4"><h3>03 · MOTION</h3><p>Ordre conçu pour limiter la fatigue.</p><div class="kp1-list"><div class="kp1-row"><span>SmartSpeed</span><b>10 m gait speed</b></div><div class="kp1-row"><span>ForceDecks</span><b>Quiet Stand</b></div><div class="kp1-row"><span>HumanTrak</span><b>Mobility</b></div><div class="kp1-row"><span>DynaMo</span><b>Strength</b></div><div class="kp1-row"><span>ForceDecks</span><b>STSTS</b></div></div></article>
  <article class="kp1-card kp1-span-12"><h3>Clinical Gates</h3><p>Un signal clinique n’est jamais transformé en simple perte de points.</p><div class="kp1-callout ${g.tone==='warn'?'warn':''}"><strong>${esc(g.label)}</strong><span>${g.count?g.count+' signal(aux) actif(s).':'Aucun signal bloquant visible dans les données libérées.'}</span></div><p class="kp1-quiet">Exemples V1 : vitesse de marche très basse, faible grip selon seuils cliniques pertinents, anomalie biologique nécessitant revue. Le professionnel reste responsable de l’interprétation clinique.</p></article>
 </div>`);
}
function results(){
 const score=overall(),s=scoreSubscores(latestScore()),g=gateStatus(),date=assessmentDate();
 const sourceSummary=state.measurements.slice(0,6).map(m=>`<div class="kp1-row"><span>${esc(m.source||'Mesure')}</span><b>${esc(m.quality_status||'capturé')}</b></div>`).join('')||'<p class="kp1-quiet">Les données VALD structurées apparaîtront ici dès que l’intégration API sera active.</p>';
 return shell(`<p class="kp1-eyebrow">RÉSULTATS · ${esc(fmtDate(date))}</p><h1 class="kp1-title">Votre profil Motion.<br><em>Pas un chiffre isolé.</em></h1><div class="kp1-grid" style="margin-top:28px">
 <article class="kp1-card kp1-span-6"><div class="kp1-kpi">${score===null?'—':Math.round(score)}<small>${score===null?'':' / 100'}</small></div><h3>Motion Score V1</h3><p>Locomotion 25 % · Force 25 % · Fonction 20 % · Équilibre 15 % · Mobilité 15 %.</p><div style="margin-top:18px">${domainRows()}</div></article>
 <article class="kp1-card kp1-span-6"><h3>Données sources</h3><p>VALD reste la source de vérité métrologique. Pulse ne remplace pas les valeurs brutes par un score opaque.</p><div class="kp1-list">${sourceSummary}</div><p class="kp1-quiet">Motion Age est volontairement désactivé pendant le POC.</p></article>
 <article class="kp1-card kp1-span-12"><div class="kp1-callout ${g.tone==='warn'?'warn':''}"><strong>${esc(g.label)}</strong><span>${g.count?'Une validation professionnelle est nécessaire avant toute trajectoire automatique.':'Le score et les Clinical Gates restent deux couches indépendantes.'}</span></div></article>
 </div>`);
}
function trajectory(){
 const t=primaryTrajectory(),g=gateStatus();
 return shell(`<p class="kp1-eyebrow">TRAJECTOIRE · 12 SEMAINES</p><h1 class="kp1-title">Une priorité.<br><em>Une action mesurable.</em></h1><p class="kp1-lead">Pulse ne cherche pas à tout corriger à la fois : un objectif principal, un objectif secondaire et un actif à maintenir.</p>
 <div class="kp1-grid" style="margin-top:28px">
  <article class="kp1-card kp1-span-4"><p class="kp1-eyebrow">PRIMARY TARGET</p><h3>${esc(t.primary)}</h3><p>Le domaine le plus faible devient le centre du programme.</p></article>
  <article class="kp1-card kp1-span-4"><p class="kp1-eyebrow">SECONDARY TARGET</p><h3>${esc(t.secondary)}</h3><p>Une seule priorité secondaire pour garder le programme exécutable.</p></article>
  <article class="kp1-card kp1-span-4"><p class="kp1-eyebrow">ASSET TO MAINTAIN</p><h3>${esc(t.asset)}</h3><p>Préserver ce qui fonctionne déjà bien.</p></article>
  <article class="kp1-card kp1-span-7"><h3>Programme</h3><div class="kp1-step"><i>1</i><div><strong>S1–4 · Foundation</strong><small>Technique, capacité, tolérance au volume et mobilité nécessaire.</small></div></div><div class="kp1-step"><i>2</i><div><strong>S5–8 · Strength</strong><small>Surcharge progressive pilotée par le domaine prioritaire.</small></div></div><div class="kp1-step"><i>3</i><div><strong>S9–12 · Strength → Power</strong><small>Transfert vers la fonction et la locomotion.</small></div></div><p class="kp1-quiet">Le programme détaillé peut être délivré via VALD Program Builder / MoveHealth.</p></article>
  <article class="kp1-card kp1-span-5"><h3>Recontrôles</h3><div class="kp1-row"><span>S2</span><b>Adhérence · douleur · tolérance</b></div><div class="kp1-row"><span>S6</span><b>Target Check uniquement</b></div><div class="kp1-row"><span>S12</span><b>Full Motion Reassessment</b></div><div class="kp1-row"><span>M6</span><b>Maintenance</b></div><div class="kp1-row"><span>M12</span><b>Annual Baseline</b></div><div class="kp1-callout ${g.tone==='warn'?'warn':''}"><strong>${g.count?'Trajectoire suspendue':'Trajectoire active'}</strong><span>${g.count?'Revue clinique nécessaire avant prescription automatique.':'Le plan peut être adapté par l’Operator selon le contexte.'}</span></div></article>
 </div>`);
}
function render(){
 const r=route(); if(!OWNED.has(r)){document.documentElement.dataset.kpPoc='0';document.querySelector('.kp1-nav')?.remove();return}
 document.documentElement.dataset.kpPoc='1'; nav();
 const root=document.querySelector('#viewRoot'); if(!root)return;
 const html=r==='home'?home():r==='motion'?baseline():r==='results'?results():trajectory();
 if(root.dataset.kp1Route===r&&root.querySelector('.kp1-shell'))return;
 root.dataset.kp1Route=r; root.innerHTML=html; nav();
}
let rendering=false;
async function boot(){
 if(rendering)return; rendering=true;
 try{if(!state.loaded)await load();render()}finally{rendering=false}
}
window.addEventListener('hashchange',()=>setTimeout(boot,40));
window.addEventListener('komo:canonical-route',()=>setTimeout(boot,40));
window.addEventListener('komo:auth-ready',()=>{state.loaded=false;setTimeout(boot,60)});
const obs=new MutationObserver(()=>{if(OWNED.has(route())&&!document.querySelector('#viewRoot .kp1-shell'))setTimeout(boot,25)});
obs.observe(document.documentElement,{subtree:true,childList:true});
setTimeout(boot,120);
window.KomoPulsePOCV1={version:VERSION,reload:async()=>{state.loaded=false;await boot()}};

// KŌMØ FREE Motion Check v1 — browser-only, no account, payment or patient-record writes.
// The full Motion Score requires standardized, verified tests; this experience NEVER computes it.
import {INTAKE_GROUPS,completeGroup,intakeProgress,scoreIntake} from '../online/session/intake-model.mjs';
import {buildMotionPassport} from '../online/session/motion-passport.mjs';
import {buildPdfReportData,downloadMotionPdf} from '../online/session/pdf-report.js';

const root=document.getElementById('free-motion-app');
const bookingUrl='https://app.acuityscheduling.com/schedule.php?owner=40696577&appointmentType=99940918';
const centerUrl='https://komolongevity.com/fr/bilan/';
const state={phase:'intro',step:0,answers:{},results:{},seconds:30,started:false,finished:false,timer:null,locked:false};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&gt;','"':'&#39;'}[c]));
const fmt=v=>Number.isFinite(v)?v.toFixed(1).replace('.',','):'—';
function stopTimer(){
  if(state.timer){clearInterval(state.timer);state.timer=null;}
}
function scrollStart(){window.scrollTo({top:0,behavior:'instant'});}
function render(){
  stopTimer();
  if(state.phase==='intro')intro();
  if(state.phase==='questions')questions();
  if(state.phase==='test')testScreen();
  if(state.phase==='report')report();
  scrollStart();
}
function shell(kicker,title,subtitle,body){
 root.innerHTML='<div class="page-label">'+esc(kicker)+'</div><div class="page-intro"><h1>'+title+'</h1><p>'+subtitle+'</p></div>'+body;
}
function intro(){
 shell('KŌMØ / LONGEVITY IN MOTION','Commencez par <em>mesurer.</em>',
 'Votre première photographie de mobilité perçue, à votre rythme. Un résultat personnel, puis un Passeport Motion PDF à conserver.',
 '<section class="intro-panel"><div class="free-price">GRATUIT <span>· sans compte · environ 8–12 min</span></div>'+
 '<div class="intro-number"><span>01</span><div><strong>22 questions simples</strong><p>Mobilité, confort et confiance, récupération et habitudes actives.</p></div></div>'+
 '<div class="intro-number"><span>02</span><div><strong>Un test en option</strong><p>Lever de chaise 30 secondes, auto-compté. Aucun usage de la caméra.</p></div></div>'+
 '<div class="intro-number"><span>03</span><div><strong>Votre Passeport Motion</strong><p>Indice exploratoire /100, domaines, points forts, priorités et PDF téléchargeable.</p></div></div>'+
 '<div class="free-caution"><strong>Ce que ce bilan ne fait pas</strong><p>Il ne constitue pas une consultation médicale, un diagnostic, un âge biologique, un calcul de survie ni le Motion Score fonctionnel instrumenté. Les questions et le score propriétaire ne sont pas cliniquement validés.</p></div>'+
 '<button class="btn primary" id="begin">Commencer mon Motion Check gratuit <span>↗</span></button>'+
 '<p class="privacy-note">Aucune inscription, aucune donnée de questionnaire envoyée au serveur. Le rapport PDF est créé sur cet appareil. Si vous quittez ou actualisez cette page, vos réponses ne seront pas conservées.</p></section>');
 root.querySelector('#begin').onclick=()=>{state.phase='questions';render();};
}
function option(q){
 return q.options.map((item,i)=>{
  const v=Array.isArray(item)?item[0]:String(i),label=Array.isArray(item)?item[1]:item;
  return '<label class="answer"><input type="radio" name="'+esc(q.id)+'" value="'+esc(v)+'" '+
   (state.answers[q.id]===v?'checked':'')+'><span>'+esc(label)+'</span></label>';
 }).join('');
}
function questions(){
 const g=INTAKE_GROUPS[state.step],p=intakeProgress(state.answers);
 shell('QUESTIONNAIRE / '+(state.step+1)+' SUR '+INTAKE_GROUPS.length,
  esc(g.title)+'<em>.</em>',esc(g.subtitle),
  '<section class="form-panel"><div class="progress-head"><span>'+p.completed+' réponses / '+p.total+'</span><span>'+p.percent+' %</span></div>'+
  '<div class="progress-track" role="progressbar" aria-label="Progression du questionnaire" aria-valuenow="'+p.percent+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+p.percent+'%"></i></div>'+
  '<div class="question-groups">'+g.questions.map((q,i)=>'<fieldset class="question"><legend><span>'+String(i+1).padStart(2,'0')+'</span> '+esc(q.label)+'</legend><div class="answers">'+option(q)+'</div></fieldset>').join('')+'</div>'+
  '<p class="section-note">'+esc(g.note||'')+'</p>'+
  '<div class="form-actions"><button type="button" class="btn subtle" id="prev">← Retour</button><button class="btn primary" id="next">'+(state.step===INTAKE_GROUPS.length-1?'Voir l’étape physique facultative →':'Continuer →')+'</button></div>'+
  '<p id="q-error" role="alert" class="error"></p></section>');
 root.querySelectorAll('input[type="radio"]').forEach(input=>input.onchange=()=>{
   state.answers[input.name]=input.value;
   root.querySelector('#q-error').textContent='';
   const progress=intakeProgress(state.answers);
   root.querySelector('.progress-head').innerHTML='<span>'+progress.completed+' réponses / '+progress.total+'</span><span>'+progress.percent+' %</span>';
   root.querySelector('.progress-track i').style.width=progress.percent+'%';
   root.querySelector('.progress-track').setAttribute('aria-valuenow',String(progress.percent));
 });
 root.querySelector('#prev').onclick=()=>{
  if(state.step===0)state.phase='intro';else state.step--;
  render();
 };
 root.querySelector('#next').onclick=()=>{
  if(!completeGroup(g,state.answers)){
   root.querySelector('#q-error').textContent='Répondez aux questions de cette section pour obtenir un indice fiable à partir de vos réponses.';
   const missing=g.questions.find(q=>!Object.hasOwn(state.answers,q.id));
   if(missing)root.querySelector('input[name="'+missing.id+'"]')?.focus();
   return;
  }
  if(state.step<INTAKE_GROUPS.length-1){state.step++;render();return;}
  state.phase='test';render();
 };
}
function flags(){
 const a=state.answers;
 return Number(a.pain)>=3||Number(a.fear)>=3||Number(a.avoid)>=3;
}
function finish(withTest=false){
 stopTimer();
 state.answers.safety=flags()?'yes':'no';
 if(!withTest)state.results={};
 state.phase='report';render();
}
function testScreen(){
 const caution=flags();
 shell('ÉTAPE FACULTATIVE / TEST FONCTIONNEL','Un mouvement. <em>Un premier repère.</em>',
 'Le Sit-to-Stand de 30 secondes est facultatif. Votre indice de mobilité perçue repose sur les réponses au questionnaire et restera disponible même sans ce test.',
 '<section class="test-panel">'+(caution?
  '<div class="safety-hold"><strong>Le test physique n’est pas proposé</strong><p>Vous avez indiqué une gêne importante ou une appréhension du mouvement. L’indice déclaratif pourra être calculé, mais un échange individualisé est préférable avant toute activité non supervisée.</p></div>':
  '<div class="test-warning"><strong>Consignes de sécurité</strong><p>Utilisez une chaise stable contre un mur, dans un espace dégagé, avec un appui disponible. Levez-vous et rasseyez-vous à votre rythme pendant 30 secondes. Ne réalisez pas ce test en cas de douleur inhabituelle, vertiges, instabilité ou doute sur votre sécurité. Ne forcez pas.</p></div>'+
  '<label class="ready"><input id="ready" type="checkbox"> Je dispose d’un environnement sûr, je me sens capable de réaliser ce test et j’accepte de l’interrompre en cas de gêne.</label>'+
  '<div class="timer" aria-live="off"><strong id="countdown">'+state.seconds+'</strong><span>secondes</span></div>'+
  '<button class="btn primary" id="start-timer" '+(state.finished?'disabled':'')+'>Démarrer le chronomètre 30 s</button>'+
  '<p id="timer-message" class="section-note" aria-live="polite">Comptez vous-même vos levers complets. La caméra n’est pas utilisée et aucune vidéo n’est enregistrée.</p>'+
  '<div id="score-entry" class="score-entry" '+(state.finished?'':'hidden')+'><label for="sts-count">Nombre de levers complets réalisés en 30 s (auto-déclaré)</label><input id="sts-count" type="number" min="0" max="80" step="1" inputmode="numeric" value="'+(state.results.sts?.value??'')+'" placeholder="Ex. 12"><button class="btn primary" id="save-test">Ajouter au passeport →</button><p id="sts-error" class="error" role="alert"></p></div>')+
 '<div class="form-actions"><button class="btn subtle" id="test-back">← Questions</button><button class="btn subtle" id="skip-test">Passer le test · voir mon passeport →</button></div></section>');
 root.querySelector('#test-back').onclick=()=>{state.phase='questions';state.step=INTAKE_GROUPS.length-1;render();};
 root.querySelector('#skip-test').onclick=()=>finish(false);
 if(caution)return;
 const start=root.querySelector('#start-timer');
 const entry=root.querySelector('#score-entry');
 const ready=root.querySelector('#ready');
 const label=root.querySelector('#timer-message');
 if(state.finished)start.disabled=true;
 start.onclick=()=>{
  if(!ready.checked){label.textContent='Confirmez les consignes de sécurité, ou passez le test.';return;}
  start.disabled=true;
  ready.disabled=true;
  const begun=Date.now();state.started=true;
  state.timer=setInterval(()=>{
   const remaining=Math.max(0,30-Math.floor((Date.now()-begun)/1000));
   state.seconds=remaining;root.querySelector('#countdown').textContent=String(remaining);
   if(remaining===0){
    stopTimer();state.finished=true;label.textContent='Temps écoulé. Notez uniquement les répétitions que vous avez réellement comptées.';
    entry.hidden=false;root.querySelector('#sts-count').focus();
   }
  },150);
 };
 root.querySelector('#save-test').onclick=()=>{
  const input=root.querySelector('#sts-count'),value=Number(input.value);
  if(input.value.trim()===''||!Number.isInteger(value)||value<0||value>80){
   root.querySelector('#sts-error').textContent='Saisissez un nombre entier de répétitions entre 0 et 80, ou passez le test.';
   return;
  }
  state.results={sts:{status:'review',value,source:'Auto-comptage, non vérifié'}};
  finish(true);
 };
}
function domainCard(d){
 return '<article class="domain"><div class="domain-head"><strong>'+esc(d.title)+'</strong><span>'+esc(d.label)+'</span></div>'+
 '<div class="domain-value">'+(d.value===null?'—':fmt(d.value))+' <small>/ 100</small></div>'+
 '<div class="domain-track"><i style="width:'+(d.value??0)+'%"></i></div>'+
 '<p>'+esc(d.caption)+'.</p></article>';
}
function report(){
 const p=buildMotionPassport(state.answers,state.results,flags()),score=scoreIntake(state.answers);
 const focus=p.focus||[];
 const measured=state.results.sts;
 const testSummary=measured?'Auto-comptage du test de chaise : '+esc(String(measured.value))+' répétitions en 30 s. Résultat indicatif, non observé ni validé.':'Aucun test physique réalisé dans ce parcours.';
 const safety=p.planStatus==='safety_hold'||p.planStatus==='professional_review';
 shell('VOTRE PASSEPORT / BILAN GRATUIT','Votre mobilité. <em>Votre point de départ.</em>',
 'Cette première lecture relie votre perception de la mobilité, vos habitudes et une éventuelle observation auto-déclarée.',
 '<section class="passport"><div class="passport-top"><span>KŌMØ / MOTION PASSPORT</span><span>GRATUIT · RÉSULTAT PERSONNEL</span></div>'+
 '<div class="passport-grid"><div><p class="score-name">INDICE DE MOBILITÉ PERÇUE</p><div class="big-score">'+fmt(p.index)+'<small>/100</small></div><p class="score-caveat">Calculé à partir des 22 réponses, pas des répétitions du test physique.</p></div><div class="passport-interpretation"><h2>Ce que cela signifie</h2><p>'+esc(p.interpretation)+'</p><p>Un indice exploratoire, sans valeur pronostique ni équivalence avec un âge biologique.</p></div></div>'+
 '<div class="passport-stats"><span>22 / 22 réponses</span><span>'+(measured?'1 test auto-déclaré':'Aucun test physique')+'</span><span>4 domaines analysés</span></div></section>'+
 '<section class="results"><div class="eyebrow">ANALYSE PERSONNALISÉE</div><h2>Vos quatre domaines</h2><div class="domains">'+p.domains.map(domainCard).join('')+'</div>'+
 '<div class="focus-panel"><h3>Vos deux axes à travailler en priorité</h3>'+
 (focus.length?focus.map((d,i)=>'<div class="focus-row"><b>0'+(i+1)+'</b><div><strong>'+esc(d.title)+'</strong><p>'+esc(d.action)+'</p></div></div>').join(''):'<p>Votre questionnaire est incomplet : aucun classement n’est disponible.</p>')+
 '</div>'+
 '<div class="test-summary"><h3>Votre test fonctionnel facultatif</h3><p>'+testSummary+'</p><p>Le Motion Score fondé sur le STS, le TUG et le SPPB est <strong>non calculable</strong> : les mesures standardisées et contrôlées requises ne sont pas disponibles.</p></div>'+
 (safety?'<div class="safety-hold"><strong>Privilégier un échange individualisé</strong><p>Vos réponses ne permettent pas de suggérer un programme autonome sans précaution supplémentaire.</p></div>':'')+
 '<div class="report-download"><div><span>VOTRE DOCUMENT</span><h3>Passeport Motion PDF</h3><p>Une synthèse multipage avec vos réponses, vos domaines, vos priorités et une feuille de route. Création locale sur votre appareil.</p></div><button class="btn primary" id="download">Télécharger mon PDF ↘</button></div>'+
 '<p id="pdf-status" class="feedback" role="status"></p></section>'+
 '<section class="next-step"><div class="eyebrow">LA SUITE DE VOTRE PARCOURS</div><h2>Mesurer davantage. Progresser durablement.</h2>'+
 '<div class="next-grid"><article><span>01 / BILAN ONLINE · 49 €</span><h3>Approfondir vos résultats</h3><p>Une séance guidée avec des tests supplémentaires et une restitution individualisée. Les mesures complémentaires ne sont pas contenues dans ce bilan gratuit.</p><a href="'+bookingUrl+'" target="_blank" rel="noopener noreferrer">Réserver le Bilan Online ↗</a></article>'+
 '<article><span>02 / PARIS & CANNES</span><h3>Bilan Motion instrumenté</h3><p>Force, équilibre, mobilité et marche, avec mesures spécialisées adaptées au contexte de la consultation.</p><a href="'+centerUrl+'" target="_blank" rel="noopener noreferrer">Découvrir le bilan Motion ↗</a></article>'+
 '<article><span>03 / PULSE DAILY</span><h3>Suivre votre évolution</h3><p>Un cycle de mouvements accessibles, journal de suivi et réévaluation à quatre à six semaines. Activation depuis le parcours Pulse approprié.</p><a href="/" >Découvrir Pulse ↗</a></article></div></section>'+
 '<div class="final-actions"><button class="btn subtle" id="edit">← Modifier mes réponses</button><button class="btn subtle" id="restart">Recommencer un nouveau bilan</button></div>'+
 '<p class="privacy-note">Aucun dossier patient, compte ou enregistrement de données de santé n’a été créé par ce bilan gratuit. En quittant la page, vos réponses disparaissent. En cas de symptômes importants ou de doute, sollicitez un professionnel compétent.</p>');
 root.querySelector('#edit').onclick=()=>{state.phase='questions';state.step=0;render();};
 root.querySelector('#restart').onclick=()=>{state.answers={};state.results={};state.step=0;state.finished=false;state.seconds=30;state.phase='intro';render();};
 root.querySelector('#download').onclick=async()=>{
  const button=root.querySelector('#download'),status=root.querySelector('#pdf-status');
  if(button.disabled)return;
  button.disabled=true;button.textContent='Création du PDF…';status.textContent='Le rapport est généré sur votre appareil.';
  try{
   const payload=buildPdfReportData(state.answers,state.results,null,flags(),new Date(),{mode:'GRATUIT'});
   if(payload.questionnaire.index!==score.profileIndex)throw new Error('inconsistent_scoring');
   const file=await downloadMotionPdf(payload);
   status.textContent='PDF disponible : '+file+'. Aucun résultat n’a été envoyé à Pulse.';
  }catch(err){
   console.error('[free-passport] PDF rendering failed',err?.message);
   status.textContent='Impossible de préparer le PDF. Vérifiez votre connexion pour charger le module de génération, puis réessayez.';
  }finally{button.disabled=false;button.textContent='Télécharger mon PDF ↘';}
 };
}
render();
window.addEventListener('pagehide',stopTimer);

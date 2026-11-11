// KŌMØ Pulse — supervised Motion Online tests; video capture on the phone, manual observations by Operator.
// Test-only. No automated clinical interpretation or diagnostic Motion Score.
const TESTS=[
 {id:"sts",title:"Se relever de la chaise",duration:30,unit:"répétitions",type:"count",
  setup:"Chaise stable contre un mur, caméra de trois-quarts profil, tête et pieds visibles.",
  instruction:"Comptez les levers complets pendant 30 secondes. Bras croisés si possible, sans compromettre la sécurité.",
  label:"Nombre de levers complets"},
 {id:"two_step",title:"Two-Step Test · deux grands pas",duration:0,unit:"cm",type:"manual_two_step",
  setup:"Sol plat antidérapant, ruban métrique au sol, ligne de départ, opérateur à proximité et espace dégagé.",
  instruction:"Depuis la ligne, faire deux pas aussi amples que possible, sans courir ni sauter, puis joindre les pieds. Mesurer la distance entre la ligne et les pointes des pieds. Réaliser deux essais et retenir le meilleur. Recommencer tout essai avec perte d’équilibre.",
  label:"Meilleure distance des deux pas"},
 {id:"unipodal_left",title:"Équilibre · pied gauche",duration:30,unit:"seconds",type:"balance",
  setup:"Sol ferme, yeux ouverts, pieds nus si possible, face à la caméra. Appui stable accessible, praticien à proximité.",
  instruction:"Armez le suivi puis soulevez le pied DROIT sans toucher l'autre jambe. Le chronomètre démarre au lever du pied et s'arrête au retour d'appui, à une compensation ou après 30 s.",
  label:"Appui unipodal gauche (secondes)"},
 {id:"unipodal_right",title:"Équilibre · pied droit",duration:30,unit:"seconds",type:"balance",
  setup:"Sol ferme, yeux ouverts, pieds nus si possible, face à la caméra. Appui stable accessible, praticien à proximité.",
  instruction:"Armez le suivi puis soulevez le pied GAUCHE sans toucher l'autre jambe. Le chronomètre démarre au lever du pied et s'arrête au retour d'appui, à une compensation ou après 30 s.",
  label:"Appui unipodal droit (secondes)"},
 {id:"arms",title:"Mobilité des bras",duration:30,unit:"mouvements",type:"count",
  setup:"Face à la caméra, bras et poignets visibles, espace libre autour du corps.",
  instruction:"Comptez les cycles de lever et abaisser les bras pendant 30 secondes, sans amplitude douloureuse.",
  label:"Nombre de mouvements"},
 {id:"posture",title:"Posture de profil",duration:0,unit:"observation",
  setup:"Profil strict, pieds visibles, téléphone à hauteur du bassin, caméra immobile.",
  instruction:"Observez l'alignement sagittal apparent. Une caméra 2D ne mesure pas la SVA radiographique.",
  label:"Observation visuelle"}
];
const HTML=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
let host=null,api=null,openVideo=null,patient=null,room=null,latestSignature="",poll=null,clock=null,busy=false,stoppedAt=null,polling=false;
let clockKey="",clockLocal=null;
let poseTracker=null,videoListener=null,stopVideoListener=null,fullscreenListener=null,autoValue=null,manualEdited=false,poseStatus="En attente du flux iPhone",poseRetryAt=0;
let extras=null,voice=null,panelMode="tests",questionnaireAnswers={},questionnaireIndex=0;
let questionnaireDirty=false,questionnaireTimer=null,questionnaireSaveInFlight=null,questionnaireNavigating=false,questionnairePersistedAt=0;
let countdownPending=false,previousMilestone=null,clockCompletedNotified=false;
let videoFocus=false,videoLive=false;
const q=id=>host?.querySelector("#"+id);
const SHORT_TEST_NAMES={sts:"Chaise",two_step:"Two-Step",unipodal_left:"Équilibre G.",unipodal_right:"Équilibre D.",arms:"Bras",posture:"Posture"};
function updateCameraLinkState(){
 const badge=q("mocCameraState");if(!badge)return;
 const video=q("mopvVideo");
 const hasFrames=!!video?.srcObject&&video.videoWidth>0&&video.videoHeight>0&&video.readyState>=2;
 const seen=Date.parse(room?.patient_last_seen_at||"");
 const online=Number.isFinite(seen)&&Date.now()-seen<18000;
 const live=room?.status==="active"&&(videoLive||hasFrames);
 badge.dataset.state=room?.status==="completed"?"completed":live?"live":online?"connecting":"offline";
 const label=room?.status==="completed"?"Bilan terminé":live?"● iPhone · image reçue":
  online?"◌ iPhone relié · image en attente":"○ iPhone non connecté";
 badge.textContent=label;
 const banner=q("mocCameraBanner");
 if(banner){
  banner.dataset.state=badge.dataset.state;
  banner.textContent=label+(live?" · Le suivi du mouvement fonctionne en arrière-plan.":
   online?" · Vérifie l'autorisation et garde l'écran de l'iPhone actif.":
   room?.status==="completed"?" · Rapport disponible.":
   " · Active la caméra du cabinet sur ton iPhone.");
 }
}
function updateConsultationLayout(){
 if(!host)return;
 const isReport=panelMode==="report";
 const preview=panelMode==="tests"&&videoFocus&&room?.status!=="completed";
 host.classList.toggle("moc-video-hidden",!preview&&!isReport);
 host.classList.toggle("moc-video-preview",preview);
 host.classList.toggle("moc-show-passport",isReport);
 const aside=q("mocPassportAside");if(aside)aside.hidden=!isReport;
 const button=q("mocVideoFocus");
 if(button){
  button.hidden=panelMode!=="tests"||room?.status==="completed";
  button.textContent=videoFocus?"Masquer la caméra":"Voir la caméra";
  button.setAttribute("aria-pressed",String(videoFocus));
 }
 updateCameraLinkState();
}

function setStatus(message){if(q("mocStatus"))q("mocStatus").textContent=message||""}
function styles(){
 if(document.getElementById("mocStyles"))return;
 const link=document.createElement("link");link.id="mocStyles";link.rel="stylesheet";
 link.href="./motion-live-operator-consult-v1.css?v=20261111-two-step-pdf-v2";
 document.head.append(link);
}
function stopClock(){
 if(clock)clearInterval(clock);
 clock=null;stoppedAt=null;clockKey="";clockLocal=null;previousMilestone=null;clockCompletedNotified=false;
}
function clockRunKey(session){
 return session?.id+":"+session?.step_index+":"+(session?.progress?.test_started_at||"");
}
export function disposeOperatorConsultation(){
 host?.closest(".app-shell")?.classList.remove("moc-video-xxl");
 videoFocus=false;videoLive=false;
 if(poll)clearInterval(poll);poll=null;stopClock();
 if(questionnaireTimer)clearTimeout(questionnaireTimer);questionnaireTimer=null;
 voice?.destroy();voice=null;countdownPending=false;
 extras=null;panelMode="tests";questionnaireAnswers={};questionnaireIndex=0;questionnaireDirty=false;questionnaireSaveInFlight=null;questionnaireNavigating=false;questionnairePersistedAt=0;
 if(videoListener)window.removeEventListener("pulse:remote-video-ready",videoListener);
 if(stopVideoListener)window.removeEventListener("pulse:remote-video-stopped",stopVideoListener);
 if(fullscreenListener)document.removeEventListener("fullscreenchange",fullscreenListener);
 videoListener=null;stopVideoListener=null;fullscreenListener=null;
 poseTracker?.dispose();poseTracker=null;
 host=null;room=null;api=null;openVideo=null;patient=null;latestSignature="";autoValue=null;manualEdited=false;
}
function currentTest(){return TESTS[Number(room?.step_index)]||null}
const isBalance=t=>t?.type==="balance";
const balanceReasonText=reason=>({
 foot_contact:"Le pied libre a été reposé. Mesure terminée.",
 limit:"30 secondes atteintes. Plafond de l’essai.",
 camera_lost:"Repères perdus. Vérifiez la durée avant validation.",
 ambiguous_contact:"Retour d’appui incertain. Vérifiez la mesure."
}[reason]||"Appui interrompu · vérifiez le résultat.");
function stageText(result){return result?.status==="done"?"✓":result?.status==="skipped"?"—":"·"}
function makeShell(){
 host.innerHTML='<section class="moc-shell">'+
 '<header class="moc-head"><div><span class="overline">KŌMØ PULSE · CONSULTATION EN DIRECT</span><h2>Consultation Motion</h2>'+
 '<p id="mocPatientLine"></p></div><div class="moc-head-actions"><button type="button" class="moc-back" id="mocVoice">🎙 Activer la voix</button><button type="button" class="moc-back" id="mocVideoFocus" aria-pressed="false" title="Afficher temporairement la caméra pour régler le cadrage">Voir la caméra</button><button type="button" class="moc-back" id="mocFullscreen">⛶ Plein écran</button><button type="button" class="moc-back" id="mocReturn">Sessions en direct</button></div></header>'+
 '<nav class="moc-mode-tabs" aria-label="Sections de la consultation"><button type="button" id="mocTabTests" class="moc-mode-tab" aria-selected="true">Tests Motion</button><button type="button" id="mocTabQuestionnaire" class="moc-mode-tab">Questionnaires</button><button type="button" id="mocTabReport" class="moc-mode-tab">Rapport PDF</button></nav>'+
 '<p class="moc-save-indicator" id="mocIntakeSaveStatus" role="status" aria-live="polite">Questionnaire · en attente de réponses</p>'+
 '<p class="moc-camera-banner" id="mocCameraBanner" role="status" aria-live="polite" data-state="offline">○ iPhone non connecté · Active la caméra du cabinet.</p>'+
 '<p class="moc-voice-state" id="mocVoiceState" role="status">Voix désactivée · Active-la pour dire « C’est parti », « Stop » ou « Suivant ». Aucun audio n’est enregistré par Pulse.</p>'+
 '<div class="moc-grid"><section class="moc-tests">'+
 '<div class="moc-overview"><span id="mocProgressText">Chargement…</span><div class="moc-progress"><i id="mocProgressFill"></i></div></div>'+
 '<div class="moc-step-nav" id="mocStepNav" aria-label="Progression des six tests Motion"></div>'+
 '<div id="mocTestBody"><p>Recherche de la consultation…</p></div>'+
 '</section><aside class="moc-camera-column"><div class="moc-camera-heading"><strong>iPhone · caméra du cabinet</strong><span id="mocCameraState" class="moc-camera-state" data-state="offline" role="status">○ iPhone non connecté</span></div>'+
 '<div id="mocPassportAside" class="moc-passport-aside" hidden></div>'+
 '<div id="motionConsultCamera" class="moc-camera-host"></div>'+
 '<div class="moc-pose-indicator" id="mocPoseIndicator" role="status">◌ Chargement des marqueurs…</div><div class="moc-camera-foot">Ton iPhone fournit uniquement la vidéo · 33 points analysés ici · Contrôle des tests et des mesures sur cet ordinateur.</div>'+
 '</aside></div><p class="moc-bottom-note">Démonstration avec dossier fictif · Résultats saisis manuellement par l’opérateur · Aucune interprétation clinique automatique</p></section>';
 q("mocReturn").onclick=async()=>{
  try{await saveQuestionnaire();if(questionnaireDirty)return}
  catch(error){questionnaireNote("Sauvegarde échouée : "+error.message);return}
  location.hash="live";
 };
 q("mocVideoFocus").onclick=()=>{videoFocus=!videoFocus;updateConsultationLayout();};
 q("mocTabTests").onclick=()=>switchPanel("tests");
 q("mocTabQuestionnaire").onclick=()=>switchPanel("questionnaire");
 q("mocTabReport").onclick=()=>switchPanel("report");
 q("mocVoice").onclick=()=>{
  if(!voice)return;
  const active=voice.toggle();
  q("mocVoice").textContent=active?"🎙 Couper la voix":"🎙 Activer la voix";
  q("mocVoice").setAttribute("aria-pressed",String(active));
 };
 q("mocFullscreen").onclick=async()=>{
  try{
   if(document.fullscreenElement)await document.exitFullscreen();
   else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
   else{q("mocFullscreen").textContent="Installer la webapp pour le plein écran";return}
   if(q("mocFullscreen"))q("mocFullscreen").textContent=document.fullscreenElement?"↙ Quitter le plein écran":"⛶ Plein écran";
  }catch(error){if(q("mocFullscreen"))q("mocFullscreen").textContent="Plein écran indisponible"}
 };
 q("mocPatientLine").textContent=patient ? [patient.first_name,patient.last_name].filter(Boolean).join(" ")+" · Bilan supervisé" : "Sélectionnez un patient fictif";
 updatePanelTabs();
}
function renderWaiting(message){
 if(!host)return;
 q("mocStepNav").innerHTML="";
 q("mocTestBody").innerHTML='<section class="moc-empty"><h3>Préparer la consultation</h3><p>'+HTML(message)+'</p><button type="button" id="mocGoLive" class="moc-button primary">Ouvrir les sessions en direct</button></section>';
 q("mocGoLive").onclick=()=>{location.hash="live"};
 q("mocProgressText").textContent="En attente d’un téléphone associé";
 q("mocProgressFill").style.width="0%";
}
function formatResult(result,task){
 if(!result)return "Non effectué";
 if(result.status==="skipped")return "Non réalisé";
 if(task.id==="posture"){
  return {"neutral":"Alignement apparent neutre","apparent_offset":"Décalage apparent","not_interpretable":"Non interprétable"}[result.observation]||"Observation enregistrée";
 }
 return Number.isFinite(result.value)?String(result.value)+" "+task.unit+
  (["heels","arms"].includes(task.id)?" / "+(result.duration_seconds===30?30:20)+" s":""):
  "Résultat enregistré";
}
function updatePanelTabs(){
 updateConsultationLayout();
 const saveNote=q("mocIntakeSaveStatus");
 if(saveNote)saveNote.hidden=panelMode==="tests"&&!questionnaireDirty;
 const names={tests:"mocTabTests",questionnaire:"mocTabQuestionnaire",report:"mocTabReport"};
 for(const [key,id] of Object.entries(names)){
  const button=q(id);if(!button)continue;
  button.classList.toggle("active",panelMode===key);
  button.setAttribute("aria-selected",String(panelMode===key));
 }
 const summary=extras?.questionnaireState(questionnaireAnswers);
 if(q("mocTabQuestionnaire")&&summary){
  q("mocTabQuestionnaire").textContent="Questionnaires · "+summary.progress.completed+"/"+summary.progress.total;
 }
}
async function switchPanel(next){
 if(!["tests","questionnaire","report"].includes(next)||!host||questionnaireNavigating)return;
 if(panelMode==="tests"&&next!=="tests"&&room?.progress?.step_status==="running"){
  setStatus("Terminez et validez ce test avant d’ouvrir les questionnaires ou le rapport, afin de conserver le comptage.");
  return;
 }
 questionnaireNavigating=true;
 try{
  if(panelMode==="questionnaire"&&next!=="questionnaire"){
   await saveQuestionnaire();
   if(questionnaireDirty)throw Error("Veuillez confirmer l'enregistrement avant de quitter.");
  }
  voice?.abortCountdown();countdownPending=false;
  panelMode=next;
  if(q("mocStepNav"))q("mocStepNav").hidden=next!=="tests";
  updatePanelTabs();
  if(next==="tests")renderStep();
  else if(next==="questionnaire")renderQuestionnaireSection();
  else renderReportSection();
 }catch(error){
  questionnaireNote("Réponses non enregistrées : "+(error.message||"Réessayez")+". Veuillez réessayer.");
 }finally{questionnaireNavigating=false}
}
function questionnaireNote(message){
 const status=q("mocIntakeState");
 if(status)status.textContent=message;
 const global=q("mocIntakeSaveStatus");
 if(global)global.textContent=message;
}
function scheduleQuestionnaireSave(){
 if(questionnaireTimer)clearTimeout(questionnaireTimer);
 questionnaireTimer=setTimeout(()=>{
  questionnaireTimer=null;
  void saveQuestionnaire().catch(error=>{
   questionnaireNote("NON ENREGISTRÉ : "+(error.message||"Connexion impossible")+
    ". Les réponses restent visibles. Cliquez sur « Enregistrer les réponses ».");
  });
 },450);
}
async function saveQuestionnaire(){
 if(questionnaireTimer){clearTimeout(questionnaireTimer);questionnaireTimer=null}
 if(questionnaireSaveInFlight){
  await questionnaireSaveInFlight;
  if(questionnaireDirty)return saveQuestionnaire();
  return;
 }
 if(!room||!questionnaireDirty)return;
 const snapshot=JSON.stringify(questionnaireAnswers),sessionId=room.id;
 questionnaireNote("Enregistrement sur le serveur…");
 questionnaireSaveInFlight=(async()=>{
  let lastError=null;
  for(let attempt=0;attempt<4;attempt++){
   try{
    const result=await api({action:"operator_questionnaire_save",session_id:sessionId,
     answers:JSON.parse(snapshot)});
    const stored=result.session?.progress?.questionnaire?.answers;
    // Round-trip: never claim success until ALL submitted values match the persisted ones.
    if(!stored||JSON.stringify(stored)!==snapshot){
     // JSON object key order is not guaranteed: check each answer instead.
     if(!stored||Object.entries(JSON.parse(snapshot)).some(([k,v])=>stored[k]!==v)||
       Object.keys(stored).length!==Object.keys(JSON.parse(snapshot)).length)
      throw Error("Réponses non confirmées par le serveur");
    }
    if(room?.id===sessionId){
     room.progress={...room.progress,questionnaire:result.session.progress.questionnaire};
     questionnairePersistedAt=Math.max(questionnairePersistedAt,
      Date.parse(result.session.progress.questionnaire.updated_at)||0);
    }
    if(JSON.stringify(questionnaireAnswers)===snapshot)questionnaireDirty=false;
    questionnaireNote("✓ "+Object.keys(stored).length+"/22 réponses enregistrées sur le serveur");
    return;
   }catch(error){
    lastError=error;
    const message=String(error?.message||"");
    if(attempt<3&&/conflict|stale|retry|tempora|network|Failed to fetch/i.test(message)){
     await new Promise(resolve=>setTimeout(resolve,180*(attempt+1)));
     continue;
    }
    break;
   }
  }
  throw lastError||Error("Sauvegarde impossible");
 })();
 try{await questionnaireSaveInFlight}
 finally{
  questionnaireSaveInFlight=null;
  if(questionnaireDirty&&host?.isConnected&&!questionnaireTimer){
   // Only reschedule when the first accepted snapshot was stale because the
   // operator entered additional answers during the request.
   // On server failure the visible retry button is the deliberate fallback.
   // This prevents infinite retries that hide persistent 409/503 errors.
  }
 }
}
function renderQuestionnaireSection(){
 if(!host||!extras)return;
 stopClockIfNotRunning();
 const progress=extras.questionnaireState(questionnaireAnswers).progress;
 q("mocProgressText").textContent="Questionnaire · "+progress.completed+"/"+progress.total+" réponses";
 q("mocProgressFill").style.width=progress.percent+"%";
 q("mocStepNav").hidden=true;
 extras.renderClinicQuestionnaire(q("mocTestBody"),questionnaireAnswers,questionnaireIndex,{
  onChange:()=>{
   questionnaireDirty=true;
   scheduleQuestionnaireSave();
   updatePanelTabs();
   const current=extras.questionnaireState(questionnaireAnswers).progress;
   q("mocProgressText").textContent="Questionnaire · "+current.completed+"/"+current.total+" réponses";
   q("mocProgressFill").style.width=current.percent+"%";
   questionnaireNote("Modifications en attente · sauvegarde automatique…");
  },
  onNext:async()=>{
   try{await saveQuestionnaire();if(questionnaireDirty)return}catch(error){
    questionnaireNote("Sauvegarde échouée : "+error.message+". Réessayez.");return;
   }
   questionnaireIndex=Math.min(4,questionnaireIndex+1);renderQuestionnaireSection();
  },
  onPrevious:async()=>{
   try{await saveQuestionnaire();if(questionnaireDirty)return}catch(error){
    questionnaireNote("Sauvegarde échouée : "+error.message+". Réessayez.");return;
   }
   questionnaireIndex=Math.max(0,questionnaireIndex-1);renderQuestionnaireSection();
  },
  onComplete:()=>switchPanel("report"),
  onTests:()=>switchPanel("tests"),
  onSave:()=>saveQuestionnaire().catch(error=>{
   questionnaireNote("Sauvegarde échouée : "+error.message+". Réessayez.");
  })
 });
}

function stopClockIfNotRunning(){
 // The running measurement continues while the operator enters questionnaire answers.
 if(room?.progress?.step_status!=="running"&&clock){clearInterval(clock);clock=null;}
}
function renderReportSection(){
 if(!host||!extras||!room)return;
 const results=room.progress?.results||{};
 const summary=extras.clinicReportSummary(questionnaireAnswers,results);
 const label=patient?[patient.first_name,patient.last_name].filter(Boolean).join(" "):"Dossier fictif";
 const simulated=room.progress?.questionnaire?.simulated===true;
 const passport=extras.clinicPassport(questionnaireAnswers,results,new Date(),{subject:label,simulated});
 const plan=passport.actionPlan;
 q("mocProgressText").textContent="Passeport · "+summary.recorded+"/6 tests · "+summary.answered+"/22 réponses";
 q("mocProgressFill").style.width=(Math.min(6,summary.recorded+summary.skipped)/6*100)+"%";
 q("mocStepNav").hidden=true;
 const finished=room.status==="completed";
 const resultCard=t=>'<div class="moc-passport-result"><span>'+HTML(t.short)+'</span><strong>'+HTML(t.display)+'</strong></div>';
 const exerciseCard=e=>'<div class="moc-exercise-card"><div><strong>'+HTML(e.title)+'</strong><small>'+HTML(e.purpose)+'</small></div>'+
  '<b>'+HTML(e.dose)+'</b><span>'+HTML(e.frequency)+'</span><p>'+HTML(e.instructions)+'</p></div>';
 const nutritionCard=item=>'<div class="moc-nutrition-card"><div><strong>'+HTML(item.name)+'</strong><em>'+HTML(item.status)+'</em></div>'+
  '<p>'+HTML(item.benefit)+'</p><small>'+HTML(item.guard)+'</small></div>';
 const essentials=plan.supplements.filter(s=>['protein','creatine','vitd'].includes(s.id));
 const more=plan.supplements.filter(s=>!['protein','creatine','vitd'].includes(s.id));
 const reasons=plan.highlights.map((x,i)=>'<div class="moc-passport-highlight"><small>'+HTML(x.label)+'</small><strong>'+HTML(x.value)+'</strong></div>').join('');
 q("mocTestBody").innerHTML='<section class="moc-test moc-report-section moc-passport-section moc-action-report">'+
  '<span class="moc-kicker">KŌMØ MOTION PASSPORT · SIX-WEEK ACTION PLAN</span>'+
  '<h3>Votre feuille de route</h3>'+
  (simulated?'<p class="moc-demo-warning">SCÉNARIO FICTIF · Réponses simulées, aucun avis médical individualisé.</p>':'')+
  '<div class="moc-action-metrics"><div><strong>'+passport.measured+'/6</strong><span>tests réalisés</span></div>'+
   '<div><strong>'+passport.questionnaire.answered+'/22</strong><span>réponses</span></div>'+
   '<div><strong>6 sem.</strong><span>programme proposé</span></div></div>'+
  '<h4>Votre profil en bref</h4>'+
  '<p class="moc-report-answers-state">'+(passport.questionnaire.answered===22?
   '✓ Questionnaire complet : 22 réponses prises en compte.':
   '⚠ '+passport.questionnaire.answered+'/22 réponses · complétez le questionnaire pour un rapport intégral.')+'</p>'+
  '<div class="moc-passport-highlights">'+reasons+'</div>'+
  '<h4>Tests réalisés</h4><div class="moc-results-compact">'+passport.measures.map(resultCard).join('')+'</div>'+
  '<div class="moc-action-section-title"><h4>Exercices à la maison</h4><small>Progression à adapter et valider</small></div>'+
  '<div class="moc-exercise-grid">'+plan.exercises.slice(0,4).map(exerciseCard).join('')+'</div>'+
  '<details class="moc-report-details"><summary>Marche, progression et consignes complémentaires</summary>'+
   plan.exercises.slice(4).map(exerciseCard).join('')+'<p class="moc-help">'+HTML(plan.safeguards)+'</p></details>'+
  '<h4>Nutrition et compléments</h4>'+
  '<p class="moc-help">Des options conditionnelles, pas une ordonnance automatique. Priorité à l’exercice et aux apports alimentaires.</p>'+
  '<div class="moc-nutrition-grid">'+essentials.map(nutritionCard).join('')+'</div>'+
  '<details class="moc-report-details"><summary>B12, oméga-3 et conditions de sécurité</summary>'+
   more.map(nutritionCard).join('')+
   '<p class="moc-help">'+HTML(plan.review)+'</p></details>'+
  '<p class="moc-report-guard">Proposition éducative : la vidéo et le questionnaire ne permettent ni diagnostic de carence, ni prescription de compléments. Vérification clinique nécessaire.</p>'+
  '<div class="moc-buttons moc-report-actions"><button type="button" class="moc-button primary" id="mocDownloadPdf"'+(!finished?' disabled':'')+'>↓ Télécharger le passeport complet (6 catégories)</button>'+
  '<div class="moc-category-export"><label for="mocExportCategory">Exporter une grande catégorie</label>'+
   '<select id="mocExportCategory" aria-label="Choisir la catégorie">'+
    '<option value="synthese">1 · Synthèse et diagramme</option>'+
    '<option value="tests">2 · Tests et qualité de mesure</option>'+
    '<option value="exercices">3 · Exercices à domicile</option>'+
    '<option value="nutrition">4 · Nutrition et compléments</option>'+
    '<option value="suivi">5 · Suivi à 6 semaines</option>'+
    '<option value="questionnaire">6 · Questionnaire détaillé (22 réponses)</option></select>'+
   '<button class="moc-button secondary" id="mocDownloadChapter"'+(!finished?' disabled':'')+'>↓ Exporter cette catégorie</button></div>'+
  '<button type="button" class="moc-button secondary" id="mocReportQuestionnaire">Questionnaires</button></div>'+
  (!finished?'<p class="moc-status">Terminez les six épreuves pour exporter le document.</p>':'')+
  '<p id="mocReportStatus" class="moc-status" role="status"></p></section>';
 const aside=q("mocPassportAside");
 if(aside){
  const timeline=plan.timeline.map((p,i)=>'<div class="moc-action-phase"><span>0'+(i+1)+'</span>'+
   '<div><small>'+HTML(p.weeks)+'</small><strong>'+HTML(p.title)+'</strong>'+
   '<p>'+HTML(p.tasks[0])+'</p></div></div>').join('');
  aside.innerHTML='<div class="moc-report-aside-card">'+
   '<div class="moc-radar-title"><small>QUESTIONNAIRE · 4 DOMAINES</small><strong>Votre profil de mouvement</strong></div>'+
   extras.clinicRadar(plan)+
   '<p class="moc-radar-disclaimer">'+(simulated?'Réponses fictives · ':'')+'Indice interne exploratoire, sans norme clinique ni valeur diagnostique.</p>'+
   '<div class="moc-radar-divider"></div>'+
   '<div class="moc-radar-title"><small>PROGRESSION</small><strong>6 semaines, 3 étapes</strong></div>'+
   '<div class="moc-action-timeline">'+timeline+'</div>'+
   '<div class="moc-aside-followup"><strong>Contrôle à 6 semaines</strong>'+
   '<span>Mêmes tests · mêmes conditions · évolution des habitudes</span></div>'+
   '<p class="moc-radar-disclaimer">'+HTML(plan.review)+'</p>'+
   '</div>';
 }
 updatePanelTabs();
 q("mocReportQuestionnaire").onclick=()=>switchPanel("questionnaire");
 const button=q("mocDownloadPdf"),chapter=q("mocDownloadChapter");
 const exportPdf=async(type,clicked)=>{
  if(!clicked)return;
  clicked.disabled=true;
  const status=q("mocReportStatus");
  try{
   // Await ANY in-flight autosave, even if the dirty flag is already cleared.
   await saveQuestionnaire();
   if(questionnaireDirty)throw Error("Questionnaire non enregistré. Réessayez dans l'onglet Questionnaires.");
   status.textContent="Vérification des réponses enregistrées sur le serveur…";
   const data=await api({action:"operator_list"});
   const persisted=(data.sessions||[]).find(x=>x.id===room.id&&x.patient_id===patient?.id);
   if(!persisted)throw Error("Dossier introuvable sur le serveur");
   const confirmed={...(persisted.progress?.questionnaire?.answers||{})};
   const expected=questionnaireAnswers;
   if(Object.keys(expected).some(k=>confirmed[k]!==expected[k])||
    Object.keys(confirmed).length!==Object.keys(expected).length)
    throw Error("Questionnaire en cours de synchronisation. Enregistrez les réponses puis réessayez.");
   const progress=extras.questionnaireState(confirmed).progress;
   if(progress.completed<progress.total&&!window.confirm(
    "Le questionnaire contient "+progress.completed+"/"+progress.total+
    " réponses. Exporter tout de même un passeport marqué INCOMPLET ?"))return;
   status.textContent="Création du PDF "+(type==="all"?"complet (toutes sections)":"par catégorie")+"…";
   const filename=await extras.downloadClinicReport(confirmed,persisted.progress?.results||{},new Date(),
    {subject:label,simulated:persisted.progress?.questionnaire?.simulated===true,category:type});
   status.textContent="✓ PDF généré à partir de "+progress.completed+"/"+progress.total+
    " réponses confirmées : "+filename;
  }catch(error){
   status.textContent="Export indisponible : "+(error.message||"erreur de synchronisation");
  }finally{if(clicked.isConnected)clicked.disabled=false}
 };
 if(button)button.onclick=()=>exportPdf("all",button);
 if(chapter)chapter.onclick=()=>exportPdf(q("mocExportCategory")?.value||"synthese",chapter);
}

function renderSummary(){
 stopClock();
 const results=room?.progress?.results||{};
 q("mocProgressText").textContent="Consultation terminée · "+TESTS.length+" tests traités";
 q("mocProgressFill").style.width="100%";
 q("mocStepNav").innerHTML=TESTS.map((t,i)=>'<span class="moc-step done">'+stageText(results[t.id])+' '+HTML(t.title)+'</span>').join("");
 q("mocTestBody").innerHTML='<section class="moc-test"><span class="moc-kicker">CONSULTATION TERMINÉE</span><h3>Synthèse des observations</h3>'+
 '<div class="moc-recap">'+TESTS.map(t=>'<div><span>'+HTML(t.title)+'</span><strong>'+HTML(formatResult(results[t.id],t))+'</strong></div>').join("")+'</div>'+
 '<p class="moc-help">Les six tests sont traités. Tu peux maintenant compléter le questionnaire et télécharger le rapport descriptif PDF.</p>'+
 '<div class="moc-buttons"><button type="button" class="moc-button primary" id="mocGoReport">Consulter le rapport PDF →</button>'+
 '<button type="button" class="moc-button secondary" id="mocGoQuestionnaire">Questionnaires</button></div></section>';
 q("mocGoReport").onclick=()=>switchPanel("report");
 q("mocGoQuestionnaire").onclick=()=>switchPanel("questionnaire");
}
function timeDisplay(){
 const task=currentTest(),node=q("mocClock");
 if(!node||!task||!task.duration||room?.progress?.step_status!=="running")return;
 if(isBalance(task)){
  // The operator ARMING this test never starts the stopwatch.
  // Time comes exclusively from the camera's confirmed single-leg lift.
  const reading=poseTracker?.getLatest();
  const elapsed=reading?.step===task.id&&reading?.started&&Number.isFinite(reading.balanceElapsed)?
    Math.min(30,Math.max(0,reading.balanceElapsed)):null;
  const remaining=elapsed===null?30:Math.max(0,Math.ceil(30-elapsed));
  node.textContent="00:"+String(remaining).padStart(2,"0");
  node.classList.toggle("finished",reading?.balanceState==="completed");
  const live=q("mocLiveBalance");
  if(live)live.textContent=elapsed===null?"—":elapsed.toFixed(1)+" s";
  const state=q("mocBalanceState");
  if(state)state.textContent=elapsed===null?"EN ATTENTE DU PIED LEVÉ":
    reading.balanceState==="completed"?"ESSAI TERMINÉ": "APPUI DÉTECTÉ · MESURE EN COURS";
  if(reading?.balanceState==="completed"&&!clockCompletedNotified){
   clockCompletedNotified=true;poseTracker?.stopMeasurement();
   // "Temps écoulé" is reserved for actually reaching the 30 s ceiling.
   // Early foot contact, compensations and lost tracking must not announce 30 s.
   if(reading.balanceReason==="limit")voice?.complete();
   setStatus(balanceReasonText(reading.balanceReason));
  }
  return;
 }
 const serverStart=Date.parse(room.progress?.test_started_at||"");
 const start=clockLocal?.key===clockRunKey(room)?clockLocal.startedAt:serverStart;
 if(!Number.isFinite(start)){node.textContent="00:"+String(Number(room?.progress?.test_duration_seconds)||task.duration).padStart(2,"0");return}
 const elapsedMs=Math.max(0,(stoppedAt??Date.now())-start);
 const duration=Number(room?.progress?.test_duration_seconds)||task.duration;
 const remaining=Math.max(0,Math.min(duration,Math.ceil(duration-elapsedMs/1000)));
 node.textContent="00:"+String(remaining).padStart(2,"0");
 node.classList.toggle("finished",remaining===0);
 if(remaining!==previousMilestone){
  previousMilestone=remaining;
  if(remaining>0&&remaining<duration)voice?.milestone(remaining);
 }
 if(remaining===0&&!clockCompletedNotified){
  clockCompletedNotified=true;
  if(stoppedAt===null)stoppedAt=start+duration*1000;
  poseTracker?.stopMeasurement();
  voice?.complete();
  setStatus("Temps écoulé. Vérifiez le compteur vidéo ou saisissez la mesure manuellement, puis validez.");
 }
}function setClock(){
 if(clock)clearInterval(clock);
 clock=null;
 const key=clockRunKey(room);
 if(clockKey!==key){clockKey=key;stoppedAt=null;previousMilestone=null;clockCompletedNotified=false;}
 if(room?.progress?.step_status==="running"&&currentTest()?.duration){
  timeDisplay();clock=setInterval(timeDisplay,100);
 }
}
function renderStep(){
 if(!host||!room)return;
 if(room.status==="completed"||room.stage_code==="finished"){
  if(extras){panelMode="report";renderReportSection()}else renderSummary();
  return
 }
 const t=currentTest();
 if(!t){renderWaiting("La session doit être initialisée dans les tests Motion Online.");return}
 const results=room.progress?.results||{};
 const idx=room.step_index;
 q("mocProgressText").textContent="Test "+(idx+1)+" sur "+TESTS.length;
 q("mocProgressFill").style.width=(idx/TESTS.length*100)+"%";
 q("mocStepNav").innerHTML=TESTS.map((item,i)=>'<div class="moc-step '+(i===idx?"current":i<idx?"done":"")+'" title="'+HTML(item.title)+'"'+(i===idx?' aria-current="step"':'')+'>'+
 '<b>'+HTML(i<idx?stageText(results[item.id]):String(i+1))+'</b><span>'+HTML(SHORT_TEST_NAMES[item.id]||item.title)+'</span></div>').join("");
 const running=room.progress?.step_status==="running";
 const safety=idx===0&&!room.progress?.safety_confirmed;
 autoValue=null;manualEdited=false;
 if(t.id==="two_step")poseTracker?.stopMeasurement();
 else poseTracker?.setTest(t.id,room.progress?.test_started_at,running,
  Number(room.progress?.test_duration_seconds)||t.duration);
 const input=t.id==="two_step"?
  '<div class="moc-two-step-fields"><p class="moc-help">Saisie opérateur · deux essais, meilleure distance retenue. Indice = distance / taille.</p>'+
  '<label class="moc-field">Essai 1 · distance (cm)<input id="mocTwoStep1" type="number" min="1" max="650" step="0.1" inputmode="decimal" placeholder="ex. 240"></label>'+
  '<label class="moc-field">Essai 2 · distance (cm)<input id="mocTwoStep2" type="number" min="1" max="650" step="0.1" inputmode="decimal" placeholder="ex. 252"></label>'+
  '<label class="moc-field">Taille (cm) · facultative<input id="mocTwoStepHeight" type="number" min="100" max="230" step="0.1" inputmode="decimal" placeholder="ex. 175"></label>'+
  '<p id="mocTwoStepComputed" class="moc-status">Renseignez les deux distances ; la meilleure sera retenue.</p></div>'
  :t.id==="posture"?
  '<label class="moc-field">Observation (sans mesure radiographique)<select id="mocObservation">'+
  '<option value="">Choisir une observation</option><option value="neutral">Alignement apparent neutre</option>'+
  '<option value="apparent_offset">Décalage sagittal apparent</option><option value="not_interpretable">Image non interprétable</option></select></label>'
  :'<label class="moc-field">'+HTML(t.label)+'<div class="moc-input-unit"><input id="mocValue" type="number" inputmode="decimal" min="0" max="'+(t.unit==="seconds"?String(t.duration):"100")+'" step="'+(t.unit==="seconds"?"0.1":"1")+'" placeholder="Saisir une valeur"><span>'+HTML(t.unit)+'</span></div></label>';
 q("mocTestBody").innerHTML='<section class="moc-test"><span class="moc-kicker">TEST '+(idx+1)+' / '+TESTS.length+'</span><h3>'+HTML(t.title)+'</h3>'+
 '<details class="moc-instructions" '+(!running?'open':'')+'><summary>Installation et consignes de sécurité</summary><div class="moc-guide"><div><strong>Installation</strong><p>'+HTML(t.setup)+'</p></div>'+
 '<div><strong>Consigne</strong><p>'+HTML(t.instruction)+'</p></div></div></details>'+
 (safety?'<label class="moc-safety"><input type="checkbox" id="mocSafety"> Conditions de sécurité vérifiées : espace dégagé, appui accessible, absence de contre-indication évidente au test.</label>':'')+
 (running?'<div class="moc-live-hud"><div class="moc-timer"><div class="moc-clock-figure"><span>'+(t.id==="two_step"?"MESURE MANUELLE":"CHRONOMÈTRE")+'</span><strong id="mocClock" aria-live="off">'+(t.id==="two_step"?"2 essais":t.duration?"00:"+String(t.duration).padStart(2,"0"):"Observation")+'</strong></div>'+
 (t.type==="balance"?'<div class="moc-rep-figure moc-balance-figure"><span>TEMPS MAINTENU</span><strong id="mocLiveBalance" aria-live="off">—</strong><small id="mocBalanceState">EN ATTENTE DU PIED LEVÉ</small></div>':'')+
 (t.type==="count"?'<div class="moc-rep-figure"><span>'+ (t.id==="sts"?"LEVERS EN DIRECT":"RÉPÉTITIONS EN DIRECT")+'</span><strong id="mocLiveCount" role="status" aria-live="polite" aria-atomic="true">0</strong><small>Estimation vidéo · à confirmer</small></div>':'')+
 (t.duration?'<div class="moc-clock-actions"><button type="button" class="moc-button secondary" id="mocStopClock">'+(isBalance(t)?"Arrêter l’essai":"Arrêter")+'</button><button type="button" class="moc-button secondary" id="mocRestartClock">'+(isBalance(t)?"↻ Refaire l’essai":"↻ Repartir de "+t.duration+" s")+'</button></div>':'')+'</div></div>'+input+
 (isBalance(t)?'<p class="moc-balance-reference">Yeux ouverts · 30 s maximum · durée réelle depuis le pied levé · 10 s = repère descriptif, non diagnostique. Arrêter en cas de perte d’équilibre ou de recours à un appui.</p>':'')+
 '<div class="moc-auto-feedback" id="mocAutoFeedback">'+(t.id==="two_step"?"Deux distances mesurées manuellement ; la caméra ne détermine pas cette valeur.":"◌ Marqueurs en cours de chargement. En attendant, saisie manuelle possible.")+'</div>'+
 '<label class="moc-field">Notes (facultatif)<textarea id="mocNote" rows="2" maxlength="300" placeholder="Qualité de l’observation, aide utilisée, remarque…"></textarea></label>'+
 '<div class="moc-buttons"><button type="button" id="mocSave" class="moc-button primary">Valider et passer au suivant</button>'+
 '<button type="button" id="mocSkip" class="moc-button secondary">Test non réalisé</button></div>'
 :'<div class="moc-buttons"><button type="button" id="mocStart" class="moc-button primary">'+(isBalance(t)?"Armer le suivi · départ automatique":t.id==="two_step"?"Commencer la saisie des deux essais":t.duration?"Démarrer le chronomètre":"Commencer l’observation")+'</button>'+
 '<button type="button" id="mocSkip" class="moc-button secondary">Test non réalisé</button></div>')+
 '<p id="mocStatus" class="moc-status" role="status" aria-live="polite"></p></section>';
 if(q("mocValue"))q("mocValue").addEventListener("input",()=>{manualEdited=true});
 if(t.id==="two_step"){
  const update=()=>{
   manualEdited=true;
   const a=Number(q("mocTwoStep1")?.value),b=Number(q("mocTwoStep2")?.value);
   const height=Number(q("mocTwoStepHeight")?.value);
   const valid=(v)=>Number.isFinite(v)&&v>0&&v<=650;
   const best=valid(a)&&valid(b)?Math.max(a,b):null;
   const note=q("mocTwoStepComputed");
   if(note)note.textContent=best===null?"Renseignez deux essais valides (1–650 cm).":
    "Meilleure distance : "+best.toLocaleString("fr-FR")+" cm"+
    (q("mocTwoStepHeight")?.value&&height>=100&&height<=230?
     " · Indice Two-Step : "+(best/height).toFixed(2).replace(".",","):" · Taille non renseignée : indice non calculé");
  };
  ["mocTwoStep1","mocTwoStep2","mocTwoStepHeight"].forEach(id=>q(id)?.addEventListener("input",update));
 }
 if(q("mocStart"))q("mocStart").onclick=()=>startWithCountdown("start");
 if(q("mocSave"))q("mocSave").onclick=()=>submit("save");
 if(q("mocSkip"))q("mocSkip").onclick=()=>submit("skip");
 if(q("mocRestartClock"))q("mocRestartClock").onclick=()=>startWithCountdown("restart");
 if(q("mocStopClock"))q("mocStopClock").onclick=()=>{
  if(stoppedAt===null)stoppedAt=Date.now();
  voice?.abortCountdown();
  poseTracker?.stopMeasurement();
  const observed=poseTracker?.getLatest();
  if(observed?.measurement!==null&&Number.isFinite(observed?.measurement)&&q("mocValue")&&!manualEdited)
    q("mocValue").value=String(observed.measurement);
  const start=Date.parse(room.progress.test_started_at||"");
  if(isBalance(t)&&!q("mocValue")?.value){
   setStatus("Essai interrompu. Si la caméra n’a pas obtenu de mesure exploitable, saisissez la durée observée manuellement.");
  }else if(t.unit==="seconds"&&Number.isFinite(start)&&q("mocValue")&&!q("mocValue").value){
   // Optical balance data may be missing; only a manual operator measurement can fill it.
   setStatus("Aucune durée détectée. Vous pouvez saisir votre chronométrage manuel.");
  }
  timeDisplay();
 };
 setClock();
 updatePosePanel(poseTracker?.getLatest());
}
function updatePosePanel(reading){
 const indicator=q("mocPoseIndicator"),feedback=q("mocAutoFeedback");
 const ready=!!reading?.valid&&reading.frames>=5;
 const message=reading?.message||poseStatus;
 if(indicator)indicator.textContent=ready?"● Corps détecté · "+message:
  (!videoLive?"○ Image indisponible · active la caméra sur l’iPhone et vérifie le flux.":"◌ Ajuste le cadrage · "+message);
 const t=currentTest(),running=room?.progress?.step_status==="running";
 if(t?.id==="two_step"){if(feedback)feedback.textContent="Two-Step Test : mesure manuelle des deux essais, sans estimation par caméra.";return}
 if(!running||!feedback)return;
 const detected=reading?.measurement;
 // The actual optical counter is updated on every pose result (~160 ms).
 // Keep already counted repetitions when a landmark is temporarily occluded.
 if(t?.type==="count"){
  const tile=q("mocLiveCount"),input=q("mocValue");
  if(Number.isFinite(detected)&&detected>=0){
   const previous=autoValue;
   autoValue=detected;
   if(tile){
    // Avoid repeating screen-reader announcements 6 times a second;
    // announce only genuine changes in the count.
    if(tile.textContent!==String(detected))tile.textContent=String(detected);
    tile.classList.toggle("moc-count-verified",ready);
    if(detected>0&&detected>previous&&tile.animate)
     tile.animate([{transform:"scale(1.17)"},{transform:"scale(1)"}],{duration:240,easing:"ease-out"});
   }
   if(input&&!manualEdited)input.value=String(detected);
  }else if(tile){
   tile.textContent=String(Number.isFinite(autoValue)?autoValue:0);
   tile.classList.remove("moc-count-verified");
  }
  if(ready&&Number.isFinite(autoValue)){
   feedback.textContent="◉ Comptage vidéo en direct : "+autoValue+" "+t.unit+" · "+
    (reading?.phase==="seated"?"Assis détecté · relevez-vous":reading?.phase==="standing"?"Debout détecté · rasseyez-vous":message)+
    ". Corrigez la valeur avant de valider si nécessaire.";
  }else{
   feedback.textContent="◌ "+message+
    (Number.isFinite(autoValue)?" · "+autoValue+" mouvements déjà comptés et conservés.":" · Le comptage démarre après détection d’une posture assise, de profil.")+
    " Saisie manuelle possible.";
  }
  return;
 }
 if(isBalance(t)){
  const state=reading?.balanceState||"waiting";
  const elapsed=reading?.started&&Number.isFinite(reading.balanceElapsed)?
   Math.min(30,Math.max(0,reading.balanceElapsed)):null;
  const quality=Number.isFinite(reading?.balanceQuality)?reading.balanceQuality:0;
  const input=q("mocValue");
  // Keep the most recent visible measurement. Require confidence and operator
  // confirmation before storing it as a video-derived result.
  if(elapsed!==null){
   autoValue=elapsed;
   if(input&&!manualEdited)input.value=String(elapsed);
  }
  if(state==="waiting"||state==="candidate"){
   feedback.textContent=state==="candidate"?
    "◌ Pied levé détecté · stabilisation en cours, départ automatique.":
    "◌ Suivi armé. Soulevez le pied opposé à la jambe d’appui. Le chrono ne démarre pas avant la détection.";
  }else if(state==="running"){
   feedback.textContent="◉ Appui détecté : "+elapsed?.toFixed(1)+" / 30 s · Qualité vidéo "+quality+
    "% · Arrêt au retour du pied au sol. Le praticien peut interrompre l’essai.";
  }else if(state==="completed"){
   feedback.textContent="✓ "+balanceReasonText(reading.balanceReason)+" Durée estimée : "+
    elapsed?.toFixed(1)+" s · Qualité du suivi : "+quality+
    "%. Vérifiez l’image avant de valider.";
  }else feedback.textContent="◌ Suivi vidéo indisponible : mesure manuelle possible.";
  timeDisplay();
  return;
 }
 if(t?.id==="posture"){
  const index=Number.isFinite(reading?.postureIndex)?reading.postureIndex:null;
  feedback.textContent=index!==null&&reading?.stable?
   "Repères stables · décalage sagittal apparent : "+index+" % (indice 2D, non SVA). Confirmez l’observation ci-dessous.":
   "Marqueurs visibles. Placez-vous strictement de profil puis contrôlez l’alignement.";
  return;
 }
 if(ready&&detected!==null&&Number.isFinite(detected)){
  autoValue=detected;
  const input=q("mocValue");
  if(input&&!manualEdited)input.value=String(detected);
  feedback.textContent="◉ Estimation vidéo : "+detected+" "+t.unit+" · Qualité du suivi "+reading.quality+" %. Valeur modifiable avant validation.";
 }else{
  feedback.textContent="◌ "+message+" · Ajustez le cadrage ou saisissez manuellement si nécessaire.";
 }
}
async function attachPoseVideo(video){
 if(!poseTracker||!video?.srcObject)return;
 poseStatus="Chargement du moteur MediaPipe sur l’ordinateur…";
 updatePosePanel(null);
 await poseTracker.attach(video);
}
async function startWithCountdown(action="start"){
 if(!room||panelMode!=="tests"||countdownPending||busy||!["start","restart"].includes(action))return;
 if(action==="start"&&room.progress?.step_status==="running"){setStatus("Le chronomètre fonctionne déjà.");return}
 if(action==="restart"&&room.progress?.step_status!=="running"){setStatus("Le test n’a pas encore démarré.");return}
 if(room.step_index===0&&!room.progress?.safety_confirmed&&!q("mocSafety")?.checked){
  setStatus("Vérifiez et confirmez les conditions de sécurité avant de lancer le premier test.");
  return;
 }
 if(currentTest()?.id==="two_step"){
  await submit(action);return;
 }
 const latest=poseTracker?.getLatest();
 if(!latest?.valid){
  setStatus(isBalance(currentTest())?
   "Vérifiez que les deux chevilles sont visibles. L’essai ne démarrera qu’après le pied levé.":
   "Aucun corps détecté pour l’instant. Cadrez la personne entière : comptage vidéo indisponible sinon (saisie manuelle possible).");
 }
 if(isBalance(currentTest())){
  // Don't play a 3-2-1 timed start: the patient determines the lift onset.
  await submit(action);
  if(room?.progress?.step_status==="running")setStatus("Suivi armé. Levez le pied opposé : le chrono partira automatiquement.");
  return;
 }
 const session=room.id,step=room.step_index;
 countdownPending=true;
 const button=q(action==="restart"?"mocRestartClock":"mocStart");
 if(button)button.disabled=true;
 try{
  const started=await voice?.countdown(()=>{
   if(room?.id===session&&room.step_index===step&&panelMode==="tests")
    void submit(action);
  },value=>setStatus(value==="TOP !"?"TOP !":"Départ dans "+value+"…"));
  // Browser without voice module: start using the existing on-screen button.
  if(!voice&&room?.id===session&&room.step_index===step)await submit(action);
  if(!started&&voice)setStatus("Départ annulé. Tu peux relancer le chronomètre.");
 }finally{
  countdownPending=false;
  if(button?.isConnected)button.disabled=false;
 }
}
function handleVoiceAction(command){
 if(!host||!room||panelMode!=="tests"){
  const node=q("mocVoiceState");if(node)node.textContent="Commande reconnue, mais ouvre « Tests Motion » pour agir.";
  return;
 }
 if(command==="start")return void startWithCountdown("start");
 if(command==="stop"){
  const stop=q("mocStopClock");
  if(stop)stop.click();
  else setStatus("Aucun chronomètre en cours.");
  return;
 }
 if(command==="redo"){
  const restart=q("mocRestartClock");
  if(restart)restart.click();
  else setStatus("Pour recommencer, lance d’abord ce test.");
  return;
 }
 if(command==="next"){
  const next=q("mocSave");
  if(next)next.click();
  else setStatus("Termine la mesure avant de passer au test suivant.");
 }
}
async function submit(event){
 if(busy||!room||!currentTest())return;
 const t=currentTest();const safety=!!room.progress?.safety_confirmed||!!q("mocSafety")?.checked;
 if(room.step_index===0&&!safety){setStatus("Confirmez d’abord la sécurité du test.");return}
 const payload={action:"operator_test_update",session_id:room.id,step_code:t.id,event,safety_confirmed:safety};
 if(["start","restart"].includes(event))payload.duration_seconds=t.duration;
 if(event==="save"){
  const note=q("mocNote")?.value||"";
  payload.note=note;
  if(t.id==="two_step"){
   const rawA=q("mocTwoStep1")?.value,rawB=q("mocTwoStep2")?.value,rawH=q("mocTwoStepHeight")?.value;
   const a=Number(rawA),b=Number(rawB),height=rawH?Number(rawH):null;
   const valid=v=>Number.isFinite(v)&&v>=1&&v<=650&&Math.round(v*10)===v*10;
   if(!rawA||!rawB||!valid(a)||!valid(b)||
     (height!==null&&(!Number.isFinite(height)||height<100||height>230||Math.round(height*10)!==height*10))){
    setStatus("Saisissez les distances des deux essais (cm) et, si connue, une taille valide.");return;
   }
   payload.value=Math.max(a,b);
   payload.attempts_cm=[a,b];
   if(height!==null)payload.height_cm=height;
   payload.measurement_source="operator_manual_observation";
  }else if(t.id==="posture"){
   payload.observation=q("mocObservation")?.value||"";
   if(!payload.observation){setStatus("Choisissez une observation pour ce test.");return}
  }else{
   const raw=q("mocValue")?.value;
   if(raw===""||raw===undefined){setStatus("Saisissez le résultat observé.");return}
   payload.value=Number(raw);
   payload.measurement_source=!manualEdited&&Number.isFinite(autoValue)&&payload.value===autoValue?
    "operator_confirmed_video_estimate":"operator_manual_observation";
   if(isBalance(t)){
    const reading=poseTracker?.getLatest();
    if(payload.measurement_source==="operator_confirmed_video_estimate"){
     payload.measurement_quality=Number.isInteger(reading?.balanceQuality)?reading.balanceQuality:0;
     payload.stop_reason=reading?.balanceReason||"operator_end";
    }
   }
   if(!Number.isFinite(payload.value)||payload.value<0||payload.value>(t.unit==="seconds"?t.duration:100)||
     (t.type==="count"&&!Number.isInteger(payload.value))){
    setStatus("La valeur saisie n’est pas valide.");return
   }
  }
 }
 if(event==="skip")payload.note=q("mocNote")?.value||"";
 if(event==="skip"&&!confirm("Marquer ce test comme non réalisé et continuer ?"))return;
 busy=true;
 host.querySelectorAll(".moc-button").forEach(b=>{if(b.id!=="mocReturn")b.disabled=true});
 try{
  const result=await api(payload);
  room=result.session;
  if(["start","restart"].includes(event)&&room?.progress?.step_status==="running"){
   // Keep a local start anchor so the first rendered frame is 00:30, not 00:29
   // due to round-trip latency. Subsequent displays remain monotonic.
   clockLocal={key:clockRunKey(room),startedAt:Date.now()};
  }
  latestSignature="";
  if(room.status==="completed"){
   panelMode="report";updatePanelTabs();renderReportSection();
  }else if(panelMode==="tests")renderStep();
  else if(panelMode==="questionnaire")renderQuestionnaireSection();
  else renderReportSection();
  if(event==="save"&&panelMode==="tests")setStatus("Résultat enregistré.");
 }catch(error){setStatus((error.message||"Impossible d’enregistrer")+" · Réessayez.");}
 finally{busy=false;host?.querySelectorAll(".moc-button").forEach(b=>b.disabled=false)}
}
async function refresh(force=false){
 if(!host?.isConnected||!api||polling)return;
 polling=true;
 try{
  const data=await api({action:"operator_list"});
  const matching=(data.sessions||[]).filter(x=>x.patient_id===patient?.id&&x.progress?.camera_owner==="operator"&&["active","completed"].includes(x.status))
   .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  const selected=matching[0]||null;
  if(!selected){
   room=null;renderWaiting("Crée une consultation sur l’ordinateur, puis active /camera/ sur l’iPhone : liaison automatique sans code.");
   return;
  }
  if(selected.status==="active"&&!TESTS.some(t=>t.id===selected.stage_code)){
   const initialized=await api({action:"operator_tests_init",session_id:selected.id});
   room=initialized.session;
  }else room=selected;
  if(!questionnaireDirty&&!questionnaireSaveInFlight){
   const stored=room.progress?.questionnaire;
   const serverTime=Date.parse(stored?.updated_at||"")||0;
   if(serverTime>=questionnairePersistedAt){
    questionnaireAnswers={...(stored?.answers||{})};
    questionnairePersistedAt=serverTime;
   }else if(questionnairePersistedAt){
    // A delayed polling response predating last successful save ACK is ignored.
    room.progress={...room.progress,questionnaire:{
     ...stored,answers:{...questionnaireAnswers},
     updated_at:new Date(questionnairePersistedAt).toISOString()
    }};
   }
  }
  updatePanelTabs();updateCameraLinkState();
  const signature=JSON.stringify([room.id,room.stage_code,room.step_index,room.status,room.progress?.step_status,room.progress?.safety_confirmed,room.progress?.test_started_at,room.progress?.results,
   room.progress?.questionnaire?.updated_at,room.progress?.questionnaire?.answers]);
  if(force||signature!==latestSignature){
   latestSignature=signature;
   if(panelMode==="tests")renderStep();
   else if(panelMode==="report")renderReportSection();
   // Do not tear down the questionnaire while typing answers.
  }
  if(openVideo&&room.status==="active"){
   await openVideo(room.id,"motionConsultCamera");
   const liveVideo=document.querySelector("#motionConsultCamera #mopvVideo");
   if(liveVideo?.srcObject&&!poseTracker?.isAttached()&&!poseTracker?.loading()&&Date.now()-poseRetryAt>12000){
    poseRetryAt=Date.now();
    await attachPoseVideo(liveVideo);
   }
  }
  if(room.status==="completed"&&openVideo){
   // Completed room no longer accepts video signaling; stop any existing camera.
   window.dispatchEvent(new Event("pulse:operator-signout"));
  }
 }catch(error){if(host?.isConnected&&q("mocTestBody"))setStatus(error.message||"Connexion temporairement indisponible.")}
 finally{polling=false}
}
export async function mountOperatorConsultation(config){
 disposeOperatorConsultation();
 host=config.root;api=config.api;openVideo=config.openVideo;patient=config.patient||null;
 if(!host)return;
 styles();makeShell();
 try{
  extras=await import("./motion-live-clinic-extras-v1.js?v=20261111-two-step-pdf-v2");
  updatePanelTabs();
 }catch(error){
  const note=q("mocVoiceState");
  if(note)note.textContent="Questionnaires et rapport temporairement indisponibles : "+(error.message||"chargement");
 }
 try{
  const {createClinicVoice}=await import("./motion-live-clinic-voice-v1.js?v=20261110-clinic-complete-v1");
  voice=createClinicVoice({
   onAction:handleVoiceAction,
   onStatus:(text,state)=>{
    const note=q("mocVoiceState");if(note)note.textContent=text;
    const button=q("mocVoice");
    if(button){
     button.textContent=["listening","connecting","reconnecting","paused"].includes(state)?"🎙 Couper la voix":"🎙 Activer la voix";
     button.setAttribute("aria-pressed",String(["listening","connecting","reconnecting","paused"].includes(state)));
    }
   }
  });
  if(!voice.supported&&q("mocVoice"))q("mocVoice").disabled=true;
 }catch(error){
  const note=q("mocVoiceState");if(note)note.textContent="Commandes vocales indisponibles : "+(error.message||"chargement");
 }
 fullscreenListener=()=>{const button=q("mocFullscreen");if(button)button.textContent=document.fullscreenElement?"↙ Quitter le plein écran":"⛶ Plein écran"};
 document.addEventListener("fullscreenchange",fullscreenListener);
 try{
  const {createRemoteMotionTracker}=await import("./motion-live-remote-pose-v1.js?v=20261110-video-measures-v1");
  poseTracker=createRemoteMotionTracker({
   onUpdate:updatePosePanel,
   onError:message=>{
    if(message)poseStatus=message;
    const node=q("mocPoseIndicator");
    if(node&&message)node.textContent="⚠ "+message;
   }
  });
  videoListener=e=>{
   if(e.detail?.sessionId===room?.id){
    videoLive=true;updateCameraLinkState();void attachPoseVideo(e.detail.video);
   }
  };
  stopVideoListener=e=>{
   if(e.detail?.sessionId===room?.id){
    videoLive=false;updateCameraLinkState();poseTracker?.detach();
    poseStatus="Caméra interrompue · reconnecte ton iPhone.";
    const indicator=q("mocPoseIndicator");
    if(indicator)indicator.textContent="○ Caméra déconnectée · mesures automatiques en pause.";
   }
  };
  window.addEventListener("pulse:remote-video-ready",videoListener);
  window.addEventListener("pulse:remote-video-stopped",stopVideoListener);
 }catch(error){
  poseStatus="Marqueurs indisponibles : "+(error.message||"chargement échoué");
 }
 if(!patient){renderWaiting("Sélectionne un dossier fictif pour cette consultation physique.");return}
 await refresh(true);
 poll=setInterval(()=>refresh(),2600);
}

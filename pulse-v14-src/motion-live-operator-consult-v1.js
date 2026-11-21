// KŌMØ Pulse — console de consultation Motion (opérateur, ordinateur du cabinet).
// Vidéo sur l'iPhone, valeurs validées par l'opérateur. Aucune interprétation clinique automatique.
import {PROTOCOL,STEPS,STATIONS,CAMERA_LABELS,INSTRUMENTED_STEPS,SKIP_REASONS,POSTURE_OPTIONS,fieldStep,deriveInstrumented,validateInstrumented,skippedText,optionLabel,plausibilityWarnings,toNewton,fromNewton,nextPendingStep} from './motion-protocol.mjs?v=20261121-forcedecks-v1';
import {buildTrajectory,trajectoryHeadline,frDate} from './motion-v2-trajectory.mjs?v=20261121-forcedecks-v1';
// Trajectoire J0 → S6 → S12 : consultations terminées du même patient dans le même centre.
let trajectoryState={key:'',data:null,loading:false};
const isRealDossier=()=>patient?.data_classification==='health_data';
// Tests dérivés du protocole standardisé (ordre, libellés, consignes, bornes) : aucune copie locale.
const TYPE_BY_KIND={fields:"fields",two_step:"manual_two_step",count:"count",balance:"balance",observation:undefined};
const TESTS=STEPS.map(s=>({id:s.id,title:s.title,duration:s.duration||0,unit:s.ui_unit||"",type:TYPE_BY_KIND[s.kind],
 setup:s.setup,instruction:s.instruction,script:s.script||"",label:s.label||s.title,device:s.device,trials:s.trials,
 block:s.block,vald:s.vald||null,walkway:!!s.walkway,dynamo:!!s.dynamo,pair:s.pair||null,
 ...(s.kind==="fields"?{fields:s.fields,choices:s.choices||[]}:{})}));
// Unité affichée par l'écran DynaMo (N ou kg) : mémorisée sur cet ordinateur, enregistrement toujours en N.
const DYNAMO_UNIT_KEY="komo_dynamo_unit";
let dynamoUnit=(()=>{try{return localStorage.getItem(DYNAMO_UNIT_KEY)==="kg"?"kg":"N"}catch{return "N"}})();
// Chronomètre de marche intégré (Départ / Arrivée) : remplit le passage 1 puis le passage 2.
let gaitChrono={startedAt:null,timer:null};
const isFields=t=>t?.type==="fields";
const HTML=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
let host=null,api=null,openVideo=null,patient=null,room=null,latestSignature="",poll=null,clock=null,busy=false,stoppedAt=null,polling=false;
let clockKey="",clockLocal=null;
let poseTracker=null,videoListener=null,stopVideoListener=null,fullscreenListener=null,autoValue=null,manualEdited=false,poseStatus="En attente du flux iPhone",poseRetryAt=0;
let extras=null,voice=null,panelMode="tests",questionnaireAnswers={},questionnaireIndex=0,preferredSessionId="";
let questionnaireDirty=false,questionnaireTimer=null,questionnaireSaveInFlight=null,questionnaireNavigating=false,questionnairePersistedAt=0;
let countdownPending=false,previousMilestone=null,clockCompletedNotified=false;
let videoFocus=false,videoLive=false;
const q=id=>host?.querySelector("#"+id);
const SHORT_TEST_NAMES=Object.fromEntries(STEPS.map(s=>[s.id,s.short]));
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
 const journey=q("mocJourneyCamera");
 if(journey)journey.dataset.state=live||room?.status==="completed"?"done":online?"current":"";
 const banner=q("mocCameraBanner");
 if(banner){
  banner.dataset.state=badge.dataset.state;
  banner.textContent=label+(room?.status==="completed"?" · Rapport disponible : télécharge le PDF et remets-le au patient. Tu peux fermer la caméra de l’iPhone.":
   live?" · Le suivi du mouvement fonctionne en arrière-plan.":
   online?" · Vérifie l'autorisation et garde l'écran de l'iPhone actif.":
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
 link.href="./motion-live-operator-consult-v1.css?v=20261121-forcedecks-v1";
 // Le design de l'espace praticien (pulse-workspace.css) reste la dernière couche.
 const workspace=document.querySelector("link[data-pulse-workspace]");
 if(workspace)document.head.insertBefore(link,workspace);else document.head.append(link);
}
function stopClock(){
 if(clock)clearInterval(clock);
 clock=null;stoppedAt=null;clockKey="";clockLocal=null;previousMilestone=null;clockCompletedNotified=false;
}
function clockRunKey(session){
 return session?.id+":"+session?.step_index+":"+(session?.progress?.test_started_at||"");
}
export function disposeOperatorConsultation(){
 stopGaitChrono();
 host?.closest(".app-shell")?.classList.remove("moc-video-xxl");
 videoFocus=false;videoLive=false;
 if(poll)clearInterval(poll);poll=null;stopClock();
 if(questionnaireTimer)clearTimeout(questionnaireTimer);questionnaireTimer=null;
 voice?.destroy();voice=null;countdownPending=false;
 extras=null;panelMode="tests";questionnaireAnswers={};questionnaireIndex=0;questionnaireDirty=false;questionnaireSaveInFlight=null;questionnaireNavigating=false;questionnairePersistedAt=0;preferredSessionId="";
 if(videoListener)window.removeEventListener("pulse:remote-video-ready",videoListener);
 if(stopVideoListener)window.removeEventListener("pulse:remote-video-stopped",stopVideoListener);
 if(fullscreenListener)document.removeEventListener("fullscreenchange",fullscreenListener);
 videoListener=null;stopVideoListener=null;fullscreenListener=null;
 poseTracker?.dispose();poseTracker=null;
 host=null;room=null;api=null;openVideo=null;patient=null;latestSignature="";autoValue=null;manualEdited=false;
}
// Étape en cours lue par son code (navigation libre), jamais par sa seule position.
function currentTest(){return TESTS.find(t=>t.id===room?.stage_code)||null}
const testIndex=t=>TESTS.indexOf(t);
const treatedCount=results=>TESTS.filter(t=>["done","skipped"].includes(results?.[t.id]?.status)).length;
const isBalance=t=>t?.type==="balance";
// Pragmatic video QA gate, not a medically validated accuracy threshold.
// Manual entries remain possible when a camera is absent or tracking is uncertain.
function videoQualityUsable(reading,test){
 if(!reading||reading.step!==test?.id||reading.frames<30||reading.quality<70)return false;
 if(test?.type==="balance")return reading.started&&reading.balanceQuality>=70&&
  !["camera_lost","ambiguous_contact"].includes(reading.balanceReason);
 return Number.isFinite(reading.measurement)&&reading.validFrames>=20;
}
const balanceReasonText=reason=>({
 foot_contact:"Le pied libre a été reposé. Mesure terminée.",
 limit:"30 secondes atteintes. Plafond de l’essai.",
 camera_lost:"Repères perdus. Vérifiez la durée avant validation.",
 ambiguous_contact:"Retour d’appui incertain. Vérifiez la mesure."
}[reason]||"Appui interrompu · vérifiez le résultat.");
function stageText(result){return result?.status==="done"?"✓":result?.status==="skipped"?"—":"·"}
// Rail du protocole : les 13 tests regroupés par station (A → E). Chaque test est cliquable :
// revenir corriger une valeur ou faire un test plus tôt. Bloqué pendant un chronomètre en cours.
function railMarkup(idx,results={},locked=false){
 let html="",block="";
 TESTS.forEach((t,i)=>{
  const b=t.block;
  if(b!==block){
   if(block)html+="</ol></div>";block=b;const st=STATIONS[b]||{};
   html+='<div class="moc-rail-block"><p class="moc-rail-title"><span>'+HTML(b)+'</span>'+HTML(st.label||"")+
    '<small>'+HTML(st.camera?CAMERA_LABELS[st.camera]:"Sans iPhone")+'</small></p><ol>';
  }
  const r=results[t.id];
  const state=i===idx?"current":r?.status==="skipped"?"skipped":r?.status==="done"?"done":"";
  const label='<b>'+(state==="done"?"✓":state==="skipped"?"–":String(i+1))+'</b><span>'+HTML(SHORT_TEST_NAMES[t.id]||t.title)+
   '<small>'+HTML(state==="skipped"?"Non réalisé":state==="done"?"Enregistré · corriger":t.trials||"")+'</small></span>';
  html+='<li class="moc-step '+state+'"'+(i===idx?' aria-current="step"':'')+'>'+
   (i===idx?'<span class="moc-step-inner" title="'+HTML(t.title)+'">'+label+'</span>':
    '<button type="button" class="moc-step-inner" data-goto="'+t.id+'"'+(locked?' disabled':'')+' title="'+
    HTML(locked?"Arrête d’abord le test en cours":state?"Revenir sur « "+t.title+" »":"Faire « "+t.title+" » maintenant")+'">'+label+'</button>')+'</li>';
 });
 return html+(block?"</ol></div>":"");
}
async function gotoStep(stepId){
 if(!room||busy||!stepId||stepId===room.stage_code)return;
 if(room.progress?.step_status==="running"&&currentTest()?.duration){setStatus("Arrête d’abord le test en cours.");return}
 busy=true;
 try{
  stopGaitChrono();
  const result=await api({action:"operator_test_goto",session_id:room.id,step_code:stepId});
  room=result.session;latestSignature="";
  if(room.status==="completed"){panelMode="report";updatePanelTabs();renderReportSection();return}
  if(panelMode!=="tests"){panelMode="tests";if(q("mocStepNav"))q("mocStepNav").hidden=false;}
  updatePanelTabs();renderStep();
  const t=currentTest();
  if(t&&room.progress?.results?.[t.id])setStatus("Valeur déjà enregistrée affichée : une nouvelle validation la remplace.");
 }catch(error){setStatus((error.message||"Impossible d’ouvrir ce test")+" · Réessaie.")}
 finally{busy=false}
}
function bindGaitChrono(){
 const go=q("mocGaitGo"),time=q("mocGaitTime"),hint=q("mocGaitHint");if(!go)return;
 const fmt=sec=>sec.toFixed(2).replace(".",",")+" s";
 const target=()=>["gait_4m_s_1","gait_4m_s_2"].map(k=>host.querySelector('[data-field="'+k+'"]')).find(el=>el&&el.value==="");
 const label=()=>{const next=target();go.textContent=gaitChrono.startedAt?"Arrivée":next?.dataset.field.endsWith("_2")?"Départ · passage 2":"Départ";};
 go.onclick=()=>{
  if(!gaitChrono.startedAt){
   if(!target()){hint.textContent="Les deux passages sont saisis. Efface un temps pour refaire ce passage.";return}
   gaitChrono.startedAt=performance.now();
   gaitChrono.timer=setInterval(()=>{if(time&&gaitChrono.startedAt)time.textContent=fmt((performance.now()-gaitChrono.startedAt)/1000)},50);
   go.dataset.running="true";hint.textContent="Appuie sur Arrivée quand le premier pied franchit la ligne des 4 m.";label();return;
  }
  const sec=Math.round((performance.now()-gaitChrono.startedAt)/10)/100;
  stopGaitChrono();go.dataset.running="false";
  if(time)time.textContent=fmt(sec);
  if(sec<1||sec>30){hint.textContent=(sec<1?"Moins d’une seconde":"Plus de 30 secondes")+" : temps non retenu. Recommence le passage ou saisis-le à la main.";label();return}
  const el=target();
  if(el){el.value=sec.toFixed(2);el.dispatchEvent(new Event("input",{bubbles:true}));}
  hint.textContent=target()?"Passage 1 noté. Ramène le patient au départ, puis Départ pour le passage 2.":"Deux passages notés. Vérifie les temps, puis valide.";
  label();
 };
 label();
}
function fieldErrorText(t,error){
 const key=String(error||"").replace(/^(missing|invalid|precision)_/,"");
 const f=(t.fields||[]).find(x=>x.key===key),c=(t.choices||[]).find(x=>x.key===key);
 const name=f?.label||c?.label||"une valeur";
 if(error.startsWith("missing_"))return "Il manque : "+name+".";
 if(error.startsWith("precision_"))return name+" : trop de décimales.";
 if(f)return name+" hors limites ("+f.min+" à "+f.max+" "+f.unit+(t.dynamo&&f.unit==="N"&&dynamoUnit==="kg"?", après conversion des kg":"")+").";
 return "Saisie incomplète ou hors limites.";
}
function stopGaitChrono(){
 if(gaitChrono.timer)clearInterval(gaitChrono.timer);
 gaitChrono={startedAt:null,timer:null};
}
// Bandeau de station : où se trouve le patient et où placer l'iPhone. Mis en avant au premier test de la station.
function stationMarkup(t){
 const st=STATIONS[t.block];if(!st)return "";
 const idx=testIndex(t),first=TESTS[idx-1]?.block!==t.block;
 return '<div class="moc-station" data-first="'+first+'" data-camera="'+(st.camera||"none")+'">'+
  '<div><small>Station '+HTML(t.block)+(first?' · nouvelle station':'')+'</small><strong>'+HTML(st.label)+'</strong>'+
  '<p><b>'+HTML(st.camera?CAMERA_LABELS[st.camera]:"iPhone non utilisé")+'</b> · '+HTML(st.place)+'</p></div>'+
  (st.camera?'<button type="button" class="moc-button secondary" id="mocStationFrame">'+(videoFocus?"Masquer le cadrage":"Vérifier le cadrage")+'</button>':'')+
 '</div>';
}
// Encadré « Dans l'app VALD » : test à lancer, réglages, valeurs à recopier (libellés VALD).
function valdMarkup(t){
 if(!t.vald)return "";
 return '<div class="moc-vald"><p><span class="moc-vald-title">Dans l’app '+HTML(t.vald.app)+'</span> <b>'+HTML(t.vald.test)+'</b>'+
  (t.vald.settings?' · '+HTML(t.vald.settings):'')+'</p>'+(t.vald.tip?'<p class="moc-vald-tip">'+HTML(t.vald.tip)+'</p>':'')+'</div>';
}
// Consignes repliables : si le praticien les replie, elles restent repliées aux tests suivants.
const INSTRUCTIONS_KEY="komo_consult_instructions";
const instructionsOpen=()=>{try{return localStorage.getItem(INSTRUCTIONS_KEY)!=="closed"}catch{return true}};
// Couloir de marche : 2 m d'élan · 4 m chronométrés · 2 m pour ralentir, et chronomètre intégré.
function walkwayMarkup(){
 return '<div class="moc-walkway" aria-hidden="true"><span>2 m d’élan</span><b>4 m chronométrés</b><span>2 m pour ralentir</span></div>'+
  '<div class="moc-gait-chrono"><button type="button" id="mocGaitGo" class="moc-button primary">Départ</button>'+
  '<strong id="mocGaitTime" aria-live="off">0,00 s</strong>'+
  '<p id="mocGaitHint">Appuie sur Départ quand le premier pied franchit la ligne des 0 m (barre d’espace possible).</p></div>';
}
function dynamoUnitMarkup(){
 return '<div class="moc-unit-switch" role="group" aria-label="Unité affichée par DynaMo"><span>Écran DynaMo en</span>'+
  ['N','kg'].map(u=>'<button type="button" data-unit="'+u+'" aria-pressed="'+(dynamoUnit===u)+'">'+u+'</button>').join("")+'</div>';
}
function fieldUnit(t,f){return t.dynamo&&f.unit==="N"?dynamoUnit:f.unit}
// Valeurs saisies, converties dans les unités du protocole (DynaMo kg → N).
function readFields(t){
 const raw={};
 host.querySelectorAll("[data-field]").forEach(el=>{
  if(el.value==="")return;
  const f=(t.fields||[]).find(x=>x.key===el.dataset.field);let v=Number(el.value);
  if(f&&t.dynamo&&f.unit==="N")v=toNewton(v,dynamoUnit);
  raw[el.dataset.field]=v;
 });
 return raw;
}
function makeShell(){
 host.innerHTML='<section class="moc-shell">'+
 '<header class="moc-head"><div class="moc-identity"><h2 id="mocPatientCode">Consultation Motion</h2>'+
 '<p id="mocPatientLine"></p></div>'+
 // Parcours de la consultation : 1 Patient · 2 iPhone · 3 Tests · 4 Questionnaire · 5 Rapport.
 '<nav class="moc-mode-tabs moc-journey" aria-label="Étapes de la consultation">'+
 '<span class="moc-journey-step" data-state="done"><b>1</b><span>Patient</span></span>'+
 '<span class="moc-journey-step" id="mocJourneyCamera" data-state=""><b>2</b><span>iPhone</span></span>'+
 '<button type="button" id="mocTabTests" class="moc-mode-tab" aria-selected="true"><b>3</b><span>Tests</span><small id="mocTabTestsCount"></small></button>'+
 '<button type="button" id="mocTabQuestionnaire" class="moc-mode-tab"><b>4</b><span>Questionnaire</span><small id="mocTabQuestionnaireCount"></small></button>'+
 '<button type="button" id="mocTabReport" class="moc-mode-tab"><b>5</b><span>Rapport</span></button></nav>'+
 '<div class="moc-head-actions"><button type="button" class="moc-back" id="mocVoice" aria-pressed="false">Voix</button><button type="button" class="moc-back" id="mocVideoFocus" aria-pressed="false" title="Afficher la caméra pour régler le cadrage">Voir la caméra</button><button type="button" class="moc-back" id="mocFullscreen" title="Plein écran">Plein écran</button><button type="button" class="moc-back" id="mocReturn" title="Revenir à la page Consultation">Quitter</button></div></header>'+
 '<div class="moc-statusbar">'+
 '<p class="moc-camera-banner" id="mocCameraBanner" role="status" aria-live="polite" data-state="offline">○ iPhone non connecté · Active la caméra du cabinet.</p>'+
 '<p class="moc-save-indicator" id="mocIntakeSaveStatus" role="status" aria-live="polite">Questionnaire · en attente de réponses</p>'+
 '<p class="moc-voice-state" id="mocVoiceState" role="status">Voix désactivée · Active-la pour dire « C’est parti », « Stop » ou « Suivant ». Aucun audio n’est enregistré par Pulse.</p>'+
 '</div>'+
 '<div class="moc-grid"><section class="moc-tests">'+
 '<div class="moc-overview"><span id="mocProgressText">Chargement…</span><div class="moc-progress"><i id="mocProgressFill"></i></div></div>'+
 '<div class="moc-step-nav" id="mocStepNav" aria-label="Progression des étapes Motion"></div>'+
 '<div id="mocTestBody"><p>Recherche de la consultation…</p></div>'+
 '</section><aside class="moc-camera-column"><div class="moc-camera-heading"><strong>iPhone · caméra du cabinet</strong><span id="mocCameraState" class="moc-camera-state" data-state="offline" role="status">○ iPhone non connecté</span></div>'+
 '<div id="mocPassportAside" class="moc-passport-aside" hidden></div>'+
 '<div id="motionConsultCamera" class="moc-camera-host"></div>'+
 '<div class="moc-pose-indicator" id="mocPoseIndicator" role="status">◌ Chargement des marqueurs…</div><div class="moc-camera-foot">Ton iPhone fournit uniquement la vidéo · 33 points analysés ici · Contrôle des tests et des mesures sur cet ordinateur.</div>'+
 '</aside></div><p class="moc-bottom-note">'+(isRealDossier()?'Consultation réelle · dossier pseudonymisé':'Démonstration avec dossier fictif')+' · Résultats validés par l’opérateur · Aucune interprétation clinique automatique</p></section>';
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
  q("mocVoice").textContent=active?"Couper la voix":"Voix";
  q("mocVoice").setAttribute("aria-pressed",String(active));
 };
 q("mocFullscreen").onclick=async()=>{
  try{
   if(document.fullscreenElement)await document.exitFullscreen();
   else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
   else{q("mocFullscreen").textContent="Installer la webapp pour le plein écran";return}
   if(q("mocFullscreen"))q("mocFullscreen").textContent=document.fullscreenElement?"Réduire":"Plein écran";
  }catch(error){if(q("mocFullscreen"))q("mocFullscreen").textContent="Plein écran indisponible"}
 };
 const pseudo=patient?.first_name==="Client"&&/^[A-Z]{2,6}-\d{6}-\d{2}$/.test(String(patient?.last_name||""));
 const code=patient?(pseudo?String(patient.last_name):[patient.first_name,patient.last_name].filter(Boolean).join(" ")):"";
 q("mocPatientCode").textContent=code||"Consultation Motion";
 q("mocPatientLine").textContent=patient?(isRealDossier()?"Consultation réelle":"Démonstration")+" · protocole "+PROTOCOL.code+" "+PROTOCOL.version:"Sélectionnez un patient";
 // Entrée = « Valider et passer au suivant » quand la saisie est complète (hors zone de notes).
 host.addEventListener("keydown",event=>{
  // Barre d'espace = Départ / Arrivée du chronomètre de marche (hors champ de saisie).
  if(event.key===" "&&panelMode==="tests"&&q("mocGaitGo")&&!event.target?.matches?.("input,textarea,select,button,summary")){
   event.preventDefault();q("mocGaitGo").click();return;
  }
  if(event.key!=="Enter"||event.isComposing||event.shiftKey||event.altKey||event.metaKey||event.ctrlKey)return;
  const target=event.target;
  if(!target?.matches?.("#mocTestBody input")||panelMode!=="tests")return;
  const save=q("mocSave");if(!save||save.disabled)return;
  event.preventDefault();save.click();
 });
 updatePanelTabs();
}
function renderWaiting(message){
 if(!host)return;
 q("mocStepNav").innerHTML="";
 q("mocTestBody").innerHTML='<section class="moc-empty"><h3>Préparer la consultation</h3><p>'+HTML(message)+'</p><button type="button" id="mocGoLive" class="moc-button primary">Retour à Consultation</button></section>';
 q("mocGoLive").onclick=()=>{location.hash="live"};
 q("mocProgressText").textContent="En attente d’un téléphone associé";
 q("mocProgressFill").style.width="0%";
}
function formatResult(result,task){
 if(!result)return "Non effectué";
 if(result.status==="skipped")return skippedText(result.reason);
 if(task.type==="fields"&&result.fields){
  const parts=(task.fields||[]).filter(f=>Number.isFinite(result.fields[f.key]))
   .map(f=>f.label.replace(" · meilleur essai","")+" "+String(result.fields[f.key]).replace(".",",")+" "+f.unit);
  return parts.join(" · ")||"Résultat enregistré";
 }
 if(task.id==="two_step"&&Number.isFinite(result.value))return String(result.value).replace(".",",")+" cm (meilleur essai)";
 if(task.id==="posture")return optionLabel(POSTURE_OPTIONS,result.observation)||"Observation enregistrée";
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
 if(q("mocTabQuestionnaireCount")&&summary){
  q("mocTabQuestionnaireCount").textContent=summary.progress.completed+"/"+summary.progress.total;
  q("mocTabQuestionnaire").dataset.state=summary.progress.completed>=summary.progress.total?"done":"";
 }
 const results=room?.progress?.results||{};
 const treated=TESTS.filter(t=>["done","skipped"].includes(results[t.id]?.status)).length;
 if(q("mocTabTestsCount"))q("mocTabTestsCount").textContent=treated+"/"+TESTS.length;
 if(q("mocTabTests"))q("mocTabTests").dataset.state=treated>=TESTS.length?"done":"";
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
function trajectoryKey(){return patient&&room?patient.id+':'+room.id+':'+room.status:'';}
async function loadTrajectory(force){
 const key=trajectoryKey();if(!key||!api)return null;
 if(!force&&(trajectoryState.loading||trajectoryState.key===key))return trajectoryState.data;
 trajectoryState={key:trajectoryState.key,data:trajectoryState.data,loading:true};
 try{
  const data=await api({action:"operator_patient_history",patient_id:patient.id});
  const built=buildTrajectory(data.sessions||[]);
  trajectoryState={key,data:built,loading:false};
  const node=q("mocTrajectory");if(node)node.innerHTML=trajectoryMarkup(built);
  return built;
 }catch(error){
  trajectoryState={key,data:null,loading:false};
  const node=q("mocTrajectory");if(node)node.innerHTML='<p class="moc-help">Trajectoire indisponible : '+HTML(error.message||'erreur réseau')+'</p>';
  return null;
 }
}
function instrumentedMarkup(rows=[]){
 const done=rows.filter(r=>r.status!=='missing');
 if(!done.length)return '';
 return '<h4>Mesures instrumentées</h4><div class="moc-instrumented-list">'+done.map(r=>
  '<div class="moc-instrumented-row"><div><strong>'+HTML(r.name)+'</strong><small>'+HTML(r.device||'')+'</small></div>'+
  '<span>'+(r.lines||[]).map(HTML).join('<br>')+'</span></div>').join('')+'</div>';
}
function trajectoryMarkup(t){
 if(!t)return '<h4>Trajectoire</h4><p class="moc-help">Chargement de l’historique du patient…</p>';
 if(!t.points.length)return '<h4>Trajectoire</h4><p class="moc-help">Première consultation : elle deviendra le point de départ (J0) dès qu’elle sera terminée.</p>';
 const head='<h4>Trajectoire '+t.points.map(p=>HTML(p.label)).join(' → ')+'</h4><p class="moc-trajectory-headline">'+HTML(trajectoryHeadline(t))+'</p>';
 if(t.points.length<2)return head;
 const pts=t.points.slice(-4);
 const rows=t.rows.map(r=>'<tr><th scope="row">'+HTML(r.label)+(r.unit?' <small>'+HTML(r.unit)+'</small>':'')+'</th>'+
  r.display.slice(-pts.length).map((v,i,a)=>'<td'+(i===a.length-1?' class="is-last"':'')+'>'+HTML(v)+'</td>').join('')+
  '<td class="moc-delta is-'+HTML(r.verdict||'none')+'">'+HTML(r.deltaDisplay)+(r.notable?' ●':'')+'</td></tr>').join('');
 return head+'<div class="moc-trajectory-table-wrap"><table class="moc-trajectory-table"><thead><tr><th>Mesure</th>'+
  pts.map(p=>'<th>'+HTML(p.label)+'<small>'+HTML(frDate(p.date))+'</small></th>').join('')+'<th>Écart</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
  '<p class="moc-help">● changement supérieur au repère publié (marche 0,1 m/s · chaise 2 levers · préhension 50 N). Autres écarts : descriptifs.</p>'+
  (t.warnings||[]).map(w=>'<p class="moc-trajectory-warning">⚠ '+HTML(w)+'</p>').join('');
}
// Âge (année de naissance) et sexe de référence : situent chaque capacité par rapport à son repère publié.
function patientProfile(){return patient?{birth_date:patient.birth_date||null,sex_at_birth:patient.sex_at_birth||null}:null}
const ZONE_TEXT={priority:"Priorité",consolidate:"À consolider",solid:"Solide",follow:"Suivi",missing:"Non mesuré"};
function capacityMarkup(c){
 const shown=c.measures.filter(m=>m.value!==null&&m.value!==undefined).slice(0,2);
 return '<div class="moc-capacity is-'+HTML(c.zone)+'"><div class="moc-capacity-head"><strong>'+HTML(c.name)+'</strong>'+
  '<span class="moc-zone is-'+HTML(c.zone)+'">'+HTML(ZONE_TEXT[c.zone]||"")+'</span></div>'+
  (shown.length?shown.map(m=>'<p class="moc-capacity-value"><b>'+HTML(m.label)+' : '+HTML(m.value)+(m.unit?' '+HTML(m.unit):'')+'</b> <small>'+HTML(m.reference)+'</small></p>').join(""):
   '<p class="moc-capacity-value"><small>Non mesuré lors de ce bilan</small></p>')+
  '<p class="moc-capacity-why">'+HTML(c.why)+'</p></div>';
}
function priorityMarkup(p,i){
 return '<li class="moc-priority"><span class="moc-priority-rank">'+(i+1)+'</span><div><strong>'+HTML(p.name)+'</strong>'+
  '<p>'+HTML(p.why)+'</p><p class="moc-priority-goal">Objectif à 6 semaines : <b>'+HTML(p.objective)+'</b></p></div></li>';
}
function renderReportSection(){
 if(!host||!extras||!room)return;
 const results=room.progress?.results||{};
 const summary=extras.clinicReportSummary(questionnaireAnswers,results);
 const label=patient?[patient.first_name,patient.last_name].filter(Boolean).join(" "):"Dossier fictif";
 const simulated=room.progress?.questionnaire?.simulated===true;
 const trajectory=trajectoryState.key===trajectoryKey()?trajectoryState.data:null;
 const passport=extras.clinicPassport(questionnaireAnswers,results,new Date(),{subject:label,trajectory,simulated,real:isRealDossier(),patient:patientProfile()});
 const plan=passport.actionPlan;
 const lp=passport.longevity;
 const doneAll=TESTS.filter(t=>results[t.id]?.status==="done").length;
 const skippedAll=TESTS.filter(t=>results[t.id]?.status==="skipped").length;
 q("mocProgressText").textContent="Passeport · "+doneAll+"/"+TESTS.length+" étapes · "+summary.answered+"/22 réponses";
 q("mocProgressFill").style.width=(Math.min(TESTS.length,doneAll+skippedAll)/TESTS.length*100)+"%";
 q("mocStepNav").hidden=true;
 const finished=room.status==="completed";
 const resultCard=t=>'<div class="moc-passport-result"><span>'+HTML(t.short)+'</span><strong>'+HTML(t.display)+'</strong></div>';
 const exerciseCard=e=>'<div class="moc-exercise-card"><div><strong>'+HTML(e.title)+'</strong><small>'+HTML(e.relevance||e.purpose)+'</small></div>'+
  '<b>'+HTML(e.dose)+'</b><span>'+HTML(e.frequency)+'</span><p>'+HTML(e.instructions)+'</p></div>';
 const nutritionCard=item=>'<div class="moc-nutrition-card"><div><strong>'+HTML(item.name)+'</strong><em>'+HTML(item.status)+'</em></div>'+
  '<p>'+HTML(item.benefit)+'</p><small>'+HTML(item.guard)+'</small></div>';
 const essentials=plan.supplements.filter(s=>['protein','creatine','vitd'].includes(s.id));
 const more=plan.supplements.filter(s=>!['protein','creatine','vitd'].includes(s.id));
 const reasons=plan.highlights.map((x,i)=>'<div class="moc-passport-highlight"><small>'+HTML(x.label)+'</small><strong>'+HTML(x.value)+'</strong></div>').join('');
 const pointGroups=passport.questionnaire.groups.filter(g=>g.maxPoints!==null).map(g=>
  '<div class="moc-domain-point"><span>'+HTML(g.label)+'</span><strong>'+
  (g.points===null?'À compléter':g.points+'/'+g.maxPoints+' points')+'</strong>'+
  '<small>'+(g.score===null?'Score indisponible':g.score+'/100 · indice déclaré')+'</small></div>').join('');
 q("mocTestBody").innerHTML='<section class="moc-test moc-report-section moc-passport-section moc-action-report">'+
  '<span class="moc-kicker">KŌMØ MOTION · PASSEPORT ET PROGRAMME 6 SEMAINES</span>'+
  '<h3>Votre feuille de route</h3>'+
  '<p class="moc-capacity-headline">'+HTML(lp.headline)+'</p>'+
  (simulated?'<p class="moc-demo-warning">SCÉNARIO FICTIF · Réponses simulées, aucun avis médical individualisé.</p>':'')+
  '<div class="moc-action-metrics"><div><strong>'+doneAll+'/'+TESTS.length+'</strong><span>étapes réalisées</span></div>'+
   '<div><strong>'+passport.questionnaire.answered+'/22</strong><span>réponses enregistrées</span></div>'+
   '<div><strong>'+(passport.questionnaire.complete?passport.questionnaire.index+'/100':'—')+
   '</strong><span>indice fonctionnel déclaré</span></div></div>'+
  '<h4>Vos capacités</h4>'+
  (patient&&(!patient.sex_at_birth||patient.sex_at_birth==='not_stated')?'<p class="moc-help">Sexe non précisé dans le dossier : les repères les plus prudents sont appliqués.</p>':'')+
  '<div class="moc-capacity-list">'+lp.capacities.map(capacityMarkup).join("")+'</div>'+
  (lp.priorities.length?'<h4>Vos '+lp.priorities.length+' priorités</h4><ol class="moc-priority-list">'+lp.priorities.map(priorityMarkup).join("")+'</ol>':
   '<p class="moc-help">Aucune priorité : capacités mesurées solides, programme d’entretien.</p>')+
  '<details class="moc-report-details"><summary>Questionnaire : profil déclaré</summary>'+
  '<h4>Votre profil en bref</h4>'+
  '<p class="moc-report-answers-state">'+(passport.questionnaire.answered===22?
   '✓ Questionnaire complet : 22 réponses prises en compte.':
   '⚠ '+passport.questionnaire.answered+'/22 réponses · complétez le questionnaire pour un rapport intégral.')+'</p>'+
  '<div class="moc-scoring-result"><strong>'+(passport.questionnaire.complete?
   passport.questionnaire.rawPoints+'/'+passport.questionnaire.maxPoints+
   ' points de difficulté · indice '+passport.questionnaire.index+'/100':
   'Score global indisponible tant que les 22 réponses ne sont pas enregistrées')+
   '</strong><p>20 réponses notées de 0 à 4 ; âge et objectif descriptifs. Plus les points de difficulté sont élevés, plus le profil déclaré est limité. L’indice pondéré sur 100 suit la direction inverse. Barème KŌMØ non validé ; distinct du Motion Score.</p></div>'+
  '<div class="moc-domain-points">'+pointGroups+'</div>'+
  '</details>'+
  '<div class="moc-passport-highlights">'+reasons+'</div>'+
  '<h4>Tests réalisés</h4><div class="moc-results-compact">'+passport.measures.map(resultCard).join('')+'</div>'+
  instrumentedMarkup(passport.instrumented)+
  '<div class="moc-correct-report"><label class="moc-field">Corriger un test<select id="mocCorrectStep">'+
   TESTS.map(t=>'<option value="'+t.id+'">'+HTML(t.title)+'</option>').join("")+'</select></label>'+
   '<button type="button" class="moc-button secondary" id="mocCorrectGo">Rouvrir ce test</button></div>'+
  '<div id="mocTrajectory" class="moc-trajectory">'+trajectoryMarkup(trajectory)+'</div>'+
  '<div class="moc-action-section-title"><h4>Programme maison</h4><small>'+HTML(plan.schedule||"Progression à adapter et valider")+'</small></div>'+
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
    '<option value="synthese">1 · Vos capacités</option>'+
    '<option value="exercices">2 · Priorités et programme maison</option>'+
    '<option value="tests">3 · Résultats détaillés</option>'+
    '<option value="suivi">4 · Suivi à 6 semaines</option>'+
    '<option value="nutrition">5 · Nutrition et compléments</option>'+
    '<option value="questionnaire">6 · Questionnaire détaillé (22 réponses)</option></select>'+
   '<button class="moc-button secondary" id="mocDownloadChapter"'+(!finished?' disabled':'')+'>↓ Exporter cette catégorie</button></div>'+
  '<button type="button" class="moc-button secondary" id="mocReportQuestionnaire">Questionnaires</button></div>'+
  (!finished?'<p class="moc-status">Terminez les '+TESTS.length+' étapes (réalisées ou passées) pour exporter le document.</p>':'')+
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
 if(trajectoryState.key!==trajectoryKey())void loadTrajectory(false);
 q("mocReportQuestionnaire").onclick=()=>switchPanel("questionnaire");
 if(q("mocCorrectGo"))q("mocCorrectGo").onclick=()=>gotoStep(q("mocCorrectStep")?.value);
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
   const history=await loadTrajectory(true);
   const filename=await extras.downloadClinicReport(confirmed,persisted.progress?.results||{},new Date(),
    {subject:label,simulated:persisted.progress?.questionnaire?.simulated===true,real:isRealDossier(),category:type,trajectory:history,patient:patientProfile()});
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
 '<p class="moc-help">Les '+TESTS.length+' tests sont traités. Tu peux maintenant compléter le questionnaire et télécharger le rapport descriptif PDF.</p>'+
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
 if(!t){renderWaiting("La consultation doit d’abord être démarrée depuis la page Consultation.");return}
 const results=room.progress?.results||{};
 const idx=testIndex(t),treated=treatedCount(results);
 const running=room.progress?.step_status==="running";
 const existing=results[t.id]||null;
 const later=nextPendingStep(results,t.id);
 const laterTest=TESTS.find(x=>x.id===later)||null;
 q("mocProgressText").textContent=treated+" test"+(treated>1?"s":"")+" sur "+TESTS.length+" enregistré"+(treated>1?"s":"")+" · "+(STATIONS[t.block]?.label||"");
 q("mocProgressFill").style.width=(treated/TESTS.length*100)+"%";
 q("mocStepNav").innerHTML=railMarkup(idx,results,running&&!!t.duration);
 q("mocStepNav").querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>gotoStep(b.dataset.goto));
 if(q("mocTabTestsCount"))q("mocTabTestsCount").textContent=treated+"/"+TESTS.length;
 if(t.id!=="gait_4m")stopGaitChrono();
 const safety=!room.progress?.safety_confirmed;
 autoValue=null;manualEdited=false;
 if(t.id==="two_step"||isFields(t))poseTracker?.stopMeasurement();
 else poseTracker?.setTest(t.id,room.progress?.test_started_at,running,
  Number(room.progress?.test_duration_seconds)||t.duration);
 const input=isFields(t)?
  '<div class="moc-two-step-fields">'+(t.walkway?walkwayMarkup():'')+(t.dynamo?dynamoUnitMarkup():'')+
  '<p class="moc-help">'+(t.walkway?'Le chronomètre remplit les deux passages ; tu peux aussi saisir les temps à la main.':'Valeurs recopiées telles qu’affichées ; laisser vide plutôt que deviner.')+'</p>'+
  t.fields.map(f=>{const u=fieldUnit(t,f);return '<label class="moc-field">'+HTML(f.label)+(f.optional?" · facultatif":"")+
   (f.vald?'<small class="moc-field-vald">'+HTML(t.vald?.app||"VALD")+' affiche : <b>'+HTML(f.vald)+'</b></small>':'')+
   '<div class="moc-input-unit"><input data-field="'+f.key+'" type="number" min="'+f.min+'" step="'+(u==="kg"?"0.01":fieldStep(f))+'" inputmode="decimal" placeholder="—"><span data-unit-label="'+f.key+'">'+HTML(u)+'</span></div></label>'}).join("")+
  (t.choices||[]).map(c=>'<fieldset class="moc-choice" data-choice="'+c.key+'"><legend>'+HTML(c.label)+'</legend>'+
   c.options.map(([k,l])=>'<label><input type="radio" name="choice-'+c.key+'" value="'+k+'"'+(c.default===k?' checked':'')+'><span>'+HTML(l)+'</span></label>').join("")+'</fieldset>').join("")+
  '<p id="mocFieldsComputed" class="moc-status"></p><ul id="mocWarnings" class="moc-warnings" hidden></ul></div>'
  :t.id==="two_step"?
  '<div class="moc-two-step-fields"><p class="moc-help">Saisie opérateur · deux essais, meilleure distance retenue. Indice = distance / taille.</p>'+
  '<label class="moc-field">Essai 1 · distance (cm)<input id="mocTwoStep1" type="number" min="1" max="650" step="0.1" inputmode="decimal" placeholder="ex. 240"></label>'+
  '<label class="moc-field">Essai 2 · distance (cm)<input id="mocTwoStep2" type="number" min="1" max="650" step="0.1" inputmode="decimal" placeholder="ex. 252"></label>'+
  '<label class="moc-field">Taille (cm) · facultative<input id="mocTwoStepHeight" type="number" min="100" max="230" step="0.1" inputmode="decimal" placeholder="ex. 175"></label>'+
  '<p id="mocTwoStepComputed" class="moc-status">Renseignez les deux distances ; la meilleure sera retenue.</p></div>'
  :t.id==="posture"?
  '<label class="moc-field">Observation (sans mesure radiographique)<select id="mocObservation">'+
  '<option value="">Choisir une observation</option>'+POSTURE_OPTIONS.map(([k,l])=>'<option value="'+k+'">'+HTML(l)+'</option>').join("")+'</select></label>'
  :'<label class="moc-field">'+HTML(t.label)+'<div class="moc-input-unit"><input id="mocValue" type="number" inputmode="decimal" min="0" max="'+(t.unit==="seconds"?String(t.duration):"100")+'" step="'+(t.unit==="seconds"?"0.1":"1")+'" placeholder="Saisir une valeur"><span>'+HTML(t.unit)+'</span></div></label>';
 // Saisies manuelles (VALD, mètre, chrono, Two-Step) : champs visibles d'emblée, un seul clic « Valider ».
 const manual=isFields(t)||t.id==="two_step";
 const allTreated=treated>=TESTS.length;
 const saveLabel=existing?(laterTest?"Enregistrer la correction":"Enregistrer et revenir au rapport"):"Valider et passer au suivant";
 const laterButton=laterTest?'<button type="button" id="mocLater" class="moc-button secondary" title="Faire « '+HTML(laterTest.title)+' » maintenant et revenir ensuite">'+
   (existing?'Revenir à « '+HTML(SHORT_TEST_NAMES[laterTest.id]||laterTest.title)+' »':'Plus tard')+'</button>':
  existing&&allTreated?'<button type="button" id="mocResume" class="moc-button secondary">Annuler la correction</button>':'';
 const correction=existing?.status==="done"&&!manual&&!running?
  '<details class="moc-correct"><summary>Corriger la valeur sans refaire le test</summary>'+
  (t.id==="posture"?'<label class="moc-field">Observation<select id="mocObservation"><option value="">Choisir une observation</option>'+
    POSTURE_OPTIONS.map(([k,l])=>'<option value="'+k+'">'+HTML(l)+'</option>').join("")+'</select></label>':
   '<label class="moc-field">'+HTML(t.label)+'<div class="moc-input-unit"><input id="mocValue" type="number" inputmode="decimal" min="0" step="'+(t.unit==="seconds"?"0.1":"1")+'"><span>'+HTML(t.unit)+'</span></div></label>')+
  '<button type="button" id="mocSave" class="moc-button primary">'+saveLabel+'</button></details>':'';
 const manualTail='<div class="moc-auto-feedback" id="mocAutoFeedback">'+(isFields(t)?"Valeurs recopiées depuis l’appareil ; la caméra ne détermine pas ces mesures.":"Deux distances mesurées au ruban ; la caméra ne détermine pas cette valeur.")+'</div>'+
  '<label class="moc-field">Notes (facultatif)<textarea id="mocNote" rows="2" maxlength="300" placeholder="Douleur, aide utilisée, essai invalide…"></textarea></label>'+
  '<div class="moc-buttons moc-actionbar"><button type="button" id="mocSkip" class="moc-button secondary">Test non réalisé</button>'+laterButton+
  '<button type="button" id="mocSave" class="moc-button primary" aria-keyshortcuts="Enter">'+saveLabel+'<kbd aria-hidden="true">Entrée</kbd></button></div>';
 q("mocTestBody").innerHTML='<section class="moc-test">'+stationMarkup(t)+'<span class="moc-kicker">Test '+(idx+1)+' sur '+TESTS.length+(t.device?' · '+HTML(t.device):'')+(t.trials?' · '+HTML(t.trials):'')+'</span><h3>'+HTML(t.title)+'</h3>'+
 (existing?'<p class="moc-existing" data-status="'+HTML(existing.status)+'">'+(existing.status==="skipped"?"Marqué non réalisé":"Déjà enregistré")+' : <b>'+HTML(formatResult(existing,t))+'</b>. Une nouvelle validation remplace ce résultat.</p>':'')+
 '<details class="moc-instructions" '+((!running||manual)&&instructionsOpen()?'open':'')+'><summary>Installation et consignes de sécurité</summary><div class="moc-guide"><div><strong>Installation</strong><p>'+HTML(t.setup)+'</p></div>'+
 (t.script?'<div><strong>À dire au patient</strong><p>'+HTML(t.script)+'</p></div>':'')+
 '<div><strong>Consigne</strong><p>'+HTML(t.instruction)+'</p></div></div></details>'+
 (safety?'<label class="moc-safety"><input type="checkbox" id="mocSafety"> Conditions de sécurité vérifiées : espace dégagé, appui accessible, absence de contre-indication évidente au test.</label>':'')+
 (manual?valdMarkup(t)+input+manualTail:running?'<div class="moc-live-hud"><div class="moc-timer"><div class="moc-clock-figure"><span>'+(t.id==="two_step"||isFields(t)?"MESURE MANUELLE":"CHRONOMÈTRE")+'</span><strong id="mocClock" aria-live="off">'+(t.id==="two_step"?"2 essais":isFields(t)?"Saisie":t.duration?"00:"+String(t.duration).padStart(2,"0"):"Observation")+'</strong></div>'+
 (t.type==="balance"?'<div class="moc-rep-figure moc-balance-figure"><span>TEMPS MAINTENU</span><strong id="mocLiveBalance" aria-live="off">—</strong><small id="mocBalanceState">EN ATTENTE DU PIED LEVÉ</small></div>':'')+
 (t.type==="count"?'<div class="moc-rep-figure"><span>'+ (t.id==="sts"?"LEVERS EN DIRECT":"RÉPÉTITIONS EN DIRECT")+'</span><strong id="mocLiveCount" role="status" aria-live="polite" aria-atomic="true">0</strong><small>Estimation vidéo · à confirmer</small></div>':'')+
 (t.duration?'<div class="moc-clock-actions"><button type="button" class="moc-button secondary" id="mocStopClock">'+(isBalance(t)?"Arrêter l’essai":"Arrêter")+'</button><button type="button" class="moc-button secondary" id="mocRestartClock">'+(isBalance(t)?"↻ Refaire l’essai":"↻ Repartir de "+t.duration+" s")+'</button></div>':'')+'</div></div>'+input+
 (isBalance(t)?'<p class="moc-balance-reference">Yeux ouverts · 30 s maximum · durée réelle depuis le pied levé · 10 s = repère descriptif, non diagnostique. Arrêter en cas de perte d’équilibre ou de recours à un appui.</p>':'')+
 '<div class="moc-auto-feedback" id="mocAutoFeedback">'+(isFields(t)?"Valeurs saisies par l’opérateur ; la caméra ne détermine pas ces mesures.":t.id==="two_step"?"Deux distances mesurées manuellement ; la caméra ne détermine pas cette valeur.":"◌ Marqueurs en cours de chargement. En attendant, saisie manuelle possible.")+'</div>'+
 '<label class="moc-field">Notes (facultatif)<textarea id="mocNote" rows="2" maxlength="300" placeholder="Qualité de l’observation, aide utilisée, remarque…"></textarea></label>'+
 '<div class="moc-buttons moc-actionbar"><button type="button" id="mocSkip" class="moc-button secondary">Test non réalisé</button>'+laterButton+
 '<button type="button" id="mocSave" class="moc-button primary" aria-keyshortcuts="Enter">'+saveLabel+'<kbd aria-hidden="true">Entrée</kbd></button></div>'
 :correction+'<div class="moc-buttons moc-actionbar"><button type="button" id="mocSkip" class="moc-button secondary">Test non réalisé</button>'+laterButton+'<button type="button" id="mocStart" class="moc-button primary">'+(isBalance(t)?"Armer le suivi · départ automatique":t.id==="two_step"?"Commencer la saisie des deux essais":isFields(t)?"Commencer la saisie":t.duration?(existing?"Refaire le test · chronomètre":"Démarrer le chronomètre"):(existing?"Refaire l’observation":"Commencer l’observation"))+'</button></div>')+
 '<div id="mocSkipPanel" class="moc-skip-panel" hidden><label class="moc-field">Motif du test non réalisé<select id="mocSkipReason"><option value="">Choisir un motif</option>'+
  SKIP_REASONS.map(([k,l])=>'<option value="'+k+'">'+HTML(l)+'</option>').join("")+'</select></label>'+
  '<div class="moc-buttons"><button type="button" id="mocSkipConfirm" class="moc-button primary">Confirmer · test non réalisé</button>'+
  '<button type="button" id="mocSkipCancel" class="moc-button secondary">Annuler</button></div></div>'+
 '<p id="mocStatus" class="moc-status" role="status" aria-live="polite"></p></section>';
 if(q("mocSkipConfirm"))q("mocSkipConfirm").onclick=()=>submit("skip");
 if(q("mocSkipCancel"))q("mocSkipCancel").onclick=()=>{const p=q("mocSkipPanel");if(p)p.hidden=true};
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
 if(isFields(t)){
  const preview=()=>{
   manualEdited=true;
   const raw=readFields(t);
   const d=deriveInstrumented(t.id,raw),out=q("mocFieldsComputed");if(!out)return;
   const parts=[];
   if(t.dynamo&&dynamoUnit==="kg"){
    const conv=(t.fields||[]).filter(f=>f.unit==="N"&&Number.isFinite(raw[f.key])).map(f=>(f.key.includes("left")?"G ":"D ")+String(raw[f.key]).replace(".",",")+" N");
    if(conv.length)parts.push("Enregistré en newtons : "+conv.join(" · "));
   }
   const warn=q("mocWarnings");
   if(warn){
    const list=plausibilityWarnings(t.id,raw);
    if(t.dynamo&&dynamoUnit==="kg"&&[...host.querySelectorAll("[data-field]")].some(el=>{const f=t.fields.find(x=>x.key===el.dataset.field);return f?.unit==="N"&&Number(el.value)>150}))
     list.push("Valeur très haute pour des kilos : l’écran DynaMo est-il réglé en N ? Utilise la bascule N / kg.");
    warn.innerHTML=list.map(x=>"<li>"+HTML(x)+"</li>").join("");warn.hidden=!list.length;
   }
   if(Number.isFinite(d.gait_speed_ms))parts.push("Vitesse : "+String(d.gait_speed_ms).replace(".",",")+" m/s");
   if(Number.isFinite(d.lsi_pct))parts.push("Symétrie : "+String(d.lsi_pct).replace(".",",")+" %"+(d.weaker_side==="balanced"?"":" · côté plus faible : "+(d.weaker_side==="left"?"gauche":"droit")));
   out.textContent=parts.join(" · ");
  };
  host.querySelectorAll("[data-field]").forEach(el=>el.addEventListener("input",preview));
  // Bascule d'unité DynaMo : convertit les valeurs déjà saisies, mémorise le choix.
  host.querySelectorAll(".moc-unit-switch [data-unit]").forEach(b=>b.onclick=()=>{
   const next=b.dataset.unit==="kg"?"kg":"N";if(next===dynamoUnit)return;
   host.querySelectorAll("[data-field]").forEach(el=>{
    const f=t.fields.find(x=>x.key===el.dataset.field);if(!f||f.unit!=="N"||el.value==="")return;
    const n=toNewton(Number(el.value),dynamoUnit);el.value=String(fromNewton(n,next));
   });
   dynamoUnit=next;try{localStorage.setItem(DYNAMO_UNIT_KEY,next)}catch{}
   host.querySelectorAll(".moc-unit-switch [data-unit]").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.unit===next)));
   t.fields.filter(f=>f.unit==="N").forEach(f=>{const label=host.querySelector('[data-unit-label="'+f.key+'"]');if(label)label.textContent=next;
    const input=host.querySelector('[data-field="'+f.key+'"]');if(input)input.step=next==="kg"?"0.01":fieldStep(f);});
   preview();
  });
  if(t.walkway)bindGaitChrono();
  if(existing?.status==="done"&&existing.fields){
   host.querySelectorAll("[data-field]").forEach(el=>{
    const v=existing.fields[el.dataset.field];if(!Number.isFinite(v))return;
    const f=t.fields.find(x=>x.key===el.dataset.field);
    el.value=String(t.dynamo&&f?.unit==="N"?fromNewton(v,dynamoUnit):v);
   });
   host.querySelectorAll("[data-choice]").forEach(el=>{const v=existing.fields[el.dataset.choice];const r=v&&el.querySelector('input[value="'+v+'"]');if(r)r.checked=true});
   preview();manualEdited=false;
  }
 }
 // Correction : valeurs déjà enregistrées remises dans les champs.
 if(existing?.status==="done"){
  if(t.id==="two_step"&&Array.isArray(existing.attempts_cm)){
   if(q("mocTwoStep1"))q("mocTwoStep1").value=String(existing.attempts_cm[0]);
   if(q("mocTwoStep2"))q("mocTwoStep2").value=String(existing.attempts_cm[1]);
   if(q("mocTwoStepHeight")&&Number.isFinite(existing.height_cm))q("mocTwoStepHeight").value=String(existing.height_cm);
   q("mocTwoStep1")?.dispatchEvent(new Event("input"));manualEdited=false;
  }
  if(!running&&q("mocValue")&&Number.isFinite(existing.value))q("mocValue").value=String(existing.value);
  if(!running&&q("mocObservation")&&existing.observation)q("mocObservation").value=existing.observation;
 }
 if(existing&&q("mocNote")&&existing.note)q("mocNote").value=existing.note;
 host.querySelector(".moc-instructions")?.addEventListener("toggle",e=>{
  try{localStorage.setItem(INSTRUCTIONS_KEY,e.currentTarget.open?"open":"closed")}catch{}
 });
 if(q("mocLater"))q("mocLater").onclick=()=>gotoStep(later);
 if(q("mocResume"))q("mocResume").onclick=()=>gotoStep("finished");
 if(q("mocStationFrame"))q("mocStationFrame").onclick=()=>{
  videoFocus=!videoFocus;updateConsultationLayout();
  q("mocStationFrame").textContent=videoFocus?"Masquer le cadrage":"Vérifier le cadrage";
 };
 if(q("mocObservation")&&!running)q("mocObservation").addEventListener("change",()=>{manualEdited=true});
 if(q("mocStart"))q("mocStart").onclick=()=>startWithCountdown("start");
 if(q("mocSave"))q("mocSave").onclick=()=>submit("save");
 if(q("mocSkip"))q("mocSkip").onclick=()=>openSkipPanel();
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
   if(input&&!manualEdited&&videoQualityUsable(reading,t))input.value=String(detected);
  }else if(tile){
   tile.textContent=String(Number.isFinite(autoValue)?autoValue:0);
   tile.classList.remove("moc-count-verified");
  }
  if(ready&&Number.isFinite(autoValue)&&videoQualityUsable(reading,t)){
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
   if(input&&!manualEdited&&videoQualityUsable(reading,t))input.value=String(elapsed);
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
 if(!room.progress?.safety_confirmed&&!q("mocSafety")?.checked){
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
function openSkipPanel(){
 const p=q("mocSkipPanel");if(!p)return;
 p.hidden=false;q("mocSkipReason")?.focus();p.scrollIntoView?.({block:"nearest"});
}
async function submit(event){
 if(busy||!room||!currentTest())return;
 const t=currentTest();const safety=!!room.progress?.safety_confirmed||!!q("mocSafety")?.checked;
 if(!safety){setStatus("Coche d’abord la vérification de sécurité.");q("mocSafety")?.focus();return}
 const payload={action:"operator_test_update",session_id:room.id,step_code:t.id,event,safety_confirmed:safety};
 if(["start","restart"].includes(event))payload.duration_seconds=t.duration;
 if(event==="save"){
  const note=q("mocNote")?.value||"";
  payload.note=note;
  if(isFields(t)){
   const raw=readFields(t);
   host.querySelectorAll("[data-choice]").forEach(el=>{const v=el.querySelector("input:checked")?.value;if(v)raw[el.dataset.choice]=v});
   const checked=validateInstrumented(t.id,raw);
   if(!checked.ok){setStatus(fieldErrorText(t,checked.error)+" Corrige, ou marque le test non réalisé.");return}
   payload.fields=checked.fields;
   payload.measurement_source="operator_manual_entry";
  }else if(t.id==="two_step"){
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
   const reading=poseTracker?.getLatest();
   const videoUsable=videoQualityUsable(reading,t);
   if(!manualEdited&&Number.isFinite(autoValue)&&!videoUsable){
    setStatus("Suivi vidéo insuffisant ou interrompu : vérifiez le mouvement et saisissez manuellement le résultat avant validation.");return;
   }
   payload.measurement_source=!manualEdited&&videoUsable&&Number.isFinite(autoValue)&&payload.value===autoValue?
    "operator_confirmed_video_estimate":"operator_manual_observation";
   if(isBalance(t)){
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
 if(event==="skip"){
  payload.note=q("mocNote")?.value||q("mocSkipNote")?.value||"";
  payload.skip_reason=q("mocSkipReason")?.value||"";
  if(!SKIP_REASONS.some(([k])=>k===payload.skip_reason)){openSkipPanel();setStatus("Choisissez le motif du test non réalisé.");return}
 }
 // Saisie directe ou correction sans refaire le test : démarrage implicite exigé par le serveur.
 const needsStart=event==="save"&&room.progress?.step_status!=="running";
 busy=true;
 host.querySelectorAll(".moc-button").forEach(b=>{if(b.id!=="mocReturn")b.disabled=true});
 try{
  if(needsStart){
   // Le serveur exige un état « en cours » avant l'enregistrement : démarrage implicite.
   const started=await api({action:"operator_test_update",session_id:room.id,step_code:t.id,event:"start",
    safety_confirmed:safety,duration_seconds:t.duration});
   if(started?.session)room=started.session;
  }
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
  const matching=(data.sessions||[]).filter(x=>x.patient_id===patient?.id&&x.progress?.camera_owner==="operator"&&
   ["waiting","ready","active","completed"].includes(x.status))
   .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  // The operator may enter answers before the iPhone connects. An existing active
  // consultation takes priority over archived reports; otherwise honor the explicit
  // room opened in the live-session dashboard, not an unrelated newer report.
  const selected=matching.find(x=>["waiting","ready","active"].includes(x.status))||
   matching.find(x=>x.id===preferredSessionId)||matching[0]||null;
  if(!selected){
   room=null;renderWaiting("Crée une consultation sur l’ordinateur, puis active /camera/ sur l’iPhone : liaison automatique sans code.");
   return;
  }
  if(room?.id&&room.id!==selected.id&&(questionnaireDirty||questionnaireSaveInFlight)){
   try{await saveQuestionnaire()}catch(error){
    questionnaireNote("Impossible de changer de dossier : réponses non enregistrées. "+(error.message||""));
    return;
   }
   if(questionnaireDirty)return;
  }
  if(room?.id!==selected.id){
   // Never mix questionnaire answers from two different consultation sessions.
   questionnaireAnswers={};questionnairePersistedAt=0;questionnaireDirty=false;
   latestSignature="";
  }
  preferredSessionId=selected.id;
  if(selected.status==="active"&&!TESTS.some(t=>t.id===selected.stage_code)){
   const initialized=await api({action:"operator_tests_init",session_id:selected.id});
   room=initialized.session;
  }else room=selected;
  if(!questionnaireDirty&&!questionnaireSaveInFlight){
   const stored=room.progress?.questionnaire;
   const serverTime=Date.parse(stored?.updated_at||"")||0;
   if(serverTime>=questionnairePersistedAt){
    // Keep the same object referenced by the radio-input onchange callbacks.
    // Replacing it every 2.6s made visible choices update a detached object
    // while autosave serialized the newly assigned (stale) questionnaireAnswers.
    const serverAnswers=stored?.answers||{};
    for(const key of Object.keys(questionnaireAnswers)){
     if(!Object.prototype.hasOwnProperty.call(serverAnswers,key))delete questionnaireAnswers[key];
    }
    Object.assign(questionnaireAnswers,serverAnswers);
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
 preferredSessionId=config.preferredSessionId||"";
 if(!host)return;
 styles();makeShell();
 try{
  extras=await import("./motion-live-clinic-extras-v1.js?v=20261121-forcedecks-v1");
  updatePanelTabs();
 }catch(error){
  const note=q("mocVoiceState");
  if(note)note.textContent="Questionnaires et rapport temporairement indisponibles : "+(error.message||"chargement");
 }
 try{
  const {createClinicVoice}=await import("./motion-live-clinic-voice-v1.js?v=20261121-forcedecks-v1");
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
  const {createRemoteMotionTracker}=await import("./motion-live-remote-pose-v1.js?v=20261121-forcedecks-v1");
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
 if(!patient){renderWaiting("Sélectionne le dossier du patient pour cette consultation physique.");return}
 await refresh(true);
 poll=setInterval(()=>refresh(),2600);
}

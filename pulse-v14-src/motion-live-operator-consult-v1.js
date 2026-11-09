// KŌMØ Pulse — supervised Motion Online tests; video capture on the phone, manual observations by Operator.
// Test-only. No automated clinical interpretation or diagnostic Motion Score.
const TESTS=[
 {id:"sts",title:"Se relever de la chaise",duration:30,unit:"répétitions",type:"count",
  setup:"Chaise stable contre un mur, caméra de trois-quarts profil, tête et pieds visibles.",
  instruction:"Comptez les levers complets pendant 30 secondes. Bras croisés si possible, sans compromettre la sécurité.",
  label:"Nombre de levers complets"},
 {id:"heels",title:"Élévations sur les pointes",duration:20,unit:"répétitions",type:"count",
  setup:"Debout de profil, pieds et bassin visibles, à proximité d'un support fixe.",
  instruction:"Comptez les élévations complètes sur les pointes pendant 20 secondes. Arrêtez en cas d'instabilité.",
  label:"Nombre d'élévations"},
 {id:"unipodal_left",title:"Équilibre · pied gauche",duration:20,unit:"seconds",
  setup:"Debout près d'un appui stable, face à la caméra, pieds visibles.",
  instruction:"Le patient soulève doucement le pied droit. Chronométrez l'appui gauche, au maximum 20 secondes.",
  label:"Durée maintenue (secondes)"},
 {id:"unipodal_right",title:"Équilibre · pied droit",duration:20,unit:"seconds",
  setup:"Debout près d'un appui stable, face à la caméra, pieds visibles.",
  instruction:"Le patient soulève doucement le pied gauche. Chronométrez l'appui droit, au maximum 20 secondes.",
  label:"Durée maintenue (secondes)"},
 {id:"arms",title:"Mobilité des bras",duration:20,unit:"mouvements",type:"count",
  setup:"Face à la caméra, bras et poignets visibles, espace libre autour du corps.",
  instruction:"Comptez les cycles de lever et abaisser les bras pendant 20 secondes, sans amplitude douloureuse.",
  label:"Nombre de mouvements"},
 {id:"posture",title:"Posture de profil",duration:0,unit:"observation",
  setup:"Profil strict, pieds visibles, téléphone à hauteur du bassin, caméra immobile.",
  instruction:"Observez l'alignement sagittal apparent. Une caméra 2D ne mesure pas la SVA radiographique.",
  label:"Observation visuelle"}
];
const HTML=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
let host=null,api=null,openVideo=null,patient=null,room=null,latestSignature="",poll=null,clock=null,busy=false,stoppedAt=null,polling=false;
let poseTracker=null,videoListener=null,stopVideoListener=null,fullscreenListener=null,autoValue=null,manualEdited=false,poseStatus="En attente du flux iPhone",poseRetryAt=0;
const q=id=>host?.querySelector("#"+id);
function setStatus(message){if(q("mocStatus"))q("mocStatus").textContent=message||""}
function styles(){
 if(document.getElementById("mocStyles"))return;
 const link=document.createElement("link");link.id="mocStyles";link.rel="stylesheet";
 link.href="./motion-live-operator-consult-v1.css?v=20261109-live-pose-v1";
 document.head.append(link);
}
function stopClock(){if(clock)clearInterval(clock);clock=null;stoppedAt=null}
export function disposeOperatorConsultation(){
 if(poll)clearInterval(poll);poll=null;stopClock();
 if(videoListener)window.removeEventListener("pulse:remote-video-ready",videoListener);
 if(stopVideoListener)window.removeEventListener("pulse:remote-video-stopped",stopVideoListener);
 if(fullscreenListener)document.removeEventListener("fullscreenchange",fullscreenListener);
 videoListener=null;stopVideoListener=null;fullscreenListener=null;
 poseTracker?.dispose();poseTracker=null;
 host=null;room=null;api=null;openVideo=null;patient=null;latestSignature="";autoValue=null;manualEdited=false;
}
function currentTest(){return TESTS[Number(room?.step_index)]||null}
function stageText(result){return result?.status==="done"?"✓":result?.status==="skipped"?"—":"·"}
function makeShell(){
 host.innerHTML='<section class="moc-shell">'+
 '<header class="moc-head"><div><span class="overline">KŌMØ PULSE · CONSULTATION EN DIRECT</span><h2>Consultation Motion</h2>'+
 '<p id="mocPatientLine"></p></div><div class="moc-head-actions"><button type="button" class="moc-back" id="mocFullscreen">⛶ Plein écran</button><button type="button" class="moc-back" id="mocReturn">Sessions en direct</button></div></header>'+
 '<div class="moc-grid"><section class="moc-tests">'+
 '<div class="moc-overview"><span id="mocProgressText">Chargement…</span><div class="moc-progress"><i id="mocProgressFill"></i></div></div>'+
 '<div class="moc-step-nav" id="mocStepNav" aria-label="Tests Motion"></div>'+
 '<div id="mocTestBody"><p>Recherche de la consultation…</p></div>'+
 '</section><aside class="moc-camera-column"><div class="moc-camera-heading"><strong>Caméra de l’iPhone</strong><span>Visualisation en direct</span></div>'+
 '<div id="motionConsultCamera" class="moc-camera-host"></div>'+
 '<div class="moc-pose-indicator" id="mocPoseIndicator" role="status">◌ Chargement des marqueurs…</div><div class="moc-camera-foot">33 points · Analyse locale sur cet ordinateur · Flux non enregistré · Changement avant/arrière sur l’iPhone.</div>'+
 '</aside></div><p class="moc-bottom-note">Démonstration avec dossier fictif · Résultats saisis manuellement par l’opérateur · Aucune interprétation clinique automatique</p></section>';
 q("mocReturn").onclick=()=>{location.hash="live"};
 q("mocFullscreen").onclick=async()=>{
  try{
   if(document.fullscreenElement)await document.exitFullscreen();
   else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
   else{q("mocFullscreen").textContent="Installer la webapp pour le plein écran";return}
   if(q("mocFullscreen"))q("mocFullscreen").textContent=document.fullscreenElement?"↙ Quitter le plein écran":"⛶ Plein écran";
  }catch(error){if(q("mocFullscreen"))q("mocFullscreen").textContent="Plein écran indisponible"}
 };
 q("mocPatientLine").textContent=patient ? [patient.first_name,patient.last_name].filter(Boolean).join(" ")+" · Bilan supervisé" : "Sélectionnez un patient fictif";
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
 return Number.isFinite(result.value)?String(result.value)+" "+task.unit:"Résultat enregistré";
}
function renderSummary(){
 stopClock();
 const results=room?.progress?.results||{};
 q("mocProgressText").textContent="Consultation terminée · "+TESTS.length+" tests traités";
 q("mocProgressFill").style.width="100%";
 q("mocStepNav").innerHTML=TESTS.map((t,i)=>'<span class="moc-step done">'+stageText(results[t.id])+' '+HTML(t.title)+'</span>').join("");
 q("mocTestBody").innerHTML='<section class="moc-test"><span class="moc-kicker">CONSULTATION TERMINÉE</span><h3>Synthèse des observations</h3>'+
 '<div class="moc-recap">'+TESTS.map(t=>'<div><span>'+HTML(t.title)+'</span><strong>'+HTML(formatResult(results[t.id],t))+'</strong></div>').join("")+'</div>'+
 '<p class="moc-help">Observations vidéo exploratoires vérifiées par l’opérateur. Aucun diagnostic, Motion Score ou rapport clinique automatique.</p>'+
 '<button type="button" class="moc-button secondary" id="mocBackRooms">Retour aux consultations</button></section>';
 q("mocBackRooms").onclick=()=>{location.hash="live"};
}
function timeDisplay(){
 const task=currentTest(),node=q("mocClock");
 if(!node||!task||!task.duration||room?.progress?.step_status!=="running")return;
 const start=Date.parse(room.progress.test_started_at||"");
 if(!Number.isFinite(start)){node.textContent="00:00";return}
 const at=stoppedAt??Date.now();
 const elapsed=Math.max(0,(at-start)/1000);
 const remaining=Math.max(0,task.duration-elapsed);
 node.textContent="00:"+String(Math.ceil(remaining)).padStart(2,"0");
 node.classList.toggle("finished",remaining<=0);
 if(remaining<=0&&stoppedAt===null)stoppedAt=start+task.duration*1000;
 // Do not invent 20 seconds when the camera has not actually observed a held stance.
}
function setClock(){
 if(clock)clearInterval(clock);clock=null;stoppedAt=null;
 if(room?.progress?.step_status==="running"&&currentTest()?.duration){
  timeDisplay();clock=setInterval(timeDisplay,160);
 }
}
function renderStep(){
 if(!host||!room)return;
 if(room.status==="completed"||room.stage_code==="finished"){renderSummary();return}
 const t=currentTest();
 if(!t){renderWaiting("La session doit être initialisée dans les tests Motion Online.");return}
 const results=room.progress?.results||{};
 const idx=room.step_index;
 q("mocProgressText").textContent="Test "+(idx+1)+" sur "+TESTS.length;
 q("mocProgressFill").style.width=(idx/TESTS.length*100)+"%";
 q("mocStepNav").innerHTML=TESTS.map((item,i)=>'<div class="moc-step '+(i===idx?"current":i<idx?"done":"")+'">'+
 '<b>'+HTML(i<idx?stageText(results[item.id]):String(i+1))+'</b><span>'+HTML(item.title)+'</span></div>').join("");
 const running=room.progress?.step_status==="running";
 const safety=idx===0&&!room.progress?.safety_confirmed;
 autoValue=null;manualEdited=false;
 poseTracker?.setTest(t.id,room.progress?.test_started_at,running,t.duration);
 const input=t.id==="posture"?
  '<label class="moc-field">Observation (sans mesure radiographique)<select id="mocObservation">'+
  '<option value="">Choisir une observation</option><option value="neutral">Alignement apparent neutre</option>'+
  '<option value="apparent_offset">Décalage sagittal apparent</option><option value="not_interpretable">Image non interprétable</option></select></label>'
  :'<label class="moc-field">'+HTML(t.label)+'<div class="moc-input-unit"><input id="mocValue" type="number" inputmode="decimal" min="0" max="'+(t.unit==="seconds"?"20":"100")+'" step="'+(t.unit==="seconds"?"0.1":"1")+'" placeholder="Saisir une valeur"><span>'+HTML(t.unit)+'</span></div></label>';
 q("mocTestBody").innerHTML='<section class="moc-test"><span class="moc-kicker">TEST '+(idx+1)+' / '+TESTS.length+'</span><h3>'+HTML(t.title)+'</h3>'+
 '<div class="moc-guide"><div><strong>Installation</strong><p>'+HTML(t.setup)+'</p></div>'+
 '<div><strong>Consigne</strong><p>'+HTML(t.instruction)+'</p></div></div>'+
 (safety?'<label class="moc-safety"><input type="checkbox" id="mocSafety"> Conditions de sécurité vérifiées : espace dégagé, appui accessible, absence de contre-indication évidente au test.</label>':'')+
 (running?'<div class="moc-timer"><div><span>CHRONOMÈTRE</span><strong id="mocClock">'+(t.duration?"00:"+String(t.duration).padStart(2,"0"):"Observation")+'</strong></div>'+
 (t.duration?'<button type="button" class="moc-button secondary" id="mocStopClock">Arrêter le chrono</button>':'')+'</div>'+input+
 '<div class="moc-auto-feedback" id="mocAutoFeedback">◌ Marqueurs en cours de chargement. En attendant, saisie manuelle possible.</div>'+
 '<label class="moc-field">Notes (facultatif)<textarea id="mocNote" rows="2" maxlength="300" placeholder="Qualité de l’observation, aide utilisée, remarque…"></textarea></label>'+
 '<div class="moc-buttons"><button type="button" id="mocSave" class="moc-button primary">Valider et passer au suivant</button>'+
 '<button type="button" id="mocSkip" class="moc-button secondary">Test non réalisé</button></div>'
 :'<div class="moc-buttons"><button type="button" id="mocStart" class="moc-button primary">'+(t.duration?"Démarrer le chronomètre":"Commencer l’observation")+'</button>'+
 '<button type="button" id="mocSkip" class="moc-button secondary">Test non réalisé</button></div>')+
 '<p id="mocStatus" class="moc-status" role="status" aria-live="polite"></p></section>';
 if(q("mocValue"))q("mocValue").addEventListener("input",()=>{manualEdited=true});
 if(q("mocStart"))q("mocStart").onclick=()=>submit("start");
 if(q("mocSave"))q("mocSave").onclick=()=>submit("save");
 if(q("mocSkip"))q("mocSkip").onclick=()=>submit("skip");
 if(q("mocStopClock"))q("mocStopClock").onclick=()=>{
  if(stoppedAt===null)stoppedAt=Date.now();
  poseTracker?.stopMeasurement();
  const observed=poseTracker?.getLatest();
  if(observed?.measurement!==null&&Number.isFinite(observed?.measurement)&&q("mocValue")&&!manualEdited)
    q("mocValue").value=String(observed.measurement);
  const start=Date.parse(room.progress.test_started_at||"");
  if(t.unit==="seconds"&&Number.isFinite(start)&&q("mocValue")&&!q("mocValue").value){
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
 const ready=reading?.valid&&reading.frames>=5;
 const message=reading?.message||poseStatus;
 if(indicator)indicator.textContent=(ready?"● Corps détecté · ":"◌ Recherche du corps · ")+message;
 const t=currentTest(),running=room?.progress?.step_status==="running";
 if(!running||!feedback)return;
 const detected=reading?.measurement;
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
async function submit(event){
 if(busy||!room||!currentTest())return;
 const t=currentTest();const safety=!!room.progress?.safety_confirmed||!!q("mocSafety")?.checked;
 if(room.step_index===0&&!safety){setStatus("Confirmez d’abord la sécurité du test.");return}
 const payload={action:"operator_test_update",session_id:room.id,step_code:t.id,event,safety_confirmed:safety};
 if(event==="save"){
  const note=q("mocNote")?.value||"";
  payload.note=note;
  if(t.id==="posture"){
   payload.observation=q("mocObservation")?.value||"";
   if(!payload.observation){setStatus("Choisissez une observation pour ce test.");return}
  }else{
   const raw=q("mocValue")?.value;
   if(raw===""||raw===undefined){setStatus("Saisissez le résultat observé.");return}
   payload.value=Number(raw);
   payload.measurement_source=!manualEdited&&Number.isFinite(autoValue)&&payload.value===autoValue?
    "operator_confirmed_video_estimate":"operator_manual_observation";
   if(!Number.isFinite(payload.value)||payload.value<0||payload.value>(t.unit==="seconds"?20:100)||
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
  latestSignature="";
  renderStep();
  if(event==="save")setStatus("Résultat enregistré.");
 }catch(error){setStatus((error.message||"Impossible d’enregistrer")+" · Réessayez.");}
 finally{busy=false;host?.querySelectorAll(".moc-button").forEach(b=>b.disabled=false)}
}
async function refresh(force=false){
 if(!host?.isConnected||!api||polling)return;
 polling=true;
 try{
  const data=await api({action:"operator_list"});
  const matching=(data.sessions||[]).filter(x=>x.patient_id===patient?.id&&["active","completed"].includes(x.status))
   .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  const selected=matching[0]||null;
  if(!selected){
   room=null;renderWaiting("Ouvrez Motion sur le téléphone, puis associez son code au patient dans En direct.");
   return;
  }
  if(selected.status==="active"&&!TESTS.some(t=>t.id===selected.stage_code)){
   const initialized=await api({action:"operator_tests_init",session_id:selected.id});
   room=initialized.session;
  }else room=selected;
  const signature=JSON.stringify([room.id,room.stage_code,room.step_index,room.status,room.progress?.step_status,room.progress?.safety_confirmed,room.progress?.test_started_at,room.progress?.results]);
  if(force||signature!==latestSignature){
   latestSignature=signature;
   renderStep();
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
 fullscreenListener=()=>{const button=q("mocFullscreen");if(button)button.textContent=document.fullscreenElement?"↙ Quitter le plein écran":"⛶ Plein écran"};
 document.addEventListener("fullscreenchange",fullscreenListener);
 try{
  const {createRemoteMotionTracker}=await import("./motion-live-remote-pose-v1.js?v=20261109-live-pose-v1");
  poseTracker=createRemoteMotionTracker({
   onUpdate:updatePosePanel,
   onError:message=>{
    if(message)poseStatus=message;
    const node=q("mocPoseIndicator");
    if(node&&message)node.textContent="⚠ "+message;
   }
  });
  videoListener=e=>{
   if(e.detail?.sessionId===room?.id)void attachPoseVideo(e.detail.video);
  };
  stopVideoListener=e=>{
   if(e.detail?.sessionId===room?.id){
    poseTracker?.detach();
    poseStatus="Caméra déconnectée · reconnectez le téléphone.";
   }
  };
  window.addEventListener("pulse:remote-video-ready",videoListener);
  window.addEventListener("pulse:remote-video-stopped",stopVideoListener);
 }catch(error){
  poseStatus="Marqueurs indisponibles : "+(error.message||"chargement échoué");
 }
 if(!patient){renderWaiting("Sélectionnez un dossier fictif pour commencer.");return}
 await refresh(true);
 poll=setInterval(()=>refresh(),2600);
}

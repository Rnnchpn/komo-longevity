// The clinician's own iPhone provides a WebRTC camera in the physical consultation.
// This module also preserves the previous test-room entry for backward compatibility.
// No recording, audio or video upload. Operator owns all test controls.
const EDGE="https://uqlolefsiktbznnymriy.supabase.co/functions/v1/motion-live-test";
const KEY="sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n";
const STORAGE="komo_motion_live_guest_v1";
const STAFF_STORAGE="komo_motion_operator_camera_station_v1";
const STEPS=[
 ["sts","Se relever de la chaise","Assis sur une chaise stable contre un mur, relevez-vous et rasseyez-vous durant 30 secondes. L'opérateur lance le chronomètre."],
 ["heels","Élévations sur les pointes","Debout près d'un appui fixe, montez sur les pointes puis redescendez durant 20 secondes."],
 ["unipodal_left","Équilibre · appui gauche","Près d'un support stable, soulevez légèrement le pied droit. L'opérateur chronomètre jusqu'à 20 secondes."],
 ["unipodal_right","Équilibre · appui droit","Près d'un support stable, soulevez légèrement le pied gauche. L'opérateur chronomètre jusqu'à 20 secondes."],
 ["arms","Mobilité des bras","Face à la caméra, levez et redescendez les bras sans douleur pendant 20 secondes."],
 ["posture","Posture de profil","Mettez-vous naturellement de profil, pieds visibles. L'opérateur observe la posture ; cette image ne mesure pas la SVA radiographique."]
];
let overlay=null,videoStream=null,timer=null,signalTimer=null,guestToken="",live=null,busy=false,opening=false,cameraInfo="Caméra désactivée";
let facing="environment",peer=null,peerSender=null,peerId="",pendingWatch=null,signalCursor=0,offering=false,wakeLock=null,signalPolling=false;
let cameraStation=false,stationStart=null,stationStop=null,stationRoomId="";
const rtcConfig={iceServers:[{urls:"stun:stun.cloudflare.com:3478"}]};
const el=id=>overlay?.querySelector("#"+id);
async function request(data){
 const r=await fetch(EDGE,{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json",apikey:KEY},body:JSON.stringify(data)});
 let json={};try{json=await r.json()}catch{throw Error("Réponse serveur illisible")}
 if(!r.ok||json.error){
  const error=json.error||"Erreur réseau";
  const map={session_expired:"Cette session a expiré.",session_closed:"La session a été fermée.",operator_not_connected:"Attendez que votre opérateur vous rejoigne.",session_limit_reached:"Trop de sessions simultanées. Réessayez plus tard."};
  throw Error(map[error]||error);
 }
 return json;
}
function injectStyles(){
 if(document.getElementById("mliveStylesheet"))return;
 const style=document.createElement("link");
 style.id="mliveStylesheet";style.rel="stylesheet";
 style.href=new URL("./motion-live-guest-v1.css?v=20261109-clinic-camera-v1",import.meta.url).href;
 document.head.append(style);
}
function feedback(s){if(el("mliveFeedback"))el("mliveFeedback").textContent=s||""}
function makeOverlay(){
 injectStyles();
 overlay=document.createElement("section");
 overlay.id="mliveOverlay";overlay.className="mlive-overlay"+(cameraStation?" mlive-staff-camera":"");
 overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");
 overlay.setAttribute("aria-label",cameraStation?"Caméra du cabinet — iPhone opérateur":"Consultation Motion en direct");
 overlay.innerHTML=`
  <header class="mlive-top"><span class="mlive-brand">KŌMØ <small>${cameraStation?"CAMÉRA DU CABINET":"PULSE · MOTION EN DIRECT"}</small></span><button type="button" class="mlive-close" id="mliveClose">${cameraStation?"Terminer":"Fermer"} ×</button></header>
  <div class="mlive-main">
   <div class="mlive-camera rear" id="mliveCameraFrame"><video id="mliveVideo" autoplay muted playsinline hidden></video>
    <div class="mlive-camera-hint" id="mliveCameraHint">Ton iPhone devient la caméra du cabinet. Installe-le sur le trépied, cadre le corps entier et active la caméra arrière.</div>
    <span class="mlive-camera-label" id="mliveCameraLabel">Caméra désactivée</span></div>
   <div class="mlive-panel">
    <span class="mlive-eyebrow">${cameraStation?"IPHONE OPÉRATEUR · CONSULTATION SUR PLACE":"CONSULTATION MOTION · CANNES"}</span>
    <h2 id="mliveTitle">Ouverture de la caméra…</h2>
    <p id="mliveDescription">${cameraStation?"Le patient n’utilise pas ce téléphone. Tous les tests se commandent depuis ton ordinateur.":"Votre opérateur va vous accompagner."}</p>
    <div class="mlive-number"><span>${cameraStation?"CODE À REPÉRER SUR TON ORDINATEUR":"CODE À COMMUNIQUER À L'OPÉRATEUR"}</span><strong id="mliveCode">······</strong></div>
    <div class="mlive-state"><i></i><span id="mliveState">Connexion…</span></div>
    <div class="mlive-progress" role="progressbar" aria-label="Progression de la consultation" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="mliveProgress"><i id="mliveProgressBar"></i></div>
    <p class="mlive-stage-line" id="mliveStage">Test 1 / 6</p>
    <div class="mlive-actions">
      <button class="mlive-button secondary" type="button" id="mliveCamera">Activer et partager la caméra</button>
      <button class="mlive-button secondary" type="button" id="mliveFlip">↻ Passer à la caméra avant</button>
      <button class="mlive-button primary" type="button" id="mlivePrimary" disabled>Connexion…</button>
      
    </div>
    <p id="mliveFeedback" class="mlive-feedback" role="status" aria-live="polite"></p>
   </div>
  </div>
  <footer class="mlive-foot">${cameraStation?"Mode caméra du professionnel, sans compte patient sur l’iPhone.":"Mode d'essai avec dossier fictif."} · Vidéo WebRTC chiffrée, sans enregistrement · Garder l'écran allumé · Essais sur dossiers fictifs uniquement</footer>`;
 document.body.append(overlay);
 el("mliveClose").onclick=()=>{
  const closingId=stationRoomId,stop=stationStop;
  close();
  if(cameraStation&&closingId&&stop)Promise.resolve(stop(closingId)).catch(()=>{});
 };
 el("mliveCamera").onclick=activateCamera;
 el("mliveFlip").onclick=switchCamera;
 el("mlivePrimary").onclick=primary;

 window.addEventListener("pagehide",stopCamera,{once:true});
}
function update(){
 if(!overlay||!live)return;
 const state=live.status,step=Number(live.step_index)||0;
 const cur=STEPS[step],running=live.progress?.step_status==="running";
 el("mliveCode").textContent=live.display_code||"······";
 el("mliveProgress").setAttribute("aria-valuenow",String(Math.round(step/STEPS.length*100)));
 el("mliveProgressBar").style.width=Math.round(step/STEPS.length*100)+"%";
 el("mliveStage").textContent=state==="completed"?"Bilan terminé":"Test "+Math.min(step+1,STEPS.length)+" / "+STEPS.length;
 const btn=el("mlivePrimary");
 btn.hidden=!!cameraStation;btn.disabled=busy;
 if(cameraStation){
  const connected=peer?.connectionState==="connected";
  el("mliveTitle").textContent=state==="completed"?"Séance terminée.":"Caméra de consultation";
  el("mliveDescription").textContent=state==="active"?
   (cur?"Test en cours : "+cur[1]+". La vidéo est envoyée à ton ordinateur ; tu pilotes les mesures là-bas.":"Caméra connectée au poste de consultation.") :
   "Sur l’ordinateur, ouvre « En direct », sélectionne ton iPhone avec ce code, puis associe le dossier fictif.";
  el("mliveState").textContent=state==="completed"?"Séance terminée":connected?"◉ Vidéo affichée sur l’ordinateur":state==="active"?"Opérateur associé · connexion vidéo en cours":"En attente de la connexion depuis l’ordinateur";
  btn.hidden=true;
 }else if(state==="waiting"){
  el("mliveTitle").textContent="Votre salle Motion est ouverte.";
  el("mliveDescription").textContent="Transmettez le code à l'opérateur. Vérifiez votre environnement, puis indiquez que vous êtes prêt.";
  el("mliveState").textContent="En attente de l'opérateur";
  btn.textContent="Je suis prêt · Prévenir l'opérateur";
 }else if(state==="ready"){
  el("mliveTitle").textContent="Vous êtes prêt.";
  el("mliveDescription").textContent="L'opérateur voit votre session et doit l'associer à votre dossier avant de lancer le bilan.";
  el("mliveState").textContent="En attente du démarrage";
  btn.hidden=true;
 }else if(state==="active"&&cur){
  el("mliveTitle").textContent=cur[1];
  el("mliveDescription").textContent=cur[2];
  el("mliveState").textContent=peer?.connectionState==="connected"?"Caméra connectée à l'ordinateur":"Opérateur connecté · Étapes synchronisées";
  btn.hidden=true;
  feedback(running?"Test en cours sur l'ordinateur. Suivez les consignes de l'opérateur.":"L'opérateur choisit et lance les tests depuis l'ordinateur.");
 }else{
  el("mliveTitle").textContent="Parcours terminé.";
  el("mliveDescription").textContent="L'opérateur peut désormais contrôler et valider les résultats du bilan. Aucun score n'est publié automatiquement.";
  el("mliveState").textContent="Étapes parcourues · Validation en attente";
  btn.hidden=true;
 }
}
async function sync(){
 if(!guestToken||!overlay||busy)return;
 try{
  const data=await request({action:"guest_status",guest_token:guestToken});
  live=data.session;
  if(live.status==="completed"){stopCamera(false);clearInterval(signalTimer);signalTimer=null;}
  else if(live.status!=="active"&&peer)resetPeer();
  update();
 }catch(error){
  const message=error.message||"Synchronisation momentanément indisponible.";
  if(/fermée|expiré/i.test(message)){stopCamera(false);clearInterval(signalTimer);signalTimer=null;}
  feedback(message);
 }
}
async function primary(){
 if(!guestToken||!live||busy)return;
 const event=live.status==="waiting"?"ready":null;
 if(!event)return;
 busy=true;update();
 try{
  await request({action:"guest_event",guest_token:guestToken,event,stage_code:live.stage_code});
  await syncForced();
 }catch(error){feedback(error.message)}finally{busy=false;update()}
}
async function syncForced(){
 const d=await request({action:"guest_status",guest_token:guestToken});live=d.session;update();
}
async function waitIceGathering(pc){
 if(pc.iceGatheringState==="complete")return;
 await new Promise(resolve=>{
  const finish=()=>{pc.removeEventListener("icegatheringstatechange",check);clearTimeout(timeout);resolve()};
  const check=()=>{if(pc.iceGatheringState==="complete")finish()};
  const timeout=setTimeout(finish,9000);
  pc.addEventListener("icegatheringstatechange",check);
  check();
 });
}
function resetPeer(){
 const old=peer;peer=null;peerSender=null;peerId="";offering=false;
 if(old){old.onconnectionstatechange=null;old.close()}
 if(videoStream)cameraLabel();
}
function cameraLabel(){
 const active=!!videoStream;
 const shared=peer?.connectionState==="connected";
 const label=el("mliveCameraLabel");
 if(label)label.textContent=active?(shared?"Partage vidéo actif · ":"Caméra prête · ")+(facing==="environment"?"arrière":"avant"):"Caméra désactivée";
 const button=el("mliveCamera");
 if(button)button.textContent=active?"Arrêter le partage caméra":"Activer et partager la caméra";
 const flip=el("mliveFlip");
 if(flip){flip.disabled=!active;flip.textContent=facing==="environment"?"↻ Passer à la caméra avant":"↻ Passer à la caméra arrière"}
 el("mliveCameraFrame")?.classList.toggle("rear",facing==="environment");
 el("mliveCameraFrame")?.classList.toggle("front",facing==="user");
}
async function makeOffer(){
 if(!overlay||!guestToken||!videoStream||!pendingWatch||live?.status!=="active"||offering)return;
 if(!window.RTCPeerConnection){feedback("La diffusion WebRTC est indisponible sur ce navigateur.");return}
 offering=true;
 const connectionId=pendingWatch.connection_id;
 try{
  resetPeer();
  offering=true;peerId=connectionId;
  const pc=new RTCPeerConnection(rtcConfig);
  peer=pc;
  peerSender=pc.addTrack(videoStream.getVideoTracks()[0],videoStream);
  pc.onconnectionstatechange=()=>{
   if(peer!==pc)return;
   cameraLabel();
   if(pc.connectionState==="connected")feedback("Caméra partagée avec votre ordinateur.");
   if(pc.connectionState==="failed"||pc.connectionState==="disconnected")feedback("Liaison vidéo interrompue. Relancez l'affichage sur l'ordinateur.");
  };
  await pc.setLocalDescription(await pc.createOffer());
  await waitIceGathering(pc);
  if(peer!==pc||!overlay)return;
  await request({action:"guest_signal_push",guest_token:guestToken,connection_id:connectionId,kind:"offer",
   payload:{sdp:pc.localDescription.sdp}});
  feedback("Connexion vidéo en cours sur l'ordinateur…");
 }catch(error){resetPeer();feedback("Impossible de partager la caméra : "+(error.message||"erreur réseau"))}
 finally{offering=false;cameraLabel()}
}
async function pollSignals(){
 if(!overlay||!guestToken||live?.status!=="active"||signalPolling)return;
 signalPolling=true;
 try{
  const data=await request({action:"guest_signal_pull",guest_token:guestToken,since:signalCursor});
  for(const msg of data.signals||[]){
   signalCursor=Math.max(signalCursor,Number(msg.id)||0);
   if(msg.kind==="watch"){
    if(Date.now()-new Date(msg.created_at).getTime()>60000)continue;
    pendingWatch={connection_id:msg.connection_id};
    resetPeer();
    if(videoStream)await makeOffer();
    else feedback("L'opérateur souhaite voir votre caméra. Touchez « Activer et partager la caméra ».");
   }else if(msg.kind==="answer"&&msg.connection_id===peerId&&peer){
    if(peer.signalingState==="have-local-offer")await peer.setRemoteDescription({type:"answer",sdp:msg.payload.sdp});
   }else if(msg.kind==="stop"&&msg.connection_id===peerId){
    pendingWatch=null;resetPeer();feedback("L'opérateur a fermé l'affichage vidéo.");
   }
  }
 }catch(error){feedback("Vidéo : "+(error.message||"connexion momentanément indisponible"))}
 finally{signalPolling=false}
}
async function getVideo(facingMode){
 return navigator.mediaDevices.getUserMedia({
  video:{facingMode:{ideal:facingMode},width:{ideal:1280},height:{ideal:720},frameRate:{ideal:24,max:30}},
  audio:false
 });
}
function applyVideo(){
 const video=el("mliveVideo");
 if(video){video.srcObject=videoStream;video.hidden=!videoStream;if(videoStream)video.play().catch(()=>{})}
 const hint=el("mliveCameraHint");if(hint)hint.hidden=!!videoStream;
 cameraLabel();
}
async function activateCamera(){
 if(videoStream){stopCamera(true);return}
 if(!navigator.mediaDevices?.getUserMedia){feedback("La caméra nécessite Safari/Chrome et HTTPS.");return}
 const b=el("mliveCamera");if(b)b.disabled=true;
 try{
  videoStream=await getVideo(facing);
  applyVideo();
  try{if(navigator.wakeLock?.request)wakeLock=await navigator.wakeLock.request("screen")}catch{}
  feedback("Caméra prête. Le partage commence dès que l'opérateur ouvre la vidéo.");
  if(pendingWatch)await makeOffer();
 }catch(error){feedback("Caméra indisponible : autorisez l'accès dans Safari puis réessayez. "+(error.message||""))}
 finally{if(b)b.disabled=false}
}
async function switchCamera(){
 if(!videoStream)return;
 const button=el("mliveFlip");
 if(button)button.disabled=true;
 const next=facing==="environment"?"user":"environment";
 const old=videoStream;
 try{
  // Safari iOS may refuse the second camera until the previous track is released.
  old.getTracks().forEach(t=>t.stop());
  videoStream=null;
  const nextStream=await getVideo(next);
  videoStream=nextStream;facing=next;
  applyVideo();
  if(peerSender&&peer?.connectionState!=="closed"){
   try{await peerSender.replaceTrack(nextStream.getVideoTracks()[0])}
   catch{resetPeer();if(pendingWatch)await makeOffer()}
  }
  feedback("Caméra "+(facing==="environment"?"arrière":"avant")+" activée.");
 }catch(error){
  try{videoStream=await getVideo(facing);applyVideo();if(peerSender)await peerSender.replaceTrack(videoStream.getVideoTracks()[0])}
  catch{stopCamera(true)}
  feedback("Changement de caméra impossible. "+(error.message||""));
 }finally{if(button)button.disabled=!videoStream}
}
function stopCamera(signal=false){
 const connectionId=peerId;
 resetPeer();pendingWatch=null;
 if(signal&&connectionId&&guestToken)request({action:"guest_signal_push",guest_token:guestToken,connection_id:connectionId,kind:"stop"}).catch(()=>{});
 videoStream?.getTracks().forEach(track=>track.stop());videoStream=null;
 wakeLock?.release?.().catch(()=>{});wakeLock=null;
 const video=el("mliveVideo");if(video){video.srcObject=null;video.hidden=true}
 applyVideo();
}
function close(){
 clearInterval(timer);timer=null;clearInterval(signalTimer);signalTimer=null;
 stopCamera(true);overlay?.remove();overlay=null;live=null;pendingWatch=null;signalCursor=0;
 guestToken="";stationRoomId="";
}
export async function openMotionLive(options={}){
 if(opening)return;
 if(overlay){overlay.scrollIntoView({block:"start"});return}
 opening=true;
 cameraStation=options.mode==="operator_camera";
 stationStart=typeof options.startSession==="function"?options.startSession:null;
 stationStop=typeof options.stopSession==="function"?options.stopSession:null;
 const key=cameraStation?STAFF_STORAGE:STORAGE;
 try{
  makeOverlay();
  const existing=sessionStorage.getItem(key);
  if(existing&&/^[A-Za-z0-9_-]{43}$/.test(existing)){
   guestToken=existing;
   try{const data=await request({action:"guest_status",guest_token:guestToken});live=data.session;}
   catch{guestToken="";sessionStorage.removeItem(key)}
  }
  if(!guestToken){
   if(cameraStation&&!stationStart)throw Error("Identification opérateur requise pour ouvrir la caméra.");
   const data=cameraStation?await stationStart():await request({action:"guest_start"});
   guestToken=data.guest_token;sessionStorage.setItem(key,guestToken);
   live={display_code:data.display_code,status:data.status,stage_code:data.stage_code||STEPS[0][0],step_index:Number(data.step_index)||0,progress:data.progress||{}};
   stationRoomId=data.id||"";
  }
  if(cameraStation)el("mlivePrimary").hidden=true;
  update();timer=setInterval(sync,2400);
  signalTimer=setInterval(pollSignals,1100);
 }catch(error){feedback(error.message||"Impossible d'ouvrir la caméra.");if(el("mliveTitle"))el("mliveTitle").textContent="Caméra momentanément indisponible."}
 finally{opening=false}
}

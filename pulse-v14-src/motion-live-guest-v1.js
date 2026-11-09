// Test-only guest room. Camera is sent through encrypted WebRTC only after the patient enables sharing and an authorized Operator watches. No recording or media upload.
const EDGE="https://uqlolefsiktbznnymriy.supabase.co/functions/v1/motion-live-test";
const KEY="sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n";
const STORAGE="komo_motion_live_guest_v1";
const STEPS=[
  ["preflight","Sécurité et préparation","Installez votre téléphone dans un espace dégagé. Vérifiez que vous pouvez réaliser les mouvements sans risque de chute."],
  ["readiness","Pré-bilan","Suivez les consignes de l'opérateur pour votre préparation avant les mesures."],
  ["smartspeed_10m","Marche sur 10 mètres","Lorsque l'opérateur vous l'indique, marchez à votre vitesse habituelle sur le parcours préparé."],
  ["forcedecks_quiet_stand","Équilibre statique","Restez debout dans les conditions prescrites par l'opérateur, avec une sécurisation adaptée."],
  ["humantrak_mobility","Mobilité","Suivez le protocole de mobilité indiqué par l'opérateur."],
  ["dynamo_grip","Force de préhension","Réalisez le test avec l'appareil de mesure sous contrôle de l'opérateur."],
  ["forcedecks_sts","Sit-to-Stand","Levez-vous et asseyez-vous selon la consigne et la cadence du protocole."],
  ["qc_release","Vérification finale","L'opérateur vérifie la qualité des mesures. Le compte rendu reste soumis à validation."]
];
let overlay=null,videoStream=null,timer=null,signalTimer=null,guestToken="",live=null,busy=false,opening=false,cameraInfo="Caméra désactivée";
let facing="environment",peer=null,peerSender=null,peerId="",pendingWatch=null,signalCursor=0,offering=false,wakeLock=null;
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
 style.id="mliveStylesheet";style.rel="stylesheet";style.href="./motion-live-guest-v1.css?v=20261109-tripod-v1";
 document.head.append(style);
}
function feedback(s){if(el("mliveFeedback"))el("mliveFeedback").textContent=s||""}
function makeOverlay(){
 injectStyles();
 overlay=document.createElement("section");
 overlay.id="mliveOverlay";overlay.className="mlive-overlay";
 overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");
 overlay.setAttribute("aria-label","Consultation Motion en direct");
 overlay.innerHTML=`
  <header class="mlive-top"><span class="mlive-brand">KŌMØ <small>PULSE · MOTION EN DIRECT</small></span><button type="button" class="mlive-close" id="mliveClose">Fermer ×</button></header>
  <div class="mlive-main">
   <div class="mlive-camera rear" id="mliveCameraFrame"><video id="mliveVideo" autoplay muted playsinline hidden></video>
    <div class="mlive-camera-hint" id="mliveCameraHint">Positionnez le téléphone sur son trépied. Activez la caméra arrière pour que l'opérateur puisse voir les mouvements depuis l'ordinateur.</div>
    <span class="mlive-camera-label" id="mliveCameraLabel">Caméra désactivée</span></div>
   <div class="mlive-panel">
    <span class="mlive-eyebrow">CONSULTATION MOTION · CANNES</span>
    <h2 id="mliveTitle">Ouverture de la session…</h2>
    <p id="mliveDescription">Votre opérateur va vous accompagner.</p>
    <div class="mlive-number"><span>CODE À COMMUNIQUER À L'OPÉRATEUR</span><strong id="mliveCode">······</strong></div>
    <div class="mlive-state"><i></i><span id="mliveState">Connexion…</span></div>
    <div class="mlive-progress" role="progressbar" aria-label="Progression de la consultation" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="mliveProgress"><i id="mliveProgressBar"></i></div>
    <p class="mlive-stage-line" id="mliveStage">Étape 0 / 8</p>
    <div class="mlive-actions">
      <button class="mlive-button secondary" type="button" id="mliveCamera">Activer et partager la caméra</button>
      <button class="mlive-button secondary" type="button" id="mliveFlip">↻ Passer à la caméra avant</button>
      <button class="mlive-button primary" type="button" id="mlivePrimary" disabled>Connexion…</button>
      <button class="mlive-button secondary" type="button" id="mliveComplete" hidden>Étape terminée →</button>
    </div>
    <p id="mliveFeedback" class="mlive-feedback" role="status" aria-live="polite"></p>
   </div>
  </div>
  <footer class="mlive-foot">Mode d'essai avec dossier fictif · Vidéo chiffrée de téléphone à ordinateur, sans enregistrement · Gardez l'écran allumé · Aucune mesure validée automatiquement</footer>`;
 document.body.append(overlay);
 el("mliveClose").onclick=close;
 el("mliveCamera").onclick=activateCamera;
 el("mliveFlip").onclick=switchCamera;
 el("mlivePrimary").onclick=primary;
 el("mliveComplete").onclick=complete;
 window.addEventListener("pagehide",stopCamera,{once:true});
}
function update(){
 if(!overlay||!live)return;
 const state=live.status,step=Number(live.step_index)||0;
 const cur=STEPS[step],running=live.progress?.step_status==="running";
 el("mliveCode").textContent=live.display_code||"······";
 el("mliveProgress").setAttribute("aria-valuenow",String(Math.round(step/STEPS.length*100)));
 el("mliveProgressBar").style.width=Math.round(step/STEPS.length*100)+"%";
 el("mliveStage").textContent=state==="completed"?"Toutes les étapes parcourues":"Étape "+Math.min(step+1,8)+" / "+STEPS.length;
 const btn=el("mlivePrimary"),done=el("mliveComplete");
 btn.hidden=false;done.hidden=true;btn.disabled=busy;
 if(state==="waiting"){
  el("mliveTitle").textContent="Votre salle Motion est ouverte.";
  el("mliveDescription").textContent="Transmettez le code à l'opérateur. Vérifiez votre environnement, puis indiquez que vous êtes prêt.";
  el("mliveState").textContent="En attente de l'opérateur";
  btn.textContent="Je suis prêt · Prévenir l'opérateur";
 }else if(state==="ready"){
  el("mliveTitle").textContent="Vous êtes prêt.";
  el("mliveDescription").textContent="L'opérateur voit votre session et doit l'associer à votre dossier avant de lancer le bilan.";
  el("mliveState").textContent="En attente du démarrage";
  btn.textContent="Prêt · En attente";btn.disabled=true;
 }else if(state==="active"&&cur){
  el("mliveTitle").textContent=cur[1];
  el("mliveDescription").textContent=cur[2];
  el("mliveState").textContent=peer?.connectionState==="connected"?"Caméra connectée à l'ordinateur":"Opérateur connecté · Étapes synchronisées";
  if(running){
   btn.hidden=true;done.hidden=false;done.disabled=busy;
   done.textContent="J'ai terminé cette étape →";
  }else btn.textContent="Commencer cette étape →";
 }else{
  el("mliveTitle").textContent="Parcours terminé.";
  el("mliveDescription").textContent="L'opérateur peut désormais contrôler et valider les résultats du bilan. Aucun score n'est publié automatiquement.";
  el("mliveState").textContent="Étapes parcourues · Validation en attente";
  btn.hidden=true;done.hidden=true;
 }
}
async function sync(){
 if(!guestToken||!overlay||busy)return;
 try{
  const data=await request({action:"guest_status",guest_token:guestToken});
  live=data.session;
  if(live.status!=="active"&&peer)resetPeer();
  update();
 }catch(error){feedback(error.message||"Synchronisation momentanément indisponible.");}
}
async function primary(){
 if(!guestToken||!live||busy)return;
 const event=live.status==="waiting"?"ready":live.status==="active"?"start":null;
 if(!event)return;
 busy=true;update();
 try{
  await request({action:"guest_event",guest_token:guestToken,event,stage_code:live.stage_code});
  await syncForced();
 }catch(error){feedback(error.message)}finally{busy=false;update()}
}
async function complete(){
 if(!guestToken||live?.status!=="active"||busy)return;
 busy=true;update();
 try{
  await request({action:"guest_event",guest_token:guestToken,event:"complete",stage_code:live.stage_code});
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
 if(!overlay||!guestToken||live?.status!=="active")return;
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
}
export async function openMotionLive(){
 if(opening)return;
 if(overlay){overlay.scrollIntoView({block:"start"});return}
 opening=true;
 try{
  makeOverlay();
  const existing=sessionStorage.getItem(STORAGE);
  if(existing&&/^[A-Za-z0-9_-]{43}$/.test(existing)){
   guestToken=existing;
   try{const data=await request({action:"guest_status",guest_token:guestToken});live=data.session;}
   catch{guestToken="";sessionStorage.removeItem(STORAGE)}
  }
  if(!guestToken){
   const data=await request({action:"guest_start"});
   guestToken=data.guest_token;sessionStorage.setItem(STORAGE,guestToken);
   live={display_code:data.display_code,status:data.status,stage_code:"preflight",step_index:0,progress:{}};
  }
  update();timer=setInterval(sync,2400);
  signalTimer=setInterval(pollSignals,1100);
 }catch(error){feedback(error.message||"Impossible d'ouvrir la consultation.");el("mliveTitle").textContent="Session momentanément indisponible."}
 finally{opening=false}
}

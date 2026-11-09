// Test-only guest room. No raw camera stream, image, audio or health measurement is uploaded.
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
let overlay=null,videoStream=null,timer=null,guestToken="",live=null,busy=false,opening=false,cameraInfo="Caméra désactivée";
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
 style.id="mliveStylesheet";style.rel="stylesheet";style.href="./motion-live-guest-v1.css?v=20261109";
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
   <div class="mlive-camera"><video id="mliveVideo" autoplay muted playsinline hidden></video>
    <div class="mlive-camera-hint" id="mliveCameraHint">Votre caméra reste sur ce téléphone. Activez-la lorsque vous êtes prêt à suivre les consignes de l'opérateur.</div>
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
      <button class="mlive-button secondary" type="button" id="mliveCamera">Activer la caméra locale</button>
      <button class="mlive-button primary" type="button" id="mlivePrimary" disabled>Connexion…</button>
      <button class="mlive-button secondary" type="button" id="mliveComplete" hidden>Étape terminée →</button>
    </div>
    <p id="mliveFeedback" class="mlive-feedback" role="status" aria-live="polite"></p>
   </div>
  </div>
  <footer class="mlive-foot">Mode d'essai avec dossier fictif · La caméra n'est ni enregistrée ni transmise · Les tests ne sont validés qu'après contrôle de l'opérateur</footer>`;
 document.body.append(overlay);
 el("mliveClose").onclick=close;
 el("mliveCamera").onclick=activateCamera;
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
  el("mliveState").textContent="Opérateur connecté · Progression partagée";
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
  live=data.session;update();feedback("");
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
async function activateCamera(){
 if(videoStream){stopCamera();return}
 if(!navigator.mediaDevices?.getUserMedia){feedback("Caméra indisponible sur cet appareil ou sans connexion HTTPS.");return}
 const b=el("mliveCamera");if(b)b.disabled=true;
 try{
  videoStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280}},audio:false});
  const video=el("mliveVideo");
  if(video){video.srcObject=videoStream;video.hidden=false;video.play().catch(()=>{});}
  el("mliveCameraHint").hidden=true;
  cameraInfo="Caméra active · locale";
  el("mliveCameraLabel").textContent=cameraInfo;
  if(b)b.textContent="Désactiver la caméra";
  feedback("");
 }catch{feedback("Autorisation caméra refusée ou appareil indisponible. Vous pouvez poursuivre avec l'opérateur sans caméra.")}
 finally{if(b)b.disabled=false}
}
function stopCamera(){
 videoStream?.getTracks().forEach(track=>track.stop());videoStream=null;
 const video=el("mliveVideo");if(video){video.srcObject=null;video.hidden=true}
 const hint=el("mliveCameraHint");if(hint)hint.hidden=false;
 const label=el("mliveCameraLabel");if(label)label.textContent="Caméra désactivée";
 const button=el("mliveCamera");if(button)button.textContent="Activer la caméra locale";
}
function close(){
 clearInterval(timer);timer=null;stopCamera();overlay?.remove();overlay=null;live=null;
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
 }catch(error){feedback(error.message||"Impossible d'ouvrir la consultation.");el("mliveTitle").textContent="Session momentanément indisponible."}
 finally{opening=false}
}

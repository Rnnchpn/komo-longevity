// Operator-side, test-only live camera monitor. No recording, snapshots or audio.
const RTC={iceServers:[{urls:"stun:stun.cloudflare.com:3478"}]};
let pane=null,pc=null,pollTimer=null,signal=null,roomId="",connectionId="",cursor=0;
let startedAt=0,polling=false,answering=false;
const get=id=>pane?.querySelector("#"+id);
function status(message){
 const node=get("mopvStatus");if(node)node.textContent=message;
}
function loadStyles(){
 if(document.getElementById("mopvStyle"))return;
 const link=document.createElement("link");
 link.id="mopvStyle";link.rel="stylesheet";
 link.href="./motion-live-operator-video-v1.css?v=20261109-tripod-v1";
 document.head.append(link);
}
function releaseConnection(notify){
 const prev=connectionId;
 clearInterval(pollTimer);pollTimer=null;
 if(pc){pc.ontrack=null;pc.onconnectionstatechange=null;pc.close();pc=null}
 const video=get("mopvVideo");if(video){video.srcObject=null;video.hidden=true}
 get("mopvPlaceholder")?.removeAttribute("hidden");
 connectionId="";cursor=0;answering=false;polling=false;
 if(notify&&prev&&signal&&roomId){
  signal({action:"operator_signal_push",session_id:roomId,connection_id:prev,kind:"stop"}).catch(()=>{});
 }
}
function close(){
 releaseConnection(true);
 pane?.remove();pane=null;signal=null;roomId="";
}
async function waitForIce(p){
 if(p.iceGatheringState==="complete")return;
 await new Promise(resolve=>{
  const finish=()=>{p.removeEventListener("icegatheringstatechange",check);clearTimeout(timeout);resolve()};
  const check=()=>{if(p.iceGatheringState==="complete")finish()};
  const timeout=setTimeout(finish,9000);
  p.addEventListener("icegatheringstatechange",check);check();
 });
}
async function receiveOffer(message){
 if(!pc||answering||message.connection_id!==connectionId)return;
 if(pc.signalingState!=="stable")return;
 answering=true;status("Connexion au flux caméra de l’iPhone…");
 const active=pc;
 try{
  await active.setRemoteDescription({type:"offer",sdp:message.payload.sdp});
  await active.setLocalDescription(await active.createAnswer());
  await waitForIce(active);
  if(pc!==active)return;
  await signal({action:"operator_signal_push",session_id:roomId,connection_id:connectionId,
   kind:"answer",payload:{sdp:active.localDescription.sdp}});
  status("Négociation terminée · réception de la vidéo…");
 }catch(error){
  status("Connexion impossible : "+(error.message||"erreur WebRTC")+". Réessayez.");
 }finally{answering=false}
}
async function poll(){
 if(!pane||!connectionId||polling)return;
 polling=true;
 try{
  const data=await signal({action:"operator_signal_pull",session_id:roomId,since:cursor});
  for(const msg of data.signals||[]){
   cursor=Math.max(cursor,Number(msg.id)||0);
   if(msg.connection_id!==connectionId)continue;
   if(msg.kind==="offer")await receiveOffer(msg);
   if(msg.kind==="stop"){releaseConnection(false);status("Caméra désactivée sur le téléphone. Réouvrez le flux lorsque le téléphone est prêt.");break}
  }
  if(pc&&pc.connectionState!=="connected"&&Date.now()-startedAt>25000)
    status("Vidéo non établie. Gardez l’iPhone ouvert et essayez le même réseau Wi-Fi, puis relancez.");
 }catch(error){status("Synchronisation vidéo : "+(error.message||"indisponible"))}
 finally{polling=false}
}
async function watch(){
 if(!pane)return;
 releaseConnection(true);
 const button=get("mopvRetry");if(button)button.disabled=true;
 try{
  if(!window.RTCPeerConnection)throw Error("WebRTC non pris en charge par ce navigateur");
  if(!crypto.randomUUID)throw Error("Une connexion HTTPS est requise");
  connectionId=crypto.randomUUID();startedAt=Date.now();
  const current=connectionId;
  const p=new RTCPeerConnection(RTC);pc=p;
  p.ontrack=event=>{
   if(pc!==p)return;
   const video=get("mopvVideo"),placeholder=get("mopvPlaceholder");
   if(!video)return;
   video.srcObject=event.streams[0]||new MediaStream([event.track]);
   video.hidden=false;
   if(placeholder)placeholder.hidden=true;
   video.play().catch(()=>status("Cliquez dans la vidéo pour activer la lecture."));
  };
  p.onconnectionstatechange=()=>{
   if(pc!==p)return;
   if(p.connectionState==="connected")status("DIRECT · Caméra de l’iPhone connectée");
   else if(p.connectionState==="failed"||p.connectionState==="disconnected")
    status("Flux interrompu. Vérifiez le Wi-Fi et appuyez sur Reconnecter.");
  };
  status("Demande envoyée au téléphone · activez le partage caméra sur l’iPhone.");
  await signal({action:"operator_signal_push",session_id:roomId,connection_id:current,kind:"watch"});
  if(pc!==p)return;
  pollTimer=setInterval(poll,1050);poll();
 }catch(error){status("Impossible d’ouvrir le flux : "+(error.message||"erreur réseau"))}
 finally{if(button)button.disabled=false}
}
function makePane(){
 loadStyles();
 pane=document.createElement("section");
 pane.id="mopvWindow";pane.className="mopv-window";
 pane.setAttribute("role","region");pane.setAttribute("aria-label","Caméra Motion connectée");
 pane.innerHTML=[
  '<div class="mopv-head"><div><small>KŌMØ PULSE · OPERATOR</small><strong>Caméra du téléphone</strong></div>',
  '<div class="mopv-head-actions"><button type="button" id="mopvExpand" aria-label="Agrandir la vidéo">Agrandir</button>',
  '<button type="button" id="mopvClose" aria-label="Fermer le flux vidéo">Fermer ×</button></div></div>',
  '<div class="mopv-screen"><video autoplay muted playsinline id="mopvVideo" hidden></video>',
  '<div id="mopvPlaceholder" class="mopv-placeholder"><div class="mopv-symbol">◉</div>',
  '<strong>En attente de la caméra</strong><p>Sur le téléphone, ouvrez Motion puis activez le partage.</p></div>',
  '<span class="mopv-live-dot">CAMÉRA LIVE · SANS ENREGISTREMENT</span></div>',
  '<div class="mopv-controls"><p id="mopvStatus" role="status" aria-live="polite">Initialisation…</p>',
  '<button type="button" id="mopvRetry">Reconnecter</button></div>',
  '<p class="mopv-hint">Vous pouvez continuer à contrôler les mesures D0 derrière cette fenêtre. Changez la caméra avant/arrière directement sur le téléphone.</p>'
 ].join("");
 document.body.append(pane);
 get("mopvClose").onclick=close;
 get("mopvRetry").onclick=watch;
 get("mopvExpand").onclick=()=>{
  pane.classList.toggle("expanded");
  get("mopvExpand").textContent=pane.classList.contains("expanded")?"Réduire":"Agrandir";
 };
 get("mopvVideo").onclick=()=>get("mopvVideo")?.play().catch(()=>{});
}
export async function openMotionOperatorVideo(config){
 if(!config||typeof config.signal!=="function"||!config.sessionId)throw Error("Séance caméra non définie");
 if(pane&&roomId===config.sessionId){pane.scrollIntoView({block:"nearest"});return}
 close();signal=config.signal;roomId=config.sessionId;
 makePane();
 await watch();
}
window.addEventListener("pagehide",close);
window.addEventListener("pulse:operator-signout",close);

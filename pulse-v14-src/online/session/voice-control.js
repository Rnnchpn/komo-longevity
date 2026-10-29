import {parseVoiceCommand} from './voice-commands.mjs';

// SpeechRecognition requests microphone access; the browser may send speech to its
// own recognition provider. KŌMØ never stores audio or transcripts in Pulse.
export function createVoiceControl({onCommand,onStatus}){
 const Ctor=window.SpeechRecognition||window.webkitSpeechRecognition;
 let enabled=false,instance=null,restartTimer=null,starting=false,disposed=false,lastCommandAt=0;
 const supported=Boolean(Ctor);
 const status=(text,state='idle')=>{if(!disposed)onStatus?.(text,state)};
 function clearRetry(){if(restartTimer!==null){clearTimeout(restartTimer);restartTimer=null;}}
 function stopRecognizer(){
  clearRetry();
  if(instance){
   try{instance.onend=null;instance.onresult=null;instance.onerror=null;instance.abort();}catch{}
   instance=null;
  }
  starting=false;
 }
 function disable(){
  enabled=false;stopRecognizer();
  status('Microphone désactivé. Vous pouvez utiliser les boutons à l’écran.','off');
 }
 function listen(){
  if(!enabled||disposed||starting||instance||document.hidden)return;
  let rec;
  try{
   rec=new Ctor();
   rec.lang='fr-FR';rec.continuous=true;rec.interimResults=false;rec.maxAlternatives=1;
   instance=rec;starting=true;
   rec.onstart=()=>{starting=false;status('Micro actif · dites « C’est parti », « Stop », « Recommencer » ou « Suivant ».','listening')};
   rec.onresult=event=>{
    for(let i=event.resultIndex;i<event.results.length;i++){
     const result=event.results[i];
     if(!result?.isFinal)continue;
     const command=parseVoiceCommand(result[0]?.transcript||'');
     if(!command)continue;
     const now=performance.now();
     if(now-lastCommandAt<1150)continue;
     lastCommandAt=now;
     onCommand(command);
     break;
    }
   };
   rec.onerror=event=>{
    const type=event.error||'';
    if(['not-allowed','service-not-allowed','audio-capture','language-not-supported'].includes(type)){
     enabled=false;stopRecognizer();
     status('Microphone non disponible ou accès refusé. Réessayez depuis les réglages du navigateur.','error');
    }else if(type==='network'){
     enabled=false;stopRecognizer();
     status('Reconnaissance vocale interrompue : connexion réseau indisponible. Utilisez les boutons.','error');
    }else if(type==='no-speech'){
     status('Écoute active · parlez clairement vers le microphone.','listening');
    }
   };
   rec.onend=()=>{
    instance=null;starting=false;
    if(!enabled||disposed||document.hidden)return;
    status('Reprise de l’écoute vocale…','reconnecting');
    clearRetry();
    restartTimer=setTimeout(()=>{restartTimer=null;listen()},450);
   };
   rec.start();
   status('Autorisation du microphone demandée au navigateur…','connecting');
  }catch(error){
   enabled=false;stopRecognizer();
   status('Impossible de démarrer la reconnaissance vocale. Utilisez le bouton « C’est parti ».','error');
  }
 }
 function enable(){
  if(!supported){status('Reconnaissance vocale indisponible dans ce navigateur. Les commandes à l’écran restent utilisables.','unsupported');return false;}
  if(disposed)return false;
  enabled=true;lastCommandAt=0;
  listen();
  return true;
 }
 function suspend(){
  // Stop when backgrounded. Restart is attempted on return only if explicitly enabled.
  if(!enabled)return;
  stopRecognizer();status('Micro en pause : onglet inactif.','paused');
 }
 function resume(){if(enabled&&!disposed)listen();}
 function destroy(){disposed=true;enabled=false;stopRecognizer();}
 return {supported,enable,disable,suspend,resume,destroy,isEnabled:()=>enabled};
}

import {createPoseEngine} from './pose-engine.js';
import {createMovementTracker} from './metrics.mjs';
import {createVoiceControl} from './voice-control.js';
import {TEST_GUIDES} from './test-guides.mjs';
import {createCaptureEnhancements} from './capture-enhancements.js';

// Guided browser-only capture. The observer must remain visible to count repetitions.
export function mountMotionController(root,task,record,state,callbacks){
 const q=s=>root.querySelector(s);
 const video=q('#live-video'),canvas=q('#pose-canvas'),off=q('#camera-off');
 const on=q('#start-camera'),stop=q('#stop-camera'),go=q('#start-test'),redo=q('#redo-test'),halt=q('#halt-test');
 const voiceConsent=q('#voice-consent'),voiceButton=q('#toggle-voice'),voiceState=q('#voice-state'),readButton=q('#read-guidance'),distanceButton=q('#distance-view'),voiceHud=q('#voice-hud'),voiceHudText=q('#voice-hud-text');
 distanceButton.onclick=()=>{
  const workspace=q('.motion-workspace');
  const active=workspace.classList.toggle('distance-mode');
  distanceButton.setAttribute('aria-pressed',String(active));
  distanceButton.textContent=active?'⛶ Afficher les consignes':'⛶ Mode à distance';
  if(active){q('#camera-screen')?.scrollIntoView({behavior:'smooth',block:'center'});}
 };
 const consent=q('#pose-consent');
 consent.onchange=()=>{on.disabled=!consent.checked||Boolean(state.stream);};
 const tracker=createMovementTracker(task.id);
 state.tracker=tracker;state.bodyReady=false;state.sessionActive=false;state.sessionFinished=false;state.countdownActive=false;
 let validStreak=0,lastMessageAt=0,disposed=false;
 let readingInstructions=false;
 const voice=createVoiceControl({
  onCommand(command){
   if(disposed)return;
   if(command==='start'){
    if(!go.disabled&&!state.sessionActive){status('Commande vocale reçue : démarrage du test.');go.click();}
    else status('« C’est parti » entendu, mais attendez que votre corps soit détecté et que le test soit prêt.');
   }else if(command==='stop'){
    if(state.sessionActive){finish(true);}
    else status('Aucun test en cours à arrêter.');
   }else if(command==='redo'){
    if(state.sessionActive){finish(true);}
    if(state.sessionFinished){redo.click();status('Test réinitialisé. Dites « C’est parti » quand vous êtes prêt.');}
    else status('Activez votre caméra et attendez la détection avant de recommencer.');
   }else if(command==='next'){
    if(state.sessionFinished){q('#go')?.click();}
    else status('Terminez ou arrêtez d’abord le test avant de passer au suivant.');
   }
  },
  onStatus(text,mode){
   if(voiceState){voiceState.textContent=text;voiceState.dataset.state=mode;}
   if(voiceHud){voiceHud.hidden=!['listening','connecting','reconnecting','paused'].includes(mode);}
   if(voiceHudText){voiceHudText.textContent=mode==='listening'?'À l’écoute':mode==='paused'?'En pause':mode==='connecting'||mode==='reconnecting'?'Connexion…':'Micro inactif';}
   if(voiceButton)voiceButton.textContent=mode==='listening'?'🎙 Désactiver le microphone':
     mode==='connecting'||mode==='reconnecting'?'🎙 Connexion du microphone…':'🎙 Activer les commandes vocales';
  }
 });
 voiceConsent.onchange=()=>{
  if(!voiceConsent.checked){voice.disable();voiceButton.disabled=true;}
  else voiceButton.disabled=!voice.supported;
 };
 if(!voice.supported){
  voiceButton.disabled=true;
  voiceState.textContent='Reconnaissance vocale indisponible ici. Utilisez Chrome ou Safari récent, ou les boutons.';
 }
 voiceButton.onclick=()=>{
  if(!voice.supported||disposed)return;
  if(voice.isEnabled()){voice.disable();return;}
  if(!voiceConsent.checked){voiceState.textContent='Acceptez d’abord l’accès au micro.';return;}
  if(readingInstructions){voiceState.textContent='Terminez la lecture des consignes avant d’activer le micro.';return;}
  voice.enable();
 };
 readButton.onclick=()=>{
  if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance){
   q('#guide-audio-status').textContent='Lecture audio indisponible sur ce navigateur.';
   return;
  }
  if(voice.isEnabled()){
   q('#guide-audio-status').textContent='Désactivez d’abord les commandes vocales pour éviter que le micro entende les consignes.';
   return;
  }
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(TEST_GUIDES[task.id].audio);
  utterance.lang='fr-FR';utterance.rate=.94;
  readingInstructions=true;
  q('#guide-audio-status').textContent='Lecture des consignes en cours…';
  utterance.onend=()=>{readingInstructions=false;if(q('#guide-audio-status'))q('#guide-audio-status').textContent='Consignes terminées.';};
  utterance.onerror=()=>{readingInstructions=false;if(q('#guide-audio-status'))q('#guide-audio-status').textContent='Lecture indisponible. Consultez les instructions affichées.';};
  window.speechSynthesis.speak(utterance);
 };
 const enhancements=createCaptureEnhancements({root,task,voice,state,record});
 const info=s=>{const e=q('#camera-message');if(e)e.textContent=s};
 const status=s=>{const e=q('#motion-status');if(e)e.textContent=s};
 const value=n=>{
  record.value=Math.max(0,Math.min(120,Math.round(n)));
  for(const id of ['#value','#manual-value','#camera-reps']){const e=q(id);if(e)e.textContent=String(record.value);}
 };
 function finish(interrupted=false){
  clearInterval(state.timer);state.timer=null;state.sessionActive=false;state.sessionFinished=true;
  enhancements.stopCountdown();
  const posture=task.id==='posture'?enhancements.postureSummary():null;
  const stats=posture?{visibilityRatio:posture.validRatio/100}:tracker.summary();
  if(task.id==='balance')value(task.seconds*stats.visibilityRatio);
  if(posture){record.posture=posture;value(posture.goodFrames);enhancements.renderPosture(posture);}
  record.status=!interrupted&&stats.visibilityRatio>=.55&&(!posture||posture.valid)?'done':'review';
  record.quality=Math.round(stats.visibilityRatio*100);record.source=posture?'posture 2D webcam':'webcam';
  state.results[task.id]=record;
  go.disabled=true;go.textContent=interrupted?'Test arrêté':'Test terminé';redo.hidden=false;halt.hidden=true;
  status(interrupted?'Test arrêté à la voix ou au bouton. Résultat partiel à vérifier ou recommencer.':
   stats.visibilityRatio>=.55?'Mesure automatique terminée. Vérifiez le résultat avant de continuer.':
   'Image partiellement perdue : résultat à vérifier ou recommencer.');
  enhancements.completed(interrupted);
 }
 function stopCapture(){
  state.sessionActive=false;
  enhancements.stopCountdown();
  if(state.timer){clearInterval(state.timer);state.timer=null;}
  state.request++;
  if(state.engine){state.engine.stop();state.engine=null;}
  if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}
  video.pause();video.srcObject=null;video.hidden=true;canvas.hidden=true;off.hidden=false;
  state.bodyReady=false;on.disabled=!consent.checked;stop.disabled=true;
  go.disabled=true;validStreak=0;
  halt.hidden=true;
 }
 function sample(points,time){
  if(disposed||document.hidden)return;
  const result=task.id==='posture'?enhancements.detect(points):tracker.observe(points,time);
  validStreak=result.valid?Math.min(9,validStreak+1):0;
  state.bodyReady=validStreak>=3;
  const tag=q('#pose-quality'),hud=q('#camera-hud');
  if(hud)hud.hidden=false;
  if(tag){tag.textContent=result.message;tag.classList.toggle('tracked',state.bodyReady);}
  if(!state.sessionActive&&!state.sessionFinished)go.disabled=!state.bodyReady;
  if(time-lastMessageAt>580){info(result.valid?'33 points détectés · traitement local · caméra fixe':result.message);lastMessageAt=time;}
  if(!state.sessionActive||!result.valid)return;
  if(task.id==='posture')value(result.goodFrames||0);
  else if(task.id!=='balance'){
   enhancements.onCount(result.count);
   value(result.count);
  }else value(Math.min(task.seconds,(time-state.startedAt)/1000)*tracker.summary().visibilityRatio);
 }
 on.onclick=async()=>{
  if(!consent.checked){info('Autorisez d’abord la détection du mouvement.');return;}
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){
    info('Caméra indisponible : ouvrez la page avec HTTPS sur un navigateur récent.');return;
  }
  enhancements.unlock();on.disabled=true;const ticket=++state.request;
  let opened=null;
  try{
   info('Autorisez la caméra puis patientez pendant le chargement du détecteur…');
   opened=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:1280},height:{ideal:720},frameRate:{ideal:20,max:24}}});
   if(ticket!==state.request||disposed){opened.getTracks().forEach(t=>t.stop());return;}
   state.stream=opened;video.srcObject=opened;video.hidden=false;off.hidden=true;stop.disabled=false;
   await video.play();
   info('Chargement de MediaPipe…');
   const engine=await createPoseEngine(video,canvas,sample,()=>{
     status('Le détecteur s’est interrompu. Vous pouvez relancer la caméra.');
     stopCapture();
   });
   if(ticket!==state.request||disposed){engine.stop();return;}
   state.engine=engine;canvas.hidden=false;info('En cours : placez votre corps entier dans le cadre.');
  }catch(error){
   if(opened)opened.getTracks().forEach(t=>t.stop());
   if(ticket!==state.request||disposed)return;
   stopCapture();
   info(error?.name==='NotAllowedError'?'Accès refusé : autorisez la caméra depuis les paramètres du navigateur.':
     'La caméra ou le détecteur n’a pas démarré. Vérifiez la connexion et réessayez.');
  }
 };
 stop.onclick=()=>{voice.disable();stopCapture();info('Caméra éteinte. Micro et caméra coupés. Aucune vidéo enregistrée.');status('Activez la caméra pour reprendre.');};
 go.onclick=()=>{
  if(!state.bodyReady||!state.engine||!state.stream||state.sessionActive||state.countdownActive||disposed)return;
  enhancements.unlock();record.status='pending';record.source='webcam';
  go.disabled=true;go.textContent='3, 2, 1…';redo.hidden=true;halt.hidden=false;
  status('Départ dans trois secondes. Attendez « Top ! » avant de bouger.');
  void enhancements.begin(()=>{
   if(disposed||!state.stream||!state.engine)return;
   tracker.reset();enhancements.reset();value(0);
   state.sessionActive=true;state.sessionFinished=false;
   state.startedAt=performance.now();state.remaining=task.seconds;
   go.textContent='Analyse en cours…';
   q('#camera-live-score').hidden=false;
   status(task.id==='sts'?'Top ! Relevez-vous puis rasseyez-vous à votre rythme.':
     task.id==='posture'?'Top ! Restez face à la caméra dans une position naturelle.':
     'Top ! Réalisez les mouvements doucement et en sécurité.');
   state.timer=setInterval(()=>{
    if(!state.sessionActive)return;
    const elapsed=Math.min(task.seconds,(performance.now()-state.startedAt)/1000);
    state.remaining=Math.max(0,Math.ceil(task.seconds-elapsed));
    q('#time').textContent=String(state.remaining);
    enhancements.onRemaining(state.remaining);
    if(elapsed>=task.seconds)finish();
   },100);
  },()=>{
    go.disabled=!state.bodyReady;go.textContent='C’est parti →';halt.hidden=true;
  });
 };
 redo.onclick=()=>{
  enhancements.stopCountdown();enhancements.reset();
  state.sessionActive=false;state.sessionFinished=false;
  if(state.timer){clearInterval(state.timer);state.timer=null;}
  tracker.reset();state.remaining=task.seconds;value(0);
  q('#time').textContent=String(task.seconds);
  go.disabled=!state.bodyReady;go.textContent='C’est parti →';
  redo.hidden=true;halt.hidden=true;status('Prêt pour une nouvelle mesure.');
 };
 if(task.id!=='posture'){
  q('#plus').onclick=()=>{value((record.value||0)+1);record.source='corrigé manuellement';};
  q('#minus').onclick=()=>{value((record.value||0)-1);record.source='corrigé manuellement';};
 }
 halt.onclick=()=>{
  if(state.countdownActive){enhancements.stopCountdown();halt.hidden=true;go.disabled=!state.bodyReady;go.textContent='C’est parti →';status('Départ annulé. Dites « C’est parti » pour recommencer.');}
  else if(state.sessionActive)finish(true);
 };
 q('#skip').onclick=()=>{stopCapture();record.status='skipped';record.value=0;record.source='non réalisé';state.results[task.id]=record;callbacks.advance();};
 q('#go').onclick=()=>{
  if(!state.sessionFinished){
   q('#message').textContent='Cliquez « C’est parti », terminez le test ou choisissez « Ne pas faire ».';
   return;
  }
  if(record.status!=='review')record.status='done';
  state.results[task.id]=record;stopCapture();callbacks.advance();
 };
 q('#back').onclick=()=>{stopCapture();callbacks.back();};
 return ()=>{
  if(disposed)return;
  disposed=true;
  voice.destroy();enhancements.destroy();
  if('speechSynthesis' in window){try{window.speechSynthesis.cancel();}catch{}}
  stopCapture();
 };
}

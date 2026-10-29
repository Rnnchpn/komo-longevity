import {createPoseEngine} from './pose-engine.js';
import {createMovementTracker} from './metrics.mjs';

// Guided browser-only capture. The observer must remain visible to count repetitions.
export function mountMotionController(root,task,record,state,callbacks){
 const q=s=>root.querySelector(s);
 const video=q('#live-video'),canvas=q('#pose-canvas'),off=q('#camera-off');
 const on=q('#start-camera'),stop=q('#stop-camera'),go=q('#start-test'),redo=q('#redo-test');
 const tracker=createMovementTracker(task.id);
 state.tracker=tracker;state.bodyReady=false;state.sessionActive=false;state.sessionFinished=false;
 let validStreak=0,lastMessageAt=0,disposed=false;
 const info=s=>{const e=q('#camera-message');if(e)e.textContent=s};
 const status=s=>{const e=q('#motion-status');if(e)e.textContent=s};
 const value=n=>{
  record.value=Math.max(0,Math.min(120,Math.round(n)));
  for(const id of ['#value','#manual-value','#camera-reps']){const e=q(id);if(e)e.textContent=String(record.value);}
 };
 function finish(){
  clearInterval(state.timer);state.timer=null;state.sessionActive=false;state.sessionFinished=true;
  const stats=tracker.summary();
  if(task.id==='balance')value(task.seconds*stats.visibilityRatio);
  record.status=stats.visibilityRatio>=.55?'done':'review';
  record.quality=Math.round(stats.visibilityRatio*100);record.source='webcam';
  state.results[task.id]=record;
  go.disabled=true;go.textContent='Test terminé';redo.hidden=false;
  status(stats.visibilityRatio>=.55?'Mesure automatique terminée. Vérifiez le résultat avant de continuer.':
    'Image partiellement perdue : résultat à vérifier ou recommencer.');
 }
 function stopCapture(){
  state.sessionActive=false;
  if(state.timer){clearInterval(state.timer);state.timer=null;}
  state.request++;
  if(state.engine){state.engine.stop();state.engine=null;}
  if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}
  video.pause();video.srcObject=null;video.hidden=true;canvas.hidden=true;off.hidden=false;
  state.bodyReady=false;on.disabled=false;stop.disabled=true;
  go.disabled=true;validStreak=0;
 }
 function sample(points,time){
  if(disposed||document.hidden)return;
  const result=tracker.observe(points,time);
  validStreak=result.valid?Math.min(9,validStreak+1):0;
  state.bodyReady=validStreak>=3;
  const tag=q('#pose-quality'),hud=q('#camera-hud');
  if(hud)hud.hidden=false;
  if(tag){tag.textContent=result.message;tag.classList.toggle('tracked',state.bodyReady);}
  if(!state.sessionActive&&!state.sessionFinished)go.disabled=!state.bodyReady;
  if(time-lastMessageAt>580){info(result.valid?'33 points détectés · traitement local · caméra fixe':result.message);lastMessageAt=time;}
  if(!state.sessionActive||!result.valid)return;
  if(task.id!=='balance')value(result.count);
  else value(Math.min(task.seconds,(time-state.startedAt)/1000)*tracker.summary().visibilityRatio);
 }
 on.onclick=async()=>{
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){
    info('Caméra indisponible : ouvrez la page avec HTTPS sur un navigateur récent.');return;
  }
  on.disabled=true;const ticket=++state.request;
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
 stop.onclick=()=>{stopCapture();info('Caméra éteinte. Aucune vidéo enregistrée.');status('Activez la caméra pour reprendre.');};
 go.onclick=()=>{
  if(!state.bodyReady||!state.engine||!state.stream||state.sessionActive)return;
  tracker.reset();value(0);record.status='pending';record.source='webcam';
  state.sessionActive=true;state.sessionFinished=false;
  state.startedAt=performance.now();state.remaining=task.seconds;
  go.disabled=true;go.textContent='Analyse en cours…';redo.hidden=true;
  q('#camera-live-score').hidden=false;
  status(task.id==='sts'?'Asseyez-vous, puis relevez-vous et rasseyez-vous sans vous précipiter.':
    'Réalisez les mouvements à votre rythme et en sécurité.');
  state.timer=setInterval(()=>{
   if(!state.sessionActive)return;
   const elapsed=Math.min(task.seconds,(performance.now()-state.startedAt)/1000);
   state.remaining=Math.max(0,Math.ceil(task.seconds-elapsed));
   q('#time').textContent=String(state.remaining);
   if(elapsed>=task.seconds)finish();
  },100);
 };
 redo.onclick=()=>{
  state.sessionActive=false;state.sessionFinished=false;
  if(state.timer){clearInterval(state.timer);state.timer=null;}
  tracker.reset();state.remaining=task.seconds;value(0);
  q('#time').textContent=String(task.seconds);
  go.disabled=!state.bodyReady;go.textContent='C’est parti →';
  redo.hidden=true;status('Prêt pour une nouvelle mesure.');
 };
 q('#plus').onclick=()=>{value((record.value||0)+1);record.source='corrigé manuellement';};
 q('#minus').onclick=()=>{value((record.value||0)-1);record.source='corrigé manuellement';};
 q('#skip').onclick=()=>{stopCapture();record.status='skipped';record.value=0;record.source='non réalisé';state.results[task.id]=record;callbacks.advance();};
 q('#go').onclick=()=>{
  if(!state.sessionFinished&&record.source!=='corrigé manuellement'){
   q('#message').textContent='Cliquez « C’est parti », terminez le test ou choisissez « Ne pas faire ».';
   return;
  }
  if(record.status!=='review')record.status='done';
  state.results[task.id]=record;stopCapture();callbacks.advance();
 };
 q('#back').onclick=()=>{stopCapture();callbacks.back();};
 return stopCapture;
}

import {createPoseEngine} from './pose-engine.js';
import {createOneLegObserver} from './unipodal-metrics.mjs';
import {createAudioFeedback} from './audio-feedback.js';
import {createVoiceControl} from './voice-control.js';
import {TEST_GUIDES} from './test-guides.mjs';

// Automatic observational one-legged stand; video and measurements remain local.
// Not an assessment of falls risk, postural sway, or a validated balance score.
export function mountUnipodal(root,task,record,state,callbacks){
 const q=s=>root.querySelector(s),video=q('#live-video'),overlay=q('#pose-canvas'),off=q('#camera-off');
 const start=q('#start-camera'),stop=q('#stop-camera'),go=q('#start-test'),redo=q('#redo-test'),halt=q('#halt-test'),next=q('#go'),consent=q('#pose-consent');
 const voiceConsent=q('#voice-consent'),voiceButton=q('#toggle-voice'),voiceLabel=q('#voice-state');
 const observer=createOneLegObserver(task.id.endsWith('left')?'left':'right');
 const audio=createAudioFeedback();
 let disposed=false,lastFrame=0,started=false,completed=false;
 const text=(id,v)=>{const el=q(id);if(el)el.textContent=v;};
 const enabled=()=>Boolean(q('#sound-enabled')?.checked);
 function end(interrupted=false){
  if(completed||!started)return;
  completed=true;state.sessionActive=false;
  if(state.timer){clearInterval(state.timer);state.timer=null;}
  const s=observer.summary();record.value=s.seconds;record.quality=s.quality;
  record.status=interrupted||s.seconds<1.5||s.quality<65?'review':'done';record.source='webcam unipodale, temps apparent';
  state.results[task.id]=record;
  text('#value',s.seconds.toFixed(1));text('#camera-reps',s.seconds.toFixed(1));
  next.disabled=false;redo.hidden=false;halt.hidden=true;
  text('#motion-status',interrupted?'Capture interrompue. Temps partiel, à vérifier.':'Pied reposé ou test terminé. Vérifiez le temps observé.');
  if(enabled()){audio.chime();void audio.say('Test terminé',{timeout:1200});}
 }
 const stopCamera=()=>{
  state.request++;state.sessionActive=false;
  if(state.timer){clearInterval(state.timer);state.timer=null;}
  if(state.engine){state.engine.stop();state.engine=null;}
  if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}
  video.pause();video.srcObject=null;video.hidden=true;overlay.hidden=true;off.hidden=false;stop.disabled=true;start.disabled=!consent.checked;
 };
 const voice=createVoiceControl({
  onCommand(command){
   if(command==='stop'&&state.sessionActive)end(true);
   if(command==='redo'&&completed)redo.click();
   if(command==='next'&&completed)next.click();
  },
  onStatus(s,mode){
   voiceLabel.textContent=s;
   voiceButton.textContent=mode==='listening'?'🎙 Désactiver micro':'🎙 Activer micro';
   const hud=q('#voice-hud');hud.hidden=!['listening','connecting'].includes(mode);
   text('#voice-hud-text',mode==='listening'?'À l’écoute':'Connexion…');
  }
 });
 const voiceButtonEnabled=voice.supported;
 voiceConsent.onchange=()=>{
  if(!voiceConsent.checked){voice.disable();voiceButton.disabled=true;}
  else voiceButton.disabled=!voiceButtonEnabled;
 };
 voiceButton.onclick=()=>{if(!voiceConsent.checked)return;if(voice.isEnabled())voice.disable();else voice.enable();};
 consent.onchange=()=>{start.disabled=!consent.checked||!!state.stream;};
 go.hidden=true;q('#time').textContent='20';
 text('#value','0.0');
 q('#value').parentElement.querySelector('.overline').textContent='TEMPS SUR UN PIED (S)';
 q('#camera-live-label').textContent='secondes observées';
 next.disabled=true;
 text('#motion-status','Départ automatique : levez doucement le pied opposé à la jambe d’appui, à côté d’un support stable.');
 const read=q('#read-guidance');
 read.onclick=()=>{
  if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance)return;
  if(voice.isEnabled()){text('#guide-audio-status','Désactivez le micro pour écouter les consignes.');return;}
  window.speechSynthesis.cancel();
  const speech=new SpeechSynthesisUtterance(TEST_GUIDES[task.id].audio);
  speech.lang='fr-FR';speech.rate=.95;window.speechSynthesis.speak(speech);
 };
 q('#distance-view').onclick=()=>{
  const el=q('.motion-workspace'),active=el.classList.toggle('distance-mode');
  q('#distance-view').textContent=active?'⛶ Afficher les consignes':'⛶ Mode à distance';
 };
 function observe(points,time){
  if(disposed||document.hidden||completed)return;
  lastFrame=time;
  const f=observer.observe(points,time);
  const hud=q('#camera-hud');hud.hidden=false;
  text('#pose-quality',f.message);
  if(!started&&f.started){
   started=true;state.sessionActive=true;
   q('#camera-live-score').hidden=false;halt.hidden=false;
   if(enabled()){audio.unlock();audio.chime();}
   text('#motion-status','Chronomètre parti automatiquement. Restez près de l’appui. Posez le pied pour terminer.');
   state.timer=setInterval(()=>{if(state.sessionActive&&performance.now()-lastFrame>950)end(true);},300);
  }
  if(started){
   const seconds=f.seconds.toFixed(1);record.value=f.seconds;
   text('#value',seconds);text('#camera-reps',seconds);
   text('#time',String(Math.max(0,Math.ceil(20-f.seconds))));
   if(f.stopped)end(!f.valid);
  }else{
   text('#motion-status',f.lifted?'Pied détecté en l’air · stabilisez-vous sans forcer.':
      'Levez légèrement un pied près d’un appui. Le test démarre quand la position est reconnue.');
  }
 }
 start.onclick=async()=>{
  if(!consent.checked||disposed)return;
  const ticket=++state.request;start.disabled=true;audio.unlock();
  let stream;
  try{
   stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});
   if(disposed||ticket!==state.request){stream.getTracks().forEach(t=>t.stop());return;}
   state.stream=stream;video.srcObject=stream;video.hidden=false;off.hidden=true;stop.disabled=false;await video.play();
   const engine=await createPoseEngine(video,overlay,observe,()=>{
    if(started)end(true);stopCamera();text('#camera-message','Détection interrompue. Réactivez la caméra.');
   });
   if(disposed||ticket!==state.request){engine.stop();return;}
   state.engine=engine;overlay.hidden=false;
   text('#camera-message','Vue de face · pieds visibles · support stable à proximité.');
  }catch(e){
   if(stream)stream.getTracks().forEach(t=>t.stop());
   if(disposed||ticket!==state.request)return;
   stopCamera();text('#camera-message',e.name==='NotAllowedError'?'Accès caméra refusé.':'Caméra non disponible.');
  }
 };
 stop.onclick=()=>{if(started&&!completed)end(true);voice.disable();stopCamera();};
 halt.onclick=()=>{if(started&&!completed)end(true);};
 redo.onclick=()=>{
  observer.reset();started=false;completed=false;record.status='pending';record.value=0;
  next.disabled=true;redo.hidden=true;halt.hidden=true;
  text('#time','20');text('#value','0.0');text('#camera-reps','0');
  text('#motion-status','Reposez les deux pieds, puis soulevez à nouveau le pied opposé.');
 };
 next.onclick=()=>{if(!completed)return;stopCamera();callbacks.advance();};
 q('#skip').onclick=()=>{stopCamera();record.status='skipped';record.value=0;callbacks.advance();};
 q('#back').onclick=()=>{stopCamera();callbacks.back();};
 return ()=>{
  if(disposed)return;disposed=true;voice.destroy();audio.destroy();stopCamera();
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
 };
}

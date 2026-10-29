import {createPoseEngine} from './pose-engine.js';
import {sharedMotionMedia} from './shared-media.js';
import {createSideProfileStability,surfaceSagittalIndex} from './profile-photo-metrics.mjs';

// Automatic PHOTO OF SURFACE PROFILE, not radiographic SVA.
// Photo is an in-memory canvas and vanishes on navigation; no server uploads.
export function mountSideProfilePhoto(root,task,record,state,callbacks){
 const q=s=>root.querySelector(s),video=q('#live-video'),overlay=q('#pose-canvas'),off=q('#camera-off');
 const start=q('#start-camera'),stop=q('#stop-camera'),redo=q('#redo-test'),next=q('#go'),consent=q('#pose-consent'),halt=q('#halt-test'),status=q('#motion-status');
 const reader=q('#read-guidance'),distance=q('#distance-view');
 let disposed=false,locked=false,frame=null,base=null,display=null,markers=null,which='neck',adjusted=false,manualCaptured=false,latestProfile=null,validStreak=0,countdownRunning=false,validSince=null;
 const stability=createSideProfileStability(900);
 const countCover=q('#countdown-cover'),countValue=q('#countdown-value');
 const hideCountdown=()=>{countdownRunning=false;if(countCover)countCover.hidden=true;};
 const cancelCountdown=()=>{sharedMotionMedia.cancelPostureCountdown();hideCountdown();};
 const snap=document.createElement('canvas');snap.id='profile-photo';snap.className='profile-photo';snap.hidden=true;snap.setAttribute('aria-label','Photo de profil locale avec deux repères de surface');
 q('#camera-screen').append(snap);
 const panel=q('#posture-results'),data=q('#posture-data');
 const instruction='Mettez-vous simplement de profil, pieds visibles. Un décompte 3, 2, 1 démarre seul quand vous êtes stable. Photo automatique à « Top ! ».';
 q('#camera-live-score').hidden=true;
 q('#camera-hud').hidden=true;
 const manual=q('#start-test');manual.hidden=false;manual.disabled=true;manual.textContent='Prendre une photo maintenant';
 q('#time').textContent='AUTO';
 q('#value').textContent='—';
 q('#value').parentElement.querySelector('.overline').textContent='PHOTO DE PROFIL';
 status.textContent='Placez-vous de profil, pieds visibles. Pulse lancera automatiquement 3, 2, 1 et prendra la photo.';
 consent.checked=sharedMotionMedia.cameraConsent();
 consent.onchange=()=>{
  if(!consent.checked)stopTracks(true);
  start.disabled=!consent.checked||Boolean(sharedMotionMedia.getStream());
 };
 if(reader)reader.onclick=()=>{
  if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance)return;
  window.speechSynthesis.cancel();
  const utter=new SpeechSynthesisUtterance('Observation sagittale en photo. Placez la caméra bien droite, de profil, à hauteur du bassin. Gardez votre tête, épaules, bassin, genoux et pieds dans le cadre. Restez immobile quelques secondes : la photo se prendra automatiquement. Vous pourrez ensuite ajuster les deux repères de surface. Ce n’est pas une S V A radiographique.');
  utter.lang='fr-FR';utter.rate=.96;window.speechSynthesis.speak(utter);
 };
 if(distance)distance.onclick=()=>{
  const active=q('.motion-workspace').classList.toggle('distance-mode');
  distance.textContent=active?'⛶ Afficher les consignes':'⛶ Mode à distance';distance.setAttribute('aria-pressed',String(active));
 };
 // No microphone required for automatic photo; hide legacy voice command controls.
 const voice=q('#voice-panel');if(voice)voice.hidden=true;
 const voiceHud=q('#voice-hud');
 if(voiceHud){voiceHud.hidden=!sharedMotionMedia.hasVoiceConsent();
  const label=q('#voice-hud-text');if(label&&sharedMotionMedia.hasVoiceConsent())label.textContent='Micro actif · toute la séance';}
 const stopTracks=(release=false)=>{
  cancelCountdown();state.request++;
  if(state.engine){state.engine.stop();state.engine=null;}
  if(release)sharedMotionMedia.stopAll();
  sharedMotionMedia.detachVideo(video);state.stream=sharedMotionMedia.getStream();overlay.hidden=true;
  start.disabled=!consent.checked;stop.disabled=true;state.bodyReady=false;
 };
 const draw=()=>{
  if(!base)return;
  snap.width=base.width;snap.height=base.height;
  const ctx=snap.getContext('2d');
  ctx.drawImage(base,0,0);
  if(!markers?.neck||!markers?.pelvis||!(frame?.height>.2))return;
  const positions=[['Repère cervical de surface',markers.neck,'#eecf8d'],['Repère pelvien de surface',markers.pelvis,'#b4eac3']];
  ctx.lineWidth=Math.max(3,snap.width/210);
  ctx.setLineDash([Math.max(9,snap.width/80),Math.max(5,snap.width/130)]);
  const xA=markers.neck.x*snap.width,xB=markers.pelvis.x*snap.width;
  ctx.strokeStyle='#f8e9ca';ctx.beginPath();ctx.moveTo(xA,0);ctx.lineTo(xA,snap.height);ctx.stroke();
  ctx.strokeStyle='#b4eac3';ctx.beginPath();ctx.moveTo(xB,0);ctx.lineTo(xB,snap.height);ctx.stroke();
  ctx.setLineDash([]);
  for(const [title,p,color] of positions){
   const x=p.x*snap.width,y=p.y*snap.height;
   ctx.beginPath();ctx.arc(x,y,Math.max(7,snap.width/115),0,2*Math.PI);
   ctx.fillStyle=color;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#1d4932';ctx.stroke();
   ctx.fillStyle='#fff';ctx.font='bold '+Math.max(13,Math.floor(snap.width/50))+'px sans-serif';
   ctx.fillText(title,x+13,Math.max(25,y-12));
  }
  const offset=surfaceSagittalIndex(markers.neck,markers.pelvis,frame.height);
  record.posture={valid:true,method:'photo sagittale 2D',surfaceIndexPct:offset,
   adjusted,manualCapture:manualCaptured,neck:{...markers.neck},pelvis:{...markers.pelvis},height:frame.height};
  record.status=manualCaptured?'review':'done';record.source='photo locale, repères de surface';
  record.value=offset;
  state.results[task.id]=record;
  next.disabled=false;
  callbacks.checkpoint?.();
  q('#value').textContent=offset.toFixed(1)+' %';
  const items=[['Écart horizontal apparent',offset.toFixed(1)+' %'],['Méthode','Photo de profil 2D'],
   ['Repère supérieur','Jonction cou–épaule (estimée)'],['Repère inférieur','Région pelvienne (estimée)']];
  data.replaceChildren();
  for(const [key,value] of items){const cell=document.createElement('div'),k=document.createElement('span'),v=document.createElement('strong');
   k.textContent=key;v.textContent=value;cell.append(k,v);data.append(cell);}
  panel.hidden=false;
 };
 const showEditor=(needsManual=false)=>{
  const notes=document.createElement('details');notes.className='profile-editor';notes.open=needsManual;
  notes.innerHTML='<summary>'+(needsManual?'Placez trois repères sur la photo':'Modifier les repères (facultatif)')+'</summary>'+ 
   '<p>Les repères sont approximatifs (ni C7 ni S1). Vous pouvez les corriger en touchant la photo.</p>'+
   '<div class="profile-editor-actions"><button type="button" id="mark-neck" aria-pressed="true">1 · Cou / haut du dos</button><button type="button" id="mark-pelvis" aria-pressed="false">2 · Bassin</button>'+(needsManual?'<button type="button" id="mark-ankle" aria-pressed="false">3 · Cheville</button>':'')+'</div>'+ 
   '<p>Indice exprimé en % de la hauteur projetée épaule–cheville. Sans calibration ni radiographie, aucune SVA en mm n’est disponible.</p>';
  panel.prepend(notes);
  if(needsManual)panel.hidden=false;
  const neck=q('#mark-neck'),pelvis=q('#mark-pelvis'),ankle=q('#mark-ankle');
  const select=name=>{which=name;neck.setAttribute('aria-pressed',String(name==='neck'));pelvis.setAttribute('aria-pressed',String(name==='pelvis'));if(ankle)ankle.setAttribute('aria-pressed',String(name==='ankle'));};
  neck.onclick=()=>select('neck');pelvis.onclick=()=>select('pelvis');if(ankle)ankle.onclick=()=>select('ankle');
  snap.onpointerdown=event=>{
   if(!base||!markers)return;
   const box=snap.getBoundingClientRect();
   const scale=Math.min(box.width/base.width,box.height/base.height);
   const renderedW=base.width*scale,renderedH=base.height*scale;
   const x=(event.clientX-box.left-(box.width-renderedW)/2)/renderedW;
   const y=(event.clientY-box.top-(box.height-renderedH)/2)/renderedH;
   if(x<0||x>1||y<0||y>1)return;
   markers[which]={x,y};adjusted=true;
   if(needsManual&&which==='neck')select('pelvis');
   else if(needsManual&&which==='pelvis')select('ankle');
   if(needsManual&&markers.neck&&markers.pelvis&&markers.ankle){
    frame={height:markers.ankle.y-markers.neck.y};
    if(frame.height>.2){draw();status.textContent='Repères placés. Le résultat de surface est disponible.';}
    else {next.disabled=true;status.textContent='Placez la cheville plus bas que le cou pour une hauteur exploitable.';}
   }else draw();
  };
 };
 const takePhoto=(f,manualMode=false)=>{
  if(disposed||locked||!video.videoWidth)return;
  locked=true;frame=f?.valid?f:null;manualCaptured=manualMode;
  const w=video.videoWidth,h=video.videoHeight;
  base=document.createElement('canvas');base.width=w;base.height=h;
  const ctx=base.getContext('2d');
  ctx.translate(w,0);ctx.scale(-1,1);ctx.drawImage(video,0,0,w,h);
  markers=frame?{neck:{x:1-f.neck.x,y:f.neck.y},pelvis:{x:1-f.pelvis.x,y:f.pelvis.y}}:{neck:null,pelvis:null,ankle:null};
  stopTracks();start.disabled=true;manual.hidden=true;off.hidden=true;
  snap.hidden=false;
  // Make the captured image visually replace the video.
  snap.style.display='block';
  if(frame){draw();showEditor(false);next.disabled=false;}
  else {draw();showEditor(true);panel.hidden=false;next.disabled=true;status.textContent='Photo prise. Touchez successivement le cou, le bassin et la cheville sur la photo.';}
  redo.hidden=false;redo.textContent='Reprendre la photo';
  status.textContent=manualMode?(frame?'Photo prise : repères automatiques à vérifier.':'Photo prise : cliquez sur le cou, puis le bassin, puis la cheville pour afficher le résultat.'):'Photo capturée automatiquement. Vous pouvez continuer.';
  q('#camera-message').textContent=instruction;
 };
 start.onclick=async()=>{
  if(!consent.checked||disposed)return;
  const request=++state.request;start.disabled=true;stability.reset();cancelCountdown();locked=false;panel.hidden=true;validSince=null;
  q('#camera-message').textContent='Autorisez la webcam et placez-vous de profil.';
  let stream=null;
  try{
   stream=await sharedMotionMedia.ensureCamera();
   if(disposed||request!==state.request)return;
   state.stream=stream;sharedMotionMedia.attachVideo(video);off.hidden=true;stop.disabled=false;await video.play();manual.disabled=false;
   const engine=await createPoseEngine(video,overlay,(points,time)=>{
    if(disposed||locked||document.hidden)return;
    const f=stability.observe(points,time);latestProfile=f;
    validStreak=f.valid?validStreak+1:0;
    if(validStreak===3)sharedMotionMedia.readyBeep(task.id);
    manual.disabled=false;
    validSince=f.valid?(validSince??time):null;
    // Only show the manual escape hatch after a prolonged failed auto-position.
    manual.hidden=false;
    const label=q('#pose-quality'),hud=q('#camera-hud');
    hud.hidden=false;
    if(countdownRunning){
     if(!f.valid||f.stableMs<900){
      cancelCountdown();status.textContent='Vous avez bougé : repositionnez-vous. Le décompte repartira tout seul.';
     }
     else label.textContent='Position validée · photo dans 3, 2, 1…';
    }else{
     label.textContent=f.valid?'Profil correct : '+Math.min(100,Math.floor(f.stableMs/900*100))+' % · attendez…':f.message;
     if(f.ready){
      countdownRunning=true;
      manual.hidden=true;
      if(countCover)countCover.hidden=false;
      status.textContent='Parfait. Restez dans cette position : 3, 2, 1…';
      void sharedMotionMedia.postureCountdown(v=>{
       if(!countdownRunning||disposed)return;
       if(countValue)countValue.textContent=String(v);
      },()=>{
       if(!countdownRunning||disposed)return;
       if(!latestProfile?.valid||latestProfile.stableMs<900||document.hidden){
        cancelCountdown();return;
       }
       hideCountdown();
       takePhoto(latestProfile);
      });
     }
    }
   },()=>{cancelCountdown();manual.hidden=false;manual.disabled=!video.videoWidth;q('#camera-message').textContent='Détection interrompue : vous pouvez prendre une photo et placer les repères manuellement.';});
   if(disposed||request!==state.request){engine.stop();return;}
   state.engine=engine;overlay.hidden=false;
  }catch(e){
   if(disposed||request!==state.request)return;
   if(video.videoWidth&&state.stream){manual.disabled=false;q('#camera-message').textContent='Détection automatique indisponible : utilisez « Prendre une photo maintenant ». ';return;}
   stopTracks();off.hidden=false;
   q('#camera-message').textContent=e.name==='NotAllowedError'?'Autorisation caméra refusée.':'Caméra ou détecteur indisponible. Réessayez.';
  }
 };
 stop.onclick=()=>{stopTracks(true);off.hidden=false;q('#camera-message').textContent='Caméra et microphone arrêtés.';};
 redo.onclick=()=>{
  sharedMotionMedia.resetReady(task.id);
  cancelCountdown();stopTracks();base=null;markers=null;frame=null;locked=false;adjusted=false;manualCaptured=false;latestProfile=null;manual.hidden=false;manual.disabled=true;
  snap.hidden=true;snap.style.display='';snap.onpointerdown=null;panel.hidden=true;start.disabled=!consent.checked;
  const editor=panel.querySelector('.profile-editor');editor?.remove();off.hidden=false;
  q('#value').textContent='—';next.disabled=true;redo.hidden=true;
  record.status='pending';record.posture=null;record.value=null;delete state.results[task.id];callbacks.checkpoint?.();status.textContent='Pour reprendre, réactivez la caméra et replacez-vous de profil.';
 };
 next.disabled=true;
 manual.onclick=()=>{if(!locked&&video.videoWidth)takePhoto(latestProfile?.valid?latestProfile:null,true);};
 q('#go').onclick=()=>{if(!record.posture?.valid)return;stopTracks();callbacks.advance();};
 q('#back').onclick=()=>{stopTracks();callbacks.back();};
 q('#skip').onclick=()=>{stopTracks();record.status='skipped';record.posture=null;state.results[task.id]=record;callbacks.checkpoint?.();callbacks.advance();};
 if(sharedMotionMedia.availableCamera()){
  consent.checked=true;start.disabled=false;
  void start.onclick();
 }
 return ()=>{
  if(disposed)return;disposed=true;stopTracks();
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
  cancelCountdown();base=null;markers=null;snap.remove();
 };
}

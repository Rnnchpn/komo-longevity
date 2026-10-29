import {createPoseEngine} from './pose-engine.js';
import {createSideProfileStability,surfaceSagittalIndex} from './profile-photo-metrics.mjs';

// Automatic PHOTO OF SURFACE PROFILE, not radiographic SVA.
// Photo is an in-memory canvas and vanishes on navigation; no server uploads.
export function mountSideProfilePhoto(root,task,record,state,callbacks){
 const q=s=>root.querySelector(s),video=q('#live-video'),overlay=q('#pose-canvas'),off=q('#camera-off');
 const start=q('#start-camera'),stop=q('#stop-camera'),redo=q('#redo-test'),next=q('#go'),consent=q('#pose-consent'),halt=q('#halt-test'),status=q('#motion-status');
 const reader=q('#read-guidance'),distance=q('#distance-view');
 let disposed=false,locked=false,frame=null,base=null,display=null,markers=null,which='neck',adjusted=false,manualCaptured=false,latestProfile=null;
 const stability=createSideProfileStability(2300);
 const snap=document.createElement('canvas');snap.id='profile-photo';snap.className='profile-photo';snap.hidden=true;snap.setAttribute('aria-label','Photo de profil locale avec deux repères de surface');
 q('#camera-screen').append(snap);
 const panel=q('#posture-results'),data=q('#posture-data');
 const instruction='Photo automatique après 2 à 3 secondes immobile, de profil. Ajustez ensuite les repères de surface au toucher si besoin.';
 q('#camera-live-score').hidden=true;
 q('#camera-hud').hidden=true;
 const manual=q('#start-test');manual.hidden=false;manual.disabled=true;manual.textContent='Prendre la photo (secours)';
 q('#time').textContent='AUTO';
 q('#value').textContent='—';
 q('#value').parentElement.querySelector('.overline').textContent='PHOTO DE PROFIL';
 status.textContent='Autorisez la caméra. Placez-vous de profil, immobile, avec les pieds visibles.';
 consent.onchange=()=>{start.disabled=!consent.checked||Boolean(state.stream);};
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
 const stopTracks=()=>{
  state.request++;
  if(state.engine){state.engine.stop();state.engine=null;}
  if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}
  video.pause();video.srcObject=null;video.hidden=true;overlay.hidden=true;
  start.disabled=!consent.checked;stop.disabled=true;state.bodyReady=false;
 };
 const draw=()=>{
  if(!base||!markers)return;
  snap.width=base.width;snap.height=base.height;
  const ctx=snap.getContext('2d');
  ctx.drawImage(base,0,0);
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
  q('#value').textContent=offset.toFixed(1)+' %';
  const items=[['Écart horizontal apparent',offset.toFixed(1)+' %'],['Méthode','Photo de profil 2D'],
   ['Repère supérieur','Jonction cou–épaule (estimée)'],['Repère inférieur','Région pelvienne (estimée)']];
  data.replaceChildren();
  for(const [key,value] of items){const cell=document.createElement('div'),k=document.createElement('span'),v=document.createElement('strong');
   k.textContent=key;v.textContent=value;cell.append(k,v);data.append(cell);}
  panel.hidden=false;
 };
 const showEditor=()=>{
  const notes=document.createElement('div');notes.className='profile-editor';notes.innerHTML=
   '<p>Photo prise automatiquement. Les points sont <strong>des repères de surface approximatifs</strong>, pas C7 ni S1. Pour les corriger, choisissez un point puis touchez la photo.</p>'+
   '<div class="profile-editor-actions"><button type="button" id="mark-neck" aria-pressed="true">1 · Repère cou/dos</button><button type="button" id="mark-pelvis" aria-pressed="false">2 · Repère bassin</button></div>'+
   '<p>Indice exprimé en % de la hauteur projetée épaule–cheville. Sans calibration ni radiographie, aucune SVA en mm n’est disponible.</p>';
  panel.prepend(notes);
  const neck=q('#mark-neck'),pelvis=q('#mark-pelvis');
  const select=name=>{which=name;neck.setAttribute('aria-pressed',String(name==='neck'));pelvis.setAttribute('aria-pressed',String(name==='pelvis'));};
  neck.onclick=()=>select('neck');pelvis.onclick=()=>select('pelvis');
  snap.onpointerdown=event=>{
   if(!base||!markers)return;
   const box=snap.getBoundingClientRect();
   const scale=Math.min(box.width/base.width,box.height/base.height);
   const renderedW=base.width*scale,renderedH=base.height*scale;
   const x=(event.clientX-box.left-(box.width-renderedW)/2)/renderedW;
   const y=(event.clientY-box.top-(box.height-renderedH)/2)/renderedH;
   if(x<0||x>1||y<0||y>1)return;
   markers[which]={x,y};adjusted=true;draw();
  };
 };
 const takePhoto=(f,manualMode=false)=>{
  if(disposed||locked||!video.videoWidth)return;
  locked=true;frame=f;manualCaptured=manualMode;
  const w=video.videoWidth,h=video.videoHeight;
  base=document.createElement('canvas');base.width=w;base.height=h;
  const ctx=base.getContext('2d');
  ctx.translate(w,0);ctx.scale(-1,1);ctx.drawImage(video,0,0,w,h);
  markers={neck:{x:1-f.neck.x,y:f.neck.y},pelvis:{x:1-f.pelvis.x,y:f.pelvis.y}};
  stopTracks();start.disabled=true;manual.hidden=true;off.hidden=true;
  snap.hidden=false;
  // Make the captured image visually replace the video.
  snap.style.display='block';
  draw();showEditor();next.disabled=false;
  redo.hidden=false;redo.textContent='Reprendre la photo';
  status.textContent=manualMode?'Photo prise manuellement : résultat exploratoire à vérifier.':'Photo capturée automatiquement. Vérifiez les deux repères puis continuez.';
  q('#camera-message').textContent=instruction;
 };
 start.onclick=async()=>{
  if(!consent.checked||disposed)return;
  const request=++state.request;start.disabled=true;stability.reset();locked=false;panel.hidden=true;
  q('#camera-message').textContent='Autorisez la webcam et placez-vous de profil.';
  let stream=null;
  try{
   stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});
   if(disposed||request!==state.request){stream.getTracks().forEach(t=>t.stop());return;}
   state.stream=stream;video.srcObject=stream;video.hidden=false;off.hidden=true;stop.disabled=false;await video.play();
   const engine=await createPoseEngine(video,overlay,(points,time)=>{
    if(disposed||locked||document.hidden)return;
    const f=stability.observe(points,time);latestProfile=f;
    manual.disabled=!f.valid;
    const label=q('#pose-quality'),hud=q('#camera-hud');
    hud.hidden=false;label.textContent=f.valid?'Profil immobile : '+Math.min(100,Math.floor(f.stableMs/2300*100))+' %':f.message;
    if(f.ready)takePhoto(f);
   },()=>{stopTracks();q('#camera-message').textContent='Détection interrompue. Réessayez.';});
   if(disposed||request!==state.request){engine.stop();return;}
   state.engine=engine;overlay.hidden=false;
  }catch(e){
   if(stream)stream.getTracks().forEach(t=>t.stop());
   if(disposed||request!==state.request)return;
   stopTracks();off.hidden=false;
   q('#camera-message').textContent=e.name==='NotAllowedError'?'Autorisation caméra refusée.':'Caméra ou détecteur indisponible. Réessayez.';
  }
 };
 stop.onclick=()=>{stopTracks();off.hidden=false;q('#camera-message').textContent='Caméra arrêtée.';};
 redo.onclick=()=>{
  stopTracks();base=null;markers=null;frame=null;locked=false;adjusted=false;manualCaptured=false;latestProfile=null;manual.hidden=false;manual.disabled=true;
  snap.hidden=true;snap.style.display='';snap.onpointerdown=null;panel.hidden=true;start.disabled=!consent.checked;
  const editor=panel.querySelector('.profile-editor');editor?.remove();off.hidden=false;
  q('#value').textContent='—';next.disabled=true;redo.hidden=true;
  record.status='pending';record.posture=null;status.textContent='Pour reprendre, réactivez la caméra et replacez-vous de profil.';
 };
 next.disabled=true;
 manual.onclick=()=>{if(latestProfile?.valid&&!locked)takePhoto(latestProfile,true);};
 q('#go').onclick=()=>{if(!record.posture?.valid)return;stopTracks();callbacks.advance();};
 q('#back').onclick=()=>{stopTracks();callbacks.back();};
 q('#skip').onclick=()=>{stopTracks();record.status='skipped';record.posture=null;callbacks.advance();};
 return ()=>{
  if(disposed)return;disposed=true;stopTracks();
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
  base=null;markers=null;snap.remove();
 };
}

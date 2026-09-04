import { TwinCore } from '../v04/twin-core.js';
import { EXERCISES, recommendExercise } from './exercise-library.js';

const $=(s,r=document)=>r.querySelector(s);
const app=$('#app');
if(!app)throw new Error('KŌMØ World V0.9 could not attach');

const locale=()=>document.documentElement.lang==='fr'?'fr':'en';
const core=new TwinCore();
try{core.setTimeIndex(2,'v09')}catch{}
const recommendation=recommendExercise(core.current?.()||core.snapshots?.at(-1));

const cameraUI=document.createElement('section');
cameraUI.className='motion-camera';
cameraUI.id='motion-camera';
cameraUI.innerHTML=`
  <header class="motion-camera-head">
    <div class="motion-camera-brand"><span>KŌMØ MOTION CAMERA · V1</span><h2>Move in the real world.</h2></div>
    <button class="motion-camera-close" id="motion-close" aria-label="Close">×</button>
  </header>
  <div class="motion-camera-body">
    <aside class="motion-sidebar">
      <span class="motion-kicker" id="motion-mode-label">CAMERA CHALLENGE</span>
      <h3 id="motion-exercise-title">Squat 10</h3>
      <p id="motion-exercise-copy">Posez votre téléphone pour voir votre corps en entier.</p>
      <div class="exercise-grid" id="exercise-grid"></div>
      <div class="motion-recommend" id="motion-recommend"><b>KŌMØ TWIN · RECOMMANDATION</b><p></p></div>
      <div class="camera-guidance">
        <div><span id="camera-position-label">Position caméra</span><b id="camera-position">30–45° / profil</b></div>
        <div><span>Analyse</span><b id="camera-analysis">Répétitions · tempo</b></div>
        <div><span>Privacy</span><b>Local-first</b></div>
      </div>
      <label id="readiness-wrap" style="display:none;margin:13px 0;font:600 9px/1.4 Arial;opacity:.72"><input type="checkbox" id="readiness-check" style="margin-right:7px"> <span id="readiness-copy">Je confirme ne pas avoir de nouvelle douleur importante, malaise ou restriction médicale empêchant cet exercice.</span></label>
      <button class="motion-primary" id="motion-camera-start">Activer la caméra</button>
      <button class="motion-secondary" id="motion-session-start" disabled>Lancer la session</button>
      <p class="privacy-note" id="privacy-note">La vidéo reste sur cet appareil. KŌMØ V0.9 ne conserve que les résultats dérivés si la session est terminée.</p>
    </aside>
    <div class="motion-stage-card">
      <div class="motion-stage">
        <video class="motion-video" id="motion-video" playsinline muted></video>
        <canvas class="motion-overlay" id="motion-overlay"></canvas>
        <div class="motion-status" id="motion-status"><i></i><span>CAMÉRA DÉSACTIVÉE</span></div>
        <div class="motion-countdown" id="motion-countdown">3</div>
        <div class="motion-metrics">
          <div class="motion-metric"><span id="metric1-label">RÉPÉTITIONS</span><b id="metric1">0</b></div>
          <div class="motion-metric"><span id="metric2-label">ANGLE</span><b id="metric2">—</b></div>
          <div class="motion-metric"><span id="metric3-label">TEMPO</span><b id="metric3">—</b></div>
          <div class="motion-metric"><span id="metric4-label">QUALITÉ</span><b id="metric4">—</b></div>
        </div>
        <div class="motion-result" id="motion-result">
          <div class="motion-result-card">
            <span class="eyebrow">KŌMØ MOTION CAMERA</span>
            <h3 id="motion-result-title">Défi réussi.</h3>
            <div class="motion-result-score"><b id="motion-result-score">10</b><span id="motion-result-unit">RÉPÉTITIONS</span></div>
            <div class="motion-result-grid">
              <div><span>TEMPS</span><b id="result-time">—</b></div>
              <div><span id="result-quality-label">QUALITÉ EST.</span><b id="result-quality">—</b></div>
              <div><span id="result-rom-label">AMPLITUDE EST.</span><b id="result-rom">—</b></div>
            </div>
            <button class="motion-primary" id="motion-result-close">Continuer dans World</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
app.appendChild(cameraUI);

const video=$('#motion-video'),overlay=$('#motion-overlay'),ctx=overlay.getContext('2d');
let currentExercise=EXERCISES.squat10;
let launchMode='game';
let stream=null,landmarker=null,PoseLandmarkerClass=null,raf=0,lastVideoTime=-1;
let session=null;

const copy={
  fr:{activate:'Activer la caméra',ready:'Caméra prête',loading:'Chargement du suivi du mouvement…',tracking:'CORPS DÉTECTÉ',noPose:'PLACEZ-VOUS EN ENTIER DANS LE CADRE',start:'Lancer la session',stop:'Arrêter la session',success:'Défi réussi.',rehabDone:'Session terminée.',cameraDenied:'Accès caméra impossible',recommend:'KŌMØ TWIN · RECOMMANDATION',game:'CAMERA CHALLENGE',rehab:'REHAB · GUIDÉ PAR LE TWIN',continue:'Continuer dans World'},
  en:{activate:'Enable camera',ready:'Camera ready',loading:'Loading movement tracking…',tracking:'BODY DETECTED',noPose:'KEEP YOUR FULL BODY IN FRAME',start:'Start session',stop:'Stop session',success:'Challenge complete.',rehabDone:'Session complete.',cameraDenied:'Camera access unavailable',recommend:'KŌMØ TWIN · RECOMMENDATION',game:'CAMERA CHALLENGE',rehab:'REHAB · TWIN-GUIDED',continue:'Continue in World'}
};
const tx=(k)=>copy[locale()][k]||k;
const exTitle=(ex)=>ex.title[locale()]||ex.title.en;
const exShort=(ex)=>ex.short[locale()]||ex.short.en;
const cameraText=(mode)=>({front45_or_side:locale()==='fr'?'30–45° ou profil':'30–45° or side',side:locale()==='fr'?'Profil':'Side',side_or_front45:locale()==='fr'?'Profil ou 30–45°':'Side or 30–45°',front:locale()==='fr'?'Face':'Front'}[mode]||mode);
const analysisText=(ex)=>ex.metrics.slice(0,3).map(x=>x.replaceAll('_',' ')).join(' · ');

function renderExerciseChoices(){
  const grid=$('#exercise-grid');
  grid.innerHTML=Object.values(EXERCISES).map(ex=>`<button class="exercise-choice ${ex.id===currentExercise.id?'active':''}" data-exercise="${ex.id}"><b>${exTitle(ex)}</b><span>${exShort(ex)}</span></button>`).join('');
  grid.querySelectorAll('[data-exercise]').forEach(b=>b.onclick=()=>selectExercise(b.dataset.exercise));
}
function selectExercise(id){
  currentExercise=EXERCISES[id]||EXERCISES.squat10;
  if(session?.active)stopSession(false);
  renderExerciseChoices();
  $('#motion-exercise-title').textContent=exTitle(currentExercise);
  $('#motion-exercise-copy').textContent=locale()==='fr'?'Posez votre téléphone assez loin pour voir le corps en entier. La caméra estime le mouvement ; elle ne remplace pas une mesure clinique.':'Place your phone far enough away to see your full body. The camera estimates movement; it does not replace a clinical measurement.';
  $('#camera-position').textContent=cameraText(currentExercise.camera);
  $('#camera-analysis').textContent=analysisText(currentExercise);
  const isRehab=currentExercise.kind==='rehab'||launchMode==='rehab';
  $('#readiness-wrap').style.display=isRehab?'block':'none';
  $('#readiness-check').checked=false;
  resetMetrics();
  updateStartState();
}
function updateLanguage(){
  $('.motion-camera-brand h2').textContent=locale()==='fr'?'Bougez dans le monde réel.':'Move in the real world.';
  $('#motion-mode-label').textContent=launchMode==='rehab'?tx('rehab'):tx('game');
  $('#motion-camera-start').textContent=stream?tx('ready'):tx('activate');
  $('#motion-session-start').textContent=session?.active?tx('stop'):tx('start');
  $('#motion-recommend b').textContent=tx('recommend');
  $('#motion-recommend p').textContent=recommendation.reason[locale()]||recommendation.reason.en;
  $('#motion-result-close').textContent=tx('continue');
  selectExercise(currentExercise.id);
}

function addLaunchButtons(){
  const arenaStart=$('#challenge-start');
  if(arenaStart&&!$('#arena-camera-launch')){
    const b=document.createElement('button');b.id='arena-camera-launch';b.className='motion-launch';b.innerHTML='<i></i><span>MOTION CAMERA · SQUAT 10</span>';b.onclick=()=>openMotion('game','squat10');arenaStart.insertAdjacentElement('afterend',b);
  }
  const panel=$('#panel');
  if(panel){new MutationObserver(()=>{
    const isRehab=panel.classList.contains('open')&&$('#panel-kicker')?.textContent?.trim()==='REHAB';
    if(!isRehab)return;
    const body=$('#panel-body');if(!body||body.querySelector('#rehab-camera-launch'))return;
    const b=document.createElement('button');b.id='rehab-camera-launch';b.className='motion-launch';b.innerHTML=`<i></i><span>${locale()==='fr'?'COMMENCER LA SESSION CAMÉRA':'START CAMERA SESSION'}</span>`;b.onclick=()=>openMotion('rehab',recommendation.exercise.id);body.appendChild(b);
  }).observe(panel,{attributes:true,attributeFilter:['class']});}
}

function openMotion(mode='game',exerciseId='squat10'){
  launchMode=mode;
  selectExercise(exerciseId);
  cameraUI.classList.add('open');
  app.dataset.motionCamera='open';
  updateLanguage();
}
function closeMotion(){
  stopSession(false);
  stopCamera();
  $('#motion-result').classList.remove('open');
  cameraUI.classList.remove('open');
  delete app.dataset.motionCamera;
}
$('#motion-close').onclick=closeMotion;
$('#motion-result-close').onclick=closeMotion;
$('#readiness-check').onchange=updateStartState;

document.querySelector('#language-toggle')?.addEventListener('click',()=>requestAnimationFrame(updateLanguage));

function setStatus(text,tracking=false){const n=$('#motion-status');n.querySelector('span').textContent=text;n.classList.toggle('tracking',tracking)}
function resetMetrics(){
  $('#metric1-label').textContent=currentExercise.id==='balance30'?'TEMPS':'RÉPÉTITIONS';
  $('#metric1').textContent=currentExercise.id==='balance30'?'0.0':'0';
  $('#metric2-label').textContent=currentExercise.id==='balance30'?'STABILITÉ':'ANGLE';$('#metric2').textContent='—';
  $('#metric3-label').textContent=currentExercise.id==='balance30'?'OSCILLATION EST.':'TEMPO';$('#metric3').textContent='—';
  $('#metric4-label').textContent='QUALITÉ EST.';$('#metric4').textContent='—';
}
function updateStartState(){
  const rehab=currentExercise.kind==='rehab'||launchMode==='rehab';
  $('#motion-session-start').disabled=!stream||!landmarker||(rehab&&!$('#readiness-check').checked);
}

async function initPose(){
  if(landmarker)return;
  setStatus(tx('loading'));
  const mp=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/+esm');
  const {FilesetResolver,PoseLandmarker}=mp;PoseLandmarkerClass=PoseLandmarker;
  const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');
  const options={baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',delegate:'GPU'},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5};
  try{landmarker=await PoseLandmarker.createFromOptions(vision,options)}catch{options.baseOptions.delegate='CPU';landmarker=await PoseLandmarker.createFromOptions(vision,options)}
}
async function startCamera(){
  if(stream)return;
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}}});
    video.srcObject=stream;await video.play();
    overlay.width=video.videoWidth||1280;overlay.height=video.videoHeight||720;
    await initPose();
    $('#motion-camera-start').textContent=tx('ready');$('#motion-camera-start').disabled=true;
    setStatus(tx('noPose'));
    updateStartState();
    cancelAnimationFrame(raf);raf=requestAnimationFrame(poseLoop);
  }catch(err){console.error('[KOMO motion camera]',err);setStatus(tx('cameraDenied'));stream?.getTracks?.().forEach(t=>t.stop());stream=null;video.srcObject=null;updateStartState()}
}
$('#motion-camera-start').onclick=startCamera;

function landmarkVisible(lm,index,min=.45){return !!lm[index]&&((lm[index].visibility??1)>=min)}
function angle(a,b,c){
  if(!a||!b||!c)return null;
  const ab={x:a.x-b.x,y:a.y-b.y},cb={x:c.x-b.x,y:c.y-b.y};
  const denom=Math.hypot(ab.x,ab.y)*Math.hypot(cb.x,cb.y);if(!denom)return null;
  const cos=Math.max(-1,Math.min(1,(ab.x*cb.x+ab.y*cb.y)/denom));return Math.acos(cos)*180/Math.PI;
}
function bestSide(lm,type='leg'){
  const sets=type==='arm'?[[11,13,15],[12,14,16]]:[[23,25,27],[24,26,28]];
  const score=s=>s.reduce((a,i)=>a+(lm[i]?.visibility??0),0);
  return score(sets[0])>=score(sets[1])?sets[0]:sets[1];
}
function drawPose(landmarks){
  ctx.clearRect(0,0,overlay.width,overlay.height);if(!landmarks)return;
  ctx.lineWidth=Math.max(2,overlay.width/430);ctx.strokeStyle='rgba(214,224,202,.72)';ctx.fillStyle='rgba(237,217,174,.92)';
  const connections=PoseLandmarkerClass?.POSE_CONNECTIONS||[];
  for(const c of connections){const a=landmarks[c.start],b=landmarks[c.end];if(!a||!b||(a.visibility??1)<.35||(b.visibility??1)<.35)continue;ctx.beginPath();ctx.moveTo(a.x*overlay.width,a.y*overlay.height);ctx.lineTo(b.x*overlay.width,b.y*overlay.height);ctx.stroke()}
  for(const p of landmarks){if((p.visibility??1)<.45)continue;ctx.beginPath();ctx.arc(p.x*overlay.width,p.y*overlay.height,Math.max(2.5,overlay.width/260),0,Math.PI*2);ctx.fill()}
}

function newSession(){return{active:false,startedAt:0,reps:0,phase:'ready',angles:[],repTimes:[],quality:[],stability:[],baselineCenter:null,lastRepAt:0}}
function resetSession(){session=newSession();resetMetrics()}
resetSession();

function processExercise(lm,now){
  if(!session?.active)return;
  const elapsed=(now-session.startedAt)/1000;
  if(currentExercise.id==='balance30'){
    const needed=[11,12,23,24];if(!needed.every(i=>landmarkVisible(lm,i)))return;
    const shoulderWidth=Math.max(.04,Math.abs(lm[11].x-lm[12].x));
    const center=(lm[11].x+lm[12].x+lm[23].x+lm[24].x)/4;
    if(session.baselineCenter===null)session.baselineCenter=center;
    const sway=Math.abs(center-session.baselineCenter)/shoulderWidth;
    const stability=Math.max(0,Math.min(100,100-sway*145));session.stability.push(stability);
    $('#metric1').textContent=elapsed.toFixed(1);$('#metric2').textContent=`${Math.round(stability)}%`;$('#metric3').textContent=sway.toFixed(2);$('#metric4').textContent=`${Math.round(avg(session.stability))}%`;
    if(elapsed>=currentExercise.targetSeconds)finishSession(true);return;
  }
  if(currentExercise.id==='pushup10'){
    const s=bestSide(lm,'arm');if(!s.every(i=>landmarkVisible(lm,i)))return;
    const elbow=angle(lm[s[0]],lm[s[1]],lm[s[2]]);if(elbow===null)return;session.angles.push(elbow);
    const side=s[0]===11?'left':'right',hip=side==='left'?23:24,ankle=side==='left'?27:28;
    const line=landmarkVisible(lm,hip)&&landmarkVisible(lm,ankle)?angle(lm[s[0]],lm[hip],lm[ankle]):null;
    if(elbow<100&&session.phase!=='down')session.phase='down';
    if(session.phase==='down'&&elbow>155&&now-session.lastRepAt>350){acceptRep(now);session.phase='up'}
    const quality=line?Math.max(0,100-Math.abs(180-line)*1.6):75;session.quality.push(quality);
    updateRepMetrics(elbow,quality,elapsed);return;
  }
  const s=bestSide(lm,'leg');if(!s.every(i=>landmarkVisible(lm,i)))return;
  const knee=angle(lm[s[0]],lm[s[1]],lm[s[2]]);if(knee===null)return;session.angles.push(knee);
  const downThreshold=currentExercise.id==='sitstand10'?125:118;
  if(knee<downThreshold&&session.phase!=='down')session.phase='down';
  if(session.phase==='down'&&knee>155&&now-session.lastRepAt>380){acceptRep(now);session.phase='up'}
  const quality=Math.max(0,Math.min(100,(Math.max(0,165-knee)/55)*100));session.quality.push(quality);
  updateRepMetrics(knee,avg(session.quality.slice(-20)),elapsed);
}
function acceptRep(now){
  session.reps++;session.lastRepAt=now;session.repTimes.push((now-session.startedAt)/1000);
  if(session.reps>=currentExercise.targetReps)finishSession(true)
}
function updateRepMetrics(currentAngle,quality,elapsed){
  $('#metric1').textContent=session.reps;$('#metric2').textContent=`${Math.round(currentAngle)}°`;
  const tempo=session.reps?elapsed/session.reps:null;$('#metric3').textContent=tempo?`${tempo.toFixed(1)}s`:'—';$('#metric4').textContent=`${Math.round(quality)}%`;
}
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;

async function countdown(){
  const n=$('#motion-countdown');n.classList.add('show');for(const x of ['3','2','1']){n.textContent=x;await new Promise(r=>setTimeout(r,650))}n.textContent='GO';await new Promise(r=>setTimeout(r,350));n.classList.remove('show')
}
async function startSession(){
  if(session?.active){stopSession(true);return}
  const rehab=currentExercise.kind==='rehab'||launchMode==='rehab';if(rehab&&!$('#readiness-check').checked)return;
  resetSession();await countdown();session.active=true;session.startedAt=performance.now();$('#motion-session-start').textContent=tx('stop');
}
function stopSession(show=true){if(!session?.active)return;session.active=false;$('#motion-session-start').textContent=tx('start');if(show)finishSession(false)}
$('#motion-session-start').onclick=startSession;

function derivedResult(success){
  const elapsed=session.startedAt?(performance.now()-session.startedAt)/1000:0;
  const minA=session.angles.length?Math.min(...session.angles):null,maxA=session.angles.length?Math.max(...session.angles):null;
  const rom=minA!==null&&maxA!==null?Math.round(maxA-minA):null;
  const quality=currentExercise.id==='balance30'?avg(session.stability):avg(session.quality);
  return{event_id:`motion_${Date.now()}`,exercise_id:currentExercise.id,kind:currentExercise.kind,completed:success,reps:session.reps,time_seconds:Number(elapsed.toFixed(1)),quality_estimate:Math.round(quality||0),rom_estimate_deg:rom,created_at:new Date().toISOString(),source:'browser_pose_estimation_v1',video_stored:false};
}
function persistResult(event){try{const key='komo_motion_camera_events_v1',arr=JSON.parse(localStorage.getItem(key)||'[]');arr.push(event);localStorage.setItem(key,JSON.stringify(arr.slice(-50)))}catch{}
  if(event.completed&&currentExercise.publicScore){try{const key='komo_arena_v081',a=JSON.parse(localStorage.getItem(key)||'{}');a.points=(a.points||2480)+85;a.xp=(a.xp||0)+40;localStorage.setItem(key,JSON.stringify(a));$('#hud-points').textContent=a.points.toLocaleString(locale()==='fr'?'fr-FR':'en-US')}catch{}}
}
function finishSession(success){
  if(!session)return;session.active=false;const e=derivedResult(success);persistResult(e);
  $('#motion-session-start').textContent=tx('start');$('#motion-result-title').textContent=currentExercise.kind==='rehab'?tx('rehabDone'):tx('success');
  $('#motion-result-score').textContent=currentExercise.id==='balance30'?e.time_seconds.toFixed(1):e.reps;$('#motion-result-unit').textContent=currentExercise.id==='balance30'?'SECONDS':(locale()==='fr'?'RÉPÉTITIONS':'REPETITIONS');
  $('#result-time').textContent=`${e.time_seconds.toFixed(1)}s`;$('#result-quality').textContent=`${e.quality_estimate}%`;$('#result-rom').textContent=e.rom_estimate_deg!==null?`${e.rom_estimate_deg}°`:'—';$('#motion-result').classList.add('open');
}

function poseLoop(now){
  if(!stream||!landmarker)return;
  if(video.readyState>=2&&video.currentTime!==lastVideoTime){
    lastVideoTime=video.currentTime;
    try{const result=landmarker.detectForVideo(video,now);const lm=result.landmarks?.[0];drawPose(lm);if(lm){setStatus(tx('tracking'),true);processExercise(lm,now)}else setStatus(tx('noPose'),false)}catch(err){console.warn('[KOMO pose frame]',err)}
  }
  raf=requestAnimationFrame(poseLoop)
}

function stopCamera(){
  cancelAnimationFrame(raf);raf=0;
  stream?.getTracks?.().forEach(t=>t.stop());stream=null;lastVideoTime=-1;
  video.pause();video.srcObject=null;
  ctx.clearRect(0,0,overlay.width,overlay.height);
  $('#motion-camera-start').disabled=false;$('#motion-camera-start').textContent=tx('activate');
  setStatus(locale()==='fr'?'CAMÉRA DÉSACTIVÉE':'CAMERA OFF');updateStartState();
}
window.addEventListener('pagehide',stopCamera);

addLaunchButtons();renderExerciseChoices();updateLanguage();
$('#motion-recommend p').textContent=recommendation.reason[locale()]||recommendation.reason.en;

window.KomoMotionCamera={
  open:(exerciseId='squat10',mode='game')=>openMotion(mode,exerciseId),
  recommend:()=>({exercise_id:recommendation.exercise.id,rule_id:recommendation.ruleId,reason:recommendation.reason[locale()]||recommendation.reason.en}),
  listExercises:()=>Object.values(EXERCISES).map(({id,kind,targetReps,targetSeconds,camera,metrics})=>({id,kind,targetReps,targetSeconds,camera,metrics}))
};

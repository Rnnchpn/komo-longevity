const $=(s,r=document)=>r.querySelector(s);
const cameraUI=$('#motion-camera');
if(!cameraUI)throw new Error('KŌMØ V0.10.1 camera setup assistant could not attach');
const video=$('#motion-video'),overlay=$('#motion-overlay'),status=$('#motion-status');

const guides={
  squat10:{fr:{title:'Squat 10 · cadrage 30–45°',copy:'Posez le téléphone sur un support bas, à environ 2–3 m. Gardez tête et pieds visibles. Un angle de 30–45° ou un profil léger facilite l’estimation du genou.',tags:['2–3 m','support bas','30–45°','corps entier']},en:{title:'Squat 10 · 30–45° framing',copy:'Place the phone on a low support about 2–3 m away. Keep head and feet visible. A 30–45° or slight side view helps knee-angle estimation.',tags:['2–3 m','low support','30–45°','full body']}},
  sitstand10:{fr:{title:'Assis-debout · profil / 30–45°',copy:'Placez le téléphone bas et assez loin pour voir le corps entier et la chaise. Le profil ou 30–45° donne une lecture plus robuste du genou et du lever.',tags:['2–3 m','chaise visible','profil','corps entier']},en:{title:'Sit-to-Stand · side / 30–45°',copy:'Place the phone low and far enough away to see the full body and chair. Side or 30–45° framing gives a more robust knee and rise view.',tags:['2–3 m','chair visible','side view','full body']}},
  balance30:{fr:{title:'Équilibre · face caméra',copy:'Posez le téléphone de face, sur un support bas, à environ 2–3 m. Les deux pieds, les hanches et les épaules doivent rester entièrement visibles.',tags:['2–3 m','face','pieds visibles','bonne lumière']},en:{title:'Balance · front view',copy:'Place the phone facing you on a low support about 2–3 m away. Both feet, hips and shoulders should remain fully visible.',tags:['2–3 m','front view','feet visible','good light']}},
  pushup10:{fr:{title:'Pompes · profil bas',copy:'Placez le téléphone bas, de profil, à environ 2–3 m. Le mode paysage est souvent plus confortable : mains, épaules, bassin et pieds doivent rester dans l’image.',tags:['2–3 m','profil','téléphone bas','paysage conseillé']},en:{title:'Push-up · low side view',copy:'Place the phone low and side-on about 2–3 m away. Landscape is often easier: hands, shoulders, hips and feet should remain in frame.',tags:['2–3 m','side view','low phone','landscape preferred']}}
};
const isFr=()=>document.documentElement.lang!=='en';
const currentExercise=()=>document.querySelector('.exercise-choice.active')?.dataset.exercise||'squat10';

const setup=document.createElement('aside');
setup.className='camera-setup';
setup.innerHTML=`<div class="camera-setup-head"><div><span>KŌMØ MOTION CAMERA · SETUP</span><h3 id="setup-title">Positionnez le téléphone</h3></div><button id="setup-toggle" class="camera-setup-toggle">−</button></div><div class="camera-setup-body"><div class="camera-placement"><div class="placement-visual"><div class="placement-phone"></div><div class="placement-person"></div></div><div class="placement-copy"><b id="placement-title"></b><p id="placement-copy"></p><div class="placement-tags" id="placement-tags"></div></div></div><div class="setup-checks"><div class="setup-check" id="check-camera"><i></i><span>CAMÉRA</span><b>OFF</b></div><div class="setup-check" id="check-pose"><i></i><span>POSE</span><b>EN ATTENTE</b></div><div class="setup-check" id="check-frame"><i></i><span>CADRAGE</span><b>—</b></div><div class="setup-check" id="check-light"><i></i><span>LUMIÈRE</span><b>—</b></div></div><div class="setup-feedback" id="setup-feedback">Activez la caméra puis reculez jusqu’à voir votre corps entier.</div><button class="setup-test" id="setup-test">TESTER LE CADRAGE</button><p class="setup-foot" id="setup-foot">Distance indicative : le critère principal reste le corps entier visible, sans membre coupé.</p></div>`;
cameraUI.appendChild(setup);

const checkCamera=$('#check-camera'),checkPose=$('#check-pose'),checkFrame=$('#check-frame'),checkLight=$('#check-light');
const feedback=$('#setup-feedback');
const testBtn=$('#setup-test');
let framing={tracking:false,good:false,tooClose:false,tooFar:false,light:null,bbox:null};
let stableGoodSince=0;

function setCheck(node,state,label){node.classList.remove('ok','warn');if(state==='ok')node.classList.add('ok');if(state==='warn')node.classList.add('warn');node.querySelector('b').textContent=label}
function renderGuide(){
  const id=currentExercise(),g=(guides[id]||guides.squat10)[isFr()?'fr':'en'];
  $('#setup-title').textContent=isFr()?'Positionnez le téléphone':'Position your phone';
  $('#placement-title').textContent=g.title;$('#placement-copy').textContent=g.copy;$('#placement-tags').innerHTML=g.tags.map(x=>`<i>${x}</i>`).join('');
  testBtn.textContent=isFr()?'TESTER LE CADRAGE':'TEST FRAMING';
  $('#setup-foot').textContent=isFr()?'Distance indicative : le critère principal reste le corps entier visible, sans membre coupé.':'Distance is only a starting point: the main criterion is a fully visible body with no cropped limbs.';
}

function cameraOn(){return !!(video?.srcObject&&video.readyState>=1)}
function poseOn(){return !!status?.classList.contains('tracking')}
function bboxFromOverlay(){
  if(!overlay||!overlay.width||!overlay.height)return null;
  const w=160,h=Math.max(90,Math.round(160*overlay.height/overlay.width));
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(overlay,0,0,w,h);const d=x.getImageData(0,0,w,h).data;
  let minX=w,minY=h,maxX=-1,maxY=-1,n=0;
  for(let yy=0;yy<h;yy+=2){for(let xx=0;xx<w;xx+=2){const a=d[(yy*w+xx)*4+3];if(a>18){n++;if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;if(yy<minY)minY=yy;if(yy>maxY)maxY=yy}}}
  if(n<6)return null;return{minX:minX/w,maxX:maxX/w,minY:minY/h,maxY:maxY/h,width:(maxX-minX)/w,height:(maxY-minY)/h};
}
function estimateLight(){
  if(!cameraOn()||video.videoWidth<2)return null;
  try{const c=document.createElement('canvas');c.width=24;c.height=14;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(video,0,0,c.width,c.height);const d=x.getImageData(0,0,c.width,c.height).data;let s=0;for(let i=0;i<d.length;i+=4)s+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];return s/(d.length/4)}catch{return null}
}
function evaluate(){
  framing.tracking=poseOn();framing.bbox=bboxFromOverlay();framing.light=estimateLight();
  const id=currentExercise(),b=framing.bbox;
  framing.tooClose=false;framing.tooFar=false;framing.good=false;
  if(b){
    const edge=b.minX<.025||b.maxX>.975||b.minY<.02||b.maxY>.985;
    const occupancy=id==='pushup10'?b.width:b.height;
    const min=id==='pushup10'?.48:.5,max=.94;
    framing.tooClose=edge||occupancy>max;framing.tooFar=occupancy<min;
    framing.good=!framing.tooClose&&!framing.tooFar;
  }
  const cam=cameraOn();setCheck(checkCamera,cam?'ok':'warn',cam?(video.videoWidth?`${video.videoWidth}×${video.videoHeight}`:'ON'):'OFF');
  setCheck(checkPose,framing.tracking?'ok':'warn',framing.tracking?(isFr()?'CORPS DÉTECTÉ':'BODY DETECTED'):(isFr()?'EN ATTENTE':'WAITING'));
  let frameLabel='—',frameState='warn';if(framing.good){frameLabel=isFr()?'BON':'GOOD';frameState='ok'}else if(framing.tooClose)frameLabel=isFr()?'RECULEZ':'STEP BACK';else if(framing.tooFar)frameLabel=isFr()?'APPROCHEZ':'MOVE CLOSER';setCheck(checkFrame,frameState,frameLabel);
  const lightGood=framing.light===null?null:framing.light>=55;setCheck(checkLight,lightGood===true?'ok':lightGood===false?'warn':'',framing.light===null?'—':lightGood?(isFr()?'OK':'OK'):(isFr()?'TROP SOMBRE':'TOO DARK'));
  const overall=cam&&framing.tracking&&framing.good&&lightGood!==false;cameraUI.dataset.setupGood=String(overall);
  if(overall){feedback.textContent=isFr()?'Cadrage prêt. Vous pouvez lancer la session.':'Framing ready. You can start the session.';if(!stableGoodSince)stableGoodSince=performance.now()}else{stableGoodSince=0;if(!cam)feedback.textContent=isFr()?'Cliquez sur « Activer la caméra », puis autorisez l’accès dans le navigateur.':'Tap “Enable camera”, then allow camera access in the browser.';else if(!framing.tracking)feedback.textContent=isFr()?'Reculez et gardez le corps entier visible. Évitez le contre-jour.':'Step back and keep your full body visible. Avoid strong backlighting.';else if(framing.tooClose)feedback.textContent=isFr()?'Vous êtes trop près ou un segment sort du cadre : reculez le téléphone ou votre position.':'You are too close or part of the body is cropped: move farther away.';else if(framing.tooFar)feedback.textContent=isFr()?'Vous êtes un peu trop loin : rapprochez-vous légèrement.':'You are a little too far away: move slightly closer.';else if(lightGood===false)feedback.textContent=isFr()?'Éclairage insuffisant : éclairez le visage et le corps depuis l’avant ou le côté.':'Lighting is too low: light your body from the front or side.'}
}

let timer=setInterval(evaluate,850);
new MutationObserver(()=>{renderGuide();setTimeout(evaluate,80)}).observe(cameraUI,{attributes:true,attributeFilter:['class']});
new MutationObserver(()=>evaluate()).observe(status,{attributes:true,attributeFilter:['class']});
document.addEventListener('click',e=>{if(e.target.closest?.('.exercise-choice'))setTimeout(()=>{renderGuide();evaluate()},80)});
$('#language-toggle')?.addEventListener('click',()=>requestAnimationFrame(()=>{renderGuide();evaluate()}));
$('#setup-toggle').onclick=()=>{setup.classList.toggle('minimized');$('#setup-toggle').textContent=setup.classList.contains('minimized')?'+':'−'};
testBtn.onclick=()=>{
  if(!cameraOn()){feedback.textContent=isFr()?'Activez d’abord la caméra avec le bouton situé à gauche.':'Enable the camera first using the button on the left.';$('#motion-camera-start')?.focus();return}
  testBtn.disabled=true;const start=performance.now();feedback.textContent=isFr()?'Test en cours… restez immobile une seconde.':'Testing… hold position for one second.';
  const poll=setInterval(()=>{evaluate();if(cameraUI.dataset.setupGood==='true'&&performance.now()-stableGoodSince>1200){clearInterval(poll);testBtn.disabled=false;feedback.textContent=isFr()?'Test réussi : cadrage stable et exploitable.':'Test passed: framing is stable and usable.'}else if(performance.now()-start>5000){clearInterval(poll);testBtn.disabled=false;evaluate()}},220)
};
window.addEventListener('pagehide',()=>clearInterval(timer));
renderGuide();evaluate();
window.KomoCameraSetup={evaluate:()=>({...framing,exerciseId:currentExercise()}),open:()=>setup.classList.remove('minimized')};
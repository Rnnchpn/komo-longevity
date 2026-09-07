const app=document.querySelector('#app');
const canvas=document.querySelector('#world-canvas');
const distance=document.querySelector('#camera-distance');
const sensX=document.querySelector('#sens-x');
const sensY=document.querySelector('#sens-y');
const invertY=document.querySelector('#invert-y');
const heading=document.querySelector('#heading');
const settingsPanel=document.querySelector('#settings');
const lookZone=document.querySelector('#look-zone');
if(!app||!canvas||!distance||!sensX||!sensY||!heading)throw new Error('KŌMØ V0.8.4 camera grammar could not attach');

const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const USER_KEY='komo_world_camera_user_v084';
const readCamera=()=>({distance:Number(distance.value)||26,sensX:Number(sensX.value)||1,sensY:Number(sensY.value)||1,invertY:!!invertY?.checked});
let userCamera=(()=>{try{return {...readCamera(),...JSON.parse(localStorage.getItem(USER_KEY)||'null')}}catch{return readCamera()}})();
let internalWrite=false;
let profileTimer=0;
let lastActivity=performance.now();

const chip=document.createElement('div');
chip.className='camera-grammar-chip';
chip.innerHTML='<i></i><span>CAMERA · EXPLORATION</span>';
app.appendChild(chip);
const chipText=chip.querySelector('span');
const isFr=()=>document.documentElement.lang==='fr'||document.querySelector('#language-toggle')?.textContent?.trim()==='FR';
const profileNames={
  explore:['EXPLORATION','EXPLORATION'],
  desk:['CONVERSATION','CONVERSATION'],
  twin:['INSPECTION','INSPECTION'],
  body:['FOCUS CORPS','BODY FOCUS'],
  compare:['COMPARAISON','COMPARE'],
  arena:['ARENA DYNAMIQUE','ARENA DYNAMIC'],
  challenge:['DÉFI STABLE','CHALLENGE LOCK']
};
const profiles={
  explore:()=>({distance:userCamera.distance,sensX:userCamera.sensX,sensY:userCamera.sensY}),
  desk:()=>({distance:15,sensX:.68,sensY:.56}),
  twin:()=>({distance:20,sensX:.64,sensY:.56}),
  body:()=>({distance:14,sensX:.52,sensY:.48}),
  compare:()=>({distance:22,sensX:.48,sensY:.44}),
  arena:()=>({distance:19,sensX:1.08,sensY:.78}),
  challenge:()=>({distance:13,sensX:.32,sensY:.32})
};

function setInput(node,value){node.value=String(value);node.dispatchEvent(new Event('input',{bubbles:true}));}
function rememberTrusted(event){
  if(!event.isTrusted||internalWrite)return;
  userCamera=readCamera();
  localStorage.setItem(USER_KEY,JSON.stringify(userCamera));
}
[distance,sensX,sensY].forEach(node=>node.addEventListener('input',rememberTrusted));
invertY?.addEventListener('change',event=>{if(event.isTrusted&&!internalWrite){userCamera=readCamera();localStorage.setItem(USER_KEY,JSON.stringify(userCamera));}});

function tweenProfile(name,duration=360){
  clearInterval(profileTimer);
  const target=profiles[name]?.();if(!target)return;
  app.dataset.cameraProfile=name;
  const labels=profileNames[name]||profileNames.explore;
  chipText.textContent=`CAMERA · ${isFr()?labels[0]:labels[1]}`;
  const start={distance:Number(distance.value)||26,sensX:Number(sensX.value)||1,sensY:Number(sensY.value)||1};
  if(reduced||duration<=0){
    internalWrite=true;setInput(distance,target.distance);setInput(sensX,target.sensX);setInput(sensY,target.sensY);internalWrite=false;return;
  }
  const t0=performance.now();
  internalWrite=true;
  profileTimer=setInterval(()=>{
    const p=Math.min(1,(performance.now()-t0)/duration);
    const ease=1-Math.pow(1-p,3);
    setInput(distance,start.distance+(target.distance-start.distance)*ease);
    setInput(sensX,start.sensX+(target.sensX-start.sensX)*ease);
    setInput(sensY,start.sensY+(target.sensY-start.sensY)*ease);
    if(p>=1){clearInterval(profileTimer);internalWrite=false;}
  },34);
}

function syntheticDrag(dx,dy){
  if(reduced||typeof PointerEvent==='undefined')return;
  const rect=canvas.getBoundingClientRect();
  const x=rect.left+rect.width/2,y=rect.top+rect.height/2,id=984;
  canvas.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'mouse',pointerId:id,clientX:x,clientY:y,buttons:1}));
  canvas.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',pointerId:id,clientX:x+dx,clientY:y+dy,buttons:1}));
  canvas.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'mouse',pointerId:id,clientX:x+dx,clientY:y+dy,buttons:0}));
}
function recenterTo(target='S'){
  const order=['N','E','S','W'];
  const current=heading.textContent?.trim();
  const a=order.indexOf(current),b=order.indexOf(target);
  if(a<0||b<0||a===b)return;
  let steps=b-a;if(steps>2)steps-=4;if(steps<-2)steps+=4;
  const sx=Math.max(.35,Number(sensX.value)||1);
  syntheticDrag(steps*(Math.PI/2)/(.0032*sx),0);
}

function markActivity(){lastActivity=performance.now();}
canvas.addEventListener('pointerdown',markActivity,{passive:true});
canvas.addEventListener('pointermove',event=>{if(event.buttons)markActivity()},{passive:true});
lookZone?.addEventListener('pointerdown',markActivity,{passive:true});
lookZone?.addEventListener('pointermove',markActivity,{passive:true});
window.addEventListener('keydown',markActivity,{passive:true});

function scheduleProfile(name,delay=0,duration=360){
  const token=Symbol(name);scheduleProfile.token=token;
  setTimeout(()=>{if(scheduleProfile.token===token)tweenProfile(name,duration)},delay);
}
function restoreExplore(delay=100){scheduleProfile('explore',delay,420);}

let lastZone=app.dataset.zone||'world';
new MutationObserver(()=>{
  const zone=app.dataset.zone||'world';
  if(zone===lastZone)return;
  lastZone=zone;
  if(zone==='twin')scheduleProfile('twin',1180,460);
  else if(zone==='arena')scheduleProfile('arena',1180,420);
  else restoreExplore(500);
}).observe(app,{attributes:true,attributeFilter:['data-zone']});

const twinHud=document.querySelector('#twin-hud');
document.querySelectorAll('[data-twin-view]').forEach(button=>button.addEventListener('click',()=>{
  if(app.dataset.zone!=='twin')return;
  const view=button.dataset.twinView;
  if(view==='body')scheduleProfile('body',720,320);
  else if(view==='compare')scheduleProfile('compare',820,340);
  else scheduleProfile('twin',520,340);
}));
document.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',()=>{if(app.dataset.zone==='twin')scheduleProfile('body',720,300)}));
document.querySelector('#compare-now')?.addEventListener('click',()=>{if(app.dataset.zone==='twin')scheduleProfile('compare',820,340)});
document.querySelector('#compare-close')?.addEventListener('click',()=>{if(app.dataset.zone==='twin')scheduleProfile('twin',180,300)});
document.querySelector('#source-close')?.addEventListener('click',()=>{if(app.dataset.zone==='twin')scheduleProfile('twin',180,300)});

const panel=document.querySelector('#panel');
if(panel)new MutationObserver(()=>{
  const concierge=panel.classList.contains('open')&&document.querySelector('#panel-kicker')?.textContent?.includes('CONCIERGE');
  if(concierge&&app.dataset.zone!=='twin'&&app.dataset.zone!=='arena')scheduleProfile('desk',620,320);
  else if(app.dataset.zone==='world'||app.dataset.zone==='atrium')restoreExplore(220);
}).observe(panel,{attributes:true,attributeFilter:['class']});

const challenge=document.querySelector('#challenge');
if(challenge)new MutationObserver(()=>{
  if(challenge.classList.contains('open'))scheduleProfile('challenge',470,260);
  else if(app.dataset.zone==='arena')scheduleProfile('arena',260,300);
}).observe(challenge,{attributes:true,attributeFilter:['class']});
document.querySelector('#result-close')?.addEventListener('click',()=>{if(app.dataset.zone==='arena')scheduleProfile('arena',120,300)});

// Competitive mode: desktop camera input is blocked during the active challenge.
['pointerdown','pointermove','wheel'].forEach(type=>canvas.addEventListener(type,event=>{
  if(app.dataset.cameraProfile!=='challenge')return;
  event.preventDefault();event.stopImmediatePropagation();
},{capture:true,passive:false}));

// Twin inspection gently returns to a useful frontal view after inactivity.
setInterval(()=>{
  if(reduced)return;
  const profile=app.dataset.cameraProfile;
  if(!['twin','body'].includes(profile))return;
  if(performance.now()-lastActivity<4200)return;
  recenterTo('S');
  lastActivity=performance.now()+1800;
},1500);

// Keep grammar labels bilingual without touching the underlying camera state.
document.querySelector('#language-toggle')?.addEventListener('click',()=>requestAnimationFrame(()=>{
  const name=app.dataset.cameraProfile||'explore';const labels=profileNames[name]||profileNames.explore;
  chipText.textContent=`CAMERA · ${isFr()?labels[0]:labels[1]}`;
}));

// If the player explicitly edits controls, their values become the new exploration baseline.
settingsPanel?.addEventListener('input',event=>{if(event.isTrusted){userCamera=readCamera();localStorage.setItem(USER_KEY,JSON.stringify(userCamera));}});

app.dataset.cameraProfile='explore';
chipText.textContent=`CAMERA · ${isFr()?'EXPLORATION':'EXPLORATION'}`;
setTimeout(()=>restoreExplore(0),1300);

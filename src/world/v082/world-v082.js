const app=document.querySelector('#app');
const canvas=document.querySelector('#world-canvas');
const distance=document.querySelector('#camera-distance');
if(!app||!canvas||!distance)throw new Error('KŌMØ World V0.8.2 cinematic layer could not attach');

const prefersReduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const cinematic=document.createElement('div');
cinematic.className='room-cinematic';
cinematic.innerHTML='<div class="room-reveal"><span id="room-kicker">KŌMØ WORLD</span><h2 id="room-title">KŌMØ</h2><p id="room-subtitle"></p></div>';
app.appendChild(cinematic);
const breath=document.createElement('div');
breath.className='camera-breath';
breath.textContent='CAMERA · CINEMATIC MODE';
app.appendChild(breath);

const isFrench=()=>document.documentElement.lang==='fr'||document.querySelector('#language-toggle')?.textContent?.trim()==='FR';
const roomCopy={
  twin:{
    kicker:'KŌMØ FUNCTIONAL DIGITAL TWIN',
    title:'Twin Lab',
    fr:'Votre corps. À travers le temps.',
    en:'Your body. Across time.'
  },
  arena:{
    kicker:'KŌMØ ARENA · SEASON 01',
    title:'KŌMØ Arena',
    fr:'Bougez. Jouez. Progressez.',
    en:'Move. Compete. Progress.'
  }
};

let cinematicTimer=null;
let distanceTimer=null;
function setCameraDistance(value){
  distance.value=String(value);
  distance.dispatchEvent(new Event('input',{bubbles:true}));
}
function clearCinematic(){
  clearTimeout(cinematicTimer);
  clearTimeout(distanceTimer);
  cinematic.classList.remove('open');
  breath.classList.remove('show');
  app.classList.remove('cinematic-active');
  delete app.dataset.cinematic;
}
function playRoomCinematic(zone){
  if(!roomCopy[zone])return;
  clearCinematic();
  const copy=roomCopy[zone];
  document.querySelector('#room-kicker').textContent=copy.kicker;
  document.querySelector('#room-title').textContent=copy.title;
  document.querySelector('#room-subtitle').textContent=isFrench()?copy.fr:copy.en;
  app.dataset.cinematic=zone;
  const original=Number(distance.value)||26;
  if(!prefersReduced){
    setCameraDistance(zone==='twin'?13:14);
    distanceTimer=setTimeout(()=>setCameraDistance(original),260);
  }
  requestAnimationFrame(()=>{
    app.classList.add('cinematic-active');
    cinematic.classList.add('open');
    breath.classList.add('show');
  });
  cinematicTimer=setTimeout(()=>{
    cinematic.classList.remove('open');
    breath.classList.remove('show');
    setTimeout(()=>{
      app.classList.remove('cinematic-active');
      delete app.dataset.cinematic;
    },520);
  },900);
}

let lastZone=app.dataset.zone||'world';
const zoneObserver=new MutationObserver(()=>{
  const zone=app.dataset.zone||'world';
  if(zone===lastZone)return;
  const previous=lastZone;
  lastZone=zone;
  if(zone==='twin'||zone==='arena')playRoomCinematic(zone);
  if((previous==='twin'||previous==='arena')&&(zone==='atrium'||zone==='world')){
    clearCinematic();
    app.classList.add('cinematic-return');
    setTimeout(()=>app.classList.remove('cinematic-return'),420);
  }
});
zoneObserver.observe(app,{attributes:true,attributeFilter:['data-zone']});

let focusTimer=null;
function bodyFocusDolly(){
  if(app.dataset.zone!=='twin')return;
  clearTimeout(focusTimer);
  const original=Number(distance.value)||26;
  app.classList.add('body-focus-active');
  if(!prefersReduced)setCameraDistance(15);
  focusTimer=setTimeout(()=>{
    setCameraDistance(original);
    setTimeout(()=>app.classList.remove('body-focus-active'),450);
  },620);
}
document.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',bodyFocusDolly,{passive:true}));

document.querySelector('#compare-now')?.addEventListener('click',()=>{
  if(app.dataset.zone!=='twin'||prefersReduced)return;
  const original=Number(distance.value)||26;
  setCameraDistance(18);
  setTimeout(()=>setCameraDistance(original),520);
},{passive:true});

// Keep the cinematic copy synchronized when the user changes FR / EN.
document.querySelector('#language-toggle')?.addEventListener('click',()=>{
  if(!app.dataset.cinematic)return;
  requestAnimationFrame(()=>{
    const copy=roomCopy[app.dataset.cinematic];
    if(copy)document.querySelector('#room-subtitle').textContent=isFrench()?copy.fr:copy.en;
  });
});

// Small entrance cue when V0.8.2 loads, without covering the onboarding.
setTimeout(()=>{
  if(app.dataset.zone==='twin'||app.dataset.zone==='arena')playRoomCinematic(app.dataset.zone);
},180);

const app=document.querySelector('#app');
const canvas=document.querySelector('#world-canvas');
const distance=document.querySelector('#camera-distance');
const sensX=document.querySelector('#sens-x');
const sensY=document.querySelector('#sens-y');
const invertY=document.querySelector('#invert-y');
const heading=document.querySelector('#heading');
if(!app||!canvas||!distance||!heading)throw new Error('KŌMØ Camera Director could not attach');

const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const director=document.createElement('div');director.className='camera-director';director.innerHTML='<div class="camera-director-card"><span id="director-kicker">KŌMØ WORLD</span><h2 id="director-title">Camera Director</h2><p id="director-copy"></p></div>';app.appendChild(director);
const bars=document.createElement('div');bars.className='camera-bars';app.appendChild(bars);
const shield=document.createElement('div');shield.className='camera-shield';app.appendChild(shield);
const chip=document.createElement('div');chip.className='camera-shot-chip';chip.textContent='CAMERA · PLAYER';app.appendChild(chip);

const lang=()=>document.documentElement.lang==='fr'||document.querySelector('#language-toggle')?.textContent?.trim()==='FR';
const shots={
  desk:{heading:'N',pitch:.11,distance:14,settle:20,kicker:'KŌMØ CONCIERGE',title:'KŌMØ Desk',fr:'Votre point de départ.',en:'Your starting point.',hold:520},
  twinEntry:{heading:'S',pitch:.11,distance:17,settle:21,kicker:'KŌMØ FUNCTIONAL DIGITAL TWIN',title:'Twin Lab',fr:'Votre corps. À travers le temps.',en:'Your body. Across time.',hold:760},
  twinFront:{heading:'S',pitch:.08,distance:13,settle:19,kicker:'BODY FOCUS',title:'Quadriceps gauche',fr:'Lecture fonctionnelle ciblée.',en:'Targeted functional reading.',hold:420},
  twinGait:{heading:'E',pitch:.16,distance:16,settle:20,kicker:'BODY FOCUS',title:'Marche',fr:'Cinématique et progression.',en:'Gait and progression.',hold:420},
  twinPosture:{heading:'W',pitch:.15,distance:15,settle:20,kicker:'BODY FOCUS',title:'Posture',fr:'Axe et contrôle.',en:'Axis and control.',hold:420},
  twinStrength:{heading:'S',pitch:.10,distance:14,settle:20,kicker:'BODY FOCUS',title:'Force',fr:'Signal musculaire.',en:'Muscle signal.',hold:420},
  twinCompare:{heading:'S',pitch:.19,distance:19,settle:21,kicker:'LONGITUDINAL VIEW',title:'Baseline → Today',fr:'Comparer le corps à travers le temps.',en:'Compare the body across time.',hold:500},
  arenaEntry:{heading:'S',pitch:.15,distance:18,settle:22,kicker:'KŌMØ ARENA · SEASON 01',title:'KŌMØ Arena',fr:'Podium. Scoreboard. Défi du jour.',en:'Podium. Scoreboard. Daily challenge.',hold:780},
  arenaPodium:{heading:'S',pitch:.10,distance:13,settle:20,kicker:'DAILY CHALLENGE',title:'Balance Hold',fr:'Votre tentative commence ici.',en:'Your attempt starts here.',hold:420}
};

const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
function setDistance(v){distance.value=String(v);distance.dispatchEvent(new Event('input',{bubbles:true}));}
function syntheticDrag(dx,dy){
  if(typeof PointerEvent==='undefined')return;
  const r=canvas.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,id=884;
  canvas.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'mouse',pointerId:id,clientX:x,clientY:y,buttons:1}));
  canvas.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',pointerId:id,clientX:x+dx,clientY:y+dy,buttons:1}));
  canvas.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'mouse',pointerId:id,clientX:x+dx,clientY:y+dy,buttons:0}));
}
async function alignHeading(target){
  if(reduced)return;
  const order=['N','E','S','W'];
  for(let attempt=0;attempt<3;attempt++){
    const current=heading.textContent?.trim();
    const a=order.indexOf(current),b=order.indexOf(target);
    if(a<0||b<0||a===b)return;
    let steps=b-a;if(steps>2)steps-=4;if(steps<-2)steps+=4;
    const sx=Math.max(.35,Number(sensX?.value)||1);
    syntheticDrag(steps*(Math.PI/2)/(.0032*sx),0);
    await sleep(70);
  }
}
function setPitch(target){
  if(reduced)return;
  const sy=Math.max(.35,Number(sensY?.value)||1),sign=invertY?.checked?-1:1;
  syntheticDrag(0,-10000/sign);
  const dy=(target+.08)/(sign*.0021*sy);
  syntheticDrag(0,dy);
}
let token=0;
async function playShot(name,{quiet=false}={}){
  const shot=shots[name];if(!shot)return;
  const mine=++token,original=Number(distance.value)||24;
  app.classList.add('camera-focus');shield.classList.add('active');bars.classList.add('active');
  chip.textContent=`CAMERA · ${name.replace(/[A-Z]/g,m=>' '+m).toUpperCase()}`;chip.classList.add('show');
  if(!quiet){document.querySelector('#director-kicker').textContent=shot.kicker;document.querySelector('#director-title').textContent=shot.title;document.querySelector('#director-copy').textContent=lang()?shot.fr:shot.en;director.classList.add('open');}
  if(!reduced){
    await alignHeading(shot.heading);if(mine!==token)return;
    setPitch(shot.pitch);setDistance(shot.distance);
    await sleep(shot.hold||500);if(mine!==token)return;
    setDistance(shot.settle||original);
  }
  await sleep(quiet?180:330);if(mine!==token)return;
  director.classList.remove('open');bars.classList.remove('active');shield.classList.remove('active');app.classList.remove('camera-focus');
  await sleep(180);if(mine===token)chip.classList.remove('show');
}

let lastZone=app.dataset.zone||'world';
new MutationObserver(()=>{
  const zone=app.dataset.zone||'world';if(zone===lastZone)return;lastZone=zone;
  if(zone==='twin')playShot('twinEntry');
  else if(zone==='arena')playShot('arenaEntry');
  else {token++;director.classList.remove('open');bars.classList.remove('active');shield.classList.remove('active');app.classList.remove('camera-focus');chip.classList.remove('show');}
}).observe(app,{attributes:true,attributeFilter:['data-zone']});

const regionShots={left_thigh:'twinFront',gait:'twinGait',trunk:'twinPosture',strength:'twinStrength'};
document.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',()=>{if(app.dataset.zone==='twin')playShot(regionShots[button.dataset.region]||'twinFront',{quiet:true});}));
document.querySelector('#compare-now')?.addEventListener('click',()=>{if(app.dataset.zone==='twin')playShot('twinCompare',{quiet:true});});
document.querySelector('[data-twin-view="compare"]')?.addEventListener('click',()=>{if(app.dataset.zone==='twin')playShot('twinCompare',{quiet:true});});
document.querySelector('#challenge-start')?.addEventListener('click',()=>{if(app.dataset.zone==='arena')playShot('arenaPodium',{quiet:true});});

const panel=document.querySelector('#panel');
if(panel)new MutationObserver(()=>{if(panel.classList.contains('open')&&document.querySelector('#panel-kicker')?.textContent?.includes('CONCIERGE'))playShot('desk',{quiet:true});}).observe(panel,{attributes:true,attributeFilter:['class']});

document.querySelector('#language-toggle')?.addEventListener('click',()=>{if(!director.classList.contains('open'))return;const active=lastZone==='twin'?shots.twinEntry:lastZone==='arena'?shots.arenaEntry:null;if(active)requestAnimationFrame(()=>document.querySelector('#director-copy').textContent=lang()?active.fr:active.en);});

setTimeout(()=>chip.classList.add('show'),220);setTimeout(()=>chip.classList.remove('show'),1150);

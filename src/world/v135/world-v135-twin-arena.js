import { TwinCore } from '../v04/twin-core.js';

const runtime=window.KomoWorldRuntime;
if(!runtime?.THREE||!runtime?.scene)throw new Error('KŌMØ V0.13.5 runtime unavailable');
const {THREE,scene,spawnRing}=runtime;
const core=new TwinCore();
const current=core.current();
const baseline=core.snapshots[0];
const comparison=core.compare(baseline.snapshot_id,current.snapshot_id,'v135-visual');

const findGroup=(x,z,t=.25)=>scene.children.find(o=>o.isGroup&&Math.abs(o.position.x-x)<t&&Math.abs(o.position.z-z)<t)||null;
const twinLab=findGroup(-42,-3),arenaRoom=findGroup(43,-4);
if(!twinLab||!arenaRoom)throw new Error('KŌMØ V0.13.5 Twin/Arena rooms unavailable');

const stone=new THREE.MeshStandardMaterial({color:0xe7ddcd,roughness:.78,metalness:.02});
const stoneDark=new THREE.MeshStandardMaterial({color:0xa99d88,roughness:.86,metalness:.02});
const sage=new THREE.MeshStandardMaterial({color:0x263b31,roughness:.58,metalness:.04});
const sageDeep=new THREE.MeshStandardMaterial({color:0x15241d,roughness:.5,metalness:.08});
const bronze=new THREE.MeshStandardMaterial({color:0xa77e50,roughness:.34,metalness:.58});
const gold=new THREE.MeshStandardMaterial({color:0xd5b477,roughness:.34,metalness:.46,emissive:0x5a3c1a,emissiveIntensity:.16});
const arenaDark=new THREE.MeshStandardMaterial({color:0x201a12,roughness:.52,metalness:.12});
const arenaFloor=new THREE.MeshStandardMaterial({color:0x30261a,roughness:.72,metalness:.05});
const warmGlow=new THREE.MeshBasicMaterial({color:0xe6c184,transparent:true,opacity:.62,side:THREE.DoubleSide,depthWrite:false});
const twinGlow=new THREE.MeshBasicMaterial({color:0xb7d1bd,transparent:true,opacity:.38,side:THREE.DoubleSide,depthWrite:false});

function box(g,w,h,d,m,x,y,z){const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;g.add(q);return q}
function ring(g,inner,outer,m,x,y,z){const q=new THREE.Mesh(new THREE.RingGeometry(inner,outer,96),m);q.rotation.x=-Math.PI/2;q.position.set(x,y,z);g.add(q);return q}
function torus(g,r,tube,m,x,y,z){const q=new THREE.Mesh(new THREE.TorusGeometry(r,tube,12,96),m);q.rotation.x=Math.PI/2;q.position.set(x,y,z);g.add(q);return q}
function canvasSprite(lines,{w=1024,h=700,sx=4.4,sy=3.0,bg='rgba(18,31,24,.95)',accent='#d8b77f'}={}){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  x.fillStyle=bg;x.beginPath();x.roundRect(18,18,w-36,h-36,42);x.fill();
  x.strokeStyle='rgba(226,199,151,.36)';x.lineWidth=4;x.stroke();
  x.fillRect(58,82,80,5);
  lines.forEach((line,i)=>{
    const y=line.y??(132+i*88);x.textAlign=line.align||'left';x.textBaseline='middle';
    x.fillStyle=line.color||'#f0e9dd';x.font=line.font||'600 34px Arial';
    x.fillText(String(line.text),line.align==='center'?w/2:58,y);
  });
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));s.scale.set(sx,sy,1);s.userData.tx=tx;return s;
}
function smallSprite(text,{sx=4.8,sy=.52,bg='rgba(18,29,23,.9)',fg='#eee6d8',font=28}={}){
  const c=document.createElement('canvas');c.width=1100;c.height=160;const x=c.getContext('2d');
  x.fillStyle=bg;x.beginPath();x.roundRect(18,18,1064,124,30);x.fill();x.strokeStyle='rgba(229,200,151,.30)';x.lineWidth=3;x.stroke();
  x.fillStyle=fg;x.font=`650 ${font}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,550,80);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));s.scale.set(sx,sy,1);s.userData.tx=tx;return s;
}

// 01 — compact spawn: keep the arrival cue, remove the oversized visual footprint.
if(spawnRing){
  spawnRing.geometry?.dispose?.();
  spawnRing.geometry=new THREE.RingGeometry(.92,1.18,64);
  if(spawnRing.material){spawnRing.material.opacity=.36;spawnRing.material.transparent=true}
  spawnRing.position.y=.125;
}

// 02 — Functional Twin: premium truth chamber, longitudinal readout and provenance.
const oldTwin=twinLab.getObjectByName('KOMO_V135_TWIN_PREMIUM');oldTwin?.removeFromParent?.();
const twinLayer=new THREE.Group();twinLayer.name='KOMO_V135_TWIN_PREMIUM';twinLab.add(twinLayer);
ring(twinLayer,3.05,3.28,twinGlow,0,.115,0);
ring(twinLayer,6.7,6.82,new THREE.MeshBasicMaterial({color:0x81988a,transparent:true,opacity:.22,side:THREE.DoubleSide}),0,.10,0);
torus(twinLayer,3.22,.055,bronze,0,6.05,0);
[-3.45,3.45].forEach(x=>{box(twinLayer,.10,5.65,.10,bronze,x,3.05,0);box(twinLayer,.42,.10,.42,stoneDark,x,.28,0)});
box(twinLayer,7.0,.08,.10,bronze,0,5.88,0);
const scan=ring(twinLayer,1.72,1.80,twinGlow,0,1.0,0);scan.material=twinGlow.clone();scan.material.opacity=.32;

const todayPanel=canvasSprite([
  {text:'CURRENT STATE',font:'700 24px Arial',color:'#d6b47a',y:112},
  {text:String(current.motion_score),font:'500 150px Georgia',y:250},
  {text:'MOTION SCORE / 100',font:'700 28px Arial',color:'#c9d7cc',y:360},
  {text:`MOTION AGE  ${current.motion_age}`,font:'650 36px Arial',y:458},
  {text:`MUSCLE ${current.domains.muscle}   ·   BALANCE ${current.domains.balance}`,font:'600 25px Arial',color:'#b9c8bd',y:548}
],{sx:4.25,sy:3.05,bg:'rgba(18,36,28,.95)'});todayPanel.position.set(-6.25,3.2,.4);twinLayer.add(todayPanel);

const quad0=baseline.metrics.quadriceps_symmetry,quad1=current.metrics.quadriceps_symmetry;
const longitudinalPanel=canvasSprite([
  {text:'LONGITUDINAL',font:'700 24px Arial',color:'#d6b47a',y:112},
  {text:`+${comparison.motion_score_delta}`,font:'500 126px Georgia',y:245},
  {text:'MOTION SCORE SINCE BASELINE',font:'700 25px Arial',color:'#c9d7cc',y:352},
  {text:`QUAD SYMMETRY  ${quad0} → ${quad1}`,font:'650 32px Arial',y:455},
  {text:`GAIT  ${baseline.metrics.gait_speed.toFixed(2)} → ${current.metrics.gait_speed.toFixed(2)} m/s`,font:'600 25px Arial',color:'#b9c8bd',y:548}
],{sx:4.25,sy:3.05,bg:'rgba(25,31,25,.96)'});longitudinalPanel.position.set(6.25,3.2,.4);twinLayer.add(longitudinalPanel);

const truth=smallSprite('TRUTH LAYER  ·  MYODEV  ·  FUNCTIONAL TESTS  ·  GAIT  ·  WEARABLES',{sx:8.9,sy:.58,bg:'rgba(17,32,25,.90)',fg:'#dfe8df',font:25});truth.position.set(0,6.75,-4.7);twinLayer.add(truth);
const state=smallSprite('TODAY  ·  MEASURED + DERIVED  ·  PRIVATE',{sx:5.6,sy:.48,bg:'rgba(28,40,32,.86)',fg:'#d8b77f',font:24});state.position.set(0,.85,4.7);twinLayer.add(state);

// 03 — Arena: make it feel like a real season venue, while keeping rankings game-only.
const oldArena=arenaRoom.getObjectByName('KOMO_V135_ARENA_PREMIUM');oldArena?.removeFromParent?.();
const arenaLayer=new THREE.Group();arenaLayer.name='KOMO_V135_ARENA_PREMIUM';arenaRoom.add(arenaLayer);
ring(arenaLayer,6.55,6.72,warmGlow,0,.09,-2.4);
ring(arenaLayer,9.5,9.62,new THREE.MeshBasicMaterial({color:0xa9814d,transparent:true,opacity:.34,side:THREE.DoubleSide}),0,.085,-.5);
box(arenaLayer,13.4,.045,.08,gold,0,.095,-2.4);box(arenaLayer,.08,.045,10.2,gold,0,.10,-2.4);
torus(arenaLayer,3.05,.06,gold,0,6.2,-2.4);
[-10.7,10.7].forEach(x=>{
  box(arenaLayer,.50,6.6,.50,arenaDark,x,3.3,-2.0);box(arenaLayer,.09,5.4,.09,gold,x>0?x-.31:x+.31,3.45,-1.70);
  box(arenaLayer,3.2,.48,9.8,arenaFloor,x>0?10.95:-10.95,.30,-.2);
  box(arenaLayer,2.7,.44,8.4,arenaDark,x>0?11.25:-11.25,.82,-.2);
});
box(arenaLayer,10.9,.16,.42,gold,0,7.1,6.25);
box(arenaLayer,11.4,.12,.18,bronze,0,1.0,6.35);

const challengeA=smallSprite('01  ·  BALANCE HOLD  ·  LIVE',{sx:4.15,sy:.52,bg:'rgba(55,41,23,.94)',fg:'#f3d59b',font:27});challengeA.position.set(-6.6,5.2,-6.4);arenaLayer.add(challengeA);
const challengeB=smallSprite('02  ·  SQUAT 10  ·  FREE',{sx:3.75,sy:.50,bg:'rgba(32,27,20,.90)',fg:'#e8dfcf',font:26});challengeB.position.set(0,5.2,-7.25);arenaLayer.add(challengeB);
const challengeC=smallSprite('03  ·  SIT-TO-STAND  ·  FREE',{sx:4.25,sy:.50,bg:'rgba(32,27,20,.90)',fg:'#e8dfcf',font:25});challengeC.position.set(6.6,5.2,-6.4);arenaLayer.add(challengeC);
const fairPlay=smallSprite('ARENA SCORE ONLY  ·  HEALTH DATA NEVER RANKED',{sx:6.8,sy:.50,bg:'rgba(26,23,18,.88)',fg:'#d7c9ae',font:24});fairPlay.position.set(0,7.45,5.8);arenaLayer.add(fairPlay);

// Controlled scene animation: only one moving scan ring and two subtle arena light pulses.
const arenaPulseA=new THREE.PointLight(0xe7bd76,7,11,2);arenaPulseA.position.set(-8.8,4.8,-2.3);arenaLayer.add(arenaPulseA);
const arenaPulseB=arenaPulseA.clone();arenaPulseB.position.x=8.8;arenaLayer.add(arenaPulseB);
let raf=0;
function animate(now){
  const t=now*.001;
  if(twinLab.visible){scan.position.y=.95+(Math.sin(t*.72)*.5+.5)*4.35;scan.material.opacity=.20+(Math.sin(t*.72)*.5+.5)*.18}
  if(arenaRoom.visible){const p=.72+.28*Math.sin(t*1.35);arenaPulseA.intensity=5.6+2.2*p;arenaPulseB.intensity=5.6+2.2*(1.72-p)}
  raf=requestAnimationFrame(animate);
}
raf=requestAnimationFrame(animate);
window.addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});

// UI polish for the two strategic rooms. No medical truth is changed here.
const style=document.createElement('style');style.id='komo-v135-twin-arena-style';style.textContent=`
.twin-cockpit.open .twin-top,.twin-cockpit.open .twin-left,.twin-cockpit.open .twin-right,.twin-cockpit.open .twin-bottom{
  background:linear-gradient(145deg,rgba(19,35,27,.90),rgba(25,38,31,.78))!important;
  border-color:rgba(224,198,153,.18)!important;box-shadow:0 24px 70px rgba(5,12,8,.24)!important
}
.twin-cockpit.open .twin-top{backdrop-filter:blur(24px) saturate(1.08)!important}
.twin-cockpit.open .motion-hero .score-line strong{font-family:Georgia,serif!important;font-weight:500!important;letter-spacing:-.05em!important}
.twin-cockpit.open .priority-card{background:linear-gradient(145deg,rgba(209,188,154,.12),rgba(255,255,255,.035))!important;border-color:rgba(219,189,139,.20)!important}
.twin-cockpit.open .domain-bars>div,.twin-cockpit.open .key-signals>div{border-color:rgba(255,255,255,.09)!important}
.arena-hud.open .arena-top,.arena-hud.open .arena-left,.arena-hud.open .arena-right,.arena-hud.open .arena-floor-label{
  background:linear-gradient(145deg,rgba(34,27,18,.93),rgba(28,35,27,.84))!important;
  border-color:rgba(229,188,115,.23)!important;box-shadow:0 26px 74px rgba(8,6,3,.29)!important
}
.arena-hud.open .arena-primary{background:linear-gradient(135deg,#d6b36e,#a97d42)!important;color:#241b11!important;box-shadow:0 12px 30px rgba(169,125,66,.24)!important}
.arena-hud.open .leaderboard>div:first-child{background:rgba(214,179,110,.13)!important;border-color:rgba(230,193,123,.25)!important}
@media(min-width:901px) and (pointer:fine){
  body.komo-world-desktop .twin-left{width:285px!important}.twin-cockpit.open .twin-right{width:300px!important}
  body.komo-world-desktop .arena-left{left:28px!important;top:150px!important;width:320px!important}
  body.komo-world-desktop .arena-right{right:28px!important;top:150px!important;width:340px!important}
  body.komo-world-desktop .arena-top{left:28px!important;right:28px!important;top:22px!important}
}
`;
document.head.appendChild(style);

window.KomoV135={version:'0.13.5',spawnRadius:1.18,twinPremium:true,arenaPremium:true,currentSnapshot:current.snapshot_id};

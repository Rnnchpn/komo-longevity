import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { TwinCore, SOURCE_CATALOG } from '../v04/twin-core.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#world-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaeb4a7);
scene.fog = new THREE.Fog(0xaeb4a7, 72, 170);
const camera = new THREE.PerspectiveCamera(46, 1, .1, 320);
const clock = new THREE.Clock();
const core = new TwinCore();

const C = {
  stone:0xcdbda2, stone2:0xaa9c84, sage:0x7f947f, sageLight:0xa9b9a5,
  bronze:0x78614c, dark:0x111914, floor:0x263128, sand:0xdcc7a5,
  water:0x6e8580, glass:0xadc0b4, warn:0xd0a76f, light:0xf4ecdf,
  green:0xaac7a2, earth:0x5e684f, rock:0x7c796d, seaDeep:0x58716e
};
const mat = (color, rough=.76, metal=.02) => new THREE.MeshStandardMaterial({ color, roughness:rough, metalness:metal });
const glassMat = (opacity=.42) => new THREE.MeshPhysicalMaterial({ color:C.glass, roughness:.22, metalness:.02, transparent:true, opacity, transmission:.24, depthWrite:true });
const glowMat = (color, intensity=.75, opacity=1) => new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:intensity, transparent:opacity<1, opacity, depthWrite:opacity===1 });

scene.add(new THREE.HemisphereLight(0xfff6e8, 0x324235, 2.25));
const sun = new THREE.DirectionalLight(0xffead0, 3.2);
sun.position.set(-28,44,30); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-80;sun.shadow.camera.right=80;sun.shadow.camera.top=80;sun.shadow.camera.bottom=-80;scene.add(sun);
const coolFill=new THREE.DirectionalLight(0xc8d8ca,1.15);coolFill.position.set(30,20,-28);scene.add(coolFill);

// -----------------------------------------------------------------------------
// SETTINGS / PLAYER PREFERENCES
// -----------------------------------------------------------------------------
const defaults={
  preset:'wasd',
  bindings:{forward:'w',backward:'s',left:'a',right:'d',sprint:'shift',interact:'e',map:'m',settings:'escape',resetCamera:'r'},
  camera:{sensX:1,sensY:1,distance:21,invertY:false},
  mobile:{joystickSize:116,joystickOpacity:.62,leftHanded:false}
};
const clone=(v)=>JSON.parse(JSON.stringify(v));
function loadSettings(){
  try{
    const s=JSON.parse(localStorage.getItem('komo_world_controls_v06')||'null');
    return s?{...clone(defaults),...s,bindings:{...defaults.bindings,...s.bindings},camera:{...defaults.camera,...s.camera},mobile:{...defaults.mobile,...s.mobile}}:clone(defaults);
  }catch{return clone(defaults)}
}
let settings=loadSettings();
const keyName=(k)=>({arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',' ':'Space',escape:'Esc',shift:'Shift',control:'Ctrl',alt:'Alt'}[k]||(k?.length===1?k.toUpperCase():k));
const normalizeKey=(e)=>e.key===' '?' ':e.key.toLowerCase();
function persist(){localStorage.setItem('komo_world_controls_v06',JSON.stringify(settings));applySettingsUI();}

const bindingLabels={forward:'Move Forward',backward:'Move Backward',left:'Move Left',right:'Move Right',sprint:'Sprint',interact:'Interact',map:'World Map',settings:'Settings',resetCamera:'Reset Camera'};
let listening=null;
function renderBindings(){
  $('#bindings').innerHTML=Object.entries(bindingLabels).map(([id,label])=>`<div class="binding-row"><span>${label}</span><button data-bind="${id}" class="${listening===id?'listening':''}">${listening===id?'Press key':keyName(settings.bindings[id])}</button></div>`).join('');
  document.querySelectorAll('[data-bind]').forEach(b=>b.onclick=()=>{listening=b.dataset.bind;settings.preset='custom';renderBindings();});
}
function applySettingsUI(){
  renderBindings();
  document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('active',b.dataset.preset===settings.preset));
  $('#sens-x').value=settings.camera.sensX;$('#sens-y').value=settings.camera.sensY;$('#camera-distance').value=settings.camera.distance;$('#invert-y').checked=settings.camera.invertY;
  $('#joy-size').value=settings.mobile.joystickSize;$('#joy-opacity').value=settings.mobile.joystickOpacity;$('#left-handed').checked=settings.mobile.leftHanded;
  document.documentElement.style.setProperty('--joy-size',`${settings.mobile.joystickSize}px`);document.documentElement.style.setProperty('--joy-opacity',settings.mobile.joystickOpacity);
  $('#mobile-controls').classList.toggle('left-handed',settings.mobile.leftHanded);
}
const presetBindings={
  wasd:{forward:'w',backward:'s',left:'a',right:'d'},
  zqsd:{forward:'z',backward:'s',left:'q',right:'d'},
  arrows:{forward:'arrowup',backward:'arrowdown',left:'arrowleft',right:'arrowright'}
};
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
  const p=b.dataset.preset;settings.preset=p;
  if(presetBindings[p])settings.bindings={...settings.bindings,...presetBindings[p]};persist();
});
window.addEventListener('keydown',e=>{
  if(listening){e.preventDefault();settings.bindings[listening]=normalizeKey(e);listening=null;persist();return;}
});
['sens-x','sens-y','camera-distance'].forEach(id=>$('#'+id).addEventListener('input',()=>{
  settings.camera.sensX=Number($('#sens-x').value);settings.camera.sensY=Number($('#sens-y').value);settings.camera.distance=Number($('#camera-distance').value);persist();
}));
$('#invert-y').onchange=()=>{settings.camera.invertY=$('#invert-y').checked;persist()};
$('#joy-size').oninput=()=>{settings.mobile.joystickSize=Number($('#joy-size').value);persist()};
$('#joy-opacity').oninput=()=>{settings.mobile.joystickOpacity=Number($('#joy-opacity').value);persist()};
$('#left-handed').onchange=()=>{settings.mobile.leftHanded=$('#left-handed').checked;persist()};
$('#reset-controls').onclick=()=>{settings=clone(defaults);persist();toast('Controls reset')};
applySettingsUI();

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
function roundedRect(ctx,x,y,w,h,r){
  if(ctx.roundRect){ctx.beginPath();ctx.roundRect(x,y,w,h,r);return;}
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
function makeLabel(text,{width=720,height=150,font=30,scaleX=4.5,scaleY=.92,bg='rgba(19,26,21,.79)',color='#f5efe4',panel=true}={}){
  const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');
  if(panel){x.fillStyle=bg;roundedRect(x,45,20,width-90,height-40,28);x.fill();x.strokeStyle='rgba(255,255,255,.16)';x.stroke();}
  x.font=`500 ${font}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillStyle=color;x.fillText(text,width/2,height/2);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sp.scale.set(scaleX,scaleY,1);return sp;
}
function box(w,h,d,material,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m}
function cylinder(r1,r2,h,segments,material,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m}
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1900)}

// -----------------------------------------------------------------------------
// WORLD / CORE ISLAND
// -----------------------------------------------------------------------------
const water=new THREE.Mesh(new THREE.CircleGeometry(150,180),new THREE.MeshPhysicalMaterial({color:C.water,roughness:.24,metalness:.02,transparent:true,opacity:.9,transmission:.06}));
water.rotation.x=-Math.PI/2;water.position.y=-1.34;scene.add(water);
const waterGlow=new THREE.Mesh(new THREE.RingGeometry(58,125,160),new THREE.MeshBasicMaterial({color:0xb9c8bd,transparent:true,opacity:.06,side:THREE.DoubleSide}));waterGlow.rotation.x=-Math.PI/2;waterGlow.position.y=-1.28;scene.add(waterGlow);
const island=cylinder(57,61,2.35,144,mat(0x515e4c,.98),0,-1.2,0);scene.add(island);
const islandTop=new THREE.Mesh(new THREE.CircleGeometry(56.8,144),mat(0x748069,.97));islandTop.rotation.x=-Math.PI/2;islandTop.position.y=-.02;islandTop.receiveShadow=true;scene.add(islandTop);

// Coastal stones / relief
for(let i=0;i<56;i++){
  const a=i/56*Math.PI*2;const r=56.1+Math.sin(i*2.7)*.8;const s=.55+(i%5)*.12;
  const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),mat(i%3?C.rock:0x6d7165,.94));rock.position.set(Math.cos(a)*r,-.2+Math.sin(i)*.12,Math.sin(a)*r);rock.scale.set(1.5,.7,1);rock.rotation.set(Math.sin(i)*.4,a,.2);scene.add(rock);
}
function tree(x,z,s=1){
  const g=new THREE.Group();const trunk=cylinder(.16*s,.24*s,2.5*s,9,mat(0x64503e,.95),0,1.25*s,0);g.add(trunk);
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.35*s,2),mat(C.sage,.98));crown.scale.set(.9,1.35,.9);crown.position.y=3.18*s;crown.castShadow=true;g.add(crown);g.position.set(x,0,z);scene.add(g);return g;
}
function shrub(x,z,s=.7){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,1),mat(0x71866d,.98));m.scale.set(1.3,.65,1);m.position.set(x,.45*s,z);m.castShadow=true;scene.add(m)}
function lamp(x,z){
  const g=new THREE.Group();g.add(cylinder(.045,.07,2.8,10,mat(C.bronze,.48,.42),0,1.4,0));
  const orb=new THREE.Mesh(new THREE.SphereGeometry(.13,14,10),glowMat(0xffdeb2,1.5));orb.position.y=2.86;g.add(orb);const l=new THREE.PointLight(0xffd7a4,4.4,8,2);l.position.y=2.86;g.add(l);g.position.set(x,0,z);scene.add(g);
}
[[-15,34],[15,34],[-18,25],[18,25],[-22,15],[22,15],[-28,2],[28,2],[-34,-13],[34,-13],[-29,-31],[29,-31],[-10,-43],[11,-44]].forEach(([x,z],i)=>tree(x,z,.72+(i%4)*.08));
[[-10,28],[10,28],[-14,18],[14,18],[-23,7],[23,7],[-30,-5],[30,-5]].forEach(([x,z])=>shrub(x,z,.62));
[[-6.3,29],[6.3,29],[-6.3,20],[6.3,20],[-6.3,11],[6.3,11]].forEach(([x,z])=>lamp(x,z));

// Arrival Plaza / spawn axis
const plaza=cylinder(18,18,.2,96,mat(C.stone,.91),0,.06,32);scene.add(plaza);
const path=box(10,.14,43,mat(0xb8aa92,.93),0,.07,11.5);scene.add(path);
for(let i=0;i<10;i++){const strip=box(10.4,.02,.06,new THREE.MeshBasicMaterial({color:0xf0e7d6,transparent:true,opacity:.2}),0,.15,29-i*4.1);scene.add(strip)}
const spawnRing=new THREE.Mesh(new THREE.RingGeometry(2.2,2.5,72),new THREE.MeshBasicMaterial({color:C.sand,transparent:true,opacity:.55,side:THREE.DoubleSide}));spawnRing.rotation.x=-Math.PI/2;spawnRing.position.set(0,.17,41);scene.add(spawnRing);
const spawnLabel=makeLabel('KŌMØ ARRIVAL',{scaleX:3.5,scaleY:.7,font:26});spawnLabel.position.set(0,4.2,41);scene.add(spawnLabel);

// World map sculpture
const mapBase=cylinder(3.5,3.9,.5,64,mat(0x263129,.7,.18),-12,.25,34);scene.add(mapBase);
const globeGroup=new THREE.Group();globeGroup.position.set(-12,3.1,34);scene.add(globeGroup);
const globe=new THREE.Mesh(new THREE.SphereGeometry(1.65,40,28),new THREE.MeshPhysicalMaterial({color:0x82978e,roughness:.28,metalness:.06,transparent:true,opacity:.53,transmission:.14}));globeGroup.add(globe);
[0,Math.PI/3,-Math.PI/3].forEach((r,i)=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(1.86,.025,8,80),new THREE.MeshBasicMaterial({color:i?C.sageLight:C.sand,transparent:true,opacity:.58}));ring.rotation.set(r,.1,r/2);globeGroup.add(ring)});
const mapLabel=makeLabel('WORLD MAP',{scaleX:2.7,scaleY:.58,font:23});mapLabel.position.set(-12,5.55,34);scene.add(mapLabel);

// -----------------------------------------------------------------------------
// THE KŌMØ HALL
// -----------------------------------------------------------------------------
const hall=new THREE.Group();hall.position.set(0,0,-10);scene.add(hall);
const hallFloor=box(44,.35,30,mat(0xb9ad96,.91),0,.18,0);hall.add(hallFloor);
// split back wall to create readable portals
[[-16,8],[-4.5,5],[4.5,5],[16,8]].forEach(([x,w])=>hall.add(box(w,9,.5,mat(0xb5a98f,.87),x,4.5,-14.75)));
hall.add(box(.5,9,30,mat(0xb5a98f,.87),-21.75,4.5,0));hall.add(box(.5,9,30,mat(0xb5a98f,.87),21.75,4.5,0));
// roof frame + skylight
hall.add(box(45,1,5,mat(0x61685e,.6,.15),0,9.15,-12.2));hall.add(box(45,1,5,mat(0x61685e,.6,.15),0,9.15,12.2));
for(let z=-8;z<=8;z+=4){hall.add(box(45,.22,.34,mat(C.bronze,.52,.35),0,9.05,z))}
const skylight=new THREE.Mesh(new THREE.PlaneGeometry(43,18),glassMat(.24));skylight.rotation.x=Math.PI/2;skylight.position.set(0,9.08,0);hall.add(skylight);
for(let i=-4;i<=4;i++){
  if(Math.abs(i)<1)continue;const col=cylinder(.32,.4,8.65,18,mat(0xcdbda2,.84),i*4.5,4.32,14.1);hall.add(col);
}
const hallSign=makeLabel('THE KŌMØ HALL',{scaleX:5.5,scaleY:1.02,font:31});hallSign.position.set(0,8.05,14.5);hall.add(hallSign);
const atriumLight=new THREE.PointLight(0xffe5bd,38,36,2);atriumLight.position.set(0,7,1);hall.add(atriumLight);

// Desk
const desk=new THREE.Group();desk.position.set(0,0,5);hall.add(desk);
desk.add(box(8.3,1.55,1.65,mat(0x6e6557,.53,.2),0,.78,0));desk.add(box(8.7,.18,1.95,mat(0xd9c5a5,.65),0,1.62,0));
desk.add(box(5.4,.07,.04,new THREE.MeshBasicMaterial({color:C.sageLight,transparent:true,opacity:.7}),0,1.08,.84));
const deskLabel=makeLabel('KŌMØ DESK',{scaleX:2.8,scaleY:.62,font:24});deskLabel.position.set(0,3.25,0);desk.add(deskLabel);

// Concierge NPC
function humanoid({body=0x889784,skin=0xbc8869,hologram=false}={}){
  const g=new THREE.Group();const bm=hologram?new THREE.MeshPhysicalMaterial({color:body,roughness:.2,transparent:true,opacity:.48,transmission:.15,emissive:0x314b38,emissiveIntensity:.35}):mat(body,.7);const sm=hologram?bm:mat(skin,.68);
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.5,1.28,7,14),bm);torso.position.y=2.75;g.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.45,24,18),sm);head.position.y=4.2;g.add(head);
  const limbs={};[['la',-.67],['ra',.67]].forEach(([n,x])=>{const p=new THREE.Group();p.position.set(x,3.3,0);const m=new THREE.Mesh(new THREE.CapsuleGeometry(.14,1.02,5,10),sm);m.position.y=-.58;p.add(m);g.add(p);limbs[n]=p});
  [['ll',-.26],['rl',.26]].forEach(([n,x])=>{const p=new THREE.Group();p.position.set(x,1.9,0);const m=new THREE.Mesh(new THREE.CapsuleGeometry(.19,1.32,5,10),bm);m.position.y=-.77;p.add(m);g.add(p);limbs[n]=p});g.userData.limbs=limbs;return g;
}
const concierge=humanoid({body:0x716f62,skin:0xc08b6e});concierge.scale.set(.9,.9,.9);concierge.position.set(0,.05,3.7);concierge.rotation.y=Math.PI;hall.add(concierge);
const conciergeLabel=makeLabel('KŌMØ CONCIERGE',{scaleX:2.55,scaleY:.55,font:21});conciergeLabel.position.set(0,5.05,3.7);hall.add(conciergeLabel);

function doorway(name,x,z,color=C.sage,rot=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;hall.add(g);const fm=mat(color,.55,.14);
  g.add(box(.28,4.7,.38,fm,-1.58,2.35,0));g.add(box(.28,4.7,.38,fm,1.58,2.35,0));g.add(box(3.45,.28,.38,fm,0,4.58,0));
  const leftPane=box(1.4,4.05,.06,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.09}),-.74,2.25,0);const rightPane=leftPane.clone();rightPane.position.x=.74;g.add(leftPane,rightPane);
  const label=makeLabel(name,{scaleX:2.55,scaleY:.56,font:21});label.position.y=5.3;g.add(label);return{group:g,leftPane,rightPane,open:0};
}
const doors={
  twin:doorway('01 · TWIN LAB',-10.5,-14.55,C.sand,0),
  rehab:doorway('02 · REHAB',10.5,-14.55,C.sageLight,0),
  library:doorway('03 · LIBRARY',-21.5,-2,C.sage,Math.PI/2),
  theatre:doorway('04 · AMPHITHEATRE',21.5,-3,C.stone2,-Math.PI/2),
  store:doorway('05 · STORE',21.5,6,C.bronze,-Math.PI/2)
};

// Twin Lab room beyond back wall
const twinLab=new THREE.Group();twinLab.position.set(-10.5,0,-30);scene.add(twinLab);
const twinLabFloor=new THREE.Mesh(new THREE.CircleGeometry(10.5,72),mat(0x252e27,.87));twinLabFloor.rotation.x=-Math.PI/2;twinLabFloor.position.y=.05;twinLab.add(twinLabFloor);
const twinRing=new THREE.Mesh(new THREE.RingGeometry(3.8,4.05,80),new THREE.MeshBasicMaterial({color:C.sand,transparent:true,opacity:.48,side:THREE.DoubleSide}));twinRing.rotation.x=-Math.PI/2;twinRing.position.y=.08;twinLab.add(twinRing);
const twin=humanoid({body:C.sageLight,hologram:true});twin.position.y=.12;twinLab.add(twin);
const twinLabel=makeLabel('FUNCTIONAL DIGITAL TWIN',{scaleX:4.1,scaleY:.78,font:25});twinLabel.position.set(0,6.2,0);twinLab.add(twinLabel);
const twinGlow=new THREE.Mesh(new THREE.CapsuleGeometry(.31,.94,6,14),glowMat(C.warn,1.3,.42));twinGlow.position.set(-.26,1.15,.02);twinLab.add(twinGlow);
const halo1=new THREE.Mesh(new THREE.TorusGeometry(2.1,.025,8,80),new THREE.MeshBasicMaterial({color:C.green,transparent:true,opacity:.5}));halo1.position.y=2.6;halo1.rotation.x=Math.PI/2;twinLab.add(halo1);const halo2=halo1.clone();halo2.rotation.set(0,Math.PI/2,0);twinLab.add(halo2);
const sourceVisuals=new Map();
SOURCE_CATALOG.forEach((s,i)=>{
  const a=i/SOURCE_CATALOG.length*Math.PI*2;const r=7.1;const g=new THREE.Group();g.position.set(Math.cos(a)*r,1.1,Math.sin(a)*r);const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,2),glowMat(i%2?C.sand:C.sageLight,.32));g.add(orb);const label=makeLabel(s.label,{scaleX:2.05,scaleY:.46,font:19});label.position.y=.82;g.add(label);twinLab.add(g);sourceVisuals.set(s.id,{g,orb,baseY:g.position.y,phase:a});
});

// baseline / today ghosts for comparison feel
const baselineTwin=humanoid({body:C.sand,hologram:true});baselineTwin.scale.set(.82,.82,.82);baselineTwin.position.set(-4.2,.1,0);baselineTwin.visible=false;twinLab.add(baselineTwin);
const todayTwin=humanoid({body:C.sageLight,hologram:true});todayTwin.scale.set(.82,.82,.82);todayTwin.position.set(4.2,.1,0);todayTwin.visible=false;twinLab.add(todayTwin);

// Locked Riviera frontier
const frontier=new THREE.Group();frontier.position.set(39,0,14);scene.add(frontier);
frontier.add(box(.55,6,.6,mat(C.bronze,.52,.32),-3,3,0));frontier.add(box(.55,6,.6,mat(C.bronze,.52,.32),3,3,0));frontier.add(box(6.5,.55,.6,mat(C.bronze,.52,.32),0,5.7,0));
const barrier=new THREE.Mesh(new THREE.PlaneGeometry(5.7,5.1),new THREE.MeshBasicMaterial({color:C.warn,transparent:true,opacity:.1,side:THREE.DoubleSide}));barrier.position.y=3;frontier.add(barrier);
const frontierLabel=makeLabel('RIVIERA FRONTIER · LOCKED',{scaleX:3.7,scaleY:.64,font:22,bg:'rgba(40,31,21,.78)'});frontierLabel.position.y=7;frontier.add(frontierLabel);
for(let i=0;i<5;i++){const beacon=new THREE.Mesh(new THREE.SphereGeometry(.2,14,10),glowMat(C.sand,1.4));beacon.position.set(8+i*3,1.2+Math.sin(i)*.4,-4-i*1.8);frontier.add(beacon)}

// Future destination silhouettes outside frontier
for(let i=0;i<6;i++){const tower=box(1.6+(i%3)*.5,3+i%4,1.6,mat(0x7b806f,.92),51+i*3.5,(3+i%4)/2,7-i*4);tower.material.transparent=true;tower.material.opacity=.35;scene.add(tower)}

// -----------------------------------------------------------------------------
// PLAYER + COLLISIONS
// -----------------------------------------------------------------------------
function storedAvatar(){try{return JSON.parse(localStorage.getItem('komo_world_avatar_v02')||'{}')}catch{return{}}}
const profile=storedAvatar();
const player=humanoid({body:profile.outfit==='sand'?0xcdb995:0x879783,skin:profile.skin==='brown'?0x79503b:profile.skin==='deep'?0x4f332a:profile.skin==='light'?0xe3c0a8:0xbc8869});
player.scale.set(.92,.92,.92);player.position.set(0,0,41);player.rotation.y=Math.PI;scene.add(player);
const PLAYER_RADIUS=.62;
const colliders=[];
function addCollider(x,z,w,d,enabled=()=>true){colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,enabled});}
// hall side walls and back pieces (world coords: hall z -10)
addCollider(-21.75,-10,.7,30);addCollider(21.75,-10,.7,30);
addCollider(-16,-24.75,8,.7);addCollider(-4.5,-24.75,5,.7);addCollider(4.5,-24.75,5,.7);addCollider(16,-24.75,8,.7);
// desk
addCollider(0,-5,8.8,2.2);
// frontier barrier
addCollider(39,14,1.1,8);
function collides(x,z){
  if(Math.hypot(x,z)>55)return true;
  return colliders.some(c=>c.enabled()&&x+PLAYER_RADIUS>c.minX&&x-PLAYER_RADIUS<c.maxX&&z+PLAYER_RADIUS>c.minZ&&z-PLAYER_RADIUS<c.maxZ);
}

// -----------------------------------------------------------------------------
// INTERACTIONS / QUEST
// -----------------------------------------------------------------------------
let quest=0;let currentInteraction=null;let labMode=false;let selectedSource=null;
const interactions=[];
function addInteraction(id,x,z,r,title,copy,action){interactions.push({id,x,z,r,title,copy,action})}
addInteraction('desk',0,-2.2,4.3,'Talk to KŌMØ Concierge','Today · orientation · next step',()=>openDesk());
addInteraction('map',-12,34,5,'Open World Map','Core Island and future regions',()=>$('#world-map-panel').classList.add('open'));
addInteraction('twinDoor',-10.5,-23.4,3.6,'Enter Twin Lab','Functional Digital Twin',()=>enterTwinLab());
addInteraction('rehab',10.5,-23.4,3.6,'Enter Rehab','Gym + Coach Agent · next build',()=>openShell('REHAB','Gym + Coach Agent','This wing is reserved for the deficit-driven training loop. The next vertical slice will connect your Twin priorities to an authorised exercise session.'));
addInteraction('library',-20,-12,3.7,'Enter Library','Knowledge space · planned',()=>openShell('LIBRARY','A real spatial library','Walkable collections, scientific sources and a future Librarian Agent. The room shell is placed; content systems come next.'));
addInteraction('theatre',20,-13,3.7,'Enter Amphitheatre','Events · Locotech · planned',()=>openShell('AMPHITHEATRE','KŌMŌ talks and Locotech','A persistent stage for live talks, replays, expert sessions and community events.'));
addInteraction('store',20,-4,3.7,'Enter Store','KŌMŌ Life + World economy · planned',()=>openShell('STORE','KŌMŌ Store','Physical KŌMŌ Life, avatar cosmetics and experiences will live here without pay-to-win health mechanics.'));
addInteraction('frontier',36.3,14,4.6,'Inspect Riviera Frontier','Locked until real partner nodes are ready',()=>openFrontier());
addInteraction('twinCore',-10.5,-30,6.2,'Inspect your Twin','Measured + derived + longitudinal',()=>showTwinPanel());

function nearestInteraction(){
  if(labMode){const it=interactions.find(x=>x.id==='twinCore');const d=Math.hypot(player.position.x-it.x,player.position.z-it.z);return d<it.r?it:null;}
  let best=null,bestD=Infinity;for(const it of interactions){if(it.id==='twinCore')continue;const d=Math.hypot(player.position.x-it.x,player.position.z-it.z);if(d<it.r&&d<bestD){best=it;bestD=d}}return best;
}
function refreshInteraction(){
  currentInteraction=nearestInteraction();const el=$('#interaction');
  if(!currentInteraction){el.classList.remove('show');$('#mobile-action').textContent='ACTION';return;}
  $('#interaction-key').textContent=keyName(settings.bindings.interact);$('#interaction-title').textContent=currentInteraction.title;$('#interaction-copy').textContent=currentInteraction.copy;el.classList.add('show');
  $('#mobile-action').textContent=currentInteraction.id==='frontier'?'LOCK':currentInteraction.id==='desk'?'TALK':currentInteraction.id==='map'?'MAP':'ENTER';
}
function runInteraction(){if(currentInteraction)currentInteraction.action()}
function openPanel(kicker,title,html){$('#panel-kicker').textContent=kicker;$('#panel-title').textContent=title;$('#panel-body').innerHTML=html;$('#panel').classList.add('open')}
function closePanels(){['#panel','#world-map-panel','#settings'].forEach(s=>$(s).classList.remove('open'))}
$('#panel-close').onclick=()=>$('#panel').classList.remove('open');$('#map-close').onclick=()=>$('#world-map-panel').classList.remove('open');
function openDesk(){
  if(quest===0){quest=1;$('#quest-copy').textContent='02 · Enter the Functional Digital Twin Lab';toast('Objective updated · Twin Lab')}
  openPanel('KŌMØ CONCIERGE','Good evening.',`<p>Your latest demo snapshot is stable. The strongest current priority is the left lower limb. Start with the Functional Digital Twin before entering Rehab.</p><div class="info-grid"><div><span>Motion Score</span><b>84</b></div><div><span>Motion Age</span><b>39</b></div><div><span>Priority</span><b>Left quad</b></div><div><span>World</span><b>Core Island</b></div></div><div class="cta-list"><button class="primary" data-go="twin">Guide me to Twin Lab</button><button data-go="map">Open World Map</button></div>`);
  $('[data-go="twin"]').onclick=()=>{closePanels();highlightDoor('twin');};$('[data-go="map"]').onclick=()=>{$('#panel').classList.remove('open');$('#world-map-panel').classList.add('open')};
}
function openFrontier(){openPanel('RIVIERA FRONTIER','Riviera is forming.',`<p>This border opens when real KŌMŌ partner nodes are operational. World expansion follows the real network — not an arbitrary player level.</p><div class="info-grid"><div><span>Cannes</span><b>Partner layer</b></div><div><span>Monaco</span><b>Future node</b></div><div><span>Saint-Tropez</span><b>Future node</b></div><div><span>Status</span><b style="color:#ddb986">LOCKED</b></div></div>`)}
function openShell(kicker,title,copy){openPanel(kicker,title,`<p>${copy}</p><div class="info-grid"><div><span>World state</span><b>Shell placed</b></div><div><span>Agent</span><b>Reserved</b></div></div>`)}
function highlightDoor(id){const d=doors[id];if(!d)return;d.leftPane.material.opacity=.32;d.rightPane.material.opacity=.32;setTimeout(()=>{d.leftPane.material.opacity=.09;d.rightPane.material.opacity=.09},1800)}

// -----------------------------------------------------------------------------
// TWIN LAB / REAL V0.4 CORE DATA MODEL
// -----------------------------------------------------------------------------
function renderTwinSources(){
  $('#twin-sources').innerHTML=SOURCE_CATALOG.map(s=>`<button data-source="${s.id}">${s.label}</button>`).join('');
  document.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>focusSource(b.dataset.source));
}
renderTwinSources();
function updateTwin(snapshot){
  $('#hud-motion').textContent=snapshot.motion_score;$('#hud-age').textContent=snapshot.motion_age;$('#twin-snapshot').textContent=snapshot.label.toUpperCase();
  $('#twin-muscle').textContent=snapshot.domains.muscle;$('#twin-mobility').textContent=snapshot.domains.mobility;$('#twin-balance').textContent=snapshot.domains.balance;$('#twin-posture').textContent=snapshot.domains.posture;
  const intensity=snapshot.overlays?.left_thigh?.intensity??.5;twinGlow.material.opacity=.16+intensity*.5;twinGlow.material.emissiveIntensity=.4+intensity*1.8;twinGlow.scale.setScalar(.9+intensity*.24);
}
updateTwin(core.current());
$('#timeline').oninput=()=>{const snap=core.setTimeIndex(Number($('#timeline').value));updateTwin(snap);baselineTwin.visible=Number($('#timeline').value)===0;todayTwin.visible=false;twin.visible=Number($('#timeline').value)!==0;};
function focusSource(id){
  selectedSource=id;document.querySelectorAll('[data-source]').forEach(b=>b.classList.toggle('active',b.dataset.source===id));sourceVisuals.forEach((v,key)=>{v.orb.material.emissiveIntensity=key===id?1.7:.32;v.orb.scale.setScalar(key===id?1.42:1)});
  const src=SOURCE_CATALOG.find(s=>s.id===id);const snap=core.current();const provenance=snap.sources?.[id]||{};
  openPanel('TWIN · DATA PROVENANCE',src?.label||id,`<p>This layer belongs to the dated Twin snapshot. AI can explain and navigate it, but cannot silently rewrite the measurement.</p><div class="info-grid"><div><span>Snapshot</span><b>${snap.label}</b></div><div><span>Status</span><b>${provenance.status||'available'}</b></div><div><span>Quality</span><b>${provenance.quality?Math.round(provenance.quality*100)+'%':'—'}</b></div><div><span>Version</span><b>${snap.provenance_version}</b></div></div>`);
}
function enterTwinLab(){
  labMode=true;closePanels();player.position.set(-10.5,0,-22.8);yaw=Math.PI;quest=Math.max(quest,2);$('#quest-copy').textContent='03 · Explore your Twin, then continue to Rehab';$('#twin-hud').classList.add('open');$('#location-name').textContent='FUNCTIONAL DIGITAL TWIN LAB';
  doors.twin.open=1;toast('Twin Lab · longitudinal truth layer');
}
function leaveTwinLab(){labMode=false;player.position.set(-8.8,0,-20.8);$('#twin-hud').classList.remove('open');$('#location-name').textContent='KŌMØ HALL · ATRIUM';closePanels();doors.twin.open=0}
$('#twin-exit').onclick=leaveTwinLab;
function showTwinPanel(){const snap=core.current();openPanel('FUNCTIONAL DIGITAL TWIN',`Motion Score ${snap.motion_score}`,`<p>Your Twin combines dated measurements and derived domains. The current demo priority is visualised on the left thigh.</p><div class="info-grid"><div><span>Muscle</span><b>${snap.domains.muscle}</b></div><div><span>Mobility</span><b>${snap.domains.mobility}</b></div><div><span>Balance</span><b>${snap.domains.balance}</b></div><div><span>Posture</span><b>${snap.domains.posture}</b></div></div>`)}

// -----------------------------------------------------------------------------
// INPUT / MOBILE TWIN-STICK
// -----------------------------------------------------------------------------
const keys=new Set();let yaw=0,pitch=.11;let mouseDragging=false,lastMouse={x:0,y:0};
window.addEventListener('keydown',e=>{
  if(listening)return;const k=normalizeKey(e);keys.add(k);
  if(k===settings.bindings.interact){e.preventDefault();runInteraction()}
  if(k===settings.bindings.map){e.preventDefault();$('#world-map-panel').classList.toggle('open')}
  if(k===settings.bindings.settings){e.preventDefault();$('#settings').classList.toggle('open')}
  if(k===settings.bindings.resetCamera){yaw=0;pitch=.11;toast('Camera reset')}
});
window.addEventListener('keyup',e=>keys.delete(normalizeKey(e)));
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;mouseDragging=true;lastMouse={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId)});
canvas.addEventListener('pointerup',()=>mouseDragging=false);canvas.addEventListener('pointercancel',()=>mouseDragging=false);
canvas.addEventListener('pointermove',e=>{if(!mouseDragging)return;yaw-=(e.clientX-lastMouse.x)*.0034*settings.camera.sensX;const sign=settings.camera.invertY?1:-1;pitch=THREE.MathUtils.clamp(pitch+sign*(e.clientY-lastMouse.y)*.0022*settings.camera.sensY,-.12,.48);lastMouse={x:e.clientX,y:e.clientY}});

const joy={x:0,y:0,pointer:null};const joyZone=$('#joystick-zone'),joyKnob=$('#joystick-knob');
function updateJoy(e){const r=joyZone.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const max=settings.mobile.joystickSize*.34;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy);if(len>max){dx=dx/len*max;dy=dy/len*max}joy.x=dx/max;joy.y=dy/max;joyKnob.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;}
joyZone.addEventListener('pointerdown',e=>{e.preventDefault();joy.pointer=e.pointerId;joyZone.setPointerCapture?.(e.pointerId);updateJoy(e)});joyZone.addEventListener('pointermove',e=>{if(e.pointerId===joy.pointer)updateJoy(e)});function resetJoy(e){if(joy.pointer!==null&&(!e||e.pointerId===joy.pointer)){joy.pointer=null;joy.x=joy.y=0;joyKnob.style.transform='translate(-50%,-50%)'}}joyZone.addEventListener('pointerup',resetJoy);joyZone.addEventListener('pointercancel',resetJoy);
const lookZone=$('#look-zone');let lookPointer=null,lookLast=null;lookZone.addEventListener('pointerdown',e=>{e.preventDefault();lookPointer=e.pointerId;lookLast={x:e.clientX,y:e.clientY};lookZone.setPointerCapture?.(e.pointerId)});lookZone.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer||!lookLast)return;const dx=e.clientX-lookLast.x,dy=e.clientY-lookLast.y;yaw-=dx*.0041*settings.camera.sensX;const sign=settings.camera.invertY?1:-1;pitch=THREE.MathUtils.clamp(pitch+sign*dy*.0028*settings.camera.sensY,-.12,.48);lookLast={x:e.clientX,y:e.clientY}});function resetLook(e){if(e.pointerId===lookPointer){lookPointer=null;lookLast=null}}lookZone.addEventListener('pointerup',resetLook);lookZone.addEventListener('pointercancel',resetLook);$('#mobile-action').onclick=runInteraction;

$('#settings-open').onclick=()=>$('#settings').classList.add('open');$('#settings-close').onclick=()=>$('#settings').classList.remove('open');
$('#intro-enter').onclick=()=>$('#intro').classList.add('hidden');

// -----------------------------------------------------------------------------
// MOVEMENT / CAMERA / ZONES
// -----------------------------------------------------------------------------
const desiredCamera=new THREE.Vector3(),lookTarget=new THREE.Vector3();let currentZone='ARRIVAL PLAZA';
function zoneFor(x,z){
  if(labMode)return'FUNCTIONAL DIGITAL TWIN LAB';
  if(x>31&&z>7)return'RIVIERA FRONTIER';
  if(z<-24&&x<-2)return'TWIN LAB APPROACH';
  if(z<5&&z>-25&&Math.abs(x)<22)return'KŌMŌ HALL · ATRIUM';
  if(z>22)return'ARRIVAL PLAZA';
  return'CORE ISLAND';
}
function updateZone(){const z=zoneFor(player.position.x,player.position.z);if(z!==currentZone){currentZone=z;$('#location-name').textContent=z}}
function movement(dt){
  const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const f=keys.has(settings.bindings.forward),b=keys.has(settings.bindings.backward),l=keys.has(settings.bindings.left),r=keys.has(settings.bindings.right);const move=new THREE.Vector3();
  if(f)move.add(forward);if(b)move.sub(forward);if(l)move.sub(right);if(r)move.add(right);
  if(Math.abs(joy.x)>.04||Math.abs(joy.y)>.04){move.addScaledVector(right,joy.x);move.addScaledVector(forward,-joy.y)}
  const strength=Math.min(1,Math.max(move.length(),Math.hypot(joy.x,joy.y)));const sprint=keys.has(settings.bindings.sprint);const speed=(sprint?7.4:4.4)*(strength||1);const moving=move.lengthSq()>.0025;
  if(moving){move.normalize();const nx=player.position.x+move.x*speed*dt,nz=player.position.z+move.z*speed*dt;if(!collides(nx,player.position.z)||labMode)player.position.x=nx;if(!collides(player.position.x,nz)||labMode)player.position.z=nz;player.rotation.y=Math.atan2(move.x,move.z)}
  if(labMode){player.position.x=THREE.MathUtils.clamp(player.position.x,-19,-2);player.position.z=THREE.MathUtils.clamp(player.position.z,-39,-21)}
  const t=performance.now()*.012;const limbs=player.userData.limbs;const swing=moving?Math.sin(t*(sprint?1.5:1))*.43:0;limbs.ll.rotation.x=swing;limbs.rl.rotation.x=-swing;limbs.la.rotation.x=-swing*.7;limbs.ra.rotation.x=swing*.7;
  const d=settings.camera.distance;desiredCamera.set(player.position.x+Math.sin(yaw)*d,6.9+pitch*8,player.position.z+Math.cos(yaw)*d);lookTarget.set(player.position.x,2.55,player.position.z);camera.position.lerp(desiredCamera,1-Math.pow(.0025,dt));camera.lookAt(lookTarget);
  const deg=((THREE.MathUtils.radToDeg(yaw)%360)+360)%360;$('#heading').textContent=deg<45||deg>=315?'N':deg<135?'E':deg<225?'S':'W';
  refreshInteraction();updateZone();
}
function animateDoors(dt){Object.values(doors).forEach(d=>{const target=d.open?1:0;d.open=THREE.MathUtils.damp(d.open,target,5,dt);const amount=d.open*1.12;d.leftPane.position.x=-.74-amount;d.rightPane.position.x=.74+amount;});}
function animate(){
  const dt=Math.min(clock.getDelta(),.05);movement(dt);animateDoors(dt);const t=performance.now()*.001;
  water.material.roughness=.21+Math.sin(t*.24)*.02;waterGlow.rotation.z+=dt*.006;globeGroup.rotation.y+=dt*.08;spawnRing.material.opacity=.42+Math.sin(t*1.7)*.13;
  concierge.userData.limbs.la.rotation.x=Math.sin(t*.8)*.05;concierge.userData.limbs.ra.rotation.x=-Math.sin(t*.8)*.05;
  halo1.rotation.z+=dt*.11;halo2.rotation.x+=dt*.07;twin.rotation.y=Math.sin(t*.32)*.07;twinGlow.scale.y=.95+Math.sin(t*2.2)*.05;
  sourceVisuals.forEach(v=>{v.g.position.y=v.baseY+Math.sin(t*1.1+v.phase)*.11;v.orb.rotation.y+=dt*.4});barrier.material.opacity=.08+Math.sin(t*2)*.04;
  renderer.render(scene,camera);requestAnimationFrame(animate);
}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}window.addEventListener('resize',resize);resize();camera.position.set(0,7.2,62);camera.lookAt(0,2.5,41);animate();

toast('KŌMØ World V0.6 · Core Island');

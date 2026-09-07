import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#world-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ca59a);
scene.fog = new THREE.Fog(0x9ca59a, 68, 145);
const camera = new THREE.PerspectiveCamera(47, 1, .1, 260);
const clock = new THREE.Clock();

const C = {
  stone:0xc8b99f, stone2:0xa99d87, sage:0x879b85, sageLight:0xa9b9a6,
  bronze:0x755f49, dark:0x111914, floor:0x263128, sand:0xd8c4a5,
  water:0x657c75, glass:0x9bb1a6, warn:0xd0a76f, light:0xf3eadc, green:0xaac7a2
};
const mat = (color, rough=.76, metal=.02) => new THREE.MeshStandardMaterial({ color, roughness:rough, metalness:metal });
const glass = new THREE.MeshPhysicalMaterial({ color:C.glass, roughness:.22, metalness:.02, transparent:true, opacity:.48, transmission:.24 });
const emissive = (color, intensity=.8, opacity=1) => new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:intensity, transparent:opacity<1, opacity, depthWrite:opacity===1 });

scene.add(new THREE.HemisphereLight(0xf8f0df, 0x243228, 2.1));
const sun = new THREE.DirectionalLight(0xffe8c5, 3.15); sun.position.set(-26, 42, 28); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-70;sun.shadow.camera.right=70;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70; scene.add(sun);
const fill = new THREE.DirectionalLight(0xc5d6c2, 1.1); fill.position.set(30,18,-20); scene.add(fill);

const defaults = {
  preset:'wasd',
  bindings:{ forward:'w', backward:'s', left:'a', right:'d', sprint:'shift', interact:'e', map:'m', ai:'k', settings:'escape', resetCamera:'r' },
  camera:{ sensX:1, sensY:1, distance:21, invertY:false, autoCenter:true },
  mobile:{ joystickSize:116, joystickOpacity:.62, leftHanded:false }
};
function deepCopy(v){return JSON.parse(JSON.stringify(v));}
function loadSettings(){
  try{ const stored=JSON.parse(localStorage.getItem('komo_world_controls_v05')||'null'); return stored ? {...deepCopy(defaults),...stored,bindings:{...defaults.bindings,...stored.bindings},camera:{...defaults.camera,...stored.camera},mobile:{...defaults.mobile,...stored.mobile}} : deepCopy(defaults); }
  catch{return deepCopy(defaults);}
}
let settings=loadSettings();
function saveSettings(){ localStorage.setItem('komo_world_controls_v05',JSON.stringify(settings)); applySettingsUI(); }

function keyName(key){
  const names={arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',' ':'Space',escape:'Esc',shift:'Shift',control:'Ctrl',alt:'Alt'};
  return names[key] || (key.length===1?key.toUpperCase():key);
}
function normalizeKey(e){ return e.key===' ' ? ' ' : e.key.toLowerCase(); }

function makeLabel(text, opts={}){
  const w=opts.width||640,h=opts.height||140; const c=document.createElement('canvas'); c.width=w;c.height=h;const x=c.getContext('2d');
  if(opts.panel!==false){x.fillStyle=opts.bg||'rgba(19,26,21,.78)';x.roundRect(45,20,w-90,h-40,28);x.fill();x.strokeStyle='rgba(255,255,255,.17)';x.stroke();}
  x.font=`${opts.weight||500} ${opts.font||30}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillStyle=opts.color||'#f4efe5';x.fillText(text,w/2,h/2);
  const texture=new THREE.CanvasTexture(c); texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false})); sprite.scale.set(opts.scaleX||4.3,opts.scaleY||.94,1); return sprite;
}

// WORLD / HORIZON
const water = new THREE.Mesh(new THREE.CircleGeometry(130,160),new THREE.MeshPhysicalMaterial({color:C.water,roughness:.2,metalness:.02,transparent:true,opacity:.86,transmission:.08})); water.rotation.x=-Math.PI/2;water.position.y=-1.15;scene.add(water);
const island = new THREE.Mesh(new THREE.CylinderGeometry(55,58,2.2,128),mat(0x53604f,.96)); island.position.y=-1.18; island.receiveShadow=true; scene.add(island);
const islandTop = new THREE.Mesh(new THREE.CircleGeometry(54.7,128),mat(0x6c7864,.95)); islandTop.rotation.x=-Math.PI/2; islandTop.position.y=-.065; islandTop.receiveShadow=true; scene.add(islandTop);

// Arrival axis and plaza
const plaza = new THREE.Mesh(new THREE.CylinderGeometry(18,18,.18,96),mat(C.stone,.9)); plaza.position.set(0,.05,30);plaza.receiveShadow=true;scene.add(plaza);
const path = new THREE.Mesh(new THREE.BoxGeometry(10,.12,38),mat(0xb8aa92,.92)); path.position.set(0,.07,12);path.receiveShadow=true;scene.add(path);
for(let i=0;i<9;i++){
  const strip=new THREE.Mesh(new THREE.BoxGeometry(10.4,.016,.055),new THREE.MeshBasicMaterial({color:0xe9dfcd,transparent:true,opacity:.22}));strip.position.set(0,.14,27-i*4.1);scene.add(strip);
}
const spawnRing=new THREE.Mesh(new THREE.RingGeometry(2.15,2.45,64),new THREE.MeshBasicMaterial({color:C.sand,transparent:true,opacity:.48,side:THREE.DoubleSide}));spawnRing.rotation.x=-Math.PI/2;spawnRing.position.set(0,.16,39);scene.add(spawnRing);
const spawnInner=new THREE.Mesh(new THREE.CircleGeometry(2.05,64),new THREE.MeshBasicMaterial({color:C.sageLight,transparent:true,opacity:.08,side:THREE.DoubleSide}));spawnInner.rotation.x=-Math.PI/2;spawnInner.position.set(0,.155,39);scene.add(spawnInner);
const spawnLabel=makeLabel('KŌMØ ARRIVAL',{scaleX:3.5,scaleY:.74,font:27});spawnLabel.position.set(0,4.2,39);scene.add(spawnLabel);

function tree(x,z,s=1){
  const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18*s,.24*s,2.4*s,10),mat(0x61513f,.92));trunk.position.y=1.2*s;trunk.castShadow=true;g.add(trunk);
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.35*s,2),mat(C.sage,.96));crown.scale.set(.95,1.28,.95);crown.position.y=3.15*s;crown.castShadow=true;g.add(crown);g.position.set(x,0,z);scene.add(g);return g;
}
function lamp(x,z){
  const g=new THREE.Group();const pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,2.8,10),mat(C.bronze,.5,.38));pole.position.y=1.4;g.add(pole);
  const orb=new THREE.Mesh(new THREE.SphereGeometry(.14,16,12),emissive(0xffdfb4,1.6));orb.position.y=2.86;g.add(orb);const light=new THREE.PointLight(0xffddb0,4.5,8,2);light.position.y=2.86;g.add(light);g.position.set(x,0,z);scene.add(g);
}
[[-12,31],[12,31],[-14,23],[14,23],[-16,11],[16,11],[-19,-8],[19,-8],[-23,19],[23,19],[-29,31],[29,31],[32,-24],[-32,-24]].forEach(([x,z],i)=>tree(x,z,.75+(i%3)*.08));
[[-6.5,27],[6.5,27],[-6.5,18],[6.5,18],[-6.5,9],[6.5,9]].forEach(([x,z])=>lamp(x,z));

// WORLD MAP SCULPTURE
const mapBase=new THREE.Mesh(new THREE.CylinderGeometry(3.6,3.9,.45,64),mat(0x263129,.72,.16));mapBase.position.set(-12,.23,32);mapBase.castShadow=true;scene.add(mapBase);
const globeGroup=new THREE.Group();globeGroup.position.set(-12,3.05,32);scene.add(globeGroup);
const globe=new THREE.Mesh(new THREE.SphereGeometry(1.65,40,28),new THREE.MeshPhysicalMaterial({color:0x80948c,roughness:.3,metalness:.08,transparent:true,opacity:.52,transmission:.12}));globeGroup.add(globe);
[0,Math.PI/3,-Math.PI/3].forEach(r=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(1.86,.025,8,72),new THREE.MeshBasicMaterial({color:C.sand,transparent:true,opacity:.5}));ring.rotation.set(r,0,r/2);globeGroup.add(ring)});
const mapLabel=makeLabel('WORLD MAP',{scaleX:2.6,scaleY:.58,font:24});mapLabel.position.set(-12,5.5,32);scene.add(mapLabel);

// KŌMŌ HALL
const hall=new THREE.Group();hall.position.set(0,0,-8);scene.add(hall);
const hallFloor=new THREE.Mesh(new THREE.BoxGeometry(40,.35,25),mat(0xb6aa93,.9));hallFloor.position.set(0,.18,0);hallFloor.receiveShadow=true;hall.add(hallFloor);
const backWall=new THREE.Mesh(new THREE.BoxGeometry(40,9,.55),mat(0xb4a78e,.86));backWall.position.set(0,4.5,-12.2);backWall.castShadow=true;hall.add(backWall);
const leftWall=new THREE.Mesh(new THREE.BoxGeometry(.55,9,25),mat(0xb4a78e,.86));leftWall.position.set(-19.72,4.5,0);leftWall.castShadow=true;hall.add(leftWall);
const rightWall=leftWall.clone();rightWall.position.x=19.72;hall.add(rightWall);
const roof=new THREE.Mesh(new THREE.BoxGeometry(41,1.1,26),mat(0x5f665d,.62,.14));roof.position.set(0,9.05,0);roof.castShadow=true;hall.add(roof);
for(let i=-3;i<=3;i++){
  if(i===0)continue; const col=new THREE.Mesh(new THREE.CylinderGeometry(.34,.42,8.6,18),mat(0xc9bba1,.82));col.position.set(i*4.55,4.3,11.7);col.castShadow=true;hall.add(col);
}
const hallSign=makeLabel('THE KŌMØ HALL',{scaleX:5.4,scaleY:1.05,font:31});hallSign.position.set(0,8.1,12.35);hall.add(hallSign);
const atriumLight=new THREE.PointLight(0xffe6c1,35,34,2);atriumLight.position.set(0,7,1);hall.add(atriumLight);

// Reception desk
const desk=new THREE.Group();desk.position.set(0,0,4.5);hall.add(desk);
const deskBody=new THREE.Mesh(new THREE.BoxGeometry(8,1.55,1.6),mat(0x6e6557,.54,.18));deskBody.position.y=.78;deskBody.castShadow=true;desk.add(deskBody);
const deskTop=new THREE.Mesh(new THREE.BoxGeometry(8.5,.18,1.9),mat(0xd5c3a4,.66,.04));deskTop.position.y=1.61;deskTop.castShadow=true;desk.add(deskTop);
const deskGlow=new THREE.Mesh(new THREE.BoxGeometry(5.4,.08,.04),new THREE.MeshBasicMaterial({color:C.sageLight,transparent:true,opacity:.65}));deskGlow.position.set(0,1.08,.82);desk.add(deskGlow);
const deskLabel=makeLabel('KŌMØ DESK',{scaleX:2.7,scaleY:.62,font:24});deskLabel.position.set(0,3.2,0);desk.add(deskLabel);

function door(name,x,z,color=C.sage){
  const g=new THREE.Group();g.position.set(x,0,z);hall.add(g);
  const frame=mat(color,.56,.12);const left=new THREE.Mesh(new THREE.BoxGeometry(.28,4.6,.36),frame);left.position.set(-1.55,2.3,0);g.add(left);const right=left.clone();right.position.x=1.55;g.add(right);
  const top=new THREE.Mesh(new THREE.BoxGeometry(3.38,.28,.36),frame);top.position.y=4.46;g.add(top);
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(2.9,4.05),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.075,side:THREE.DoubleSide}));pane.position.y=2.25;g.add(pane);
  const label=makeLabel(name,{scaleX:2.45,scaleY:.54,font:22});label.position.y=5.25;g.add(label);return {group:g,pane,label};
}
const twinDoor=door('01 · TWIN LAB',-11.5,-11.8,C.sand);
const rehabDoor=door('02 · REHAB',11.5,-11.8,C.sageLight);
const libraryDoor=door('03 · LIBRARY',-18.9,-2,C.sage);libraryDoor.group.rotation.y=Math.PI/2;
const theatreDoor=door('04 · AMPHITHEATRE',18.9,-2,C.stone2);theatreDoor.group.rotation.y=-Math.PI/2;
const storeDoor=door('05 · STORE',18.9,6,C.bronze);storeDoor.group.rotation.y=-Math.PI/2;

// Twin station visible in room 01
const twinRoom=new THREE.Group();twinRoom.position.set(-11.5,.25,-8.2);hall.add(twinRoom);
const plinth=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.6,.26,64),mat(0x202921,.64,.16));plinth.position.y=.13;twinRoom.add(plinth);
const twinBodyMat=new THREE.MeshPhysicalMaterial({color:C.sageLight,roughness:.2,transparent:true,opacity:.52,transmission:.15,emissive:0x314b38,emissiveIntensity:.32});
function humanoid(material,skinMaterial=null){
  const g=new THREE.Group();const skin=skinMaterial||material;const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.5,1.25,7,14),material);torso.position.y=2.8;g.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.45,22,16),skin);head.position.y=4.2;g.add(head);
  const limbs={};['la','ra'].forEach((n,i)=>{const p=new THREE.Group();p.position.set(i?.68:-.68,3.35,0);const m=new THREE.Mesh(new THREE.CapsuleGeometry(.14,1.04,5,10),skin);m.position.y=-.58;p.add(m);g.add(p);limbs[n]=p});
  ['ll','rl'].forEach((n,i)=>{const p=new THREE.Group();p.position.set(i?.27:-.27,1.9,0);const m=new THREE.Mesh(new THREE.CapsuleGeometry(.19,1.35,5,10),material);m.position.y=-.78;p.add(m);g.add(p);limbs[n]=p});g.userData.limbs=limbs;return g;
}
const twin=humanoid(twinBodyMat);twin.position.y=.28;twinRoom.add(twin);
const halo=new THREE.Mesh(new THREE.TorusGeometry(1.5,.025,8,64),new THREE.MeshBasicMaterial({color:C.sand,transparent:true,opacity:.48}));halo.rotation.x=Math.PI/2;halo.position.y=2.6;twinRoom.add(halo);
const twinInfo=makeLabel('FUNCTIONAL DIGITAL TWIN',{scaleX:3.3,scaleY:.65,font:22});twinInfo.position.set(0,5.6,0);twinRoom.add(twinInfo);

// Locked Frontier / Riviera world gate
const frontier=new THREE.Group();frontier.position.set(43,0,8);frontier.rotation.y=-Math.PI/2;scene.add(frontier);
const gateL=new THREE.Mesh(new THREE.BoxGeometry(1.1,10,1.2),mat(0x505c52,.5,.24));gateL.position.set(-4.1,5,0);frontier.add(gateL);const gateR=gateL.clone();gateR.position.x=4.1;frontier.add(gateR);
const gateTop=new THREE.Mesh(new THREE.BoxGeometry(9.3,1.05,1.2),mat(0x505c52,.5,.24));gateTop.position.y=9.45;frontier.add(gateTop);
const barrier=new THREE.Mesh(new THREE.PlaneGeometry(7.2,8.2,24,24),new THREE.MeshBasicMaterial({color:0xc1d0c2,transparent:true,opacity:.12,wireframe:true,side:THREE.DoubleSide}));barrier.position.y=4.6;frontier.add(barrier);
const frontierLabel=makeLabel('RIVIERA FRONTIER · LOCKED',{scaleX:4.4,scaleY:.78,font:24,bg:'rgba(35,31,24,.78)',color:'#e3c39b'});frontierLabel.position.set(0,10.9,0);frontier.add(frontierLabel);
for(let i=0;i<6;i++){const beacon=new THREE.Mesh(new THREE.SphereGeometry(.11,12,8),emissive(C.warn,1.8));beacon.position.set(-3.3+i*1.32,8.8,.1);frontier.add(beacon)}
// Distant future nodes
[[52,-5],[58,7],[54,18]].forEach(([x,z],i)=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.22,2.8+i*.8,12),emissive(i%2?C.sand:C.sageLight,.8,.55));p.position.set(x,1.4+i*.4,z);scene.add(p);const o=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),emissive(C.sand,1.2,.7));o.position.set(x,3+i*.8,z);scene.add(o)});

// island frontier perimeter
const boundary=new THREE.Mesh(new THREE.TorusGeometry(52.5,.045,8,160),new THREE.MeshBasicMaterial({color:C.sageLight,transparent:true,opacity:.14}));boundary.rotation.x=Math.PI/2;boundary.position.y=.1;scene.add(boundary);

// Player
const playerMat=mat(0x738872,.76);const skinMat=mat(0xbc8869,.68);const player=humanoid(playerMat,skinMat);player.scale.set(.93,.93,.93);player.position.set(0,0,39);player.rotation.y=Math.PI;scene.add(player);

// interaction targets
const interactions=[
  {id:'desk',pos:new THREE.Vector3(0,0,-3.5),radius:5.4,title:'Talk to KŌMØ Desk',copy:'Your orientation point',action:openDesk},
  {id:'twin',pos:new THREE.Vector3(-11.5,0,-19.2),radius:5,title:'Enter Twin Lab',copy:'Your longitudinal functional data',action:openTwin},
  {id:'frontier',pos:new THREE.Vector3(37,0,8),radius:7,title:'Inspect Riviera Frontier',copy:'Future district · currently locked',action:openFrontier},
  {id:'map',pos:new THREE.Vector3(-12,0,32),radius:5.2,title:'Open World Map',copy:'Core Island and future districts',action:openMap},
];
let nearby=null;

function openPanel(eyebrow,html){$('#panel-eyebrow').textContent=eyebrow;$('#panel-content').innerHTML=html;$('#info-panel').classList.add('open');}
$('#panel-close').addEventListener('click',()=>$('#info-panel').classList.remove('open'));
function openDesk(){
  $('#objective-text').textContent='Objective · Visit the Functional Digital Twin Lab';
  openPanel('KŌMØ DESK',`<h2>Welcome back.</h2><p>This desk will become your personal concierge. For now it demonstrates the orientation contract that an agent will inherit later.</p><div class="info-grid"><div><span>Motion Score</span><strong>84</strong></div><div><span>Motion Age</span><strong>39</strong></div><div><span>Priority</span><strong>Left quad</strong></div><div><span>World</span><strong>Core Island</strong></div></div><div class="info-actions"><button class="primary" data-go="twin">Go to Twin Lab</button><button data-open-controls>Player controls</button></div>`);
  $('#panel-content [data-go="twin"]')?.addEventListener('click',()=>{player.position.set(-11.5,0,-16);$('#info-panel').classList.remove('open');showToast('Twin Lab entrance')});
  $('#panel-content [data-open-controls]')?.addEventListener('click',openSettings);
}
function openTwin(){
  openPanel('01 · FUNCTIONAL DIGITAL TWIN',`<h2>Your body. Across time.</h2><p>The Twin Lab is the first scientific room of KŌMØ World. Myodev, gait, strength, posture, functional tests, wearables, sleep, activity, Rehab and Motion Score will converge here as dated, auditable snapshots.</p><div class="info-grid"><div><span>Muscle</span><strong>82</strong></div><div><span>Mobility</span><strong>76</strong></div><div><span>Balance</span><strong>91</strong></div><div><span>Posture</span><strong>88</strong></div></div><div class="info-actions"><button class="primary">Enter detailed Twin view</button><button>Compare baseline → today</button></div>`);
  $('#objective-text').textContent='Objective · Explore KŌMØ World';
}
function openFrontier(){
  openPanel('WORLD GATE',`<span class="locked-chip">● FRONTIER LOCKED</span><h2>Riviera is forming.</h2><p>The district is visible before it is accessible. This gate opens only when real partner Nodes and actionable KŌMØ experiences are ready.</p><div class="info-grid"><div><span>Region</span><strong>Riviera</strong></div><div><span>Status</span><strong>Locked</strong></div><div><span>Future</span><strong>Cannes</strong></div><div><span>Network</span><strong>Partner-gated</strong></div></div><div class="info-actions"><button>View unlock conditions</button></div>`);
}
function openMap(){
  openPanel('WORLD MAP',`<h2>One world. Expanding geography.</h2><p>Core Island is the first playable landmass. Future districts become traversable when KŌMØ has something real to offer there.</p><div class="info-grid"><div><span>Open</span><strong>Core Island</strong></div><div><span>Next</span><strong>Riviera</strong></div><div><span>Future</span><strong>Paris</strong></div><div><span>Future</span><strong>Jávea</strong></div></div>`);
}

function showToast(text){const e=$('#toast');e.textContent=text;e.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>e.classList.remove('show'),2100)}

// Arrival card
$('#arrival-dismiss').addEventListener('click',()=>$('#arrival-card').classList.add('hidden'));
setTimeout(()=>$('#arrival-card').classList.add('hidden'),8500);

// Settings UI
const bindingLabels={forward:'Move Forward',backward:'Move Backward',left:'Move Left',right:'Move Right',sprint:'Sprint',interact:'Interact',map:'World Map',ai:'KŌMØ AI',settings:'Settings',resetCamera:'Reset Camera'};
let listeningAction=null;
function buildBindings(){
  $('#binding-list').innerHTML=Object.entries(bindingLabels).map(([id,label])=>`<div class="binding-row"><span>${label}</span><button data-bind="${id}">${keyName(settings.bindings[id])}</button></div>`).join('');
  document.querySelectorAll('[data-bind]').forEach(btn=>btn.addEventListener('click',()=>{listeningAction=btn.dataset.bind;document.querySelectorAll('[data-bind]').forEach(b=>b.classList.remove('listening'));btn.classList.add('listening');btn.textContent='Press key…'}));
}
function applySettingsUI(){
  buildBindings();
  $('#sens-x').value=settings.camera.sensX;$('#sens-y').value=settings.camera.sensY;$('#camera-distance').value=settings.camera.distance;$('#invert-y').checked=settings.camera.invertY;$('#auto-center').checked=settings.camera.autoCenter;
  $('#joystick-size').value=settings.mobile.joystickSize;$('#joystick-opacity').value=settings.mobile.joystickOpacity;$('#left-handed').checked=settings.mobile.leftHanded;
  document.documentElement.style.setProperty('--joy-size',`${settings.mobile.joystickSize}px`);document.documentElement.style.setProperty('--joy-opacity',settings.mobile.joystickOpacity);
  $('#mobile-controls').classList.toggle('left-handed',settings.mobile.leftHanded);
  $('#interaction-key').textContent=keyName(settings.bindings.interact);
  document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('active',b.dataset.preset===settings.preset));
}
function preset(name){
  const next=deepCopy(defaults.bindings);
  if(name==='zqsd')Object.assign(next,{forward:'z',backward:'s',left:'q',right:'d'});
  if(name==='arrows')Object.assign(next,{forward:'arrowup',backward:'arrowdown',left:'arrowleft',right:'arrowright'});
  if(name==='wasd')Object.assign(next,{forward:'w',backward:'s',left:'a',right:'d'});
  if(name!=='custom'){settings.bindings=next;settings.preset=name;}else settings.preset='custom';saveSettings();
}
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.preset)));
function openSettings(){settings.preset=settings.preset||'custom';applySettingsUI();$('#settings-panel').classList.add('open');}
function closeSettings(){$('#settings-panel').classList.remove('open');listeningAction=null;}
$('#settings-open').addEventListener('click',openSettings);$('#mobile-settings').addEventListener('click',openSettings);$('#settings-close').addEventListener('click',closeSettings);
$('#controls-reset').addEventListener('click',()=>{settings=deepCopy(defaults);saveSettings();showToast('Controls reset')});
[['sens-x','sensX'],['sens-y','sensY'],['camera-distance','distance']].forEach(([id,key])=>$('#'+id).addEventListener('input',e=>{settings.camera[key]=Number(e.target.value);settings.preset=settings.preset;saveSettings()}));
$('#invert-y').addEventListener('change',e=>{settings.camera.invertY=e.target.checked;saveSettings()});$('#auto-center').addEventListener('change',e=>{settings.camera.autoCenter=e.target.checked;saveSettings()});
$('#joystick-size').addEventListener('input',e=>{settings.mobile.joystickSize=Number(e.target.value);saveSettings()});$('#joystick-opacity').addEventListener('input',e=>{settings.mobile.joystickOpacity=Number(e.target.value);saveSettings()});$('#left-handed').addEventListener('change',e=>{settings.mobile.leftHanded=e.target.checked;saveSettings()});
applySettingsUI();

// Keyboard controls
const keys=new Set();
window.addEventListener('keydown',e=>{
  const k=normalizeKey(e);
  if(listeningAction){e.preventDefault();settings.bindings[listeningAction]=k;settings.preset='custom';listeningAction=null;saveSettings();showToast('Control updated');return;}
  keys.add(k);
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(k===settings.bindings.interact && nearby) nearby.action();
  if(k===settings.bindings.settings){e.preventDefault();$('#settings-panel').classList.contains('open')?closeSettings():openSettings();}
  if(k===settings.bindings.map){openMap();}
  if(k===settings.bindings.ai){showToast('KŌMØ AI · agent slot ready');}
  if(k===settings.bindings.resetCamera){yaw=0;pitch=.08;showToast('Camera reset');}
});
window.addEventListener('keyup',e=>keys.delete(normalizeKey(e)));
window.addEventListener('blur',()=>keys.clear());

// Desktop free look
let yaw=0,pitch=.08,dragging=false,last={x:0,y:0};
canvas.addEventListener('pointerdown',e=>{if(matchMedia('(pointer:coarse)').matches)return;dragging=true;last={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId)});
canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
canvas.addEventListener('pointermove',e=>{if(!dragging)return;const sy=settings.camera.invertY?-1:1;yaw-=(e.clientX-last.x)*.0034*settings.camera.sensX;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-last.y)*.0022*settings.camera.sensY*sy,-.22,.46);last={x:e.clientX,y:e.clientY}});

// Mobile analog stick
const joy={x:0,y:0,pointer:null};const joyZone=$('#joystick-zone'),joyKnob=$('#joystick-knob');
function updateJoy(e){const r=joyZone.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=Math.min(r.width,r.height)*.32,len=Math.hypot(dx,dy)||1;if(len>max){dx=dx/len*max;dy=dy/len*max;}joy.x=dx/max;joy.y=dy/max;joyKnob.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;}
joyZone.addEventListener('pointerdown',e=>{e.preventDefault();joy.pointer=e.pointerId;joyZone.setPointerCapture?.(e.pointerId);updateJoy(e)});joyZone.addEventListener('pointermove',e=>{if(e.pointerId===joy.pointer)updateJoy(e)});
function resetJoy(e){if(joy.pointer!==null&&e.pointerId!==joy.pointer)return;joy.pointer=null;joy.x=joy.y=0;joyKnob.style.transform='translate(-50%,-50%)';}
joyZone.addEventListener('pointerup',resetJoy);joyZone.addEventListener('pointercancel',resetJoy);

// Mobile look
const lookZone=$('#look-zone');let lookPointer=null,lookLast={x:0,y:0};
lookZone.addEventListener('pointerdown',e=>{e.preventDefault();lookPointer=e.pointerId;lookLast={x:e.clientX,y:e.clientY};lookZone.setPointerCapture?.(e.pointerId)});
lookZone.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;const sy=settings.camera.invertY?-1:1;yaw-=(e.clientX-lookLast.x)*.0042*settings.camera.sensX;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-lookLast.y)*.003*settings.camera.sensY*sy,-.22,.46);lookLast={x:e.clientX,y:e.clientY}});
lookZone.addEventListener('pointerup',e=>{if(e.pointerId===lookPointer)lookPointer=null});lookZone.addEventListener('pointercancel',()=>lookPointer=null);
$('#mobile-action').addEventListener('pointerdown',e=>{e.preventDefault();if(nearby)nearby.action();else showToast('Move closer to an interaction')});

const desiredCamera=new THREE.Vector3(),lookTarget=new THREE.Vector3();let lastMoveAt=0;
function updateMovement(dt){
  const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  let inputF=(keys.has(settings.bindings.forward)?1:0)-(keys.has(settings.bindings.backward)?1:0);let inputR=(keys.has(settings.bindings.right)?1:0)-(keys.has(settings.bindings.left)?1:0);
  if(Math.abs(joy.y)>.05||Math.abs(joy.x)>.05){inputF+=-joy.y;inputR+=joy.x;}
  const move=new THREE.Vector3().addScaledVector(forward,inputF).addScaledVector(right,inputR);const magnitude=Math.min(1,move.length());const moving=magnitude>.03;
  const sprint=keys.has(settings.bindings.sprint);const speed=(sprint?7.8:4.6)*Math.max(.35,magnitude);
  if(moving){move.normalize();player.position.addScaledVector(move,speed*dt);player.rotation.y=Math.atan2(move.x,move.z);lastMoveAt=performance.now();}
  const radius=Math.hypot(player.position.x,player.position.z);if(radius>50){player.position.multiplyScalar(50/radius);}
  const t=performance.now()*.012;const limbs=player.userData.limbs;const swing=moving?Math.sin(t*(sprint?1.55:1))*Math.min(.48,.25+.25*magnitude):0;limbs.ll.rotation.x=swing;limbs.rl.rotation.x=-swing;limbs.la.rotation.x=-swing*.7;limbs.ra.rotation.x=swing*.7;

  if(settings.camera.autoCenter && moving && !dragging && lookPointer===null && performance.now()-lastMoveAt<500){/* yaw remains player-independent by design; future soft recenter slot */}
  const d=settings.camera.distance;desiredCamera.set(player.position.x+Math.sin(yaw)*d,6.6+pitch*9,player.position.z+Math.cos(yaw)*d);lookTarget.set(player.position.x,2.55,player.position.z);camera.position.lerp(desiredCamera,1-Math.pow(.0025,dt));camera.lookAt(lookTarget);

  // zones
  const z=player.position.z,x=player.position.x;let zone='CORE ISLAND';if(z>20)zone='ARRIVAL PLAZA';else if(z>-20&&Math.abs(x)<22)zone='THE KŌMØ HALL';else if(x>30)zone='WORLD GATE';$('#zone-name').textContent=zone;
  const dirs=['N','NE','E','SE','S','SW','W','NW'];const a=(yaw%(Math.PI*2)+Math.PI*2)%(Math.PI*2);$('#heading-name').textContent=dirs[Math.round(a/(Math.PI/4))%8];

  let best=null,bestDist=Infinity;for(const target of interactions){const dist=Math.hypot(player.position.x-target.pos.x,player.position.z-target.pos.z);if(dist<target.radius&&dist<bestDist){best=target;bestDist=dist;}}
  if(best!==nearby){nearby=best;const p=$('#interaction-prompt');if(best){$('#interaction-title').textContent=best.title;$('#interaction-copy').textContent=best.copy;$('#interaction-key').textContent=keyName(settings.bindings.interact);p.classList.add('show');$('#mobile-action').textContent=best.id==='frontier'?'LOCK':'ACTION';}else{p.classList.remove('show');$('#mobile-action').textContent='ACTION';}}
}

function animate(){
  const dt=Math.min(clock.getDelta(),.05);updateMovement(dt);const t=performance.now()*.001;
  globeGroup.rotation.y+=dt*.08;halo.rotation.z+=dt*.12;twin.rotation.y=Math.sin(t*.35)*.08;spawnRing.material.opacity=.32+Math.sin(t*2)*.12;
  barrier.material.opacity=.09+Math.sin(t*1.5)*.035;frontier.children.slice(-6).forEach((b,i)=>{if(b.material?.emissiveIntensity!==undefined)b.material.emissiveIntensity=1.2+Math.sin(t*2+i)*.6});
  renderer.render(scene,camera);requestAnimationFrame(animate);
}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);resize();camera.position.set(0,7.2,60);camera.lookAt(0,2.6,39);animate();

showToast('KŌMØ World V0.5 · Core Island');

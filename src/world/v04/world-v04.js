import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { TwinCore, SOURCE_CATALOG } from './twin-core.js';
import { localIntentPlanner, executeAgentPlan } from './agent-protocol.js';

const $ = (selector) => document.querySelector(selector);
const canvas = $('#world-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b100d, .0125);
const camera = new THREE.PerspectiveCamera(47, 1, .1, 320);
const clock = new THREE.Clock();
const core = new TwinCore();

function storedAvatar() {
  try { return JSON.parse(localStorage.getItem('komo_world_avatar_v02') || '{}'); }
  catch { return {}; }
}
const avatarProfile = storedAvatar();
const playerName = avatarProfile.name || 'Renan';
$('#player-name').textContent = playerName;

const C = { sage:0x91a18c, sand:0xd0b993, text:0xf3eadc, dark:0x101612, floor:0x151c17, warn:0xd1a969, green:0xa8c59d, blue:0x8faab1 };
const mat = (color, roughness=.72, metalness=.02) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const glassMat = new THREE.MeshPhysicalMaterial({ color:0xa9b8a5, roughness:.28, metalness:.02, transparent:true, opacity:.68, transmission:.16 });

scene.add(new THREE.HemisphereLight(0xf7efdf, 0x0a0d0b, 1.55));
const sun = new THREE.DirectionalLight(0xffefd6, 2.25); sun.position.set(14,22,12); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);
const centralGlow = new THREE.PointLight(0xb9d1b0, 85, 55, 2); centralGlow.position.set(0,8,0); scene.add(centralGlow);

const floor = new THREE.Mesh(new THREE.CircleGeometry(48, 128), mat(C.floor,.97)); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
const worldRing = new THREE.Mesh(new THREE.RingGeometry(9.8,10.05,96), new THREE.MeshBasicMaterial({ color:C.sage, transparent:true, opacity:.25, side:THREE.DoubleSide })); worldRing.rotation.x=-Math.PI/2; worldRing.position.y=.012; scene.add(worldRing);

function makeLabel(text, width=512) {
  const c=document.createElement('canvas'); c.width=width; c.height=128; const x=c.getContext('2d');
  x.fillStyle='rgba(9,13,10,.82)'; x.roundRect(35,20,width-70,76,26); x.fill(); x.strokeStyle='rgba(244,239,226,.16)'; x.stroke();
  x.font='500 30px Arial'; x.textAlign='center'; x.fillStyle='#f2efe6'; x.fillText(text,width/2,69);
  const texture=new THREE.CanvasTexture(c); texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false})); sprite.scale.set(3.1,.78,1); return sprite;
}

function humanoid({ hologram=false, ghost=false }={}) {
  const g=new THREE.Group();
  const bodyMat=hologram ? glassMat.clone() : mat(avatarProfile.outfit==='sand'?0xcdb995:0x879783,.7);
  if(ghost){ bodyMat.transparent=true; bodyMat.opacity=.22; bodyMat.emissive=new THREE.Color(C.sand); bodyMat.emissiveIntensity=.2; }
  const skin=mat(avatarProfile.skin==='brown'?0x79503b:avatarProfile.skin==='deep'?0x4f332a:avatarProfile.skin==='light'?0xe3c0a8:0xbc8869,.66);
  if(hologram||ghost){ skin.transparent=true; skin.opacity=ghost?.2:.58; skin.emissive=new THREE.Color(0x26372c); skin.emissiveIntensity=.16; }
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.62,1.42,8,16),bodyMat); torso.position.y=3.2; torso.castShadow=!hologram; g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.53,28,20),skin); head.position.y=4.85; g.add(head);
  const limbs={};
  ['leftArm','rightArm'].forEach((name,i)=>{ const p=new THREE.Group(); p.position.set(i? .8:-.8,3.78,0); const m=new THREE.Mesh(new THREE.CapsuleGeometry(.16,1.15,5,10),skin); m.position.y=-.65; p.add(m); g.add(p); limbs[name]=p; });
  ['leftLeg','rightLeg'].forEach((name,i)=>{ const p=new THREE.Group(); p.position.set(i? .32:-.32,2.14,0); const m=new THREE.Mesh(new THREE.CapsuleGeometry(.23,1.55,5,10),bodyMat); m.position.y=-.93; p.add(m); const foot=new THREE.Mesh(new THREE.BoxGeometry(.42,.22,.72),mat(0xd6c6ad,.65)); foot.position.set(0,-1.87,-.15); p.add(foot); g.add(p); limbs[name]=p; });
  g.userData.limbs=limbs; g.userData.torso=torso; return g;
}

function createTwinStation() {
  const group=new THREE.Group();
  const plinth=new THREE.Mesh(new THREE.CylinderGeometry(4.3,4.7,.28,72),mat(0x202920,.86,.08)); plinth.position.y=.14; plinth.receiveShadow=true; group.add(plinth);
  const innerRing=new THREE.Mesh(new THREE.TorusGeometry(3.25,.035,10,96),new THREE.MeshBasicMaterial({color:C.sand,transparent:true,opacity:.48})); innerRing.rotation.x=Math.PI/2; innerRing.position.y=.34; group.add(innerRing);
  const halo1=new THREE.Mesh(new THREE.TorusGeometry(2.05,.025,10,96),new THREE.MeshBasicMaterial({color:C.green,transparent:true,opacity:.48})); halo1.rotation.x=Math.PI/2; halo1.position.y=2.65; group.add(halo1);
  const halo2=halo1.clone(); halo2.rotation.x=0; halo2.rotation.y=Math.PI/2; halo2.position.y=2.65; group.add(halo2);
  const twin=humanoid({hologram:true}); twin.position.y=.28; group.add(twin);
  const label=makeLabel('FUNCTIONAL DIGITAL TWIN'); label.position.set(0,6.35,0); label.scale.set(3.6,.9,1); group.add(label);

  const leftThighGlow=new THREE.Mesh(new THREE.CapsuleGeometry(.35,.95,6,14),new THREE.MeshStandardMaterial({color:C.warn,emissive:C.warn,emissiveIntensity:.9,transparent:true,opacity:.34,depthWrite:false})); leftThighGlow.position.set(-.32,1.28,.03); group.add(leftThighGlow);
  const trunkGlow=new THREE.Mesh(new THREE.TorusGeometry(.88,.035,8,48),new THREE.MeshBasicMaterial({color:C.green,transparent:true,opacity:.3})); trunkGlow.position.set(0,3.25,.7); trunkGlow.rotation.x=Math.PI/2; group.add(trunkGlow);

  scene.add(group); return {group,twin,halos:[halo1,halo2],leftThighGlow,trunkGlow};
}
const station=createTwinStation();

const baselineGhost=humanoid({ghost:true}); baselineGhost.position.set(-5.4,.28,0); baselineGhost.visible=false; baselineGhost.add(makeLabel('BASELINE')); baselineGhost.children.at(-1).position.y=6; scene.add(baselineGhost);
const todayGhost=humanoid({hologram:true}); todayGhost.position.set(5.4,.28,0); todayGhost.visible=false; todayGhost.add(makeLabel('TODAY')); todayGhost.children.at(-1).position.y=6; scene.add(todayGhost);

const player=humanoid(); player.scale.set(.93,.93,.93); player.position.set(0,0,14); player.rotation.y=Math.PI; scene.add(player);

function roomPortal(name,x,z,color) {
  const group=new THREE.Group(); group.position.set(x,0,z);
  const frameMat=mat(color,.56,.12);
  const left=new THREE.Mesh(new THREE.BoxGeometry(.35,5.4,.35),frameMat); left.position.set(-2.4,2.7,0); group.add(left);
  const right=left.clone(); right.position.x=2.4; group.add(right);
  const top=new THREE.Mesh(new THREE.BoxGeometry(5.15,.35,.35),frameMat); top.position.y=5.25; group.add(top);
  const portal=new THREE.Mesh(new THREE.PlaneGeometry(4.4,4.65),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.07,side:THREE.DoubleSide})); portal.position.y=2.55; group.add(portal);
  const label=makeLabel(name); label.position.y=6.15; group.add(label); scene.add(group); return {group,portal};
}
const portals={ motion:roomPortal('MOTION LAB',-20,-7,C.sand), rehab:roomPortal('REHAB',20,-7,C.sage), network:roomPortal('NETWORK',0,25,C.blue) };

const sourceNodes=new Map();
SOURCE_CATALOG.forEach((source,i)=>{
  const angle=(i/SOURCE_CATALOG.length)*Math.PI*2-Math.PI/2; const radius=7.1+(i%2)*.65;
  const group=new THREE.Group(); group.position.set(Math.cos(angle)*radius,1.05+((i%3)*.18),Math.sin(angle)*radius);
  const orbMat=new THREE.MeshStandardMaterial({color:i%2?C.sand:C.sage,emissive:i%2?C.sand:C.sage,emissiveIntensity:.22,roughness:.4});
  const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.31,2),orbMat); group.add(orb);
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.5,8),new THREE.MeshBasicMaterial({color:C.sage,transparent:true,opacity:.28})); stem.position.y=-.8; group.add(stem);
  const label=makeLabel(source.label); label.position.y=.95; label.scale.set(2.25,.56,1); group.add(label);
  scene.add(group); sourceNodes.set(source.id,{group,orb,base:group.position.clone(),phase:angle});
});

function buildSourceList(){
  $('#source-list').innerHTML=SOURCE_CATALOG.map(s=>`<button class="source-button" data-source="${s.id}"><i></i><span>${s.label}</span><small>${s.group}</small></button>`).join('');
  document.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>focusSource(b.dataset.source)));
}
buildSourceList();

const metricFormat={
  myodev:s=>`${s.metrics.quadriceps_symmetry}% symmetry`, functional_tests:s=>`Mobility ${s.domains.mobility}`, gait:s=>`${s.metrics.gait_speed.toFixed(2)} m/s`, strength:s=>`Index ${s.metrics.strength_index}`, posture:s=>`Index ${s.metrics.posture_index}`, wearables:s=>`${s.metrics.steps.toLocaleString()} steps`, sleep:s=>`${Math.floor(s.metrics.sleep_minutes/60)}h ${s.metrics.sleep_minutes%60}m`, activity:s=>`${s.metrics.steps.toLocaleString()} steps`, rehab:s=>`${s.metrics.rehab_adherence}% adherence`, motion_score:s=>`${s.motion_score}/100`
};

function detailRows(rows){ return rows.map(([a,b])=>`<div class="detail-row"><span>${a}</span><b>${b}</b></div>`).join(''); }
function openDetail(title,html){ $('#detail-title').textContent=title; $('#detail-content').innerHTML=html; $('#detail-panel').classList.add('open'); }
$('#detail-close').addEventListener('click',()=>$('#detail-panel').classList.remove('open'));

function focusSource(source,actor='user'){
  const detail=core.focusSource(source,actor); const snap=core.current();
  document.querySelectorAll('.source-button').forEach(b=>b.classList.toggle('active',b.dataset.source===source));
  sourceNodes.forEach((node,id)=>{ node.orb.material.emissiveIntensity=id===source?1.4:.22; node.orb.scale.setScalar(id===source?1.45:1); });
  const value=metricFormat[source]?.(snap) || 'Available';
  openDetail(`${detail.label.toUpperCase()} · PROVENANCE`,`<h2>${detail.label}</h2><p>Current value is tied to the dated snapshot and its source provenance. Demo values are never presented as real patient measurements.</p>${detailRows([['Snapshot',snap.label],['Captured',new Date(snap.captured_at).toLocaleString()],['Value',value],['Status',detail.status],['Quality',`${Math.round(detail.quality*100)}%`],['Method',detail.method],['Kind',detail.group],['Version',snap.provenance_version]])}`);
  return detail;
}

function updateTwin(snapshot){
  $('#motion-score').textContent=snapshot.motion_score; $('#motion-age').textContent=snapshot.motion_age; $('#snapshot-label').textContent=snapshot.label.toUpperCase();
  $('#d-muscle').textContent=snapshot.domains.muscle; $('#d-mobility').textContent=snapshot.domains.mobility; $('#d-balance').textContent=snapshot.domains.balance; $('#d-posture').textContent=snapshot.domains.posture;
  $('#timeline-name').textContent=`${snapshot.label.toUpperCase()} · ${new Date(snapshot.captured_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()}`;
  const intensity=snapshot.overlays.left_thigh.intensity; station.leftThighGlow.material.opacity=.14+intensity*.42; station.leftThighGlow.material.emissiveIntensity=.35+intensity*1.9;
  station.leftThighGlow.scale.setScalar(.9+intensity*.24); station.trunkGlow.material.opacity=.12+snapshot.overlays.trunk.intensity*.55;
  if(core.selectedSource) focusSource(core.selectedSource,'system');
}
updateTwin(core.current());

function comparisonView(){
  const comparison=core.compare(core.snapshots[0].snapshot_id,core.current().snapshot_id);
  baselineGhost.visible=true; todayGhost.visible=true; station.group.visible=false;
  openDetail('LONGITUDINAL COMPARISON',`<h2>${comparison.from.label} → ${comparison.to.label}</h2><p>The body is shown twice because time is treated as a first-class dimension of the Twin.</p>${detailRows([['Motion Score',`${comparison.motion_score_delta>=0?'+':''}${comparison.motion_score_delta}`],['Motion Age',`${comparison.motion_age_delta} y`],['Quadriceps symmetry',`${comparison.metric_delta.quadriceps_symmetry>=0?'+':''}${comparison.metric_delta.quadriceps_symmetry} pts`],['Gait speed',`${comparison.metric_delta.gait_speed>=0?'+':''}${comparison.metric_delta.gait_speed.toFixed(2)} m/s`],['Strength',`${comparison.metric_delta.strength_index>=0?'+':''}${comparison.metric_delta.strength_index}`],['Balance',`${comparison.domain_delta.balance>=0?'+':''}${comparison.domain_delta.balance}`]])}`);
  showToast('Baseline comparison activated'); return comparison;
}
function singleTwinView(){ baselineGhost.visible=false; todayGhost.visible=false; station.group.visible=true; }
$('#compare-button').addEventListener('click',comparisonView);

const timeline=$('#timeline'); timeline.addEventListener('input',()=>{ singleTwinView(); const snap=core.setTimeIndex(Number(timeline.value)); updateTwin(snap); });

function renderAudit(){
  $('#audit-list').innerHTML=core.auditLog(8).slice().reverse().map(e=>`<div class="audit-row"><span>${new Date(e.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span><b title="${e.type}">${e.type}</b></div>`).join('');
}
core.on('*',renderAudit); renderAudit();

let activeRegion=null;
function focusRegion(region){ activeRegion=region; if(region==='left_thigh'){ station.leftThighGlow.material.opacity=.72; station.leftThighGlow.material.emissiveIntensity=2.2; showToast('Left thigh functional overlay focused'); } return region; }
function cameraPreset(preset){
  if(preset==='twin_lower_limb'){ cameraRig.manualTarget.set(0,1.7,1.8); cameraRig.manualDistance=18; }
  else { cameraRig.manualTarget.set(0,2.6,0); cameraRig.manualDistance=26; }
  cameraRig.presetUntil=performance.now()+3500; return preset;
}
function highlightPortal(room){ Object.values(portals).forEach(p=>p.portal.material.opacity=.07); const p=portals[room]; if(p){p.portal.material.opacity=.32; showToast(`${room.toUpperCase()} · preview portal opened`);} return room; }
function rehabPreview(){ openDetail('REHAB · PREVIEW',`<h2>Lower-limb progression</h2><p>The agent can open an already authorised programme context. It cannot create or alter a clinical prescription autonomously.</p>${detailRows([['Mode','Preview only'],['Context','Current Twin snapshot'],['Primary focus','Left lower limb'],['Reward','+85 KŌMŌ Points demo'],['Write access','Blocked']])}`); return {mode:'preview'}; }
function provenanceRead(source){ return focusSource(source,'agent-simulator'); }

async function askAgent(prompt){
  const context=core.createAgentContext(); const plan=localIntentPlanner(prompt,context); $('#agent-response').textContent=plan.spoken_summary;
  const results=await executeAgentPlan({ plan, context, emit:(type,payload,actor)=>core.emit(type,payload,actor), handlers:{
    'timeline.compare':()=>comparisonView(),
    'world.focus_source':a=>focusSource(a.source,'agent-simulator'),
    'world.focus_region':a=>focusRegion(a.region),
    'world.camera':a=>cameraPreset(a.preset),
    'world.open_room':a=>highlightPortal(a.room),
    'rehab.preview_session':()=>rehabPreview(),
    'provenance.read':a=>provenanceRead(a.source),
  }});
  const blocked=results.filter(r=>!r.ok).length; if(blocked) showToast(`${blocked} agent action${blocked>1?'s':''} blocked by policy`); return results;
}
$('#agent-form').addEventListener('submit',e=>{e.preventDefault(); const input=$('#agent-input'); const q=input.value.trim(); if(q){askAgent(q); input.value='';}});
document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>askAgent(b.dataset.prompt)));

$('#motion-room').addEventListener('click',()=>highlightPortal('motion'));
$('#rehab-room').addEventListener('click',()=>highlightPortal('rehab'));
$('#network-room').addEventListener('click',()=>highlightPortal('network'));

function showToast(text){const el=$('#toast'); el.textContent=text; el.classList.add('show'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>el.classList.remove('show'),2100);}

const keys=new Set(); const touch={forward:false,back:false,left:false,right:false}; let yaw=0,pitch=.09,dragging=false,last={x:0,y:0};
window.addEventListener('keydown',e=>keys.add(e.key.toLowerCase())); window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointerdown',e=>{dragging=true;last={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId)}); canvas.addEventListener('pointerup',()=>dragging=false); canvas.addEventListener('pointercancel',()=>dragging=false);
canvas.addEventListener('pointermove',e=>{if(!dragging)return;yaw-=(e.clientX-last.x)*.0035;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-last.y)*.0022,-.1,.42);last={x:e.clientX,y:e.clientY}});
document.querySelectorAll('[data-move]').forEach(b=>{const d=b.dataset.move;const on=e=>{e.preventDefault();touch[d]=true};const off=e=>{e.preventDefault();touch[d]=false};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)});

const cameraRig={ manualTarget:new THREE.Vector3(0,2.5,0), manualDistance:26, presetUntil:0 };
const desiredCamera=new THREE.Vector3(); const lookTarget=new THREE.Vector3();
function updateMovement(dt){
  const speed=keys.has('shift')?7.2:4.2; const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)); const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const f=keys.has('w')||keys.has('arrowup')||touch.forward,b=keys.has('s')||keys.has('arrowdown')||touch.back,l=keys.has('a')||keys.has('arrowleft')||touch.left,r=keys.has('d')||keys.has('arrowright')||touch.right;
  const move=new THREE.Vector3(); if(f)move.add(forward);if(b)move.sub(forward);if(l)move.sub(right);if(r)move.add(right); const isMoving=move.lengthSq()>0;
  if(isMoving){move.normalize();player.position.addScaledVector(move,speed*dt);player.rotation.y=Math.atan2(move.x,move.z);}
  player.position.x=THREE.MathUtils.clamp(player.position.x,-31,31);player.position.z=THREE.MathUtils.clamp(player.position.z,-31,31);
  const t=performance.now()*.012; const limbs=player.userData.limbs; const swing=isMoving?Math.sin(t*(keys.has('shift')?1.45:1))*.45:0; limbs.leftLeg.rotation.x=swing;limbs.rightLeg.rotation.x=-swing;limbs.leftArm.rotation.x=-swing*.7;limbs.rightArm.rotation.x=swing*.7;

  if(performance.now()<cameraRig.presetUntil){
    const d=cameraRig.manualDistance; desiredCamera.set(Math.sin(yaw)*d,7.5+pitch*7,Math.cos(yaw)*d); lookTarget.copy(cameraRig.manualTarget);
  } else {
    const distance=24; desiredCamera.set(player.position.x+Math.sin(yaw)*distance,7.8+pitch*8,player.position.z+Math.cos(yaw)*distance);
    lookTarget.set(player.position.x*.56,2.55,player.position.z*.56); // keeps the central Twin in the composition
  }
  camera.position.lerp(desiredCamera,1-Math.pow(.002,dt)); const currentLook=new THREE.Vector3(); camera.getWorldDirection(currentLook); camera.lookAt(lookTarget);
}

function animate(){
  const dt=Math.min(clock.getDelta(),.05); updateMovement(dt); const t=performance.now()*.001;
  station.halos[0].rotation.z+=dt*.12; station.halos[1].rotation.z-=dt*.09;
  sourceNodes.forEach((node,id)=>{node.group.position.y=node.base.y+Math.sin(t*1.1+node.phase)*.12;node.orb.rotation.y+=dt*.45;});
  baselineGhost.rotation.y=Math.sin(t*.3)*.08; todayGhost.rotation.y=-Math.sin(t*.3)*.08;
  if(activeRegion==='left_thigh') station.leftThighGlow.scale.setScalar(1+Math.sin(t*3)*.06);
  renderer.render(scene,camera); requestAnimationFrame(animate);
}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}; window.addEventListener('resize',resize);resize();
camera.position.set(0,8,32);camera.lookAt(0,2.5,0);animate();

showToast('Twin Core V0.4 · deterministic demo data');

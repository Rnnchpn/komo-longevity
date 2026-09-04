import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.querySelector('#world-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.03;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0f1310, 0.014);
const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 300);
const clock = new THREE.Clock();

const storedProfile = JSON.parse(localStorage.getItem('komo_world_avatar_v02') || '{}');
const storedProgress = JSON.parse(localStorage.getItem('komo_world_progress_v02') || '{}');
const profile = {
  name: storedProfile.name || 'Renan',
  skin: storedProfile.skin || 'mediterranean',
  hair: storedProfile.hair || 'short',
  hairColor: storedProfile.hairColor || 'dark',
  outfit: storedProfile.outfit || 'sage',
  height: Number(storedProfile.height || 100),
  build: Number(storedProfile.build || 100),
};
const world = {
  points: Number(storedProgress.points || 2480),
  level: Number(storedProgress.level || 12),
  timeline: 2,
  activeSource: null,
  compare: false,
  lastZone: 'twin',
};

const skinTones = { light:0xe8c8b1, mediterranean:0xc89472, olive:0xa97855, brown:0x79503b, deep:0x4f332a };
const hairTones = { dark:0x201c19, chestnut:0x604331, blond:0xc4a875, silver:0xaaa9a4 };
const outfits = {
  sage:{top:0x8b9987,pants:0x252c27,shoes:0xd8c9b3}, sand:{top:0xd1bea0,pants:0x34322e,shoes:0xede7dc},
  black:{top:0x171a18,pants:0x0f1110,shoes:0x7f877d}, white:{top:0xe8e5dc,pants:0x9fa397,shoes:0x242824}, navy:{top:0x273342,pants:0x161d24,shoes:0xd8c9b3}
};
const mat = (color, roughness=.72, metalness=.02) => new THREE.MeshStandardMaterial({ color, roughness, metalness });

scene.add(new THREE.HemisphereLight(0xf7efdf, 0x101411, 1.7));
const sun = new THREE.DirectionalLight(0xffefd7, 2.4);
sun.position.set(12, 22, 12); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);
const coreLight = new THREE.PointLight(0xb7c8af, 85, 55, 2); coreLight.position.set(0,8,0); scene.add(coreLight);

const floor = new THREE.Mesh(new THREE.CircleGeometry(38, 128), mat(0x171c18,.97));
floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
const outerRing = new THREE.Mesh(new THREE.RingGeometry(10.8,11.05,128), new THREE.MeshBasicMaterial({color:0x667463,transparent:true,opacity:.28,side:THREE.DoubleSide}));
outerRing.rotation.x = -Math.PI/2; outerRing.position.y = .01; scene.add(outerRing);

function addArchitecture(){
  const stage = new THREE.Mesh(new THREE.CylinderGeometry(4.15,4.4,.32,72), mat(0x202620,.9));
  stage.position.y=.16; stage.receiveShadow=true; scene.add(stage);
  const inner = new THREE.Mesh(new THREE.RingGeometry(3.55,3.72,96), new THREE.MeshBasicMaterial({color:0xcdbda5,transparent:true,opacity:.38,side:THREE.DoubleSide}));
  inner.rotation.x=-Math.PI/2; inner.position.y=.34; scene.add(inner);
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2;
    const column=new THREE.Mesh(new THREE.CylinderGeometry(.09,.14,5.8,16),mat(0x303831,.84));
    column.position.set(Math.cos(a)*12.8,2.9,Math.sin(a)*12.8); scene.add(column);
  }
  const ceiling = new THREE.Mesh(new THREE.TorusGeometry(8.8,.065,10,120), new THREE.MeshStandardMaterial({color:0xf3e9d8,emissive:0x8a7457,emissiveIntensity:.17}));
  ceiling.rotation.x=Math.PI/2; ceiling.position.y=6.8; scene.add(ceiling);
  const destinations=[
    ['MOTION LAB',0,-21,0xcdbda5],['REHAB',21,0,0x879783],['NETWORK',0,22,0xcdbda5],['CLINIC',-21,0,0x879783]
  ];
  destinations.forEach(([label,x,z,color])=>{
    const slab=new THREE.Mesh(new THREE.CylinderGeometry(4.1,4.3,.18,48),mat(0x202620,.91)); slab.position.set(x,.09,z); scene.add(slab);
    const portal=new THREE.Mesh(new THREE.TorusGeometry(2.3,.08,10,60),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.12,transparent:true,opacity:.7}));
    portal.position.set(x,2.8,z); portal.rotation.y = x ? Math.PI/2 : 0; scene.add(portal);
    const sprite=makeLabel(label, .82); sprite.position.set(x,5.6,z); scene.add(sprite);
  });
}

function makeLabel(text, opacity=1){
  const c=document.createElement('canvas'); c.width=512; c.height=128; const ctx=c.getContext('2d');
  ctx.fillStyle=`rgba(12,16,13,${.72*opacity})`; ctx.fillRect(40,25,432,70);
  ctx.strokeStyle=`rgba(255,255,255,${.16*opacity})`; ctx.strokeRect(40,25,432,70);
  ctx.font='500 30px Arial'; ctx.textAlign='center'; ctx.fillStyle=`rgba(244,240,231,${opacity})`; ctx.fillText(text,256,69);
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,opacity})); sprite.scale.set(3.2,.8,1); return sprite;
}

function createAvatar(data,{hologram=false,label=null}={}){
  const g=new THREE.Group(); const refs={};
  const skin=mat(skinTones[data.skin]||skinTones.mediterranean,.66); const fit=outfits[data.outfit]||outfits.sage;
  const top=mat(fit.top,.72); const pants=mat(fit.pants,.78); const shoes=mat(fit.shoes,.66);
  if(hologram){[skin,top,pants,shoes].forEach(m=>{m.transparent=true;m.opacity=.58;m.emissive=new THREE.Color(0x34463a);m.emissiveIntensity=.22;});}
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.58,1.28,7,14),top); torso.position.y=3.15; torso.castShadow=true; g.add(torso); refs.torso=torso;
  const head=new THREE.Mesh(new THREE.SphereGeometry(.53,28,20),skin); head.position.y=4.74; head.castShadow=true; g.add(head); refs.head=head;
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.18,.2,.28,16),skin); neck.position.y=4.18; g.add(neck);
  refs.leftArm=new THREE.Group(); refs.rightArm=new THREE.Group(); refs.leftArm.position.set(-.78,3.78,0); refs.rightArm.position.set(.78,3.78,0);
  [refs.leftArm,refs.rightArm].forEach(group=>{const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.16,1.15,5,10),skin);arm.position.y=-.66;group.add(arm);g.add(group)});
  refs.leftLeg=new THREE.Group(); refs.rightLeg=new THREE.Group(); refs.leftLeg.position.set(-.31,2.15,0); refs.rightLeg.position.set(.31,2.15,0);
  [refs.leftLeg,refs.rightLeg].forEach(group=>{const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.22,1.45,5,10),pants);leg.position.y=-.88;group.add(leg);const foot=new THREE.Mesh(new THREE.BoxGeometry(.4,.22,.72),shoes);foot.position.set(0,-1.78,-.14);group.add(foot);g.add(group)});
  const hairGroup=new THREE.Group(); hairGroup.position.y=4.74; g.add(hairGroup); refs.hairGroup=hairGroup;
  if(data.hair!=='bald'){
    const hm=mat(hairTones[data.hairColor]||hairTones.dark,.8); if(hologram){hm.transparent=true;hm.opacity=.5;hm.emissive=new THREE.Color(0x34463a);hm.emissiveIntensity=.18;}
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.55,22,14),hm);cap.scale.set(1.02,.48,1.02);cap.position.y=.33;hairGroup.add(cap);
    if(data.hair==='long'){const back=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.7,5,10),hm);back.position.set(0,-.2,.33);hairGroup.add(back)}
    if(data.hair==='bun'){const bun=new THREE.Mesh(new THREE.SphereGeometry(.25,16,12),hm);bun.position.set(0,.68,.15);hairGroup.add(bun)}
  }
  g.scale.set(data.build/100,data.height/100,data.build/100); g.userData.refs=refs; g.userData.materials={skin,top,pants,shoes};
  if(label){const s=makeLabel(label,.92);s.position.y=5.65;g.add(s)}
  return g;
}

addArchitecture();
const player=createAvatar(profile); player.position.set(0,0,11.5); player.rotation.y=Math.PI; scene.add(player);
const twin=createAvatar(profile,{hologram:true,label:'FUNCTIONAL TWIN'}); twin.scale.multiplyScalar(1.08); twin.position.set(0,.35,0); scene.add(twin);
const baselineTwin=createAvatar(profile,{hologram:true,label:'BASELINE'}); baselineTwin.scale.multiplyScalar(1.08); baselineTwin.position.set(-2.2,.35,0); baselineTwin.visible=false; scene.add(baselineTwin);

const overlayMat=new THREE.MeshStandardMaterial({color:0xb9d5b0,emissive:0x5b7c60,emissiveIntensity:.55,transparent:true,opacity:.18,wireframe:false});
const leftQuad=new THREE.Mesh(new THREE.CapsuleGeometry(.27,.72,6,12),overlayMat.clone()); leftQuad.position.set(-.34,1.85,-.03); twin.add(leftQuad);
const rightQuad=new THREE.Mesh(new THREE.CapsuleGeometry(.27,.72,6,12),overlayMat.clone()); rightQuad.position.set(.34,1.85,-.03); twin.add(rightQuad);
const torsoOverlay=new THREE.Mesh(new THREE.CapsuleGeometry(.64,1.35,7,14),overlayMat.clone()); torsoOverlay.position.y=3.15; twin.add(torsoOverlay);
const bodyHalo=new THREE.Mesh(new THREE.TorusGeometry(1.35,.025,8,70),new THREE.MeshBasicMaterial({color:0xb9d5b0,transparent:true,opacity:.38})); bodyHalo.rotation.x=Math.PI/2; bodyHalo.position.y=.02; twin.add(bodyHalo);

const snapshots=[
  {label:'BASELINE',date:'02 Jun 2026',motion:72,age:42,domains:{muscle:68,mobility:69,balance:78,posture:80},factor:.72},
  {label:'DAY 30',date:'02 Jul 2026',motion:78,age:41,domains:{muscle:75,mobility:73,balance:85,posture:84},factor:.84},
  {label:'TODAY',date:'02 Sep 2026',motion:84,age:39,domains:{muscle:82,mobility:76,balance:91,posture:88},factor:1}
];
const sources=[
  {key:'myodev',label:'Myodev',color:'#a7b69e',region:'Lower-limb muscle activation',baseline:'72%',today:'86%',metric:'Quadriceps symmetry',quality:'96%',copy:'Surface EMG and muscular recruitment become objective functional overlays on the Twin.'},
  {key:'tests',label:'Functional tests',color:'#d6c5aa',region:'Whole-body function',baseline:'3 tests',today:'4 tests',metric:'Test battery',quality:'93%',copy:'Stand-Up, Two-Step, GLFS-25 and governed functional tests anchor the Twin in repeatable function.'},
  {key:'gait',label:'Gait',color:'#9eada0',region:'Lower limbs / locomotion',baseline:'1.02 m/s',today:'1.21 m/s',metric:'Gait speed',quality:'91%',copy:'Walking parameters are represented as a locomotion layer rather than a separate static report.'},
  {key:'strength',label:'Strength',color:'#c8ad88',region:'Muscle groups',baseline:'68',today:'82',metric:'Strength domain',quality:'95%',copy:'Measured force feeds regional muscle state and left/right comparisons.'},
  {key:'posture',label:'Posture',color:'#a9b5a5',region:'Trunk / sagittal control',baseline:'80',today:'88',metric:'Posture domain',quality:'88%',copy:'Postural measurements attach to trunk alignment and longitudinal control.'},
  {key:'wearables',label:'Wearables',color:'#d9cdb9',region:'Daily physiology',baseline:'6,850',today:'7,432',metric:'Daily steps',quality:'82%',copy:'Connected devices update the daily layer without pretending to replace a supervised assessment.'},
  {key:'sleep',label:'Sleep',color:'#95a5b1',region:'Recovery context',baseline:'7h18',today:'7h42',metric:'Sleep duration',quality:'78%',copy:'Sleep contributes context to daily readiness and longitudinal behaviour.'},
  {key:'activity',label:'Activity',color:'#b6c29f',region:'Daily movement volume',baseline:'Baseline',today:'+8%',metric:'Activity vs usual',quality:'84%',copy:'Habitual movement creates a continuous layer between formal KŌMØ assessments.'},
  {key:'rehab',label:'Rehab',color:'#c7a98d',region:'Action / adherence',baseline:'0 sessions',today:'12 sessions',metric:'Programme completion',quality:'90%',copy:'Rehab closes the loop: assessment leads to action, action produces adherence and future reassessment.'},
  {key:'motion',label:'Motion Score',color:'#e1d3bd',region:'Summary layer',baseline:'72',today:'84',metric:'Motion Score',quality:'Versioned',copy:'The Motion Score summarizes the validated pipeline but never hides the underlying measurements.'}
];
const sourceMeshes=new Map();
function buildSourceNodes(){
  sources.forEach((source,i)=>{
    const a=(i/sources.length)*Math.PI*2-Math.PI/2; const radius=5.8; const y=1.15+(i%2)*.55;
    const group=new THREE.Group(); group.position.set(Math.cos(a)*radius,y,Math.sin(a)*radius);
    const color=new THREE.Color(source.color); const orb=new THREE.Mesh(new THREE.SphereGeometry(.18,20,14),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.55,roughness:.4})); group.add(orb);
    const halo=new THREE.Mesh(new THREE.SphereGeometry(.29,18,12),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.10,wireframe:true})); group.add(halo);
    const label=makeLabel(source.label.toUpperCase(),.72); label.scale.set(2.45,.62,1); label.position.y=.65; group.add(label);
    const points=[new THREE.Vector3(0,2.7,0),group.position.clone()]; const lineGeo=new THREE.BufferGeometry().setFromPoints(points); const line=new THREE.Line(lineGeo,new THREE.LineBasicMaterial({color,transparent:true,opacity:.16})); scene.add(line);
    scene.add(group); sourceMeshes.set(source.key,{group,orb,halo,line});
  });
}
buildSourceNodes();

const remoteData=[
  {name:'Léa',skin:'light',hair:'bun',hairColor:'chestnut',outfit:'sand',height:97,build:92},
  {name:'Maya',skin:'brown',hair:'long',hairColor:'dark',outfit:'white',height:101,build:96},
  {name:'Noah',skin:'olive',hair:'short',hairColor:'dark',outfit:'navy',height:105,build:104}
];
const remotes=remoteData.map((p,i)=>{const a=createAvatar(p,{label:p.name}); const angle=i/remoteData.length*Math.PI*2; a.scale.multiplyScalar(.88); a.position.set(Math.cos(angle)*14,0,Math.sin(angle)*14); scene.add(a); return {a,phase:angle,speed:.035+i*.01};});

const ui={
  motion:document.querySelector('#motion-score'),age:document.querySelector('#motion-age'),points:document.querySelector('#komo-points'),level:document.querySelector('#komo-level'),
  muscle:document.querySelector('#domain-muscle'),mobility:document.querySelector('#domain-mobility'),balance:document.querySelector('#domain-balance'),posture:document.querySelector('#domain-posture'),
  timeline:document.querySelector('#timeline-input'),timelineLabel:document.querySelector('#timeline-label'),status:document.querySelector('#snapshot-status'),sourceList:document.querySelector('#source-list'),
  detail:document.querySelector('#detail-panel'),detailContent:document.querySelector('#detail-content'),detailEyebrow:document.querySelector('#detail-eyebrow'),toast:document.querySelector('#toast'),
  profile:document.querySelector('#profile-button'),playerName:document.querySelector('#player-name')
};
function initials(name){return name.trim().split(/\s+/).slice(0,2).map(v=>v[0]?.toUpperCase()||'').join('')||'K'}
function formatPoints(v){return new Intl.NumberFormat('en-US').format(v)}
function showToast(text){ui.toast.textContent=text;ui.toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>ui.toast.classList.remove('show'),2300)}
function updateHud(){ui.points.textContent=formatPoints(world.points);ui.level.textContent=world.level;ui.profile.textContent=initials(profile.name);ui.playerName.textContent=profile.name}
function renderSources(){ui.sourceList.innerHTML=sources.map((s,i)=>`<button class="source-button" data-source="${s.key}" style="--source-color:${s.color}"><i></i><b>${String(i+1).padStart(2,'0')} · ${s.label}</b><small>${s.today}</small></button>`).join('');ui.sourceList.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>focusSource(b.dataset.source)))}

function resetOverlays(){leftQuad.material.opacity=.11;rightQuad.material.opacity=.11;torsoOverlay.material.opacity=.09;bodyHalo.material.opacity=.28;sourceMeshes.forEach(v=>{v.orb.scale.setScalar(1);v.halo.material.opacity=.10;v.line.material.opacity=.12});document.querySelectorAll('.source-button').forEach(b=>b.classList.remove('active'))}
function focusSource(key){
  world.activeSource=key; resetOverlays(); const source=sources.find(s=>s.key===key); const mesh=sourceMeshes.get(key); if(!source||!mesh)return;
  mesh.orb.scale.setScalar(1.45);mesh.halo.material.opacity=.45;mesh.line.material.opacity=.6;document.querySelector(`[data-source="${key}"]`)?.classList.add('active');
  if(['myodev','gait','strength','tests','rehab'].includes(key)){leftQuad.material.opacity=.48;rightQuad.material.opacity=.34}
  if(key==='posture')torsoOverlay.material.opacity=.46;
  if(['wearables','sleep','activity','motion'].includes(key))bodyHalo.material.opacity=.7;
  ui.detailEyebrow.textContent=source.region.toUpperCase();
  ui.detailContent.innerHTML=`<h2>${source.label}</h2><p>${source.copy}</p><div class="detail-value"><div><span>Baseline</span><strong>${source.baseline}</strong></div><div><span>Today</span><strong>${source.today}</strong></div><div><span>Primary metric</span><strong>${source.metric}</strong></div><div><span>Data quality</span><strong>${source.quality}</strong></div></div><div class="provenance">Prototype data · source provenance retained · measured/derived status must remain explicit · no AI layer may silently overwrite the underlying value.</div>`;
  ui.detail.classList.add('open');
}

function updateTimeline(index){
  world.timeline=Number(index); const s=snapshots[world.timeline]; ui.motion.textContent=s.motion;ui.age.textContent=s.age;ui.muscle.textContent=s.domains.muscle;ui.mobility.textContent=s.domains.mobility;ui.balance.textContent=s.domains.balance;ui.posture.textContent=s.domains.posture;ui.timelineLabel.textContent=s.label;ui.status.textContent=`${s.label==='TODAY'?'Today':s.label} · ${s.date} · demo snapshot`;
  twin.scale.set(profile.build/100*1.08*s.factor,profile.height/100*1.08,profile.build/100*1.08*s.factor); leftQuad.material.opacity=.11+(.12*s.factor); rightQuad.material.opacity=.1+(.1*s.factor);
  sources.forEach((src,i)=>{const mesh=sourceMeshes.get(src.key);const scale=.82+s.factor*.22+(i%3)*.015;mesh.group.scale.setScalar(scale)});
}

function toggleCompare(){world.compare=!world.compare;baselineTwin.visible=world.compare;if(world.compare){baselineTwin.position.set(-2.25,.35,0);twin.position.x=2.25;showToast('Baseline vs today · side-by-side functional view')}else{twin.position.x=0;showToast('Single Twin view')}}

const zoneTargets={twin:new THREE.Vector3(0,0,11.5),motion:new THREE.Vector3(0,0,-16.5),rehab:new THREE.Vector3(16.5,0,0),network:new THREE.Vector3(0,0,17.5)};
document.querySelectorAll('[data-zone]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.zone;player.position.copy(zoneTargets[key]);world.lastZone=key;document.querySelectorAll('[data-zone]').forEach(b=>b.classList.toggle('active',b===btn));if(key==='twin')showToast('Functional Twin · longitudinal core');if(key==='motion')showToast('Motion Lab · detailed measurement views');if(key==='rehab')showToast('Rehab · intervention closes the loop');if(key==='network')showToast('Network · physical KŌMØ nodes')}));

document.querySelector('#compare-button').addEventListener('click',toggleCompare);
document.querySelector('#astra-button').addEventListener('click',()=>{ui.detailEyebrow.textContent='KŌMØ SPATIAL AGENT';ui.detailContent.innerHTML='<h2>Ask the Twin</h2><p>The future Astra layer should let you say: “Why did my Motion Score improve?”, “Show the change in my left quadriceps since baseline”, or “Take me to the Rehab room that addresses this deficit.” The agent explains and navigates; deterministic services remain responsible for measured values, scoring and clinical rules.</p><div class="provenance">Agent layer planned · not connected in this prototype.</div>';ui.detail.classList.add('open')});
document.querySelector('#detail-close').addEventListener('click',()=>ui.detail.classList.remove('open'));
document.querySelector('#points-button').addEventListener('click',()=>showToast(`${formatPoints(world.points)} KŌMØ Points · engagement layer`));
ui.profile.addEventListener('click',()=>showToast('Avatar customisation remains available in World V0.2'));
ui.timeline.addEventListener('input',e=>updateTimeline(e.target.value));

const keys=new Set(); const touchMove={forward:false,back:false,left:false,right:false}; let yaw=0,pitch=.13,dragging=false,last={x:0,y:0},moving=false;
window.addEventListener('keydown',e=>keys.add(e.key.toLowerCase()));window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointerdown',e=>{dragging=true;last={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId)});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointermove',e=>{if(!dragging)return;yaw-=(e.clientX-last.x)*.004;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-last.y)*.0024,-.18,.42);last={x:e.clientX,y:e.clientY}});
document.querySelectorAll('[data-move]').forEach(btn=>{const dir=btn.dataset.move;const on=e=>{e.preventDefault();touchMove[dir]=true};const off=e=>{e.preventDefault();touchMove[dir]=false};btn.addEventListener('pointerdown',on);btn.addEventListener('pointerup',off);btn.addEventListener('pointercancel',off);btn.addEventListener('pointerleave',off)});

function animateAvatar(g,t,amount=1){const r=g.userData.refs;if(!r)return;const swing=Math.sin(t*7)*.45*amount;r.leftLeg.rotation.x=swing;r.rightLeg.rotation.x=-swing;r.leftArm.rotation.x=-swing*.65;r.rightArm.rotation.x=swing*.65}
function clampPlayer(){player.position.x=THREE.MathUtils.clamp(player.position.x,-30,30);player.position.z=THREE.MathUtils.clamp(player.position.z,-30,30);player.position.y=0}
function updateCamera(dt){
  // Deliberately pulled back compared with V0.2 so the full avatar and Twin architecture remain visible.
  const distance=13.8; const height=6.6; const behind=new THREE.Vector3(Math.sin(yaw)*distance,height+pitch*5,Math.cos(yaw)*distance); const desired=player.position.clone().add(behind); camera.position.lerp(desired,1-Math.pow(.0007,dt)); const target=player.position.clone().add(new THREE.Vector3(0,2.65,0)); camera.lookAt(target);
}
function animate(){
  const dt=Math.min(clock.getDelta(),.05); const t=performance.now()/1000; const speed=keys.has('shift')?7.2:4.3; const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)); const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const f=keys.has('w')||keys.has('arrowup')||touchMove.forward,b=keys.has('s')||keys.has('arrowdown')||touchMove.back,l=keys.has('a')||keys.has('arrowleft')||touchMove.left,r=keys.has('d')||keys.has('arrowright')||touchMove.right; moving=f||b||l||r;
  const move=new THREE.Vector3();if(f)move.add(forward);if(b)move.sub(forward);if(l)move.sub(right);if(r)move.add(right);if(move.lengthSq()){move.normalize();player.position.addScaledVector(move,speed*dt);player.rotation.y=Math.atan2(move.x,move.z)+Math.PI;}
  clampPlayer();animateAvatar(player,t,moving?1:0);updateCamera(dt);
  twin.rotation.y=Math.sin(t*.35)*.08;bodyHalo.rotation.z+=dt*.12;baselineTwin.rotation.y=-Math.sin(t*.3)*.06;
  remotes.forEach((remote,i)=>{const a=t*remote.speed*5+remote.phase;remote.a.position.x=Math.cos(a)*14;remote.a.position.z=Math.sin(a)*14;remote.a.rotation.y=-a+Math.PI/2;animateAvatar(remote.a,t+i,.45)});
  sourceMeshes.forEach((mesh,i)=>{mesh.halo.rotation.y+=dt*.25;mesh.group.position.y += Math.sin(t*1.2+i)*.0007});
  renderer.render(scene,camera);requestAnimationFrame(animate)
}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
window.addEventListener('resize',resize);resize();renderSources();updateHud();updateTimeline(2);updateCamera(.016);animate();

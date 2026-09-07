import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.querySelector('#world-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x101411, 0.017);
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 250);
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
  motion: 84,
  reps: 0,
  rehabRunning: false,
  lastZone: 'atrium',
};

const skinTones = {
  light: 0xe8c8b1,
  mediterranean: 0xc89472,
  olive: 0xa97855,
  brown: 0x79503b,
  deep: 0x4f332a,
};
const hairTones = { dark: 0x201c19, chestnut: 0x604331, blond: 0xc4a875, silver: 0xaaa9a4 };
const outfits = {
  sage: { top: 0x8b9987, pants: 0x252c27, shoes: 0xd8c9b3 },
  sand: { top: 0xd1bea0, pants: 0x34322e, shoes: 0xede7dc },
  black: { top: 0x171a18, pants: 0x0f1110, shoes: 0x7f877d },
  white: { top: 0xe8e5dc, pants: 0x9fa397, shoes: 0x242824 },
  navy: { top: 0x273342, pants: 0x161d24, shoes: 0xd8c9b3 },
};

const mat = (color, roughness = .72) => new THREE.MeshStandardMaterial({ color, roughness, metalness: .02 });
const floorMat = mat(0x171c18, .96);
const wallMat = mat(0x293029, .91);
const sageMat = mat(0x879783, .62);
const sandMat = mat(0xcdbda5, .7);
const darkMat = mat(0x111511, .84);

scene.add(new THREE.HemisphereLight(0xf7efdf, 0x111511, 1.65));
const sun = new THREE.DirectionalLight(0xffefd7, 2.3);
sun.position.set(12, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);
const atriumGlow = new THREE.PointLight(0xb7c8af, 60, 46, 2);
atriumGlow.position.set(0, 8, 0);
scene.add(atriumGlow);

const floor = new THREE.Mesh(new THREE.CircleGeometry(32, 96), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const roomConfig = {
  atrium: { pos: new THREE.Vector3(0, 0, 8), yaw: 0, title: 'The Atrium', eyebrow: 'KŌMØ WORLD', copy: 'A shared social hub. Walk freely, meet other members and choose your next room.' },
  twin: { pos: new THREE.Vector3(-15, 0, 0), yaw: -Math.PI / 2, title: 'My Twin', eyebrow: 'FUNCTIONAL DIGITAL TWIN', copy: 'Your appearance follows your avatar. The functional overlays remain driven by measured data.' },
  motion: { pos: new THREE.Vector3(0, 0, -15), yaw: Math.PI, title: 'Motion Lab', eyebrow: 'MEASURE · COMPARE · UNDERSTAND', copy: 'Explore muscle, mobility, balance and posture as a spatial longitudinal profile.' },
  rehab: { pos: new THREE.Vector3(15, 0, 0), yaw: Math.PI / 2, title: 'Rehab', eyebrow: 'MOVE · TRAIN · PROGRESS', copy: 'Dedicated exercise rooms become the bridge between assessment, action and reassessment.' },
  network: { pos: new THREE.Vector3(0, 0, 17), yaw: 0, title: 'KŌMØ Network', eyebrow: 'REAL PLACES · ONE PROFILE', copy: 'Discover physical KŌMØ nodes, future events and partner experiences.' },
};
const zones = [
  { id: 'twin', center: new THREE.Vector3(-16, 0, 0), radius: 7.3 },
  { id: 'motion', center: new THREE.Vector3(0, 0, -16), radius: 7.3 },
  { id: 'rehab', center: new THREE.Vector3(16, 0, 0), radius: 7.3 },
  { id: 'network', center: new THREE.Vector3(0, 0, 18), radius: 7.3 },
];

function addArchitecture() {
  const ring = new THREE.Mesh(new THREE.RingGeometry(8.8, 9.05, 96), new THREE.MeshBasicMaterial({ color: 0x667463, transparent: true, opacity: .34, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = .012;
  scene.add(ring);

  const specs = [
    ['twin', -17.5, 0, 11, 13, sageMat],
    ['motion', 0, -17.5, 13, 11, sandMat],
    ['rehab', 17.5, 0, 11, 13, sageMat],
    ['network', 0, 19, 14, 11, sandMat],
  ];
  specs.forEach(([id, x, z, w, d, accent]) => {
    const room = new THREE.Group(); room.position.set(x, 0, z);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, .18, d), mat(0x202620, .92)); slab.position.y = .08; slab.receiveShadow = true; room.add(slab);
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, 6.6, .35), wallMat);
    back.position.set(0, 3.25, id === 'motion' ? -d / 2 : id === 'network' ? d / 2 : 0);
    if (id === 'twin') { back.geometry = new THREE.BoxGeometry(.35, 6.6, d); back.position.set(-w / 2, 3.25, 0); }
    if (id === 'rehab') { back.geometry = new THREE.BoxGeometry(.35, 6.6, d); back.position.set(w / 2, 3.25, 0); }
    room.add(back);
    const portal = new THREE.Mesh(new THREE.BoxGeometry(id === 'motion' || id === 'network' ? 5.8 : .24, 4.8, id === 'motion' || id === 'network' ? .24 : 5.8), accent.clone());
    portal.position.y = 2.4; portal.material.transparent = true; portal.material.opacity = .17;
    if (id === 'motion') portal.position.z = d / 2 - .25;
    if (id === 'network') portal.position.z = -d / 2 + .25;
    if (id === 'twin') portal.position.x = w / 2 - .25;
    if (id === 'rehab') portal.position.x = -w / 2 + .25;
    room.add(portal);
    const lamp = new THREE.PointLight(id === 'motion' || id === 'network' ? 0xffddb5 : 0xb9d5b0, 42, 14, 2); lamp.position.set(0, 4.4, 0); room.add(lamp);
    scene.add(room);
  });
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    const column = new THREE.Mesh(new THREE.CylinderGeometry(.11, .15, 5.2, 16), mat(0x303831, .82));
    column.position.set(Math.cos(a) * 10.8, 2.6, Math.sin(a) * 10.8); scene.add(column);
  }
  const ceiling = new THREE.Mesh(new THREE.TorusGeometry(7.2, .075, 12, 96), new THREE.MeshStandardMaterial({ color: 0xf3e9d8, emissive: 0x8a7457, emissiveIntensity: .15 }));
  ceiling.rotation.x = Math.PI / 2; ceiling.position.y = 5.8; scene.add(ceiling);
}

function makeLabel(text) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
  x.fillStyle = 'rgba(12,16,13,.72)'; x.roundRect(50, 20, 412, 78, 30); x.fill();
  x.strokeStyle = 'rgba(255,255,255,.18)'; x.stroke();
  x.font = '500 34px Arial'; x.textAlign = 'center'; x.fillStyle = '#f4f0e7'; x.fillText(text, 256, 70);
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(2.7, .68, 1); sprite.position.y = 5.65; return sprite;
}

function createHumanoid(data, options = {}) {
  const hologram = !!options.hologram;
  const group = new THREE.Group();
  const refs = {};
  const skin = mat(skinTones[data.skin] || skinTones.mediterranean, .66);
  const top = mat(outfits[data.outfit]?.top || outfits.sage.top, .72);
  const pants = mat(outfits[data.outfit]?.pants || outfits.sage.pants, .78);
  const shoes = mat(outfits[data.outfit]?.shoes || outfits.sage.shoes, .64);
  if (hologram) [skin, top, pants, shoes].forEach(m => { m.transparent = true; m.opacity = .72; m.emissive = new THREE.Color(0x29382e); m.emissiveIntensity = .18; });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.58, 1.25, 7, 14), top); torso.position.y = 3.15; torso.castShadow = true; group.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.53, 28, 20), skin); head.position.y = 4.72; head.castShadow = true; group.add(head); refs.head = head;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.18, .2, .28, 16), skin); neck.position.y = 4.17; group.add(neck);

  refs.leftArm = new THREE.Group(); refs.rightArm = new THREE.Group();
  refs.leftArm.position.set(-.78, 3.78, 0); refs.rightArm.position.set(.78, 3.78, 0);
  [-1, 1].forEach((side, idx) => {
    const armGroup = idx === 0 ? refs.leftArm : refs.rightArm;
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.16, 1.16, 5, 10), skin); arm.position.y = -.66; arm.castShadow = true; armGroup.add(arm); group.add(armGroup);
  });

  refs.leftLeg = new THREE.Group(); refs.rightLeg = new THREE.Group();
  refs.leftLeg.position.set(-.31, 2.15, 0); refs.rightLeg.position.set(.31, 2.15, 0);
  [-1, 1].forEach((side, idx) => {
    const legGroup = idx === 0 ? refs.leftLeg : refs.rightLeg;
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.22, 1.45, 5, 10), pants); leg.position.y = -.88; leg.castShadow = true; legGroup.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(.4, .22, .7), shoes); foot.position.set(0, -1.78, -.14); foot.castShadow = true; legGroup.add(foot); group.add(legGroup);
  });

  refs.hairGroup = new THREE.Group(); refs.hairGroup.position.y = 4.72; group.add(refs.hairGroup);
  group.userData.materials = { skin, top, pants, shoes };
  group.userData.refs = refs;
  applyAvatarProfile(group, data, hologram);
  if (options.label) group.add(makeLabel(options.label));
  return group;
}

function rebuildHair(group, data, hologram) {
  const hairGroup = group.userData.refs.hairGroup;
  while (hairGroup.children.length) hairGroup.remove(hairGroup.children[0]);
  if (data.hair === 'bald') return;
  const hairMat = mat(hairTones[data.hairColor] || hairTones.dark, .8);
  if (hologram) { hairMat.transparent = true; hairMat.opacity = .68; hairMat.emissive = new THREE.Color(0x29382e); hairMat.emissiveIntensity = .15; }
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.55, 24, 16), hairMat); cap.scale.set(1.02, .48, 1.02); cap.position.y = .33; hairGroup.add(cap);
  if (data.hair === 'long') { const back = new THREE.Mesh(new THREE.CapsuleGeometry(.34, .72, 5, 10), hairMat); back.position.set(0, -.2, .33); back.rotation.x = -.08; hairGroup.add(back); }
  if (data.hair === 'bun') { const bun = new THREE.Mesh(new THREE.SphereGeometry(.25, 18, 12), hairMat); bun.position.set(0, .68, .15); hairGroup.add(bun); }
}

function applyAvatarProfile(group, data, hologram = false) {
  const mats = group.userData.materials;
  mats.skin.color.setHex(skinTones[data.skin] || skinTones.mediterranean);
  const fit = outfits[data.outfit] || outfits.sage;
  mats.top.color.setHex(fit.top); mats.pants.color.setHex(fit.pants); mats.shoes.color.setHex(fit.shoes);
  group.scale.set(Number(data.build) / 100, Number(data.height) / 100, Number(data.build) / 100);
  rebuildHair(group, data, hologram);
}

function addMotionLab() {
  const group = new THREE.Group(); group.position.set(0, .2, -18.1);
  [84, 76, 91, 88, 79].forEach((value, i) => {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(.21, .27, value / 100 * 4.4, 22), i % 2 ? sandMat : sageMat);
    bar.position.set((i - 2) * 1.25, value / 100 * 2.2 + .2, 0); group.add(bar);
  }); scene.add(group);
}
function addRehab() {
  const group = new THREE.Group(); group.position.set(18, .15, 0);
  const exerciseMat = new THREE.Mesh(new THREE.BoxGeometry(5.4, .08, 2.6), mat(0x697268, .94)); exerciseMat.position.y = .04; group.add(exerciseMat);
  const step = new THREE.Mesh(new THREE.BoxGeometry(2.4, .45, 1.2), sandMat); step.position.set(0, .23, -2.3); group.add(step); scene.add(group);
}
function addNetwork() {
  const group = new THREE.Group(); group.position.set(0, .2, 19.2);
  [[-2.8,.7,-.8],[-1.2,1.1,.7],[.8,.85,-.3],[2.5,1.35,.9]].forEach(([x,h,z], i) => {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(.07,.15,h,16), i % 2 ? sandMat : sageMat); pin.position.set(x,h/2,z); group.add(pin);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(.16,18,12), mat(0xf0e3cd,.55)); orb.position.set(x,h+.12,z); group.add(orb);
  }); scene.add(group);
}

addArchitecture(); addMotionLab(); addRehab(); addNetwork();
const player = createHumanoid(profile); player.position.copy(roomConfig.atrium.pos); scene.add(player);
const functionalTwin = createHumanoid(profile, { hologram: true, label: 'Functional Twin' }); functionalTwin.position.set(-17.4, .12, 0); functionalTwin.rotation.y = Math.PI / 2; scene.add(functionalTwin);
const twinHalo = new THREE.Mesh(new THREE.TorusGeometry(1.45, .025, 8, 64), new THREE.MeshBasicMaterial({ color: 0xb9d5b0, transparent: true, opacity: .5 })); twinHalo.rotation.x = Math.PI / 2; twinHalo.position.set(-17.4, .12, 0); scene.add(twinHalo);

const remoteProfiles = [
  { name: 'Léa', skin:'light', hair:'bun', hairColor:'chestnut', outfit:'sand', height:97, build:92 },
  { name: 'Maya', skin:'brown', hair:'long', hairColor:'dark', outfit:'white', height:101, build:96 },
  { name: 'Noah', skin:'olive', hair:'short', hairColor:'dark', outfit:'navy', height:105, build:104 },
  { name: 'Alex', skin:'deep', hair:'bald', hairColor:'dark', outfit:'sage', height:102, build:108 },
];
const remotes = remoteProfiles.map((p, i) => {
  const avatar = createHumanoid(p, { label: p.name });
  const angle = i / remoteProfiles.length * Math.PI * 2;
  avatar.position.set(Math.cos(angle) * (5.5 + i * .3), 0, Math.sin(angle) * (5.5 + i * .3)); scene.add(avatar);
  return { avatar, phase: angle, radius: 5.4 + i * .35, speed: .07 + i * .012 };
});

const keys = new Set(); const touchMove = { forward:false, back:false, left:false, right:false };
let yaw = 0; let pitch = .05; let dragging = false; let lastPointer = { x:0, y:0 }; let moving = false;
window.addEventListener('keydown', e => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointerdown', e => { dragging = true; lastPointer = { x:e.clientX, y:e.clientY }; canvas.setPointerCapture?.(e.pointerId); });
canvas.addEventListener('pointerup', () => dragging = false);
canvas.addEventListener('pointermove', e => { if (!dragging) return; yaw -= (e.clientX-lastPointer.x)*.004; pitch = THREE.MathUtils.clamp(pitch - (e.clientY-lastPointer.y)*.0025, -.3, .52); lastPointer={x:e.clientX,y:e.clientY}; });
document.querySelectorAll('[data-move]').forEach(button => {
  const dir = button.dataset.move; const on = e => { e.preventDefault(); touchMove[dir]=true; }; const off = e => { e.preventDefault(); touchMove[dir]=false; };
  button.addEventListener('pointerdown', on); button.addEventListener('pointerup', off); button.addEventListener('pointercancel', off); button.addEventListener('pointerleave', off);
});

const zoneTitle = document.querySelector('#zone-title'); const zoneCopy = document.querySelector('#zone-copy'); const missionText = document.querySelector('#mission-text');
const contextPanel = document.querySelector('#context-panel'); const panelContent = document.querySelector('#panel-content'); const panelEyebrow = document.querySelector('#panel-eyebrow');
const pointsEl = document.querySelector('#komo-points'); const levelEl = document.querySelector('#komo-level'); const motionEl = document.querySelector('#motion-score'); const toast = document.querySelector('#toast');
const profileButton = document.querySelector('#profile-button'); const playerName = document.querySelector('#player-name');

const formatPoints = value => new Intl.NumberFormat('en-US').format(value);
function initials(name) { return name.trim().split(/\s+/).slice(0,2).map(v=>v[0]?.toUpperCase() || '').join('') || 'K'; }
function saveProfile() { localStorage.setItem('komo_world_avatar_v02', JSON.stringify(profile)); }
function saveProgress() { localStorage.setItem('komo_world_progress_v02', JSON.stringify({ points:world.points, level:world.level })); }
function updateHud() { pointsEl.textContent=formatPoints(world.points); levelEl.textContent=world.level; motionEl.textContent=world.motion; profileButton.textContent=initials(profile.name); playerName.textContent=profile.name; }
function showToast(text) { toast.textContent=text; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('show'),2200); }

function activeZone() {
  let nearest='atrium', nearestDist=Infinity;
  zones.forEach(zone => { const dist=Math.hypot(player.position.x-zone.center.x, player.position.z-zone.center.z); if (dist<zone.radius && dist<nearestDist) { nearest=zone.id; nearestDist=dist; } });
  return nearest;
}
function setRoomUi(room, open=false) {
  const cfg=roomConfig[room]; zoneTitle.textContent=cfg.title; zoneCopy.textContent=cfg.copy;
  missionText.textContent = room==='atrium' ? '5 people online · prototype presence' : room==='rehab' ? 'Lower limb session available · +85 KŌMØ Points' : room==='twin' ? 'Twin appearance synced · functional layer locked to data' : room==='motion' ? 'Latest assessment · 5 domains' : '4 partner nodes · prototype network';
  document.querySelectorAll('.room-button').forEach(b=>b.classList.toggle('active',b.dataset.room===room)); if(open) openRoomPanel(room);
}
function goToRoom(room) { player.position.copy(roomConfig[room].pos); yaw=roomConfig[room].yaw; setRoomUi(room,true); }

function roomPanel(room) {
  if (room==='atrium') return `<h2>Welcome, ${profile.name}</h2><p>KŌMØ World is becoming a shared persistent universe. The people around you are simulated presence in V0.2; real-time accounts come next.</p><div class="metric-grid"><div class="metric-card"><span>Online now</span><strong>5</strong><small>Prototype</small></div><div class="metric-card"><span>KŌMØ Points</span><strong>${formatPoints(world.points)}</strong><small>Level ${world.level}</small></div></div><div class="online-list">${remoteProfiles.map(p=>`<div class="online-row"><span>${p.name}</span><small>Atrium · online</small></div>`).join('')}</div><button class="action-button" data-avatar-editor>Customise my avatar</button>`;
  if (room==='twin') return `<h2>Your Functional Twin</h2><p>Your cosmetic identity follows your avatar, while clinical/functional overlays remain tied to actual measurements.</p><div class="metric-grid"><div class="metric-card"><span>Quadriceps symmetry</span><strong>86%</strong><small>Measured layer</small></div><div class="metric-card"><span>Motion Age</span><strong>39</strong><small>−2.1 y</small></div><div class="metric-card"><span>Balance</span><strong>91</strong><small>Stable</small></div><div class="metric-card"><span>Mobility</span><strong>76</strong><small>Priority</small></div></div><button class="action-button" data-avatar-editor>Personalise appearance</button>`;
  if (room==='motion') return `<h2>Motion Lab</h2><p>Objective movement data remains the scientific core of the world.</p><div class="metric-grid"><div class="metric-card"><span>Muscle</span><strong>82</strong><small>+3</small></div><div class="metric-card"><span>Mobility</span><strong>76</strong><small>Target</small></div><div class="metric-card"><span>Balance</span><strong>91</strong><small>Excellent</small></div><div class="metric-card"><span>Posture</span><strong>88</strong><small>Stable</small></div></div><button class="action-button" data-go="rehab">Enter Rehab</button>`;
  if (room==='rehab') return `<h2>Rehab · Lower Limb</h2><p>Prototype session: complete ten controlled repetitions. Future versions will support motion capture and professionally governed programmes.</p><div class="metric-grid"><div class="metric-card"><span>Exercise</span><strong>Step-up</strong><small>Control & strength</small></div><div class="metric-card"><span>Reward</span><strong>+85</strong><small>KŌMØ Points</small></div></div><div class="session-progress"><i style="width:${world.reps*10}%"></i></div><p class="points-note">${world.reps}/10 repetitions completed</p><button class="action-button" id="rehab-rep">${world.rehabRunning?'Complete one repetition':'Start guided session'}</button><button class="action-button secondary" id="rehab-reset">Reset session</button>`;
  return `<h2>KŌMØ Network</h2><p>The MMORPG layer connects to real KŌMØ destinations rather than replacing them.</p><div class="wallet-row"><span>Cannes</span><strong>Partner node</strong></div><div class="wallet-row"><span>Monaco</span><strong>Coming next</strong></div><div class="wallet-row"><span>Saint-Tropez</span><strong>Mobile experiences</strong></div><button class="action-button" data-demo="network">Explore World Nodes</button>`;
}

function avatarEditorHtml() {
  const option=(value,label,current)=>`<option value="${value}" ${value===current?'selected':''}>${label}</option>`;
  return `<h2>My Avatar</h2><p>Create your identity in KŌMØ World. These choices are cosmetic and never overwrite measured health data.</p><div class="avatar-note">Cosmetic avatar = personal expression. Functional Twin overlays = objective KŌMØ measurements.</div><div class="avatar-editor"><label><span>Display name</span><input id="avatar-name" maxlength="24" value="${profile.name.replaceAll('"','&quot;')}" /></label><div class="editor-grid"><label><span>Skin</span><select id="avatar-skin">${option('light','Light',profile.skin)}${option('mediterranean','Mediterranean',profile.skin)}${option('olive','Olive',profile.skin)}${option('brown','Brown',profile.skin)}${option('deep','Deep',profile.skin)}</select></label><label><span>Hair style</span><select id="avatar-hair">${option('short','Short',profile.hair)}${option('long','Long',profile.hair)}${option('bun','Bun',profile.hair)}${option('bald','Bald',profile.hair)}</select></label><label><span>Hair colour</span><select id="avatar-hair-color">${option('dark','Dark',profile.hairColor)}${option('chestnut','Chestnut',profile.hairColor)}${option('blond','Blond',profile.hairColor)}${option('silver','Silver',profile.hairColor)}</select></label><label><span>Outfit</span><select id="avatar-outfit">${option('sage','KŌMØ Sage',profile.outfit)}${option('sand','Riviera Sand',profile.outfit)}${option('black','Clinical Black',profile.outfit)}${option('white','Studio White',profile.outfit)}${option('navy','Night Navy',profile.outfit)}</select></label></div><label><span>Height</span><input id="avatar-height" type="range" min="90" max="110" value="${profile.height}" /></label><label><span>Build</span><input id="avatar-build" type="range" min="86" max="116" value="${profile.build}" /></label><button class="action-button" id="avatar-save">Save avatar</button></div>`;
}
function applyProfileEverywhere() { applyAvatarProfile(player,profile,false); applyAvatarProfile(functionalTwin,profile,true); updateHud(); }
function bindAvatarEditor() {
  document.body.classList.add('avatar-editing');
  const fields={ name:panelContent.querySelector('#avatar-name'), skin:panelContent.querySelector('#avatar-skin'), hair:panelContent.querySelector('#avatar-hair'), hairColor:panelContent.querySelector('#avatar-hair-color'), outfit:panelContent.querySelector('#avatar-outfit'), height:panelContent.querySelector('#avatar-height'), build:panelContent.querySelector('#avatar-build') };
  const sync=()=>{ profile.name=(fields.name.value||'Explorer').trim().slice(0,24); profile.skin=fields.skin.value; profile.hair=fields.hair.value; profile.hairColor=fields.hairColor.value; profile.outfit=fields.outfit.value; profile.height=Number(fields.height.value); profile.build=Number(fields.build.value); applyProfileEverywhere(); };
  Object.values(fields).forEach(field=>field.addEventListener('input',sync));
  panelContent.querySelector('#avatar-save').addEventListener('click',()=>{ sync(); saveProfile(); document.body.classList.remove('avatar-editing'); showToast('Avatar saved · Functional Twin appearance synced'); });
}
function openAvatarEditor() { panelEyebrow.textContent='KŌMØ IDENTITY'; panelContent.innerHTML=avatarEditorHtml(); contextPanel.classList.add('open'); bindAvatarEditor(); }
function openRoomPanel(room) { panelEyebrow.textContent=roomConfig[room].eyebrow; panelContent.innerHTML=roomPanel(room); contextPanel.classList.add('open'); bindPanelActions(); }
function bindPanelActions() {
  panelContent.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>goToRoom(b.dataset.go)));
  panelContent.querySelectorAll('[data-avatar-editor]').forEach(b=>b.addEventListener('click',openAvatarEditor));
  panelContent.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>showToast('Persistent World Nodes are queued for the multiplayer backend')));
  const rep=panelContent.querySelector('#rehab-rep'); const reset=panelContent.querySelector('#rehab-reset'); if(rep) rep.addEventListener('click',handleRehabRep); if(reset) reset.addEventListener('click',()=>{world.reps=0;world.rehabRunning=false;openRoomPanel('rehab');});
}
function handleRehabRep() {
  if(!world.rehabRunning){world.rehabRunning=true;world.reps=0;showToast('Guided session started');}
  else if(world.reps<10) world.reps++;
  if(world.reps>=10){world.rehabRunning=false;world.points+=85;if(world.points>=3000&&world.level<13)world.level=13;saveProgress();updateHud();showToast('+85 KŌMØ Points · Session completed');}
  openRoomPanel('rehab');
}

document.querySelectorAll('.room-button').forEach(b=>b.addEventListener('click',()=>goToRoom(b.dataset.room)));
document.querySelector('#close-panel').addEventListener('click',()=>{contextPanel.classList.remove('open');document.body.classList.remove('avatar-editing');});
profileButton.addEventListener('click',openAvatarEditor);
document.querySelector('#points-chip').addEventListener('click',()=>{panelEyebrow.textContent='KŌMØ WALLET';panelContent.innerHTML=`<h2>${formatPoints(world.points)} Points</h2><p>Points reward participation and adherence. They are not currency or crypto.</p><div class="wallet-row"><span>Rehab session</span><strong>+85</strong></div><div class="wallet-row"><span>Motion Assessment</span><strong>+250</strong></div><div class="wallet-row"><span>7-day streak</span><strong>+120</strong></div><div class="wallet-row"><span>Avatar cosmetics</span><strong>Future unlock</strong></div>`;contextPanel.classList.add('open');});

function clampPlayer() { player.position.x=THREE.MathUtils.clamp(player.position.x,-26,26); player.position.z=THREE.MathUtils.clamp(player.position.z,-26,28); player.position.y=0; }
function animateAvatar(avatar, speedFactor, t) {
  const refs=avatar.userData.refs; const swing=moving?Math.sin(t*9*speedFactor)*.56:0;
  refs.leftArm.rotation.x=THREE.MathUtils.lerp(refs.leftArm.rotation.x,swing,.18); refs.rightArm.rotation.x=THREE.MathUtils.lerp(refs.rightArm.rotation.x,-swing,.18);
  refs.leftLeg.rotation.x=THREE.MathUtils.lerp(refs.leftLeg.rotation.x,-swing*.72,.18); refs.rightLeg.rotation.x=THREE.MathUtils.lerp(refs.rightLeg.rotation.x,swing*.72,.18);
}
function animate() {
  const dt=Math.min(clock.getDelta(),.05); const t=performance.now()*.001;
  const paused=document.body.classList.contains('avatar-editing'); const speed=keys.has('shift')?6.8:4.0;
  const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)); const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)); const dir=new THREE.Vector3();
  if(!paused){ if(keys.has('w')||keys.has('arrowup')||touchMove.forward)dir.add(forward); if(keys.has('s')||keys.has('arrowdown')||touchMove.back)dir.sub(forward); if(keys.has('d')||keys.has('arrowright')||touchMove.right)dir.add(right); if(keys.has('a')||keys.has('arrowleft')||touchMove.left)dir.sub(right); }
  moving=dir.lengthSq()>.001; if(moving){dir.normalize();player.position.addScaledVector(dir,speed*dt);player.rotation.y=Math.atan2(dir.x,dir.z);clampPlayer();}
  animateAvatar(player,keys.has('shift')?1.35:1,t);

  const cameraTarget=player.position.clone().add(new THREE.Vector3(0,2.55,0)); const desired=player.position.clone().addScaledVector(forward,-6.5); desired.y=3.25+pitch*3.1;
  camera.position.lerp(desired,1-Math.exp(-dt*8)); camera.lookAt(cameraTarget);

  remotes.forEach((r,i)=>{const a=t*r.speed+r.phase;r.avatar.position.x=Math.cos(a)*r.radius;r.avatar.position.z=Math.sin(a)*r.radius;r.avatar.rotation.y=-a+Math.PI/2; const rr=r.avatar.userData.refs;const s=Math.sin(t*5+i)*.28;rr.leftArm.rotation.x=s;rr.rightArm.rotation.x=-s;rr.leftLeg.rotation.x=-s*.65;rr.rightLeg.rotation.x=s*.65;});
  functionalTwin.rotation.y=Math.PI/2+Math.sin(t*.45)*.05; twinHalo.rotation.z+=dt*.13;

  const zone=activeZone(); if(zone!==world.lastZone){world.lastZone=zone;setRoomUi(zone,zone!=='atrium');}
  renderer.render(scene,camera); requestAnimationFrame(animate);
}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
addEventListener('resize',resize); resize(); updateHud(); applyProfileEverywhere(); setRoomUi('atrium'); animate();

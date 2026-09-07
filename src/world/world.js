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
scene.fog = new THREE.FogExp2(0x101411, 0.018);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 250);
camera.position.set(0, 2.1, 12.5);
let yaw = 0;
let pitch = -0.02;

const world = {
  room: 'atrium',
  points: 2480,
  level: 12,
  motion: 84,
  reps: 0,
  rehabRunning: false,
  lastZone: 'atrium',
};

const roomConfig = {
  atrium: {
    pos: new THREE.Vector3(0, 2.1, 12.5),
    title: 'The Atrium',
    copy: 'Your spatial starting point. Walk toward a room or use the room navigator.',
    eyebrow: 'KŌMØ WORLD',
  },
  twin: {
    pos: new THREE.Vector3(-16.5, 2.1, 0),
    title: 'My Twin',
    copy: 'A functional representation of your locomotor profile — built from measured data, not appearance alone.',
    eyebrow: 'FUNCTIONAL DIGITAL TWIN',
  },
  motion: {
    pos: new THREE.Vector3(0, 2.1, -16.5),
    title: 'Motion Lab',
    copy: 'Your longitudinal movement profile: muscle, mobility, balance, posture and gait.',
    eyebrow: 'MEASURE · COMPARE · UNDERSTAND',
  },
  rehab: {
    pos: new THREE.Vector3(16.5, 2.1, 0),
    title: 'Rehab',
    copy: 'A guided training room where prescribed movement can become measurable, repeatable and rewarding.',
    eyebrow: 'MOVE · TRAIN · PROGRESS',
  },
  network: {
    pos: new THREE.Vector3(0, 2.1, 17.5),
    title: 'KŌMØ Network',
    copy: 'A spatial doorway into KŌMØ centres, clinics, hotels, clubs and partner experiences.',
    eyebrow: 'REAL PLACES · ONE CONTINUOUS PROFILE',
  },
};

const zones = [
  { id: 'twin', center: new THREE.Vector3(-16, 0, 0), radius: 7.2 },
  { id: 'motion', center: new THREE.Vector3(0, 0, -16), radius: 7.2 },
  { id: 'rehab', center: new THREE.Vector3(16, 0, 0), radius: 7.2 },
  { id: 'network', center: new THREE.Vector3(0, 0, 18), radius: 7.2 },
];

const material = (color, roughness = 0.75, metalness = 0.03) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const wallMat = material(0x293029, 0.93);
const floorMat = material(0x171c18, 0.97);
const sageMat = material(0x879783, 0.65);
const sandMat = material(0xcdbda5, 0.72);
const darkMat = material(0x111511, 0.83);
const lightMat = new THREE.MeshStandardMaterial({ color: 0xf3e9d8, emissive: 0x8a7457, emissiveIntensity: 0.15, roughness: 0.6 });

scene.add(new THREE.HemisphereLight(0xf5efdf, 0x111511, 1.6));
const key = new THREE.DirectionalLight(0xffefd4, 2.4);
key.position.set(10, 20, 10);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
scene.add(key);
const fill = new THREE.PointLight(0xb7c8af, 55, 45, 2);
fill.position.set(0, 8, 0);
scene.add(fill);

const floor = new THREE.Mesh(new THREE.CircleGeometry(31, 96), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const ring = new THREE.Mesh(new THREE.RingGeometry(8.8, 9.05, 96), new THREE.MeshBasicMaterial({ color: 0x5f6d5d, transparent: true, opacity: 0.32, side: THREE.DoubleSide }));
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.012;
scene.add(ring);

function addArchitecture() {
  const roomSpecs = [
    { id: 'twin', x: -17.5, z: 0, w: 11, d: 13, accent: sageMat },
    { id: 'motion', x: 0, z: -17.5, w: 13, d: 11, accent: sandMat },
    { id: 'rehab', x: 17.5, z: 0, w: 11, d: 13, accent: sageMat },
    { id: 'network', x: 0, z: 19, w: 14, d: 11, accent: sandMat },
  ];

  roomSpecs.forEach(({ id, x, z, w, d, accent }) => {
    const room = new THREE.Group();
    room.position.set(x, 0, z);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, d), material(0x202620, 0.9));
    slab.position.y = 0.08;
    slab.receiveShadow = true;
    room.add(slab);

    const back = new THREE.Mesh(new THREE.BoxGeometry(w, 6.6, 0.35), wallMat);
    back.position.set(0, 3.25, id === 'motion' ? -d / 2 : id === 'network' ? d / 2 : 0);
    if (id === 'twin') { back.geometry = new THREE.BoxGeometry(0.35, 6.6, d); back.position.set(-w / 2, 3.25, 0); }
    if (id === 'rehab') { back.geometry = new THREE.BoxGeometry(0.35, 6.6, d); back.position.set(w / 2, 3.25, 0); }
    back.receiveShadow = true;
    room.add(back);

    const portal = new THREE.Mesh(new THREE.BoxGeometry(id === 'motion' || id === 'network' ? 5.8 : 0.26, 4.7, id === 'motion' || id === 'network' ? 0.26 : 5.8), accent);
    portal.position.y = 2.35;
    if (id === 'motion') portal.position.z = d / 2 - 0.25;
    if (id === 'network') portal.position.z = -d / 2 + 0.25;
    if (id === 'twin') portal.position.x = w / 2 - 0.25;
    if (id === 'rehab') portal.position.x = -w / 2 + 0.25;
    portal.material = portal.material.clone();
    portal.material.transparent = true;
    portal.material.opacity = 0.18;
    room.add(portal);

    const lamp = new THREE.PointLight(id === 'motion' || id === 'network' ? 0xffddb5 : 0xb9d5b0, 45, 14, 2);
    lamp.position.set(0, 4.4, 0);
    room.add(lamp);

    scene.add(room);
  });

  const ceilingRing = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.075, 12, 96), lightMat);
  ceilingRing.rotation.x = Math.PI / 2;
  ceilingRing.position.y = 5.8;
  scene.add(ceilingRing);

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 5.2, 18), material(0x303831, 0.82));
    column.position.set(Math.cos(a) * 10.8, 2.6, Math.sin(a) * 10.8);
    scene.add(column);
  }
}

function addTwin() {
  const twin = new THREE.Group();
  twin.position.set(-17.5, 0.16, 0);
  twin.rotation.y = Math.PI / 2;

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 1.6, 8, 16), new THREE.MeshPhysicalMaterial({
    color: 0xb9c4b3,
    roughness: 0.33,
    metalness: 0.03,
    transmission: 0.12,
    transparent: true,
    opacity: 0.9,
  }));
  body.position.y = 3.05;
  body.castShadow = true;
  twin.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), material(0xd2c3ad, 0.65));
  head.position.y = 4.9;
  twin.add(head);

  [-0.38, 0.38].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.75, 6, 12), material(0x899787, 0.55));
    leg.position.set(x, 1.25, 0);
    twin.add(leg);
  });

  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.025, 8, 64), new THREE.MeshBasicMaterial({ color: 0xb9d5b0, transparent: true, opacity: 0.45 }));
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 0.18;
  twin.add(halo);
  scene.add(twin);

  return { group: twin, halo };
}

function addMotionLab() {
  const group = new THREE.Group();
  group.position.set(0, 0.2, -18.1);
  const bars = [0.84, 0.76, 0.91, 0.82, 0.79];
  bars.forEach((value, i) => {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.2, 24), darkMat);
    base.position.set((i - 2) * 1.25, 0.1, 0);
    group.add(base);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.27, value * 4.4, 24), i % 2 ? sandMat : sageMat);
    bar.position.set((i - 2) * 1.25, value * 2.2 + 0.22, 0);
    group.add(bar);
  });
  scene.add(group);
}

function addRehab() {
  const group = new THREE.Group();
  group.position.set(18, 0.15, 0);
  const mat = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.08, 2.6), material(0x6c7569, 0.93));
  mat.position.y = 0.04;
  group.add(mat);
  const step = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 1.2), sandMat);
  step.position.set(0, 0.23, -2.3);
  group.add(step);
  const marker = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.035, 8, 48), new THREE.MeshBasicMaterial({ color: 0xb9d5b0 }));
  marker.rotation.x = Math.PI / 2;
  marker.position.y = 0.08;
  group.add(marker);
  scene.add(group);
}

function addNetwork() {
  const group = new THREE.Group();
  group.position.set(0, 0.2, 19.2);
  const locations = [
    [-2.8, 0.7, -0.8],
    [-1.2, 1.1, 0.7],
    [0.8, 0.85, -0.3],
    [2.5, 1.35, 0.9],
  ];
  locations.forEach(([x, h, z], i) => {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.15, h, 16), i % 2 ? sandMat : sageMat);
    pin.position.set(x, h / 2, z);
    group.add(pin);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 12), lightMat);
    orb.position.set(x, h + 0.12, z);
    group.add(orb);
  });
  const path = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.025, 8, 64), new THREE.MeshBasicMaterial({ color: 0x7b8b78, transparent: true, opacity: 0.45 }));
  path.rotation.x = Math.PI / 2;
  path.position.y = 0.04;
  group.add(path);
  scene.add(group);
}

addArchitecture();
const twin = addTwin();
addMotionLab();
addRehab();
addNetwork();

const clock = new THREE.Clock();
const keys = new Set();
let dragging = false;
let lastPointer = { x: 0, y: 0 };

window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointerdown', (e) => {
  dragging = true;
  lastPointer = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener('pointerup', () => dragging = false);
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastPointer.x;
  const dy = e.clientY - lastPointer.y;
  yaw -= dx * 0.004;
  pitch -= dy * 0.0025;
  pitch = THREE.MathUtils.clamp(pitch, -0.48, 0.35);
  lastPointer = { x: e.clientX, y: e.clientY };
});

const touchMove = { forward: false, back: false, left: false, right: false };
document.querySelectorAll('[data-move]').forEach((button) => {
  const dir = button.dataset.move;
  const on = (e) => { e.preventDefault(); touchMove[dir] = true; };
  const off = (e) => { e.preventDefault(); touchMove[dir] = false; };
  button.addEventListener('pointerdown', on);
  button.addEventListener('pointerup', off);
  button.addEventListener('pointercancel', off);
  button.addEventListener('pointerleave', off);
});

function clampPosition() {
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -25, 25);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -25, 27);
  camera.position.y = 2.1;
}

function activeZone() {
  let nearest = 'atrium';
  let nearestDist = Infinity;
  zones.forEach((zone) => {
    const dx = camera.position.x - zone.center.x;
    const dz = camera.position.z - zone.center.z;
    const dist = Math.hypot(dx, dz);
    if (dist < zone.radius && dist < nearestDist) {
      nearest = zone.id;
      nearestDist = dist;
    }
  });
  return nearest;
}

const zoneTitle = document.querySelector('#zone-title');
const zoneCopy = document.querySelector('#zone-copy');
const missionText = document.querySelector('#mission-text');
const contextPanel = document.querySelector('#context-panel');
const panelContent = document.querySelector('#panel-content');
const panelEyebrow = document.querySelector('#panel-eyebrow');
const pointsEl = document.querySelector('#komo-points');
const levelEl = document.querySelector('#komo-level');
const motionEl = document.querySelector('#motion-score');
const toast = document.querySelector('#toast');

function formatPoints(value) { return new Intl.NumberFormat('en-US').format(value); }
function updateHud() {
  pointsEl.textContent = formatPoints(world.points);
  levelEl.textContent = world.level;
  motionEl.textContent = world.motion;
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function roomPanel(room) {
  const templates = {
    atrium: `
      <h2>Welcome to KŌMØ World</h2>
      <p>This prototype connects the logic of Pulse to a spatial environment. The current data are demonstration values only.</p>
      <div class="metric-grid">
        <div class="metric-card"><span>Motion today</span><strong>${world.motion}</strong><small>Moving well</small></div>
        <div class="metric-card"><span>KŌMØ Points</span><strong>${formatPoints(world.points)}</strong><small>Level ${world.level}</small></div>
      </div>
      <button class="action-button" data-go="twin">View my Digital Twin</button>
      <button class="action-button secondary" data-go="rehab">Enter Rehab</button>`,
    twin: `
      <h2>Your Functional Twin</h2>
      <p>The twin is designed to represent measured locomotor function longitudinally. It should never imply anatomical precision beyond the underlying measurements.</p>
      <div class="metric-grid">
        <div class="metric-card"><span>Quadriceps symmetry</span><strong>86%</strong><small>+4 pts</small></div>
        <div class="metric-card"><span>Motion Age</span><strong>39</strong><small>−2.1 y</small></div>
        <div class="metric-card"><span>Balance</span><strong>91</strong><small>Stable</small></div>
        <div class="metric-card"><span>Mobility</span><strong>76</strong><small>Priority</small></div>
      </div>
      <button class="action-button" data-demo="compare">Compare with Day 1</button>`,
    motion: `
      <h2>Motion Lab</h2>
      <p>Your assessment becomes a room you can explore, rather than a static results page.</p>
      <div class="metric-grid">
        <div class="metric-card"><span>Muscle</span><strong>82</strong><small>+3</small></div>
        <div class="metric-card"><span>Mobility</span><strong>76</strong><small>Target</small></div>
        <div class="metric-card"><span>Balance</span><strong>91</strong><small>Excellent</small></div>
        <div class="metric-card"><span>Posture</span><strong>88</strong><small>Stable</small></div>
      </div>
      <button class="action-button" data-go="rehab">Turn findings into a session</button>`,
    rehab: `
      <h2>Rehab · Lower Limb</h2>
      <p>Prototype session: 10 controlled repetitions. In a future clinical version, prescription, movement quality and sensor feedback must be governed appropriately.</p>
      <div class="metric-grid">
        <div class="metric-card"><span>Exercise</span><strong>Step-up</strong><small>Control & strength</small></div>
        <div class="metric-card"><span>Target</span><strong>10 reps</strong><small>+85 points</small></div>
      </div>
      <div class="session-progress"><i id="rehab-progress" style="width:${world.reps * 10}%"></i></div>
      <p class="points-note" id="rehab-status">${world.reps}/10 repetitions completed</p>
      <button class="action-button" id="rehab-rep">${world.rehabRunning ? 'Complete one repetition' : 'Start guided session'}</button>
      <button class="action-button secondary" id="rehab-reset">Reset prototype session</button>`,
    network: `
      <h2>KŌMØ Network</h2>
      <p>Your digital profile can connect the virtual world with real KŌMØ destinations and professionals.</p>
      <div class="wallet-row"><span>Cannes</span><strong>Assessment · Partner node</strong></div>
      <div class="wallet-row"><span>Monaco</span><strong>Coming next</strong></div>
      <div class="wallet-row"><span>Saint-Tropez</span><strong>Mobile experience</strong></div>
      <button class="action-button" data-demo="book">Explore real-world experiences</button>`,
  };
  return templates[room];
}

function bindPanelActions() {
  panelContent.querySelectorAll('[data-go]').forEach((button) => {
    button.addEventListener('click', () => goToRoom(button.dataset.go));
  });
  panelContent.querySelectorAll('[data-demo]').forEach((button) => {
    button.addEventListener('click', () => showToast(button.dataset.demo === 'compare' ? 'Day 1 comparison is queued for V0.2' : 'Booking layer is queued for Network V0.2'));
  });
  const rep = panelContent.querySelector('#rehab-rep');
  const reset = panelContent.querySelector('#rehab-reset');
  if (rep) rep.addEventListener('click', handleRehabRep);
  if (reset) reset.addEventListener('click', () => {
    world.reps = 0;
    world.rehabRunning = false;
    openRoomPanel('rehab');
  });
}

function openRoomPanel(room) {
  world.room = room;
  panelEyebrow.textContent = roomConfig[room].eyebrow;
  panelContent.innerHTML = roomPanel(room);
  contextPanel.classList.add('open');
  bindPanelActions();
}

function setRoomUi(room, open = false) {
  const cfg = roomConfig[room];
  zoneTitle.textContent = cfg.title;
  zoneCopy.textContent = cfg.copy;
  missionText.textContent = room === 'rehab' ? 'Today · Lower limb session available' : room === 'network' ? '4 partner nodes · prototype data' : room === 'twin' ? 'Twin synced · Last assessment 2 Sep' : room === 'motion' ? 'Latest assessment · 5 domains' : 'Twin synced · Last assessment 2 Sep';
  document.querySelectorAll('.room-button').forEach((button) => button.classList.toggle('active', button.dataset.room === room));
  if (open) openRoomPanel(room);
}

function goToRoom(room) {
  const target = roomConfig[room].pos;
  camera.position.copy(target);
  if (room === 'twin') yaw = -Math.PI / 2;
  if (room === 'motion') yaw = Math.PI;
  if (room === 'rehab') yaw = Math.PI / 2;
  if (room === 'network') yaw = 0;
  if (room === 'atrium') yaw = 0;
  setRoomUi(room, true);
}

document.querySelectorAll('.room-button').forEach((button) => button.addEventListener('click', () => goToRoom(button.dataset.room)));
document.querySelector('#close-panel').addEventListener('click', () => contextPanel.classList.remove('open'));
document.querySelector('#profile-button').addEventListener('click', () => showToast('My KŌMŌ connection is planned for the Pulse integration phase'));
document.querySelector('#points-chip').addEventListener('click', () => {
  panelEyebrow.textContent = 'KŌMŌ WALLET';
  panelContent.innerHTML = `
    <h2>${formatPoints(world.points)} Points</h2>
    <p>Points reward engagement and adherence. They are not money, not crypto and have no cash-out value.</p>
    <div class="wallet-row"><span>Rehab session</span><strong>+85</strong></div>
    <div class="wallet-row"><span>Motion Assessment</span><strong>+250</strong></div>
    <div class="wallet-row"><span>7-day activity streak</span><strong>+120</strong></div>
    <div class="wallet-row"><span>Partner experience</span><strong>Unlock</strong></div>
    <button class="action-button secondary" data-demo="wallet">Explore rewards · V0.2</button>`;
  contextPanel.classList.add('open');
  bindPanelActions();
});

function handleRehabRep() {
  if (!world.rehabRunning) {
    world.rehabRunning = true;
    world.reps = 0;
    showToast('Guided session started');
  } else if (world.reps < 10) {
    world.reps += 1;
  }

  if (world.reps >= 10) {
    world.rehabRunning = false;
    world.points += 85;
    if (world.points >= 3000 && world.level < 13) world.level = 13;
    updateHud();
    showToast('+85 KŌMŌ Points · Session completed');
  }
  openRoomPanel('rehab');
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const speed = keys.has('shift') ? 8.5 : 4.8;
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  const f = keys.has('w') || keys.has('arrowup') || touchMove.forward;
  const b = keys.has('s') || keys.has('arrowdown') || touchMove.back;
  const l = keys.has('a') || keys.has('arrowleft') || touchMove.left;
  const r = keys.has('d') || keys.has('arrowright') || touchMove.right;

  if (f) camera.position.addScaledVector(forward, speed * dt);
  if (b) camera.position.addScaledVector(forward, -speed * dt);
  if (l) camera.position.addScaledVector(right, -speed * dt);
  if (r) camera.position.addScaledVector(right, speed * dt);
  clampPosition();

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  const zone = activeZone();
  if (zone !== world.lastZone) {
    world.lastZone = zone;
    setRoomUi(zone, zone !== 'atrium');
  }

  const t = performance.now() * 0.00045;
  twin.group.rotation.y = Math.PI / 2 + Math.sin(t) * 0.06;
  twin.halo.rotation.z += dt * 0.12;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
updateHud();
setRoomUi('atrium');
animate();

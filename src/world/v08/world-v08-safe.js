import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { TwinCore, SOURCE_CATALOG } from '../v04/twin-core.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const canvas = $('#world-canvas');
const core = new TwinCore();
const baseline = core.snapshots[0];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaeb3a7);
scene.fog = new THREE.Fog(0xaeb3a7, 76, 175);
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 320);
const clock = new THREE.Clock();

const C = {
  stone: 0xcdbda2,
  stone2: 0xab9d86,
  sage: 0x829582,
  sage2: 0xa9b9a5,
  sand: 0xdcc7a5,
  bronze: 0x78614c,
  water: 0x6e8580,
  rock: 0x77776c,
  green: 0xaac7a2,
  warn: 0xd0a76f,
  arena: 0xd7b678,
};

function material(color, roughness = 0.76, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
function glowMaterial(color, intensity = 0.8, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity === 1,
  });
}
function glassMaterial(color = C.sage2, opacity = 0.35) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.22,
    metalness: 0.03,
    transparent: true,
    opacity,
    transmission: 0.22,
  });
}
function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
function cylinder(r1, r2, h, segments, mat, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, segments), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
function roundedRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function makeLabel(text, options = {}) {
  const canvas2d = document.createElement('canvas');
  canvas2d.width = 720;
  canvas2d.height = 140;
  const ctx = canvas2d.getContext('2d');
  ctx.fillStyle = options.bg || 'rgba(18,25,20,.80)';
  roundedRect(ctx, 45, 20, 630, 100, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  ctx.stroke();
  ctx.font = `500 ${options.font || 24}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = options.color || '#f4efe5';
  ctx.fillText(text, 360, 70);
  const texture = new THREE.CanvasTexture(canvas2d);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(options.sx || 4, options.sy || 0.7, 1);
  return sprite;
}
function toast(text) {
  const node = $('#toast');
  node.textContent = text;
  node.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('show'), 1800);
}

scene.add(new THREE.HemisphereLight(0xfff5e6, 0x314235, 2.2));
const sun = new THREE.DirectionalLight(0xffe9cf, 3.2);
sun.position.set(-28, 46, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90;
sun.shadow.camera.bottom = -90;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc8d8ca, 1.1);
fill.position.set(32, 20, -28);
scene.add(fill);

// Settings
const defaults = {
  preset: 'wasd',
  bindings: { forward: 'w', backward: 's', left: 'a', right: 'd', sprint: 'shift', interact: 'e' },
  camera: { sensX: 1, sensY: 1, distance: 21, invertY: false },
};
const presetBindings = {
  wasd: { forward: 'w', backward: 's', left: 'a', right: 'd' },
  zqsd: { forward: 'z', backward: 's', left: 'q', right: 'd' },
  arrows: { forward: 'arrowup', backward: 'arrowdown', left: 'arrowleft', right: 'arrowright' },
};
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('komo_world_controls_v08') || 'null');
    if (!saved) return clone(defaults);
    return {
      ...clone(defaults),
      ...saved,
      bindings: { ...defaults.bindings, ...(saved.bindings || {}) },
      camera: { ...defaults.camera, ...(saved.camera || {}) },
    };
  } catch {
    return clone(defaults);
  }
}
let settings = loadSettings();
function saveSettings() {
  localStorage.setItem('komo_world_controls_v08', JSON.stringify(settings));
  renderSettings();
}
function renderSettings() {
  $$('[data-preset]').forEach((button) => button.classList.toggle('active', button.dataset.preset === settings.preset));
  $('#sens-x').value = settings.camera.sensX;
  $('#sens-y').value = settings.camera.sensY;
  $('#camera-distance').value = settings.camera.distance;
  $('#invert-y').checked = settings.camera.invertY;
}
$$('[data-preset]').forEach((button) => {
  button.addEventListener('click', () => {
    const preset = button.dataset.preset;
    settings.preset = preset;
    settings.bindings = { ...settings.bindings, ...presetBindings[preset] };
    saveSettings();
  });
});
['sens-x', 'sens-y', 'camera-distance'].forEach((id) => {
  $('#' + id).addEventListener('input', () => {
    settings.camera.sensX = Number($('#sens-x').value);
    settings.camera.sensY = Number($('#sens-y').value);
    settings.camera.distance = Number($('#camera-distance').value);
    saveSettings();
  });
});
$('#invert-y').addEventListener('change', () => {
  settings.camera.invertY = $('#invert-y').checked;
  saveSettings();
});
renderSettings();

// World / island
const water = new THREE.Mesh(
  new THREE.CircleGeometry(165, 192),
  new THREE.MeshPhysicalMaterial({ color: C.water, roughness: 0.22, transparent: true, opacity: 0.9, transmission: 0.05 })
);
water.rotation.x = -Math.PI / 2;
water.position.y = -1.35;
scene.add(water);
const island = cylinder(61, 65, 2.4, 160, material(0x505d4c, 0.98), 0, -1.22, 0);
scene.add(island);
const islandTop = new THREE.Mesh(new THREE.CircleGeometry(60.7, 160), material(0x748069, 0.97));
islandTop.rotation.x = -Math.PI / 2;
islandTop.position.y = -0.02;
scene.add(islandTop);
for (let i = 0; i < 64; i += 1) {
  const angle = (i / 64) * Math.PI * 2;
  const radius = 60.6 + Math.sin(i * 2.6) * 0.9;
  const size = 0.52 + (i % 5) * 0.12;
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size), material(i % 3 ? C.rock : 0x686e63, 0.94));
  rock.position.set(Math.cos(angle) * radius, -0.25, Math.sin(angle) * radius);
  rock.scale.set(1.5, 0.72, 1);
  scene.add(rock);
}
function addTree(x, z, scale = 0.82) {
  const group = new THREE.Group();
  group.add(cylinder(0.16 * scale, 0.23 * scale, 2.5 * scale, 9, material(0x64503e, 0.95), 0, 1.25 * scale, 0));
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35 * scale, 2), material(C.sage, 0.98));
  crown.scale.set(0.9, 1.34, 0.9);
  crown.position.y = 3.15 * scale;
  crown.castShadow = true;
  group.add(crown);
  group.position.set(x, 0, z);
  scene.add(group);
}
[
  [-16, 36], [16, 36], [-22, 25], [22, 25], [-31, 8], [31, 8],
  [-36, -13], [36, -13], [-26, -34], [26, -34], [-6, -49], [8, -50],
].forEach((coords, index) => addTree(coords[0], coords[1], 0.72 + (index % 4) * 0.08));
const plaza = cylinder(19, 19, 0.2, 100, material(C.stone, 0.91), 0, 0.06, 34);
scene.add(plaza);
scene.add(box(11, 0.14, 49, material(0xb8aa92, 0.93), 0, 0.07, 10));
const spawnRing = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.55, 72), new THREE.MeshBasicMaterial({ color: C.sand, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
spawnRing.rotation.x = -Math.PI / 2;
spawnRing.position.set(0, 0.16, 43);
scene.add(spawnRing);

// Hall
const hall = new THREE.Group();
hall.position.set(0, 0, -10);
scene.add(hall);
hall.add(box(48, 0.35, 32, material(0xb9ad96, 0.9), 0, 0.18, 0));
hall.add(box(0.55, 9.5, 32, material(0xb5a98f, 0.87), -23.7, 4.75, 0));
hall.add(box(0.55, 9.5, 32, material(0xb5a98f, 0.87), 23.7, 4.75, 0));
[[-18, 7], [-6, 5], [6, 5], [18, 7]].forEach(([x, w]) => hall.add(box(w, 9.5, 0.55, material(0xb5a98f, 0.87), x, 4.75, -15.7)));
for (let z = -10; z <= 10; z += 5) hall.add(box(49, 0.22, 0.34, material(C.bronze, 0.5, 0.38), 0, 9.3, z));
const roofGlass = new THREE.Mesh(new THREE.PlaneGeometry(47, 22), glassMaterial(C.sage2, 0.22));
roofGlass.rotation.x = Math.PI / 2;
roofGlass.position.y = 9.25;
hall.add(roofGlass);
const hallSign = makeLabel('THE KŌMØ HALL', { sx: 5.6, sy: 1, font: 31 });
hallSign.position.set(0, 8.2, 15.5);
hall.add(hallSign);
hall.add(box(9, 1.55, 1.7, material(0x6e6557, 0.54, 0.18), 0, 0.78, 5));
hall.add(box(9.4, 0.18, 2, material(0xd8c4a4, 0.65), 0, 1.62, 5));
const deskLabel = makeLabel('KŌMØ DESK', { sx: 2.7, sy: 0.58, font: 23 });
deskLabel.position.set(0, 3.25, 5);
hall.add(deskLabel);

function makeHumanoid({ body = 0x889784, skin = 0xbc8869, hologram = false, scale = 1 } = {}) {
  const group = new THREE.Group();
  const bodyMat = hologram
    ? new THREE.MeshPhysicalMaterial({ color: body, roughness: 0.22, transparent: true, opacity: 0.48, transmission: 0.16, emissive: 0x314b38, emissiveIntensity: 0.36 })
    : material(body, 0.7);
  const skinMat = hologram ? bodyMat : material(skin, 0.68);
  const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.48, 6, 14), bodyMat);
  pelvis.position.y = 2.05;
  group.add(pelvis);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.2, 8, 18), bodyMat);
  torso.position.y = 3.05;
  torso.scale.set(1, 0.92, 0.75);
  group.add(torso);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.59, 22, 16), bodyMat);
  chest.scale.set(1, 0.7, 0.72);
  chest.position.y = 3.5;
  group.add(chest);
  group.add(cylinder(0.16, 0.18, 0.28, 12, skinMat, 0, 4.05, 0));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 18), skinMat);
  head.position.y = 4.45;
  head.scale.set(0.9, 1.08, 0.88);
  group.add(head);
  const limbs = {};
  [['la', -0.7], ['ra', 0.7]].forEach(([name, x]) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 3.55, 0);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.72, 5, 10), skinMat);
    upper.position.y = -0.43;
    pivot.add(upper);
    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.68, 5, 10), skinMat);
    forearm.position.y = -1.13;
    pivot.add(forearm);
    group.add(pivot);
    limbs[name] = pivot;
  });
  [['ll', -0.29], ['rl', 0.29]].forEach(([name, x]) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 2, 0);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.78, 6, 12), bodyMat);
    thigh.position.y = -0.5;
    pivot.add(thigh);
    const calf = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.78, 6, 12), bodyMat);
    calf.position.y = -1.42;
    pivot.add(calf);
    group.add(pivot);
    limbs[name] = pivot;
  });
  group.userData.limbs = limbs;
  group.scale.setScalar(scale);
  return group;
}
const concierge = makeHumanoid({ body: 0x716f62, scale: 0.9 });
concierge.position.set(0, 0.05, -6.2);
concierge.rotation.y = Math.PI;
scene.add(concierge);
const conciergeLabel = makeLabel('KŌMØ CONCIERGE', { sx: 2.5, sy: 0.52, font: 20 });
conciergeLabel.position.set(0, 4.9, -6.2);
scene.add(conciergeLabel);

function addDoorway(name, x, z, color, rotation = 0, sx = 2.55) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  scene.add(group);
  const frame = material(color, 0.54, 0.15);
  group.add(box(0.3, 5, 0.4, frame, -1.7, 2.5, 0));
  group.add(box(0.3, 5, 0.4, frame, 1.7, 2.5, 0));
  group.add(box(3.7, 0.3, 0.4, frame, 0, 4.86, 0));
  const sign = makeLabel(name, { sx, sy: 0.58, font: 21 });
  sign.position.y = 5.55;
  group.add(sign);
}
addDoorway('01 · TWIN LAB', -11, -25.55, C.sand);
addDoorway('02 · REHAB', 11, -25.55, C.sage2);
addDoorway('03 · LIBRARY', -23.45, -11.5, C.sage, Math.PI / 2);
addDoorway('04 · AMPHITHEATRE', 23.45, -12.5, C.stone2, -Math.PI / 2);
addDoorway('05 · STORE', 23.45, -4, C.bronze, -Math.PI / 2);

// Monumental Arena gate
const arenaGate = new THREE.Group();
arenaGate.position.set(23.2, 0, -7.2);
arenaGate.rotation.y = -Math.PI / 2;
scene.add(arenaGate);
const arenaFrame = material(C.arena, 0.38, 0.32);
arenaGate.add(box(0.6, 7.6, 0.8, arenaFrame, -3.4, 3.8, 0));
arenaGate.add(box(0.6, 7.6, 0.8, arenaFrame, 3.4, 3.8, 0));
arenaGate.add(box(7.4, 0.65, 0.8, arenaFrame, 0, 7.2, 0));
const arenaArch = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.12, 12, 80, Math.PI), glowMaterial(C.arena, 1.1));
arenaArch.rotation.z = Math.PI;
arenaArch.position.y = 3.85;
arenaGate.add(arenaArch);
const gateGlow = new THREE.PointLight(0xf0c77f, 28, 20, 2);
gateGlow.position.set(0, 4, 1);
arenaGate.add(gateGlow);
const arenaSign = makeLabel('KŌMØ ARENA', { sx: 4.1, sy: 0.8, font: 27, bg: 'rgba(35,25,14,.84)', color: '#f3d9a6' });
arenaSign.position.set(0, 8.45, 0);
arenaGate.add(arenaSign);
const dailySign = makeLabel('DAILY · BALANCE HOLD', { sx: 3.25, sy: 0.5, font: 18, bg: 'rgba(35,25,14,.76)', color: '#e8cf9f' });
dailySign.position.set(0, 6.35, 0.2);
arenaGate.add(dailySign);

// Twin Lab
const twinLab = new THREE.Group();
twinLab.position.set(-11, 0, -34);
scene.add(twinLab);
const twinFloor = new THREE.Mesh(new THREE.CircleGeometry(11.2, 80), material(0x242e27, 0.88));
twinFloor.rotation.x = -Math.PI / 2;
twinFloor.position.y = 0.04;
twinLab.add(twinFloor);
const twinRing = new THREE.Mesh(new THREE.RingGeometry(4.1, 4.42, 96), new THREE.MeshBasicMaterial({ color: C.sand, transparent: true, opacity: 0.48, side: THREE.DoubleSide }));
twinRing.rotation.x = -Math.PI / 2;
twinRing.position.y = 0.08;
twinLab.add(twinRing);
const twin = makeHumanoid({ body: C.sage2, hologram: true, scale: 1.12 });
twin.position.y = 0.12;
twinLab.add(twin);
const twinTitle = makeLabel('FUNCTIONAL DIGITAL TWIN', { sx: 4.3, sy: 0.76, font: 25 });
twinTitle.position.set(0, 6.6, 0);
twinLab.add(twinTitle);
const bodyAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 5.2, 8), new THREE.MeshBasicMaterial({ color: C.sand, transparent: true, opacity: 0.45 }));
bodyAxis.position.y = 2.55;
twinLab.add(bodyAxis);
const leftQuadGlow = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.68, 8, 14), glowMaterial(C.warn, 1.5, 0.46));
leftQuadGlow.position.set(-0.33, 1.35, 0.03);
twinLab.add(leftQuadGlow);
const rightQuadGlow = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.68, 8, 14), glowMaterial(C.green, 0.6, 0.18));
rightQuadGlow.position.set(0.33, 1.35, 0.03);
twinLab.add(rightQuadGlow);
const postureLine = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.018, 8, 64, Math.PI), new THREE.MeshBasicMaterial({ color: C.sage2, transparent: true, opacity: 0.42 }));
postureLine.rotation.z = Math.PI / 2;
postureLine.position.set(0.95, 3.05, 0);
twinLab.add(postureLine);
const haloA = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.024, 8, 96), new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: 0.46 }));
haloA.position.y = 2.8;
haloA.rotation.x = Math.PI / 2;
twinLab.add(haloA);
const haloB = haloA.clone();
haloB.rotation.set(0, Math.PI / 2, 0);
twinLab.add(haloB);
const bodyRegions = { left_thigh: leftQuadGlow, trunk: postureLine, strength: rightQuadGlow, gait: haloA };
const baselineGhost = makeHumanoid({ body: C.sand, hologram: true, scale: 0.9 });
baselineGhost.position.set(-4.2, 0.12, 0);
baselineGhost.visible = false;
twinLab.add(baselineGhost);
const todayGhost = makeHumanoid({ body: C.sage2, hologram: true, scale: 0.9 });
todayGhost.position.set(4.2, 0.12, 0);
todayGhost.visible = false;
twinLab.add(todayGhost);
const sourceVisuals = new Map();
SOURCE_CATALOG.forEach((source, index) => {
  const angle = (index / SOURCE_CATALOG.length) * Math.PI * 2;
  const group = new THREE.Group();
  group.position.set(Math.cos(angle) * 8, 1.1, Math.sin(angle) * 8);
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 2), glowMaterial(index % 2 ? C.sand : C.sage2, 0.35));
  group.add(orb);
  const sourceLabel = makeLabel(source.label, { sx: 1.95, sy: 0.4, font: 17 });
  sourceLabel.position.y = 0.72;
  group.add(sourceLabel);
  twinLab.add(group);
  sourceVisuals.set(source.id, { group, orb, phase: angle, baseY: group.position.y });
});

// Arena room
const arenaRoom = new THREE.Group();
arenaRoom.position.set(38, 0, -7);
scene.add(arenaRoom);
const arenaFloor = new THREE.Mesh(new THREE.CircleGeometry(15.5, 96), material(0x292319, 0.84, 0.08));
arenaFloor.rotation.x = -Math.PI / 2;
arenaFloor.position.y = 0.03;
arenaRoom.add(arenaFloor);
const arenaRing = new THREE.Mesh(new THREE.RingGeometry(11.8, 12.15, 96), new THREE.MeshBasicMaterial({ color: C.arena, transparent: true, opacity: 0.38, side: THREE.DoubleSide }));
arenaRing.rotation.x = -Math.PI / 2;
arenaRing.position.y = 0.07;
arenaRoom.add(arenaRing);
arenaRoom.add(cylinder(3.2, 3.6, 0.6, 64, material(0x5f4a2f, 0.46, 0.22), 0, 0.3, 1));
arenaRoom.add(cylinder(2.2, 2.4, 0.18, 64, material(0xd6bb88, 0.52, 0.14), 0, 0.1, -2.5));
const arenaRoomTitle = makeLabel('KŌMØ ARENA · SEASON 01', { sx: 5.2, sy: 0.8, font: 26, bg: 'rgba(35,25,14,.84)', color: '#f3d9a6' });
arenaRoomTitle.position.set(0, 7.2, -5);
arenaRoom.add(arenaRoomTitle);
for (let i = 0; i < 3; i += 1) {
  const height = 2.1 - i * 0.38;
  const podium = box(2.1, height, 2.1, material(i === 0 ? 0xb7955a : i === 1 ? 0x8a8176 : 0x775b45, 0.5, 0.2), (i - 1) * 2.8, height / 2, 3.8);
  arenaRoom.add(podium);
}
arenaRoom.add(box(8, 4.7, 0.3, material(0x191712, 0.38, 0.2), 0, 4.1, 7.2));
const arenaRoomLight = new THREE.PointLight(0xf0c77f, 20, 16, 2);
arenaRoomLight.position.set(0, 4, 4);
arenaRoom.add(arenaRoomLight);

// Player
let avatar = {};
try { avatar = JSON.parse(localStorage.getItem('komo_world_avatar_v02') || '{}'); } catch { avatar = {}; }
const player = makeHumanoid({
  body: avatar.outfit === 'sand' ? 0xcdb995 : 0x879783,
  skin: avatar.skin === 'brown' ? 0x79503b : avatar.skin === 'deep' ? 0x4f332a : avatar.skin === 'light' ? 0xe3c0a8 : 0xbc8869,
  scale: 0.94,
});
player.position.set(0, 0, 43);
player.rotation.y = Math.PI;
scene.add(player);

// Interactions
let labMode = false;
let arenaMode = false;
let quest = 0;
let currentInteraction = null;
const interactions = [];
function addInteraction(id, x, z, radius, title, copy, action) {
  interactions.push({ id, x, z, radius, title, copy, action });
}
function openPanel(kicker, title, copy) {
  $('#panel-kicker').textContent = kicker;
  $('#panel-title').textContent = title;
  $('#panel-body').innerHTML = `<p>${copy}</p>`;
  $('#panel').classList.add('open');
}
function openDesk() {
  if (quest === 0) {
    quest = 1;
    $('#quest-copy').textContent = '02 · Inspect your Functional Digital Twin';
  }
  const snapshot = core.current();
  openPanel('KŌMØ CONCIERGE', 'Your next move.', `Motion Score ${snapshot.motion_score}. Motion Age ${snapshot.motion_age}. Your current private priority is the left quadriceps. Inspect the Twin, then try today’s Arena challenge.`);
}
function enterTwinLab() {
  labMode = true;
  arenaMode = false;
  player.position.set(-11, 0, -27.2);
  yaw = Math.PI;
  $('#panel').classList.remove('open');
  $('#twin-hud').classList.add('open');
  $('#arena-hud').classList.remove('open');
  $('#location-name').textContent = 'FUNCTIONAL DIGITAL TWIN LAB';
  quest = Math.max(quest, 2);
  $('#quest-copy').textContent = '03 · Explore the Twin, then enter KŌMØ Arena';
  toast('Twin Lab · truth layer');
}
function leaveTwinLab() {
  labMode = false;
  player.position.set(-8.5, 0, -22.5);
  $('#twin-hud').classList.remove('open');
  $('#location-name').textContent = 'KŌMŌ HALL · ATRIUM';
  selectTwinView('overview');
}
function enterArena() {
  arenaMode = true;
  labMode = false;
  player.position.set(38, 0, -2.5);
  yaw = Math.PI;
  $('#panel').classList.remove('open');
  $('#twin-hud').classList.remove('open');
  $('#arena-hud').classList.add('open');
  $('#location-name').textContent = 'KŌMŌ ARENA · SEASON 01';
  quest = Math.max(quest, 3);
  $('#quest-copy').textContent = '04 · Complete today’s Balance Hold';
  renderArena();
  toast('KŌMØ Arena · Daily Challenge');
}
function leaveArena() {
  arenaMode = false;
  player.position.set(20.5, 0, -7.2);
  $('#arena-hud').classList.remove('open');
  $('#location-name').textContent = 'KŌMŌ HALL · ATRIUM';
}
addInteraction('desk', 0, -2, 4.4, 'Talk to KŌMØ Concierge', 'Orientation · Twin · Arena', openDesk);
addInteraction('twinDoor', -11, -24.8, 3.7, 'Enter Twin Lab', 'Your body across time', enterTwinLab);
addInteraction('arenaGate', 22.2, -7.2, 5.2, 'Enter KŌMØ Arena', 'Daily Challenge · leaderboard', enterArena);
addInteraction('rehab', 11, -24.8, 3.6, 'Enter Rehab', 'Coach Agent · next build', () => openPanel('REHAB', 'Coach Agent wing', 'Reserved for deficit-driven sessions connected to your Functional Digital Twin.'));
addInteraction('library', -22, -11.5, 3.8, 'Enter Library', 'Knowledge · planned', () => openPanel('LIBRARY', 'Knowledge space', 'Scientific collections, expert content and the future Librarian Agent.'));
addInteraction('twinCore', -11, -34, 6, 'Inspect Twin', 'Body · timeline · provenance', () => selectTwinView('body'));
addInteraction('arenaStation', 38, -9.5, 5, 'Start Daily Challenge', 'Balance Hold · 60 seconds', startChallenge);

function nearestInteraction() {
  if (labMode) {
    const item = interactions.find((entry) => entry.id === 'twinCore');
    return Math.hypot(player.position.x - item.x, player.position.z - item.z) < item.radius ? item : null;
  }
  if (arenaMode) {
    const item = interactions.find((entry) => entry.id === 'arenaStation');
    return Math.hypot(player.position.x - item.x, player.position.z - item.z) < item.radius ? item : null;
  }
  let best = null;
  let bestDistance = Infinity;
  interactions.forEach((entry) => {
    if (entry.id === 'twinCore' || entry.id === 'arenaStation') return;
    const distance = Math.hypot(player.position.x - entry.x, player.position.z - entry.z);
    if (distance < entry.radius && distance < bestDistance) {
      best = entry;
      bestDistance = distance;
    }
  });
  return best;
}
function refreshInteraction() {
  currentInteraction = nearestInteraction();
  const prompt = $('#interaction');
  if (!currentInteraction) {
    prompt.classList.remove('show');
    $('#mobile-action').textContent = 'ACTION';
    return;
  }
  $('#interaction-key').textContent = settings.bindings.interact.toUpperCase();
  $('#interaction-title').textContent = currentInteraction.title;
  $('#interaction-copy').textContent = currentInteraction.copy;
  prompt.classList.add('show');
  $('#mobile-action').textContent = currentInteraction.id === 'desk' ? 'TALK' : currentInteraction.id === 'arenaStation' ? 'START' : 'ENTER';
}
function runInteraction() { if (currentInteraction) currentInteraction.action(); }
$('#panel-close').addEventListener('click', () => $('#panel').classList.remove('open'));
$('#twin-exit').addEventListener('click', leaveTwinLab);
$('#go-arena').addEventListener('click', () => { leaveTwinLab(); toast('Arena · right wing'); });
$('#arena-exit').addEventListener('click', leaveArena);

// Twin data UI
function signed(value, digits = 0, suffix = '') {
  const numeric = Number(value);
  return `${numeric > 0 ? '+' : ''}${numeric.toFixed(digits)}${suffix}`;
}
function formatDate(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();
}
const domainList = [['muscle', 'Muscle'], ['mobility', 'Mobility'], ['balance', 'Balance'], ['posture', 'Posture'], ['endurance', 'Endurance']];
function priorityFor(snapshot) {
  const symmetry = snapshot.metrics.quadriceps_symmetry;
  const intensity = snapshot.overlays && snapshot.overlays.left_thigh ? snapshot.overlays.left_thigh.intensity : 0;
  if (symmetry < 80 || intensity > 0.45) return { state: 'ATTENTION', copy: 'Activation asymmetry remains the main modifiable limitation.' };
  if (symmetry < 90 || intensity > 0.2) return { state: 'WATCH', copy: 'Residual asymmetry persists, with clear longitudinal improvement.' };
  return { state: 'STABLE', copy: 'No major asymmetry is highlighted in the current snapshot.' };
}
function renderTwin(index) {
  core.setTimeIndex(index, 'v08-ui');
  const snapshot = core.current();
  const comparison = core.compare(baseline.snapshot_id, snapshot.snapshot_id, 'v08-ui');
  const priority = priorityFor(snapshot);
  $('#hud-motion').textContent = snapshot.motion_score;
  $('#twin-snapshot').textContent = snapshot.label.toUpperCase();
  $('#twin-date').textContent = formatDate(snapshot.captured_at);
  $('#twin-score-large').textContent = snapshot.motion_score;
  $('#twin-age-large').textContent = snapshot.motion_age;
  $('#twin-score-delta').textContent = `${signed(comparison.motion_score_delta)} since baseline`;
  $('#twin-age-delta').textContent = `${signed(comparison.motion_age_delta)} years`;
  $('#priority-state').textContent = priority.state;
  $('#priority-copy').textContent = priority.copy;
  $('#priority-value').textContent = `${snapshot.metrics.quadriceps_symmetry}%`;
  $('#priority-delta').textContent = `${signed(snapshot.metrics.quadriceps_symmetry - baseline.metrics.quadriceps_symmetry)} pts`;
  $('#callout-quad').textContent = `${snapshot.metrics.quadriceps_symmetry}%`;
  $('#callout-gait').textContent = snapshot.metrics.gait_speed.toFixed(2);
  $('#callout-posture').textContent = snapshot.metrics.posture_index;
  $('#callout-strength').textContent = snapshot.metrics.strength_index;
  $('#timeline-current-label').textContent = snapshot.label.toUpperCase();
  $('#domain-bars').innerHTML = domainList.map(([id, labelText]) => {
    const value = snapshot.domains[id] || 0;
    const delta = value - (baseline.domains[id] || value);
    return `<div class="domain-row"><span>${labelText}</span><div class="domain-track"><div class="domain-fill" style="width:${value}%"></div></div><div class="domain-value"><b>${value}</b><small>${signed(delta)}</small></div></div>`;
  }).join('');
  const signals = [
    ['Gait speed', `${snapshot.metrics.gait_speed.toFixed(2)} m/s`, signed(snapshot.metrics.gait_speed - baseline.metrics.gait_speed, 2, ' m/s')],
    ['Strength', `${snapshot.metrics.strength_index}/100`, signed(snapshot.metrics.strength_index - baseline.metrics.strength_index)],
    ['Sleep', `${Math.floor(snapshot.metrics.sleep_minutes / 60)}h ${String(snapshot.metrics.sleep_minutes % 60).padStart(2, '0')}`, signed(snapshot.metrics.sleep_minutes - baseline.metrics.sleep_minutes, 0, ' min')],
    ['Activity', `${snapshot.metrics.steps.toLocaleString()} steps`, signed(snapshot.metrics.steps - baseline.metrics.steps)],
    ['Rehab', `${snapshot.metrics.rehab_adherence}%`, signed(snapshot.metrics.rehab_adherence - baseline.metrics.rehab_adherence, 0, ' pts')],
    ['Quad symmetry', `${snapshot.metrics.quadriceps_symmetry}%`, signed(snapshot.metrics.quadriceps_symmetry - baseline.metrics.quadriceps_symmetry, 0, ' pts')],
  ];
  $('#key-signals').innerHTML = signals.map(([labelText, value, delta]) => `<div class="signal-card"><span>${labelText}</span><b>${value}</b><small>${delta}</small></div>`).join('');
  const comparisonCards = [
    ['Motion Score', baseline.motion_score, snapshot.motion_score, signed(comparison.motion_score_delta)],
    ['Motion Age', baseline.motion_age, snapshot.motion_age, signed(comparison.motion_age_delta, 0, ' yr')],
    ['Quad symmetry', baseline.metrics.quadriceps_symmetry, snapshot.metrics.quadriceps_symmetry, signed(comparison.metric_delta.quadriceps_symmetry, 0, ' pts')],
    ['Gait speed', baseline.metrics.gait_speed.toFixed(2), snapshot.metrics.gait_speed.toFixed(2), signed(comparison.metric_delta.gait_speed, 2, ' m/s')],
    ['Strength', baseline.metrics.strength_index, snapshot.metrics.strength_index, signed(comparison.metric_delta.strength_index)],
    ['Posture', baseline.metrics.posture_index, snapshot.metrics.posture_index, signed(comparison.metric_delta.posture_index)],
  ];
  $('#compare-grid').innerHTML = comparisonCards.map(([labelText, from, to, delta]) => `<div class="compare-card"><span>${labelText}</span><b>${from} → ${to}</b><small>${delta}</small></div>`).join('');
  $$('[data-time]').forEach((button) => button.classList.toggle('active', Number(button.dataset.time) === index));
  const intensity = snapshot.overlays && snapshot.overlays.left_thigh ? snapshot.overlays.left_thigh.intensity : 0.3;
  leftQuadGlow.material.opacity = 0.18 + intensity * 0.55;
  leftQuadGlow.material.emissiveIntensity = 0.45 + intensity * 2.2;
}
function selectTwinView(view) {
  $('#twin-hud').dataset.view = view;
  $$('[data-twin-view]').forEach((button) => button.classList.toggle('active', button.dataset.twinView === view));
  $('#compare-layer').classList.toggle('open', view === 'compare');
  $('#source-inspector').classList.toggle('open', view === 'sources');
  const comparing = view === 'compare';
  baselineGhost.visible = comparing;
  todayGhost.visible = comparing;
  twin.visible = !comparing;
}
$$('[data-twin-view]').forEach((button) => button.addEventListener('click', () => selectTwinView(button.dataset.twinView)));
$$('[data-time]').forEach((button) => button.addEventListener('click', () => renderTwin(Number(button.dataset.time))));
$('#compare-now').addEventListener('click', () => selectTwinView('compare'));
$('#compare-close').addEventListener('click', () => selectTwinView('overview'));
$('#source-close').addEventListener('click', () => selectTwinView('overview'));
$('#twin-sources').innerHTML = SOURCE_CATALOG.map((source) => `<button data-source="${source.id}">${source.label}</button>`).join('');
$$('[data-source]').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.source;
    const snapshot = core.current();
    const meta = snapshot.sources[id] || {};
    const source = SOURCE_CATALOG.find((item) => item.id === id);
    $$('[data-source]').forEach((node) => node.classList.toggle('active', node.dataset.source === id));
    sourceVisuals.forEach((visual, key) => {
      visual.orb.material.emissiveIntensity = key === id ? 1.8 : 0.35;
      visual.orb.scale.setScalar(key === id ? 1.4 : 1);
    });
    $('#source-title').textContent = source.label;
    $('#source-content').innerHTML = `<div class="source-meta"><div><span>Snapshot</span><b>${snapshot.label}</b></div><div><span>Status</span><b>${meta.status || 'available'}</b></div><div><span>Quality</span><b>${meta.quality ? Math.round(meta.quality * 100) + '%' : '—'}</b></div><div><span>Method</span><b>${meta.method || '—'}</b></div><div><span>Version</span><b>${snapshot.provenance_version}</b></div><div><span>Layer</span><b>${source.group}</b></div></div><p class="source-note">The AI layer may explain this dated value but cannot silently rewrite the underlying measurement.</p>`;
    selectTwinView('sources');
  });
});
$$('[data-region]').forEach((button) => {
  button.addEventListener('click', () => {
    selectTwinView('body');
    const activeRegion = button.dataset.region;
    Object.entries(bodyRegions).forEach(([key, object]) => {
      const active = key === activeRegion;
      if ('opacity' in object.material) object.material.opacity = active ? 0.66 : (key === 'trunk' ? 0.28 : 0.14);
      if ('emissiveIntensity' in object.material) object.material.emissiveIntensity = active ? 2 : 0.5;
    });
    toast(`${button.querySelector('span').textContent} · body focus`);
  });
});
renderTwin(2);
selectTwinView('overview');

// Arena persistence and leaderboard
const baseLeaders = [
  { name: 'Maya', club: 'Riviera Club', score: 948 },
  { name: 'Noah', club: 'Performance', score: 921 },
  { name: 'Léa', club: 'Running Club', score: 904 },
  { name: 'Alex', club: 'KŌMØ Core', score: 881 },
  { name: 'Sofia', club: 'Riviera Club', score: 856 },
  { name: 'Hugo', club: 'Performance', score: 834 },
];
function loadArenaData() {
  try {
    return JSON.parse(localStorage.getItem('komo_arena_v08') || 'null') || { points: 2480, xp: 0, best: null, streak: 0, lastDay: null };
  } catch {
    return { points: 2480, xp: 0, best: null, streak: 0, lastDay: null };
  }
}
let arenaData = loadArenaData();
function saveArenaData() {
  localStorage.setItem('komo_arena_v08', JSON.stringify(arenaData));
  $('#hud-points').textContent = arenaData.points.toLocaleString();
}
function leaderboardData() {
  const list = baseLeaders.map((entry) => ({ ...entry }));
  if (arenaData.best !== null) list.push({ name: 'You', club: 'KŌMØ Core', score: arenaData.best, me: true });
  return list.sort((a, b) => b.score - a.score).map((entry, index) => ({ ...entry, rank: index + 1 }));
}
function renderArena() {
  const rows = leaderboardData();
  $('#leaderboard').innerHTML = rows.map((row) => `<div class="leader-row ${row.me ? 'me' : ''}"><div class="leader-rank">${String(row.rank).padStart(2, '0')}</div><div class="leader-name"><b>${row.name}</b><span>${row.club}</span></div><div class="leader-score"><b>${row.score}</b><span>pts</span></div></div>`).join('');
  const me = rows.find((row) => row.me);
  $('#your-best').textContent = arenaData.best === null ? '—' : arenaData.best;
  $('#your-rank').textContent = me ? `Rank #${me.rank}` : 'Unranked';
  $('#arena-streak').textContent = `${arenaData.streak} day${arenaData.streak === 1 ? '' : 's'}`;
  $('#arena-xp').textContent = arenaData.xp;
  $('#hud-points').textContent = arenaData.points.toLocaleString();
}
renderArena();

// Daily Balance Hold challenge
const keys = new Set();
const joy = { x: 0, y: 0, pointer: null };
let challengeRunning = false;
let challengeStart = 0;
let challengeLast = 0;
let markerX = 0;
let markerVelocity = 0;
let correctionsCount = 0;
let stabilityAccumulator = 0;
let challengeFrames = 0;
let lastInputSign = 0;
function challengeInput() {
  let value = 0;
  if (keys.has(settings.bindings.left)) value -= 1;
  if (keys.has(settings.bindings.right)) value += 1;
  if (Math.abs(joy.x) > 0.08) value += joy.x;
  return THREE.MathUtils.clamp(value, -1, 1);
}
function startChallenge() {
  if (challengeRunning) return;
  challengeRunning = true;
  $('#arena-hud').classList.remove('open');
  $('#challenge').classList.add('open');
  $('#result').classList.remove('open');
  challengeStart = performance.now();
  challengeLast = challengeStart;
  markerX = 0;
  markerVelocity = 0;
  correctionsCount = 0;
  stabilityAccumulator = 0;
  challengeFrames = 0;
  lastInputSign = 0;
  toast('3 · 2 · 1 · GO');
}
function finishChallenge(cancelled = false) {
  if (!challengeRunning) return;
  challengeRunning = false;
  const elapsed = Math.min(60, (performance.now() - challengeStart) / 1000);
  const stability = challengeFrames ? stabilityAccumulator / challengeFrames : 0;
  const score = cancelled ? Math.round(elapsed * 8 * stability) : Math.max(0, Math.round(elapsed * 10 * stability + stability * 400 - Math.min(correctionsCount, 20) * 3));
  const previousBest = arenaData.best;
  const newBest = previousBest === null || score > previousBest;
  if (!cancelled) {
    arenaData.best = Math.max(previousBest || 0, score);
    arenaData.points += 85;
    arenaData.xp += 40;
    const today = new Date().toISOString().slice(0, 10);
    if (arenaData.lastDay !== today) {
      arenaData.streak += 1;
      arenaData.lastDay = today;
    }
    saveArenaData();
  }
  $('#challenge').classList.remove('open');
  $('#result-title').textContent = cancelled ? 'Challenge ended.' : newBest ? 'New personal best.' : 'Challenge complete.';
  $('#result-score').textContent = score;
  $('#result-time').textContent = `${elapsed.toFixed(1)}s`;
  $('#result-stability').textContent = `${Math.round(stability * 100)}%`;
  $('#result-points').textContent = cancelled ? '+0' : '+85';
  renderArena();
  const me = leaderboardData().find((row) => row.me);
  $('#result-rank').textContent = me ? `#${me.rank}` : '—';
  $('#result').classList.add('open');
}
function updateChallenge(now) {
  if (!challengeRunning) return;
  const dt = Math.min((now - challengeLast) / 1000, 0.05);
  challengeLast = now;
  const elapsed = (now - challengeStart) / 1000;
  const remaining = Math.max(0, 60 - elapsed);
  const input = challengeInput();
  const drift = Math.sin(now * 0.0013) * 0.17 + Math.sin(now * 0.0029 + 1.2) * 0.08;
  markerVelocity += drift * dt + input * 0.95 * dt;
  markerVelocity *= Math.pow(0.36, dt);
  markerX += markerVelocity * dt;
  markerX = THREE.MathUtils.clamp(markerX, -1.15, 1.15);
  const inputSign = Math.sign(input);
  if (inputSign !== 0 && lastInputSign !== 0 && inputSign !== lastInputSign) correctionsCount += 1;
  if (inputSign !== 0) lastInputSign = inputSign;
  const stability = Math.max(0, 1 - Math.abs(markerX) / 1.15);
  stabilityAccumulator += stability;
  challengeFrames += 1;
  const liveScore = Math.max(0, Math.round(elapsed * 10 * stability + (stabilityAccumulator / challengeFrames) * 400));
  $('#balance-marker').style.left = `${50 + markerX * 39}%`;
  $('#challenge-time').textContent = remaining.toFixed(1);
  $('#stability-score').textContent = Math.round(stability * 100);
  $('#corrections').textContent = correctionsCount;
  $('#live-score').textContent = liveScore;
  if (remaining <= 0 || Math.abs(markerX) >= 1.14) finishChallenge(false);
}
$('#challenge-start').addEventListener('click', startChallenge);
$('#challenge-cancel').addEventListener('click', () => finishChallenge(true));
$('#result-close').addEventListener('click', () => {
  $('#result').classList.remove('open');
  $('#arena-hud').classList.add('open');
});

// Input and camera. V0.8 keeps the camera direction requested by the user: drag right => camera turns right; drag down => camera tilts down.
let yaw = 0;
let pitch = 0.11;
let mouseDragging = false;
let lastMouse = { x: 0, y: 0 };
function normalizeKey(event) { return event.key === ' ' ? ' ' : event.key.toLowerCase(); }
window.addEventListener('keydown', (event) => {
  const key = normalizeKey(event);
  keys.add(key);
  if (!challengeRunning && key === settings.bindings.interact) {
    event.preventDefault();
    runInteraction();
  }
  if (key === 'escape') $('#settings').classList.toggle('open');
});
window.addEventListener('keyup', (event) => keys.delete(normalizeKey(event)));
canvas.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') return;
  mouseDragging = true;
  lastMouse = { x: event.clientX, y: event.clientY };
  canvas.setPointerCapture?.(event.pointerId);
});
canvas.addEventListener('pointerup', () => { mouseDragging = false; });
canvas.addEventListener('pointercancel', () => { mouseDragging = false; });
canvas.addEventListener('pointermove', (event) => {
  if (!mouseDragging) return;
  const dx = event.clientX - lastMouse.x;
  const dy = event.clientY - lastMouse.y;
  yaw += dx * 0.0034 * settings.camera.sensX;
  const sign = settings.camera.invertY ? -1 : 1;
  pitch = THREE.MathUtils.clamp(pitch + sign * dy * 0.0022 * settings.camera.sensY, -0.12, 0.48);
  lastMouse = { x: event.clientX, y: event.clientY };
});
const joyZone = $('#joystick-zone');
const joyKnob = $('#joystick-knob');
function updateJoy(event) {
  const rect = joyZone.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const max = 42;
  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;
  const length = Math.hypot(dx, dy);
  if (length > max) {
    dx = (dx / length) * max;
    dy = (dy / length) * max;
  }
  joy.x = dx / max;
  joy.y = dy / max;
  joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}
joyZone.addEventListener('pointerdown', (event) => {
  joy.pointer = event.pointerId;
  joyZone.setPointerCapture?.(event.pointerId);
  updateJoy(event);
});
joyZone.addEventListener('pointermove', (event) => { if (event.pointerId === joy.pointer) updateJoy(event); });
function resetJoy(event) {
  if (joy.pointer !== null && event.pointerId !== joy.pointer) return;
  joy.pointer = null;
  joy.x = 0;
  joy.y = 0;
  joyKnob.style.transform = 'translate(-50%, -50%)';
}
joyZone.addEventListener('pointerup', resetJoy);
joyZone.addEventListener('pointercancel', resetJoy);
const lookZone = $('#look-zone');
let lookPointer = null;
let lookLast = null;
lookZone.addEventListener('pointerdown', (event) => {
  lookPointer = event.pointerId;
  lookLast = { x: event.clientX, y: event.clientY };
  lookZone.setPointerCapture?.(event.pointerId);
});
lookZone.addEventListener('pointermove', (event) => {
  if (event.pointerId !== lookPointer || !lookLast || challengeRunning) return;
  const dx = event.clientX - lookLast.x;
  const dy = event.clientY - lookLast.y;
  yaw += dx * 0.0041 * settings.camera.sensX;
  const sign = settings.camera.invertY ? -1 : 1;
  pitch = THREE.MathUtils.clamp(pitch + sign * dy * 0.0028 * settings.camera.sensY, -0.12, 0.48);
  lookLast = { x: event.clientX, y: event.clientY };
});
function resetLook(event) {
  if (event.pointerId !== lookPointer) return;
  lookPointer = null;
  lookLast = null;
}
lookZone.addEventListener('pointerup', resetLook);
lookZone.addEventListener('pointercancel', resetLook);
$('#mobile-action').addEventListener('click', () => { if (!challengeRunning) runInteraction(); });
$('#settings-open').addEventListener('click', () => $('#settings').classList.add('open'));
$('#settings-close').addEventListener('click', () => $('#settings').classList.remove('open'));
$('#intro-enter').addEventListener('click', () => $('#intro').classList.add('hidden'));

function zoneName() {
  if (labMode) return 'FUNCTIONAL DIGITAL TWIN LAB';
  if (arenaMode) return 'KŌMŌ ARENA · SEASON 01';
  if (player.position.z > 23) return 'ARRIVAL PLAZA';
  if (player.position.x > 28) return 'ARENA DISTRICT';
  if (player.position.z < -22) return 'KŌMŌ HALL · INNER WING';
  return 'KŌMŌ HALL · ATRIUM';
}
const desiredCamera = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
function updateMovement(dt) {
  if (challengeRunning) return;
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const movement = new THREE.Vector3();
  if (keys.has(settings.bindings.forward)) movement.add(forward);
  if (keys.has(settings.bindings.backward)) movement.sub(forward);
  if (keys.has(settings.bindings.left)) movement.sub(right);
  if (keys.has(settings.bindings.right)) movement.add(right);
  if (Math.abs(joy.x) > 0.04 || Math.abs(joy.y) > 0.04) {
    movement.addScaledVector(right, joy.x);
    movement.addScaledVector(forward, -joy.y);
  }
  const moving = movement.lengthSq() > 0.002;
  const speed = keys.has(settings.bindings.sprint) ? 7.2 : 4.4;
  if (moving) {
    movement.normalize();
    player.position.addScaledVector(movement, speed * dt);
    player.rotation.y = Math.atan2(movement.x, movement.z);
  }
  if (labMode) {
    player.position.x = THREE.MathUtils.clamp(player.position.x, -20, -2);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -43, -26);
  } else if (arenaMode) {
    player.position.x = THREE.MathUtils.clamp(player.position.x, 25, 52);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -21, 7);
  } else {
    const radius = Math.hypot(player.position.x, player.position.z);
    if (radius > 58) {
      player.position.x *= 58 / radius;
      player.position.z *= 58 / radius;
    }
  }
  const animationTime = performance.now() * 0.012;
  const swing = moving ? Math.sin(animationTime) * 0.43 : 0;
  player.userData.limbs.ll.rotation.x = swing;
  player.userData.limbs.rl.rotation.x = -swing;
  player.userData.limbs.la.rotation.x = -swing * 0.7;
  player.userData.limbs.ra.rotation.x = swing * 0.7;
  const distance = settings.camera.distance;
  desiredCamera.set(player.position.x + Math.sin(yaw) * distance, 6.9 + pitch * 8, player.position.z + Math.cos(yaw) * distance);
  lookTarget.set(player.position.x, 2.6, player.position.z);
  camera.position.lerp(desiredCamera, 1 - Math.pow(0.0025, dt));
  camera.lookAt(lookTarget);
  const degrees = ((THREE.MathUtils.radToDeg(yaw) % 360) + 360) % 360;
  $('#heading').textContent = degrees < 45 || degrees >= 315 ? 'N' : degrees < 135 ? 'E' : degrees < 225 ? 'S' : 'W';
  $('#location-name').textContent = zoneName();
  refreshInteraction();
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const now = performance.now();
  updateMovement(dt);
  updateChallenge(now);
  const t = now * 0.001;
  spawnRing.material.opacity = 0.43 + Math.sin(t * 1.8) * 0.12;
  water.material.roughness = 0.2 + Math.sin(t * 0.25) * 0.02;
  haloA.rotation.z += dt * 0.12;
  haloB.rotation.x += dt * 0.08;
  twin.rotation.y = Math.sin(t * 0.35) * 0.08;
  leftQuadGlow.scale.y = 0.96 + Math.sin(t * 2.3) * 0.05;
  sourceVisuals.forEach((visual) => {
    visual.group.position.y = visual.baseY + Math.sin(t * 1.15 + visual.phase) * 0.11;
    visual.orb.rotation.y += dt * 0.45;
  });
  arenaArch.rotation.y += dt * 0.1;
  gateGlow.intensity = 27 + Math.sin(t * 1.4) * 3;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
camera.position.set(0, 7.2, 65);
camera.lookAt(0, 2.6, 43);
saveArenaData();
renderArena();
animate();
toast('KŌMØ World V0.8 · Twin + Arena');

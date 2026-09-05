import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const runtime=window.KomoWorldRuntime;
if(!runtime?.scene||!runtime?.top||!runtime?.island) throw new Error('KŌMØ V0.12.4 runtime unavailable');
const {scene,camera,renderer,top,island}=runtime;
const coarse=window.matchMedia?.('(pointer:coarse)')?.matches||false;
const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||((navigator.platform==='MacIntel')&&(navigator.maxTouchPoints>1));
const mobile=coarse||isiOS;

// Root cause fix: the original island cylinder ends at y=-0.02 and the decorative
// top disk was also positioned at y=-0.02. Those coplanar faces produced severe
// z-fighting on Safari/iPhone. Lift the visible terrain layer and give it a stable
// opaque material with polygon offset as a second safety margin.
top.position.y=.075;
top.renderOrder=1;
top.castShadow=false;
top.receiveShadow=true;

const stableGround=new THREE.MeshStandardMaterial({
  color:0x96a08a,
  roughness:.98,
  metalness:0,
  depthTest:true,
  depthWrite:true,
  polygonOffset:true,
  polygonOffsetFactor:-1,
  polygonOffsetUnits:-4
});
top.material=stableGround;

// Keep the structural island slightly darker so its edge remains readable without
// competing with the architectural plaza surface.
if(island.material){
  island.material.color.set(0x596353);
  island.material.roughness=1;
  island.material.metalness=0;
  island.material.polygonOffset=true;
  island.material.polygonOffsetFactor=1;
  island.material.polygonOffsetUnits=2;
  island.material.needsUpdate=true;
}

// Mobile depth precision: a 0.1 near plane is unnecessary for a third-person camera
// and wastes a large amount of depth-buffer precision over the island scale.
camera.near=mobile?.32:.2;
camera.far=240;
camera.updateProjectionMatrix();

// Avoid oversampling shimmer on high-DPI iPhones while preserving antialiasing.
if(mobile) renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));

// Remove accidental high-frequency maps from broad landscape meshes if a later
// material pass attached one. Large background surfaces should remain visually calm.
[top,island].forEach(mesh=>{
  const m=mesh.material;
  if(!m)return;
  if('map' in m)m.map=null;
  if('normalMap' in m)m.normalMap=null;
  if('bumpMap' in m)m.bumpMap=null;
  if('roughnessMap' in m)m.roughnessMap=null;
  m.needsUpdate=true;
});

// Make the island/background layer intentionally non-reflective and stable.
scene.traverse(o=>{
  if(!o.isMesh||o===top||o===island)return;
  const y=o.position?.y;
  if(!Number.isFinite(y))return;
  // Do not alter buildings/forecourt; only calm large, low landscape surfaces.
  const p=o.geometry?.parameters||{};
  const broad=(o.geometry?.type==='CircleGeometry'&&(p.radius||0)>40)||(o.geometry?.type==='CylinderGeometry'&&(p.radiusTop||0)>40);
  if(broad&&o.material){
    o.material.roughness=Math.max(.92,o.material.roughness??.92);
    o.material.metalness=0;
    o.material.needsUpdate=true;
  }
});

const chip=document.createElement('div');
chip.className='v123-forecourt-chip';
chip.textContent='TERRAIN STABILISÉ · MOBILE';
document.body.appendChild(chip);
setTimeout(()=>chip.classList.add('show'),250);
setTimeout(()=>chip.classList.remove('show'),1900);

window.KomoV124={version:'0.12.4',mobile,terrainGap:top.position.y-(-.02)};

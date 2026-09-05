import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const runtime=window.KomoWorldRuntime;
if(!runtime?.scene) throw new Error('KŌMØ V0.12.2 runtime unavailable');
const {scene,renderer,water,hallFloor,leftWall,rightWall,backWall,deskTop}=runtime;
const coarse=matchMedia?.('(pointer:coarse)')?.matches||false;
const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||((navigator.platform==='MacIntel')&&(navigator.maxTouchPoints>1));
const lowPower=coarse||isiOS;

function stoneMaterial(color,rough=.58){
  return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:.01});
}
const STONE=stoneMaterial(0xe2d5bf,.6);
const STONE_LIGHT=stoneMaterial(0xeee3cf,.55);
const STONE_DEEP=stoneMaterial(0xcabca3,.66);
const BRONZE=new THREE.MeshStandardMaterial({color:0xa98559,metalness:.48,roughness:.32});
const BRONZE_DARK=new THREE.MeshStandardMaterial({color:0x76583c,metalness:.42,roughness:.38});
const GLASS=lowPower
  ? new THREE.MeshPhysicalMaterial({color:0xb9c9c0,roughness:.16,transparent:true,opacity:.24,transmission:.18,depthWrite:false})
  : new THREE.MeshPhysicalMaterial({color:0xb9c9c0,roughness:.09,transparent:true,opacity:.2,transmission:.62,thickness:.3,ior:1.45,depthWrite:false});
const SAGE=new THREE.MeshStandardMaterial({color:0x30463b,roughness:.5,metalness:.05});

function assign(obj,mat){if(!obj?.isMesh)return;obj.material=mat;obj.castShadow=true;obj.receiveShadow=true;}
assign(hallFloor,STONE_LIGHT);assign(leftWall,STONE_DEEP);assign(rightWall,STONE_DEEP);assign(backWall,STONE_DEEP);assign(deskTop,STONE_LIGHT);

const hex=o=>o?.material?.color?.getHex?.();
const v12=scene.getObjectByName('KOMO_V12_ARRIVAL_PLAZA');
const v121=scene.getObjectByName('KOMO_V121_HALL_THRESHOLD');

v12?.traverse(o=>{
  if(!o.isMesh)return;const c=hex(o);
  if(c===0xdccfb8)assign(o,STONE);
  else if(c===0xeadfc9)assign(o,STONE_LIGHT);
  else if(c===0x9c7a52)assign(o,BRONZE);
  else if(c===0x27362e||c===0x43564a)assign(o,SAGE);
  else if(c===0x7e9992){
    o.material=new THREE.MeshPhysicalMaterial({color:0x79968f,roughness:.11,transparent:true,opacity:.72,transmission:lowPower?.06:.14,depthWrite:false});
  }
});

v121?.traverse(o=>{
  if(!o.isMesh)return;const c=hex(o);
  if(c===0xe2d6c0)assign(o,STONE_LIGHT);
  else if(c===0xc8baa1)assign(o,STONE_DEEP);
  else if(c===0x9c7a52)assign(o,BRONZE);
  else if(c===0xb9c8be)assign(o,GLASS);
  else if(c===0x33473d)assign(o,SAGE);
});

if(water?.material){
  water.material.color.set(0x6f8e87);
  water.material.roughness=.1;
  water.material.opacity=.78;
  water.material.transparent=true;
  if('transmission' in water.material) water.material.transmission=lowPower?.02:.08;
  if('clearcoat' in water.material) water.material.clearcoat=lowPower?.18:.5;
  if('clearcoatRoughness' in water.material) water.material.clearcoatRoughness=.08;
  water.material.needsUpdate=true;
}

renderer.toneMappingExposure=1.12;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

if(!lowPower){
  const accents=[];
  scene.traverse(o=>{if(o.isMesh&&hex(o)===0x9c7a52)accents.push(o)});
  accents.forEach(o=>o.material=BRONZE_DARK.clone());
}

const chip=document.createElement('div');
chip.className='v122-material-chip';
chip.textContent=lowPower?'MODE GRAPHIQUE MOBILE · PIERRE · BRONZE · VERRE':'PIERRE · BRONZE · VERRE · EAU';
document.body.appendChild(chip);
setTimeout(()=>chip.classList.add('show'),260);
setTimeout(()=>chip.classList.remove('show'),2200);

window.KomoV122={version:'0.12.2-safe',lowPower,materials:{STONE,STONE_LIGHT,STONE_DEEP,BRONZE,GLASS,SAGE}};

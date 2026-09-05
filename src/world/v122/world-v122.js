import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const runtime=window.KomoWorldRuntime;
if(!runtime?.scene) throw new Error('KŌMØ V0.12.2 runtime unavailable');
const {scene,renderer,water,hallFloor,leftWall,rightWall,backWall,deskTop}=runtime;

const anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy?.()||1);

function canvasTexture(draw,{srgb=false,repeat=2}={}){
  const c=document.createElement('canvas');c.width=c.height=512;
  const x=c.getContext('2d');draw(x,c.width,c.height);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=anisotropy;
  if(srgb)t.colorSpace=THREE.SRGBColorSpace;
  t.needsUpdate=true;return t;
}

const stoneMap=canvasTexture((x,w,h)=>{
  x.fillStyle='#eee4d1';x.fillRect(0,0,w,h);
  const img=x.getImageData(0,0,w,h),d=img.data;
  for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*16;d[i]=Math.max(0,Math.min(255,d[i]+n));d[i+1]=Math.max(0,Math.min(255,d[i+1]+n*.82));d[i+2]=Math.max(0,Math.min(255,d[i+2]+n*.58));}
  x.putImageData(img,0,0);
  x.globalAlpha=.15;x.lineWidth=1.1;
  for(let j=0;j<32;j++){const y=Math.random()*h;x.strokeStyle=j%3?'#b9a98e':'#f8f0df';x.beginPath();x.moveTo(0,y);for(let xx=0;xx<w;xx+=24)x.lineTo(xx,y+Math.sin(xx*.035+j)*3+Math.random()*1.4);x.stroke();}
  x.globalAlpha=1;
},{srgb:true,repeat:1.65});

const stoneRough=canvasTexture((x,w,h)=>{
  const img=x.createImageData(w,h),d=img.data;
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=(yy*w+xx)*4;const band=Math.sin(yy*.075)*7;const n=188+band+(Math.random()-.5)*38;d[i]=d[i+1]=d[i+2]=Math.max(118,Math.min(238,n));d[i+3]=255;}
  x.putImageData(img,0,0);
},{repeat:1.65});

const waterBump=canvasTexture((x,w,h)=>{
  x.fillStyle='#888';x.fillRect(0,0,w,h);x.globalAlpha=.35;
  for(let j=0;j<95;j++){x.strokeStyle=j%2?'#bdbdbd':'#666';x.lineWidth=.7+Math.random()*1.1;const y=Math.random()*h;x.beginPath();x.moveTo(0,y);for(let xx=0;xx<w;xx+=16)x.lineTo(xx,y+Math.sin(xx*.04+j)*3);x.stroke();}
  x.globalAlpha=1;
},{repeat:3.2});

function stoneMaterial(base=0xe5d8c0,rough=.58){
  return new THREE.MeshStandardMaterial({color:base,map:stoneMap,roughness:rough,roughnessMap:stoneRough,metalness:0,bumpMap:stoneRough,bumpScale:.018});
}
const STONE=stoneMaterial(0xe7dbc6,.57);
const STONE_LIGHT=stoneMaterial(0xf0e5d1,.53);
const STONE_DEEP=stoneMaterial(0xcfc0a7,.64);
const BRONZE=new THREE.MeshPhysicalMaterial({color:0xa98559,metalness:.72,roughness:.25,clearcoat:.22,clearcoatRoughness:.18});
const BRONZE_DARK=new THREE.MeshPhysicalMaterial({color:0x76583c,metalness:.62,roughness:.3,clearcoat:.16,clearcoatRoughness:.22});
const GLASS=new THREE.MeshPhysicalMaterial({color:0xb8c9c0,roughness:.075,metalness:0,transparent:true,opacity:.21,transmission:.72,thickness:.42,ior:1.46,clearcoat:.55,clearcoatRoughness:.09,depthWrite:false});
const SAGE=new THREE.MeshPhysicalMaterial({color:0x30463b,roughness:.48,metalness:.08,clearcoat:.12,clearcoatRoughness:.35});

function assign(obj,mat){if(!obj?.isMesh)return;obj.material=mat;obj.castShadow=true;obj.receiveShadow=true;}
assign(hallFloor,STONE_LIGHT);assign(leftWall,STONE_DEEP);assign(rightWall,STONE_DEEP);assign(backWall,STONE_DEEP);assign(deskTop,STONE_LIGHT);

const v12=scene.getObjectByName('KOMO_V12_ARRIVAL_PLAZA');
const v121=scene.getObjectByName('KOMO_V121_HALL_THRESHOLD');
const hex=o=>o?.material?.color?.getHex?.();

v12?.traverse(o=>{
  if(!o.isMesh)return;const c=hex(o);
  if(c===0xdccfb8)assign(o,STONE);
  else if(c===0xeadfc9)assign(o,STONE_LIGHT);
  else if(c===0x9c7a52)assign(o,BRONZE);
  else if(c===0x27362e||c===0x43564a)assign(o,SAGE);
  else if(c===0x7e9992){o.material=new THREE.MeshPhysicalMaterial({color:0x78958d,roughness:.075,transparent:true,opacity:.7,transmission:.18,thickness:.8,clearcoat:.62,clearcoatRoughness:.06,bumpMap:waterBump,bumpScale:.018,depthWrite:false});}
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
  water.material.color.set(0x6f8e87);water.material.roughness=.075;water.material.opacity=.78;water.material.transparent=true;
  water.material.clearcoat=.66;water.material.clearcoatRoughness=.055;water.material.transmission=.1;water.material.thickness=1.2;
  water.material.bumpMap=waterBump;water.material.bumpScale=.014;water.material.needsUpdate=true;
}

const bronzeAccent=new THREE.MeshPhysicalMaterial({color:0xb6905f,metalness:.78,roughness:.2,clearcoat:.25,clearcoatRoughness:.13});
scene.traverse(o=>{if(!o.isMesh)return;const c=hex(o);if(c===0x9c7a52&&o.material!==BRONZE)o.material=bronzeAccent;});

renderer.toneMappingExposure=1.13;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const chip=document.createElement('div');chip.className='v122-material-chip';chip.textContent='PIERRE · BRONZE · VERRE · EAU';document.body.appendChild(chip);setTimeout(()=>chip.classList.add('show'),420);setTimeout(()=>chip.classList.remove('show'),2600);

let t0=performance.now();
function animateMaterial(){const t=(performance.now()-t0)*.000045;waterBump.offset.x=t%1;waterBump.offset.y=(t*.42)%1;requestAnimationFrame(animateMaterial)}
animateMaterial();

window.KomoV122={version:'0.12.2',materials:{STONE,STONE_LIGHT,STONE_DEEP,BRONZE,GLASS,SAGE}};

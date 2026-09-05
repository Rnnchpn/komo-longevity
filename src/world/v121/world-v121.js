import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const runtime=window.KomoWorldRuntime;
const scene=runtime?.scene;
const player=runtime?.player;
const hall=runtime?.hall;
if(!scene||!player||!hall) throw new Error('KŌMØ V0.12.1 runtime unavailable');

const premium=scene.getObjectByName('KOMO_V12_ARRIVAL_PLAZA');
if(!premium) throw new Error('KŌMØ V0.12 Arrival Plaza unavailable');

premium.children.forEach(o=>{
  if(!o.isMesh) return;
  const p=o.geometry?.parameters||{};
  if(o.geometry?.type==='BoxGeometry' && Math.abs((p.width||0)-13.6)<.08 && Math.abs((p.height||0)-8.55)<.08 && Math.abs(o.position.z-7.8)<.2) o.visible=false;
});

const oldRings=premium.children.filter(o=>o.isMesh&&o.geometry?.type==='TorusGeometry'&&o.position.z>7&&o.position.z<8);
oldRings.forEach((r,i)=>{
  r.position.z=-7.2-i*.08;
  r.position.y=3.65;
  r.scale.setScalar(i===0?.82:.9);
  if(r.material){r.material.transparent=true;r.material.opacity=i===0?.62:.48;}
});

const g=new THREE.Group();
g.name='KOMO_V121_HALL_THRESHOLD';
scene.add(g);

const stone=new THREE.MeshStandardMaterial({color:0xe2d6c0,roughness:.64,metalness:.015});
const stoneDeep=new THREE.MeshStandardMaterial({color:0xc8baa1,roughness:.72,metalness:.01});
const sage=new THREE.MeshStandardMaterial({color:0x33473d,roughness:.58,metalness:.05});
const bronze=new THREE.MeshStandardMaterial({color:0x9c7a52,roughness:.38,metalness:.5});
const warm=new THREE.MeshStandardMaterial({color:0xffe2b0,emissive:0xffbd68,emissiveIntensity:2.6,roughness:.3});
const glass=new THREE.MeshPhysicalMaterial({color:0xb9c8be,roughness:.14,metalness:0,transparent:true,opacity:.2,transmission:.5,depthWrite:false});

function add(geo,mat,x,y,z,group=g){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function box(w,h,d,mat,x,y,z,group=g){return add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,group)}
function sprite(text,{w=4.8,h=.72,font=30,bg='rgba(35,50,42,.9)',fg='#f2ebdc'}={}){
  const c=document.createElement('canvas');c.width=1024;c.height=180;const x=c.getContext('2d');
  x.fillStyle=bg;x.beginPath();x.roundRect(20,20,984,140,30);x.fill();x.strokeStyle='rgba(224,198,151,.24)';x.lineWidth=2;x.stroke();
  x.fillStyle=fg;x.font=`600 ${font}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,512,90);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:true,depthWrite:false}));s.scale.set(w,h,1);g.add(s);return s;
}
function olive(x,z,s=.72){
  const q=new THREE.Group();q.position.set(x,0,z);g.add(q);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12*s,.18*s,2.3*s,9),new THREE.MeshStandardMaterial({color:0x695944,roughness:.96}));trunk.position.y=1.15*s;trunk.castShadow=true;q.add(trunk);
  const leaf=new THREE.MeshStandardMaterial({color:0x667763,roughness:.95});
  [[0,2.7,0,.95],[.58,2.78,.06,.62],[-.58,2.8,-.05,.65],[.16,3.2,.05,.58]].forEach(([a,b,c,r])=>{const f=new THREE.Mesh(new THREE.IcosahedronGeometry(r*s,2),leaf);f.position.set(a*s,b*s,c*s);f.scale.set(1,.72,1);f.castShadow=true;q.add(f)});
}

box(1.55,10.2,2.55,stone,-8.2,5.1,8.95);box(1.55,10.2,2.55,stone,8.2,5.1,8.95);box(18.0,1.3,2.55,stone,0,9.55,8.95);
box(.09,8.2,.09,warm,-7.34,4.95,10.28);box(.09,8.2,.09,warm,7.34,4.95,10.28);
box(15.0,.13,17.2,stone,0,.24,1.1);
for(let z=7.2;z>=-5.6;z-=3.2) box(14.4,.025,.055,bronze,0,.315,z);
box(.05,.04,16.2,bronze,-7.08,.32,1.1);box(.05,.04,16.2,bronze,7.08,.32,1.1);
box(.62,8.3,16.8,stoneDeep,-7.65,4.25,1.15);box(.62,8.3,16.8,stoneDeep,7.65,4.25,1.15);box(14.6,.16,16.4,glass,0,8.35,1.1);
[6.7,2.8,-1.1,-5.0].forEach((z,i)=>{box(.095,7.1,.13,i===3?warm:bronze,-6.8,4.1,z);box(.095,7.1,.13,i===3?warm:bronze,6.8,4.1,z);box(13.7,.095,.13,i===3?warm:bronze,0,7.62,z);});
box(.08,5.9,4.7,glass,-7.25,3.5,4.4);box(.08,5.9,4.7,glass,7.25,3.5,4.4);box(.08,5.9,4.7,glass,-7.25,3.5,-3.4);box(.08,5.9,4.7,glass,7.25,3.5,-3.4);
box(4.3,7.5,.34,sage,-6.05,3.85,-6.55);box(4.3,7.5,.34,sage,6.05,3.85,-6.55);box(3.8,.065,.11,warm,-6.05,5.9,-6.33);box(3.8,.065,.11,warm,6.05,5.9,-6.33);
[-5.45,5.45].forEach((x,i)=>{box(2.5,.64,2.15,stone,x,.36,-3.95);box(2.1,.12,1.75,new THREE.MeshStandardMaterial({color:0x5e6254,roughness:1}),x,.72,-3.95);olive(x+(i?-.12:.12),-3.95,.63);});

const deskKey=new THREE.SpotLight(0xffd49a,55,28,Math.PI/5,.5,1.4);deskKey.position.set(0,7.4,1.6);deskKey.target.position.set(0,1.0,-2.7);g.add(deskKey,deskKey.target);
const leftWash=new THREE.PointLight(0xffd4a0,8.5,15,2);leftWash.position.set(-5.5,4.7,-4.5);g.add(leftWash);
const rightWash=new THREE.PointLight(0xffd4a0,8.5,15,2);rightWash.position.set(5.5,4.7,-4.5);g.add(rightWash);
const title=sprite('KŌMØ HALL · ACCUEIL',{w:5.1,h:.72,font:31,bg:'rgba(42,58,49,.86)',fg:'#f3e9d8'});title.position.set(0,7.12,-5.95);
const sub=sprite('TWIN · REHAB · FITNESS · ARENA',{w:4.7,h:.48,font:20,bg:'rgba(42,58,49,.7)',fg:'#dfd7c8'});sub.position.set(0,6.18,-5.92);
box(8.7,.035,.12,warm,0,.34,-5.4);

let lastInside=false;
function tick(){
  const inside=player.position.z<10.5;
  const near=THREE.MathUtils.clamp((18-player.position.z)/10,0,1);
  deskKey.intensity=48+near*18;leftWash.intensity=6+near*5;rightWash.intensity=6+near*5;
  if(inside!==lastInside){document.querySelector('#app')?.toggleAttribute('data-hall-entered',inside);lastInside=inside;}
  requestAnimationFrame(tick);
}
tick();
window.KomoV121={version:'0.12.1',group:g};

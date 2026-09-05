import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const $=(s,r=document)=>r.querySelector(s);
const app=$('#app');
const runtime=window.KomoWorldRuntime;
if(!app||!runtime) throw new Error('KŌMØ World V0.12 runtime unavailable');
app.dataset.worldVersion='v12';

const {scene,renderer,hall,water,sun,fill,spawnRing,top,hallFloor,leftWall,rightWall,backWall,deskBase,deskTop}=runtime;

scene.background.set(0xc5cbc0);
scene.fog.color.set(0xc5cbc0);
scene.fog.near=90;
scene.fog.far=205;
renderer.toneMappingExposure=1.16;
sun.intensity=3.8;
sun.color.set(0xffe5bb);
fill.intensity=1.3;
fill.color.set(0xd5e1d3);
water.material.color.set(0x849a92);
water.material.opacity=.82;
water.material.roughness=.18;
top.material.color.set(0x89947f);
hallFloor.material.color.set(0xd9ccb3);
[leftWall,rightWall,backWall].forEach(w=>{w.material.color.set(0xd3c6ad);w.material.roughness=.82});
deskBase.material.color.set(0x405047);deskTop.material.color.set(0xe1d4bd);
spawnRing.material.color.set(0xe5c88e);spawnRing.material.opacity=.6;

scene.traverse(o=>{if(o.isSprite&&o.material?.map&&o.parent===hall&&o.position?.y>7)o.material.opacity=0});

const premium=new THREE.Group();premium.name='KOMO_V12_ARRIVAL_PLAZA';scene.add(premium);
const stone=new THREE.MeshStandardMaterial({color:0xdccfb8,roughness:.78,metalness:.01});
const stoneLight=new THREE.MeshStandardMaterial({color:0xeadfc9,roughness:.72,metalness:.01});
const sage=new THREE.MeshStandardMaterial({color:0x43564a,roughness:.76,metalness:.02});
const sageDark=new THREE.MeshStandardMaterial({color:0x27362e,roughness:.66,metalness:.04});
const bronze=new THREE.MeshStandardMaterial({color:0x9c7a52,roughness:.46,metalness:.38});
const warmGlow=new THREE.MeshStandardMaterial({color:0xffdeb0,emissive:0xffc97b,emissiveIntensity:2.1,roughness:.35});
const waterMat=new THREE.MeshPhysicalMaterial({color:0x7e9992,roughness:.08,metalness:0,transparent:true,opacity:.74,transmission:.12});
const soil=new THREE.MeshStandardMaterial({color:0x5f6252,roughness:1});

function mesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;premium.add(m);return m}
function box(w,h,d,mat,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z)}
function olive(x,z,s=1){
  const g=new THREE.Group();g.position.set(x,0,z);premium.add(g);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13*s,.2*s,2.65*s,10),new THREE.MeshStandardMaterial({color:0x675946,roughness:.95}));trunk.position.y=1.32*s;trunk.castShadow=true;g.add(trunk);
  const leafMat=new THREE.MeshStandardMaterial({color:0x667863,roughness:.96});
  [[0,3.05,0,1.05],[.72,3.1,.12,.72],[-.72,3.16,-.08,.74],[.28,3.62,-.16,.7],[-.25,3.64,.2,.64]].forEach(([a,b,c,d])=>{const f=new THREE.Mesh(new THREE.IcosahedronGeometry(d*s,2),leafMat);f.position.set(a*s,b*s,c*s);f.scale.set(1.05,.72,1);f.castShadow=true;g.add(f)});
  return g;
}
function textSprite(lines,{w=4.7,h=2.1,font=44,color='#ede7d8',bg='rgba(38,53,44,.93)'}={}){
  const c=document.createElement('canvas');c.width=768;c.height=384;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle=color;x.textAlign='center';x.textBaseline='middle';x.font=`500 ${font}px Arial`;const arr=Array.isArray(lines)?lines:[lines];arr.forEach((line,i)=>x.fillText(line,384,192+(i-(arr.length-1)/2)*62));const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:true,depthWrite:false}));s.scale.set(w,h,1);premium.add(s);return s
}

box(13.8,.11,34,stoneLight,0,.16,27.2);
for(let z=14;z<=40;z+=4.2) box(13.5,.018,.055,bronze,0,.225,z);
box(.055,.025,34,bronze,-6.6,.23,27.2);box(.055,.025,34,bronze,6.6,.23,27.2);

function pool(x,z){box(7.1,.24,15.8,stone,x,.07,z);box(6.45,.055,15.1,waterMat,x,.22,z);box(.18,.45,15.8,stoneLight,x-3.47,.25,z);box(.18,.45,15.8,stoneLight,x+3.47,.25,z)}
pool(-11.7,27.6);pool(11.7,27.6);

[[-17.2,35],[-17.2,20.5],[17.2,35],[17.2,20.5]].forEach(([x,z],i)=>{box(5.6,.72,4.4,stone,x,.36,z);box(5.1,.12,3.9,soil,x,.78,z);olive(x+(i%2?.25:-.2),z,.82)});
[[-20.5,11.7],[20.5,11.7]].forEach(([x,z])=>{box(7.4,.78,3.8,stone,x,.39,z);box(6.8,.12,3.25,soil,x,.84,z);olive(x,z,.9)});

box(5.2,10.6,2.25,stone,-16.2,5.3,10.1);box(5.2,10.6,2.25,stone,16.2,5.3,10.1);
box(3.1,10.6,2.25,stone,-9.4,5.3,10.1);box(3.1,10.6,2.25,stone,9.4,5.3,10.1);
box(35.6,1.25,2.25,stoneLight,0,10.05,10.1);
box(.12,8.3,.15,warmGlow,-7.55,5.2,11.32);box(.12,8.3,.15,warmGlow,7.55,5.2,11.32);
box(13.8,.11,1.1,bronze,0,.24,10.25);

box(13.6,8.55,.38,sageDark,0,4.55,7.8);
const ring=new THREE.Mesh(new THREE.TorusGeometry(2.7,.22,22,96),bronze);ring.position.set(0,3.25,7.45);ring.castShadow=true;premium.add(ring);
const innerRing=new THREE.Mesh(new THREE.TorusGeometry(2.25,.055,16,96),warmGlow);innerRing.position.set(0,3.25,7.38);premium.add(innerRing);
const logo=textSprite('KŌMØ',{w:4.3,h:1.15,font:72,bg:'rgba(0,0,0,0)'});logo.position.set(0,7.35,11.28);

const leftBanner=textSprite(['BOUGER MIEUX','VIVRE PLUS LOIN'],{w:3.5,h:5.8,font:42,bg:'rgba(38,54,45,.96)'});leftBanner.position.set(-16.1,5.6,11.3);
const rightBanner=textSprite(['CORPS · ESPRIT','PROGRÈS'],{w:3.5,h:5.8,font:42,bg:'rgba(38,54,45,.96)'});rightBanner.position.set(16.1,5.6,11.3);

[[-6.8,9.3],[6.8,9.3],[-18.7,10.4],[18.7,10.4]].forEach(([x,z])=>{const l=new THREE.PointLight(0xffd7a0,5.4,15,2);l.position.set(x,4.4,z);premium.add(l)});

const fitnessMark=textSprite(['FITNESS','REHAB'],{w:2.25,h:1.1,font:38,bg:'rgba(39,54,45,.88)'});fitnessMark.position.set(-20.4,3.05,13.65);
const arenaMark=textSprite(['ARENA','TWIN LAB'],{w:2.25,h:1.1,font:38,bg:'rgba(39,54,45,.88)'});arenaMark.position.set(20.4,3.05,13.65);

const speed=document.createElement('div');speed.className='v12-speed';speed.dataset.run='false';speed.innerHTML=`<button type="button" data-speed="walk" class="active"><i>↟</i>Marche</button><button type="button" data-speed="run"><i>↗</i>Course</button><span class="v12-speed-meter"><i></i><i></i><i></i><i></i></span>`;document.body.appendChild(speed);
let runHeld=false;
function dispatchShift(down){window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:'Shift',code:'ShiftLeft',bubbles:true}));runHeld=down}
function setRun(on){speed.dataset.run=String(on);speed.querySelectorAll('button').forEach(b=>b.classList.toggle('active',(b.dataset.speed==='run')===on));dispatchShift(on)}
speed.querySelector('[data-speed="walk"]').onclick=()=>setRun(false);speed.querySelector('[data-speed="run"]').onclick=()=>setRun(true);
window.addEventListener('blur',()=>{if(runHeld)dispatchShift(false)});

const chip=document.createElement('div');chip.className='v12-arrival-chip';chip.textContent='ARRIVAL PLAZA · KŌMØ CAMPUS';document.body.appendChild(chip);
const vignette=document.createElement('div');vignette.className='v12-vignette';document.body.appendChild(vignette);
setTimeout(()=>chip.classList.add('show'),300);setTimeout(()=>chip.classList.remove('show'),3300);

window.addEventListener('keydown',e=>{if(e.key==='Shift'){speed.dataset.run='true';speed.querySelector('[data-speed="run"]')?.classList.add('active');speed.querySelector('[data-speed="walk"]')?.classList.remove('active')}});
window.addEventListener('keyup',e=>{if(e.key==='Shift'&&!runHeld){speed.dataset.run='false';speed.querySelector('[data-speed="run"]')?.classList.remove('active');speed.querySelector('[data-speed="walk"]')?.classList.add('active')}});

window.KomoV12={version:'0.12',setRun};

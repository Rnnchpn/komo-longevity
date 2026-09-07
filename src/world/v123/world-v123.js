import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const runtime=window.KomoWorldRuntime;
if(!runtime?.scene) throw new Error('KŌMØ V0.12.3 runtime unavailable');
const {scene,top,spawnRing}=runtime;
const inherited=window.KomoV122?.materials||{};

const STONE=inherited.STONE_LIGHT||new THREE.MeshStandardMaterial({color:0xeee3cf,roughness:.56,metalness:.01});
const STONE_DEEP=inherited.STONE_DEEP||new THREE.MeshStandardMaterial({color:0xcabca3,roughness:.66,metalness:.01});
const BRONZE=inherited.BRONZE||new THREE.MeshStandardMaterial({color:0xa98559,metalness:.48,roughness:.32});
const SAGE=new THREE.MeshStandardMaterial({color:0x66745f,roughness:.92,metalness:0});
const SAGE_DARK=new THREE.MeshStandardMaterial({color:0x465545,roughness:.96,metalness:0});
const SOIL=new THREE.MeshStandardMaterial({color:0x54584c,roughness:1});

if(top?.material){top.material.color.set(0x98a28d);top.material.roughness=.94;top.material.needsUpdate=true;}
if(spawnRing?.material){spawnRing.material.opacity=.2;spawnRing.material.transparent=true;}

const g=new THREE.Group();
g.name='KOMO_V123_FORECOURT';
scene.add(g);

function box(w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function cyl(r,h,mat,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,64),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function shrub(x,z,s=.55){const q=new THREE.Group();q.position.set(x,0,z);g.add(q);[[0,.7,0,.64],[.52,.63,.06,.43],[-.5,.66,-.02,.42]].forEach(([a,b,c,r],i)=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r*s,2),i?SAGE:SAGE_DARK);m.position.set(a*s,b*s,c*s);m.scale.set(1,.68,1);m.castShadow=true;q.add(m)});return q;}

// Main spawn forecourt: a calm stone terrace that replaces the raw green foreground.
box(31.6,.12,12.8,STONE,0,.19,42.3);
box(13.7,.055,13.0,STONE,0,.28,42.25);

// Bronze rails align the spawn with the Hall axis.
box(.045,.035,12.4,BRONZE,-6.62,.32,42.25);
box(.045,.035,12.4,BRONZE,6.62,.32,42.25);
[37.0,41.2,45.4,48.2].forEach(z=>box(13.35,.028,.045,BRONZE,0,.325,z));

// Two quiet planted courts, intentionally lower and simpler than the main path.
[-10.7,10.7].forEach((x,i)=>{
  box(7.0,.26,8.15,STONE_DEEP,x,.16,42.35);
  box(6.35,.09,7.5,SOIL,x,.34,42.35);
  box(6.05,.04,7.18,SAGE,x,.405,42.35);
  shrub(x+(i?-.7:.7),40.3,.72);
  shrub(x+(i?.85:-.85),43.4,.6);
});

// Round stone planters make the spawn feel designed without adding visual clutter.
[-14.1,14.1].forEach((x,i)=>{
  cyl(1.45,.32,STONE_DEEP,x,.22,46.2);
  cyl(1.12,.1,SOIL,x,.43,46.2);
  shrub(x,46.2,.86);
});

// A precise transition strip marks the hand-off from spawn terrace to the long Hall promenade.
box(30.4,.1,.42,BRONZE,0,.26,35.92);
box(29.6,.055,.62,STONE_DEEP,0,.31,36.22);

const chip=document.createElement('div');
chip.className='v123-forecourt-chip';
chip.textContent='ARRIVAL PLAZA · PARVIS';
document.body.appendChild(chip);
setTimeout(()=>chip.classList.add('show'),280);
setTimeout(()=>chip.classList.remove('show'),2100);

window.KomoV123={version:'0.12.3',group:g};

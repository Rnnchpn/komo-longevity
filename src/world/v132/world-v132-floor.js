import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const runtime=window.KomoWorldRuntime;
if(!runtime?.hallFloor||!runtime?.hall)throw new Error('KŌMØ V0.13.2 Hall runtime unavailable');
const {hallFloor,hall,renderer}=runtime;

function makeTravertineColor(){
  const c=document.createElement('canvas');c.width=1024;c.height=1024;const x=c.getContext('2d');
  x.fillStyle='#e8dfd0';x.fillRect(0,0,c.width,c.height);

  // Broad mineral bands: low contrast, long natural flow.
  for(let i=0;i<18;i++){
    const y=30+i*56+Math.random()*20;
    x.beginPath();x.moveTo(-80,y);
    for(let s=0;s<=10;s++){
      const px=s*120-40,py=y+Math.sin(s*.8+i)*10+(Math.random()-.5)*10;
      x.lineTo(px,py);
    }
    x.strokeStyle=`rgba(${165+Math.random()*20|0},${148+Math.random()*18|0},${123+Math.random()*15|0},${.055+Math.random()*.045})`;
    x.lineWidth=1+Math.random()*2.2;x.stroke();
  }

  // Fine veins / pores.
  for(let i=0;i<6500;i++){
    const px=Math.random()*1024,py=Math.random()*1024;
    const warm=Math.random()>.5;
    x.fillStyle=warm?`rgba(150,128,99,${.008+Math.random()*.026})`:`rgba(255,250,240,${.012+Math.random()*.028})`;
    const w=.5+Math.random()*1.7,h=.5+Math.random()*1.2;
    x.fillRect(px,py,w,h);
  }

  // Large slab joints embedded in texture; intentionally sparse.
  x.strokeStyle='rgba(112,96,74,.105)';x.lineWidth=2;
  [256,512,768].forEach(px=>{x.beginPath();x.moveTo(px,0);x.lineTo(px,1024);x.stroke()});
  [341,682].forEach(py=>{x.beginPath();x.moveTo(0,py);x.lineTo(1024,py);x.stroke()});

  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2.2,1.55);
  t.anisotropy=Math.min(8,renderer?.capabilities?.getMaxAnisotropy?.()||4);
  return t;
}

function makeTravertineBump(){
  const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');
  x.fillStyle='#858585';x.fillRect(0,0,512,512);
  for(let i=0;i<2600;i++){
    const v=105+Math.random()*52|0;x.fillStyle=`rgb(${v},${v},${v})`;
    const px=Math.random()*512,py=Math.random()*512;x.fillRect(px,py,.6+Math.random()*1.8,.6+Math.random()*1.4);
  }
  for(let i=0;i<9;i++){
    x.strokeStyle=`rgba(185,185,185,${.06+Math.random()*.06})`;x.lineWidth=1+Math.random()*1.4;
    x.beginPath();let y=Math.random()*512;x.moveTo(-20,y);
    for(let s=0;s<8;s++){y+=(Math.random()-.5)*15;x.lineTo(s*80,y)}x.stroke();
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4.4,3.1);return t;
}

const colorMap=makeTravertineColor(),bumpMap=makeTravertineBump();
const floorMat=new THREE.MeshStandardMaterial({
  color:0xf2e8da,
  map:colorMap,
  bumpMap,
  bumpScale:.045,
  roughness:.66,
  metalness:0,
  envMapIntensity:.35
});

hallFloor.material?.dispose?.();
hallFloor.material=floorMat;
hallFloor.receiveShadow=true;
hallFloor.userData.v132Floor=true;

// Floor-only depth accents: two flush bronze inlays along the main circulation axis.
const floorDetails=new THREE.Group();floorDetails.name='KOMO_V132_FLOOR_DETAILS';hall.add(floorDetails);
const bronze=new THREE.MeshStandardMaterial({color:0x9a7149,roughness:.38,metalness:.5});
const darkJoint=new THREE.MeshStandardMaterial({color:0x6d6456,roughness:.78,metalness:.02});
function strip(w,d,m,x,z,y=.337){const o=new THREE.Mesh(new THREE.BoxGeometry(w,.018,d),m);o.position.set(x,y,z);o.receiveShadow=true;floorDetails.add(o);return o}

// Longitudinal inlays reinforce first-person depth without turning into a decorative carpet.
strip(.055,31.0,bronze,-3.55,0);
strip(.055,31.0,bronze,3.55,0);

// Four subtle cross-joints create large, believable slabs.
[-10.5,-3.5,3.5,10.5].forEach(z=>strip(43.5,.022,darkJoint,0,z,.334));

// Entrance threshold: slightly denser stone joint, still part of the floor language.
strip(12.0,.085,bronze,0,15.55,.339);

window.KomoV132Floor={
  version:'0.13.2',
  element:'hall-floor',
  material:'large-format-travertine',
  colorMap,
  bumpMap,
  inlays:true
};

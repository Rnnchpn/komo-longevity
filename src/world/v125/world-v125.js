import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const runtime=window.KomoWorldRuntime;
if(!runtime?.scene||!runtime?.hall||!runtime?.player) throw new Error('KŌMØ V0.12.5 runtime unavailable');
const {scene,hall,player,backWall,deskBase,deskTop}=runtime;
const inherited=window.KomoV122?.materials||{};

const STONE=inherited.STONE_LIGHT||new THREE.MeshStandardMaterial({color:0xeee3cf,roughness:.57,metalness:.01});
const STONE_DEEP=inherited.STONE_DEEP||new THREE.MeshStandardMaterial({color:0xcabca3,roughness:.67,metalness:.01});
const BRONZE=inherited.BRONZE||new THREE.MeshStandardMaterial({color:0xa98559,metalness:.46,roughness:.34});
const SAGE=new THREE.MeshStandardMaterial({color:0x263a31,roughness:.55,metalness:.04});
const GLASS=new THREE.MeshPhysicalMaterial({color:0xb8c7bd,roughness:.14,transparent:true,opacity:.16,transmission:.24,depthWrite:false});
const WARM=new THREE.MeshStandardMaterial({color:0xffddb0,emissive:0xffc06f,emissiveIntensity:2.1,roughness:.32});
const DARK=new THREE.MeshStandardMaterial({color:0x18251f,roughness:.52,metalness:.05});

// Remove the old visual stop at the rear of the Hall. The new atrium continues farther into the island.
if(backWall) backWall.visible=false;

// Clear the central axis: the original Desk sat directly on the player's line of travel.
if(deskBase) deskBase.visible=false;
if(deskTop) deskTop.visible=false;
hall.children.forEach(o=>{
  if(o.isSprite&&Math.abs(o.position.z-5.3)<.18&&o.position.y>2.3&&o.position.y<2.8) o.visible=false;
  const p=o.geometry?.parameters||{};
  if(o.isMesh&&o.geometry?.type==='BoxGeometry'&&Math.abs((p.width||0)-5.7)<.12&&Math.abs(o.position.z-6.12)<.18) o.visible=false;
});

const g=new THREE.Group();
g.name='KOMO_V125_DEEP_HALL';
scene.add(g);
function add(geo,mat,x,y,z,group=g){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function box(w,h,d,mat,x,y,z,group=g){return add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,group)}
function sprite(text,{w=4.4,h=.62,font=26,bg='rgba(28,42,35,.88)',fg='#f2ebdd'}={}){
  const c=document.createElement('canvas');c.width=900;c.height=170;const x=c.getContext('2d');
  x.fillStyle=bg;x.beginPath();x.roundRect(20,20,860,130,28);x.fill();
  x.strokeStyle='rgba(224,197,147,.22)';x.lineWidth=2;x.stroke();
  x.fillStyle=fg;x.font=`600 ${font}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,450,85);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:true,depthWrite:false}));s.scale.set(w,h,1);g.add(s);return s;
}

// Extend the Hall beyond the former rear wall. The existing Hall stops at approximately z=-25.
box(48,.32,17.4,STONE,0,.16,-33.55);
box(.5,9.5,17.4,STONE_DEEP,-23.7,4.75,-33.55);
box(.5,9.5,17.4,STONE_DEEP,23.7,4.75,-33.55);
box(48,10.2,.55,STONE_DEEP,0,5.1,-42.1);

// A calm central inlay reads as a continuous route from the threshold to the deep atrium.
box(9.2,.026,37.4,STONE,0,.342,-15.8);
box(.05,.034,37.2,BRONZE,-4.58,.365,-15.8);
box(.05,.034,37.2,BRONZE,4.58,.365,-15.8);

// Continue the architectural rhythm already started in V0.12.1. Repetition creates perspective depth.
[-9,-13,-17,-21,-25,-29,-33,-37].forEach((z,i)=>{
  const mat=i===7?WARM:BRONZE;
  box(.105,7.8,.16,mat,-8.75,4.25,z);
  box(.105,7.8,.16,mat,8.75,4.25,z);
  box(17.6,.105,.16,mat,0,8.12,z);
});

// Skylight sequence: large calm panes rather than a single flat roof.
[-12,-20,-28,-36].forEach(z=>box(17.2,.08,6.2,GLASS,0,8.62,z));

// Concierge moves to the side of the route, preserving the direct line of travel.
const desk=new THREE.Group();desk.position.set(-8.15,0,-1.2);g.add(desk);
box(5.6,1.05,1.35,DARK,0,.55,0,desk);
box(5.9,.14,1.58,STONE,0,1.12,0,desk);
box(4.4,.035,.05,WARM,0,1.06,.81,desk);
const deskSign=sprite('KŌMŌ CONCIERGE',{w:3.15,h:.46,font:20,bg:'rgba(24,37,31,.9)'});deskSign.position.set(-8.15,2.25,-.4);

// Minimal spatial wayfinding — no dashboard required.
const twinSign=sprite('←  TWIN LAB',{w:2.75,h:.43,font:19,bg:'rgba(30,47,39,.82)'});twinSign.position.set(-12.8,5.0,-10.5);
const arenaSign=sprite('ARENA  →',{w:2.6,h:.43,font:19,bg:'rgba(52,40,25,.86)',fg:'#efd6a5'});arenaSign.position.set(12.8,5.0,-10.5);
const centerSign=sprite('FITNESS · REHAB',{w:3.25,h:.4,font:17,bg:'rgba(30,47,39,.72)'});centerSign.position.set(0,6.55,-18.5);

// A far-end beacon gives the eye a destination from the spawn and keeps the atrium from reading as empty.
const farWall=box(16.8,8.2,.3,SAGE,0,4.3,-40.7);
const ring=new THREE.Mesh(new THREE.TorusGeometry(3.35,.22,18,112),BRONZE);ring.position.set(0,4.05,-40.45);ring.castShadow=true;g.add(ring);
const inner=new THREE.Mesh(new THREE.TorusGeometry(2.82,.055,14,112),WARM);inner.position.set(0,4.05,-40.38);g.add(inner);
const farTitle=sprite('YOUR BODY · ACROSS TIME',{w:4.4,h:.5,font:21,bg:'rgba(0,0,0,0)',fg:'#efe6d4'});farTitle.position.set(0,7.35,-40.1);

// Warm pools of light reinforce the visual sequence without adding heavy post-processing.
[[-7.4,4.8,-8],[7.4,4.8,-8],[-7.4,4.8,-24],[7.4,4.8,-24]].forEach(([x,y,z])=>{
  const l=new THREE.PointLight(0xffd19a,5.4,17,2);l.position.set(x,y,z);g.add(l);
});
const deepGlow=new THREE.PointLight(0xffc982,8.5,24,2);deepGlow.position.set(0,5.2,-34);g.add(deepGlow);

// Update spatial understanding at the exact moment the threshold is crossed.
const location=document.querySelector('#location-name');
const quest=document.querySelector('#quest-copy');
const app=document.querySelector('#app');
let zone='arrival',enteredOnce=false;
function setZone(next){
  if(next===zone) return;
  zone=next;
  app?.setAttribute('data-world-zone',next);
  if(location){
    if(next==='arrival') location.textContent='ARRIVAL PLAZA';
    if(next==='hall') location.textContent='KŌMŌ HALL';
    if(next==='atrium') location.textContent='KŌMŌ HALL · ATRIUM';
  }
  if(next!=='arrival'&&!enteredOnce){
    enteredOnce=true;
    if(quest) quest.textContent='02 · Explorer le Functional Digital Twin';
    const toast=document.querySelector('#toast');
    if(toast){toast.textContent='KŌMŌ HALL · Twin à gauche · Arena à droite';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2400);}
  }
}
function tick(){
  const z=player.position.z;
  setZone(z< -9?'atrium':z<8.4?'hall':'arrival');
  requestAnimationFrame(tick);
}
tick();

window.KomoV125={version:'0.12.5',group:g};

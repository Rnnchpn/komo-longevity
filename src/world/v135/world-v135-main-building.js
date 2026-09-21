const runtime=window.KomoWorldRuntime;
if(!runtime?.THREE||!runtime?.scene||!runtime?.player)throw new Error('KŌMØ V0.13.5 main building runtime unavailable');

const {THREE,scene,player}=runtime;

function disposeMaterial(material){
  if(!material)return;
  const list=Array.isArray(material)?material:[material];
  list.forEach(mat=>{
    if(!mat)return;
    for(const key of ['map','alphaMap','bumpMap','normalMap','roughnessMap','metalnessMap','emissiveMap']){
      mat[key]?.dispose?.();
    }
    mat.dispose?.();
  });
}

function disposeGroup(group){
  if(!group)return;
  group.traverse?.(o=>{
    o.geometry?.dispose?.();
    disposeMaterial(o.material);
  });
  group.removeFromParent?.();
}

window.KomoV135MainBuilding?.dispose?.();
['KOMO_V135_MAIN_BUILDING','KOMO_V135_MAIN_BUILDING_SPRINT3'].forEach(name=>disposeGroup(scene.getObjectByName(name)));
document.querySelector('#komo-v135-main-building-style')?.remove();

// Retire legacy reception architecture without touching shared materials used by the other V0.13.1 facades.
scene.getObjectByName('KOMO_V131_CONCIERGE')?.removeFromParent?.();

// V0.12.5 placed an un-named desk and a Concierge sprite inside the deep-hall group.
// Hide only those reception children; preserve the structural hall extension.
const deepHall=scene.getObjectByName('KOMO_V125_DEEP_HALL');
if(deepHall){
  deepHall.updateMatrixWorld(true);
  const wp=new THREE.Vector3();
  deepHall.children.forEach(child=>{
    child.getWorldPosition?.(wp);
    const receptionGroup=child.isGroup&&Math.abs(wp.x+8.15)<.8&&Math.abs(wp.z+1.2)<.9;
    const receptionSprite=child.isSprite&&Math.abs(wp.x+8.15)<1.2&&wp.z>-1.8&&wp.z<.5;
    if(receptionGroup||receptionSprite){
      child.visible=false;
      child.userData.komoLegacyReceptionHidden=true;
    }
  });
}

const g=new THREE.Group();
g.name='KOMO_V135_MAIN_BUILDING';
scene.add(g);

const stone=new THREE.MeshStandardMaterial({color:0xeadfce,roughness:.72,metalness:.01});
const stoneDeep=new THREE.MeshStandardMaterial({color:0xc9baa4,roughness:.82,metalness:.01});
const stoneShadow=new THREE.MeshStandardMaterial({color:0x998d79,roughness:.86,metalness:.01});
const sage=new THREE.MeshStandardMaterial({color:0x263b31,roughness:.58,metalness:.035});
const sageDeep=new THREE.MeshStandardMaterial({color:0x17271f,roughness:.50,metalness:.05});
const bronze=new THREE.MeshStandardMaterial({color:0x9b754d,roughness:.34,metalness:.58});
const bronzeDark=new THREE.MeshStandardMaterial({color:0x6f5238,roughness:.43,metalness:.48});
const glass=new THREE.MeshPhysicalMaterial({
  color:0xc6d1ca,
  roughness:.10,
  metalness:0,
  transmission:.38,
  transparent:true,
  opacity:.34,
  depthWrite:false
});
const warmGlass=new THREE.MeshPhysicalMaterial({
  color:0xe9d2ad,
  roughness:.14,
  metalness:0,
  transmission:.22,
  transparent:true,
  opacity:.28,
  emissive:0x6c4b27,
  emissiveIntensity:.10,
  depthWrite:false
});
const warm=new THREE.MeshStandardMaterial({
  color:0xf0cca0,
  roughness:.30,
  metalness:.02,
  emissive:0xc18749,
  emissiveIntensity:.80
});

function box(w,h,d,material,x,y,z,parent=g){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  parent.add(mesh);
  return mesh;
}

function panelTexture(title,subtitle,{dark=true,small=false}={}){
  const c=document.createElement('canvas');
  c.width=1600;c.height=400;
  const x=c.getContext('2d');
  x.fillStyle=dark?'#1b3027':'#e7ddcc';
  x.fillRect(0,0,c.width,c.height);
  x.strokeStyle=dark?'rgba(219,190,143,.38)':'rgba(45,66,54,.20)';
  x.lineWidth=4;x.strokeRect(5,5,c.width-10,c.height-10);
  x.textAlign='center';x.textBaseline='middle';
  x.fillStyle=dark?'#f1eadf':'#20342a';
  x.font=small?'500 86px Georgia':'500 126px Georgia';
  x.fillText(title,c.width/2,155);
  x.fillStyle=dark?'#d7b57d':'#7e684d';
  x.font=small?'650 28px Arial':'650 34px Arial';
  x.fillText(subtitle.toUpperCase(),c.width/2,285);
  const tx=new THREE.CanvasTexture(c);
  tx.colorSpace=THREE.SRGBColorSpace;
  tx.anisotropy=4;
  return tx;
}

function plane(texture,w,h,x,y,z,parent=g){
  const mat=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
  mesh.position.set(x,y,z);
  mesh.userData.komoOwnedTexture=texture;
  parent.add(mesh);
  return mesh;
}

// -----------------------------------------------------------------------------
// MAIN BUILDING — one coherent architectural owner for the World entrance.
// -----------------------------------------------------------------------------
const facade=new THREE.Group();
facade.name='KOMO_V135_MAIN_BUILDING_FACADE';
g.add(facade);

// Mineral plinth and broad lateral wings.
box(30.8,.42,3.4,stoneDeep,0,.22,31.0,facade);
[-11.2,11.2].forEach((x,i)=>{
  box(7.8,7.6,2.15,stone,x,3.80,30.55,facade);
  box(6.65,6.4,.32,sage,x,3.58,31.66,facade);
  box(5.80,.10,.18,bronze,x,6.38,31.86,facade);
  box(.12,5.55,.16,bronze,x+(i? -2.65:2.65),3.60,31.86,facade);
});

// Central portico, intentionally open on the circulation axis.
box(1.15,7.7,1.35,stone,-5.35,3.90,31.15,facade);
box(1.15,7.7,1.35,stone,5.35,3.90,31.15,facade);
box(11.85,.72,1.42,stone,0,7.48,31.15,facade);
box(10.15,.10,.12,bronze,0,7.02,31.88,facade);
box(9.10,.08,.08,warm,0,6.82,31.95,facade);

// Two fixed glass bays frame the door opening rather than closing the entire facade.
box(2.15,5.55,.12,glass,-3.65,3.50,31.90,facade);
box(2.15,5.55,.12,glass,3.65,3.50,31.90,facade);
[-4.75,-2.55,2.55,4.75].forEach(x=>box(.075,5.75,.10,bronze,x,3.52,31.98,facade));

// Signature canopy with a deeper soffit.
box(11.0,.24,2.75,stone,0,5.55,33.05,facade);
box(9.8,.08,2.10,bronze,0,5.40,33.38,facade);
box(8.7,.055,1.85,warm,0,5.30,33.45,facade);

// Roofline and one calm brand plate — no stacked signage.
box(24.0,.34,1.25,stoneShadow,0,8.05,30.72,facade);
const brandTx=panelTexture('KŌMØ WORLD','LONGEVITY IN MOTION');
plane(brandTx,7.4,1.85,0,8.70,31.55,facade);

// Journey line integrated into the architecture.
const journeyTx=panelTexture('MEASURE · UNDERSTAND · ACT','LIVE · ENGAGE · REWARD · MEASURE AGAIN',{small:true});
plane(journeyTx,8.6,1.35,0,6.42,31.91,facade);

// Warm inner vestibule gives depth behind the facade.
box(9.0,.18,5.6,stoneDeep,0,.36,27.95,facade);
box(9.4,.18,5.8,sageDeep,0,7.75,28.10,facade);
[-4.45,4.45].forEach(x=>box(.22,7.2,5.8,stoneDeep,x,3.80,28.10,facade));
[-3.10,0,3.10].forEach(x=>box(.07,6.8,.10,bronze,x,3.75,28.84,facade));

// A warm back plane creates visible depth from the plaza without blocking passage.
box(8.0,5.4,.12,warmGlass,0,3.38,26.05,facade);

// Automatic doors: visual only, not registered as collision objects.
const doorLeft=box(2.65,5.25,.10,glass,-1.38,3.38,32.02,facade);
const doorRight=box(2.65,5.25,.10,glass,1.38,3.38,32.02,facade);
box(.07,5.35,.12,bronze,-2.70,3.38,32.07,facade);
box(.07,5.35,.12,bronze,2.70,3.38,32.07,facade);

// Lobby lighting.
[[-3.4,4.65,28.2],[0,5.55,27.3],[3.4,4.65,28.2]].forEach(([x,y,z],i)=>{
  const light=new THREE.PointLight(i===1?0xf4d7a7:0xecc995,i===1?5.4:3.4,i===1?15:11,2);
  light.position.set(x,y,z);
  facade.add(light);
});

// -----------------------------------------------------------------------------
// RECEPTION — object, not character.
// -----------------------------------------------------------------------------
const desk=new THREE.Group();
desk.name='KOMO_V135_DESK';
desk.position.set(-8.15,0,-1.20);
g.add(desk);

box(5.40,.18,2.65,stoneDeep,0,.14,0,desk);
box(4.95,.92,1.15,stone,0,.66,.10,desk);
box(4.55,.52,.95,sageDeep,0,.86,.18,desk);
box(5.15,.11,1.28,bronze,0,1.22,.10,desk);
box(3.65,.04,.06,warm,0,1.09,.76,desk);

// Low sculptural fin instead of a full backdrop, keeping the hall open.
box(4.8,2.85,.16,sage,0,2.78,-.70,desk);
box(.08,2.35,.08,bronze,-2.10,2.75,-.58,desk);
box(.08,2.35,.08,bronze,2.10,2.75,-.58,desk);
const deskTx=panelTexture('KŌMØ DESK','ORIENTATION · TRAJECTORY · SPACES',{small:true});
plane(deskTx,4.15,1.02,-8.15,3.60,-1.82,g);

const deskGlow=new THREE.PointLight(0xf0ca93,3.0,9,2);
deskGlow.position.set(0,3.4,1.25);
desk.add(deskGlow);

// -----------------------------------------------------------------------------
// Door animation and lifecycle. One RAF owner, disposed before any future reload.
// -----------------------------------------------------------------------------
let raf=0;
let doorOpen=0;
function tick(){
  const dz=Math.abs(player.position.z-32.0);
  const dx=Math.abs(player.position.x);
  const target=dz<8.5&&dx<8.0?1:0;
  doorOpen+= (target-doorOpen)*.11;
  doorLeft.position.x=THREE.MathUtils.lerp(-1.38,-3.02,doorOpen);
  doorRight.position.x=THREE.MathUtils.lerp(1.38,3.02,doorOpen);
  raf=requestAnimationFrame(tick);
}
raf=requestAnimationFrame(tick);

const style=document.createElement('style');
style.id='komo-v135-main-building-style';
style.textContent=`
  body[data-komo-world-building="v135"] .desktop-world-guide{background:rgba(18,30,24,.66)!important}
`;
document.head.appendChild(style);
document.body.dataset.komoWorldBuilding='v135';

function dispose(){
  cancelAnimationFrame(raf);
  document.querySelector('#komo-v135-main-building-style')?.remove();
  if(document.body.dataset.komoWorldBuilding==='v135')delete document.body.dataset.komoWorldBuilding;
  disposeGroup(g);
}

window.KomoV135MainBuilding={
  version:'0.13.5-main-building',
  group:g,
  facade,
  desk,
  doors:[doorLeft,doorRight],
  dispose
};

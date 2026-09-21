const runtime=window.KomoWorldRuntime;
if(!runtime?.THREE||!runtime?.scene||!runtime?.hall||!runtime?.player)throw new Error('KŌMØ V0.13.5 clean hall runtime unavailable');

const {THREE,scene,hall,player,hallFloor,leftWall,rightWall,backWall}=runtime;

function disposeMaterial(material){
  const list=Array.isArray(material)?material:[material];
  list.forEach(mat=>{
    if(!mat)return;
    ['map','alphaMap','bumpMap','normalMap','roughnessMap','metalnessMap','emissiveMap'].forEach(k=>mat[k]?.dispose?.());
    mat.dispose?.();
  });
}
function disposeGroup(group){
  if(!group)return;
  group.traverse?.(o=>{o.geometry?.dispose?.();disposeMaterial(o.material)});
  group.removeFromParent?.();
}
window.KomoV135CleanHall?.dispose?.();
disposeGroup(scene.getObjectByName('KOMO_V135_CLEAN_HALL'));

const g=new THREE.Group();
g.name='KOMO_V135_CLEAN_HALL';
scene.add(g);

const stone=new THREE.MeshStandardMaterial({color:0xe9dfd0,roughness:.76,metalness:.01});
const stoneSoft=new THREE.MeshStandardMaterial({color:0xd7cbb8,roughness:.84,metalness:.01});
const wallMat=new THREE.MeshStandardMaterial({color:0xeee6da,roughness:.88,metalness:0});
const sage=new THREE.MeshStandardMaterial({color:0x263b31,roughness:.62,metalness:.025});
const sageDeep=new THREE.MeshStandardMaterial({color:0x17271f,roughness:.56,metalness:.04});
const bronze=new THREE.MeshStandardMaterial({color:0x987249,roughness:.37,metalness:.54});
const bronzeSoft=new THREE.MeshStandardMaterial({color:0xb08b5e,roughness:.42,metalness:.38});
const glass=new THREE.MeshPhysicalMaterial({color:0xcbd6cf,roughness:.10,metalness:0,transparent:true,opacity:.18,transmission:.34,depthWrite:false});
const soil=new THREE.MeshStandardMaterial({color:0x575a4e,roughness:1,metalness:0});
const leaf=new THREE.MeshStandardMaterial({color:0x63735f,roughness:.98,metalness:0});
const trunk=new THREE.MeshStandardMaterial({color:0x765f43,roughness:.96,metalness:0});
const warm=new THREE.MeshStandardMaterial({color:0xf1cf9f,roughness:.32,metalness:.02,emissive:0xb37a3e,emissiveIntensity:.50});

function box(w,h,d,material,x,y,z,parent=g){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function panelTexture(title,subtitle,{dark=true}={}){
  const c=document.createElement('canvas');c.width=1400;c.height=320;
  const x=c.getContext('2d');
  x.fillStyle=dark?'rgba(25,42,33,.97)':'rgba(235,226,213,.98)';x.fillRect(0,0,c.width,c.height);
  x.strokeStyle=dark?'rgba(213,178,122,.34)':'rgba(43,65,52,.16)';x.lineWidth=3;x.strokeRect(4,4,c.width-8,c.height-8);
  x.textAlign='center';x.textBaseline='middle';
  x.fillStyle=dark?'#f1eadf':'#20352a';x.font='500 78px Georgia';x.fillText(title,c.width/2,126);
  x.fillStyle=dark?'#d4b47d':'#79664d';x.font='650 25px Arial';x.fillText(subtitle.toUpperCase(),c.width/2,226);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function plane(texture,w,h,x,y,z,rotY=0,parent=g){
  const mat=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
  m.position.set(x,y,z);m.rotation.y=rotY;m.userData.komoOwnedTexture=texture;parent.add(m);return m;
}
function planter(x,z,mirror=1){
  box(3.6,.38,2.05,stoneSoft,x,.24,z);
  box(3.10,.10,1.58,soil,x,.48,z);
  const q=new THREE.Group();q.position.set(x+mirror*.28,0,z);g.add(q);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.10,.15,1.25,10),trunk);t.position.y=1.10;t.castShadow=true;q.add(t);
  [[0,2.05,0,.68],[.46,2.00,.03,.44],[-.42,2.05,-.02,.42],[.10,2.42,.02,.38]].forEach(([a,b,c,r])=>{
    const f=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),leaf);f.position.set(a,b,c);f.scale.set(1,.68,1);f.castShadow=true;q.add(f);
  });
}
function portal({name,x,z,rot=0,width=7.2,title,subtitle,dark=true}){
  const q=new THREE.Group();q.name=name;q.position.set(x,0,z);q.rotation.y=rot;g.add(q);
  box(.68,6.3,.92,stone,-width/2,3.15,0,q);box(.68,6.3,.92,stone,width/2,3.15,0,q);
  box(width+.68,.58,.92,stone,0,6.02,0,q);
  box(width-.85,.10,.08,bronze,0,5.66,.51,q);
  box(width-1.30,.12,1.05,stoneSoft,0,.16,.12,q);
  // Glass stays to the sides, leaving the circulation opening genuinely open.
  box((width-2.15)/2,4.65,.08,glass,-(width+2.15)/4,2.76,.50,q);
  box((width-2.15)/2,4.65,.08,glass,(width+2.15)/4,2.76,.50,q);
  const tx=panelTexture(title,subtitle,{dark});
  plane(tx,Math.min(width,6.7),1.35,0,7.05,.52,0,q);
  const light=new THREE.PointLight(0xf0cb97,dark?3.8:3.0,9,2);light.position.set(0,4.0,1.7);q.add(light);
  return q;
}

// -----------------------------------------------------------------------------
// HARD LEGACY CUT: old architectural generations are never allowed to own Hall.
// -----------------------------------------------------------------------------
const legacyNamed=[
  'KOMO_V12_ARRIVAL_PLAZA',
  'KOMO_V121_HALL_THRESHOLD',
  'KOMO_V123_FORECOURT',
  'KOMO_V125_DEEP_HALL',
  'KOMO_V131_TWIN_FRONT',
  'KOMO_V131_REHAB_FRONT',
  'KOMO_V131_ARENA_FRONT',
  'KOMO_V131_LIBRARY_FRONT',
  'KOMO_V131_THEATRE_FRONT',
  'KOMO_V131_STORE_FRONT',
  'KOMO_V131_DIRECTORY',
  'KOMO_V131_CONCIERGE',
  'KOMO_V133_SOLID_WALLS',
  'KOMO_V134_TWIN_DOOR',
  'KOMO_V134_REHAB_DOOR',
  'KOMO_V134_ARENA_DOOR',
  'KOMO_V134_CONCIERGE_SIDE',
  'KOMO_V134_CONCIERGE_AVATAR',
  'KOMO_V134_CONCIERGE_LABEL'
];
function hideLegacy(){
  legacyNamed.forEach(name=>{const o=scene.getObjectByName(name);if(o){o.visible=false;o.userData.komoV135Suppressed=true}});

  // Hide the original anonymous portal/gate roots by their known authored coordinates.
  const targets=[
    [-11,-24.45,.8],[0,-24.45,.8],[-22,-14,.8],[22,-14,.8],[22,-5,.8],[12.5,-14.8,1.0],[0,-4.7,1.1]
  ];
  for(const o of scene.children){
    if(!o?.isGroup||o===g||o.name?.startsWith('KOMO_V135_'))continue;
    if(targets.some(([x,z,r])=>Math.hypot(o.position.x-x,o.position.z-z)<r)){
      const n=(o.name||'').toUpperCase();
      if(!n.includes('TWINLAB')&&!n.includes('FUNCTIONAL')&&!n.includes('ROOM')){
        o.visible=false;o.userData.komoV135Suppressed=true;
      }
    }
  }
}

// Strip the original Hall to its structural slab and side walls.
hall.children.forEach(child=>{child.visible=false;child.userData.komoV135BaseHidden=true});
hallFloor.visible=true;leftWall.visible=true;rightWall.visible=true;backWall.visible=false;
hallFloor.material=stone;leftWall.material=wallMat;rightWall.material=wallMat;
hallFloor.castShadow=false;hallFloor.receiveShadow=true;
leftWall.receiveShadow=true;rightWall.receiveShadow=true;
hideLegacy();

// -----------------------------------------------------------------------------
// CLEAN HALL — quiet architecture, one visual hierarchy.
// -----------------------------------------------------------------------------

// Axial travertine promenade.
box(10.6,.035,33.0,stoneSoft,0,.355,-8);
box(.055,.04,32.6,bronze,-5.28,.382,-8);
box(.055,.04,32.6,bronze,5.28,.382,-8);
[-18,-8,2].forEach(z=>box(10.4,.025,.055,bronzeSoft,0,.385,z));

// Calm wall datum and bronze shadow line.
box(.20,.72,33.0,stoneSoft,-23.30,.46,-8);
box(.20,.72,33.0,stoneSoft,23.30,.46,-8);
box(.10,.08,32.7,bronze,-23.17,.84,-8);
box(.10,.08,32.7,bronze,23.17,.84,-8);

// Upper side ceiling slabs leave a generous central daylight slot.
box(14.3,.34,33.4,wallMat,-16.6,9.05,-8);
box(14.3,.34,33.4,wallMat,16.6,9.05,-8);
box(14.6,.07,32.8,glass,0,9.03,-8);
[-21.8,-15.6,-9.4,-3.2,3.0,8.2].forEach(z=>{
  box(14.8,.12,.10,bronze,0,8.86,z);
});

// Vertical rhythm stays at the edges instead of blocking the central sightline.
[-20,-12,-4,4].forEach(z=>{
  box(.13,7.1,.18,bronze,-22.92,4.45,z);
  box(.13,7.1,.18,bronze,22.92,4.45,z);
});

// Four restrained landscape moments.
planter(-10.1,-1.2,1);planter(10.1,-1.2,-1);
planter(-10.1,-12.0,-1);planter(10.1,-12.0,1);

// Destination architecture: two calm end bays + one lateral Arena bay.
portal({name:'KOMO_V135_TWIN_PORTAL',x:-10.5,z:-24.0,width:7.4,title:'FUNCTIONAL TWIN',subtitle:'UNDERSTAND · YOUR BODY',dark:true});
portal({name:'KOMO_V135_REHAB_PORTAL',x:0,z:-24.0,width:6.7,title:'REHAB',subtitle:'ACT · PROGRESS',dark:false});
portal({name:'KOMO_V135_ARENA_PORTAL',x:12.5,z:-14.6,rot:-.14,width:7.6,title:'ARENA',subtitle:'ENGAGE · PERFORMANCE',dark:true});

// A single far-wall identity band anchors the perspective.
box(23.0,6.9,.32,sageDeep,0,4.08,-25.25);
box(21.6,.075,.09,bronze,0,7.10,-25.05);
const hallTx=panelTexture('KŌMØ HALL','UNDERSTAND · ACT · ENGAGE',{dark:true});
plane(hallTx,6.6,1.45,0,7.95,-25.02);

// Side destinations are quiet plaques rather than full portal structures.
const libTx=panelTexture('LIBRARY','SCIENCE · METHOD',{dark:false});
plane(libTx,4.2,.95,-23.00,4.45,-14,Math.PI/2);
const talksTx=panelTexture('TALKS','EXPERTS · EVENTS',{dark:true});
plane(talksTx,4.2,.95,23.00,4.45,-14,-Math.PI/2);
const storeTx=panelTexture('KŌMØ LIFE','OBJECTS · EQUIPMENT',{dark:false});
plane(storeTx,3.9,.90,23.00,4.35,-5,-Math.PI/2);

// Light pools read as hospitality architecture, not game beacons.
[[-8.2,5.6,3],[8.2,5.6,3],[-8.2,5.6,-9],[8.2,5.6,-9],[-8.2,5.6,-20],[8.2,5.6,-20]].forEach(([x,y,z])=>{
  const l=new THREE.PointLight(0xf2d2a5,2.0,12,2);l.position.set(x,y,z);g.add(l);
});
const endGlow=new THREE.PointLight(0xeac28f,4.4,18,2);endGlow.position.set(0,5.1,-21.5);g.add(endGlow);

// Guarantee that no player/avatar body is ever shown in World/Twin.
// Arena may deliberately show the player's body.
const arenaHud=document.querySelector('#arena-hud');
const syncPlayer=()=>{player.visible=!!arenaHud?.classList.contains('open')};
syncPlayer();
let playerObserver=null;
if(arenaHud){
  playerObserver=new MutationObserver(syncPlayer);
  playerObserver.observe(arenaHud,{attributes:true,attributeFilter:['class']});
}

// Re-run the visibility contract after any remaining non-architectural delayed passes.
const timers=[180,500,1100,2200].map(ms=>setTimeout(()=>{hideLegacy();syncPlayer()},ms));

function capsuleCount(root){
  let n=0;root.traverse?.(o=>{if(o.geometry?.type==='CapsuleGeometry')n++});return n;
}
function audit(){
  scene.updateMatrixWorld(true);
  const visibleLegacy=legacyNamed.filter(name=>scene.getObjectByName(name)?.visible);
  const humanoids=[];
  scene.traverse(o=>{
    if(o===player||!o.visible||!o.isGroup||capsuleCount(o)<5)return;
    const p=new THREE.Vector3();o.getWorldPosition(p);
    if(Math.abs(p.x)<25&&p.z>-28&&p.z<12)humanoids.push({name:o.name||'(anonymous)',x:+p.x.toFixed(2),z:+p.z.toFixed(2)});
  });
  return {visibleLegacy,humanoids,playerVisible:player.visible,cleanHall:!!scene.getObjectByName('KOMO_V135_CLEAN_HALL')};
}

function dispose(){
  timers.forEach(clearTimeout);
  playerObserver?.disconnect();
  disposeGroup(g);
}

window.KomoV135CleanHall={
  version:'0.13.5-clean-hall',
  group:g,
  audit,
  hideLegacy,
  dispose
};

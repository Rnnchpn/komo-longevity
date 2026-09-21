import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { TwinCore } from './v04/twin-core.js';

const $=(s)=>document.querySelector(s);
const canvas=$('#world-canvas');
const loader=$('#world-loader');
const intro=$('#intro');
const languageToggle=$('#language-toggle');
const locationName=$('#location-name');
const headingEl=$('#location-heading');
const interactionEl=$('#interaction');
const interactionTitle=$('#interaction-title');
const interactionCopy=$('#interaction-copy');
const panel=$('#world-panel');
const panelKicker=$('#panel-kicker');
const panelTitle=$('#panel-title');
const panelBody=$('#panel-body');
const panelActions=$('#panel-actions');
const toastEl=$('#toast');
const mobileAction=$('#mobile-action');
const joystickZone=$('#joystick-zone');
const joystickStick=$('#joystick-stick');

const coarse=window.matchMedia?.('(pointer:coarse)')?.matches||false;
const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||((navigator.platform==='MacIntel')&&(navigator.maxTouchPoints>1));
const lowPower=coarse||isiOS;

const core=new TwinCore();
const baseline=core.snapshots[0];

const copy={
  fr:{
    today:'AUJOURD\'HUI · EXPLORER VOTRE TWIN',
    introKicker:'KŌMØ WORLD · SPATIAL LONGEVITY',
    intro1:'Votre corps.',intro2:'Votre trajectoire.',
    introBody:'Entrez dans un espace personnel conçu pour comprendre votre mouvement, choisir une action et suivre votre progression dans le temps.',
    introButton:'ENTRER DANS MON WORLD',
    action:'ACTION',
    deskTitle:'Ouvrir le KŌMØ Desk',deskCopy:'Orientation · trajectoire · espaces',
    twinTitle:'Entrer dans Functional Twin',twinCopy:'Comprendre votre mouvement dans le temps',
    rehabTitle:'Entrer dans Rehab',rehabCopy:'Transformer les données en actions',
    arenaTitle:'Entrer dans Arena',arenaCopy:'Performance · défis · communauté',
    libraryTitle:'Ouvrir la Library',libraryCopy:'Science · méthode · provenance',
    talksTitle:'Voir Talks',talksCopy:'Experts · événements · contenus',
    storeTitle:'Entrer dans KŌMØ Life',storeCopy:'Objets · Case 01 · éditions',
    back:'RETOUR AU HALL',close:'FERMER',openRehab:'OUVRIR REHAB',openLife:'OUVRIR KŌMØ LIFE',configureCase:'CONFIGURER CASE 01'
  },
  en:{
    today:'TODAY · EXPLORE YOUR TWIN',
    introKicker:'KŌMØ WORLD · SPATIAL LONGEVITY',
    intro1:'Your body.',intro2:'Your trajectory.',
    introBody:'Enter a personal space designed to understand your movement, choose an action and follow your progress over time.',
    introButton:'ENTER MY WORLD',
    action:'ACTION',
    deskTitle:'Open KŌMØ Desk',deskCopy:'Orientation · trajectory · spaces',
    twinTitle:'Enter Functional Twin',twinCopy:'Understand your movement over time',
    rehabTitle:'Enter Rehab',rehabCopy:'Turn data into action',
    arenaTitle:'Enter Arena',arenaCopy:'Performance · challenges · community',
    libraryTitle:'Open Library',libraryCopy:'Science · method · provenance',
    talksTitle:'View Talks',talksCopy:'Experts · events · content',
    storeTitle:'Enter KŌMØ Life',storeCopy:'Objects · Case 01 · editions',
    back:'BACK TO HALL',close:'CLOSE',openRehab:'OPEN REHAB',openLife:'OPEN KŌMØ LIFE',configureCase:'CONFIGURE CASE 01'
  }
};
let locale='fr';

const current=()=>core.current();
$('#hud-motion').textContent=current().motion_score;
$('#hud-age').textContent=current().motion_age;

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,lowPower?1.45:1.8));
renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.92;
renderer.shadowMap.enabled=!lowPower;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xcbd2c8);
scene.fog=new THREE.Fog(0xcbd2c8,72,150);

const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.12,220);
camera.position.set(0,1.72,58);

const hemi=new THREE.HemisphereLight(0xe5eadf,0x596354,2.25);
scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe5bd,3.3);
sun.position.set(-24,38,32);
sun.castShadow=!lowPower;
if(sun.castShadow){
  sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-45;
  sun.shadow.camera.near=1;sun.shadow.camera.far=110;sun.shadow.bias=-.00025;
}
scene.add(sun);
const fill=new THREE.DirectionalLight(0xdde8de,1.1);
fill.position.set(28,18,-30);scene.add(fill);

const living={
  trees:[],
  water:[],
  shimmers:[],
  lights:[],
  dust:null,
  lifeDisplay:null,
  kinetic:null,
  motionScreens:[],
  exteriorSculptures:[],
  banners:[],
  daylight:'day'
};

function applyDaylight(){
  const d=new Date(),h=d.getHours()+d.getMinutes()/60;
  let bg=0xcbd2c8,fog=0xcbd2c8,sunColor=0xffe5bd,sunPower=3.3,hemiPower=2.25,exposure=.92,state='day';
  if(h<7||h>=21){
    bg=0x8e9a92;fog=0x8e9a92;sunColor=0xe8d5bc;sunPower=1.65;hemiPower=1.55;exposure=.78;state='evening';
  }else if(h<9){
    bg=0xbfc9bf;fog=0xbfc9bf;sunColor=0xffcc91;sunPower=2.75;hemiPower=2.0;exposure=.88;state='morning';
  }else if(h>=17.5){
    bg=0xc5c6b8;fog=0xc5c6b8;sunColor=0xffc37f;sunPower=3.05;hemiPower=1.95;exposure=.88;state='golden';
  }
  scene.background.setHex(bg);scene.fog.color.setHex(fog);sun.color.setHex(sunColor);sun.intensity=sunPower;hemi.intensity=hemiPower;renderer.toneMappingExposure=exposure;living.daylight=state;
}
applyDaylight();
const daylightTimer=setInterval(applyDaylight,60000);

const M={
  ground:new THREE.MeshStandardMaterial({color:0x9ca793,roughness:.98,metalness:0}),
  stone:new THREE.MeshStandardMaterial({color:0xe8dfd2,roughness:.78,metalness:.01}),
  stoneLight:new THREE.MeshStandardMaterial({color:0xf1eae0,roughness:.72,metalness:.01}),
  stoneDeep:new THREE.MeshStandardMaterial({color:0xcdbfa9,roughness:.84,metalness:.01}),
  wall:new THREE.MeshStandardMaterial({color:0xece4d8,roughness:.88,metalness:0}),
  sage:new THREE.MeshStandardMaterial({color:0x2b4135,roughness:.62,metalness:.025}),
  sageDeep:new THREE.MeshStandardMaterial({color:0x17281f,roughness:.56,metalness:.04}),
  sageSoft:new THREE.MeshStandardMaterial({color:0x6f8170,roughness:.94,metalness:0}),
  bronze:new THREE.MeshStandardMaterial({color:0x9c754c,roughness:.36,metalness:.55}),
  bronzeSoft:new THREE.MeshStandardMaterial({color:0xc39b64,roughness:.44,metalness:.34}),
  soil:new THREE.MeshStandardMaterial({color:0x575d50,roughness:1,metalness:0}),
  trunk:new THREE.MeshStandardMaterial({color:0x735e45,roughness:.96,metalness:0}),
  water:new THREE.MeshPhysicalMaterial({color:0x87a39a,roughness:.12,metalness:0,transparent:true,opacity:.56,transmission:lowPower?.03:.12,depthWrite:true}),
  glass:new THREE.MeshPhysicalMaterial({color:0xbdccc3,roughness:.12,metalness:0,transparent:true,opacity:.27,transmission:lowPower?.08:.42,depthWrite:false}),
  warm:new THREE.MeshStandardMaterial({color:0xf0cc96,roughness:.34,metalness:.03,emissive:0xa36d35,emissiveIntensity:.45}),
  twinGlass:new THREE.MeshPhysicalMaterial({color:0x9bb6a3,roughness:.18,metalness:.02,transparent:true,opacity:.48,transmission:.12,depthWrite:false}),
  twinGlow:new THREE.MeshStandardMaterial({color:0xb8d0bc,roughness:.34,metalness:.03,emissive:0x577462,emissiveIntensity:.42}),
  attention:new THREE.MeshStandardMaterial({color:0xcf9f65,roughness:.34,metalness:.08,emissive:0x8c5627,emissiveIntensity:.48}),
  arena:new THREE.MeshStandardMaterial({color:0x2a241b,roughness:.65,metalness:.08}),
  arenaGold:new THREE.MeshStandardMaterial({color:0xb9935c,roughness:.36,metalness:.48})
};
const MAT={
  fabric:new THREE.MeshStandardMaterial({color:0x415347,roughness:.96,metalness:0}),
  fabricLight:new THREE.MeshStandardMaterial({color:0xb8b2a5,roughness:.98,metalness:0}),
  walnut:new THREE.MeshStandardMaterial({color:0x6b513a,roughness:.76,metalness:.01}),
  charcoal:new THREE.MeshStandardMaterial({color:0x222a25,roughness:.68,metalness:.03}),
  brass:new THREE.MeshStandardMaterial({color:0xb18a56,roughness:.30,metalness:.66}),
  ivory:new THREE.MeshStandardMaterial({color:0xf1eadf,roughness:.88,metalness:0}),
  smokedGlass:new THREE.MeshPhysicalMaterial({color:0x718177,roughness:.17,metalness:.02,transparent:true,opacity:.24,transmission:lowPower?.05:.28,depthWrite:false}),
  limestone:new THREE.MeshStandardMaterial({color:0xdccfba,roughness:.90,metalness:0}),
  travertine:new THREE.MeshStandardMaterial({color:0xe5d8c5,roughness:.84,metalness:.01}),
  blackened:new THREE.MeshStandardMaterial({color:0x151d18,roughness:.48,metalness:.10})
};

function mesh(parent,geometry,material,x=0,y=0,z=0,{cast=false,receive=true}={}){
  const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=cast&&!lowPower;o.receiveShadow=receive;parent.add(o);return o;
}
function box(parent,w,h,d,material,x,y,z,opt){return mesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z,opt)}
function cyl(parent,rTop,rBot,h,material,x,y,z,segments=18,opt){return mesh(parent,new THREE.CylinderGeometry(rTop,rBot,h,segments),material,x,y,z,opt)}
function panelTexture(title,subtitle,{dark=true,accent='#d5b477',w=1400,h=360,titleSize=90}={}){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  x.fillStyle=dark?'#1b3027':'#eee5d8';x.fillRect(0,0,w,h);
  x.strokeStyle=dark?'rgba(218,187,136,.34)':'rgba(42,64,51,.16)';x.lineWidth=3;x.strokeRect(4,4,w-8,h-8);
  x.textAlign='center';x.textBaseline='middle';x.fillStyle=dark?'#f1eadf':'#20352a';x.font=`500 ${titleSize}px Georgia`;x.fillText(title,w/2,h*.42);
  x.fillStyle=dark?accent:'#7c674e';x.font='650 27px Arial';x.fillText(subtitle.toUpperCase(),w/2,h*.72);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
}
function plaque(parent,title,subtitle,w,h,x,y,z,{rotY=0,dark=true,titleSize=90}={}){
  const tx=panelTexture(title,subtitle,{dark,titleSize});const mat=new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide,transparent:false});
  const p=mesh(parent,new THREE.PlaneGeometry(w,h),mat,x,y,z,{receive:false});p.rotation.y=rotY;p.userData.texture=tx;return p;
}
function glow(parent,color,intensity,distance,x,y,z){
  const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);parent.add(l);return l;
}
function line(parent,w,d,x,z,material=M.bronze,y=.075){
  return box(parent,w,.018,d,material,x,y,z,{cast:false,receive:true});
}
function tree(parent,x,z,s=.8){
  const g=new THREE.Group();g.position.set(x,0,z);g.userData.swayPhase=(x*1.73+z*.91);parent.add(g);living.trees.push(g);
  cyl(g,.10*s,.15*s,1.8*s,M.trunk,0,.9*s,0,10,{cast:true});
  [[0,2.08,0,.72],[.47,2.06,.03,.48],[-.46,2.1,-.02,.46],[.08,2.48,0,.39]].forEach(([a,b,c,r])=>{
    const f=mesh(g,new THREE.SphereGeometry(r*s,18,12),M.sageSoft,a*s,b*s,c*s,{cast:true});
    f.scale.set(1,.72,1);
  });
  return g;
}
function exteriorBench(parent,x,z,rot=0,scale=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;parent.add(g);
  box(g,2.20*scale,.16,.62*scale,MAT.walnut,0,.52,0,{cast:true});
  box(g,2.32*scale,.07,.76*scale,MAT.brass,0,.39,0);
  [-.92,.92].forEach(xx=>{
    box(g,.10*scale,.42,.10*scale,MAT.brass,xx,.21,-.18*scale,{cast:true});
    box(g,.10*scale,.42,.10*scale,MAT.brass,xx,.21,.18*scale,{cast:true});
  });
  return g;
}
function exteriorBollard(parent,x,z,height=.78){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  cyl(g,.07,.10,height,MAT.blackened,0,height/2,0,14,{cast:true});
  cyl(g,.11,.11,.05,MAT.brass,0,height+.03,0,16,{cast:true});
  const l=glow(g,0xf1d2a0,.85,4.5,0,height+.10,0);living.lights.push(l);
  return g;
}
function exteriorPlanter(parent,x,z,w=3.2,d=2.0,treeScale=.62){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  box(g,w,.34,d,M.stoneDeep,0,.17,0);
  box(g,w-.34,.08,d-.28,M.soil,0,.39,0);
  tree(g,0,0,treeScale);
  return g;
}
function sculptureGarden(parent,x,z,scale=1){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  box(g,1.55*scale,.42,1.55*scale,MAT.limestone,0,.21,0,{cast:true});
  box(g,1.35*scale,.05,1.35*scale,MAT.brass,0,.45,0);
  const a=mesh(g,new THREE.TorusGeometry(.46*scale,.045*scale,10,52),MAT.brass,0,1.02,0,{cast:true});
  const b=mesh(g,new THREE.TorusGeometry(.30*scale,.026*scale,8,40),M.bronzeSoft,0,1.02,0,{cast:true});
  a.rotation.x=1.05;b.rotation.y=.75;
  const core=mesh(g,new THREE.SphereGeometry(.08*scale,16,12),M.warm,0,1.02,0,{cast:true});
  return {group:g,a,b,core};
}
function bannerTexture(title,subtitle,{w=720,h=1800,dark=true,accent='#d5b477'}={}){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  x.fillStyle=dark?'#163126':'#efe6d9';x.fillRect(0,0,w,h);
  x.strokeStyle=dark?'rgba(218,187,136,.28)':'rgba(42,64,51,.14)';x.lineWidth=6;x.strokeRect(10,10,w-20,h-20);
  x.fillStyle=dark?'#f0eadf':'#20352a';x.font='600 82px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(title,w/2,h*.34);
  x.fillStyle=accent;x.font='700 28px Arial';x.fillText(subtitle.toUpperCase(),w/2,h*.44);
  x.strokeStyle='rgba(213,180,119,.45)';x.lineWidth=2;x.beginPath();x.moveTo(w*.18,h*.52);x.lineTo(w*.82,h*.52);x.stroke();
  x.fillStyle=dark?'rgba(240,234,223,.85)':'rgba(32,53,42,.78)';x.font='500 22px Arial';x.fillText('LONGEVITY IN MOTION',w/2,h*.60);
  x.fillStyle=dark?'rgba(240,234,223,.42)':'rgba(32,53,42,.42)';x.font='600 17px Arial';x.fillText('KŌMØ · RIVIERA',w/2,h*.82);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
}
function fabricBanner(parent,x,y,z,w=1.35,h=4.2,title='KŌMØ',subtitle='WORLD',{rotY=0,dark=true}={}){
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotY;parent.add(g);
  const tx=bannerTexture(title,subtitle,{dark});
  const geo=new THREE.PlaneGeometry(w,h,12,22);
  const mat=new THREE.MeshStandardMaterial({map:tx,side:THREE.DoubleSide,roughness:.92,metalness:0});
  const cloth=mesh(g,geo,mat,0,-h/2,0,{cast:false,receive:false});
  cloth.userData.base=Float32Array.from(geo.attributes.position.array);
  cloth.userData.height=h;cloth.userData.phase=(x*.31+z*.17+h)%6.2;living.banners.push(cloth);
  box(g,w+.10,.055,.055,MAT.brass,0,.02,.025,{cast:true});
  box(g,w+.10,.045,.045,MAT.brass,0,-h+.02,.025,{cast:true});
  box(g,.07,.28,.07,MAT.brass,-w/2,.13,.025,{cast:true});
  box(g,.07,.28,.07,MAT.brass,w/2,.13,.025,{cast:true});
  return g;
}
function shrubCluster(parent,x,z,scale=.65){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  [[0,.26,0,.58],[.42,.22,.18,.32],[-.38,.24,-.12,.28],[.18,.18,-.34,.24]].forEach(([a,b,c,r])=>{
    const shrub=mesh(g,new THREE.SphereGeometry(r*scale,14,10),M.sageSoft,a*scale,b*scale,c*scale,{cast:true});
    shrub.scale.set(1,.62,1);
  });
  return g;
}
function gravelIsland(parent,x,z,w=4.2,d=2.7){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  box(g,w,.16,d,MAT.limestone,0,.08,0);
  box(g,w-.30,.05,d-.26,M.soil,0,.19,0);
  shrubCluster(g,-.9,-.2,.70);shrubCluster(g,.65,.25,.58);
  return g;
}
function bannerTotem(parent,x,z,title,subtitle,rotY=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotY;parent.add(g);
  box(g,1.18,.22,1.18,MAT.travertine,0,.11,0,{cast:true});
  box(g,.18,5.55,.18,MAT.blackened,0,2.78,0,{cast:true});
  fabricBanner(g,0,5.30,.07,1.45,4.45,title,subtitle,{dark:true});
  return g;
}
function loungeCluster(parent,x,z,rot=0,scale=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;parent.add(g);
  box(g,4.35*scale,.035,3.05*scale,M.stoneDeep,0,.19,0);
  line(g,3.9*scale,.035,0,-1.34*scale,M.bronze,.225);
  line(g,3.9*scale,.035,0,1.34*scale,M.bronze,.225);
  box(g,2.50*scale,.34,.82*scale,MAT.fabric,-.58*scale,.46,.66*scale,{cast:true});
  box(g,2.50*scale,.66,.20*scale,MAT.fabric,-.58*scale,.78,1.02*scale,{cast:true});
  box(g,.88*scale,.38,.82*scale,MAT.fabricLight,1.28*scale,.48,-.42*scale,{cast:true});
  box(g,.88*scale,.65,.18*scale,MAT.fabricLight,1.28*scale,.79,-.77*scale,{cast:true});
  cyl(g,.55*scale,.55*scale,.08*scale,MAT.walnut,.45*scale,.48,.05*scale,28,{cast:true});
  cyl(g,.045*scale,.065*scale,.44*scale,MAT.brass,.45*scale,.24,.05*scale,12,{cast:true});
  const lamp=new THREE.Group();lamp.position.set(-1.62*scale,0,-.55*scale);g.add(lamp);
  cyl(lamp,.03*scale,.04*scale,1.75*scale,MAT.brass,0,.88,0,12,{cast:true});
  mesh(lamp,new THREE.ConeGeometry(.34*scale,.48*scale,24,1,true),MAT.ivory,0,1.82,0,{cast:false});
  glow(lamp,0xf2d7aa,1.2,5,0,1.72,0);
  return g;
}
function pedestalObject(parent,x,z,type='stone'){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  box(g,1.2,.72,1.2,type==='dark'?M.sageDeep:M.stone,0,.37,0,{cast:true});
  box(g,1.02,.05,1.02,M.bronze,0,.76,0);
  if(type==='ring'){
    const a=mesh(g,new THREE.TorusGeometry(.42,.04,10,48),MAT.brass,0,1.45,0,{cast:true});a.rotation.y=.45;
    const b=mesh(g,new THREE.TorusGeometry(.29,.025,8,40),MAT.brass,0,1.45,0,{cast:true});b.rotation.x=.9;
  }else{
    const o=mesh(g,new THREE.IcosahedronGeometry(.42,1),type==='dark'?M.stoneLight:M.sage,0,1.32,0,{cast:true});
    o.rotation.set(.35,.65,.15);
  }
  return g;
}
function motionScreen(parent,x,y,z,rotY=0,label='MOTION'){
  const c=document.createElement('canvas');c.width=1024;c.height=520;const ctx=c.getContext('2d');
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const mat=new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide});
  const m=mesh(parent,new THREE.PlaneGeometry(3.55,1.8),mat,x,y,z,{receive:false});m.rotation.y=rotY;
  const rec={ctx,tx,label,phase:Math.random()*10};living.motionScreens.push(rec);
  return m;
}
function drawMotionScreen(rec,t){
  const {ctx,tx,label}=rec,w=1024,h=520;
  ctx.fillStyle='#17281f';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(211,180,126,.22)';ctx.lineWidth=2;ctx.strokeRect(12,12,w-24,h-24);
  ctx.fillStyle='#efe8dc';ctx.font='600 50px Georgia';ctx.fillText(label,54,78);
  ctx.fillStyle='rgba(216,184,128,.78)';ctx.font='700 20px Arial';ctx.fillText('LONGITUDINAL SIGNAL',55,116);
  ctx.strokeStyle='rgba(238,231,219,.11)';ctx.lineWidth=1;
  for(let i=0;i<5;i++){const yy=175+i*58;ctx.beginPath();ctx.moveTo(55,yy);ctx.lineTo(968,yy);ctx.stroke()}
  ctx.strokeStyle='#d5b477';ctx.lineWidth=4;ctx.beginPath();
  for(let x=55;x<=968;x+=8){
    const p=(x-55)/913;
    const y=320-Math.sin(p*10+rec.phase+t*.35)*32-Math.sin(p*24+t*.18)*12-p*54;
    if(x===55)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.stroke();
  const dotX=55+((t*.035+rec.phase*.03)%1)*913;
  const p=(dotX-55)/913;
  const dotY=320-Math.sin(p*10+rec.phase+t*.35)*32-Math.sin(p*24+t*.18)*12-p*54;
  ctx.fillStyle='#f0d4a2';ctx.beginPath();ctx.arc(dotX,dotY,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(238,231,219,.52)';ctx.font='600 19px Arial';ctx.fillText('MOVE · MEASURE · UNDERSTAND · ACT',55,460);
  tx.needsUpdate=true;
}
function architecturalBay(parent,x,z,side=1,label='',sub=''){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  box(g,3.45,.18,5.25,MAT.travertine,0,.12,0);
  box(g,.26,5.9,5.0,MAT.limestone,side*1.56,3.0,0,{cast:true});
  box(g,3.1,.24,5.0,MAT.limestone,0,5.86,0,{cast:true});
  box(g,.08,5.15,4.5,MAT.smokedGlass,-side*1.44,2.85,0);
  [-1.85,0,1.85].forEach(zz=>box(g,.075,5.1,.10,MAT.brass,-side*1.38,2.88,zz));
  box(g,2.5,.08,.18,M.warm,0,5.47,-2.12);
  if(label)plaque(g,label,sub,3.35,.84,-side*1.36,4.65,0,{rotY:side>0?-Math.PI/2:Math.PI/2,dark:true,titleSize:58});
  return g;
}
function ceilingRaft(parent,x,z,w=5.2,d=5.8){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  box(g,w,.18,d,MAT.travertine,0,7.64,0,{cast:true});
  box(g,w-.45,.035,d-.40,MAT.walnut,0,7.51,0);
  [-1,1].forEach(side=>box(g,w-.70,.035,.055,M.warm,0,7.42,side*(d/2-.35)));
  return g;
}
function caseObject(parent,x,y,z,scale=1,open=false){
  const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
  const shell=new THREE.MeshStandardMaterial({color:0x4e4036,roughness:.52,metalness:.03});
  const leather=new THREE.MeshStandardMaterial({color:0x8c755d,roughness:.72,metalness:0});
  box(g,1.42,.76,.38,shell,0,.38,0,{cast:true});
  box(g,1.31,.64,.40,leather,0,.38,.01,{cast:true});
  box(g,.60,.12,.12,MAT.brass,0,.83,0);
  box(g,.07,.23,.08,MAT.brass,-.30,.74,0);
  box(g,.07,.23,.08,MAT.brass,.30,.74,0);
  if(open){
    const lid=box(g,1.34,.09,.74,leather,0,1.15,-.26,{cast:true});
    lid.rotation.x=-.58;
    for(let i=0;i<6;i++){
      const cx=(i%3-1)*.30,cz=-.05+Math.floor(i/3)*.24;
      cyl(g,.075,.075,.24,M.sageDeep,cx,.90,cz,14,{cast:true});
      box(g,.12,.05,.12,M.bronze,cx,.78,cz);
    }
  }
  return g;
}
function productNiche(parent,x,y,z,title,subtitle,rotY=0){
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotY;parent.add(g);
  box(g,2.65,2.55,.24,MAT.blackened,0,0,0);
  box(g,2.33,2.18,.08,MAT.smokedGlass,0,0,.15);
  box(g,1.55,.08,.62,MAT.brass,0,-.77,.40);
  plaque(g,title,subtitle,2.10,.48,0,.77,.20,{dark:true,titleSize:42});
  const light=glow(g,0xf2d5a4,1.25,4,0,.30,.70);living.lights.push(light);
  return g;
}
function bodySegment(parent,a,b,r,material){
  const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);
  const m=mesh(parent,new THREE.CylinderGeometry(r*.82,r,d.length(),16),material);
  m.position.copy(A).add(B).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
  return m;
}

const world=new THREE.Group();world.name='KOMO_WORLD_V1';scene.add(world);
const twinRoom=new THREE.Group();twinRoom.name='KOMO_TWIN_V1';twinRoom.visible=false;scene.add(twinRoom);
const rehabRoom=new THREE.Group();rehabRoom.name='KOMO_REHAB_V1';rehabRoom.visible=false;scene.add(rehabRoom);
const arenaRoom=new THREE.Group();arenaRoom.name='KOMO_ARENA_V1';arenaRoom.visible=false;scene.add(arenaRoom);

// Landscape + arrival.
mesh(world,new THREE.PlaneGeometry(150,170),M.ground,0,-.04,8,{receive:true}).rotation.x=-Math.PI/2;
box(world,13.2,.18,48,M.stoneLight,0,.07,39,{receive:true});
[-6.5,6.5].forEach(x=>line(world,.05,47.5,x,39,M.bronze,.17));
[20,30,40,50,60].forEach(z=>line(world,13,.04,0,z,M.bronzeSoft,.17));

const shimmerMat=new THREE.MeshBasicMaterial({color:0xdce9df,transparent:true,opacity:.10,depthWrite:false});
[-12.3,12.3].forEach((x,side)=>{
  box(world,8.2,.26,30,M.stoneDeep,x,.10,40);
  const pool=box(world,7.5,.08,29.2,M.water,x,.28,40,{cast:false,receive:false});
  living.water.push(pool);
  for(let i=0;i<3;i++){
    const q=box(world,5.9,.012,.055,shimmerMat,x,.33,27+i*7,{cast:false,receive:false});
    q.userData.phase=(i*.29)+(side*.17);living.shimmers.push(q);
  }
});
[-17.4,17.4].forEach((x,i)=>{
  box(world,5.4,.46,4.6,M.stoneDeep,x,.22,47);
  box(world,4.9,.10,4.1,M.soil,x,.50,47);
  tree(world,x+(i?-.3:.3),47,.86);
});
tree(world,-15.2,28,.66);tree(world,15.2,28,.66);

// Arrival terraces: quiet hospitality before the Hall.
[-1,1].forEach(side=>{
  const x=side*9.25;
  box(world,3.9,.34,5.0,M.stoneDeep,x,.17,56.0);
  box(world,3.45,.05,4.55,M.stoneLight,x,.37,56.0);
  box(world,2.35,.32,.76,MAT.fabric,x-side*.22,.58,56.75,{cast:true});
  box(world,2.35,.62,.18,MAT.fabric,x-side*.22,.88,57.05,{cast:true});
  cyl(world,.48,.48,.07,MAT.walnut,x+side*1.18,.59,55.40,24,{cast:true});
  tree(world,x-side*.95,54.75,.54);
  const l=glow(world,0xf2d19c,1.35,7,x,2.4,55.9);living.lights.push(l);
});
pedestalObject(world,-8.6,35.0,'ring');
pedestalObject(world,8.6,35.0,'dark');
plaque(world,'ARRIVAL','LONGEVITY IN MOTION',4.1,.98,-8.3,3.7,31.8,{rotY:Math.PI/2,dark:true,titleSize:66});
plaque(world,'KŌMØ LIFE','OBJECTS · EQUIPMENT',4.1,.98,8.3,3.7,31.8,{rotY:-Math.PI/2,dark:true,titleSize:62});

// V1.6 exterior environment — a landscaped Riviera forecourt around the main building.
const exterior=new THREE.Group();exterior.name='KOMO_EXTERIOR_V16';world.add(exterior);

// Larger mineral forecourt that visually connects Arrival with the architecture.
box(exterior,20.8,.055,30.5,MAT.travertine,0,.055,40.7);
box(exterior,9.2,.030,28.0,M.stoneLight,0,.092,40.7);
[-5.10,5.10].forEach(x=>line(exterior,.05,27.6,x,40.7,M.bronze,.115));
[28,34,40,46,52].forEach(z=>line(exterior,9.0,.04,0,z,M.bronzeSoft,.118));

// Landscape carpets and low stone edges.
[-1,1].forEach(side=>{
  box(exterior,6.6,.07,31.0,M.ground,side*13.55,.032,40.8);
  box(exterior,.22,.46,28.0,MAT.limestone,side*18.15,.23,40.8,{cast:true});
});

// Secondary reflecting basins closer to the building.
[-1,1].forEach(side=>{
  box(exterior,3.25,.18,16.5,M.stoneLight,side*8.75,.11,41.0);
  const pool=box(exterior,2.88,.07,15.9,M.water,side*8.75,.205,41.0,{cast:false,receive:false});
  living.water.push(pool);
  for(let i=0;i<2;i++){
    const q=box(exterior,2.30,.010,.045,shimmerMat,side*8.75,.255,35.4+i*7.2,{cast:false,receive:false});
    q.userData.phase=.18+i*.37+(side>0?.22:0);living.shimmers.push(q);
  }
});

// Trees create a strong arrival axis without hiding the facade.
[-1,1].forEach(side=>{
  [26.5,32.5,38.5,44.5,50.5].forEach((z,i)=>{
    tree(exterior,side*15.2,z,.60+(i%2)*.05);
  });
});

// Hospitality benches outside the circulation spine.
exteriorBench(exterior,-12.2,33.8,Math.PI/2,.92);
exteriorBench(exterior,12.2,33.8,-Math.PI/2,.92);
exteriorBench(exterior,-12.2,48.0,Math.PI/2,.92);
exteriorBench(exterior,12.2,48.0,-Math.PI/2,.92);

// Integrated planters near the corners of the forecourt.
exteriorPlanter(exterior,-16.0,24.8,3.4,2.25,.60);
exteriorPlanter(exterior,16.0,24.8,3.4,2.25,.60);
exteriorPlanter(exterior,-16.0,56.5,3.4,2.25,.60);
exteriorPlanter(exterior,16.0,56.5,3.4,2.25,.60);

// Low lighting: hospitality rather than runway.
[-1,1].forEach(side=>{
  [29.5,36.0,42.5,49.0].forEach(z=>exteriorBollard(exterior,side*11.3,z,.74));
});

// Two sculptural markers announce KŌMØ before the entrance.
const exteriorSculptureL=sculptureGarden(exterior,-6.8,27.2,.96);
const exteriorSculptureR=sculptureGarden(exterior,6.8,27.2,.96);
living.exteriorSculptures.push(exteriorSculptureL,exteriorSculptureR);

// Shallow terraces frame the forecourt and prevent the building from floating in open space.
[-1,1].forEach(side=>{
  box(exterior,4.2,.34,7.2,MAT.limestone,side*16.0,.17,31.0,{cast:true});
  box(exterior,4.2,.34,7.2,MAT.limestone,side*16.0,.17,50.6,{cast:true});
  line(exterior,3.45,.04,side*16.0,27.65,M.bronze,.36);
  line(exterior,3.45,.04,side*16.0,54.0,M.bronze,.36);
});

// Warm facade wash and garden pools of light.
[
  [-6.7,3.8,23.0,1.65],[6.7,3.8,23.0,1.65],
  [-12.6,3.2,27.0,1.15],[12.6,3.2,27.0,1.15],
  [-12.8,2.4,46.5,.95],[12.8,2.4,46.5,.95]
].forEach(([x,y,z,intensity])=>{
  const l=glow(exterior,0xf2cf98,intensity,8,x,y,z);living.lights.push(l);
});

// One discreet landscape identity marker, leaving the building as the hero.
plaque(exterior,'KŌMØ','ARRIVAL COURT',3.4,.75,-17.70,2.30,39.0,{rotY:Math.PI/2,dark:true,titleSize:57});

// V1.7 campus identity — freestanding banners and denser Riviera landscaping.
bannerTotem(exterior,-14.25,25.9,'KŌMØ','WORLD',.12);
bannerTotem(exterior,14.25,25.9,'KŌMØ LIFE','FLAGSHIP',-.12);
bannerTotem(exterior,-18.65,46.0,'MOTION','MEASURE',Math.PI/2);
bannerTotem(exterior,18.65,46.0,'ARENA','ENGAGE',-Math.PI/2);

gravelIsland(exterior,-17.25,35.4,4.25,2.85);
gravelIsland(exterior,17.25,35.4,4.25,2.85);
gravelIsland(exterior,-17.25,45.7,4.25,2.85);
gravelIsland(exterior,17.25,45.7,4.25,2.85);

[
  [-19.0,29.3],[-19.0,52.2],[19.0,29.3],[19.0,52.2],
  [-10.7,57.2],[10.7,57.2],[-10.8,23.4],[10.8,23.4]
].forEach(([x,z],i)=>shrubCluster(exterior,x,z,.72+(i%3)*.05));

[
  [-22.4,27],[-22.4,35],[-22.4,45],[-22.4,54],
  [22.4,27],[22.4,35],[22.4,45],[22.4,54]
].forEach(([x,z],i)=>tree(exterior,x,z,.55+(i%2)*.04));

box(exterior,1.05,.18,34.0,MAT.limestone,-20.8,.09,40.7,{cast:true});
box(exterior,1.05,.18,34.0,MAT.limestone,20.8,.09,40.7,{cast:true});
box(exterior,18.2,.14,.92,MAT.limestone,0,.07,23.8,{cast:true});
box(exterior,18.2,.14,.92,MAT.limestone,0,.07,57.3,{cast:true});

exteriorBench(exterior,16.1,30.3,-Math.PI/2,.80);
exteriorBench(exterior,-16.1,30.3,Math.PI/2,.80);

[
  [-14.25,5.7,25.9,1.05],[14.25,5.7,25.9,1.05],
  [-18.65,5.7,46.0,.85],[18.65,5.7,46.0,.85]
].forEach(([x,y,z,intensity])=>{
  const l=glow(exterior,0xf2cf98,intensity,6,x,y,z);living.lights.push(l);
});

// Main building — one continuous architectural object, no reception avatar.
const building=new THREE.Group();building.name='KOMO_MAIN_BUILDING_V1';world.add(building);
box(building,8.3,8.6,3.3,M.stone,-10.2,4.3,16.1,{cast:true});
box(building,8.3,8.6,3.3,M.stone,10.2,4.3,16.1,{cast:true});
box(building,4.7,6.7,.22,M.sage,-10.2,3.75,17.78);
box(building,4.7,6.7,.22,M.sage,10.2,3.75,17.78);
box(building,1.1,7.9,1.4,M.stoneLight,-5.15,4.0,16.2,{cast:true});
box(building,1.1,7.9,1.4,M.stoneLight,5.15,4.0,16.2,{cast:true});
box(building,11.4,.72,1.4,M.stoneLight,0,7.62,16.2,{cast:true});
box(building,10.0,.07,.08,M.warm,0,7.18,16.95);
box(building,10.6,.24,2.6,M.stone,0,5.55,17.7,{cast:true});
box(building,9.3,.06,2.0,M.bronze,0,5.38,18.05);
plaque(building,'KŌMØ WORLD','LONGEVITY IN MOTION',7.0,1.65,0,8.67,17.85,{dark:true,titleSize:94});

// V1.5 architectural envelope — deeper Riviera / gallery composition.
const outerFrame=new THREE.Group();outerFrame.name='KOMO_ARCHITECTURE_V15';building.add(outerFrame);
[-8.45,8.45].forEach((x,sideIndex)=>{
  const side=sideIndex?1:-1;
  box(outerFrame,.62,9.45,3.0,MAT.limestone,x,4.72,16.0,{cast:true});
  box(outerFrame,4.85,.40,3.0,MAT.limestone,side*8.0,9.18,16.0,{cast:true});
  box(outerFrame,.09,7.1,2.35,MAT.smokedGlass,side*6.76,4.20,16.36);
  [-.86,0,.86].forEach(off=>box(outerFrame,.075,7.25,.12,MAT.brass,side*6.70+off*side,4.20,17.52));
});
box(outerFrame,17.2,.46,2.85,MAT.travertine,0,9.34,15.9,{cast:true});
box(outerFrame,15.8,.055,2.10,M.warm,0,9.06,16.22);
box(outerFrame,15.7,.10,.12,MAT.brass,0,8.82,17.46);
[-5.8,-3.9,3.9,5.8].forEach(x=>box(outerFrame,.16,7.3,1.75,MAT.travertine,x,4.25,16.55,{cast:true}));
plaque(outerFrame,'KŌMØ','WORLD · LONGEVITY IN MOTION',5.6,1.25,0,8.55,17.52,{dark:true,titleSize:86});

// Side lantern volumes create an inhabited facade rather than a flat front.
[-1,1].forEach(side=>{
  const g=new THREE.Group();g.position.set(side*10.4,0,18.0);outerFrame.add(g);
  box(g,4.2,.28,5.5,MAT.limestone,0,.14,0);
  box(g,4.2,6.5,.24,M.sageDeep,side*1.75,3.35,0);
  box(g,.08,5.7,4.75,MAT.smokedGlass,-side*1.78,3.15,0);
  box(g,3.7,.18,5.0,MAT.travertine,0,6.36,0);
  glow(g,0xf2cf98,2.0,8,-side*.6,4.3,0);
});

// V1.7 facade banners — institutional, vertical and visible from the closer spawn.
fabricBanner(building,-12.65,7.55,18.55,1.22,4.65,'TWIN','UNDERSTAND',{dark:true});
fabricBanner(building,-10.75,7.55,18.75,1.22,4.65,'REHAB','ACT',{dark:false});
fabricBanner(building,10.75,7.55,18.75,1.22,4.65,'ARENA','ENGAGE',{dark:false});
fabricBanner(building,12.65,7.55,18.55,1.22,4.65,'KŌMØ LIFE','CASE 01',{dark:true});
[
  [-12.65,7.7,19.1,1.05],[-10.75,7.7,19.1,.95],
  [10.75,7.7,19.1,.95],[12.65,7.7,19.1,1.05]
].forEach(([x,y,z,intensity])=>{
  const l=glow(building,0xf2cf98,intensity,5.5,x,y,z);living.lights.push(l);
});

// Glass entrance leaves, animated by proximity.
const doorLeft=box(building,2.45,5.15,.10,M.glass,-1.27,3.05,17.35);
const doorRight=box(building,2.45,5.15,.10,M.glass,1.27,3.05,17.35);
box(building,.07,5.3,.10,M.bronze,-2.50,3.05,17.42);
box(building,.07,5.3,.10,M.bronze,2.50,3.05,17.42);

// Hall shell.
box(building,23.8,.28,46,M.stoneLight,0,.13,-7.0);
box(building,.42,8.2,46,M.wall,-11.7,4.1,-7.0,{cast:true});
box(building,.42,8.2,46,M.wall,11.7,4.1,-7.0,{cast:true});
box(building,6.7,.34,46,M.wall,-8.15,8.0,-7.0,{cast:true});
box(building,6.7,.34,46,M.wall,8.15,8.0,-7.0,{cast:true});
[-25,-17,-9,-1,7,13].forEach(z=>box(building,10.1,.09,.12,M.bronze,0,7.86,z));
[-10.9,10.9].forEach(x=>[-22,-12,-2,8].forEach(z=>box(building,.13,6.8,.18,M.bronze,x,4.1,z)));

// V1.5 interior architecture: galleries, balcony datum and layered ceiling.
const hallArchitecture=new THREE.Group();hallArchitecture.name='KOMO_HALL_ARCHITECTURE_V15';building.add(hallArchitecture);

// Continuous upper gallery lines make the Hall read as a designed volume.
[-1,1].forEach(side=>{
  box(hallArchitecture,.28,1.15,41.5,MAT.limestone,side*10.48,5.55,-6.8,{cast:true});
  box(hallArchitecture,.10,.10,41.2,MAT.brass,side*10.22,5.05,-6.8);
  box(hallArchitecture,.10,.10,41.2,MAT.brass,side*10.22,6.08,-6.8);
  for(let z=-24;z<=10;z+=5.7)box(hallArchitecture,.08,.90,.10,MAT.brass,side*10.18,5.56,z);
});

// Side bays create depth and glimpses of different programs.
architecturalBay(hallArchitecture,-9.25,6.0,-1,'LIBRARY','SCIENCE · METHOD');
architecturalBay(hallArchitecture,9.25,6.0,1,'KŌMØ LIFE','OBJECTS · CASE 01');
architecturalBay(hallArchitecture,-9.25,-8.5,-1,'MOTION','MEASURE · COMPARE');
architecturalBay(hallArchitecture,9.25,-8.5,1,'TALKS','EXPERTS · EVENTS');
architecturalBay(hallArchitecture,-9.25,-20.0,-1,'RECOVERY','RESTORE · RETURN');
architecturalBay(hallArchitecture,9.25,-20.0,1,'PERFORMANCE','TRAIN · ENGAGE');

// Floating ceiling rafts frame the central skylight without closing it.
[-18,-9,0,9].forEach((z,i)=>{
  ceilingRaft(hallArchitecture,-8.05,z,5.6,5.7);
  ceilingRaft(hallArchitecture,8.05,z,5.6,5.7);
});
// Central skylight spine.
box(hallArchitecture,9.6,.055,41.2,MAT.smokedGlass,0,7.78,-6.8);
[-22,-16,-10,-4,2,8].forEach(z=>{
  box(hallArchitecture,10.0,.12,.12,MAT.brass,0,7.70,z);
  const l=glow(hallArchitecture,0xffd9a1,.72,5,0,7.2,z);living.lights.push(l);
});

// Portal frame before destination wall adds depth at the far end.
box(hallArchitecture,.46,7.25,1.15,MAT.travertine,-10.55,3.75,-27.2,{cast:true});
box(hallArchitecture,.46,7.25,1.15,MAT.travertine,10.55,3.75,-27.2,{cast:true});
box(hallArchitecture,21.55,.50,1.15,MAT.travertine,0,7.14,-27.2,{cast:true});
box(hallArchitecture,19.9,.06,.12,M.warm,0,6.84,-26.60);

// Hall axis.
box(building,9.8,.035,43,M.stoneDeep,0,.31,-6.5);
[-4.84,4.84].forEach(x=>line(building,.05,42.6,x,-6.5,M.bronze,.35));
[-22,-12,-2,8].forEach(z=>line(building,9.6,.04,0,z,M.bronzeSoft,.35));

// Desk as architecture only.
const desk=new THREE.Group();desk.name='KOMO_DESK_V1';building.add(desk);
desk.position.set(-7.3,0,4.0);
box(desk,4.9,.20,2.2,M.stoneDeep,0,.12,0);
box(desk,4.55,.88,1.02,M.stone,0,.62,.10);
box(desk,4.2,.42,.86,M.sageDeep,0,.82,.16);
box(desk,4.75,.10,1.12,M.bronze,0,1.17,.10);
plaque(desk,'KŌMØ DESK','ORIENTATION · TRAJECTORY',3.7,.88,0,2.85,-.58,{dark:true,titleSize:74});
glow(desk,0xe9c48e,2.2,8,0,3.1,1.4);

// Minimal planting, kept out of central axis.
[[-8.3,-5.5,1],[8.3,-5.5,-1],[-8.3,-17,-1],[8.3,-17,1]].forEach(([x,z,m])=>{
  box(building,3.0,.34,1.7,M.stoneDeep,x,.18,z);
  box(building,2.6,.08,1.35,M.soil,x,.39,z);
  tree(building,x+.18*m,z,.46);
});

// Hospitality moments: enough density to feel inhabited, kept outside the main circulation line.
loungeCluster(building,-8.1,10.0,.08,.86);
loungeCluster(building,7.95,-7.7,Math.PI+.05,.82);
loungeCluster(building,-8.0,-14.2,-.05,.76);

// Motion gallery along the left wall.
motionScreen(building,-11.42,4.75,5.4,Math.PI/2,'MOTION');
motionScreen(building,-11.42,4.75,-3.3,Math.PI/2,'MUSCLE');
motionScreen(building,-11.42,4.75,-12.0,Math.PI/2,'BALANCE');

// Object gallery around the central promenade.
pedestalObject(building,-7.2,-2.0,'ring');
pedestalObject(building,7.2,-18.9,'dark');
pedestalObject(building,-7.15,-22.0,'stone');

// Suspended kinetic sculpture above the atrium.
const kinetic=new THREE.Group();kinetic.name='KOMO_KINETIC_ATRIUM';kinetic.position.set(0,5.25,-8.6);building.add(kinetic);
const kineticA=mesh(kinetic,new THREE.TorusGeometry(1.72,.045,10,72),MAT.brass,0,0,0,{cast:true});
const kineticB=mesh(kinetic,new THREE.TorusGeometry(1.18,.035,10,64),M.bronzeSoft,0,0,0,{cast:true});
const kineticC=mesh(kinetic,new THREE.TorusGeometry(.68,.026,8,56),MAT.brass,0,0,0,{cast:true});
kineticA.rotation.x=1.10;kineticB.rotation.y=.90;kineticC.rotation.set(.5,.6,.2);
mesh(kinetic,new THREE.SphereGeometry(.12,18,12),M.warm,0,0,0,{cast:true});
living.kinetic={group:kinetic,a:kineticA,b:kineticB,c:kineticC};
glow(kinetic,0xf0c98d,1.7,7,0,0,0);

// Thin architectural light shelves create depth without adding walls.
[-20,-11,-2,7].forEach((z,i)=>{
  box(building,3.8,.07,.52,M.stoneDeep,-9.3,2.15,z);
  box(building,3.8,.07,.52,M.stoneDeep,9.3,2.15,z);
  const l1=glow(building,0xf2d6ab,1.15,5,-9.3,2.35,z);
  const l2=glow(building,0xf2d6ab,1.15,5,9.3,2.35,z);
  living.lights.push(l1,l2);
});

// Living atmosphere — subtle, non-game-like movement.
const dustCount=lowPower?34:78;
const dustPositions=new Float32Array(dustCount*3);
for(let i=0;i<dustCount;i++){
  dustPositions[i*3]=(Math.random()-.5)*20;
  dustPositions[i*3+1]=.8+Math.random()*6.2;
  dustPositions[i*3+2]=-25+Math.random()*39;
}
const dustGeometry=new THREE.BufferGeometry();
dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
const dustMaterial=new THREE.PointsMaterial({color:0xf3dfbb,size:lowPower?.025:.032,transparent:true,opacity:.20,depthWrite:false});
living.dust=new THREE.Points(dustGeometry,dustMaterial);
living.dust.name='KOMO_AMBIENT_DUST';
building.add(living.dust);

// KŌMØ Life Flagship — gallery retail, open to the Hall.
const lifeStore=new THREE.Group();
lifeStore.name='KOMO_LIFE_FLAGSHIP_V15';
lifeStore.position.set(8.45,0,3.8);
building.add(lifeStore);

// Travertine portal and transparent facade.
box(lifeStore,5.65,.22,10.2,MAT.travertine,0,.11,0);
box(lifeStore,.30,6.85,10.0,MAT.limestone,2.55,3.48,0,{cast:true});
box(lifeStore,5.45,.26,10.0,MAT.travertine,0,6.68,0,{cast:true});
box(lifeStore,.08,5.95,9.35,MAT.smokedGlass,-2.40,3.25,0);
[-4.2,-1.4,1.4,4.2].forEach(z=>box(lifeStore,.075,5.80,.12,MAT.brass,-2.33,3.25,z));

// Projecting entrance arch visible from the central promenade.
box(lifeStore,.36,6.35,1.05,MAT.travertine,-2.15,3.22,-4.45,{cast:true});
box(lifeStore,3.95,.36,1.05,MAT.travertine,-.35,6.18,-4.45,{cast:true});
box(lifeStore,.08,5.35,.10,MAT.brass,-1.90,3.25,-3.92);
plaque(lifeStore,'KŌMØ LIFE','FLAGSHIP · OBJECTS · EQUIPMENT',4.25,.96,-2.25,5.62,-2.15,{rotY:Math.PI/2,dark:true,titleSize:62});

// Warm timber back wall with product niches.
box(lifeStore,4.85,5.65,.32,MAT.walnut,.10,3.10,4.62,{cast:true});
productNiche(lifeStore,-1.25,3.55,4.39,'CASE 01','EQUIPMENT',0);
productNiche(lifeStore,1.25,3.55,4.39,'LIFE','ORIGINALS',0);

// Hero Case 01 island.
const heroIsland=new THREE.Group();heroIsland.position.set(-.20,0,-.90);lifeStore.add(heroIsland);
box(heroIsland,3.20,.22,2.75,MAT.limestone,0,.12,0);
box(heroIsland,2.65,.08,2.25,MAT.brass,0,.28,0);
box(heroIsland,2.45,.52,2.05,MAT.blackened,0,.55,0);
const flagshipCase=caseObject(heroIsland,0,.83,0,1.35,true);
plaque(heroIsland,'CASE 01','CONFIGURE · COLOUR · LEATHER',2.55,.65,0,2.35,1.07,{dark:true,titleSize:48});
const caseSpot=glow(heroIsland,0xffd8a3,3.1,7,0,4.2,0);living.lights.push(caseSpot);

// Material library / configurator table.
const configTable=new THREE.Group();configTable.position.set(.45,0,1.90);lifeStore.add(configTable);
box(configTable,3.55,.18,1.20,MAT.travertine,0,.92,0,{cast:true});
box(configTable,.16,.82,.90,MAT.brass,-1.35,.48,0);
box(configTable,.16,.82,.90,MAT.brass,1.35,.48,0);
[-1.1,-.55,0,.55,1.1].forEach((x,i)=>{
  const swatchMat=[
    new THREE.MeshStandardMaterial({color:0x2d3e34,roughness:.78}),
    new THREE.MeshStandardMaterial({color:0xb3a58e,roughness:.82}),
    new THREE.MeshStandardMaterial({color:0x6f4f3d,roughness:.80}),
    new THREE.MeshStandardMaterial({color:0x24272a,roughness:.72}),
    new THREE.MeshStandardMaterial({color:0xd7d0c3,roughness:.86})
  ][i];
  box(configTable,.34,.08,.52,swatchMat,x,1.07,0);
});
plaque(configTable,'ATELIER','CONFIGURE CASE 01',2.9,.52,0,1.72,.62,{dark:false,titleSize:44});

// Fashion / objects table.
const originals=new THREE.Group();originals.position.set(.10,0,-3.30);lifeStore.add(originals);
box(originals,3.4,.16,1.45,MAT.walnut,0,.88,0,{cast:true});
box(originals,.13,.82,1.00,MAT.brass,-1.30,.46,0);
box(originals,.13,.82,1.00,MAT.brass,1.30,.46,0);
const folded=new THREE.Group();folded.position.set(-.75,1.04,0);originals.add(folded);
box(folded,1.08,.24,.72,MAT.fabric,0,.14,0,{cast:true});
box(folded,.90,.06,.58,MAT.ivory,0,.31,0);
const lifeOrbit=new THREE.Group();lifeOrbit.position.set(.78,1.36,0);originals.add(lifeOrbit);
const globe=mesh(lifeOrbit,new THREE.SphereGeometry(.28,22,16),M.sage,0,0,0,{cast:true});
const orbitA=mesh(lifeOrbit,new THREE.TorusGeometry(.52,.024,8,60),MAT.brass,0,0,0);orbitA.rotation.x=.72;
const orbitB=mesh(lifeOrbit,new THREE.TorusGeometry(.42,.020,8,54),M.bronzeSoft,0,0,0);orbitB.rotation.y=.88;

// Discreet checkout / service bar at the back.
box(lifeStore,3.70,.88,.78,M.sageDeep,.20,.47,3.65,{cast:true});
box(lifeStore,3.88,.08,.92,MAT.brass,.20,.94,3.65);
plaque(lifeStore,'LIFE','SELECT · CONFIGURE · ORDER',3.20,.58,.20,1.55,4.06,{dark:true,titleSize:50});

// Lighting hierarchy.
[
  [-1.40,5.10,-.90,2.5],
  [.95,5.10,-.90,2.2],
  [-.90,4.60,-3.20,1.7],
  [1.10,4.60,1.80,1.7],
  [0,5.20,3.70,1.5]
].forEach(([x,y,z,intensity])=>{
  const l=glow(lifeStore,0xf2cf9a,intensity,7,x,y,z);living.lights.push(l);
});

living.lifeDisplay={group:lifeStore,orbitA,orbitB,globe,flagshipCase};

// Destination wall — three monumental thresholds rather than flat doors.
box(building,22.7,7.2,.42,M.sageDeep,0,4.0,-30.0);
[-7.0,0,7.0].forEach((x,i)=>{
  box(building,.24,6.45,.78,i===1?MAT.travertine:MAT.limestone,x-2.40,3.48,-29.30,{cast:true});
  box(building,.24,6.45,.78,i===1?MAT.travertine:MAT.limestone,x+2.40,3.48,-29.30,{cast:true});
  box(building,5.05,.28,.78,i===1?MAT.travertine:MAT.limestone,x,6.58,-29.30,{cast:true});
  box(building,4.55,.055,.10,M.warm,x,6.35,-28.86);
});
box(building,21.8,.07,.10,M.bronze,0,7.05,-29.73);
const portals=[
  {x:-6.8,title:'FUNCTIONAL TWIN',sub:'UNDERSTAND',dark:true},
  {x:0,title:'REHAB',sub:'ACT',dark:false},
  {x:6.8,title:'ARENA',sub:'ENGAGE',dark:true}
];
portals.forEach(({x,title,sub,dark})=>{
  box(building,4.9,5.8,.34,dark?M.sage:M.stone,x,3.15,-29.62);
  box(building,4.15,4.65,.10,dark?M.glass:M.stoneLight,x,2.85,-29.38);
  box(building,.08,4.9,.10,M.bronze,x-2.16,2.95,-29.29);
  box(building,.08,4.9,.10,M.bronze,x+2.16,2.95,-29.29);
  plaque(building,title,sub,4.2,1.05,x,6.28,-29.25,{dark,titleSize:title==='FUNCTIONAL TWIN'?58:70});
});
plaque(building,'LIBRARY','SCIENCE · METHOD',3.5,.84,-11.45,4.3,-10,{rotY:Math.PI/2,dark:false,titleSize:68});
plaque(building,'TALKS','EXPERTS · EVENTS',3.5,.84,11.45,4.3,-10,{rotY:-Math.PI/2,dark:true,titleSize:68});
plaque(building,'KŌMØ LIFE','STORE · CASE 01',3.8,.88,11.35,4.45,2.6,{rotY:-Math.PI/2,dark:true,titleSize:62});
glow(building,0xf0cd9d,2.6,13,-8.0,5.6,6);
glow(building,0xf0cd9d,2.6,13,8.0,5.6,6);
glow(building,0xecc492,3.7,16,0,5.4,-25);

// Functional Twin room.
twinRoom.position.set(-45,0,0);
mesh(twinRoom,new THREE.CircleGeometry(13,96),M.sageDeep,0,.01,-2).rotation.x=-Math.PI/2;
mesh(twinRoom,new THREE.RingGeometry(7.8,8.0,96),M.bronze,0,.025,-2).rotation.x=-Math.PI/2;
box(twinRoom,22,7.8,.38,M.sage,0,4.0,-13.1);
plaque(twinRoom,'FUNCTIONAL TWIN','YOUR BODY · ACROSS TIME',7.8,1.55,0,7.25,-12.86,{dark:true,titleSize:84});
const body=new THREE.Group();body.position.set(0,0,-4.2);twinRoom.add(body);
mesh(body,new THREE.SphereGeometry(.40,24,18),M.twinGlass,0,4.65,0);
const torso=mesh(body,new THREE.SphereGeometry(1,28,22),M.twinGlass,0,3.25,0);torso.scale.set(.72,1.05,.42);
const pelvis=mesh(body,new THREE.SphereGeometry(1,24,18),M.twinGlass,0,2.25,0);pelvis.scale.set(.58,.43,.40);
bodySegment(body,[-.62,3.6,0],[-1.04,2.78,0],.13,M.twinGlow);
bodySegment(body,[.62,3.6,0],[1.04,2.78,0],.13,M.twinGlow);
bodySegment(body,[-1.04,2.78,0],[-1.08,2.05,.02],.10,M.twinGlow);
bodySegment(body,[1.04,2.78,0],[1.08,2.05,.02],.10,M.twinGlow);
bodySegment(body,[-.30,2.18,0],[-.34,1.18,.02],.20,M.attention);
bodySegment(body,[.30,2.18,0],[.34,1.18,.02],.20,M.twinGlow);
bodySegment(body,[-.34,1.18,.02],[-.34,.25,.04],.14,M.twinGlow);
bodySegment(body,[.34,1.18,.02],[.34,.25,.04],.14,M.twinGlow);
mesh(body,new THREE.TorusGeometry(2.5,.045,10,96),M.bronze,0,3.0,.15).rotation.x=Math.PI/2;
const scanRing=mesh(body,new THREE.RingGeometry(1.55,1.62,72),new THREE.MeshBasicMaterial({color:0xc5dbc9,transparent:true,opacity:.25,side:THREE.DoubleSide}),0,1.0,.1);
scanRing.rotation.x=-Math.PI/2;
plaque(twinRoom,'CURRENT','MOTION SCORE · MOTION AGE',4.4,1.25,-6.7,4.2,-8.0,{dark:true,titleSize:78});
plaque(twinRoom,'LONGITUDINAL','BASELINE → TODAY',4.4,1.25,6.7,4.2,-8.0,{dark:true,titleSize:74});
glow(twinRoom,0xc9d7c9,2.0,12,0,5.5,-3);

// Rehab room.
rehabRoom.position.set(0,0,-55);
box(rehabRoom,22,.24,24,M.stoneLight,0,.10,0);
box(rehabRoom,.36,7.6,24,M.wall,-10.8,3.8,0);
box(rehabRoom,.36,7.6,24,M.wall,10.8,3.8,0);
box(rehabRoom,22,7.6,.36,M.sage,0,3.8,-11.8);
plaque(rehabRoom,'REHAB','FROM INSIGHT TO ACTION',7.2,1.45,0,6.7,-11.55,{dark:true,titleSize:88});
[-5.3,0,5.3].forEach((x,i)=>{
  box(rehabRoom,4.0,.24,4.8,i===1?M.stoneDeep:M.stone,x,.12,-3.2);
  line(rehabRoom,3.5,.04,x,-3.2,M.bronze,.26);
});
plaque(rehabRoom,'01','CONTROL',3.2,.90,-5.3,4.6,-8.0,{dark:false,titleSize:74});
plaque(rehabRoom,'02','STRENGTH',3.2,.90,0,4.6,-8.0,{dark:true,titleSize:74});
plaque(rehabRoom,'03','CAPACITY',3.2,.90,5.3,4.6,-8.0,{dark:false,titleSize:74});
glow(rehabRoom,0xf0d2a7,3.5,15,0,5.4,-6);

// Arena room.
arenaRoom.position.set(45,0,0);
mesh(arenaRoom,new THREE.CircleGeometry(14.2,96),M.arena,0,.01,-2).rotation.x=-Math.PI/2;
mesh(arenaRoom,new THREE.RingGeometry(8.7,8.9,96),M.arenaGold,0,.025,-2).rotation.x=-Math.PI/2;
box(arenaRoom,22,7.8,.38,M.sageDeep,0,4.0,-13.1);
plaque(arenaRoom,'ARENA','PERFORMANCE · COMMUNITY',7.2,1.45,0,7.05,-12.85,{dark:true,titleSize:94});
[-5.2,0,5.2].forEach((x,i)=>{
  box(arenaRoom,3.7,.28,3.7,i===1?M.arenaGold:M.stoneDeep,x,.14,-4.0);
  box(arenaRoom,3.2,.16,3.2,M.arena,x,.43,-4.0);
});
plaque(arenaRoom,'BALANCE','DAILY · 60 S',3.6,.94,-5.2,4.7,-8.1,{dark:true,titleSize:68});
plaque(arenaRoom,'SQUAT 10','CONTROL',3.6,.94,0,4.7,-8.1,{dark:true,titleSize:68});
plaque(arenaRoom,'STAND UP','CAPACITY',3.6,.94,5.2,4.7,-8.1,{dark:true,titleSize:68});
glow(arenaRoom,0xe4b96f,4.8,15,0,5.5,-5);

// Runtime state.
const player=new THREE.Vector3(0,0,31.5);
const velocity=new THREE.Vector3();
let yaw=0,pitch=-.045;
let mode='world';
let currentInteraction=null;
let doorProgress=0;
let dragging=false,lastX=0,lastY=0;
let joyX=0,joyY=0,joyPointer=null;
const keys=new Set();

const interactions=[
  {id:'desk',x:-7.3,z:4.0,r:3.6,title:()=>copy[locale].deskTitle,desc:()=>copy[locale].deskCopy,action:showDesk},
  {id:'twin',x:-6.8,z:-26.7,r:4.0,title:()=>copy[locale].twinTitle,desc:()=>copy[locale].twinCopy,action:enterTwin},
  {id:'rehab',x:0,z:-26.7,r:4.0,title:()=>copy[locale].rehabTitle,desc:()=>copy[locale].rehabCopy,action:enterRehab},
  {id:'arena',x:6.8,z:-26.7,r:4.0,title:()=>copy[locale].arenaTitle,desc:()=>copy[locale].arenaCopy,action:enterArena},
  {id:'library',x:-10.7,z:-10,r:3.2,title:()=>copy[locale].libraryTitle,desc:()=>copy[locale].libraryCopy,action:showLibrary},
  {id:'talks',x:10.7,z:-10,r:3.2,title:()=>copy[locale].talksTitle,desc:()=>copy[locale].talksCopy,action:showTalks},
  {id:'life',x:8.6,z:2.6,r:3.4,title:()=>copy[locale].storeTitle,desc:()=>copy[locale].storeCopy,action:showLifeStore}
];

function notify(message){
  toastEl.textContent=message;toastEl.classList.add('show');clearTimeout(notify.t);
  notify.t=setTimeout(()=>toastEl.classList.remove('show'),1800);
}
function closePanel(){
  panel.classList.remove('open');panel.setAttribute('aria-hidden','true');panelActions.innerHTML='';
}
function openPanel(kicker,title,html,actions=[]){
  panelKicker.textContent=kicker;panelTitle.textContent=title;panelBody.innerHTML=html;panelActions.innerHTML='';
  actions.forEach(a=>{
    const b=document.createElement('button');b.type='button';b.textContent=a.label;if(a.primary)b.classList.add('primary');
    b.addEventListener('click',a.onClick);panelActions.appendChild(b);
  });
  panel.classList.add('open');panel.setAttribute('aria-hidden','false');
}
function deskHtml(){
  const s=current();
  if(locale==='fr')return `
    <p>Votre World organise votre parcours autour de trois espaces. Aucun personnage d'accueil : le Desk est simplement votre point d'orientation.</p>
    <div class="panel-grid"><div><span>01 · UNDERSTAND</span><b>Functional Twin</b></div><div><span>02 · ACT</span><b>Rehab</b></div><div><span>03 · ENGAGE</span><b>Arena</b></div><div><span>ÉTAT ACTUEL</span><b>Motion ${s.motion_score}</b></div></div>
    <div class="priority-card"><b>PROCHAINE ÉTAPE</b>Commencez par le Functional Twin pour voir votre état actuel et votre progression depuis la baseline.</div>`;
  return `
    <p>Your World is organised around three spaces. There is no reception avatar: the Desk is simply your orientation point.</p>
    <div class="panel-grid"><div><span>01 · UNDERSTAND</span><b>Functional Twin</b></div><div><span>02 · ACT</span><b>Rehab</b></div><div><span>03 · ENGAGE</span><b>Arena</b></div><div><span>CURRENT STATE</span><b>Motion ${s.motion_score}</b></div></div>
    <div class="priority-card"><b>NEXT STEP</b>Start with Functional Twin to review your current state and progression from baseline.</div>`;
}
function showDesk(){
  openPanel('KŌMØ DESK',locale==='fr'?'Votre prochaine étape.':'Your next move.',deskHtml(),[
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel},
    {label:locale==='fr'?'ALLER AU TWIN':'GO TO TWIN',primary:true,onClick:()=>{closePanel();player.set(-6.8,0,-23.0);yaw=0}}
  ]);
}
function twinHtml(){
  const s=current(),cmp=core.compare(baseline.snapshot_id,s.snapshot_id,'world-v1');
  const d=s.domains;
  return `
    <div class="metric-hero"><div><span>MOTION SCORE</span><strong>${s.motion_score}<em>/100</em></strong></div><div><span>MOTION AGE</span><strong>${s.motion_age}</strong></div></div>
    <div class="panel-grid">
      <div><span>MUSCLE</span><b>${d.muscle}</b></div><div><span>MOBILITY</span><b>${d.mobility}</b></div>
      <div><span>BALANCE</span><b>${d.balance}</b></div><div><span>POSTURE</span><b>${d.posture}</b></div>
    </div>
    <div class="priority-card"><b>${locale==='fr'?'ÉVOLUTION':'PROGRESSION'}</b>${cmp.motion_score_delta>=0?'+':''}${cmp.motion_score_delta} Motion Score · quadriceps ${baseline.metrics.quadriceps_symmetry} → ${s.metrics.quadriceps_symmetry}% · gait ${baseline.metrics.gait_speed.toFixed(2)} → ${s.metrics.gait_speed.toFixed(2)} m/s.</div>
    <div class="timeline">${core.snapshots.map((q,i)=>`<button data-time="${i}" class="${i===core.activeIndex?'active':''}">${q.label}</button>`).join('')}</div>
    <div class="data-note">${locale==='fr'?'Prototype World : les valeurs affichées ici utilisent le jeu de données de démonstration TwinCore tant que la session Pulse personnelle n’est pas reliée.':'World prototype: values shown here use the TwinCore demo dataset until the personal Pulse session is connected.'}</div>`;
}
function bindTimeline(){
  panelBody.querySelectorAll('[data-time]').forEach(btn=>btn.addEventListener('click',()=>{
    core.setTimeIndex(+btn.dataset.time,'world-v1');$('#hud-motion').textContent=current().motion_score;$('#hud-age').textContent=current().motion_age;showTwin();
  }));
}
function showTwin(){
  openPanel('FUNCTIONAL TWIN',locale==='fr'?'Votre corps à travers le temps.':'Your body across time.',twinHtml(),[
    {label:copy[locale].back,onClick:returnToHall},
    {label:copy[locale].openRehab,primary:true,onClick:enterRehab}
  ]);bindTimeline();
}
function rehabHtml(){
  const s=current();const entries=Object.entries(s.domains);entries.sort((a,b)=>a[1]-b[1]);const [lowest,val]=entries[0];
  const names={muscle:'Muscle',mobility:locale==='fr'?'Mobilité':'Mobility',balance:locale==='fr'?'Équilibre':'Balance',posture:'Posture',endurance:'Endurance'};
  return `
    <p>${locale==='fr'?'Rehab transforme les signaux du Twin en actions simples et suivies. Il ne s’agit pas ici d’une prescription médicale autonome.':'Rehab turns Twin signals into simple, trackable actions. This is not an autonomous medical prescription.'}</p>
    <div class="priority-card"><b>${locale==='fr'?'PRIORITÉ FONCTIONNELLE':'FUNCTIONAL PRIORITY'}</b>${names[lowest]} · ${val}/100</div>
    <div class="panel-grid"><div><span>01</span><b>${locale==='fr'?'Contrôle':'Control'}</b></div><div><span>02</span><b>${locale==='fr'?'Force':'Strength'}</b></div><div><span>03</span><b>${locale==='fr'?'Capacité':'Capacity'}</b></div><div><span>FOLLOW-UP</span><b>${s.metrics.rehab_adherence}%</b></div></div>
    <div class="data-note">${locale==='fr'?'Les recommandations finales doivent rester cohérentes avec le contexte utilisateur et, lorsque nécessaire, avec un professionnel de santé.':'Final recommendations should remain consistent with user context and, when needed, a healthcare professional.'}</div>`;
}
function showRehab(){
  openPanel('REHAB',locale==='fr'?'De l’insight à l’action.':'From insight to action.',rehabHtml(),[
    {label:copy[locale].back,onClick:returnToHall},
    {label:locale==='fr'?'VOIR LE TWIN':'VIEW TWIN',primary:true,onClick:enterTwin}
  ]);
}
function arenaHtml(){
  return `
    <p>${locale==='fr'?'Arena est la couche d’engagement : challenges fonctionnels, progression et communauté. Les données de santé ne sont jamais classées.':'Arena is the engagement layer: functional challenges, progression and community. Health data is never ranked.'}</p>
    <div class="panel-grid"><div><span>CHALLENGE 01</span><b>Balance Hold · 60 s</b></div><div><span>CHALLENGE 02</span><b>Squat 10</b></div><div><span>CHALLENGE 03</span><b>Stand Up</b></div><div><span>SEASON</span><b>01 · Riviera</b></div></div>
    <div class="priority-card"><b>FAIR PLAY</b>${locale==='fr'?'Seul le score du challenge peut alimenter un classement. Motion Score, Motion Age et métriques personnelles restent privés.':'Only challenge scores may feed a leaderboard. Motion Score, Motion Age and personal metrics remain private.'}</div>`;
}
function showArena(){
  openPanel('ARENA',locale==='fr'?'Performance · progression · communauté.':'Performance · progression · community.',arenaHtml(),[
    {label:copy[locale].back,onClick:returnToHall},
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel}
  ]);
}
function showLibrary(){
  const html=locale==='fr'
    ?'<p>La Library rassemble la méthode KŌMØ, les sources, la littérature et la provenance des mesures utilisées dans votre parcours.</p><div class="panel-grid"><div><span>SOURCES</span><b>Mesuré</b></div><div><span>METHOD</span><b>Traçable</b></div><div><span>TIME</span><b>Longitudinal</b></div><div><span>DATA</span><b>Privé</b></div></div>'
    :'<p>Library brings together KŌMØ methodology, sources, literature and measurement provenance used across your journey.</p><div class="panel-grid"><div><span>SOURCES</span><b>Measured</b></div><div><span>METHOD</span><b>Traceable</b></div><div><span>TIME</span><b>Longitudinal</b></div><div><span>DATA</span><b>Private</b></div></div>';
  openPanel('LIBRARY',locale==='fr'?'Science & méthode.':'Science & method.',html,[{label:copy[locale].close,onClick:closePanel}]);
}
function showTalks(){
  const html=locale==='fr'
    ?'<p>Talks accueille les conférences, experts et événements KŌMØ. Cet espace sera connecté aux contenus de la plateforme.</p>'
    :'<p>Talks hosts KŌMØ conferences, experts and events. This space will connect to platform content.</p>';
  openPanel('TALKS',locale==='fr'?'Experts & événements.':'Experts & events.',html,[{label:copy[locale].close,onClick:closePanel}]);
}

function showLifeStore(){
  const html=locale==='fr'
    ?`<p>KŌMØ Life prolonge World dans le réel : objets, équipements et éditions conçus autour du mouvement et de la longévité.</p>
      <div class="store-products">
        <article><span>01 · EQUIPMENT</span><b>KŌMØ Case 01</b><small>La valise KŌMØ configurable, présentée ici comme objet signature.</small></article>
        <article><span>02 · ORIGINALS</span><b>KŌMØ Life</b><small>Pièces, objets et culture du mouvement.</small></article>
        <article><span>03 · EDITIONS</span><b>Selected drops</b><small>Collaborations et séries limitées à venir.</small></article>
      </div>`
    :`<p>KŌMØ Life extends World into real life: objects, equipment and editions designed around movement and longevity.</p>
      <div class="store-products">
        <article><span>01 · EQUIPMENT</span><b>KŌMØ Case 01</b><small>The configurable KŌMØ case, presented here as a signature object.</small></article>
        <article><span>02 · ORIGINALS</span><b>KŌMØ Life</b><small>Pieces, objects and movement culture.</small></article>
        <article><span>03 · EDITIONS</span><b>Selected drops</b><small>Collaborations and limited editions to come.</small></article>
      </div>`;
  openPanel('KŌMØ LIFE',locale==='fr'?'La boutique du World.':'The World store.',html,[
    {label:copy[locale].openLife,onClick:()=>{location.href='https://life.komolongevity.com/'}},
    {label:copy[locale].configureCase,primary:true,onClick:()=>{location.href='https://life.komolongevity.com/#case-atelier'}}
  ]);
}

function setMode(next){
  mode=next;world.visible=next==='world';twinRoom.visible=next==='twin';rehabRoom.visible=next==='rehab';arenaRoom.visible=next==='arena';
}
function enterTwin(){
  setMode('twin');player.set(-45,0,8.7);velocity.set(0,0,0);yaw=0;pitch=-.03;showTwin();locationName.textContent='FUNCTIONAL TWIN';
}
function enterRehab(){
  setMode('rehab');player.set(0,0,-44.5);velocity.set(0,0,0);yaw=0;pitch=-.03;showRehab();locationName.textContent='REHAB';
}
function enterArena(){
  setMode('arena');player.set(45,0,8.8);velocity.set(0,0,0);yaw=0;pitch=-.03;showArena();locationName.textContent='ARENA';
}
function returnToHall(){
  setMode('world');player.set(0,0,-22.5);velocity.set(0,0,0);yaw=0;pitch=-.03;closePanel();updateLocation();notify(locale==='fr'?'KŌMØ HALL':'KŌMØ HALL');
}

function canMove(p){
  if(mode==='world'){
    if(p.z>63||p.z<-28.6||Math.abs(p.x)>20)return false;
    if(p.z<16.5&&Math.abs(p.x)>11.15)return false;
    if(p.z>=14.1&&p.z<=18.8&&Math.abs(p.x)>4.35)return false;
    if(p.x>-10.1&&p.x<-4.7&&p.z>1.9&&p.z<6.1)return false;
    return true;
  }
  if(mode==='twin')return p.x>-56&&p.x<-34&&p.z>-12&&p.z<11;
  if(mode==='arena')return p.x>34&&p.x<56&&p.z>-12&&p.z<11;
  if(mode==='rehab')return p.x>-10&&p.x<10&&p.z>-66&&p.z<-43;
  return true;
}
function tryMove(dx,dz){
  const n=player.clone();n.x+=dx;n.z+=dz;if(canMove(n)){player.copy(n);return}
  const nx=player.clone();nx.x+=dx;if(canMove(nx)){player.copy(nx);return}
  const nz=player.clone();nz.z+=dz;if(canMove(nz))player.copy(nz);
}

function updateMovement(dt){
  let x=0,z=0;
  if(keys.has('KeyW')||keys.has('KeyZ')||keys.has('ArrowUp'))z+=1;
  if(keys.has('KeyS')||keys.has('ArrowDown'))z-=1;
  if(keys.has('KeyD')||keys.has('ArrowRight'))x+=1;
  if(keys.has('KeyA')||keys.has('KeyQ')||keys.has('ArrowLeft'))x-=1;
  x+=joyX;z+=-joyY;
  const input=new THREE.Vector2(x,z);
  const sprint=keys.has('ShiftLeft')||keys.has('ShiftRight');
  const speed=sprint?5.6:3.45;
  const target=new THREE.Vector3();
  if(input.lengthSq()>.002){
    input.normalize();
    const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
    const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    target.addScaledVector(right,input.x).addScaledVector(forward,input.y).normalize().multiplyScalar(speed);
  }
  velocity.lerp(target,1-Math.exp(-(input.lengthSq()>.002?10:7)*dt));
  if(velocity.lengthSq()>.0004)tryMove(velocity.x*dt,velocity.z*dt);
}
function updateCamera(now){
  const move=Math.min(1,velocity.length()/3.45);
  const bob=move*Math.sin(now*.0105)*.012;
  camera.position.set(player.x,1.72+bob,player.z);
  const cp=Math.cos(pitch),sp=Math.sin(pitch);
  const look=18;
  camera.lookAt(player.x-Math.sin(yaw)*cp*look,1.72+sp*look,player.z-Math.cos(yaw)*cp*look);
}
function updateDoors(){
  const target=mode==='world'&&player.z<26&&player.z>8&&Math.abs(player.x)<5?1:0;
  doorProgress+=(target-doorProgress)*.10;
  doorLeft.position.x=THREE.MathUtils.lerp(-1.27,-3.05,doorProgress);
  doorRight.position.x=THREE.MathUtils.lerp(1.27,3.05,doorProgress);
}
function updateLocation(){
  if(mode==='twin'){locationName.textContent='FUNCTIONAL TWIN';return}
  if(mode==='rehab'){locationName.textContent='REHAB';return}
  if(mode==='arena'){locationName.textContent='ARENA';return}
  if(player.z>23)locationName.textContent='ARRIVAL PLAZA';
  else if(player.x>6.8&&player.z>-2&&player.z<7)locationName.textContent='KŌMØ LIFE';
  else if(player.z>-7)locationName.textContent='KŌMØ HALL';
  else locationName.textContent='MOTION ATRIUM';
}
function updateHeading(){
  const a=((yaw%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  const dirs=['N','NE','E','SE','S','SW','W','NW'];
  headingEl.textContent=dirs[Math.round(a/(Math.PI/4))%8];
}
function updateInteraction(){
  if(mode!=='world'){currentInteraction=null;interactionEl.classList.remove('show');return}
  let best=null,bestD=Infinity;
  for(const it of interactions){
    const d=Math.hypot(player.x-it.x,player.z-it.z);
    if(d<it.r&&d<bestD){best=it;bestD=d}
  }
  if(best!==currentInteraction){
    currentInteraction=best;
    if(best){interactionTitle.textContent=best.title();interactionCopy.textContent=best.desc();interactionEl.classList.add('show')}
    else interactionEl.classList.remove('show');
  }else if(best){
    interactionTitle.textContent=best.title();interactionCopy.textContent=best.desc();
  }
}
function triggerAction(){currentInteraction?.action?.()}
function updateTwinScan(now){
  if(mode!=='twin')return;
  scanRing.position.y=.85+(Math.sin(now*.0012)*.5+.5)*3.7;
  scanRing.material.opacity=.16+(Math.sin(now*.0012)*.5+.5)*.18;
}

window.addEventListener('keydown',e=>{
  if(['KeyW','KeyA','KeyS','KeyD','KeyZ','KeyQ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){keys.add(e.code);e.preventDefault()}
  if(e.code==='KeyE'){triggerAction();e.preventDefault()}
  if(e.code==='Escape'){if(mode!=='world')returnToHall();else closePanel()}
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>keys.clear());

canvas.addEventListener('pointerdown',e=>{
  if(coarse&&e.clientX<innerWidth*.42)return;
  dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{
  if(!dragging)return;
  const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
  yaw-=dx*(coarse ? .0040 : .0032);pitch=THREE.MathUtils.clamp(pitch-dy*(coarse ? .0032 : .0025),-.46,.46);
});
const endLook=e=>{dragging=false;try{canvas.releasePointerCapture?.(e.pointerId)}catch{}};
canvas.addEventListener('pointerup',endLook);canvas.addEventListener('pointercancel',endLook);

function updateJoystick(e){
  const r=joystickZone.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  let dx=e.clientX-cx,dy=e.clientY-cy;const max=42,len=Math.hypot(dx,dy)||1;
  if(len>max){dx=dx/len*max;dy=dy/len*max}
  joyX=dx/max;joyY=dy/max;joystickStick.style.transform=`translate(${dx}px,${dy}px)`;
}
joystickZone.addEventListener('pointerdown',e=>{e.stopPropagation();joyPointer=e.pointerId;joystickZone.setPointerCapture?.(e.pointerId);updateJoystick(e)});
joystickZone.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)updateJoystick(e)});
function resetJoy(e){if(joyPointer!==null&&e.pointerId!==joyPointer)return;joyPointer=null;joyX=joyY=0;joystickStick.style.transform='translate(0,0)'}
joystickZone.addEventListener('pointerup',resetJoy);joystickZone.addEventListener('pointercancel',resetJoy);
mobileAction.addEventListener('click',triggerAction);

$('#intro-enter').addEventListener('click',()=>{intro.classList.add('hidden');notify(locale==='fr'?'Bienvenue dans KŌMØ World':'Welcome to KŌMØ World')});
$('#panel-close').addEventListener('click',closePanel);

function applyLocale(){
  document.documentElement.lang=locale;
  const c=copy[locale];
  $('#hud-today').textContent=c.today;
  $('.intro-kicker').textContent=c.introKicker;
  $('#intro-title').innerHTML=`<span>${c.intro1}</span><em>${c.intro2}</em>`;
  intro.querySelector('p').textContent=c.introBody;
  $('#intro-enter').textContent=c.introButton;
  mobileAction.textContent=c.action;
  languageToggle.textContent=locale==='fr'?'EN':'FR';
  if(currentInteraction){interactionTitle.textContent=currentInteraction.title();interactionCopy.textContent=currentInteraction.desc()}
  if(panel.classList.contains('open')){
    if(mode==='twin')showTwin();else if(mode==='rehab')showRehab();else if(mode==='arena')showArena();
  }
}
languageToggle.addEventListener('click',()=>{locale=locale==='fr'?'en':'fr';applyLocale()});

window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,lowPower?1.45:1.8));
  renderer.setSize(innerWidth,innerHeight,false);
});

let last=performance.now(),raf=0;
function animateLiving(now){
  const t=now*.001;
  living.trees.forEach((tree,i)=>{
    const sway=Math.sin(t*.42+tree.userData.swayPhase+i*.17);
    tree.rotation.z=sway*.008;tree.rotation.x=Math.cos(t*.36+tree.userData.swayPhase)*.004;
  });
  living.shimmers.forEach((q,i)=>{
    const travel=((t*.045+q.userData.phase)%1);
    q.position.z=25.5+travel*29.0;
    q.material.opacity=.045+.045*(.5+.5*Math.sin(t*.7+i));
  });
  if(living.dust){
    living.dust.rotation.y=Math.sin(t*.04)*.035;
    living.dust.position.y=Math.sin(t*.18)*.04;
    living.dust.material.opacity=.14+.06*(.5+.5*Math.sin(t*.23));
  }
  if(living.lifeDisplay){
    living.lifeDisplay.orbitA.rotation.z=t*.16;
    living.lifeDisplay.orbitB.rotation.x=t*.11;
    living.lifeDisplay.globe.rotation.y=t*.10;
    if(living.lifeDisplay.flagshipCase)living.lifeDisplay.flagshipCase.rotation.y=Math.sin(t*.18)*.08;
  }
  if(living.kinetic){
    living.kinetic.a.rotation.z=t*.055;
    living.kinetic.b.rotation.x=t*.041;
    living.kinetic.c.rotation.y=t*.073;
    living.kinetic.group.position.y=5.25+Math.sin(t*.32)*.045;
  }
  if(living.exteriorSculptures?.length){
    living.exteriorSculptures.forEach((sculpture,i)=>{
      sculpture.a.rotation.z=t*.045+i*.32;
      sculpture.b.rotation.x=t*.038+i*.21;
      sculpture.core.position.y=Math.sin(t*.42+i)*.025;
    });
  }
  if(living.banners?.length){
    living.banners.forEach((banner,i)=>{
      const pos=banner.geometry.attributes.position,arr=pos.array,base=banner.userData.base,h=banner.userData.height||4;
      for(let k=0;k<arr.length;k+=3){
        const bx=base[k],by=base[k+1],bz=base[k+2];
        const slack=THREE.MathUtils.clamp((h/2-by)/h,0,1);
        const wave=Math.sin(t*1.12+by*1.38+i*.61+banner.userData.phase)*.045*slack
          +Math.sin(t*1.73+bx*3.1+i*.27)*.015*slack;
        arr[k]=bx+wave*.12;arr[k+1]=by;arr[k+2]=bz+wave;
      }
      pos.needsUpdate=true;
    });
  }
    if(!lowPower&&Math.floor(t*8)%2===0)living.motionScreens.forEach(screen=>drawMotionScreen(screen,t));
  sun.position.x=-24+Math.sin(t*.025)*3.5;
}
let livingAnimationFailed=false;
function animate(now){
  const dt=Math.min(.05,(now-last)/1000||.016);last=now;
  updateMovement(dt);
  updateCamera(now);
  updateDoors();
  updateLocation();
  updateHeading();
  updateInteraction();
  updateTwinScan(now);
  if(!livingAnimationFailed){
    try{animateLiving(now)}
    catch(err){livingAnimationFailed=true;console.warn('[KŌMØ World] living animation disabled after runtime error',err)}
  }
  renderer.render(scene,camera);
  raf=requestAnimationFrame(animate);
}
raf=requestAnimationFrame(animate);
document.addEventListener('visibilitychange',()=>{if(document.hidden){velocity.set(0,0,0);keys.clear()}});
window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);clearInterval(daylightTimer)},{once:true});

applyLocale();
setTimeout(()=>loader.classList.add('hidden'),380);
setTimeout(()=>loader.remove(),1050);
window.KomoWorld={
  version:'1.7.0-banners-landscape',
  THREE,scene,camera,renderer,core,
  enterTwin,enterRehab,enterArena,returnToHall,
  getState:()=>({position:player.clone(),yaw,mode}),
  getLocale:()=>locale,
  notify
};
import('./world-multiplayer-v1.js')
  .then(mod=>mod.mount?.(window.KomoWorld))
  .catch(err=>console.warn('[KŌMØ World multiplayer] optional layer unavailable',err));

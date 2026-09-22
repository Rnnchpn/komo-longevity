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
const worldMenu=$('#world-menu');
const worldMenuToggle=$('#world-menu-toggle');
const worldMenuClose=$('#world-menu-close');
const worldReticle=$('#world-reticle');
const travelFade=$('#travel-fade');
const qualityStatus=$('#quality-status');
const fpsStatus=$('#fps-status');
const qualityToggle=$('#quality-toggle');
const resetPosition=$('#reset-position');
const cameraToggle=$('#camera-toggle');
const journeyHud=$('#journey-hud');
const journeyLevelEl=$('#journey-level');
const journeyTitleEl=$('#journey-title');
const journeyProgressEl=$('#journey-progress');
const journeyNextEl=$('#journey-next');
const journeyXpEl=$('#journey-xp');
const journeyMenuLevel=$('#journey-menu-level');
const journeyMenuXp=$('#journey-menu-xp');
const journeyMenuProgress=$('#journey-menu-progress');
const journeyMenuNext=$('#journey-menu-next');
const journeyMissionsEl=$('#journey-missions');
const journeyLevelLadder=$('#journey-level-ladder');
const journeyBadgesEl=$('#journey-badges');
const guideToggle=$('#guide-toggle');
const healthHud=$('#health-hud');
const healthStatusEl=$('#health-status');
const healthMuscleEl=$('#health-muscle');
const healthBalanceEl=$('#health-balance');
const healthCapacityEl=$('#health-capacity');
const healthSourceEl=$('#health-source');
const avatarToggle=$('#avatar-toggle');
const challengesToggle=$('#challenges-toggle');

const coarse=window.matchMedia?.('(pointer:coarse)')?.matches||false;
const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||((navigator.platform==='MacIntel')&&(navigator.maxTouchPoints>1));
const lowPower=coarse||isiOS;
const deviceDpr=Math.max(1,window.devicePixelRatio||1);
const retinaMobile=lowPower&&deviceDpr>=2;
document.documentElement.classList.toggle('low-power',lowPower);
document.documentElement.classList.toggle('retina-mobile',retinaMobile);

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
    rehabTitle:'Entrer dans KŌMØ Fitness Club',rehabCopy:'Choisir une activité · programme quotidien · coach',
    arenaTitle:'Entrer dans Arena',arenaCopy:'Performance · défis · communauté',
    libraryTitle:'Ouvrir la Library',libraryCopy:'Science · méthode · provenance',
    talksTitle:'Voir Talks',talksCopy:'Experts · événements · contenus',
    storeTitle:'Entrer dans KŌMØ Life',storeCopy:'Objets · Case 01 · éditions',
    back:'RETOUR AU HALL',close:'FERMER',openRehab:'OUVRIR FITNESS CLUB',openLife:'OUVRIR KŌMØ LIFE',configureCase:'CONFIGURER CASE 01'
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
    rehabTitle:'Enter KŌMØ Fitness Club',rehabCopy:'Choose an activity · daily program · coach',
    arenaTitle:'Enter Arena',arenaCopy:'Performance · challenges · community',
    libraryTitle:'Open Library',libraryCopy:'Science · method · provenance',
    talksTitle:'View Talks',talksCopy:'Experts · events · content',
    storeTitle:'Enter KŌMØ Life',storeCopy:'Objects · Case 01 · editions',
    back:'BACK TO HALL',close:'CLOSE',openRehab:'OPEN FITNESS CLUB',openLife:'OPEN KŌMØ LIFE',configureCase:'CONFIGURE CASE 01'
  }
};
let locale='fr';

const current=()=>core.current();
$('#hud-motion').textContent=current().motion_score;
$('#hud-age').textContent=current().motion_age;

const renderer=new THREE.WebGLRenderer({canvas,antialias:!lowPower,powerPreference:'high-performance',precision:lowPower?'mediump':'highp',stencil:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,lowPower?1.45:1.8));
renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.92;
renderer.shadowMap.enabled=false;
renderer.shadowMap.autoUpdate=false;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
let qualityMode=lowPower?'auto':'auto';
let renderScale=lowPower?(retinaMobile?1.02:.86):1.15;
let fpsEMA=60,lastPerfSample=performance.now(),perfFrames=0;
let emergencyPerformance=false;
let lastBudgetUpdate=0,lastVisibilityUpdate=0,lastUiUpdate=0,lastDecorUpdate=0,lastRoomFxUpdate=0;
let activeLightBudget=0;
function maxPixelRatio(){
  if(qualityMode==='performance')return lowPower?(retinaMobile?.82:.74):.90;
  if(qualityMode==='high')return lowPower?(retinaMobile?1.16:.98):1.55;
  return lowPower?(retinaMobile?1.10:.90):1.25;
}
function applyRenderScale(){
  const ratio=Math.min(window.devicePixelRatio||1,renderScale,maxPixelRatio());
  renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight,false);
  if(qualityStatus)qualityStatus.textContent=(qualityMode==='auto'?'AUTO':qualityMode.toUpperCase())+' · '+ratio.toFixed(2)+'×';
}
function applyQualityProfile(){
  // Shadows are the most expensive duplicate draw pass: HIGH only.
  const shadows=qualityMode==='high'&&!lowPower&&!emergencyPerformance;
  renderer.shadowMap.enabled=shadows;
  if(shadows){
    sun.shadow.mapSize.set(1024,1024);
    renderer.shadowMap.needsUpdate=true;
  }
  fill.intensity=qualityMode==='high'&&!lowPower?1.0:0;
  activeLightBudget=emergencyPerformance||lowPower?0:(qualityMode==='high'?6:qualityMode==='performance'?2:4);
  living.lights.forEach(l=>{if(l){l.visible=false;l.intensity=0}});
  applyRenderScale();
}
applyRenderScale();

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xcbd2c8);
scene.fog=new THREE.Fog(0xcbd2c8,82,215);

const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.12,260);
camera.position.set(0,1.72,58);

const hemi=new THREE.HemisphereLight(0xe5eadf,0x596354,2.25);
scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe5bd,3.3);
sun.position.set(-24,38,32);
sun.castShadow=true;
if(sun.castShadow){
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-45;
  sun.shadow.camera.near=1;sun.shadow.camera.far=110;sun.shadow.bias=-.00025;
}
scene.add(sun);
const fill=new THREE.DirectionalLight(0xdde8de,lowPower?0:1.1);
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
  skyDome:null,
  skyUniforms:null,
  sunSprite:null,
  clouds:[],
  npcs:[],
  destinationDoors:[],
  fountainJets:[],
  district:null,
  daylight:'day'
};

// V1.8 true sky — atmospheric dome, visible sun and slow cloud field.
const skyUniforms={
  topColor:{value:new THREE.Color(0x6f9fbd)},
  horizonColor:{value:new THREE.Color(0xdce7e3)},
  lowColor:{value:new THREE.Color(0xf2e2c8)},
  sunDir:{value:new THREE.Vector3(-.45,.58,.42).normalize()},
  sunColor:{value:new THREE.Color(0xffddb0)},
  sunStrength:{value:.72}
};
const skyMaterial=new THREE.ShaderMaterial({
  uniforms:skyUniforms,
  side:THREE.BackSide,
  depthWrite:false,
  depthTest:false,
  vertexShader:`
    varying vec3 vWorldPosition;
    void main(){
      vec4 worldPosition=modelMatrix*vec4(position,1.0);
      vWorldPosition=worldPosition.xyz;
      gl_Position=projectionMatrix*viewMatrix*worldPosition;
    }
  `,
  fragmentShader:`
    varying vec3 vWorldPosition;
    uniform vec3 topColor;
    uniform vec3 horizonColor;
    uniform vec3 lowColor;
    uniform vec3 sunDir;
    uniform vec3 sunColor;
    uniform float sunStrength;
    void main(){
      vec3 dir=normalize(vWorldPosition-cameraPosition);
      float y=clamp(dir.y,-1.0,1.0);
      float up=smoothstep(-0.02,.72,y);
      vec3 base=mix(horizonColor,topColor,up);
      float low=smoothstep(.16,-.28,y);
      base=mix(base,lowColor,low*.64);
      float sunCore=pow(max(dot(dir,normalize(sunDir)),0.0),850.0);
      float sunGlow=pow(max(dot(dir,normalize(sunDir)),0.0),34.0);
      base+=sunColor*(sunCore*1.55+sunGlow*.18)*sunStrength;
      gl_FragColor=vec4(base,1.0);
    }
  `
});
const skyDome=new THREE.Mesh(new THREE.SphereGeometry(300,lowPower?24:48,lowPower?12:28),skyMaterial);
skyDome.name='KOMO_TRUE_SKY_V18';skyDome.renderOrder=-1000;scene.add(skyDome);
living.skyDome=skyDome;living.skyUniforms=skyUniforms;

function makeCloudTexture(){
  const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');
  x.clearRect(0,0,c.width,c.height);
  const blobs=[[.20,.55,.22],[.36,.43,.28],[.52,.50,.31],[.68,.43,.25],[.80,.57,.18]];
  blobs.forEach(([px,py,r],i)=>{
    const gx=px*c.width,gy=py*c.height,rr=r*c.width;
    const g=x.createRadialGradient(gx,gy,0,gx,gy,rr);
    g.addColorStop(0,'rgba(255,255,255,.72)');g.addColorStop(.48,'rgba(255,255,255,.38)');g.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=g;x.fillRect(0,0,c.width,c.height);
  });
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;return tx;
}
const cloudTexture=makeCloudTexture();
const cloudGroup=new THREE.Group();cloudGroup.name='KOMO_CLOUD_FIELD_V18';scene.add(cloudGroup);
const cloudCount=lowPower?2:9;
for(let i=0;i<cloudCount;i++){
  const mat=new THREE.MeshBasicMaterial({map:cloudTexture,transparent:true,opacity:lowPower?.10:.14,depthWrite:false,side:THREE.DoubleSide});
  const cloud=new THREE.Mesh(new THREE.PlaneGeometry(34+(i%3)*8,13+(i%2)*4),mat);
  cloud.rotation.x=-Math.PI/2;
  cloud.position.set(-85+i*22,42+(i%3)*4,-68+(i%4)*38);
  cloud.userData.baseX=cloud.position.x;cloud.userData.speed=.34+(i%4)*.07;cloud.userData.phase=i*.83;
  cloudGroup.add(cloud);living.clouds.push(cloud);
}
const sunCanvas=document.createElement('canvas');sunCanvas.width=sunCanvas.height=256;
const sunCtx=sunCanvas.getContext('2d');
const sunGrad=sunCtx.createRadialGradient(128,128,8,128,128,124);
sunGrad.addColorStop(0,'rgba(255,248,220,1)');sunGrad.addColorStop(.16,'rgba(255,224,165,.95)');
sunGrad.addColorStop(.50,'rgba(255,204,130,.24)');sunGrad.addColorStop(1,'rgba(255,204,130,0)');
sunCtx.fillStyle=sunGrad;sunCtx.fillRect(0,0,256,256);
const sunTx=new THREE.CanvasTexture(sunCanvas);sunTx.colorSpace=THREE.SRGBColorSpace;
const sunSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:sunTx,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.90}));
sunSprite.scale.set(lowPower?38:44,lowPower?38:44,1);sunSprite.name='KOMO_SKY_SUN_V18';scene.add(sunSprite);living.sunSprite=sunSprite;

function applyDaylight(){
  const d=new Date(),h=d.getHours()+d.getMinutes()/60;
  let bg=0xdce7e3,fog=0xd7e1dc,sunColor=0xffe5bd,sunPower=3.3,hemiPower=2.25,exposure=.94,state='day';
  let top=0x6f9fbd,horizon=0xdce7e3,low=0xf2e2c8,skySun=0xffddb0,skyStrength=.72;
  if(h<7||h>=21){
    bg=0x71818a;fog=0x89938f;sunColor=0xd9c9bb;sunPower=1.25;hemiPower=1.32;exposure=.72;state='evening';
    top=0x405865;horizon=0x87908d;low=0xaa8068;skySun=0xe2c5ae;skyStrength=.10;
  }else if(h<9){
    bg=0xd9ded7;fog=0xd5d9d1;sunColor=0xffca8e;sunPower=2.65;hemiPower=1.95;exposure=.89;state='morning';
    top=0x7fa8bd;horizon=0xe7d8c7;low=0xf2b77b;skySun=0xffc27e;skyStrength=.88;
  }else if(h>=17.5){
    bg=0xd8d3c6;fog=0xd2cbbd;sunColor=0xffbd75;sunPower=2.85;hemiPower=1.82;exposure=.87;state='golden';
    top=0x8098a7;horizon=0xe5ccb0;low=0xee9f66;skySun=0xffb66a;skyStrength=1.0;
  }
  scene.background.setHex(bg);scene.fog.color.setHex(fog);scene.fog.near=82;scene.fog.far=215;
  sun.color.setHex(sunColor);sun.intensity=sunPower;hemi.intensity=hemiPower;renderer.toneMappingExposure=exposure;living.daylight=state;
  if(renderer.shadowMap.enabled)renderer.shadowMap.needsUpdate=true;
  const dayT=THREE.MathUtils.clamp((h-6)/15,0,1);
  const arc=Math.PI*dayT;
  const dir=new THREE.Vector3(-Math.cos(arc)*.82,Math.max(.08,Math.sin(arc)*.88),.42).normalize();
  skyUniforms.topColor.value.setHex(top);skyUniforms.horizonColor.value.setHex(horizon);skyUniforms.lowColor.value.setHex(low);
  skyUniforms.sunDir.value.copy(dir);skyUniforms.sunColor.value.setHex(skySun);skyUniforms.sunStrength.value=skyStrength;
  sun.position.set(dir.x*48,Math.max(16,dir.y*56),dir.z*48);
  if(living.sunSprite){living.sunSprite.material.opacity=state==='evening'?.28:.88}
}applyDaylight();
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
  water:lowPower?new THREE.MeshStandardMaterial({color:0x87a39a,roughness:.38,metalness:.02,transparent:true,opacity:.64,depthWrite:true}):new THREE.MeshPhysicalMaterial({color:0x87a39a,roughness:.12,metalness:0,transparent:true,opacity:.56,transmission:.12,depthWrite:true}),
  glass:lowPower?new THREE.MeshStandardMaterial({color:0x9fb0a7,roughness:.30,metalness:.03,transparent:true,opacity:.30,depthWrite:false}):new THREE.MeshPhysicalMaterial({color:0xbdccc3,roughness:.12,metalness:0,transparent:true,opacity:.27,transmission:.42,depthWrite:false}),
  warm:new THREE.MeshStandardMaterial({color:0xf0cc96,roughness:.34,metalness:.03,emissive:0xa36d35,emissiveIntensity:.45}),
  twinGlass:lowPower?new THREE.MeshStandardMaterial({color:0x8fa494,roughness:.34,metalness:.03,transparent:true,opacity:.52,depthWrite:false}):new THREE.MeshPhysicalMaterial({color:0x9bb6a3,roughness:.18,metalness:.02,transparent:true,opacity:.48,transmission:.12,depthWrite:false}),
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
  smokedGlass:lowPower?new THREE.MeshStandardMaterial({color:0x64766b,roughness:.34,metalness:.04,transparent:true,opacity:.29,depthWrite:false}):new THREE.MeshPhysicalMaterial({color:0x718177,roughness:.17,metalness:.02,transparent:true,opacity:.24,transmission:.28,depthWrite:false}),
  limestone:new THREE.MeshStandardMaterial({color:0xdccfba,roughness:.90,metalness:0}),
  travertine:new THREE.MeshStandardMaterial({color:0xe5d8c5,roughness:.84,metalness:.01}),
  blackened:new THREE.MeshStandardMaterial({color:0x151d18,roughness:.48,metalness:.10})
};

function makeStoneTexture(base='#ddd1bf',vein='#b9aa94',joint='#8f806d',seed=1){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.fillStyle=base;x.fillRect(0,0,512,512);
  // large slab joints
  x.strokeStyle=joint;x.globalAlpha=.20;x.lineWidth=2;
  [0,256,512].forEach(v=>{x.beginPath();x.moveTo(v,0);x.lineTo(v,512);x.stroke();x.beginPath();x.moveTo(0,v);x.lineTo(512,v);x.stroke()});
  x.globalAlpha=1;
  // deterministic travertine-like veins
  for(let i=0;i<22;i++){
    const yy=(i*23+seed*17)%512;
    x.strokeStyle=i%4===0?'rgba(117,101,82,.14)':'rgba(255,255,255,.12)';
    x.lineWidth=i%5===0?2.2:1.1;x.beginPath();
    for(let px=0;px<=512;px+=16){
      const py=yy+Math.sin(px*.021+i*1.73+seed)*5+Math.sin(px*.008+i)*3;
      if(px===0)x.moveTo(px,py);else x.lineTo(px,py);
    }
    x.stroke();
  }
  // mineral speckle
  for(let i=0;i<150;i++){
    const px=(i*83+seed*37)%512,py=(i*151+seed*53)%512;
    x.fillStyle=i%3===0?'rgba(255,255,255,.08)':'rgba(77,66,55,.045)';
    x.fillRect(px,py,1.5,1.5);
  }
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
  tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(1.7,4.8);
  tx.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  return tx;
}
const FLOOR={
  hall:new THREE.MeshStandardMaterial({map:makeStoneTexture('#d8cbb8','#b8a88f','#9a876f',3),color:0xffffff,roughness:.62,metalness:.01}),
  promenade:new THREE.MeshStandardMaterial({map:makeStoneTexture('#eee4d5','#cabba5','#a78c6c',7),color:0xffffff,roughness:.54,metalness:.015}),
  side:new THREE.MeshStandardMaterial({map:makeStoneTexture('#c9bca9','#aa9a84','#8f7d69',11),color:0xffffff,roughness:.70,metalness:.01}),
  exterior:new THREE.MeshStandardMaterial({map:makeStoneTexture('#dfd2bf','#b8a58d','#8d7c68',15),color:0xffffff,roughness:.76,metalness:.005}),
  life:new THREE.MeshStandardMaterial({map:makeStoneTexture('#b9aa94','#8d7962','#705e4c',19),color:0xffffff,roughness:.52,metalness:.025}),
  upper:new THREE.MeshStandardMaterial({map:makeStoneTexture('#e4d9c8','#bbaa94','#8f7b64',23),color:0xffffff,roughness:.60,metalness:.01})
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
  const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);
  l.userData.decorative=true;l.userData.baseIntensity=intensity;l.userData.baseDistance=distance;
  l.visible=false;
  parent.add(l);living.lights.push(l);return l;
}
function line(parent,w,d,x,z,material=M.bronze,y=.075){
  return box(parent,w,.018,d,material,x,y,z,{cast:false,receive:true});
}
function tree(parent,x,z,s=.8){
  const g=new THREE.Group();g.position.set(x,0,z);g.userData.swayPhase=(x*1.73+z*.91);parent.add(g);living.trees.push(g);
  cyl(g,.10*s,.15*s,1.8*s,M.trunk,0,.9*s,0,lowPower?6:10,{cast:true});
  const crown=lowPower?[[0,2.10,0,.78],[.12,2.45,0,.43]]:[[0,2.08,0,.72],[.47,2.06,.03,.48],[-.46,2.1,-.02,.46],[.08,2.48,0,.39]];
  crown.forEach(([a,b,c,r])=>{
    const f=mesh(g,new THREE.SphereGeometry(r*s,lowPower?8:18,lowPower?6:12),M.sageSoft,a*s,b*s,c*s,{cast:true});
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
  const geo=new THREE.PlaneGeometry(w,h,lowPower?1:12,lowPower?1:22);
  const mat=lowPower?new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({map:tx,side:THREE.DoubleSide,roughness:.92,metalness:0});
  const cloth=mesh(g,geo,mat,0,-h/2,0,{cast:false,receive:false});
  cloth.userData.base=Float32Array.from(geo.attributes.position.array);
  cloth.userData.height=h;cloth.userData.phase=(x*.31+z*.17+h)%6.2;if(!lowPower)living.banners.push(cloth);
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
function npcNameTag(text,sub=''){
  const c=document.createElement('canvas');c.width=512;c.height=144;const x=c.getContext('2d');
  x.clearRect(0,0,512,144);
  x.fillStyle='rgba(20,31,25,.82)';x.fillRect(28,20,456,98);
  x.strokeStyle='rgba(211,177,120,.55)';x.lineWidth=2;x.strokeRect(29,21,454,96);
  x.fillStyle='#f4ede2';x.font='600 34px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(String(text).slice(0,22),256,59);
  if(sub){x.fillStyle='rgba(224,194,143,.88)';x.font='700 17px Arial';x.fillText(String(sub).toUpperCase().slice(0,24),256,91)}
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,depthTest:true}));
  sp.scale.set(2.05,.58,1);sp.position.y=2.48;sp.renderOrder=25;return sp;
}
function makeNpc(parent,{role='visitor',label='Guest',x=0,y=0,z=0,scale=1,route=[],speed=.65,phase=0,outfit='sage'}={}){
  const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);g.name='KOMO_NPC_'+role.toUpperCase();parent.add(g);
  const seed=Math.abs(Math.floor(x*31+z*17+phase*101));
  const skinColors=[0xe8c9ad,0xd0a27f,0xb27b58,0x7b543f,0x513a31];
  const hairColors=[0x2d2521,0x5b4637,0x8a6f58,0x201d1b];
  const skin=new THREE.MeshStandardMaterial({color:skinColors[seed%skinColors.length],roughness:.82});
  const hair=new THREE.MeshStandardMaterial({color:hairColors[(seed+2)%hairColors.length],roughness:.90});
  const outfits={sage:0x324b3e,cream:0xd8d0c3,charcoal:0x2c312f,sand:0xaa9277,bronze:0x705747};
  const cloth=new THREE.MeshStandardMaterial({color:outfits[outfit]||outfits.sage,roughness:.76});
  const trouser=new THREE.MeshStandardMaterial({color:role==='staff'?0x222b27:0x4a4d49,roughness:.82});
  const shoe=new THREE.MeshStandardMaterial({color:0x242220,roughness:.64});
  const metal=MAT.brass;
  const cast=!lowPower;

  // hips + torso + shoulders
  const hips=mesh(g,new THREE.CylinderGeometry(.235,.25,.28,14),trouser,0,.93,0,{cast});
  const torso=mesh(g,new THREE.CylinderGeometry(.24,.30,.72,16),cloth,0,1.31,0,{cast});
  const shoulder=box(g,.68,.16,.24,cloth,0,1.56,0,{cast});
  const neck=cyl(g,.075,.085,.12,skin,0,1.70,0,12,{cast});
  const head=mesh(g,new THREE.SphereGeometry(.205,18,14),skin,0,1.88,0,{cast});head.scale.set(.92,1.05,.94);
  // hair cap + subtle face detail
  const hairCap=mesh(g,new THREE.SphereGeometry(.211,16,10,0,Math.PI*2,0,Math.PI*.50),hair,0,1.95,-.005,{cast});
  hairCap.scale.set(.94,.88,.96);
  const nose=mesh(g,new THREE.SphereGeometry(.030,8,6),skin,0,1.88,.195,{cast:false});nose.scale.set(.72,.72,1.05);

  // legs with upper/lower segments
  const leftLeg=new THREE.Group(),rightLeg=new THREE.Group();leftLeg.position.set(-.13,.90,0);rightLeg.position.set(.13,.90,0);g.add(leftLeg,rightLeg);
  const leftKnee=new THREE.Group(),rightKnee=new THREE.Group();leftKnee.position.y=-.31;rightKnee.position.y=-.31;leftLeg.add(leftKnee);rightLeg.add(rightKnee);
  cyl(leftLeg,.072,.078,.34,trouser,0,-.17,0,10,{cast});cyl(rightLeg,.072,.078,.34,trouser,0,-.17,0,10,{cast});
  cyl(leftKnee,.060,.068,.32,trouser,0,-.17,0,10,{cast});cyl(rightKnee,.060,.068,.32,trouser,0,-.17,0,10,{cast});
  box(leftKnee,.15,.09,.30,shoe,0,-.37,.065,{cast});box(rightKnee,.15,.09,.30,shoe,0,-.37,.065,{cast});

  // arms with elbows, forearms and hands
  const leftArm=new THREE.Group(),rightArm=new THREE.Group();leftArm.position.set(-.34,1.54,0);rightArm.position.set(.34,1.54,0);g.add(leftArm,rightArm);
  const leftElbow=new THREE.Group(),rightElbow=new THREE.Group();leftElbow.position.y=-.28;rightElbow.position.y=-.28;leftArm.add(leftElbow);rightArm.add(rightElbow);
  cyl(leftArm,.052,.060,.30,role==='staff'?cloth:skin,0,-.15,0,10,{cast});cyl(rightArm,.052,.060,.30,role==='staff'?cloth:skin,0,-.15,0,10,{cast});
  cyl(leftElbow,.045,.052,.27,skin,0,-.14,0,10,{cast});cyl(rightElbow,.045,.052,.27,skin,0,-.14,0,10,{cast});
  mesh(leftElbow,new THREE.SphereGeometry(.055,10,8),skin,0,-.31,0,{cast});mesh(rightElbow,new THREE.SphereGeometry(.055,10,8),skin,0,-.31,0,{cast});

  // accessories
  if(role==='staff'){
    box(g,.12,.16,.025,metal,.17,1.43,.265);
    const tablet=box(g,.25,.34,.035,MAT.blackened,-.21,1.22,.28,{cast:false});tablet.rotation.z=.12;
  }else if(role==='coach'){
    const band=mesh(g,new THREE.TorusGeometry(.13,.025,8,24),metal,0,1.40,.255);band.rotation.x=Math.PI/2;
  }else if(seed%2===0){
    const bag=box(g,.26,.34,.12,MAT.walnut,.31,1.02,-.12,{cast});bag.rotation.z=-.08;
  }

  // label + contact shadow
  const tag=npcNameTag(label,role==='staff'?'KŌMØ STAFF':role==='coach'?'COACH':'GUEST');g.add(tag);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.34,20),new THREE.MeshBasicMaterial({color:0x27352d,transparent:true,opacity:.11,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;g.add(shadow);

  const points=route.length?route.map(p=>new THREE.Vector3(p[0],p[1]??y,p[2])):[new THREE.Vector3(x,y,z)];
  const seg=[],cum=[0];let total=0;
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],d=a.distanceTo(b);seg.push(d);total+=d;cum.push(total)}
  g.userData.npc={role,label,hips,torso,head,leftLeg,rightLeg,leftKnee,rightKnee,leftArm,rightArm,leftElbow,rightElbow,tag,shadow,points,seg,cum,total,speed,phase,baseY:y,lastFarUpdate:0};
  living.npcs.push(g);return g;
}
function updateNpc(npc,t,index){
  const d=npc.userData.npc;if(!d||!d.total)return;
  const distToCamera=camera.position.distanceTo(npc.position);
  const sameLevel=Math.abs(camera.position.y-(npc.position.y+1.7))<4.6;
  d.tag.visible=distToCamera<22&&sameLevel;
  if(d.tag.visible){
    const k=THREE.MathUtils.clamp(1+distToCamera*.012,1,1.22);
    d.tag.scale.set(2.05*k,.58*k,1);
  }

  // On low-power devices, far characters move at 10 Hz and don't animate limbs.
  const far=distToCamera>(lowPower?13:22);
  if(far&&t-d.lastFarUpdate<(lowPower?.10:.065))return;
  if(far)d.lastFarUpdate=t;

  if(d.routeClock==null){d.routeClock=(d.phase*d.total)%d.total;d.routeLastT=t}
  const stepDt=THREE.MathUtils.clamp(t-d.routeLastT,0,.12);d.routeLastT=t;
  const poiSlow=(Math.abs(npc.position.x)<4.5&&npc.position.z>13&&npc.position.z<20)
    ||(npc.position.x>6.4&&npc.position.z>-1&&npc.position.z<7)
    ||(Math.abs(npc.position.x)<5&&npc.position.z<-6&&npc.position.z>-11);
  const idlePulse=poiSlow?(.5+.5*Math.sin(t*.66+d.phase*9+index*.7)):0;
  const pace=poiSlow&&idlePulse>.76?THREE.MathUtils.lerp(.08,.34,(1-idlePulse)/.24):1;
  d.routeClock=(d.routeClock+stepDt*d.speed*pace)%d.total;
  const routeDist=d.routeClock;
  let segIndex=0;
  while(segIndex<d.seg.length-1&&routeDist>d.cum[segIndex+1])segIndex++;
  const a=d.points[segIndex],b=d.points[(segIndex+1)%d.points.length],len=Math.max(.001,d.seg[segIndex]);
  const u=(routeDist-d.cum[segIndex])/len;
  npc.position.lerpVectors(a,b,u);
  const dx=b.x-a.x,dz=b.z-a.z;
  const desired=Math.atan2(dx,dz);
  npc.rotation.y=desired;
  if(poiSlow&&idlePulse>.76){
    d.head.rotation.y=Math.sin(t*.95+index)*.22;
    d.torso.rotation.y=Math.sin(t*.38+index)*.035;
    d.leftArm.rotation.z=Math.sin(t*.72+index)*.055;
    if(d.role==='staff')d.rightArm.rotation.x=-.20;
  }else{
    d.leftArm.rotation.z*=.82;
    d.torso.rotation.y*=.82;
  }

  if(far){
    d.leftLeg.rotation.x=d.rightLeg.rotation.x=d.leftArm.rotation.x=d.rightArm.rotation.x=0;
    return;
  }

  const cadence=t*d.speed*5.25+index*.72;
  const stride=Math.sin(cadence)*pace,half=Math.sin(cadence+Math.PI*.5);
  d.leftLeg.rotation.x=stride*.38;d.rightLeg.rotation.x=-stride*.38;
  d.leftKnee.rotation.x=Math.max(0,-stride)*.30;d.rightKnee.rotation.x=Math.max(0,stride)*.30;
  d.leftArm.rotation.x=-stride*.29;d.rightArm.rotation.x=stride*.29;
  d.leftElbow.rotation.x=Math.max(0,stride)*.16;d.rightElbow.rotation.x=Math.max(0,-stride)*.16;
  d.torso.rotation.z=Math.cos(cadence*.5)*.018;
  d.hips.rotation.y=Math.sin(cadence*.5)*.028;
  d.head.rotation.y=Math.sin(t*.62+index*.73)*.09;
  npc.position.y+=Math.abs(stride)*.015;
}
function makePlayerAvatar(){
  const g=new THREE.Group();g.name='KOMO_PLAYER_AVATAR_V31';g.userData.dynamic=true;scene.add(g);
  const skin=new THREE.MeshStandardMaterial({color:0xc99673,roughness:.80});
  const skinWarm=new THREE.MeshStandardMaterial({color:0xb87958,roughness:.84});
  const cloth=new THREE.MeshStandardMaterial({color:0x24483a,roughness:.68});
  const clothDark=new THREE.MeshStandardMaterial({color:0x19372d,roughness:.72});
  const trouser=new THREE.MeshStandardMaterial({color:0x303733,roughness:.82});
  const shoe=new THREE.MeshStandardMaterial({color:0x1f211f,roughness:.62});
  const hair=new THREE.MeshStandardMaterial({color:0x2a2420,roughness:.90});
  const bronze=new THREE.MeshStandardMaterial({color:0xb18a58,roughness:.48,metalness:.22});
  const cast=!lowPower;

  // pelvis + torso: less blocky silhouette.
  const hipsGroup=new THREE.Group();hipsGroup.position.y=.93;g.add(hipsGroup);
  mesh(hipsGroup,new THREE.CylinderGeometry(.225,.255,.28,lowPower?10:14),trouser,0,0,0,{cast});

  const torsoGroup=new THREE.Group();torsoGroup.position.y=1.30;g.add(torsoGroup);
  const torso=mesh(torsoGroup,new THREE.CylinderGeometry(.235,.29,.73,lowPower?12:18),cloth,0,0,0,{cast});
  torso.scale.z=.88;
  box(torsoGroup,.68,.14,.225,clothDark,0,.26,0,{cast});
  // jacket front panels + subtle bronze zip line.
  box(torsoGroup,.27,.54,.018,clothDark,-.145,-.02,.215,{cast:false});
  box(torsoGroup,.27,.54,.018,cloth,.145,-.02,.215,{cast:false});
  box(torsoGroup,.018,.53,.024,bronze,0,-.02,.229,{cast:false});

  const neck=cyl(g,.072,.082,.13,skin,0,1.70,0,lowPower?8:12,{cast});
  const headGroup=new THREE.Group();headGroup.position.y=1.91;g.add(headGroup);
  const head=mesh(headGroup,new THREE.SphereGeometry(.205,lowPower?14:20,lowPower?10:16),skin,0,0,0,{cast});head.scale.set(.91,1.07,.94);
  const hairCap=mesh(headGroup,new THREE.SphereGeometry(.213,lowPower?12:18,lowPower?8:12,0,Math.PI*2,0,Math.PI*.52),hair,0,.074,-.006,{cast});hairCap.scale.set(.95,.88,.97);
  // face landmarks: deliberately subtle.
  const nose=mesh(headGroup,new THREE.SphereGeometry(.029,lowPower?6:9,lowPower?5:7),skinWarm,0,-.005,.195,{cast:false});nose.scale.set(.68,.72,1.08);
  const eyeMat=new THREE.MeshBasicMaterial({color:0x241f1c});
  [-.066,.066].forEach(x=>{const eye=mesh(headGroup,new THREE.SphereGeometry(.010,6,4),eyeMat,x,.026,.188,{cast:false,receive:false});eye.scale.z=.52});

  // segmented legs.
  const leftLeg=new THREE.Group(),rightLeg=new THREE.Group();leftLeg.position.set(-.135,.89,0);rightLeg.position.set(.135,.89,0);g.add(leftLeg,rightLeg);
  const leftKnee=new THREE.Group(),rightKnee=new THREE.Group();leftKnee.position.y=-.315;rightKnee.position.y=-.315;leftLeg.add(leftKnee);rightLeg.add(rightKnee);
  cyl(leftLeg,.073,.082,.35,trouser,0,-.175,0,lowPower?8:11,{cast});cyl(rightLeg,.073,.082,.35,trouser,0,-.175,0,lowPower?8:11,{cast});
  cyl(leftKnee,.060,.069,.32,trouser,0,-.17,0,lowPower?8:11,{cast});cyl(rightKnee,.060,.069,.32,trouser,0,-.17,0,lowPower?8:11,{cast});
  box(leftKnee,.16,.095,.31,shoe,0,-.375,.072,{cast});box(rightKnee,.16,.095,.31,shoe,0,-.375,.072,{cast});

  // segmented arms + visible hands.
  const leftArm=new THREE.Group(),rightArm=new THREE.Group();leftArm.position.set(-.34,1.55,0);rightArm.position.set(.34,1.55,0);g.add(leftArm,rightArm);
  const leftElbow=new THREE.Group(),rightElbow=new THREE.Group();leftElbow.position.y=-.285;rightElbow.position.y=-.285;leftArm.add(leftElbow);rightArm.add(rightElbow);
  cyl(leftArm,.052,.061,.31,cloth,0,-.155,0,lowPower?8:11,{cast});cyl(rightArm,.052,.061,.31,cloth,0,-.155,0,lowPower?8:11,{cast});
  cyl(leftElbow,.045,.052,.26,skin,0,-.135,0,lowPower?8:11,{cast});cyl(rightElbow,.045,.052,.26,skin,0,-.135,0,lowPower?8:11,{cast});
  mesh(leftElbow,new THREE.SphereGeometry(.056,lowPower?7:10,lowPower?5:8),skin,0,-.31,0,{cast});
  mesh(rightElbow,new THREE.SphereGeometry(.056,lowPower?7:10,lowPower?5:8),skin,0,-.31,0,{cast});

  // Grounding: contact shadow is far cheaper than real shadow mapping.
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.36,lowPower?18:28),new THREE.MeshBasicMaterial({color:0x17251e,transparent:true,opacity:.16,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;g.add(shadow);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.38,.415,lowPower?26:40),new THREE.MeshBasicMaterial({color:0xc49a62,transparent:true,opacity:.22,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.016;g.add(ring);

  const tag=npcNameTag('YOU','KŌMØ WORLD');tag.position.y=2.49;tag.scale.set(1.40,.40,1);g.add(tag);
  g.userData.avatar={hipsGroup,torsoGroup,headGroup,leftLeg,rightLeg,leftKnee,rightKnee,leftArm,rightArm,leftElbow,rightElbow,tag,shadow,phase:0,facing:0,materials:{skin,skinWarm,cloth,clothDark,trouser,shoe,hair,bronze}};
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
  const rec={ctx,tx,label,phase:Math.random()*10,mesh:m};living.motionScreens.push(rec);
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
const rehabRoom=new THREE.Group();rehabRoom.name='KOMO_FITNESS_CLUB_V29';rehabRoom.visible=false;scene.add(rehabRoom);
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

// V1.9 exterior paving hierarchy.
const exteriorFloor=new THREE.Group();exteriorFloor.name='KOMO_EXTERIOR_FLOOR_V19';exterior.add(exteriorFloor);
box(exteriorFloor,18.8,.025,31.4,FLOOR.exterior,0,.118,40.7);
box(exteriorFloor,7.9,.030,30.3,FLOOR.promenade,0,.136,40.7);
[-4.10,4.10].forEach(x=>line(exteriorFloor,.045,29.8,x,40.7,MAT.brass,.154));
for(let z=27.0;z<=54.0;z+=3.85)line(exteriorFloor,7.62,.028,0,z,M.bronzeSoft,.156);


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

// V3.2 KŌMØ District — fountain, pavilions and a wider living campus.
const worldDistrict=new THREE.Group();worldDistrict.name='KOMO_WORLD_DISTRICT_V32';world.add(worldDistrict);living.district=worldDistrict;
box(worldDistrict,31.5,.045,23.0,MAT.travertine,0,.07,68.0);
box(worldDistrict,9.0,.025,22.0,M.stoneLight,0,.10,68.0);
[-4.65,4.65].forEach(x=>line(worldDistrict,.045,21.4,x,68.0,MAT.brass,.125));
[58.5,63.0,67.5,72.0,76.5].forEach(z=>line(worldDistrict,8.7,.032,0,z,M.bronzeSoft,.128));

// Grand fountain — low-cost animated jets, no dynamic lights.
const grandFountain=new THREE.Group();grandFountain.name='KOMO_GRAND_FOUNTAIN_V32';grandFountain.position.set(0,0,68.2);worldDistrict.add(grandFountain);
cyl(grandFountain,5.35,5.35,.36,MAT.limestone,0,.18,0,64,{cast:false});
cyl(grandFountain,4.72,4.72,.18,M.water,0,.38,0,64,{cast:false});
mesh(grandFountain,new THREE.RingGeometry(4.85,5.18,72),MAT.brass,0,.39,0,{cast:false}).rotation.x=-Math.PI/2;
cyl(grandFountain,.72,.95,2.15,MAT.travertine,0,1.36,0,28,{cast:true});
mesh(grandFountain,new THREE.SphereGeometry(.48,20,14),MAT.brass,0,2.62,0,{cast:true});
const fountainWaterMat=new THREE.MeshBasicMaterial({color:0xc8ded5,transparent:true,opacity:.40,depthWrite:false});
for(let i=0;i<(lowPower?6:12);i++){
  const a=i/(lowPower?6:12)*Math.PI*2,r=3.35;
  const jet=mesh(grandFountain,new THREE.CylinderGeometry(.025,.038,1.0,6),fountainWaterMat,Math.cos(a)*r,.95,Math.sin(a)*r,{cast:false,receive:false});
  jet.userData.phase=i*.63;jet.userData.baseY=.95;jet.userData.dynamic=true;living.fountainJets.push(jet);
}
plaque(worldDistrict,'GRAND FOUNTAIN','KŌMØ DISTRICT · COMMUNITY',4.8,.92,0,2.45,61.9,{dark:true,titleSize:61});

// Three exterior pavilions establish a visible district around the flagship.
function districtPavilion(x,z,w,d,title,sub,dark=false){
  const g=new THREE.Group();g.position.set(x,0,z);worldDistrict.add(g);
  box(g,w,.20,d,MAT.travertine,0,.10,0);
  box(g,w,4.8,.22,dark?M.sageDeep:MAT.smokedGlass,0,2.55,-d/2+.10);
  box(g,.26,5.15,d,MAT.limestone,-w/2+.13,2.58,0,{cast:true});
  box(g,.26,5.15,d,MAT.limestone,w/2-.13,2.58,0,{cast:true});
  box(g,w,.28,d,MAT.limestone,0,5.05,0,{cast:true});
  box(g,w-.55,.04,d-.45,M.warm,0,4.82,0);
  plaque(g,title,sub,Math.min(w-1,5.2),.82,0,4.25,-d/2-.05,{dark,titleSize:52});
  return g;
}
districtPavilion(-14.6,68.0,7.2,8.8,'MOVEMENT HOUSE','COMMUNITY · EVENTS',false);
districtPavilion(14.6,68.0,7.2,8.8,'LIFE LAB','OBJECTS · RECOVERY',true);
districtPavilion(0,77.0,9.0,5.2,'PERFORMANCE PAVILION','CHALLENGES · TALKS',true);

[-1,1].forEach(side=>{
  exteriorBench(worldDistrict,side*7.2,61.0,side>0?-Math.PI/2:Math.PI/2,.82);
  tree(worldDistrict,side*9.0,75.0,.62);
  tree(worldDistrict,side*19.2,61.0,.56);
});
bannerTotem(worldDistrict,-10.8,58.5,'WORLD','CHALLENGES',.05);
bannerTotem(worldDistrict,10.8,58.5,'KŌMØ LIFE','DISTRICT',-.05);

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
fabricBanner(building,-10.75,7.55,18.75,1.22,4.65,'FITNESS','TRAIN',{dark:false});
fabricBanner(building,10.75,7.55,18.75,1.22,4.65,'ARENA','ENGAGE',{dark:false});
fabricBanner(building,12.65,7.55,18.55,1.22,4.65,'KŌMØ LIFE','CASE 01',{dark:true});
[
  [-12.65,7.7,19.1,1.05],[-10.75,7.7,19.1,.95],
  [10.75,7.7,19.1,.95],[12.65,7.7,19.1,1.05]
].forEach(([x,y,z,intensity])=>{
  const l=glow(building,0xf2cf98,intensity,5.5,x,y,z);living.lights.push(l);
});

// V2.3 Living Entrance — framed automatic sliding doors with sensor + threshold.
const entrance=new THREE.Group();entrance.name='KOMO_LIVING_ENTRANCE_V23';building.add(entrance);

// Recessed bronze track and side pockets.
box(entrance,5.55,.16,.22,MAT.brass,0,5.72,17.38);
box(entrance,5.55,.12,.46,MAT.blackened,0,.48,17.30);
box(entrance,.26,5.55,.48,MAT.blackened,-3.15,3.15,17.30);
box(entrance,.26,5.55,.48,MAT.blackened,3.15,3.15,17.30);
box(entrance,.08,5.30,.12,MAT.brass,-2.60,3.05,17.44);
box(entrance,.08,5.30,.12,MAT.brass,2.60,3.05,17.44);

// Each moving leaf is a group: cheap to animate even when child matrices are frozen on iPad.
function entranceLeaf(side){
  const g=new THREE.Group();g.position.set(side*1.29,0,0);entrance.add(g);
  box(g,2.42,5.12,.075,M.glass,0,3.05,17.35);
  box(g,2.44,.065,.11,MAT.brass,0,.52,17.42);
  box(g,2.44,.065,.11,MAT.brass,0,5.58,17.42);
  box(g,.065,5.05,.11,MAT.brass,-side*1.17,3.05,17.42);
  box(g,.055,5.05,.10,M.bronzeSoft,side*1.17,3.05,17.42);
  // Discreet handle/edge marker.
  box(g,.055,.78,.13,MAT.brass,-side*.94,2.95,17.47);
  return g;
}
const doorLeft=entranceLeaf(-1);
const doorRight=entranceLeaf(1);

// Sensor canopy + status lamp.
const doorSensor=new THREE.Group();doorSensor.name='KOMO_DOOR_SENSOR_V23';entrance.add(doorSensor);
box(doorSensor,1.18,.16,.38,MAT.blackened,0,5.95,17.05);
const sensorEye=mesh(doorSensor,new THREE.CircleGeometry(.075,20),new THREE.MeshBasicMaterial({color:0xd9b777}),0,5.88,17.24,{receive:false});
sensorEye.rotation.x=Math.PI/2;
const sensorGlow=new THREE.MeshBasicMaterial({color:0xd9b777,transparent:true,opacity:.18,depthWrite:false});
const sensorHalo=mesh(doorSensor,new THREE.RingGeometry(.12,.18,28),sensorGlow,0,5.875,17.235,{receive:false});
sensorHalo.rotation.x=Math.PI/2;

// Low-cost luminous threshold lines — emissive materials, no PointLight.
const thresholdMat=new THREE.MeshBasicMaterial({color:0xd6b47b,transparent:true,opacity:.22,depthWrite:false});
const thresholdA=box(entrance,4.85,.018,.055,thresholdMat,0,.425,18.18,{receive:false});
const thresholdB=box(entrance,4.85,.018,.055,thresholdMat,0,.425,16.66,{receive:false});
const doorSign=plaque(entrance,'WELCOME','KŌMØ WORLD',2.35,.46,0,5.22,17.48,{dark:true,titleSize:45});

// V2.3 entrance life cues — static, cheap objects that make the threshold inhabited.
const arrivalDetails=new THREE.Group();arrivalDetails.name='KOMO_ARRIVAL_DETAILS_V23';building.add(arrivalDetails);
const trolley=new THREE.Group();trolley.position.set(5.55,0,13.4);arrivalDetails.add(trolley);
box(trolley,1.05,.10,.68,MAT.brass,0,.30,0);
box(trolley,.08,1.55,.08,MAT.brass,-.46,1.02,-.24);
box(trolley,.08,1.55,.08,MAT.brass,.46,1.02,-.24);
box(trolley,1.00,.08,.08,MAT.brass,0,1.76,-.24);
[-.42,.42].forEach(x=>[-.22,.22].forEach(z=>{
  const wheel=mesh(trolley,new THREE.TorusGeometry(.10,.026,6,16),MAT.blackened,x,.12,z);wheel.rotation.y=Math.PI/2;
}));
box(trolley,.70,.48,.42,MAT.walnut,0,.57,0,{cast:true});
box(trolley,.62,.07,.34,MAT.brass,0,.84,0);

const arrivalConsole=new THREE.Group();arrivalConsole.position.set(-5.7,0,13.0);arrivalDetails.add(arrivalConsole);
box(arrivalConsole,1.18,.80,.58,MAT.travertine,0,.42,0);
box(arrivalConsole,.96,.055,.44,MAT.brass,0,.84,0);
plaque(arrivalConsole,'ARRIVAL','PULSE · WORLD',1.0,.38,0,1.20,-.30,{dark:true,titleSize:38});

// V2.4 World Journey station — explains progression inside the spatial experience.
const journeyStation=new THREE.Group();journeyStation.name='KOMO_WORLD_JOURNEY_V24';journeyStation.position.set(4.8,0,8.5);building.add(journeyStation);
box(journeyStation,1.35,.22,1.35,MAT.travertine,0,.12,0);
box(journeyStation,.92,1.72,.34,MAT.blackened,0,1.05,0,{cast:true});
box(journeyStation,.74,.05,.22,MAT.brass,0,1.78,.16);
plaque(journeyStation,'WORLD JOURNEY','EXPLORE · UNDERSTAND · ACT',1.25,.48,0,1.28,.20,{dark:true,titleSize:37});
const journeyRing=mesh(journeyStation,new THREE.TorusGeometry(.27,.028,8,30),MAT.brass,0,2.14,0,{cast:false});journeyRing.rotation.x=Math.PI/2;

// V2.5 low-cost objective guide: bronze breadcrumbs + destination beacon.
const guideRoot=new THREE.Group();guideRoot.name='KOMO_JOURNEY_GUIDE_V25';world.add(guideRoot);
let guideEnabled=true,guideLastUpdate=0;
const guideMat=new THREE.MeshBasicMaterial({color:0xd5b477,transparent:true,opacity:.30,depthWrite:false});
const guideDots=[];
for(let i=0;i<(lowPower?4:7);i++){
  const g=new THREE.Group();g.userData.dynamic=true;guideRoot.add(g);
  const q=new THREE.Mesh(new THREE.RingGeometry(.12,.19,18),guideMat.clone());q.rotation.x=-Math.PI/2;q.userData.dynamic=true;g.add(q);guideDots.push(g);
}
const waypoint=new THREE.Group();waypoint.name='KOMO_JOURNEY_WAYPOINT_V25';waypoint.userData.dynamic=true;guideRoot.add(waypoint);
const waypointRing=new THREE.Mesh(new THREE.TorusGeometry(.42,.035,8,30),guideMat.clone());waypointRing.rotation.x=Math.PI/2;waypointRing.userData.dynamic=true;waypoint.add(waypointRing);
const waypointStem=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.45,6),guideMat.clone());waypointStem.position.y=.78;waypointStem.userData.dynamic=true;waypoint.add(waypointStem);
const waypointCap=new THREE.Mesh(new THREE.SphereGeometry(.075,8,6),guideMat.clone());waypointCap.position.y=1.52;waypointCap.userData.dynamic=true;waypoint.add(waypointCap);


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

// V1.8 second floor — an actual accessible upper gallery.
const upperLevel=new THREE.Group();upperLevel.name='KOMO_UPPER_LEVEL_V18';building.add(upperLevel);
const UPPER_Y=4.25;

// Fine finish layer above the structural slabs.
const upperFloorFinish=new THREE.Group();upperFloorFinish.name='KOMO_UPPER_FLOOR_V19';upperLevel.add(upperFloorFinish);
box(upperFloorFinish,4.48,.035,29.7,FLOOR.upper,-8.72,UPPER_Y+.165,-8.05);
box(upperFloorFinish,4.48,.035,21.5,FLOOR.upper,8.72,UPPER_Y+.165,-12.15);
box(upperFloorFinish,16.95,.035,3.82,FLOOR.promenade,0,UPPER_Y+.165,-21.20);


// West gallery reaches the grand stair; east gallery starts beyond the Life flagship volume.
box(upperLevel,4.75,.28,30.2,MAT.travertine,-8.72,UPPER_Y,-8.10,{cast:true});
box(upperLevel,4.75,.28,22.0,MAT.travertine,8.72,UPPER_Y,-12.15,{cast:true});
box(upperLevel,17.45,.28,4.2,MAT.travertine,0,UPPER_Y,-21.20,{cast:true});

// Bronze datum at the gallery edges.
line(upperLevel,4.20,.05,-8.72,6.72,MAT.brass,UPPER_Y+.16);
line(upperLevel,4.20,.05,8.72,-1.08,MAT.brass,UPPER_Y+.16);

// Inner glass balustrades, segmented so the atrium remains transparent.
[-1,1].forEach(side=>{
  const x=side*6.28;
  const zStart=side<0?5.6:-1.0;
  for(let z=zStart;z>-19.25;z-=3.65){
    box(upperLevel,.075,1.06,3.22,MAT.smokedGlass,x,UPPER_Y+.70,z);
    box(upperLevel,.09,.065,3.34,MAT.brass,x,UPPER_Y+1.25,z);
  }
});
// Rear skywalk rails.
[-19.05,-23.35].forEach(z=>{
  for(let x=-4.5;x<=4.5;x+=3.0){
    box(upperLevel,2.70,1.02,.075,MAT.smokedGlass,x,UPPER_Y+.69,z);
    box(upperLevel,2.82,.065,.09,MAT.brass,x,UPPER_Y+1.22,z);
  }
});

// Grand sculptural stair on the west side.
const stair=new THREE.Group();stair.name='KOMO_GRAND_STAIR_V18';upperLevel.add(stair);
const stairX=-8.72,stairBottomZ=13.20,stairTopZ=7.00,stairSteps=15;
for(let i=0;i<stairSteps;i++){
  const t=(i+1)/stairSteps;
  const h=UPPER_Y*t;
  const z=stairBottomZ-(i+.5)*(stairBottomZ-stairTopZ)/stairSteps;
  box(stair,3.48,h,.50,i%2?MAT.travertine:MAT.limestone,stairX,h/2,z,{cast:true});
  if(i%3===0)box(stair,3.10,.025,.10,MAT.brass,stairX,h+.018,z-.18);
}
const railMat=MAT.brass;
bodySegment(stair,[-10.38,.58,13.05],[-10.38,5.25,6.95],.035,railMat);
bodySegment(stair,[-7.06,.58,13.05],[-7.06,5.25,6.95],.035,railMat);
for(let i=0;i<6;i++){
  const t=i/5,z=THREE.MathUtils.lerp(13.05,6.95,t),y=THREE.MathUtils.lerp(.48,4.98,t);
  cyl(stair,.022,.026,.90,MAT.brass,-10.38,y-.25,z,10);
  cyl(stair,.022,.026,.90,MAT.brass,-7.06,y-.25,z,10);
}
box(stair,4.10,.28,2.25,MAT.travertine,stairX,UPPER_Y,6.25,{cast:true});
plaque(stair,'UPPER GALLERY','SCIENCE · LIFE · TALKS',3.15,.72,-10.42,UPPER_Y+2.05,7.05,{rotY:Math.PI/2,dark:true,titleSize:52});

// Upper Library / Science zone.
const upperWest=new THREE.Group();upperWest.name='KOMO_UPPER_LIBRARY_V18';upperLevel.add(upperWest);
upperWest.position.set(-8.72,UPPER_Y+.16,-5.1);
box(upperWest,3.75,.08,5.10,MAT.walnut,0,.08,0);
box(upperWest,3.45,.06,4.82,MAT.fabricLight,0,.16,0);
const upperWestLounge=new THREE.Group();upperWestLounge.position.set(0,.02,0);upperWest.add(upperWestLounge);
box(upperWestLounge,2.20,.30,.72,MAT.fabric,-.40,.36,.95,{cast:true});
box(upperWestLounge,2.20,.58,.18,MAT.fabric,-.40,.64,1.27,{cast:true});
cyl(upperWestLounge,.52,.52,.07,MAT.walnut,.55,.38,-.15,24,{cast:true});
cyl(upperWestLounge,.04,.055,.34,MAT.brass,.55,.20,-.15,12,{cast:true});
plaque(upperLevel,'SCIENCE LIBRARY','READ · COMPARE · UNDERSTAND',3.65,.74,-11.43,6.38,-5.2,{rotY:Math.PI/2,dark:false,titleSize:49});
[-8.95,-7.75].forEach(x=>{
  box(upperLevel,.84,1.85,.22,MAT.walnut,x,5.38,-12.7,{cast:true});
  [4.78,5.35,5.92].forEach(y=>box(upperLevel,.72,.045,.42,MAT.brass,x,y,-12.55));
});

// Upper Life Lounge / executive zone.
const upperEast=new THREE.Group();upperEast.name='KOMO_UPPER_LIFE_LOUNGE_V18';upperLevel.add(upperEast);
upperEast.position.set(8.72,UPPER_Y+.16,-6.2);
box(upperEast,3.70,.08,5.3,MAT.walnut,0,.08,0);
box(upperEast,3.38,.05,5.0,MAT.fabricLight,0,.16,0);
box(upperEast,2.28,.32,.76,MAT.fabric,.38,.38,.90,{cast:true});
box(upperEast,2.28,.58,.18,MAT.fabric,.38,.66,1.22,{cast:true});
box(upperEast,.88,.36,.82,MAT.ivory,-1.12,.40,-.35,{cast:true});
cyl(upperEast,.46,.46,.07,MAT.walnut,.35,.40,-.45,24,{cast:true});
plaque(upperLevel,'LIFE LOUNGE','OBJECTS · PARTNERS · PRIVATE',3.65,.74,11.43,6.38,-6.2,{rotY:-Math.PI/2,dark:true,titleSize:49});

// Rear observatory / talks bridge.
box(upperLevel,5.8,.075,2.55,MAT.walnut,0,UPPER_Y+.18,-21.2);
[-1.8,0,1.8].forEach(x=>cyl(upperLevel,.40,.40,.06,MAT.brass,x,UPPER_Y+.32,-21.2,24));
plaque(upperLevel,'OBSERVATORY','TALKS · WORLD · COMMUNITY',5.2,.82,0,6.30,-23.48,{dark:true,titleSize:54});

// Upper floor planting and warm pools of light.
[-9.7,9.7].forEach((x,i)=>{
  box(upperLevel,1.35,.34,1.35,MAT.limestone,x,UPPER_Y+.18,-17.0);
  box(upperLevel,1.12,.06,1.12,M.soil,x,UPPER_Y+.39,-17.0);
  const tg=new THREE.Group();tg.position.set(0,UPPER_Y+.38,0);upperLevel.add(tg);tree(tg,x,-17.0,.34);
});
[
  [-8.7,6.9,-4.8,1.15],[8.7,6.9,-5.5,1.15],[0,6.8,-21.2,1.35]
].forEach(([x,y,z,intensity])=>{
  const l=glow(upperLevel,0xf2d4a3,intensity,6,x,y,z);living.lights.push(l);
});

// Exterior second-floor expression on the front facade.
box(outerFrame,5.4,.10,.72,MAT.brass,-9.55,5.05,18.78);
box(outerFrame,5.4,.10,.72,MAT.brass,9.55,5.05,18.78);
box(outerFrame,5.1,2.05,.08,MAT.smokedGlass,-9.55,6.12,18.82);
box(outerFrame,5.1,2.05,.08,MAT.smokedGlass,9.55,6.12,18.82);

// V1.9 flooring — layered travertine, bronze inlays and differentiated circulation.
const floorV19=new THREE.Group();floorV19.name='KOMO_FLOORING_V19';building.add(floorV19);
box(floorV19,22.65,.035,45.6,FLOOR.hall,0,.305,-7.0);
box(floorV19,8.85,.038,43.8,FLOOR.promenade,0,.329,-6.55);
box(floorV19,5.95,.040,43.6,FLOOR.side,-8.20,.331,-6.55);
box(floorV19,5.95,.040,43.6,FLOOR.side,8.20,.331,-6.55);

// Long bronze rails and rhythmic cross-joints make the hall feel constructed, not flat.
[-4.54,4.54].forEach(x=>line(floorV19,.055,43.2,x,-6.55,MAT.brass,.356));
for(let z=-25.8;z<=13.4;z+=3.6){
  line(floorV19,8.55,.035,0,z,M.bronzeSoft,.357);
}
// Fine perimeter lines.
[-11.15,11.15].forEach(x=>line(floorV19,.035,44.4,x,-6.7,M.bronze,.354));

// Entry threshold and atrium medallion.
box(floorV19,8.4,.045,2.2,FLOOR.life,0,.342,13.0);
box(floorV19,7.7,.020,1.58,MAT.brass,0,.370,13.0);
box(floorV19,7.25,.024,1.16,FLOOR.promenade,0,.384,13.0);
const medallion=mesh(floorV19,new THREE.RingGeometry(1.38,1.48,72),MAT.brass,0,.372,-8.6,{receive:false});medallion.rotation.x=-Math.PI/2;
const medallion2=mesh(floorV19,new THREE.RingGeometry(.78,.82,64),M.bronzeSoft,0,.374,-8.6,{receive:false});medallion2.rotation.x=-Math.PI/2;
// V2.0 floor polish: stair landing + lounge islands.
box(floorV19,4.45,.035,6.55,FLOOR.life,-8.72,.368,10.05);
[-10.20,-7.24].forEach(x=>line(floorV19,.035,6.05,x,10.05,MAT.brass,.392));
for(let z=7.6;z<=12.5;z+=1.22)line(floorV19,3.95,.026,-8.72,z,M.bronzeSoft,.394);
box(floorV19,4.25,.026,3.15,FLOOR.side,7.95,.369,-7.7);
box(floorV19,4.10,.026,3.00,FLOOR.side,-8.0,.369,-14.2);

// Life store gets its own darker gallery floor.
box(floorV19,5.65,.045,9.85,FLOOR.life,8.45,.344,3.8);
line(floorV19,5.30,.045,8.45,-.90,MAT.brass,.373);
line(floorV19,5.30,.045,8.45,8.50,MAT.brass,.373);

// Hall axis.

// Desk as architecture only.
const desk=new THREE.Group();desk.name='KOMO_DESK_V1';building.add(desk);
desk.position.set(-7.3,0,4.0);
box(desk,4.9,.20,2.2,M.stoneDeep,0,.12,0);
box(desk,4.55,.88,1.02,M.stone,0,.62,.10);
box(desk,4.2,.42,.86,M.sageDeep,0,.82,.16);
box(desk,4.75,.10,1.12,M.bronze,0,1.17,.10);
plaque(desk,'KŌMØ DESK','ORIENTATION · TRAJECTORY',3.7,.88,0,2.85,-.58,{dark:true,titleSize:74});
glow(desk,0xe9c48e,2.2,8,0,3.1,1.4);

// V3.0 Hall Living — denser premium flagship without breaking the FPS budget.
const hallLiving=new THREE.Group();hallLiving.name='KOMO_HALL_LIVING_V30';building.add(hallLiving);

function instancedStatic(parent,geometry,material,items,name){
  const inst=new THREE.InstancedMesh(geometry,material,items.length);inst.name=name;inst.castShadow=false;inst.receiveShadow=false;
  const dummy=new THREE.Object3D();
  items.forEach((it,i)=>{
    dummy.position.set(it.x||0,it.y||0,it.z||0);
    dummy.rotation.set(it.rx||0,it.ry||0,it.rz||0);
    dummy.scale.set(it.sx||1,it.sy||1,it.sz||1);
    dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);
  });
  inst.instanceMatrix.needsUpdate=true;parent.add(inst);return inst;
}

// Travertine hospitality islands break up the long central corridor.
[
  [0,.195,8.35,6.2,.024,3.15],
  [0,.195,-5.4,5.6,.024,3.55],
  [0,.195,-18.25,5.8,.024,3.15]
].forEach(([x,y,z,w,h,d],i)=>{
  box(hallLiving,w,h,d,i===1?FLOOR.side:FLOOR.promenade,x,y,z,{cast:false,receive:false});
  line(hallLiving,w-.45,.025,x,z-d/2+.18,MAT.brass,y+.018);
  line(hallLiving,w-.45,.025,x,z+d/2-.18,MAT.brass,y+.018);
});

// Fluted wall ribs: high visual detail, one draw call.
const wallRibs=[];
[-1,1].forEach(side=>{
  for(let z=10.0;z>=-23;z-=3.1)wallRibs.push({x:side*11.43,y:3.30,z,sx:.055,sy:3.05,sz:.12});
});
instancedStatic(hallLiving,new THREE.BoxGeometry(1,1,1),MAT.brass,wallRibs,'KOMO_HALL_BRASS_RIBS_V30');

// Warm ceiling blades create a richer ceiling without any extra PointLight.
const bladeMat=new THREE.MeshBasicMaterial({color:0xd8b47b});
const ceilingBlades=[];
for(let z=10;z>=-23;z-=4.7){
  ceilingBlades.push({x:-5.1,y:7.42,z,sx:3.9,sy:.022,sz:.045});
  ceilingBlades.push({x:5.1,y:7.42,z,sx:3.9,sy:.022,sz:.045});
}
instancedStatic(hallLiving,new THREE.BoxGeometry(1,1,1),bladeMat,ceilingBlades,'KOMO_HALL_LIGHT_BLADES_V30');

// Indoor Riviera planters — instanced trunks/crowns/bases for density at low draw-call cost.
const plantSites=[
  [-5.85,10.4,.78],[5.85,10.4,.74],[-5.95,-4.4,.68],[5.95,-4.4,.72],
  [-5.75,-16.1,.64],[5.75,-16.1,.66]
];
const plantBases=plantSites.map(([x,z,s])=>({x,y:.34,z,sx:1.25*s,sy:.54,sz:1.25*s}));
const plantSoil=plantSites.map(([x,z,s])=>({x,y:.63,z,sx:1.03*s,sy:.08,sz:1.03*s}));
const trunks=plantSites.map(([x,z,s])=>({x,y:1.48,z,sx:.11*s,sy:1.55*s,sz:.11*s}));
const crowns=[];
plantSites.forEach(([x,z,s],i)=>{
  crowns.push({x:x-.22*s,y:2.62*s+.25,z:z+.04,sx:.70*s,sy:.52*s,sz:.70*s});
  crowns.push({x:x+.23*s,y:2.72*s+.25,z:z-.02,sx:.62*s,sy:.47*s,sz:.62*s});
});
instancedStatic(hallLiving,new THREE.BoxGeometry(1,1,1),MAT.travertine,plantBases,'KOMO_HALL_PLANTERS_V30');
instancedStatic(hallLiving,new THREE.BoxGeometry(1,1,1),M.soil,plantSoil,'KOMO_HALL_PLANTER_SOIL_V30');
instancedStatic(hallLiving,new THREE.CylinderGeometry(1,1,1,8),M.trunk,trunks,'KOMO_HALL_TREE_TRUNKS_V30');
instancedStatic(hallLiving,new THREE.SphereGeometry(1,lowPower?7:10,lowPower?5:7),M.sageSoft,crowns,'KOMO_HALL_TREE_CROWNS_V30');

// Social café / conversation furniture, all repeated through instancing.
const tableSites=[[-5.2,7.9],[5.6,7.7],[-5.1,-9.1],[5.2,-13.0]];
const tableTops=tableSites.map(([x,z])=>({x,y:.67,z,sx:.68,sy:.06,sz:.68}));
const tableBases=tableSites.map(([x,z])=>({x,y:.35,z,sx:.055,sy:.62,sz:.055}));
const seats=[];
tableSites.forEach(([x,z],i)=>{
  seats.push({x:x-1.00,y:.35,z,ry:Math.PI/2,sx:.62,sy:.38,sz:.62});
  seats.push({x:x+1.00,y:.35,z,ry:-Math.PI/2,sx:.62,sy:.38,sz:.62});
});
instancedStatic(hallLiving,new THREE.CylinderGeometry(1,1,1,20),MAT.walnut,tableTops,'KOMO_HALL_CAFE_TOPS_V30');
instancedStatic(hallLiving,new THREE.CylinderGeometry(1,1,1,10),MAT.brass,tableBases,'KOMO_HALL_CAFE_BASES_V30');
instancedStatic(hallLiving,new THREE.BoxGeometry(1,1,1),MAT.fabric,seats,'KOMO_HALL_CAFE_SEATS_V30');

// Sculptural plinths and art frames add gallery detail along both sides.
const artFrames=[
  {x:-11.43,y:3.55,z:1.2,ry:Math.PI/2,sx:2.0,sy:2.75,sz:.055},
  {x:11.43,y:3.55,z:-4.2,ry:-Math.PI/2,sx:2.0,sy:2.75,sz:.055},
  {x:-11.43,y:3.55,z:-18.2,ry:Math.PI/2,sx:2.0,sy:2.75,sz:.055}
];
instancedStatic(hallLiving,new THREE.BoxGeometry(1,1,1),MAT.blackened,artFrames,'KOMO_HALL_ART_FRAMES_V30');
// Explicit art interiors, only three meshes.
const artColors=[0x809484,0xc2a477,0x566c60];
artFrames.forEach((it,i)=>{
  const m=box(hallLiving,1.72,2.43,.025,new THREE.MeshBasicMaterial({color:artColors[i]}),it.x+(i===1?-.065:.065),it.y,it.z,{cast:false,receive:false});
  m.rotation.y=it.ry;
});

// Brand / culture walls.
plaque(hallLiving,'LONGEVITY IN MOTION','MEASURE · UNDERSTAND · TRAIN · LIVE',5.15,1.05,-11.32,5.78,7.4,{rotY:Math.PI/2,dark:true,titleSize:63});
plaque(hallLiving,'KŌMØ CULTURE','MOVEMENT · SCIENCE · COMMUNITY',4.75,.92,11.32,5.64,-15.6,{rotY:-Math.PI/2,dark:true,titleSize:57});

// One additional live editorial screen — existing motion-screen system is already throttled/culling-aware.
if(!lowPower)motionScreen(hallLiving,11.40,4.55,-8.8,-Math.PI/2,'TODAY AT KŌMØ');

// Material library objects near the Desk and Life entrance.
const displayCubes=[];
[[-5.1,2.25,2.4],[5.45,2.25,.6],[-5.25,2.25,-19.3],[5.2,2.25,-19.0]].forEach(([x,y,z],idx)=>{
  displayCubes.push({x,y,z,sx:.55,sy:.55,sz:.55,ry:idx*.42});
});
instancedStatic(hallLiving,new THREE.BoxGeometry(1,1,1),MAT.walnut,displayCubes,'KOMO_HALL_MATERIAL_OBJECTS_V30');

// Minimal low-cost wayfinding to make the hall legible as a hub.
plaque(hallLiving,'TWIN','UNDERSTAND',2.35,.58,-4.6,2.25,-25.9,{dark:true,titleSize:46});
plaque(hallLiving,'FITNESS CLUB','TRAIN DAILY',2.55,.58,0,2.25,-25.9,{dark:false,titleSize:42});
plaque(hallLiving,'ARENA','ENGAGE',2.35,.58,4.6,2.25,-25.9,{dark:true,titleSize:46});

// V3.1 lightweight Hall Host — visible human presence at negligible draw cost.
const hallHost=new THREE.Group();hallHost.name='KOMO_HALL_HOST_V31';hallHost.position.set(-3.95,0,9.3);building.add(hallHost);
const hostCloth=new THREE.MeshStandardMaterial({color:0x314f40,roughness:.76});
const hostSkin=new THREE.MeshStandardMaterial({color:0xc79370,roughness:.84});
mesh(hallHost,new THREE.CylinderGeometry(.22,.28,.70,lowPower?8:12),hostCloth,0,1.28,0,{cast:false});
mesh(hallHost,new THREE.SphereGeometry(.19,lowPower?9:14,lowPower?7:10),hostSkin,0,1.86,0,{cast:false});
[-.12,.12].forEach(x=>cyl(hallHost,.055,.065,.72,MAT.blackened,x,.58,0,lowPower?6:8,{cast:false}));
[-.31,.31].forEach(x=>cyl(hallHost,.043,.052,.60,hostSkin,x,1.27,0,lowPower?6:8,{cast:false}));
const hostShadow=new THREE.Mesh(new THREE.CircleGeometry(.32,16),new THREE.MeshBasicMaterial({color:0x1b2a23,transparent:true,opacity:.12,depthWrite:false}));
hostShadow.rotation.x=-Math.PI/2;hostShadow.position.y=.012;hallHost.add(hostShadow);
hallHost.userData.dynamic=true;

// Minimal planting, kept out of central axis.
[[-8.3,-5.5,1],[8.3,-5.5,-1],[-8.3,-17,-1],[8.3,-17,1]].forEach(([x,z,m])=>{
  box(building,3.0,.34,1.7,M.stoneDeep,x,.18,z);
  box(building,2.6,.08,1.35,M.soil,x,.39,z);
  tree(building,x+.18*m,z,.46);
});

// Hospitality moments: enough density to feel inhabited, kept outside the main circulation line.
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

// V1.9 ambient people — anonymous social life, separate from real Pulse members.
const npcRoot=new THREE.Group();npcRoot.name='KOMO_AMBIENT_PEOPLE_V19';world.add(npcRoot);
makeNpc(npcRoot,{role:'staff',label:'Maya',x:-2.8,y:0,z:11.2,outfit:'sage',speed:.34,phase:.12,route:[
  [-2.8,0,11.2],[-2.8,0,5.8],[-1.6,0,1.8],[-3.2,0,-2.5],[-4.0,0,4.2]
]});
makeNpc(npcRoot,{role:'visitor',label:'Noah',x:3.6,y:0,z:27.8,outfit:'cream',speed:.54,phase:.36,route:[
  [3.6,0,27.8],[2.5,0,18.7],[2.8,0,10.8],[3.6,0,2.5],[4.2,0,-6.2],[3.0,0,-14.4]
]});
if(!lowPower){
  makeNpc(npcRoot,{role:'visitor',label:'Elena',x:-3.8,y:0,z:-4.5,outfit:'sand',speed:.46,phase:.61,route:[
  [-3.8,0,-4.5],[-3.2,0,-12.0],[-4.8,0,-20.4],[-1.4,0,-24.2],[1.8,0,-19.2],[.8,0,-8.0]
]});
makeNpc(npcRoot,{role:'coach',label:'Leo',x:5.4,y:0,z:-18.4,outfit:'charcoal',speed:.42,phase:.82,route:[
  [5.4,0,-18.4],[5.2,0,-10.0],[4.8,0,-2.2],[3.7,0,5.2],[5.5,0,9.0]
]});
  makeNpc(npcRoot,{role:'visitor',label:'Sofia',x:7.0,y:0,z:5.8,outfit:'bronze',speed:.28,phase:.22,route:[
    [7.0,0,5.8],[9.2,0,4.2],[9.0,0,1.2],[7.2,0,.4],[7.4,0,3.0]
  ]});
  makeNpc(npcRoot,{role:'staff',label:'Camille',x:-6.3,y:0,z:6.7,outfit:'sage',speed:.24,phase:.43,route:[
    [-6.3,0,6.7],[-7.1,0,4.2],[-5.7,0,2.5],[-4.8,0,6.0],[-6.3,0,7.2]
  ]});
  makeNpc(npcRoot,{role:'visitor',label:'Lina',x:5.5,y:0,z:-11.8,outfit:'cream',speed:.25,phase:.67,route:[
    [5.5,0,-11.8],[6.8,0,-9.7],[5.9,0,-7.2],[4.8,0,-9.4],[5.5,0,-12.2]
  ]});
  makeNpc(npcRoot,{role:'staff',label:'Alex',x:-8.72,y:UPPER_Y,z:4.8,outfit:'sage',speed:.30,phase:.48,route:[
    [-8.72,UPPER_Y,4.8],[-8.72,UPPER_Y,-4.8],[-8.72,UPPER_Y,-14.8],[-4.2,UPPER_Y,-21.2]
  ]});
  makeNpc(npcRoot,{role:'visitor',label:'Mila',x:8.72,y:UPPER_Y,z:-3.0,outfit:'cream',speed:.31,phase:.72,route:[
    [8.72,UPPER_Y,-3.0],[8.72,UPPER_Y,-10.5],[8.72,UPPER_Y,-18.0],[3.6,UPPER_Y,-21.2],[.4,UPPER_Y,-21.2]
  ]});
}
// Living atmosphere — subtle, non-game-like movement.
const dustCount=lowPower?0:78;
const dustPositions=new Float32Array(dustCount*3);
for(let i=0;i<dustCount;i++){
  dustPositions[i*3]=(Math.random()-.5)*20;
  dustPositions[i*3+1]=.8+Math.random()*6.2;
  dustPositions[i*3+2]=-25+Math.random()*39;
}
const dustGeometry=new THREE.BufferGeometry();
dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
const dustMaterial=new THREE.PointsMaterial({color:0xf3dfbb,size:lowPower?.025:.032,transparent:true,opacity:.20,depthWrite:false});
living.dust=dustCount?new THREE.Points(dustGeometry,dustMaterial):null;
if(living.dust){living.dust.name='KOMO_AMBIENT_DUST';building.add(living.dust);}

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

// V3.2 KŌMØ Life — tangible items placed directly in the flagship.
const lifeItemsRoot=new THREE.Group();lifeItemsRoot.name='KOMO_LIFE_ITEMS_V32';lifeStore.add(lifeItemsRoot);
function lifePedestal(x,z,label,sub){
  const g=new THREE.Group();g.position.set(x,0,z);lifeItemsRoot.add(g);
  box(g,1.28,.48,1.12,MAT.travertine,0,.25,0);
  box(g,1.05,.055,.90,MAT.brass,0,.52,0);
  plaque(g,label,sub,1.55,.42,0,1.72,.50,{dark:true,titleSize:34});
  return g;
}
const strapPed=lifePedestal(-1.35,2.65,'MOTION STRAP','MOVE');
const strap=mesh(strapPed,new THREE.TorusGeometry(.27,.055,8,28),MAT.fabric,0,.92,0,{cast:true});strap.rotation.x=.55;strap.rotation.y=.25;
const bottlePed=lifePedestal(1.35,2.65,'KŌMØ BOTTLE','HYDRATE');
cyl(bottlePed,.14,.17,.62,MAT.charcoal,0,.88,0,18,{cast:true});cyl(bottlePed,.09,.11,.10,MAT.brass,0,1.25,0,14,{cast:true});
const recoveryPed=lifePedestal(-1.35,-2.55,'RECOVERY ROLL','RESET');
const recoveryRoll=cyl(recoveryPed,.22,.22,.78,MAT.fabricLight,0,.90,0,18,{cast:true});recoveryRoll.rotation.z=Math.PI/2;
const travelPed=lifePedestal(1.35,-2.55,'TRAVEL KIT','RIVIERA');
box(travelPed,.72,.42,.42,MAT.walnut,0,.83,0,{cast:true});box(travelPed,.55,.035,.30,MAT.brass,0,1.06,0);

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
  {x:0,title:'KŌMØ FITNESS',sub:'DAILY CLUB',dark:false},
  {x:6.8,title:'ARENA',sub:'ENGAGE',dark:true}
];
portals.forEach(({x,title,sub,dark})=>{
  box(building,4.9,5.8,.34,dark?M.sage:M.stone,x,3.15,-29.62);
  box(building,4.15,4.65,.10,dark?M.glass:M.stoneLight,x,2.85,-29.38);
  box(building,.08,4.9,.10,M.bronze,x-2.16,2.95,-29.29);
  box(building,.08,4.9,.10,M.bronze,x+2.16,2.95,-29.29);
  plaque(building,title,sub,4.2,1.05,x,6.28,-29.25,{dark,titleSize:title==='FUNCTIONAL TWIN'?58:70});
});

// V3.2 Destination Doors — clear, animated thresholds for Twin / Fitness / Arena.
[
  {id:'twin',x:-6.8,label:'TWIN',accent:0xb8d0bc},
  {id:'rehab',x:0,label:'KŌMØ FIT',accent:0xd9b77b},
  {id:'arena',x:6.8,label:'ARENA',accent:0xb9935c}
].forEach((cfg,idx)=>{
  const g=new THREE.Group();g.name='KOMO_DESTINATION_DOOR_'+cfg.id.toUpperCase()+'_V32';g.position.set(cfg.x,0,-28.98);building.add(g);
  box(g,4.55,.15,.34,MAT.blackened,0,.46,0);
  box(g,4.55,.15,.34,MAT.brass,0,5.28,0);
  [-2.20,2.20].forEach(px=>box(g,.14,5.0,.34,MAT.brass,px,2.86,0));
  const left=new THREE.Group(),right=new THREE.Group();left.position.x=-1.08;right.position.x=1.08;g.add(left,right);
  box(left,2.08,4.62,.075,M.glass,0,2.82,.02);
  box(right,2.08,4.62,.075,M.glass,0,2.82,.02);
  box(left,.055,4.55,.10,MAT.brass,1.00,2.82,.06);
  box(right,.055,4.55,.10,MAT.brass,-1.00,2.82,.06);
  const mat=new THREE.MeshBasicMaterial({color:cfg.accent,transparent:true,opacity:.12,depthWrite:false});
  const threshold=box(g,4.05,.018,.11,mat,0,.43,.42,{cast:false,receive:false});
  const beacon=mesh(g,new THREE.RingGeometry(.20,.27,24),mat,0,5.60,.12,{cast:false,receive:false});beacon.rotation.x=Math.PI/2;beacon.userData.dynamic=true;
  living.destinationDoors.push({id:cfg.id,x:cfg.x,left,right,threshold,beacon,mat,progress:0});
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

// V2.7 Biomechanical Twin overlay — low-cost joints + functional zones.
const biomech=new THREE.Group();biomech.name='KOMO_BIOMECH_TWIN_V27';biomech.position.copy(body.position);twinRoom.add(biomech);
const biomechZones={};
function bioMat(color,opacity=.58){return new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false})}
function joint(name,x,y,z,r=.085,color=0xd7c08e){
  const m=mesh(biomech,new THREE.SphereGeometry(r,lowPower?8:12,lowPower?6:9),bioMat(color,.70),x,y,z,{cast:false,receive:false});
  m.userData.dynamic=true;biomechZones[name]=biomechZones[name]||[];biomechZones[name].push(m);return m;
}
function zoneRing(name,x,y,z,r=.28,color=0xb9cfbf,rot='x'){
  const m=mesh(biomech,new THREE.RingGeometry(r*.78,r,lowPower?18:28),bioMat(color,.36),x,y,z,{cast:false,receive:false});
  m.rotation[rot]=Math.PI/2;m.userData.dynamic=true;biomechZones[name]=biomechZones[name]||[];biomechZones[name].push(m);return m;
}
// posture / spine
[-.05,.45,.95,1.45,1.95,2.45,2.95,3.45].forEach((off,i)=>joint('posture',0,1.05+off,.12,.055,i%2?0xd7c08e:0xb9cfbf));
// shoulders + hips = mobility
[[-.62,3.58,.05],[.62,3.58,.05],[-.30,2.18,.05],[.30,2.18,.05]].forEach(p=>zoneRing('mobility',...p,.22,0xb9cfbf,'y'));
// thighs = muscle
[[-.34,1.68,.08],[.34,1.68,.08],[-.34,1.22,.08],[.34,1.22,.08]].forEach(p=>zoneRing('muscle',...p,.21,0xd9b977,'y'));
// feet / base = balance
[[-.34,.34,.10],[.34,.34,.10]].forEach(p=>zoneRing('balance',...p,.25,0xaec8b6,'x'));
const balancePlatform=mesh(biomech,new THREE.RingGeometry(.66,.78,40),bioMat(0xaec8b6,.30),0,.08,.10,{cast:false,receive:false});balancePlatform.rotation.x=-Math.PI/2;balancePlatform.userData.dynamic=true;(biomechZones.balance||(biomechZones.balance=[])).push(balancePlatform);
// chest / breathing capacity = endurance
[.72,.92,1.12].forEach((r,i)=>{const m=mesh(biomech,new THREE.TorusGeometry(r,.022,8,lowPower?28:44),bioMat(0xd7c08e,.20),0,3.15,.12,{cast:false,receive:false});m.scale.y=.62;m.userData.dynamic=true;(biomechZones.endurance||(biomechZones.endurance=[])).push(m)});
let twinActiveDomain='all';

plaque(twinRoom,'CURRENT','MOTION SCORE · MOTION AGE',4.4,1.25,-6.7,4.2,-8.0,{dark:true,titleSize:78});
plaque(twinRoom,'LONGITUDINAL','BASELINE → TODAY',4.4,1.25,6.7,4.2,-8.0,{dark:true,titleSize:74});
glow(twinRoom,0xc9d7c9,2.0,12,0,5.5,-3);

// V2.6 Twin Lab — spatial domain readout around the body.
const twinLab=new THREE.Group();twinLab.name='KOMO_TWIN_LAB_V26';twinRoom.add(twinLab);
const twinDomainVisuals={};
const twinDomainLayout=[
  ['muscle',-5.15,1.4,-2.2,'MUSCLE'],
  ['mobility',5.15,1.4,-2.2,'MOBILITY'],
  ['balance',-5.15,1.4,2.9,'BALANCE'],
  ['posture',5.15,1.4,2.9,'POSTURE'],
  ['endurance',0,1.4,5.1,'ENDURANCE']
];
twinDomainLayout.forEach(([id,x,y,z,label],i)=>{
  const g=new THREE.Group();g.position.set(x,0,z);twinLab.add(g);
  box(g,2.25,.16,1.55,MAT.travertine,0,.08,0);
  const well=box(g,.52,2.45,.52,MAT.blackened,0,1.34,0);
  const fillMat=new THREE.MeshBasicMaterial({color:i%2?0xb8cbbf:0xd1b57c,transparent:true,opacity:.72});
  const fill=box(g,.38,1.0,.38,fillMat,0,.62,.29,{cast:false,receive:false});fill.userData.dynamic=true;
  const ring=mesh(g,new THREE.RingGeometry(.48,.54,28),new THREE.MeshBasicMaterial({color:0xd3b77f,transparent:true,opacity:.26,depthWrite:false}),0,.19,.30,{cast:false,receive:false});ring.rotation.x=-Math.PI/2;ring.userData.dynamic=true;
  plaque(g,label,'LIVE DOMAIN',1.95,.54,0,2.94,.32,{dark:true,titleSize:48});
  twinDomainVisuals[id]={group:g,fill,ring,label};
});
const twinTimeRail=new THREE.Group();twinTimeRail.name='KOMO_TWIN_TIMELINE_V26';twinRoom.add(twinTimeRail);
[-4.8,-2.4,0,2.4,4.8].forEach((x,i)=>{
  const dot=mesh(twinTimeRail,new THREE.RingGeometry(.15,.22,24),new THREE.MeshBasicMaterial({color:i===4?0xd4b77b:0x81958a,transparent:true,opacity:i===4?.70:.28,depthWrite:false}),x,.035,7.1,{cast:false,receive:false});dot.rotation.x=-Math.PI/2;
});
line(twinTimeRail,9.6,.035,0,7.1,M.bronze,.04);
plaque(twinRoom,'EXPLORE','APPROACH A DOMAIN · PRESS E',6.6,.72,0,1.05,8.7,{dark:false,titleSize:58});

// Rehab room.
rehabRoom.position.set(0,0,-55);
box(rehabRoom,22,.24,24,M.stoneLight,0,.10,0);
box(rehabRoom,.36,7.6,24,M.wall,-10.8,3.8,0);
box(rehabRoom,.36,7.6,24,M.wall,10.8,3.8,0);
box(rehabRoom,22,7.6,.36,M.sage,0,3.8,-11.8);
plaque(rehabRoom,'KŌMØ FITNESS CLUB','MOVE · TRAIN · PROGRESS',7.2,1.45,0,6.7,-11.55,{dark:true,titleSize:88});
[-5.3,0,5.3].forEach((x,i)=>{
  box(rehabRoom,4.0,.24,4.8,i===1?M.stoneDeep:M.stone,x,.12,-3.2);
  line(rehabRoom,3.5,.04,x,-3.2,M.bronze,.26);
});
plaque(rehabRoom,'01','BALANCE',3.2,.90,-5.3,4.6,-8.0,{dark:false,titleSize:74});
plaque(rehabRoom,'02','STRENGTH',3.2,.90,0,4.6,-8.0,{dark:true,titleSize:74});
plaque(rehabRoom,'03','CARDIO',3.2,.90,5.3,4.6,-8.0,{dark:false,titleSize:74});
glow(rehabRoom,0xf0d2a7,3.5,15,0,5.4,-6);

// V2.6 Rehab Lab — three tangible stations, no extra dynamic lights.
const rehabLab=new THREE.Group();rehabLab.name='KOMO_REHAB_LAB_V26';rehabRoom.add(rehabLab);
const rehabStationVisuals={};
[
  ['control',-5.3,-3.2,0xb7c9be],
  ['strength',0,-3.2,0xd3b77f],
  ['capacity',5.3,-3.2,0xb7c9be]
].forEach(([id,x,z,color],i)=>{
  const g=new THREE.Group();g.position.set(x,0,z);rehabLab.add(g);
  const ringMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.26,depthWrite:false});
  const ring=mesh(g,new THREE.RingGeometry(1.45,1.56,40),ringMat,0,.29,0,{cast:false,receive:false});ring.rotation.x=-Math.PI/2;ring.userData.dynamic=true;
  const pulse=mesh(g,new THREE.RingGeometry(.88,.94,34),ringMat.clone(),0,.30,0,{cast:false,receive:false});pulse.rotation.x=-Math.PI/2;pulse.userData.dynamic=true;
  rehabStationVisuals[id]={group:g,ring,pulse};
  if(id==='control'){
    box(g,1.55,.12,1.55,MAT.fabricLight,0,.36,0);
    line(g,1.30,.04,0,0,MAT.brass,.45);
    const marker=mesh(g,new THREE.RingGeometry(.22,.27,24),MAT.brass,0,.46,0);marker.rotation.x=-Math.PI/2;
  }else if(id==='strength'){
    box(g,1.90,.42,.62,MAT.walnut,0,.56,.20,{cast:true});
    box(g,1.90,.62,.18,MAT.fabric,0,.86,.48,{cast:true});
    [-.70,.70].forEach(px=>box(g,.12,.58,.12,MAT.brass,px,.29,.20));
  }else{
    for(let k=-2;k<=2;k++)box(g,.08,.018,1.55,MAT.brass,k*.38,.35,0,{cast:false,receive:false});
    box(g,2.20,.035,1.75,MAT.fabricLight,0,.31,0);
  }
});
plaque(rehabRoom,'COACH FLOOR','CHOOSE A STATION · PRESS E',6.8,.72,0,1.05,8.9,{dark:false,titleSize:58});

// V2.7 Rehab Coach — one lightweight demonstrator shared across all stations.
function makeRehabCoach(){
  const g=new THREE.Group();g.name='KOMO_REHAB_COACH_V27';g.position.set(0,0,-6.3);rehabRoom.add(g);
  const skin=new THREE.MeshStandardMaterial({color:0xb98463,roughness:.82});
  const cloth=new THREE.MeshStandardMaterial({color:0x2e493d,roughness:.76});
  const trouser=new THREE.MeshStandardMaterial({color:0x343b37,roughness:.82});
  const hair=new THREE.MeshStandardMaterial({color:0x2b2521,roughness:.92});
  const shoe=new THREE.MeshStandardMaterial({color:0x222220,roughness:.70});
  const cast=!lowPower;
  const hips=new THREE.Group();hips.position.y=.92;g.add(hips);
  box(hips,.50,.28,.30,trouser,0,0,0,{cast});
  const torso=new THREE.Group();torso.position.y=1.33;g.add(torso);
  mesh(torso,new THREE.CylinderGeometry(.23,.30,.72,lowPower?10:14),cloth,0,0,0,{cast});
  const head=new THREE.Group();head.position.y=1.90;g.add(head);
  mesh(head,new THREE.SphereGeometry(.205,lowPower?10:16,lowPower?8:12),skin,0,0,0,{cast});
  const cap=mesh(head,new THREE.SphereGeometry(.212,lowPower?10:14,lowPower?6:9,0,Math.PI*2,0,Math.PI*.5),hair,0,.07,-.005,{cast});cap.scale.set(.94,.88,.96);
  const leftLeg=new THREE.Group(),rightLeg=new THREE.Group();leftLeg.position.set(-.13,.88,0);rightLeg.position.set(.13,.88,0);g.add(leftLeg,rightLeg);
  const leftKnee=new THREE.Group(),rightKnee=new THREE.Group();leftKnee.position.y=-.31;rightKnee.position.y=-.31;leftLeg.add(leftKnee);rightLeg.add(rightKnee);
  cyl(leftLeg,.07,.078,.34,trouser,0,-.17,0,lowPower?7:10,{cast});cyl(rightLeg,.07,.078,.34,trouser,0,-.17,0,lowPower?7:10,{cast});
  cyl(leftKnee,.06,.068,.32,trouser,0,-.17,0,lowPower?7:10,{cast});cyl(rightKnee,.06,.068,.32,trouser,0,-.17,0,lowPower?7:10,{cast});
  box(leftKnee,.15,.09,.29,shoe,0,-.37,.06,{cast});box(rightKnee,.15,.09,.29,shoe,0,-.37,.06,{cast});
  const leftArm=new THREE.Group(),rightArm=new THREE.Group();leftArm.position.set(-.33,1.52,0);rightArm.position.set(.33,1.52,0);g.add(leftArm,rightArm);
  const leftElbow=new THREE.Group(),rightElbow=new THREE.Group();leftElbow.position.y=-.28;rightElbow.position.y=-.28;leftArm.add(leftElbow);rightArm.add(rightElbow);
  cyl(leftArm,.05,.058,.30,cloth,0,-.15,0,lowPower?7:10,{cast});cyl(rightArm,.05,.058,.30,cloth,0,-.15,0,lowPower?7:10,{cast});
  cyl(leftElbow,.045,.052,.27,skin,0,-.14,0,lowPower?7:10,{cast});cyl(rightElbow,.045,.052,.27,skin,0,-.14,0,lowPower?7:10,{cast});
  const tag=npcNameTag('ALEX','FITNESS COACH');tag.position.y=2.48;tag.scale.set(1.62,.46,1);g.add(tag);
  g.userData.dynamic=true;
  g.userData.coach={hips,torso,head,leftLeg,rightLeg,leftKnee,rightKnee,leftArm,rightArm,leftElbow,rightElbow,tag};
  return g;
}
const rehabCoach=makeRehabCoach();
const rehabCoachState={station:'control',running:false,phase:0};
plaque(rehabRoom,'COACH ALEX','DAILY MOVEMENT DEMO',3.4,.62,0,3.05,-9.15,{dark:true,titleSize:52});
const fitnessProgramWall=new THREE.Group();fitnessProgramWall.name='KOMO_FITNESS_PROGRAM_WALL_V29';rehabRoom.add(fitnessProgramWall);
[
  ['STRENGTH',-7.8],['MOBILITY',-3.9],['BALANCE',0],['CARDIO',3.9],['RECOVERY',7.8]
].forEach(([label,x],i)=>{
  plaque(fitnessProgramWall,String(i+1).padStart(2,'0'),label,2.6,.66,x,5.50,7.9,{dark:i%2===1,titleSize:43});
});

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
const arenaChallengeBoard=new THREE.Group();arenaChallengeBoard.name='KOMO_CHALLENGE_BOARD_V32';arenaChallengeBoard.position.set(0,0,2.7);arenaRoom.add(arenaChallengeBoard);
box(arenaChallengeBoard,5.8,.18,2.1,MAT.travertine,0,.10,0);
box(arenaChallengeBoard,5.15,2.65,.22,MAT.blackened,0,1.55,-.78,{cast:true});
plaque(arenaChallengeBoard,'WORLD CHALLENGES','DAILY · XP · COMMUNITY',4.7,.82,0,2.80,-.62,{dark:true,titleSize:54});
glow(arenaRoom,0xe4b96f,4.8,15,0,5.5,-5);

// Runtime state.
const player=new THREE.Vector3(0,0,13.8);
const velocity=new THREE.Vector3();
let playerLevel=0;
let cameraMode='third';
let thirdPersonDistance=lowPower?3.75:4.25;
const playerAvatar=makePlayerAvatar();
let playerFacing=0;
const cameraDesired=new THREE.Vector3(),cameraLook=new THREE.Vector3();
let yaw=0,pitch=-.045;
let targetYaw=yaw,targetPitch=pitch;
let mode='world';
let currentInteraction=null;
let doorProgress=0,doorTarget=0,doorHoldUntil=0,doorLastOpen=false;
let dragging=false,lastX=0,lastY=0;
let joyX=0,joyY=0,joyTargetX=0,joyTargetY=0,joyPointer=null;
const keys=new Set();

const interactions=[
  {id:'desk',x:-7.3,z:4.0,r:3.6,title:()=>copy[locale].deskTitle,desc:()=>copy[locale].deskCopy,action:showDesk},
  {id:'twin',x:-6.8,z:-26.7,r:4.0,title:()=>copy[locale].twinTitle,desc:()=>copy[locale].twinCopy,action:enterTwin},
  {id:'rehab',x:0,z:-26.7,r:4.0,title:()=>copy[locale].rehabTitle,desc:()=>copy[locale].rehabCopy,action:enterRehab},
  {id:'arena',x:6.8,z:-26.7,r:4.0,title:()=>copy[locale].arenaTitle,desc:()=>copy[locale].arenaCopy,action:enterArena},
  {id:'library',x:-10.7,z:-10,r:3.2,title:()=>copy[locale].libraryTitle,desc:()=>copy[locale].libraryCopy,action:showLibrary},
  {id:'talks',x:10.7,z:-10,r:3.2,title:()=>copy[locale].talksTitle,desc:()=>copy[locale].talksCopy,action:showTalks},
  {id:'life',x:8.6,z:2.6,r:3.4,title:()=>copy[locale].storeTitle,desc:()=>copy[locale].storeCopy,action:showLifeStore},
  {id:'journey',x:4.8,z:8.5,r:3.0,title:()=>locale==='fr'?'World Journey':'World Journey',desc:()=>locale==='fr'?'Voir votre niveau, vos XP et les prochaines étapes.':'View your level, XP and next steps.',action:showJourneyPanel},
  {id:'fountain',x:0,z:68.2,r:5.4,title:()=>locale==='fr'?'Grande Fontaine · KŌMØ District':'Grand Fountain · KŌMØ District',desc:()=>locale==='fr'?'Découvrir le campus extérieur · +15 XP':'Discover the exterior campus · +15 XP',action:showFountain},
  {id:'life_strap',x:7.10,z:6.45,r:1.35,title:()=> 'Motion Strap',desc:()=>locale==='fr'?'KŌMØ Life · objet mouvement':'KŌMØ Life · movement object',action:()=>showLifeItem('strap')},
  {id:'life_bottle',x:9.80,z:6.45,r:1.35,title:()=> 'KŌMØ Bottle',desc:()=>locale==='fr'?'KŌMØ Life · hydratation':'KŌMØ Life · hydration',action:()=>showLifeItem('bottle')},
  {id:'life_recovery',x:7.10,z:1.25,r:1.35,title:()=> 'Recovery Roll',desc:()=>locale==='fr'?'KŌMØ Life · récupération':'KŌMØ Life · recovery',action:()=>showLifeItem('recovery')},
  {id:'life_travel',x:9.80,z:1.25,r:1.35,title:()=> 'Travel Kit',desc:()=>locale==='fr'?'KŌMØ Life · Riviera':'KŌMØ Life · Riviera',action:()=>showLifeItem('travel')}
];

const arenaInteractions=[
  {id:'challenge_board',x:45,z:2.7,r:3.5,title:()=>locale==='fr'?'World Challenges':'World Challenges',desc:()=>locale==='fr'?'Voir les défis du jour':'View today’s challenges',action:showChallenges}
];

const twinInteractions=[
  {id:'twin_muscle',domain:'muscle',x:-50.15,z:-2.2,r:2.0},
  {id:'twin_mobility',domain:'mobility',x:-39.85,z:-2.2,r:2.0},
  {id:'twin_balance',domain:'balance',x:-50.15,z:2.9,r:2.0},
  {id:'twin_posture',domain:'posture',x:-39.85,z:2.9,r:2.0},
  {id:'twin_endurance',domain:'endurance',x:-45,z:5.1,r:2.0}
].map(it=>({
  ...it,
  title:()=>twinDomainName(it.domain),
  desc:()=>locale==='fr'?'Explorer ce domaine du Twin':'Explore this Twin domain',
  action:()=>showTwinDomain(it.domain)
}));
const rehabInteractions=[
  {id:'rehab_control',station:'control',x:-5.3,z:-58.2,r:2.35},
  {id:'rehab_strength',station:'strength',x:0,z:-58.2,r:2.35},
  {id:'rehab_capacity',station:'capacity',x:5.3,z:-58.2,r:2.35}
].map(it=>({
  ...it,
  title:()=>rehabStationCopy(it.station).title[locale],
  desc:()=>locale==='fr'?'Ouvrir la station guidée':'Open guided station',
  action:()=>showRehabStation(it.station)
}));
rehabInteractions.push({
  id:'rehab_coach',x:0,z:-61.3,r:2.15,
  title:()=>locale==='fr'?'Alex · Fitness Coach':'Alex · Rehab Coach',
  desc:()=>locale==='fr'?'Voir le rôle du coach virtuel':'Learn about the virtual coach',
  action:()=>showRehabCoach()
});

function notify(message){
  toastEl.textContent=message;toastEl.classList.add('show');clearTimeout(notify.t);
  notify.t=setTimeout(()=>toastEl.classList.remove('show'),1800);
}
const JOURNEY_KEY='komo_world_journey_v1';
const JOURNEY_LEVELS=[
  {level:1,min:0,title:{fr:'ARRIVAL',en:'ARRIVAL'},desc:{fr:'Entrer',en:'Enter'}},
  {level:2,min:35,title:{fr:'EXPLORER',en:'EXPLORER'},desc:{fr:'Découvrir',en:'Discover'}},
  {level:3,min:85,title:{fr:'NAVIGATOR',en:'NAVIGATOR'},desc:{fr:'Comprendre',en:'Understand'}},
  {level:4,min:150,title:{fr:'MOVER',en:'MOVER'},desc:{fr:'Agir',en:'Act'}},
  {level:5,min:220,title:{fr:'PIONEER',en:'PIONEER'},desc:{fr:'Connecter',en:'Connect'}}
];
const JOURNEY_MISSIONS=[
  {id:'arrival',xp:10,title:{fr:'Entrer dans KŌMØ World',en:'Enter KŌMØ World'},sub:{fr:'Commencer votre parcours',en:'Start your journey'}},
  {id:'hall',xp:20,title:{fr:'Découvrir le Hall',en:'Discover the Hall'},sub:{fr:'Franchir l’entrée principale',en:'Cross the main entrance'}},
  {id:'journey',xp:15,title:{fr:'Comprendre le World Journey',en:'Understand World Journey'},sub:{fr:'Ouvrir la station de progression',en:'Open the progression station'}},
  {id:'twin',xp:35,title:{fr:'Explorer le Functional Twin',en:'Explore Functional Twin'},sub:{fr:'Comprendre votre espace de données',en:'Understand your data space'}},
  {id:'rehab',xp:35,title:{fr:'Entrer au KŌMØ Fitness Club',en:'Enter KŌMØ Fitness Club'},sub:{fr:'Choisir votre pratique',en:'Choose your activity'}},
  {id:'rehab_session',xp:25,title:{fr:'Compléter votre séance du jour',en:'Complete today’s session'},sub:{fr:'Construire votre régularité',en:'Build your consistency'}},
  {id:'arena',xp:35,title:{fr:'Entrer dans Arena',en:'Enter Arena'},sub:{fr:'Découvrir les challenges',en:'Discover challenges'}},
  {id:'life',xp:25,title:{fr:'Visiter KŌMØ Life',en:'Visit KŌMØ Life'},sub:{fr:'Relier World au réel',en:'Connect World to real life'}},
  {id:'upper',xp:30,title:{fr:'Atteindre le Level 2',en:'Reach Level 2'},sub:{fr:'Explorer les galeries hautes',en:'Explore the upper galleries'}},
  {id:'library',xp:20,title:{fr:'Ouvrir Science Library',en:'Open Science Library'},sub:{fr:'Voir la méthode et les sources',en:'See method and sources'}},
  {id:'talks',xp:20,title:{fr:'Découvrir Talks',en:'Discover Talks'},sub:{fr:'Experts et événements',en:'Experts and events'}},
  {id:'social',xp:15,title:{fr:'Échanger avec un membre du World',en:'Meet someone in the World'},sub:{fr:'Parler à un PNJ',en:'Talk to an NPC'}}
];
const JOURNEY_BADGES=[
  {id:'first',label:{fr:'FIRST STEP',en:'FIRST STEP'},test:()=>!!journey.done.arrival},
  {id:'explorer',label:{fr:'EXPLORER',en:'EXPLORER'},test:()=>['hall','journey','life'].every(id=>journey.done[id])},
  {id:'insight',label:{fr:'INSIGHT',en:'INSIGHT'},test:()=>!!journey.done.twin},
  {id:'mover',label:{fr:'MOVER',en:'MOVER'},test:()=>journey.done.rehab&&journey.done.arena},
  {id:'activated',label:{fr:'ACTIVATED',en:'ACTIVATED'},test:()=>!!journey.done.rehab_session},
  {id:'connector',label:{fr:'CONNECTED',en:'CONNECTED'},test:()=>!!journey.done.social},
  {id:'pioneer',label:{fr:'PIONEER',en:'PIONEER'},test:()=>JOURNEY_MISSIONS.filter(m=>m.id!=='social').every(m=>journey.done[m.id])}
];
function loadJourney(){
  try{
    const raw=JSON.parse(localStorage.getItem(JOURNEY_KEY)||'{}');
    return {done:raw.done&&typeof raw.done==='object'?raw.done:{},xp:Number(raw.xp)||0};
  }catch{return {done:{},xp:0}}
}
const journey=loadJourney();
function saveJourney(){try{localStorage.setItem(JOURNEY_KEY,JSON.stringify(journey))}catch{}}
function journeyLevelForXp(xp){
  let result=JOURNEY_LEVELS[0];
  for(const l of JOURNEY_LEVELS)if(xp>=l.min)result=l;
  return result;
}
function journeyNextLevel(level){
  return JOURNEY_LEVELS.find(l=>l.level===level.level+1)||null;
}
function journeyNextMission(){
  return JOURNEY_MISSIONS.find(m=>!journey.done[m.id])||null;
}
function updateJourneyUI(){
  const level=journeyLevelForXp(journey.xp),nextLevel=journeyNextLevel(level),nextMission=journeyNextMission();
  const floor=level.min,ceil=nextLevel?nextLevel.min:Math.max(level.min+1,journey.xp);
  const pct=nextLevel?THREE.MathUtils.clamp((journey.xp-floor)/(ceil-floor)*100,0,100):100;
  journeyLevelEl.textContent=String(level.level).padStart(2,'0');
  journeyTitleEl.textContent=level.title[locale];
  journeyXpEl.textContent=journey.xp;
  journeyProgressEl.style.width=pct+'%';
  journeyNextEl.textContent=nextMission?(nextMission.title[locale]+' · +'+nextMission.xp+' XP'):(locale==='fr'?'Journey complété':'Journey complete');
  journeyMenuLevel.textContent='LEVEL '+String(level.level).padStart(2,'0')+' · '+level.title[locale];
  journeyMenuXp.textContent=journey.xp+' XP';
  journeyMenuProgress.style.width=pct+'%';
  journeyMenuNext.textContent=nextMission?(locale==='fr'?'Prochaine étape : ':'Next step: ')+nextMission.title[locale]:(locale==='fr'?'Vous avez exploré le parcours actuel.':'You explored the current journey.');
  journeyLevelLadder.innerHTML=JOURNEY_LEVELS.map(l=>`
    <div class="journey-step ${l.level<level.level?'done':''} ${l.level===level.level?'current':''}">
      <span>${String(l.level).padStart(2,'0')}</span><b>${l.title[locale]}</b><small>${l.desc[locale]}</small>
    </div>`).join('');
  journeyBadgesEl.innerHTML=JOURNEY_BADGES.map(b=>`<span class="journey-badge ${b.test()?'unlocked':''}">${b.test()?'✓ ':''}${b.label[locale]}</span>`).join('');
  journeyMissionsEl.innerHTML=JOURNEY_MISSIONS.map((m,i)=>`
    <div class="journey-mission ${journey.done[m.id]?'done':''}">
      <i>${journey.done[m.id]?'✓':String(i+1).padStart(2,'0')}</i>
      <span><b>${m.title[locale]}</b><small>${m.sub[locale]}</small></span>
      <small>+${m.xp} XP</small>
    </div>`).join('');
}
function completeJourney(id,{silent=false}={}){
  const mission=JOURNEY_MISSIONS.find(m=>m.id===id);if(!mission||journey.done[id])return false;
  const before=journeyLevelForXp(journey.xp);
  journey.done[id]=Date.now();journey.xp+=mission.xp;saveJourney();updateJourneyUI();
  journeyHud.classList.remove('pulse');void journeyHud.offsetWidth;journeyHud.classList.add('pulse');
  const after=journeyLevelForXp(journey.xp);
  if(!silent){
    notify(after.level>before.level
      ?(locale==='fr'?'LEVEL '+after.level+' · '+after.title.fr:'LEVEL '+after.level+' · '+after.title.en)
      :'+'+mission.xp+' XP · '+mission.title[locale]);
  }
  return true;
}
function journeyHtml(){
  const level=journeyLevelForXp(journey.xp),next=journeyNextMission();
  return `
    <div class="metric-hero"><div><span>WORLD LEVEL</span><strong>${String(level.level).padStart(2,'0')}</strong></div><div><span>EXPERIENCE</span><strong>${journey.xp}<em> XP</em></strong></div></div>
    <div class="priority-card"><b>${locale==='fr'?'NIVEAU ACTUEL':'CURRENT LEVEL'}</b>${level.title[locale]}</div>
    <div class="panel-grid">${JOURNEY_MISSIONS.slice(0,8).map(m=>`<div><span>${journey.done[m.id]?'✓ DONE':'+'+m.xp+' XP'}</span><b>${m.title[locale]}</b></div>`).join('')}</div>
    <div class="data-note">${locale==='fr'?'Les XP récompensent l’exploration et l’engagement dans World. Aucun score de santé, Motion Score ou Motion Age n’entre dans ce niveau.':'XP rewards exploration and engagement in World. No health score, Motion Score or Motion Age contributes to this level.'}</div>
    ${next?`<div class="priority-card"><b>${locale==='fr'?'PROCHAINE ÉTAPE':'NEXT STEP'}</b>${next.title[locale]} · +${next.xp} XP</div>`:''}`;
}
function showJourneyPanel(){
  completeJourney('journey');
  openPanel('WORLD JOURNEY',locale==='fr'?'Votre progression dans KŌMØ World.':'Your progression through KŌMØ World.',journeyHtml(),[
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel},
    {label:locale==='fr'?'PROCHAINE ÉTAPE':'NEXT STEP',primary:true,onClick:()=>{const n=journeyNextMission();closePanel();if(n&&travelPoints[n.id])fastTravel(n.id)}}
  ]);
}
journeyHud.addEventListener('click',showJourneyPanel);

// V3.2 Health Snapshot — movement-oriented overview, separate from World XP.
function updateHealthHUD(){
  const snap=current(),d=snap.domains||{};
  const score=Number(snap.motion_score)||0;
  const cmp=core.compare?.(baseline.snapshot_id,snap.snapshot_id,'world-v1');
  const delta=Number(cmp?.motion_score_delta)||0;
  const trend=delta>1?(locale==='fr'?'EN HAUSSE':'UP'):delta<-1?(locale==='fr'?'À SUIVRE':'WATCH'):(locale==='fr'?'STABLE':'STABLE');
  healthStatusEl.textContent=score+' · '+trend;
  healthMuscleEl.textContent=Math.round(Number(d.muscle)||0);
  healthBalanceEl.textContent=Math.round(Number(d.balance)||0);
  healthCapacityEl.textContent=Math.round(Number(d.endurance)||0);
  healthSourceEl.textContent='DEMO';
}
function healthOverviewHtml(){
  const snap=current(),d=snap.domains||{};
  const rows=[
    ['MUSCLE',d.muscle], [locale==='fr'?'MOBILITÉ':'MOBILITY',d.mobility],
    [locale==='fr'?'ÉQUILIBRE':'BALANCE',d.balance],['POSTURE',d.posture],['CAPACITY',d.endurance]
  ];
  return `
    <div class="metric-hero"><div><span>MOTION SCORE</span><strong>${snap.motion_score}<em>/100</em></strong></div><div><span>MOTION AGE</span><strong>${snap.motion_age}</strong></div></div>
    <div class="health-overview">${rows.map(([label,val])=>`<div class="health-row"><span>${label}</span><i><em style="width:${THREE.MathUtils.clamp(Number(val)||0,0,100)}%"></em></i><b>${Math.round(Number(val)||0)}</b></div>`).join('')}</div>
    <div class="priority-card"><b>${locale==='fr'?'COMMENT LIRE CET APERÇU':'HOW TO READ THIS'}</b>${locale==='fr'?'Il résume les domaines de mouvement suivis dans le Functional Twin. Ouvrez le Twin pour comprendre chaque domaine et son évolution dans le temps.':'It summarises movement domains tracked in Functional Twin. Open Twin to understand each domain and its change over time.'}</div>
    <div class="data-note">${locale==='fr'?'Aperçu informatif du mouvement, pas un diagnostic. Les valeurs sont actuellement celles du jeu de démonstration TwinCore tant que Pulse personnel n’est pas connecté.':'Informational movement overview, not a diagnosis. Values currently use the TwinCore demo dataset until a personal Pulse session is connected.'}</div>`;
}
function showHealthOverview(){
  openPanel(locale==='fr'?'VOTRE SANTÉ · MOUVEMENT':'YOUR HEALTH · MOVEMENT',locale==='fr'?'Comprendre votre état en un coup d’œil.':'Understand your movement status at a glance.',healthOverviewHtml(),[
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel},
    {label:locale==='fr'?'OUVRIR LE TWIN':'OPEN TWIN',primary:true,onClick:enterTwin}
  ]);
}
healthHud.addEventListener('click',showHealthOverview);
updateHealthHUD();

// V3.2 Daily World Challenges — engagement only, never health rankings.
const CHALLENGE_KEY='komo_world_challenges_v1';
const challengeDefs=[
  {id:'distance',reward:20,target:120,title:{fr:'Explorer le World',en:'Explore the World'},sub:{fr:'Parcourir 120 m dans le campus',en:'Move 120 m through the campus'}},
  {id:'twin',reward:20,target:1,title:{fr:'Lire votre Twin',en:'Read your Twin'},sub:{fr:'Entrer dans Functional Twin',en:'Enter Functional Twin'}},
  {id:'fitness',reward:25,target:1,title:{fr:'Bouger aujourd’hui',en:'Move today'},sub:{fr:'Valider la séance KŌMØ Fitness Club',en:'Complete today’s KŌMØ Fitness Club session'}},
  {id:'fountain',reward:15,target:1,title:{fr:'Découvrir la grande fontaine',en:'Discover the Grand Fountain'},sub:{fr:'Explorer le nouveau KŌMØ District',en:'Explore the new KŌMØ District'}}
];
function loadChallengeState(){
  const today=localDateKey();
  try{
    const raw=JSON.parse(localStorage.getItem(CHALLENGE_KEY)||'{}');
    if(raw.date===today)return {date:today,progress:raw.progress||{},done:raw.done||{},points:Number(raw.points)||0};
  }catch{}
  return {date:today,progress:{},done:{},points:0};
}
const challenges=loadChallengeState();
function saveChallenges(){try{localStorage.setItem(CHALLENGE_KEY,JSON.stringify(challenges))}catch{}}
function challengeProgress(id){return Number(challenges.progress[id])||0}
function completeChallenge(id){
  const d=challengeDefs.find(x=>x.id===id);if(!d||challenges.done[id])return false;
  challenges.progress[id]=d.target;challenges.done[id]=Date.now();challenges.points+=d.reward;saveChallenges();
  journey.xp+=d.reward;saveJourney();updateJourneyUI();
  notify('+'+d.reward+' XP · '+d.title[locale]);return true;
}
function addChallengeProgress(id,amount){
  const d=challengeDefs.find(x=>x.id===id);if(!d||challenges.done[id])return;
  challenges.progress[id]=Math.min(d.target,challengeProgress(id)+amount);saveChallenges();
  if(challenges.progress[id]>=d.target)completeChallenge(id);
}
function challengesHtml(){
  return `
    <div class="panel-grid"><div><span>DAILY</span><b>${challengeDefs.filter(d=>challenges.done[d.id]).length}/${challengeDefs.length}</b></div><div><span>CHALLENGE XP</span><b>${challenges.points}</b></div></div>
    <div class="challenge-grid">${challengeDefs.map(d=>{const p=Math.min(d.target,challengeProgress(d.id)),pct=d.target?p/d.target*100:0;return `
      <div class="challenge-card ${challenges.done[d.id]?'done':''}">
        <span><em>+${d.reward} XP</em><em>${challenges.done[d.id]?'✓ DONE':Math.round(p)+' / '+d.target}</em></span>
        <b>${d.title[locale]}</b><small>${d.sub[locale]}</small>
        <i><em style="width:${pct}%"></em></i>
      </div>`}).join('')}</div>
    <div class="data-note">${locale==='fr'?'Les défis récompensent l’exploration et l’activité. Ils ne comparent ni Motion Score ni données de santé entre utilisateurs.':'Challenges reward exploration and activity. They never compare Motion Score or health data between users.'}</div>`;
}
function showChallenges(){
  openPanel('WORLD CHALLENGES',locale==='fr'?'Vos défis du jour.':'Your challenges for today.',challengesHtml(),[
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel},
    {label:locale==='fr'?'ALLER À L’ARENA':'GO TO ARENA',primary:true,onClick:()=>fastTravel('arena')}
  ]);
}
challengesToggle.addEventListener('click',()=>{closeWorldMenu();showChallenges()});

// V3.2 lightweight Avatar Studio.
const AVATAR_KEY='komo_world_avatar_v1';
const avatarPalettes={
  outfit:{sage:[0x24483a,0x19372d,0x303733],sand:[0xa69379,0x756451,0x423d36],black:[0x282d2a,0x171b19,0x242624]},
  skin:{light:[0xd4a17d,0xbd805f],medium:[0xb87e59,0x9d6548],deep:[0x7c4f38,0x653b29]},
  hair:{dark:0x2a2420,brown:0x5a3c2d,grey:0x6b6a65}
};
function loadAvatarConfig(){try{return {...{outfit:'sage',skin:'medium',hair:'dark'},...JSON.parse(localStorage.getItem(AVATAR_KEY)||'{}')}}catch{return {outfit:'sage',skin:'medium',hair:'dark'}}}
const avatarConfig=loadAvatarConfig();
function applyAvatarConfig(){
  const mats=playerAvatar.userData.avatar.materials;if(!mats)return;
  const o=avatarPalettes.outfit[avatarConfig.outfit]||avatarPalettes.outfit.sage;
  const sk=avatarPalettes.skin[avatarConfig.skin]||avatarPalettes.skin.medium;
  mats.cloth.color.setHex(o[0]);mats.clothDark.color.setHex(o[1]);mats.trouser.color.setHex(o[2]);
  mats.skin.color.setHex(sk[0]);mats.skinWarm.color.setHex(sk[1]);
  mats.hair.color.setHex(avatarPalettes.hair[avatarConfig.hair]||avatarPalettes.hair.dark);
}
function saveAvatarConfig(){try{localStorage.setItem(AVATAR_KEY,JSON.stringify(avatarConfig))}catch{}applyAvatarConfig()}
function avatarStudioHtml(){
  const row=(key,label,opts)=>`<div class="avatar-option-row"><span>${label}</span><div class="avatar-swatches">${opts.map(([id,name])=>`<button data-avatar-key="${key}" data-avatar-value="${id}" class="${avatarConfig[key]===id?'selected':''}">${name}</button>`).join('')}</div></div>`;
  return `<div class="avatar-options">
    ${row('outfit',locale==='fr'?'TENUE':'OUTFIT',[['sage','KŌMØ SAGE'],['sand','RIVIERA SAND'],['black','MIDNIGHT']])}
    ${row('skin',locale==='fr'?'TEINTE':'SKIN',[['light','LIGHT'],['medium','MEDIUM'],['deep','DEEP']])}
    ${row('hair',locale==='fr'?'CHEVEUX':'HAIR',[['dark','DARK'],['brown','BROWN'],['grey','GREY']])}
  </div><div class="data-note">${locale==='fr'?'Personnalisation locale de votre avatar World. La synchronisation complète avec Pulse pourra reprendre cette configuration.':'Local World avatar customisation. Full Pulse sync can reuse this configuration.'}</div>`;
}
function bindAvatarStudio(){
  panelBody.querySelectorAll('[data-avatar-key]').forEach(btn=>btn.addEventListener('click',()=>{
    avatarConfig[btn.dataset.avatarKey]=btn.dataset.avatarValue;saveAvatarConfig();showAvatarStudio();
  }));
}
function showAvatarStudio(){
  openPanel('AVATAR STUDIO',locale==='fr'?'Personnalisez votre présence dans KŌMØ World.':'Customise your presence in KŌMØ World.',avatarStudioHtml(),[
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel}
  ]);bindAvatarStudio();
}
avatarToggle.addEventListener('click',()=>{closeWorldMenu();showAvatarStudio()});
applyAvatarConfig();

function syncUiOpen(){
  document.body.classList.toggle('ui-open',worldMenu.classList.contains('open')||panel.classList.contains('open'));
}
function closeWorldMenu(){
  worldMenu.classList.remove('open');worldMenu.setAttribute('aria-hidden','true');syncUiOpen();
}
function openWorldMenu(){
  closePanel();worldMenu.classList.add('open');worldMenu.setAttribute('aria-hidden','false');velocity.set(0,0,0);syncUiOpen();
}
function toggleWorldMenu(){worldMenu.classList.contains('open')?closeWorldMenu():openWorldMenu()}
function setCameraMode(next){
  cameraMode=next==='first'?'first':'third';
  document.body.classList.toggle('camera-third',cameraMode==='third');
  playerAvatar.visible=cameraMode==='third';
  cameraToggle.textContent='CAMERA · '+(cameraMode==='third'?'3RD':'1ST');
}
function toggleCamera(){setCameraMode(cameraMode==='third'?'first':'third')}
setCameraMode('third');
const travelPoints={
  arrival:{mode:'world',x:0,y:0,z:58.5,yaw:Math.PI,level:0},
  hall:{mode:'world',x:0,y:0,z:13.8,yaw:0,level:0},
  twin:{mode:'world',x:-5.9,y:0,z:-22.2,yaw:0,level:0},
  rehab:{mode:'world',x:0,y:0,z:-22.2,yaw:0,level:0},
  arena:{mode:'world',x:5.9,y:0,z:-22.2,yaw:0,level:0},
  life:{mode:'world',x:5.4,y:0,z:3.6,yaw:-1.15,level:0},
  upper:{mode:'world',x:-8.72,y:UPPER_Y,z:5.7,yaw:0,level:1}
};
const journeyTargets={
  arrival:{x:0,y:0,z:58.5},hall:{x:0,y:0,z:13.8},journey:{x:4.8,y:0,z:8.5},
  twin:{x:-6.8,y:0,z:-26.0},rehab:{x:0,y:0,z:-26.0},rehab_session:{x:0,y:0,z:-58.2},arena:{x:6.8,y:0,z:-26.0},
  life:{x:8.4,y:0,z:3.4},upper:{x:-8.72,y:UPPER_Y,z:5.7},library:{x:-10.2,y:0,z:-10},talks:{x:10.2,y:0,z:-10}
};
function setGuideEnabled(value){
  guideEnabled=!!value;guideRoot.visible=guideEnabled;guideToggle.textContent='GUIDE · '+(guideEnabled?'ON':'OFF');
}
function toggleGuide(){setGuideEnabled(!guideEnabled)}
function guideTarget(){
  const m=journeyNextMission();if(!m)return null;
  if(m.id==='social'){
    const n=living.npcs.find(n=>n.visible&&Math.abs(n.position.y-player.y)<1.2);
    return n?{x:n.position.x,y:n.position.y,z:n.position.z}:journeyTargets.hall;
  }
  return journeyTargets[m.id]||null;
}
function updateJourneyGuide(now){
  if(!guideEnabled||mode!=='world'){guideRoot.visible=false;return}
  const target=guideTarget();if(!target){guideRoot.visible=false;return}
  guideRoot.visible=true;
  if(now-guideLastUpdate<90)return;guideLastUpdate=now;
  const dx=target.x-player.x,dz=target.z-player.z,dist=Math.hypot(dx,dz);
  const count=guideDots.length;
  guideDots.forEach((g,i)=>{
    const t=(i+1)/(count+1),fade=THREE.MathUtils.clamp((dist-1.5)/8,0,1);
    g.visible=fade>.05;
    g.position.set(player.x+dx*t,player.y+.035,player.z+dz*t);
    g.scale.setScalar(.72+.20*Math.sin(now*.004+i*.8));
  });
  waypoint.position.set(target.x,target.y+.06,target.z);
  waypointRing.rotation.z=now*.0011;
  waypoint.scale.setScalar(.92+.06*Math.sin(now*.003));
}
setGuideEnabled(true);
function fastTravel(id){
  const p=travelPoints[id];if(!p)return;
  closePanel();closeWorldMenu();travelFade.classList.add('active');velocity.set(0,0,0);keys.clear();
  setTimeout(()=>{
    setMode(p.mode);playerLevel=p.level;player.set(p.x,p.y,p.z);yaw=targetYaw=p.yaw;pitch=targetPitch=-.035;syncPlayerElevation();updateLocation();if(id==='upper')completeJourney('upper');else if(['twin','rehab','arena','life'].includes(id))completeJourney(id);
    setTimeout(()=>travelFade.classList.remove('active'),110);
  },180);
}
document.querySelectorAll('[data-fast-travel]').forEach(btn=>btn.addEventListener('click',()=>fastTravel(btn.dataset.fastTravel)));
function closePanel(){
  if(typeof rehabSessionTimer!=='undefined'&&rehabSessionTimer)stopRehabSession();
  panel.classList.remove('open');panel.setAttribute('aria-hidden','true');panelActions.innerHTML='';syncUiOpen();
}
function openPanel(kicker,title,html,actions=[]){
  panelKicker.textContent=kicker;panelTitle.textContent=title;panelBody.innerHTML=html;panelActions.innerHTML='';
  actions.forEach(a=>{
    const b=document.createElement('button');b.type='button';b.textContent=a.label;if(a.primary)b.classList.add('primary');
    b.addEventListener('click',a.onClick);panelActions.appendChild(b);
  });
  panel.classList.add('open');panel.setAttribute('aria-hidden','false');worldMenu.classList.remove('open');worldMenu.setAttribute('aria-hidden','true');velocity.set(0,0,0);syncUiOpen();
}
function deskHtml(){
  const s=current();
  if(locale==='fr')return `
    <p>Votre World organise votre parcours autour de trois espaces. Aucun personnage d'accueil : le Desk est simplement votre point d'orientation.</p>
    <div class="panel-grid"><div><span>01 · UNDERSTAND</span><b>Functional Twin</b></div><div><span>02 · ACT</span><b>KŌMØ Fitness Club</b></div><div><span>03 · ENGAGE</span><b>Arena</b></div><div><span>ÉTAT ACTUEL</span><b>Motion ${s.motion_score}</b></div></div>
    <div class="priority-card"><b>PROCHAINE ÉTAPE</b>Commencez par le Functional Twin pour voir votre état actuel et votre progression depuis la baseline.</div>`;
  return `
    <p>Your World is organised around three spaces. There is no reception avatar: the Desk is simply your orientation point.</p>
    <div class="panel-grid"><div><span>01 · UNDERSTAND</span><b>Functional Twin</b></div><div><span>02 · ACT</span><b>KŌMØ Fitness Club</b></div><div><span>03 · ENGAGE</span><b>Arena</b></div><div><span>CURRENT STATE</span><b>Motion ${s.motion_score}</b></div></div>
    <div class="priority-card"><b>NEXT STEP</b>Start with Functional Twin to review your current state and progression from baseline.</div>`;
}
function showDesk(){
  completeJourney('hall',{silent:true});
  openPanel('KŌMØ DESK',locale==='fr'?'Votre prochaine étape.':'Your next move.',deskHtml(),[
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel},
    {label:locale==='fr'?'ALLER AU TWIN':'GO TO TWIN',primary:true,onClick:()=>{closePanel();player.set(-6.8,0,-23.0);yaw=0}}
  ]);
}
function twinDomainName(id){
  const names={
    muscle:{fr:'Muscle',en:'Muscle'},
    mobility:{fr:'Mobilité',en:'Mobility'},
    balance:{fr:'Équilibre',en:'Balance'},
    posture:{fr:'Posture',en:'Posture'},
    endurance:{fr:'Endurance',en:'Endurance'}
  };
  return names[id]?.[locale]||id;
}
function updateBiomechTwin(){
  const d=current().domains||{};
  Object.entries(biomechZones).forEach(([id,parts])=>{
    const value=THREE.MathUtils.clamp(Number(d[id])||0,0,100);
    const active=twinActiveDomain==='all'||twinActiveDomain===id;
    parts.forEach((part,i)=>{
      part.visible=active||twinActiveDomain==='all';
      if(part.material){
        part.userData.baseOpacity=(active?.26:.07)+(value/100)*(active?.48:.10);
        part.material.opacity=part.userData.baseOpacity;
        if(part.material.color){
          const color=value>=75?0xbdd3c4:value>=55?0xd5b878:0xc68f6a;
          part.material.color.setHex(color);
        }
      }
      part.scale.setScalar(active?1:0.92);
    });
  });
}
function updateTwinVisuals(){
  const d=current().domains||{};
  Object.entries(twinDomainVisuals).forEach(([id,v])=>{
    const value=THREE.MathUtils.clamp(Number(d[id])||0,0,100);
    const h=.18+value/100*2.05;
    v.fill.scale.y=h;v.fill.position.y=.34+h/2;
    v.fill.material.opacity=.46+value/100*.34;
    v.ring.material.opacity=.12+value/100*.30;
  });
  updateBiomechTwin();
}
function twinDomainHtml(id){
  const s=current(),value=Number(s.domains?.[id])||0,base=Number(baseline.domains?.[id])||0,delta=value-base;
  const explanations={
    muscle:{fr:'Lecture des capacités musculaires observées dans le bilan et leur évolution temporelle.',en:'View muscular capability signals from the assessment and their change over time.'},
    mobility:{fr:'Lecture de la mobilité fonctionnelle et de la qualité de déplacement.',en:'View functional mobility and movement quality.'},
    balance:{fr:'Lecture de l’équilibre et du contrôle fonctionnel.',en:'View balance and functional control.'},
    posture:{fr:'Lecture des indicateurs de posture intégrés au Twin.',en:'View posture indicators integrated into the Twin.'},
    endurance:{fr:'Lecture de la capacité fonctionnelle et de sa trajectoire.',en:'View functional capacity and its trajectory.'}
  };
  return `
    <div class="twin-domain-hero"><span>${twinDomainName(id).toUpperCase()}</span><strong>${value}<em>/100</em></strong></div>
    <div class="twin-domain-track"><i style="width:${value}%"></i></div>
    <div class="panel-grid">
      <div><span>BASELINE</span><b>${base}</b></div>
      <div><span>${locale==='fr'?'AUJOURD’HUI':'TODAY'}</span><b>${value}</b></div>
      <div><span>DELTA</span><b>${delta>=0?'+':''}${delta}</b></div>
      <div><span>SOURCE</span><b>TWIN</b></div>
    </div>
    <p>${explanations[id]?.[locale]||''}</p>
    <div class="priority-card"><b>BODY MAP</b>${locale==='fr'?'La zone correspondante est mise en évidence sur le jumeau biomécanique dans la salle.':'The corresponding zone is highlighted on the biomechanical twin in the room.'}</div>
    <div class="data-note">${locale==='fr'?'Valeurs de démonstration TwinCore tant que la session Pulse personnelle n’est pas connectée.':'TwinCore demo values until the personal Pulse session is connected.'}</div>`;
}
function showTwinDomain(id){
  twinActiveDomain=id;updateTwinVisuals();
  openPanel(twinDomainName(id).toUpperCase(),locale==='fr'?'Explorer un domaine du Functional Twin.':'Explore a Functional Twin domain.',twinDomainHtml(id),[
    {label:locale==='fr'?'VUE TWIN':'TWIN OVERVIEW',onClick:showTwin},
    {label:copy[locale].openRehab,primary:true,onClick:enterRehab}
  ]);
}

function resetRehabCoach(){
  const a=rehabCoach.userData.coach;if(!a)return;
  rehabCoach.position.set(0,0,-6.3);rehabCoach.rotation.set(0,0,0);
  a.hips.position.y=.92;a.hips.rotation.set(0,0,0);
  a.torso.position.y=1.33;a.torso.rotation.set(0,0,0);
  a.head.rotation.set(0,0,0);
  [a.leftLeg,a.rightLeg,a.leftArm,a.rightArm,a.leftKnee,a.rightKnee,a.leftElbow,a.rightElbow].forEach(g=>g.rotation.set(0,0,0));
}
function setRehabCoachStation(id,running=false){
  rehabCoachState.station=id||'control';rehabCoachState.running=!!running;rehabCoachState.phase=0;resetRehabCoach();
}
function animateRehabCoach(now,dt){
  if(mode!=='rehab'||!rehabCoach.visible)return;
  const a=rehabCoach.userData.coach,t=now*.001;
  rehabCoachState.phase+=dt*(rehabCoachState.running?1:0.45);
  const p=rehabCoachState.phase;
  resetRehabCoach();
  if(rehabCoachState.station==='control'){
    const lift=.5+.5*Math.sin(p*2.0);
    a.leftArm.rotation.z=-.72;a.rightArm.rotation.z=.72;
    a.rightLeg.rotation.x=-.34*lift;a.rightKnee.rotation.x=.72*lift;
    a.hips.rotation.z=Math.sin(p*1.5)*.055;
    a.torso.rotation.z=-a.hips.rotation.z*.65;
    a.head.rotation.y=Math.sin(p*.72)*.10;
  }else if(rehabCoachState.station==='strength'){
    const squat=.5+.5*Math.sin(p*2.15);
    a.hips.position.y=.92-.28*squat;a.torso.position.y=1.33-.28*squat;
    a.leftLeg.rotation.x=.48*squat;a.rightLeg.rotation.x=.48*squat;
    a.leftKnee.rotation.x=-.92*squat;a.rightKnee.rotation.x=-.92*squat;
    a.torso.rotation.x=-.12*squat;
    a.leftArm.rotation.x=-.42*squat;a.rightArm.rotation.x=-.42*squat;
  }else{
    const stride=Math.sin(p*3.1);
    a.leftLeg.rotation.x=stride*.54;a.rightLeg.rotation.x=-stride*.54;
    a.leftKnee.rotation.x=Math.max(0,-stride)*.58;a.rightKnee.rotation.x=Math.max(0,stride)*.58;
    a.leftArm.rotation.x=-stride*.42;a.rightArm.rotation.x=stride*.42;
    rehabCoach.position.y=Math.abs(stride)*.025;
  }
  const intensity=rehabCoachState.running?1:.55;
  a.leftLeg.rotation.x*=intensity;a.rightLeg.rotation.x*=intensity;
  a.leftArm.rotation.x*=intensity;a.rightArm.rotation.x*=intensity;
}
const REHAB_KEY='komo_world_rehab_v1';
const FITNESS_KEY='komo_world_fitness_club_v1';
let rehabSessionTimer=null;

function loadRehabProgress(){
  try{
    const raw=JSON.parse(localStorage.getItem(REHAB_KEY)||'{}');
    return {control:Number(raw.control)||0,strength:Number(raw.strength)||0,capacity:Number(raw.capacity)||0,total:Number(raw.total)||0};
  }catch{return {control:0,strength:0,capacity:0,total:0}}
}
const rehabProgress=loadRehabProgress();
function saveRehabProgress(){try{localStorage.setItem(REHAB_KEY,JSON.stringify(rehabProgress))}catch{}}

const FITNESS_ACTIVITIES={
  strength:{
    title:{fr:'Force',en:'Strength'},code:'STRENGTH',coach:'strength',base:20,
    promise:{fr:'Construire force, contrôle et régularité.',en:'Build strength, control and consistency.'},
    days:[
      ['FOUNDATION',['Activation','Squat & hinge','Core']],
      ['LOWER BODY',['Mobility warm-up','Lower-body strength','Balance finisher']],
      ['UPPER + CORE',['Shoulder prep','Push / pull pattern','Core control']],
      ['RESET',['Mobility','Easy strength','Breathing']],
      ['TOTAL BODY',['Warm-up','Full-body circuit','Core']],
      ['CONTROL',['Tempo strength','Single-leg control','Mobility']],
      ['RECOVERY STRENGTH',['Easy activation','Mobility flow','Walk / reset']]
    ]
  },
  mobility:{
    title:{fr:'Mobilité',en:'Mobility'},code:'MOBILITY',coach:'control',base:16,
    promise:{fr:'Bouger avec plus d’amplitude et de contrôle.',en:'Move with more range and control.'},
    days:[
      ['FULL BODY FLOW',['Breathing','Global mobility','Easy flow']],
      ['HIPS',['Hip mobility','Rotation','Controlled range']],
      ['SPINE',['Thoracic mobility','Rotation','Core control']],
      ['SHOULDERS',['Shoulder mobility','Scapular control','Breathing']],
      ['ANKLES + HIPS',['Ankle mobility','Hip flow','Balance']],
      ['DYNAMIC FLOW',['Warm-up flow','Dynamic mobility','Easy capacity']],
      ['RESET',['Gentle mobility','Breathing','Walk']]
    ]
  },
  balance:{
    title:{fr:'Équilibre',en:'Balance'},code:'BALANCE',coach:'control',base:15,
    promise:{fr:'Développer stabilité, coordination et confiance.',en:'Build stability, coordination and confidence.'},
    days:[
      ['FOUNDATION',['Stable stance','Weight shifts','Easy single-leg']],
      ['SINGLE LEG',['Warm-up','Single-leg control','Step control']],
      ['DYNAMIC',['Direction changes','Reach patterns','Walk line']],
      ['MOBILITY + BALANCE',['Hip mobility','Ankle control','Balance flow']],
      ['COORDINATION',['Cross-body patterns','Step sequence','Reset']],
      ['FLOW',['Balance circuit','Controlled walk','Breathing']],
      ['RESET',['Easy stance','Mobility','Recovery walk']]
    ]
  },
  cardio:{
    title:{fr:'Cardio',en:'Cardio'},code:'CARDIO',coach:'capacity',base:22,
    promise:{fr:'Développer progressivement votre capacité d’effort.',en:'Progressively build your exercise capacity.'},
    days:[
      ['BASE',['Easy warm-up','Steady effort','Cooldown']],
      ['INTERVALS',['Warm-up','Short intervals','Recovery']],
      ['TEMPO',['Progressive warm-up','Tempo block','Cooldown']],
      ['RECOVERY',['Easy walk','Mobility','Breathing']],
      ['AEROBIC MIX',['Warm-up','Mixed pace','Easy finish']],
      ['SHORT INTERVALS',['Warm-up','Short efforts','Cooldown']],
      ['EASY CAPACITY',['Comfortable pace','Mobility','Reset']]
    ]
  },
  recovery:{
    title:{fr:'Recovery',en:'Recovery'},code:'RECOVERY',coach:'control',base:14,
    promise:{fr:'Créer une routine quotidienne légère et récupératrice.',en:'Create a light daily recovery routine.'},
    days:[
      ['BREATH + MOBILITY',['Breathing','Gentle mobility','Easy walk']],
      ['LOWER BODY RESET',['Ankles','Hips','Leg mobility']],
      ['SPINE RESET',['Breathing','Spine mobility','Easy core']],
      ['UPPER BODY RESET',['Shoulders','Thoracic mobility','Breathing']],
      ['WALK + FLOW',['Easy walk','Mobility flow','Breathing']],
      ['FULL RESET',['Full-body mobility','Easy balance','Breathing']],
      ['RESTORE',['Gentle flow','Long exhale breathing','Easy walk']]
    ]
  }
};
const FITNESS_ORDER=['strength','mobility','balance','cardio','recovery'];

function localDateKey(date=new Date()){
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function dateFromKey(key){
  const [y,m,d]=String(key).split('-').map(Number);return new Date(y,m-1,d);
}
function daysBetweenLocal(a,b){
  const A=dateFromKey(a),B=dateFromKey(b);
  return Math.floor((Date.UTC(B.getFullYear(),B.getMonth(),B.getDate())-Date.UTC(A.getFullYear(),A.getMonth(),A.getDate()))/86400000);
}
function loadFitnessProfile(){
  try{
    const raw=JSON.parse(localStorage.getItem(FITNESS_KEY)||'{}');
    return {
      activity:FITNESS_ORDER.includes(raw.activity)?raw.activity:null,
      startDate:raw.startDate||null,
      completed:raw.completed&&typeof raw.completed==='object'?raw.completed:{},
      points:Number(raw.points)||0
    };
  }catch{return {activity:null,startDate:null,completed:{},points:0}}
}
const fitnessProfile=loadFitnessProfile();
function saveFitnessProfile(){try{localStorage.setItem(FITNESS_KEY,JSON.stringify(fitnessProfile))}catch{}}

function fitnessStreak(){
  let streak=0,d=new Date();
  // If today is not completed, allow the streak to continue from yesterday.
  if(!fitnessProfile.completed[localDateKey(d)])d.setDate(d.getDate()-1);
  for(let i=0;i<365;i++){
    const key=localDateKey(d);
    if(!fitnessProfile.completed[key])break;
    streak++;d.setDate(d.getDate()-1);
  }
  return streak;
}
function fitnessToday(){
  if(!fitnessProfile.activity)return null;
  if(!fitnessProfile.startDate)fitnessProfile.startDate=localDateKey();
  const activity=FITNESS_ACTIVITIES[fitnessProfile.activity];
  const elapsed=Math.max(0,daysBetweenLocal(fitnessProfile.startDate,localDateKey()));
  const dayIndex=elapsed%7,week=Math.floor(elapsed/7)+1,phase=Math.min(4,week);
  const def=activity.days[dayIndex];
  const duration=activity.base+Math.min(6,(phase-1)*2)+(dayIndex===3||dayIndex===6?-4:0);
  return {
    activityId:fitnessProfile.activity,activity,
    elapsed,day:elapsed+1,dayIndex,week,phase,
    title:def[0],blocks:def[1],duration:Math.max(10,duration),
    date:localDateKey(),completed:!!fitnessProfile.completed[localDateKey()]
  };
}
function selectFitnessActivity(id){
  if(!FITNESS_ORDER.includes(id))return;
  if(fitnessProfile.activity!==id){
    fitnessProfile.activity=id;fitnessProfile.startDate=localDateKey();
  }else if(!fitnessProfile.startDate)fitnessProfile.startDate=localDateKey();
  saveFitnessProfile();
  setRehabCoachStation(FITNESS_ACTIVITIES[id].coach,false);
  notify((locale==='fr'?'PROGRAMME · ':'PROGRAM · ')+FITNESS_ACTIVITIES[id].title[locale]);
  showFitnessToday();
}
function fitnessActivityCards(){
  return `<div class="fitness-activity-grid">${FITNESS_ORDER.map(id=>{
    const a=FITNESS_ACTIVITIES[id],selected=fitnessProfile.activity===id;
    return `<button data-fitness="${id}" class="${selected?'selected':''}">
      <span>${a.code}</span><b>${a.title[locale]}</b><small>${a.promise[locale]}</small>
    </button>`;
  }).join('')}</div>`;
}
function fitnessWeekStrip(){
  const t=fitnessToday();if(!t)return '';
  return `<div class="fitness-week">${t.activity.days.map((d,i)=>{
    const offset=i-t.dayIndex,date=new Date();date.setDate(date.getDate()+offset);
    const key=localDateKey(date),done=!!fitnessProfile.completed[key];
    return `<div class="${i===t.dayIndex?'today':''} ${done?'done':''}"><span>D${i+1}</span><b>${d[0]}</b><small>${done?'✓':i===t.dayIndex?(locale==='fr'?'Aujourd’hui':'Today'):''}</small></div>`;
  }).join('')}</div>`;
}
function fitnessTodayHtml(previewPct=0,previewRemaining=null){
  const t=fitnessToday();if(!t)return '';
  const streak=fitnessStreak();
  return `
    <div class="fitness-today-hero">
      <div><span>${t.activity.code} · WEEK ${t.week}</span><strong>${locale==='fr'?'Jour':'Day'} ${t.day}</strong><small>${t.title}</small></div>
      <div><b>${t.duration}</b><small>MIN</small></div>
    </div>
    ${previewRemaining!==null?`<div class="rehab-progress"><i style="width:${previewPct}%"></i></div><div class="fitness-preview-label">COACH PREVIEW · ${previewRemaining}s</div>`:''}
    <div class="fitness-blocks">${t.blocks.map((b,i)=>`<div><span>0${i+1}</span><b>${b}</b><small>${i===0?'PREP':i===t.blocks.length-1?'FINISH':'MAIN'}</small></div>`).join('')}</div>
    <div class="panel-grid">
      <div><span>STREAK</span><b>${streak} day${streak===1?'':'s'}</b></div>
      <div><span>CLUB POINTS</span><b>${fitnessProfile.points}</b></div>
      <div><span>PHASE</span><b>${t.phase}/4</b></div>
      <div><span>STATUS</span><b>${t.completed?'✓ DONE':'TODAY'}</b></div>
    </div>
    ${fitnessWeekStrip()}
    <div class="data-note">${locale==='fr'?'Programme fitness générique d’engagement. Adaptez l’intensité à votre situation et interrompez l’exercice en cas de douleur ou symptôme inhabituel.':'General fitness engagement program. Adjust intensity to your situation and stop if you experience pain or unusual symptoms.'}</div>`;
}
function showFitnessToday(previewed=false){
  const t=fitnessToday();if(!t){showRehab();return}
  stopRehabSession();setRehabCoachStation(t.activity.coach,false);
  openPanel('KŌMØ FITNESS CLUB',t.activity.title[locale]+' · '+(locale==='fr'?'séance du jour':'today’s session'),fitnessTodayHtml(),[
    {label:locale==='fr'?'CHANGER D’ACTIVITÉ':'CHANGE ACTIVITY',onClick:showRehab},
    {label:locale==='fr'?'APERÇU COACH':'COACH PREVIEW',onClick:runFitnessCoachPreview},
    {label:t.completed?(locale==='fr'?'✓ TERMINÉ AUJOURD’HUI':'✓ DONE TODAY'):(locale==='fr'?'J’AI TERMINÉ':'MARK COMPLETE'),primary:!t.completed,onClick:markFitnessTodayComplete}
  ]);
}
function runFitnessCoachPreview(){
  const t=fitnessToday();if(!t)return;
  stopRehabSession();setRehabCoachStation(t.activity.coach,true);
  const start=performance.now(),duration=15000;
  openPanel('ALEX · FITNESS COACH',t.activity.title[locale]+' · '+(locale==='fr'?'aperçu du mouvement':'movement preview'),fitnessTodayHtml(0,15),[
    {label:locale==='fr'?'ARRÊTER':'STOP',onClick:showFitnessToday}
  ]);
  rehabSessionTimer=setInterval(()=>{
    const elapsed=performance.now()-start,pct=THREE.MathUtils.clamp(elapsed/duration*100,0,100),left=Math.max(0,Math.ceil((duration-elapsed)/1000));
    panelBody.innerHTML=fitnessTodayHtml(pct,left);
    if(elapsed>=duration){stopRehabSession();showFitnessToday(true)}
  },250);
}
function markFitnessTodayComplete(){
  const t=fitnessToday();if(!t)return;
  if(t.completed){notify(locale==='fr'?'Séance déjà validée aujourd’hui':'Today’s session is already complete');return}
  fitnessProfile.completed[t.date]={activity:t.activityId,at:Date.now()};
  fitnessProfile.points+=20;
  saveFitnessProfile();
  const coachId=t.activity.coach;
  rehabProgress[coachId]=(rehabProgress[coachId]||0)+1;rehabProgress.total++;saveRehabProgress();
  completeJourney('rehab_session');completeChallenge('fitness');
  setRehabCoachStation(coachId,false);
  notify((locale==='fr'?'+20 CLUB POINTS · STREAK ':'+20 CLUB POINTS · STREAK ')+fitnessStreak());
  showFitnessToday(true);
}

function rehabStationCopy(id){
  const data={
    control:{title:{fr:'BALANCE / CONTROL',en:'BALANCE / CONTROL'},duration:15,focus:{fr:'Équilibre · contrôle · mobilité',en:'Balance · control · mobility'},demo:{fr:'Aperçu coach de contrôle et stabilité.',en:'Coach preview for control and stability.'}},
    strength:{title:{fr:'STRENGTH',en:'STRENGTH'},duration:18,focus:{fr:'Force · activation · répétition',en:'Strength · activation · repetition'},demo:{fr:'Aperçu coach de force fonctionnelle.',en:'Coach preview for functional strength.'}},
    capacity:{title:{fr:'CARDIO / CAPACITY',en:'CARDIO / CAPACITY'},duration:20,focus:{fr:'Rythme · capacité · endurance',en:'Pace · capacity · endurance'},demo:{fr:'Aperçu coach de capacité et cardio.',en:'Coach preview for capacity and cardio.'}}
  };
  return data[id]||data.control;
}
function rehabStationHtml(id,running=false,pct=0,remaining=null){
  const c=rehabStationCopy(id),count=rehabProgress[id]||0;
  return `
    <div class="rehab-station-hero"><span>${c.title[locale]}</span><strong>${running?(remaining+'s'):(count?'✓ '+count:'READY')}</strong></div>
    <div class="rehab-progress"><i style="width:${pct}%"></i></div>
    <div class="priority-card"><b>COACH MODE</b>${c.focus[locale]}</div>
    <p>${c.demo[locale]}</p>
    <div class="panel-grid">
      <div><span>PREVIEW</span><b>${c.duration}s</b></div>
      <div><span>SESSIONS</span><b>${count}</b></div>
      <div><span>COACH</span><b>ALEX</b></div>
      <div><span>MODE</span><b>FITNESS</b></div>
    </div>
    <div class="data-note">${locale==='fr'?'Ces démonstrations servent à découvrir les mouvements du Fitness Club. Elles ne constituent pas une prescription médicale personnalisée.':'These demonstrations introduce Fitness Club movements. They are not personalised medical prescriptions.'}</div>`;
}
function stopRehabSession(){
  if(rehabSessionTimer){clearInterval(rehabSessionTimer);rehabSessionTimer=null}
  rehabCoachState.running=false;
}
function completeRehabStation(id){
  stopRehabSession();rehabProgress[id]=(rehabProgress[id]||0)+1;rehabProgress.total++;saveRehabProgress();
  notify((locale==='fr'?'APERÇU TERMINÉ · ':'PREVIEW COMPLETE · ')+rehabStationCopy(id).title[locale]);
  showRehabStation(id,true);
}
function runRehabDemo(id){
  stopRehabSession();setRehabCoachStation(id,true);
  const c=rehabStationCopy(id),start=performance.now(),duration=c.duration*1000;
  openPanel(c.title[locale],'FITNESS CLUB · COACH',rehabStationHtml(id,true,0,c.duration),[
    {label:locale==='fr'?'ARRÊTER':'STOP',onClick:()=>{stopRehabSession();showRehabStation(id)}}
  ]);
  rehabSessionTimer=setInterval(()=>{
    const elapsed=performance.now()-start,pct=THREE.MathUtils.clamp(elapsed/duration*100,0,100),left=Math.max(0,Math.ceil((duration-elapsed)/1000));
    panelBody.innerHTML=rehabStationHtml(id,true,pct,left);
    const vis=rehabStationVisuals[id];if(vis){vis.pulse.material.opacity=.18+.48*(pct/100);vis.pulse.scale.setScalar(1+.18*(pct/100))}
    if(elapsed>=duration)completeRehabStation(id);
  },250);
}
function showRehabStation(id,completed=false){
  stopRehabSession();setRehabCoachStation(id,false);
  const c=rehabStationCopy(id);
  openPanel(c.title[locale],locale==='fr'?'Station coach du KŌMØ Fitness Club.':'KŌMØ Fitness Club coach station.',rehabStationHtml(id,false,completed?100:0),[
    {label:locale==='fr'?'FITNESS CLUB':'FITNESS CLUB',onClick:showRehab},
    {label:completed?(locale==='fr'?'REJOUER':'REPLAY'):(locale==='fr'?'VOIR LE MOUVEMENT':'PREVIEW MOVEMENT'),primary:true,onClick:()=>runRehabDemo(id)}
  ]);
}

function twinHtml(){
  const s=current(),cmp=core.compare(baseline.snapshot_id,s.snapshot_id,'world-v1');
  const d=s.domains;
  const domains=['muscle','mobility','balance','posture','endurance'];
  return `
    <p>${locale==='fr'?'Le Functional Twin organise vos mesures dans le temps pour rendre la trajectoire lisible. Approchez-vous aussi des 5 domaines dans la salle pour les explorer en 3D.':'Functional Twin organises measurements over time to make the trajectory understandable. You can also approach the 5 domains in the room to explore them spatially.'}</p>
    <div class="metric-hero"><div><span>MOTION SCORE</span><strong>${s.motion_score}<em>/100</em></strong></div><div><span>MOTION AGE</span><strong>${s.motion_age}</strong></div></div>
    <div class="twin-domain-list">${domains.map(id=>`<button data-domain="${id}"><span>${twinDomainName(id)}</span><b>${Number(d[id])||0}</b><i><em style="width:${Number(d[id])||0}%"></em></i></button>`).join('')}</div>
    <div class="priority-card"><b>${locale==='fr'?'ÉVOLUTION':'PROGRESSION'}</b>${cmp.motion_score_delta>=0?'+':''}${cmp.motion_score_delta} Motion Score · quadriceps ${baseline.metrics.quadriceps_symmetry} → ${s.metrics.quadriceps_symmetry}% · gait ${baseline.metrics.gait_speed.toFixed(2)} → ${s.metrics.gait_speed.toFixed(2)} m/s.</div>
    <div class="timeline">${core.snapshots.map((q,i)=>`<button data-time="${i}" class="${i===core.activeIndex?'active':''}">${q.label}</button>`).join('')}</div>
    <div class="data-note">${locale==='fr'?'Prototype World : les valeurs affichées ici utilisent le jeu de données de démonstration TwinCore tant que la session Pulse personnelle n’est pas reliée.':'World prototype: values shown here use the TwinCore demo dataset until the personal Pulse session is connected.'}</div>`;
}
function bindTimeline(){
  panelBody.querySelectorAll('[data-time]').forEach(btn=>btn.addEventListener('click',()=>{
    core.setTimeIndex(+btn.dataset.time,'world-v1');$('#hud-motion').textContent=current().motion_score;$('#hud-age').textContent=current().motion_age;updateTwinVisuals();updateHealthHUD();showTwin();
  }));
  panelBody.querySelectorAll('[data-domain]').forEach(btn=>btn.addEventListener('click',()=>showTwinDomain(btn.dataset.domain)));
}
function showTwin(){
  twinActiveDomain='all';updateTwinVisuals();
  openPanel('FUNCTIONAL TWIN',locale==='fr'?'Votre corps à travers le temps.':'Your body across time.',twinHtml(),[
    {label:copy[locale].back,onClick:returnToHall},
    {label:locale==='fr'?'EXPLORER LA SALLE':'EXPLORE ROOM',primary:true,onClick:closePanel},
    {label:copy[locale].openRehab,onClick:enterRehab}
  ]);bindTimeline();
}
function rehabHtml(){
  const t=fitnessToday();
  if(!t){
    return `
      <div class="fitness-club-intro">
        <span>KŌMØ FITNESS CLUB</span>
        <h3>${locale==='fr'?'Choisissez comment vous voulez bouger.':'Choose how you want to move.'}</h3>
        <p>${locale==='fr'?'Sélectionnez une pratique. KŌMØ construit ensuite un programme quotidien simple, progressif et suivi avec Alex, votre coach virtuel.':'Select an activity. KŌMØ then builds a simple progressive daily program with Alex, your virtual coach.'}</p>
      </div>
      ${fitnessActivityCards()}
      <div class="data-note">${locale==='fr'?'Le Fitness Club propose des routines générales d’activité physique et d’engagement. Elles ne constituent pas une prescription médicale personnalisée.':'Fitness Club provides general physical-activity and engagement routines. They are not personalised medical prescriptions.'}</div>`;
  }
  return `
    <div class="fitness-club-intro compact">
      <span>KŌMØ FITNESS CLUB · ${t.activity.code}</span>
      <h3>${locale==='fr'?'Votre entraînement, chaque jour.':'Your training, every day.'}</h3>
      <p>${t.activity.promise[locale]}</p>
    </div>
    ${fitnessTodayHtml()}
    <div class="fitness-change-title">${locale==='fr'?'Changer de pratique':'Change activity'}</div>
    ${fitnessActivityCards()}`;
}
function bindFitnessClub(){
  panelBody.querySelectorAll('[data-fitness]').forEach(btn=>btn.addEventListener('click',()=>selectFitnessActivity(btn.dataset.fitness)));
}
function showRehab(){
  stopRehabSession();
  const t=fitnessToday();
  setRehabCoachStation(t?.activity?.coach||'control',false);
  openPanel('KŌMØ FITNESS CLUB',t
    ?(locale==='fr'?'Programme quotidien · Coach Alex':'Daily program · Coach Alex')
    :(locale==='fr'?'Choisissez votre activité physique.':'Choose your physical activity.'),rehabHtml(),[
    {label:copy[locale].back,onClick:returnToHall},
    ...(t?[{label:locale==='fr'?'SÉANCE DU JOUR':'TODAY’S SESSION',primary:true,onClick:showFitnessToday}]:[]),
    {label:locale==='fr'?'EXPLORER LE CLUB':'EXPLORE CLUB',onClick:closePanel},
    {label:locale==='fr'?'VOIR LE TWIN':'VIEW TWIN',onClick:enterTwin}
  ]);
  bindFitnessClub();
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
    {label:locale==='fr'?'DÉFIS DU JOUR':'DAILY CHALLENGES',primary:true,onClick:showChallenges},
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel}
  ]);
}
function showLibrary(){
  completeJourney('library');
  const html=locale==='fr'
    ?'<p>La Library rassemble la méthode KŌMØ, les sources, la littérature et la provenance des mesures utilisées dans votre parcours.</p><div class="panel-grid"><div><span>SOURCES</span><b>Mesuré</b></div><div><span>METHOD</span><b>Traçable</b></div><div><span>TIME</span><b>Longitudinal</b></div><div><span>DATA</span><b>Privé</b></div></div>'
    :'<p>Library brings together KŌMØ methodology, sources, literature and measurement provenance used across your journey.</p><div class="panel-grid"><div><span>SOURCES</span><b>Measured</b></div><div><span>METHOD</span><b>Traceable</b></div><div><span>TIME</span><b>Longitudinal</b></div><div><span>DATA</span><b>Private</b></div></div>';
  openPanel('LIBRARY',locale==='fr'?'Science & méthode.':'Science & method.',html,[{label:copy[locale].close,onClick:closePanel}]);
}
function showTalks(){
  completeJourney('talks');
  const html=locale==='fr'
    ?'<p>Talks accueille les conférences, experts et événements KŌMØ. Cet espace sera connecté aux contenus de la plateforme.</p>'
    :'<p>Talks hosts KŌMØ conferences, experts and events. This space will connect to platform content.</p>';
  openPanel('TALKS',locale==='fr'?'Experts & événements.':'Experts & events.',html,[{label:copy[locale].close,onClick:closePanel}]);
}

function showFountain(){
  completeChallenge('fountain');
  openPanel('GRAND FOUNTAIN',locale==='fr'?'Le cœur du KŌMØ District.':'The heart of KŌMØ District.',`
    <p>${locale==='fr'?'La grande fontaine devient le point central du campus extérieur : Movement House, Life Lab et Performance Pavilion entourent cette nouvelle place.':'The Grand Fountain is the centre of the exterior campus: Movement House, Life Lab and Performance Pavilion surround the new square.'}</p>
    <div class="panel-grid"><div><span>MOVEMENT HOUSE</span><b>Community</b></div><div><span>LIFE LAB</span><b>Objects</b></div><div><span>PERFORMANCE</span><b>Challenges</b></div><div><span>DISTRICT</span><b>Explore</b></div></div>
    <div class="priority-card"><b>WORLD CHALLENGE</b>${challenges.done.fountain?(locale==='fr'?'✓ Fontaine découverte':'✓ Fountain discovered'):(locale==='fr'?'Approchez-vous de la fontaine pour débloquer +15 XP.':'Approach the fountain to unlock +15 XP.')}</div>`,[
    {label:locale==='fr'?'VOIR LES DÉFIS':'VIEW CHALLENGES',onClick:showChallenges},
    {label:locale==='fr'?'RETOUR AU HALL':'BACK TO HALL',primary:true,onClick:()=>fastTravel('hall')}
  ]);
}
function showLifeItem(id){
  completeJourney('life',{silent:true});
  const items={
    strap:{name:'MOTION STRAP',cat:'MOVE',fr:'Un objet textile KŌMØ pensé autour du mouvement, des capteurs et de l’entraînement.',en:'A KŌMØ textile object built around movement, sensors and training.'},
    bottle:{name:'KŌMØ BOTTLE',cat:'HYDRATE',fr:'Objet quotidien KŌMØ Life, simple et durable, intégré à la routine.',en:'A simple durable KŌMØ Life daily object integrated into the routine.'},
    recovery:{name:'RECOVERY ROLL',cat:'RESET',fr:'Accessoire de mobilité et de récupération présenté directement dans le flagship.',en:'A mobility and recovery accessory displayed directly in the flagship.'},
    travel:{name:'TRAVEL KIT',cat:'RIVIERA',fr:'Kit compact pensé pour prolonger la routine KŌMØ en déplacement.',en:'A compact kit designed to extend the KŌMØ routine while travelling.'}
  };
  const it=items[id]||items.strap;
  openPanel('KŌMØ LIFE · '+it.cat,it.name,`
    <p>${it[locale]}</p>
    <div class="life-item-grid">
      <article><span>WORLD</span><b>Displayed in 3D</b><small>${locale==='fr'?'Approchez-vous de chaque objet pour le découvrir.':'Walk up to each object to discover it.'}</small></article>
      <article><span>LIFE</span><b>Physical object</b><small>${locale==='fr'?'La boutique Life relie l’objet virtuel au produit réel.':'Life links the virtual object to the real product.'}</small></article>
    </div>`,[
    {label:locale==='fr'?'CONTINUER À EXPLORER':'KEEP EXPLORING',onClick:closePanel},
    {label:copy[locale].openLife,primary:true,onClick:()=>{location.href='https://life.komolongevity.com/'}}
  ]);
}

function showLifeStore(){
  completeJourney('life');
  const html=locale==='fr'
    ?`<p>KŌMØ Life prolonge World dans le réel : objets, équipements et éditions conçus autour du mouvement et de la longévité.</p>
      <div class="store-products">
        <article><span>01 · EQUIPMENT</span><b>KŌMØ Case 01</b><small>La valise KŌMØ configurable, présentée ici comme objet signature.</small></article>
        <article><span>02 · OBJECTS</span><b>Motion Strap · Bottle · Recovery Roll</b><small>Les objets sont désormais disposés physiquement dans le flagship World.</small></article>
        <article><span>03 · EDITIONS</span><b>Travel Kit · Selected drops</b><small>Collaborations, séries limitées et objets Riviera.</small></article>
      </div>`
    :`<p>KŌMØ Life extends World into real life: objects, equipment and editions designed around movement and longevity.</p>
      <div class="store-products">
        <article><span>01 · EQUIPMENT</span><b>KŌMØ Case 01</b><small>The configurable KŌMØ case, presented here as a signature object.</small></article>
        <article><span>02 · OBJECTS</span><b>Motion Strap · Bottle · Recovery Roll</b><small>Objects are now physically placed inside the World flagship.</small></article>
        <article><span>03 · EDITIONS</span><b>Travel Kit · Selected drops</b><small>Collaborations, limited editions and Riviera objects.</small></article>
      </div>`;
  openPanel('KŌMØ LIFE',locale==='fr'?'La boutique du World.':'The World store.',html,[
    {label:copy[locale].openLife,onClick:()=>{location.href='https://life.komolongevity.com/'}},
    {label:copy[locale].configureCase,primary:true,onClick:()=>{location.href='https://life.komolongevity.com/#case-atelier'}}
  ]);
}

function showRehabCoach(){
  const t=fitnessToday();
  const html=`
    <p>${locale==='fr'?'Alex est le coach virtuel du KŌMØ Fitness Club. Il montre les mouvements, accompagne la séance du jour et change de démonstration selon votre pratique.':'Alex is the KŌMØ Fitness Club virtual coach. He demonstrates movements, supports today’s session and changes demonstrations with your chosen activity.'}</p>
    <div class="panel-grid">
      <div><span>STRENGTH</span><b>SQUAT</b></div>
      <div><span>MOBILITY</span><b>CONTROL</b></div>
      <div><span>BALANCE</span><b>STABILITY</b></div>
      <div><span>CARDIO</span><b>MARCH</b></div>
    </div>
    ${t?`<div class="priority-card"><b>${locale==='fr'?'AUJOURD’HUI':'TODAY'}</b>${t.activity.title[locale]} · ${t.title} · ${t.duration} min</div>`:''}
    <div class="data-note">${locale==='fr'?'Alex guide des routines fitness générales. Le contenu doit être adapté à votre condition et à votre contexte lorsque nécessaire.':'Alex guides general fitness routines. Content should be adapted to your condition and context when needed.'}</div>`;
  openPanel('ALEX · FITNESS COACH',locale==='fr'?'Votre coach quotidien.':'Your daily coach.',html,[
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel},
    {label:locale==='fr'?'FITNESS CLUB':'FITNESS CLUB',onClick:showRehab},
    ...(t?[{label:locale==='fr'?'SÉANCE DU JOUR':'TODAY’S SESSION',primary:true,onClick:showFitnessToday}]:[])
  ]);
}

function showNpcConversation(npc){
  const d=npc?.userData?.npc;if(!d)return;
  completeJourney('social');
  const t=fitnessToday();
  const lines={
    staff:{fr:'Bienvenue. Commencez par l’aperçu santé puis le Functional Twin pour comprendre votre trajectoire.',en:'Welcome. Start with the health snapshot and Functional Twin to understand your trajectory.'},
    coach:{fr:t?'Votre séance du jour est prête : '+t.activity.title.fr+' · '+t.title+' · '+t.duration+' min.':'Choisissez une pratique dans KŌMØ Fitness Club et je vous proposerai une séance chaque jour.',en:t?'Today’s session is ready: '+t.activity.title.en+' · '+t.title+' · '+t.duration+' min.':'Choose an activity in KŌMØ Fitness Club and I will give you a daily session.'},
    visitor:{fr:'Je découvre aussi le World. KŌMØ Life relie l’expérience numérique aux objets et équipements du monde réel.',en:'I am exploring the World too. KŌMØ Life connects the digital experience with real-world objects and equipment.'}
  };
  const actions=[{label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel}];
  if(d.role==='coach')actions.push({label:t?(locale==='fr'?'SÉANCE DU JOUR':'TODAY’S SESSION'):(locale==='fr'?'FITNESS CLUB':'FITNESS CLUB'),primary:true,onClick:t?showFitnessToday:showRehab});
  else actions.push({label:locale==='fr'?'VOIR LE JOURNEY':'VIEW JOURNEY',primary:true,onClick:showJourneyPanel});
  openPanel(d.label||'KŌMØ MEMBER',d.role==='staff'?'KŌMØ STAFF':d.role==='coach'?'FITNESS COACH':'WORLD GUEST',`<p>${lines[d.role]?.[locale]||lines.visitor[locale]}</p><div class="priority-card"><b>WORLD JOURNEY</b>${locale==='fr'?'Échange social · +15 XP':'Social interaction · +15 XP'}</div>`,actions);
}
function setMode(next){
  if(next!=='rehab')stopRehabSession();
  mode=next;world.visible=next==='world';twinRoom.visible=next==='twin';rehabRoom.visible=next==='rehab';arenaRoom.visible=next==='arena';rehabCoach.visible=next==='rehab';
}
function enterTwin(){
  completeJourney('twin');completeChallenge('twin');
  playerLevel=0;setMode('twin');player.set(-45,0,8.7);velocity.set(0,0,0);yaw=0;pitch=-.03;showTwin();locationName.textContent='FUNCTIONAL TWIN';
}
function enterRehab(){
  completeJourney('rehab');
  playerLevel=0;setMode('rehab');player.set(0,0,-44.5);velocity.set(0,0,0);yaw=0;pitch=-.03;showRehab();locationName.textContent='KŌMØ FITNESS CLUB';
}
function enterArena(){
  completeJourney('arena');
  playerLevel=0;setMode('arena');player.set(45,0,8.8);velocity.set(0,0,0);yaw=0;pitch=-.03;showArena();locationName.textContent='ARENA';
}
function returnToHall(){
  playerLevel=0;setMode('world');player.set(0,0,-22.5);velocity.set(0,0,0);yaw=0;pitch=-.03;closePanel();updateLocation();notify(locale==='fr'?'KŌMØ HALL':'KŌMØ HALL');
}

function isStairPosition(p){
  return p.x>-10.45&&p.x<-6.98&&p.z>6.90&&p.z<13.28;
}
function stairElevationAt(z){
  const t=THREE.MathUtils.clamp((13.20-z)/(13.20-7.00),0,1);
  return UPPER_Y*t;
}
function isUpperWalkable(p){
  const west=p.x>-11.05&&p.x<-6.12&&p.z>-23.45&&p.z<7.18;
  const east=p.x>6.12&&p.x<11.05&&p.z>-23.45&&p.z<-1.00;
  const rear=p.x>-10.98&&p.x<10.98&&p.z>-23.45&&p.z<-18.95;
  return west||east||rear;
}
function syncPlayerElevation(){
  if(mode!=='world'){playerLevel=0;player.y=0;return}
  if(isStairPosition(player)){
    player.y=stairElevationAt(player.z);
    if(player.y>UPPER_Y-.42)playerLevel=1;
    else if(player.y<.28)playerLevel=0;
    return;
  }
  player.y=playerLevel===1?UPPER_Y:0;
}
function canMove(p){
  if(mode==='world'){
    if(isStairPosition(p))return true;
    if(playerLevel===1||player.y>UPPER_Y-.70)return isUpperWalkable(p);
    if(p.z>81||p.z<-28.6||Math.abs(p.x)>24)return false;
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
function commitMove(next){
  const moved=player.distanceTo(next);player.copy(next);syncPlayerElevation();
  if(mode==='world'&&moved>0)addChallengeProgress('distance',moved);
}
function tryMove(dx,dz){
  const n=player.clone();n.x+=dx;n.z+=dz;if(canMove(n)){commitMove(n);return}
  const nx=player.clone();nx.x+=dx;if(canMove(nx)){commitMove(nx);return}
  const nz=player.clone();nz.z+=dz;if(canMove(nz))commitMove(nz);
}

function updateMovement(dt){
  joyX+= (joyTargetX-joyX)*(1-Math.exp(-14*dt));
  joyY+= (joyTargetY-joyY)*(1-Math.exp(-14*dt));
  if(worldMenu.classList.contains('open')||panel.classList.contains('open')||!intro.classList.contains('hidden')){
    velocity.lerp(new THREE.Vector3(),1-Math.exp(-12*dt));return;
  }
  let x=0,z=0;
  if(keys.has('KeyW')||keys.has('KeyZ')||keys.has('ArrowUp'))z+=1;
  if(keys.has('KeyS')||keys.has('ArrowDown'))z-=1;
  if(keys.has('KeyD')||keys.has('ArrowRight'))x+=1;
  if(keys.has('KeyA')||keys.has('KeyQ')||keys.has('ArrowLeft'))x-=1;
  x+=joyX;z+=-joyY;
  const input=new THREE.Vector2(x,z);
  const sprint=keys.has('ShiftLeft')||keys.has('ShiftRight');
  const speed=sprint?7.15:4.35;
  const target=new THREE.Vector3();
  if(input.lengthSq()>.002){
    input.normalize();
    const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
    const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    target.addScaledVector(right,input.x).addScaledVector(forward,input.y).normalize().multiplyScalar(speed);
  }
  velocity.lerp(target,1-Math.exp(-(input.lengthSq()>.002?10.2:12.5)*dt));
  if(velocity.lengthSq()>.0004)tryMove(velocity.x*dt,velocity.z*dt);
}
function updatePlayerAvatar(now,dt){
  playerAvatar.position.set(player.x,player.y,player.z);
  const av=playerAvatar.userData.avatar;
  const speed=velocity.length(),moving=speed>.08;
  if(moving){
    const desired=Math.atan2(velocity.x,velocity.z);
    let d=((desired-playerFacing+Math.PI)%(Math.PI*2))-Math.PI;
    playerFacing+=d*(1-Math.exp(-12*dt));
    av.phase+=dt*(5.1+speed*1.18);
  }else{
    av.phase+=dt*.75;
  }
  playerAvatar.rotation.y=playerFacing;
  const moveAmount=Math.min(1,speed/4.2);
  const stride=Math.sin(av.phase)*moveAmount;
  av.leftLeg.rotation.x=stride*.46;av.rightLeg.rotation.x=-stride*.46;
  av.leftKnee.rotation.x=Math.max(0,-stride)*.34;av.rightKnee.rotation.x=Math.max(0,stride)*.34;
  av.leftArm.rotation.x=-stride*.31;av.rightArm.rotation.x=stride*.31;
  av.leftElbow.rotation.x=Math.max(0,stride)*.12;av.rightElbow.rotation.x=Math.max(0,-stride)*.12;
  av.torsoGroup.rotation.z=Math.cos(av.phase*.5)*.015*moveAmount;
  av.torsoGroup.position.y=1.30+Math.sin(now*.0017)*.006*(1-moveAmount);
  av.headGroup.rotation.y=Math.sin(now*.00055)*.045;
  av.headGroup.rotation.x=Math.sin(now*.00041)*.012;
  av.shadow.material.opacity=.12+.05*(1-moveAmount);
  av.tag.visible=cameraMode==='third'&&mode==='world'&&!lowPower;
}
function updateCamera(now,dt){
  const smooth=1-Math.exp(-16*dt);
  yaw+=((targetYaw-yaw+Math.PI)%(Math.PI*2)-Math.PI)*smooth;
  pitch+=(targetPitch-pitch)*smooth;
  if(cameraMode==='third'){
    const distance=thirdPersonDistance;
    const height=lowPower?2.08:2.30;
    cameraDesired.set(
      player.x+Math.sin(yaw)*distance,
      player.y+height+pitch*1.25,
      player.z+Math.cos(yaw)*distance
    );
    // Cheap camera collision clamp for major architectural volumes.
    if(mode==='world'&&player.z<17.2&&player.z>-28){
      cameraDesired.x=THREE.MathUtils.clamp(cameraDesired.x,-10.9,10.9);
      cameraDesired.z=THREE.MathUtils.clamp(cameraDesired.z,-27.2,16.8);
      cameraDesired.y=THREE.MathUtils.clamp(cameraDesired.y,player.y+1.75,player.y+(playerLevel===1?3.2:6.5));
    }else if(mode==='twin'){
      cameraDesired.x=THREE.MathUtils.clamp(cameraDesired.x,-55.2,-34.8);cameraDesired.z=THREE.MathUtils.clamp(cameraDesired.z,-11.2,10.2);
    }else if(mode==='rehab'){
      cameraDesired.x=THREE.MathUtils.clamp(cameraDesired.x,-9.2,9.2);cameraDesired.z=THREE.MathUtils.clamp(cameraDesired.z,-65.2,-43.8);
    }else if(mode==='arena'){
      cameraDesired.x=THREE.MathUtils.clamp(cameraDesired.x,34.8,55.2);cameraDesired.z=THREE.MathUtils.clamp(cameraDesired.z,-11.2,10.2);
    }
    camera.position.lerp(cameraDesired,1-Math.exp(-10*dt));
    cameraLook.set(player.x,player.y+1.12+pitch*.48,player.z);
    camera.lookAt(cameraLook);
  }else{
    const move=Math.min(1,velocity.length()/4.35);
    const bob=move*Math.sin(now*.0102)*.006;
    const eyeY=player.y+1.72+bob;
    camera.position.set(player.x,eyeY,player.z);
    const cp=Math.cos(pitch),sp=Math.sin(pitch),look=18;
    camera.lookAt(player.x-Math.sin(yaw)*cp*look,eyeY+sp*look,player.z-Math.cos(yaw)*cp*look);
  }
  updatePlayerAvatar(now,dt);
}
function updateDestinationDoors(now,dt){
  if(!living.destinationDoors?.length)return;
  living.destinationDoors.forEach((d,i)=>{
    const near=mode==='world'&&player.z<-21.5&&player.z>-29&&Math.abs(player.x-d.x)<3.2;
    const target=near?1:0;
    d.progress+=(target-d.progress)*(1-Math.exp(-(target?8.5:5.0)*dt));
    const e=d.progress*d.progress*(3-2*d.progress);
    d.left.position.x=THREE.MathUtils.lerp(-1.08,-2.00,e);
    d.right.position.x=THREE.MathUtils.lerp(1.08,2.00,e);
    d.mat.opacity=.10+.34*e;
    d.beacon.rotation.z=now*.0011*(i%2?1:-1);
    d.beacon.scale.setScalar(.92+.10*e+.04*Math.sin(now*.004+i));
  });
}
function updateDoors(now,dt){
  let approach=mode==='world'&&player.z<25.8&&player.z>9.0&&Math.abs(player.x)<4.8;
  // Ambient people can also trigger the entrance, making it feel like a real place.
  if(!approach&&living.npcs?.length){
    approach=living.npcs.some(n=>n.visible&&Math.abs(n.position.x)<4.4&&n.position.z<23.5&&n.position.z>12.0&&Math.abs(n.position.y)<.8);
  }
  if(approach)doorHoldUntil=now+1350;
  doorTarget=(approach||now<doorHoldUntil)?1:0;
  // Smooth exponential motion, faster opening than closing.
  const response=doorTarget?7.8:4.2;
  doorProgress+=(doorTarget-doorProgress)*(1-Math.exp(-response*dt));
  const eased=doorProgress*doorProgress*(3-2*doorProgress);
  doorLeft.position.x=THREE.MathUtils.lerp(-1.29,-3.08,eased);
  doorRight.position.x=THREE.MathUtils.lerp(1.29,3.08,eased);
  const active=doorProgress>.08;
  sensorEye.material.color.setHex(active?0xe9c989:0x8f7653);
  sensorGlow.opacity=.10+.42*doorProgress;
  sensorHalo.scale.setScalar(1+doorProgress*.32);
  thresholdMat.opacity=.10+.28*doorProgress;
  doorSign.visible=doorProgress<.82;
  if(active!==doorLastOpen){
    doorLastOpen=active;
    entrance.userData.state=active?'open':'closed';
  }
}
function updateLocation(){
  if(mode==='twin'){locationName.textContent='FUNCTIONAL TWIN';return}
  if(mode==='rehab'){locationName.textContent='KŌMØ FITNESS CLUB';return}
  if(mode==='arena'){locationName.textContent='ARENA';return}
  if(playerLevel===1){
    completeJourney('upper',{silent:true});
    if(player.z<-18.8)locationName.textContent='UPPER OBSERVATORY';
    else if(player.x<0)locationName.textContent='SCIENCE LIBRARY · LEVEL 2';
    else locationName.textContent='LIFE LOUNGE · LEVEL 2';
    return;
  }
  if(player.z>57)locationName.textContent='KŌMØ DISTRICT';
  else if(player.z>23)locationName.textContent='ARRIVAL COURT';
  else if(player.z>11.8)locationName.textContent='WORLD ENTRANCE';
  else if(player.x>6.8&&player.z>-2&&player.z<7){locationName.textContent='KŌMØ LIFE';completeJourney('life',{silent:true})}
  else if(player.z>-7){locationName.textContent='KŌMØ HALL';completeJourney('hall',{silent:true})}
  else locationName.textContent='MOTION ATRIUM';
}
function updateHeading(){
  const a=((yaw%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  const dirs=['N','NE','E','SE','S','SW','W','NW'];
  headingEl.textContent=dirs[Math.round(a/(Math.PI/4))%8];
}
function updateInteraction(){
  let pool=mode==='world'?interactions:mode==='twin'?twinInteractions:mode==='rehab'?rehabInteractions:mode==='arena'?arenaInteractions:[];
  let best=null,bestD=Infinity;
  for(const it of pool){
    if(mode==='world'&&playerLevel===1&&it.level!==1)continue;
    const d=Math.hypot(player.x-it.x,player.z-it.z);
    if(d<it.r&&d<bestD){best=it;bestD=d}
  }
  if(mode==='world'){
    for(const npc of living.npcs){
      if(!npc.visible||Math.abs(npc.position.y-player.y)>1.1)continue;
      const d=Math.hypot(player.x-npc.position.x,player.z-npc.position.z);
      if(d<2.25&&d<bestD){
        const data=npc.userData.npc;
        best={id:'social',npc,title:()=>data.label||'KŌMØ Member',desc:()=>locale==='fr'?'Parler · découvrir · +15 XP':'Talk · discover · +15 XP',action:()=>showNpcConversation(npc)};
        bestD=d;
      }
    }
  }
  if((best?.id)!==(currentInteraction?.id)||(best?.npc)!==(currentInteraction?.npc)){
    currentInteraction=best;
    if(best){interactionTitle.textContent=best.title();interactionCopy.textContent=best.desc();interactionEl.classList.add('show');worldReticle.classList.add('active')}
    else{interactionEl.classList.remove('show');worldReticle.classList.remove('active')}
  }else if(best){
    interactionTitle.textContent=best.title();interactionCopy.textContent=best.desc();
  }
}
function triggerAction(){
  if(currentInteraction&&JOURNEY_MISSIONS.some(m=>m.id===currentInteraction.id))completeJourney(currentInteraction.id);
  currentInteraction?.action?.();
}
function updateTwinScan(now){
  if(mode==='twin'){
    scanRing.position.y=.85+(Math.sin(now*.0012)*.5+.5)*3.7;
    scanRing.material.opacity=.16+(Math.sin(now*.0012)*.5+.5)*.18;
    Object.values(twinDomainVisuals).forEach((v,i)=>{
      v.ring.rotation.z=now*.00035+i*.37;
      v.ring.scale.setScalar(.96+.05*Math.sin(now*.0014+i));
    });
    const bt=now*.001;
    body.rotation.y=Math.sin(bt*.23)*.16;
    biomech.rotation.y=body.rotation.y;
    if(!lowPower){
      Object.values(biomechZones).flat().forEach((part,i)=>{
        if(part.material)part.material.opacity=(part.userData.baseOpacity??part.material.opacity)*(.94+.06*Math.sin(bt*1.4+i*.33));
      });
    }
  }
  if(mode==='rehab'){
    animateRehabCoach(now,Math.min(.05,(now-(updateTwinScan.lastNow||now))/1000||.016));updateTwinScan.lastNow=now;
    Object.values(rehabStationVisuals).forEach((v,i)=>{
      if(!rehabSessionTimer)v.pulse.scale.setScalar(.95+.06*Math.sin(now*.0016+i*.9));
      v.ring.rotation.z=now*.00022*(i%2?1:-1);
    });
  }
}

window.addEventListener('keydown',e=>{
  if(['KeyW','KeyA','KeyS','KeyD','KeyZ','KeyQ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){keys.add(e.code);e.preventDefault()}
  if(e.code==='KeyE'&&!worldMenu.classList.contains('open')){triggerAction();e.preventDefault()}
  if(e.code==='KeyM'){toggleWorldMenu();e.preventDefault()}
  if(e.code==='KeyV'){toggleCamera();e.preventDefault()}
  if(e.code==='KeyG'){toggleGuide();e.preventDefault()}
  if(e.code==='Escape'){if(worldMenu.classList.contains('open'))closeWorldMenu();else if(panel.classList.contains('open'))closePanel();else if(mode!=='world')returnToHall()}
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
  targetYaw-=dx*(coarse ? .0035 : .0028);targetPitch=THREE.MathUtils.clamp(targetPitch-dy*(coarse ? .0028 : .0022),-.46,.46);
});
const endLook=e=>{dragging=false;try{canvas.releasePointerCapture?.(e.pointerId)}catch{}};
canvas.addEventListener('pointerup',endLook);canvas.addEventListener('pointercancel',endLook);
canvas.addEventListener('wheel',e=>{
  if(cameraMode!=='third')return;
  thirdPersonDistance=THREE.MathUtils.clamp(thirdPersonDistance+Math.sign(e.deltaY)*.45,3.2,7.2);e.preventDefault();
},{passive:false});

function updateJoystick(e){
  const r=joystickZone.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  let dx=e.clientX-cx,dy=e.clientY-cy;const max=42,len=Math.hypot(dx,dy)||1;
  if(len>max){dx=dx/len*max;dy=dy/len*max}
  const nx=dx/max,ny=dy/max,dead=.12,mag=Math.hypot(nx,ny);
  if(mag<dead){joyTargetX=joyTargetY=0}else{const k=(mag-dead)/(1-dead)/mag;joyTargetX=nx*k;joyTargetY=ny*k}
  joystickStick.style.transform=`translate(${dx}px,${dy}px)`;
}
joystickZone.addEventListener('pointerdown',e=>{e.stopPropagation();joyPointer=e.pointerId;joystickZone.setPointerCapture?.(e.pointerId);updateJoystick(e)});
joystickZone.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)updateJoystick(e)});
function resetJoy(e){if(joyPointer!==null&&e.pointerId!==joyPointer)return;joyPointer=null;joyTargetX=joyTargetY=0;joystickStick.style.transform='translate(0,0)'}
joystickZone.addEventListener('pointerup',resetJoy);joystickZone.addEventListener('pointercancel',resetJoy);
mobileAction.addEventListener('click',triggerAction);

$('#intro-enter').addEventListener('click',()=>{intro.classList.add('hidden');targetYaw=yaw;targetPitch=pitch;completeJourney('arrival');notify(locale==='fr'?'Bienvenue dans KŌMØ World':'Welcome to KŌMØ World')});
$('#panel-close').addEventListener('click',closePanel);
worldMenuToggle.addEventListener('click',toggleWorldMenu);
worldMenuClose.addEventListener('click',closeWorldMenu);
cameraToggle.addEventListener('click',toggleCamera);
guideToggle.addEventListener('click',toggleGuide);
qualityToggle.addEventListener('click',()=>{
  qualityMode=qualityMode==='auto'?'performance':qualityMode==='performance'?'high':'auto';
  renderScale=qualityMode==='performance'?(lowPower?(retinaMobile?.82:.74):.82):qualityMode==='high'?(lowPower?(retinaMobile?1.14:.98):1.35):(lowPower?(retinaMobile?1.04:.88):1.10);
  applyQualityProfile();notify('QUALITY · '+qualityMode.toUpperCase());
});
resetPosition.addEventListener('click',()=>fastTravel('arrival'));

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
  $('#world-menu-copy').textContent=locale==='fr'?'Choisissez un espace ou ajustez votre expérience.':'Choose a space or adjust your experience.';
  updateJourneyUI();updateHealthHUD();
  if(currentInteraction){interactionTitle.textContent=currentInteraction.title();interactionCopy.textContent=currentInteraction.desc()}
  if(panel.classList.contains('open')){
    if(mode==='twin')showTwin();else if(mode==='rehab')showRehab();else if(mode==='arena')showArena();
  }
}
languageToggle.addEventListener('click',()=>{locale=locale==='fr'?'en':'fr';applyLocale()});

window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  applyRenderScale();
});

let last=performance.now(),raf=0;
function updateLightBudget(now){
  if(now-lastBudgetUpdate<280)return;
  lastBudgetUpdate=now;
  const candidates=[];
  for(const l of new Set(living.lights)){
    if(!l||!l.parent)continue;
    l.visible=false;l.intensity=0;
    if(activeLightBudget<=0)continue;
    let p=l.parent,shown=true;
    while(p){if(p.visible===false){shown=false;break}p=p.parent}
    if(!shown)continue;
    const wp=new THREE.Vector3();l.getWorldPosition(wp);
    const d=wp.distanceTo(camera.position);
    if(d<18)candidates.push({l,d});
  }
  candidates.sort((a,b)=>a.d-b.d);
  candidates.slice(0,activeLightBudget).forEach(({l,d})=>{
    l.visible=true;
    l.intensity=(l.userData.baseIntensity||1)*THREE.MathUtils.clamp(1-d/20,.28,1);
  });
}
function updateVisibilityBudget(now){
  if(now-lastVisibilityUpdate<420)return;
  lastVisibilityUpdate=now;
  if(mode!=='world')return;
  // Coarse occlusion/distance budget: do not draw whole zones when they cannot contribute.
  const deepHall=player.z<7;
  exterior.visible=player.z>5;
  if(living.district)living.district.visible=player.z>35;
  upperLevel.visible=playerLevel===1||player.z<16;
  hallLiving.visible=player.z<19&&player.z>-29;hallHost.visible=mode==='world'&&player.z<20&&player.z>-8;
  lifeStore.visible=Math.hypot(player.x-8.45,player.z-3.8)<24;
  arrivalDetails.visible=player.z>1&&player.z<26;
  npcRoot.visible=true;
  living.trees.forEach(tree=>{
    const wp=new THREE.Vector3();tree.getWorldPosition(wp);
    tree.visible=wp.distanceTo(camera.position)<(lowPower?30:46);
  });
  living.npcs.forEach((npc,i)=>{
    const sameLevel=Math.abs(npc.position.y-player.y)<2;
    const dist=Math.hypot(npc.position.x-player.x,npc.position.z-player.z);
    const allowed=!emergencyPerformance||i<2;
    npc.visible=allowed&&sameLevel&&dist<(lowPower?20:34);
  });
  living.banners.forEach(banner=>{
    const wp=new THREE.Vector3();banner.getWorldPosition(wp);
    banner.visible=wp.distanceTo(camera.position)<42;
  });
  living.motionScreens.forEach(screen=>{
    const mesh=screen.mesh||screen;
    if(mesh?.getWorldPosition){
      const wp=new THREE.Vector3();mesh.getWorldPosition(wp);mesh.visible=wp.distanceTo(camera.position)<28;
    }
  });
}
function applyEmergencyPerformance(){
  if(!emergencyPerformance)emergencyPerformance=true;
  qualityMode='performance';
  renderScale=lowPower?(retinaMobile?.78:.68):.68;
  activeLightBudget=0;renderer.shadowMap.enabled=false;fill.intensity=0;
  living.lights.forEach(l=>{l.visible=false;if('intensity' in l)l.intensity=0});
  if(living.dust)living.dust.visible=false;
  living.clouds.forEach(c=>c.visible=false);
  // Keep only the first two ambient NPCs under emergency load.
  living.npcs.forEach((npc,i)=>{npc.visible=i<2});
  applyRenderScale();
  document.documentElement.classList.add('performance-rescue');
}
function updatePerformance(now){
  perfFrames++;
  if(now-lastPerfSample<1000)return;
  const fps=perfFrames*1000/(now-lastPerfSample);fpsEMA=fpsEMA*.72+fps*.28;perfFrames=0;lastPerfSample=now;
  if(fpsStatus)fpsStatus.textContent=Math.round(fpsEMA)+' FPS · '+renderer.info.render.calls+' DC';
  if(fpsEMA<18&&!emergencyPerformance){applyEmergencyPerformance();notify(locale==='fr'?'Mode performance activé':'Performance mode enabled')}
  if(qualityMode==='auto'&&!emergencyPerformance){
    const min=lowPower?(retinaMobile?.78:.68):.70;
    const max=lowPower?(retinaMobile?1.10:.90):1.25;
    let next=renderScale;
    if(fpsEMA<22)next=Math.max(min,renderScale-(lowPower?.07:.16));
    else if(fpsEMA<36)next=Math.max(min,renderScale-(lowPower?.045:.09));
    else if(fpsEMA<48)next=Math.max(min,renderScale-(lowPower?.025:.04));
    else if(fpsEMA>57)next=Math.min(max,renderScale+(lowPower?.02:.025));
    if(Math.abs(next-renderScale)>.01){renderScale=next;applyRenderScale()}
  }
}
function animateLiving(now){
  const t=now*.001;
  if(hallHost?.visible){
    hallHost.rotation.y=-.38+Math.sin(t*.38)*.08;
    hallHost.position.y=Math.sin(t*.72)*.006;
  }
  if(!lowPower){journeyRing.rotation.z=t*.18;journeyRing.rotation.y=t*.10;}
  if(!lowPower)living.trees.forEach((tree,i)=>{
    const sway=Math.sin(t*.42+tree.userData.swayPhase+i*.17);
    tree.rotation.z=sway*.008;tree.rotation.x=Math.cos(t*.36+tree.userData.swayPhase)*.004;
  });
  if(!lowPower)living.shimmers.forEach((q,i)=>{
    const travel=((t*.045+q.userData.phase)%1);
    q.position.z=25.5+travel*29.0;
    q.material.opacity=.045+.045*(.5+.5*Math.sin(t*.7+i));
  });
  if(living.dust){
    living.dust.rotation.y=Math.sin(t*.04)*.035;
    living.dust.position.y=Math.sin(t*.18)*.04;
    living.dust.material.opacity=.14+.06*(.5+.5*Math.sin(t*.23));
  }
  if(living.lifeDisplay&&!lowPower){
    living.lifeDisplay.orbitA.rotation.z=t*.16;
    living.lifeDisplay.orbitB.rotation.x=t*.11;
    living.lifeDisplay.globe.rotation.y=t*.10;
    if(living.lifeDisplay.flagshipCase)living.lifeDisplay.flagshipCase.rotation.y=Math.sin(t*.18)*.08;
  }
  if(living.kinetic&&!lowPower){
    living.kinetic.a.rotation.z=t*.055;
    living.kinetic.b.rotation.x=t*.041;
    living.kinetic.c.rotation.y=t*.073;
    living.kinetic.group.position.y=5.25+Math.sin(t*.32)*.045;
  }
  if(!lowPower&&living.exteriorSculptures?.length){
    living.exteriorSculptures.forEach((sculpture,i)=>{
      sculpture.a.rotation.z=t*.045+i*.32;
      sculpture.b.rotation.x=t*.038+i*.21;
      sculpture.core.position.y=Math.sin(t*.42+i)*.025;
    });
  }
  if(living.npcs?.length){
    living.npcs.forEach((npc,i)=>updateNpc(npc,t,i));
  }
    if(living.banners?.length&&(!lowPower||Math.floor(t*15)%2===0)){
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
  if(!lowPower&&Math.floor(t*8)!==animateLiving.lastScreenBucket){animateLiving.lastScreenBucket=Math.floor(t*8);living.motionScreens.forEach(screen=>drawMotionScreen(screen,t));}
  if(living.skyDome){
    living.skyDome.position.copy(camera.position);
  }
  if(living.clouds?.length){
    living.clouds.forEach((cloud,i)=>{
      let x=cloud.userData.baseX+(t*cloud.userData.speed*1.8);
      while(x>105)x-=210;
      cloud.position.x=x;
      cloud.position.z+=Math.sin(t*.035+i)*.0015;
      cloud.material.opacity=(lowPower?.075:.105)+.035*(.5+.5*Math.sin(t*.08+i*.8));
    });
  }
  if(living.fountainJets?.length){
    living.fountainJets.forEach((jet,i)=>{
      const h=.72+.52*(.5+.5*Math.sin(t*1.25+jet.userData.phase));
      jet.scale.y=h;jet.position.y=jet.userData.baseY+(h-.72)*.38;
      jet.material.opacity=.30+.16*(.5+.5*Math.sin(t*.9+i*.4));
    });
  }
  if(living.sunSprite&&living.skyUniforms){
    const d=living.skyUniforms.sunDir.value;
    living.sunSprite.position.set(camera.position.x+d.x*178,camera.position.y+d.y*178,camera.position.z+d.z*178);
  }
}
let livingAnimationFailed=false;
function animate(now){
  const dt=Math.min(.05,(now-last)/1000||.016);last=now;updatePerformance(now);
  updateMovement(dt);
  updateCamera(now,dt);
  updateDoors(now,dt);
  updateDestinationDoors(now,dt);

  // UI / proximity logic does not need 60 Hz.
  if(now-lastUiUpdate>(lowPower?100:66)){
    lastUiUpdate=now;
    updateLocation();updateHeading();updateInteraction();updateJourneyGuide(now);
  }

  // Room effects/coach stay smooth enough at 30 Hz; 20 Hz on low power.
  if(now-lastRoomFxUpdate>(lowPower?50:33)){
    lastRoomFxUpdate=now;updateTwinScan(now);
  }

  // Decorative environment at 20–30 Hz is visually identical but much cheaper.
  if(now-lastDecorUpdate>(lowPower?66:40)){
    lastDecorUpdate=now;
    if(!livingAnimationFailed){
      try{animateLiving(now)}
      catch(err){livingAnimationFailed=true;console.warn('[KŌMØ World] living animation disabled after runtime error',err)}
    }
  }

  updateLightBudget(now);
  updateVisibilityBudget(now);
  renderer.render(scene,camera);
  raf=requestAnimationFrame(animate);
}
raf=requestAnimationFrame(animate);
document.addEventListener('visibilitychange',()=>{if(document.hidden){velocity.set(0,0,0);keys.clear()}});
window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);clearInterval(daylightTimer)},{once:true});

function freezeStaticScene(){
  const dynamicMeshes=new Set([
    scanRing,living.skyDome,sensorEye,sensorHalo,thresholdA,thresholdB,journeyRing,waypointRing,waypointStem,waypointCap,
    ...guideDots.flatMap(g=>g.children),
    ...living.shimmers,
    ...living.clouds,
    ...(living.lifeDisplay?[living.lifeDisplay.orbitA,living.lifeDisplay.orbitB,living.lifeDisplay.globe,living.lifeDisplay.flagshipCase]:[]),
    ...(living.kinetic?[living.kinetic.a,living.kinetic.b,living.kinetic.c]:[]),
    ...living.exteriorSculptures.flatMap(s=>[s.a,s.b,s.core]),
    ...Object.values(biomechZones).flat(),
    ...Object.values(rehabStationVisuals).flatMap(v=>[v.ring,v.pulse])
  ].filter(Boolean));
  scene.traverse(o=>{
    if(o.isMesh&&!dynamicMeshes.has(o)&&!o.userData.dynamic){
      o.updateMatrix();
      o.matrixAutoUpdate=false;
    }
  });
}
freezeStaticScene();
applyQualityProfile();
syncPlayerElevation();
updateJourneyUI();
applyLocale();
setTimeout(()=>loader.classList.add('hidden'),380);
setTimeout(()=>loader.remove(),1050);
window.KomoWorld={
  version:'3.1.0-visual-polish',
  THREE,scene,camera,renderer,core,
  enterTwin,enterRehab,enterArena,returnToHall,
  getState:()=>({position:player.clone(),yaw:cameraMode==='third'?playerFacing:yaw,mode,level:playerLevel}),
  getLocale:()=>locale,
  getPerformance:()=>({fps:fpsEMA,qualityMode,renderScale,pixelRatio:renderer.getPixelRatio(),drawCalls:renderer.info.render.calls,activeLightBudget,shadows:renderer.shadowMap.enabled,retinaMobile}),
  getJourney:()=>({xp:journey.xp,done:{...journey.done},level:journeyLevelForXp(journey.xp)}),
  getCameraMode:()=>cameraMode,
  fastTravel,
  notify
};
import('./world-multiplayer-v1.js')
  .then(mod=>mod.mount?.(window.KomoWorld))
  .catch(err=>console.warn('[KŌMØ World multiplayer] optional layer unavailable',err));

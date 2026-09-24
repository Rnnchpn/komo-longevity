import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { TwinCore } from './v04/twin-core.js';

const $=(s)=>document.querySelector(s);
const canvas=$('#world-canvas');
const loader=$('#world-loader');
const intro=$('#intro');
const introPulse=$('#intro-pulse');
const introGuestName=$('#intro-guest-name');
const introAuthNote=$('#intro-auth-note');
const introAuthStatus=$('#intro-auth-status');
const introAvatarOpen=$('#intro-avatar-open');
const languageToggle=$('#language-toggle');
const locationChip=$('.location-chip');
const locationName=$('#location-name');
const locationPurpose=$('#location-purpose');
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
const controlsToggle=$('#controls-toggle');
const healthHud=$('#health-hud');
const healthStatusEl=$('#health-status');
const healthMuscleEl=$('#health-muscle');
const healthBalanceEl=$('#health-balance');
const healthCapacityEl=$('#health-capacity');
const healthSourceEl=$('#health-source');
const avatarToggle=$('#avatar-toggle');
const challengesToggle=$('#challenges-toggle');
const resultsToggle=$('#results-toggle');
const campusToggle=$('#campus-toggle');
const journeyToggle=$('#journey-toggle');
const menuMotion=$('#menu-motion');
const menuAge=$('#menu-age');
const menuCurrentZone=$('#menu-current-zone');
const menuCurrentPurpose=$('#menu-current-purpose');
const journeyTitleMenu=$('#journey-title-menu');
const journeyXpMenu=$('#journey-xp-menu');

const coarse=window.matchMedia?.('(pointer:coarse)')?.matches||false;
const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||((navigator.platform==='MacIntel')&&(navigator.maxTouchPoints>1));
const lowPower=coarse||isiOS;
const deviceDpr=Math.max(1,window.devicePixelRatio||1);
const retinaMobile=lowPower&&deviceDpr>=2;
document.documentElement.classList.toggle('low-power',lowPower);
document.documentElement.classList.toggle('retina-mobile',retinaMobile);
document.body.classList.toggle('world-mobile-ui',lowPower||innerWidth<=900);
document.body.classList.toggle('desktop-visual-v5',!lowPower&&innerWidth>900);
document.body.classList.add('world-intro-active');

const core=new TwinCore();
const baseline=core.snapshots[0];

const copy={
  fr:{
    today:'AUJOURD\'HUI · EXPLORER VOTRE TWIN',
    introKicker:'KŌMØ WORLD · SPATIAL LONGEVITY',
    intro1:'Votre corps.',intro2:'Votre trajectoire.',
    introBody:'Entrez dans un espace personnel conçu pour comprendre votre mouvement, choisir une action et suivre votre progression dans le temps.',
    introButton:'ENTRER EN INVITÉ',
    introPulse:'CRÉER / SE CONNECTER',
    introPulseMeta:'Profil · progression · données',
    introGuest:'MODE INVITÉ',introGuestPlaceholder:'Votre prénom ou pseudo',
    introAuthNote:'Les deux modes rejoignent le même World multijoueur. Le mode invité est temporaire.',
    action:'ACTION',
    deskTitle:'Ouvrir le KŌMØ Desk',deskCopy:'Orientation · trajectoire · espaces',
    twinTitle:'Functional Twin',twinCopy:'Courez à travers le seuil · accès automatique · E pour entrer maintenant',
    rehabTitle:'KŌMØ Fitness Club',rehabCopy:'Courez à travers le seuil · programme quotidien · coach',
    arenaTitle:'Arena',arenaCopy:'Courez à travers le seuil · défis · communauté',
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
    introButton:'ENTER AS GUEST',
    introPulse:'CREATE / SIGN IN',
    introPulseMeta:'Profile · progress · data',
    introGuest:'GUEST MODE',introGuestPlaceholder:'Your first name or nickname',
    introAuthNote:'Both modes join the same multiplayer World. Guest mode is temporary.',
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
if(introGuestName)introGuestName.value=(localStorage.getItem('komo_world_guest_name')||'').slice(0,24);

const current=()=>core.current();
$('#hud-motion').textContent=current().motion_score;
$('#hud-age').textContent=current().motion_age;

const renderer=new THREE.WebGLRenderer({canvas,antialias:!lowPower,powerPreference:'high-performance',precision:lowPower?'mediump':'highp',stencil:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,lowPower?1.45:1.8));
renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=lowPower?1.00:1.03;
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
  fill.intensity=lowPower?.12:emergencyPerformance?0:qualityMode==='high'?.62:qualityMode==='performance'?.16:.34;
  if(typeof hallLightGroup!=='undefined')hallLightGroup.visible=!lowPower&&!emergencyPerformance;
  activeLightBudget=emergencyPerformance||lowPower?0:(qualityMode==='high'?6:qualityMode==='performance'?2:4);
  living.lights.forEach(l=>{if(l){l.visible=false;l.intensity=0}});
  applyRenderScale();
}
applyRenderScale();

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xcbd2c8);
scene.fog=new THREE.Fog(0xcbd2c8,lowPower?82:58,lowPower?215:150);

const camera=new THREE.PerspectiveCamera(lowPower?60:54,innerWidth/innerHeight,.12,260);
camera.position.set(0,1.72,58);

// V6.3.1 structural lighting: directional architecture first, ambient fill second.
const hemi=new THREE.HemisphereLight(0xf3f1ea,0x4d5b52,1.72);
scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe8ca,3.05);
sun.position.set(-24,38,32);
sun.castShadow=true;
if(sun.castShadow){
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-45;
  sun.shadow.camera.near=1;sun.shadow.camera.far=110;sun.shadow.bias=-.00025;
}
scene.add(sun);
const fill=new THREE.DirectionalLight(0xdfe9e3,lowPower?.09:.44);
fill.position.set(28,18,-30);scene.add(fill);
const hallAmbient=new THREE.AmbientLight(0xfff4e8,lowPower?.09:.13);scene.add(hallAmbient);
const hallLightGroup=new THREE.Group();hallLightGroup.name='KOMO_HALL_LIGHTING_V43';scene.add(hallLightGroup);
const hallLights=[];
const hallLightProfile={day:[],morning:[],golden:[],evening:[]};

function addHallPoint({p,color=0xffdfb3,intensity=6,distance=15}){
  if(lowPower)return null;
  const l=new THREE.PointLight(color,intensity,distance,2.0);
  l.position.set(...p);l.userData.baseIntensity=intensity;l.userData.profileIntensity=intensity;l.userData.lightingRole='decorative';l.visible=false;
  hallLightGroup.add(l);hallLights.push(l);return l;
}
function addHallSpot({p,target,color=0xffe2bd,intensity=24,distance=18,angle=.72,penumbra=.72}){
  if(lowPower)return null;
  const l=new THREE.SpotLight(color,intensity,distance,angle,penumbra,1.55);
  l.position.set(...p);l.castShadow=false;l.userData.baseIntensity=intensity;l.userData.profileIntensity=intensity;l.userData.lightingRole='decorative';l.visible=false;
  const t=new THREE.Object3D();t.position.set(...target);hallLightGroup.add(t);l.target=t;
  hallLightGroup.add(l);hallLights.push(l);return l;
}

// Quiet bounce gives believable fill without flattening the whole interior.
addHallPoint({p:[0,5.6,10.5],color:0xffe7c9,intensity:5.2,distance:16});
addHallPoint({p:[0,4.5,-10.5],color:0xe6eee8,intensity:3.2,distance:15});

// Architectural downlights: entrance, central promenade and destination threshold.
addHallSpot({p:[0,7.25,10.8],target:[0,.3,9.0],color:0xffe3b8,intensity:28,distance:17,angle:.66,penumbra:.82});
addHallSpot({p:[0,7.20,-5.4],target:[0,.25,-5.4],color:0xffdfb0,intensity:31,distance:17,angle:.60,penumbra:.78});
addHallSpot({p:[0,7.15,-18.4],target:[0,.28,-20.0],color:0xf1e5d0,intensity:25,distance:17,angle:.62,penumbra:.84});

// Side accents give the walls and furniture dimensionality.
addHallSpot({p:[-8.8,5.85,1.8],target:[-7.1,.8,1.2],color:0xffd49a,intensity:15,distance:12,angle:.58,penumbra:.88});
addHallSpot({p:[8.8,5.85,-11.8],target:[7.1,.8,-12.4],color:0xffd49a,intensity:15,distance:12,angle:.58,penumbra:.88});

// Destination accents: slightly different temperatures create spatial orientation.
addHallSpot({p:[-5.1,5.3,-24.0],target:[-4.6,1.35,-26.0],color:0xdceae0,intensity:17,distance:10,angle:.48,penumbra:.86});
addHallSpot({p:[0,5.3,-24.0],target:[0,1.35,-26.0],color:0xffdda2,intensity:19,distance:10,angle:.48,penumbra:.86});
addHallSpot({p:[5.1,5.3,-24.0],target:[4.6,1.35,-26.0],color:0xe8c98f,intensity:17,distance:10,angle:.48,penumbra:.86});

// Profiles keep daylight changes natural rather than just multiplying everything.
hallLights.forEach((l,i)=>{
  const base=l.userData.baseIntensity||1;
  hallLightProfile.day[i]=base*.82;
  hallLightProfile.morning[i]=base*.90;
  hallLightProfile.golden[i]=base*.98;
  hallLightProfile.evening[i]=base*1.12;
});


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
  daylight:'day',
  lightingV631:null,
  atmosphereV632:null,
  livingCampusV64:null,
  waterfallsV64:[]
};

// V1.8 true sky — atmospheric dome, visible sun and slow cloud field.
const skyUniforms={
  zenithColor:{value:new THREE.Color(0x789caf)},
  upperColor:{value:new THREE.Color(0x9eb8c2)},
  horizonColor:{value:new THREE.Color(0xdde3dc)},
  hazeColor:{value:new THREE.Color(0xe8ddd0)},
  lowColor:{value:new THREE.Color(0xeee0cf)},
  sunDir:{value:new THREE.Vector3(-.45,.58,.42).normalize()},
  sunColor:{value:new THREE.Color(0xffe0b8)},
  sunStrength:{value:.54},
  horizonSoftness:{value:.34}
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
    uniform vec3 zenithColor;
    uniform vec3 upperColor;
    uniform vec3 horizonColor;
    uniform vec3 hazeColor;
    uniform vec3 lowColor;
    uniform vec3 sunDir;
    uniform vec3 sunColor;
    uniform float sunStrength;
    uniform float horizonSoftness;
    void main(){
      vec3 dir=normalize(vWorldPosition-cameraPosition);
      float y=clamp(dir.y,-1.0,1.0);

      // Four-stage natural gradient: warm low atmosphere → soft horizon → desaturated upper sky → zenith.
      float horizonBand=exp(-abs(y)/max(.08,horizonSoftness));
      float upperMix=smoothstep(.05,.58,y);
      float zenithMix=smoothstep(.42,.96,y);
      vec3 base=mix(horizonColor,upperColor,upperMix);
      base=mix(base,zenithColor,zenithMix);
      float below=smoothstep(.10,-.34,y);
      base=mix(base,lowColor,below*.72);
      base=mix(base,hazeColor,horizonBand*.24);

      // Broad atmospheric solar glow only: no artificial visible sun disc.
      float s=max(dot(dir,normalize(sunDir)),0.0);
      float sunGlow=pow(s,18.0);
      float sunHalo=pow(s,5.5);
      base+=sunColor*(sunGlow*.115+sunHalo*.020)*sunStrength;

      // Very subtle desaturation near the horizon improves distance perception.
      float luma=dot(base,vec3(.299,.587,.114));
      base=mix(base,vec3(luma),horizonBand*.055);
      gl_FragColor=vec4(base,1.0);
    }
  `
});
const skyDome=new THREE.Mesh(new THREE.SphereGeometry(300,lowPower?24:48,lowPower?12:28),skyMaterial);
skyDome.name='KOMO_TRUE_SKY_V18';skyDome.renderOrder=-1000;scene.add(skyDome);
living.skyDome=skyDome;living.skyUniforms=skyUniforms;

function makeCloudTexture(seed=0){
  const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
  x.clearRect(0,0,c.width,c.height);
  const count=5+(seed%3);
  for(let i=0;i<count;i++){
    const px=.13+i*(.72/Math.max(1,count-1))+.035*Math.sin(seed*1.7+i*2.1);
    const py=.48+.10*Math.sin(seed*.9+i*1.4);
    const r=.17+.055*((i+seed)%3);
    const gx=px*c.width,gy=py*c.height,rr=r*c.width;
    const g=x.createRadialGradient(gx,gy,0,gx,gy,rr);
    g.addColorStop(0,'rgba(255,255,255,.52)');
    g.addColorStop(.34,'rgba(255,255,255,.27)');
    g.addColorStop(.72,'rgba(255,255,255,.075)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=g;x.fillRect(0,0,c.width,c.height);
  }
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
  tx.minFilter=THREE.LinearMipmapLinearFilter;tx.magFilter=THREE.LinearFilter;return tx;
}
const cloudTextures=[makeCloudTexture(1),makeCloudTexture(4),makeCloudTexture(7)];
const cloudGroup=new THREE.Group();cloudGroup.name='KOMO_CLOUD_FIELD_V632';scene.add(cloudGroup);
const cloudCount=lowPower?1:9;
for(let i=0;i<cloudCount;i++){
  const mat=new THREE.MeshBasicMaterial({
    map:cloudTextures[i%cloudTextures.length],transparent:true,opacity:lowPower?.045:.080,
    depthWrite:false,depthTest:true,side:THREE.DoubleSide,fog:true
  });
  const w=29+(i%4)*8,h=9+(i%3)*3.5;
  const cloud=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
  cloud.rotation.x=-Math.PI/2;
  cloud.rotation.z=((i%5)-2)*.035;
  cloud.position.set(-105+i*27,44+(i%4)*3.8,-92+(i%5)*42);
  cloud.scale.x=.92+(i%3)*.16;cloud.scale.y=.88+(i%2)*.12;
  cloud.userData.baseX=cloud.position.x;
  cloud.userData.baseZ=cloud.position.z;
  cloud.userData.baseOpacity=lowPower?.045:(.058+(i%4)*.009);
  cloud.userData.speed=.095+(i%4)*.025;
  cloud.userData.phase=i*.91;
  cloudGroup.add(cloud);living.clouds.push(cloud);
}
// V3.4 horizon cleanup — keep atmospheric lighting without the oversized sun disc.
living.sunSprite=null;

function applyDaylight(){
  const d=new Date(),h=d.getHours()+d.getMinutes()/60;
  let bg=0xe1e7e1,fog=0xdce2dc,sunColor=0xffe8ca,sunPower=3.05,hemiPower=1.72,exposure=lowPower?1.00:1.03,state='day';
  let zenith=0x789caf,upper=0x9eb8c2,horizon=0xdde3dc,haze=0xe8ddd0,low=0xeee0cf,skySun=0xffe0b8,skyStrength=.54,horizonSoftness=.34;
  let fogNear=lowPower?96:72,fogFar=lowPower?238:188;
  if(h<7||h>=21){
    bg=0x74838a;fog=0x8c9691;sunColor=0xe5d6c9;sunPower=1.48;hemiPower=1.12;exposure=.88;state='evening';
    zenith=0x415966;upper=0x667a80;horizon=0x939995;haze=0x9e948a;low=0xa7816e;skySun=0xe4cdb9;skyStrength=.11;horizonSoftness=.42;
    fogNear=lowPower?92:68;fogFar=lowPower?220:172;
  }else if(h<9){
    bg=0xe0e5df;fog=0xdbe0d9;sunColor=0xffd8aa;sunPower=2.62;hemiPower=1.55;exposure=.99;state='morning';
    zenith=0x83a6b5;upper=0xaec1c1;horizon=0xe5d9ca;haze=0xead6c0;low=0xeeb985;skySun=0xffc98d;skyStrength=.64;horizonSoftness=.37;
    fogNear=lowPower?94:70;fogFar=lowPower?230:182;
  }else if(h>=17.5){
    bg=0xdfd9cd;fog=0xd8d1c5;sunColor=0xffcf9b;sunPower=2.72;hemiPower=1.42;exposure=.97;state='golden';
    zenith=0x8299a4;upper=0xaeb6b2;horizon=0xe2cfb8;haze=0xe7c7a7;low=0xe8a876;skySun=0xffbd7c;skyStrength=.68;horizonSoftness=.40;
    fogNear=lowPower?98:74;fogFar=lowPower?228:180;
  }
  scene.background.setHex(bg);scene.fog.color.setHex(fog);scene.fog.near=fogNear;scene.fog.far=fogFar;
  sun.color.setHex(sunColor);sun.intensity=sunPower;hemi.intensity=hemiPower;renderer.toneMappingExposure=exposure;living.daylight=state;
  hallAmbient.intensity=state==='evening'?.17:state==='golden'?.13:state==='morning'?.12:.105;
  fill.color.setHex(state==='evening'?0xcfdad4:state==='golden'?0xe7ddd1:0xdfe9e3);
  const practicalProfile=hallLightProfile[state]||hallLightProfile.day;
  hallLights.forEach((l,i)=>{l.userData.profileIntensity=practicalProfile[i]??l.userData.baseIntensity??1});
  applyLightingV631Profile(state);
  if(renderer.shadowMap.enabled)renderer.shadowMap.needsUpdate=true;
  const dayT=THREE.MathUtils.clamp((h-6)/15,0,1);
  const arc=Math.PI*dayT;
  const dir=new THREE.Vector3(-Math.cos(arc)*.82,Math.max(.08,Math.sin(arc)*.88),.42).normalize();
  skyUniforms.zenithColor.value.setHex(zenith);skyUniforms.upperColor.value.setHex(upper);
  skyUniforms.horizonColor.value.setHex(horizon);skyUniforms.hazeColor.value.setHex(haze);skyUniforms.lowColor.value.setHex(low);
  skyUniforms.sunDir.value.copy(dir);skyUniforms.sunColor.value.setHex(skySun);skyUniforms.sunStrength.value=skyStrength;skyUniforms.horizonSoftness.value=horizonSoftness;
  applyAtmosphereV632Profile(state);
  sun.position.set(dir.x*48,Math.max(16,dir.y*56),dir.z*48);
  if(living.sunSprite){living.sunSprite.material.opacity=state==='evening'?.28:.88}
}applyDaylight();
const daylightTimer=setInterval(applyDaylight,60000);

// V4.4 Materials Realism — procedural PBR kit shared across the campus.
const TEX_SIZE=lowPower?256:512;
const TEX_ANISO=Math.min(lowPower?2:8,renderer.capabilities.getMaxAnisotropy());
const fract=n=>n-Math.floor(n);
const hash2=(x,y,seed=1)=>fract(Math.sin(x*127.1+y*311.7+seed*74.7)*43758.5453123);

function canvasTexture(canvas,{repeat=[1,1],srgb=false}={}){
  const tx=new THREE.CanvasTexture(canvas);
  if(srgb)tx.colorSpace=THREE.SRGBColorSpace;
  tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(...repeat);
  tx.anisotropy=TEX_ANISO;
  tx.minFilter=THREE.LinearMipmapLinearFilter;tx.magFilter=THREE.LinearFilter;
  return tx;
}
// V6.0: derive a subtle tangent-space normal map once at startup from the procedural height field.
// Desktop gets true normal response; low-power devices keep the cheaper roughness/albedo path.
function normalTextureFromHeight(heightCanvas,repeat=[1,1],strength=2.0){
  if(lowPower)return null;
  const w=heightCanvas.width,h=heightCanvas.height,src=heightCanvas.getContext('2d').getImageData(0,0,w,h).data;
  const out=document.createElement('canvas');out.width=w;out.height=h;
  const ctx=out.getContext('2d'),img=ctx.createImageData(w,h),dst=img.data;
  const lum=(x,y)=>src[((Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x)))*4)];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const dx=(lum(x+1,y)-lum(x-1,y))/255*strength;
    const dy=(lum(x,y+1)-lum(x,y-1))/255*strength;
    const nx=-dx,ny=-dy,nz=1/Math.max(.65,Math.sqrt(1+nx*nx+ny*ny));
    const l=Math.sqrt(nx*nx+ny*ny+1)||1,idx=(y*w+x)*4;
    dst[idx]=Math.round((nx/l*.5+.5)*255);
    dst[idx+1]=Math.round((ny/l*.5+.5)*255);
    dst[idx+2]=Math.round((1/l*.5+.5)*255);dst[idx+3]=255;
  }
  ctx.putImageData(img,0,0);
  return canvasTexture(out,{repeat});
}
function makeSurfaceCanvases(kind,{seed=1,base='#ddd1bf',accent='#aa9578',dark='#776754'}={}){
  const size=TEX_SIZE;
  const color=document.createElement('canvas'),rough=document.createElement('canvas'),height=document.createElement('canvas');
  color.width=color.height=rough.width=rough.height=height.width=height.height=size;
  const cx=color.getContext('2d'),rx=rough.getContext('2d'),hx=height.getContext('2d');

  cx.fillStyle=base;cx.fillRect(0,0,size,size);
  rx.fillStyle='#b8b8b8';rx.fillRect(0,0,size,size);
  hx.fillStyle='#808080';hx.fillRect(0,0,size,size);

  if(kind==='travertine'||kind==='limestone'){
    const horizontal=kind==='travertine';
    for(let i=0;i<(horizontal?38:26);i++){
      const a=(i*37+seed*53)%size;
      cx.beginPath();hx.beginPath();rx.beginPath();
      for(let p=0;p<=size;p+=8){
        const wave=Math.sin(p*.018+i*1.31+seed)*5+Math.sin(p*.006+i*.77)*8;
        const x=horizontal?p:a+wave,y=horizontal?a+wave:p;
        if(p===0){cx.moveTo(x,y);hx.moveTo(x,y);rx.moveTo(x,y)}
        else{cx.lineTo(x,y);hx.lineTo(x,y);rx.lineTo(x,y)}
      }
      cx.strokeStyle=i%5===0?'rgba(105,87,67,.17)':'rgba(255,255,255,.10)';
      cx.lineWidth=i%7===0?2.2:1;cx.stroke();
      hx.strokeStyle=i%4===0?'rgba(78,78,78,.24)':'rgba(170,170,170,.12)';hx.lineWidth=i%5===0?2:1;hx.stroke();
      rx.strokeStyle=i%3===0?'rgba(72,72,72,.16)':'rgba(220,220,220,.11)';rx.lineWidth=2;rx.stroke();
    }
    const pits=horizontal?340:210;
    for(let i=0;i<pits;i++){
      const px=hash2(i,seed,2)*size,py=hash2(i,seed,7)*size,r=.45+hash2(i,seed,9)*(horizontal?2.1:1.25);
      cx.fillStyle=i%4===0?'rgba(85,70,55,.09)':'rgba(255,255,255,.045)';
      cx.beginPath();cx.arc(px,py,r,0,Math.PI*2);cx.fill();
      hx.fillStyle=i%3===0?'rgba(45,45,45,.23)':'rgba(175,175,175,.10)';
      hx.beginPath();hx.arc(px,py,r*.85,0,Math.PI*2);hx.fill();
    }
  }else if(kind==='plaster'){
    for(let y=0;y<size;y+=3){
      for(let x=0;x<size;x+=3){
        const n=hash2(x,y,seed),n2=hash2(x+17,y+29,seed);
        const v=Math.floor(244+(n-.5)*13);
        cx.fillStyle=`rgb(${v},${Math.max(0,v-4)},${Math.max(0,v-9)})`;cx.fillRect(x,y,3,3);
        const h=Math.floor(116+n2*26);hx.fillStyle=`rgb(${h},${h},${h})`;hx.fillRect(x,y,3,3);
        const r=Math.floor(160+n*34);rx.fillStyle=`rgb(${r},${r},${r})`;rx.fillRect(x,y,3,3);
      }
    }
    for(let i=0;i<14;i++){
      const yy=(i*41+seed*23)%size;
      cx.strokeStyle='rgba(145,126,105,.035)';cx.lineWidth=1;cx.beginPath();cx.moveTo(0,yy);cx.bezierCurveTo(size*.3,yy+5,size*.7,yy-4,size,yy+2);cx.stroke();
    }
  }else if(kind==='walnut'){
    cx.fillStyle=base;cx.fillRect(0,0,size,size);
    for(let i=0;i<46;i++){
      const yy=(i*13+seed*19)%size;
      const width=1+hash2(i,seed,4)*3;
      cx.strokeStyle=i%5===0?'rgba(38,20,12,.30)':'rgba(226,177,118,.12)';
      cx.lineWidth=width;cx.beginPath();
      for(let x=0;x<=size;x+=8){
        const y=yy+Math.sin(x*.020+i*.7)*4+Math.sin(x*.006+i)*7;
        if(x===0)cx.moveTo(x,y);else cx.lineTo(x,y);
      }cx.stroke();
      hx.strokeStyle=i%4===0?'rgba(52,52,52,.18)':'rgba(185,185,185,.08)';hx.lineWidth=Math.max(1,width*.65);
      hx.beginPath();for(let x=0;x<=size;x+=8){const y=yy+Math.sin(x*.020+i*.7)*4+Math.sin(x*.006+i)*7;if(x===0)hx.moveTo(x,y);else hx.lineTo(x,y)}hx.stroke();
    }
    for(let i=0;i<8;i++){
      const px=hash2(i,seed,10)*size,py=hash2(i,seed,12)*size,rr=5+hash2(i,seed,14)*10;
      cx.strokeStyle='rgba(42,22,13,.22)';cx.lineWidth=1.5;
      for(let k=0;k<3;k++){cx.beginPath();cx.ellipse(px,py,rr+k*4,(rr+k*4)*.48,.2,0,Math.PI*2);cx.stroke()}
    }
    rx.fillStyle='rgba(120,120,120,.34)';rx.fillRect(0,0,size,size);
  }else if(kind==='fabric'){
    cx.fillStyle=base;cx.fillRect(0,0,size,size);
    for(let i=0;i<size;i+=4){
      cx.strokeStyle=i%8===0?'rgba(255,255,255,.055)':'rgba(30,35,31,.055)';
      cx.beginPath();cx.moveTo(i,0);cx.lineTo(i,size);cx.stroke();
      cx.beginPath();cx.moveTo(0,i);cx.lineTo(size,i);cx.stroke();
      hx.strokeStyle=i%8===0?'rgba(165,165,165,.22)':'rgba(105,105,105,.18)';
      hx.beginPath();hx.moveTo(i,0);hx.lineTo(i,size);hx.stroke();
      hx.beginPath();hx.moveTo(0,i);hx.lineTo(size,i);hx.stroke();
    }
    rx.fillStyle='rgba(215,215,215,.54)';rx.fillRect(0,0,size,size);
  }else if(kind==='leather'){
    cx.fillStyle=base;cx.fillRect(0,0,size,size);
    for(let y=0;y<size;y+=3){
      for(let x=0;x<size;x+=3){
        const n=hash2(x,y,seed),n2=hash2(x+9,y+21,seed);
        const alpha=.025+n*.055;
        cx.fillStyle=n>.52?`rgba(255,255,255,${alpha})`:`rgba(40,25,18,${alpha*.72})`;
        cx.fillRect(x,y,2,2);
        const h=Math.floor(110+n2*38);hx.fillStyle=`rgb(${h},${h},${h})`;hx.fillRect(x,y,2,2);
        const r=Math.floor(148+n*52);rx.fillStyle=`rgb(${r},${r},${r})`;rx.fillRect(x,y,2,2);
      }
    }
    for(let i=0;i<24;i++){
      const px=hash2(i,seed,31)*size,py=hash2(i,seed,33)*size;
      cx.strokeStyle='rgba(35,20,14,.045)';cx.lineWidth=.7;cx.beginPath();cx.arc(px,py,8+hash2(i,seed,35)*18,0,Math.PI*1.35);cx.stroke();
    }
  }else if(kind==='micro'){
    cx.fillStyle=base;cx.fillRect(0,0,size,size);
    for(let y=0;y<size;y+=3){
      for(let x=0;x<size;x+=3){
        const n=hash2(x,y,seed),n2=hash2(x+17,y+11,seed),a=.018+n*.045;
        cx.fillStyle=n>.50?`rgba(255,255,255,${a})`:`rgba(0,0,0,${a*.74})`;
        cx.fillRect(x,y,3,3);
        const h=Math.floor(118+n2*26);hx.fillStyle=`rgb(${h},${h},${h})`;hx.fillRect(x,y,3,3);
        const r=Math.floor(128+n*64);rx.fillStyle=`rgb(${r},${r},${r})`;rx.fillRect(x,y,3,3);
      }
    }
    for(let i=0;i<10;i++){
      const yy=(i*53+seed*29)%size;
      cx.strokeStyle='rgba(255,255,255,.024)';cx.lineWidth=1;cx.beginPath();cx.moveTo(0,yy);cx.lineTo(size,yy+Math.sin(i)*3);cx.stroke();
    }
  }else if(kind==='brushed'){
    cx.fillStyle=base;cx.fillRect(0,0,size,size);
    for(let y=0;y<size;y+=2){
      const n=hash2(y,seed,5);
      cx.fillStyle=`rgba(255,255,255,${.015+n*.055})`;cx.fillRect(0,y,size,1);
      const r=Math.floor(90+n*85);rx.fillStyle=`rgb(${r},${r},${r})`;rx.fillRect(0,y,size,1);
      const h=Math.floor(112+n*26);hx.fillStyle=`rgb(${h},${h},${h})`;hx.fillRect(0,y,size,1);
    }
  }
  return {color,rough,height};
}
function makeSurface(kind,opts={},repeat=[1,1]){
  const c=makeSurfaceCanvases(kind,opts);
  const normalMap=normalTextureFromHeight(c.height,repeat,kind==='walnut'?1.55:kind==='brushed'?1.15:2.05);
  return {
    map:canvasTexture(c.color,{repeat,srgb:true}),
    roughnessMap:canvasTexture(c.rough,{repeat}),
    bumpMap:canvasTexture(c.height,{repeat}),
    ...(normalMap?{normalMap}:{})
  };
}
function makePbrMaterial(kind,opts={},repeat=[1,1],params={}){
  const tex=makeSurface(kind,opts,repeat);
  return new THREE.MeshStandardMaterial({
    ...tex,
    color:params.color??0xffffff,
    roughness:params.roughness??.65,
    metalness:params.metalness??0,
    bumpScale:lowPower?0:(params.bumpScale??.025),
    envMapIntensity:params.envMapIntensity??1
  });
}

const S_TRAVERTINE=makeSurface('travertine',{seed:3,base:'#e2d4c0'},[1.8,3.4]);
const S_LIMESTONE=makeSurface('limestone',{seed:11,base:'#ddd1bd'},[2.2,3.0]);
const S_PLASTER=makeSurface('plaster',{seed:19,base:'#eee9df'},[2.8,2.8]);
const S_WALNUT=makeSurface('walnut',{seed:23,base:'#6e4c32'},[1.2,3.0]);
const S_FABRIC=makeSurface('fabric',{seed:29,base:'#435449'},[8,8]);
const S_FABRIC_LIGHT=makeSurface('fabric',{seed:31,base:'#bbb5aa'},[8,8]);
const S_BRASS=makeSurface('brushed',{seed:37,base:'#b28b57'},[1,3]);
const S_BRONZE=makeSurface('brushed',{seed:41,base:'#9f754b'},[1,3]);
const S_LEATHER=makeSurface('leather',{seed:43,base:'#8c755d'},[4,4]);
const S_LEATHER_DARK=makeSurface('leather',{seed:47,base:'#4d4036'},[4,4]);
const S_SAGE=makeSurface('micro',{seed:53,base:'#385143'},[4.5,4.5]);
const S_SAGE_DEEP=makeSurface('micro',{seed:59,base:'#182a22'},[4.5,4.5]);
const S_BLACKENED=makeSurface('brushed',{seed:61,base:'#202721'},[1.3,4.0]);
const S_RUBBER=makeSurface('micro',{seed:67,base:'#252822'},[7,7]);

const M={
  ground:new THREE.MeshStandardMaterial({color:0x9ba690,roughness:.98,metalness:0}),
  stone:new THREE.MeshStandardMaterial({...S_TRAVERTINE,color:0xffffff,roughness:.58,metalness:.01,bumpScale:lowPower?0:.030}),
  stoneLight:new THREE.MeshStandardMaterial({...S_LIMESTONE,color:0xfbf8f2,roughness:.62,metalness:.005,bumpScale:lowPower?0:.020}),
  stoneDeep:new THREE.MeshStandardMaterial({...S_LIMESTONE,color:0xcbbda9,roughness:.74,metalness:.005,bumpScale:lowPower?0:.026}),
  wall:new THREE.MeshStandardMaterial({...S_PLASTER,color:0xfffdf8,roughness:.78,metalness:0,bumpScale:lowPower?0:.014}),
  sage:new THREE.MeshStandardMaterial({...S_SAGE,color:0xffffff,roughness:.56,metalness:.018,bumpScale:lowPower?0:.010,normalScale:new THREE.Vector2(.62,.62)}),
  sageDeep:new THREE.MeshStandardMaterial({...S_SAGE_DEEP,color:0xffffff,roughness:.50,metalness:.032,bumpScale:lowPower?0:.008,normalScale:new THREE.Vector2(.56,.56)}),
  sageSoft:new THREE.MeshStandardMaterial({color:0x708271,roughness:.90,metalness:0}),
  bronze:new THREE.MeshStandardMaterial({...S_BRONZE,color:0xffffff,roughness:.26,metalness:.72,bumpScale:lowPower?0:.008}),
  bronzeSoft:new THREE.MeshStandardMaterial({...S_BRONZE,color:0xd9b681,roughness:.34,metalness:.48,bumpScale:lowPower?0:.006}),
  soil:new THREE.MeshStandardMaterial({color:0x565b50,roughness:1,metalness:0}),
  trunk:new THREE.MeshStandardMaterial({...S_WALNUT,color:0x8a6545,roughness:.82,metalness:0,bumpScale:lowPower?0:.018}),
  water:lowPower?
    new THREE.MeshStandardMaterial({color:0x87a39a,roughness:.34,metalness:.02,transparent:true,opacity:.62,depthWrite:true}):
    new THREE.MeshPhysicalMaterial({color:0x91aaa1,roughness:.08,metalness:0,transparent:true,opacity:.50,transmission:.28,ior:1.333,thickness:.12,clearcoat:.28,clearcoatRoughness:.14,depthWrite:true}),
  glass:lowPower?
    new THREE.MeshStandardMaterial({color:0xaab8b0,roughness:.24,metalness:.02,transparent:true,opacity:.24,depthWrite:false}):
    new THREE.MeshPhysicalMaterial({color:0xd4ddd8,roughness:.045,metalness:0,transparent:true,opacity:.17,transmission:.74,ior:1.48,thickness:.18,clearcoat:.34,clearcoatRoughness:.08,depthWrite:false,side:THREE.DoubleSide}),
  warm:new THREE.MeshStandardMaterial({color:0xf2d09a,roughness:.30,metalness:.02,emissive:0x9a612c,emissiveIntensity:.38}),
  twinGlass:lowPower?
    new THREE.MeshStandardMaterial({color:0x91a99a,roughness:.30,metalness:.02,transparent:true,opacity:.46,depthWrite:false}):
    new THREE.MeshPhysicalMaterial({color:0xa8c1b0,roughness:.10,metalness:.01,transparent:true,opacity:.36,transmission:.38,ior:1.46,thickness:.10,clearcoat:.18,clearcoatRoughness:.12,depthWrite:false}),
  twinGlow:new THREE.MeshStandardMaterial({color:0xb8d0bc,roughness:.34,metalness:.03,emissive:0x577462,emissiveIntensity:.42}),
  attention:new THREE.MeshStandardMaterial({color:0xcf9f65,roughness:.34,metalness:.08,emissive:0x8c5627,emissiveIntensity:.48}),
  arena:new THREE.MeshStandardMaterial({...S_RUBBER,color:0x453a2b,roughness:.72,metalness:.035,bumpScale:lowPower?0:.010,normalScale:new THREE.Vector2(.68,.68)}),
  arenaGold:new THREE.MeshStandardMaterial({...S_BRASS,color:0xc8a36d,roughness:.25,metalness:.70,bumpScale:lowPower?0:.006})
};
const wallWarm=M.wall.clone();wallWarm.color.setHex(0xfffbf3);wallWarm.roughness=.74;
const wallShade=M.wall.clone();wallShade.color.setHex(0xe8e2d9);wallShade.roughness=.82;
const stoneWarm=M.stoneLight.clone();stoneWarm.color.setHex(0xf2e8d9);stoneWarm.roughness=.66;

const MAT={
  fabric:new THREE.MeshStandardMaterial({...S_FABRIC,color:0xffffff,roughness:.92,metalness:0,bumpScale:lowPower?0:.018}),
  fabricLight:new THREE.MeshStandardMaterial({...S_FABRIC_LIGHT,color:0xffffff,roughness:.94,metalness:0,bumpScale:lowPower?0:.016}),
  walnut:new THREE.MeshStandardMaterial({...S_WALNUT,color:0xffffff,roughness:.56,metalness:.01,bumpScale:lowPower?0:.024}),
  charcoal:new THREE.MeshStandardMaterial({color:0x222a25,roughness:.62,metalness:.04}),
  brass:new THREE.MeshStandardMaterial({...S_BRASS,color:0xffffff,roughness:.24,metalness:.76,bumpScale:lowPower?0:.008}),
  ivory:new THREE.MeshStandardMaterial({...S_FABRIC_LIGHT,color:0xf8f2e8,roughness:.91,metalness:0,bumpScale:lowPower?0:.010}),
  smokedGlass:lowPower?
    new THREE.MeshStandardMaterial({color:0x67776d,roughness:.30,metalness:.03,transparent:true,opacity:.27,depthWrite:false}):
    new THREE.MeshPhysicalMaterial({color:0x708178,roughness:.095,metalness:.01,transparent:true,opacity:.20,transmission:.50,ior:1.46,thickness:.14,clearcoat:.20,clearcoatRoughness:.10,depthWrite:false,side:THREE.DoubleSide}),
  limestone:new THREE.MeshStandardMaterial({...S_LIMESTONE,color:0xf0e8db,roughness:.74,metalness:0,bumpScale:lowPower?0:.025}),
  travertine:new THREE.MeshStandardMaterial({...S_TRAVERTINE,color:0xf5e9d7,roughness:.61,metalness:.008,bumpScale:lowPower?0:.032}),
  blackened:new THREE.MeshStandardMaterial({...S_BLACKENED,color:0xffffff,roughness:.38,metalness:.24,bumpScale:lowPower?0:.005,normalScale:new THREE.Vector2(.44,.44)}),
  leather:new THREE.MeshStandardMaterial({...S_LEATHER,color:0xffffff,roughness:.66,metalness:0,bumpScale:lowPower?0:.020}),
  leatherDark:new THREE.MeshStandardMaterial({...S_LEATHER_DARK,color:0xffffff,roughness:.58,metalness:.01,bumpScale:lowPower?0:.018})
};

// V5.9 wall architecture palette — restrained, tactile and shared across the campus.
const WALL={
  ivory:M.wall.clone(),
  mineral:MAT.limestone.clone(),
  travertine:MAT.travertine.clone(),
  sage:M.sage.clone(),
  sageDeep:M.sageDeep.clone(),
  walnut:MAT.walnut.clone(),
  black:MAT.blackened.clone(),
  brass:MAT.brass.clone()
};
WALL.ivory.color.setHex(0xf7f1e7);WALL.ivory.roughness=.78;
WALL.mineral.color.setHex(0xe8dfd1);WALL.mineral.roughness=.72;
WALL.travertine.color.setHex(0xead9c1);WALL.travertine.roughness=.58;
WALL.sage.color.setHex(0x334d40);WALL.sage.roughness=.52;
WALL.sageDeep.color.setHex(0x14251e);WALL.sageDeep.roughness=.46;
WALL.walnut.roughness=.62;
WALL.black.roughness=.40;

// V6.0 PBR pack: blackened metal now has its own neutral brushed maps instead of borrowing brass.
MAT.blackened.needsUpdate=true;

// V5.0 desktop cinematic material accents.
const CINEMATIC={
  floor:lowPower?null:new THREE.MeshPhysicalMaterial({
    color:0xe8dcc9,roughness:.22,metalness:.015,transparent:true,opacity:.26,
    clearcoat:.58,clearcoatRoughness:.14,depthWrite:false,side:THREE.DoubleSide
  }),
  darkGlass:lowPower?null:new THREE.MeshPhysicalMaterial({
    color:0x22332b,roughness:.09,metalness:.02,transparent:true,opacity:.22,
    transmission:.42,ior:1.46,thickness:.16,clearcoat:.36,clearcoatRoughness:.08,depthWrite:false
  }),
  warmGlow:lowPower?null:new THREE.MeshBasicMaterial({
    color:0xffdfaa,transparent:true,opacity:.075,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
  }),
  coolGlow:lowPower?null:new THREE.MeshBasicMaterial({
    color:0xd9ebe1,transparent:true,opacity:.052,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
  })
};

function makeStoneTexture(base='#ddd1bf',vein='#b9aa94',joint='#8f806d',seed=1){
  // Legacy-compatible floor texture, upgraded with mineral variation and deterministic joints.
  const c=document.createElement('canvas');c.width=c.height=TEX_SIZE;const x=c.getContext('2d');
  x.fillStyle=base;x.fillRect(0,0,TEX_SIZE,TEX_SIZE);
  x.strokeStyle=joint;x.globalAlpha=.16;x.lineWidth=1.5;
  [0,TEX_SIZE/2,TEX_SIZE].forEach(v=>{x.beginPath();x.moveTo(v,0);x.lineTo(v,TEX_SIZE);x.stroke();x.beginPath();x.moveTo(0,v);x.lineTo(TEX_SIZE,v);x.stroke()});
  x.globalAlpha=1;
  for(let i=0;i<30;i++){
    const yy=(i*23+seed*17)%TEX_SIZE;
    x.strokeStyle=i%5===0?vein:'rgba(255,255,255,.085)';x.globalAlpha=i%5===0?.18:1;
    x.lineWidth=i%6===0?2:1;x.beginPath();
    for(let px=0;px<=TEX_SIZE;px+=10){
      const py=yy+Math.sin(px*.021+i*1.73+seed)*5+Math.sin(px*.008+i)*3;
      if(px===0)x.moveTo(px,py);else x.lineTo(px,py);
    }x.stroke();x.globalAlpha=1;
  }
  for(let i=0;i<260;i++){
    const px=hash2(i,seed,11)*TEX_SIZE,py=hash2(i,seed,17)*TEX_SIZE;
    x.fillStyle=i%3===0?'rgba(255,255,255,.055)':'rgba(73,62,51,.050)';
    x.fillRect(px,py,1.4,1.4);
  }
  return canvasTexture(c,{repeat:[1.7,4.8],srgb:true});
}
function floorMaterial(base,vein,joint,seed,roughness,bump=.018){
  const color=makeStoneTexture(base,vein,joint,seed);
  const repeat=[1.7,4.8],raw=makeSurfaceCanvases('travertine',{seed,base});
  const roughnessMap=canvasTexture(raw.rough,{repeat});
  const bumpMap=canvasTexture(raw.height,{repeat});
  const normalMap=normalTextureFromHeight(raw.height,repeat,1.55);
  return new THREE.MeshStandardMaterial({
    map:color,roughnessMap,bumpMap,...(normalMap?{normalMap}:{}),
    color:0xffffff,roughness,metalness:.008,bumpScale:lowPower?0:bump,
    normalScale:new THREE.Vector2(.52,.52)
  });
}
const FLOOR={
  hall:floorMaterial('#d8cbb8','#b8a88f','#9a876f',3,.60,.020),
  promenade:floorMaterial('#eee4d5','#cabba5','#a78c6c',7,.50,.017),
  side:floorMaterial('#c9bca9','#aa9a84','#8f7d69',11,.68,.023),
  exterior:floorMaterial('#dfd2bf','#b8a58d','#8d7c68',15,.73,.026),
  life:floorMaterial('#b9aa94','#8d7962','#705e4c',19,.49,.020),
  upper:floorMaterial('#e4d9c8','#bbaa94','#8f7b64',23,.58,.018)
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
function makeNpc(parent,{role='visitor',label='Guest',quest=null,functionLabel=null,x=0,y=0,z=0,scale=1,route=[],speed=.65,phase=0,outfit='sage'}={}){
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
  const head=mesh(g,new THREE.SphereGeometry(.184,18,14),skin,0,1.88,0,{cast});head.scale.set(.92,1.05,.94);
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

  // V5.0.1 NPC grounding: body and label move together; contact shadow stays on the floor.
  const bodyRoot=new THREE.Group();bodyRoot.name='KOMO_NPC_BODY_GROUNDING_V501';
  [...g.children].forEach(child=>bodyRoot.add(child));g.add(bodyRoot);

  // label + contact shadow
  const tag=npcNameTag(label,functionLabel||(role==='staff'?'KŌMØ STAFF':role==='coach'?'COACH':'GUEST'));bodyRoot.add(tag);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.34,20),new THREE.MeshBasicMaterial({color:0x27352d,transparent:true,opacity:.11,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;g.add(shadow);

  const points=route.length?route.map(p=>new THREE.Vector3(p[0],p[1]??y,p[2])):[new THREE.Vector3(x,y,z)];
  const seg=[],cum=[0];let total=0;
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],d=a.distanceTo(b);seg.push(d);total+=d;cum.push(total)}
  g.userData.npc={role,label,quest,functionLabel,bodyRoot,hips,torso,head,leftLeg,rightLeg,leftKnee,rightKnee,leftArm,rightArm,leftElbow,rightElbow,tag,shadow,points,seg,cum,total,speed,phase,baseY:y,lastFarUpdate:0};
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
  const npcSurface=visualSurfaceOffsetAt(npc.position);
  // NPC shoe sole was authored around Y=.17, so only compensate finishes above that level.
  const npcLift=Math.max(0,npcSurface-.169);
  d.bodyRoot.position.y+=(npcLift-d.bodyRoot.position.y)*(1-Math.exp(-14*stepDt));
  d.shadow.position.y=npcSurface+.004;
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
  const g=new THREE.Group();g.name='KOMO_PLAYER_AVATAR_V42_REALISM';g.userData.dynamic=true;scene.add(g);

  const skin=new THREE.MeshStandardMaterial({color:0xc99673,roughness:.68,metalness:0});
  const skinWarm=new THREE.MeshStandardMaterial({color:0xb87958,roughness:.74,metalness:0});
  const cloth=new THREE.MeshStandardMaterial({color:0x24483a,roughness:.48,metalness:.018});
  const clothDark=new THREE.MeshStandardMaterial({color:0x19372d,roughness:.56,metalness:.025});
  const clothSoft=new THREE.MeshStandardMaterial({color:0x385c4b,roughness:.62,metalness:.01});
  const trouser=new THREE.MeshStandardMaterial({color:0x303733,roughness:.68,metalness:.012});
  const shoe=new THREE.MeshStandardMaterial({color:0x202421,roughness:.42,metalness:.035});
  const sole=new THREE.MeshStandardMaterial({color:0xd7d2c9,roughness:.72,metalness:.006});
  const hair=new THREE.MeshStandardMaterial({color:0x2a2420,roughness:.80,metalness:0});
  const bronze=new THREE.MeshStandardMaterial({color:0xb18a58,roughness:.28,metalness:.44});
  const eyeMat=new THREE.MeshStandardMaterial({color:0x26221f,roughness:.68});
  const cast=!lowPower;
  const capsule=(r,len,mat,parent,y=0,segments=lowPower?8:14)=>{
    const m=mesh(parent,new THREE.CapsuleGeometry(r,len,lowPower?4:7,segments),mat,0,y,0,{cast});return m;
  };

  // Adult proportions: longer lower body, smaller head, cleaner stance.
  const hipsGroup=new THREE.Group();hipsGroup.position.y=1.04;g.add(hipsGroup);
  const hips=mesh(hipsGroup,new THREE.SphereGeometry(.225,lowPower?12:20,lowPower?8:14),trouser,0,0,0,{cast});
  hips.scale.set(1.14,.68,.82);

  const leftLeg=new THREE.Group(),rightLeg=new THREE.Group();
  leftLeg.position.set(-.14,1.07,0);rightLeg.position.set(.14,1.07,0);g.add(leftLeg,rightLeg);
  const leftKnee=new THREE.Group(),rightKnee=new THREE.Group();
  leftKnee.position.y=-.54;rightKnee.position.y=-.54;leftLeg.add(leftKnee);rightLeg.add(rightKnee);

  const leftThigh=capsule(.073,.37,trouser,leftLeg,-.285);
  const rightThigh=capsule(.073,.37,trouser,rightLeg,-.285);
  leftThigh.scale.set(1.05,1,.94);rightThigh.scale.copy(leftThigh.scale);
  const leftShin=capsule(.056,.35,trouser,leftKnee,-.275);
  const rightShin=capsule(.056,.35,trouser,rightKnee,-.275);
  leftShin.scale.set(.98,1,.92);rightShin.scale.copy(leftShin.scale);

  const makeShoe=(parent)=>{
    const group=new THREE.Group();group.position.set(0,-.49,.086);parent.add(group);
    const upper=mesh(group,new THREE.CapsuleGeometry(.078,.20,lowPower?4:6,lowPower?8:14),shoe,0,.008,.03,{cast});
    upper.rotation.x=Math.PI/2;upper.scale.set(.96,.86,1.08);
    const toe=mesh(group,new THREE.SphereGeometry(.092,lowPower?10:16,lowPower?7:10),shoe,0,-.008,.126,{cast});
    toe.scale.set(.96,.58,1.12);
    const outsole=mesh(group,new THREE.BoxGeometry(.155,.03,.33),sole,0,-.062,.05,{cast:false});
    const heel=mesh(group,new THREE.BoxGeometry(.142,.042,.115),sole,0,-.052,-.072,{cast:false});
    return group;
  };
  const leftShoe=makeShoe(leftKnee),rightShoe=makeShoe(rightKnee);

  // Tailored KŌMØ jacket: elongated torso with real shoulder structure.
  const torsoGroup=new THREE.Group();torsoGroup.position.y=1.57;g.add(torsoGroup);
  const torso=mesh(torsoGroup,new THREE.CapsuleGeometry(.214,.45,lowPower?5:8,lowPower?10:18),cloth,0,-.015,0,{cast});
  torso.scale.set(1.08,1,.79);
  const chest=mesh(torsoGroup,new THREE.SphereGeometry(.292,lowPower?12:20,lowPower?8:14),cloth,0,.17,0,{cast});
  chest.scale.set(1.28,.50,.72);
  const waist=mesh(torsoGroup,new THREE.SphereGeometry(.215,lowPower?10:16,lowPower?7:10),clothDark,0,-.34,0,{cast});
  waist.scale.set(1.04,.25,.74);

  // Shoulder caps soften the transition to arms and create an adult silhouette.
  const shoulderGeo=new THREE.SphereGeometry(.074,lowPower?10:16,lowPower?7:10);
  const shoulderL=mesh(torsoGroup,shoulderGeo,cloth,-.248,.162,0,{cast});
  const shoulderR=mesh(torsoGroup,shoulderGeo,cloth,.248,.162,0,{cast});
  shoulderL.scale.set(.78,.46,.64);shoulderR.scale.copy(shoulderL.scale);

  // Jacket lapels, zipper, waistband and small KŌMØ hardware.
  const collarL=mesh(torsoGroup,new THREE.BoxGeometry(.175,.155,.022),clothDark,-.086,.295,.178,{cast:false});
  collarL.rotation.z=-.34;
  const collarR=mesh(torsoGroup,new THREE.BoxGeometry(.175,.155,.022),clothDark,.086,.295,.178,{cast:false});
  collarR.rotation.z=.34;
  box(torsoGroup,.010,.50,.014,bronze,0,-.015,.188,{cast:false});
  box(torsoGroup,.37,.025,.018,clothSoft,0,-.355,.160,{cast:false});
  const chestPin=mesh(torsoGroup,new THREE.CylinderGeometry(.018,.018,.010,12),bronze,.122,.145,.193,{cast:false});
  chestPin.rotation.x=Math.PI/2;

  // Neck and smaller adult head.
  cyl(g,.064,.070,.125,skin,0,2.00,0,lowPower?8:12,{cast});
  const headGroup=new THREE.Group();headGroup.position.y=2.14;g.add(headGroup);
  const head=mesh(headGroup,new THREE.SphereGeometry(.153,lowPower?14:24,lowPower?10:18),skin,0,0,0,{cast});
  head.scale.set(.90,1.05,.94);
  const jaw=mesh(headGroup,new THREE.SphereGeometry(.106,lowPower?10:16,lowPower?7:12),skin,0,-.093,.014,{cast});
  jaw.scale.set(.89,.59,.86);
  const earGeo=new THREE.SphereGeometry(.027,lowPower?7:10,lowPower?5:8);
  [-.149,.149].forEach(x=>{const e=mesh(headGroup,earGeo,skin,x,-.004,0,{cast:false});e.scale.set(.52,1.0,.56)});
  const hairCap=mesh(headGroup,new THREE.SphereGeometry(.166,lowPower?14:22,lowPower?8:14,0,Math.PI*2,0,Math.PI*.55),hair,0,.062,-.008,{cast});
  hairCap.scale.set(.93,.84,.97);
  const fringe=mesh(headGroup,new THREE.SphereGeometry(.078,lowPower?8:14,lowPower?6:10),hair,-.042,.111,.103,{cast:false});
  fringe.scale.set(1.08,.38,.46);fringe.rotation.z=-.14;
  const nose=mesh(headGroup,new THREE.SphereGeometry(.022,lowPower?6:10,lowPower?5:8),skinWarm,0,-.004,.160,{cast:false});
  nose.scale.set(.58,.72,1.06);
  [-.050,.050].forEach(x=>{
    const eye=mesh(headGroup,new THREE.SphereGeometry(.0085,7,5),eyeMat,x,.027,.154,{cast:false,receive:false});eye.scale.set(1,.70,.45);
    const brow=mesh(headGroup,new THREE.BoxGeometry(.043,.006,.007),hair,x,.055,.155,{cast:false});brow.rotation.z=x<0?.08:-.08;
  });
  const mouth=mesh(headGroup,new THREE.BoxGeometry(.052,.0055,.006),skinWarm,0,-.067,.157,{cast:false});

  // Slimmer arms and hands.
  const leftArm=new THREE.Group(),rightArm=new THREE.Group();
  leftArm.position.set(-.305,1.73,0);rightArm.position.set(.305,1.73,0);g.add(leftArm,rightArm);
  leftArm.rotation.z=-.042;rightArm.rotation.z=.042;
  const leftElbow=new THREE.Group(),rightElbow=new THREE.Group();
  leftElbow.position.y=-.355;rightElbow.position.y=-.355;leftArm.add(leftElbow);rightArm.add(rightElbow);
  capsule(.054,.255,cloth,leftArm,-.195);capsule(.054,.255,cloth,rightArm,-.195);
  const cuffL=mesh(leftArm,new THREE.CylinderGeometry(.051,.048,.040,10),clothSoft,0,-.337,0,{cast});
  const cuffR=mesh(rightArm,new THREE.CylinderGeometry(.051,.048,.040,10),clothSoft,0,-.337,0,{cast});
  capsule(.043,.225,skin,leftElbow,-.175);capsule(.043,.225,skin,rightElbow,-.175);

  const makeHand=(parent)=>{
    const hand=mesh(parent,new THREE.CapsuleGeometry(.038,.078,5,10),skin,0,-.39,.008,{cast});
    hand.scale.set(.96,1.08,.72);
    return hand;
  };
  const leftHand=makeHand(leftElbow),rightHand=makeHand(rightElbow);

  // V5.0.1 grounding: body is lifted independently from the logical player root.
  // This keeps shoes on the visible architectural floor while shadows remain on the floor plane.
  const bodyRoot=new THREE.Group();bodyRoot.name='KOMO_PLAYER_BODY_GROUNDING_V501';
  [...g.children].forEach(child=>bodyRoot.add(child));g.add(bodyRoot);

  // Ground contact stays subtle; self tag remains hidden.
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.31,lowPower?18:30),new THREE.MeshBasicMaterial({color:0x17251e,transparent:true,opacity:.105,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.011;shadow.scale.set(1,.52,1);g.add(shadow);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.34,.365,lowPower?24:38),new THREE.MeshBasicMaterial({color:0xc49a62,transparent:true,opacity:.060,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.015;g.add(ring);

  const tag=npcNameTag('YOU','KŌMØ WORLD');tag.position.y=2.43;tag.scale.set(1.0,.28,1);tag.visible=false;bodyRoot.add(tag);
  g.userData.avatar={
    bodyRoot,hipsGroup,torsoGroup,headGroup,leftLeg,rightLeg,leftKnee,rightKnee,leftArm,rightArm,leftElbow,rightElbow,
    leftShoe,rightShoe,leftHand,rightHand,tag,shadow,ring,phase:0,facing:0,
    materials:{skin,skinWarm,cloth,clothDark,clothSoft,trouser,shoe,sole,hair,bronze},
    garments:{torso,chest,waist,shoulderL,shoulderR,collarL,collarR,cuffL,cuffR,chestPin}
  };
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
  const g=new THREE.Group();g.position.set(x,0,z);g.name='KOMO_RECESSED_BAY_V45_'+label.replace(/\s+/g,'_');parent.add(g);
  // Recessed mineral bay: a back wall, one return, a thin canopy and a shadow reveal.
  box(g,3.20,.10,5.10,FLOOR.side,0,.34,0,{cast:false,receive:true});
  box(g,.18,5.35,4.75,MAT.limestone,side*1.52,2.95,0,{cast:true});
  box(g,.075,4.82,4.35,MAT.smokedGlass,-side*1.47,2.82,0,{cast:false,receive:true});
  box(g,3.05,.18,4.75,MAT.travertine,0,5.62,0,{cast:true});
  // Deep black reveal gives the bay a built-in appearance.
  box(g,.040,4.70,.040,MAT.blackened,-side*1.39,2.82,-2.08,{cast:false,receive:false});
  box(g,.040,4.70,.040,MAT.blackened,-side*1.39,2.82,2.08,{cast:false,receive:false});
  box(g,2.70,.032,.080,MAT.brass,0,5.37,-2.08,{cast:false,receive:false});
  if(label)plaque(g,label,sub,2.55,.54,-side*1.405,4.22,0,{rotY:side>0?-Math.PI/2:Math.PI/2,dark:true,titleSize:40});
  return g;
}
function ceilingRaft(parent,x,z,w=5.2,d=5.8){
  const g=new THREE.Group();g.position.set(x,0,z);g.name='KOMO_CEILING_RAFT_V45';parent.add(g);
  // Thin perimeter tray rather than a solid suspended slab.
  box(g,w,.10,d,MAT.travertine,0,7.66,0,{cast:true});
  box(g,w-.34,.055,d-.34,MAT.walnut,0,7.58,0,{cast:false,receive:true});
  box(g,w-.72,.020,d-.66,MAT.blackened,0,7.545,0,{cast:false,receive:false});
  [-1,1].forEach(side=>box(g,w-.72,.025,.052,M.warm,0,7.515,side*(d/2-.42),{cast:false,receive:false}));
  return g;
}
function caseObject(parent,x,y,z,scale=1,open=false){
  const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
  const shell=MAT.leatherDark;
  const leather=MAT.leather;
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
const twinRoom=new THREE.Group();twinRoom.name='KOMO_TWIN_V1';twinRoom.visible=true;scene.add(twinRoom);
const rehabRoom=new THREE.Group();rehabRoom.name='KOMO_FITNESS_CLUB_V29';rehabRoom.visible=true;scene.add(rehabRoom);
const arenaRoom=new THREE.Group();arenaRoom.name='KOMO_ARENA_V1';arenaRoom.visible=true;scene.add(arenaRoom);

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

// V6.3.2 visible arrival upgrade — strong architecture in the first camera view.
// This is deliberately geometry-light: one canopy, instanced colonnade/barriers and emissive strips.
const arrivalHeroV632=new THREE.Group();arrivalHeroV632.name='KOMO_ARRIVAL_HERO_V632';exterior.add(arrivalHeroV632);
arrivalHeroV632.userData.environmentDetail=true;

const arrivalRoofMatV632=lowPower?MAT.smokedGlass:new THREE.MeshPhysicalMaterial({
  color:0xd7ddd6,roughness:.18,metalness:.03,transparent:true,opacity:.66,
  transmission:0,depthWrite:false,side:THREE.DoubleSide
});
const arrivalWarmStripV632=new THREE.MeshBasicMaterial({color:0xe7c88f,transparent:true,opacity:lowPower?.28:.46,depthWrite:false});
const arrivalDarkStripV632=new THREE.MeshBasicMaterial({color:0x1a241e,transparent:true,opacity:.84,depthWrite:true});

// Monumental covered threshold seen immediately from spawn.
box(arrivalHeroV632,19.6,.22,7.4,MAT.blackened,0,6.16,24.8,{cast:true});
box(arrivalHeroV632,18.9,.085,6.85,arrivalRoofMatV632,0,6.02,24.8,{cast:false,receive:false});
box(arrivalHeroV632,17.8,.028,5.95,arrivalWarmStripV632,0,5.91,24.8,{cast:false,receive:false});
[-8.9,8.9].forEach(x=>{
  box(arrivalHeroV632,.34,5.95,.72,MAT.travertine,x,3.06,24.8,{cast:true});
  box(arrivalHeroV632,.055,5.15,.10,MAT.brass,x-Math.sign(x)*.22,3.18,25.19,{cast:false,receive:false});
});
plaque(arrivalHeroV632,'KŌMØ WORLD','LONGEVITY IN MOTION',6.6,.86,0,4.98,28.28,{dark:true,titleSize:64});

// Side colonnades and real campus edges remove the floating-platform feel.
const arrivalUnitV632=new THREE.BoxGeometry(1,1,1);
const arrivalPiersV632=[],arrivalWallV632=[],arrivalBrassV632=[];
[-1,1].forEach(side=>{
  [29,35,41,47,53].forEach((z,i)=>{
    arrivalPiersV632.push({x:side*23.25,y:2.05,z,sx:.34,sy:4.1,sz:.60});
    arrivalBrassV632.push({x:side*23.03,y:2.12,z:z+.34,sx:.045,sy:3.35,sz:.045});
  });
  arrivalWallV632.push({x:side*23.35,y:.58,z:41,sx:.62,sy:1.10,sz:33.5});
});
instancedStatic(arrivalHeroV632,arrivalUnitV632,MAT.limestone,arrivalPiersV632,'KOMO_ARRIVAL_PIERS_INST_V632');
instancedStatic(arrivalHeroV632,arrivalUnitV632,MAT.travertine,arrivalWallV632,'KOMO_ARRIVAL_BOUNDARY_INST_V632');
instancedStatic(arrivalHeroV632,arrivalUnitV632,MAT.brass,arrivalBrassV632,'KOMO_ARRIVAL_BRASS_INST_V632');

// Dark reveal under the boundary wall gives the landscape a real physical edge.
[-1,1].forEach(side=>box(arrivalHeroV632,.16,.18,33.2,arrivalDarkStripV632,side*23.64,.16,41,{cast:false,receive:false}));

// A brighter central reflection path pulls the eye from spawn toward the Hall.
const arrivalReflectionV632=makeLightingGradientV631('floor');
const arrivalReflectionMatV632=new THREE.MeshBasicMaterial({
  map:arrivalReflectionV632,color:0xf0d9b0,transparent:true,opacity:lowPower?.07:.13,
  blending:THREE.AdditiveBlending,depthWrite:false
});
const arrivalReflectionPlaneV632=mesh(arrivalHeroV632,new THREE.PlaneGeometry(8.2,28),arrivalReflectionMatV632,0,.166,40.5,{cast:false,receive:false});
arrivalReflectionPlaneV632.rotation.x=-Math.PI/2;arrivalReflectionPlaneV632.renderOrder=3;


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

// V3.3 District detail pass — more urban depth, seating and a stronger fountain.
const districtDetails=new THREE.Group();districtDetails.name='KOMO_DISTRICT_DETAILS_V33';worldDistrict.add(districtDetails);

// Secondary buildings make the district feel inhabited rather than like three isolated boxes.
districtPavilion(-18.2,77.0,6.0,5.6,'HEALTH PAVILION','CHECK · UNDERSTAND',true);
districtPavilion(18.2,77.0,6.0,5.6,'CLUB HOUSE','MEET · MOVE',false);

// Arc promenade around fountain.
for(let i=0;i<18;i++){
  const a=(i/18)*Math.PI*2,r=7.15;
  const tile=box(districtDetails,.85,.025,.24,i%2?MAT.brass:M.bronzeSoft,Math.cos(a)*r,.13,68.2+Math.sin(a)*r,{cast:false,receive:false});
  tile.rotation.y=-a;
}

// Street furniture and low-cost lantern markers (emissive-looking geometry, no PointLights).
const lanternMat=new THREE.MeshBasicMaterial({color:0xe2c18a,transparent:true,opacity:.55});
[-1,1].forEach(side=>{
  [59.0,64.0,72.4,77.0].forEach((z,idx)=>{
    const x=side*(idx%2?11.5:8.7);
    cyl(districtDetails,.055,.070,2.2,MAT.blackened,x,1.15,z,8,{cast:false});
    mesh(districtDetails,new THREE.SphereGeometry(.105,8,6),lanternMat,x,2.30,z,{cast:false,receive:false});
  });
  exteriorBench(districtDetails,side*11.2,72.2,side>0?-Math.PI/2:Math.PI/2,.78);
  exteriorBench(districtDetails,side*12.0,63.8,side>0?-Math.PI/2:Math.PI/2,.78);
});

// Tree avenue toward the Performance Pavilion.
[-1,1].forEach(side=>{
  [60.5,65.2,70.0,74.8].forEach((z,idx)=>tree(districtDetails,side*(12.4+idx*.85),z,.48+idx*.025));
});

// Fountain central plume + concentric ripples.
const centralJet=mesh(grandFountain,new THREE.CylinderGeometry(.055,.075,2.35,8),fountainWaterMat,0,3.58,0,{cast:false,receive:false});
centralJet.userData.phase=1.7;centralJet.userData.baseY=3.58;centralJet.userData.dynamic=true;living.fountainJets.push(centralJet);
[1.55,2.35,3.20].forEach((r,i)=>{
  const ripple=mesh(grandFountain,new THREE.RingGeometry(r,r+.045,48),new THREE.MeshBasicMaterial({color:0xd7e5de,transparent:true,opacity:.16-i*.025,depthWrite:false}),0,.495,0,{cast:false,receive:false});
  ripple.rotation.x=-Math.PI/2;ripple.userData.dynamic=true;ripple.userData.ripplePhase=i*.8;living.fountainJets.push(ripple);
});

// Distant skyline blocks add depth without expensive detail.
[
  [-22,82,7,8],[-12,84,5.5,6.5],[12,84,5.5,6.5],[22,82,7,8]
].forEach(([x,z,w,h],i)=>{
  box(districtDetails,w,h,3.6,i%2?MAT.limestone:M.sageDeep,x,h/2,z,{cast:false});
  box(districtDetails,w-.45,.035,3.15,M.warm,x,h-.28,z-.10,{cast:false,receive:false});
});
plaque(districtDetails,'KŌMØ DISTRICT','MOVE · CONNECT · LIVE',6.4,.86,0,4.15,80.0,{dark:true,titleSize:60});

// V6.4 Living Campus — landscape, architecture, water and ambient life around the playable core.
const livingCampusV64=new THREE.Group();livingCampusV64.name='KOMO_LIVING_CAMPUS_V64';world.add(livingCampusV64);living.livingCampusV64=livingCampusV64;
livingCampusV64.userData.environmentDetail=true;

const campusUnitV64=new THREE.BoxGeometry(1,1,1);
const campusCrownGeoV64=new THREE.IcosahedronGeometry(1,1);
const campusCypressGeoV64=new THREE.ConeGeometry(1,2,8);
const campusPineGeoV64=new THREE.IcosahedronGeometry(1,1);
const campusGreenDeepV64=new THREE.MeshStandardMaterial({color:0x314839,roughness:.90,metalness:0,fog:true});
const campusGreenMidV64=new THREE.MeshStandardMaterial({color:0x516653,roughness:.92,metalness:0,fog:true});
const campusGreenSoftV64=new THREE.MeshStandardMaterial({color:0x71806c,roughness:.94,metalness:0,fog:true});
const campusTrunkV64=new THREE.MeshStandardMaterial({color:0x624b38,roughness:.96,metalness:0,fog:true});
const campusInteriorGlowV64=new THREE.MeshBasicMaterial({color:0xe8c992,transparent:true,opacity:lowPower?.22:.38,depthWrite:false});
const campusGlassV64=lowPower?MAT.smokedGlass:new THREE.MeshPhysicalMaterial({color:0x9eb4aa,roughness:.16,metalness:.03,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide});

// A few hero trees use real branching; secondary vegetation is fully instanced.
function heroTreeV64(x,z,scale=1,spread=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);g.name='KOMO_HERO_TREE_V64';livingCampusV64.add(g);
  cyl(g,.24,.38,4.3,campusTrunkV64,0,2.15,0,lowPower?7:10,{cast:true});
  const branches=[
    [[0,3.4,0],[1.55,5.05,.25],.17],[[0,3.5,0],[-1.35,4.85,-.20],.16],
    [[.05,3.8,0],[.65,5.50,-1.15],.14],[[-.05,3.75,0],[-.75,5.35,1.05],.14]
  ];
  branches.forEach(([a,b,r])=>bodySegment(g,a,b,r,campusTrunkV64));
  const crowns=lowPower?[
    [0,5.75,0,1.85],[1.55,5.55,.15,1.35],[-1.45,5.45,-.10,1.30]
  ]:[
    [0,5.85,0,1.80],[1.55,5.55,.15,1.35],[-1.45,5.45,-.10,1.30],
    [.65,5.90,-1.15,1.15],[-.70,5.80,1.00,1.10],[.10,6.50,.15,1.00]
  ];
  crowns.forEach(([cx,cy,cz,r],i)=>{
    const m=mesh(g,campusCrownGeoV64,i%3===0?campusGreenMidV64:campusGreenDeepV64,cx*spread,cy,cz*spread,{cast:!lowPower});
    m.scale.set(r*1.38,r*.82,r*1.16);
  });
  g.userData.swayPhase=(x*.73+z*.41);living.trees.push(g);return g;
}
const heroTreeSpecsV64=lowPower?[
  [-25.6,32.5,1.18,1.05],[25.4,34.0,1.14,1.05],[-26.5,67.5,1.08,1.0],[26.8,69.0,1.12,1.02]
]:[
  [-25.6,32.5,1.30,1.10],[25.4,34.0,1.24,1.08],[-28.2,52.0,1.16,1.06],[28.0,53.5,1.18,1.05],
  [-26.5,67.5,1.18,1.05],[26.8,69.0,1.22,1.08],[-19.5,87.5,1.04,1.0],[19.5,87.5,1.04,1.0]
];
heroTreeSpecsV64.forEach(v=>heroTreeV64(...v));

// Cypress rhythm + umbrella pines + low planting beds.
const cypressTrunksV64=[],cypressCrownsV64=[],pineTrunksV64=[],pineCrownsV64=[],shrubItemsV64=[];
[-1,1].forEach(side=>{
  const zs=[25,33,41,49,57,65,73,81,89];
  zs.slice(0,lowPower?6:zs.length).forEach((z,i)=>{
    const x=side*(20.5+(i%2)*1.8);
    cypressTrunksV64.push({x,y:1.6,z,sx:.16,sy:3.2,sz:.16});
    cypressCrownsV64.push({x,y:4.2,z,sx:.72+(i%3)*.08,sy:3.35+(i%2)*.35,sz:.72+(i%3)*.08});
  });
});
const pineSpecsV64=lowPower?[
  [-29,42,1.0], [29,44,1.0],[-28,76,.92],[28,77,.92]
]:[
  [-30,40,1.08],[30,42,1.06],[-31,58,1.00],[31,59,1.02],[-29,76,.98],[29,77,.98],[-11,91,.90],[11,91,.90]
];
pineSpecsV64.forEach(([x,z,sc],i)=>{
  pineTrunksV64.push({x,y:1.55,z,sx:.20*sc,sy:3.1*sc,sz:.20*sc});
  pineCrownsV64.push({x,y:4.30*sc,z,sx:2.05*sc,sy:.76*sc,sz:1.85*sc,ry:i*.67});
});
const shrubCountV64=lowPower?18:44;
for(let i=0;i<shrubCountV64;i++){
  const side=i%2?-1:1,band=Math.floor(i/2)%4;
  const z=26+(i%11)*5.8;
  const x=side*(17.2+band*2.25);
  shrubItemsV64.push({x,y:.32,z,sx:.72+(i%3)*.12,sy:.38+(i%2)*.06,sz:.62+(i%4)*.08,ry:i*.71});
}
instancedStatic(livingCampusV64,campusUnitV64,campusTrunkV64,cypressTrunksV64,'KOMO_CYPRESS_TRUNKS_INST_V64');
instancedStatic(livingCampusV64,campusCypressGeoV64,campusGreenDeepV64,cypressCrownsV64,'KOMO_CYPRESS_CROWNS_INST_V64');
instancedStatic(livingCampusV64,campusUnitV64,campusTrunkV64,pineTrunksV64,'KOMO_PINE_TRUNKS_INST_V64');
instancedStatic(livingCampusV64,campusPineGeoV64,campusGreenMidV64,pineCrownsV64,'KOMO_PINE_CROWNS_INST_V64');
instancedStatic(livingCampusV64,campusCrownGeoV64,campusGreenSoftV64,shrubItemsV64,'KOMO_LANDSCAPE_SHRUBS_INST_V64');

// Premium side pavilions close the visual field around Arrival and District.
function campusPavilionV64(x,z,w,d,title,sub,side=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=side<0?Math.PI:0;g.name='KOMO_CAMPUS_PAVILION_V64_'+title.replace(/\s+/g,'_');livingCampusV64.add(g);
  box(g,w,.34,d,MAT.travertine,0,.17,0,{cast:true});
  box(g,w,5.9,.30,MAT.limestone,0,3.12,d/2-.15,{cast:true});
  box(g,.28,5.9,d,MAT.limestone,-w/2+.14,3.12,0,{cast:true});
  box(g,.28,5.9,d,MAT.limestone,w/2-.14,3.12,0,{cast:true});
  box(g,w,.24,d,MAT.blackened,0,6.0,0,{cast:true});
  box(g,w-.65,.055,d-.55,campusInteriorGlowV64,0,5.83,0,{cast:false,receive:false});
  box(g,w-.55,4.75,.045,campusGlassV64,0,3.05,-d/2+.20,{cast:false,receive:false});
  box(g,w-.85,.025,.07,MAT.brass,0,5.45,-d/2+.16,{cast:false,receive:false});
  plaque(g,title,sub,Math.min(w-1,6.8),.82,0,4.72,-d/2-.08,{dark:true,titleSize:title.length>14?43:53});
  // warm interior shelf visible through the glazing
  box(g,w-.9,.06,1.2,MAT.walnut,0,.68,-d/2+1.35,{cast:true});
  return g;
}
const pavilionMovementV64=campusPavilionV64(-30.5,43.0,11.8,18.0,'MOVEMENT','MEASURE · TRAIN · MOVE',1);
const pavilionLongevityV64=campusPavilionV64(30.5,43.0,11.8,18.0,'LONGEVITY','SCIENCE · TRAJECTORY',1);
const pavilionCommunityV64=campusPavilionV64(-30.0,69.5,10.8,14.5,'COMMUNITY LOUNGE','MEET · CONNECT · RECOVER',1);
const pavilionRecoveryV64=campusPavilionV64(30.0,69.5,10.8,14.5,'RECOVERY HOUSE','REST · RESET · RESTORE',1);

// Side water mirrors and rear reflecting court anchor architecture in the landscape.
function waterMirrorV64(x,z,w,d){
  const g=new THREE.Group();g.position.set(x,0,z);livingCampusV64.add(g);
  box(g,w+.55,.18,d+.55,MAT.travertine,0,.09,0,{cast:false});
  const pool=box(g,w,.075,d,M.water,0,.205,0,{cast:false,receive:false});living.water.push(pool);
  const count=lowPower?1:3;
  for(let i=0;i<count;i++){
    const q=box(g,w*.72,.010,.050,shimmerMat,0,.255,-d*.32+i*(d*.64/Math.max(1,count-1)),{cast:false,receive:false});
    q.userData.phase=.11+i*.29+(x>0?.37:.08);q.userData.v64Local=true;living.shimmers.push(q);
  }
  return g;
}
waterMirrorV64(-24.6,45.0,5.4,24.0);waterMirrorV64(24.6,45.0,5.4,24.0);
waterMirrorV64(0,89.2,18.0,7.2);

// Rear longevity terrace and stylised waterfall create a destination-scale backdrop.
const rearTerraceV64=new THREE.Group();rearTerraceV64.name='KOMO_REAR_TERRACE_V64';rearTerraceV64.position.set(0,0,94);livingCampusV64.add(rearTerraceV64);
box(rearTerraceV64,31,2.6,8.5,MAT.limestone,0,1.30,0,{cast:true});
box(rearTerraceV64,26.5,.20,6.8,MAT.travertine,0,2.68,-.4,{cast:true});
[-1,1].forEach(side=>box(rearTerraceV64,7.4,.12,1.2,MAT.brass,side*8.2,2.82,-3.1,{cast:false,receive:false}));
plaque(rearTerraceV64,'KŌMØ TERRACE','LONGEVITY · COMMUNITY · CULTURE',7.3,.94,0,6.30,-4.29,{dark:true,titleSize:58});
for(let i=0;i<5;i++)box(rearTerraceV64,17.0,.32,1.15,MAT.travertine,0,.16+i*.29,-6.0+i*.58,{cast:true});

// Lightweight animated waterfall texture.
function waterfallTextureV64(){
  const c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d');
  const gr=x.createLinearGradient(0,0,256,0);gr.addColorStop(0,'rgba(205,225,217,.10)');gr.addColorStop(.2,'rgba(244,250,247,.72)');gr.addColorStop(.52,'rgba(195,221,211,.42)');gr.addColorStop(.82,'rgba(247,251,249,.74)');gr.addColorStop(1,'rgba(205,225,217,.10)');
  x.fillStyle=gr;x.fillRect(0,0,256,512);
  for(let i=0;i<22;i++){x.fillStyle='rgba(255,255,255,'+(0.03+(i%4)*.012)+')';x.fillRect((i*47)%256,0,2+(i%3),512)}
  const tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(1,1.35);return tx;
}
const waterfallTxV64=waterfallTextureV64();
const waterfallMatV64=new THREE.MeshBasicMaterial({map:waterfallTxV64,color:0xdcebe5,transparent:true,opacity:lowPower?.30:.48,depthWrite:false,side:THREE.DoubleSide});
const waterfallV64=mesh(rearTerraceV64,new THREE.PlaneGeometry(18.5,4.6),waterfallMatV64,0,5.0,4.28,{cast:false,receive:false});
living.waterfallsV64.push({mesh:waterfallV64,texture:waterfallTxV64,baseOpacity:waterfallMatV64.opacity});

// Static ambient crowd: two draw calls, visible life without AI cost.
const campusCrowdV64=new THREE.Group();campusCrowdV64.name='KOMO_AMBIENT_CROWD_INST_V64';livingCampusV64.add(campusCrowdV64);
const crowdBodyMatV64=new THREE.MeshStandardMaterial({color:0x26372f,roughness:.82,metalness:0});
const crowdHeadMatV64=new THREE.MeshStandardMaterial({color:0xa9795e,roughness:.86,metalness:0});
const crowdBodyItemsV64=[],crowdHeadItemsV64=[];
const crowdSpotsV64=lowPower?[
  [-20,30], [20,31],[-15,66],[15,66],[-8,82],[8,82]
]:[
  [-20,29],[-17,34],[-21,47],[20,30],[17,35],[21,48],
  [-13,61],[-16,68],[-11,73],[13,61],[16,68],[11,73],
  [-8,82],[-4,84],[4,84],[8,82],[-23,76],[23,76],
  [-31,39],[-30,48],[31,39],[30,48],[-29,66],[29,66]
];
crowdSpotsV64.forEach(([x,z],i)=>{
  const h=.92+(i%4)*.04,ry=(i*.83)%6.28;
  crowdBodyItemsV64.push({x,y:1.02,z,ry,sx:.24+(i%3)*.02,sy:h,sz:.22});
  crowdHeadItemsV64.push({x,y:1.93+(i%4)*.03,z,ry,sx:.18,sy:.19,sz:.18});
});
instancedStatic(campusCrowdV64,new THREE.CylinderGeometry(1,1,1,8),crowdBodyMatV64,crowdBodyItemsV64,'KOMO_CAMPUS_PEOPLE_BODY_INST_V64');
instancedStatic(campusCrowdV64,new THREE.SphereGeometry(1,8,6),crowdHeadMatV64,crowdHeadItemsV64,'KOMO_CAMPUS_PEOPLE_HEAD_INST_V64');

// A small number of true walking NPCs adds motion close to the player.
if(!lowPower){
  makeNpc(npcRoot,{role:'visitor',label:'Iris',functionLabel:'MOVEMENT GUEST',x:-10.8,y:0,z:56.0,outfit:'cream',speed:.32,phase:.18,route:[
    [-10.8,0,56.0],[-6.5,0,61.5],[-3.2,0,67.0],[-7.0,0,72.5],[-11.5,0,68.0]
  ]});
  makeNpc(npcRoot,{role:'visitor',label:'Louis',functionLabel:'COMMUNITY',x:9.8,y:0,z:60.5,outfit:'sand',speed:.29,phase:.52,route:[
    [9.8,0,60.5],[5.0,0,64.0],[2.8,0,70.0],[7.5,0,75.5],[12.0,0,69.0]
  ]});
  makeNpc(npcRoot,{role:'staff',label:'Eva',functionLabel:'CAMPUS HOST',x:-4.8,y:0,z:75.0,outfit:'sage',speed:.25,phase:.73,route:[
    [-4.8,0,75.0],[0,0,77.0],[4.8,0,75.0],[3.0,0,70.0],[-3.0,0,70.0]
  ]});
}

// Small furniture clusters turn empty edges into actual places.
[-1,1].forEach(side=>{
  exteriorBench(livingCampusV64,side*18.2,58.5,side>0?-Math.PI/2:Math.PI/2,.92);
  exteriorBench(livingCampusV64,side*20.0,78.5,side>0?-Math.PI/2:Math.PI/2,.86);
  sculptureGarden(livingCampusV64,side*14.0,84.5,.78);
  bannerTotem(livingCampusV64,side*22.0,85.0,side<0?'MOVEMENT':'LONGEVITY',side<0?'CAMPUS':'RIVIERA',side>0?-Math.PI/2:Math.PI/2);
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


// V3.3 Entry Guide — immediate orientation + movement health snapshot.
const entryGuide=new THREE.Group();entryGuide.name='KOMO_ENTRY_GUIDE_V33';building.add(entryGuide);

// Bronze arrival medallion directly under the spawn.
const entryMedallion=mesh(entryGuide,new THREE.RingGeometry(1.18,1.28,48),MAT.brass,0,.205,14.55,{cast:false,receive:false});
entryMedallion.rotation.x=-Math.PI/2;
const entryCore=mesh(entryGuide,new THREE.CircleGeometry(.82,40),new THREE.MeshBasicMaterial({color:0x314b3d,transparent:true,opacity:.12,depthWrite:false}),0,.208,14.55,{cast:false,receive:false});
entryCore.rotation.x=-Math.PI/2;
plaque(entryGuide,'YOUR WORLD','UNDERSTAND · TRAIN · ENGAGE',4.6,.72,0,3.35,12.75,{dark:true,titleSize:52});

// Three floor cues point immediately toward the core destinations.
[
  [-2.35,-24.8,0xb9cfbf],
  [0,-24.8,0xd7b777],
  [2.35,-24.8,0xb9935c]
].forEach(([x,z,color],i)=>{
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.28,depthWrite:false});
  box(entryGuide,.055,.012,34.0,mat,x,.205,-5.7,{cast:false,receive:false});
});

// Physical Health Station at the left side of arrival, outside central walk axis.
const healthStation=new THREE.Group();healthStation.name='KOMO_HEALTH_STATION_V33';healthStation.position.set(-5.25,0,10.55);building.add(healthStation);
box(healthStation,3.75,.18,1.45,MAT.travertine,0,.10,0);
box(healthStation,3.15,2.45,.26,MAT.blackened,0,1.48,-.53,{cast:true});
plaque(healthStation,'YOUR HEALTH','MOVEMENT SNAPSHOT',2.85,.60,0,2.62,-.36,{dark:true,titleSize:44});
const healthStationBars={};
[
  ['muscle',-1.12,0xb9cfbf],
  ['mobility',-.56,0xb9cfbf],
  ['balance',0,0xd7b777],
  ['posture',.56,0xb9cfbf],
  ['endurance',1.12,0xd7b777]
].forEach(([id,x,color])=>{
  const track=box(healthStation,.30,1.38,.12,new THREE.MeshBasicMaterial({color:0x39473f,transparent:true,opacity:.72}),x,1.32,-.33,{cast:false,receive:false});
  const fillMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.74});
  const fill=box(healthStation,.20,.70,.14,fillMat,x,.98,-.24,{cast:false,receive:false});
  fill.userData.dynamic=true;healthStationBars[id]=fill;
});
plaque(healthStation,'OPEN','PRESS E · SEE DETAILS',2.55,.42,0,.56,.78,{dark:false,titleSize:34});

// Hall shell.
box(building,23.8,.28,46,M.stoneLight,0,.13,-7.0);
box(building,.42,8.2,46,M.wall,-11.7,4.1,-7.0,{cast:true});
box(building,.42,8.2,46,M.wall,11.7,4.1,-7.0,{cast:true});
box(building,6.7,.34,46,M.wall,-8.15,8.0,-7.0,{cast:true});
box(building,6.7,.34,46,M.wall,8.15,8.0,-7.0,{cast:true});
[-25,-17,-9,-1,7,13].forEach(z=>box(building,10.1,.09,.12,M.bronze,0,7.86,z));
[-10.9,10.9].forEach(x=>[-22,-12,-2,8].forEach(z=>box(building,.13,6.8,.18,M.bronze,x,4.1,z)));

// V4.4 material articulation — panel reveals and mineral skirting make the hall surfaces read as built finishes.
const hallMaterialFinish=new THREE.Group();hallMaterialFinish.name='KOMO_HALL_MATERIAL_FINISH_V44';building.add(hallMaterialFinish);
[-1,1].forEach(side=>{
  const x=side*11.475;
  [-21.0,-16.4,-11.8,-7.2,-2.6,2.0,6.6,11.2].forEach((z,i)=>{
    const mat=i%3===0?wallWarm:i%3===1?M.wall:wallShade;
    box(hallMaterialFinish,.024,4.90,4.28,mat,x,3.15,z,{cast:false,receive:true});
    // 10 mm shadow-reveal between panels.
    box(hallMaterialFinish,.030,4.98,.020,MAT.blackened,x-side*.006,3.15,z+2.16,{cast:false,receive:false});
  });
  // Limestone skirting and a floating bronze datum line.
  box(hallMaterialFinish,.045,.34,42.9,MAT.limestone,x-side*.012,.31,-6.4,{cast:false,receive:true});
  box(hallMaterialFinish,.035,.030,42.6,MAT.brass,x-side*.018,2.58,-6.4,{cast:false,receive:false});
});

// A few book-matched stone portals create visible variation in the material language.
[
  [-11.44,3.65,7.0],[11.44,3.65,2.8],[-11.44,3.65,-12.8],[11.44,3.65,-17.2]
].forEach(([x,y,z],i)=>{
  const side=x<0?-1:1;
  box(hallMaterialFinish,.032,3.70,2.55,i%2?stoneWarm:MAT.travertine,x-side*.014,y,z,{cast:false,receive:true});
  box(hallMaterialFinish,.038,3.78,.024,MAT.brass,x-side*.018,y,z-1.30,{cast:false,receive:false});
  box(hallMaterialFinish,.038,3.78,.024,MAT.brass,x-side*.018,y,z+1.30,{cast:false,receive:false});
});

// V5.9 Hall Walls — deeper panels, shadow gaps and gallery-like niches.
const hallWallsV59=new THREE.Group();hallWallsV59.name='KOMO_HALL_WALLS_V59';building.add(hallWallsV59);
const hallWallGlow=new THREE.MeshBasicMaterial({color:0xe9c98d,transparent:true,opacity:lowPower?.18:.30,depthWrite:false});
[-1,1].forEach(side=>{
  const x=side*11.30;
  // Strong lower plinth makes the walls feel built rather than paper-thin.
  box(hallWallsV59,.16,.46,43.4,WALL.travertine,x,.34,-6.4,{cast:false,receive:true});
  box(hallWallsV59,.08,.050,42.9,WALL.brass,x-side*.09,.59,-6.4,{cast:false,receive:false});
  // Repeated 2.55 m wall bays with a recessed central field.
  [-20.9,-15.7,-10.5,-5.3,-.1,5.1,10.3].forEach((z,i)=>{
    const face=i%3===1?WALL.ivory:i%3===2?WALL.mineral:wallWarm;
    box(hallWallsV59,.055,4.36,4.70,face,x-side*.085,3.24,z,{cast:false,receive:true});
    box(hallWallsV59,.075,4.48,.055,WALL.black,x-side*.118,3.24,z+2.39,{cast:false,receive:false});
    box(hallWallsV59,.075,.055,4.54,WALL.black,x-side*.118,5.47,z,{cast:false,receive:false});
    // Fine brass datum + warm wall wash line.
    box(hallWallsV59,.078,.026,4.18,WALL.brass,x-side*.126,2.50,z,{cast:false,receive:false});
    const wash=box(hallWallsV59,.082,.020,3.72,hallWallGlow,x-side*.132,5.18,z,{cast:false,receive:false});
    wash.userData.phase=i*.68+side;wash.userData.dynamic=true;
  });
  // Hero niches punctuate the long nave without closing circulation.
  const heroZ=side<0?[-8.0,7.4]:[-15.6,1.9];
  heroZ.forEach((z,i)=>{
    box(hallWallsV59,.12,3.35,2.42,WALL.black,x-side*.16,3.34,z,{cast:false,receive:false});
    box(hallWallsV59,.13,2.85,2.00,i%2?WALL.travertine:WALL.sage,x-side*.205,3.34,z,{cast:false,receive:true});
    box(hallWallsV59,.14,.038,1.72,WALL.brass,x-side*.278,4.66,z,{cast:false,receive:false});
  });
});


// V1.5 interior architecture: galleries, balcony datum and layered ceiling.
const hallArchitecture=new THREE.Group();hallArchitecture.name='KOMO_HALL_ARCHITECTURE_V15';building.add(hallArchitecture);

// V4.5 Architectural Polish — a clear spatial spine replaces the "decorated corridor" feeling.
const architecturalSpine=new THREE.Group();architecturalSpine.name='KOMO_ARCHITECTURAL_SPINE_V45';building.add(architecturalSpine);

// Five repeated portal frames establish scale, rhythm and a legible central nave.
[10.2,2.1,-6.0,-14.1,-22.2].forEach((z,i)=>{
  const mat=i===4?MAT.travertine:MAT.limestone;
  box(architecturalSpine,.26,6.55,.52,mat,-5.38,3.60,z,{cast:true});
  box(architecturalSpine,.26,6.55,.52,mat,5.38,3.60,z,{cast:true});
  box(architecturalSpine,11.02,.24,.52,mat,0,6.84,z,{cast:true});
  // Recessed bronze line, intentionally thin.
  box(architecturalSpine,10.46,.030,.055,MAT.brass,0,6.64,z+.275,{cast:false,receive:false});
});

// Continuous dark reveal around the central skylight makes the roof read as one architectural gesture.
box(architecturalSpine,.055,.060,40.6,MAT.blackened,-4.98,7.765,-6.7,{cast:false,receive:false});
box(architecturalSpine,.055,.060,40.6,MAT.blackened,4.98,7.765,-6.7,{cast:false,receive:false});

// Arrival threshold becomes a proper lobby frame instead of another floating sign.
box(architecturalSpine,.34,5.95,.78,MAT.travertine,-4.55,3.28,12.25,{cast:true});
box(architecturalSpine,.34,5.95,.78,MAT.travertine,4.55,3.28,12.25,{cast:true});
box(architecturalSpine,9.44,.30,.78,MAT.travertine,0,6.12,12.25,{cast:true});
box(architecturalSpine,8.70,.032,.070,MAT.brass,0,5.88,11.82,{cast:false,receive:false});

// V5.0 Desktop Visual Revolution — optical depth and cinematic focal hierarchy.
const desktopCinematic=new THREE.Group();desktopCinematic.name='KOMO_DESKTOP_CINEMATIC_V50';building.add(desktopCinematic);
desktopCinematic.visible=!lowPower;

if(!lowPower){
  // Polished central runway: thin physical overlay only on desktop.
  const runway=mesh(desktopCinematic,new THREE.PlaneGeometry(8.65,39.8),CINEMATIC.floor,0,.421,-6.7,{cast:false,receive:false});
  runway.rotation.x=-Math.PI/2;runway.renderOrder=3;

  // Luminous skylight membrane gives the nave a credible source of soft top light.
  const skylightMat=new THREE.MeshPhysicalMaterial({
    color:0xeaf0e9,roughness:.16,metalness:0,transparent:true,opacity:.28,
    transmission:.54,ior:1.42,thickness:.08,clearcoat:.24,clearcoatRoughness:.10,depthWrite:false
  });
  box(desktopCinematic,8.88,.026,39.4,skylightMat,0,7.72,-6.65,{cast:false,receive:false});

  // Long warm light reveals inside the skylight.
  [-3.85,3.85].forEach(x=>box(desktopCinematic,.042,.018,37.8,M.warm,x,7.66,-6.65,{cast:false,receive:false}));

  // Soft volumetric shafts; low opacity avoids a game-like bloom effect.
  const shaftGeo=new THREE.CylinderGeometry(.62,2.15,6.3,28,1,true);
  [
    [-2.7,4.42,5.2,CINEMATIC.warmGlow,.11],
    [2.6,4.38,-5.2,CINEMATIC.coolGlow,-.08],
    [-1.4,4.30,-15.2,CINEMATIC.warmGlow,.06]
  ].forEach(([x,y,z,mat,rz],i)=>{
    const shaft=new THREE.Mesh(shaftGeo,mat.clone());
    shaft.position.set(x,y,z);shaft.rotation.z=rz;shaft.rotation.x=i===1?.04:-.03;
    shaft.renderOrder=1;desktopCinematic.add(shaft);
  });

  // Dark glass reveals behind the key destinations increase perceived depth.
  [
    [-6.8,-28.48,4.55,4.55],
    [0,-28.48,4.55,4.55],
    [6.8,-28.48,4.55,4.55]
  ].forEach(([x,z,w,h])=>box(desktopCinematic,w,h,.035,CINEMATIC.darkGlass,x,3.05,z,{cast:false,receive:false}));

  // Light pools in the promenade strengthen foreground / midground / background separation.
  const makeOpticalPool=(x,z,r,color,opacity)=>{
    const cc=document.createElement('canvas');cc.width=cc.height=256;const gx=cc.getContext('2d');
    const g=gx.createRadialGradient(128,128,0,128,128,126);
    g.addColorStop(0,'rgba(255,255,255,'+opacity+')');g.addColorStop(.46,'rgba(255,255,255,'+(opacity*.42)+')');g.addColorStop(1,'rgba(255,255,255,0)');
    gx.fillStyle=g;gx.fillRect(0,0,256,256);
    const tx=new THREE.CanvasTexture(cc);tx.colorSpace=THREE.SRGBColorSpace;
    const mat=new THREE.MeshBasicMaterial({map:tx,color,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending});
    const p=mesh(desktopCinematic,new THREE.PlaneGeometry(r*2,r*2),mat,x,.426,z,{cast:false,receive:false});
    p.rotation.x=-Math.PI/2;p.renderOrder=4;return p;
  };
  makeOpticalPool(-1.4,7.4,3.4,0xffe2b7,.18);
  makeOpticalPool(1.6,-5.8,3.8,0xffddb0,.16);
  makeOpticalPool(-.8,-18.2,3.2,0xdce9e1,.12);

  // One quiet monolithic focal wall at the far end.
  box(desktopCinematic,17.4,5.82,.16,MAT.blackened,0,3.20,-29.10,{cast:true,receive:true});
  box(desktopCinematic,16.65,.028,.08,MAT.brass,0,5.76,-29.00,{cast:false,receive:false});
// V5.1 monumental destination wall and editorial banners.
const flagshipBrand=new THREE.Group();flagshipBrand.name='KOMO_FLAGSHIP_BRAND_V51';desktopCinematic.add(flagshipBrand);
box(flagshipBrand,8.75,4.65,.12,MAT.blackened,0,3.63,-28.92,{cast:true,receive:true});
plaque(flagshipBrand,'KŌMØ','WORLD · LONGEVITY IN MOTION',7.35,2.10,0,4.22,-28.80,{dark:true,titleSize:118});
box(flagshipBrand,7.70,.040,.075,MAT.brass,0,2.76,-28.76,{cast:false,receive:false});

// Tall editorial banners flank the central brand wall.
const bannerMatL=new THREE.MeshStandardMaterial({color:0x18372c,roughness:.46,metalness:.02});
const bannerMatR=bannerMatL.clone();
[-1,1].forEach((side,i)=>{
  const x=side*6.85;
  box(flagshipBrand,3.10,5.35,.10,i?bannerMatR:bannerMatL,x,3.95,-28.82,{cast:true,receive:true});
  box(flagshipBrand,3.10,.045,.065,MAT.brass,x,6.61,-28.72,{cast:false,receive:false});
});
plaque(flagshipBrand,'LONGEVITY','LIVES HERE',2.64,1.48,-6.85,4.15,-28.68,{dark:true,titleSize:48});
plaque(flagshipBrand,'PEOPLE','SCIENCE · PLACES · PROGRESS',2.64,1.48,6.85,4.15,-28.68,{dark:true,titleSize:48});

}



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
// V5.1 Flagship lobby — monumental KŌMØ WORLD stone mosaic at the arrival.
function makeKomoWorldMosaicTexture(){
  const size=1024,cv=document.createElement('canvas');cv.width=cv.height=size;
  const g=cv.getContext('2d');g.clearRect(0,0,size,size);

  // Ivory stone disc.
  g.beginPath();g.arc(512,512,492,0,Math.PI*2);
  g.fillStyle='rgba(239,229,211,.98)';g.fill();

  // Mineral grain.
  for(let i=0;i<1150;i++){
    const a=hash2(i,71,3)*Math.PI*2,r=Math.sqrt(hash2(i,73,7))*480;
    const x=512+Math.cos(a)*r,y=512+Math.sin(a)*r;
    const warm=i%3===0;
    g.fillStyle=warm?'rgba(137,112,79,.035)':'rgba(255,255,255,.055)';
    g.fillRect(x,y,1.2+hash2(i,79,11)*2.4,1.2+hash2(i,83,13)*2.4);
  }

  // Green marble and bronze inlay rings.
  g.lineWidth=40;g.strokeStyle='#19372d';g.beginPath();g.arc(512,512,452,0,Math.PI*2);g.stroke();
  g.lineWidth=7;g.strokeStyle='#b98d53';g.beginPath();g.arc(512,512,424,0,Math.PI*2);g.stroke();
  g.lineWidth=5;g.strokeStyle='#b98d53';g.beginPath();g.arc(512,512,300,0,Math.PI*2);g.stroke();

  // Thin radial inlay.
  for(let i=0;i<24;i++){
    const a=i/24*Math.PI*2;
    const r0=430,r1=474;
    g.strokeStyle=i%2===0?'rgba(185,141,83,.82)':'rgba(31,63,50,.50)';
    g.lineWidth=i%2===0?3:2;
    g.beginPath();g.moveTo(512+Math.cos(a)*r0,512+Math.sin(a)*r0);
    g.lineTo(512+Math.cos(a)*r1,512+Math.sin(a)*r1);g.stroke();
  }

  g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#8f6d45';
  g.font='500 168px Georgia, Times New Roman, serif';
  g.fillText('KŌMØ',512,478);
  g.font='600 76px Arial, sans-serif';
  g.letterSpacing='20px';
  g.fillText('W O R L D',512,625);

  const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;
  tx.anisotropy=Math.min(12,renderer.capabilities.getMaxAnisotropy());
  return tx;
}
const komoMosaicMat=new THREE.MeshStandardMaterial({
  map:makeKomoWorldMosaicTexture(),transparent:true,alphaTest:.02,
  roughness:.34,metalness:.025,depthWrite:false
});
const komoMosaic=mesh(floorV19,new THREE.CircleGeometry(4.42,96),komoMosaicMat,0,.431,10.4,{cast:false,receive:false});
komoMosaic.rotation.x=-Math.PI/2;komoMosaic.renderOrder=5;komoMosaic.name='KOMO_WORLD_MOSAIC_V51';
const komoMosaicOuter=mesh(floorV19,new THREE.RingGeometry(4.46,4.58,96),MAT.brass,0,.433,10.4,{cast:false,receive:false});
komoMosaicOuter.rotation.x=-Math.PI/2;komoMosaicOuter.renderOrder=6;


// V4.5 central focal point — one sculptural object, deliberately clear of the walking axis.
const atriumFocal=new THREE.Group();atriumFocal.name='KOMO_ATRIUM_FOCAL_V45';atriumFocal.position.set(0,0,-8.6);building.add(atriumFocal);
box(atriumFocal,2.65,.34,.58,MAT.travertine,0,.50,0,{cast:true});
box(atriumFocal,2.42,.055,.50,MAT.brass,0,.70,0,{cast:false,receive:false});
const focalArc=mesh(atriumFocal,new THREE.TorusGeometry(.52,.035,10,56,Math.PI*1.35),MAT.brass,0,1.43,0,{cast:true});
focalArc.rotation.set(.35,.18,.25);

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
// V5.1 premium lobby composition: symmetrical planters + bronze ring sculptures.
const flagshipDecor=new THREE.Group();flagshipDecor.name='KOMO_FLAGSHIP_DECOR_V51';building.add(flagshipDecor);
const leafMat=new THREE.MeshStandardMaterial({color:0x405d49,roughness:.90,metalness:0});
const leafMat2=new THREE.MeshStandardMaterial({color:0x6f826d,roughness:.94,metalness:0});
const planterMat=MAT.travertine;
function flagshipTree(x,z,s=1){
  const g=new THREE.Group();g.position.set(x,0,z);flagshipDecor.add(g);
  box(g,1.12,.72,1.12,planterMat,0,.37,0,{cast:true});
  cyl(g,.10,.14,2.25,MAT.walnut,0,1.70,0,10,{cast:true});
  [[0,2.95,0,.82],[-.45,2.72,.08,.58],[.42,2.72,-.10,.62],[0,3.38,.02,.54]].forEach((v,i)=>{
    const crown=mesh(g,new THREE.SphereGeometry(v[3]*s,16,11),i%2?leafMat2:leafMat,v[0]*s,v[1]*s,v[2]*s,{cast:false});
    crown.scale.set(1.12,.82,1);
  });
}
[[-8.55,11.0],[8.55,11.0],[-8.55,-2.3],[8.55,-2.3],[-8.55,-16.8],[8.55,-16.8]].forEach(p=>flagshipTree(p[0],p[1],.86));

[-1,1].forEach(side=>{
  const pedestal=new THREE.Group();pedestal.position.set(side*7.10,0,5.2);flagshipDecor.add(pedestal);
  box(pedestal,1.55,.82,1.55,MAT.travertine,0,.42,0,{cast:true});
  const ring=mesh(pedestal,new THREE.TorusGeometry(.82,.055,14,64),MAT.brass,0,1.95,0,{cast:true});
  ring.rotation.y=.35*side;ring.rotation.x=.10;
  const inner=mesh(pedestal,new THREE.TorusGeometry(.48,.032,12,48),MAT.bronze,0,1.95,0,{cast:true});
  inner.rotation.y=-.42*side;inner.rotation.z=.32;
});


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

// V6.3.2 Sky & Atmosphere — a grounded Riviera horizon in six lightweight draw-call families.
const atmosphereV632=new THREE.Group();atmosphereV632.name='KOMO_ATMOSPHERE_V632';world.add(atmosphereV632);
atmosphereV632.userData.environmentDetail=true;living.atmosphereV632=atmosphereV632;

// A broad landscape skirt hides the edge of the playable ground and receives native fog.
const distantGroundMatV632=new THREE.MeshStandardMaterial({color:0x85917e,roughness:1,metalness:0,fog:true});
const distantGroundV632=mesh(atmosphereV632,new THREE.PlaneGeometry(310,310),distantGroundMatV632,0,-.16,12,{cast:false,receive:false});
distantGroundV632.rotation.x=-Math.PI/2;

// Cylindrical haze band: one transparent shader, no volumetric pass.
const horizonHazeUniformsV632={
  hazeColor:{value:new THREE.Color(0xd9ddd5)},
  opacity:{value:lowPower?.12:.20}
};
const horizonHazeMatV632=new THREE.ShaderMaterial({
  uniforms:horizonHazeUniformsV632,transparent:true,depthWrite:false,depthTest:true,side:THREE.BackSide,fog:false,
  vertexShader:`
    varying vec2 vUv;
    void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
  `,
  fragmentShader:`
    varying vec2 vUv;
    uniform vec3 hazeColor;
    uniform float opacity;
    void main(){
      float vertical=smoothstep(0.02,.22,vUv.y)*(1.0-smoothstep(.56,.96,vUv.y));
      float base=smoothstep(.0,.12,vUv.y);
      float alpha=(vertical*.72+base*.18)*opacity;
      gl_FragColor=vec4(hazeColor,alpha);
    }
  `
});
const horizonHazeV632=mesh(atmosphereV632,new THREE.CylinderGeometry(154,166,54,64,1,true),horizonHazeMatV632,0,19,10,{cast:false,receive:false});
horizonHazeV632.renderOrder=-50;

// Low-poly hills: two depth layers, deliberately organic rather than an urban skyline.
const hillNearMatV632=new THREE.MeshStandardMaterial({color:0x788579,roughness:1,metalness:0,fog:true});
const hillFarMatV632=new THREE.MeshStandardMaterial({color:0x89958d,roughness:1,metalness:0,fog:true});
const hillGeoV632=new THREE.IcosahedronGeometry(1,1);
const hillNearItemsV632=[],hillFarItemsV632=[];
const hillNearCount=lowPower?10:18,hillFarCount=lowPower?8:15;
for(let i=0;i<hillNearCount;i++){
  const a=i/hillNearCount*Math.PI*2+.12*Math.sin(i*1.9),r=100+(i%4)*7;
  hillNearItemsV632.push({
    x:Math.cos(a)*r,y:-4.4+(i%3)*.35,z:10+Math.sin(a)*r,
    ry:a*.35,sx:18+(i%5)*5,sy:8+(i%4)*2.4,sz:11+(i%3)*3.2
  });
}
for(let i=0;i<hillFarCount;i++){
  const a=i/hillFarCount*Math.PI*2+.19,r=132+(i%3)*8;
  hillFarItemsV632.push({
    x:Math.cos(a)*r,y:-3.0,z:10+Math.sin(a)*r,
    ry:a*.24,sx:25+(i%4)*6,sy:10+(i%3)*2.8,sz:15+(i%5)*2.5
  });
}
const hillNearInstV632=instancedStatic(atmosphereV632,hillGeoV632,hillNearMatV632,hillNearItemsV632,'KOMO_RIVIERA_HILLS_NEAR_INST_V632');
const hillFarInstV632=instancedStatic(atmosphereV632,hillGeoV632,hillFarMatV632,hillFarItemsV632,'KOMO_RIVIERA_HILLS_FAR_INST_V632');

// Mediterranean tree silhouettes establish scale at the edge of the campus.
const pineMatV632=new THREE.MeshStandardMaterial({color:0x445a4a,roughness:1,metalness:0,fog:true});
const pineTrunkMatV632=new THREE.MeshStandardMaterial({color:0x6a5948,roughness:1,metalness:0,fog:true});
const pineCrownItemsV632=[],pineTrunkItemsV632=[];
const pineCount=lowPower?8:24;
for(let i=0;i<pineCount;i++){
  const a=(i/pineCount)*Math.PI*2+.38,r=83+(i%5)*6;
  const x=Math.cos(a)*r,z=10+Math.sin(a)*r,h=3.5+(i%4)*.55;
  pineCrownItemsV632.push({x,y:2.2+h*.20,z,ry:a,sx:1.45+(i%3)*.22,sy:h*.68,sz:1.45+(i%2)*.18});
  pineTrunkItemsV632.push({x,y:.85,z,ry:a,sx:.16,sy:1.7,sz:.16});
}
instancedStatic(atmosphereV632,new THREE.ConeGeometry(1,2,7),pineMatV632,pineCrownItemsV632,'KOMO_RIVIERA_PINES_INST_V632');
instancedStatic(atmosphereV632,new THREE.BoxGeometry(1,1,1),pineTrunkMatV632,pineTrunkItemsV632,'KOMO_RIVIERA_PINE_TRUNKS_INST_V632');

// Sparse low horizontal pavilion forms evoke Riviera architecture without forming a generic skyline.
const distantArchitectureMatV632=new THREE.MeshStandardMaterial({color:0xc7c1b5,roughness:.92,metalness:0,fog:true});
const distantArchitectureItemsV632=[];
const pavilionCount=lowPower?4:8;
for(let i=0;i<pavilionCount;i++){
  const a=.22+i/(pavilionCount)*Math.PI*2,r=91+(i%3)*9;
  distantArchitectureItemsV632.push({
    x:Math.cos(a)*r,y:2.0+(i%2)*.45,z:10+Math.sin(a)*r,ry:-a,
    sx:6.5+(i%3)*2.0,sy:3.6+(i%2)*.9,sz:2.8+(i%2)*.8
  });
}
const distantArchitectureInstV632=instancedStatic(atmosphereV632,new THREE.BoxGeometry(1,1,1),distantArchitectureMatV632,distantArchitectureItemsV632,'KOMO_RIVIERA_PAVILIONS_INST_V632');

function applyAtmosphereV632Profile(state='day'){
  if(!living.atmosphereV632)return;
  const profile={
    day:{haze:0xd9ddd5,ground:0x85917e,near:0x788579,far:0x89958d,pine:0x445a4a,architecture:0xc7c1b5,opacity:lowPower?.12:.20},
    morning:{haze:0xe4d7c8,ground:0x89927f,near:0x7f897b,far:0x969b90,pine:0x4a604e,architecture:0xd0c3b2,opacity:lowPower?.13:.22},
    golden:{haze:0xdfcbb3,ground:0x8d8d76,near:0x827e6d,far:0x999081,pine:0x4c5944,architecture:0xcdb9a3,opacity:lowPower?.14:.24},
    evening:{haze:0x8f9690,ground:0x69746b,near:0x606d64,far:0x737f78,pine:0x35483b,architecture:0x9b9b91,opacity:lowPower?.13:.23}
  }[state]||null;
  if(!profile)return;
  horizonHazeUniformsV632.hazeColor.value.setHex(profile.haze);horizonHazeUniformsV632.opacity.value=profile.opacity;
  distantGroundMatV632.color.setHex(profile.ground);
  hillNearMatV632.color.setHex(profile.near);hillFarMatV632.color.setHex(profile.far);
  pineMatV632.color.setHex(profile.pine);distantArchitectureMatV632.color.setHex(profile.architecture);
}
applyAtmosphereV632Profile(living.daylight);


// V6.1 Grand Flagship — scale comes from silhouette, rhythm and emissive depth, not extra lights.
const grandFlagshipV61=new THREE.Group();grandFlagshipV61.name='KOMO_GRAND_FLAGSHIP_V61';building.add(grandFlagshipV61);
grandFlagshipV61.userData.realismDetail=true;
const grandWarmV61=new THREE.MeshBasicMaterial({color:0xe8c58b,transparent:true,opacity:lowPower?.30:.52,depthWrite:false});
const grandCoolV61=new THREE.MeshBasicMaterial({color:0xc6dbce,transparent:true,opacity:lowPower?.24:.42,depthWrite:false});
const grandDarkV61=MAT.blackened;
const grandUnitBoxV61=new THREE.BoxGeometry(1,1,1);

// Monumental nave rhythm: tall paired fins create a longer, higher perceived hall with only two draw calls.
const grandStoneFinsV61=[],grandBrassFinsV61=[];
[10.0,2.0,-6.0,-14.0,-22.0].forEach((z,i)=>{
  [-1,1].forEach(side=>{
    grandStoneFinsV61.push({x:side*10.72,y:4.30,z, sx:.34,sy:7.45,sz:.72});
    grandBrassFinsV61.push({x:side*10.50,y:4.30,z:z+.39, sx:.045,sy:6.84,sz:.055});
  });
});
instancedStatic(grandFlagshipV61,grandUnitBoxV61,WALL.travertine,grandStoneFinsV61,'KOMO_GRAND_STONE_FINS_INST_V61');
instancedStatic(grandFlagshipV61,grandUnitBoxV61,MAT.brass,grandBrassFinsV61,'KOMO_GRAND_BRASS_FINS_INST_V61');

// Ceiling procession: dark ribs + luminous inner spine make the nave read as a ceremonial gallery.
const grandCeilingRibsV61=[];
[-21.8,-17.8,-13.8,-9.8,-5.8,-1.8,2.2,6.2,10.2].forEach(z=>{
  grandCeilingRibsV61.push({x:0,y:7.53,z,sx:9.30,sy:.12,sz:.24});
});
instancedStatic(grandFlagshipV61,grandUnitBoxV61,grandDarkV61,grandCeilingRibsV61,'KOMO_GRAND_CEILING_RIBS_INST_V61');
box(grandFlagshipV61,8.65,.024,36.0,grandWarmV61,0,7.43,-6.2,{cast:false,receive:false});
[-4.16,4.16].forEach(x=>box(grandFlagshipV61,.038,.024,35.4,grandCoolV61,x,7.40,-6.2,{cast:false,receive:false}));

// Monumental armillary above the existing atrium focal: dramatic silhouette, only three meshes.
const grandArmillaryV61=new THREE.Group();grandArmillaryV61.name='KOMO_ATRIUM_ARMILLARY_V61';grandArmillaryV61.position.set(0,4.20,-8.6);grandFlagshipV61.add(grandArmillaryV61);
const grandRingA=mesh(grandArmillaryV61,new THREE.TorusGeometry(2.30,.065,12,72),MAT.brass,0,0,0,{cast:false,receive:false});
const grandRingB=mesh(grandArmillaryV61,new THREE.TorusGeometry(1.82,.045,10,64),grandCoolV61,0,0,0,{cast:false,receive:false});
const grandRingC=mesh(grandArmillaryV61,new THREE.TorusGeometry(1.24,.035,10,56),grandWarmV61,0,0,0,{cast:false,receive:false});
grandRingA.rotation.set(.18,.52,.08);grandRingB.rotation.set(Math.PI/2,.12,.44);grandRingC.rotation.set(.75,.20,Math.PI/2);
const grandCoreV61=mesh(grandArmillaryV61,new THREE.SphereGeometry(.18,18,12),M.warm,0,0,0,{cast:false,receive:false});

// Destination theatre: tall halo portals give Twin / Fitness / Arena a visual identity from across the Hall.
const destinationTheatreV61=new THREE.Group();destinationTheatreV61.name='KOMO_DESTINATION_THEATRE_V61';building.add(destinationTheatreV61);
[
  [-6.8,grandCoolV61,0xb9cfbf],
  [0,grandWarmV61,0xd7b777],
  [6.8,grandWarmV61,0xb9935c]
].forEach(([x,mat,color],i)=>{
  const halo=mesh(destinationTheatreV61,new THREE.TorusGeometry(2.15,.052,12,64),mat,x,3.18,-31.25,{cast:false,receive:false});
  halo.rotation.y=.04*(i-1);halo.userData.phase=i*.9;
  const inner=mesh(destinationTheatreV61,new THREE.TorusGeometry(1.70,.024,8,56),mat.clone(),x,3.18,-31.18,{cast:false,receive:false});
  inner.material.opacity*=.68;inner.userData.phase=i*.9+.4;
  plaque(destinationTheatreV61,i===0?'TWIN':i===1?'FITNESS':'ARENA',i===0?'UNDERSTAND':i===1?'MOVE':'ENGAGE',3.25,.60,x,6.02,-30.94,{dark:true,titleSize:44});
});


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
  for(let z=9.6;z>=-22.8;z-=4.8)wallRibs.push({x:side*11.43,y:3.30,z,sx:.045,sy:3.00,sz:.10});
});
instancedStatic(hallLiving,new THREE.BoxGeometry(1,1,1),MAT.brass,wallRibs,'KOMO_HALL_BRASS_RIBS_V30');

// Warm ceiling blades create a richer ceiling without any extra PointLight.
const bladeMat=new THREE.MeshBasicMaterial({color:0xd8b47b});
const ceilingBlades=[];
[10.2,2.1,-6.0,-14.1,-22.2].forEach(z=>{
  ceilingBlades.push({x:-5.1,y:7.42,z,sx:3.55,sy:.018,sz:.036});
  ceilingBlades.push({x:5.1,y:7.42,z,sx:3.55,sy:.018,sz:.036});
});
instancedStatic(hallLiving,new THREE.BoxGeometry(1,1,1),bladeMat,ceilingBlades,'KOMO_HALL_LIGHT_BLADES_V30');

// V4.3 ceiling practicals — visible sources aligned with the actual light rig.
const hallPracticalGroup=new THREE.Group();hallPracticalGroup.name='KOMO_HALL_PRACTICALS_V43';hallLiving.add(hallPracticalGroup);
const practicalWarm=new THREE.MeshBasicMaterial({color:0xffe2b5,transparent:true,opacity:.80,depthWrite:false});
const practicalSoft=new THREE.MeshBasicMaterial({color:0xfff0d6,transparent:true,opacity:.52,depthWrite:false});
const practicalCool=new THREE.MeshBasicMaterial({color:0xe2ece6,transparent:true,opacity:.42,depthWrite:false});
const lightPoolMat=new THREE.MeshBasicMaterial({color:0xf3d8ad,transparent:true,opacity:.038,depthWrite:false,depthTest:true,side:THREE.DoubleSide});
const coolPoolMat=new THREE.MeshBasicMaterial({color:0xdbe9e1,transparent:true,opacity:.030,depthWrite:false,depthTest:true,side:THREE.DoubleSide});

// Central recessed fixtures establish rhythm along the promenade.
[
  [0,7.39,10.8,3.2,.10,.64,practicalSoft],
  [0,7.39,3.0,2.6,.10,.54,practicalWarm],
  [0,7.39,-5.4,3.2,.10,.64,practicalWarm],
  [0,7.39,-13.0,2.6,.10,.54,practicalSoft],
  [0,7.39,-18.4,3.2,.10,.64,practicalCool]
].forEach(([x,y,z,w,h,d,mat])=>box(hallPracticalGroup,w,h,d,mat,x,y,z,{cast:false,receive:false}));

// Perimeter lines visually explain the warmer side-wall washes.
[-1,1].forEach(side=>{
  [7.5,-2.0,-11.5,-20.5].forEach((z,idx)=>{
    box(hallPracticalGroup,2.25,.035,.055,idx===3?practicalCool:practicalWarm,side*8.25,6.84,z,{cast:false,receive:false});
  });
});

// Very subtle pools on the stone floor anchor the fixtures spatially.
[
  [0,.408,9.0,2.55,lightPoolMat],
  [0,.408,-5.4,2.90,lightPoolMat],
  [0,.408,-20.0,2.65,coolPoolMat],
  [-7.1,.408,1.2,1.45,lightPoolMat],
  [7.1,.408,-12.4,1.45,lightPoolMat]
].forEach(([x,y,z,r,mat])=>{
  const p=mesh(hallPracticalGroup,new THREE.CircleGeometry(r,lowPower?20:42),mat,x,y,z,{cast:false,receive:false});
  p.rotation.x=-Math.PI/2;p.scale.set(1,.72,1);
});

// Destination thresholds are brighter in geometry, but not neon.
[
  [-4.6,-25.72,0xdceae0],
  [0,-25.72,0xffdda2],
  [4.6,-25.72,0xe8c98f]
].forEach(([x,z,color])=>{
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.44,depthWrite:false});
  box(hallPracticalGroup,2.05,.025,.075,mat,x,.415,z,{cast:false,receive:false});
});


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
plaque(hallLiving,'LONGEVITY IN MOTION','MEASURE · UNDERSTAND · TRAIN · LIVE',3.85,.70,-11.32,5.52,7.4,{rotY:Math.PI/2,dark:true,titleSize:44});
plaque(hallLiving,'KŌMØ CULTURE','MOVEMENT · SCIENCE · COMMUNITY',3.65,.68,11.32,5.48,-15.6,{rotY:-Math.PI/2,dark:true,titleSize:42});

// One additional live editorial screen — existing motion-screen system is already throttled/culling-aware.
if(!lowPower)motionScreen(hallLiving,11.40,4.55,-8.8,-Math.PI/2,'TODAY AT KŌMØ');

// Material library objects near the Desk and Life entrance.
const displayCubes=[];
[[-5.1,2.25,2.4],[5.45,2.25,.6],[-5.25,2.25,-19.3],[5.2,2.25,-19.0]].forEach(([x,y,z],idx)=>{
  displayCubes.push({x,y,z,sx:.55,sy:.55,sz:.55,ry:idx*.42});
});
instancedStatic(hallLiving,new THREE.BoxGeometry(1,1,1),MAT.walnut,displayCubes,'KOMO_HALL_MATERIAL_OBJECTS_V30');

// V4.5 integrated wayfinding — a single architectural datum instead of floating sign cards.
const destinationDatum=new THREE.Group();destinationDatum.name='KOMO_DESTINATION_DATUM_V45';hallLiving.add(destinationDatum);
box(destinationDatum,14.8,.045,.065,MAT.brass,0,2.34,-25.88,{cast:false,receive:false});
[
  [-4.6,'TWIN','UNDERSTAND',true],
  [0,'FITNESS','TRAIN',false],
  [4.6,'ARENA','ENGAGE',true]
].forEach(([x,label,sub,dark])=>plaque(destinationDatum,label,sub,1.78,.40,x,2.62,-25.84,{dark,titleSize:30}));

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
makeNpc(npcRoot,{role:'staff',label:'Maya',quest:'maya',functionLabel:'MOVEMENT GUIDE',x:-2.8,y:0,z:11.2,outfit:'sage',speed:.34,phase:.12,route:[
  [-2.8,0,11.2],[-2.8,0,5.8],[-1.6,0,1.8],[-3.2,0,-2.5],[-4.0,0,4.2]
]});
makeNpc(npcRoot,{role:'visitor',label:'Noah',quest:'noah',functionLabel:'WORLD RUNNER',x:3.6,y:0,z:27.8,outfit:'cream',speed:.54,phase:.36,route:[
  [3.6,0,27.8],[2.5,0,18.7],[2.8,0,10.8],[3.6,0,2.5],[4.2,0,-6.2],[3.0,0,-14.4]
]});
if(!lowPower){
  makeNpc(npcRoot,{role:'visitor',label:'Elena',quest:'elena',functionLabel:'BALANCE GUIDE',x:-3.8,y:0,z:-4.5,outfit:'sand',speed:.46,phase:.61,route:[
  [-3.8,0,-4.5],[-3.2,0,-12.0],[-4.8,0,-20.4],[-1.4,0,-24.2],[1.8,0,-19.2],[.8,0,-8.0]
]});
makeNpc(npcRoot,{role:'coach',label:'Leo',quest:'leo',functionLabel:'FITNESS COACH',x:5.4,y:0,z:-18.4,outfit:'charcoal',speed:.42,phase:.82,route:[
  [5.4,0,-18.4],[5.2,0,-10.0],[4.8,0,-2.2],[3.7,0,5.2],[5.5,0,9.0]
]});
  makeNpc(npcRoot,{role:'visitor',label:'Sofia',quest:'sofia',functionLabel:'LIFE CURATOR',x:7.0,y:0,z:5.8,outfit:'bronze',speed:.28,phase:.22,route:[
    [7.0,0,5.8],[9.2,0,4.2],[9.0,0,1.2],[7.2,0,.4],[7.4,0,3.0]
  ]});
  makeNpc(npcRoot,{role:'staff',label:'Camille',quest:'camille',functionLabel:'TWIN GUIDE',x:-6.3,y:0,z:6.7,outfit:'sage',speed:.24,phase:.43,route:[
    [-6.3,0,6.7],[-7.1,0,4.2],[-5.7,0,2.5],[-4.8,0,6.0],[-6.3,0,7.2]
  ]});
  makeNpc(npcRoot,{role:'visitor',label:'Lina',quest:'lina',functionLabel:'COMMUNITY HOST',x:5.5,y:0,z:-11.8,outfit:'cream',speed:.25,phase:.67,route:[
    [5.5,0,-11.8],[6.8,0,-9.7],[5.9,0,-7.2],[4.8,0,-9.4],[5.5,0,-12.2]
  ]});
  makeNpc(npcRoot,{role:'staff',label:'Alex',quest:'alex',functionLabel:'SCIENCE GUIDE',x:-8.72,y:UPPER_Y,z:4.8,outfit:'sage',speed:.30,phase:.48,route:[
    [-8.72,UPPER_Y,4.8],[-8.72,UPPER_Y,-4.8],[-8.72,UPPER_Y,-14.8],[-4.2,UPPER_Y,-21.2]
  ]});
  makeNpc(npcRoot,{role:'visitor',label:'Mila',quest:'mila',functionLabel:'LEVEL 2 HOST',x:8.72,y:UPPER_Y,z:-3.0,outfit:'cream',speed:.31,phase:.72,route:[
    [8.72,UPPER_Y,-3.0],[8.72,UPPER_Y,-10.5],[8.72,UPPER_Y,-18.0],[3.6,UPPER_Y,-21.2],[.4,UPPER_Y,-21.2]
  ]});
  makeNpc(npcRoot,{role:'coach',label:'Théo',quest:'theo',functionLabel:'ARENA COACH',x:6.0,y:0,z:-20.5,outfit:'bronze',speed:.26,phase:.15,route:[
    [6.0,0,-20.5],[7.4,0,-17.8],[6.2,0,-14.6],[4.8,0,-17.2],[6.0,0,-20.5]
  ]});
  makeNpc(npcRoot,{role:'coach',label:'Nora',quest:'nora',functionLabel:'DISTRICT GUIDE',x:-7.5,y:0,z:55.5,outfit:'sage',speed:.36,phase:.35,route:[
    [-7.5,0,55.5],[-3.0,0,60.5],[0,0,62.5],[3.0,0,60.5],[7.5,0,55.5],[0,0,58.0]
  ]});
  makeNpc(npcRoot,{role:'visitor',label:'Jules',quest:'jules',functionLabel:'RECOVERY HOST',x:10.5,y:0,z:64.0,outfit:'sand',speed:.31,phase:.58,route:[
    [10.5,0,64.0],[15.0,0,68.0],[10.5,0,72.5],[4.2,0,70.0],[3.5,0,64.0]
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

// V3.3 Life Retail Wall — products are arranged like a real flagship.
const lifeRetailWall=new THREE.Group();lifeRetailWall.name='KOMO_LIFE_RETAIL_WALL_V33';lifeStore.add(lifeRetailWall);
lifeRetailWall.position.set(1.72,0,.10);
box(lifeRetailWall,.22,4.45,6.2,MAT.walnut,0,2.36,0,{cast:true});
[-2.30,-.76,.78,2.32].forEach(z=>{
  box(lifeRetailWall,1.42,.055,.34,MAT.brass,-.18,1.12,z);
  box(lifeRetailWall,1.42,.055,.34,MAT.brass,-.18,2.22,z);
});
plaque(lifeRetailWall,'LIFE WALL','WEAR · MOVE · RECOVER',3.7,.62,-.18,4.55,-2.55,{rotY:Math.PI/2,dark:true,titleSize:42});

// Jacket / overshirt represented as a structured hanging silhouette.
const jacketDisplay=new THREE.Group();jacketDisplay.position.set(-.42,2.12,-1.55);lifeRetailWall.add(jacketDisplay);
box(jacketDisplay,.86,.92,.18,MAT.fabric,0,0,0,{cast:true});
box(jacketDisplay,.22,.74,.16,MAT.fabric,-.55,-.02,0,{cast:true});
box(jacketDisplay,.22,.74,.16,MAT.fabric,.55,-.02,0,{cast:true});
box(jacketDisplay,.018,.72,.20,MAT.brass,0,0,.11);
plaque(lifeRetailWall,'KŌMØ JACKET','MOVE WELL · LIVE LONG',2.1,.40,-.18,3.08,-1.55,{rotY:Math.PI/2,dark:false,titleSize:30});

// Mobility band + compact pouch.
const bandDisplay=new THREE.Group();bandDisplay.position.set(-.40,1.28,.05);lifeRetailWall.add(bandDisplay);
const band=mesh(bandDisplay,new THREE.TorusGeometry(.34,.045,8,30),MAT.fabricLight,0,0,0,{cast:true});band.rotation.y=.85;band.rotation.x=.38;
box(bandDisplay,.52,.30,.20,MAT.blackened,.02,-.48,0,{cast:true});
plaque(lifeRetailWall,'MOBILITY BAND','TRAIN ANYWHERE',1.95,.40,-.18,2.20,.05,{rotY:Math.PI/2,dark:true,titleSize:31});

// Small recovery / travel objects give depth to the wall.
[-2.30,.78,2.32].forEach((z,i)=>{
  const mat=i===0?MAT.charcoal:i===1?MAT.fabricLight:MAT.travertine;
  box(lifeRetailWall,.52,.28,.24,mat,-.30,1.35,z,{cast:true});
  box(lifeRetailWall,.36,.055,.18,MAT.brass,-.30,1.53,z);
});

// Central discovery table for tactile items.
const discoveryTable=new THREE.Group();discoveryTable.name='KOMO_LIFE_DISCOVERY_TABLE_V33';discoveryTable.position.set(-.25,0,.45);lifeStore.add(discoveryTable);
box(discoveryTable,2.45,.16,1.02,MAT.travertine,0,.83,0,{cast:true});
box(discoveryTable,.12,.76,.72,MAT.brass,-.92,.42,0);
box(discoveryTable,.12,.76,.72,MAT.brass,.92,.42,0);
const miniStrap=mesh(discoveryTable,new THREE.TorusGeometry(.20,.040,8,24),MAT.fabric,-.62,1.00,0,{cast:true});miniStrap.rotation.x=.55;
cyl(discoveryTable,.10,.12,.42,MAT.charcoal,.12,1.04,0,14,{cast:true});
box(discoveryTable,.42,.22,.28,MAT.walnut,.64,1.00,0,{cast:true});
plaque(discoveryTable,'DISCOVER','TOUCH · EXPLORE · CONFIGURE',2.20,.42,0,1.54,.54,{dark:false,titleSize:31});

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

// V4.5 Destination vestibules — three architectural rooms read before the animated doors.
const destinationVestibules=new THREE.Group();destinationVestibules.name='KOMO_DESTINATION_VESTIBULES_V45';building.add(destinationVestibules);
[
  {x:-6.8,w:5.35,accent:0xb9cfbf,mat:MAT.limestone},
  {x:0,w:5.35,accent:0xd7b777,mat:MAT.travertine},
  {x:6.8,w:5.35,accent:0xb9935c,mat:MAT.limestone}
].forEach((p,i)=>{
  const g=new THREE.Group();g.position.set(p.x,0,-27.65);destinationVestibules.add(g);
  // 1.8 m deep vestibule projects into the Hall and creates a real threshold.
  box(g,.30,5.75,1.80,p.mat,-2.48,3.20,0,{cast:true});
  box(g,.30,5.75,1.80,p.mat,2.48,3.20,0,{cast:true});
  box(g,5.26,.26,1.80,p.mat,0,5.96,0,{cast:true});
  box(g,4.72,.032,1.42,MAT.blackened,0,5.73,.02,{cast:false,receive:false});
  // Side reveals and floor transition.
  box(g,.045,4.85,1.44,MAT.brass,-2.26,3.02,.02,{cast:false,receive:false});
  box(g,.045,4.85,1.44,MAT.brass,2.26,3.02,.02,{cast:false,receive:false});
  box(g,4.74,.030,1.42,i===1?FLOOR.promenade:FLOOR.side,0,.405,.02,{cast:false,receive:true});
  const accentMat=new THREE.MeshBasicMaterial({color:p.accent,transparent:true,opacity:.20,depthWrite:false});
  box(g,4.28,.018,.055,accentMat,0,.435,.73,{cast:false,receive:false});
});

// V5.7 Open Atrium — the destination wall is physically perforated so each universe reads from the Hall.
const destinationWallOpen=new THREE.Group();destinationWallOpen.name='KOMO_OPEN_ATRIUM_WALL_V57';building.add(destinationWallOpen);
box(destinationWallOpen,22.7,1.15,.46,M.sageDeep,0,7.08,-30.0,{cast:true});
box(destinationWallOpen,1.20,6.10,.46,M.sageDeep,-10.75,3.56,-30.0,{cast:true});
box(destinationWallOpen,1.20,6.10,.46,M.sageDeep,10.75,3.56,-30.0,{cast:true});
[-3.42,3.42].forEach(x=>box(destinationWallOpen,1.02,6.10,.46,M.sageDeep,x,3.56,-30.0,{cast:true}));
box(destinationWallOpen,22.0,.08,.16,MAT.brass,0,6.46,-29.76,{cast:false,receive:false});
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
  // No opaque slab: only a deep frame, so the illuminated destination remains visible through the threshold.
  box(building,.22,5.25,.56,dark?M.sage:M.stone,x-2.32,3.03,-29.56,{cast:true});
  box(building,.22,5.25,.56,dark?M.sage:M.stone,x+2.32,3.03,-29.56,{cast:true});
  box(building,4.86,.24,.56,dark?M.sage:M.stone,x,5.54,-29.56,{cast:true});
  box(building,.08,4.9,.10,M.bronze,x-2.16,2.95,-29.29);
  box(building,.08,4.9,.10,M.bronze,x+2.16,2.95,-29.29);
  plaque(building,title,sub,4.2,1.05,x,6.28,-29.25,{dark,titleSize:title==='FUNCTIONAL TWIN'?58:70});
});

// V5.7 Destination Vistas — each room has a living sightline before the player crosses the threshold.
const destinationVistas=new THREE.Group();destinationVistas.name='KOMO_DESTINATION_VISTAS_V57';building.add(destinationVistas);
const twinVistaRings=[],fitVistaMarkers=[],arenaVistaRings=[],portalActors=[];
const vistaCool=new THREE.MeshBasicMaterial({color:0xc9ddd0,transparent:true,opacity:lowPower?.30:.48,depthWrite:false});
const vistaWarm=new THREE.MeshBasicMaterial({color:0xe1bd7f,transparent:true,opacity:lowPower?.34:.56,depthWrite:false});
const vistaArena=new THREE.MeshBasicMaterial({color:0xc99a5e,transparent:true,opacity:lowPower?.36:.62,depthWrite:false});
function portalActor(parent,x,z,accent=0xd8b679,phase=0){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  const bodyMat=new THREE.MeshStandardMaterial({color:0x26362e,roughness:.76,metalness:.02});
  const skinMat=new THREE.MeshStandardMaterial({color:0xc99e7b,roughness:.82});
  const accentMat=new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.40,depthWrite:false});
  cyl(g,.16,.19,1.10,bodyMat,0,1.22,0,10,{cast:false});
  mesh(g,new THREE.SphereGeometry(.18,12,9),skinMat,0,1.94,0,{cast:false});
  [-.18,.18].forEach(xx=>cyl(g,.055,.065,.84,bodyMat,xx,.50,0,8,{cast:false}));
  const ring=mesh(g,new THREE.RingGeometry(.28,.31,24),accentMat,0,.10,0,{cast:false,receive:false});ring.rotation.x=-Math.PI/2;
  g.userData.phase=phase;portalActors.push(g);return g;
}
function vistaTunnel(x,accentMat,kind){
  const g=new THREE.Group();g.position.set(x,0,-34.3);destinationVistas.add(g);
  box(g,4.35,.035,8.2,kind==='fitness'?FLOOR.promenade:FLOOR.side,0,.39,-.6,{cast:false,receive:true});
  [-2.12,2.12].forEach(px=>{
    box(g,.08,4.65,8.1,MAT.blackened,px,2.72,-.6,{cast:false,receive:false});
    box(g,.025,3.80,7.7,accentMat,px*.995,2.62,-.6,{cast:false,receive:false});
  });
  box(g,4.25,.08,8.0,MAT.blackened,0,5.18,-.6,{cast:false,receive:false});
  [-1.55,0,1.55].forEach(px=>box(g,1.10,.018,6.8,accentMat,px,5.12,-.7,{cast:false,receive:false}));
  return g;
}
const twinVista=vistaTunnel(-6.8,vistaCool,'twin');
for(let i=0;i<4;i++){
  const r=mesh(twinVista,new THREE.TorusGeometry(.66+i*.10,.025,8,44),i%2?vistaWarm:vistaCool,0,2.35,-1.0-i*1.25,{cast:false,receive:false});
  r.rotation.x=Math.PI/2;r.userData.phase=i*.75;twinVistaRings.push(r);
}
plaque(twinVista,'BODY / TIME','FUNCTIONAL TWIN',3.15,.62,0,4.35,-4.28,{dark:true,titleSize:38});
portalActor(twinVista,-.72,-2.55,0xb9cfbf,.4);

const fitVista=vistaTunnel(0,vistaWarm,'fitness');
for(let i=0;i<7;i++){
  const marker=box(fitVista,.56,.025,.12,i%2?vistaCool:vistaWarm,(i%3-1)*1.05,.45,2.55-i*.98,{cast:false,receive:false});
  marker.userData.baseZ=marker.position.z;marker.userData.phase=i*.83;fitVistaMarkers.push(marker);
}
const fitRig=new THREE.Group();fitRig.position.set(0,0,-2.8);fitVista.add(fitRig);
[-.82,.82].forEach(px=>box(fitRig,.08,2.25,.08,MAT.blackened,px,1.50,0,{cast:false}));
box(fitRig,1.74,.07,.07,MAT.brass,0,2.55,0,{cast:false});
box(fitRig,1.58,.10,.50,MAT.leatherDark,0,.61,.52,{cast:false});
plaque(fitVista,'OPEN CLUB','MOVE · TRAIN · RECOVER',3.25,.62,0,4.35,-4.28,{dark:false,titleSize:38});
portalActor(fitVista,.72,-2.25,0xd7b777,1.4);

const arenaVista=vistaTunnel(6.8,vistaArena,'arena');
for(let i=0;i<3;i++){
  const r=mesh(arenaVista,new THREE.RingGeometry(.72+i*.44,.76+i*.44,48),i===1?vistaWarm:vistaArena,0,.44,-1.35-i*.98,{cast:false,receive:false});
  r.rotation.x=-Math.PI/2;r.userData.phase=i*.88;arenaVistaRings.push(r);
}
box(arenaVista,3.35,1.55,.12,MAT.blackened,0,3.24,-4.20,{cast:false});
plaque(arenaVista,'LIVE','DAILY · XP · COMMUNITY',3.10,.70,0,3.30,-4.12,{dark:true,titleSize:46});
portalActor(arenaVista,-.68,-2.20,0xb9935c,2.2);

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
  const mat=new THREE.MeshBasicMaterial({color:cfg.accent,transparent:true,opacity:.39,depthWrite:false});
  const threshold=box(g,4.05,.018,.11,mat,0,.43,.42,{cast:false,receive:false});
  const beacon=mesh(g,new THREE.RingGeometry(.20,.27,24),mat,0,5.60,.12,{cast:false,receive:false});beacon.rotation.x=Math.PI/2;beacon.userData.dynamic=true;
  // V5.6 open campus: destination leaves start parked and never block the sightline.
  left.position.x=-2.20;right.position.x=2.20;
  living.destinationDoors.push({id:cfg.id,x:cfg.x,left,right,threshold,beacon,mat,progress:1});
});

// V4.5 Destination identity — architecture carries the hierarchy; signage stays secondary.
[
  {x:-6.8,title:'FUNCTIONAL TWIN',sub:'UNDERSTAND',accent:0xb9cfbf,dark:true},
  {x:0,title:'KŌMØ FIT',sub:'TRAIN DAILY',accent:0xd7b777,dark:false},
  {x:6.8,title:'ARENA',sub:'CHALLENGE',accent:0xb9935c,dark:true}
].forEach((p,i)=>{
  const g=new THREE.Group();g.name='KOMO_PORTAL_ARCH_V45_'+i;g.position.set(p.x,0,-28.40);building.add(g);
  const glowMat=new THREE.MeshBasicMaterial({color:p.accent,transparent:true,opacity:.16,depthWrite:false});
  plaque(g,p.title,p.sub,3.65,.66,0,6.10,.86,{dark:p.dark,titleSize:p.title==='FUNCTIONAL TWIN'?40:50});
  box(g,3.20,.022,.055,glowMat,0,5.55,.89,{cast:false,receive:false});
  const ring=mesh(g,new THREE.RingGeometry(.47,.53,36),glowMat,0,.420,2.75,{cast:false,receive:false});ring.rotation.x=-Math.PI/2;
});
plaque(building,'LIBRARY','SCIENCE · METHOD',3.5,.84,-11.45,4.3,-10,{rotY:Math.PI/2,dark:false,titleSize:68});
plaque(building,'TALKS','EXPERTS · EVENTS',3.5,.84,11.45,4.3,-10,{rotY:-Math.PI/2,dark:true,titleSize:68});
plaque(building,'KŌMØ LIFE','STORE · CASE 01',3.8,.88,11.35,4.45,2.6,{rotY:-Math.PI/2,dark:true,titleSize:62});
glow(building,0xf0cd9d,2.6,13,-8.0,5.6,6);
glow(building,0xf0cd9d,2.6,13,8.0,5.6,6);
glow(building,0xecc492,3.7,16,0,5.4,-25);

// V3.7 One World — physical circulation links every zone into a single continuous campus.
const oneWorldLinks=new THREE.Group();oneWorldLinks.name='KOMO_ONE_WORLD_LINKS_V37';world.add(oneWorldLinks);
function campusPath(w,d,x,z){
  box(oneWorldLinks,w,.10,d,MAT.travertine,x,.045,z,{receive:true});
  if(w>d){
    line(oneWorldLinks,w-.5,.035,x,z-d*.28,M.bronzeSoft,.105);
    line(oneWorldLinks,w-.5,.035,x,z+d*.28,M.bronzeSoft,.105);
  }else{
    const a=box(oneWorldLinks,.035,.018,d-.5,M.bronzeSoft,x-w*.28,.108,z,{cast:false,receive:false});
    const b=box(oneWorldLinks,.035,.018,d-.5,M.bronzeSoft,x+w*.28,.108,z,{cast:false,receive:false});
  }
}
// V6.2: wider promenades make the destination circulation read as primary architecture.
campusPath(25.8,7.1,-22.0,-24.0);
campusPath(7.1,23.0,-32.1,-13.0);
campusPath(25.8,7.1,22.0,-24.0);
campusPath(7.1,23.0,32.1,-13.0);
campusPath(9.4,16.8,0,-35.5);
plaque(oneWorldLinks,'TWIN','UNDERSTAND',3.3,.72,-26.8,2.15,-23.85,{dark:true,titleSize:55});
plaque(oneWorldLinks,'FITNESS','MOVE',3.3,.72,0,2.15,-31.2,{dark:true,titleSize:55});
plaque(oneWorldLinks,'ARENA','ENGAGE',3.3,.72,26.8,2.15,-23.85,{dark:true,titleSize:55});

const roomAccess=new THREE.Group();roomAccess.name='KOMO_ROOM_ACCESS_V52';oneWorldLinks.add(roomAccess);
function accessPortal({id,title,sub,x,z,rot=0,accent=0xd5b679,dark=true}){
  const g=new THREE.Group();g.name='KOMO_ACCESS_'+id+'_V52';g.position.set(x,0,z);g.rotation.y=rot;roomAccess.add(g);
  const accentMat=new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.52,depthWrite:false});
  box(g,.32,5.72,.82,MAT.travertine,-3.05,2.92,0,{cast:true});
  box(g,.32,5.72,.82,MAT.travertine,3.05,2.92,0,{cast:true});
  box(g,6.42,.30,.82,MAT.travertine,0,5.64,0,{cast:true});
  box(g,5.78,.035,.085,MAT.brass,0,5.32,.44,{cast:false,receive:false});
  box(g,5.18,.020,.070,accentMat,0,.145,.64,{cast:false,receive:false});
  plaque(g,title,sub,5.10,.68,0,4.78,.46,{dark,titleSize:title.length>12?42:50});
  const ring=mesh(g,new THREE.RingGeometry(.38,.44,36),accentMat,0,.16,.72,{cast:false,receive:false});
  ring.rotation.x=-Math.PI/2;
  return g;
}
accessPortal({id:'TWIN_A',title:'FUNCTIONAL TWIN',sub:'UNDERSTAND · WALK IN',x:-13.0,z:-24.0,rot:Math.PI/2,accent:0xb9cfbf});
accessPortal({id:'FIT_A',title:'KŌMØ FITNESS',sub:'MOVE · WALK IN',x:0,z:-29.8,accent:0xd7b777,dark:false});
accessPortal({id:'ARENA_A',title:'ARENA',sub:'ENGAGE · WALK IN',x:13.0,z:-24.0,rot:-Math.PI/2,accent:0xb9935c});
accessPortal({id:'TWIN_B',title:'TWIN LAB',sub:'BODY · TIME · DATA',x:-32.1,z:-2.1,rot:Math.PI/2,accent:0xb9cfbf});
accessPortal({id:'FIT_B',title:'FITNESS CLUB',sub:'TRAIN · PROGRESS',x:0,z:-43.3,accent:0xd7b777,dark:false});
accessPortal({id:'ARENA_B',title:'ARENA FLOOR',sub:'CHALLENGE · COMMUNITY',x:32.1,z:-2.1,rot:-Math.PI/2,accent:0xb9935c});

const guideTwin=new THREE.MeshBasicMaterial({color:0xb9cfbf,transparent:true,opacity:.24,depthWrite:false});
const guideFit=new THREE.MeshBasicMaterial({color:0xd7b777,transparent:true,opacity:.25,depthWrite:false});
const guideArena=new THREE.MeshBasicMaterial({color:0xb9935c,transparent:true,opacity:.24,depthWrite:false});
box(roomAccess,20.0,.018,.055,guideTwin,-22.8,.122,-24.0,{cast:false,receive:false});
box(roomAccess,.055,.018,12.2,guideTwin,-32.1,.122,-12.2,{cast:false,receive:false});
box(roomAccess,.055,.018,13.2,guideFit,0,.122,-36.2,{cast:false,receive:false});
box(roomAccess,20.0,.018,.055,guideArena,22.8,.122,-24.0,{cast:false,receive:false});
box(roomAccess,.055,.018,12.2,guideArena,32.1,.122,-12.2,{cast:false,receive:false});

// V6.2 Access Architecture — wider covered promenades visually connect Hall and rooms.
const accessArchitectureV62=new THREE.Group();accessArchitectureV62.name='KOMO_ACCESS_ARCHITECTURE_V62';oneWorldLinks.add(accessArchitectureV62);
accessArchitectureV62.userData.realismDetail=true;
const accessRoofGlassV62=lowPower?MAT.smokedGlass:M.glass;
const accessRoofGlowV62=new THREE.MeshBasicMaterial({color:0xd9c49c,transparent:true,opacity:lowPower?.14:.24,depthWrite:false});
const accessUnitV62=new THREE.BoxGeometry(1,1,1);
const accessRoofItemsV62=[],accessBeamItemsV62=[],accessLightItemsV62=[];
function accessSpan(x,z,w,d,rot=0){
  accessRoofItemsV62.push({x,y:5.35,z,ry:rot,sx:w,sy:.10,sz:d});
  accessBeamItemsV62.push({x,y:5.19,z,ry:rot,sx:w,sy:.12,sz:.16});
  accessBeamItemsV62.push({x,y:5.19,z:z+(rot?0:d*.46),ry:rot,sx:w,sy:.12,sz:.16});
  accessLightItemsV62.push({x,y:5.16,z,ry:rot,sx:Math.max(1,w-.55),sy:.018,sz:.055});
}
// horizontal Twin / Arena promenades
accessSpan(-22.0,-24.0,25.8,6.85,0);
accessSpan(22.0,-24.0,25.8,6.85,0);
// lateral approach legs
accessSpan(-32.1,-13.0,23.0,6.85,Math.PI/2);
accessSpan(32.1,-13.0,23.0,6.85,Math.PI/2);
// central Fitness gallery
accessSpan(0,-35.5,16.8,9.1,Math.PI/2);
instancedStatic(accessArchitectureV62,accessUnitV62,accessRoofGlassV62,accessRoofItemsV62,'KOMO_ACCESS_ROOF_INST_V62');
instancedStatic(accessArchitectureV62,accessUnitV62,MAT.blackened,accessBeamItemsV62,'KOMO_ACCESS_BEAM_INST_V62');
instancedStatic(accessArchitectureV62,accessUnitV62,accessRoofGlowV62,accessLightItemsV62,'KOMO_ACCESS_LIGHT_INST_V62');

// Large threshold canopies reinforce the destination hierarchy without blocking sightlines.
[
  {x:-13,z:-24,rot:Math.PI/2,accent:guideTwin,label:'TWIN'},
  {x:0,z:-29.8,rot:0,accent:guideFit,label:'FITNESS'},
  {x:13,z:-24,rot:-Math.PI/2,accent:guideArena,label:'ARENA'}
].forEach((p,i)=>{
  const g=new THREE.Group();g.position.set(p.x,0,p.z);g.rotation.y=p.rot;accessArchitectureV62.add(g);
  box(g,7.10,.20,2.25,MAT.travertine,0,5.86,0,{cast:true});
  box(g,6.45,.030,1.72,p.accent,0,5.69,.05,{cast:false,receive:false});
  [-3.25,3.25].forEach(px=>box(g,.20,5.45,.54,MAT.limestone,px,3.02,0,{cast:true}));
  box(g,6.12,.040,.080,MAT.brass,0,5.52,.84,{cast:false,receive:false});
  plaque(g,p.label,'OPEN GALLERY',4.60,.58,0,5.02,.90,{dark:i!==1,titleSize:45});
});

// V6.0 Walkable Gallery Walls — same architecture, batched into a handful of draw calls.
const galleryWallsV59=new THREE.Group();galleryWallsV59.name='KOMO_GALLERY_WALLS_V59';oneWorldLinks.add(galleryWallsV59);
galleryWallsV59.userData.realismDetail=true;
const galleryGlass=lowPower?MAT.smokedGlass:M.glass;
const galleryAccentTwin=new THREE.MeshBasicMaterial({color:0xb9cfbf,transparent:true,opacity:lowPower?.18:.30,depthWrite:false});
const galleryAccentFit=new THREE.MeshBasicMaterial({color:0xd7b777,transparent:true,opacity:lowPower?.18:.30,depthWrite:false});
const galleryAccentArena=new THREE.MeshBasicMaterial({color:0xb9935c,transparent:true,opacity:lowPower?.18:.30,depthWrite:false});
const galleryBatches={base:[],brass:[],pier:[],glass:[],walnut:[],twin:[],fit:[],arena:[]};
function galleryPush(list,b,lx,ly,lz,sx,sy,sz){
  const c=Math.cos(b.rot),sn=Math.sin(b.rot);
  list.push({x:b.x+lx*c+lz*sn,y:ly,z:b.z-lx*sn+lz*c,ry:b.rot,sx,sy,sz});
}
function galleryBaySpec(x,z,rot=0,accent='fit',flip=false,timber=false){
  const b={x,z,rot};
  galleryPush(galleryBatches.base,b,0,.34,0,3.25,.56,.24);
  galleryPush(galleryBatches.brass,b,0,.66,flip?.08:-.08,3.10,.030,.10);
  galleryPush(galleryBatches.pier,b,-1.52,1.68,0,.16,2.75,.30);
  galleryPush(galleryBatches.pier,b,1.52,1.68,0,.16,2.75,.30);
  galleryPush(galleryBatches.glass,b,0,1.82,0,2.86,1.75,.035);
  galleryPush(galleryBatches[accent],b,0,2.68,.03,2.72,.020,.050);
  if(timber)galleryPush(galleryBatches.walnut,b,0,1.72,.045,2.42,1.25,.055);
}
[-27.65,-20.95].forEach((z,side)=>{
  [-28.8,-24.9,-21.0,-17.1,-13.2].forEach(x=>galleryBaySpec(x,z,0,'twin',!!side));
  [13.2,17.1,21.0,24.9,28.8].forEach(x=>galleryBaySpec(x,z,0,'arena',!side));
});
[-34.25,-29.75].forEach((x,side)=>[-18.8,-14.8,-10.8,-6.8].forEach(z=>galleryBaySpec(x,z,Math.PI/2,'twin',!!side)));
[29.75,34.25].forEach((x,side)=>[-18.8,-14.8,-10.8,-6.8].forEach(z=>galleryBaySpec(x,z,Math.PI/2,'arena',!side)));
[-4.55,4.55].forEach((x,side)=>[-40.8,-36.9,-33.0,-29.1].forEach((z,i)=>galleryBaySpec(x,z,Math.PI/2,'fit',!!side,i%2===0)));
const galleryUnitBox=new THREE.BoxGeometry(1,1,1);
instancedStatic(galleryWallsV59,galleryUnitBox,WALL.travertine,galleryBatches.base,'KOMO_GALLERY_BASE_INST_V60');
instancedStatic(galleryWallsV59,galleryUnitBox,WALL.brass,galleryBatches.brass,'KOMO_GALLERY_BRASS_INST_V60');
instancedStatic(galleryWallsV59,galleryUnitBox,WALL.mineral,galleryBatches.pier,'KOMO_GALLERY_PIER_INST_V60');
instancedStatic(galleryWallsV59,galleryUnitBox,galleryGlass,galleryBatches.glass,'KOMO_GALLERY_GLASS_INST_V60');
instancedStatic(galleryWallsV59,galleryUnitBox,WALL.walnut,galleryBatches.walnut,'KOMO_GALLERY_WALNUT_INST_V60');
instancedStatic(galleryWallsV59,galleryUnitBox,galleryAccentTwin,galleryBatches.twin,'KOMO_GALLERY_TWIN_GLOW_INST_V60');
instancedStatic(galleryWallsV59,galleryUnitBox,galleryAccentFit,galleryBatches.fit,'KOMO_GALLERY_FIT_GLOW_INST_V60');
instancedStatic(galleryWallsV59,galleryUnitBox,galleryAccentArena,galleryBatches.arena,'KOMO_GALLERY_ARENA_GLOW_INST_V60');

// V5.3 room thresholds — every destination has a visible physical way back to the Hall.
function roomReturnPortal(parent,{label='HALL',sub='WALK OUT · RETURN',x=0,z=10.65,rot=0,accent=0xd5b679,dark=true}={}){
  const g=new THREE.Group();g.name='KOMO_ROOM_RETURN_'+label.replace(/\W+/g,'_').toUpperCase()+'_V58';g.position.set(x,0,z);g.rotation.y=rot;parent.add(g);
  const accentMat=new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.48,depthWrite:false});
  box(g,.28,4.95,.62,MAT.travertine,-2.35,2.52,0,{cast:true});
  box(g,.28,4.95,.62,MAT.travertine,2.35,2.52,0,{cast:true});
  box(g,4.98,.24,.62,MAT.travertine,0,4.88,0,{cast:true});
  box(g,4.25,.026,.070,MAT.brass,0,4.62,-.34,{cast:false,receive:false});
  box(g,3.92,.018,.070,accentMat,0,.14,-.40,{cast:false,receive:false});
  plaque(g,label,sub,3.95,.60,0,4.13,-.36,{dark,titleSize:46});
  const ring=mesh(g,new THREE.RingGeometry(.34,.40,32),accentMat,0,.145,-.48,{cast:false,receive:false});
  ring.rotation.x=-Math.PI/2;
  return g;
}


// Functional Twin room.
twinRoom.position.set(-45,0,0);
roomReturnPortal(twinRoom,{label:'HALL',sub:'WALK OUT · CONTINUOUS CAMPUS',x:12.72,z:-2.10,rot:-Math.PI/2,accent:0xb9cfbf});
mesh(twinRoom,new THREE.CircleGeometry(13,96),M.sageDeep,0,.01,-2).rotation.x=-Math.PI/2;
mesh(twinRoom,new THREE.RingGeometry(7.8,8.0,96),M.bronze,0,.025,-2).rotation.x=-Math.PI/2;
box(twinRoom,22,7.8,.38,WALL.sage,0,4.0,-13.1);
// V5.9 Twin Data Wall — mineral frame + recessed dark data fields.
const twinWallV59=new THREE.Group();twinWallV59.name='KOMO_TWIN_WALLS_V59';twinRoom.add(twinWallV59);
const twinWallGlow=new THREE.MeshBasicMaterial({color:0xbfd8ca,transparent:true,opacity:lowPower?.22:.40,depthWrite:false});
[-8.25,-4.95,-1.65,1.65,4.95,8.25].forEach((x,i)=>{
  box(twinWallV59,2.86,4.55,.08,i===2||i===3?WALL.sageDeep:WALL.sage,x,3.20,-12.88,{cast:false,receive:true});
  box(twinWallV59,.035,4.42,.12,i%2?WALL.brass:twinWallGlow,x+1.49,3.20,-12.80,{cast:false,receive:false});
  if(i!==2&&i!==3)box(twinWallV59,2.20,.025,.08,twinWallGlow,x,5.20,-12.76,{cast:false,receive:false});
});
box(twinWallV59,20.2,.40,.22,WALL.travertine,0,.38,-12.72,{cast:false,receive:true});
box(twinWallV59,20.0,.040,.14,WALL.brass,0,.62,-12.60,{cast:false,receive:false});
plaque(twinRoom,'FUNCTIONAL TWIN','YOUR BODY · ACROSS TIME',7.8,1.55,0,7.25,-12.86,{dark:true,titleSize:84});
const twinV52=new THREE.Group();twinV52.name='KOMO_TWIN_ROOM_V52';twinRoom.add(twinV52);
const twinGlassV52=lowPower?MAT.smokedGlass:M.glass;
box(twinV52,20.6,.16,17.8,MAT.travertine,0,.085,-1.4,{cast:false,receive:true});
[-9.85,9.85].forEach(x=>{
  box(twinV52,.20,5.80,17.2,MAT.limestone,x,2.96,-1.5,{cast:true});
  box(twinV52,.035,4.85,15.8,twinGlassV52,x*.992,2.82,-1.5,{cast:false,receive:false});
});
box(twinV52,20.6,.22,1.00,MAT.limestone,0,5.82,-1.5,{cast:true});
[-7.4,-3.7,0,3.7,7.4].forEach(x=>box(twinV52,.045,.030,15.0,MAT.brass,x,5.63,-1.5,{cast:false,receive:false}));
[2.0,3.25,4.5].forEach((y,i)=>{
  const ring=mesh(twinV52,new THREE.TorusGeometry(3.0+i*.34,.035,10,64),i===1?M.twinGlow:MAT.brass,0,y,-4.2,{cast:false});
  ring.rotation.x=Math.PI/2;
});
[-1,1].forEach(side=>{
  for(let z=-7.3;z<=4.5;z+=3.0)box(twinV52,.055,3.65,.055,side<0?M.twinGlow:MAT.brass,side*8.15,2.15,z,{cast:false,receive:false});
});

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
roomReturnPortal(rehabRoom,{label:'HALL',sub:'WALK OUT · CONTINUOUS CAMPUS',z:11.10,accent:0xd7b777,dark:false});
box(rehabRoom,22,.24,24,M.stoneLight,0,.10,0);
box(rehabRoom,.36,7.6,24,WALL.ivory,-10.8,3.8,0);
box(rehabRoom,.36,7.6,24,WALL.ivory,10.8,3.8,0);
box(rehabRoom,22,7.6,.36,WALL.sage,0,3.8,-11.8);
// V5.9 Fitness Walls — warm acoustic timber, mirrors and limestone piers.
const fitnessWallsV59=new THREE.Group();fitnessWallsV59.name='KOMO_FITNESS_WALLS_V59';rehabRoom.add(fitnessWallsV59);
const fitnessWallGlow=new THREE.MeshBasicMaterial({color:0xe5c184,transparent:true,opacity:lowPower?.20:.34,depthWrite:false});
const fitnessWallMirror=lowPower?MAT.smokedGlass:M.glass;
[-1,1].forEach(side=>{
  const x=side*10.58;
  box(fitnessWallsV59,.10,.42,21.3,WALL.travertine,x,.36,0,{cast:false,receive:true});
  box(fitnessWallsV59,.075,.030,20.6,WALL.brass,x-side*.085,2.62,0,{cast:false,receive:false});
  [-8.2,-4.1,0,4.1,8.2].forEach((z,i)=>{
    if(i%2===0){
      box(fitnessWallsV59,.085,3.48,3.28,WALL.walnut,x-side*.095,3.28,z,{cast:false,receive:true});
      [-1.15,-.58,0,.58,1.15].forEach(dz=>box(fitnessWallsV59,.020,3.20,.045,WALL.black,x-side*.145,3.28,z+dz,{cast:false,receive:false}));
    }else{
      box(fitnessWallsV59,.070,3.48,3.28,fitnessWallMirror,x-side*.085,3.28,z,{cast:false,receive:false});
      box(fitnessWallsV59,.082,3.56,.035,WALL.brass,x-side*.120,3.28,z+1.66,{cast:false,receive:false});
    }
    const wash=box(fitnessWallsV59,.092,.020,2.72,fitnessWallGlow,x-side*.155,5.06,z,{cast:false,receive:false});
    wash.userData.phase=i*.76+side;wash.userData.dynamic=true;
  });
});
[-7.4,-3.7,0,3.7,7.4].forEach((x,i)=>{
  box(fitnessWallsV59,3.20,3.95,.08,i===2?WALL.sageDeep:WALL.sage,x,3.16,-11.58,{cast:false,receive:true});
  box(fitnessWallsV59,.035,3.80,.11,i%2?fitnessWallGlow:WALL.brass,x+1.65,3.16,-11.49,{cast:false,receive:false});
});
box(fitnessWallsV59,20.2,.38,.22,WALL.travertine,0,.36,-11.42,{cast:false,receive:true});
plaque(rehabRoom,'KŌMØ FITNESS CLUB','MOVE · TRAIN · PROGRESS',7.2,1.45,0,6.7,-11.55,{dark:true,titleSize:88});
[-5.3,0,5.3].forEach((x,i)=>{
  box(rehabRoom,4.0,.24,4.8,i===1?M.stoneDeep:M.stone,x,.12,-3.2);
  line(rehabRoom,3.5,.04,x,-3.2,M.bronze,.26);
});
plaque(rehabRoom,'01','BALANCE',3.2,.90,-5.3,4.6,-8.0,{dark:false,titleSize:74});
plaque(rehabRoom,'02','STRENGTH',3.2,.90,0,4.6,-8.0,{dark:true,titleSize:74});
plaque(rehabRoom,'03','CARDIO',3.2,.90,5.3,4.6,-8.0,{dark:false,titleSize:74});
glow(rehabRoom,0xf0d2a7,3.5,15,0,5.4,-6);
const fitnessV52=new THREE.Group();fitnessV52.name='KOMO_FITNESS_ROOM_V52';rehabRoom.add(fitnessV52);
box(fitnessV52,20.6,.040,22.6,FLOOR.promenade,0,.235,0,{cast:false,receive:true});
[-8.1,8.1].forEach(x=>line(fitnessV52,.045,20.8,x,0,MAT.brass,.274));
for(let z=-8.4;z<=7.8;z+=2.7)line(fitnessV52,15.2,.026,0,z,M.bronzeSoft,.276);
box(fitnessV52,18.8,4.65,.045,MAT.smokedGlass,0,2.75,10.9,{cast:false,receive:false});
box(fitnessV52,18.8,.055,.080,MAT.brass,0,5.10,10.82,{cast:false,receive:false});
for(let x=-8.4;x<=8.4;x+=2.1)box(fitnessV52,.065,.035,19.2,MAT.walnut,x,6.82,-.2,{cast:false,receive:false});
box(fitnessV52,5.1,.32,1.25,MAT.walnut,-6.7,.43,7.4,{cast:true});
box(fitnessV52,4.6,.15,.92,MAT.fabric,-6.7,.68,7.4,{cast:true});
plaque(fitnessV52,'TODAY','MOVE · TRAIN · RECOVER',4.5,.74,6.55,4.75,10.70,{dark:true,titleSize:48});


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
roomReturnPortal(arenaRoom,{label:'HALL',sub:'WALK OUT · CONTINUOUS CAMPUS',x:-12.72,z:-2.10,rot:Math.PI/2,accent:0xb9935c});
mesh(arenaRoom,new THREE.CircleGeometry(14.2,96),M.arena,0,.01,-2).rotation.x=-Math.PI/2;
mesh(arenaRoom,new THREE.RingGeometry(8.7,8.9,96),M.arenaGold,0,.025,-2).rotation.x=-Math.PI/2;
box(arenaRoom,22,7.8,.38,WALL.sageDeep,0,4.0,-13.1);
// V5.9 Arena Walls — blackened ribs, bronze reveals and luminous score bays.
const arenaWallsV59=new THREE.Group();arenaWallsV59.name='KOMO_ARENA_WALLS_V59';arenaRoom.add(arenaWallsV59);
const arenaWallGlow=new THREE.MeshBasicMaterial({color:0xd6a762,transparent:true,opacity:lowPower?.24:.44,depthWrite:false});
[-8.2,-5.45,-2.70,0,2.70,5.45,8.2].forEach((x,i)=>{
  box(arenaWallsV59,2.30,4.70,.10,i===3?WALL.sageDeep:WALL.black,x,3.28,-12.86,{cast:false,receive:true});
  box(arenaWallsV59,.060,4.80,.14,i%2?WALL.brass:arenaWallGlow,x+1.22,3.28,-12.76,{cast:false,receive:false});
  box(arenaWallsV59,1.82,.025,.12,arenaWallGlow,x,5.34,-12.72,{cast:false,receive:false});
});
box(arenaWallsV59,20.1,.42,.24,WALL.black,0,.40,-12.68,{cast:false,receive:true});
box(arenaWallsV59,19.7,.045,.16,WALL.brass,0,.65,-12.54,{cast:false,receive:false});
[-1,1].forEach(side=>{
  const x=side*10.45;
  [-7.2,-2.8,1.6,6.0].forEach((z,i)=>{
    box(arenaWallsV59,.10,3.85,3.45,WALL.black,x,3.10,z,{cast:false,receive:true});
    box(arenaWallsV59,.040,3.70,.045,WALL.brass,x-side*.075,3.10,z+1.76,{cast:false,receive:false});
    const wash=box(arenaWallsV59,.080,.022,2.75,arenaWallGlow,x-side*.130,4.96,z,{cast:false,receive:false});
    wash.userData.phase=i*.9+side;wash.userData.dynamic=true;
  });
});
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
const arenaV52=new THREE.Group();arenaV52.name='KOMO_ARENA_ROOM_V52';arenaRoom.add(arenaV52);
const arenaFloor=mesh(arenaV52,new THREE.CircleGeometry(10.9,96),new THREE.MeshStandardMaterial({color:0x202821,roughness:.46,metalness:.05}),0,.045,-2,{cast:false,receive:true});
arenaFloor.rotation.x=-Math.PI/2;
const arenaOuter=mesh(arenaV52,new THREE.RingGeometry(9.9,10.35,96),M.arenaGold,0,.072,-2,{cast:false,receive:false});arenaOuter.rotation.x=-Math.PI/2;
const startRing=mesh(arenaV52,new THREE.RingGeometry(2.05,2.18,64),MAT.brass,0,.085,2.2,{cast:false,receive:false});startRing.rotation.x=-Math.PI/2;
[-1,1].forEach(side=>{
  box(arenaV52,3.0,.34,13.6,MAT.blackened,side*10.65,.32,-1.7,{cast:true});
  box(arenaV52,2.45,.34,12.0,MAT.walnut,side*10.35,.68,-1.7,{cast:true});
  box(arenaV52,.055,4.60,12.8,MAT.brass,side*9.65,3.05,-1.7,{cast:false,receive:false});
});
box(arenaV52,15.8,2.45,.16,MAT.blackened,0,4.25,9.7,{cast:true});
plaque(arenaV52,'LIVE ARENA','DAILY CHALLENGES · SOCIAL',7.6,1.08,0,4.38,9.55,{dark:true,titleSize:70});

// V6.0 Realism Lite — baked-style wall washes: 4 draw calls, zero realtime lights.
function makeWallWashTexture(){
  const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');
  g.clearRect(0,0,128,256);
  const radial=g.createRadialGradient(64,26,2,64,82,126);
  radial.addColorStop(0,'rgba(255,255,255,.82)');
  radial.addColorStop(.22,'rgba(255,255,255,.34)');
  radial.addColorStop(.62,'rgba(255,255,255,.10)');
  radial.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=radial;g.fillRect(0,0,128,256);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.minFilter=THREE.LinearMipmapLinearFilter;tx.magFilter=THREE.LinearFilter;return tx;
}
const wallWashTextureV60=makeWallWashTexture();
function wallWashMaterial(color,opacity){
  return new THREE.MeshBasicMaterial({
    map:wallWashTextureV60,color,transparent:true,opacity,depthWrite:false,depthTest:true,
    blending:THREE.AdditiveBlending,side:THREE.DoubleSide
  });
}
const realismLightWashesV60=new THREE.Group();realismLightWashesV60.name='KOMO_REALISM_LIGHT_WASHES_V60';scene.add(realismLightWashesV60);
realismLightWashesV60.userData.realismDetail=true;
const washPlaneV60=new THREE.PlaneGeometry(1,1);
const hallWashItems=[];
[-1,1].forEach(side=>{
  const x=side*11.16,ry=side<0?Math.PI/2:-Math.PI/2;
  (lowPower?[-14,3]:[-20,-12,-4,4,11]).forEach(z=>hallWashItems.push({x,y:3.60,z,ry,sx:3.15,sy:4.65,sz:1}));
});
const twinWashItems=(lowPower?[-4.8,4.8]:[-7.0,-3.5,0,3.5,7.0]).map(x=>({x:x-45,y:3.55,z:-12.64,ry:0,sx:3.15,sy:4.55,sz:1}));
const fitWashItems=(lowPower?[-4.8,4.8]:[-7.2,-3.6,0,3.6,7.2]).map(x=>({x,y:3.50,z:-66.50,ry:0,sx:3.12,sy:4.45,sz:1}));
const arenaWashItems=(lowPower?[-4.8,4.8]:[-7.0,-3.5,0,3.5,7.0]).map(x=>({x:x+45,y:3.55,z:-12.64,ry:0,sx:3.15,sy:4.55,sz:1}));
const hallWashInst=instancedStatic(realismLightWashesV60,washPlaneV60,wallWashMaterial(0xffd7a0,lowPower?.10:.17),hallWashItems,'KOMO_HALL_WASH_INST_V60');
const twinWashInst=instancedStatic(realismLightWashesV60,washPlaneV60,wallWashMaterial(0xc8e0d2,lowPower?.10:.16),twinWashItems,'KOMO_TWIN_WASH_INST_V60');
const fitWashInst=instancedStatic(realismLightWashesV60,washPlaneV60,wallWashMaterial(0xf0c987,lowPower?.10:.17),fitWashItems,'KOMO_FITNESS_WASH_INST_V60');
const arenaWashInst=instancedStatic(realismLightWashesV60,washPlaneV60,wallWashMaterial(0xd9aa67,lowPower?.11:.19),arenaWashItems,'KOMO_ARENA_WASH_INST_V60');
[hallWashInst,twinWashInst,fitWashInst,arenaWashInst].forEach(m=>{m.renderOrder=2;m.frustumCulled=true});

// V6.3.1 Lighting Overhaul — perceived depth with zero additional realtime lights.
// Roles are deliberately separated so each layer can be culled independently.
const lightingV631=new THREE.Group();lightingV631.name='KOMO_LIGHTING_V631';scene.add(lightingV631);
const lightingStructuralV631=new THREE.Group();lightingStructuralV631.name='KOMO_LIGHTING_STRUCTURAL_V631';lightingV631.add(lightingStructuralV631);
const lightingDecorativeV631=new THREE.Group();lightingDecorativeV631.name='KOMO_LIGHTING_DECORATIVE_V631';lightingV631.add(lightingDecorativeV631);
const lightingDestinationV631=new THREE.Group();lightingDestinationV631.name='KOMO_LIGHTING_DESTINATION_V631';lightingV631.add(lightingDestinationV631);
living.lightingV631={root:lightingV631,structural:lightingStructuralV631,decorative:lightingDecorativeV631,destination:lightingDestinationV631};

function makeLightingGradientV631(mode='wall'){
  const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');
  g.clearRect(0,0,c.width,c.height);
  if(mode==='floor'){
    const gr=g.createRadialGradient(64,128,4,64,128,118);
    gr.addColorStop(0,'rgba(255,255,255,.68)');gr.addColorStop(.30,'rgba(255,255,255,.26)');
    gr.addColorStop(.72,'rgba(255,255,255,.055)');gr.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gr;
  }else if(mode==='ceiling'){
    const gr=g.createLinearGradient(0,0,0,256);
    gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.28,'rgba(255,255,255,.18)');
    gr.addColorStop(.52,'rgba(255,255,255,.62)');gr.addColorStop(.78,'rgba(255,255,255,.12)');
    gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;
  }else{
    const gr=g.createLinearGradient(0,0,0,256);
    gr.addColorStop(0,'rgba(255,255,255,.62)');gr.addColorStop(.22,'rgba(255,255,255,.34)');
    gr.addColorStop(.66,'rgba(255,255,255,.07)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;
  }
  g.fillRect(0,0,128,256);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.minFilter=THREE.LinearMipmapLinearFilter;tx.magFilter=THREE.LinearFilter;return tx;
}
const lightTexWallV631=makeLightingGradientV631('wall');
const lightTexFloorV631=makeLightingGradientV631('floor');
const lightTexCeilingV631=makeLightingGradientV631('ceiling');
function lightingMatV631(texture,color,opacity){
  return new THREE.MeshBasicMaterial({
    map:texture,color,transparent:true,opacity,depthWrite:false,depthTest:true,
    blending:THREE.AdditiveBlending,side:THREE.DoubleSide
  });
}
const lightPlaneV631=new THREE.PlaneGeometry(1,1);

// STRUCTURAL — skylight rhythm and restrained wall bounce make the nave feel taller/deeper.
const structuralWarmMatV631=lightingMatV631(lightTexCeilingV631,0xf3dcc0,lowPower?.055:.105);
const structuralBounceMatV631=lightingMatV631(lightTexWallV631,0xeed9bb,lowPower?.045:.085);
const structuralCeilingItemsV631=(lowPower?[-15,-3,9]:[-21,-15,-9,-3,3,9]).map(z=>({x:0,y:7.35,z,rx:Math.PI/2,sx:8.65,sy:5.15,sz:1}));
const structuralWallItemsV631=[];
[-1,1].forEach(side=>{
  const x=side*11.04,ry=side<0?Math.PI/2:-Math.PI/2;
  (lowPower?[-11,5]:[-19,-11,-3,5,11]).forEach(z=>structuralWallItemsV631.push({x,y:2.70,z,ry,sx:4.15,sy:4.55,sz:1}));
});
const structuralCeilingInstV631=instancedStatic(lightingStructuralV631,lightPlaneV631,structuralWarmMatV631,structuralCeilingItemsV631,'KOMO_STRUCTURAL_SKYLIGHT_INST_V631');
const structuralWallInstV631=instancedStatic(lightingStructuralV631,lightPlaneV631,structuralBounceMatV631,structuralWallItemsV631,'KOMO_STRUCTURAL_BOUNCE_INST_V631');

// DECORATIVE — armillary focus + differentiated room ambience.
const decorativeHallV631=new THREE.Group();decorativeHallV631.name='KOMO_LIGHTING_DECORATIVE_HALL_V631';lightingDecorativeV631.add(decorativeHallV631);
const decorativeTwinV631=new THREE.Group();decorativeTwinV631.name='KOMO_LIGHTING_DECORATIVE_TWIN_V631';lightingDecorativeV631.add(decorativeTwinV631);
const decorativeFitV631=new THREE.Group();decorativeFitV631.name='KOMO_LIGHTING_DECORATIVE_FITNESS_V631';lightingDecorativeV631.add(decorativeFitV631);
const decorativeArenaV631=new THREE.Group();decorativeArenaV631.name='KOMO_LIGHTING_DECORATIVE_ARENA_V631';lightingDecorativeV631.add(decorativeArenaV631);

const armillaryBounceMatV631=lightingMatV631(lightTexFloorV631,0xe4c28c,lowPower?.07:.15);
const armillaryBounceV631=mesh(decorativeHallV631,new THREE.PlaneGeometry(8.8,8.8),armillaryBounceMatV631,0,.445,-8.6,{cast:false,receive:false});
armillaryBounceV631.rotation.x=-Math.PI/2;armillaryBounceV631.renderOrder=3;

const twinKeyMatV631=lightingMatV631(lightTexWallV631,0xc5dbcf,lowPower?.08:.16);
const fitKeyMatV631=lightingMatV631(lightTexWallV631,0xe8c997,lowPower?.075:.15);
const arenaKeyMatV631=lightingMatV631(lightTexWallV631,0xc9975d,lowPower?.07:.16);
const twinKeyV631=mesh(decorativeTwinV631,new THREE.PlaneGeometry(15.6,5.5),twinKeyMatV631,-45,3.30,-12.60,{cast:false,receive:false});
const fitKeyV631=mesh(decorativeFitV631,new THREE.PlaneGeometry(16.2,5.4),fitKeyMatV631,0,3.25,-66.55,{cast:false,receive:false});
const arenaKeyV631=mesh(decorativeArenaV631,new THREE.PlaneGeometry(15.6,5.5),arenaKeyMatV631,45,3.30,-12.60,{cast:false,receive:false});
[twinKeyV631,fitKeyV631,arenaKeyV631].forEach(m=>m.renderOrder=3);

// Subtle floor pools distinguish room atmosphere without blue-neon/game lighting.
function floorPoolV631(parent,x,y,z,w,d,color,opacity){
  const mat=lightingMatV631(lightTexFloorV631,color,lowPower?opacity*.55:opacity);
  const p=mesh(parent,new THREE.PlaneGeometry(w,d),mat,x,y,z,{cast:false,receive:false});
  p.rotation.x=-Math.PI/2;p.renderOrder=3;return p;
}
floorPoolV631(decorativeTwinV631,-45,.18,-4.2,12.0,10.0,0xbfd8ca,.115);
floorPoolV631(decorativeFitV631,0,.29,-58.0,13.5,11.0,0xe5c184,.105);
floorPoolV631(decorativeArenaV631,45,.10,-4.0,12.5,10.5,0xc58f55,.12);

// DESTINATION — readable light carpets guide walking without adding lamps.
const destinationCoolMatV631=lightingMatV631(lightTexFloorV631,0xbfd7ca,lowPower?.075:.15);
const destinationFitMatV631=lightingMatV631(lightTexFloorV631,0xe3c18a,lowPower?.075:.15);
const destinationArenaMatV631=lightingMatV631(lightTexFloorV631,0xc89258,lowPower?.075:.16);
[
  [-6.8,destinationCoolMatV631],
  [0,destinationFitMatV631],
  [6.8,destinationArenaMatV631]
].forEach(([x,mat],i)=>{
  const carpet=mesh(lightingDestinationV631,new THREE.PlaneGeometry(4.7,9.5),mat,x,.446,-25.2,{cast:false,receive:false});
  carpet.rotation.x=-Math.PI/2;carpet.renderOrder=4;carpet.userData.phase=i*.8;
});
const destWallMatsV631=[
  lightingMatV631(lightTexWallV631,0xc4d9cc,lowPower?.08:.17),
  lightingMatV631(lightTexWallV631,0xe4c28d,lowPower?.08:.17),
  lightingMatV631(lightTexWallV631,0xc7955b,lowPower?.08:.18)
];
[-6.8,0,6.8].forEach((x,i)=>{
  const p=mesh(lightingDestinationV631,new THREE.PlaneGeometry(4.45,5.35),destWallMatsV631[i],x,3.05,-29.05,{cast:false,receive:false});
  p.renderOrder=3;p.userData.phase=i*.7;
});

function applyLightingV631Profile(state='day'){
  const L=living.lightingV631;if(!L)return;
  const factors={
    day:{structural:1,decorative:.92,destination:.95},
    morning:{structural:.92,decorative:1.02,destination:1.02},
    golden:{structural:.80,decorative:1.12,destination:1.08},
    evening:{structural:.62,decorative:1.18,destination:1.16}
  }[state]||{structural:1,decorative:1,destination:1};
  structuralWarmMatV631.opacity=(lowPower?.055:.105)*factors.structural;
  structuralBounceMatV631.opacity=(lowPower?.045:.085)*factors.structural;
  armillaryBounceMatV631.opacity=(lowPower?.07:.15)*factors.decorative;
  twinKeyMatV631.opacity=(lowPower?.08:.16)*factors.decorative;
  fitKeyMatV631.opacity=(lowPower?.075:.15)*factors.decorative;
  arenaKeyMatV631.opacity=(lowPower?.07:.16)*factors.decorative;
  destinationCoolMatV631.opacity=(lowPower?.075:.15)*factors.destination;
  destinationFitMatV631.opacity=(lowPower?.075:.15)*factors.destination;
  destinationArenaMatV631.opacity=(lowPower?.075:.16)*factors.destination;
  destWallMatsV631.forEach((m,i)=>m.opacity=(lowPower?.08:(i===2?.18:.17))*factors.destination);
}
applyLightingV631Profile(living.daylight);

// V5.6 Open Rooms — Twin, Fitness and Arena remain visually open at all times.
// The interior pass relies mostly on emissive geometry rather than extra realtime lights.
const roomPremium=new THREE.Group();roomPremium.name='KOMO_OPEN_ROOMS_V56';scene.add(roomPremium);
const roomWarmStrip=new THREE.MeshBasicMaterial({color:0xf2d39d,transparent:true,opacity:lowPower?.46:.72,depthWrite:false});
const roomCoolStrip=new THREE.MeshBasicMaterial({color:0xc9ddd0,transparent:true,opacity:lowPower?.42:.66,depthWrite:false});
const roomArenaStrip=new THREE.MeshBasicMaterial({color:0xd6ad70,transparent:true,opacity:lowPower?.48:.76,depthWrite:false});
const roomScreen=new THREE.MeshBasicMaterial({color:0x20372c,transparent:true,opacity:.94,depthWrite:false});
const roomMirror=lowPower?MAT.smokedGlass:M.glass;

function ceilingRail(parent,x,z,w=3.0,accent=roomWarmStrip){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  box(g,w,.035,.10,MAT.blackened,0,6.55,0,{cast:false,receive:false});
  box(g,w-.18,.018,.045,accent,0,6.515,.035,{cast:false,receive:false});
  return g;
}
function luxeBench(parent,x,z,w=2.2,rot=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;parent.add(g);
  box(g,w,.17,.58,MAT.walnut,0,.47,0,{cast:true});
  box(g,w-.12,.11,.50,MAT.leatherDark,0,.62,0,{cast:true});
  [-w*.36,w*.36].forEach(px=>box(g,.09,.43,.42,MAT.brass,px,.23,0,{cast:true}));
  return g;
}
function dataTotem(parent,x,z,title,sub,accent=roomCoolStrip){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  box(g,1.55,.24,1.18,MAT.travertine,0,.12,0,{cast:true});
  box(g,1.22,3.25,.16,MAT.blackened,0,1.92,0,{cast:true});
  box(g,1.05,2.72,.025,accent,0,1.92,.095,{cast:false,receive:false});
  plaque(g,title,sub,1.12,.60,0,2.23,.12,{dark:true,titleSize:title.length>10?34:42});
  return g;
}

// FUNCTIONAL TWIN — brighter lab, longitudinal data and an open glass pavilion.
const twinPremium=new THREE.Group();twinPremium.name='KOMO_TWIN_PREMIUM_V56';twinRoom.add(twinPremium);
[-7.2,-3.6,0,3.6,7.2].forEach((x,i)=>ceilingRail(twinPremium,x,-2.0,2.55,i%2?roomCoolStrip:roomWarmStrip));
box(twinPremium,18.2,4.85,.045,roomMirror,0,2.80,-10.55,{cast:false,receive:false});
box(twinPremium,18.4,.055,.08,MAT.brass,0,5.28,-10.46,{cast:false,receive:false});
[-7.2,-3.6,3.6,7.2].forEach((x,i)=>dataTotem(twinPremium,x,4.8,i<2?'TODAY':'TREND',i%2?'MOTION AGE':'MOTION SCORE',i%2?roomCoolStrip:roomWarmStrip));
luxeBench(twinPremium,-6.3,7.0,3.0,0);luxeBench(twinPremium,6.3,7.0,3.0,0);
[-8.55,8.55].forEach(side=>{
  box(twinPremium,.08,4.15,12.2,MAT.brass,side,2.55,-1.5,{cast:false,receive:false});
  for(let z=-6.5;z<=3.4;z+=2.48)box(twinPremium,.035,3.15,.035,roomCoolStrip,side*.995,2.55,z,{cast:false,receive:false});
});
const twinCeilingHalo=mesh(twinPremium,new THREE.RingGeometry(4.3,4.37,72),roomCoolStrip,0,6.38,-4.2,{cast:false,receive:false});twinCeilingHalo.rotation.x=Math.PI/2;

// FITNESS CLUB — open boutique training studio with real equipment silhouettes.
const fitPremium=new THREE.Group();fitPremium.name='KOMO_FITNESS_PREMIUM_V56';rehabRoom.add(fitPremium);
[-7.5,-3.75,0,3.75,7.5].forEach((x,i)=>ceilingRail(fitPremium,x,-.8,2.75,i===2?roomWarmStrip:roomCoolStrip));
box(fitPremium,19.0,4.55,.04,roomMirror,0,2.85,-10.25,{cast:false,receive:false});
box(fitPremium,19.2,.055,.09,MAT.brass,0,5.17,-10.15,{cast:false,receive:false});
plaque(fitPremium,'OPEN STUDIO','TRAIN · MOVE · RECOVER',6.2,.72,0,5.48,-10.08,{dark:true,titleSize:56});

// Strength bay.
const strengthBay=new THREE.Group();strengthBay.position.set(-6.45,0,-2.8);fitPremium.add(strengthBay);
[-1.0,1.0].forEach(x=>box(strengthBay,.11,2.35,.11,MAT.blackened,x,1.42,0,{cast:true}));
box(strengthBay,2.15,.10,.10,MAT.brass,0,2.55,0,{cast:true});
box(strengthBay,1.75,.12,.54,MAT.leatherDark,0,.58,.68,{cast:true});
box(strengthBay,.78,.10,.58,MAT.blackened,0,.36,.68,{cast:true});
const bar=box(strengthBay,2.62,.055,.055,MAT.brass,0,1.72,-.05,{cast:true});
[-1.18,1.18].forEach(x=>{cyl(strengthBay,.20,.20,.075,MAT.blackened,x,1.72,-.05,18,{cast:true}).rotation.z=Math.PI/2});
plaque(strengthBay,'STRENGTH','CONTROL · POWER',2.6,.54,0,3.08,.02,{dark:true,titleSize:38});

// Balance bay.
const balanceBay=new THREE.Group();balanceBay.position.set(-2.15,0,-2.8);fitPremium.add(balanceBay);
const bosu=mesh(balanceBay,new THREE.SphereGeometry(.58,28,14,0,Math.PI*2,0,Math.PI/2),M.twinGlow,0,.27,0,{cast:true});bosu.scale.y=.46;
cyl(balanceBay,.66,.66,.08,MAT.blackened,0,.08,0,32,{cast:true});
[-.72,.72].forEach(x=>box(balanceBay,.12,1.55,.12,MAT.brass,x,.88,.45,{cast:true}));
box(balanceBay,1.55,.055,.055,MAT.brass,0,1.63,.45,{cast:true});
plaque(balanceBay,'BALANCE','STABILITY · CONTROL',2.55,.54,0,3.08,.02,{dark:false,titleSize:38});

// Cardio bay.
const cardioBay=new THREE.Group();cardioBay.position.set(2.15,0,-2.8);fitPremium.add(cardioBay);
box(cardioBay,1.25,.18,2.25,MAT.blackened,0,.22,0,{cast:true});
box(cardioBay,1.08,.045,2.00,MAT.leatherDark,0,.33,0,{cast:true});
[-.50,.50].forEach(x=>box(cardioBay,.08,1.22,.08,MAT.brass,x,.92,-.78,{cast:true}));
box(cardioBay,1.10,.08,.08,MAT.brass,0,1.50,-.78,{cast:true});
box(cardioBay,.70,.50,.12,roomScreen,0,1.75,-.78,{cast:false,receive:false});
plaque(cardioBay,'CARDIO','CAPACITY · FLOW',2.55,.54,0,3.08,.02,{dark:true,titleSize:38});

// Recovery bay.
const recoveryBay=new THREE.Group();recoveryBay.position.set(6.45,0,-2.8);fitPremium.add(recoveryBay);
luxeBench(recoveryBay,0,.15,2.55,0);
[-.64,0,.64].forEach((x,i)=>{const roll=cyl(recoveryBay,.16,.16,.72,i===1?MAT.fabricLight:MAT.charcoal,x,.92,.08,18,{cast:true});roll.rotation.z=Math.PI/2});
box(recoveryBay,1.65,.62,.55,MAT.travertine,0,.34,-.92,{cast:true});
plaque(recoveryBay,'RECOVERY','RESET · BREATHE',2.55,.54,0,3.08,.02,{dark:false,titleSize:38});

// Open lounge / hydration bar so the room reads as a club, not a test lab.
luxeBench(fitPremium,-5.8,7.1,3.1,0);luxeBench(fitPremium,5.8,7.1,3.1,0);
box(fitPremium,3.8,.88,.72,MAT.walnut,0,.47,8.15,{cast:true});
box(fitPremium,3.95,.06,.86,MAT.brass,0,.94,8.15);
[-.72,0,.72].forEach(x=>cyl(fitPremium,.10,.12,.42,MAT.charcoal,x,1.17,8.15,14,{cast:true}));
plaque(fitPremium,'HYDRATE','PAUSE · RECOVER',3.0,.50,0,1.66,8.53,{dark:true,titleSize:38});

// ARENA — more spectacular, with spectator benches, light canopy and result wall.
const arenaPremium=new THREE.Group();arenaPremium.name='KOMO_ARENA_PREMIUM_V56';arenaRoom.add(arenaPremium);
[-7.2,-3.6,0,3.6,7.2].forEach((x,i)=>ceilingRail(arenaPremium,x,-2.0,2.75,i===2?roomArenaStrip:roomWarmStrip));
[-1,1].forEach(side=>{
  [0,1,2].forEach(row=>{
    const z=3.8+row*1.18;
    const g=new THREE.Group();g.position.set(side*8.45,0,z);g.rotation.y=side<0?Math.PI/2:-Math.PI/2;arenaPremium.add(g);
    box(g,5.4,.32,.72,row===1?MAT.walnut:MAT.blackened,0,.32+row*.22,0,{cast:true});
    box(g,5.1,.10,.58,MAT.leatherDark,0,.55+row*.22,0,{cast:true});
  });
});
box(arenaPremium,9.2,2.65,.18,MAT.blackened,0,4.0,-10.15,{cast:true});
plaque(arenaPremium,'LIVE SCORE','CHALLENGES · COMMUNITY · XP',8.2,1.20,0,4.35,-10.02,{dark:true,titleSize:68});
[-3.2,0,3.2].forEach((x,i)=>{
  plaque(arenaPremium,i===0?'BALANCE':i===1?'SQUAT':'CAPACITY',i===0?'60 S':i===1?'10 REPS':'STAND UP',2.35,.62,x,2.85,-9.90,{dark:i!==1,titleSize:38});
});
const arenaCanopy=mesh(arenaPremium,new THREE.RingGeometry(5.2,5.30,84),roomArenaStrip,0,6.32,-2,{cast:false,receive:false});arenaCanopy.rotation.x=Math.PI/2;
const arenaCanopyInner=mesh(arenaPremium,new THREE.RingGeometry(3.55,3.62,72),roomWarmStrip,0,6.28,-2,{cast:false,receive:false});arenaCanopyInner.rotation.x=Math.PI/2;

// Quiet ambient activity makes the rooms feel occupied even before multiplayer peers arrive.
portalActor(twinPremium,-7.0,1.8,0xb9cfbf,3.1).scale.setScalar(.94);
portalActor(fitPremium,-4.4,2.8,0xd7b777,3.8).scale.setScalar(.96);
portalActor(fitPremium,4.2,5.2,0xb9cfbf,4.6).scale.setScalar(.92);
portalActor(arenaPremium,-6.1,1.7,0xb9935c,5.2).scale.setScalar(.95);
portalActor(arenaPremium,6.0,.6,0xd7b777,5.9).scale.setScalar(.92);

// Subtle status bars — visual rhythm, not medical data.
const fitnessStatusBars=[];
[-5.4,-2.7,0,2.7,5.4].forEach((x,i)=>{
  const b=box(fitPremium,1.65,.025,.08,i%2?roomCoolStrip:roomWarmStrip,x,5.64,10.58,{cast:false,receive:false});
  b.userData.phase=i*.72;fitnessStatusBars.push(b);
});


// Runtime state.
const player=new THREE.Vector3(0,0,14.55);
const velocity=new THREE.Vector3();
let playerLevel=0;
let cameraMode='third';
let thirdPersonDistance=lowPower?3.55:4.05;
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
const KEYBIND_KEY='komo_world_keybinds_v1';
const KEY_DEFAULTS={
  forward:['KeyW','KeyZ','ArrowUp'],
  back:['KeyS','ArrowDown'],
  left:['KeyA','KeyQ','ArrowLeft'],
  right:['KeyD','ArrowRight'],
  sprint:['ShiftLeft','ShiftRight'],
  action:['KeyE'],
  camera:['KeyV'],
  guide:['KeyG'],
  menu:['KeyM']
};
function loadKeybinds(){
  try{
    const raw=JSON.parse(localStorage.getItem(KEYBIND_KEY)||'{}');
    const out={};
    for(const [k,v] of Object.entries(KEY_DEFAULTS))out[k]=Array.isArray(raw[k])&&raw[k].length?raw[k].slice(0,3):v.slice();
    return out;
  }catch{return Object.fromEntries(Object.entries(KEY_DEFAULTS).map(([k,v])=>[k,v.slice()]))}
}
const keybinds=loadKeybinds();
function saveKeybinds(){try{localStorage.setItem(KEYBIND_KEY,JSON.stringify(keybinds))}catch{}}
function keyHas(action,code){return keybinds[action]?.includes(code)}
function isPressed(action){return (keybinds[action]||[]).some(code=>keys.has(code))}
function keyLabel(code){
  const map={ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',ShiftLeft:'SHIFT',ShiftRight:'SHIFT',Space:'SPACE',Escape:'ESC'};
  if(map[code])return map[code];
  return String(code||'').replace(/^Key/,'').replace(/^Digit/,'');
}
function keybindHtml(){
  const labels={
    forward:locale==='fr'?'AVANCER':'FORWARD',
    back:locale==='fr'?'RECULER':'BACK',
    left:locale==='fr'?'GAUCHE':'LEFT',
    right:locale==='fr'?'DROITE':'RIGHT',
    sprint:locale==='fr'?'BOOST (COURSE)':'BOOST (RUN)',
    action:'ACTION',camera:'CAMERA',guide:'GUIDE',menu:'MENU'
  };
  return `<div class="keybind-grid">${Object.keys(labels).map(k=>`<div class="keybind-row"><span>${labels[k]}</span><button type="button" data-keybind="${k}">${keybinds[k].map(keyLabel).join(' / ')}</button></div>`).join('')}</div><div class="keybind-note">${locale==='fr'?'Clique sur une commande puis appuie sur la touche à utiliser. Les réglages sont sauvegardés sur cet appareil.':'Click a command, then press the key you want to use. Settings are saved on this device.'}</div>`;
}
function bindKeybindPanel(){
  panelBody.querySelectorAll('[data-keybind]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      panelBody.querySelectorAll('[data-keybind]').forEach(b=>b.classList.remove('listening'));
      btn.classList.add('listening');btn.textContent=locale==='fr'?'APPUYEZ…':'PRESS KEY…';
      const action=btn.dataset.keybind;
      const handler=e=>{
        e.preventDefault();e.stopPropagation();
        if(e.code==='Escape'){showControlsPanel();return}
        keybinds[action]=[e.code];saveKeybinds();showControlsPanel();
      };
      window.addEventListener('keydown',handler,{once:true,capture:true});
    });
  });
}
function resetKeybinds(){
  for(const [k,v] of Object.entries(KEY_DEFAULTS))keybinds[k]=v.slice();
  saveKeybinds();showControlsPanel();notify(locale==='fr'?'COMMANDES RÉINITIALISÉES':'CONTROLS RESET');
}
function showControlsPanel(){
  openPanel(locale==='fr'?'COMMANDES':'CONTROLS',locale==='fr'?'Personnalisez les touches de KŌMØ World.':'Customise KŌMØ World controls.',keybindHtml(),[
    {label:locale==='fr'?'RÉINITIALISER':'RESET DEFAULTS',onClick:resetKeybinds},
    {label:locale==='fr'?'FERMER':'CLOSE',primary:true,onClick:closePanel}
  ]);bindKeybindPanel();
}


const interactions=[
  {id:'desk',x:-7.3,z:4.0,r:3.6,title:()=>copy[locale].deskTitle,desc:()=>copy[locale].deskCopy,action:showDesk},
  {id:'health',x:-5.25,z:10.55,r:2.7,title:()=>locale==='fr'?'Votre santé · mouvement':'Your health · movement',desc:()=>locale==='fr'?'Comprendre les 5 domaines en un coup d’œil':'Understand the 5 domains at a glance',action:showHealthOverview},
  {id:'twin',x:-10.75,z:-24.0,r:3.4,title:()=>copy[locale].twinTitle,desc:()=>locale==='fr'?'Galerie ouverte · marcher vers le Twin':'Open gallery · walk to Twin',action:enterTwin},
  {id:'rehab',x:0,z:-28.0,r:3.4,title:()=>copy[locale].rehabTitle,desc:()=>locale==='fr'?'Tunnel ouvert · marcher vers Fitness':'Open tunnel · walk to Fitness',action:enterRehab},
  {id:'arena',x:10.75,z:-24.0,r:3.4,title:()=>copy[locale].arenaTitle,desc:()=>locale==='fr'?'Galerie ouverte · marcher vers Arena':'Open gallery · walk to Arena',action:enterArena},
  {id:'library',x:-10.7,z:-10,r:3.2,title:()=>copy[locale].libraryTitle,desc:()=>copy[locale].libraryCopy,action:showLibrary},
  {id:'talks',x:10.7,z:-10,r:3.2,title:()=>copy[locale].talksTitle,desc:()=>copy[locale].talksCopy,action:showTalks},
  {id:'life',x:8.6,z:2.6,r:3.4,title:()=>copy[locale].storeTitle,desc:()=>copy[locale].storeCopy,action:showLifeStore},
  {id:'journey',x:4.8,z:8.5,r:3.0,title:()=>locale==='fr'?'World Journey':'World Journey',desc:()=>locale==='fr'?'Voir votre niveau, vos XP et les prochaines étapes.':'View your level, XP and next steps.',action:showJourneyPanel},
  {id:'fountain',x:0,z:68.2,r:5.4,title:()=>locale==='fr'?'Grande Fontaine · KŌMØ District':'Grand Fountain · KŌMØ District',desc:()=>locale==='fr'?'Découvrir le campus extérieur · +15 XP':'Discover the exterior campus · +15 XP',action:showFountain},
  {id:'life_strap',x:7.10,z:6.45,r:1.35,title:()=> 'Motion Strap',desc:()=>locale==='fr'?'KŌMØ Life · objet mouvement':'KŌMØ Life · movement object',action:()=>showLifeItem('strap')},
  {id:'life_bottle',x:9.80,z:6.45,r:1.35,title:()=> 'KŌMØ Bottle',desc:()=>locale==='fr'?'KŌMØ Life · hydratation':'KŌMØ Life · hydration',action:()=>showLifeItem('bottle')},
  {id:'life_recovery',x:7.10,z:1.25,r:1.35,title:()=> 'Recovery Roll',desc:()=>locale==='fr'?'KŌMØ Life · récupération':'KŌMØ Life · recovery',action:()=>showLifeItem('recovery')},
  {id:'life_travel',x:9.80,z:1.25,r:1.35,title:()=> 'Travel Kit',desc:()=>locale==='fr'?'KŌMØ Life · Riviera':'KŌMØ Life · Riviera',action:()=>showLifeItem('travel')},
  {id:'life_jacket',x:10.15,z:2.25,r:1.30,title:()=> 'KŌMØ Jacket',desc:()=>locale==='fr'?'KŌMØ Life · textile':'KŌMØ Life · apparel',action:()=>showLifeItem('jacket')},
  {id:'life_band',x:10.15,z:3.85,r:1.30,title:()=> 'Mobility Band',desc:()=>locale==='fr'?'KŌMØ Life · entraînement':'KŌMØ Life · training',action:()=>showLifeItem('band')}
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
  if(journeyLevelEl)journeyLevelEl.textContent=String(level.level).padStart(2,'0');
  if(journeyTitleEl)journeyTitleEl.textContent=level.title[locale];
  if(journeyXpEl)journeyXpEl.textContent=journey.xp;
  if(journeyProgressEl)journeyProgressEl.style.width=pct+'%';
  if(journeyNextEl)journeyNextEl.textContent=nextMission?(nextMission.title[locale]+' · +'+nextMission.xp+' XP'):(locale==='fr'?'Journey complété':'Journey complete');
  if(journeyMenuLevel)journeyMenuLevel.textContent=String(level.level).padStart(2,'0');
  if(journeyMenuXp)journeyMenuXp.textContent=journey.xp+' XP';
  if(journeyTitleMenu)journeyTitleMenu.textContent=level.title[locale];
  if(journeyXpMenu)journeyXpMenu.textContent=journey.xp+' XP';
  if(journeyMenuProgress)journeyMenuProgress.style.width=pct+'%';
  if(journeyMenuNext)journeyMenuNext.textContent=nextMission?(locale==='fr'?'Prochaine étape · ':'Next · ')+nextMission.title[locale]:(locale==='fr'?'Parcours actuel complété':'Current journey complete');
  if(journeyLevelLadder)journeyLevelLadder.innerHTML=JOURNEY_LEVELS.map(l=>`
    <div class="journey-step ${l.level<level.level?'done':''} ${l.level===level.level?'current':''}">
      <span>${String(l.level).padStart(2,'0')}</span><b>${l.title[locale]}</b><small>${l.desc[locale]}</small>
    </div>`).join('');
  if(journeyBadgesEl)journeyBadgesEl.innerHTML=JOURNEY_BADGES.map(b=>`<span class="journey-badge ${b.test()?'unlocked':''}">${b.test()?'✓ ':''}${b.label[locale]}</span>`).join('');
  if(journeyMissionsEl)journeyMissionsEl.innerHTML=JOURNEY_MISSIONS.map((m,i)=>`
    <div class="journey-mission ${journey.done[m.id]?'done':''}">
      <i>${journey.done[m.id]?'✓':String(i+1).padStart(2,'0')}</i>
      <span><b>${m.title[locale]}</b><small>${m.sub[locale]}</small></span>
      <small>+${m.xp} XP</small>
    </div>`).join('');
}
function completeJourney(id,{silent=false}={}){
  const mission=JOURNEY_MISSIONS.find(m=>m.id===id);if(!mission||journey.done[id])return false;
  const before=journeyLevelForXp(journey.xp);
  journey.done[id]=Date.now();journey.xp+=mission.xp;saveJourney();updateJourneyUI();if(typeof syncNpcMissionByLink==='function')syncNpcMissionByLink('journey',id);
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

// V5.4 Daily Health bridge — normalised input for Pulse / Apple Health / Health Connect / wearables.
const DAILY_HEALTH_KEY='komo_world_daily_health_v1';
const HEALTH_BRIDGE_CHANNEL='komo-health-v1';
function loadDailyHealth(){try{return JSON.parse(localStorage.getItem(DAILY_HEALTH_KEY)||'null')}catch{return null}}
let dailyHealth=loadDailyHealth();
function normaliseDailyHealth(input={}){
  const n=v=>Number.isFinite(Number(v))?Number(v):null;
  return {date:String(input.date||localDateKey()),source:String(input.source||'CONNECTED').slice(0,32),steps:n(input.steps),active_minutes:n(input.active_minutes),sleep_hours:n(input.sleep_hours),resting_hr:n(input.resting_hr),hrv_ms:n(input.hrv_ms),pain:n(input.pain),recovery:n(input.recovery),updated_at:Date.now()};
}
function ingestDailyHealth(input){
  dailyHealth=normaliseDailyHealth(input);try{localStorage.setItem(DAILY_HEALTH_KEY,JSON.stringify(dailyHealth))}catch{}
  updateHealthHUD();window.dispatchEvent(new CustomEvent('komo:daily-health',{detail:dailyHealth}));return dailyHealth;
}
function dailyHealthHtml(){
  const h=dailyHealth;
  if(!h)return '<div class="priority-card"><b>'+(locale==='fr'?'DAILY HEALTH · NON CONNECTÉ':'DAILY HEALTH · NOT CONNECTED')+'</b>'+(locale==='fr'?'World est prêt à recevoir les données quotidiennes depuis Pulse, Apple Health, Health Connect ou une source wearable normalisée.':'World is ready to receive daily data from Pulse, Apple Health, Health Connect or a normalised wearable source.')+'</div>';
  const v=(x,s='')=>x==null?'—':x+s;
  return '<div class="results-section-title"><span>DAILY HEALTH</span><b>'+h.source+' · '+h.date+'</b></div><div class="panel-grid"><div><span>STEPS</span><b>'+v(h.steps)+'</b></div><div><span>ACTIVE</span><b>'+v(h.active_minutes,' min')+'</b></div><div><span>SLEEP</span><b>'+v(h.sleep_hours,' h')+'</b></div><div><span>REST HR</span><b>'+v(h.resting_hr,' bpm')+'</b></div><div><span>HRV</span><b>'+v(h.hrv_ms,' ms')+'</b></div><div><span>RECOVERY</span><b>'+v(h.recovery,'%')+'</b></div></div>';
}
function showDailyHealthConnect(){
  const status=dailyHealth?(locale==='fr'?'CONNECTÉ · '+dailyHealth.source:'CONNECTED · '+dailyHealth.source):(locale==='fr'?'NON CONNECTÉ':'NOT CONNECTED');
  const html='<div class="metric-hero"><div><span>DAILY HEALTH</span><strong>'+status+'</strong></div><div><span>DATE</span><strong>'+(dailyHealth?.date||localDateKey())+'</strong></div></div>'+dailyHealthHtml()+'<div class="panel-grid"><div><span>iOS</span><b>Apple Health → Pulse</b></div><div><span>ANDROID</span><b>Health Connect → Pulse</b></div><div><span>WEARABLES</span><b>API → Pulse</b></div><div><span>WORLD</span><b>Health Bridge</b></div></div><div class="data-note">'+(locale==='fr'?'Le navigateur ne lit pas directement Apple Health. La connexion réelle passera par Pulse/app mobile ou un connecteur autorisé, puis World recevra uniquement les champs normalisés nécessaires.':'The browser cannot read Apple Health directly. The real connection will go through Pulse/mobile app or an authorised connector; World receives only the normalised fields it needs.')+'</div>';
  openPanel('DAILY HEALTH',locale==='fr'?'Connecter vos données quotidiennes.':'Connect your daily data.',html,[{label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel},{label:'PULSE',primary:true,onClick:()=>{location.href='/pulse/'}}]);
}
try{const hc=new BroadcastChannel(HEALTH_BRIDGE_CHANNEL);hc.addEventListener('message',e=>{if(e.data?.type==='komo:daily-health'&&e.data.payload)ingestDailyHealth(e.data.payload)})}catch{}
window.addEventListener('message',e=>{if(e.data?.type==='komo:daily-health'&&e.data.payload)ingestDailyHealth(e.data.payload)});

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
  healthSourceEl.textContent=dailyHealth?.source||'DEMO';
  if(menuMotion)menuMotion.innerHTML=score+'<small>/100</small>';
  if(menuAge)menuAge.textContent=Math.round(Number(snap.motion_age)||0);
  if(typeof healthStationBars!=='undefined'){
    Object.entries(healthStationBars).forEach(([id,fill])=>{
      const v=THREE.MathUtils.clamp(Number(d[id])||0,0,100),h=.20+(v/100)*1.12;
      fill.scale.y=h;fill.position.y=.50+h/2;
      fill.material.opacity=.48+(v/100)*.34;
    });
  }
}
function healthOverviewHtml(){
  const snap=current(),d=snap.domains||{},metrics=snap.metrics||{};
  const score=Math.round(Number(snap.motion_score)||0),age=Math.round(Number(snap.motion_age)||0);
  const baseScore=Math.round(Number(baseline.motion_score)||0),baseAge=Math.round(Number(baseline.motion_age)||0);
  const scoreDelta=score-baseScore,ageDelta=age-baseAge;
  const domains=[
    ['muscle','MUSCLE',d.muscle],['mobility',locale==='fr'?'MOBILITÉ':'MOBILITY',d.mobility],
    ['balance',locale==='fr'?'ÉQUILIBRE':'BALANCE',d.balance],['posture','POSTURE',d.posture],
    ['endurance',locale==='fr'?'CAPACITÉ':'CAPACITY',d.endurance]
  ];
  const weakest=[...domains].sort((a,b)=>(Number(a[2])||0)-(Number(b[2])||0))[0];
  const strongest=[...domains].sort((a,b)=>(Number(b[2])||0)-(Number(a[2])||0))[0];
  const trend=scoreDelta>1?(locale==='fr'?'EN PROGRESSION':'IMPROVING'):scoreDelta<-1?(locale==='fr'?'À SUIVRE':'WATCH'):(locale==='fr'?'STABLE':'STABLE');
  const domainCards=domains.map(([id,label,val])=>{
    const v=Math.round(Number(val)||0),base=Math.round(Number(baseline.domains?.[id])||0),delta=v-base;
    const tone=v>=80?'high':v>=65?'mid':'watch';
    const status=v>=80?(locale==='fr'?'POINT FORT':'STRONG'):v>=65?(locale==='fr'?'SOLIDE':'SOLID'):(locale==='fr'?'À EXPLORER':'EXPLORE');
    return `<article class="result-domain ${tone}" data-result-domain="${id}">
      <div><span>${label}</span><em>${status}</em></div>
      <strong>${v}<small>/100</small></strong>
      <i><b style="width:${THREE.MathUtils.clamp(v,0,100)}%"></b></i>
      <footer><span>Baseline ${base}</span><b class="${delta>=0?'positive':'negative'}">${delta>=0?'+':''}${delta}</b></footer>
    </article>`;
  }).join('');
  const timeline=core.snapshots.map((s,i)=>{
    const active=s.snapshot_id===snap.snapshot_id;
    const date=new Date(s.captured_at);
    const dateLabel=date.toLocaleDateString(locale==='fr'?'fr-FR':'en-GB',{day:'2-digit',month:'short'});
    return `<button type="button" class="result-timepoint ${active?'active':''}" data-result-time="${i}">
      <span>${s.label}</span><b>${s.motion_score}</b><small>${dateLabel} · Age ${s.motion_age}</small>
    </button>`;
  }).join('');
  const signals=[
    [locale==='fr'?'VITESSE DE MARCHE':'GAIT SPEED',(Number(metrics.gait_speed)||0).toFixed(2),'m/s'],
    [locale==='fr'?'SYMÉTRIE QUADRICEPS':'QUADRICEPS SYMMETRY',Math.round(Number(metrics.quadriceps_symmetry)||0),'%'],
    [locale==='fr'?'INDEX DE FORCE':'STRENGTH INDEX',Math.round(Number(metrics.strength_index)||0),'/100'],
    [locale==='fr'?'INDEX POSTURE':'POSTURE INDEX',Math.round(Number(metrics.posture_index)||0),'/100']
  ].map(([label,value,unit])=>`<div><span>${label}</span><b>${value}<small>${unit}</small></b></div>`).join('');
  const captured=new Date(snap.captured_at).toLocaleString(locale==='fr'?'fr-FR':'en-GB',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
  return `
    <section class="results-dashboard">
      <div class="results-hero results-hero-v41">
        <div class="results-score results-score-v41">
          <div class="score-orbit" style="--score:${THREE.MathUtils.clamp(score,0,100)}">
            <div><strong>${score}</strong><small>/100</small></div>
          </div>
          <span>MOTION SCORE</span>
          <em>${trend}</em>
        </div>
        <div class="results-side-v41">
          <div class="results-age">
            <span>MOTION AGE</span>
            <strong>${age}</strong>
            <small>Baseline ${baseAge} · ${ageDelta===0?'—':(ageDelta>0?'+':'')+ageDelta}</small>
          </div>
          <div class="results-change">
            <span>${locale==='fr'?'DEPUIS LA BASELINE':'SINCE BASELINE'}</span>
            <strong class="${scoreDelta>=0?'positive':'negative'}">${scoreDelta>=0?'+':''}${scoreDelta}</strong>
            <small>Motion Score</small>
          </div>
        </div>
      </div>

      <div class="results-context">
        <div><span>${locale==='fr'?'POINT FORT ACTUEL':'CURRENT STRENGTH'}</span><b>${strongest[1]} · ${Math.round(Number(strongest[2])||0)}</b></div>
        <div><span>${locale==='fr'?'À EXPLORER':'EXPLORE NEXT'}</span><b>${weakest[1]} · ${Math.round(Number(weakest[2])||0)}</b></div>
      </div>

      <div class="results-section-title"><span>${locale==='fr'?'VOTRE PROFIL':'YOUR PROFILE'}</span><b>5 ${locale==='fr'?'domaines de mouvement':'movement domains'}</b></div>
      <div class="results-domains">${domainCards}</div>

      ${dailyHealthHtml()}
      <div class="results-section-title"><span>${locale==='fr'?'ÉVOLUTION':'TRAJECTORY'}</span><b>Baseline → Today</b></div>
      <div class="results-timeline">${timeline}</div>

      <div class="results-section-title"><span>${locale==='fr'?'SIGNAUX MESURÉS':'MEASURED SIGNALS'}</span><b>${locale==='fr'?'Extrait du bilan':'Assessment extract'}</b></div>
      <div class="results-signals">${signals}</div>

      <div class="results-reading">
        <b>${locale==='fr'?'COMMENT LIRE VOS RÉSULTATS':'HOW TO READ YOUR RESULTS'}</b>
        <p>${locale==='fr'?'Le Motion Score synthétise votre profil de mouvement. Les domaines montrent ce qui contribue au score ; la trajectoire permet de distinguer votre état actuel de votre évolution dans le temps.':'Motion Score summarises your movement profile. Domains show what contributes to the score; trajectory separates your current state from your change over time.'}</p>
      </div>
      <div class="results-meta"><span>${locale==='fr'?'MESURE':'MEASURED'} · ${captured}</span><span>DEMO · TwinCore</span></div>
      <div class="data-note">${locale==='fr'?'Aperçu informatif du mouvement, pas un diagnostic. Les valeurs restent des données de démonstration tant que Pulse personnel n’est pas connecté.':'Informational movement overview, not a diagnosis. Values remain demo data until personal Pulse is connected.'}</div>
    </section>`;
}
function bindHealthResults(){
  panelBody.querySelectorAll('[data-result-time]').forEach(btn=>btn.addEventListener('click',()=>{
    core.setTimeIndex(Number(btn.dataset.resultTime),'world-results');updateHealthHUD();showHealthOverview();
  }));
  panelBody.querySelectorAll('[data-result-domain]').forEach(card=>card.addEventListener('click',()=>showTwinDomain(card.dataset.resultDomain)));
}
function showHealthOverview(){
  closeWorldMenu();
  openPanel(locale==='fr'?'VOS RÉSULTATS MOTION':'YOUR MOTION RESULTS',locale==='fr'?'État actuel · évolution · domaines.':'Current state · trajectory · domains.',healthOverviewHtml(),[
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel},
    {label:'DAILY HEALTH',onClick:showDailyHealthConnect},
    {label:locale==='fr'?'FITNESS':'FITNESS',onClick:enterRehab},
    {label:locale==='fr'?'EXPLORER LE TWIN':'EXPLORE TWIN',primary:true,onClick:enterTwin}
  ]);
  bindHealthResults();
}
healthHud.addEventListener('click',showHealthOverview);
updateHealthHUD();

// V3.2 Daily World Challenges — engagement only, never health rankings.
const CHALLENGE_KEY='komo_world_challenges_v1';
const challengeDefs=[
  {id:'distance',reward:20,target:120,title:{fr:'Explorer le World',en:'Explore the World'},sub:{fr:'Parcourir 120 m dans le campus',en:'Move 120 m through the campus'}},
  {id:'twin',reward:20,target:1,title:{fr:'Lire votre Twin',en:'Read your Twin'},sub:{fr:'Entrer dans Functional Twin',en:'Enter Functional Twin'}},
  {id:'fitness',reward:25,target:1,title:{fr:'Bouger aujourd’hui',en:'Move today'},sub:{fr:'Valider la séance KŌMØ Fitness Club',en:'Complete today’s KŌMØ Fitness Club session'}},
  {id:'fountain',reward:15,target:1,title:{fr:'Découvrir la grande fontaine',en:'Discover the Grand Fountain'},sub:{fr:'Explorer le nouveau KŌMØ District',en:'Explore the new KŌMØ District'}},
  {id:'coach',reward:10,target:1,title:{fr:'Parler à un coach',en:'Meet a coach'},sub:{fr:'Demander une quête Fitness à Leo ou Nora',en:'Ask Leo or Nora for a Fitness quest'}},
  {id:'life_item',reward:10,target:1,title:{fr:'Découvrir un objet Life',en:'Discover a Life object'},sub:{fr:'Explorer un produit directement dans le flagship',en:'Explore a product directly in the flagship'}},
  {id:'arena_visit',reward:15,target:1,title:{fr:'Entrer dans Arena',en:'Enter Arena'},sub:{fr:'Découvrir le Challenge Board',en:'Discover the Challenge Board'}},
  {id:'social_chat',reward:15,target:1,title:{fr:'Briser la glace',en:'Break the ice'},sub:{fr:'Envoyer un message dans le World Chat',en:'Send a message in World Chat'}},
  {id:'social_direct',reward:20,target:1,title:{fr:'Créer un contact',en:'Make a connection'},sub:{fr:'Envoyer un message privé à un membre',en:'Send a private message to a member'}},
  {id:'social_join',reward:15,target:1,title:{fr:'Rejoindre un membre',en:'Join a member'},sub:{fr:'Rejoindre la position d’un autre membre',en:'Join another member’s position'}},
  {id:'social_voice',reward:25,target:1,title:{fr:'Parler en proximité',en:'Talk nearby'},sub:{fr:'Utiliser la voix avec un membre proche',en:'Use proximity voice with a nearby member'}},
  {id:'social_together',reward:30,target:20,title:{fr:'Bouger ensemble',en:'Move together'},sub:{fr:'Rester 20 secondes à proximité d’un membre',en:'Stay near another member for 20 seconds'}}
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
  challenges.progress[id]=d.target;challenges.done[id]=Date.now();challenges.points+=d.reward;saveChallenges();if(typeof syncNpcMissionByLink==='function')syncNpcMissionByLink('challenge',id);
  journey.xp+=d.reward;saveJourney();updateJourneyUI();
  notify('+'+d.reward+' XP · '+d.title[locale]);return true;
}
function addChallengeProgress(id,amount){
  const d=challengeDefs.find(x=>x.id===id);if(!d||challenges.done[id])return;
  challenges.progress[id]=Math.min(d.target,challengeProgress(id)+amount);saveChallenges();
  if(challenges.progress[id]>=d.target)completeChallenge(id);
}
function socialChallengeEvent(type,amount=1){
  const map={chat:'social_chat',dm:'social_direct',join:'social_join',voice:'social_voice',together:'social_together'};
  const id=map[type];if(!id)return false;
  addChallengeProgress(id,Math.max(0,Number(amount)||1));
  if(type==='chat'||type==='dm'||type==='voice')completeJourney('social',{silent:true});
  if(panel.classList.contains('open')&&panelTitle.textContent==='WORLD CHALLENGES')showChallenges();
  return true;
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
    <div class="data-note">${locale==='fr'?'Les défis récompensent l’exploration, l’activité et la communication. Ils ne comparent ni Motion Score ni données de santé entre utilisateurs.':'Challenges reward exploration, activity and communication. They never compare Motion Score or health data between users.'}</div>`;
}
function showChallenges(){
  openPanel('WORLD CHALLENGES',locale==='fr'?'Vos défis du jour.':'Your challenges for today.',challengesHtml(),[
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel},
    {label:locale==='fr'?'ALLER À L’ARENA':'GO TO ARENA',primary:true,onClick:()=>fastTravel('arena')}
  ]);
}
challengesToggle.addEventListener('click',()=>{closeWorldMenu();showChallenges()});

// V5.4 NPC functions + daily missions.
const NPC_MISSION_KEY='komo_world_npc_missions_v1';
const NPC_MISSIONS={
  maya:{name:'Maya',role:{fr:'GUIDE MOUVEMENT',en:'MOVEMENT GUIDE'},type:'reps',target:15,reward:30,unit:{fr:'squats',en:'squats'},title:{fr:'15 squats avec Maya',en:'15 squats with Maya'},body:{fr:'Maya te lance un défi simple : réalise 15 squats contrôlés. Valide chaque répétition dans World ; la détection capteur pourra ensuite remplacer cette validation.',en:'Maya gives you a simple challenge: complete 15 controlled squats. Confirm each rep in World; sensor detection can replace this later.'}},
  noah:{name:'Noah',role:{fr:'RUNNER DU WORLD',en:'WORLD RUNNER'},type:'distance',target:80,reward:25,unit:{fr:'m',en:'m'},title:{fr:'Run 80 m',en:'Run 80 m'},body:{fr:'Noah te propose une boucle de 80 mètres. La distance est comptée automatiquement dès que tu acceptes.',en:'Noah challenges you to an 80-metre run. Distance is counted automatically once accepted.'}},
  elena:{name:'Elena',role:{fr:'GUIDE ÉQUILIBRE',en:'BALANCE GUIDE'},type:'timer',target:30,reward:20,unit:{fr:'s',en:'s'},title:{fr:'30 secondes d’équilibre',en:'30-second balance hold'},body:{fr:'Tiens une position stable pendant 30 secondes. Le minuteur World valide la durée ; une mesure instrumentée pourra ensuite prendre le relais.',en:'Hold a stable position for 30 seconds. World times the duration; instrumented measurement can take over later.'}},
  leo:{name:'Leo',role:{fr:'COACH FITNESS',en:'FITNESS COACH'},type:'linked',link:['challenge','fitness'],reward:30,target:1,unit:{fr:'séance',en:'session'},title:{fr:'Terminer la séance Fitness',en:'Complete the Fitness session'},body:{fr:'Leo te confie la séance KŌMØ Fitness du jour. Termine-la dans le Club pour valider sa mission.',en:'Leo assigns today’s KŌMØ Fitness session. Complete it in the Club to clear his mission.'},go:'rehab'},
  sofia:{name:'Sofia',role:{fr:'CURATRICE LIFE',en:'LIFE CURATOR'},type:'linked',link:['challenge','life_item'],reward:20,target:1,unit:{fr:'objet',en:'item'},title:{fr:'Découvrir un objet KŌMØ Life',en:'Discover a KŌMØ Life object'},body:{fr:'Sofia te demande de choisir et d’explorer un objet de la collection KŌMØ Life.',en:'Sofia asks you to choose and explore one object from the KŌMØ Life collection.'},go:'life'},
  camille:{name:'Camille',role:{fr:'GUIDE FUNCTIONAL TWIN',en:'FUNCTIONAL TWIN GUIDE'},type:'linked',link:['challenge','twin'],reward:25,target:1,unit:{fr:'visite',en:'visit'},title:{fr:'Entrer dans Functional Twin',en:'Enter Functional Twin'},body:{fr:'Camille t’oriente vers ton Twin : entre dans la salle et consulte ta trajectoire.',en:'Camille guides you to your Twin: enter the room and review your trajectory.'},go:'twin'},
  lina:{name:'Lina',role:{fr:'HÔTE COMMUNAUTÉ',en:'COMMUNITY HOST'},type:'social',target:3,reward:25,unit:{fr:'personnes',en:'people'},title:{fr:'Parler à 3 personnes',en:'Talk to 3 people'},body:{fr:'Lina te propose de rencontrer trois personnages différents du World. Chaque conversation unique compte.',en:'Lina asks you to meet three different World characters. Each unique conversation counts.'}},
  alex:{name:'Alex',role:{fr:'GUIDE SCIENCE',en:'SCIENCE GUIDE'},type:'linked',link:['journey','library'],reward:20,target:1,unit:{fr:'lecture',en:'visit'},title:{fr:'Consulter la Science Library',en:'Visit the Science Library'},body:{fr:'Alex te demande de consulter la Library pour comprendre la méthode et la provenance des mesures.',en:'Alex asks you to visit the Library to understand methodology and data provenance.'},go:'library'},
  mila:{name:'Mila',role:{fr:'HÔTE LEVEL 2',en:'LEVEL 2 HOST'},type:'linked',link:['journey','upper'],reward:25,target:1,unit:{fr:'niveau',en:'level'},title:{fr:'Atteindre le Level 2',en:'Reach Level 2'},body:{fr:'Mila t’attend à l’étage : rejoins les galeries hautes du World.',en:'Mila is waiting upstairs: reach the upper galleries of World.'},go:'upper'},
  theo:{name:'Théo',role:{fr:'COACH ARENA',en:'ARENA COACH'},type:'linked',link:['challenge','arena_visit'],reward:25,target:1,unit:{fr:'entrée',en:'visit'},title:{fr:'Entrer dans Arena',en:'Enter Arena'},body:{fr:'Théo te demande de franchir le seuil Arena et d’ouvrir le Challenge Board.',en:'Théo asks you to enter Arena and open the Challenge Board.'},go:'arena'},
  nora:{name:'Nora',role:{fr:'GUIDE DISTRICT',en:'DISTRICT GUIDE'},type:'linked',link:['challenge','fountain'],reward:20,target:1,unit:{fr:'lieu',en:'place'},title:{fr:'Trouver la Grande Fontaine',en:'Find the Grand Fountain'},body:{fr:'Nora t’envoie vers le cœur du District : trouve la Grande Fontaine.',en:'Nora sends you to the heart of the District: find the Grand Fountain.'},go:'arrival'},
  jules:{name:'Jules',role:{fr:'HÔTE RECOVERY',en:'RECOVERY HOST'},type:'timer',target:45,reward:20,unit:{fr:'s',en:'s'},title:{fr:'45 secondes de recovery',en:'45-second recovery reset'},body:{fr:'Jules propose une courte pause : reste 45 secondes en récupération calme avant de repartir.',en:'Jules proposes a short reset: spend 45 seconds in calm recovery before moving on.'}}
};
function loadNpcMissionState(){const date=localDateKey();try{const raw=JSON.parse(localStorage.getItem(NPC_MISSION_KEY)||'{}');if(raw.date===date)return {date,missions:raw.missions||{},talked:Array.isArray(raw.talked)?raw.talked:[]}}catch{}return {date,missions:{},talked:[]}}
const npcMissionState=loadNpcMissionState();
let npcMissionTimer=null;
function saveNpcMissionState(){try{localStorage.setItem(NPC_MISSION_KEY,JSON.stringify(npcMissionState))}catch{}}
function npcMissionRecord(id){const d=NPC_MISSIONS[id];if(!d)return null;return npcMissionState.missions[id]||(npcMissionState.missions[id]={accepted:0,progress:0,done:0})}
function completeNpcMission(id){const d=NPC_MISSIONS[id],r=npcMissionRecord(id);if(!d||!r||r.done)return false;r.progress=d.target;r.done=Date.now();saveNpcMissionState();journey.xp+=d.reward;saveJourney();updateJourneyUI();notify('+'+d.reward+' XP · '+d.name.toUpperCase());return true}
function npcLinkDone(d){if(!d?.link)return false;const [kind,id]=d.link;return kind==='challenge'?!!challenges.done[id]:kind==='journey'?!!journey.done[id]:false}
function syncNpcMission(id){const d=NPC_MISSIONS[id],r=npcMissionRecord(id);if(!d||!r?.accepted||r.done)return false;if(d.type==='linked'&&npcLinkDone(d))return completeNpcMission(id);if(d.type==='social'){r.progress=Math.min(d.target,npcMissionState.talked.filter(n=>n!=='Lina').length);saveNpcMissionState();if(r.progress>=d.target)return completeNpcMission(id)}return false}
function syncNpcMissionByLink(kind,id){Object.entries(NPC_MISSIONS).forEach(([key,d])=>{if(d.link?.[0]===kind&&d.link?.[1]===id)syncNpcMission(key)})}
function addNpcMissionProgress(id,amount=1){const d=NPC_MISSIONS[id],r=npcMissionRecord(id);if(!d||!r?.accepted||r.done)return false;r.progress=Math.min(d.target,(Number(r.progress)||0)+Math.max(0,Number(amount)||0));saveNpcMissionState();if(r.progress>=d.target)completeNpcMission(id);return true}
function acceptNpcMission(id){const r=npcMissionRecord(id);if(!r)return false;if(!r.accepted)r.accepted=Date.now();saveNpcMissionState();syncNpcMission(id);showNpcMission(id);return true}
function registerNpcTalk(label){if(label&&!npcMissionState.talked.includes(label)){npcMissionState.talked.push(label);saveNpcMissionState()}syncNpcMission('lina')}
function npcMissionGo(id){const d=NPC_MISSIONS[id];if(!d)return;if(d.go==='rehab')return enterRehab();if(d.go==='life')return fastTravel('life');if(d.go==='twin')return enterTwin();if(d.go==='library')return showLibrary();if(d.go==='upper')return fastTravel('upper');if(d.go==='arena')return enterArena();if(d.go==='arrival')return fastTravel('arrival')}
function stopNpcMissionTimer(){if(npcMissionTimer){clearInterval(npcMissionTimer);npcMissionTimer=null}}
function startNpcTimedMission(id){const d=NPC_MISSIONS[id],r=npcMissionRecord(id);if(!d||d.type!=='timer'||r.done)return;if(!r.accepted){r.accepted=Date.now();saveNpcMissionState()}stopNpcMissionTimer();npcMissionTimer=setInterval(()=>{if(!panel.classList.contains('open')||panel.dataset.npcMission!==id){stopNpcMissionTimer();return}addNpcMissionProgress(id,1);const rr=npcMissionRecord(id),el=panelBody.querySelector('[data-npc-progress]'),bar=panelBody.querySelector('[data-npc-bar]');if(el)el.textContent=Math.round(rr.progress)+' / '+d.target+' '+d.unit[locale];if(bar)bar.style.width=Math.min(100,rr.progress/d.target*100)+'%';if(rr.done){stopNpcMissionTimer();showNpcMission(id)}},1000)}
function addNpcRep(id){addNpcMissionProgress(id,1);showNpcMission(id)}
function npcMissionHtml(id){const d=NPC_MISSIONS[id],r=npcMissionRecord(id);if(!d||!r)return '';syncNpcMission(id);const pct=Math.min(100,(Number(r.progress)||0)/d.target*100),status=r.done?'✓ '+(locale==='fr'?'TERMINÉ':'DONE'):r.accepted?(locale==='fr'?'MISSION ACTIVE':'MISSION ACTIVE'):(locale==='fr'?'À ACCEPTER':'READY');return '<div class="metric-hero"><div><span>'+d.role[locale]+'</span><strong>'+d.name+'</strong></div><div><span>REWARD</span><strong>+'+d.reward+'<em> XP</em></strong></div></div><p>'+d.body[locale]+'</p><div class="priority-card"><b>'+status+'</b>'+d.title[locale]+'</div><div class="challenge-card '+(r.done?'done':'')+'"><span><em>'+d.unit[locale].toUpperCase()+'</em><em data-npc-progress>'+Math.round(Number(r.progress)||0)+' / '+d.target+' '+d.unit[locale]+'</em></span><b>'+d.title[locale]+'</b><i><em data-npc-bar style="width:'+pct+'%"></em></i></div><div class="data-note">'+(locale==='fr'?'Les missions World récompensent l’engagement. Les validations physiques restent déclaratives tant qu’un capteur ou une source santé n’est pas connecté.':'World missions reward engagement. Physical validation is self-reported until a sensor or health source is connected.')+'</div>'}
function showNpcMission(id){const d=NPC_MISSIONS[id];if(!d)return;const r=npcMissionRecord(id);syncNpcMission(id);const actions=[{label:locale==='fr'?'FERMER':'CLOSE',onClick:()=>{stopNpcMissionTimer();closePanel()}}];if(!r.accepted&&!r.done)actions.push({label:locale==='fr'?'ACCEPTER LE DÉFI':'ACCEPT CHALLENGE',primary:true,onClick:()=>acceptNpcMission(id)});else if(!r.done){if(d.type==='reps')actions.push({label:locale==='fr'?'+1 SQUAT':'+1 SQUAT',primary:true,onClick:()=>addNpcRep(id)});else if(d.type==='timer')actions.push({label:locale==='fr'?'LANCER LE CHRONO':'START TIMER',primary:true,onClick:()=>startNpcTimedMission(id)});else if(d.type==='linked')actions.push({label:locale==='fr'?'ALLER À LA MISSION':'GO TO MISSION',primary:true,onClick:()=>npcMissionGo(id)});else if(d.type==='distance'||d.type==='social')actions.push({label:locale==='fr'?'CONTINUER DANS LE WORLD':'CONTINUE IN WORLD',primary:true,onClick:closePanel})}openPanel(d.name.toUpperCase()+' · '+d.role[locale],d.title[locale],npcMissionHtml(id),actions);panel.dataset.npcMission=id}

// V3.2 lightweight Avatar Studio.
const AVATAR_KEY='komo_world_avatar_v1';
const avatarPalettes={
  outfit:{sage:[0x24483a,0x19372d,0x303733],sand:[0xa69379,0x756451,0x423d36],black:[0x282d2a,0x171b19,0x242624]},
  skin:{light:[0xd4a17d,0xbd805f],medium:[0xb87e59,0x9d6548],deep:[0x7c4f38,0x653b29]},
  hair:{dark:0x2a2420,brown:0x5a3c2d,grey:0x6b6a65},
  look:{
    tailored:{roughness:.48,metalness:.018,chest:[1.28,.50,.72],torso:[1.08,1,.79],collar:true,pin:true},
    performance:{roughness:.62,metalness:.008,chest:[1.18,.46,.69],torso:[1.03,.97,.76],collar:false,pin:false},
    riviera:{roughness:.54,metalness:.012,chest:[1.23,.48,.71],torso:[1.06,.99,.78],collar:true,pin:true}
  }
};
function loadAvatarConfig(){try{return {...{look:'tailored',outfit:'sage',skin:'medium',hair:'dark'},...JSON.parse(localStorage.getItem(AVATAR_KEY)||'{}')}}catch{return {look:'tailored',outfit:'sage',skin:'medium',hair:'dark'}}}
const avatarConfig=loadAvatarConfig();
function syncIntroAvatarControls(){
  document.querySelectorAll('[data-intro-avatar-key]').forEach(btn=>{
    btn.classList.toggle('selected',avatarConfig[btn.dataset.introAvatarKey]===btn.dataset.introAvatarValue);
  });
  const preview=document.querySelector('.intro-avatar-silhouette');
  if(preview){
    preview.dataset.look=avatarConfig.look||'tailored';
    preview.dataset.outfit=avatarConfig.outfit||'sage';
  }
}
function applyAvatarConfig(){
  const av=playerAvatar.userData.avatar,mats=av.materials;if(!mats)return;
  const o=avatarPalettes.outfit[avatarConfig.outfit]||avatarPalettes.outfit.sage;
  const sk=avatarPalettes.skin[avatarConfig.skin]||avatarPalettes.skin.medium;
  const look=avatarPalettes.look[avatarConfig.look]||avatarPalettes.look.tailored;
  mats.cloth.color.setHex(o[0]);mats.clothDark.color.setHex(o[1]);mats.trouser.color.setHex(o[2]);
  mats.cloth.roughness=look.roughness;mats.cloth.metalness=look.metalness;
  mats.skin.color.setHex(sk[0]);mats.skinWarm.color.setHex(sk[1]);
  mats.hair.color.setHex(avatarPalettes.hair[avatarConfig.hair]||avatarPalettes.hair.dark);
  const g=av.garments;
  if(g){
    g.chest.scale.set(...look.chest);g.torso.scale.set(...look.torso);
    g.collarL.visible=g.collarR.visible=look.collar;g.chestPin.visible=look.pin;
    if(avatarConfig.look==='performance'){
      g.waist.scale.set(1.08,.20,.72);g.shoulderL.scale.set(.72,.40,.60);g.shoulderR.scale.copy(g.shoulderL.scale);
    }else if(avatarConfig.look==='riviera'){
      g.waist.scale.set(1.01,.22,.72);g.shoulderL.scale.set(.75,.43,.62);g.shoulderR.scale.copy(g.shoulderL.scale);
    }else{
      g.waist.scale.set(1.04,.25,.74);g.shoulderL.scale.set(.78,.46,.64);g.shoulderR.scale.copy(g.shoulderL.scale);
    }
  }
  syncIntroAvatarControls();
}
function saveAvatarConfig(){try{localStorage.setItem(AVATAR_KEY,JSON.stringify(avatarConfig))}catch{}applyAvatarConfig()}
function avatarStudioHtml(){
  const row=(key,label,opts)=>`<div class="avatar-option-row"><span>${label}</span><div class="avatar-swatches">${opts.map(([id,name])=>`<button data-avatar-key="${key}" data-avatar-value="${id}" class="${avatarConfig[key]===id?'selected':''}">${name}</button>`).join('')}</div></div>`;
  return `<div class="avatar-options">
    ${row('look',locale==='fr'?'STYLE':'STYLE',[['tailored','TAILORED'],['performance','PERFORMANCE'],['riviera','RIVIERA']])}
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
if(introAvatarOpen)introAvatarOpen.addEventListener('click',()=>showAvatarStudio());
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
  hall:{mode:'world',x:0,y:0,z:14.55,yaw:0,level:0},
  twin:{mode:'world',x:-5.9,y:0,z:-22.2,yaw:0,level:0},
  rehab:{mode:'world',x:0,y:0,z:-22.2,yaw:0,level:0},
  arena:{mode:'world',x:5.9,y:0,z:-22.2,yaw:0,level:0},
  life:{mode:'world',x:5.4,y:0,z:3.6,yaw:-1.15,level:0},
  upper:{mode:'world',x:-8.72,y:UPPER_Y,z:5.7,yaw:0,level:1}
};
const journeyTargets={
  arrival:{x:0,y:0,z:58.5},hall:{x:0,y:0,z:14.55},journey:{x:4.8,y:0,z:8.5},
  twin:{x:-6.8,y:0,z:-26.0},rehab:{x:0,y:0,z:-26.0},rehab_session:{x:0,y:0,z:-58.2},arena:{x:6.8,y:0,z:-26.0},
  life:{x:8.4,y:0,z:3.4},upper:{x:-8.72,y:UPPER_Y,z:5.7},library:{x:-10.2,y:0,z:-10},talks:{x:10.2,y:0,z:-10}
};
function setGuideEnabled(value){
  guideEnabled=!!value;guideRoot.visible=guideEnabled;guideToggle.textContent='GUIDE · '+(guideEnabled?'ON':'OFF');
}
function toggleGuide(){setGuideEnabled(!guideEnabled)}
function campusWalkingTarget(destination,p=player){
  const zone=getCampusZone(p);
  if(destination==='twin'){
    if(zone==='twin')return {x:-43.0,y:0,z:-2.0};
    if(inTwinLink(p)){
      if(p.x>-28.9)return {x:-32.0,y:0,z:-24.0};
      if(p.z<-4.0)return {x:-32.0,y:0,z:-2.2};
      return {x:-37.0,y:0,z:-2.0};
    }
    return {x:-10.7,y:0,z:-24.0};
  }
  if(destination==='arena'){
    if(zone==='arena')return {x:43.0,y:0,z:-2.0};
    if(inArenaLink(p)){
      if(p.x<28.9)return {x:32.0,y:0,z:-24.0};
      if(p.z<-4.0)return {x:32.0,y:0,z:-2.2};
      return {x:37.0,y:0,z:-2.0};
    }
    return {x:10.7,y:0,z:-24.0};
  }
  if(destination==='rehab'){
    if(zone==='rehab')return {x:0,y:0,z:-53.5};
    if(inFitnessLink(p))return {x:0,y:0,z:-43.7};
    return {x:0,y:0,z:-28.0};
  }
  if(destination==='hall'){
    if(zone==='twin'){
      if(p.x<-34.0)return {x:-32.0,y:0,z:-2.2};
    }else if(zone==='arena'){
      if(p.x>34.0)return {x:32.0,y:0,z:-2.2};
    }else if(zone==='rehab'){
      return {x:0,y:0,z:-43.2};
    }
    if(inTwinLink(p)){
      if(p.z>-20.4)return {x:-32.0,y:0,z:-24.0};
      if(p.x<-11.2)return {x:-10.7,y:0,z:-24.0};
    }
    if(inArenaLink(p)){
      if(p.z>-20.4)return {x:32.0,y:0,z:-24.0};
      if(p.x>11.2)return {x:10.7,y:0,z:-24.0};
    }
    if(inFitnessLink(p))return {x:0,y:0,z:-27.0};
    return {x:0,y:0,z:-18.0};
  }
  return null;
}
function guideTarget(){
  if(manualCampusDestination){
    const t=campusWalkingTarget(manualCampusDestination);
    if(t)return t;
  }
  const m=journeyNextMission();if(!m)return null;
  if(m.id==='social'){
    const n=living.npcs.find(n=>n.visible&&Math.abs(n.position.y-player.y)<1.2);
    return n?{x:n.position.x,y:n.position.y,z:n.position.z}:journeyTargets.hall;
  }
  if(['twin','rehab','arena'].includes(m.id))return campusWalkingTarget(m.id)||journeyTargets[m.id];
  return journeyTargets[m.id]||null;
}
function updateJourneyGuide(now){
  if(!guideEnabled){guideRoot.visible=false;return}
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

function joinPresence(target){
  if(!target)return false;
  const zone=['world','twin','rehab','arena'].includes(target.zone)?target.zone:'world';
  const tx=Number(target.x)||0,tz=Number(target.z)||0,ty=Number(target.y)||0,tyaw=Number(target.yaw)||0;
  closePanel();closeWorldMenu();travelFade.classList.add('active');velocity.set(0,0,0);keys.clear();
  setTimeout(()=>{
    if(zone==='world'){
      setMode('world');
      playerLevel=ty>UPPER_Y*.55?1:0;
      const offsets=[[1.65,1.15],[-1.65,1.15],[1.65,-1.15],[-1.65,-1.15],[0,1.9]];
      let placed=false;
      for(const [ox,oz] of offsets){
        const p=new THREE.Vector3(
          THREE.MathUtils.clamp(tx+ox,-23.2,23.2),
          playerLevel===1?UPPER_Y:0,
          THREE.MathUtils.clamp(tz+oz,-27.8,80.2)
        );
        if(canMove(p)){player.copy(p);placed=true;break}
      }
      if(!placed){
        player.set(THREE.MathUtils.clamp(tx,-22.8,22.8),playerLevel===1?UPPER_Y:0,THREE.MathUtils.clamp(tz,-27.6,79.8));
      }
      syncPlayerElevation();
    }else if(zone==='twin'){
      playerLevel=0;setMode('twin');
      player.set(THREE.MathUtils.clamp(tx+1.2,-55.2,-34.8),0,THREE.MathUtils.clamp(tz+1.0,-11.2,10.2));
    }else if(zone==='rehab'){
      playerLevel=0;setMode('rehab');
      player.set(THREE.MathUtils.clamp(tx+1.2,-9.2,9.2),0,THREE.MathUtils.clamp(tz+1.0,-65.2,-43.8));
    }else{
      playerLevel=0;setMode('arena');
      player.set(THREE.MathUtils.clamp(tx+1.2,34.8,55.2),0,THREE.MathUtils.clamp(tz+1.0,-11.2,10.2));
    }
    yaw=targetYaw=tyaw;playerFacing=tyaw;pitch=targetPitch=-.035;updateLocation();
    setTimeout(()=>travelFade.classList.remove('active'),110);
  },180);
  return true;
}
function closePanel(){
  if(typeof rehabSessionTimer!=='undefined'&&rehabSessionTimer)stopRehabSession();
  if(typeof stopNpcMissionTimer==='function')stopNpcMissionTimer();
  delete panel.dataset.npcMission;
  panel.classList.remove('open');panel.setAttribute('aria-hidden','true');panelActions.innerHTML='';syncUiOpen();
}
function openPanel(kicker,title,html,actions=[]){
  if(typeof stopNpcMissionTimer==='function')stopNpcMissionTimer();
  delete panel.dataset.npcMission;
  panelKicker.textContent=kicker;panelTitle.textContent=title;panelBody.innerHTML=html;panelActions.innerHTML='';
  actions.forEach(a=>{
    const b=document.createElement('button');b.type='button';b.textContent=a.label;if(a.primary)b.classList.add('primary');
    b.addEventListener('click',a.onClick);panelActions.appendChild(b);
  });
  panel.classList.add('open');panel.setAttribute('aria-hidden','false');worldMenu.classList.remove('open');worldMenu.setAttribute('aria-hidden','true');velocity.set(0,0,0);syncUiOpen();
}
function campusMapHtml(){
  return `
    <section class="campus-map">
      <div class="campus-map-head">
        <span>ONE WORLD</span>
        <b>${locale==='fr'?'Un campus continu. Aucune zone séparée.':'One continuous campus. No separate worlds.'}</b>
      </div>
      <div class="campus-map-stage">
        <button class="campus-node district" data-campus-go="arrival"><b>DISTRICT</b><small>${locale==='fr'?'Extérieur':'Outdoor'}</small></button>
        <button class="campus-node life" data-campus-go="life"><b>LIFE</b><small>Discover</small></button>
        <button class="campus-node hall current" data-campus-go="hall"><b>HALL</b><small>Home</small></button>
        <button class="campus-node twin" data-campus-go="twin"><b>TWIN</b><small>Understand</small></button>
        <button class="campus-node fitness" data-campus-go="rehab"><b>FITNESS</b><small>Move</small></button>
        <button class="campus-node arena" data-campus-go="arena"><b>ARENA</b><small>Engage</small></button>
        <button class="campus-node upper" data-campus-go="upper"><b>LEVEL 2</b><small>Explore</small></button>
        <i class="map-line l1"></i><i class="map-line l2"></i><i class="map-line l3"></i><i class="map-line l4"></i>
      </div>
      <div class="campus-purpose-grid">
        <div><span>FUNCTIONAL TWIN</span><b>${locale==='fr'?'Comprendre votre mouvement et votre évolution.':'Understand movement and trajectory.'}</b></div>
        <div><span>FITNESS CLUB</span><b>${locale==='fr'?'Transformer les résultats en action.':'Turn results into action.'}</b></div>
        <div><span>ARENA</span><b>${locale==='fr'?'Défis, progression et communauté.':'Challenges, progress and community.'}</b></div>
        <div><span>KŌMØ LIFE</span><b>${locale==='fr'?'Relier le World aux objets et expériences réels.':'Connect World to real objects and experiences.'}</b></div>
      </div>
    </section>`;
}
function bindCampusMap(){
  panelBody.querySelectorAll('[data-campus-go]').forEach(btn=>btn.addEventListener('click',()=>{closePanel();fastTravel(btn.dataset.campusGo)}));
}
function showCampusMap(){
  closeWorldMenu();
  openPanel('KŌMØ CAMPUS',locale==='fr'?'Tout votre World sur une seule carte.':'Your entire World on one map.',campusMapHtml(),[
    {label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel}
  ]);
  bindCampusMap();
}

function deskHtml(){
  const s=current();
  if(locale==='fr')return `
    <p>KŌMØ World est désormais un campus continu : marchez librement entre Functional Twin, Fitness Club, Arena, Life et les espaces de découverte.</p>
    <div class="panel-grid"><div><span>01 · UNDERSTAND</span><b>Functional Twin</b></div><div><span>02 · ACT</span><b>KŌMØ Fitness Club</b></div><div><span>03 · ENGAGE</span><b>Arena</b></div><div><span>ÉTAT ACTUEL</span><b>Motion ${s.motion_score}</b></div></div>
    <div class="priority-card"><b>PROCHAINE ÉTAPE</b>Commencez par le Functional Twin pour voir votre état actuel et votre progression depuis la baseline.</div>`;
  return `
    <p>KŌMØ World is one continuous campus: move freely between Functional Twin, Fitness Club, Arena, Life and discovery spaces.</p>
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
  const s=current(),value=Math.round(Number(s.domains?.[id])||0),base=Math.round(Number(baseline.domains?.[id])||0),delta=value-base;
  const explanations={
    muscle:{fr:'Capacités musculaires observées dans le bilan et évolution depuis la baseline.',en:'Muscular capability signals and change from baseline.'},
    mobility:{fr:'Mobilité fonctionnelle et qualité de déplacement.',en:'Functional mobility and movement quality.'},
    balance:{fr:'Équilibre et contrôle fonctionnel.',en:'Balance and functional control.'},
    posture:{fr:'Indicateurs de posture intégrés à votre trajectoire.',en:'Posture indicators within your trajectory.'},
    endurance:{fr:'Capacité fonctionnelle et évolution dans le temps.',en:'Functional capacity and change over time.'}
  };
  const status=value>=80?(locale==='fr'?'POINT FORT':'STRONG'):value>=65?(locale==='fr'?'SOLIDE':'SOLID'):(locale==='fr'?'À EXPLORER':'EXPLORE');
  return `
    <section class="domain-result">
      <div class="domain-result-head">
        <div><span>${twinDomainName(id).toUpperCase()}</span><em>${status}</em></div>
        <strong>${value}<small>/100</small></strong>
      </div>
      <div class="domain-result-track"><i style="width:${THREE.MathUtils.clamp(value,0,100)}%"></i></div>
      <div class="domain-result-comparison">
        <div><span>BASELINE</span><b>${base}</b></div>
        <div><span>${locale==='fr'?'AUJOURD’HUI':'TODAY'}</span><b>${value}</b></div>
        <div><span>DELTA</span><b class="${delta>=0?'positive':'negative'}">${delta>=0?'+':''}${delta}</b></div>
      </div>
      <p>${explanations[id]?.[locale]||''}</p>
      <div class="results-reading"><b>BODY MAP</b><p>${locale==='fr'?'La zone correspondante est mise en évidence directement sur votre jumeau biomécanique dans le Functional Twin.':'The corresponding area is highlighted directly on your biomechanical twin in Functional Twin.'}</p></div>
      <div class="data-note">${locale==='fr'?'Valeurs de démonstration TwinCore tant que Pulse personnel n’est pas connecté.':'TwinCore demo values until personal Pulse is connected.'}</div>
    </section>`;
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
  if(!rehabCoach.visible||!inFitnessZone())return;
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
  completeJourney('life',{silent:true});completeChallenge('life_item');
  const items={
    strap:{name:'MOTION STRAP',cat:'MOVE',fr:'Un objet textile KŌMØ pensé autour du mouvement, des capteurs et de l’entraînement.',en:'A KŌMØ textile object built around movement, sensors and training.'},
    bottle:{name:'KŌMØ BOTTLE',cat:'HYDRATE',fr:'Objet quotidien KŌMØ Life, simple et durable, intégré à la routine.',en:'A simple durable KŌMØ Life daily object integrated into the routine.'},
    recovery:{name:'RECOVERY ROLL',cat:'RESET',fr:'Accessoire de mobilité et de récupération présenté directement dans le flagship.',en:'A mobility and recovery accessory displayed directly in the flagship.'},
    travel:{name:'TRAVEL KIT',cat:'RIVIERA',fr:'Kit compact pensé pour prolonger la routine KŌMØ en déplacement.',en:'A compact kit designed to extend the KŌMØ routine while travelling.'},
    jacket:{name:'KŌMØ JACKET',cat:'WEAR',fr:'Une pièce KŌMØ Life pensée comme uniforme quotidien du mouvement : sobre, premium et fonctionnelle.',en:'A KŌMØ Life piece designed as a daily movement uniform: understated, premium and functional.'},
    band:{name:'MOBILITY BAND',cat:'TRAIN',fr:'Un accessoire compact pour intégrer quelques minutes de mobilité et d’activation dans la journée.',en:'A compact accessory for integrating a few minutes of mobility and activation into the day.'}
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
        <article><span>02 · LIFE WALL</span><b>Jacket · Mobility Band · Motion Strap</b><small>Un mur produit et une table découverte permettent désormais d’explorer les objets directement dans World.</small></article>
        <article><span>03 · EDITIONS</span><b>Travel Kit · Selected drops</b><small>Collaborations, séries limitées et objets Riviera.</small></article>
      </div>`
    :`<p>KŌMØ Life extends World into real life: objects, equipment and editions designed around movement and longevity.</p>
      <div class="store-products">
        <article><span>01 · EQUIPMENT</span><b>KŌMØ Case 01</b><small>The configurable KŌMØ case, presented here as a signature object.</small></article>
        <article><span>02 · LIFE WALL</span><b>Jacket · Mobility Band · Motion Strap</b><small>A product wall and discovery table now let you explore objects directly inside World.</small></article>
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
  completeJourney('social');registerNpcTalk(d.label);
  if(d.quest&&NPC_MISSIONS[d.quest]){syncNpcMission(d.quest);showNpcMission(d.quest);return}
  const body=d.role==='coach'?(locale==='fr'?'Je peux te proposer un défi du jour.':'I can give you a daily challenge.'):(locale==='fr'?'Bienvenue dans KŌMØ World.':'Welcome to KŌMØ World.');
  openPanel(d.label||'KŌMØ MEMBER',d.functionLabel||'WORLD MEMBER','<p>'+body+'</p>',[{label:locale==='fr'?'FERMER':'CLOSE',onClick:closePanel}]);
}
function setMode(){
  mode='world';
  world.visible=true;twinRoom.visible=true;rehabRoom.visible=true;arenaRoom.visible=true;rehabCoach.visible=true;
}
let manualCampusDestination=null;
function requestWalkTo(id){
  if(!['hall','twin','rehab','arena'].includes(id))return;
  manualCampusDestination=id;setGuideEnabled(true);closePanel();closeWorldMenu();
  const names={hall:'KŌMØ HALL',twin:'FUNCTIONAL TWIN',rehab:'KŌMØ FITNESS CLUB',arena:'ARENA'};
  notify((locale==='fr'?'PARCOURS À PIED · ':'WALKABLE ROUTE · ')+names[id]);
}
function enterTwin(){requestWalkTo('twin')}
function enterRehab(){requestWalkTo('rehab')}
function enterArena(){requestWalkTo('arena')}
function returnToHall(){requestWalkTo('hall')}

// V5.8 Walkable Campus — room boundaries no longer move the player.
// This hook only records zone entry and clears a manual walking guide once the destination is reached.
let lastCampusZone='hall';
function updateRoomAccess(now){
  if(!intro.classList.contains('hidden'))return;
  const zone=getCampusZone(player);
  if(zone!==lastCampusZone){
    lastCampusZone=zone;
    if(zone==='twin'){completeJourney('twin',{silent:true});completeChallenge('twin')}
    else if(zone==='rehab')completeJourney('rehab',{silent:true});
    else if(zone==='arena'){completeJourney('arena',{silent:true});completeChallenge('arena_visit')}
    if(manualCampusDestination===zone){manualCampusDestination=null;notify(locale==='fr'?'DESTINATION ATTEINTE':'DESTINATION REACHED')}
  }
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
// Visible floor heights are intentionally independent from logical navigation Y.
// The player navigation plane stays simple; only the rendered human is grounded to the actual finish surface.
const AVATAR_SOLE_COMPENSATION=.043;
function visualSurfaceOffsetAt(p=player){
  if(isStairPosition(p))return .012;
  const py=Number(p?.y)||0;
  if(py>UPPER_Y*.55&&isUpperWalkable(p))return .183;
  if(inTwinZone(p)||inArenaZone(p))return .025;
  if(inFitnessZone(p))return .220;
  const x=Number(p?.x)||0,z=Number(p?.z)||0;
  if(Math.abs(x)<11.55&&z<16.8&&z>-30.2){
    // V5 polished runway is higher than the side stone finish.
    return Math.abs(x)<4.34?.421:.365;
  }
  if(z>=16.0&&z<62&&Math.abs(x)<24)return .170;
  if(inTwinLink(p)||inArenaLink(p)||inFitnessLink(p))return .105;
  return .055;
}
function getAvatarGroundLift(p=player){return visualSurfaceOffsetAt(p)+AVATAR_SOLE_COMPENSATION;}

function inTwinZone(p=player){return p.x>-57.2&&p.x<-32.15&&p.z>-13.3&&p.z<12.2}
function inFitnessZone(p=player){return p.x>-11.0&&p.x<11.0&&p.z>-67.5&&p.z<-42.15}
function inArenaZone(p=player){return p.x>32.15&&p.x<57.2&&p.z>-13.3&&p.z<12.2}
// Broad overlapping galleries make each room part of one continuous navigation mesh.
function inTwinLink(p=player){return ((p.x>-35.7&&p.x<-9.15&&p.z>-28.65&&p.z<-19.35)||(p.x>-35.7&&p.x<-28.15&&p.z>-25.7&&p.z<1.85))}
function inArenaLink(p=player){return ((p.x>9.15&&p.x<35.7&&p.z>-28.65&&p.z<-19.35)||(p.x>28.15&&p.x<35.7&&p.z>-25.7&&p.z<1.85))}
function inFitnessLink(p=player){return p.x>-5.35&&p.x<5.35&&p.z>-45.5&&p.z<-26.25}
function getCampusZone(p=player){
  if(inTwinZone(p))return 'twin';
  if(inFitnessZone(p))return 'rehab';
  if(inArenaZone(p))return 'arena';
  return 'hall';
}
function canMove(p){
  if(isStairPosition(p))return true;
  if(playerLevel===1||player.y>UPPER_Y-.70)return isUpperWalkable(p);
  if(inTwinZone(p)||inFitnessZone(p)||inArenaZone(p)||inTwinLink(p)||inArenaLink(p)||inFitnessLink(p))return true;
  // Main Hall / arrival navigation plane.
  if(p.z>81||p.z<-29.15||Math.abs(p.x)>24)return false;
  if(p.z<16.5&&Math.abs(p.x)>11.55)return false;
  if(p.z>=14.1&&p.z<=18.8&&Math.abs(p.x)>4.35)return false;
  if(p.x>-10.1&&p.x<-4.7&&p.z>1.9&&p.z<6.1)return false;
  return true;
}
function commitMove(next){
  const moved=player.distanceTo(next);player.copy(next);syncPlayerElevation();
  if(mode==='world'&&moved>0){addChallengeProgress('distance',moved);if(typeof addNpcMissionProgress==='function')addNpcMissionProgress('noah',moved);}
}
function tryMove(dx,dz){
  const n=player.clone();n.x+=dx;n.z+=dz;if(canMove(n)){commitMove(n);return true}
  const nx=player.clone();nx.x+=dx;if(canMove(nx)){commitMove(nx);return true}
  const nz=player.clone();nz.z+=dz;if(canMove(nz)){commitMove(nz);return true}
  return false;
}
function tryMoveSmooth(dx,dz){
  const distance=Math.hypot(dx,dz);
  const steps=Math.max(1,Math.ceil(distance/.075));
  const sx=dx/steps,sz=dz/steps;
  for(let i=0;i<steps;i++)tryMove(sx,sz);
}

const AUTO_RUN_SPEED=lowPower?6.05:7.05;
const AUTO_RUN_BOOST=lowPower?7.15:8.35;
function updateMovement(dt){
  joyX+= (joyTargetX-joyX)*(1-Math.exp(-18*dt));
  joyY+= (joyTargetY-joyY)*(1-Math.exp(-18*dt));
  if(worldMenu.classList.contains('open')||panel.classList.contains('open')||!intro.classList.contains('hidden')){
    velocity.lerp(new THREE.Vector3(),1-Math.exp(-16*dt));return;
  }
  let x=0,z=0;
  if(isPressed('forward'))z+=1;
  if(isPressed('back'))z-=1;
  if(isPressed('right'))x+=1;
  if(isPressed('left'))x-=1;
  x+=joyX;z+=-joyY;
  const input=new THREE.Vector2(x,z);
  const target=new THREE.Vector3();
  if(input.lengthSq()>.002){
    input.normalize();
    const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
    const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    const speed=isPressed('sprint')?AUTO_RUN_BOOST:AUTO_RUN_SPEED;
    target.addScaledVector(right,input.x).addScaledVector(forward,input.y).normalize().multiplyScalar(speed);
  }
  // Default locomotion is a run. Acceleration is responsive, deceleration stays progressive to avoid skating/snapping.
  const response=input.lengthSq()>.002?10.2:13.4;
  velocity.lerp(target,1-Math.exp(-response*dt));
  if(velocity.lengthSq()>.0004)tryMoveSmooth(velocity.x*dt,velocity.z*dt);
}
function updatePlayerAvatar(now,dt){
  playerAvatar.position.set(player.x,player.y,player.z);
  const av=playerAvatar.userData.avatar;
  const surfaceOffset=visualSurfaceOffsetAt(player);
  const targetBodyLift=surfaceOffset+AVATAR_SOLE_COMPENSATION;
  av.bodyRoot.position.y+= (targetBodyLift-av.bodyRoot.position.y)*(1-Math.exp(-18*dt));
  av.shadow.position.y=surfaceOffset+.004;
  av.ring.position.y=surfaceOffset+.008;
  const speed=velocity.length(),moving=speed>.08;
  let turnDelta=0;
  if(moving){
    const desired=Math.atan2(velocity.x,velocity.z);
    turnDelta=((desired-playerFacing+Math.PI)%(Math.PI*2))-Math.PI;
    playerFacing+=turnDelta*(1-Math.exp(-13.2*dt));
    av.phase+=dt*(8.05+speed*.96);
  }else av.phase+=dt*.44;

  playerAvatar.rotation.y=playerFacing;
  const moveAmount=Math.min(1,speed/AUTO_RUN_SPEED);
  const stride=Math.sin(av.phase)*moveAmount;
  const strideOpp=Math.sin(av.phase+Math.PI)*moveAmount;
  const turn=THREE.MathUtils.clamp(turnDelta,-.45,.45);

  // Permanent run cycle while moving: longer stride, active knee drive and arm counter-swing.
  av.leftLeg.rotation.x=stride*.69;av.rightLeg.rotation.x=strideOpp*.69;
  av.leftKnee.rotation.x=Math.max(0,-stride)*.94;av.rightKnee.rotation.x=Math.max(0,-strideOpp)*.94;
  av.leftShoe.rotation.x=-Math.max(0,-stride)*.23;av.rightShoe.rotation.x=-Math.max(0,-strideOpp)*.23;

  av.leftArm.rotation.x=-stride*.51;av.rightArm.rotation.x=-strideOpp*.51;
  av.leftElbow.rotation.x=.18+Math.max(0,stride)*.24;av.rightElbow.rotation.x=.18+Math.max(0,strideOpp)*.24;
  av.leftArm.rotation.z=-.042+Math.sin(av.phase*.5)*.008*moveAmount;
  av.rightArm.rotation.z=.042-Math.sin(av.phase*.5)*.008*moveAmount;

  av.hipsGroup.rotation.y=Math.sin(av.phase*.5)*.035*moveAmount;
  av.hipsGroup.rotation.z=Math.cos(av.phase)*.010*moveAmount;
  av.torsoGroup.rotation.z=Math.cos(av.phase*.5)*.010*moveAmount-turn*.052;
  av.torsoGroup.rotation.y=Math.sin(av.phase*.5)*.018*moveAmount+turn*.082;
  av.torsoGroup.rotation.x=-.018-.058*moveAmount;
  av.torsoGroup.position.y=1.57+Math.abs(Math.sin(av.phase))*0.026*moveAmount+Math.sin(now*.00135)*.0028*(1-moveAmount);

  // Adult idle posture: open chest, subtle breathing and attention.
  const breathe=Math.sin(now*.00135);
  av.headGroup.rotation.y=Math.sin(now*.00042)*.022+turn*.075;
  av.headGroup.rotation.x=Math.sin(now*.00031)*.006;
  av.headGroup.position.y=2.14+breathe*.0018*(1-moveAmount);
  av.leftHand.rotation.z=Math.sin(av.phase*.5)*.025*moveAmount;
  av.rightHand.rotation.z=-Math.sin(av.phase*.5)*.025*moveAmount;

  av.shadow.material.opacity=.085+.022*(1-moveAmount);
  av.shadow.scale.set(1+.055*moveAmount,.52,1+.035*moveAmount);
  av.ring.material.opacity=.042+.018*(1-moveAmount);
  av.tag.visible=false;
}
function updateCamera(now,dt){
  const smooth=1-Math.exp(-16*dt);
  const visualGround=visualSurfaceOffsetAt(player);
  yaw+=((targetYaw-yaw+Math.PI)%(Math.PI*2)-Math.PI)*smooth;
  pitch+=(targetPitch-pitch)*smooth;
  if(cameraMode==='third'){
    const runAmount=THREE.MathUtils.clamp(velocity.length()/AUTO_RUN_SPEED,0,1);
    const desiredFov=(lowPower?60:54)+(lowPower?1.5:3.0)*runAmount;
    if(Math.abs(camera.fov-desiredFov)>.01){camera.fov+= (desiredFov-camera.fov)*(1-Math.exp(-6*dt));camera.updateProjectionMatrix()}
    const distance=thirdPersonDistance+(lowPower?.10:.34)*runAmount;
    const height=(lowPower?2.00:2.24)+.06*runAmount;
    const shoulder=lowPower?.23:.32;
    cameraDesired.set(
      player.x+Math.sin(yaw)*distance+Math.cos(yaw)*shoulder,
      player.y+visualGround+height+pitch*1.08,
      player.z+Math.cos(yaw)*distance-Math.sin(yaw)*shoulder
    );
    // Cheap camera collision clamp for major architectural volumes.
    if(Math.abs(player.x)<12&&player.z<17.2&&player.z>-28){
      cameraDesired.x=THREE.MathUtils.clamp(cameraDesired.x,-10.9,10.9);
      cameraDesired.z=THREE.MathUtils.clamp(cameraDesired.z,-27.2,16.8);
      cameraDesired.y=THREE.MathUtils.clamp(cameraDesired.y,player.y+visualGround+1.75,player.y+visualGround+(playerLevel===1?3.2:6.5));
    }else if(inTwinZone()){
      cameraDesired.x=THREE.MathUtils.clamp(cameraDesired.x,-55.2,-34.8);cameraDesired.z=THREE.MathUtils.clamp(cameraDesired.z,-11.2,10.2);
    }else if(inFitnessZone()){
      cameraDesired.x=THREE.MathUtils.clamp(cameraDesired.x,-9.2,9.2);cameraDesired.z=THREE.MathUtils.clamp(cameraDesired.z,-65.2,-43.8);
    }else if(inArenaZone()){
      cameraDesired.x=THREE.MathUtils.clamp(cameraDesired.x,34.8,55.2);cameraDesired.z=THREE.MathUtils.clamp(cameraDesired.z,-11.2,10.2);
    }
    camera.position.lerp(cameraDesired,1-Math.exp(-8.6*dt));
    cameraLook.set(player.x,player.y+visualGround+1.24+pitch*.39,player.z);
    camera.lookAt(cameraLook);
  }else{
    const desiredFov=lowPower?61:57;
    if(Math.abs(camera.fov-desiredFov)>.01){camera.fov+=(desiredFov-camera.fov)*(1-Math.exp(-6*dt));camera.updateProjectionMatrix()}
    const move=Math.min(1,velocity.length()/AUTO_RUN_SPEED);
    const bob=move*Math.sin(now*.0102)*.006;
    const eyeY=player.y+visualGround+2.03+bob;
    camera.position.set(player.x,eyeY,player.z);
    const cp=Math.cos(pitch),sp=Math.sin(pitch),look=18;
    camera.lookAt(player.x-Math.sin(yaw)*cp*look,eyeY+sp*look,player.z-Math.cos(yaw)*cp*look);
  }
  updatePlayerAvatar(now,dt);
}
function updateDestinationDoors(now,dt){
  if(!living.destinationDoors?.length)return;
  living.destinationDoors.forEach((d,i)=>{
    // V5.6: destination rooms are permanently open. Glass leaves stay parked inside the jambs.
    d.progress+=(1-d.progress)*(1-Math.exp(-11.5*dt));
    const e=d.progress*d.progress*(3-2*d.progress);
    d.left.position.x=THREE.MathUtils.lerp(-1.82,-2.20,e);
    d.right.position.x=THREE.MathUtils.lerp(1.82,2.20,e);
    d.mat.opacity=.17+.22*e;
    d.beacon.rotation.z=now*.0011*(i%2?1:-1);
    d.beacon.scale.setScalar(1.08+.035*Math.sin(now*.004+i));
    d.beacon.material.opacity=.38;
    d.threshold.material.opacity=.32;
  });
}
function updateDoors(now,dt){
  let approach=mode==='world'&&player.z<27.2&&player.z>8.5&&Math.abs(player.x)<5.2;
  // Ambient people can also trigger the entrance, making it feel like a real place.
  if(!approach&&living.npcs?.length){
    approach=living.npcs.some(n=>n.visible&&Math.abs(n.position.x)<4.4&&n.position.z<23.5&&n.position.z>12.0&&Math.abs(n.position.y)<.8);
  }
  if(approach)doorHoldUntil=now+1350;
  doorTarget=(approach||now<doorHoldUntil)?1:0;
  // Smooth exponential motion, faster opening than closing.
  const response=doorTarget?11.2:4.6;
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
function syncQuickNav(zone){
  document.querySelectorAll('#world-quick-nav [data-nav-zone]').forEach(btn=>{
    const active=btn.dataset.navZone===zone;
    btn.classList.toggle('active',active);
    if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
  });
}
let lastWorldZone='';
function showWorldZone(label,purpose=''){
  if(label===lastWorldZone)return;
  lastWorldZone=label;locationName.textContent=label;
  if(locationPurpose)locationPurpose.textContent=purpose;
  locationChip?.classList.remove('show');void locationChip?.offsetWidth;locationChip?.classList.add('show');
  clearTimeout(showWorldZone.t);showWorldZone.t=setTimeout(()=>locationChip?.classList.remove('show'),2600);
}
function updateLocation(){
  let label='KŌMØ HALL',purpose=locale==='fr'?'VOTRE POINT CENTRAL':'YOUR HOME BASE',nav='hall';
  if(inTwinZone()){label='FUNCTIONAL TWIN';purpose=locale==='fr'?'COMPRENDRE VOTRE MOUVEMENT':'UNDERSTAND YOUR MOVEMENT';nav='twin';completeJourney('twin',{silent:true})}
  else if(inFitnessZone()){label='KŌMØ FITNESS CLUB';purpose=locale==='fr'?'BOUGER · S’ENTRAÎNER · PROGRESSER':'MOVE · TRAIN · PROGRESS';nav='';completeJourney('rehab',{silent:true})}
  else if(inArenaZone()){label='ARENA';purpose=locale==='fr'?'DÉFIS · PROGRESSION · COMMUNAUTÉ':'CHALLENGES · PROGRESSION · COMMUNITY';nav='';completeJourney('arena',{silent:true});completeChallenge('arena_visit')}
  else if(playerLevel===1){
    nav='upper';completeJourney('upper',{silent:true});
    label=player.z<-18.8?'UPPER OBSERVATORY':player.x<0?'SCIENCE LIBRARY · LEVEL 2':'LIFE LOUNGE · LEVEL 2';
    purpose=player.z<-18.8?(locale==='fr'?'VOIR LE WORLD AUTREMENT':'A NEW VIEW OF WORLD'):player.x<0?(locale==='fr'?'SCIENCE · MÉTHODE · SOURCES':'SCIENCE · METHOD · SOURCES'):(locale==='fr'?'OBJETS · CULTURE · DISCOVERY':'OBJECTS · CULTURE · DISCOVERY');
  }else if(inTwinLink()){label='TWIN GALLERY';purpose=locale==='fr'?'COURIR VERS FUNCTIONAL TWIN':'RUN TO FUNCTIONAL TWIN'}
  else if(inArenaLink()){label='ARENA GALLERY';purpose=locale==='fr'?'COURIR VERS ARENA':'RUN TO ARENA'}
  else if(inFitnessLink()){label='FITNESS TUNNEL';purpose=locale==='fr'?'COURIR VERS FITNESS CLUB':'RUN TO FITNESS CLUB'}
  else if(player.z>57){label='KŌMØ DISTRICT';purpose=locale==='fr'?'CAMPUS EXTÉRIEUR':'OUTDOOR CAMPUS'}
  else if(player.z>23){label='ARRIVAL COURT';purpose=locale==='fr'?'ARRIVÉE · HOSPITALITY':'ARRIVAL · HOSPITALITY'}
  else if(player.z>11.8){label='WORLD ENTRANCE';purpose=locale==='fr'?'ENTRER DANS VOTRE WORLD':'ENTER YOUR WORLD'}
  else if(player.x>6.8&&player.z>-2&&player.z<7){label='KŌMØ LIFE';purpose=locale==='fr'?'OBJETS · ÉQUIPEMENT · ÉDITIONS':'OBJECTS · EQUIPMENT · EDITIONS';nav='life';completeJourney('life',{silent:true})}
  else if(player.z>-7){label='KŌMØ HALL';purpose=locale==='fr'?'VOTRE POINT CENTRAL':'YOUR HOME BASE';completeJourney('hall',{silent:true})}
  else{label='MOTION ATRIUM';purpose=locale==='fr'?'ACCÈS TWIN · FITNESS · ARENA':'TWIN · FITNESS · ARENA'}
  if(menuCurrentZone)menuCurrentZone.textContent=label;
  if(menuCurrentPurpose)menuCurrentPurpose.textContent=purpose;
  document.querySelectorAll('.world-destinations [data-destination]').forEach(btn=>{
    const map={hall:'hall',twin:'twin',fitness:'',arena:''};
    const key=btn.dataset.destination;
    const active=(key==='hall'&&nav==='hall')||(key==='twin'&&nav==='twin')||(key==='fitness'&&inFitnessZone())||(key==='arena'&&inArenaZone());
    btn.classList.toggle('active',active);
  });
  syncQuickNav(nav);showWorldZone(label,purpose);
}
function updateHeading(){
  const a=((yaw%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  const dirs=['N','NE','E','SE','S','SW','W','NW'];
  headingEl.textContent=dirs[Math.round(a/(Math.PI/4))%8];
}
function updateInteraction(){
  const pool=[...interactions,...twinInteractions,...rehabInteractions,...arenaInteractions];
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
  if(inTwinZone()){
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
  if(inFitnessZone()){
    animateRehabCoach(now,Math.min(.05,(now-(updateTwinScan.lastNow||now))/1000||.016));updateTwinScan.lastNow=now;
    Object.values(rehabStationVisuals).forEach((v,i)=>{
      if(!rehabSessionTimer)v.pulse.scale.setScalar(.95+.06*Math.sin(now*.0016+i*.9));
      v.ring.rotation.z=now*.00022*(i%2?1:-1);
    });
  }
}

window.addEventListener('keydown',e=>{
  const movement=['forward','back','left','right','sprint'].some(a=>keyHas(a,e.code));
  if(movement){keys.add(e.code);e.preventDefault()}
  if(keyHas('action',e.code)&&!worldMenu.classList.contains('open')&&!panel.classList.contains('open')){triggerAction();e.preventDefault()}
  if(keyHas('menu',e.code)&&!panel.classList.contains('open')){toggleWorldMenu();e.preventDefault()}
  if(keyHas('camera',e.code)&&!panel.classList.contains('open')){toggleCamera();e.preventDefault()}
  if(keyHas('guide',e.code)&&!panel.classList.contains('open')){toggleGuide();e.preventDefault()}
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

let worldEntryComplete=false;
function setIntroAuthStatus(message='',error=false){
  if(!introAuthStatus)return;
  introAuthStatus.textContent=message;introAuthStatus.classList.toggle('error',!!error);
}
function setIntroAuthBusy(busy){
  if(introPulse)introPulse.disabled=!!busy;
  const guest=$('#intro-enter');if(guest)guest.disabled=!!busy;
  if(introGuestName)introGuestName.disabled=!!busy;
}
function defaultGuestName(){
  const stored=(localStorage.getItem('komo_world_guest_name')||'').trim();
  if(stored)return stored.slice(0,24);
  const suffix=String(Math.floor(1000+Math.random()*9000));
  return (locale==='fr'?'Invité ':'Guest ')+suffix;
}
function enterWorldAfterAuth(detail={}){
  if(worldEntryComplete)return;
  worldEntryComplete=true;setIntroAuthBusy(false);setIntroAuthStatus('');
  intro.classList.add('hidden');
  document.body.classList.remove('world-intro-active');
  targetYaw=yaw;targetPitch=pitch;completeJourney('arrival');
  const guestMode=String(detail.mode||'').startsWith('guest');
  const mode=guestMode?(locale==='fr'?'Invité':'Guest'):'Pulse';
  notify((locale==='fr'?'Bienvenue dans KŌMØ World · ':'Welcome to KŌMØ World · ')+mode);
}
function waitForWorldMultiplayer(timeout=6500){
  if(window.KomoWorldMultiplayer)return Promise.resolve(window.KomoWorldMultiplayer);
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{window.removeEventListener('komo:world-multiplayer-ready',onReady);reject(new Error('Multiplayer indisponible'))},timeout);
    const onReady=()=>{clearTimeout(timer);resolve(window.KomoWorldMultiplayer)};
    window.addEventListener('komo:world-multiplayer-ready',onReady,{once:true});
  });
}
window.addEventListener('komo:world-session-ready',event=>enterWorldAfterAuth(event.detail||{}));
window.addEventListener('komo:world-auth-error',event=>{
  const message=event.detail?.message||(locale==='fr'?'Connexion impossible.':'Connection failed.');
  setIntroAuthBusy(false);setIntroAuthStatus(message,true);
});

introPulse?.addEventListener('click',()=>{
  setIntroAuthStatus(locale==='fr'?'Connexion à Pulse…':'Connecting to Pulse…');setIntroAuthBusy(true);

  // Never await before opening Pulse: the popup must stay inside the native user gesture.
  const api=window.KomoWorldMultiplayer;
  if(api?.connectPulse){
    try{
      const result=api.connectPulse();
      Promise.resolve(result).then(value=>{
        if(value===true)return;
        if(value==='pending'){
          setIntroAuthStatus(locale==='fr'?'Pulse est ouvert. Connectez-vous : World se connectera automatiquement.':'Pulse is open. Sign in and World will connect automatically.');
          setTimeout(()=>setIntroAuthBusy(false),1100);return;
        }
        setIntroAuthBusy(false);
        setIntroAuthStatus(locale==='fr'?'La fenêtre Pulse a été bloquée. Autorisez les fenêtres puis réessayez.':'The Pulse window was blocked. Allow pop-ups and try again.',true);
      }).catch(err=>{setIntroAuthBusy(false);setIntroAuthStatus(err?.message||'Connexion Pulse impossible.',true)});
      return;
    }catch(err){
      setIntroAuthBusy(false);setIntroAuthStatus(err?.message||'Connexion Pulse impossible.',true);return;
    }
  }

  // Multiplayer module is not ready yet: open Pulse synchronously anyway, then let the bridge retry until ACK.
  const popup=window.open(
    'https://pulse.komolongevity.com/?world_bridge=1&world_origin='+encodeURIComponent(location.origin),
    'komoPulseWorldBridge',
    'popup=yes,width=520,height=760,resizable=yes,scrollbars=yes'
  );
  if(!popup){
    setIntroAuthBusy(false);
    setIntroAuthStatus(locale==='fr'?'La fenêtre Pulse a été bloquée. Autorisez les fenêtres puis réessayez.':'The Pulse window was blocked. Allow pop-ups and try again.',true);
    return;
  }
  setIntroAuthStatus(locale==='fr'?'Pulse est ouvert. Connectez-vous : World se connectera automatiquement.':'Pulse is open. Sign in and World will connect automatically.');
  waitForWorldMultiplayer().catch(()=>{});
  setTimeout(()=>setIntroAuthBusy(false),1100);
});

$('#intro-enter').addEventListener('click',()=>{
  const name=(introGuestName?.value||'').trim().slice(0,24)||defaultGuestName();
  if(introGuestName)introGuestName.value=name;
  localStorage.setItem('komo_world_guest_name',name);

  // Guest access is never blocked by Auth or multiplayer availability.
  enterWorldAfterAuth({mode:'guest-local',display_name:name});

  // Upgrade silently to authenticated anonymous multiplayer when available.
  waitForWorldMultiplayer(12000).then(api=>api.connectGuest(name)).then(ok=>{
    if(ok)notify(locale==='fr'?'Mode multijoueur connecté.':'Multiplayer connected.');
  }).catch(err=>console.warn('[World guest background connect]',err));
});
$('#panel-close').addEventListener('click',closePanel);
worldMenuToggle.addEventListener('click',toggleWorldMenu);
worldMenuClose.addEventListener('click',closeWorldMenu);
resultsToggle?.addEventListener('click',showHealthOverview);
campusToggle?.addEventListener('click',showCampusMap);
journeyToggle?.addEventListener('click',()=>{closeWorldMenu();showJourneyPanel()});
cameraToggle.addEventListener('click',toggleCamera);
guideToggle.addEventListener('click',toggleGuide);
controlsToggle.addEventListener('click',()=>{closeWorldMenu();showControlsPanel()});
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
  if(introPulse){introPulse.querySelector('strong').textContent=c.introPulse;introPulse.querySelector('em').textContent=c.introPulseMeta}
  const guestLabel=intro.querySelector('.intro-guest-name>span');if(guestLabel)guestLabel.textContent=c.introGuest;
  if(introGuestName)introGuestName.placeholder=c.introGuestPlaceholder;
  if(introAuthNote)introAuthNote.textContent=c.introAuthNote;
  mobileAction.textContent=c.action;
  languageToggle.textContent=locale==='fr'?'EN':'FR';
  $('#world-menu-copy').textContent=locale==='fr'?'Votre santé, votre progression et le campus KŌMØ au même endroit.':'Your health, progress and the KŌMØ campus in one place.';
  const controlHints=document.querySelectorAll('.world-menu-controls span');
  if(controlHints.length>=6){
    controlHints[0].innerHTML='<kbd>'+keybinds.forward.map(keyLabel).join('/')+'</kbd> MOVE';
    controlHints[1].innerHTML='<kbd>'+keybinds.sprint.map(keyLabel).join('/')+'</kbd> SPRINT';
    controlHints[2].innerHTML='<kbd>'+keybinds.action.map(keyLabel).join('/')+'</kbd> ACTION';
    controlHints[3].innerHTML='<kbd>'+keybinds.camera.map(keyLabel).join('/')+'</kbd> CAMERA';
    controlHints[4].innerHTML='<kbd>'+keybinds.guide.map(keyLabel).join('/')+'</kbd> GUIDE';
    controlHints[5].innerHTML='<kbd>'+keybinds.menu.map(keyLabel).join('/')+'</kbd> MENU';
  }
  updateJourneyUI();updateHealthHUD();
  if(currentInteraction){interactionTitle.textContent=currentInteraction.title();interactionCopy.textContent=currentInteraction.desc()}
  if(panel.classList.contains('open')){
    if(mode==='twin')showTwin();else if(mode==='rehab')showRehab();else if(mode==='arena')showArena();
  }
}
languageToggle.addEventListener('click',()=>{locale=locale==='fr'?'en':'fr';applyLocale()});

window.addEventListener('resize',()=>{
  document.body.classList.toggle('world-mobile-ui',lowPower||innerWidth<=900);
  document.body.classList.toggle('desktop-visual-v5',!lowPower&&innerWidth>900);
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  applyRenderScale();
});

let last=performance.now(),raf=0;
function updateLightBudget(now){
  if(now-lastBudgetUpdate<280)return;
  lastBudgetUpdate=now;
  const candidates=[];
  // V6.3.1: every non-structural realtime practical shares one budget.
  for(const l of new Set([...living.lights,...hallLights])){
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
    l.intensity=(l.userData.profileIntensity||l.userData.baseIntensity||1)*THREE.MathUtils.clamp(1-d/20,.28,1);
  });
}
function updateRealismLOD(){
  // Textured structural walls always remain. Only fine overlays/washes are distance-gated.
  const twinD=Math.hypot(player.x+45,player.z+2);
  const fitD=Math.hypot(player.x,player.z+55);
  const arenaD=Math.hypot(player.x-45,player.z+2);
  const hallDetail=player.z>-31&&player.z<21&&Math.abs(player.x)<15;
  if(typeof hallWallsV59!=='undefined')hallWallsV59.visible=hallDetail;
  if(typeof twinWallV59!=='undefined')twinWallV59.visible=twinD<(lowPower?25:40);
  if(typeof fitnessWallsV59!=='undefined')fitnessWallsV59.visible=fitD<(lowPower?25:40);
  if(typeof arenaWallsV59!=='undefined')arenaWallsV59.visible=arenaD<(lowPower?25:40);
  if(typeof galleryWallsV59!=='undefined'){
    const nearGallery=inTwinLink(player)||inArenaLink(player)||inFitnessLink(player)||(!inTwinZone(player)&&!inFitnessZone(player)&&!inArenaZone(player)&&player.z<-15);
    galleryWallsV59.visible=nearGallery||Math.min(twinD,fitD,arenaD)<(lowPower?18:28);
  }
  if(typeof accessArchitectureV62!=='undefined'){
    const nearAccess=inTwinLink(player)||inArenaLink(player)||inFitnessLink(player)||player.z<-14;
    accessArchitectureV62.visible=nearAccess||Math.min(twinD,fitD,arenaD)<(lowPower?22:34);
  }
  if(typeof grandFlagshipV61!=='undefined'){
    grandFlagshipV61.visible=!emergencyPerformance&&(!lowPower||player.z>-30&&player.z<18);
  }
  if(typeof destinationTheatreV61!=='undefined'){
    destinationTheatreV61.visible=!emergencyPerformance&&player.z<12&&player.z>-40;
  }
  if(typeof realismLightWashesV60!=='undefined'){
    realismLightWashesV60.visible=!emergencyPerformance;
    hallWashInst.visible=hallDetail;
    twinWashInst.visible=twinD<(lowPower?23:36);
    fitWashInst.visible=fitD<(lowPower?23:36);
    arenaWashInst.visible=arenaD<(lowPower?23:36);
  }
  if(living.lightingV631){
    const L=living.lightingV631;
    L.root.visible=!emergencyPerformance;
    L.structural.visible=hallDetail;
    decorativeHallV631.visible=hallDetail;
    decorativeTwinV631.visible=twinD<(lowPower?22:36);
    decorativeFitV631.visible=fitD<(lowPower?22:36);
    decorativeArenaV631.visible=arenaD<(lowPower?22:36);
    L.destination.visible=player.z<8&&player.z>-38&&Math.abs(player.x)<15;
  }
}
function updateVisibilityBudget(now){
  if(now-lastVisibilityUpdate<420)return;
  lastVisibilityUpdate=now;
  if(mode!=='world')return;
  updateRealismLOD();
  // Coarse occlusion/distance budget: do not draw whole zones when they cannot contribute.
  const deepHall=player.z<7;
  exterior.visible=player.z>5;
  if(living.district)living.district.visible=player.z>35;
  if(living.atmosphereV632)living.atmosphereV632.visible=!emergencyPerformance;
  if(typeof arrivalHeroV632!=='undefined')arrivalHeroV632.visible=!emergencyPerformance&&player.z>8;
  if(living.livingCampusV64){
    const campusNear=player.z>9||camera.position.z>12;
    living.livingCampusV64.visible=!emergencyPerformance&&campusNear;
    campusCrowdV64.visible=!lowPower||player.z>42;
    rearTerraceV64.visible=!lowPower||player.z>52;
  }
  upperLevel.visible=playerLevel===1||player.z<16;
  hallLiving.visible=player.z<19&&player.z>-29;hallHost.visible=mode==='world'&&player.z<20&&player.z>-8;
  hallLightGroup.visible=!lowPower&&!emergencyPerformance&&player.z<22&&player.z>-31&&Math.abs(player.x)<15;
  if(typeof desktopCinematic!=='undefined')desktopCinematic.visible=!lowPower&&!emergencyPerformance&&player.z<21&&player.z>-31;
  lifeStore.visible=Math.hypot(player.x-8.45,player.z-3.8)<24;
  // Structural rooms and destination vistas stay visible; only dense premium detail is distance-budgeted.
  if(typeof twinPremium!=='undefined')twinPremium.visible=Math.hypot(player.x+45,player.z)<52;
  if(typeof fitPremium!=='undefined')fitPremium.visible=Math.hypot(player.x,player.z+55)<52;
  if(typeof arenaPremium!=='undefined')arenaPremium.visible=Math.hypot(player.x-45,player.z)<52;
  destinationVistas.visible=player.z<3&&player.z>-35&&Math.abs(player.x)<14;
  arrivalDetails.visible=player.z>1&&player.z<26;
  npcRoot.visible=true;
  living.trees.forEach(tree=>{
    const wp=new THREE.Vector3();tree.getWorldPosition(wp);
    const hero=tree.name==='KOMO_HERO_TREE_V64';
    tree.visible=wp.distanceTo(camera.position)<(hero?(lowPower?54:82):(lowPower?30:46));
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
  if(typeof desktopCinematic!=='undefined')desktopCinematic.visible=false;
  if(typeof realismLightWashesV60!=='undefined')realismLightWashesV60.visible=false;
  if(typeof grandFlagshipV61!=='undefined')grandFlagshipV61.visible=false;
  if(typeof destinationTheatreV61!=='undefined')destinationTheatreV61.visible=false;
  if(typeof accessArchitectureV62!=='undefined')accessArchitectureV62.visible=false;
  if(living.lightingV631)living.lightingV631.root.visible=false;
  if(living.atmosphereV632)living.atmosphereV632.visible=false;
  if(typeof arrivalHeroV632!=='undefined')arrivalHeroV632.visible=false;
  if(living.livingCampusV64)living.livingCampusV64.visible=false;
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
    if(!q.userData.v64Local)q.position.z=25.5+travel*29.0;
    else q.position.x=Math.sin(t*.20+i*.8)*.18;
    q.material.opacity=.045+.045*(.5+.5*Math.sin(t*.7+i));
  });
  if(living.dust){
    living.dust.rotation.y=Math.sin(t*.04)*.035;
    living.dust.position.y=Math.sin(t*.18)*.04;
    living.dust.material.opacity=.14+.06*(.5+.5*Math.sin(t*.23));
  }
  if(twinVistaRings?.length){
    twinVistaRings.forEach((ring,i)=>{
      ring.rotation.z=t*(i%2?.17:-.14)+(ring.userData.phase||0);
      const p=1+.05*Math.sin(t*.92+i*.8);ring.scale.setScalar(p);
    });
  }
  if(fitVistaMarkers?.length){
    fitVistaMarkers.forEach((marker,i)=>{
      const travel=((t*.34+i*.13)%1);
      marker.position.z=2.55-travel*5.9;
      marker.material.opacity=.30+.32*(.5+.5*Math.sin(t*1.5+i));
    });
  }
  if(arenaVistaRings?.length){
    arenaVistaRings.forEach((ring,i)=>{
      const pulse=1+.055*Math.sin(t*1.25+i*.9);
      ring.scale.setScalar(pulse);ring.rotation.z=t*(i%2?.10:-.08);
      ring.material.opacity=.30+.28*(.5+.5*Math.sin(t*.85+i));
    });
  }
  if(portalActors?.length){
    portalActors.forEach((actor,i)=>{
      actor.position.y=Math.sin(t*.72+(actor.userData.phase||i))*.018;
      actor.rotation.y=.18*Math.sin(t*.30+i*.8);
    });
  }
  if(typeof twinCeilingHalo!=='undefined'){
    twinCeilingHalo.rotation.z=t*.055;
    twinCeilingHalo.material.opacity=.48+.18*(.5+.5*Math.sin(t*.52));
  }
  if(typeof arenaCanopy!=='undefined'){
    arenaCanopy.rotation.z=t*.042;
    arenaCanopyInner.rotation.z=-t*.058;
    const ap=1+.024*Math.sin(t*.82);arenaCanopy.scale.setScalar(ap);
  }
  if(typeof fitnessStatusBars!=='undefined'){
    fitnessStatusBars.forEach((bar,i)=>{
      bar.scale.x=.58+.42*(.5+.5*Math.sin(t*.92+(bar.userData.phase||i)));
      bar.material.opacity=.36+.28*(.5+.5*Math.sin(t*.71+i*.6));
    });
  }
  // V5.9 wall washes breathe almost imperceptibly; no extra dynamic lights are used.
  if(typeof hallWallGlow!=='undefined')hallWallGlow.opacity=(lowPower?.16:.25)+.05*(.5+.5*Math.sin(t*.24));
  if(typeof twinWallGlow!=='undefined')twinWallGlow.opacity=(lowPower?.20:.34)+.07*(.5+.5*Math.sin(t*.33));
  if(typeof fitnessWallGlow!=='undefined')fitnessWallGlow.opacity=(lowPower?.18:.29)+.06*(.5+.5*Math.sin(t*.29));
  if(typeof arenaWallGlow!=='undefined')arenaWallGlow.opacity=(lowPower?.21:.36)+.08*(.5+.5*Math.sin(t*.38));
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
  if(typeof grandArmillaryV61!=='undefined'){
    grandRingA.rotation.y=.52+t*.045;
    grandRingB.rotation.z=.44-t*.058;
    grandRingC.rotation.x=.75+t*.072;
    grandArmillaryV61.position.y=4.20+Math.sin(t*.34)*.025;
    grandCoreV61.scale.setScalar(.94+.08*(.5+.5*Math.sin(t*.62)));
  }
  if(typeof destinationTheatreV61!=='undefined'&&!lowPower){
    destinationTheatreV61.children.forEach((o,i)=>{
      if(o.geometry?.type==='TorusGeometry'){
        o.rotation.z=Math.sin(t*.22+(o.userData.phase||i))*.035;
        const p=1+.018*Math.sin(t*.52+(o.userData.phase||i));o.scale.setScalar(p);
      }
    });
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
      let x=cloud.userData.baseX+t*cloud.userData.speed;
      while(x>125)x-=250;
      cloud.position.x=x;
      cloud.position.z=cloud.userData.baseZ+Math.sin(t*.018+cloud.userData.phase)*1.10;
      cloud.material.opacity=cloud.userData.baseOpacity*(.90+.10*Math.sin(t*.035+i*.67));
    });
  }
  if(living.waterfallsV64?.length){
    living.waterfallsV64.forEach((w,i)=>{
      w.texture.offset.y=-(t*.045+i*.13)%1;
      w.mesh.material.opacity=w.baseOpacity*(.92+.08*Math.sin(t*.33+i));
    });
  }
  if(living.fountainJets?.length){
    living.fountainJets.forEach((jet,i)=>{
      if(jet.geometry?.type==='RingGeometry'){
        const pulse=.96+.08*Math.sin(t*.75+(jet.userData.ripplePhase||0));
        jet.scale.set(pulse,pulse,pulse);
        jet.material.opacity=.10+.08*(.5+.5*Math.sin(t*.8+i*.55));
      }else{
        const base=jet===centralJet?1.0:.72;
        const amp=jet===centralJet?.78:.52;
        const h=base+amp*(.5+.5*Math.sin(t*1.25+(jet.userData.phase||0)));
        jet.scale.y=h;jet.position.y=(jet.userData.baseY||.95)+(h-base)*.38;
        jet.material.opacity=.30+.16*(.5+.5*Math.sin(t*.9+i*.4));
      }
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
  updateRoomAccess(now);
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
  version:'6.4.0-living-campus',
  THREE,scene,camera,renderer,core,
  enterTwin,enterRehab,enterArena,returnToHall,
  getState:()=>({position:player.clone(),yaw:cameraMode==='third'?playerFacing:yaw,mode,level:playerLevel}),
  getLocale:()=>locale,
  getPerformance:()=>({fps:fpsEMA,qualityMode,renderScale,pixelRatio:renderer.getPixelRatio(),drawCalls:renderer.info.render.calls,activeLightBudget,shadows:renderer.shadowMap.enabled,retinaMobile}),
  getJourney:()=>({xp:journey.xp,done:{...journey.done},level:journeyLevelForXp(journey.xp)}),
  completeSocial:()=>completeJourney('social'),
  socialChallenge:socialChallengeEvent,
  getAvatarGroundLift:(p)=>getAvatarGroundLift(p||player),
  getVisualSurfaceOffset:(p)=>visualSurfaceOffsetAt(p||player),
  getChallengeState:()=>({date:challenges.date,progress:{...challenges.progress},done:{...challenges.done},points:challenges.points}),
  getNpcMissions:()=>({date:npcMissionState.date,missions:JSON.parse(JSON.stringify(npcMissionState.missions)),talked:[...npcMissionState.talked]}),
  getDailyHealth:()=>dailyHealth?{...dailyHealth}:null,
  ingestDailyHealth,
  getCameraMode:()=>cameraMode,
  fastTravel,
  joinPresence,
  notify
};
import('./world-multiplayer-v1.js?v=20260924-auth-v121')
  .then(mod=>mod.mount?.(window.KomoWorld))
  .catch(err=>console.warn('[KŌMØ World multiplayer] optional layer unavailable',err));

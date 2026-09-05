import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const runtime=window.KomoWorldRuntime;
if(!runtime?.scene)throw new Error('KŌMØ V0.13.1 runtime unavailable');
const {scene}=runtime;

function makeTexture(kind){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  if(kind==='stone'){
    x.fillStyle='#e8ddca';x.fillRect(0,0,256,256);
    for(let i=0;i<3200;i++){const g=190+Math.random()*50|0;x.fillStyle=`rgba(${g},${g-7},${g-15},${.012+Math.random()*.035})`;x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2,1+Math.random()*2)}
    x.strokeStyle='rgba(148,128,102,.16)';x.lineWidth=.6;
    for(let i=0;i<12;i++){x.beginPath();let y=Math.random()*256;x.moveTo(-12,y);for(let s=0;s<7;s++){y+=(-7+Math.random()*14);x.lineTo(s*48,y)}x.stroke()}
  }else{
    x.fillStyle='#253a30';x.fillRect(0,0,256,256);
    for(let i=0;i<120;i++){const y=Math.random()*256;x.fillStyle=`rgba(255,255,255,${.008+Math.random()*.022})`;x.fillRect(0,y,256,.6+Math.random()*1.4)}
    for(let i=0;i<800;i++){x.fillStyle=`rgba(0,0,0,${.008+Math.random()*.02})`;x.fillRect(Math.random()*256,Math.random()*256,1,1)}
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1.5,1.5);return t;
}
const stoneTx=makeTexture('stone'),sageTx=makeTexture('sage');
const MAT={
  stone:new THREE.MeshStandardMaterial({map:stoneTx,color:0xf1e7d7,roughness:.72,metalness:.01}),
  stone2:new THREE.MeshStandardMaterial({map:stoneTx,color:0xcdbfa9,roughness:.82,metalness:.01}),
  sage:new THREE.MeshStandardMaterial({map:sageTx,color:0x263b31,roughness:.56,metalness:.04}),
  sageSoft:new THREE.MeshStandardMaterial({color:0x738777,roughness:.62,metalness:.03}),
  bronze:new THREE.MeshStandardMaterial({color:0xa77e50,roughness:.34,metalness:.58}),
  gold:new THREE.MeshStandardMaterial({color:0xd4b276,roughness:.29,metalness:.48,emissive:0x5b3b16,emissiveIntensity:.18}),
  glass:new THREE.MeshPhysicalMaterial({color:0xb9c9bf,roughness:.12,metalness:0,transparent:true,opacity:.26,transmission:.16,depthWrite:false}),
  darkGlass:new THREE.MeshPhysicalMaterial({color:0x1b2b23,roughness:.2,transparent:true,opacity:.48,transmission:.08,depthWrite:false}),
  warm:new THREE.MeshStandardMaterial({color:0xffd59e,emissive:0xffbf78,emissiveIntensity:2.5,roughness:.3})
};
function box(g,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
function plaqueTexture(title,subtitle,{dark=true,accent='#d9bd8e',number=''}={}){
  const c=document.createElement('canvas');c.width=1400;c.height=360;const x=c.getContext('2d');
  x.fillStyle=dark?'rgba(25,39,32,.96)':'rgba(238,229,214,.97)';x.fillRect(0,0,c.width,c.height);
  x.strokeStyle=dark?'rgba(221,193,143,.40)':'rgba(67,83,72,.22)';x.lineWidth=4;x.strokeRect(5,5,c.width-10,c.height-10);
  if(number){x.fillStyle=accent;x.font='700 74px Arial';x.textAlign='left';x.textBaseline='top';x.fillText(number,70,50)}
  x.fillStyle=dark?'#f4ecdf':'#21352b';x.font='600 118px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(title,c.width/2,155);
  x.fillStyle=dark?accent:'#7b684d';x.font='600 38px Arial';x.letterSpacing='4px';x.fillText(subtitle.toUpperCase(),c.width/2,275);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function addPlaque(g,title,subtitle,{x=0,y=6.25,z=.61,w=6.6,h=1.7,dark=true,number='',rot=0}={}){
  const tx=plaqueTexture(title,subtitle,{dark,number});const m=new THREE.MeshBasicMaterial({map:tx,transparent:false,side:THREE.DoubleSide});const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);p.position.set(x,y,z);p.rotation.y=rot;p.userData.texture=tx;g.add(p);return p
}
function hideGroupsNear(x,z,r=.45){scene.children.forEach(o=>{if(o.isGroup&&Math.hypot(o.position.x-x,o.position.z-z)<r)o.visible=false})}

// Remove prototype portal language. Interactions remain untouched.
hideGroupsNear(-11,-24.45,.7);hideGroupsNear(0,-24.45,.7);hideGroupsNear(12.5,-14.8,.8);hideGroupsNear(-22,-14,.7);hideGroupsNear(22,-14,.7);hideGroupsNear(22,-5,.7);

function buildFacade({name,x,z,rot=0,width=8.4,height=6.8,title,subtitle,number,variant='sage'}){
  const g=new THREE.Group();g.name=name;g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
  const dark=variant!=='light',main=variant==='arena'?MAT.sage:variant==='light'?MAT.stone:MAT.sage;
  box(g,width,.18,3.2,MAT.stone,0,.10,.55);
  box(g,.72,height,1.0,MAT.stone,-width/2+.36,height/2,0);box(g,.72,height,1.0,MAT.stone,width/2-.36,height/2,0);
  box(g,width-.65,.58,1.0,main,0,height-.29,0);
  box(g,width-1.75,height-1.6,.16,dark?MAT.darkGlass:MAT.glass,0,(height-1.2)/2,.49);
  box(g,.055,height-1.9,.06,MAT.warm,-width/2+.82,(height-1.2)/2,.61);box(g,.055,height-1.9,.06,MAT.warm,width/2-.82,(height-1.2)/2,.61);
  box(g,width-1.7,.055,.06,MAT.warm,0,height-.82,.61);
  box(g,.10,height-2.1,.13,MAT.bronze,0,(height-1.4)/2,.57);
  box(g,width-2.0,.10,.38,MAT.bronze,0,.27,.76);
  addPlaque(g,title,subtitle,{x:0,y:height+.83,z:.62,w:Math.min(width,8.0),h:1.75,dark,number});
  const glow=new THREE.PointLight(0xffca8b,variant==='arena'?8:5.5,14,2);glow.position.set(0,height*.68,2.0);g.add(glow);
  return g
}

buildFacade({name:'KOMO_V131_TWIN_FRONT',x:-11,z:-24.45,width:9.4,height:7.0,title:'TWIN LAB',subtitle:'Votre corps · à travers le temps',number:'01',variant:'sage'});
buildFacade({name:'KOMO_V131_REHAB_FRONT',x:0,z:-24.45,width:8.0,height:6.5,title:'REHAB',subtitle:'Bouger · récupérer · progresser',number:'02',variant:'light'});
buildFacade({name:'KOMO_V131_ARENA_FRONT',x:12.5,z:-14.8,rot:-.14,width:10.0,height:7.4,title:'ARENA',subtitle:'Défis · clubs · saison 01',number:'03',variant:'arena'});

// Secondary destinations become restrained architectural doors, not portals.
buildFacade({name:'KOMO_V131_LIBRARY_FRONT',x:-22,z:-14,rot:Math.PI/2,width:6.6,height:5.7,title:'LIBRARY',subtitle:'Science · méthode · connaissances',number:'04',variant:'light'});
buildFacade({name:'KOMO_V131_THEATRE_FRONT',x:22,z:-14,rot:-Math.PI/2,width:6.6,height:5.7,title:'TALKS',subtitle:'Conférences · experts · événements',number:'05',variant:'sage'});
buildFacade({name:'KOMO_V131_STORE_FRONT',x:22,z:-5,rot:-Math.PI/2,width:6.2,height:5.3,title:'STORE',subtitle:'KŌMŌ Life · objets · équipement',number:'06',variant:'light'});

// Strong overhead wayfinding board: legible before reaching the destinations.
const directory=new THREE.Group();directory.name='KOMO_V131_DIRECTORY';directory.position.set(0,0,-10.5);scene.add(directory);
box(directory,12.8,.20,.32,MAT.sage,0,5.65,0);box(directory,.06,.78,.04,MAT.warm,-6.15,5.65,.18);box(directory,.06,.78,.04,MAT.warm,6.15,5.65,.18);
addPlaque(directory,'TWIN LAB  ←   ·   REHAB  ↑   ·   ARENA  →','Explorer KŌMŌ World',{x:0,y:5.65,z:.19,w:11.9,h:1.15,dark:true});

// Concierge becomes a hospitality desk and a wall identity, not a floating waypoint.
const concierge=new THREE.Group();concierge.name='KOMO_V131_CONCIERGE';concierge.position.set(-8.15,0,-1.2);scene.add(concierge);
box(concierge,5.8,.22,2.7,MAT.stone,0,.11,0);box(concierge,5.4,1.05,1.08,MAT.stone2,0,.63,.2);box(concierge,5.65,.13,1.25,MAT.bronze,0,1.20,.2);box(concierge,4.0,.05,.05,MAT.warm,0,1.04,.77);
box(concierge,6.2,4.5,.16,MAT.sage,0,3.1,-.78);addPlaque(concierge,'CONCIERGE','Orientation · Twin · Arena',{x:0,y:4.15,z:-.68,w:5.5,h:1.35,dark:true});
const cl=new THREE.PointLight(0xffca8d,4.8,11,2);cl.position.set(0,3.4,1.5);concierge.add(cl);

// Mobile HUD hierarchy: larger text, no overlapping location/today chips.
const style=document.createElement('style');style.textContent=`
@media(max-width:800px){
  .hud{min-height:58px!important;border-radius:24px!important}.hud .brand strong{font-size:27px!important;letter-spacing:.08em!important}.vitals>div span{font-size:7px!important}.vitals>div b{font-size:17px!important}
  .location{top:112px!important;left:10px!important;right:auto!important;max-width:158px!important;min-height:38px!important;padding:0 11px!important;border-radius:999px!important;display:flex!important;align-items:center!important;gap:8px!important}.location #location-name{font-size:10px!important;letter-spacing:.10em!important;white-space:nowrap!important}.location #heading{font-size:10px!important}
  .today-open{top:112px!important;right:10px!important;left:auto!important;height:38px!important;padding:0 12px!important;font-size:10px!important;letter-spacing:.08em!important}.today-open b{font-size:11px!important}
  #interaction{bottom:112px!important;left:10px!important;max-width:245px!important;min-height:62px!important;padding:10px 12px!important;border-radius:18px!important}#interaction-key{font-size:12px!important}#interaction-title{font-size:13px!important;letter-spacing:.01em!important}#interaction-copy{font-size:9px!important;line-height:1.35!important;margin-top:3px!important}
  .mobile-action{font-size:13px!important;font-weight:750!important;letter-spacing:.08em!important}.joystick-zone{opacity:.70!important}
  #fps-reticle{opacity:.62!important}
}
@media(max-width:390px){.location{max-width:144px!important}.location #location-name{font-size:9px!important}.today-open{padding:0 10px!important;font-size:9px!important}}
`;
document.head.appendChild(style);

// Shorten the mobile location label while preserving underlying zone semantics.
const normalizeLabels=()=>{
  const loc=document.querySelector('#location-name');const app=document.querySelector('#app');if(!loc||!app)return;
  if(app.dataset.zone==='atrium')loc.textContent='KŌMŌ HALL';
  else if(app.dataset.zone==='twin')loc.textContent='TWIN LAB';
  else if(app.dataset.zone==='world'&&/ARRIVAL/i.test(loc.textContent))loc.textContent='ARRIVAL PLAZA';
};
setInterval(normalizeLabels,320);

window.KomoV131Design={version:'0.13.1',facades:true,proceduralMaterials:true,largeWayfinding:true};

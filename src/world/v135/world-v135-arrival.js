const runtime=window.KomoWorldRuntime;
if(!runtime?.THREE||!runtime?.scene)throw new Error('KŌMØ V0.13.5 Arrival runtime unavailable');

const {THREE,scene,spawnRing}=runtime;
const previous=scene.getObjectByName('KOMO_V135_ARRIVAL_SPRINT1');
previous?.removeFromParent?.();

const layer=new THREE.Group();
layer.name='KOMO_V135_ARRIVAL_SPRINT1';
scene.add(layer);

const stone=new THREE.MeshStandardMaterial({color:0xe9dfcf,roughness:.77,metalness:.01});
const stoneDeep=new THREE.MeshStandardMaterial({color:0xc9bba5,roughness:.84,metalness:.01});
const sage=new THREE.MeshStandardMaterial({color:0x263b31,roughness:.61,metalness:.03});
const bronze=new THREE.MeshStandardMaterial({color:0x9c754e,roughness:.37,metalness:.55});
const warm=new THREE.MeshBasicMaterial({color:0xf0c98e,transparent:true,opacity:.78,depthWrite:false});

function box(w,h,d,material,x,y,z){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  layer.add(mesh);
  return mesh;
}

function plaque(){
  const canvas=document.createElement('canvas');
  canvas.width=1600;canvas.height=320;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#1c3027';ctx.fillRect(0,0,1600,320);
  ctx.strokeStyle='rgba(220,190,142,.38)';ctx.lineWidth=4;ctx.strokeRect(4,4,1592,312);
  ctx.fillStyle='#efe7db';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='500 94px Georgia';ctx.fillText('KŌMØ WORLD',800,132);
  ctx.fillStyle='#d6b27a';ctx.font='650 31px Arial';ctx.letterSpacing='8px';ctx.fillText('LONGEVITY IN MOTION',800,238);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(6.6,1.32),material);
  sign.position.set(0,7.02,34.34);
  layer.add(sign);
  sign.userData.texture=texture;
  return sign;
}

// A real architectural threshold: outside the circulation lane, framing the Hall rather than blocking it.
[-7.75,7.75].forEach((x,i)=>{
  box(1.05,6.75,1.05,stone,x,3.42,33.85);
  box(.13,5.45,.08,bronze,x+(i?-.38:.38),3.47,34.40);
  box(.72,5.15,.18,sage,x,3.38,33.30);
  box(1.44,.18,1.32,stoneDeep,x,.17,33.85);

  const light=new THREE.PointLight(0xf0c486,3.2,10,2);
  light.position.set(x,5.6,35.0);
  layer.add(light);
});

// Upper lintel keeps the opening wide and makes the first view read as architecture, not a game portal.
box(16.55,.56,1.02,stone,0,6.73,33.85);
box(14.55,.075,.09,bronze,0,6.42,34.40);
box(5.10,.11,.10,warm,0,6.42,34.47);
plaque();

// Low lateral masses connect the threshold with the existing planted forecourt.
[-12.35,12.35].forEach(x=>{
  box(6.3,.44,1.72,stoneDeep,x,.28,34.12);
  box(5.55,.10,1.25,sage,x,.55,34.12);
});

// One precise threshold line in the ground reinforces depth and orientation.
box(15.15,.025,.12,bronze,0,.335,34.02);
box(.055,.025,7.35,bronze,-6.55,.336,37.72);
box(.055,.025,7.35,bronze,6.55,.336,37.72);

if(spawnRing){
  spawnRing.material.opacity=.24;
  spawnRing.material.transparent=true;
}

const style=document.createElement('style');
style.id='komo-v135-arrival-style';
style.textContent=`
:root{--komo-world-safe-top:max(8px,env(safe-area-inset-top));--komo-world-safe-bottom:max(8px,env(safe-area-inset-bottom))}
@media(max-width:800px){
  .hud{top:var(--komo-world-safe-top)!important;left:8px!important;right:8px!important;height:58px!important;min-height:58px!important;padding:8px 9px 8px 13px!important;grid-template-columns:minmax(0,1fr) auto auto!important;gap:8px!important;border-radius:22px!important}
  .hud .brand{min-width:0!important}.hud .brand strong{font-size:25px!important;line-height:1!important}.hud .brand span,.hud .brand i{display:none!important}
  .hud .vitals{justify-self:end!important}.hud .vitals>div{min-width:58px!important;padding:6px 8px!important}.hud .vitals>div:nth-child(n+2){display:none!important}.hud .vitals span{font-size:6px!important}.hud .vitals b{font-size:14px!important}
  .hud .round{width:34px!important;height:34px!important}.hud .lang{font-size:8px!important;min-width:30px!important}
  .location{top:calc(var(--komo-world-safe-top) + 68px)!important;left:10px!important;right:auto!important;transform:none!important;min-height:36px!important;max-width:154px!important;padding:0 11px!important;display:flex!important;align-items:center!important;gap:8px!important;border-radius:999px!important}
  .location #location-name{font-size:9px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.location #heading{font-size:10px!important}
  .today-open{top:calc(var(--komo-world-safe-top) + 68px)!important;right:10px!important;left:auto!important;height:36px!important;padding:0 11px!important;border-radius:999px!important}
  .intro{top:calc(var(--komo-world-safe-top) + 114px)!important;left:10px!important;width:min(340px,calc(100vw - 20px))!important;padding:16px!important;border-radius:22px!important}.intro h1{font-size:30px!important}.intro p{font-size:10px!important;line-height:1.5!important}.intro .quest{margin:12px 0 10px!important}.intro>button{padding:10px 12px!important}
  #interaction{left:10px!important;right:92px!important;bottom:calc(var(--komo-world-safe-bottom) + 104px)!important;max-width:none!important;min-height:58px!important;transform:translateY(10px)!important;padding:9px 10px!important;border-radius:17px!important}#interaction.show{transform:none!important}#interaction-key{display:none!important}#interaction-title{font-size:12px!important}#interaction-copy{font-size:8px!important;line-height:1.35!important}
  .joystick-zone{left:calc(8px + env(safe-area-inset-left))!important;bottom:calc(8px + env(safe-area-inset-bottom))!important;width:146px!important;height:146px!important}.joystick-base{--joy-size:108px!important;--joy-opacity:.52!important}
  .mobile-action{right:calc(14px + env(safe-area-inset-right))!important;bottom:calc(86px + env(safe-area-inset-bottom))!important;width:62px!important;height:62px!important;font-size:10px!important;font-weight:760!important;letter-spacing:.08em!important;background:rgba(18,31,24,.64)!important}
  .look-zone span{display:none!important}
  #fps-reticle{opacity:.54!important}
}
@media(max-width:390px){
  .hud .brand strong{font-size:23px!important}.hud .vitals>div{min-width:52px!important;padding:5px 7px!important}.location{max-width:140px!important}.location #location-name{font-size:8px!important}.intro{top:calc(var(--komo-world-safe-top) + 110px)!important;padding:14px!important}.intro h1{font-size:27px!important}.intro p{font-size:9px!important}.joystick-zone{width:136px!important;height:136px!important}.mobile-action{width:58px!important;height:58px!important;bottom:calc(82px + env(safe-area-inset-bottom))!important}
}
@media(min-width:801px) and (max-width:1180px){
  .hud{left:16px!important;right:16px!important}.intro{left:20px!important}.location{top:92px!important}
}
`;
document.head.appendChild(style);

window.KomoV135Arrival={version:'0.13.5-sprint1',threshold:true,mobileHud:true,locomotion:'inertial'};

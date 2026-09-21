const runtime=window.KomoWorldRuntime;
if(!runtime?.THREE||!runtime?.scene)throw new Error('KŌMØ V0.13.5 Arrival runtime unavailable');

const {THREE,scene,spawnRing}=runtime;

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

window.KomoV135Arrival?.dispose?.();
['KOMO_V135_ARRIVAL_SPRINT1','KOMO_V135_ARRIVAL_SPRINT2','KOMO_V135_ARRIVAL_FORECOURT'].forEach(name=>disposeGroup(scene.getObjectByName(name)));
document.querySelector('#komo-v135-arrival-style')?.remove();

const layer=new THREE.Group();
layer.name='KOMO_V135_ARRIVAL_FORECOURT';
scene.add(layer);

const stoneDeep=new THREE.MeshStandardMaterial({color:0xc8baa4,roughness:.84,metalness:.01});
const sage=new THREE.MeshStandardMaterial({color:0x263b31,roughness:.61,metalness:.03});
const sageDeep=new THREE.MeshStandardMaterial({color:0x182a22,roughness:.56,metalness:.05});
const bronze=new THREE.MeshStandardMaterial({color:0x9c754e,roughness:.37,metalness:.55});
const warm=new THREE.MeshStandardMaterial({color:0xf0c98e,roughness:.34,metalness:.06,emissive:0x8c5d2c,emissiveIntensity:.42});

function box(w,h,d,material,x,y,z){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  layer.add(mesh);
  return mesh;
}

// Forecourt only: the building itself is owned exclusively by world-v135-main-building.js.
[-12.8,12.8].forEach((x,i)=>{
  box(6.2,.44,1.72,stoneDeep,x,.28,35.0);
  box(5.45,.10,1.24,sage,x,.55,35.0);
  box(4.60,.22,.82,sageDeep,x,.71,35.0);
  box(.08,.86,1.02,bronze,x+(i?-2.25:2.25),1.00,35.0);

  const light=new THREE.PointLight(0xe9c48d,1.55,7,2);
  light.position.set(x,1.8,34.6);
  layer.add(light);
});

// Long, restrained approach lines point to the central entrance without becoming a game path.
box(.055,.024,8.4,bronze,-4.35,.335,38.2);
box(.055,.024,8.4,bronze,4.35,.335,38.2);
box(8.75,.026,.08,bronze,0,.336,34.05);

// Two low light markers define the threshold from the spawn.
[-5.65,5.65].forEach(x=>{
  box(.13,.72,.13,warm,x,.70,36.15);
  box(.42,.09,.42,stoneDeep,x,.14,36.15);
});

if(spawnRing){
  spawnRing.material.opacity=.15;
  spawnRing.material.transparent=true;
}

const copy={
  fr:{
    eyebrow:'KŌMØ WORLD · SPATIAL LONGEVITY',
    line1:'Votre corps.',
    line2:'Votre trajectoire.',
    body:'Entrez dans un espace personnel conçu pour mesurer, comprendre et faire évoluer votre mouvement dans le temps.',
    quest:'01 · Entrer dans votre KŌMØ World',
    enter:'ENTRER DANS MON WORLD',
    tip:'GLISSER POUR REGARDER · ACTION POUR INTERAGIR'
  },
  en:{
    eyebrow:'KŌMØ WORLD · SPATIAL LONGEVITY',
    line1:'Your body.',
    line2:'Your trajectory.',
    body:'Enter a personal space designed to measure, understand and evolve your movement over time.',
    quest:'01 · Enter your KŌMØ World',
    enter:'ENTER MY WORLD',
    tip:'DRAG TO LOOK · ACTION TO INTERACT'
  }
};

function currentLocale(){
  return document.querySelector('#language-toggle')?.textContent?.trim().toUpperCase()==='EN'?'en':'fr';
}

function applyCopy(){
  const c=copy[currentLocale()]||copy.fr;
  const intro=document.querySelector('#intro');
  if(intro){
    const eyebrow=intro.querySelector('.eyebrow');
    const h1=intro.querySelector('h1');
    const p=intro.querySelector('p');
    const quest=intro.querySelector('#quest-copy');
    const button=intro.querySelector('#intro-enter');
    [eyebrow,p].forEach(el=>el?.removeAttribute('data-i18n'));
    intro.querySelectorAll('h1 [data-i18n]').forEach(el=>el.removeAttribute('data-i18n'));
    button?.removeAttribute('data-i18n');
    if(eyebrow)eyebrow.textContent=c.eyebrow;
    if(h1)h1.innerHTML=`<span>${c.line1}</span><br><em>${c.line2}</em>`;
    if(p)p.textContent=c.body;
    if(quest)quest.textContent=c.quest;
    if(button)button.textContent=c.enter;
  }
  const tip=document.querySelector('#fps-tip');
  if(tip)tip.textContent=c.tip;
}

applyCopy();
const languageToggle=document.querySelector('#language-toggle');
const onLanguage=()=>setTimeout(applyCopy,0);
languageToggle?.addEventListener('click',onLanguage);

const style=document.createElement('style');
style.id='komo-v135-arrival-style';
style.textContent=`
:root{--komo-world-safe-top:max(8px,env(safe-area-inset-top));--komo-world-safe-bottom:max(8px,env(safe-area-inset-bottom))}
.intro{max-width:430px!important;background:linear-gradient(145deg,rgba(20,35,28,.88),rgba(28,43,34,.72))!important;border-color:rgba(225,196,147,.18)!important;box-shadow:0 26px 78px rgba(6,14,10,.24)!important;backdrop-filter:blur(24px) saturate(1.05)!important}
.intro .eyebrow{letter-spacing:.16em!important;color:rgba(221,192,143,.92)!important}
.intro h1{font-family:Georgia,serif!important;font-weight:500!important;letter-spacing:-.035em!important}.intro h1 em{color:#d5b477!important}
.intro p{max-width:38ch!important;color:rgba(238,230,216,.76)!important}
.intro .quest{border-top:1px solid rgba(255,255,255,.08)!important;border-bottom:1px solid rgba(255,255,255,.08)!important;padding:12px 0!important}
.intro>button{background:linear-gradient(135deg,#d7b77f,#b48b55)!important;color:#1d2e26!important;border:0!important;font-weight:800!important;letter-spacing:.08em!important}
.hud{background:linear-gradient(145deg,rgba(19,34,27,.80),rgba(25,40,32,.64))!important;border-color:rgba(225,197,151,.14)!important;backdrop-filter:blur(22px) saturate(1.02)!important}
.hud .brand i{opacity:.38!important}
.location,.today-open{background:rgba(20,35,28,.68)!important;border-color:rgba(225,197,151,.13)!important;backdrop-filter:blur(18px)!important}
@media(max-width:800px){
  .hud{top:var(--komo-world-safe-top)!important;left:8px!important;right:8px!important;height:58px!important;min-height:58px!important;padding:8px 9px 8px 13px!important;grid-template-columns:minmax(0,1fr) auto auto auto!important;gap:8px!important;border-radius:22px!important}
  .hud .brand{min-width:0!important}.hud .brand strong{font-size:25px!important;line-height:1!important}.hud .brand span,.hud .brand i{display:none!important}
  .hud .vitals{justify-self:end!important}.hud .vitals>div{min-width:58px!important;padding:6px 8px!important}.hud .vitals>div:nth-child(n+2){display:none!important}.hud .vitals span{font-size:6px!important}.hud .vitals b{font-size:14px!important}
  .hud .round{width:34px!important;height:34px!important}.hud .lang{font-size:8px!important;min-width:30px!important}
  .location{top:calc(var(--komo-world-safe-top) + 68px)!important;left:10px!important;right:auto!important;transform:none!important;min-height:36px!important;max-width:154px!important;padding:0 11px!important;display:flex!important;align-items:center!important;gap:8px!important;border-radius:999px!important}
  .location #location-name{font-size:9px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.location #heading{font-size:10px!important}
  .today-open{top:calc(var(--komo-world-safe-top) + 68px)!important;right:10px!important;left:auto!important;height:36px!important;padding:0 11px!important;border-radius:999px!important}
  .intro{top:calc(var(--komo-world-safe-top) + 114px)!important;left:10px!important;width:min(340px,calc(100vw - 20px))!important;padding:16px!important;border-radius:22px!important}.intro h1{font-size:30px!important}.intro p{font-size:10px!important;line-height:1.5!important}.intro .quest{margin:12px 0 10px!important}.intro>button{padding:11px 12px!important}
  #interaction{left:50%!important;right:auto!important;width:min(245px,calc(100vw - 20px))!important;bottom:calc(var(--komo-world-safe-bottom) + 156px)!important;max-width:none!important;min-height:58px!important;transform:translate(-50%,10px)!important;padding:9px 10px!important;border-radius:17px!important}
  #interaction.show{transform:translateX(-50%)!important}#interaction-key{display:none!important}#interaction-title{font-size:12px!important}#interaction-copy{font-size:8px!important;line-height:1.35!important}
  .joystick-zone{left:calc(8px + env(safe-area-inset-left))!important;bottom:calc(8px + env(safe-area-inset-bottom))!important;width:146px!important;height:146px!important}.joystick-base{--joy-size:108px!important;--joy-opacity:.46!important}
  .mobile-action{right:calc(14px + env(safe-area-inset-right))!important;bottom:calc(86px + env(safe-area-inset-bottom))!important;width:62px!important;height:62px!important;font-size:10px!important;font-weight:760!important;letter-spacing:.08em!important;background:rgba(18,31,24,.64)!important}
  .look-zone span{display:none!important}
  #fps-reticle{opacity:.48!important}
}
@media(max-width:390px){
  .hud .brand strong{font-size:23px!important}.hud .vitals>div{min-width:52px!important;padding:5px 7px!important}.location{max-width:140px!important}.location #location-name{font-size:8px!important}.intro{top:calc(var(--komo-world-safe-top) + 110px)!important;padding:14px!important}.intro h1{font-size:27px!important}.intro p{font-size:9px!important}.joystick-zone{width:136px!important;height:136px!important}.mobile-action{width:58px!important;height:58px!important;bottom:calc(82px + env(safe-area-inset-bottom))!important}
}
@media(min-width:801px) and (max-width:1180px){
  .hud{left:16px!important;right:16px!important}.intro{left:20px!important}.location{top:92px!important}
}
`;
document.head.appendChild(style);

function dispose(){
  languageToggle?.removeEventListener('click',onLanguage);
  document.querySelector('#komo-v135-arrival-style')?.remove();
  disposeGroup(layer);
}

window.KomoV135Arrival={
  version:'0.13.5-forecourt',
  forecourt:true,
  mainBuildingOwner:'world-v135-main-building.js',
  journey:'measure-understand-act-live-engage-reward-measure-again',
  mobileHud:true,
  locomotion:'inertial',
  dispose
};

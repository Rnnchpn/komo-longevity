const runtime=window.KomoWorldRuntime;
if(!runtime?.THREE||!runtime?.scene)throw new Error('KŌMØ V0.13.5 Arrival runtime unavailable');

const {THREE,scene,spawnRing}=runtime;
scene.getObjectByName('KOMO_V135_ARRIVAL_SPRINT2')?.removeFromParent?.();
document.querySelector('#komo-v135-arrival-style')?.remove();

const layer=new THREE.Group();
layer.name='KOMO_V135_ARRIVAL_SPRINT2';
scene.add(layer);

const stone=new THREE.MeshStandardMaterial({color:0xe9dfcf,roughness:.77,metalness:.01});
const stoneDeep=new THREE.MeshStandardMaterial({color:0xc8baa4,roughness:.84,metalness:.01});
const sage=new THREE.MeshStandardMaterial({color:0x263b31,roughness:.61,metalness:.03});
const sageDeep=new THREE.MeshStandardMaterial({color:0x182a22,roughness:.56,metalness:.05});
const bronze=new THREE.MeshStandardMaterial({color:0x9c754e,roughness:.37,metalness:.55});
const warm=new THREE.MeshBasicMaterial({color:0xf0c98e,transparent:true,opacity:.68,depthWrite:false});

function box(w,h,d,material,x,y,z){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  layer.add(mesh);
  return mesh;
}

function panelTexture(draw,{w=1600,h=320}={}){
  const canvas=document.createElement('canvas');
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');
  draw(ctx,w,h);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;
  return texture;
}

function plane(texture,w,h,x,y,z){
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,transparent:true});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
  mesh.position.set(x,y,z);
  mesh.userData.texture=texture;
  layer.add(mesh);
  return mesh;
}

function plaque(){
  const texture=panelTexture((ctx,w,h)=>{
    ctx.fillStyle='#1b3026';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(220,190,142,.38)';ctx.lineWidth=4;ctx.strokeRect(4,4,w-8,h-8);
    ctx.fillStyle='#efe7db';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='500 94px Georgia';ctx.fillText('KŌMØ WORLD',w/2,126);
    ctx.fillStyle='#d6b27a';ctx.font='650 29px Arial';ctx.fillText('LONGEVITY IN MOTION',w/2,234);
  });
  return plane(texture,6.6,1.32,0,7.02,34.38);
}

function journeyStrip(){
  const texture=panelTexture((ctx,w,h)=>{
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='rgba(24,42,33,.94)';ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#d9b77e';ctx.fillRect(28,h-18,w-56,3);
    ctx.fillStyle='#eee6d8';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='650 32px Arial';ctx.fillText('MEASURE   ·   UNDERSTAND   ·   ACT   ·   LIVE',w/2,h/2-2);
  },{w:1800,h:190});
  return plane(texture,7.4,.78,0,5.82,34.40);
}

function wayfinding(){
  const texture=panelTexture((ctx,w,h)=>{
    ctx.fillStyle='rgba(24,42,33,.95)';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(213,178,122,.36)';ctx.lineWidth=3;ctx.strokeRect(4,4,w-8,h-8);
    ctx.textBaseline='middle';
    const cells=[
      {x:w*.18,title:'FUNCTIONAL TWIN',sub:'UNDERSTAND',arrow:'←'},
      {x:w*.50,title:'REHAB',sub:'ACT',arrow:'↑'},
      {x:w*.82,title:'ARENA',sub:'ENGAGE',arrow:'→'}
    ];
    cells.forEach((cell,i)=>{
      if(i){ctx.fillStyle='rgba(231,220,204,.18)';ctx.fillRect(w*(i/3),34,2,h-68)}
      ctx.fillStyle='#eee6d8';ctx.textAlign='center';ctx.font='650 31px Arial';ctx.fillText(`${cell.arrow}  ${cell.title}`,cell.x,78);
      ctx.fillStyle='#c3b49d';ctx.font='650 20px Arial';ctx.fillText(cell.sub,cell.x,133);
    });
  },{w:1900,h:190});
  return plane(texture,10.8,1.08,0,1.28,30.72);
}

// Arrival threshold: architectural, wide, and deliberately outside the circulation axis.
[-7.75,7.75].forEach((x,i)=>{
  box(1.05,6.75,1.05,stone,x,3.42,33.85);
  box(.13,5.45,.08,bronze,x+(i?-.38:.38),3.47,34.40);
  box(.72,5.15,.18,sage,x,3.38,33.30);
  box(1.44,.18,1.32,stoneDeep,x,.17,33.85);

  const light=new THREE.PointLight(0xf0c486,2.8,9,2);
  light.position.set(x,5.55,35.0);
  layer.add(light);
});

box(16.55,.56,1.02,stone,0,6.73,33.85);
box(14.55,.075,.09,bronze,0,6.42,34.40);
box(5.10,.11,.10,warm,0,6.42,34.47);
plaque();
journeyStrip();

[-12.35,12.35].forEach(x=>{
  box(6.3,.44,1.72,stoneDeep,x,.28,34.12);
  box(5.55,.10,1.25,sage,x,.55,34.12);
  box(4.75,.26,.86,sageDeep,x,.73,34.12);
});

box(15.15,.025,.12,bronze,0,.335,34.02);
box(.055,.025,7.35,bronze,-6.55,.336,37.72);
box(.055,.025,7.35,bronze,6.55,.336,37.72);
wayfinding();

if(spawnRing){
  spawnRing.material.opacity=.18;
  spawnRing.material.transparent=true;
}

const copy={
  fr:{
    eyebrow:'KŌMØ WORLD · VOTRE ESPACE LONGÉVITÉ',
    line1:'Votre corps.',
    line2:'Votre trajectoire.',
    body:'Entrez dans votre espace personnel : comprenez votre mouvement, choisissez une action, progressez dans le temps.',
    quest:'01 · Explorer votre KŌMØ World',
    enter:'ENTRER DANS MON WORLD',
    tip:'GLISSER POUR REGARDER · ACTION POUR INTERAGIR'
  },
  en:{
    eyebrow:'KŌMØ WORLD · YOUR LONGEVITY SPACE',
    line1:'Your body.',
    line2:'Your trajectory.',
    body:'Enter your personal space: understand your movement, choose an action and progress over time.',
    quest:'01 · Explore your KŌMØ World',
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
document.querySelector('#language-toggle')?.addEventListener('click',()=>setTimeout(applyCopy,0));

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

window.KomoV135Arrival={
  version:'0.13.5-sprint2',
  threshold:true,
  wayfinding:true,
  journey:'measure-understand-act-live-engage-reward-measure-again',
  mobileHud:true,
  locomotion:'inertial'
};

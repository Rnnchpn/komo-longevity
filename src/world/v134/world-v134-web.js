/* KŌMØ World V0.13.4 — responsive desktop/web presentation layer */
(()=>{
'use strict';
const VERSION='0.13.4-web.1';
const desktopQuery=window.matchMedia('(min-width: 901px) and (pointer: fine)');

const style=document.createElement('style');
style.id='komo-world-web-v1-style';
style.textContent=`
@media (min-width:901px) and (pointer:fine){
  html,body,#app{width:100%;height:100%;overflow:hidden}
  body.komo-world-desktop{background:#101812}
  body.komo-world-desktop #world-canvas{cursor:grab}
  body.komo-world-desktop #world-canvas:active{cursor:grabbing}
  body.komo-world-desktop .mobile-controls{display:none!important}
  body.komo-world-desktop #fps-tip{display:none!important}
  body.komo-world-desktop .hud{
    top:24px!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;
    width:min(1180px,calc(100vw - 48px))!important;max-width:none!important;min-height:72px!important;
    padding:10px 14px 10px 20px!important;border-radius:22px!important;
    background:rgba(20,31,25,.78)!important;backdrop-filter:blur(24px) saturate(1.08)!important;
    box-shadow:0 18px 48px rgba(5,10,7,.22)!important
  }
  body.komo-world-desktop .hud .brand strong{font-size:30px!important;letter-spacing:.04em!important}
  body.komo-world-desktop .hud .brand span{display:block!important}
  body.komo-world-desktop .hud .brand i{display:block!important}
  body.komo-world-desktop .vitals{gap:8px!important}
  body.komo-world-desktop .vitals>div{min-width:92px!important}
  body.komo-world-desktop .location{top:112px!important;left:24px!important;max-width:340px!important;padding:12px 16px!important;border-radius:16px!important}
  body.komo-world-desktop .interaction{
    left:50%!important;right:auto!important;bottom:34px!important;transform:translateX(-50%)!important;
    width:auto!important;max-width:min(560px,calc(100vw - 420px))!important;min-width:300px!important;
    padding:12px 16px!important;border-radius:16px!important
  }
  body.komo-world-desktop .intro{left:34px!important;top:132px!important;bottom:auto!important;width:min(420px,34vw)!important;max-width:420px!important}
  body.komo-world-desktop .panel{right:28px!important;top:112px!important;bottom:28px!important;width:min(500px,38vw)!important;max-width:none!important}
  body.komo-world-desktop #fps-reticle{opacity:.58!important}
  body.komo-world-desktop .desktop-world-guide{display:flex!important}
  body.komo-world-desktop .twin-top{left:24px!important;right:24px!important;top:20px!important}
  body.komo-world-desktop .twin-left{left:24px!important}
  body.komo-world-desktop .twin-right{right:24px!important}
  body.komo-world-desktop .twin-bottom{left:24px!important;right:24px!important;bottom:20px!important}
}
.desktop-world-guide{display:none;position:fixed;z-index:76;right:24px;bottom:28px;align-items:center;gap:10px;padding:9px 11px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(18,29,23,.72);backdrop-filter:blur(18px);box-shadow:0 14px 34px rgba(0,0,0,.18);color:#eee8dc;font:650 10px/1.1 system-ui,sans-serif;letter-spacing:.04em;pointer-events:auto}
.desktop-world-guide span{opacity:.76;white-space:nowrap}.desktop-world-guide kbd{min-width:26px;padding:6px 7px;border-radius:8px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.08);font:750 9px/1 system-ui,sans-serif;text-align:center;color:#f6f1e8;box-shadow:inset 0 -1px 0 rgba(0,0,0,.16)}
.desktop-world-guide button{border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.07);color:#eee8dc;padding:7px 9px;font:700 9px/1 system-ui,sans-serif;cursor:pointer}
`;
document.head.appendChild(style);

const guide=document.createElement('div');
guide.className='desktop-world-guide';
guide.setAttribute('aria-label','Contrôles KŌMØ World sur ordinateur');
guide.innerHTML='<kbd>ZQSD</kbd><span>/ WASD</span><kbd>SHIFT</kbd><span>courir</span><kbd>E</kbd><span>action</span><span>· glisser souris pour regarder</span><button type="button" data-world-fullscreen>PLEIN ÉCRAN</button>';
document.body.appendChild(guide);

function apply(){
  document.body.classList.toggle('komo-world-desktop',desktopQuery.matches);
  document.documentElement.dataset.komoWorldSurface=desktopQuery.matches?'desktop':'touch';
}
apply();
desktopQuery.addEventListener?.('change',apply);
window.addEventListener('resize',apply,{passive:true});

guide.querySelector('[data-world-fullscreen]')?.addEventListener('click',async()=>{
  try{
    if(document.fullscreenElement)await document.exitFullscreen();
    else await document.documentElement.requestFullscreen?.();
  }catch(e){console.warn('[KŌMØ World web] fullscreen unavailable',e)}
});

document.addEventListener('fullscreenchange',()=>{
  const b=guide.querySelector('[data-world-fullscreen]');
  if(b)b.textContent=document.fullscreenElement?'QUITTER PLEIN ÉCRAN':'PLEIN ÉCRAN';
});

window.KomoWorldWeb={version:VERSION,isDesktop:()=>desktopQuery.matches};
})();

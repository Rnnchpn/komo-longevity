/* KŌMØ Pulse — canonical patient dock v7.2.0
   Persistent app chrome: immediate dock, fixed viewport, glossy premium navigation. */
(() => {
'use strict';
const V='7.2.0';
const LEGACY_ROUTE_CONTRACT="['club','Club','∞','club','']";
void LEGACY_ROUTE_CONTRACT;
const items=[
  ['home','Accueil','⌂','home'],
  ['key','KEY','◌','key'],
  ['results','Résultats','◎','results'],
  ['trajectory','Trajectoire','⌁','trajectory'],
  ['agenda','Rendez-vous','□','documents'],
  ['mykomo','My KŌMØ','◉','mykomo']
];
let raf=0,retries=[];
const nav=()=>window.KomoPatientNavigation;
const route=()=>nav()?.route?.()||location.hash.replace(/^#/,'')||'home';
const shown=el=>{if(!el||el.hidden)return false;const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'};
const patientVisible=()=>{const a=document.querySelector('#appShell'),x=document.querySelector('#authScreen');return shown(a)&&(!x||!shown(x))&&!['clinical','admin'].includes(route())};
function active(){
 const r=route();
 if(r==='key')return'key';
 if(['results','motion','tests'].includes(r))return'results';
 if(['trajectory','path','plan'].includes(r))return'trajectory';
 if(['documents','agenda','rdv'].includes(r))return'agenda';
 if(['mykomo','club','profile'].includes(r))return'mykomo';
 return'home';
}
function syncAppMode(){
 const on=patientVisible();
 document.documentElement.classList.toggle('kpulse-app-lock',on);
 document.body?.classList.toggle('kpulse-app-mode',on);
 if(document.body)document.body.classList.toggle('kpulse-home-mode',on&&active()==='home');
 return on;
}
function css(){
 if(document.querySelector('#kpDock600'))return;
 const s=document.createElement('style');s.id='kpDock600';s.textContent=`
 html.kpulse-app-lock,body.kpulse-app-mode{height:100%!important;min-height:100%!important;overflow:hidden!important;overscroll-behavior:none!important}
 body.kpulse-app-mode #appShell{height:100dvh!important;min-height:0!important;overflow:hidden!important}
 body.kpulse-app-mode .main-shell{height:100%!important;min-height:0!important;overflow:hidden!important}
 body.kpulse-app-mode .topbar{position:relative!important;z-index:60!important}
 body.kpulse-app-mode:not(.kpulse-home-mode) #viewRoot,body.kpulse-app-mode:not(.kpulse-home-mode) .view-root{max-height:calc(100dvh - 54px)!important;overflow:hidden!important;overscroll-behavior:none!important;scrollbar-width:none!important;padding-bottom:88px!important;box-sizing:border-box!important}
 body.kpulse-app-mode:not(.kpulse-home-mode) #viewRoot>*{height:100%!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:none!important}
 body.kpulse-app-mode:not(.kpulse-home-mode) #viewRoot>*::-webkit-scrollbar{display:none!important}
 #kpDock,#kpDockV5{display:none!important}
 #kpDockV6{position:fixed!important;z-index:10000!important;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(760px,calc(100vw - 28px));height:72px;padding:5px;border:1px solid #dce6df;border-radius:24px;background:rgba(255,255,255,.96);box-shadow:0 16px 46px rgba(35,63,48,.14);backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%);display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px;box-sizing:border-box}
 #kpDockV6 .kp6-indicator{position:absolute;z-index:-1;top:5px;left:5px;height:60px;border-radius:19px;background:linear-gradient(135deg,#def5e7,#e9edff);box-shadow:0 6px 18px rgba(35,63,48,.08);transition:transform .22s ease,width .22s ease}
 #kpDockV6 a{min-width:0;height:60px;padding:4px 3px;border-radius:18px;color:#728078;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-decoration:none;font:600 9px/1 'DM Sans',sans-serif}
 #kpDockV6 a.active{color:#205f43}.kp6-icon{font-size:18px;line-height:1}.kp6-icon svg{width:20px;height:20px}
 #kpDockV6 b{max-width:100%;font:600 8px/1.05 'DM Sans',sans-serif;text-align:center;white-space:normal}
 @media(max-width:680px){#kpDockV6{left:8px;right:8px;transform:none;width:auto;height:68px;bottom:max(7px,env(safe-area-inset-bottom));border-radius:22px;padding:4px}#kpDockV6 .kp6-indicator{top:4px;left:4px;height:58px;border-radius:18px}#kpDockV6 a{height:58px;padding:2px 1px;gap:4px}#kpDockV6 .kp6-icon{font-size:16px}#kpDockV6 b{font-size:7px}}
 @media(max-width:390px){#kpDockV6 b{font-size:6.2px}#kpDockV6 .kp6-icon{font-size:15px}}
 @media(prefers-reduced-motion:reduce){#kpDockV6 .kp6-indicator{transition:none!important}}
 `;document.head.appendChild(s)
}
function markup(){return '<i class="kp6-indicator"></i>'+items.map(([k,l,ic,r])=>`<a href="#${r}" data-kp6="${k}" data-kp6-route="${r}" aria-label="${l}"><span class="kp6-icon">${ic}</span><b>${l}</b></a>`).join('')}
function ensureDock(){if(!document.body)return null;let d=document.querySelector('#kpDockV6');if(!d){d=document.createElement('nav');d.id='kpDockV6';d.setAttribute('aria-label','Navigation KŌMØ Pulse');d.innerHTML=markup();document.body.appendChild(d)}else if(d.dataset.version!==V){d.innerHTML=markup()}d.dataset.version=V;return d}
function paint(){const d=document.querySelector('#kpDockV6');if(!d||d.hidden)return;const key=active(),bs=[...d.querySelectorAll('[data-kp6]')];bs.forEach(b=>{const on=b.dataset.kp6===key;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});const b=bs.find(x=>x.dataset.kp6===key),i=d.querySelector('.kp6-indicator');if(b&&i){const pad=parseFloat(getComputedStyle(d).paddingLeft)||0;i.style.width=`${b.offsetWidth}px`;i.style.transform=`translateX(${Math.max(0,b.offsetLeft-pad)}px)`}}
function refresh(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{css();const d=ensureDock();if(!d)return;const on=syncAppMode();d.hidden=!on;if(on)requestAnimationFrame(paint)})}
function settle(){retries.forEach(clearTimeout);retries=[];refresh();[50,160,420,900,1800].forEach(ms=>retries.push(setTimeout(refresh,ms)))}
document.addEventListener('click',e=>{const a=e.target.closest?.('#kpDockV6 a[data-kp6-route]');if(!a)return;e.preventDefault();window.KomoPatientNavigation?.go?.(a.dataset.kp6Route);window.KomoPatientNavigation?.resetScroll?.();requestAnimationFrame(paint)},true);
['hashchange','pageshow','resize','orientationchange','komo:canonical-route','komo:route-ready','komo:session-ready','komo:session-cleared','komo:home-command-rendered','komo:data-ready'].forEach(x=>window.addEventListener(x,settle));
document.addEventListener('DOMContentLoaded',settle,{once:true});
if(document.readyState!=='loading')settle();
window.KomoBottomNav={version:V,refresh:settle};
})();

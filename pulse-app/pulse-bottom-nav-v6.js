/* KŌMØ Pulse — canonical patient dock v8.0.0
   Four patient destinations only: Home · Results · Plan · My KŌMØ. */
(() => {
'use strict';
const V='8.0.0';
const items=[
  ['home','Home','⌂','home'],
  ['results','Résultats','◎','results'],
  ['plan','Plan','↗','trajectory'],
  ['mykomo','My KŌMØ','◉','mykomo']
];
let raf=0,retries=[];
const nav=()=>window.KomoPatientNavigation;
const route=()=>nav()?.route?.()||location.hash.replace(/^#/,'')||'home';
const shown=el=>{if(!el||el.hidden)return false;const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'};
const patientVisible=()=>{const a=document.querySelector('#appShell'),x=document.querySelector('#authScreen');return shown(a)&&(!x||!shown(x))&&!['clinical','admin'].includes(route())};
function active(){
  const r=route();
  if(['results','motion','tests'].includes(r))return'results';
  if(['trajectory','path','plan'].includes(r))return'plan';
  if(['mykomo','club','profile','documents','agenda','rdv','key','messages'].includes(r))return'mykomo';
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
body.kpulse-app-mode:not(.kpulse-home-mode) .topbar::after{content:'KŌMØ PULSE';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;color:#58655d;font:700 8px/1 'DM Sans',sans-serif;letter-spacing:.20em;white-space:nowrap;opacity:.88}
body.kpulse-app-mode:not(.kpulse-home-mode) #viewRoot,body.kpulse-app-mode:not(.kpulse-home-mode) .view-root{max-height:calc(100dvh - 54px)!important;overflow:auto!important;overscroll-behavior:contain!important;scrollbar-width:none!important;padding-bottom:92px!important;box-sizing:border-box!important}
body.kpulse-app-mode:not(.kpulse-home-mode) #viewRoot::-webkit-scrollbar,body.kpulse-app-mode:not(.kpulse-home-mode) .view-root::-webkit-scrollbar{display:none!important}
#kpDock,#kpDockV5{display:none!important}
#kpDockV6{position:fixed!important;z-index:10000!important;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(680px,calc(100vw - 40px));height:64px;padding:4px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px;border:1px solid rgba(33,48,38,.10);border-radius:22px;background:rgba(247,245,239,.92);box-shadow:0 18px 54px rgba(27,38,31,.13),inset 0 1px rgba(255,255,255,.78);backdrop-filter:blur(24px) saturate(120%);-webkit-backdrop-filter:blur(24px) saturate(120%);isolation:isolate;overflow:hidden;box-sizing:border-box;pointer-events:auto!important;touch-action:manipulation}#kpDockV6[hidden]{display:none!important}
#kpDockV6 .kp6-indicator{position:absolute;z-index:0;top:4px;left:4px;height:56px;border-radius:18px;background:linear-gradient(145deg,rgba(224,232,223,.92),rgba(238,238,230,.92));box-shadow:inset 0 0 0 1px rgba(49,91,65,.07);transition:transform .28s cubic-bezier(.2,.82,.22,1),width .18s ease;pointer-events:none}
#kpDockV6 a{position:relative;z-index:1;height:56px;min-width:0;border:0;border-radius:18px;background:transparent;color:#89918c;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:3px;font-family:'DM Sans',sans-serif;text-decoration:none;cursor:pointer;transition:color .16s ease,transform .12s ease;pointer-events:auto!important;-webkit-tap-highlight-color:transparent}#kpDockV6 a:active{transform:scale(.97)}#kpDockV6 a.active{color:#264634}#kpDockV6 .kp6-icon{font-size:17px;line-height:1;font-weight:700}#kpDockV6 b{max-width:100%;font-size:8px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:750;letter-spacing:.005em}
@media(max-width:760px){body.kpulse-app-mode:not(.kpulse-home-mode) .topbar::after{display:none!important}body.kpulse-app-mode.kpulse-home-mode #viewRoot,body.kpulse-app-mode.kpulse-home-mode .view-root{width:100%!important;max-width:none!important;height:100dvh!important;max-height:100dvh!important;min-height:0!important;overflow:hidden!important;overscroll-behavior:none!important;background:transparent!important}body.kpulse-app-mode.kpulse-home-mode [data-my-komo-home]{height:100%!important;min-height:0!important;overflow:hidden!important;background:transparent!important}#kpDockV6{left:8px!important;right:8px!important;width:auto!important;height:58px!important;bottom:max(7px,env(safe-area-inset-bottom))!important;transform:none!important;border-radius:20px!important;padding:3px!important;box-shadow:0 13px 38px rgba(27,38,31,.14),inset 0 1px rgba(255,255,255,.8)!important}#kpDockV6 .kp6-indicator{top:3px!important;left:3px!important;height:52px!important;border-radius:17px!important}#kpDockV6 a{height:52px!important;padding:2px 1px!important;gap:3px!important}#kpDockV6 .kp6-icon{font-size:15px!important}#kpDockV6 b{font-size:7px!important}}
@media(max-width:390px){#kpDockV6 b{font-size:6.4px!important}#kpDockV6 .kp6-icon{font-size:14px!important}}
@media(prefers-reduced-motion:reduce){#kpDockV6 .kp6-indicator{transition:none!important}}
`;
  document.head.appendChild(s);
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

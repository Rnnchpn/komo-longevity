/* KŌMØ Pulse — canonical patient dock v7.1.0
   Persistent app chrome: immediate dock, fixed viewport, canonical navigation only. */
(() => {
'use strict';
const V='7.1.0';
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
function css(){if(document.querySelector('#kpDock600'))return;const s=document.createElement('style');s.id='kpDock600';s.textContent=`
html.kpulse-app-lock,body.kpulse-app-mode{height:100%!important;min-height:100%!important;overflow:hidden!important;overscroll-behavior:none!important}
body.kpulse-app-mode #appShell{height:100dvh!important;min-height:0!important;overflow:hidden!important}
body.kpulse-app-mode .main-shell{height:100%!important;min-height:0!important;overflow:hidden!important}
body.kpulse-app-mode .topbar{position:relative!important;z-index:60!important}
body.kpulse-app-mode .topbar::after{content:'KŌMØ PULSE';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;color:#f1eee7;font:700 9px/1 'DM Sans',sans-serif;letter-spacing:.20em;white-space:nowrap;opacity:.92}
body.kpulse-app-mode .topbar::before{content:'';position:absolute;left:calc(50% - 62px);top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:#8da18f;box-shadow:0 0 0 0 rgba(141,161,143,.32);animation:kpulseBrand 2.8s ease-out infinite;pointer-events:none}
@keyframes kpulseBrand{0%{box-shadow:0 0 0 0 rgba(141,161,143,.32)}55%,100%{box-shadow:0 0 0 8px rgba(141,161,143,0)}}
body.kpulse-app-mode:not(.kpulse-home-mode) #viewRoot,body.kpulse-app-mode:not(.kpulse-home-mode) .view-root{max-height:calc(100dvh - 54px)!important;overflow:auto!important;overscroll-behavior:contain!important;scrollbar-width:none!important;padding-bottom:104px!important;box-sizing:border-box!important}
body.kpulse-app-mode:not(.kpulse-home-mode) #viewRoot::-webkit-scrollbar,body.kpulse-app-mode:not(.kpulse-home-mode) .view-root::-webkit-scrollbar{display:none!important}
#kpDock,#kpDockV5{display:none!important}
#kpDockV6{position:fixed!important;z-index:10000!important;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(1180px,calc(100vw - 48px));height:76px;padding:6px;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;border:1px solid rgba(244,241,234,.12);border-radius:25px;background:rgba(12,15,13,.97);box-shadow:0 24px 72px rgba(0,0,0,.34),inset 0 1px rgba(255,255,255,.03);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);isolation:isolate;overflow:hidden;box-sizing:border-box;pointer-events:auto!important;touch-action:manipulation}#kpDockV6[hidden]{display:none!important}
#kpDockV6 .kp6-indicator{position:absolute;z-index:0;top:6px;left:6px;height:64px;border-radius:19px;background:linear-gradient(145deg,#f1eee7,#e1ddd4);box-shadow:0 10px 28px rgba(0,0,0,.18),inset 0 1px rgba(255,255,255,.72);transition:transform .30s cubic-bezier(.2,.82,.22,1),width .20s ease;pointer-events:none}
#kpDockV6 a{position:relative;z-index:2;height:64px;min-width:0;border:0;border-radius:19px;background:transparent;color:#88928a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:3px;font-family:'DM Sans',sans-serif;text-decoration:none;cursor:pointer;transition:color .18s ease,transform .12s ease;pointer-events:auto!important;-webkit-tap-highlight-color:transparent}#kpDockV6 a:active{transform:scale(.97)}#kpDockV6 a.active{color:#172019}#kpDockV6 .kp6-icon{font-size:18px;line-height:1;transition:transform .2s ease}#kpDockV6 .active .kp6-icon{transform:translateY(-1px) scale(1.06)}#kpDockV6 b{max-width:100%;font-size:9px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700}
@media(max-width:760px){body.kpulse-app-mode .topbar::after,body.kpulse-app-mode .topbar::before{display:none!important}#kpDockV6{left:8px!important;right:8px!important;width:auto!important;height:68px!important;bottom:max(7px,env(safe-area-inset-bottom))!important;transform:none!important;border-radius:22px!important;padding:4px!important}#kpDockV6 .kp6-indicator{top:4px!important;left:4px!important;height:60px!important;border-radius:18px!important}#kpDockV6 a{height:60px!important;padding:2px 1px!important;gap:4px!important}#kpDockV6 .kp6-icon{font-size:16px!important}#kpDockV6 b{font-size:7px!important}}
@media(max-width:390px){#kpDockV6 b{font-size:6.2px!important}#kpDockV6 .kp6-icon{font-size:15px!important}}
@media(prefers-reduced-motion:reduce){#kpDockV6 .kp6-indicator{transition:none!important}body.kpulse-app-mode .topbar::before{animation:none!important}}
`;document.head.appendChild(s)}
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

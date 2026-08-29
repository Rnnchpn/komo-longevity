/* KŌMØ Pulse — canonical patient dock v7.0.0
   Final patient navigation: six destinations, no product picker, no Club in primary chrome. */
(() => {
'use strict';
const V='7.0.0';
const items=[
  ['home','Accueil','⌂','home'],
  ['key','KEY','◌','key'],
  ['results','Résultats','◎','results'],
  ['trajectory','Trajectoire','⌁','trajectory'],
  ['agenda','Rendez-vous','□','documents'],
  ['mykomo','My KŌMØ','◉','mykomo']
];
let raf=0;
const nav=()=>window.KomoPatientNavigation;
const route=()=>nav()?.route?.()||location.hash.replace(/^#/,'')||'home';
const visible=()=>{const a=document.querySelector('#appShell'),x=document.querySelector('#authScreen');return !!a&&!a.hidden&&(!x||x.hidden)&&!['clinical','admin'].includes(route())};
function active(){
 const r=route();
 if(r==='key')return'key';
 if(['results','motion','tests'].includes(r))return'results';
 if(['trajectory','path','plan'].includes(r))return'trajectory';
 if(['documents','agenda','rdv'].includes(r))return'agenda';
 if(['mykomo','club','profile'].includes(r))return'mykomo';
 return'home';
}
function css(){if(document.querySelector('#kpDock600'))return;const s=document.createElement('style');s.id='kpDock600';s.textContent=`
#kpDock,#kpDockV5{display:none!important}
#kpDockV6{position:fixed!important;z-index:10000!important;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(900px,calc(100vw - 28px));height:70px;padding:5px;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;border:1px solid rgba(244,241,234,.105);border-radius:23px;background:rgba(12,15,13,.96);box-shadow:0 22px 68px rgba(0,0,0,.40),inset 0 1px rgba(255,255,255,.025);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);isolation:isolate;overflow:hidden;box-sizing:border-box;pointer-events:auto!important;touch-action:manipulation}#kpDockV6[hidden]{display:none!important}
#kpDockV6 .kp6-indicator{position:absolute;z-index:0;top:5px;left:5px;height:60px;border-radius:18px;background:linear-gradient(145deg,#efede6,#e3dfd6);box-shadow:0 10px 28px rgba(0,0,0,.20),inset 0 1px rgba(255,255,255,.70);transition:transform .30s cubic-bezier(.2,.82,.22,1),width .20s ease;pointer-events:none}
#kpDockV6 a{position:relative;z-index:2;height:60px;min-width:0;border:0;border-radius:18px;background:transparent;color:#818b83;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:3px;font-family:'DM Sans',sans-serif;text-decoration:none;cursor:pointer;transition:color .18s ease,transform .12s ease;pointer-events:auto!important;-webkit-tap-highlight-color:transparent}#kpDockV6 a:active{transform:scale(.97)}#kpDockV6 a.active{color:#172019}#kpDockV6 .kp6-icon{font-size:17px;line-height:1;transition:transform .2s ease}#kpDockV6 .active .kp6-icon{transform:translateY(-1px) scale(1.06)}#kpDockV6 b{max-width:100%;font-size:8.5px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700}
@media(max-width:760px){#kpDockV6{left:8px!important;right:8px!important;width:auto!important;height:64px!important;bottom:max(7px,env(safe-area-inset-bottom))!important;transform:none!important;border-radius:21px!important;padding:4px!important}#kpDockV6 .kp6-indicator{top:4px!important;left:4px!important;height:56px!important;border-radius:17px!important}#kpDockV6 a{height:56px!important;padding:2px 1px!important;gap:4px!important}#kpDockV6 .kp6-icon{font-size:16px!important}#kpDockV6 b{font-size:6.9px!important}}
@media(max-width:390px){#kpDockV6 b{font-size:6.1px!important}#kpDockV6 .kp6-icon{font-size:15px!important}}
@media(prefers-reduced-motion:reduce){#kpDockV6 .kp6-indicator{transition:none!important}}
`;document.head.appendChild(s)}
function markup(){return '<i class="kp6-indicator"></i>'+items.map(([k,l,ic,r])=>`<a href="#${r}" data-kp6="${k}" data-kp6-route="${r}" aria-label="${l}"><span class="kp6-icon">${ic}</span><b>${l}</b></a>`).join('')}
function ensureDock(){const app=document.querySelector('#appShell');if(!app)return null;let d=document.querySelector('#kpDockV6');if(!d){d=document.createElement('nav');d.id='kpDockV6';d.setAttribute('aria-label','Navigation KŌMØ Pulse');d.innerHTML=markup();app.appendChild(d)}else if(d.dataset.version!==V){d.innerHTML=markup()}d.dataset.version=V;return d}
function paint(){const d=document.querySelector('#kpDockV6');if(!d||d.hidden)return;const key=active(),bs=[...d.querySelectorAll('[data-kp6]')];bs.forEach(b=>{const on=b.dataset.kp6===key;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});const b=bs.find(x=>x.dataset.kp6===key),i=d.querySelector('.kp6-indicator');if(b&&i){const pad=parseFloat(getComputedStyle(d).paddingLeft)||0;i.style.width=`${b.offsetWidth}px`;i.style.transform=`translateX(${Math.max(0,b.offsetLeft-pad)}px)`}}
function refresh(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{css();const d=ensureDock();if(!d)return;d.hidden=!visible();if(!d.hidden)requestAnimationFrame(paint)})}
document.addEventListener('click',e=>{const native=e.target.closest?.('#kpDockV6 a[data-kp6-route]');if(native)requestAnimationFrame(()=>window.KomoPatientNavigation?.resetScroll?.())},true);
['hashchange','pageshow','resize','orientationchange','komo:canonical-route','komo:session-ready','komo:session-cleared'].forEach(x=>window.addEventListener(x,refresh));
document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,220));setTimeout(refresh,650);
window.KomoBottomNav={version:V,refresh};
})();
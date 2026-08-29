/* KŌMØ Pulse — nested My KŌMØ / My Key navigation v2
   KEY stays visible on Home as a data preview, but is no longer a primary app tab.
   The full KEY data space lives one level deeper next to My KŌMØ. */
(()=>{
'use strict';
const V='2.0.0';
let timers=[];
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const go=target=>window.KomoPatientNavigation?.go?.(target)||(location.hash=target);

function style(){
  if(document.querySelector('#kNestedKeyStyle'))return;
  const s=document.createElement('style');
  s.id='kNestedKeyStyle';
  s.textContent=`
  .kns-switch{width:min(520px,100%);margin:0 auto 22px;padding:5px;display:grid;grid-template-columns:1fr 1fr;gap:4px;border:1px solid rgba(37,48,40,.09);border-radius:18px;background:rgba(255,255,255,.54);box-shadow:0 10px 34px rgba(31,42,34,.05);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
  .kns-switch button{min-height:43px;border:0;border-radius:13px;background:transparent;color:#6f786f;font:600 9px/1 'DM Sans',sans-serif;letter-spacing:.09em;text-transform:uppercase;cursor:pointer;transition:background .2s ease,color .2s ease,box-shadow .2s ease,transform .12s ease}
  .kns-switch button:active{transform:scale(.98)}
  .kns-switch button.active{background:linear-gradient(145deg,#28352d,#202a24);color:#fff;box-shadow:0 8px 20px rgba(31,42,34,.14)}
  [data-kh-tabs]{width:min(520px,100%);margin-left:auto!important;margin-right:auto!important}
  .mykomo-key-home .mkh-action,.kcm-watch-card .kcm-watch-button{letter-spacing:.01em}
  #kpDockV6 [data-kp6="key"],#kcmMenu [data-kcm-route="key"],#desktopNav [data-route="key"],#mobileNav [data-route="key"],.nav-stack [href="#key"],.kam-bottom [data-route="key"]{display:none!important}
  @media(max-width:767px){.kns-switch{margin:0 0 18px;border-radius:16px}.kns-switch button{min-height:46px;font-size:8px}}
  @media(prefers-reduced-motion:reduce){.kns-switch button{transition:none!important}}
  `;
  document.head.appendChild(s);
}

function switchMarkup(active){
  return `<div class="kns-switch" data-key-nested-switch role="tablist" aria-label="Espace personnel KŌMØ"><button type="button" class="${active==='mykomo'?'active':''}" data-kns-go="mykomo" role="tab" aria-selected="${active==='mykomo'}">MY KŌMØ</button><button type="button" class="${active==='key'?'active':''}" data-kns-go="key" role="tab" aria-selected="${active==='key'}">MY KEY</button></div>`;
}

function patchKeyTabs(){
  if(route()!=='key')return;
  const root=document.querySelector('#viewRoot');
  if(!root)return;
  const tabs=root.querySelector('[data-kh-tabs]');
  if(tabs){
    const buttons=[...tabs.querySelectorAll('[data-kh-go]')];
    const my=buttons.find(b=>b.dataset.khGo==='home'||b.dataset.khGo==='mykomo')||buttons[0];
    const key=buttons.find(b=>b.dataset.khGo==='key')||buttons[1];
    if(my){my.dataset.khGo='mykomo';my.textContent='MY KŌMØ';my.classList.remove('active')}
    if(key){key.dataset.khGo='key';key.textContent='MY KEY';key.classList.add('active')}
    tabs.dataset.keyNestedSwitch='1';
    return;
  }
  if(!root.querySelector('[data-key-nested-switch]')){
    const w=document.createElement('div');
    w.innerHTML=switchMarkup('key');
    root.prepend(w.firstElementChild);
  }
}

function patchMyKomo(){
  if(route()!=='mykomo')return;
  const root=document.querySelector('#viewRoot');
  if(!root)return;
  const existing=root.querySelector('[data-key-nested-switch]');
  if(existing){
    existing.querySelectorAll('[data-kns-go]').forEach(b=>{
      const on=b.dataset.knsGo==='mykomo';
      b.classList.toggle('active',on);
      b.setAttribute('aria-selected',String(on));
    });
    return;
  }
  const w=document.createElement('div');
  w.innerHTML=switchMarkup('mykomo');
  root.prepend(w.firstElementChild);
}

function patchHome(){
  if(route()!=='home')return;
  document.querySelectorAll('[data-key-nested-switch],[data-kh-home-tabs]').forEach(x=>x.remove());
  const desktop=document.querySelector('[data-key-home] [data-key-open]');
  if(desktop)desktop.textContent='Ouvrir My Key →';
  const mobile=document.querySelector('.kcm-watch-card [data-kcm-route="key"]');
  if(mobile)mobile.textContent='Ouvrir My Key →';
}

function patchPrimaryNavigation(){
  const keySelectors=[
    '#kpDockV6 [data-kp6="key"]',
    '#kcmMenu .kcm-menu-nav [data-kcm-route="key"]',
    '#desktopNav [data-route="key"]',
    '#mobileNav [data-route="key"]',
    '.nav-stack [href="#key"]',
    '.kam-bottom [data-route="key"]'
  ];
  document.querySelectorAll(keySelectors.join(',')).forEach(x=>x.remove());
  if(route()==='key'){
    document.querySelectorAll('#kpDockV6 [data-kp6="mykomo"],#kcmMenu [data-kcm-route="mykomo"],#desktopNav [data-route="mykomo"],#mobileNav [data-route="mykomo"],.nav-stack [href="#mykomo"],.kam-bottom [data-route="mykomo"]').forEach(x=>x.classList.add('active'));
  }
}

function paint(){
  style();
  const r=route();
  if(r!=='mykomo')document.querySelectorAll('#viewRoot > [data-key-nested-switch]').forEach(x=>x.remove());
  if(r==='home')patchHome();
  if(r==='mykomo')patchMyKomo();
  if(r==='key')patchKeyTabs();
  patchPrimaryNavigation();
}

function schedule(){
  timers.forEach(clearTimeout);timers=[];
  [0,70,220,620,1250].forEach(ms=>timers.push(setTimeout(paint,ms)));
}

document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-kns-go]');
  if(b){e.preventDefault();go(b.dataset.knsGo);return}
  if(e.target.closest?.('#kcmMenuButton'))setTimeout(patchPrimaryNavigation,0);
},true);
['hashchange','pageshow','popstate','komo:route-ready','komo:canonical-route','komo:data-ready','komo:wearable-data-updated','komo:session-ready'].forEach(name=>window.addEventListener(name,schedule,{passive:true}));
document.addEventListener('DOMContentLoaded',schedule,{once:true});
if(document.readyState!=='loading')schedule();
window.KomoNestedKeyNavigation={version:V,refresh:schedule};
})();

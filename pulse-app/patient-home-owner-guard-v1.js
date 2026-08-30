/* KŌMØ Pulse — patient Home single-owner guard v1
   Keeps the final Home cockpit mounted without allowing legacy Home decorators
   to compete for the same DOM. Falls back to the mounted My KŌMØ baseline
   instead of ever leaving the patient with a blank Home. */
(() => {
  'use strict';

  const VERSION='1.0.0';
  const ROUTE='home';
  let hostObserver=null;
  let observedHost=null;
  let retryTimer=0;
  let fallbackTimer=0;
  let retryCount=0;

  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||ROUTE;
  const wall=host=>host?.querySelector?.('[data-khome-datawall]')||null;

  function installStyle(){
    if(document.querySelector('#khomeOwnerGuardStyle'))return;
    const s=document.createElement('style');
    s.id='khomeOwnerGuardStyle';
    s.textContent=`
      html[data-kp-nav-mode="patient"] body.khome-final-v1,
      html[data-kp-nav-mode="patient"] body.khome-final-v1 #appShell,
      html[data-kp-nav-mode="patient"] body.khome-final-v1 .main-shell{
        background:#060807!important;
      }
      body[data-khome-fallback="1"] [data-my-komo-home]>.mykomo-card,
      body[data-khome-fallback="1"] [data-my-komo-home]>.mykomo-engagement{
        display:block!important;
      }
      body[data-khome-fallback="1"] [data-my-komo-home]{
        width:100%!important;
        max-width:none!important;
      }
    `;
    document.head.appendChild(s);
  }

  function clearFallback(){
    clearTimeout(fallbackTimer);
    delete document.body.dataset.khomeFallback;
  }

  function showFallback(host){
    if(route()!==ROUTE||wall(host))return;
    if(!host?.querySelector('.mykomo-card'))return;
    document.body.dataset.khomeFallback='1';
    document.body.classList.remove('khome-final-v1','khome-v3');
    const eyebrow=document.querySelector('#pageEyebrow');
    const title=document.querySelector('#pageTitle');
    if(eyebrow)eyebrow.textContent='KŌMØ PULSE';
    if(title)title.textContent='Votre espace personnel.';
    console.warn('[patient-home-owner-guard] final Home unavailable, baseline kept visible');
  }

  function askFinalHome(force=false){
    const api=window.KomoPatientHomeCommand;
    if(api?.refresh){
      api.refresh(force);
      return true;
    }
    return false;
  }

  function schedule(ms=70,force=false){
    clearTimeout(retryTimer);
    retryTimer=setTimeout(()=>ensure(force),ms);
  }

  function observe(host){
    if(observedHost===host&&hostObserver)return;
    hostObserver?.disconnect();
    observedHost=host;
    hostObserver=new MutationObserver(()=>{
      if(route()!==ROUTE)return;
      if(wall(host)){
        retryCount=0;
        clearFallback();
        return;
      }
      schedule(45,true);
    });
    hostObserver.observe(host,{childList:true,subtree:false});
  }

  function ensure(force=false){
    installStyle();
    if(route()!==ROUTE){
      retryCount=0;
      clearFallback();
      hostObserver?.disconnect();
      hostObserver=null;
      observedHost=null;
      return;
    }

    const host=document.querySelector('[data-my-komo-home]');
    if(!host){
      if(retryCount<8){
        retryCount+=1;
        window.KomoMyKomo?.refresh?.();
        schedule(180,true);
      }
      return;
    }

    observe(host);
    if(wall(host)){
      retryCount=0;
      clearFallback();
      return;
    }

    askFinalHome(force);
    clearTimeout(fallbackTimer);
    fallbackTimer=setTimeout(()=>{
      if(route()===ROUTE&&!wall(host))showFallback(host);
    },1050);
  }

  ['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:canonical-result-ready','komo:session-ready','komo:wearable-data-updated']
    .forEach(name=>window.addEventListener(name,()=>schedule(name==='komo:data-ready'?90:60,name==='komo:data-ready'||name==='komo:wearable-data-updated')));

  document.addEventListener('DOMContentLoaded',()=>schedule(550,true));
  setTimeout(()=>ensure(true),1100);
  setTimeout(()=>ensure(true),2200);

  window.KomoPatientHomeOwnerGuard={
    version:VERSION,
    refresh:()=>schedule(20,true),
    status:()=>({route:route(),hasHost:!!document.querySelector('[data-my-komo-home]'),hasFinal:!!document.querySelector('[data-khome-datawall]'),fallback:document.body.dataset.khomeFallback==='1'})
  };
})();

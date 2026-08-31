/* KŌMØ Pulse — patient Home render guard */
(() => {
  'use strict';
  const VERSION='1.0.0';
  let retryTimer=0;
  let observer=null;

  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';

  function sync(){
    const onHome=route()==='home';
    const home=document.querySelector('[data-my-komo-home]');
    const wall=home?.querySelector('[data-khome-datawall]');
    document.body.classList.toggle('home-v1-mounted',Boolean(onHome&&wall));
    if(!onHome){clearTimeout(retryTimer);return}
    if(wall){clearTimeout(retryTimer);return}
    clearTimeout(retryTimer);
    retryTimer=setTimeout(()=>{
      if(route()!=='home'||document.querySelector('[data-khome-datawall]'))return;
      window.KomoPatientHomeCommand?.refresh?.();
    },2800);
  }

  function mount(){
    if(observer)return;
    observer=new MutationObserver(sync);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
    sync();
  }

  ['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:canonical-result-ready','komo:session-ready'].forEach(name=>window.addEventListener(name,sync));
  document.addEventListener('DOMContentLoaded',mount);
  if(document.readyState!=='loading')mount();
  window.KomoPatientHomeStability={version:VERSION,sync};
})();

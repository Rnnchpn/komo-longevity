/* KŌMØ Pulse — final patient route activation runtime v2 */
(() => {
  'use strict';
  const V='2.0.0';
  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
  let seq=0;
  function reveal(){
    document.body.classList.remove('kmotion-route-pending','komo-trajectory-pending');
    const root=document.querySelector('#viewRoot');
    if(root){root.style.removeProperty('visibility');root.style.removeProperty('pointer-events')}
  }
  function mounted(r){
    if(r==='motion')return !!document.querySelector('[data-motion-hub-v3]');
    if(r==='trajectory')return !!document.querySelector('[data-trajectory-v3]');
    if(r==='documents')return !!document.querySelector('[data-agenda-hub-v4]');
    return true;
  }
  function invoke(r){
    reveal();
    try{
      if(r==='motion')window.KomoMotionHubV3?.refresh?.();
      else if(r==='trajectory')window.KomoTrajectoryV3?.refresh?.();
      else if(r==='documents'){
        window.KomoAgendaHubV4?.refresh?.();
        setTimeout(()=>window.KomoAgendaCleanRoom?.enforce?.(),20);
      }
    }catch(e){console.error('[patient-route-runtime-v2]',r,e)}
  }
  function activate(){
    const token=++seq,r=route();
    reveal();
    if(!['motion','trajectory','documents'].includes(r))return;
    [0,80,260,650,1300].forEach(ms=>setTimeout(()=>{
      if(token!==seq||route()!==r)return;
      invoke(r);
    },ms));
  }
  window.addEventListener('hashchange',activate,true);
  window.addEventListener('popstate',activate,true);
  window.addEventListener('pageshow',activate);
  window.addEventListener('komo:canonical-route',activate);
  window.addEventListener('komo:route-ready',activate);
  window.addEventListener('komo:session-ready',activate);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(activate,60));
  setTimeout(activate,1200);
  window.KomoPatientRouteRuntimeV2={version:V,activate,reveal,mounted};
})();

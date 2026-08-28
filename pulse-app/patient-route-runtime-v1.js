/* KŌMØ Pulse — final patient route activation runtime v1.1
   Ensures the visible owner mounts after navigation regardless of listener/module timing. */
(() => {
  'use strict';
  const V='1.1.0';
  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
  let seq=0;

  function reveal(){
    document.body.classList.remove('kmotion-route-pending','komo-trajectory-pending');
    const root=document.querySelector('#viewRoot');
    if(root){root.style.removeProperty('visibility');root.style.removeProperty('pointer-events')}
    const pe=document.querySelector('#pageEyebrow'),pt=document.querySelector('#pageTitle');
    pe?.style.removeProperty('visibility');pt?.style.removeProperty('visibility');
  }

  function mounted(r){
    if(r==='motion')return !!document.querySelector('[data-motion-hub-v3]');
    if(r==='trajectory')return !!document.querySelector('[data-trajectory-v3]');
    if(r==='documents')return !!document.querySelector('[data-agenda-hub-v3]');
    return true;
  }

  function invoke(r){
    reveal();
    try{
      if(r==='motion')window.KomoMotionHubV3?.refresh?.();
      else if(r==='trajectory')window.KomoTrajectoryV3?.refresh?.();
      else if(r==='documents')window.KomoAgendaHubV3?.refresh?.();
    }catch(e){console.error('[patient-route-runtime]',r,e)}
  }

  function fallback(r){
    if(!['motion','trajectory','documents'].includes(r)||mounted(r))return;
    const root=document.querySelector('#viewRoot');if(!root)return;
    const labels={motion:['KŌMØ PULSE · MOTION','Préparation du bilan Motion…'],trajectory:['KŌMØ PULSE · TRAJECTOIRE','Chargement de votre trajectoire…'],documents:['KŌMØ PULSE · AGENDA','Chargement de votre agenda…']};
    const [ey,title]=labels[r];
    const pe=document.querySelector('#pageEyebrow'),pt=document.querySelector('#pageTitle');
    if(pe)pe.textContent=ey;if(pt)pt.textContent=title;
    root.innerHTML=`<section data-kp-route-fallback="${r}" style="min-height:320px;display:grid;place-items:center;padding:36px"><div style="max-width:520px;text-align:center"><div style="font:600 11px/1.2 'DM Sans',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#788079">KŌMØ PULSE</div><h2 style="margin:12px 0 8px;font:600 28px/1.05 Manrope,sans-serif;color:#26372d">${title}</h2><p style="margin:0;color:#7b827d;font:400 11px/1.6 'DM Sans',sans-serif">La page est en cours d’initialisation. Pulse relance automatiquement son module.</p></div></section>`;
  }

  function activate(){
    const token=++seq,r=route();
    reveal();
    if(!['motion','trajectory','documents'].includes(r))return;
    [0,80,260,650,1300].forEach((ms,i)=>setTimeout(()=>{
      if(token!==seq||route()!==r)return;
      if(i===2&&!mounted(r))fallback(r);
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
  window.KomoPatientRouteRuntime={version:V,activate,reveal};
})();

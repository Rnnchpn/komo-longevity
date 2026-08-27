/* KŌMØ Pulse — patient Motion booking bridge v2
   The canonical RDV UI is booking-layer-v1. This file intentionally owns no
   #documents rendering and only forwards existing Motion CTAs to that route. */
(() => {
  let timer=0;

  function route(){return location.hash.replace(/^#/,'')||'home'}
  function canonicalRefresh(){
    if(route()!=='documents')return;
    window.KomoBooking?.refreshPatient?.();
  }
  function openBooking(){
    document.querySelector('#modeSwitch button[data-mode="member"]')?.click();
    if(location.hash!=='#documents')location.hash='documents';
    clearTimeout(timer);
    timer=setTimeout(canonicalRefresh,80);
  }
  function setTextIfChanged(el,text){if(el&&el.textContent!==text)el.textContent=text}
  function bridge(){
    document.querySelectorAll('[data-kfree-v2-motion]').forEach(b=>{
      const k=b.dataset.kfreeV2Motion;
      if(['request','follow','book'].includes(k))setTextIfChanged(b,k==='book'?'Voir mon rendez-vous →':'Choisir mon centre →');
    });
    const p=document.querySelector('#pirOpenRequest');
    if(p)setTextIfChanged(p,'Choisir mon centre →');
  }

  document.addEventListener('click',event=>{
    const b=event.target.closest?.('[data-kfree-v2-motion],#pirOpenRequest');
    if(!b)return;
    const kind=b.dataset?.kfreeV2Motion;
    if(b.id==='pirOpenRequest'||['request','follow','book'].includes(kind)){
      event.preventDefault();
      event.stopImmediatePropagation();
      openBooking();
    }
  },true);

  function refresh(){bridge();if(route()==='documents')canonicalRefresh()}
  ['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:session-ready'].forEach(name=>window.addEventListener(name,()=>setTimeout(refresh,40)));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,240));
  const root=document.querySelector('#viewRoot');
  if(root)new MutationObserver(()=>bridge()).observe(root,{childList:true,subtree:true});
  setTimeout(refresh,700);

  window.KomoPatientMotionBooking={open:openBooking,refresh:canonicalRefresh};
})();

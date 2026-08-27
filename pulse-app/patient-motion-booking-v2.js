/* KŌMØ Pulse — patient Motion booking bridge v2
   The canonical RDV UI and all RDV data loading are owned by booking-layer-v1.
   This bridge only routes existing Motion CTAs to #documents. */
(() => {
  function route(){return location.hash.replace(/^#/,'')||'home'}
  function openBooking(){
    document.querySelector('#modeSwitch button[data-mode="member"]')?.click();
    if(location.hash!=='#documents')location.hash='documents';
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

  function refresh(){bridge()}
  ['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:session-ready'].forEach(name=>window.addEventListener(name,()=>setTimeout(refresh,40)));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,240));
  const root=document.querySelector('#viewRoot');
  if(root)new MutationObserver(()=>bridge()).observe(root,{childList:true,subtree:true});
  setTimeout(refresh,700);

  window.KomoPatientMotionBooking={open:openBooking};
})();

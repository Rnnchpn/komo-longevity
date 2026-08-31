/* KŌMØ Pulse — guided mobile content v2.1
   Presentation-only patient test guidance on phones.
   The canonical Results copy is never rewritten by viewport. */
(() => {
  const MOBILE='(max-width: 767px)';
  let raf=0;
  let viewObserver=null;

  function isMobile(){return window.matchMedia(MOBILE).matches}
  function route(){return window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home'}
  function isPatientSurface(){return !['clinical','admin'].includes(route())}

  function setSurface(){
    if(!isMobile()){
      delete document.documentElement.dataset.mobileSurface;
      return false;
    }
    document.documentElement.dataset.mobileSurface=isPatientSurface()?'patient':'staff';
    return isPatientSurface();
  }

  function enhanceTests(){
    if(route()!=='results')return;
    const root=document.querySelector('.tests-v1-root');
    if(!root)return;

    // Mobile may highlight the next action, but it never changes canonical copy.
    const cards=[...root.querySelectorAll('.tests-v1-grid .test-v1-card')];
    cards.forEach(card=>card.classList.remove('mg-next-test'));
    const next=cards.find(card=>!card.classList.contains('is-done')&&!card.classList.contains('is-restricted'));
    if(next)next.classList.add('mg-next-test');
  }

  function refresh(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      if(!setSurface())return;
      enhanceTests();
    });
  }

  function observeView(){
    const root=document.querySelector('#viewRoot');
    if(!root||viewObserver)return;
    viewObserver=new MutationObserver(refresh);
    viewObserver.observe(root,{childList:true,subtree:true});
  }

  ['resize','orientationchange','hashchange','komo:route-ready','komo:session-ready','komo:data-ready'].forEach(name=>window.addEventListener(name,refresh,{passive:name==='resize'}));
  document.addEventListener('DOMContentLoaded',()=>{observeView();setTimeout(refresh,220)});
  observeView();
  setTimeout(refresh,700);
})();

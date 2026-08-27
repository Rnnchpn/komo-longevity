/* KŌMØ Pulse — iPad / tablet patient navigation v1 */
(() => {
  const TABLET_QUERY='(min-width: 768px) and (max-width: 1366px) and (hover: none) and (pointer: coarse)';
  let raf=0;

  function route(){return location.hash.replace(/^#/,'')||'home'}
  function isPatient(){return !['clinical','admin'].includes(route())}
  function isIPad(){return /iPad/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
  function isTablet(){return window.matchMedia(TABLET_QUERY).matches||(isIPad()&&innerWidth>=768&&innerWidth<=1366)}

  function setSurface(){
    if(!isTablet()){
      delete document.documentElement.dataset.tabletSurface;
      return false;
    }
    document.documentElement.dataset.tabletSurface=isPatient()?'patient':'staff';
    return isPatient();
  }

  function ensureAccountTrigger(){
    const actions=document.querySelector('.topbar-actions');
    const source=document.querySelector('#accountButton');
    if(!actions||!source)return;
    let button=actions.querySelector('.tablet-account-trigger');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='tablet-account-trigger';
      button.setAttribute('aria-label','Ouvrir mon compte');
      button.addEventListener('click',event=>{event.stopPropagation();source.click()});
      actions.appendChild(button);
    }
    const initials=document.querySelector('#avatarInitials')?.textContent?.trim()||'K';
    if(button.textContent!==initials)button.textContent=initials;
  }

  function refresh(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      if(!setSurface())return;
      ensureAccountTrigger();
    });
  }

  const observer=new MutationObserver(refresh);
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
  addEventListener('resize',refresh,{passive:true});
  addEventListener('orientationchange',()=>setTimeout(refresh,100));
  addEventListener('hashchange',()=>{refresh();setTimeout(refresh,180)});
  addEventListener('komo:route-ready',refresh);
  addEventListener('komo:session-ready',refresh);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,250));
  setTimeout(refresh,700);
})();

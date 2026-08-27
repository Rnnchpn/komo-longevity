/* KŌMØ Pulse — phone patient navigation menu v3.1 */
(() => {
  const PHONE='(max-width: 767px)';
  let scheduled=0;

  function isPhone(){return window.matchMedia(PHONE).matches}
  function route(){return location.hash.replace(/^#/,'')||'home'}
  function isPatient(){return !['clinical','admin'].includes(route())}
  function appVisible(){
    const app=document.querySelector('#appShell');
    const auth=document.querySelector('#authScreen');
    return !!app && !app.hidden && (!auth || auth.hidden);
  }

  function closeMenu(pop,trigger){
    pop.hidden=true;
    trigger?.setAttribute('aria-expanded','false');
  }

  function navigate(target,pop,trigger){
    closeMenu(pop,trigger);
    const next=`#${target}`;
    if(location.hash!==next){
      location.hash=target;
    }else{
      window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:target}}));
    }
  }

  function ensureMenu(){
    const pop=document.querySelector('#accountPopover');
    const trigger=document.querySelector('.mobile-account-trigger');

    if(!isPhone()||!isPatient()||!appVisible()){
      if(pop?.querySelector('.mg-mobile-menu')) pop.querySelector('.mg-mobile-menu').remove();
      if(pop && !appVisible()) pop.hidden=true;
      trigger?.setAttribute('aria-expanded','false');
      return;
    }

    const meta=pop?.querySelector('.account-meta');
    if(!pop||!meta)return;

    if(trigger){
      trigger.setAttribute('aria-label','Ouvrir le menu');
      trigger.setAttribute('title','Menu');
      trigger.setAttribute('aria-expanded',String(!pop.hidden));
    }

    let menu=pop.querySelector('.mg-mobile-menu');
    if(!menu){
      menu=document.createElement('nav');
      menu.className='mg-mobile-menu';
      menu.setAttribute('aria-label','Navigation KŌMØ Pulse');
      menu.innerHTML=`
        <button type="button" data-mobile-nav-route="home">Accueil</button>
        <button type="button" data-mobile-nav-route="results">Tests</button>
        <button type="button" data-mobile-nav-route="path">Résultats</button>
        <button type="button" data-mobile-nav-route="plan">Suivi</button>
        <button type="button" data-mobile-nav-route="documents">Rendez-vous</button>
        <button type="button" data-mobile-nav-route="messages">Messages</button>
        <a href="https://komolongevity.com/fr/" target="_blank" rel="noopener noreferrer" data-mobile-menu-link="site">Site principal KŌMØ</a>`;
      meta.insertAdjacentElement('afterend',menu);
      menu.querySelectorAll('[data-mobile-nav-route]').forEach(button=>{
        button.addEventListener('click',event=>{
          event.preventDefault();
          event.stopPropagation();
          navigate(button.dataset.mobileNavRoute,pop,trigger);
        });
      });
      menu.querySelector('[data-mobile-menu-link="site"]')?.addEventListener('click',()=>closeMenu(pop,trigger));
    }

    const current=route();
    menu.querySelectorAll('[data-mobile-nav-route]').forEach(button=>button.classList.toggle('is-active',button.dataset.mobileNavRoute===current));
  }

  function refresh(){
    cancelAnimationFrame(scheduled);
    scheduled=requestAnimationFrame(ensureMenu);
  }

  const observer=new MutationObserver(refresh);
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
  window.addEventListener('hashchange',refresh);
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(refresh,100));
  window.addEventListener('komo:route-ready',refresh);
  window.addEventListener('komo:session-ready',refresh);
  window.addEventListener('komo:session-cleared',refresh);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,250));
  setTimeout(refresh,700);
  setTimeout(refresh,1500);
})();
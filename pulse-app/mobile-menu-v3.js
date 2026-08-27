/* KŌMØ Pulse — phone patient navigation menu v3 */
(() => {
  const PHONE='(max-width: 767px)';
  let scheduled=0;

  function isPhone(){return window.matchMedia(PHONE).matches}
  function route(){return location.hash.replace(/^#/,'')||'home'}
  function isPatient(){return !['clinical','admin'].includes(route())}

  function ensureMenu(){
    if(!isPhone()||!isPatient())return;
    const pop=document.querySelector('#accountPopover');
    const meta=pop?.querySelector('.account-meta');
    const trigger=document.querySelector('.mobile-account-trigger');
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
        <a href="#home" data-route="home" data-mobile-menu-link="home">Accueil</a>
        <a href="#results" data-route="results" data-mobile-menu-link="tests">Tests</a>
        <a href="#path" data-route="path" data-mobile-menu-link="results">Résultats</a>
        <a href="#plan" data-route="plan" data-mobile-menu-link="followup">Suivi</a>
        <a href="#documents" data-route="documents" data-mobile-menu-link="appointments">Rendez-vous</a>
        <a href="#messages" data-route="messages" data-mobile-menu-link="messages">Messages</a>
        <a href="https://komolongevity.com/fr/" target="_blank" rel="noopener noreferrer" data-mobile-menu-link="site">Site principal KŌMØ</a>`;
      meta.insertAdjacentElement('afterend',menu);
      menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{pop.hidden=true;if(trigger)trigger.setAttribute('aria-expanded','false')}));
    }

    const current=route();
    menu.querySelectorAll('[data-route]').forEach(link=>link.classList.toggle('is-active',link.dataset.route===current));
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
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,250));
  setTimeout(refresh,700);
  setTimeout(refresh,1500);
})();

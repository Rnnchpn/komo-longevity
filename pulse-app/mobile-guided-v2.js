/* KŌMØ Pulse — guided mobile content v2
   Shell/navigation ownership belongs exclusively to adaptive-shell-v4.
   This module only polishes the patient test flow on phones. */
(() => {
  const MOBILE='(max-width: 767px)';
  let raf=0;
  let viewObserver=null;

  function isMobile(){return window.matchMedia(MOBILE).matches}
  function route(){return location.hash.replace(/^#/,'')||'home'}
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

    const title=root.querySelector('.tests-v1-hero-main h2');
    const intro=root.querySelector('.tests-v1-hero-main > p:not(.eyebrow)');
    if(title&&title.dataset.mobileGuided!=='1'){
      title.dataset.mobileGuided='1';
      title.innerHTML='Trois étapes.<br><em>Votre première référence.</em>';
    }
    if(intro&&intro.dataset.mobileGuided!=='1'){
      intro.dataset.mobileGuided='1';
      intro.textContent='Questionnaire, Chair Stand et Two-Step : Pulse vous indique quoi faire, dans quel ordre et conserve chaque mesure.';
    }

    const cards=[...root.querySelectorAll('.tests-v1-grid .test-v1-card')];
    cards.forEach(card=>card.classList.remove('mg-next-test'));
    const next=cards.find(card=>!card.classList.contains('is-done')&&!card.classList.contains('is-restricted'));
    if(next)next.classList.add('mg-next-test');

    const sectionHead=[...root.querySelectorAll('.tests-v1-section-head')].find(head=>!head.classList.contains('consultation'));
    const sectionTitle=sectionHead?.querySelector('h3');
    const sectionCopy=sectionHead?.querySelector(':scope > p');
    if(sectionTitle)sectionTitle.textContent=next?'À faire maintenant.':'Votre première référence est complète.';
    if(sectionCopy)sectionCopy.textContent=next?'Suivez l’ordre proposé. Chaque étape enregistrée vous rapproche du premier résultat KŌMØ.':'Votre résultat gratuit est disponible ci-dessous. La suite se poursuit avec KŌMØ Motion.';
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

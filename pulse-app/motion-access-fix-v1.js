/* KŌMØ Pulse — Motion access fix v1
   Keeps Motion entry clickable and hands members without a professional Motion dossier
   to the canonical Pulse Free test flow instead of leaving disabled controls. */
(() => {
  'use strict';
  const V='1.0.0';
  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';

  function closePickers(){
    document.querySelector('#kpPicker')?.classList.remove('open');
    document.querySelector('#kpPickerBg')?.classList.remove('open');
    document.querySelector('#kpPickerV5')?.classList.remove('open');
    document.querySelector('#kpPickerV5Bg')?.classList.remove('open');
  }

  function goMotion(){
    closePickers();
    document.querySelector('#modeSwitch [data-mode="member"]')?.click();
    if(window.KomoPatientNavigation?.go) window.KomoPatientNavigation.go('motion');
    else if(location.hash!=='#motion') location.hash='motion';
    else window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:'motion',source:'motion-access-fix'}}));
  }

  function startFree(){
    closePickers();
    document.querySelector('#modeSwitch [data-mode="member"]')?.click();
    if(window.KomoMotionTestsEntry?.start){
      window.KomoMotionTestsEntry.start();
      return;
    }
    location.hash='results';
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const cards=[...document.querySelectorAll('.test-v1-card')];
      const key=['baseline','chair_stand','two_step'].find(k=>{
        const b=document.querySelector(`[data-open-test="${k}"]`);
        const card=b?.closest?.('.test-v1-card');
        return b && !card?.classList.contains('is-done');
      });
      const button=key&&document.querySelector(`[data-open-test="${key}"]`);
      if(button){button.click();clearInterval(timer)}
      else if(tries>30)clearInterval(timer);
    },100);
  }

  function patchMotionHub(){
    if(route()!=='motion') return;
    const hub=document.querySelector('[data-motion-hub-v3]');
    if(!hub) return;
    const primary=hub.querySelector('.kmv3-hero-actions .kmv3-btn.primary[data-kmv3-open]');
    if(primary?.disabled){
      primary.disabled=false;
      primary.removeAttribute('data-kmv3-open');
      primary.setAttribute('data-kmotion-free-start','1');
      primary.textContent='Commencer mes tests →';
      const intro=hub.querySelector('.kmv3-hero p');
      if(intro) intro.textContent='Commencez immédiatement par le questionnaire KŌMØ, le Chair Stand et le Two-Step. Le pré-bilan Motion complet s’ouvrira ensuite lorsque votre parcours en centre sera validé.';
      const section=hub.querySelector('.kmv3-intro p');
      if(section) section.textContent='Les trois premières étapes Pulse sont accessibles maintenant, sans rendez-vous. Les chapitres complémentaires seront disponibles avec votre dossier Motion.';
    }
  }

  document.addEventListener('click',e=>{
    const motionEntry=e.target.closest?.('[data-kp-choice="motion"],[data-kp5-choice="motion"],[data-mkv3-route="motion"],[data-motion-direct]');
    if(motionEntry){
      e.preventDefault();
      e.stopImmediatePropagation();
      goMotion();
      return;
    }
    const free=e.target.closest?.('[data-kmotion-free-start]');
    if(free){
      e.preventDefault();
      e.stopImmediatePropagation();
      startFree();
    }
  },true);

  const schedule=()=>{setTimeout(patchMotionHub,20);setTimeout(patchMotionHub,180)};
  ['hashchange','pageshow','komo:canonical-route','komo:route-ready','komo:data-ready'].forEach(x=>window.addEventListener(x,schedule));
  new MutationObserver(()=>{if(route()==='motion')patchMotionHub()}).observe(document.body,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,700));
  setTimeout(schedule,1200);
  window.KomoMotionAccess={version:V,open:goMotion,startFree};
})();
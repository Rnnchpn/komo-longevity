(() => {
  'use strict';
  const V='2.0.0';

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
    else window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:'motion',source:'motion-access'}}));
  }

  function startFree(){
    closePickers();
    document.querySelector('#modeSwitch [data-mode="member"]')?.click();
    if(window.KomoMotionTestsEntry?.start){
      window.KomoMotionTestsEntry.start();
      return;
    }
    if(window.KomoPatientNavigation?.go) window.KomoPatientNavigation.go('results');
    else location.hash='results';
    let tries=0;
    const openNext=()=>{
      tries++;
      const key=['baseline','chair_stand','two_step'].find(k=>{
        const b=document.querySelector(`[data-open-test="${k}"]`);
        const card=b?.closest?.('.test-v1-card');
        return b&&!card?.classList.contains('is-done');
      });
      const button=key&&document.querySelector(`[data-open-test="${key}"]`);
      if(button){button.click();return}
      if(tries<12)setTimeout(openNext,120);
    };
    setTimeout(openNext,80);
  }

  document.addEventListener('click',e=>{
    const motionEntry=e.target.closest?.('[data-kp-choice="motion"],[data-kp5-choice="motion"],[data-mkv3-route="motion"],[data-motion-direct]');
    if(motionEntry){e.preventDefault();e.stopImmediatePropagation();goMotion();return}
    const free=e.target.closest?.('[data-kmotion-free-start]');
    if(free){e.preventDefault();e.stopImmediatePropagation();startFree()}
  },true);

  window.KomoMotionAccess={version:V,open:goMotion,startFree};
})();

import('./report-bootstrap-v1.js').catch(error=>console.warn('[KŌMØ report bootstrap]',error));

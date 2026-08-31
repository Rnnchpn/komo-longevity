/* KŌMØ Pulse — patient V1 bootstrap
   Replaces the historical Home DOM patcher. Modern patient surfaces own their rendering. */
(() => {
  'use strict';
  const VERSION='2.0.0';
  const stamp='20260831-patient-v12';

  function css(href,id){
    if(document.querySelector(`#${id}`))return;
    const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href=`${href}?v=${stamp}`;document.head.appendChild(link);
  }
  function script(src,id,{module=false}={}){
    if(document.querySelector(`#${id}`))return;
    const s=document.createElement('script');s.id=id;s.src=`${src}?v=${stamp}`;if(module)s.type='module';s.defer=true;document.body.appendChild(s);
  }
  function boot(){
    css('./patient-home-command-v1.css','patientHomeV1Css');
    css('./patient-home-stability-v1.css','patientHomeStabilityCss');
    css('./komo-patient-guide-v1.css','komoPatientGuideCss');
    script('./patient-home-stability-v1.js','patientHomeStabilityJs');
    script('./patient-home-command-v1.js','patientHomeV1Js',{module:true});
    script('./komo-patient-guide-v1.js','komoPatientGuideJs');
    document.documentElement.dataset.patientV1Bootstrap=VERSION;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

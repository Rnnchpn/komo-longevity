/* KŌMØ Pulse — patient mobile V1 runtime */
(() => {
  'use strict';
  const VERSION='1.0.1';
  const mq=window.matchMedia('(max-width:767px)');
  let timer=0;

  function isMobile(){return mq.matches}
  function route(){return window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home'}

  function tuneAuth(){
    if(!isMobile())return;
    const pill=document.querySelector('#authScreen .product-pill');
    const title=document.querySelector('#authScreen .auth-heading h2');
    const copy=document.querySelector('#authScreen .auth-heading p');
    if(pill)pill.textContent='KŌMØ PULSE';
    if(title)title.textContent='Bienvenue.';
    if(copy)copy.textContent='Vos résultats, votre suivi et votre prochaine étape, au même endroit.';
  }

  function tuneHome(){
    if(!isMobile()||route()!=='home')return;
    const label=document.querySelector('.khv-head>div>span');
    const dayTitle=document.querySelector('.kday-title h3');
    const stepsLabel=document.querySelector('.kday-steps>small');
    if(label)label.textContent='KŌMØ PULSE';
    if(dayTitle)dayTitle.textContent='Votre journée en mouvement.';
    if(stepsLabel)stepsLabel.textContent='MOUVEMENT AUJOURD’HUI';
    document.documentElement.dataset.patientMobile=VERSION;
  }

  function tune(){
    document.body.classList.toggle('komo-mobile-v1',isMobile());
    tuneAuth();
    tuneHome();
  }

  function schedule(ms=50){clearTimeout(timer);timer=setTimeout(tune,ms)}
  ['pageshow','hashchange','komo:route-ready','komo:data-ready','komo:session-ready','komo:wearable-data-updated'].forEach(name=>window.addEventListener(name,()=>schedule(40)));
  mq.addEventListener?.('change',()=>schedule(20));
  function boot(){tune();setTimeout(tune,250);setTimeout(tune,800);setTimeout(tune,1600)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
/* KŌMØ Pulse — patient V1 clarity layer
   Keeps the patient experience understandable even with infrequent visits. */
(() => {
  'use strict';
  let raf=0;

  const route=()=>location.hash.replace(/^#/,'').split('?')[0]||'home';
  const patientMode=()=>!['clinical','admin'].includes(route());

  const TITLES={
    home:['KŌMØ PULSE','Aujourd’hui'],
    results:['KŌMØ PULSE · RESULTS','Votre bilan'],
    path:['KŌMØ PULSE · TRAJECTOIRE','Votre évolution'],
    plan:['KŌMØ PULSE · SUIVI','Ce que vous devez faire'],
    documents:['KŌMØ PULSE · RENDEZ-VOUS','Votre prochaine étape'],
    key:['KŌMØ PULSE · KEY','Votre quotidien'],
    profile:['KŌMØ PULSE','Votre compte']
  };

  function patchBottomNav(){
    const nav=document.querySelector('#kamBottomBar');
    if(!nav||!patientMode())return;
    const labels={
      'patient:home':'Accueil',
      'patient:results':'Résultats',
      'patient:path':'Trajectoire',
      'patient:plan':'Suivi',
      'more':'Plus'
    };
    nav.querySelectorAll('[data-kam-nav]').forEach(btn=>{
      const label=labels[btn.dataset.kamNav];
      if(!label)return;
      const span=btn.querySelector('span');if(span&&span.textContent!==label)span.textContent=label;
      btn.setAttribute('aria-label',label);
    });
  }

  function patchDesktopNav(){
    const nav=document.querySelector('#desktopNav');if(!nav||!patientMode())return;
    const labels={home:'Accueil',results:'Résultats',path:'Trajectoire',documents:'Rendez-vous & dossier',explore:'Explorer'};
    nav.querySelectorAll('[data-route]').forEach(btn=>{
      const label=labels[btn.dataset.route];if(!label)return;
      const span=btn.querySelector('span');if(span&&span.textContent!==label)span.textContent=label;
      btn.setAttribute('aria-label',label);
    });
  }

  function patchHead(){
    const r=route(),copy=TITLES[r];if(!copy||!patientMode())return;
    if(r==='home'&&document.body.classList.contains('khome-final-v1'))return;
    if(r==='results'&&document.body.classList.contains('kresults-v1'))return;
    const eyebrow=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');
    if(eyebrow)eyebrow.textContent=copy[0];if(title)title.textContent=copy[1];
  }

  function refresh(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{patchBottomNav();patchDesktopNav();patchHead()})}
  const observer=new MutationObserver(refresh);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
  ['hashchange','pageshow','komo:route-ready','komo:session-ready','resize'].forEach(e=>window.addEventListener(e,refresh));
  document.addEventListener('DOMContentLoaded',refresh);setTimeout(refresh,1200);setTimeout(refresh,2200);
  window.KomoPatientV1Clarity={version:'1.0.0',refresh};
})();

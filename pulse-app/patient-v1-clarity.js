/* KŌMØ Pulse — patient V1 clarity layer
   Event-driven copy alignment only. Canonical navigation owners render the UI. */
(() => {
  'use strict';
  let raf=0;

  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'').split('?')[0]||'home';
  const patientMode=()=>!['clinical','admin'].includes(route());

  const TITLES={
    home:['KŌMØ PULSE','Aujourd’hui'],
    results:['KŌMØ PULSE · RESULTS','Votre bilan'],
    path:['KŌMØ PULSE · TRAJECTOIRE','Votre évolution'],
    trajectory:['KŌMØ PULSE · TRAJECTOIRE','Votre évolution'],
    plan:['KŌMØ PULSE · SUIVI','Ce que vous devez faire'],
    documents:['KŌMØ PULSE · RENDEZ-VOUS','Votre prochaine étape'],
    agenda:['KŌMØ PULSE · RENDEZ-VOUS','Votre prochaine étape'],
    key:['KŌMØ PULSE · KEY','Votre quotidien'],
    profile:['KŌMØ PULSE','Votre compte']
  };

  function patchBottomNav(){
    const nav=document.querySelector('#kamBottomBar');
    if(!nav||!patientMode())return;
    const labels={'patient:home':'Accueil','patient:results':'Résultats','patient:path':'Trajectoire','patient:plan':'Suivi','more':'Plus'};
    nav.querySelectorAll('[data-kam-nav]').forEach(btn=>{
      const label=labels[btn.dataset.kamNav];
      if(!label)return;
      const span=btn.querySelector('span');
      if(span&&span.textContent!==label)span.textContent=label;
      btn.setAttribute('aria-label',label);
    });
  }

  function patchDesktopNav(){
    const nav=document.querySelector('#desktopNav');
    if(!nav||!patientMode())return;
    const labels={home:'Accueil',results:'Résultats',path:'Trajectoire',trajectory:'Trajectoire',documents:'Rendez-vous & dossier',agenda:'Rendez-vous & dossier',explore:'Explorer'};
    nav.querySelectorAll('[data-route]').forEach(btn=>{
      const label=labels[btn.dataset.route];
      if(!label)return;
      const span=btn.querySelector('span');
      if(span&&span.textContent!==label)span.textContent=label;
      btn.setAttribute('aria-label',label);
    });
  }

  function patchHead(){
    const r=route(),copy=TITLES[r];
    if(!copy||!patientMode())return;
    if(r==='home'&&document.body.classList.contains('khome-final-v1'))return;
    if(r==='results'&&document.body.classList.contains('kresults-v1'))return;
    const eyebrow=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');
    if(eyebrow)eyebrow.textContent=copy[0];
    if(title)title.textContent=copy[1];
  }

  function refresh(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{patchBottomNav();patchDesktopNav();patchHead()})}
  ['hashchange','pageshow','komo:route-ready','komo:session-ready','komo:data-ready','resize'].forEach(e=>window.addEventListener(e,refresh));
  function boot(){refresh();setTimeout(refresh,250);setTimeout(refresh,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.KomoPatientV1Clarity={version:'1.0.1',refresh};
})();
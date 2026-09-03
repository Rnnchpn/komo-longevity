import './komo-assistant-shell-v2.js';
import './patient-mobile-v1.js';

const VERSION='7.0.0';
let timer=0;

const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';

function homeMarkup(){
  return `<section class="kh7" data-khome-v7 data-khome-v6 aria-label="KŌMØ Pulse Home">
    <div class="kh7-brand" aria-hidden="true"><span>KŌMØ</span><small>PULSE</small></div>
    <div class="kh7-hero">
      <p class="kh7-kicker">LONGEVITY IN MOTION</p>
      <h2>Votre KŌMØ.<br><em>Simplement.</em></h2>
      <p class="kh7-lead">Résultats, données Connected, consultations et espace personnel sont réunis dans Pulse.</p>
    </div>
    <nav class="kh7-actions" aria-label="Accès rapides KŌMØ Pulse">
      <a href="#results" data-kh7-route="results"><span><small>01</small><strong>Résultats</strong><em>Vos mesures et leur évolution</em></span><b aria-hidden="true">→</b></a>
      <a href="#key" data-kh7-route="key"><span><small>02</small><strong>Connected</strong><em>Votre quotidien connecté</em></span><b aria-hidden="true">→</b></a>
      <a href="#documents" data-kh7-route="documents"><span><small>03</small><strong>Consultations & rendez-vous</strong><em>Votre agenda KŌMØ</em></span><b aria-hidden="true">→</b></a>
      <a href="#mykomo" data-kh7-route="mykomo"><span><small>04</small><strong>My KŌMØ</strong><em>Votre espace personnel</em></span><b aria-hidden="true">→</b></a>
    </nav>
    <p class="kh7-foot">Measure → Understand → Act → Live</p>
  </section>`;
}

function tuneChrome(){
  const home=route()==='home';
  document.body.classList.toggle('khome-final-v1',home);
  document.body.classList.toggle('khome-direction-v7',home);
  if(!home)return;
  const eyebrow=document.querySelector('#pageEyebrow');
  const title=document.querySelector('#pageTitle');
  if(eyebrow)eyebrow.textContent='';
  if(title)title.textContent='';
}

function render(){
  if(route()!=='home')return;
  const host=document.querySelector('[data-my-komo-home]');
  if(!host)return;
  tuneChrome();
  if(!host.querySelector('[data-khome-v7]'))host.innerHTML=homeMarkup();
  host.dataset.khomeOwner='patient-home-command-v1@7';
  requestAnimationFrame(()=>window.KomoAssistantV2?.refresh?.());
  window.dispatchEvent(new CustomEvent('komo:home-command-rendered',{detail:{version:VERSION,dataFree:true}}));
}

function schedule(ms=0){clearTimeout(timer);timer=setTimeout(render,ms)}

document.addEventListener('click',event=>{
  const link=event.target.closest?.('[data-kh7-route]');
  if(!link)return;
  const target=link.getAttribute('data-kh7-route');
  if(!target||!window.KomoPatientNavigation?.go)return;
  event.preventDefault();
  window.KomoPatientNavigation.go(target);
},true);

['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:session-ready'].forEach(name=>window.addEventListener(name,()=>{
  tuneChrome();
  schedule(20);
}));

function boot(){tuneChrome();schedule(0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(0)};

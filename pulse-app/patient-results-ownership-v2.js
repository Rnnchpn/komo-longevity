/* KŌMØ Pulse — patient Results ownership guard V2
   Makes the current patient Results journey the only visible #results owner.
   Legacy canonical snippets remain available for Home/Profile/Documents only. */
(() => {
  'use strict';
  const VERSION='2.0.0';
  let timers=[];
  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'').split('?')[0]||'home';
  const clear=()=>{timers.forEach(clearTimeout);timers=[]};
  function cleanup(){
    const r=route();
    const root=document.querySelector('#viewRoot');
    const patientResults=r==='results';
    document.body.classList.toggle('kresults-v1',patientResults);
    if(!root)return;
    root.querySelectorAll('[data-kcanon-detail],.kcanon-detail').forEach(node=>node.remove());
    if(patientResults)window.KomoPatientResultsV1?.refresh?.();
  }
  function schedule(){
    clear();
    cleanup();
    [80,260,650,1300].forEach(ms=>timers.push(setTimeout(cleanup,ms)));
  }
  if(!document.querySelector('#patientResultsOwnerV2Style')){
    const s=document.createElement('style');s.id='patientResultsOwnerV2Style';
    s.textContent=`body.kresults-v1 #viewRoot>[data-kcanon-detail],body.kresults-v1 #viewRoot>.kcanon-detail{display:none!important}`;
    document.head.appendChild(s);
  }
  ['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:session-ready'].forEach(name=>window.addEventListener(name,schedule));
  document.addEventListener('DOMContentLoaded',schedule,{once:true});
  if(document.readyState!=='loading')schedule();
  window.KomoPatientResultsOwnershipV2={version:VERSION,refresh:schedule};
})();
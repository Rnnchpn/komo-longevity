/* KŌMØ Pulse — Agenda clean-room guard v1
   On #documents, Agenda v4 stays visible while legacy Motion/document cards remain mounted but hidden. */
(() => {
  'use strict';
  const VERSION='1.0.0';
  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
  const HIDE='[data-kmj1],[data-kcanon-doc],[data-kph2],[data-kar1],[data-kph]';
  let obs=null;

  function installStyle(){
    if(document.querySelector('#agendaCleanRoomStyle'))return;
    const s=document.createElement('style');
    s.id='agendaCleanRoomStyle';
    s.textContent=`body.agenda-v4 #viewRoot > [data-kmj1],body.agenda-v4 #viewRoot > [data-kcanon-doc],body.agenda-v4 #viewRoot > [data-kph2],body.agenda-v4 #viewRoot > [data-kar1],body.agenda-v4 #viewRoot > [data-kph]{display:none!important}`;
    document.head.appendChild(s);
  }

  function enforce(){
    if(route()!=='documents')return;
    installStyle();
    document.body.classList.remove('agenda-v3','agenda-v5');
    document.body.classList.add('agenda-v4');
    document.querySelectorAll(HIDE).forEach(el=>{if(el.closest('#viewRoot'))el.hidden=true});
    const pe=document.querySelector('#pageEyebrow'),pt=document.querySelector('#pageTitle');
    if(pe)pe.textContent='KŌMØ PULSE · AGENDA';
    if(pt)pt.textContent='Organiser la suite, simplement.';
  }

  function watch(){
    const root=document.querySelector('#viewRoot');
    if(!root||obs)return;
    obs=new MutationObserver(()=>{if(route()==='documents')queueMicrotask(enforce)});
    obs.observe(root,{childList:true,subtree:true});
  }

  ['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:motion-journey-ready'].forEach(e=>window.addEventListener(e,()=>setTimeout(()=>{watch();enforce()},20)));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{watch();enforce()},80));
  setTimeout(()=>{watch();enforce()},900);
  window.KomoAgendaCleanRoom={version:VERSION,enforce};
})();

/* KŌMØ Pulse — RC1 functional safety layer
   Narrow, deterministic fixes only. No visual ownership, no score ownership. */
(() => {
  'use strict';
  const VERSION='1.0.0';
  const ALLOWED=new Set(['home','motion','mykomo','club','key','results','trajectory','documents','profile','messages','clinical','admin']);
  const BOOKING_SERVICE_KEY='komo_agenda_service_v4';
  const BOOKING_SESSION_KEY='komo_home_booking_service';
  const FOCUS_BOOKING_KEY='komo_rc1_focus_booking';
  let auditTimer=0;

  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
  const go=(target)=>{
    const next=target==='tests'?'results':target;
    if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go(next);
    else location.hash=next;
  };

  function own(event,target){
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    go(target);
  }

  function prepareBooking(service='motion'){
    try{
      localStorage.setItem(BOOKING_SERVICE_KEY,service);
      sessionStorage.setItem(BOOKING_SESSION_KEY,service);
      sessionStorage.setItem(FOCUS_BOOKING_KEY,'1');
    }catch{}
  }

  function installRouteScope(){
    document.documentElement.dataset.komoRc1Route=route();
  }

  function focusBooking(){
    if(route()!=='documents')return;
    let wanted=false;
    try{wanted=sessionStorage.getItem(FOCUS_BOOKING_KEY)==='1'}catch{}
    if(!wanted)return;
    const target=document.querySelector('[data-ag4-section="booking"]');
    if(!target)return;
    try{sessionStorage.removeItem(FOCUS_BOOKING_KEY)}catch{}
    requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'start'}));
  }

  function scopePatientReport(){
    const visible=['results','profile'].includes(route());
    document.querySelectorAll('[data-krpatient]').forEach(el=>{el.hidden=!visible});
  }

  function normalizeAgendaState(){
    if(route()!=='documents')return;
    let desired='';
    try{desired=localStorage.getItem(BOOKING_SERVICE_KEY)||sessionStorage.getItem(BOOKING_SESSION_KEY)||''}catch{}
    if(!['motion','clinical'].includes(desired))return;
    const active=document.querySelector(`[data-ag4-service="${desired}"]`);
    if(active&&!active.disabled&&!active.classList.contains('active'))active.click();
  }

  function repairNavigationApi(){
    const nav=window.KomoPatientNavigation;
    if(!nav||nav.__rc1Functional)return;
    const originalGo=typeof nav.go==='function'?nav.go.bind(nav):null;
    const originalCanonical=typeof nav.canonical==='function'?nav.canonical.bind(nav):x=>x;
    const originalPatientRoute=typeof nav.isPatientRoute==='function'?nav.isPatientRoute.bind(nav):()=>false;
    nav.go=(target,options)=>originalGo?originalGo(target==='tests'?'results':target,options):void(location.hash=target==='tests'?'results':target);
    nav.canonical=(target)=>target==='tests'?'results':originalCanonical(target);
    nav.isPatientRoute=(target)=>target==='key'||target==='tests'||originalPatientRoute(target);
    nav.__rc1Functional=true;
  }

  function capture(event){
    const t=event.target?.closest?.('button,a');
    if(!t)return;

    if(t.matches('[data-kts-action="score"]'))return own(event,'results');
    if(t.matches('[data-kts-action="prep-motion"]'))return own(event,'motion');
    if(t.matches('[data-kts-action="book-motion"]')){
      prepareBooking('motion');
      return own(event,'documents');
    }

    if(t.matches('[data-kcanon-home] [data-route="path"], [data-kcanon-account] [data-route="path"], [data-kcanon-doc] [data-route="path"]')){
      return own(event,'results');
    }

    const direct=t.getAttribute('data-route');
    if(direct==='tests')return own(event,'results');
  }

  function knownAction(button){
    if(button.disabled)return true;
    if(button.type==='submit'&&button.closest('form'))return true;
    if(button.closest('a[href]'))return true;
    if(button.onclick)return true;
    const names=button.getAttributeNames().filter(n=>n.startsWith('data-'));
    if(names.some(n=>[
      'data-route','data-kp6-route','data-kh-go','data-kmv3-route','data-kmv3-open','data-kmv3-close','data-kmv3-chapter','data-kmv3-draft','data-kmv3-finish',
      'data-kts-action','data-ag4-route','data-ag4-scroll','data-ag4-service','data-ag4-slot','data-ag4-cancel','data-ag4-filter','data-ag4-place',
      'data-komo-export-report','data-krpatient-download','data-krpatient-results','data-mkv5-route','data-mkv5-challenge','data-mkv5-save',
      'data-open-test','data-close-test','data-kqe-open','data-kph2-motion','data-kph2-clinical','data-kph2-next'
    ].includes(n)))return true;
    if(button.id&&['refreshButton','accountButton','logoutButton','loginButton','signupButton','forgotPasswordButton','togglePassword','kpvChangeEmail','kpvResetPassword'].includes(button.id))return true;
    return false;
  }

  function audit(){
    installRouteScope();
    repairNavigationApi();
    scopePatientReport();
    focusBooking();
    const root=document.querySelector('#appShell');
    if(!root||root.hidden)return {route:route(),buttons:0,unknown:[]};
    const buttons=[...root.querySelectorAll('button')].filter(b=>b.offsetParent!==null);
    const unknown=buttons.filter(b=>!knownAction(b)).map(b=>({text:(b.textContent||'').replace(/\s+/g,' ').trim().slice(0,80),id:b.id||'',classes:b.className||''}));
    if(unknown.length)console.warn('[pulse-functional-rc1] visible buttons without recognized action contract',unknown);
    return {route:route(),buttons:buttons.length,unknown};
  }

  function schedule(ms=80){
    clearTimeout(auditTimer);
    auditTimer=setTimeout(()=>{
      repairNavigationApi();
      installRouteScope();
      scopePatientReport();
      normalizeAgendaState();
      focusBooking();
      audit();
    },ms);
  }

  document.addEventListener('click',capture,true);
  ['hashchange','pageshow','komo:canonical-route','komo:route-ready','komo:data-ready','komo:session-ready','komo:appointment-updated'].forEach(name=>window.addEventListener(name,()=>schedule(70)));
  document.addEventListener('DOMContentLoaded',()=>schedule(350));
  const root=document.querySelector('#viewRoot');
  if(root)new MutationObserver(()=>schedule(40)).observe(root,{childList:true,subtree:true});
  setTimeout(()=>schedule(0),1100);

  window.KomoFunctionalRC1={version:VERSION,audit,go,prepareBooking,refresh:()=>schedule(0)};
})();
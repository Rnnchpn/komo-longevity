/* KŌMØ Pulse — canonical patient navigation core v1
   Single patient route coordinator. Keeps legacy surfaces visually silent,
   normalizes old route aliases, scrolls once, and exposes one go() API. */
(() => {
  'use strict';
  const V='1.0.0';
  const ALIAS={path:'trajectory',plan:'trajectory',agenda:'documents',rdv:'documents'};
  const PATIENT_ROUTES=new Set(['home','motion','mykomo','trajectory','documents','profile','messages','results','tests']);
  let current='';
  let seq=0;

  const rawRoute=()=>location.hash.replace(/^#/,'')||'home';
  const canonical=r=>ALIAS[r]||r||'home';
  const patientRoute=r=>PATIENT_ROUTES.has(canonical(r));

  function installCss(){
    if(document.querySelector('#kpNavCoreStyle'))return;
    const s=document.createElement('style');s.id='kpNavCoreStyle';s.textContent=`
      html[data-kp-nav-mode="patient"] .sidebar,
      html[data-kp-nav-mode="patient"] #mobileNav,
      html[data-kp-nav-mode="patient"] #kamBottomBar,
      html[data-kp-nav-mode="patient"] #proMobileNav{display:none!important}
      html[data-kp-nav-mode="patient"] .main-shell{margin-left:0!important;padding-bottom:104px!important}
      html[data-kp-nav-mode="patient"] body{overscroll-behavior-y:none}
      html.kp-route-changing #viewRoot{pointer-events:none}
      @media(max-width:760px){html[data-kp-nav-mode="patient"] .main-shell{padding-bottom:92px!important}}
    `;document.head.appendChild(s);
  }

  function setMode(){
    const r=canonical(rawRoute());
    const m=(r==='clinical'||r==='admin')?'work':'patient';
    document.documentElement.dataset.kpNavMode=m;
    return m;
  }

  function resetScroll(){
    try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(_){window.scrollTo(0,0)}
    const nodes=[document.scrollingElement,document.documentElement,document.body,document.querySelector('.main-shell'),document.querySelector('#viewRoot')];
    nodes.forEach(n=>{if(n)try{n.scrollTop=0;n.scrollLeft=0}catch(_){}});
  }

  function announce(route,token){
    if(token!==seq)return;
    current=route;
    resetScroll();
    document.documentElement.classList.remove('kp-route-changing');
    window.dispatchEvent(new CustomEvent('komo:canonical-route',{detail:{route,version:V}}));
  }

  function settle(route){
    const token=++seq;
    document.documentElement.classList.add('kp-route-changing');
    resetScroll();
    requestAnimationFrame(()=>requestAnimationFrame(()=>announce(route,token)));
  }

  function normalizeHash(){
    const raw=rawRoute(),next=canonical(raw);
    setMode();
    if(raw!==next){
      history.replaceState(null,'',`${location.pathname}${location.search}#${next}`);
      settle(next);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      return next;
    }
    settle(next);
    return next;
  }

  function go(target,{replace=false}={}){
    const next=canonical(target);
    if(!next)return;
    document.querySelector('#modeSwitch [data-mode="member"]')?.click();
    document.documentElement.dataset.kpNavMode='patient';
    document.documentElement.classList.add('kp-route-changing');
    resetScroll();
    if(canonical(rawRoute())===next){
      settle(next);
      window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:next,source:'canonical-nav'}}));
      return;
    }
    if(replace)history.replaceState(null,'',`${location.pathname}${location.search}#${next}`);
    else location.hash=next;
  }

  installCss();
  setMode();
  if(ALIAS[rawRoute()]) queueMicrotask(normalizeHash);

  window.addEventListener('hashchange',()=>{
    const raw=rawRoute(),next=canonical(raw);
    setMode();
    if(raw!==next){history.replaceState(null,'',`${location.pathname}${location.search}#${next}`)}
    settle(next);
  },true);
  window.addEventListener('pageshow',()=>{setMode();settle(canonical(rawRoute()))});
  window.addEventListener('popstate',()=>{setMode();settle(canonical(rawRoute()))});

  window.KomoPatientNavigation={version:V,go,route:()=>canonical(rawRoute()),resetScroll,canonical,isPatientRoute:patientRoute};
})();
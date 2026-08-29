/* KŌMØ Pulse — iPhone app lock runtime v1 */
(() => {
  'use strict';

  const PHONE='(max-width: 767px)';
  const IOS=/iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1 && innerWidth<768);
  let lastTouchEnd=0;
  let resizeTimer=0;

  const active=()=>IOS && window.matchMedia(PHONE).matches;

  function viewportMeta(){
    let meta=document.querySelector('meta[name="viewport"]');
    if(!meta){
      meta=document.createElement('meta');
      meta.name='viewport';
      document.head.prepend(meta);
    }
    meta.setAttribute('content','width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content');
  }

  function syncViewport(){
    if(!active())return;
    const h=Math.round(window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0);
    if(h>0)document.documentElement.style.setProperty('--kamo-viewport-height',`${h}px`);
  }

  function syncClass(){
    document.documentElement.classList.toggle('kamo-iphone-locked',active());
    if(active()){
      viewportMeta();
      syncViewport();
      document.scrollingElement?.scrollTo?.(0,0);
    }
  }

  function blockGesture(event){
    if(!active())return;
    event.preventDefault();
  }

  function blockMultiTouch(event){
    if(!active() || event.touches.length<2)return;
    event.preventDefault();
  }

  function blockDoubleTap(event){
    if(!active())return;
    const now=Date.now();
    const interactive=event.target.closest?.('input,textarea,select,[contenteditable="true"]');
    if(!interactive && now-lastTouchEnd<=300)event.preventDefault();
    lastTouchEnd=now;
  }

  function schedule(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{syncClass();syncViewport()},16);
  }

  ['gesturestart','gesturechange','gestureend'].forEach(name=>document.addEventListener(name,blockGesture,{passive:false,capture:true}));
  document.addEventListener('touchmove',blockMultiTouch,{passive:false,capture:true});
  document.addEventListener('touchend',blockDoubleTap,{passive:false,capture:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(schedule,80),{passive:true});
  window.visualViewport?.addEventListener('resize',schedule,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncViewport,{passive:true});
  window.addEventListener('pageshow',schedule,{passive:true});
  document.addEventListener('DOMContentLoaded',syncClass,{once:true});

  if(document.readyState!=='loading')syncClass();
  setTimeout(syncClass,180);
  setTimeout(syncClass,700);
})();

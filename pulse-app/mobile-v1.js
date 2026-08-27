/* KŌMØ Pulse — mobile utility runtime
   Navigation is owned by adaptive-shell-v4. This module only keeps viewport state
   and the contextual test CTA; it never mutates menus or the account shell. */

const MOBILE_MAX = 767;
let mobileCta = null;
let viewObserver = null;
let scheduled = 0;

function isMobile(){ return window.matchMedia(`(max-width:${MOBILE_MAX}px)`).matches; }
function currentRoute(){ return location.hash.replace(/^#/,'') || 'home'; }

function ensureMobileCta(){
  if (mobileCta?.isConnected) return mobileCta;
  mobileCta = document.querySelector('.mobile-test-cta');
  if (mobileCta) return mobileCta;
  mobileCta = document.createElement('button');
  mobileCta.type = 'button';
  mobileCta.className = 'mobile-test-cta';
  mobileCta.hidden = true;
  mobileCta.innerHTML = '<span>Continuer mes tests</span><span aria-hidden="true">→</span>';
  mobileCta.addEventListener('click', () => {
    const root = document.querySelector('.tests-v1-root');
    const source = root?.querySelector('.tests-v1-hero-actions [data-open-test]:not(:disabled)') || root?.querySelector('[data-open-test]:not(:disabled)');
    source?.click();
  });
  document.body.appendChild(mobileCta);
  return mobileCta;
}

function updateMobileCta(){
  const cta = ensureMobileCta();
  const dialogOpen = Boolean(document.querySelector('#pulseTestDialog[open]'));
  const tests = document.querySelector('.tests-v1-root');
  const show = isMobile() && currentRoute() === 'results' && Boolean(tests) && !dialogOpen;
  cta.hidden = !show;
  if (!show) return;
  const source = tests.querySelector('.tests-v1-hero-actions [data-open-test]:not(:disabled)') || tests.querySelector('[data-open-test]:not(:disabled)');
  const label = source?.textContent?.replace(/→/g,'').trim();
  cta.querySelector('span:first-child').textContent = label || 'Continuer mes tests';
}

function refresh(){
  cancelAnimationFrame(scheduled);
  scheduled = requestAnimationFrame(() => {
    document.documentElement.dataset.pulseViewport = isMobile() ? 'mobile' : (window.matchMedia('(max-width:1100px)').matches ? 'tablet' : 'desktop');
    updateMobileCta();
  });
}

function observeView(){
  const root = document.querySelector('#viewRoot');
  if (!root || viewObserver) return;
  viewObserver = new MutationObserver(refresh);
  viewObserver.observe(root,{childList:true,subtree:true});
}

['hashchange','resize','orientationchange','komo:route-ready','komo:data-ready','komo:session-ready'].forEach(name=>window.addEventListener(name,refresh,{passive:name==='resize'}));
document.addEventListener('click',event=>{
  if(event.target.closest?.('[data-open-test],.pulse-test-close,.test-form-actions')) setTimeout(refresh,0);
},true);
document.addEventListener('DOMContentLoaded',()=>{observeView();setTimeout(refresh,180)});
observeView();
setTimeout(refresh,600);

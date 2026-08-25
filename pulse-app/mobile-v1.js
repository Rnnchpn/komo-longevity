/* KŌMØ Pulse — mobile behavior v1 */

const MOBILE_MAX = 767;
let mobileCta = null;

function isMobile(){ return window.matchMedia(`(max-width:${MOBILE_MAX}px)`).matches; }

function currentRoute(){ return location.hash.replace(/^#/,'') || 'home'; }

function ensureExplorerInAccount(){
  const popover = document.querySelector('#accountPopover');
  if (!popover || popover.querySelector('[data-mobile-explorer]')) return;
  const profile = popover.querySelector('[data-route="profile"]');
  const link = document.createElement('a');
  link.href = '#explore';
  link.dataset.route = 'explore';
  link.dataset.mobileExplorer = '1';
  link.textContent = 'Explorer';
  if (profile?.nextSibling) popover.insertBefore(link, profile.nextSibling);
  else popover.appendChild(link);
}

function ensureMobileCta(){
  if (mobileCta) return mobileCta;
  mobileCta = document.createElement('button');
  mobileCta.type = 'button';
  mobileCta.className = 'mobile-test-cta';
  mobileCta.hidden = true;
  mobileCta.innerHTML = '<span>Continuer mes tests</span><span aria-hidden="true">→</span>';
  mobileCta.addEventListener('click', () => {
    const root = document.querySelector('.tests-v1-root');
    const source = root?.querySelector('.tests-v1-hero-actions [data-open-test]:not(:disabled)') || root?.querySelector('[data-open-test]:not(:disabled)');
    if (source) source.click();
  });
  document.body.appendChild(mobileCta);
  return mobileCta;
}

function updateMobileCta(){
  const cta = ensureMobileCta();
  const dialogOpen = Boolean(document.querySelector('#pulseTestDialog[open]'));
  const show = isMobile() && currentRoute() === 'results' && Boolean(document.querySelector('.tests-v1-root')) && !dialogOpen;
  cta.hidden = !show;
  if (!show) return;
  const source = document.querySelector('.tests-v1-hero-actions [data-open-test]:not(:disabled)') || document.querySelector('.tests-v1-root [data-open-test]:not(:disabled)');
  const label = source?.textContent?.replace(/→/g,'').trim();
  cta.querySelector('span:first-child').textContent = label || 'Continuer mes tests';
}

function setMobileViewportState(){
  document.documentElement.dataset.pulseViewport = isMobile() ? 'mobile' : (window.matchMedia('(max-width:1100px)').matches ? 'tablet' : 'desktop');
  ensureExplorerInAccount();
  updateMobileCta();
}

const observer = new MutationObserver(() => requestAnimationFrame(setMobileViewportState));
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','open','class']});

window.addEventListener('resize',setMobileViewportState,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(setMobileViewportState,120));
window.addEventListener('hashchange',()=>setTimeout(setMobileViewportState,80));
document.addEventListener('DOMContentLoaded',()=>setTimeout(setMobileViewportState,200));
setTimeout(setMobileViewportState,600);

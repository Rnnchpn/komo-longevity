/* KŌMØ Pulse — restore persistent Account / Settings access v1
   Patient navigation only: account remains a first-class destination on desktop, phone and iPad. */
(() => {
  'use strict';
  const V='1.2.0';
  let raf=0;
  const accountIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="3.25"/><path d="M5.5 20c.55-4.15 2.7-6.15 6.5-6.15s5.95 2 6.5 6.15"/><path d="M18.2 5.7l.9-.9M5.8 5.7l-.9-.9"/></svg>';

  function route(){return window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home'}
  function patientSurface(){return !['clinical','admin'].includes(route())}

  function patchAdaptive(){
    if(!patientSurface()) return;
    const bar=document.querySelector('#kamBottomBar');
    if(bar){
      const more=bar.querySelector('[data-kam-nav="more"]');
      if(more){
        more.dataset.kamNav='patient:profile';
        more.setAttribute('aria-label','Compte');
        more.innerHTML=`${accountIcon}<span>Compte</span>`;
      }
      const account=bar.querySelector('[data-kam-nav="patient:profile"]');
      if(account){
        const active=route()==='profile';
        if(active) bar.querySelectorAll('.kam-nav-item').forEach(x=>x.classList.remove('active'));
        account.classList.toggle('active',active);
      }
    }
    const sheet=document.querySelector('#kamSheet');
    const link=sheet?.querySelector('[data-kam-action="patient:profile"]');
    if(link && !link.dataset.accountLabel){link.innerHTML='Compte & paramètres <span>→</span>';link.dataset.accountLabel='1'}
  }

  function patchDesktop(){
    if(!patientSurface()) return;
    const dock=document.querySelector('#kpDockV6');
    if(!dock) return false;
    let account=dock.querySelector('[data-kp6="account"]');
    if(!account){
      account=document.createElement('a');
      account.href='#profile';
      account.dataset.kp6='account';
      account.dataset.kp6Route='profile';
      account.setAttribute('aria-label','Compte & paramètres');
      account.innerHTML=`<span class="kp6-icon" style="display:grid;place-items:center;width:18px;height:18px">${accountIcon}</span><b>Compte</b>`;
      dock.appendChild(account);
    }
    if(dock.dataset.accountColumns!=='1'){dock.style.gridTemplateColumns='repeat(7,minmax(0,1fr))';dock.dataset.accountColumns='1'}
    const active=route()==='profile';
    if(active){
      dock.querySelectorAll('[data-kp6]').forEach(x=>x.classList.remove('active'));
      account.classList.add('active');
      const indicator=dock.querySelector('.kp6-indicator');
      if(indicator){
        const pad=parseFloat(getComputedStyle(dock).paddingLeft)||0;
        indicator.style.width=`${account.offsetWidth}px`;
        indicator.style.transform=`translateX(${Math.max(0,account.offsetLeft-pad)}px)`;
      }
    } else account.classList.remove('active');
    return true;
  }

  function patchAccountPage(){
    if(route()!=='profile') return;
    const title=document.querySelector('#pageTitle');
    if(title && !/compte/i.test(title.textContent||'')) title.textContent='Mon compte & paramètres';
  }

  function refresh(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{patchAdaptive();patchDesktop();patchAccountPage()});
  }

  // Navigation owners emit lifecycle events; no persistent MutationObserver is
  // needed. A few bounded startup retries cover dock creation order.
  ['hashchange','pageshow','resize','orientationchange','komo:route-ready','komo:canonical-route','komo:session-ready','komo:data-ready'].forEach(evt=>window.addEventListener(evt,()=>setTimeout(refresh,16),{passive:true}));
  document.addEventListener('DOMContentLoaded',()=>{[120,320,700].forEach(ms=>setTimeout(refresh,ms))},{once:true});
  if(document.readyState!=='loading')[0,220,600].forEach(ms=>setTimeout(refresh,ms));
  window.KomoAccountTab={version:V,refresh};
})();

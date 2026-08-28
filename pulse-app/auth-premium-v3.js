/* KŌMØ Pulse — premium authentication motion v3 */
(() => {
  'use strict';
  const screen=()=>document.querySelector('#authScreen');
  let raf=0;

  function bars(){
    return Array.from({length:34},()=>'<i></i>').join('');
  }

  function mount(){
    const auth=screen();
    if(!auth||auth.dataset.authPremiumV3==='1')return;
    auth.dataset.authPremiumV3='1';

    const brand=auth.querySelector('.auth-brand');
    const panel=auth.querySelector('.auth-panel');
    if(brand&&!brand.querySelector('[data-auth-signal]')){
      const signal=document.createElement('div');
      signal.className='auth-signal';
      signal.dataset.authSignal='1';
      signal.setAttribute('aria-hidden','true');
      signal.innerHTML=`<div class="auth-signal-head"><span>Movement signal</span><span class="auth-live"><i></i>Live</span></div><div class="auth-wave">${bars()}</div><div class="auth-signal-foot"><span>Motion</span><span>Clinical</span><span>Club</span></div>`;
      brand.appendChild(signal);
    }
    if(panel&&!panel.querySelector('[data-auth-security]')){
      const row=document.createElement('div');
      row.className='auth-security-row';
      row.dataset.authSecurity='1';
      row.innerHTML='<i aria-hidden="true"></i><span>Espace personnel KŌMØ · accès privé</span>';
      panel.appendChild(row);
    }

    auth.addEventListener('pointermove',onMove,{passive:true});
    auth.addEventListener('pointerleave',reset,{passive:true});
  }

  function onMove(e){
    const auth=screen();
    if(!auth||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const r=auth.getBoundingClientRect();
    const x=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
    const y=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      auth.style.setProperty('--auth-mx',x.toFixed(3));
      auth.style.setProperty('--auth-my',y.toFixed(3));
    });
  }
  function reset(){
    const auth=screen();if(!auth)return;
    auth.style.setProperty('--auth-mx','0');
    auth.style.setProperty('--auth-my','0');
  }

  const schedule=()=>setTimeout(mount,80);
  document.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('pageshow',schedule);
  setTimeout(mount,500);
})();

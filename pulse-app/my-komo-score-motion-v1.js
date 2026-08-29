/* KŌMØ Pulse — My KŌMØ score motion v1 */
(() => {
  'use strict';
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let timer=0;

  function animateRing(ring,index=0){
    if(ring.dataset.komoAnimated==='1')return;
    const target=Math.max(0,Math.min(100,Number.parseFloat(getComputedStyle(ring).getPropertyValue('--value'))||0));
    const strong=ring.querySelector('strong');
    const hasScore=strong&&!strong.textContent.trim().startsWith('—');
    ring.dataset.komoAnimated='1';
    if(reduced()){
      ring.style.setProperty('--komo-ring-value',target);
      return;
    }
    ring.style.setProperty('--komo-ring-value',0);
    ring.classList.add('is-animating');
    const duration=900+index*110;
    const delay=90+index*110;
    setTimeout(()=>{
      const start=performance.now();
      const tick=now=>{
        const t=Math.min(1,(now-start)/duration);
        const eased=1-Math.pow(1-t,3);
        const value=target*eased;
        ring.style.setProperty('--komo-ring-value',value.toFixed(2));
        if(hasScore){
          const small=strong.querySelector('small');
          const suffix=small?small.outerHTML:'';
          strong.innerHTML=`${Math.round(value)}${suffix}`;
        }
        if(t<1)requestAnimationFrame(tick);
        else{
          ring.style.setProperty('--komo-ring-value',target);
          ring.classList.remove('is-animating');
        }
      };
      requestAnimationFrame(tick);
    },delay);
  }

  function mount(){
    const host=document.querySelector('.mykomo-home');
    if(!host)return;
    [...host.querySelectorAll('.mykomo-ring')].forEach(animateRing);
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(mount,80)}
  ['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:session-ready'].forEach(x=>window.addEventListener(x,schedule));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,500));
  new MutationObserver(()=>{if(document.querySelector('.mykomo-home .mykomo-ring:not([data-komo-animated="1"])'))schedule()}).observe(document.body,{childList:true,subtree:true});
  setTimeout(mount,1100);
})();

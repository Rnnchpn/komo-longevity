/* KŌMØ Pulse — My KŌMØ score motion v1.2 */
(() => {
  'use strict';
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let timer=0,observer=null,observedRoot=null;

  function scoreNode(strong){
    if(!strong)return null;
    let node=[...strong.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
    if(!node){node=document.createTextNode('');strong.insertBefore(node,strong.firstChild||null)}
    return node;
  }
  function writeScore(strong,value){const node=scoreNode(strong);if(node)node.nodeValue=String(Math.round(value))}
  function animateRing(ring,index=0){
    if(ring.dataset.komoAnimated==='1')return;
    const raw=Number.parseFloat(ring.style.getPropertyValue('--value')||getComputedStyle(ring).getPropertyValue('--value'));
    const target=Math.max(0,Math.min(100,Number.isFinite(raw)?raw:0));
    const strong=ring.querySelector('strong');
    const hasScore=!!strong&&!strong.textContent.trim().startsWith('—');
    ring.dataset.komoAnimated='1';
    if(reduced()){
      ring.style.setProperty('--komo-ring-value',target);
      if(hasScore)writeScore(strong,target);
      return;
    }
    ring.style.setProperty('--komo-ring-value',0);
    ring.classList.add('is-animating');
    const duration=900+index*110,delay=90+index*110;
    setTimeout(()=>{
      const start=performance.now();
      const tick=now=>{
        const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,3),value=target*eased;
        ring.style.setProperty('--komo-ring-value',value.toFixed(2));
        if(hasScore)writeScore(strong,value);
        if(t<1)requestAnimationFrame(tick);
        else{
          ring.style.setProperty('--komo-ring-value',target);
          if(hasScore)writeScore(strong,target);
          ring.classList.remove('is-animating');
        }
      };
      requestAnimationFrame(tick);
    },delay);
  }

  function guardVisible(){
    document.querySelectorAll('.mykomo-home .mykomo-ring').forEach(ring=>{
      const raw=Number.parseFloat(ring.style.getPropertyValue('--value')||getComputedStyle(ring).getPropertyValue('--value'));
      const strong=ring.querySelector('strong');
      if(Number.isFinite(raw)&&raw>0&&strong&&!strong.textContent.trim().startsWith('—')&&!ring.classList.contains('is-animating'))writeScore(strong,raw);
    });
  }
  function bindObserver(){
    const root=document.querySelector('#viewRoot');
    if(!root||root===observedRoot)return;
    observer?.disconnect();observedRoot=root;
    observer=new MutationObserver(()=>{
      if(root.querySelector('.mykomo-home .mykomo-ring:not([data-komo-animated="1"])'))schedule();
    });
    observer.observe(root,{childList:true,subtree:true});
  }
  function mount(){
    bindObserver();
    const host=document.querySelector('.mykomo-home');
    if(!host)return;
    [...host.querySelectorAll('.mykomo-ring')].forEach(animateRing);
    setTimeout(guardVisible,1250);
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(mount,70)}
  ['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:session-ready','komo:assessment-updated'].forEach(x=>window.addEventListener(x,schedule,{passive:true}));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,300),{once:true});
  setTimeout(mount,800);
})();

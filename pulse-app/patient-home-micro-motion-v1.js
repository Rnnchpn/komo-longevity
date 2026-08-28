/* KŌMØ Pulse — patient home micro motion v1
   Subtle product motion for the light data wall. No data ownership here. */
(() => {
  const VERSION='1.0.1';
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  let runId=0;

  const easeOutCubic=t=>1-Math.pow(1-t,3);
  const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
  const num=v=>{const raw=String(v??'').replace(/[^0-9.-]+/g,'');if(!raw||raw==='-'||raw==='.'||raw==='-.')return null;const n=Number(raw);return Number.isFinite(n)?n:null};

  function ensureStyle(){
    if(document.querySelector('#khomeMicroMotionStyle'))return;
    const s=document.createElement('style');
    s.id='khomeMicroMotionStyle';
    s.textContent=`
      body.khome-v3 .kdw-action,
      body.khome-v3 .kdw-card,
      body.khome-v3 .kdw-device{
        will-change:transform,opacity;
        transform:translateZ(0);
        backface-visibility:hidden;
      }
      body.khome-v3 .kdw-motion-enter{
        opacity:0;
        transform:translate3d(0,14px,0) scale(.988);
        filter:blur(1.5px);
      }
      body.khome-v3 .kdw-motion-enter.kdw-motion-in{
        opacity:1;
        transform:translate3d(0,0,0) scale(1);
        filter:blur(0);
        transition:opacity .62s cubic-bezier(.2,.78,.22,1),transform .72s cubic-bezier(.2,.78,.22,1),filter .55s ease;
      }
      body.khome-v3 .kdw-card{transition:transform .28s cubic-bezier(.2,.78,.22,1),box-shadow .28s ease,border-color .28s ease}
      body.khome-v3 .kdw-card:hover{transform:translateY(-3px);box-shadow:0 18px 44px rgba(35,48,39,.07);border-color:rgba(73,100,84,.13)}
      body.khome-v3 .kdw-card:after{content:"";position:absolute;inset:-35%;pointer-events:none;background:linear-gradient(115deg,transparent 38%,rgba(255,255,255,.55) 49%,transparent 60%);transform:translateX(-58%) rotate(5deg);opacity:0;transition:transform .7s ease,opacity .28s ease}
      body.khome-v3 .kdw-card:hover:after{transform:translateX(55%) rotate(5deg);opacity:.42}
      body.khome-v3 .kdw-action:active,body.khome-v3 .kdw-device:active{transform:scale(.985)!important;transition-duration:.08s!important}
      body.khome-v3 .kdw-action-arrow{transition:transform .24s ease,opacity .24s ease}
      body.khome-v3 .kdw-action:hover .kdw-action-arrow{transform:translateX(3px);opacity:.86}
      body.khome-v3 .kdw-action-icon,body.khome-v3 .kdw-device-logo{transition:transform .32s cubic-bezier(.2,.78,.22,1),box-shadow .32s ease}
      body.khome-v3 .kdw-action:hover .kdw-action-icon,body.khome-v3 .kdw-device:hover .kdw-device-logo{transform:translateY(-1px) scale(1.045);box-shadow:0 7px 18px rgba(35,48,39,.08)}
      body.khome-v3 .kdw-ring{transition:filter .35s ease;filter:drop-shadow(0 8px 20px rgba(73,100,84,.06))}
      body.khome-v3 .kdw-score:hover .kdw-ring{filter:drop-shadow(0 12px 24px rgba(73,100,84,.13))}
      body.khome-v3 .kdw-ring-core strong,body.khome-v3 .kdw-age-main strong,body.khome-v3 .kdw-today-value strong,body.khome-v3 .kdw-exp-core strong{font-variant-numeric:tabular-nums;will-change:contents}
      body.khome-v3 .kdw-age-orbit{animation:kdwOrbitBreathe 8s ease-in-out infinite;transform-origin:center}
      body.khome-v3 .kdw-age-tag{animation:kdwTagBreathe 5.5s ease-in-out infinite}
      body.khome-v3 .kdw-today-bar i{transform-origin:left center;will-change:width}
      body.khome-v3 .kdw-device em{position:relative;overflow:hidden}
      body.khome-v3 .kdw-device em:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);transform:translateX(-120%);animation:kdwStatusSweep 4.8s ease-in-out infinite}
      @keyframes kdwOrbitBreathe{0%,100%{transform:scale(1);opacity:.78}50%{transform:scale(1.055);opacity:1}}
      @keyframes kdwTagBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
      @keyframes kdwStatusSweep{0%,68%{transform:translateX(-120%)}85%,100%{transform:translateX(120%)}}
      @media(hover:none){body.khome-v3 .kdw-card:hover{transform:none;box-shadow:0 10px 32px rgba(35,48,39,.035)}body.khome-v3 .kdw-card:hover:after{opacity:0}}
      @media(prefers-reduced-motion:reduce){
        body.khome-v3 .kdw-motion-enter,body.khome-v3 .kdw-motion-enter.kdw-motion-in{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}
        body.khome-v3 .kdw-age-orbit,body.khome-v3 .kdw-age-tag,body.khome-v3 .kdw-device em:after{animation:none!important}
        body.khome-v3 .kdw-card,body.khome-v3 .kdw-action,body.khome-v3 .kdw-device,body.khome-v3 .kdw-action-arrow,body.khome-v3 .kdw-action-icon,body.khome-v3 .kdw-device-logo{transition:none!important}
      }
    `;
    document.head.appendChild(s);
  }

  function tween(from,to,duration,onUpdate,done){
    if(reduced()||duration<=0){onUpdate(to);done?.();return}
    const start=performance.now();
    function frame(now){
      const t=clamp((now-start)/duration,0,1);
      onUpdate(from+(to-from)*easeOutCubic(t));
      if(t<1)requestAnimationFrame(frame);else done?.();
    }
    requestAnimationFrame(frame);
  }

  function animateCustomProperty(el,name,target,duration=1050){
    if(!el||target===null)return;
    const to=clamp(target,0,100);
    el.style.setProperty(name,'0');
    tween(0,to,duration,v=>el.style.setProperty(name,String(v)));
  }

  function animateWidth(el,target,duration=920){
    if(!el||target===null)return;
    const to=clamp(target,0,100);
    el.style.width='0%';
    tween(0,to,duration,v=>el.style.width=`${v}%`);
  }

  function animateNumber(el,{duration=900,decimals=0}={}){
    if(!el)return;
    const target=num(el.textContent);
    if(target===null)return;
    const small=el.querySelector('small')?.outerHTML||'';
    const text=el.textContent||'';
    const hasPercent=text.includes('%')&&!small;
    const hasXP=/\bXP\b/i.test(text)&&!small;
    const hasYears=/\bans?\b/i.test(text)&&!small;
    const format=v=>{
      const value=decimals?Number(v).toFixed(decimals):String(Math.round(v));
      if(small)return `${value}${small}`;
      if(hasPercent)return `${value}%`;
      if(hasXP)return `${value} XP`;
      if(hasYears)return `${value} ans`;
      return value;
    };
    el.innerHTML=format(0);
    tween(0,target,duration,v=>{el.innerHTML=format(v)});
  }

  function reveal(root){
    const nodes=[...root.querySelectorAll('.kdw-action'),...root.querySelectorAll('.kdw-card'),...root.querySelectorAll('.kdw-device')];
    nodes.forEach((el,i)=>{
      el.classList.add('kdw-motion-enter');
      const delay=Math.min(520,i*55);
      setTimeout(()=>el.classList.add('kdw-motion-in'),delay+35);
    });
  }

  function animateMetrics(root){
    const ring=root.querySelector('.kdw-ring');
    const ringTarget=num(ring?.style?.getPropertyValue('--v'));
    animateCustomProperty(ring,'--v',ringTarget,1120);
    setTimeout(()=>animateNumber(root.querySelector('.kdw-ring-core strong'),{duration:930}),120);

    const exp=root.querySelector('.kdw-exp-dial');
    const expTarget=num(exp?.style?.getPropertyValue('--p'));
    setTimeout(()=>animateCustomProperty(exp,'--p',expTarget,920),220);
    setTimeout(()=>animateNumber(root.querySelector('.kdw-exp-core strong'),{duration:680}),280);

    const bar=root.querySelector('.kdw-today-bar i');
    if(bar){
      const parent=bar.parentElement;
      let pct=null;
      if(parent){const w=bar.getBoundingClientRect().width,pw=parent.getBoundingClientRect().width;if(pw>0)pct=w/pw*100}
      setTimeout(()=>animateWidth(bar,pct,880),260);
    }
    setTimeout(()=>animateNumber(root.querySelector('.kdw-today-value strong'),{duration:720}),310);
    setTimeout(()=>animateNumber(root.querySelector('.kdw-age-main strong'),{duration:880}),170);
  }

  function addPointerDepth(root){
    if(reduced()||matchMedia('(hover:none)').matches)return;
    root.querySelectorAll('.kdw-score,.kdw-age').forEach(card=>{
      if(card.dataset.kdwDepthBound)return;card.dataset.kdwDepthBound='1';
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(850px) rotateX(${(-y*1.5).toFixed(2)}deg) rotateY(${(x*1.8).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave',()=>{card.style.transform=''});
    });
  }

  function run(){
    if((location.hash.replace(/^#/,'')||'home')!=='home')return;
    ensureStyle();
    const root=document.querySelector('[data-kdw]');
    if(!root||root.dataset.microMotionVersion===VERSION)return;
    root.dataset.microMotionVersion=VERSION;
    const id=++runId;
    requestAnimationFrame(()=>{
      if(id!==runId)return;
      reveal(root);
      setTimeout(()=>animateMetrics(root),90);
      addPointerDepth(root);
    });
  }

  function schedule(){setTimeout(run,60);setTimeout(run,420)}
  window.addEventListener('hashchange',schedule);
  window.addEventListener('komo:route-ready',schedule);
  window.addEventListener('komo:data-ready',schedule);
  window.addEventListener('komo:canonical-result-ready',schedule);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(run,1450));
  new MutationObserver(()=>{if((location.hash.replace(/^#/,'')||'home')==='home')schedule()}).observe(document.body,{childList:true,subtree:true});
  setTimeout(run,1900);
  window.KomoHomeMicroMotion={version:VERSION,refresh:run};
})();

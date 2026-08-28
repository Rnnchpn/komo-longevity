/* KŌMØ Pulse — hero polish v2
   Larger product signature, simplified topbar, stronger KŌMØ Age and coordinated motion. */
(() => {
  const VERSION='2.0.0';
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  let timer=null;

  function ensureStyle(){
    if(document.querySelector('#kpulseHeroPolishV2Style'))return;
    const s=document.createElement('style');
    s.id='kpulseHeroPolishV2Style';
    s.textContent=`
      /* Remove redundant Motion shortcut from the topbar. Motion remains in nav + home cards. */
      .komo-motion-entry-top,[data-komo-motion-entry-top]{display:none!important}

      /* Stronger KŌMØ Pulse product signature */
      .kpulse-lockup{gap:12px!important;margin-bottom:10px!important;transform-origin:left center}
      .kpulse-wordmark{font:650 17px/1 Manrope,'DM Sans',sans-serif!important;letter-spacing:.185em!important;color:#203528!important}
      .kpulse-dot{width:6px!important;height:6px!important;background:#8ca18f!important;box-shadow:0 0 0 5px rgba(140,161,143,.13)!important}
      .kpulse-product{min-height:27px!important;padding:0 11px!important;border-radius:999px!important;font:800 8px/1 'DM Sans',sans-serif!important;letter-spacing:.18em!important;background:linear-gradient(145deg,#20382a,#2f4b39)!important;box-shadow:0 7px 20px rgba(34,56,43,.15)!important}
      .topbar #pageTitle{font-size:41px!important;max-width:790px!important}
      .topbar-actions{gap:9px!important}

      /* Animated header band */
      .topbar.kpulse-band-motion{animation:kpulseBandIn .72s cubic-bezier(.2,.78,.22,1) both}
      .topbar.kpulse-band-motion .kpulse-lockup{animation:kpulseLogoIn .72s .06s cubic-bezier(.2,.78,.22,1) both}
      .topbar.kpulse-band-motion #pageTitle{animation:kpulseTitleIn .78s .12s cubic-bezier(.2,.78,.22,1) both}
      .topbar.kpulse-band-motion .topbar-actions>*{animation:kpulseControlIn .55s cubic-bezier(.2,.78,.22,1) both}
      .topbar.kpulse-band-motion .topbar-actions>*:nth-child(1){animation-delay:.17s}
      .topbar.kpulse-band-motion .topbar-actions>*:nth-child(2){animation-delay:.22s}
      .topbar.kpulse-band-motion .topbar-actions>*:nth-child(3){animation-delay:.27s}
      .topbar.kpulse-band-motion .topbar-actions>*:nth-child(4){animation-delay:.32s}
      .kpulse-header-sweep{position:absolute;left:-28%;bottom:0;width:28%;height:1px;z-index:4;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(78,111,87,.55),transparent);opacity:0}
      .topbar.kpulse-band-motion .kpulse-header-sweep{animation:kpulseSweep 1.7s .28s cubic-bezier(.2,.78,.22,1) both}

      /* Hero / score card motion */
      body.khome-v3 [data-my-komo-home]>.mykomo-card.kpulse-score-motion{animation:kpulseScoreCardIn .82s .12s cubic-bezier(.2,.78,.22,1) both}
      body.khome-v3 .kpulse-score-motion .mykomo-identity{animation:kpulseScoreContentIn .72s .18s cubic-bezier(.2,.78,.22,1) both}
      body.khome-v3 .kpulse-score-motion .mykomo-section-label{animation:kpulseScoreContentIn .65s .25s cubic-bezier(.2,.78,.22,1) both}
      body.khome-v3 .kpulse-score-motion .mykomo-ring-item{animation:kpulseRingIn .72s cubic-bezier(.2,.78,.22,1) both}
      body.khome-v3 .kpulse-score-motion .mykomo-ring-item:nth-child(1){animation-delay:.30s}
      body.khome-v3 .kpulse-score-motion .mykomo-ring-item:nth-child(2){animation-delay:.38s}
      body.khome-v3 .kpulse-score-motion .mykomo-ring-item:nth-child(3){animation-delay:.46s}
      body.khome-v3 .kpulse-score-motion .mykomo-ring{transition:transform .34s cubic-bezier(.2,.78,.22,1),filter .34s ease!important}
      body.khome-v3 .kpulse-score-motion .mykomo-ring-item:hover .mykomo-ring{transform:scale(1.035);filter:drop-shadow(0 12px 22px rgba(52,80,62,.10))}

      /* KŌMØ Age becomes a real hero metric */
      .kpulse-age-zone{min-width:230px!important;padding:8px 20px 12px!important;text-align:center!important;position:relative!important}
      .kpulse-age-zone:before{content:"";position:absolute;left:50%;top:-5px;width:74px;height:74px;border-radius:50%;transform:translateX(-50%);background:radial-gradient(circle,rgba(91,119,98,.09),rgba(91,119,98,0) 68%);pointer-events:none}
      .kpulse-age-label{position:relative!important;z-index:1!important;display:block!important;margin:0 0 10px!important;color:#526b59!important;font:800 11px/1 'DM Sans',sans-serif!important;letter-spacing:.18em!important;text-transform:uppercase!important}
      .kpulse-age-value{position:relative!important;z-index:1!important;display:block!important;color:#213629!important;font:600 35px/.92 Manrope,'DM Sans',sans-serif!important;letter-spacing:-.06em!important;min-height:32px!important}
      .kpulse-age-note{position:relative!important;z-index:1!important;display:block!important;margin-top:9px!important;color:#7b857e!important;font-size:7.5px!important;line-height:1.4!important}
      .kpulse-age-zone.kpulse-age-motion{animation:kpulseAgeIn .82s .27s cubic-bezier(.2,.78,.22,1) both}

      @keyframes kpulseBandIn{from{opacity:0;transform:translate3d(0,-10px,0)}to{opacity:1;transform:none}}
      @keyframes kpulseLogoIn{from{opacity:0;transform:translate3d(-12px,0,0) scale(.96)}to{opacity:1;transform:none}}
      @keyframes kpulseTitleIn{from{opacity:0;transform:translate3d(0,9px,0)}to{opacity:1;transform:none}}
      @keyframes kpulseControlIn{from{opacity:0;transform:translate3d(8px,0,0) scale(.985)}to{opacity:1;transform:none}}
      @keyframes kpulseSweep{0%{left:-28%;opacity:0}15%{opacity:.8}70%{opacity:.45}100%{left:105%;opacity:0}}
      @keyframes kpulseScoreCardIn{from{opacity:0;transform:translate3d(0,17px,0) scale(.992)}to{opacity:1;transform:none}}
      @keyframes kpulseScoreContentIn{from{opacity:0;transform:translate3d(0,9px,0)}to{opacity:1;transform:none}}
      @keyframes kpulseRingIn{from{opacity:0;transform:translate3d(0,13px,0) scale(.96)}to{opacity:1;transform:none}}
      @keyframes kpulseAgeIn{from{opacity:0;transform:translate3d(0,9px,0) scale(.97)}to{opacity:1;transform:none}}

      @media(max-width:900px){
        .kpulse-wordmark{font-size:15px!important}.kpulse-product{min-height:25px!important;font-size:7.5px!important}
        .topbar #pageTitle{font-size:35px!important}.kpulse-age-zone{min-width:190px!important}
      }
      @media(max-width:760px){
        .kpulse-lockup{gap:9px!important;margin-bottom:8px!important}
        .kpulse-wordmark{font-size:13px!important;letter-spacing:.16em!important}
        .kpulse-product{min-height:23px!important;padding:0 9px!important;font-size:6.8px!important}
        .kpulse-dot{width:5px!important;height:5px!important;box-shadow:0 0 0 4px rgba(140,161,143,.12)!important}
        .topbar #pageTitle{font-size:30px!important}
        .kpulse-age-label{font-size:10px!important}.kpulse-age-value{font-size:30px!important}.kpulse-age-zone{min-width:0!important;padding:5px 12px 10px!important}
      }
      @media(prefers-reduced-motion:reduce){
        .topbar.kpulse-band-motion,.topbar.kpulse-band-motion .kpulse-lockup,.topbar.kpulse-band-motion #pageTitle,.topbar.kpulse-band-motion .topbar-actions>*,body.khome-v3 [data-my-komo-home]>.mykomo-card.kpulse-score-motion,body.khome-v3 .kpulse-score-motion .mykomo-identity,body.khome-v3 .kpulse-score-motion .mykomo-section-label,body.khome-v3 .kpulse-score-motion .mykomo-ring-item,.kpulse-age-zone.kpulse-age-motion{animation:none!important;opacity:1!important;transform:none!important}
        .kpulse-header-sweep{display:none!important}
      }
    `;
    document.head.appendChild(s);
  }

  function leafText(el){return !el.children.length?(el.textContent||'').trim().replace(/\s+/g,' '):''}

  function enhanceAge(){
    if((location.hash.replace(/^#/,'')||'home')!=='home')return;
    const scoreCard=document.querySelector('[data-my-komo-home] .mykomo-score-card');
    if(!scoreCard)return;
    const all=[...scoreCard.querySelectorAll('*')];
    const label=all.find(el=>leafText(el).toUpperCase()==='KŌMØ AGE');
    if(!label)return;
    label.classList.add('kpulse-age-label');
    const zone=label.parentElement;
    if(!zone)return;
    zone.classList.add('kpulse-age-zone','kpulse-age-motion');
    const leaves=[...zone.querySelectorAll('*')].filter(el=>!el.children.length);
    const value=leaves.find(el=>{const t=leafText(el);return t==='—'||/^\d{1,3}(?:\s*ans?)?$/i.test(t)});
    const note=leaves.find(el=>/disponible après calcul/i.test(leafText(el))||/âge locomoteur/i.test(leafText(el))&&el!==label);
    value?.classList.add('kpulse-age-value');
    note?.classList.add('kpulse-age-note');
  }

  function animateTop(){
    const topbar=document.querySelector('.topbar');
    if(!topbar)return;
    let sweep=topbar.querySelector('.kpulse-header-sweep');
    if(!sweep){sweep=document.createElement('i');sweep.className='kpulse-header-sweep';sweep.setAttribute('aria-hidden','true');topbar.appendChild(sweep)}
    topbar.classList.remove('kpulse-band-motion');
    void topbar.offsetWidth;
    topbar.classList.add('kpulse-band-motion');
  }

  function animateScore(){
    if((location.hash.replace(/^#/,'')||'home')!=='home')return;
    const card=document.querySelector('[data-my-komo-home]>.mykomo-card');
    if(!card)return;
    card.classList.remove('kpulse-score-motion');
    void card.offsetWidth;
    card.classList.add('kpulse-score-motion');
  }

  function run({replay=false}={}){
    ensureStyle();
    enhanceAge();
    if(replay&&!reduced()){animateTop();animateScore()}
  }

  function schedule(replay=false){clearTimeout(timer);timer=setTimeout(()=>run({replay}),90)}
  ensureStyle();
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>run({replay:true}),900));
  window.addEventListener('pageshow',()=>schedule(true));
  window.addEventListener('hashchange',()=>schedule(true));
  window.addEventListener('komo:route-ready',()=>schedule(true));
  window.addEventListener('komo:data-ready',()=>schedule(false));
  window.addEventListener('komo:canonical-result-ready',()=>schedule(false));
  new MutationObserver(()=>schedule(false)).observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>run({replay:true}),1600);
  window.KomoPulseHeroPolish={version:VERSION,refresh:()=>run({replay:true})};
})();

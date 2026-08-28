/* KŌMØ Pulse — brand identity + light palette v1
   Persistent product lock-up and unified organic light palette. */
(() => {
  const VERSION='1.2.0';

  function ensureStyle(){
    if(document.querySelector('#kpulseBrandThemeStyle')) return;
    const s=document.createElement('style');
    s.id='kpulseBrandThemeStyle';
    s.textContent=`
      :root{
        --kp-ink:#1f2c24;
        --kp-forest:#22382b;
        --kp-forest-2:#304c3a;
        --kp-sage:#b9c7b7;
        --kp-sage-soft:#e7ede5;
        --kp-moss:#6f8774;
        --kp-ivory:#f5f1e8;
        --kp-paper:#fcfbf7;
        --kp-sand:#eee5d7;
        --kp-mist:#eef1ec;
        --kp-line:rgba(31,44,36,.09);
        --kp-muted:#748078;
      }

      body{background:linear-gradient(180deg,#f7f4ed 0%,#f3f0e8 58%,#efede6 100%)!important;color:var(--kp-ink)}
      .main-shell{background:transparent!important}

      /* Persistent product identity */
      .topbar{position:relative;overflow:hidden;padding-top:17px!important;padding-bottom:16px!important;border-bottom:1px solid rgba(31,44,36,.065)!important;background:linear-gradient(180deg,rgba(252,251,247,.96),rgba(248,245,238,.86))!important;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
      .topbar:after{content:"PULSE";position:absolute;right:176px;top:-21px;font:600 92px/.9 Manrope,'DM Sans',sans-serif;letter-spacing:-.07em;color:rgba(34,56,43,.026);pointer-events:none;user-select:none}
      .kpulse-heading{display:flex;flex-direction:column;align-items:flex-start;min-width:0}
      .kpulse-lockup{display:inline-flex;align-items:center;gap:9px;margin-bottom:8px;color:var(--kp-forest);white-space:nowrap}
      .kpulse-wordmark{font:600 12px/1 Manrope,'DM Sans',sans-serif;letter-spacing:.21em}
      .kpulse-product{display:inline-flex;align-items:center;justify-content:center;min-height:22px;padding:0 9px;border-radius:999px;background:var(--kp-forest);color:#f8f5ee;font:700 7px/1 'DM Sans',sans-serif;letter-spacing:.19em;box-shadow:0 5px 16px rgba(34,56,43,.12)}
      .kpulse-dot{width:5px;height:5px;border-radius:50%;background:#91a794;box-shadow:0 0 0 4px rgba(145,167,148,.12)}
      .topbar #pageEyebrow{margin:0 0 4px!important;color:#79827b!important;font-size:6.5px!important;font-weight:800!important;letter-spacing:.14em!important;text-transform:uppercase!important;min-height:0!important}
      .topbar #pageEyebrow[data-kpulse-duplicate="1"]{display:none!important}
      .topbar #pageTitle{margin:0!important;color:var(--kp-ink)!important;font:500 39px/1.02 Manrope,'DM Sans',sans-serif!important;letter-spacing:-.052em!important;max-width:760px;text-wrap:balance}

      /* Top controls */
      .topbar-actions{position:relative;z-index:2}
      .topbar .mode-switch{padding:4px!important;border:1px solid rgba(31,44,36,.07)!important;background:rgba(255,255,255,.7)!important;box-shadow:0 7px 22px rgba(31,44,36,.035)}
      .topbar .mode-switch button{border-radius:12px!important;color:#707a73!important}
      .topbar .mode-switch button.active{background:var(--kp-forest)!important;color:#fff!important;box-shadow:0 5px 14px rgba(34,56,43,.12)}
      .topbar .icon-button{background:rgba(255,255,255,.72)!important;border-color:rgba(31,44,36,.07)!important;color:var(--kp-forest)!important;box-shadow:0 7px 20px rgba(31,44,36,.035)}

      /* Navigation identity */
      .brand{color:var(--kp-forest)!important}
      .brand-mark{letter-spacing:.18em!important;font-weight:700!important}
      .brand-product{display:inline-flex!important;align-items:center!important;padding:4px 7px!important;border-radius:999px!important;background:var(--kp-forest)!important;color:#fff!important;font-size:6px!important;letter-spacing:.13em!important;text-transform:uppercase!important}

      /* Data wall palette unification */
      body.khome-v3{background:linear-gradient(180deg,#f7f4ed 0%,#f2efe7 100%)!important}
      body.khome-v3 .kdw-card{border-color:var(--kp-line)!important;box-shadow:0 12px 34px rgba(31,44,36,.04)!important}
      body.khome-v3 .kdw-action{border-color:var(--kp-line)!important;box-shadow:0 10px 28px rgba(31,44,36,.035)!important}
      body.khome-v3 .kdw-action.primary{background:linear-gradient(145deg,#21372a 0%,#2d4937 100%)!important;border-color:#21372a!important;box-shadow:0 14px 30px rgba(34,56,43,.12)!important}
      body.khome-v3 .kdw-action.soft{background:linear-gradient(145deg,#e3ebe2 0%,#edf1e9 100%)!important;color:#26382c!important}
      body.khome-v3 .kdw-action.sand{background:linear-gradient(145deg,#ede3d4 0%,#f4eee4 100%)!important;color:#3c392f!important}
      body.khome-v3 .kdw-score{background:linear-gradient(155deg,#fdfcf8 0%,#f6f4ed 100%)!important}
      body.khome-v3 .kdw-age{background:radial-gradient(circle at 84% 15%,rgba(98,126,105,.16),transparent 31%),linear-gradient(155deg,#e5ede4 0%,#f2f4ee 100%)!important}
      body.khome-v3 .kdw-next{background:linear-gradient(145deg,#fff 0%,#faf8f3 100%)!important}
      body.khome-v3 .kdw-today{background:linear-gradient(145deg,#eee4d7 0%,#f5efe6 100%)!important}
      body.khome-v3 .kdw-exp{background:linear-gradient(145deg,#dfe9df 0%,#edf2ea 100%)!important}
      body.khome-v3 .kdw-connected{background:linear-gradient(145deg,#faf8f3 0%,#f3f0e8 100%)!important}
      body.khome-v3 .kdw-device{background:rgba(255,255,255,.78)!important;border-color:rgba(31,44,36,.065)!important}
      body.khome-v3 .kdw-device-logo{background:#e8eee7!important;color:#2f4a39!important}
      body.khome-v3 .kdw-device em{background:#ece9e1!important;color:#66736a!important}

      body.khome-v3 .kdw-ring{background:conic-gradient(#375744 calc(var(--v)*1%),#e0e3dc 0)!important;filter:drop-shadow(0 10px 24px rgba(55,87,68,.07))!important}
      body.khome-v3 .kdw-ring:after{background:#fcfbf7!important}
      body.khome-v3 .kdw-ring-core strong{color:#203126!important}
      body.khome-v3 .kdw-ring-core span{color:#708078!important}
      body.khome-v3 .kdw-mini{background:#edeae2!important}
      body.khome-v3 .kdw-today-bar{background:#d9d4c9!important}
      body.khome-v3 .kdw-today-bar i{background:linear-gradient(90deg,#486b55,#6f8d77)!important}
      body.khome-v3 .kdw-exp-dial{background:conic-gradient(#3d604a calc(var(--p)*1%),rgba(61,96,74,.13) 0)!important}
      body.khome-v3 .kdw-exp-dial:after{background:#e7eee5!important}
      body.khome-v3 .kdw-age-foot{background:rgba(255,255,255,.68)!important;border:1px solid rgba(31,44,36,.05)}
      body.khome-v3 .kdw-age-tag{background:rgba(255,255,255,.72)!important;color:#58695e!important}

      /* Make the data wall feel more like a branded product */
      body.khome-v3 .kdw:before{content:"KŌMØ PULSE · LIVE MOBILITY DASHBOARD";display:block;margin:2px 2px -2px;color:#758078;font:800 6px/1 'DM Sans',sans-serif;letter-spacing:.16em;text-transform:uppercase}
      body.khome-v3 .kdw-score .kdw-eyebrow:before{content:"KŌMØ ";color:#435f4c}

      @media(max-width:900px){
        .topbar:after{right:70px;font-size:72px;top:-12px}
        .topbar #pageTitle{font-size:33px!important}
      }
      @media(max-width:760px){
        .topbar{padding-top:13px!important;padding-bottom:12px!important}
        .kpulse-lockup{margin-bottom:6px}
        .kpulse-wordmark{font-size:10px;letter-spacing:.18em}
        .kpulse-product{min-height:20px;padding:0 8px;font-size:6px}
        .topbar #pageTitle{font-size:29px!important;line-height:1.04!important;max-width:88vw}
        .topbar:after{display:none}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureWearableFollowup(){
    if(!document.querySelector('link[data-komo-wearable-css]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='./wearable-followup-v1.css?v=20260829';
      link.dataset.komoWearableCss='1';
      document.head.appendChild(link);
    }
    if(!document.querySelector('script[data-komo-wearable-js]')){
      const script=document.createElement('script');
      script.type='module';
      script.src='./wearable-followup-v2.js?v=20260829';
      script.dataset.komoWearableJs='1';
      document.body.appendChild(script);
    }
    if(!document.querySelector('script[data-komo-wearable-surfaces-js]')){
      const script=document.createElement('script');
      script.type='module';
      script.src='./wearable-patient-surfaces-v1.js?v=20260829';
      script.dataset.komoWearableSurfacesJs='1';
      document.body.appendChild(script);
    }
  }

  function enhanceHeader(){
    const topbar=document.querySelector('.topbar');
    const title=document.querySelector('#pageTitle');
    const eyebrow=document.querySelector('#pageEyebrow');
    if(!topbar||!title||!eyebrow) return;
    const parent=title.parentElement;
    if(!parent) return;
    parent.classList.add('kpulse-heading');
    if(!parent.querySelector('.kpulse-lockup')){
      const lock=document.createElement('div');
      lock.className='kpulse-lockup';
      lock.setAttribute('aria-label','KŌMØ Pulse');
      lock.innerHTML='<span class="kpulse-wordmark">KŌMØ</span><span class="kpulse-dot" aria-hidden="true"></span><span class="kpulse-product">PULSE</span>';
      parent.insertBefore(lock,eyebrow);
    }
    const isDuplicate=/^KŌMØ\s*PULSE$/i.test((eyebrow.textContent||'').trim());
    eyebrow.dataset.kpulseDuplicate=isDuplicate?'1':'0';
  }

  function run(){ensureStyle();ensureWearableFollowup();enhanceHeader()}
  run();
  document.addEventListener('DOMContentLoaded',run);
  window.addEventListener('hashchange',()=>setTimeout(run,40));
  window.addEventListener('komo:route-ready',()=>setTimeout(run,20));
  new MutationObserver(()=>enhanceHeader()).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.KomoPulseBrandTheme={version:VERSION,refresh:run};
})();
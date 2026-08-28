/* KŌMØ Pulse — canonical patient dock v4
   One independent five-tab dock. Legacy sidebar/mobile/adaptive bars are hidden in patient mode.
   Professional/admin navigation remains untouched. */
(() => {
  const VERSION='4.0.0';
  let timer=null,refreshing=false;

  const route=()=>location.hash.replace(/^#/,'')||'home';
  const appVisible=()=>{
    const app=document.querySelector('#appShell');
    const auth=document.querySelector('#authScreen');
    return !!app&&!app.hidden&&(!auth||auth.hidden);
  };
  const patientMode=()=>{
    const r=route();
    if(r==='clinical'||r==='admin')return false;
    const member=document.querySelector('#modeSwitch [data-mode="member"]');
    return !member||member.classList.contains('active');
  };

  const I={
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3.8 10.4 12 3.2l8.2 7.2"/><path d="M5.7 9.7v10.8h12.6V9.7"/><path d="M9.4 20.5v-5.8h5.2v5.8"/></svg>',
    assessment:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3.5 16.5c3.2-5.5 5.2 2.6 8.2-2.8 3-5.3 5 2.5 8.8-5.8"/><circle cx="5.1" cy="16" r="1.6"/><circle cx="12" cy="12.9" r="1.6"/><circle cx="19.7" cy="7.9" r="1.6"/></svg>',
    mykomo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M12 12l4-3"/><path d="M7.3 16.6a6.5 6.5 0 0 1 9.4 0"/></svg>',
    trajectory:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 17c3.2-5.4 5 2.2 8-2.7s5.1 2.1 8-5.4"/><circle cx="4" cy="17" r="1.5"/><circle cx="12" cy="14.3" r="1.5"/><circle cx="20" cy="8.9" r="1.5"/></svg>',
    agenda:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7 3.5v4M17 3.5v4M3.5 10h17M8 14h3M14 14h2.5M8 17h3"/></svg>',
    motion:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 18.5c3.4 0 4.2-4.1 7-4.1s3.8-7.1 7-7.1"/><circle cx="5" cy="18.5" r="2"/><circle cx="12" cy="14.4" r="2"/><circle cx="19" cy="7.3" r="2"/></svg>',
    clinical:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M7 12h10"/></svg>'
  };

  const ITEMS=[
    {key:'home',label:'Accueil',route:'home',icon:I.home},
    {key:'assessment',label:'KŌMØ',sub:'Motion / Clinical',icon:I.assessment},
    {key:'mykomo',label:'My KŌMØ',route:'results',icon:I.mykomo},
    {key:'trajectory',label:'Trajectoire',route:'path',icon:I.trajectory},
    {key:'agenda',label:'Agenda',route:'documents',icon:I.agenda}
  ];

  function activeKey(){
    const r=route();
    if(r==='motion')return'assessment';
    if(r==='results')return'mykomo';
    if(r==='path'||r==='plan')return'trajectory';
    if(r==='documents')return'agenda';
    return'home';
  }

  function ensureStyle(){
    if(document.querySelector('#kpulseCanonicalDockV4Style'))return;
    const s=document.createElement('style');
    s.id='kpulseCanonicalDockV4Style';
    s.textContent=`
      /* v4 owns patient navigation completely. Do not let old bottom-dock/adaptive/mobile bars participate. */
      body.kpulse-patient-dock-active .sidebar,
      body.kpulse-patient-dock-active #mobileNav,
      body.kpulse-patient-dock-active #kamBottomBar,
      body.kpulse-patient-dock-active #proMobileNav{display:none!important}
      body.kpulse-patient-dock-active .app-shell{padding-bottom:0!important}
      body.kpulse-patient-dock-active .main-shell{margin-left:0!important;padding-bottom:calc(104px + env(safe-area-inset-bottom))!important}

      #kpulseCanonicalDock{
        --kp-nav-index:0;
        position:fixed!important;z-index:170!important;
        left:50%!important;right:auto!important;
        bottom:max(10px,env(safe-area-inset-bottom))!important;
        transform:translateX(-50%)!important;
        width:min(860px,calc(100vw - 30px))!important;height:72px!important;
        padding:6px!important;box-sizing:border-box!important;
        display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:3px!important;
        border:1px solid rgba(255,255,255,.12)!important;border-radius:23px!important;
        background:linear-gradient(145deg,rgba(31,45,36,.985),rgba(26,39,31,.985))!important;
        box-shadow:0 20px 62px rgba(24,34,27,.24),inset 0 1px 0 rgba(255,255,255,.06)!important;
        backdrop-filter:blur(24px) saturate(1.12)!important;-webkit-backdrop-filter:blur(24px) saturate(1.12)!important;
        overflow:hidden!important;isolation:isolate!important;
        animation:kpDockIn .58s cubic-bezier(.2,.78,.22,1) both
      }
      #kpulseCanonicalDock[hidden]{display:none!important}
      #kpulseCanonicalDock:before{content:"";position:absolute;z-index:0;inset:0;pointer-events:none;background:linear-gradient(112deg,transparent 28%,rgba(255,255,255,.045) 47%,transparent 67%);transform:translateX(-110%);animation:kpDockSweep 8s 1.5s ease-in-out infinite}
      #kpulseCanonicalDock .kpulse-nav-indicator{position:absolute;z-index:1;left:6px;top:6px;bottom:6px;width:calc((100% - 24px)/5);border-radius:17px;background:linear-gradient(145deg,#faf7f0,#ece8df);box-shadow:0 8px 24px rgba(6,15,9,.17),inset 0 1px 0 #fff;transform:translateX(calc(var(--kp-nav-index) * (100% + 3px)));transition:transform .42s cubic-bezier(.2,.82,.22,1);will-change:transform;pointer-events:none}
      #kpulseCanonicalDock .kpulse-nav-item{position:relative;z-index:2;min-width:0!important;width:auto!important;height:60px!important;margin:0!important;padding:5px 3px!important;border:0!important;border-radius:17px!important;background:transparent!important;color:rgba(245,247,243,.60)!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;font-family:'DM Sans',sans-serif!important;cursor:pointer!important;box-shadow:none!important;transition:color .26s ease,transform .16s ease!important;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
      #kpulseCanonicalDock .kpulse-nav-item svg{display:block;width:19px!important;height:19px!important;flex:0 0 auto;stroke-width:1.55!important;transition:transform .30s cubic-bezier(.2,.82,.22,1),filter .30s ease!important}
      #kpulseCanonicalDock .kpulse-nav-copy{display:grid!important;place-items:center!important;gap:1px!important;min-width:0!important;max-width:100%!important;line-height:1!important}
      #kpulseCanonicalDock .kpulse-nav-copy>b{display:block;max-width:100%;font-size:9px!important;line-height:1!important;font-weight:650!important;letter-spacing:.005em!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #kpulseCanonicalDock .kpulse-nav-copy>small{display:block;font-size:5.8px!important;line-height:1!important;font-weight:750!important;letter-spacing:.045em!important;text-transform:uppercase!important;white-space:nowrap!important;opacity:.68!important}
      #kpulseCanonicalDock .kpulse-nav-item.active{color:#21362a!important;background:transparent!important}
      #kpulseCanonicalDock .kpulse-nav-item.active svg{transform:translateY(-2px) scale(1.06);filter:drop-shadow(0 4px 8px rgba(35,55,42,.12))}
      #kpulseCanonicalDock .kpulse-nav-item.active .kpulse-nav-copy>b{font-weight:800!important}
      #kpulseCanonicalDock .kpulse-nav-item:not(.active):hover{color:#fff!important;transform:translateY(-1px)}
      #kpulseCanonicalDock .kpulse-nav-item:active{transform:scale(.965)!important;transition-duration:.08s!important}
      #kpulseCanonicalDock .kpulse-nav-item.kpulse-tab-pop svg{animation:kpDockIconPop .4s cubic-bezier(.2,.82,.22,1)}

      .kpulse-assessment-backdrop{position:fixed;z-index:174;inset:0;border:0;background:rgba(24,32,27,.30);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .22s ease}
      .kpulse-assessment-backdrop.open{opacity:1;pointer-events:auto}
      .kpulse-assessment-sheet{position:fixed;z-index:175;left:50%;bottom:96px;width:min(560px,calc(100vw - 24px));padding:14px;border:1px solid rgba(35,48,39,.10);border-radius:26px;background:#fbfaf7;box-shadow:0 30px 92px rgba(25,34,28,.26);transform:translate(-50%,calc(100% + 135px)) scale(.97);opacity:0;pointer-events:none;transition:transform .34s cubic-bezier(.2,.82,.22,1),opacity .22s ease}
      .kpulse-assessment-sheet.open{transform:translate(-50%,0) scale(1);opacity:1;pointer-events:auto}
      .kpulse-assessment-handle{width:38px;height:4px;margin:0 auto 12px;border-radius:999px;background:#d8d3c8}
      .kpulse-assessment-head{display:flex;align-items:end;justify-content:space-between;gap:16px;padding:4px 5px 12px}.kpulse-assessment-head small{display:block;color:#778178;font-size:7px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.kpulse-assessment-head strong{display:block;margin-top:4px;color:#243229;font:600 21px/1.05 Manrope,sans-serif;letter-spacing:-.035em}.kpulse-assessment-close{width:36px;height:36px;border:1px solid rgba(35,48,39,.09);border-radius:50%;background:#fff;color:#35443a;font-size:18px;cursor:pointer}
      .kpulse-assessment-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.kpulse-assessment-card{min-height:150px;padding:16px;border:1px solid rgba(35,48,39,.08);border-radius:19px;background:#f3f0e8;color:#26372d;text-align:left;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}.kpulse-assessment-card.motion{background:linear-gradient(145deg,#23372b,#31503b);color:#fff}.kpulse-assessment-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(35,48,39,.09)}.kpulse-assessment-card span{width:34px;height:34px;border-radius:11px;background:rgba(255,255,255,.78);display:grid;place-items:center;color:#30483a}.kpulse-assessment-card.motion span{background:rgba(255,255,255,.12);color:#fff}.kpulse-assessment-card span svg{width:18px;height:18px}.kpulse-assessment-card small{display:block;margin-top:18px;font-size:6.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.58}.kpulse-assessment-card strong{display:block;margin-top:5px;font:600 20px/1.05 Manrope,sans-serif;letter-spacing:-.035em}.kpulse-assessment-card p{margin:6px 0 0;font-size:8px;line-height:1.45;opacity:.62}

      @keyframes kpDockIn{from{opacity:0;transform:translate(-50%,18px) scale(.99)}to{opacity:1;transform:translate(-50%,0) scale(1)}}
      @keyframes kpDockSweep{0%,75%{transform:translateX(-110%)}90%,100%{transform:translateX(110%)}}
      @keyframes kpDockIconPop{0%{transform:translateY(0) scale(1)}46%{transform:translateY(-5px) scale(1.13)}100%{transform:translateY(-2px) scale(1.06)}}

      @media(max-width:760px){
        body.kpulse-patient-dock-active .main-shell{padding-bottom:calc(96px + env(safe-area-inset-bottom))!important}
        #kpulseCanonicalDock{left:7px!important;right:7px!important;width:auto!important;height:68px!important;bottom:max(7px,env(safe-area-inset-bottom))!important;transform:none!important;border-radius:21px!important;padding:5px!important}
        #kpulseCanonicalDock .kpulse-nav-indicator{left:5px;top:5px;bottom:5px;width:calc((100% - 22px)/5);border-radius:16px}
        #kpulseCanonicalDock .kpulse-nav-item{height:58px!important;padding:4px 1px!important;border-radius:16px!important}
        #kpulseCanonicalDock .kpulse-nav-item svg{width:18px!important;height:18px!important}
        #kpulseCanonicalDock .kpulse-nav-copy>b{font-size:7.8px!important}
        #kpulseCanonicalDock .kpulse-nav-copy>small{font-size:5.1px!important}
        .kpulse-assessment-sheet{bottom:86px}.kpulse-assessment-grid{grid-template-columns:1fr}.kpulse-assessment-card{min-height:116px}
        @keyframes kpDockIn{from{opacity:0;transform:translateY(18px) scale(.99)}to{opacity:1;transform:none}}
      }
      @media(max-width:390px){#kpulseCanonicalDock .kpulse-nav-copy>b{font-size:7.1px!important}#kpulseCanonicalDock .kpulse-nav-copy>small{font-size:4.6px!important}}
      @media(prefers-reduced-motion:reduce){#kpulseCanonicalDock,#kpulseCanonicalDock:before,#kpulseCanonicalDock .kpulse-nav-item.kpulse-tab-pop svg{animation:none!important}#kpulseCanonicalDock .kpulse-nav-indicator,#kpulseCanonicalDock .kpulse-nav-item,#kpulseCanonicalDock .kpulse-nav-item svg,.kpulse-assessment-sheet,.kpulse-assessment-backdrop{transition:none!important}}
    `;
    document.head.appendChild(s);
  }

  function buttonHtml(item){
    const aria=item.sub?`${item.label} ${item.sub}`:item.label;
    return `<button type="button" class="kpulse-nav-item" data-kpulse-nav="${item.key}" aria-label="${aria}">${item.icon}<span class="kpulse-nav-copy"><b>${item.label}</b>${item.sub?`<small>${item.sub}</small>`:''}</span></button>`;
  }
  function navHtml(){return `<i class="kpulse-nav-indicator" aria-hidden="true"></i>${ITEMS.map(buttonHtml).join('')}`}

  function ensureDock(){
    const app=document.querySelector('#appShell');if(!app)return null;
    let dock=document.querySelector('#kpulseCanonicalDock');
    if(!dock){
      dock=document.createElement('nav');
      dock.id='kpulseCanonicalDock';
      dock.setAttribute('aria-label','Navigation KŌMØ Pulse');
      dock.innerHTML=navHtml();
      app.appendChild(dock);
    }
    return dock;
  }

  function ensureAssessmentSheet(){
    if(document.querySelector('#kpulseAssessmentSheet'))return;
    const app=document.querySelector('#appShell')||document.body;
    const back=document.createElement('button');back.type='button';back.id='kpulseAssessmentBackdrop';back.className='kpulse-assessment-backdrop';back.setAttribute('aria-label','Fermer le choix du bilan');
    const sheet=document.createElement('aside');sheet.id='kpulseAssessmentSheet';sheet.className='kpulse-assessment-sheet';sheet.setAttribute('aria-label','Choisir KŌMØ Motion ou Clinical');
    sheet.innerHTML=`<div class="kpulse-assessment-handle"></div><div class="kpulse-assessment-head"><div><small>KŌMØ PULSE · BILANS</small><strong>Choisissez votre parcours.</strong></div><button type="button" class="kpulse-assessment-close" data-kpulse-assessment-close aria-label="Fermer">×</button></div><div class="kpulse-assessment-grid"><button type="button" class="kpulse-assessment-card motion" data-kpulse-assessment="motion"><span>${I.motion}</span><div><small>Bilan fonctionnel</small><strong>KŌMØ Motion</strong><p>Préparation, tests, acquisition MyoCare et Motion Score.</p></div></button><button type="button" class="kpulse-assessment-card" data-kpulse-assessment="clinical"><span>${I.clinical}</span><div><small>Bilan approfondi</small><strong>KŌMØ Clinical</strong><p>Planifier l'évaluation clinique avec un professionnel.</p></div></button></div>`;
    app.append(back,sheet);back.addEventListener('click',closeAssessment);
  }
  function openAssessment(){ensureAssessmentSheet();requestAnimationFrame(()=>{document.querySelector('#kpulseAssessmentBackdrop')?.classList.add('open');document.querySelector('#kpulseAssessmentSheet')?.classList.add('open')})}
  function closeAssessment(){document.querySelector('#kpulseAssessmentBackdrop')?.classList.remove('open');document.querySelector('#kpulseAssessmentSheet')?.classList.remove('open')}

  function go(target){
    document.querySelector('#modeSwitch [data-mode="member"]')?.click();
    closeAssessment();
    if(location.hash!==`#${target}`)location.hash=target;
    else window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:target}}));
  }
  function goClinical(){
    sessionStorage.setItem('komo_home_booking_service','clinical');
    go('documents');
    let tries=0;
    const t=setInterval(()=>{
      tries++;
      const b=document.querySelector('[data-kbook-service="clinical"]');
      if(b){b.click();clearInterval(t)}else if(tries>35)clearInterval(t);
    },100);
  }

  function updateActive(dock){
    const key=activeKey();
    const idx=Math.max(0,ITEMS.findIndex(x=>x.key===key));
    dock.style.setProperty('--kp-nav-index',String(idx));
    dock.querySelectorAll('[data-kpulse-nav]').forEach(b=>{
      const on=b.dataset.kpulseNav===key;
      b.classList.toggle('active',on);
      if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
    });
  }

  function refresh(){
    if(refreshing)return;refreshing=true;
    requestAnimationFrame(()=>{
      try{
        ensureStyle();
        const show=appVisible()&&patientMode();
        document.body.classList.toggle('kpulse-patient-dock-active',show);
        const dock=ensureDock();
        if(dock){dock.hidden=!show;if(show)updateActive(dock)}
        if(!show)closeAssessment();
      }finally{refreshing=false}
    });
  }

  document.addEventListener('click',e=>{
    const nav=e.target.closest?.('#kpulseCanonicalDock [data-kpulse-nav]');
    if(nav){
      e.preventDefault();e.stopPropagation();
      nav.classList.remove('kpulse-tab-pop');void nav.offsetWidth;nav.classList.add('kpulse-tab-pop');
      const key=nav.dataset.kpulseNav;
      if(key==='assessment')openAssessment();
      else{const item=ITEMS.find(x=>x.key===key);if(item?.route)go(item.route)}
      return;
    }
    const a=e.target.closest?.('[data-kpulse-assessment]');
    if(a){e.preventDefault();e.stopPropagation();a.dataset.kpulseAssessment==='motion'?go('motion'):goClinical();return}
    if(e.target.closest?.('[data-kpulse-assessment-close]')){e.preventDefault();closeAssessment()}
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAssessment()});

  ['hashchange','pageshow','resize','orientationchange','komo:route-ready','komo:session-ready','komo:session-cleared','komo:data-ready'].forEach(name=>window.addEventListener(name,()=>{clearTimeout(timer);timer=setTimeout(refresh,45)}));
  new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(refresh,55)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,650));
  setTimeout(refresh,1000);setTimeout(refresh,1800);
  window.KomoBottomNav={version:VERSION,refresh};
})();

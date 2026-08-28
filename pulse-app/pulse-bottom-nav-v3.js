/* KŌMØ Pulse — bottom navigation v3
   Five patient destinations + animated active rail + Motion/Clinical chooser.
   Does not change professional/admin navigation ownership. */
(() => {
  const VERSION='3.0.0';
  let timer=null,obsBusy=false;
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const route=()=>location.hash.replace(/^#/,'')||'home';
  const memberMode=()=>{
    const b=document.querySelector('#modeSwitch [data-mode="member"]');
    return !b||b.classList.contains('active');
  };
  const appVisible=()=>{const a=document.querySelector('#appShell'),x=document.querySelector('#authScreen');return !!a&&!a.hidden&&(!x||x.hidden)};

  const I={
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3.8 10.4 12 3.2l8.2 7.2"/><path d="M5.7 9.7v10.8h12.6V9.7"/><path d="M9.4 20.5v-5.8h5.2v5.8"/></svg>',
    assessment:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3.5 16.5c3.2-5.5 5.2 2.6 8.2-2.8 3-5.3 5 2.5 8.8-5.8"/><circle cx="5.1" cy="16" r="1.6"/><circle cx="12" cy="12.9" r="1.6"/><circle cx="19.7" cy="7.9" r="1.6"/></svg>',
    mykomo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M12 12l4-3"/><path d="M7.3 16.6a6.5 6.5 0 0 1 9.4 0"/></svg>',
    trajectory:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 17c3.2-5.4 5 2.2 8-2.7s5.1 2.1 8-5.4"/><circle cx="4" cy="17" r="1.5"/><circle cx="12" cy="14.3" r="1.5"/><circle cx="20" cy="8.9" r="1.5"/></svg>',
    agenda:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7 3.5v4M17 3.5v4M3.5 10h17M8 14h3M14 14h2.5M8 17h3"/></svg>',
    motion:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 18.5c3.4 0 4.2-4.1 7-4.1s3.8-7.1 7-7.1"/><circle cx="5" cy="18.5" r="2"/><circle cx="12" cy="14.4" r="2"/><circle cx="19" cy="7.3" r="2"/></svg>',
    clinical:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M7 12h10"/></svg>'
  };

  const items=[
    {key:'home',label:'Accueil',route:'home',icon:I.home},
    {key:'assessment',label:'KŌMØ',sub:'Motion / Clinical',icon:I.assessment},
    {key:'mykomo',label:'My KŌMØ',route:'results',icon:I.mykomo},
    {key:'trajectory',label:'Trajectoire',route:'path',icon:I.trajectory},
    {key:'agenda',label:'Agenda',route:'documents',icon:I.agenda}
  ];

  function activeKey(){const r=route();if(r==='motion')return'assessment';if(r==='results')return'mykomo';if(r==='path'||r==='plan')return'trajectory';if(r==='documents')return'agenda';return'home'}

  function ensureStyle(){
    if(document.querySelector('#kpulseBottomNavV3Style'))return;
    const s=document.createElement('style');s.id='kpulseBottomNavV3Style';s.textContent=`
      #mobileNav.kpulse-bottom-v3,#kamBottomBar.kpulse-bottom-v3{
        --kp-nav-index:0;position:fixed!important;z-index:145!important;left:clamp(10px,2.2vw,32px)!important;right:clamp(10px,2.2vw,32px)!important;bottom:max(8px,env(safe-area-inset-bottom))!important;height:72px!important;padding:6px!important;border:1px solid rgba(230,235,229,.16)!important;border-radius:23px!important;background:rgba(31,45,36,.965)!important;box-shadow:0 18px 54px rgba(26,37,30,.20)!important;backdrop-filter:blur(24px) saturate(1.12)!important;-webkit-backdrop-filter:blur(24px) saturate(1.12)!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:3px!important;overflow:hidden!important;animation:kpNavBarIn .7s cubic-bezier(.2,.78,.22,1) both!important
      }
      #mobileNav.kpulse-bottom-v3:before,#kamBottomBar.kpulse-bottom-v3:before{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 24%,rgba(255,255,255,.045) 45%,transparent 66%);transform:translateX(-105%);animation:kpNavSweep 7s 1.1s ease-in-out infinite;pointer-events:none}
      .kpulse-nav-indicator{position:absolute;z-index:0;left:6px;top:6px;bottom:6px;width:calc((100% - 12px)/5);border-radius:17px;background:linear-gradient(145deg,#f7f4ed,#eeeae1);box-shadow:0 8px 22px rgba(0,0,0,.12);transform:translateX(calc(var(--kp-nav-index)*100%));transition:transform .46s cubic-bezier(.2,.82,.22,1),width .3s ease;will-change:transform;pointer-events:none}
      .kpulse-nav-item{position:relative;z-index:1;min-width:0;border:0!important;border-radius:17px!important;background:transparent!important;color:rgba(244,246,242,.58)!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;padding:5px 4px!important;font-family:'DM Sans',sans-serif!important;cursor:pointer!important;transition:color .28s ease,transform .18s ease!important;touch-action:manipulation}
      .kpulse-nav-item svg{width:19px!important;height:19px!important;stroke-width:1.55!important;transition:transform .32s cubic-bezier(.2,.82,.22,1),filter .32s ease!important}
      .kpulse-nav-copy{display:grid!important;place-items:center!important;gap:1px!important;min-width:0!important;max-width:100%!important}
      .kpulse-nav-copy>b{max-width:100%;font-size:8.5px!important;line-height:1!important;font-weight:650!important;letter-spacing:.005em!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .kpulse-nav-copy>small{font-size:5.6px!important;line-height:1!important;font-weight:700!important;letter-spacing:.05em!important;text-transform:uppercase!important;white-space:nowrap!important;opacity:.66!important}
      .kpulse-nav-item.active{color:#22372a!important}
      .kpulse-nav-item.active svg{transform:translateY(-2px) scale(1.06);filter:drop-shadow(0 4px 8px rgba(35,55,42,.12))}
      .kpulse-nav-item.active .kpulse-nav-copy>b{font-weight:800!important}
      .kpulse-nav-item:not(.active):hover{color:rgba(255,255,255,.9)!important;transform:translateY(-1px)}
      .kpulse-nav-item:active{transform:scale(.965)!important;transition-duration:.08s!important}
      .kpulse-nav-item.kpulse-tab-pop svg{animation:kpNavIconPop .42s cubic-bezier(.2,.82,.22,1)}

      .kpulse-assessment-backdrop{position:fixed;z-index:164;inset:0;border:0;background:rgba(24,32,27,.28);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:opacity .22s ease}
      .kpulse-assessment-backdrop.open{opacity:1;pointer-events:auto}
      .kpulse-assessment-sheet{position:fixed;z-index:165;left:50%;bottom:92px;width:min(560px,calc(100vw - 24px));padding:14px;border:1px solid rgba(35,48,39,.10);border-radius:26px;background:#fbfaf7;box-shadow:0 28px 90px rgba(25,34,28,.24);transform:translate(-50%,calc(100% + 130px)) scale(.97);opacity:0;transition:transform .36s cubic-bezier(.2,.82,.22,1),opacity .24s ease}
      .kpulse-assessment-sheet.open{transform:translate(-50%,0) scale(1);opacity:1}
      .kpulse-assessment-handle{width:38px;height:4px;margin:0 auto 12px;border-radius:999px;background:#d8d3c8}
      .kpulse-assessment-head{display:flex;align-items:end;justify-content:space-between;gap:16px;padding:4px 5px 12px}.kpulse-assessment-head small{display:block;color:#778178;font-size:7px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.kpulse-assessment-head strong{display:block;margin-top:4px;color:#243229;font:600 21px/1.05 Manrope,sans-serif;letter-spacing:-.035em}.kpulse-assessment-close{width:36px;height:36px;border:1px solid rgba(35,48,39,.09);border-radius:50%;background:#fff;color:#35443a;font-size:18px;cursor:pointer}
      .kpulse-assessment-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.kpulse-assessment-card{min-height:150px;padding:16px;border:1px solid rgba(35,48,39,.08);border-radius:19px;background:#f3f0e8;color:#26372d;text-align:left;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}.kpulse-assessment-card.motion{background:linear-gradient(145deg,#23372b,#31503b);color:#fff}.kpulse-assessment-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(35,48,39,.09)}.kpulse-assessment-card span{width:34px;height:34px;border-radius:11px;background:rgba(255,255,255,.78);display:grid;place-items:center;color:#30483a}.kpulse-assessment-card.motion span{background:rgba(255,255,255,.12);color:#fff}.kpulse-assessment-card span svg{width:18px;height:18px}.kpulse-assessment-card small{display:block;margin-top:18px;font-size:6.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.58}.kpulse-assessment-card strong{display:block;margin-top:5px;font:600 20px/1.05 Manrope,sans-serif;letter-spacing:-.035em}.kpulse-assessment-card p{margin:6px 0 0;font-size:8px;line-height:1.45;opacity:.62}

      @keyframes kpNavBarIn{from{opacity:0;transform:translate3d(0,18px,0) scale(.99)}to{opacity:1;transform:none}}
      @keyframes kpNavSweep{0%,73%{transform:translateX(-105%)}88%,100%{transform:translateX(105%)}}
      @keyframes kpNavIconPop{0%{transform:translateY(0) scale(1)}45%{transform:translateY(-5px) scale(1.13)}100%{transform:translateY(-2px) scale(1.06)}}
      @media(max-width:760px){#mobileNav.kpulse-bottom-v3,#kamBottomBar.kpulse-bottom-v3{left:7px!important;right:7px!important;height:70px!important;border-radius:21px!important}.kpulse-nav-copy>b{font-size:7.6px!important}.kpulse-nav-copy>small{font-size:5.1px!important}.kpulse-nav-item svg{width:18px!important;height:18px!important}.kpulse-assessment-sheet{bottom:88px}.kpulse-assessment-grid{grid-template-columns:1fr}.kpulse-assessment-card{min-height:116px}}
      @media(max-width:390px){.kpulse-nav-copy>b{font-size:7px!important}.kpulse-nav-copy>small{font-size:4.8px!important}.kpulse-nav-item{padding-inline:1px!important}}
      @media(prefers-reduced-motion:reduce){#mobileNav.kpulse-bottom-v3,#kamBottomBar.kpulse-bottom-v3,.kpulse-nav-item.kpulse-tab-pop svg,#mobileNav.kpulse-bottom-v3:before,#kamBottomBar.kpulse-bottom-v3:before{animation:none!important}.kpulse-nav-indicator,.kpulse-assessment-sheet,.kpulse-assessment-backdrop,.kpulse-nav-item,.kpulse-nav-item svg{transition:none!important}}
    `;document.head.appendChild(s)
  }

  function buttonHtml(item){return `<button type="button" class="kpulse-nav-item" data-kpulse-nav="${item.key}" aria-label="${item.sub?`${item.label} ${item.sub}`:item.label}">${item.icon}<span class="kpulse-nav-copy"><b>${item.label}</b>${item.sub?`<small>${item.sub}</small>`:''}</span></button>`}
  function navHtml(){return `<i class="kpulse-nav-indicator" aria-hidden="true"></i>${items.map(buttonHtml).join('')}`}

  function ensureAssessmentSheet(){
    if(document.querySelector('#kpulseAssessmentSheet'))return;
    const back=document.createElement('button');back.type='button';back.id='kpulseAssessmentBackdrop';back.className='kpulse-assessment-backdrop';back.setAttribute('aria-label','Fermer le choix du bilan');
    const sheet=document.createElement('aside');sheet.id='kpulseAssessmentSheet';sheet.className='kpulse-assessment-sheet';sheet.setAttribute('aria-label','Choisir KŌMØ Motion ou Clinical');sheet.innerHTML=`<div class="kpulse-assessment-handle"></div><div class="kpulse-assessment-head"><div><small>KŌMØ PULSE · BILANS</small><strong>Choisissez votre parcours.</strong></div><button type="button" class="kpulse-assessment-close" data-kpulse-assessment-close aria-label="Fermer">×</button></div><div class="kpulse-assessment-grid"><button type="button" class="kpulse-assessment-card motion" data-kpulse-assessment="motion"><span>${I.motion}</span><div><small>Bilan fonctionnel</small><strong>KŌMØ Motion</strong><p>Préparation, tests, acquisition MyoCare et Motion Score.</p></div></button><button type="button" class="kpulse-assessment-card" data-kpulse-assessment="clinical"><span>${I.clinical}</span><div><small>Bilan approfondi</small><strong>KŌMØ Clinical</strong><p>Planifier l'évaluation clinique avec un professionnel.</p></div></button></div>`;
    const app=document.querySelector('#appShell')||document.body;app.append(back,sheet);back.addEventListener('click',closeAssessment)
  }
  function openAssessment(){ensureAssessmentSheet();requestAnimationFrame(()=>{document.querySelector('#kpulseAssessmentBackdrop')?.classList.add('open');document.querySelector('#kpulseAssessmentSheet')?.classList.add('open')})}
  function closeAssessment(){document.querySelector('#kpulseAssessmentBackdrop')?.classList.remove('open');document.querySelector('#kpulseAssessmentSheet')?.classList.remove('open')}

  function go(target){document.querySelector('#modeSwitch [data-mode="member"]')?.click();closeAssessment();if(location.hash!==`#${target}`)location.hash=target;else window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:target}}))}
  function goClinical(){document.querySelector('#modeSwitch [data-mode="member"]')?.click();sessionStorage.setItem('komo_home_booking_service','clinical');closeAssessment();go('documents');let tries=0;const t=setInterval(()=>{tries++;const b=document.querySelector('[data-kbook-service="clinical"]');if(b){b.click();clearInterval(t)}else if(tries>35)clearInterval(t)},100)}

  function updateActive(nav){
    const key=activeKey(),idx=Math.max(0,items.findIndex(x=>x.key===key));nav.style.setProperty('--kp-nav-index',String(idx));
    nav.querySelectorAll('[data-kpulse-nav]').forEach(b=>{const on=b.dataset.kpulseNav===key;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')})
  }

  function own(nav){
    if(!nav||!appVisible()||!memberMode())return;
    if(nav.dataset.kpulseBottomVersion!==VERSION){nav.dataset.kpulseBottomVersion=VERSION;nav.classList.add('kpulse-bottom-v3');nav.innerHTML=navHtml()}
    updateActive(nav)
  }

  function refresh(){
    if(obsBusy)return;obsBusy=true;requestAnimationFrame(()=>{
      try{
        if(!appVisible())return;
        ensureStyle();ensureAssessmentSheet();
        const adaptive=document.querySelector('#kamBottomBar');if(adaptive&&memberMode())own(adaptive);
        const legacy=document.querySelector('#mobileNav');if(legacy&&memberMode())own(legacy);
      }finally{obsBusy=false}
    })
  }

  document.addEventListener('click',e=>{
    const n=e.target.closest?.('[data-kpulse-nav]');if(n){e.preventDefault();e.stopPropagation();const key=n.dataset.kpulseNav;n.classList.remove('kpulse-tab-pop');void n.offsetWidth;n.classList.add('kpulse-tab-pop');if(key==='assessment')openAssessment();else{const item=items.find(x=>x.key===key);if(item?.route)go(item.route)}return}
    const a=e.target.closest?.('[data-kpulse-assessment]');if(a){e.preventDefault();e.stopPropagation();a.dataset.kpulseAssessment==='motion'?go('motion'):goClinical();return}
    if(e.target.closest?.('[data-kpulse-assessment-close]')){e.preventDefault();closeAssessment()}
  },true);

  ['hashchange','pageshow','resize','orientationchange','komo:route-ready','komo:session-ready','komo:data-ready'].forEach(name=>window.addEventListener(name,()=>{clearTimeout(timer);timer=setTimeout(refresh,50)}));
  new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(refresh,55)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,700));setTimeout(refresh,1200);setTimeout(refresh,2200);
  window.KomoBottomNav={version:VERSION,refresh};
})();
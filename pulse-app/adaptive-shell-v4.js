/* KŌMØ Pulse — adaptive navigation shell v4
   Unified authenticated navigation for phone + iPad, with patient / professional / admin modes. */
(() => {
  const PHONE='(max-width: 767px)';
  const TABLET='(min-width: 768px) and (max-width: 1366px) and (hover: none) and (pointer: coarse)';
  let raf=0;
  let proActive='dashboard';

  const I={
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3.5 10.5 12 3l8.5 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
    tests:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 3.5h10v17H7z"/><path d="M9.5 8h5M9.5 12h5M9.5 16h3"/></svg>',
    results:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M12 12l4-3"/><path d="M7.5 16.5a6.4 6.4 0 0 1 9 0"/></svg>',
    follow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 17c3-5 5 2 8-3s5 2 8-5"/><circle cx="4" cy="17" r="1.5"/><circle cx="12" cy="14" r="1.5"/><circle cx="20" cy="9" r="1.5"/></svg>',
    more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
    center:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h7v7H4zM13 4h7v5h-7zM4 13h7v7H4zM13 11h7v9h-7z"/></svg>',
    patients:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M16 8h5M18.5 5.5v5"/></svg>',
    motion:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 16c3-6 5 3 8-3s5 3 10-5"/><circle cx="5" cy="16" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="20" cy="8" r="1.5"/></svg>',
    agenda:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7 3.5v4M17 3.5v4M3.5 10h17M8 14h3M14 14h3M8 17h3"/></svg>',
    admin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 5h14v14H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
    pro:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 20V8l8-4 8 4v12"/><path d="M8 20v-6h8v6M9 9h6"/></svg>'
  };

  function route(){return location.hash.replace(/^#/,'')||'home'}
  function isIPad(){return /iPad/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
  function adaptive(){return window.matchMedia(PHONE).matches||window.matchMedia(TABLET).matches||(isIPad()&&innerWidth>=768&&innerWidth<=1366)}
  function appVisible(){const a=document.querySelector('#appShell'),x=document.querySelector('#authScreen');return !!a&&!a.hidden&&(!x||x.hidden)}
  function role(){return window.KomoRuntime?.role||window.KomoRuntime?.getContext?.()?.role||'member'}
  function mode(){return route()==='admin'?'admin':route()==='clinical'?'pro':'patient'}
  function allowedPro(){return ['professional','admin'].includes(role())}
  function allowedAdmin(){return role()==='admin'}

  function setSurface(){
    const html=document.documentElement;
    if(!adaptive()||!appVisible()){
      delete html.dataset.adaptiveShell;
      delete html.dataset.adaptiveMode;
      return false;
    }
    html.dataset.adaptiveShell=window.matchMedia(PHONE).matches?'phone':'tablet';
    html.dataset.adaptiveMode=mode();
    return true;
  }

  function fireRoute(target){
    const next=`#${target}`;
    if(location.hash!==next) location.hash=target;
    else window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:target}}));
  }

  function patient(target='home'){
    document.querySelector('#modeSwitch [data-mode="member"]')?.click();
    requestAnimationFrame(()=>fireRoute(target));
  }

  function professional(section='dashboard'){
    if(!allowedPro())return;
    document.querySelector('#modeSwitch [data-mode="clinical"]')?.click();
    if(route()!=='clinical') fireRoute('clinical');
    proActive=section;
    const open=()=>window.KomoProArchitecture?.open?.(section);
    requestAnimationFrame(open);
    setTimeout(open,90);
  }

  function admin(){
    if(!allowedAdmin())return;
    fireRoute('admin');
    const announce=()=>window.dispatchEvent(new CustomEvent('komo:admin-open'));
    requestAnimationFrame(announce);setTimeout(announce,100);
  }

  function adminTab(tab){
    if(route()!=='admin'){admin();setTimeout(()=>adminTab(tab),180);return}
    const b=document.querySelector(`[data-admin-tab="${tab}"]`);if(b)b.click();
  }

  function closeSheet(){
    document.querySelector('#kamSheet')?.classList.remove('open');
    document.querySelector('#kamBackdrop')?.classList.remove('open');
    document.querySelector('#kamMore')?.setAttribute('aria-expanded','false');
    document.querySelector('#kamTopMenu')?.setAttribute('aria-expanded','false');
  }
  function openSheet(){
    const sheet=document.querySelector('#kamSheet'),back=document.querySelector('#kamBackdrop');if(!sheet||!back)return;
    sheet.classList.add('open');back.classList.add('open');
    document.querySelector('#kamMore')?.setAttribute('aria-expanded','true');
    document.querySelector('#kamTopMenu')?.setAttribute('aria-expanded','true');
  }

  function actionButton(label,action,extra=''){
    return `<button type="button" class="kam-sheet-action ${extra}" data-kam-action="${action}"><span>${label}</span><b>→</b></button>`;
  }

  function sheetContent(){
    const m=mode(),r=role();
    let primary='';
    if(m==='patient'){
      primary=actionButton('Rendez-vous','patient:documents')+actionButton('Messages','patient:messages');
      if(allowedPro()) primary+=actionButton('Espace professionnel','pro:dashboard');
      if(allowedAdmin()) primary+=actionButton('Administration','admin');
    }else if(m==='pro'){
      primary=actionButton('Analyse musculaire','pro:myocare')+actionButton('Messages','pro:messages')+actionButton('Espace patient','patient:home');
      if(allowedAdmin())primary+=actionButton('Administration','admin');
    }else{
      primary=actionButton('Espace professionnel','pro:dashboard')+actionButton('Espace patient','patient:home');
    }
    return `<div class="kam-sheet-handle"></div><div class="kam-sheet-head"><div><small>KŌMØ PULSE</small><strong>${m==='admin'?'Administration':m==='pro'?'Espace professionnel':'Votre espace'}</strong></div><button type="button" data-kam-close aria-label="Fermer">×</button></div><div class="kam-sheet-grid">${primary}</div><div class="kam-sheet-links"><a href="https://komolongevity.com/fr/" target="_blank" rel="noopener noreferrer">Site principal KŌMØ <span>↗</span></a><button type="button" data-kam-action="patient:profile">Mon compte <span>→</span></button><a href="https://komolongevity.com/fr/contact/" target="_blank" rel="noopener noreferrer">Aide & contact <span>↗</span></a><button type="button" class="kam-logout" data-kam-action="logout">Se déconnecter</button></div><p class="kam-sheet-role">Accès ${r==='admin'?'administrateur':r==='professional'?'professionnel':'patient'}</p>`;
  }

  function ensureSheet(){
    const app=document.querySelector('#appShell');if(!app)return;
    let back=document.querySelector('#kamBackdrop');if(!back){back=document.createElement('button');back.type='button';back.id='kamBackdrop';back.className='kam-backdrop';back.setAttribute('aria-label','Fermer le menu');back.addEventListener('click',closeSheet);app.appendChild(back)}
    let sheet=document.querySelector('#kamSheet');if(!sheet){sheet=document.createElement('aside');sheet.id='kamSheet';sheet.className='kam-sheet';sheet.setAttribute('aria-label','Menu KŌMØ Pulse');app.appendChild(sheet)}
    const signature=`${mode()}:${role()}`;
    if(sheet.dataset.signature!==signature){sheet.dataset.signature=signature;sheet.innerHTML=sheetContent()}
  }

  function ensureTopMenu(){
    const actions=document.querySelector('.topbar-actions');if(!actions)return;
    let b=document.querySelector('#kamTopMenu');if(!b){b=document.createElement('button');b.type='button';b.id='kamTopMenu';b.className='kam-top-menu';b.setAttribute('aria-label','Ouvrir le menu');b.setAttribute('aria-expanded','false');b.innerHTML='<span></span><span></span><span></span>';b.addEventListener('click',e=>{e.stopPropagation();document.querySelector('#kamSheet')?.classList.contains('open')?closeSheet():openSheet()});actions.appendChild(b)}
  }

  function roleButtons(){
    if(!allowedPro())return '';
    const m=mode();
    let html=`<button type="button" class="${m==='patient'?'active':''}" data-kam-role="patient">Patient</button><button type="button" class="${m==='pro'?'active':''}" data-kam-role="pro">Pro</button>`;
    if(allowedAdmin())html+=`<button type="button" class="${m==='admin'?'active':''}" data-kam-role="admin">Admin</button>`;
    return html;
  }

  function ensureRoleSwitch(){
    const top=document.querySelector('.topbar');if(!top)return;
    let row=document.querySelector('#kamRoleRow');
    if(!allowedPro()){
      row?.remove();return;
    }
    if(!row){row=document.createElement('div');row.id='kamRoleRow';row.className='kam-role-row';top.insertAdjacentElement('afterend',row)}
    const sig=`${mode()}:${role()}`;
    if(row.dataset.signature!==sig){row.dataset.signature=sig;row.innerHTML=`<div class="kam-role-switch" role="group" aria-label="Changer d'espace">${roleButtons()}</div>`}
  }

  function navItem(id,label,icon,active=false){return `<button type="button" class="kam-nav-item ${active?'active':''}" data-kam-nav="${id}" aria-label="${label}">${icon}<span>${label}</span></button>`}

  function currentAdminTab(){return document.querySelector('.kav2-tabs [data-admin-tab].active')?.dataset.adminTab||'patients'}
  function currentPro(){return document.querySelector('[data-pro-nav].active')?.dataset.proNav||proActive||'dashboard'}

  function navContent(){
    const m=mode();
    if(m==='pro'){
      const a=currentPro();
      return navItem('pro:dashboard','Centre',I.center,a==='dashboard')+navItem('pro:patients','Patients',I.patients,a==='patients')+navItem('pro:motion','Motion',I.motion,a==='motion')+navItem('pro:planning','Agenda',I.agenda,a==='planning')+navItem('more','Plus',I.more,false);
    }
    if(m==='admin'){
      const a=currentAdminTab();
      return navItem('admin:patients','Patients',I.patients,a==='patients')+navItem('admin:pros','Accès Pro',I.pro,a==='pros')+navItem('admin:motion','Demandes',I.motion,a==='motion')+navItem('pro:dashboard','Pro',I.center,false)+navItem('more','Plus',I.more,false);
    }
    const r=route();
    return navItem('patient:home','Accueil',I.home,r==='home')+navItem('patient:results','Tests',I.tests,r==='results')+navItem('patient:path','Résultats',I.results,r==='path')+navItem('patient:plan','Suivi',I.follow,r==='plan')+navItem('more','Plus',I.more,false);
  }

  function ensureBottom(){
    const app=document.querySelector('#appShell');if(!app)return;
    let nav=document.querySelector('#kamBottomBar');if(!nav){nav=document.createElement('nav');nav.id='kamBottomBar';nav.className='kam-bottom';nav.setAttribute('aria-label','Navigation principale');app.appendChild(nav)}
    const signature=`${mode()}:${route()}:${currentPro()}:${currentAdminTab()}:${role()}`;
    if(nav.dataset.signature!==signature){nav.dataset.signature=signature;nav.innerHTML=navContent()}
  }

  function handleAction(action){
    if(!action)return;
    closeSheet();
    if(action==='more'){openSheet();return}
    if(action==='logout'){document.querySelector('#logoutButton')?.click();return}
    const [scope,target]=action.split(':');
    if(scope==='patient')patient(target);
    else if(scope==='pro')professional(target);
    else if(scope==='admin'){if(target)adminTab(target);else admin()}
  }

  document.addEventListener('click',event=>{
    const nav=event.target.closest?.('[data-kam-nav]');if(nav){event.preventDefault();event.stopPropagation();handleAction(nav.dataset.kamNav);return}
    const action=event.target.closest?.('[data-kam-action]');if(action){event.preventDefault();event.stopPropagation();handleAction(action.dataset.kamAction);return}
    const roleButton=event.target.closest?.('[data-kam-role]');if(roleButton){event.preventDefault();event.stopPropagation();const x=roleButton.dataset.kamRole;if(x==='patient')patient('home');else if(x==='pro')professional('dashboard');else if(x==='admin')admin();return}
    if(event.target.closest?.('[data-kam-close]')){event.preventDefault();closeSheet()}
  },true);

  function refresh(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      if(!setSurface()){
        document.querySelector('#kamBottomBar')?.remove();document.querySelector('#kamRoleRow')?.remove();document.querySelector('#kamTopMenu')?.remove();document.querySelector('#kamSheet')?.remove();document.querySelector('#kamBackdrop')?.remove();return;
      }
      ensureTopMenu();ensureRoleSwitch();ensureSheet();ensureBottom();
    });
  }

  const observer=new MutationObserver(()=>refresh());
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
  ['hashchange','resize','orientationchange','pageshow','komo:route-ready','komo:session-ready','komo:session-cleared','komo:data-ready','komo:admin-open'].forEach(type=>window.addEventListener(type,refresh,{passive:true}));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,250));
  setTimeout(refresh,700);setTimeout(refresh,1500);
})();
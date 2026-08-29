/* KŌMØ Pulse — vertical mobile app runtime v2 */
(() => {
  'use strict';

  const PHONE='(max-width: 767px)';
  let timer=0;
  let appObserver=null;
  let viewObserver=null;
  let authObserver=null;
  let lastRoute='';
  let routeTimer=0;

  const phone=()=>window.matchMedia(PHONE).matches;
  const route=()=>location.hash.replace(/^#/,'')||'home';
  const app=()=>document.querySelector('#appShell');
  const auth=()=>document.querySelector('#authScreen');
  const root=()=>document.querySelector('#viewRoot');
  const shell=()=>document.querySelector('.main-shell');
  const appVisible=()=>!!app()&&!app().hidden&&(!auth()||auth().hidden);
  const authVisible=()=>!!auth()&&!auth().hidden;

  function syncViewport(){
    const height=Math.round(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight||0);
    if(height>0)document.documentElement.style.setProperty('--kamo-viewport-height',`${height}px`);
  }

  function syncModeClasses(){
    const isPhone=phone();
    document.documentElement.classList.toggle('kamo-phone-app',isPhone&&appVisible());
    document.documentElement.classList.toggle('kamo-phone-auth',isPhone&&authVisible());
    if(!isPhone){
      document.documentElement.classList.remove('kamo-menu-open');
    }
  }

  function menuLabel(){
    const button=document.querySelector('#kamTopMenu');
    if(!button)return;
    let label=button.querySelector('.kam-menu-label');
    if(!label){
      label=document.createElement('strong');
      label.className='kam-menu-label';
      button.appendChild(label);
    }
    label.textContent='Menu';
    button.setAttribute('aria-label','Ouvrir le menu principal');
  }

  function primaryNav(){
    const sheet=document.querySelector('#kamSheet');
    const bottom=document.querySelector('#kamBottomBar');
    if(!sheet||!bottom)return;

    const items=[...bottom.querySelectorAll('[data-kam-nav]')]
      .filter(item=>item.dataset.kamNav&&item.dataset.kamNav!=='more');
    if(!items.length)return;

    let title=sheet.querySelector('.kam-vertical-title');
    let nav=sheet.querySelector('.kam-vertical-primary');

    if(!title){
      title=document.createElement('div');
      title.className='kam-vertical-title';
      title.textContent='Navigation';
      sheet.querySelector('.kam-sheet-head')?.insertAdjacentElement('afterend',title);
    }
    if(!nav){
      nav=document.createElement('nav');
      nav.className='kam-vertical-primary';
      nav.setAttribute('aria-label','Navigation principale verticale');
      title.insertAdjacentElement('afterend',nav);
    }

    const signature=items.map(item=>[
      item.dataset.kamNav,
      item.classList.contains('active')?'1':'0',
      item.textContent.trim()
    ].join(':')).join('|');

    if(nav.dataset.signature===signature)return;
    nav.dataset.signature=signature;
    nav.innerHTML=items.map(item=>item.outerHTML).join('');
  }

  function lockMenuState(){
    const open=!!document.querySelector('#kamSheet.open');
    document.documentElement.classList.toggle('kamo-menu-open',phone()&&appVisible()&&open);
  }

  function closeMenuOnRoute(){
    document.querySelector('#kamSheet')?.classList.remove('open');
    document.querySelector('#kamBackdrop')?.classList.remove('open');
    document.querySelector('#kamMore')?.setAttribute('aria-expanded','false');
    document.querySelector('#kamTopMenu')?.setAttribute('aria-expanded','false');
    document.documentElement.classList.remove('kamo-menu-open');
  }

  function normalizeScroll(){
    const main=shell();
    if(main&&main.scrollLeft!==0)main.scrollLeft=0;
    if(document.scrollingElement&&document.scrollingElement.scrollLeft!==0)document.scrollingElement.scrollLeft=0;
  }

  function stackTablists(){
    const view=root();
    if(!view)return;
    const selectors=[
      '.kcp-tabs',
      '.kav2-tabs',
      '.pro-tabs',
      '.center-tabs',
      '.booking-tabs',
      '.account-tabs',
      '[role="tablist"]'
    ];
    view.querySelectorAll(selectors.join(',')).forEach(tablist=>{
      if(tablist.closest('.kam-sheet'))return;
      tablist.dataset.mobileStackTabs='1';
    });
  }

  function annotateTables(){
    const view=root();
    if(!view||!phone())return;

    view.querySelectorAll('table').forEach(table=>{
      const headers=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
      const rows=[...table.querySelectorAll('tbody tr')];
      if(!rows.length)return;

      table.classList.add('kamo-mobile-table');
      rows.forEach(row=>{
        [...row.children].forEach((cell,index)=>{
          if(cell.tagName!=='TD')return;
          const label=headers[index]||cell.getAttribute('data-label')||'';
          if(cell.dataset.mobileLabel!==label)cell.dataset.mobileLabel=label;
        });
      });
    });
  }

  function centerLegacyControls(){
    const view=root();
    if(!view)return;
    view.querySelectorAll('.kav2-refresh,.kcp-search').forEach(el=>{
      el.setAttribute('data-kamo-mobile-control','1');
    });
  }

  function routeTransition(force=false){
    const current=route();
    if(!force&&current===lastRoute)return;
    lastRoute=current;
    closeMenuOnRoute();

    const view=root();
    const main=shell();
    if(main)main.scrollTo({top:0,left:0,behavior:'auto'});
    if(!view)return;

    clearTimeout(routeTimer);
    view.classList.remove('kamo-route-enter');
    view.classList.add('kamo-route-changing');
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        view.classList.remove('kamo-route-changing');
        view.classList.add('kamo-route-enter');
        routeTimer=setTimeout(()=>view.classList.remove('kamo-route-enter'),280);
      });
    });
  }

  function patch(){
    syncViewport();
    syncModeClasses();

    if(!phone())return;

    if(appVisible()){
      menuLabel();
      primaryNav();
      lockMenuState();
      stackTablists();
      annotateTables();
      centerLegacyControls();
      normalizeScroll();
    }else{
      document.documentElement.classList.remove('kamo-menu-open');
    }
  }

  function schedule(delay=32){
    clearTimeout(timer);
    timer=setTimeout(patch,delay);
  }

  function bindObservers(){
    const application=app();
    const authScreen=auth();
    const view=root();

    if(application&&!appObserver){
      appObserver=new MutationObserver(()=>schedule(28));
      appObserver.observe(application,{
        childList:true,
        subtree:true,
        attributes:true,
        attributeFilter:['hidden','class','data-signature']
      });
    }

    if(authScreen&&!authObserver){
      authObserver=new MutationObserver(()=>schedule(18));
      authObserver.observe(authScreen,{
        childList:true,
        subtree:true,
        attributes:true,
        attributeFilter:['hidden','class']
      });
    }

    if(view&&!viewObserver){
      viewObserver=new MutationObserver(()=>schedule(34));
      viewObserver.observe(view,{childList:true,subtree:true});
    }
  }

  function onRoute(){
    routeTransition();
    schedule(20);
  }

  function onFocus(event){
    if(!phone())return;
    const field=event.target.closest?.('input,select,textarea');
    if(!field)return;
    setTimeout(()=>{
      try{field.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'})}catch{}
    },180);
  }

  function init(){
    syncViewport();
    bindObservers();
    lastRoute=route();
    patch();
    setTimeout(patch,180);
    setTimeout(patch,520);
    setTimeout(patch,1100);
  }

  ['hashchange','komo:route-ready','komo:admin-open'].forEach(name=>window.addEventListener(name,onRoute,{passive:true}));
  ['komo:session-ready','komo:session-cleared','komo:data-ready','pageshow'].forEach(name=>window.addEventListener(name,()=>schedule(18),{passive:true}));
  window.addEventListener('resize',()=>schedule(16),{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(()=>schedule(0),90),{passive:true});
  window.visualViewport?.addEventListener('resize',()=>schedule(0),{passive:true});
  document.addEventListener('focusin',onFocus,{passive:true});
  document.addEventListener('DOMContentLoaded',init,{once:true});

  if(document.readyState!=='loading')init();
})();

/* KŌMØ Pulse — vertical phone navigation v1 */
(() => {
  'use strict';

  const PHONE='(max-width: 767px)';
  let timer=0,observer=null;
  const route=()=>location.hash.replace(/^#/,'')||'home';
  const phone=()=>window.matchMedia(PHONE).matches;
  const appVisible=()=>{const app=document.querySelector('#appShell'),auth=document.querySelector('#authScreen');return !!app&&!app.hidden&&(!auth||auth.hidden)};

  function menuLabel(){
    const button=document.querySelector('#kamTopMenu');
    if(!button||button.querySelector('.kam-menu-label'))return;
    const label=document.createElement('strong');
    label.className='kam-menu-label';
    label.textContent='Menu';
    button.appendChild(label);
    button.setAttribute('aria-label','Ouvrir le menu principal');
  }

  function primaryNav(){
    const sheet=document.querySelector('#kamSheet');
    const bottom=document.querySelector('#kamBottomBar');
    if(!sheet||!bottom)return;
    const items=[...bottom.querySelectorAll('[data-kam-nav]')].filter(x=>x.dataset.kamNav!=='more');
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
      nav.setAttribute('aria-label','Navigation verticale');
      title.insertAdjacentElement('afterend',nav);
    }
    const signature=items.map(x=>`${x.dataset.kamNav}:${x.classList.contains('active')?1:0}:${x.textContent.trim()}`).join('|');
    if(nav.dataset.signature===signature)return;
    nav.dataset.signature=signature;
    nav.innerHTML=items.map(x=>x.outerHTML).join('');
  }

  function lockState(){
    const sheet=document.querySelector('#kamSheet');
    document.documentElement.classList.toggle('kamo-menu-open',!!sheet?.classList.contains('open'));
  }

  function normalizeScroll(){
    const shell=document.querySelector('.main-shell');
    if(shell&&shell.scrollLeft!==0)shell.scrollLeft=0;
    if(document.scrollingElement&&document.scrollingElement.scrollLeft!==0)document.scrollingElement.scrollLeft=0;
  }

  function patch(){
    if(!phone()||!appVisible()){
      document.documentElement.classList.remove('kamo-menu-open');
      return;
    }
    menuLabel();
    primaryNav();
    lockState();
    normalizeScroll();
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(patch,35);
  }

  function bindObserver(){
    if(observer)return;
    observer=new MutationObserver(schedule);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','data-signature']});
  }

  ['hashchange','resize','orientationchange','pageshow','komo:route-ready','komo:session-ready','komo:data-ready','komo:admin-open'].forEach(name=>window.addEventListener(name,schedule,{passive:true}));
  document.addEventListener('DOMContentLoaded',()=>{bindObserver();setTimeout(patch,250)});
  bindObserver();
  setTimeout(patch,600);
  setTimeout(patch,1200);
})();

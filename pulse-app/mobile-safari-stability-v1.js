/* KŌMØ Pulse — Safari/mobile stability runtime v1 */
(() => {
  'use strict';

  const phone=()=>matchMedia('(max-width: 767px)').matches;
  const app=()=>document.querySelector('#appShell');
  const auth=()=>document.querySelector('#authScreen');
  const main=()=>document.querySelector('.main-shell');

  function topNow(){
    if(!phone())return;
    try{history.scrollRestoration='manual'}catch{}
    try{window.scrollTo(0,0)}catch{}
    try{if(document.scrollingElement)document.scrollingElement.scrollTop=0}catch{}
    try{if(document.documentElement)document.documentElement.scrollTop=0}catch{}
    try{if(document.body)document.body.scrollTop=0}catch{}
    try{auth()?.scrollTo({top:0,left:0,behavior:'auto'})}catch{if(auth())auth().scrollTop=0}
    try{main()?.scrollTo({top:0,left:0,behavior:'auto'})}catch{if(main())main().scrollTop=0}
  }

  function reconcile(){
    if(!phone())return;
    const a=app(),login=auth();
    // If the application is already visible, the login surface may never coexist
    // with it. This is especially important on Safari/BFCache restores.
    if(a&&!a.hidden&&login&&!login.hidden)login.hidden=true;
    document.documentElement.classList.toggle('kamo-phone-app',!!a&&!a.hidden&&(!login||login.hidden));
    document.documentElement.classList.toggle('kamo-phone-auth',!!login&&!login.hidden);
  }

  function hardTop(){
    topNow();
    requestAnimationFrame(topNow);
    setTimeout(topNow,40);
    setTimeout(topNow,160);
  }

  window.addEventListener('pageshow',()=>{
    reconcile();
    hardTop();
  },{passive:true});
  window.addEventListener('pagehide',topNow,{passive:true});
  window.addEventListener('hashchange',()=>{
    reconcile();
    hardTop();
  },{passive:true});
  ['komo:session-ready','komo:data-ready','komo:route-ready','komo:admin-open'].forEach(name=>{
    window.addEventListener(name,()=>{reconcile();hardTop()},{passive:true});
  });
  document.addEventListener('DOMContentLoaded',()=>{reconcile();hardTop()},{once:true});

  if(document.readyState!=='loading'){
    reconcile();
    hardTop();
  }
})();

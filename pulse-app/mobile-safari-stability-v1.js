/* KŌMØ Pulse — Safari/mobile stability runtime v2 */
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

  window.addEventListener('pageshow',event=>{
    if(phone()&&event.persisted){
      // Safari may restore an entire obsolete Pulse DOM from BFCache instead of
      // requesting the current no-store HTML. Reload once so the active release
      // and its cache-busted assets are guaranteed to be used.
      location.reload();
      return;
    }
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

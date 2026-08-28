/* KŌMØ Pulse — My KŌMØ dedicated route guard v1 */
(() => {
  const route=()=>location.hash.replace(/^#/,'')||'home';
  const style=document.createElement('style');
  style.id='myKomoRouteGuardStyle';
  style.textContent=`body.mykomo-route-pending #viewRoot{visibility:hidden!important;min-height:620px!important}body.mykomo-route-pending #pageEyebrow,body.mykomo-route-pending #pageTitle{visibility:hidden!important}`;
  document.head.appendChild(style);
  const hold=()=>{if(route()==='mykomo')document.body.classList.add('mykomo-route-pending');else document.body.classList.remove('mykomo-route-pending')};
  hold();
  window.addEventListener('hashchange',hold,true);
  window.KomoMyKomoRouteGuard={release(){document.body.classList.remove('mykomo-route-pending')},hold};
})();
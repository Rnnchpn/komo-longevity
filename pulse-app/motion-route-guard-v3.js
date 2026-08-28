/* KŌMØ Pulse — dedicated Motion route guard v3 */
(() => {
  const route=()=>location.hash.replace(/^#/,'')||'home';
  const style=document.createElement('style');
  style.id='komoMotionRouteGuardV3Style';
  style.textContent=`
    body.kmotion-route-pending #viewRoot{visibility:hidden!important;min-height:620px!important}
    body.kmotion-route-pending #pageEyebrow,body.kmotion-route-pending #pageTitle{visibility:hidden!important}
  `;
  document.head.appendChild(style);
  const hold=()=>document.body.classList.toggle('kmotion-route-pending',route()==='motion');
  hold();
  window.addEventListener('hashchange',hold,true);
  window.KomoMotionRouteGuard={
    version:'3.0.0',
    hold,
    release(){document.body.classList.remove('kmotion-route-pending')}
  };
})();
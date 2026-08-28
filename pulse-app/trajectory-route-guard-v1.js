/* KŌMØ Pulse — dedicated Trajectoire route guard v1 */
(() => {
  const route=()=>location.hash.replace(/^#/,'')||'home';
  const memberMode=()=>{
    const member=document.querySelector('#modeSwitch [data-mode="member"]');
    const clinical=document.querySelector('#modeSwitch [data-mode="clinical"]');
    if(member?.classList.contains('active')) return true;
    if(clinical?.classList.contains('active')) return false;
    return true;
  };
  const style=document.createElement('style');
  style.id='komoTrajectoryGuardStyle';
  style.textContent=`body.komo-trajectory-pending #viewRoot{visibility:hidden!important;min-height:620px!important}body.komo-trajectory-pending #pageEyebrow,body.komo-trajectory-pending #pageTitle{visibility:hidden!important}`;
  document.head.appendChild(style);

  const migrate=()=>{
    if(route()==='path'&&memberMode()){
      history.replaceState(null,'',`${location.pathname}${location.search}#trajectory`);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      return true;
    }
    return false;
  };
  const hold=()=>{
    if(migrate()) return;
    document.body.classList.toggle('komo-trajectory-pending',route()==='trajectory');
  };

  document.addEventListener('click',event=>{
    if(!memberMode())return;
    const trigger=event.target.closest?.('[data-route="path"],[data-mkv3-route="path"]');
    if(!trigger)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.hash='trajectory';
  },true);

  hold();
  window.addEventListener('hashchange',hold,true);
  window.KomoTrajectoryRouteGuard={
    release(){document.body.classList.remove('komo-trajectory-pending')},
    hold,
    version:'1.0.0'
  };
})();
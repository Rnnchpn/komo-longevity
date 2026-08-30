/* KŌMØ Pulse — compact role controls v1
   Presentation-only enhancement of existing Patient / Pro / Admin access.
   It never grants a role: visibility is inherited from the canonical controls. */
(() => {
  'use strict';
  const VERSION='1.0.0';
  let observer=null;

  function decorate(){
    const top=document.querySelector('.topbar');
    const actions=top?.querySelector('.topbar-actions');
    const mode=actions?.querySelector('#modeSwitch');
    if(!top||!actions||!mode)return;

    top.dataset.roleBar='1';
    actions.dataset.roleBarActions='1';

    const member=mode.querySelector('[data-mode="member"]');
    const pro=mode.querySelector('[data-mode="clinical"]');
    if(member)member.textContent='Patient';
    if(pro)pro.textContent='Pro';

    const admin=actions.querySelector('[data-admin-shortcut]');
    if(admin){
      admin.textContent='Admin';
      admin.classList.add('kp-role-admin');
    }

    mode.classList.add('kp-role-switch');
    const refresh=actions.querySelector('#refreshButton');
    if(refresh){refresh.classList.add('kp-top-refresh');refresh.title='Actualiser';}
  }

  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(decorate))}
  ['komo:session-ready','komo:data-ready','komo:route-ready','hashchange','pageshow'].forEach(name=>window.addEventListener(name,schedule));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(decorate,450));
  const actions=document.querySelector('.topbar-actions');
  if(actions){observer=new MutationObserver(schedule);observer.observe(actions,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});}
  setTimeout(decorate,1100);
  window.KomoPulseTopbarRoles={version:VERSION,refresh:decorate};
})();

/* KŌMØ Pulse — Center owner UI guard v1
   Mirrors the backend ownership boundary: only a center owner or global admin
   may create, edit or remove an owner membership. */
(() => {
  'use strict';
  const ORG_KEY='komo_clinical_org';
  let timer=0,lastKey='',canOwn=false;

  const client=()=>window.KomoRuntime?.client||null;
  const route=()=>location.hash.replace(/^#/,'')||'home';

  async function resolve(){
    if(route()!=='clinical')return false;
    const c=client(),organizationId=localStorage.getItem(ORG_KEY)||'';
    if(!c||!organizationId)return false;
    const ctx=window.KomoRuntime?.getContext?.();
    const session=ctx?.session||(await c.auth.getSession()).data?.session;
    if(!session?.user)return false;
    const role=ctx?.role||(await c.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle()).data?.role||'member';
    if(role==='admin')return true;
    const m=await c.from('organization_members').select('role,status').eq('organization_id',organizationId).eq('user_id',session.user.id).eq('status','active').maybeSingle();
    return m.data?.role==='owner';
  }

  function apply(){
    const root=document.querySelector('[data-center-console-v2]');
    if(!root)return;
    root.dataset.ownerAdmin=canOwn?'1':'0';
    root.querySelectorAll('[data-kcc-member]').forEach(row=>{
      const role=row.querySelector('[data-role]');
      const scope=row.querySelector('[data-scope]');
      const save=row.querySelector('[data-member-save]');
      const remove=row.querySelector('[data-member-remove]');
      if(!role)return;
      const targetOwner=role.value==='owner';
      if(!canOwn){
        [...role.options].filter(o=>o.value==='owner'&&!targetOwner).forEach(o=>o.remove());
        if(targetOwner){
          role.disabled=true;
          if(scope)scope.disabled=true;
          if(save)save.hidden=true;
          if(remove)remove.hidden=true;
          row.setAttribute('aria-label','Propriétaire du centre — modification réservée au propriétaire');
        }
      }
    });
  }

  async function refresh(){
    if(route()!=='clinical')return;
    const org=localStorage.getItem(ORG_KEY)||'',user=window.KomoRuntime?.getContext?.()?.session?.user?.id||'';
    const key=`${org}:${user}`;
    if(key!==lastKey){
      lastKey=key;
      try{canOwn=await resolve()}catch(e){canOwn=false;console.warn('[center-owner-ui-guard]',e)}
    }
    apply();
  }

  function schedule(ms=60){clearTimeout(timer);timer=setTimeout(refresh,ms)}
  document.addEventListener('DOMContentLoaded',()=>schedule(700));
  ['hashchange','komo:route-ready','komo:data-ready','komo:center-context-changed'].forEach(e=>window.addEventListener(e,()=>{lastKey='';schedule(80)}));
  const root=document.querySelector('#viewRoot');
  if(root)new MutationObserver(()=>schedule(30)).observe(root,{childList:true,subtree:true});
  setTimeout(()=>schedule(0),1200);
  window.KomoCenterOwnerGuard={refresh:()=>{lastKey='';schedule(0)}};
})();

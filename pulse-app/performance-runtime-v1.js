import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const R=window.KomoRuntime=window.KomoRuntime||{};
if(!R.client){const store=localStorage.getItem(REM)==='1'?localStorage:sessionStorage;R.client=createClient(URL,KEY,{auth:{storage:store,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}
R.session=R.session||null;R.role=R.role||'member';R.userId=R.userId||null;R.ready=!!R.session;
let rolePromise=null,authSubscription=null,syncPromise=null,lastSyncAt=0;
const SESSION_SYNC_TTL=2000;

async function hydrate(session,forcedRole=null){
  const previous=R.userId;
  R.session=session||null;R.userId=session?.user?.id||null;
  if(!session?.user){
    R.role='member';R.ready=true;
    if(previous)window.dispatchEvent(new CustomEvent('komo:session-cleared'));
    return R;
  }
  if(forcedRole){R.role=forcedRole;R.ready=true;window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session:R.session,role:R.role}}));return R}
  if(!rolePromise)rolePromise=R.client.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle().then(x=>x.data?.role||'member').catch(()=> 'member').finally(()=>{rolePromise=null});
  R.role=await rolePromise;R.ready=true;window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session:R.session,role:R.role}}));return R;
}

function bindAuth(){
  try{authSubscription?.unsubscribe?.()}catch{}
  authSubscription=null;
  const result=R.client?.auth?.onAuthStateChange?.((_event,session)=>{lastSyncAt=Date.now();hydrate(session||null).catch(()=>{})});
  authSubscription=result?.data?.subscription||result?.subscription||null;
}

async function syncSession(force=false){
  if(syncPromise)return syncPromise;
  const now=Date.now();
  if(!force&&R.ready&&now-lastSyncAt<SESSION_SYNC_TTL)return R.session||null;
  syncPromise=(async()=>{
    try{
      const {data}=await R.client.auth.getSession();
      const session=data?.session||null;
      lastSyncAt=Date.now();
      if(session?.user?.id!==R.userId||(!R.session&&session))await hydrate(session);
      return session;
    }catch{return R.session||null}
  })().finally(()=>{syncPromise=null});
  return syncPromise;
}

R.setContext=(session,role=null)=>{lastSyncAt=Date.now();return hydrate(session,role)};
R.adoptClient=(client)=>{if(client&&client!==R.client){R.client=client;bindAuth();syncSession(true).catch(()=>{})}return R.client};
R.getContext=()=>({client:R.client,session:R.session,role:R.role,ready:R.ready});
R.route=()=>location.hash.replace(/^#/,'')||'home';
R.syncSession=syncSession;

function routeReady(){window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:R.route()}}))}
function refreshSession(force=false){syncSession(force).catch(()=>{})}

bindAuth();
// Route changes do not require another auth read: Supabase auto-refresh and the auth
// subscription own session changes. This keeps navigation local and immediate.
window.addEventListener('hashchange',()=>requestAnimationFrame(routeReady));
window.addEventListener('pageshow',()=>refreshSession(true));
window.addEventListener('focus',()=>refreshSession(false));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSession(false)});
document.addEventListener('DOMContentLoaded',()=>{requestAnimationFrame(routeReady);refreshSession(false)});
refreshSession(true);

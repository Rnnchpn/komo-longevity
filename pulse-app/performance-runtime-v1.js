import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const R=window.KomoRuntime=window.KomoRuntime||{};
if(!R.client){const store=localStorage.getItem(REM)==='1'?localStorage:sessionStorage;R.client=createClient(URL,KEY,{auth:{storage:store,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}
R.session=R.session||null;R.role=R.role||'member';R.userId=R.userId||null;R.ready=!!R.session;
let rolePromise=null;
async function hydrate(session,forcedRole=null){R.session=session||null;R.userId=session?.user?.id||null;if(!session?.user){R.role='member';R.ready=true;window.dispatchEvent(new CustomEvent('komo:session-cleared'));return R}
 if(forcedRole){R.role=forcedRole;R.ready=true;window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session:R.session,role:R.role}}));return R}
 if(!rolePromise)rolePromise=R.client.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle().then(x=>x.data?.role||'member').catch(()=> 'member').finally(()=>{rolePromise=null});
 R.role=await rolePromise;R.ready=true;window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session:R.session,role:R.role}}));return R}
R.setContext=(session,role=null)=>hydrate(session,role);
R.adoptClient=(client)=>{if(client)R.client=client;return R.client};
R.getContext=()=>({client:R.client,session:R.session,role:R.role,ready:R.ready});
R.route=()=>location.hash.replace(/^#/,'')||'home';
function routeReady(){window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:R.route()}}))}
window.addEventListener('hashchange',()=>requestAnimationFrame(routeReady));
document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(routeReady));
R.client.auth.getSession().then(({data})=>hydrate(data?.session||null)).catch(()=>{});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
const URL='https://uqlolefsiktbznnymriy.supabase.co',KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n',REM='komo_pulse_remember';
let client=null,role=null,userId=null,timer=null;
function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
async function isAdmin(){const {data:{session}}=await sb().auth.getSession();if(!session?.user)return false;if(session.user.id===userId&&role)return role==='admin';userId=session.user.id;const r=await sb().from('account_roles').select('role').eq('user_id',userId).maybeSingle();role=r.data?.role||'member';return role==='admin'}
function announceOpen(){window.dispatchEvent(new CustomEvent('komo:admin-open'))}
function openAdmin(){if(location.hash!=='#admin')location.hash='admin';announceOpen();setTimeout(announceOpen,80);setTimeout(announceOpen,260)}
function mountTop(){const actions=document.querySelector('.topbar-actions');if(!actions||actions.querySelector('[data-admin-shortcut]'))return;const b=document.createElement('button');b.type='button';b.dataset.adminShortcut='1';b.className='admin-shortcut';b.textContent='Admin';b.setAttribute('aria-label','Ouvrir la console Administration KŌMØ');b.addEventListener('click',openAdmin);actions.insertBefore(b,actions.firstChild)}
function mountAccount(){const pop=document.querySelector('#accountPopover');if(!pop||pop.querySelector('[data-admin-account]'))return;const a=document.createElement('a');a.href='#admin';a.dataset.adminAccount='1';a.textContent='Console Admin';a.addEventListener('click',e=>{e.preventDefault();pop.hidden=true;openAdmin()});const profile=pop.querySelector('[data-route="profile"]');if(profile)profile.insertAdjacentElement('afterend',a);else pop.prepend(a)}
async function refresh(){const shell=document.querySelector('#appShell');if(!shell||shell.hidden)return;if(await isAdmin()){mountTop();mountAccount();if(location.hash==='#admin')announceOpen()}}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>refresh().catch(console.error),80)}
const obs=new MutationObserver(schedule);obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});window.addEventListener('hashchange',schedule);window.addEventListener('pageshow',schedule);document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,500));setTimeout(schedule,900);

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const VERSION='1.0.0';
let client=null,busy=false,retry=0,timer=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(client||(client=createClient(SUPABASE_URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function route(){return location.hash.replace(/^#/,'').split('?')[0]||'home'}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function toast(msg){const t=document.querySelector('#toast');if(!t)return;t.textContent=msg;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,3000)}
function style(){if(document.querySelector('#komoClubIncomingStyle'))return;const s=document.createElement('style');s.id='komoClubIncomingStyle';s.textContent=`.kci{margin:0 0 14px;border:1px solid rgba(126,145,132,.28);border-radius:18px;padding:14px;background:rgba(245,242,234,.72)}.kci-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}.kci-head strong{font-size:12px}.kci-head span{font-size:9px;letter-spacing:.12em;text-transform:uppercase;opacity:.62}.kci-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 0;border-top:1px solid rgba(126,145,132,.18)}.kci-row:first-of-type{border-top:0}.kci-person{min-width:0}.kci-person strong,.kci-person small{display:block}.kci-person strong{font-size:12px}.kci-person small{font-size:10px;opacity:.62;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px}.kci-actions{display:flex;gap:7px;flex:0 0 auto}.kci-actions button{border:1px solid rgba(126,145,132,.38);background:transparent;border-radius:10px;padding:8px 10px;font:700 10px DM Sans,system-ui;cursor:pointer}.kci-actions button[data-kci-action="accept"]{background:#26372d;color:#fff;border-color:#26372d}.kci-actions button:disabled{opacity:.45;cursor:wait}@media(max-width:600px){.kci-row{align-items:flex-start;flex-direction:column}.kci-actions{width:100%}.kci-actions button{flex:1}}`;document.head.appendChild(s)}

async function pendingRequests(uid){
  const q=await sb().from('komo_social_connections').select('id,requester_id,addressee_id,status,created_at').eq('addressee_id',uid).eq('status','pending').order('created_at',{ascending:false});
  if(q.error)throw q.error;
  const rows=q.data||[];
  if(!rows.length)return[];
  const ids=[...new Set(rows.map(x=>x.requester_id).filter(Boolean))];
  const p=await sb().from('komo_social_profiles').select('user_id,handle,display_name,bio').in('user_id',ids);
  if(p.error)throw p.error;
  const map=new Map((p.data||[]).map(x=>[x.user_id,x]));
  return rows.map(x=>({...x,profile:map.get(x.requester_id)||null}));
}

function html(rows){return `<section class="kci" data-komo-club-incoming><div class="kci-head"><strong>Demandes reçues</strong><span>${rows.length} en attente</span></div>${rows.map(r=>{const p=r.profile||{};const name=p.display_name||'Membre KŌMØ';const handle=p.handle?`@${esc(p.handle)}`:'Profil KŌMØ';return `<div class="kci-row" data-kci-row="${esc(r.id)}"><div class="kci-person"><strong>${esc(name)}</strong><small>${handle}${p.bio?` · ${esc(p.bio)}`:''}</small></div><div class="kci-actions"><button type="button" data-kci-action="decline" data-kci-id="${esc(r.id)}">Refuser</button><button type="button" data-kci-action="accept" data-kci-id="${esc(r.id)}">Accepter</button></div></div>`}).join('')}</section>`}

async function mount(force=false){
  clearTimeout(timer);
  timer=setTimeout(async()=>{
    if(route()!=='club'){retry=0;return}
    const host=document.querySelector('#kclubPeople');
    if(!host){if(retry<6){retry++;mount(true)}return}
    retry=0;
    const {data:{session}}=await sb().auth.getSession();
    const uid=session?.user?.id;if(!uid)return;
    try{
      const rows=await pendingRequests(uid);
      document.querySelector('[data-komo-club-incoming]')?.remove();
      if(!rows.length)return;
      style();host.insertAdjacentHTML('beforebegin',html(rows));
    }catch(e){console.error('[club-incoming-connections-v1]',e)}
  },force?80:180)
}

async function decide(id,status,button){
  if(busy||!['accepted','declined'].includes(status))return;
  busy=true;
  const row=button?.closest('[data-kci-row]');
  row?.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{
    const {data:{session}}=await sb().auth.getSession();const uid=session?.user?.id;if(!uid)throw new Error('Session requise.');
    const q=await sb().from('komo_social_connections').update({status,updated_at:new Date().toISOString()}).eq('id',id).eq('addressee_id',uid).eq('status','pending').select('id,status').maybeSingle();
    if(q.error)throw q.error;if(!q.data)throw new Error('Cette demande n’est plus disponible.');
    toast(status==='accepted'?'Connexion acceptée.':'Demande refusée.');
    window.dispatchEvent(new CustomEvent('komo:club-connection-updated',{detail:{id,status}}));
    await window.KomoClub?.refresh?.();
    setTimeout(()=>mount(true),220);
  }catch(e){toast(e?.message||'Action impossible.');row?.querySelectorAll('button').forEach(b=>b.disabled=false)}finally{busy=false}
}

document.addEventListener('click',e=>{const b=e.target.closest?.('[data-kci-action][data-kci-id]');if(!b)return;e.preventDefault();e.stopPropagation();decide(b.dataset.kciId,b.dataset.kciAction==='accept'?'accepted':'declined',b)},true);
['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:session-ready','komo:club-connection-updated'].forEach(ev=>window.addEventListener(ev,()=>mount(true)));
document.addEventListener('DOMContentLoaded',()=>mount(true));
setTimeout(()=>mount(true),1200);
window.KomoClubIncomingConnections={version:VERSION,refresh:()=>mount(true)};

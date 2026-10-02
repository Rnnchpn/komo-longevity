import {supabase,getSession,getAccountRole,connectPulse,onSession} from '/world/komo-world-auth-v1.js?v=1';

const qs=new URLSearchParams(location.search);
const requested=qs.get('admin')==='1'||qs.get('members')==='1';
let role=null,members=[],requests={ask:[],events:[],experiences:[]};

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function css(){
  if(document.querySelector('#kwiMembersStyle'))return;
  const s=document.createElement('style');s.id='kwiMembersStyle';s.textContent=`
  .kwi-members-launch{position:fixed;z-index:1200;right:18px;bottom:18px;height:42px;padding:0 15px;border:1px solid rgba(255,255,255,.8);border-radius:14px;background:#2f302d;color:#fff;box-shadow:0 14px 38px rgba(20,25,22,.2);font:800 9px Inter,sans-serif;letter-spacing:.08em}
  .kwi-members-shell{position:fixed;z-index:1300;inset:0;display:none}.kwi-members-shell.open{display:block}.kwi-members-backdrop{position:absolute;inset:0;background:rgba(22,25,22,.26);backdrop-filter:blur(3px)}
  .kwi-members-panel{position:absolute;right:14px;top:14px;bottom:14px;width:min(720px,calc(100vw - 28px));border:1px solid rgba(255,255,255,.82);border-radius:27px;background:#f3f0e8;box-shadow:0 32px 90px rgba(18,22,19,.22);overflow:hidden;display:grid;grid-template-rows:auto auto 1fr;color:#1b1d1a}
  .kwi-members-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:20px;border-bottom:1px solid rgba(30,32,29,.1)}.kwi-members-head p{margin:0;font-size:8px;letter-spacing:.18em;font-weight:850;color:#7b766e}.kwi-members-head h2{margin:7px 0 0;font:500 28px/1 Georgia,serif}.kwi-close{width:36px;height:36px;border:0;border-radius:11px;background:#e6e0d5;font-size:19px}
  .kwi-tabs{display:flex;gap:6px;padding:9px 12px;border-bottom:1px solid rgba(30,32,29,.1)}.kwi-tabs button{height:34px;padding:0 12px;border:0;border-radius:11px;background:transparent;font-size:8px;font-weight:800}.kwi-tabs button.active{background:#30312e;color:#fff}
  .kwi-body{overflow:auto;padding:12px}.kwi-member{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(110px,.7fr) auto;gap:10px;align-items:center;padding:11px;margin-bottom:7px;border:1px solid rgba(30,32,29,.1);border-radius:16px;background:#fff}.kwi-member b{font-size:11px}.kwi-member small{display:block;margin-top:4px;color:#777269;font-size:8px}.kwi-tier{font-size:8px;font-weight:850;letter-spacing:.08em}.kwi-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.kwi-actions button{height:30px;border:1px solid rgba(30,32,29,.11);border-radius:9px;background:#f2eee6;padding:0 8px;font-size:7px;font-weight:850}.kwi-actions button.dark{background:#343532;color:#fff}.kwi-actions button.warn{color:#875d56}
  .kwi-request{padding:13px;margin-bottom:8px;border:1px solid rgba(30,32,29,.1);border-radius:16px;background:#fff}.kwi-request .ey{font-size:7px;letter-spacing:.14em;color:#7a756d;font-weight:800}.kwi-request b{display:block;margin-top:6px;font-size:11px}.kwi-request p{font-size:10px;line-height:1.45;color:#666159}.kwi-request textarea{width:100%;min-height:74px;border:1px solid rgba(30,32,29,.11);border-radius:11px;padding:9px;background:#f8f6f0;font-size:10px}.kwi-request button{margin-top:7px;height:32px;border:0;border-radius:9px;background:#30312e;color:#fff;padding:0 10px;font-size:7px;font-weight:850}.kwi-auth{padding:28px;text-align:center}.kwi-auth h3{font:500 27px/1 Georgia,serif}.kwi-auth p{font-size:10px;color:#706b63}.kwi-auth button{height:42px;border:0;border-radius:12px;background:#30312e;color:#fff;padding:0 14px;font-size:8px;font-weight:850}
  .kwi-token{margin-top:10px;padding:10px;border-radius:11px;background:#ebe5da;font-size:8px;word-break:break-all}.kwi-empty{padding:24px;text-align:center;color:#766f66;font-size:10px}
  @media(max-width:700px){.kwi-members-launch{right:12px;bottom:calc(238px + env(safe-area-inset-bottom))}.kwi-members-panel{left:8px;right:8px;top:calc(8px + env(safe-area-inset-top));bottom:calc(8px + env(safe-area-inset-bottom));width:auto}.kwi-member{grid-template-columns:1fr}.kwi-actions{justify-content:flex-start}}
  `;document.head.appendChild(s);
}
function mount(){
  css();
  if(!document.querySelector('#kwiMembersLaunch')){
    const b=document.createElement('button');b.id='kwiMembersLaunch';b.className='kwi-members-launch';b.textContent='MEMBERS';b.hidden=true;document.body.appendChild(b);b.onclick=open;
  }
  if(!document.querySelector('#kwiMembersShell')){
    const d=document.createElement('div');d.id='kwiMembersShell';d.className='kwi-members-shell';d.innerHTML='<div class="kwi-members-backdrop" data-kwi-close></div><section class="kwi-members-panel"><header class="kwi-members-head"><div><p>KŌMØ INTELLIGENCE · NETWORK ADMIN</p><h2>ONE / ECHELON</h2></div><button class="kwi-close" data-kwi-close>×</button></header><nav class="kwi-tabs"><button class="active" data-kwi-tab="members">MEMBERS</button><button data-kwi-tab="requests">ASK KŌMØ</button><button data-kwi-tab="cards">CARDS</button></nav><div class="kwi-body" id="kwiMembersBody"></div></section>';document.body.appendChild(d);
    d.querySelectorAll('[data-kwi-close]').forEach(x=>x.onclick=()=>d.classList.remove('open'));
    d.querySelectorAll('[data-kwi-tab]').forEach(x=>x.onclick=()=>{d.querySelectorAll('[data-kwi-tab]').forEach(y=>y.classList.toggle('active',y===x));render(x.dataset.kwiTab)});
  }
}
async function adminInvoke(body){
  const {data,error}=await supabase.functions.invoke('world-admin',{body});
  if(error)throw new Error(error.message||'Admin request failed');
  if(data?.error)throw new Error(data.error);
  return data;
}
async function boot(){
  mount();role=await getAccountRole();
  const launch=document.querySelector('#kwiMembersLaunch');
  launch.hidden=role!=='admin';
  if(requested&&role==='admin')open();
  else if(requested&&role!=='admin'){document.querySelector('#kwiMembersShell').classList.add('open');renderAuth()}
}
function renderAuth(){
  document.querySelector('#kwiMembersBody').innerHTML='<div class="kwi-auth"><p>KŌMØ ADMIN</p><h3>Confirm your KŌMØ identity.</h3><p>Member administration requires an existing KŌMØ admin account.</p><button id="kwiAdminConnect">CONNECT WITH PULSE</button></div>';
  document.querySelector('#kwiAdminConnect').onclick=()=>connectPulse();
}
async function open(){
  document.querySelector('#kwiMembersShell').classList.add('open');
  role=await getAccountRole();if(role!=='admin'){renderAuth();return}
  document.querySelector('#kwiMembersBody').innerHTML='<div class="kwi-empty">Loading KŌMØ members…</div>';
  try{const d=await adminInvoke({action:'list_members'});members=d.members||[];render('members')}catch(e){document.querySelector('#kwiMembersBody').innerHTML='<div class="kwi-empty">'+esc(e.message)+'</div>'}
}
function memberName(m){return m.profile?.display_name||[m.profile?.first_name,m.profile?.last_name].filter(Boolean).join(' ')||m.email||'KŌMØ account'}
function renderMembers(){
  document.querySelector('#kwiMembersBody').innerHTML=members.length?members.map(m=>{
    const mem=m.membership,active=mem?.status==='active',tier=active?String(mem.tier).toUpperCase():'PUBLIC';
    return '<article class="kwi-member"><div><b>'+esc(memberName(m))+'</b><small>'+esc(m.email||'')+' · '+esc(m.account_role||'member')+'</small></div><div class="kwi-tier">'+esc(mem?.founding&&active?'FOUNDING '+tier:tier)+'<small>'+esc(mem?.source||'No membership')+'</small></div><div class="kwi-actions"><button data-kwi-one="'+m.user_id+'">ONE</button><button class="dark" data-kwi-echelon="'+m.user_id+'">ECHELON</button>'+(active?'<button data-kwi-card="'+m.user_id+'">ISSUE CARD</button><button class="warn" data-kwi-revoke="'+m.user_id+'">REVOKE</button>':'')+'</div></article>';
  }).join(''):'<div class="kwi-empty">No accounts found.</div>';
  document.querySelectorAll('[data-kwi-one]').forEach(b=>b.onclick=()=>setMembership(b.dataset.kwiOne,'one'));
  document.querySelectorAll('[data-kwi-echelon]').forEach(b=>b.onclick=()=>setMembership(b.dataset.kwiEchelon,'echelon'));
  document.querySelectorAll('[data-kwi-revoke]').forEach(b=>b.onclick=()=>revoke(b.dataset.kwiRevoke));
  document.querySelectorAll('[data-kwi-card]').forEach(b=>b.onclick=()=>issueCard(b.dataset.kwiCard,b));
}
async function setMembership(userId,tier){
  try{await adminInvoke({action:'set_membership',user_id:userId,tier,founding:true});const d=await adminInvoke({action:'list_members'});members=d.members||[];renderMembers()}catch(e){alert(e.message)}
}
async function revoke(userId){
  if(!confirm('Revoke this KŌMØ membership?'))return;
  try{await adminInvoke({action:'revoke_membership',user_id:userId});const d=await adminInvoke({action:'list_members'});members=d.members||[];renderMembers()}catch(e){alert(e.message)}
}
async function issueCard(userId,button){
  if(!confirm('Issue a new NFC card? Any active card for this member will be replaced.'))return;
  try{
    const d=await adminInvoke({action:'issue_card',user_id:userId});
    const box=document.createElement('div');box.className='kwi-token';box.innerHTML='<b>NDEF HTTPS URL · SHOWN ONCE</b><br>'+esc(d.ndef_url)+'<br><button data-copy-token>COPY URL</button>';
    button.closest('.kwi-member').appendChild(box);box.querySelector('[data-copy-token]').onclick=()=>navigator.clipboard.writeText(d.ndef_url);
  }catch(e){alert(e.message)}
}
async function renderRequests(){
  document.querySelector('#kwiMembersBody').innerHTML='<div class="kwi-empty">Loading requests…</div>';
  try{requests=await adminInvoke({action:'list_requests'});const rows=requests.ask||[];document.querySelector('#kwiMembersBody').innerHTML=rows.length?rows.map(r=>'<article class="kwi-request"><div class="ey">'+esc(r.priority?.toUpperCase()||'STANDARD')+' · '+esc(r.status?.toUpperCase()||'')+' · '+esc(r.destination||'WORLD')+'</div><b>'+esc(r.prompt)+'</b><p>'+esc(new Date(r.created_at).toLocaleString())+'</p>'+(r.response?'<p><strong>RESPONSE</strong><br>'+esc(r.response)+'</p>':'<textarea data-kwi-response="'+r.id+'" placeholder="Human response to member"></textarea><button data-kwi-answer="'+r.id+'">SEND RESPONSE</button>')+'</article>').join(''):'<div class="kwi-empty">No Ask KŌMØ requests.</div>';document.querySelectorAll('[data-kwi-answer]').forEach(b=>b.onclick=()=>answer(b.dataset.kwiAnswer))}catch(e){document.querySelector('#kwiMembersBody').innerHTML='<div class="kwi-empty">'+esc(e.message)+'</div>'}
}
async function answer(id){
  const response=document.querySelector('[data-kwi-response="'+id+'"]')?.value.trim();if(!response)return;
  try{await adminInvoke({action:'answer_request',request_id:id,response});renderRequests()}catch(e){alert(e.message)}
}
async function renderCards(){
  document.querySelector('#kwiMembersBody').innerHTML='<div class="kwi-empty">Loading card claims…</div>';
  try{const d=await adminInvoke({action:'list_card_claims'}),rows=d.claims||[];document.querySelector('#kwiMembersBody').innerHTML=rows.length?rows.map(c=>'<article class="kwi-request"><div class="ey">'+esc(c.card_type.toUpperCase())+' · '+esc(c.status.toUpperCase())+'</div><b>'+esc(c.delivery_name)+'</b><p>'+esc(c.delivery_city)+' · '+esc(c.delivery_country)+' · '+esc(new Date(c.requested_at).toLocaleDateString())+'</p><select data-claim-status="'+c.id+'"><option>requested</option><option>approved</option><option>production</option><option>shipped</option><option>delivered</option><option>cancelled</option></select><button data-claim-update="'+c.id+'">UPDATE</button></article>').join(''):'<div class="kwi-empty">No physical card claims.</div>';rows.forEach(c=>{const s=document.querySelector('[data-claim-status="'+c.id+'"]');if(s)s.value=c.status});document.querySelectorAll('[data-claim-update]').forEach(b=>b.onclick=()=>updateClaim(b.dataset.claimUpdate))}catch(e){document.querySelector('#kwiMembersBody').innerHTML='<div class="kwi-empty">'+esc(e.message)+'</div>'}
}
async function updateClaim(id){
  const status=document.querySelector('[data-claim-status="'+id+'"]')?.value;try{await adminInvoke({action:'update_card_claim',claim_id:id,status});renderCards()}catch(e){alert(e.message)}
}
function render(tab){if(tab==='requests')renderRequests();else if(tab==='cards')renderCards();else renderMembers()}
onSession(()=>boot());
boot();
import {supabase,getSession,getProfile,getAccountRole,connectPulse,pulseUrl,onSession} from '/world/komo-world-auth-v1.js?v=1';

const state={session:null,profile:null,role:null,access:{authenticated:false,tier:'public',founding:false,entitlements:[]},entitlements:new Set(),passport:[],saved:[],orders:[]};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const has=c=>state.entitlements.has(c);
const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
let exitInFlight=false;
function toast(m){const e=$('#osToast');e.textContent=m;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2400)}
function label(){if(state.access.tier==='one')return state.access.founding?'FOUNDING ONE':'ONE';if(state.access.tier==='echelon')return state.access.founding?'FOUNDING ECHELON':'ECHELON';return state.session?.user?'SIGNED IN':'PUBLIC'}
function member(){return ['one','echelon'].includes(state.access.tier)}
async function analytics(event_name,entity_type=null,entity_id=null,metadata={}){
  try{
    let anon=localStorage.getItem('komo_anon_v1');if(!anon){anon=crypto.randomUUID();localStorage.setItem('komo_anon_v1',anon)}
    await supabase.from('komo_product_analytics').insert({user_id:state.session?.user?.id||null,anonymous_id:anon,event_name,surface:'home',entity_type,entity_id,metadata});
  }catch{}
}
async function load(){
  state.session=await getSession();state.profile=state.session?.user?await getProfile():null;state.role=state.session?.user?await getAccountRole():null;
  if(state.session?.user){const {data}=await supabase.rpc('komo_world_access_snapshot');state.access=data||{authenticated:true,tier:'public',founding:false,entitlements:[]}}
  else state.access={authenticated:false,tier:'public',founding:false,entitlements:[]};
  state.entitlements=new Set(state.access.entitlements||[]);
  state.passport=[];state.saved=[];state.orders=[];
  if(state.session?.user&&member()){
    const uid=state.session.user.id,jobs=[];
    if(has('world.passport.view'))jobs.push(supabase.from('world_passport_entries').select('id,entry_type,title,destination,occurred_at').eq('user_id',uid).order('occurred_at',{ascending:false}).limit(12).then(r=>state.passport=r.data||[]));
    if(has('world.saved_places.manage'))jobs.push(supabase.from('world_saved_places').select('place_id').eq('user_id',uid).then(r=>state.saved=r.data||[]));
    if(has('life.orders.view'))jobs.push(supabase.from('life_orders').select('id,order_number,status,total_cents,currency,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(8).then(r=>state.orders=r.data||[]));
    await Promise.all(jobs);
  }
  render();
}
function render(){
  const access=$('#osAccess');access.className='os-access '+(state.access.tier==='one'?'one':state.access.tier==='echelon'?'echelon':'');access.querySelector('span').textContent=label();
  const planetStatus=$('.planet-copy small');
  if(planetStatus)planetStatus.textContent=state.access.tier==='echelon'?'ECHELON':state.access.tier==='one'?'ONE':'CONNECTED';
  $('.node-echelon').hidden=state.access.tier!=='echelon';
  ['pulse','moments','card'].forEach(k=>$('.node-'+k)?.classList.toggle('locked',!member()));
  $('#osAsk').hidden=!has('concierge.request');
  const ctx=$('#osContext');
  if(state.access.tier==='echelon'){ctx.innerHTML='<span>ECHELON · PRIVATE LAYER ACTIVE</span><p>World, Moments and Life are revealing the private access available to this identity.</p>'}
  else if(state.access.tier==='one'){ctx.innerHTML='<span>KŌMØ ONE · MY WORLD</span><p>KŌMØ knows this identity. Card, Passport, saved places, Moments and Pulse are connected.</p>'}
  else if(state.session?.user){ctx.innerHTML='<span>KŌMØ ID · SIGNED IN</span><p>Your identity is recognised. ONE activates after your first validated KŌMØ assessment.</p>'}
  else ctx.innerHTML='<span>WORLD · LIFE</span><p>Explore the public KŌMØ world. ONE activates after your first validated KŌMØ assessment.</p>';
}
function transitionLabel(module){
  return {world:'WORLD',life:'LIFE',pulse:'PULSE',moments:'MOMENTS',echelon:'ECHELON'}[module]||'KŌMØ';
}
function exitTo(module,url){
  if(exitInFlight){return}
  exitInFlight=true;
  const shell=$('#osTransition'),labelEl=$('#osTransitionLabel');
  if(labelEl)labelEl.textContent=transitionLabel(module);
  if(shell){shell.classList.add('active');shell.setAttribute('aria-hidden','false')}
  const delay=reduceMotion?80:560;
  window.setTimeout(()=>{location.href=url},delay);
}
async function go(module){
  if(module==='world'){analytics('world_opened');exitTo(module,'/world/');return}
  if(module==='life'){analytics('life_opened');exitTo(module,'/life/');return}
  if(module==='moments'){if(!member()){await connectPulse();toast('Sign in to unlock your Moments');return}exitTo(module,'/world/?view=moments');return}
  if(module==='pulse'){if(!state.session?.user){await connectPulse();toast('Pulse opened · confirm your identity');return}analytics('pulse_opened');exitTo(module,pulseUrl());return}
  if(module==='card'){if(!member()){await connectPulse();toast('ONE unlocks your KŌMØ Card');return}openYou('card');return}
  if(module==='echelon'){exitTo(module,'/world/?layer=echelon');return}
}
function name(){return state.profile?.display_name||[state.profile?.first_name,state.profile?.last_name].filter(Boolean).join(' ')||state.session?.user?.email?.split('@')[0]||'KŌMØ Member'}
function fmtMoney(c=0){return new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(c)/100)}
function openYou(section=''){
  const shell=$('#osYou');shell.classList.add('open');shell.setAttribute('aria-hidden','false');
  if(!state.session?.user){
    $('#osYouTitle').textContent='YOU';
    $('#osYouBody').innerHTML='<div class="os-you-section"><p class="ey">KŌMØ ID</p><h3>One identity across KŌMØ.</h3><p>Sign in with your existing Pulse account. No second account is created.</p><button class="os-access" id="youConnect">CONNECT WITH PULSE</button></div>';
    $('#youConnect').onclick=()=>connectPulse();return;
  }
  if(!member()){
    $('#osYouTitle').textContent='KŌMØ ID';
    $('#osYouBody').innerHTML='<div class="os-you-section"><p class="ey">SIGNED IN</p><h3>'+esc(name())+'</h3><p>Your KŌMØ identity is recognised. ONE activates after your first validated KŌMØ assessment.</p><a href="'+pulseUrl()+'">OPEN PULSE →</a></div>'+adminDemo();
    bindDemo();return;
  }
  const e=state.access.tier==='echelon';
  $('#osYouTitle').textContent=e?'ECHELON':'ONE';
  const card='<div class="os-you-card '+(e?'echelon':'')+'"><div><small>KŌMØ IDENTITY KEY</small><strong>KŌMØ<br>'+(e?'ECHELON':'ONE')+'</strong></div><footer><span>'+esc(name())+'</span><span>)))</span></footer></div>';
  const counts={passport:state.passport.length,saved:state.saved.length,orders:state.orders.length};
  let html=card+'<div class="os-you-grid"><a href="/world/?view=moments"><b>MOMENTS</b><span>Your upcoming and past KŌMØ experiences.</span></a><a href="/world/?view=you"><b>PASSPORT</b><span>'+counts.passport+' recorded moments in this V1.</span></a><a href="/world/"><b>SAVED PLACES</b><span>'+counts.saved+' places saved to My World.</span></a><a href="/life/?orders=1"><b>ORDERS</b><span>'+counts.orders+' Life orders linked to this identity.</span></a><button data-you-card><b>CARD</b><span>Digital identity and physical card claim.</span></button><a href="'+pulseUrl()+'"><b>PULSE</b><span>Your health data stays in Pulse.</span></a></div>';
  if(e)html+='<div class="os-you-section"><p class="ey">KŌMØ ECHELON</p><h3>Private access active.</h3><p>Private places, private experiences and priority Ask KŌMØ are available to this identity.</p></div>';
  html+=adminDemo();
  $('#osYouBody').innerHTML=html;
  $('[data-you-card]')?.addEventListener('click',()=>location.href='/world/?view=card');
  bindDemo();
}
function adminDemo(){
  if(state.role!=='admin')return'';
  return '<div class="os-you-section"><p class="ey">DEMO CONTROL · ADMIN ONLY</p><h3>Switch this identity.</h3><p>This changes the real World membership for your current admin account, so private pins and permissions can be demonstrated honestly.</p><div class="os-demo"><button data-demo-tier="one">FOUNDING ONE</button><button data-demo-tier="echelon">FOUNDING ECHELON</button></div></div>';
}
function bindDemo(){$$('[data-demo-tier]').forEach(b=>b.onclick=()=>switchTier(b.dataset.demoTier))}
async function switchTier(tier){
  try{const {data,error}=await supabase.functions.invoke('world-admin',{body:{action:'set_membership',user_id:state.session.user.id,tier,founding:true}});if(error||data?.error)throw error||new Error(data.error);toast('Membership switched to '+tier.toUpperCase());await load();openYou()}catch(e){toast('Admin membership switch failed')}
}
function closeYou(){$('#osYou').classList.remove('open');$('#osYou').setAttribute('aria-hidden','true')}
function openAsk(){$('#osAskShell').classList.add('open');$('#osAskShell').setAttribute('aria-hidden','false')}
function closeAsk(){$('#osAskShell').classList.remove('open');$('#osAskShell').setAttribute('aria-hidden','true')}
async function sendAsk(e){
  e.preventDefault();const f=new FormData(e.currentTarget),prompt=String(f.get('prompt')||'').trim();if(!prompt)return;
  const row={user_id:state.session.user.id,request_type:'ask_komo',prompt,destination:String(f.get('destination')||'').trim()||null,requested_for:f.get('requested_for')?new Date(String(f.get('requested_for'))).toISOString():null,priority:has('concierge.priority')?'priority':'standard'};
  const {data,error}=await supabase.from('world_concierge_requests').insert(row).select('id').single();
  if(error){toast('Request could not be sent');return}analytics('ask_komo_created','concierge_request',data.id,{priority:row.priority});closeAsk();e.currentTarget.reset();toast('KŌMØ received your request');
}
function setOrbitFocus(module=''){
  const orbit=$('#osOrbit');if(!orbit)return;
  if(module)orbit.dataset.focus=module;else delete orbit.dataset.focus;
}
function initPlanetMotion(){
  const orbit=$('#osOrbit'),home=$('#osHome');if(!orbit||!home)return;
  home.classList.add('is-entering');
  window.setTimeout(()=>home.classList.remove('is-entering'),reduceMotion?40:900);
  if(reduceMotion||!window.matchMedia?.('(pointer:fine)')?.matches)return;
  let raf=0,targetX=0,targetY=0,currentX=0,currentY=0;
  const renderTilt=()=>{
    raf=0;
    currentX+=(targetX-currentX)*.14;currentY+=(targetY-currentY)*.14;
    orbit.style.setProperty('--ry',(currentX*5.5).toFixed(2)+'deg');
    orbit.style.setProperty('--rx',(-currentY*4.5).toFixed(2)+'deg');
    if(Math.abs(targetX-currentX)>.01||Math.abs(targetY-currentY)>.01)raf=requestAnimationFrame(renderTilt);
  };
  const queue=()=>{if(!raf)raf=requestAnimationFrame(renderTilt)};
  orbit.addEventListener('pointermove',e=>{
    const r=orbit.getBoundingClientRect();
    targetX=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width/2)));
    targetY=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(r.height/2)));
    queue();
  },{passive:true});
  orbit.addEventListener('pointerleave',()=>{targetX=0;targetY=0;queue()},{passive:true});
}
$('[data-module]').forEach(b=>{
  b.onclick=()=>go(b.dataset.module);
  b.addEventListener('pointerenter',()=>setOrbitFocus(b.dataset.module));
  b.addEventListener('focus',()=>setOrbitFocus(b.dataset.module));
  b.addEventListener('pointerleave',()=>setOrbitFocus(''));
  b.addEventListener('blur',()=>setOrbitFocus(''));
});
$('#osAccess').onclick=()=>openYou();$('#osYouMobile').onclick=()=>openYou();$('#osSphere').onclick=()=>openYou();
$$('[data-you-close]').forEach(x=>x.onclick=closeYou);$('#osAsk').onclick=openAsk;$$('[data-ask-close]').forEach(x=>x.onclick=closeAsk);
$$('[data-quick]').forEach(b=>b.onclick=()=>{$('#osAskForm textarea').value=b.dataset.quick});$('#osAskForm').addEventListener('submit',sendAsk);
onSession(()=>load());
initPlanetMotion();
load().then(()=>{analytics('ecosystem_opened');const q=new URLSearchParams(location.search);if(q.get('you')==='1')openYou(q.get('section')||'')});

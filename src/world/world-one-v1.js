import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.11.2/dist/maplibre-gl.mjs';
import {supabase,getSession,getProfile,getAccountRole,connectPulse,disconnectWorld,onSession,pulseUrl} from './komo-world-auth-v1.js?v=1';

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const state={
  session:null,profile:null,role:null,access:{authenticated:false,tier:'public',founding:false,entitlements:[]},
  entitlements:new Set(),places:[],events:[],experiences:[],saved:new Set(),passport:[],attendance:[],experienceRequests:[],claims:[],
  preferences:null,intent:'all',view:'world',momentTab:'upcoming',selected:null,markers:new Map(),pitched:false,near:null
};

const map=new maplibregl.Map({
  container:'map',
  style:'https://tiles.openfreemap.org/styles/liberty',
  center:[7.02,43.49],
  zoom:9.05,
  pitch:0,
  bearing:0,
  antialias:true,
  maxPitch:62,
  attributionControl:true
});
map.dragRotate.enable();
map.touchZoomRotate.enableRotation();

const categoryLabel={eat:'EAT',stay:'STAY',move:'MOVE',recover:'RECOVER',experience:'EXPERIENCE',meet:'MEET'};
const categorySymbol={eat:'E',stay:'S',move:'M',recover:'R',experience:'X',meet:'M'};
const preferenceOptions=['Gastronomy','Yachting','Fitness','Recovery','Art','Hotels','Travel','Events','Culture'];

function toast(message){
  const el=$('#toast');el.textContent=message;el.classList.add('show');
  clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600);
}
async function analytics(event_name,entity_type=null,entity_id=null,metadata={}){
  try{
    let anon=localStorage.getItem('komo_anon_v1');if(!anon){anon=crypto.randomUUID();localStorage.setItem('komo_anon_v1',anon)}
    await supabase.from('komo_product_analytics').insert({user_id:state.session?.user?.id||null,anonymous_id:anon,event_name,surface:'world',entity_type,entity_id,metadata});
  }catch{}
}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function has(code){return state.entitlements.has(code)}
function member(){return state.access.tier==='one'||state.access.tier==='echelon'}
function labelTier(){
  if(state.access.tier==='one')return state.access.founding?'FOUNDING ONE':'ONE';
  if(state.access.tier==='echelon')return state.access.founding?'FOUNDING ECHELON':'ECHELON';
  return 'PUBLIC';
}
function visibilityClass(item){return item?.visibility==='echelon'?'echelon':item?.visibility==='one'?'one':''}
function isKomo(place){return String(place?.place_type||'').startsWith('komo_')||String(place?.name||'').startsWith('KŌMØ')}
function formatDate(value){
  if(!value)return'';
  return new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
}
function km(a,b,c,d){
  const R=6371,toRad=x=>x*Math.PI/180,dLat=toRad(c-a),dLon=toRad(d-b);
  const q=Math.sin(dLat/2)**2+Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dLon/2)**2;
  return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));
}
function directionsUrl(p){return 'https://maps.apple.com/?daddr='+encodeURIComponent(p.latitude+','+p.longitude)}
function pulseSignInCopy(){
  if(state.session?.user&&!member())return 'KŌMØ ONE activates after your first completed KŌMØ assessment.';
  return 'Complete your first KŌMØ assessment to become ONE and make World yours.';
}

async function loadAccess(){
  state.session=await getSession();
  state.profile=state.session?.user?await getProfile():null;
  state.role=state.session?.user?await getAccountRole():null;
  if(state.session?.user){
    const {data,error}=await supabase.rpc('komo_world_access_snapshot');
    if(error){console.warn('[World access]',error);state.access={authenticated:true,tier:'public',founding:false,entitlements:[]}}
    else state.access=data||{authenticated:true,tier:'public',founding:false,entitlements:[]};
  }else state.access={authenticated:false,tier:'public',founding:false,entitlements:[]};
  state.entitlements=new Set(Array.isArray(state.access.entitlements)?state.access.entitlements:[]);
}

async function loadContent(){
  const [placesRes,eventsRes,experiencesRes]=await Promise.all([
    supabase.from('world_places').select('id,slug,name,destination,city,country_code,latitude,longitude,category,place_type,editorial_reason,summary,visibility,privileges,starts_at,ends_at').order('name'),
    supabase.from('world_events').select('id,slug,title,destination,place_id,summary,starts_at,ends_at,visibility,request_mode,capacity,demo,image_url').order('starts_at'),
    supabase.from('world_experiences').select('id,slug,title,destination,place_id,operator_name,summary,why_komo,visibility,request_mode,available_from,available_until,demo,image_url').order('title')
  ]);
  if(placesRes.error)console.warn('[World places]',placesRes.error);
  if(eventsRes.error)console.warn('[World events]',eventsRes.error);
  if(experiencesRes.error)console.warn('[World experiences]',experiencesRes.error);
  state.places=placesRes.data||[];
  state.events=eventsRes.data||[];
  state.experiences=experiencesRes.data||[];

  state.saved=new Set();state.passport=[];state.attendance=[];state.experienceRequests=[];state.claims=[];state.preferences=null;
  if(!state.session?.user)return;
  const uid=state.session.user.id;
  const jobs=[];
  if(has('world.saved_places.manage'))jobs.push(supabase.from('world_saved_places').select('place_id').eq('user_id',uid).then(r=>{if(!r.error)state.saved=new Set((r.data||[]).map(x=>x.place_id))}));
  if(has('world.passport.view'))jobs.push(supabase.from('world_passport_entries').select('id,entry_type,title,destination,occurred_at,note,place_id,event_id,experience_id').eq('user_id',uid).order('occurred_at',{ascending:false}).limit(30).then(r=>{if(!r.error)state.passport=r.data||[]}));
  if(has('event.member.rsvp'))jobs.push(supabase.from('world_event_attendance').select('event_id,status,requested_at').eq('user_id',uid).then(r=>{if(!r.error)state.attendance=r.data||[]}));
  if(has('experience.book'))jobs.push(supabase.from('world_experience_requests').select('experience_id,status,requested_at,note').eq('user_id',uid).then(r=>{if(!r.error)state.experienceRequests=r.data||[]}));
  if(has('card.physical.claim'))jobs.push(supabase.from('world_card_claims').select('id,card_type,status,requested_at').eq('user_id',uid).order('requested_at',{ascending:false}).limit(5).then(r=>{if(!r.error)state.claims=r.data||[]}));
  jobs.push(supabase.from('world_preferences').select('interests,home_destination,presence_opt_in,introductions_opt_in').eq('user_id',uid).maybeSingle().then(r=>{if(!r.error)state.preferences=r.data||null}));
  await Promise.all(jobs);
}

async function refreshAll({fly=false}={}){
  await loadAccess();
  await loadContent();
  updateIdentityUI();
  renderMarkers();
  renderView(state.view);
  maybeWelcome();
  if(fly)map.easeTo({center:[7.02,43.49],zoom:9.05,pitch:0,bearing:0,duration:650});
}

function maybeWelcome(){
  if(!member()||!state.session?.user)return;
  const key='komo_world_welcome_'+state.session.user.id+'_'+state.access.tier;
  if(localStorage.getItem(key))return;
  localStorage.setItem(key,'1');
  const echelon=state.access.tier==='echelon';
  openModal('<button class="modal-close" data-modal-close>×</button><div class="ey">WELCOME TO KŌMØ '+(echelon?'ECHELON':'ONE')+'</div><h2>'+(echelon?'Enter the private layer.':'World is now yours.')+'</h2><p>'+(echelon?'FOUNDING ACCESS · Private World, Ask KŌMØ and priority permissions are now active for this identity.':'KŌMØ knows your identity. My World, your digital Card, Passport, member experiences and Pulse bridge are now active.')+'</p><div class="card-actions"><button class="primary" data-welcome-card>OPEN MY CARD</button><button data-modal-close>EXPLORE MY WORLD</button></div>');
  document.querySelector('[data-welcome-card]')?.addEventListener('click',()=>{closeModal();renderView('card')});
  document.querySelectorAll('[data-modal-close]').forEach(x=>x.onclick=closeModal);
}

function updateIdentityUI(){
  const pill=$('#memberPill'),sign=$('#signInBtn');
  pill.className='member-pill '+(state.access.tier==='one'?'one':state.access.tier==='echelon'?'echelon':'');
  pill.querySelector('span').textContent=labelTier();
  if(state.access.tier==='one')sign.textContent='MY ONE';
  else if(state.access.tier==='echelon')sign.textContent='ECHELON';
  else sign.textContent=state.session?.user?'BECOME ONE':'BECOME ONE';
  $('#panelEyebrow').textContent=labelTier()+' WORLD';
  $('#askBtn').classList.toggle('visible',has('concierge.request'));
}

function filteredPlaces(){
  let list=state.places;
  if(state.intent!=='all')list=list.filter(p=>p.category===state.intent);
  if(state.near)list=[...list].sort((a,b)=>km(state.near.lat,state.near.lng,a.latitude,a.longitude)-km(state.near.lat,state.near.lng,b.latitude,b.longitude));
  return list;
}
function markerElement(p){
  const wrap=document.createElement('div');wrap.className='poi-wrap';
  const el=document.createElement('button');
  const cls=visibilityClass(p);
  el.className='poi '+(cls||'')+(isKomo(p)?' komo':'');
  el.type='button';el.textContent=isKomo(p)?'KØ':categorySymbol[p.category]||'•';el.setAttribute('aria-label',p.name);
  const label=document.createElement('span');label.className='poi-label';label.textContent=p.name;
  wrap.append(el,label);el.addEventListener('click',e=>{e.stopPropagation();openPlace(p)});
  return wrap;
}
function renderMarkers(){
  for(const marker of state.markers.values())marker.remove();state.markers.clear();
  filteredPlaces().forEach(p=>{
    const m=new maplibregl.Marker({element:markerElement(p),anchor:'center'}).setLngLat([p.longitude,p.latitude]).addTo(map);
    state.markers.set(p.id,m);
  });
}

function placeCard(p){
  const vis=visibilityClass(p),near=state.near?km(state.near.lat,state.near.lng,p.latitude,p.longitude):null;
  return '<button class="place-card" data-place="'+p.id+'"><span class="place-symbol '+vis+'">'+(isKomo(p)?'KØ':categorySymbol[p.category]||'•')+'</span><span class="place-copy"><b>'+esc(p.name)+'</b><p>'+esc(categoryLabel[p.category]||p.category)+' · '+esc(p.city||p.destination)+(near!=null?' · '+near.toFixed(1)+' km':'')+'</p></span><span class="arrow">›</span></button>';
}
function renderWorld(){
  const list=filteredPlaces().slice(0,12);
  $('#panelTitle').textContent=state.intent==='all'?(member()?'My World':'Selected for the Riviera'):(categoryLabel[state.intent]||state.intent);
  $('#panelCopy').textContent=member()?'Your accessible KŌMØ layer is active. Public and member places are shown together.':'A small edit of places chosen for their setting, relevance and connection to the KŌMØ world.';
  let html='<div class="section-row"><b>'+(member()?'Your accessible world':'KŌMØ Selected')+'</b><span>'+list.length+' visible</span></div><div class="place-list">'+list.map(placeCard).join('')+'</div>';
  if(!member())html+='<div class="locked-card" style="margin-top:10px"><div class="ey">KŌMØ ONE</div><h3>Make World yours.</h3><p>'+pulseSignInCopy()+'</p><button data-connect-one>DISCOVER ONE</button></div>';
  else if(state.access.tier==='one')html+='<div class="locked-card" style="margin-top:10px"><div class="ey">KŌMØ ECHELON</div><h3>Another layer exists.</h3><p>ECHELON access is currently assigned privately to selected Founding Members.</p></div>';
  $('#sideBody').innerHTML=html;
  bindCommon();
}
function renderNow(){
  const now=Date.now();
  const events=state.events.filter(e=>new Date(e.ends_at).getTime()>=now).slice(0,8);
  const ex=state.experiences.slice(0,8);
  let html='<div class="section-row"><b>Available now & next</b><span>LIVE EDIT</span></div><div class="event-list">';
  if(events.length)html+=events.map(eventCard).join('');
  if(ex.length)html+=ex.map(experienceCard).join('');
  if(!events.length&&!ex.length)html+='<div class="empty">Nothing is being surfaced right now. World stays quiet when there is nothing relevant to show.</div>';
  html+='</div>';
  if(!member())html+='<div class="locked-card" style="margin-top:10px"><div class="ey">MEMBER LAYER</div><h3>More appears when you become ONE.</h3><p>Member experiences and events are revealed by your KŌMØ identity.</p><button data-connect-one>BECOME ONE</button></div>';
  $('#panelTitle').textContent='NOW';$('#panelCopy').textContent='What is relevant now, soon or this week — without filling the map with noise.';
  $('#sideBody').innerHTML=html;bindCommon();
}
function eventCard(e){
  const mine=state.attendance.find(a=>a.event_id===e.id);
  const access=visibilityClass(e);
  return '<article class="event-card '+access+'"><div class="moment-cover '+access+'"><span>'+esc(e.destination||'KŌMØ')+'</span>'+(e.demo?'<em>DEMO</em>':'')+'</div><div class="moment-card-body"><div class="ey">'+esc(access==='echelon'?'ECHELON EVENT':access==='one'?'MEMBER EVENT':'WORLD EVENT')+'</div><b>'+esc(e.title)+'</b><p>'+esc(formatDate(e.starts_at))+' · '+esc(e.destination)+'</p><p>'+esc(e.summary||'')+'</p><div class="moment-actions"><button data-event-view="'+e.id+'">VIEW</button>'+(has('event.member.rsvp')?'<button class="primary" data-event-request="'+e.id+'">'+(mine?'STATUS · '+esc(mine.status.toUpperCase()):'REQUEST ACCESS')+'</button>':'')+'</div></div></article>';
}
function experienceCard(x){
  const mine=state.experienceRequests.find(r=>r.experience_id===x.id);
  const access=visibilityClass(x);
  return '<article class="event-card '+access+'"><div class="moment-cover '+access+'"><span>'+esc(x.destination||'KŌMØ')+'</span>'+(x.demo?'<em>DEMO</em>':'')+'</div><div class="moment-card-body"><div class="ey">'+esc(access==='echelon'?'ECHELON EXPERIENCE':access==='one'?'MEMBER EXPERIENCE':'KŌMØ EXPERIENCE')+'</div><b>'+esc(x.title)+'</b><p>'+esc(x.destination)+' · '+esc(x.operator_name||'KŌMØ')+'</p><p>'+esc(x.summary||'')+'</p><div class="moment-actions"><button data-experience-view="'+x.id+'">VIEW</button>'+(has('experience.book')?'<button class="primary" data-experience-request="'+x.id+'">'+(mine?'STATUS · '+esc(mine.status.toUpperCase()):'REQUEST')+'</button>':'')+'</div></div></article>';
}
function eventDetail(e){
  if(!e)return;
  analytics('moment_viewed','world_event',e.id,{visibility:e.visibility,demo:!!e.demo});
  const mine=state.attendance.find(a=>a.event_id===e.id),access=visibilityClass(e);
  openModal('<button class="modal-close" data-modal-close>×</button><div class="moment-detail-cover '+access+'"><span>'+(e.demo?'DEMO · ':'')+esc(access==='echelon'?'ECHELON EVENT':access==='one'?'MEMBER EVENT':'KŌMØ EVENT')+'</span><h2>'+esc(e.title)+'</h2><p>'+esc(e.destination)+'</p></div><div class="moment-detail-meta"><div><small>DATE</small><b>'+esc(formatDate(e.starts_at))+'</b></div><div><small>GUESTS</small><b>'+esc(e.capacity?String(e.capacity):'CURATED')+'</b></div><div><small>ACCESS</small><b>'+esc(access==='echelon'?'ECHELON':access==='one'?'ONE':'WORLD')+'</b></div></div><div class="moment-detail-copy"><p>'+esc(e.summary||'A KŌMØ moment.')+'</p></div><div class="moment-detail-actions">'+(has('event.member.rsvp')?'<button class="primary" data-event-request="'+e.id+'">'+(mine?'STATUS · '+esc(mine.status.toUpperCase()):'REQUEST ACCESS')+'</button>':'<button data-connect-one>MEMBER ACCESS</button>')+(has('concierge.request')?'<button data-ask-event="'+e.id+'">ASK KŌMØ</button>':'')+'</div>');
  bindCommon();
}
function experienceDetail(x){
  if(!x)return;
  analytics('moment_viewed','world_experience',x.id,{visibility:x.visibility,demo:!!x.demo});
  const mine=state.experienceRequests.find(r=>r.experience_id===x.id),access=visibilityClass(x);
  openModal('<button class="modal-close" data-modal-close>×</button><div class="moment-detail-cover '+access+'"><span>'+(x.demo?'DEMO · ':'')+esc(access==='echelon'?'ECHELON EXPERIENCE':access==='one'?'MEMBER EXPERIENCE':'KŌMØ EXPERIENCE')+'</span><h2>'+esc(x.title)+'</h2><p>'+esc(x.destination)+' · '+esc(x.operator_name||'KŌMØ')+'</p></div><div class="moment-detail-meta"><div><small>DESTINATION</small><b>'+esc(x.destination||'Riviera')+'</b></div><div><small>ACCESS</small><b>'+esc(access==='echelon'?'ECHELON':access==='one'?'ONE':'WORLD')+'</b></div><div><small>MODE</small><b>'+esc((x.request_mode||'request').toUpperCase())+'</b></div></div><div class="moment-detail-copy"><p>'+esc(x.summary||'')+'</p>'+(x.why_komo?'<div class="why-mini"><small>WHY KŌMØ</small><b>'+esc(x.why_komo)+'</b></div>':'')+'</div><div class="moment-detail-actions">'+(has('experience.book')?'<button class="primary" data-experience-request="'+x.id+'">'+(mine?'STATUS · '+esc(mine.status.toUpperCase()):'REQUEST')+'</button>':'<button data-connect-one>MEMBER ACCESS</button>')+(has('concierge.request')?'<button data-ask-experience="'+x.id+'">ASK KŌMØ</button>':'')+'</div>');
  bindCommon();
}
function passportSummary(){
  const destinations=new Set(state.passport.map(x=>x.destination).filter(Boolean));
  const places=state.passport.filter(x=>x.place_id||x.entry_type==='place').length;
  const experiences=state.passport.filter(x=>x.experience_id||x.event_id||['experience','event'].includes(x.entry_type)).length;
  return '<section class="passport-summary"><div><span>'+destinations.size+'</span><small>DESTINATIONS</small></div><div><span>'+places+'</span><small>PLACES</small></div><div><span>'+experiences+'</span><small>EXPERIENCES</small></div></section>';
}
function renderMoments(){
  if(!member()){renderLocked('YOUR MOMENTS','ONE remembers the KŌMØ moments that become part of your World.','BECOME ONE');return}
  const now=Date.now();
  const requested=[
    ...state.attendance.map(a=>{const e=state.events.find(x=>x.id===a.event_id);return e?{kind:'event',id:e.id,date:e.starts_at||a.requested_at,title:e.title,destination:e.destination,status:a.status}:null}).filter(Boolean),
    ...state.experienceRequests.map(r=>{const x=state.experiences.find(e=>e.id===r.experience_id);return x?{kind:'experience',id:x.id,date:x.available_from||r.requested_at,title:x.title,destination:x.destination,status:r.status}:null}).filter(Boolean)
  ].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const upcoming=requested.filter(x=>!x.date||new Date(x.date).getTime()>=now);
  let html='<div class="moments-tabs"><button data-moment-tab="upcoming" class="'+(state.momentTab==='upcoming'?'active':'')+'">UPCOMING</button><button data-moment-tab="for-you" class="'+(state.momentTab==='for-you'?'active':'')+'">FOR YOU</button><button data-moment-tab="past" class="'+(state.momentTab==='past'?'active':'')+'">PAST</button></div>';
  if(state.momentTab==='upcoming'){
    html+='<div class="section-row"><b>Upcoming</b><span>'+upcoming.length+' MOMENTS</span></div><div class="moment-list">';
    html+=upcoming.length?upcoming.map(x=>'<button class="moment-card moment-row" data-'+x.kind+'-view="'+x.id+'"><div class="ey">'+esc(x.status.toUpperCase())+' · '+esc(formatDate(x.date))+'</div><b>'+esc(x.title)+'</b><p>'+esc(x.destination||'KŌMØ World')+'</p></button>').join(''):'<div class="empty">No upcoming member request yet. Open FOR YOU to see what KŌMØ is surfacing now.</div>';
    html+='</div>';
  }else if(state.momentTab==='for-you'){
    html+='<div class="section-row"><b>For you</b><span>CURATED</span></div><div class="event-list">'+state.events.filter(e=>new Date(e.ends_at).getTime()>=now).map(eventCard).join('')+state.experiences.map(experienceCard).join('')+'</div>';
  }else{
    html+='<div class="section-row"><b>Past Moments</b><span>'+state.passport.length+' RECORDED</span></div><div class="passport-list">';
    html+=state.passport.length?state.passport.map(x=>'<article class="passport-card"><div class="passport-stamp">'+esc((x.destination||'KŌMØ').slice(0,3).toUpperCase())+'</div><div><div class="ey">'+esc((x.entry_type||'MOMENT').toUpperCase())+' · '+esc(formatDate(x.occurred_at))+'</div><b>'+esc(x.title)+'</b><p>'+esc(x.destination||'KŌMØ World')+(x.note?' · '+esc(x.note):'')+'</p></div></article>').join(''):'<div class="empty">Your Passport is ready. Attended experiences and selected KŌMØ moments will appear here — never as points or badges.</div>';
    html+='</div>';
  }
  html+='<div class="passport-head"><div><small>KŌMØ PASSPORT</small><b>Your world, remembered.</b></div><span>ONE</span></div>'+passportSummary();
  $('#panelTitle').textContent='YOUR MOMENTS';$('#panelCopy').textContent='Curated experiences. Meaningful connections. A quiet record of what becomes part of your World.';
  $('#sideBody').innerHTML=html;bindCommon();
}

function renderCard(){
  if(!has('world.card.digital.view')){renderLocked('KŌMØ ONE CARD','Your KŌMØ Identity Key is unlocked with ONE after a completed KŌMØ assessment.','BECOME ONE');return}
  analytics('card_viewed');
  const echelon=state.access.tier==='echelon',name=state.profile?.display_name||[state.profile?.first_name,state.profile?.last_name].filter(Boolean).join(' ')||'KŌMØ Member';
  const activeClaim=state.claims.find(c=>['requested','approved','production','shipped'].includes(c.status));
  const since=state.access.access_started_at?new Date(state.access.access_started_at).getFullYear():2026;
  const html='<div class="digital-card '+(echelon?'echelon':'')+'"><div><small>KŌMØ IDENTITY KEY</small><strong>KŌMØ<br>'+(echelon?'ECHELON':'ONE')+'</strong></div><div class="card-foot"><span class="card-name">'+esc(name)+'</span><span class="nfc">)))</span></div></div>'+
    '<div class="member-line"><b>KŌMØ MEMBER</b><span>Member since '+since+'</span></div>'+
    '<div class="card-action-grid"><button data-wallet-placeholder>ADD TO WALLET</button><button data-qr-placeholder>SHOW QR</button><button data-member-access>MEMBER ACCESS</button></div>'+
    '<div class="card-actions">'+(activeClaim?'<button disabled>PHYSICAL CARD · '+esc(activeClaim.status.toUpperCase())+'</button>':'<button class="primary" data-claim-card>CLAIM YOUR PHYSICAL CARD</button>')+'</div>'+
    (state.access.founding?'<div class="founding-card-note"><b>FOUNDING MEMBER</b><span>Physical card is complimentary during the Founding phase.</span></div>':'')+
    '<div class="pulse-bridge"><div class="ey">KŌMØ PULSE</div><b>YOUR KŌMØ TRAJECTORY IS ACTIVE</b><a href="'+pulseUrl()+'">OPEN PULSE →</a></div>';
  $('#panelTitle').textContent=echelon?'KŌMØ ECHELON':'KŌMØ ONE';$('#panelCopy').textContent=echelon?'PRIVATE MEMBERSHIP · FOUNDING ACCESS':'Your identity across World, Card and the KŌMØ member layer.';
  $('#sideBody').innerHTML=html;bindCommon();
  $('[data-wallet-placeholder]')?.addEventListener('click',()=>openModal('<button class="modal-close" data-modal-close>×</button><div class="ey">APPLE WALLET</div><h2>Coming soon.</h2><p>KŌMØ does not issue an Apple Wallet pass in this V1 yet. Your digital Card remains available here.</p>'));
  $('[data-qr-placeholder]')?.addEventListener('click',()=>openModal('<button class="modal-close" data-modal-close>×</button><div class="ey">KŌMØ QR ACCESS</div><h2>Coming soon.</h2><p>QR-based member access is not active in this V1. NFC card recognition is being prepared separately and never replaces strong identity verification.</p>'));
  $('[data-member-access]')?.addEventListener('click',()=>renderView('world'));
}
function renderYou(){
  if(!state.session?.user){renderLocked('YOU','Sign in with your existing KŌMØ identity. No second account is created.','SIGN IN');return}
  const interests=new Set(state.preferences?.interests||state.profile?.interests||[]);
  let html='<div class="section-row"><b>'+esc(state.profile?.display_name||state.session.user.email||'KŌMØ Member')+'</b><span>'+esc(labelTier())+'</span></div>';
  if(member()){
    html+='<div class="pulse-bridge"><div class="ey">PULSE BRIDGE</div><b>YOUR KŌMØ TRAJECTORY IS ACTIVE</b><a href="'+pulseUrl()+'">OPEN PULSE →</a></div>';
    html+='<div class="section-row" style="margin-top:14px"><b>Personalise World</b><span>EXPLICIT PREFERENCES</span></div><div class="preference-grid">'+preferenceOptions.map(x=>'<label class="pref-chip"><input type="checkbox" value="'+esc(x)+'" '+(interests.has(x)?'checked':'')+'><span>'+esc(x)+'</span></label>').join('')+'</div><button class="top-btn primary" style="width:100%;margin-top:10px" data-save-preferences>SAVE MY WORLD</button>';
  }else html+='<div class="locked-card"><div class="ey">KŌMØ ONE</div><h3>You are signed in. ONE is not active yet.</h3><p>'+pulseSignInCopy()+'</p><button data-connect-one>OPEN PULSE</button></div>';
  html+='<button class="top-btn" style="width:100%;margin-top:10px" data-sign-out>SIGN OUT OF WORLD</button>';
  $('#panelTitle').textContent='YOU';$('#panelCopy').textContent='Your KŌMØ identity, preferences and access. Health data stays in Pulse.';
  $('#sideBody').innerHTML=html;bindCommon();
}
function renderLocked(title,copy,cta){
  $('#panelTitle').textContent=title;$('#panelCopy').textContent=copy;
  $('#sideBody').innerHTML='<div class="locked-card"><div class="ey">KŌMØ ONE</div><h3>'+esc(title)+'</h3><p>'+esc(copy)+'</p><button data-connect-one>'+esc(cta)+'</button></div>';bindCommon();
}
function renderView(view){
  state.view=view;
  $$('.side-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.panelView===view));
  $$('.mobile-nav button').forEach(b=>b.classList.toggle('active',b.dataset.mobileView===view));
  if(view==='world')renderWorld();else if(view==='now')renderNow();else if(view==='moments')renderMoments();else if(view==='card')renderCard();else renderYou();
}

function openPlace(p){
  state.selected=p;
  analytics(p.visibility==='echelon'?'echelon_private_place_viewed':'place_viewed','world_place',p.id,{category:p.category,visibility:p.visibility});
  const vis=visibilityClass(p),cover=$('#detailCover');
  cover.className='detail-cover '+vis;
  $('#detailEy').textContent=vis==='echelon'?'KŌMØ ECHELON':vis==='one'?'KŌMØ ONE':'KŌMØ SELECTED';
  $('#detailName').textContent=p.name;$('#detailLocation').textContent=(p.city||p.destination)+' · '+(categoryLabel[p.category]||p.category);
  $('#detailWhy').textContent=p.editorial_reason||p.summary||'Selected for its relevance to the KŌMØ World.';
  const privilege=p.privileges&&typeof p.privileges==='object'?p.privileges:{};
  $('#detailAccess').innerHTML='<b>'+(privilege.label|| (vis==='echelon'?'ECHELON ACCESS':vis==='one'?'MEMBER ACCESS':'KŌMØ SELECTED'))+'</b><p>'+esc(p.summary||'Curated by KŌMØ.')+'</p>';
  let actions='';
  if(has('world.saved_places.manage'))actions+='<button class="primary" data-save-place="'+p.id+'">'+(state.saved.has(p.id)?'SAVED TO MY WORLD':'SAVE TO MY WORLD')+'</button>';
  else actions+='<button class="primary" data-connect-one>MAKE WORLD YOURS</button>';
  if(has('concierge.request'))actions+='<button data-ask-place="'+p.id+'">ASK KŌMØ</button>';
  actions+='<a href="'+directionsUrl(p)+'" target="_blank" rel="noopener">DIRECTIONS</a>';
  $('#detailActions').innerHTML=actions;
  $('#detailSheet').classList.add('open');$('#detailSheet').setAttribute('aria-hidden','false');
  map.easeTo({center:[p.longitude,p.latitude],zoom:Math.max(map.getZoom(),13),duration:700});
  bindCommon();
}

async function toggleSaved(id){
  if(!state.session?.user||!has('world.saved_places.manage'))return connectPulse();
  const uid=state.session.user.id;
  if(state.saved.has(id)){
    const {error}=await supabase.from('world_saved_places').delete().eq('user_id',uid).eq('place_id',id);
    if(error)return toast('Could not remove this place.');
    state.saved.delete(id);toast('Removed from My World');
  }else{
    const {error}=await supabase.from('world_saved_places').insert({user_id:uid,place_id:id});
    if(error)return toast('Could not save this place.');
    state.saved.add(id);analytics('place_saved','world_place',id);toast('Saved to My World');
  }
  renderView(state.view);
  if(state.selected?.id===id)openPlace(state.selected);
}
async function requestEvent(id){
  const current=state.attendance.find(x=>x.event_id===id);
  if(current)return toast('Event status · '+current.status);
  const {error}=await supabase.from('world_event_attendance').insert({event_id:id,user_id:state.session.user.id,status:'requested'});
  if(error)return toast(error.message.includes('row-level')?'This event is not available with your access.':'Request could not be sent.');
  analytics('event_requested','world_event',id);toast('Access requested');await loadContent();renderView('now');
}
async function requestExperience(id){
  const current=state.experienceRequests.find(x=>x.experience_id===id);
  if(current)return toast('Experience status · '+current.status);
  const {error}=await supabase.from('world_experience_requests').insert({experience_id:id,user_id:state.session.user.id,status:'requested'});
  if(error)return toast(error.message.includes('row-level')?'This experience is not available with your access.':'Request could not be sent.');
  analytics('event_requested','world_experience',id);toast('Request sent');await loadContent();renderView(state.view==='moments'?'moments':'now');
}
async function savePreferences(){
  const interests=$$('.pref-chip input:checked').map(x=>x.value);
  const row={user_id:state.session.user.id,interests,home_destination:state.preferences?.home_destination||null,presence_opt_in:false,introductions_opt_in:false,updated_at:new Date().toISOString()};
  const {error}=await supabase.from('world_preferences').upsert(row,{onConflict:'user_id'});
  if(error)return toast('Preferences could not be saved.');
  state.preferences=row;toast('My World updated');
}
function claimCardModal(){
  const echelon=state.access.tier==='echelon';
  openModal('<button class="modal-close" data-modal-close>×</button><div class="ey">KŌMØ '+(echelon?'ECHELON':'ONE')+' CARD</div><h2>Claim your physical card.</h2><p>The card is your physical KŌMØ Identity Key. It carries no medical data.</p><form class="form-grid" id="cardClaimForm"><label class="field full"><span>NAME ON DELIVERY</span><input name="delivery_name" required></label><label class="field full"><span>ADDRESS</span><input name="delivery_address_line1" required></label><label class="field full"><span>ADDRESS LINE 2</span><input name="delivery_address_line2"></label><label class="field"><span>POSTCODE</span><input name="delivery_postal_code" required></label><label class="field"><span>CITY</span><input name="delivery_city" required></label><label class="field full"><span>COUNTRY</span><input name="delivery_country" required></label><button class="form-submit" type="submit">CLAIM YOUR KŌMØ '+(echelon?'ECHELON':'ONE')+' CARD</button><div class="form-note">Founding phase · no payment is requested. Production and delivery are confirmed manually by KŌMØ.</div></form>');
  prefillClaim().catch(()=>{});
  $('#cardClaimForm').addEventListener('submit',submitCardClaim);
}
async function prefillClaim(){
  const {data}=await supabase.from('profiles').select('display_name,first_name,last_name,address_line1,postal_code,city,country').eq('id',state.session.user.id).maybeSingle();
  if(!data)return;const f=$('#cardClaimForm');if(!f)return;
  f.delivery_name.value=data.display_name||[data.first_name,data.last_name].filter(Boolean).join(' ');
  f.delivery_address_line1.value=data.address_line1||'';f.delivery_postal_code.value=data.postal_code||'';f.delivery_city.value=data.city||'';f.delivery_country.value=data.country||'';
}
async function submitCardClaim(e){
  e.preventDefault();const fd=new FormData(e.currentTarget),row={user_id:state.session.user.id,card_type:state.access.tier,
    delivery_name:String(fd.get('delivery_name')||'').trim(),delivery_address_line1:String(fd.get('delivery_address_line1')||'').trim(),
    delivery_address_line2:String(fd.get('delivery_address_line2')||'').trim()||null,delivery_postal_code:String(fd.get('delivery_postal_code')||'').trim(),
    delivery_city:String(fd.get('delivery_city')||'').trim(),delivery_country:String(fd.get('delivery_country')||'').trim()};
  const {error}=await supabase.from('world_card_claims').insert(row);
  if(error)return toast(error.message.includes('duplicate')?'A card claim is already active.':'Card claim could not be submitted.');
  analytics('physical_card_requested','world_card_claim',null,{card_type:state.access.tier});closeModal();toast('Card claim received');await loadContent();renderCard();
}

function askModal(defaultText=''){
  if(!has('concierge.request'))return;
  const priority=has('concierge.priority');
  openModal('<button class="modal-close" data-modal-close>×</button><div class="ey">ASK KŌMØ'+(priority?' · PRIORITY':'')+'</div><h2>What do you need?</h2><p>One request. A human response from the KŌMØ network.</p><div class="quick-asks"><button data-quick="Dinner tonight.">Dinner tonight</button><button data-quick="Find a yacht tomorrow.">Yacht tomorrow</button><button data-quick="Arrange recovery at my villa.">Recovery at my villa</button><button data-quick="Something exceptional tomorrow.">Something exceptional</button></div><form class="form-grid" id="askForm"><label class="field full"><span>REQUEST</span><textarea name="prompt" required minlength="3" maxlength="1200">'+esc(defaultText)+'</textarea></label><label class="field"><span>DESTINATION</span><input name="destination" placeholder="Monaco, Cannes…"></label><label class="field"><span>WHEN</span><input name="requested_for" type="datetime-local"></label><button class="form-submit" type="submit">SEND TO KŌMØ</button><div class="form-note">Your request is sent to KŌMØ Intelligence for human handling. It is not an automated booking.</div></form>');
  $$('[data-quick]').forEach(b=>b.onclick=()=>{$('#askForm textarea').value=b.dataset.quick});
  $('#askForm').addEventListener('submit',submitAsk);
}
async function submitAsk(e){
  e.preventDefault();const fd=new FormData(e.currentTarget);
  const row={user_id:state.session.user.id,request_type:'ask_komo',prompt:String(fd.get('prompt')||'').trim(),destination:String(fd.get('destination')||'').trim()||null,requested_for:fd.get('requested_for')?new Date(String(fd.get('requested_for'))).toISOString():null,priority:has('concierge.priority')?'priority':'standard'};
  const {error}=await supabase.from('world_concierge_requests').insert(row);
  if(error)return toast('Ask KŌMØ could not be sent.');
  analytics('ask_komo_created','concierge_request',null,{priority:row.priority});closeModal();toast('KŌMØ received your request');
}
function openModal(html){$('#modalCard').innerHTML=html;$('#modalShell').classList.add('open');$('#modalShell').setAttribute('aria-hidden','false');$$('[data-modal-close]').forEach(x=>x.onclick=closeModal)}
function closeModal(){$('#modalShell').classList.remove('open');$('#modalShell').setAttribute('aria-hidden','true')}

async function startOne(){
  if(state.session?.user&&!member()){window.location.href=pulseUrl();return}
  const result=await connectPulse();if(result==='pending')toast('Pulse opened · confirm your identity');else if(result==='connected'){await refreshAll();renderView('you')}
}
async function signOut(){await disconnectWorld();state.session=null;await refreshAll({fly:true});toast('World is now public')}

function bindCommon(){
  $$('[data-place]').forEach(el=>el.onclick=()=>openPlace(state.places.find(p=>p.id===el.dataset.place)));
  $$('[data-connect-one]').forEach(el=>el.onclick=startOne);
  $$('[data-save-place]').forEach(el=>el.onclick=()=>toggleSaved(el.dataset.savePlace));
  $('[data-event-request]').forEach(el=>el.onclick=()=>requestEvent(el.dataset.eventRequest));
  $('[data-experience-request]').forEach(el=>el.onclick=()=>requestExperience(el.dataset.experienceRequest));
  $('[data-event-view]').forEach(el=>el.onclick=()=>eventDetail(state.events.find(x=>x.id===el.dataset.eventView)));
  $('[data-experience-view]').forEach(el=>el.onclick=()=>experienceDetail(state.experiences.find(x=>x.id===el.dataset.experienceView)));
  $('[data-moment-tab]').forEach(el=>el.onclick=()=>{state.momentTab=el.dataset.momentTab;renderMoments()});
  $$('[data-claim-card]').forEach(el=>el.onclick=claimCardModal);
  $$('[data-save-preferences]').forEach(el=>el.onclick=savePreferences);
  $$('[data-sign-out]').forEach(el=>el.onclick=signOut);
  $('[data-ask-place]').forEach(el=>el.onclick=()=>{const p=state.places.find(x=>x.id===el.dataset.askPlace);askModal('Help me with '+(p?.name||'this place')+'.')});
  $('[data-ask-event]').forEach(el=>el.onclick=()=>{const e=state.events.find(x=>x.id===el.dataset.askEvent);askModal('Help me with access to '+(e?.title||'this event')+'.')});
  $('[data-ask-experience]').forEach(el=>el.onclick=()=>{const x=state.experiences.find(v=>v.id===el.dataset.askExperience);askModal('Help me arrange '+(x?.title||'this experience')+'.')});
}
function search(term){
  const q=String(term||'').trim().toLowerCase(),box=$('#searchResults');
  if(!q){box.hidden=true;box.innerHTML='';return}
  const found=state.places.filter(p=>(p.name+' '+p.city+' '+p.destination+' '+p.category).toLowerCase().includes(q)).slice(0,8);
  box.innerHTML=found.length?found.map(p=>'<button data-search-place="'+p.id+'"><b>'+esc(p.name)+'</b><span>'+esc(categoryLabel[p.category]||p.category)+' · '+esc(p.city||p.destination)+'</span></button>').join(''):'<div class="empty">No KŌMØ Selected place found.</div>';
  box.hidden=false;$$('[data-search-place]').forEach(b=>b.onclick=()=>{box.hidden=true;$('#searchInput').value='';openPlace(state.places.find(p=>p.id===b.dataset.searchPlace))});
}
async function nearMe(){
  const box=$('#nearSummary');
  if(!navigator.geolocation){box.textContent='Location is not available on this device.';box.classList.add('open');return}
  $('#nearBtn').classList.add('active');box.textContent='Finding what matters around you…';box.classList.add('open');
  navigator.geolocation.getCurrentPosition(pos=>{
    state.near={lat:pos.coords.latitude,lng:pos.coords.longitude};analytics('near_me_used',null,null,{accuracy_bucket:pos.coords.accuracy<100?'under_100m':'coarse'});
    const nearby=state.places.filter(p=>km(state.near.lat,state.near.lng,p.latitude,p.longitude)<=15);
    const today=state.events.filter(e=>{const d=new Date(e.starts_at),n=new Date();return d.toDateString()===n.toDateString()}).length;
    const week=state.events.filter(e=>{const ms=new Date(e.starts_at)-Date.now();return ms>=0&&ms<=7*86400000}).length;
    box.innerHTML='<b>'+nearby.length+' KŌMØ places nearby</b><br>'+today+' experience'+(today===1?'':'s')+' today · '+week+' event'+(week===1?'':'s')+' this week';
    map.easeTo({center:[state.near.lng,state.near.lat],zoom:12,duration:700});renderMarkers();renderView(state.view);
  },()=>{
    state.near=null;$('#nearBtn').classList.remove('active');box.textContent='Location was not shared. World still works without it.';
  },{enableHighAccuracy:false,timeout:7000,maximumAge:300000});
}

function add3DBuildings(){
  try{
    if(!map.getSource('openmaptiles')||map.getLayer('komo-buildings'))return;
    const labels=map.getStyle().layers.find(l=>l.type==='symbol'&&l.layout?.['text-field']);
    map.addLayer({id:'komo-buildings',type:'fill-extrusion',source:'openmaptiles','source-layer':'building',minzoom:14,
      paint:{'fill-extrusion-color':'#d3cdc2','fill-extrusion-height':['coalesce',['to-number',['get','render_height']],['to-number',['get','height']],7],
        'fill-extrusion-base':['coalesce',['to-number',['get','render_min_height']],['to-number',['get','min_height']],0],'fill-extrusion-opacity':.62}},labels?.id);
  }catch(e){console.warn('[World 3D]',e)}
}

map.on('load',async()=>{
  analytics('world_opened');
  add3DBuildings();
  const q=new URLSearchParams(location.search);
  const initial=['world','now','moments','card','you'].includes(q.get('view'))?q.get('view'):'world';
  state.view=initial;
  await refreshAll();
  renderView(initial);
  setTimeout(()=>$('#worldIntro').classList.add('hidden'),700);
});
map.on('click',()=>$('#detailSheet').classList.remove('open'));

$$('[data-detail-close]').forEach(x=>x.onclick=()=>{$('#detailSheet').classList.remove('open');$('#detailSheet').setAttribute('aria-hidden','true')});
$$('[data-modal-close]').forEach(x=>x.onclick=closeModal);
$$('[data-panel-view]').forEach(b=>b.onclick=()=>renderView(b.dataset.panelView));
$$('[data-mobile-view]').forEach(b=>b.onclick=()=>renderView(b.dataset.mobileView));
$$('[data-intent]').forEach(b=>b.onclick=()=>{state.intent=b.dataset.intent;$$('[data-intent]').forEach(x=>x.classList.toggle('active',x===b));renderMarkers();renderView('world')});
$('#nearBtn').onclick=nearMe;
$('#viewToggle').onclick=()=>{state.pitched=!state.pitched;map.easeTo({pitch:state.pitched?50:0,bearing:state.pitched?-10:0,duration:600});$('#viewToggle').innerHTML=state.pitched?'2D':'<b>3D</b>'};
$('#recenterBtn').onclick=()=>{state.near=null;$('#nearBtn').classList.remove('active');$('#nearSummary').classList.remove('open');map.easeTo({center:[7.02,43.49],zoom:9.05,pitch:state.pitched?45:0,bearing:state.pitched?-8:0,duration:700});renderMarkers();renderView(state.view)};
$('#searchInput').oninput=e=>search(e.target.value);
$('#signInBtn').onclick=()=>member()?renderView('card'):startOne();
$('#memberPill').onclick=()=>renderView(member()?'you':'world');
$('#pulseBtn').onclick=()=>window.location.href=pulseUrl();
$('#askBtn').onclick=()=>askModal();
onSession(async()=>{await refreshAll();toast(member()?'Welcome to '+labelTier():'KŌMØ identity recognised')});
document.addEventListener('click',e=>{if(!e.target.closest('.search'))$('#searchResults').hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#detailSheet').classList.remove('open');closeModal()}});

setTimeout(()=>$('#worldIntro').classList.add('hidden'),1800);

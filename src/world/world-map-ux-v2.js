const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function state(){return window.__KOMO_WORLD_STATE||null}
function map(){return window.__KOMO_WORLD_MAP||null}
function futureEvents(){
  const st=state(); if(!st)return[];
  const now=Date.now();return (st.events||[]).filter(e=>!e.ends_at||new Date(e.ends_at).getTime()>=now);
}
function weekEvents(){
  const now=Date.now(),week=now+7*86400000;
  return futureEvents().filter(e=>{const t=new Date(e.starts_at).getTime();return Number.isFinite(t)&&t>=now&&t<=week});
}
function visiblePlaces(){
  const st=state(); if(!st)return[];
  if(st.intent&&st.intent!=='all')return (st.places||[]).filter(p=>p.category===st.intent);
  return st.places||[];
}
function counts(){
  const st=state()||{};
  return {places:visiblePlaces().length,events:weekEvents().length,experiences:(st.experiences||[]).length};
}
function ensureSummary(){
  const hero=$('.hero-copy');if(!hero)return;
  let box=hero.querySelector('.world-live-summary');
  if(!box){box=document.createElement('div');box.className='world-live-summary';hero.appendChild(box)}
  const c=counts();
  box.innerHTML='<div><strong>'+c.places+'</strong><span>selected places</span></div><div><strong>'+c.events+'</strong><span>events this week</span></div><div><strong>'+c.experiences+'</strong><span>experiences</span></div>';
}
function ensureGuide(){
  if($('.map-guide'))return;
  const n=document.createElement('nav');n.className='map-guide';n.setAttribute('aria-label','Explore KŌMØ World');
  n.innerHTML='<span class="map-guide-label">EXPLORE</span><button class="active" data-guide="places">PLACES</button><button data-guide="events">EVENTS</button><button data-guide="experiences">EXPERIENCES</button><button data-guide="near">NEAR ME</button><button data-guide="all">SHOW ALL</button>';
  $('#app')?.appendChild(n);
  $$('[data-guide]').forEach(b=>b.addEventListener('click',()=>{
    $$('[data-guide]').forEach(x=>x.classList.toggle('active',x===b));
    document.body.classList.add('map-engaged');
    const v=b.dataset.guide;
    if(v==='places')$('[data-panel-view="world"]')?.click();
    if(v==='events')$('[data-dock="events"]')?.click();
    if(v==='experiences')$('[data-eco="experiences"]')?.click();
    if(v==='near')$('#nearBtn')?.click();
    if(v==='all')$('#recenterBtn')?.click();
  }));
}
function ensureDestinations(){
  if($('.destination-rail'))return;
  const n=document.createElement('div');n.className='destination-rail';
  n.innerHTML='<button class="active" data-destination="riviera">RIVIERA</button><button data-destination="cannes">CANNES</button><button data-destination="monaco">MONACO</button><button data-destination="saint-tropez">SAINT-TROPEZ</button>';
  $('#app')?.appendChild(n);
  const points={riviera:[7.02,43.49,9.2],cannes:[7.0174,43.5528,12.2],monaco:[7.4246,43.7384,12.2],'saint-tropez':[6.6407,43.2677,11.8]};
  $('[data-destination]').forEach(b=>b.addEventListener('click',()=>{
    $('[data-destination]').forEach(x=>x.classList.toggle('active',x===b));
    document.body.classList.add('map-engaged');
    const p=points[b.dataset.destination];const m=map();if(!p||!m)return;
    m.easeTo({center:[p[0],p[1]],zoom:p[2],pitch:0,bearing:0,duration:650});
  }));
}
window.addEventListener('komo:open-experiences',()=>document.querySelector('[data-eco="experiences"]')?.click());

function ensureLegend(){
  if($('.map-legend'))return;
  const n=document.createElement('div');n.className='map-legend';n.innerHTML=
    '<span class="komo"><i>KØ</i>KŌMØ</span><span><i>STAY</i>Stay</span><span><i>EAT</i>Eat</span><span><i>MOVE</i>Move</span><span><i>REC</i>Recover</span><span><i>EXP</i>Experience</span><span class="event"><i>✦</i>Event</span>';
  $('#app')?.appendChild(n);
}
function overviewMarkup(){
  const c=counts();
  return '<section class="world-overview" data-world-overview><div class="ey">YOUR KŌMØ LENS</div><h3>Explore less. Discover better.</h3><p>Selected places, moments and experiences across the Riviera — curated rather than exhaustive.</p><div class="world-stat-grid"><div class="world-stat"><b>'+c.places+'</b><span>places</span></div><div class="world-stat"><b>'+c.events+'</b><span>this week</span></div><div class="world-stat"><b>'+c.experiences+'</b><span>experiences</span></div></div><div class="world-action-row"><button class="primary" data-overview-action="places">PLACES</button><button data-overview-action="events">EVENTS</button><button data-overview-action="experiences">EXPERIENCES</button><button data-overview-action="near">NEAR ME</button></div></section>';
}
let enhancing=false;
function enhancePanel(){
  if(enhancing)return; const st=state(),body=$('#sideBody');if(!st||!body)return;
  if(st.view!=='world')return;
  if(body.querySelector('[data-world-overview]'))return;
  enhancing=true;
  body.insertAdjacentHTML('afterbegin',overviewMarkup());
  $$('[data-overview-action]').forEach(b=>b.addEventListener('click',()=>{
    const v=b.dataset.overviewAction;
    if(v==='places')$('[data-panel-view="world"]')?.click();
    if(v==='events')$('[data-dock="events"]')?.click();
    if(v==='experiences')$('[data-eco="experiences"]')?.click();
    if(v==='near')$('#nearBtn')?.click();
  }));
  enhancing=false;
}
function markEngaged(){
  document.body.classList.add('map-engaged');
}
function init(){
  ensureGuide();ensureDestinations();ensureLegend();ensureSummary();enhancePanel();
  const hero=$('.hero-copy');hero?.addEventListener('click',markEngaged,{once:true});
  $('#map')?.addEventListener('pointerdown',markEngaged,{passive:true});
  $('#searchInput')?.addEventListener('focus',markEngaged);
  $('#intentBar')?.addEventListener('click',()=>{markEngaged();setTimeout(()=>{ensureSummary();enhancePanel()},40)});
  const body=$('#sideBody');
  if(body)new MutationObserver(()=>{if(!enhancing){setTimeout(()=>{ensureSummary();enhancePanel()},0)}}).observe(body,{childList:true});
  window.addEventListener('komo:world-ready',()=>{ensureSummary();enhancePanel()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

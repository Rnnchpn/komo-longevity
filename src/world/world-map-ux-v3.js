const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const centers={
  all:[7.02,43.53,9.35],
  cannes:[7.0174,43.5528,12.0],
  monaco:[7.4246,43.7384,12.0],
  'saint-tropez':[6.6407,43.2677,11.7]
};
function st(){return window.__KOMO_WORLD_STATE||null}
function mp(){return window.__KOMO_WORLD_MAP||null}
function norm(v){return String(v||'').toLowerCase().replace(/[’']/g,'').replace(/\s+/g,'-')}
function matches(item,dest){
  if(!dest||dest==='all')return true;
  const hay=[item?.destination,item?.city].map(norm),wanted=norm(dest);
  return hay.some(v=>v.includes(wanted)||(wanted==='saint-tropez'&&(v.includes('st-tropez')||v.includes('sainttropez'))));
}
function countVisible(){
  const s=st();if(!s)return{places:0,events:0,experiences:0};
  const dest=s.destination||'all';
  const places=(s.places||[]).filter(x=>matches(x,dest)).filter(x=>s.intent==='all'||x.category===s.intent);
  const events=(s.events||[]).filter(x=>matches(x,dest)).filter(x=>!x.ends_at||new Date(x.ends_at).getTime()>=Date.now());
  const experiences=(s.experiences||[]).filter(x=>matches(x,dest));
  return{
    places:places.length||s.markers?.size||0,
    events:events.length||s.eventMarkers?.size||0,
    experiences:experiences.length||s.experienceMarkers?.size||0
  };
}
function updateSummary(){
  const hero=$('.hero-copy');if(!hero)return;
  let box=hero.querySelector('.world-summary');if(!box){box=document.createElement('div');box.className='world-summary';hero.appendChild(box)}
  const c=countVisible();
  box.innerHTML='<span><b>'+c.places+'</b> places</span><span><b>'+c.events+'</b> events</span><span><b>'+c.experiences+'</b> experiences</span>';
}
function currentView(){return st()?.view||'world'}
function modeName(view){return view==='world'?'places':view}
function setMode(mode){
  const view=mode==='places'?'world':mode;
  window.__KOMO_SET_VIEW?.(view);
  document.body.dataset.worldMode=mode;
  document.body.classList.add('map-engaged');
  $$$('.world-modebar button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  updateSummary();
}
function setDestination(dest){
  const s=st();if(s?.near){
    window.__KOMO_CLEAR_LOCATION?.();
    document.querySelector('#nearSummary')?.classList.remove('open');
    const near=document.querySelector('#nearBtn');if(near){near.classList.remove('active');near.textContent='◎ AROUND ME'}
  }
  window.__KOMO_SET_DESTINATION?.(dest);
  $$('.world-destinations button').forEach(b=>b.classList.toggle('active',b.dataset.destination===dest));
  document.body.classList.add('map-engaged');
  requestAnimationFrame(()=>window.__KOMO_FIT_VISIBLE?.({duration:620,maxZoom:12.8}));
  updateSummary();
}
function buildModebar(){
  if($('.world-modebar'))return;
  const n=document.createElement('nav');n.className='world-modebar';n.setAttribute('aria-label','Choose what to explore');
  n.innerHTML='<button class="active" data-mode="places">PLACES</button><button data-mode="events">EVENTS</button><button data-mode="experiences">EXPERIENCES</button>';
  $('#app')?.appendChild(n);
  $$('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
}
function buildDestinations(){
  if($('.world-destinations'))return;
  const n=document.createElement('nav');n.className='world-destinations';n.setAttribute('aria-label','Choose destination');
  n.innerHTML='<button class="active" data-destination="all">RIVIERA</button><button data-destination="cannes">CANNES</button><button data-destination="monaco">MONACO</button><button data-destination="saint-tropez">SAINT-TROPEZ</button>';
  $('#app')?.appendChild(n);
  $$('[data-destination]').forEach(b=>b.onclick=()=>setDestination(b.dataset.destination));
}
function buildListToggle(){
  if($('.world-list-toggle'))return;
  const b=document.createElement('button');b.className='world-list-toggle';b.type='button';b.textContent='HIDE LIST';
  $('#app')?.appendChild(b);
  b.onclick=()=>{const collapsed=document.body.classList.toggle('panel-collapsed');b.textContent=collapsed?'SHOW LIST':'HIDE LIST'};
}
function syncFromState(){
  const s=st();if(!s)return;
  const mode=modeName(s.view);
  document.body.dataset.worldMode=['places','events','experiences'].includes(mode)?mode:'places';
  document.body.classList.toggle('map-zoom-detail',(mp()?.getZoom?.()||0)>=10.7);
  $$('.world-modebar button').forEach(b=>b.classList.toggle('active',b.dataset.mode===document.body.dataset.worldMode));
  $$('.world-destinations button').forEach(b=>b.classList.toggle('active',b.dataset.destination===(s.destination||'all')));
  updateSummary();
}
function init(){
  buildModebar();buildDestinations();buildListToggle();syncFromState();
  $('#map')?.addEventListener('pointerdown',()=>document.body.classList.add('map-engaged'),{passive:true});
  $('#searchInput')?.addEventListener('focus',()=>document.body.classList.add('map-engaged'));
  $('#intentBar')?.addEventListener('click',()=>setTimeout(updateSummary,30));
  mp()?.on?.('zoomend',syncFromState);
  window.addEventListener('komo:near-change',syncFromState);
  window.addEventListener('komo:world-ready',syncFromState);
  window.addEventListener('komo:view-change',syncFromState);
  const body=$('#sideBody');
  if(body)new MutationObserver(()=>updateSummary()).observe(body,{childList:true,subtree:true});
  [80,300,900,1800,3500].forEach(ms=>setTimeout(syncFromState,ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

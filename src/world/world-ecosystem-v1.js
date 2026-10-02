const HUB_ID='komoEcosystemHub';

function one(sel){return document.querySelector(sel)}
function all(sel){return [...document.querySelectorAll(sel)]}

const icons={
  map:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.8 7-12A7 7 0 0 0 5 9c0 6.2 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="1.45"/><circle cx="12" cy="9" r="2.15" fill="none" stroke="currentColor" stroke-width="1.45"/></svg>',
  events:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 3.8v4M16 3.8v4M4 9.5h16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  experiences:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.35"/><path d="m15.8 8.2-2.4 5.2-5.2 2.4 2.4-5.2 5.2-2.4Z" fill="none" stroke="currentColor" stroke-width="1.35"/></svg>',
  life:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.35"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>',
  pulse:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 13.2c2.2-5.2 4.4-5.2 6.6 0s4.4 5.2 6.6 0 3.8-5.2 4.8 0" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/></svg>',
  one:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.8 8.2 8.2-8.2 8.2L3.8 12 12 3.8Z" fill="none" stroke="currentColor" stroke-width="1.35"/></svg>'
};

function node(cls,target,title,copy,icon){
  return '<button class="ecosystem-node '+cls+'" data-eco="'+target+'" type="button"><span class="eco-icon">'+icons[icon]+'</span><span class="eco-copy"><strong>'+title+'</strong><small data-eco-copy="'+target+'">'+copy+'</small></span><span class="eco-arrow">›</span></button>';
}
function hubMarkup(){
  return '<section class="ecosystem-hub" id="'+HUB_ID+'" aria-label="KŌMØ World">' +
    '<div class="ecosystem-shell">' +
      '<div class="ecosystem-kicker"><b>KŌMØ WORLD</b><span class="eco-title">Choose your world.</span><span class="eco-tagline">Places · Events · Experiences · Life · Health · Access</span></div>' +
      '<button class="ecosystem-sphere" data-eco="world" type="button" aria-label="Enter KŌMØ World map">' +
        '<span class="sphere-orbit orbit-a"></span><span class="sphere-orbit orbit-b"></span>' +
        '<span class="ecosystem-core"><span class="ecosystem-core-inner"><b>KŌMØ</b><span>WORLD</span><em>ENTER MAP</em></span></span>' +
      '</button>' +
      node('events','events','Events',"What's happening",'events') +
      node('experiences','experiences','Experiences','Curated for you','experiences') +
      node('life','life','Life','Objects & essentials','life') +
      node('pulse','pulse','Pulse','Health & insights','pulse') +
      node('one','card','One','Identity & access','one') +
      '<div class="ecosystem-live" id="ecosystemLive">CURATED WORLD · LIVE</div>' +
      '<div class="ecosystem-caption">KŌMØ · ONE WORLD · FIVE DOORS</div>' +
    '</div>' +
  '</section>';
}
function setHub(open){
  const hub=one('#'+HUB_ID); if(!hub)return;
  hub.classList.toggle('is-hidden',!open);
  hub.setAttribute('aria-hidden',open?'false':'true');
  document.documentElement.classList.toggle('world-hub-open',open);
}
function openInternal(view){
  setHub(false);
  document.body.classList.add('map-engaged');
  const tab=one('[data-panel-view="'+view+'"]')||one('[data-mobile-view="'+view+'"]');
  if(tab)tab.click();
  else window.__KOMO_SET_VIEW?.(view);
}
function go(target){
  if(target==='world')return openInternal('world');
  if(target==='events')return openInternal('events');
  if(target==='experiences')return openInternal('experiences');
  if(target==='card')return openInternal('card');
  if(target==='life'){location.href='https://life.komolongevity.com/';return}
  if(target==='pulse'){location.href='https://pulse.komolongevity.com/';return}
}
function setCopy(key,value){
  const el=one('[data-eco-copy="'+key+'"]');if(el)el.textContent=value;
}
function refreshHubCounts(){
  const s=window.__KOMO_WORLD_STATE;if(!s)return;
  const places=Array.isArray(s.places)?s.places:[];
  const events=Array.isArray(s.events)?s.events:[];
  const experiences=Array.isArray(s.experiences)?s.experiences:[];
  const now=Date.now();
  const liveEvents=events.filter(e=>!e.ends_at||new Date(e.ends_at).getTime()>=now);
  const komoPlaces=places.filter(p=>String(p?.place_type||'').startsWith('komo_')||String(p?.name||'').startsWith('KŌMØ'));
  setCopy('world',(komoPlaces.length?komoPlaces.length+' KŌMØ · ':'')+places.length+' curated places');
  setCopy('events',liveEvents.length+' live & upcoming');
  setCopy('experiences',experiences.length+' curated experiences');
  const live=one('#ecosystemLive');
  if(live)live.textContent='LIVE WORLD · '+places.length+' PLACES · '+liveEvents.length+' EVENTS · '+experiences.length+' EXPERIENCES';
}
function buildDock(){
  if(one('.ecosystem-dock'))return;
  const dock=document.createElement('nav');
  dock.className='ecosystem-dock';
  dock.setAttribute('aria-label','KŌMØ ecosystem');
  dock.innerHTML='<button class="active" data-dock="world">WORLD</button><button data-dock="events">EVENTS</button><button data-dock="experiences">EXPERIENCES</button><button data-dock="life">LIFE</button><button data-dock="pulse">PULSE</button><button data-dock="you">YOU</button>';
  one('#app')?.appendChild(dock);
  all('[data-dock]').forEach(btn=>btn.addEventListener('click',()=>{
    all('[data-dock]').forEach(x=>x.classList.toggle('active',x===btn));
    if(btn.dataset.dock==='you')openInternal('you'); else go(btn.dataset.dock);
  }));
}
function patchNavigation(){
  const mobile=one('.mobile-nav');
  if(mobile){
    mobile.innerHTML='<button class="active" data-eco-mobile="world">WORLD</button><button data-eco-mobile="events">EVENTS</button><button data-eco-mobile="experiences">EXP.</button><button data-eco-mobile="pulse">PULSE</button><button data-eco-mobile="you">YOU</button>';
    all('[data-eco-mobile]').forEach(btn=>btn.addEventListener('click',()=>{
      all('[data-eco-mobile]').forEach(x=>x.classList.toggle('active',x===btn));
      const v=btn.dataset.ecoMobile;
      if(v==='you')openInternal('you'); else go(v);
    }));
  }
  const pulse=one('#pulseBtn');
  if(pulse&&!one('.top-actions [data-life-link]')){
    const life=document.createElement('button');
    life.className='top-btn';life.type='button';life.dataset.lifeLink='1';life.textContent='LIFE';life.addEventListener('click',()=>go('life'));
    pulse.parentNode?.insertBefore(life,pulse);
  }
}
function init(){
  one('#worldIntro')?.classList.add('hidden');
  if(!one('#'+HUB_ID)){
    document.body.insertAdjacentHTML('beforeend',hubMarkup());
    all('[data-eco]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.eco)));
  }
  patchNavigation();
  buildDock();
  const brand=one('.topbar .brand');
  if(brand){
    brand.setAttribute('role','button');brand.setAttribute('tabindex','0');brand.title='Open KŌMØ World';
    brand.addEventListener('click',()=>setHub(true));
    brand.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setHub(true)}});
  }
  window.addEventListener('komo:world-ready',refreshHubCounts);
  window.addEventListener('komo:view-change',refreshHubCounts);
  setTimeout(refreshHubCounts,250);
  setTimeout(refreshHubCounts,1200);
  setHub(true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

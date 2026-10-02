const HUB_ID='komoEcosystemHub';

function one(sel){return document.querySelector(sel)}
function all(sel){return [...document.querySelectorAll(sel)]}

const icons={
  events:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.45"/><path d="M8 3.8v4M16 3.8v4M4 9.5h16" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/></svg>',
  experiences:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.5 5.3L20 11l-5.5 2.7L12 19l-2.5-5.3L4 11l5.5-2.7L12 3Z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  life:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l1.8 13H5.2L7 7Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  pulse:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h4l2-5 4 10 2.2-5H21" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  one:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.8 8.2 8.2-8.2 8.2L3.8 12 12 3.8Z" fill="none" stroke="currentColor" stroke-width="1.35"/></svg>'
};

function node(cls,target,title,copy,icon,color){
  return '<button class="ecosystem-node '+cls+'" data-eco="'+target+'" style="--node-accent:'+color+'" type="button">'+
    '<span class="eco-icon">'+icons[icon]+'</span>'+
    '<span class="eco-copy"><strong>'+title+'</strong><small data-eco-copy="'+target+'">'+copy+'</small></span>'+
  '</button>';
}

function hubMarkup(){
  return '<section class="ecosystem-hub" id="'+HUB_ID+'" aria-label="KŌMØ World">' +
    '<div class="ecosystem-aurora a1"></div><div class="ecosystem-aurora a2"></div><div class="ecosystem-aurora a3"></div>'+
    '<div class="ecosystem-shell">' +
      '<div class="ecosystem-kicker"><b>KŌMØ WORLD</b><span class="eco-title">Your world, in motion.</span><span class="eco-tagline">Explore · Connect · Live · Evolve</span></div>' +
      '<button class="ecosystem-sphere" data-eco="map" type="button" aria-label="Open My World map">' +
        '<span class="sphere-halo"></span><span class="sphere-orbit orbit-a"></span><span class="sphere-orbit orbit-b"></span><span class="sphere-orbit orbit-c"></span>' +
        '<span class="ecosystem-core"><span class="ecosystem-core-inner"><small>KŌMØ</small><b>MY WORLD</b><span>MAP · PLACES · PEOPLE</span><em>OPEN MAP</em></span></span>' +
      '</button>' +
      node('events','events','EVENTS',"What's happening",'events','#9ebbd0') +
      node('experiences','experiences','EXPERIENCES','Curated moments','experiences','#b8a7cf') +
      node('life','life','KŌMØ LIFE','Objects & essentials','life','#a8bea0') +
      node('pulse','pulse','PULSE','Health & progress','pulse','#d4a291') +
      node('one','card','MY ONE','Identity & access','one','#c4a46e') +
      '<div class="ecosystem-live" id="ecosystemLive">WORLD LOADING</div>' +
      '<div class="ecosystem-caption">ONE IDENTITY · ONE WORLD · EVERY EXPERIENCE CONNECTED</div>' +
    '</div>' +
  '</section>';
}

function setHub(open){
  const hub=one('#'+HUB_ID);if(!hub)return;
  hub.classList.toggle('is-hidden',!open);
  hub.setAttribute('aria-hidden',open?'false':'true');
  document.documentElement.classList.toggle('world-hub-open',open);
}

function openView(view){
  setHub(false);
  document.body.classList.add('map-engaged');
  document.body.classList.remove('panel-collapsed');
  window.__KOMO_SET_VIEW?.(view);
}

function go(target){
  if(target==='map')return openView('world');
  if(target==='myworld')return openView('myworld');
  if(target==='events')return openView('events');
  if(target==='experiences')return openView('experiences');
  if(target==='card')return openView('card');
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
  const liveEvents=events.filter(e=>!e.ends_at||new Date(e.ends_at).getTime()>=Date.now());
  setCopy('events',liveEvents.length+' live & upcoming');
  setCopy('experiences',experiences.length+' curated moments');
  const live=one('#ecosystemLive');
  if(live)live.textContent=places.length+' PLACES · '+liveEvents.length+' EVENTS · '+experiences.length+' EXPERIENCES';
}

function dockButton(target,label,icon){
  const svg=target==='events'?icons.events:target==='experiences'?icons.experiences:target==='life'?icons.life:target==='pulse'?icons.pulse:target==='card'?icons.one:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.4"/></svg>';
  return '<button data-dock="'+target+'" type="button"><span>'+svg+'</span><b>'+label+'</b></button>';
}

function buildDock(){
  if(one('.ecosystem-dock'))return;
  const dock=document.createElement('nav');
  dock.className='ecosystem-dock';
  dock.setAttribute('aria-label','KŌMØ World navigation');
  dock.innerHTML=
    dockButton('myworld','MY WORLD')+
    dockButton('events','EVENTS')+
    dockButton('experiences','EXPERIENCES')+
    dockButton('life','LIFE')+
    dockButton('pulse','PULSE')+
    dockButton('card','MY ONE');
  one('#app')?.appendChild(dock);
  all('[data-dock]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.dock)));
}

function syncDock(view){
  const target=view==='myworld'?'myworld':view==='events'?'events':view==='experiences'?'experiences':view==='card'?'card':null;
  all('[data-dock]').forEach(btn=>btn.classList.toggle('active',btn.dataset.dock===target));
}

function patchMobileNavigation(){
  const mobile=one('.mobile-nav');if(!mobile)return;
  mobile.innerHTML=
    '<button data-eco-mobile="myworld">MY WORLD</button>'+
    '<button data-eco-mobile="events">EVENTS</button>'+
    '<button data-eco-mobile="experiences">EXP.</button>'+
    '<button data-eco-mobile="life">LIFE</button>'+
    '<button data-eco-mobile="pulse">PULSE</button>'+
    '<button data-eco-mobile="card">ONE</button>';
  all('[data-eco-mobile]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.ecoMobile)));
}

function patchTopNavigation(){
  const pulse=one('#pulseBtn');
  if(pulse&&!one('.top-actions [data-life-link]')){
    const life=document.createElement('button');
    life.className='top-btn';life.type='button';life.dataset.lifeLink='1';life.textContent='LIFE';
    life.addEventListener('click',()=>go('life'));
    pulse.parentNode?.insertBefore(life,pulse);
  }
}

function init(){
  one('#worldIntro')?.classList.add('hidden');
  if(!one('#'+HUB_ID)){
    document.body.insertAdjacentHTML('beforeend',hubMarkup());
    all('[data-eco]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.eco)));
  }
  buildDock();
  patchMobileNavigation();
  patchTopNavigation();

  const brand=one('.topbar .brand');
  if(brand){
    brand.setAttribute('role','button');brand.setAttribute('tabindex','0');brand.title='Open KŌMØ World';
    brand.addEventListener('click',()=>setHub(true));
    brand.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setHub(true)}});
  }

  window.addEventListener('komo:world-ready',refreshHubCounts);
  window.addEventListener('komo:view-change',e=>{refreshHubCounts();syncDock(e.detail?.view)});
  setTimeout(refreshHubCounts,250);
  setTimeout(refreshHubCounts,1200);
  setHub(true);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

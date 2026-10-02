const HUB_ID='komoEcosystemHub';

function one(sel){return document.querySelector(sel)}
function all(sel){return [...document.querySelectorAll(sel)]}

function hubMarkup(){
  return `<section class="ecosystem-hub" id="${HUB_ID}" aria-label="KŌMØ ecosystem">
    <div class="ecosystem-shell">
      <div class="ecosystem-kicker"><b>KŌMØ WORLD</b><span>Your world, curated.</span></div>
      <button class="ecosystem-node world" data-eco="world"><i>◎</i><span><b>WORLD</b><span>Places & map</span></span></button>
      <button class="ecosystem-node events" data-eco="events"><i>◷</i><span><b>EVENTS</b><span>What is happening</span></span></button>
      <button class="ecosystem-node experiences" data-eco="experiences"><i>✦</i><span><b>EXPERIENCES</b><span>What KŌMØ can arrange</span></span></button>
      <button class="ecosystem-node life" data-eco="life"><i>◇</i><span><b>LIFE</b><span>Objects & commerce</span></span></button>
      <button class="ecosystem-node pulse" data-eco="pulse"><i>∿</i><span><b>PULSE</b><span>Health & analyses</span></span></button>
      <button class="ecosystem-node card" data-eco="card"><i>▭</i><span><b>ONE / CARD</b><span>Identity & access</span></span></button>
      <div class="ecosystem-sphere"><div class="ecosystem-core"><span><b>KŌMØ</b><span>WORLD</span></span></div></div>
      <div class="ecosystem-caption">WORLD · EVENTS · EXPERIENCES · LIFE · PULSE · ONE</div>
    </div>
  </section>`;
}

function setHub(open){
  const hub=one('#'+HUB_ID); if(!hub)return;
  hub.classList.toggle('is-hidden',!open);
  hub.setAttribute('aria-hidden',open?'false':'true');
}
function openInternal(view){
  setHub(false);
  const tab=one('[data-panel-view="'+view+'"]')||one('[data-mobile-view="'+view+'"]');
  tab?.click();
}
function filterNow(kind){
  openInternal('now');
  requestAnimationFrame(()=>{
    const cards=all('#sideBody .event-card');
    cards.forEach(card=>{
      const label=(card.querySelector('.ey')?.textContent||'').toUpperCase();
      const isExp=label.includes('EXPERIENCE');
      card.style.display=(kind==='experiences'?isExp:!isExp)?'':'none';
    });
    const title=one('#panelTitle'),copy=one('#panelCopy');
    if(kind==='experiences'){
      if(title)title.textContent='EXPERIENCES';
      if(copy)copy.textContent='Curated KŌMØ experiences that can be requested, arranged or accessed through the network.';
    }else{
      if(title)title.textContent='KŌMØ EVENTS';
      if(copy)copy.textContent='What is happening across the KŌMØ World — public, member and private layers.';
    }
  });
}
function go(target){
  if(target==='world')return openInternal('world');
  if(target==='events')return filterNow('events');
  if(target==='experiences')return filterNow('experiences');
  if(target==='card')return openInternal('card');
  if(target==='life'){location.href='https://life.komolongevity.com/';return}
  if(target==='pulse'){location.href='https://pulse.komolongevity.com/';return}
}
function buildDock(){
  if(one('.ecosystem-dock'))return;
  const dock=document.createElement('nav');
  dock.className='ecosystem-dock';
  dock.setAttribute('aria-label','KŌMØ ecosystem');
  dock.innerHTML='<button class="active" data-dock="world">WORLD</button><button data-dock="events">EVENTS</button><button data-dock="life">LIFE</button><button data-dock="pulse">PULSE</button><button data-dock="you">YOU</button>';
  one('#app')?.appendChild(dock);
  all('[data-dock]').forEach(btn=>btn.addEventListener('click',()=>{
    all('[data-dock]').forEach(x=>x.classList.toggle('active',x===btn));
    if(btn.dataset.dock==='you')openInternal('you'); else go(btn.dataset.dock);
  }));
}
function patchNavigation(){
  const nowTab=one('[data-panel-view="now"]'); if(nowTab)nowTab.textContent='EVENTS';
  const mobileNow=one('[data-mobile-view="now"]'); if(mobileNow)mobileNow.textContent='EVENTS';

  const mobile=one('.mobile-nav');
  if(mobile){
    mobile.innerHTML='<button class="active" data-eco-mobile="world">WORLD</button><button data-eco-mobile="events">EVENTS</button><button data-eco-mobile="life">LIFE</button><button data-eco-mobile="pulse">PULSE</button><button data-eco-mobile="you">YOU</button>';
    all('[data-eco-mobile]').forEach(btn=>btn.addEventListener('click',()=>{
      all('[data-eco-mobile]').forEach(x=>x.classList.toggle('active',x===btn));
      const v=btn.dataset.ecoMobile;
      if(v==='you')openInternal('you'); else go(v);
    }));
  }

  const pulse=one('#pulseBtn');
  if(pulse){
    const life=document.createElement('button');
    life.className='top-btn';life.type='button';life.textContent='LIFE';life.addEventListener('click',()=>go('life'));
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
  if(brand){brand.setAttribute('role','button');brand.setAttribute('tabindex','0');brand.title='Open KŌMØ';brand.addEventListener('click',()=>setHub(true));brand.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')setHub(true)})}
  setHub(true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

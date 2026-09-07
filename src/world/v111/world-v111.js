const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const app=$('#app');
if(!app)throw new Error('KŌMØ World V0.11.1 polish could not attach');
app.dataset.visualPolish='v111';

const hub=$('#center-hub'),fitness=$('#fitness-room'),rehab=$('#rehab-room');
const rooms=[fitness,rehab].filter(Boolean);
const themeMeta=document.querySelector('meta[name="theme-color"]');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastFocus=null;

function setTheme(room){
  const color=room==='fitness'?'#24251d':room==='rehab'?'#18251d':'#cfc9b9';
  themeMeta?.setAttribute('content',color);
  document.body.dataset.centerRoom=room||'';
}

function addRoomBadges(){
  rooms.forEach(room=>{
    const shell=$('.room-shell',room);if(!shell||$('.v111-room-badge',shell))return;
    const badge=document.createElement('div');badge.className='v111-room-badge';
    badge.textContent=room===fitness?'KŌMØ · FITNESS FLOOR':'KŌMØ · TWIN-GUIDED REHAB';
    shell.appendChild(badge);
  });
}

function pointerGlow(node){
  if(!node||node.dataset.v111Pointer)return;node.dataset.v111Pointer='1';
  node.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch')return;
    const r=node.getBoundingClientRect();
    node.style.setProperty('--mx',`${((e.clientX-r.left)/Math.max(1,r.width))*100}%`);
    node.style.setProperty('--my',`${((e.clientY-r.top)/Math.max(1,r.height))*100}%`);
  },{passive:true});
  node.addEventListener('pointerleave',()=>{node.style.setProperty('--mx','50%');node.style.setProperty('--my','50%')},{passive:true});
}

function tagTiers(root=document){
  $$('.station',root).forEach(st=>{
    const tier=$('.tier',st)?.textContent?.trim().toUpperCase();
    if(tier)st.dataset.tier=tier;
  });
}

function revealStations(root){
  const stations=$$('.station,.rehab-station,.history-mini-row',root);
  stations.forEach((n,i)=>{
    if(n.classList.contains('station')){
      n.classList.remove('revealed');
      if(reduceMotion)n.classList.add('revealed');
      else setTimeout(()=>n.classList.add('revealed'),55+i*45);
    }
    pointerGlow(n);
  });
}

function animateNumber(el){
  if(!el||el.dataset.v111Animated)return;
  const raw=el.textContent.trim();
  const match=raw.match(/^([+−-]?)([\d\s,.]+)(%|\s?s|\s?reps?)?$/i);
  if(!match)return;
  const number=Number(match[2].replace(/\s/g,'').replace(',','.'));
  if(!Number.isFinite(number)||number===0)return;
  const prefix=match[1]||'',suffix=match[3]||'';el.dataset.v111Animated='1';el.classList.add('v111-counter');
  if(reduceMotion)return;
  const duration=430,start=performance.now();
  const decimals=String(number).includes('.')?1:0;
  const tick=now=>{const p=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-p,3),v=number*ease;el.textContent=`${prefix}${v.toFixed(decimals)}${suffix}`;if(p<1)requestAnimationFrame(tick);else el.textContent=raw};requestAnimationFrame(tick);
}

function animateCounters(root){
  $$('.room-summary strong,.record-line b,.rehab-progress-row b',root).forEach(animateNumber);
}

function animateProgress(root){
  $$('.rehab-fill',root).forEach(fill=>{
    const target=fill.style.width||'0%';
    if(fill.dataset.v111Progress===target)return;
    fill.dataset.v111Progress=target;
    if(reduceMotion)return;
    fill.style.width='0%';requestAnimationFrame(()=>requestAnimationFrame(()=>{fill.style.width=target}));
  });
}

function decorate(root){
  if(!root)return;
  pointerGlow(root);
  $$('.center-choice,.station,.rehab-station,.room-summary>div',root).forEach(pointerGlow);
  tagTiers(root);revealStations(root);animateCounters(root);animateProgress(root);
  $$('button',root).forEach(btn=>{
    if(btn.dataset.v111Press)return;btn.dataset.v111Press='1';
    btn.addEventListener('click',()=>{btn.classList.remove('v111-pulse');void btn.offsetWidth;btn.classList.add('v111-pulse')});
  });
}

function roomOpened(room){
  if(!room?.classList.contains('open'))return false;
  lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:lastFocus;
  const type=room===fitness?'fitness':'rehab';setTheme(type);decorate(room);
  requestAnimationFrame(()=>$('.room-close',room)?.focus({preventScroll:true}));
  return true;
}

function hubOpened(){
  if(!hub?.classList.contains('open'))return false;
  lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:lastFocus;
  setTheme('center');decorate(hub);
  requestAnimationFrame(()=>$('#hub-close')?.focus({preventScroll:true}));return true;
}

function syncState(){
  if(roomOpened(fitness)||roomOpened(rehab)||hubOpened())return;
  setTheme('');
  if(lastFocus&&document.contains(lastFocus))requestAnimationFrame(()=>lastFocus.focus?.({preventScroll:true}));
}

[hub,...rooms].filter(Boolean).forEach(node=>{
  node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');
  new MutationObserver(syncState).observe(node,{attributes:true,attributeFilter:['class']});
});

['#fitness-room-body','#rehab-room-body'].forEach(sel=>{
  const node=$(sel);if(!node)return;
  new MutationObserver(()=>requestAnimationFrame(()=>decorate(node))).observe(node,{childList:true,subtree:false});
});

function closeActiveCenter(){
  const activeRoom=rooms.find(r=>r.classList.contains('open'));
  if(activeRoom){$('.room-close',activeRoom)?.click();return true}
  if(hub?.classList.contains('open')){$('#hub-close')?.click();return true}
  return false;
}

document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  if($('#motion-camera')?.classList.contains('open')||$('#challenge')?.classList.contains('open')||$('#settings')?.classList.contains('open'))return;
  if(closeActiveCenter()){e.preventDefault();e.stopPropagation()}
},{capture:true});

function enableHubSwipe(){
  if(!hub)return;let startY=null,startX=null;
  hub.addEventListener('touchstart',e=>{if(!hub.classList.contains('open'))return;const t=e.touches[0];startY=t.clientY;startX=t.clientX},{passive:true});
  hub.addEventListener('touchend',e=>{if(startY===null)return;const t=e.changedTouches[0],dy=t.clientY-startY,dx=Math.abs(t.clientX-startX);startY=startX=null;if(dy>90&&dx<70)$('#hub-close')?.click()},{passive:true});
}

enableHubSwipe();addRoomBadges();decorate(hub);rooms.forEach(decorate);syncState();

window.KomoVisualPolish={version:'0.11.1',refresh:()=>{decorate(hub);rooms.forEach(decorate);syncState()}};

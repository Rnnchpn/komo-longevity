const initialHash=location.hash;
const SESSION_KEY='komo_gateway_seen_session_v1';

function q(s){return document.querySelector(s)}
function isProfessional(){
  const mode=q('#modeSwitch');
  return Boolean(mode&&!mode.hidden);
}
function appReady(){
  const shell=q('#appShell'),auth=q('#authScreen'),root=q('#viewRoot');
  return Boolean(shell&&!shell.hidden&&auth?.hidden&&root?.children?.length);
}
function displayName(){
  const raw=q('#accountName')?.textContent?.trim()||'';
  return raw&&raw!=='Compte KŌMØ'?raw.split(/\s+/)[0]:'';
}
function closeGateway(){
  const el=q('#komoEcosystemGateway');
  if(!el)return;
  el.classList.add('is-leaving');
  setTimeout(()=>{el.hidden=true;document.body.classList.remove('komo-gateway-open')},240);
  sessionStorage.setItem(SESSION_KEY,'1');
}
function goRoute(route){
  closeGateway();
  setTimeout(()=>{location.hash=route},90);
}
function openWorld(){
  closeGateway();
  const url='https://komolongevity.com/world/?from=pulse&entry=gateway';
  const win=window.open(url,'_blank');
  if(!win)location.href=url;
}
function card(icon,kicker,title,copy,cta,extra=''){
  return `<button type="button" class="kg-card ${extra}" data-gateway-action="${cta}">
    <span class="kg-card-top"><i>${icon}</i><em>→</em></span>
    <span class="kg-kicker">${kicker}</span>
    <strong>${title}</strong>
    <span class="kg-copy">${copy}</span>
  </button>`;
}
function ensureGateway(){
  let el=q('#komoEcosystemGateway');
  if(el)return el;
  el=document.createElement('section');
  el.id='komoEcosystemGateway';
  el.className='komo-gateway';
  el.hidden=true;
  el.setAttribute('aria-label','Choisir votre espace KŌMØ');
  el.innerHTML=`
    <div class="kg-backdrop"></div>
    <div class="kg-shell">
      <header class="kg-head">
        <a href="https://komolongevity.com/fr/" class="kg-brand" target="_blank" rel="noopener noreferrer">
          <span>KŌMØ</span><small>ONE ACCOUNT · ONE ECOSYSTEM</small>
        </a>
        <button type="button" class="kg-close" data-gateway-close aria-label="Fermer">×</button>
      </header>
      <div class="kg-intro">
        <p>KŌMØ GATEWAY</p>
        <h1>Bienvenue<span class="kg-name"></span>.</h1>
        <h2>Comment souhaitez-vous entrer aujourd’hui ?</h2>
        <small>Le même compte vous accompagne partout. Vous pouvez changer d’espace à tout moment.</small>
      </div>
      <div class="kg-grid">
        ${card('01','VOTRE ESPACE','MY KŌMØ','Scores, résultats, Motion Passport, progression et prochaine action.','my','recommended')}
        ${card('02','L’ÉCOSYSTÈME','EXPLORE','Network, expériences, hôtels, Yachting, Retreats, Life et contenus KŌMØ.','explore')}
        ${card('03','MODE SPATIAL','WORLD','Entrez dans votre Twin, Fitness, Library, Arena et Marina dans l’expérience 3D.','world','world')}
      </div>
      <footer class="kg-foot">
        <span><b>MY KŌMØ</b> pour aller vite.</span>
        <span><b>WORLD</b> quand l’immersion apporte quelque chose.</span>
      </footer>
    </div>`;
  document.body.appendChild(el);
  el.querySelector('[data-gateway-close]')?.addEventListener('click',closeGateway);
  el.querySelector('[data-gateway-action="my"]')?.addEventListener('click',()=>goRoute('home'));
  el.querySelector('[data-gateway-action="explore"]')?.addEventListener('click',()=>goRoute('explore'));
  el.querySelector('[data-gateway-action="world"]')?.addEventListener('click',openWorld);
  return el;
}
function showGateway(force=false){
  if(!appReady()||isProfessional())return false;
  if(!force){
    if(initialHash&&initialHash!=='#gateway')return false;
    if(sessionStorage.getItem(SESSION_KEY)==='1')return false;
  }
  const el=ensureGateway();
  const name=displayName();
  const target=el.querySelector('.kg-name');
  if(target)target.textContent=name?' '+name:'';
  el.hidden=false;
  requestAnimationFrame(()=>el.classList.remove('is-leaving'));
  document.body.classList.add('komo-gateway-open');
  return true;
}
function installReturnEntry(){
  const pop=q('#accountPopover');
  if(!pop||pop.querySelector('[data-open-komo-gateway]'))return;
  const btn=document.createElement('button');
  btn.type='button';
  btn.dataset.openKomoGateway='1';
  btn.textContent='Changer d’espace KŌMØ';
  const logout=q('#logoutButton');
  pop.insertBefore(btn,logout||null);
  btn.addEventListener('click',()=>{
    pop.hidden=true;
    sessionStorage.removeItem(SESSION_KEY);
    showGateway(true);
  });
}
window.addEventListener('komo:route-ready',()=>{installReturnEntry();setTimeout(()=>showGateway(false),0)});
window.addEventListener('hashchange',()=>{if(location.hash==='#gateway'){sessionStorage.removeItem(SESSION_KEY);showGateway(true)}});
setTimeout(()=>{installReturnEntry();showGateway(false)},900);
window.KomoGateway={open:()=>showGateway(true),close:closeGateway};

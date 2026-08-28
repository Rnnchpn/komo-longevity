/* KŌMØ Pulse — My KŌMØ Club entry v1 */
(() => {
  'use strict';
  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
  let timer=0;

  function style(){
    if(document.querySelector('#myKomoClubEntryV1Style'))return;
    const s=document.createElement('style');
    s.id='myKomoClubEntryV1Style';
    s.textContent=`
      .kclub-entry,.kclub-side-entry{display:none!important}
      .mkclub-entry{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;align-items:center;padding:21px!important;background:linear-gradient(135deg,#eef2eb,#fbfaf6)!important}
      .mkclub-entry-copy{min-width:0}.mkclub-entry-copy .mkv3-kicker{color:#64746a}.mkclub-entry-copy h3{margin-top:5px!important}.mkclub-entry-copy p{max-width:620px;margin:7px 0 0;font-size:9px;line-height:1.5}
      .mkclub-entry-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}.mkclub-entry-pills{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.mkclub-pill{padding:7px 9px;border-radius:999px;background:#fff;border:1px solid rgba(38,59,46,.08);font-size:7px;font-weight:800;color:#52655a;white-space:nowrap}.mkclub-entry .mkv3-btn{min-height:40px;padding:0 14px;font-size:8px}
      @media(max-width:760px){.mkclub-entry{grid-template-columns:1fr;gap:13px}.mkclub-entry-actions,.mkclub-entry-pills{justify-content:flex-start}.mkclub-entry .mkv3-btn{width:100%;min-height:44px}}
    `;
    document.head.appendChild(s);
  }

  function openClub(){
    if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go('club');
    else location.hash='club';
  }

  function mount(){
    style();
    if(route()!=='mykomo')return;
    const root=document.querySelector('[data-mykomo-v3]');
    if(!root||root.querySelector('[data-mykomo-club-entry]'))return;
    const hero=root.querySelector('.mkv3-hero');
    if(!hero)return;
    const card=document.createElement('article');
    card.className='mkv3-card mkv3-section mkclub-entry';
    card.dataset.mykomoClubEntry='1';
    card.innerHTML=`
      <div class="mkclub-entry-copy">
        <div class="mkv3-kicker">KŌMØ CLUB</div>
        <h3>Votre communauté KŌMØ.</h3>
        <p>Retrouvez vos clubs, vos amis, vos badges, les mini-jeux et l’accès à tout le KŌMØ World depuis votre identité My KŌMØ.</p>
      </div>
      <div class="mkclub-entry-actions">
        <div class="mkclub-entry-pills"><span class="mkclub-pill">CLUBS</span><span class="mkclub-pill">AMIS</span><span class="mkclub-pill">MINI-JEUX</span><span class="mkclub-pill">BADGES</span></div>
        <button type="button" class="mkv3-btn primary" data-open-komo-club>Entrer dans KŌMØ Club →</button>
      </div>`;
    hero.insertAdjacentElement('afterend',card);
    card.querySelector('[data-open-komo-club]')?.addEventListener('click',openClub);
  }

  function schedule(){clearTimeout(timer);timer=setTimeout(mount,60)}
  ['hashchange','pageshow','komo:canonical-route','komo:route-ready','komo:data-ready'].forEach(x=>window.addEventListener(x,schedule));
  const root=document.querySelector('#viewRoot');
  if(root)new MutationObserver(()=>{if(route()==='mykomo')schedule()}).observe(root,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,700));
  setTimeout(mount,1200);
})();
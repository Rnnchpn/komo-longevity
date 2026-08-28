/* KŌMØ Pulse — Patient Home Visual v2
   Home = orientation + action. Detailed interpretation remains in My KŌMØ Score.
*/
(() => {
  const VERSION='2.0.0';
  let raf=0;

  function route(){return location.hash.replace(/^#/,'')||'home'}
  function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function notify(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.hidden=false;clearTimeout(notify.t);notify.t=setTimeout(()=>t.hidden=true,3000)}
  function text(el){return el?.textContent?.trim()||''}

  function ensureStyle(){
    if(document.querySelector('#khomeV2Style'))return;
    const s=document.createElement('style');s.id='khomeV2Style';s.textContent=`
      body.khome-v2 .mykomo-grid{grid-template-columns:1fr!important;gap:0!important}
      body.khome-v2 .mykomo-side{display:none!important}
      body.khome-v2 .mykomo-engagement{display:none!important}
      body.khome-v2 [data-kcanon-home]{display:none!important}
      body.khome-v2 [data-kla-home]{display:none!important}
      body.khome-v2 .mykomo-score-card{border:0!important;background:transparent!important;padding:16px 4px 8px!important}
      body.khome-v2 .mykomo-score-card .mykomo-section-label{margin-bottom:8px}
      body.khome-v2 .mykomo-score-card .mykomo-section-label button{font-size:9px!important}
      .khome-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0 0}
      .khome-action{position:relative;overflow:hidden;min-height:132px;padding:18px;border:1px solid rgba(38,48,40,.09);border-radius:20px;background:#f4f1ea;color:#26372d;text-align:left;cursor:pointer;font:inherit;display:flex;flex-direction:column;justify-content:space-between;transition:.18s ease}
      .khome-action:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(38,48,40,.08)}
      .khome-action.primary{background:#27372e;color:#fff;border-color:#27372e}
      .khome-action.clinical{background:#ebe8df}
      .khome-action .kha-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
      .khome-action .kha-icon{width:34px;height:34px;border-radius:11px;background:rgba(255,255,255,.72);display:grid;place-items:center;font-size:15px;color:#314339}
      .khome-action.primary .kha-icon{background:rgba(255,255,255,.12);color:#fff}
      .khome-action .kha-arrow{font-size:18px;opacity:.6}
      .khome-action small{display:block;margin-bottom:6px;font-size:7px;letter-spacing:.12em;text-transform:uppercase;opacity:.56;font-weight:800}
      .khome-action strong{display:block;font:600 18px/1.08 Manrope,'DM Sans',sans-serif;letter-spacing:-.035em}
      .khome-action p{margin:7px 0 0;font-size:9px;line-height:1.4;opacity:.62;max-width:250px}
      .khome-section{margin-top:14px;padding:20px;border:1px solid rgba(38,48,40,.09);border-radius:22px;background:#fbfaf7}
      .khome-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:15px}
      .khome-section-head small{display:block;margin-bottom:5px;color:#7a827c;font-size:7px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
      .khome-section-head h3{margin:0;color:#26372d;font:500 22px/1.05 Manrope,'DM Sans',sans-serif;letter-spacing:-.04em}
      .khome-section-head p{margin:6px 0 0;color:#7d847e;font-size:9px;line-height:1.45}
      .khome-section-head button{border:0;background:transparent;color:#58675d;font:inherit;font-size:9px;font-weight:800;cursor:pointer;white-space:nowrap}
      .khome-experience{display:grid;grid-template-columns:180px 1fr;gap:24px;align-items:center}
      .khome-dial{--p:0;position:relative;width:158px;height:158px;margin:auto;border-radius:50%;background:conic-gradient(#30473a calc(var(--p)*1%),#e5e2d9 0);display:grid;place-items:center;box-shadow:inset 0 0 0 1px rgba(38,48,40,.04)}
      .khome-dial:after{content:"";position:absolute;inset:12px;border-radius:50%;background:#fbfaf7;border:1px solid rgba(38,48,40,.06)}
      .khome-dial-content{position:relative;z-index:1;text-align:center}.khome-dial-content small{display:block;color:#7b837c;font-size:7px;letter-spacing:.11em;text-transform:uppercase}.khome-dial-content strong{display:block;margin-top:4px;color:#26372d;font:600 37px/.95 Manrope,'DM Sans',sans-serif;letter-spacing:-.055em}.khome-dial-content span{display:block;margin-top:5px;color:#6f786f;font-size:8px}
      .khome-exp-copy h4{margin:0;color:#26372d;font:500 20px/1.1 Manrope,'DM Sans',sans-serif;letter-spacing:-.035em}.khome-exp-copy p{margin:7px 0 12px;color:#747c75;font-size:10px;line-height:1.55;max-width:520px}.khome-exp-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.khome-exp-stat{padding:10px 11px;border-radius:13px;background:#f0ede6}.khome-exp-stat small{display:block;color:#828983;font-size:6.5px;text-transform:uppercase;letter-spacing:.1em}.khome-exp-stat strong{display:block;margin-top:4px;color:#2b3a31;font-size:13px}.khome-exp-link{margin-top:12px;border:0;background:transparent;color:#42574a;padding:0;font:inherit;font-size:9px;font-weight:800;cursor:pointer}
      .khome-connect-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
      .khome-connect{min-height:116px;padding:14px;border:1px solid rgba(38,48,40,.08);border-radius:17px;background:#f2efe8;display:flex;flex-direction:column;justify-content:space-between}
      .khome-connect-top{display:flex;align-items:center;justify-content:space-between;gap:6px}.khome-connect-logo{width:30px;height:30px;border-radius:10px;background:#fff;display:grid;place-items:center;color:#314339;font-size:12px;font-weight:800}.khome-connect-status{padding:5px 7px;border-radius:999px;background:#e7e4dc;color:#7a817b;font-size:6px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
      .khome-connect strong{display:block;margin-top:12px;color:#26372d;font-size:11px}.khome-connect small{display:block;margin-top:3px;color:#808780;font-size:7px;line-height:1.35}.khome-connect button{margin-top:10px;padding:0;border:0;background:transparent;color:#55665b;font:inherit;font-size:8px;font-weight:800;text-align:left;cursor:pointer}
      .khome-connect-note{margin:10px 0 0;color:#8a8f8b;font-size:7px;line-height:1.45}
      @media(max-width:980px){.khome-actions{grid-template-columns:1fr 1fr}.khome-action:first-child{grid-column:1/-1}.khome-connect-grid{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:760px){
        .khome-actions{grid-template-columns:1fr!important}.khome-action:first-child{grid-column:auto}.khome-action{min-height:108px;padding:15px;border-radius:17px}.khome-action strong{font-size:17px}
        .khome-section{padding:16px;border-radius:19px}.khome-section-head{align-items:flex-start}.khome-section-head h3{font-size:19px}.khome-experience{grid-template-columns:1fr;gap:14px}.khome-dial{width:142px;height:142px}.khome-exp-copy{text-align:center}.khome-exp-copy p{margin-left:auto;margin-right:auto}.khome-exp-stats{grid-template-columns:repeat(3,1fr)}.khome-connect-grid{grid-template-columns:1fr 1fr}
      }
      @media(max-width:430px){.khome-connect-grid{grid-template-columns:1fr}.khome-exp-stats{grid-template-columns:1fr 1fr}.khome-exp-stat:last-child{grid-column:1/-1}}
    `;document.head.appendChild(s)
  }

  function appointmentData(){
    const box=document.querySelector('.mykomo-next');
    const title=text(box?.querySelector('strong'))||'Prendre rendez-vous';
    const meta=text(box?.querySelector('small'))||'Choisissez votre prochaine étape KŌMØ.';
    return {title,meta};
  }

  function experienceData(){
    const levelText=text(document.querySelector('.mykomo-xp-head strong'))||'Niveau 1';
    const level=Number(levelText.match(/\d+/)?.[0]||1);
    const foot=[...document.querySelectorAll('.mykomo-xp-foot span')].map(text);
    const total=Number((foot[0]||'0').replace(/\D+/g,''))||0;
    const next=Number((foot[1]||'500').replace(/\D+/g,''))||500;
    const track=document.querySelector('.mykomo-xp-track');
    const pct=Math.max(0,Math.min(100,Number(track?.style?.getPropertyValue('--xp')?.replace('%',''))||0));
    const today=Number(text(document.querySelector('.mykomo-today-xp strong')).replace(/\D+/g,''))||0;
    const points=Number(text(document.querySelector('.mykomo-points>strong')).replace(/\D+/g,''))||0;
    return {level,total,next,pct,today,points};
  }

  function actionBlock(){
    const a=appointmentData();
    return `<section class="khome-actions" data-khome-actions>
      <button type="button" class="khome-action" data-khome-book="general"><div class="kha-top"><span class="kha-icon">◷</span><span class="kha-arrow">→</span></div><div><small>Prochaine étape</small><strong>Prendre rendez-vous</strong><p>${esc(a.title==='Aucun rendez-vous planifié'?'Aucun rendez-vous planifié':a.meta)}</p></div></button>
      <button type="button" class="khome-action primary" data-khome-motion><div class="kha-top"><span class="kha-icon">↗</span><span class="kha-arrow">→</span></div><div><small>Bilan fonctionnel</small><strong>Démarrer KŌMØ Motion</strong><p>Tests, préparation, acquisition MyoCare et résultat Motion.</p></div></button>
      <button type="button" class="khome-action clinical" data-khome-clinical><div class="kha-top"><span class="kha-icon">＋</span><span class="kha-arrow">→</span></div><div><small>Bilan approfondi</small><strong>Démarrer KŌMØ Clinical</strong><p>Accéder au parcours clinique et planifier votre bilan complet.</p></div></button>
    </section>`;
  }

  function experienceBlock(){
    const e=experienceData();
    return `<section class="khome-section" data-khome-experience><div class="khome-section-head"><div><small>EXPÉRIENCE KŌMØ</small><h3>Votre progression.</h3><p>Un repère simple ici. Le détail des défis, XP, séries et KŌMØ Points reste dans My KŌMØ.</p></div><button type="button" data-khome-mykomo>Voir My KŌMØ →</button></div><div class="khome-experience"><div class="khome-dial" style="--p:${e.pct}"><div class="khome-dial-content"><small>Niveau</small><strong>${e.level}</strong><span>${Math.round(e.pct)}% du niveau</span></div></div><div class="khome-exp-copy"><h4>Construisez votre expérience au fil du temps.</h4><p>Vos activités, rendez-vous, tests et défis font progresser votre expérience KŌMØ. L’objectif de l’accueil est simplement de voir où vous en êtes.</p><div class="khome-exp-stats"><div class="khome-exp-stat"><small>Expérience totale</small><strong>${e.total.toLocaleString('fr-FR')} XP</strong></div><div class="khome-exp-stat"><small>Aujourd’hui</small><strong>+${e.today} XP</strong></div><div class="khome-exp-stat"><small>Prochain niveau</small><strong>${e.next.toLocaleString('fr-FR')} XP</strong></div></div><button class="khome-exp-link" type="button" data-khome-mykomo>Voir l’expérience complète →</button></div></div></section>`;
  }

  function connectedBlock(){
    const items=[
      ['','Apple Health','iPhone · Apple Watch'],
      ['G','Garmin','Activité · sommeil · fréquence cardiaque'],
      ['W','WHOOP','Récupération · sommeil · strain'],
      ['O','Oura','Sommeil · readiness · activité'],
      ['S','Strava','Activités sportives · charge']
    ];
    return `<section class="khome-section" data-khome-connected><div class="khome-section-head"><div><small>MES DONNÉES CONNECTÉES</small><h3>Reliez votre quotidien à KŌMØ.</h3><p>Vos objets connectés permettront d’enrichir le suivi entre deux bilans, sans modifier les scores cliniques sans validation.</p></div><button type="button" data-khome-connected-info>Gérer mes connexions →</button></div><div class="khome-connect-grid">${items.map(([logo,name,desc])=>`<article class="khome-connect"><div><div class="khome-connect-top"><span class="khome-connect-logo">${logo}</span><span class="khome-connect-status">À connecter</span></div><strong>${name}</strong><small>${desc}</small></div><button type="button" data-khome-provider="${esc(name)}">Préparer la connexion →</button></article>`).join('')}</div><p class="khome-connect-note">Les connecteurs sont présentés dès maintenant pour préparer l’expérience. Aucune donnée n’est importée tant que la connexion sécurisée correspondante n’est pas activée.</p></section>`;
  }

  function wire(host){
    host.querySelector('[data-khome-book]')?.addEventListener('click',()=>{location.hash='documents'});
    host.querySelector('[data-khome-motion]')?.addEventListener('click',()=>{location.hash='motion'});
    host.querySelector('[data-khome-clinical]')?.addEventListener('click',()=>{
      sessionStorage.setItem('komo_home_booking_service','clinical');
      location.hash='documents';
      let tries=0;const t=setInterval(()=>{tries++;const b=document.querySelector('[data-kbook-service="clinical"]');if(b){b.click();clearInterval(t)}else if(tries>30)clearInterval(t)},100);
    });
    host.querySelectorAll('[data-khome-mykomo]').forEach(b=>b.addEventListener('click',()=>{location.hash='path'}));
    host.querySelector('[data-khome-connected-info]')?.addEventListener('click',()=>notify('Gestion des objets connectés : prochaine étape de Pulse.'));
    host.querySelectorAll('[data-khome-provider]').forEach(b=>b.addEventListener('click',()=>notify(`${b.dataset.khomeProvider} : connexion sécurisée en préparation.`)));
  }

  function patch(){
    cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
      const active=route()==='home';document.body.classList.toggle('khome-v2',active);if(!active)return;
      ensureStyle();
      const home=document.querySelector('[data-my-komo-home]');const score=home?.querySelector('.mykomo-score-card');if(!home||!score)return;
      if(!home.querySelector('[data-khome-actions]'))score.insertAdjacentHTML('afterend',actionBlock());
      if(!home.querySelector('[data-khome-experience]'))home.querySelector('[data-khome-actions]')?.insertAdjacentHTML('afterend',experienceBlock());
      if(!home.querySelector('[data-khome-connected]'))home.querySelector('[data-khome-experience]')?.insertAdjacentHTML('afterend',connectedBlock());
      wire(home);
    })
  }

  window.addEventListener('hashchange',patch);
  window.addEventListener('komo:route-ready',patch);
  window.addEventListener('komo:data-ready',patch);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(patch,1100));
  new MutationObserver(patch).observe(document.body,{childList:true,subtree:true});
  setTimeout(patch,1700);
  window.KomoPatientHomeVisual={version:VERSION,refresh:patch};
})();
(() => {
  const ROUTE='home';
  const LINKS={
    library:'https://komolongevity.com/media',
    science:'https://komolongevity.com/fr/science/'
  };
  let queued=false;

  function route(){return location.hash.replace(/^#/,'')||'home'}
  function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function text(el){return el?.textContent?.trim()||''}
  function firstName(){const t=text(document.querySelector('.hero-intro .hero-kicker'));return t||'Votre espace personnel.'}

  function styles(){
    if(document.querySelector('#khcStyle'))return;
    const s=document.createElement('style');s.id='khcStyle';s.textContent=`
      .khc-hero-title{font-size:clamp(48px,5vw,78px)!important;line-height:.99!important;letter-spacing:-.055em!important;margin:10px 0 8px!important}
      .khc-hero-sub{display:block;margin-top:8px;font-size:20px;line-height:1.25;color:#777b72;font-weight:500;letter-spacing:-.025em}
      .khc-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:26px 0 2px;padding-top:20px;border-top:1px solid rgba(39,48,40,.1)}
      .khc-step{display:grid;grid-template-columns:38px 1fr;gap:10px;align-items:start}.khc-step i{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#eeeae1;color:#657068;font-style:normal;font-size:10px;font-weight:800}.khc-step strong{display:block;font-size:13px;color:#2e3931}.khc-step small{display:block;margin-top:3px;color:#7b817b;font-size:10px;line-height:1.35}
      .khc-result-head{cursor:pointer;position:relative}.khc-result-head:focus-visible{outline:3px solid rgba(255,255,255,.55);outline-offset:-5px}
      .khc-result-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(300px,.75fr) auto;gap:26px;align-items:center;width:100%}.khc-result-copy h2{margin:5px 0 8px!important}.khc-result-copy p{max-width:720px}.khc-interpret{padding:16px 18px;border:1px solid rgba(255,255,255,.16);border-radius:18px;background:rgba(255,255,255,.055);display:grid;gap:9px}.khc-interpret div{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;font-size:11px;line-height:1.42;color:rgba(255,255,255,.84)}.khc-interpret i{width:15px;height:15px;border-radius:50%;border:1px solid rgba(255,255,255,.5);display:grid;place-items:center;font-style:normal;font-size:8px;color:#fff}
      .khc-result-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:0 30px 20px;background:linear-gradient(135deg,#2a362d,#3a473e)}.khc-result-action{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border:1px solid rgba(255,255,255,.2);border-radius:13px;background:rgba(255,255,255,.04);color:#fff;text-decoration:none;font:inherit;font-size:11px;font-weight:700;cursor:pointer}.khc-result-action:hover{background:rgba(255,255,255,.1)}
      .khc-result-hint{margin-top:6px!important;font-size:10px!important;color:rgba(255,255,255,.6)!important}
      @media(max-width:950px){.khc-steps{grid-template-columns:1fr}.khc-result-layout{grid-template-columns:1fr}.khc-result-actions{grid-template-columns:1fr}.khc-hero-title{font-size:50px!important}}
      @media(max-width:620px){.khc-hero-title{font-size:42px!important}.khc-hero-sub{font-size:17px}.khc-result-actions{padding:0 20px 18px}}
    `;document.head.appendChild(s);
  }

  function enhanceHero(){
    const hero=document.querySelector('.hero-grid .hero-card:not(.side-summary)');
    const intro=hero?.querySelector('.hero-intro');if(!hero||!intro)return;
    if(hero.dataset.khcHero==='1')return;
    const greeting=firstName();
    intro.innerHTML=`<div class="hero-kicker">${esc(greeting)}</div><h2 class="khc-hero-title">Bienvenue sur<br>KŌMØ Pulse.<small class="khc-hero-sub">Construisez le suivi de votre longévité locomotrice.</small></h2><p>KŌMØ Pulse rassemble vos repères fonctionnels, vos bilans et leur évolution dans le temps. Commencez par KŌMØ Start, préparez votre bilan Motion, puis retrouvez votre évaluation Clinical et vos recommandations dans un seul espace.</p><div class="khc-steps" aria-label="Les trois étapes KŌMØ"><div class="khc-step"><i>01</i><div><strong>KŌMØ Start</strong><small>Questionnaire + 2 tests fonctionnels</small></div></div><div class="khc-step"><i>02</i><div><strong>KŌMØ Motion</strong><small>Acquisition Myodev / MyoCare</small></div></div><div class="khc-step"><i>03</i><div><strong>KŌMØ Clinical</strong><small>Interprétation médicale et suivi</small></div></div></div>`;
    const actions=hero.querySelector('.hero-actions');if(actions){actions.innerHTML='<button class="primary-button" type="button" data-khc-steps><span>Découvrir mes étapes</span><span>→</span></button><button class="ghost-button" type="button" data-route="path">Voir mon suivi</button>';actions.querySelector('[data-khc-steps]')?.addEventListener('click',()=>{location.hash='path'})}
    hero.dataset.khcHero='1';
  }

  function metric(card,index){const x=card.querySelectorAll('.kfree-v2-metric')[index];return{value:text(x?.querySelector('strong')),note:text(x?.querySelector('small'))}}
  function enhanceFree(){
    const card=document.querySelector('.kfree-v2[data-kfree-v2="home"]')||document.querySelector('.kfree-v2');if(!card)return;
    if(card.dataset.khcFree==='1')return;
    const head=card.querySelector('.kfree-v2-head');if(!head)return;
    const q=metric(card,0),chair=metric(card,1),two=metric(card,2);
    const level=text(card.querySelector('.kfree-v2-level strong'))||'—';
    head.classList.add('khc-result-head');head.setAttribute('role','button');head.setAttribute('tabindex','0');head.setAttribute('aria-label','Ouvrir l’explication des résultats KŌMØ Start');
    head.innerHTML=`<div class="khc-result-layout"><div class="khc-result-copy"><p class="eyebrow">KŌMØ START · PREMIÈRE RÉFÉRENCE</p><h2>Résultats KŌMØ Start</h2><p>Votre première évaluation KŌMØ est enregistrée. Consultez l’explication de vos résultats et les pistes proposées pour comprendre et améliorer votre mobilité.</p><p class="khc-result-hint">Cliquez pour ouvrir l’interprétation détaillée · repère de dépistage, non diagnostique.</p></div><div class="khc-interpret"><div><i>✓</i><span><b>Questionnaire :</b> ${q.value==='100/100'?'aucune difficulté fonctionnelle notable.':esc(q.note||'résultat enregistré.')}</span></div><div><i>✓</i><span><b>Chair Stand :</b> ${chair.value?esc(chair.value.replace(/\s*rép\.?$/i,' répétitions'))+' en 30 s · repère de force-endurance.':'mesure enregistrée.'}</span></div><div><i>✓</i><span><b>Two-Step :</b> ${two.value?`ratio ${esc(two.value)} · ${Number(String(two.value).replace(',','.'))>=1.3?'profil locomoteur favorable sur ce repérage.':'résultat à interpréter dans votre contexte.'}`:'mesure enregistrée.'}</span></div></div><div class="kfree-v2-level"><small>NIVEAU FREE</small><strong>${esc(level)}</strong><span>sur 3</span></div></div>`;
    head.onclick=e=>{if(!e.target.closest('a,button'))location.hash='results'};head.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('a,button')){e.preventDefault();location.hash='results'}};
    let actions=card.querySelector('.khc-result-actions');if(!actions){actions=document.createElement('div');actions.className='khc-result-actions';head.insertAdjacentElement('afterend',actions)}
    actions.innerHTML=`<button type="button" class="khc-result-action" data-khc-understand><span>Comprendre mes résultats</span><span>→</span></button><a class="khc-result-action" href="${LINKS.library}" target="_blank" rel="noopener noreferrer"><span>Conseils pour progresser</span><span>↗</span></a><a class="khc-result-action" href="${LINKS.science}" target="_blank" rel="noopener noreferrer"><span>Articles & ressources</span><span>↗</span></a>`;
    actions.querySelector('[data-khc-understand]')?.addEventListener('click',()=>{sessionStorage.setItem('komo_open_free_details','1');location.hash='results'});
    card.dataset.khcFree='1';
  }

  function polishWords(){
    const root=document.querySelector('#viewRoot');if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){let v=node.nodeValue||'';if(/\bMobilité préservée\b/.test(v))v=v.replace(/Mobilité préservée/g,'Résultat favorable');if(/\b(\d+)\s*rép\./.test(v))v=v.replace(/(\d+)\s*rép\./g,'$1 répétitions');if(v!==node.nodeValue)node.nodeValue=v}
  }

  function openDetailsOnResults(){
    if(route()!=='results'||sessionStorage.getItem('komo_open_free_details')!=='1')return;
    const details=document.querySelector('.krp-details');if(!details)return;details.open=true;sessionStorage.removeItem('komo_open_free_details');setTimeout(()=>details.scrollIntoView({behavior:'smooth',block:'center'}),80)
  }

  function apply(){styles();if(route()==='home'){enhanceHero();enhanceFree();polishWords()}else if(route()==='results'){polishWords();openDetailsOnResults()}}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  window.addEventListener('hashchange',()=>[60,220,650].forEach(ms=>setTimeout(schedule,ms)));
  window.addEventListener('komo:route-ready',()=>setTimeout(schedule,80));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,950));
  const root=document.querySelector('#viewRoot');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  setTimeout(schedule,1500);
})();
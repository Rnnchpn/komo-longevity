(() => {
  function route(){return location.hash.replace(/^#/,'')||'home'}
  function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function metricValue(card,index){return card.querySelectorAll('.kfree-v2-metric')[index]?.querySelector('strong')?.textContent?.trim()||'—'}
  function metricNote(card,index){return card.querySelectorAll('.kfree-v2-metric')[index]?.querySelector('small')?.textContent?.trim()||''}
  function favorable(card){const level=Number(card.querySelector('.kfree-v2-level strong')?.textContent?.trim());return Number.isFinite(level)&&level===0}

  function enhance(){
    if(!['home','results'].includes(route()))return;
    document.querySelectorAll('.kfree-v2').forEach(card=>{
      // Legacy layers are removed once; the new layer is never rebuilt unless the card itself is recreated.
      card.querySelectorAll('.kfree-v2-meaning,.krp-summary,.krp-actions,.krp-note').forEach(x=>x.remove());
      if(card.dataset.krpEnhanced==='2'&&card.querySelector('.krp-overview')&&card.querySelector('.krp-next')&&card.querySelector('.krp-details'))return;
      card.querySelectorAll('.krp-overview,.krp-next,.krp-details').forEach(x=>x.remove());
      const metrics=card.querySelector('.kfree-v2-metrics');
      if(!metrics)return;

      const isGood=favorable(card);
      const q=metricValue(card,0),chair=metricValue(card,1),two=metricValue(card,2);
      const qNote=metricNote(card,0),chairNote=metricNote(card,1),twoNote=metricNote(card,2);

      const overview=document.createElement('section');
      overview.className='krp-overview';
      overview.innerHTML=`
        <div class="krp-overview-head">
          <div>
            <p class="eyebrow">SYNTHÈSE</p>
            <h3>${isGood?'Profil fonctionnel favorable':'Résultat à approfondir'}</h3>
            <p>${isGood?'Vos trois premiers repères sont cohérents avec une mobilité fonctionnelle préservée sur ce dépistage. Cette mesure devient votre référence de départ pour suivre l’évolution dans le temps.':'Votre première référence fait apparaître des éléments à replacer dans votre contexte. KŌMØ Motion permet d’approfondir la mesure avec une évaluation instrumentée.'}</p>
          </div>
          <span class="krp-state"><i></i>${isGood?'Favorable':'À approfondir'}</span>
        </div>
        <div class="krp-insights">
          <div><span>Perception fonctionnelle</span><strong>${esc(q)}</strong><small>${esc(qNote||'Questionnaire enregistré')}</small></div>
          <div><span>Force-endurance</span><strong>${esc(chair)}</strong><small>${esc(chairNote||'Valeur de référence personnelle')}</small></div>
          <div><span>Capacité locomotrice</span><strong>${esc(two)}</strong><small>${esc(twoNote||'Two-Step enregistré')}</small></div>
        </div>`;
      metrics.insertAdjacentElement('afterend',overview);

      const next=document.createElement('section');
      next.className='krp-next';
      next.innerHTML=`
        <div class="krp-next-title"><p class="eyebrow">PROCHAINES ÉTAPES</p><h3>Construire la suite à partir de cette référence.</h3></div>
        <div class="krp-next-grid">
          <button type="button" data-krp-action="keep"><span>01</span><strong>Conserver cette référence</strong><small>Votre point de comparaison pour les prochains bilans.</small></button>
          <button type="button" data-krp-action="motion"><span>02</span><strong>Approfondir avec Motion</strong><small>Mesure instrumentée Myodev / MyoCare et lecture professionnelle.</small></button>
          <button type="button" data-krp-action="score"><span>03</span><strong>Suivre dans My KŌMØ Score</strong><small>Comparer vos résultats et leur évolution dans le temps.</small></button>
        </div>`;
      overview.insertAdjacentElement('afterend',next);

      const details=document.createElement('details');
      details.className='krp-details';
      details.innerHTML=`
        <summary>Voir le détail des tests <span>+</span></summary>
        <div class="krp-details-body">
          <article><span>Questionnaire KŌMØ</span><strong>${esc(q)}</strong><p>${esc(qNote||'Votre questionnaire constitue un repère de perception fonctionnelle.')}</p></article>
          <article><span>Chair Stand · 30 s</span><strong>${esc(chair)}</strong><p>Repère simple de force-endurance des membres inférieurs. Cette valeur est conservée pour comparaison et n’entre pas dans le calcul du Niveau Free.</p></article>
          <article><span>Two-Step</span><strong>${esc(two)}</strong><p>${esc(twoNote||'Votre ratio Two-Step est conservé comme repère locomoteur.')}</p></article>
          <p class="krp-medical-note"><b>À retenir :</b> Pulse Free est un repère fonctionnel de dépistage. Il ne constitue pas un diagnostic médical et ne remplace pas une évaluation professionnelle lorsqu’elle est indiquée.</p>
        </div>`;
      next.insertAdjacentElement('afterend',details);

      next.querySelector('[data-krp-action="motion"]')?.addEventListener('click',()=>{location.hash='documents'});
      next.querySelector('[data-krp-action="score"]')?.addEventListener('click',()=>{location.hash='path'});
      next.querySelector('[data-krp-action="keep"]')?.addEventListener('click',()=>{details.open=true});
      details.addEventListener('toggle',()=>{const s=details.querySelector('summary span');if(s)s.textContent=details.open?'−':'+'});
      card.dataset.krpEnhanced='2';
    });
  }

  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}
  window.addEventListener('hashchange',()=>setTimeout(schedule,80));
  window.addEventListener('komo:route-ready',()=>setTimeout(schedule,80));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,900));
  const root=document.querySelector('#viewRoot');if(root)new MutationObserver(()=>schedule()).observe(root,{childList:true,subtree:true});
  setTimeout(schedule,1400);
})();

(() => {
  const PATIENT_KEYS=['baseline','chair_stand','two_step'];
  const PROFESSIONAL_ONLY=new Set(['gait_4m','balance']);

  function applyPatientScope(){
    if(location.hash.replace(/^#/,'')!=='results')return;
    const root=document.querySelector('.tests-v1-root');
    if(!root)return;

    for(const key of PROFESSIONAL_ONLY){
      root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card')?.remove();
    }

    const done=PATIENT_KEYS.filter(key=>root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card')?.classList.contains('is-done')).length;
    const pct=Math.round(done/PATIENT_KEYS.length*100);
    const pctNode=root.querySelector('.tests-v1-progress-top strong');
    const bar=root.querySelector('.tests-v1-progress-track i');
    const count=root.querySelector('.tests-v1-progress-meta strong');
    const meta=root.querySelector('.tests-v1-progress-meta span');
    if(pctNode)pctNode.textContent=`${pct}%`;
    if(bar)bar.style.width=`${pct}%`;
    if(count)count.textContent=`${done}/${PATIENT_KEYS.length}`;
    if(meta)meta.textContent='étapes patient complétées';

    const heroAction=root.querySelector('.tests-v1-hero-actions button[data-open-test]');
    const heroStatus=root.querySelector('.tests-v1-hero-actions > span');
    if(done===PATIENT_KEYS.length&&heroAction){
      heroAction.dataset.openTest='baseline';
      heroAction.innerHTML='Revoir mes mesures <span>→</span>';
      if(heroStatus)heroStatus.textContent='Préparation patient terminée';
    }

    const consultationHead=[...root.querySelectorAll('.tests-v1-section-head')].find(x=>x.querySelector('.eyebrow')?.textContent?.includes('AVEC VOTRE PROFESSIONNEL'));
    if(consultationHead){
      const p=consultationHead.querySelector('p:last-child');
      if(p)p.textContent='Ces mesures sont réalisées dans KŌMØ Motion avec le professionnel et ne sont plus demandées au patient à domicile.';
      const title=consultationHead.querySelector('h3');
      if(title)title.textContent='Les mesures KŌMØ Motion.';
    }
    const grid=root.querySelector('.tests-v1-consult-grid');
    if(grid)grid.innerHTML=`
      <article><span>01</span><h4>Stand-Up standardisé</h4><p>Mesure standardisée du lever selon le protocole KŌMØ.</p><b>KŌMØ Motion</b></article>
      <article><span>02</span><h4>Vitesse · 4 m</h4><p>Vitesse de marche mesurée sur quatre mètres dans un environnement contrôlé.</p><b>KŌMØ Motion</b></article>
      <article><span>03</span><h4>Appui unipodal · gauche</h4><p>Temps d’appui unipodal gauche recueilli par le professionnel.</p><b>KŌMØ Motion</b></article>
      <article><span>04</span><h4>Appui unipodal · droit</h4><p>Temps d’appui unipodal droit recueilli par le professionnel.</p><b>KŌMØ Motion</b></article>
      <article><span>05</span><h4>Calf Raise · 30 s</h4><p>Mesure d’endurance fonctionnelle du mollet réalisée en enrichissement Motion.</p><b>KŌMØ Motion</b></article>`;
  }

  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-open-test]');
    if(b&&PROFESSIONAL_ONLY.has(b.dataset.openTest)){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);

  window.addEventListener('hashchange',()=>setTimeout(applyPatientScope,120));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(applyPatientScope,700));
  const obs=new MutationObserver(()=>requestAnimationFrame(applyPatientScope));
  obs.observe(document.body,{childList:true,subtree:true});
  setTimeout(applyPatientScope,1100);
})();
(() => {
  const PATIENT_KEYS=['baseline','chair_stand','two_step'];
  const PROFESSIONAL_ONLY=new Set(['gait_4m','balance']);
  const GUIDES={
    baseline:{when:'Commencez ici',how:'Installez-vous au calme pendant 5 à 7 minutes. Répondez au questionnaire puis complétez votre contexte du jour.',cta:'Commencer le KŌMØ Check'},
    chair_stand:{when:'Après le KŌMØ Check',how:'Placez une chaise stable contre un mur. Quand vous êtes prêt, Pulse lance le minuteur de 30 secondes.',cta:'Préparer le Chair Stand'},
    two_step:{when:'Après le Chair Stand',how:'Prévoyez un sol plat, un espace dégagé et un mètre ruban. Faites deux grands pas puis mesurez la distance totale.',cta:'Commencer le Two-Step'}
  };

  function addGuide(root,key){
    const button=root.querySelector(`[data-open-test="${key}"]`),card=button?.closest('.test-v1-card'),g=GUIDES[key];
    if(!card||!g||card.querySelector('[data-test-guide]'))return;
    const copy=card.querySelector('.test-v1-card-copy');
    const guide=document.createElement('div');guide.dataset.testGuide='1';guide.className='test-v1-guide';
    guide.innerHTML=`<div><span>Quand</span><strong>${g.when}</strong></div><div><span>Comment</span><strong>${g.how}</strong></div>`;
    copy?.appendChild(guide);
    if(button&&!card.classList.contains('is-done'))button.textContent=`${g.cta} →`;
  }

  function applyPatientScope(){
    if(location.hash.replace(/^#/,'')!=='results')return;
    const root=document.querySelector('.tests-v1-root');
    if(!root)return;

    for(const key of PROFESSIONAL_ONLY)root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card')?.remove();
    PATIENT_KEYS.forEach(key=>addGuide(root,key));

    const done=PATIENT_KEYS.filter(key=>root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card')?.classList.contains('is-done')).length;
    const pct=Math.round(done/PATIENT_KEYS.length*100);
    const pctNode=root.querySelector('.tests-v1-progress-top strong'),bar=root.querySelector('.tests-v1-progress-track i'),count=root.querySelector('.tests-v1-progress-meta strong'),meta=root.querySelector('.tests-v1-progress-meta span');
    if(pctNode)pctNode.textContent=`${pct}%`;if(bar)bar.style.width=`${pct}%`;if(count)count.textContent=`${done}/${PATIENT_KEYS.length}`;if(meta)meta.textContent='étapes patient complétées';

    const heroAction=root.querySelector('.tests-v1-hero-actions button[data-open-test]'),heroStatus=root.querySelector('.tests-v1-hero-actions > span');
    if(done===PATIENT_KEYS.length&&heroAction){heroAction.dataset.openTest='baseline';heroAction.innerHTML='Revoir mon KŌMØ Check <span>→</span>';if(heroStatus)heroStatus.textContent='Première étape terminée';}

    const consultationHead=[...root.querySelectorAll('.tests-v1-section-head')].find(x=>x.querySelector('.eyebrow')?.textContent?.includes('AVEC VOTRE PROFESSIONNEL'));
    if(consultationHead){const p=consultationHead.querySelector('p:last-child');if(p)p.textContent='Après ces trois étapes, votre professionnel complète le bilan avec les mesures KŌMØ Motion et, lorsque cela est indiqué, KŌMØ Clinical.';const title=consultationHead.querySelector('h3');if(title)title.textContent='Étape suivante : avec votre professionnel.';}
    const grid=root.querySelector('.tests-v1-consult-grid');
    if(grid)grid.innerHTML=`
      <article><span>01</span><h4>Stand-Up standardisé</h4><p>Mesure standardisée du lever selon le protocole KŌMØ.</p><b>KŌMØ Motion</b></article>
      <article><span>02</span><h4>Vitesse · 4 m</h4><p>Vitesse de marche mesurée sur quatre mètres dans un environnement contrôlé.</p><b>KŌMØ Motion</b></article>
      <article><span>03</span><h4>Appui unipodal</h4><p>Mesure gauche et droite recueillie avec le professionnel.</p><b>KŌMØ Motion</b></article>
      <article><span>04</span><h4>Calf Raise · 30 s</h4><p>Mesure d’endurance fonctionnelle réalisée dans Motion.</p><b>KŌMØ Motion</b></article>
      <article><span>05</span><h4>KŌMØ Clinical</h4><p>Interprétation et données complémentaires lorsque votre parcours le nécessite.</p><b>Clinical</b></article>`;
    root.dataset.patientScopeV2='1';
  }

  function applyMotionLabels(){
    if(location.hash.replace(/^#/,'')!=='clinical')return;
    const root=document.querySelector('.clm');if(!root||root.dataset.motionLabelsV2==='1')return;
    root.querySelectorAll('.clm-field > span').forEach(span=>{const t=(span.textContent||'').trim();if(t==='Marche 4 m · m/s')span.textContent='Vitesse 4 m · m/s';if(t==='Gauche · s')span.textContent='Appui unipodal gauche · s';if(t==='Droite · s')span.textContent='Appui unipodal droit · s';if(t==='Calf Raise 30 s')span.textContent='Calf Raise · 30 s';});
    root.querySelectorAll('.clm-card p').forEach(p=>{if((p.textContent||'').includes('30CST 55 % · marche 4 m 45 %.'))p.textContent='30CST 55 % · vitesse 4 m 45 %.';});
    root.dataset.motionLabelsV2='1';
  }

  function apply(){applyPatientScope();applyMotionLabels()}
  function schedule(delay=120){setTimeout(apply,delay)}

  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-open-test]');if(b&&PROFESSIONAL_ONLY.has(b.dataset.openTest)){event.preventDefault();event.stopImmediatePropagation();return;}
    if(event.target.closest('[data-route="results"]'))schedule(260);
  },true);
  window.addEventListener('hashchange',()=>schedule(260));
  window.addEventListener('komo:route-ready',()=>schedule(80));
  document.addEventListener('DOMContentLoaded',()=>schedule(700));
  setTimeout(apply,1100);
})();
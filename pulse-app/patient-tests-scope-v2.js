(() => {
  const PATIENT_KEYS=['baseline','chair_stand','two_step'];
  const PROFESSIONAL_ONLY=new Set(['gait_4m','balance']);
  const GUIDES={
    baseline:{when:'Dès votre inscription',how:'Installez-vous au calme pendant 5 à 7 minutes. Répondez d’abord au questionnaire initial : Pulse vous dira ensuite si vous pouvez poursuivre les tests physiques seul.',cta:'Commencer le questionnaire'},
    chair_stand:{when:'Après le questionnaire',how:'Placez une chaise stable contre un mur, pieds au sol. Quand vous êtes prêt, appuyez sur Démarrer : Pulse lance le minuteur de 30 secondes et vous indique quand le test est terminé.',cta:'Préparer le Chair Stand'},
    two_step:{when:'Après le Chair Stand',how:'Sur un sol plat et dégagé, prévoyez un mètre ruban. Partez pieds joints, faites deux grands pas contrôlés, puis mesurez la distance totale et saisissez-la dans Pulse.',cta:'Commencer le Two-Step'}
  };

  function addGuide(root,key){
    const button=root.querySelector(`[data-open-test="${key}"]`),card=button?.closest('.test-v1-card'),g=GUIDES[key];
    if(!card||!g||card.querySelector('[data-test-guide]'))return;
    const copy=card.querySelector('.test-v1-card-copy');
    const guide=document.createElement('div');guide.dataset.testGuide='1';guide.className='test-v1-guide';
    guide.innerHTML=`<div><span>Quand démarrer</span><strong>${g.when}</strong></div><div><span>Comment faire</span><strong>${g.how}</strong></div>`;
    copy?.appendChild(guide);
    if(button&&!card.classList.contains('is-done'))button.textContent=`${g.cta} →`;
  }

  function cardValue(root,key,fallback){
    const card=root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card');
    const value=card?.querySelector('.test-v1-value')?.textContent?.trim();
    return value||fallback;
  }

  function renderFreeResult(root,done){
    root.querySelector('[data-pulse-free-result]')?.remove();
    if(done!==PATIENT_KEYS.length)return;
    const grid=root.querySelector('.tests-v1-grid');
    if(!grid)return;
    const questionnaire=cardValue(root,'baseline','Questionnaire enregistré');
    const chair=cardValue(root,'chair_stand','Mesure enregistrée');
    const twoStep=cardValue(root,'two_step','Mesure enregistrée');
    const section=document.createElement('section');
    section.className='pulse-free-result';
    section.dataset.pulseFreeResult='1';
    section.innerHTML=`
      <div class="pulse-free-result__head">
        <div>
          <p class="eyebrow">PULSE FREE · PREMIER RÉSULTAT</p>
          <h3>Votre point de départ est prêt.</h3>
          <p>Votre inscription gratuite vous donne un premier repère fonctionnel à partir du questionnaire, du Chair Stand et du Two-Step. Ces données constituent la préparation de votre parcours KŌMØ.</p>
        </div>
        <div class="pulse-free-result__badge"><span>Statut</span><strong>3 étapes complétées</strong></div>
      </div>
      <div class="pulse-free-result__metrics">
        <article class="pulse-free-result__metric"><span>Questionnaire initial</span><strong>${questionnaire}</strong></article>
        <article class="pulse-free-result__metric"><span>Chair Stand · 30 s</span><strong>${chair}</strong></article>
        <article class="pulse-free-result__metric"><span>Two-Step</span><strong>${twoStep}</strong></article>
      </div>
      <p class="pulse-free-result__note"><strong>Important :</strong> ce premier résultat est un repère de dépistage et de préparation. Il ne correspond pas au KŌMØ Motion Score et ne remplace pas une interprétation médicale.</p>
      <div class="pulse-motion-bridge">
        <article class="pulse-motion-step"><small>01 · GRATUIT</small><strong>Pulse Free terminé</strong><p>Questionnaire initial + Chair Stand + Two-Step. Vous disposez déjà d’un premier profil fonctionnel.</p></article>
        <div class="pulse-motion-arrow" aria-hidden="true">→</div>
        <article class="pulse-motion-step is-next"><small>02 · AVEC UN PROFESSIONNEL</small><strong>KŌMØ Motion</strong><p>Questionnaire approfondi, acquisition instrumentée Myodev et analyse du mouvement pour construire votre évaluation Motion.</p></article>
      </div>
      <div class="pulse-free-result__actions"><button class="primary-button" type="button" data-find-motion>Je trouve un professionnel pour KŌMØ Motion →</button><span>Vous pourrez choisir un centre et un créneau Motion depuis Pulse.</span></div>`;
    grid.insertAdjacentElement('afterend',section);
    section.querySelector('[data-find-motion]')?.addEventListener('click',()=>{location.hash='documents'});
  }

  function applyPatientScope(){
    if(location.hash.replace(/^#/,'')!=='results')return;
    const root=document.querySelector('.tests-v1-root');
    if(!root)return;

    for(const key of PROFESSIONAL_ONLY)root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card')?.remove();
    PATIENT_KEYS.forEach(key=>addGuide(root,key));

    const baselineCard=root.querySelector('[data-open-test="baseline"]')?.closest('.test-v1-card');
    const baselineTitle=baselineCard?.querySelector('.test-v1-card-copy h3');
    if(baselineTitle)baselineTitle.textContent='Questionnaire initial';

    const done=PATIENT_KEYS.filter(key=>root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card')?.classList.contains('is-done')).length;
    const pct=Math.round(done/PATIENT_KEYS.length*100);
    const pctNode=root.querySelector('.tests-v1-progress-top strong'),bar=root.querySelector('.tests-v1-progress-track i'),count=root.querySelector('.tests-v1-progress-meta strong'),meta=root.querySelector('.tests-v1-progress-meta span');
    if(pctNode)pctNode.textContent=`${pct}%`;if(bar)bar.style.width=`${pct}%`;if(count)count.textContent=`${done}/${PATIENT_KEYS.length}`;if(meta)meta.textContent='étapes gratuites complétées';

    const heroAction=root.querySelector('.tests-v1-hero-actions button[data-open-test]'),heroStatus=root.querySelector('.tests-v1-hero-actions > span');
    if(done===PATIENT_KEYS.length&&heroAction){heroAction.dataset.openTest='baseline';heroAction.innerHTML='Revoir mes réponses <span>→</span>';if(heroStatus)heroStatus.textContent='Pulse Free terminé';}

    renderFreeResult(root,done);

    const consultationHead=[...root.querySelectorAll('.tests-v1-section-head')].find(x=>x.querySelector('.eyebrow')?.textContent?.includes('AVEC VOTRE PROFESSIONNEL'));
    if(consultationHead){
      const p=consultationHead.querySelector('p:last-child');
      if(p)p.textContent='Votre professionnel reprend vos données Pulse Free, complète le questionnaire et réalise l’acquisition instrumentée Myodev pour KŌMØ Motion.';
      const title=consultationHead.querySelector('h3');
      if(title)title.textContent='Étape suivante : KŌMØ Motion.';
    }
    const grid=root.querySelector('.tests-v1-consult-grid');
    if(grid)grid.innerHTML=`
      <article><span>01</span><h4>Questionnaire approfondi</h4><p>Votre contexte fonctionnel est complété et vérifié avec le professionnel.</p><b>KŌMØ Motion</b></article>
      <article><span>02</span><h4>Acquisition Myodev</h4><p>Les capteurs instrumentent la marche et la fonction musculaire selon le protocole Motion.</p><b>Myodev · Motion</b></article>
      <article><span>03</span><h4>Analyse Motion</h4><p>Les données fonctionnelles et instrumentées sont réunies pour produire votre évaluation KŌMØ Motion.</p><b>Avec votre professionnel</b></article>`;
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
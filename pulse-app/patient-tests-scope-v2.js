(() => {
  const KEEP='baseline';
  const RETIRED=new Set(['chair_stand','two_step','gait_4m','balance','stand_up','single_leg_stance']);

  function cleanPatientPreparation(){
    const root=document.querySelector('.tests-v1-root');if(!root)return;
    root.querySelectorAll('[data-open-test]').forEach(button=>{
      const key=button.dataset.openTest;
      if(RETIRED.has(key))button.closest('.test-v1-card')?.remove();
    });

    const baseline=root.querySelector('[data-open-test="baseline"]')?.closest('.test-v1-card');
    if(baseline){
      baseline.querySelector('.test-v1-card-copy h3')?.replaceChildren(document.createTextNode('Pré-bilan KŌMØ'));
      const button=baseline.querySelector('[data-open-test="baseline"]');if(button&&!baseline.classList.contains('is-done'))button.textContent='Commencer le pré-bilan →';
      if(!baseline.querySelector('[data-prebalance-guide]')){
        const guide=document.createElement('div');guide.dataset.prebalanceGuide='1';guide.className='test-v1-guide';
        guide.innerHTML='<div><span>Avant votre consultation</span><strong>Répondez aux questionnaires de contexte, dont le GLFS‑25. Ils aident le professionnel à comprendre votre situation mais ne modifient jamais le Motion Score.</strong></div>';
        baseline.querySelector('.test-v1-card-copy')?.appendChild(guide);
      }
    }

    const grid=root.querySelector('.tests-v1-grid');
    if(grid)grid.querySelectorAll('.test-v1-card').forEach(card=>{if(!card.querySelector(`[data-open-test="${KEEP}"]`))card.remove()});
    root.querySelector('[data-pulse-free-result]')?.remove();

    const done=baseline?.classList.contains('is-done')?1:0,pct=done?100:0;
    const pctNode=root.querySelector('.tests-v1-progress-top strong'),bar=root.querySelector('.tests-v1-progress-track i'),count=root.querySelector('.tests-v1-progress-meta strong'),meta=root.querySelector('.tests-v1-progress-meta span');
    if(pctNode)pctNode.textContent=`${pct}%`;if(bar)bar.style.width=`${pct}%`;if(count)count.textContent=`${done}/1`;if(meta)meta.textContent='pré-bilan complété';

    root.querySelectorAll('.tests-v1-section-head').forEach(head=>{
      const eye=head.querySelector('.eyebrow')?.textContent||'';
      if(eye.includes('AVEC VOTRE PROFESSIONNEL')){
        const title=head.querySelector('h3'),p=head.querySelector('p:last-child');
        if(title)title.textContent='Étape suivante : acquisition KŌMØ Motion.';
        if(p)p.textContent='Après le pré-bilan, votre professionnel réalise l’acquisition instrumentée Myodev puis Pulse calcule votre Motion Score à partir des données capteurs validées.';
      }
    });
    const consult=root.querySelector('.tests-v1-consult-grid');
    if(consult)consult.innerHTML=`<article><span>01</span><h4>Pré-bilan</h4><p>Questionnaires de contexte, dont GLFS‑25.</p><b>Contexte · hors score</b></article><article><span>02</span><h4>Acquisition Myodev</h4><p>Mesures neuromusculaires et données instrumentées.</p><b>Capteurs</b></article><article><span>03</span><h4>Motion Score</h4><p>Calcul, revue professionnelle et publication dans Pulse.</p><b>Sensor v0.6</b></article>`;
    root.dataset.patientScopeV2='sensor-only';
  }

  function apply(){cleanPatientPreparation()}
  function schedule(delay=120){setTimeout(apply,delay)}
  document.addEventListener('click',event=>{const b=event.target.closest('[data-open-test]');if(b&&RETIRED.has(b.dataset.openTest)){event.preventDefault();event.stopImmediatePropagation();return}},true);
  window.addEventListener('hashchange',()=>schedule(220));window.addEventListener('komo:route-ready',()=>schedule(80));document.addEventListener('DOMContentLoaded',()=>schedule(650));setTimeout(apply,1100);
})();

(() => {
  const ROUTE = 'results';
  const STEPS = [
    { key:'baseline', index:'01', title:'Questionnaire KŌMØ', meta:'25 questions · 5–7 min', copy:'Votre mobilité au quotidien, vos limitations et votre contexte fonctionnel. Commencez ici : ce questionnaire est inclus dans Pulse Free.', cta:'Répondre au questionnaire gratuit' },
    { key:'chair_stand', index:'02', title:'Chair Stand', meta:'30 secondes · chaise stable', copy:'Levez-vous et rasseyez-vous pendant 30 secondes avec le minuteur intégré Pulse.', cta:'Faire le Chair Stand' },
    { key:'two_step', index:'03', title:'Two-Step', meta:'2 pas · mètre ruban', copy:'Réalisez deux grands pas contrôlés puis renseignez la distance parcourue.', cta:'Faire le Two-Step' }
  ];

  function addStyles(){
    if(document.querySelector('#free-questionnaire-access-v1-style')) return;
    const style=document.createElement('style');
    style.id='free-questionnaire-access-v1-style';
    style.textContent=`
      .pulse-free-entry{margin:0 0 22px;padding:24px;border:1px solid rgba(29,36,31,.12);border-radius:24px;background:linear-gradient(135deg,#f3eee4 0%,#f8f6f1 58%,#eef1ea 100%)}
      .pulse-free-entry__head{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;margin-bottom:18px}.pulse-free-entry__head h3{margin:4px 0 5px;font-size:24px;letter-spacing:-.035em}.pulse-free-entry__head p{margin:0;color:#6d746e;line-height:1.55;max-width:720px}.pulse-free-entry__count{flex:none;min-width:96px;text-align:center;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.7);border:1px solid rgba(29,36,31,.10)}.pulse-free-entry__count strong{display:block;font-size:20px}.pulse-free-entry__count span{font-size:10px;color:#727970;text-transform:uppercase;letter-spacing:.08em}
      .pulse-free-entry__steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.pulse-free-entry__step{display:flex;flex-direction:column;gap:10px;min-height:190px;padding:18px;border:1px solid rgba(29,36,31,.10);border-radius:18px;background:rgba(255,255,255,.76)}.pulse-free-entry__step.is-questionnaire{background:#fff;border-color:rgba(87,105,84,.28);box-shadow:0 10px 30px rgba(36,47,36,.06)}.pulse-free-entry__step small{font-size:10px;letter-spacing:.08em;color:#777e78;text-transform:uppercase}.pulse-free-entry__step strong{font-size:17px}.pulse-free-entry__step p{margin:0;color:#6c736d;font-size:12px;line-height:1.55;flex:1}.pulse-free-entry__step button{align-self:flex-start;border:0;background:none;padding:0;color:#273329;font:inherit;font-size:12px;font-weight:700;cursor:pointer;text-align:left}.pulse-free-entry__step button:hover{text-decoration:underline}.pulse-free-entry__step .is-done-label{display:inline-flex;align-self:flex-start;padding:5px 8px;border-radius:999px;background:#e8eee5;color:#4f6650;font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
      .test-v1-card.is-free-questionnaire{border-color:rgba(91,111,88,.34)!important;box-shadow:0 16px 42px rgba(43,57,43,.07)!important}.test-v1-card.is-free-questionnaire .test-v1-index{background:#586b58!important;color:#fff!important}.test-v1-card.is-free-questionnaire .test-v1-card-copy h3::after{content:'GRATUIT · 25 QUESTIONS';display:inline-flex;margin-left:9px;vertical-align:middle;padding:5px 7px;border-radius:999px;background:#edf1e9;color:#596b59;font-size:8px;font-family:inherit;font-weight:800;letter-spacing:.08em}
      .kmq-context-divider{margin:22px 0 6px;padding-top:20px;border-top:1px solid rgba(29,36,31,.12)}.kmq-context-divider span{display:block;margin-bottom:6px;color:#7a817b;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.kmq-context-divider strong{font-size:16px}.kmq-context-divider p{margin:5px 0 0;color:#727871;font-size:12px;line-height:1.5}
      @media(max-width:850px){.pulse-free-entry__head{display:grid}.pulse-free-entry__count{justify-self:start}.pulse-free-entry__steps{grid-template-columns:1fr}.pulse-free-entry__step{min-height:0}.test-v1-card.is-free-questionnaire .test-v1-card-copy h3::after{display:flex;width:max-content;margin:8px 0 0}}
    `;
    document.head.appendChild(style);
  }

  function card(root,key){ return root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card') || null; }
  function done(root,key){ return Boolean(card(root,key)?.classList.contains('is-done')); }

  function renderOverview(root){
    let box=root.querySelector('[data-pulse-free-entry]');
    const finished=STEPS.filter(s=>done(root,s.key)).length;
    if(!box){
      box=document.createElement('section');
      box.className='pulse-free-entry';
      box.dataset.pulseFreeEntry='1';
      const grid=root.querySelector('.tests-v1-grid');
      if(!grid) return;
      grid.insertAdjacentElement('beforebegin',box);
    }
    box.innerHTML=`
      <div class="pulse-free-entry__head">
        <div><p class="eyebrow">PULSE FREE · INCLUS AVEC VOTRE COMPTE</p><h3>Votre bilan gratuit = 1 questionnaire + 2 tests physiques.</h3><p>Le questionnaire KŌMØ est une étape à part entière. Répondez d’abord aux 25 questions, puis réalisez le Chair Stand et le Two-Step.</p></div>
        <div class="pulse-free-entry__count"><strong>${finished}/3</strong><span>complétés</span></div>
      </div>
      <div class="pulse-free-entry__steps">
        ${STEPS.map((s,i)=>`<article class="pulse-free-entry__step ${i===0?'is-questionnaire':''}"><small>${s.index} · ${s.meta}</small><strong>${s.title}</strong><p>${s.copy}</p>${done(root,s.key)?'<span class="is-done-label">Terminé</span>':`<button type="button" data-open-test="${s.key}">${s.cta} →</button>`}</article>`).join('')}
      </div>`;
  }

  function applyPage(){
    if(location.hash.replace(/^#/,'')!==ROUTE) return;
    const root=document.querySelector('.tests-v1-root');
    if(!root) return;
    addStyles();

    const pageTitle=document.querySelector('#pageTitle');
    if(pageTitle) pageTitle.textContent='Pulse Free : votre questionnaire et vos deux tests.';

    const hero=root.querySelector('.tests-v1-hero-main');
    const heroTitle=hero?.querySelector('h2');
    const heroCopy=hero?.querySelector('p:not(.eyebrow)');
    if(heroTitle) heroTitle.innerHTML='Votre bilan gratuit.<br><em>1 questionnaire + 2 tests physiques.</em>';
    if(heroCopy) heroCopy.textContent='Commencez par le questionnaire KŌMØ de 25 questions, puis réalisez le Chair Stand et le Two-Step. Vos trois résultats constituent votre premier profil Pulse Free.';

    const firstHead=root.querySelector('.tests-v1-section-head:not(.consultation)');
    const firstTitle=firstHead?.querySelector('h3');
    const firstCopy=firstHead?.querySelector('p:last-child');
    if(firstTitle) firstTitle.textContent='Trois étapes gratuites, clairement séparées.';
    if(firstCopy) firstCopy.textContent='Le questionnaire est la première étape. Les deux suivantes sont des tests physiques réalisables à domicile lorsque les conditions de sécurité le permettent.';

    const qCard=card(root,'baseline');
    if(qCard){
      qCard.classList.add('is-free-questionnaire');
      const title=qCard.querySelector('.test-v1-card-copy h3');
      const copy=qCard.querySelector('.test-v1-card-copy > p');
      const meta=qCard.querySelector('.test-v1-card-foot > span');
      const button=qCard.querySelector('[data-open-test="baseline"]');
      if(title) title.textContent='Questionnaire KŌMØ';
      if(copy) copy.textContent='25 questions sur votre mobilité et vos activités quotidiennes. Il est gratuit et constitue la première étape de Pulse Free.';
      if(meta) meta.textContent='25 questions · 5–7 min · gratuit';
      if(button) button.textContent=done(root,'baseline')?'Revoir le questionnaire →':'Répondre au questionnaire gratuit →';
    }

    const heroAction=root.querySelector('.tests-v1-hero-actions button[data-open-test]');
    if(heroAction && !done(root,'baseline')){
      heroAction.dataset.openTest='baseline';
      heroAction.innerHTML='Répondre au questionnaire gratuit <span>→</span>';
    }

    renderOverview(root);
  }

  function enhanceQuestionnaireDialog(){
    const form=document.querySelector('#baselineTestForm');
    if(!form) return;
    addStyles();
    const dialog=document.querySelector('#pulseTestDialog');
    const head=dialog?.querySelector('.test-form-head');
    const eyebrow=head?.querySelector('.eyebrow');
    const title=head?.querySelector('h2');
    const intro=head?.querySelector('p:not(.eyebrow)');
    if(eyebrow) eyebrow.textContent='01 · PULSE FREE · QUESTIONNAIRE GRATUIT';
    if(title) title.textContent='Votre questionnaire KŌMØ.';
    if(intro) intro.textContent='Commencez par les 25 questions ci-dessous. Les quelques informations de contexte demandées ensuite servent à préparer et sécuriser les deux tests physiques.';

    const questionnaire=form.querySelector('.kmq-v1');
    if(questionnaire){
      form.prepend(questionnaire);
      let divider=form.querySelector('[data-kmq-context-divider]');
      if(!divider){
        divider=document.createElement('div');
        divider.className='kmq-context-divider';
        divider.dataset.kmqContextDivider='1';
        divider.innerHTML='<span>APRÈS LES 25 QUESTIONS</span><strong>Quelques informations de contexte</strong><p>Taille, poids et éléments de sécurité servent ensuite à préparer le Chair Stand et le Two-Step.</p>';
        questionnaire.insertAdjacentElement('afterend',divider);
      }
      questionnaire.scrollIntoView({block:'start'});
    }
  }

  function schedulePage(){ setTimeout(applyPage,40); setTimeout(applyPage,260); }
  document.addEventListener('click',event=>{
    if(event.target.closest?.('[data-open-test="baseline"]')){
      setTimeout(enhanceQuestionnaireDialog,0);
      setTimeout(enhanceQuestionnaireDialog,80);
    }
    if(event.target.closest?.('[data-route="results"]')) schedulePage();
  },true);
  window.addEventListener('hashchange',schedulePage);
  window.addEventListener('komo:route-ready',schedulePage);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(applyPage,820));
  setTimeout(applyPage,1250);
})();
(function mountMaisonEntry(){
  'use strict';
  const key='komo_pulse_selected_consultation_v1';
  const offers={
    online:{name:'Motion Online',price:'39 €',detail:'Bilan fonctionnel guidé à distance.'},
    motion:{name:'Motion',price:'200 €',detail:'Bilan fonctionnel au centre · 60 minutes.'}
  };
  const stored=()=>{
    try{const value=sessionStorage.getItem(key);return offers[value]?value:''}catch{return ''}
  };
  const save=value=>{
    try{if(value)sessionStorage.setItem(key,value);else sessionStorage.removeItem(key)}catch{}
  };
  const render=()=>{
    const page=document.querySelector('#app .login-page');
    if(!page||page.dataset.maisonEntryReady==='1')return;
    const story=page.querySelector('.login-story');
    const panel=page.querySelector('.login-panel');
    const form=page.querySelector('#login');
    const oldPanel=page.querySelector('.pulse-entry-panel');
    if(!story||!panel||!form||!oldPanel)return;
    page.dataset.maisonEntryReady='1';
    page.classList.add('maison-entry');
    story.classList.add('maison-story');
    panel.classList.add('maison-panel');
    story.innerHTML=`
      <div class="maison-story-top"><span>MAISON EPIGENETIC</span><b aria-hidden="true">×</b><span>KŌMØ LONGEVITY</span></div>
      <div class="maison-arches" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="maison-story-center">
        <span class="maison-small-label">CANNES · PALM BEACH</span>
        <h1>Bienvenue chez<br><em>Maison Epigenetic.</em></h1>
        <p>En collaboration avec <strong>KŌMØ Longevity</strong>, découvrez une approche personnalisée de l'évaluation du mouvement.</p>
      </div>
      <div class="maison-story-bottom"><span>LONGEVITY IN MOTION</span><span>01 / 02</span></div>`;
    const entry=document.createElement('section');
    entry.className='pulse-entry-panel maison-choice-panel';
    entry.setAttribute('aria-labelledby','maisonChooseTitle');
    entry.innerHTML=`
      <div class="maison-panel-top"><span class="maison-panel-logo">KŌMØ <small>PULSE</small></span><span class="maison-step">01 / CHOIX DU BILAN</span></div>
      <span class="maison-panel-label">VOTRE ESPACE DE CONSULTATION</span>
      <h2 id="maisonChooseTitle">Choisissez votre<br><em>consultation.</em></h2>
      <p class="maison-panel-lead">Sélectionnez votre bilan, puis connectez-vous à votre espace personnel sécurisé.</p>
      <div class="maison-choice-list">
        <button type="button" class="maison-choice" data-maison-choice="online" aria-label="Motion Online, 39 euros : aller à la connexion">
          <span class="maison-choice-top"><small>01 · À DISTANCE</small><strong>39 €</strong></span>
          <span class="maison-choice-title">Motion Online</span>
          <span class="maison-choice-desc">Votre évaluation fonctionnelle guidée, depuis chez vous et à votre rythme.</span>
          <span class="maison-choice-action">ACCÉDER À MOTION ONLINE <b aria-hidden="true">→</b></span>
        </button>
        <button type="button" class="maison-choice" data-maison-choice="motion" aria-label="Motion, 200 euros, 60 minutes au centre : aller à la connexion">
          <span class="maison-choice-top"><small>02 · AU CENTRE · 60 MIN</small><strong>200 €</strong></span>
          <span class="maison-choice-title">Motion</span>
          <span class="maison-choice-desc">Votre analyse de la marche, de l'équilibre et des capacités fonctionnelles à Cannes.</span>
          <span class="maison-choice-action">ACCÉDER À MA CONSULTATION <b aria-hidden="true">→</b></span>
        </button>
      </div>
      <p class="maison-choice-note">Votre choix n'entraîne aucun paiement ni réservation. L'accès au bilan reste soumis aux conditions de l'offre.</p>
      <div class="maison-panel-legal"><a href="https://komolongevity.com/fr/confidentialite/" target="_blank" rel="noopener noreferrer">Confidentialité</a><a href="https://komolongevity.com/fr/mentions-legales/" target="_blank" rel="noopener noreferrer">Mentions légales</a></div>`;
    oldPanel.replaceWith(entry);
    page.querySelector('.pulse-mobile-booking-bar')?.remove();
    const back=form.querySelector('.pulse-login-back');
    if(back)back.textContent='← Retour au choix du bilan';
    const context=document.createElement('div');
    context.className='maison-login-context';
    if(back)back.after(context);else form.prepend(context);
    const title=form.querySelector('h2');
    const sub=form.querySelector('h2 + p');
    const foot=document.createElement('p');
    foot.className='maison-login-help';
    form.append(foot);
    const show=(active,choice)=>{
      const option=offers[choice]||null;
      entry.hidden=active;
      form.hidden=!active;
      page.classList.toggle('maison-login-open',active);
      if(!active)return;
      context.textContent=option?'02 / CONNEXION · '+option.name.toUpperCase()+' · '+option.price:'02 / CONNEXION';
      if(title)title.textContent=option?'Connexion à '+option.name:'Connexion à votre espace';
      if(sub)sub.textContent='Identifiez-vous pour poursuivre votre consultation dans KŌMØ Pulse.';
      if(foot)foot.innerHTML=choice==='online'
        ? 'Vous avez déjà acheté votre bilan ? <a href="./online/activate/">Activer mon accès Motion Online</a>'
        : choice==='motion'
        ? 'Vous n’avez pas encore de compte ? <a href="mailto:contact@komolongevity.com">Contacter le centre</a>'
        : 'Accès réservé aux comptes KŌMØ Pulse autorisés.';
      form.querySelector('input[name="email"]')?.focus();
    };
    entry.querySelectorAll('[data-maison-choice]').forEach(button=>button.addEventListener('click',()=>{
      const choice=button.dataset.maisonChoice;
      if(!offers[choice])return;
      save(choice);
      history.replaceState(null,'',location.pathname+location.search+'#connexion');
      show(true,choice);
    }));
    if(back)back.addEventListener('click',()=>{
      save('');
      history.replaceState(null,'',location.pathname+location.search);
      show(false,'');
    });
    const param=new URLSearchParams(location.search).get('consultation');
    const choice=offers[param]?param:stored();
    if(offers[param]){
      save(param);
      history.replaceState(null,'',location.pathname+location.search+'#connexion');
    }
    show(location.hash==='#connexion',choice);
    window.addEventListener('hashchange',()=>{
      if(!page.isConnected)return;
      show(location.hash==='#connexion',stored());
    });
  };
  const app=document.getElementById('app');
  if(!app)return;
  const observer=new MutationObserver(render);
  observer.observe(app,{subtree:true,childList:true});
  render();
})();

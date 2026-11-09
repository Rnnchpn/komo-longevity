(function maisonEntryV3(){
  'use strict';
  const online='https://komolongevity.com/bilan-en-ligne/';
  const stateKey='komo_pulse_selected_consultation_v1';
  const save=choice=>{try{sessionStorage.setItem(stateKey,choice)}catch{}};
  function render(){
    const page=document.querySelector('#app .login-page');
    if(!page||page.dataset.maisonEntryReady==='3')return;
    const story=page.querySelector('.login-story'),panel=page.querySelector('.login-panel');
    const login=page.querySelector('#login'),old=page.querySelector('.pulse-entry-panel');
    if(!story||!panel||!login||!old)return;
    page.dataset.maisonEntryReady='3';
    page.classList.add('maison-entry');
    story.classList.add('maison-story');
    panel.classList.add('maison-panel');
    story.innerHTML=`
      <div class="maison-story-top"><span>MAISON EPIGENETIC</span><b aria-hidden="true">×</b><span>KŌMØ LONGEVITY</span></div>
      <div class="maison-arches" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="maison-story-center">
        <span class="maison-small-label">CANNES · PALM BEACH</span>
        <h1>Bienvenue chez<br><em>Maison Epigenetic.</em></h1>
        <p>En collaboration avec <strong>KŌMØ Longevity</strong>, découvrez une évaluation personnalisée du mouvement.</p>
      </div>
      <div class="maison-story-bottom"><span>LONGEVITY IN MOTION</span><span>MAISON EPIGENETIC × KŌMØ</span></div>`;
    const entry=document.createElement('section');
    entry.className='pulse-entry-panel maison-choice-panel';
    entry.innerHTML=`
      <div class="maison-panel-top"><span class="maison-panel-logo">KŌMØ <small>PULSE</small></span><span class="maison-step" id="maisonStepLabel">01 / VOTRE BILAN</span></div>
      <div class="maison-screen" data-maison-screen="choice">
        <span class="maison-panel-label">VOTRE ESPACE DE CONSULTATION</span>
        <h2>Choisissez votre<br><em>consultation.</em></h2>
        <p class="maison-panel-lead">Deux parcours, une approche du mouvement adaptée à vos besoins.</p>
        <div class="maison-choice-list">
          <a class="maison-choice" data-maison-choice="online" href="${online}" aria-label="Découvrir Motion Online à 39 euros">
            <span class="maison-choice-top"><small>01 · À DISTANCE</small><strong>39 €</strong></span>
            <span class="maison-choice-title">Motion Online</span>
            <span class="maison-choice-desc">Découvrez le déroulement de votre bilan et accédez au paiement sécurisé.</span>
            <span class="maison-choice-action">DÉCOUVRIR LE BILAN <b aria-hidden="true">→</b></span>
          </a>
          <button type="button" class="maison-choice" data-maison-choice="motion" id="maisonChooseMotion">
            <span class="maison-choice-top"><small>02 · CANNES · 60 MIN</small><strong>200 €</strong></span>
            <span class="maison-choice-title">Motion au centre</span>
            <span class="maison-choice-desc">Marche, équilibre, force et mobilité. Votre opérateur ouvre votre dossier directement au centre.</span>
            <span class="maison-choice-action">DÉMARRER LE BILAN <b aria-hidden="true">→</b></span>
          </button>
        </div>
        <p class="maison-choice-note">Aucune demande de création de compte ni validation préalable pour le bilan au centre.</p>
        <div class="maison-entry-inline"><span>Vous avez déjà un compte ?</span> <button type="button" data-maison-login>Connectez-vous</button></div>
      </div>
      <div class="maison-screen maison-account-screen" data-maison-screen="motion" hidden>
        <button type="button" class="maison-login-back" data-maison-back="choice">← Revenir aux bilans</button>
        <span class="maison-panel-label">MOTION AU CENTRE · 200 €</span>
        <h2>Votre bilan Motion.<br><em>Sans démarche préalable.</em></h2>
        <p class="maison-panel-lead">Démarrez votre séance sur cet appareil, puis communiquez le code affiché à votre opérateur. Il pourra suivre votre progression en direct et associer votre séance à un dossier fictif.</p>
        <div class="maison-account-actions">
          <button class="maison-action-primary" type="button" id="maisonLiveStart">Commencer ma consultation Motion <span>→</span></button>
          <button class="maison-action-secondary" type="button" data-maison-login>J'ai déjà un compte · Me connecter <span>→</span></button>
          <button class="maison-action-secondary" type="button" data-maison-back="choice">Retour aux bilans <span>→</span></button>
        </div>
        <p class="maison-choice-note">La session test fonctionne sans compte patient. La caméra reste locale et les données de santé réelles ne sont pas autorisées dans cet environnement.</p>
      </div>
      <div class="maison-panel-legal"><a href="https://komolongevity.com/fr/confidentialite/" target="_blank" rel="noopener noreferrer">Confidentialité</a><a href="https://komolongevity.com/fr/mentions-legales/" target="_blank" rel="noopener noreferrer">Mentions légales</a></div>`;
    old.replaceWith(entry);
    page.querySelector('.pulse-mobile-booking-bar')?.remove();
    login.classList.add('maison-login');
    const back=login.querySelector('.pulse-login-back');
    if(back){
      back.textContent='← Retour aux bilans';
      back.addEventListener('click',event=>{
        event.preventDefault();event.stopImmediatePropagation();
        history.replaceState(null,'',location.pathname+location.search);
        show('choice');
      },true);
    }
    const title=login.querySelector('h2'),subtitle=login.querySelector('h2 + p');
    if(title)title.textContent='Connectez-vous.';
    if(subtitle)subtitle.textContent='Retrouvez votre espace Pulse et vos résultats personnels.';
    const screens=[...entry.querySelectorAll('[data-maison-screen]')];
    function show(name){
      login.hidden=name!=='login';
      entry.hidden=name==='login';
      screens.forEach(x=>x.hidden=x.dataset.maisonScreen!==name);
      page.classList.toggle('maison-login-open',name==='login');
      const step=entry.querySelector('#maisonStepLabel');
      if(step)step.textContent=({choice:'01 / VOTRE BILAN',motion:'02 / MOTION AU CENTRE'})[name]||'';
      if(name==='login')login.querySelector('input[name="email"]')?.focus();
    }
    async function launchMotion(button){
      if(button.disabled)return;
      button.disabled=true;
      try{
        const module=await import('./motion-live-guest-v1.js?v=20261109-tripod-v1');
        await module.openMotionLive();
      }catch(error){
        console.error('[Pulse Motion live]',error);
        show('motion');
        alert("Impossible de démarrer la session de test. Vérifiez votre connexion.");
      }finally{button.disabled=false}
    }
    // On iPhone/Android, choosing Motion is itself the start action.
    // Keep the explanatory step on larger screens and preserve the 39 € route.
    entry.querySelector('#maisonChooseMotion')?.addEventListener('click',async event=>{
      save('motion');
      if(window.matchMedia('(max-width: 850px)').matches)await launchMotion(event.currentTarget);
      else show('motion');
    });
    entry.querySelector('#maisonLiveStart')?.addEventListener('click',event=>launchMotion(event.currentTarget));
    entry.querySelectorAll('[data-maison-login]').forEach(x=>x.addEventListener('click',()=>{
      history.replaceState(null,'',location.pathname+location.search+'#connexion');
      show('login');
    }));
    entry.querySelectorAll('[data-maison-back]').forEach(x=>x.addEventListener('click',()=>show(x.dataset.maisonBack)));
    const params=new URLSearchParams(location.search);
    if(location.hash==='#connexion')show('login');
    else if(params.get('consultation')==='motion')show('motion');
    else show('choice');
    window.addEventListener('hashchange',()=>{
      if(page.isConnected&&location.hash==='#connexion')show('login');
    });
  }
  const app=document.getElementById('app');
  if(!app)return;
  new MutationObserver(render).observe(app,{subtree:true,childList:true});
  render();
})();

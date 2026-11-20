(function maisonEntryV3(){
  'use strict';
  // Deux lieux de consultation (20/11/2026) ; l’offre à distance est retirée.
  const cannes='https://komolongevity.com/fr/reserver-motion-cannes/';
  const contact='https://komolongevity.com/fr/contact/';
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
      <div class="maison-story-top"><span>KŌMØ LONGEVITY</span><b aria-hidden="true">·</b><span>BILAN MOTION</span></div>
      <div class="maison-arches" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="maison-story-center">
        <span class="maison-small-label">BEAUSOLEIL · CANNES</span>
        <h1>Votre mouvement,<br><em>mesuré et suivi.</em></h1>
        <p>Un bilan <strong>KŌMØ Motion</strong> en cabinet, à la Clinique HIRO ou à la Maison Epigenetic, avec le même protocole à chaque contrôle.</p>
      </div>
      <div class="maison-story-bottom"><span>LONGEVITY IN MOTION</span><span>CLINIQUE HIRO · MAISON EPIGENETIC</span></div>`;
    const entry=document.createElement('section');
    entry.className='pulse-entry-panel maison-choice-panel';
    entry.innerHTML=`
      <div class="maison-panel-top"><span class="maison-panel-logo">KŌMØ <small>PULSE</small></span><span class="maison-step" id="maisonStepLabel">01 / VOTRE LIEU</span></div>
      <div class="maison-screen" data-maison-screen="choice">
        <span class="maison-panel-label">VOTRE ESPACE DE CONSULTATION</span>
        <h2>Choisissez votre<br><em>lieu de consultation.</em></h2>
        <p class="maison-panel-lead">Le même bilan KŌMØ Motion, les mêmes appareils VALD, deux adresses.</p>
        <div class="maison-choice-list">
          <a class="maison-choice" data-maison-choice="hiro" href="${contact}" target="_blank" rel="noopener noreferrer" aria-label="Prendre contact pour un bilan à la Clinique HIRO, Beausoleil">
            <span class="maison-choice-top"><small>01 · BEAUSOLEIL · MONACO</small><strong>60 min</strong></span>
            <span class="maison-choice-title">Clinique HIRO</span>
            <span class="maison-choice-desc">Marche, équilibre, force et plateformes de mesure, sur rendez-vous.</span>
            <span class="maison-choice-action">NOUS CONTACTER <b aria-hidden="true">→</b></span>
          </a>
          <a class="maison-choice" data-maison-choice="cannes" href="${cannes}" target="_blank" rel="noopener noreferrer" aria-label="Demander un créneau à la Maison Epigenetic, Cannes">
            <span class="maison-choice-top"><small>02 · CANNES · PALM BEACH</small><strong>60 min</strong></span>
            <span class="maison-choice-title">Maison Epigenetic</span>
            <span class="maison-choice-desc">Le même protocole, avec un contrôle à 6 et 12 semaines.</span>
            <span class="maison-choice-action">DEMANDER UN CRÉNEAU <b aria-hidden="true">→</b></span>
          </a>
        </div>
        <button type="button" class="maison-choice-note maison-how" id="maisonChooseMotion">Comment se déroule le bilan ? →</button>
        <div class="maison-entry-inline"><span>Vous avez déjà un compte ?</span> <button type="button" data-maison-login>Connectez-vous</button></div>
      </div>
      <div class="maison-screen maison-account-screen" data-maison-screen="motion" hidden>
        <button type="button" class="maison-login-back" data-maison-back="choice">← Revenir aux lieux</button>
        <span class="maison-panel-label">LE BILAN KŌMØ MOTION</span>
        <h2>Une heure en cabinet.<br><em>Rien à installer.</em></h2>
        <p class="maison-panel-lead">Votre praticien crée votre dossier et conduit treize mesures : marche, équilibre, force de préhension, de genou et de hanche, plateformes de force VALD et questionnaire. Un iPhone fixé sur trépied suit le mouvement, sans enregistrement vidéo. Votre rapport vous est remis à la fin du bilan, puis un contrôle est proposé à 6 et 12 semaines.</p>
        <div class="maison-account-actions">
          <button class="maison-action-primary" type="button" id="maisonLiveStart">Praticien · se connecter <span>→</span></button>
          <button class="maison-action-secondary" type="button" data-maison-back="choice">Retour aux lieux <span>→</span></button>
        </div>
        <p class="maison-choice-note">Aucun compte patient n’est nécessaire pour réaliser le bilan.</p>
      </div>
      <div class="maison-panel-legal"><a href="https://komolongevity.com/fr/confidentialite/" target="_blank" rel="noopener noreferrer">Confidentialité</a><a href="https://komolongevity.com/fr/mentions-legales/" target="_blank" rel="noopener noreferrer">Mentions légales</a></div>`;
    old.replaceWith(entry);
    page.querySelector('.pulse-mobile-booking-bar')?.remove();
    login.classList.add('maison-login');
    const back=login.querySelector('.pulse-login-back');
    if(back){
      back.textContent='← Retour aux lieux';
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
      if(step)step.textContent=({choice:'01 / VOTRE LIEU',motion:'02 / LE BILAN'})[name]||'';
      if(name==='login')login.querySelector('input[name="email"]')?.focus();
    }
    // Onsite assessments use the CLINICIAN'S equipment only.
    // The public booking page must never access a patient's phone camera.
    entry.querySelector('#maisonChooseMotion')?.addEventListener('click',()=>{
      save('motion');
      show('motion');
    });
    entry.querySelector('#maisonLiveStart')?.addEventListener('click',()=>{
      history.replaceState(null,'',location.pathname+location.search+'#connexion');
      show('login');
    });
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

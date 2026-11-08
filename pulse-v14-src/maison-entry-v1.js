(function maisonEntryV2(){
  'use strict';
  const endpoint='https://uqlolefsiktbznnymriy.supabase.co/functions/v1/motion-200-intake';
  const publishable='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
  const online='https://komolongevity.com/bilan-en-ligne/';
  const stateKey='komo_pulse_selected_consultation_v1';
  const save=choice=>{try{sessionStorage.setItem(stateKey,choice)}catch{}};
  function render(){
    const page=document.querySelector('#app .login-page');
    if(!page||page.dataset.maisonEntryReady==='2')return;
    const story=page.querySelector('.login-story'),panel=page.querySelector('.login-panel'),login=page.querySelector('#login'),old=page.querySelector('.pulse-entry-panel');
    if(!story||!panel||!login||!old)return;
    page.dataset.maisonEntryReady='2';
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
          <a class="maison-choice" data-maison-choice="online" href="${online}" aria-label="Découvrir Motion Online à 39 euros avant paiement sécurisé">
            <span class="maison-choice-top"><small>01 · À DISTANCE</small><strong>39 €</strong></span>
            <span class="maison-choice-title">Motion Online</span>
            <span class="maison-choice-desc">Découvrez le déroulement du bilan, puis accédez au paiement sécurisé Stripe.</span>
            <span class="maison-choice-action">DÉCOUVRIR LE BILAN <b aria-hidden="true">→</b></span>
          </a>
          <button type="button" class="maison-choice" data-maison-choice="motion" id="maisonChooseMotion">
            <span class="maison-choice-top"><small>02 · CANNES · 60 MIN</small><strong>200 €</strong></span>
            <span class="maison-choice-title">Motion au centre</span>
            <span class="maison-choice-desc">Marche, équilibre, force et mobilité. Demande d'accès à la consultation.</span>
            <span class="maison-choice-action">DEMANDER UN BILAN <b aria-hidden="true">→</b></span>
          </button>
        </div>
        <p class="maison-choice-note">Une demande de consultation n'est ni un rendez-vous confirmé ni un paiement.</p>
        <div class="maison-entry-inline"><span>Vous avez déjà un compte ?</span> <button type="button" data-maison-login>Connectez-vous</button></div>
      </div>
      <div class="maison-screen maison-account-screen" data-maison-screen="account" hidden>
        <button type="button" class="maison-login-back" data-maison-back="choice">← Revenir aux bilans</button>
        <span class="maison-panel-label">MOTION AU CENTRE · 200 €</span>
        <h2>Votre accès<br><em>personnel.</em></h2>
        <p class="maison-panel-lead">Avez-vous déjà un compte KŌMØ Pulse ?</p>
        <div class="maison-account-actions">
          <button class="maison-action-primary" type="button" data-maison-login>Oui, je me connecte <span>→</span></button>
          <button class="maison-action-secondary" type="button" id="maisonNewAccount">Non, je demande la création de mon compte <span>→</span></button>
        </div>
        <p class="maison-choice-note">La création d'un compte pour le bilan au centre est soumise à la validation de l'équipe KŌMØ.</p>
      </div>
      <div class="maison-screen maison-request-screen" data-maison-screen="request" hidden>
        <button type="button" class="maison-login-back" data-maison-back="account">← Retour</button>
        <span class="maison-panel-label">DEMANDE DE COMPTE · MOTION 200 €</span>
        <h2>Préparons votre<br><em>consultation.</em></h2>
        <p class="maison-panel-lead">Envoyez votre demande à l'opérateur. Après validation, vous recevrez votre invitation par e-mail.</p>
        <form id="maisonRequestForm" class="maison-request-form">
          <div class="maison-fields-two">
            <label>Prénom <input name="first_name" autocomplete="given-name" required minlength="2" maxlength="80"></label>
            <label>Nom <input name="last_name" autocomplete="family-name" required minlength="2" maxlength="80"></label>
          </div>
          <label>Adresse e-mail <input type="email" name="email" autocomplete="email" required maxlength="180"></label>
          <label>Téléphone (facultatif) <input type="tel" name="phone" autocomplete="tel" maxlength="35"></label>
          <div class="maison-fields-two">
            <label>Date souhaitée <input type="date" name="preferred_date" required></label>
            <label>Autre date possible <input type="date" name="alternative_date"></label>
          </div>
          <label>Plage horaire <select name="preferred_time"><option value="indifferent">Indifférent</option><option value="matin">Matin</option><option value="apres_midi">Après-midi</option><option value="fin_journee">Fin de journée</option></select></label>
          <label class="maison-checkbox"><input type="checkbox" name="privacy_acknowledged" required><span>J'accepte que mes coordonnées soient utilisées pour répondre à ma demande, conformément à la <a href="https://komolongevity.com/fr/confidentialite/" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>. Aucun renseignement de santé n'est demandé ici.</span></label>
          <input type="text" name="website" aria-hidden="true" tabindex="-1" autocomplete="off" class="maison-honeypot">
          <p class="maison-request-feedback" id="maisonRequestFeedback" aria-live="polite"></p>
          <button type="submit" class="maison-action-primary" id="maisonSubmitRequest">Envoyer ma demande <span>→</span></button>
        </form>
      </div>
      <div class="maison-screen maison-success-screen" data-maison-screen="success" hidden>
        <span class="maison-success-symbol" aria-hidden="true">✓</span>
        <span class="maison-panel-label">DEMANDE TRANSMISE</span>
        <h2>Merci.<br><em>À très bientôt.</em></h2>
        <p class="maison-panel-lead">Votre demande a été enregistrée. L'équipe KŌMØ va l'examiner. Après validation, vous recevrez un e-mail pour accéder à Pulse et poursuivre la préparation de votre bilan.</p>
        <p class="maison-choice-note">Le rendez-vous n'est pas encore confirmé. Aucun paiement n'a été effectué.</p>
        <button type="button" class="maison-action-secondary" data-maison-back="choice">Retour aux bilans <span>→</span></button>
      </div>
      <div class="maison-panel-legal"><a href="https://komolongevity.com/fr/confidentialite/" target="_blank" rel="noopener noreferrer">Confidentialité</a><a href="https://komolongevity.com/fr/mentions-legales/" target="_blank" rel="noopener noreferrer">Mentions légales</a></div>`;
    old.replaceWith(entry);
    page.querySelector('.pulse-mobile-booking-bar')?.remove();
    login.classList.add('maison-login');
    const back=login.querySelector('.pulse-login-back');
    if(back){
      back.textContent='← Retour à la demande';
      back.addEventListener('click',event=>{
        event.preventDefault();event.stopImmediatePropagation();
        history.replaceState(null,'',location.pathname+location.search);
        show('account');
      },true);
    }
    const title=login.querySelector('h2'),subtitle=login.querySelector('h2 + p');
    if(title)title.textContent='Connectez-vous.';
    if(subtitle)subtitle.textContent='Vous avez déjà un compte Pulse ? Identifiez-vous pour poursuivre.';
    const help=document.createElement('div');help.className='maison-entry-inline';
    help.innerHTML='Pas encore de compte ? <button type="button" id="maisonLoginToRequest">Demander sa création</button>';
    login.append(help);
    const screens=[...entry.querySelectorAll('[data-maison-screen]')];
    function show(name){
      login.hidden=name!=='login';
      entry.hidden=name==='login';
      screens.forEach(x=>x.hidden=x.dataset.maisonScreen!==name);
      page.classList.toggle('maison-login-open',name==='login');
      const step=entry.querySelector('#maisonStepLabel');
      if(step)step.textContent=({choice:'01 / VOTRE BILAN',account:'02 / VOTRE COMPTE',request:'03 / VOTRE DEMANDE',success:'DEMANDE ENREGISTRÉE'})[name]||'';
      if(name==='login')login.querySelector('input[name="email"]')?.focus();
      if(name==='request')entry.querySelector('input[name="first_name"]')?.focus();
    }
    entry.querySelector('#maisonChooseMotion')?.addEventListener('click',()=>{
      save('motion');show('account');
    });
    entry.querySelector('#maisonNewAccount')?.addEventListener('click',()=>show('request'));
    entry.querySelectorAll('[data-maison-login]').forEach(x=>x.addEventListener('click',()=>{
      history.replaceState(null,'',location.pathname+location.search+'#connexion');
      show('login');
    }));
    entry.querySelectorAll('[data-maison-back]').forEach(x=>x.addEventListener('click',()=>show(x.dataset.maisonBack)));
    login.querySelector('#maisonLoginToRequest')?.addEventListener('click',()=>{
      history.replaceState(null,'',location.pathname+location.search);
      show('request');
    });
    const rf=entry.querySelector('#maisonRequestForm');
    const minDate=new Date().toISOString().slice(0,10);
    rf.querySelectorAll('input[type="date"]').forEach(x=>x.min=minDate);
    rf.addEventListener('submit',async event=>{
      event.preventDefault();
      if(!rf.reportValidity())return;
      const button=entry.querySelector('#maisonSubmitRequest'),feedback=entry.querySelector('#maisonRequestFeedback');
      const values=Object.fromEntries(new FormData(rf).entries());
      const payload={action:'submit',first_name:values.first_name,last_name:values.last_name,email:values.email,phone:values.phone,preferred_date:values.preferred_date,alternative_date:values.alternative_date,preferred_time:values.preferred_time,website:values.website,privacy_acknowledged:values.privacy_acknowledged==='on'};
      button.disabled=true;feedback.textContent='Enregistrement de la demande…';
      try{
        const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','apikey':publishable},body:JSON.stringify(payload)});
        const data=await res.json();
        if(!res.ok||!data.ok)throw new Error(data.error==='too_many_requests'?'Trop de tentatives. Réessayez ultérieurement.':'La demande n’a pas pu être transmise. Réessayez.');
        rf.reset();show('success');
      }catch(error){feedback.textContent=error.message||'Erreur temporaire.'}
      finally{button.disabled=false}
    });
    const params=new URLSearchParams(location.search);
    if(location.hash==='#connexion')show('login');
    else if(params.get('consultation')==='motion')show('account');
    else show('choice');
    window.addEventListener('hashchange',()=>{
      if(!page.isConnected)return;
      if(location.hash==='#connexion')show('login');
    });
  }
  const app=document.getElementById('app');
  if(!app)return;
  new MutationObserver(render).observe(app,{subtree:true,childList:true});
  render();
})();
// The admin request workspace is independent of patient authentication screens.
import('./operator-requests-v1.js').catch(()=>{});

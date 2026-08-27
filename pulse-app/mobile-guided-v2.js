/* KŌMØ Pulse — guided mobile patient experience v2 */
(() => {
  const MOBILE = '(max-width: 767px)';
  let raf = 0;

  function isMobile(){ return window.matchMedia(MOBILE).matches; }
  function route(){ return location.hash.replace(/^#/,'') || 'home'; }
  function isPatientSurface(){ return !['clinical','admin'].includes(route()); }

  function setSurface(){
    if (!isMobile()) {
      delete document.documentElement.dataset.mobileSurface;
      return false;
    }
    document.documentElement.dataset.mobileSurface = isPatientSurface() ? 'patient' : 'staff';
    return isPatientSurface();
  }

  function ensureAccountTrigger(){
    const actions = document.querySelector('.topbar-actions');
    const source = document.querySelector('#accountButton');
    if (!actions || !source) return;
    let button = actions.querySelector('.mobile-account-trigger');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'mobile-account-trigger';
      button.setAttribute('aria-label','Ouvrir mon compte');
      button.addEventListener('click', event => {
        event.stopPropagation();
        source.click();
      });
      actions.appendChild(button);
    }
    const initials = document.querySelector('#avatarInitials')?.textContent?.trim() || 'K';
    if (button.textContent !== initials) button.textContent = initials;
  }

  function addAccountLink({id,label,href,onClick,after}){
    const pop = document.querySelector('#accountPopover');
    if (!pop || pop.querySelector(`[data-guided-account-link="${id}"]`)) return;
    const el = href ? document.createElement('a') : document.createElement('button');
    if (href) {
      el.href = href;
      if (href.startsWith('#')) el.dataset.route = href.slice(1);
    } else {
      el.type = 'button';
    }
    el.dataset.guidedAccountLink = id;
    el.textContent = label;
    if (onClick) el.addEventListener('click', onClick);
    const anchor = after ? pop.querySelector(after) : null;
    if (anchor) anchor.insertAdjacentElement('afterend',el);
    else pop.appendChild(el);
  }

  function ensureAccountHub(){
    const pop = document.querySelector('#accountPopover');
    if (!pop) return;
    addAccountLink({id:'appointments',label:'Rendez-vous',href:'#documents',after:'[data-route="profile"]'});
    addAccountLink({id:'messages',label:'Messages',href:'#messages',after:'[data-guided-account-link="appointments"]'});

    const modeSwitch = document.querySelector('#modeSwitch');
    if (modeSwitch && !modeSwitch.hidden) {
      addAccountLink({
        id:'professional',
        label:'Espace professionnel',
        after:'[data-guided-account-link="messages"]',
        onClick:() => {
          pop.hidden = true;
          const pro = modeSwitch.querySelector('[data-mode="clinical"]');
          if (pro) pro.click();
          location.hash = 'clinical';
        }
      });
    }

    const admin = document.querySelector('[data-admin-shortcut]');
    if (admin) {
      addAccountLink({
        id:'admin',
        label:'Administration',
        after:'[data-guided-account-link="professional"],[data-guided-account-link="messages"]',
        onClick:() => { pop.hidden = true; admin.click(); }
      });
    }
  }

  function homeState(){
    const rows = [...document.querySelectorAll('.khs-stack .khs-row')];
    const freeDone = Boolean(rows[0]?.classList.contains('is-done'));
    const motionDone = Boolean(rows[1]?.classList.contains('is-done'));
    if (!freeDone) {
      return {
        stage:1,
        eyebrow:'VOTRE PARCOURS',
        title:'Votre point de départ.',
        lead:'Trois étapes suffisent pour établir votre première référence de mobilité. Pulse vous guide, une étape à la fois.',
        cta:'Commencer mon évaluation',
        target:'results'
      };
    }
    if (!motionDone) {
      return {
        stage:2,
        eyebrow:'PROCHAINE ÉTAPE',
        title:'Votre première référence est prête.',
        lead:'Votre évaluation personnelle est enregistrée. KŌMØ Motion complète maintenant ce point de départ par une mesure instrumentée.',
        cta:'Planifier KŌMØ Motion',
        target:'documents'
      };
    }
    return {
      stage:3,
      eyebrow:'VOS RÉSULTATS',
      title:'Votre mobilité devient une trajectoire.',
      lead:'Vos données Motion sont disponibles. Retrouvez vos scores, leur interprétation et leur évolution dans le temps.',
      cta:'Voir mes résultats',
      target:'path'
    };
  }

  function journey(stage){
    const steps = [
      ['Évaluation personnelle','Questionnaire · Chair Stand · Two-Step'],
      ['KŌMØ Motion','Mesure instrumentée avec un professionnel'],
      ['Résultats & suivi','Scores, priorités et évolution']
    ];
    return `<div class="mg-journey">${steps.map((step,index) => {
      const n = index + 1;
      const klass = n < stage ? 'is-done' : n === stage ? 'is-active' : '';
      const marker = n < stage ? '✓' : String(n);
      return `<div class="mg-step ${klass}"><span class="mg-step-index">${marker}</span><div class="mg-step-copy"><strong>${step[0]}</strong><span>${step[1]}</span></div></div>`;
    }).join('')}</div>`;
  }

  function enhanceHome(){
    if (route() !== 'home') return;
    const root = document.querySelector('#viewRoot');
    const hero = root?.querySelector('.hero-grid > .hero-card:not(.side-summary), .hero-grid > article.hero-card');
    if (!root || !hero) return;
    const state = homeState();
    const signature = `${state.stage}:${state.target}:${state.cta}`;
    root.classList.add('mg-home-guided');
    root.dataset.guidedStage = String(state.stage);
    hero.classList.add('mg-home-hero');
    if (hero.dataset.mgSignature === signature) return;
    hero.dataset.mgSignature = signature;
    hero.innerHTML = `<div class="mg-home-copy">
      <div class="mg-home-kicker"><p class="eyebrow">${state.eyebrow}</p><span class="mg-stage-pill">Étape ${state.stage} sur 3</span></div>
      <h2>${state.title}</h2>
      <p class="mg-lead">${state.lead}</p>
      ${journey(state.stage)}
      <button class="mg-home-cta" type="button" data-route="${state.target}"><span>${state.cta}</span><span aria-hidden="true">→</span></button>
    </div>`;
  }

  function enhanceTests(){
    if (route() !== 'results') return;
    const root = document.querySelector('.tests-v1-root');
    if (!root) return;

    const title = root.querySelector('.tests-v1-hero-main h2');
    const intro = root.querySelector('.tests-v1-hero-main > p:not(.eyebrow)');
    if (title && title.dataset.mobileGuided !== '1') {
      title.dataset.mobileGuided = '1';
      title.innerHTML = 'Trois étapes.<br><em>Votre première référence.</em>';
    }
    if (intro && intro.dataset.mobileGuided !== '1') {
      intro.dataset.mobileGuided = '1';
      intro.textContent = 'Questionnaire, Chair Stand et Two-Step : Pulse vous indique quoi faire, dans quel ordre et conserve chaque mesure.';
    }

    const cards = [...root.querySelectorAll('.tests-v1-grid .test-v1-card')];
    cards.forEach(card => card.classList.remove('mg-next-test'));
    const next = cards.find(card => !card.classList.contains('is-done') && !card.classList.contains('is-restricted'));
    if (next) next.classList.add('mg-next-test');

    const sectionHead = [...root.querySelectorAll('.tests-v1-section-head')].find(head => !head.classList.contains('consultation'));
    const sectionTitle = sectionHead?.querySelector('h3');
    const sectionCopy = sectionHead?.querySelector(':scope > p');
    if (sectionTitle) sectionTitle.textContent = next ? 'À faire maintenant.' : 'Votre première référence est complète.';
    if (sectionCopy) sectionCopy.textContent = next ? 'Suivez l’ordre proposé. Chaque étape enregistrée vous rapproche du premier résultat KŌMØ.' : 'Votre résultat gratuit est disponible ci-dessous. La suite se poursuit avec KŌMØ Motion.';
  }

  function refresh(){
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (!setSurface()) return;
      ensureAccountTrigger();
      ensureAccountHub();
      enhanceHome();
      enhanceTests();
    });
  }

  const observer = new MutationObserver(() => refresh());
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('orientationchange',() => setTimeout(refresh,100));
  window.addEventListener('hashchange',() => { refresh(); setTimeout(refresh,120); setTimeout(refresh,420); });
  window.addEventListener('komo:route-ready',refresh);
  window.addEventListener('komo:session-ready',refresh);
  document.addEventListener('DOMContentLoaded',() => setTimeout(refresh,250));
  setTimeout(refresh,650);
  setTimeout(refresh,1400);
})();

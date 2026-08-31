/* Komo — patient guide V1 · deterministic / zero-token */
(() => {
  'use strict';

  const VERSION = '1.1.0-zero-token';
  let observer = null;

  const route = () => window.KomoPatientNavigation?.route?.() || location.hash.replace(/^#/, '') || 'home';
  const role = () => window.KomoRuntime?.role || window.KomoRuntime?.getContext?.()?.role || 'member';
  const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const isPatient = () => {
    const currentRoute = normalize(route());
    const currentRole = normalize(role());
    if (['clinical', 'admin', 'founder', 'run'].includes(currentRoute)) return false;
    if (['clinical', 'admin', 'founder', 'pro', 'professional', 'operator'].includes(currentRole)) return false;
    return !document.querySelector('#modeSwitch [data-mode="clinical"]')?.classList.contains('active');
  };

  const contexts = {
    home: {
      kicker: 'AUJOURD’HUI',
      title: 'Je vous aide à aller à l’essentiel.',
      copy: 'Posez une question simple sur votre bilan, vos scores ou la prochaine étape. Komo Guide répond localement, sans IA générative.',
      actions: [['Voir mon bilan', 'results'], ['Voir ma trajectoire', 'path'], ['Préparer la suite', 'documents']]
    },
    results: {
      kicker: 'VOTRE BILAN',
      title: 'Comprendre ce que votre bilan a montré.',
      copy: 'Je peux vous expliquer le rôle des scores et vous ramener aux résultats réellement publiés dans Pulse.',
      actions: [['Lire mes résultats', 'results'], ['Voir mon évolution', 'path'], ['Préparer la prochaine étape', 'documents']]
    },
    path: {
      kicker: 'VOTRE TRAJECTOIRE',
      title: 'Voir si votre mobilité évolue.',
      copy: 'Comparez uniquement vos références réellement publiées et retrouvez ce qui a changé dans le temps.',
      actions: [['Voir ma trajectoire', 'path'], ['Revoir mon bilan', 'results'], ['Voir mon suivi', 'plan']]
    },
    plan: {
      kicker: 'VOTRE SUIVI',
      title: 'Savoir quoi faire maintenant.',
      copy: 'Retrouvez vos priorités validées et ce qui compte jusqu’à votre prochaine réévaluation.',
      actions: [['Voir mon suivi', 'plan'], ['Préparer mon rendez-vous', 'documents'], ['Revoir mes résultats', 'results']]
    },
    documents: {
      kicker: 'VOTRE PROCHAINE ÉTAPE',
      title: 'Préparer votre rendez-vous simplement.',
      copy: 'Retrouvez votre préparation, vos documents et les informations utiles avant la prochaine consultation.',
      actions: [['Voir mon dossier', 'documents'], ['Voir mes résultats', 'results'], ['Retour à l’accueil', 'home']]
    }
  };

  const answers = [
    {
      test: /^(bonjour|bonsoir|salut|hello|hey|coucou)\b/,
      text: 'Bonjour. Je suis Komo Guide. Je peux vous aider à comprendre vos scores, retrouver votre bilan, suivre votre trajectoire ou préparer votre prochaine étape.'
    },
    {
      test: /\b(motion score|score|scores|note|100)\b/,
      text: 'Le Motion Score synthétise plusieurs dimensions de votre mobilité. Il sert surtout de repère dans le temps : la valeur publiée dans votre bilan et son évolution comptent davantage qu’une comparaison isolée.',
      route: 'results',
      routeLabel: 'Voir mes scores'
    },
    {
      test: /\b(motion age|age locomoteur|age de mouvement|age fonctionnel)\b/,
      text: 'Le Motion Age est un indicateur de lecture de votre profil de mobilité. Il ne remplace pas votre âge biologique ni un diagnostic médical. Utilisez-le surtout pour suivre votre évolution entre deux bilans.',
      route: 'results',
      routeLabel: 'Voir mon bilan'
    },
    {
      test: /\b(bilan|resultat|resultats|analyse|rapport|pdf)\b/,
      text: 'Vos résultats de référence sont ceux publiés dans Pulse après votre bilan. Je peux vous y conduire directement ; je n’invente ni ne recalcule de résultat.',
      route: 'results',
      routeLabel: 'Ouvrir mes résultats'
    },
    {
      test: /\b(trajectoire|evolution|progres|progression|compare|comparaison)\b/,
      text: 'La trajectoire sert à comparer vos mesures publiées dans le temps. Elle permet de voir la tendance plutôt qu’un chiffre isolé.',
      route: 'path',
      routeLabel: 'Voir ma trajectoire'
    },
    {
      test: /\b(suivi|plan|priorite|priorites|recommandation|recommandations|exercice|exercices)\b/,
      text: 'Pour le suivi, Pulse affiche les priorités qui ont été validées pour vous. Komo Guide ne crée pas de prescription ou de programme médical personnalisé.',
      route: 'plan',
      routeLabel: 'Voir mon suivi'
    },
    {
      test: /\b(rendez-vous|rendez vous|rdv|consultation|preparer|preparation|document|documents|dossier)\b/,
      text: 'Pour préparer la prochaine étape, vérifiez votre dossier, vos documents disponibles et les consignes affichées dans Pulse avant le rendez-vous.',
      route: 'documents',
      routeLabel: 'Préparer la suite'
    },
    {
      test: /\b(medecin|professionnel|pro|clinique|clinical|operateur|expert)\b/,
      text: 'Si votre question nécessite une interprétation clinique ou une décision médicale, elle doit être reprise avec un professionnel de santé. Komo Guide reste un guide de lecture et de navigation dans Pulse.'
    },
    {
      test: /\b(douleur|urgent|urgence|malaise|paralys|faiblesse brutale|essoufflement|douleur thoracique)\b/,
      text: 'Komo Guide ne peut pas évaluer une urgence ni poser de diagnostic. En cas de symptôme important, brutal ou inquiétant, contactez rapidement un professionnel de santé ou les services d’urgence adaptés à votre situation.'
    },
    {
      test: /\b(aide|menu|peux tu|que peux tu|comment ca marche|guide)\b/,
      text: 'Je peux : expliquer le rôle de vos scores, vous conduire à vos résultats, montrer votre trajectoire, retrouver votre suivi et préparer votre prochaine étape. Je fonctionne ici sans IA générative et sans appel externe.'
    }
  ];

  function answerLocal(message) {
    const input = normalize(message);
    if (!input) return { text: 'Écrivez une question sur votre bilan, vos scores, votre trajectoire ou votre prochaine étape.' };
    const match = answers.find(item => item.test.test(input));
    if (match) return { text: match.text, route: match.route || null, routeLabel: match.routeLabel || null };
    return {
      text: 'Je peux vous aider sur quatre sujets : vos scores, votre bilan, votre trajectoire et la préparation de la prochaine étape. Pour une interprétation clinique personnalisée, adressez-vous à votre professionnel de santé.'
    };
  }

  function go(target) {
    if (window.KomoPatientNavigation?.go) window.KomoPatientNavigation.go(target);
    else location.hash = target;
    closePanel();
  }

  function closePanel() {
    const panel = document.querySelector('#komoPatientGuidePanel');
    if (panel) panel.hidden = true;
    document.querySelector('#komoPatientGuideLauncher')?.setAttribute('aria-expanded', 'false');
  }

  function panel() {
    let node = document.querySelector('#komoPatientGuidePanel');
    if (node) return node;
    node = document.createElement('aside');
    node.id = 'komoPatientGuidePanel';
    node.hidden = true;
    node.setAttribute('aria-label', 'Komo, votre guide Pulse');
    document.body.appendChild(node);
    node.addEventListener('click', event => {
      const button = event.target.closest('[data-kpg-route]');
      if (button) go(button.dataset.kpgRoute);
      if (event.target.closest('[data-kpg-close]')) closePanel();
    });
    node.addEventListener('submit', event => {
      const form = event.target.closest('[data-kpg-form]');
      if (!form) return;
      event.preventDefault();
      const input = form.querySelector('[data-kpg-input]');
      const value = input?.value || '';
      renderAnswer(answerLocal(value));
      if (input) {
        input.value = '';
        input.focus();
      }
    });
    return node;
  }

  function renderAnswer(answer) {
    const output = document.querySelector('#komoPatientGuideAnswer');
    if (!output) return;
    output.replaceChildren();
    const paragraph = document.createElement('p');
    paragraph.textContent = answer.text;
    output.appendChild(paragraph);
    if (answer.route) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.kpgRoute = answer.route;
      button.innerHTML = `<span>${answer.routeLabel || 'Ouvrir'}</span><b>→</b>`;
      output.appendChild(button);
    }
  }

  function renderPanel() {
    const node = panel();
    const ctx = contexts[route()] || contexts.home;
    node.innerHTML = `<div class="kpg-panel-head"><div class="kpg-panel-brand"><span class="kpg-eyes" aria-hidden="true">ōø</span><div><small>Komo · votre guide</small><strong>Pulse en clair</strong></div></div><button class="kpg-close" type="button" data-kpg-close aria-label="Fermer">×</button></div><div class="kpg-panel-body"><span>${ctx.kicker}</span><h3>${ctx.title}</h3><p>${ctx.copy}</p><div class="kpg-actions">${ctx.actions.map(([label, target]) => `<button type="button" data-kpg-route="${target}"><span>${label}</span><b>→</b></button>`).join('')}</div><form class="kpg-ask" data-kpg-form autocomplete="off"><label for="komoPatientGuideInput">Une question ?</label><div class="kpg-ask-row"><input id="komoPatientGuideInput" data-kpg-input type="text" maxlength="240" placeholder="Ex. À quoi sert mon Motion Score ?" aria-describedby="komoPatientGuidePrivacy"><button type="submit">Envoyer</button></div></form><div id="komoPatientGuideAnswer" class="kpg-answer" aria-live="polite"></div><p id="komoPatientGuidePrivacy" class="kpg-note">Guide local · aucune IA générative · aucun appel OpenAI. Les résultats médicaux restent ceux validés pour restitution.</p></div>`;
    node.hidden = false;
    document.querySelector('#komoPatientGuideLauncher')?.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => node.querySelector('[data-kpg-input]')?.focus());
  }

  function openGuide() {
    closePanel();
    renderPanel();
  }

  function ensureLauncher() {
    if (!isPatient()) {
      document.body.classList.remove('komo-patient-guide-active');
      document.querySelector('#komoPatientGuideLauncher')?.remove();
      closePanel();
      return;
    }
    const app = document.querySelector('#appShell');
    if (!app || app.hidden) return;
    document.body.classList.add('komo-patient-guide-active');
    let button = document.querySelector('#komoPatientGuideLauncher');
    if (!button) {
      button = document.createElement('button');
      button.id = 'komoPatientGuideLauncher';
      button.type = 'button';
      button.setAttribute('aria-label', 'Ouvrir Komo, votre guide Pulse');
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = '<span class="kpg-eyes" aria-hidden="true">ōø</span><span class="kpg-copy"><strong>Komo</strong><small>Vous guide</small></span><i class="kpg-dot" aria-hidden="true"></i>';
      button.addEventListener('click', openGuide);
      app.appendChild(button);
    }
  }

  function refresh() {
    ensureLauncher();
    if (!isPatient()) return;
    const currentPanel = document.querySelector('#komoPatientGuidePanel');
    if (currentPanel && !currentPanel.hidden) renderPanel();
  }

  function mount() {
    if (observer) return;
    observer = new MutationObserver(() => requestAnimationFrame(ensureLauncher));
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'class'] });
    ensureLauncher();
  }

  ['hashchange', 'pageshow', 'komo:route-ready', 'komo:session-ready', 'komo:session-cleared'].forEach(name => window.addEventListener(name, refresh));
  document.addEventListener('click', event => {
    const currentPanel = document.querySelector('#komoPatientGuidePanel');
    const launcher = document.querySelector('#komoPatientGuideLauncher');
    if (currentPanel && !currentPanel.hidden && !currentPanel.contains(event.target) && !launcher?.contains(event.target)) closePanel();
  }, true);
  document.addEventListener('DOMContentLoaded', mount);
  if (document.readyState !== 'loading') mount();

  window.KomoPatientGuide = {
    version: VERSION,
    open: openGuide,
    refresh,
    askLocal: answerLocal,
    mode: 'deterministic-zero-token'
  };
})();

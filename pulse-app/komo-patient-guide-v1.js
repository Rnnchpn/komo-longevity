/* Komo — patient guide V1 · deterministic / zero-token */
(() => {
  'use strict';

  const VERSION = '1.1.2-zero-token';
  const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const route = () => window.KomoPatientNavigation?.route?.() || location.hash.replace(/^#/, '') || 'home';
  const role = () => window.KomoRuntime?.role || window.KomoRuntime?.getContext?.()?.role || 'member';

  const isPatient = () => {
    const currentRoute = normalize(route());
    const currentRole = normalize(role());
    if (['clinical', 'admin', 'founder', 'run'].includes(currentRoute)) return false;
    if (['clinical', 'admin', 'founder', 'pro', 'professional', 'operator'].includes(currentRole)) return false;
    return !document.querySelector('#modeSwitch [data-mode="clinical"]')?.classList.contains('active');
  };

  const contexts = {
    home: ['AUJOURD’HUI', 'Je vous aide à aller à l’essentiel.', 'Posez une question simple sur votre bilan, vos scores ou la prochaine étape. Komo Guide répond localement, sans IA générative.', [['Voir mon bilan', 'results'], ['Voir ma trajectoire', 'path'], ['Préparer la suite', 'documents']]],
    results: ['VOTRE BILAN', 'Comprendre ce que votre bilan a montré.', 'Je peux vous expliquer le rôle des scores et vous ramener aux résultats réellement publiés dans Pulse.', [['Lire mes résultats', 'results'], ['Voir mon évolution', 'path'], ['Préparer la prochaine étape', 'documents']]],
    path: ['VOTRE TRAJECTOIRE', 'Voir si votre mobilité évolue.', 'Comparez uniquement vos références réellement publiées et retrouvez ce qui a changé dans le temps.', [['Voir ma trajectoire', 'path'], ['Revoir mon bilan', 'results'], ['Voir mon suivi', 'plan']]],
    trajectory: ['VOTRE TRAJECTOIRE', 'Voir si votre mobilité évolue.', 'Comparez uniquement vos références réellement publiées et retrouvez ce qui a changé dans le temps.', [['Voir ma trajectoire', 'trajectory'], ['Revoir mon bilan', 'results'], ['Voir mon suivi', 'plan']]],
    plan: ['VOTRE SUIVI', 'Savoir quoi faire maintenant.', 'Retrouvez vos priorités validées et ce qui compte jusqu’à votre prochaine réévaluation.', [['Voir mon suivi', 'plan'], ['Préparer mon rendez-vous', 'documents'], ['Revoir mes résultats', 'results']]],
    documents: ['VOTRE PROCHAINE ÉTAPE', 'Préparer votre rendez-vous simplement.', 'Retrouvez votre préparation, vos documents et les informations utiles avant la prochaine consultation.', [['Voir mon dossier', 'documents'], ['Voir mes résultats', 'results'], ['Retour à l’accueil', 'home']]]
  };

  const answers = [
    [/^(bonjour|bonsoir|salut|hello|hey|coucou)\b/, 'Bonjour. Je suis Komo Guide. Je peux vous aider à comprendre vos scores, retrouver votre bilan, suivre votre trajectoire ou préparer votre prochaine étape.'],
    [/\b(motion score|score|scores|note|100)\b/, 'Le Motion Score synthétise plusieurs dimensions de votre mobilité. Il sert surtout de repère dans le temps : la valeur publiée dans votre bilan et son évolution comptent davantage qu’une comparaison isolée.', 'results', 'Voir mes scores'],
    [/\b(motion age|age locomoteur|age de mouvement|age fonctionnel)\b/, 'Le Motion Age est un indicateur de lecture de votre profil de mobilité. Il ne remplace pas votre âge biologique ni un diagnostic médical. Utilisez-le surtout pour suivre votre évolution entre deux bilans.', 'results', 'Voir mon bilan'],
    [/\b(bilan|resultat|resultats|analyse|rapport|pdf)\b/, 'Vos résultats de référence sont ceux publiés dans Pulse après votre bilan. Je peux vous y conduire directement ; je n’invente ni ne recalcule de résultat.', 'results', 'Ouvrir mes résultats'],
    [/\b(trajectoire|evolution|progres|progression|compare|comparaison)\b/, 'La trajectoire sert à comparer vos mesures publiées dans le temps. Elle permet de voir la tendance plutôt qu’un chiffre isolé.', 'trajectory', 'Voir ma trajectoire'],
    [/\b(suivi|plan|priorite|priorites|recommandation|recommandations|exercice|exercices)\b/, 'Pour le suivi, Pulse affiche les priorités qui ont été validées pour vous. Komo Guide ne crée pas de prescription ou de programme médical personnalisé.', 'plan', 'Voir mon suivi'],
    [/\b(rendez-vous|rendez vous|rdv|consultation|preparer|preparation|document|documents|dossier)\b/, 'Pour préparer la prochaine étape, vérifiez votre dossier, vos documents disponibles et les consignes affichées dans Pulse avant le rendez-vous.', 'documents', 'Préparer la suite'],
    [/\b(medecin|professionnel|pro|clinique|clinical|operateur|expert)\b/, 'Si votre question nécessite une interprétation clinique ou une décision médicale, elle doit être reprise avec un professionnel de santé. Komo Guide reste un guide de lecture et de navigation dans Pulse.'],
    [/\b(douleur|urgent|urgence|malaise|paralys|faiblesse brutale|essoufflement|douleur thoracique)\b/, 'Komo Guide ne peut pas évaluer une urgence ni poser de diagnostic. En cas de symptôme important, brutal ou inquiétant, contactez rapidement un professionnel de santé ou les services d’urgence adaptés à votre situation.'],
    [/\b(aide|menu|peux tu|que peux tu|comment ca marche|guide)\b/, 'Je peux : expliquer le rôle de vos scores, vous conduire à vos résultats, montrer votre trajectoire, retrouver votre suivi et préparer votre prochaine étape. Je fonctionne ici sans IA générative et sans appel externe.']
  ];

  function answerLocal(message) {
    const input = normalize(message);
    if (!input) return { text: 'Écrivez une question sur votre bilan, vos scores, votre trajectoire ou votre prochaine étape.' };
    const match = answers.find(([test]) => test.test(input));
    if (!match) return { text: 'Je peux vous aider sur quatre sujets : vos scores, votre bilan, votre trajectoire et la préparation de la prochaine étape. Pour une interprétation clinique personnalisée, adressez-vous à votre professionnel de santé.' };
    return { text: match[1], route: match[2] || null, routeLabel: match[3] || null };
  }

  function closePanel() {
    const panel = document.querySelector('#komoPatientGuidePanel');
    if (panel) panel.hidden = true;
    document.querySelector('#komoPatientGuideLauncher')?.setAttribute('aria-expanded', 'false');
  }

  function go(target) {
    if (window.KomoPatientNavigation?.go) window.KomoPatientNavigation.go(target);
    else document.querySelector(`[data-route="${target}"], a[href="#${target}"]`)?.click();
    closePanel();
  }

  function ensurePanel() {
    let node = document.querySelector('#komoPatientGuidePanel');
    if (node) return node;
    node = document.createElement('aside');
    node.id = 'komoPatientGuidePanel';
    node.hidden = true;
    node.setAttribute('aria-label', 'Komo, votre guide Pulse');
    document.body.appendChild(node);
    node.addEventListener('click', event => {
      const routeButton = event.target.closest('[data-kpg-route]');
      if (routeButton) go(routeButton.dataset.kpgRoute);
      if (event.target.closest('[data-kpg-close]')) closePanel();
    });
    node.addEventListener('submit', event => {
      const form = event.target.closest('[data-kpg-form]');
      if (!form) return;
      event.preventDefault();
      const input = form.querySelector('[data-kpg-input]');
      renderAnswer(answerLocal(input?.value || ''));
      if (input) { input.value = ''; input.focus(); }
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
    if (!answer.route) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.kpgRoute = answer.route;
    button.innerHTML = `<span>${answer.routeLabel || 'Ouvrir'}</span><b>→</b>`;
    output.appendChild(button);
  }

  function renderPanel() {
    const node = ensurePanel();
    const [kicker, title, copy, actions] = contexts[route()] || contexts.home;
    node.innerHTML = `<div class="kpg-panel-head"><div class="kpg-panel-brand"><span class="kpg-eyes" aria-hidden="true">ōø</span><div><small>Komo · votre guide</small><strong>Pulse en clair</strong></div></div><button class="kpg-close" type="button" data-kpg-close aria-label="Fermer">×</button></div><div class="kpg-panel-body"><span>${kicker}</span><h3>${title}</h3><p>${copy}</p><div class="kpg-actions">${actions.map(([label, target]) => `<button type="button" data-kpg-route="${target}"><span>${label}</span><b>→</b></button>`).join('')}</div><form class="kpg-ask" data-kpg-form autocomplete="off"><label for="komoPatientGuideInput">Une question ?</label><div class="kpg-ask-row"><input id="komoPatientGuideInput" data-kpg-input type="text" maxlength="240" placeholder="Ex. À quoi sert mon Motion Score ?" aria-describedby="komoPatientGuidePrivacy"><button type="submit">Envoyer</button></div></form><div id="komoPatientGuideAnswer" class="kpg-answer" aria-live="polite"></div><p id="komoPatientGuidePrivacy" class="kpg-note">Guide local · aucune IA générative · aucun appel OpenAI. Les résultats médicaux restent ceux validés pour restitution.</p></div>`;
    node.hidden = false;
    document.querySelector('#komoPatientGuideLauncher')?.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => node.querySelector('[data-kpg-input]')?.focus());
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
    if (document.querySelector('#komoPatientGuideLauncher')) return;
    const button = document.createElement('button');
    button.id = 'komoPatientGuideLauncher';
    button.type = 'button';
    button.setAttribute('aria-label', 'Ouvrir Komo, votre guide Pulse');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="kpg-eyes" aria-hidden="true">ōø</span><span class="kpg-copy"><strong>Komo</strong><small>Vous guide</small></span><i class="kpg-dot" aria-hidden="true"></i>';
    button.addEventListener('click', renderPanel);
    app.appendChild(button);
  }

  function refresh() {
    ensureLauncher();
    const currentPanel = document.querySelector('#komoPatientGuidePanel');
    if (isPatient() && currentPanel && !currentPanel.hidden) renderPanel();
  }

  ['hashchange', 'pageshow', 'komo:route-ready', 'komo:session-ready', 'komo:session-cleared'].forEach(name => window.addEventListener(name, refresh));
  document.addEventListener('click', event => {
    const currentPanel = document.querySelector('#komoPatientGuidePanel');
    const launcher = document.querySelector('#komoPatientGuideLauncher');
    if (currentPanel && !currentPanel.hidden && !currentPanel.contains(event.target) && !launcher?.contains(event.target)) closePanel();
  }, true);
  document.addEventListener('DOMContentLoaded', ensureLauncher);
  if (document.readyState !== 'loading') ensureLauncher();

  window.KomoPatientGuide = { version: VERSION, open: renderPanel, refresh, askLocal: answerLocal, mode: 'deterministic-zero-token' };
})();

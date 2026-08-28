/* KŌMØ Pulse — Motion tests entry v1
   Makes the patient Motion entry start the actual self-assessment tests first.
   The full instrumented Motion appointment remains a separate secondary action. */
(() => {
  const FREE_KEYS = ['baseline', 'chair_stand', 'two_step'];
  let timer = null;
  let opening = false;

  function route() {
    return location.hash.replace(/^#/, '') || 'home';
  }

  function memberMode() {
    document.querySelector('#modeSwitch button[data-mode="member"]')?.click();
  }

  function bookFullMotion() {
    memberMode();
    if (window.KomoPatientMotionBooking?.open) {
      window.KomoPatientMotionBooking.open();
      return;
    }
    location.hash = 'documents';
  }

  function freeCards(root) {
    return FREE_KEYS.map(key => root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card')).filter(Boolean);
  }

  function openNextTestWhenReady(attempt = 0) {
    if (!opening) return;
    if (route() !== 'results') {
      location.hash = 'results';
      setTimeout(() => openNextTestWhenReady(attempt + 1), 100);
      return;
    }

    const root = document.querySelector('.tests-v1-root');
    if (!root) {
      if (attempt < 120) setTimeout(() => openNextTestWhenReady(attempt + 1), 100);
      else opening = false;
      return;
    }

    const cards = freeCards(root);
    if (cards.length < FREE_KEYS.length) {
      if (attempt < 120) setTimeout(() => openNextTestWhenReady(attempt + 1), 100);
      else opening = false;
      return;
    }

    const done = cards.filter(card => card.classList.contains('is-done')).length;
    if (done >= FREE_KEYS.length) {
      opening = false;
      root.querySelector('[data-pulse-free-result]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const nextKey = FREE_KEYS.find(key => {
      const card = root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card');
      return card && !card.classList.contains('is-done');
    });
    const button = nextKey ? root.querySelector(`[data-open-test="${nextKey}"]`) : null;
    if (button) {
      opening = false;
      button.click();
      return;
    }

    if (attempt < 120) setTimeout(() => openNextTestWhenReady(attempt + 1), 100);
    else opening = false;
  }

  function startOrResumeTests() {
    memberMode();
    opening = true;
    if (route() !== 'results') location.hash = 'results';
    setTimeout(() => openNextTestWhenReady(0), 80);
  }

  function patchStep(card, index, title, copy, meta) {
    if (!card) return;
    const num = card.querySelector('.kmotion-step-num');
    const strong = card.querySelector('strong');
    const p = card.querySelector('p');
    const small = card.querySelector('small');
    if (num) num.textContent = index;
    if (strong) strong.textContent = title;
    if (p) p.textContent = copy;
    if (small) small.textContent = meta;
  }

  function patchHub() {
    if (route() !== 'motion') return;
    const hub = document.querySelector('[data-komo-motion-hub]');
    if (!hub) return;

    hub.dataset.motionTestsEntry = '1';

    const eyebrow = hub.querySelector('.kmotion-eyebrow');
    const title = hub.querySelector('.kmotion-copy h2');
    const intro = hub.querySelector('.kmotion-copy > p:not(.kmotion-eyebrow)');
    if (eyebrow) eyebrow.textContent = 'KŌMØ MOTION · COMMENCEZ ICI';
    if (title) title.innerHTML = 'Réalisez vos tests.<br>Maintenant.<span>Aucun rendez-vous n’est nécessaire pour commencer les premières étapes dans Pulse.</span>';
    if (intro) intro.textContent = 'Commencez par le questionnaire KŌMØ, puis réalisez le Chair Stand et le Two-Step. Pulse vous ouvre automatiquement la prochaine étape non terminée.';

    const primary = hub.querySelector('.kmotion-hero .kmotion-primary');
    if (primary) primary.textContent = 'Réaliser / reprendre mes tests →';

    const secondary = hub.querySelector('.kmotion-hero .kmotion-secondary');
    if (secondary) {
      secondary.removeAttribute('data-kmotion-results');
      secondary.setAttribute('data-kmotion-book', '1');
      secondary.textContent = 'Réserver Motion complet';
    }

    const quick = hub.querySelector('.kmotion-quick');
    if (quick) {
      const label = quick.querySelector(':scope > span');
      const strong = quick.querySelector('strong');
      const copy = quick.querySelector('p');
      const button = quick.querySelector('button');
      if (label) label.textContent = 'ACCÈS DIRECT AUX TESTS';
      if (strong) strong.textContent = 'Pulse ouvre votre prochaine étape.';
      if (copy) copy.textContent = 'Questionnaire, Chair Stand ou Two-Step : un clic suffit pour reprendre exactement là où vous en êtes.';
      if (button) button.textContent = 'Continuer mes tests →';
    }

    const sectionHead = hub.querySelector('.kmotion-section-head');
    if (sectionHead) {
      const h3 = sectionHead.querySelector('h3');
      const p = sectionHead.querySelector('p');
      const button = sectionHead.querySelector('button');
      if (h3) h3.textContent = 'Votre première évaluation dans Pulse.';
      if (p) p.textContent = 'Trois étapes réalisables directement depuis votre téléphone ou ordinateur.';
      if (button) button.textContent = 'Commencer maintenant →';
    }

    const steps = [...hub.querySelectorAll('.kmotion-step')];
    patchStep(steps[0], '01', 'Questionnaire KŌMØ', '25 questions sur votre mobilité, vos limitations et votre contexte fonctionnel.', '5–7 min · dans Pulse');
    patchStep(steps[1], '02', 'Chair Stand', 'Installez une chaise stable. Pulse vous guide pour le test de lever de chaise de 30 secondes.', '30 s · chaise stable');
    patchStep(steps[2], '03', 'Two-Step', 'Faites deux grands pas contrôlés puis renseignez la distance mesurée.', '2 pas · mètre ruban');
    patchStep(steps[3], '04', 'Premier résultat', 'Une fois les trois étapes terminées, Pulse affiche votre premier repère fonctionnel.', 'Pulse Free · immédiatement');

    const access = hub.querySelector('.kmotion-access');
    if (access) {
      const h3 = access.querySelector('h3');
      const p = access.querySelector('p');
      const button = access.querySelector('button');
      if (h3) h3.textContent = 'Puis : KŌMØ Motion complet en centre.';
      if (p) p.textContent = 'Pour aller plus loin, réservez l’acquisition instrumentée avec Myodev et l’évaluation réalisée avec un professionnel.';
      if (button) {
        button.removeAttribute('data-kmotion-start');
        button.setAttribute('data-kmotion-book', '1');
        button.textContent = 'Réserver mon Motion complet →';
      }
    }
  }

  function schedule(delay = 30) {
    clearTimeout(timer);
    timer = setTimeout(patchHub, delay);
  }

  document.addEventListener('click', event => {
    const book = event.target.closest?.('[data-kmotion-book]');
    if (book) {
      event.preventDefault();
      event.stopImmediatePropagation();
      bookFullMotion();
      return;
    }

    const start = event.target.closest?.('[data-kmotion-start]');
    if (start) {
      event.preventDefault();
      event.stopImmediatePropagation();
      startOrResumeTests();
    }
  }, true);

  window.addEventListener('hashchange', () => schedule(50));
  window.addEventListener('komo:route-ready', () => schedule(50));
  window.addEventListener('komo:data-ready', () => schedule(50));
  document.addEventListener('DOMContentLoaded', () => schedule(250));

  const observer = new MutationObserver(() => {
    if (route() === 'motion') schedule(20);
  });
  observer.observe(document.body, { subtree: true, childList: true });

  setTimeout(() => schedule(0), 650);
  window.KomoMotionTestsEntry = { start: startOrResumeTests, book: bookFullMotion, version: '1.0.0' };
})();

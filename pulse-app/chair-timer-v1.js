(() => {
  const DURATION = 30;
  let intervalId = null;
  let completed = false;
  let deadline = 0;

  function clearTimer() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    deadline = 0;
  }

  function format(seconds) {
    return `00:${String(Math.max(0, seconds)).padStart(2, '0')}`;
  }

  function nodes(form) {
    return {
      value: form.querySelector('[data-chair-timer-value]'),
      status: form.querySelector('[data-chair-timer-status]'),
      start: form.querySelector('[data-chair-timer-start]'),
      reset: form.querySelector('[data-chair-timer-reset]'),
      submit: form.querySelector('button[type="submit"]'),
      reps: form.querySelector('input[name="repetitions"]')
    };
  }

  function setReady(form) {
    clearTimer();
    completed = false;
    const n = nodes(form);
    if (n.value) n.value.textContent = format(DURATION);
    if (n.status) n.status.textContent = 'Installez-vous, puis lancez le minuteur lorsque vous êtes prêt.';
    if (n.start) { n.start.disabled = false; n.start.textContent = 'Démarrer 30 s'; }
    if (n.reset) n.reset.hidden = true;
    if (n.submit) n.submit.disabled = true;
    form.dataset.chairTimerState = 'ready';
  }

  function finish(form) {
    clearTimer();
    completed = true;
    const n = nodes(form);
    if (n.value) n.value.textContent = '00:00';
    if (n.status) n.status.textContent = 'Temps écoulé — indiquez maintenant votre nombre de levers complets.';
    if (n.start) { n.start.disabled = true; n.start.textContent = 'Terminé'; }
    if (n.reset) n.reset.hidden = false;
    if (n.submit) n.submit.disabled = false;
    form.dataset.chairTimerState = 'complete';
    try { navigator.vibrate?.([120, 70, 120]); } catch {}
    n.reps?.focus();
  }

  function tick(form) {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    const n = nodes(form);
    if (n.value) n.value.textContent = format(remaining);
    if (n.status) n.status.textContent = remaining > 0 ? 'Levez-vous et rasseyez-vous complètement. Comptez chaque répétition.' : 'Temps écoulé.';
    if (remaining <= 0) finish(form);
  }

  function start(form) {
    clearTimer();
    completed = false;
    deadline = Date.now() + DURATION * 1000;
    const n = nodes(form);
    if (n.start) { n.start.disabled = true; n.start.textContent = 'Test en cours…'; }
    if (n.reset) n.reset.hidden = true;
    if (n.submit) n.submit.disabled = true;
    form.dataset.chairTimerState = 'running';
    tick(form);
    intervalId = setInterval(() => tick(form), 200);
  }

  function mount() {
    const form = document.querySelector('#chairStandForm');
    if (!form || form.dataset.chairTimerMounted === '1') return;
    form.dataset.chairTimerMounted = '1';
    const consent = form.querySelector('.test-consent');
    const box = document.createElement('section');
    box.className = 'chair-timer-v1';
    box.setAttribute('aria-label', 'Minuteur Chair Stand 30 secondes');
    box.innerHTML = `
      <div class="chair-timer-copy">
        <span>MINUTEUR · 30 SECONDES</span>
        <strong data-chair-timer-value>00:30</strong>
        <p data-chair-timer-status>Installez-vous, puis lancez le minuteur lorsque vous êtes prêt.</p>
      </div>
      <div class="chair-timer-actions">
        <button type="button" class="primary-button" data-chair-timer-start>Démarrer 30 s</button>
        <button type="button" class="secondary-button" data-chair-timer-reset hidden>Recommencer</button>
      </div>`;
    consent?.insertAdjacentElement('afterend', box);
    box.querySelector('[data-chair-timer-start]')?.addEventListener('click', () => start(form));
    box.querySelector('[data-chair-timer-reset]')?.addEventListener('click', () => setReady(form));
    setReady(form);
  }

  document.addEventListener('click', event => {
    if (event.target.closest?.('[data-open-test="chair_stand"]')) setTimeout(mount, 0);
    if (event.target.closest?.('[data-close-test]')) clearTimer();
  }, true);

  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'chairStandForm') return;
    if (completed || form.dataset.chairTimerState === 'complete') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const feedback = form.querySelector('#testFormFeedback');
    if (feedback) feedback.textContent = 'Lancez et terminez d’abord le minuteur de 30 secondes.';
  }, true);

  window.addEventListener('komo:route-ready', clearTimer);
  window.addEventListener('hashchange', clearTimer);
})();

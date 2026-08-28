/* KŌMØ Pulse — Motion entry v1
   Makes the canonical Motion booking/preparation flow visible from the patient home and shell.
   The actual booking/workflow remains owned by #documents / booking-layer-v1. */
(() => {
  let timer = null;

  function route() {
    return location.hash.replace(/^#/, '') || 'home';
  }

  function isMemberMode() {
    const member = document.querySelector('#modeSwitch button[data-mode="member"]');
    return !member || member.classList.contains('active');
  }

  function openMotion() {
    document.querySelector('#modeSwitch button[data-mode="member"]')?.click();
    if (location.hash !== '#documents') location.hash = 'documents';
  }

  function ensureStyles() {
    if (document.querySelector('#komoMotionEntryStyle')) return;
    const style = document.createElement('style');
    style.id = 'komoMotionEntryStyle';
    style.textContent = `
      .komo-motion-entry-top{min-height:42px;padding:0 15px;border:1px solid rgba(21,21,18,.12);border-radius:14px;background:#26342b;color:#fff;display:inline-flex;align-items:center;gap:9px;cursor:pointer;font-size:11px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;box-shadow:0 8px 24px rgba(38,52,43,.10)}
      .komo-motion-entry-top:before{content:"";width:7px;height:7px;border-radius:50%;background:#b9c8b7;box-shadow:0 0 0 4px rgba(185,200,183,.13)}
      .komo-motion-entry-home{min-height:48px;padding:0 20px;border:1px solid #26342b;border-radius:14px;background:#26342b;color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:14px;cursor:pointer;font:inherit;font-size:13px;font-weight:600}
      .komo-motion-entry-home span:last-child{font-size:16px}
      .nav-item[data-route="documents"] span{line-height:1.05;text-align:center}
      @media(max-width:760px){.komo-motion-entry-top{min-height:38px;padding:0 11px;font-size:10px}.komo-motion-entry-top:before{display:none}.topbar-actions{gap:7px}}
      @media(max-width:460px){.komo-motion-entry-top{padding:0 9px}.komo-motion-entry-top .komo-motion-long{display:none}.komo-motion-entry-top .komo-motion-short{display:inline}}
      @media(min-width:461px){.komo-motion-entry-top .komo-motion-short{display:none}}
    `;
    document.head.appendChild(style);
  }

  function patchNavigation() {
    if (!isMemberMode()) return;
    document.querySelectorAll('.nav-item[data-route="documents"] span').forEach(span => {
      if (span.textContent !== 'Bilan Motion') span.textContent = 'Bilan Motion';
    });
  }

  function patchTopbar() {
    const actions = document.querySelector('.topbar-actions');
    if (!actions) return;
    let button = actions.querySelector('[data-komo-motion-entry-top]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'komo-motion-entry-top';
      button.dataset.komoMotionEntryTop = '1';
      button.innerHTML = '<span class="komo-motion-long">Bilan Motion</span><span class="komo-motion-short">Motion</span><span aria-hidden="true">→</span>';
      button.addEventListener('click', openMotion);
      actions.insertBefore(button, actions.firstChild);
    }
    button.hidden = !isMemberMode();
  }

  function patchHome() {
    if (route() !== 'home' || !isMemberMode()) return;
    const actions = document.querySelector('#viewRoot .hero-actions');
    if (!actions) return;

    const legacy = actions.querySelector('a.primary-button[href*="/fr/bilan/"], a.primary-button[href*="/bilan/"]');
    if (legacy) {
      legacy.removeAttribute('href');
      legacy.removeAttribute('target');
      legacy.removeAttribute('rel');
      legacy.setAttribute('role', 'button');
      legacy.setAttribute('tabindex', '0');
      legacy.dataset.komoMotionEntryHome = '1';
      legacy.innerHTML = '<span>Débuter mon bilan Motion</span><span aria-hidden="true">→</span>';
      legacy.addEventListener('click', openMotion, { once: true });
      legacy.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openMotion();
        }
      }, { once: true });
      return;
    }

    if (actions.querySelector('[data-komo-motion-entry-home]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'komo-motion-entry-home';
    button.dataset.komoMotionEntryHome = '1';
    button.innerHTML = '<span>Débuter / reprendre mon bilan Motion</span><span aria-hidden="true">→</span>';
    button.addEventListener('click', openMotion);
    actions.prepend(button);
  }

  function mount() {
    ensureStyles();
    patchNavigation();
    patchTopbar();
    patchHome();
  }

  function schedule(delay = 40) {
    clearTimeout(timer);
    timer = setTimeout(mount, delay);
  }

  document.addEventListener('DOMContentLoaded', () => schedule(180));
  ['hashchange', 'pageshow', 'komo:route-ready', 'komo:data-ready', 'komo:session-ready'].forEach(name => {
    window.addEventListener(name, () => schedule());
  });

  const observer = new MutationObserver(() => schedule(25));
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => schedule(), 650);

  window.KomoMotionEntry = { open: openMotion, version: '1.0.0' };
})();

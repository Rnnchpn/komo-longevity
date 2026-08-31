/* KŌMØ Pulse — launch authentication polish */
(() => {
  'use strict';

  function ensureOperator() {
    if (!document.querySelector('link[data-komo-operator-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './komo-operator-v1.css?v=20260831-v1';
      link.dataset.komoOperatorCss = '1';
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-komo-operator-js]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = './komo-operator-v1.js?v=20260831-v1';
      script.dataset.komoOperatorJs = '1';
      document.body.appendChild(script);
    }
    if (!document.querySelector('script[data-komo-operator-session]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = './komo-operator-session-v1.js?v=20260831-v1';
      script.dataset.komoOperatorSession = '1';
      document.body.appendChild(script);
    }
  }

  function mount() {
    const auth = document.querySelector('#authScreen');
    if (!auth) return;

    /* Remove the previous decorative “live signal” layer. */
    auth.querySelectorAll('[data-auth-signal]').forEach((node) => node.remove());

    const pill = auth.querySelector('.product-pill');
    if (pill) pill.textContent = 'KŌMØ PULSE';

    const panel = auth.querySelector('.auth-panel');
    if (panel && !panel.querySelector('[data-auth-security]')) {
      const row = document.createElement('div');
      row.className = 'auth-security-row';
      row.dataset.authSecurity = '1';
      row.innerHTML = '<span class="auth-security-dot" aria-hidden="true"></span><span>Accès privé · KŌMØ Pulse</span>';
      panel.appendChild(row);
    }

    auth.dataset.authPremiumV3 = '1';
    auth.classList.add('auth-launch-ready');
    ensureOperator();
  }

  document.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('pageshow', mount);
  setTimeout(mount, 250);
})();

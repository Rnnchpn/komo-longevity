/* KŌMØ Pulse — launch authentication polish */
(() => {
  'use strict';

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
  }

  document.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('pageshow', mount);
  setTimeout(mount, 250);
})();

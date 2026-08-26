(() => {
  const SUPABASE_URL = 'https://uqlolefsiktbznnymriy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
  const REMEMBER_KEY = 'komo_pulse_remember';
  const CONTEXT_KEYS = [
    'komo_clinical_patient',
    'komo_clinical_assessment',
    'komo_clinical_org',
    'komo_clinical_tab',
    'komo_pulse_pro_intent',
    'komo_clinical_patient',
    'komo_clinical_assessment'
  ];

  function parseAccessToken(raw) {
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      if (typeof value === 'string') return value;
      if (value?.access_token) return value.access_token;
      if (value?.currentSession?.access_token) return value.currentSession.access_token;
      if (value?.session?.access_token) return value.session.access_token;
      if (Array.isArray(value)) {
        for (const item of value) if (item?.access_token) return item.access_token;
      }
    } catch {}
    return null;
  }

  function authEntries() {
    const entries = [];
    for (const store of [localStorage, sessionStorage]) {
      for (let i = 0; i < store.length; i += 1) {
        const key = store.key(i) || '';
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          entries.push({ store, key, raw: store.getItem(key) });
        }
      }
    }
    return entries;
  }

  function clearLocalSession() {
    for (const { store, key } of authEntries()) {
      try { store.removeItem(key); } catch {}
    }
    for (const store of [localStorage, sessionStorage]) {
      for (const key of CONTEXT_KEYS) {
        try { store.removeItem(key); } catch {}
      }
    }
    try { localStorage.removeItem(REMEMBER_KEY); } catch {}
  }

  async function revokeServerSession(token) {
    if (!token) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`
        },
        signal: controller.signal,
        keepalive: true
      });
    } catch {} finally {
      clearTimeout(timeout);
    }
  }

  function redirectToLogin() {
    const base = `${location.origin}${location.pathname}`;
    location.replace(base);
  }

  let running = false;
  async function hardLogout(event) {
    const button = event.target?.closest?.('#logoutButton,[data-logout]');
    if (!button || running) return;
    running = true;
    event.preventDefault();
    event.stopImmediatePropagation();
    button.disabled = true;
    button.textContent = 'Déconnexion…';

    const entries = authEntries();
    const token = entries.map(entry => parseAccessToken(entry.raw)).find(Boolean) || null;

    // Logout must never depend on a network round-trip.
    clearLocalSession();

    // Attempt server revocation, but never block the user interface on it.
    Promise.race([
      revokeServerSession(token),
      new Promise(resolve => setTimeout(resolve, 1400))
    ]).finally(redirectToLogin);

    setTimeout(redirectToLogin, 1600);
  }

  document.addEventListener('click', hardLogout, true);
})();

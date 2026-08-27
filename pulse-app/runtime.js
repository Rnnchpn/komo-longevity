(() => {
  'use strict';

  const PROJECT_REF = 'uqlolefsiktbznnymriy';
  const LEGACY_AUTH_KEY = `sb-${PROJECT_REF}-auth-token`;
  const REMEMBER_KEY = 'komo_pulse_remember';
  const StorageProto = window.Storage?.prototype;
  const nativeGet = StorageProto?.getItem;
  const nativeSet = StorageProto?.setItem;
  const nativeRemove = StorageProto?.removeItem;

  // Preserve an existing persisted Pulse session before installing the dynamic
  // storage adapter. This keeps older sessions compatible with the standalone app.
  const existingRemember = nativeGet?.call(localStorage, REMEMBER_KEY);
  const existingLegacySession = nativeGet?.call(localStorage, LEGACY_AUTH_KEY);
  if (existingRemember === null && existingLegacySession) {
    nativeSet?.call(localStorage, REMEMBER_KEY, '1');
  }

  // Supabase clients are created by several Pulse modules. Some of those clients
  // are instantiated before the user changes "Rester connecté". A client that was
  // originally bound to sessionStorage must therefore keep seeing the same session
  // after the preference switches to localStorage (and vice versa). We route every
  // Supabase auth-token read/write through the *current* selected storage instead
  // of the storage object captured when the client was created.
  if (StorageProto && nativeGet && nativeSet && nativeRemove && !StorageProto.__komoAuthStorageV2) {
    const isAuthKey = (key) => /^sb-[a-z0-9]+-auth-token$/i.test(String(key || ''));
    const preferredStore = () => nativeGet.call(localStorage, REMEMBER_KEY) === '1' ? localStorage : sessionStorage;
    const fallbackStore = () => preferredStore() === localStorage ? sessionStorage : localStorage;

    Object.defineProperty(StorageProto, '__komoAuthStorageV2', { value: true, configurable: false });

    StorageProto.getItem = function(key) {
      if (!isAuthKey(key)) return nativeGet.call(this, key);
      const primary = preferredStore();
      let value = nativeGet.call(primary, key);
      if (value !== null) return value;
      const secondary = fallbackStore();
      value = nativeGet.call(secondary, key);
      if (value !== null) {
        try {
          nativeSet.call(primary, key, value);
          nativeRemove.call(secondary, key);
        } catch {}
      }
      return value;
    };

    StorageProto.setItem = function(key, value) {
      if (!isAuthKey(key)) return nativeSet.call(this, key, value);
      const primary = preferredStore();
      const secondary = primary === localStorage ? sessionStorage : localStorage;
      nativeSet.call(primary, key, value);
      try { nativeRemove.call(secondary, key); } catch {}
    };

    StorageProto.removeItem = function(key) {
      if (!isAuthKey(key)) return nativeRemove.call(this, key);
      try { nativeRemove.call(localStorage, key); } catch {}
      try { nativeRemove.call(sessionStorage, key); } catch {}
    };
  }

  const basePath = location.pathname.startsWith('/pulse-v12/') ? '/pulse-v12/' : '/';
  const resetUrl = new URL(`${basePath}reset/`, location.origin).href;

  window.__KOMO_PULSE_RUNTIME__ = Object.freeze({
    version: '2026.08.27-mobile-session-v2',
    projectRef: PROJECT_REF,
    legacySessionDetected: Boolean(existingLegacySession),
    resetUrl
  });

  // Override only the password-recovery click so recovery always returns to a
  // dedicated password-reset screen. This runs in capture phase before app.js.
  document.addEventListener('click', async (event) => {
    const button = event.target.closest?.('#forgotPasswordButton');
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const emailInput = document.querySelector('#emailInput');
    const feedback = document.querySelector('#authFeedback');
    const email = emailInput?.value?.trim() || '';

    const setFeedback = (message, success = false) => {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.style.color = success ? '#59675d' : '#8b4b45';
    };

    if (!email) {
      setFeedback('Renseignez d’abord votre adresse e-mail.');
      emailInput?.focus();
      return;
    }

    button.disabled = true;
    setFeedback('Envoi du lien sécurisé…', true);

    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.4');
      const client = createClient(
        'https://uqlolefsiktbznnymriy.supabase.co',
        'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n',
        { auth: { persistSession: false, autoRefreshToken: false } }
      );
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: resetUrl });
      if (error) throw error;
      setFeedback('Un lien de réinitialisation vient de vous être envoyé.', true);
    } catch (error) {
      setFeedback(error?.message || 'Impossible d’envoyer le lien pour le moment.');
    } finally {
      button.disabled = false;
    }
  }, true);
})();

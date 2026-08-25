(() => {
  'use strict';

  const PROJECT_REF = 'uqlolefsiktbznnymriy';
  const LEGACY_AUTH_KEY = `sb-${PROJECT_REF}-auth-token`;
  const REMEMBER_KEY = 'komo_pulse_remember';

  // Preserve existing Pulse sessions from the Work-era frontend when the
  // standalone app takes over the same pulse.komolongevity.com origin.
  // Supabase stores its persisted session under the project-scoped key.
  if (localStorage.getItem(REMEMBER_KEY) === null && localStorage.getItem(LEGACY_AUTH_KEY)) {
    localStorage.setItem(REMEMBER_KEY, '1');
  }

  const basePath = location.pathname.startsWith('/pulse-v12/') ? '/pulse-v12/' : '/';
  const resetUrl = new URL(`${basePath}reset/`, location.origin).href;

  window.__KOMO_PULSE_RUNTIME__ = Object.freeze({
    version: '2026.08.25-infra1',
    projectRef: PROJECT_REF,
    legacySessionDetected: Boolean(localStorage.getItem(LEGACY_AUTH_KEY)),
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

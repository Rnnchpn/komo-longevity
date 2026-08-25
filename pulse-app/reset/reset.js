import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const client = createClient(
  'https://uqlolefsiktbznnymriy.supabase.co',
  'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

const form = document.querySelector('#resetForm');
const password = document.querySelector('#password');
const passwordConfirm = document.querySelector('#passwordConfirm');
const submitButton = document.querySelector('#submitButton');
const status = document.querySelector('#status');

function setStatus(message, success = false) {
  status.textContent = message;
  status.style.color = success ? '#59675d' : '#8b4b45';
}

async function ensureRecoverySession() {
  const { data, error } = await client.auth.getSession();
  if (error) {
    setStatus('Ce lien ne peut pas être utilisé. Demandez un nouveau lien de réinitialisation.');
    submitButton.disabled = true;
    return false;
  }
  if (!data.session) {
    setStatus('Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien depuis la page de connexion.');
    submitButton.disabled = true;
    return false;
  }
  return true;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('');

  if (password.value.length < 8) {
    setStatus('Choisissez un mot de passe d’au moins 8 caractères.');
    return;
  }
  if (password.value !== passwordConfirm.value) {
    setStatus('Les deux mots de passe ne correspondent pas.');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Enregistrement…';
  const { error } = await client.auth.updateUser({ password: password.value });
  if (error) {
    setStatus(error.message || 'Le mot de passe n’a pas pu être modifié.');
    submitButton.disabled = false;
    submitButton.textContent = 'Enregistrer le nouveau mot de passe';
    return;
  }

  setStatus('Votre mot de passe a été modifié. Redirection vers Pulse…', true);
  window.setTimeout(() => { window.location.href = '../#home'; }, 900);
});

ensureRecoverySession();

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL = 'https://uqlolefsiktbznnymriy.supabase.co';
const KEY = 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER = 'komo_pulse_remember';

const state = {
  client: null,
  role: 'member',
  tab: 'patients',
  patients: [],
  registryCounts: {},
  applications: [],
  applicationCounts: {},
  requests: [],
  organizations: [],
  professionals: [],
  errors: {},
  search: '',
  selectedApplication: null,
  loading: false
};

function storage() {
  return localStorage.getItem(REMEMBER) === '1' ? localStorage : sessionStorage;
}

function sb() {
  if (!state.client) {
    state.client = createClient(URL, KEY, {
      auth: { storage: storage(), persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }
  return state.client;
}

function esc(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

function fmt(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
}

function patientName(item) {
  const p = item?.profile || {};
  return `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.display_name || item?.email || 'Patient Pulse';
}

function scopeLabel(scope) {
  return scope === 'motion' ? 'Motion Operator' : 'Clinical Practitioner';
}

function proStatus(status) {
  return ({ submitted: 'Nouvelle', under_review: 'En revue', approved: 'Approuvée', declined: 'Refusée' })[status] || status || '—';
}

function requestStatus(status) {
  return ({ submitted: 'Nouvelle', assigned: 'Assignée', accepted: 'Motion préparé', scheduled: 'Planifiée', completed: 'Terminée', declined: 'Non poursuivie', cancelled: 'Annulée' })[status] || status || '—';
}

function statusClass(status) {
  if (['approved', 'accepted', 'scheduled', 'completed'].includes(status)) return 'good';
  if (['under_review', 'assigned'].includes(status)) return 'warn';
  if (['declined', 'cancelled'].includes(status)) return 'bad';
  return '';
}

function root() {
  return document.querySelector('#viewRoot');
}

function setHeading() {
  const eyebrow = document.querySelector('#pageEyebrow');
  const title = document.querySelector('#pageTitle');
  if (eyebrow) eyebrow.textContent = 'KŌMØ · ADMIN';
  if (title) title.textContent = 'Console KŌMØ';
}

function toast(message) {
  let node = document.querySelector('#kav2Toast');
  if (!node) {
    node = document.createElement('div');
    node.id = 'kav2Toast';
    node.className = 'kav2-toast';
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.hidden = true; }, 3500);
}

async function invoke(name, body) {
  const { data, error } = await sb().functions.invoke(name, { body });
  if (error) throw new Error(error.message || `Erreur ${name}`);
  if (data?.error) throw new Error(data.detail || data.error);
  return data || {};
}

function renderFrame() {
  if (location.hash !== '#admin') return;
  const host = root();
  if (!host) return;
  setHeading();

  if (state.role !== 'admin') {
    host.innerHTML = `<div class="kav2"><section class="kav2-denied"><h2>Accès administrateur requis.</h2><p>Cette console est réservée à l’administration globale KŌMØ.</p><button class="secondary-button" data-admin-home>Retour à Pulse</button></section></div>`;
    return;
  }

  const openPros = (state.applicationCounts.submitted || 0) + (state.applicationCounts.under_review || 0);
  const openMotion = state.requests.filter(item => ['submitted', 'assigned'].includes(item.status)).length;

  host.innerHTML = `<div class="kav2" data-admin-console-v2>
    <header class="kav2-hero">
      <div>
        <p class="eyebrow">KŌMØ ADMINISTRATION</p>
        <h2>Piloter KŌMØ, au même endroit.</h2>
        <p>Patients Pulse, demandes professionnelles et demandes Motion sont centralisés ici. Cette console est indépendante des centres.</p>
      </div>
      <div class="kav2-hero-actions">
        <button class="secondary-button" data-admin-pro>Ouvrir KŌMØ Pro</button>
        <button class="secondary-button" data-admin-home>Retour Pulse</button>
      </div>
    </header>
    <nav class="kav2-tabs">
      <button class="${state.tab === 'patients' ? 'active' : ''}" data-admin-tab="patients">Patients <b>${state.patients.length}</b></button>
      <button class="${state.tab === 'pros' ? 'active' : ''}" data-admin-tab="pros">Demandes Pro${openPros ? ` <b>${openPros}</b>` : ''}</button>
      <button class="${state.tab === 'motion' ? 'active' : ''}" data-admin-tab="motion">Demandes Motion${openMotion ? ` <b>${openMotion}</b>` : ''}</button>
      <button class="kav2-refresh" data-admin-refresh>Actualiser</button>
    </nav>
    <div data-admin-panel>${state.loading ? '<div class="kav2-loading">Chargement de la console…</div>' : renderPanel()}</div>
  </div>`;
}

function errorBox(key, label) {
  const error = state.errors[key];
  if (!error) return '';
  return `<div class="kav2-empty"><strong>${esc(label)} indisponible.</strong><br>${esc(error)}</div>`;
}

function renderPanel() {
  if (state.tab === 'pros') return professionalView();
  if (state.tab === 'motion') return motionView();
  return patientView();
}

function filteredPatients() {
  const query = state.search.trim().toLowerCase();
  if (!query) return state.patients;
  return state.patients.filter(item => {
    const p = item.profile || {};
    return [patientName(item), item.email, p.city, p.country].filter(Boolean).join(' ').toLowerCase().includes(query);
  });
}

function patientRows() {
  const rows = filteredPatients();
  if (!rows.length) return '<div class="kav2-empty">Aucun patient ne correspond à cette recherche.</div>';
  return rows.map(item => {
    const p = item.profile || {};
    const location = [p.city, p.country].filter(Boolean).join(', ') || 'Localisation non renseignée';
    const confirmed = Boolean(item.email_confirmed_at);
    const records = Number(item.patient_record_count || 0);
    const requests = Number(item.service_request_count || 0);
    return `<article class="kav2-registry-row">
      <div class="kav2-registry-identity"><strong>${esc(patientName(item))}</strong><span>${esc(item.email || 'E-mail non renseigné')}</span><small>${esc(location)}</small></div>
      <div><span>Inscription</span><strong>${fmt(item.created_at)}</strong></div>
      <div><span>Dernière connexion</span><strong>${item.last_sign_in_at ? fmt(item.last_sign_in_at) : 'Jamais'}</strong></div>
      <div><span>Parcours</span><strong>${records ? `${records} dossier${records > 1 ? 's' : ''} centre` : 'Pulse uniquement'}</strong><small>${requests ? `${requests} demande${requests > 1 ? 's' : ''}` : 'Aucune demande Motion'}</small></div>
      <i class="${confirmed ? 'good' : 'warn'}">${confirmed ? 'E-mail confirmé' : 'À confirmer'}</i>
    </article>`;
  }).join('');
}

function patientView() {
  return `<section class="kav2-grid"><article class="kav2-card kav2-full">
    <div class="kav2-card-head kav2-registry-head"><div><span>Registre Pulse</span><h3>Tous les patients enregistrés</h3><p>Vue globale des comptes patients KŌMØ Pulse. Les professionnels restent isolés dans leur centre.</p></div><strong>${state.patients.length}</strong></div>
    ${errorBox('patients', 'Registre patients')}
    <div class="kav2-registry-tools">
      <label><span>Rechercher</span><input type="search" data-admin-patient-search value="${esc(state.search)}" placeholder="Nom, e-mail, ville…"></label>
      <div><small>Comptes patients</small><strong>${state.registryCounts.patients ?? state.patients.length}</strong></div>
      <div><small>Dossiers centre</small><strong>${state.patients.reduce((sum, item) => sum + Number(item.patient_record_count || 0), 0)}</strong></div>
    </div>
    <div class="kav2-registry-list" data-patient-registry-list>${patientRows()}</div>
  </article></section>`;
}

function professionalView() {
  const open = state.applications.filter(item => ['submitted', 'under_review'].includes(item.status));
  const done = state.applications.filter(item => !['submitted', 'under_review'].includes(item.status));
  return `<section class="kav2-grid">
    <article class="kav2-card kav2-wide"><div class="kav2-card-head"><div><span>À traiter</span><h3>Demandes professionnelles</h3><p>Motion sans RPPS ou Clinical avec identifiant professionnel vérifiable.</p></div><strong>${open.length}</strong></div>${errorBox('pros', 'Demandes Pro')}${open.length ? open.map(proRow).join('') : '<div class="kav2-empty">Aucune demande professionnelle en attente.</div>'}</article>
    <article class="kav2-card"><div class="kav2-card-head"><div><span>Historique</span><h3>Décisions récentes</h3></div></div>${done.slice(0, 10).map(item => `<div class="kav2-mini"><div><strong>${esc(item.professional_title || item.email || 'Professionnel')}</strong><span>${esc(scopeLabel(item.access_scope))} · ${esc(item.organization_name || '—')}</span></div><i class="${statusClass(item.status)}">${esc(proStatus(item.status))}</i></div>`).join('') || '<div class="kav2-empty">Aucun historique.</div>'}</article>
    ${state.selectedApplication ? proDetail(state.selectedApplication) : ''}
  </section>`;
}

function proRow(item) {
  return `<button class="kav2-row" data-pro-select="${esc(item.id)}"><div><strong>${esc(item.professional_title || item.email || 'Professionnel')}</strong><span>${esc(item.email || '—')}</span></div><div><strong>${esc(scopeLabel(item.access_scope))}</strong><span>${esc(item.organization_name || '—')}</span></div><i class="${statusClass(item.status)}">${esc(proStatus(item.status))}</i><b>→</b></button>`;
}

function proDetail(item) {
  const motion = item.access_scope === 'motion';
  const defaultRole = motion ? 'operator' : 'physician';
  const registration = motion ? 'Non requis' : `${item.registration_system || ''} ${item.registration_identifier || ''}`.trim() || 'À vérifier';
  return `<article class="kav2-card kav2-full kav2-detail">
    <div class="kav2-card-head"><div><span>Décision</span><h3>${esc(item.professional_title || item.email || 'Professionnel')}</h3><p>${esc(item.email || '—')} · ${esc(scopeLabel(item.access_scope))}</p></div><button class="kav2-x" data-pro-close>×</button></div>
    <div class="kav2-detail-grid"><div><span>Établissement</span><strong>${esc(item.organization_name || '—')}</strong></div><div><span>Territoire</span><strong>${esc(item.territory || '—')}</strong></div><div><span>Identifiant</span><strong>${esc(registration)}</strong></div><div><span>Habilitation</span><strong>${esc(scopeLabel(item.access_scope))}</strong></div></div>
    <div class="kav2-approve-box"><div><strong>${motion ? 'Activer Motion' : 'Activer Clinical'}</strong><p>${motion ? 'Rôle Operator par défaut. Accès Motion + MyoCare, sans validation Clinical.' : 'Rôle Physician par défaut. Vérifiez le registre avant activation.'}</p></div><button class="primary-button" data-pro-approve="${esc(item.id)}" data-pro-role="${defaultRole}">Approuver & activer →</button></div>
    <div class="kav2-secondary-actions">${item.status === 'submitted' ? `<button class="secondary-button" data-pro-review="${esc(item.id)}">Mettre en revue</button>` : ''}<button class="secondary-button danger" data-pro-decline="${esc(item.id)}">Refuser</button></div>
  </article>`;
}

function motionView() {
  const active = state.requests.filter(item => !['completed', 'declined', 'cancelled'].includes(item.status));
  return `<section class="kav2-grid"><article class="kav2-card kav2-full">
    <div class="kav2-card-head"><div><span>Motion intake</span><h3>Demandes Motion patients</h3><p>Orientez chaque demande vers le bon établissement. L’équipe du centre prend ensuite le relais.</p></div><strong>${active.filter(item => ['submitted', 'assigned'].includes(item.status)).length}</strong></div>
    ${errorBox('motion', 'Demandes Motion')}
    ${active.length ? active.map(motionRow).join('') : '<div class="kav2-empty">Aucune demande Motion à traiter.</div>'}
  </article></section>`;
}

function motionRow(item) {
  const p = item.profile || {};
  const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.display_name || item.email || 'Patient Pulse';
  const orgOptions = ['<option value="">Choisir un établissement</option>', ...state.organizations.map(org => `<option value="${esc(org.id)}" ${item.assigned_organization_id === org.id ? 'selected' : ''}>${esc(org.name)} · ${esc(org.clinical_data_status)}</option>`)].join('');
  const proOptions = ['<option value="">Professionnel optionnel</option>', ...state.professionals.filter(pro => !item.assigned_organization_id || pro.organization_id === item.assigned_organization_id).map(pro => `<option value="${esc(pro.user_id)}" ${item.assigned_professional_user_id === pro.user_id ? 'selected' : ''}>${esc(pro.email || pro.user_id)} · ${esc(pro.access_scope)}</option>`)].join('');
  return `<article class="kav2-patient-row" data-patient-request="${esc(item.id)}"><div><strong>${esc(name)}</strong><span>${esc(item.email || '—')} · ${esc(item.preferred_city || 'Ville non précisée')}</span><small>${fmt(item.submitted_at)}</small></div><i class="${statusClass(item.status)}">${esc(requestStatus(item.status))}</i>${['submitted', 'assigned'].includes(item.status) ? `<div class="kav2-assign"><select data-patient-org>${orgOptions}</select><select data-patient-pro>${proOptions}</select><button class="primary-button" data-patient-assign>Assigner →</button></div>` : '<div class="kav2-assigned">Dossier pris en charge par le centre.</div>'}</article>`;
}

async function loadAll() {
  state.loading = true;
  state.errors = {};
  renderFrame();

  const results = await Promise.allSettled([
    invoke('admin-registry', { action: 'list' }),
    invoke('professional-admin', { action: 'list' }),
    invoke('patient-intake', { action: 'list_admin' })
  ]);

  const [registryResult, proResult, motionResult] = results;

  if (registryResult.status === 'fulfilled') {
    state.patients = registryResult.value.patients || [];
    state.registryCounts = registryResult.value.counts || {};
  } else {
    state.errors.patients = registryResult.reason?.message || 'Chargement impossible';
  }

  if (proResult.status === 'fulfilled') {
    state.applications = proResult.value.applications || [];
    state.applicationCounts = proResult.value.counts || {};
  } else {
    state.errors.pros = proResult.reason?.message || 'Chargement impossible';
  }

  if (motionResult.status === 'fulfilled') {
    state.requests = motionResult.value.requests || [];
    state.organizations = motionResult.value.organizations || [];
    state.professionals = motionResult.value.professionals || [];
  } else {
    state.errors.motion = motionResult.reason?.message || 'Chargement impossible';
  }

  state.loading = false;
  renderFrame();
}

async function authorizeAndOpen() {
  if (location.hash !== '#admin') return;
  setHeading();
  const host = root();
  if (!host) return;

  host.innerHTML = '<div class="kav2"><div class="kav2-loading">Ouverture de la console Admin…</div></div>';

  const { data: { session } } = await sb().auth.getSession();
  if (!session?.user) {
    state.role = 'member';
    renderFrame();
    return;
  }

  const { data, error } = await sb().from('account_roles').select('role').eq('user_id', session.user.id).maybeSingle();
  if (error) {
    host.innerHTML = `<div class="kav2"><section class="kav2-denied"><h2>Impossible de vérifier le rôle Admin.</h2><p>${esc(error.message)}</p></section></div>`;
    return;
  }

  state.role = data?.role || 'member';
  renderFrame();
  if (state.role === 'admin') await loadAll();
}

async function proAction(action, id, role) {
  const item = state.applications.find(app => app.id === id);
  if (!item) return;
  if (action === 'approve' && !confirm(`Activer ${scopeLabel(item.access_scope)} pour ${item.professional_title || item.email || 'ce professionnel'} ?`)) return;
  if (action === 'decline' && !confirm('Refuser cette demande professionnelle ?')) return;
  try {
    const payload = { action, application_id: id };
    if (action === 'approve') {
      payload.organization_name = item.organization_name;
      payload.organization_role = role || (item.access_scope === 'motion' ? 'operator' : 'physician');
    }
    await invoke('professional-admin', payload);
    state.selectedApplication = null;
    toast(action === 'approve' ? 'Accès professionnel activé.' : action === 'review' ? 'Demande placée en revue.' : 'Demande refusée.');
    await loadAll();
  } catch (error) {
    toast(error.message || 'Action impossible.');
  }
}

async function assignMotion(row) {
  const org = row.querySelector('[data-patient-org]');
  const pro = row.querySelector('[data-patient-pro]');
  if (!org?.value) {
    toast('Choisissez un établissement.');
    return;
  }
  try {
    await invoke('patient-intake', {
      action: 'assign',
      request_id: row.dataset.patientRequest,
      organization_id: org.value,
      professional_user_id: pro?.value || null
    });
    toast('Demande Motion assignée.');
    await loadAll();
  } catch (error) {
    toast(error.message || 'Assignation impossible.');
  }
}

function handleClick(event) {
  if (location.hash !== '#admin') return;
  const tab = event.target.closest('[data-admin-tab]');
  if (tab) {
    state.tab = tab.dataset.adminTab;
    state.selectedApplication = null;
    renderFrame();
    return;
  }
  if (event.target.closest('[data-admin-refresh]')) { loadAll(); return; }
  if (event.target.closest('[data-admin-home]')) { location.hash = 'home'; return; }
  if (event.target.closest('[data-admin-pro]')) { location.hash = 'clinical'; return; }

  const select = event.target.closest('[data-pro-select]');
  if (select) {
    state.selectedApplication = state.applications.find(app => app.id === select.dataset.proSelect) || null;
    renderFrame();
    return;
  }
  if (event.target.closest('[data-pro-close]')) {
    state.selectedApplication = null;
    renderFrame();
    return;
  }
  const approve = event.target.closest('[data-pro-approve]');
  if (approve) { proAction('approve', approve.dataset.proApprove, approve.dataset.proRole); return; }
  const review = event.target.closest('[data-pro-review]');
  if (review) { proAction('review', review.dataset.proReview); return; }
  const decline = event.target.closest('[data-pro-decline]');
  if (decline) { proAction('decline', decline.dataset.proDecline); return; }

  const assign = event.target.closest('[data-patient-assign]');
  if (assign) {
    const row = assign.closest('[data-patient-request]');
    if (row) assignMotion(row);
  }
}

function handleInput(event) {
  if (location.hash !== '#admin') return;
  if (event.target.matches('[data-admin-patient-search]')) {
    state.search = event.target.value;
    const list = document.querySelector('[data-patient-registry-list]');
    if (list) list.innerHTML = patientRows();
  }
}

function handleChange(event) {
  if (location.hash !== '#admin') return;
  if (!event.target.matches('[data-patient-org]')) return;
  const row = event.target.closest('[data-patient-request]');
  const proSelect = row?.querySelector('[data-patient-pro]');
  if (!proSelect) return;
  const options = state.professionals
    .filter(pro => pro.organization_id === event.target.value)
    .map(pro => `<option value="${esc(pro.user_id)}">${esc(pro.email || pro.user_id)} · ${esc(pro.access_scope)}</option>`)
    .join('');
  proSelect.innerHTML = '<option value="">Professionnel optionnel</option>' + options;
}

let openTimer;
function scheduleOpen() {
  clearTimeout(openTimer);
  openTimer = setTimeout(() => {
    authorizeAndOpen().catch(error => {
      console.error('[admin-console]', error);
      const host = root();
      if (location.hash === '#admin' && host) {
        host.innerHTML = `<div class="kav2"><section class="kav2-denied"><h2>La console Admin n’a pas pu s’ouvrir.</h2><p>${esc(error.message || 'Erreur inconnue')}</p><button class="secondary-button" data-admin-refresh>Réessayer</button></section></div>`;
      }
    });
  }, 40);
}

document.addEventListener('click', handleClick);
document.addEventListener('input', handleInput);
document.addEventListener('change', handleChange);
window.addEventListener('hashchange', scheduleOpen);
window.addEventListener('komo:admin-route-ready', scheduleOpen);
window.addEventListener('komo:admin-open', scheduleOpen);
document.addEventListener('DOMContentLoaded', scheduleOpen);
setTimeout(scheduleOpen, 500);

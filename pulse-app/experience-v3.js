import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL = 'https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER_KEY = 'komo_pulse_remember';

const planIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 5.5h14v13H5z"/><path d="M8 9h8M8 13h5"/><path d="M16.5 15.5 18 17l3-3"/></svg>';
const calendarIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16"/></svg>';
const testIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 4h10v16H7z"/><path d="M9.5 8h5M9.5 12h5M9.5 16h3"/><path d="m15.5 15 1.2 1.2 2.3-2.5"/></svg>';
const myKomoIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M7.5 14.5c1.6-2 3.2-3 4.8-3 1.7 0 2.9.8 4.2 2.1"/><path d="M8 8.5h.01M16 8.5h.01"/></svg>';

const labels = {
  results: { label: 'Mes tests', icon: testIcon },
  path: { label: 'My KŌMØ', icon: myKomoIcon },
  documents: { label: 'Rendez-vous', icon: calendarIcon },
  explore: { label: 'Explorer' }
};

const memberData = {
  loadedFor: null,
  patient: null,
  assessments: [],
  scores: [],
  oldScores: [],
  priorities: [],
  trajectory: [],
  appointments: []
};

function selectedStorage() {
  return localStorage.getItem(REMEMBER_KEY) === '1' ? localStorage : sessionStorage;
}

function makeClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { storage: selectedStorage(), persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[c]));
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day:'2-digit', month:'short', year:'numeric' }).format(d);
}

function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }).format(d);
}

function statusLabel(status = '') {
  const map = {
    not_started:'À commencer', draft:'À compléter', baseline:'Point de départ', scheduled:'Planifié',
    collecting:'En cours', review:'En revue', validated:'Validé', released:'Disponible',
    archived:'Archivé', cancelled:'Annulé', completed:'Terminé', confirmed:'Confirmé',
    arrived:'Arrivé', in_progress:'En cours', no_show:'Absent'
  };
  return map[status] || (status ? String(status).replaceAll('_',' ') : 'À commencer');
}

function appointmentLabel(type = '') {
  return ({ motion:'KŌMØ Motion', clinical:'KŌMØ Clinical', follow_up:'Suivi KŌMØ', discovery:'Découverte' })[type] || 'Rendez-vous KŌMØ';
}

function currentScore() {
  const score = memberData.scores[0];
  if (score) return {
    value: numberOrNull(score.motion_score ?? score.overall_score),
    age: numberOrNull(score.motion_age),
    domains: score.domain_scores || score.subscores || {},
    date: score.calculated_at || score.computed_at || score.created_at
  };
  const old = memberData.oldScores[0];
  if (!old) return null;
  return {
    value: numberOrNull(old.overall_score),
    age: numberOrNull(old.motion_age),
    domains: old.subscores || {},
    date: old.computed_at || old.created_at
  };
}

function normalizedDomains(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
  const domainLabels = {
    mobility:'Mobilité', performance:'Performance', balance:'Équilibre', muscle_control:'Contrôle musculaire',
    quality:'Qualité', muscle:'Muscle', posture:'Posture', recovery:'Récupération', reserve:'Réserve'
  };
  return Object.entries(raw).map(([key, value]) => {
    const numeric = typeof value === 'object' && value !== null ? (value.score ?? value.value) : value;
    return [domainLabels[key] || key.replaceAll('_',' '), numberOrNull(numeric)];
  }).filter(([,value]) => value !== null).slice(0,8);
}

async function loadMemberData(force = false) {
  const sb = makeClient();
  const { data: { session } } = await sb.auth.getSession();
  if (!session?.user) return false;
  if (!force && memberData.loadedFor === session.user.id) return true;

  memberData.loadedFor = session.user.id;
  memberData.patient = null;
  memberData.assessments = [];
  memberData.scores = [];
  memberData.oldScores = [];
  memberData.priorities = [];
  memberData.trajectory = [];
  memberData.appointments = [];

  const oldScoreRes = await sb.from('pulse_score_runs').select('*').eq('user_id', session.user.id).order('created_at', { ascending:false }).limit(12);
  memberData.oldScores = oldScoreRes.data || [];

  const patientRes = await sb.from('patients').select('*').eq('patient_user_id', session.user.id).order('created_at', { ascending:false }).limit(1).maybeSingle();
  if (!patientRes.data) return true;
  memberData.patient = patientRes.data;

  const assessmentsRes = await sb.from('assessments').select('*').eq('patient_id', memberData.patient.id).order('created_at', { ascending:false }).limit(12);
  memberData.assessments = assessmentsRes.data || [];
  const ids = memberData.assessments.map(a => a.id).filter(Boolean);
  const latest = memberData.assessments[0];

  const trajectoryPromise = sb.from('trajectory_events').select('*').eq('patient_id', memberData.patient.id).order('event_date', { ascending:false }).limit(16);
  const appointmentsPromise = sb.from('organization_appointments').select('*').eq('patient_id', memberData.patient.id).order('scheduled_start', { ascending:true }).limit(40);
  const scoresPromise = ids.length ? sb.from('scores').select('*').in('assessment_id', ids).order('calculated_at', { ascending:false }) : Promise.resolve({ data:[] });
  const prioritiesPromise = latest?.id ? sb.from('priorities').select('*').eq('assessment_id', latest.id).order('rank', { ascending:true }) : Promise.resolve({ data:[] });

  const [trajectoryRes, appointmentsRes, scoresRes, prioritiesRes] = await Promise.all([
    trajectoryPromise, appointmentsPromise, scoresPromise, prioritiesPromise
  ]);
  memberData.trajectory = trajectoryRes.data || [];
  memberData.appointments = appointmentsRes.data || [];
  memberData.scores = scoresRes.data || [];
  memberData.priorities = prioritiesRes.data || [];
  return true;
}

function navButton(route, label, icon) {
  return `<button type="button" class="nav-item" data-route="${route}" aria-label="${label}">${icon}<span>${label}</span></button>`;
}

function applyNavSpec(button, route, spec) {
  if (spec.icon && button.dataset.experienceIcon !== route) {
    const svg = button.querySelector('svg');
    if (svg) svg.outerHTML = spec.icon;
    button.dataset.experienceIcon = route;
  }
  const span = button.querySelector('span');
  if (span && span.textContent !== spec.label) span.textContent = spec.label;
  if (button.getAttribute('aria-label') !== spec.label) button.setAttribute('aria-label', spec.label);
}

function patchNavigation() {
  document.querySelectorAll('#desktopNav .nav-item, #mobileNav .nav-item').forEach(button => {
    const route = button.dataset.route;
    const spec = labels[route];
    if (spec) applyNavSpec(button, route, spec);
  });

  const desktop = document.querySelector('#desktopNav');
  if (desktop && !desktop.querySelector('[data-route="plan"]')) {
    const holder = document.createElement('div');
    holder.innerHTML = navButton('plan', 'Mon plan', planIcon);
    const agenda = desktop.querySelector('[data-route="documents"]');
    desktop.insertBefore(holder.firstElementChild, agenda || desktop.querySelector('[data-route="explore"]'));
  }

  const mobile = document.querySelector('#mobileNav');
  if (mobile) {
    const explore = mobile.querySelector('[data-route="explore"]');
    if (!mobile.querySelector('[data-route="plan"]')) {
      const holder = document.createElement('div');
      holder.innerHTML = navButton('plan', 'Mon plan', planIcon);
      mobile.insertBefore(holder.firstElementChild, explore || null);
    }
    if (!mobile.querySelector('[data-route="documents"]')) {
      const holder = document.createElement('div');
      holder.innerHTML = navButton('documents', 'Rendez-vous', calendarIcon);
      mobile.insertBefore(holder.firstElementChild, explore || null);
    }
  }
}

function setPage(eyebrow, title, html) {
  const pageEyebrow = document.querySelector('#pageEyebrow');
  const pageTitle = document.querySelector('#pageTitle');
  const root = document.querySelector('#viewRoot');
  if (pageEyebrow) pageEyebrow.textContent = eyebrow;
  if (pageTitle) pageTitle.textContent = title;
  if (root) root.innerHTML = html;
}

function patchActive(route) {
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.route === route));
}

function testCard(index, title, body, status, tone = '') {
  return `<article class="card patient-action-card ${tone}"><div class="patient-action-top"><span class="path-number">${index}</span><span class="status-pill">${status}</span></div><div><h3>${title}</h3><p>${body}</p></div></article>`;
}

function renderTests() {
  const latest = memberData.assessments[0];
  const status = latest ? statusLabel(latest.status) : 'À commencer';
  const completeness = numberOrNull(latest?.completeness);
  const readiness = completeness !== null ? `${Math.round(completeness)}% complété` : status;
  return `<section class="patient-page-intro"><div><p class="eyebrow">VOTRE ÉVALUATION</p><h2>Vos tests commencent ici.</h2></div><p>Un seul point d’entrée pour préparer votre bilan, réaliser les tests guidés disponibles dans Pulse et retrouver ce qui sera mesuré avec votre professionnel.</p></section>
  <div class="patient-test-grid">
    ${testCard('01','KŌMØ Loco Check','Questionnaire de mobilité et première référence fonctionnelle. Cette brique devient le point de départ de chaque nouvelle trajectoire.',readiness,'featured')}
    ${testCard('02','Tests fonctionnels','Stand-Up, Two-Step, marche et autres tests guidés selon votre protocole KŌMØ. Les séquences disponibles seront lancées depuis cette page.','Dans votre protocole')}
    ${testCard('03','KŌMØ Motion','Mesure instrumentée du mouvement et de la fonction musculaire. Réalisée lors de votre évaluation avec l’équipement KŌMØ / Myodev.','En consultation')}
    ${testCard('04','KŌMØ Clinical','Contexte clinique, posture, biologie ou imagerie lorsqu’ils sont indiqués dans votre parcours médical.','Avec votre professionnel')}
  </div>
  <section class="section-block two-col"><article class="card"><h3>Votre prochaine étape</h3><div class="empty-state">${latest ? `Votre évaluation actuelle est <strong>${status.toLowerCase()}</strong>. Pulse centralisera ici chaque test à compléter avant et entre vos consultations.` : 'Aucune évaluation n’est encore ouverte. Cette page devient votre espace de départ pour le prochain bilan KŌMØ.'}</div></article><article class="card"><h3>Principe KŌMØ</h3><div class="empty-state">Les tests réalisables seul et les mesures supervisées sont clairement séparés. Aucune donnée clinique n’est présentée comme définitive avant validation lorsqu’une validation professionnelle est requise.</div></article></section>`;
}

function renderMyKomo() {
  const score = currentScore();
  const domains = normalizedDomains(score?.domains || {});
  const scoreValue = score?.value;
  const motionAge = score?.age;
  const timeline = memberData.trajectory.slice(0,8);
  const history = memberData.scores.length ? memberData.scores.slice(0,5) : memberData.oldScores.slice(0,5);
  return `<section class="patient-page-intro my-komo-intro"><div><p class="eyebrow">MY KŌMØ</p><h2>Vos scores. Votre évolution.</h2></div><p>My KŌMØ est votre mémoire de mobilité : résultats successifs, évolution entre deux consultations et repères utiles pour comprendre votre trajectoire dans le temps.</p></section>
  <div class="my-komo-hero">
    <article class="card score-panel"><p class="eyebrow">REPÈRE ACTUEL</p>${scoreValue !== null && scoreValue !== undefined ? `<div class="score-display"><div class="score-big">${Math.round(scoreValue)}<small>/100</small></div><p class="score-caption">Votre repère global actuel. Sa valeur prend son sens lorsqu’elle est comparée à vos évaluations précédentes et replacée dans votre contexte.</p></div>` : '<div class="empty-state">Votre premier score apparaîtra ici après validation de votre évaluation.</div>'}</article>
    <article class="card score-panel"><p class="eyebrow">ÂGE LOCOMOTEUR</p>${motionAge !== null && motionAge !== undefined ? `<div class="score-display"><div class="score-big">${Math.round(motionAge)}<small>ans</small></div><p class="score-caption">Un repère longitudinal KŌMØ lorsqu’il est disponible. Il ne constitue ni un âge biologique ni un diagnostic.</p></div>` : '<div class="empty-state">Ce repère sera affiché lorsqu’il sera disponible et validé.</div>'}</article>
  </div>
  <section class="section-block two-col"><article class="card"><h3>Vos domaines</h3>${domains.length ? `<div class="domain-list">${domains.map(([label,value]) => `<div class="domain-row"><span>${escapeHtml(label)}</span><div class="domain-track"><i style="width:${Math.max(0,Math.min(100,value))}%"></i></div><strong>${Math.round(value)}</strong></div>`).join('')}</div>` : '<div class="empty-state">Les sous-scores seront visibles ici lorsqu’ils seront disponibles.</div>'}</article><article class="card"><h3>Entre vos consultations</h3>${timeline.length ? `<div class="timeline">${timeline.map(event => `<div class="timeline-item"><strong>${escapeHtml((event.event_type || 'Suivi').replaceAll('_',' '))}</strong><span>${fmtDate(event.event_date)}</span></div>`).join('')}</div>` : '<div class="empty-state">Votre suivi longitudinal commencera avec votre première évaluation KŌMØ.</div>'}</article></section>
  <section class="section-block"><article class="card"><h3>Historique des évaluations</h3>${history.length ? `<div class="score-history">${history.map((item,index) => { const value = numberOrNull(item.motion_score ?? item.overall_score); const date = item.calculated_at || item.computed_at || item.created_at; return `<div class="score-history-row"><span>Évaluation ${history.length-index}</span><strong>${value !== null ? Math.round(value) : '—'}</strong><small>${fmtDate(date)}</small></div>`; }).join('')}</div>` : '<div class="empty-state">Aucun historique disponible pour le moment.</div>'}</article></section>`;
}

function nextAppointmentText() {
  const now = Date.now();
  const next = memberData.appointments.find(a => a.scheduled_start && new Date(a.scheduled_start).getTime() >= now && !['cancelled','completed','no_show'].includes(a.status));
  if (!next) return 'Aucun rendez-vous n’est encore programmé. Votre prochain bilan apparaîtra ici dès qu’il sera planifié.';
  return `${appointmentLabel(next.appointment_type)} · ${fmtDateTime(next.scheduled_start)}.`;
}

function renderPlan() {
  const priorities = memberData.priorities || [];
  return `<section class="patient-page-intro plan-intro"><div><p class="eyebrow">PLAN PERSONNALISÉ</p><h2>Ce qui compte maintenant.</h2></div><p>Votre plan transforme les résultats de l’évaluation en priorités simples à suivre entre deux consultations. Les recommandations cliniques restent publiées et validées dans le cadre approprié.</p></section>
  <div class="plan-priority-grid">${priorities.length ? priorities.slice(0,3).map((priority,index) => `<article class="card plan-priority-card"><span class="path-number">0${priority.rank || index+1}</span><h3>${escapeHtml(priority.patient_wording || priority.category || 'Priorité')}</h3><p>${escapeHtml(priority.category || 'Axe de progression KŌMØ')}</p><span class="plan-state">À suivre jusqu’à la prochaine évaluation</span></article>`).join('') : `<article class="card plan-empty"><p class="eyebrow">VOTRE PLAN</p><h3>Il sera construit après votre évaluation.</h3><p>Une fois vos résultats relus, Pulse affichera ici les priorités retenues, les actions à suivre et les points à réévaluer lors de la prochaine consultation.</p></article>`}</div>
  <section class="section-block two-col"><article class="card"><h3>Suivi entre deux consultations</h3><div class="empty-state">Cette page accueillera progressivement l’adhérence au programme, les objectifs intermédiaires et les ajustements décidés avec votre professionnel.</div></article><article class="card"><h3>Prochaine réévaluation</h3><div class="empty-state">${nextAppointmentText()}</div></article></section>`;
}

function renderAppointments() {
  const now = Date.now();
  const upcoming = memberData.appointments.filter(a => a.scheduled_start && new Date(a.scheduled_start).getTime() >= now && !['cancelled','completed','no_show'].includes(a.status));
  const past = memberData.appointments.filter(a => !a.scheduled_start || new Date(a.scheduled_start).getTime() < now || ['completed','no_show'].includes(a.status)).slice().reverse();
  const rows = items => items.map(a => `<div class="appointment-row"><div class="appointment-date"><strong>${fmtDateTime(a.scheduled_start)}</strong><span>${appointmentLabel(a.appointment_type)}</span></div><div class="appointment-meta"><span class="status-pill">${statusLabel(a.status)}</span></div></div>`).join('');
  return `<section class="patient-page-intro agenda-intro"><div><p class="eyebrow">AGENDA</p><h2>Vos rendez-vous KŌMØ.</h2></div><p>Retrouvez vos prochaines évaluations, vos consultations de suivi et l’historique de vos rendez-vous dans un seul agenda.</p></section>
  <section class="section-block"><article class="card"><div class="section-head"><div><h2>À venir</h2><p>Votre prochaine étape avec KŌMØ.</p></div></div>${upcoming.length ? `<div class="appointment-list">${rows(upcoming)}</div>` : '<div class="empty-state">Aucun rendez-vous à venir pour le moment.</div>'}</article></section>
  <section class="section-block"><article class="card"><h3>Historique</h3>${past.length ? `<div class="appointment-list">${rows(past.slice(0,10))}</div>` : '<div class="empty-state">Votre historique de rendez-vous apparaîtra ici.</div>'}</article></section>`;
}

function patchHome() {
  const root = document.querySelector('#viewRoot');
  if (!root) return;
  root.querySelectorAll('[data-route="results"]').forEach(el => {
    if (el.closest('.section-head')) {
      el.dataset.route = 'path';
      el.textContent = 'Ouvrir My KŌMØ →';
    } else if (el.classList.contains('primary-button')) {
      el.dataset.route = 'path';
      const first = el.querySelector('span:first-child');
      if (first) first.textContent = 'Ouvrir My KŌMØ';
    }
  });
  root.querySelectorAll('[data-route="path"]').forEach(el => {
    if (el.classList.contains('ghost-button')) {
      el.dataset.route = 'plan';
      el.textContent = 'Voir mon plan';
    }
  });
  const externalStart = root.querySelector('.hero-actions a.primary-button');
  if (externalStart) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'primary-button';
    button.dataset.route = 'results';
    button.innerHTML = '<span>Commencer mes tests</span><span>→</span>';
    externalStart.replaceWith(button);
  }
}

async function renderExperience(force = false) {
  const appShell = document.querySelector('#appShell');
  if (!appShell || appShell.hidden) return;
  patchNavigation();
  const route = location.hash.replace(/^#/,'') || 'home';
  await loadMemberData(force);

  if (route === 'results') setPage('MES TESTS', 'Réalisez vos tests.', renderTests());
  else if (route === 'path') setPage('MY KŌMØ', 'Votre mobilité, dans le temps.', renderMyKomo());
  else if (route === 'documents') setPage('AGENDA', 'Mes rendez-vous.', renderAppointments());
  else if (route === 'plan') setPage('MON PLAN', 'Votre plan personnalisé.', renderPlan());
  else if (route === 'home') patchHome();
  else return;

  patchActive(route);
}

let renderTimer;
function scheduleRender(force = false) {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => renderExperience(force).catch(console.error), 0);
}

window.addEventListener('hashchange', () => scheduleRender(false));
document.addEventListener('click', event => {
  if (event.target.closest('#refreshButton')) setTimeout(() => scheduleRender(true), 80);
});

const observer = new MutationObserver(mutations => {
  let shellOpened = false;
  let navChanged = false;
  for (const mutation of mutations) {
    if (mutation.type === 'attributes' && mutation.target?.id === 'appShell' && mutation.attributeName === 'hidden') shellOpened = true;
    if (mutation.type === 'childList') {
      const target = mutation.target;
      if (target?.id === 'desktopNav' || target?.id === 'mobileNav' || target?.closest?.('#desktopNav,#mobileNav')) navChanged = true;
    }
  }
  if (navChanged) patchNavigation();
  if (shellOpened) scheduleRender(false);
});
observer.observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:['hidden'] });

document.addEventListener('DOMContentLoaded', () => scheduleRender(false));
setTimeout(() => scheduleRender(false), 150);

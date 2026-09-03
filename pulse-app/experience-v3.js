import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL = 'https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER_KEY = 'komo_pulse_remember';

const planIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 5.5h14v13H5z"/><path d="M8 9h8M8 13h5"/><path d="M16.5 15.5 18 17l3-3"/></svg>';
const calendarIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16"/></svg>';
const testIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 4h10v16H7z"/><path d="M9.5 8h5M9.5 12h5M9.5 16h3"/><path d="m15.5 15 1.2 1.2 2.3-2.5"/></svg>';
const myKomoIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8.5"/><path d="M7.5 14.5c1.6-2 3.2-3 4.8-3 1.7 0 2.9.8 4.2 2.1"/><path d="M8 8.5h.01M16 8.5h.01"/></svg>';
const crownIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m4 8 4 3 4-6 4 6 4-3-2 9H6L4 8Z"/><path d="M7 20h10"/></svg>';
const peopleIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.5-4 2.5-6 5.5-6s5 2 5.5 6"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17 13c2.1.5 3.3 2.3 3.5 5"/></svg>';
const chatIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 5h14v10H9l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg>';
const clubIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M8 12h8M12 8v8"/></svg>';

const labels = {
  results: { label: 'Mes tests', icon: testIcon },
  path: { label: 'My KŌMØ', icon: myKomoIcon },
  documents: { label: 'Rendez-vous', icon: calendarIcon },
  explore: { label: 'Explorer' }
};

const memberData = {
  loadedFor: null,
  session: null,
  profile: null,
  socialProfile: null,
  clubMemberships: [],
  clubs: [],
  socialConnections: null,
  socialLoadedFor: null,
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

function resetMemberData(session) {
  memberData.loadedFor = session.user.id;
  memberData.session = session;
  memberData.profile = null;
  memberData.socialProfile = null;
  memberData.clubMemberships = [];
  memberData.clubs = [];
  memberData.socialConnections = null;
  memberData.socialLoadedFor = null;
  memberData.patient = null;
  memberData.assessments = [];
  memberData.scores = [];
  memberData.oldScores = [];
  memberData.priorities = [];
  memberData.trajectory = [];
  memberData.appointments = [];
}

async function loadSocialData(sb, userId) {
  const profilePromise = sb.from('profiles').select('*').eq('id', userId).maybeSingle();
  const socialProfilePromise = sb.from('komo_social_profiles').select('*').eq('user_id', userId).maybeSingle();
  const membershipsPromise = sb.from('komo_club_members').select('club_id,role,joined_at').eq('user_id', userId);
  const connectionsPromise = sb.from('komo_social_connections').select('id', { count:'exact', head:true }).eq('status','accepted').or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  const [profileRes, socialProfileRes, membershipsRes, connectionsRes] = await Promise.all([
    profilePromise, socialProfilePromise, membershipsPromise, connectionsPromise
  ]);

  memberData.profile = profileRes.data || {};
  memberData.socialProfile = socialProfileRes.data || null;
  memberData.clubMemberships = membershipsRes.data || [];
  memberData.socialConnections = Number.isFinite(connectionsRes.count) ? connectionsRes.count : null;

  const clubIds = [...new Set(memberData.clubMemberships.map(x => x.club_id).filter(Boolean))];
  if (clubIds.length) {
    const clubsRes = await sb.from('komo_clubs').select('id,slug,name,description,category,emoji,is_active').in('id', clubIds);
    memberData.clubs = clubsRes.data || [];
  } else {
    const clubsRes = await sb.from('komo_clubs').select('id,slug,name,description,category,emoji,is_active').eq('is_active', true).limit(6);
    memberData.clubs = clubsRes.data || [];
  }
  memberData.socialLoadedFor = userId;
}

async function loadMemberData(force = false, includeSocial = false) {
  const sb = makeClient();
  const { data: { session } } = await sb.auth.getSession();
  if (!session?.user) return false;
  if (!force && memberData.loadedFor === session.user.id) {
    if (includeSocial && memberData.socialLoadedFor !== session.user.id) {
      await loadSocialData(sb, session.user.id).catch(error => console.warn('[experience-v3] social data', error));
    }
    return true;
  }

  resetMemberData(session);

  const socialPromise = includeSocial ? loadSocialData(sb, session.user.id).catch(error => console.warn('[experience-v3] social data', error)) : Promise.resolve();
  const oldScorePromise = sb.from('pulse_score_runs').select('*').eq('user_id', session.user.id).order('created_at', { ascending:false }).limit(12);
  const patientPromise = sb.from('patients').select('*').eq('patient_user_id', session.user.id).order('created_at', { ascending:false }).limit(1).maybeSingle();
  const [oldScoreRes, patientRes] = await Promise.all([oldScorePromise, patientPromise]);
  memberData.oldScores = oldScoreRes.data || [];
  await socialPromise;

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

function titleCaseRole(value='') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const key = raw.toLowerCase().replaceAll('_',' ');
  const map = { ceo:'CEO', founder:'Founder', owner:'Founder', admin:'Admin', member:'Membre', moderator:'Modérateur', pro:'Professionnel', professional:'Professionnel' };
  return map[key] || raw.replaceAll('_',' ').replace(/\b\w/g, c => c.toUpperCase());
}

function socialIdentity() {
  const p = memberData.profile || {};
  const sp = memberData.socialProfile || {};
  const u = memberData.session?.user || {};
  const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim();
  const name = sp.display_name || p.display_name || fullName || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Membre KŌMØ';
  const handle = sp.handle ? `@${String(sp.handle).replace(/^@/,'')}` : '';
  const membershipRole = memberData.clubMemberships.map(x => x.role).filter(Boolean).sort((a,b) => {
    const rank = v => ({ceo:6,founder:5,owner:5,admin:4,moderator:3,professional:2,pro:2,member:1}[String(v).toLowerCase()] || 0);
    return rank(b)-rank(a);
  })[0];
  const metaRole = u.user_metadata?.role_label || u.user_metadata?.title || u.app_metadata?.role;
  const role = titleCaseRole(membershipRole || metaRole || 'Membre');
  const bio = sp.bio || p.bio || '';
  const interests = Array.isArray(sp.interests) && sp.interests.length ? sp.interests : (Array.isArray(p.interests) ? p.interests : []);
  const joinedAt = memberData.clubMemberships.map(x => x.joined_at).filter(Boolean).sort()[0] || p.created_at;
  return { name, handle, role, bio, interests, joinedAt };
}

function clubForMembership(membership) {
  return memberData.clubs.find(club => club.id === membership.club_id) || null;
}

function renderClubMemberships() {
  if (!memberData.clubMemberships.length) {
    return `<div class="mks-club-empty"><span>CLUB KŌMØ</span><strong>Votre communauté se construit ici.</strong><p>Rejoignez les espaces KŌMØ liés au mouvement, aux événements et aux challenges. L’accès social reste distinct de vos données cliniques.</p></div>`;
  }
  return `<div class="mks-membership-list">${memberData.clubMemberships.slice(0,4).map(membership => {
    const club = clubForMembership(membership);
    return `<div class="mks-membership"><span>${escapeHtml(club?.emoji || 'K')}</span><div><strong>${escapeHtml(club?.name || 'KŌMØ Club')}</strong><small>${escapeHtml(titleCaseRole(membership.role || 'Membre'))}${membership.joined_at ? ` · depuis ${escapeHtml(fmtDate(membership.joined_at))}` : ''}</small></div></div>`;
  }).join('')}</div>`;
}

function ensureMyKomoSocialStyle() {
  if (document.querySelector('#myKomoSocialV4Style')) return;
  const style = document.createElement('style');
  style.id = 'myKomoSocialV4Style';
  style.textContent = `
[data-my-komo-social]{--mks-ink:#1f2e25;--mks-muted:#788079;--mks-line:rgba(31,46,37,.10);--mks-sage:#6f8876;--mks-soft:#e6ece5;--mks-sand:#efe8dc}.mks-hero{display:grid;grid-template-columns:minmax(0,1.32fr) minmax(300px,.68fr);gap:14px}.mks-identity{min-height:390px;padding:32px;display:grid;grid-template-columns:190px 1fr;gap:30px;align-items:center;background:radial-gradient(80% 100% at 5% 100%,rgba(208,219,208,.48),transparent 62%),linear-gradient(145deg,#fbfaf6,#f1ede5)!important;overflow:hidden}.mks-avatar-wrap{display:grid;place-items:center}.mks-avatar{width:174px;height:174px;border-radius:50%;overflow:hidden;background:#24382c;color:white;display:grid;place-items:center;font-size:32px;box-shadow:0 20px 42px rgba(37,55,43,.13)}.mks-avatar .komo-avatar-svg,.mks-avatar img{width:100%;height:100%;display:block;object-fit:cover}.mks-copy{min-width:0}.mks-kicker{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--mks-sage);font-weight:700}.mks-name{margin:8px 0 7px;font:500 clamp(34px,4.2vw,64px)/.96 Manrope,DM Sans,sans-serif;letter-spacing:-.06em;color:var(--mks-ink)}.mks-handle{font-size:11px;color:var(--mks-muted);margin-bottom:14px}.mks-role-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.mks-role{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid var(--mks-line);border-radius:999px;background:rgba(255,255,255,.72);font-size:8px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.mks-crown{width:17px;height:17px;color:#8e7851}.mks-crown svg{width:100%;height:100%;stroke-width:1.5}.mks-club-chip{display:inline-flex;align-items:center;padding:7px 10px;border-radius:999px;background:#dfe8df;color:#31513b;font-size:8px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.mks-bio{margin:17px 0 0;max-width:560px;color:#667069;font-size:12px;line-height:1.6}.mks-interests{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.mks-interest{padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.66);border:1px solid var(--mks-line);font-size:8px;color:#59655d}.mks-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}.mks-actions .primary-button,.mks-actions .secondary-button{min-height:43px;font-size:11px}.mks-panel{padding:28px;min-height:390px;background:linear-gradient(155deg,#20352a,#18281f)!important;color:#fff;display:flex;flex-direction:column;justify-content:space-between}.mks-panel .eyebrow{color:#a8b7aa}.mks-panel h3{margin:0;font-size:28px;line-height:1.06;letter-spacing:-.045em;font-weight:500}.mks-panel p{margin:10px 0 0;color:rgba(255,255,255,.62);font-size:10px;line-height:1.55}.mks-panel-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:18px 0}.mks-panel-stat{padding:12px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.045)}.mks-panel-stat span{display:block;font-size:7px;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.5)}.mks-panel-stat strong{display:block;margin-top:5px;font-size:18px;font-weight:500}.mks-member-since{font-size:8px!important;color:rgba(255,255,255,.48)!important}.mks-social-section{margin-top:14px}.mks-social-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin:0 4px 12px}.mks-social-head h2{margin:0;font-size:22px;font-weight:500;letter-spacing:-.035em}.mks-social-head p{margin:5px 0 0;color:var(--mks-muted);font-size:10px}.mks-community-grid{display:grid;grid-template-columns:1.15fr .85fr .85fr;gap:12px}.mks-community-card{min-height:210px;padding:23px}.mks-community-card.dark{background:#1d2d24!important;color:#fff}.mks-community-card.dark p,.mks-community-card.dark small{color:rgba(255,255,255,.58)}.mks-card-icon{width:38px;height:38px;border-radius:12px;background:var(--mks-soft);color:#44604d;display:grid;place-items:center}.mks-community-card.dark .mks-card-icon{background:rgba(255,255,255,.09);color:#dfe8df}.mks-card-icon svg{width:18px;height:18px;stroke-width:1.55}.mks-community-card h3{margin:21px 0 7px;font-size:17px;font-weight:500;letter-spacing:-.025em}.mks-community-card p{margin:0;color:var(--mks-muted);font-size:10px;line-height:1.55}.mks-card-foot{margin-top:18px;padding-top:13px;border-top:1px solid var(--mks-line);display:flex;align-items:center;justify-content:space-between;gap:10px}.mks-community-card.dark .mks-card-foot{border-color:rgba(255,255,255,.10)}.mks-card-foot span{font-size:8px;color:var(--mks-muted)}.mks-community-card.dark .mks-card-foot span{color:rgba(255,255,255,.52)}.mks-link-btn{border:0;background:none;padding:0;font-size:9px;font-weight:700;cursor:pointer;color:inherit}.mks-link-btn[disabled]{opacity:.45;cursor:default}.mks-membership-list{display:grid;gap:8px;margin-top:16px}.mks-membership{display:grid;grid-template-columns:32px 1fr;gap:10px;align-items:center;padding:9px;border-radius:12px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.07)}.mks-membership>span{width:28px;height:28px;border-radius:9px;background:rgba(255,255,255,.08);display:grid;place-items:center;font-size:11px}.mks-membership strong{display:block;font-size:9px}.mks-membership small{display:block;margin-top:2px;font-size:7px}.mks-club-empty{margin-top:18px;padding:14px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.04)}.mks-club-empty span{font-size:7px;letter-spacing:.12em;color:rgba(255,255,255,.45)}.mks-club-empty strong{display:block;margin-top:5px;font-size:11px}.mks-club-empty p{margin-top:5px}.mks-komo{margin-top:12px;padding:20px 22px!important;display:flex;align-items:center;justify-content:space-between;gap:24px;background:linear-gradient(145deg,#f8f6f0,#eeeae1)!important}.mks-komo strong{font-size:12px;font-weight:600}.mks-komo p{margin:4px 0 0;color:var(--mks-muted);font-size:9px;line-height:1.5}.mks-komo span{font-size:8px;letter-spacing:.1em;color:var(--mks-sage);text-transform:uppercase;font-weight:800}.mks-separation{margin-top:12px;font-size:8px;color:#8b908c;text-align:center}.mks-profile-settings{white-space:nowrap}
@media(max-width:980px){.mks-hero{grid-template-columns:1fr}.mks-identity,.mks-panel{min-height:auto}.mks-community-grid{grid-template-columns:1fr 1fr}.mks-community-card:first-child{grid-column:1/-1}}
@media(max-width:720px){.mks-identity{grid-template-columns:1fr;padding:22px;text-align:center;gap:18px}.mks-avatar{width:138px;height:138px}.mks-role-row,.mks-actions,.mks-interests{justify-content:center}.mks-bio{margin-left:auto;margin-right:auto}.mks-panel{padding:22px}.mks-community-grid{grid-template-columns:1fr}.mks-community-card:first-child{grid-column:auto}.mks-social-head{display:block}.mks-komo{display:block}.mks-komo span{display:block;margin-bottom:8px}}
`;
  document.head.appendChild(style);
}

function renderMyKomo() {
  const identity = socialIdentity();
  const membershipCount = memberData.clubMemberships.length;
  const connectionCount = memberData.socialConnections;
  const current = currentScore();
  const scoreNote = current?.value !== null && current?.value !== undefined ? `Motion Score ${Math.round(current.value)}` : 'Trajectoire KŌMØ';
  const clubLabel = membershipCount ? `${membershipCount} Club${membershipCount > 1 ? 's' : ''}` : 'Club KŌMØ';
  const bio = identity.bio || 'Votre espace personnel pour partager ce qui vous met en mouvement et rejoindre la communauté KŌMØ.';
  const interests = identity.interests.slice(0,8);
  const socialPublic = memberData.socialProfile?.is_public === true;
  const socialVisibility = memberData.socialProfile ? (socialPublic ? 'public' : 'privé') : 'à configurer';
  const activeClub = memberData.clubMemberships[0] ? clubForMembership(memberData.clubMemberships[0]) : memberData.clubs[0];

  return `<div data-my-komo-social>
    <section class="mks-hero">
      <article class="card mks-identity">
        <div class="mks-avatar-wrap"><div class="mykomo-avatar mks-avatar" aria-label="Photo ou avatar KŌMØ">K</div></div>
        <div class="mks-copy">
          <span class="mks-kicker">MY KŌMØ · PROFIL</span>
          <h2 class="mks-name">${escapeHtml(identity.name)}</h2>
          ${identity.handle ? `<div class="mks-handle">${escapeHtml(identity.handle)}</div>` : ''}
          <div class="mks-role-row"><span class="mks-role"><i class="mks-crown">${crownIcon}</i>${escapeHtml(identity.role)}</span><span class="mks-club-chip">${escapeHtml(clubLabel)}</span></div>
          <p class="mks-bio">${escapeHtml(bio)}</p>
          ${interests.length ? `<div class="mks-interests">${interests.map(x => `<span class="mks-interest">${escapeHtml(x)}</span>`).join('')}</div>` : ''}
          <div class="mks-actions"><button type="button" class="primary-button" data-mykomo-club>Entrer dans le Club <span>→</span></button><button type="button" class="secondary-button mks-profile-settings" data-route="profile">Réglages du profil</button></div>
        </div>
      </article>
      <article class="card mks-panel">
        <div><p class="eyebrow">VOTRE STATUT</p><h3>${escapeHtml(identity.role)}</h3><p>${escapeHtml(scoreNote)} · votre identité sociale reste séparée de vos informations médicales.</p></div>
        <div>
          <div class="mks-panel-stats"><div class="mks-panel-stat"><span>Club</span><strong>${membershipCount || '—'}</strong></div><div class="mks-panel-stat"><span>Connexions</span><strong>${connectionCount ?? '—'}</strong></div></div>
          <p class="mks-member-since">${identity.joinedAt ? `Membre depuis ${escapeHtml(fmtDate(identity.joinedAt))}` : 'Votre historique Club apparaîtra ici.'} · Profil social ${socialVisibility}.</p>
        </div>
      </article>
    </section>

    <section class="mks-social-section" id="myKomoClub">
      <div class="mks-social-head"><div><p class="eyebrow">CLUB & COMMUNAUTÉ</p><h2>Le mouvement se partage.</h2><p>Clubs, connexions, discussions et expériences KŌMØ réunis au même endroit.</p></div></div>
      <div class="mks-community-grid">
        <article class="card mks-community-card dark"><div><div class="mks-card-icon">${clubIcon}</div><h3>${escapeHtml(activeClub?.name || 'KŌMØ Club')}</h3><p>${escapeHtml(activeClub?.description || 'Votre espace communautaire KŌMØ : mouvement, rencontres, challenges et expériences.')}</p>${renderClubMemberships()}</div><div class="mks-card-foot"><span>${membershipCount ? 'Accès actif' : 'Accès à activer'}</span><button type="button" class="mks-link-btn" data-mykomo-club-focus>${membershipCount ? 'Voir mes Clubs →' : 'Découvrir →'}</button></div></article>
        <article class="card mks-community-card"><div><div class="mks-card-icon">${peopleIcon}</div><h3>Connexions</h3><p>Retrouvez les personnes avec qui vous partagez vos expériences KŌMØ sans exposer vos données de santé.</p></div><div class="mks-card-foot"><span>${connectionCount === null ? 'Bientôt disponible' : `${connectionCount} connexion${connectionCount === 1 ? '' : 's'}`}</span><button type="button" class="mks-link-btn" disabled aria-disabled="true">Réseau bientôt →</button></div></article>
        <article class="card mks-community-card"><div><div class="mks-card-icon">${chatIcon}</div><h3>Discussions</h3><p>Le forum et Discord seront reliés à votre identité Pulse. Une autorisation Discord unique sera nécessaire lors de la première connexion.</p></div><div class="mks-card-foot"><span>Discord · OAuth à connecter</span><button type="button" class="mks-link-btn" disabled aria-disabled="true">Lier Discord →</button></div></article>
      </div>
      <article class="card mks-komo"><div><span>Komo</span><strong>Votre guide dans le Club</strong><p>Komo mettra ici en avant un challenge, un événement ou une rencontre cohérente avec votre trajectoire — sans transformer My KŌMØ en tableau de bord.</p></div><button type="button" class="secondary-button" data-route="profile">Gérer mon identité</button></article>
      <p class="mks-separation">My KŌMØ affiche votre identité sociale. Les résultats de santé restent dans Résultats / Trajectoire et les réglages personnels dans Profil.</p>
    </section>
  </div>`;
}

function bindMyKomo() {
  document.querySelector('[data-mykomo-club]')?.addEventListener('click', () => document.querySelector('#myKomoClub')?.scrollIntoView({ behavior:'smooth', block:'start' }));
  document.querySelector('[data-mykomo-club-focus]')?.addEventListener('click', () => document.querySelector('#myKomoClub')?.scrollIntoView({ behavior:'smooth', block:'start' }));
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
  await loadMemberData(force, route === 'path');

  if (route === 'results') setPage('MES TESTS', 'Réalisez vos tests.', renderTests());
  else if (route === 'path') {
    ensureMyKomoSocialStyle();
    setPage('MY KŌMØ', 'Votre profil KŌMØ.', renderMyKomo());
    bindMyKomo();
  }
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

window.KomoMyKomo = { refresh: () => scheduleRender(true), version:'4.0.0-social-profile' };
document.addEventListener('DOMContentLoaded', () => scheduleRender(false));
setTimeout(() => scheduleRender(false), 150);

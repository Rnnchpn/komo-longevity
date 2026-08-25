import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL = 'https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER_KEY = 'komo_pulse_remember';
const PROTOCOL_VERSION = 'mobility-check-v1';
const CONSENT_VERSION = 'pulse-self-tests-v1';

const STEP_KEYS = ['baseline','chair_stand','two_step','gait_4m','balance'];
const STEP_LABELS = {
  baseline: 'KŌMØ Check',
  chair_stand: 'Chair Stand · 30 s',
  two_step: 'Two-Step',
  gait_4m: 'Marche · 4 m',
  balance: 'Équilibre'
};

let assessment = null;
let user = null;
let busy = false;
let lastRenderKey = '';

function storage() {
  return localStorage.getItem(REMEMBER_KEY) === '1' ? localStorage : sessionStorage;
}

function sb() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { storage: storage(), persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
}

function escapeHtml(value='') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
}

function numberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clamp(value,min,max){ return Math.max(min,Math.min(max,value)); }

async function getUser() {
  if (user) return user;
  const client = sb();
  const { data: { session } } = await client.auth.getSession();
  user = session?.user || null;
  return user;
}

async function loadAssessment() {
  const currentUser = await getUser();
  if (!currentUser) return null;
  const client = sb();
  const { data, error } = await client
    .from('pulse_assessments')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('protocol_version', PROTOCOL_VERSION)
    .order('updated_at', { ascending:false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  assessment = data || null;
  return assessment;
}

async function ensureAssessment() {
  if (assessment?.id) return assessment;
  const currentUser = await getUser();
  if (!currentUser) throw new Error('Session introuvable.');
  const client = sb();
  const now = new Date().toISOString();
  const { data, error } = await client
    .from('pulse_assessments')
    .insert({
      user_id: currentUser.id,
      protocol_version: PROTOCOL_VERSION,
      status: 'in_progress',
      current_step: 0,
      responses: {},
      consent_version: CONSENT_VERSION,
      consent_at: now,
      updated_at: now
    })
    .select('*')
    .single();
  if (error) throw error;
  assessment = data;
  return assessment;
}

function responses() {
  return assessment?.responses && typeof assessment.responses === 'object' ? assessment.responses : {};
}

function isComplete(key) {
  return Boolean(responses()?.[key]?.completed_at);
}

function completedCount() {
  return STEP_KEYS.filter(isComplete).length;
}

function progressPct() {
  return Math.round((completedCount()/STEP_KEYS.length)*100);
}

function physicalTestsRestricted() {
  const safety = responses()?.baseline?.safety || {};
  return Object.values(safety).some(Boolean);
}

async function saveStep(key, payload) {
  if (busy) return;
  busy = true;
  try {
    await ensureAssessment();
    const current = responses();
    const nextResponses = {
      ...current,
      [key]: {
        ...current[key],
        ...payload,
        completed_at: new Date().toISOString()
      }
    };
    const count = STEP_KEYS.filter(step => Boolean(nextResponses?.[step]?.completed_at)).length;
    const currentStep = clamp(count + 1, 0, 7);
    const status = count === STEP_KEYS.length ? 'completed' : 'in_progress';
    const patch = {
      responses: nextResponses,
      current_step: currentStep,
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };
    const client = sb();
    const { data, error } = await client
      .from('pulse_assessments')
      .update(patch)
      .eq('id', assessment.id)
      .select('*')
      .single();
    if (error) throw error;
    assessment = data;
    closeDialog();
    renderTestsPage(true);
    showToast('Enregistré dans Pulse.');
  } catch (error) {
    console.error(error);
    showDialogError('Impossible d’enregistrer pour le moment. Réessayez dans quelques instants.');
  } finally {
    busy = false;
  }
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 2600);
}

function safetyNotice() {
  return `<div class="test-safety-note"><strong>À votre rythme.</strong><span>Si vous ne vous sentez pas stable ou si le mouvement provoque un symptôme inhabituel, gardez ce test pour votre rendez-vous KŌMØ.</span></div>`;
}

function statusText(key) {
  if (isComplete(key)) return 'Terminé';
  if (key !== 'baseline' && physicalTestsRestricted()) return 'Avec un professionnel';
  return key === 'baseline' ? 'À commencer' : 'À faire';
}

function cardValue(key) {
  const value = responses()?.[key];
  if (!value?.completed_at) return '';
  if (key === 'baseline') return 'Profil enregistré';
  if (key === 'chair_stand') return `${value.repetitions ?? '—'} répétitions`;
  if (key === 'two_step') return value.ratio ? `Ratio ${Number(value.ratio).toFixed(2)}` : 'Mesure enregistrée';
  if (key === 'gait_4m') return value.speed_m_s ? `${Number(value.speed_m_s).toFixed(2)} m/s` : 'Mesure enregistrée';
  if (key === 'balance') return `${value.left_s ?? '—'} s · ${value.right_s ?? '—'} s`;
  return '';
}

function testCard(key,index,title,body,meta) {
  const restricted = key !== 'baseline' && physicalTestsRestricted();
  const done = isComplete(key);
  const label = restricted ? 'À réaliser accompagné' : done ? 'Modifier' : 'Commencer';
  const value = cardValue(key);
  return `<article class="test-v1-card ${done?'is-done':''} ${restricted?'is-restricted':''}">
    <div class="test-v1-card-top"><span class="test-v1-index">${index}</span><span class="test-v1-status">${statusText(key)}</span></div>
    <div class="test-v1-card-copy"><h3>${title}</h3><p>${body}</p>${value?`<strong class="test-v1-value">${escapeHtml(value)}</strong>`:''}</div>
    <div class="test-v1-card-foot"><span>${meta}</span><button type="button" data-open-test="${key}" ${restricted?'disabled':''}>${label} →</button></div>
  </article>`;
}

function renderTestsMarkup() {
  const count = completedCount();
  const pct = progressPct();
  const restricted = physicalTestsRestricted();
  const assessmentStatus = assessment?.status === 'completed' ? 'Évaluation autonome terminée' : assessment ? 'Évaluation en cours' : 'Prêt à commencer';
  return `<div class="tests-v1-root">
    <section class="tests-v1-hero">
      <div class="tests-v1-hero-main">
        <p class="eyebrow">MES TESTS · KŌMØ PULSE</p>
        <h2>Mesurez ce que vous pouvez.<br><em>Le reste se fait ensemble.</em></h2>
        <p>Pulse vous guide dans les mesures réalisables seul. Les mesures instrumentées et l’interprétation clinique restent réalisées avec votre professionnel.</p>
        <div class="tests-v1-hero-actions"><button class="primary-button" type="button" data-open-test="${assessment ? STEP_KEYS.find(k=>!isComplete(k)) || 'baseline' : 'baseline'}">${assessment ? (pct===100?'Revoir mes mesures':'Continuer mes tests') : 'Commencer'} <span>→</span></button><span>${assessmentStatus}</span></div>
      </div>
      <aside class="tests-v1-progress-card">
        <div class="tests-v1-progress-top"><span>Progression</span><strong>${pct}%</strong></div>
        <div class="tests-v1-progress-track"><i style="width:${pct}%"></i></div>
        <div class="tests-v1-progress-meta"><strong>${count}/${STEP_KEYS.length}</strong><span>étapes personnelles complétées</span></div>
      </aside>
    </section>

    ${restricted?`<section class="tests-v1-guidance"><strong>Tests physiques accompagnés.</strong><span>D’après les éléments renseignés dans votre KŌMØ Check, gardez les tests physiques pour votre rendez-vous. Vos réponses sont bien conservées dans Pulse.</span></section>`:''}

    <section class="tests-v1-section-head"><div><p class="eyebrow">À FAIRE DANS PULSE</p><h3>Votre mesure personnelle.</h3></div><p>Aucune interprétation médicale n’est produite ici. Pulse enregistre d’abord vos données brutes pour construire une trajectoire fiable.</p></section>

    <div class="tests-v1-grid">
      ${testCard('baseline','01','KŌMØ Check','Votre contexte du jour, vos objectifs et les informations utiles avant les tests physiques.','3–5 min · chez vous')}
      ${testCard('chair_stand','02','Chair Stand · 30 s','Comptez le nombre de levers complets réalisés en trente secondes avec une chaise stable.','30 s · chaise stable')}
      ${testCard('two_step','03','Two-Step','Mesurez la distance parcourue en deux grands pas, puis Pulse calcule le ratio en fonction de votre taille.','2 pas · mètre ruban')}
      ${testCard('gait_4m','04','Marche · 4 m','Chronométrez quatre mètres de marche à allure habituelle. Pulse calcule simplement la vitesse brute.','4 m · chronomètre')}
      ${testCard('balance','05','Équilibre','Chronométrez un appui unipodal de chaque côté, jusqu’à trente secondes maximum.','2 × 30 s · support à proximité')}
    </div>

    <section class="tests-v1-section-head consultation"><div><p class="eyebrow">AVEC VOTRE PROFESSIONNEL</p><h3>Ce qui complète l’évaluation.</h3></div><p>Ces étapes ne sont pas simulées dans Pulse : elles sont acquises ou validées dans le cadre approprié puis intégrées à My KŌMØ.</p></section>
    <div class="tests-v1-consult-grid">
      <article><span>01</span><h4>Stand-Up standardisé</h4><p>Mesure standardisée du lever selon le protocole KŌMØ.</p><b>En consultation</b></article>
      <article><span>02</span><h4>KŌMØ Motion</h4><p>Marche et fonction musculaire instrumentées avec l’équipement KŌMØ / Myodev.</p><b>En consultation</b></article>
      <article><span>03</span><h4>KŌMØ Clinical</h4><p>Contexte clinique, posture et données complémentaires lorsqu’elles sont indiquées.</p><b>Avec votre professionnel</b></article>
    </div>
  </div>`;
}

async function renderTestsPage(force=false) {
  if (location.hash.replace(/^#/,'') !== 'results') return;
  const shell = document.querySelector('#appShell');
  const root = document.querySelector('#viewRoot');
  if (!shell || shell.hidden || !root) return;
  try {
    if (force || !assessment) await loadAssessment();
    const renderKey = `${assessment?.updated_at || 'none'}:${location.hash}`;
    if (!force && root.querySelector('.tests-v1-root') && renderKey === lastRenderKey) return;
    lastRenderKey = renderKey;
    document.querySelector('#pageEyebrow').textContent = 'MES TESTS';
    document.querySelector('#pageTitle').textContent = 'Votre évaluation, étape par étape.';
    root.innerHTML = renderTestsMarkup();
  } catch (error) {
    console.error(error);
    root.innerHTML = `<article class="card"><div class="empty-state">Impossible de charger vos tests pour le moment. Réessayez avec le bouton d’actualisation.</div></article>`;
  }
}

function ensureDialog() {
  let dialog = document.querySelector('#pulseTestDialog');
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.id = 'pulseTestDialog';
  dialog.className = 'pulse-test-dialog';
  dialog.innerHTML = `<div class="pulse-test-dialog-shell"><button type="button" class="pulse-test-close" data-close-test aria-label="Fermer">×</button><div id="pulseTestDialogBody"></div></div>`;
  document.body.appendChild(dialog);
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('[data-close-test]')) closeDialog();
  });
  return dialog;
}

function closeDialog() {
  const dialog = document.querySelector('#pulseTestDialog');
  if (dialog?.open) dialog.close();
}

function showDialog(html) {
  const dialog = ensureDialog();
  const body = dialog.querySelector('#pulseTestDialogBody');
  body.innerHTML = html;
  if (!dialog.open) dialog.showModal();
}

function showDialogError(message) {
  const target = document.querySelector('#testFormFeedback');
  if (target) target.textContent = message;
}

function option(value,label,selected='') { return `<option value="${value}" ${selected===value?'selected':''}>${label}</option>`; }
function checked(value){ return value ? 'checked' : ''; }

function baselineForm() {
  const b = responses()?.baseline || {};
  const safety = b.safety || {};
  return `<div class="test-form-head"><p class="eyebrow">01 · KŌMØ CHECK</p><h2>Votre contexte aujourd’hui.</h2><p>Ces informations servent à préparer les mesures et à savoir si les tests physiques à domicile sont adaptés aujourd’hui.</p></div>
    <form id="baselineTestForm" class="test-form-v1">
      <div class="test-form-grid two">
        <label><span>Taille</span><div class="input-with-unit"><input name="height_cm" type="number" min="100" max="230" step="1" value="${escapeHtml(b.height_cm ?? '')}" required><i>cm</i></div></label>
        <label><span>Poids</span><div class="input-with-unit"><input name="weight_kg" type="number" min="25" max="300" step="0.1" value="${escapeHtml(b.weight_kg ?? '')}" required><i>kg</i></div></label>
      </div>
      <label><span>Votre objectif principal</span><select name="goal" required><option value="">Choisir</option>${option('preserve_mobility','Préserver ma mobilité',b.goal)}${option('improve_performance','Améliorer mes capacités',b.goal)}${option('return_after_problem','Retrouver mes capacités après un problème',b.goal)}${option('track_change','Suivre mon évolution',b.goal)}${option('other','Autre',b.goal)}</select></label>
      <div class="test-form-grid two">
        <label><span>Inconfort ou douleur aujourd’hui</span><div class="input-with-unit"><input name="pain_intensity" type="number" min="0" max="10" step="1" value="${escapeHtml(b.pain_intensity ?? 0)}" required><i>/10</i></div></label>
        <label><span>Zone principale</span><input name="pain_zone" type="text" maxlength="120" value="${escapeHtml(b.pain_zone ?? '')}" placeholder="Ex. aucune, dos, genou…"></label>
      </div>
      <div class="test-form-grid two">
        <label><span>Chutes ces 12 derniers mois</span><select name="falls" required><option value="">Choisir</option>${option('none','Aucune',b.falls)}${option('one','Une',b.falls)}${option('two_plus','Deux ou plus',b.falls)}</select></label>
        <label><span>Aide habituelle à la marche</span><select name="walking_aid" required><option value="">Choisir</option>${option('none','Aucune',b.walking_aid)}${option('cane','Canne',b.walking_aid)}${option('walker','Déambulateur',b.walking_aid)}${option('other','Autre',b.walking_aid)}</select></label>
      </div>
      <div class="test-choice-row"><span>Instabilité debout ou à la marche</span><label><input type="radio" name="instability" value="no" ${b.instability===false?'checked':''} required>Non</label><label><input type="radio" name="instability" value="yes" ${b.instability===true?'checked':''}>Oui</label></div>
      <div class="test-choice-row"><span>Crainte de tomber</span><label><input type="radio" name="fear_fall" value="no" ${b.fear_fall===false?'checked':''} required>Non</label><label><input type="radio" name="fear_fall" value="yes" ${b.fear_fall===true?'checked':''}>Oui</label></div>
      <div class="test-choice-row"><span>Douleur ou fatigue inhabituellement forte aujourd’hui</span><label><input type="radio" name="unusual_symptoms" value="no" ${b.unusual_symptoms===false?'checked':''} required>Non</label><label><input type="radio" name="unusual_symptoms" value="yes" ${b.unusual_symptoms===true?'checked':''}>Oui</label></div>
      <fieldset class="safety-fieldset"><legend>Avant les tests physiques</legend><p>Si l’une de ces situations est présente aujourd’hui, Pulse conservera vos réponses et vous proposera de réaliser les tests physiques avec un professionnel.</p>
        <label><input type="checkbox" name="s01" ${checked(safety.s01)}>Faiblesse nouvelle ou qui s’aggrave.</label>
        <label><input type="checkbox" name="s02" ${checked(safety.s02)}>Trouble récent du contrôle urinaire ou intestinal, ou perte de sensibilité inhabituelle dans la zone périnéale.</label>
        <label><input type="checkbox" name="s03" ${checked(safety.s03)}>Fièvre importante, infection aiguë ou malaise aujourd’hui.</label>
        <label><input type="checkbox" name="s04" ${checked(safety.s04)}>Traumatisme récent avec douleur importante ou difficulté à prendre appui.</label>
        <label><input type="checkbox" name="s05" ${checked(safety.s05)}>Douleur thoracique, essoufflement inhabituel ou malaise à l’effort.</label>
      </fieldset>
      <label class="test-consent"><input type="checkbox" name="consent" required><span>J’ai compris que ces tests donnent des mesures de mobilité et ne remplacent pas une consultation ni une interprétation médicale.</span></label>
      <div class="test-form-actions"><button class="primary-button" type="submit">Enregistrer et continuer →</button></div><p id="testFormFeedback" class="test-form-feedback"></p>
    </form>`;
}

function chairStandForm() {
  const v = responses()?.chair_stand || {};
  return `<div class="test-form-head"><p class="eyebrow">02 · CHAIR STAND</p><h2>30 secondes.</h2><p>Utilisez une chaise stable, sans roulettes, posée contre un mur. Asseyez-vous au milieu de l’assise, pieds au sol. Comptez chaque lever complet réalisé en trente secondes.</p></div>${safetyNotice()}
    <form id="chairStandForm" class="test-form-v1 compact">
      <label class="test-consent"><input type="checkbox" name="ready" required><span>Je dispose d’une chaise stable et je me sens en mesure de réaliser ce test sans aide.</span></label>
      <label><span>Nombre de levers complets en 30 secondes</span><div class="input-with-unit"><input name="repetitions" type="number" min="0" max="80" step="1" value="${escapeHtml(v.repetitions ?? '')}" required><i>rép.</i></div></label>
      <div class="test-form-actions"><button class="primary-button" type="submit">Enregistrer →</button></div><p id="testFormFeedback" class="test-form-feedback"></p>
    </form>`;
}

function twoStepForm() {
  const v = responses()?.two_step || {};
  const height = responses()?.baseline?.height_cm || '';
  return `<div class="test-form-head"><p class="eyebrow">03 · TWO-STEP</p><h2>Deux grands pas.</h2><p>Sur un sol plat et dégagé, partez pieds joints. Faites deux pas aussi grands que possible sans perdre l’équilibre. Mesurez la distance totale entre la ligne de départ et l’avant du pied final.</p></div>${safetyNotice()}
    <form id="twoStepForm" class="test-form-v1 compact">
      <label class="test-consent"><input type="checkbox" name="ready" required><span>J’ai suffisamment d’espace et je me sens stable pour réaliser deux grands pas.</span></label>
      <div class="test-form-grid two"><label><span>Taille</span><div class="input-with-unit"><input name="height_cm" type="number" min="100" max="230" step="1" value="${escapeHtml(v.height_cm ?? height)}" required><i>cm</i></div></label><label><span>Distance en deux pas</span><div class="input-with-unit"><input name="distance_cm" type="number" min="20" max="500" step="0.5" value="${escapeHtml(v.distance_cm ?? '')}" required><i>cm</i></div></label></div>
      <p class="test-derived-preview" id="twoStepPreview">Pulse calculera le ratio distance / taille.</p>
      <div class="test-form-actions"><button class="primary-button" type="submit">Enregistrer →</button></div><p id="testFormFeedback" class="test-form-feedback"></p>
    </form>`;
}

function gaitForm() {
  const v = responses()?.gait_4m || {};
  return `<div class="test-form-head"><p class="eyebrow">04 · MARCHE 4 M</p><h2>Votre allure habituelle.</h2><p>Mesurez précisément quatre mètres sur un sol plat. Marchez à votre allure habituelle et chronométrez le temps nécessaire pour parcourir les quatre mètres.</p></div>${safetyNotice()}
    <form id="gaitForm" class="test-form-v1 compact">
      <label class="test-consent"><input type="checkbox" name="ready" required><span>Le passage est dégagé et je me sens en mesure de marcher quatre mètres en sécurité.</span></label>
      <label><span>Temps pour 4 mètres</span><div class="input-with-unit"><input name="time_s" type="number" min="1" max="120" step="0.01" value="${escapeHtml(v.time_s ?? '')}" required><i>s</i></div></label>
      <p class="test-derived-preview" id="gaitPreview">Pulse calculera la vitesse brute en m/s.</p>
      <div class="test-form-actions"><button class="primary-button" type="submit">Enregistrer →</button></div><p id="testFormFeedback" class="test-form-feedback"></p>
    </form>`;
}

function balanceForm() {
  const v = responses()?.balance || {};
  return `<div class="test-form-head"><p class="eyebrow">05 · ÉQUILIBRE</p><h2>Un côté, puis l’autre.</h2><p>Placez-vous près d’un support stable sans vous y appuyer. Levez un pied et chronométrez l’appui jusqu’à trente secondes maximum. Recommencez de l’autre côté.</p></div>${safetyNotice()}
    <form id="balanceForm" class="test-form-v1 compact">
      <label class="test-consent"><input type="checkbox" name="ready" required><span>Je dispose d’un support stable à proximité et je me sens en mesure de réaliser le test.</span></label>
      <div class="test-form-grid two"><label><span>Appui gauche</span><div class="input-with-unit"><input name="left_s" type="number" min="0" max="30" step="0.1" value="${escapeHtml(v.left_s ?? '')}" required><i>s</i></div></label><label><span>Appui droit</span><div class="input-with-unit"><input name="right_s" type="number" min="0" max="30" step="0.1" value="${escapeHtml(v.right_s ?? '')}" required><i>s</i></div></label></div>
      <div class="test-form-actions"><button class="primary-button" type="submit">Enregistrer →</button></div><p id="testFormFeedback" class="test-form-feedback"></p>
    </form>`;
}

function openTest(key) {
  if (key !== 'baseline' && physicalTestsRestricted()) {
    showToast('Ce test est à réaliser avec votre professionnel.');
    return;
  }
  const forms = { baseline: baselineForm, chair_stand: chairStandForm, two_step: twoStepForm, gait_4m: gaitForm, balance: balanceForm };
  const renderer = forms[key];
  if (!renderer) return;
  showDialog(renderer());
  bindDialogForm(key);
}

function bindDialogForm(key) {
  const body = document.querySelector('#pulseTestDialogBody');
  if (!body) return;
  if (key === 'baseline') {
    body.querySelector('#baselineTestForm')?.addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      saveStep('baseline', {
        height_cm: numberOrNull(form.get('height_cm')),
        weight_kg: numberOrNull(form.get('weight_kg')),
        goal: form.get('goal'),
        pain_intensity: numberOrNull(form.get('pain_intensity')),
        pain_zone: String(form.get('pain_zone') || '').trim(),
        falls: form.get('falls'),
        walking_aid: form.get('walking_aid'),
        instability: form.get('instability') === 'yes',
        fear_fall: form.get('fear_fall') === 'yes',
        unusual_symptoms: form.get('unusual_symptoms') === 'yes',
        safety: { s01:form.has('s01'), s02:form.has('s02'), s03:form.has('s03'), s04:form.has('s04'), s05:form.has('s05') },
        source: 'patient'
      });
    });
  }
  if (key === 'chair_stand') {
    body.querySelector('#chairStandForm')?.addEventListener('submit', event => {
      event.preventDefault(); const form = new FormData(event.currentTarget);
      saveStep('chair_stand', { repetitions:numberOrNull(form.get('repetitions')), duration_s:30, indicator_code:'M-FUN-04', source:'patient' });
    });
  }
  if (key === 'two_step') {
    const formEl = body.querySelector('#twoStepForm');
    const preview = body.querySelector('#twoStepPreview');
    const refresh = () => { const f=new FormData(formEl); const h=numberOrNull(f.get('height_cm')); const d=numberOrNull(f.get('distance_cm')); preview.textContent=h&&d?`Ratio brut : ${(d/h).toFixed(2)}`:'Pulse calculera le ratio distance / taille.'; };
    formEl?.addEventListener('input',refresh); refresh();
    formEl?.addEventListener('submit', event => {
      event.preventDefault(); const form=new FormData(event.currentTarget); const h=numberOrNull(form.get('height_cm')); const d=numberOrNull(form.get('distance_cm'));
      saveStep('two_step',{height_cm:h,distance_cm:d,ratio:h&&d?Number((d/h).toFixed(4)):null,indicator_code:'M-FUN-03',source:'patient'});
    });
  }
  if (key === 'gait_4m') {
    const formEl=body.querySelector('#gaitForm'); const preview=body.querySelector('#gaitPreview');
    const refresh=()=>{const f=new FormData(formEl);const t=numberOrNull(f.get('time_s'));preview.textContent=t?`Vitesse brute : ${(4/t).toFixed(2)} m/s`:'Pulse calculera la vitesse brute en m/s.';};
    formEl?.addEventListener('input',refresh); refresh();
    formEl?.addEventListener('submit',event=>{event.preventDefault();const form=new FormData(event.currentTarget);const t=numberOrNull(form.get('time_s'));saveStep('gait_4m',{distance_m:4,time_s:t,speed_m_s:t?Number((4/t).toFixed(4)):null,indicator_code:'M-FUN-05',source:'patient'});});
  }
  if (key === 'balance') {
    body.querySelector('#balanceForm')?.addEventListener('submit',event=>{event.preventDefault();const form=new FormData(event.currentTarget);saveStep('balance',{left_s:numberOrNull(form.get('left_s')),right_s:numberOrNull(form.get('right_s')),indicator_codes:['M-FUN-06','M-FUN-07'],source:'patient'});});
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-open-test]');
  if (button) openTest(button.dataset.openTest);
});

window.addEventListener('hashchange', () => setTimeout(() => renderTestsPage(true), 180));

document.addEventListener('click', event => {
  if (event.target.closest('#refreshButton')) setTimeout(() => renderTestsPage(true), 350);
});

const observer = new MutationObserver(() => {
  if (location.hash.replace(/^#/,'') !== 'results') return;
  const root = document.querySelector('#viewRoot');
  if (!root || root.querySelector('.tests-v1-root')) return;
  setTimeout(() => renderTestsPage(false), 80);
});
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});

document.addEventListener('DOMContentLoaded', () => setTimeout(() => renderTestsPage(true), 500));

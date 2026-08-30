(() => {
  'use strict';

  const VERSION = 'patient-home-final-v1.0.0';
  const ROUTE = 'home';
  let queued = false;
  let running = false;
  let lastSignature = '';
  let canonicalModulePromise = null;

  const route = () => location.hash.replace(/^#/, '') || 'home';
  const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));
  const num = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
  const normalizeKey = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  function installStyles() {
    if (document.querySelector('#patientHomeFinalV1Style')) return;
    const style = document.createElement('style');
    style.id = 'patientHomeFinalV1Style';
    style.textContent = `
      body.khf-active{--khf-ink:#1e241f;--khf-muted:#777b73;--khf-line:rgba(31,39,33,.10);--khf-sage:#6f806f;--khf-sage-soft:#e7ebe4;--khf-ivory:#f7f4ee;--khf-paper:#fcfbf8;--khf-dark:#202720;}
      body.khf-active .topbar{padding:24px 0 16px;background:linear-gradient(to bottom,var(--bg) 78%,rgba(244,241,235,0));align-items:center}
      body.khf-active .topbar .eyebrow{margin:0 0 4px;font-size:8px;letter-spacing:.18em;color:#7c857c}
      body.khf-active .topbar h1{font-size:18px;letter-spacing:-.035em;font-weight:520;color:#323a33}
      body.khf-active .view-root[data-khf-home-final="1"]{max-width:1280px}
      body.khf-active .view-root[data-khf-home-final="1"]>:not(.khf){display:none!important}
      .khf{display:grid;gap:16px;color:var(--khf-ink);padding-bottom:34px}
      .khf *{box-sizing:border-box}
      .khf button{font:inherit}
      .khf-greeting{display:flex;justify-content:space-between;align-items:end;gap:20px;padding:7px 2px 2px}
      .khf-greeting h2{margin:0;font:520 clamp(22px,2.3vw,32px)/1.06 Manrope,DM Sans,sans-serif;letter-spacing:-.045em}
      .khf-greeting p{margin:7px 0 0;color:var(--khf-muted);font-size:11px;line-height:1.45}
      .khf-date{font-size:9px;color:#92968e;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}

      .khf-hero{display:grid;grid-template-columns:minmax(0,1.32fr) minmax(310px,.68fr);gap:12px}
      .khf-age,.khf-score,.khf-panel{border:1px solid var(--khf-line);background:var(--khf-paper);border-radius:28px;overflow:hidden;position:relative}
      .khf-age{min-height:410px;padding:clamp(28px,4vw,54px);background:radial-gradient(55% 80% at 96% 5%,rgba(151,168,151,.20),rgba(151,168,151,0) 66%),linear-gradient(145deg,#fbfaf6 0%,#efede6 100%);display:flex;flex-direction:column;justify-content:space-between}
      .khf-age::after{content:"";position:absolute;width:380px;height:380px;border:1px solid rgba(39,49,41,.055);border-radius:50%;right:-150px;bottom:-210px;pointer-events:none}
      .khf-kicker{font-size:8px;font-weight:750;letter-spacing:.16em;text-transform:uppercase;color:#768177}
      .khf-age-value{margin:9px 0 0;font:500 clamp(94px,12vw,172px)/.78 Manrope,DM Sans,sans-serif;letter-spacing:-.085em;color:#222a23}
      .khf-age-value small{font-size:18px;letter-spacing:-.02em;color:#6e786f;margin-left:5px}
      .khf-age-delta{display:inline-flex;align-items:center;gap:7px;margin-top:21px;padding:7px 10px;border:1px solid rgba(52,71,58,.10);border-radius:999px;background:rgba(255,255,255,.56);font-size:10px;font-weight:650;color:#465649;width:max-content;max-width:100%}
      .khf-age-delta i{width:6px;height:6px;border-radius:50%;background:#758976;display:block}
      .khf-age-copy{max-width:610px;margin:0;font-size:13px;line-height:1.65;color:#606860;position:relative;z-index:1}
      .khf-age-copy strong{color:#344039;font-weight:600}
      .khf-age-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:15px}
      .khf-meta-pill{font-size:7.5px;color:#737b74;border:1px solid rgba(36,47,39,.08);border-radius:999px;padding:6px 8px;background:rgba(255,255,255,.50)}

      .khf-score{min-height:410px;padding:30px;display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(155deg,#232b24 0%,#1c221d 100%);color:#f8f7f1;border-color:rgba(255,255,255,.04)}
      .khf-score .khf-kicker{color:rgba(245,244,237,.52)}
      .khf-score-value{font:500 clamp(78px,9vw,126px)/.82 Manrope,DM Sans,sans-serif;letter-spacing:-.08em;margin:17px 0 0}
      .khf-score-value small{font-size:14px;letter-spacing:0;color:rgba(255,255,255,.42);margin-left:4px}
      .khf-score-status{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:20px;padding-top:15px;border-top:1px solid rgba(255,255,255,.10)}
      .khf-score-status strong{font-size:12px;font-weight:600}
      .khf-score-status span{font-size:8px;color:rgba(255,255,255,.54)}
      .khf-score-delta{font-size:10px!important;color:#c9d7ca!important;font-weight:650}
      .khf-score-note{font-size:9px;line-height:1.5;color:rgba(255,255,255,.52);margin:0}
      .khf-score-badge{display:inline-flex;width:max-content;margin-top:10px;padding:6px 8px;border-radius:999px;background:rgba(255,255,255,.08);font-size:7px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.65)}

      .khf-section{display:grid;gap:10px}
      .khf-section-head{display:flex;align-items:end;justify-content:space-between;gap:18px;padding:8px 3px 0}
      .khf-section-head h3{margin:0;font:560 18px/1.1 Manrope,DM Sans,sans-serif;letter-spacing:-.035em}
      .khf-section-head p{margin:5px 0 0;color:var(--khf-muted);font-size:9px;line-height:1.45}
      .khf-link{border:0;background:transparent;color:#606b62;font-size:9px;font-weight:650;cursor:pointer;padding:5px 0}

      .khf-dimensions{padding:8px 24px 10px}
      .khf-dimension{display:grid;grid-template-columns:122px minmax(120px,1fr) 84px;gap:16px;align-items:center;min-height:66px;border-top:1px solid var(--khf-line)}
      .khf-dimension:first-child{border-top:0}
      .khf-dim-name strong{display:block;font-size:12px;font-weight:570;letter-spacing:-.015em}
      .khf-dim-name small{display:block;margin-top:3px;color:#8a8e87;font-size:7.5px}
      .khf-track{height:4px;border-radius:999px;background:#ebe9e2;overflow:hidden;position:relative}
      .khf-track i{display:block;height:100%;width:var(--value,0%);border-radius:inherit;background:#687a69;transition:width .45s ease}
      .khf-dimension.missing .khf-track i{width:0!important}
      .khf-dimension.partial .khf-track i{background:#899789}
      .khf-dim-value{text-align:right}
      .khf-dim-value strong{font:540 20px/1 Manrope,DM Sans,sans-serif;letter-spacing:-.045em}
      .khf-dim-value span{display:block;margin-top:4px;color:#8b9089;font-size:7px}
      .khf-dimension.missing .khf-dim-value strong{font-size:9px;letter-spacing:0;color:#9a9e97;font-weight:550}

      .khf-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:12px}
      .khf-panel{padding:25px;min-height:210px}
      .khf-panel-dark{background:linear-gradient(145deg,#e9eee8,#f5f3ed)}
      .khf-panel-label{font-size:7.5px;font-weight:750;letter-spacing:.14em;text-transform:uppercase;color:#738076}
      .khf-priority-title{margin:35px 0 8px;font:560 clamp(22px,2.8vw,36px)/1.03 Manrope,DM Sans,sans-serif;letter-spacing:-.05em;max-width:530px}
      .khf-priority-copy{margin:0;color:#6f7770;font-size:10px;line-height:1.55;max-width:540px}
      .khf-priority-foot{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-top:27px;padding-top:14px;border-top:1px solid var(--khf-line)}
      .khf-priority-foot span{font-size:8px;color:#7e867f}
      .khf-button{min-height:40px;border:1px solid rgba(31,40,34,.11);border-radius:12px;background:#252d26;color:#fff;padding:0 15px;display:inline-flex;align-items:center;justify-content:center;gap:10px;font-size:9px;font-weight:650;cursor:pointer}
      .khf-button.secondary{background:transparent;color:#445048}

      .khf-trajectory{display:flex;flex-direction:column;justify-content:space-between}
      .khf-trend-big{margin-top:12px;font:520 33px/1 Manrope,DM Sans,sans-serif;letter-spacing:-.055em}
      .khf-trend-big small{font-size:10px;letter-spacing:0;color:#7e857f;margin-left:4px}
      .khf-trend-copy{margin:6px 0 0;color:#727a73;font-size:9px;line-height:1.45}
      .khf-chart{margin-top:12px;width:100%;height:105px;display:block;overflow:visible}
      .khf-chart-grid{stroke:rgba(38,49,41,.08);stroke-width:1}
      .khf-chart-line{fill:none;stroke:#647766;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      .khf-chart-dot{fill:#fbfaf6;stroke:#647766;stroke-width:2}
      .khf-chart-label{font:7px DM Sans,sans-serif;fill:#8b918a}
      .khf-baseline{margin-top:21px;padding:18px;border:1px solid var(--khf-line);border-radius:18px;background:#f6f4ee;display:flex;align-items:center;justify-content:space-between;gap:18px}
      .khf-baseline strong{font:520 42px/.9 Manrope,sans-serif;letter-spacing:-.065em}
      .khf-baseline span{font-size:8px;color:#7d857e;line-height:1.4;max-width:170px;text-align:right}

      .khf-bottom{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .khf-compact{display:flex;flex-direction:column;justify-content:space-between;min-height:165px}
      .khf-compact h4{margin:22px 0 6px;font:550 19px/1.05 Manrope,sans-serif;letter-spacing:-.035em}
      .khf-compact p{margin:0;color:#737b74;font-size:9px;line-height:1.5}
      .khf-compact-foot{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-top:19px}
      .khf-compact-foot strong{font-size:11px;font-weight:600}
      .khf-progress{height:4px;background:#ebe8e0;border-radius:999px;overflow:hidden;margin-top:13px}.khf-progress i{display:block;height:100%;width:var(--p);background:#6d806f;border-radius:inherit}
      .khf-disclaimer{padding:4px 3px 0;color:#92968f;font-size:7.5px;line-height:1.5}
      .khf-disclaimer strong{color:#777f78;font-weight:600}

      @media(max-width:980px){
        .khf-hero{grid-template-columns:1fr}.khf-age,.khf-score{min-height:340px}.khf-score{min-height:300px}.khf-grid,.khf-bottom{grid-template-columns:1fr}
      }
      @media(max-width:760px){
        body.khf-active .main-shell{padding-bottom:104px}
        body.khf-active .topbar{padding:15px 0 9px;position:relative;background:transparent}
        body.khf-active .topbar h1{font-size:15px}
        body.khf-active .topbar .eyebrow{display:none}
        .khf{gap:11px;padding-bottom:16px}
        .khf-greeting{padding:2px 1px 6px}.khf-greeting h2{font-size:22px}.khf-greeting p{font-size:9px}.khf-date{font-size:7px}
        .khf-age,.khf-score,.khf-panel{border-radius:22px}
        .khf-age{min-height:350px;padding:25px}.khf-age-value{font-size:112px}.khf-age-copy{font-size:11px;line-height:1.55}
        .khf-score{min-height:250px;padding:24px}.khf-score-value{font-size:91px}
        .khf-section-head{padding:7px 2px 0}.khf-section-head h3{font-size:16px}
        .khf-dimensions{padding:5px 17px 8px}.khf-dimension{grid-template-columns:94px 1fr 68px;gap:10px;min-height:60px}.khf-dim-name strong{font-size:11px}.khf-dim-name small{font-size:6.8px}.khf-dim-value strong{font-size:18px}
        .khf-panel{padding:20px;min-height:190px}.khf-priority-title{margin-top:26px;font-size:26px}.khf-priority-foot{align-items:end}
        .khf-button{min-height:38px;padding:0 13px}
        .khf-disclaimer{font-size:7px}
      }
      @media(max-width:430px){
        .khf-greeting{align-items:start}.khf-date{padding-top:3px}.khf-age{min-height:335px}.khf-age-value{font-size:101px}.khf-age-delta{font-size:9px}.khf-age-meta{gap:5px}.khf-meta-pill{font-size:6.8px}.khf-score{min-height:238px}
        .khf-dimension{grid-template-columns:82px 1fr 58px;gap:8px}.khf-dim-name small{display:none}.khf-dim-value span{font-size:6.5px}.khf-priority-foot{flex-direction:column;align-items:stretch}.khf-priority-foot span{text-align:left}.khf-button{width:100%}
      }
      @media(prefers-reduced-motion:reduce){.khf-track i{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function localDate(date = new Date()) {
    try {
      return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
    } catch {
      return '';
    }
  }

  function shortDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    try { return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(d); }
    catch { return '—'; }
  }

  function monthLabel(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    try { return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(d); }
    catch { return ''; }
  }

  function addMonths(value, months) {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const out = new Date(d);
    out.setMonth(out.getMonth() + months);
    return out;
  }

  function firstName(result) {
    const p = result?.dossier?.patient || {};
    const name = p.preferred_name || p.first_name || '';
    if (name) return String(name).trim().split(/\s+/)[0];
    const account = document.querySelector('#accountName')?.textContent?.trim() || '';
    return account && account !== 'Compte KŌMØ' ? account.split(/\s+/)[0] : '';
  }

  function scoreLabel(score) {
    if (score === null) return 'À établir';
    if (score >= 80) return 'Strong';
    if (score >= 65) return 'Stable';
    return 'Opportunity';
  }

  function releaseLabel(status) {
    const s = normalizeKey(status);
    if (['released', 'published', 'validated'].includes(s)) return 'Validé';
    if (['review', 'in_review', 'reviewed'].includes(s)) return 'En revue';
    if (['draft', 'calculated'].includes(s)) return 'En validation';
    return status ? String(status).replace(/_/g, ' ') : 'Calcul en cours';
  }

  function ageDelta(age) {
    if (!age || age.status !== 'available' || age.deltaYears === null || age.deltaYears === undefined) return '';
    const d = Math.round(Number(age.deltaYears));
    if (!Number.isFinite(d)) return '';
    if (d === 0) return 'Proche de votre âge chronologique';
    if (d < 0) return `${Math.abs(d)} ${Math.abs(d) > 1 ? 'ans' : 'an'} plus jeune que votre âge chronologique`;
    return `${d} ${d > 1 ? 'ans' : 'an'} au-dessus de votre âge chronologique`;
  }

  function domainLookup(domains, keys) {
    const source = domains && typeof domains === 'object' ? domains : {};
    const entries = Object.entries(source).map(([k, v]) => [normalizeKey(k), num(v)]);
    for (const key of keys) {
      const exact = entries.find(([k, v]) => k === normalizeKey(key) && v !== null);
      if (exact) return exact[1];
    }
    return null;
  }

  function dimensionRows(score) {
    const domains = score?.domain_scores || {};
    const directMuscle = domainLookup(domains, ['muscle', 'muscle_function', 'muscular', 'muscle_score']);
    const symmetry = domainLookup(domains, ['myocare_symmetry', 'muscle_symmetry', 'symmetry']);
    const items = [
      { label: 'Mobility', note: 'Tests fonctionnels', value: domainLookup(domains, ['mobility', 'functional_mobility', 'mobility_score']) },
      { label: 'Muscle', note: directMuscle !== null ? 'Fonction musculaire' : symmetry !== null ? 'Symétrie MyoCare · partiel' : 'Fonction musculaire', value: directMuscle ?? symmetry, partial: directMuscle === null && symmetry !== null },
      { label: 'Gait', note: 'Marche & dynamique', value: domainLookup(domains, ['gait', 'walking', 'gait_quality', 'gait_score']) },
      { label: 'Posture', note: 'Alignement & équilibre', value: domainLookup(domains, ['posture', 'postural', 'sagittal_posture', 'posture_score']) },
      { label: 'Function', note: 'Capacité fonctionnelle', value: domainLookup(domains, ['function', 'functional', 'functional_capacity', 'capacity', 'function_score']) }
    ];
    return items.map((item) => {
      const value = num(item.value);
      const missing = value === null;
      return `<div class="khf-dimension ${missing ? 'missing' : ''} ${item.partial ? 'partial' : ''}">
        <div class="khf-dim-name"><strong>${esc(item.label)}</strong><small>${esc(item.note)}</small></div>
        <div class="khf-track" style="--value:${missing ? 0 : clamp(value)}%"><i></i></div>
        <div class="khf-dim-value">${missing ? '<strong>À mesurer</strong><span>—</span>' : `<strong>${Math.round(value)}</strong><span>${item.partial ? 'partiel' : '/ 100'}</span>`}</div>
      </div>`;
    }).join('');
  }

  function chart(points) {
    if (!Array.isArray(points) || points.length < 2) return '';
    const width = 560, height = 105, px = 14, py = 13;
    const data = points.slice(-6);
    const usableW = width - (px * 2), usableH = height - (py * 2);
    const coords = data.map((p, i) => {
      const x = px + (data.length === 1 ? usableW / 2 : (i / (data.length - 1)) * usableW);
      const y = py + (1 - clamp(p.score) / 100) * usableH;
      return { ...p, x, y };
    });
    const d = coords.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    return `<svg class="khf-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Évolution du Motion Score">
      <line class="khf-chart-grid" x1="${px}" y1="${height - py}" x2="${width - px}" y2="${height - py}"></line>
      <path class="khf-chart-line" d="${d}"></path>
      ${coords.map((p) => `<circle class="khf-chart-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"></circle>`).join('')}
      <text class="khf-chart-label" x="${coords[0].x}" y="${height - 1}" text-anchor="start">${esc(monthLabel(coords[0].date))}</text>
      <text class="khf-chart-label" x="${coords[coords.length - 1].x}" y="${height - 1}" text-anchor="end">${esc(monthLabel(coords[coords.length - 1].date))}</text>
    </svg>`;
  }

  async function canonicalModule() {
    if (!canonicalModulePromise) canonicalModulePromise = import('./canonical-result-runtime.js');
    return canonicalModulePromise;
  }

  async function loadSupport(result) {
    const mod = await canonicalModule();
    const client = mod.getCanonicalClient();
    const patientId = result?.patientId;
    const assessmentId = result?.dossier?.motion?.id || result?.identity?.assessmentId || null;
    const support = { priorities: [], documents: [], history: [], nextAppointment: null };
    if (!client || !patientId) return support;

    const now = new Date();
    const appointments = Array.isArray(result?.dossier?.appointments) ? result.dossier.appointments : [];
    support.nextAppointment = appointments
      .filter((a) => a?.scheduled_start && new Date(a.scheduled_start) > now && !['cancelled', 'completed', 'no_show'].includes(String(a.status || '').toLowerCase()))
      .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start))[0] || null;

    const calls = [];
    if (assessmentId) {
      calls.push(client.from('priorities').select('rank,category,patient_wording,clinical_wording,validation_status,created_at').eq('assessment_id', assessmentId).order('rank', { ascending: true }).then((r) => { if (!r.error) support.priorities = r.data || []; }));
      calls.push(client.from('assessment_documents').select('file_name,document_type,verification_status,source_date,created_at').eq('assessment_id', assessmentId).order('created_at', { ascending: false }).limit(8).then((r) => { if (!r.error) support.documents = r.data || []; }));
    }

    calls.push((async () => {
      const assessments = await client.from('assessments').select('id,completed_at,released_at,created_at,status').eq('patient_id', patientId).order('created_at', { ascending: true }).limit(24);
      if (assessments.error || !assessments.data?.length) return;
      const ids = assessments.data.map((a) => a.id).filter(Boolean);
      if (!ids.length) return;
      const scores = await client.from('scores').select('assessment_id,motion_score,calculated_at,release_status,status').in('assessment_id', ids).order('calculated_at', { ascending: true });
      if (scores.error || !scores.data?.length) return;
      const latestPerAssessment = new Map();
      for (const row of scores.data) {
        if (num(row.motion_score) === null) continue;
        latestPerAssessment.set(row.assessment_id, row);
      }
      const assessmentById = Object.fromEntries(assessments.data.map((a) => [a.id, a]));
      support.history = [...latestPerAssessment.values()].map((row) => ({
        score: num(row.motion_score),
        date: row.calculated_at || assessmentById[row.assessment_id]?.completed_at || assessmentById[row.assessment_id]?.created_at,
        assessmentId: row.assessment_id
      })).filter((p) => p.score !== null && p.date).sort((a, b) => new Date(a.date) - new Date(b.date));
    })());

    await Promise.allSettled(calls);
    return support;
  }

  function renderPriority(support) {
    const validatedStates = new Set(['validated', 'approved', 'released', 'published']);
    const all = support?.priorities || [];
    const priority = all.find((p) => validatedStates.has(normalizeKey(p.validation_status))) || (all.length === 1 && !pHasStatus(all[0]) ? all[0] : null);
    if (!priority) {
      return `<article class="khf-panel khf-panel-dark">
        <span class="khf-panel-label">VOTRE PRIORITÉ</span>
        <h3 class="khf-priority-title">Une priorité claire, après validation.</h3>
        <p class="khf-priority-copy">Pulse affichera ici le principal levier de progression retenu à partir de votre bilan — sans multiplier les recommandations.</p>
        <div class="khf-priority-foot"><span>Interprétation clinique requise</span><button class="khf-button" type="button" data-route="results">Voir mes résultats <span aria-hidden="true">→</span></button></div>
      </article>`;
    }
    const title = priority.patient_wording || priority.clinical_wording || priority.category || 'Priorité KŌMØ';
    const category = priority.category ? String(priority.category).replace(/_/g, ' ') : 'Plan KŌMØ';
    return `<article class="khf-panel khf-panel-dark">
      <span class="khf-panel-label">VOTRE PRIORITÉ · ${esc(category)}</span>
      <h3 class="khf-priority-title">${esc(title)}</h3>
      <p class="khf-priority-copy">Une priorité mise en avant aujourd’hui. Les autres éléments restent accessibles dans votre plan et vos résultats.</p>
      <div class="khf-priority-foot"><span>Priorité ${esc(priority.rank || 1)} · validée</span><button class="khf-button" type="button" data-route="path">Voir mon plan <span aria-hidden="true">→</span></button></div>
    </article>`;
  }

  function pHasStatus(p) {
    return Boolean(p && p.validation_status);
  }

  function renderTrajectory(support, currentScore) {
    let history = Array.isArray(support?.history) ? [...support.history] : [];
    if (currentScore !== null && !history.some((p) => Math.round(p.score) === Math.round(currentScore))) {
      history.push({ score: currentScore, date: new Date().toISOString(), assessmentId: 'current' });
    }
    history = history.filter((p) => num(p.score) !== null && p.date).sort((a, b) => new Date(a.date) - new Date(b.date));
    if (history.length >= 2) {
      const first = history[0], last = history[history.length - 1];
      const delta = Math.round(last.score - first.score);
      return `<article class="khf-panel khf-trajectory">
        <div><span class="khf-panel-label">VOTRE TRAJECTOIRE</span><div class="khf-trend-big">${delta > 0 ? '+' : ''}${delta}<small>points</small></div><p class="khf-trend-copy">${delta > 0 ? 'Votre Motion Score progresse entre deux évaluations.' : delta < 0 ? 'Votre trajectoire mérite d’être relue dans son contexte.' : 'Votre Motion Score reste stable entre deux évaluations.'}</p></div>
        ${chart(history)}
        <button class="khf-link" type="button" data-route="path">Voir toute ma progression →</button>
      </article>`;
    }
    if (history.length === 1) {
      return `<article class="khf-panel khf-trajectory">
        <div><span class="khf-panel-label">VOTRE TRAJECTOIRE</span><div class="khf-trend-big">Baseline</div><p class="khf-trend-copy">Votre première référence est enregistrée. La trajectoire apparaîtra à partir de la prochaine évaluation comparable.</p></div>
        <div class="khf-baseline"><strong>${Math.round(history[0].score)}</strong><span>Motion Score de référence<br>${esc(shortDate(history[0].date))}</span></div>
        <button class="khf-link" type="button" data-route="path">Voir ma progression →</button>
      </article>`;
    }
    return `<article class="khf-panel khf-trajectory">
      <div><span class="khf-panel-label">VOTRE TRAJECTOIRE</span><div class="khf-trend-big">À construire</div><p class="khf-trend-copy">Votre trajectoire prendra forme dès qu’une première évaluation exploitable sera disponible.</p></div>
      <button class="khf-link" type="button" data-route="path">Voir mon parcours →</button>
    </article>`;
  }

  function renderAssessment(result, support) {
    const motion = result?.dossier?.motion || null;
    const completeness = num(result?.score?.completeness ?? motion?.completeness);
    const appointment = support?.nextAppointment;
    const completed = motion?.completed_at || motion?.released_at || result?.score?.calculated_at || null;
    let headline = 'Votre prochain assessment';
    let copy = 'Préparez votre prochaine mesure lorsque votre équipe KŌMØ vous l’indique.';
    let foot = 'Assessment KŌMØ';
    if (appointment?.scheduled_start) {
      headline = shortDate(appointment.scheduled_start);
      copy = 'Votre prochain rendez-vous KŌMØ est planifié.';
      foot = String(appointment.appointment_type || 'assessment').replace(/_/g, ' ');
    } else if (completeness !== null && completeness < 100) {
      headline = `${Math.round(completeness)}% complété`;
      copy = 'Votre assessment est en cours. Les résultats se consolident à mesure que les données validées arrivent.';
      foot = 'Assessment en cours';
    } else if (completed) {
      const recommended = addMonths(completed, 12);
      headline = recommended ? shortDate(recommended) : 'Dans 12 mois';
      copy = 'Fenêtre de réévaluation annuelle recommandée pour comparer une trajectoire homogène.';
      foot = `Dernier bilan · ${shortDate(completed)}`;
    }
    return `<article class="khf-panel khf-compact">
      <div><span class="khf-panel-label">NEXT ASSESSMENT</span><h4>${esc(headline)}</h4><p>${esc(copy)}</p>${completeness !== null && completeness < 100 ? `<div class="khf-progress" style="--p:${clamp(completeness)}%"><i></i></div>` : ''}</div>
      <div class="khf-compact-foot"><strong>${esc(foot)}</strong><button class="khf-link" type="button" data-route="path">Voir →</button></div>
    </article>`;
  }

  function renderReport(support) {
    const docs = Array.isArray(support?.documents) ? support.documents : [];
    const report = docs.find((d) => ['clinical_report', 'report', 'result_report'].includes(normalizeKey(d.document_type))) || docs[0] || null;
    if (!report) {
      return `<article class="khf-panel khf-compact">
        <div><span class="khf-panel-label">YOUR REPORT</span><h4>Rapport en préparation</h4><p>Votre restitution PDF apparaîtra ici lorsqu’elle aura été générée et mise à disposition.</p></div>
        <div class="khf-compact-foot"><strong>Pulse reste la version vivante du bilan.</strong><button class="khf-link" type="button" data-route="documents">Documents →</button></div>
      </article>`;
    }
    return `<article class="khf-panel khf-compact">
      <div><span class="khf-panel-label">YOUR REPORT</span><h4>${esc(report.file_name || 'Rapport KŌMØ')}</h4><p>${esc(shortDate(report.source_date || report.created_at))} · ${esc(report.verification_status ? String(report.verification_status).replace(/_/g, ' ') : 'disponible')}</p></div>
      <div class="khf-compact-foot"><strong>Votre restitution.</strong><button class="khf-link" type="button" data-route="documents">Voir le rapport →</button></div>
    </article>`;
  }

  function renderHome(result, support) {
    const root = document.querySelector('#viewRoot');
    if (!root || route() !== ROUTE) return;
    const score = num(result?.score?.motion_score);
    const age = result?.locomotorAge || null;
    const ageAvailable = age?.status === 'available' && num(age.age) !== null;
    const name = firstName(result);
    const first = name ? `Bonjour, ${esc(name)}.` : 'Bonjour.';
    const ageValue = ageAvailable ? Math.round(Number(age.age)) : '—';
    const delta = ageDelta(age);
    const scoreState = releaseLabel(result?.score?.release_status || result?.score?.status);
    const history = support?.history || [];
    const previous = history.length >= 2 ? history[history.length - 2] : null;
    const scoreDelta = score !== null && previous?.score !== null && previous?.score !== undefined ? Math.round(score - Number(previous.score)) : null;
    const ageCopy = ageAvailable
      ? `Votre Motion Age est une <strong>estimation de performance fonctionnelle</strong> construite à partir de tests standardisés. Il situe votre profil locomoteur par rapport à une population de référence.`
      : `Votre Motion Age apparaîtra lorsque les tests fonctionnels nécessaires seront disponibles et suffisamment concordants.`;

    document.body.classList.add('khf-active');
    root.dataset.khfHomeFinal = '1';
    const eyebrow = document.querySelector('#pageEyebrow');
    const title = document.querySelector('#pageTitle');
    if (eyebrow) eyebrow.textContent = 'KŌMØ PULSE';
    if (title) title.textContent = 'Aujourd’hui';

    root.innerHTML = `<section class="khf" data-khf data-khf-version="${VERSION}">
      <header class="khf-greeting">
        <div><h2>${first}</h2><p>Votre mouvement, votre trajectoire, votre prochaine priorité.</p></div>
        <div class="khf-date">${esc(localDate())}</div>
      </header>

      <section class="khf-hero" aria-label="Synthèse KŌMØ">
        <article class="khf-age">
          <div>
            <span class="khf-kicker">MOTION AGE</span>
            <div class="khf-age-value">${esc(ageValue)}${ageAvailable ? '<small>ans</small>' : ''}</div>
            ${delta ? `<div class="khf-age-delta"><i></i><span>${esc(delta)}</span></div>` : ''}
          </div>
          <div>
            <p class="khf-age-copy">${ageCopy}</p>
            <div class="khf-age-meta">
              ${age?.chronologicalAge !== null && age?.chronologicalAge !== undefined ? `<span class="khf-meta-pill">Âge chronologique · ${esc(age.chronologicalAge)} ans</span>` : ''}
              ${ageAvailable && Array.isArray(age.interval) ? `<span class="khf-meta-pill">Intervalle estimatif · ${esc(age.interval[0])}–${esc(age.interval[1])} ans</span>` : ''}
              <span class="khf-meta-pill">Estimation fonctionnelle KŌMØ · v0.1</span>
            </div>
          </div>
        </article>

        <article class="khf-score">
          <div>
            <span class="khf-kicker">MOTION SCORE</span>
            <div class="khf-score-value">${score !== null ? Math.round(score) : '—'}${score !== null ? '<small>/100</small>' : ''}</div>
            <span class="khf-score-badge">${esc(scoreState)}</span>
          </div>
          <div>
            <div class="khf-score-status"><div><strong>${esc(scoreLabel(score))}</strong><span>Repère KŌMØ</span></div>${scoreDelta !== null ? `<span class="khf-score-delta">${scoreDelta > 0 ? '↑ +' : scoreDelta < 0 ? '↓ ' : '→ '}${scoreDelta}</span>` : '<span>Baseline</span>'}</div>
            <p class="khf-score-note">Le Motion Score synthétise les dimensions disponibles. Les données manquantes restent explicitement visibles — aucune valeur n’est inventée.</p>
          </div>
        </article>
      </section>

      <section class="khf-section">
        <div class="khf-section-head"><div><h3>Votre mouvement</h3><p>Cinq dimensions. Une lecture immédiate, puis le détail lorsque vous le souhaitez.</p></div><button class="khf-link" type="button" data-route="results">Voir les résultats →</button></div>
        <article class="khf-panel khf-dimensions">${dimensionRows(result?.score)}</article>
      </section>

      <section class="khf-grid">
        ${renderPriority(support)}
        ${renderTrajectory(support, score)}
      </section>

      <section class="khf-bottom">
        ${renderAssessment(result, support)}
        ${renderReport(support)}
      </section>

      <p class="khf-disclaimer"><strong>Motion Age.</strong> Estimation expérimentale de performance fonctionnelle fondée sur des tests standardisés. Elle ne constitue ni un âge biologique, ni un diagnostic. Les résultats destinés à guider une décision de santé restent soumis à validation clinique.</p>
    </section>`;

    patchNavigation();
  }

  function renderUnavailable(message = '') {
    const root = document.querySelector('#viewRoot');
    if (!root || route() !== ROUTE) return;
    document.body.classList.add('khf-active');
    root.dataset.khfHomeFinal = '1';
    const title = document.querySelector('#pageTitle');
    const eyebrow = document.querySelector('#pageEyebrow');
    if (eyebrow) eyebrow.textContent = 'KŌMØ PULSE';
    if (title) title.textContent = 'Aujourd’hui';
    root.innerHTML = `<section class="khf" data-khf data-khf-version="${VERSION}">
      <header class="khf-greeting"><div><h2>Votre point de départ.</h2><p>Pulse construira ici votre trajectoire locomotrice au fil des données validées.</p></div><div class="khf-date">${esc(localDate())}</div></header>
      <section class="khf-hero"><article class="khf-age"><div><span class="khf-kicker">MOTION AGE</span><div class="khf-age-value">—</div></div><div><p class="khf-age-copy">Votre Motion Age apparaîtra après une première évaluation fonctionnelle exploitable.</p><div class="khf-age-meta"><span class="khf-meta-pill">Aucune estimation sans données suffisantes</span></div></div></article><article class="khf-score"><div><span class="khf-kicker">MOTION SCORE</span><div class="khf-score-value">—</div></div><div><div class="khf-score-status"><div><strong>À établir</strong><span>Première référence</span></div></div><p class="khf-score-note">${esc(message || 'Préparez votre bilan pour construire votre première référence KŌMØ.')}</p></div></article></section>
      <section class="khf-bottom"><article class="khf-panel khf-compact"><div><span class="khf-panel-label">NEXT ASSESSMENT</span><h4>Construire ma référence</h4><p>Profil, tests fonctionnels, Motion puis interprétation clinique selon votre parcours.</p></div><div class="khf-compact-foot"><strong>KŌMØ Assessment</strong><button class="khf-button" type="button" data-route="path">Commencer →</button></div></article><article class="khf-panel khf-compact"><div><span class="khf-panel-label">YOUR REPORT</span><h4>Pas encore de rapport</h4><p>Votre restitution sera disponible après validation de votre évaluation.</p></div><div class="khf-compact-foot"><strong>Pulse suivra ensuite votre trajectoire.</strong></div></article></section>
    </section>`;
    patchNavigation();
  }

  function patchNavigation() {
    const desktop = document.querySelector('#desktopNav');
    if (desktop) {
      const labels = { home: 'Aujourd’hui', results: 'Résultats', path: 'Progrès', documents: 'Rapports', explore: 'Explorer' };
      desktop.querySelectorAll('[data-route]').forEach((button) => {
        const id = button.dataset.route;
        const span = button.querySelector('span');
        if (span && labels[id]) span.textContent = labels[id];
      });
    }
    const mobile = document.querySelector('#mobileNav');
    if (mobile) {
      const labels = { home: 'Aujourd’hui', results: 'Résultats', path: 'Progrès' };
      mobile.querySelectorAll('[data-route]').forEach((button) => {
        const id = button.dataset.route;
        const span = button.querySelector('span');
        if (span && labels[id]) span.textContent = labels[id];
      });
      const fourth = mobile.querySelector('[data-route="explore"]');
      if (fourth) {
        fourth.dataset.route = 'profile';
        fourth.setAttribute('aria-label', 'Vous');
        const span = fourth.querySelector('span');
        if (span) span.textContent = 'Vous';
        const svg = fourth.querySelector('svg');
        if (svg) svg.outerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.6-4 2.7-6 6.5-6s5.9 2 6.5 6"/></svg>';
      }
      mobile.querySelectorAll('[data-route]').forEach((button) => button.classList.toggle('active', button.dataset.route === route()));
    }
  }

  async function apply(force = false) {
    installStyles();
    patchNavigation();
    if (route() !== ROUTE) {
      document.body.classList.remove('khf-active');
      const root = document.querySelector('#viewRoot');
      if (root) delete root.dataset.khfHomeFinal;
      return;
    }
    if (running) return;
    running = true;
    try {
      const mod = await canonicalModule();
      const result = await mod.loadCanonicalResult({ force });
      const support = await loadSupport(result);
      const signature = JSON.stringify({
        patient: result?.patientId,
        assessment: result?.identity?.assessmentId,
        score: result?.score?.motion_score,
        scoreAt: result?.score?.calculated_at,
        age: result?.locomotorAge?.age,
        ageStatus: result?.locomotorAge?.status,
        priorities: support.priorities?.map((p) => [p.rank, p.patient_wording, p.validation_status]),
        history: support.history?.map((p) => [p.assessmentId, p.score, p.date]),
        documents: support.documents?.map((d) => [d.file_name, d.created_at]),
        appointment: support.nextAppointment?.scheduled_start
      });
      const root = document.querySelector('#viewRoot');
      if (!force && signature === lastSignature && root?.querySelector('[data-khf]')) {
        patchNavigation();
        return;
      }
      lastSignature = signature;
      renderHome(result, support);
    } catch (error) {
      console.error('[patient-home-final-v1]', error);
      renderUnavailable(error?.message || 'Données momentanément indisponibles.');
    } finally {
      running = false;
    }
  }

  function schedule(force = false, ms = 90) {
    if (queued && !force) return;
    queued = true;
    setTimeout(() => {
      queued = false;
      apply(force);
    }, ms);
  }

  window.addEventListener('hashchange', () => schedule(false, 35));
  window.addEventListener('komo:route-ready', () => schedule(false, 60));
  window.addEventListener('komo:data-ready', () => schedule(true, 75));
  window.addEventListener('komo:assessment-updated', () => schedule(true, 75));
  window.addEventListener('komo:canonical-result-invalidated', () => schedule(true, 90));
  document.addEventListener('DOMContentLoaded', () => schedule(true, 850));

  const root = document.querySelector('#viewRoot');
  if (root) {
    new MutationObserver(() => {
      patchNavigation();
      if (route() === ROUTE && !root.querySelector('[data-khf]')) schedule(false, 55);
    }).observe(root, { childList: true, subtree: false });
  }

  setTimeout(() => schedule(true, 1200), 1200);
  window.KomoPatientHomeFinal = { version: VERSION, refresh: () => schedule(true, 10) };
})();

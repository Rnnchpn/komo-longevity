export const SOURCE_CATALOG = [
  { id:'myodev', label:'Myodev', group:'measured', region:'lower_limbs' },
  { id:'functional_tests', label:'Functional tests', group:'measured', region:'global' },
  { id:'gait', label:'Gait', group:'measured', region:'lower_limbs' },
  { id:'strength', label:'Strength', group:'measured', region:'lower_limbs' },
  { id:'posture', label:'Posture', group:'measured', region:'trunk' },
  { id:'wearables', label:'Wearables', group:'measured', region:'global' },
  { id:'sleep', label:'Sleep', group:'measured', region:'recovery' },
  { id:'activity', label:'Activity', group:'measured', region:'global' },
  { id:'rehab', label:'Rehab', group:'intervention', region:'lower_limbs' },
  { id:'motion_score', label:'Motion Score', group:'derived', region:'global' },
];

const sharedSources = {
  myodev: { status:'available', quality:.96, method:'Myodev 6-sensor session' },
  functional_tests: { status:'available', quality:.93, method:'KŌMØ functional battery' },
  gait: { status:'available', quality:.91, method:'instrumented gait export' },
  strength: { status:'available', quality:.95, method:'measured lower-limb force' },
  posture: { status:'available', quality:.88, method:'posture acquisition' },
  wearables: { status:'available', quality:.82, method:'daily wearable feed' },
  sleep: { status:'available', quality:.78, method:'wearable sleep estimate' },
  activity: { status:'available', quality:.84, method:'daily activity feed' },
  rehab: { status:'available', quality:.90, method:'guided programme log' },
  motion_score: { status:'derived', quality:.95, method:'KŌMØ deterministic score v1' },
};

export const DEMO_SNAPSHOTS = [
  {
    snapshot_id:'twin_001', subject_id:'subject_demo', captured_at:'2026-06-02T09:00:00+02:00', label:'Baseline', provenance_version:'twin-v1-demo',
    sources: structuredClone(sharedSources),
    domains:{ muscle:68, mobility:66, balance:78, posture:80, endurance:70 }, motion_score:72, motion_age:42,
    metrics:{ quadriceps_symmetry:72, gait_speed:1.02, strength_index:68, posture_index:80, sleep_minutes:421, steps:6120, rehab_adherence:0 },
    overlays:{ left_thigh:{ status:'attention', intensity:.68, reason:'quadriceps_asymmetry' }, trunk:{ status:'watch', intensity:.22, reason:'posture' }, right_thigh:{ status:'stable', intensity:.08, reason:'reference' } },
  },
  {
    snapshot_id:'twin_002', subject_id:'subject_demo', captured_at:'2026-07-02T09:00:00+02:00', label:'Day 30', provenance_version:'twin-v1-demo',
    sources: structuredClone(sharedSources),
    domains:{ muscle:76, mobility:72, balance:85, posture:84, endurance:75 }, motion_score:79, motion_age:40,
    metrics:{ quadriceps_symmetry:81, gait_speed:1.13, strength_index:76, posture_index:84, sleep_minutes:438, steps:6890, rehab_adherence:82 },
    overlays:{ left_thigh:{ status:'watch', intensity:.48, reason:'quadriceps_asymmetry' }, trunk:{ status:'stable', intensity:.14, reason:'posture' }, right_thigh:{ status:'stable', intensity:.06, reason:'reference' } },
  },
  {
    snapshot_id:'twin_003', subject_id:'subject_demo', captured_at:'2026-09-02T16:17:00+02:00', label:'Today', provenance_version:'twin-v1-demo',
    sources: structuredClone(sharedSources),
    domains:{ muscle:82, mobility:76, balance:91, posture:88, endurance:79 }, motion_score:84, motion_age:39,
    metrics:{ quadriceps_symmetry:86, gait_speed:1.21, strength_index:82, posture_index:88, sleep_minutes:462, steps:7432, rehab_adherence:91 },
    overlays:{ left_thigh:{ status:'attention', intensity:.32, reason:'residual_quadriceps_asymmetry' }, trunk:{ status:'stable', intensity:.08, reason:'posture' }, right_thigh:{ status:'stable', intensity:.05, reason:'reference' } },
  }
];

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}
DEMO_SNAPSHOTS.forEach(deepFreeze);

export class TwinCore {
  constructor({ snapshots = DEMO_SNAPSHOTS } = {}) {
    this.snapshots = snapshots;
    this.activeIndex = snapshots.length - 1;
    this.selectedSource = null;
    this.events = [];
    this.listeners = new Map();
    this.emit('twin.initialized', { snapshot_id:this.current().snapshot_id, snapshot_count:snapshots.length });
  }

  current() { return this.snapshots[this.activeIndex]; }
  byId(id) { return this.snapshots.find(s => s.snapshot_id === id) || null; }

  validateSnapshot(snapshot) {
    const required = ['snapshot_id','subject_id','captured_at','sources','domains','motion_score','provenance_version'];
    const missing = required.filter(key => snapshot?.[key] === undefined);
    return { ok:missing.length === 0, missing };
  }

  on(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler);
    return () => this.listeners.get(type)?.delete(handler);
  }

  emit(type, payload = {}, actor = 'system') {
    const event = deepFreeze({ event_id:`evt_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, type, at:new Date().toISOString(), actor, payload });
    this.events.push(event);
    this.listeners.get(type)?.forEach(fn => fn(event));
    this.listeners.get('*')?.forEach(fn => fn(event));
    return event;
  }

  setTimeIndex(index, actor = 'user') {
    const next = Math.max(0, Math.min(this.snapshots.length - 1, Number(index)));
    if (next === this.activeIndex) return this.current();
    const previous = this.current();
    this.activeIndex = next;
    const current = this.current();
    this.emit('timeline.changed', { from:previous.snapshot_id, to:current.snapshot_id, label:current.label }, actor);
    return current;
  }

  focusSource(source, actor = 'user') {
    if (!SOURCE_CATALOG.some(item => item.id === source)) throw new Error(`Unknown source: ${source}`);
    this.selectedSource = source;
    this.emit('world.source.focused', { source, snapshot_id:this.current().snapshot_id }, actor);
    return this.sourceDetail(source);
  }

  sourceDetail(source) {
    const catalog = SOURCE_CATALOG.find(item => item.id === source);
    const value = this.current().sources[source];
    return catalog && value ? { ...catalog, ...value, snapshot_id:this.current().snapshot_id } : null;
  }

  compare(fromId = this.snapshots[0].snapshot_id, toId = this.current().snapshot_id, actor = 'user') {
    const from = this.byId(fromId); const to = this.byId(toId);
    if (!from || !to) throw new Error('Comparison snapshot unavailable');
    const metricDelta = {}; const domainDelta = {};
    Object.keys(to.metrics || {}).forEach(key => metricDelta[key] = Number((to.metrics[key] - (from.metrics?.[key] ?? 0)).toFixed(2)));
    Object.keys(to.domains || {}).forEach(key => domainDelta[key] = Number((to.domains[key] - (from.domains?.[key] ?? 0)).toFixed(2)));
    const result = { from:{ id:from.snapshot_id, label:from.label }, to:{ id:to.snapshot_id, label:to.label }, motion_score_delta:to.motion_score-from.motion_score, motion_age_delta:to.motion_age-from.motion_age, metric_delta:metricDelta, domain_delta:domainDelta };
    this.emit('timeline.compared', result, actor);
    return result;
  }

  createAgentContext({ comparisonId = this.snapshots[0].snapshot_id, room = 'functional_twin' } = {}) {
    const current = this.current();
    const compare = this.byId(comparisonId);
    return deepFreeze({
      contract_version:'komo-agent-context-v1',
      room,
      snapshot:{ id:current.snapshot_id, label:current.label, captured_at:current.captured_at, domains:current.domains, metrics:current.metrics, motion_score:current.motion_score, motion_age:current.motion_age, overlays:current.overlays, sources:current.sources, provenance_version:current.provenance_version },
      comparison_snapshot:compare ? { id:compare.snapshot_id, label:compare.label, captured_at:compare.captured_at, domains:compare.domains, metrics:compare.metrics, motion_score:compare.motion_score, motion_age:compare.motion_age } : null,
      allowed_capabilities:['twin.read_snapshot','twin.compare_snapshots','world.focus_source','world.focus_region','world.camera','world.open_room','rehab.preview_session','provenance.read'],
      forbidden_capabilities:['measurement.modify','measurement.delete','motion_score.override','clinical_prescription.autonomous_write'],
      data_minimisation:'current room + selected comparison only',
    });
  }

  auditLog(limit = 20) { return this.events.slice(-limit); }
}

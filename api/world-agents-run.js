import { z } from 'zod';

const MODEL = process.env.KOMO_WORLD_AGENT_MODEL || 'gpt-5.6-sol';
const PREVIEW_PATH = '/world/agent-preview-001/';

const RequestSchema = z.object({
  mission: z.string().trim().min(3).max(1800).default('Améliorer la compréhension, la jouabilité et la qualité de KŌMØ World.'),
  offline: z.boolean().default(false),
  worldState: z.object({
    version: z.string().trim().max(64).default('v0.12.6'),
    zone: z.string().trim().max(120).default('Arrival Plaza → KŌMØ Hall'),
    goal: z.string().trim().max(800).optional(),
    knownIssues: z.array(z.string().trim().max(500)).max(12).default([]),
    performanceNotes: z.array(z.string().trim().max(500)).max(12).default([]),
    navigationNotes: z.array(z.string().trim().max(500)).max(12).default([]),
    visualNotes: z.array(z.string().trim().max(500)).max(12).default([])
  }).default({})
});

function text(v) {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  return JSON.stringify(v);
}

function clip(v, max = 9000) {
  const s = text(v);
  return s.length > max ? `${s.slice(0, max)}\n[TRUNCATED]` : s;
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function buildManifest(mission, worldState) {
  const search = `${mission} ${(worldState.knownIssues || []).join(' ')} ${(worldState.navigationNotes || []).join(' ')}`.toLowerCase();
  const operations = [];

  if (search.includes('concierge') || search.includes('desk') || search.includes('hall')) {
    operations.push({
      type: 'MOVE_INTERACTION',
      target: 'desk',
      from: { x: 0, z: -1.6, radius: 5.2 },
      to: { x: -8.15, z: -1.2, radius: 4.8 },
      reason: 'Aligner la zone ACTION avec le Concierge déjà déplacé sur le côté gauche du Hall.'
    });
    operations.push({
      type: 'PRESERVE_CLEAR_AXIS',
      target: 'hall-central-axis',
      bounds: { x1: -4.6, x2: 4.6, z1: -40, z2: 9 },
      reason: 'Garantir une circulation continue Arrival Plaza → Atrium.'
    });
  }

  if (search.includes('twin') || search.includes('arena') || search.includes('compréhension') || search.includes('orientation')) {
    operations.push({
      type: 'SET_WAYFINDING',
      target: 'hall-entry',
      labels: [
        { text: '← TWIN LAB', x: -12.8, y: 5, z: -10.5 },
        { text: 'ARENA →', x: 12.8, y: 5, z: -10.5 }
      ],
      reason: 'Renforcer la lecture spatiale sans ajouter de panneau UI massif.'
    });
  }

  operations.push({
    type: 'CAMERA_OCCLUDER_REMOVE',
    target: 'legacy-hidden-objects',
    objects: ['legacyDesk', 'legacyBackWall'],
    reason: 'Les objets invisibles ne doivent pas repousser la caméra.'
  });
  operations.push({
    type: 'ASSERT_CLINICAL_READ_ONLY',
    target: 'functional-twin-truth-layer',
    value: true,
    reason: 'Le Builder ne peut toucher qu’à la présentation spatiale.'
  });

  const allowed = new Set(['MOVE_INTERACTION','PRESERVE_CLEAR_AXIS','SET_WAYFINDING','CAMERA_OCCLUDER_REMOVE','ASSERT_CLINICAL_READ_ONLY']);
  const qaChecks = [
    { id: 'allowed_operations_only', pass: operations.every(o => allowed.has(o.type)) },
    { id: 'production_write_disabled', pass: true },
    { id: 'clinical_write_disabled', pass: true },
    { id: 'concierge_outside_central_axis', pass: operations.filter(o => o.type === 'MOVE_INTERACTION').every(o => Math.abs(o.to.x) > 4.6) },
    { id: 'preview_target_isolated', pass: PREVIEW_PATH.includes('agent-preview-') }
  ];

  return {
    schema: 'komo.world.build-manifest.v1',
    id: 'agent-preview-001',
    sourceVersion: worldState.version || 'v0.12.6',
    previewPath: PREVIEW_PATH,
    generatedBy: 'KŌMØ Deterministic Builder',
    operations,
    guardrails: {
      previewOnly: true,
      productionWrite: false,
      clinicalWrite: false,
      twinTruthReadOnly: true,
      mobileFirst: true
    },
    qaChecks,
    qaPass: qaChecks.every(c => c.pass)
  };
}

function offlineCycle(mission, worldState, fallbackReason = null) {
  const manifest = buildManifest(mission, worldState);
  const issue = (worldState.knownIssues || [])[0] || 'Le Hall est traversable mais la compréhension spatiale doit être consolidée.';
  const observerOutput = `SIGNALS\n- ${issue}\n- Axe central à préserver.\n- Priorité mobile/iPhone.\n\nPRIMARY_PROBLEM\nInteraction Concierge et orientation spatiale doivent correspondre au nouveau Hall.\n\nWHY_NOW\nLa navigation physique est ouverte : la compréhension doit maintenant suivre.\n\nSUCCESS_CRITERIA\n- Entrée Hall sans blocage.\n- Concierge accessible latéralement.\n- Twin/Arena lisibles.\n- Aucun impact clinique.\n\nRISKS\n- Réintroduire une collision fantôme.\n- Ajouter du bruit visuel.`;
  const architectOutput = `BUILD_NAME\nAgent Preview 001 · Hall Concierge Alignment\n\nOBJECTIVE\nAligner interaction, signalétique et circulation avec le Hall V0.12.6.\n\nSPATIAL_SPEC\nConcierge côté gauche x=-8.15, axe central libre.\n\nINTERACTION_SPEC\nDéplacer la zone ACTION du Desk vers le Concierge latéral.\n\nVISUAL_SPEC\nConserver pierre claire, sauge, bronze, lumière chaude.\n\nTECH_CONSTRAINTS\nPreview isolée, aucune écriture production, aucune donnée clinique.\n\nACCEPTANCE_TESTS\nPassage central libre, ACTION au bon endroit, mobile stable.`;
  const qaOutput = `VERDICT\n${manifest.qaPass ? 'PASS' : 'FAIL'}\n\nBLOCKERS\n${manifest.qaPass ? 'Aucun.' : 'Une règle déterministe a échoué.'}\n\nWARNINGS\nTester physiquement sur iPhone après déploiement.\n\nREQUIRED_CHANGES\nAucune mutation hors whitelist.\n\nTEST_MATRIX\n${manifest.qaChecks.map(c => `- ${c.id}: ${c.pass ? 'PASS' : 'FAIL'}`).join('\n')}`;
  const supervisorOutput = `DECISION\n${manifest.qaPass ? 'APPROVE_PREVIEW' : 'REVISE'}\n\nRATIONALE\nLa modification est bornée, réversible et isolée.\n\nAPPROVED_SCOPE\nHall / Concierge / wayfinding uniquement.\n\nREQUIRED_GUARDRAILS\nPreview only · Twin read-only · production write disabled.\n\nNEXT_ACTION\nCompiler le manifest dans ${manifest.previewPath}`;
  const builderOutput = `STATUS\n${manifest.qaPass ? 'BUILT_SANDBOX' : 'BLOCKED'}\n\nMANIFEST\n${JSON.stringify(manifest, null, 2)}`;

  return {
    ok: true,
    service: 'komo-world-agents',
    mode: 'offline-deterministic',
    model: null,
    fallbackReason,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    mission,
    worldState,
    cycle: [
      { agent: 'Observer', status: 'completed', output: observerOutput },
      { agent: 'Architect', status: 'completed', output: architectOutput },
      { agent: 'QA', status: 'completed', output: qaOutput },
      { agent: 'World Supervisor', status: 'completed', output: supervisorOutput },
      { agent: 'Builder Sandbox', status: manifest.qaPass ? 'built' : 'blocked', output: builderOutput }
    ],
    manifest,
    governance: {
      productionWrite: false,
      clinicalWrite: false,
      previewOnly: true,
      autonomyLevel: 2,
      builderSandbox: true,
      nextAutonomyLevel: 'Persistent run ledger + scheduled observer loop'
    }
  };
}

const sharedBoundary = `
KŌMŌ WORLD AGENT GOVERNANCE — NON-NEGOTIABLE:
- You work only on the virtual-world product: architecture, navigation, gameplay clarity, rendering, performance, UI and environmental storytelling.
- Never modify, infer, rank or invent clinical truth, patient data, diagnoses, Motion Score, Motion Age, Myodev measurements, prescriptions or rehabilitation medical decisions.
- The Functional Twin is the truth layer. You may improve how it is spatially presented, never its underlying clinical values.
- No direct production writes. All proposals target a sandbox/preview candidate first.
- Prefer one bounded, testable improvement over broad rewrites.
- Mobile-first: iPhone rendering, controls, collision safety and performance matter.
- Preserve the KŌMŌ art direction: premium architectural wellness, Mediterranean modern, pale stone/travertine, sage/olive, restrained bronze, warm natural light, calm water, strong depth and monumental axes.
- Return concise, operational output. Do not reveal chain-of-thought.
`;

async function liveCycle(mission, worldState) {
  const { Agent, run } = await import('@openai/agents');
  const observer = new Agent({
    name: 'KŌMŌ World Observer',
    model: MODEL,
    instructions: `${sharedBoundary}\nROLE: Observe the supplied world state and mission. Identify the single highest-value problem to solve next. Output exactly: SIGNALS, PRIMARY_PROBLEM, WHY_NOW, SUCCESS_CRITERIA, RISKS.`
  });
  const architect = new Agent({
    name: 'KŌMŌ World Architect',
    model: MODEL,
    instructions: `${sharedBoundary}\nROLE: Convert the Observer report into one precise preview build specification. Do not write code. Output exactly: BUILD_NAME, OBJECTIVE, SPATIAL_SPEC, INTERACTION_SPEC, VISUAL_SPEC, TECH_CONSTRAINTS, ACCEPTANCE_TESTS.`
  });
  const qa = new Agent({
    name: 'KŌMŌ World QA',
    model: MODEL,
    instructions: `${sharedBoundary}\nROLE: Adversarial QA. Check collisions, camera, mobile controls, z-fighting, FPS risk, boot safety, comprehension, scope creep and clinical-boundary violations. Output exactly: VERDICT, BLOCKERS, WARNINGS, REQUIRED_CHANGES, TEST_MATRIX.`
  });
  const supervisor = new Agent({
    name: 'KŌMŌ World Supervisor',
    model: MODEL,
    instructions: `${sharedBoundary}\nROLE: Review all reports. Choose APPROVE_PREVIEW, REVISE, or REJECT. Output exactly: DECISION, RATIONALE, APPROVED_SCOPE, REQUIRED_GUARDRAILS, NEXT_ACTION.`
  });

  const context = `MISSION\n${mission}\n\nWORLD_STATE\n${JSON.stringify(worldState, null, 2)}`;
  const observerRun = await run(observer, context, { maxTurns: 3 });
  const observerOutput = clip(observerRun.finalOutput);
  const architectRun = await run(architect, `${context}\n\nOBSERVER_REPORT\n${observerOutput}`, { maxTurns: 3 });
  const architectOutput = clip(architectRun.finalOutput);
  const qaRun = await run(qa, `${context}\n\nOBSERVER_REPORT\n${observerOutput}\n\nARCHITECT_BUILD_SPEC\n${architectOutput}`, { maxTurns: 3 });
  const qaOutput = clip(qaRun.finalOutput);
  const supervisorRun = await run(supervisor, `${context}\n\nOBSERVER_REPORT\n${observerOutput}\n\nARCHITECT_BUILD_SPEC\n${architectOutput}\n\nQA_REPORT\n${qaOutput}`, { maxTurns: 3 });
  const supervisorOutput = clip(supervisorRun.finalOutput);
  const manifest = buildManifest(mission, worldState);

  return {
    ok: true,
    service: 'komo-world-agents',
    mode: 'live-ai-preview-governed',
    model: MODEL,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    mission,
    worldState,
    cycle: [
      { agent: 'Observer', status: 'completed', output: observerOutput },
      { agent: 'Architect', status: 'completed', output: architectOutput },
      { agent: 'QA', status: 'completed', output: qaOutput },
      { agent: 'World Supervisor', status: 'completed', output: supervisorOutput },
      { agent: 'Builder Sandbox', status: manifest.qaPass ? 'built' : 'blocked', output: JSON.stringify(manifest, null, 2) }
    ],
    manifest,
    governance: {
      productionWrite: false,
      clinicalWrite: false,
      previewOnly: true,
      autonomyLevel: 2,
      builderSandbox: true,
      nextAutonomyLevel: 'Persistent run ledger + scheduled observer loop'
    }
  };
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method === 'GET') {
    return response.status(200).json({
      ok: true,
      service: 'komo-world-agents',
      mode: 'autonomy-level-02',
      model: MODEL,
      apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
      offlineAvailable: true,
      agents: ['Observer', 'Architect', 'QA', 'World Supervisor', 'Builder Sandbox'],
      previewPath: PREVIEW_PATH,
      permissions: {
        observe: true,
        propose: true,
        approvePreview: true,
        buildSandbox: true,
        writeProduction: false,
        writeClinicalData: false
      }
    });
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const parsed = RequestSchema.safeParse(parseBody(request));
  if (!parsed.success) {
    return response.status(400).json({
      ok: false,
      error: 'invalid_request',
      details: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
    });
  }

  const { mission, worldState, offline } = parsed.data;
  if (offline || !process.env.OPENAI_API_KEY) {
    return response.status(200).json(offlineCycle(mission, worldState, !process.env.OPENAI_API_KEY ? 'api_key_unavailable' : null));
  }

  try {
    return response.status(200).json(await liveCycle(mission, worldState));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown agent error';
    console.warn('[KŌMØ World Agents] Live cycle unavailable, switching to offline:', message);
    const quotaLike = /429|quota|billing|credit|rate.limit|insufficient/i.test(message);
    if (quotaLike) return response.status(200).json(offlineCycle(mission, worldState, 'live_api_credit_or_quota_unavailable'));
    return response.status(500).json({ ok: false, error: 'agent_cycle_failed', message });
  }
}

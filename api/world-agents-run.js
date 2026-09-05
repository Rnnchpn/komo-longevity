import { Agent, run } from '@openai/agents';
import { z } from 'zod';

const MODEL = process.env.KOMO_WORLD_AGENT_MODEL || 'gpt-5.6-sol';

const RequestSchema = z.object({
  mission: z.string().trim().min(3).max(1800).default('Améliorer la compréhension, la jouabilité et la qualité de KŌMØ World.'),
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

const sharedBoundary = `
KŌMØ WORLD AGENT GOVERNANCE — NON-NEGOTIABLE:
- You work only on the virtual-world product: architecture, navigation, gameplay clarity, rendering, performance, UI and environmental storytelling.
- Never modify, infer, rank or invent clinical truth, patient data, diagnoses, Motion Score, Motion Age, Myodev measurements, prescriptions or rehabilitation medical decisions.
- The Functional Twin is the truth layer. You may improve how it is spatially presented, never its underlying clinical values.
- No direct production writes. All proposals target a sandbox/preview candidate first.
- Prefer one bounded, testable improvement over broad rewrites.
- Mobile-first: iPhone rendering, controls, collision safety and performance matter.
- Preserve the KŌMØ art direction: premium architectural wellness, Mediterranean modern, pale stone/travertine, sage/olive, restrained bronze, warm natural light, calm water, strong depth and monumental axes.
- Return concise, operational output. Do not reveal chain-of-thought.
`;

const observer = new Agent({
  name: 'KŌMØ World Observer',
  model: MODEL,
  instructions: `${sharedBoundary}\nROLE: Observe the supplied world state and mission. Identify the single highest-value problem to solve next. Separate evidence from assumptions. Output exactly these headings: SIGNALS, PRIMARY_PROBLEM, WHY_NOW, SUCCESS_CRITERIA, RISKS.`
});

const architect = new Agent({
  name: 'KŌMØ World Architect',
  model: MODEL,
  instructions: `${sharedBoundary}\nROLE: Convert the Observer report into one precise preview build specification. Do not write code. Define spatial change, materials/lighting only if relevant, navigation/collision implications, UI implications, and acceptance checks. Output exactly: BUILD_NAME, OBJECTIVE, SPATIAL_SPEC, INTERACTION_SPEC, VISUAL_SPEC, TECH_CONSTRAINTS, ACCEPTANCE_TESTS.`
});

const qa = new Agent({
  name: 'KŌMØ World QA',
  model: MODEL,
  instructions: `${sharedBoundary}\nROLE: Act as adversarial product/technical QA on the proposed preview build. Check collision path, camera occlusion, mobile controls, z-fighting, FPS risk, boot safety, comprehension, scope creep and clinical-boundary violations. Output exactly: VERDICT, BLOCKERS, WARNINGS, REQUIRED_CHANGES, TEST_MATRIX. VERDICT must be PASS, PASS_WITH_CHANGES, or FAIL.`
});

const supervisor = new Agent({
  name: 'KŌMØ World Supervisor',
  model: MODEL,
  instructions: `${sharedBoundary}\nROLE: You govern the autonomous team. Review Observer, Architect and QA outputs. You may approve only a sandbox/preview candidate, never production. Choose exactly one decision: APPROVE_PREVIEW, REVISE, REJECT. Output exactly: DECISION, RATIONALE, APPROVED_SCOPE, REQUIRED_GUARDRAILS, NEXT_ACTION. NEXT_ACTION must be a concrete instruction for a future Builder agent or for revision.`
});

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method === 'GET') {
    return response.status(200).json({
      ok: true,
      service: 'komo-world-agents',
      mode: 'preview-governed',
      model: MODEL,
      apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
      agents: ['Observer', 'Architect', 'QA', 'World Supervisor'],
      permissions: {
        observe: true,
        propose: true,
        approvePreview: true,
        writeProduction: false,
        writeClinicalData: false
      }
    });
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(503).json({ ok: false, error: 'openai_api_key_not_configured' });
  }

  const parsed = RequestSchema.safeParse(parseBody(request));
  if (!parsed.success) {
    return response.status(400).json({
      ok: false,
      error: 'invalid_request',
      details: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
    });
  }

  const { mission, worldState } = parsed.data;
  const context = `MISSION\n${mission}\n\nWORLD_STATE\n${JSON.stringify(worldState, null, 2)}`;
  const startedAt = new Date().toISOString();

  try {
    const observerRun = await run(observer, context, { maxTurns: 3 });
    const observerOutput = clip(observerRun.finalOutput);

    const architectRun = await run(architect, `${context}\n\nOBSERVER_REPORT\n${observerOutput}`, { maxTurns: 3 });
    const architectOutput = clip(architectRun.finalOutput);

    const qaRun = await run(qa, `${context}\n\nOBSERVER_REPORT\n${observerOutput}\n\nARCHITECT_BUILD_SPEC\n${architectOutput}`, { maxTurns: 3 });
    const qaOutput = clip(qaRun.finalOutput);

    const supervisorRun = await run(supervisor, `${context}\n\nOBSERVER_REPORT\n${observerOutput}\n\nARCHITECT_BUILD_SPEC\n${architectOutput}\n\nQA_REPORT\n${qaOutput}`, { maxTurns: 3 });
    const supervisorOutput = clip(supervisorRun.finalOutput);

    return response.status(200).json({
      ok: true,
      service: 'komo-world-agents',
      mode: 'preview-governed',
      model: MODEL,
      startedAt,
      completedAt: new Date().toISOString(),
      mission,
      worldState,
      cycle: [
        { agent: 'Observer', status: 'completed', output: observerOutput },
        { agent: 'Architect', status: 'completed', output: architectOutput },
        { agent: 'QA', status: 'completed', output: qaOutput },
        { agent: 'World Supervisor', status: 'completed', output: supervisorOutput }
      ],
      governance: {
        productionWrite: false,
        clinicalWrite: false,
        previewOnly: true,
        nextAutonomyLevel: 'Builder sandbox after Supervisor approval'
      }
    });
  } catch (error) {
    console.error('[KŌMØ World Agents]', error);
    return response.status(500).json({
      ok: false,
      error: 'agent_cycle_failed',
      message: error instanceof Error ? error.message : 'Unknown agent error'
    });
  }
}

const CANDIDATES = [
  {
    id: 'agent-preview-002',
    title: 'Premium Hall Camera + Concierge Alcove',
    status: 'compiled',
    previewPath: '/world/agent-preview-002/',
    dimensions: { safety: 100, navigation: 98, mobile: 94, visual: 96, reversibility: 100 },
    scope: ['Hall camera', 'Concierge alcove', 'Wayfinding refinement'],
    guardrails: ['preview-only', 'clinical-read-only', 'central-axis-preserved']
  },
  {
    id: 'agent-preview-003',
    title: 'Twin Lab Threshold + Arrival Clarity',
    status: 'compiled',
    previewPath: '/world/agent-preview-003/',
    dimensions: { safety: 100, navigation: 97, mobile: 95, visual: 97, reversibility: 100 },
    scope: ['Twin threshold', 'Contextual Twin camera', 'Spatial depth', 'Source provenance wayfinding'],
    guardrails: ['preview-only', 'twin-truth-read-only', 'no-clinical-value-change', 'no-invented-clinical-values']
  },
  {
    id: 'agent-preview-004',
    title: 'Arena Threshold + Warm Social Lobby',
    status: 'proposed',
    previewPath: null,
    dimensions: { safety: 100, navigation: 92, mobile: 95, visual: 93, reversibility: 100 },
    scope: ['Arena entrance', 'Social lobby', 'Challenge discovery'],
    guardrails: ['preview-only', 'no-health-ranking', 'game-data-only']
  }
];

function weightedScore(d) {
  return Math.round(
    d.safety * .28 +
    d.navigation * .22 +
    d.mobile * .20 +
    d.visual * .20 +
    d.reversibility * .10
  );
}

function rankCandidates() {
  return CANDIDATES.map(c => ({ ...c, qaScore: weightedScore(c.dimensions) }))
    .sort((a,b) => b.qaScore - a.qaScore)
    .map((c,i) => ({ ...c, rank: i + 1, supervisorDecision: c.qaScore >= 95 ? 'APPROVE_PREVIEW' : c.qaScore >= 90 ? 'REVISE_THEN_PREVIEW' : 'HOLD' }));
}

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const candidates = rankCandidates();
  return response.status(200).json({
    ok: true,
    service: 'komo-world-agent-candidates',
    autonomyLevel: 3,
    mode: 'deterministic-zero-credit',
    generatedAt: new Date().toISOString(),
    criteria: {
      safety: .28,
      navigation: .22,
      mobile: .20,
      visual: .20,
      reversibility: .10
    },
    candidates,
    selected: candidates[0],
    governance: {
      autoPromoteToPreview: true,
      autoPromoteToProduction: false,
      writeClinicalData: false,
      twinTruthReadOnly: true
    }
  });
}

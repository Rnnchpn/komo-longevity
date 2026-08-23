import type { Assessment, MotionResult, Priority } from './domain';

export const syntheticAssessment: Assessment = {
  id: '11111111-1111-4111-8111-111111111111',
  personId: '22222222-2222-4222-8222-222222222222',
  organisationId: '33333333-3333-4333-8333-333333333333',
  mode: 'clinical',
  status: 'published',
  protocolVersionId: '44444444-4444-4444-8444-444444444444',
  scheduledAt: '2026-09-15T09:00:00+02:00',
  startedAt: '2026-09-15T09:08:00+02:00',
  completedAt: '2026-09-15T09:34:00+02:00',
  createdByUserId: '55555555-5555-4555-8555-555555555555',
  createdAt: '2026-09-01T11:00:00+02:00'
};

export const syntheticMotionResult: MotionResult = {
  id: '66666666-6666-4666-8666-666666666666',
  assessmentId: syntheticAssessment.id,
  scoringVersion: 'motion-poc-0.1',
  overallScore: 78,
  overallLabel: 'Favorable',
  confidence: 'high',
  domains: [
    {
      domain: 'mobility',
      score: 82,
      status: 'available',
      confidence: 'high',
      contributingMeasurementIds: []
    },
    {
      domain: 'performance',
      score: 74,
      status: 'available',
      confidence: 'high',
      contributingMeasurementIds: []
    },
    {
      domain: 'balance',
      score: 68,
      status: 'available',
      confidence: 'medium',
      contributingMeasurementIds: []
    },
    {
      domain: 'muscle_control',
      status: 'descriptive_only',
      confidence: 'medium',
      contributingMeasurementIds: []
    }
  ],
  muscleSignature: {
    activation: 'balanced',
    coordination: 'favorable',
    symmetry: 'intermediate',
    endurance: 'not_available',
    source: 'myodev_myocare'
  },
  generatedAt: '2026-09-15T09:40:00+02:00'
};

export const syntheticPriorities: Priority[] = [
  {
    id: '77777777-7777-4777-8777-777777777771',
    assessmentId: syntheticAssessment.id,
    rank: 1,
    title: 'Stabilité unipodale',
    rationale: 'L’équilibre est le domaine le moins favorable du profil actuel.',
    domain: 'balance'
  },
  {
    id: '77777777-7777-4777-8777-777777777772',
    assessmentId: syntheticAssessment.id,
    rank: 2,
    title: 'Puissance des membres inférieurs',
    rationale: 'La performance peut être renforcée pour améliorer la réserve fonctionnelle.',
    domain: 'performance'
  },
  {
    id: '77777777-7777-4777-8777-777777777773',
    assessmentId: syntheticAssessment.id,
    rank: 3,
    title: 'Suivre la symétrie musculaire',
    rationale: 'La Muscle Signature suggère une asymétrie intermédiaire à comparer au prochain bilan.',
    domain: 'muscle_control'
  }
];

export const syntheticTrajectory = [
  {
    date: '2026-09-15',
    label: 'T0',
    overall: 78,
    mobility: 82,
    performance: 74,
    balance: 68
  },
  {
    date: '2026-12-15',
    label: 'M3',
    overall: 82,
    mobility: 84,
    performance: 79,
    balance: 75
  }
] as const;
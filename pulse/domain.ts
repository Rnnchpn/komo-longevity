export type UUID = string;
export type ISODateTime = string;

export type UserRole =
  | 'patient'
  | 'motion_operator'
  | 'physician'
  | 'organisation_admin'
  | 'komo_admin';

export type AssessmentMode = 'motion' | 'clinical';
export type AssessmentStatus =
  | 'draft'
  | 'baseline_pending'
  | 'ready_for_session'
  | 'in_progress'
  | 'quality_review'
  | 'result_ready'
  | 'published'
  | 'archived';

export type MeasurementSourceKind =
  | 'komo_functional_test'
  | 'myodev_myocare'
  | 'posture'
  | 'pulse_baseline'
  | 'manual_clinical_entry'
  | 'laboratory'
  | 'imaging'
  | 'wearable';

export type QualityStatus = 'valid' | 'review' | 'invalid' | 'missing';

export interface Organisation {
  id: UUID;
  name: string;
  countryCode: string;
  createdAt: ISODateTime;
}

export interface Person {
  id: UUID;
  organisationId?: UUID;
  externalReference?: string;
  birthYear?: number;
  sexAtBirth?: 'female' | 'male' | 'other' | 'unknown';
  createdAt: ISODateTime;
}

export interface Assessment {
  id: UUID;
  personId: UUID;
  organisationId: UUID;
  mode: AssessmentMode;
  status: AssessmentStatus;
  protocolVersionId: UUID;
  scheduledAt?: ISODateTime;
  startedAt?: ISODateTime;
  completedAt?: ISODateTime;
  createdByUserId: UUID;
  createdAt: ISODateTime;
}

export interface CaseSession {
  id: UUID;
  assessmentId: UUID;
  caseId?: UUID;
  operatorUserId: UUID;
  startedAt?: ISODateTime;
  completedAt?: ISODateTime;
  notes?: string;
}

export interface MeasurementSource {
  id: UUID;
  kind: MeasurementSourceKind;
  providerName: string;
  providerSystem?: string;
  providerVersion?: string;
}

export interface MeasurementDefinition {
  id: UUID;
  canonicalKey: string;
  displayName: string;
  domain:
    | 'mobility'
    | 'performance'
    | 'balance'
    | 'muscle_control'
    | 'posture'
    | 'context';
  canonicalUnit?: string;
  valueType: 'number' | 'boolean' | 'text' | 'category';
  laterality: 'none' | 'left_right' | 'optional';
  activeFrom: ISODateTime;
}

export interface Measurement {
  id: UUID;
  assessmentId: UUID;
  caseSessionId?: UUID;
  definitionId: UUID;
  sourceId: UUID;
  numericValue?: number;
  textValue?: string;
  unit?: string;
  side?: 'left' | 'right' | 'bilateral' | 'none';
  measuredAt: ISODateTime;
  qualityStatus: QualityStatus;
  qualityReason?: string;
  provenanceId: UUID;
}

export interface ImportBatch {
  id: UUID;
  assessmentId: UUID;
  caseSessionId: UUID;
  sourceId: UUID;
  sourceFilename?: string;
  sourceChecksum?: string;
  sourceAlgorithmVersion?: string;
  importedAt: ISODateTime;
  importedByUserId: UUID;
  status: 'received' | 'validated' | 'partial' | 'rejected';
  validationMessages: string[];
}

export interface SourceMapping {
  id: UUID;
  sourceId: UUID;
  sourceField: string;
  sourceUnit?: string;
  definitionId: UUID;
  transformRule?: string;
  mappingVersion: string;
}

export interface Provenance {
  id: UUID;
  sourceId: UUID;
  importBatchId?: UUID;
  acquisitionProtocol?: string;
  algorithmVersion?: string;
  deviceReference?: string;
  createdAt: ISODateTime;
}

export interface MotionDomainResult {
  domain: 'mobility' | 'performance' | 'balance' | 'muscle_control';
  score?: number;
  status: 'available' | 'descriptive_only' | 'insufficient_data';
  confidence: 'high' | 'medium' | 'low';
  contributingMeasurementIds: UUID[];
}

export interface MotionResult {
  id: UUID;
  assessmentId: UUID;
  scoringVersion: string;
  overallScore?: number;
  overallLabel?: string;
  confidence: 'high' | 'medium' | 'low';
  domains: MotionDomainResult[];
  muscleSignature?: MuscleSignature;
  generatedAt: ISODateTime;
}

export interface MuscleSignature {
  activation?: 'balanced' | 'left_dominant' | 'right_dominant' | 'mixed';
  coordination?: 'favorable' | 'intermediate' | 'attention';
  symmetry?: 'favorable' | 'intermediate' | 'attention';
  endurance?: 'favorable' | 'intermediate' | 'attention' | 'not_available';
  source: 'myodev_myocare';
}

export interface Priority {
  id: UUID;
  assessmentId: UUID;
  rank: 1 | 2 | 3;
  title: string;
  rationale: string;
  domain?: MeasurementDefinition['domain'];
  validatedByPhysicianUserId?: UUID;
}

export interface ClinicalInterpretation {
  id: UUID;
  assessmentId: UUID;
  physicianUserId: UUID;
  summary: string;
  conclusion?: string;
  plan?: string;
  signedAt?: ISODateTime;
}

export interface AuditEvent {
  id: UUID;
  actorUserId: UUID;
  organisationId?: UUID;
  entityType: string;
  entityId: UUID;
  action: string;
  createdAt: ISODateTime;
  metadata?: Record<string, unknown>;
}
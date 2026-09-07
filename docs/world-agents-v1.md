# KŌMØ World Agents — Autonomy Plan V1

## Mission
Build a governed multi-agent layer that improves KŌMØ World continuously without allowing autonomous clinical truth changes or direct production writes.

## Autonomy Level 01 — deployed scope

### Observer
Inputs: mission + bounded world state.
Output: signals, one primary problem, success criteria, risks.
Permissions: read/analyse only.

### Architect
Inputs: world state + Observer report.
Output: one bounded preview build specification.
Permissions: proposal only; no code or production write.

### QA
Inputs: world state + Observer + Architect output.
Output: PASS / PASS_WITH_CHANGES / FAIL with blockers and test matrix.
Checks: collisions, camera occlusion, mobile controls, z-fighting, FPS, boot safety, comprehension, scope creep, clinical boundaries.

### World Supervisor
Inputs: all previous outputs.
Output: APPROVE_PREVIEW / REVISE / REJECT.
Permissions: may approve a sandbox/preview candidate only.

## Governance
- Production write: forbidden at Level 01.
- Clinical write: forbidden at every autonomy level.
- Functional Twin: truth layer; agents may change presentation, not clinical values.
- Every proposed change must be bounded, testable and preview-first.
- Mobile-first and iPhone stability are hard constraints.

## Runtime
Serverless endpoint: `/api/world-agents-run`
Control Room: `/world/agents/`
Model default: `gpt-5.6-sol`, overridable server-side with `KOMO_WORLD_AGENT_MODEL`.
Secret: `OPENAI_API_KEY` server-side only.

## Next levels

### Level 02 — Builder Sandbox
Add a Builder agent that converts approved build specs into a deterministic world-build manifest. No arbitrary production writes. Output goes to an isolated preview candidate.

### Level 03 — Persistent Run Ledger
Persist agent cycles, decisions, QA verdicts and preview lineage in a non-clinical datastore. Add review history and rollback metadata.

### Level 04 — Continuous Improvement
Add scheduled observation cycles, telemetry ingestion, priority scoring and automatic preview generation when Supervisor approves.

### Level 05 — Governed Auto-Integration
Allow low-risk, reversible world-only changes to integrate after automated checks. High-impact changes remain human-approved. Clinical data and Twin truth remain permanently outside agent write permissions.

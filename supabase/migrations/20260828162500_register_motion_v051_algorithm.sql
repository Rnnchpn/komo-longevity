-- KŌMØ Pulse · register Motion Functional Index v0.5.1 POC
-- Keeps the score FK aligned with calculate_motion_v05() and MyoCare contract v0.2.

insert into public.algorithm_versions (
  code,label,status,evidence_level,configuration,content_hash,effective_from,retired_at,created_by
)
select
  'motion-functional-index-v0.5.1-poc',
  'Motion Functional Index v0.5.1 POC',
  status,
  evidence_level,
  jsonb_set(
    jsonb_set(
      configuration,
      '{myocare,core_required}',
      '["activation_pctMVC","LSI_pct_or_asymmetry_pct","calibration_id"]'::jsonb,
      true
    ),
    '{myocare,contract_version}',
    '"myodev-contract-v0.2"'::jsonb,
    true
  ) || jsonb_build_object(
    'version_note','Real MyoCare/MyoLab export compatibility; CCI descriptive and non-blocking',
    'release_requires_professional_review',true
  ),
  'motion-functional-index-v0.5.1-poc-20260828-mylab-contract-v02',
  now(),
  null,
  null
from public.algorithm_versions
where code='motion-functional-index-v0.5-poc'
on conflict (code) do update set
  label=excluded.label,
  status=excluded.status,
  evidence_level=excluded.evidence_level,
  configuration=excluded.configuration,
  content_hash=excluded.content_hash,
  effective_from=coalesce(public.algorithm_versions.effective_from,excluded.effective_from),
  retired_at=null;

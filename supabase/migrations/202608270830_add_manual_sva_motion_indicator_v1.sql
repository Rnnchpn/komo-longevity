insert into public.indicator_definitions (
  code, protocol_version, label_fr, domain, product_status, evidence_level,
  value_kind, canonical_unit, allowed_units, directionality,
  required_for_profile, scoring_role, configuration, status
)
values (
  'M-POS-02', 'motion-v0.4', 'SVA mesurée', 'context', 'M1', 'E5',
  'numeric', 'mm', '["mm"]'::jsonb, 'descriptive',
  false, 'descriptive',
  jsonb_build_object(
    'measurement','sagittal_vertical_axis',
    'source_mode','external_app_manual_entry',
    'measured_by','trained_operator',
    'photo_derived',false,
    'global_weight',0,
    'scoring_status','not_locked',
    'note','Valeur mesurée via une application externe puis saisie manuellement dans KŌMØ Pulse.'
  ),
  'active'
)
on conflict (code) do update set
  protocol_version=excluded.protocol_version,
  label_fr=excluded.label_fr,
  domain=excluded.domain,
  product_status=excluded.product_status,
  evidence_level=excluded.evidence_level,
  value_kind=excluded.value_kind,
  canonical_unit=excluded.canonical_unit,
  allowed_units=excluded.allowed_units,
  directionality=excluded.directionality,
  required_for_profile=excluded.required_for_profile,
  scoring_role=excluded.scoring_role,
  configuration=excluded.configuration,
  status=excluded.status,
  updated_at=now();

-- KŌMØ Pulse · real MyoCare/MyoLab export contract
-- Applied to production on 2026-08-28. Kept idempotent for reproducible environments.

insert into public.myodev_contract_versions(code,source_product,status,schema_version,vocabulary,validation_rules,content_hash,effective_from,retired_at)
select
  'myodev-contract-v0.2', source_product, 'active', '0.2.0',
  vocabulary || jsonb_build_object(
    'source_schema','myodev-komo-1.0',
    'source_versions',jsonb_build_array('MyoLab 3.8.x'),
    'source_metric_aliases',jsonb_build_object(
      'EMG_MVC_REF_UV','MVC_value',
      'EMG_ACTIVATION_PCTMVC','activation_pctMVC',
      'EMG_ACTIVATION_RATE_PCT','activation_rate_pct',
      'EMG_RMS_UV','EMG_RMS_uV',
      'EMG_LSI_PCT','LSI_pct',
      'GAIT_CADENCE','cadence_spm',
      'GAIT_STEP_COUNT','step_count',
      'GAIT_STANCE_TIME','stance_time_s',
      'GAIT_SWING_TIME','swing_time_s',
      'GAIT_STEP_TIME','step_time_s',
      'GAIT_STEP_LENGTH','step_length_m',
      'GAIT_DOUBLE_SUPPORT_PCT','double_support_pct',
      'GAIT_STANCE_SYMMETRY_PCT','gait_stance_symmetry_pct',
      'GAIT_STEP_LENGTH_SYMMETRY_PCT','gait_step_length_symmetry_pct',
      'GAIT_SPEED','gait_speed_m_s'
    )
  ),
  validation_rules || jsonb_build_object(
    'cci_policy','optional_descriptive_until_vendor_export_available',
    'calibration_derivation','EMG_MVC_REF_UV by session + muscle + side',
    'exercise_task_inference','EXERCICE_n containing GAIT_* is GAIT_4M'
  ),
  'myodev-contract-v0.2-mylab38-real-export-20260828', now(), null
from public.myodev_contract_versions
where code='myodev-contract-v0.1'
on conflict (code) do update set
  status=excluded.status,
  schema_version=excluded.schema_version,
  vocabulary=excluded.vocabulary,
  validation_rules=excluded.validation_rules,
  content_hash=excluded.content_hash,
  retired_at=null;

-- CCI is not exported by the current real MyoCare file and is not weighted in the
-- 60% mobility / 40% symmetry POC formula. Keep it descriptive, not fail-closed.
do $$
declare f text;
begin
  select pg_get_functiondef('public.calculate_motion_v05(uuid)'::regprocedure) into f;
  f := replace(f, 'v_required_total int := 8;', 'v_required_total int := 7;');
  f := replace(f, '(case when v_cci>0 then 1 else 0 end)+', '');
  f := replace(f, '  if v_cci=0 then v_missing:=array_append(v_missing,''MYODEV_CCI''); end if;' || chr(10), '');
  f := replace(f, 'v_import_ok>0 and v_activation>0 and v_cci>0 and v_symmetry>0 and v_calibrated>0', 'v_import_ok>0 and v_activation>0 and v_symmetry>0 and v_calibrated>0');
  f := replace(f, 'motion-functional-index-v0.5-poc', 'motion-functional-index-v0.5.1-poc');
  f := replace(f, 'poc-v0.5-internal', 'poc-v0.5.1-mylab-contract');
  f := replace(f, '''contract_version'',''myodev-contract-v0.1''', '''contract_version'',''myodev-contract-v0.2''');
  execute f;
end $$;

-- Idempotence is contract-aware: the same raw file can be reprocessed when its
-- interpretation contract changes (e.g. broken v0.1 -> real-export adapter v0.2).
alter table public.myodev_imports drop constraint if exists myodev_imports_import_hash_key;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.myodev_imports'::regclass
      and conname='myodev_imports_import_hash_contract_key'
  ) then
    alter table public.myodev_imports
      add constraint myodev_imports_import_hash_contract_key unique (import_hash, contract_version);
  end if;
end $$;

do $$
declare f text;
begin
  select pg_get_functiondef('public.import_pulse_myodev_result(uuid,text,text,text,text,text,text,text,jsonb,text,timestamptz,jsonb,jsonb)'::regprocedure) into f;
  f := replace(
    f,
    'select id into existing_import_id from public.myodev_imports where import_hash = target_import_hash;',
    'select id into existing_import_id from public.myodev_imports where import_hash = target_import_hash and contract_version = target_contract_code;'
  );
  execute f;
end $$;

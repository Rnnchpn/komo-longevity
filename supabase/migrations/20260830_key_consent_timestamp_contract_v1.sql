do $$
declare
  v_oid oid;
  v_def text;
begin
  select p.oid into v_oid
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'komo_key_report_snapshot'
    and p.prokind = 'f'
  limit 1;

  if v_oid is null then
    raise exception 'komo_key_report_snapshot_not_found';
  end if;

  v_def := pg_get_functiondef(v_oid);
  if position('wc.consented_at' in v_def) > 0 then
    v_def := replace(v_def, 'wc.consented_at', 'wc.accepted_at');
    execute v_def;
  end if;
end $$;

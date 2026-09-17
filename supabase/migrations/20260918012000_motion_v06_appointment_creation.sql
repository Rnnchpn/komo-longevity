-- Align future Motion assessments created from appointments with the active v0.6 protocol.
-- Idempotent because production was hotfixed before this migration file was added.
do $$
declare
  v_def text;
begin
  select pg_get_functiondef('private.ensure_motion_episode_for_appointment(uuid)'::regprocedure)
  into v_def;

  if position('motion-v0.5' in v_def) > 0 then
    v_def := replace(v_def, 'motion-v0.5', 'motion-clinical-v0.6');
    execute v_def;
  elsif position('motion-clinical-v0.6' in v_def) = 0 then
    raise exception 'unexpected_motion_protocol_creation_function';
  end if;
end
$$;

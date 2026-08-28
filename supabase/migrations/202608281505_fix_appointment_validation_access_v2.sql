create or replace function private.update_pulse_appointment(
  target_appointment_id uuid,
  target_status text,
  target_intake_status text default null
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  actor_id uuid := (select auth.uid());
  appointment_row public.organization_appointments%rowtype;
begin
  select * into appointment_row
  from public.organization_appointments
  where id = target_appointment_id
  for update;

  if appointment_row.id is null then
    raise exception 'appointment_not_found';
  end if;

  if actor_id is null or not (
    appointment_row.assigned_user_id = actor_id
    or private.user_has_org_role(
      appointment_row.organization_id,
      array['owner','clinical_admin','physician','operator','coordinator']::text[]
    )
    or private.user_is_global_admin()
  ) then
    raise exception 'appointment_access_denied';
  end if;

  if target_status not in ('scheduled','confirmed','arrived','in_progress','completed','cancelled','no_show')
    or (
      target_intake_status is not null
      and target_intake_status not in ('not_sent','invited','in_progress','submitted','reviewed')
    )
  then
    raise exception 'invalid_appointment_state';
  end if;

  update public.organization_appointments
  set status = target_status,
      intake_status = coalesce(target_intake_status, intake_status),
      intake_submitted_at = case
        when target_intake_status = 'submitted' then coalesce(intake_submitted_at, now())
        else intake_submitted_at
      end,
      intake_reviewed_at = case
        when target_intake_status = 'reviewed' then coalesce(intake_reviewed_at, now())
        else intake_reviewed_at
      end,
      updated_at = now()
  where id = target_appointment_id
  returning * into appointment_row;

  insert into public.audit_events(
    organization_id, patient_id, actor_user_id, event_type, entity_type, entity_id, event_detail
  )
  values (
    appointment_row.organization_id,
    appointment_row.patient_id,
    actor_id,
    'appointment.updated',
    'appointment',
    appointment_row.id::text,
    jsonb_build_object(
      'status', appointment_row.status,
      'intakeStatus', appointment_row.intake_status
    )
  );

  return jsonb_build_object(
    'id', appointment_row.id,
    'status', appointment_row.status,
    'intakeStatus', appointment_row.intake_status
  );
end;
$$;

grant execute on function public.approve_komo_appointment(uuid) to authenticated;

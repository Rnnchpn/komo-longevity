-- KŌMØ Pulse · allow controlled audit writes for users who can manage the target assessment.
-- Keeps RLS enabled and actor-bound; does not open direct public writes.

drop policy if exists audit_events_insert_actor on public.audit_events;

create policy audit_events_insert_actor
on public.audit_events
for insert
to authenticated
with check (
  actor_user_id = (select auth.uid())
  and (
    private.user_has_org_role(organization_id, null::text[])
    or (
      assessment_id is not null
      and private.user_can_manage_assessment(assessment_id)
    )
    or exists (
      select 1
      from public.patients p
      where p.id = audit_events.patient_id
        and p.patient_user_id = (select auth.uid())
        and (audit_events.organization_id is null or p.organization_id = audit_events.organization_id)
    )
  )
);

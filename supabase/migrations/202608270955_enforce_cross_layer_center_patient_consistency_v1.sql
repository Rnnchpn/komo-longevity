create or replace function private.enforce_patient_center_links()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  patient_org uuid;
  target_org uuid;
  target_pro uuid;
  require_active_pro boolean:=true;
begin
  if tg_table_name='patient_service_requests' then
    if new.patient_id is null then
      if new.assigned_professional_user_id is not null and new.assigned_organization_id is null then
        raise exception 'assigned_organization_required_for_professional';
      end if;
      if new.assigned_professional_user_id is not null and not exists(
        select 1 from public.organization_members m
        where m.organization_id=new.assigned_organization_id and m.user_id=new.assigned_professional_user_id and m.status='active'
      ) then raise exception 'assigned_professional_must_belong_to_center'; end if;
      return new;
    end if;
    target_org:=new.assigned_organization_id;
    target_pro:=new.assigned_professional_user_id;
  else
    if new.patient_id is null then raise exception 'patient_required'; end if;
    target_org:=new.organization_id;
    if tg_table_name='organization_appointments' then
      target_pro:=new.assigned_user_id;
    elsif tg_table_name='patient_care_assignments' then
      target_pro:=new.professional_user_id;
      require_active_pro:=new.status='active';
    else
      target_pro:=null;
    end if;
  end if;

  select p.organization_id into patient_org from public.patients p where p.id=new.patient_id;
  if patient_org is null then raise exception 'patient_not_found'; end if;
  if target_org is null or target_org<>patient_org then raise exception 'patient_center_mismatch'; end if;

  if require_active_pro and target_pro is not null and not exists(
    select 1 from public.organization_members m
    where m.organization_id=target_org and m.user_id=target_pro and m.status='active'
  ) then raise exception 'assigned_professional_must_belong_to_center'; end if;
  return new;
end;
$function$;

drop trigger if exists trg_message_threads_center_patient on public.message_threads;
create trigger trg_message_threads_center_patient before insert or update of organization_id,patient_id on public.message_threads
for each row execute function private.enforce_patient_center_links();

drop trigger if exists trg_appointments_center_patient on public.organization_appointments;
create trigger trg_appointments_center_patient before insert or update of organization_id,patient_id,assigned_user_id on public.organization_appointments
for each row execute function private.enforce_patient_center_links();

drop trigger if exists trg_care_assignments_center_patient on public.patient_care_assignments;
create trigger trg_care_assignments_center_patient before insert or update of organization_id,patient_id,professional_user_id,status on public.patient_care_assignments
for each row execute function private.enforce_patient_center_links();

drop trigger if exists trg_service_requests_center_patient on public.patient_service_requests;
create trigger trg_service_requests_center_patient before insert or update of assigned_organization_id,assigned_professional_user_id,patient_id on public.patient_service_requests
for each row execute function private.enforce_patient_center_links();

drop policy if exists message_threads_insert on public.message_threads;
create policy message_threads_insert on public.message_threads for insert to authenticated
with check (
  created_by=(select auth.uid())
  and exists(select 1 from public.patients p where p.id=message_threads.patient_id and p.organization_id=message_threads.organization_id)
  and private.user_can_access_patient(patient_id)
);

drop policy if exists message_threads_update on public.message_threads;
create policy message_threads_update on public.message_threads for update to authenticated
using (private.user_can_manage_patient(patient_id))
with check (
  private.user_can_manage_patient(patient_id)
  and exists(select 1 from public.patients p where p.id=message_threads.patient_id and p.organization_id=message_threads.organization_id)
);

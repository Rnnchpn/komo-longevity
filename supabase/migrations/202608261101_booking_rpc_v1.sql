-- Transactional patient booking RPCs. Production equivalent applied 2026-08-26.
create or replace function public.book_komo_appointment(
  p_organization_id uuid,p_service text,p_slot_start timestamptz
) returns uuid
language plpgsql security definer set search_path=public,private,auth as $$
declare
  uid uuid:=auth.uid();prof uuid;pid uuid;appt uuid;prof_role text;org_status text;pr public.profiles%rowtype;em text;duration_min int;slot_ok boolean;req_id uuid;patient_sex text;
begin
  if uid is null then raise exception 'unauthorized'; end if;
  if p_service not in ('motion','clinical') then raise exception 'invalid_service'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text||'|'||p_slot_start::text||'|'||p_service,0));
  select exists(select 1 from public.komo_booking_slots(p_organization_id,p_service,(p_slot_start at time zone coalesce((select timezone from public.organizations where id=p_organization_id),'Europe/Paris'))::date,2) s where s.slot_start=p_slot_start),bs.duration_minutes,o.clinical_data_status
  into slot_ok,duration_min,org_status from public.organization_booking_services bs join public.organizations o on o.id=bs.organization_id where bs.organization_id=p_organization_id and bs.service_type=p_service and bs.enabled and o.status='active';
  if not coalesce(slot_ok,false) then raise exception 'slot_unavailable'; end if;
  select * into pr from public.profiles where id=uid;
  if pr.first_name is null or pr.last_name is null or pr.birth_date is null then raise exception 'profile_incomplete'; end if;
  patient_sex:=case when pr.sex_at_birth='female' then 'female' when pr.sex_at_birth='male' then 'male' else 'not_stated' end;
  select email into em from auth.users where id=uid;
  select m.user_id,m.role into prof,prof_role from public.organization_members m where m.organization_id=p_organization_id and m.status='active'
    and ((p_service='motion' and m.role in ('owner','clinical_admin','physician','operator','coordinator') and m.access_scope in ('motion','clinical')) or (p_service='clinical' and m.role in ('owner','clinical_admin','physician') and m.access_scope='clinical'))
    and not exists(select 1 from public.organization_appointments a where a.assigned_user_id=m.user_id and a.status in ('scheduled','confirmed','arrived','in_progress') and tstzrange(a.scheduled_start,a.scheduled_end,'[)')&&tstzrange(p_slot_start,p_slot_start+duration_min*interval '1 minute','[)'))
  order by case m.role when 'physician' then 1 when 'owner' then 2 when 'clinical_admin' then 3 when 'operator' then 4 else 5 end,m.user_id limit 1;
  if prof is null then raise exception 'slot_unavailable'; end if;
  select id into pid from public.patients where organization_id=p_organization_id and patient_user_id=uid order by created_at limit 1;
  if pid is null then
    insert into public.patients(organization_id,patient_user_id,external_reference,first_name,last_name,preferred_name,birth_date,sex_at_birth,email,phone,locale,status,created_by,data_classification,synthetic_attested_at,synthetic_attested_by)
    values(p_organization_id,uid,'PULSE-'||substr(uid::text,1,8)||'-'||substr(gen_random_uuid()::text,1,6),pr.first_name,pr.last_name,nullif(pr.display_name,''),pr.birth_date,patient_sex,em,pr.phone,pr.locale,'active',uid,case when org_status='test_only' then 'synthetic' else 'health_data' end,case when org_status='test_only' then now() else null end,case when org_status='test_only' then uid else null end)
    returning id into pid;
  end if;
  insert into public.organization_appointments(organization_id,patient_id,assigned_user_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,service_code,payment_status,intake_status,created_by,booking_source,booked_by_user_id)
  values(p_organization_id,pid,prof,p_service,p_slot_start,p_slot_start+duration_min*interval '1 minute','confirmed','in_person',case when p_service='motion' then 'KOMO_MOTION' else 'KOMO_CLINICAL' end,'unpaid','not_sent',uid,'patient',uid) returning id into appt;
  select id into req_id from public.patient_service_requests where user_id=uid and service=p_service and status in ('submitted','assigned','accepted','scheduled') order by submitted_at desc limit 1;
  if req_id is null then
    insert into public.patient_service_requests(user_id,service,status,assigned_organization_id,assigned_professional_user_id,patient_id,submitted_at,assigned_at,accepted_at,scheduled_at)
    values(uid,p_service,'scheduled',p_organization_id,prof,pid,now(),now(),now(),p_slot_start) returning id into req_id;
  else
    update public.patient_service_requests set status='scheduled',assigned_organization_id=p_organization_id,assigned_professional_user_id=prof,patient_id=pid,assigned_at=coalesce(assigned_at,now()),accepted_at=coalesce(accepted_at,now()),scheduled_at=p_slot_start,updated_at=now() where id=req_id;
  end if;
  return appt;
exception when unique_violation then raise exception 'slot_unavailable';
end;
$$;
revoke all on function public.book_komo_appointment(uuid,text,timestamptz) from public;grant execute on function public.book_komo_appointment(uuid,text,timestamptz) to authenticated;

create or replace function public.cancel_my_komo_appointment(p_appointment_id uuid) returns boolean
language plpgsql security definer set search_path=public,private,auth as $$
declare uid uuid:=auth.uid();a public.organization_appointments%rowtype;
begin
 if uid is null then raise exception 'unauthorized'; end if;
 select a0.* into a from public.organization_appointments a0 join public.patients p on p.id=a0.patient_id where a0.id=p_appointment_id and p.patient_user_id=uid;
 if a.id is null then raise exception 'not_found'; end if;
 if a.scheduled_start<=now() then raise exception 'cannot_cancel_past'; end if;
 update public.organization_appointments set status='cancelled',updated_at=now() where id=a.id;
 update public.patient_service_requests set status='cancelled',updated_at=now() where patient_id=a.patient_id and service=a.appointment_type and scheduled_at=a.scheduled_start and status='scheduled';
 return true;
end;
$$;
revoke all on function public.cancel_my_komo_appointment(uuid) from public;grant execute on function public.cancel_my_komo_appointment(uuid) to authenticated;

create or replace function public.komo_professional_create_patient(
  p_organization_id uuid,
  p_first_name text,
  p_last_name text,
  p_birth_date date,
  p_sex_at_birth text default 'not_stated',
  p_email text default null,
  p_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid := auth.uid();
  v_account_role text;
  v_member_role text;
  v_member_scope text;
  v_org public.organizations%rowtype;
  v_patient public.patients%rowtype;
  v_existing_user uuid;
  v_email text := nullif(lower(trim(coalesce(p_email,''))),'');
  v_first text := nullif(left(trim(coalesce(p_first_name,'')),100),'');
  v_last text := nullif(left(trim(coalesce(p_last_name,'')),100),'');
  v_phone text := nullif(left(trim(coalesce(p_phone,'')),80),'');
  v_assignment_role text;
begin
  if uid is null then raise exception 'unauthorized'; end if;
  if v_first is null or v_last is null or p_birth_date is null then raise exception 'invalid_patient_fields'; end if;
  if p_sex_at_birth not in ('female','male','intersex','unknown','not_stated') then raise exception 'invalid_sex_at_birth'; end if;

  select ar.role into v_account_role from public.account_roles ar where ar.user_id=uid;
  if v_account_role not in ('professional','admin') then raise exception 'professional_required'; end if;

  select * into v_org from public.organizations o where o.id=p_organization_id;
  if v_org.id is null or v_org.status<>'active' then raise exception 'active_organization_required'; end if;
  if v_org.clinical_data_status not in ('test_only','production_enabled') then raise exception 'center_data_status_unavailable'; end if;

  select m.role,m.access_scope into v_member_role,v_member_scope
  from public.organization_members m
  where m.organization_id=p_organization_id and m.user_id=uid and m.status='active'
  limit 1;

  if v_account_role<>'admin'
     and (v_member_role is null or v_member_role not in ('owner','clinical_admin','physician','operator','coordinator'))
  then raise exception 'patient_create_scope_required'; end if;

  if v_email is not null then
    select u.id into v_existing_user from auth.users u
    where lower(u.email)=v_email order by u.created_at limit 1;
  end if;

  if v_existing_user is not null then
    select * into v_patient from public.patients p
    where p.organization_id=p_organization_id and p.patient_user_id=v_existing_user and p.status<>'archived'
    order by p.created_at limit 1;
  elsif v_email is not null then
    select * into v_patient from public.patients p
    where p.organization_id=p_organization_id and lower(coalesce(p.email,''))=v_email
      and p.birth_date=p_birth_date and p.status<>'archived'
    order by p.created_at limit 1;
  end if;

  if v_patient.id is null then
    insert into public.patients(
      organization_id,patient_user_id,external_reference,first_name,last_name,birth_date,sex_at_birth,email,phone,locale,status,created_by,
      data_classification,synthetic_attested_at,synthetic_attested_by
    ) values(
      p_organization_id,v_existing_user,'PRO-'||substr(gen_random_uuid()::text,1,12),v_first,v_last,p_birth_date,p_sex_at_birth,v_email,v_phone,'fr-FR','active',uid,
      case when v_org.clinical_data_status='test_only' then 'synthetic' else 'health_data' end,
      case when v_org.clinical_data_status='test_only' then now() else null end,
      case when v_org.clinical_data_status='test_only' then uid else null end
    ) returning * into v_patient;
  elsif v_existing_user is not null and v_patient.patient_user_id is null then
    update public.patients set patient_user_id=v_existing_user where id=v_patient.id returning * into v_patient;
  end if;

  if v_member_role is not null then
    v_assignment_role:=case v_member_role
      when 'physician' then 'clinical_practitioner'
      when 'operator' then 'motion_operator'
      when 'coordinator' then 'coordinator'
      else 'primary'
    end;
    insert into public.patient_care_assignments(
      organization_id,patient_id,professional_user_id,assignment_role,access_scope,status,source,assigned_by,assigned_at
    ) values(
      p_organization_id,v_patient.id,uid,v_assignment_role,
      case when v_member_scope='clinical' then 'clinical' else 'motion' end,
      'active','patient_created',uid,now()
    )
    on conflict (patient_id,professional_user_id) where status='active' do nothing;
  end if;

  return jsonb_build_object(
    'ok',true,'patient',to_jsonb(v_patient),
    'account',jsonb_build_object('linked',v_patient.patient_user_id is not null,'existing_user',v_existing_user is not null,'email',v_email)
  );
end;
$function$;

grant execute on function public.komo_professional_create_patient(uuid,text,text,date,text,text,text) to authenticated;

create or replace function private.link_invited_komo_patient()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_patient_id uuid;
begin
  if new.email is null then return new; end if;
  begin
    v_patient_id := nullif(new.raw_user_meta_data ->> 'komo_patient_id','')::uuid;
  exception when others then
    v_patient_id := null;
  end;
  if v_patient_id is null then return new; end if;

  update public.patients p
  set patient_user_id=new.id
  where p.id=v_patient_id
    and p.patient_user_id is null
    and p.status<>'archived'
    and lower(coalesce(p.email,''))=lower(new.email);

  return new;
end;
$function$;

create trigger zzz_link_invited_komo_patient
after insert on auth.users
for each row execute function private.link_invited_komo_patient();

-- KŌMØ Pulse RC1 hardening
-- Professional approval must be monotonic: it may grant access, but it must never
-- downgrade an existing global Admin, center Owner/Clinical Admin, or Clinical scope.

create or replace function public.approve_professional_application_v1(
  p_application_id uuid,
  p_organization_role text default null,
  p_review_note text default null
) returns jsonb
language plpgsql
security definer
set search_path to 'public','auth'
as $function$
declare
  v_admin uuid := auth.uid();
  v_app public.professional_applications%rowtype;
  v_scope text;
  v_role text;
  v_effective_role text;
  v_effective_scope text;
  v_effective_account_role text;
  v_org public.organizations%rowtype;
  v_org_name text;
  v_slug_base text;
  v_slug text;
  v_country text := 'FR';
  v_now timestamptz := now();
  v_previous public.komo_application_status;
begin
  if v_admin is null then
    raise exception 'unauthorized' using errcode='42501';
  end if;

  if not exists (
    select 1 from public.account_roles
    where user_id=v_admin and role='admin'::public.komo_role
  ) then
    raise exception 'admin_required' using errcode='42501';
  end if;

  select * into v_app
  from public.professional_applications
  where id=p_application_id
  for update;

  if not found then raise exception 'application_not_found'; end if;
  if v_app.status not in (
    'submitted'::public.komo_application_status,
    'under_review'::public.komo_application_status,
    'approved'::public.komo_application_status
  ) then
    raise exception 'invalid_status_transition:%',v_app.status;
  end if;

  v_previous:=v_app.status;
  v_scope:=case when v_app.access_scope='motion' then 'motion' else 'clinical' end;

  if v_scope='clinical' and (
    nullif(trim(coalesce(v_app.registration_identifier,'')),'') is null or
    nullif(trim(coalesce(v_app.registration_system,'')),'') is null
  ) then
    raise exception 'clinical_registration_required';
  end if;

  v_org_name:=left(trim(coalesce(v_app.organization_name,'')),180);
  if length(v_org_name)<2 then raise exception 'organization_name_required'; end if;

  if v_scope='motion' then
    v_role:=case
      when coalesce(p_organization_role,'operator') in ('owner','operator','coordinator','viewer')
        then coalesce(p_organization_role,'operator')
      else 'operator'
    end;
  else
    v_role:=case
      when coalesce(p_organization_role,'physician') in ('owner','clinical_admin','physician','operator','coordinator','viewer')
        then coalesce(p_organization_role,'physician')
      else 'physician'
    end;
  end if;

  select * into v_org
  from public.organizations
  where lower(name)=lower(v_org_name) and status='active'
  order by created_at asc
  limit 1;

  if not found then
    v_slug_base:=lower(trim(both '-' from regexp_replace(v_org_name,'[^A-Za-z0-9]+','-','g')));
    if v_slug_base is null or v_slug_base='' then v_slug_base:='komo-partner'; end if;
    v_slug:=left(v_slug_base,46)||'-'||substr(replace(v_app.id::text,'-',''),1,8);

    if lower(coalesce(v_app.territory,'')) ~ '(spain|espagne|españa)' then v_country:='ES';
    elsif lower(coalesce(v_app.territory,'')) ~ '(belgium|belgique|belgië)' then v_country:='BE';
    elsif lower(coalesce(v_app.territory,'')) ~ '(switzerland|suisse|schweiz)' then v_country:='CH';
    elsif lower(coalesce(v_app.territory,'')) ~ '(italy|italie|italia)' then v_country:='IT';
    elsif lower(coalesce(v_app.territory,'')) ~ '(portugal)' then v_country:='PT';
    elsif lower(coalesce(v_app.territory,'')) ~ '(germany|allemagne|deutschland)' then v_country:='DE';
    elsif lower(coalesce(v_app.territory,'')) ~ '(united kingdom|royaume-uni|uk)' then v_country:='GB';
    else v_country:='FR';
    end if;

    insert into public.organizations(
      name,slug,country_code,timezone,status,created_by,clinical_data_status
    ) values(
      v_org_name,v_slug,v_country,'Europe/Paris','active',v_admin,'test_only'
    ) returning * into v_org;
  end if;

  insert into public.organization_members(
    organization_id,user_id,role,status,invited_by,joined_at,access_scope,updated_at
  ) values(
    v_org.id,v_app.user_id,v_role,'active',v_admin,v_now,v_scope,v_now
  )
  on conflict (organization_id,user_id) do update set
    role=case
      when public.organization_members.role in ('owner','clinical_admin')
        then public.organization_members.role
      else excluded.role
    end,
    status='active',
    invited_by=coalesce(public.organization_members.invited_by,excluded.invited_by),
    joined_at=coalesce(public.organization_members.joined_at,excluded.joined_at),
    access_scope=case
      when public.organization_members.access_scope='clinical' then 'clinical'
      else excluded.access_scope
    end,
    updated_at=excluded.updated_at;

  select role,access_scope
  into v_effective_role,v_effective_scope
  from public.organization_members
  where organization_id=v_org.id and user_id=v_app.user_id;

  insert into public.account_roles(user_id,role,approved_at,approved_by)
  values(v_app.user_id,'professional'::public.komo_role,v_now,v_admin)
  on conflict (user_id) do update set
    role=case
      when public.account_roles.role='admin'::public.komo_role
        then public.account_roles.role
      else 'professional'::public.komo_role
    end,
    approved_at=excluded.approved_at,
    approved_by=excluded.approved_by;

  select role::text into v_effective_account_role
  from public.account_roles
  where user_id=v_app.user_id;

  update public.professional_applications
  set status='approved'::public.komo_application_status,
      reviewed_at=v_now,
      reviewed_by=v_admin,
      review_note=nullif(left(trim(coalesce(p_review_note,'')),1500),'')
  where id=v_app.id;

  if not exists (
    select 1 from public.professional_application_events
    where application_id=v_app.id
      and event_type='approved'
      and status='approved'::public.komo_application_status
  ) then
    insert into public.professional_application_events(
      application_id,user_id,actor_user_id,event_type,previous_status,status,event_detail
    ) values(
      v_app.id,v_app.user_id,v_admin,'approved',v_previous,
      'approved'::public.komo_application_status,
      jsonb_build_object(
        'organization_id',v_org.id,
        'organization_name',v_org.name,
        'organization_role',v_effective_role,
        'access_scope',v_effective_scope,
        'clinical_data_status',v_org.clinical_data_status,
        'registration_system',v_app.registration_system,
        'review_note',nullif(left(trim(coalesce(p_review_note,'')),1500),'')
      )
    );
  end if;

  return jsonb_build_object(
    'ok',true,
    'status','approved',
    'organization',jsonb_build_object(
      'id',v_org.id,
      'name',v_org.name,
      'slug',v_org.slug,
      'clinical_data_status',v_org.clinical_data_status,
      'status',v_org.status
    ),
    'organization_role',v_effective_role,
    'access_scope',v_effective_scope,
    'account_role',v_effective_account_role,
    'clinical_data_status',v_org.clinical_data_status
  );
end;
$function$;

alter table public.organizations add column if not exists latitude double precision;
alter table public.organizations add column if not exists longitude double precision;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='organizations_latitude_check') then
    alter table public.organizations add constraint organizations_latitude_check check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (select 1 from pg_constraint where conname='organizations_longitude_check') then
    alter table public.organizations add constraint organizations_longitude_check check (longitude is null or longitude between -180 and 180);
  end if;
end $$;

create or replace function public.komo_booking_directory()
returns jsonb
language sql
security definer
set search_path to 'public','private','auth'
as $function$
with published_orgs as (
  select o.id,o.name,o.city,o.address_line,o.postal_code,o.country_code,o.timezone,
    o.latitude,o.longitude,o.contact_email,o.contact_phone,o.website_url,o.public_description,
    exists(select 1 from public.organization_booking_services s where s.organization_id=o.id and s.service_type='motion' and s.enabled) as motion_enabled,
    exists(select 1 from public.organization_booking_services s where s.organization_id=o.id and s.service_type='clinical' and s.enabled) as clinical_enabled
  from public.organizations o
  where o.status='active'
    and coalesce(o.booking_published,false)=true
    and exists(select 1 from public.organization_booking_services s where s.organization_id=o.id and s.enabled)
), professionals as (
  select m.user_id,m.organization_id,m.role,m.access_scope,p.display_name,p.first_name,p.last_name,p.city as profile_city,p.country as profile_country,
    po.name as organization_name,po.city as organization_city,po.country_code,po.latitude,po.longitude,po.motion_enabled,po.clinical_enabled,
    po.contact_email,po.contact_phone,po.website_url,po.public_description
  from public.organization_members m
  join published_orgs po on po.id=m.organization_id
  left join public.profiles p on p.id=m.user_id
  where m.status='active'
    and m.role in ('owner','clinical_admin','physician','operator','coordinator')
    and m.access_scope in ('motion','clinical')
)
select jsonb_build_object(
  'centers',coalesce((
    select jsonb_agg(jsonb_build_object(
      'entity_type','center','entity_id',po.id,'organization_id',po.id,'name',po.name,
      'city',po.city,'address_line',po.address_line,'postal_code',po.postal_code,'country_code',po.country_code,
      'timezone',po.timezone,'latitude',po.latitude,'longitude',po.longitude,
      'motion_enabled',po.motion_enabled,'clinical_enabled',po.clinical_enabled,'verified',true,
      'contact_email',po.contact_email,'contact_phone',po.contact_phone,'website_url',po.website_url,'public_description',po.public_description
    ) order by po.name) from published_orgs po
  ),'[]'::jsonb),
  'professionals',coalesce((
    select jsonb_agg(jsonb_build_object(
      'entity_type','professional','entity_id',pr.user_id,'organization_id',pr.organization_id,
      'name',coalesce(nullif(trim(concat_ws(' ',pr.first_name,pr.last_name)),''),nullif(pr.display_name,''),'Professionnel KŌMØ'),
      'organization_name',pr.organization_name,'city',coalesce(pr.profile_city,pr.organization_city),
      'country_code',coalesce(pr.profile_country,pr.country_code),'latitude',pr.latitude,'longitude',pr.longitude,
      'role',pr.role,'access_scope',pr.access_scope,
      'motion_enabled',(pr.motion_enabled and pr.access_scope in ('motion','clinical')),
      'clinical_enabled',(pr.clinical_enabled and pr.access_scope='clinical' and pr.role in ('owner','clinical_admin','physician')),
      'verified',true,'contact_email',pr.contact_email,'contact_phone',pr.contact_phone,'website_url',pr.website_url,'public_description',pr.public_description
    ) order by pr.organization_name,coalesce(pr.last_name,pr.display_name),pr.user_id) from professionals pr
  ),'[]'::jsonb)
);
$function$;
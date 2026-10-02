-- KŌMØ World / ONE / ECHELON V1
-- Production migration applied 2026-10-02. Kept in source control as the canonical schema.

create table if not exists public.world_entitlement_catalog (
  code text primary key,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.world_tier_entitlements (
  tier text not null check (tier in ('one','echelon')),
  entitlement_code text not null references public.world_entitlement_catalog(code) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tier,entitlement_code)
);
create table if not exists public.world_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null check (tier in ('one','echelon')),
  status text not null default 'active' check (status in ('active','suspended','revoked')),
  founding boolean not null default true,
  access_started_at timestamptz not null default now(),
  access_ends_at timestamptz,
  source text not null default 'manual' check (source in ('manual','assessment','founding','import')),
  source_assessment_id uuid references public.assessments(id) on delete set null,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.world_member_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_code text not null references public.world_entitlement_catalog(code) on delete cascade,
  allowed boolean not null,
  reason text,
  starts_at timestamptz,
  ends_at timestamptz,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id,entitlement_code)
);
create table if not exists public.world_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interests text[] not null default '{}',
  home_destination text,
  presence_opt_in boolean not null default false,
  introductions_opt_in boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.world_temporary_layers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  destination text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  visibility text not null default 'public' check (visibility in ('public','one','echelon')),
  required_entitlement text references public.world_entitlement_catalog(code),
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.world_places (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  destination text not null,
  city text,
  country_code text not null default 'FR',
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  category text not null check (category in ('eat','stay','move','recover','experience','meet')),
  place_type text not null default 'place',
  curation_status text not null default 'draft' check (curation_status in ('draft','selected','rejected','hidden')),
  commercial_status text not null default 'none' check (commercial_status in ('none','prospect','partner','paused')),
  approved_by uuid references auth.users(id) on delete set null,
  editorial_reason text not null default '',
  summary text not null default '',
  visibility text not null default 'public' check (visibility in ('public','one','echelon')),
  member_scope text[] not null default '{}',
  required_entitlement text references public.world_entitlement_catalog(code),
  privileges jsonb not null default '{}'::jsonb,
  commission_model text,
  temporary_layer_id uuid references public.world_temporary_layers(id) on delete set null,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists world_places_map_idx on public.world_places(destination,category) where is_active and curation_status='selected';
create index if not exists world_places_visibility_idx on public.world_places(visibility,required_entitlement) where is_active;

create table if not exists public.world_saved_places (
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.world_places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id,place_id)
);
create index if not exists world_saved_places_place_idx on public.world_saved_places(place_id);

create table if not exists public.world_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  destination text not null,
  place_id uuid references public.world_places(id) on delete set null,
  summary text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  visibility text not null default 'public' check (visibility in ('public','one','echelon')),
  required_entitlement text references public.world_entitlement_catalog(code),
  request_mode text not null default 'request' check (request_mode in ('open','request','invite_only')),
  capacity integer check (capacity is null or capacity>0),
  temporary_layer_id uuid references public.world_temporary_layers(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists world_events_window_idx on public.world_events(starts_at,ends_at) where is_active;

create table if not exists public.world_event_attendance (
  event_id uuid not null references public.world_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','accepted','declined','attended','cancelled')),
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id,user_id)
);
create index if not exists world_event_attendance_user_idx on public.world_event_attendance(user_id,status);

create table if not exists public.world_experiences (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  destination text not null,
  place_id uuid references public.world_places(id) on delete set null,
  operator_name text not null default 'KŌMØ',
  summary text not null default '',
  why_komo text not null default '',
  visibility text not null default 'public' check (visibility in ('public','one','echelon')),
  required_entitlement text references public.world_entitlement_catalog(code),
  request_mode text not null default 'request' check (request_mode in ('open','request','invite_only')),
  available_from timestamptz,
  available_until timestamptz,
  temporary_layer_id uuid references public.world_temporary_layers(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists world_experiences_destination_idx on public.world_experiences(destination) where is_active;

create table if not exists public.world_passport_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_type text not null check (entry_type in ('destination','place','event','experience','moment')),
  title text not null,
  destination text,
  place_id uuid references public.world_places(id) on delete set null,
  event_id uuid references public.world_events(id) on delete set null,
  experience_id uuid references public.world_experiences(id) on delete set null,
  occurred_at timestamptz not null default now(),
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists world_passport_user_time_idx on public.world_passport_entries(user_id,occurred_at desc);

create table if not exists public.world_card_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_type text not null check (card_type in ('one','echelon')),
  status text not null default 'requested' check (status in ('requested','approved','production','shipped','delivered','cancelled')),
  delivery_name text not null,
  delivery_address_line1 text not null,
  delivery_address_line2 text,
  delivery_postal_code text not null,
  delivery_city text not null,
  delivery_country text not null,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists world_card_claims_active_unique on public.world_card_claims(user_id,card_type)
where status in ('requested','approved','production','shipped');

create table if not exists public.world_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_type text not null check (card_type in ('one','echelon')),
  status text not null default 'active' check (status in ('active','revoked','lost','replaced')),
  nfc_token_hash text not null unique,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  issued_by uuid references auth.users(id) on delete set null,
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists world_cards_user_idx on public.world_cards(user_id,status);

create table if not exists public.world_concierge_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null default 'ask_komo',
  prompt text not null check (char_length(prompt) between 3 and 1200),
  destination text,
  requested_for timestamptz,
  status text not null default 'submitted' check (status in ('submitted','triaged','in_progress','answered','closed','cancelled')),
  priority text not null default 'standard' check (priority in ('standard','priority')),
  response text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists world_concierge_user_idx on public.world_concierge_requests(user_id,created_at desc);
create index if not exists world_concierge_status_idx on public.world_concierge_requests(status,created_at desc);

create table if not exists public.world_membership_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  previous_tier text,
  next_tier text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists world_membership_events_user_idx on public.world_membership_events(user_id,created_at desc);

insert into public.world_entitlement_catalog(code,title,description) values
 ('world.my_world.view','My World','Personalised member World'),
 ('world.saved_places.manage','Saved Places','Save and manage places'),
 ('world.member_places.view','Member Places','View ONE member places'),
 ('world.private_places.view','Private Places','View ECHELON private places'),
 ('world.member_events.view','Member Events','View member events'),
 ('world.private_events.view','Private Events','View private ECHELON events'),
 ('event.member.rsvp','Member Event RSVP','Request or RSVP to member events'),
 ('event.private.request','Private Event Request','Request private event access'),
 ('world.member_experiences.view','Member Experiences','View member experiences'),
 ('world.private_experiences.view','Private Experiences','View private experiences'),
 ('world.member_privileges.view','Member Privileges','View member privileges'),
 ('world.passport.view','KŌMØ Passport','View personal KŌMØ Passport'),
 ('world.card.digital.view','Digital Card','View digital KŌMØ Card'),
 ('card.physical.claim','Physical Card Claim','Claim a physical KŌMØ Card'),
 ('world.pulse_bridge.open','Pulse Bridge','Open Pulse from World'),
 ('world.event_layer.view','Temporary Event Layers','View private temporary World layers'),
 ('concierge.request','Ask KŌMØ','Submit concierge requests'),
 ('concierge.priority','Priority Concierge','Priority response handling'),
 ('experience.book','Experience Request','Request member experiences'),
 ('experience.private.request','Private Experience Request','Request private experiences'),
 ('people.introduction.request','Introductions','Request consented introductions'),
 ('guest_pass.create','Guest Access','Create a temporary guest pass'),
 ('partner.priority_access','Partner Priority Access','Priority access with selected partners'),
 ('yacht.private_services.request','Yacht & Villa Services','Request private yacht or villa services')
on conflict(code) do update set title=excluded.title,description=excluded.description;

insert into public.world_tier_entitlements(tier,entitlement_code) values
 ('one','world.my_world.view'),('one','world.saved_places.manage'),('one','world.member_places.view'),
 ('one','world.member_events.view'),('one','event.member.rsvp'),('one','world.member_experiences.view'),
 ('one','world.member_privileges.view'),('one','world.passport.view'),('one','world.card.digital.view'),
 ('one','card.physical.claim'),('one','world.pulse_bridge.open'),('one','experience.book'),
 ('echelon','world.my_world.view'),('echelon','world.saved_places.manage'),('echelon','world.member_places.view'),
 ('echelon','world.private_places.view'),('echelon','world.member_events.view'),('echelon','world.private_events.view'),
 ('echelon','event.member.rsvp'),('echelon','event.private.request'),('echelon','world.member_experiences.view'),
 ('echelon','world.private_experiences.view'),('echelon','world.member_privileges.view'),('echelon','world.passport.view'),
 ('echelon','world.card.digital.view'),('echelon','card.physical.claim'),('echelon','world.pulse_bridge.open'),
 ('echelon','world.event_layer.view'),('echelon','concierge.request'),('echelon','concierge.priority'),
 ('echelon','experience.book'),('echelon','experience.private.request'),('echelon','people.introduction.request'),
 ('echelon','guest_pass.create'),('echelon','partner.priority_access'),('echelon','yacht.private_services.request')
on conflict do nothing;

alter table public.world_entitlement_catalog enable row level security;
alter table public.world_tier_entitlements enable row level security;
alter table public.world_memberships enable row level security;
alter table public.world_member_entitlements enable row level security;
alter table public.world_preferences enable row level security;
alter table public.world_temporary_layers enable row level security;
alter table public.world_places enable row level security;
alter table public.world_saved_places enable row level security;
alter table public.world_events enable row level security;
alter table public.world_event_attendance enable row level security;
alter table public.world_experiences enable row level security;
alter table public.world_passport_entries enable row level security;
alter table public.world_card_claims enable row level security;
alter table public.world_cards enable row level security;
alter table public.world_concierge_requests enable row level security;
alter table public.world_membership_events enable row level security;

grant select on public.world_entitlement_catalog,public.world_tier_entitlements to anon,authenticated;
grant select on public.world_memberships,public.world_member_entitlements to authenticated;
grant select,insert,update on public.world_preferences to authenticated;
grant select on public.world_places,public.world_events,public.world_experiences,public.world_temporary_layers to anon,authenticated;
grant select,insert,delete on public.world_saved_places to authenticated;
grant select,insert,update on public.world_event_attendance to authenticated;
grant select on public.world_passport_entries to authenticated;
grant select,insert on public.world_card_claims to authenticated;
grant select,insert on public.world_concierge_requests to authenticated;

create or replace function public.komo_world_has_entitlement(p_code text)
returns boolean language plpgsql stable security invoker set search_path=public,pg_temp as $$
declare v_uid uuid:=auth.uid();v_override boolean;v_tier text;
begin
 if v_uid is null or nullif(trim(p_code),'') is null then return false; end if;
 select allowed into v_override from public.world_member_entitlements
 where user_id=v_uid and entitlement_code=p_code
   and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now()) limit 1;
 if found then return v_override; end if;
 select tier into v_tier from public.world_memberships
 where user_id=v_uid and status='active' and access_started_at<=now() and (access_ends_at is null or access_ends_at>now()) limit 1;
 if v_tier is null then return false; end if;
 return exists(select 1 from public.world_tier_entitlements where tier=v_tier and entitlement_code=p_code);
end $$;
grant execute on function public.komo_world_has_entitlement(text) to anon,authenticated;

create or replace function public.komo_world_access_snapshot()
returns jsonb language plpgsql stable security invoker set search_path=public,pg_temp as $$
declare v_uid uuid:=auth.uid();v_membership public.world_memberships%rowtype;v_codes text[];
begin
 if v_uid is null then return jsonb_build_object('authenticated',false,'tier','public','founding',false,'entitlements','[]'::jsonb); end if;
 select * into v_membership from public.world_memberships where user_id=v_uid and status='active'
 and access_started_at<=now() and (access_ends_at is null or access_ends_at>now()) limit 1;
 if v_membership.user_id is null then return jsonb_build_object('authenticated',true,'tier','public','founding',false,'entitlements','[]'::jsonb); end if;
 select coalesce(array_agg(code order by code),'{}'::text[]) into v_codes from (
   select te.entitlement_code code from public.world_tier_entitlements te
   where te.tier=v_membership.tier and not exists(
     select 1 from public.world_member_entitlements me where me.user_id=v_uid and me.entitlement_code=te.entitlement_code
       and me.allowed=false and (me.starts_at is null or me.starts_at<=now()) and (me.ends_at is null or me.ends_at>now()))
   union
   select me.entitlement_code from public.world_member_entitlements me where me.user_id=v_uid and me.allowed=true
     and (me.starts_at is null or me.starts_at<=now()) and (me.ends_at is null or me.ends_at>now())
 ) x;
 return jsonb_build_object('authenticated',true,'tier',v_membership.tier,'founding',v_membership.founding,
  'label',case when v_membership.founding then 'FOUNDING '||upper(v_membership.tier) else upper(v_membership.tier) end,
  'entitlements',to_jsonb(v_codes),'access_started_at',v_membership.access_started_at,'access_ends_at',v_membership.access_ends_at);
end $$;
grant execute on function public.komo_world_access_snapshot() to authenticated;

create policy world_entitlement_catalog_read on public.world_entitlement_catalog for select to anon,authenticated using(true);
create policy world_tier_entitlements_read on public.world_tier_entitlements for select to anon,authenticated using(true);
create policy world_memberships_self_read on public.world_memberships for select to authenticated using((select auth.uid())=user_id);
create policy world_member_entitlements_self_read on public.world_member_entitlements for select to authenticated using((select auth.uid())=user_id);
create policy world_preferences_self_read on public.world_preferences for select to authenticated using((select auth.uid())=user_id);
create policy world_preferences_self_insert on public.world_preferences for insert to authenticated with check((select auth.uid())=user_id);
create policy world_preferences_self_update on public.world_preferences for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy world_places_visible on public.world_places for select to anon,authenticated using(
 curation_status='selected' and is_active and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now())
 and ((visibility='public' and required_entitlement is null) or (required_entitlement is not null and public.komo_world_has_entitlement(required_entitlement))));
create policy world_temporary_layers_visible on public.world_temporary_layers for select to anon,authenticated using(
 is_active and starts_at<=now() and ends_at>now()
 and ((visibility='public' and required_entitlement is null) or (required_entitlement is not null and public.komo_world_has_entitlement(required_entitlement))));
create policy world_events_visible on public.world_events for select to anon,authenticated using(
 is_active and ((visibility='public' and required_entitlement is null) or (required_entitlement is not null and public.komo_world_has_entitlement(required_entitlement))));
create policy world_experiences_visible on public.world_experiences for select to anon,authenticated using(
 is_active and (available_from is null or available_from<=now()) and (available_until is null or available_until>now())
 and ((visibility='public' and required_entitlement is null) or (required_entitlement is not null and public.komo_world_has_entitlement(required_entitlement))));
create policy world_saved_places_self_select on public.world_saved_places for select to authenticated using((select auth.uid())=user_id);
create policy world_saved_places_self_insert on public.world_saved_places for insert to authenticated with check((select auth.uid())=user_id and public.komo_world_has_entitlement('world.saved_places.manage'));
create policy world_saved_places_self_delete on public.world_saved_places for delete to authenticated using((select auth.uid())=user_id and public.komo_world_has_entitlement('world.saved_places.manage'));
create policy world_event_attendance_self_select on public.world_event_attendance for select to authenticated using((select auth.uid())=user_id);
create policy world_event_attendance_self_update on public.world_event_attendance for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id and status in('requested','cancelled'));
create policy world_passport_self_select on public.world_passport_entries for select to authenticated using((select auth.uid())=user_id and public.komo_world_has_entitlement('world.passport.view'));
create policy world_card_claims_self_select on public.world_card_claims for select to authenticated using((select auth.uid())=user_id);
create policy world_card_claims_self_insert on public.world_card_claims for insert to authenticated with check(
 (select auth.uid())=user_id and public.komo_world_has_entitlement('card.physical.claim')
 and card_type=(select tier from public.world_memberships where user_id=(select auth.uid()) and status='active'));
create policy world_concierge_self_select on public.world_concierge_requests for select to authenticated using((select auth.uid())=user_id);
create policy world_concierge_self_insert on public.world_concierge_requests for insert to authenticated with check(
 (select auth.uid())=user_id and public.komo_world_has_entitlement('concierge.request')
 and (priority='standard' or (priority='priority' and public.komo_world_has_entitlement('concierge.priority'))));

create or replace function private.komo_grant_one_after_released_assessment()
returns trigger language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_user uuid;
begin
 if new.status<>'released' then return new; end if;
 select patient_user_id into v_user from public.patients where id=new.patient_id;
 if v_user is null then return new; end if;
 insert into public.world_memberships(user_id,tier,status,founding,source,source_assessment_id)
 values(v_user,'one','active',true,'assessment',new.id) on conflict(user_id) do nothing;
 return new;
end $$;
revoke all on function private.komo_grant_one_after_released_assessment() from public,anon,authenticated;
create trigger trg_komo_world_one_after_assessment after insert or update of status on public.assessments
for each row when(new.status='released') execute function private.komo_grant_one_after_released_assessment();

insert into public.world_memberships(user_id,tier,status,founding,source,source_assessment_id)
select distinct on(p.patient_user_id) p.patient_user_id,'one','active',true,'assessment',a.id
from public.assessments a join public.patients p on p.id=a.patient_id
where a.status='released' and p.patient_user_id is not null
order by p.patient_user_id,coalesce(a.released_at,a.updated_at,a.created_at) asc
on conflict(user_id) do nothing;

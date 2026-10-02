-- Public World experience plus explicit service-only protection for raw cards/audit events.
insert into public.world_experiences(slug,title,destination,operator_name,summary,why_komo,visibility,required_entitlement,request_mode,is_active)
values(
 'komo-motion-riviera','KŌMØ Motion — Riviera','Riviera','KŌMØ',
 'A private KŌMØ movement assessment delivered across selected Riviera settings.',
 'KŌMØ brings the assessment to the member context rather than asking the client to adapt to a clinic.',
 'public',null,'request',true
)
on conflict(slug) do update set
 title=excluded.title,destination=excluded.destination,operator_name=excluded.operator_name,
 summary=excluded.summary,why_komo=excluded.why_komo,visibility='public',
 required_entitlement=null,request_mode=excluded.request_mode,is_active=true,updated_at=now();

create policy world_cards_explicit_no_client_access on public.world_cards
as restrictive for all to anon,authenticated using(false) with check(false);
create policy world_membership_events_explicit_no_client_access on public.world_membership_events
as restrictive for all to anon,authenticated using(false) with check(false);

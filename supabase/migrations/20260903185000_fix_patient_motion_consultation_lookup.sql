-- Fix patient consultation retrieval after a professional assigns a Motion consultation.
-- assessments has no organization_id or notes columns. The canonical appointment/assessment
-- association is patient_id + product_mode='motion' + scheduled_at=appointment.scheduled_start,
-- matching private.ensure_motion_episode_for_appointment().

create or replace function public.komo_my_motion_consultations()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  result jsonb;
begin
  if uid is null then raise exception 'authentication_required'; end if;

  select coalesce(jsonb_agg(item order by (item->>'scheduled_start')::timestamptz desc),'[]'::jsonb)
  into result
  from (
    select jsonb_build_object(
      'appointment_id',oa.id,
      'patient_id',p.id,
      'organization_id',oa.organization_id,
      'organization_name',coalesce(o.name,'Centre KŌMØ'),
      'timezone',coalesce(o.timezone,'Europe/Paris'),
      'scheduled_start',oa.scheduled_start,
      'scheduled_end',oa.scheduled_end,
      'appointment_status',oa.status,
      'assessment_id',a.id,
      'assessment_status',a.status,
      'pre_bilan_percent',coalesce(q.progress,0),
      'completed_sections',coalesce(q.completed_sections,0),
      'total_sections',coalesce(q.total_sections,6),
      'pre_bilan_complete',coalesce(q.is_complete,false)
    ) as item
    from public.organization_appointments oa
    join public.patients p on p.id=oa.patient_id
    left join public.organizations o on o.id=oa.organization_id
    left join lateral (
      select aa.id,aa.status
      from public.assessments aa
      where aa.patient_id=p.id
        and aa.product_mode='motion'
        and aa.scheduled_at=oa.scheduled_start
        and aa.status<>'cancelled'
      order by aa.created_at desc
      limit 1
    ) a on true
    left join lateral (
      with codes as (
        select unnest(array['KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY']::text[]) code, true as base
        union all
        select unnest(array['KOMO_FALL_CONTEXT','KOMO_MUSCLE_RESERVE','KOMO_BACK_CONTEXT','KOMO_NECK_CONTEXT','KOMO_OLDER_WELLBEING']::text[]) code, false as base
      ), sessions as (
        select c.code,c.base,qs.status,coalesce(qs.completeness,0)::numeric completeness
        from codes c
        left join public.questionnaire_sessions qs
          on qs.assessment_id=a.id and qs.instrument_code=c.code
      ), active as (
        select * from sessions where base or status is not null
      )
      select
        round(coalesce(sum(completeness),0)/greatest(count(*)*100,1)*100)::int as progress,
        count(*) filter (where completeness>=100)::int as completed_sections,
        count(*)::int as total_sections,
        (count(*)>=6 and bool_and(completeness>=100)) as is_complete
      from active
    ) q on a.id is not null
    where p.patient_user_id=uid
      and oa.appointment_type='motion'
      and oa.status not in ('cancelled','no_show')
  ) x;

  return result;
end;
$$;

grant execute on function public.komo_my_motion_consultations() to authenticated;

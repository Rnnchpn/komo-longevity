-- KŌMØ Pulse · expose the patient's own latest calculated Motion result separately from the published result.
-- This lets Home / Mon compte display the report calculation with an explicit draft/reviewed/published status.

create or replace function public.komo_result_snapshot(p_patient_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private','auth'
as $function$
declare
  uid uuid := auth.uid();
  target_patient public.patients%rowtype;
  scope_patient_ids uuid[] := '{}';
  scope_user_id uuid;
  mode_value text := 'patient';
  free_row public.pulse_assessments%rowtype;
  start_score numeric;
  start_complete boolean := false;
  start_state text := 'not_started';
  motion_assessment public.assessments%rowtype;
  current_score public.scores%rowtype;
  published_score public.scores%rowtype;
  motion_state text := 'not_started';
  clinical_assessment public.assessments%rowtype;
  clinical_state text := 'not_started';
begin
  if uid is null then raise exception 'authentication_required'; end if;

  if p_patient_id is null then
    scope_user_id := uid;
    select coalesce(array_agg(p.id),'{}'::uuid[]) into scope_patient_ids
    from public.patients p where p.patient_user_id=uid;
  else
    mode_value := 'professional';
    select * into target_patient from public.patients where id=p_patient_id;
    if target_patient.id is null then raise exception 'patient_not_found'; end if;
    if not (
      private.user_is_global_admin()
      or private.user_has_org_role(target_patient.organization_id,array['owner','clinical_admin','physician']::text[])
      or exists(select 1 from public.assessments a where a.patient_id=target_patient.id and private.user_can_manage_assessment(a.id))
    ) then raise exception 'patient_access_denied'; end if;
    scope_user_id := target_patient.patient_user_id;
    scope_patient_ids := array[target_patient.id];
  end if;

  if scope_user_id is not null then
    select * into free_row
    from public.pulse_assessments pa
    where pa.user_id=scope_user_id and pa.protocol_version='mobility-check-v1'
    order by pa.updated_at desc nulls last
    limit 1;
    if free_row.id is not null then
      start_complete := (free_row.responses#>>'{baseline,completed_at}') is not null
        and (free_row.responses#>>'{chair_stand,completed_at}') is not null
        and (free_row.responses#>>'{two_step,completed_at}') is not null;
      if nullif(free_row.responses#>>'{baseline,questionnaire,mobility_score_0_100}','') is not null then
        start_score := (free_row.responses#>>'{baseline,questionnaire,mobility_score_0_100}')::numeric;
      elsif nullif(free_row.responses#>>'{baseline,questionnaire,difficulty_total}','') is not null then
        start_score := greatest(0,least(100,100-(free_row.responses#>>'{baseline,questionnaire,difficulty_total}')::numeric));
      end if;
      start_state := case when start_complete then 'completed' else 'in_progress' end;
    end if;
  end if;

  if cardinality(scope_patient_ids)>0 then
    select a.* into motion_assessment
    from public.assessments a
    where a.patient_id=any(scope_patient_ids) and a.product_mode='motion'
    order by a.created_at desc
    limit 1;

    if motion_assessment.id is not null then
      select s.* into current_score
      from public.scores s
      where s.assessment_id=motion_assessment.id and s.profile_code='motion_integrated'
      order by s.calculated_at desc
      limit 1;
      if current_score.id is not null then
        motion_state := case current_score.release_status
          when 'released' then 'released'
          when 'clinician_reviewed' then 'awaiting_publication'
          when 'draft' then case when current_score.motion_score is null then 'in_progress' else 'awaiting_review' end
          else 'in_progress' end;
      else
        motion_state := case when motion_assessment.status in ('released','validated') then 'awaiting_publication' else 'in_progress' end;
      end if;
    end if;

    select s.* into published_score
    from public.scores s
    join public.assessments a on a.id=s.assessment_id
    where a.patient_id=any(scope_patient_ids)
      and a.product_mode='motion'
      and s.profile_code='motion_integrated'
      and s.release_status='released'
      and s.motion_score is not null
    order by coalesce(s.released_at,s.calculated_at) desc
    limit 1;

    select a.* into clinical_assessment
    from public.assessments a
    where a.patient_id=any(scope_patient_ids) and a.product_mode='clinical'
    order by a.created_at desc
    limit 1;
    if clinical_assessment.id is not null then
      clinical_state := case
        when clinical_assessment.status in ('released','validated','completed') then 'validated'
        when clinical_assessment.status in ('collecting','in_progress','confirmed','arrived') then 'in_progress'
        else 'planned' end;
    end if;
  end if;

  return jsonb_build_object(
    'mode',mode_value,
    'start',jsonb_build_object(
      'state',start_state,
      'score',case when start_complete then start_score else null end,
      'completed',start_complete,
      'updatedAt',coalesce(free_row.completed_at,free_row.updated_at)
    ),
    'motion',jsonb_build_object(
      'state',motion_state,
      'currentAssessmentId',motion_assessment.id,
      'currentAssessmentStatus',motion_assessment.status,
      'currentScoreId',current_score.id,
      'currentReleaseStatus',current_score.release_status,
      'professionalScore',case when mode_value='professional' then current_score.motion_score else null end,
      'professionalDomains',case when mode_value='professional' then current_score.domain_scores else null end,
      'professionalConfidence',case when mode_value='professional' then current_score.confidence else null end,
      'calculated',case when current_score.id is null or current_score.motion_score is null then null else jsonb_build_object(
        'scoreId',current_score.id,
        'assessmentId',current_score.assessment_id,
        'score',current_score.motion_score,
        'domains',current_score.domain_scores,
        'confidence',current_score.confidence,
        'completeness',current_score.completeness,
        'releaseStatus',current_score.release_status,
        'status',current_score.status,
        'algorithmVersion',current_score.algorithm_version,
        'calculatedAt',current_score.calculated_at
      ) end,
      'published',case when published_score.id is null then null else jsonb_build_object(
        'scoreId',published_score.id,
        'assessmentId',published_score.assessment_id,
        'score',published_score.motion_score,
        'domains',published_score.domain_scores,
        'confidence',published_score.confidence,
        'confidenceLabel',published_score.confidence_label,
        'algorithmVersion',published_score.algorithm_version,
        'releasedAt',published_score.released_at,
        'status',published_score.status
      ) end
    ),
    'clinical',jsonb_build_object(
      'state',clinical_state,
      'assessmentId',clinical_assessment.id,
      'status',clinical_assessment.status
    ),
    'komoAge',null
  );
end;
$function$;

grant execute on function public.komo_result_snapshot(uuid) to authenticated;

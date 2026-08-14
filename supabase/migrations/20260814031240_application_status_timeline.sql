-- Application records live inside the owner-scoped CareerOS snapshot. Upgrade
-- legacy status names and add an append-only statusHistory without removing any
-- existing application fields, activity, notes, materials, or sessions.
with upgraded as (
  select
    snapshot.owner_id,
    jsonb_set(
      jsonb_set(snapshot.state, '{version}', '7'::jsonb, true),
      '{profiles}',
      coalesce((
        select jsonb_object_agg(profile.key, jsonb_set(
          profile.value,
          '{applications}',
          coalesce((
            select jsonb_agg(
              jsonb_set(
                jsonb_set(application.value, '{status}', to_jsonb(mapped.status), true),
                '{statusHistory}',
                case
                  when jsonb_typeof(application.value -> 'statusHistory') = 'array'
                    and jsonb_array_length(application.value -> 'statusHistory') > 0
                  then (
                    select jsonb_agg(jsonb_set(history.value, '{status}', to_jsonb(
                      case history.value ->> 'status'
                        when 'Ready to apply' then 'Ready to Apply'
                        when 'Assessment' then 'Assessment Invitation Received'
                        when 'Assessment Invitation' then 'Assessment Invitation Received'
                        when 'OA invited' then 'Assessment Invitation Received'
                        when 'OA' then 'Assessment In Progress'
                        when 'OA completed' then 'Assessment Completed'
                        when 'Interview' then 'Interview 1'
                        when 'Interview invited' then 'Interview Invitation'
                        when 'Interviewing' then 'Interview 1'
                        when 'Reference check' then 'Reference Check'
                        when 'Offer' then 'Offer Received'
                        else history.value ->> 'status'
                      end
                    ), true) order by history.ordinality)
                    from jsonb_array_elements(application.value -> 'statusHistory') with ordinality as history(value, ordinality)
                  )
                  else jsonb_build_array(jsonb_build_object(
                    'id', 'status-migrated-' || (application.value ->> 'id'),
                    'status', mapped.status,
                    'timestamp', coalesce(application.value ->> 'lastUpdatedAt', application.value ->> 'savedAt', snapshot.updated_at::text),
                    'notes', coalesce(application.value ->> 'notes', '')
                  ))
                end,
                true
              ) order by application.ordinality
            )
            from jsonb_array_elements(coalesce(profile.value -> 'applications', '[]'::jsonb)) with ordinality as application(value, ordinality)
            cross join lateral (
              select case application.value ->> 'status'
                when 'Ready to apply' then 'Ready to Apply'
                when 'Assessment' then 'Assessment Invitation Received'
                when 'Assessment Invitation' then 'Assessment Invitation Received'
                when 'OA invited' then 'Assessment Invitation Received'
                when 'OA' then 'Assessment In Progress'
                when 'OA completed' then 'Assessment Completed'
                when 'Interview' then 'Interview 1'
                when 'Interview invited' then 'Interview Invitation'
                when 'Interviewing' then 'Interview 1'
                when 'Reference check' then 'Reference Check'
                when 'Offer' then 'Offer Received'
                else application.value ->> 'status'
              end as status
            ) mapped
          ), '[]'::jsonb),
          true
        ))
        from jsonb_each(coalesce(snapshot.state -> 'profiles', '{}'::jsonb)) profile
      ), '{}'::jsonb),
      true
    ) as state
  from public.careeros_state_snapshots snapshot
)
update public.careeros_state_snapshots snapshot
set state = upgraded.state,
    revision = snapshot.revision + 1,
    updated_at = now()
from upgraded
where snapshot.owner_id = upgraded.owner_id;

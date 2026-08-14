-- Add a first-class application source to owner-scoped workspace snapshots.
-- Existing records are classified conservatively from their saved URL/notes;
-- no application or status-history data is removed.
update public.careeros_state_snapshots as snapshot
set
  state = jsonb_set(
    jsonb_set(snapshot.state, '{version}', '8'::jsonb, true),
    '{profiles}',
    coalesce((
      select jsonb_object_agg(
        profile.key,
        jsonb_set(
          profile.value,
          '{applications}',
          coalesce((
            select jsonb_agg(
              application.value || jsonb_build_object(
                'source',
                case
                  when lower(coalesce(application.value ->> 'notes', '') || ' ' || coalesce(application.value #>> '{sourceSnapshot,officialUrl}', '')) ~ 'seek\\.com|(^|[^a-z])seek([^a-z]|$)' then 'SEEK'
                  when lower(coalesce(application.value ->> 'notes', '') || ' ' || coalesce(application.value #>> '{sourceSnapshot,officialUrl}', '')) ~ 'linkedin\\.com|(^|[^a-z])linkedin([^a-z]|$)' then 'LinkedIn'
                  when lower(coalesce(application.value ->> 'notes', '') || ' ' || coalesce(application.value #>> '{sourceSnapshot,officialUrl}', '')) ~ 'zhipin\\.com|(^|[^a-z])boss([^a-z]|$)|直聘' then 'BOSS'
                  when lower(coalesce(application.value ->> 'notes', '') || ' ' || coalesce(application.value #>> '{sourceSnapshot,officialUrl}', '')) ~ 'nowcoder\\.com|(^|[^a-z])nowcoder([^a-z]|$)|牛客' then 'Nowcoder'
                  when lower(coalesce(application.value ->> 'notes', '')) ~ 'referr|内推' then 'Referral'
                  when coalesce(application.value #>> '{sourceSnapshot,officialUrl}', '') <> '' then 'Company Website'
                  else 'Other'
                end
              )
              order by application.ordinality
            )
            from jsonb_array_elements(coalesce(profile.value -> 'applications', '[]'::jsonb))
              with ordinality as application(value, ordinality)
          ), '[]'::jsonb),
          true
        )
      )
      from jsonb_each(coalesce(snapshot.state -> 'profiles', '{}'::jsonb)) as profile(key, value)
    ), '{}'::jsonb),
    true
  ),
  revision = snapshot.revision + 1,
  updated_at = now()
where coalesce((snapshot.state ->> 'version')::integer, 0) < 8;

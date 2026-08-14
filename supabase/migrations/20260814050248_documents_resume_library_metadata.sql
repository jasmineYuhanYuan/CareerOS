alter table public.career_documents
  add column if not exists document_family text,
  add column if not exists version_number integer,
  add column if not exists markets text[] not null default '{}',
  add column if not exists directions text[] not null default '{}',
  add column if not exists parsed_status text,
  add column if not exists target_roles text[] not null default '{}',
  add column if not exists ats_score integer,
  add column if not exists last_parsed_at timestamptz;

update public.career_documents set
  document_family = coalesce(document_family, document_type),
  version_number = coalesce(version_number, nullif(regexp_replace(version, '[^0-9]', '', 'g'), '')::integer, 1),
  markets = case when cardinality(markets) = 0 and target_market <> '' then array[target_market] else markets end,
  parsed_status = coalesce(parsed_status, case parse_status when 'parsed' then 'ready' when 'failed' then 'error' else 'pending' end),
  last_parsed_at = case when parse_status = 'parsed' then coalesce(last_parsed_at, updated_at) else last_parsed_at end;

alter table public.career_documents
  alter column document_family set not null,
  alter column version_number set not null,
  alter column version_number set default 1,
  alter column parsed_status set not null,
  alter column parsed_status set default 'pending',
  add constraint career_documents_version_number_positive check (version_number > 0),
  add constraint career_documents_parsed_status_check check (parsed_status in ('pending','parsing','ready','error')),
  add constraint career_documents_ats_score_check check (ats_score is null or ats_score between 0 and 100);

with duplicate_primary as (
  select id, row_number() over (partition by user_id, profile_id, document_family order by version_number desc, uploaded_at desc) as rank
  from public.career_documents where is_primary
)
update public.career_documents set is_primary = false
where id in (select id from duplicate_primary where rank > 1);

create unique index if not exists career_documents_one_primary_per_family
  on public.career_documents (user_id, profile_id, document_family)
  where is_primary;
create unique index if not exists career_documents_family_version_unique
  on public.career_documents (user_id, profile_id, document_family, version_number);

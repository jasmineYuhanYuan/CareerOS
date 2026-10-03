alter table public.market_sources
  add column if not exists health_classification text not null default 'NEEDS_SOURCE_SPECIFIC_ADAPTER',
  add column if not exists last_discovery_at timestamptz,
  add column if not exists last_verification_at timestamptz,
  add column if not exists last_failure_type text,
  add column if not exists last_http_status integer;

alter table public.market_sources
  add constraint market_sources_health_classification_check check (
    health_classification in ('HEALTHY','NEEDS_NEW_OFFICIAL_URL','NEEDS_SOURCE_SPECIFIC_ADAPTER','UNSUITABLE_FOR_AUTOMATION','DISCONTINUED')
  ),
  add constraint market_sources_failure_type_check check (
    last_failure_type is null or last_failure_type in ('http-error','timeout','access-restricted','robots-restricted','parse-failed','application-cta-missing','source-structure-changed','network-error')
  ),
  add constraint market_sources_http_status_check check (last_http_status is null or last_http_status between 100 and 599);

alter table public.market_opportunities
  add column if not exists job_id text,
  add column if not exists dedupe_fingerprint text,
  add column if not exists verification_method text;

create unique index if not exists market_opportunities_organisation_job_id_unique
  on public.market_opportunities (lower(organisation), job_id)
  where job_id is not null;
create unique index if not exists market_opportunities_dedupe_fingerprint_unique
  on public.market_opportunities (dedupe_fingerprint)
  where dedupe_fingerprint is not null;
create index if not exists market_sources_enabled_health_idx
  on public.market_sources (enabled, health_status, consecutive_failures);

update public.market_sources set health_classification = 'NEEDS_NEW_OFFICIAL_URL'
where id in ('amazon-au','bootstrap-amazon');
update public.market_sources set health_classification = 'NEEDS_SOURCE_SPECIFIC_ADAPTER'
where id in ('aps-data','aps-digital','bootstrap-australian-government','bootstrap-australian-signals-directorate','bootstrap-digital-transformation-agency','alibaba-campus','tencent-campus');
update public.market_sources set health_classification = 'UNSUITABLE_FOR_AUTOMATION'
where id in ('canberra-clinics','bootstrap-chiro-aligned-chiro');
update public.market_sources set health_classification = 'HEALTHY'
where id in ('ahpra-chiropractic','atlassian-au','bootstrap-cn-baidu','bootstrap-cn-red','bytedance-campus','bootstrap-baidu');

-- LinkedIn blocks unattended crawling; retain its historical vacancy evidence but
-- do not treat the source as an automatable clinic feed.
update public.market_sources set enabled = false, health_status = 'disabled', updated_at = now()
where id = 'bootstrap-chiro-aligned-chiro';

-- Avoid requesting the same official listing twice. Historical rows keep their
-- original source_id and provenance.
update public.market_sources set enabled = false, health_status = 'disabled',
  health_classification = 'DISCONTINUED', last_error = 'Duplicate source adapter; canonical source retained.', updated_at = now()
where id in ('bootstrap-atlassian','bootstrap-bytedance');

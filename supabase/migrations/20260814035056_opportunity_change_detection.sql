alter table public.market_verification_events
  drop constraint if exists market_verification_events_event_type_check;

alter table public.market_verification_events
  add constraint market_verification_events_event_type_check check (
    event_type in (
      'discovered', 'verified-open', 'closed', 'downgraded', 'unchanged',
      'source-failed', 'source-recovered', 'manual-override',
      'deadline-changed', 'application-url-changed', 'verification-failed',
      'verification-restored', 'role-reopened'
    )
  );

alter table public.market_sources
  drop constraint if exists market_sources_source_type_check;

alter table public.market_sources
  add constraint market_sources_source_type_check check (
    source_type in ('employer', 'government', 'regulator', 'directory', 'job-board', 'university', 'association')
  );

alter table public.market_sources
  drop constraint if exists market_sources_market_check;

alter table public.market_sources
  add constraint market_sources_market_check check (
    market in ('australia-tech', 'china-tech', 'tommy-clinics', 'ahpra', 'australia-chiropractic')
  );

insert into public.market_sources (
  id, name, official_url, market, source_type, crawl_strategy, profile_scope,
  health_status, last_checked_at, last_success_at
) values (
  'bootstrap-chiro-aligned-chiro',
  'LinkedIn Jobs — Aligned Chiro',
  'https://au.linkedin.com/jobs/view/lithgow-chiropractor-at-aligned-chiro-4439544594',
  'australia-chiropractic',
  'job-board',
  'registration',
  array['taicheng-guo-tommy'],
  'healthy',
  '2026-08-14T03:50:00Z',
  '2026-08-14T03:50:00Z'
) on conflict (id) do update set
  official_url = excluded.official_url,
  profile_scope = excluded.profile_scope,
  source_type = excluded.source_type;

insert into public.market_opportunities (
  id, source_id, external_id, title, organisation, city, country,
  location_text, employment_type, role_family, profile_scope, source_url,
  apply_url, lifecycle_status, verification_status, verification_evidence,
  published_at, last_verified_at, last_seen_at, metadata
) values (
  'aligned-chiro-lithgow-chiropractor-4439544594',
  'bootstrap-chiro-aligned-chiro',
  '4439544594',
  'Lithgow Chiropractor',
  'Aligned Chiro',
  'Lithgow',
  'Australia',
  'Lithgow, NSW',
  'Full-time',
  'Chiropractic',
  array['taicheng-guo-tommy'],
  'https://au.linkedin.com/jobs/view/lithgow-chiropractor-at-aligned-chiro-4439544594',
  'https://au.linkedin.com/jobs/view/lithgow-chiropractor-at-aligned-chiro-4439544594',
  'Open',
  'Verified',
  'LinkedIn position-level page verified 14 Aug 2026: explicit Chiropractor title, current hiring language, full role description and Apply action.',
  null,
  '2026-08-14T03:50:00Z',
  '2026-08-14T03:50:00Z',
  jsonb_build_object('source', 'LinkedIn Jobs', 'vacancyEvidence', 'Explicit Chiropractor role with current Apply action; directory records were not used.')
) on conflict (id) do update set
  source_url = excluded.source_url,
  apply_url = excluded.apply_url,
  lifecycle_status = excluded.lifecycle_status,
  verification_status = excluded.verification_status,
  verification_evidence = excluded.verification_evidence,
  last_verified_at = excluded.last_verified_at,
  last_seen_at = excluded.last_seen_at,
  profile_scope = excluded.profile_scope,
  metadata = excluded.metadata;

insert into public.market_verification_events (
  source_id, opportunity_id, event_type, observed_status, evidence_type,
  evidence_text, http_status, checked_at
) values (
  'bootstrap-chiro-aligned-chiro',
  'aligned-chiro-lithgow-chiropractor-4439544594',
  'verified-open',
  'Open',
  'position-and-application',
  'Position-level page contains an explicit Chiropractor vacancy, current hiring language and an Apply action.',
  200,
  '2026-08-14T03:50:00Z'
);

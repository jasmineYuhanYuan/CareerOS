create table public.market_sources (
  id text primary key,
  name text not null,
  official_url text not null check (official_url like 'https://%'),
  market text not null check (market in ('australia-tech', 'china-tech', 'tommy-clinics', 'ahpra')),
  source_type text not null check (source_type in ('employer', 'government', 'regulator', 'directory')),
  crawl_strategy text not null check (crawl_strategy in ('listing', 'registration', 'directory')),
  profile_scope text[] not null default '{}',
  enabled boolean not null default true,
  health_status text not null default 'pending' check (health_status in ('healthy', 'degraded', 'failed', 'pending', 'disabled')),
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.market_audit_runs (
  id uuid primary key default gen_random_uuid(),
  trigger_type text not null default 'cron' check (trigger_type in ('cron', 'manual')),
  status text not null default 'running' check (status in ('running', 'completed', 'partial', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  sources_checked integer not null default 0,
  sources_failed integer not null default 0,
  discovered_count integer not null default 0,
  opened_count integer not null default 0,
  closed_count integer not null default 0,
  downgraded_count integer not null default 0,
  verification_required_count integer not null default 0,
  error_summary jsonb not null default '[]'::jsonb
);

create table public.market_opportunities (
  id text primary key,
  source_id text not null references public.market_sources(id) on delete restrict,
  external_id text,
  title text not null,
  organisation text not null,
  city text,
  country text not null,
  location_text text not null,
  employment_type text not null,
  role_family text not null,
  profile_scope text[] not null,
  source_url text not null check (source_url like 'https://%'),
  apply_url text check (apply_url is null or apply_url like 'https://%'),
  lifecycle_status text not null check (lifecycle_status in ('Open', 'Closing soon', 'Upcoming', 'Verification required', 'Closed', 'Expired', 'Archived')),
  verification_status text not null check (verification_status in ('Verified', 'Verification required', 'Closed', 'Expired', 'Archived')),
  verification_evidence text not null default '',
  published_at date,
  opens_at date,
  deadline date,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz,
  last_verified_at timestamptz,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_id),
  unique (source_url),
  check (lifecycle_status <> 'Open' or (verification_status = 'Verified' and last_verified_at is not null and apply_url is not null))
);

create table public.market_verification_events (
  id bigint generated always as identity primary key,
  run_id uuid references public.market_audit_runs(id) on delete set null,
  source_id text not null references public.market_sources(id) on delete restrict,
  opportunity_id text references public.market_opportunities(id) on delete cascade,
  event_type text not null check (event_type in ('discovered', 'verified-open', 'closed', 'downgraded', 'unchanged', 'source-failed', 'source-recovered', 'manual-override')),
  previous_status text,
  observed_status text,
  evidence_type text not null,
  evidence_text text not null,
  http_status integer,
  checked_at timestamptz not null default now()
);

create index market_opportunities_profile_status_idx on public.market_opportunities using gin (profile_scope);
create index market_opportunities_lifecycle_idx on public.market_opportunities (lifecycle_status, last_verified_at desc);
create index market_events_checked_idx on public.market_verification_events (checked_at desc);
create index market_runs_started_idx on public.market_audit_runs (started_at desc);

alter table public.market_sources enable row level security;
alter table public.market_opportunities enable row level security;
alter table public.market_verification_events enable row level security;
alter table public.market_audit_runs enable row level security;

revoke all on public.market_sources, public.market_opportunities, public.market_verification_events, public.market_audit_runs from anon, authenticated;
grant select on public.market_sources, public.market_opportunities, public.market_verification_events, public.market_audit_runs to anon, authenticated;
grant all on public.market_sources, public.market_opportunities, public.market_verification_events, public.market_audit_runs to service_role;
grant usage, select on sequence public.market_verification_events_id_seq to service_role;

create policy "Market sources are publicly readable" on public.market_sources for select to anon, authenticated using (true);
create policy "Market opportunities are publicly readable" on public.market_opportunities for select to anon, authenticated using (true);
create policy "Market verification events are publicly readable" on public.market_verification_events for select to anon, authenticated using (true);
create policy "Market audit runs are publicly readable" on public.market_audit_runs for select to anon, authenticated using (true);

insert into public.market_sources (id, name, official_url, market, source_type, crawl_strategy, profile_scope) values
  ('amazon-au', 'Amazon Australia Jobs', 'https://www.amazon.jobs/en/locations/australia', 'australia-tech', 'employer', 'listing', array['yuhan-yuan']),
  ('atlassian-au', 'Atlassian Early Careers Australia', 'https://www.atlassian.com/company/careers/earlycareers', 'australia-tech', 'employer', 'listing', array['yuhan-yuan']),
  ('aps-digital', 'APS Digital Stream', 'https://content.apsjobs.gov.au/career-pathways/graduate-programs/digital-stream', 'australia-tech', 'government', 'listing', array['yuhan-yuan']),
  ('aps-data', 'APS Data Stream', 'https://content.apsjobs.gov.au/career-pathways/graduate-programs/data-stream', 'australia-tech', 'government', 'listing', array['yuhan-yuan']),
  ('tencent-campus', 'Tencent Campus Recruitment', 'https://join.qq.com/', 'china-tech', 'employer', 'listing', array['yuhan-yuan']),
  ('alibaba-campus', 'Alibaba Campus Recruitment', 'https://talent.alibaba.com/campus/home', 'china-tech', 'employer', 'listing', array['yuhan-yuan']),
  ('bytedance-campus', 'ByteDance Campus Recruitment', 'https://jobs.bytedance.com/campus', 'china-tech', 'employer', 'listing', array['yuhan-yuan']),
  ('canberra-clinics', 'Canberra chiropractic clinic directory', 'https://www.chiro.org.au/find-a-chiro/', 'tommy-clinics', 'directory', 'directory', array['taicheng-guo-tommy']),
  ('ahpra-chiropractic', 'Ahpra Chiropractic registration', 'https://www.ahpra.gov.au/Registration/Registers-of-Practitioners.aspx', 'ahpra', 'regulator', 'registration', array['taicheng-guo-tommy'])
on conflict (id) do update set official_url = excluded.official_url, updated_at = now();

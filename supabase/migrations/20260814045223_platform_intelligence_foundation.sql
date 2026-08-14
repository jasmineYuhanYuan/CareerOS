-- Platform foundation: public employer intelligence and private candidate intelligence.
-- Existing local-first profiles and market records remain compatible.

create table if not exists public.employers (
  id text primary key,
  canonical_name text not null,
  employer_type text not null default 'other'
    check (employer_type in ('technology','financial-services','clinic','healthcare','government','university','other')),
  industry text,
  country text,
  city text,
  region text,
  website_url text,
  careers_url text,
  public_contact jsonb not null default '{}'::jsonb,
  hiring_preferences jsonb not null default '[]'::jsonb,
  verification_status text not null default 'unverified'
    check (verification_status in ('verified','partially-verified','unverified','archived')),
  source_url text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canonical_name, country)
);

create table if not exists public.employer_aliases (
  employer_id text not null references public.employers(id) on delete cascade,
  alias text not null,
  normalised_alias text generated always as (lower(regexp_replace(alias, '[^[:alnum:]]+', '', 'g'))) stored,
  created_at timestamptz not null default now(),
  primary key (employer_id, alias),
  unique (normalised_alias)
);

create table if not exists public.employer_signals (
  id bigint generated always as identity primary key,
  employer_id text not null references public.employers(id) on delete cascade,
  signal_type text not null check (signal_type in ('active-vacancy','graduate-programme','hiring-page','recruitment-event','source-degraded','source-restored')),
  title text not null,
  evidence text not null,
  source_url text not null,
  verification_status text not null default 'unverified'
    check (verification_status in ('verified','unverified','expired')),
  observed_at timestamptz not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  legacy_profile_key text,
  display_name text not null,
  headline text,
  location text,
  target_roles jsonb not null default '[]'::jsonb,
  preferred_locations jsonb not null default '[]'::jsonb,
  structured_skills jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  work_eligibility text,
  professional_registration text,
  profile_completeness integer not null default 0 check (profile_completeness between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, legacy_profile_key)
);

alter table public.market_opportunities
  add column if not exists employer_id text references public.employers(id) on delete set null;

insert into public.employers (
  id, canonical_name, employer_type, country, city, website_url, careers_url,
  verification_status, source_url, last_verified_at
)
select
  'employer-' || substr(md5(lower(trim(organisation)) || '|' || lower(coalesce(country, ''))), 1, 20),
  trim(organisation),
  case when role_family = 'Chiropractic' then 'clinic' else 'other' end,
  nullif(country, ''),
  min(nullif(city, '')),
  null,
  min(source_url),
  case when bool_or(verification_status = 'Verified') then 'verified' else 'partially-verified' end,
  min(source_url),
  max(last_verified_at)
from public.market_opportunities
where nullif(trim(organisation), '') is not null
group by trim(organisation), country, case when role_family = 'Chiropractic' then 'clinic' else 'other' end
on conflict (canonical_name, country) do update set
  verification_status = excluded.verification_status,
  source_url = coalesce(public.employers.source_url, excluded.source_url),
  careers_url = coalesce(public.employers.careers_url, excluded.careers_url),
  last_verified_at = greatest(public.employers.last_verified_at, excluded.last_verified_at),
  updated_at = now();

update public.market_opportunities opportunity
set employer_id = employer.id
from public.employers employer
where opportunity.employer_id is null
  and lower(trim(opportunity.organisation)) = lower(trim(employer.canonical_name))
  and coalesce(lower(opportunity.country), '') = coalesce(lower(employer.country), '');

insert into public.employer_signals (
  employer_id, signal_type, title, evidence, source_url, verification_status, observed_at
)
select employer_id, 'active-vacancy', title, verification_evidence, source_url, 'verified', last_verified_at
from public.market_opportunities
where employer_id is not null
  and lifecycle_status in ('Open', 'Closing soon')
  and verification_status = 'Verified'
  and apply_url is not null
  and last_verified_at is not null
on conflict do nothing;

create index if not exists employers_name_idx on public.employers using btree (canonical_name);
create index if not exists employers_location_idx on public.employers using btree (country, region, city);
create index if not exists employer_signals_employer_observed_idx on public.employer_signals (employer_id, observed_at desc);
create index if not exists candidate_profiles_owner_idx on public.candidate_profiles (owner_user_id);
create index if not exists market_opportunities_employer_idx on public.market_opportunities (employer_id);

alter table public.employers enable row level security;
alter table public.employer_aliases enable row level security;
alter table public.employer_signals enable row level security;
alter table public.candidate_profiles enable row level security;

create policy "Public employer intelligence is readable"
on public.employers for select to anon, authenticated
using (verification_status in ('verified', 'partially-verified'));

create policy "Public employer aliases are readable"
on public.employer_aliases for select to anon, authenticated
using (exists (
  select 1 from public.employers employer
  where employer.id = employer_aliases.employer_id
    and employer.verification_status in ('verified', 'partially-verified')
));

create policy "Verified employer signals are readable"
on public.employer_signals for select to anon, authenticated
using (verification_status = 'verified');

create policy "Candidates read their own profile"
on public.candidate_profiles for select to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "Candidates insert their own profile"
on public.candidate_profiles for insert to authenticated
with check ((select auth.uid()) = owner_user_id);

create policy "Candidates update their own profile"
on public.candidate_profiles for update to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy "Candidates delete their own profile"
on public.candidate_profiles for delete to authenticated
using ((select auth.uid()) = owner_user_id);

grant select on public.employers, public.employer_aliases, public.employer_signals to anon, authenticated;
grant select, insert, update, delete on public.candidate_profiles to authenticated;
revoke all on public.candidate_profiles from anon;

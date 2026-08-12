create table if not exists public.careeros_state_snapshots (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

create or replace function public.set_careeros_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_careeros_state_updated_at on public.careeros_state_snapshots;
create trigger set_careeros_state_updated_at before update on public.careeros_state_snapshots
for each row execute function public.set_careeros_updated_at();

alter table public.careeros_state_snapshots enable row level security;
revoke all on public.careeros_state_snapshots from anon;
grant select, insert, update, delete on public.careeros_state_snapshots to authenticated;

drop policy if exists "Owners read their CareerOS state" on public.careeros_state_snapshots;
drop policy if exists "Owners insert their CareerOS state" on public.careeros_state_snapshots;
drop policy if exists "Owners update their CareerOS state" on public.careeros_state_snapshots;
drop policy if exists "Owners delete their CareerOS state" on public.careeros_state_snapshots;
create policy "Owners read their CareerOS state" on public.careeros_state_snapshots
for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Owners insert their CareerOS state" on public.careeros_state_snapshots
for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Owners update their CareerOS state" on public.careeros_state_snapshots
for update to authenticated using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
create policy "Owners delete their CareerOS state" on public.careeros_state_snapshots
for delete to authenticated using ((select auth.uid()) = owner_id);

create or replace function public.save_careeros_state(
  expected_revision bigint,
  next_state jsonb
)
returns table (revision bigint, updated_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if expected_revision = 0 then
    insert into public.careeros_state_snapshots (owner_id, state, revision)
    values (current_user_id, next_state, 1)
    on conflict (owner_id) do nothing
    returning careeros_state_snapshots.revision, careeros_state_snapshots.updated_at
    into revision, updated_at;
  else
    update public.careeros_state_snapshots
    set state = next_state, revision = expected_revision + 1
    where owner_id = current_user_id and careeros_state_snapshots.revision = expected_revision
    returning careeros_state_snapshots.revision, careeros_state_snapshots.updated_at
    into revision, updated_at;
  end if;

  if revision is null then
    raise exception 'SYNC_CONFLICT' using errcode = '40001';
  end if;
  return next;
end;
$$;

revoke all on function public.save_careeros_state(bigint, jsonb) from public, anon;
grant execute on function public.save_careeros_state(bigint, jsonb) to authenticated;

create table if not exists public.opportunity_verification_events (
  id bigint generated always as identity primary key,
  opportunity_id text not null,
  source_url text not null check (source_url like 'https://%'),
  previous_status text not null,
  observed_status text not null,
  evidence_type text not null,
  evidence_text text not null,
  http_status integer,
  checked_at timestamptz not null,
  checked_date date generated always as ((checked_at at time zone 'UTC')::date) stored,
  unique (opportunity_id, checked_date)
);

create table if not exists public.opportunity_status_overrides (
  opportunity_id text primary key,
  lifecycle_status text not null,
  verification_status text not null,
  verification_method text not null,
  last_verified_at date not null,
  checked_at timestamptz not null,
  source_url text not null check (source_url like 'https://%')
);

alter table public.opportunity_verification_events enable row level security;
alter table public.opportunity_status_overrides enable row level security;
revoke all on public.opportunity_verification_events from anon, authenticated;
revoke all on public.opportunity_status_overrides from anon, authenticated;
grant all on public.opportunity_verification_events to service_role;
grant all on public.opportunity_status_overrides to service_role;
grant usage, select on sequence public.opportunity_verification_events_id_seq to service_role;

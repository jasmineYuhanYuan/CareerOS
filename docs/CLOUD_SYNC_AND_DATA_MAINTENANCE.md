# Cloud sync and automatic opportunity maintenance

CareerOS now has a deployable, secure foundation for daily official-page checks and cross-device state snapshots. Neither feature silently falls back to a public or unauthenticated database.

## Opportunity audit

Vercel calls `/api/cron/opportunity-audit` once per day. The route requires `CRON_SECRET`, checks only current Open, Closing soon, or Verification required official records, and writes evidence plus the latest override to Supabase.

An HTTP error is not treated as evidence that a job closed. A role returns to Open only when the official position page contains a recognizable application action. Ambiguous or client-rendered pages become Verification required.

## Cloud state

`/api/sync/state` accepts an authenticated Supabase access token. `GET` returns the signed-in owner's snapshot. `PUT` validates the complete CareerOS state and calls `save_careeros_state`, which performs the revision comparison and write atomically inside PostgreSQL. Stale writes return HTTP 409 rather than overwriting newer device data.

Apply `supabase/migrations/202608120001_cloud_sync_and_opportunity_audit.sql` in the target project. The snapshot table uses RLS and `auth.uid()`. Audit tables are service-role-only.

The audit tables intentionally have no RLS policies for `anon` or `authenticated`. Supabase's `service_role` bypasses RLS and receives explicit table grants, so a permissive `service_role` policy is redundant. Supabase Security Advisor may report `rls_enabled_no_policy` for these two server-only tables as an informational notice; do not silence it with a `USING (true)` policy.

Required production variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `CRON_SECRET` (at least 16 random characters)

The current UI continues using localStorage until a Supabase project and user sign-in method are configured. This prevents accidentally exposing personal applications, notes, profiles, and roadmap data through an anonymous policy.

import { createSupabasePublicClient } from "@/lib/supabase/server";
import { TOMMY_ID, YUHAN_ID } from "@/data/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const profileId = new URL(request.url).searchParams.get("profileId");
  if (![YUHAN_ID, TOMMY_ID].includes(profileId ?? "")) return Response.json({ ok: false, error: "Unknown profile." }, { status: 400 });
  const db = createSupabasePublicClient();
  if (!db) return Response.json({ ok: true, configured: false, opportunities: [], sources: [], recentEvents: [], latestRun: null });
  const [opportunities, sources, events, run] = await Promise.all([
    db.from("market_opportunities").select("*").contains("profile_scope", [profileId]).order("last_verified_at", { ascending: false, nullsFirst: false }),
    db.from("market_sources").select("id,name,official_url,market,health_status,last_checked_at,last_success_at,last_error").contains("profile_scope", [profileId]).order("name"),
    db.from("market_verification_events").select("id,event_type,previous_status,observed_status,evidence_text,checked_at,opportunity_id,source_id").order("checked_at", { ascending: false }).limit(20),
    db.from("market_audit_runs").select("*").order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const error = opportunities.error ?? sources.error ?? events.error ?? run.error;
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  const allowedIds = new Set((opportunities.data ?? []).map((item) => item.id));
  const allowedSources = new Set((sources.data ?? []).map((item) => item.id));
  return Response.json({ ok: true, configured: true, opportunities: opportunities.data ?? [], sources: sources.data ?? [], recentEvents: (events.data ?? []).filter((item) => (!item.opportunity_id || allowedIds.has(item.opportunity_id)) && allowedSources.has(item.source_id)), latestRun: run.data });
}

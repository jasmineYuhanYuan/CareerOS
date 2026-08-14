import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const db = createSupabaseAdminClient();
  if (!db) return Response.json({ ok: false, error: "Supabase unavailable." }, { status: 503 });
  const body = await request.json() as { action?: string; id?: string; status?: string; reason?: string };
  if (!body.id || !body.action) return Response.json({ ok: false, error: "Action and id are required." }, { status: 400 });
  if (body.action === "disable-source") {
    const { error } = await db.from("market_sources").update({ enabled: false, health_status: "disabled", last_error: body.reason ?? "Disabled by administrator" }).eq("id", body.id);
    return error ? Response.json({ ok: false, error: error.message }, { status: 500 }) : Response.json({ ok: true });
  }
  if (body.action === "set-status" && ["Closed", "Archived", "Verification required"].includes(body.status ?? "")) {
    const checkedAt = new Date().toISOString();
    const { data, error } = await db.from("market_opportunities").update({ lifecycle_status: body.status, verification_status: body.status, verification_evidence: body.reason ?? "Administrative override", apply_url: null, archived_at: ["Closed", "Archived"].includes(body.status ?? "") ? checkedAt : null, updated_at: checkedAt }).eq("id", body.id).select("source_id").single();
    if (!error) await db.from("market_verification_events").insert({ source_id: data.source_id, opportunity_id: body.id, event_type: "manual-override", observed_status: body.status, evidence_type: "admin-override", evidence_text: body.reason ?? "Administrative override", checked_at: checkedAt });
    return error ? Response.json({ ok: false, error: error.message }, { status: 500 }) : Response.json({ ok: true });
  }
  return Response.json({ ok: false, error: "Unsupported action." }, { status: 400 });
}

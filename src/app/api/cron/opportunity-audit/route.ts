import { verifiedChinaCampusOpportunities } from "@/data/china-recruiting/verified-opportunities";
import { inspectOpportunity } from "@/lib/opportunity-inspector";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return Response.json(
      { ok: false, error: "Supabase server configuration is incomplete." },
      { status: 503 },
    );
  }

  const candidates = verifiedChinaCampusOpportunities.filter((record) =>
    ["Open", "Closing soon", "Verification required"].includes(
      record.lifecycleStatus ?? record.verificationStatus,
    ),
  );
  const inspections = [];
  for (const candidate of candidates) inspections.push(await inspectOpportunity(candidate));

  const auditRows = inspections.map((inspection) => ({
    opportunity_id: inspection.opportunityId,
    source_url: inspection.sourceUrl,
    previous_status: inspection.previousStatus,
    observed_status: inspection.observedStatus,
    evidence_type: inspection.evidence,
    evidence_text: inspection.evidenceText,
    http_status: inspection.httpStatus,
    checked_at: inspection.checkedAt,
  }));
  const { error: auditError } = await supabase
    .from("opportunity_verification_events")
    .upsert(auditRows, { onConflict: "opportunity_id,checked_date" });
  if (auditError) {
    return Response.json({ ok: false, error: auditError.message }, { status: 500 });
  }

  const overrideRows = inspections.map((inspection) => ({
    opportunity_id: inspection.opportunityId,
    lifecycle_status: inspection.observedStatus,
    verification_status: inspection.observedStatus,
    verification_method: inspection.evidenceText,
    last_verified_at: inspection.checkedAt.slice(0, 10),
    checked_at: inspection.checkedAt,
    source_url: inspection.sourceUrl,
  }));
  const { error: overrideError } = await supabase
    .from("opportunity_status_overrides")
    .upsert(overrideRows, { onConflict: "opportunity_id" });
  if (overrideError) {
    return Response.json({ ok: false, error: overrideError.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    checked: inspections.length,
    open: inspections.filter((item) => item.observedStatus === "Open").length,
    closed: inspections.filter((item) => item.observedStatus === "Closed").length,
    verificationRequired: inspections.filter(
      (item) => item.observedStatus === "Verification required",
    ).length,
  });
}

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return Response.json({ ok: true, configured: false, overrides: [] });
  const { data, error } = await supabase
    .from("opportunity_status_overrides")
    .select("opportunity_id,lifecycle_status,verification_status,verification_method,last_verified_at,checked_at,source_url");
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({
    ok: true,
    configured: true,
    overrides: data.map((row) => ({
      opportunityId: row.opportunity_id,
      lifecycleStatus: row.lifecycle_status,
      verificationStatus: row.verification_status,
      verificationMethod: row.verification_method,
      lastVerifiedAt: row.last_verified_at,
      checkedAt: row.checked_at,
      sourceUrl: row.source_url,
    })),
  });
}

import { createSupabasePublicClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = createSupabasePublicClient();
  if (!db) return Response.json({ ok: true, configured: false, employers: [], signals: [], activeJobs: [] });

  const [employers, signals, activeJobs] = await Promise.all([
    db.from("employers")
      .select("id,canonical_name,employer_type,industry,country,city,region,website_url,careers_url,public_contact,hiring_preferences,verification_status,source_url,last_verified_at")
      .order("canonical_name"),
    db.from("employer_signals")
      .select("id,employer_id,signal_type,title,evidence,source_url,verification_status,observed_at,expires_at")
      .eq("verification_status", "verified")
      .order("observed_at", { ascending: false }),
    db.from("market_opportunities")
      .select("id,employer_id,title,organisation,location_text,source_url,apply_url,last_verified_at,lifecycle_status,verification_status")
      .in("lifecycle_status", ["Open", "Closing soon"])
      .eq("verification_status", "Verified")
      .not("apply_url", "is", null)
      .not("employer_id", "is", null)
      .order("last_verified_at", { ascending: false }),
  ]);
  const error = employers.error ?? signals.error ?? activeJobs.error;
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  return Response.json({
    ok: true,
    configured: true,
    employers: employers.data ?? [],
    signals: signals.data ?? [],
    activeJobs: activeJobs.data ?? [],
  });
}

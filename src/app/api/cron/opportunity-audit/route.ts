import { runMarketAudit } from "@/lib/market-pipeline";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function audit(request: Request, trigger: "cron" | "manual") {
  const secret = process.env.CRON_SECRET;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const activationSecret = process.env.MARKET_ACTIVATION_SECRET;
  const authorization = request.headers.get("authorization");
  if (!((secret && authorization === `Bearer ${secret}`) || (serviceRoleKey && authorization === `Bearer ${serviceRoleKey}`) || (activationSecret && authorization === `Bearer ${activationSecret}`))) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = createSupabaseAdminClient();
  if (!db) {
    return Response.json(
      { ok: false, error: "Supabase server configuration is incomplete." },
      { status: 503 },
    );
  }

  try {
    return Response.json({ ok: true, ...(await runMarketAudit(db, fetch, trigger)) });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Market audit failed." }, { status: 500 });
  }
}

export async function GET(request: Request) { return audit(request, "cron"); }
export async function POST(request: Request) { return audit(request, "manual"); }

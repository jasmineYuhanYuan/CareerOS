import { validateState } from "@/lib/storage";
import { createSupabaseUserClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

async function authenticatedClient(request: Request) {
  const token = bearerToken(request);
  const client = token ? createSupabaseUserClient(token) : null;
  if (!token || !client) return null;
  const { data, error } = await client.auth.getUser(token);
  return error || !data.user ? null : { client, userId: data.user.id };
}

export async function GET(request: Request) {
  const authenticated = await authenticatedClient(request);
  if (!authenticated) {
    return Response.json({ ok: false, error: "Unauthorized or sync is not configured." }, { status: 401 });
  }
  const { data, error } = await authenticated.client
    .from("careeros_state_snapshots")
    .select("state,revision,updated_at")
    .eq("owner_id", authenticated.userId)
    .maybeSingle();
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, snapshot: data });
}

export async function PUT(request: Request) {
  const authenticated = await authenticatedClient(request);
  if (!authenticated) {
    return Response.json({ ok: false, error: "Unauthorized or sync is not configured." }, { status: 401 });
  }
  const payload: unknown = await request.json().catch(() => null);
  if (typeof payload !== "object" || payload === null) {
    return Response.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }
  const record = payload as Record<string, unknown>;
  if (!validateState(record.state)) {
    return Response.json({ ok: false, error: "Invalid CareerOS state." }, { status: 400 });
  }
  const revision = typeof record.revision === "number" ? record.revision : 0;
  const { data: current } = await authenticated.client
    .from("careeros_state_snapshots")
    .select("revision")
    .eq("owner_id", authenticated.userId)
    .maybeSingle();
  if (current && current.revision !== revision) {
    return Response.json(
      { ok: false, error: "Sync conflict", currentRevision: current.revision },
      { status: 409 },
    );
  }
  const nextRevision = revision + 1;
  const { data, error } = await authenticated.client
    .from("careeros_state_snapshots")
    .upsert({ owner_id: authenticated.userId, state: record.state, revision: nextRevision })
    .select("revision,updated_at")
    .single();
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, snapshot: data });
}

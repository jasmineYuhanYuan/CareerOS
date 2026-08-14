import { createSupabaseUserClient } from "@/lib/supabase/server";
import { databaseDocumentToRecord } from "@/lib/document-api";

export const dynamic = "force-dynamic";
async function authenticate(request: Request) { const header = request.headers.get("authorization"); const token = header?.startsWith("Bearer ") ? header.slice(7) : null; const client = token ? createSupabaseUserClient(token) : null; if (!client || !token) return null; const { data, error } = await client.auth.getUser(token); return error || !data.user ? null : { client, userId: data.user.id }; }
async function owned(request: Request, id: string) { const auth = await authenticate(request); if (!auth) return null; const { data } = await auth.client.from("career_documents").select("*").eq("id", id).eq("user_id", auth.userId).maybeSingle(); return data ? { ...auth, document: data } : null; }

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const record = await owned(request, id); if (!record) return Response.json({ error: "Not found." }, { status: 404 });
  const { data, error } = await record.client.storage.from("career-documents").download(record.document.storage_path); if (error || !data) return Response.json({ error: "File unavailable." }, { status: 404 });
  return new Response(data, { headers: { "content-type": record.document.mime_type, "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(record.document.file_name)}`, "cache-control": "private, no-store" } });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const record = await owned(request, id); if (!record) return Response.json({ error: "Not found." }, { status: 404 });
  const { error: fileError } = await record.client.storage.from("career-documents").remove([record.document.storage_path]); if (fileError) return Response.json({ error: "Private file deletion failed." }, { status: 500 });
  const { error } = await record.client.from("career_documents").delete().eq("id", id).eq("user_id", record.userId); if (error) return Response.json({ error: "Document record deletion failed." }, { status: 500 });
  return Response.json({ ok: true });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const record = await owned(request, id); if (!record) return Response.json({ error: "Not found." }, { status: 404 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null; if (!body) return Response.json({ error: "Invalid update." }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (body.status !== undefined) { const status = String(body.status); if (!["Parsed", "Needs update", "Ready", "Archived"].includes(status)) return Response.json({ error: "Invalid status." }, { status: 400 }); if (status === "Ready" && record.document.parse_status !== "parsed") return Response.json({ error: "Only successfully parsed files can be marked Ready." }, { status: 409 }); update.status = status; }
  if (body.title !== undefined) update.title = String(body.title).trim().slice(0, 200);
  if (body.language !== undefined) update.language = String(body.language).slice(0, 80);
  if (body.markets !== undefined) { update.markets = Array.isArray(body.markets) ? body.markets.map(String).slice(0, 20) : []; update.target_market = (update.markets as string[]).join(", ").slice(0, 160); }
  if (body.directions !== undefined) update.directions = Array.isArray(body.directions) ? body.directions.map(String).slice(0, 20) : [];
  if (body.notes !== undefined) update.notes = String(body.notes).slice(0, 2000);
  if (body.isPrimary === true) { const { error } = await record.client.from("career_documents").update({ is_primary: false }).eq("user_id", record.userId).eq("profile_id", record.document.profile_id).eq("document_family", record.document.document_family).eq("is_primary", true); if (error) return Response.json({ error: "Primary document update failed." }, { status: 500 }); update.is_primary = true; }
  update.updated_at = new Date().toISOString();
  const { data, error } = await record.client.from("career_documents").update(update).eq("id", id).eq("user_id", record.userId).select("*").single();
  if (error) return Response.json({ error: "Document update failed." }, { status: 500 });
  return Response.json({ document: databaseDocumentToRecord(data as Record<string, unknown>) });
}

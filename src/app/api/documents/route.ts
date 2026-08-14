import { databaseDocumentToRecord } from "@/lib/document-api";
import { DOCUMENT_MIME_TYPES, extractDocument, MAX_DOCUMENT_BYTES } from "@/lib/document-extraction";
import { createSupabaseUserClient } from "@/lib/supabase/server";
import type { CareerDocumentLanguage, CareerDocumentType } from "@/types/domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
async function authenticate(request: Request) { const header = request.headers.get("authorization"); const token = header?.startsWith("Bearer ") ? header.slice(7) : null; const client = token ? createSupabaseUserClient(token) : null; if (!client || !token) return null; const { data, error } = await client.auth.getUser(token); return error || !data.user ? null : { client, userId: data.user.id }; }
function safeSegment(value: string) { return value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^[-.]+/, "").slice(0, 120); }
function stringArray(form: FormData, key: string): string[] { try { const value = JSON.parse(String(form.get(key) ?? "[]")); return Array.isArray(value) ? value.map(String).filter(Boolean).slice(0, 20) : []; } catch { return []; } }

export async function POST(request: Request) {
  const auth = await authenticate(request); if (!auth) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const form = await request.formData(); const file = form.get("file"); const profileId = safeSegment(String(form.get("profileId") ?? ""));
  if (!(file instanceof File) || !profileId) return Response.json({ error: "File and profile are required." }, { status: 400 });
  if (!DOCUMENT_MIME_TYPES.includes(file.type as typeof DOCUMENT_MIME_TYPES[number]) || file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) return Response.json({ error: "Upload a PDF or DOCX up to 10 MB." }, { status: 415 });
  const stream = new ReadableStream({ async start(controller) {
    const encoder = new TextEncoder(); const send = (event: object) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
    const id = crypto.randomUUID(); const fileName = safeSegment(file.name) || `document-${id}`; const storagePath = `${auth.userId}/${profileId}/${id}/${fileName}`;
    try {
      send({ stage: "uploading" }); const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await auth.client.storage.from("career-documents").upload(storagePath, buffer, { contentType: file.type, upsert: false }); if (uploadError) throw new Error("Private file upload failed.");
      const documentType = String(form.get("documentType") ?? "Other") as CareerDocumentType; const family = String(form.get("documentFamily") ?? documentType).slice(0, 160);
      const { data: familyRows, error: versionError } = await auth.client.from("career_documents").select("version_number,version").eq("user_id", auth.userId).eq("profile_id", profileId).eq("document_family", family); if (versionError) throw new Error("Could not calculate the next document version.");
      const highest = (familyRows ?? []).reduce((max, row) => Math.max(max, Number(row.version_number ?? String(row.version ?? "").match(/\d+/)?.[0] ?? 0)), 0); const requestedVersion = Number(form.get("versionNumber")); const versionNumber = Number.isInteger(requestedVersion) && requestedVersion > 0 ? requestedVersion : highest + 1;
      send({ stage: "parsing" }); let extractedText: string | null = null; let parsedData: object | null = null; let parseStatus = "parsed"; let parsedStatus = "ready"; let parseError: string | null = null; let lastParsedAt: string | null = null;
      try { const extracted = await extractDocument(buffer, file.type); send({ stage: "extracting" }); extractedText = extracted.text; parsedData = extracted.parsedData; lastParsedAt = new Date().toISOString(); } catch (error) { console.warn("Document parsing failed.", error); parseStatus = "failed"; parsedStatus = "error"; parseError = "The file was uploaded, but its content could not be parsed."; }
      const isPrimary = form.get("isPrimary") === "true"; if (isPrimary) { const { error } = await auth.client.from("career_documents").update({ is_primary: false }).eq("user_id", auth.userId).eq("profile_id", profileId).eq("document_family", family).eq("is_primary", true); if (error) throw new Error("Could not update the primary document."); }
      const markets = stringArray(form, "markets"); const directions = stringArray(form, "directions");
      const row = { id, user_id: auth.userId, profile_id: profileId, document_type: documentType, document_family: family, title: String(form.get("title") ?? file.name).slice(0, 200), language: String(form.get("language") ?? "Other") as CareerDocumentLanguage, version: `v${versionNumber}`, version_number: versionNumber, status: parseStatus === "parsed" ? "Parsed" : "Uploaded", file_name: fileName, storage_path: storagePath, mime_type: file.type, file_size: file.size, extracted_text: extractedText, parsed_data: parsedData, parse_status: parseStatus, parsed_status: parsedStatus, parse_error: parseError, is_primary: isPrimary, target_market: markets.join(", ").slice(0, 160), markets, directions, target_roles: stringArray(form, "targetRoles"), ats_score: null, last_parsed_at: lastParsedAt, notes: String(form.get("notes") ?? "").slice(0, 2000) };
      const { data, error } = await auth.client.from("career_documents").insert(row).select("*").single(); if (error) { await auth.client.storage.from("career-documents").remove([storagePath]); throw new Error("Document metadata could not be saved."); }
      const document = databaseDocumentToRecord(data as Record<string, unknown>); send({ stage: parsedStatus === "ready" ? "done" : "error", document, error: parseError });
    } catch (error) { await auth.client.storage.from("career-documents").remove([storagePath]); send({ stage: "error", error: error instanceof Error ? error.message : "Document upload failed." }); } finally { controller.close(); }
  }});
  return new Response(stream, { status: 201, headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}

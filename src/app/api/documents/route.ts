import { databaseDocumentToRecord } from "@/lib/document-api";
import { DOCUMENT_MIME_TYPES, extractDocument, MAX_DOCUMENT_BYTES } from "@/lib/document-extraction";
import { createSupabaseUserClient } from "@/lib/supabase/server";
import type { CareerDocumentLanguage, CareerDocumentType } from "@/types/domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function authenticate(request: Request) {
  const header = request.headers.get("authorization"); const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const client = token ? createSupabaseUserClient(token) : null; if (!client || !token) return null;
  const { data, error } = await client.auth.getUser(token); return error || !data.user ? null : { client, userId: data.user.id };
}

function safeSegment(value: string) { return value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^[-.]+/, "").slice(0, 120); }

export async function POST(request: Request) {
  const auth = await authenticate(request); if (!auth) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const form = await request.formData(); const file = form.get("file"); const profileId = safeSegment(String(form.get("profileId") ?? ""));
  if (!(file instanceof File) || !profileId) return Response.json({ error: "File and profile are required." }, { status: 400 });
  if (!DOCUMENT_MIME_TYPES.includes(file.type as typeof DOCUMENT_MIME_TYPES[number]) || file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) return Response.json({ error: "Upload a PDF or DOCX up to 10 MB." }, { status: 415 });
  const id = crypto.randomUUID(); const fileName = safeSegment(file.name) || `document-${id}`; const storagePath = `${auth.userId}/${profileId}/${id}/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer()); let extractedText: string | null = null; let parsedData: object | null = null; let parseStatus = "parsed"; let parseError: string | null = null;
  try { const extracted = await extractDocument(buffer, file.type); extractedText = extracted.text; parsedData = extracted.parsedData; } catch { parseStatus = "failed"; parseError = "文件已上传，但内容解析失败"; }
  const { error: uploadError } = await auth.client.storage.from("career-documents").upload(storagePath, buffer, { contentType: file.type, upsert: false });
  if (uploadError) return Response.json({ error: "Private file upload failed." }, { status: 500 });
  const row = { id, user_id: auth.userId, profile_id: profileId, document_type: String(form.get("documentType") ?? "Other") as CareerDocumentType, title: String(form.get("title") ?? file.name).slice(0, 200), language: String(form.get("language") ?? "Other") as CareerDocumentLanguage, version: String(form.get("version") ?? "v1").slice(0, 80), status: parseStatus === "parsed" ? "Parsed" : "Uploaded", file_name: fileName, storage_path: storagePath, mime_type: file.type, file_size: file.size, extracted_text: extractedText, parsed_data: parsedData, parse_status: parseStatus, parse_error: parseError, is_primary: form.get("isPrimary") === "true", target_market: String(form.get("targetMarket") ?? "").slice(0, 160), notes: String(form.get("notes") ?? "").slice(0, 2000) };
  const { data, error } = await auth.client.from("career_documents").insert(row).select("*").single();
  if (error) { await auth.client.storage.from("career-documents").remove([storagePath]); return Response.json({ error: "Document metadata could not be saved." }, { status: 500 }); }
  return Response.json({ document: databaseDocumentToRecord(data as Record<string, unknown>) }, { status: 201 });
}

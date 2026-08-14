import type { CareerDocumentRecord } from "@/types/domain";

export function databaseDocumentToRecord(row: Record<string, unknown>): CareerDocumentRecord {
  return {
    id: String(row.id), profileId: String(row.profile_id), documentType: String(row.document_type) as CareerDocumentRecord["documentType"],
    name: String(row.title), language: String(row.language) as CareerDocumentRecord["language"], version: String(row.version),
    status: String(row.status) as CareerDocumentRecord["status"], fileName: String(row.file_name), storagePath: String(row.storage_path),
    mimeType: String(row.mime_type), fileSize: Number(row.file_size), uploadedAt: String(row.uploaded_at), updatedAt: String(row.updated_at).slice(0, 10),
    extractedText: typeof row.extracted_text === "string" ? row.extracted_text : undefined,
    parsedData: typeof row.parsed_data === "object" && row.parsed_data !== null ? row.parsed_data as CareerDocumentRecord["parsedData"] : undefined,
    parseStatus: String(row.parse_status) as CareerDocumentRecord["parseStatus"], parseError: typeof row.parse_error === "string" ? row.parse_error : undefined,
    isPrimary: Boolean(row.is_primary), targetMarket: String(row.target_market ?? ""), notes: String(row.notes ?? ""),
  };
}

async function token(): Promise<string> {
  const { createSupabaseBrowserClient } = await import("@/lib/supabase/browser");
  const client = createSupabaseBrowserClient();
  const { data } = await client?.auth.getSession() ?? { data: { session: null } };
  if (!data.session) throw new Error("Sign in before managing private documents.");
  return data.session.access_token;
}

export async function uploadCareerDocument(file: File, fields: Record<string, string>): Promise<CareerDocumentRecord> {
  const form = new FormData(); form.set("file", file); Object.entries(fields).forEach(([key, value]) => form.set(key, value));
  const response = await fetch("/api/documents", { method: "POST", headers: { Authorization: `Bearer ${await token()}` }, body: form });
  const result = await response.json();
  if (!response.ok) throw new Error(String(result.error ?? "Document upload failed."));
  return result.document as CareerDocumentRecord;
}

export async function deleteCareerDocumentFile(id: string): Promise<void> {
  const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${await token()}` } });
  if (!response.ok) { const result = await response.json(); throw new Error(String(result.error ?? "Document deletion failed.")); }
}

export async function downloadCareerDocument(id: string, fileName: string): Promise<void> {
  const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${await token()}` } });
  if (!response.ok) throw new Error("Document download failed.");
  const url = URL.createObjectURL(await response.blob()); const anchor = window.document.createElement("a");
  anchor.href = url; anchor.download = fileName; anchor.click(); URL.revokeObjectURL(url);
}

export async function updateCareerDocumentStatus(id: string, status: "Parsed" | "Needs update" | "Ready" | "Archived"): Promise<CareerDocumentRecord> {
  const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, { method: "PATCH", headers: { Authorization: `Bearer ${await token()}`, "content-type": "application/json" }, body: JSON.stringify({ status }) });
  const result = await response.json(); if (!response.ok) throw new Error(String(result.error ?? "Document update failed.")); return result.document as CareerDocumentRecord;
}

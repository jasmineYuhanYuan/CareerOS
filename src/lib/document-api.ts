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
    markets: Array.isArray(row.markets) ? row.markets.map(String) : String(row.target_market ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    directions: Array.isArray(row.directions) ? row.directions.map(String) : [], documentFamily: String(row.document_family ?? row.document_type),
    versionNumber: Number(row.version_number ?? String(row.version ?? "1").match(/\d+/)?.[0] ?? 1),
    parsedStatus: String(row.parsed_status ?? (row.parse_status === "parsed" ? "ready" : "error")) as CareerDocumentRecord["parsedStatus"],
    targetRoles: Array.isArray(row.target_roles) ? row.target_roles.map(String) : [], atsScore: row.ats_score === null || row.ats_score === undefined ? null : Number(row.ats_score),
    lastParsedAt: typeof row.last_parsed_at === "string" ? row.last_parsed_at : null,
  };
}

export async function getDocumentAccessToken(clientOverride?: { auth: { getSession: () => Promise<{ data: { session: { access_token: string } | null } }> } } | null): Promise<string> {
  const client = clientOverride === undefined ? (await import("@/lib/supabase/browser")).createSupabaseBrowserClient() : clientOverride;
  const { data } = await client?.auth.getSession() ?? { data: { session: null } };
  if (!data.session) throw new Error("Sign in before managing private documents.");
  return data.session.access_token;
}

export type DocumentUploadStage = "uploading" | "parsing" | "extracting" | "done" | "error";
export async function listCareerDocuments(profileId: string): Promise<CareerDocumentRecord[]> {
  const response = await fetch(`/api/documents?profileId=${encodeURIComponent(profileId)}`, { headers: { Authorization: `Bearer ${await getDocumentAccessToken()}` }, cache: "no-store" });
  if (!response.ok) throw new Error("Document library could not be loaded.");
  return (await response.json() as { documents: CareerDocumentRecord[] }).documents;
}
export async function uploadCareerDocument(file: File, fields: Record<string, string>, onStage?: (stage: DocumentUploadStage) => void): Promise<CareerDocumentRecord> {
  const form = new FormData(); form.set("file", file); Object.entries(fields).forEach(([key, value]) => form.set(key, value));
  onStage?.("uploading");
  const response = await fetch("/api/documents", { method: "POST", headers: { Authorization: `Bearer ${await getDocumentAccessToken()}` }, body: form });
  if (!response.ok || !response.body || !response.headers.get("content-type")?.includes("ndjson")) { const result = await response.json(); onStage?.("error"); throw new Error(String(result.error ?? "Document upload failed.")); }
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let pending = ""; let document: CareerDocumentRecord | null = null; let streamError = "";
  while (true) { const { done, value } = await reader.read(); pending += decoder.decode(value, { stream: !done }); const lines = pending.split("\n"); pending = lines.pop() ?? ""; for (const line of lines) { if (!line) continue; const event = JSON.parse(line) as { stage: DocumentUploadStage; document?: CareerDocumentRecord; error?: string }; onStage?.(event.stage); if (event.document) document = event.document; if (event.error) streamError = event.error; } if (done) break; }
  if (document) return document; throw new Error(streamError || "Document upload did not return a record.");
}

export async function deleteCareerDocumentFile(id: string): Promise<void> {
  const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${await getDocumentAccessToken()}` } });
  if (!response.ok) { const result = await response.json(); throw new Error(String(result.error ?? "Document deletion failed.")); }
}

export async function downloadCareerDocument(id: string, fileName: string): Promise<void> {
  const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${await getDocumentAccessToken()}` } });
  if (!response.ok) throw new Error("Document download failed.");
  const url = URL.createObjectURL(await response.blob()); const anchor = window.document.createElement("a");
  anchor.href = url; anchor.download = fileName; anchor.click(); URL.revokeObjectURL(url);
}

export async function updateCareerDocumentStatus(id: string, status: "Parsed" | "Needs update" | "Ready" | "Archived"): Promise<CareerDocumentRecord> {
  const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, { method: "PATCH", headers: { Authorization: `Bearer ${await getDocumentAccessToken()}`, "content-type": "application/json" }, body: JSON.stringify({ status }) });
  const result = await response.json(); if (!response.ok) throw new Error(String(result.error ?? "Document update failed.")); return result.document as CareerDocumentRecord;
}

export async function updateCareerDocument(id: string, updates: Record<string, unknown>): Promise<CareerDocumentRecord> {
  const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, { method: "PATCH", headers: { Authorization: `Bearer ${await getDocumentAccessToken()}`, "content-type": "application/json" }, body: JSON.stringify(updates) });
  const result = await response.json(); if (!response.ok) throw new Error(String(result.error ?? "Document update failed.")); return result.document as CareerDocumentRecord;
}

export async function viewCareerDocument(id: string): Promise<void> {
  const response = await fetch(`/api/documents/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${await getDocumentAccessToken()}` } });
  if (!response.ok) throw new Error("Document preview failed."); const url = URL.createObjectURL(await response.blob()); window.open(url, "_blank", "noopener,noreferrer"); setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

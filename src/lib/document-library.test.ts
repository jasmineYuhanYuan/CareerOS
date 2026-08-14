import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createSeedState, YUHAN_ID } from "@/data/seed";
import { documentLanguageLabel, documentTypeLabel, nextDocumentVersion, titleFromFileName, validateDocumentFile } from "./document-metadata";
import { migrateState, serialiseState } from "./storage";
import type { CareerDocumentRecord } from "@/types/domain";

const manager = readFileSync(resolve("src/components/documents/document-manager.tsx"), "utf8");
const route = readFileSync(resolve("src/app/api/documents/route.ts"), "utf8");

describe("resume library UX", () => {
  it("keeps the native file input visually hidden behind a custom drop zone", () => { expect(manager).toMatch(/className="sr-only"\s+type="file"/); expect(manager).toContain('role="button"'); expect(manager).toContain("onDrop={drop}"); });
  it("accepts PDF and DOCX", () => { expect(validateDocumentFile({ name: "resume.pdf", size: 100, type: "application/pdf" })).toBeNull(); expect(validateDocumentFile({ name: "resume.docx", size: 100, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })).toBeNull(); });
  it("rejects unsupported and oversized files", () => { expect(validateDocumentFile({ name: "resume.txt", size: 100, type: "text/plain" })).toBe("type"); expect(validateDocumentFile({ name: "resume.pdf", size: 10 * 1024 * 1024 + 1, type: "application/pdf" })).toBe("size"); });
  it("generates readable titles without overwriting metadata logic", () => { expect(titleFromFileName("Jasmine_Yuan_Backend_Resume_v3.pdf")).toBe("Jasmine Yuan Backend Resume"); });
  it("increments versions within the same family", () => { const documents = [{ documentFamily: "English technical résumé", documentType: "English technical résumé", version: "v2", versionNumber: 2 }] as CareerDocumentRecord[]; expect(nextDocumentVersion(documents, "English technical résumé")).toBe(3); expect(nextDocumentVersion(documents, "Chinese product résumé")).toBe(1); });
  it("localises résumé types and languages", () => { expect(documentTypeLabel("Chinese technical résumé", "zh-CN")).toBe("中文技术简历"); expect(documentTypeLabel("Chinese technical résumé", "en")).toBe("Chinese technical résumé"); expect(documentLanguageLabel("Bilingual", "zh-CN")).toBe("中英双语"); expect(documentLanguageLabel("English", "en")).toBe("English"); });
  it("saves market and direction arrays and streams real upload states", () => { expect(manager).toContain('markets: JSON.stringify(draft.markets)'); expect(manager).toContain('directions: JSON.stringify(draft.directions)'); expect(route).toContain('send({ stage: "uploading" })'); expect(route).toContain('send({ stage: "parsing" })'); expect(route).toContain('send({ stage: "extracting" })'); expect(route).toContain('parsedStatus = "error"'); });
  it("preserves old document records and cloud JSON serialization", () => { const state = createSeedState(); const legacy = { id: "legacy", profileId: YUHAN_ID, documentType: "English résumé", name: "Legacy", version: "v1", updatedAt: "2026-08-14", notes: "", status: "Missing" } satisfies CareerDocumentRecord; state.profiles[YUHAN_ID].documents = [legacy]; const migrated = migrateState(JSON.parse(serialiseState(state))); expect(migrated?.profiles[YUHAN_ID].documents[0]).toMatchObject({ name: "Legacy", markets: [], directions: [], versionNumber: 1, parsedStatus: "pending" }); expect(JSON.parse(serialiseState(migrated!)).profiles[YUHAN_ID].documents[0].name).toBe("Legacy"); });
  it("enforces one primary version and exposes responsive/mobile-safe controls", () => { const migration = readFileSync(resolve("supabase/migrations/20260814050248_documents_resume_library_metadata.sql"), "utf8"); expect(migration).toContain("career_documents_one_primary_per_family"); expect(manager).toContain("sm:grid-cols-2"); expect(manager).toContain("w-full sm:w-auto"); });
});

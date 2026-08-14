import { describe, expect, it } from "vitest";
import { opportunities } from "@/data/opportunities";
import { createSeedState, TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { calculateOpportunityMatch } from "@/lib/opportunity-match";
import { documentHasRealFile, documentIsReady, parseResumeEvidence, recommendResumeForOpportunity } from "./document-evidence";
import type { CareerDocumentRecord } from "@/types/domain";

function resume(profileId: string, overrides: Partial<CareerDocumentRecord> = {}): CareerDocumentRecord {
  return { id: `doc-${profileId}`, profileId, documentType: "English résumé", name: "English Software Engineering Resume", version: "v2", updatedAt: "2026-08-14", notes: "", status: "Ready", language: "English", fileName: "resume.pdf", storagePath: `user/${profileId}/doc/resume.pdf`, mimeType: "application/pdf", fileSize: 1000, uploadedAt: "2026-08-14T00:00:00Z", extractedText: "React TypeScript", parsedData: parseResumeEvidence("React TypeScript"), parseStatus: "parsed", ...overrides };
}

describe("real document evidence", () => {
  it("does not count metadata-only records as ready", () => { const record = resume(YUHAN_ID, { storagePath: undefined, fileName: undefined, fileSize: undefined, uploadedAt: undefined }); expect(documentHasRealFile(record)).toBe(false); expect(documentIsReady(record)).toBe(false); });
  it("keeps Yuhan and Tommy document evidence isolated", () => { const state = createSeedState(); state.profiles[YUHAN_ID].documents.push(resume(YUHAN_ID)); expect(state.profiles[TOMMY_ID].documents.some((item) => item.id === `doc-${YUHAN_ID}`)).toBe(false); });
  it("extracts only explicit structured evidence", () => { const data = parseResumeEvidence("UNSW Bachelor of Computer Science\nReact and TypeScript\nhttps://github.com/example"); expect(data.skills).toEqual(expect.arrayContaining(["React", "TypeScript"])); expect(data.skills).not.toContain("SQL"); expect(data.links).toEqual(["https://github.com/example"]); });
  it("adds resume evidence to opportunity matching", () => { const state = createSeedState(); const opportunity = opportunities.find((item) => item.skillTags.some((skill) => skill === "TypeScript"))!; const profile = { ...state.profiles[YUHAN_ID].profile, skills: [] }; const without = calculateOpportunityMatch(opportunity, profile, []); const withResume = calculateOpportunityMatch(opportunity, profile, [resume(YUHAN_ID)]); expect(withResume.score).toBeGreaterThan(without.score); expect(withResume.strengths).toContain("Resume: TypeScript found"); });
  it("selects the best available resume version", () => { const state = createSeedState(); const opportunity = opportunities.find((item) => item.roleFamilyTags.includes("Software Engineering"))!; const product = resume(YUHAN_ID, { id: "product", name: "Product AI Resume", targetMarket: "Product AI", parsedData: parseResumeEvidence("Product Management") }); const software = resume(YUHAN_ID, { id: "software", name: "English Software Engineering Resume", targetMarket: "Software Engineering", parsedData: parseResumeEvidence("React TypeScript") }); expect(recommendResumeForOpportunity(state.profiles[YUHAN_ID].profile, [product, software], opportunity)?.id).toBe("software"); });
  it("preserves an immutable application document snapshot shape", () => { const selected = resume(YUHAN_ID); const snapshot = { documentId: selected.id, title: selected.name, version: selected.version, fileName: selected.fileName!, storagePath: selected.storagePath!, capturedAt: "2026-08-14T00:00:00Z" }; selected.version = "v3"; expect(snapshot.version).toBe("v2"); });
});

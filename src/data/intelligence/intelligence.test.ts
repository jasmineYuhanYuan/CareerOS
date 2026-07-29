import { describe, expect, it } from "vitest";
import {
  australiaRegulatedHealthcareProfessions,
  australiaTechnologyCompanies,
  australiaVisas,
  certifications,
  chinaTechnologyCompanies,
  intelligenceCoverage,
  intelligenceRecords,
  xeroGraduateInterview,
  xeroHackerRankAssessment,
} from ".";
import { validateIntelligenceRecords } from "./quality";
import { intelligenceSearchIndex, searchIntelligence } from "./search";

describe("career intelligence repository", () => {
  it("requires complete provenance on every intelligence record", () => {
    expect(validateIntelligenceRecords(intelligenceRecords)).toEqual([]);
  });

  it("uses only government sources for visa records", () => {
    expect(australiaVisas.every((record) => record.sourceType === "Government")).toBe(true);
  });

  it("keeps China employer records on official Chinese-language portals", () => {
    expect(chinaTechnologyCompanies.every((record) => record.sourceType === "Employer" && record.language === "zh-CN")).toBe(true);
  });

  it("leaves unsupported healthcare salary and demand fields unknown", () => {
    expect(australiaRegulatedHealthcareProfessions.every((record) => record.salary === null && record.demand === null)).toBe(true);
  });

  it("reports coverage from the datasets rather than hard-coded marketing totals", () => {
    expect(intelligenceCoverage.companies).toBeGreaterThan(australiaTechnologyCompanies.length);
    expect(intelligenceCoverage.certifications).toBe(certifications.length);
    expect(intelligenceCoverage.healthcareProfessions).toBe(australiaRegulatedHealthcareProfessions.length);
  });

  it("searches across multiple knowledge domains", () => {
    expect(searchIntelligence("Atlassian").some((record) => record.domain === "Company")).toBe(true);
    expect(searchIntelligence("chiropractic").some((record) => record.domain === "Healthcare")).toBe(true);
    expect(searchIntelligence("subclass 482").some((record) => record.domain === "Visa")).toBe(true);
    expect(new Set(intelligenceSearchIndex.map((record) => record.domain)).size).toBeGreaterThanOrEqual(7);
  });

  it("keeps Xero interview and OA unknowns explicit", () => {
    expect(xeroGraduateInterview.difficulty).toBeNull();
    expect(xeroGraduateInterview.timeline).toBeNull();
    expect(xeroHackerRankAssessment.calculator).toBeNull();
    expect(xeroHackerRankAssessment.camera).toBeNull();
  });
});

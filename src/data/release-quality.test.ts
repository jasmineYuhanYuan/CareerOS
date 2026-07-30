import { describe, expect, it } from "vitest";
import { intelligenceRecords } from "@/data/intelligence";
import { opportunities } from "@/data/opportunities";
import { organisations, createSeedState } from "@/data/seed";
import { sourceHealthIndex, validateSourceIntegrity } from "@/data/source-health";
import { careerKnowledgeGraph } from "@/data/graph";

describe("Sprint 9 release data gates", () => {
  it("keeps samples out of verified opportunity results and current counts", () => {
    const verified = opportunities.filter((item) => item.verificationStatus === "Official source");
    expect(verified.every((item) => !item.sampleData)).toBe(true);
    expect(opportunities.filter((item) => !item.sampleData && !item.archived).every((item) => item.verificationStatus === "Official source")).toBe(true);
  });

  it("requires demo mode to be explicit and disabled by default", () => {
    const state = createSeedState();
    expect(state.dashboardPreferences.demoMode).toBe(false);
    expect(organisations.some((item) => item.sampleData)).toBe(true);
  });

  it("keeps sample organisations out of verified graph entities", () => {
    const sampleNames = new Set(organisations.filter((item) => item.sampleData).map((item) => item.name.replace(" (Sample)", "")));
    expect(careerKnowledgeGraph.entities.every((entity) => !sampleNames.has(entity.name))).toBe(true);
  });

  it("passes source integrity checks and produces review state for every sourced record", () => {
    expect(validateSourceIntegrity()).toEqual([]);
    expect(sourceHealthIndex.length).toBeGreaterThan(intelligenceRecords.length);
    expect(sourceHealthIndex.every((item) => item.lastSuccessfulReview && item.nextReviewDate)).toBe(true);
  });
});

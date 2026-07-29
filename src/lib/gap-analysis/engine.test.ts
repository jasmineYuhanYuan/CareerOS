import { describe, expect, it } from "vitest";
import { createSeedState, TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { analyseCareerGap } from "./engine";

describe("explainable gap analysis", () => {
  const seed = createSeedState();

  it("keeps Tommy's major eligibility facts unknown and caps the score", () => {
    const result = analyseCareerGap(seed.profiles[TOMMY_ID], "occupation:chiropractor");
    expect(result.targetName).toContain("Chiropractor");
    expect(result.overallReadinessScore).toBeLessThanOrEqual(64);
    expect(result.unknownRequirements.map((item) => item.id)).toEqual(expect.arrayContaining([
      "qualification", "registration", "work-eligibility", "english-evidence",
    ]));
    expect(result.blockers.map((item) => item.id)).toEqual(expect.arrayContaining([
      "qualification", "registration", "work-eligibility",
    ]));
  });

  it("does not invent Tommy's placement, techniques, patient experience or referees", () => {
    const result = analyseCareerGap(seed.profiles[TOMMY_ID], "occupation:chiropractor");
    expect(result.unknownRequirements.find((item) => item.id === "placement-summary")).toBeTruthy();
    expect(result.missingRequirements.find((item) => item.id === "referees")).toBeTruthy();
  });

  it("analyses an exact Atlassian target and preserves eligibility unknowns", () => {
    const result = analyseCareerGap(seed.profiles[YUHAN_ID], "opportunity:atlassian-au-intern-program");
    expect(result.targetName).toContain("Atlassian");
    expect(result.unknownRequirements.map((item) => item.id)).toEqual(expect.arrayContaining([
      "work-eligibility", "graduation-window",
    ]));
    expect(result.matchedRequirements.map((item) => item.id)).toContain("target-lifecycle");
    expect(result.missingRequirements.map((item) => item.id)).toContain("application-materials");
    expect(result.overallReadinessScore).toBeLessThanOrEqual(64);
  });

  it("blocks an exact archived opportunity rather than presenting a generic score", () => {
    const result = analyseCareerGap(seed.profiles[YUHAN_ID], "opportunity:bytedance-2026-campus-programme-archived");
    expect(result.targetName).toContain("ByteDance");
    expect(result.blockers.find((item) => item.id === "target-lifecycle")?.status).toBe("blocked");
    expect(result.overallReadinessScore).toBeLessThanOrEqual(45);
  });

  it("raises confidence without hiding a required failure", () => {
    const workspace = structuredClone(seed.profiles[TOMMY_ID]);
    workspace.profile.expectedGraduationDate = "2026-12-01";
    workspace.profile.registrationStatus = "Blocked";
    workspace.profile.workEligibility = "Confirmed";
    const result = analyseCareerGap(workspace, "occupation:chiropractor");
    expect(result.overallReadinessScore).toBeLessThanOrEqual(45);
    expect(result.blockers.find((item) => item.id === "registration")?.status).toBe("blocked");
    expect(result.scoreExplanation.join(" ")).toContain("capped");
  });

  it("creates actions without invented due dates", () => {
    const result = analyseCareerGap(seed.profiles[TOMMY_ID], "occupation:chiropractor");
    expect(result.recommendedNextActions.length).toBeGreaterThan(0);
    expect(result.recommendedNextActions.every((action) => action.dueDate === "")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { createSeedState, TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { analyseCareerGap } from "./engine";

describe("explainable gap analysis", () => {
  const seed = createSeedState();

  it("keeps Tommy's major eligibility facts unknown and caps the score", () => {
    const result = analyseCareerGap(seed.profiles[TOMMY_ID], "target-graduate-chiropractor");
    expect(result.targetName).toBe("Graduate Chiropractor");
    expect(result.overallReadinessScore).toBeLessThanOrEqual(64);
    expect(result.unknownRequirements.map((item) => item.id)).toEqual(expect.arrayContaining([
      "qualification", "registration", "work-eligibility", "english-evidence",
    ]));
    expect(result.blockers.map((item) => item.id)).toEqual(expect.arrayContaining([
      "qualification", "registration", "work-eligibility",
    ]));
  });

  it("does not invent Tommy's placement, techniques, patient experience or referees", () => {
    const result = analyseCareerGap(seed.profiles[TOMMY_ID], "target-chiropractor");
    expect(result.unknownRequirements.find((item) => item.id === "placement-summary")).toBeTruthy();
    expect(result.missingRequirements.find((item) => item.id === "referees")).toBeTruthy();
  });

  it("preserves Yuhan work rights, graduation and internship experience as unknown", () => {
    const result = analyseCareerGap(seed.profiles[YUHAN_ID], "target-software-internship");
    expect(result.unknownRequirements.map((item) => item.id)).toEqual(expect.arrayContaining([
      "study-timing", "work-eligibility", "internship",
    ]));
    expect(result.matchedRequirements.map((item) => item.id)).toContain("technical-evidence");
    expect(result.overallReadinessScore).toBeLessThanOrEqual(64);
  });

  it("raises confidence without hiding a required failure", () => {
    const workspace = structuredClone(seed.profiles[TOMMY_ID]);
    workspace.profile.expectedGraduationDate = "2026-12-01";
    workspace.profile.registrationStatus = "Blocked";
    workspace.profile.workEligibility = "Confirmed";
    const result = analyseCareerGap(workspace, "target-graduate-chiropractor");
    expect(result.overallReadinessScore).toBeLessThanOrEqual(45);
    expect(result.blockers.find((item) => item.id === "registration")?.status).toBe("blocked");
    expect(result.scoreExplanation.join(" ")).toContain("capped");
  });

  it("creates actions without invented due dates", () => {
    const result = analyseCareerGap(seed.profiles[TOMMY_ID], "target-graduate-chiropractor");
    expect(result.recommendedNextActions.length).toBeGreaterThan(0);
    expect(result.recommendedNextActions.every((action) => action.dueDate === "")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { verifiedCareerOpportunities } from "./opportunities";
import { verifiedProgrammes } from "./programmes";
import { validateVerifiedOpportunities, validateVerifiedProgrammes } from "./quality";

describe("verified career datasets", () => {
  it("requires complete provenance and review metadata for every opportunity", () => {
    expect(validateVerifiedOpportunities(verifiedCareerOpportunities)).toEqual([]);
  });

  it("requires complete provenance and review metadata for every programme", () => {
    expect(validateVerifiedProgrammes(verifiedProgrammes)).toEqual([]);
  });

  it("never fills unknown salary, visa, deadline, IELTS or GRE values with guesses", () => {
    expect(verifiedCareerOpportunities.some((record) => record.salary === null)).toBe(true);
    expect(verifiedCareerOpportunities.some((record) => record.deadline === null)).toBe(true);
    expect(verifiedProgrammes.some((record) => record.ielts === null)).toBe(true);
    expect(verifiedProgrammes.some((record) => record.gre === null)).toBe(true);
  });
});

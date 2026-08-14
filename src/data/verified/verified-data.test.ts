import { describe, expect, it } from "vitest";
import { verifiedCareerOpportunities } from "./opportunities";
import { verifiedProgrammes } from "./programmes";
import { validateVerifiedOpportunities, validateVerifiedProgrammes } from "./quality";
import { australianChiropracticRegistration, canberraChiropracticEmployers, chiropracticVacancies } from "./chiropractic";
import { validateEmployerDirectory, validateRegistrationPathway } from "./quality";

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

  it("validates the Australian chiropractic registration pathway and employer directory", () => {
    expect(validateRegistrationPathway(australianChiropracticRegistration)).toEqual([]);
    expect(validateEmployerDirectory(canberraChiropracticEmployers)).toEqual([]);
  });

  it("keeps stale leads archived and requires evidence for the current chiropractic vacancy", () => {
    expect(chiropracticVacancies.filter((record) => record.vacancyStatus === "Archived")).toHaveLength(3);
    expect(chiropracticVacancies.filter((record) => record.vacancyStatus === "Current")).toHaveLength(1);
    expect(chiropracticVacancies.find((record) => record.vacancyStatus === "Current")).toMatchObject({ verificationStatus: "Verified", sourceType: "Job board" });
  });
});

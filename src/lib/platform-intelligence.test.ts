import { describe, expect, it } from "vitest";
import { buildCandidateIntelligence, buildEmployerIntelligence } from "./platform-intelligence";
import type { CareerDocumentRecord, CareerProfile, Job, Organisation } from "@/types/domain";

const candidate: CareerProfile = {
  id: "candidate-1",
  displayName: "Candidate",
  preferredName: "Candidate",
  university: "University",
  degree: "Computer Science",
  discipline: "Computer Science",
  studyLevel: "Undergraduate",
  location: "Sydney",
  expectedGraduationDate: "",
  workEligibility: "To be confirmed",
  registrationStatus: "Not applicable",
  careerGoals: ["Software Engineer"],
  preferredCities: ["Sydney"],
  skills: [{ id: "skill-1", name: "TypeScript", category: "Software", proficiency: "Working", evidence: "Portfolio" }],
  projects: [],
  experienceSummary: "",
  linkedInUrl: "",
  githubUrl: "",
  portfolioUrl: "",
};

describe("platform intelligence", () => {
  it("combines profile and parsed résumé evidence without replacing the candidate identity", () => {
    const document = {
      id: "resume-1",
      profileId: candidate.id,
      documentType: "English résumé",
      name: "Resume",
      version: "1",
      updatedAt: "2026-08-14T00:00:00Z",
      notes: "",
      status: "Parsed",
      parseStatus: "parsed",
      parsedData: { skills: ["TypeScript", "React"], education: ["BSc"], experience: [], certifications: [], languages: [], links: [] },
    } satisfies CareerDocumentRecord;

    const result = buildCandidateIntelligence(candidate, [document]);
    expect(result.profileId).toBe(candidate.id);
    expect(result.skills.find((skill) => skill.name === "typescript")?.evidence).toEqual(expect.arrayContaining(["Portfolio", "Parsed résumé"]));
    expect(result.skills.some((skill) => skill.name === "react")).toBe(true);
  });

  it("does not turn an employer directory record into an active job", () => {
    const employer = {
      id: "clinic-1", name: "Clinic", organisationType: "Clinic", sector: "Chiropractic",
      country: "Australia", city: "Canberra", websiteUrl: "https://clinic.example", careersUrl: "",
      description: "Directory record", roleFamilies: ["Chiropractic"], sampleData: false, verified: true,
    } satisfies Organisation;
    expect(buildEmployerIntelligence(employer, []).activeJobs).toHaveLength(0);
  });

  it("only exposes verified non-sample jobs as employer hiring signals", () => {
    const employer = {
      id: "employer-1", name: "Employer", organisationType: "Technology company", sector: "Technology",
      country: "Australia", city: "Sydney", websiteUrl: "", careersUrl: "https://employer.example/careers",
      description: "", roleFamilies: ["Software Engineering"], sampleData: false, verified: true,
    } satisfies Organisation;
    const baseJob = {
      id: "job-1", organisationId: employer.id, companyName: employer.name, title: "Engineer",
      roleFamily: "Software Engineering", discipline: "Computer Science", employmentType: "Full-time",
      location: "Sydney", country: "Australia", remoteType: "Hybrid", description: "", requirements: [],
      preferredSkills: [], postedDate: "", deadline: "", sourceUrl: "https://employer.example/jobs/1",
      suitableProfileIds: [], tags: [], sampleData: false, verified: true,
    } satisfies Job;
    const result = buildEmployerIntelligence(employer, [baseJob, { ...baseJob, id: "job-2", verified: false }]);
    expect(result.activeJobs.map((job) => job.id)).toEqual(["job-1"]);
    expect(result.hiringSignals.filter((signal) => signal.type === "active-vacancy")).toHaveLength(1);
  });
});

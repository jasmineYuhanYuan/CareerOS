import type { CareerDocumentRecord, CareerProfile, Job, Organisation, ParsedResumeData } from "@/types/domain";

export type EmployerVerification = "verified" | "partially-verified" | "unverified" | "archived";

export interface EmployerIntelligenceRecord {
  employer: Organisation;
  aliases: string[];
  activeJobs: Job[];
  hiringSignals: Array<{
    type: "active-vacancy" | "careers-page";
    label: string;
    sourceUrl: string;
    verifiedAt: string | null;
  }>;
  verificationStatus: EmployerVerification;
}

export interface CandidateIntelligenceProfile {
  profileId: string;
  targetRoles: string[];
  preferredLocations: string[];
  skills: Array<{ name: string; evidence: string[] }>;
  education: string[];
  experience: string[];
  certifications: string[];
  completeness: number;
}

function latestParsedResume(documents: CareerDocumentRecord[]): ParsedResumeData | undefined {
  return documents
    .filter((document) => document.parseStatus === "parsed" && document.parsedData)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.parsedData;
}

export function buildCandidateIntelligence(
  profile: CareerProfile,
  documents: CareerDocumentRecord[],
): CandidateIntelligenceProfile {
  const resume = latestParsedResume(documents);
  const skills = new Map<string, Set<string>>();

  for (const skill of profile.skills) {
    skills.set(skill.name.toLowerCase(), new Set([
      "Candidate profile",
      ...(skill.evidence ? [skill.evidence] : []),
    ]));
  }
  for (const skill of resume?.skills ?? []) {
    const key = skill.toLowerCase();
    const evidence = skills.get(key) ?? new Set<string>();
    evidence.add("Parsed résumé");
    skills.set(key, evidence);
  }

  const completenessSignals = [
    profile.careerGoals.length > 0,
    profile.preferredCities.length > 0,
    skills.size > 0,
    Boolean(profile.degree || resume?.education.length),
    Boolean(profile.experienceSummary || resume?.experience.length),
    profile.projects.length > 0,
    Boolean(profile.workEligibility),
    documents.some((document) => document.parseStatus === "parsed"),
  ];

  return {
    profileId: profile.id,
    targetRoles: profile.careerGoals,
    preferredLocations: profile.preferredCities,
    skills: [...skills.entries()].map(([name, evidence]) => ({ name, evidence: [...evidence] })),
    education: resume?.education ?? [profile.degree].filter(Boolean),
    experience: resume?.experience ?? [profile.experienceSummary].filter(Boolean),
    certifications: resume?.certifications ?? [],
    completeness: Math.round(completenessSignals.filter(Boolean).length / completenessSignals.length * 100),
  };
}

export function buildEmployerIntelligence(
  employer: Organisation,
  jobs: Job[],
): EmployerIntelligenceRecord {
  const activeJobs = jobs.filter((job) =>
    job.organisationId === employer.id &&
    job.sampleData === false &&
    job.verified === true &&
    Boolean(job.sourceUrl),
  );
  const hiringSignals: EmployerIntelligenceRecord["hiringSignals"] = activeJobs.map((job) => ({
    type: "active-vacancy",
    label: job.title,
    sourceUrl: job.sourceUrl,
    verifiedAt: job.lastUpdated ?? null,
  }));
  if (employer.careersUrl) {
    hiringSignals.push({
      type: "careers-page",
      label: "Official careers page",
      sourceUrl: employer.careersUrl,
      verifiedAt: employer.lastUpdated ?? null,
    });
  }

  return {
    employer,
    aliases: [],
    activeJobs,
    hiringSignals,
    verificationStatus: employer.verified
      ? "verified"
      : employer.sampleData ? "unverified" : "partially-verified",
  };
}

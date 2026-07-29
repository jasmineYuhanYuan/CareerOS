import { jobs, organisations } from "@/data/seed";
import type { Opportunity, OpportunityCategory, VerificationStatus } from "@/types/domain";

export const opportunityCategories: OpportunityCategory[] = [
  "Job", "Internship", "Graduate program", "Research opportunity", "Scholarship",
  "Hackathon", "Competition", "Networking event", "Career event",
  "Continuing education", "Professional registration", "Other",
];

export const verificationStatuses: VerificationStatus[] = ["Sample", "Unverified", "Official source", "Expired", "Archived"];

const jobOpportunities: Opportunity[] = jobs.map((job) => ({
  id: `opportunity-${job.id}`,
  category: job.employmentType === "Internship" ? "Internship" : job.employmentType === "Graduate" ? "Graduate program" : "Job",
  title: job.title,
  organisationId: job.organisationId,
  organisationName: job.companyName,
  description: job.description,
  disciplineTags: [job.discipline],
  roleFamilyTags: [job.roleFamily],
  skillTags: job.preferredSkills,
  suitableProfileIds: job.suitableProfileIds,
  country: job.country,
  city: job.location,
  locationText: `${job.location}, ${job.country}`,
  remoteType: job.remoteType,
  employmentType: job.employmentType,
  deadline: job.deadline || undefined,
  publishedDate: job.postedDate,
  sourceUrl: job.sourceUrl,
  sourceName: `${job.companyName} official careers`,
  sourceType: job.sourceType ?? "Seed",
  verificationStatus: job.verified ? "Official source" : "Sample",
  lastVerifiedAt: job.lastUpdated,
  dataNotes: job.verified
    ? `Verified programme-level record. Application stage: ${job.applicationStage ?? "Not published"}.`
    : "Sample planning record. Not a verified active vacancy.",
  eligibilityText: job.requirements.join(". "),
  salaryText: job.salaryText,
  sampleData: job.sampleData,
  archived: false,
}));

export const opportunities: Opportunity[] = jobOpportunities;

function validDate(value: string | undefined): boolean {
  return value === undefined || /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

export interface OpportunityValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateOpportunities(records: Opportunity[], organisationIds = new Set(organisations.map((item) => item.id))): OpportunityValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const record of records) {
    if (!record.id || !record.title || !record.organisationId) errors.push(`Missing required fields: ${record.id || "unknown"}`);
    if (ids.has(record.id)) errors.push(`Duplicate opportunity ID: ${record.id}`);
    ids.add(record.id);
    if (!opportunityCategories.includes(record.category)) errors.push(`Invalid category: ${record.id}`);
    if (!verificationStatuses.includes(record.verificationStatus)) errors.push(`Invalid verification status: ${record.id}`);
    if (!organisationIds.has(record.organisationId)) errors.push(`Unknown organisation: ${record.id}`);
    for (const [name, value] of [["deadline", record.deadline], ["publishedDate", record.publishedDate], ["lastVerifiedAt", record.lastVerifiedAt]] as const) {
      if (!validDate(value)) errors.push(`Invalid ${name}: ${record.id}`);
    }
    if (record.verificationStatus === "Official source" && (!record.sourceUrl || !record.lastVerifiedAt)) {
      errors.push(`Official source requires URL and last verified date: ${record.id}`);
    }
    if (record.verificationStatus === "Official source" && record.sampleData) {
      errors.push(`Official source cannot be sample data: ${record.id}`);
    }
    if (record.verificationStatus === "Archived" && !record.archived) {
      errors.push(`Archived status requires archived flag: ${record.id}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

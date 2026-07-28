import { jobs, organisations, TOMMY_ID, YUHAN_ID } from "@/data/seed";
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
  deadline: job.deadline,
  publishedDate: job.postedDate,
  sourceName: "CareerOS sample data",
  sourceType: "Seed",
  verificationStatus: "Sample",
  dataNotes: "Sample planning record. Not a verified active vacancy.",
  eligibilityText: job.requirements.join(". "),
  salaryText: job.salaryText,
  sampleData: true,
  archived: false,
}));

const curated: Opportunity[] = [
  {
    id: "opportunity-product-hackathon",
    category: "Hackathon",
    title: "Student Product Build Weekend",
    organisationId: "atlassian",
    organisationName: "Atlassian",
    description: "Sample planning record for a collaborative student product challenge.",
    disciplineTags: ["Computer Science", "Product"],
    roleFamilyTags: ["Product", "Software Engineering"],
    skillTags: ["Product discovery", "React"],
    suitableProfileIds: [YUHAN_ID],
    country: "Australia",
    city: "Sydney",
    locationText: "Sydney, Australia",
    remoteType: "Hybrid",
    deadline: "2026-10-08",
    sourceName: "CareerOS sample data",
    sourceType: "Seed",
    verificationStatus: "Sample",
    dataNotes: "Illustrative only; no live event is claimed.",
    eligibilityText: "Confirm any real event eligibility with the organiser.",
    sampleData: true,
    archived: false,
  },
  {
    id: "opportunity-clinical-networking",
    category: "Networking event",
    title: "Early-career Allied Health Networking Evening",
    organisationId: "sports-rehab",
    organisationName: "Sydney Sports & Rehab Clinic (Sample)",
    description: "Sample networking record for planning professional outreach.",
    disciplineTags: ["Chiropractic", "Allied health"],
    roleFamilyTags: ["Chiropractic", "Clinical Healthcare"],
    skillTags: ["Patient communication"],
    suitableProfileIds: [TOMMY_ID],
    country: "Australia",
    city: "Sydney",
    locationText: "Sydney, Australia",
    remoteType: "On-site",
    deadline: "2026-09-18",
    sourceName: "CareerOS sample data",
    sourceType: "Seed",
    verificationStatus: "Sample",
    dataNotes: "Illustrative only; no live event is claimed.",
    eligibilityText: "Confirm any real event details with the organiser.",
    sampleData: true,
    archived: false,
  },
  {
    id: "opportunity-registration-planning",
    category: "Professional registration",
    title: "Chiropractic Registration Preparation",
    organisationId: "harbour-clinic",
    organisationName: "Harbour Chiropractic Clinic (Sample)",
    description: "A sample planning prompt to research current professional registration pathways.",
    disciplineTags: ["Chiropractic"],
    roleFamilyTags: ["Chiropractic"],
    skillTags: [],
    suitableProfileIds: [TOMMY_ID],
    country: "Australia",
    city: "Sydney",
    locationText: "Australia",
    remoteType: "Remote",
    sourceName: "CareerOS sample data",
    sourceType: "Seed",
    verificationStatus: "Sample",
    dataNotes: "CareerOS does not state registration requirements. Consult the relevant regulator.",
    eligibilityText: "Unknown; verify with the relevant official regulator.",
    sampleData: true,
    archived: false,
  },
];

export const opportunities: Opportunity[] = [...jobOpportunities, ...curated];

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

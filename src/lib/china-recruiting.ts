import type {
  ChinaCampusOpportunity,
  ChinaOpportunityCategory,
  ChinaRecruitingPriority,
  ChinaRecruitingStatus,
  ChinaResumeVersion,
  ChinaSourceType,
  DeadlineUrgency,
  ChinaRecruitingBatch,
  ChinaRoleFamily,
  OpportunityLifecycle,
  JobApplication,
} from "@/types/domain";
import { initialStatusHistory } from "@/lib/application-status";

export function createChinaApplicationRecord(
  opportunity: ChinaCampusOpportunity,
  timestamp = new Date().toISOString(),
): JobApplication {
  return {
    id: `application-china-${opportunity.id}`,
    profileId: opportunity.profileId,
    jobId: `china:${opportunity.id}`,
    organisationName: opportunity.company,
    jobTitle: opportunity.position,
    status: "Preparing",
    source: "Company Website",
    savedAt: timestamp,
    appliedAt: "",
    nextAction: "Review the official role and prepare application materials",
    nextActionDate: opportunity.deadline ?? "",
    cvVersion: opportunity.resumeVersion,
    notes: opportunity.notes,
    lastUpdatedAt: timestamp,
    activity: [
      {
        id: `activity-${opportunity.id}`,
        type: "created",
        label: "China opportunity added to application pipeline",
        occurredAt: timestamp,
      },
    ],
    statusHistory: initialStatusHistory("Preparing", timestamp, `Created from ${opportunity.company} campus opportunity.`),
    sourceSnapshot: {
      location: opportunity.location,
      officialUrl: opportunity.officialApplyLink,
      deadline: opportunity.deadline,
      recruitingBatch: opportunity.recruitingBatch,
      title: opportunity.position,
      company: opportunity.company,
      capturedAt: timestamp,
    },
    materials: [
      {
        id: `material-resume-${opportunity.id}`,
        label: opportunity.resumeVersion,
        status: "Missing",
        notes: "Readiness must be confirmed by the user.",
      },
    ],
    sessions: [],
  };
}

export interface ChinaOpportunityImportInput {
  id?: string;
  company: string;
  position: string;
  category: ChinaOpportunityCategory;
  location: string;
  country?: "China";
  hiringSeason: string;
  recruitingBatch?: ChinaRecruitingBatch;
  targetGraduationYear?: string | null;
  roleFamily?: ChinaRoleFamily;
  businessUnit?: string | null;
  officialApplyLink: string;
  officialCareersLink?: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: ChinaSourceType;
  lastVerifiedAt?: string;
  verificationStatus?: OpportunityLifecycle;
  verificationConfidence?: "High" | "Medium" | "Low";
  publishedDate?: string | null;
  openDate?: string | null;
  deadline?: string | null;
  resumeVersion: ChinaResumeVersion;
  status: ChinaRecruitingStatus;
  priority: ChinaRecruitingPriority;
  fitScore: number;
  notes?: string;
}

export interface ChinaImportResult {
  records: ChinaCampusOpportunity[];
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

const categories = new Set<ChinaOpportunityCategory>([
  "Backend",
  "Software Engineering",
  "AI",
  "AI Product",
  "Product",
  "Data",
  "Other",
]);
const statuses = new Set<ChinaRecruitingStatus>([
  "Wishlist",
  "To Apply",
  "Applied",
  "OA",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
  "Archived",
]);
const priorities = new Set<ChinaRecruitingPriority>(["P1", "P2", "P3"]);
const resumes = new Set<ChinaResumeVersion>([
  "Chinese",
  "English",
  "Both",
  "中文产品简历",
  "中文技术简历",
  "英文产品简历",
  "英文技术简历",
  "通用校招简历",
]);
const sourceTypes = new Set<ChinaSourceType>([
  "Official",
  "Aggregator",
  "Community",
  "Manual",
]);
export const CHINA_ACTIVE_FRESHNESS_DAYS = 3;

function daysSince(date: string, today: string): number {
  return Math.floor(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) /
      86_400_000,
  );
}

export function isStrictVerifiedOpen(
  record: ChinaCampusOpportunity,
  today: string,
): boolean {
  return (
    record.sampleData === false &&
    record.sourceType === "Official" &&
    record.status !== "Archived" &&
    ["Open", "Closing soon"].includes(record.verificationStatus) &&
    record.lifecycleStatus === record.verificationStatus &&
    record.verificationMethod === "Position page application action" &&
    Boolean(record.checkedAt) &&
    daysSince(record.lastVerifiedAt, today) >= 0 &&
    daysSince(record.lastVerifiedAt, today) <= CHINA_ACTIVE_FRESHNESS_DAYS &&
    record.officialApplyLink === record.sourceUrl &&
    record.officialApplyLink !== record.officialCareersLink &&
    new URL(record.officialApplyLink).pathname.split("/").filter(Boolean)
      .length >= 2 &&
    deriveDeadlineUrgency(record.deadline, today) !== "Expired"
  );
}

function validHttps(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function validDate(value: string | null | undefined): boolean {
  return (
    value == null ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T00:00:00`)))
  );
}

export function deriveDeadlineUrgency(
  deadline: string | null,
  today: string,
): DeadlineUrgency {
  if (!deadline) return "Not published";
  const days = Math.ceil(
    (Date.parse(`${deadline}T00:00:00`) - Date.parse(`${today}T00:00:00`)) /
      86_400_000,
  );
  if (days < 0) return "Expired";
  if (days <= 7) return "Closing in 7 days";
  if (days <= 14) return "Closing in 14 days";
  return "Open";
}

export function recommendationScore(
  record: ChinaCampusOpportunity,
  today: string,
): number {
  if (!isStrictVerifiedOpen(record, today)) return -1;
  if (
    [
      "Applied",
      "OA",
      "Interview",
      "Offer",
      "Rejected",
      "Withdrawn",
      "Archived",
    ].includes(record.status)
  )
    return -1;
  const urgency = deriveDeadlineUrgency(record.deadline, today);
  if (urgency === "Expired") return -1;
  return (
    record.fitScore +
    { P1: 30, P2: 15, P3: 5 }[record.priority] +
    (urgency === "Closing in 7 days"
      ? 25
      : urgency === "Closing in 14 days"
        ? 15
        : 0) +
    (record.status === "To Apply" ? 15 : 5) +
    (record.sourceType === "Official" ? 5 : 0)
  );
}

export interface ChinaPriorityBreakdown {
  score: number;
  openStatus: number;
  deadlineUrgency: number;
  roleRelevance: number;
  cityPreference: number;
  graduationCompatibility: number;
  applicationReadiness: number;
  officialLink: number;
}

export function calculateChinaPriority(
  record: ChinaCampusOpportunity,
): ChinaPriorityBreakdown {
  const openStatus =
    record.verificationStatus === "Open"
      ? 25
      : record.verificationStatus === "Closing soon"
        ? 22
        : record.verificationStatus === "Upcoming"
          ? 10
          : 0;
  const deadlineUrgency =
    record.deadlineUrgency === "Closing in 7 days"
      ? 15
      : record.deadlineUrgency === "Closing in 14 days"
        ? 8
        : 0;
  const roleRelevance = [
    "Product",
    "AI Product",
    "Technical Product",
    "Software Engineering",
  ].includes(record.roleFamily)
    ? 20
    : 10;
  const cityPreference = [
    "Shanghai",
    "Beijing",
    "Shenzhen",
    "Hangzhou",
  ].includes(record.location)
    ? 10
    : 5;
  const graduationCompatibility = record.targetGraduationYear ? 8 : 0;
  const applicationReadiness =
    record.status === "To Apply" ? 12 : record.status === "Wishlist" ? 5 : 0;
  const officialLink =
    record.sourceType === "Official" && validHttps(record.officialApplyLink)
      ? 10
      : 0;
  return {
    score:
      openStatus +
      deadlineUrgency +
      roleRelevance +
      cityPreference +
      graduationCompatibility +
      applicationReadiness +
      officialLink,
    openStatus,
    deadlineUrgency,
    roleRelevance,
    cityPreference,
    graduationCompatibility,
    applicationReadiness,
    officialLink,
  };
}

export function selectTodayRecommendations(
  records: ChinaCampusOpportunity[],
  today: string,
  limit = 5,
): ChinaCampusOpportunity[] {
  const ranked = records
    .map((record) => ({ record, score: recommendationScore(record, today) }))
    .filter((item) => item.score >= 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.record.fitScore - a.record.fitScore ||
        (a.record.deadline ?? "9999").localeCompare(
          b.record.deadline ?? "9999",
        ),
    )
    .map((item) => item.record);
  const selected: ChinaCampusOpportunity[] = [];
  const selectedKeys = new Set<string>();
  for (const record of ranked) {
    const key = duplicateKey(record);
    if (selectedKeys.has(key)) continue;
    const sameCompany = selected.filter(
      (item) => item.company === record.company,
    );
    if (
      sameCompany.length > 0 &&
      sameCompany.some((item) => item.roleFamily === record.roleFamily)
    )
      continue;
    selected.push(record);
    selectedKeys.add(key);
    if (selected.length >= Math.max(3, Math.min(5, limit))) break;
  }
  return selected;
}

export function activeChinaOpportunities(
  records: ChinaCampusOpportunity[],
  today: string,
): ChinaCampusOpportunity[] {
  return records.filter((record) => isStrictVerifiedOpen(record, today));
}

export function chinaPipelineMetrics(
  records: ChinaCampusOpportunity[],
  today: string,
) {
  const active = activeChinaOpportunities(records, today);
  const count = (status: ChinaRecruitingStatus) =>
    active.filter((record) => record.status === status).length;
  return {
    toApply: count("To Apply"),
    applied: count("Applied"),
    oa: count("OA"),
    interview: count("Interview"),
    offer: count("Offer"),
    rejected: count("Rejected"),
    closingIn7Days: active.filter(
      (record) =>
        deriveDeadlineUrgency(record.deadline, today) === "Closing in 7 days",
    ).length,
  };
}

function validateImport(
  value: unknown,
  index: number,
): value is ChinaOpportunityImportInput {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.company === "string" &&
    Boolean(item.company.trim()) &&
    typeof item.position === "string" &&
    Boolean(item.position.trim()) &&
    categories.has(item.category as ChinaOpportunityCategory) &&
    typeof item.location === "string" &&
    Boolean(item.location.trim()) &&
    (item.country === undefined || item.country === "China") &&
    typeof item.hiringSeason === "string" &&
    Boolean(item.hiringSeason.trim()) &&
    typeof item.officialApplyLink === "string" &&
    validHttps(item.officialApplyLink) &&
    typeof item.sourceName === "string" &&
    Boolean(item.sourceName.trim()) &&
    typeof item.sourceUrl === "string" &&
    validHttps(item.sourceUrl) &&
    sourceTypes.has(item.sourceType as ChinaSourceType) &&
    validDate(item.openDate as string | null | undefined) &&
    validDate(item.deadline as string | null | undefined) &&
    resumes.has(item.resumeVersion as ChinaResumeVersion) &&
    statuses.has(item.status as ChinaRecruitingStatus) &&
    priorities.has(item.priority as ChinaRecruitingPriority) &&
    typeof item.fitScore === "number" &&
    item.fitScore >= 0 &&
    item.fitScore <= 100 &&
    Number.isFinite(index)
  );
}

function duplicateKey(
  item: Pick<
    ChinaCampusOpportunity,
    "company" | "position" | "officialApplyLink"
  >,
): string {
  return `${item.company.trim().toLowerCase()}|${item.position.trim().toLowerCase()}|${item.officialApplyLink.trim().toLowerCase()}`;
}

export function importChinaOpportunityJson(
  raw: string,
  existing: ChinaCampusOpportunity[],
  profileId: string,
  options: { forceStatus?: boolean; now?: string } = {},
): ChinaImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      records: existing,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: ["Invalid JSON."],
    };
  }
  const inputs = Array.isArray(parsed) ? parsed : [parsed];
  const errors: string[] = [];
  const valid = inputs.filter((item, index) => {
    const ok = validateImport(item, index);
    if (!ok)
      errors.push(
        `Record ${index + 1} is missing required fields or contains invalid values.`,
      );
    return ok;
  }) as ChinaOpportunityImportInput[];
  const timestamp = options.now ?? new Date().toISOString();
  const today = timestamp.slice(0, 10);
  const records = structuredClone(existing);
  let inserted = 0;
  let updated = 0;
  let skipped = errors.length;
  const importedKeys = new Set<string>();
  for (const input of valid) {
    const key = duplicateKey(input);
    if (importedKeys.has(key)) {
      skipped += 1;
      continue;
    }
    importedKeys.add(key);
    const existingIndex = records.findIndex(
      (record) => duplicateKey(record) === key,
    );
    if (existingIndex >= 0) {
      const current = records[existingIndex];
      records[existingIndex] = {
        ...current,
        deadline: input.deadline ?? null,
        openDate: input.openDate ?? current.openDate,
        sourceName: input.sourceName,
        sourceUrl: input.sourceUrl,
        sourceType: input.sourceType,
        lastVerifiedAt: input.lastVerifiedAt ?? today,
        verificationStatus:
          input.verificationStatus ?? current.verificationStatus,
        verificationConfidence:
          input.verificationConfidence ?? current.verificationConfidence,
        publishedDate: input.publishedDate ?? current.publishedDate,
        recruitingBatch: input.recruitingBatch ?? current.recruitingBatch,
        targetGraduationYear:
          input.targetGraduationYear ?? current.targetGraduationYear,
        roleFamily: input.roleFamily ?? current.roleFamily,
        businessUnit: input.businessUnit ?? current.businessUnit,
        officialCareersLink:
          input.officialCareersLink ?? current.officialCareersLink,
        fitScore: input.fitScore,
        priority: input.priority,
        resumeVersion: input.resumeVersion,
        notes: input.notes ?? current.notes,
        status: options.forceStatus ? input.status : current.status,
        deadlineUrgency: deriveDeadlineUrgency(input.deadline ?? null, today),
        updatedAt: timestamp,
      };
      updated += 1;
      continue;
    }
    records.push({
      id: input.id ?? `china-${crypto.randomUUID()}`,
      profileId,
      company: input.company.trim(),
      position: input.position.trim(),
      category: input.category,
      location: input.location.trim(),
      country: "China",
      hiringSeason: input.hiringSeason.trim(),
      recruitingBatch: input.recruitingBatch ?? "日常实习",
      targetGraduationYear: input.targetGraduationYear ?? null,
      roleFamily:
        input.roleFamily ??
        (input.category === "AI" ? "AI / ML" : input.category),
      businessUnit: input.businessUnit ?? null,
      officialApplyLink: input.officialApplyLink,
      sourceName: input.sourceName.trim(),
      sourceUrl: input.sourceUrl,
      officialCareersLink: input.officialCareersLink ?? input.sourceUrl,
      sourceType: input.sourceType,
      lastVerifiedAt: input.lastVerifiedAt ?? today,
      verificationStatus: input.verificationStatus ?? "Verification required",
      verificationConfidence: input.verificationConfidence ?? "Low",
      publishedDate: input.publishedDate ?? null,
      sampleData: false,
      openDate: input.openDate ?? null,
      deadline: input.deadline ?? null,
      resumeVersion: input.resumeVersion,
      status: input.status,
      priority: input.priority,
      fitScore: input.fitScore,
      deadlineUrgency: deriveDeadlineUrgency(input.deadline ?? null, today),
      notes: input.notes ?? "",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    inserted += 1;
  }
  return { records, inserted, updated, skipped, errors };
}

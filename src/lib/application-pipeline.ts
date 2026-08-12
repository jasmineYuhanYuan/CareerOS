import type { ApplicationStatus, JobApplication } from "@/types/domain";

const terminalStatuses = new Set<ApplicationStatus>([
  "Offer",
  "Rejected",
  "Withdrawn",
  "Archived",
]);
const submittedStatuses = new Set<ApplicationStatus>([
  "Applied",
  "OA invited",
  "OA completed",
  "Interview invited",
  "Interviewing",
  "Reference check",
  "Offer",
  "Rejected",
]);

export interface ApplicationAnalytics {
  submitted: number;
  awaitingResponse: number;
  interviews: number;
  offers: number;
  rejections: number;
  averageResponseDays: number | null;
}

export interface QuickApplicationInput {
  company: string;
  role: string;
  appliedDate: string;
  status: ApplicationStatus;
  sourceUrl?: string;
  sourceLabel?: string;
}

export function createQuickApplication(
  input: QuickApplicationInput,
  profileId: string,
  now = new Date().toISOString(),
): JobApplication {
  const company = input.company.trim();
  const role = input.role.trim();
  if (!company || !role) throw new Error("Company and role are required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.appliedDate))
    throw new Error("A valid application date is required.");
  if (input.sourceUrl && !/^https:\/\//i.test(input.sourceUrl))
    throw new Error("Source URL must use HTTPS.");
  const key = `${company}-${role}-${input.appliedDate}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  return {
    id: `quick-${key}`,
    profileId,
    jobId: `quick:${key}`,
    organisationName: company,
    jobTitle: role,
    status: input.status,
    savedAt: now,
    appliedAt: input.appliedDate,
    nextAction:
      input.status === "Applied" ? "Await response and monitor email" : "",
    nextActionDate: "",
    cvVersion: "",
    notes: input.sourceLabel ? `Source: ${input.sourceLabel}` : "",
    lastUpdatedAt: now,
    activity: [
      {
        id: `activity-${key}`,
        type: "created",
        label: "Application imported",
        occurredAt: now,
      },
    ],
    sourceSnapshot: input.sourceUrl
      ? {
          location: "",
          officialUrl: input.sourceUrl,
          deadline: null,
          recruitingBatch: "",
          title: role,
          company,
          capturedAt: now,
        }
      : undefined,
    materials: [],
    sessions: [],
  };
}

export function isDuplicateApplication(
  applications: JobApplication[],
  candidate: JobApplication,
): boolean {
  return applications.some(
    (item) =>
      item.organisationName.trim().toLowerCase() ===
        candidate.organisationName.trim().toLowerCase() &&
      item.jobTitle.trim().toLowerCase() ===
        candidate.jobTitle.trim().toLowerCase() &&
      item.appliedAt === candidate.appliedAt,
  );
}

export function isActiveApplication(status: ApplicationStatus): boolean {
  return !terminalStatuses.has(status);
}

export function applicationAnalytics(
  applications: JobApplication[],
): ApplicationAnalytics {
  const userRecords = applications.filter(
    (application) => !application.id.startsWith("demo-"),
  );
  const responseDurations = userRecords.flatMap((application) => {
    if (!application.appliedAt) return [];
    const response = application.activity.find(
      (event) =>
        event.type === "status_changed" &&
        /OA invited|Interview invited|Rejected|Offer/.test(event.label),
    );
    if (!response) return [];
    const days = Math.round(
      (Date.parse(response.occurredAt) -
        Date.parse(`${application.appliedAt}T00:00:00`)) /
        86_400_000,
    );
    return days >= 0 ? [days] : [];
  });
  return {
    submitted: userRecords.filter((application) =>
      submittedStatuses.has(application.status),
    ).length,
    awaitingResponse: userRecords.filter((application) =>
      ["Applied", "OA completed"].includes(application.status),
    ).length,
    interviews: userRecords.filter((application) =>
      ["Interview invited", "Interviewing", "Reference check"].includes(
        application.status,
      ),
    ).length,
    offers: userRecords.filter((application) => application.status === "Offer")
      .length,
    rejections: userRecords.filter(
      (application) => application.status === "Rejected",
    ).length,
    averageResponseDays:
      responseDurations.length >= 3
        ? Math.round(
            responseDurations.reduce((sum, days) => sum + days, 0) /
              responseDurations.length,
          )
        : null,
  };
}

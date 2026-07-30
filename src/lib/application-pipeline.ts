import type { ApplicationStatus, JobApplication } from "@/types/domain";

const terminalStatuses = new Set<ApplicationStatus>(["Offer", "Rejected", "Withdrawn", "Archived"]);
const submittedStatuses = new Set<ApplicationStatus>([
  "Applied", "OA invited", "OA completed", "Interview invited", "Interviewing",
  "Reference check", "Offer", "Rejected",
]);

export interface ApplicationAnalytics {
  submitted: number;
  awaitingResponse: number;
  interviews: number;
  offers: number;
  rejections: number;
  averageResponseDays: number | null;
}

export function isActiveApplication(status: ApplicationStatus): boolean {
  return !terminalStatuses.has(status);
}

export function applicationAnalytics(applications: JobApplication[]): ApplicationAnalytics {
  const userRecords = applications.filter((application) => !application.id.startsWith("demo-"));
  const responseDurations = userRecords.flatMap((application) => {
    if (!application.appliedAt) return [];
    const response = application.activity.find((event) =>
      event.type === "status_changed" && /OA invited|Interview invited|Rejected|Offer/.test(event.label),
    );
    if (!response) return [];
    const days = Math.round((Date.parse(response.occurredAt) - Date.parse(`${application.appliedAt}T00:00:00`)) / 86_400_000);
    return days >= 0 ? [days] : [];
  });
  return {
    submitted: userRecords.filter((application) => submittedStatuses.has(application.status)).length,
    awaitingResponse: userRecords.filter((application) => ["Applied", "OA completed"].includes(application.status)).length,
    interviews: userRecords.filter((application) => ["Interview invited", "Interviewing", "Reference check"].includes(application.status)).length,
    offers: userRecords.filter((application) => application.status === "Offer").length,
    rejections: userRecords.filter((application) => application.status === "Rejected").length,
    averageResponseDays: responseDurations.length >= 3
      ? Math.round(responseDurations.reduce((sum, days) => sum + days, 0) / responseDurations.length)
      : null,
  };
}

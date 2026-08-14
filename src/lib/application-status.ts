import type { ApplicationStatus, ApplicationStatusEvent } from "@/types/domain";
import type { JobApplication } from "@/types/domain";

export const applicationStatuses: ApplicationStatus[] = [
  "Interested", "Researching", "Preparing", "Ready to Apply",
  "Applied", "Resume Screening", "Resume Passed",
  "Assessment In Progress", "Assessment Invitation Received", "Assessment Scheduled", "Assessment Completed",
  "Interview Pending", "Interview Invitation", "Interview 1", "Interview 2", "Final Interview",
  "Background Check", "Reference Check",
  "Offer Received", "Offer Accepted", "Offer Declined",
  "Rejected", "Withdrawn", "Archived",
];

const legacyStatusMap: Record<string, ApplicationStatus> = {
  Saved: "Interested",
  "Ready to apply": "Ready to Apply",
  Assessment: "Assessment Invitation Received",
  "Assessment Invitation": "Assessment Invitation Received",
  "OA invited": "Assessment Invitation Received",
  OA: "Assessment In Progress",
  "OA completed": "Assessment Completed",
  Interview: "Interview 1",
  "Interview invited": "Interview Invitation",
  Interviewing: "Interview 1",
  "Reference check": "Reference Check",
  Offer: "Offer Received",
  Wishlist: "Interested",
  "To Apply": "Ready to Apply",
};

export function normaliseApplicationStatus(value: string): ApplicationStatus {
  if (applicationStatuses.includes(value as ApplicationStatus)) return value as ApplicationStatus;
  return legacyStatusMap[value] ?? "Interested";
}

export function suggestedNextAction(status: ApplicationStatus): string {
  if (status === "Assessment In Progress") return "Check email for assessment invitation.";
  if (status === "Interview Pending") return "Prepare interview.";
  if (status === "Resume Screening") return "Wait for recruiter update.";
  if (status === "Assessment Invitation Received") return "Open the invitation and confirm the assessment deadline.";
  if (status === "Assessment Scheduled") return "Prepare for the scheduled assessment.";
  if (status === "Interview Invitation") return "Confirm the interview time and prepare.";
  if (["Interview 1", "Interview 2", "Final Interview"].includes(status)) return "Prepare examples and questions for the next interview.";
  if (["Background Check", "Reference Check"].includes(status)) return "Prepare requested verification details.";
  if (status === "Offer Received") return "Review the offer and response deadline.";
  if (status === "Applied") return "Monitor email and the application portal.";
  return "";
}

export type ApplicationStatusTone = "neutral" | "active" | "positive" | "warning" | "danger" | "purple" | "orange";

export function applicationStatusTone(status: ApplicationStatus): ApplicationStatusTone {
  if (["Rejected"].includes(status)) return "danger";
  if (["Interested", "Researching", "Withdrawn", "Archived", "Offer Declined"].includes(status)) return "neutral";
  if (["Preparing", "Ready to Apply", "Applied", "Assessment Invitation Received", "Assessment Scheduled"].includes(status)) return "active";
  if (["Resume Screening", "Assessment In Progress", "Interview Pending"].includes(status)) return "warning";
  if (["Resume Passed", "Assessment Completed", "Offer Received", "Offer Accepted"].includes(status)) return "positive";
  if (["Interview Invitation", "Interview 1", "Interview 2", "Final Interview"].includes(status)) return "purple";
  return "orange";
}

export function initialStatusHistory(status: ApplicationStatus, timestamp: string, notes = ""): ApplicationStatusEvent[] {
  return [{ id: `status-${timestamp}-${status.replace(/\s+/g, "-").toLowerCase()}`, status, timestamp, notes }];
}

export function ensureStatusHistory(application: JobApplication, timestamp = application.lastUpdatedAt || new Date().toISOString()): JobApplication {
  if (application.statusHistory?.length) return application;
  return { ...application, statusHistory: initialStatusHistory(application.status, timestamp, application.notes) };
}

export function recordStatusTransition(previous: JobApplication, next: JobApplication, timestamp: string): JobApplication {
  const base = ensureStatusHistory(previous);
  if (previous.status === next.status) return { ...next, statusHistory: base.statusHistory };
  return {
    ...next,
    nextAction: next.nextAction === previous.nextAction || !next.nextAction ? suggestedNextAction(next.status) : next.nextAction,
    statusHistory: [...base.statusHistory, { id: `status-${Date.now()}-${next.status.replace(/\s+/g, "-").toLowerCase()}`, status: next.status, timestamp, notes: next.notes }],
  };
}

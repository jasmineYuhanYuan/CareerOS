export type StudyLevel = "Undergraduate" | "Postgraduate";

export interface CareerProfile {
  id: string;
  displayName: string;
  university: string;
  degree: string;
  discipline: string;
  studyLevel: StudyLevel;
  location: string;
  careerGoals: readonly string[];
  projects: readonly string[];
}

export type ApplicationStatus =
  | "Saved"
  | "Preparing"
  | "Applied"
  | "Assessment"
  | "Interview"
  | "Offer";

export interface ApplicationSummaryItem {
  status: ApplicationStatus;
  count: number;
}

export interface Deadline {
  id: string;
  title: string;
  organisation: string;
  dateLabel: string;
  dateTime: string;
  category: "Job" | "Postgraduate" | "Task";
}

export interface NextAction {
  id: string;
  title: string;
  detail: string;
  dueLabel: string;
  tone: "green" | "orange" | "gold";
}

export interface ProfileDashboardData {
  applicationSummary: readonly ApplicationSummaryItem[];
  deadlines: readonly Deadline[];
  nextActions: readonly NextAction[];
}

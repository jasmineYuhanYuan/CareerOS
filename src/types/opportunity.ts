export type DailyOpportunityStatus =
  "active" | "upcoming" | "closingSoon" | "closed" | "archived" | "prospect";
export type RecommendedAction =
  "applyNow" | "applySoon" | "monitor" | "lowPriority" | "skip";
export type DataFreshness = "fresh" | "reviewSoon" | "stale";

export interface DailyOpportunity {
  id: string;
  profileScope: string[];
  company: string;
  roleTitle: string;
  location: string;
  country: string;
  employmentType: string;
  graduateYear: string | null;
  applicationStatus: DailyOpportunityStatus;
  sourceUrl: string;
  sourceType: string;
  dateVerified: string;
  dateOpened: string | null;
  deadline: string | null;
  salary: string | null;
  visaRequirement: string | null;
  sponsorship: string | null;
  matchScore: number;
  matchReasons: string[];
  recommendedAction: RecommendedAction;
  notes: string;
  sourceEvidence: string;
  dataFreshness: DataFreshness;
}

export interface DailyCareerAction {
  id: string;
  type: "apply" | "closing" | "resume" | "followUp" | "monitor";
  label: string;
  count: number;
  href: string;
}

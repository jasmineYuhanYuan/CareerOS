import type { ChinaCampusOpportunity, ChinaInterviewIntelligence } from "@/types/domain";

export interface ReviewQueueItem {
  id: string;
  label: string;
  nextReviewDate: string;
  overdue: boolean;
  cadence: "Daily" | "3–7 days" | "Weekly" | "14 days" | "90 days";
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function opportunityReviewDate(record: ChinaCampusOpportunity): { date: string; cadence: ReviewQueueItem["cadence"] } {
  if (record.verificationStatus === "Closing soon") return { date: addDays(record.lastVerifiedAt, 1), cadence: "Daily" };
  if (record.verificationStatus === "Upcoming") return { date: addDays(record.lastVerifiedAt, 7), cadence: "Weekly" };
  return { date: record.nextReviewDate ?? addDays(record.lastVerifiedAt, 5), cadence: "3–7 days" };
}

export function buildChinaReviewQueue(opportunities: ChinaCampusOpportunity[], interviews: ChinaInterviewIntelligence[], today: string): ReviewQueueItem[] {
  const jobs = opportunities.map((record) => {
    const review = opportunityReviewDate(record);
    return { id: record.id, label: `${record.company} · ${record.position}`, nextReviewDate: review.date, overdue: review.date < today, cadence: review.cadence };
  });
  const historical = interviews.map((record) => {
    const date = addDays(record.lastVerifiedAt, 90);
    return { id: record.id, label: `${record.company} interview intelligence`, nextReviewDate: date, overdue: date < today, cadence: "90 days" as const };
  });
  return [...jobs, ...historical].sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
}

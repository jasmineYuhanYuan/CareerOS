import type { VerifiedCareerOpportunity } from "@/data/verified/types";
import type { Opportunity, OpportunityLifecycle } from "@/types/domain";

type LifecycleInput = Pick<VerifiedCareerOpportunity, "applicationStage" | "deadline" | "verificationStatus">
  | Pick<Opportunity, "verificationStatus" | "deadline" | "archived" | "applicationStage">;

function daysBetween(from: string, to: string): number {
  return Math.ceil((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86_400_000);
}

export function deriveOpportunityLifecycle(
  opportunity: LifecycleInput,
  referenceDate = new Date().toISOString().slice(0, 10),
): OpportunityLifecycle {
  if ("archived" in opportunity && opportunity.archived) return "Archived";
  if (opportunity.verificationStatus === "Archived") return "Archived";
  if (opportunity.verificationStatus === "Expired") return "Expired";

  const stage = opportunity.applicationStage?.toLowerCase() ?? "";
  if (stage === "closed") return "Closed";
  if (stage === "upcoming") return "Upcoming";
  if (!opportunity.deadline) {
    return stage === "open" || stage === "accepting applications"
      ? "Open"
      : "Verification required";
  }

  const remaining = daysBetween(referenceDate, opportunity.deadline);
  if (remaining < 0) return "Expired";
  if (remaining <= 14) return "Closing soon";
  return "Open";
}

export function materialIsReady(status: string): boolean {
  return status === "Ready" || status === "Submitted" || status === "Not applicable";
}

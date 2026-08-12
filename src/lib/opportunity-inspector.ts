import type { ChinaCampusOpportunity, OpportunityLifecycle } from "@/types/domain";

export type InspectionEvidence =
  | "application-action"
  | "closure-message"
  | "expired-deadline"
  | "page-unavailable"
  | "inconclusive";

export interface OpportunityInspection {
  opportunityId: string;
  previousStatus: OpportunityLifecycle;
  observedStatus: OpportunityLifecycle;
  evidence: InspectionEvidence;
  evidenceText: string;
  checkedAt: string;
  sourceUrl: string;
  httpStatus: number | null;
}

export interface OpportunityStatusOverride {
  opportunityId: string;
  lifecycleStatus: OpportunityLifecycle;
  verificationStatus: OpportunityLifecycle;
  verificationMethod: string;
  lastVerifiedAt: string;
  checkedAt: string;
  sourceUrl: string;
}

export function applyOpportunityStatusOverrides(
  records: ChinaCampusOpportunity[],
  overrides: OpportunityStatusOverride[],
): ChinaCampusOpportunity[] {
  const byId = new Map(overrides.map((override) => [override.opportunityId, override]));
  return records.map((record) => {
    const override = byId.get(record.id);
    if (!override || override.sourceUrl !== record.sourceUrl) return record;
    const mustArchive = ["Closed", "Expired", "Archived"].includes(
      override.lifecycleStatus,
    );
    return {
      ...record,
      lifecycleStatus: override.lifecycleStatus,
      verificationStatus: override.verificationStatus,
      verificationMethod: override.verificationMethod,
      lastVerifiedAt: override.lastVerifiedAt,
      checkedAt: override.checkedAt,
      status: mustArchive ? "Archived" : record.status,
    };
  });
}

const CLOSED_SIGNALS = [
  "职位已关闭",
  "岗位已关闭",
  "暂无投递",
  "position has been filled",
  "position is no longer available",
  "job is no longer available",
  "applications are closed",
];

const APPLY_SIGNALS = [
  "立即投递",
  "申请职位",
  "投递简历",
  "apply now",
  "apply for this job",
  "submit application",
];

function containsSignal(content: string, signals: string[]): string | null {
  const normalised = content.toLocaleLowerCase();
  return signals.find((signal) => normalised.includes(signal.toLocaleLowerCase())) ?? null;
}

export function classifyOpportunityPage(
  opportunity: ChinaCampusOpportunity,
  response: { ok: boolean; status: number; body: string },
  checkedAt = new Date().toISOString(),
): OpportunityInspection {
  const previousStatus = opportunity.lifecycleStatus ?? opportunity.verificationStatus;
  const today = checkedAt.slice(0, 10);
  if (opportunity.deadline && opportunity.deadline < today) {
    return {
      opportunityId: opportunity.id,
      previousStatus,
      observedStatus: "Expired",
      evidence: "expired-deadline",
      evidenceText: `Published deadline ${opportunity.deadline} has passed.`,
      checkedAt,
      sourceUrl: opportunity.sourceUrl,
      httpStatus: response.status,
    };
  }

  if (!response.ok) {
    return {
      opportunityId: opportunity.id,
      previousStatus,
      observedStatus: "Verification required",
      evidence: "page-unavailable",
      evidenceText: `Official page returned HTTP ${response.status}; closure was not inferred.`,
      checkedAt,
      sourceUrl: opportunity.sourceUrl,
      httpStatus: response.status,
    };
  }

  const closedSignal = containsSignal(response.body, CLOSED_SIGNALS);
  if (closedSignal) {
    return {
      opportunityId: opportunity.id,
      previousStatus,
      observedStatus: "Closed",
      evidence: "closure-message",
      evidenceText: `Official position page contained closure signal: ${closedSignal}`,
      checkedAt,
      sourceUrl: opportunity.sourceUrl,
      httpStatus: response.status,
    };
  }

  const applySignal = containsSignal(response.body, APPLY_SIGNALS);
  if (applySignal) {
    return {
      opportunityId: opportunity.id,
      previousStatus,
      observedStatus: "Open",
      evidence: "application-action",
      evidenceText: `Official position page contained application action: ${applySignal}`,
      checkedAt,
      sourceUrl: opportunity.sourceUrl,
      httpStatus: response.status,
    };
  }

  return {
    opportunityId: opportunity.id,
    previousStatus,
    observedStatus: "Verification required",
    evidence: "inconclusive",
    evidenceText: "Official page was reachable, but no application or closure signal was found.",
    checkedAt,
    sourceUrl: opportunity.sourceUrl,
    httpStatus: response.status,
  };
}

export async function inspectOpportunity(
  opportunity: ChinaCampusOpportunity,
  fetcher: typeof fetch = fetch,
): Promise<OpportunityInspection> {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetcher(opportunity.sourceUrl, {
      headers: {
        "user-agent": "CareerOS-Opportunity-Audit/1.0 (+https://career-os-azure.vercel.app)",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });
    return classifyOpportunityPage(
      opportunity,
      { ok: response.ok, status: response.status, body: await response.text() },
      checkedAt,
    );
  } catch (error) {
    return {
      opportunityId: opportunity.id,
      previousStatus: opportunity.lifecycleStatus ?? opportunity.verificationStatus,
      observedStatus: "Verification required",
      evidence: "page-unavailable",
      evidenceText: error instanceof Error ? error.message : "Official page request failed.",
      checkedAt,
      sourceUrl: opportunity.sourceUrl,
      httpStatus: null,
    };
  }
}

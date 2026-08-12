import { describe, expect, it } from "vitest";
import { verifiedChinaCampusOpportunities } from "@/data/china-recruiting/verified-opportunities";
import {
  applyOpportunityStatusOverrides,
  classifyOpportunityPage,
} from "@/lib/opportunity-inspector";

const opportunity = verifiedChinaCampusOpportunities[0];

describe("official opportunity inspection", () => {
  it("closes only when the official page supplies closure evidence", () => {
    const result = classifyOpportunityPage(
      opportunity,
      { ok: true, status: 200, body: "该职位已关闭，暂无投递" },
      "2026-08-12T10:00:00.000Z",
    );
    expect(result.observedStatus).toBe("Closed");
    expect(result.evidence).toBe("closure-message");
  });

  it("restores an opportunity only when an application action is visible", () => {
    const result = classifyOpportunityPage(
      opportunity,
      { ok: true, status: 200, body: "职位详情 立即投递" },
      "2026-08-12T10:00:00.000Z",
    );
    expect(result.observedStatus).toBe("Open");
    expect(result.evidence).toBe("application-action");
  });

  it("does not interpret an unavailable or ambiguous page as closed", () => {
    const unavailable = classifyOpportunityPage(
      opportunity,
      { ok: false, status: 403, body: "" },
      "2026-08-12T10:00:00.000Z",
    );
    const ambiguous = classifyOpportunityPage(
      opportunity,
      { ok: true, status: 200, body: "职位详情" },
      "2026-08-12T10:00:00.000Z",
    );
    expect(unavailable.observedStatus).toBe("Verification required");
    expect(ambiguous.observedStatus).toBe("Verification required");
  });

  it("archives a closed role without changing a reopened role's user workflow", () => {
    const closed = applyOpportunityStatusOverrides([opportunity], [{
      opportunityId: opportunity.id,
      lifecycleStatus: "Closed",
      verificationStatus: "Closed",
      verificationMethod: "Official closure message",
      lastVerifiedAt: "2026-08-12",
      checkedAt: "2026-08-12T10:00:00.000Z",
      sourceUrl: opportunity.sourceUrl,
    }]);
    const reopened = applyOpportunityStatusOverrides(
      [{ ...opportunity, status: "Applied" }],
      [{
        opportunityId: opportunity.id,
        lifecycleStatus: "Open",
        verificationStatus: "Open",
        verificationMethod: "Official application action",
        lastVerifiedAt: "2026-08-12",
        checkedAt: "2026-08-12T10:00:00.000Z",
        sourceUrl: opportunity.sourceUrl,
      }],
    );
    expect(closed[0].status).toBe("Archived");
    expect(reopened[0].status).toBe("Applied");
  });
});

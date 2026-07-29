import { describe, expect, it } from "vitest";
import { deriveOpportunityLifecycle, materialIsReady } from "./opportunity-lifecycle";

describe("verified opportunity lifecycle", () => {
  const base = {
    verificationStatus: "Verified" as const,
    applicationStage: "Open",
    deadline: null,
  };

  it("distinguishes open, upcoming, closing, closed, expired and archived records", () => {
    expect(deriveOpportunityLifecycle({ ...base, deadline: "2026-08-20" }, "2026-07-30")).toBe("Open");
    expect(deriveOpportunityLifecycle({ ...base, deadline: "2026-08-05" }, "2026-07-30")).toBe("Closing soon");
    expect(deriveOpportunityLifecycle({ ...base, applicationStage: "Upcoming" }, "2026-07-30")).toBe("Upcoming");
    expect(deriveOpportunityLifecycle({ ...base, applicationStage: "Closed" }, "2026-07-30")).toBe("Closed");
    expect(deriveOpportunityLifecycle({ ...base, deadline: "2026-07-01" }, "2026-07-30")).toBe("Expired");
    expect(deriveOpportunityLifecycle({ ...base, verificationStatus: "Archived" }, "2026-07-30")).toBe("Archived");
  });

  it("requires verification when an undated record is not explicitly open", () => {
    expect(deriveOpportunityLifecycle({ ...base, applicationStage: "Not published" }, "2026-07-30")).toBe("Verification required");
  });

  it("never treats a draft or review-needed material as ready", () => {
    expect(materialIsReady("Draft")).toBe(false);
    expect(materialIsReady("Review needed")).toBe(false);
    expect(materialIsReady("Ready")).toBe(true);
    expect(materialIsReady("Submitted")).toBe(true);
  });
});

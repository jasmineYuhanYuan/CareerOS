import { describe, expect, it } from "vitest";
import { applicationAnalytics, isActiveApplication } from "./application-pipeline";
import type { JobApplication } from "@/types/domain";

function application(id: string, status: JobApplication["status"]): JobApplication {
  return {
    id, profileId: "p", jobId: "j", organisationName: "Organisation", jobTitle: "Role",
    status, savedAt: "2026-07-01", appliedAt: status === "Interested" ? "" : "2026-07-02",
    nextAction: "", nextActionDate: "", cvVersion: "", notes: "", lastUpdatedAt: "2026-07-03",
    activity: [], materials: [], sessions: [],
  };
}

describe("application pipeline quality", () => {
  it("excludes archived and terminal records from active pipeline", () => {
    expect(isActiveApplication("Archived")).toBe(false);
    expect(isActiveApplication("Rejected")).toBe(false);
    expect(isActiveApplication("Applied")).toBe(true);
  });

  it("uses only user records and hides averages for tiny samples", () => {
    const result = applicationAnalytics([
      application("demo-seed", "Applied"),
      application("user-one", "Applied"),
      application("user-two", "Rejected"),
    ]);
    expect(result.submitted).toBe(2);
    expect(result.averageResponseDays).toBeNull();
  });
});

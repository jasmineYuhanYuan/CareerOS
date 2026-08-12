import { describe, expect, it } from "vitest";
import {
  applicationAnalytics,
  createQuickApplication,
  isActiveApplication,
  isDuplicateApplication,
} from "./application-pipeline";
import type { JobApplication } from "@/types/domain";

function application(
  id: string,
  status: JobApplication["status"],
): JobApplication {
  return {
    id,
    profileId: "p",
    jobId: "j",
    organisationName: "Organisation",
    jobTitle: "Role",
    status,
    savedAt: "2026-07-01",
    appliedAt: status === "Interested" ? "" : "2026-07-02",
    nextAction: "",
    nextActionDate: "",
    cvVersion: "",
    notes: "",
    lastUpdatedAt: "2026-07-03",
    activity: [],
    materials: [],
    sessions: [],
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

  it("creates a quick-import record with its official source snapshot", () => {
    const result = createQuickApplication(
      {
        company: "小红书",
        role: "软件开发工程师",
        appliedDate: "2026-08-12",
        status: "Applied",
        sourceUrl: "https://job.xiaohongshu.com/campus",
        sourceLabel: "官网",
      },
      "yuhan-yuan",
      "2026-08-12T10:00:00.000Z",
    );
    expect(result).toMatchObject({
      organisationName: "小红书",
      jobTitle: "软件开发工程师",
      appliedAt: "2026-08-12",
      status: "Applied",
    });
    expect(result.sourceSnapshot?.officialUrl).toBe(
      "https://job.xiaohongshu.com/campus",
    );
    expect(result.notes).toBe("Source: 官网");
  });

  it("detects a duplicate by company, role and application date", () => {
    const existing = application("one", "Applied");
    const duplicate = {
      ...application("two", "Applied"),
      organisationName: existing.organisationName,
      jobTitle: existing.jobTitle,
      appliedAt: existing.appliedAt,
    };
    expect(isDuplicateApplication([existing], duplicate)).toBe(true);
  });

  it("rejects non-HTTPS source links", () => {
    expect(() =>
      createQuickApplication(
        {
          company: "Company",
          role: "Role",
          appliedDate: "2026-08-12",
          status: "Applied",
          sourceUrl: "http://example.com",
        },
        "p",
      ),
    ).toThrow("HTTPS");
  });
});

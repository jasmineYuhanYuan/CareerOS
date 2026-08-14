import { describe, expect, it } from "vitest";
import { applicationStatuses, applicationStatusTone, initialStatusHistory, normaliseApplicationStatus, recordStatusTransition, suggestedNextAction } from "./application-status";
import type { JobApplication } from "@/types/domain";

function application(status: JobApplication["status"]): JobApplication {
  return { id: "a", profileId: "p", jobId: "j", organisationName: "小红书", jobTitle: "产品实习生", status, savedAt: "2026-08-14T00:00:00Z", appliedAt: "2026-08-14", nextAction: "", nextActionDate: "", cvVersion: "", notes: "No email or assessment link received.", lastUpdatedAt: "2026-08-14T00:00:00Z", activity: [], statusHistory: initialStatusHistory(status, "2026-08-14T00:00:00Z"), materials: [], sessions: [] };
}

describe("professional application statuses", () => {
  it("distinguishes entering an assessment flow from receiving an invitation", () => {
    expect(applicationStatuses).toContain("Assessment In Progress");
    expect(applicationStatuses).toContain("Assessment Invitation Received");
    expect(normaliseApplicationStatus("Assessment Invitation")).toBe("Assessment Invitation Received");
    expect(normaliseApplicationStatus("OA invited")).toBe("Assessment Invitation Received");
  });

  it("provides status-specific next actions", () => {
    expect(suggestedNextAction("Assessment In Progress")).toBe("Check email for assessment invitation.");
    expect(suggestedNextAction("Interview Pending")).toBe("Prepare interview.");
    expect(suggestedNextAction("Resume Screening")).toBe("Wait for recruiter update.");
  });

  it("appends timeline events with timestamp and notes instead of overwriting history", () => {
    const previous = application("Applied");
    const next = recordStatusTransition(previous, { ...previous, status: "Resume Screening" }, "2026-08-14T01:00:00Z");
    expect(next.statusHistory.map((event) => event.status)).toEqual(["Applied", "Resume Screening"]);
    expect(next.statusHistory[1]).toMatchObject({ timestamp: "2026-08-14T01:00:00Z", notes: "No email or assessment link received." });
  });

  it("uses the requested colour families", () => {
    expect(applicationStatusTone("Resume Screening")).toBe("warning");
    expect(applicationStatusTone("Interview 1")).toBe("purple");
    expect(applicationStatusTone("Background Check")).toBe("orange");
    expect(applicationStatusTone("Offer Received")).toBe("positive");
  });
});

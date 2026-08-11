import { describe, expect, it } from "vitest";
import { chinaTrackingTargets } from "@/data/china-recruiting/targets";
import { createSeedState, YUHAN_ID } from "@/data/seed";
import { applicationAnalytics } from "@/lib/application-pipeline";
import type { ChinaCampusOpportunity } from "@/types/domain";
import {
  activeChinaOpportunities,
  chinaPipelineMetrics,
  importChinaOpportunityJson,
  recommendationScore,
  selectTodayRecommendations,
} from "./china-recruiting";

const today = "2026-08-11";

function opportunity(overrides: Partial<ChinaCampusOpportunity> = {}): ChinaCampusOpportunity {
  return {
    id: "china-one", profileId: YUHAN_ID, company: "Verified Company", position: "Software Engineer",
    category: "Software Engineering", location: "Shanghai", country: "China", hiringSeason: "2027 秋招",
    officialApplyLink: "https://careers.example.org/jobs/one", sourceName: "Official careers",
    sourceUrl: "https://careers.example.org/jobs/one", sourceType: "Official", lastVerifiedAt: today,
    openDate: null, deadline: "2026-08-18", resumeVersion: "Chinese", status: "To Apply",
    priority: "P1", fitScore: 85, deadlineUrgency: "Closing in 7 days", notes: "",
    createdAt: `${today}T00:00:00.000Z`, updatedAt: `${today}T00:00:00.000Z`, ...overrides,
  };
}

const importPayload = {
  company: "Verified Company", position: "Software Engineer", category: "Software Engineering",
  location: "Shanghai", country: "China", hiringSeason: "2027 秋招",
  officialApplyLink: "https://careers.example.org/jobs/one", sourceName: "Official careers",
  sourceUrl: "https://careers.example.org/jobs/one", sourceType: "Official", deadline: "2026-08-18",
  resumeVersion: "Chinese", status: "To Apply", priority: "P1", fitScore: 85, notes: "",
};

describe("China campus recruiting", () => {
  it("does not affect Australia application metrics", () => {
    const workspace = createSeedState().profiles[YUHAN_ID];
    const before = applicationAnalytics(workspace.applications);
    workspace.chinaCampusOpportunities.push(opportunity());
    expect(applicationAnalytics(workspace.applications)).toEqual(before);
  });

  it("excludes archived China opportunities from active metrics", () => {
    const metrics = chinaPipelineMetrics([opportunity({ status: "Archived" })], today);
    expect(metrics.toApply).toBe(0);
    expect(activeChinaOpportunities([opportunity({ status: "Archived" })], today)).toEqual([]);
  });

  it("does not recommend applied opportunities", () => {
    expect(selectTodayRecommendations([opportunity({ status: "Applied" })], today)).toEqual([]);
  });

  it("does not recommend expired opportunities", () => {
    expect(selectTodayRecommendations([opportunity({ deadline: "2026-08-10" })], today)).toEqual([]);
  });

  it("boosts opportunities closing within seven days", () => {
    const urgent = recommendationScore(opportunity({ deadline: "2026-08-17" }), today);
    const later = recommendationScore(opportunity({ deadline: "2026-09-17" }), today);
    expect(urgent - later).toBe(25);
  });

  it("detects duplicate JSON imports and updates the existing record", () => {
    const result = importChinaOpportunityJson(JSON.stringify({ ...importPayload, deadline: "2026-08-20" }), [opportunity()], YUHAN_ID, { now: `${today}T10:00:00.000Z` });
    expect(result.inserted).toBe(0);
    expect(result.updated).toBe(1);
    expect(result.records).toHaveLength(1);
    expect(result.records[0].deadline).toBe("2026-08-20");
  });

  it("does not overwrite a user status unless forceStatus is explicit", () => {
    const current = opportunity({ status: "Interview" });
    const protectedResult = importChinaOpportunityJson(JSON.stringify(importPayload), [current], YUHAN_ID, { now: `${today}T10:00:00.000Z` });
    const forcedResult = importChinaOpportunityJson(JSON.stringify(importPayload), [current], YUHAN_ID, { forceStatus: true, now: `${today}T10:00:00.000Z` });
    expect(protectedResult.records[0].status).toBe("Interview");
    expect(forcedResult.records[0].status).toBe("To Apply");
  });

  it("preserves sourceType during import", () => {
    const result = importChinaOpportunityJson(JSON.stringify({ ...importPayload, sourceType: "Aggregator" }), [], YUHAN_ID, { now: `${today}T10:00:00.000Z` });
    expect(result.records[0].sourceType).toBe("Aggregator");
  });

  it("never counts tracking targets as active opportunities", () => {
    expect(chinaTrackingTargets).toHaveLength(23);
    expect(chinaPipelineMetrics([], today).toApply).toBe(0);
    expect(chinaTrackingTargets.every((target) => target.trackingOnly)).toBe(true);
  });

  it("calculates dashboard China scope from the unified active dataset", () => {
    const metrics = chinaPipelineMetrics([
      opportunity({ id: "to-apply", status: "To Apply" }),
      opportunity({ id: "applied", status: "Applied", deadline: null }),
      opportunity({ id: "oa", status: "OA", deadline: null }),
      opportunity({ id: "interview", status: "Interview", deadline: null }),
      opportunity({ id: "offer", status: "Offer", deadline: null }),
      opportunity({ id: "archived", status: "Archived" }),
    ], today);
    expect(metrics).toMatchObject({ toApply: 1, applied: 1, oa: 1, interview: 1, offer: 1, closingIn7Days: 1 });
  });
});

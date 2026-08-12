import { describe, expect, it } from "vitest";
import { chinaTrackingTargets } from "@/data/china-recruiting/targets";
import {
  chinaAssessmentIntelligence,
  chinaInterviewIntelligence,
} from "@/data/china-recruiting/intelligence";
import { verifiedChinaCampusOpportunities } from "@/data/china-recruiting/verified-opportunities";
import { createSeedState, YUHAN_ID } from "@/data/seed";
import { applicationAnalytics } from "@/lib/application-pipeline";
import {
  buildChinaReviewQueue,
  opportunityReviewDate,
} from "@/lib/data-freshness";
import type { ChinaCampusOpportunity } from "@/types/domain";
import {
  activeChinaOpportunities,
  calculateChinaPriority,
  chinaPipelineMetrics,
  createChinaApplicationRecord,
  importChinaOpportunityJson,
  recommendationScore,
  selectTodayRecommendations,
} from "./china-recruiting";

const today = "2026-08-11";

function opportunity(
  overrides: Partial<ChinaCampusOpportunity> = {},
): ChinaCampusOpportunity {
  return {
    id: "china-one",
    profileId: YUHAN_ID,
    company: "Verified Company",
    position: "Software Engineer",
    category: "Software Engineering",
    location: "Shanghai",
    country: "China",
    hiringSeason: "2027 秋招",
    recruitingBatch: "秋招",
    targetGraduationYear: "2027",
    roleFamily: "Software Engineering",
    businessUnit: null,
    officialApplyLink: "https://careers.example.org/jobs/one",
    sourceName: "Official careers",
    officialCareersLink: "https://careers.example.org",
    sourceUrl: "https://careers.example.org/jobs/one",
    sourceType: "Official",
    lastVerifiedAt: today,
    checkedAt: `${today}T00:00:00.000Z`,
    verificationMethod: "Position page application action",
    lifecycleStatus: "Open",
    closedReason: null,
    verificationStatus: "Open",
    verificationConfidence: "High",
    publishedDate: null,
    sampleData: false,
    openDate: null,
    deadline: "2026-08-18",
    resumeVersion: "Chinese",
    status: "To Apply",
    priority: "P1",
    fitScore: 85,
    deadlineUrgency: "Closing in 7 days",
    notes: "",
    createdAt: `${today}T00:00:00.000Z`,
    updatedAt: `${today}T00:00:00.000Z`,
    ...overrides,
  };
}

const importPayload = {
  company: "Verified Company",
  position: "Software Engineer",
  category: "Software Engineering",
  location: "Shanghai",
  country: "China",
  hiringSeason: "2027 秋招",
  officialApplyLink: "https://careers.example.org/jobs/one",
  sourceName: "Official careers",
  sourceUrl: "https://careers.example.org/jobs/one",
  sourceType: "Official",
  deadline: "2026-08-18",
  resumeVersion: "Chinese",
  status: "To Apply",
  priority: "P1",
  fitScore: 85,
  notes: "",
};

describe("China campus recruiting", () => {
  it("preserves every China record with explicit lifecycle evidence", () => {
    expect(verifiedChinaCampusOpportunities).toHaveLength(9);
    expect(
      verifiedChinaCampusOpportunities.every(
        (item) =>
          item.sourceType === "Official" &&
          item.sampleData === false &&
          item.officialApplyLink === item.sourceUrl &&
          Boolean(item.verificationMethod) &&
          Boolean(item.checkedAt),
      ),
    ).toBe(true);
  });

  it("keeps the confirmed closed RED product internship archived", () => {
    const closed = verifiedChinaCampusOpportunities.find(
      (item) => item.id === "xiaohongshu-product-intern-20983",
    );
    expect(closed).toMatchObject({
      verificationStatus: "Closed",
      lifecycleStatus: "Closed",
      status: "Archived",
    });
    expect(closed?.closedReason).toContain("已关闭");
    expect(selectTodayRecommendations([closed!], "2026-08-12")).toEqual([]);
  });

  it("excludes stale, verification-required and sample-like records", () => {
    expect(
      selectTodayRecommendations(
        [opportunity({ lastVerifiedAt: "2026-08-01" })],
        "2026-08-12",
      ),
    ).toEqual([]);
    expect(
      selectTodayRecommendations(
        [
          opportunity({
            verificationStatus: "Verification required",
            lifecycleStatus: "Verification required",
          }),
        ],
        today,
      ),
    ).toEqual([]);
    expect(
      selectTodayRecommendations(
        [opportunity({ verificationMethod: "HTTP 200 only" })],
        today,
      ),
    ).toEqual([]);
  });
  it("does not affect Australia application metrics", () => {
    const workspace = createSeedState().profiles[YUHAN_ID];
    const before = applicationAnalytics(workspace.applications);
    workspace.chinaCampusOpportunities.push(opportunity());
    expect(applicationAnalytics(workspace.applications)).toEqual(before);
  });

  it("excludes archived China opportunities from active metrics", () => {
    const metrics = chinaPipelineMetrics(
      [opportunity({ status: "Archived" })],
      today,
    );
    expect(metrics.toApply).toBe(0);
    expect(
      activeChinaOpportunities([opportunity({ status: "Archived" })], today),
    ).toEqual([]);
  });

  it("does not recommend applied opportunities", () => {
    expect(
      selectTodayRecommendations([opportunity({ status: "Applied" })], today),
    ).toEqual([]);
  });

  it("does not recommend expired opportunities", () => {
    expect(
      selectTodayRecommendations(
        [opportunity({ deadline: "2026-08-10" })],
        today,
      ),
    ).toEqual([]);
  });

  it("boosts opportunities closing within seven days", () => {
    const urgent = recommendationScore(
      opportunity({ deadline: "2026-08-17" }),
      today,
    );
    const later = recommendationScore(
      opportunity({ deadline: "2026-09-17" }),
      today,
    );
    expect(urgent - later).toBe(25);
  });

  it("detects duplicate JSON imports and updates the existing record", () => {
    const result = importChinaOpportunityJson(
      JSON.stringify({ ...importPayload, deadline: "2026-08-20" }),
      [opportunity()],
      YUHAN_ID,
      { now: `${today}T10:00:00.000Z` },
    );
    expect(result.inserted).toBe(0);
    expect(result.updated).toBe(1);
    expect(result.records).toHaveLength(1);
    expect(result.records[0].deadline).toBe("2026-08-20");
  });

  it("does not overwrite a user status unless forceStatus is explicit", () => {
    const current = opportunity({ status: "Interview" });
    const protectedResult = importChinaOpportunityJson(
      JSON.stringify(importPayload),
      [current],
      YUHAN_ID,
      { now: `${today}T10:00:00.000Z` },
    );
    const forcedResult = importChinaOpportunityJson(
      JSON.stringify(importPayload),
      [current],
      YUHAN_ID,
      { forceStatus: true, now: `${today}T10:00:00.000Z` },
    );
    expect(protectedResult.records[0].status).toBe("Interview");
    expect(forcedResult.records[0].status).toBe("To Apply");
  });

  it("preserves sourceType during import", () => {
    const result = importChinaOpportunityJson(
      JSON.stringify({ ...importPayload, sourceType: "Aggregator" }),
      [],
      YUHAN_ID,
      { now: `${today}T10:00:00.000Z` },
    );
    expect(result.records[0].sourceType).toBe("Aggregator");
  });

  it("never counts tracking targets as active opportunities", () => {
    expect(chinaTrackingTargets).toHaveLength(33);
    expect(chinaPipelineMetrics([], today).toApply).toBe(0);
    expect(chinaTrackingTargets.every((target) => target.trackingOnly)).toBe(
      true,
    );
  });

  it("requires a current lifecycle before recommending a role", () => {
    expect(
      selectTodayRecommendations(
        [opportunity({ verificationStatus: "Verification required" })],
        today,
      ),
    ).toEqual([]);
    expect(
      selectTodayRecommendations(
        [opportunity({ verificationStatus: "Closed" })],
        today,
      ),
    ).toEqual([]);
  });

  it("rejects active imports without an official HTTPS application link", () => {
    const result = importChinaOpportunityJson(
      JSON.stringify({ ...importPayload, officialApplyLink: "" }),
      [],
      YUHAN_ID,
    );
    expect(result.inserted).toBe(0);
    expect(result.errors).toHaveLength(1);
  });

  it("keeps Fit Score separate from the transparent priority score", () => {
    const record = opportunity({ fitScore: 63 });
    expect(record.fitScore).toBe(63);
    expect(calculateChinaPriority(record).score).not.toBe(record.fitScore);
  });

  it("persists the selected China résumé version without marking it ready", () => {
    const application = createChinaApplicationRecord(
      opportunity({ resumeVersion: "中文产品简历" }),
    );
    expect(application.cvVersion).toBe("中文产品简历");
    expect(application.materials?.[0].status).toBe("Missing");
  });

  it("preserves an immutable vacancy snapshot in the application record", () => {
    const record = opportunity({
      company: "Baidu / 百度",
      position: "AI产品实习生",
      location: "Beijing",
      recruitingBatch: "日常实习",
      deadline: null,
    });
    const application = createChinaApplicationRecord(
      record,
      `${today}T10:00:00.000Z`,
    );
    record.position = "Listing title changed later";
    record.location = "Shanghai";
    expect(application.sourceSnapshot).toMatchObject({
      company: "Baidu / 百度",
      title: "AI产品实习生",
      location: "Beijing",
      recruitingBatch: "日常实习",
      deadline: null,
      officialUrl: "https://careers.example.org/jobs/one",
    });
  });

  it("never invents a deadline for verified records", () => {
    expect(
      verifiedChinaCampusOpportunities.every((item) => item.deadline === null),
    ).toBe(true);
  });

  it("requires a job-specific official action URL for every current record", () => {
    expect(
      verifiedChinaCampusOpportunities.every(
        (item) =>
          item.officialApplyLink === item.sourceUrl &&
          /(\/jobs\/detail\/|\/campus\/position\/)/.test(
            item.officialApplyLink,
          ),
      ),
    ).toBe(true);
  });

  it("keeps verified records separate from sample data", () => {
    expect(
      verifiedChinaCampusOpportunities.some((item) => item.sampleData),
    ).toBe(false);
  });

  it("builds an operational review queue on the required cadence", () => {
    expect(
      opportunityReviewDate(opportunity({ verificationStatus: "Closing soon" }))
        .cadence,
    ).toBe("Daily");
    expect(
      opportunityReviewDate(opportunity({ verificationStatus: "Upcoming" }))
        .cadence,
    ).toBe("Weekly");
    expect(buildChinaReviewQueue([opportunity()], [], today)).toHaveLength(1);
  });

  it("keeps OA and interview provenance explicit", () => {
    expect(
      chinaAssessmentIntelligence.every(
        (item) =>
          item.sourceUrl.startsWith("https://") &&
          item.sourceType !== "Community",
      ),
    ).toBe(true);
    expect(
      chinaInterviewIntelligence.every(
        (item) =>
          item.sourceUrl.startsWith("https://") &&
          ["Official", "Community", "Unknown"].includes(item.sourceType),
      ),
    ).toBe(true);
  });

  it("calculates dashboard China scope from the unified active dataset", () => {
    const metrics = chinaPipelineMetrics(
      [
        opportunity({ id: "to-apply", status: "To Apply" }),
        opportunity({ id: "applied", status: "Applied", deadline: null }),
        opportunity({ id: "oa", status: "OA", deadline: null }),
        opportunity({ id: "interview", status: "Interview", deadline: null }),
        opportunity({ id: "offer", status: "Offer", deadline: null }),
        opportunity({ id: "archived", status: "Archived" }),
      ],
      today,
    );
    expect(metrics).toMatchObject({
      toApply: 1,
      applied: 1,
      oa: 1,
      interview: 1,
      offer: 1,
      closingIn7Days: 1,
    });
  });
});

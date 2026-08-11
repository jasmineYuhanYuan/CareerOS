import { describe, expect, it } from "vitest";
import { verifiedCareerOpportunities } from "@/data/verified/opportunities";
import { opportunities } from "@/data/opportunities";
import { TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { deriveOpportunityLifecycle } from "@/lib/opportunity-lifecycle";
import { realMarketCoverage } from "@/lib/market-coverage";

const today = "2026-08-11";

describe("verified Australia market", () => {
  it("contains only a job-specific official action as active", () => {
    const active = verifiedCareerOpportunities.filter(
      (item) =>
        item.country === "Australia" &&
        deriveOpportunityLifecycle(item, today) === "Open",
    );
    expect(active.map((item) => item.id)).toEqual([
      "amazon-au-sde-intern-3204846",
    ]);
    expect(active[0].officialApplyUrl).toBe(active[0].officialUrl);
  });

  it("keeps official future government cycles upcoming", () => {
    const upcoming = verifiedCareerOpportunities.filter(
      (item) =>
        item.country === "Australia" &&
        deriveOpportunityLifecycle(item, today) === "Upcoming",
    );
    expect(upcoming.map((item) => item.id)).toEqual([
      "agggp-2027-digital-stream",
      "agggp-2027-data-stream",
    ]);
    expect(upcoming.every((item) => item.openingDate === "2027-03-01")).toBe(
      true,
    );
  });

  it("preserves government citizenship and clearance requirements from official sources", () => {
    const government = verifiedCareerOpportunities.filter((item) =>
      item.id.startsWith("agggp-2027-"),
    );
    expect(
      government.every((item) =>
        item.eligibility.includes("Australian citizen"),
      ),
    ).toBe(true);
    expect(
      government.every((item) =>
        item.coreRequirements?.some((value) =>
          value.includes("security clearance"),
        ),
      ),
    ).toBe(true);
  });

  it("does not infer work rights or sponsorship for the Amazon vacancy", () => {
    const amazon = verifiedCareerOpportunities.find(
      (item) => item.id === "amazon-au-sde-intern-3204846",
    );
    expect(amazon?.visaSponsorship).toBeNull();
    expect(amazon?.visaStatement).toBeNull();
    expect(amazon?.eligibility.join(" ")).toContain("not stated");
  });

  it("normalises market records without leaking them into Tommy", () => {
    const amazon = opportunities.find(
      (item) => item.id === "opportunity-amazon-au-sde-intern-3204846",
    );
    expect(amazon?.suitableProfileIds).toContain(YUHAN_ID);
    expect(amazon?.suitableProfileIds).not.toContain(TOMMY_ID);
  });

  it("keeps Australia and China canonical statistics isolated", () => {
    const coverage = realMarketCoverage(today);
    expect(coverage.australia.active).toBe(1);
    expect(coverage.australia.upcoming).toBe(2);
    expect(coverage.china.active).toBe(9);
  });
});

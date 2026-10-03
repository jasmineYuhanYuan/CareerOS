import { describe, expect, it } from "vitest";
import { classifySourceFailure, discoverVacancyLinks, freshnessWindowDays, normalisedVacancyFingerprint, shouldAutoPause } from "./market-adapters";

describe("market source adapters", () => {
  const context = { sourceId: "official", sourceType: "employer", crawlStrategy: "listing", officialUrl: "https://careers.example.com/jobs" };

  it("rejects navigation links while discovering same-host vacancy links", () => {
    const html = '<a href="/software">Software</a><a href="/jobs/REQ-42">Graduate Software Engineer</a><a href="https://tracker.example.net/42">Software Engineer</a>';
    expect(discoverVacancyLinks(html, context)).toEqual([{ url: "https://careers.example.com/jobs/REQ-42", title: "Graduate Software Engineer", jobId: "REQ-42" }]);
  });

  it("discovers official JSON-LD JobPosting records with a stable job ID", () => {
    const html = '<script type="application/ld+json">{"@type":"JobPosting","title":"Frontend Engineer Intern","identifier":{"value":"AU-1234"},"url":"https://careers.example.com/jobs/AU-1234"}</script>';
    expect(discoverVacancyLinks(html, context)).toEqual([{ url: "https://careers.example.com/jobs/AU-1234", title: "Frontend Engineer Intern", jobId: "AU-1234" }]);
  });

  it("creates stable normalised fingerprints for duplicate opportunities", () => {
    const first = normalisedVacancyFingerprint({ organisation: "Example Ltd", title: "Graduate Software Engineer", location: "Sydney" });
    const second = normalisedVacancyFingerprint({ organisation: " example ltd ", title: "Graduate—Software Engineer", location: "SYDNEY" });
    expect(first).toBe(second);
  });

  it("isolates source failures and pauses chronically failing adapters", () => {
    expect(classifySourceFailure(new Error("The operation was aborted due to timeout"))).toBe("timeout");
    expect(shouldAutoPause(6, "NEEDS_SOURCE_SPECIFIC_ADAPTER")).toBe(false);
    expect(shouldAutoPause(7, "NEEDS_SOURCE_SPECIFIC_ADAPTER")).toBe(true);
  });

  it("uses shorter freshness for job boards than official government sources", () => {
    expect(freshnessWindowDays("job-board", "listing")).toBe(3);
    expect(freshnessWindowDays("government", "listing")).toBe(14);
  });
});

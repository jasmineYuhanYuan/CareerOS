import { describe, expect, it } from "vitest";
import { classifyMarketPage, discoverOfficialLinks, staleLifecycle } from "./market-pipeline";
import { liveVerifiedOpportunities, needsReviewQueue, opportunityChanges, type MarketSnapshot } from "./market-client";

describe("automatic market pipeline", () => {
  it("does not treat HTTP 200 or a generic apply word as proof of Open", () => {
    expect(classifyMarketPage({ ok: true, status: 200, body: "Welcome to careers. Apply now.", url: "https://example.com/careers" }).status).toBe("Verification required");
  });

  it("requires position content and an application action for Open", () => {
    const result = classifyMarketPage({ ok: true, status: 200, body: "Job description and responsibilities. Apply for this job", url: "https://example.com/jobs/42" });
    expect(result.status).toBe("Open");
    expect(result.applyUrl).toBe("https://example.com/jobs/42");
  });

  it("extracts a position-level apply URL and structured deadline for change detection", () => {
    const result = classifyMarketPage({ ok: true, status: 200, body: '<script>{"validThrough":"2026-08-25"}</script><p>Job description and responsibilities.</p><a href="/apply/42">Apply now</a>', url: "https://example.com/jobs/42" });
    expect(result).toMatchObject({ status: "Open", applyUrl: "https://example.com/apply/42", deadline: "2026-08-25" });
  });

  it("uses explicit closure evidence and does not infer closure from HTTP errors", () => {
    expect(classifyMarketPage({ ok: true, status: 200, body: "This position is no longer available", url: "https://example.com/jobs/42" }).status).toBe("Closed");
    expect(classifyMarketPage({ ok: false, status: 404, body: "", url: "https://example.com/jobs/42" }).status).toBe("Verification required");
  });

  it("downgrades stale open records", () => {
    expect(staleLifecycle("2026-07-01T00:00:00Z", "Open", "2026-08-14T00:00:00Z")).toBe("Verification required");
  });

  it("discovers and deduplicates role-like official links", () => {
    const html = '<a href="/jobs/1">Software Engineer Intern</a><a href="/jobs/1#top">Software Engineer Intern</a><a href="/about">About</a>';
    expect(discoverOfficialLinks(html, "https://careers.example.com")).toHaveLength(1);
  });

  it("exposes only verified live vacancies for the active profile", () => {
    const base = { title: "Role", organisation: "Example", city: "Sydney", country: "Australia", location_text: "Sydney", employment_type: "Internship", role_family: "Software Engineering", source_url: "https://example.com/1", apply_url: "https://example.com/1", lifecycle_status: "Open", verification_status: "Verified", verification_evidence: "position and apply", published_at: null, opens_at: null, deadline: null, last_verified_at: "2026-08-14T00:00:00Z", metadata: {} };
    const snapshot: MarketSnapshot = { loaded: true, configured: true, sources: [], recentEvents: [], latestRun: null, opportunities: [
      { ...base, id: "yuhan", profile_scope: ["yuhan-yuan"] },
      { ...base, id: "tommy", profile_scope: ["taicheng-guo-tommy"], title: "Clinic directory", apply_url: null, lifecycle_status: "Verification required", verification_status: "Verification required" },
    ] };
    expect(liveVerifiedOpportunities(snapshot, "yuhan-yuan").map((item) => item.id)).toEqual(["yuhan"]);
    expect(liveVerifiedOpportunities(snapshot, "taicheng-guo-tommy")).toEqual([]);
  });

  it("keeps change feed and review queue separate from recommendations", () => {
    const opportunity = { id: "review", title: "Ambiguous role", organisation: "Example", city: "Sydney", country: "Australia", location_text: "Sydney", employment_type: "Full-time", role_family: "Software Engineering", profile_scope: ["yuhan-yuan"], source_url: "https://example.com/review", apply_url: null, lifecycle_status: "Verification required", verification_status: "Verification required", verification_evidence: "No apply link", published_at: null, opens_at: null, deadline: null, last_verified_at: null, metadata: {} };
    const event = { id: 1, event_type: "verification-failed", previous_status: "Open", observed_status: "Verification required", evidence_text: "No apply link", evidence_type: "inconclusive", http_status: 200, checked_at: "2026-08-14T00:00:00Z", opportunity_id: "review", source_id: "source", source_name: "Example careers", role_title: "Ambiguous role", organisation: "Example" };
    const snapshot: MarketSnapshot = { loaded: true, configured: true, sources: [{ id: "source", name: "Example careers", health_status: "healthy", last_checked_at: "2026-08-14T00:00:00Z" }], opportunities: [opportunity], recentEvents: [event], latestRun: null };
    expect(opportunityChanges(snapshot, 7, new Date("2026-08-14T12:00:00Z"))).toHaveLength(1);
    expect(needsReviewQueue(snapshot)).toEqual([expect.objectContaining({ id: "review", httpStatus: 200 })]);
    expect(liveVerifiedOpportunities(snapshot, "yuhan-yuan")).toEqual([]);
  });
});

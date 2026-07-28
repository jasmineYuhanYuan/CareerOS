import { describe, expect, it } from "vitest";
import { createSeedState, jobs, TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { aggregateDeadlines } from "@/lib/dashboard";
import { calculateJobMatch, isJobSuitableForProfile } from "@/lib/match";
import { getProfileWorkspace, parseStoredState, validateState } from "@/lib/storage";

describe("profile-aware job filtering", () => {
  it("keeps chiropractic jobs out of Yuhan's relevant results", () => {
    const state = createSeedState();
    const profile = state.profiles[YUHAN_ID].profile;
    const relevant = jobs.filter((job) => isJobSuitableForProfile(job, profile));
    expect(relevant.length).toBeGreaterThan(0);
    expect(relevant.every((job) => job.discipline !== "Chiropractic")).toBe(true);
  });

  it("shows Tommy relevant clinical roles", () => {
    const state = createSeedState();
    const profile = state.profiles[TOMMY_ID].profile;
    const relevant = jobs.filter((job) => isJobSuitableForProfile(job, profile));
    expect(relevant.every((job) => ["Chiropractic", "Clinical Healthcare"].includes(job.roleFamily))).toBe(true);
  });
});

describe("deterministic match scoring", () => {
  it("returns the same result for identical inputs", () => {
    const profile = createSeedState().profiles[YUHAN_ID].profile;
    expect(calculateJobMatch(jobs[0], profile)).toEqual(calculateJobMatch(jobs[0], profile));
  });
});

describe("local storage parsing and fallback", () => {
  it("falls back to seed data for malformed JSON", () => {
    const state = parseStoredState("{not-json");
    expect(state.version).toBe(2);
    expect(state.profiles[YUHAN_ID].profile.displayName).toBe("Yuhan Yuan");
  });

  it("falls back for unsupported versions", () => {
    const state = parseStoredState(JSON.stringify({ version: 999 }));
    expect(state.version).toBe(2);
  });
});

describe("profile data separation", () => {
  it("returns only the requested workspace", () => {
    const state = createSeedState();
    state.profiles[YUHAN_ID].savedJobIds.push("j1");
    expect(getProfileWorkspace(state, YUHAN_ID)?.savedJobIds).toEqual(["j1"]);
    expect(getProfileWorkspace(state, TOMMY_ID)?.savedJobIds).toEqual([]);
  });
});

describe("dashboard deadline aggregation", () => {
  it("sorts combined profile deadlines chronologically", () => {
    const workspace = createSeedState().profiles[YUHAN_ID];
    workspace.savedJobIds.push("j1");
    const deadlines = aggregateDeadlines(workspace);
    expect(deadlines.length).toBeGreaterThan(1);
    expect(deadlines.map((item) => item.date)).toEqual(
      deadlines.map((item) => item.date).slice().sort(),
    );
  });
});

describe("import validation", () => {
  it("accepts valid exports and rejects malformed data", () => {
    expect(validateState(createSeedState())).toBe(true);
    expect(validateState({ version: 2, profiles: {} })).toBe(false);
    expect(validateState(null)).toBe(false);
  });
});

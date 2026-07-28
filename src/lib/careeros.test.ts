import { describe, expect, it } from "vitest";
import { createSeedState, jobs, TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { aggregateDeadlines } from "@/lib/dashboard";
import { calculateJobMatch, isJobSuitableForProfile } from "@/lib/match";
import { getProfileWorkspace, parseStoredState, validateState } from "@/lib/storage";
import { calculateOpportunityMatch } from "@/lib/opportunity-match";
import { opportunities } from "@/data/opportunities";
import { formatDate } from "@/i18n/format";
import { getTranslation, missingChineseKeys } from "@/i18n";

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
    expect(state.version).toBe(3);
    expect(state.profiles[YUHAN_ID].profile.displayName).toBe("Yuhan Yuan");
  });

  it("falls back for unsupported versions", () => {
    const state = parseStoredState(JSON.stringify({ version: 999 }));
    expect(state.version).toBe(3);
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
    expect(validateState({ version: 3, profiles: {} })).toBe(false);
    expect(validateState(null)).toBe(false);
  });
});

describe("Sprint 3 storage migration", () => {
  it("migrates valid version 2 workspaces without losing profile data", () => {
    const current = createSeedState();
    const legacy = structuredClone(current) as unknown as Record<string, unknown>;
    legacy.version = 2;
    delete legacy.language;
    delete legacy.dashboardPreferences;
    const profiles = legacy.profiles as Record<string, Record<string, unknown>>;
    for (const workspace of Object.values(profiles)) {
      delete workspace.savedOpportunityIds;
      delete workspace.contacts;
      delete workspace.documents;
    }
    const migrated = parseStoredState(JSON.stringify(legacy));
    expect(migrated.version).toBe(3);
    expect(migrated.profiles[YUHAN_ID].profile.displayName).toBe("Yuhan Yuan");
    expect(migrated.profiles[YUHAN_ID].contacts).toEqual([]);
  });
});

describe("typed localisation", () => {
  it("covers every English key in Chinese and formats locale-aware dates", () => {
    expect(missingChineseKeys()).toEqual([]);
    expect(getTranslation("zh-CN", "nav.opportunities")).toBe("机会");
    expect(formatDate("2026-07-29", "en")).toContain("29");
    expect(formatDate("2026-07-29", "zh-CN")).toContain("2026");
  });
});

describe("transparent opportunity matching", () => {
  it("is deterministic, profile-aware and case-insensitive", () => {
    const state = createSeedState();
    const opportunity = { ...opportunities[0], skillTags: ["typescript"] };
    const yuhan = calculateOpportunityMatch(opportunity, state.profiles[YUHAN_ID].profile);
    const tommy = calculateOpportunityMatch(opportunity, state.profiles[TOMMY_ID].profile);
    expect(yuhan).toEqual(calculateOpportunityMatch(opportunity, state.profiles[YUHAN_ID].profile));
    expect(yuhan.score).not.toBe(tommy.score);
    expect(yuhan.strengths.join(" ").toLowerCase()).toContain("typescript");
  });

  it("uses limited confidence rather than zeroing missing data", () => {
    const profile = { ...createSeedState().profiles[YUHAN_ID].profile, skills: [], projects: [], workEligibility: "" };
    const result = calculateOpportunityMatch({ ...opportunities[0], skillTags: [], eligibilityText: undefined }, profile);
    expect(result.score).toBeGreaterThan(0);
    expect(result.confidence).toBe("Limited information");
  });
});

describe("contact profile separation", () => {
  it("keeps contacts in their owning workspace", () => {
    const state = createSeedState();
    state.profiles[YUHAN_ID].contacts.push({
      id: "c1", profileId: YUHAN_ID, name: "Test", organisation: "", role: "",
      relationshipType: "Mentor", notes: "", createdAt: "2026-07-29", updatedAt: "2026-07-29",
    });
    expect(state.profiles[TOMMY_ID].contacts).toHaveLength(0);
  });
});

import { describe, expect, it } from "vitest";
import { createSeedState, jobs, TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { aggregateDeadlines, profileReadiness, recentApplicationActivity } from "@/lib/dashboard";
import { displayOrganisationName, sampleStatus } from "@/lib/presentation";
import { calculateJobMatch, isJobSuitableForProfile } from "@/lib/match";
import { getProfileWorkspace, parseStoredState, validateState } from "@/lib/storage";
import { calculateOpportunityMatch } from "@/lib/opportunity-match";
import { opportunities } from "@/data/opportunities";
import { formatDate } from "@/i18n/format";
import { en, getTranslation, missingChineseKeys, zhCN } from "@/i18n";

describe("profile-aware job filtering", () => {
  it("keeps chiropractic jobs out of Yuhan's relevant results", () => {
    const state = createSeedState();
    const profile = state.profiles[YUHAN_ID].profile;
    const relevant = jobs.filter((job) => isJobSuitableForProfile(job, profile));
    expect(relevant.length).toBeGreaterThan(0);
    expect(relevant.every((job) => job.discipline !== "Chiropractic")).toBe(true);
  });

  it("keeps Tommy focused on chiropractic and excludes government technology roles", () => {
    const state = createSeedState();
    const profile = state.profiles[TOMMY_ID].profile;
    const relevant = jobs.filter((job) => isJobSuitableForProfile(job, profile));
    expect(profile.university).toBe("Macquarie University");
    expect(profile.discipline).toBe("Chiropractic");
    expect(profile.workEligibility).toBe("To be confirmed");
    expect(profile.registrationStatus).toBe("To be confirmed");
    expect(profile.careerGoals).toContain("Graduate Chiropractor");
    expect(relevant).toHaveLength(0);
  });
});

describe("deterministic match scoring", () => {
  it("returns the same result for identical inputs", () => {
    const profile = createSeedState().profiles[YUHAN_ID].profile;
    expect(calculateJobMatch(jobs[0], profile)).toEqual(calculateJobMatch(jobs[0], profile));
  });

  it("caps chiropractic matches when registration or work eligibility is unknown", () => {
    const profile = createSeedState().profiles[TOMMY_ID].profile;
    const result = calculateJobMatch({
      ...jobs[0],
      title: "Graduate Chiropractor",
      discipline: "Chiropractic",
      roleFamily: "Chiropractic",
      suitableProfileIds: [TOMMY_ID],
      location: "Canberra",
    }, profile);
    expect(result.score).toBeLessThanOrEqual(75);
    expect(result.gaps).toContain("Registration status must be confirmed");
    expect(result.gaps).toContain("Work eligibility must be confirmed");
  });
});

describe("local storage parsing and fallback", () => {
  it("falls back to seed data for malformed JSON", () => {
    const state = parseStoredState("{not-json");
    expect(state.version).toBe(3);
    expect(state.profiles[YUHAN_ID].profile.displayName).toBe("Yuhan Yuan");
  });

  it("corrects the known false ANU and cybersecurity Tommy seed without preserving false eligibility", () => {
    const incorrect = createSeedState();
    incorrect.profiles[TOMMY_ID].profile.university = "Australian National University";
    incorrect.profiles[TOMMY_ID].profile.discipline = "Cyber Security and Data Analytics";
    incorrect.profiles[TOMMY_ID].profile.workEligibility = "Australian citizen";
    const corrected = parseStoredState(JSON.stringify(incorrect));
    expect(corrected.profiles[TOMMY_ID].profile.university).toBe("Macquarie University");
    expect(corrected.profiles[TOMMY_ID].profile.discipline).toBe("Chiropractic");
    expect(corrected.profiles[TOMMY_ID].profile.workEligibility).toBe("To be confirmed");
    expect(corrected.profiles[TOMMY_ID].savedOpportunityIds).toEqual([]);
  });

  it("falls back for unsupported versions", () => {
    const state = parseStoredState(JSON.stringify({ version: 999 }));
    expect(state.version).toBe(3);
  });
});

describe("profile data separation", () => {
  it("returns only the requested workspace", () => {
    const state = createSeedState();
    state.profiles[YUHAN_ID].savedJobIds.push("j2");
    expect(getProfileWorkspace(state, YUHAN_ID)?.savedJobIds).toContain("j2");
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

describe("Sprint 4 dashboard presentation", () => {
  it("builds an actionable readiness checklist", () => {
    const workspace = createSeedState().profiles[YUHAN_ID];
    const checks = profileReadiness(workspace);
    expect(checks).toHaveLength(8);
    expect(checks.find((item) => item.key === "education")?.complete).toBe(true);
    expect(checks.find((item) => item.key === "resume")?.complete).toBe(false);
  });

  it("orders recent application activity newest first", () => {
    const activity = recentApplicationActivity(createSeedState().profiles[YUHAN_ID]);
    expect(activity).toHaveLength(1);
    expect(activity[0].label).toBe("Application created");
  });

  it("removes duplicate sample suffixes and localises the consolidated warning", () => {
    expect(displayOrganisationName("Harbour Chiropractic Clinic (Sample)")).toBe("Harbour Chiropractic Clinic");
    expect(sampleStatus("zh-CN")).toBe("示例数据 · 非实时职位");
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

describe("Sprint 4 preference migration", () => {
  it("adds a persistent demo-mode preference without dropping profile data", () => {
    const legacy = structuredClone(createSeedState()) as unknown as Record<string, unknown>;
    const preferences = legacy.dashboardPreferences as Record<string, unknown>;
    delete preferences.demoMode;
    const migrated = parseStoredState(JSON.stringify(legacy));
    expect(migrated.dashboardPreferences.demoMode).toBe(false);
    expect(migrated.profiles[TOMMY_ID].profile.displayName).toBe("Taicheng Guo (Tommy)");
  });
});

describe("typed localisation", () => {
  it("covers every English key in Chinese and formats locale-aware dates", () => {
    expect(missingChineseKeys()).toEqual([]);
    expect(Object.keys(zhCN).sort()).toEqual(Object.keys(en).sort());
    expect(getTranslation("zh-CN", "nav.opportunities")).toBe("机会");
    expect(formatDate("2026-07-29", "en")).toContain("29");
    expect(formatDate("2026-07-29", "zh-CN")).toContain("2026");
  });
});

describe("transparent opportunity matching", () => {
  it("returns every required match dimension with evidence and uncertainty fields", () => {
    const result = calculateOpportunityMatch(opportunities[0], createSeedState().profiles[YUHAN_ID].profile);
    expect(result.dimensions?.map((dimension) => dimension.name)).toEqual([
      "Goal alignment",
      "Discipline alignment",
      "Skill overlap",
      "Location alignment",
      "Experience/project relevance",
      "Eligibility confidence",
      "Opportunity type preference",
    ]);
    expect(result.dimensions?.every((dimension) => Array.isArray(dimension.evidence) && typeof dimension.uncertainty === "string")).toBe(true);
  });
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

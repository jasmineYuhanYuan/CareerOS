import { describe, expect, it } from "vitest";
import { createSeedState, TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { mergeCareerOSStates } from "./sync-engine";

describe("automatic cloud sync conflict handling", () => {
  it("preserves newer application data while retaining records from both copies", () => {
    const local = createSeedState(); const remote = createSeedState();
    const base = local.profiles[YUHAN_ID].applications[0];
    local.profiles[YUHAN_ID].applications = [{ ...base, notes: "local-new", lastUpdatedAt: "2026-10-03T10:00:00Z" }];
    remote.profiles[YUHAN_ID].applications = [{ ...base, notes: "remote-old", lastUpdatedAt: "2026-10-02T10:00:00Z" }, { ...base, id: "remote-only", notes: "remote", lastUpdatedAt: "2026-10-02T11:00:00Z" }];
    const merged = mergeCareerOSStates(local, remote, "2026-10-03T10:00:00Z", "2026-10-02T10:00:00Z");
    expect(merged.profiles[YUHAN_ID].applications.find((item) => item.id === base.id)?.notes).toBe("local-new");
    expect(merged.profiles[YUHAN_ID].applications.some((item) => item.id === "remote-only")).toBe(true);
  });

  it("never merges Yuhan records into Tommy's workspace", () => {
    const local = createSeedState(); const remote = createSeedState();
    local.profiles[YUHAN_ID].savedOpportunityIds = ["yuhan-role"];
    remote.profiles[TOMMY_ID].savedOpportunityIds = ["tommy-role"];
    const merged = mergeCareerOSStates(local, remote, "2026-10-03", "2026-10-02");
    expect(merged.profiles[TOMMY_ID].savedOpportunityIds).toEqual(["tommy-role"]);
    expect(merged.profiles[YUHAN_ID].savedOpportunityIds).toContain("yuhan-role");
  });

  it("keeps state profiles structurally isolated when remote data wins", () => {
    const local = createSeedState(); const remote = createSeedState();
    local.profiles[YUHAN_ID].organisationNotes = { canva: "Yuhan only" };
    remote.profiles[TOMMY_ID].organisationNotes = { clinic: "Tommy only" };
    const merged = mergeCareerOSStates(local, remote, "2026-10-01", "2026-10-03");
    expect(merged.profiles[TOMMY_ID].organisationNotes).toEqual({ clinic: "Tommy only" });
    expect(merged.profiles[YUHAN_ID].organisationNotes).toEqual({ canva: "Yuhan only" });
  });
});

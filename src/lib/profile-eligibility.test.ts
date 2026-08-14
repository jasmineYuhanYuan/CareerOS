import { describe, expect, it } from "vitest";
import { opportunities } from "@/data/opportunities";
import { createSeedState, TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { aggregateDeadlines } from "@/lib/dashboard";
import {
  getEligibleOpportunities,
  isOpportunityRelevantToProfile,
} from "./profile-eligibility";

describe("strict profile eligibility", () => {
  const state = createSeedState();
  const yuhan = state.profiles[YUHAN_ID].profile;
  const tommy = state.profiles[TOMMY_ID].profile;

  it("never exposes software, product, AI, frontend, or backend records to Tommy", () => {
    const eligible = getEligibleOpportunities(tommy, opportunities);
    expect(eligible).toHaveLength(0);
    expect(eligible.some((item) => /software|product|\bai\b|frontend|backend/i.test(item.title))).toBe(false);
  });

  it("never exposes chiropractic records to Yuhan even if profile scope is corrupted", () => {
    const incompatible = {
      ...opportunities[0],
      id: "regression-chiropractic",
      title: "Graduate Chiropractor",
      roleFamilyTags: ["Chiropractic"],
      disciplineTags: ["Chiropractic"],
      suitableProfileIds: [YUHAN_ID],
    };
    expect(isOpportunityRelevantToProfile(yuhan, incompatible)).toBe(false);
  });

  it("requires explicit profile scope before domain matching or ranking", () => {
    const tech = opportunities.find((item) => /software|digital|technology/i.test(`${item.title} ${item.roleFamilyTags.join(" ")}`));
    expect(tech).toBeDefined();
    expect(isOpportunityRelevantToProfile(tommy, { ...tech!, suitableProfileIds: [TOMMY_ID] })).toBe(false);
  });

  it("does not surface a stale saved Yuhan deadline in Tommy's dashboard", () => {
    const workspace = structuredClone(state.profiles[TOMMY_ID]);
    const dated = opportunities.find((item) => Boolean(item.deadline));
    expect(dated).toBeDefined();
    workspace.savedOpportunityIds = [dated!.id];
    expect(aggregateDeadlines(workspace).some((item) => item.title === dated!.title)).toBe(false);
  });
});

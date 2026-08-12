import { describe, expect, it } from "vitest";
import { createSeedState, TOMMY_ID, YUHAN_ID } from "@/data/seed";
import {
  archiveExpiredJobs,
  getActiveJobs,
  getDailyCareerActions,
  getDailyOpportunities,
  getRecommendedJobs,
} from "./index";

const today = "2026-08-12";

describe("daily opportunity engine", () => {
  const state = createSeedState();

  it("keeps Yuhan and Tommy opportunity streams isolated", () => {
    const yuhan = getDailyOpportunities(
      state.profiles[YUHAN_ID].profile,
      today,
    );
    const tommy = getDailyOpportunities(
      state.profiles[TOMMY_ID].profile,
      today,
    );
    expect(yuhan.every((item) => item.profileScope.includes(YUHAN_ID))).toBe(
      true,
    );
    expect(tommy.every((item) => item.profileScope.includes(TOMMY_ID))).toBe(
      true,
    );
    expect(tommy.some((item) => item.country === "China")).toBe(false);
    expect(yuhan.some((item) => item.applicationStatus === "prospect")).toBe(
      false,
    );
  });

  it("does not count clinic prospects as active vacancies", () => {
    const tommy = getDailyOpportunities(
      state.profiles[TOMMY_ID].profile,
      today,
    );
    expect(
      tommy.filter((item) => item.applicationStatus === "prospect"),
    ).toHaveLength(10);
    expect(getActiveJobs(tommy)).toHaveLength(0);
  });

  it("recommends only fresh active jobs", () => {
    const recommended = getRecommendedJobs(
      state.profiles[YUHAN_ID].profile,
      today,
    );
    expect(
      recommended.every(
        (item) =>
          item.dataFreshness !== "stale" &&
          ["active", "closingSoon"].includes(item.applicationStatus),
      ),
    ).toBe(true);
  });

  it("archives records only from a real published past deadline", () => {
    const record = getDailyOpportunities(
      state.profiles[YUHAN_ID].profile,
      today,
    )[0];
    const archived = archiveExpiredJobs(
      [{ ...record, deadline: "2026-08-11" }],
      today,
    );
    expect(archived[0].applicationStatus).toBe("archived");
    expect(
      archiveExpiredJobs([{ ...record, deadline: null }], today)[0]
        .applicationStatus,
    ).toBe(record.applicationStatus);
  });

  it("generates profile-aware daily career actions", () => {
    const actions = getDailyCareerActions(state.profiles[YUHAN_ID], today);
    expect(actions.map((item) => item.type)).toEqual([
      "apply",
      "closing",
      "resume",
      "followUp",
    ]);
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createSeedState, TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { getRecommendedJobs } from "@/lib/opportunity-engine";
import {
  archivedChiropracticLeads,
  clinicsForProfile,
  TOMMY_ADD_CLINIC_ROUTE,
  TOMMY_CLINIC_DIRECTORY_ROUTE,
  verifiedCurrentChiropracticVacancies,
} from "./clinic-directory";

describe("Tommy clinic directory", () => {
  const state = createSeedState();

  it("routes opportunity actions directly to distinct clinic workflows", () => {
    expect(TOMMY_CLINIC_DIRECTORY_ROUTE).toBe("/clinics#clinic-directory");
    expect(TOMMY_ADD_CLINIC_ROUTE).toBe("/clinics#add-target-clinic");
    const browser = readFileSync(resolve("src/components/opportunities/opportunity-browser.tsx"), "utf8");
    expect(browser).toContain("href={TOMMY_CLINIC_DIRECTORY_ROUTE}");
    expect(browser).not.toContain('href="/chiropractic"');
  });

  it("never counts directory records as current vacancies", () => {
    expect(clinicsForProfile(state.profiles[TOMMY_ID].profile)).toHaveLength(10);
    expect(verifiedCurrentChiropracticVacancies()).toBe(0);
    expect(getRecommendedJobs(state.profiles[TOMMY_ID].profile, "2026-08-14")).toHaveLength(0);
  });

  it("keeps every historical chiropractic vacancy archived", () => {
    expect(archivedChiropracticLeads()).toHaveLength(3);
    expect(archivedChiropracticLeads().every((item) => item.verificationStatus === "Archived")).toBe(true);
  });

  it("never exposes Tommy clinic data to Yuhan", () => {
    expect(clinicsForProfile(state.profiles[YUHAN_ID].profile)).toEqual([]);
  });

  it("preserves the Tommy zero-vacancy message", () => {
    const browser = readFileSync(resolve("src/components/opportunities/opportunity-browser.tsx"), "utf8");
    expect(browser).toContain("目前没有找到适合 Tommy 且已核验为正在招聘的岗位。");
  });
});

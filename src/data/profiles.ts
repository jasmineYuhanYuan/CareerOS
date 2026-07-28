import seedData from "../../SEED_PROFILES.json";
import type { CareerProfile, StudyLevel } from "@/types/profile";

interface SeedProfile {
  display_name: string;
  university: string;
  degree: string;
  discipline: string;
  study_level: StudyLevel;
  location: string;
  career_goals: string[];
  projects?: string[];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSeedProfile(value: unknown): value is SeedProfile {
  if (typeof value !== "object" || value === null) return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.display_name === "string" &&
    typeof profile.university === "string" &&
    typeof profile.degree === "string" &&
    typeof profile.discipline === "string" &&
    (profile.study_level === "Undergraduate" ||
      profile.study_level === "Postgraduate") &&
    typeof profile.location === "string" &&
    isStringArray(profile.career_goals) &&
    (profile.projects === undefined || isStringArray(profile.projects))
  );
}

function parseSeedProfiles(value: unknown): SeedProfile[] {
  if (typeof value !== "object" || value === null) {
    throw new Error("Profile seed data must be an object.");
  }
  const profilesValue = (value as Record<string, unknown>).profiles;
  if (!Array.isArray(profilesValue) || !profilesValue.every(isSeedProfile)) {
    throw new Error("Profile seed data is invalid.");
  }
  return profilesValue;
}

function createProfileId(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const profiles: readonly CareerProfile[] = parseSeedProfiles(seedData).map(
  (profile) => ({
    id: createProfileId(profile.display_name),
    displayName: profile.display_name,
    university: profile.university,
    degree: profile.degree,
    discipline: profile.discipline,
    studyLevel: profile.study_level,
    location: profile.location,
    careerGoals: profile.career_goals,
    projects: profile.projects ?? [],
  }),
);

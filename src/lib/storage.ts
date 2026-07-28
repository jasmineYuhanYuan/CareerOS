import { createSeedState } from "@/data/seed";
import type { CareerOSState, ProfileWorkspace } from "@/types/domain";
import { STORAGE_VERSION } from "@/types/domain";

export const STORAGE_KEY = "careeros:mvp";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isWorkspace(value: unknown, profileId: string): value is ProfileWorkspace {
  if (typeof value !== "object" || value === null) return false;
  const workspace = value as Record<string, unknown>;
  const profile = workspace.profile;
  if (typeof profile !== "object" || profile === null) return false;
  const profileRecord = profile as Record<string, unknown>;
  const applications = workspace.applications;
  const postgraduateApplications = workspace.postgraduateApplications;
  const roadmapItems = workspace.roadmapItems;
  return (
    profileRecord.id === profileId &&
    typeof profileRecord.displayName === "string" &&
    typeof profileRecord.university === "string" &&
    isStringArray(profileRecord.careerGoals) &&
    isStringArray(workspace.savedJobIds) &&
    Array.isArray(applications) &&
    applications.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const record = item as Record<string, unknown>;
      return record.profileId === profileId && typeof record.id === "string" && typeof record.status === "string";
    }) &&
    isStringArray(workspace.savedProgramIds) &&
    Array.isArray(postgraduateApplications) &&
    postgraduateApplications.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const record = item as Record<string, unknown>;
      return record.profileId === profileId && typeof record.id === "string" && typeof record.programId === "string";
    }) &&
    Array.isArray(roadmapItems) &&
    roadmapItems.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const record = item as Record<string, unknown>;
      return record.profileId === profileId && typeof record.id === "string" && typeof record.title === "string";
    }) &&
    typeof workspace.organisationNotes === "object" &&
    workspace.organisationNotes !== null
  );
}

export function validateState(value: unknown): value is CareerOSState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as Record<string, unknown>;
  if (
    state.version !== STORAGE_VERSION ||
    typeof state.activeProfileId !== "string" ||
    typeof state.defaultProfileId !== "string" ||
    !["System", "Light", "Dark"].includes(String(state.theme)) ||
    typeof state.profiles !== "object" ||
    state.profiles === null
  ) {
    return false;
  }
  const profiles = state.profiles as Record<string, unknown>;
  const ids = Object.keys(profiles);
  return (
    ids.length > 0 &&
    ids.every((id) => isWorkspace(profiles[id], id)) &&
    state.activeProfileId in profiles &&
    state.defaultProfileId in profiles
  );
}

export function parseStoredState(raw: string | null): CareerOSState {
  if (!raw) return createSeedState();
  try {
    const parsed: unknown = JSON.parse(raw);
    return validateState(parsed) ? parsed : createSeedState();
  } catch {
    return createSeedState();
  }
}

export function serialiseState(state: CareerOSState): string {
  return JSON.stringify(state, null, 2);
}

export function saveState(storage: Pick<Storage, "setItem">, state: CareerOSState): boolean {
  try {
    storage.setItem(STORAGE_KEY, serialiseState(state));
    return true;
  } catch {
    return false;
  }
}

export function readState(storage: Pick<Storage, "getItem">): CareerOSState {
  try {
    return parseStoredState(storage.getItem(STORAGE_KEY));
  } catch {
    return createSeedState();
  }
}

export function getProfileWorkspace(
  state: CareerOSState,
  profileId: string,
): ProfileWorkspace | null {
  return state.profiles[profileId] ?? null;
}

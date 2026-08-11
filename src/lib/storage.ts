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
    workspace.organisationNotes !== null &&
    isStringArray(workspace.savedOpportunityIds) &&
    Array.isArray(workspace.contacts) &&
    workspace.contacts.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const record = item as Record<string, unknown>;
      return record.profileId === profileId && typeof record.id === "string" && typeof record.name === "string";
    }) &&
    Array.isArray(workspace.documents) &&
    workspace.documents.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const record = item as Record<string, unknown>;
      return record.profileId === profileId && typeof record.id === "string" && typeof record.name === "string";
    }) &&
    Array.isArray(workspace.chinaCampusOpportunities) &&
    workspace.chinaCampusOpportunities.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const record = item as Record<string, unknown>;
      return record.profileId === profileId && record.country === "China" && typeof record.id === "string" && typeof record.status === "string";
    })
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
    !["en", "zh-CN"].includes(String(state.language)) ||
    typeof state.dashboardPreferences !== "object" ||
    state.dashboardPreferences === null ||
    typeof (state.dashboardPreferences as Record<string, unknown>).demoMode !== "boolean" ||
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

function normaliseSprint8State(state: CareerOSState): CareerOSState {
  const applicationStatuses: Record<string, CareerOSState["profiles"][string]["applications"][number]["status"]> = {
    Saved: "Interested",
    Assessment: "OA invited",
    Interview: "Interviewing",
  };
  const documentStatuses: Record<string, CareerOSState["profiles"][string]["documents"][number]["status"]> = {
    "Needs update": "Review needed",
    Archived: "Outdated",
  };
  return {
    ...state,
    profiles: Object.fromEntries(Object.entries(state.profiles).map(([profileId, workspace]) => [
      profileId,
      {
        ...workspace,
        applications: workspace.applications.map((application) => ({
          ...application,
          status: applicationStatuses[application.status] ?? application.status,
          materials: application.materials ?? [],
          sessions: application.sessions ?? [],
        })),
        documents: workspace.documents.map((document) => ({
          ...document,
          status: documentStatuses[document.status] ?? document.status,
        })),
      },
    ])),
  };
}

export function migrateState(value: unknown): CareerOSState | null {
  if (validateState(value)) {
    const profile = value.profiles["taicheng-guo-tommy"]?.profile;
    if (profile?.university === "Australian National University" && profile.discipline === "Cyber Security and Data Analytics") {
      const corrected = createSeedState().profiles["taicheng-guo-tommy"];
      return normaliseSprint8State({
        ...value,
        profiles: {
          ...value.profiles,
          "taicheng-guo-tommy": {
            ...value.profiles["taicheng-guo-tommy"],
            profile: corrected.profile,
            savedJobIds: [],
            savedOpportunityIds: [],
            roadmapItems: corrected.roadmapItems,
            organisationNotes: {},
          },
        },
      });
    }
    return normaliseSprint8State(value);
  }
  if (typeof value !== "object" || value === null) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy.version === 4 && typeof legacy.profiles === "object" && legacy.profiles !== null) {
    const seed = createSeedState();
    const migratedProfiles = Object.fromEntries(Object.entries(legacy.profiles as Record<string, unknown>).map(([id, workspaceValue]) => {
      const workspace = workspaceValue as Record<string, unknown>;
      const oldRecords = Array.isArray(workspace.chinaCampusOpportunities) ? workspace.chinaCampusOpportunities as Record<string, unknown>[] : [];
      const upgraded: Record<string, unknown>[] = oldRecords.map((record) => ({
        ...record,
        recruitingBatch: record.recruitingBatch ?? "日常实习",
        targetGraduationYear: record.targetGraduationYear ?? null,
        roleFamily: record.roleFamily ?? record.category ?? "Other",
        businessUnit: record.businessUnit ?? null,
        officialCareersLink: record.officialCareersLink ?? record.sourceUrl,
        verificationStatus: record.verificationStatus ?? "Verification required",
        verificationConfidence: record.verificationConfidence ?? "Low",
        publishedDate: record.publishedDate ?? null,
        sampleData: false,
      }));
      const seedRecords = seed.profiles[id]?.chinaCampusOpportunities ?? [];
      const existingIds = new Set(upgraded.map((record) => String(record.id ?? "")));
      return [id, { ...workspace, chinaCampusOpportunities: [...upgraded, ...seedRecords.filter((record) => !existingIds.has(record.id))] }];
    }));
    const migrated = { ...legacy, version: STORAGE_VERSION, profiles: migratedProfiles };
    return validateState(migrated) ? normaliseSprint8State(migrated as CareerOSState) : null;
  }
  if (legacy.version === 3 && typeof legacy.profiles === "object" && legacy.profiles !== null) {
    const preferences = typeof legacy.dashboardPreferences === "object" && legacy.dashboardPreferences !== null
      ? legacy.dashboardPreferences as Record<string, unknown>
      : {};
    const migrated = {
      ...legacy,
      version: STORAGE_VERSION,
      dashboardPreferences: { ...preferences, demoMode: false },
      profiles: Object.fromEntries(Object.entries(legacy.profiles as Record<string, unknown>).map(([id, workspace]) => [
        id,
        { ...(workspace as Record<string, unknown>), chinaCampusOpportunities: [] },
      ])),
    };
    return validateState(migrated) ? migrated : null;
  }
  if (legacy.version !== 2 || typeof legacy.profiles !== "object" || legacy.profiles === null) return null;
  const migratedProfiles: Record<string, unknown> = {};
  for (const [profileId, workspaceValue] of Object.entries(legacy.profiles as Record<string, unknown>)) {
    if (typeof workspaceValue !== "object" || workspaceValue === null) return null;
    migratedProfiles[profileId] = {
      ...(workspaceValue as Record<string, unknown>),
      savedOpportunityIds: [],
      contacts: [],
      documents: [],
      chinaCampusOpportunities: [],
    };
  }
  const migrated = {
    ...legacy,
    version: STORAGE_VERSION,
    language: "en",
    dashboardPreferences: {
      defaultRegion: "Australia",
      showSampleData: true,
      showArchivedOpportunities: false,
      demoMode: false,
    },
    profiles: migratedProfiles,
  };
  return validateState(migrated) ? migrated : null;
}

export function parseStoredState(raw: string | null): CareerOSState {
  if (!raw) return createSeedState();
  try {
    const parsed: unknown = JSON.parse(raw);
    return migrateState(parsed) ?? createSeedState();
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

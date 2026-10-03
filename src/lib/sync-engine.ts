import type { CareerOSState, ProfileWorkspace } from "@/types/domain";

export type CloudSyncStatus = "local" | "syncing" | "synced" | "offline" | "conflict" | "error";

function mergeIds(preferred: string[], other: string[]): string[] {
  return [...new Set([...preferred, ...other])];
}

function mergeRecords<T extends { id: string }>(preferred: T[], other: T[], timestamp: (item: T) => string): T[] {
  const records = new Map(other.map((item) => [item.id, item]));
  for (const item of preferred) {
    const existing = records.get(item.id);
    if (!existing || timestamp(item) >= timestamp(existing)) records.set(item.id, item);
  }
  return [...records.values()];
}

function mergeWorkspace(preferred: ProfileWorkspace, other: ProfileWorkspace): ProfileWorkspace {
  return {
    ...other,
    ...preferred,
    savedJobIds: mergeIds(preferred.savedJobIds, other.savedJobIds),
    applications: mergeRecords(preferred.applications, other.applications, (item) => item.lastUpdatedAt || item.savedAt || ""),
    savedProgramIds: mergeIds(preferred.savedProgramIds, other.savedProgramIds),
    postgraduateApplications: mergeRecords(preferred.postgraduateApplications, other.postgraduateApplications, () => ""),
    roadmapItems: mergeRecords(preferred.roadmapItems, other.roadmapItems, (item) => item.targetDate || ""),
    organisationNotes: { ...other.organisationNotes, ...preferred.organisationNotes },
    savedOpportunityIds: mergeIds(preferred.savedOpportunityIds, other.savedOpportunityIds),
    contacts: mergeRecords(preferred.contacts, other.contacts, (item) => item.updatedAt || item.createdAt || ""),
    documents: mergeRecords(preferred.documents, other.documents, (item) => item.updatedAt || item.uploadedAt || ""),
    chinaCampusOpportunities: mergeRecords(preferred.chinaCampusOpportunities, other.chinaCampusOpportunities, (item) => item.updatedAt || item.createdAt || ""),
  };
}

export function mergeCareerOSStates(local: CareerOSState, remote: CareerOSState, localUpdatedAt: string, remoteUpdatedAt: string): CareerOSState {
  const preferLocal = localUpdatedAt >= remoteUpdatedAt;
  const preferred = preferLocal ? local : remote;
  const other = preferLocal ? remote : local;
  const profiles: CareerOSState["profiles"] = { ...other.profiles };
  for (const [id, workspace] of Object.entries(preferred.profiles)) {
    profiles[id] = profiles[id] ? mergeWorkspace(workspace, profiles[id]) : workspace;
  }
  return { ...other, ...preferred, profiles };
}

export function statesEqual(first: CareerOSState, second: CareerOSState): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

import type { Opportunity } from "@/types/domain";

export interface MarketOpportunityRecord {
  id: string; title: string; organisation: string; city: string | null; country: string;
  location_text: string; employment_type: string; role_family: string; profile_scope: string[];
  source_url: string; apply_url: string | null; lifecycle_status: string; verification_status: string;
  verification_evidence: string; published_at: string | null; opens_at: string | null;
  deadline: string | null; last_verified_at: string | null; metadata: Record<string, unknown>;
}
export interface MarketSnapshot {
  loaded: boolean; configured: boolean; opportunities: MarketOpportunityRecord[];
  sources: Array<{ id: string; name: string; health_status: string; last_checked_at: string | null }>;
  recentEvents: Array<{ id: number; event_type: string; observed_status: string | null; evidence_text: string; checked_at: string }>;
  latestRun: null | { started_at: string; completed_at: string | null; status: string; sources_checked: number; sources_failed: number; discovered_count: number; opened_count: number; closed_count: number; downgraded_count: number; verification_required_count: number };
}
export const emptyMarketSnapshot: MarketSnapshot = { loaded: false, configured: false, opportunities: [], sources: [], recentEvents: [], latestRun: null };

export function liveVerifiedOpportunities(snapshot: MarketSnapshot, profileId: string): Opportunity[] {
  return snapshot.opportunities
    .filter((item) => item.profile_scope.includes(profileId))
    .filter((item) => ["Open", "Closing soon"].includes(item.lifecycle_status) && item.verification_status === "Verified" && Boolean(item.apply_url) && Boolean(item.last_verified_at))
    .map((item) => ({
      id: item.id, category: item.employment_type === "Internship" ? "Internship" : item.employment_type === "Graduate" ? "Graduate program" : "Job",
      title: item.title, organisationId: `market-${item.organisation.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, organisationName: item.organisation,
      description: item.verification_evidence, disciplineTags: [item.role_family], roleFamilyTags: [item.role_family], skillTags: Array.isArray(item.metadata.skills) ? item.metadata.skills as string[] : [], suitableProfileIds: item.profile_scope,
      country: item.country, city: item.city ?? item.location_text, locationText: item.location_text, remoteType: "On-site", employmentType: item.employment_type as Opportunity["employmentType"],
      startDate: item.opens_at ?? undefined, deadline: item.deadline ?? undefined, publishedDate: item.published_at ?? undefined, sourceUrl: item.apply_url ?? item.source_url,
      sourceName: `${item.organisation} official source`, sourceType: "Official", verificationStatus: "Official source", lastVerifiedAt: item.last_verified_at?.slice(0, 10), dataNotes: item.verification_evidence,
      salaryText: typeof item.metadata.salary === "string" ? item.metadata.salary : undefined, sampleData: false, archived: false, applicationStage: item.lifecycle_status,
    }));
}

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
  sources: Array<{ id: string; name: string; health_status: string; last_checked_at: string | null; last_error?: string | null }>;
  recentEvents: MarketVerificationEvent[];
  latestRun: null | { started_at: string; completed_at: string | null; status: string; sources_checked: number; sources_failed: number; discovered_count: number; opened_count: number; closed_count: number; downgraded_count: number; verification_required_count: number };
}
export interface MarketVerificationEvent {
  id: number; event_type: string; previous_status: string | null; observed_status: string | null;
  evidence_text: string; evidence_type: string; http_status: number | null; checked_at: string;
  opportunity_id: string | null; source_id: string; source_name: string; role_title: string | null; organisation: string | null;
}

export interface NeedsReviewItem {
  id: string; source: string; role: string; issue: string; lastAttempt: string | null;
  httpStatus: number | null; reason: string;
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

export function opportunityChanges(snapshot: MarketSnapshot, days = 7, now = new Date()): MarketVerificationEvent[] {
  const cutoff = now.getTime() - days * 86_400_000;
  return snapshot.recentEvents
    .filter((event) => event.event_type !== "unchanged" && Date.parse(event.checked_at) >= cutoff)
    .slice(0, 20);
}

export function needsReviewQueue(snapshot: MarketSnapshot): NeedsReviewItem[] {
  const latestByOpportunity = new Map<string, MarketVerificationEvent>();
  for (const event of snapshot.recentEvents) if (event.opportunity_id && !latestByOpportunity.has(event.opportunity_id)) latestByOpportunity.set(event.opportunity_id, event);
  const opportunityItems = snapshot.opportunities
    .filter((item) => item.lifecycle_status === "Verification required" || item.verification_status !== "Verified")
    .map((item) => {
      const event = latestByOpportunity.get(item.id);
      return { id: item.id, source: event?.source_name ?? item.source_url, role: `${item.organisation} — ${item.title}`, issue: event?.evidence_type ?? "verification-required", lastAttempt: event?.checked_at ?? item.last_verified_at, httpStatus: event?.http_status ?? null, reason: event?.evidence_text ?? item.verification_evidence };
    });
  const failedSources = snapshot.sources
    .filter((source) => source.health_status === "degraded" || source.health_status === "failed")
    .map((source) => {
      const event = snapshot.recentEvents.find((item) => item.source_id === source.id && item.event_type === "source-failed");
      return { id: `source-${source.id}`, source: source.name, role: "—", issue: "request-failed", lastAttempt: event?.checked_at ?? source.last_checked_at, httpStatus: event?.http_status ?? null, reason: event?.evidence_text ?? source.last_error ?? "Source verification failed." };
    });
  return [...failedSources, ...opportunityItems];
}

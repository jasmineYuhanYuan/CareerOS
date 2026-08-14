import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { verifiedCareerOpportunities } from "@/data/verified/opportunities";
import { verifiedChinaCampusOpportunities } from "@/data/china-recruiting/verified-opportunities";

export type MarketLifecycle = "Open" | "Closing soon" | "Upcoming" | "Verification required" | "Closed" | "Expired" | "Archived";

export interface MarketSourceRow {
  id: string; name: string; official_url: string; market: string; source_type: string;
  crawl_strategy: "listing" | "registration" | "directory"; profile_scope: string[];
  enabled: boolean; consecutive_failures: number;
}

export interface MarketPageObservation {
  status: MarketLifecycle;
  evidenceType: string;
  evidenceText: string;
  applyUrl: string | null;
}

const CLOSED = ["position is no longer available", "applications are closed", "job has expired", "职位已关闭", "停止招聘", "招聘已结束"];
const APPLY = ["apply now", "apply for this job", "submit application", "立即投递", "申请职位", "投递简历"];
const POSITION = ["job description", "position description", "responsibilities", "qualifications", "岗位职责", "任职要求", "职位描述"];

const signal = (body: string, values: string[]) => values.find((item) => body.toLowerCase().includes(item.toLowerCase()));

export function classifyMarketPage(input: { ok: boolean; status: number; body: string; url: string; deadline?: string | null; checkedAt?: string }): MarketPageObservation {
  const today = (input.checkedAt ?? new Date().toISOString()).slice(0, 10);
  if (input.deadline && input.deadline < today) return { status: "Expired", evidenceType: "expired-deadline", evidenceText: `Published deadline ${input.deadline} has passed.`, applyUrl: null };
  if (!input.ok) return { status: "Verification required", evidenceType: "page-unavailable", evidenceText: `Official page returned HTTP ${input.status}; closure was not inferred.`, applyUrl: null };
  const closed = signal(input.body, CLOSED);
  if (closed) return { status: "Closed", evidenceType: "closure-message", evidenceText: `Official page contained closure evidence: ${closed}`, applyUrl: null };
  const apply = signal(input.body, APPLY);
  const position = signal(input.body, POSITION);
  if (apply && position) return { status: "Open", evidenceType: "position-and-application", evidenceText: `Official position page contained position-level content and application action: ${apply}`, applyUrl: input.url };
  return { status: "Verification required", evidenceType: "inconclusive", evidenceText: "Page was reachable, but position-level content plus an application action were not both present.", applyUrl: null };
}

export function staleLifecycle(lastVerifiedAt: string | null, lifecycle: MarketLifecycle, checkedAt: string, staleDays = 14): MarketLifecycle {
  if (!lastVerifiedAt || !["Open", "Closing soon"].includes(lifecycle)) return lifecycle;
  const age = (Date.parse(checkedAt) - Date.parse(lastVerifiedAt)) / 86_400_000;
  return age > staleDays ? "Verification required" : lifecycle;
}

function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48); }
function idFor(url: string) { return createHash("sha256").update(url).digest("hex").slice(0, 20); }

export async function bootstrapMarketData(db: SupabaseClient) {
  const sources = new Map<string, Record<string, unknown>>();
  const opportunities: Record<string, unknown>[] = [];
  for (const item of verifiedCareerOpportunities) {
    const sourceId = `bootstrap-${slug(item.company)}`;
    sources.set(sourceId, { id: sourceId, name: `${item.company} official careers`, official_url: item.careersUrl, market: "australia-tech", source_type: item.sourceType === "Government" ? "government" : "employer", crawl_strategy: "listing", profile_scope: item.profileScope ?? ["yuhan-yuan"] });
    const open = item.applicationStage === "Open" && Boolean(item.officialApplyUrl);
    opportunities.push({ id: item.id, source_id: sourceId, external_id: item.jobId ?? item.id, title: item.title, organisation: item.company, city: item.city, country: item.country, location_text: `${item.city}, ${item.country}`, employment_type: item.employmentType, role_family: item.roleFamily ?? "Other", profile_scope: item.profileScope ?? ["yuhan-yuan"], source_url: item.officialUrl, apply_url: open ? item.officialApplyUrl : null, lifecycle_status: open ? "Open" : item.applicationStage === "Closed" ? "Closed" : item.applicationStage === "Archived" ? "Archived" : item.applicationStage === "Upcoming" ? "Upcoming" : "Verification required", verification_status: open ? "Verified" : item.applicationStage === "Closed" ? "Closed" : item.applicationStage === "Archived" ? "Archived" : "Verification required", verification_evidence: open ? "Bootstrap: official position-level application URL; pending daily re-verification." : "Bootstrap metadata is not proof of a live vacancy.", published_at: item.publishedDate, opens_at: item.openingDate, deadline: item.deadline, last_verified_at: open ? `${item.lastVerified}T00:00:00Z` : null, last_seen_at: `${item.lastVerified}T00:00:00Z`, archived_at: item.applicationStage === "Archived" ? `${item.lastVerified}T00:00:00Z` : null, metadata: { skills: item.skills, salary: item.salary, sponsorship: item.visaSponsorship } });
  }
  for (const item of verifiedChinaCampusOpportunities) {
    const sourceId = `bootstrap-cn-${slug(item.company)}`;
    sources.set(sourceId, { id: sourceId, name: item.sourceName, official_url: item.sourceUrl, market: "china-tech", source_type: "employer", crawl_strategy: "listing", profile_scope: [item.profileId] });
    const open = ["Open", "Closing soon"].includes(item.lifecycleStatus ?? item.verificationStatus);
    opportunities.push({ id: item.id, source_id: sourceId, external_id: item.id, title: item.position, organisation: item.company, city: item.location, country: "China", location_text: item.location, employment_type: "Internship", role_family: item.roleFamily, profile_scope: [item.profileId], source_url: item.sourceUrl, apply_url: open ? item.officialApplyLink : null, lifecycle_status: open ? (item.lifecycleStatus ?? "Open") : (item.lifecycleStatus ?? "Verification required"), verification_status: open ? "Verified" : "Verification required", verification_evidence: item.verificationMethod, published_at: item.publishedDate, deadline: item.deadline, last_verified_at: open ? `${item.lastVerifiedAt}T00:00:00Z` : null, last_seen_at: `${item.lastVerifiedAt}T00:00:00Z`, metadata: { fitScore: item.fitScore } });
  }
  const { error: sourceError } = await db.from("market_sources").upsert([...sources.values()], { onConflict: "id", ignoreDuplicates: true });
  if (sourceError) throw sourceError;
  const bySourceUrl = new Map<string, Record<string, unknown>>();
  for (const opportunity of opportunities) {
    const sourceUrl = String(opportunity.source_url);
    if (!bySourceUrl.has(sourceUrl)) bySourceUrl.set(sourceUrl, opportunity);
  }
  const { error: opportunityError } = await db.from("market_opportunities").upsert([...bySourceUrl.values()], { onConflict: "id", ignoreDuplicates: true });
  if (opportunityError) throw opportunityError;
}

export function discoverOfficialLinks(html: string, baseUrl: string) {
  const results = new Map<string, { url: string; title: string }>();
  const anchor = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchor)) {
    const title = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!/(intern|graduate|software|engineer|developer|data|product|算法|开发|工程师|实习|校招)/i.test(title)) continue;
    try {
      const url = new URL(match[1], baseUrl);
      if (url.protocol !== "https:") continue;
      results.set(url.href.split("#")[0], { url: url.href.split("#")[0], title });
    } catch { /* malformed source link */ }
  }
  return [...results.values()].slice(0, 30).map((item) => ({ ...item, id: `discovered-${idFor(item.url)}` }));
}

export async function runMarketAudit(db: SupabaseClient, fetcher: typeof fetch = fetch, triggerType: "cron" | "manual" = "cron") {
  const startedAt = new Date().toISOString();
  const { data: run, error: runError } = await db.from("market_audit_runs").insert({ trigger_type: triggerType }).select("id").single();
  if (runError) throw runError;
  const summary = { checked: 0, failed: 0, discovered: 0, opened: 0, closed: 0, downgraded: 0, errors: [] as { sourceId: string; message: string }[] };
  await bootstrapMarketData(db);
  const { data: sources, error } = await db.from("market_sources").select("*").eq("enabled", true);
  if (error) throw error;
  for (const source of (sources ?? []) as MarketSourceRow[]) {
    summary.checked++;
    try {
      const response = await fetcher(source.official_url, { headers: { "user-agent": "CareerOS-Market-Audit/2.0 (+https://career-os-azure.vercel.app)" }, redirect: "follow", signal: AbortSignal.timeout(12_000) });
      const body = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await db.from("market_sources").update({ health_status: "healthy", consecutive_failures: 0, last_checked_at: startedAt, last_success_at: startedAt, last_error: null, updated_at: startedAt }).eq("id", source.id);
      if (source.crawl_strategy !== "listing") continue;
      const links = discoverOfficialLinks(body, source.official_url);
      for (const link of links) {
        const { data: existing } = await db.from("market_opportunities").select("id").eq("source_url", link.url).maybeSingle();
        if (existing) continue;
        const row = { id: link.id, source_id: source.id, external_id: idFor(link.url), title: link.title, organisation: source.name.replace(/ (official careers|Campus Recruitment|Jobs)$/i, ""), city: source.market === "china-tech" ? "China" : "Australia", country: source.market === "china-tech" ? "China" : "Australia", location_text: "Location requires verification", employment_type: /intern|实习/i.test(link.title) ? "Internship" : /graduate|校招/i.test(link.title) ? "Graduate" : "Full-time", role_family: /data|算法|ai/i.test(link.title) ? "Data / AI" : /product|产品/i.test(link.title) ? "Product" : "Software Engineering", profile_scope: source.profile_scope, source_url: link.url, lifecycle_status: "Verification required", verification_status: "Verification required", verification_evidence: "Discovered on an official source; position page awaits verification.", last_seen_at: startedAt };
        const { error: insertError } = await db.from("market_opportunities").insert(row);
        if (!insertError) { summary.discovered++; await db.from("market_verification_events").insert({ run_id: run.id, source_id: source.id, opportunity_id: link.id, event_type: "discovered", observed_status: "Verification required", evidence_type: "official-link-discovery", evidence_text: row.verification_evidence, checked_at: startedAt }); }
      }
    } catch (caught) {
      summary.failed++; const message = caught instanceof Error ? caught.message : "Unknown source error"; summary.errors.push({ sourceId: source.id, message });
      await db.from("market_sources").update({ health_status: source.consecutive_failures + 1 >= 3 ? "failed" : "degraded", consecutive_failures: source.consecutive_failures + 1, last_checked_at: startedAt, last_error: message, updated_at: startedAt }).eq("id", source.id);
      await db.from("market_verification_events").insert({ run_id: run.id, source_id: source.id, event_type: "source-failed", evidence_type: "request-failed", evidence_text: message, checked_at: startedAt });
    }
  }
  const { data: active } = await db.from("market_opportunities").select("*").in("lifecycle_status", ["Open", "Closing soon", "Verification required"]);
  for (const item of active ?? []) {
    try {
      const response = await fetcher(item.source_url, { headers: { "user-agent": "CareerOS-Market-Audit/2.0" }, redirect: "follow", signal: AbortSignal.timeout(12_000) });
      const observation = classifyMarketPage({ ok: response.ok, status: response.status, body: await response.text(), url: item.source_url, deadline: item.deadline, checkedAt: startedAt });
      const previous = item.lifecycle_status as MarketLifecycle;
      const next = observation.status;
      if (next === "Open" && previous !== "Open") summary.opened++;
      if (["Closed", "Expired"].includes(next) && !["Closed", "Expired"].includes(previous)) summary.closed++;
      if (next === "Verification required" && ["Open", "Closing soon"].includes(previous)) summary.downgraded++;
      await db.from("market_opportunities").update({ lifecycle_status: next, verification_status: next === "Open" ? "Verified" : next, verification_evidence: observation.evidenceText, apply_url: observation.applyUrl, last_seen_at: response.ok ? startedAt : item.last_seen_at, last_verified_at: next === "Open" ? startedAt : item.last_verified_at, archived_at: ["Closed", "Expired", "Archived"].includes(next) ? startedAt : null, updated_at: startedAt }).eq("id", item.id);
      await db.from("market_verification_events").insert({ run_id: run.id, source_id: item.source_id, opportunity_id: item.id, event_type: next === previous ? "unchanged" : next === "Open" ? "verified-open" : ["Closed", "Expired"].includes(next) ? "closed" : "downgraded", previous_status: previous, observed_status: next, evidence_type: observation.evidenceType, evidence_text: observation.evidenceText, http_status: response.status, checked_at: startedAt });
    } catch {
      const next = staleLifecycle(item.last_verified_at, item.lifecycle_status, startedAt);
      if (next === "Verification required") {
        summary.downgraded++;
        await db.from("market_opportunities").update({ lifecycle_status: next, verification_status: next, verification_evidence: "The position page could not be rechecked and its last positive verification is stale.", apply_url: null, updated_at: startedAt }).eq("id", item.id);
        await db.from("market_verification_events").insert({ run_id: run.id, source_id: item.source_id, opportunity_id: item.id, event_type: "downgraded", previous_status: item.lifecycle_status, observed_status: next, evidence_type: "stale-verification", evidence_text: "Open status expired after repeated inability to obtain fresh position-level application evidence.", checked_at: startedAt });
      }
    }
  }
  const verificationRequired = (active ?? []).filter((item) => item.lifecycle_status === "Verification required").length + summary.downgraded;
  const status = summary.failed === 0 ? "completed" : summary.failed < summary.checked ? "partial" : "failed";
  await db.from("market_audit_runs").update({ status, completed_at: new Date().toISOString(), sources_checked: summary.checked, sources_failed: summary.failed, discovered_count: summary.discovered, opened_count: summary.opened, closed_count: summary.closed, downgraded_count: summary.downgraded, verification_required_count: verificationRequired, error_summary: summary.errors }).eq("id", run.id);
  return { runId: run.id, status, ...summary, verificationRequired };
}

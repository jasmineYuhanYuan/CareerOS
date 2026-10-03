import { createHash } from "node:crypto";

export type SourceHealthClassification =
  | "HEALTHY"
  | "NEEDS_NEW_OFFICIAL_URL"
  | "NEEDS_SOURCE_SPECIFIC_ADAPTER"
  | "UNSUITABLE_FOR_AUTOMATION"
  | "DISCONTINUED";

export type MarketFailureType =
  | "http-error"
  | "timeout"
  | "access-restricted"
  | "robots-restricted"
  | "parse-failed"
  | "application-cta-missing"
  | "source-structure-changed"
  | "network-error";

export interface MarketAdapterContext {
  sourceId: string;
  sourceType: string;
  crawlStrategy: string;
  officialUrl: string;
}

export interface DiscoveredVacancy {
  url: string;
  title: string;
  jobId: string | null;
}

const ROLE_TERMS = /\b(intern(?:ship)?|graduate|junior|software|front[ -]?end|mobile|react(?: native)?|typescript|engineer|developer|data|product|artificial intelligence|machine learning|chiropract(?:or|ic))\b|算法|开发|工程师|实习|校招|产品|前端|客户端/i;
const NAVIGATION_TERMS = /^(about|careers?|jobs?|teams?|locations?|students?|graduates?|early careers?|products?|software|marketplace|trust|security|privacy|learn more|read more|view all)$/i;

function cleanText(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

export function extractJobId(url: string, body = ""): string | null {
  const structured = body.match(/["'](?:jobId|job_id|requisitionId|requisition_id|identifier)["']\s*:\s*["']?([A-Za-z0-9_-]{4,80})/i)?.[1];
  if (structured) return structured;
  const path = new URL(url).pathname;
  return path.match(/(?:jobs?|positions?|requisitions?|detail|intern)\/(?:[^/]+\/)*([A-Za-z0-9_-]{4,80})(?:\/|$)/i)?.[1] ?? null;
}

export function normalisedVacancyFingerprint(input: { organisation: string; title: string; location?: string | null; programme?: string | null }): string {
  const normalise = (value: string | null | undefined) => (value ?? "").toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return createHash("sha256").update([input.organisation, input.title, input.location, input.programme].map(normalise).join("|")).digest("hex").slice(0, 24);
}

export function discoverVacancyLinks(html: string, context: MarketAdapterContext): DiscoveredVacancy[] {
  if (context.crawlStrategy !== "listing") return [];
  const results = new Map<string, DiscoveredVacancy>();
  const jsonLd = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(jsonLd)) {
    try {
      const parsed: unknown = JSON.parse(match[1]);
      const values = Array.isArray(parsed) ? parsed : [parsed];
      for (const value of values) {
        if (typeof value !== "object" || value === null) continue;
        const record = value as Record<string, unknown>;
        if (record["@type"] !== "JobPosting" || typeof record.title !== "string") continue;
        const rawUrl = typeof record.url === "string" ? record.url : typeof record["@id"] === "string" ? record["@id"] : "";
        if (!rawUrl) continue;
        const url = new URL(rawUrl, context.officialUrl);
        if (url.protocol !== "https:" || url.hostname !== new URL(context.officialUrl).hostname) continue;
        const identifier = typeof record.identifier === "object" && record.identifier !== null ? (record.identifier as Record<string, unknown>).value : record.identifier;
        const jobId = typeof identifier === "string" ? identifier : extractJobId(url.href, match[1]);
        results.set(jobId ? `${url.hostname}:${jobId}` : url.href, { url: url.href, title: cleanText(record.title), jobId });
      }
    } catch { /* malformed structured data is not vacancy evidence */ }
  }
  const anchor = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchor)) {
    const title = cleanText(match[2]);
    if (title.length < 5 || title.length > 180 || NAVIGATION_TERMS.test(title) || !ROLE_TERMS.test(title)) continue;
    try {
      const url = new URL(match[1], context.officialUrl);
      if (url.protocol !== "https:" || url.hostname !== new URL(context.officialUrl).hostname) continue;
      url.hash = "";
      const jobId = extractJobId(url.href);
      const key = jobId ? `${url.hostname}:${jobId}` : url.href;
      results.set(key, { url: url.href, title, jobId });
    } catch { /* ignore malformed links */ }
  }
  return [...results.values()].slice(0, 50);
}

export function classifySourceFailure(reason: unknown, httpStatus?: number): MarketFailureType {
  if (httpStatus === 401 || httpStatus === 403 || httpStatus === 429) return "access-restricted";
  if (typeof httpStatus === "number" && httpStatus >= 400) return "http-error";
  const message = reason instanceof Error ? reason.message : String(reason);
  if (/timeout|aborted/i.test(message)) return "timeout";
  if (/robots/i.test(message)) return "robots-restricted";
  if (/parse|json|markup/i.test(message)) return "parse-failed";
  return "network-error";
}

export function freshnessWindowDays(sourceType: string, crawlStrategy: string): number {
  if (crawlStrategy === "directory" || crawlStrategy === "registration") return 30;
  if (sourceType === "job-board") return 3;
  if (sourceType === "government") return 14;
  return 7;
}

export function shouldAutoPause(consecutiveFailures: number, classification: SourceHealthClassification): boolean {
  return consecutiveFailures >= 7 && classification !== "HEALTHY";
}

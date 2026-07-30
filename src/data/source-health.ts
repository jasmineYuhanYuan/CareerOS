import { intelligenceRecords } from "@/data/intelligence";
import { australianChiropracticRegistration, canberraChiropracticEmployers, chiropracticVacancies } from "@/data/verified/chiropractic";
import { verifiedCareerOpportunities } from "@/data/verified/opportunities";
import { verifiedProgrammes } from "@/data/verified/programmes";
import type { SourceMetadata } from "@/data/verified/types";

export type SourceHealthStatus = "Current" | "Review due" | "Archived";

export interface SourceHealthEntry {
  recordId: string;
  sourceName: string;
  url: string;
  status: SourceHealthStatus;
  lastSuccessfulReview: string;
  nextReviewDate: string;
  reviewNotes: string;
}

interface SourcedRecord extends SourceMetadata {
  id: string;
}

export const allSourcedRecords: SourcedRecord[] = [
  ...verifiedCareerOpportunities,
  ...verifiedProgrammes,
  australianChiropracticRegistration,
  ...canberraChiropracticEmployers,
  ...chiropracticVacancies,
  ...intelligenceRecords,
];

export function buildSourceHealthIndex(today = "2026-07-30"): SourceHealthEntry[] {
  return allSourcedRecords.map((record) => ({
    recordId: record.id,
    sourceName: record.source,
    url: record.officialUrl,
    status: record.verificationStatus === "Archived"
      ? "Archived"
      : record.nextReviewDate < today ? "Review due" : "Current",
    lastSuccessfulReview: record.lastVerified,
    nextReviewDate: record.nextReviewDate,
    reviewNotes: record.verificationStatus === "Archived"
      ? "Historical evidence only; do not use as a current opportunity."
      : "Manual review required at or before the next review date.",
  }));
}

export function validateSourceIntegrity(records = allSourcedRecords): string[] {
  const errors: string[] = [];
  for (const record of records) {
    let url: URL | null = null;
    try {
      url = new URL(record.officialUrl);
    } catch {
      errors.push(`${record.id}: malformed source URL`);
    }
    if (url?.protocol !== "https:") errors.push(`${record.id}: source URL must use HTTPS`);
    if (!record.source.trim()) errors.push(`${record.id}: missing source name`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.lastVerified)) errors.push(`${record.id}: missing verification date`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.nextReviewDate)) errors.push(`${record.id}: missing next review date`);
    if (record.verificationStatus === "Archived" && "applicationStage" in record && record.applicationStage === "Open") {
      errors.push(`${record.id}: archived record cannot be open`);
    }
  }
  return errors;
}

export const sourceHealthIndex = buildSourceHealthIndex();

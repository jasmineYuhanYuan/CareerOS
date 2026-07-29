import type { DataConfidence, DataVerificationStatus, DatasetLanguage, VerifiedSourceType } from "@/data/verified/types";

export interface SourceInput {
  source: string;
  officialUrl: string;
  sourceType: VerifiedSourceType;
  country: string;
  region: string;
  language?: DatasetLanguage;
  confidence?: DataConfidence;
  verificationStatus?: DataVerificationStatus;
  nextReviewDate?: string;
}

export function verifiedSource(input: SourceInput) {
  return {
    source: input.source,
    officialUrl: input.officialUrl,
    sourceType: input.sourceType,
    verified: true,
    lastVerified: "2026-07-29",
    lastUpdated: "2026-07-29",
    nextReviewDate: input.nextReviewDate ?? "2026-08-29",
    country: input.country,
    language: input.language ?? "en",
    region: input.region,
    confidence: input.confidence ?? "High",
    verificationStatus: input.verificationStatus ?? "Verified",
  } as const;
}

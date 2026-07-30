import { validateSourceMetadata } from "@/data/verified/quality";
import type { IntelligenceRecord } from "./types";

function isHttps(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function validateIntelligenceRecords(records: IntelligenceRecord[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const record of records) {
    errors.push(...validateSourceMetadata(record, record.id));
    if (ids.has(record.id)) errors.push(`${record.id}: duplicate intelligence ID`);
    ids.add(record.id);
    if (!isHttps(record.officialUrl)) errors.push(`${record.id}: official URL must use HTTPS`);

    if (record.domain === "Company") {
      if (!record.name || !isHttps(record.careerPage)) errors.push(`${record.id}: invalid company record`);
    }
    if (record.domain === "Certification") {
      if (!record.provider || !record.name) errors.push(`${record.id}: invalid certification record`);
    }
    if (record.domain === "Visa") {
      if (record.sourceType !== "Government") errors.push(`${record.id}: visa source must be Government`);
      if (!record.subclass || !record.caution) errors.push(`${record.id}: invalid visa record`);
    }
    if (record.domain === "Healthcare") {
      if (!record.profession || !record.authority) errors.push(`${record.id}: invalid healthcare record`);
      if (record.salary !== null || record.demand !== null) errors.push(`${record.id}: unsupported salary or demand claim`);
    }
    if (record.domain === "Interview") {
      if (!record.company) errors.push(`${record.id}: interview company is required`);
      if ("stages" in record && record.stages.length === 0) errors.push(`${record.id}: interview stages are required`);
      if ("platform" in record && !record.platform) errors.push(`${record.id}: assessment platform is required`);
      if ("candidateGuideUrl" in record && (!isHttps(record.candidateGuideUrl) || !record.privacyUrl || !isHttps(record.privacyUrl))) {
        errors.push(`${record.id}: assessment provider requires official candidate and privacy guidance`);
      }
    }
  }
  return errors;
}

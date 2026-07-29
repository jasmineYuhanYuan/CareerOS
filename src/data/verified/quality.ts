import type {
  ProfessionalRegistrationPathway,
  SourceMetadata,
  VerifiedCareerOpportunity,
  VerifiedEmployerDirectoryRecord,
  VerifiedProgramme,
} from "./types";

function validIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

function validOfficialUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !["example.com", "localhost"].includes(url.hostname);
  } catch {
    return false;
  }
}

function metadataErrors(record: SourceMetadata, id: string): string[] {
  const errors: string[] = [];
  if (!record.verified) errors.push(`${id}: verified must be true`);
  if (!record.source.trim()) errors.push(`${id}: source is required`);
  if (!validOfficialUrl(record.officialUrl)) errors.push(`${id}: officialUrl must be a valid HTTPS source`);
  if (!validIsoDate(record.lastUpdated)) errors.push(`${id}: invalid lastUpdated`);
  if (!validIsoDate(record.nextReviewDate) || record.nextReviewDate <= record.lastUpdated) errors.push(`${id}: nextReviewDate must follow lastUpdated`);
  if (!record.country || !record.region || !record.language) errors.push(`${id}: geography and language are required`);
  if (record.confidence === "High" && record.sourceType === "Community") errors.push(`${id}: community-only records cannot have High confidence`);
  return errors;
}

export function validateVerifiedOpportunities(records: VerifiedCareerOpportunity[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const record of records) {
    errors.push(...metadataErrors(record, record.id));
    if (ids.has(record.id)) errors.push(`${record.id}: duplicate ID`);
    ids.add(record.id);
    if (!record.title || !record.company || !record.city || !record.careersUrl) errors.push(`${record.id}: missing required career fields`);
    if (!validOfficialUrl(record.careersUrl)) errors.push(`${record.id}: invalid careersUrl`);
    if (record.deadline && !validIsoDate(record.deadline)) errors.push(`${record.id}: invalid deadline`);
    if (record.applicationStage === "Open" && record.deadline && record.deadline < record.lastUpdated) errors.push(`${record.id}: open record has a past deadline`);
  }
  return errors;
}

export function validateVerifiedProgrammes(records: VerifiedProgramme[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const record of records) {
    errors.push(...metadataErrors(record, record.id));
    if (ids.has(record.id)) errors.push(`${record.id}: duplicate ID`);
    ids.add(record.id);
    if (!record.university || !record.degree || !record.city) errors.push(`${record.id}: missing required programme fields`);
    if (record.deadline && !validIsoDate(record.deadline)) errors.push(`${record.id}: invalid deadline`);
  }
  return errors;
}

export function validateRegistrationPathway(record: ProfessionalRegistrationPathway): string[] {
  const errors = metadataErrors(record, record.id);
  if (!record.profession || !record.regulator || !record.administrationBody) errors.push(`${record.id}: missing registration authority`);
  if (!record.registrationRequired) errors.push(`${record.id}: regulated pathway must explicitly require registration`);
  if (!validOfficialUrl(record.applicationPortalUrl)) errors.push(`${record.id}: invalid application portal`);
  if (record.requirements.length === 0) errors.push(`${record.id}: requirements are required`);
  for (const requirement of record.requirements) {
    if (!requirement.label || !requirement.detail || !validOfficialUrl(requirement.sourceUrl)) {
      errors.push(`${record.id}: invalid sourced requirement`);
    }
  }
  return errors;
}

export function validateEmployerDirectory(records: VerifiedEmployerDirectoryRecord[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const record of records) {
    errors.push(...metadataErrors(record, record.id));
    if (ids.has(record.id)) errors.push(`${record.id}: duplicate ID`);
    ids.add(record.id);
    if (!record.organisationName || !record.suburb || !record.stateOrTerritory) errors.push(`${record.id}: missing employer fields`);
    if (!validOfficialUrl(record.website)) errors.push(`${record.id}: invalid employer website`);
    if (record.careersPage && !validOfficialUrl(record.careersPage)) errors.push(`${record.id}: invalid careers page`);
  }
  return errors;
}

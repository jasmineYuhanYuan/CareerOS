import { TOMMY_ID, YUHAN_ID } from "@/data/seed";
import type { CareerProfile, Job, Opportunity } from "@/types/domain";

const TECH_DOMAIN = /software|engineer|developer|frontend|backend|full.?stack|\bdata\b|\bai\b|artificial intelligence|product|digital stream|technology|computer science|coding/i;
const CHIROPRACTIC_DOMAIN = /chiropract|clinical|clinic|ahpra|chiropractic board|professional registration/i;

function opportunityText(opportunity: Opportunity): string {
  return [
    opportunity.title,
    opportunity.description,
    ...opportunity.disciplineTags,
    ...opportunity.roleFamilyTags,
    ...opportunity.skillTags,
    opportunity.eligibilityText ?? "",
  ].join(" ");
}

/** A domain eligibility gate. Call this before scoring, sorting, or counting. */
export function isOpportunityRelevantToProfile(
  profile: CareerProfile,
  opportunity: Opportunity,
): boolean {
  if (!opportunity.suitableProfileIds.includes(profile.id)) return false;
  const text = opportunityText(opportunity);
  if (profile.id === TOMMY_ID) {
    return CHIROPRACTIC_DOMAIN.test(text) && !TECH_DOMAIN.test(text);
  }
  if (profile.id === YUHAN_ID) return !CHIROPRACTIC_DOMAIN.test(text);
  return true;
}

export function isJobRelevantToProfile(
  profile: CareerProfile,
  job: Job,
): boolean {
  if (!job.suitableProfileIds.includes(profile.id)) return false;
  const text = [
    job.title,
    job.roleFamily,
    job.discipline,
    job.description,
    ...job.tags,
    ...job.requirements,
  ].join(" ");
  if (profile.id === TOMMY_ID) {
    return CHIROPRACTIC_DOMAIN.test(text) && !TECH_DOMAIN.test(text);
  }
  if (profile.id === YUHAN_ID) return !CHIROPRACTIC_DOMAIN.test(text);
  return true;
}

export function getEligibleOpportunities(
  profile: CareerProfile,
  records: Opportunity[],
): Opportunity[] {
  return records.filter((item) => isOpportunityRelevantToProfile(profile, item));
}

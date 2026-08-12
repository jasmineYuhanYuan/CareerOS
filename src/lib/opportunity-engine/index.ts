import { verifiedChinaCampusOpportunities } from "@/data/china-recruiting/verified-opportunities";
import { verifiedCareerOpportunities } from "@/data/verified/opportunities";
import {
  canberraChiropracticEmployers,
  chiropracticVacancies,
} from "@/data/verified/chiropractic";
import { TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { deriveOpportunityLifecycle } from "@/lib/opportunity-lifecycle";
import type { CareerProfile, ProfileWorkspace } from "@/types/domain";
import type {
  DailyCareerAction,
  DailyOpportunity,
  DailyOpportunityStatus,
  DataFreshness,
  RecommendedAction,
} from "@/types/opportunity";

function freshness(verifiedAt: string, today: string): DataFreshness {
  const days = Math.floor(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${verifiedAt}T00:00:00Z`)) /
      86_400_000,
  );
  return days <= 7 ? "fresh" : days <= 14 ? "reviewSoon" : "stale";
}

function statusFromLifecycle(value: string): DailyOpportunityStatus {
  if (value === "Open") return "active";
  if (value === "Closing soon") return "closingSoon";
  if (value === "Upcoming") return "upcoming";
  if (value === "Archived") return "archived";
  return "closed";
}

function actionFor(
  status: DailyOpportunityStatus,
  score: number,
): RecommendedAction {
  if (status === "closingSoon") return "applyNow";
  if (status === "active")
    return score >= 80 ? "applyNow" : score >= 65 ? "applySoon" : "lowPriority";
  if (status === "upcoming" || status === "prospect") return "monitor";
  return "skip";
}

function profileMatch(
  profile: CareerProfile,
  skills: string[],
  country: string,
): { score: number; reasons: string[] } {
  const profileSkills = profile.skills.map((item) => item.name.toLowerCase());
  const overlaps = skills.filter((skill) =>
    profileSkills.some(
      (value) =>
        skill.toLowerCase().includes(value) ||
        value.includes(skill.toLowerCase()),
    ),
  );
  const location =
    country === "China" ||
    profile.preferredCities.some(
      (city) => country.includes(city) || city.includes(country),
    );
  const score = Math.min(95, 55 + overlaps.length * 10 + (location ? 10 : 0));
  return {
    score,
    reasons: [
      ...overlaps.slice(0, 3).map((skill) => `${skill} evidence in profile`),
      location
        ? "Preferred market alignment"
        : "Location requires confirmation",
    ],
  };
}

export function getDailyOpportunities(
  profile: CareerProfile,
  today = new Date().toISOString().slice(0, 10),
): DailyOpportunity[] {
  if (profile.id === TOMMY_ID) {
    const vacancies = chiropracticVacancies.map((item): DailyOpportunity => ({
      id: item.id,
      profileScope: [TOMMY_ID],
      company: item.employer,
      roleTitle: item.exactTitle,
      location: item.location,
      country: "Australia",
      employmentType: item.employmentType,
      graduateYear: null,
      applicationStatus:
        item.vacancyStatus === "Current" ? "active" : "archived",
      sourceUrl: item.applicationUrl,
      sourceType: item.sourceType,
      dateVerified: item.lastVerified,
      dateOpened: item.publicationDate,
      deadline: item.closingDate,
      salary: item.salary,
      visaRequirement: null,
      sponsorship: null,
      matchScore: item.vacancyStatus === "Current" ? 80 : 0,
      matchReasons: [
        "Chiropractic role",
        "Location evaluated against Tommy preferences",
      ],
      recommendedAction: item.vacancyStatus === "Current" ? "applyNow" : "skip",
      notes: item.dataNotes,
      sourceEvidence: item.source,
      dataFreshness: freshness(item.lastVerified, today),
    }));
    const prospects = canberraChiropracticEmployers.map(
      (item): DailyOpportunity => ({
        id: `prospect-${item.id}`,
        profileScope: [TOMMY_ID],
        company: item.organisationName,
        roleTitle: "Clinic outreach prospect",
        location: `${item.suburb}, ${item.stateOrTerritory}`,
        country: "Australia",
        employmentType: "Prospect",
        graduateYear: null,
        applicationStatus: "prospect",
        sourceUrl: item.website,
        sourceType: item.sourceType,
        dateVerified: item.lastVerified,
        dateOpened: null,
        deadline: null,
        salary: null,
        visaRequirement: null,
        sponsorship: null,
        matchScore: 65,
        matchReasons: [
          "Canberra or nearby clinic",
          "Official employer website verified",
        ],
        recommendedAction: "monitor",
        notes: item.dataNotes,
        sourceEvidence: item.source,
        dataFreshness: freshness(item.lastVerified, today),
      }),
    );
    return [...vacancies, ...prospects];
  }

  const australia = verifiedCareerOpportunities
    .filter(
      (item) =>
        item.country === "Australia" &&
        (item.profileScope ?? [YUHAN_ID]).includes(profile.id),
    )
    .map((item): DailyOpportunity => {
      const lifecycle = deriveOpportunityLifecycle(item, today);
      const match = profileMatch(profile, item.skills, item.country);
      const status = statusFromLifecycle(lifecycle);
      return {
        id: item.id,
        profileScope: item.profileScope ?? [YUHAN_ID],
        company: item.company,
        roleTitle: item.title,
        location: item.city,
        country: item.country,
        employmentType: item.employmentType,
        graduateYear: item.graduationCohort ?? null,
        applicationStatus: status,
        sourceUrl: item.officialApplyUrl ?? item.officialUrl,
        sourceType: item.sourceType,
        dateVerified: item.lastVerified,
        dateOpened: item.openingDate ?? item.publishedDate ?? null,
        deadline: item.deadline,
        salary: item.salary,
        visaRequirement: item.visaStatement ?? null,
        sponsorship: item.visaSponsorship,
        matchScore: match.score,
        matchReasons: match.reasons,
        recommendedAction: actionFor(status, match.score),
        notes: item.source,
        sourceEvidence: item.source,
        dataFreshness: freshness(item.lastVerified, today),
      };
    });
  const china = verifiedChinaCampusOpportunities
    .filter((item) => item.profileId === profile.id)
    .map((item): DailyOpportunity => ({
      id: item.id,
      profileScope: [item.profileId],
      company: item.company,
      roleTitle: item.position,
      location: item.location,
      country: "China",
      employmentType: "Internship",
      graduateYear: item.targetGraduationYear,
      applicationStatus: statusFromLifecycle(item.verificationStatus),
      sourceUrl: item.officialApplyLink,
      sourceType: item.sourceType,
      dateVerified: item.lastVerifiedAt,
      dateOpened: item.publishedDate,
      deadline: item.deadline,
      salary: null,
      visaRequirement: null,
      sponsorship: null,
      matchScore: item.fitScore,
      matchReasons: [
        `${item.roleFamily} goal alignment`,
        `${item.location} opportunity`,
      ],
      recommendedAction: actionFor(
        statusFromLifecycle(item.verificationStatus),
        item.fitScore,
      ),
      notes: item.notes,
      sourceEvidence: item.sourceName,
      dataFreshness: freshness(item.lastVerifiedAt, today),
    }));
  return [...australia, ...china];
}

export const getActiveJobs = (records: DailyOpportunity[]) =>
  records.filter(
    (item) =>
      item.applicationStatus === "active" && item.dataFreshness !== "stale",
  );
export const getClosingSoonJobs = (records: DailyOpportunity[]) =>
  records.filter(
    (item) =>
      item.applicationStatus === "closingSoon" &&
      item.dataFreshness !== "stale",
  );
export const getUpcomingJobs = (records: DailyOpportunity[]) =>
  records.filter((item) => item.applicationStatus === "upcoming");
export const getRecommendedJobs = (profile: CareerProfile, today?: string) =>
  getDailyOpportunities(profile, today)
    .filter(
      (item) =>
        ["applyNow", "applySoon"].includes(item.recommendedAction) &&
        item.dataFreshness !== "stale",
    )
    .sort((a, b) => b.matchScore - a.matchScore);
export const archiveExpiredJobs = (
  records: DailyOpportunity[],
  today: string,
) =>
  records.map((item) =>
    item.deadline && item.deadline < today
      ? {
          ...item,
          applicationStatus: "archived" as const,
          recommendedAction: "skip" as const,
        }
      : item,
  );

export function getDailyCareerActions(
  workspace: ProfileWorkspace,
  today?: string,
): DailyCareerAction[] {
  const records = getDailyOpportunities(workspace.profile, today);
  return [
    {
      id: "apply",
      type: "apply",
      label: "Jobs to apply",
      count: getRecommendedJobs(workspace.profile, today).length,
      href: "/opportunities",
    },
    {
      id: "closing",
      type: "closing",
      label: "Jobs closing soon",
      count: getClosingSoonJobs(records).length,
      href: "/recruitment-calendar",
    },
    {
      id: "resume",
      type: "resume",
      label: "Resume updates needed",
      count: workspace.documents.some((item) => item.status === "Ready")
        ? 0
        : 1,
      href: "/documents",
    },
    {
      id: "follow-up",
      type: "followUp",
      label: "Follow-ups",
      count: workspace.contacts.filter(
        (item) =>
          item.nextFollowUpDate &&
          item.nextFollowUpDate <=
            (today ?? new Date().toISOString().slice(0, 10)),
      ).length,
      href: "/contacts",
    },
  ];
}

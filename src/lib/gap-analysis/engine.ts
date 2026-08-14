import { TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { australianChiropracticRegistration } from "@/data/verified/chiropractic";
import { verifiedCareerOpportunities } from "@/data/verified/opportunities";
import { verifiedProgrammes } from "@/data/verified/programmes";
import { deriveOpportunityLifecycle } from "@/lib/opportunity-lifecycle";
import { documentIsReady, resumeEvidence } from "@/lib/document-evidence";
import type { ProfileWorkspace } from "@/types/domain";
import type {
  CareerRequirement,
  GapAction,
  GapAnalysisResult,
  GapStatus,
  RequirementImportance,
} from "./types";

export interface GapTarget {
  id: string;
  name: string;
  profileIds: string[];
  kind: "occupation" | "opportunity" | "programme";
  sourceId: string;
}

export const gapTargets: GapTarget[] = [
  { id: "occupation:chiropractor", name: "Chiropractor — Australian registration pathway", profileIds: [TOMMY_ID], kind: "occupation", sourceId: australianChiropracticRegistration.id },
  ...verifiedCareerOpportunities
    .filter((record) => ["Atlassian", "Baidu", "ByteDance"].includes(record.company))
    .map((record): GapTarget => ({ id: `opportunity:${record.id}`, name: `${record.company} — ${record.title}`, profileIds: [YUHAN_ID], kind: "opportunity", sourceId: record.id })),
  ...verifiedProgrammes.map((record): GapTarget => ({ id: `programme:${record.id}`, name: `${record.university} — ${record.degree}`, profileIds: [YUHAN_ID], kind: "programme", sourceId: record.id })),
];

const weights: Record<RequirementImportance, number> = {
  required: 4,
  "strongly-preferred": 3,
  helpful: 2,
  informational: 1,
};

const valueByStatus: Record<GapStatus, number> = {
  confirmed: 1,
  unknown: 0.5,
  missing: 0,
  blocked: 0,
};

function requirement(
  id: string,
  label: string,
  importance: RequirementImportance,
  status: GapStatus,
  explanation: string,
  evidenceSourceIds: string[],
): CareerRequirement {
  return { id, label, importance, status, explanation, evidenceSourceIds };
}

function hasDocument(workspace: ProfileWorkspace, matcher: RegExp): boolean {
  return workspace.documents.some(
    (document) => documentIsReady(document)
      && matcher.test(`${document.name} ${document.documentType}`),
  );
}

function eligibilityStatus(value: string): GapStatus {
  if (!value.trim() || /confirm|unknown|not recorded/i.test(value)) return "unknown";
  if (/blocked|ineligible|not eligible|not registered|refused|expired/i.test(value)) return "blocked";
  return "confirmed";
}

function tommyRequirements(workspace: ProfileWorkspace): CareerRequirement[] {
  const profile = workspace.profile;
  const source = [`source:${australianChiropracticRegistration.id}`];
  const registration = eligibilityStatus(profile.registrationStatus);
  const workRights = eligibilityStatus(profile.workEligibility);
  return [
    requirement("qualification", "Approved chiropractic qualification completion", "required", "unknown", profile.expectedGraduationDate ? `An expected date of ${profile.expectedGraduationDate} is recorded, but expected timing does not prove completion.` : "Course completion is not recorded. The Board pathway requires completion of an approved program.", source),
    requirement("registration", "Ahpra registration eligibility and status", "required", registration, registration === "confirmed" ? profile.registrationStatus : registration === "blocked" ? `The stored status requires resolution: ${profile.registrationStatus}.` : "Registration status is not recorded and must be confirmed before practice.", source),
    requirement("work-eligibility", "Australian work eligibility", "required", workRights, workRights === "confirmed" ? profile.workEligibility : workRights === "blocked" ? `The stored work status requires resolution: ${profile.workEligibility}.` : "Work eligibility is not recorded. This is not treated as a failure.", source),
    requirement("english-evidence", "English-language evidence pathway", "required", "unknown", "The applicable English-language evidence pathway is not recorded.", source),
    requirement("clinical-resume", "Clinical résumé", "strongly-preferred", hasDocument(workspace, /résumé|resume|cv/i) ? "confirmed" : "missing", "No ready clinical résumé is recorded in the current profile workspace.", source),
    requirement("placement-summary", "Clinical placement summary", "strongly-preferred", "unknown", "Placement details, techniques and patient experience are not stored.", source),
    requirement("referees", "Clinical referee list", "strongly-preferred", "missing", "No referee list is recorded.", source),
    requirement("interview-readiness", "Clinical interview preparation", "helpful", workspace.roadmapItems.some((item) => item.category === "Interview" && item.status === "Completed") ? "confirmed" : "missing", "Use the professional-guidance questions already stored in CareerOS.", source),
    requirement("canberra-outreach", "Canberra employer outreach", "helpful", workspace.contacts.length > 0 ? "confirmed" : "missing", "The verified clinic directory is an outreach list, not a list of current vacancies.", source),
  ];
}

function yuhanRequirements(workspace: ProfileWorkspace): CareerRequirement[] {
  const profile = workspace.profile;
  const source = ["source:atlassian-au-intern-program"];
  const workRights = eligibilityStatus(profile.workEligibility);
  const hasTechnicalEvidence = profile.skills.some((skill) =>
    ["typescript", "react"].includes(skill.name.toLowerCase()) && Boolean(skill.evidence.trim()),
  );
  return [
    requirement("education", "Computer Science education", "required", profile.degree && profile.university ? "confirmed" : "unknown", profile.degree && profile.university ? `${profile.degree} at ${profile.university} is stored.` : "Education is not fully recorded.", source),
    requirement("study-timing", "Graduation and study timing", "required", profile.expectedGraduationDate ? "confirmed" : "unknown", "A target's student-year eligibility cannot be confirmed without a graduation date.", source),
    requirement("work-eligibility", "Australian work eligibility", "required", workRights, workRights === "confirmed" ? profile.workEligibility : workRights === "blocked" ? `The stored work status requires resolution: ${profile.workEligibility}.` : "Work rights and citizenship are not stored.", source),
    requirement("technical-evidence", "Technical skill evidence", "strongly-preferred", hasTechnicalEvidence ? "confirmed" : "missing", hasTechnicalEvidence ? "TypeScript or React evidence is stored in the profile." : "No verified technical evidence is stored.", source),
    requirement("projects", "Relevant project evidence", "strongly-preferred", profile.projects.length > 0 ? "confirmed" : "missing", `${profile.projects.length} project record(s) are stored; scope and role may still need detail.`, source),
    requirement("internship", "Prior internship or work experience", "helpful", "unknown", "The profile does not verify internship experience.", source),
    requirement("application-materials", "Ready résumé and application materials", "strongly-preferred", hasDocument(workspace, /résumé|resume|cv/i) ? "confirmed" : "missing", "No ready résumé is recorded in the document tracker.", source),
    requirement("interview-readiness", "Interview readiness", "helpful", workspace.roadmapItems.some((item) => item.category === "Interview" && item.status === "Completed") ? "confirmed" : "unknown", "Interview readiness has not been confirmed.", source),
  ];
}

function opportunityRequirements(workspace: ProfileWorkspace, sourceId: string): CareerRequirement[] {
  const record = verifiedCareerOpportunities.find((item) => item.id === sourceId);
  if (!record) return [];
  const profile = workspace.profile;
  const source = [`source:${record.id}`];
  const lifecycle = deriveOpportunityLifecycle(record, "2026-07-30");
  const workRights = eligibilityStatus(profile.workEligibility);
  const profileEvidence = new Set([
    ...profile.skills.map((skill) => skill.name.toLowerCase()),
    ...profile.projects.flatMap((project) => project.competencies.map((skill) => skill.toLowerCase())),
    ...resumeEvidence(workspace.documents),
  ]);
  const requirements: CareerRequirement[] = [
    requirement("target-lifecycle", "Opportunity is accepting or preparing for applications", "required", ["Closed", "Expired", "Archived"].includes(lifecycle) ? "blocked" : lifecycle === "Verification required" ? "unknown" : "confirmed", `Verified lifecycle: ${lifecycle}.`, source),
    requirement("work-eligibility", "Work eligibility for this employer and location", "required", workRights, workRights === "unknown" ? "Work eligibility is not stored and the source does not establish individual eligibility." : profile.workEligibility, source),
    requirement("graduation-window", "Published graduation or study-stage eligibility", "required", profile.expectedGraduationDate ? "confirmed" : "unknown", profile.expectedGraduationDate ? `Expected graduation is recorded as ${profile.expectedGraduationDate}; compare it with: ${record.eligibility.join("; ")}.` : `Graduation date is unknown. Published eligibility: ${record.eligibility.join("; ")}.`, source),
    requirement("preferred-location", `${record.city} location preference`, "helpful", profile.preferredCities.some((city) => record.city.toLowerCase().includes(city.toLowerCase())) ? "confirmed" : "missing", `${record.city} is the published location.`, source),
    requirement("application-materials", "Ready résumé and application materials", "strongly-preferred", hasDocument(workspace, /résumé|resume|cv/i) ? "confirmed" : "missing", "Only a document marked Ready or Submitted counts as prepared.", source),
  ];
  for (const skill of record.skills) {
    const matched = Array.from(profileEvidence).some((evidence) =>
      evidence.includes(skill.toLowerCase()) || skill.toLowerCase().includes(evidence),
    );
    const inResume = resumeEvidence(workspace.documents).has(skill.toLowerCase());
    requirements.push(requirement(`skill-${skill.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, skill, "strongly-preferred", matched ? "confirmed" : "missing", matched ? `${inResume ? "Resume" : "Profile or project"} evidence overlaps this published skill.` : "No matching profile, resume, or project evidence.", source));
  }
  if (/citizen/i.test(record.eligibility.join(" "))) {
    requirements.push(requirement("citizenship", "Australian citizenship", "required", /australian citizen/i.test(profile.workEligibility) ? "confirmed" : /not.*citizen/i.test(profile.workEligibility) ? "blocked" : "unknown", "The official opportunity source explicitly requires Australian citizenship.", source));
  }
  return requirements;
}

function programmeRequirements(workspace: ProfileWorkspace, sourceId: string): CareerRequirement[] {
  const record = verifiedProgrammes.find((item) => item.id === sourceId);
  if (!record) return [];
  const profile = workspace.profile;
  const source = [`source:${record.id}`];
  return [
    requirement("prior-degree", "Published prior-degree entry requirement", "required", profile.degree ? "unknown" : "missing", profile.degree ? `${profile.degree} is stored, but equivalence and weighted-average requirements still require university assessment.` : "No prior degree is stored.", source),
    requirement("academic-threshold", "Academic average or pathway requirement", "required", "unknown", record.entryRequirements.join("; "), source),
    requirement("english-requirement", "English-language requirement", "required", "unknown", record.ielts ?? "The official course page did not publish a complete IELTS value in this dataset.", source),
    requirement("programme-location", `${record.city} study location`, "helpful", profile.preferredCities.some((city) => record.city.toLowerCase().includes(city.toLowerCase())) ? "confirmed" : "missing", `${record.city} is the verified programme location.`, source),
    requirement("application-deadline", "Current application deadline", "informational", record.deadline ? "confirmed" : "unknown", record.deadline ?? "No current deadline is verified.", source),
  ];
}

function actionFor(item: CareerRequirement): GapAction {
  const verification = item.status === "unknown";
  return {
    id: `action-${item.id}`,
    title: verification ? `Confirm ${item.label}` : `Prepare ${item.label}`,
    reason: item.explanation,
    relatedGapId: item.id,
    priority: item.importance === "required" ? "High" : item.importance === "strongly-preferred" ? "Medium" : "Low",
    estimatedEffort: verification ? "Short confirmation task" : "Depends on existing materials",
    evidenceSourceIds: item.evidenceSourceIds,
    status: "Not started",
    window: item.importance === "required" ? "Immediate" : item.importance === "strongly-preferred" ? "Next 30 days" : "Next 3 months",
    dueDate: "",
    notes: "No deadline has been inferred. Assign a target date in the roadmap if useful.",
  };
}

export function analyseCareerGap(
  workspace: ProfileWorkspace,
  targetId: string,
): GapAnalysisResult {
  const target = gapTargets.find((item) => item.id === targetId)
    ?? gapTargets.find((item) => item.profileIds.includes(workspace.profile.id))
    ?? gapTargets[0];
  const requirements = target.kind === "opportunity"
    ? opportunityRequirements(workspace, target.sourceId)
    : target.kind === "programme"
      ? programmeRequirements(workspace, target.sourceId)
      : workspace.profile.id === TOMMY_ID
        ? tommyRequirements(workspace)
        : yuhanRequirements(workspace);
  const totalWeight = requirements.reduce((sum, item) => sum + weights[item.importance], 0);
  const earnedWeight = requirements.reduce(
    (sum, item) => sum + weights[item.importance] * valueByStatus[item.status],
    0,
  );
  const requiredUnknown = requirements.filter(
    (item) => item.importance === "required" && item.status === "unknown",
  ).length;
  const requiredFailure = requirements.some(
    (item) => item.importance === "required" && ["missing", "blocked"].includes(item.status),
  );
  const rawScore = Math.round((earnedWeight / totalWeight) * 100);
  const cap = requiredFailure ? 45 : requiredUnknown >= 2 ? 64 : requiredUnknown === 1 ? 79 : 100;
  const overallReadinessScore = Math.min(rawScore, cap);
  const unknownCount = requirements.filter((item) => item.status === "unknown").length;
  const confidence = unknownCount >= 3 ? "Low" : unknownCount > 0 ? "Medium" : "High";

  return {
    profileId: workspace.profile.id,
    targetId: target.id,
    targetName: target.name,
    overallReadinessScore,
    confidence,
    matchedRequirements: requirements.filter((item) => item.status === "confirmed"),
    missingRequirements: requirements.filter((item) => item.status === "missing"),
    unknownRequirements: requirements.filter((item) => item.status === "unknown"),
    blockers: requirements.filter((item) =>
      item.status === "blocked"
      || (item.importance === "required" && item.status !== "confirmed"),
    ),
    recommendedNextActions: requirements
      .filter((item) => item.status !== "confirmed")
      .map(actionFor)
      .sort((a, b) => ({ High: 0, Medium: 1, Low: 2 })[a.priority] - ({ High: 0, Medium: 1, Low: 2 })[b.priority]),
    evidenceSourceIds: Array.from(new Set(requirements.flatMap((item) => item.evidenceSourceIds))),
    evidenceCount: requirements.filter((item) => item.status === "confirmed").length,
    unknownCount,
    scoreCap: cap,
    scoreCapReason: requiredFailure
      ? "At least one required fact is missing or blocked."
      : requiredUnknown
        ? `${requiredUnknown} required fact(s) remain unknown.`
        : "No score cap is currently applied.",
    scoreExplanation: [
      "Required items carry weight 4, strongly preferred 3, helpful 2 and informational 1.",
      "Confirmed items receive full weight, unknown items half weight, and missing or blocked items no weight.",
      `The score is capped at ${cap}% because required confirmations must remain visible.`,
      "This is a deterministic planning score, not a hiring prediction.",
    ],
  };
}

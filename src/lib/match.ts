import type { CareerProfile, Job, MatchResult, PostgraduateProgram } from "@/types/domain";
import { isJobRelevantToProfile } from "@/lib/profile-eligibility";

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function includesRelated(values: string[], target: string): boolean {
  const normalTarget = normalise(target);
  return values.some((value) => {
    const normalValue = normalise(value);
    return normalValue.includes(normalTarget) || normalTarget.includes(normalValue);
  });
}

export function isJobSuitableForProfile(job: Job, profile: CareerProfile): boolean {
  return isJobRelevantToProfile(profile, job);
}

export function calculateJobMatch(job: Job, profile: CareerProfile): MatchResult {
  let score = 10;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (job.suitableProfileIds.includes(profile.id)) {
    score += 20;
    strengths.push("Included in this profile’s sample opportunity set");
  }
  if (includesRelated(profile.careerGoals, job.roleFamily) || includesRelated(profile.careerGoals, job.title)) {
    score += 25;
    strengths.push("Role aligns with a stated career goal");
  } else {
    gaps.push("Role family is not yet a stated career goal");
  }
  if (normalise(profile.discipline) === normalise(job.discipline)) {
    score += 20;
    strengths.push("Discipline alignment");
  } else {
    gaps.push("Discipline alignment is unclear");
  }
  if (
    normalise(job.location).includes(normalise(profile.location)) ||
    profile.preferredCities.some((city) => normalise(city) === normalise(job.location)) ||
    normalise(profile.location) === normalise(job.country)
  ) {
    score += 10;
    strengths.push("Location fits current preferences");
  }
  const profileSkills = profile.skills.map((skill) => skill.name);
  const overlaps = job.preferredSkills.filter((skill) => includesRelated(profileSkills, skill));
  score += Math.min(15, overlaps.length * 5);
  if (overlaps.length) strengths.push(`Skill overlap: ${overlaps.join(", ")}`);
  else gaps.push("Add evidence for the preferred skills");

  const chiropracticRole = normalise(job.discipline).includes("chiropractic") || normalise(job.title).includes("chiropract");
  const registrationUnknown = chiropracticRole && (!profile.registrationStatus || normalise(profile.registrationStatus).includes("to be confirmed"));
  const workEligibilityUnknown = !profile.workEligibility || normalise(profile.workEligibility).includes("to be confirmed");
  if (registrationUnknown) gaps.push("Registration status must be confirmed");
  if (workEligibilityUnknown) gaps.push("Work eligibility must be confirmed");
  if (registrationUnknown || workEligibilityUnknown) score = Math.min(score, 75);

  return {
    score: Math.min(100, score),
    strengths,
    gaps,
    explanation: "A deterministic planning estimate based on goals, discipline, location and recorded skills—not an employer assessment.",
  };
}

export function calculateProgramMatch(
  program: PostgraduateProgram,
  profile: CareerProfile,
): number {
  let score = program.suitableProfileIds.includes(profile.id) ? 55 : 20;
  if (includesRelated(profile.careerGoals, "Postgraduate study")) score += 15;
  if (
    includesRelated([program.discipline], profile.discipline) ||
    includesRelated(profile.careerGoals, program.discipline)
  ) score += 20;
  if (program.country === profile.location) score += 10;
  return Math.min(100, score);
}

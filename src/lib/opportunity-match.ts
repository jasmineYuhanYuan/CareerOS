import type { CareerProfile, MatchDimension, MatchResult, Opportunity } from "@/types/domain";

function includesLoose(values: string[], target: string): boolean {
  const normalised = target.toLowerCase();
  return values.some((value) => value.toLowerCase().includes(normalised) || normalised.includes(value.toLowerCase()));
}

export function calculateOpportunityMatch(opportunity: Opportunity, profile: CareerProfile): MatchResult {
  const profileSkills = profile.skills.map((skill) => skill.name.toLowerCase());
  const matchingSkills = opportunity.skillTags.filter((skill) => profileSkills.includes(skill.toLowerCase()));
  const missingSkills = opportunity.skillTags.filter((skill) => !profileSkills.includes(skill.toLowerCase()));
  const goalMatch = opportunity.roleFamilyTags.some((tag) => includesLoose(profile.careerGoals, tag));
  const disciplineMatch = opportunity.disciplineTags.some((tag) => includesLoose([profile.discipline], tag));
  const locationMatch = includesLoose(profile.preferredCities, opportunity.city) || opportunity.remoteType === "Remote";
  const projectTerms = profile.projects.flatMap((project) => [project.name, project.description, ...project.competencies]);
  const relevantProjects = opportunity.skillTags.filter((skill) => includesLoose(projectTerms, skill));
  const eligibilityKnown = Boolean(profile.workEligibility && !profile.workEligibility.toLowerCase().includes("confirm"));
  const suitableType = opportunity.suitableProfileIds.includes(profile.id);

  const dimensions: MatchDimension[] = [
    { name: "Goal alignment", score: goalMatch ? 100 : 40, weight: 0.2, evidence: goalMatch ? ["Opportunity family aligns with a stated career goal"] : [], uncertainty: goalMatch ? "" : "Goal wording does not directly match the opportunity." },
    { name: "Discipline alignment", score: disciplineMatch ? 100 : 20, weight: 0.2, evidence: disciplineMatch ? [`${profile.discipline} aligns with an opportunity discipline`] : [], uncertainty: disciplineMatch ? "" : "Discipline alignment is not explicit." },
    { name: "Skill overlap", score: opportunity.skillTags.length ? Math.round(matchingSkills.length / opportunity.skillTags.length * 100) : null, weight: 0.2, evidence: matchingSkills.map((skill) => `${skill} appears in the profile`), uncertainty: opportunity.skillTags.length ? "" : "No structured skill requirements are available." },
    { name: "Location alignment", score: locationMatch ? 100 : 35, weight: 0.1, evidence: locationMatch ? [`${opportunity.locationText} aligns with location preferences or remote work`] : [], uncertainty: locationMatch ? "" : "Location preference may need review." },
    { name: "Experience/project relevance", score: relevantProjects.length ? 85 : profile.projects.length ? 45 : null, weight: 0.1, evidence: relevantProjects.map((skill) => `Project evidence relates to ${skill}`), uncertainty: profile.projects.length ? "Project descriptions may not contain every relevant competency." : "No project evidence is recorded." },
    { name: "Eligibility confidence", score: eligibilityKnown && opportunity.eligibilityText ? 75 : null, weight: 0.1, evidence: eligibilityKnown ? ["Work eligibility is recorded"] : [], uncertainty: opportunity.eligibilityText ? "Eligibility still requires source confirmation." : "Eligibility requirements are unavailable." },
    { name: "Opportunity type preference", score: suitableType ? 100 : 40, weight: 0.1, evidence: suitableType ? ["Curated suitability includes this profile"] : [], uncertainty: suitableType ? "" : "This opportunity type is not explicitly preferred." },
  ];
  const scored = dimensions.filter((item): item is MatchDimension & { score: number } => item.score !== null);
  const totalWeight = scored.reduce((sum, item) => sum + item.weight, 0);
  const score = totalWeight ? Math.round(scored.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight) : 0;
  const informationCount = dimensions.filter((item) => item.score !== null).length;
  const confidence = informationCount >= 6 && opportunity.verificationStatus === "Official source"
    ? "High information"
    : informationCount >= 5 ? "Medium information" : "Limited information";
  const strengths = dimensions.flatMap((item) => item.evidence);
  const gaps = [
    ...missingSkills.map((skill) => `${skill} is mentioned but not listed in the profile`),
    ...dimensions.filter((item) => item.uncertainty).map((item) => item.uncertainty),
  ].slice(0, 5);
  return { score, strengths, gaps, dimensions, confidence, explanation: "A deterministic planning estimate based on recorded profile and opportunity fields." };
}

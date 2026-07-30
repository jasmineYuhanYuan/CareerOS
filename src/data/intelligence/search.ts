import { chiropracticInterviewQuestions, australianChiropracticRegistration, canberraChiropracticEmployers } from "@/data/verified/chiropractic";
import { verifiedCareerOpportunities } from "@/data/verified/opportunities";
import { verifiedProgrammes } from "@/data/verified/programmes";
import { intelligenceRecords } from ".";
import type { IntelligenceDomain } from "./types";

export interface IntelligenceSearchResult {
  id: string;
  domain: IntelligenceDomain;
  title: string;
  subtitle: string;
  summary: string;
  source: string;
  officialUrl: string;
  sourceType: string;
  lastVerified: string;
  confidence: string;
  country: string;
  region: string;
  language: string;
  verificationStatus: string;
  keywords: string[];
}

const modularResults: IntelligenceSearchResult[] = intelligenceRecords.map((record) => {
  if (record.domain === "Company") return {
    ...record, title: record.name, subtitle: record.industry,
    summary: [record.graduateProgram, record.internship, record.visaPolicy].filter(Boolean).join(" · ") || "Official career-page index",
    keywords: [record.name, record.industry, ...record.officeLocations],
  };
  if (record.domain === "Certification") return {
    ...record, title: record.name, subtitle: record.provider,
    summary: [record.difficulty, record.price, record.renewal].filter(Boolean).join(" · "),
    keywords: [record.name, record.provider, ...record.recommendedCareers],
  };
  if (record.domain === "Visa") return {
    ...record, title: `${record.name} (subclass ${record.subclass})`, subtitle: "Australian visa source index",
    summary: record.purpose, keywords: [record.name, record.subclass, record.purpose],
  };
  if (record.domain === "Healthcare") return {
    ...record, title: record.profession, subtitle: record.authority,
    summary: record.statutoryRegistration ? "Statutory registration required; check profession-specific standards" : "Registration position requires confirmation",
    keywords: [record.profession, record.authority, "registration", "healthcare"],
  };
  if (record.domain === "Interview" && "stages" in record) return {
    ...record, title: `${record.company} interview process`, subtitle: record.audience,
    summary: record.stages.join(" → "),
    keywords: [record.company, ...record.stages, ...record.preparation, record.onlineAssessment ?? ""],
  };
  if (record.domain === "Interview" && "candidateGuideUrl" in record) return {
    ...record, title: `${record.platform} candidate guide`, subtitle: "Assessment provider",
    summary: record.assessmentCategories.join(" · "),
    keywords: [record.platform, ...record.assessmentCategories, ...record.supportedFormats],
  };
  if (record.domain === "Interview") return {
    ...record, title: `${record.company} — ${record.platform}`, subtitle: "Online assessment",
    summary: [record.duration, record.questionType, record.programmingLanguage].filter(Boolean).join(" · "),
    keywords: [record.company, record.platform, record.questionType ?? "", record.programmingLanguage ?? ""],
  };
  return {
    ...record, title: record.career, subtitle: "Career pathway",
    summary: record.stages.map((stage) => stage.stage).join(" → "),
    keywords: [record.career, ...record.recommendedSkills, ...record.recommendedCertifications],
  };
});

const opportunityResults: IntelligenceSearchResult[] = verifiedCareerOpportunities.map((record) => ({
  id: record.id, domain: "Job", title: record.title, subtitle: record.company,
  summary: `${record.city} · ${record.employmentType} · ${record.applicationStage}`,
  source: record.source, officialUrl: record.officialUrl, sourceType: record.sourceType,
  lastVerified: record.lastVerified, confidence: record.confidence, country: record.country,
  region: record.region, language: record.language, verificationStatus: record.verificationStatus,
  keywords: [record.title, record.company, record.city, ...record.skills],
}));

const programmeResults: IntelligenceSearchResult[] = verifiedProgrammes.map((record) => ({
  id: record.id, domain: "University", title: record.degree, subtitle: record.university,
  summary: [record.city, record.duration, record.tuition].filter(Boolean).join(" · "),
  source: record.source, officialUrl: record.officialUrl, sourceType: record.sourceType,
  lastVerified: record.lastVerified, confidence: record.confidence, country: record.country,
  region: record.region, language: record.language, verificationStatus: record.verificationStatus,
  keywords: [record.degree, record.university, record.city],
}));

const employerResults: IntelligenceSearchResult[] = canberraChiropracticEmployers.map((record) => ({
  id: record.id, domain: "Company", title: record.organisationName, subtitle: `${record.suburb}, ${record.stateOrTerritory}`,
  summary: `${record.serviceFocus}. Employer directory only—not a hiring claim.`,
  source: record.source, officialUrl: record.officialUrl, sourceType: record.sourceType,
  lastVerified: record.lastVerified, confidence: record.confidence, country: record.country,
  region: record.region, language: record.language, verificationStatus: record.verificationStatus,
  keywords: [record.organisationName, record.suburb, record.serviceFocus, "chiropractic"],
}));

const interviewResults: IntelligenceSearchResult[] = chiropracticInterviewQuestions.map((record) => ({
  id: record.id, domain: "Interview", title: record.question, subtitle: record.category,
  summary: record.whyAsked, source: record.source, officialUrl: record.officialUrl, sourceType: record.sourceType,
  lastVerified: record.lastVerified, confidence: record.confidence, country: record.country,
  region: record.region, language: record.language, verificationStatus: record.verificationStatus,
  keywords: [record.question, record.category, ...record.answerFramework],
}));

const registrationResult: IntelligenceSearchResult = {
  id: australianChiropracticRegistration.id, domain: "Registration",
  title: "Australian chiropractic registration", subtitle: australianChiropracticRegistration.regulator,
  summary: "Official-source pathway covering qualification, English, criminal history, insurance, recency, CPD and renewal.",
  source: australianChiropracticRegistration.source, officialUrl: australianChiropracticRegistration.officialUrl,
  sourceType: australianChiropracticRegistration.sourceType, lastVerified: australianChiropracticRegistration.lastVerified,
  confidence: australianChiropracticRegistration.confidence, country: australianChiropracticRegistration.country,
  region: australianChiropracticRegistration.region, language: australianChiropracticRegistration.language,
  verificationStatus: australianChiropracticRegistration.verificationStatus,
  keywords: ["chiropractor", "Ahpra", "Chiropractic Board", "registration", "CPD"],
};

export const intelligenceSearchIndex: IntelligenceSearchResult[] = [
  ...modularResults,
  ...opportunityResults,
  ...programmeResults,
  ...employerResults,
  ...interviewResults,
  registrationResult,
];

export function searchIntelligence(query: string, domain: IntelligenceDomain | "All" = "All"): IntelligenceSearchResult[] {
  const needle = query.trim().toLowerCase();
  return intelligenceSearchIndex.filter((record) => {
    if (domain !== "All" && record.domain !== domain) return false;
    if (!needle) return true;
    return [record.title, record.subtitle, record.summary, record.country, record.region, ...record.keywords]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}

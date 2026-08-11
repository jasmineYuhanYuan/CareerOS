import { australiaTechnologyCompanies } from "./companies/australia";
import { chinaTechnologyCompanies } from "./companies/china";
import { certifications } from "./certifications/core";
import { australiaRegulatedHealthcareProfessions } from "./healthcare/australia";
import { australiaVisas } from "./visa/australia";
import {
  xeroGraduateInterview,
  xeroHackerRankAssessment,
} from "./interviews/xero";
import {
  amazonSdeOnlineAssessment,
  amazonUniversitySdeInterview,
  atlassianEarlyCareersInterview,
} from "./interviews/australia-tech";
import { assessmentProviderGuides } from "./assessments/providers";
import {
  canberraChiropracticEmployers,
  chiropracticInterviewQuestions,
} from "@/data/verified/chiropractic";
import { verifiedCareerOpportunities } from "@/data/verified/opportunities";
import { verifiedProgrammes } from "@/data/verified/programmes";
import type { IntelligenceRecord } from "./types";

export {
  australiaRegulatedHealthcareProfessions,
  australiaTechnologyCompanies,
  chinaTechnologyCompanies,
  australiaVisas,
  certifications,
  xeroGraduateInterview,
  xeroHackerRankAssessment,
  assessmentProviderGuides,
  amazonSdeOnlineAssessment,
  amazonUniversitySdeInterview,
  atlassianEarlyCareersInterview,
};

export const intelligenceRecords: IntelligenceRecord[] = [
  ...australiaTechnologyCompanies,
  ...chinaTechnologyCompanies,
  ...certifications,
  ...australiaVisas,
  ...australiaRegulatedHealthcareProfessions,
  xeroGraduateInterview,
  xeroHackerRankAssessment,
  atlassianEarlyCareersInterview,
  amazonUniversitySdeInterview,
  amazonSdeOnlineAssessment,
  ...assessmentProviderGuides,
];

export const intelligenceCoverage = {
  companies:
    australiaTechnologyCompanies.length +
    chinaTechnologyCompanies.length +
    canberraChiropracticEmployers.length,
  jobs: verifiedCareerOpportunities.length,
  universities: new Set(verifiedProgrammes.map((record) => record.university))
    .size,
  interviews: chiropracticInterviewQuestions.length + 3,
  onlineAssessments: assessmentProviderGuides.length + 2,
  certifications: certifications.length,
  careerPaths: 0,
  registrationAuthorities: new Set(
    australiaRegulatedHealthcareProfessions.map((record) => record.authority),
  ).size,
  healthcareProfessions: australiaRegulatedHealthcareProfessions.length,
  visas: australiaVisas.length,
  salaries: 0,
} as const;

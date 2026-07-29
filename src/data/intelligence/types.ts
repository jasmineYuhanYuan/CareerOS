import type { SourceMetadata } from "@/data/verified/types";

export type IntelligenceDomain =
  | "Company"
  | "Job"
  | "University"
  | "Certification"
  | "Career pathway"
  | "Healthcare"
  | "Interview"
  | "Salary"
  | "Visa"
  | "Registration";

export interface CompanyIntelligenceRecord extends SourceMetadata {
  id: string;
  domain: "Company";
  name: string;
  industry: string;
  careerPage: string;
  graduateProgram: string | null;
  internship: string | null;
  officeLocations: string[];
  visaPolicy: string | null;
  technologyStack: string[];
  interviewStages: string[];
  recruitmentSeason: string | null;
  unknownFields: string[];
}

export interface CertificationIntelligenceRecord extends SourceMetadata {
  id: string;
  domain: "Certification";
  provider: string;
  name: string;
  difficulty: string | null;
  recognition: string;
  price: string | null;
  duration: string | null;
  renewal: string | null;
  recommendedCareers: string[];
  prerequisites: string | null;
}

export interface VisaIntelligenceRecord extends SourceMetadata {
  id: string;
  domain: "Visa";
  subclass: string;
  name: string;
  purpose: string;
  eligibilitySummary: string[];
  employerSponsorshipRequired: boolean | null;
  invitationRequired: boolean | null;
  stay: string | null;
  cost: string | null;
  caution: string;
}

export interface HealthcareProfessionRecord extends SourceMetadata {
  id: string;
  domain: "Healthcare";
  profession: string;
  statutoryRegistration: boolean | null;
  authority: string;
  administrationBody: string | null;
  renewal: string | null;
  insurance: string | null;
  cpd: string | null;
  careerProgression: string[];
  salary: string | null;
  demand: string | null;
  uncertaintyNotes: string[];
}

export interface CareerPathwayRecord extends SourceMetadata {
  id: string;
  domain: "Career pathway";
  career: string;
  stages: Array<{ stage: string; evidence: string[] }>;
  recommendedCertifications: string[];
  recommendedSkills: string[];
  interviewFocus: string[];
  averageYearsByStage: null;
}

export interface CompanyInterviewRecord extends SourceMetadata {
  id: string;
  domain: "Interview";
  company: string;
  audience: string;
  stages: string[];
  behavioural: string | null;
  technical: string | null;
  onlineAssessment: string | null;
  timeline: string | null;
  difficulty: string | null;
  preparation: string[];
}

export interface OnlineAssessmentRecord extends SourceMetadata {
  id: string;
  domain: "Interview";
  platform: string;
  company: string;
  duration: string | null;
  questionType: string | null;
  calculator: string | null;
  camera: string | null;
  programmingLanguage: string | null;
  difficulty: string | null;
  evidence: string;
}

export type IntelligenceRecord =
  | CompanyIntelligenceRecord
  | CertificationIntelligenceRecord
  | VisaIntelligenceRecord
  | HealthcareProfessionRecord
  | CareerPathwayRecord
  | CompanyInterviewRecord
  | OnlineAssessmentRecord;

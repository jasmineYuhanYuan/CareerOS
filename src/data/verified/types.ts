export type VerifiedSourceType = "Official" | "Government" | "University" | "Employer" | "Professional body" | "Job board" | "Community";
export type DataConfidence = "High" | "Medium" | "Low";
export type DatasetLanguage = "en" | "zh-CN";
export type DataVerificationStatus = "Verified" | "Partially verified" | "Archived" | "Unknown";

export interface SourceMetadata {
  source: string;
  officialUrl: string;
  sourceType: VerifiedSourceType;
  verified: boolean;
  lastVerified: string;
  lastUpdated: string;
  nextReviewDate: string;
  country: string;
  language: DatasetLanguage;
  region: string;
  confidence: DataConfidence;
  verificationStatus: DataVerificationStatus;
}

export interface VerifiedCareerOpportunity extends SourceMetadata {
  id: string;
  title: string;
  company: string;
  city: string;
  employmentType: "Internship" | "Graduate" | "Full-time" | "Part-time" | "Casual";
  earlyCareerType: "Graduate" | "Intern" | "Cadet" | "Entry level";
  salary: string | null;
  careersUrl: string;
  deadline: string | null;
  skills: string[];
  workStyle: "On-site" | "Hybrid" | "Remote" | "Not published";
  visaSponsorship: string | null;
  applicationStage: "Open" | "Upcoming" | "Closed" | "Register interest" | "Not published";
  eligibility: string[];
}

export interface VerifiedProgramme extends SourceMetadata {
  id: string;
  university: string;
  degree: string;
  city: string;
  duration: string | null;
  tuition: string | null;
  deadline: string | null;
  entryRequirements: string[];
  ielts: string | null;
  gre: string | null;
}

export interface VerifiedOrganisation extends SourceMetadata {
  id: string;
  name: string;
  industry: string;
  headquarters: string | null;
  officeLocations: string[];
  companySize: string | null;
  techStack: string[];
  graduateProgram: string | null;
  internship: string | null;
  visaSponsorship: string | null;
  careersUrl: string;
  glassdoorUrl: string | null;
  linkedInUrl: string | null;
}

export interface ResearchSource {
  label: string;
  url: string;
  sourceType: VerifiedSourceType;
}

export interface InterviewGuide extends SourceMetadata {
  id: string;
  company: string;
  stages: string[];
  typicalTimeline: string | null;
  codingLanguage: string | null;
  difficulty: string | null;
  topics: string[];
  notes: string[];
  sources: ResearchSource[];
}

export interface AssessmentPlatformGuide extends SourceMetadata {
  id: string;
  platform: string;
  typicalDuration: string | null;
  difficulty: string | null;
  companies: Array<{ company: string; evidenceUrl: string; confidence: DataConfidence }>;
  notes: string[];
}

export interface CareerReference extends SourceMetadata {
  id: string;
  category: "Resume" | "Salary" | "Visa";
  title: string;
  jurisdiction: string;
  summary: string[];
}

export type ChecklistStatus = "Not started" | "In progress" | "Completed" | "Not applicable" | "Blocked";
export type VacancyVerificationStatus = "Current" | "Expired" | "Archived" | "Expression of interest" | "Employer directory only";

export interface RegistrationRequirement {
  label: string;
  detail: string;
  sourceUrl: string;
}

export interface ProfessionalRegistrationPathway extends SourceMetadata {
  id: string;
  profession: string;
  regulator: string;
  administrationBody: string;
  registrationRequired: boolean;
  applicationPortalUrl: string;
  requirements: RegistrationRequirement[];
  internationalQualificationPathway: string | null;
  estimatedCost: string | null;
  processingTime: string | null;
  examinationRequirement: string | null;
  uncertaintyNotes: string[];
  governmentSource: boolean;
}

export interface VerifiedEmployerDirectoryRecord extends SourceMetadata {
  id: string;
  organisationName: string;
  organisationType: string;
  suburb: string;
  city: string;
  stateOrTerritory: string;
  website: string;
  careersPage: string | null;
  serviceFocus: string;
  multidisciplinaryStatus: string;
  graduateSupport: string | null;
  contactInformation: string;
  directoryStatus: "Official employer website";
  dataNotes: string;
}

export interface ChiropracticVacancyRecord extends SourceMetadata {
  id: string;
  exactTitle: string;
  employer: string;
  location: string;
  employmentType: string;
  publicationDate: string | null;
  closingDate: string | null;
  applicationUrl: string;
  vacancyStatus: VacancyVerificationStatus;
  registrationRequirement: string | null;
  experienceRequirement: string | null;
  mentoringSupport: string | null;
  salary: string | null;
  workPattern: string | null;
  dataNotes: string;
}

export interface InterviewQuestionRecord extends SourceMetadata {
  id: string;
  question: string;
  category: string;
  whyAsked: string;
  answerFramework: string[];
}

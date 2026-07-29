export type VerifiedSourceType = "Official" | "Government" | "University" | "Community";
export type DataConfidence = "High" | "Medium" | "Low";
export type DatasetLanguage = "en" | "zh-CN";

export interface SourceMetadata {
  source: string;
  officialUrl: string;
  sourceType: VerifiedSourceType;
  verified: boolean;
  lastUpdated: string;
  nextReviewDate: string;
  country: string;
  language: DatasetLanguage;
  region: string;
  confidence: DataConfidence;
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

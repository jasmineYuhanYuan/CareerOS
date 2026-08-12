export const STORAGE_VERSION = 5 as const;
export type AppLocale = "en" | "zh-CN";

export type StudyLevel = "Undergraduate" | "Postgraduate";
export type Proficiency = "Learning" | "Working" | "Confident" | "Advanced";
export type EmploymentType =
  "Internship" | "Graduate" | "Full-time" | "Part-time" | "Contract";
export type RemoteType = "On-site" | "Hybrid" | "Remote" | "Not published";
export type RoleFamily =
  | "Product"
  | "Technical Product"
  | "Software Engineering"
  | "Data"
  | "AI"
  | "Marketing"
  | "Chiropractic"
  | "Clinical Healthcare";
export type OrganisationType =
  | "Technology company"
  | "Bank or financial institution"
  | "Clinic"
  | "Healthcare provider"
  | "University"
  | "Other";
export type ApplicationStatus =
  | "Interested"
  | "Researching"
  | "Preparing"
  | "Ready to apply"
  | "Applied"
  | "OA invited"
  | "OA completed"
  | "Interview invited"
  | "Interviewing"
  | "Reference check"
  | "Offer"
  | "Rejected"
  | "Withdrawn"
  | "Archived";
export type PostgraduateStatus =
  | "Considering"
  | "Researching"
  | "Preparing"
  | "Submitted"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn";
export type RoadmapCategory =
  | "Job application"
  | "Postgraduate"
  | "Skill"
  | "Project"
  | "Portfolio"
  | "Interview"
  | "Registration"
  | "Networking"
  | "Other";
export type RoadmapStatus =
  "Not started" | "In progress" | "Completed" | "Not applicable" | "Blocked";
export type Priority = "Low" | "Medium" | "High";
export type ThemePreference = "System" | "Light" | "Dark";
export type OpportunityCategory =
  | "Job"
  | "Internship"
  | "Graduate program"
  | "Research opportunity"
  | "Scholarship"
  | "Hackathon"
  | "Competition"
  | "Networking event"
  | "Career event"
  | "Continuing education"
  | "Professional registration"
  | "Other";
export type VerificationStatus =
  "Sample" | "Unverified" | "Official source" | "Expired" | "Archived";
export type SourceType =
  | "Seed"
  | "Official"
  | "Government"
  | "University"
  | "Employer"
  | "Professional body"
  | "Job board"
  | "Aggregator"
  | "Community"
  | "Manual"
  | "User";
export type ChinaOpportunityCategory =
  | "Backend"
  | "Software Engineering"
  | "AI"
  | "AI Product"
  | "Product"
  | "Data"
  | "Other";
export type ChinaRoleFamily =
  | "Product"
  | "AI Product"
  | "Technical Product"
  | "Software Engineering"
  | "Frontend"
  | "Backend"
  | "Data"
  | "AI / ML"
  | "Operations"
  | "Growth"
  | "Other";
export type ChinaRecruitingBatch =
  "日常实习" | "暑期实习" | "春招" | "秋招" | "提前批" | "正式批" | "补录";
export type ChinaRecruitingStatus =
  | "Wishlist"
  | "To Apply"
  | "Applied"
  | "OA"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn"
  | "Archived";
export type ChinaRecruitingPriority = "P1" | "P2" | "P3";
export type ChinaResumeVersion =
  | "Chinese"
  | "English"
  | "Both"
  | "中文产品简历"
  | "中文技术简历"
  | "英文产品简历"
  | "英文技术简历"
  | "通用校招简历";
export type DeadlineUrgency =
  | "Closing in 7 days"
  | "Closing in 14 days"
  | "Open"
  | "Expired"
  | "Not published";
export type ChinaSourceType =
  "Official" | "Aggregator" | "Community" | "Manual";

export interface ChinaCampusOpportunity {
  id: string;
  jobId?: string;
  profileId: string;
  company: string;
  position: string;
  category: ChinaOpportunityCategory;
  location: string;
  country: "China";
  hiringSeason: string;
  recruitingBatch: ChinaRecruitingBatch;
  targetGraduationYear: string | null;
  roleFamily: ChinaRoleFamily;
  businessUnit: string | null;
  headcount?: number | null;
  responsibilities?: string[];
  requirements?: string[];
  officialApplyLink: string;
  officialCareersLink: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: ChinaSourceType;
  lastVerifiedAt: string;
  checkedAt?: string;
  verificationMethod?: string;
  lifecycleStatus?: OpportunityLifecycle;
  closedReason?: string | null;
  nextReviewDate?: string;
  sourceStatus?: string;
  verificationStatus: OpportunityLifecycle;
  verificationConfidence: "High" | "Medium" | "Low";
  publishedDate: string | null;
  sampleData: false;
  openDate: string | null;
  deadline: string | null;
  resumeVersion: ChinaResumeVersion;
  status: ChinaRecruitingStatus;
  priority: ChinaRecruitingPriority;
  fitScore: number;
  deadlineUrgency: DeadlineUrgency;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ChinaAssessmentType =
  | "Coding OA"
  | "General aptitude"
  | "Numerical reasoning"
  | "Verbal reasoning"
  | "Product case"
  | "SQL"
  | "Data analysis"
  | "Personality"
  | "Video interview"
  | "Written test";

export interface ChinaAssessmentIntelligence {
  id: string;
  company: string;
  roleFamily: ChinaRoleFamily | "All";
  region: string;
  assessmentProvider: string | null;
  assessmentTypes: ChinaAssessmentType[];
  reportedStage: string;
  sourceType: "Official" | "Provider" | "Community";
  confidence: "High" | "Medium" | "Low";
  sourceUrl: string;
  sourceDate: string;
  lastVerifiedAt: string;
  notes: string;
}

export interface ChinaInterviewIntelligence {
  id: string;
  company: string;
  roleFamily: ChinaRoleFamily | "All";
  likelyStages: string[];
  focusAreas: string[];
  typicalRounds: string | null;
  sourceType: "Official" | "Community" | "Unknown";
  sourceDate: string;
  confidence: "High" | "Medium" | "Low";
  sourceUrl: string;
  lastVerifiedAt: string;
  notes: string;
}
export type RelationshipType =
  | "Recruiter"
  | "Hiring manager"
  | "University contact"
  | "Lecturer"
  | "Alumni"
  | "Mentor"
  | "Clinic owner"
  | "Professional contact"
  | "Other";
export type CareerDocumentType =
  | "English résumé"
  | "Chinese résumé"
  | "Cover letter"
  | "Portfolio"
  | "Academic transcript"
  | "Personal statement"
  | "Recommendation materials"
  | "Other";
export type CareerDocumentStatus =
  | "Missing"
  | "Draft"
  | "Review needed"
  | "Ready"
  | "Submitted"
  | "Outdated"
  | "Not applicable";
export type OpportunityLifecycle =
  | "Open"
  | "Upcoming"
  | "Closing soon"
  | "Closed"
  | "Expired"
  | "Archived"
  | "Verification required";
export type ApplicationMaterialStatus = CareerDocumentStatus;
export type InterviewSessionType = "Interview" | "Online assessment";
export type InterviewSessionStatus =
  "Planned" | "Invited" | "Completed" | "Cancelled";

export interface ApplicationMaterial {
  id: string;
  label: string;
  status: ApplicationMaterialStatus;
  documentId?: string;
  notes: string;
}

export interface InterviewAssessmentSession {
  id: string;
  type: InterviewSessionType;
  provider: string;
  stage: string;
  scheduledAt: string;
  durationMinutes: number | null;
  status: InterviewSessionStatus;
  preparationNotes: string;
  outcomeNotes: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: Proficiency;
  evidence: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  description: string;
  competencies: string[];
  repositoryUrl: string;
  liveUrl: string;
}

export interface CareerProfile {
  id: string;
  displayName: string;
  preferredName: string;
  university: string;
  degree: string;
  discipline: string;
  studyLevel: StudyLevel;
  location: string;
  expectedGraduationDate: string;
  workEligibility: string;
  registrationStatus: string;
  careerGoals: string[];
  preferredCities: string[];
  skills: Skill[];
  projects: Project[];
  experienceSummary: string;
  linkedInUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export interface Job {
  id: string;
  organisationId: string;
  companyName: string;
  title: string;
  roleFamily: RoleFamily;
  discipline: string;
  employmentType: EmploymentType;
  location: string;
  country: string;
  remoteType: RemoteType;
  description: string;
  requirements: string[];
  preferredSkills: string[];
  postedDate: string;
  deadline: string;
  sourceUrl: string;
  suitableProfileIds: string[];
  tags: string[];
  salaryText?: string;
  registrationRequirement?: string;
  sampleData: boolean;
  verified?: boolean;
  sourceType?: SourceType;
  lastUpdated?: string;
  nextReviewDate?: string;
  language?: AppLocale;
  region?: string;
  confidence?: "High" | "Medium" | "Low";
  careersUrl?: string;
  visaSponsorship?: string;
  applicationStage?: string;
}

export interface Organisation {
  id: string;
  name: string;
  organisationType: OrganisationType;
  sector: string;
  country: string;
  city: string;
  websiteUrl: string;
  careersUrl: string;
  description: string;
  roleFamilies: RoleFamily[];
  sampleData: boolean;
  verified?: boolean;
  sourceType?: SourceType;
  officialUrl?: string;
  lastUpdated?: string;
  nextReviewDate?: string;
  language?: AppLocale;
  region?: string;
  confidence?: "High" | "Medium" | "Low";
}

export interface ActivityEvent {
  id: string;
  type: "created" | "status_changed" | "notes_updated" | "next_action_updated";
  label: string;
  occurredAt: string;
}

export interface JobApplication {
  id: string;
  profileId: string;
  jobId: string;
  organisationName: string;
  jobTitle: string;
  status: ApplicationStatus;
  savedAt: string;
  appliedAt: string;
  nextAction: string;
  nextActionDate: string;
  cvVersion: string;
  notes: string;
  lastUpdatedAt: string;
  activity: ActivityEvent[];
  sourceSnapshot?: {
    location: string;
    officialUrl: string;
    deadline: string | null;
    recruitingBatch: string;
    title: string;
    company: string;
    capturedAt: string;
  };
  materials?: ApplicationMaterial[];
  sessions?: InterviewAssessmentSession[];
}

export type ProgramDocument =
  | "Academic transcript"
  | "CV or résumé"
  | "Personal statement"
  | "Recommendation letters"
  | "English test"
  | "Portfolio"
  | "Other";

export interface PostgraduateProgram {
  id: string;
  university: string;
  programName: string;
  degreeLevel: string;
  discipline: string;
  country: string;
  city: string;
  duration: string;
  tuitionText: string;
  intake: string;
  deadline: string;
  entryRequirements: string[];
  languageRequirements: string;
  greRequirement: string;
  recommendationLetters: string;
  requiredDocuments: ProgramDocument[];
  applicationUrl: string;
  suitableProfileIds: string[];
  sampleData: boolean;
  verified?: boolean;
  sourceType?: SourceType;
  lastUpdated?: string;
  nextReviewDate?: string;
  language?: AppLocale;
  region?: string;
  confidence?: "High" | "Medium" | "Low";
}

export interface PostgraduateApplication {
  id: string;
  profileId: string;
  programId: string;
  status: PostgraduateStatus;
  deadline: string;
  notes: string;
  documents: Record<ProgramDocument, boolean>;
}

export interface RoadmapItem {
  id: string;
  profileId: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  targetDate: string;
  status: RoadmapStatus;
  priority: Priority;
  linkedJobId?: string;
  linkedProgramId?: string;
}

export interface Opportunity {
  id: string;
  category: OpportunityCategory;
  title: string;
  organisationId: string;
  organisationName: string;
  description: string;
  disciplineTags: string[];
  roleFamilyTags: string[];
  skillTags: string[];
  suitableProfileIds: string[];
  country: string;
  city: string;
  locationText: string;
  remoteType: RemoteType;
  employmentType?: EmploymentType;
  startDate?: string;
  deadline?: string;
  publishedDate?: string;
  sourceUrl?: string;
  sourceName: string;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string;
  dataNotes?: string;
  eligibilityText?: string;
  salaryText?: string;
  sampleData: boolean;
  archived: boolean;
  applicationStage?: string;
}

export interface CareerContact {
  id: string;
  profileId: string;
  name: string;
  organisation: string;
  role: string;
  email?: string;
  linkedInUrl?: string;
  relationshipType: RelationshipType;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerDocumentRecord {
  id: string;
  profileId: string;
  documentType: CareerDocumentType;
  name: string;
  version: string;
  updatedAt: string;
  notes: string;
  externalUrl?: string;
  status: CareerDocumentStatus;
}

export interface DashboardPreferences {
  defaultRegion: string;
  showSampleData: boolean;
  showArchivedOpportunities: boolean;
  demoMode: boolean;
}

export interface ProfileWorkspace {
  profile: CareerProfile;
  savedJobIds: string[];
  applications: JobApplication[];
  savedProgramIds: string[];
  postgraduateApplications: PostgraduateApplication[];
  roadmapItems: RoadmapItem[];
  organisationNotes: Record<string, string>;
  savedOpportunityIds: string[];
  contacts: CareerContact[];
  documents: CareerDocumentRecord[];
  chinaCampusOpportunities: ChinaCampusOpportunity[];
}

export interface CareerOSState {
  version: typeof STORAGE_VERSION;
  activeProfileId: string;
  defaultProfileId: string;
  theme: ThemePreference;
  language: AppLocale;
  dashboardPreferences: DashboardPreferences;
  profiles: Record<string, ProfileWorkspace>;
}

export interface MatchDimension {
  name:
    | "Goal alignment"
    | "Discipline alignment"
    | "Skill overlap"
    | "Location alignment"
    | "Experience/project relevance"
    | "Eligibility confidence"
    | "Opportunity type preference";
  score: number | null;
  weight: number;
  evidence: string[];
  uncertainty: string;
}

export interface MatchResult {
  score: number;
  strengths: string[];
  gaps: string[];
  explanation: string;
  dimensions?: MatchDimension[];
  confidence?:
    "High information" | "Medium information" | "Limited information";
}

export interface DashboardDeadline {
  id: string;
  title: string;
  source:
    | "Job"
    | "Application"
    | "Postgraduate"
    | "Roadmap"
    | "Opportunity"
    | "Contact";
  date: string;
}

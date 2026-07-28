export const STORAGE_VERSION = 2 as const;

export type StudyLevel = "Undergraduate" | "Postgraduate";
export type Proficiency = "Learning" | "Working" | "Confident" | "Advanced";
export type EmploymentType = "Internship" | "Graduate" | "Full-time" | "Part-time" | "Contract";
export type RemoteType = "On-site" | "Hybrid" | "Remote";
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
  | "Saved"
  | "Preparing"
  | "Applied"
  | "Assessment"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn";
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
export type RoadmapStatus = "Not started" | "In progress" | "Completed" | "Blocked";
export type Priority = "Low" | "Medium" | "High";
export type ThemePreference = "System" | "Light" | "Dark";

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
  sampleData: true;
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
  sampleData: true;
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
  sampleData: true;
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

export interface ProfileWorkspace {
  profile: CareerProfile;
  savedJobIds: string[];
  applications: JobApplication[];
  savedProgramIds: string[];
  postgraduateApplications: PostgraduateApplication[];
  roadmapItems: RoadmapItem[];
  organisationNotes: Record<string, string>;
}

export interface CareerOSState {
  version: typeof STORAGE_VERSION;
  activeProfileId: string;
  defaultProfileId: string;
  theme: ThemePreference;
  profiles: Record<string, ProfileWorkspace>;
}

export interface MatchResult {
  score: number;
  strengths: string[];
  gaps: string[];
  explanation: string;
}

export interface DashboardDeadline {
  id: string;
  title: string;
  source: "Job" | "Application" | "Postgraduate" | "Roadmap";
  date: string;
}

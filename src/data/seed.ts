import type {
  CareerOSState,
  CareerProfile,
  Job,
  Organisation,
  PostgraduateProgram,
  ProfileWorkspace,
  RoadmapItem,
} from "@/types/domain";
import { STORAGE_VERSION } from "@/types/domain";

export const YUHAN_ID = "yuhan-yuan";
export const TOMMY_ID = "taicheng-guo-tommy";

const yuhan: CareerProfile = {
  id: YUHAN_ID,
  displayName: "Yuhan Yuan",
  preferredName: "Yuhan",
  university: "UNSW",
  degree: "Bachelor of Computer Science",
  discipline: "Computer Science",
  studyLevel: "Undergraduate",
  location: "Australia",
  expectedGraduationDate: "",
  workEligibility: "To be confirmed",
  registrationStatus: "Not applicable",
  careerGoals: ["AI Product Manager", "Technical Product Manager", "Software Engineer", "Postgraduate study"],
  preferredCities: ["Sydney"],
  skills: [
    { id: "ys1", name: "TypeScript", category: "Software", proficiency: "Working", evidence: "CareerOS" },
    { id: "ys2", name: "Product discovery", category: "Product", proficiency: "Working", evidence: "WearAgain and Unify" },
    { id: "ys3", name: "React", category: "Software", proficiency: "Working", evidence: "CareerOS" },
  ],
  projects: [
    { id: "yp1", name: "WearAgain", role: "", description: "", competencies: ["Product"], repositoryUrl: "", liveUrl: "" },
    { id: "yp2", name: "Unify", role: "", description: "", competencies: ["Product"], repositoryUrl: "", liveUrl: "" },
    { id: "yp3", name: "CareerOS", role: "", description: "A local-first career planning workspace.", competencies: ["TypeScript", "React"], repositoryUrl: "https://github.com/jasmineYuhanYuan/CareerOS", liveUrl: "" },
  ],
  experienceSummary: "Add internship and work experience details.",
  linkedInUrl: "",
  githubUrl: "https://github.com/jasmineYuhanYuan",
  portfolioUrl: "",
};

const tommy: CareerProfile = {
  id: TOMMY_ID,
  displayName: "Taicheng Guo (Tommy)",
  preferredName: "Tommy",
  university: "Macquarie University",
  degree: "Postgraduate degree",
  discipline: "Chiropractic",
  studyLevel: "Postgraduate",
  location: "Australia",
  expectedGraduationDate: "",
  workEligibility: "To be confirmed",
  registrationStatus: "Registration or eligibility preparation",
  careerGoals: ["Graduate Chiropractor", "Associate Chiropractor", "Clinical chiropractic role"],
  preferredCities: ["Sydney"],
  skills: [
    { id: "ts1", name: "Patient communication", category: "Clinical practice", proficiency: "Working", evidence: "Postgraduate clinical training" },
    { id: "ts2", name: "Clinical assessment", category: "Clinical practice", proficiency: "Working", evidence: "Postgraduate clinical training" },
  ],
  projects: [],
  experienceSummary: "Clinical experience details can be added when ready.",
  linkedInUrl: "",
  githubUrl: "",
  portfolioUrl: "",
};

export const seedProfiles = [yuhan, tommy] as const;

export const organisations: Organisation[] = [
  ["canva", "Canva", "Technology company", "Design technology", "Sydney", ["Product", "Software Engineering", "AI"]],
  ["atlassian", "Atlassian", "Technology company", "Collaboration software", "Sydney", ["Product", "Technical Product", "Software Engineering"]],
  ["google", "Google", "Technology company", "Technology", "Sydney", ["Product", "Software Engineering", "Data"]],
  ["microsoft", "Microsoft", "Technology company", "Technology", "Sydney", ["Product", "AI", "Software Engineering"]],
  ["amazon", "Amazon", "Technology company", "Technology", "Sydney", ["Technical Product", "Software Engineering", "Data"]],
  ["tiktok", "TikTok", "Technology company", "Consumer technology", "Sydney", ["Product", "Software Engineering", "Data"]],
  ["wisetech", "WiseTech Global", "Technology company", "Logistics software", "Sydney", ["Product", "Software Engineering"]],
  ["rea", "REA Group", "Technology company", "Property technology", "Melbourne", ["Product", "Data", "Software Engineering"]],
  ["commbank", "Commonwealth Bank", "Bank or financial institution", "Financial services", "Sydney", ["Product", "Data", "Software Engineering"]],
  ["macquarie", "Macquarie Group", "Bank or financial institution", "Financial services", "Sydney", ["Product", "Data", "Software Engineering"]],
  ["harbour-clinic", "Harbour Chiropractic Clinic (Sample)", "Clinic", "Chiropractic", "Sydney", ["Chiropractic", "Clinical Healthcare"]],
  ["northside-clinic", "Northside Wellness Clinic (Sample)", "Clinic", "Allied health", "Sydney", ["Chiropractic", "Clinical Healthcare"]],
  ["sports-rehab", "Sydney Sports & Rehab Clinic (Sample)", "Healthcare provider", "Sports rehabilitation", "Sydney", ["Chiropractic", "Clinical Healthcare"]],
  ["coastal-health", "Coastal Family Health (Sample)", "Clinic", "Family health", "Newcastle", ["Chiropractic", "Clinical Healthcare"]],
].map(([id, name, organisationType, sector, city, roleFamilies]) => ({
  id: id as string,
  name: name as string,
  organisationType: organisationType as Organisation["organisationType"],
  sector: sector as string,
  country: "Australia",
  city: city as string,
  websiteUrl: "",
  careersUrl: "",
  description: "Sample organisation record for local CareerOS planning.",
  roleFamilies: roleFamilies as Organisation["roleFamilies"],
  sampleData: true,
}));

function job(
  id: string,
  organisationId: string,
  title: string,
  family: Job["roleFamily"],
  employmentType: Job["employmentType"],
  remoteType: Job["remoteType"],
  profileId: string,
  deadline: string,
  skills: string[],
): Job {
  const organisation = organisations.find((item) => item.id === organisationId);
  if (!organisation) throw new Error(`Missing organisation ${organisationId}`);
  return {
    id,
    organisationId,
    companyName: organisation.name,
    title,
    roleFamily: family,
    discipline: profileId === TOMMY_ID ? "Chiropractic" : "Computer Science",
    employmentType,
    location: organisation.city,
    country: organisation.country,
    remoteType,
    description: "Sample planning record. This is not a verified active vacancy.",
    requirements: profileId === TOMMY_ID ? ["Relevant chiropractic qualification", "Registration eligibility"] : ["Relevant degree or equivalent experience", "Clear communication"],
    preferredSkills: skills,
    postedDate: "2026-07-20",
    deadline,
    sourceUrl: "",
    suitableProfileIds: [profileId],
    tags: [family, employmentType],
    registrationRequirement: profileId === TOMMY_ID ? "Confirm current registration or eligibility requirements." : undefined,
    sampleData: true,
  };
}

export const jobs: Job[] = [
  job("j1", "canva", "Graduate Product Associate", "Product", "Graduate", "Hybrid", YUHAN_ID, "2026-10-10", ["Product discovery", "React"]),
  job("j2", "atlassian", "Technical Product Intern", "Technical Product", "Internship", "Hybrid", YUHAN_ID, "2026-09-22", ["TypeScript", "Product discovery"]),
  job("j3", "google", "Software Engineering Intern", "Software Engineering", "Internship", "Hybrid", YUHAN_ID, "2026-11-01", ["TypeScript", "React"]),
  job("j4", "microsoft", "AI Product Graduate", "AI", "Graduate", "Hybrid", YUHAN_ID, "2026-10-18", ["Product discovery", "AI"]),
  job("j5", "amazon", "Technical Program Graduate", "Technical Product", "Graduate", "On-site", YUHAN_ID, "2026-09-30", ["Communication", "TypeScript"]),
  job("j6", "tiktok", "Graduate Software Engineer", "Software Engineering", "Graduate", "On-site", YUHAN_ID, "2026-10-25", ["TypeScript", "React"]),
  job("j7", "wisetech", "Junior Software Engineer", "Software Engineering", "Full-time", "Hybrid", YUHAN_ID, "2026-11-15", ["TypeScript"]),
  job("j8", "rea", "Graduate Data Analyst", "Data", "Graduate", "Hybrid", YUHAN_ID, "2026-10-05", ["SQL", "Analytics"]),
  job("j9", "commbank", "Technology Graduate Program", "Software Engineering", "Graduate", "Hybrid", YUHAN_ID, "2026-09-15", ["Communication", "TypeScript"]),
  job("j10", "macquarie", "Digital Product Graduate", "Product", "Graduate", "Hybrid", YUHAN_ID, "2026-09-28", ["Product discovery"]),
  job("j11", "harbour-clinic", "Graduate Chiropractor", "Chiropractic", "Graduate", "On-site", TOMMY_ID, "2026-10-12", ["Patient communication", "Clinical assessment"]),
  job("j12", "northside-clinic", "Associate Chiropractor", "Chiropractic", "Full-time", "On-site", TOMMY_ID, "2026-10-24", ["Clinical assessment"]),
  job("j13", "sports-rehab", "Early-career Clinical Practitioner", "Clinical Healthcare", "Full-time", "On-site", TOMMY_ID, "2026-11-05", ["Patient communication"]),
  job("j14", "coastal-health", "Chiropractic Assistant", "Chiropractic", "Part-time", "On-site", TOMMY_ID, "2026-09-26", ["Patient communication"]),
  job("j15", "sports-rehab", "Rehabilitation Clinic Assistant", "Clinical Healthcare", "Contract", "On-site", TOMMY_ID, "2026-10-30", ["Clinical assessment"]),
  job("j16", "harbour-clinic", "Associate Chiropractic Practitioner", "Chiropractic", "Full-time", "On-site", TOMMY_ID, "2026-11-20", ["Patient communication", "Clinical assessment"]),
];

export const programs: PostgraduateProgram[] = [
  ["p1", "UNSW", "Master of Information Technology", "Masters", "Information Technology", "Australia", "Sydney"],
  ["p2", "University of Sydney", "Master of Computer Science", "Masters", "Computer Science", "Australia", "Sydney"],
  ["p3", "University of Melbourne", "Master of Information Systems", "Masters", "Information Technology", "Australia", "Melbourne"],
  ["p4", "ANU", "Master of Computing", "Masters", "Computer Science", "Australia", "Canberra"],
  ["p5", "Monash University", "Master of Artificial Intelligence", "Masters", "Artificial Intelligence", "Australia", "Melbourne"],
  ["p6", "UTS", "Master of Technology Management", "Masters", "Technology Management", "Australia", "Sydney"],
  ["p7", "Carnegie Mellon University", "Master of Human-Computer Interaction", "Masters", "Human–Computer Interaction", "United States", "Pittsburgh"],
  ["p8", "University of Washington", "Master of Human Centered Design & Engineering", "Masters", "Human–Computer Interaction", "United States", "Seattle"],
  ["p9", "National University of Singapore", "Master of Computing", "Masters", "Computer Science", "Singapore", "Singapore"],
  ["p10", "University College London", "MSc Human-Computer Interaction", "Masters", "Human–Computer Interaction", "United Kingdom", "London"],
].map(([id, university, programName, degreeLevel, discipline, country, city], index) => ({
  id,
  university,
  programName,
  degreeLevel,
  discipline,
  country,
  city,
  duration: "See official program information",
  tuitionText: "Confirm with university",
  intake: "Sample intake",
  deadline: `2027-0${(index % 8) + 1}-15`,
  entryRequirements: ["Confirm current requirements with the university"],
  languageRequirements: "Confirm with university",
  greRequirement: "Confirm with university",
  recommendationLetters: "Confirm with university",
  requiredDocuments: ["Academic transcript", "CV or résumé", "Personal statement"],
  applicationUrl: "",
  suitableProfileIds: [YUHAN_ID],
  sampleData: true,
}));

function roadmap(profileId: string, items: string[], category: RoadmapItem["category"]): RoadmapItem[] {
  return items.map((title, index) => ({
    id: `${profileId}-r${index + 1}`,
    profileId,
    title,
    description: "",
    category,
    targetDate: `2026-${String(8 + Math.floor(index / 2)).padStart(2, "0")}-${String(10 + index).padStart(2, "0")}`,
    status: index === 0 ? "In progress" : "Not started",
    priority: index < 2 ? "High" : "Medium",
  }));
}

function workspace(profile: CareerProfile): ProfileWorkspace {
  const items = profile.id === YUHAN_ID
    ? ["Complete CareerOS MVP", "Continue WearAgain iteration", "Finalise English résumé", "Finalise Chinese résumé", "Build SQL fundamentals", "Research postgraduate pathways", "Apply for suitable internships"]
    : ["Finalise chiropractic résumé", "Identify suitable clinics", "Confirm registration or eligibility requirements", "Prepare clinical interview examples", "Submit targeted applications"];
  return {
    profile,
    savedJobIds: [],
    applications: [],
    savedProgramIds: [],
    postgraduateApplications: [],
    roadmapItems: roadmap(profile.id, items, profile.id === TOMMY_ID ? "Registration" : "Project"),
    organisationNotes: {},
    savedOpportunityIds: [],
    contacts: [],
    documents: [],
  };
}

export function createSeedState(): CareerOSState {
  return {
    version: STORAGE_VERSION,
    activeProfileId: YUHAN_ID,
    defaultProfileId: YUHAN_ID,
    theme: "System",
    language: "en",
    dashboardPreferences: {
      defaultRegion: "Australia",
      showSampleData: true,
      showArchivedOpportunities: false,
    },
    profiles: {
      [YUHAN_ID]: workspace(structuredClone(yuhan)),
      [TOMMY_ID]: workspace(structuredClone(tommy)),
    },
  };
}

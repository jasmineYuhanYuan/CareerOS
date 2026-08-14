import type { CareerOSState, CareerDocumentRecord, CareerProfile, Job, Organisation, PostgraduateProgram, ProfileWorkspace, RoadmapItem } from "@/types/domain";
import { STORAGE_VERSION } from "@/types/domain";
import { yuhanKnownApplications } from "@/data/real-applications";
import { verifiedCareerOpportunities } from "@/data/verified/opportunities";
import { verifiedProgrammes } from "@/data/verified/programmes";
import { verifiedChinaCampusOpportunities } from "@/data/china-recruiting/verified-opportunities";

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
    {
      id: "ys1",
      name: "TypeScript",
      category: "Software",
      proficiency: "Working",
      evidence: "CareerOS",
    },
    {
      id: "ys2",
      name: "Product discovery",
      category: "Product",
      proficiency: "Working",
      evidence: "WearAgain and Unify",
    },
    {
      id: "ys3",
      name: "React",
      category: "Software",
      proficiency: "Working",
      evidence: "CareerOS",
    },
  ],
  projects: [
    {
      id: "yp1",
      name: "WearAgain",
      role: "",
      description: "",
      competencies: ["Product"],
      repositoryUrl: "",
      liveUrl: "",
    },
    {
      id: "yp2",
      name: "Unify",
      role: "",
      description: "",
      competencies: ["Product"],
      repositoryUrl: "",
      liveUrl: "",
    },
    {
      id: "yp3",
      name: "CareerOS",
      role: "",
      description: "A local-first career planning workspace.",
      competencies: ["TypeScript", "React"],
      repositoryUrl: "https://github.com/jasmineYuhanYuan/CareerOS",
      liveUrl: "",
    },
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
  location: "Canberra, Australia",
  expectedGraduationDate: "",
  workEligibility: "To be confirmed",
  registrationStatus: "To be confirmed",
  careerGoals: ["Graduate Chiropractor", "Associate Chiropractor", "Chiropractor", "Early-career clinical chiropractic role", "Chiropractic assistant"],
  preferredCities: ["Canberra", "Sydney"],
  skills: [
    {
      id: "ts1",
      name: "Patient communication",
      category: "Clinical practice",
      proficiency: "Learning",
      evidence: "",
    },
    {
      id: "ts2",
      name: "Clinical reasoning",
      category: "Clinical practice",
      proficiency: "Learning",
      evidence: "",
    },
  ],
  projects: [],
  experienceSummary: "Seeking early-career chiropractic work in Canberra/ACT, with Sydney/NSW as a secondary location. Clinical experience details are not yet recorded.",
  linkedInUrl: "",
  githubUrl: "",
  portfolioUrl: "",
};

export const seedProfiles = [yuhan, tommy] as const;

const verifiedOrganisationSources: Record<string, string> = {
  Canva: "https://www.canva.com/careers/",
  Atlassian: "https://www.atlassian.com/company/careers/earlycareers",
  Google: "https://www.google.com/about/careers/applications/locations/australia",
  Microsoft: "https://careers.microsoft.com/",
  Amazon: "https://www.amazon.jobs/en/locations/australia",
  TikTok: "https://lifeattiktok.com/search?keyword=&location=Australia",
  "REA Group": "https://www.rea-group.com/careers/",
  "Commonwealth Bank": "https://www.commbank.com.au/about-us/careers.html",
  "Macquarie Group": "https://www.macquarie.com/au/en/careers.html",
  "Digital Transformation Agency": "https://www.dta.gov.au/join-our-team/graduate-program",
  "Australian Signals Directorate": "https://www.asd.gov.au/careers/im-starting-my-career",
  "Australian Government": "https://content.apsjobs.gov.au/career-pathways/graduate-programs",
  Baidu: "https://talent.baidu.com/jobs/campus",
  ByteDance: "https://jobs.bytedance.com/campus/",
};

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
  ["digital-transformation-agency", "Digital Transformation Agency", "Other", "Australian Government digital services", "Canberra", ["Data", "Software Engineering", "Technical Product"]],
  ["australian-signals-directorate", "Australian Signals Directorate", "Other", "National security and cyber security", "Canberra", ["AI", "Data", "Software Engineering"]],
  ["australian-government", "Australian Government", "Other", "Public sector", "Canberra", ["Data", "Technical Product"]],
  ["baidu", "Baidu", "Technology company", "Internet and AI technology", "Beijing", ["AI", "Product", "Software Engineering"]],
  ["bytedance", "ByteDance", "Technology company", "Internet technology", "Beijing", ["AI", "Product", "Software Engineering"]],
].map(([id, name, organisationType, sector, city, roleFamilies]) => ({
  id: id as string,
  name: name as string,
  organisationType: organisationType as Organisation["organisationType"],
  sector: sector as string,
  country: ["Baidu", "ByteDance"].includes(name as string) ? "China" : "Australia",
  city: city as string,
  websiteUrl: "",
  careersUrl: verifiedOrganisationSources[name as string] ?? "",
  description: verifiedOrganisationSources[name as string] ? "Organisation linked to a verified official careers or government source." : "Sample directory record. Organisation details have not yet passed the CareerOS verification gate.",
  roleFamilies: roleFamilies as Organisation["roleFamilies"],
  sampleData: !verifiedOrganisationSources[name as string],
  verified: Boolean(verifiedOrganisationSources[name as string]),
  sourceType: (name as string).includes("Agency") || (name as string).includes("Directorate") || name === "Australian Government" ? "Government" : verifiedOrganisationSources[name as string] ? "Official" : "Seed",
  officialUrl: verifiedOrganisationSources[name as string],
  lastUpdated: verifiedOrganisationSources[name as string] ? "2026-07-29" : undefined,
  nextReviewDate: verifiedOrganisationSources[name as string] ? "2026-08-29" : undefined,
  language: verifiedOrganisationSources[name as string] ? (["Baidu", "ByteDance"].includes(name as string) ? "zh-CN" : "en") : undefined,
  region: verifiedOrganisationSources[name as string] ? (["Baidu", "ByteDance"].includes(name as string) ? "China" : "Australia") : undefined,
  confidence: verifiedOrganisationSources[name as string] ? "High" : undefined,
}));

const organisationIdByName: Record<string, string> = {
  Amazon: "amazon",
  Atlassian: "atlassian",
  "Digital Transformation Agency": "digital-transformation-agency",
  "Australian Signals Directorate": "australian-signals-directorate",
  "Australian Government": "australian-government",
  Baidu: "baidu",
  ByteDance: "bytedance",
};

export const jobs: Job[] = verifiedCareerOpportunities.map((record) => ({
  id: record.id,
  organisationId: organisationIdByName[record.company],
  companyName: record.company,
  title: record.title,
  roleFamily: record.skills.some((skill) => skill.toLowerCase().includes("data")) ? "Data" : record.skills.some((skill) => skill.toLowerCase().includes("cyber")) ? "AI" : record.skills.some((skill) => skill.toLowerCase().includes("product")) ? "Product" : "Software Engineering",
  discipline: record.company.includes("Atlassian") ? "Computer Science" : "Government and Technology",
  employmentType: record.employmentType === "Casual" ? "Part-time" : record.employmentType,
  location: record.city,
  country: record.country,
  remoteType: record.workStyle,
  description: `${record.source}. Review the official source before applying.`,
  requirements: record.eligibility,
  preferredSkills: record.skills,
  postedDate: record.lastUpdated,
  deadline: record.deadline ?? "",
  sourceUrl: record.officialApplyUrl ?? record.officialUrl,
  suitableProfileIds: record.profileScope ?? [YUHAN_ID],
  tags: [record.earlyCareerType, record.applicationStage],
  salaryText: record.salary ?? undefined,
  sampleData: false,
  verified: record.verified,
  sourceType: record.sourceType,
  lastUpdated: record.lastUpdated,
  nextReviewDate: record.nextReviewDate,
  language: record.language,
  region: record.region,
  confidence: record.confidence,
  careersUrl: record.careersUrl,
  visaSponsorship: record.visaSponsorship ?? undefined,
  applicationStage: record.applicationStage,
}));

export const programs: PostgraduateProgram[] = verifiedProgrammes.map((record) => ({
  id: record.id,
  university: record.university,
  programName: record.degree,
  degreeLevel: "Masters",
  discipline: record.degree.toLowerCase().includes("cyber") ? "Cyber Security" : "Information Technology",
  country: record.country,
  city: record.city,
  duration: record.duration ?? "Not published",
  tuitionText: record.tuition ?? "Not published",
  intake: "Refer to official course page",
  deadline: record.deadline ?? "",
  entryRequirements: record.entryRequirements,
  languageRequirements: record.ielts ?? "Refer to official university requirements",
  greRequirement: record.gre ?? "Not published",
  recommendationLetters: "Not published",
  requiredDocuments: ["Academic transcript", "CV or résumé", "Personal statement"],
  applicationUrl: record.officialUrl,
  suitableProfileIds: [YUHAN_ID],
  sampleData: false,
  verified: record.verified,
  sourceType: record.sourceType,
  lastUpdated: record.lastUpdated,
  nextReviewDate: record.nextReviewDate,
  language: record.language,
  region: record.region,
  confidence: record.confidence,
}));

function roadmap(profileId: string, items: string[], category: RoadmapItem["category"], withPlanningDates = true): RoadmapItem[] {
  return items.map((title, index) => ({
    id: `${profileId}-r${index + 1}`,
    profileId,
    title,
    description: "",
    category,
    targetDate: withPlanningDates ? `2026-${String(8 + Math.floor(index / 2)).padStart(2, "0")}-${String(10 + index).padStart(2, "0")}` : "",
    status: "Not started",
    priority: index < 2 ? "High" : "Medium",
  }));
}

function workspace(profile: CareerProfile): ProfileWorkspace {
  const items =
    profile.id === YUHAN_ID
      ? ["Complete CareerOS MVP", "Continue WearAgain iteration", "Finalise English résumé", "Finalise Chinese résumé", "Build SQL fundamentals", "Research postgraduate pathways", "Apply for suitable internships"]
      : ["Stage 1 — Confirm qualification completion", "Stage 1 — Review Ahpra graduate-registration guidance", "Stage 1 — Prepare identity and qualification documents", "Stage 1 — Confirm English-language evidence requirements", "Stage 1 — Review professional indemnity insurance obligations", "Stage 1 — Review CPD and recency-of-practice standards", "Stage 1 — Submit or track registration application", "Stage 1 — Confirm registration status on the practitioner register", "Stage 2 — Prepare clinical résumé and cover letters", "Stage 2 — Prepare referee list and clinical case examples", "Stage 3 — Build a Canberra clinic target list", "Stage 3 — Review current verified vacancies", "Stage 3 — Submit targeted applications and schedule follow-ups", "Stage 3 — Prepare chiropractic interview questions", "Stage 4 — Plan induction, mentoring and professional development"];
  const base: ProfileWorkspace = {
    profile,
    savedJobIds: [],
    applications: [],
    savedProgramIds: [],
    postgraduateApplications: [],
    roadmapItems: roadmap(profile.id, items, profile.id === TOMMY_ID ? "Registration" : "Project", profile.id !== TOMMY_ID),
    organisationNotes: {},
    savedOpportunityIds: profile.id === YUHAN_ID ? ["opportunity-atlassian-au-intern-program"] : [],
    contacts: [],
    documents: [],
    chinaCampusOpportunities: profile.id === YUHAN_ID ? structuredClone(verifiedChinaCampusOpportunities) : [],
  };
  if (profile.id === YUHAN_ID) {
    base.savedJobIds = ["atlassian-au-intern-program"];
    base.applications = [
      {
        id: "demo-application-yuhan",
        profileId: YUHAN_ID,
        jobId: "atlassian-au-intern-program",
        organisationName: "Atlassian",
        jobTitle: "Australia Internship Program",
        status: "Preparing",
        source: "Other",
        savedAt: "2026-07-28T09:00:00.000Z",
        appliedAt: "",
        nextAction: "Review sample role requirements",
        nextActionDate: "2026-08-03",
        cvVersion: "English résumé v1",
        notes: "Sample planning record.",
        lastUpdatedAt: "2026-07-28T09:00:00.000Z",
        activity: [
          {
            id: "demo-activity-yuhan",
            type: "created",
            label: "Application created",
            occurredAt: "2026-07-28T09:00:00.000Z",
          },
        ],
        statusHistory: [{ id: "demo-status-yuhan", status: "Preparing", timestamp: "2026-07-28T09:00:00.000Z", notes: "Sample planning record." }],
      },
      ...structuredClone(yuhanKnownApplications),
    ];
  } else {
    const templates: Array<[string, CareerDocumentRecord["documentType"]]> = [
      ["Chiropractic résumé", "English résumé"],
      ["General clinical cover letter", "Cover letter"],
      ["Canberra clinic cover letter", "Cover letter"],
      ["Registration evidence/status record", "Other"],
      ["Academic transcript", "Academic transcript"],
      ["Clinical-placement summary", "Other"],
      ["Referee list", "Other"],
      ["Professional-development record", "Other"],
    ];
    base.documents = templates.map(([name, documentType], index) => ({
      id: `tommy-document-template-${index + 1}`,
      profileId: TOMMY_ID,
      documentType,
      name,
      version: "Template",
      updatedAt: "2026-07-29",
      notes: "Empty template. Add only verified personal details.",
      status: "Missing",
      language: "Other",
      parseStatus: "not_uploaded",
    }));
  }
  return base;
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
      demoMode: false,
    },
    profiles: {
      [YUHAN_ID]: workspace(structuredClone(yuhan)),
      [TOMMY_ID]: workspace(structuredClone(tommy)),
    },
  };
}

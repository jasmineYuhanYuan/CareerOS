import { verifiedSource } from "@/data/intelligence/source";
import type {
  CompanyInterviewRecord,
  OnlineAssessmentRecord,
} from "@/data/intelligence/types";

export const atlassianEarlyCareersInterview: CompanyInterviewRecord = {
  ...verifiedSource({
    source: "Atlassian Early Careers Interview Guide",
    officialUrl:
      "https://www.atlassian.com/company/careers/resources/applying/early-careers-interview-guide",
    sourceType: "Employer",
    country: "Australia",
    region: "Australia and New Zealand",
    nextReviewDate: "2026-11-09",
  }),
  id: "interview-atlassian-early-careers",
  domain: "Interview",
  company: "Atlassian",
  audience: "Intern and graduate applicants",
  stages: [
    "Application review",
    "Role-specific initial assessment",
    "Three to four virtual-first interviews",
  ],
  behavioural:
    "The official guide describes leadership and values interviews with behavioural and situational questions.",
  technical:
    "Software engineering graduates complete an online coding test; craft interviews depend on the role.",
  onlineAssessment:
    "Role-specific: coding test for software engineering or take-home case study for product management.",
  timeline: null,
  difficulty: null,
  preparation: [
    "Align the résumé with the vacancy",
    "Prepare craft examples and STAR stories",
    "Confirm the exact process with the recruiter because it varies by role",
  ],
};

export const amazonUniversitySdeInterview: CompanyInterviewRecord = {
  ...verifiedSource({
    source: "Amazon official university technical interview preparation",
    officialUrl:
      "https://amazon.jobs/content/en/how-we-hire/university/additional-tech",
    sourceType: "Employer",
    country: "Australia",
    region: "Australia and global",
    nextReviewDate: "2026-11-09",
  }),
  id: "interview-amazon-university-sde",
  domain: "Interview",
  company: "Amazon",
  audience: "University technical interns and graduates",
  stages: [
    "Application",
    "Online assessment for SDE roles",
    "Role-dependent technical and behavioural interviews",
  ],
  behavioural:
    "Official preparation material references behavioural skills and Amazon Leadership Principles.",
  technical:
    "Official SDE guidance covers coding, data structures, algorithms and role-dependent system design.",
  onlineAssessment:
    "Amazon states that the SDE online assessment is the first hiring step for internship and full-time SDE roles.",
  timeline:
    "Amazon states candidates should normally hear back within two to five business days after interviews conclude.",
  difficulty: null,
  preparation: [
    "Practise coding outside an IDE",
    "Review data structures and algorithms",
    "Use the official SDE OA and interview preparation material",
  ],
};

export const amazonSdeOnlineAssessment: OnlineAssessmentRecord = {
  ...verifiedSource({
    source: "Amazon official SDE online assessment preparation",
    officialUrl: "https://amazon.jobs/content/en/how-we-hire/university/sde-oa",
    sourceType: "Employer",
    country: "Australia",
    region: "Australia and global",
    nextReviewDate: "2026-11-09",
  }),
  id: "oa-amazon-university-sde",
  domain: "Interview",
  platform: "Amazon online assessment",
  company: "Amazon",
  duration: null,
  questionType: "Coding assessment; exact configuration varies by vacancy",
  calculator: null,
  camera: null,
  programmingLanguage: null,
  difficulty: null,
  evidence:
    "Official Amazon university SDE preparation. It does not guarantee identical assessment content for every Australian team.",
};

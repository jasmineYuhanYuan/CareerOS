import { verifiedSource } from "@/data/intelligence/source";
import type { CompanyInterviewRecord, OnlineAssessmentRecord } from "@/data/intelligence/types";

const source = verifiedSource({
  source: "Xero Early Careers",
  officialUrl: "https://careers.xero.com/early-careers/",
  sourceType: "Employer",
  country: "Australia",
  region: "Australia and global",
});

export const xeroGraduateInterview: CompanyInterviewRecord = {
  ...source,
  id: "interview-xero-graduate",
  domain: "Interview",
  company: "Xero",
  audience: "Graduate and intern applicants",
  stages: [
    "Eligibility check",
    "Logical reasoning assessment and technical skills assessment for technical programs",
    "Pre-recorded video interview",
    "Virtual grad day",
  ],
  behavioural: "The virtual grad day includes a 30-minute behavioural interview",
  technical: "Technical applicants complete a technical assessment; the virtual grad day includes a 30-minute technical assessment",
  onlineAssessment: "HackerRank is used for the language-agnostic technical skills assessment",
  timeline: null,
  difficulty: null,
  preparation: ["Use Xero's linked trial HackerRank assessment", "Review the official eligibility criteria before applying"],
};

export const xeroHackerRankAssessment: OnlineAssessmentRecord = {
  ...source,
  id: "oa-xero-hackerrank",
  domain: "Interview",
  platform: "HackerRank",
  company: "Xero",
  duration: "Approximately 60 minutes for the technical skills assessment, in addition to a separate approximately 15-minute logical assessment",
  questionType: "Technical skills assessment; exact question types are not published on the source page",
  calculator: null,
  camera: null,
  programmingLanguage: "Xero describes the HackerRank test as language-agnostic",
  difficulty: null,
  evidence: "Official Xero early-careers FAQ and application-stage description",
};

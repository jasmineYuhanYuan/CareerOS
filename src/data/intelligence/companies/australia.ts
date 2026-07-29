import { verifiedSource } from "@/data/intelligence/source";
import type { CompanyIntelligenceRecord } from "@/data/intelligence/types";

export const australiaTechnologyCompanies: CompanyIntelligenceRecord[] = [
  {
    ...verifiedSource({ source: "Atlassian Early Careers", officialUrl: "https://www.atlassian.com/company/careers/earlycareers", sourceType: "Employer", country: "Australia", region: "Australia and New Zealand" }),
    id: "company-atlassian-au", domain: "Company", name: "Atlassian", industry: "Collaboration software",
    careerPage: "https://www.atlassian.com/company/careers", graduateProgram: "Australia Graduate Program",
    internship: "Australia Internship Program", officeLocations: ["Sydney"],
    visaPolicy: null, technologyStack: [], interviewStages: [], recruitmentSeason: "Australia and New Zealand early-career recruiting is described for February to June",
    unknownFields: ["Public visa policy", "Official technology stack for all graduate roles", "Current interview stages"],
  },
  {
    ...verifiedSource({ source: "Canva Early Talent", officialUrl: "https://www.canva.com/newsroom/news/a-look-into-early-talent-at-canva/", sourceType: "Employer", country: "Australia", region: "Australia and New Zealand", nextReviewDate: "2026-08-05" }),
    id: "company-canva-au", domain: "Company", name: "Canva", industry: "Design technology",
    careerPage: "https://www.canva.com/careers/", graduateProgram: "Canva Launchpad was described as a 12-month early-career development program",
    internship: "Canva described a 12-week Australia and New Zealand summer internship",
    officeLocations: [], visaPolicy: null,
    technologyStack: [], interviewStages: [], recruitmentSeason: null,
    unknownFields: ["Current intake status", "Current application dates", "Office allocation", "Visa policy", "Interview stages"],
  },
  {
    ...verifiedSource({ source: "Microsoft Careers internship eligibility", officialUrl: "https://careers.microsoft.com/v2/global/en/internship_eligibility", sourceType: "Employer", country: "Australia", region: "Australia and New Zealand" }),
    id: "company-microsoft-au", domain: "Company", name: "Microsoft Australia", industry: "Technology",
    careerPage: "https://careers.microsoft.com/", graduateProgram: "Microsoft Aspire Experience applies to qualifying early-in-profession hires",
    internship: "Australia/New Zealand University Intern",
    officeLocations: [], visaPolicy: "Microsoft states that visas are not sponsored for Australia/New Zealand interns and applicants need work rights",
    technologyStack: [], interviewStages: [], recruitmentSeason: null,
    unknownFields: ["Current Australian vacancies", "Office allocation", "Current interview stages", "Recruitment dates"],
  },
  {
    ...verifiedSource({ source: "Amazon University Talent Australia", officialUrl: "https://amazon.jobs/content/en/career-programs/university?country%5B%5D=AU", sourceType: "Employer", country: "Australia", region: "Australia" }),
    id: "company-amazon-au", domain: "Company", name: "Amazon Australia", industry: "Technology and commerce",
    careerPage: "https://www.amazon.jobs/en/locations/australia", graduateProgram: "Full-time university roles for graduates",
    internship: "University internships",
    officeLocations: [], visaPolicy: null,
    technologyStack: [], interviewStages: [], recruitmentSeason: null,
    unknownFields: ["Public program-wide visa policy", "Office allocation", "Current interview stages", "Recruitment dates"],
  },
  {
    ...verifiedSource({ source: "Xero Early Careers", officialUrl: "https://careers.xero.com/early-careers/", sourceType: "Employer", country: "Australia", region: "Australia and global" }),
    id: "company-xero-au", domain: "Company", name: "Xero", industry: "Accounting software",
    careerPage: "https://careers.xero.com/", graduateProgram: "12-month graduate program in engineering, security, analysis, security engineering or data science",
    internship: "12-month Xcelerate data internship and 3-month engineering summer internship",
    officeLocations: ["Melbourne"], visaPolicy: null, technologyStack: ["HackerRank is used for technical-program assessment; this is an assessment platform, not a production-stack claim"],
    interviewStages: ["Eligibility check", "Logical and technical skills assessments", "Recorded video interview", "Virtual grad day with behavioural interview and technical assessment"],
    recruitmentSeason: null,
    unknownFields: ["Public visa policy", "Current opening and closing dates"],
  },
  {
    ...verifiedSource({ source: "Airwallex Careers", officialUrl: "https://careers.airwallex.com/", sourceType: "Employer", country: "Australia", region: "Global" }),
    id: "company-airwallex-au", domain: "Company", name: "Airwallex", industry: "Financial technology",
    careerPage: "https://careers.airwallex.com/", graduateProgram: null, internship: null,
    officeLocations: ["Melbourne", "Sydney"], visaPolicy: null, technologyStack: [], interviewStages: [], recruitmentSeason: null,
    unknownFields: ["Official graduate program", "Official internship program", "Public visa policy", "Interview stages", "Recruitment dates"],
  },
  {
    ...verifiedSource({ source: "Immutable official jobs portal", officialUrl: "https://jobs.lever.co/immutable", sourceType: "Employer", country: "Australia", region: "Global" }),
    id: "company-immutable-au", domain: "Company", name: "Immutable", industry: "Gaming technology",
    careerPage: "https://jobs.lever.co/immutable", graduateProgram: null, internship: null,
    officeLocations: ["Sydney"], visaPolicy: null, technologyStack: [], interviewStages: [], recruitmentSeason: null,
    unknownFields: ["Official graduate program", "Official internship program", "Program-wide visa policy", "Interview stages", "Recruitment dates"],
  },
];

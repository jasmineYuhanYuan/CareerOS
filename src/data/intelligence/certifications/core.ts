import { verifiedSource } from "@/data/intelligence/source";
import type { CertificationIntelligenceRecord } from "@/data/intelligence/types";

export const certifications: CertificationIntelligenceRecord[] = [
  {
    ...verifiedSource({ source: "AWS Certification", officialUrl: "https://aws.amazon.com/certification/certified-cloud-practitioner/", sourceType: "Official", country: "Global", region: "Global" }),
    id: "cert-aws-cloud-practitioner", domain: "Certification", provider: "AWS", name: "AWS Certified Cloud Practitioner",
    difficulty: "Foundational", recognition: "AWS foundational certification", price: "US$100", duration: "90-minute exam",
    renewal: "Valid for 3 years", recommendedCareers: ["Cloud", "DevOps", "Technical Product Manager"], prerequisites: "No prior IT or cloud experience required by AWS",
  },
  {
    ...verifiedSource({ source: "Google Cloud Certification", officialUrl: "https://cloud.google.com/learn/certification/cloud-digital-leader/", sourceType: "Official", country: "Global", region: "Global" }),
    id: "cert-google-cloud-digital-leader", domain: "Certification", provider: "Google Cloud", name: "Cloud Digital Leader",
    difficulty: "Foundational", recognition: "Google Cloud certification", price: "US$99 plus applicable tax", duration: "90-minute exam",
    renewal: "Valid for 3 years; official renewal exam available during the eligibility period", recommendedCareers: ["Cloud", "Technical Product Manager", "Business Analyst"], prerequisites: "None",
  },
  {
    ...verifiedSource({ source: "Microsoft Credentials", officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/fundamentals", sourceType: "Official", country: "Global", region: "Global" }),
    id: "cert-microsoft-azure-fundamentals", domain: "Certification", provider: "Microsoft", name: "Microsoft Certified: Azure Fundamentals",
    difficulty: "Beginner", recognition: "Microsoft Fundamentals certification", price: null, duration: null,
    renewal: "Microsoft Fundamentals certifications do not expire", recommendedCareers: ["Cloud", "DevOps", "Technical Product Manager"], prerequisites: "No prerequisite stated on the Fundamentals overview",
  },
  {
    ...verifiedSource({ source: "Project Management Institute", officialUrl: "https://www.pmi.org/certifications/project-management-pmp", sourceType: "Professional body", country: "Global", region: "Global" }),
    id: "cert-pmi-pmp", domain: "Certification", provider: "PMI", name: "Project Management Professional (PMP)",
    difficulty: null, recognition: "PMI project leadership certification", price: "US$405 member / US$655 non-member as displayed at verification",
    duration: "180 questions; 240 minutes", renewal: "60 PDUs in each 3-year renewal cycle",
    recommendedCareers: ["Project Manager", "Technical Product Manager", "Consultant"], prerequisites: "PMI states 3+ years of project leadership experience; detailed education and training criteria apply",
  },
];

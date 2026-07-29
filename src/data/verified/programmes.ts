import type { VerifiedProgramme } from "./types";

const base = {
  verified: true,
  lastVerified: "2026-07-29",
  lastUpdated: "2026-07-29",
  nextReviewDate: "2026-10-29",
  country: "Australia",
  language: "en" as const,
  region: "Australia",
  confidence: "High" as const,
  sourceType: "University" as const,
  verificationStatus: "Verified" as const,
};

export const verifiedProgrammes: VerifiedProgramme[] = [
  {
    ...base, id: "unsw-master-it", university: "UNSW Sydney", degree: "Master of Information Technology",
    city: "Sydney", duration: "2 years full-time", tuition: "2026 indicative first-year full fee: A$63,000; CSP first-year contribution: A$9,500",
    deadline: null, entryRequirements: ["Cognate bachelor degree with minimum 65% weighted average, or approved non-cognate pathway"],
    ielts: null, gre: "Not stated on the official course page",
    source: "UNSW Master of Information Technology", officialUrl: "https://www.unsw.edu.au/study/postgraduate/master-of-information-technology",
  },
  {
    ...base, id: "usyd-master-cs", university: "University of Sydney", degree: "Master of Computer Science",
    city: "Sydney", duration: "96 credit points; duration varies by study load", tuition: null,
    deadline: null, entryRequirements: ["Australian bachelor degree in any discipline with a credit average (65%), or equivalent"],
    ielts: "Refer to the university English-language requirements linked from the course page", gre: "Not stated on the official course page",
    source: "University of Sydney Master of Computer Science", officialUrl: "https://www.sydney.edu.au/courses/courses/pc/master-of-computer-science.html",
  },
  {
    ...base, id: "monash-master-it", university: "Monash University", degree: "Master of Information Technology",
    city: "Melbourne", duration: "1.5–2 years full-time depending on prior study",
    tuition: "2026 full fee: A$43,600 per 48 credit points; indicative CSP contribution: A$9,537",
    deadline: null, entryRequirements: ["Any bachelor degree with at least 60% average for two-year entry", "Cognate IT bachelor degree with specified computing foundations and at least 60% average for 1.5-year entry"],
    ielts: "Refer to Monash English-language requirements", gre: "Not stated on the official course page",
    source: "Monash Master of Information Technology", officialUrl: "https://www.monash.edu/study/courses/find-a-course/information-technology-c6001",
  },
  {
    ...base, id: "melbourne-master-cs", university: "University of Melbourne", degree: "Master of Computer Science",
    city: "Melbourne", duration: "2 years full-time or 4 years part-time", tuition: null,
    deadline: null, entryRequirements: ["Refer to the current official entry-requirements section"],
    ielts: null, gre: null,
    source: "University of Melbourne Master of Computer Science", officialUrl: "https://study.unimelb.edu.au/find/courses/graduate/master-of-computer-science/",
  },
  {
    ...base, id: "anu-cyber-specialisation", university: "Australian National University", degree: "Cyber Security specialisation within Master of Computing (Advanced)",
    city: "Canberra", duration: null, tuition: null, deadline: null,
    entryRequirements: ["Enrolment in an eligible ANU program including Master of Computing (Advanced)"],
    ielts: null, gre: null,
    source: "ANU Programs and Courses", officialUrl: "https://programsandcourses.anu.edu.au/specialisation/CSEC-SPEC",
  },
];

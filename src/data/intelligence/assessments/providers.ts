import { verifiedSource } from "@/data/intelligence/source";
import type { AssessmentProviderGuide } from "@/data/intelligence/types";

interface ProviderSeed {
  id: string;
  platform: string;
  guide: string;
  privacy: string;
  accessibility?: string;
  practice?: string;
  categories: string[];
}

const providers: ProviderSeed[] = [
  { id: "hackerrank", platform: "HackerRank", guide: "https://support.hackerrank.com/hc/en-us/categories/1500001605941-Candidates", privacy: "https://www.hackerrank.com/privacy", practice: "https://www.hackerrank.com/domains", categories: ["Coding", "Technical skills"] },
  { id: "codesignal", platform: "CodeSignal", guide: "https://support.codesignal.com/hc/en-us/categories/360000010443-Candidates", privacy: "https://codesignal.com/privacy-policy/", practice: "https://app.codesignal.com/assessments/practice", categories: ["Coding", "Technical skills"] },
  { id: "codility", platform: "Codility", guide: "https://support.codility.com/hc/en-us/categories/360000072539-Candidates", privacy: "https://www.codility.com/privacy-policy/", categories: ["Coding", "Technical skills"] },
  { id: "shl", platform: "SHL", guide: "https://www.shl.com/shldirect/en/assessment-advice/", privacy: "https://www.shl.com/privacy-policy/", practice: "https://www.shl.com/shldirect/en/practice-tests/", categories: ["Ability", "Personality", "Job simulation"] },
  { id: "hirevue", platform: "HireVue", guide: "https://www.hirevue.com/candidates", privacy: "https://www.hirevue.com/legal/privacy", accessibility: "https://www.hirevue.com/accessibility", categories: ["Video interview", "Game-based assessment"] },
  { id: "pymetrics", platform: "Pymetrics", guide: "https://harver.com/candidates/", privacy: "https://harver.com/privacy-policy/", categories: ["Game-based assessment"] },
  { id: "arctic-shores", platform: "Arctic Shores", guide: "https://www.arcticshores.com/candidates", privacy: "https://www.arcticshores.com/privacy-policy", categories: ["Task-based assessment"] },
  { id: "mettl", platform: "Mercer | Mettl", guide: "https://support.mettl.com/portal/en/kb/candidate-support", privacy: "https://mettl.com/privacy-policy/", categories: ["Technical", "Aptitude", "Psychometric"] },
  { id: "karat", platform: "Karat", guide: "https://karat.com/candidate-experience/", privacy: "https://karat.com/privacy-policy/", categories: ["Live technical interview"] },
  { id: "criteria", platform: "Criteria", guide: "https://www.criteriacorp.com/candidates", privacy: "https://www.criteriacorp.com/privacy-policy", categories: ["Aptitude", "Personality", "Skills"] },
  { id: "sova", platform: "Sova", guide: "https://www.sovaassessment.com/candidate-preparation-hub/", privacy: "https://www.sovaassessment.com/privacy-policy/", categories: ["Ability", "Personality", "Video interview"] },
];

export const assessmentProviderGuides: AssessmentProviderGuide[] = providers.map((provider) => ({
  ...verifiedSource({
    source: `${provider.platform} official candidate guidance`,
    officialUrl: provider.guide,
    sourceType: "Official",
    country: "Global",
    region: "Global",
    nextReviewDate: "2026-10-30",
  }),
  id: `provider-${provider.id}`,
  domain: "Interview",
  platform: provider.platform,
  company: "Assessment provider",
  candidateGuideUrl: provider.guide,
  assessmentCategories: provider.categories,
  browserAndDeviceRequirements: null,
  accessibilityUrl: provider.accessibility ?? null,
  privacyUrl: provider.privacy,
  practiceUrl: provider.practice ?? null,
  supportedFormats: provider.categories,
  limitations: [
    "Employer configuration varies by assessment.",
    "This provider record does not imply that a named employer uses the platform.",
    "Device requirements must be checked in the individual invitation.",
  ],
}));

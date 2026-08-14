import type { CareerDocumentRecord, CareerProfile, Opportunity, ParsedResumeData } from "@/types/domain";

const KNOWN_SKILLS = ["React", "TypeScript", "JavaScript", "Python", "Java", "SQL", "Node.js", "Next.js", "AWS", "Git", "Figma", "Product Management", "Machine Learning", "Chiropractic", "Clinical Assessment"];

export function parseResumeEvidence(text: string): ParsedResumeData {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const contains = (value: string) => new RegExp(`\\b${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\ /g, "\\s+")}\\b`, "i").test(text);
  return {
    skills: KNOWN_SKILLS.filter(contains),
    education: lines.filter((line) => /university|bachelor|master|degree|unsw|macquarie/i.test(line)).slice(0, 10),
    experience: lines.filter((line) => /experience|intern|engineer|developer|chiropract|employment/i.test(line)).slice(0, 12),
    certifications: lines.filter((line) => /certif|ahpra|registration/i.test(line)).slice(0, 8),
    languages: ["English", "Chinese", "Mandarin", "Cantonese"].filter(contains),
    links: Array.from(text.matchAll(/https?:\/\/[^\s)>]+/g), (match) => match[0]).slice(0, 10),
  };
}

export function documentHasRealFile(document: CareerDocumentRecord): boolean {
  return Boolean(document.storagePath && document.fileName && document.fileSize && document.uploadedAt);
}

export function documentIsReady(document: CareerDocumentRecord): boolean {
  return document.status === "Ready" && documentHasRealFile(document) && document.parseStatus === "parsed";
}

export function resumeEvidence(documents: CareerDocumentRecord[]): Set<string> {
  return new Set(documents.filter(documentHasRealFile).flatMap((document) => document.parsedData?.skills ?? []).map((skill) => skill.toLowerCase()));
}

export function recommendResumeForOpportunity(
  profile: CareerProfile,
  documents: CareerDocumentRecord[],
  opportunity: Opportunity,
): CareerDocumentRecord | null {
  const resumes = documents.filter((document) => documentHasRealFile(document) && /résumé|resume|cv/i.test(`${document.documentType} ${document.name}`) && document.status !== "Archived");
  const score = (document: CareerDocumentRecord) => {
    const text = `${document.name} ${document.version} ${document.targetMarket ?? ""} ${(document.parsedData?.skills ?? []).join(" ")}`.toLowerCase();
    const skillScore = opportunity.skillTags.filter((skill) => text.includes(skill.toLowerCase())).length * 4;
    const roleScore = opportunity.roleFamilyTags.filter((role) => text.includes(role.toLowerCase())).length * 5;
    const languageScore = opportunity.country === "China" ? document.language === "Chinese" || document.language === "Bilingual" ? 3 : 0 : document.language === "English" || document.language === "Bilingual" ? 3 : 0;
    return skillScore + roleScore + languageScore + (document.isPrimary ? 1 : 0);
  };
  return resumes.sort((a, b) => score(b) - score(a))[0] ?? null;
}

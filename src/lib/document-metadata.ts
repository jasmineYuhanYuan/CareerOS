import { DOCUMENT_MIME_TYPES, MAX_DOCUMENT_BYTES } from "./document-extraction";
import type { AppLocale, CareerDocumentLanguage, CareerDocumentRecord, CareerDocumentType } from "@/types/domain";

export const documentMarkets = ["Australia", "China", "Global"] as const;
export const documentDirections = ["Software Engineering", "Backend", "Frontend", "Full Stack", "AI", "AI Product", "Product", "Data", "Graduate", "Internship", "Other"] as const;
export const resumeTypes: CareerDocumentType[] = ["English technical résumé", "English product résumé", "Chinese technical résumé", "Chinese product résumé", "English résumé", "Chinese résumé", "Cover letter", "Portfolio", "Academic transcript", "Personal statement", "Recommendation materials", "Other"];
export const documentLanguages: CareerDocumentLanguage[] = ["English", "Chinese", "Bilingual", "Other"];

const zhType: Partial<Record<CareerDocumentType, string>> = {
  "Chinese technical résumé": "中文技术简历", "Chinese product résumé": "中文产品简历",
  "English technical résumé": "英文技术简历", "English product résumé": "英文产品简历",
  "Chinese résumé": "中文简历", "English résumé": "英文简历", "Cover letter": "求职信", Portfolio: "作品集", "Academic transcript": "成绩单", "Personal statement": "个人陈述", "Recommendation materials": "推荐材料", Other: "其他",
};
const zhLanguage: Partial<Record<CareerDocumentLanguage, string>> = { Chinese: "中文", English: "英文", Bilingual: "中英双语", Other: "其他" };
export function documentTypeLabel(value: CareerDocumentType, locale: AppLocale) { return locale === "zh-CN" ? zhType[value] ?? value : value; }
export function documentLanguageLabel(value: CareerDocumentLanguage | undefined, locale: AppLocale) { const current = value ?? "Other"; return locale === "zh-CN" ? zhLanguage[current] ?? current : current; }

export function validateDocumentFile(file: Pick<File, "name" | "size" | "type">): string | null {
  const extensionValid = /\.(pdf|docx)$/i.test(file.name);
  if (!extensionValid || !DOCUMENT_MIME_TYPES.includes(file.type as typeof DOCUMENT_MIME_TYPES[number])) return "type";
  if (file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) return "size";
  return null;
}

export function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.(pdf|docx)$/i, "").replace(/(?:^|[_\-\s])v\d+(?=$|[_\-\s])/gi, " ").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function documentFamily(type: CareerDocumentType): string { return type; }
export function nextDocumentVersion(documents: CareerDocumentRecord[], family: string): number {
  return documents.reduce((highest, document) => document.documentFamily === family || (!document.documentFamily && document.documentType === family)
    ? Math.max(highest, document.versionNumber ?? Number(document.version.match(/\d+/)?.[0] ?? 0)) : highest, 0) + 1;
}
export function isLatestDocument(document: CareerDocumentRecord, documents: CareerDocumentRecord[]): boolean {
  const family = document.documentFamily ?? document.documentType;
  return (document.versionNumber ?? Number(document.version.match(/\d+/)?.[0] ?? 0)) === nextDocumentVersion(documents, family) - 1;
}

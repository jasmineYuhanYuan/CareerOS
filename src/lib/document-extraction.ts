import mammoth from "mammoth";
import { parseResumeEvidence } from "@/lib/document-evidence";

export const DOCUMENT_MIME_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] as const;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export async function extractDocument(buffer: Buffer, mimeType: string) {
  let text: string;
  if (mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
  } else if (mimeType === DOCUMENT_MIME_TYPES[1]) {
    text = (await mammoth.extractRawText({ buffer })).value;
  } else {
    throw new Error("Unsupported document type");
  }
  const clean = text.replace(/\u0000/g, "").trim();
  if (!clean) throw new Error("No extractable text found");
  return { text: clean, parsedData: parseResumeEvidence(clean) };
}

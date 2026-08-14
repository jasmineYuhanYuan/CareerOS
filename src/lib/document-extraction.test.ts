import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { extractDocument } from "./document-extraction";

async function docx(text: string): Promise<Buffer> {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/document.xml", `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`);
  return zip.generateAsync({ type: "nodebuffer" });
}

function pdf(text: string): Buffer {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${text.length + 30} >>\nstream\nBT /F1 12 Tf 72 720 Td (${text}) Tj ET\nendstream`,
  ];
  let body = "%PDF-1.4\n"; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(body)); body += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(body); body += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(body);
}

describe("server document extraction", () => {
  it("extracts and parses PDF text", async () => { const result = await extractDocument(pdf("React TypeScript resume"), "application/pdf"); expect(result.text).toContain("React TypeScript"); expect(result.parsedData.skills).toEqual(expect.arrayContaining(["React", "TypeScript"])); });
  it("extracts and parses DOCX text", async () => { const result = await extractDocument(await docx("Python SQL resume"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document"); expect(result.text).toContain("Python SQL"); expect(result.parsedData.skills).toEqual(expect.arrayContaining(["Python", "SQL"])); });
  it("reports parse failures rather than inventing evidence", async () => { await expect(extractDocument(Buffer.from("not a pdf"), "application/pdf")).rejects.toThrow(); await expect(extractDocument(Buffer.from("not a docx"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")).rejects.toThrow(); });
});

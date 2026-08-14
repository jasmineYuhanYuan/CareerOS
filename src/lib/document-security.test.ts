import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve("supabase/migrations/20260814012950_career_documents.sql"), "utf8");
describe("private document schema", () => {
  it("creates a private size- and mime-restricted bucket", () => { expect(migration).toContain("'career-documents'"); expect(migration).toMatch(/public\s*=\s*false/); expect(migration).toContain("10485760"); });
  it("enables RLS and scopes rows and files to auth.uid", () => { expect(migration).toContain("alter table public.career_documents enable row level security"); expect(migration.match(/auth\.uid\(\)/g)?.length).toBeGreaterThanOrEqual(8); expect(migration).toContain("storage.foldername(name)"); });
  it("never grants anonymous access", () => { expect(migration).toContain("revoke all on public.career_documents from anon"); expect(migration).not.toMatch(/policy[^;]+to anon/i); });
});

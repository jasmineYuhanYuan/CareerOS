import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const syncMigration = readFileSync(resolve("supabase/migrations/202608120001_cloud_sync_and_opportunity_audit.sql"), "utf8");
const documentMigration = readFileSync(resolve("supabase/migrations/20260814012950_career_documents.sql"), "utf8");

describe("cloud state and document isolation", () => {
  it("scopes every state operation to auth.uid and protects optimistic revisions", () => {
    expect(syncMigration).toContain("alter table public.careeros_state_snapshots enable row level security");
    expect(syncMigration.match(/auth\.uid\(\)/g)?.length).toBeGreaterThanOrEqual(5);
    expect(syncMigration).toContain("careeros_state_snapshots.revision = expected_revision");
    expect(syncMigration).toContain("revoke all on function public.save_careeros_state(bigint, jsonb) from public, anon");
  });

  it("keeps documents private and scopes rows and object paths to the signed-in user", () => {
    expect(documentMigration).toContain("public = false");
    expect(documentMigration).toContain("(storage.foldername(name))[1] = (select auth.uid())::text");
    expect(documentMigration).toContain("with check ((select auth.uid()) = user_id)");
    expect(documentMigration).toContain("revoke all on public.career_documents from anon");
  });
});

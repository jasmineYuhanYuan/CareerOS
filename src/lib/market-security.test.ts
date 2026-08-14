import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(new URL("../../supabase/migrations/20260814020637_automatic_market_pipeline.sql", import.meta.url), "utf8");

describe("market database security", () => {
  it("enables RLS and permits browser reads without browser writes", () => {
    for (const table of ["market_sources", "market_opportunities", "market_verification_events", "market_audit_runs"]) expect(migration).toContain(`alter table public.${table} enable row level security`);
    expect(migration).toContain("revoke all on public.market_sources");
    expect(migration).toContain("grant select on public.market_sources");
    expect(migration).toContain("grant all on public.market_sources");
  });

  it("enforces verified evidence before Open at database level", () => {
    expect(migration).toContain("lifecycle_status <> 'Open'");
    expect(migration).toContain("verification_status = 'Verified'");
    expect(migration).toContain("apply_url is not null");
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Auth client security", () => {
  it("enables browser session persistence and refresh", () => {
    const source = readFileSync(resolve("src/lib/supabase/browser.ts"), "utf8");
    expect(source).toContain("persistSession: true");
    expect(source).toContain("autoRefreshToken: true");
  });

  it("never exposes the service role from browser auth code", () => {
    const browser = readFileSync(resolve("src/lib/supabase/browser.ts"), "utf8");
    const provider = readFileSync(resolve("src/providers/auth-provider.tsx"), "utf8");
    expect(browser).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(provider).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(browser).not.toContain("serviceRole");
  });

  it("does not reuse the service role key as an HTTP administration secret", () => {
    const cron = readFileSync(resolve("src/app/api/cron/opportunity-audit/route.ts"), "utf8");
    const marketAdmin = readFileSync(resolve("src/app/api/admin/market/route.ts"), "utf8");
    expect(cron).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(marketAdmin).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(cron).toContain("CRON_SECRET");
    expect(marketAdmin).toContain("CRON_SECRET");
  });
});

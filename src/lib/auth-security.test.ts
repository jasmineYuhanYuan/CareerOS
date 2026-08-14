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
});

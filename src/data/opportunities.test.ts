import { describe, expect, it } from "vitest";
import { opportunities, validateOpportunities } from "@/data/opportunities";

describe("curated opportunity data", () => {
  it("passes runtime validation with unique IDs and valid organisation references", () => {
    expect(validateOpportunities(opportunities)).toEqual({ valid: true, errors: [] });
    expect(new Set(opportunities.map((item) => item.id)).size).toBe(opportunities.length);
  });

  it("requires source metadata for official-source records", () => {
    const record = { ...opportunities[0], id: "official-without-source", verificationStatus: "Official source" as const, sourceUrl: undefined, lastVerifiedAt: undefined };
    const result = validateOpportunities([record]);
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("Official source requires URL");
  });

  it("rejects duplicate IDs", () => {
    const result = validateOpportunities([opportunities[0], opportunities[0]]);
    expect(result.errors.join(" ")).toContain("Duplicate opportunity ID");
  });
});

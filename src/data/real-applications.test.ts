import { describe, expect, it } from "vitest";
import { mergeKnownYuhanApplications, yuhanKnownApplications } from "@/data/real-applications";

describe("known Yuhan applications", () => {
  it("includes only applications with confirmed submission evidence", () => {
    expect(yuhanKnownApplications.map((item) => item.organisationName)).toEqual([
      "小红书",
      "PriFi",
      "PrimePilot AI",
      "Solotude",
      "swipejobs",
    ]);
    expect(yuhanKnownApplications.slice(1).every((item) => item.status === "Applied")).toBe(true);
  });

  it("adds missing records without creating duplicates", () => {
    const firstMerge = mergeKnownYuhanApplications([]);
    const secondMerge = mergeKnownYuhanApplications(firstMerge);

    expect(firstMerge).toHaveLength(yuhanKnownApplications.length);
    expect(secondMerge).toHaveLength(yuhanKnownApplications.length);
    expect(new Set(secondMerge.map((item) => item.id)).size).toBe(secondMerge.length);
  });

  it("preserves user-edited application state", () => {
    const submitted = yuhanKnownApplications.find((item) => item.organisationName === "PriFi");
    expect(submitted).toBeDefined();
    if (!submitted) return;

    const edited = {
      ...structuredClone(submitted),
      status: "Interview Invitation" as const,
      notes: "Interview invitation received.",
      lastUpdatedAt: "2026-10-13T00:00:00.000Z",
    };
    const merged = mergeKnownYuhanApplications([edited]);
    const result = merged.find((item) => item.organisationName === "PriFi");

    expect(result?.status).toBe("Interview Invitation");
    expect(result?.notes).toBe("Interview invitation received.");
    expect(result?.materials).toEqual(edited.materials);
  });
});

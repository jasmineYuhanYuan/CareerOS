import { describe, expect, it } from "vitest";
import { mergeKnownYuhanApplications, yuhanKnownApplications } from "@/data/real-applications";

describe("known Yuhan applications", () => {
  it("includes only applications with confirmed submission evidence", () => {
    expect(yuhanKnownApplications).toHaveLength(12);
    expect(yuhanKnownApplications.filter((item) => item.organisationName === "美团")).toHaveLength(4);
    expect(yuhanKnownApplications.filter((item) => item.organisationName === "百度")).toHaveLength(3);
    const newPortalRecords = yuhanKnownApplications.filter((item) => item.organisationName === "美团" || item.organisationName === "百度");
    expect(newPortalRecords.every((item) => item.appliedAt === "2026-10-14")).toBe(true);
  });

  it("maps the official portal stages without overstating pending preferences", () => {
    const meituanScreening = yuhanKnownApplications.find((item) => item.jobId === "meituan-fintech-ai-fullstack-intern-2027");
    const meituanPending = yuhanKnownApplications.filter((item) => item.organisationName === "美团" && item.notes.includes("待开启"));
    const baidu = yuhanKnownApplications.filter((item) => item.organisationName === "百度");

    expect(meituanScreening?.status).toBe("Resume Screening");
    expect(meituanPending).toHaveLength(2);
    expect(meituanPending.every((item) => item.status === "Applied")).toBe(true);
    expect(baidu.every((item) => item.status === "Resume Screening")).toBe(true);
    expect(baidu.every((item) => item.notes.includes("截图未显示具体投递时间"))).toBe(true);
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

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createSeedState, YUHAN_ID } from "@/data/seed";
import { formatDate } from "@/i18n/format";
import { missingChineseKeys } from "@/i18n";
import {
  displayCompanyName,
  displayUiValue,
  formatRelativeDate,
  knownEnglishUiLabels,
} from "@/i18n/presentation";

describe("Chinese product localisation", () => {
  it("keeps English and zh-CN dictionaries in complete key parity", () => {
    expect(missingChineseKeys()).toEqual([]);
  });

  it("translates every audited English interface label", () => {
    expect(knownEnglishUiLabels.length).toBeGreaterThan(70);
    expect(
      knownEnglishUiLabels.every(
        (label) => displayUiValue(label, "zh-CN") !== label,
      ),
    ).toBe(true);
  });

  it("preserves language-independent enum storage and English fallback", () => {
    const storedStatus = "Interview";
    expect(displayUiValue(storedStatus, "zh-CN")).toBe("面试");
    expect(displayUiValue(storedStatus, "en")).toBe(storedStatus);
    expect(storedStatus).toBe("Interview");
  });

  it("uses recognised Chinese company names without changing source data", () => {
    const sourceCompany = "Baidu";
    expect(displayCompanyName(sourceCompany, "zh-CN")).toBe("百度");
    expect(displayCompanyName(sourceCompany, "en")).toBe(sourceCompany);
  });

  it("formats Chinese absolute and relative dates naturally", () => {
    expect(formatDate("2026-08-11", "zh-CN")).toBe("2026年8月11日");
    expect(formatRelativeDate("2026-08-11", "zh-CN", "2026-08-11")).toBe(
      "今天",
    );
    expect(formatRelativeDate("2026-08-12", "zh-CN", "2026-08-11")).toBe(
      "明天",
    );
    expect(formatRelativeDate("2026-08-14", "zh-CN", "2026-08-11")).toBe(
      "3天后",
    );
    expect(formatRelativeDate("2026-08-09", "zh-CN", "2026-08-11")).toBe(
      "已逾期2天",
    );
  });

  it("does not mutate profile or application data when language changes", () => {
    const before = createSeedState().profiles[YUHAN_ID];
    const after = structuredClone(before);
    const locale = "zh-CN";
    expect(locale).toBe("zh-CN");
    expect(after).toEqual(before);
  });

  it("removes uppercase and excessive tracking from Chinese eyebrow text", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(css).toMatch(
      /html\[lang="zh-CN"\] \.eyebrow \{[\s\S]*?letter-spacing:\s*0;[\s\S]*?text-transform:\s*none;/,
    );
  });
});

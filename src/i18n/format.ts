import type { AppLocale } from "@/types/domain";

export function localeCode(locale: AppLocale): "en-AU" | "zh-CN" {
  return locale === "zh-CN" ? "zh-CN" : "en-AU";
}

export function formatDate(value: string, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "";
  return new Intl.DateTimeFormat(localeCode(locale), options ?? { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${value}T00:00:00`));
}

export function formatPercentage(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(localeCode(locale), { style: "percent", maximumFractionDigits: 0 }).format(value / 100);
}

export function formatList(values: string[], locale: AppLocale): string {
  return new Intl.ListFormat(localeCode(locale), { style: "long", type: "conjunction" }).format(values);
}

export function formatCurrency(value: number, currency: string, locale: AppLocale): string {
  return new Intl.NumberFormat(localeCode(locale), { style: "currency", currency }).format(value);
}

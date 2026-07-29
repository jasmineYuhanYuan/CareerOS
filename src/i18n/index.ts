import { en } from "./en";
import { zhCN } from "./zh-CN";
import type { AppLocale } from "@/types/domain";
import type { TranslationKey } from "./types";

export type { TranslationKey };
export { en, zhCN };

export function getTranslation(locale: AppLocale, key: TranslationKey, values?: Record<string, string | number>): string {
  const translated = locale === "zh-CN" ? zhCN[key] : en[key];
  if (locale === "zh-CN" && !translated && process.env.NODE_ENV === "development") {
    console.warn(`[i18n] Missing zh-CN translation for “${key}”; using English fallback.`);
  }
  const template = translated ?? en[key];
  return Object.entries(values ?? {}).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

export function missingChineseKeys(): TranslationKey[] {
  return (Object.keys(en) as TranslationKey[]).filter((key) => !zhCN[key]);
}

"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useCareerOS } from "@/providers/careeros-provider";
import { getTranslation, type TranslationKey } from "@/i18n";
import type { AppLocale } from "@/types/domain";

interface LanguageContextValue {
  language: AppLocale;
  setLanguage: (language: AppLocale) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { state, setLanguage } = useCareerOS();
  const language = state.language;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "en" ? "zh-CN" : "en"),
    t: (key, values) => getTranslation(language, key, values),
  }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider.");
  return context;
}

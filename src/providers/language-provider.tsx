"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppLanguage = "en" | "zh";

interface LanguageContextValue {
  language: AppLanguage;
  toggleLanguage: () => void;
}

const LANGUAGE_STORAGE_KEY = "careeros-language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>("en");

  useEffect(() => {
    queueMicrotask(() => {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const initialLanguage: AppLanguage = stored === "zh" ? "zh" : "en";
      setLanguage(initialLanguage);
      document.documentElement.lang = initialLanguage === "zh" ? "zh-CN" : "en";
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => {
      const next = current === "en" ? "zh" : "en";
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
      return next;
    });
  }, []);

  const value = useMemo(() => ({ language, toggleLanguage }), [language, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider.");
  return context;
}

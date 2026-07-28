"use client";

import { useLanguage } from "@/providers/language-provider";

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, toggleLanguage } = useLanguage();
  const isEnglish = language === "en";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={isEnglish ? "切换为中文" : "Switch to English"}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] focus:border-[var(--accent)] ${
        compact ? "min-w-11 px-2 text-xs" : "w-full gap-2 px-3 text-sm"
      }`}
    >
      <span className={isEnglish ? "text-[var(--text-primary)]" : ""}>EN</span>
      <span aria-hidden="true" className="text-[var(--border-strong)]">/</span>
      <span className={!isEnglish ? "text-[var(--text-primary)]" : ""}>中文</span>
    </button>
  );
}

"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import { formatDate } from "@/i18n/format";
import type { AppLocale, ThemePreference } from "@/types/domain";

export function SettingsPanel() {
  const { state, activeWorkspace, setTheme, setLanguage, updateDashboardPreferences, setDefaultProfile, resetCurrentProfile, resetAll, exportData, importData } = useCareerOS();
  const { language, t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function download() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `careeros-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    const result = importData(await file.text());
    setMessage(result.message);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="page-enter">
      <PageHeading eyebrow={t("settings.eyebrow")} title={t("settings.title")} description={t("settings.description")} />
      {message && <p role="status" className="mb-5 rounded-xl bg-[var(--success-soft)] p-4 text-sm font-medium text-[var(--success)]">{message}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card eyebrow={t("settings.appearance")} title={t("settings.theme")}>
          <label className="block text-sm font-medium">Theme<Select value={state.theme} onChange={(e) => setTheme(e.target.value as ThemePreference)}>{["System", "Light", "Dark"].map((value) => <option key={value}>{value}</option>)}</Select></label>
        </Card>
        <Card eyebrow="Language" title={t("settings.language")}>
          <label className="block text-sm font-medium">{t("settings.language")}<Select value={state.language} onChange={(event) => setLanguage(event.target.value as AppLocale)}><option value="en">EN</option><option value="zh-CN">中文</option></Select></label>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">{t("settings.datePreview")}: {formatDate(new Date().toISOString().slice(0, 10), language)}</p>
        </Card>
        <Card eyebrow={t("settings.opportunities")} title={t("settings.discovery")}>
          <label className="block text-sm font-medium">{t("settings.region")}<Select value={state.dashboardPreferences.defaultRegion} onChange={(event) => updateDashboardPreferences({ ...state.dashboardPreferences, defaultRegion: event.target.value })}>{["Australia", "United States", "United Kingdom", "Singapore", "All regions"].map((value) => <option key={value}>{value}</option>)}</Select></label>
          <label className="mt-4 flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={state.dashboardPreferences.showSampleData} onChange={(event) => updateDashboardPreferences({ ...state.dashboardPreferences, showSampleData: event.target.checked })} />{t("settings.sample")}</label>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={state.dashboardPreferences.showArchivedOpportunities} onChange={(event) => updateDashboardPreferences({ ...state.dashboardPreferences, showArchivedOpportunities: event.target.checked })} />{t("settings.archived")}</label>
        </Card>
        <Card eyebrow={t("profile.edit")} title={t("settings.defaultProfile")}>
          <label className="block text-sm font-medium">Profile shown by default<Select value={state.defaultProfileId} onChange={(e) => setDefaultProfile(e.target.value)}>{Object.values(state.profiles).map((workspace) => <option key={workspace.profile.id} value={workspace.profile.id}>{workspace.profile.displayName}</option>)}</Select></label>
        </Card>
        <Card eyebrow={t("settings.backup")} title={t("settings.backup")}>
          <p className="text-sm leading-7 text-[var(--text-secondary)]">Exports include storage version {state.version}, both profile workspaces and all locally saved records.</p>
          <div className="mt-5 flex flex-wrap gap-2"><Button onClick={download}>{t("settings.export")}</Button><Button variant="secondary" onClick={() => inputRef.current?.click()}>{t("settings.import")}</Button><input ref={inputRef} className="sr-only" type="file" accept="application/json,.json" aria-label={t("settings.import")} onChange={(e) => void upload(e.target.files?.[0])} /></div>
        </Card>
        <Card eyebrow={t("settings.privacy")} title={t("settings.privacy")}>
          <p className="text-sm leading-7 text-[var(--text-secondary)]">CareerOS currently uses localStorage. Data is not synced to a server, shared between browsers or protected by an account. Export a backup before clearing browser data.</p>
        </Card>
        <Card className="lg:col-span-2" eyebrow={t("settings.reset")} title={t("settings.reset")}>
          <div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => window.confirm(t("settings.resetProfileConfirm", { name: activeWorkspace.profile.displayName })) && resetCurrentProfile()}>{t("settings.resetProfile")}</Button><Button variant="danger" onClick={() => window.confirm(t("settings.resetAllConfirm")) && resetAll()}>{t("settings.resetAll")}</Button></div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import { formatDate } from "@/i18n/format";
import type { AppLocale, ThemePreference } from "@/types/domain";
import { useToast } from "@/providers/toast-provider";
import { pullCloudState, pushCloudState } from "@/lib/cloud-sync";
import { useAuth } from "@/providers/auth-provider";

export function SettingsPanel() {
  const { state, activeWorkspace, setTheme, setLanguage, updateDashboardPreferences, setDefaultProfile, resetCurrentProfile, resetAll, exportData, importData } = useCareerOS();
  const { language, t } = useLanguage();
  const { notify } = useToast();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [syncBusy, setSyncBusy] = useState(false);

  async function runSync(action: () => Promise<string>) {
    setSyncBusy(true);
    try {
      const result = await action();
      setMessage(result);
      notify(result, "success");
    } catch (error) {
      const result = error instanceof Error ? error.message : t("settings.syncFailed");
      setMessage(result);
      notify(result, "error");
    } finally {
      setSyncBusy(false);
    }
  }

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
    notify(result.ok ? t("feedback.importSucceeded") : t("feedback.importFailed"), result.ok ? "success" : "error");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="page-enter">
      <PageHeading eyebrow={t("settings.eyebrow")} title={t("settings.title")} description={t("settings.description")} />
      {message && <p role="status" className="mb-5 rounded-xl bg-[var(--success-soft)] p-4 text-sm font-medium text-[var(--success)]">{message}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card eyebrow={t("settings.demo")} title={t("settings.demo")}>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{t("settings.demoDescription")}</p>
          <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium"><input type="checkbox" checked={state.dashboardPreferences.demoMode} onChange={(event) => updateDashboardPreferences({ ...state.dashboardPreferences, demoMode: event.target.checked, showSampleData: event.target.checked || state.dashboardPreferences.showSampleData })} />{t("settings.demoLabel")}</label>
          {state.dashboardPreferences.demoMode && <Button className="mt-3" variant="secondary" onClick={() => window.confirm(t("settings.resetAllConfirm")) && resetAll()}>{t("settings.demoReset")}</Button>}
        </Card>
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
        <Card eyebrow={t("settings.cloudSync")} title={t("settings.cloudSync")}>
          <p className="text-sm leading-7 text-[var(--text-secondary)]">{t("settings.cloudSyncDescription")}</p>
          {isLoading ? <p className="mt-3 text-sm text-[var(--text-secondary)]">{language === "zh-CN" ? "正在检查登录状态…" : "Checking sign-in status…"}</p> : isAuthenticated ? (
            <>
              <p className="mt-3 text-sm font-medium">{t("settings.signedInAs", { email: user?.email ?? "" })}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button disabled={syncBusy} onClick={() => void runSync(async () => {
                  await pushCloudState(state);
                  return t("settings.uploadComplete");
                })}>{t("settings.uploadCloud")}</Button>
                <Button variant="secondary" disabled={syncBusy} onClick={() => void runSync(async () => {
                  const snapshot = await pullCloudState();
                  if (!snapshot) return t("settings.noCloudCopy");
                  const result = importData(JSON.stringify(snapshot.state));
                  if (!result.ok) throw new Error(result.message);
                  return t("settings.downloadComplete");
                })}>{t("settings.downloadCloud")}</Button>
                <Button variant="secondary" disabled={syncBusy} onClick={() => void runSync(async () => {
                  await signOut();
                  return t("settings.signedOut");
                })}>{t("settings.signOut")}</Button>
              </div>
            </>
          ) : (
            <Link href="/auth" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white">{language === "zh-CN" ? "登录或注册" : "Sign in or create account"}</Link>
          )}
        </Card>
        <Card eyebrow={t("settings.privacy")} title={t("settings.privacy")}>
          <p className="text-sm leading-7 text-[var(--text-secondary)]">{t("settings.privacyDescription")}</p>
        </Card>
        <Card className="lg:col-span-2" eyebrow={t("settings.reset")} title={t("settings.reset")}>
          <div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => window.confirm(t("settings.resetProfileConfirm", { name: activeWorkspace.profile.displayName })) && resetCurrentProfile()}>{t("settings.resetProfile")}</Button><Button variant="danger" onClick={() => window.confirm(t("settings.resetAllConfirm")) && resetAll()}>{t("settings.resetAll")}</Button></div>
        </Card>
      </div>
    </div>
  );
}

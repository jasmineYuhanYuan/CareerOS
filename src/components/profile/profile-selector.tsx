"use client";

import Link from "next/link";
import { useCareerOS } from "@/providers/careeros-provider";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";
import { mappedWorkspaceProfileId } from "@/lib/candidate-profile";

export function ProfileSelector() {
  const { activeWorkspace, state, setActiveProfileId } = useCareerOS();
  const { isAuthenticated, isLoading, user, candidateProfile } = useAuth();
  const { language } = useLanguage(); const zh = language === "zh-CN";
  const activeProfile = activeWorkspace.profile;
  const profiles = Object.values(state.profiles).map((workspace) => workspace.profile);
  const mappedId = mappedWorkspaceProfileId(candidateProfile, profiles.map((profile) => profile.id));

  return (
    <div className="block">
      <label className="sr-only" htmlFor="active-profile-selector">Active profile</label>
      <span className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2" title={activeProfile.displayName}>
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-primary)]">
          {activeProfile.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("")}
        </span>
        <span className="min-w-0 flex-1">
          <select
            id="active-profile-selector"
            className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-[0.82rem] font-medium text-[var(--text-primary)]"
            value={activeProfile.id}
            onChange={(event) => setActiveProfileId(event.target.value)}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.displayName}</option>
            ))}
          </select>
        </span>
        <span aria-hidden="true" className="-ml-6 text-xs text-[var(--text-tertiary)]">⌄</span>
      </span>
      <span className="mt-1.5 flex items-center justify-between px-1 text-[0.68rem] text-[var(--text-tertiary)]">
        <span>{isLoading ? (zh ? "正在检查登录状态" : "Checking sign-in") : isAuthenticated ? (zh ? "已登录" : "Signed in") : (zh ? "访客工作区 · 未登录" : "Guest workspace · Not signed in")}</span>
        {isAuthenticated ? <span title={user?.email ?? undefined}>{mappedId === activeProfile.id ? (zh ? "资料已绑定" : "Profile linked") : (zh ? "资料未绑定" : "Profile not linked")}</span> : <Link className="font-medium text-[var(--accent)]" href="/auth">{zh ? "登录" : "Sign in"}</Link>}
      </span>
    </div>
  );
}

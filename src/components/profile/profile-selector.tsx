"use client";

import { useCareerOS } from "@/providers/careeros-provider";

export function ProfileSelector() {
  const { activeWorkspace, state, setActiveProfileId } = useCareerOS();
  const activeProfile = activeWorkspace.profile;
  const profiles = Object.values(state.profiles).map((workspace) => workspace.profile);

  return (
    <label className="block">
      <span className="sr-only">Active profile</span>
      <span className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
          {activeProfile.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("")}
        </span>
        <span className="min-w-0 flex-1">
          <select
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
    </label>
  );
}

"use client";

import { useCareerOS } from "@/providers/careeros-provider";

export function ProfileSelector() {
  const { activeWorkspace, state, setActiveProfileId } = useCareerOS();
  const activeProfile = activeWorkspace.profile;
  const profiles = Object.values(state.profiles).map((workspace) => workspace.profile);

  return (
    <label className="block">
      <span className="sr-only">Active profile</span>
      <span className="flex items-center gap-3 rounded-xl border border-[#d7d8cf] bg-white/70 p-2.5">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#dce9df] text-sm font-bold text-[#245b45]">
          {activeProfile.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.65rem] font-bold uppercase tracking-[0.13em] text-[#7c857f]">
            Active profile
          </span>
          <select
            className="mt-0.5 w-full cursor-pointer appearance-none bg-transparent pr-5 text-sm font-semibold text-[#17211b]"
            value={activeProfile.id}
            onChange={(event) => setActiveProfileId(event.target.value)}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.displayName}</option>
            ))}
          </select>
        </span>
        <span aria-hidden="true" className="-ml-6 text-xs text-[#68736c]">▾</span>
      </span>
    </label>
  );
}

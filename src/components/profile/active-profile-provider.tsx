"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { profiles } from "@/data/profiles";
import type { CareerProfile } from "@/types/profile";

interface ActiveProfileContextValue {
  activeProfile: CareerProfile;
  profiles: readonly CareerProfile[];
  setActiveProfileId: (profileId: string) => void;
}

const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(null);

export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfileId, setActiveProfileId] = useState(profiles[0]?.id ?? "");
  const value = useMemo<ActiveProfileContextValue>(() => {
    const activeProfile = profiles.find((profile) => profile.id === activeProfileId);
    if (!activeProfile) throw new Error("No active career profile is available.");
    return { activeProfile, profiles, setActiveProfileId };
  }, [activeProfileId]);

  return (
    <ActiveProfileContext.Provider value={value}>
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile(): ActiveProfileContextValue {
  const context = useContext(ActiveProfileContext);
  if (!context) {
    throw new Error("useActiveProfile must be used within ActiveProfileProvider.");
  }
  return context;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSeedState, jobs, programs } from "@/data/seed";
import { parseStoredState, readState, saveState, serialiseState, validateState } from "@/lib/storage";
import type {
  CareerOSState,
  CareerProfile,
  CareerContact,
  CareerDocumentRecord,
  DashboardPreferences,
  JobApplication,
  PostgraduateApplication,
  RoadmapItem,
  ThemePreference,
  AppLocale,
} from "@/types/domain";

interface CareerOSContextValue {
  state: CareerOSState;
  activeWorkspace: CareerOSState["profiles"][string];
  hydrated: boolean;
  storageError: string;
  setActiveProfileId: (id: string) => void;
  updateProfile: (profile: CareerProfile) => void;
  upsertProfile: (profile: CareerProfile) => void;
  toggleSavedJob: (jobId: string) => void;
  addJobApplication: (jobId: string) => void;
  createApplication: (application: JobApplication) => void;
  updateApplication: (application: JobApplication) => void;
  deleteApplication: (id: string) => void;
  toggleSavedProgram: (programId: string) => void;
  addPostgraduateApplication: (programId: string) => void;
  updatePostgraduateApplication: (application: PostgraduateApplication) => void;
  upsertRoadmapItem: (item: RoadmapItem) => void;
  deleteRoadmapItem: (id: string) => void;
  updateOrganisationNote: (organisationId: string, note: string) => void;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: AppLocale) => void;
  updateDashboardPreferences: (preferences: DashboardPreferences) => void;
  toggleSavedOpportunity: (opportunityId: string) => void;
  upsertContact: (contact: CareerContact) => void;
  deleteContact: (id: string) => void;
  upsertDocument: (document: CareerDocumentRecord) => void;
  deleteDocument: (id: string) => void;
  setDefaultProfile: (id: string) => void;
  resetCurrentProfile: () => void;
  resetAll: () => void;
  exportData: () => string;
  importData: (raw: string) => { ok: boolean; message: string };
}

const CareerOSContext = createContext<CareerOSContextValue | null>(null);

function now(): string {
  return new Date().toISOString();
}

export function CareerOSProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CareerOSState>(createSeedState);
  const [hydrated, setHydrated] = useState(false);
  const storageError = "";

  useEffect(() => {
    queueMicrotask(() => {
      setState(readState(window.localStorage));
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(window.localStorage, state);
    document.documentElement.dataset.theme = state.theme.toLowerCase();
  }, [hydrated, state]);

  const updateActive = useCallback(
    (updater: (workspace: CareerOSState["profiles"][string]) => CareerOSState["profiles"][string]) => {
      setState((current) => ({
        ...current,
        profiles: {
          ...current.profiles,
          [current.activeProfileId]: updater(current.profiles[current.activeProfileId]),
        },
      }));
    },
    [],
  );

  const setActiveProfileId = useCallback((id: string) => {
    setState((current) => current.profiles[id] ? { ...current, activeProfileId: id } : current);
  }, []);

  const updateProfile = useCallback((profile: CareerProfile) => {
    updateActive((workspace) => ({ ...workspace, profile }));
  }, [updateActive]);

  const upsertProfile = useCallback((profile: CareerProfile) => {
    setState((current) => {
      const existing = current.profiles[profile.id];
      const workspace: CareerOSState["profiles"][string] = existing
        ? { ...existing, profile }
        : {
          profile,
          savedJobIds: [],
          applications: [],
          savedProgramIds: [],
          postgraduateApplications: [],
          roadmapItems: [],
          organisationNotes: {},
          savedOpportunityIds: [],
          contacts: [],
          documents: [],
        };
      return {
        ...current,
        activeProfileId: profile.id,
        profiles: { ...current.profiles, [profile.id]: workspace },
      };
    });
  }, []);

  const toggleSavedJob = useCallback((jobId: string) => {
    updateActive((workspace) => ({
      ...workspace,
      savedJobIds: workspace.savedJobIds.includes(jobId)
        ? workspace.savedJobIds.filter((id) => id !== jobId)
        : [...workspace.savedJobIds, jobId],
    }));
  }, [updateActive]);

  const createApplication = useCallback((application: JobApplication) => {
    updateActive((workspace) => ({ ...workspace, applications: [...workspace.applications, application] }));
  }, [updateActive]);

  const addJobApplication = useCallback((jobId: string) => {
    updateActive((workspace) => {
      if (workspace.applications.some((item) => item.jobId === jobId)) return workspace;
      const job = jobs.find((item) => item.id === jobId);
      if (!job) return workspace;
      const timestamp = now();
      const application: JobApplication = {
        id: `application-${Date.now()}`,
        profileId: workspace.profile.id,
        jobId,
        organisationName: job.companyName,
        jobTitle: job.title,
        status: "Preparing",
        savedAt: timestamp,
        appliedAt: "",
        nextAction: "Review sample role and confirm vacancy details",
        nextActionDate: "",
        cvVersion: "",
        notes: "",
        lastUpdatedAt: timestamp,
        activity: [{ id: `activity-${Date.now()}`, type: "created", label: "Application created", occurredAt: timestamp }],
      };
      return {
        ...workspace,
        savedJobIds: workspace.savedJobIds.includes(jobId) ? workspace.savedJobIds : [...workspace.savedJobIds, jobId],
        applications: [...workspace.applications, application],
      };
    });
  }, [updateActive]);

  const updateApplication = useCallback((application: JobApplication) => {
    updateActive((workspace) => ({
      ...workspace,
      applications: workspace.applications.map((item) => item.id === application.id ? application : item),
    }));
  }, [updateActive]);

  const deleteApplication = useCallback((id: string) => {
    updateActive((workspace) => ({ ...workspace, applications: workspace.applications.filter((item) => item.id !== id) }));
  }, [updateActive]);

  const toggleSavedProgram = useCallback((programId: string) => {
    updateActive((workspace) => ({
      ...workspace,
      savedProgramIds: workspace.savedProgramIds.includes(programId)
        ? workspace.savedProgramIds.filter((id) => id !== programId)
        : [...workspace.savedProgramIds, programId],
    }));
  }, [updateActive]);

  const addPostgraduateApplication = useCallback((programId: string) => {
    updateActive((workspace) => {
      if (workspace.postgraduateApplications.some((item) => item.programId === programId)) return workspace;
      const program = programs.find((item) => item.id === programId);
      if (!program) return workspace;
      const documents: PostgraduateApplication["documents"] = {
        "Academic transcript": false, "CV or résumé": false, "Personal statement": false,
        "Recommendation letters": false, "English test": false, Portfolio: false, Other: false,
      };
      return {
        ...workspace,
        savedProgramIds: workspace.savedProgramIds.includes(programId) ? workspace.savedProgramIds : [...workspace.savedProgramIds, programId],
        postgraduateApplications: [...workspace.postgraduateApplications, {
          id: `postgrad-${Date.now()}`, profileId: workspace.profile.id, programId,
          status: "Considering", deadline: program.deadline, notes: "", documents,
        }],
      };
    });
  }, [updateActive]);

  const updatePostgraduateApplication = useCallback((application: PostgraduateApplication) => {
    updateActive((workspace) => ({
      ...workspace,
      postgraduateApplications: workspace.postgraduateApplications.map((item) => item.id === application.id ? application : item),
    }));
  }, [updateActive]);

  const upsertRoadmapItem = useCallback((item: RoadmapItem) => {
    updateActive((workspace) => ({
      ...workspace,
      roadmapItems: workspace.roadmapItems.some((existing) => existing.id === item.id)
        ? workspace.roadmapItems.map((existing) => existing.id === item.id ? item : existing)
        : [...workspace.roadmapItems, item],
    }));
  }, [updateActive]);

  const deleteRoadmapItem = useCallback((id: string) => {
    updateActive((workspace) => ({ ...workspace, roadmapItems: workspace.roadmapItems.filter((item) => item.id !== id) }));
  }, [updateActive]);

  const updateOrganisationNote = useCallback((organisationId: string, note: string) => {
    updateActive((workspace) => ({ ...workspace, organisationNotes: { ...workspace.organisationNotes, [organisationId]: note } }));
  }, [updateActive]);

  const resetCurrentProfile = useCallback(() => {
    const seed = createSeedState();
    setState((current) => ({ ...current, profiles: { ...current.profiles, [current.activeProfileId]: seed.profiles[current.activeProfileId] } }));
  }, []);
  const resetAll = useCallback(() => setState(createSeedState()), []);
  const setTheme = useCallback((theme: ThemePreference) => setState((current) => ({ ...current, theme })), []);
  const setLanguage = useCallback((language: AppLocale) => setState((current) => ({ ...current, language })), []);
  const updateDashboardPreferences = useCallback((dashboardPreferences: DashboardPreferences) => setState((current) => ({ ...current, dashboardPreferences })), []);
  const toggleSavedOpportunity = useCallback((opportunityId: string) => {
    updateActive((workspace) => ({
      ...workspace,
      savedOpportunityIds: workspace.savedOpportunityIds.includes(opportunityId)
        ? workspace.savedOpportunityIds.filter((id) => id !== opportunityId)
        : [...workspace.savedOpportunityIds, opportunityId],
    }));
  }, [updateActive]);
  const upsertContact = useCallback((contact: CareerContact) => {
    updateActive((workspace) => ({
      ...workspace,
      contacts: workspace.contacts.some((item) => item.id === contact.id)
        ? workspace.contacts.map((item) => item.id === contact.id ? contact : item)
        : [...workspace.contacts, contact],
    }));
  }, [updateActive]);
  const deleteContact = useCallback((id: string) => {
    updateActive((workspace) => ({ ...workspace, contacts: workspace.contacts.filter((item) => item.id !== id) }));
  }, [updateActive]);
  const upsertDocument = useCallback((document: CareerDocumentRecord) => {
    updateActive((workspace) => ({
      ...workspace,
      documents: workspace.documents.some((item) => item.id === document.id)
        ? workspace.documents.map((item) => item.id === document.id ? document : item)
        : [...workspace.documents, document],
    }));
  }, [updateActive]);
  const deleteDocument = useCallback((id: string) => {
    updateActive((workspace) => ({ ...workspace, documents: workspace.documents.filter((item) => item.id !== id) }));
  }, [updateActive]);
  const setDefaultProfile = useCallback((id: string) => setState((current) => current.profiles[id] ? { ...current, defaultProfileId: id } : current), []);
  const exportData = useCallback(() => serialiseState(state), [state]);
  const importData = useCallback((raw: string) => {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!validateState(parsed)) return { ok: false, message: "Unsupported or malformed CareerOS data." };
      setState(parseStoredState(raw));
      return { ok: true, message: "Local data imported." };
    } catch {
      return { ok: false, message: "The selected file is not valid JSON." };
    }
  }, []);

  const activeWorkspace = state.profiles[state.activeProfileId];
  const value = useMemo<CareerOSContextValue>(() => ({
    state, activeWorkspace, hydrated, storageError, setActiveProfileId, updateProfile, upsertProfile,
    toggleSavedJob, addJobApplication, createApplication, updateApplication, deleteApplication,
    toggleSavedProgram, addPostgraduateApplication, updatePostgraduateApplication,
    upsertRoadmapItem, deleteRoadmapItem, updateOrganisationNote, setTheme, setLanguage,
    updateDashboardPreferences, toggleSavedOpportunity, upsertContact, deleteContact,
    upsertDocument, deleteDocument, setDefaultProfile, resetCurrentProfile, resetAll, exportData, importData,
  }), [state, activeWorkspace, hydrated, storageError, setActiveProfileId, updateProfile, upsertProfile, toggleSavedJob, addJobApplication, createApplication, updateApplication, deleteApplication, toggleSavedProgram, addPostgraduateApplication, updatePostgraduateApplication, upsertRoadmapItem, deleteRoadmapItem, updateOrganisationNote, setTheme, setLanguage, updateDashboardPreferences, toggleSavedOpportunity, upsertContact, deleteContact, upsertDocument, deleteDocument, setDefaultProfile, resetCurrentProfile, resetAll, exportData, importData]);

  return (
    <CareerOSContext.Provider value={value}>
      {storageError && <p role="alert" className="fixed right-4 top-4 z-50 rounded-xl bg-[var(--danger)] px-4 py-3 text-sm font-medium text-white">{storageError}</p>}
      {children}
    </CareerOSContext.Provider>
  );
}

export function useCareerOS(): CareerOSContextValue {
  const context = useContext(CareerOSContext);
  if (!context) throw new Error("useCareerOS must be used within CareerOSProvider.");
  return context;
}

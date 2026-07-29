"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { TOMMY_ID, YUHAN_ID } from "@/data/seed";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { CareerProfile, Project, Skill, StudyLevel } from "@/types/domain";

const STORAGE_KEY = "careeros:onboarding:v1";
const LAST_STEP = 7;

interface OnboardingDraft {
  profileId: string;
  displayName: string;
  university: string;
  degree: string;
  discipline: string;
  studyLevel: StudyLevel;
  goals: string;
  locations: string;
  skills: string;
  projects: string;
}

interface PersistedOnboarding {
  completed: boolean;
  step: number;
  draft: OnboardingDraft;
}

const emptyDraft: OnboardingDraft = {
  profileId: "",
  displayName: "",
  university: "",
  degree: "",
  discipline: "",
  studyLevel: "Undergraduate",
  goals: "",
  locations: "",
  skills: "",
  projects: "",
};

function split(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function draftFromProfile(profile: CareerProfile): OnboardingDraft {
  return {
    profileId: profile.id,
    displayName: profile.displayName,
    university: profile.university,
    degree: profile.degree,
    discipline: profile.discipline,
    studyLevel: profile.studyLevel,
    goals: profile.careerGoals.join(", "),
    locations: profile.preferredCities.join(", "),
    skills: profile.skills.map((item) => item.name).join(", "),
    projects: profile.projects.map((item) => item.name).join(", "),
  };
}

export function OnboardingFlow() {
  const { state, hydrated, setLanguage, upsertProfile } = useCareerOS();
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(emptyDraft);

  useEffect(() => {
    if (!hydrated) return;
    queueMicrotask(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const saved = JSON.parse(raw) as PersistedOnboarding;
          setCompleted(Boolean(saved.completed));
          setStep(Math.min(Math.max(saved.step, 0), LAST_STEP));
          setDraft({ ...emptyDraft, ...saved.draft });
        } catch {
          setCompleted(false);
        }
      } else {
        setCompleted(false);
      }
      setReady(true);
    });
  }, [hydrated]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed, step, draft } satisfies PersistedOnboarding));
  }, [completed, draft, ready, step]);

  if (!ready || completed || dismissed) return null;

  function chooseProfile(profileId: string) {
    const profile = state.profiles[profileId]?.profile;
    if (profile) setDraft(draftFromProfile(profile));
  }

  function finish() {
    const existing = state.profiles[draft.profileId]?.profile;
    const id = existing?.id || `profile-${Date.now()}`;
    const skills: Skill[] = split(draft.skills).map((name, index) => ({
      id: existing?.skills.find((item) => item.name === name)?.id ?? `onboarding-skill-${index}-${Date.now()}`,
      name,
      category: "Other",
      proficiency: "Learning",
      evidence: "",
    }));
    const projects: Project[] = split(draft.projects).map((name, index) => ({
      id: existing?.projects.find((item) => item.name === name)?.id ?? `onboarding-project-${index}-${Date.now()}`,
      name,
      role: "",
      description: "",
      competencies: [],
      repositoryUrl: "",
      liveUrl: "",
    }));
    upsertProfile({
      id,
      displayName: draft.displayName.trim() || existing?.displayName || "CareerOS Profile",
      preferredName: existing?.preferredName ?? "",
      university: draft.university.trim(),
      degree: draft.degree.trim(),
      discipline: draft.discipline.trim(),
      studyLevel: draft.studyLevel,
      location: existing?.location ?? "Australia",
      expectedGraduationDate: existing?.expectedGraduationDate ?? "",
      workEligibility: existing?.workEligibility ?? "",
      registrationStatus: existing?.registrationStatus ?? "",
      careerGoals: split(draft.goals),
      preferredCities: split(draft.locations),
      skills,
      projects,
      experienceSummary: existing?.experienceSummary ?? "",
      linkedInUrl: existing?.linkedInUrl ?? "",
      githubUrl: existing?.githubUrl ?? "",
      portfolioUrl: existing?.portfolioUrl ?? "",
    });
    setCompleted(true);
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/55 p-3 sm:grid sm:place-items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <section className="mx-auto min-h-full w-full max-w-2xl rounded-2xl bg-[var(--surface)] p-5 shadow-2xl sm:min-h-0 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-[var(--accent)]">{t("onboarding.progress", { current: step + 1, total: LAST_STEP + 1 })}</p>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>{t("onboarding.skip")}</Button>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--surface-subtle)]"><span className="block h-full bg-[var(--accent)]" style={{ width: `${((step + 1) / (LAST_STEP + 1)) * 100}%` }} /></div>

        <div className="mt-8 min-h-64">
          {step === 0 && <><h1 id="onboarding-title" className="font-display text-3xl font-medium">{t("onboarding.welcome")}</h1><p className="mt-4 max-w-xl leading-7 text-[var(--text-secondary)]">{t("onboarding.welcomeBody")}</p></>}
          {step === 1 && <><h1 id="onboarding-title" className="font-display text-3xl font-medium">{t("onboarding.language")}</h1><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button variant={state.language === "en" ? "primary" : "secondary"} onClick={() => setLanguage("en")}>English</Button><Button variant={state.language === "zh-CN" ? "primary" : "secondary"} onClick={() => setLanguage("zh-CN")}>简体中文</Button></div></>}
          {step === 2 && <><h1 id="onboarding-title" className="font-display text-3xl font-medium">{t("onboarding.profile")}</h1><div className="mt-6 grid gap-3"><Button variant={draft.profileId === YUHAN_ID ? "primary" : "secondary"} onClick={() => chooseProfile(YUHAN_ID)}>{t("onboarding.yuhan")}</Button><Button variant={draft.profileId === TOMMY_ID ? "primary" : "secondary"} onClick={() => chooseProfile(TOMMY_ID)}>{t("onboarding.tommy")}</Button><Button variant={!draft.profileId && draft.displayName ? "primary" : "secondary"} onClick={() => setDraft(emptyDraft)}>{t("onboarding.create")}</Button><Field label={t("onboarding.name")}><Input value={draft.displayName} onChange={(event) => setDraft({ ...draft, profileId: "", displayName: event.target.value })} /></Field></div></>}
          {step === 3 && <><h1 id="onboarding-title" className="font-display text-3xl font-medium">{t("onboarding.education")}</h1><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label={t("onboarding.university")}><Input value={draft.university} onChange={(event) => setDraft({ ...draft, university: event.target.value })} /></Field><Field label={t("onboarding.degree")}><Input value={draft.degree} onChange={(event) => setDraft({ ...draft, degree: event.target.value })} /></Field><Field label={t("onboarding.discipline")}><Input value={draft.discipline} onChange={(event) => setDraft({ ...draft, discipline: event.target.value })} /></Field><Field label={t("onboarding.studyLevel")}><Select value={draft.studyLevel} onChange={(event) => setDraft({ ...draft, studyLevel: event.target.value as StudyLevel })}><option value="Undergraduate">Undergraduate</option><option value="Postgraduate">Postgraduate</option></Select></Field></div></>}
          {step === 4 && <><h1 id="onboarding-title" className="font-display text-3xl font-medium">{t("onboarding.goals")}</h1><Textarea className="mt-6" value={draft.goals} onChange={(event) => setDraft({ ...draft, goals: event.target.value })} /></>}
          {step === 5 && <><h1 id="onboarding-title" className="font-display text-3xl font-medium">{t("onboarding.locations")}</h1><Textarea className="mt-6" value={draft.locations} onChange={(event) => setDraft({ ...draft, locations: event.target.value })} /></>}
          {step === 6 && <><h1 id="onboarding-title" className="font-display text-3xl font-medium">{t("onboarding.skills")}</h1><div className="mt-6 space-y-4"><Field label={t("profile.skills")} hint={t("onboarding.skillsHint")}><Textarea value={draft.skills} onChange={(event) => setDraft({ ...draft, skills: event.target.value })} /></Field><Field label={t("profile.projects")} hint={t("onboarding.projectsHint")}><Textarea value={draft.projects} onChange={(event) => setDraft({ ...draft, projects: event.target.value })} /></Field></div></>}
          {step === 7 && <><h1 id="onboarding-title" className="font-display text-3xl font-medium">{t("onboarding.finish")}</h1><p className="mt-4 leading-7 text-[var(--text-secondary)]">{t("onboarding.finishBody")}</p><dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-[var(--text-tertiary)]">{t("onboarding.name")}</dt><dd className="font-medium">{draft.displayName || "—"}</dd></div><div><dt className="text-[var(--text-tertiary)]">{t("onboarding.discipline")}</dt><dd className="font-medium">{draft.discipline || "—"}</dd></div></dl></>}
        </div>

        <div className="mt-8 flex justify-between gap-3 border-t border-[var(--border)] pt-5">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>{t("onboarding.back")}</Button>
          <Button onClick={() => step === LAST_STEP ? finish() : setStep((value) => Math.min(LAST_STEP, value + 1))}>{step === LAST_STEP ? t("onboarding.finish") : t("onboarding.next")}</Button>
        </div>
      </section>
    </div>
  );
}

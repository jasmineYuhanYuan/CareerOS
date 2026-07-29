"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { SectionHeader } from "@/components/ui/section-header";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { CareerProfile, Project, Skill } from "@/types/domain";
import { useToast } from "@/providers/toast-provider";

function splitValues(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

const emptySkill: Skill = { id: "", name: "", category: "", proficiency: "Learning", evidence: "" };
const emptyProject: Project = { id: "", name: "", role: "", description: "", competencies: [], repositoryUrl: "", liveUrl: "" };

export function ProfileManager() {
  const { activeWorkspace, updateProfile } = useCareerOS();
  const { t } = useLanguage();
  const { notify } = useToast();
  const profile = activeWorkspace.profile;
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [profileError, setProfileError] = useState("");
  const [skillDraft, setSkillDraft] = useState<Skill | null>(null);
  const [projectDraft, setProjectDraft] = useState<Project | null>(null);

  function openProfileEditor() {
    setDraft(structuredClone(profile));
    setProfileError("");
    setEditOpen(true);
  }

  function closeProfileEditor() {
    if (JSON.stringify(draft) !== JSON.stringify(profile) && !window.confirm(t("profile.discardConfirm"))) return;
    setEditOpen(false);
  }

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!draft.displayName.trim() || !draft.university.trim() || !draft.location.trim()) {
      setProfileError(t("profile.validation"));
      return;
    }
    updateProfile({ ...draft, displayName: draft.displayName.trim() });
    notify(t("feedback.profileSaved"));
    setEditOpen(false);
  }

  function saveSkill(event: FormEvent) {
    event.preventDefault();
    if (!skillDraft?.name.trim()) return;
    const skills = profile.skills.some((item) => item.id === skillDraft.id)
      ? profile.skills.map((item) => item.id === skillDraft.id ? skillDraft : item)
      : [...profile.skills, { ...skillDraft, id: `skill-${Date.now()}` }];
    updateProfile({ ...profile, skills });
    setSkillDraft(null);
  }

  function saveProject(event: FormEvent) {
    event.preventDefault();
    if (!projectDraft?.name.trim()) return;
    const projects = profile.projects.some((item) => item.id === projectDraft.id)
      ? profile.projects.map((item) => item.id === projectDraft.id ? projectDraft : item)
      : [...profile.projects, { ...projectDraft, id: `project-${Date.now()}` }];
    updateProfile({ ...profile, projects });
    setProjectDraft(null);
  }

  const linkItems = [
    ["LinkedIn", profile.linkedInUrl],
    ["GitHub", profile.githubUrl],
    ["Portfolio", profile.portfolioUrl],
  ].filter((item) => item[1]);

  return (
    <div className="page-enter">
      <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-9 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-5">
          <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-full bg-[var(--surface-subtle)] font-display text-xl font-medium text-[var(--text-primary)] sm:size-20">
            {profile.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("")}
          </span>
          <div>
            <p className="eyebrow mb-1.5">{profile.studyLevel} profile</p>
            <h1 className="font-display text-[1.85rem] font-medium leading-tight tracking-[-0.045em] sm:text-[2.4rem]">{profile.displayName}</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {profile.preferredName && profile.preferredName !== profile.displayName ? `Prefers ${profile.preferredName} · ` : ""}
              {profile.university} · {profile.discipline} · {profile.location}
            </p>
          </div>
        </div>
        <Button onClick={openProfileEditor}>{t("profile.edit")}</Button>
      </header>

      <div className="grid gap-x-12 lg:grid-cols-[1.35fr_.65fr]">
        <main>
          <section className="border-b border-[var(--border)] py-9">
            <SectionHeader title={t("profile.about")} />
            <p className="max-w-3xl text-[0.95rem] leading-7 text-[var(--text-secondary)]">{profile.experienceSummary}</p>
            <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
              {[
                ["Degree", profile.degree],
                ["Expected graduation", profile.expectedGraduationDate || "Not added"],
                ["Work eligibility", profile.workEligibility || "Not added"],
                ["Preferred locations", profile.preferredCities.join(", ") || "Not added"],
              ].map(([term, value]) => <div key={term}><dt className="text-[0.75rem] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{term}</dt><dd className="mt-1.5 font-medium">{value}</dd></div>)}
            </dl>
          </section>

          {profile.discipline === "Chiropractic" && (
            <section className="border-b border-[var(--border)] py-9">
              <SectionHeader title="Professional registration" description="Registration and eligibility remain separate from general profile details." />
              <div className="rounded-2xl bg-[var(--success-soft)] p-5 text-sm font-medium text-[var(--success)]">{profile.registrationStatus || "Not added"}</div>
            </section>
          )}

          <section className="border-b border-[var(--border)] py-9">
            <SectionHeader title={t("profile.skills")} action={<Button size="sm" variant="secondary" onClick={() => setSkillDraft(emptySkill)}>{t("profile.addSkill")}</Button>} />
            {profile.skills.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">Add skills with evidence to improve transparent matching.</p> : (
              <ul className="divide-y divide-[var(--border)]">{profile.skills.map((skill) => (
                <li key={skill.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1"><p className="font-medium">{skill.name}</p><p className="mt-1 text-[0.8rem] text-[var(--text-secondary)]">{skill.category} · {skill.proficiency}</p><p className="mt-2 text-sm text-[var(--text-secondary)]">{skill.evidence || "No evidence added yet."}</p></div>
                  <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => setSkillDraft(skill)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => window.confirm(`Remove ${skill.name}?`) && updateProfile({ ...profile, skills: profile.skills.filter((item) => item.id !== skill.id) })}>Remove</Button></div>
                </li>
              ))}</ul>
            )}
          </section>

          <section className="py-9">
            <SectionHeader title={t("profile.projects")} action={<Button size="sm" variant="secondary" onClick={() => setProjectDraft(emptyProject)}>{t("profile.addProject")}</Button>} />
            {profile.projects.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">No projects or clinical experience records yet. Add one when ready.</p> : (
              <div className="space-y-4">{profile.projects.map((project) => (
                <article key={project.id} className="interactive-lift surface-card p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h3 className="font-display text-lg font-medium">{project.name}</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">{project.role || "Role not added"}</p></div>
                    <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => setProjectDraft(project)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => window.confirm(`Remove ${project.name}?`) && updateProfile({ ...profile, projects: profile.projects.filter((item) => item.id !== project.id) })}>Remove</Button></div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{project.description || "Add a description and relevant competencies."}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{project.competencies.map((item) => <Badge key={item}>{item}</Badge>)}</div>
                  {(project.repositoryUrl || project.liveUrl) && <div className="mt-4 flex gap-4 text-sm font-medium text-[var(--accent)]">{project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer">Repository ↗</a>}{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live project ↗</a>}</div>}
                </article>
              ))}</div>
            )}
          </section>
        </main>

        <aside>
          <section className="border-b border-[var(--border)] py-9">
            <SectionHeader title={t("profile.goals")} />
            <ul className="flex flex-wrap gap-2">{profile.careerGoals.map((goal) => <li key={goal}><Badge>{goal}</Badge></li>)}</ul>
          </section>
          <section className="border-b border-[var(--border)] py-9">
            <SectionHeader title={t("profile.experience")} />
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{profile.experienceSummary}</p>
          </section>
          <section className="py-9">
            <SectionHeader title={t("profile.links")} />
            {linkItems.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">No links added yet.</p> : <ul className="space-y-2">{linkItems.map(([label, url]) => <li key={label}><a href={url} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-between border-b border-[var(--border)] text-sm font-medium"><span>{label}</span><span className="text-[var(--accent)]">↗</span></a></li>)}</ul>}
          </section>
        </aside>
      </div>

      <Dialog open={editOpen} title={t("profile.edit")} description={t("settings.description")} onClose={closeProfileEditor}>
        <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
          <Field label="Display name" error={profileError}><Input required value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} /></Field>
          <Field label="Preferred name"><Input value={draft.preferredName} onChange={(e) => setDraft({ ...draft, preferredName: e.target.value })} /></Field>
          <Field label="University"><Input required value={draft.university} onChange={(e) => setDraft({ ...draft, university: e.target.value })} /></Field>
          <Field label="Degree"><Input value={draft.degree} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} /></Field>
          <Field label="Study level"><Select value={draft.studyLevel} onChange={(e) => setDraft({ ...draft, studyLevel: e.target.value as CareerProfile["studyLevel"] })}><option>Undergraduate</option><option>Postgraduate</option></Select></Field>
          <Field label="Discipline"><Input value={draft.discipline} onChange={(e) => setDraft({ ...draft, discipline: e.target.value })} /></Field>
          <Field label="Location"><Input required value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></Field>
          <Field label="Expected graduation"><Input type="date" value={draft.expectedGraduationDate} onChange={(e) => setDraft({ ...draft, expectedGraduationDate: e.target.value })} /></Field>
          <Field label="Work eligibility"><Input value={draft.workEligibility} onChange={(e) => setDraft({ ...draft, workEligibility: e.target.value })} /></Field>
          <Field label="Registration status"><Input value={draft.registrationStatus} onChange={(e) => setDraft({ ...draft, registrationStatus: e.target.value })} /></Field>
          <Field label="Career goals" hint="Separate multiple goals with commas"><Textarea value={draft.careerGoals.join(", ")} onChange={(e) => setDraft({ ...draft, careerGoals: splitValues(e.target.value) })} /></Field>
          <Field label="Preferred cities" hint="Separate multiple cities with commas"><Textarea value={draft.preferredCities.join(", ")} onChange={(e) => setDraft({ ...draft, preferredCities: splitValues(e.target.value) })} /></Field>
          <Field label="LinkedIn URL"><Input type="url" value={draft.linkedInUrl} onChange={(e) => setDraft({ ...draft, linkedInUrl: e.target.value })} /></Field>
          <Field label="GitHub URL"><Input type="url" value={draft.githubUrl} onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })} /></Field>
          <Field label="Portfolio URL"><Input type="url" value={draft.portfolioUrl} onChange={(e) => setDraft({ ...draft, portfolioUrl: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={closeProfileEditor}>Cancel</Button><Button type="submit">Save profile</Button></div>
        </form>
      </Dialog>

      <Dialog open={skillDraft !== null} title={skillDraft?.id ? "Edit skill" : "Add skill"} onClose={() => setSkillDraft(null)}>
        {skillDraft && <form onSubmit={saveSkill} className="space-y-4">
          <Field label="Skill name"><Input required value={skillDraft.name} onChange={(e) => setSkillDraft({ ...skillDraft, name: e.target.value })} /></Field>
          <Field label="Category"><Input value={skillDraft.category} onChange={(e) => setSkillDraft({ ...skillDraft, category: e.target.value })} /></Field>
          <Field label="Proficiency"><Select value={skillDraft.proficiency} onChange={(e) => setSkillDraft({ ...skillDraft, proficiency: e.target.value as Skill["proficiency"] })}>{["Learning", "Working", "Confident", "Advanced"].map((value) => <option key={value}>{value}</option>)}</Select></Field>
          <Field label="Evidence"><Textarea value={skillDraft.evidence} onChange={(e) => setSkillDraft({ ...skillDraft, evidence: e.target.value })} /></Field>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setSkillDraft(null)}>Cancel</Button><Button type="submit">Save skill</Button></div>
        </form>}
      </Dialog>

      <Dialog open={projectDraft !== null} title={projectDraft?.id ? "Edit project" : "Add project"} onClose={() => setProjectDraft(null)}>
        {projectDraft && <form onSubmit={saveProject} className="space-y-4">
          <Field label="Name"><Input required value={projectDraft.name} onChange={(e) => setProjectDraft({ ...projectDraft, name: e.target.value })} /></Field>
          <Field label="Role"><Input value={projectDraft.role} onChange={(e) => setProjectDraft({ ...projectDraft, role: e.target.value })} /></Field>
          <Field label="Description"><Textarea value={projectDraft.description} onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })} /></Field>
          <Field label="Technologies or competencies" hint="Separate with commas"><Input value={projectDraft.competencies.join(", ")} onChange={(e) => setProjectDraft({ ...projectDraft, competencies: splitValues(e.target.value) })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Repository URL"><Input type="url" value={projectDraft.repositoryUrl} onChange={(e) => setProjectDraft({ ...projectDraft, repositoryUrl: e.target.value })} /></Field><Field label="Live URL"><Input type="url" value={projectDraft.liveUrl} onChange={(e) => setProjectDraft({ ...projectDraft, liveUrl: e.target.value })} /></Field></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setProjectDraft(null)}>Cancel</Button><Button type="submit">Save project</Button></div>
        </form>}
      </Dialog>
    </div>
  );
}

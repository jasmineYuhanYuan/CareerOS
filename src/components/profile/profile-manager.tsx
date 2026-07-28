"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { useCareerOS } from "@/providers/careeros-provider";
import type { CareerProfile, Project, Skill } from "@/types/domain";

function splitValues(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

const emptySkill: Skill = { id: "", name: "", category: "", proficiency: "Learning", evidence: "" };
const emptyProject: Project = { id: "", name: "", role: "", description: "", competencies: [], repositoryUrl: "", liveUrl: "" };

export function ProfileManager() {
  const { activeWorkspace, updateProfile } = useCareerOS();
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
    if (JSON.stringify(draft) !== JSON.stringify(profile) && !window.confirm("Discard unsaved profile changes?")) return;
    setEditOpen(false);
  }

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!draft.displayName.trim() || !draft.university.trim() || !draft.location.trim()) {
      setProfileError("Name, university and location are required.");
      return;
    }
    updateProfile({ ...draft, displayName: draft.displayName.trim() });
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeading eyebrow="Profile" title={profile.displayName} description="Your profile shapes every opportunity, recommendation and planning view." />
        <Button onClick={openProfileEditor}>Edit profile</Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card eyebrow={profile.studyLevel} title={`${profile.degree} · ${profile.university}`}>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {[
              ["Preferred name", profile.preferredName || "Not added"],
              ["Discipline", profile.discipline],
              ["Location", profile.location],
              ["Expected graduation", profile.expectedGraduationDate || "Not added"],
              ["Work eligibility", profile.workEligibility || "Not added"],
              ["Registration", profile.registrationStatus || "Not applicable"],
            ].map(([term, value]) => (
              <div key={term}>
                <dt className="text-xs font-bold uppercase tracking-wide text-[#7b857e]">{term}</dt>
                <dd className="mt-1 font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-t border-[#e4e5dd] pt-5 text-sm leading-6 text-[#68736c]">{profile.experienceSummary}</p>
          {linkItems.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {linkItems.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-[#ced1c8] px-3 py-2 text-xs font-bold text-[#245b45]">{label} ↗</a>)}
            </div>
          )}
        </Card>

        <Card eyebrow="Direction" title="Career goals">
          <ul className="flex flex-wrap gap-2">{profile.careerGoals.map((goal) => <li key={goal}><Badge tone="green">{goal}</Badge></li>)}</ul>
          <h3 className="mt-7 text-xs font-bold uppercase tracking-wide text-[#7b857e]">Preferred locations</h3>
          <p className="mt-2 text-sm font-semibold">{profile.preferredCities.join(", ") || "Not added"}</p>
        </Card>

        <Card eyebrow={`${profile.skills.length} recorded`} title="Skills" action={<Button size="sm" variant="secondary" onClick={() => setSkillDraft(emptySkill)}>Add skill</Button>}>
          {profile.skills.length === 0 ? <p className="text-sm text-[#68736c]">Add skills with evidence to improve transparent matching.</p> : (
            <ul className="space-y-3">{profile.skills.map((skill) => (
              <li key={skill.id} className="rounded-2xl border border-[#e4e5dd] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-bold">{skill.name}</p><p className="mt-1 text-xs text-[#68736c]">{skill.category} · {skill.proficiency}</p></div>
                  <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => setSkillDraft(skill)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => window.confirm(`Remove ${skill.name}?`) && updateProfile({ ...profile, skills: profile.skills.filter((item) => item.id !== skill.id) })}>Remove</Button></div>
                </div>
                <p className="mt-3 text-sm text-[#59645e]">{skill.evidence || "No evidence added yet."}</p>
              </li>
            ))}</ul>
          )}
        </Card>

        <Card eyebrow={`${profile.projects.length} recorded`} title={profile.discipline === "Chiropractic" ? "Clinical experience & projects" : "Projects"} action={<Button size="sm" variant="secondary" onClick={() => setProjectDraft(emptyProject)}>Add project</Button>}>
          {profile.projects.length === 0 ? <p className="text-sm text-[#68736c]">No projects or clinical experience records yet. Add one when ready.</p> : (
            <ul className="space-y-3">{profile.projects.map((project) => (
              <li key={project.id} className="rounded-2xl border border-[#e4e5dd] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-bold">{project.name}</p><p className="mt-1 text-xs text-[#68736c]">{project.role || "Role not added"}</p></div>
                  <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => setProjectDraft(project)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => window.confirm(`Remove ${project.name}?`) && updateProfile({ ...profile, projects: profile.projects.filter((item) => item.id !== project.id) })}>Remove</Button></div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#59645e]">{project.description || "Add a description and relevant competencies."}</p>
                <div className="mt-3 flex flex-wrap gap-2">{project.competencies.map((item) => <Badge key={item}>{item}</Badge>)}</div>
              </li>
            ))}</ul>
          )}
        </Card>
      </div>

      <Dialog open={editOpen} title="Edit profile" description="Changes apply immediately across your local CareerOS workspace." onClose={closeProfileEditor}>
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

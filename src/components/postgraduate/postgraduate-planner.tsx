"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FilterChip } from "@/components/ui/filter-chip";
import { Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { programs } from "@/data/seed";
import { calculateProgramMatch } from "@/lib/match";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { PostgraduateApplication, PostgraduateProgram, PostgraduateStatus, ProgramDocument } from "@/types/domain";

const statuses: PostgraduateStatus[] = ["Considering", "Researching", "Preparing", "Submitted", "Interview", "Offer", "Rejected", "Withdrawn"];
const tabs = ["Discover programs", "Saved", "Applications", "Documents"] as const;
type StudyTab = (typeof tabs)[number];

export function PostgraduatePlanner() {
  const { activeWorkspace, toggleSavedProgram, addPostgraduateApplication, updatePostgraduateApplication } = useCareerOS();
  const { t } = useLanguage();
  const [tab, setTab] = useState<StudyTab>("Discover programs");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All");
  const [discipline, setDiscipline] = useState("All");
  const [degree, setDegree] = useState("All");
  const [selected, setSelected] = useState<PostgraduateProgram | null>(null);
  const [applicationDraft, setApplicationDraft] = useState<PostgraduateApplication | null>(null);

  const visible = useMemo(() => programs.filter((program) =>
    `${program.university} ${program.programName}`.toLowerCase().includes(query.toLowerCase()) &&
    (country === "All" || program.country === country) &&
    (discipline === "All" || program.discipline === discipline) &&
    (degree === "All" || program.degreeLevel === degree) &&
    (tab !== "Saved" || activeWorkspace.savedProgramIds.includes(program.id))
  ).sort((a, b) => a.deadline.localeCompare(b.deadline)), [activeWorkspace.savedProgramIds, country, degree, discipline, query, tab]);

  return (
    <div className="page-enter">
      <PageHeading eyebrow={t("study.eyebrow")} title={t("study.title")} description={t("study.description")} />
      <nav aria-label="Study sections" className="mb-7 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((item) => <FilterChip key={item} active={tab === item} onClick={() => setTab(item)}>{item}</FilterChip>)}
      </nav>

      {(tab === "Discover programs" || tab === "Saved") && (
        <>
          <section aria-label="Program filters" className="surface-card mb-7 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
            <label className="xl:col-span-2"><span className="sr-only">Search programs</span><Input type="search" placeholder="Search university or program" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
            <Select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)}><option>All</option>{[...new Set(programs.map((item) => item.country))].map((value) => <option key={value}>{value}</option>)}</Select>
            <Select aria-label="Discipline" value={discipline} onChange={(e) => setDiscipline(e.target.value)}><option>All</option>{[...new Set(programs.map((item) => item.discipline))].map((value) => <option key={value}>{value}</option>)}</Select>
            <Select aria-label="Degree level" value={degree} onChange={(e) => setDegree(e.target.value)}><option>All</option>{[...new Set(programs.map((item) => item.degreeLevel))].map((value) => <option key={value}>{value}</option>)}</Select>
          </section>
          <div className="space-y-4">
            {visible.map((program) => {
              const saved = activeWorkspace.savedProgramIds.includes(program.id);
              const tracked = activeWorkspace.postgraduateApplications.find((item) => item.programId === program.id);
              return (
                <article key={program.id} className="interactive-lift surface-card grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                  <div className="min-w-0">
                    <p className="text-[0.78rem] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{program.university}</p>
                    <h2 className="mt-2 break-words font-display text-xl font-medium tracking-[-0.03em]">{program.programName}</h2>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{program.city}, {program.country} · {program.degreeLevel} · {program.intake}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2"><StatusBadge status="positive">{calculateProgramMatch(program, activeWorkspace.profile)}% estimated fit</StatusBadge><Badge>{t("common.sampleNotice")}</Badge><span className="text-[0.75rem] text-[var(--text-tertiary)]">{t("common.syntheticDate")}: {program.deadline}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:w-44 sm:justify-end">
                    <Button size="sm" variant="secondary" onClick={() => setSelected(program)}>Details</Button>
                    <Button size="sm" variant={saved ? "primary" : "secondary"} onClick={() => toggleSavedProgram(program.id)}>{saved ? "Saved" : "Save"}</Button>
                    <Button size="sm" disabled={Boolean(tracked)} onClick={() => addPostgraduateApplication(program.id)}>{tracked ? "Tracking" : "Track application"}</Button>
                  </div>
                </article>
              );
            })}
          </div>
          {visible.length === 0 && <p className="surface-card border-dashed p-10 text-center text-sm text-[var(--text-secondary)]">{t("study.empty")}</p>}
        </>
      )}

      {tab === "Applications" && (
        activeWorkspace.postgraduateApplications.length === 0 ? <p className="surface-card border-dashed p-10 text-center text-sm text-[var(--text-secondary)]">No study applications yet. Track one from Discover programs.</p> :
        <div className="space-y-3">{activeWorkspace.postgraduateApplications.map((application) => {
          const program = programs.find((item) => item.id === application.programId);
          return <button type="button" key={application.id} onClick={() => setApplicationDraft(structuredClone(application))} className="interactive-lift surface-card flex min-h-24 w-full items-center justify-between gap-4 p-5 text-left"><div><StatusBadge status="active">{application.status}</StatusBadge><strong className="mt-3 block font-medium">{program?.programName}</strong><span className="mt-1 block text-sm text-[var(--text-secondary)]">{program?.university}</span></div><span className="text-[var(--text-secondary)]">→</span></button>;
        })}</div>
      )}

      {tab === "Documents" && (
        activeWorkspace.postgraduateApplications.length === 0 ? <p className="surface-card border-dashed p-10 text-center text-sm text-[var(--text-secondary)]">Document checklists appear after you track a study application.</p> :
        <div className="space-y-4">{activeWorkspace.postgraduateApplications.map((application) => {
          const program = programs.find((item) => item.id === application.programId);
          const complete = Object.values(application.documents).filter(Boolean).length;
          return <button type="button" key={application.id} onClick={() => setApplicationDraft(structuredClone(application))} className="surface-card block w-full p-5 text-left"><span className="text-[0.75rem] text-[var(--text-tertiary)]">{complete} of {Object.keys(application.documents).length} ready</span><strong className="mt-2 block font-medium">{program?.programName}</strong><div className="mt-4 h-1.5 rounded-full bg-[var(--surface-subtle)]"><span className="block h-full rounded-full bg-[var(--success)]" style={{ width: `${(complete / Object.keys(application.documents).length) * 100}%` }} /></div></button>;
        })}</div>
      )}

      <Dialog open={selected !== null} title={selected?.programName ?? "Program"} description={selected?.university} onClose={() => setSelected(null)}>
        {selected && <div className="space-y-5 text-sm"><StatusBadge status="active">Sample planning data—verify all details</StatusBadge><section><h3 className="font-medium">Entry requirements</h3><ul className="mt-2 list-disc pl-5 text-[var(--text-secondary)]">{selected.entryRequirements.map((item) => <li key={item}>{item}</li>)}</ul></section><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="font-medium">Language requirements</dt><dd className="mt-1 text-[var(--text-secondary)]">{selected.languageRequirements}</dd></div><div><dt className="font-medium">GRE</dt><dd className="mt-1 text-[var(--text-secondary)]">{selected.greRequirement}</dd></div><div><dt className="font-medium">Recommendations</dt><dd className="mt-1 text-[var(--text-secondary)]">{selected.recommendationLetters}</dd></div><div><dt className="font-medium">Tuition</dt><dd className="mt-1 text-[var(--text-secondary)]">{selected.tuitionText}</dd></div></dl></div>}
      </Dialog>
      <Dialog open={applicationDraft !== null} title="Study application" description="Track status, notes and required documents." onClose={() => setApplicationDraft(null)}>
        {applicationDraft && <form onSubmit={(e) => { e.preventDefault(); updatePostgraduateApplication(applicationDraft); setApplicationDraft(null); }} className="space-y-5">
          <label className="block text-sm font-medium">Status<Select value={applicationDraft.status} onChange={(e) => setApplicationDraft({ ...applicationDraft, status: e.target.value as PostgraduateStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></label>
          <label className="block text-sm font-medium">Deadline<Input type="date" value={applicationDraft.deadline} onChange={(e) => setApplicationDraft({ ...applicationDraft, deadline: e.target.value })} /></label>
          <fieldset><legend className="text-sm font-medium">Document checklist</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{(Object.keys(applicationDraft.documents) as ProgramDocument[]).map((document) => <label key={document} className="flex min-h-11 items-center gap-2 rounded-xl bg-[var(--surface-subtle)] px-3 text-sm"><input type="checkbox" checked={applicationDraft.documents[document]} onChange={(e) => setApplicationDraft({ ...applicationDraft, documents: { ...applicationDraft.documents, [document]: e.target.checked } })} />{document}</label>)}</div></fieldset>
          <label className="block text-sm font-medium">Notes<Textarea value={applicationDraft.notes} onChange={(e) => setApplicationDraft({ ...applicationDraft, notes: e.target.value })} /></label>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setApplicationDraft(null)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>}
      </Dialog>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { programs, TOMMY_ID } from "@/data/seed";
import { calculateProgramMatch } from "@/lib/match";
import { useCareerOS } from "@/providers/careeros-provider";
import type { PostgraduateApplication, PostgraduateProgram, PostgraduateStatus, ProgramDocument } from "@/types/domain";

const statuses: PostgraduateStatus[] = ["Considering", "Researching", "Preparing", "Submitted", "Interview", "Offer", "Rejected", "Withdrawn"];

export function PostgraduatePlanner() {
  const { activeWorkspace, toggleSavedProgram, addPostgraduateApplication, updatePostgraduateApplication } = useCareerOS();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All");
  const [discipline, setDiscipline] = useState("All");
  const [degree, setDegree] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState<PostgraduateProgram | null>(null);
  const [applicationDraft, setApplicationDraft] = useState<PostgraduateApplication | null>(null);

  const visible = useMemo(() => programs.filter((program) =>
    `${program.university} ${program.programName}`.toLowerCase().includes(query.toLowerCase()) &&
    (country === "All" || program.country === country) &&
    (discipline === "All" || program.discipline === discipline) &&
    (degree === "All" || program.degreeLevel === degree) &&
    (!savedOnly || activeWorkspace.savedProgramIds.includes(program.id))
  ).sort((a, b) => a.deadline.localeCompare(b.deadline)), [activeWorkspace.savedProgramIds, country, degree, discipline, query, savedOnly]);

  if (activeWorkspace.profile.id === TOMMY_ID) {
    return (
      <div className="page-enter">
        <PageHeading eyebrow="Optional pathway" title="Postgraduate & continuing education" description="Another postgraduate degree is not assumed to be your current goal." />
        <Card title="Focus on your current clinical pathway">
          <p className="text-sm leading-6 text-[#68736c]">Use your roadmap to track registration or eligibility preparation. Continuing-education planning can be added here later if it becomes relevant.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <PageHeading eyebrow="Sample planning data" title="Postgraduate planner" description="Compare possible study directions. Always confirm current requirements, fees and deadlines with each university." />
      <section aria-label="Program filters" className="mb-6 grid gap-3 rounded-[1.35rem] border border-[#dedfd7] bg-[#fffef9] p-4 sm:grid-cols-2 xl:grid-cols-5">
        <label className="xl:col-span-2"><span className="sr-only">Search programs</span><Input type="search" placeholder="Search university or program" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <Select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)}><option>All</option>{[...new Set(programs.map((item) => item.country))].map((value) => <option key={value}>{value}</option>)}</Select>
        <Select aria-label="Discipline" value={discipline} onChange={(e) => setDiscipline(e.target.value)}><option>All</option>{[...new Set(programs.map((item) => item.discipline))].map((value) => <option key={value}>{value}</option>)}</Select>
        <Select aria-label="Degree level" value={degree} onChange={(e) => setDegree(e.target.value)}><option>All</option>{[...new Set(programs.map((item) => item.degreeLevel))].map((value) => <option key={value}>{value}</option>)}</Select>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} /> Saved only</label>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((program) => {
          const saved = activeWorkspace.savedProgramIds.includes(program.id);
          const tracked = activeWorkspace.postgraduateApplications.find((item) => item.programId === program.id);
          return <article key={program.id} className="flex flex-col rounded-[1.35rem] border border-[#dedfd7] bg-[#fffef9] p-5">
            <div className="flex flex-wrap gap-2"><Badge tone="orange">Sample data</Badge><Badge tone="green">{calculateProgramMatch(program, activeWorkspace.profile)}% estimated match</Badge></div>
            <h2 className="mt-4 break-words font-display text-lg font-extrabold">{program.programName}</h2>
            <p className="mt-1 text-sm font-semibold text-[#59645e]">{program.university}</p>
            <p className="mt-4 text-sm text-[#68736c]">{program.city}, {program.country} · {program.duration}</p>
            <p className="mt-2 text-xs font-semibold text-[#7b857e]">Sample intake: {program.intake}<br />Planning deadline: {program.deadline}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-5"><Button size="sm" variant="secondary" onClick={() => setSelected(program)}>Details</Button><Button size="sm" variant={saved ? "primary" : "secondary"} onClick={() => toggleSavedProgram(program.id)}>{saved ? "Saved" : "Save"}</Button><Button size="sm" disabled={Boolean(tracked)} onClick={() => addPostgraduateApplication(program.id)}>{tracked ? "Tracking" : "Track application"}</Button></div>
          </article>;
        })}
      </div>
      {activeWorkspace.postgraduateApplications.length > 0 && <section className="mt-8"><h2 className="font-display text-2xl font-extrabold">Application tracker</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{activeWorkspace.postgraduateApplications.map((application) => {
        const program = programs.find((item) => item.id === application.programId);
        return <button type="button" key={application.id} onClick={() => setApplicationDraft(structuredClone(application))} className="rounded-[1.35rem] border border-[#dedfd7] bg-[#fffef9] p-5 text-left"><Badge tone="blue">{application.status}</Badge><strong className="mt-3 block">{program?.programName}</strong><span className="mt-1 block text-sm text-[#68736c]">{program?.university}</span></button>;
      })}</div></section>}

      <Dialog open={selected !== null} title={selected?.programName ?? "Program"} description={selected?.university} onClose={() => setSelected(null)}>
        {selected && <div className="space-y-5 text-sm"><Badge tone="orange">Sample planning data—verify all details</Badge><section><h3 className="font-bold">Entry requirements</h3><ul className="mt-2 list-disc pl-5 text-[#59645e]">{selected.entryRequirements.map((item) => <li key={item}>{item}</li>)}</ul></section><dl className="grid gap-3 sm:grid-cols-2"><div><dt className="font-bold">Language requirements</dt><dd className="text-[#68736c]">{selected.languageRequirements}</dd></div><div><dt className="font-bold">GRE</dt><dd className="text-[#68736c]">{selected.greRequirement}</dd></div><div><dt className="font-bold">Recommendations</dt><dd className="text-[#68736c]">{selected.recommendationLetters}</dd></div><div><dt className="font-bold">Tuition</dt><dd className="text-[#68736c]">{selected.tuitionText}</dd></div></dl></div>}
      </Dialog>
      <Dialog open={applicationDraft !== null} title="Postgraduate application" description="Track status, notes and required documents." onClose={() => setApplicationDraft(null)}>
        {applicationDraft && <form onSubmit={(e) => { e.preventDefault(); updatePostgraduateApplication(applicationDraft); setApplicationDraft(null); }} className="space-y-4">
          <label className="block text-sm font-bold">Status<Select value={applicationDraft.status} onChange={(e) => setApplicationDraft({ ...applicationDraft, status: e.target.value as PostgraduateStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></label>
          <label className="block text-sm font-bold">Deadline<Input type="date" value={applicationDraft.deadline} onChange={(e) => setApplicationDraft({ ...applicationDraft, deadline: e.target.value })} /></label>
          <fieldset><legend className="text-sm font-bold">Document checklist</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{(Object.keys(applicationDraft.documents) as ProgramDocument[]).map((document) => <label key={document} className="flex min-h-11 items-center gap-2 rounded-xl bg-[#f5f4ee] px-3 text-sm"><input type="checkbox" checked={applicationDraft.documents[document]} onChange={(e) => setApplicationDraft({ ...applicationDraft, documents: { ...applicationDraft.documents, [document]: e.target.checked } })} />{document}</label>)}</div></fieldset>
          <label className="block text-sm font-bold">Notes<Textarea value={applicationDraft.notes} onChange={(e) => setApplicationDraft({ ...applicationDraft, notes: e.target.value })} /></label>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setApplicationDraft(null)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>}
      </Dialog>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { jobs, organisations } from "@/data/seed";
import { isJobSuitableForProfile } from "@/lib/match";
import { useCareerOS } from "@/providers/careeros-provider";
import type { Organisation } from "@/types/domain";

export function CompanyBrowser() {
  const { activeWorkspace, updateOrganisationNote } = useCareerOS();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [sector, setSector] = useState("All");
  const [location, setLocation] = useState("All");
  const [suitableOnly, setSuitableOnly] = useState(true);
  const [selected, setSelected] = useState<Organisation | null>(null);
  const [note, setNote] = useState("");

  const visible = useMemo(() => organisations.filter((organisation) => {
    const organisationJobs = jobs.filter((job) => job.organisationId === organisation.id);
    return (
      `${organisation.name} ${organisation.sector}`.toLowerCase().includes(query.toLowerCase()) &&
      (type === "All" || organisation.organisationType === type) &&
      (sector === "All" || organisation.sector === sector) &&
      (location === "All" || organisation.city === location) &&
      (!suitableOnly || organisationJobs.some((job) => isJobSuitableForProfile(job, activeWorkspace.profile)))
    );
  }), [activeWorkspace.profile, location, query, sector, suitableOnly, type]);

  function openDetails(organisation: Organisation) {
    setSelected(organisation);
    setNote(activeWorkspace.organisationNotes[organisation.id] ?? "");
  }

  return (
    <div className="page-enter">
      <PageHeading eyebrow="Organisation research" title="Companies & clinics" description="Compare sample organisations and keep private notes for the active profile." />
      <section aria-label="Company filters" className="mb-6 grid gap-3 rounded-[1.35rem] border border-[#dedfd7] bg-[#fffef9] p-4 sm:grid-cols-2 xl:grid-cols-5">
        <label className="xl:col-span-2"><span className="sr-only">Search organisations</span><Input type="search" placeholder="Search organisation or sector" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <Select aria-label="Organisation type" value={type} onChange={(e) => setType(e.target.value)}><option>All</option>{[...new Set(organisations.map((item) => item.organisationType))].map((value) => <option key={value}>{value}</option>)}</Select>
        <Select aria-label="Industry" value={sector} onChange={(e) => setSector(e.target.value)}><option>All</option>{[...new Set(organisations.map((item) => item.sector))].map((value) => <option key={value}>{value}</option>)}</Select>
        <Select aria-label="Location" value={location} onChange={(e) => setLocation(e.target.value)}><option>All</option>{[...new Set(organisations.map((item) => item.city))].map((value) => <option key={value}>{value}</option>)}</Select>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={suitableOnly} onChange={(e) => setSuitableOnly(e.target.checked)} /> Suitable for active profile</label>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((organisation) => {
          const related = jobs.filter((job) => job.organisationId === organisation.id && isJobSuitableForProfile(job, activeWorkspace.profile));
          return (
            <article key={organisation.id} className="rounded-[1.35rem] border border-[#dedfd7] bg-[#fffef9] p-5">
              <div className="flex flex-wrap gap-2"><Badge tone="orange">Sample data</Badge><Badge>{organisation.organisationType}</Badge></div>
              <h2 className="mt-4 break-words font-display text-lg font-extrabold">{organisation.name}</h2>
              <p className="mt-1 text-sm text-[#68736c]">{organisation.sector} · {organisation.city}</p>
              <div className="mt-4 flex flex-wrap gap-2">{organisation.roleFamilies.map((family) => <Badge key={family} tone="green">{family}</Badge>)}</div>
              <p className="mt-4 text-xs font-semibold text-[#7b857e]">{related.length} profile-relevant sample {related.length === 1 ? "job" : "jobs"}</p>
              <Button className="mt-5" size="sm" variant="secondary" onClick={() => openDetails(organisation)}>View organisation</Button>
            </article>
          );
        })}
      </div>
      {visible.length === 0 && <p className="rounded-[1.35rem] border border-dashed border-[#cfd2c9] p-10 text-center text-sm text-[#68736c]">No organisations match these filters.</p>}

      <Dialog open={selected !== null} title={selected?.name ?? "Organisation"} description="Sample organisation details and your profile-specific notes." onClose={() => setSelected(null)}>
        {selected && <div className="space-y-6">
          <p className="text-sm leading-6 text-[#59645e]">{selected.description}</p>
          <section><h3 className="font-bold">Relevant sample jobs</h3><ul className="mt-2 space-y-2">{jobs.filter((job) => job.organisationId === selected.id && isJobSuitableForProfile(job, activeWorkspace.profile)).map((job) => <li key={job.id} className="rounded-xl bg-[#f5f4ee] p-3 text-sm font-semibold">{job.title}</li>)}</ul></section>
          <label className="block text-sm font-bold">Private notes for {activeWorkspace.profile.preferredName || activeWorkspace.profile.displayName}<Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Research notes, questions or contacts" /></label>
          <div className="flex justify-end"><Button onClick={() => { updateOrganisationNote(selected.id, note); setSelected(null); }}>Save notes</Button></div>
        </div>}
      </Dialog>
    </div>
  );
}

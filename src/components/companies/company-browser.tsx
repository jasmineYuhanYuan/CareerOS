"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { jobs, organisations } from "@/data/seed";
import { isJobSuitableForProfile } from "@/lib/match";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { Organisation } from "@/types/domain";
import { displayOrganisationName } from "@/lib/presentation";

export function CompanyBrowser() {
  const { activeWorkspace, updateOrganisationNote } = useCareerOS();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [sector, setSector] = useState("All");
  const [location, setLocation] = useState("All");
  const [suitableOnly, setSuitableOnly] = useState(true);
  const [includeSamples, setIncludeSamples] = useState(false);
  const [selected, setSelected] = useState<Organisation | null>(null);
  const [note, setNote] = useState("");

  const visible = useMemo(() => organisations.filter((organisation) => {
    const organisationJobs = jobs.filter((job) => job.organisationId === organisation.id);
    return (
      `${organisation.name} ${organisation.sector}`.toLowerCase().includes(query.toLowerCase()) &&
      (type === "All" || organisation.organisationType === type) &&
      (sector === "All" || organisation.sector === sector) &&
      (location === "All" || organisation.city === location) &&
      (includeSamples || !organisation.sampleData) &&
      (!suitableOnly || organisationJobs.some((job) => isJobSuitableForProfile(job, activeWorkspace.profile)))
    );
  }), [activeWorkspace.profile, includeSamples, location, query, sector, suitableOnly, type]);

  function openDetails(organisation: Organisation) {
    setSelected(organisation);
    setNote(activeWorkspace.organisationNotes[organisation.id] ?? "");
  }

  return (
    <div className="page-enter">
      <PageHeading eyebrow={t("companies.eyebrow")} title={t("companies.title")} description={t("companies.description")} />
      <section aria-label="Company filters" className="surface-card mb-7 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
        <label className="xl:col-span-2"><span className="sr-only">Search organisations</span><Input type="search" placeholder="Search organisation or sector" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <Select aria-label="Organisation type" value={type} onChange={(e) => setType(e.target.value)}><option>All</option>{[...new Set(organisations.map((item) => item.organisationType))].map((value) => <option key={value}>{value}</option>)}</Select>
        <Select aria-label="Industry" value={sector} onChange={(e) => setSector(e.target.value)}><option>All</option>{[...new Set(organisations.map((item) => item.sector))].map((value) => <option key={value}>{value}</option>)}</Select>
        <Select aria-label="Location" value={location} onChange={(e) => setLocation(e.target.value)}><option>All</option>{[...new Set(organisations.map((item) => item.city))].map((value) => <option key={value}>{value}</option>)}</Select>
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={suitableOnly} onChange={(e) => setSuitableOnly(e.target.checked)} /> Suitable for active profile</label>
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={includeSamples} onChange={(e) => setIncludeSamples(e.target.checked)} /> Include sample organisations</label>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((organisation) => {
          const related = jobs.filter((job) => job.organisationId === organisation.id && isJobSuitableForProfile(job, activeWorkspace.profile));
          return (
            <article key={organisation.id} className="interactive-lift surface-card flex flex-col p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--surface-subtle)] font-display text-sm font-medium text-[var(--text-secondary)]">{organisation.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                <div className="min-w-0"><h2 className="break-words font-display text-lg font-medium leading-snug">{displayOrganisationName(organisation.name)}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{organisation.organisationType}</p></div>
              </div>
              <p className="mt-5 text-sm text-[var(--text-secondary)]">{organisation.sector} · {organisation.city}</p><div className="mt-3">{organisation.sampleData ? <Badge>{t("common.sampleNotice")}</Badge> : <StatusBadge status="positive">Official source</StatusBadge>}</div>
              <div className="mt-4 flex flex-wrap gap-2">{organisation.roleFamilies.slice(0, 3).map((family) => <Badge key={family}>{family}</Badge>)}</div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                <p className="text-[0.75rem] text-[var(--text-tertiary)]">{related.length} relevant {related.length === 1 ? "record" : "records"}{activeWorkspace.organisationNotes[organisation.id] ? " · Notes saved" : ""}</p>
                <Button size="sm" variant="ghost" onClick={() => openDetails(organisation)}>{t("companies.open")} →</Button>
              </div>
            </article>
          );
        })}
      </div>
      {visible.length === 0 && <p className="surface-card border-dashed p-10 text-center text-sm text-[var(--text-secondary)]">{t("companies.empty")}</p>}

      <Dialog open={selected !== null} title={selected?.name ?? "Organisation"} description="Source status and profile-specific research notes." onClose={() => setSelected(null)}>
        {selected && <div className="space-y-6">{selected.sampleData ? <Badge>{t("common.sampleNotice")}</Badge> : <StatusBadge status="positive">Official source</StatusBadge>}
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{selected.description}</p>
          <section><h3 className="font-medium">Relevant opportunity records</h3><ul className="mt-2 divide-y divide-[var(--border)]">{jobs.filter((job) => job.organisationId === selected.id && isJobSuitableForProfile(job, activeWorkspace.profile)).map((job) => <li key={job.id} className="py-3 text-sm font-medium">{job.title}</li>)}</ul></section>
          <label className="block text-sm font-medium">Private notes for {activeWorkspace.profile.preferredName || activeWorkspace.profile.displayName}<Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Research notes, questions or contacts" /></label>
          <div className="flex justify-end"><Button onClick={() => { updateOrganisationNote(selected.id, note); setSelected(null); }}>Save notes</Button></div>
        </div>}
      </Dialog>
    </div>
  );
}

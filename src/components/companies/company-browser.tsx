"use client";

import { useEffect, useMemo, useState } from "react";
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
import { buildEmployerIntelligence } from "@/lib/platform-intelligence";
import { fetchEmployerSnapshot, type LiveEmployerSnapshot } from "@/lib/employer-client";

export function CompanyBrowser() {
  const { activeWorkspace, updateOrganisationNote } = useCareerOS();
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [sector, setSector] = useState("All");
  const [location, setLocation] = useState("All");
  const [suitableOnly, setSuitableOnly] = useState(true);
  const [includeSamples, setIncludeSamples] = useState(false);
  const [selected, setSelected] = useState<Organisation | null>(null);
  const [note, setNote] = useState("");
  const [liveSnapshot, setLiveSnapshot] = useState<LiveEmployerSnapshot | null>(null);

  useEffect(() => {
    let active = true;
    fetchEmployerSnapshot().then((snapshot) => {
      if (active) setLiveSnapshot(snapshot);
    }).catch(() => {
      if (active) setLiveSnapshot(null);
    });
    return () => { active = false; };
  }, []);

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
      {liveSnapshot?.configured && (
        <section aria-label={language === "zh-CN" ? "实时雇主情报状态" : "Live employer intelligence status"} className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="surface-card p-4"><p className="text-xs text-[var(--text-tertiary)]">{language === "zh-CN" ? "公开雇主" : "Public employers"}</p><p className="mt-1 text-xl font-semibold">{liveSnapshot.employers.length}</p></div>
          <div className="surface-card p-4"><p className="text-xs text-[var(--text-tertiary)]">{language === "zh-CN" ? "已核验招聘信号" : "Verified hiring signals"}</p><p className="mt-1 text-xl font-semibold">{liveSnapshot.signals.length}</p></div>
          <div className="surface-card p-4"><p className="text-xs text-[var(--text-tertiary)]">{language === "zh-CN" ? "已关联在招职位" : "Linked live vacancies"}</p><p className="mt-1 text-xl font-semibold">{liveSnapshot.activeJobs.length}</p></div>
        </section>
      )}
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
          const intelligence = buildEmployerIntelligence(organisation, jobs);
          return (
            <article key={organisation.id} className="interactive-lift surface-card flex flex-col p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--surface-subtle)] font-display text-sm font-medium text-[var(--text-secondary)]">{organisation.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                <div className="min-w-0"><h2 className="break-words font-display text-lg font-medium leading-snug">{displayOrganisationName(organisation.name)}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{organisation.organisationType}</p></div>
              </div>
              <p className="mt-5 text-sm text-[var(--text-secondary)]">{organisation.sector} · {organisation.city}</p><div className="mt-3 flex flex-wrap gap-2">{organisation.sampleData ? <Badge>{t("common.sampleNotice")}</Badge> : <StatusBadge status="positive">{language === "zh-CN" ? "公开来源已核验" : "Public source verified"}</StatusBadge>}{intelligence.activeJobs.length > 0 && <Badge>{language === "zh-CN" ? `${intelligence.activeJobs.length} 个已核验职位` : `${intelligence.activeJobs.length} verified ${intelligence.activeJobs.length === 1 ? "vacancy" : "vacancies"}`}</Badge>}</div>
              <div className="mt-4 flex flex-wrap gap-2">{organisation.roleFamilies.slice(0, 3).map((family) => <Badge key={family}>{family}</Badge>)}</div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                <p className="text-[0.75rem] text-[var(--text-tertiary)]">{language === "zh-CN" ? `${intelligence.hiringSignals.length} 条招聘信号` : `${intelligence.hiringSignals.length} hiring ${intelligence.hiringSignals.length === 1 ? "signal" : "signals"}`}{activeWorkspace.organisationNotes[organisation.id] ? (language === "zh-CN" ? " · 已保存笔记" : " · Notes saved") : ""}</p>
                <Button size="sm" variant="ghost" onClick={() => openDetails(organisation)}>{t("companies.open")} →</Button>
              </div>
            </article>
          );
        })}
      </div>
      {visible.length === 0 && <p className="surface-card border-dashed p-10 text-center text-sm text-[var(--text-secondary)]">{t("companies.empty")}</p>}

      <Dialog open={selected !== null} title={selected?.name ?? (language === "zh-CN" ? "雇主" : "Employer")} description={language === "zh-CN" ? "公开雇主情报与当前资料的私人研究笔记。" : "Public employer intelligence and private candidate research notes."} onClose={() => setSelected(null)}>
        {selected && <div className="space-y-6">{selected.sampleData ? <Badge>{t("common.sampleNotice")}</Badge> : <StatusBadge status="positive">Official source</StatusBadge>}
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{selected.description}</p>
          <section><h3 className="font-medium">{t("companies.jobs")}</h3><ul className="mt-2 divide-y divide-[var(--border)]">{buildEmployerIntelligence(selected, jobs).activeJobs.map((job) => <li key={job.id} className="py-3 text-sm"><a className="font-medium text-[var(--accent)]" href={job.sourceUrl} target="_blank" rel="noreferrer">{job.title} ↗</a><p className="mt-1 text-xs text-[var(--text-tertiary)]">{job.location} · {job.lastUpdated || (language === "zh-CN" ? "核验日期未记录" : "Verification date not recorded")}</p></li>)}</ul>{buildEmployerIntelligence(selected, jobs).activeJobs.length === 0 && <p className="mt-2 text-sm text-[var(--text-secondary)]">{language === "zh-CN" ? "目前没有与该雇主关联的已核验在招职位。" : "No verified live vacancies are currently linked to this employer."}</p>}</section>
          <label className="block text-sm font-medium">Private notes for {activeWorkspace.profile.preferredName || activeWorkspace.profile.displayName}<Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Research notes, questions or contacts" /></label>
          <div className="flex justify-end"><Button onClick={() => { updateOrganisationNote(selected.id, note); setSelected(null); }}>Save notes</Button></div>
        </div>}
      </Dialog>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { opportunities } from "@/data/opportunities";
import { calculateOpportunityMatch } from "@/lib/opportunity-match";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { Opportunity, OpportunityCategory } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatPercentage } from "@/i18n/format";

export function OpportunityBrowser() {
  const { activeWorkspace, state, toggleSavedOpportunity, addJobApplication, upsertRoadmapItem } = useCareerOS();
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OpportunityCategory | "All">("All");
  const [location, setLocation] = useState("All");
  const [discipline, setDiscipline] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<"relevance" | "deadline">("relevance");
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const matches = useMemo(() => new Map(opportunities.map((item) => [item.id, calculateOpportunityMatch(item, activeWorkspace.profile)])), [activeWorkspace.profile]);
  const visible = useMemo(() => opportunities
    .filter((item) => state.dashboardPreferences.showArchivedOpportunities || !item.archived)
    .filter((item) => state.dashboardPreferences.showSampleData || !item.sampleData)
    .filter((item) => category === "All" || item.category === category)
    .filter((item) => location === "All" || item.country === location || item.city === location)
    .filter((item) => discipline === "All" || item.disciplineTags.includes(discipline))
    .filter((item) => !savedOnly || activeWorkspace.savedOpportunityIds.includes(item.id))
    .filter((item) => !verifiedOnly || item.verificationStatus === "Official source")
    .filter((item) => `${item.title} ${item.organisationName} ${item.description}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === "deadline"
      ? (a.deadline || "9999").localeCompare(b.deadline || "9999")
      : (matches.get(b.id)?.score ?? 0) - (matches.get(a.id)?.score ?? 0)),
  [activeWorkspace.savedOpportunityIds, category, discipline, location, matches, query, savedOnly, sort, state.dashboardPreferences, verifiedOnly]);

  const detailMatch = selected ? matches.get(selected.id) : null;
  const jobId = selected?.id.startsWith("opportunity-j") ? selected.id.replace("opportunity-", "") : "";
  const addSelectedToRoadmap = () => {
    if (!selected) return;
    upsertRoadmapItem({
      id: `roadmap-${selected.id}-${Date.now()}`,
      profileId: activeWorkspace.profile.id,
      title: `Review ${selected.title}`,
      description: selected.dataNotes ?? selected.description,
      category: selected.category === "Professional registration" ? "Registration" : selected.category === "Networking event" ? "Networking" : "Other",
      targetDate: selected.deadline ?? "",
      status: "Not started",
      priority: "Medium",
    });
  };

  return (
    <div className="page-enter">
      <PageHeading eyebrow={t("opportunities.eyebrow")} title={t("opportunities.title")} description={t("opportunities.description")} />
      <div className="mt-7 grid gap-3 md:grid-cols-4">
        <label className="md:col-span-2"><span className="sr-only">{t("opportunities.search")}</span><Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("opportunities.search")} /></label>
        <label><span className="sr-only">{t("opportunities.category")}</span><Select value={category} onChange={(event) => setCategory(event.target.value as OpportunityCategory | "All")}><option>All</option>{Array.from(new Set(opportunities.map((item) => item.category))).map((value) => <option key={value}>{value}</option>)}</Select></label>
        <label><span className="sr-only">{t("opportunities.location")}</span><Select value={location} onChange={(event) => setLocation(event.target.value)}><option>All</option>{Array.from(new Set(opportunities.flatMap((item) => [item.country, item.city]))).sort().map((value) => <option key={value}>{value}</option>)}</Select></label>
        <label><span className="sr-only">{t("opportunities.discipline")}</span><Select value={discipline} onChange={(event) => setDiscipline(event.target.value)}><option>All</option>{Array.from(new Set(opportunities.flatMap((item) => item.disciplineTags))).sort().map((value) => <option key={value}>{value}</option>)}</Select></label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={savedOnly} onChange={(event) => setSavedOnly(event.target.checked)} />{t("opportunities.savedOnly")}</label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} />{t("opportunities.verifiedOnly")}</label>
        <label><span className="sr-only">{t("opportunities.sort")}</span><Select value={sort} onChange={(event) => setSort(event.target.value as "relevance" | "deadline")}><option value="relevance">{t("opportunities.relevance")}</option><option value="deadline">{t("opportunities.deadline")}</option></Select></label>
      </div>
      {visible.length === 0 ? <div className="mt-8"><EmptyState icon="◇" title={t("opportunities.empty")} description={t("opportunities.description")} /></div> : (
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {visible.map((item) => {
            const match = matches.get(item.id);
            const saved = activeWorkspace.savedOpportunityIds.includes(item.id);
            return <article key={item.id} className="surface-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><Badge>{item.category}</Badge><StatusBadge status={item.verificationStatus === "Official source" ? "positive" : "neutral"}>{item.verificationStatus}</StatusBadge></div><h2 className="mt-4 font-display text-xl font-medium">{item.title}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{item.organisationName} · {item.locationText}</p></div><button type="button" className="min-h-11 px-2 text-[var(--accent)]" onClick={() => toggleSavedOpportunity(item.id)} aria-pressed={saved} aria-label={saved ? t("opportunities.unsave") : t("opportunities.save")}>{saved ? "●" : "○"}</button></div>
              <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--border)] pt-4"><div><p className="text-xs text-[var(--text-secondary)]">{t("opportunities.match")}</p><strong>{match ? formatPercentage(match.score, language) : "—"}</strong></div><div className="text-right">{item.deadline && <p className="text-xs text-[var(--text-secondary)]">{formatDate(item.deadline, language)}</p>}<Button size="sm" variant="secondary" onClick={() => setSelected(item)}>{t("opportunities.details")}</Button></div></div>
            </article>;
          })}
        </div>
      )}
      <Dialog open={Boolean(selected)} title={selected?.title ?? ""} description={selected ? `${selected.organisationName} · ${selected.locationText}` : ""} onClose={() => setSelected(null)}>
        {selected && detailMatch && <div className="space-y-6">
          <p className="text-sm leading-7 text-[var(--text-secondary)]">{selected.description}</p>
          <section><h3 className="font-medium">{t("opportunities.why")}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">{detailMatch.strengths.slice(0, 5).map((value) => <li key={value}>{value}</li>)}</ul></section>
          <section><h3 className="font-medium">{t("opportunities.review")}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">{detailMatch.gaps.map((value) => <li key={value}>{value}</li>)}</ul></section>
          <section className="rounded-xl bg-[var(--surface-subtle)] p-4 text-sm"><strong>{t("opportunities.source")}</strong><p className="mt-2 text-[var(--text-secondary)]">{selected.sourceName} · {selected.verificationStatus}</p>{selected.lastVerifiedAt && <p>{formatDate(selected.lastVerifiedAt, language)}</p>}{selected.dataNotes && <p className="mt-2 text-[var(--text-secondary)]">{selected.dataNotes}</p>}</section>
          <div className="flex flex-wrap gap-2"><Button onClick={() => toggleSavedOpportunity(selected.id)}>{activeWorkspace.savedOpportunityIds.includes(selected.id) ? t("opportunities.unsave") : t("opportunities.save")}</Button>{jobId ? <Button variant="secondary" onClick={() => addJobApplication(jobId)}>Add to applications</Button> : <Button variant="secondary" onClick={addSelectedToRoadmap}>Add to roadmap</Button>}{selected.sourceUrl && <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-[var(--accent)]">Open official source ↗</a>}</div>
        </div>}
      </Dialog>
    </div>
  );
}

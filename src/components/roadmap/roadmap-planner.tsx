"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChiropracticCareerHub } from "@/components/chiropractic/chiropractic-career-hub";
import { TOMMY_ID } from "@/data/seed";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { Priority, RoadmapCategory, RoadmapItem, RoadmapStatus } from "@/types/domain";

const categories: RoadmapCategory[] = ["Job application", "Postgraduate", "Skill", "Project", "Portfolio", "Interview", "Registration", "Networking", "Other"];
const statuses: RoadmapStatus[] = ["Not started", "In progress", "Completed", "Not applicable", "Blocked"];
const priorities: Priority[] = ["Low", "Medium", "High"];

function emptyItem(profileId: string): RoadmapItem {
  return { id: "", profileId, title: "", description: "", category: "Other", targetDate: "", status: "Not started", priority: "Medium" };
}

export function RoadmapPlanner() {
  const { activeWorkspace, upsertRoadmapItem, deleteRoadmapItem } = useCareerOS();
  const { language, t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [draft, setDraft] = useState<RoadmapItem | null>(null);
  const [error, setError] = useState("");
  const grouped = useMemo(() => {
    const filtered = activeWorkspace.roadmapItems.filter((item) => (statusFilter === "All" || item.status === statusFilter) && (categoryFilter === "All" || item.category === categoryFilter)).sort((a, b) => a.targetDate.localeCompare(b.targetDate));
    return Object.groupBy(filtered, (item) => item.targetDate ? new Date(`${item.targetDate}T00:00:00`).toLocaleDateString(language === "zh-CN" ? "zh-CN" : "en-AU", { month: "long", year: "numeric" }) : t("common.noDate"));
  }, [activeWorkspace.roadmapItems, categoryFilter, language, statusFilter, t]);

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft?.title.trim()) { setError(t("roadmap.validation")); return; }
    upsertRoadmapItem({ ...draft, id: draft.id || `roadmap-${Date.now()}` });
    setDraft(null); setError("");
  }

  return (
    <div className="page-enter">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><PageHeading eyebrow={t("roadmap.eyebrow")} title={t("roadmap.title")} description={t("roadmap.description")} /><Button onClick={() => setDraft(emptyItem(activeWorkspace.profile.id))}>{t("roadmap.add")}</Button></div>
      <div className="surface-card mb-8 flex flex-col gap-3 p-4 sm:flex-row">
        <Select aria-label="Filter roadmap status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All</option>{statuses.map((value) => <option key={value}>{value}</option>)}</Select>
        <Select aria-label="Filter roadmap category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option>All</option>{categories.map((value) => <option key={value}>{value}</option>)}</Select>
      </div>
      {Object.entries(grouped).map(([month, items]) => <section key={month} className="mb-10"><h2 className="eyebrow mb-4">{month}</h2><div className="relative ml-3 border-l border-[var(--border)] pl-7">{items?.map((item) => <article key={item.id} className={`relative border-b border-[var(--border)] py-5 first:pt-0 last:border-b-0 ${item.status === "Completed" ? "opacity-60" : ""}`}>
        <span aria-hidden="true" className={`absolute -left-[2.12rem] top-6 size-3 rounded-full border-2 border-[var(--background)] ${item.status === "Completed" ? "bg-[var(--success)]" : item.priority === "High" ? "bg-[var(--danger)]" : "bg-[var(--border-strong)]"}`} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <time dateTime={item.targetDate} className="w-24 shrink-0 text-sm font-medium text-[var(--text-secondary)]">{item.targetDate ? new Date(`${item.targetDate}T00:00:00`).toLocaleDateString(language === "zh-CN" ? "zh-CN" : "en-AU", { day: "numeric", month: "short" }) : t("common.noDate")}</time>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><StatusBadge status={item.status === "Completed" ? "positive" : item.priority === "High" ? "active" : "neutral"}>{item.status}</StatusBadge><StatusBadge>{item.category}</StatusBadge></div><h3 className={`mt-3 font-display text-lg font-medium ${item.status === "Completed" ? "line-through" : ""}`}>{item.title}</h3>{item.description && <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>}</div>
          <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => upsertRoadmapItem({ ...item, status: item.status === "Completed" ? "In progress" : "Completed" })}>{item.status === "Completed" ? t("roadmap.reopen") : t("roadmap.complete")}</Button><Button size="sm" variant="ghost" onClick={() => setDraft(structuredClone(item))}>{t("common.edit")}</Button><Button size="sm" variant="ghost" onClick={() => window.confirm(t("roadmap.deleteConfirm", { title: item.title })) && deleteRoadmapItem(item.id)}>{t("common.delete")}</Button></div>
        </div>
      </article>)}</div></section>)}
      {Object.keys(grouped).length === 0 && <p className="surface-card border-dashed p-10 text-center text-sm text-[var(--text-secondary)]">{t("roadmap.empty")}</p>}
      <Dialog open={draft !== null} title={draft?.id ? t("roadmap.edit") : t("roadmap.add")} onClose={() => setDraft(null)}>
        {draft && <form onSubmit={save} className="space-y-4"><Field label="Title" error={error}><Input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field><Field label="Description"><Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><Select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as RoadmapCategory })}>{categories.map((value) => <option key={value}>{value}</option>)}</Select></Field><Field label="Target date"><Input type="date" value={draft.targetDate} onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })} /></Field><Field label="Status"><Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as RoadmapStatus })}>{statuses.map((value) => <option key={value}>{value}</option>)}</Select></Field><Field label="Priority"><Select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}>{priorities.map((value) => <option key={value}>{value}</option>)}</Select></Field></div><div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setDraft(null)}>Cancel</Button><Button type="submit">Save item</Button></div></form>}
      </Dialog>
      {activeWorkspace.profile.id === TOMMY_ID && <div className="mt-14 border-t border-[var(--border)] pt-10"><ChiropracticCareerHub /></div>}
    </div>
  );
}

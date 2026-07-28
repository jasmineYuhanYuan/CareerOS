"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { useCareerOS } from "@/providers/careeros-provider";
import type { Priority, RoadmapCategory, RoadmapItem, RoadmapStatus } from "@/types/domain";

const categories: RoadmapCategory[] = ["Job application", "Postgraduate", "Skill", "Project", "Portfolio", "Interview", "Registration", "Networking", "Other"];
const statuses: RoadmapStatus[] = ["Not started", "In progress", "Completed", "Blocked"];
const priorities: Priority[] = ["Low", "Medium", "High"];

function emptyItem(profileId: string): RoadmapItem {
  return { id: "", profileId, title: "", description: "", category: "Other", targetDate: "", status: "Not started", priority: "Medium" };
}

export function RoadmapPlanner() {
  const { activeWorkspace, upsertRoadmapItem, deleteRoadmapItem } = useCareerOS();
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [draft, setDraft] = useState<RoadmapItem | null>(null);
  const [error, setError] = useState("");
  const grouped = useMemo(() => {
    const filtered = activeWorkspace.roadmapItems.filter((item) => (statusFilter === "All" || item.status === statusFilter) && (categoryFilter === "All" || item.category === categoryFilter)).sort((a, b) => a.targetDate.localeCompare(b.targetDate));
    return Object.groupBy(filtered, (item) => item.targetDate ? new Date(`${item.targetDate}T00:00:00`).toLocaleDateString("en-AU", { month: "long", year: "numeric" }) : "No target month");
  }, [activeWorkspace.roadmapItems, categoryFilter, statusFilter]);

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft?.title.trim()) { setError("A title is required."); return; }
    upsertRoadmapItem({ ...draft, id: draft.id || `roadmap-${Date.now()}` });
    setDraft(null); setError("");
  }

  return (
    <div className="page-enter">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><PageHeading eyebrow="Editable monthly plan" title="Career roadmap" description="Turn goals into dated, profile-specific actions without implying progress you have not recorded." /><Button onClick={() => setDraft(emptyItem(activeWorkspace.profile.id))}>Add roadmap item</Button></div>
      <div className="mb-6 flex flex-col gap-3 rounded-[1.35rem] border border-[#dedfd7] bg-[#fffef9] p-4 sm:flex-row">
        <Select aria-label="Filter roadmap status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All</option>{statuses.map((value) => <option key={value}>{value}</option>)}</Select>
        <Select aria-label="Filter roadmap category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option>All</option>{categories.map((value) => <option key={value}>{value}</option>)}</Select>
      </div>
      {Object.entries(grouped).map(([month, items]) => <section key={month} className="mb-8"><h2 className="mb-3 font-display text-xl font-extrabold">{month}</h2><div className="space-y-3">{items?.map((item) => <article key={item.id} className="flex flex-col gap-4 rounded-[1.35rem] border border-[#dedfd7] bg-[#fffef9] p-5 sm:flex-row sm:items-center">
        <button type="button" aria-label={`Mark ${item.title} ${item.status === "Completed" ? "in progress" : "completed"}`} aria-pressed={item.status === "Completed"} onClick={() => upsertRoadmapItem({ ...item, status: item.status === "Completed" ? "In progress" : "Completed" })} className={`grid size-11 shrink-0 place-items-center rounded-xl border-2 text-lg font-bold ${item.status === "Completed" ? "border-[#245b45] bg-[#245b45] text-white" : "border-[#cfd2c9] text-transparent"}`}>✓</button>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Badge tone={item.priority === "High" ? "orange" : "neutral"}>{item.priority}</Badge><Badge tone="green">{item.category}</Badge><Badge tone="blue">{item.status}</Badge></div><h3 className={`mt-3 font-bold ${item.status === "Completed" ? "text-[#7b857e] line-through" : ""}`}>{item.title}</h3>{item.description && <p className="mt-1 text-sm text-[#68736c]">{item.description}</p>}<time dateTime={item.targetDate} className="mt-2 block text-xs font-semibold text-[#7b857e]">{item.targetDate || "No target date"}</time></div>
        <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setDraft(structuredClone(item))}>Edit</Button><Button size="sm" variant="ghost" onClick={() => window.confirm(`Delete “${item.title}”?`) && deleteRoadmapItem(item.id)}>Delete</Button></div>
      </article>)}</div></section>)}
      {Object.keys(grouped).length === 0 && <p className="rounded-[1.35rem] border border-dashed border-[#cfd2c9] p-10 text-center text-sm text-[#68736c]">No roadmap items match these filters.</p>}
      <Dialog open={draft !== null} title={draft?.id ? "Edit roadmap item" : "Add roadmap item"} onClose={() => setDraft(null)}>
        {draft && <form onSubmit={save} className="space-y-4"><Field label="Title" error={error}><Input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field><Field label="Description"><Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><Select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as RoadmapCategory })}>{categories.map((value) => <option key={value}>{value}</option>)}</Select></Field><Field label="Target date"><Input type="date" value={draft.targetDate} onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })} /></Field><Field label="Status"><Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as RoadmapStatus })}>{statuses.map((value) => <option key={value}>{value}</option>)}</Select></Field><Field label="Priority"><Select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}>{priorities.map((value) => <option key={value}>{value}</option>)}</Select></Field></div><div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setDraft(null)}>Cancel</Button><Button type="submit">Save item</Button></div></form>}
      </Dialog>
    </div>
  );
}

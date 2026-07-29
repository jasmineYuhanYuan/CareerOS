"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/providers/toast-provider";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { ApplicationStatus, JobApplication } from "@/types/domain";

const statuses: ApplicationStatus[] = ["Saved", "Preparing", "Applied", "Assessment", "Interview", "Offer", "Rejected", "Withdrawn"];

function timestamp(): string { return new Date().toISOString(); }

function emptyApplication(profileId: string): JobApplication {
  const createdAt = timestamp();
  return {
    id: "", profileId, jobId: "", organisationName: "", jobTitle: "", status: "Preparing",
    savedAt: createdAt, appliedAt: "", nextAction: "", nextActionDate: "", cvVersion: "",
    notes: "", lastUpdatedAt: createdAt,
    activity: [{ id: `activity-${Date.now()}`, type: "created", label: "Application created", occurredAt: createdAt }],
  };
}

export function ApplicationTracker() {
  const { activeWorkspace, createApplication, updateApplication, deleteApplication } = useCareerOS();
  const { t } = useLanguage();
  const { notify } = useToast();
  const [view, setView] = useState<"Board" | "List">("Board");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [draft, setDraft] = useState<JobApplication | null>(null);
  const [error, setError] = useState("");

  const visible = useMemo(() => activeWorkspace.applications.filter((application) =>
    `${application.organisationName} ${application.jobTitle}`.toLowerCase().includes(query.toLowerCase()) &&
    (statusFilter === "All" || application.status === statusFilter)
  ), [activeWorkspace.applications, query, statusFilter]);

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft?.organisationName.trim() || !draft.jobTitle.trim()) {
      setError(t("applications.validation"));
      return;
    }
    const previous = activeWorkspace.applications.find((item) => item.id === draft.id);
    const activity = [...draft.activity];
    const at = timestamp();
    if (previous && previous.status !== draft.status) activity.push({ id: `activity-${Date.now()}-status`, type: "status_changed", label: `Status changed to ${draft.status}`, occurredAt: at });
    if (previous && previous.notes !== draft.notes) activity.push({ id: `activity-${Date.now()}-notes`, type: "notes_updated", label: "Notes updated", occurredAt: at });
    if (previous && (previous.nextAction !== draft.nextAction || previous.nextActionDate !== draft.nextActionDate)) activity.push({ id: `activity-${Date.now()}-next`, type: "next_action_updated", label: "Next action updated", occurredAt: at });
    const ready = { ...draft, id: draft.id || `manual-${Date.now()}`, lastUpdatedAt: at, activity };
    if (previous) updateApplication(ready);
    else { createApplication(ready); notify(t("feedback.applicationCreated")); }
    setDraft(null);
    setError("");
  }

  const editor = (
    <Dialog open={draft !== null} title={draft?.id ? t("applications.edit") : t("applications.create")} description={t("applications.description")} onClose={() => setDraft(null)}>
      {draft && <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Organisation" error={error}><Input required value={draft.organisationName} onChange={(e) => setDraft({ ...draft, organisationName: e.target.value })} /></Field>
          <Field label="Role title"><Input required value={draft.jobTitle} onChange={(e) => setDraft({ ...draft, jobTitle: e.target.value })} /></Field>
          <Field label="Status"><Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ApplicationStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></Field>
          <Field label="Date applied"><Input type="date" value={draft.appliedAt} onChange={(e) => setDraft({ ...draft, appliedAt: e.target.value })} /></Field>
          <Field label="Next action"><Input value={draft.nextAction} onChange={(e) => setDraft({ ...draft, nextAction: e.target.value })} /></Field>
          <Field label="Next-action date"><Input type="date" value={draft.nextActionDate} onChange={(e) => setDraft({ ...draft, nextActionDate: e.target.value })} /></Field>
          <Field label="CV version"><Input value={draft.cvVersion} onChange={(e) => setDraft({ ...draft, cvVersion: e.target.value })} /></Field>
        </div>
        <Field label="Notes"><Textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></Field>
        {draft.id && <section><h3 className="text-sm font-medium">Activity history</h3><ol className="mt-2 divide-y divide-[var(--border)]">{draft.activity.slice().reverse().map((event) => <li key={event.id} className="flex justify-between gap-3 py-3 text-xs"><span className="font-medium">{event.label}</span><time dateTime={event.occurredAt} className="text-[var(--text-tertiary)]">{new Date(event.occurredAt).toLocaleDateString("en-AU")}</time></li>)}</ol></section>}
        <div className="flex flex-wrap justify-between gap-2">
          {draft.id ? <Button type="button" variant="danger" onClick={() => { if (window.confirm(t("applications.deleteConfirm"))) { deleteApplication(draft.id); setDraft(null); } }}>{t("common.delete")}</Button> : <span />}
          <div className="flex gap-2"><Button type="button" variant="secondary" onClick={() => setDraft(null)}>{t("common.cancel")}</Button><Button type="submit">{t("applications.save")}</Button></div>
        </div>
      </form>}
    </Dialog>
  );

  return (
    <div className="page-enter">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeading eyebrow={t("applications.eyebrow")} title={t("applications.title")} description={t("applications.description")} />
        <Button onClick={() => setDraft(emptyApplication(activeWorkspace.profile.id))}>{t("applications.create")}</Button>
      </div>
      <div className="surface-card mb-7 flex flex-col gap-3 p-4 sm:flex-row">
        <label className="flex-1"><span className="sr-only">Search applications</span><Input type="search" placeholder="Search organisation or role" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <Select aria-label="Filter application status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:max-w-48"><option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}</Select>
        <div className="hidden rounded-xl bg-[var(--surface-subtle)] p-1 md:flex" aria-label="Application view">
          {(["Board", "List"] as const).map((mode) => <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)} className={`min-h-10 flex-1 rounded-lg px-4 text-sm font-medium ${view === mode ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm" : "text-[var(--text-secondary)]"}`}>{mode}</button>)}
        </div>
      </div>

      {visible.length === 0 ? <EmptyState icon="▤" title={t("applications.emptyTitle")} description={t("applications.emptyBody")} actionLabel={t("applications.create")} actionOnClick={() => setDraft(emptyApplication(activeWorkspace.profile.id))} secondaryLabel={t("applications.browseJobs")} secondaryHref="/jobs" /> : view === "List" ? (
        <div className="hidden overflow-x-auto rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)] md:block">
          <table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-[var(--surface-subtle)] text-xs uppercase tracking-wide text-[var(--text-secondary)]"><tr><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Next action</th><th className="p-4">Date</th><th className="p-4"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-[var(--border)]">{visible.map((application) => <tr key={application.id}><td className="p-4"><strong className="font-medium">{application.jobTitle}</strong><span className="mt-1 block text-xs text-[var(--text-secondary)]">{application.organisationName}</span></td><td className="p-4"><StatusBadge status="active">{application.status}</StatusBadge></td><td className="p-4">{application.nextAction || "Not set"}</td><td className="p-4">{application.nextActionDate || "—"}</td><td className="p-4"><Button size="sm" variant="secondary" onClick={() => setDraft(structuredClone(application))}>Edit</Button></td></tr>)}</tbody></table>
        </div>
      ) : (
        <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
          {statuses.map((status) => {
            const items = visible.filter((application) => application.status === status);
            return <section key={status} className="min-w-0 rounded-[1.25rem] bg-[var(--surface-subtle)] p-3"><h2 className="flex items-center justify-between p-2 text-sm font-medium">{status}<span className="text-xs text-[var(--text-tertiary)]">{items.length}</span></h2><div className="space-y-3">{items.map((application) => <button type="button" key={application.id} onClick={() => setDraft(structuredClone(application))} className="min-h-24 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition-colors hover:border-[var(--accent)]"><strong className="block text-sm font-medium">{application.jobTitle}</strong><span className="mt-1 block text-xs text-[var(--text-secondary)]">{application.organisationName}</span>{application.nextAction && <span className="mt-3 block text-xs font-medium text-[var(--text-secondary)]">Next: {application.nextAction}</span>}</button>)}</div></section>;
          })}
        </div>
      )}
      {visible.length > 0 && <div className="space-y-6 md:hidden">{statuses.map((status) => {
        const items = visible.filter((application) => application.status === status);
        if (items.length === 0) return null;
        return <section key={status}><h2 className="mb-2 flex items-center justify-between text-sm font-medium">{status}<span className="text-[var(--text-tertiary)]">{items.length}</span></h2><div className="divide-y divide-[var(--border)] rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)]">{items.map((application) => <button type="button" key={application.id} onClick={() => setDraft(structuredClone(application))} className="block min-h-20 w-full p-4 text-left"><strong className="block font-medium">{application.jobTitle}</strong><span className="mt-1 block text-sm text-[var(--text-secondary)]">{application.organisationName}</span>{application.nextAction && <span className="mt-2 block text-xs text-[var(--text-secondary)]">Next: {application.nextAction}</span>}</button>)}</div></section>;
      })}</div>}
      {editor}
    </div>
  );
}

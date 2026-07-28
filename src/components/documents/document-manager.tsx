"use client";

import { useState } from "react";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { CareerDocumentRecord, CareerDocumentStatus, CareerDocumentType } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/i18n/format";

const documentTypes: CareerDocumentType[] = ["English résumé", "Chinese résumé", "Cover letter", "Portfolio", "Academic transcript", "Personal statement", "Recommendation materials", "Other"];
const statuses: CareerDocumentStatus[] = ["Draft", "Ready", "Needs update", "Archived"];
function blank(profileId: string): CareerDocumentRecord { return { id: `document-${Date.now()}`, profileId, documentType: "English résumé", name: "", version: "v1", updatedAt: new Date().toISOString().slice(0, 10), notes: "", status: "Draft" }; }

export function DocumentManager() {
  const { activeWorkspace, upsertDocument, deleteDocument } = useCareerOS();
  const { language, t } = useLanguage();
  const [draft, setDraft] = useState<CareerDocumentRecord | null>(null);
  const save = () => { if (!draft?.name.trim()) return; upsertDocument({ ...draft, name: draft.name.trim() }); setDraft(null); };
  return <div className="page-enter">
    <PageHeading eyebrow={t("documents.eyebrow")} title={t("documents.title")} description={t("documents.description")} action={<Button onClick={() => setDraft(blank(activeWorkspace.profile.id))}>{t("documents.add")}</Button>} />
    {activeWorkspace.documents.length === 0 ? <div className="mt-8"><EmptyState icon="□" title={t("documents.empty")} description={t("documents.description")} /></div> : <div className="mt-8 grid gap-4 md:grid-cols-2">{activeWorkspace.documents.map((document) => <article key={document.id} className="surface-card p-5"><div className="flex justify-between gap-4"><StatusBadge status={document.status === "Ready" ? "positive" : "neutral"}>{document.status}</StatusBadge><span className="text-xs text-[var(--text-secondary)]">{formatDate(document.updatedAt, language)}</span></div><h2 className="mt-4 font-display text-lg font-medium">{document.name}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{document.documentType} · {document.version}</p><div className="mt-4 flex gap-1"><Button size="sm" variant="ghost" onClick={() => setDraft(structuredClone(document))}>{t("common.edit")}</Button><Button size="sm" variant="ghost" onClick={() => window.confirm(`Delete ${document.name}?`) && deleteDocument(document.id)}>{t("common.delete")}</Button></div></article>)}</div>}
    <Dialog open={Boolean(draft)} title={draft?.name ? t("common.edit") : t("documents.add")} onClose={() => setDraft(null)}>{draft && <div className="grid gap-4 sm:grid-cols-2"><Field label="Name"><Input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="Version"><Input value={draft.version} onChange={(event) => setDraft({ ...draft, version: event.target.value })} /></Field><Field label="Document type"><Select value={draft.documentType} onChange={(event) => setDraft({ ...draft, documentType: event.target.value as CareerDocumentType })}>{documentTypes.map((value) => <option key={value}>{value}</option>)}</Select></Field><Field label="Status"><Select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as CareerDocumentStatus })}>{statuses.map((value) => <option key={value}>{value}</option>)}</Select></Field><Field label="Updated date"><Input type="date" value={draft.updatedAt} onChange={(event) => setDraft({ ...draft, updatedAt: event.target.value })} /></Field><Field label="External URL"><Input type="url" value={draft.externalUrl ?? ""} onChange={(event) => setDraft({ ...draft, externalUrl: event.target.value })} /></Field><div className="sm:col-span-2"><Field label="Notes"><Textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></Field></div><div className="flex justify-end gap-2 sm:col-span-2"><Button variant="ghost" onClick={() => setDraft(null)}>{t("common.cancel")}</Button><Button onClick={save} disabled={!draft.name.trim()}>{t("common.save")}</Button></div></div>}</Dialog>
  </div>;
}

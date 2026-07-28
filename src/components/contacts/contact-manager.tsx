"use client";

import { useMemo, useState } from "react";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { CareerContact, RelationshipType } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { formatDate } from "@/i18n/format";

const relationshipTypes: RelationshipType[] = ["Recruiter", "Hiring manager", "University contact", "Lecturer", "Alumni", "Mentor", "Clinic owner", "Professional contact", "Other"];

function blank(profileId: string): CareerContact {
  const timestamp = new Date().toISOString();
  return { id: `contact-${Date.now()}`, profileId, name: "", organisation: "", role: "", relationshipType: "Professional contact", notes: "", createdAt: timestamp, updatedAt: timestamp };
}

export function ContactManager() {
  const { activeWorkspace, upsertContact, deleteContact } = useCareerOS();
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<RelationshipType | "All">("All");
  const [draft, setDraft] = useState<CareerContact | null>(null);
  const visible = useMemo(() => activeWorkspace.contacts.filter((item) => type === "All" || item.relationshipType === type).filter((item) => `${item.name} ${item.organisation} ${item.role}`.toLowerCase().includes(query.toLowerCase())), [activeWorkspace.contacts, query, type]);
  const save = () => {
    if (!draft?.name.trim()) return;
    upsertContact({ ...draft, name: draft.name.trim(), updatedAt: new Date().toISOString() });
    setDraft(null);
  };
  return <div className="page-enter">
    <PageHeading eyebrow={t("contacts.eyebrow")} title={t("contacts.title")} description={t("contacts.description")} action={<Button onClick={() => setDraft(blank(activeWorkspace.profile.id))}>{t("contacts.add")}</Button>} />
    <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_15rem]"><Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("contacts.search")} aria-label={t("contacts.search")} /><Select value={type} onChange={(event) => setType(event.target.value as RelationshipType | "All")} aria-label="Relationship type"><option>All</option>{relationshipTypes.map((value) => <option key={value}>{value}</option>)}</Select></div>
    {visible.length === 0 ? <div className="mt-8"><EmptyState icon="○" title={t("contacts.empty")} description={t("contacts.description")} /></div> : <div className="mt-8 divide-y divide-[var(--border)] rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)]">{visible.map((contact) => <article key={contact.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="text-xs text-[var(--text-secondary)]">{contact.relationshipType}</p><h2 className="mt-1 font-display text-lg font-medium">{contact.name}</h2><p className="text-sm text-[var(--text-secondary)]">{contact.role}{contact.organisation && ` · ${contact.organisation}`}</p>{contact.nextFollowUpDate && <p className="mt-2 text-xs">Follow up: {formatDate(contact.nextFollowUpDate, language)}</p>}</div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => setDraft(structuredClone(contact))}>{t("common.edit")}</Button><Button variant="ghost" size="sm" onClick={() => window.confirm(`Delete ${contact.name}?`) && deleteContact(contact.id)}>{t("common.delete")}</Button></div></article>)}</div>}
    <Dialog open={Boolean(draft)} title={draft?.name ? t("common.edit") : t("contacts.add")} onClose={() => setDraft(null)}>{draft && <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Name"><Input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
      <Field label="Relationship"><Select value={draft.relationshipType} onChange={(event) => setDraft({ ...draft, relationshipType: event.target.value as RelationshipType })}>{relationshipTypes.map((value) => <option key={value}>{value}</option>)}</Select></Field>
      <Field label="Organisation"><Input value={draft.organisation} onChange={(event) => setDraft({ ...draft, organisation: event.target.value })} /></Field>
      <Field label="Role"><Input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} /></Field>
      <Field label="Email"><Input type="email" value={draft.email ?? ""} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></Field>
      <Field label="LinkedIn URL"><Input type="url" value={draft.linkedInUrl ?? ""} onChange={(event) => setDraft({ ...draft, linkedInUrl: event.target.value })} /></Field>
      <Field label="Last contact"><Input type="date" value={draft.lastContactDate ?? ""} onChange={(event) => setDraft({ ...draft, lastContactDate: event.target.value })} /></Field>
      <Field label="Next follow-up"><Input type="date" value={draft.nextFollowUpDate ?? ""} onChange={(event) => setDraft({ ...draft, nextFollowUpDate: event.target.value })} /></Field>
      <div className="sm:col-span-2"><Field label="Notes"><Textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></Field></div>
      <div className="flex justify-end gap-2 sm:col-span-2"><Button variant="ghost" onClick={() => setDraft(null)}>{t("common.cancel")}</Button><Button onClick={save} disabled={!draft.name.trim()}>{t("common.save")}</Button></div>
    </div>}</Dialog>
  </div>;
}

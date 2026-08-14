"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { clinicsForProfile } from "@/lib/clinic-directory";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { CareerContact } from "@/types/domain";

export function ClinicDirectory() {
  const { activeWorkspace, upsertContact } = useCareerOS();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const clinics = clinicsForProfile(activeWorkspace.profile);
  const [followUps, setFollowUps] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const contacts = useMemo(
    () => new Map(activeWorkspace.contacts.map((contact) => [contact.organisation, contact])),
    [activeWorkspace.contacts],
  );

  function saveClinic(clinic: (typeof clinics)[number], contacted = false) {
    const existing = contacts.get(clinic.organisationName);
    const timestamp = new Date().toISOString();
    const contact: CareerContact = {
      id: existing?.id ?? `target-clinic-${clinic.id}`,
      profileId: activeWorkspace.profile.id,
      name: clinic.organisationName,
      organisation: clinic.organisationName,
      role: "Target chiropractic clinic",
      relationshipType: "Clinic owner",
      lastContactDate: contacted ? timestamp.slice(0, 10) : existing?.lastContactDate,
      nextFollowUpDate: followUps[clinic.id] ?? existing?.nextFollowUpDate,
      notes: notes[clinic.id] ?? existing?.notes ?? "",
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    upsertContact(contact);
  }

  if (clinics.length === 0) {
    return <div className="page-enter"><PageHeading eyebrow={zh ? "档案专属数据" : "Profile-specific data"} title={zh ? "诊所目录" : "Clinic directory"} description={zh ? "诊所目录仅属于 Tommy 的脊椎按摩职业工作区。切换到 Tommy 后查看。" : "The clinic directory belongs only to Tommy’s chiropractic workspace. Switch to Tommy to view it."} /></div>;
  }

  return <div className="page-enter">
    <PageHeading eyebrow={zh ? "Tommy · ACT / NSW" : "Tommy · ACT / NSW"} title={zh ? "诊所目录" : "Clinic directory"} description={zh ? "已核验的诊所研究与主动联系目录。诊所目录，不代表当前正在招聘。" : "A verified clinic research and outreach directory. Directory records do not represent current vacancies."} />
    <div id="clinic-directory" className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm text-[var(--text-secondary)]">
      {zh ? "诊所目录，不代表当前正在招聘。目录记录不会计入在招岗位或推荐岗位数量。" : "Clinic directory only — not evidence of current hiring. Directory records never count as active or recommended vacancies."}
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      {clinics.map((clinic, index) => {
        const contact = contacts.get(clinic.organisationName);
        return <article key={clinic.id} id={index === 0 ? "add-target-clinic" : undefined} className="surface-card p-5">
          <div className="flex flex-wrap gap-2"><StatusBadge status="positive">{zh ? "官网已核验" : "Official website verified"}</StatusBadge><Badge>{clinic.stateOrTerritory}</Badge><StatusBadge>{contact?.lastContactDate ? (zh ? "已联系" : "Contacted") : contact ? (zh ? "目标诊所" : "Target clinic") : (zh ? "未追踪" : "Not tracked")}</StatusBadge></div>
          <h2 className="mt-4 font-display text-xl font-medium">{clinic.organisationName}</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{clinic.suburb} · {clinic.city} · {clinic.stateOrTerritory}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-[var(--text-tertiary)]">{zh ? "核验状态" : "Verification"}</dt><dd className="mt-1">{clinic.verificationStatus}</dd></div><div><dt className="text-[var(--text-tertiary)]">{zh ? "最后核验" : "Last verified"}</dt><dd className="mt-1">{clinic.lastVerified}</dd></div></dl>
          <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{clinic.dataNotes}</p>
          <a href={clinic.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">{zh ? "访问诊所官网" : "Official website"} ↗</a>
          <div className="mt-4 grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2"><label className="text-sm font-medium">{zh ? "跟进日期" : "Follow-up date"}<Input type="date" value={followUps[clinic.id] ?? contact?.nextFollowUpDate ?? ""} onChange={(event) => setFollowUps((current) => ({ ...current, [clinic.id]: event.target.value }))} /></label><label className="text-sm font-medium sm:col-span-2">{zh ? "私人备注" : "Private notes"}<Textarea value={notes[clinic.id] ?? contact?.notes ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [clinic.id]: event.target.value }))} /></label></div>
          <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => saveClinic(clinic)}>{contact ? (zh ? "保存更新" : "Save updates") : (zh ? "添加到目标诊所" : "Add to target clinics")}</Button><Button size="sm" variant="ghost" onClick={() => saveClinic(clinic, true)}>{zh ? "标记已联系" : "Mark contacted"}</Button></div>
        </article>;
      })}
    </div>
  </div>;
}

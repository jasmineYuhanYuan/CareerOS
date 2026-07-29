"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { canberraChiropracticEmployers } from "@/data/verified/chiropractic";
import { opportunities } from "@/data/opportunities";
import { TOMMY_ID } from "@/data/seed";
import { analyseCareerGap, gapTargets } from "@/lib/gap-analysis/engine";
import { deriveOpportunityLifecycle, materialIsReady } from "@/lib/opportunity-lifecycle";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="surface-card p-5"><h2 className="font-display text-xl font-medium">{title}</h2><div className="mt-4">{children}</div></section>;
}

export function ActionCentre() {
  const { activeWorkspace, upsertContact } = useCareerOS();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const today = new Date().toISOString().slice(0, 10);
  const target = gapTargets.find((item) => item.profileIds.includes(activeWorkspace.profile.id));
  const gap = analyseCareerGap(activeWorkspace, target?.id ?? gapTargets[0].id);
  const lifecycleRecords = opportunities.map((opportunity) => ({
    opportunity,
    lifecycle: deriveOpportunityLifecycle(opportunity, today),
  }));
  const profileLifecycleRecords = lifecycleRecords.filter((item) =>
    item.opportunity.suitableProfileIds.includes(activeWorkspace.profile.id),
  );
  const closingSoon = profileLifecycleRecords.filter((item) => item.lifecycle === "Closing soon");
  const recent = profileLifecycleRecords.filter((item) => item.opportunity.lastVerifiedAt && item.opportunity.lastVerifiedAt >= "2026-07-29");
  const todayItems = activeWorkspace.roadmapItems.filter((item) => item.status !== "Completed" && item.targetDate && item.targetDate <= today);
  const applicationsNeedingAction = activeWorkspace.applications.filter((item) =>
    !["Offer", "Rejected", "Withdrawn", "Archived"].includes(item.status)
    && (item.nextAction || item.nextActionDate),
  );
  const sessions = activeWorkspace.applications.flatMap((application) =>
    (application.sessions ?? []).filter((session) => session.status !== "Completed" && session.status !== "Cancelled").map((session) => ({ application, session })),
  );
  const materialGaps = activeWorkspace.applications.flatMap((application) =>
    (application.materials ?? []).filter((material) => !materialIsReady(material.status)).map((material) => ({ application, material })),
  );
  const saved = opportunities.filter((item) => activeWorkspace.savedOpportunityIds.includes(item.id));
  const followUps = activeWorkspace.contacts.filter((contact) => contact.nextFollowUpDate && contact.nextFollowUpDate <= today);
  const isTommy = activeWorkspace.profile.id === TOMMY_ID;

  function addClinic(employer: (typeof canberraChiropracticEmployers)[number]) {
    const existing = activeWorkspace.contacts.find((contact) => contact.organisation === employer.organisationName);
    upsertContact({
      id: existing?.id ?? `clinic-outreach-${employer.id}`,
      profileId: activeWorkspace.profile.id,
      name: existing?.name ?? employer.organisationName,
      organisation: employer.organisationName,
      role: "Clinic research contact",
      relationshipType: "Clinic owner",
      notes: `${employer.dataNotes} Research record only; no active vacancy is claimed.`,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastContactDate: existing?.lastContactDate,
      nextFollowUpDate: existing?.nextFollowUpDate,
    });
  }

  const empty = <p className="text-sm text-[var(--text-secondary)]">{zh ? "当前没有项目。" : "Nothing currently requires attention."}</p>;
  return <div className="page-enter">
    <PageHeading eyebrow={zh ? "Sprint 8 · 下一步行动" : "Sprint 8 · Next actions"} title={zh ? "行动中心" : "Action centre"} description={zh ? `只显示 ${activeWorkspace.profile.preferredName} 当前档案的行动、目标和跟进。` : `Actions, targets and follow-ups for ${activeWorkspace.profile.preferredName}'s current profile only.`} />
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title={zh ? "今天" : "Today"}>{todayItems.length ? <ul className="space-y-3">{todayItems.map((item) => <li key={item.id}><StatusBadge status={item.targetDate < today ? "danger" : "warning"}>{item.targetDate < today ? "Overdue" : "Today"}</StatusBadge><p className="mt-2 font-medium">{item.title}</p></li>)}</ul> : empty}</Section>
      <Section title={zh ? "即将截止" : "Closing soon"}>{closingSoon.length ? <ul>{closingSoon.map(({ opportunity }) => <li key={opportunity.id} className="py-2"><strong>{opportunity.title}</strong><p className="text-sm text-[var(--text-secondary)]">{opportunity.organisationName} · {opportunity.deadline}</p></li>)}</ul> : empty}</Section>
      <Section title={zh ? "需要行动的申请" : "Applications needing action"}>{applicationsNeedingAction.length ? <ul className="space-y-3">{applicationsNeedingAction.map((item) => <li key={item.id}><StatusBadge>{item.status}</StatusBadge><p className="mt-2 font-medium">{item.jobTitle}</p><p className="text-sm text-[var(--text-secondary)]">{item.nextAction || "Next action date requires review"} {item.nextActionDate && `· ${item.nextActionDate}`}</p></li>)}</ul> : empty}<Link href="/applications" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">{zh ? "打开申请管道" : "Open application pipeline"} →</Link></Section>
      <Section title={zh ? "面试与 OA 准备" : "Interview and OA preparation"}>{sessions.length ? <ul className="space-y-3">{sessions.map(({ application, session }) => <li key={session.id}><StatusBadge>{session.type}</StatusBadge><p className="mt-2 font-medium">{application.organisationName} · {session.stage || "Stage not named"}</p><p className="text-sm text-[var(--text-secondary)]">{session.scheduledAt || "Time not assigned"} · {session.status}</p></li>)}</ul> : empty}</Section>
      <Section title={zh ? "档案与材料缺口" : "Profile and material gaps"}><ul className="space-y-2">{gap.blockers.slice(0, 4).map((item) => <li key={item.id} className="text-sm"><strong>{item.label}</strong><span className="block text-[var(--text-secondary)]">{item.status}</span></li>)}{materialGaps.slice(0, 4).map(({ application, material }) => <li key={`${application.id}-${material.id}`} className="text-sm"><strong>{application.organisationName}: {material.label}</strong><span className="block text-[var(--text-secondary)]">{material.status}</span></li>)}</ul><Link href="/gap-analysis" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">{zh ? "查看目标差距" : "Open target gap analysis"} →</Link></Section>
      <Section title={zh ? "已保存目标" : "Saved targets"}>{saved.length ? <ul>{saved.map((item) => <li key={item.id} className="py-2"><strong>{item.title}</strong><p className="text-sm text-[var(--text-secondary)]">{item.organisationName}</p></li>)}</ul> : empty}</Section>
      <Section title={zh ? "跟进" : "Follow-ups"}>{followUps.length ? <ul>{followUps.map((contact) => <li key={contact.id} className="py-2"><strong>{contact.organisation || contact.name}</strong><p className="text-sm text-[var(--text-secondary)]">{contact.nextFollowUpDate}</p></li>)}</ul> : empty}<Link href="/contacts" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">{zh ? "管理跟进" : "Manage follow-ups"} →</Link></Section>
      <Section title={zh ? "最近核验机会" : "Recently verified opportunities"}>{recent.length ? <ul className="space-y-3">{recent.slice(0, 6).map(({ opportunity, lifecycle }) => <li key={opportunity.id}><div className="flex flex-wrap gap-2"><StatusBadge status={["Open", "Closing soon"].includes(lifecycle) ? "positive" : "neutral"}>{lifecycle}</StatusBadge><StatusBadge>{opportunity.country}</StatusBadge></div><p className="mt-2 font-medium">{opportunity.title}</p><p className="text-sm text-[var(--text-secondary)]">{opportunity.organisationName} · {opportunity.lastVerifiedAt}</p></li>)}</ul> : empty}</Section>
    </div>
    {isTommy && <section className="mt-6">
      <h2 className="font-display text-2xl font-medium">{zh ? "Canberra 诊所研究与联系" : "Canberra clinic research and outreach"}</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{zh ? "以下是已核验雇主目录，不代表当前正在招聘。" : "Verified employer-directory records only. None is presented as a current vacancy."}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{canberraChiropracticEmployers.map((employer) => {
        const tracked = activeWorkspace.contacts.some((contact) => contact.organisation === employer.organisationName);
        return <article key={employer.id} className="surface-card p-5"><div className="flex flex-wrap gap-2"><StatusBadge status="positive">Verified directory</StatusBadge><StatusBadge>Not a vacancy</StatusBadge></div><h3 className="mt-3 font-medium">{employer.organisationName}</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">{employer.suburb} · {employer.serviceFocus}</p><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => addClinic(employer)}>{tracked ? (zh ? "已加入联系跟踪" : "Outreach tracked") : (zh ? "加入联系跟踪" : "Track outreach")}</Button><a href={employer.officialUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center text-sm font-medium text-[var(--accent)]">{zh ? "查看官网" : "Official site"} ↗</a></div></article>;
      })}</div>
    </section>}
  </div>;
}

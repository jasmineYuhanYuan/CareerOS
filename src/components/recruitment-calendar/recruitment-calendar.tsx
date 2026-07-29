"use client";

import { useMemo, useState } from "react";
import { PageHeading } from "@/components/ui/page-heading";
import { Select } from "@/components/ui/form-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { opportunities } from "@/data/opportunities";
import { deriveOpportunityLifecycle } from "@/lib/opportunity-lifecycle";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { OpportunityLifecycle } from "@/types/domain";

export function RecruitmentCalendar() {
  const { activeWorkspace } = useCareerOS();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const [country, setCountry] = useState("All");
  const [lifecycle, setLifecycle] = useState<OpportunityLifecycle | "All">("All");
  const records = useMemo(() => opportunities.map((opportunity) => ({
    opportunity,
    lifecycle: deriveOpportunityLifecycle(opportunity, "2026-07-30"),
  })).filter((item) => country === "All" || item.opportunity.country === country)
    .filter((item) => lifecycle === "All" || item.lifecycle === lifecycle)
    .sort((a, b) => (a.opportunity.deadline ?? "9999").localeCompare(b.opportunity.deadline ?? "9999")), [country, lifecycle]);
  const dated = records.filter((item) => item.opportunity.deadline);
  const undated = records.filter((item) => !item.opportunity.deadline);
  const sessions = activeWorkspace.applications.flatMap((application) => (application.sessions ?? [])
    .filter((session) => Boolean(session.scheduledAt))
    .map((session) => ({ application, session })))
    .sort((a, b) => a.session.scheduledAt.localeCompare(b.session.scheduledAt));

  return <div className="page-enter">
    <PageHeading eyebrow={zh ? "已核验招聘时间" : "Verified recruitment timing"} title={zh ? "招聘日历" : "Recruitment calendar"} description={zh ? "只显示官方来源中的日期。没有发布日期或截止日期的项目保持“日期未知”。" : "Only dates published by a verified source are shown. Records without published timing remain explicitly undated."} />
    <div className="surface-card mb-7 grid gap-4 p-4 sm:grid-cols-2">
      <label className="text-sm font-medium">{zh ? "国家" : "Country"}<Select value={country} onChange={(event) => setCountry(event.target.value)}><option>All</option>{Array.from(new Set(opportunities.map((item) => item.country))).sort().map((value) => <option key={value}>{value}</option>)}</Select></label>
      <label className="text-sm font-medium">{zh ? "生命周期" : "Lifecycle"}<Select value={lifecycle} onChange={(event) => setLifecycle(event.target.value as OpportunityLifecycle | "All")}><option>All</option>{(["Open", "Upcoming", "Closing soon", "Closed", "Expired", "Archived", "Verification required"] as OpportunityLifecycle[]).map((value) => <option key={value}>{value}</option>)}</Select></label>
    </div>
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <section><h2 className="mb-4 font-display text-xl font-medium">{zh ? "已发布日期" : "Published dates"}</h2>{dated.length ? <div className="space-y-3">{dated.map(({ opportunity, lifecycle: status }) => <article key={opportunity.id} className="surface-card grid gap-3 p-5 sm:grid-cols-[8rem_1fr]"><time dateTime={opportunity.deadline} className="font-medium">{opportunity.deadline}</time><div><div className="flex flex-wrap gap-2"><StatusBadge status={status === "Closing soon" ? "warning" : status === "Open" ? "positive" : "neutral"}>{status}</StatusBadge><StatusBadge>{opportunity.country}</StatusBadge></div><h3 className="mt-2 font-medium">{opportunity.title}</h3><p className="text-sm text-[var(--text-secondary)]">{opportunity.organisationName}</p></div></article>)}</div> : <p className="surface-card border-dashed p-8 text-sm text-[var(--text-secondary)]">{zh ? "当前筛选没有已发布日期。" : "No published dates match these filters."}</p>}</section>
      <aside className="space-y-6">
        <section className="surface-card p-5"><h2 className="font-display text-lg font-medium">{zh ? "日期未知" : "Date not published"}</h2><ul className="mt-3 space-y-3">{undated.map(({ opportunity, lifecycle: status }) => <li key={opportunity.id}><StatusBadge>{status}</StatusBadge><p className="mt-1 text-sm font-medium">{opportunity.title}</p><p className="text-xs text-[var(--text-secondary)]">{opportunity.organisationName}</p></li>)}</ul></section>
        <section className="surface-card p-5"><h2 className="font-display text-lg font-medium">{zh ? "个人面试与 OA" : "Personal interview and OA sessions"}</h2>{sessions.length ? <ul className="mt-3 space-y-3">{sessions.map(({ application, session }) => <li key={session.id}><time className="text-xs text-[var(--text-tertiary)]">{session.scheduledAt}</time><p className="font-medium">{session.type}: {application.organisationName}</p><p className="text-sm text-[var(--text-secondary)]">{session.stage || session.status}</p></li>)}</ul> : <p className="mt-3 text-sm text-[var(--text-secondary)]">{zh ? "没有已安排会话。" : "No scheduled sessions."}</p>}</section>
      </aside>
    </div>
  </div>;
}

"use client";

import Link from "next/link";
import { ProfileSelector } from "@/components/profile/profile-selector";
import { Icon } from "@/components/ui/icon";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { opportunities } from "@/data/opportunities";
import { aggregateDeadlines, profileReadiness, recentApplicationActivity } from "@/lib/dashboard";
import { calculateOpportunityMatch } from "@/lib/opportunity-match";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import { formatDate, formatPercentage } from "@/i18n/format";
import type { TranslationKey } from "@/i18n";
import { TOMMY_ID } from "@/data/seed";
import { analyseCareerGap, gapTargets } from "@/lib/gap-analysis/engine";
import { canberraChiropracticEmployers } from "@/data/verified/chiropractic";

function greetingKey(): "dashboard.morning" | "dashboard.afternoon" | "dashboard.evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "dashboard.morning";
  if (hour < 18) return "dashboard.afternoon";
  return "dashboard.evening";
}

export function Dashboard() {
  const { activeWorkspace, upsertRoadmapItem } = useCareerOS();
  const { language, t } = useLanguage();
  const profile = activeWorkspace.profile;
  const isTommy = profile.id === TOMMY_ID;
  const profileTarget = gapTargets.find((target) => target.profileIds.includes(profile.id));
  const targetGap = analyseCareerGap(activeWorkspace, profileTarget?.id ?? gapTargets[0].id);
  const deadlines = aggregateDeadlines(activeWorkspace).slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);
  const relevant = opportunities
    .filter((item) => item.suitableProfileIds.includes(profile.id) && !item.archived)
    .filter((item) => isTommy ? false : ["Australia", "China"].includes(item.country))
    .sort((a, b) => calculateOpportunityMatch(b, profile).score - calculateOpportunityMatch(a, profile).score);
  const recommended = [
    ...relevant.filter((item) => ["Job", "Internship", "Graduate program"].includes(item.category)).slice(0, 3),
    ...relevant.filter((item) => !["Job", "Internship", "Graduate program"].includes(item.category)).slice(0, 2),
  ];
  const focusItems = activeWorkspace.roadmapItems.filter((item) => item.status !== "Completed")
    .sort((a, b) => (a.targetDate || "9999").localeCompare(b.targetDate || "9999")).slice(0, 5);
  const checks = profileReadiness(activeWorkspace);
  const completedChecks = checks.filter((item) => item.complete).length;
  const progress = Math.round(completedChecks / checks.length * 100);
  const activity = recentApplicationActivity(activeWorkspace);
  const metrics = [
    { label: t("dashboard.activeApplications"), hint: t("dashboard.metricApplicationsHint"), value: activeWorkspace.applications.filter((item) => !["Rejected", "Withdrawn"].includes(item.status)).length, href: "/applications" },
    { label: t("dashboard.upcomingDeadlines"), hint: t("dashboard.metricDeadlinesHint"), value: deadlines.length, href: "/roadmap" },
    { label: t("dashboard.interviews"), hint: t("dashboard.metricInterviewsHint"), value: activeWorkspace.applications.reduce((count, item) => count + (item.sessions ?? []).filter((session) => ["Invited", "Planned"].includes(session.status)).length, 0), href: "/applications" },
    { label: t("dashboard.savedOpportunities"), hint: t("dashboard.metricSavedHint"), value: activeWorkspace.savedJobIds.length + activeWorkspace.savedOpportunityIds.length, href: "/opportunities" },
  ];
  const readinessLabels: Record<(typeof checks)[number]["key"], TranslationKey> = {
    education: "dashboard.education", goals: "dashboard.goals", locations: "dashboard.locations",
    skills: "dashboard.skills", projects: "dashboard.projects", eligibility: "dashboard.eligibility",
    links: "dashboard.links", resume: "dashboard.resume",
  };

  return <div className="page-enter">
    <header className="mb-8 grid gap-5 border-b border-[var(--border)] pb-8 sm:grid-cols-[1fr_15rem] sm:items-end">
      <div><p className="eyebrow mb-3">{t("dashboard.eyebrow")}</p><h1 className="font-display text-[2.25rem] font-medium leading-[1.08] tracking-[-0.05em] sm:text-[3.25rem]">{t(greetingKey())}, {profile.preferredName || profile.displayName}</h1><p className="mt-3 text-[var(--text-secondary)]">{t("dashboard.intro")}</p></div>
      <ProfileSelector />
    </header>

    <section className="surface-card overflow-hidden" aria-labelledby="focus-heading">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-5 sm:px-7"><div><p className="eyebrow">{t("dashboard.today")}</p><h2 id="focus-heading" className="mt-1 font-display text-2xl font-medium">{t("dashboard.focus")}</h2></div><Link href="/roadmap" className="text-sm font-medium text-[var(--accent)]">{t("common.viewAll")}</Link></div>
      {focusItems.length === 0 ? <p className="px-5 py-8 text-sm text-[var(--text-secondary)] sm:px-7">{t("dashboard.focusEmpty")}</p> : <ol className="divide-y divide-[var(--border)]">{focusItems.map((item) => {
        const urgency = !item.targetDate ? "upcoming" : item.targetDate < today ? "overdue" : item.targetDate === today ? "today" : "upcoming";
        return <li key={item.id} className="group flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-subtle)] sm:px-7"><button type="button" aria-label={t("dashboard.completeTask", { title: item.title })} onClick={() => upsertRoadmapItem({ ...item, status: "Completed" })} className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--border-strong)] text-transparent hover:border-[var(--success)] hover:text-[var(--success)]"><Icon name="check" className="size-5" /></button><div className="min-w-0 flex-1"><h3 className="font-medium">{item.title}</h3><div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]"><span>{item.category}</span><span aria-hidden="true">·</span><span className={urgency === "overdue" ? "text-[var(--danger)]" : urgency === "today" ? "text-[var(--warning)]" : ""}>{t(urgency === "overdue" ? "dashboard.overdue" : urgency === "today" ? "dashboard.dueToday" : "dashboard.upcoming")}</span></div></div>{item.targetDate && <time dateTime={item.targetDate} className="shrink-0 text-xs text-[var(--text-tertiary)]">{formatDate(item.targetDate, language, { day: "numeric", month: "short" })}</time>}</li>;
      })}</ol>}
    </section>

    <section className="my-10"><SectionHeader title={t("dashboard.overview")} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <Link key={metric.label} href={metric.href} className="interactive-lift surface-card p-5"><strong className="font-display text-2xl font-medium">{metric.value}</strong><span className="mt-2 block text-sm font-medium">{metric.label}</span><span className="mt-1 block text-xs text-[var(--text-secondary)]">{metric.hint}</span></Link>)}</div></section>

    <section className="mb-10"><SectionHeader eyebrow={language === "zh-CN" ? "个人行动工作区" : "Profile-aware workspace"} title={isTommy ? (language === "zh-CN" ? "Tommy 的注册与诊所行动" : "Tommy's registration and clinic actions") : (language === "zh-CN" ? "Yuhan 的澳洲／中国科技行动" : "Yuhan's Australia / China technology actions")} action={<Link href="/action-centre" className="text-sm font-medium text-[var(--accent)]">{language === "zh-CN" ? "打开行动中心" : "Open action centre"}</Link>} /><div className="grid gap-4 sm:grid-cols-3"><div className="surface-card p-5"><strong className="font-display text-3xl text-[var(--accent)]">{targetGap.overallReadinessScore}%</strong><span className="mt-2 block font-medium">{targetGap.targetName}</span><span className="mt-1 block text-xs text-[var(--text-secondary)]">{targetGap.blockers.length} {language === "zh-CN" ? "个阻碍／确认项" : "blockers / confirmations"}</span></div><div className="surface-card p-5"><strong className="font-display text-3xl">{isTommy ? canberraChiropracticEmployers.length : recommended.filter((item) => item.country === "Australia").length}</strong><span className="mt-2 block font-medium">{isTommy ? (language === "zh-CN" ? "已核验诊所目录" : "Verified clinic directory") : (language === "zh-CN" ? "澳洲目标" : "Australian targets")}</span><span className="mt-1 block text-xs text-[var(--text-secondary)]">{isTommy ? (language === "zh-CN" ? "不代表正在招聘" : "Not current-vacancy claims") : (language === "zh-CN" ? "仅官方来源" : "Official sources only")}</span></div><div className="surface-card p-5"><strong className="font-display text-3xl">{isTommy ? activeWorkspace.contacts.length : recommended.filter((item) => item.country === "China").length}</strong><span className="mt-2 block font-medium">{isTommy ? (language === "zh-CN" ? "联系与跟进" : "Outreach contacts") : (language === "zh-CN" ? "中国目标" : "China targets")}</span><span className="mt-1 block text-xs text-[var(--text-secondary)]">{language === "zh-CN" ? "按当前档案隔离" : "Isolated to this profile"}</span></div></div></section>

    {!isTommy && <section className="mb-10"><SectionHeader eyebrow={t("dashboard.curated")} title={t("dashboard.recommended")} action={<Link href="/opportunities" className="text-sm font-medium text-[var(--accent)]">{t("common.viewAll")}</Link>} /><div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-5">{recommended.map((item) => {
      const match = calculateOpportunityMatch(item, profile);
      return <article key={item.id} className="interactive-lift surface-card flex min-w-[82vw] snap-start flex-col p-5 sm:min-w-0"><div className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]"><span>{item.organisationName}</span><span>{item.category}</span></div><h3 className="mt-3 font-display text-lg font-medium leading-snug">{item.title}</h3><p className="mt-2 text-sm text-[var(--text-secondary)]">{item.locationText}</p><div className="mt-4 flex items-center justify-between"><StatusBadge status={match.confidence === "Limited information" ? "neutral" : "positive"}>{formatPercentage(match.score, language)}</StatusBadge>{item.deadline && <time className="text-xs text-[var(--text-tertiary)]">{formatDate(item.deadline, language, { day: "numeric", month: "short" })}</time>}</div><p className="mt-4 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]"><strong>{t("dashboard.topReason")}:</strong> {match.strengths[0] ?? t("dashboard.limitedConfidence")}</p><Link href="/opportunities" className="mt-auto pt-4 text-sm font-medium text-[var(--accent)]">{t("opportunities.details")} →</Link></article>;
    })}</div></section>}

    <div className="grid gap-8 xl:grid-cols-2">
      <section><SectionHeader title={t("dashboard.profileReadiness")} /><div className="surface-card p-6"><div className="flex items-center justify-between gap-4"><strong>{t("dashboard.readinessComplete", { complete: completedChecks, total: checks.length })}</strong><span className="text-sm text-[var(--text-secondary)]">{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]"><div className="progress-reveal h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} /></div><p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{t("dashboard.readinessIntro")}</p><ul className="mt-5 grid gap-2 sm:grid-cols-2">{checks.map((check) => <li key={check.key} className="flex items-center gap-2 text-sm"><span className={`grid size-5 place-items-center rounded-full ${check.complete ? "bg-[var(--success-soft)] text-[var(--success)]" : "border border-[var(--border-strong)] text-transparent"}`}><Icon name="check" className="size-3" /></span><span className={check.complete ? "" : "text-[var(--text-secondary)]"}>{t(readinessLabels[check.key])}</span></li>)}</ul><Link href="/profiles" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">{t("dashboard.editProfile")} →</Link></div></section>
      <section><SectionHeader title={t("dashboard.thisMonth")} /><div className="surface-card px-5">{deadlines.length === 0 ? <p className="py-8 text-sm text-[var(--text-secondary)]">{t("dashboard.timelineEmpty")}</p> : <ol className="divide-y divide-[var(--border)]">{deadlines.map((deadline) => <li key={deadline.id} className="grid grid-cols-[4rem_1fr] gap-4 py-4"><time className="text-sm font-medium">{formatDate(deadline.date, language, { day: "numeric", month: "short" })}</time><div><p className="font-medium">{deadline.title}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{deadline.source}</p></div></li>)}</ol>}</div></section>
      <section className="xl:col-span-2"><SectionHeader title={t("dashboard.recentActivity")} /><div className="surface-card px-5">{activity.length === 0 ? <p className="py-8 text-sm text-[var(--text-secondary)]">{t("dashboard.activityEmpty")}</p> : <ol className="divide-y divide-[var(--border)]">{activity.map((event) => <li key={event.id} className="flex items-center gap-4 py-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--surface-subtle)] text-[var(--text-secondary)]"><Icon name="clock" className="size-4" /></span><div className="min-w-0 flex-1"><p className="font-medium">{event.label}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{event.applicationTitle}</p></div><time className="text-xs text-[var(--text-tertiary)]">{formatDate(event.occurredAt, language, { day: "numeric", month: "short" })}</time></li>)}</ol>}</div></section>
    </div>
  </div>;
}

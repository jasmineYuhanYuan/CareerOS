"use client";

import Link from "next/link";
import { ProfileSelector } from "@/components/profile/profile-selector";
import { Icon } from "@/components/ui/icon";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { opportunities } from "@/data/opportunities";
import {
  aggregateDeadlines,
  profileReadiness,
  recentApplicationActivity,
} from "@/lib/dashboard";
import { calculateOpportunityMatch } from "@/lib/opportunity-match";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import { formatDate, formatPercentage } from "@/i18n/format";
import type { TranslationKey } from "@/i18n";
import { TOMMY_ID } from "@/data/seed";
import { analyseCareerGap, gapTargets } from "@/lib/gap-analysis/engine";
import { canberraChiropracticEmployers } from "@/data/verified/chiropractic";
import {
  chinaPipelineMetrics,
  selectTodayRecommendations,
} from "@/lib/china-recruiting";
import { displayCompanyName, displayUiValue } from "@/i18n/presentation";
import { deriveOpportunityLifecycle } from "@/lib/opportunity-lifecycle";
import { applicationAnalytics, isActiveApplication } from "@/lib/application-pipeline";
import { getEligibleOpportunities } from "@/lib/profile-eligibility";
import { liveVerifiedOpportunities, needsReviewQueue, opportunityChanges } from "@/lib/market-client";

function greetingKey():
  "dashboard.morning" | "dashboard.afternoon" | "dashboard.evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "dashboard.morning";
  if (hour < 18) return "dashboard.afternoon";
  return "dashboard.evening";
}

export function Dashboard() {
  const { state, activeWorkspace, upsertRoadmapItem, marketSnapshot } = useCareerOS();
  const { language, t } = useLanguage();
  const profile = activeWorkspace.profile;
  const isTommy = profile.id === TOMMY_ID;
  const profileTarget = gapTargets.find((target) =>
    target.profileIds.includes(profile.id),
  );
  const targetGap = analyseCareerGap(
    activeWorkspace,
    profileTarget?.id ?? gapTargets[0].id,
  );
  const deadlines = aggregateDeadlines(activeWorkspace).slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);
  const relevant = (marketSnapshot.loaded && marketSnapshot.configured
    ? liveVerifiedOpportunities(marketSnapshot, profile.id)
    : getEligibleOpportunities(profile, opportunities))
    .filter((item) => !item.archived)
    .filter((item) =>
      isTommy ? false : ["Australia", "China"].includes(item.country),
    )
    .sort(
      (a, b) =>
        calculateOpportunityMatch(b, profile, activeWorkspace.documents).score -
        calculateOpportunityMatch(a, profile, activeWorkspace.documents).score,
    );
  const recommended = [
    ...relevant
      .filter((item) =>
        ["Job", "Internship", "Graduate program"].includes(item.category),
      )
      .slice(0, 3),
    ...relevant
      .filter(
        (item) =>
          !["Job", "Internship", "Graduate program"].includes(item.category),
      )
      .slice(0, 2),
  ];
  const focusItems = activeWorkspace.roadmapItems
    .filter((item) => item.status !== "Completed")
    .filter(
      (item) =>
        isTommy ||
        !["Complete CareerOS MVP", "Continue WearAgain iteration"].includes(
          item.title,
        ),
    )
    .sort((a, b) =>
      (a.targetDate || "9999").localeCompare(b.targetDate || "9999"),
    )
    .slice(0, 5);
  const checks = profileReadiness(activeWorkspace);
  const completedChecks = checks.filter((item) => item.complete).length;
  const progress = Math.round((completedChecks / checks.length) * 100);
  const activity = recentApplicationActivity(activeWorkspace);
  const applicationFunnel = applicationAnalytics(activeWorkspace.applications);
  const verifiedToday = marketSnapshot.loaded && marketSnapshot.configured
    ? liveVerifiedOpportunities(marketSnapshot, profile.id)
    : [];
  const topVerified = [...verifiedToday]
    .sort((a, b) => calculateOpportunityMatch(b, profile, activeWorkspace.documents).score - calculateOpportunityMatch(a, profile, activeWorkspace.documents).score)
    .slice(0, 5);
  const closingSoon = verifiedToday
    .filter((item) => item.deadline && item.deadline >= today && item.deadline <= new Date(Date.parse(`${today}T00:00:00Z`) + 14 * 86_400_000).toISOString().slice(0, 10))
    .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
    .slice(0, 5);
  const recentStatusChanges = activeWorkspace.applications
    .filter((application) => !application.id.startsWith("demo-"))
    .flatMap((application) => application.statusHistory.slice(1).map((event, index) => ({
      id: event.id,
      organisation: application.organisationName,
      role: application.jobTitle,
      from: application.statusHistory[index].status,
      to: event.status,
      timestamp: event.timestamp,
    })))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);
  const marketChanges = opportunityChanges(marketSnapshot);
  const reviewQueue = needsReviewQueue(marketSnapshot);
  const applicationActions = activeWorkspace.applications
    .filter((application) => !application.id.startsWith("demo-") && isActiveApplication(application.status) && application.nextAction)
    .map((application) => ({ id: application.id, label: language === "zh-CN" && application.status === "Assessment In Progress" ? `检查 ${application.organisationName} 是否收到笔试链接` : application.nextAction, href: `/applications#${encodeURIComponent(application.id)}` }));
  const todayActionItems = [
    ...applicationActions,
    ...(topVerified.length ? [{ id: "apply-verified", label: language === "zh-CN" ? `今天优先投递 ${Math.min(3, topVerified.length)} 个已核验岗位` : `Prioritise ${Math.min(3, topVerified.length)} verified applications today`, href: "/opportunities" }] : []),
    ...(closingSoon.length ? [{ id: "closing-verified", label: language === "zh-CN" ? `${closingSoon.length} 个已核验岗位即将截止` : `${closingSoon.length} verified opportunities closing soon`, href: "/recruitment-calendar" }] : []),
    ...activeWorkspace.contacts.filter((contact) => contact.nextFollowUpDate && contact.nextFollowUpDate <= today).slice(0, 1).map((contact) => ({ id: `follow-${contact.id}`, label: language === "zh-CN" ? `跟进 ${contact.name}` : `Follow up with ${contact.name}`, href: "/action-centre" })),
  ].slice(0, 6);
  const chinaMetrics = chinaPipelineMetrics(
    activeWorkspace.chinaCampusOpportunities,
    today,
  );
  const chinaToday = selectTodayRecommendations(
    activeWorkspace.chinaCampusOpportunities,
    today,
    3,
  );
  const australiaToday = relevant
    .filter((item) => item.country === "Australia")
    .filter((item) =>
      ["Open", "Closing soon"].includes(
        deriveOpportunityLifecycle(item, today),
      ),
    )
    .slice(0, 3);
  const metrics = [
    {
      label: t("dashboard.activeApplications"),
      hint: t("dashboard.metricApplicationsHint"),
      value: activeWorkspace.applications.filter(
        (item) => isActiveApplication(item.status),
      ).length,
      href: "/applications",
    },
    {
      label: t("dashboard.upcomingDeadlines"),
      hint: t("dashboard.metricDeadlinesHint"),
      value: deadlines.length,
      href: "/roadmap",
    },
    {
      label: t("dashboard.interviews"),
      hint: t("dashboard.metricInterviewsHint"),
      value: activeWorkspace.applications.reduce(
        (count, item) =>
          count +
          (item.sessions ?? []).filter((session) =>
            ["Invited", "Planned"].includes(session.status),
          ).length,
        0,
      ),
      href: "/applications",
    },
    {
      label: t("dashboard.savedOpportunities"),
      hint: t("dashboard.metricSavedHint"),
      value:
        activeWorkspace.savedJobIds.length +
        activeWorkspace.savedOpportunityIds.length,
      href: "/opportunities",
    },
  ];
  const readinessLabels: Record<
    (typeof checks)[number]["key"],
    TranslationKey
  > = {
    education: "dashboard.education",
    goals: "dashboard.goals",
    locations: "dashboard.locations",
    skills: "dashboard.skills",
    projects: "dashboard.projects",
    eligibility: "dashboard.eligibility",
    links: "dashboard.links",
    resume: "dashboard.resume",
  };

  return (
    <div className="page-enter">
      <header className="mb-8 grid gap-5 border-b border-[var(--border)] pb-8 sm:grid-cols-[1fr_15rem] sm:items-end">
        <div>
          <p className="eyebrow mb-3">{t("dashboard.eyebrow")}</p>
          <h1 className="font-display text-[2.25rem] font-medium leading-[1.08] tracking-[-0.05em] sm:text-[3.25rem]">
            {t(greetingKey())}, {profile.preferredName || profile.displayName}
          </h1>
          <p className="mt-3 text-[var(--text-secondary)]">
            {t("dashboard.intro")}
          </p>
        </div>
        <ProfileSelector />
      </header>

      <section className="mb-10" aria-label={t("dashboard.todayCareerActions")}>
        <SectionHeader title={t("dashboard.todayCareerActions")} />
        {todayActionItems.length ? <ol className="surface-card divide-y divide-[var(--border)]">{todayActionItems.map((action, index) => <li key={action.id}><Link href={action.href} className="group flex min-h-16 items-center gap-4 px-5 py-4 hover:bg-[var(--surface-subtle)]"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">{index + 1}</span><span className="flex-1 font-medium">{action.label}</span><span aria-hidden="true" className="text-[var(--accent)]">→</span></Link></li>)}</ol> : <p className="surface-card p-5 text-sm text-[var(--text-secondary)]">{language === "zh-CN" ? "今天没有需要立即处理的求职任务。" : "No immediate career actions are due today."}</p>}
      </section>


      <section className="mb-10">
        <SectionHeader title={language === "zh-CN" ? "最近申请变化" : "Recent Application Changes"} />
        {recentStatusChanges.length ? <div className="surface-card divide-y divide-[var(--border)]">{recentStatusChanges.map((change) => <Link key={change.id} href="/applications" className="block px-5 py-4 hover:bg-[var(--surface-subtle)]"><div className="flex flex-wrap items-baseline justify-between gap-2"><div><p className="text-sm text-[var(--text-secondary)]">{change.organisation}</p><p className="font-medium">{change.role}</p></div><time className="text-xs text-[var(--text-tertiary)]">{formatDate(change.timestamp, language)}</time></div><p className="mt-2 text-sm"><span className="text-[var(--text-secondary)]">{displayUiValue(change.from, language)}</span> <span aria-hidden="true">→</span> <span className="font-medium text-[var(--accent)]">{displayUiValue(change.to, language)}</span></p></Link>)}</div> : <p className="surface-card p-5 text-sm text-[var(--text-secondary)]">{language === "zh-CN" ? "暂无申请状态变化。" : "No application status changes yet."}</p>}
      </section>

      <section className="mb-10">
        <SectionHeader title={language === "zh-CN" ? "今日推荐岗位" : "Top Recommended Opportunities"} action={<Link href="/opportunities" className="text-sm font-medium text-[var(--accent)]">{t("common.viewAll")}</Link>} />
        {topVerified.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{topVerified.map((item) => { const match = calculateOpportunityMatch(item, profile, activeWorkspace.documents); return <article key={item.id} className="surface-card flex flex-col p-4"><p className="text-xs text-[var(--text-secondary)]">{item.organisationName}</p><h3 className="mt-2 font-medium">{item.title}</h3><p className="mt-1 text-xs text-[var(--text-secondary)]">{item.locationText}</p><strong className="mt-3 text-[var(--accent)]">{match.score}%</strong><p className="mt-2 text-xs text-[var(--text-tertiary)]">{language === "zh-CN" ? "截止：" : "Deadline: "}{item.deadline ? formatDate(item.deadline, language) : displayUiValue("Not published", language)}</p><p className="mt-1 text-xs text-[var(--text-tertiary)]">{item.sourceName} · {t("dashboard.lastVerified", { date: formatDate(item.lastVerifiedAt ?? "", language) })}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-auto pt-4 text-sm font-semibold text-[var(--accent)]">{language === "zh-CN" ? "投递" : "Apply"} ↗</a></article>; })}</div> : <p className="surface-card p-5 text-sm text-[var(--text-secondary)]">{language === "zh-CN" ? "今天没有适合当前档案且已核验为开放的岗位。" : "No verified active opportunities match this profile today."}</p>}
      </section>

      <section className="mb-10">
        <SectionHeader title={language === "zh-CN" ? "即将截止" : "Closing Soon"} />
        {closingSoon.length ? <div className="surface-card divide-y divide-[var(--border)]">{closingSoon.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--surface-subtle)]"><span><span className="block font-medium">{item.organisationName} — {item.title}</span><span className="mt-1 block text-xs text-[var(--text-secondary)]">{item.locationText}</span></span><time className="shrink-0 text-sm text-[var(--warning)]">{formatDate(item.deadline ?? "", language)}</time></a>)}</div> : <p className="surface-card p-5 text-sm text-[var(--text-secondary)]">{language === "zh-CN" ? "目前没有即将截止的已核验岗位。" : "No verified opportunities are closing soon."}</p>}
      </section>

      <section className="mb-10">
        <SectionHeader title={language === "zh-CN" ? "过去 7 天岗位变化" : "Opportunity Changes · 7 days"} />
        {marketChanges.length ? <div className="surface-card divide-y divide-[var(--border)]">{marketChanges.slice(0, 7).map((change) => <div key={change.id} className="px-5 py-4"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={change.event_type.includes("closed") || change.event_type.includes("failed") ? "danger" : change.event_type.includes("deadline") ? "warning" : "positive"}>{displayUiValue(change.event_type, language)}</StatusBadge><span className="font-medium">{change.organisation && change.role_title ? `${change.organisation} — ${change.role_title}` : change.source_name}</span></div><p className="mt-2 text-xs text-[var(--text-secondary)]">{change.evidence_text}</p></div>)}</div> : <p className="surface-card p-5 text-sm text-[var(--text-secondary)]">{language === "zh-CN" ? "过去 7 天没有已记录的岗位变化。" : "No opportunity changes were recorded in the past 7 days."}</p>}
      </section>

      <section className="surface-card mb-8 p-5 sm:p-6" aria-label={language === "zh-CN" ? "市场数据更新状态" : "Market data update status"}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{language === "zh-CN" ? "自动市场更新" : "Automatic market update"}</p>
            <h2 className="mt-1 font-display text-xl font-medium">{marketSnapshot.latestRun
              ? (language === "zh-CN" ? `最近运行：${marketSnapshot.latestRun.status}` : `Latest run: ${marketSnapshot.latestRun.status}`)
              : (language === "zh-CN" ? "等待首次自动审计" : "Awaiting first automatic audit")}</h2>
            {marketSnapshot.latestRun && <p className="mt-2 text-xs text-[var(--text-secondary)]">{formatDate(marketSnapshot.latestRun.started_at, language)} · {marketSnapshot.latestRun.sources_checked} sources · {marketSnapshot.latestRun.sources_failed} failed</p>}
          </div>
          <StatusBadge status={marketSnapshot.latestRun?.status === "completed" ? "positive" : "warning"}>{marketSnapshot.latestRun?.status ?? "pending"}</StatusBadge>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[[language === "zh-CN" ? "新增" : "Discovered", marketSnapshot.latestRun?.discovered_count ?? 0], [language === "zh-CN" ? "开放" : "Opened", marketSnapshot.latestRun?.opened_count ?? 0], [language === "zh-CN" ? "关闭" : "Closed", marketSnapshot.latestRun?.closed_count ?? 0], [language === "zh-CN" ? "降级" : "Downgraded", marketSnapshot.latestRun?.downgraded_count ?? 0], [language === "zh-CN" ? "待核验" : "Needs verification", marketSnapshot.latestRun?.verification_required_count ?? 0]].map(([label, value]) => <div key={label} className="rounded-xl border border-[var(--border)] p-3"><strong className="font-display text-2xl">{value}</strong><span className="block text-xs text-[var(--text-secondary)]">{label}</span></div>)}
        </div>
        {marketSnapshot.recentEvents.length > 0 && <div className="mt-5 border-t border-[var(--border)] pt-4"><p className="text-sm font-medium">{language === "zh-CN" ? "最近变更" : "Recent changes"}</p><ul className="mt-2 space-y-2 text-xs text-[var(--text-secondary)]">{marketSnapshot.recentEvents.slice(0, 4).map((event) => <li key={event.id}>{event.event_type} · {event.observed_status ?? "—"} · {event.evidence_text}</li>)}</ul></div>}
      </section>

      {state.dashboardPreferences.demoMode && (
        <section className="mb-8 rounded-[1.35rem] border border-[var(--warning)]/40 bg-[var(--surface)] p-5" aria-label={language === "zh-CN" ? "内部人工核验队列" : "Internal review queue"}>
          <SectionHeader eyebrow={language === "zh-CN" ? "仅内部视图" : "Internal view only"} title={language === "zh-CN" ? `需要人工确认（${reviewQueue.length}）` : `Needs Review (${reviewQueue.length})`} />
          {reviewQueue.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs text-[var(--text-secondary)]"><tr><th className="py-2 pr-3">{language === "zh-CN" ? "来源" : "Source"}</th><th className="py-2 pr-3">{language === "zh-CN" ? "岗位" : "Role"}</th><th className="py-2 pr-3">{language === "zh-CN" ? "问题" : "Issue"}</th><th className="py-2 pr-3">HTTP</th><th className="py-2">{language === "zh-CN" ? "最近尝试" : "Last attempt"}</th></tr></thead><tbody>{reviewQueue.slice(0, 20).map((item) => <tr key={item.id} className="border-t border-[var(--border)] align-top"><td className="py-3 pr-3">{item.source}</td><td className="py-3 pr-3 font-medium">{item.role}</td><td className="py-3 pr-3"><span className="block">{displayUiValue(item.issue, language)}</span><span className="mt-1 block text-xs text-[var(--text-secondary)]">{item.reason}</span></td><td className="py-3 pr-3">{item.httpStatus ?? "—"}</td><td className="py-3">{item.lastAttempt ? formatDate(item.lastAttempt, language) : "—"}</td></tr>)}</tbody></table></div> : <p className="text-sm text-[var(--text-secondary)]">{language === "zh-CN" ? "当前没有需要人工确认的岗位。" : "No opportunities currently need manual review."}</p>}
        </section>
      )}

      <section className="mb-8" aria-label={t("dashboard.applicationFunnel")}>
        <SectionHeader
          title={t("dashboard.applicationFunnel")}
          action={
            <Link
              href="/applications"
              className="text-sm font-medium text-[var(--accent)]"
            >
              {t("dashboard.manageApplications")}
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            [t("dashboard.submitted"), applicationFunnel.submitted],
            [
              t("dashboard.oa"),
              activeWorkspace.applications.filter(
                (item) =>
                  ["Assessment In Progress", "Assessment Invitation Received", "Assessment Scheduled", "Assessment Completed"].includes(item.status) &&
                  !item.id.startsWith("demo-"),
              ).length,
            ],
            [t("dashboard.interviews"), applicationFunnel.interviews],
            [language === "zh-CN" ? "Offer" : "Offers", applicationFunnel.offers],
            [t("dashboard.rejected"), applicationFunnel.rejections],
            [t("dashboard.waiting"), applicationFunnel.awaitingResponse],
          ].map(([label, value]) => (
            <Link
              key={label}
              href="/applications"
              className="interactive-lift surface-card p-4"
            >
              <strong className="font-display text-3xl">{value}</strong>
              <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="surface-card overflow-hidden"
        aria-labelledby="focus-heading"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-5 sm:px-7">
          <div>
            <p className="eyebrow">{t("dashboard.today")}</p>
            <h2
              id="focus-heading"
              className="mt-1 font-display text-2xl font-medium"
            >
              {t("dashboard.focus")}
            </h2>
          </div>
          <Link
            href="/roadmap"
            className="text-sm font-medium text-[var(--accent)]"
          >
            {t("common.viewAll")}
          </Link>
        </div>
        {focusItems.length === 0 ? (
          <p className="px-5 py-8 text-sm text-[var(--text-secondary)] sm:px-7">
            {t("dashboard.focusEmpty")}
          </p>
        ) : (
          <ol className="divide-y divide-[var(--border)]">
            {focusItems.map((item) => {
              const urgency = !item.targetDate
                ? "upcoming"
                : item.targetDate < today
                  ? "overdue"
                  : item.targetDate === today
                    ? "today"
                    : "upcoming";
              return (
                <li
                  key={item.id}
                  className="group flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-subtle)] sm:px-7"
                >
                  <button
                    type="button"
                    aria-label={t("dashboard.completeTask", {
                      title: item.title,
                    })}
                    onClick={() =>
                      upsertRoadmapItem({ ...item, status: "Completed" })
                    }
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--border-strong)] text-transparent hover:border-[var(--success)] hover:text-[var(--success)]"
                  >
                    <Icon name="check" className="size-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span>{displayUiValue(item.category, language)}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          urgency === "overdue"
                            ? "text-[var(--danger)]"
                            : urgency === "today"
                              ? "text-[var(--warning)]"
                              : ""
                        }
                      >
                        {t(
                          urgency === "overdue"
                            ? "dashboard.overdue"
                            : urgency === "today"
                              ? "dashboard.dueToday"
                              : "dashboard.upcoming",
                        )}
                      </span>
                    </div>
                  </div>
                  {item.targetDate && (
                    <time
                      dateTime={item.targetDate}
                      className="shrink-0 text-xs text-[var(--text-tertiary)]"
                    >
                      {formatDate(item.targetDate, language, {
                        day: "numeric",
                        month: "short",
                      })}
                    </time>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {!isTommy && (
        <section className="my-10">
          <SectionHeader
            eyebrow={
              language === "zh-CN" ? "今天值得关注" : "Worth attention today"
            }
            title={
              language === "zh-CN"
                ? "我今天应该投什么？"
                : "What should I apply to today?"
            }
            action={
              <Link
                href="/action-centre"
                className="text-sm font-medium text-[var(--accent)]"
              >
                {language === "zh-CN" ? "打开行动中心" : "Open action centre"}
              </Link>
            }
          />
          {australiaToday.length === 0 && (
            <div className="surface-card mb-4 p-5">
              <p className="font-medium">
                {language === "zh-CN"
                  ? "今天暂未发现新的澳洲已核验岗位。"
                  : "No new verified Australian role was found today."}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-[var(--accent)]">
                <Link href="/recruitment-calendar">
                  {language === "zh-CN"
                    ? "查看即将开放项目"
                    : "View upcoming programs"}
                </Link>
                <Link href="/china-recruiting">
                  {language === "zh-CN"
                    ? "查看中国秋招"
                    : "View China recruiting"}
                </Link>
                <Link href="/profiles">
                  {language === "zh-CN" ? "完善资料" : "Complete profile"}
                </Link>
              </div>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            {australiaToday.map((item, index) => (
              <article key={item.id} className="surface-card p-5">
                <span className="text-xs text-[var(--text-tertiary)]">
                  AU 0{index + 1}
                </span>
                <h3 className="mt-2 font-display text-lg font-medium">
                  {item.organisationName} · {item.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {item.city} ·{" "}
                  {displayUiValue(
                    item.employmentType ?? item.category,
                    language,
                  )}{" "}
                  · {language === "zh-CN" ? "官方仍开放" : "Official role open"}
                </p>
                <p className="mt-3 text-xs text-[var(--text-secondary)]">
                  {language === "zh-CN"
                    ? "推荐原因：与软件工程方向匹配；工作资格与签证支持仍待确认。"
                    : "Why: relevant to software engineering; work rights and sponsorship remain unconfirmed."}
                </p>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]"
                >
                  {language === "zh-CN"
                    ? "官方网站投递"
                    : "Apply on official site"}{" "}
                  ↗
                </a>
              </article>
            ))}
            {chinaToday
              .slice(0, Math.max(0, 3 - australiaToday.length))
              .map((item, index) => (
                <article key={item.id} className="surface-card p-5">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    CN 0{index + 1}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-medium">
                    {displayCompanyName(item.company, language)} ·{" "}
                    {item.position}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {language === "zh-CN"
                      ? "官方仍开放 · 暂无公开截止日期，建议尽早投递"
                      : "Official role open · no public deadline; apply early"}
                  </p>
                  <Link
                    href={`/china-recruiting/${item.id}`}
                    className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]"
                  >
                    {language === "zh-CN" ? "查看岗位" : "View role"} →
                  </Link>
                </article>
              ))}
          </div>
        </section>
      )}

      <section className="my-10">
        <SectionHeader title={t("dashboard.overview")} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Link
              key={metric.label}
              href={metric.href}
              className="interactive-lift surface-card p-5"
            >
              <strong className="font-display text-2xl font-medium">
                {metric.value}
              </strong>
              <span className="mt-2 block text-sm font-medium">
                {metric.label}
              </span>
              <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                {metric.hint}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {!isTommy && (
        <section className="mb-10">
          <SectionHeader
            eyebrow="CN · 2027 秋招"
            title={
              language === "zh-CN"
                ? "中国秋招进度"
                : "China recruiting progress"
            }
            action={
              <Link
                href="/china-recruiting"
                className="text-sm font-medium text-[var(--accent)]"
              >
                {language === "zh-CN"
                  ? "打开中国秋招"
                  : "Open China Recruiting"}{" "}
                →
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {[
              [
                language === "zh-CN" ? "中国待投递" : "China To Apply",
                chinaMetrics.toApply,
              ],
              [
                language === "zh-CN" ? "中国已投递" : "China Applied",
                chinaMetrics.applied,
              ],
              [language === "zh-CN" ? "中国笔试" : "China OA", chinaMetrics.oa],
              [
                language === "zh-CN" ? "中国面试" : "China Interviews",
                chinaMetrics.interview,
              ],
              [
                language === "zh-CN" ? "中国录用" : "China Offers",
                chinaMetrics.offer,
              ],
              [
                language === "zh-CN" ? "7天内截止" : "Closing in 7 Days",
                chinaMetrics.closingIn7Days,
              ],
            ].map(([label, value]) => (
              <Link
                key={label}
                href="/china-recruiting"
                className="interactive-lift surface-card p-4"
              >
                <strong className="font-display text-2xl">{value}</strong>
                <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                  {label}
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">
            {language === "zh-CN"
              ? "仅统计当前档案内未归档、未过期的中国岗位；不影响澳洲指标。"
              : "Counts only non-archived, non-expired China records in this profile and does not change Australia metrics."}
          </p>
        </section>
      )}

      <section className="mb-10">
        <SectionHeader
          eyebrow={
            language === "zh-CN" ? "个人行动工作区" : "Profile-aware workspace"
          }
          title={
            isTommy
              ? language === "zh-CN"
                ? "Tommy 的注册与诊所行动"
                : "Tommy's registration and clinic actions"
              : language === "zh-CN"
                ? "Yuhan 的澳洲／中国科技行动"
                : "Yuhan's Australia / China technology actions"
          }
          action={
            <Link
              href="/action-centre"
              className="text-sm font-medium text-[var(--accent)]"
            >
              {language === "zh-CN" ? "打开行动中心" : "Open action centre"}
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="surface-card p-5">
            <strong className="font-display text-3xl text-[var(--accent)]">
              {targetGap.overallReadinessScore}%
            </strong>
            <span className="mt-2 block font-medium">
              {targetGap.targetName}
            </span>
            <span className="mt-1 block text-xs text-[var(--text-secondary)]">
              {targetGap.blockers.length}{" "}
              {language === "zh-CN"
                ? "个阻碍／确认项"
                : "blockers / confirmations"}
            </span>
          </div>
          <div className="surface-card p-5">
            <strong className="font-display text-3xl">
              {isTommy
                ? canberraChiropracticEmployers.length
                : recommended.filter((item) => item.country === "Australia")
                    .length}
            </strong>
            <span className="mt-2 block font-medium">
              {isTommy
                ? language === "zh-CN"
                  ? "已核验诊所目录"
                  : "Verified clinic directory"
                : language === "zh-CN"
                  ? "澳洲目标"
                  : "Australian targets"}
            </span>
            <span className="mt-1 block text-xs text-[var(--text-secondary)]">
              {isTommy
                ? language === "zh-CN"
                  ? "不代表正在招聘"
                  : "Not current-vacancy claims"
                : language === "zh-CN"
                  ? "仅官方来源"
                  : "Official sources only"}
            </span>
          </div>
          <div className="surface-card p-5">
            <strong className="font-display text-3xl">
              {isTommy
                ? activeWorkspace.contacts.length
                : recommended.filter((item) => item.country === "China").length}
            </strong>
            <span className="mt-2 block font-medium">
              {isTommy
                ? language === "zh-CN"
                  ? "联系与跟进"
                  : "Outreach contacts"
                : language === "zh-CN"
                  ? "中国目标"
                  : "China targets"}
            </span>
            <span className="mt-1 block text-xs text-[var(--text-secondary)]">
              {language === "zh-CN"
                ? "按当前档案隔离"
                : "Isolated to this profile"}
            </span>
          </div>
        </div>
      </section>

      {!isTommy && (
        <section className="mb-10">
          <SectionHeader
            eyebrow={t("dashboard.curated")}
            title={t("dashboard.recommended")}
            action={
              <Link
                href="/opportunities"
                className="text-sm font-medium text-[var(--accent)]"
              >
                {t("common.viewAll")}
              </Link>
            }
          />
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-5">
            {recommended.map((item) => {
              const match = calculateOpportunityMatch(item, profile);
              return (
                <article
                  key={item.id}
                  className="interactive-lift surface-card flex min-w-[82vw] snap-start flex-col p-5 sm:min-w-0"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                    <span>{item.organisationName}</span>
                    <span>{item.category}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-medium leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {item.locationText}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <StatusBadge
                      status={
                        match.confidence === "Limited information"
                          ? "neutral"
                          : "positive"
                      }
                    >
                      {formatPercentage(match.score, language)}
                    </StatusBadge>
                    {item.deadline && (
                      <time className="text-xs text-[var(--text-tertiary)]">
                        {formatDate(item.deadline, language, {
                          day: "numeric",
                          month: "short",
                        })}
                      </time>
                    )}
                  </div>
                  <p className="mt-4 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
                    <strong>{t("dashboard.topReason")}:</strong>{" "}
                    {match.strengths[0] ?? t("dashboard.limitedConfidence")}
                  </p>
                  <Link
                    href="/opportunities"
                    className="mt-auto pt-4 text-sm font-medium text-[var(--accent)]"
                  >
                    {t("opportunities.details")} →
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid gap-8 xl:grid-cols-2">
        <section>
          <SectionHeader title={t("dashboard.profileReadiness")} />
          <div className="surface-card p-6">
            <div className="flex items-center justify-between gap-4">
              <strong>
                {t("dashboard.readinessComplete", {
                  complete: completedChecks,
                  total: checks.length,
                })}
              </strong>
              <span className="text-sm text-[var(--text-secondary)]">
                {progress}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
              <div
                className="progress-reveal h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              {t("dashboard.readinessIntro")}
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {checks.map((check) => (
                <li key={check.key} className="flex items-center gap-2 text-sm">
                  <span
                    className={`grid size-5 place-items-center rounded-full ${check.complete ? "bg-[var(--success-soft)] text-[var(--success)]" : "border border-[var(--border-strong)] text-transparent"}`}
                  >
                    <Icon name="check" className="size-3" />
                  </span>
                  <span
                    className={
                      check.complete ? "" : "text-[var(--text-secondary)]"
                    }
                  >
                    {t(readinessLabels[check.key])}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/profiles"
              className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]"
            >
              {t("dashboard.editProfile")} →
            </Link>
          </div>
        </section>
        <section>
          <SectionHeader title={t("dashboard.thisMonth")} />
          <div className="surface-card px-5">
            {deadlines.length === 0 ? (
              <p className="py-8 text-sm text-[var(--text-secondary)]">
                {t("dashboard.timelineEmpty")}
              </p>
            ) : (
              <ol className="divide-y divide-[var(--border)]">
                {deadlines.map((deadline) => (
                  <li
                    key={deadline.id}
                    className="grid grid-cols-[4rem_1fr] gap-4 py-4"
                  >
                    <time className="text-sm font-medium">
                      {formatDate(deadline.date, language, {
                        day: "numeric",
                        month: "short",
                      })}
                    </time>
                    <div>
                      <p className="font-medium">{deadline.title}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {deadline.source}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
        <section className="xl:col-span-2">
          <SectionHeader title={t("dashboard.recentActivity")} />
          <div className="surface-card px-5">
            {activity.length === 0 ? (
              <p className="py-8 text-sm text-[var(--text-secondary)]">
                {t("dashboard.activityEmpty")}
              </p>
            ) : (
              <ol className="divide-y divide-[var(--border)]">
                {activity.map((event) => (
                  <li key={event.id} className="flex items-center gap-4 py-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--surface-subtle)] text-[var(--text-secondary)]">
                      <Icon name="clock" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{event.label}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {event.applicationTitle}
                      </p>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)]">
                      {formatDate(event.occurredAt, language, {
                        day: "numeric",
                        month: "short",
                      })}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

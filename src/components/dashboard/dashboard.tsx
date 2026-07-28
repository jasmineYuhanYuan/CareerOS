"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MetricItem } from "@/components/ui/metric-item";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProfileSelector } from "@/components/profile/profile-selector";
import { jobs } from "@/data/seed";
import { aggregateDeadlines } from "@/lib/dashboard";
import { calculateJobMatch, isJobSuitableForProfile } from "@/lib/match";
import { useCareerOS } from "@/providers/careeros-provider";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const { activeWorkspace, upsertRoadmapItem } = useCareerOS();
  const profile = activeWorkspace.profile;
  const deadlines = aggregateDeadlines(activeWorkspace).slice(0, 6);
  const recommended = jobs
    .filter((job) => isJobSuitableForProfile(job, profile))
    .sort((a, b) => calculateJobMatch(b, profile).score - calculateJobMatch(a, profile).score)
    .slice(0, 4);
  const activeApplications = activeWorkspace.applications.filter(
    (item) => !["Rejected", "Withdrawn"].includes(item.status),
  );
  const focusItems = activeWorkspace.roadmapItems
    .filter((item) => item.status !== "Completed")
    .slice(0, 5);
  const metrics = [
    ["Active applications", activeApplications.length],
    ["Upcoming deadlines", deadlines.length],
    ["Interviews", activeWorkspace.applications.filter((item) => item.status === "Interview").length],
    ["Saved opportunities", activeWorkspace.savedJobIds.length],
  ] as const;
  const profileChecks = [
    profile.preferredName,
    profile.workEligibility,
    profile.expectedGraduationDate,
    profile.skills.length > 0 ? "skills" : "",
    profile.careerGoals.length > 0 ? "goals" : "",
  ];
  const completedSetup = profileChecks.filter(Boolean).length;
  const completedRoadmap = activeWorkspace.roadmapItems.filter((item) => item.status === "Completed").length;
  const progress = Math.round(
    ((completedSetup + completedRoadmap) /
      Math.max(1, profileChecks.length + activeWorkspace.roadmapItems.length)) *
      100,
  );

  return (
    <div className="page-enter">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Your week in focus</p>
          <h1 className="font-display text-[2.1rem] font-medium leading-[1.1] tracking-[-0.055em] sm:text-[3.1rem]">
            {greeting()}, {profile.preferredName || profile.displayName}
          </h1>
          <p className="mt-3 text-base text-[var(--text-secondary)]">
            Here is what matters for your career this week.
          </p>
        </div>
        <div className="w-full sm:w-[13rem]"><ProfileSelector /></div>
      </header>

      <section className="surface-card overflow-hidden" aria-labelledby="focus-heading">
        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7">
          <p className="eyebrow mb-1.5">Today</p>
          <h2 id="focus-heading" className="font-display text-[1.45rem] font-medium tracking-[-0.035em]">Today&apos;s focus</h2>
        </div>
        {focusItems.length === 0 ? (
          <p className="px-5 py-8 text-sm text-[var(--text-secondary)] sm:px-7">Your current roadmap actions are complete. Add another item when ready.</p>
        ) : (
          <ol className="divide-y divide-[var(--border)]">
            {focusItems.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4 sm:px-7">
                <button
                  type="button"
                  aria-label={`Complete ${item.title}`}
                  onClick={() => upsertRoadmapItem({ ...item, status: "Completed" })}
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--border-strong)] text-transparent transition-colors hover:border-[var(--success)] hover:text-[var(--success)]"
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 text-[0.8rem] text-[var(--text-secondary)]">{item.category}</p>
                </div>
                {item.targetDate && (
                  <time dateTime={item.targetDate} className="shrink-0 text-[0.8rem] text-[var(--text-tertiary)]">
                    {new Date(`${item.targetDate}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </time>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="my-10" aria-labelledby="overview-heading">
        <SectionHeader title="Weekly overview" />
        <div className="grid grid-cols-2 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] py-4 sm:grid-cols-4">
          {metrics.map(([label, value]) => <MetricItem key={label} label={label} value={value} />)}
        </div>
      </section>

      <section className="mb-10" aria-labelledby="recommended-heading">
        <SectionHeader
          eyebrow="Curated for your profile"
          title="Recommended for you"
          action={<Link href="/jobs" className="text-sm font-medium text-[var(--accent)]">See all</Link>}
        />
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
          {recommended.map((job) => {
            const match = calculateJobMatch(job, profile);
            return (
              <article key={job.id} className="interactive-lift surface-card flex min-w-[78vw] snap-start flex-col p-5 sm:min-w-0">
                <p className="text-[0.78rem] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{job.companyName}</p>
                <h3 className="mt-3 font-display text-lg font-medium leading-snug tracking-[-0.025em]">{job.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{job.location} · {job.employmentType}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <StatusBadge status="positive">{match.score}% match</StatusBadge>
                  <time dateTime={job.deadline} className="text-[0.75rem] text-[var(--text-tertiary)]">
                    {new Date(`${job.deadline}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </time>
                </div>
                <Link href="/jobs" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">View opportunity →</Link>
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <section aria-labelledby="progress-heading">
          <SectionHeader title="Planning progress" />
          <div className="surface-card p-6">
            <div className="flex items-end justify-between gap-4">
              <strong className="font-display text-3xl font-medium tracking-[-0.04em]">{progress}%</strong>
              <span className="text-sm text-[var(--text-secondary)]">setup + roadmap</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
              <div className="h-full rounded-full bg-[var(--text-primary)]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              Reflects completed profile setup and roadmap items. It does not predict career success.
            </p>
            <Button className="mt-5" size="sm" variant="secondary" onClick={() => window.location.assign("/roadmap")}>Open roadmap</Button>
          </div>
        </section>

        <section aria-labelledby="dates-heading">
          <SectionHeader title="Upcoming dates" />
          <div className="surface-card px-5 sm:px-6">
            {deadlines.length === 0 ? (
              <p className="py-8 text-sm text-[var(--text-secondary)]">Save opportunities or add dated actions to build your timeline.</p>
            ) : (
              <ol className="divide-y divide-[var(--border)]">
                {deadlines.map((deadline) => (
                  <li key={deadline.id} className="grid grid-cols-[3.6rem_1fr] gap-4 py-4">
                    <time dateTime={deadline.date} className="text-sm font-medium text-[var(--text-primary)]">
                      {new Date(`${deadline.date}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </time>
                    <div className="min-w-0">
                      <p className="font-medium">{deadline.title}</p>
                      <p className="mt-1 text-[0.78rem] text-[var(--text-secondary)]">{deadline.source}</p>
                    </div>
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

"use client";

import Link from "next/link";
import { useActiveProfile } from "@/components/profile/active-profile-provider";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { dashboardData } from "@/data/dashboard";

const statusColors: Readonly<Record<string, string>> = {
  Saved: "bg-[#eef0e8] text-[#59645e]",
  Preparing: "bg-[#f4e8bd] text-[#6f5d1f]",
  Applied: "bg-[#dce9df] text-[#245b45]",
  Assessment: "bg-[#e1e5f2] text-[#435174]",
  Interview: "bg-[#f8ded2] text-[#994324]",
  Offer: "bg-[#245b45] text-white",
};

const actionColors = {
  green: "bg-[#dce9df] text-[#245b45]",
  orange: "bg-[#f8ded2] text-[#a14728]",
  gold: "bg-[#f4e8bd] text-[#756220]",
} as const;

export function Dashboard() {
  const { activeProfile } = useActiveProfile();
  const data = dashboardData[activeProfile.id];

  if (!data) {
    return (
      <EmptyState
        icon="＋"
        title="Your dashboard is ready to grow"
        description="Add a career goal or application to start seeing deadlines and recommended next steps."
        actionLabel="View profile"
        actionHref="/profiles"
      />
    );
  }

  const totalApplications = data.applicationSummary.reduce(
    (total, item) => total + item.count,
    0,
  );

  return (
    <div className="page-enter">
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#db633a]">Monday, 28 July</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">Make the next move count.</h1>
          <p className="mt-2 text-sm text-[#68736c] sm:text-base">
            Here&apos;s what matters for {activeProfile.displayName.split(" ")[0]} right now.
          </p>
        </div>
        <Link href="/roadmap" className="inline-flex min-h-11 items-center justify-center self-start rounded-xl border border-[#ced1c8] bg-white/70 px-4 text-sm font-bold text-[#245b45] hover:bg-white sm:self-auto">
          View full roadmap <span aria-hidden="true" className="ml-2">↗</span>
        </Link>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="overflow-hidden !border-0 !bg-[#245b45] !p-0 text-white">
          <div className="relative min-h-64 p-6 sm:p-8">
            <div aria-hidden="true" className="absolute -right-16 -top-20 size-64 rounded-full border-[44px] border-white/5" />
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#bcd3c4]">Current direction</p>
            <h2 className="mt-3 max-w-xl font-display text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
              {activeProfile.careerGoals[0] ?? "Define your next career goal"}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#d5e3d9]">
              {activeProfile.discipline} · {activeProfile.studyLevel} · {activeProfile.location}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {activeProfile.careerGoals.slice(1).map((goal) => (
                <span key={goal} className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-[#e5eee7]">{goal}</span>
              ))}
            </div>
            <Link href="/profiles" className="mt-7 inline-flex text-sm font-bold text-[#f4e8bd] hover:text-white">
              Review career goals <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>
        </Card>

        <Card
          eyebrow={`${totalApplications} active opportunities`}
          title="Application pulse"
          action={<Link href="/applications" className="text-xs font-bold text-[#245b45]">Open tracker →</Link>}
        >
          <div className="grid grid-cols-2 gap-3">
            {data.applicationSummary.map((item) => (
              <div key={item.status} className="rounded-2xl bg-[#f5f4ee] p-4">
                <p className="font-display text-3xl font-extrabold tracking-[-0.04em]">{item.count}</p>
                <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold ${statusColors[item.status]}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card eyebrow="Coming up" title="Upcoming deadlines" action={<Link href="/applications" className="text-xs font-bold text-[#245b45]">See all →</Link>}>
          {data.deadlines.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#68736c]">No upcoming deadlines.</p>
          ) : (
            <ol className="divide-y divide-[#e4e5dd]">
              {data.deadlines.map((deadline) => (
                <li key={deadline.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <time dateTime={deadline.dateTime} className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f8ded2] text-center text-xs font-extrabold leading-tight text-[#9b4426]">{deadline.dateLabel}</time>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{deadline.title}</p>
                    <p className="mt-1 text-xs text-[#7b857e]">{deadline.organisation} · {deadline.category}</p>
                  </div>
                  <span aria-hidden="true" className="text-[#a8afa9]">→</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card eyebrow="Your focus" title="Recommended next actions">
          <ol className="space-y-3">
            {data.nextActions.map((action, index) => (
              <li key={action.id} className="flex gap-4 rounded-2xl border border-[#e4e5dd] bg-white p-4">
                <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${actionColors[action.tone]}`}>{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold">{action.title}</p>
                    <span className="shrink-0 text-[0.65rem] font-bold uppercase tracking-wide text-[#a14728]">{action.dueLabel}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#68736c]">{action.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}

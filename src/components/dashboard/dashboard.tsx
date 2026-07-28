"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const recommended = jobs.filter((job) => isJobSuitableForProfile(job, profile)).sort((a, b) => calculateJobMatch(b, profile).score - calculateJobMatch(a, profile).score).slice(0, 3);
  const activeApplications = activeWorkspace.applications.filter((item) => !["Rejected", "Withdrawn"].includes(item.status));
  const metrics = [
    ["Saved jobs", activeWorkspace.savedJobIds.length],
    ["Active applications", activeApplications.length],
    ["Interviews", activeWorkspace.applications.filter((item) => item.status === "Interview").length],
    ["Offers", activeWorkspace.applications.filter((item) => item.status === "Offer").length],
    ["Upcoming deadlines", deadlines.length],
    ["Saved programs", activeWorkspace.savedProgramIds.length],
  ];
  const incompleteRoadmap = activeWorkspace.roadmapItems.filter((item) => item.status !== "Completed").slice(0, 5);
  const profileChecks = [profile.preferredName, profile.workEligibility, profile.expectedGraduationDate, profile.skills.length > 0 ? "skills" : "", profile.careerGoals.length > 0 ? "goals" : ""];
  const completedSetup = profileChecks.filter(Boolean).length;
  const completedRoadmap = activeWorkspace.roadmapItems.filter((item) => item.status === "Completed").length;
  const progress = Math.round(((completedSetup + completedRoadmap) / Math.max(1, profileChecks.length + activeWorkspace.roadmapItems.length)) * 100);

  return (
    <div className="page-enter">
      <header className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#db633a]">Your action centre</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">{greeting()}, {profile.preferredName || profile.displayName}</h1>
        <p className="mt-2 text-sm text-[#68736c]">Primary goal: <strong className="text-[#344039]">{profile.careerGoals[0] ?? "Add a career goal"}</strong></p>
      </header>

      <section aria-label="Career summary" className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-[#dedfd7] bg-[#fffef9] p-4"><strong className="font-display text-2xl">{value}</strong><span className="mt-1 block text-xs font-semibold text-[#68736c]">{label}</span></div>)}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card eyebrow="Today’s focus" title="Recommended next actions">
          {incompleteRoadmap.length === 0 ? <p className="text-sm text-[#68736c]">Your current roadmap actions are complete. Add another item when ready.</p> : <ol className="space-y-3">{incompleteRoadmap.map((item, index) => <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#e4e5dd] p-4"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#f4e8bd] text-xs font-extrabold text-[#756220]">{index + 1}</span><div className="min-w-0 flex-1"><strong className="text-sm">{item.title}</strong><span className="mt-1 block text-xs text-[#68736c]">{item.category} · {item.targetDate || "No date"}</span></div><Button size="sm" variant="secondary" onClick={() => upsertRoadmapItem({ ...item, status: "Completed" })}>Complete</Button></li>)}</ol>}
        </Card>

        <Card eyebrow="Based on setup and roadmap" title="Planning progress">
          <div className="flex items-center gap-5"><div className="grid size-24 shrink-0 place-items-center rounded-full bg-[conic-gradient(#245b45_var(--progress),#e4e5dd_0)] p-2" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><div className="grid size-full place-items-center rounded-full bg-[#fffef9] font-display text-xl font-extrabold">{progress}%</div></div><p className="text-sm leading-6 text-[#68736c]">Calculated from completed profile setup fields and roadmap items. It does not predict career success.</p></div>
          <Link href="/roadmap" className="mt-5 inline-flex text-sm font-bold text-[#245b45]">Open roadmap →</Link>
        </Card>

        <Card eyebrow="Deterministic matching" title="Recommended sample jobs" action={<Link href="/jobs" className="text-xs font-bold text-[#245b45]">Browse all →</Link>}>
          <div className="space-y-3">{recommended.map((job) => <article key={job.id} className="rounded-2xl border border-[#e4e5dd] p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-bold">{job.title}</h3><p className="mt-1 text-xs text-[#68736c]">{job.companyName} · {job.location}</p></div><Badge tone="green">{calculateJobMatch(job, profile).score}% estimated match</Badge></div></article>)}</div>
        </Card>

        <Card eyebrow="Combined timeline" title="Upcoming deadlines">
          {deadlines.length === 0 ? <p className="text-sm text-[#68736c]">Save jobs, programs or dated actions to build your timeline.</p> : <ol className="divide-y divide-[#e4e5dd]">{deadlines.map((deadline) => <li key={deadline.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><time dateTime={deadline.date} className="w-16 shrink-0 text-xs font-extrabold text-[#9b4426]">{new Date(`${deadline.date}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</time><div className="min-w-0"><p className="truncate text-sm font-bold">{deadline.title}</p><p className="text-xs text-[#68736c]">{deadline.source}</p></div></li>)}</ol>}
        </Card>
      </div>
    </div>
  );
}

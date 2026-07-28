"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { jobs } from "@/data/seed";
import { calculateJobMatch, isJobSuitableForProfile } from "@/lib/match";
import { useCareerOS } from "@/providers/careeros-provider";
import type { Job } from "@/types/domain";

export function JobBrowser() {
  const { activeWorkspace, toggleSavedJob, addJobApplication } = useCareerOS();
  const profile = activeWorkspace.profile;
  const [query, setQuery] = useState("");
  const [roleFamily, setRoleFamily] = useState("All");
  const [employmentType, setEmploymentType] = useState("All");
  const [location, setLocation] = useState("All");
  const [remoteType, setRemoteType] = useState("All");
  const [relevantOnly, setRelevantOnly] = useState(true);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState("Most relevant");
  const [selected, setSelected] = useState<Job | null>(null);

  const visibleJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const text = `${job.title} ${job.companyName} ${job.tags.join(" ")}`.toLowerCase();
      return (
        text.includes(query.toLowerCase()) &&
        (roleFamily === "All" || job.roleFamily === roleFamily) &&
        (employmentType === "All" || job.employmentType === employmentType) &&
        (location === "All" || job.location === location) &&
        (remoteType === "All" || job.remoteType === remoteType) &&
        (!relevantOnly || isJobSuitableForProfile(job, profile)) &&
        (!savedOnly || activeWorkspace.savedJobIds.includes(job.id))
      );
    });
    return filtered.sort((a, b) => {
      if (sort === "Deadline soonest") return a.deadline.localeCompare(b.deadline);
      if (sort === "Recently added") return b.postedDate.localeCompare(a.postedDate);
      if (sort === "Company name") return a.companyName.localeCompare(b.companyName);
      return calculateJobMatch(b, profile).score - calculateJobMatch(a, profile).score;
    });
  }, [activeWorkspace.savedJobIds, employmentType, location, profile, query, relevantOnly, remoteType, roleFamily, savedOnly, sort]);

  const match = selected ? calculateJobMatch(selected, profile) : null;

  return (
    <div className="page-enter">
      <PageHeading eyebrow="Sample opportunity browser" title="Jobs" description={`Explore planning records tailored to ${profile.preferredName || profile.displayName}. Sample roles are not verified active vacancies.`} />
      <section aria-label="Job filters" className="mb-6 rounded-[1.35rem] border border-[#dedfd7] bg-[#fffef9] p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <label className="xl:col-span-2"><span className="sr-only">Search jobs</span><Input type="search" placeholder="Search role or company" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <label><span className="sr-only">Role family</span><Select aria-label="Role family" value={roleFamily} onChange={(e) => setRoleFamily(e.target.value)}><option>All</option>{[...new Set(jobs.map((job) => job.roleFamily))].map((value) => <option key={value}>{value}</option>)}</Select></label>
          <label><span className="sr-only">Employment type</span><Select aria-label="Employment type" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}><option>All</option>{[...new Set(jobs.map((job) => job.employmentType))].map((value) => <option key={value}>{value}</option>)}</Select></label>
          <label><span className="sr-only">Location</span><Select aria-label="Location" value={location} onChange={(e) => setLocation(e.target.value)}><option>All</option>{[...new Set(jobs.map((job) => job.location))].map((value) => <option key={value}>{value}</option>)}</Select></label>
          <label><span className="sr-only">Remote type</span><Select aria-label="Remote type" value={remoteType} onChange={(e) => setRemoteType(e.target.value)}><option>All</option>{["On-site", "Hybrid", "Remote"].map((value) => <option key={value}>{value}</option>)}</Select></label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
          <label className="flex min-h-11 items-center gap-2 font-semibold"><input type="checkbox" checked={relevantOnly} onChange={(e) => setRelevantOnly(e.target.checked)} /> Relevant to active profile</label>
          <label className="flex min-h-11 items-center gap-2 font-semibold"><input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} /> Saved only</label>
          <label className="ml-auto flex items-center gap-2 font-semibold">Sort <Select aria-label="Sort jobs" value={sort} onChange={(e) => setSort(e.target.value)} className="!mt-0">{["Most relevant", "Deadline soonest", "Recently added", "Company name"].map((value) => <option key={value}>{value}</option>)}</Select></label>
        </div>
      </section>

      <p className="mb-4 text-sm font-semibold text-[#68736c]" aria-live="polite">{visibleJobs.length} sample opportunities</p>
      {visibleJobs.length === 0 ? <p className="rounded-[1.35rem] border border-dashed border-[#cfd2c9] p-10 text-center text-sm text-[#68736c]">No jobs match these filters. Clear a filter to broaden the sample set.</p> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleJobs.map((job) => {
            const result = calculateJobMatch(job, profile);
            const saved = activeWorkspace.savedJobIds.includes(job.id);
            const applied = activeWorkspace.applications.some((item) => item.jobId === job.id);
            return (
              <article key={job.id} className="flex min-w-0 flex-col rounded-[1.35rem] border border-[#dedfd7] bg-[#fffef9] p-5">
                <div className="flex flex-wrap gap-2"><Badge tone="orange">Sample data</Badge><Badge tone="green">{result.score}% estimated match</Badge></div>
                <h2 className="mt-4 font-display text-lg font-extrabold leading-snug">{job.title}</h2>
                <p className="mt-1 text-sm font-semibold text-[#59645e]">{job.companyName}</p>
                <p className="mt-4 text-sm text-[#68736c]">{job.location} · {job.remoteType} · {job.employmentType}</p>
                <div className="mt-4 flex flex-wrap gap-2">{job.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
                <p className="mt-4 text-xs font-semibold text-[#7b857e]">Sample deadline: <time dateTime={job.deadline}>{new Date(`${job.deadline}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</time></p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Button size="sm" variant="secondary" onClick={() => setSelected(job)}>View details</Button>
                  <Button size="sm" variant={saved ? "primary" : "secondary"} aria-pressed={saved} onClick={() => toggleSavedJob(job.id)}>{saved ? "Saved" : "Save"}</Button>
                  <Button size="sm" disabled={applied} onClick={() => addJobApplication(job.id)}>{applied ? "In tracker" : "Add to applications"}</Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={selected !== null} title={selected?.title ?? "Job details"} description={selected ? `${selected.companyName} · Sample planning record` : undefined} onClose={() => setSelected(null)}>
        {selected && match && <div className="space-y-6">
          <div className="flex flex-wrap gap-2"><Badge tone="orange">Sample data—not a verified vacancy</Badge><Badge tone="green">{match.score}% estimated profile match</Badge></div>
          <section><h3 className="font-bold">Overview</h3><p className="mt-2 text-sm leading-6 text-[#59645e]">{selected.description}</p></section>
          <div className="grid gap-5 sm:grid-cols-2">
            <section><h3 className="font-bold">Requirements</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#59645e]">{selected.requirements.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h3 className="font-bold">Preferred skills</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#59645e]">{selected.preferredSkills.map((item) => <li key={item}>{item}</li>)}</ul></section>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <section><h3 className="font-bold text-[#245b45]">Matching strengths</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#59645e]">{match.strengths.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h3 className="font-bold text-[#9b4426]">Areas to investigate</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#59645e]">{match.gaps.map((item) => <li key={item}>{item}</li>)}</ul></section>
          </div>
          <p className="rounded-xl bg-[#f5f4ee] p-4 text-xs leading-5 text-[#68736c]">{match.explanation}</p>
          <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => toggleSavedJob(selected.id)}>{activeWorkspace.savedJobIds.includes(selected.id) ? "Unsave" : "Save job"}</Button><Button onClick={() => addJobApplication(selected.id)}>Add to applications</Button></div>
        </div>}
      </Dialog>
    </div>
  );
}

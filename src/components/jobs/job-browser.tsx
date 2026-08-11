"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/form-field";
import { MobileBottomSheet } from "@/components/ui/mobile-bottom-sheet";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { jobs } from "@/data/seed";
import { calculateJobMatch, isJobSuitableForProfile } from "@/lib/match";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { Job } from "@/types/domain";
import { displayOrganisationName, sampleStatus } from "@/lib/presentation";
import { displayUiValue } from "@/i18n/presentation";

export function JobBrowser() {
  const { activeWorkspace, toggleSavedJob, addJobApplication } = useCareerOS();
  const { language, t } = useLanguage();
  const profile = activeWorkspace.profile;
  const [query, setQuery] = useState("");
  const [roleFamily, setRoleFamily] = useState("All");
  const [employmentType, setEmploymentType] = useState("All");
  const [location, setLocation] = useState("All");
  const [remoteType, setRemoteType] = useState("All");
  const [relevantOnly, setRelevantOnly] = useState(true);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState("Most relevant");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Job | null>(null);

  const visibleJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const text =
        `${job.title} ${job.companyName} ${job.tags.join(" ")}`.toLowerCase();
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
      if (sort === "Deadline soonest")
        return a.deadline.localeCompare(b.deadline);
      if (sort === "Recently added")
        return b.postedDate.localeCompare(a.postedDate);
      if (sort === "Company name")
        return a.companyName.localeCompare(b.companyName);
      return (
        calculateJobMatch(b, profile).score -
        calculateJobMatch(a, profile).score
      );
    });
  }, [
    activeWorkspace.savedJobIds,
    employmentType,
    location,
    profile,
    query,
    relevantOnly,
    remoteType,
    roleFamily,
    savedOnly,
    sort,
  ]);

  const match = selected ? calculateJobMatch(selected, profile) : null;
  const controls = (
    <div className="grid gap-4 md:grid-cols-4">
      <label className="text-sm font-medium">
        {t("jobs.roleFamily")}
        <Select
          value={roleFamily}
          onChange={(e) => setRoleFamily(e.target.value)}
        >
          <option value="All">{t("common.all")}</option>
          {[...new Set(jobs.map((job) => job.roleFamily))].map((value) => (
            <option key={value} value={value}>
              {displayUiValue(value, language)}
            </option>
          ))}
        </Select>
      </label>
      <label className="text-sm font-medium">
        {t("jobs.employmentType")}
        <Select
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
        >
          <option value="All">{t("common.all")}</option>
          {[...new Set(jobs.map((job) => job.employmentType))].map((value) => (
            <option key={value} value={value}>
              {displayUiValue(value, language)}
            </option>
          ))}
        </Select>
      </label>
      <label className="text-sm font-medium">
        {t("jobs.location")}
        <Select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="All">{t("common.all")}</option>
          {[...new Set(jobs.map((job) => job.location))].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </Select>
      </label>
      <label className="text-sm font-medium">
        {t("jobs.workStyle")}
        <Select
          value={remoteType}
          onChange={(e) => setRemoteType(e.target.value)}
        >
          <option value="All">{t("common.all")}</option>
          {[...new Set(jobs.map((job) => job.remoteType))].map((value) => (
            <option key={value} value={value}>
              {displayUiValue(value, language)}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={relevantOnly}
          onChange={(e) => setRelevantOnly(e.target.checked)}
        />
        {t("jobs.relevant")}
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={savedOnly}
          onChange={(e) => setSavedOnly(e.target.checked)}
        />
        {t("jobs.savedOnly")}
      </label>
      <label className="text-sm font-medium md:col-span-2">
        {t("jobs.sort")}
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          {[
            "Most relevant",
            "Deadline soonest",
            "Recently added",
            "Company name",
          ].map((value) => (
            <option key={value} value={value}>
              {displayUiValue(value, language)}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeading
        eyebrow={t("jobs.verifiedEyebrow")}
        title={t("jobs.title")}
        description={t("jobs.verifiedDescription", {
          name: profile.preferredName || profile.displayName,
        })}
      />
      <div className="mb-4 flex gap-3">
        <label className="flex-1">
          <span className="sr-only">{t("jobs.search")}</span>
          <Input
            type="search"
            placeholder={t("jobs.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="!mt-0 !bg-[var(--surface)]"
          />
        </label>
        <Button
          className="md:hidden"
          variant="secondary"
          onClick={() => setFiltersOpen(true)}
        >
          {t("common.filters")}
        </Button>
      </div>
      <section
        aria-label={t("common.filters")}
        className="surface-card mb-7 hidden p-5 md:block"
      >
        {controls}
      </section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-secondary)]" aria-live="polite">
          {language === "zh-CN"
            ? `${visibleJobs.length} 条已核验项目记录`
            : `${visibleJobs.length} verified programme-level ${visibleJobs.length === 1 ? "record" : "records"}`}
        </p>
        <StatusBadge status="positive">{t("jobs.officialSource")}</StatusBadge>
      </div>

      {visibleJobs.length === 0 ? (
        <p className="surface-card border-dashed p-10 text-center text-sm text-[var(--text-secondary)]">
          {t("jobs.empty")}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleJobs.map((job) => {
            const result = calculateJobMatch(job, profile);
            const saved = activeWorkspace.savedJobIds.includes(job.id);
            const applied = activeWorkspace.applications.some(
              (item) => item.jobId === job.id,
            );
            return (
              <article
                key={job.id}
                className="interactive-lift surface-card relative flex min-w-0 flex-col p-5 sm:p-6"
              >
                <button
                  type="button"
                  aria-label={
                    saved ? `Unsave ${job.title}` : `Save ${job.title}`
                  }
                  aria-pressed={saved}
                  onClick={() => toggleSavedJob(job.id)}
                  className={`absolute right-4 top-4 grid size-11 place-items-center rounded-full text-lg ${saved ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]"}`}
                >
                  {saved ? "●" : "○"}
                </button>
                <p className="pr-12 text-[0.78rem] font-medium text-[var(--text-tertiary)]">
                  {displayOrganisationName(job.companyName)}
                </p>
                <div className="mt-2">
                  {job.sampleData ? (
                    <Badge>{sampleStatus(language)}</Badge>
                  ) : (
                    <StatusBadge status="positive">
                      {t("jobs.officialSource")}
                    </StatusBadge>
                  )}
                </div>
                <h2 className="mt-3 pr-8 font-display text-xl font-medium leading-snug tracking-[-0.03em]">
                  {job.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {job.location} · {displayUiValue(job.remoteType, language)} ·{" "}
                  {displayUiValue(job.employmentType, language)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
                <div className="mt-6 flex items-end justify-between gap-3 border-t border-[var(--border)] pt-4">
                  <div>
                    <StatusBadge status="active">
                      {language === "zh-CN"
                        ? `预计资料匹配度 ${result.score}%`
                        : `${result.score}% planning alignment`}
                    </StatusBadge>
                    <p className="mt-2 text-[0.75rem] text-[var(--text-tertiary)]">
                      {job.deadline
                        ? new Date(
                            `${job.deadline}T00:00:00`,
                          ).toLocaleDateString(
                            language === "zh-CN" ? "zh-CN" : "en-AU",
                            { day: "numeric", month: "short" },
                          )
                        : displayUiValue(
                            job.applicationStage ?? "Not published",
                            language,
                          )}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setSelected(job)}>
                    {t("jobs.view")}
                  </Button>
                </div>
                {applied && (
                  <p className="mt-3 text-[0.78rem] font-medium text-[var(--success)]">
                    {language === "zh-CN"
                      ? "已加入申请"
                      : "Added to applications"}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      <MobileBottomSheet
        open={filtersOpen}
        title={language === "zh-CN" ? "筛选机会" : "Filter opportunities"}
        onClose={() => setFiltersOpen(false)}
      >
        {controls}
        <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>
          {language === "zh-CN"
            ? `显示 ${visibleJobs.length} 个职位`
            : `Show ${visibleJobs.length} roles`}
        </Button>
      </MobileBottomSheet>

      <Dialog
        open={selected !== null}
        title={selected?.title ?? (language === "zh-CN" ? "职位详情" : "Job details")}
        description={
          selected
            ? `${displayOrganisationName(selected.companyName)} · ${selected.sampleData ? sampleStatus(language) : t("jobs.officialSource")}`
            : undefined
        }
        onClose={() => setSelected(null)}
      >
        {selected && match && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {selected.sampleData ? (
                <StatusBadge status="active">
                  {sampleStatus(language)}
                </StatusBadge>
              ) : (
                <StatusBadge status="positive">
                  {t("jobs.officialSource")}
                </StatusBadge>
              )}
              <StatusBadge status="active">
                {language === "zh-CN" ? `预计资料匹配度 ${match.score}%` : `${match.score}% planning alignment`}
              </StatusBadge>
            </div>
            <section>
              <h3 className="font-medium">{t("jobs.overview")}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {selected.description}
              </p>
            </section>
            {selected.sourceUrl && (
              <p className="text-sm">
                <a
                  className="font-medium text-[var(--accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("jobs.openOfficialSource")}
                </a>
                {selected.lastUpdated && (
                  <span className="ml-3 text-[var(--text-tertiary)]">
                    {t("jobs.lastReviewed", { date: selected.lastUpdated })}
                  </span>
                )}
              </p>
            )}
            <div className="grid gap-6 sm:grid-cols-2">
              <section>
                <h3 className="font-medium">{t("jobs.requirements")}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                  {selected.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="font-medium">{t("jobs.preferredSkills")}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                  {selected.preferredSkills.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="font-medium text-[var(--success)]">
                  {t("jobs.strengths")}
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                  {match.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="font-medium text-[var(--warning)]">
                  {t("jobs.gaps")}
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                  {match.gaps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
            <p className="rounded-xl bg-[var(--surface-subtle)] p-4 text-xs leading-5 text-[var(--text-secondary)]">
              {language === "zh-CN"
                ? `这是基于当前资料的规划估算，不代表就业能力、录用概率或雇主决定。已记录 ${match.strengths.length} 项依据，另有 ${match.gaps.length} 项差距或未知信息。`
                : `${match.explanation} It does not measure employability, selection likelihood or hiring probability. Evidence: ${match.strengths.length} item(s); unknowns or gaps: ${match.gaps.length}.`}
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => toggleSavedJob(selected.id)}
              >
                {activeWorkspace.savedJobIds.includes(selected.id)
                  ? t("jobs.unsave")
                  : t("jobs.save")}
              </Button>
              <Button onClick={() => addJobApplication(selected.id)}>
                {activeWorkspace.applications.some(
                  (item) => item.jobId === selected.id,
                )
                  ? t("jobs.inApplications")
                  : t("jobs.addApplication")}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

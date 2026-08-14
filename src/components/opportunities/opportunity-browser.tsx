"use client";

import { useMemo, useState } from "react";
import { opportunities } from "@/data/opportunities";
import { calculateOpportunityMatch } from "@/lib/opportunity-match";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type { Opportunity, OpportunityCategory } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatPercentage } from "@/i18n/format";
import { deriveOpportunityLifecycle } from "@/lib/opportunity-lifecycle";
import { jobs } from "@/data/seed";
import { displayUiValue } from "@/i18n/presentation";
import Link from "next/link";
import { TOMMY_ID } from "@/data/seed";
import { getEligibleOpportunities } from "@/lib/profile-eligibility";
import { recommendResumeForOpportunity } from "@/lib/document-evidence";
import { TOMMY_ADD_CLINIC_ROUTE, TOMMY_CLINIC_DIRECTORY_ROUTE } from "@/lib/clinic-directory";

export function OpportunityBrowser() {
  const {
    activeWorkspace,
    state,
    toggleSavedOpportunity,
    addJobApplication,
    upsertRoadmapItem,
  } = useCareerOS();
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OpportunityCategory | "All">("All");
  const [location, setLocation] = useState("All");
  const [discipline, setDiscipline] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<"relevance" | "deadline">("relevance");
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const eligibleOpportunities = useMemo(
    () => getEligibleOpportunities(activeWorkspace.profile, opportunities),
    [activeWorkspace.profile],
  );

  const matches = useMemo(
    () =>
      new Map(
        eligibleOpportunities.map((item) => [
          item.id,
          calculateOpportunityMatch(item, activeWorkspace.profile, activeWorkspace.documents),
        ]),
      ),
    [activeWorkspace.documents, activeWorkspace.profile, eligibleOpportunities],
  );
  const visible = useMemo(
    () =>
      eligibleOpportunities
        .filter(
          (item) =>
            state.dashboardPreferences.showArchivedOpportunities ||
            !item.archived,
        )
        .filter(
          (item) =>
            state.dashboardPreferences.showSampleData || !item.sampleData,
        )
        .filter((item) => category === "All" || item.category === category)
        .filter(
          (item) =>
            location === "All" ||
            item.country === location ||
            item.city === location,
        )
        .filter(
          (item) =>
            discipline === "All" || item.disciplineTags.includes(discipline),
        )
        .filter(
          (item) =>
            !savedOnly || activeWorkspace.savedOpportunityIds.includes(item.id),
        )
        .filter(
          (item) =>
            !verifiedOnly || item.verificationStatus === "Official source",
        )
        .filter((item) =>
          `${item.title} ${item.organisationName} ${item.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "deadline"
            ? (a.deadline || "9999").localeCompare(b.deadline || "9999")
            : (matches.get(b.id)?.score ?? 0) - (matches.get(a.id)?.score ?? 0),
        ),
    [
      activeWorkspace.savedOpportunityIds,
      category,
      discipline,
      location,
      matches,
      query,
      savedOnly,
      sort,
      state.dashboardPreferences,
      verifiedOnly,
      eligibleOpportunities,
    ],
  );

  const detailMatch = selected ? matches.get(selected.id) : null;
  const recommendedResume = selected ? recommendResumeForOpportunity(activeWorkspace.profile, activeWorkspace.documents, selected) : null;
  const dimensionLabels = {
    "Goal alignment": t("opportunities.goalAlignment"),
    "Discipline alignment": t("opportunities.disciplineAlignment"),
    "Skill overlap": t("opportunities.skillOverlap"),
    "Location alignment": t("opportunities.locationAlignment"),
    "Experience/project relevance": t("opportunities.experienceRelevance"),
    "Eligibility confidence": t("opportunities.eligibilityConfidence"),
    "Opportunity type preference": t("opportunities.typePreference"),
  };
  const candidateJobId = selected?.id.replace("opportunity-", "") ?? "";
  const jobId = jobs.some((job) => job.id === candidateJobId)
    ? candidateJobId
    : "";
  const addSelectedToRoadmap = () => {
    if (!selected) return;
    upsertRoadmapItem({
      id: `roadmap-${selected.id}-${Date.now()}`,
      profileId: activeWorkspace.profile.id,
      title: `Review ${selected.title}`,
      description: selected.dataNotes ?? selected.description,
      category:
        selected.category === "Professional registration"
          ? "Registration"
          : selected.category === "Networking event"
            ? "Networking"
            : "Other",
      targetDate: selected.deadline ?? "",
      status: "Not started",
      priority: "Medium",
    });
  };

  return (
    <div className="page-enter">
      <PageHeading
        eyebrow={t("opportunities.eyebrow")}
        title={t("opportunities.title")}
        description={t("opportunities.description")}
      />
      <div className="mt-7 grid gap-3 md:grid-cols-4">
        <label className="md:col-span-2">
          <span className="sr-only">{t("opportunities.search")}</span>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("opportunities.search")}
          />
        </label>
        <label>
          <span className="sr-only">{t("opportunities.category")}</span>
          <Select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as OpportunityCategory | "All")
            }
          >
            <option value="All">{t("common.all")}</option>
            {Array.from(
              new Set(eligibleOpportunities.map((item) => item.category)),
            ).map((value) => (
              <option key={value} value={value}>{displayUiValue(value, language)}</option>
            ))}
          </Select>
        </label>
        <label>
          <span className="sr-only">{t("opportunities.location")}</span>
          <Select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="All">{t("common.all")}</option>
            {Array.from(
              new Set(
                eligibleOpportunities.flatMap((item) => [item.country, item.city]),
              ),
            )
              .sort()
              .map((value) => (
                <option key={value}>{value}</option>
              ))}
          </Select>
        </label>
        <label>
          <span className="sr-only">{t("opportunities.discipline")}</span>
          <Select
            value={discipline}
            onChange={(event) => setDiscipline(event.target.value)}
          >
            <option value="All">{t("common.all")}</option>
            {Array.from(
              new Set(eligibleOpportunities.flatMap((item) => item.disciplineTags)),
            )
              .sort()
              .map((value) => (
                <option key={value}>{value}</option>
              ))}
          </Select>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={savedOnly}
            onChange={(event) => setSavedOnly(event.target.checked)}
          />
          {t("opportunities.savedOnly")}
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => setVerifiedOnly(event.target.checked)}
          />
          {t("opportunities.verifiedOnly")}
        </label>
        <label>
          <span className="sr-only">{t("opportunities.sort")}</span>
          <Select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as "relevance" | "deadline")
            }
          >
            <option value="relevance">{t("opportunities.relevance")}</option>
            <option value="deadline">{t("opportunities.deadline")}</option>
          </Select>
        </label>
      </div>
      {visible.length === 0 ? (
        <div className="mt-8">
          {activeWorkspace.profile.id === TOMMY_ID && eligibleOpportunities.length === 0 ? (
            <div className="surface-card border-dashed p-8 text-center">
              <h2 className="font-display text-xl font-medium">
                {language === "zh-CN"
                  ? "目前没有找到适合 Tommy 且已核验为正在招聘的岗位。"
                  : "There are currently no verified open roles suitable for Tommy."}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                {language === "zh-CN"
                  ? "你仍可以查看 Canberra / ACT 诊所目录、准备 Ahpra 注册材料，或记录目标诊所进行主动联系。"
                  : "You can still review the Canberra / ACT clinic directory, prepare Ahpra registration materials, or record target clinics for proactive outreach."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link className="button-secondary" href={TOMMY_CLINIC_DIRECTORY_ROUTE}>{language === "zh-CN" ? "查看诊所目录" : "View clinic directory"}</Link>
                <Link className="button-secondary" href="/gap-analysis">{language === "zh-CN" ? "查看 AHPRA 注册准备" : "Review AHPRA registration"}</Link>
                <Link className="button-secondary" href="/roadmap">{language === "zh-CN" ? "打开职业规划" : "Open career roadmap"}</Link>
                <Link className="button-secondary" href={TOMMY_ADD_CLINIC_ROUTE}>{language === "zh-CN" ? "添加目标诊所" : "Add target clinic"}</Link>
              </div>
            </div>
          ) : (
            <EmptyState icon="◇" title={t("opportunities.empty")} description={t("opportunities.description")} />
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {visible.map((item) => {
            const match = matches.get(item.id);
            const saved = activeWorkspace.savedOpportunityIds.includes(item.id);
            const lifecycle = deriveOpportunityLifecycle(item, "2026-07-30");
            return (
              <article key={item.id} className="surface-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{displayUiValue(item.category, language)}</Badge>
                      <StatusBadge
                        status={
                          item.verificationStatus === "Official source"
                            ? "positive"
                            : "neutral"
                        }
                      >
                        {displayUiValue(item.verificationStatus, language)}
                      </StatusBadge>
                      <StatusBadge
                        status={
                          ["Open", "Closing soon"].includes(lifecycle)
                            ? "positive"
                            : lifecycle === "Upcoming"
                              ? "active"
                              : "warning"
                        }
                      >
                        {displayUiValue(lifecycle, language)}
                      </StatusBadge>
                      {item.sampleData && (
                        <Badge>{t("common.sampleNotice")}</Badge>
                      )}
                    </div>
                    <h2 className="mt-4 font-display text-xl font-medium">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {item.organisationName} · {item.locationText}
                    </p>
                    {item.sampleData && (
                      <p className="mt-2 text-xs font-medium text-[var(--warning)]">
                        {t("common.unverifiedVacancy")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="min-h-11 px-2 text-[var(--accent)]"
                    onClick={() => toggleSavedOpportunity(item.id)}
                    aria-pressed={saved}
                    aria-label={
                      saved
                        ? t("opportunities.unsave")
                        : t("opportunities.save")
                    }
                  >
                    {saved ? "●" : "○"}
                  </button>
                </div>
                <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--border)] pt-4">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {t("opportunities.match")}
                    </p>
                    <strong>
                      {match ? formatPercentage(match.score, language) : "—"}
                    </strong>
                  </div>
                  <div className="text-right">
                    {item.deadline && (
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatDate(item.deadline, language)}
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelected(item)}
                    >
                      {t("opportunities.details")}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Dialog
        open={Boolean(selected)}
        title={selected?.title ?? ""}
        description={
          selected
            ? `${selected.organisationName} · ${selected.locationText}`
            : ""
        }
        onClose={() => setSelected(null)}
      >
        {selected && detailMatch && (
          <div className="space-y-6">
            {selected.sampleData && (
              <div className="flex flex-wrap gap-2">
                <Badge>{t("common.sampleNotice")}</Badge>
                <StatusBadge status="neutral">
                  {t("common.unverifiedVacancy")}
                </StatusBadge>
                {selected.deadline && (
                  <Badge>{t("common.syntheticDate")}</Badge>
                )}
              </div>
            )}
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              {selected.description}
            </p>
            <section className="rounded-xl bg-[var(--surface-subtle)] p-4">
              <h3 className="font-medium">{language === "zh-CN" ? "推荐文档" : "Recommended document"}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{recommendedResume ? `${recommendedResume.name} · ${recommendedResume.version}` : (language === "zh-CN" ? "需要准备对应简历版本" : "A suitable résumé version needs to be prepared")}</p>
            </section>
            <section>
              <h3 className="font-medium">{t("opportunities.dimensions")}</h3>
              <div className="mt-3 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                {(detailMatch.dimensions ?? []).map((dimension) => (
                  <div
                    key={dimension.name}
                    className="grid gap-3 p-4 sm:grid-cols-[12rem_1fr]"
                  >
                    <h4 className="font-medium">
                      {dimensionLabels[dimension.name]}
                    </h4>
                    <dl className="grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-xs text-[var(--text-tertiary)]">
                          {t("opportunities.result")}
                        </dt>
                        <dd className="mt-1 font-medium">
                          {dimension.score === null
                            ? t("opportunities.insufficient")
                            : formatPercentage(dimension.score, language)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[var(--text-tertiary)]">
                          {t("opportunities.evidence")}
                        </dt>
                        <dd className="mt-1 text-[var(--text-secondary)]">
                          {dimension.evidence.length
                            ? dimension.evidence.join("; ")
                            : t("opportunities.noEvidence")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[var(--text-tertiary)]">
                          {t("opportunities.uncertainty")}
                        </dt>
                        <dd className="mt-1 text-[var(--text-secondary)]">
                          {dimension.uncertainty ||
                            t("opportunities.noUncertainty")}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="font-medium">{t("opportunities.why")}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                {detailMatch.strengths.slice(0, 5).map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="font-medium">{t("opportunities.review")}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                {detailMatch.gaps.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl bg-[var(--surface-subtle)] p-4 text-sm">
              <strong>{t("opportunities.source")}</strong>
              <p className="mt-2 text-[var(--text-secondary)]">
                {selected.sourceName} · {displayUiValue(selected.verificationStatus, language)}
              </p>
              {selected.lastVerifiedAt && (
                <p>{formatDate(selected.lastVerifiedAt, language)}</p>
              )}
              {selected.dataNotes && (
                <p className="mt-2 text-[var(--text-secondary)]">
                  {selected.dataNotes}
                </p>
              )}
            </section>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toggleSavedOpportunity(selected.id)}>
                {activeWorkspace.savedOpportunityIds.includes(selected.id)
                  ? t("opportunities.unsave")
                  : t("opportunities.save")}
              </Button>
              {jobId ? (
                <Button
                  variant="secondary"
                  onClick={() => addJobApplication(jobId)}
                >
                  {t("opportunities.addApplications")}
                </Button>
              ) : (
                <Button variant="secondary" onClick={addSelectedToRoadmap}>
                  {t("opportunities.addRoadmap")}
                </Button>
              )}
              {selected.sourceUrl && (
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-[var(--accent)]"
                >
                  {t("opportunities.openSource")} ↗
                </a>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

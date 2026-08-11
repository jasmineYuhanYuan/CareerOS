"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { chinaTrackingTargets } from "@/data/china-recruiting/targets";
import {
  chinaAssessmentIntelligence,
  chinaInterviewIntelligence,
} from "@/data/china-recruiting/intelligence";
import {
  activeChinaOpportunities,
  calculateChinaPriority,
  chinaPipelineMetrics,
  deriveDeadlineUrgency,
  selectTodayRecommendations,
} from "@/lib/china-recruiting";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import { displayCompanyName, displayUiValue, formatRelativeDate } from "@/i18n/presentation";
import { formatDate } from "@/i18n/format";
import { buildChinaReviewQueue } from "@/lib/data-freshness";
import type {
  ChinaCampusOpportunity,
  ChinaRecruitingPriority,
  ChinaRecruitingStatus,
} from "@/types/domain";

const statuses: ChinaRecruitingStatus[] = [
  "Wishlist",
  "To Apply",
  "Applied",
  "OA",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
  "Archived",
];
const priorities: ChinaRecruitingPriority[] = ["P1", "P2", "P3"];
const categories = [
  "All",
  "Backend",
  "Software Engineering",
  "AI",
  "AI Product",
  "Product",
  "Data",
  "Other",
];
const resumeVersions = [
  "All",
  "中文产品简历",
  "中文技术简历",
  "英文产品简历",
  "英文技术简历",
  "通用校招简历",
  "Chinese",
  "English",
  "Both",
];

const importExample = JSON.stringify(
  {
    company: "",
    position: "",
    category: "Software Engineering",
    location: "",
    country: "China",
    hiringSeason: "2027 秋招",
    officialApplyLink: "",
    sourceName: "",
    sourceUrl: "",
    sourceType: "Official",
    recruitingBatch: "日常实习",
    roleFamily: "Software Engineering",
    officialCareersLink: "",
    verificationStatus: "Verification required",
    verificationConfidence: "Low",
    deadline: null,
    resumeVersion: "通用校招简历",
    status: "To Apply",
    priority: "P1",
    fitScore: 0,
    notes: "",
  },
  null,
  2,
);

function statusTone(
  status: ChinaRecruitingStatus,
): "neutral" | "active" | "positive" | "warning" | "danger" {
  if (status === "Offer") return "positive";
  if (["Rejected", "Withdrawn", "Archived"].includes(status)) return "danger";
  if (["OA", "Interview"].includes(status)) return "warning";
  return status === "Applied" ? "positive" : "active";
}

function OpportunityBadges({ item, language }: { item: ChinaCampusOpportunity; language: "en" | "zh-CN" }) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="active">CN</StatusBadge>
      <StatusBadge>{displayUiValue(item.hiringSeason, language)}</StatusBadge>
      <StatusBadge
        status={
          item.priority === "P1"
            ? "danger"
            : item.priority === "P2"
              ? "warning"
              : "neutral"
        }
      >
        {item.priority}
      </StatusBadge>
      <StatusBadge>
        {language === "zh-CN" ? "优先分" : "Priority score"} {calculateChinaPriority(item).score}
      </StatusBadge>
      <StatusBadge status={statusTone(item.status)}>{displayUiValue(item.status, language)}</StatusBadge>
      <StatusBadge
        status={item.sourceType === "Official" ? "positive" : "neutral"}
      >
        {displayUiValue(item.sourceType, language)}
      </StatusBadge>
      <StatusBadge>{language === "zh-CN" ? `${displayUiValue(item.verificationConfidence, language)}置信度` : `${item.verificationConfidence} confidence`}</StatusBadge>
    </div>
  );
}

export function ChinaRecruitingWorkspace() {
  const {
    activeWorkspace,
    importChinaCampusOpportunities,
    updateChinaCampusOpportunity,
    createChinaApplication,
  } = useCareerOS();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const today = new Date().toISOString().slice(0, 10);
  const records = activeWorkspace.chinaCampusOpportunities;
  const active = activeChinaOpportunities(records, today);
  const recommendations = selectTodayRecommendations(records, today);
  const closingSoon = active
    .filter(
      (item) =>
        deriveDeadlineUrgency(item.deadline, today) === "Closing in 7 days",
    )
    .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""));
  const metrics = chinaPipelineMetrics(records, today);
  const reviewQueue = buildChinaReviewQueue(records, chinaInterviewIntelligence, today);
  const [company, setCompany] = useState("All");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [deadline, setDeadline] = useState("All");
  const [resumeVersion, setResumeVersion] = useState("All");
  const [sort, setSort] = useState("Priority");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState(importExample);
  const [forceStatus, setForceStatus] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [editing, setEditing] = useState<ChinaCampusOpportunity | null>(null);

  const visible = records
    .filter(
      (item) =>
        (company === "All" || item.company === company) &&
        (category === "All" || item.category === category) &&
        (location === "All" || item.location === location) &&
        (status === "All" || item.status === status) &&
        (priority === "All" || item.priority === priority) &&
        (resumeVersion === "All" || item.resumeVersion === resumeVersion) &&
        (deadline === "All" ||
          deriveDeadlineUrgency(item.deadline, today) === deadline),
    )
    .sort((a, b) => {
      if (sort === "Fit Score") return b.fitScore - a.fitScore;
      if (sort === "Deadline")
        return (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");
      if (sort === "Updated Date")
        return b.updatedAt.localeCompare(a.updatedAt);
      return priorities.indexOf(a.priority) - priorities.indexOf(b.priority);
    });

  function updateStatus(
    item: ChinaCampusOpportunity,
    next: ChinaRecruitingStatus,
  ) {
    updateChinaCampusOpportunity({
      ...item,
      status: next,
      deadlineUrgency: deriveDeadlineUrgency(item.deadline, today),
      updatedAt: new Date().toISOString(),
    });
  }

  function submitImport() {
    const result = importChinaCampusOpportunities(importText, forceStatus);
    setImportMessage(result.message);
    if (result.ok && result.inserted + result.updated > 0) setImportOpen(false);
  }

  const empty = (
    <p className="text-sm text-[var(--text-secondary)]">
      {zh
        ? "暂无符合条件的已导入岗位。"
        : "No imported opportunities match this section."}
    </p>
  );
  return (
    <div className="page-enter">
      <PageHeading
        eyebrow={
          zh
            ? "中国秋招 · 本地追踪"
            : "China campus recruiting · Local tracking"
        }
        title={zh ? "中国秋招" : "China Campus Recruiting"}
        description={
          zh
            ? `属于 ${activeWorkspace.profile.preferredName} 的岗位、投递、OA 和面试工作区。目标公司不会被计为活跃岗位。`
            : `Opportunity, application, OA and interview tracking for ${activeWorkspace.profile.preferredName}. Tracking targets never count as active jobs.`
        }
        action={
          <Button onClick={() => setImportOpen(true)}>
            {zh ? "导入 JSON" : "Import JSON"}
          </Button>
        }
      />

      <section className="mb-8" aria-labelledby="china-today-heading">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">{zh ? "今天" : "Today"}</p>
            <h2
              id="china-today-heading"
              className="mt-1 font-display text-2xl font-medium"
            >
              {zh ? "今天优先投递" : "Apply today"}
            </h2>
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">
            {recommendations.length}/5
          </span>
        </div>
        {recommendations.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {recommendations.map((item) => (
              <article key={item.id} className="surface-card p-5">
                <OpportunityBadges item={item} language={language} />
                <h3 className="mt-4 font-display text-xl font-medium">
                  {displayCompanyName(item.company, language)} · {item.position}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {item.location} · {displayUiValue(item.category, language)} · {item.resumeVersion}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <strong className="text-[var(--accent)]">
                    {zh ? "预计资料匹配度" : "Fit"} {item.fitScore}%
                  </strong>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {item.deadline ? `${formatDate(item.deadline, language)} · ${formatRelativeDate(item.deadline, language, today)}` : (zh ? "未公开截止日期，建议尽早投递" : "Deadline not published")}
                  </span>
                </div>
                <div className="mt-4 rounded-xl bg-[var(--surface-subtle)] p-4 text-sm">
                  <strong>{zh ? "为什么今天推荐" : "Why today"}</strong>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-secondary)]">
                    <li>{zh ? "当前官方岗位仍开放" : "The official role is currently open"}</li>
                    <li>{zh ? `${displayUiValue(item.roleFamily, language)}方向与你的目标相关` : `${item.roleFamily} aligns with your target roles`}</li>
                    <li>{item.location}</li>
                    <li>{zh ? `最近核验：${formatRelativeDate(item.lastVerifiedAt, language, today)}` : `Last verified ${formatRelativeDate(item.lastVerifiedAt, language, today)}`}</li>
                  </ul>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/china-recruiting/${item.id}`} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--accent)]">{zh ? "查看岗位" : "View role"}</Link>
                  <a href={item.officialApplyLink} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]">{zh ? "官方网站投递" : "Apply"} ↗</a>
                  <Button variant="secondary" onClick={() => createChinaApplication(item.id)}>{zh ? "加入申请" : "Add application"}</Button>
                  <Link href="/gap-analysis" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-[var(--accent)]">{zh ? "差距分析" : "Gap analysis"}</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="surface-card p-6">
            {empty}
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              {zh
                ? "导入真实岗位后会按优先级、匹配、截止日期、状态和来源自动排序。"
                : "Import verified roles to rank them by priority, fit, deadline, status and source."}
            </p>
          </div>
        )}
      </section>

      <section className="surface-card mb-8 p-5">
        <h2 className="font-display text-xl font-medium">
          {zh ? "未来 7 天截止" : "Closing soon"}
        </h2>
        <div className="mt-4">
          {closingSoon.length ? (
            <ul className="divide-y divide-[var(--border)]">
              {closingSoon.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <strong>
                      {displayCompanyName(item.company, language)} · {item.position}
                    </strong>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {item.location} · {item.deadline}
                    </p>
                  </div>
                  <StatusBadge status="warning">{zh ? "7天内截止" : "Closing in 7 days"}</StatusBadge>
                </li>
              ))}
            </ul>
          ) : (
            empty
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 font-display text-xl font-medium">
          {zh ? "申请管道" : "Application pipeline"}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            ["To Apply", metrics.toApply],
            ["Applied", metrics.applied],
            ["OA", metrics.oa],
            ["Interview", metrics.interview],
            ["Offer", metrics.offer],
            ["Rejected", metrics.rejected],
          ].map(([label, value]) => (
            <div key={label} className="surface-card p-4">
              <strong className="font-display text-2xl">{value}</strong>
              <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                {displayUiValue(label as string, language)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="eyebrow">{zh ? "全部中国岗位" : "All China Opportunities"}</p>
          <h2 className="mt-1 font-display text-2xl font-medium">
            {zh ? "全部中国岗位" : "All China opportunities"}
          </h2>
        </div>
        <div className="surface-card mb-5 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Company",
              company,
              setCompany,
              ["All", ...new Set(records.map((item) => item.company))],
            ],
            ["Category", category, setCategory, categories],
            [
              "Location",
              location,
              setLocation,
              ["All", ...new Set(records.map((item) => item.location))],
            ],
            ["Status", status, setStatus, ["All", ...statuses]],
            ["Priority", priority, setPriority, ["All", ...priorities]],
            [
              "Deadline",
              deadline,
              setDeadline,
              [
                "All",
                "Closing in 7 days",
                "Closing in 14 days",
                "Open",
                "Expired",
                "Not published",
              ],
            ],
            ["Résumé", resumeVersion, setResumeVersion, resumeVersions],
            [
              "Sort",
              sort,
              setSort,
              ["Priority", "Fit Score", "Deadline", "Updated Date"],
            ],
          ].map(([label, value, setter, options]) => (
            <Field key={label as string} label={displayUiValue(label as string, language)}>
              <Select
                value={value as string}
                onChange={(event) =>
                  (setter as (value: string) => void)(event.target.value)
                }
              >
                {(options as string[]).map((option) => (
                  <option key={option} value={option}>{displayUiValue(option, language)}</option>
                ))}
              </Select>
            </Field>
          ))}
        </div>
        {visible.length ? (
          <div className="space-y-4">
            {visible.map((item) => (
              <article key={item.id} className="surface-card p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <OpportunityBadges item={item} language={language} />
                    <h3 className="mt-4 font-display text-xl font-medium">
                      {displayCompanyName(item.company, language)} · {item.position}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      {item.location} · {displayUiValue(item.category, language)} · {zh ? "预计资料匹配度" : "Fit"} {item.fitScore}% ·{" "}
                      {item.resumeVersion}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                      {item.deadline ? formatDate(item.deadline, language) : (zh ? "截止日期未公开" : "Deadline not published")} · {zh ? "最近更新" : "Updated"}{" "}
                      {formatDate(item.updatedAt, language)}
                    </p>
                  </div>
                  <div className="flex max-w-xl flex-wrap gap-2">
                    <a
                      href={item.officialApplyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center rounded-xl border border-[var(--border)] px-3.5 text-sm font-semibold text-[var(--accent)]"
                    >
                      {zh ? "官方网站投递" : "Apply"} ↗
                    </a>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => createChinaApplication(item.id)}
                    >
                      {zh ? "加入申请管道" : "Add to pipeline"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus(item, "Applied")}
                    >
                      {zh ? "标记已投递" : "Applied"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus(item, "OA")}
                    >
                      {zh ? "进入笔试" : "OA"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus(item, "Interview")}
                    >
                      {zh ? "进入面试" : "Interview"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus(item, "Offer")}
                    >
                      {zh ? "标记录用" : "Offer"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(item, "Rejected")}
                    >
                      {zh ? "标记未通过" : "Reject"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(item, "Archived")}
                    >
                      {zh ? "归档" : "Archive"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(structuredClone(item))}
                    >
                      {zh ? "笔记" : "Notes"}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="surface-card p-6">{empty}</div>
        )}
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="font-display text-xl font-medium">{zh ? "笔试／在线测评情报" : "OA / Written test intelligence"}</h2>
          <div className="mt-4 space-y-4">
            {chinaAssessmentIntelligence.map((record) => (
              <article key={record.id}>
                <strong>{displayCompanyName(record.company, language)}</strong>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{record.assessmentTypes.map((value) => displayUiValue(value, language)).join(" · ")} · {displayUiValue(record.sourceType, language)} · {displayUiValue(record.confidence, language)}</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{zh ? "历史流程证据，仅供准备参考；不代表当前招聘政策。" : record.notes}</p>
                <a className="mt-2 inline-block text-sm font-semibold text-[var(--accent)]" href={record.sourceUrl} target="_blank" rel="noreferrer">{zh ? "查看来源" : "Source"} ↗</a>
              </article>
            ))}
          </div>
        </div>
        <div className="surface-card p-5">
          <h2 className="font-display text-xl font-medium">{zh ? "面试情报" : "Interview intelligence"}</h2>
          <div className="mt-4 space-y-4">
            {chinaInterviewIntelligence.map((record) => (
              <article key={record.id}>
                <strong>{displayCompanyName(record.company, language)}</strong>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{record.likelyStages.join(" → ")}</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{displayUiValue(record.sourceType, language)} · {displayUiValue(record.confidence, language)} · {zh ? "具体轮次和内容可能因岗位与团队而异。" : record.notes}</p>
                <a className="mt-2 inline-block text-sm font-semibold text-[var(--accent)]" href={record.sourceUrl} target="_blank" rel="noreferrer">{zh ? "查看来源" : "Source"} ↗</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card mt-10 p-5">
        <h2 className="font-display text-xl font-medium">{zh ? "数据复核队列" : "Data review queue"}</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{zh ? "当前岗位每 3–7 天复核；即将截止岗位每天复核；历史面试情报每 90 天复核。" : "Current roles are reviewed every 3–7 days, closing roles daily, and historical interview evidence every 90 days."}</p>
        <ul className="mt-4 divide-y divide-[var(--border)]">{reviewQueue.slice(0, 8).map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span className="text-sm">{item.label}</span><span className={item.overdue ? "text-sm font-medium text-[var(--danger)]" : "text-sm text-[var(--text-secondary)]"}>{item.overdue ? (zh ? "已到复核时间" : "Review due") : formatDate(item.nextReviewDate, language)} · {zh ? `频率 ${item.cadence}` : item.cadence}</span></li>)}</ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-medium">
          {zh ? "目标公司" : "Tracking targets"}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {zh
            ? `以下 ${chinaTrackingTargets.length} 家公司仅用于关注招聘来源，不代表存在活跃岗位。`
            : `These ${chinaTrackingTargets.length} companies are tracking sources only, not active opportunities.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {chinaTrackingTargets.map((target) =>
            target.officialRecruitingUrl ? (
              <a
                key={target.id}
                href={target.officialRecruitingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center rounded-full border border-[var(--border)] px-3 text-sm hover:border-[var(--accent)]"
              >
                {displayCompanyName(target.company, language)} ↗
              </a>
            ) : (
              <span
                key={target.id}
                className="inline-flex min-h-10 items-center rounded-full bg-[var(--surface-subtle)] px-3 text-sm text-[var(--text-secondary)]"
              >
                {displayCompanyName(target.company, language)}
              </span>
            ),
          )}
        </div>
      </section>

      <Dialog
        open={importOpen}
        title={zh ? "导入中国岗位 JSON" : "Import China opportunity JSON"}
        description={
          zh
            ? "支持单条记录或数组；重复记录更新来源和截止日期，默认保留用户状态。"
            : "Accepts one record or an array. Duplicates update sources and deadlines while preserving user status by default."
        }
        onClose={() => setImportOpen(false)}
      >
        <div className="space-y-4">
          <Textarea
            aria-label="China opportunity JSON"
            className="min-h-80 font-mono text-xs"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
          />
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={forceStatus}
              onChange={(event) => setForceStatus(event.target.checked)}
            />
            {zh ? "显式强制更新已有状态" : "Explicitly force status updates"}
          </label>
          {importMessage && (
            <p role="status" className="text-sm text-[var(--text-secondary)]">
              {importMessage}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setImportOpen(false)}>
              {zh ? "取消" : "Cancel"}
            </Button>
            <Button onClick={submitImport}>{zh ? "导入" : "Import"}</Button>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={editing !== null}
        title={zh ? "编辑备注" : "Edit notes"}
        description={
          editing ? `${displayCompanyName(editing.company, language)} · ${editing.position}` : undefined
        }
        onClose={() => setEditing(null)}
      >
        {editing && (
          <div className="space-y-4">
            <Textarea
              value={editing.notes}
              onChange={(event) =>
                setEditing({ ...editing, notes: event.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                {zh ? "取消" : "Cancel"}
              </Button>
              <Button
                onClick={() => {
                  updateChinaCampusOpportunity({
                    ...editing,
                    updatedAt: new Date().toISOString(),
                  });
                  setEditing(null);
                }}
              >
                {zh ? "保存笔记" : "Save notes"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { careerKnowledgeGraph } from "@/data/graph";
import { gapTargets, analyseCareerGap } from "@/lib/gap-analysis/engine";
import type { CareerRequirement, GapStatus } from "@/lib/gap-analysis/types";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";

const statusStyle: Record<GapStatus, "positive" | "active" | "warning" | "danger"> = {
  confirmed: "positive",
  unknown: "warning",
  missing: "active",
  blocked: "danger",
};

function RequirementList({ title, items, zh }: { title: string; items: CareerRequirement[]; zh: boolean }) {
  return <section className="surface-card p-5"><h2 className="font-display text-lg font-medium">{title}</h2>{items.length === 0 ? <p className="mt-3 text-sm text-[var(--text-secondary)]">{zh ? "没有项目。" : "No items."}</p> : <ul className="mt-3 space-y-3">{items.map((item) => <li key={item.id} className="rounded-xl border border-[var(--border)] p-4"><div className="flex flex-wrap gap-2"><StatusBadge status={statusStyle[item.status]}>{item.status}</StatusBadge><StatusBadge>{item.importance}</StatusBadge></div><p className="mt-3 font-medium">{item.label}</p><p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{item.explanation}</p></li>)}</ul>}</section>;
}

export function GapAnalysisWorkspace() {
  const { state, activeWorkspace, setActiveProfileId, updateProfile, upsertRoadmapItem } = useCareerOS();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const availableTargets = gapTargets.filter((target) => target.profileIds.includes(activeWorkspace.profile.id));
  const [selectedByProfile, setSelectedByProfile] = useState<Record<string, string>>({});
  const selectedTarget = selectedByProfile[activeWorkspace.profile.id] ?? availableTargets[0]?.id ?? gapTargets[0].id;
  const analysis = analyseCareerGap(activeWorkspace, selectedTarget);
  const sources = analysis.evidenceSourceIds
    .map((id) => careerKnowledgeGraph.sources.find((source) => source.id === id))
    .filter(Boolean);

  function addAction(action: (typeof analysis.recommendedNextActions)[number]) {
    upsertRoadmapItem({
      id: `gap-${activeWorkspace.profile.id}-${action.relatedGapId}`,
      profileId: activeWorkspace.profile.id,
      title: action.title,
      description: action.reason,
      category: action.relatedGapId === "registration" ? "Registration" : action.relatedGapId.includes("interview") ? "Interview" : "Other",
      targetDate: action.dueDate,
      status: action.status,
      priority: action.priority,
    });
  }

  return (
    <div className="page-enter">
      <PageHeading
        eyebrow={zh ? "可解释的职业准备度" : "Explainable career readiness"}
        title={zh ? "职业差距分析" : "Career gap analysis"}
        description={zh ? "使用当前档案中已保存的事实进行确定性分析。未知信息保持未知，不会被判定为失败。" : "A deterministic analysis using facts stored in the selected profile. Unknown information stays unknown and is never silently treated as failure."}
      />
      <section className="surface-card mb-6 grid gap-4 p-5 md:grid-cols-2">
        <Field label={zh ? "用户档案" : "User profile"}><Select value={activeWorkspace.profile.id} onChange={(event) => setActiveProfileId(event.target.value)}>{Object.values(state.profiles).map((workspace) => <option key={workspace.profile.id} value={workspace.profile.id}>{workspace.profile.displayName}</option>)}</Select></Field>
        <Field label={zh ? "目标职业或岗位" : "Target career or role"}><Select value={selectedTarget} onChange={(event) => setSelectedByProfile((current) => ({ ...current, [activeWorkspace.profile.id]: event.target.value }))}>{availableTargets.map((target) => <option key={target.id} value={target.id}>{target.name}</option>)}</Select></Field>
      </section>

      <section className="surface-card mb-6 p-6">
        <div className="grid gap-6 md:grid-cols-[12rem_1fr] md:items-center">
          <div><p className="text-sm font-medium text-[var(--text-secondary)]">{zh ? "准备度" : "Readiness"}</p><p className="mt-1 font-display text-5xl font-semibold text-[var(--accent)]">{analysis.overallReadinessScore}%</p><p className="mt-2 text-sm">{zh ? "置信度" : "Confidence"}: <strong>{analysis.confidence}</strong></p></div>
          <div><h2 className="font-display text-2xl font-medium">{analysis.targetName}</h2><ul className="mt-3 space-y-1 text-sm leading-6 text-[var(--text-secondary)]">{analysis.scoreExplanation.map((line) => <li key={line}>• {line}</li>)}</ul></div>
        </div>
      </section>
      <section className="surface-card mb-6 p-5" aria-labelledby="score-method-heading">
        <h2 id="score-method-heading" className="font-display text-lg font-medium">{zh ? "这个分数代表什么" : "What this score means"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs text-[var(--text-tertiary)]">{zh ? "衡量内容" : "Measures"}</p><p className="mt-1 text-sm">{zh ? "当前档案对这个精确目标的规划准备度。" : "Planning readiness for this exact target using stored profile facts."}</p></div>
          <div><p className="text-xs text-[var(--text-tertiary)]">{zh ? "不衡量" : "Does not measure"}</p><p className="mt-1 text-sm">{zh ? "就业能力、录用概率或雇主判断。" : "Employability, hiring probability or an employer decision."}</p></div>
          <div><p className="text-xs text-[var(--text-tertiary)]">{zh ? "证据与未知项" : "Evidence and unknowns"}</p><p className="mt-1 text-sm">{analysis.evidenceCount} {zh ? "项已确认" : "confirmed"} · {analysis.unknownCount} {zh ? "项未知" : "unknown"}</p></div>
          <div><p className="text-xs text-[var(--text-tertiary)]">{zh ? "分数上限" : "Score cap"}</p><p className="mt-1 text-sm">{analysis.scoreCap}% · {analysis.scoreCapReason}</p></div>
        </div>
      </section>

      <section className="surface-card mb-6 p-5">
        <h2 className="font-display text-lg font-medium">{zh ? "可编辑的关键档案事实" : "Editable profile facts"}</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{zh ? "仅保存你明确输入的事实。" : "Only facts you explicitly enter are saved."}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label={zh ? "预计毕业／完成日期" : "Expected completion date"}><Input type="date" value={activeWorkspace.profile.expectedGraduationDate} onChange={(event) => updateProfile({ ...activeWorkspace.profile, expectedGraduationDate: event.target.value })} /></Field>
          <Field label={zh ? "工作资格" : "Work eligibility"}><Input value={activeWorkspace.profile.workEligibility} onChange={(event) => updateProfile({ ...activeWorkspace.profile, workEligibility: event.target.value })} /></Field>
          <Field label={zh ? "注册状态" : "Registration status"}><Input value={activeWorkspace.profile.registrationStatus} onChange={(event) => updateProfile({ ...activeWorkspace.profile, registrationStatus: event.target.value })} /></Field>
        </div>
        <Link href="/profiles" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">{zh ? "编辑完整档案" : "Edit full profile"} →</Link>
      </section>

      {analysis.blockers.length > 0 && <div className="mb-6"><RequirementList title={zh ? "阻碍与必须确认项" : "Blockers and required confirmations"} items={analysis.blockers} zh={zh} /></div>}
      <div className="grid gap-5 lg:grid-cols-3">
        <RequirementList title={zh ? "已确认" : "Confirmed"} items={analysis.matchedRequirements} zh={zh} />
        <RequirementList title={zh ? "缺少" : "Missing"} items={analysis.missingRequirements} zh={zh} />
        <RequirementList title={zh ? "未知" : "Unknown"} items={analysis.unknownRequirements} zh={zh} />
      </div>

      <section className="mt-6" aria-labelledby="actions-heading">
        <div className="mb-3 flex items-end justify-between gap-4"><h2 id="actions-heading" className="font-display text-xl font-medium">{zh ? "优先行动计划" : "Prioritised action plan"}</h2><Link href="/roadmap" className="text-sm font-medium text-[var(--accent)]">{zh ? "打开职业规划" : "Open career roadmap"} →</Link></div>
        <div className="grid gap-4 md:grid-cols-2">{analysis.recommendedNextActions.map((action) => <article key={action.id} className="surface-card p-5"><div className="flex flex-wrap gap-2"><StatusBadge status={action.priority === "High" ? "active" : "neutral"}>{action.priority}</StatusBadge><StatusBadge>{action.window}</StatusBadge></div><h3 className="mt-3 font-medium">{action.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{action.reason}</p><p className="mt-3 text-xs text-[var(--text-tertiary)]">{zh ? "预计投入" : "Estimated effort"}: {action.estimatedEffort}</p><Button className="mt-4" size="sm" variant="secondary" onClick={() => addAction(action)}>{zh ? "加入职业规划" : "Add to roadmap"}</Button></article>)}</div>
      </section>

      <section className="surface-card mt-6 p-5">
        <h2 className="font-display text-lg font-medium">{zh ? "来源证据" : "Source evidence"}</h2>
        <ul className="mt-3 divide-y divide-[var(--border)]">{sources.map((source) => source && <li key={source.id} className="py-3"><a href={source.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">{source.label} ↗</a><p className="text-xs text-[var(--text-tertiary)]">{source.sourceType} · {source.lastVerified}</p></li>)}</ul>
      </section>
    </div>
  );
}

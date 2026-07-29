"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  australianChiropracticRegistration,
  canberraChiropracticEmployers,
  chiropracticInterviewQuestions,
  chiropracticVacancies,
} from "@/data/verified/chiropractic";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import { TOMMY_ID } from "@/data/seed";

type View = "registration" | "readiness" | "employers" | "vacancies" | "interview";

export function ChiropracticCareerHub() {
  const { activeWorkspace } = useCareerOS();
  const { language } = useLanguage();
  const [view, setView] = useState<View>("registration");
  const zh = language === "zh-CN";
  const isTommy = activeWorkspace.profile.id === TOMMY_ID;
  const checklist = useMemo(
    () => activeWorkspace.roadmapItems.filter((item) => item.category === "Registration"),
    [activeWorkspace.roadmapItems],
  );
  const currentVacancies = chiropracticVacancies.filter((record) => record.verificationStatus === "Current");

  const tabs: Array<{ id: View; en: string; zh: string }> = [
    { id: "registration", en: "Registration", zh: "注册路径" },
    { id: "readiness", en: "Readiness", zh: "职业准备" },
    { id: "employers", en: "ACT employers", zh: "ACT 雇主" },
    { id: "vacancies", en: "Vacancies", zh: "职位" },
    { id: "interview", en: "Interview", zh: "面试准备" },
  ];

  return (
    <div className="page-enter">
      <PageHeading
        eyebrow={zh ? "澳大利亚职业注册" : "Australian professional registration"}
        title={zh ? "脊椎按摩职业中心" : "Chiropractic career hub"}
        description={zh
          ? "面向 Tommy 的官方注册路径、Canberra/ACT 诊所名录、职位核验和职业准备。未知信息保持未知。"
          : "An official-source registration pathway, Canberra/ACT employer directory, vacancy verification and readiness workspace for Tommy. Unknown information stays unknown."}
      />

      {!isTommy && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm text-[var(--text-secondary)]">
          {zh ? "当前不是 Tommy 资料。此页面仍可阅读，但职业准备清单只属于 Tommy。" : "Tommy is not the active profile. The guidance remains readable, but the readiness checklist belongs only to Tommy."}
        </div>
      )}

      <div className="mb-7 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={zh ? "脊椎按摩职业信息" : "Chiropractic career information"}>
        {tabs.map((tab) => (
          <Button key={tab.id} size="sm" variant={view === tab.id ? "primary" : "secondary"} role="tab" aria-selected={view === tab.id} onClick={() => setView(tab.id)}>
            {zh ? tab.zh : tab.en}
          </Button>
        ))}
      </div>

      {view === "registration" && (
        <div className="space-y-6">
          <section className="surface-card p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="positive">{zh ? "官方来源已核验" : "Official sources verified"}</StatusBadge>
              <Badge>{zh ? "必须注册" : "Registration required"}</Badge>
            </div>
            <h2 className="mt-4 font-display text-2xl font-medium">{australianChiropracticRegistration.profession}</h2>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-[var(--text-tertiary)]">{zh ? "监管机构" : "Regulator"}</dt><dd className="mt-1 font-medium">{australianChiropracticRegistration.regulator}</dd></div>
              <div><dt className="text-[var(--text-tertiary)]">{zh ? "行政机构" : "Administration"}</dt><dd className="mt-1 font-medium">{australianChiropracticRegistration.administrationBody}</dd></div>
              <div><dt className="text-[var(--text-tertiary)]">{zh ? "费用" : "Cost"}</dt><dd className="mt-1">{australianChiropracticRegistration.estimatedCost ?? (zh ? "未在本次核验中确认" : "Not confirmed in this review")}</dd></div>
              <div><dt className="text-[var(--text-tertiary)]">{zh ? "处理时间" : "Processing time"}</dt><dd className="mt-1">{australianChiropracticRegistration.processingTime ?? (zh ? "因个人情况而异，未作推测" : "Varies by application; not inferred")}</dd></div>
            </dl>
          </section>
          <div className="grid gap-4 lg:grid-cols-2">
            {australianChiropracticRegistration.requirements.map((requirement) => (
              <article key={requirement.label} className="surface-card p-5">
                <h3 className="font-medium">{requirement.label}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{requirement.detail}</p>
                <a href={requirement.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">
                  {zh ? "查看官方要求" : "Open official requirement"} ↗
                </a>
              </article>
            ))}
          </div>
          <section className="surface-card border-dashed p-5">
            <h3 className="font-medium">{zh ? "仍需 Tommy 确认" : "Tommy still needs to confirm"}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
              {australianChiropracticRegistration.uncertaintyNotes.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </section>
        </div>
      )}

      {view === "readiness" && (
        <section className="surface-card p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><h2 className="font-display text-2xl font-medium">{zh ? "脊椎按摩职业准备清单" : "Chiropractic career readiness"}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{zh ? "所有项目默认未开始；可在职业规划中编辑状态、备注和目标日期。" : "Every item starts incomplete. Edit status, notes and target dates in Roadmap."}</p></div>
            <Link href="/roadmap" className="inline-flex min-h-11 items-center font-medium text-[var(--accent)]">{zh ? "打开职业规划" : "Open roadmap"} →</Link>
          </div>
          {isTommy ? <div className="mt-6 grid gap-3 md:grid-cols-2">{checklist.map((item) => <article key={item.id} className="rounded-xl border border-[var(--border)] p-4"><StatusBadge>{item.status}</StatusBadge><h3 className="mt-3 font-medium">{item.title}</h3>{item.targetDate && <p className="mt-2 text-xs text-[var(--text-tertiary)]">{item.targetDate}</p>}</article>)}</div> : <p className="mt-6 text-sm text-[var(--text-secondary)]">{zh ? "切换到 Tommy 资料后查看清单。" : "Switch to Tommy to view his checklist."}</p>}
        </section>
      )}

      {view === "employers" && (
        <div className="grid gap-4 md:grid-cols-2">
          {canberraChiropracticEmployers.map((employer) => (
            <article key={employer.id} className="surface-card p-5">
              <div className="flex flex-wrap gap-2"><StatusBadge status="positive">{zh ? "官网已核验" : "Official website verified"}</StatusBadge><Badge>{employer.stateOrTerritory}</Badge></div>
              <h2 className="mt-4 font-display text-xl font-medium">{employer.organisationName}</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{employer.suburb} · {employer.serviceFocus}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{employer.dataNotes}</p>
              <a href={employer.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center font-medium text-[var(--accent)]">{zh ? "访问诊所官网" : "Visit clinic website"} ↗</a>
            </article>
          ))}
        </div>
      )}

      {view === "vacancies" && (
        <div className="space-y-6">
          {currentVacancies.length === 0 && <div className="surface-card border-dashed p-8 text-center"><h2 className="font-display text-xl font-medium">{zh ? "目前没有已核验的在招职位" : "No currently verified vacancies"}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{zh ? "过期搜索结果不会显示为正在招聘。" : "Stale search results are never presented as open roles."}</p></div>}
          <section><h2 className="mb-4 font-display text-xl font-medium">{zh ? "已归档线索" : "Archived leads"}</h2><div className="grid gap-4 md:grid-cols-2">{chiropracticVacancies.map((vacancy) => <article key={vacancy.id} className="surface-card p-5 opacity-80"><StatusBadge>{vacancy.verificationStatus}</StatusBadge><h3 className="mt-4 font-medium">{vacancy.exactTitle}</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">{vacancy.employer} · {vacancy.location}</p><p className="mt-3 text-xs leading-5 text-[var(--text-tertiary)]">{vacancy.dataNotes}</p></article>)}</div></section>
        </div>
      )}

      {view === "interview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {chiropracticInterviewQuestions.map((item) => (
            <article key={item.id} className="surface-card p-5">
              <div className="flex flex-wrap gap-2"><Badge>{item.category}</Badge><StatusBadge status="positive">{zh ? "专业指导" : "Professional guidance"}</StatusBadge></div>
              <h2 className="mt-4 font-display text-xl font-medium leading-snug">{item.question}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{item.whyAsked}</p>
              <h3 className="mt-5 text-sm font-medium">{zh ? "回答框架" : "Answer framework"}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">{item.answerFramework.map((step) => <li key={step}>{step}</li>)}</ul>
              <a href={item.officialUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">{zh ? "查看来源" : "Open source"} ↗</a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

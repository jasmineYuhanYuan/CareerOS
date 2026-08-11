"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { chinaAssessmentIntelligence, chinaInterviewIntelligence } from "@/data/china-recruiting/intelligence";
import { formatDate } from "@/i18n/format";
import { displayCompanyName, displayUiValue } from "@/i18n/presentation";
import { calculateChinaPriority } from "@/lib/china-recruiting";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";

export function ChinaOpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { activeWorkspace, createChinaApplication } = useCareerOS();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const item = activeWorkspace.chinaCampusOpportunities.find((record) => record.id === id);
  if (!item) return <div className="page-enter"><PageHeading title={zh ? "未找到岗位" : "Opportunity not found"} description={zh ? "该岗位不在当前资料的本地数据中。" : "This role is not stored in the active profile."} /><Link href="/china-recruiting" className="text-[var(--accent)]">{zh ? "返回中国秋招" : "Back to China Recruiting"}</Link></div>;
  const assessment = chinaAssessmentIntelligence.filter((record) => record.company.includes(item.company.split(" / ")[0]) || item.company.includes(record.company.split(" / ")[0]));
  const interviews = chinaInterviewIntelligence.filter((record) => record.company.includes(item.company.split(" / ")[0]) || item.company.includes(record.company.split(" / ")[0]));
  const priority = calculateChinaPriority(item);
  return <div className="page-enter">
    <PageHeading eyebrow={zh ? "已核验中国岗位" : "Verified China opportunity"} title={item.position} description={`${displayCompanyName(item.company, language)} · ${item.location}`} />
    <div className="mb-6 flex flex-wrap gap-2"><StatusBadge status="positive">{zh ? "官方来源" : "Official source"}</StatusBadge><StatusBadge>{displayUiValue(item.verificationStatus, language)}</StatusBadge><StatusBadge>{displayUiValue(item.recruitingBatch, language)}</StatusBadge><StatusBadge>{zh ? `高置信度` : `${item.verificationConfidence} confidence`}</StatusBadge></div>
    <div className="grid gap-5 xl:grid-cols-3">
      <section className="surface-card p-6 xl:col-span-2"><p className="eyebrow">{zh ? "官方职位信息" : "Official job information"}</p><h2 className="mt-2 font-display text-2xl">{zh ? "岗位概览" : "Role overview"}</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2">{[
        [zh ? "公司" : "Company", displayCompanyName(item.company, language)], [zh ? "业务组" : "Business unit", item.businessUnit ?? (zh ? "未公开" : "Not published")],
        [zh ? "地点" : "Location", item.location], [zh ? "招聘批次" : "Recruiting batch", displayUiValue(item.recruitingBatch, language)],
        [zh ? "目标毕业年份" : "Target graduation year", item.targetGraduationYear ?? (zh ? "未公开" : "Not published")], [zh ? "截止日期" : "Deadline", item.deadline ? formatDate(item.deadline, language) : (zh ? "未公开" : "Not published")],
        [zh ? "发布时间" : "Published", item.publishedDate ? formatDate(item.publishedDate, language) : (zh ? "未公开" : "Not published")], [zh ? "招聘人数" : "Headcount", item.headcount == null ? (zh ? "未公开" : "Not published") : String(item.headcount)],
      ].map(([label, value]) => <div key={label}><dt className="text-xs text-[var(--text-tertiary)]">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl>
      <h3 className="mt-7 font-medium">{zh ? "工作职责" : "Responsibilities"}</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[var(--text-secondary)]">{(item.responsibilities ?? []).map((value) => <li key={value}>{value}</li>)}</ul>
      <h3 className="mt-7 font-medium">{zh ? "任职要求" : "Requirements"}</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[var(--text-secondary)]">{(item.requirements ?? []).map((value) => <li key={value}>{value}</li>)}</ul></section>
      <aside className="surface-card p-6"><p className="eyebrow">CareerOS {zh ? "分析" : "analysis"}</p><h2 className="mt-2 font-display text-2xl">{zh ? "申请准备" : "Application readiness"}</h2><p className="mt-5 text-3xl font-semibold text-[var(--accent)]">{item.fitScore}%</p><p className="text-sm text-[var(--text-secondary)]">{zh ? "预计资料匹配度" : "Estimated profile match"}</p><p className="mt-4 font-medium">{zh ? "优先分" : "Priority score"} {priority.score}</p><h3 className="mt-6 font-medium">{zh ? "为什么适合你" : "Why it may fit"}</h3><p className="mt-2 text-sm text-[var(--text-secondary)]">{zh ? `${displayUiValue(item.roleFamily, language)}方向与 Yuhan 当前产品和技术目标相关。` : `${item.roleFamily} is relevant to Yuhan's current product and technology goals.`}</p><h3 className="mt-6 font-medium">{zh ? "需要确认" : "Needs confirmation"}</h3><p className="mt-2 text-sm text-[var(--text-secondary)]">{zh ? "毕业资格、到岗时间、简历准备度及岗位是否仍接受申请。" : "Graduation eligibility, availability, résumé readiness and whether applications remain open."}</p></aside>
    </div>
    <section className="surface-card mt-5 p-6"><p className="eyebrow">{zh ? "笔试／面试" : "OA / interview"}</p>{assessment.length === 0 && interviews.length === 0 ? <p className="mt-3 text-sm text-[var(--text-secondary)]">{zh ? "暂无与该岗位对应的可靠公开流程；不会根据其他公司的经验推断。" : "No reliable role-specific public process is recorded."}</p> : <p className="mt-3 text-sm text-[var(--text-secondary)]">{zh ? "以下信息按证据类型独立标注，流程可能因岗位和团队而异。" : "Evidence is labelled separately and may vary by role and team."}</p>}</section>
    <section className="surface-card mt-5 p-6"><p className="eyebrow">{zh ? "数据来源" : "Data source"}</p><p className="mt-3 text-sm">{item.sourceName}</p><p className="mt-1 text-sm text-[var(--text-secondary)]">{zh ? "最近核验" : "Last verified"}：{formatDate(item.lastVerifiedAt, language)}</p><p className="mt-2 text-sm text-[var(--text-secondary)]">{item.notes}</p></section>
    <div className="mt-6 flex flex-wrap gap-3"><a href={item.officialApplyLink} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white">{zh ? "立即投递" : "Apply now"} ↗</a><Button variant="secondary" onClick={() => createChinaApplication(item.id)}>{zh ? "加入申请" : "Add application"}</Button><Link href="/gap-analysis" className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-[var(--accent)]">{zh ? "差距分析" : "Gap analysis"}</Link><Link href="/china-recruiting" className="inline-flex min-h-11 items-center px-4 text-sm text-[var(--text-secondary)]">{zh ? "返回列表" : "Back to list"}</Link></div>
  </div>;
}

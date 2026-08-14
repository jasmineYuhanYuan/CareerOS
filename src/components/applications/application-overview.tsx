import { Input, Select } from "@/components/ui/form-field";
import { displayUiValue } from "@/i18n/presentation";
import type { ApplicationAnalytics } from "@/lib/application-pipeline";
import type { AppLocale, ApplicationStatus } from "@/types/domain";

interface ApplicationFiltersProps {
  language: AppLocale;
  query: string;
  status: string;
  statuses: ApplicationStatus[];
  view: "Board" | "List";
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onViewChange: (value: "Board" | "List") => void;
}

export function ApplicationFilters({
  language,
  query,
  status,
  statuses,
  view,
  onQueryChange,
  onStatusChange,
  onViewChange,
}: ApplicationFiltersProps) {
  const zh = language === "zh-CN";
  return (
    <div className="surface-card mb-7 flex flex-col gap-3 p-4 sm:flex-row">
      <label className="flex-1">
        <span className="sr-only">
          {zh ? "搜索申请" : "Search applications"}
        </span>
        <Input
          type="search"
          placeholder={zh ? "搜索机构或岗位" : "Search organisation or role"}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <Select
        aria-label={zh ? "筛选申请状态" : "Filter application status"}
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="sm:max-w-48"
      >
        <option value="All">{displayUiValue("All", language)}</option>
        {statuses.map((value) => (
          <option key={value} value={value}>
            {displayUiValue(value, language)}
          </option>
        ))}
      </Select>
      <div
        className="hidden rounded-xl bg-[var(--surface-subtle)] p-1 md:flex"
        aria-label={zh ? "申请视图" : "Application view"}
      >
        {(["Board", "List"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={view === mode}
            onClick={() => onViewChange(mode)}
            className={`min-h-10 flex-1 rounded-lg px-4 text-sm font-medium ${view === mode ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm" : "text-[var(--text-secondary)]"}`}
          >
            {displayUiValue(mode, language)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ApplicationMetrics({
  analytics,
  language,
}: {
  analytics: ApplicationAnalytics;
  language: AppLocale;
}) {
  const zh = language === "zh-CN";
  const metrics: Array<[string, number]> = [
    ["Submitted", analytics.submitted],
    ["Awaiting response", analytics.awaitingResponse],
    ["Interviews", analytics.interviews],
    ["Offers", analytics.offers],
    ["Rejections", analytics.rejections],
  ];
  return (
    <>
    <section
      aria-label={zh ? "申请统计" : "Application analytics"}
      className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      {metrics.map(([label, value]) => (
        <div key={label} className="surface-card p-4">
          <strong className="font-display text-2xl">{value}</strong>
          <span className="mt-1 block text-xs text-[var(--text-secondary)]">
            {displayUiValue(label, language)}
          </span>
        </div>
      ))}
      <p className="text-xs text-[var(--text-tertiary)] sm:col-span-2 lg:col-span-5">
        {zh
          ? "统计仅使用用户创建的记录；至少有三段有效回复时间后才显示平均回复时长。"
          : "Counts use user-created records only. Average response time remains hidden until at least three valid response intervals exist."}
      </p>
    </section>
    <section className="mb-7 overflow-x-auto rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)]" aria-label={zh ? "申请来源转化" : "Application source conversion"}>
      <div className="border-b border-[var(--border)] p-4"><h2 className="font-display text-lg font-medium">{zh ? "渠道表现" : "Source performance"}</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">{zh ? "面试率和 Offer 率按该渠道全部申请计算，并包含历史已到达阶段。" : "Interview and offer rates use all applications from each source and include stages reached in history."}</p></div>
      {analytics.sourcePerformance.length ? <table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-[var(--surface-subtle)] text-xs text-[var(--text-secondary)]"><tr><th className="p-3">{zh ? "来源" : "Source"}</th><th className="p-3">{zh ? "申请" : "Applications"}</th><th className="p-3">{zh ? "进入面试" : "Interviews"}</th><th className="p-3">{zh ? "面试率" : "Interview rate"}</th><th className="p-3">{zh ? "Offer 率" : "Offer rate"}</th></tr></thead><tbody>{analytics.sourcePerformance.map((row) => <tr key={row.source} className="border-t border-[var(--border)]"><td className="p-3 font-medium">{displayUiValue(row.source, language)}</td><td className="p-3">{row.applications}</td><td className="p-3">{row.interviews}</td><td className="p-3">{row.interviewRate}%</td><td className="p-3">{row.offerRate}%</td></tr>)}</tbody></table> : <p className="p-4 text-sm text-[var(--text-secondary)]">{zh ? "添加申请来源后显示渠道统计。" : "Source analytics appear after applications are added."}</p>}
    </section>
    </>
  );
}

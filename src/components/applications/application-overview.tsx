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
  );
}

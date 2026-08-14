import type { ReactNode } from "react";

export function StatusBadge({
  children,
  status = "neutral",
}: {
  children: ReactNode;
  status?: "neutral" | "active" | "positive" | "warning" | "danger" | "purple" | "orange";
}) {
  const styles = {
    neutral: "bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
    active: "bg-[var(--surface-subtle)] text-[var(--text-primary)]",
    positive: "bg-[var(--success-soft)] text-[var(--success)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${styles[status]}`}>{children}</span>;
}

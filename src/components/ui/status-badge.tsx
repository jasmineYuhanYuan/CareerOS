import type { ReactNode } from "react";

export function StatusBadge({
  children,
  status = "neutral",
}: {
  children: ReactNode;
  status?: "neutral" | "active" | "positive" | "warning" | "danger";
}) {
  const styles = {
    neutral: "bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
    active: "bg-[var(--accent-soft)] text-[var(--accent)]",
    positive: "bg-[var(--success-soft)] text-[var(--success)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${styles[status]}`}>{children}</span>;
}

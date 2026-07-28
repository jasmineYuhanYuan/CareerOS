import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "orange" | "blue" }) {
  const styles = {
    neutral: "bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
    green: "bg-[var(--success-soft)] text-[var(--success)]",
    orange: "bg-[var(--accent-soft)] text-[var(--accent)]",
    blue: "bg-[var(--surface-subtle)] text-[var(--text-primary)]",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${styles[tone]}`}>{children}</span>;
}

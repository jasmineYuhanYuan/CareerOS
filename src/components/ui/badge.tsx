import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" }) {
  const styles = {
    neutral: "bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
    green: "bg-[var(--success-soft)] text-[var(--success)]",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${styles[tone]}`}>{children}</span>;
}

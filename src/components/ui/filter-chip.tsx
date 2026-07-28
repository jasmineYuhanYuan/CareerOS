import type { ButtonHTMLAttributes } from "react";

export function FilterChip({
  active,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      {...props}
      className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
      } ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

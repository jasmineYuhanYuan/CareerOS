import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function Card({ children, className = "", title, eyebrow, action }: CardProps) {
  return (
    <section className={`surface-card p-5 sm:p-6 ${className}`}>
      {(title || eyebrow || action) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">{eyebrow}</p>}
            {title && <h2 className="font-display text-xl font-medium tracking-[-0.025em]">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

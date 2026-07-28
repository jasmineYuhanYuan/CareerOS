import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="font-display text-xl font-medium tracking-[-0.03em] sm:text-[1.35rem]">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-secondary)]">{description}</p>}
      </div>
      {action}
    </header>
  );
}

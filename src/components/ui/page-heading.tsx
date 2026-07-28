import type { ReactNode } from "react";

interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeading({ eyebrow, title, description, action }: PageHeadingProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 page-enter sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-2.5">{eyebrow}</p>}
        <h1 className="font-display text-[1.8rem] font-medium leading-[1.16] tracking-[-0.045em] sm:text-[2.35rem]">{title}</h1>
        <p className="mt-3 max-w-2xl text-[0.95rem] leading-7 text-[var(--text-secondary)] sm:text-base">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

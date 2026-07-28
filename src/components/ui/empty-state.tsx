import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-12 text-center">
      <span aria-hidden="true" className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--surface-subtle)] text-lg text-[var(--text-secondary)]">{icon}</span>
      <h2 className="mt-5 font-display text-xl font-medium tracking-[-0.025em]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]">{actionLabel}</Link>
      )}
    </div>
  );
}

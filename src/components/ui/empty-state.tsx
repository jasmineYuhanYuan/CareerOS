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
    <div className="rounded-[1.35rem] border border-dashed border-[#cfd2c9] bg-white/55 px-6 py-12 text-center">
      <span aria-hidden="true" className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#dce9df] text-xl text-[#245b45]">{icon}</span>
      <h2 className="mt-5 font-display text-xl font-extrabold tracking-[-0.025em]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68736c]">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#245b45] px-5 text-sm font-bold text-white hover:bg-[#1d4938]">{actionLabel}</Link>
      )}
    </div>
  );
}

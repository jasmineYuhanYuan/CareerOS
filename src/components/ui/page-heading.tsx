interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function PageHeading({ eyebrow, title, description }: PageHeadingProps) {
  return (
    <header className="mb-8 max-w-3xl page-enter">
      {eyebrow && <p className="eyebrow mb-2.5">{eyebrow}</p>}
      <h1 className="font-display text-[1.8rem] font-medium leading-[1.16] tracking-[-0.045em] sm:text-[2.35rem]">{title}</h1>
      <p className="mt-3 max-w-2xl text-[0.95rem] leading-7 text-[var(--text-secondary)] sm:text-base">{description}</p>
    </header>
  );
}

interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function PageHeading({ eyebrow, title, description }: PageHeadingProps) {
  return (
    <header className="mb-7 max-w-3xl page-enter">
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#db633a]">{eyebrow}</p>}
      <h1 className="font-display text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68736c] sm:text-base">{description}</p>
    </header>
  );
}

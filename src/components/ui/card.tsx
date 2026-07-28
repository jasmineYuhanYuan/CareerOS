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
    <section className={`rounded-[1.35rem] border border-[#dedfd7] bg-[#fffef9] p-5 shadow-[0_10px_35px_rgba(36,45,39,0.045)] sm:p-6 ${className}`}>
      {(title || eyebrow || action) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && <p className="mb-1 text-[0.66rem] font-bold uppercase tracking-[0.15em] text-[#869089]">{eyebrow}</p>}
            {title && <h2 className="font-display text-lg font-extrabold tracking-[-0.025em]">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

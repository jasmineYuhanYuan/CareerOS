"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/providers/language-provider";

export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#171915]/45 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby={description ? "dialog-description" : undefined} className="max-h-[94dvh] w-full overflow-y-auto rounded-t-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(20,22,18,0.18)] sm:max-w-2xl sm:rounded-[1.75rem] sm:p-8">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="font-display text-2xl font-medium tracking-[-0.03em]">{title}</h2>
            {description && <p id="dialog-description" className="mt-1.5 text-sm text-[var(--text-secondary)]">{description}</p>}
          </div>
          <button type="button" aria-label={t("common.close")} onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-xl text-xl text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]">×</button>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}

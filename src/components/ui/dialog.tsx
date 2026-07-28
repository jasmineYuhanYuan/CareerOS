"use client";

import { useEffect, type ReactNode } from "react";

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
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#17211b]/45 p-0 sm:place-items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby={description ? "dialog-description" : undefined} className="max-h-[92vh] w-full overflow-y-auto rounded-t-[1.5rem] bg-[#fffef9] p-5 shadow-2xl sm:max-w-2xl sm:rounded-[1.5rem] sm:p-7">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="font-display text-xl font-extrabold">{title}</h2>
            {description && <p id="dialog-description" className="mt-1 text-sm text-[#68736c]">{description}</p>}
          </div>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-xl text-xl text-[#59645e] hover:bg-[#eef0e8]">×</button>
        </header>
        {children}
      </section>
    </div>
  );
}

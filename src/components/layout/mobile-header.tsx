"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileBottomSheet } from "@/components/ui/mobile-bottom-sheet";

const secondaryLinks = [
  { href: "/companies", label: "Companies", description: "Research organisations and clinics" },
  { href: "/roadmap", label: "Roadmap", description: "Plan milestones and next steps" },
  { href: "/settings", label: "Settings", description: "Theme, backup and local data" },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color:var(--background)]/92 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-[-0.045em]">
            Career<span className="text-[var(--accent)]">OS</span>
          </Link>
          <button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-xl px-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]">
            More
          </button>
        </div>
      </header>
      <MobileBottomSheet open={open} title="More from CareerOS" onClose={() => setOpen(false)}>
        <nav aria-label="Secondary mobile navigation">
          <ul className="divide-y divide-[var(--border)]">
            {secondaryLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block min-h-16 py-4">
                  <span className="block font-medium">{item.label}</span>
                  <span className="mt-1 block text-sm text-[var(--text-secondary)]">{item.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </MobileBottomSheet>
    </>
  );
}

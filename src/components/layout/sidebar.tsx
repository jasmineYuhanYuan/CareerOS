"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileSelector } from "@/components/profile/profile-selector";
import { useLanguage } from "@/providers/language-provider";
import { LanguageToggle } from "./language-toggle";
import { getNavigationLabel, navigationItems } from "./navigation";
import { Icon } from "@/components/ui/icon";

const primaryHrefs = ["/", "/jobs", "/opportunities", "/applications", "/postgraduate"];

function NavList({ items, pathname, language }: { items: typeof navigationItems; pathname: string; language: "en" | "zh-CN" }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              {active && <span aria-hidden="true" className="absolute -left-4 h-5 w-0.5 rounded-full bg-[var(--accent)]" />}
              <Icon name={item.icon} className="size-[1.05rem] shrink-0" />
              {getNavigationLabel(item, language)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const primary = navigationItems.filter((item) => primaryHrefs.includes(item.href));
  const secondary = navigationItems.filter((item) => !primaryHrefs.includes(item.href));

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[13rem] flex-col border-r border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-6 lg:flex">
      <Link href="/" className="px-2 font-display text-[1.25rem] font-semibold tracking-[-0.045em]" aria-label="CareerOS home">
        Career<span className="text-[var(--accent)]">OS</span>
      </Link>
      <nav className="mt-10 flex-1" aria-label={language === "zh-CN" ? "主导航" : "Primary navigation"}>
        <NavList items={primary} pathname={pathname} language={language} />
        <div className="my-5 border-t border-[var(--border)]" />
        <NavList items={secondary} pathname={pathname} language={language} />
      </nav>
      <div className="mb-3">
        <LanguageToggle />
      </div>
      <ProfileSelector />
    </aside>
  );
}

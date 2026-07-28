"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/providers/language-provider";
import { getNavigationLabel, navigationItems } from "./navigation";

const primaryItems = navigationItems.filter((item) =>
  ["/", "/jobs", "/applications", "/postgraduate", "/profiles"].includes(item.href),
);

export function MobileNavigation() {
  const pathname = usePathname();
  const { language } = useLanguage();
  return (
    <nav aria-label={language === "zh-CN" ? "移动端导航" : "Mobile navigation"} className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[color:var(--surface)]/96 px-2 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-5">
        {primaryItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-[3.35rem] flex-col items-center justify-center gap-0.5 rounded-xl text-[0.66rem] font-medium ${active ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`}>
                <span aria-hidden="true" className="text-[1.05rem]">{item.icon}</span>
                {getNavigationLabel(item, language, true)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

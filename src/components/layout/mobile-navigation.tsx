"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "./navigation";

const primaryItems = navigationItems.filter((item) =>
  ["/", "/jobs", "/applications", "/postgraduate", "/profiles"].includes(item.href),
);

export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[color:var(--surface)]/96 px-2 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-5">
        {primaryItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-[3.35rem] flex-col items-center justify-center gap-0.5 rounded-xl text-[0.66rem] font-medium ${active ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`}>
                <span aria-hidden="true" className="text-[1.05rem]">{item.icon}</span>
                {item.shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

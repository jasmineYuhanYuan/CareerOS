"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "./navigation";

const primaryItems = navigationItems.filter((item) =>
  ["/", "/jobs", "/applications", "/postgraduate", "/roadmap"].includes(item.href),
);

export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-white/60 bg-[#17211b]/95 px-2 py-1.5 shadow-[0_12px_40px_rgba(23,33,27,0.28)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {primaryItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.62rem] font-bold ${active ? "bg-white/12 text-white" : "text-[#aeb9b2]"}`}>
                <span aria-hidden="true" className={active ? "text-[#f4e8bd]" : ""}>{item.icon}</span>
                {item.shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

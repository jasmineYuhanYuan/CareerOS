"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileSelector } from "@/components/profile/profile-selector";
import { navigationItems } from "./navigation";

function isCurrentPath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#dedfd7] bg-[#f8f7f1]/95 p-5 backdrop-blur lg:flex">
      <Link href="/" className="flex items-center gap-3 px-2 py-2" aria-label="CareerOS home">
        <span className="grid size-9 place-items-center rounded-xl bg-[#245b45] font-display text-lg font-extrabold text-white">C</span>
        <span className="font-display text-xl font-extrabold tracking-[-0.04em]">
          Career<span className="text-[#db633a]">OS</span>
        </span>
      </Link>
      <nav className="mt-9 flex-1" aria-label="Primary navigation">
        <p className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#929a94]">Workspace</p>
        <ul className="mt-3 space-y-1">
          {navigationItems.map((item) => {
            const active = isCurrentPath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-[#245b45] text-white shadow-[0_6px_18px_rgba(36,91,69,0.18)]" : "text-[#59645e] hover:bg-white hover:text-[#17211b]"
                  }`}
                >
                  <span aria-hidden="true" className={`grid size-6 place-items-center text-base ${active ? "text-[#f4e8bd]" : "text-[#88918b]"}`}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <ProfileSelector />
      <p className="mt-4 px-2 text-xs leading-5 text-[#89918c]">Your career, organised.<br />One step at a time.</p>
    </aside>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileBottomSheet } from "@/components/ui/mobile-bottom-sheet";
import { useLanguage } from "@/providers/language-provider";
import { LanguageToggle } from "./language-toggle";

const secondaryLinks = [
  { href: "/opportunities", label: "Opportunities", zhLabel: "机会", description: "Explore jobs, events and professional pathways", zhDescription: "探索职位、活动和职业发展机会" },
  { href: "/companies", label: "Companies", zhLabel: "公司与诊所", description: "Research organisations and clinics", zhDescription: "研究公司、机构与诊所" },
  { href: "/roadmap", label: "Roadmap", zhLabel: "职业规划", description: "Plan milestones and next steps", zhDescription: "规划里程碑和下一步行动" },
  { href: "/contacts", label: "Contacts", zhLabel: "人脉", description: "Manage professional relationships", zhDescription: "管理职业联系人与跟进" },
  { href: "/documents", label: "Documents", zhLabel: "文档", description: "Track résumé and career document versions", zhDescription: "追踪简历与职业文档版本" },
  { href: "/settings", label: "Settings", zhLabel: "设置", description: "Theme, backup and local data", zhDescription: "主题、备份与本地数据" },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color:var(--background)]/92 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-[-0.045em]">
            Career<span className="text-[var(--accent)]">OS</span>
          </Link>
          <div className="flex items-center gap-1">
            <LanguageToggle compact />
            <button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-xl px-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]">
              {language === "zh-CN" ? "更多" : "More"}
            </button>
          </div>
        </div>
      </header>
      <MobileBottomSheet open={open} title={language === "zh-CN" ? "更多 CareerOS 功能" : "More from CareerOS"} onClose={() => setOpen(false)}>
        <nav aria-label={language === "zh-CN" ? "移动端次级导航" : "Secondary mobile navigation"}>
          <ul className="divide-y divide-[var(--border)]">
            {secondaryLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block min-h-16 py-4">
                  <span className="block font-medium">{language === "zh-CN" ? item.zhLabel : item.label}</span>
                  <span className="mt-1 block text-sm text-[var(--text-secondary)]">{language === "zh-CN" ? item.zhDescription : item.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </MobileBottomSheet>
    </>
  );
}

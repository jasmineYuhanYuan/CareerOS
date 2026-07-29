import type { IconName } from "@/components/ui/icon";

export interface NavigationItem {
  label: string;
  href: string;
  shortLabel: string;
  icon: IconName;
}

export const navigationItems: readonly NavigationItem[] = [
  { label: "Home", href: "/", shortLabel: "Home", icon: "home" },
  { label: "Jobs", href: "/jobs", shortLabel: "Jobs", icon: "briefcase" },
  { label: "Opportunities", href: "/opportunities", shortLabel: "Explore", icon: "sparkles" },
  { label: "Intelligence", href: "/intelligence", shortLabel: "Intel", icon: "book" },
  { label: "Knowledge Graph", href: "/knowledge-graph", shortLabel: "Graph", icon: "route" },
  { label: "Gap Analysis", href: "/gap-analysis", shortLabel: "Gaps", icon: "sparkles" },
  { label: "Applications", href: "/applications", shortLabel: "Apply", icon: "clipboard" },
  { label: "Study", href: "/postgraduate", shortLabel: "Study", icon: "book" },
  { label: "Companies", href: "/companies", shortLabel: "Companies", icon: "building" },
  { label: "Roadmap", href: "/roadmap", shortLabel: "Plan", icon: "route" },
  { label: "Contacts", href: "/contacts", shortLabel: "Contacts", icon: "users" },
  { label: "Documents", href: "/documents", shortLabel: "Documents", icon: "document" },
  { label: "Profile", href: "/profiles", shortLabel: "Profile", icon: "user" },
  { label: "Settings", href: "/settings", shortLabel: "Settings", icon: "settings" },
];

const chineseLabels: Record<string, { label: string; shortLabel: string }> = {
  "/": { label: "首页", shortLabel: "首页" },
  "/jobs": { label: "职位", shortLabel: "职位" },
  "/opportunities": { label: "机会", shortLabel: "探索" },
  "/intelligence": { label: "职业知识", shortLabel: "知识" },
  "/knowledge-graph": { label: "知识图谱", shortLabel: "图谱" },
  "/gap-analysis": { label: "差距分析", shortLabel: "差距" },
  "/applications": { label: "申请", shortLabel: "申请" },
  "/postgraduate": { label: "深造", shortLabel: "深造" },
  "/companies": { label: "公司与诊所", shortLabel: "公司" },
  "/roadmap": { label: "职业规划", shortLabel: "规划" },
  "/contacts": { label: "人脉", shortLabel: "人脉" },
  "/documents": { label: "文档", shortLabel: "文档" },
  "/profiles": { label: "个人资料", shortLabel: "资料" },
  "/settings": { label: "设置", shortLabel: "设置" },
};

export function getNavigationLabel(item: NavigationItem, language: "en" | "zh-CN", short = false): string {
  if (language === "en") return short ? item.shortLabel : item.label;
  const translated = chineseLabels[item.href];
  return translated ? (short ? translated.shortLabel : translated.label) : (short ? item.shortLabel : item.label);
}

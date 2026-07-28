export interface NavigationItem {
  label: string;
  href: string;
  shortLabel: string;
  icon: string;
}

export const navigationItems: readonly NavigationItem[] = [
  { label: "Home", href: "/", shortLabel: "Home", icon: "⌂" },
  { label: "Jobs", href: "/jobs", shortLabel: "Jobs", icon: "◇" },
  { label: "Applications", href: "/applications", shortLabel: "Apply", icon: "▤" },
  { label: "Study", href: "/postgraduate", shortLabel: "Study", icon: "□" },
  { label: "Companies", href: "/companies", shortLabel: "Companies", icon: "▦" },
  { label: "Roadmap", href: "/roadmap", shortLabel: "Plan", icon: "↗" },
  { label: "Profile", href: "/profiles", shortLabel: "Profile", icon: "○" },
  { label: "Settings", href: "/settings", shortLabel: "Settings", icon: "···" },
];

const chineseLabels: Record<string, { label: string; shortLabel: string }> = {
  "/": { label: "首页", shortLabel: "首页" },
  "/jobs": { label: "职位", shortLabel: "职位" },
  "/applications": { label: "申请", shortLabel: "申请" },
  "/postgraduate": { label: "深造", shortLabel: "深造" },
  "/companies": { label: "公司与诊所", shortLabel: "公司" },
  "/roadmap": { label: "职业规划", shortLabel: "规划" },
  "/profiles": { label: "个人资料", shortLabel: "资料" },
  "/settings": { label: "设置", shortLabel: "设置" },
};

export function getNavigationLabel(item: NavigationItem, language: "en" | "zh", short = false): string {
  if (language === "en") return short ? item.shortLabel : item.label;
  const translated = chineseLabels[item.href];
  return translated ? (short ? translated.shortLabel : translated.label) : (short ? item.shortLabel : item.label);
}

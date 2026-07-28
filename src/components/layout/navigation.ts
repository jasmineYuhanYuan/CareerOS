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

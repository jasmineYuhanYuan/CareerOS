export interface NavigationItem {
  label: string;
  href: string;
  shortLabel: string;
  icon: string;
}

export const navigationItems: readonly NavigationItem[] = [
  { label: "Overview", href: "/", shortLabel: "Home", icon: "⌂" },
  { label: "Profiles", href: "/profiles", shortLabel: "Profile", icon: "◉" },
  { label: "Jobs", href: "/jobs", shortLabel: "Jobs", icon: "◇" },
  { label: "Companies", href: "/companies", shortLabel: "Companies", icon: "▦" },
  { label: "Applications", href: "/applications", shortLabel: "Apply", icon: "✓" },
  { label: "Postgraduate", href: "/postgraduate", shortLabel: "Study", icon: "◫" },
  { label: "Roadmap", href: "/roadmap", shortLabel: "Plan", icon: "↗" },
  { label: "Settings", href: "/settings", shortLabel: "Settings", icon: "⚙" },
];

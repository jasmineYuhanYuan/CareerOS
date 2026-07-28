import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { ActiveProfileProvider } from "@/components/profile/active-profile-provider";
import "./globals.css";

const bodyFont = DM_Sans({ variable: "--font-body", subsets: ["latin"] });
const displayFont = Manrope({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CareerOS", template: "%s · CareerOS" },
  description:
    "A focused workspace for managing career goals, applications, postgraduate study and next steps.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <ActiveProfileProvider>
          <AppShell>{children}</AppShell>
        </ActiveProfileProvider>
      </body>
    </html>
  );
}

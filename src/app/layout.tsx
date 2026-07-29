import type { Metadata, Viewport } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { CareerOSProvider } from "@/providers/careeros-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { ToastProvider } from "@/providers/toast-provider";
import "./globals.css";

const bodyFont = DM_Sans({ variable: "--font-body", subsets: ["latin"] });
const displayFont = Manrope({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CareerOS", template: "%s · CareerOS" },
  description:
    "A focused workspace for managing career goals, applications, postgraduate study and next steps.",
  applicationName: "CareerOS",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "CareerOS",
    description: "A calm, local-first workspace for career planning.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <CareerOSProvider>
          <LanguageProvider>
            <ToastProvider><AppShell>{children}</AppShell></ToastProvider>
          </LanguageProvider>
        </CareerOSProvider>
      </body>
    </html>
  );
}

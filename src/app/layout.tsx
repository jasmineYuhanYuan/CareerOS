import type { Metadata, Viewport } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { CareerOSProvider } from "@/providers/careeros-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

const bodyFont = DM_Sans({ variable: "--font-body", subsets: ["latin"] });
const displayFont = Manrope({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CareerOS — AI-powered Career Intelligence Platform", template: "%s · CareerOS" },
  description:
    "An AI-powered career intelligence platform connecting verified employers and jobs with candidate evidence, explainable matching, and application CRM.",
  applicationName: "CareerOS",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "CareerOS — AI-powered Career Intelligence Platform",
    description: "Verified employer and job intelligence, candidate evidence, explainable matching, and application CRM.",
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
        <AuthProvider>
          <CareerOSProvider>
            <LanguageProvider>
              <ToastProvider><AppShell>{children}</AppShell></ToastProvider>
            </LanguageProvider>
          </CareerOSProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

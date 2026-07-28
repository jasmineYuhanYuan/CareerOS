import type { ReactNode } from "react";
import { MobileHeader } from "./mobile-header";
import { MobileNavigation } from "./mobile-navigation";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileHeader />
      <main className="pb-24 lg:ml-[13.5rem] lg:pb-0">
        <div className="mx-auto min-h-screen w-full max-w-[1280px] px-4 py-7 sm:px-8 lg:px-12 lg:py-12">{children}</div>
      </main>
      <MobileNavigation />
    </div>
  );
}

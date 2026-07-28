import type { ReactNode } from "react";
import { MobileHeader } from "./mobile-header";
import { MobileNavigation } from "./mobile-navigation";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileHeader />
      <main className="pb-24 lg:ml-64 lg:pb-0">
        <div className="mx-auto min-h-screen w-full max-w-[1500px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">{children}</div>
      </main>
      <MobileNavigation />
    </div>
  );
}

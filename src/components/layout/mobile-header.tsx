import Link from "next/link";
import { ProfileSelector } from "@/components/profile/profile-selector";

export function MobileHeader() {
  return (
    <header className="border-b border-[#dedfd7] bg-[#f8f7f1]/90 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <Link href="/" className="font-display text-lg font-extrabold tracking-[-0.04em]">
          Career<span className="text-[#db633a]">OS</span>
        </Link>
        <div className="w-[12.5rem] max-w-[66vw]"><ProfileSelector /></div>
      </div>
    </header>
  );
}

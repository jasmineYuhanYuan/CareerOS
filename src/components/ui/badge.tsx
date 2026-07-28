import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "orange" | "blue" }) {
  const styles = {
    neutral: "bg-[#eef0e8] text-[#59645e]",
    green: "bg-[#dce9df] text-[#245b45]",
    orange: "bg-[#f8ded2] text-[#9b4426]",
    blue: "bg-[#e1e5f2] text-[#435174]",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[tone]}`}>{children}</span>;
}

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

const styles = {
  primary: "bg-[#245b45] text-white hover:bg-[#1d4938]",
  secondary: "border border-[#ced1c8] bg-white text-[#245b45] hover:bg-[#f4f5ef]",
  danger: "bg-[#9b4426] text-white hover:bg-[#7f351d]",
  ghost: "text-[#59645e] hover:bg-[#eef0e8]",
} as const;

export function Button({ children, className = "", variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${size === "sm" ? "min-h-9 px-3 text-xs" : "min-h-11 px-4 text-sm"} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

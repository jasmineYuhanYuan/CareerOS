import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

const styles = {
  primary: "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]",
  secondary: "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-subtle)]",
  danger: "bg-[var(--danger)] text-white hover:opacity-90",
  ghost: "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]",
} as const;

export function Button({ children, className = "", variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${size === "sm" ? "min-h-10 px-3.5 text-[0.82rem]" : "min-h-11 px-4.5 text-sm"} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

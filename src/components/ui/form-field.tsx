import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[var(--text-primary)]">
      {label}
      {children}
      {hint && <span className="mt-1.5 block text-[0.8rem] font-normal text-[var(--text-secondary)]">{hint}</span>}
      {error && <span role="alert" className="mt-1.5 block text-[0.8rem] font-medium text-[var(--danger)]">{error}</span>}
    </label>
  );
}

const controlClass = "mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:bg-[var(--surface)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlClass} min-h-24 resize-y ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

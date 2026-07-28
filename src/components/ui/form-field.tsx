import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-bold text-[#344039]">
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-[#68736c]">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs font-semibold text-[#9b4426]">{error}</span>}
    </label>
  );
}

const controlClass = "mt-2 min-h-11 w-full rounded-xl border border-[#cfd2c9] bg-white px-3 py-2 text-sm text-[#17211b] placeholder:text-[#9ba29d] focus:border-[#245b45]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlClass} min-h-24 resize-y ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

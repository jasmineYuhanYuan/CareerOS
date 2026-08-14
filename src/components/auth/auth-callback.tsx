"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthCallback() {
  const router = useRouter(); const params = useSearchParams(); const [error, setError] = useState("");
  useEffect(() => {
    const client = createSupabaseBrowserClient(); const code = params.get("code");
    if (!client) { queueMicrotask(() => setError("Supabase Auth is not configured.")); return; }
    void (code ? client.auth.exchangeCodeForSession(code) : client.auth.getSession()).then(({ error }) => {
      if (error) setError(error.message); else router.replace("/documents");
    });
  }, [params, router]);
  return <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6" aria-live="polite">{error ? <p role="alert" className="text-[var(--danger)]">{error}</p> : <p>Completing secure sign-in…</p>}</div>;
}

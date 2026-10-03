"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-field";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";

export function AuthForm() {
  const { signIn, signUp, isAuthenticated, user } = useAuth();
  const { language } = useLanguage(); const zh = language === "zh-CN";
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (mode === "signin") { await signIn(email, password); router.push("/documents"); }
      else {
        const result = await signUp(email, password, displayName);
        if (result.confirmationRequired) setMessage(zh ? "请检查邮箱并确认注册，然后返回 CareerOS 登录。" : "Check your email to confirm registration, then return to CareerOS to sign in.");
        else router.push("/documents");
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : (zh ? "认证失败。" : "Authentication failed.")); }
    finally { setBusy(false); }
  }

  if (isAuthenticated) return <Card eyebrow={zh ? "真实认证状态" : "Verified auth state"} title={zh ? "已登录" : "Signed in"}><p className="text-sm text-[var(--text-secondary)]">{user?.email}</p><Button className="mt-4" onClick={() => router.push("/documents")}>{zh ? "打开私人文档" : "Open private documents"}</Button></Card>;
  return <Card eyebrow="Supabase Auth" title={mode === "signin" ? (zh ? "登录 CareerOS" : "Sign in to CareerOS") : (zh ? "创建账户" : "Create account")}>
    <div className="mb-5 flex gap-2"><Button type="button" variant={mode === "signin" ? "primary" : "secondary"} onClick={() => setMode("signin")}>{zh ? "登录" : "Sign in"}</Button><Button type="button" variant={mode === "signup" ? "primary" : "secondary"} onClick={() => setMode("signup")}>{zh ? "注册" : "Sign up"}</Button></div>
    <form className="space-y-4" onSubmit={submit}>
      {mode === "signup" ? <Field label={zh ? "姓名" : "Display name"}><Input required autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></Field> : null}
      <Field label={zh ? "电子邮箱" : "Email address"}><Input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
      <Field label={zh ? "密码" : "Password"} hint={zh ? "至少 8 个字符" : "At least 8 characters"}><Input required minLength={8} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
      <div aria-live="polite">{message ? <p className="rounded-xl bg-[var(--success-soft)] p-3 text-sm text-[var(--success)]">{message}</p> : null}{error ? <p role="alert" className="rounded-xl bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</p> : null}</div>
      <Button className="w-full" disabled={busy} type="submit">{busy ? (zh ? "处理中…" : "Working…") : mode === "signin" ? (zh ? "登录" : "Sign in") : (zh ? "创建账户" : "Create account")}</Button>
    </form>
  </Card>;
}

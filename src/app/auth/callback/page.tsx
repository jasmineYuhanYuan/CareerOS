import { Suspense } from "react";
import { AuthCallback } from "@/components/auth/auth-callback";

export default function AuthCallbackPage() { return <Suspense fallback={<p>Completing secure sign-in…</p>}><AuthCallback /></Suspense>; }

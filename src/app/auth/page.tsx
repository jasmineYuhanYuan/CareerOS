import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };
export default function AuthPage() { return <div className="mx-auto max-w-lg"><AuthForm /></div>; }

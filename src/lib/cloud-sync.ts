"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { CareerOSState } from "@/types/domain";

const REVISION_KEY = "careeros:cloud-revision";

async function accessToken(): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Cloud sync is not configured.");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error("Sign in before syncing.");
  return data.session.access_token;
}

export async function requestMagicLink(email: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Cloud sync is not configured.");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/settings` },
  });
  if (error) throw error;
}

export async function cloudSessionEmail(): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.email ?? null;
}

export async function signOutCloudSync(): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.localStorage.removeItem(REVISION_KEY);
}

export async function pushCloudState(state: CareerOSState): Promise<number> {
  const token = await accessToken();
  const revision = Number(window.localStorage.getItem(REVISION_KEY) ?? "0");
  const response = await fetch("/api/sync/state", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ state, revision }),
  });
  const result: unknown = await response.json();
  if (!response.ok || typeof result !== "object" || result === null) {
    throw new Error("Cloud upload failed.");
  }
  const record = result as Record<string, unknown>;
  if (response.status === 409) throw new Error("A newer cloud copy exists. Download it before uploading.");
  const snapshot = record.snapshot as Record<string, unknown> | undefined;
  const nextRevision = Number(snapshot?.revision);
  if (!Number.isFinite(nextRevision)) throw new Error(String(record.error ?? "Cloud upload failed."));
  window.localStorage.setItem(REVISION_KEY, String(nextRevision));
  return nextRevision;
}

export async function pullCloudState(): Promise<{ state: CareerOSState; revision: number } | null> {
  const token = await accessToken();
  const response = await fetch("/api/sync/state", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result: unknown = await response.json();
  if (!response.ok || typeof result !== "object" || result === null) {
    throw new Error("Cloud download failed.");
  }
  const snapshot = (result as Record<string, unknown>).snapshot;
  if (snapshot === null) return null;
  if (typeof snapshot !== "object") throw new Error("Cloud snapshot is invalid.");
  const record = snapshot as Record<string, unknown>;
  const revision = Number(record.revision);
  if (!Number.isFinite(revision)) throw new Error("Cloud revision is invalid.");
  window.localStorage.setItem(REVISION_KEY, String(revision));
  return { state: record.state as CareerOSState, revision };
}

"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { CareerOSState } from "@/types/domain";
import { mergeCareerOSStates, statesEqual } from "@/lib/sync-engine";

const REVISION_KEY = "careeros:cloud-revision";

async function authenticatedSession(): Promise<{ accessToken: string; userId: string }> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Cloud sync is not configured.");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error("Sign in before syncing.");
  return { accessToken: data.session.access_token, userId: data.session.user.id };
}

const revisionKey = (userId: string) => `${REVISION_KEY}:${userId}`;

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
  const { data } = await supabase.auth.getSession();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  if (data.session?.user.id) window.localStorage.removeItem(revisionKey(data.session.user.id));
}

export interface CloudSnapshot { state: CareerOSState; revision: number; updatedAt: string; }

async function saveCloudState(state: CareerOSState, revision: number): Promise<CloudSnapshot> {
  const { accessToken, userId } = await authenticatedSession();
  const response = await fetch("/api/sync/state", {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({ state, revision }),
  });
  const result: unknown = await response.json();
  if (response.status === 409) throw new Error("SYNC_CONFLICT");
  if (!response.ok || typeof result !== "object" || result === null) throw new Error("Cloud upload failed.");
  const record = result as Record<string, unknown>;
  const snapshot = record.snapshot as Record<string, unknown> | undefined;
  const nextRevision = Number(snapshot?.revision);
  if (!Number.isFinite(nextRevision)) throw new Error(String(record.error ?? "Cloud upload failed."));
  window.localStorage.setItem(revisionKey(userId), String(nextRevision));
  return { state, revision: nextRevision, updatedAt: String(snapshot?.updated_at ?? new Date().toISOString()) };
}

export async function pushCloudState(state: CareerOSState): Promise<number> {
  const { userId } = await authenticatedSession();
  const revision = Number(window.localStorage.getItem(revisionKey(userId)) ?? "0");
  return (await saveCloudState(state, revision)).revision;
}

export async function pullCloudState(): Promise<CloudSnapshot | null> {
  const { accessToken, userId } = await authenticatedSession();
  const response = await fetch("/api/sync/state", {
    headers: { Authorization: `Bearer ${accessToken}` },
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
  window.localStorage.setItem(revisionKey(userId), String(revision));
  return { state: record.state as CareerOSState, revision, updatedAt: String(record.updated_at ?? "") };
}

export async function synchroniseCloudState(local: CareerOSState, localUpdatedAt: string, hasLocalData: boolean): Promise<CloudSnapshot> {
  const remote = await pullCloudState();
  if (!remote) return saveCloudState(local, 0);
  const merged = hasLocalData ? mergeCareerOSStates(local, remote.state, localUpdatedAt, remote.updatedAt) : remote.state;
  if (statesEqual(merged, remote.state)) return { ...remote, state: merged };
  try {
    return await saveCloudState(merged, remote.revision);
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "SYNC_CONFLICT") throw error;
    const latest = await pullCloudState();
    if (!latest) return saveCloudState(merged, 0);
    const reconciled = mergeCareerOSStates(merged, latest.state, localUpdatedAt, latest.updatedAt);
    return saveCloudState(reconciled, latest.revision);
  }
}

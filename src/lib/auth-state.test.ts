import { describe, expect, it } from "vitest";
import type { Session } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { authStateReducer, initialAuthState } from "@/lib/auth-state";
import { ensureCandidateProfile, mappedWorkspaceProfileId } from "@/lib/candidate-profile";
import { getDocumentAccessToken } from "@/lib/document-api";

const session = { access_token: "verified-bearer-token", user: { id: "auth-user-id" } } as Session;

describe("Supabase Auth session foundation", () => {
  it("starts in loading state until getSession restores", () => {
    expect(initialAuthState).toEqual({ session: null, isLoading: true });
  });

  it("restores an existing session and supports auth-state login changes", () => {
    expect(authStateReducer(initialAuthState, { type: "RESTORED", session })).toEqual({ session, isLoading: false });
    expect(authStateReducer({ session: null, isLoading: false }, { type: "CHANGED", session })).toEqual({ session, isLoading: false });
  });

  it("clears auth state on logout without touching workspace state", () => {
    const workspace = { activeProfileId: "yuhan-yuan" };
    expect(authStateReducer({ session, isLoading: false }, { type: "SIGNED_OUT" })).toEqual({ session: null, isLoading: false });
    expect(workspace.activeProfileId).toBe("yuhan-yuan");
  });

  it("does not equate a legacy workspace with an unbound auth candidate", () => {
    expect(mappedWorkspaceProfileId({ id: "candidate", ownerUserId: "auth-user-id", legacyProfileKey: null, displayName: "" }, ["yuhan-yuan", "taicheng-guo-tommy"])).toBeNull();
  });

  it("only maps an explicitly stored legacy profile key", () => {
    expect(mappedWorkspaceProfileId({ id: "candidate", ownerUserId: "auth-user-id", legacyProfileKey: "yuhan-yuan", displayName: "Yuhan Yuan" }, ["yuhan-yuan"])).toBe("yuhan-yuan");
  });

  it("creates an unbound candidate profile for a first-time auth user", async () => {
    let inserted: Record<string, unknown> | null = null;
    const selectBuilder = { eq: () => selectBuilder, order: () => selectBuilder, limit: () => selectBuilder, maybeSingle: async () => ({ data: null, error: null }) };
    const insertBuilder = { select: () => insertBuilder, single: async () => ({ data: { id: "candidate-id", owner_user_id: "auth-user-id", legacy_profile_key: null, display_name: "New Candidate" }, error: null }) };
    const client = { from: () => ({ select: () => selectBuilder, insert: (value: Record<string, unknown>) => { inserted = value; return insertBuilder; } }) } as unknown as SupabaseClient;
    const user = { id: "auth-user-id", user_metadata: { display_name: "New Candidate" } } as unknown as User;
    await expect(ensureCandidateProfile(client, user)).resolves.toMatchObject({ id: "candidate-id", ownerUserId: "auth-user-id", legacyProfileKey: null });
    expect(inserted).toEqual({ owner_user_id: "auth-user-id", legacy_profile_key: null, display_name: "New Candidate" });
  });

  it("requires authentication before Documents upload", async () => {
    await expect(getDocumentAccessToken({ auth: { getSession: async () => ({ data: { session: null } }) } })).rejects.toThrow("Sign in before managing private documents.");
  });

  it("provides the bearer access token to authenticated Documents requests", async () => {
    await expect(getDocumentAccessToken({ auth: { getSession: async () => ({ data: { session: { access_token: "verified-bearer-token" } } }) } })).resolves.toBe("verified-bearer-token");
  });
});

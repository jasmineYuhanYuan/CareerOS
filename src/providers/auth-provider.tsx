"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { ensureCandidateProfile, type AuthCandidateProfile } from "@/lib/candidate-profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { authStateReducer, initialAuthState } from "@/lib/auth-state";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  candidateProfile: AuthCandidateProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ confirmationRequired: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ session, isLoading }, dispatch] = useReducer(authStateReducer, initialAuthState);
  const [candidateProfile, setCandidateProfile] = useState<AuthCandidateProfile | null>(null);
  const [error, setError] = useState("");
  const candidateRequest = useRef<{ userId: string; promise: Promise<AuthCandidateProfile> } | null>(null);

  const loadCandidate = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) { setCandidateProfile(null); return; }
    const client = createSupabaseBrowserClient();
    if (!client) { setError("Supabase Auth is not configured."); return; }
    try {
      if (candidateRequest.current?.userId !== nextSession.user.id) candidateRequest.current = { userId: nextSession.user.id, promise: ensureCandidateProfile(client, nextSession.user) };
      setCandidateProfile(await candidateRequest.current.promise);
    }
    catch (reason) { candidateRequest.current = null; setCandidateProfile(null); setError(reason instanceof Error ? reason.message : "Candidate profile could not be loaded."); }
  }, []);

  useEffect(() => {
    const client = createSupabaseBrowserClient();
    if (!client) { queueMicrotask(() => { setError("Supabase Auth is not configured."); dispatch({ type: "RESTORED", session: null }); }); return; }
    let mounted = true;
    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setError(sessionError.message);
      dispatch({ type: "RESTORED", session: data.session });
      void loadCandidate(data.session);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      dispatch({ type: "CHANGED", session: nextSession });
      setError("");
      queueMicrotask(() => { if (mounted) void loadCandidate(nextSession); });
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [loadCandidate]);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = createSupabaseBrowserClient();
    if (!client) throw new Error("Supabase Auth is not configured.");
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const client = createSupabaseBrowserClient();
    if (!client) throw new Error("Supabase Auth is not configured.");
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    return { confirmationRequired: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    const client = createSupabaseBrowserClient();
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
    candidateRequest.current = null; dispatch({ type: "SIGNED_OUT" }); setCandidateProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null, session, candidateProfile,
    isAuthenticated: Boolean(session?.user), isLoading, error, signIn, signUp, signOut,
  }), [candidateProfile, error, isLoading, session, signIn, signOut, signUp]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
